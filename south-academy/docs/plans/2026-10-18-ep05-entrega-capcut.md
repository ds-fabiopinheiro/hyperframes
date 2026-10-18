# EP05 · Preditiva, generativa, nenhuma: a pergunta de ouro — plano

> Execução: superpowers:executing-plans (nativa). Spec: mensagem do Fabio de 2026-10-18 ("EP04 aprovado … siga para o EP05 no mesmo padrão do EP04, conforme o HANDOFF.md") + teleprompter EP05 (`docs/teleprompter.md`) + deck (telas 18, 19, 20, 21, 21A, 21B, 22).

**Goal:** EP05 com os 5 entregáveis em `south-academy/ep05/entrega/`, duração na meta do teleprompter ("cerca de 7 min" → 390–450 s), legendas renderizadas no vídeo, fidelidade por script antes do render, um render só, zero HeyGen, sem workflows multi-agente, render local.

**Premissas**
- P1 Branch `south-academy-ep05` a partir de `main` (PR #4 mesclado) → PR #5.
- P2 Mesmo pipeline do EP04 (`beatSlack` inicial 0,24; ajuste por interpolação se sair de 390–450 s). O EP05 tem menos beats (cerca de 56) que o EP04; a folga provavelmente sobe para caber na meta de 7 min.
- P3 Crumb do vídeo neste módulo: "Módulo 2 · Fundamentos" (é o crumb do deck nas telas 19–22; nas telas Gartner 21A/21B o deck traz "Gartner · Casos de uso", pendência de texto 1 mantida).
- P4 Tela 18 (divisória) no estilo da tela 06 do EP02 (fundo laranja, número do módulo, quatro chips). Tela 19: tabela do deck (6 linhas × preditiva/generativa) revelada por coluna, linha "Limite" em destaque; cartão lateral com a frase do CRO. Tela 20: três cartões numerados + faixa "nenhuma IA" + pergunta. Tela 21: fluxo Detectar → Interpretar → Decidir seguindo as setas; chips PLD/sinistro/chargeback; faixa "a camada que lê o contexto". Telas 21A/21B: figura + nota, zoom na linha 5 (21A) e nos blocos preditiva/prescritiva e generativa (21B). Tela 22: cinco linhas ✕/✓ do deck uma por vez; parábola da fintech em cartão de história; painel escuro "Pergunta de ouro".
- P5 Pendências de texto herdadas (sufixo "Detalhes nas notas.", rótulo "Insights", crumb das telas Gartner) mantidas.
- P6 `[RITMO: cadenciado]` da tela 22 tratado como ritmo normal com uma linha por beat (sem `slow`); `[RITMO: lento]` na linha "Limite" (tela 19) e na pergunta de ouro (tela 22) com `slow`.

## Tarefas
1. `script/ep05.json` + TTS Kokoro. (20 min)
2. `scripts/scenes.mjs` (cabeçalho do EP04 + cenas novas: gancho, 18, 19, 20, 21, 22, decisão, final, 2 figuras). (60 min)
3. `fidelity.mjs` (7 slides) + build + lint + check + snapshots; duração na faixa. (20 min)
4. Render único + stems + `verify-entrega.sh` (inclui duração final × meta do teleprompter) + partes ≤ 30 MiB + commit + PR #5 + entrega; parar. (2 × ~11 min de render)

## Resultado (2026-10-18)
- Fidelidade deck × cenas (`fidelity.mjs`, 7 slides): **0 faltas no 1º build**.
- Duração: 334,6 s com folga 0,24 (abaixo da faixa) → 2º build com 0,60 (420,9 s) → interpolação → **`beatSlack` 0,596 → 420,0 s (7m00s)**, meta "cerca de 7 min" (390–450 s). P2 aplicada: a folga subiu porque o episódio tem 56 beats.
- `lint` 0/0; `check` passou no 1º build (1 info de layout: títulos de 21A/21B em duas linhas invadindo a figura → fonte 44 px e largura 1720 px; 1 aviso de contraste no carimbo "COISA ANTIGA" do gancho, amostrado no meio da animação de escala: branco sobre vermelho escuro, legível). 44 snapshots nos cues principais conferidos antes do render.
- `verify-entrega.sh` passa a imprimir a duração final do guia contra a meta do teleprompter (420 s ± 30 s), conforme pedido.
- Render: um único ciclo (sem voz 22:05–22:18, guia 22:18–22:30, stems), sem interrupção.
- Verificação (`verify-entrega.sh`): sem-voz e guia 420,00 s, narração 420,01 s, SFX 419,99 s (timing.json 419,99 s); **duração final × meta do teleprompter: 420,00 s vs 420 s (+0,0 s; faixa 390–450 s) → OK**; trecho 2–18 s do sem-voz em silêncio (−91 dB), guia com fala (−25,5 dB); frames com a zona do CSV (gancho tela cheia, tela 19 canto, decisão tela cheia) e montagem com um frame por cena em `entrega/conferencia/`.
- Entrega: sem-voz (19,0 MiB) e guia (24,1 MiB) inteiros, sem divisão; narração WAV (19,2 MiB) inteira; SFX como FLAC só para o envio; originais em `entrega/`.
