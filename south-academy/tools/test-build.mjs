#!/usr/bin/env node
/**
 * Teste do tools/build.mjs com um episódio de fixture (5 cenas, áudios de seno com duração conhecida).
 * Os tempos esperados foram calculados à mão com as regras do HANDOFF; a geometria é medida num Chromium real.
 *
 *   node south-academy/tools/test-build.mjs
 *
 * Cada asserção nomeia a quebra que ela pega (comentário "Quebra que pega").
 */
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const HERE = dirname(fileURLToPath(import.meta.url));
const BUILD = process.env.BUILD_TOOL ?? join(HERE, "build.mjs");
const { chromium } = createRequire(import.meta.url)("playwright");

// ---------------------------------------------------------------- fixture
const SCENES_MJS = `
export const SHARED_CSS = \`
  #root, #root * { margin: 0; padding: 0; box-sizing: border-box; }
  #root { position: absolute; inset: 0; overflow: hidden; background: #EDEDED; }
  #root .stage { position: absolute; inset: 0; }
\`;
const root = (id, dur, inner, css = "") => \`<style>\${SHARED_CSS}\${css}</style>
<div id="root" data-composition-id="\${id}" data-width="1920" data-height="1080" data-duration="\${dur}">
\${inner}
</div>
<script>
  (() => {
    const tl = gsap.timeline({ paused: true });
    window.__timelines["\${id}"] = tl;
  })();
</script>\`;
const box = (id, left, top) => \`<div id="\${id}" style="position:absolute;left:\${left}px;top:\${top}px;width:650px;height:100px;background:#fff"></div>\`;
export const SCENES = {
  gancho: ({ dur }) => root("gancho", dur, \`<div class="stage" id="g-stage">\${box("g-card", 1210, 140)}</div>\`, "#root { background: transparent; }"),
  vinheta: ({ dur }) => root("vinheta", dur, '<div class="stage" id="v-stage"><div id="v-bg" style="position:absolute;inset:0;background:#FF5100"></div></div>', "#root { background: #FF5100; }"),
  tela1: ({ dur }) => root("tela1", dur, \`<div class="stage" id="t-stage">\${box("t-card", 96, 300)}</div>\`),
  decisao: ({ dur }) => root("decisao", dur, \`<div class="stage" id="d-stage">\${box("d-card", 1210, 120)}</div>\`, "#root { background: transparent; }"),
  final: ({ dur }) => root("final", dur, '<div class="stage" id="f-stage"><div id="f-bg" style="position:absolute;inset:0;background:#FF5100"></div></div>', "#root { background: #FF5100; }"),
};
`;

const SCRIPT = {
  episode: "EP97",
  series: "Série de teste",
  title: "Episódio de fixture",
  timing: {
    lineGap: 0.5,
    pause: 1,
    pauseLong: 2.5,
    sceneLeadIn: 0.6,
    sceneTail: 1.2,
    beatSlack: 0.5,
  },
  scenes: [
    {
      id: "gancho",
      kind: "narrator",
      avatar: "full",
      label: "Gancho",
      beats: [
        { id: "g01", say: "Primeira.", cue: "open", pause: 1 },
        { id: "g02", say: "Segunda." },
      ],
    },
    { id: "vinheta", kind: "sting", label: "Vinheta", hold: 3 },
    {
      id: "tela1",
      kind: "slide",
      avatar: "pip",
      label: "Tela 1",
      beats: [
        { id: "t01", say: "Terceira." },
        { id: "t02", say: "Quarta, lenta.", slow: true },
      ],
    },
    {
      id: "decisao",
      kind: "narrator",
      avatar: "full",
      label: "Decisão",
      beats: [{ id: "d01", say: "Quinta." }],
    },
    { id: "final", kind: "card", label: "Final", hold: 5, next: "EP98" },
  ],
};

const sh = (cmd, args) => {
  const r = spawnSync(cmd, args, { encoding: "utf8" });
  assert.equal(r.status, 0, `${cmd} ${args.join(" ")}\n${r.stderr}`);
  return r;
};
const sine = (path, seconds, rate = 24000, extra = []) =>
  sh("ffmpeg", [
    "-nostdin",
    "-y",
    "-loglevel",
    "error",
    "-f",
    "lavfi",
    "-i",
    `sine=frequency=330:duration=${seconds}:sample_rate=${rate}`,
    "-ac",
    "1",
    ...extra,
    path,
  ]);

/** Monta uma pasta de episódio. `audio` descreve os arquivos de cada beat. */
function fixture(tag, audio, scriptOverride) {
  const dir = mkdtempSync(join(tmpdir(), `hf-build-${tag}-`));
  const ep = join(dir, "ep97");
  for (const d of ["scripts", "script", "compositions", "media/vo/ep97"])
    mkdirSync(join(ep, d), { recursive: true });
  writeFileSync(join(ep, "scripts", "scenes.mjs"), SCENES_MJS);
  writeFileSync(join(ep, "script", "ep97.json"), JSON.stringify(scriptOverride ?? SCRIPT));
  for (const [file, spec] of Object.entries(audio)) {
    const p = join(ep, "media/vo/ep97", file);
    if (file.endsWith(".opus")) sine(p, spec.seconds, 48000, ["-c:a", "libopus", "-b:a", "64k"]);
    else sine(p, spec.seconds, spec.rate ?? 24000, ["-c:a", "pcm_s16le"]);
  }
  // restos de builds antigos que o formato final precisa apagar
  writeFileSync(join(ep, "compositions", "narrator.html"), "<html>velho</html>");
  writeFileSync(join(ep, "compositions", "captions.html"), "<html>velho</html>");
  return ep;
}
const build = (ep) =>
  spawnSync(process.execPath, [BUILD, ep, "script/ep97.json"], { encoding: "utf8" });
const GOOD = {
  "g01.wav": { seconds: 2.0 },
  "g02.wav": { seconds: 1.0 },
  "t01.wav": { seconds: 3.0 },
  "t02.wav": { seconds: 1.4 },
  "d01.wav": { seconds: 2.5 },
};

/** RMS (0 a 1) da narração mixada entre dois instantes; o build grava PCM16 mono com cabeçalho de 44 bytes. */
function rms(wavPath, from, to) {
  const buf = readFileSync(wavPath);
  const rate = buf.readUInt32LE(24);
  let sum = 0,
    n = 0;
  for (let i = Math.round(from * rate); i < Math.round(to * rate); i++) {
    const v = buf.readInt16LE(44 + i * 2) / 32768;
    sum += v * v;
    n++;
  }
  return Math.sqrt(sum / n);
}

// ---------------------------------------------------------------- 1. build completo
const ep = fixture("ok", GOOD);
let r = build(ep);
assert.equal(r.status, 0, r.stdout + r.stderr);

// Quebra que pega: erro nas contas de lead-in, folga, pausa, gap ou tail (valores calculados à mão no cabeçalho do plano)
const timing = JSON.parse(readFileSync(join(ep, "script", "ep97.timing.json"), "utf8"));
const byId = Object.fromEntries(timing.scenes.map((s) => [s.id, s]));
assert.equal(timing.total, 30.6);
assert.deepEqual(
  timing.scenes.map((s) => [s.id, s.start, s.end]),
  [
    ["gancho", 0, 7.8],
    ["vinheta", 7.8, 10.8],
    ["tela1", 10.8, 20.05],
    ["decisao", 20.05, 25.6],
    ["final", 25.6, 30.6],
  ],
);
assert.deepEqual(
  [
    byId.gancho.beats[0].t,
    byId.gancho.beats[1].t,
    byId.tela1.beats[0].t,
    byId.tela1.beats[1].t,
    byId.decisao.beats[0].t,
  ],
  [0.6, 5.1, 0.6, 5.6, 0.6], // tempos dentro da cena: tela1 começa em 10,8 (16,4 − 10,8 = 5,6); decisão em 20,05
);
assert.equal(byId.gancho.cues.open, 0.6, "cue = tempo local do beat dentro da cena");
assert.equal(byId.decisao.cues.open, undefined);

// Quebra que pega: voltar a gerar legendas ou a janela do narrador no formato final
const index = readFileSync(join(ep, "index.html"), "utf8");
for (const forbidden of ["el-captions", "el-narrator", "nar-win"])
  assert.ok(!index.includes(forbidden), `index.html não pode conter ${forbidden}`);
for (const f of ["narrator.html", "captions.html"])
  assert.equal(existsSync(join(ep, "compositions", f)), false, `${f} velho tem de ser apagado`);

// Quebra que pega: cena fora do tempo certo no host, narração ausente ou efeito sonoro no instante errado
for (const s of timing.scenes)
  assert.ok(
    index.includes(`id="el-${s.id}"`) &&
      index.includes(`data-start="${s.start}" data-duration="${s.dur}"`),
    `slot de ${s.id}`,
  );
assert.ok(
  index.includes(
    '<audio id="vo" src="media/vo/ep97-narration.wav" data-start="0" data-duration="30.6"',
  ),
);
assert.ok(
  index.includes('id="sfx-whoosh" src="assets/sfx-whoosh.mp3" data-start="7.65"'),
  "whoosh 0,15 s antes da vinheta",
);
assert.ok(
  index.includes('id="sfx-impact" src="assets/sfx-impact.mp3" data-start="8.35"'),
  "impacto 0,55 s depois do início da vinheta",
);

// Quebra que pega: beats da narração fora de lugar (sobrepostos, deslocados ou sem silêncio entre eles)
const narr = join(ep, "media/vo/ep97-narration.wav");
assert.ok(rms(narr, 0.7, 2.5) > 0.05, "g01 soa em 0,6 a 2,6 s");
assert.ok(rms(narr, 3.0, 5.0) < 0.001, "silêncio entre g01 e g02 (pausa de 1 s mais folga)");
assert.ok(rms(narr, 5.2, 6.0) > 0.05, "g02 soa em 5,1 s");
assert.ok(rms(narr, 8.0, 10.0) < 0.001, "vinheta sem fala");

// Quebra que pega: foto do Fabio não copiada para o episódio
assert.ok(existsSync(join(ep, "assets", "fabio.webp")));

// ---------------------------------------------------------------- 2. geometria no Chromium
const html = (id) => {
  const f = readFileSync(join(ep, "compositions", `${id}.html`), "utf8");
  return f
    .slice(f.indexOf("<template>") + 10, f.indexOf("</template>"))
    .replace(/<script>[\s\S]*?<\/script>/, "");
};
const browser = await chromium.launch();
async function inPage(id, fn, arg) {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.setContent(
    `<!doctype html><body style="margin:0"><div style="position:relative;width:1920px;height:1080px">${html(id)}</div></body>`,
  );
  await page.addStyleTag({ content: "img{display:none}" }); // a foto não precisa carregar; o contêiner dela é que importa
  const out = await page.evaluate(fn, arg);
  await page.close();
  return out;
}
const rect = (s) => {
  const b = document.querySelector(s).getBoundingClientRect();
  return { x: b.x, y: b.y, w: b.width, h: b.height };
};
// ordem de empilhamento no ponto: a foto precisa vir antes (acima) do fundo da cena
const photoAboveBg = ([x, y]) => {
  const stack = document.elementsFromPoint(x, y);
  const photo = stack.findIndex((el) => el.closest("#fx-photo"));
  const bg = stack.findIndex((el) => ["fx-bg", "v-bg", "f-bg"].includes(el.id));
  return { photo, bg, above: photo >= 0 && bg >= 0 && photo < bg };
};
const hasInStack = ([sel, x, y]) => document.elementsFromPoint(x, y).some((el) => el.matches(sel));

// Quebra que pega: foto fora do lugar no gancho ou gráficos deslocados por engano
assert.deepEqual(await inPage("gancho", rect, "#fx-photo"), {
  x: 150,
  y: 120,
  w: 840,
  h: 840,
});
assert.equal(
  (await inPage("gancho", rect, "#g-card")).x,
  1210,
  "coluna de gráficos do gancho continua em x 1210",
);
// Quebra que pega: o fundo escuro cobrir a foto (a foto precisa estar por cima do fundo)
assert.equal(
  (await inPage("gancho", photoAboveBg, [500, 500])).above,
  true,
  "gancho: foto acima do fundo escuro",
);
assert.equal(
  await inPage("gancho", hasInStack, ["#fx-bg", 1100, 1000]),
  true,
  "fundo escuro cobre a tela cheia",
);
// Quebra que pega: foto escondida atrás do fundo opaco da capa (vinheta e cartão final)
for (const id of ["vinheta", "final"]) {
  assert.deepEqual(
    await inPage(id, rect, "#fx-photo"),
    { x: 1386, y: 180, w: 494, h: 720 },
    `${id}: foto no painel escuro`,
  );
  assert.equal(
    (await inPage(id, photoAboveBg, [1600, 500])).above,
    true,
    `${id}: a foto fica por cima do fundo`,
  );
}
// Quebra que pega: coluna da decisão sem centralizar (metade esquerda vazia)
assert.equal((await inPage("decisao", rect, "#d-card")).x, 635);
// Quebra que pega: a foto entrar duas vezes (uma atrás do fundo, outra na frente) e o fundo escuro duplicar
const count = (sel) => document.querySelectorAll(sel).length;
const counts = {};
for (const id of ["gancho", "vinheta", "final", "decisao"]) {
  counts[id] = [await inPage(id, count, "#fx-photo"), await inPage(id, count, "#fx-bg")];
}
assert.deepEqual(counts, {
  gancho: [1, 1], // foto + fundo escuro
  vinheta: [1, 0], // foto; o fundo é o da própria capa
  final: [1, 0],
  decisao: [0, 1], // só o fundo escuro; a coluna é centralizada
});
// Quebra que pega: sobreposição vazando para um slide comum
assert.equal(await inPage("tela1", () => document.querySelectorAll("#fx-photo, #fx-bg").length), 0);
await browser.close();

// ---------------------------------------------------------------- 3. sem fade do fundo no primeiro quadro
// Quebra que pega: o gancho abrir em fade a partir do cinza (primeiro quadro do vídeo errado) ou a decisão cortar seco
const gancho = readFileSync(join(ep, "compositions", "gancho.html"), "utf8");
const decisao = readFileSync(join(ep, "compositions", "decisao.html"), "utf8");
assert.ok(!gancho.includes('tl.fromTo("#fx-bg"'), "gancho começa em t=0 com o fundo já escuro");
assert.ok(decisao.includes('tl.fromTo("#fx-bg"'), "decisão entra com fade de 0,25 s");
assert.ok(
  decisao.includes("data-layout-allow-overflow"),
  "o deslocamento intencional é declarado ao check de layout",
);

// ---------------------------------------------------------------- 4. prioridade do .opus sobre o .wav
// Quebra que pega: usar a narração provisória da Kokoro quando já existe a da HeyGen
const epOpus = fixture("opus", {
  ...GOOD,
  "d01.opus": { seconds: 1.0 },
  "d01.wav": { seconds: 2.5 },
  "g01.opus": { seconds: 2.0 },
  "g02.opus": { seconds: 1.0 },
  "t01.opus": { seconds: 3.0 },
  "t02.opus": { seconds: 1.4 },
});
for (const f of ["g01.wav", "g02.wav", "t01.wav", "t02.wav"])
  writeFileSync(
    join(epOpus, "media/vo/ep97", f),
    readFileSync(join(epOpus, "media/vo/ep97", "d01.wav")),
  ); // wavs de 2,5 s e 24 kHz que NÃO podem valer
r = build(epOpus);
assert.equal(r.status, 0, r.stdout + r.stderr);
const tOpus = JSON.parse(readFileSync(join(epOpus, "script", "ep97.timing.json"), "utf8"));
const d01 = tOpus.scenes.find((s) => s.id === "decisao").beats[0];
assert.ok(Math.abs(d01.dur - 1.0) < 0.06, `d01 vale o .opus de 1,0 s (veio ${d01.dur})`);
const rate = readFileSync(join(epOpus, "media/vo/ep97-narration.wav")).readUInt32LE(24);
assert.equal(rate, 48000, "narração mixada na taxa do Opus");

// ---------------------------------------------------------------- 5. erros claros
// Quebra que pega: misturar taxas de amostragem produziria uma narração com velocidade errada
const epRates = fixture("rates", { ...GOOD, "g02.wav": { seconds: 1.0, rate: 16000 } });
r = build(epRates);
assert.notEqual(r.status, 0);
assert.match(r.stderr, /taxas de amostragem/);

// Quebra que pega: beat sem áudio sumir do tempo em vez de ocupar 2 s e avisar
const epMissing = fixture(
  "missing",
  Object.fromEntries(Object.entries(GOOD).filter(([k]) => k !== "t02.wav")),
);
r = build(epMissing);
assert.equal(r.status, 0, r.stderr);
assert.match(r.stderr, /1 beats sem áudio.*t02/);
assert.equal(
  JSON.parse(readFileSync(join(epMissing, "script", "ep97.timing.json"), "utf8")).scenes[2].beats[1]
    .dur,
  2,
);

// Quebra que pega: cena do roteiro sem template aparecer como erro obscuro
const epNoTpl = fixture("notpl", GOOD, {
  ...SCRIPT,
  scenes: [...SCRIPT.scenes, { id: "zzz", kind: "slide", beats: [{ id: "z01", say: "x" }] }],
});
r = build(epNoTpl);
assert.notEqual(r.status, 0);
assert.match(r.stderr, /sem template para a cena zzz/);

// Quebra que pega: cena com sobreposição cujo modelo não registra a timeline sair do build sem foto, em silêncio
const epNoMarker = fixture("nomarker", GOOD);
writeFileSync(
  join(epNoMarker, "scripts", "scenes.mjs"),
  SCENES_MJS.replace(
    'window.__timelines["${id}"] = tl;',
    'window.__timelines["sem-marcador"] = tl;',
  ),
);
r = build(epNoMarker);
assert.notEqual(r.status, 0);
assert.match(
  r.stderr,
  /cena gancho: não achei <div id="root">, <\/style> ou o registro da timeline/,
);

// Quebra que pega: roteiro inexistente passar sem aviso
r = spawnSync(process.execPath, [BUILD, ep, "script/nao-existe.json"], { encoding: "utf8" });
assert.notEqual(r.status, 0);
assert.match(r.stderr, /não achei script\/nao-existe\.json/);

console.log(
  "ok: teste do build passou (timing à mão, sem legendas e sem narrador, geometria no Chromium, opus sobre wav, erros claros)",
);
