#!/usr/bin/env node
/**
 * build.mjs — monta o episódio a partir do roteiro + áudios de narração.
 *
 *   node scripts/build.mjs [script/ep04.json]
 *
 * 1. Lê script/<ep>.json e mede a duração de cada media/vo/<ep>/<beat>.wav.
 * 2. Calcula o timing (pausas, gaps, lead-in/tail por cena) → script/<ep>.timing.json.
 * 3. Mixa a narração em um único WAV (media/vo/<ep>-narration.wav).
 * 4. Gera index.html, compositions/*.html (cenas, legendas, narrador).
 *
 * Trocar narração ou avatar = substituir os arquivos em media/ e rodar de novo.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { SCENES, SHARED_CSS } from "./scenes.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");
const scriptPath = resolve(ROOT, process.argv[2] ?? "script/ep04.json");
const script = JSON.parse(readFileSync(scriptPath, "utf8"));
const EP = script.episode.toLowerCase();
const VO_DIR = join(ROOT, "media", "vo", EP);
const AVATAR = `media/avatar/${EP}.mp4`;
const T = script.timing;

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

const r2 = (x) => Math.round(x * 100) / 100;

// ---------------------------------------------------------------- timing
const wavs = {};
let t = 0;
let missing = [];
for (const scene of script.scenes) {
  scene.start = r2(t);
  if (scene.beats) {
    t += T.sceneLeadIn;
    for (const beat of scene.beats) {
      const p = join(VO_DIR, `${beat.id}.wav`);
      let dur = 2.0;
      if (existsSync(p)) {
        const w = readWav(p);
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
    `aviso: ${missing.length} beats sem WAV (duração assumida 2 s): ${missing.join(", ")}`,
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

// ---------------------------------------------------------------- compositions
const compDir = join(ROOT, "compositions");
mkdirSync(compDir, { recursive: true });

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

// cenas
for (const scene of script.scenes) {
  const fn = SCENES[scene.id];
  if (!fn) throw new Error(`sem template para a cena ${scene.id}`);
  const html = fn({ ...ctxBase, scene, cues: scene.cues, dur: scene.dur, beats: scene.local });
  writeFileSync(join(compDir, `${scene.id}.html`), wrapSub(scene.id, html));
}

// legendas (rail) — uma linha por beat, binária
{
  const lines = [];
  const sets = [];
  let i = 0;
  for (const scene of script.scenes) {
    for (const b of scene.beats ?? []) {
      const text = capHtml(b.cap ?? b.say);
      const right = scene.avatar === "full" ? " right" : "";
      lines.push(`<div class="cap${right}" id="cap-${b.id}">${text}</div>`);
      sets.push(`tl.set("#cap-${b.id}", { opacity: 1 }, ${b.t});`);
      sets.push(
        `tl.set("#cap-${b.id}", { opacity: 0 }, ${r2(b.end + Math.min(0.9, (b.pause ?? 0) + 0.3))});`,
      );
      i++;
    }
  }
  const body = `
<style>
  #root { position: absolute; inset: 0; pointer-events: none; font-family: Inter, Arial, Helvetica, sans-serif; }
  #root .cap {
    position: absolute; left: 50%; bottom: 44px; transform: translateX(-50%);
    max-width: 880px; padding: 12px 26px; border-radius: 12px;
    background: rgba(26,26,26,.86); color: #fff; font-size: 32px; line-height: 1.3;
    font-weight: 500; text-align: center; opacity: 0; letter-spacing: -0.01em;
    box-shadow: 0 10px 30px -18px rgba(0,0,0,.6);
  }
  #root .cap b { color: #FF9A66; font-weight: 800; }
  /* cenas de tela cheia: legenda na coluna da direita, fora de x < 1140 (vídeo do narrador) */
  #root .cap.right { left: 1210px; transform: none; width: 650px; max-width: 650px; text-align: left; font-size: 30px; }
</style>
<div id="root" data-composition-id="captions" data-width="1920" data-height="1080" data-duration="${TOTAL}">
  ${lines.join("\n  ")}
</div>
<script>
  (() => {
    const tl = gsap.timeline({ paused: true });
    ${sets.join("\n    ")}
    window.__timelines["captions"] = tl;
  })();
</script>`;
  writeFileSync(join(compDir, "captions.html"), wrapSub("captions", body));
}

// narrador (avatar): full ↔ pip, carrier das costuras
{
  const hasVideo = existsSync(join(ROOT, AVATAR));
  // janela PiP: 400x225, canto inferior direito com margem 48
  const PIP = { w: 400, h: 225, x: 1920 - 400 - 48, y: 1080 - 225 - 48 };
  const s = PIP.w / 1920;
  const modes = [];
  let prevMode = null;
  for (const scene of script.scenes) {
    const m = scene.avatar ?? (scene.kind === "sting" || scene.kind === "card" ? "pip" : "full");
    if (m !== prevMode) modes.push({ t: scene.start, mode: m });
    prevMode = m;
  }
  const tw = modes.map(({ t: mt, mode }, idx) => {
    const target =
      mode === "full"
        ? `{ x: 0, y: 0, scale: 1, borderRadius: 0 }`
        : `{ x: ${PIP.x}, y: ${PIP.y}, scale: ${s.toFixed(5)}, borderRadius: 72 }`;
    if (idx === 0) return `tl.set("#nar-win", ${target}, 0);`;
    // curva nudge: rampa / burst / cauda (ver cut-the-curve §7), total 0.7 s a partir da costura
    const t0 = r2(Math.max(0, mt - 0.35));
    return `nudge("#nar-win", ${target}, ${t0});`;
  });
  const media = hasVideo
    ? `<video id="nar-video" src="${AVATAR}" data-start="0" data-duration="${TOTAL}" muted playsinline></video>`
    : `<div id="nar-ph"><div class="nar-frame"></div></div>`;
  const body = `
<style>
  #root { position: absolute; inset: 0; pointer-events: none; font-family: Inter, Arial, Helvetica, sans-serif; }
  #root #nar-win {
    position: absolute; left: 0; top: 0; width: 1920px; height: 1080px; overflow: hidden;
    transform-origin: 0 0; background: #1A1A1A; box-shadow: 0 30px 80px -30px rgba(0,0,0,.6);
  }
  #root #nar-video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
  /* zona reservada para o vídeo do Fabio (CapCut): área vazia, moldura discreta, sem texto */
  #root #nar-ph { position: absolute; inset: 0; background: #1A1A1A; }
  #root .nar-frame { position: absolute; inset: 24px; border: 3px dashed rgba(255,81,0,.45); border-radius: 18px; }
</style>
<div id="root" data-composition-id="narrator" data-width="1920" data-height="1080" data-duration="${TOTAL}">
  <div id="nar-win">
    ${media}
  </div>
</div>
<script>
  (() => {
    const tl = gsap.timeline({ paused: true });
    // nudge curve (cut-the-curve §7): 10% / 65% / 25% da distância em 20% / 18% / 62% do tempo
    const nudge = (sel, to, t0, total = 0.7) => {
      const el = document.querySelector(sel);
      const from = { x: gsap.getProperty(el, "x"), y: gsap.getProperty(el, "y"), scale: gsap.getProperty(el, "scale") };
      // GSAP lê o estado no momento da construção; por isso construímos em sequência cronológica.
      const mix = (k) => ({ x: from.x + (to.x - from.x) * k, y: from.y + (to.y - from.y) * k, scale: from.scale + (to.scale - from.scale) * k });
      tl.to(sel, { ...mix(0.10), duration: total * 0.20, ease: "power3.in" }, t0);
      tl.to(sel, { ...mix(0.75), duration: total * 0.18, ease: "none" }, t0 + total * 0.20);
      tl.to(sel, { ...mix(1), borderRadius: to.borderRadius, duration: total * 0.62, ease: "power4.out" }, t0 + total * 0.38);
      gsap.set(el, { x: to.x, y: to.y, scale: to.scale });
    };
    ${tw.join("\n    ")}
    gsap.set("#nar-win", ${modes[0].mode === "full" ? `{ x: 0, y: 0, scale: 1 }` : `{ x: ${PIP.x}, y: ${PIP.y}, scale: ${s.toFixed(5)} }`});
    window.__timelines["narrator"] = tl;
  })();
</script>`;
  writeFileSync(join(compDir, "narrator.html"), wrapSub("narrator", body));
  console.log(
    hasVideo
      ? `avatar: usando ${AVATAR}`
      : `avatar: placeholder (coloque o vídeo em ${AVATAR} e rode o build de novo)`,
  );
}

// ---------------------------------------------------------------- host index.html
{
  // Empilhamento = ordem no DOM (o render não lê data-track-index). Ordem:
  // slides (1) < narrador (2) < gráficos das cenas de narrador (3) < vinheta e cartão final (4) < legendas (6)
  const slotOf = (scene, tr) =>
    `      <div id="el-${scene.id}" data-composition-id="${scene.id}" data-composition-src="compositions/${scene.id}.html" data-start="${scene.start}" data-duration="${scene.dur}" data-track-index="${tr}" data-width="1920" data-height="1080"></div>`;
  const slides = script.scenes.filter((s) => s.kind === "slide").map((s) => slotOf(s, 1));
  const narrScenes = script.scenes.filter((s) => s.kind === "narrator").map((s) => slotOf(s, 3));
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
  const sfxList = [];
  const addSfx = (id, file, at, vol, track = 11) =>
    sfxList.push({ id, file, at: r2(at), dur: SFX_DUR[file], vol }) &&
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
      <!-- narrador (avatar) — atravessa o episódio inteiro, alterna tela cheia / janela -->
      <div id="el-narrator" data-composition-id="narrator" data-composition-src="compositions/narrator.html" data-start="0" data-duration="${TOTAL}" data-track-index="2" data-width="1920" data-height="1080"></div>
${narrScenes.join("\n")}
${fullCards.join("\n")}
      <!-- legendas (rail) — overlay por cima de tudo -->
      <div id="el-captions" data-track-kind="captions" data-composition-id="captions" data-composition-src="compositions/captions.html" data-start="0" data-duration="${TOTAL}" data-track-index="6" data-width="1920" data-height="1080"></div>
      <!-- narração: troque media/vo/${EP}/<beat>.wav pela voz clonada e rode scripts/build.mjs -->
${process.env.VOICE === "0" ? "      <!-- render sem voz: narração omitida (VOICE=0) -->" : `      <audio id="vo" src="media/vo/${EP}-narration.wav" data-start="0" data-duration="${TOTAL}" data-track-index="10" data-volume="1"></audio>`}
${sfx.join("\n")}
    </div>
    <script>
      window.__timelines["main"] = gsap.timeline({ paused: true });
    </script>
  </body>
</html>
`;
  writeFileSync(join(ROOT, "index.html"), html);

  // ---------------------------------------------------------------- entrega/ (CapCut)
  const OUT = join(ROOT, "entrega");
  mkdirSync(OUT, { recursive: true });
  writeFileSync(join(OUT, "sfx-manifest.json"), JSON.stringify(sfxList, null, 2));
  // zonas reservadas para o vídeo do narrador, em pixels de 1920x1080
  const ZONE = { full: { x: 0, y: 0, w: 1920, h: 1080 }, pip: { x: 1472, y: 807, w: 400, h: 225 } };
  const rows = ["inicio,fim,modo,x,y,largura,altura,cena,observacao"];
  for (const scene of script.scenes) {
    const m = scene.avatar ?? (scene.kind === "sting" || scene.kind === "card" ? "none" : "full");
    if (m === "none") continue;
    const z = ZONE[m];
    const obs =
      m === "full"
        ? "graficos a direita (x>=1210); manter o video em x<1140 para nao cobri-los"
        : "canto inferior direito";
    rows.push(
      `${scene.start},${scene.end},${m === "full" ? "tela_cheia" : "canto"},${z.x},${z.y},${z.w},${z.h},${scene.id},${obs}`,
    );
  }
  writeFileSync(join(OUT, `${EP}-zonas.csv`), rows.join("\n") + "\n");
  const mmss = (x) => `${Math.floor(x / 60)}:${(x % 60).toFixed(1).padStart(4, "0")}`;
  const md = [
    `# ${script.episode} · ${script.title} — roteiro com tempos`,
    "",
    `Duração total: ${mmss(TOTAL)} (${TOTAL} s). Tempos = início de cada beat no vídeo guia. Pausas: [PAUSA] 1 s · [PAUSA LONGA] 2,5 s.`,
    "",
  ];
  for (const scene of script.scenes) {
    const modo =
      scene.avatar === "full"
        ? "narrador em tela cheia"
        : scene.avatar === "pip"
          ? "narrador no canto"
          : "sem narrador";
    md.push(`## ${mmss(scene.start)} · ${scene.label} (${modo}, até ${mmss(scene.end)})`, "");
    for (const b of scene.beats ?? []) {
      const tag = b.slow ? " _[RITMO: lento]_" : "";
      md.push(
        `- **${mmss(b.t)}** ${b.cap ?? b.say}${tag}${b.pause ? `  → [PAUSA ${b.pause} s]` : ""}`,
      );
    }
    md.push("");
  }
  writeFileSync(join(OUT, `${EP}-roteiro-tempos.md`), md.join("\n"));
}

console.log(
  `ok: ${script.episode} · ${script.scenes.length} cenas · duração total ${TOTAL}s (${Math.floor(TOTAL / 60)}m${Math.round(
    TOTAL % 60,
  )
    .toString()
    .padStart(2, "0")}s)`,
);
for (const s of script.scenes)
  console.log(
    `  ${s.id.padEnd(8)} ${String(s.start).padStart(7)} → ${String(s.end).padStart(7)}  (${s.dur}s)`,
  );
