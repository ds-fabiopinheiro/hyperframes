#!/usr/bin/env node
/**
 * Teste do tools/validate-script.mjs: o validador roda ANTES do build e acusa roteiros que quebrariam o vídeo.
 * Cada caso muda UMA coisa num roteiro bom de fixture e confere o aviso.
 *
 *   node south-academy/tools/test-validate-script.mjs
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const HERE = dirname(fileURLToPath(import.meta.url));
const VALIDATE = process.env.VALIDATE_TOOL ?? join(HERE, "validate-script.mjs");

const SCENES_MJS = `
export const SCENES = {
  gancho: ({ cues, dur }) => \`abre em \${cues.open} e fecha em \${cues.fim} de \${dur}\`,
  vinheta: ({ dur }) => \`vinheta \${dur}\`,
  tela1: ({ cues, dur }) => \`tela \${cues.um} \${cues["dois"]} \${dur}\`,
  final: ({ scene, dur }) => \`próximo \${scene.next} \${dur}\`,
};
`;

const GOOD = () => ({
  episode: "EP96",
  series: "S",
  title: "T",
  timing: { lineGap: 0.5 },
  scenes: [
    {
      id: "gancho",
      kind: "narrator",
      avatar: "full",
      label: "G",
      beats: [
        { id: "g01", say: "Um.", cue: "open", pause: 1 },
        { id: "g02", say: "Dois.", cue: "fim" },
      ],
    },
    { id: "vinheta", kind: "sting", label: "V", hold: 3 },
    {
      id: "tela1",
      kind: "slide",
      avatar: "pip",
      label: "T1",
      beats: [
        { id: "t01", say: "Três.", cue: "um" },
        { id: "t02", say: "Quatro.", cue: "dois", slow: true },
      ],
    },
    { id: "final", kind: "card", label: "F", hold: 5, next: "EP97 · Próximo" },
  ],
});

function run(mutate) {
  const dir = mkdtempSync(join(tmpdir(), "hf-validate-"));
  const ep = join(dir, "ep96");
  mkdirSync(join(ep, "scripts"), { recursive: true });
  mkdirSync(join(ep, "script"), { recursive: true });
  writeFileSync(join(ep, "scripts", "scenes.mjs"), SCENES_MJS);
  const script = GOOD();
  mutate?.(script);
  writeFileSync(join(ep, "script", "ep96.json"), JSON.stringify(script));
  const r = spawnSync(process.execPath, [VALIDATE, ep, "script/ep96.json"], { encoding: "utf8" });
  return { code: r.status, out: r.stdout + r.stderr };
}

// 1. roteiro bom passa limpo
// Quebra que pega: o validador acusar roteiro correto (e travar o fluxo à toa)
let r = run();
assert.equal(r.code, 0, r.out);
assert.match(r.out, /^ok: EP96 · 4 cenas · 4 beats/m);

// 2. id de beat repetido
// Quebra que pega: dois beats com o mesmo id usarem o mesmo arquivo de áudio
r = run((s) => (s.scenes[2].beats[1].id = "g01"));
assert.notEqual(r.code, 0);
assert.match(r.out, /beat g01 duplicado \(gancho e tela1\)/);

// 3. cena sem template no scenes.mjs
// Quebra que pega: o build cair com erro obscuro depois do áudio já pago
r = run((s) =>
  s.scenes.splice(2, 0, {
    id: "tela9",
    kind: "slide",
    label: "X",
    beats: [{ id: "x01", say: "x" }],
  }),
);
assert.notEqual(r.code, 0);
assert.match(r.out, /cena tela9 não tem template em scenes\.mjs/);

// 4. a cena usa um cue que nenhum beat define
// Quebra que pega: tempo "undefined" na timeline (animação que nunca dispara ou NaN)
r = run((s) => delete s.scenes[0].beats[1].cue);
assert.notEqual(r.code, 0);
assert.match(r.out, /cena gancho usa o cue "fim", que nenhum beat define/);
// cue lido com colchetes também conta
r = run((s) => delete s.scenes[2].beats[1].cue);
assert.notEqual(r.code, 0);
assert.match(r.out, /cena tela1 usa o cue "dois", que nenhum beat define/);

// 5. kind inválido
// Quebra que pega: cena que o build não encaixa em nenhuma camada e some do vídeo
r = run((s) => (s.scenes[1].kind = "intro"));
assert.notEqual(r.code, 0);
assert.match(r.out, /cena vinheta tem kind inválido "intro"/);

// 6. vinheta ou cartão sem hold
// Quebra que pega: cena de duração zero ou NaN
r = run((s) => delete s.scenes[1].hold);
assert.notEqual(r.code, 0);
assert.match(r.out, /cena vinheta \(sting\) precisa de hold maior que zero/);

// 7. cartão final sem o teaser do próximo episódio
// Quebra que pega: "undefined" impresso no cartão final
r = run((s) => delete s.scenes[3].next);
assert.notEqual(r.code, 0);
assert.match(r.out, /cena final \(card\) precisa de next/);

// 8. beat sem texto ou com pausa inválida
// Quebra que pega: beat mudo no meio do episódio, ou tempo negativo
r = run((s) => (s.scenes[0].beats[0].say = "  "));
assert.notEqual(r.code, 0);
assert.match(r.out, /beat g01 sem texto em say/);
r = run((s) => (s.scenes[0].beats[0].pause = -1));
assert.notEqual(r.code, 0);
assert.match(r.out, /beat g01 com pause inválido \(-1\)/);

// 9. texto acima do limite da API
// Quebra que pega: a HeyGen recusar o beat depois de os anteriores serem pagos
r = run((s) => (s.scenes[2].beats[0].say = "x".repeat(5001)));
assert.notEqual(r.code, 0);
assert.match(r.out, /beat t01 passa de 5000 caracteres/);

// 10. todos os problemas aparecem juntos, não só o primeiro
// Quebra que pega: ter de rodar o validador cinco vezes para achar cinco erros
r = run((s) => {
  s.scenes[1].kind = "intro";
  delete s.scenes[3].next;
  s.scenes[0].beats[0].say = "";
});
assert.notEqual(r.code, 0);
assert.match(r.out, /kind inválido/);
assert.match(r.out, /precisa de next/);
assert.match(r.out, /sem texto/);
assert.match(r.out, /3 problemas/);

console.log(
  "ok: teste do validate-script passou (id duplicado, template ausente, cue indefinido, kind, hold, next, texto, pausa, 5000 caracteres, todos juntos)",
);
