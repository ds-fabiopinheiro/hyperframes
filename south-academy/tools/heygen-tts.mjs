#!/usr/bin/env node
/**
 * heygen-tts.mjs — narração do episódio com a voz clonada do Fabio, pela API de áudio da HeyGen.
 *
 * Autorizado pelo Fabio em 2026-11-03 (HANDOFF, regra 1): só a API de áudio (POST /v3/models/audio/tts
 * e GET /v3/models/audio/voices). Nada de MCP da HeyGen, avatar, vídeo ou render na nuvem.
 *
 * Chave: segredo de rede do ambiente (`key_source: proxy` no voz.json; o proxy injeta a chave) ou variável de
 * ambiente (`key_source: env`, `key_env` ou --key-env NOME). O script não
 * lista, não procura e não imprime variáveis. A chave vai só no cabeçalho das chamadas à api.heygen.com;
 * o download do WAV gerado (outro host) é feito sem a chave.
 *
 * Uso:
 *   node tools/heygen-tts.mjs find-voice --key-env NOME [--name "Fabio - Voice 2"] [--save]
 *   node tools/heygen-tts.mjs speak ep08/script/ep08.json ep08/media/vo/ep08 --key-env NOME
 *        [--only g01,g02] [--force] [--model heygen-voice-1-turbo-free] [--voice-id ID]
 *   node tools/heygen-tts.mjs speak <script> <outDir> --dry-run     (conta beats e caracteres; sem rede nem chave)
 *   --config outro.json troca o voz.json (usado nos testes); --base-url só para o servidor falso dos testes.
 *
 * Saída por beat em <outDir>: <beat>.opus (Opus 128 kbps, vai para o git; o WAV de 44,1 kHz passa de
 * 500 KB e o hook de arquivos grandes barra), heygen-meta.json (hash, caracteres, X-Request-Id, duração)
 * e .raw/<hash>.wav (WAV original da HeyGen, fora do git: é o cache que evita pagar duas vezes pelo mesmo texto).
 */
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Node só lê HTTPS_PROXY com NODE_USE_ENV_PROXY=1 (Node >= 22.21): reexecuta uma vez com ele.
if (process.env.HTTPS_PROXY && process.env.NODE_USE_ENV_PROXY !== "1") {
  const r = spawnSync(process.execPath, process.argv.slice(1), {
    stdio: "inherit",
    env: { ...process.env, NODE_USE_ENV_PROXY: "1", NODE_NO_WARNINGS: "1" },
  });
  process.exit(r.status ?? 1);
}

const HERE = dirname(fileURLToPath(import.meta.url));
const DEFAULT_CONFIG = join(HERE, "..", "voz.json");
const MIN_INTERVAL_MS = 2200; // limite da API: 30 requisições por minuto

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const fail = (msg) => {
  console.error(`erro: ${msg}`);
  process.exit(1);
};

function parseArgs(argv) {
  const pos = [];
  const opt = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) pos.push(a);
    else if (["force", "dry-run", "save"].includes(a.slice(2))) opt[a.slice(2)] = true;
    else opt[a.slice(2)] = argv[++i];
  }
  return { pos, opt };
}

const configPath = (opt) => resolve(opt.config ?? DEFAULT_CONFIG);
const loadConfig = (opt) => JSON.parse(readFileSync(configPath(opt), "utf8"));

/**
 * Chave da HeyGen. Dois modos (voz.json `key_source`):
 *  - "proxy": a chave é um segredo de rede do ambiente; o proxy a coloca nas chamadas para api.heygen.com
 *    e a sessão nunca a vê. Aqui não há chave local (devolve null) e nenhum cabeçalho X-Api-Key é enviado.
 *  - "env": variável de ambiente `key_env` (ou --key-env NOME). Nunca procura outras variáveis.
 */
function apiKey(opt, cfg) {
  if (!opt["key-env"] && cfg.key_source === "proxy") return null;
  const name = opt["key-env"] ?? cfg.key_env;
  if (!name)
    fail(
      "informe --key-env NOME_DA_VARIAVEL ou key_env no voz.json. O script nunca procura variáveis.",
    );
  const v = process.env[name];
  if (!v) fail(`a variável ${name} está vazia ou não existe neste ambiente.`);
  return v;
}

const HINTS = {
  401: "chave inválida, expirada ou ausente (em key_source proxy, o segredo de rede não foi aplicado a api.heygen.com).",
  402: "sem crédito ou limite de uso atingido: pare e avise o Fabio.",
  403: "a voz é um clone profissional e a conta não está habilitada para ele.",
  404: "a voz não está na conta dona da chave (confira o voice_id com find-voice).",
  409: "a voz ainda não está ACTIVE (voice_not_ready) ou o treino falhou.",
};

/** Chamada à API da HeyGen com repetição em 429/500/503 e erros claros nos demais casos. */
async function call(base, key, method, path, body) {
  const tries = 6;
  for (let n = 0; ; n++) {
    let res;
    try {
      res = await fetch(base + path, {
        method,
        headers: {
          ...(key ? { "X-Api-Key": key } : {}),
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: AbortSignal.timeout(180_000),
      });
    } catch (e) {
      if (n >= tries) fail(`falha de rede em ${path}: ${e.cause?.code ?? e.message}`);
      await sleep(Math.min(60, 4 * 2 ** n) * 1000);
      continue;
    }
    if (res.ok) return { json: await res.json(), headers: res.headers };
    const text = await res.text();
    let err = {};
    try {
      err = JSON.parse(text).error ?? {};
    } catch {
      /* corpo sem JSON */
    }
    if ([429, 500, 503].includes(res.status) && n < tries) {
      const ra = Number(res.headers.get("retry-after"));
      const wait = ra > 0 ? ra : Math.min(60, 4 * 2 ** n);
      console.warn(`  ${res.status} ${err.code ?? ""} em ${path}; nova tentativa em ${wait}s`);
      await sleep(wait * 1000);
      continue;
    }
    const e = new Error(`${res.status} ${err.code ?? ""} ${err.message ?? ""}`.trim());
    e.status = res.status;
    e.code = err.code;
    e.param = err.param;
    e.hint = HINTS[res.status];
    throw e;
  }
}

const die = (e, path) => fail(`${path}: ${e.message}${e.hint ? ` — ${e.hint}` : ""}`);

// ---------------------------------------------------------------- WAV
function readWav(buf) {
  if (buf.toString("ascii", 0, 4) !== "RIFF" || buf.toString("ascii", 8, 12) !== "WAVE")
    throw new Error("a resposta não é um WAV");
  let off = 12;
  let fmt = null;
  let data = null;
  while (off + 8 <= buf.length) {
    const id = buf.toString("ascii", off, off + 4);
    const size = buf.readUInt32LE(off + 4);
    const body = off + 8;
    if (id === "fmt ")
      fmt = {
        format: buf.readUInt16LE(body),
        channels: buf.readUInt16LE(body + 2),
        rate: buf.readUInt32LE(body + 4),
        bits: buf.readUInt16LE(body + 14),
      };
    else if (id === "data") data = buf.subarray(body, Math.min(body + size, buf.length));
    off = body + size + (size % 2);
  }
  if (!fmt || !data) throw new Error("WAV sem fmt/data");
  if (fmt.format !== 1 || fmt.bits !== 16) throw new Error("esperado PCM de 16 bits");
  const n = Math.floor(data.length / 2 / fmt.channels);
  const mono = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    let s = 0;
    for (let c = 0; c < fmt.channels; c++) s += data.readInt16LE((i * fmt.channels + c) * 2);
    mono[i] = s / fmt.channels / 32768;
  }
  return { rate: fmt.rate, samples: mono };
}

function wavBuffer(samples, rate) {
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
  for (let i = 0; i < n; i++)
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, samples[i])) * 32767), 44 + i * 2);
  return buf;
}

/** Corta o silêncio das pontas e deixa 60 ms de margem (mesma regra do tts.py da Kokoro). */
function trim(samples, rate, thresh = 0.01, pad = 0.06) {
  let a = 0;
  let b = samples.length - 1;
  while (a < samples.length && Math.abs(samples[a]) <= thresh) a++;
  while (b > a && Math.abs(samples[b]) <= thresh) b--;
  if (a >= samples.length) return samples;
  const p = Math.round(pad * rate);
  return samples.subarray(Math.max(0, a - p), Math.min(samples.length, b + 1 + p));
}

function ffmpeg(args) {
  const r = spawnSync("ffmpeg", ["-nostdin", "-y", "-loglevel", "error", ...args], {
    encoding: "utf8",
  });
  if (r.status !== 0) fail(`ffmpeg falhou: ${r.stderr.trim().split("\n").slice(-2).join(" ")}`);
}

// ---------------------------------------------------------------- comandos
const norm = (s) => String(s).replace(/\*\*/g, "").replace(/\s+/g, " ").trim();
const hashOf = (o) => createHash("sha1").update(JSON.stringify(o)).digest("hex").slice(0, 16);

/** Lista paginada (limit/token) de um endpoint de vozes. */
async function listAll(base, key, path) {
  const out = [];
  let token = null;
  do {
    const url = `${path}${token ? `&token=${encodeURIComponent(token)}` : ""}`;
    const { json } = await call(base, key, "GET", url);
    out.push(...json.data);
    token = json.has_more ? json.next_token : null;
  } while (token);
  return out;
}

// A HeyGen tem dois catálogos de voz: os clones "de modelo" (instantâneo/profissional, POST /v3/models/audio/tts)
// e o catálogo geral, onde ficam as vozes clonadas pelo app (POST /v3/voices/speech).
const SOURCES = [
  { id: "models", path: "/v3/models/audio/voices?type=private&limit=100" },
  { id: "catalog", path: "/v3/voices?type=private&limit=100" },
];

async function findVoice(opt) {
  const cfg = loadConfig(opt);
  const base = opt["base-url"] ?? "https://api.heygen.com";
  const key = apiKey(opt, cfg);
  const wanted = (opt.name ?? cfg.name).toLowerCase();
  const found = [];
  for (const src of SOURCES) {
    let list = [];
    try {
      list = await listAll(base, key, src.path);
    } catch (e) {
      if ([401, 402].includes(e.status)) die(e, `GET ${src.path.split("?")[0]}`);
      console.warn(`  ${src.id}: ${e.message}`);
      continue;
    }
    const hit = list.filter((v) => String(v.name).toLowerCase().includes(wanted));
    console.log(
      `${src.id}: ${list.length} voz(es) clonada(s) na conta; ${hit.length} com o nome "${opt.name ?? cfg.name}"`,
    );
    for (const v of hit.length ? hit : list)
      console.log(
        `  ${v.voice_id}  ${v.name}  ${src.id === "models" ? `modo=${v.mode} status=${v.status}` : `engine padrão=${v.default_engine ?? "-"} motores=${(v.available_engines ?? []).join(",") || "-"} pausa=${v.support_pause ?? "-"} idioma=${v.language ?? "-"}`}`,
      );
    found.push(...hit.map((v) => ({ ...v, source: src.id })));
  }
  if (opt.save) {
    const exact = found.filter((v) => String(v.name).toLowerCase() === wanted);
    const pool = exact.length ? exact : found;
    if (pool.length !== 1)
      fail(
        `não deu para escolher uma voz só (${pool.length} candidatas); passe --name exato ou edite voz.json`,
      );
    const pick = pool[0];
    if (pick.source === "models" && pick.status !== "ACTIVE") fail(`a voz está ${pick.status}`);
    cfg.voice_id = pick.voice_id;
    cfg.name = pick.name;
    cfg.endpoint = pick.source;
    cfg.mode = pick.source === "models" ? pick.mode : "catalog";
    cfg.engine = pick.source === "catalog" ? (pick.default_engine ?? null) : null;
    writeFileSync(configPath(opt), JSON.stringify(cfg, null, 2) + "\n");
    console.log(`voz.json atualizado: ${pick.name} (${cfg.endpoint}, ${cfg.mode})`);
  }
}

async function speak(opt, pos) {
  const [scriptPath, outArg] = pos.slice(1);
  if (!scriptPath || !outArg) fail("uso: speak <script.json> <pasta-de-saida>");
  const cfg = loadConfig(opt);
  const endpoint = opt.endpoint ?? cfg.endpoint ?? "models";
  const model = opt.model ?? cfg.model;
  const voiceId = opt["voice-id"] ?? cfg.voice_id;
  const base = opt["base-url"] ?? "https://api.heygen.com";
  const outDir = resolve(outArg);
  const rawDir = join(outDir, ".raw");
  const metaPath = join(outDir, "heygen-meta.json");
  const script = JSON.parse(readFileSync(resolve(scriptPath), "utf8"));
  const only = opt.only ? new Set(opt.only.split(",")) : null;
  const beats = script.scenes
    .flatMap((s) => s.beats ?? [])
    .filter((b) => b.say && (!only || only.has(b.id)))
    .map((b) => ({ id: b.id, text: norm(b.say), slow: !!b.slow }));
  for (const b of beats) if (b.text.length > 5000) fail(`o beat ${b.id} passa de 5000 caracteres`);
  const meta = existsSync(metaPath) ? JSON.parse(readFileSync(metaPath, "utf8")) : {};
  const settings = {
    endpoint,
    model,
    engine: cfg.engine ?? null,
    voice_id: voiceId,
    language: cfg.language,
    boost: cfg.expressiveness_boost,
  };
  const state = beats.map((b) => {
    const tempo = b.slow ? cfg.slowTempo : 1;
    // catálogo: a velocidade vai na API (speed); modelo: a API ignora speed, então o atempo é local
    const apiSpeed = endpoint === "catalog" ? tempo : 1;
    const localTempo = endpoint === "catalog" ? 1 : tempo;
    const hash = hashOf({ ...settings, speed: apiSpeed, text: b.text });
    const m = meta[b.id];
    const ready =
      !opt.force &&
      existsSync(join(outDir, `${b.id}.opus`)) &&
      m?.hash === hash &&
      m?.tempo === tempo;
    const cached = existsSync(join(rawDir, `${hash}.audio`)) && !opt.force;
    return { ...b, hash, tempo, apiSpeed, localTempo, ready, cached };
  });
  const chars = (xs) => xs.reduce((a, b) => a + b.text.length, 0);
  const toCall = state.filter((b) => !b.ready && !b.cached);
  console.log(
    `${state.length} beats, ${chars(state)} caracteres · prontos ${state.filter((b) => b.ready).length} · ` +
      `só reprocessar (cache) ${state.filter((b) => !b.ready && b.cached).length} · ` +
      `chamadas à API ${toCall.length} (${chars(toCall)} caracteres) · ${endpoint === "catalog" ? `catálogo (engine ${cfg.engine ?? "padrão da voz"})` : `modelo ${model}`}`,
  );
  if (opt["dry-run"]) return;
  if (!voiceId) fail("sem voice_id: rode find-voice --save ou passe --voice-id");
  mkdirSync(rawDir, { recursive: true });
  const key = toCall.length ? apiKey(opt, cfg) : null;
  let last = 0;
  let novos = 0;
  for (const b of state) {
    if (b.ready) continue;
    const rawPath = join(rawDir, `${b.hash}.audio`);
    let requestId = meta[b.id]?.requestId ?? null;
    let apiDuration = meta[b.id]?.apiDuration ?? null;
    if (!existsSync(rawPath) || opt.force) {
      const wait = last + MIN_INTERVAL_MS - Date.now();
      if (wait > 0) await sleep(wait);
      let path;
      let body;
      if (endpoint === "catalog") {
        path = "/v3/voices/speech";
        body = { text: b.text, voice_id: voiceId, language: cfg.language, speed: b.apiSpeed };
        if (cfg.engine) body.engine = cfg.engine;
      } else {
        path = "/v3/models/audio/tts";
        body = { model, voice_id: voiceId, text: b.text, language: cfg.language };
        if (cfg.mode !== "professional") body.expressiveness_boost = cfg.expressiveness_boost;
      }
      let out;
      try {
        out = await call(base, key, "POST", path, body);
      } catch (e) {
        if (endpoint === "models" && e.status === 400 && e.param === "expressiveness_boost") {
          delete body.expressiveness_boost;
          cfg.mode = "professional";
          out = await call(base, key, "POST", path, body).catch((e2) => die(e2, `beat ${b.id}`));
        } else die(e, `beat ${b.id}`);
      }
      last = Date.now();
      const { audio_url: url, duration, request_id: bodyRequestId } = out.json.data;
      // o áudio fica em outro host: baixa SEM a chave
      const dl = await fetch(url, { signal: AbortSignal.timeout(180_000) });
      if (!dl.ok) fail(`download do áudio do beat ${b.id}: HTTP ${dl.status}`);
      writeFileSync(rawPath, Buffer.from(await dl.arrayBuffer()));
      requestId = out.headers.get("x-request-id") ?? bodyRequestId ?? null;
      apiDuration = duration;
      novos++;
    }
    // pós-processo: qualquer formato vira PCM16 mono; ritmo lento local (modelo), corte das pontas, Opus
    const tmp = join(rawDir, `${b.id}.tmp.wav`);
    ffmpeg([
      "-i",
      rawPath,
      "-ac",
      "1",
      ...(b.localTempo !== 1 ? ["-filter:a", `atempo=${b.localTempo}`] : []),
      "-c:a",
      "pcm_s16le",
      tmp,
    ]);
    const { rate, samples } = readWav(readFileSync(tmp));
    const trimmed = trim(samples, rate);
    const trimPath = join(rawDir, `${b.id}.trim.wav`);
    writeFileSync(trimPath, wavBuffer(trimmed, rate));
    ffmpeg([
      "-i",
      trimPath,
      "-c:a",
      "libopus",
      "-b:a",
      `${cfg.opusKbps}k`,
      "-application",
      "audio",
      join(outDir, `${b.id}.opus`),
    ]);
    rmSync(tmp, { force: true });
    rmSync(trimPath, { force: true });
    meta[b.id] = {
      hash: b.hash,
      chars: b.text.length,
      tempo: b.tempo,
      seconds: Math.round((trimmed.length / rate) * 100) / 100,
      apiDuration,
      requestId,
      endpoint,
      model: endpoint === "catalog" ? null : model,
    };
    writeFileSync(metaPath, JSON.stringify(meta, null, 2) + "\n");
    console.log(`  ${b.id}: ${meta[b.id].seconds}s${b.tempo !== 1 ? ` (tempo ${b.tempo})` : ""}`);
  }
  console.log(
    `ok: ${state.length} beats em ${outDir} · ${novos} novos pela API · caracteres enviados ${chars(toCall)}`,
  );
}

const { pos, opt } = parseArgs(process.argv.slice(2));
if (pos[0] === "find-voice") await findVoice(opt);
else if (pos[0] === "speak") await speak(opt, pos);
else fail("comandos: find-voice | speak (veja o cabeçalho do arquivo)");
