# EP04 · Jurídico, Pessoas, Atendimento: onde a IA não decide — plano

> Execução: superpowers:executing-plans (nativa). Spec: mensagem do Fabio de 2026-10-16 ("EP03 aprovado … siga para o EP04 no mesmo padrão do EP03") + teleprompter EP04 + deck (telas 13, 13A–13D, 14, 14A–14D, 15, 16, 16A–16E, 17).

**Goal:** EP04 com os 5 entregáveis em `south-academy/ep04/entrega/`, duração do teleprompter (cerca de 12 min → 690–750 s), legendas renderizadas no vídeo como nos anteriores, fidelidade por script antes do render, um render só, zero HeyGen, sem workflows multi-agente, render local.

**Premissas**
- P1 Branch `south-academy-ep04` a partir de `main` (PR #3 mesclado) → PR #4.
- P2 Mesmo pipeline do EP03 (`beatSlack` inicial 0,523; ajuste por interpolação se sair de 690–750 s).
- P3 Corte opcional 16D mantido como cena isolada. Telas Gartner (13A–13D, 14A–14D, 16A–16E) com figura à esquerda, zoom nas regiões citadas e nota com desc, insights e "Para levar".
- P4 Telas 13, 14 e 15: cartões com Ganho, Requer e Atenção, 3 números e pergunta do deck. Tela 16: cinco padrões em cartões + quadro escuro "Na prática". Tela 17: tabela do mapa de oportunidades com a linha de exemplo revelada coluna a coluna, seguida de um cartão de pausa de 5 s ("Pause o vídeo · 10 min"), conforme `[EDIÇÃO]`.
- P5 O teleprompter repete a linha "E aqui não é só opinião: é LGPD, é risco trabalhista, é reputação." (tela 14); tratada como erro de digitação e lida uma vez.
- P6 Pendências de texto herdadas (crumb, "Detalhes nas notas.", rótulo "Insights") mantidas.

## Tarefas
1. `script/ep04.json` + TTS Kokoro. (30 min)
2. `scripts/scenes.mjs` (cabeçalho do EP03 + cenas novas: gancho, 13, 14, 15, 16, 17, pausa, decisão, final, 13 figuras). (70 min)
3. `fidelity.mjs` (18 slides) + build + lint + check + snapshots; duração na faixa. (25 min)
4. Render único + stems + `verify-entrega.sh` + partes ≤ 30 MiB + commit + PR #4 + entrega; parar. (2 × ~18 min de render)

## Resultado (2026-10-16)
- Fidelidade deck × cenas (`fidelity.mjs`, 18 slides): **0 faltas no 1º build**.
- Duração: 877,0 s com folga 0,523 (acima da faixa) → interpolação (0,25 → 727,3 s) → **`beatSlack` 0,24 → 721,9 s (12m02s)**, dentro de 690–750 s. P2 aplicada.
- `check`: passou no 1º build; 34 snapshots nos cues principais conferidos antes do render. Ajuste único antes do render: três zooms (14B, 14C, 16E) com região de largura total não ampliavam; regiões estreitadas.
- Render: um único ciclo (sem voz + guia).
- Render interrompido pelo reinício do container durante o guia (sem-voz já completo); o guia foi retomado com `renders/chain-guia.sh` (só render guia + stems), sem refazer o sem-voz. Continua um ciclo único.
- Verificação (`verify-entrega.sh`): sem-voz e guia 721,87 s, narração 721,92 s, SFX 721,86 s (timing.json 721,86 s); trecho 2–18 s do sem-voz em silêncio (−91 dB), guia com fala (−25 dB); frames com a zona do CSV (gancho tela cheia, tela 13 canto, decisão tela cheia) em `entrega/conferencia/`, mais uma montagem com um frame por cena (`entrega/conferencia/cenas/montagem.png`).
- Entrega: sem-voz em 2 partes e guia em 3 partes sem reencode (`-c copy -f segment`), narração e SFX como FLAC só para o envio; originais em `entrega/`.
- Handoff do projeto em `south-academy/HANDOFF.md` (com `docs/teleprompter.md` e `deck/`).
