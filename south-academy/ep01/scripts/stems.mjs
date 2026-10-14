#!/usr/bin/env node
/**
 * stems.mjs — faixas separadas para o CapCut.
 *   node scripts/stems.mjs            → entrega/ep01-narracao-kokoro.wav + entrega/ep01-sfx.wav
 * Lê entrega/sfx-manifest.json (gerado por build.mjs) e mixa os SFX com ffmpeg nos mesmos
 * tempos e volumes do index.html. A narração é a mixagem já produzida por build.mjs.
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const script = JSON.parse(readFileSync(join(ROOT, "script", "ep01.json"), "utf8"));
const EP = script.episode.toLowerCase();
const timing = JSON.parse(readFileSync(join(ROOT, "script", `${EP}.timing.json`), "utf8"));
const OUT = join(ROOT, "entrega");

const narr = join(ROOT, "media", "vo", `${EP}-narration.wav`);
if (!existsSync(narr)) throw new Error(`narração não encontrada: ${narr} (rode scripts/build.mjs)`);
// a mixagem tem 1 s de margem no fim; corta no total do episódio para alinhar com os MP4
execFileSync(
  "ffmpeg",
  [
    "-y",
    "-v",
    "error",
    "-i",
    narr,
    "-t",
    String(timing.total),
    "-c",
    "copy",
    join(OUT, `${EP}-narracao-kokoro.wav`),
  ],
  { stdio: "inherit" },
);

const sfx = JSON.parse(readFileSync(join(OUT, "sfx-manifest.json"), "utf8"));
const args = ["-y", "-v", "error"];
const chains = [];
sfx.forEach((s, i) => {
  args.push("-i", join(ROOT, "assets", s.file));
  // volume linear (data-volume) + atraso em ms até o data-start
  chains.push(
    `[${i}]volume=${s.vol},adelay=${Math.round(s.at * 1000)}|${Math.round(s.at * 1000)}[a${i}]`,
  );
});
const total = timing.total;
const mix = `${sfx.map((_, i) => `[a${i}]`).join("")}amix=inputs=${sfx.length}:normalize=0:dropout_transition=0,apad=whole_dur=${total},atrim=0:${total}[out]`;
args.push(
  "-filter_complex",
  `${chains.join(";")};${mix}`,
  "-map",
  "[out]",
  "-ac",
  "2",
  "-ar",
  "48000",
  join(OUT, `${EP}-sfx.wav`),
);
execFileSync("ffmpeg", args, { stdio: "inherit" });
console.log(
  `ok: ${sfx.length} SFX → entrega/${EP}-sfx.wav · narração → entrega/${EP}-narracao-kokoro.wav`,
);
