# EP03 · O problema não é a ferramenta — plano

> Execução: superpowers:executing-plans (nativa). Spec: mensagem do Fabio de 2026-10-15 ("EP02 aprovado … siga para o EP03 no mesmo padrão do EP02") + teleprompter EP03 + deck (telas 11, 11A–11G, 12, 12A–12G).

**Goal:** EP03 com os 5 entregáveis em `south-academy/ep03/entrega/`, duração do teleprompter (cerca de 11 min → 630–690 s), zero HeyGen, render local, conferência de fidelidade com o deck **antes** do 1º render, sem workflows multi-agente.

**Premissas**
- P1 Branch `south-academy-ep03` a partir de `main` (PR #2 mesclado) → PR #3.
- P2 Mesmo pipeline do EP02 (scripts copiados com `ep03`); `beatSlack` inicial 0,33 (valor final do EP02); ajuste só se sair de 630–690 s.
- P3 Corte opcional 12F mantido como cena isolada. Telas Gartner (11A–11G, 12A–12G): figura à esquerda com zoom nas regiões citadas (`[TELA: …]`), nota à direita com desc, insights e "Para levar" do deck.
- P4 Cartões das telas 11 e 12 com Ganho, Requer e Atenção do deck; 3 números de cada tela; pergunta do deck.
- P5 Fidelidade: `scripts/fidelity.mjs` (determinístico) compara cada slide do deck com a composição gerada: todas as linhas de texto (≥ 12 caracteres, fora do chrome do deck) e todos os números/percentuais do slide têm de aparecer na cena. Roda depois do `build` e antes do `check`; só renderiza com 0 faltas (ou falta registrada como premissa).
- P6 Pendências de texto do EP02 (crumb, "Detalhes nas notas.", rótulo "Insights") valem aqui também: crumb do vídeo continua "Módulo 1 · Aplicações"; sem o sufixo de notas; rótulo "Insights" não é exibido.

## Tarefas
1. `script/ep03.json` (gancho, vinheta, 11, 11A–11G, 12, 12A–12G, decisão, final; `slow` em `[RITMO: lento]`; cues por `[TELA: …]`) + TTS Kokoro. (30 min)
2. `scripts/scenes.mjs` (cabeçalho + figScene/caseCard do EP02; cenas novas). (60 min)
3. `scripts/fidelity.mjs` + build + lint + check + snapshots; duração na faixa. (25 min)
4. Render único (sem voz, guia) + stems + `verify-entrega.sh` + partes ≤ 30 MiB + commit + PR #3 + entrega; parar para aprovação. (2 × ~17 min de render)

## Resultado (2026-10-15)
- Fidelidade deck × cenas (`scripts/fidelity.mjs`, 16 slides): **0 faltas no 1º build** (linhas de texto e números). Rodado antes do `check` e do render.
- Duração: 581,6 s com folga 0,33 (abaixo da faixa) → folga calculada por interpolação linear (0,48 → 642,6 s) → **`beatSlack` 0,523 → 660,05 s (11m00s)**, dentro de 630–690 s. P2 aplicada.
- `check`: passou no 1º build (0 erros de layout; aviso de contraste só no numeral decorativo). 25 snapshots nos cues principais conferidos antes do render: gancho e decisão com gráficos em x ≥ 1210; cartões com Ganho/Requer/Atenção; zooms 11A, 11B, 11D, 11F, 12B, 12G; parábola e embed da 11D; citação, embed e quadro "83%" da tela12.
- Render: um único ciclo (sem voz + guia).
- Render único verificado (`verify-entrega.sh`): MP4 sem voz e guia 660,07 s, narração 660,05 s, SFX 660,05 s; trecho 2–18 s do sem-voz em silêncio (−91 dB), guia com fala (−25,7 dB); frames com a zona do CSV (gancho, tela11, decisão) e 7 frames das cenas principais em `entrega/conferencia/`. Entrega: MP4 em 2 partes sem reencode (corte em keyframe a 337,8 s); narração enviada em FLAC (o WAV de 31,7 MB passa do limite de envio por 225 KB; o WAV fica em `entrega/`).
- Pendências de texto herdadas do EP02 (crumb, "Detalhes nas notas.", rótulo "Insights") mantidas como premissa P6.
