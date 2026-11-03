#!/usr/bin/env node
/**
 * validate-script.mjs — confere o roteiro de um episódio ANTES de gastar crédito de voz e antes do build.
 *
 *   node south-academy/tools/validate-script.mjs south-academy/ep08 [script/ep08.json]
 *
 * Acusa todos os problemas de uma vez: id de beat repetido, cena sem template no scenes.mjs, cue que a cena usa
 * e nenhum beat define, kind inválido, hold ausente, next ausente no cartão final, beat sem texto, pausa inválida
 * e texto acima dos 5000 caracteres que a API de voz aceita.
 */
import { existsSync, readFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = resolve(process.argv[2] ?? "");
const scriptArg = process.argv[3] ?? join("script", `${basename(ROOT)}.json`);
if (
  !process.argv[2] ||
  !existsSync(join(ROOT, "scripts", "scenes.mjs")) ||
  !existsSync(resolve(ROOT, scriptArg))
) {
  console.error(
    "uso: node south-academy/tools/validate-script.mjs <pasta-do-episodio> [script/epNN.json]",
  );
  process.exit(1);
}
const script = JSON.parse(readFileSync(resolve(ROOT, scriptArg), "utf8"));
const { SCENES } = await import(pathToFileURL(join(ROOT, "scripts", "scenes.mjs")).href);

const KINDS = ["narrator", "slide", "sting", "card"];
const problems = [];
const seen = new Map();
let beatCount = 0;

for (const scene of script.scenes) {
  if (!KINDS.includes(scene.kind))
    problems.push(`cena ${scene.id} tem kind inválido "${scene.kind}"`);
  const template = SCENES[scene.id];
  if (!template) problems.push(`cena ${scene.id} não tem template em scenes.mjs`);
  else {
    const src = template.toString();
    const used = new Set(
      [...src.matchAll(/\bcues\.(\w+)/g), ...src.matchAll(/\bcues\[\s*["'`](\w+)["'`]\s*\]/g)].map(
        (m) => m[1],
      ),
    );
    const defined = new Set((scene.beats ?? []).map((b) => b.cue).filter(Boolean));
    for (const cue of used)
      if (!defined.has(cue))
        problems.push(`cena ${scene.id} usa o cue "${cue}", que nenhum beat define`);
  }
  if (!scene.beats && KINDS.includes(scene.kind) && !(scene.hold > 0))
    problems.push(`cena ${scene.id} (${scene.kind}) precisa de hold maior que zero`);
  if (scene.kind === "card" && !scene.next)
    problems.push(`cena ${scene.id} (card) precisa de next`);
  for (const beat of scene.beats ?? []) {
    beatCount++;
    if (seen.has(beat.id))
      problems.push(`beat ${beat.id} duplicado (${seen.get(beat.id)} e ${scene.id})`);
    else seen.set(beat.id, scene.id);
    const text = String(beat.say ?? "")
      .replace(/\*\*/g, "")
      .trim();
    if (!text) problems.push(`beat ${beat.id} sem texto em say`);
    if (text.length > 5000) problems.push(`beat ${beat.id} passa de 5000 caracteres`);
    if (beat.pause !== undefined && !(typeof beat.pause === "number" && beat.pause >= 0))
      problems.push(`beat ${beat.id} com pause inválido (${beat.pause})`);
  }
}

if (problems.length) {
  for (const p of problems) console.error(`erro: ${p}`);
  console.error(
    `${problems.length} ${problems.length === 1 ? "problema" : "problemas"} em ${scriptArg}`,
  );
  process.exit(1);
}
console.log(`ok: ${script.episode} · ${script.scenes.length} cenas · ${beatCount} beats`);
