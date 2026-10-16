# South Academy Executive · HANDOFF (estado do projeto em 2026-10-16)

Documento de passagem para continuar a produção (EP05 a EP10) numa sessão nova.
Leia junto com `south-academy/README.md` (pipeline e entregáveis) e com o plano do último
episódio (`docs/plans/2026-10-16-ep04-entrega-capcut.md`).

## 1. O que é o projeto

- Série: **South Academy Executive · Letramento de IA para líderes**, 10 episódios (EP01–EP10).
- Narrador: Fabio Pinheiro (South System). Ele grava a própria narração e monta no CapCut sobre o
  render. A narração Kokoro (TTS local) é **só guia de tempo**.
- Um projeto HyperFrames por episódio em `south-academy/epNN/`, gerado do roteiro em JSON
  (`script/epNN.json`) + um WAV por beat (`media/vo/epNN/<beat>.wav`).
- Fontes de conteúdo:
  - `docs/teleprompter.md` — teleprompter completo dos 10 episódios (texto, `[RITMO: lento]`,
    `[PAUSA]`, `[EDIÇÃO]`, cortes opcionais).
  - `deck/indexed.html` — o deck inteiro (67 telas) com as imagens trocadas por `data:IMG[n]`;
    as imagens estão em `deck/img/imgNN.{png,jpg,webp}`.
  - `deck/extract-slides.py` — gera um HTML por tela e lista as imagens de cada uma:
    `python3 deck/extract-slides.py ep05 18 19 20 21 21A 21B 22` → `deck/ep05_tela_18.html` …
    (os `ep04_tela_*.html` da sessão anterior estavam no scratchpad; regenere se precisar.)

## 2. Regras fixas (não negociar)

1. **Sem HeyGen.** Proibido chamar qualquer endpoint da API HeyGen ou o MCP da HeyGen
   (`mcp__HyperFrames_by_HeyGen__*`, `compose`, `render_video`, etc.). Se algum passo exigir
   HeyGen, pare e avise o Fabio. Não ler, imprimir nem procurar a chave da HeyGen.
2. **Todo render é local** (`node packages/cli/dist/cli.js render`), headless Chrome no container.
3. **Sem workflows multi-agente** (nada de `Workflow`, nada de fan-out de agentes). A conferência
   de fidelidade é por script determinístico (`scripts/fidelity.mjs`), não por agentes.
4. **Um render por episódio**: um único ciclo (sem voz + guia). Se a verificação pegar algo
   pequeno depois do render, registre como pendência e avise; não re-renderize.
5. **Legendas renderizadas no vídeo** (como nos episódios anteriores): trilho `.right` em
   x ≥ 1210 nas cenas de tela cheia, embaixo nas telas com narrador no canto.
6. **Parar ao terminar cada episódio** e esperar a aprovação do Fabio antes do próximo.
7. Economia de uso: sem re-renders além do planejado, sem agentes extras, snapshots só nos cues
   principais.

## 3. Estado por episódio

| EP   | Telas do deck                         | Branch / PR                             | Estado                                                          |
| ---- | ------------------------------------- | --------------------------------------- | --------------------------------------------------------------- |
| EP01 | 01–05                                 | `south-academy-ep01` / PR #1 (mesclado) | entregue                                                        |
| EP02 | 06–10E (10C–10E opcionais)            | `south-academy-ep02` / PR #2 (mesclado) | aprovado                                                        |
| EP03 | 11–12G                                | `south-academy-ep03` / PR #3 (mesclado) | aprovado                                                        |
| EP04 | 13–17 (16D opcional)                  | `south-academy-ep04` / PR #4 (draft)    | render único feito; **aguardando aprovação**                    |
| EP05 | 18, 19, 20, 21, 21A, 21B, 22          | —                                       | próximo (Módulo 2; EP04 já anuncia "EP05 · A pergunta de ouro") |
| EP06 | 23–28 (26 dinâmica, 27 revelação)     | —                                       | —                                                               |
| EP07 | 29–33 (31A Gartner)                   | —                                       | —                                                               |
| EP08 | 37–50 (dois cases + Agentic Commerce) | —                                       | —                                                               |
| EP09 | 51–62                                 | —                                       | —                                                               |
| EP10 | 63–67 (67 encerramento)               | —                                       | —                                                               |

Não há telas 34–36 no teleprompter (o deck pula de 33 para 37).

Durações entregues: EP02 650,4 s · EP03 660,1 s · EP04 721,9 s (12m02s, folga 0,24).
Meta de duração = duração do teleprompter ±30 s (EP03 630–690 s; EP04 690–750 s).

## 4. Padrão de produção por episódio (como foi feito no EP03 e no EP04)

Todos os comandos com caminho absoluto (chamadas paralelas do Bash disputam o cwd).
`CLI=/home/user/hyperframes/packages/cli/dist/cli.js` (o projeto fixa `hyperframes@0.8.156`
no `package.json`; `npx hyperframes` também funciona dentro da pasta do episódio).

1. **Branch**: `git checkout -b south-academy-epNN main` (depois do PR anterior mesclado).
2. **Projeto**: copie `ep04/` para `epNN/` sem `media/`, `entrega/`, `renders/`,
   `compositions/`, `index.html`; troque `ep04` → `epNN` em `scripts/build.mjs` (default do
   script), `scripts/stems.mjs`, `scripts/verify-entrega.sh`, `meta.json`, `package.json`.
   Em `verify-entrega.sh` ajuste a lista `for cena in gancho telaNN decisao` (uma cena `canto`).
3. **Deck**: `python3 deck/extract-slides.py epNN <telas>`; figuras Gartner: copie
   `deck/img/imgNN.*` para `epNN/assets/fig-NNx.webp` (no EP04, img34–46 → fig-13a…16e;
   `extract-slides.py` imprime o IMG de cada tela). Assets compartilhados (logo, fundos, SFX)
   vêm junto na cópia de `assets/`.
4. **Roteiro** `script/epNN.json` a partir do teleprompter: um `scene` por tela/gancho/decisão,
   um `beat` por linha falada. Campos:
   - topo: `episode`, `series`, `title`, `narrator`, `org`, `timing` (`lineGap` 0.5, `pause` 1.0,
     `pauseLong` 2.5, `sceneLeadIn` 0.6, `sceneTail` 1.2, `speed` 0.85, `slowSpeed` 0.78,
     `beatSlack` — começar com o valor final do episódio anterior, 0.24).
   - scene: `id`, `kind` (`narrator` | `slide` | `sting` | `card`), `avatar` (`full` | `pip`),
     `label`, `beats`; `hold` (segundos) para `sting`/`card`; `optional: true` nos cortes
     opcionais (cena isolada, não removida); `next` no cartão final (teaser do próximo EP).
   - beat: `id`, `say` (texto para o TTS; números por extenso), `cue` (nome que a cena usa),
     `cap` (legenda com `**negrito**`; se ausente usa `say`), `pause` (1.0 ou 2.5),
     `slow: true` nos `[RITMO: lento]`.
   - Escreva o JSON via Python/Node (heredoc com caminho relativo falhou).
5. **TTS**: `<venv>/bin/python scripts/tts.py script/epNN.json media/vo/epNN` (Kokoro,
   voz `pm_alex`, pt-br; pula WAVs já existentes). ~110 beats levam alguns minutos.
   Nunca use `pkill -f` com padrão que case o próprio shell; use `pgrep -f "padrã[o]"`.
6. **Cenas** `scripts/scenes.mjs`: mantenha o cabeçalho (SHARED_CSS/JS, helpers `hide`,
   `enterCurve`, `exitCurve`, `enterPush`, `exitPush`, `arrive`, `waterfall`, `nudge`,
   `countUp`, `press`, `chrome()`, `root()`, `script()`, `FIG_CSS`, `CASE_CSS`,
   `CASE_EXTRA_CSS`, `figScene()`, `caseCard()`) e escreva uma função por cena
   (`SCENES_EPNN.telaNN = ({ cues, dur }) => html`). Regras:
   - textos, números, fontes e estrutura do deck preservados; só a animação é livre;
   - cenas de tela cheia (gancho, decisão): gráficos e legendas em x ≥ 1210
     (o vídeo do Fabio fica em x < 1140); telas: narrador no canto 400×225 em (1472, 807);
   - `figScene(id, {num, crumb, eyebrow, title, img, iw, ih, desc, insights, key, src, zooms,
extra})`: regiões de zoom como frações `[x, y, w, h]`, k ≤ 2,4; regiões de largura total
     não ampliam (use faixas mais estreitas); `zooms[cue] = "fig"` volta ao enquadramento.
   - `caseCard(id, i, {badge, badgeInk, h, g, r, w}, x)`: Ganho / Requer / Atenção.
   - um timeline GSAP pausado por composição em `window.__timelines`.
7. **Build + fidelidade + gate** (antes de qualquer render):
   ```bash
   node scripts/build.mjs                       # timing.json, mixagem, index.html, compositions/
   node scripts/fidelity.mjs /home/user/hyperframes/south-academy/deck epNN "18:tela18,19:tela19,21A:tela21a,..."
   node $CLI lint . && node $CLI check .
   node $CLI snapshot . --at <t>  # cues principais; conferir imagens
   ```
   `fidelity.mjs` exige 0 faltas (ou falta registrada como premissa no plano). Ele compara
   cada `<deck>/epNN_tela_<N>.html` com `compositions/<cena>.html`: toda linha de texto ≥ 12
   caracteres (fora do chrome do deck, prefixos de rótulo, "Clique na imagem…", "Detalhes nas
   notas.") e todo número do slide têm de aparecer na cena (números comparados contra o arquivo
   inteiro, inclusive scripts). Limitações conhecidas: texto cru `<80%` quebra o strip de tags;
   números de `countUp` com sufixo separado não são detectados.
   Duração: leia `script/epNN.timing.json` → `total`; se sair da faixa, ajuste `beatSlack` por
   interpolação linear entre dois builds (EP04: 0,523 → 877 s; 0,24 → 721,9 s).
8. **Render único** (`renders/chain.sh`, em background, ~20 min por MP4 de 12 min):
   ```bash
   VOICE=0 node scripts/build.mjs && node $CLI render . -q looks --quiet -o entrega/epNN-sem-voz.mp4
   node scripts/build.mjs          && node $CLI render . -q looks --quiet -o entrega/epNN-guia.mp4
   node scripts/stems.mjs          # epNN-narracao-kokoro.wav + epNN-sfx.wav
   ```
   Nunca faça commit do `index.html` enquanto o build `VOICE=0` estiver no disco
   (`grep -c 'id="vo"' index.html` tem de dar 1 no commit).
9. **Verificação**: `bash scripts/verify-entrega.sh` (durações vs. timing.json; 2–18 s do
   sem-voz em silêncio −91 dB e guia com fala; 3 frames com a zona do CSV desenhada em
   `entrega/conferencia/`). Olhe os frames.
10. **Entrega**: MP4 divididos em partes ≤ 30 MiB sem reencode
    (`ffmpeg -i x.mp4 -c copy -map 0 -f segment -segment_time 335 -reset_timestamps 1 x-parte%d.mp4`);
    WAV > 30 MiB vira FLAC só para o envio (`ffmpeg -i x.wav -c:a flac x.flac`); os originais
    ficam em `entrega/`. Enviar com SendUserFile. Commit (conventional commits em minúsculas;
    lefthook roda oxfmt/largefiles), push `-u`, PR draft, `subscribe_pr_activity`, atualizar o
    corpo do PR com os números da verificação, **parar e esperar aprovação**.
11. **Plano** em `docs/plans/AAAA-MM-DD-epNN-entrega-capcut.md` com premissas (P1…) e seção
    "Resultado" preenchida no fim (fidelidade, duração, ajustes, verificação).

## 5. Scripts (em `epNN/scripts/`, copiados de episódio em episódio)

| Script              | Função                                                                                                                                                                                                                                                             |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `tts.py`            | um WAV por beat via kokoro-onnx; corta silêncio nas pontas; `--voice`, `--speed`, `--force`                                                                                                                                                                        |
| `build.mjs`         | mede WAVs, calcula timing (lead-in, slack, gaps, pausas, tail), mixa `media/vo/epNN-narration.wav`, gera `index.html`, `compositions/*.html`, legendas, `entrega/epNN-zonas.csv`, `epNN-roteiro-tempos.md`, `sfx-manifest.json`; `VOICE=0` omite `<audio id="vo">` |
| `scenes.mjs`        | templates das cenas (cabeçalho compartilhado + uma função por tela)                                                                                                                                                                                                |
| `fidelity.mjs`      | conferência determinística deck × cenas (ver §4.7)                                                                                                                                                                                                                 |
| `stems.mjs`         | narração cortada no total do episódio + mixagem dos SFX pelo manifesto                                                                                                                                                                                             |
| `verify-entrega.sh` | durações, silêncio, frames com zona                                                                                                                                                                                                                                |
| `renders/chain.sh`  | o ciclo único de render (sem voz → com voz → stems), em background                                                                                                                                                                                                 |

Zonas (CSV): `canto` = 400×225 em (1472, 807); `tela_cheia` = 0,0,1920,1080 com gráficos em
x ≥ 1210. Cada linha: início, fim, modo, x, y, largura, altura.

## 6. Premissas e decisões registradas (válidas para os próximos episódios)

- Ritmo Kokoro 0,85 (0,78 nos `[RITMO: lento]`); gap 0,5 s; pausas 1,0 / 2,5 s; lead-in 0,6 s;
  tail 1,2 s; `beatSlack` ajustado uma vez por episódio para a faixa de duração (EP01 P1).
- Zona tela cheia = 1920×1080 inteiro, gráficos à direita (x ≥ 1210); o Fabio decide cobrir tudo
  ou manter o vídeo dele em x < 1140 (EP01 P2). Canto 400×225 em (1472, 807) (EP01 P3).
- `sem-voz.mp4` é um segundo render com `<audio id="vo">` omitido, não uma edição do guia (EP01 P4).
- Cortes opcionais mantidos como cena isolada (EP02 P2; EP04 P3 para a 16D).
- Telas Gartner: figura à esquerda, zoom nas regiões citadas, nota com descrição, insights e
  "Para levar" (`div.fig-key` do deck) (EP02 achados; EP04 P3).
- Telas de cases: cartões com Ganho / **Requer** / Atenção, 3 números e a pergunta do deck
  (EP02 achados; EP04 P4).
- Cartão de pausa de 5 s quando o teleprompter traz `[EDIÇÃO]` pedindo pausa (EP04 tela 17:
  "Pause o vídeo · 10 min").
- Linha duplicada no teleprompter (EP04 tela 14: "E aqui não é só opinião…") tratada como erro de
  digitação e lida uma vez (EP04 P5). Verifique duplicatas assim nos próximos episódios.
- Fidelidade por script roda **antes do 1º render** (EP03 P5; adotado após o EP02 precisar de
  3 ciclos).
- Crumb do Módulo 1 no vídeo: "Módulo 1 · Aplicações". EP05 abre o **Módulo 2** (tela 18
  divisória): tome o crumb do deck da tela 18.

## 7. Pendências de texto (registradas, não corrigir sem pedido)

Herdadas do EP02 e mantidas no EP03 e no EP04 (premissa P6):

1. Cabeçalho das telas Gartner: o deck traz "Gartner · Casos de uso"; o vídeo usa o crumb
   "Módulo 1 · Aplicações".
2. Sufixo "Detalhes nas notas." nas fontes das telas 07/08 (e equivalentes) não aparece no vídeo
   (não há notas no vídeo).
3. Rótulo "Insights" acima da lista não é exibido (a nota já tem "O que a figura mostra").

O Fabio pediu para **não re-renderizar** episódios aprovados por causa delas.

## 8. Ambiente (o que precisa existir no container)

Checagem rápida:

```bash
ls /home/user/hyperframes/packages/cli/dist/cli.js
/tmp/claude-0/-home-user-hyperframes/d141dd95-4f1f-566a-a8ce-e567935f3fa8/scratchpad/hfopt/bin/python -c "import kokoro_onnx, soundfile, phonemizer"
ls ~/.cache/hyperframes/tts/models/kokoro-v1.0.onnx ~/.cache/hyperframes/tts/voices/voices-v1.0.bin
which whisper-cli && ls ~/.cache/hyperframes/whisper/models/ggml-small.bin
which ffmpeg ffprobe
```

Reinstalação, se algo sumiu:

- **CLI HyperFrames**: `cd /home/user/hyperframes && bun install && bun run build`.
- **Kokoro (TTS)**: o venv ficava no scratchpad da sessão (`…/scratchpad/hfopt`), que pode não
  sobreviver. Recrie em qualquer pasta (por exemplo `~/hfopt`) e aponte `tts.py` por esse Python:
  ```bash
  python3 -m venv ~/hfopt && ~/hfopt/bin/pip install -q kokoro-onnx soundfile phonemizer espeakng-loader onnxruntime numpy
  mkdir -p ~/.cache/hyperframes/tts/models ~/.cache/hyperframes/tts/voices
  curl -L -o ~/.cache/hyperframes/tts/models/kokoro-v1.0.onnx https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx
  curl -L -o ~/.cache/hyperframes/tts/voices/voices-v1.0.bin https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin
  ```
  Versões usadas: kokoro-onnx 0.6.1, onnxruntime 1.31.0, soundfile 0.14.0, phonemizer 3.4.0,
  espeakng-loader 0.2.4. CPU só.
- **whisper.cpp (transcrição, CPU, sem CUDA)** — linhas do setup script já entregues ao Fabio:
  ```bash
  git clone https://github.com/ggml-org/whisper.cpp.git /tmp/whisper.cpp
  cmake -S /tmp/whisper.cpp -B /tmp/whisper.cpp/build -DCMAKE_BUILD_TYPE=Release -DGGML_CUDA=OFF -DWHISPER_BUILD_TESTS=OFF
  cmake --build /tmp/whisper.cpp/build -j
  cmake --install /tmp/whisper.cpp/build --prefix /usr/local && ldconfig
  mkdir -p ~/.cache/hyperframes/whisper/models
  curl -L -o ~/.cache/hyperframes/whisper/models/ggml-small.bin https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-small.bin
  ```
  Modelo escolhido: **ggml-small** (ggml-base trocou "sim" por "assim"; small transcreveu 30 s
  exatos em 10,3 s com 4 threads, ~3× tempo real). Uso:
  `whisper-cli -m ~/.cache/hyperframes/whisper/models/ggml-small.bin -l pt -t 4 -f audio-16k-mono.wav`
  (converter antes com `ffmpeg -ar 16000 -ac 1`). `hyperframes transcribe` usa `small.en` por
  padrão: passe `--model small --language pt`. `hyperframes doctor` encontra o binário em
  `/usr/local/bin/whisper-cli`.

## 9. Armadilhas já encontradas

- Chamadas Bash paralelas trocam o cwd: use sempre caminhos absolutos.
- `/usr/bin/time` não existe; use `date +%s.%N`.
- Reinício do container mata renders em background: confira `renders/chain.log` e `entrega/`;
  um `work-*` ou `.hf-transaction-*` em `entrega/` é resto de render interrompido (apague e refaça
  só a etapa interrompida; no EP04 o guia foi retomado com `renders/chain-guia.sh`).
- Force-push é bloqueado; se precisar rebasear, crie um branch novo a partir do HEAD rebaseado.
- SendUserFile aceita até 30 MiB por arquivo: dividir MP4 com `-c copy -f segment`, WAV grande
  vira FLAC.
- Teleprompter de um episódio pode vir partido em duas mensagens: `docs/teleprompter.md` já está
  inteiro e revisado.
- Zoom com região `[0, y, 1, h]` dá escala 1 (sem zoom).

## 10. Como começar o EP05

1. Confirmar com o Fabio que o EP04 (PR #4) foi aprovado e mesclar antes de criar o branch.
2. `git fetch origin main && git checkout -b south-academy-ep05 origin/main`.
3. Teleprompter: `docs/teleprompter.md`, seção "# EP05 · Preditiva, generativa, nenhuma: a
   pergunta de ouro" (telas 18, 19, 20, 21, 21A, 21B, 22). Deck:
   `python3 deck/extract-slides.py ep05 18 19 20 21 21A 21B 22`.
4. Seguir o §4. Meta de duração = duração do teleprompter ±30 s. EP04 termina com o teaser
   "EP05 · A pergunta de ouro" e a frase "Devagar em quando não usar."; o gancho do EP05 deve
   abrir nesse ponto.
