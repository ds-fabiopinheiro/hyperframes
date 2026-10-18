#!/usr/bin/env python3
"""Narração provisória: um WAV por beat do roteiro, via Kokoro (on-device).

Uso:  python3 scripts/tts.py script/ep01.json media/vo/ep01 [--voice pm_alex] [--force]

Pula beats cujo WAV já existe (troca de voz = apagar a pasta ou --force).
Para usar a voz clonada do narrador, basta colocar WAVs com os mesmos nomes
(<beat-id>.wav) na pasta de saída e rodar scripts/build.mjs de novo.
"""
import json, os, sys, argparse
import numpy as np
import soundfile as sf

MODEL = os.path.expanduser("~/.cache/hyperframes/tts/models/kokoro-v1.0.onnx")
VOICES = os.path.expanduser("~/.cache/hyperframes/tts/voices/voices-v1.0.bin")


def trim(samples, rate, thresh=0.01, pad=0.06):
    """Corta silêncio nas pontas, mantendo `pad` segundos de margem."""
    a = np.asarray(samples, dtype=np.float32)
    idx = np.where(np.abs(a) > thresh)[0]
    if idx.size == 0:
        return a
    p = int(pad * rate)
    s = max(0, idx[0] - p)
    e = min(len(a), idx[-1] + p)
    return a[s:e]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("script")
    ap.add_argument("outdir")
    ap.add_argument("--voice", default="pm_alex")
    ap.add_argument("--lang", default="pt-br")
    ap.add_argument("--speed", type=float, default=None, help="sobrescreve timing.speed do roteiro")
    ap.add_argument("--force", action="store_true")
    args = ap.parse_args()

    import kokoro_onnx

    data = json.load(open(args.script, encoding="utf-8"))
    timing = data.get("timing", {})
    base_speed = args.speed if args.speed is not None else timing.get("speed", 1.0)
    slow_speed = timing.get("slowSpeed", base_speed)
    os.makedirs(args.outdir, exist_ok=True)
    model = kokoro_onnx.Kokoro(MODEL, VOICES)

    done = 0
    for scene in data["scenes"]:
        for beat in scene.get("beats", []):
            out = os.path.join(args.outdir, f"{beat['id']}.wav")
            if os.path.exists(out) and not args.force:
                continue
            speed = slow_speed if beat.get("slow") else base_speed
            samples, rate = model.create(beat["say"], voice=args.voice, speed=speed, lang=args.lang)
            samples = trim(samples, rate)
            sf.write(out, samples, rate)
            done += 1
            print(f"{beat['id']}: {len(samples)/rate:.2f}s @{speed}", flush=True)
    print(f"ok: {done} beats sintetizados em {args.outdir}")


if __name__ == "__main__":
    main()
