#!/usr/bin/env node
/**
 * Teste de mutação das ferramentas de south-academy/tools.
 *
 * Para cada mutação: copia o código para tools/.mutant-<suite>.mjs, troca UM trecho por uma quebra realista e
 * roda o teste da suíte apontado para a cópia. O teste PRECISA falhar ("morto"). Se passar ("SOBREVIVEU"),
 * o comportamento não está protegido ou o teste é tautológico. Mutação cujo trecho não existe (ou existe mais
 * de uma vez) é "INVÁLIDA": o código mudou e a tabela precisa ser atualizada.
 *
 *   node south-academy/tools/mutation-check.mjs [heygen-tts|build|verify-final] [filtro-do-motivo]
 */
import { spawnSync } from "node:child_process";
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));

const SUITES = [
  {
    name: "heygen-tts",
    source: "heygen-tts.mjs",
    test: "test-heygen-tts.mjs",
    env: "HEYGEN_TTS_TOOL",
    mutations: [
      {
        why: "a chave vai junto no download do áudio (outro host)",
        find: "const dl = await fetch(url, { signal: AbortSignal.timeout(180_000) });",
        replace:
          'const dl = await fetch(url, { headers: { "X-Api-Key": key ?? "x" }, signal: AbortSignal.timeout(180_000) });',
      },
      {
        why: "cache ignorado: o mesmo texto é pago de novo",
        find: "existsSync(join(outDir, `${b.id}.opus`)) &&",
        replace: "false &&",
        also: {
          find: "if (!existsSync(rawPath) || opt.force) {",
          replace: "if (true) {",
        },
      },
      {
        why: "429 deixa de ser repetido",
        find: "[429, 500, 503].includes(res.status) && n < tries",
        replace: "[500, 503].includes(res.status) && n < tries",
      },
      {
        why: "402 (sem crédito) passa a ser repetido",
        find: "[429, 500, 503].includes(res.status) && n < tries",
        replace: "[402, 429, 500, 503].includes(res.status) && n < tries",
      },
      {
        why: "a marcação ** do roteiro vai para a voz",
        find: '.replace(/\\*\\*/g, "")',
        replace: "",
      },
      {
        why: "modo proxy exige variável de ambiente",
        find: 'if (!opt["key-env"] && cfg.key_source === "proxy") return null;',
        replace: "",
      },
      {
        why: "o catálogo ignora a velocidade dos beats lentos",
        find: "speed: b.apiSpeed",
        replace: "speed: 1",
      },
      {
        why: "o beat lento não é desacelerado nos clones de modelo",
        find: '...(b.localTempo !== 1 ? ["-filter:a", `atempo=${b.localTempo}`] : []),',
        replace: "...[],",
      },
      {
        why: "o silêncio das pontas não é cortado",
        find: "const trimmed = trim(samples, rate);",
        replace: "const trimmed = samples;",
      },
      {
        why: "--dry-run chama a API",
        find: 'if (opt["dry-run"]) return;',
        replace: "",
      },
      {
        why: "--only é ignorado",
        find: "(!only || only.has(b.id))",
        replace: "true",
      },
      {
        why: "find-voice --save escolhe uma voz no chute quando há duas",
        find: "if (pool.length !== 1)",
        replace: "if (pool.length < 1)",
      },
      {
        why: "texto acima de 5000 caracteres segue para a API",
        find: "if (b.text.length > 5000)",
        replace: "if (false)",
      },
    ],
  },
  {
    name: "build",
    source: "build.mjs",
    test: "test-build.mjs",
    env: "BUILD_TOOL",
    mutations: [
      {
        why: "a janela do narrador volta ao index.html",
        find: '${fullScenes.join("\\n")}',
        replace: '${fullScenes.join("\\n")}\n      <div id="el-narrator"></div>',
      },
      {
        why: "gancho, vinheta e final perdem a foto",
        find: "if (OVERLAYS[scene.id]) parts.push(OVERLAYS[scene.id](scene));",
        replace: "if (false) parts.push(OVERLAYS[scene.id](scene));",
      },
      {
        why: "cenas de tela cheia perdem o fundo escuro",
        find: 'if (scene.kind === "narrator") parts.push(DARK_BG(scene.start));',
        replace: "if (false) parts.push(DARK_BG(scene.start));",
      },
      {
        why: "a foto da vinheta e do final fica atrás do fundo opaco",
        find: ".filter((p) => !p.front)",
        replace: ".filter(() => true)",
      },
      {
        why: "o deslocamento da decisão deixa de ser declarado ao check de layout",
        find: "if (part.patch) out = part.patch(out)",
        replace: "if (false) out = part.patch(out)",
      },
      { why: "beat lento sem a folga extra", find: "(beat.slow ? 1.5 : 1)", replace: "1" },
      {
        why: "o intervalo entre linhas some",
        find: "(beat.pause ?? 0) + T.lineGap;",
        replace: "(beat.pause ?? 0);",
      },
      {
        why: "o .opus da HeyGen perde a prioridade para o .wav",
        find: "if (existsSync(opus)) {",
        replace: "if (false && existsSync(opus)) {",
      },
      {
        why: "taxas de amostragem diferentes passam sem erro",
        find: "if (rates.size > 1)",
        replace: "if (false)",
      },
      {
        why: "narrator.html e captions.html velhos ficam no episódio",
        find: "rmSync(join(compDir, old), { force: true })",
        replace: "void 0",
      },
      {
        why: "a foto do Fabio não é copiada para o episódio",
        find: "copyFileSync(",
        replace: "void (",
      },
      {
        why: "todos os beats da narração caem no instante zero",
        find: "Math.round(b.t * rate)",
        replace: "0",
      },
      {
        why: "o whoosh sai no instante errado",
        find: "vinheta.start - 0.15",
        replace: "vinheta.start",
      },
      {
        why: "beat sem áudio vira 0 s em vez de 2 s",
        find: "let dur = 2.0;",
        replace: "let dur = 0;",
      },
      {
        why: "cena sem template vira erro obscuro",
        find: "if (!fn) throw new Error(",
        replace: "if (false) throw new Error(",
      },
      {
        why: "a coluna da decisão não é centralizada",
        find: "translateX(-575px)",
        replace: "translateX(0px)",
      },
      { why: "o gancho abre com fade a partir do cinza", find: "start > 0", replace: "true" },
      {
        why: "foto da vinheta fora do painel escuro",
        find: "#root #fx-photo { left: 1386px; top: 180px; width: 494px; height: 720px; }\n  #root #v-group",
        replace:
          "#root #fx-photo { left: 1286px; top: 180px; width: 494px; height: 720px; }\n  #root #v-group",
      },
      {
        why: "modelo sem registro de timeline segue sem erro",
        find: "if (!rootOpen || styleEnd < 0 || !html.includes(marker))",
        replace: "if (false)",
      },
      { why: "foto do gancho com tamanho errado", find: "height: 840px", replace: "height: 800px" },
    ],
  },
  {
    name: "verify-final",
    source: "verify-final.sh",
    test: "test-verify-final.mjs",
    env: "VERIFY_TOOL",
    mutations: [
      {
        why: "legenda no index.html deixa de ser acusada",
        find: "for pat in el-captions el-narrator nar-win; do",
        replace: "for pat in el-narrator nar-win; do",
      },
      {
        why: "captions.html velho deixa de ser acusado",
        find: "for f in captions narrator; do",
        replace: "for f in narrator; do",
      },
      {
        why: "a tolerância da meta é ignorada",
        find: "Math.abs(d)<=tol?'OK':'FORA DA FAIXA'",
        replace: "true?'OK':'FORA DA FAIXA'",
      },
      {
        why: "MP4 com duração diferente do timing passa",
        find: "Math.abs(f-t)<=0.5?'OK':'ATENÇÃO'",
        replace: "true?'OK':'ATENÇÃO'",
      },
      { why: "trecho mudo do gancho passa como fala", find: "($M)>-45?", replace: "true?" },
      { why: "prova da legenda sempre aprova", find: '[ "$okleg" -ge "$need" ]', replace: "true" },
      { why: "prova do canto sempre aprova", find: '[ "$okcanto" -ge "$need" ]', replace: "true" },
      {
        why: "a prova da legenda olha a região errada",
        find: "crop=900:90:510:960",
        replace: "crop=900:90:510:100",
      },
      {
        why: "a prova do canto olha a região errada",
        find: "crop=400:225:1472:807",
        replace: "crop=400:225:0:0",
      },
      {
        why: "limiar de fundo claro vira zero",
        find: '[ "$l" -gt 150 ] && okleg',
        replace: '[ "$l" -gt 0 ] && okleg',
      },
      {
        why: "MP4 ausente não interrompe",
        find: '[ -f "$V" ] || { echo "falta $V"; exit 1; }',
        replace: "true",
      },
    ],
  },
  {
    name: "validate-script",
    source: "validate-script.mjs",
    test: "test-validate-script.mjs",
    env: "VALIDATE_TOOL",
    mutations: [
      { why: "id de beat repetido passa", find: "if (seen.has(beat.id))", replace: "if (false)" },
      {
        why: "cena sem template passa",
        find: "if (!template) problems.push(",
        replace: "if (false) problems.push(",
      },
      { why: "cue indefinido passa", find: "if (!defined.has(cue))", replace: "if (false)" },
      {
        why: "cue lido com colchetes é ignorado",
        find: ", ...src.matchAll(/\\bcues\\[\\s*[\"'`](\\w+)[\"'`]\\s*\\]/g)",
        replace: "",
      },
      {
        why: "kind inválido passa",
        find: "if (!KINDS.includes(scene.kind))",
        replace: "if (false)",
      },
      { why: "cena sem hold passa", find: "!(scene.hold > 0)", replace: "false" },
      {
        why: "cartão final sem next passa",
        find: 'scene.kind === "card" && !scene.next',
        replace: "false",
      },
      {
        why: "beat sem texto passa",
        find: "if (!text) problems.push(",
        replace: "if (false) problems.push(",
      },
      { why: "pausa negativa passa", find: "beat.pause >= 0", replace: "true" },
      { why: "texto acima de 5000 passa", find: "if (text.length > 5000)", replace: "if (false)" },
      {
        why: "só o primeiro problema é mostrado",
        find: "for (const p of problems) console.error(",
        replace: "for (const p of problems.slice(0, 1)) console.error(",
      },
      {
        why: "problema não derruba a saída",
        find: "process.exit(1);\n}\nconsole.log(",
        replace: "}\nconsole.log(",
      },
    ],
  },
];

function runTest(suite, mutantPath) {
  const env = { ...process.env };
  if (mutantPath) env[suite.env] = mutantPath;
  else delete env[suite.env];
  return spawnSync(process.execPath, [join(HERE, suite.test)], {
    env,
    encoding: "utf8",
    timeout: 300_000,
  });
}

const only = process.argv[2];
const filter = process.argv[3] ? new RegExp(process.argv[3], "i") : null;
let bad = 0;
for (const suite of SUITES.filter((s) => !only || s.name === only)) {
  const base = runTest(suite, null);
  if (base.status !== 0) {
    console.log(
      `${suite.name}: o teste SEM mutação já falha; corrija antes de mutar\n${base.stdout}${base.stderr}`,
    );
    process.exit(1);
  }
  const source = readFileSync(join(HERE, suite.source), "utf8");
  // um arquivo por processo: duas rodadas ao mesmo tempo não podem apagar o mutante uma da outra
  const mutantPath = join(HERE, `.mutant-${suite.name}-${process.pid}.mjs`);
  let killed = 0;
  const chosen = suite.mutations.filter((x) => !filter || filter.test(x.why));
  for (const m of chosen) {
    let code = source;
    const edits = [m, ...(m.also ? [m.also] : [])];
    let invalid = false;
    for (const e of edits) {
      if (code.split(e.find).length !== 2) invalid = true;
      code = code.replace(e.find, () => e.replace);
    }
    if (invalid) {
      bad++;
      console.log(`  INVÁLIDA   ${m.why}: o trecho não existe uma única vez em ${suite.source}`);
      continue;
    }
    writeFileSync(mutantPath, code);
    const r = runTest(suite, mutantPath);
    rmSync(mutantPath, { force: true });
    if (r.status !== 0) {
      killed++;
      console.log(`  morto      ${m.why}`);
    } else {
      bad++;
      console.log(`  SOBREVIVEU ${m.why}`);
    }
  }
  console.log(`${suite.name}: ${killed} de ${chosen.length} mutações mortas`);
}
process.exit(bad ? 1 : 0);
