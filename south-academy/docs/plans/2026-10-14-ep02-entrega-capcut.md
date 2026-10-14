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
- Verificação do 1º render (`verify-entrega.sh` + varredura de 13 frames) achou 2 defeitos: kicker "South · onde a South entra" nunca revelado na decisão (`hide(".kick")` pegava os dois cartões) e 2ª linha do subtítulo da tela07 sob os cartões. Corrigidos (reveal só de `#d-kick`; subtítulo 25 px / 1720 px), `check` repassou e um 2º ciclo de render foi feito — o único re-render do episódio.
- Verificação de fidelidade deck × cenas (workflow: 1 agente por slide, 2 céticos por achado; sem Chrome, só leitura). Achados aplicados: linhas **Requer:** dos 6 cartões das telas 09 e 10 (estavam ausentes); frase **"Para levar"** (`div.fig-key`) das 12 figuras Gartner, agora na nota de insight; 3º insight da 10B trocado pela frase do deck ("Preço e novos públicos aparecem bem abaixo."; o "3 a 5 vezes" vinha do teleprompter, não do slide). Não aplicados (premissa registrada): crumb "Módulo 1 · Aplicações" no lugar de "Gartner · Casos de uso"; sufixo "Detalhes nas notas." das fontes das telas 07/08 (não há notas no vídeo); rótulo "Insights" acima da lista (a nota já tem o rótulo "O que a figura mostra").
- Esses achados exigiram um 3º ciclo de render (o 2º já estava verificado quando a fidelidade foi checada; nos próximos episódios a checagem de fidelidade roda antes do 1º render).
- 3º render verificado (`verify-entrega.sh`): MP4 sem voz e guia 650,37 s, narração 650,41 s, SFX 650,34 s; trecho 2–18 s do sem-voz em silêncio (−91 dB), guia com fala (−26 dB); frames com a zona do CSV (gancho, tela09, decisão) e frames das cenas corrigidas em `entrega/conferencia/`. Entrega: MP4 divididos em 2 partes sem reencode (`-c copy`, corte em keyframe ~331,5 s) para caber no limite de envio; o arquivo inteiro fica em `entrega/`.
- PR #1 foi mesclado durante o EP02; a branch `south-academy-ep01` no remoto ficou com um commit extra (d3f1ff4, mesmo conteúdo de f7858f2) que não pôde ser reescrito; o EP02 segue em `south-academy-ep02` → PR #2.
