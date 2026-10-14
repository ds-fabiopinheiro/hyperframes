# EP02 · Onde o valor está escondido — plano

> Execução: superpowers:executing-plans (nativa). Spec: mensagens do Fabio de 2026-10-14 ("Mudança de plano. Sem HeyGen" + "Aprovado. Siga para o EP02").

**Goal:** EP02 com o mesmo padrão do EP01 (5 entregáveis em `south-academy/ep02/entrega/`), duração = teleprompter (11 min) ±30 s, zero HeyGen, render local.

**Restrições novas:** nas cenas de tela cheia, gráficos e legendas fora de x < 1140; snapshots + check antes do render; só re-render se a verificação falhar.

**Premissas**
- P1 Mesmo branch e PR #1 (o PR vira "EP01 + EP02"); scripts do pipeline copiados do EP01 com o nome do episódio parametrizado (sem abstração compartilhada ainda).
- P2 Cortes opcionais 10C, 10D, 10E mantidos, cada um como cena isolada.
- P3 Telas Gartner: figura original do deck em tela cheia à esquerda + nota de insight à direita; `[TELA: zoom em …]` vira zoom/pan na região citada (coordenadas lidas das imagens).
- P4 Ritmo inicial igual ao EP01 (speed 0,85 / slow 0,78 / folga 25 %); ajuste de `beatSlack` só se sair de 630–690 s.

## Tarefas
1. `script/ep02.json`: gancho, vinheta, 06, 07, 08, 09, 09A–09G, 10, 10A–10E, decisão, final; `slow` nos `[RITMO: lento]`. (25 min)
2. Projeto `ep02/`: scripts copiados (ep parametrizado), legendas à direita nas cenas full, 12 figuras em `assets/`. (15 min)
3. `scenes.mjs`: 22 cenas. (90 min)
4. TTS + build + lint + check + snapshots; duração na faixa. (20 min)
5. Renders (sem voz, guia) + stems + `verify-entrega.sh` + commit + PR + entrega; parar. (2 × ~40 min de render em segundo plano)

## Resultado (2026-10-14)
- Duração: 615,6 s com folga 25 % (abaixo da faixa) → `beatSlack` 0,33 → **650,34 s (10m50s)**, dentro de 630–690 s. P4 aplicada uma vez.
- `check`: 2 erros de layout corrigidos (eyebrow da tela06 em fluxo; títulos das telas 09/10 em 54 px para não ficarem sob os cartões), 3 avisos de contraste corrigidos (kicker das notas #B83800, etiqueta do kicker da decisão #C73E00, numeral decorativo da tela06). Overflow do zoom das figuras marcado como intencional (`data-layout-allow-overflow`).
- Snapshots conferidos antes do render: gancho e decisão com gráficos/legendas em x ≥ 1210; telas 06, 09, 09A, 10, 10E.
- Um único ciclo de render (sem voz + guia), conforme a regra de economia.
