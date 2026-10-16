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

## Entregáveis para o CapCut (`epNN/entrega/`)

O Fabio grava o vídeo dele e monta no CapCut sobre o render. Por episódio:

| Arquivo                                     | O que é                                                                                  |
| ------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `epNN-sem-voz.mp4`                          | 1080p30, com SFX e sem narração: arquivo base                                            |
| `epNN-guia.mp4`                             | o mesmo vídeo com a narração Kokoro, só para referência de tempo                         |
| `epNN-narracao-kokoro.wav` · `epNN-sfx.wav` | faixas separadas                                                                         |
| `epNN-zonas.csv`                            | início, fim, modo (`canto` / `tela_cheia`), x, y, largura, altura em pixels de 1920×1080 |
| `epNN-roteiro-tempos.md`                    | teleprompter com o timestamp de cada beat e de cada troca de tela                        |

```bash
node scripts/build.mjs                                   # com narração guia → index.html
npx hyperframes render -q looks -o entrega/ep01-guia.mp4
VOICE=0 node scripts/build.mjs                           # sem narração
npx hyperframes render -q looks -o entrega/ep01-sem-voz.mp4
node scripts/build.mjs && node scripts/stems.mjs         # faixas separadas
bash scripts/verify-entrega.sh                           # durações, silêncio, frames com a zona
```

Ritmo: `timing.speed` (Kokoro), `timing.slowSpeed` nos beats `"slow": true` (`[RITMO: lento]`) e
`timing.beatSlack` (folga após cada beat, fração da fala). Sem HeyGen: tudo é local.

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

## Transcrição local (whisper.cpp, CPU)

- Binário: `whisper-cli` em `/usr/local/bin` (build CPU do whisper.cpp, sem CUDA), que é onde `hyperframes doctor` procura.
- Modelo escolhido: **ggml-small** em `~/.cache/hyperframes/whisper/models/ggml-small.bin`. Teste com 30 s da narração do EP02 (4 threads): ggml-base transcreveu em 3,7 s mas trocou "sim" por "assim"; ggml-small transcreveu exato em 10,3 s (~3× tempo real). Um episódio de 11 min leva ~4 min.
- Uso: `whisper-cli -m ~/.cache/hyperframes/whisper/models/ggml-small.bin -l pt -t 4 -f audio-16k-mono.wav` (converter antes com `ffmpeg -ar 16000 -ac 1`).
