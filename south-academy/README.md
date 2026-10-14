# South Academy Executive · vídeos por episódio (HyperFrames)

Um projeto HyperFrames por episódio em `south-academy/epNN/`. Cada projeto é gerado a partir
do roteiro (`script/epNN.json`) e dos áudios de narração (`media/vo/epNN/<beat>.wav`).

## Pipeline (EP01)

```bash
cd south-academy/ep01
# 1. narração provisória (Kokoro on-device, voz pm_alex pt-br) — pula beats já gerados
python3 scripts/tts.py script/ep01.json media/vo/ep01
# 2. timing + mixagem da narração + geração de index.html e compositions/*.html
node scripts/build.mjs
# 3. validação e render
npx hyperframes check
npx hyperframes render -q draft -o renders/ep01-draft.mp4
```

## Trocar a narração pela voz clonada

Gere um WAV por beat com os mesmos nomes (`media/vo/ep01/<beat-id>.wav`, os ids estão em
`script/ep01.json`) e rode `node scripts/build.mjs`. O timing e as legendas são recalculados.

## Trocar o avatar placeholder pelo avatar real

Coloque o vídeo em `media/avatar/ep01.mp4` (1920×1080, mesma linha do tempo do episódio) e rode
`node scripts/build.mjs`. A camada `compositions/narrator.html` passa a usar o vídeo, com as mesmas
posições: tela cheia nos ganchos e na decisão, janela 400×225 no canto inferior direito nas telas.

## Estrutura

- `script/ep01.json` — beats (texto da narração, legenda, cue visual, pausas). Fonte de verdade.
- `script/ep01.timing.json` — gerado: início/fim de cada beat e cena.
- `scripts/scenes.mjs` — templates das cenas (uma função por tela, cues → tempos locais).
- `scripts/build.mjs` — gerador (host, narrador, legendas, mixagem).
- `assets/` — logo, fundos e SFX extraídos do deck / biblioteca bundled do media-use.
