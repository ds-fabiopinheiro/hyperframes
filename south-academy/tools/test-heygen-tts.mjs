#!/usr/bin/env node
/**
 * Teste offline do heygen-tts.mjs contra um servidor HeyGen falso em 127.0.0.1.
 * Não chama a HeyGen e usa uma chave inventada em uma variável de ambiente do próprio teste.
 *
 *   node south-academy/tools/test-heygen-tts.mjs
 */
import { createServer } from "node:http";
import { spawn, spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, readFileSync, existsSync, copyFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const HERE = dirname(fileURLToPath(import.meta.url));
const TOOL = join(HERE, "heygen-tts.mjs");
const KEY = "chave-falsa-do-teste";
const dir = mkdtempSync(join(tmpdir(), "hf-tts-"));

// WAV de 1,5 s (seno 440 Hz) com 0,3 s de silêncio em cada ponta, mono PCM16 44,1 kHz
const wav = join(dir, "seno.wav");
const gen = spawnSync(
  "ffmpeg",
  [
    "-nostdin",
    "-y",
    "-loglevel",
    "error",
    "-f",
    "lavfi",
    "-i",
    "sine=frequency=440:duration=1.5:sample_rate=44100",
    "-af",
    "volume=0.5,adelay=300|300,apad=pad_dur=0.3",
    "-ac",
    "1",
    "-c:a",
    "pcm_s16le",
    wav,
  ],
  { encoding: "utf8" },
);
assert.equal(gen.status, 0, gen.stderr);
const wavBytes = readFileSync(wav);

const seen = { tts: 0, files: 0, voices: 0, keyOnFiles: 0, keyMissingOnApi: 0, bodies: [] };
let first429 = true;
const server = createServer((req, res) => {
  const url = new URL(req.url, "http://x");
  const send = (code, obj, headers = {}) => {
    res.writeHead(code, { "Content-Type": "application/json", ...headers });
    res.end(JSON.stringify(obj));
  };
  if (url.pathname.startsWith("/files/")) {
    seen.files++;
    if (req.headers["x-api-key"]) seen.keyOnFiles++;
    res.writeHead(200, { "Content-Type": "audio/wav" });
    return res.end(wavBytes);
  }
  if (req.headers["x-api-key"] !== KEY) {
    seen.keyMissingOnApi++;
    return send(401, { error: { code: "unauthorized", message: "chave inválida" } });
  }
  if (url.pathname === "/v3/models/audio/voices") {
    seen.voices++;
    return send(200, {
      data: [
        {
          voice_id: "v-outra",
          mode: "instant",
          name: "Outra voz",
          status: "ACTIVE",
          created_at: 1,
        },
        {
          voice_id: "v-fabio",
          mode: "instant",
          name: "Fabio - Voice 2",
          status: "ACTIVE",
          language: "pt",
          created_at: 2,
        },
      ],
      has_more: false,
      next_token: null,
    });
  }
  if (url.pathname === "/v3/models/audio/tts" && req.method === "POST") {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      seen.tts++;
      const b = JSON.parse(body);
      seen.bodies.push(b);
      if (first429) {
        first429 = false;
        return send(
          429,
          { error: { code: "rate_limit_exceeded", message: "devagar" } },
          { "Retry-After": "1" },
        );
      }
      const port = server.address().port;
      send(
        200,
        { data: { audio_url: `http://127.0.0.1:${port}/files/${seen.tts}.wav`, duration: 2.1 } },
        { "X-Request-Id": `req-${seen.tts}` },
      );
    });
    return;
  }
  send(404, { error: { code: "not_found", message: "rota desconhecida" } });
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const base = `http://127.0.0.1:${server.address().port}`;

const run = (args) =>
  new Promise((resolveRun) => {
    const p = spawn(
      process.execPath,
      [TOOL, ...args, "--base-url", base, "--key-env", "TESTE_HEYGEN_KEY"],
      {
        env: { ...process.env, TESTE_HEYGEN_KEY: KEY },
      },
    );
    let out = "";
    p.stdout.on("data", (d) => (out += d));
    p.stderr.on("data", (d) => (out += d));
    p.on("close", (code) => resolveRun({ code, out }));
  });

// config e roteiro de teste
const cfg = join(dir, "voz.json");
copyFileSync(join(HERE, "..", "voz.json"), cfg);
const scriptPath = join(dir, "ep99.json");
const mkScript = (t2) =>
  writeFileSync(
    scriptPath,
    JSON.stringify({
      scenes: [
        {
          id: "a",
          beats: [
            { id: "b01", say: "Primeira **frase** de teste." },
            { id: "b02", say: t2, slow: true },
            { id: "b03", say: "Terceira frase." },
          ],
        },
      ],
    }),
  );
mkScript("Segunda frase, em ritmo lento.");
const outDir = join(dir, "vo");

// 1. find-voice --save
let r = await run(["find-voice", "--config", cfg, "--save"]);
assert.equal(r.code, 0, r.out);
const saved = JSON.parse(readFileSync(cfg, "utf8"));
assert.equal(saved.voice_id, "v-fabio");
assert.equal(saved.mode, "instant");

// 2. speak: 3 beats, a primeira chamada leva 429 e repete
r = await run(["speak", scriptPath, outDir, "--config", cfg]);
assert.equal(r.code, 0, r.out);
assert.equal(seen.tts, 4, "3 beats + 1 repetição após o 429");
assert.equal(seen.keyOnFiles, 0, "a chave não pode ir ao host do arquivo");
assert.equal(seen.keyMissingOnApi, 0);
assert.ok(
  seen.bodies.every(
    (b) => b.voice_id === "v-fabio" && b.language === "pt" && b.expressiveness_boost === 0.5,
  ),
);
assert.ok(!seen.bodies.some((b) => b.text.includes("**")), "marcação ** removida do texto enviado");
const meta = JSON.parse(readFileSync(join(outDir, "heygen-meta.json"), "utf8"));
assert.ok(meta.b01.requestId?.startsWith("req-"));
// duração: 1,5 s de seno + 0,12 s de margem; o lento passa por atempo 0,9
const d1 = meta.b01.seconds;
const d2 = meta.b02.seconds;
assert.ok(d1 > 1.55 && d1 < 1.75, `b01 ${d1}`);
assert.ok(d2 > 1.75 && d2 < 1.95, `b02 (lento) ${d2}`);
for (const id of ["b01", "b02", "b03"]) assert.ok(existsSync(join(outDir, `${id}.opus`)));
const probe = spawnSync(
  "ffprobe",
  ["-v", "error", "-show_entries", "stream=codec_name", "-of", "csv=p=0", join(outDir, "b01.opus")],
  { encoding: "utf8" },
);
assert.equal(probe.stdout.trim(), "opus");

// 3. segunda rodada: tudo pronto, nenhuma chamada nova
const before = seen.tts;
r = await run(["speak", scriptPath, outDir, "--config", cfg]);
assert.equal(r.code, 0, r.out);
assert.equal(seen.tts, before, "nada deve ser pedido de novo");

// 4. mudar o texto de um beat: só ele volta à API
mkScript("Segunda frase, agora com outro texto.");
r = await run(["speak", scriptPath, outDir, "--config", cfg]);
assert.equal(r.code, 0, r.out);
assert.equal(seen.tts, before + 1);

// 5. --force pede os 3 de novo
r = await run(["speak", scriptPath, outDir, "--config", cfg, "--force"]);
assert.equal(r.code, 0, r.out);
assert.equal(seen.tts, before + 4);

// 6. sem a variável de ambiente: erro claro e nenhuma chamada
const sem = spawnSync(
  process.execPath,
  [TOOL, "find-voice", "--config", cfg, "--base-url", base, "--key-env", "NAO_EXISTE_NO_TESTE"],
  { encoding: "utf8" },
);
assert.notEqual(sem.status, 0);
assert.match(sem.stderr, /NAO_EXISTE_NO_TESTE/);

server.close();
console.log(
  `ok: teste offline passou (chamadas à API falsa: ${seen.tts}; chave nunca enviada ao host do arquivo)`,
);
