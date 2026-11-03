#!/usr/bin/env node
/**
 * Teste do tools/verify-final.sh com MP4 sintéticos de 20 s (fundo claro, seno no áudio) e pastas de episódio de fixture.
 * Cada caso introduz UM defeito que o script precisa apontar; o caso bom precisa passar limpo.
 *
 *   node south-academy/tools/test-verify-final.mjs
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const HERE = dirname(fileURLToPath(import.meta.url));
const VERIFY = process.env.VERIFY_TOOL ?? join(HERE, "verify-final.sh");

const beats = (n) =>
  Array.from({ length: n }, (_, i) => ({
    id: `b${i}`,
    t: 0.5 + i * 0.8,
    end: 1.1 + i * 0.8,
    dur: 0.6,
    cue: null,
  }));
const scene = (id, start, end, n = 0) => ({
  id,
  start,
  end,
  dur: end - start,
  cues: {},
  beats: beats(n),
});
const TIMING = (total = 20) => ({
  total,
  scenes: [
    scene("gancho", 0, 6, 4),
    scene("vinheta", 6, 9),
    scene("tela1", 9, 12, 4),
    scene("tela2", 12, 15, 4),
    scene("tela3", 15, 18, 4),
    scene("decisao", 18, 19, 2),
    scene("final", 19, 20),
  ],
});

/** MP4 de 20 s: fundo claro, caixas escuras opcionais, áudio de seno ou mudo. */
function video(path, { boxes = [], silent = false }) {
  const vf = [
    "null",
    ...boxes.map(([x, y, w, h]) => `drawbox=x=${x}:y=${y}:w=${w}:h=${h}:color=0x1A1A1A:t=fill`),
  ].join(",");
  const audio = silent ? "anullsrc=r=48000:cl=mono" : "sine=frequency=220:sample_rate=48000";
  const r = spawnSync(
    "ffmpeg",
    [
      "-nostdin",
      "-y",
      "-loglevel",
      "error",
      "-f",
      "lavfi",
      "-i",
      "color=c=0xEDEDED:s=1920x1080:r=25:d=20",
      "-f",
      "lavfi",
      "-i",
      audio,
      "-t",
      "20",
      "-vf",
      vf,
      "-c:v",
      "libx264",
      "-preset",
      "ultrafast",
      "-pix_fmt",
      "yuv420p",
      "-c:a",
      "aac",
      path,
    ],
    { encoding: "utf8" },
  );
  assert.equal(r.status, 0, r.stderr);
}

/** Pasta de episódio "ep96" com index.html, timing e MP4. */
function episode(
  tag,
  { index = "<html><body>limpo</body></html>", extraComposition, total = 20, ...videoOpts } = {},
) {
  const dir = mkdtempSync(join(tmpdir(), `hf-verify-${tag}-`));
  const ep = join(dir, "ep96");
  for (const d of ["script", "compositions", "entrega"])
    mkdirSync(join(ep, d), { recursive: true });
  writeFileSync(join(ep, "index.html"), index);
  writeFileSync(join(ep, "script", "ep96.timing.json"), JSON.stringify(TIMING(total)));
  if (extraComposition) writeFileSync(join(ep, "compositions", extraComposition), "<html></html>");
  video(join(ep, "entrega", "ep96.mp4"), videoOpts);
  return ep;
}
const verify = (ep, meta = 20, tol = 30) =>
  spawnSync("bash", [VERIFY, ep, String(meta), String(tol)], {
    encoding: "utf8",
    env: { ...process.env, EPNAME: "ep96" },
  });
const lines = (r) => (r.stdout + r.stderr).split("\n");
const has = (r, re) => lines(r).some((l) => re.test(l));

// 1. episódio bom: tudo OK, montagem gerada, saída zero
// Quebra que pega: o script acusar defeito num vídeo correto, ou deixar de gerar os quadros de conferência
const good = episode("bom", {});
let r = verify(good);
assert.equal(r.status, 0, r.stdout + r.stderr);
assert.ok(has(r, /^OK: sem legendas e sem janela do narrador/));
assert.ok(has(r, /^MP4 vs timing\.json: [+-]\d\.\d\d s → OK/));
assert.ok(has(r, /duração final vs meta do teleprompter: .* → OK$/));
assert.ok(has(r, /→ OK, há fala/));
assert.ok(has(r, /faixa da legenda .* clara em 3 de 3 → OK, sem caixa de legenda/));
assert.ok(has(r, /canto inferior direito .* claro em 3 de 3 → OK, sem caixa do narrador/));
assert.ok(!has(r, /ATENÇÃO|FORA DA FAIXA/), "nenhum aviso no caso bom");
assert.ok(existsSync(join(good, "entrega", "conferencia", "quadros-conferencia.png")));
for (const q of ["vinheta", "gancho", "decisao", "final"])
  assert.ok(existsSync(join(good, "entrega", "conferencia", `q-${q}.png`)), `quadro ${q}`);

// 2. caixa escura onde ficaria a legenda
// Quebra que pega: legenda renderizada voltar ao vídeo sem o script perceber
r = verify(episode("legenda", { boxes: [[510, 960, 900, 90]] }));
assert.ok(has(r, /faixa da legenda .* clara em 0 de 3 → ATENÇÃO/), r.stdout);
assert.ok(
  has(r, /canto inferior direito .* → OK, sem caixa do narrador/),
  "só a legenda foi acusada",
);

// 3. caixa escura no canto do narrador
// Quebra que pega: a janela do narrador voltar ao vídeo sem o script perceber
r = verify(episode("canto", { boxes: [[1472, 807, 400, 225]] }));
assert.ok(has(r, /canto inferior direito .* claro em 0 de 3 → ATENÇÃO/), r.stdout);
assert.ok(has(r, /faixa da legenda .* → OK, sem caixa de legenda/), "só o canto foi acusado");

// 4. áudio mudo no trecho de fala do gancho
// Quebra que pega: render sem a narração passar como bom
r = verify(episode("mudo", { silent: true }));
assert.ok(has(r, /ATENÇÃO: trecho quase mudo/), r.stdout);

// 5. duração fora da meta do teleprompter
// Quebra que pega: episódio de 20 s passar por uma meta de 100 s ± 30 s
r = verify(episode("meta", {}), 100, 30);
assert.ok(has(r, /vs 100 s \(-80\.0 s; faixa 70–130 s\) → FORA DA FAIXA/), r.stdout);
// e a borda: 30 s de diferença ainda é aceita
r = verify(episode("borda", {}), 50, 30);
assert.ok(has(r, /vs 50 s \(-30\.0 s; faixa 20–80 s\) → OK/), r.stdout);

// 6. MP4 com duração diferente da do timing.json
// Quebra que pega: render truncado ou com cena a mais passar despercebido
r = verify(episode("timing", { total: 27 }));
assert.ok(has(r, /MP4 vs timing\.json: -7\.00 s → ATENÇÃO/), r.stdout);

// 7. index.html com legenda ou narrador, e composições velhas
// Quebra que pega: build antigo (com legendas ou narrador) renderizado por engano
r = verify(episode("idx-cap", { index: '<div id="el-captions"></div>' }));
assert.ok(has(r, /ATENÇÃO: index\.html contém el-captions/), r.stdout);
r = verify(episode("idx-nar", { index: '<div id="el-narrator"></div>' }));
assert.ok(has(r, /ATENÇÃO: index\.html contém el-narrator/), r.stdout);
r = verify(episode("comp-cap", { extraComposition: "captions.html" }));
assert.ok(has(r, /ATENÇÃO: compositions\/captions\.html existe/), r.stdout);
r = verify(episode("comp-nar", { extraComposition: "narrator.html" }));
assert.ok(has(r, /ATENÇÃO: compositions\/narrator\.html existe/), r.stdout);

// 8. sem MP4: erro claro e saída diferente de zero
// Quebra que pega: o script seguir adiante e medir um arquivo que não existe
const semMp4 = episode("sem-mp4", {});
spawnSync("rm", ["-f", join(semMp4, "entrega", "ep96.mp4")]);
r = verify(semMp4);
assert.notEqual(r.status, 0);
assert.ok(has(r, /^falta .*ep96\.mp4/), r.stdout);

console.log(
  "ok: teste do verify-final passou (caso bom limpo; legenda, canto, áudio mudo, meta, timing, index e composições velhas, MP4 ausente)",
);
