#!/usr/bin/env node
/**
 * tools/build.mjs — build único do formato final (a partir de 2026-11-03).
 *
 *   node south-academy/tools/build.mjs south-academy/ep08 [script/ep08.json]
 *
 * Formato final (pedido do Fabio): um único vídeo por episódio, com a voz clonada, sem legendas
 * renderizadas, sem a janela reservada ao narrador (a "caixa" do canto), sem versões sem-voz/guia.
 * A foto do Fabio aparece só no cartão inicial (vinheta), no gancho e no cartão final.
 *
 * 1. Lê script/<ep>.json e mede a duração de cada beat em media/vo/<ep>/ (.opus da HeyGen ou .wav).
 * 2. Calcula o timing (pausas, gaps, lead-in/tail por cena) → script/<ep>.timing.json.
 * 3. Mixa a narração em um único WAV (media/vo/<ep>-narration.wav).
 * 4. Gera index.html e compositions/*.html a partir de <ep>/scripts/scenes.mjs.
 *
 * O scenes.mjs de cada episódio não muda: este build troca o fundo das cenas de tela cheia por um
 * fundo escuro próprio e injeta a foto nas cenas gancho, vinheta e final (ver OVERLAYS).
 */
import { execFileSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(process.argv[2] ?? "");
if (!process.argv[2] || !existsSync(join(ROOT, "scripts", "scenes.mjs"))) {
  console.error("uso: node south-academy/tools/build.mjs <pasta-do-episodio> [script/epNN.json]");
  process.exit(1);
}
// roteiro: o argumento, ou script/<nome-da-pasta>.json (ex.: ep08/script/ep08.json)
const byName = join("script", `${basename(ROOT)}.json`);
const scriptArg = process.argv[3] ?? byName;
if (!existsSync(resolve(ROOT, scriptArg))) {
  console.error(`não achei ${scriptArg}; passe o caminho do roteiro como segundo argumento`);
  process.exit(1);
}
const scriptPath = resolve(ROOT, scriptArg);
const script = JSON.parse(readFileSync(scriptPath, "utf8"));
const EP = script.episode.toLowerCase();
const VO_DIR = join(ROOT, "media", "vo", EP);
const T = script.timing;
const { SCENES, SHARED_CSS } = await import(
  pathToFileURL(join(ROOT, "scripts", "scenes.mjs")).href
);

// ---------------------------------------------------------------- WAV utils
function readWav(path) {
  const buf = readFileSync(path);
  if (buf.toString("ascii", 0, 4) !== "RIFF") throw new Error(`not a WAV: ${path}`);
  let off = 12;
  let fmt = null;
  let data = null;
  while (off + 8 <= buf.length) {
    const id = buf.toString("ascii", off, off + 4);
    const size = buf.readUInt32LE(off + 4);
    const body = off + 8;
    if (id === "fmt ") {
      fmt = {
        format: buf.readUInt16LE(body),
        channels: buf.readUInt16LE(body + 2),
        rate: buf.readUInt32LE(body + 4),
        bits: buf.readUInt16LE(body + 14),
      };
    } else if (id === "data") {
      data = buf.subarray(body, body + size);
    }
    off = body + size + (size % 2);
  }
  if (!fmt || !data) throw new Error(`WAV sem fmt/data: ${path}`);
  if (fmt.format !== 1 || fmt.bits !== 16) throw new Error(`esperado PCM16: ${path}`);
  const n = data.length / 2 / fmt.channels;
  const mono = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    let s = 0;
    for (let c = 0; c < fmt.channels; c++) s += data.readInt16LE((i * fmt.channels + c) * 2);
    mono[i] = s / fmt.channels / 32768;
  }
  return { rate: fmt.rate, samples: mono };
}

function writeWav(path, samples, rate) {
  const n = samples.length;
  const buf = Buffer.alloc(44 + n * 2);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + n * 2, 4);
  buf.write("WAVE", 8);
  buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(rate, 24);
  buf.writeUInt32LE(rate * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) {
    const v = Math.max(-1, Math.min(1, samples[i]));
    buf.writeInt16LE(Math.round(v * 32767), 44 + i * 2);
  }
  writeFileSync(path, buf);
}

/** Beat da HeyGen (.opus, vai para o git) tem prioridade; .wav é a narração provisória da Kokoro. */
function loadBeat(id) {
  const opus = join(VO_DIR, `${id}.opus`);
  if (existsSync(opus)) {
    const dir = join(VO_DIR, ".wav");
    mkdirSync(dir, { recursive: true });
    const wav = join(dir, `${id}.wav`);
    if (!existsSync(wav) || statSync(wav).mtimeMs < statSync(opus).mtimeMs)
      execFileSync("ffmpeg", [
        "-nostdin",
        "-y",
        "-loglevel",
        "error",
        "-i",
        opus,
        "-ac",
        "1",
        "-c:a",
        "pcm_s16le",
        wav,
      ]);
    return readWav(wav);
  }
  const wav = join(VO_DIR, `${id}.wav`);
  return existsSync(wav) ? readWav(wav) : null;
}

const r2 = (x) => Math.round(x * 100) / 100;

// ---------------------------------------------------------------- timing
const wavs = {};
let t = 0;
const missing = [];
for (const scene of script.scenes) {
  scene.start = r2(t);
  if (scene.beats) {
    t += T.sceneLeadIn;
    for (const beat of scene.beats) {
      let dur = 2.0;
      const w = loadBeat(beat.id);
      if (w) {
        wavs[beat.id] = w;
        dur = w.samples.length / w.rate;
      } else {
        missing.push(beat.id);
      }
      beat.t = r2(t);
      beat.dur = r2(dur);
      beat.end = r2(t + dur);
      // folga humana: fração da fala após cada beat (maior nos beats lentos)
      const slack = dur * (T.beatSlack ?? 0) * (beat.slow ? 1.5 : 1);
      t = beat.end + slack + (beat.pause ?? 0) + T.lineGap;
    }
    t = t - T.lineGap + T.sceneTail;
  } else {
    t += scene.hold;
  }
  scene.end = r2(t);
  scene.dur = r2(scene.end - scene.start);
  t = scene.end;
  // cues (tempo local da cena) + beats locais
  scene.cues = {};
  scene.local = [];
  for (const b of scene.beats ?? []) {
    const lt = r2(b.t - scene.start);
    const le = r2(b.end - scene.start);
    scene.local.push({ id: b.id, t: lt, end: le, dur: b.dur, cue: b.cue ?? null });
    if (b.cue) scene.cues[b.cue] = lt;
  }
}
const TOTAL = r2(t);
if (missing.length)
  console.warn(
    `aviso: ${missing.length} beats sem áudio (duração assumida 2 s): ${missing.join(", ")}`,
  );
const rates = new Set(Object.values(wavs).map((w) => w.rate));
if (rates.size > 1)
  throw new Error(
    `beats com taxas de amostragem diferentes (${[...rates].join(", ")}): gere todos com a mesma voz`,
  );

writeFileSync(
  join(ROOT, "script", `${EP}.timing.json`),
  JSON.stringify(
    {
      total: TOTAL,
      scenes: script.scenes.map((s) => ({
        id: s.id,
        start: s.start,
        end: s.end,
        dur: s.dur,
        cues: s.cues,
        beats: s.local,
      })),
    },
    null,
    2,
  ),
);

// ---------------------------------------------------------------- narration mixdown
{
  const rate = Object.values(wavs)[0]?.rate ?? 24000;
  const out = new Float32Array(Math.ceil((TOTAL + 1) * rate));
  for (const scene of script.scenes) {
    for (const b of scene.beats ?? []) {
      const w = wavs[b.id];
      if (!w) continue;
      const o = Math.round(b.t * rate);
      for (let i = 0; i < w.samples.length && o + i < out.length; i++) out[o + i] += w.samples[i];
    }
  }
  writeWav(join(ROOT, "media", "vo", `${EP}-narration.wav`), out, rate);
}

// ---------------------------------------------------------------- foto do Fabio
mkdirSync(join(ROOT, "assets"), { recursive: true });
copyFileSync(join(HERE, "..", "brand", "fabio.webp"), join(ROOT, "assets", "fabio.webp"));

// Fundo escuro das cenas de tela cheia (antes vinha da janela do narrador, que não existe mais).
// Em cenas que não abrem o vídeo o fundo entra em 0,25 s para não dar corte seco.
const DARK_BG = (start) => ({
  html: `<div id="fx-bg"></div>`,
  css: `#root #fx-bg { position: absolute; inset: 0; background: #1A1A1A; }`,
  js:
    start > 0
      ? `tl.fromTo("#fx-bg", { opacity: 0 }, { opacity: 1, duration: 0.25, ease: "power2.out", immediateRender: false }, 0);`
      : "",
});

const PHOTO_HTML = `<div id="fx-photo"><img src="assets/fabio.webp" alt="Fabio Pinheiro"><div class="fx-tag"><b>Fabio Pinheiro</b><span>South System</span></div></div>`;
const PHOTO_CSS = `
  #root #fx-photo { position: absolute; border-radius: 28px; overflow: hidden; box-shadow: 0 40px 90px -40px rgba(0,0,0,.75); background: #1A1A1A; }
  #root #fx-photo img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
  #root #fx-photo .fx-tag { position: absolute; left: 0; right: 0; bottom: 0; padding: 56px 32px 26px; background: linear-gradient(0deg, rgba(26,26,26,.9), rgba(26,26,26,0)); color: #fff; display: flex; flex-direction: column; gap: 4px; }
  #root #fx-photo .fx-tag b { font-size: 34px; font-weight: 800; letter-spacing: -0.02em; }
  #root #fx-photo .fx-tag span { font-size: 19px; letter-spacing: .14em; text-transform: uppercase; color: #FF9A66; font-weight: 700; }
`;

// Sobreposições por cena (ids fixos em todos os episódios). Cada uma devolve { html, css, js }.
const OVERLAYS = {
  // gancho: foto à esquerda; os gráficos ficam na coluna x >= 1210
  gancho: ({ dur }) => ({
    html: PHOTO_HTML,
    css: `${PHOTO_CSS}
  #root #fx-photo { left: 150px; top: 120px; width: 840px; height: 840px; }`,
    js: `hide("#fx-photo");
    tl.set("#fx-photo", { opacity: 1 }, 0);
    tl.fromTo("#fx-photo", { x: -140, opacity: 0.35 }, { x: 0, opacity: 1, duration: 0.34, ease: "power4.out", immediateRender: false }, 0);
    exitCurve(tl, "#fx-photo", ${r2(dur - 0.3)});`,
  }),
  // vinheta e cartão final: o fundo da capa do deck tem um painel escuro à direita (x >= 1346); a foto entra nele
  vinheta: ({ dur }) => ({
    front: true,
    html: PHOTO_HTML,
    css: `${PHOTO_CSS}
  #root #fx-photo { left: 1386px; top: 180px; width: 494px; height: 720px; }
  #root #v-group { width: 1120px; }
  #root #v-ep { flex-wrap: wrap; }`,
    js: `hide("#fx-photo");
    tl.set("#fx-photo", { opacity: 1 }, 0.7);
    enterCurve(tl, "#fx-photo", 0.7);
    exitPush(tl, "#fx-photo", ${r2(dur - 0.22)}, 18, 1.2);`,
  }),
  final: ({ dur }) => ({
    front: true,
    html: PHOTO_HTML,
    css: `${PHOTO_CSS}
  #root #fx-photo { left: 1386px; top: 180px; width: 494px; height: 720px; }
  #root #f-group { width: 1120px; }`,
    js: `hide("#fx-photo");
    tl.set("#fx-photo", { opacity: 1 }, 0);
    tl.fromTo("#fx-photo", { y: 230, opacity: 0.35 }, { y: 0, opacity: 1, duration: 0.34, ease: "power4.out", immediateRender: false }, 0);
    tl.to("#fx-photo", { opacity: 0, duration: 0.6, ease: "power2.in" }, ${r2(dur - 0.65)});`,
  }),
  // decisão: a coluna de gráficos (x >= 1210, largura 650) passa para o centro da tela
  decisao: () => ({
    html: "",
    css: `#root .stage { transform: translateX(-575px); }`,
    js: "",
    // o deslocamento deixa 575 px vazios à esquerda do palco: o check de layout só precisa saber que é de propósito
    patch: (h) => h.replace('<div class="stage"', '<div class="stage" data-layout-allow-overflow'),
  }),
};

/** Aplica o fundo escuro (cenas "narrator") e a sobreposição da cena no HTML gerado pelo scenes.mjs. */
function applyOverlay(scene, html) {
  const parts = [];
  if (scene.kind === "narrator") parts.push(DARK_BG(scene.start));
  if (OVERLAYS[scene.id]) parts.push(OVERLAYS[scene.id](scene));
  else if (scene.kind === "narrator")
    console.warn(
      `aviso: cena de tela cheia "${scene.id}" só recebeu o fundo escuro (sem sobreposição)`,
    );
  if (!parts.length) return html;
  const rootOpen = html.match(/<div id="root"[^>]*>/);
  const styleEnd = html.lastIndexOf("</style>");
  const marker = `window.__timelines["${scene.id}"] = tl;`;
  if (!rootOpen || styleEnd < 0 || !html.includes(marker))
    throw new Error(
      `cena ${scene.id}: não achei <div id="root">, </style> ou o registro da timeline`,
    );
  // fundo escuro e fotos de cenas sem fundo próprio entram antes do conteúdo; fotos sobre fundo opaco (front) entram depois
  const back = parts
    .filter((p) => !p.front)
    .map((p) => p.html)
    .join("\n");
  const front = parts
    .filter((p) => p.front)
    .map((p) => p.html)
    .join("\n");
  let out = html.replace(rootOpen[0], `${rootOpen[0]}\n${back}`);
  if (front) {
    const scriptAt = out.indexOf("<script>");
    const rootClose = out.lastIndexOf("</div>", scriptAt);
    out = out.slice(0, rootClose) + `${front}\n` + out.slice(rootClose);
  }
  const end2 = out.lastIndexOf("</style>");
  out = out.slice(0, end2) + `${parts.map((p) => p.css).join("\n")}\n` + out.slice(end2);
  const js = parts
    .map((p) => p.js)
    .filter(Boolean)
    .join("\n    ");
  out = out.replace(marker, `${js}\n    ${marker}`);
  for (const part of parts) if (part.patch) out = part.patch(out);
  return out;
}

// ---------------------------------------------------------------- compositions
const compDir = join(ROOT, "compositions");
mkdirSync(compDir, { recursive: true });
// o formato final não tem janela do narrador nem legendas: remove restos de builds antigos
for (const old of ["narrator.html", "captions.html"]) rmSync(join(compDir, old), { force: true });

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const capHtml = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");

function wrapSub(id, body) {
  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <title>${id}</title>
  </head>
  <body>
    <template>
${body}
    </template>
  </body>
</html>
`;
}

const ctxBase = { ep: script, EP, esc, capHtml, SHARED_CSS, T };

for (const scene of script.scenes) {
  const fn = SCENES[scene.id];
  if (!fn) throw new Error(`sem template para a cena ${scene.id}`);
  const html = fn({ ...ctxBase, scene, cues: scene.cues, dur: scene.dur, beats: scene.local });
  writeFileSync(join(compDir, `${scene.id}.html`), wrapSub(scene.id, applyOverlay(scene, html)));
}

// ---------------------------------------------------------------- host index.html
{
  // Empilhamento = ordem no DOM (o render não lê data-track-index): slides < cenas de tela cheia < vinheta e cartão final
  const slotOf = (scene, tr) =>
    `      <div id="el-${scene.id}" data-composition-id="${scene.id}" data-composition-src="compositions/${scene.id}.html" data-start="${scene.start}" data-duration="${scene.dur}" data-track-index="${tr}" data-width="1920" data-height="1080"></div>`;
  const slides = script.scenes.filter((s) => s.kind === "slide").map((s) => slotOf(s, 1));
  const fullScenes = script.scenes.filter((s) => s.kind === "narrator").map((s) => slotOf(s, 3));
  const fullCards = script.scenes
    .filter((s) => s.kind === "sting" || s.kind === "card")
    .map((s) => slotOf(s, 4));
  // SFX
  const sfx = [];
  const SFX_DUR = {
    "sfx-whoosh.mp3": 5.54,
    "sfx-impact.mp3": 2.12,
    "sfx-pop.mp3": 0.72,
    "sfx-click.mp3": 0.37,
  };
  const addSfx = (id, file, at, vol, track = 11) =>
    sfx.push(
      `      <audio id="${id}" src="assets/${file}" data-start="${r2(at)}" data-duration="${SFX_DUR[file]}" data-track-index="${track}" data-volume="${vol}"></audio>`,
    );
  const vinheta = script.scenes.find((s) => s.id === "vinheta");
  if (vinheta) {
    addSfx("sfx-whoosh", "sfx-whoosh.mp3", vinheta.start - 0.15, 0.5, 11);
    addSfx("sfx-impact", "sfx-impact.mp3", vinheta.start + 0.55, 0.45, 12);
  }
  let k = 0;
  for (const scene of script.scenes) {
    for (const b of scene.local ?? []) {
      const c = b.cue ?? "";
      if (/^(r[1-4]|d[1-5]|c[1-3]|v[1-3]|p[1-3])$/.test(c))
        addSfx(`sfx-pop-${k++}`, "sfx-pop.mp3", scene.start + b.t, 0.28, 13 + (k % 2));
      if (/^walk[12]$/.test(c))
        addSfx(`sfx-click-${k++}`, "sfx-click.mp3", scene.start + b.t + 0.6, 0.35, 15);
    }
  }
  const html = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <title>${esc(script.series)} · ${esc(script.episode)} · ${esc(script.title)}</title>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: 1920px; height: 1080px; overflow: hidden; background: #1A1A1A; }
      /* palco opaco: evita flash branco nas costuras (seam-craft) */
      #root { position: relative; width: 100%; height: 100%; overflow: hidden; background: #EDEDED; }
      #root > div[data-composition-src] { position: absolute; inset: 0; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-width="1920" data-height="1080" data-duration="${TOTAL}" data-fps="30">
${slides.join("\n")}
${fullScenes.join("\n")}
${fullCards.join("\n")}
      <!-- formato final: sem legendas renderizadas e sem janela do narrador -->
      <!-- narração: voz clonada do Fabio (HeyGen), um beat por arquivo em media/vo/${EP}/ -->
      <audio id="vo" src="media/vo/${EP}-narration.wav" data-start="0" data-duration="${TOTAL}" data-track-index="10" data-volume="1"></audio>
${sfx.join("\n")}
    </div>
    <script>
      window.__timelines["main"] = gsap.timeline({ paused: true });
    </script>
  </body>
</html>
`;
  writeFileSync(join(ROOT, "index.html"), html);
}

const secs = Math.round(TOTAL);
console.log(
  `ok: ${script.episode} · ${script.scenes.length} cenas · duração total ${TOTAL}s (${Math.floor(secs / 60)}m${String(secs % 60).padStart(2, "0")}s)`,
);
for (const s of script.scenes)
  console.log(
    `  ${s.id.padEnd(8)} ${String(s.start).padStart(7)} → ${String(s.end).padStart(7)}  (${s.dur}s)`,
  );
