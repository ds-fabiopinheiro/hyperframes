#!/usr/bin/env node
/**
 * fidelity.mjs — conferência determinística deck × composição (roda antes do 1º render).
 *   node scripts/fidelity.mjs <dir-dos-slides> <prefixo> <mapa>
 *   ex.: node scripts/fidelity.mjs /tmp/.../south ep03 11:tela11,11A:tela11a,...
 * Para cada slide: toda linha de texto (≥ 12 caracteres, fora do chrome do deck) e todo número/percentual
 * do slide precisa aparecer no HTML gerado da cena (compositions/<cena>.html). Sai com 1 se faltar algo.
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const [deckDir, prefix, mapArg] = process.argv.slice(2);
if (!deckDir || !prefix || !mapArg) {
  console.error("uso: fidelity.mjs <dir-dos-slides> <prefixo> 11:tela11,11A:tela11a,...");
  process.exit(2);
}
const MAP = Object.fromEntries(mapArg.split(",").map((p) => p.split(":")));

const IGNORE = [
  /^letramento de ia/i, /^\d{2}[a-g]?\s.*\/ 67$/i, /^fontes?:/i, /^·$/, /^gartner · casos de uso$/i, /^módulo 1 · aplicações$/i,
  /^insights$/i, /^o que a imagem mostra:?$/i, /^para levar:?$/i, /^\/ 67$/, /^gartner$/i,
  /^\d{2}[a-g]?$/i, /clique na imagem para ampliar/i, /^pergunta$/i, /^notas do slide/i,
];
const norm = (t) =>
  t.replace(/\s+/g, " ").replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/ /g, " ").trim().toLowerCase();
const strip = (html) =>
  html
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/g, "")
    .replace(/<br\s*\/?>/g, " ")
    .replace(/<\/?span(\s[^>]*)?>/g, " ")
    .replace(/<\/?(b|em|i|strong|u|small|sup|sub)(\s[^>]*)?>/g, "")
    .replace(/<[^>]+>/g, "\n");
const unesc = (t) =>
  t.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ");

let failures = 0;
for (const [num, scene] of Object.entries(MAP)) {
  const slideFile = join(deckDir, `${prefix}_tela_${num}.html`);
  const compFile = join(ROOT, "compositions", `${scene}.html`);
  if (!existsSync(slideFile) || !existsSync(compFile)) {
    console.log(`✗ ${num}: arquivo ausente (${existsSync(slideFile) ? "" : slideFile} ${existsSync(compFile) ? "" : compFile})`);
    failures++;
    continue;
  }
  const slideText = unesc(strip(readFileSync(slideFile, "utf8")));
  let lines = slideText.split("\n").map((l) => l.trim()).filter(Boolean);
  const cut = lines.findIndex((l) => /^notas do slide/i.test(l));
  if (cut >= 0) lines = lines.slice(0, cut);
  // a fonte do deck traz um sufixo de navegação; compara só até "Uso interno South System."
  lines = lines.map((l) =>
    l
      .replace(/^[→•\-–—]\s*/, "")
      .replace(/^(o que a imagem mostra|para levar|insights)\s*:?\s*/i, "")
      .replace(/\s*Clique na imagem.*$/i, "")
      .replace(/\s*Detalhes nas notas\.?$/i, "")
      .trim(),
  );
  const compRaw = readFileSync(compFile, "utf8");
  const comp = norm(unesc(strip(compRaw)));
  // números também podem vir de dados de script (count-up, barras): compara contra o arquivo inteiro
  const compAll = norm(unesc(compRaw.replace(/<[^>]+>/g, " ")));
  const missingLines = [];
  const seen = new Set();
  for (const raw of lines) {
    const l = norm(raw);
    if (l.length < 12 || seen.has(l) || IGNORE.some((re) => re.test(raw.trim()))) continue;
    seen.add(l);
    if (!comp.includes(l)) missingLines.push(raw);
  }
  const nums = [...new Set((lines.join("\n").match(/(?:US\$\s?)?\d+(?:[.,]\d+)?\s?%?/g) ?? []).map((n) => norm(n)))]
    .filter((n) => !/^\d{1,2}$/.test(n) || /%/.test(n)); // ignora numerais soltos de 1–2 dígitos sem %
  const missingNums = nums.filter((n) => !compAll.includes(n));
  if (missingLines.length || missingNums.length) {
    failures++;
    console.log(`✗ ${num} → ${scene}`);
    for (const l of missingLines) console.log(`   linha ausente: ${l}`);
    for (const n of missingNums) console.log(`   número ausente: ${n}`);
  } else console.log(`✓ ${num} → ${scene}`);
}
console.log(failures ? `${failures} slide(s) com faltas` : "fidelidade ok");
process.exit(failures ? 1 : 0);
