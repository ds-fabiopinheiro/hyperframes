# Formato final com a voz clonada (branch `south-academy-voz-clonada`)

Data: 2026-11-03. Pedido do Fabio, em quatro mensagens: usar a HeyGen e o clone "Fabio - Voice 2"
em todos os episódios; a regra de proibição da HeyGen é atualizada por autorização expressa dele;
sem o sem-voz nem o guia ("faça direto"); sem legenda renderizada; sem a caixa do vídeo dele; foto
só no cartão inicial, no gancho e no cartão final; branch isolado.

## Premissas

- P1. A autorização cobre só a API de áudio da HeyGen (geração da voz). O MCP da HeyGen, avatar,
  vídeo e render na nuvem continuam proibidos (HANDOFF, regra 1).
- P2. A chave só é usada por variável de ambiente cujo nome o Fabio informa; nunca é lida, impressa
  nem procurada. Nenhuma chamada real à HeyGen foi feita até este plano.
- P3. Piloto no EP08. EP01 a EP07 só são refeitos depois da aprovação do piloto.
- P4. Modelo padrão `heygen-voice-1` (pago, é o padrão da API). `heygen-voice-1-turbo-free` é gratuito
  até 2026-11-30 e aceita clone instantâneo, mas sem garantia de disponibilidade. Escolha do Fabio.
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

## Pendente

- Nome da variável de ambiente da chave e escolha do modelo (P4), com o Fabio.
- `find-voice --save` (confirma "Fabio - Voice 2" e se é clone instantâneo ou profissional).
- EP08 (HANDOFF §10), render único e verificação; depois a refação de EP01 a EP07.
