# Formato final com a voz clonada (branch `south-academy-voz-clonada`)

Data: 2026-11-03. Pedido do Fabio, em quatro mensagens: usar a HeyGen e o clone "Fabio - Voice 2"
em todos os episódios; a regra de proibição da HeyGen é atualizada por autorização expressa dele;
sem o sem-voz nem o guia ("faça direto"); sem legenda renderizada; sem a caixa do vídeo dele; foto
só no cartão inicial, no gancho e no cartão final; branch isolado.

## Premissas

- P1. A autorização cobre só a API de áudio da HeyGen (geração da voz). O MCP da HeyGen, avatar,
  vídeo e render na nuvem continuam proibidos (HANDOFF, regra 1).
- P2. A chave é um segredo de rede do ambiente: o proxy a aplica nas chamadas para `api.heygen.com` e
  a sessão nunca a vê. Ela nunca é lida, impressa nem procurada. (Eu tinha assumido uma variável de
  ambiente; o Fabio cadastrou como segredo, e a ferramenta passou a suportar isso: `key_source: proxy`.)
- P3. Piloto no EP08. EP01 a EP07 só são refeitos depois da aprovação do piloto.
- P4. "Fabio - Voice 2" está no catálogo geral de vozes clonadas pelo app, não nos clones de modelo.
  O `speak` usa `POST /v3/voices/speech` com o motor `heygen_voice` (a voz aceita `starfish`, `orca`
  e `elevenlabs`, sem motor padrão salvo). O modelo `heygen-voice-1` só vale para clones de modelo.
- P5. Beats em Opus 128 kbps no git, porque o WAV de 44,1 kHz passa do limite de 500 KB do hook.
- P6. A decisão não leva foto (o Fabio listou cartão inicial, gancho e cartão final); a coluna de
  gráficos é centralizada na tela, já que a metade esquerda ficou sem o vídeo.
- P7. Os `scenes.mjs` dos episódios não mudam. O `tools/build.mjs` injeta o fundo escuro, a foto e o
  deslocamento da decisão nas cenas de ids fixos (`gancho`, `vinheta`, `decisao`, `final`).

## O que foi feito

- `tools/heygen-tts.mjs`, `voz.json`, `tools/test-heygen-tts.mjs`: voz por beat, cache, nova tentativa
  em 429/500/503, `atempo` 0,9 nos beats lentos, corte de silêncio, Opus, `heygen-meta.json` com
  `X-Request-Id`. A chave vai só no cabeçalho das chamadas à API; o WAV é baixado sem ela.
- `tools/build.mjs`: build único sem legendas e sem janela do narrador; aceita beats `.opus` (prioridade)
  ou `.wav`; falha se as taxas de amostragem dos beats diferirem.
- `tools/verify-final.sh`: composição, duração contra `timing.json` e contra a meta, fala no gancho,
  loudness, cinco quadros, provas por pixel em até cinco slides.
- `brand/fabio.webp` (105 KB) a partir da foto enviada.

## Resultado dos testes (sem render completo e sem chamar a HeyGen)

- Teste offline do `heygen-tts.mjs` contra servidor falso: passou (8 chamadas falsas; chave nunca enviada
  ao host do arquivo; nova rodada sem chamadas; texto mudado refaz só o beat; `--force` refaz todos;
  variável ausente dá erro claro).
- Cópia do EP07 com o build novo e os beats da Kokoro: `lint` 0 erros e 0 avisos; `check` sem erros
  nem avisos (layout 0 problemas, movimento 0, contraste 90 de 90). Duração 719,98 s, igual ao
  `timing.json` do EP07.
- Os 92 beats do EP07 convertidos para Opus ocupam 7,0 MB (51 MB em WAV) e dão a mesma duração.
- Quadros conferidos: gancho com foto à esquerda; vinheta e cartão final com a foto no painel escuro
  da direita; slides sem a caixa do canto; decisão com a coluna centralizada.
- `verify-final.sh` contra os MP4 antigos do EP07: o sem-voz antigo passa na prova da legenda e falha
  na do canto; o guia antigo falha nas duas; ambos mostram duração 720,00 s contra a meta de 720 s.

## Teste real com a voz do Fabio (2026-11-03, único uso real da HeyGen até aqui)

- `find-voice`: modelo 0 vozes; catálogo 2 vozes clonadas, uma "Fabio - Voice 2" (português).
- `speak` de três beats do EP07 (156 caracteres) com o motor `heygen_voice`: 4,4 s, 3,3 s e 3,4 s.
  O Fabio recebeu a amostra (12 s) para ouvir.
- Um primeiro `speak` sem motor falhou em `400 invalid_parameter` e não gerou nada.

## Pendente

- O Fabio ouvir a amostra e aprovar a voz.
- EP08 (HANDOFF §10), render único e verificação; depois a refação de EP01 a EP07.
