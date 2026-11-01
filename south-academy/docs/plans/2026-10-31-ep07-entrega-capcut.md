# EP07 · Carteira, não coleção de pilotos — plano

> Execução: superpowers:executing-plans (nativa). Spec: mensagem do Fabio de 2026-10-31 ("EP06 aprovado. Siga para o EP07 no padrão do HANDOFF.md…") + teleprompter EP07 (`docs/teleprompter.md`, completado nesta sessão) + deck (telas 29, 30, 31, 31A, 32, 33, 34, 35, 36, 36A, 36B, 36C).

**Goal:** EP07 com os 5 entregáveis em `south-academy/ep07/entrega/`, duração na meta do teleprompter ("cerca de 12 min" → 690–750 s), sem-voz sem legendas e guia com legendas, fidelidade por script antes do render, um render só, zero HeyGen, sem workflows multi-agente, render local.

**Premissas**
- P1 Branch `south-academy-ep07` a partir de `main` (PR #6 mesclado) → PR #7.
- P2 Mesmo pipeline do EP06; `beatSlack` inicial 0,45 e ajuste por interpolação para 690–750 s.
- P3 Fonte: o `docs/teleprompter.md` tinha o EP07 truncado na tela 33 (paste original cortado); as telas 34, 35, 36, 36A–36C e a decisão foram recuperadas do histórico da sessão e gravadas no arquivo antes do roteiro. O HANDOFF foi corrigido (EP07 = telas 29–36C).
- P4 Crumb "Módulo 3 · Priorização" (crumb do deck nas telas de corpo; nas quatro telas Gartner o deck traz "Gartner · Casos de uso", pendência de texto 1 mantida).
- P5 Tela 29: divisória do Módulo 3 (número, pergunta, quatro chips). Tela 30: três números (75/40/54%) em cartões à esquerda, dois quadros à direita (critério × debate; maturidade com Engatinhar → Andar → Correr), pergunta. Tela 31: três cartões Defender / Expandir / Transformar com a linha de tempo, pergunta da pizza e cartão do CEO. Tela 31A: figura Gartner com zoom em cada degrau e nas caixas de competências. Tela 32: três linhas de mix (barras empilhadas 80/15/5, 40/50/10, 20/40/40), perguntas "está × finge". Tela 33: tabela da régua de valor (3 critérios × 1/3/5) e faixa "média dos três" + exigência do número. Tela 34: tabela da régua de viabilidade (5 critérios) e faixa do risco bloqueante + cadeira do CRO (três vetos). Tela 35: matriz 2×2 (Preparar melhor / Iniciar / Adiar), parábola da seguradora em cartão de história (valor 5 × viabilidade 2; laudo 3 × 5), quatro regras, pergunta. Tela 36: seis cartões de checagem com os números do deck. Telas 36A–36C: figuras Gartner com zoom nos passos / camadas / princípios. Decisão: uma ideia com número; cartão South com as três formas; teaser EP08.
- P6 Pendências de texto herdadas mantidas (crumb Gartner, "Detalhes nas notas.", rótulo "Insights").
- P7 `[RITMO: números lentos]` na tela 30 e `[RITMO: lento]` na cláusula do veto (tela 34) com `slow`; `[RITMO: cadenciado]`/`[RITMO: checklist]` como ritmo normal, um item por beat.

## Tarefas
1. Recuperar o teleprompter, corrigir `docs/teleprompter.md` e HANDOFF; `script/ep07.json` + TTS. (30 min)
2. `scripts/scenes.mjs` (cabeçalho do EP06 + cenas novas: gancho, 29–36, 4 figuras, decisão, final). (90 min)
3. `fidelity.mjs` (12 slides) + build + lint + check + snapshots; duração na faixa. (25 min)
4. Render único + stems + `verify-entrega.sh` (META=720, cena canto tela30, prova de legenda) + entrega + commit + PR #7; parar. (2 × ~20 min de render)

## Resultado (2026-10-31)
- Fonte: EP07 recuperado por inteiro (telas 34–36C e decisão vinham truncadas no `docs/teleprompter.md`); arquivo e HANDOFF corrigidos antes do roteiro. P3 aplicada.
- Fidelidade deck × cenas (`fidelity.mjs`, 12 slides): 1 falta no 1º build (rótulos do eixo Y da matriz na ordem "Valor baixo / Valor alto" do deck) → corrigida → **12/12**.
- Duração: 632,3 s com folga 0,45 (abaixo da faixa) → 2º build com 0,75 (749,8 s) → interpolação → **`beatSlack` 0,674 → 720,0 s (12m00s)**, meta "cerca de 12 min" (690–750 s). P2 aplicada.
- `lint` 0/0; `check` com 2 avisos de layout (carimbo do gancho sobre o rótulo do cartão; título da tela 32 em duas linhas sobre o subtítulo) e 3 de contraste (chips laranja da tela 34) → três ajustes de CSS antes do render → **check sem erros nem avisos (contraste 92/92)**. 64 + 3 snapshots nos cues principais conferidos antes do render.
- Render: um único ciclo (sem voz sem legendas 22:16–22:38, guia com legendas 22:38–23:00, stems), sem interrupção.
- Verificação (`verify-entrega.sh`): sem-voz e guia 720,00 s, narração 720,04 s, SFX 719,98 s (timing.json 719,98 s); **duração final × meta do teleprompter: 720,00 s vs 720 s (+0,0 s; faixa 690–750 s) → OK**; trecho 2–18 s do sem-voz em silêncio (−91 dB), guia com fala (−25,7 dB); frames com a zona do CSV (gancho, tela 30 canto, decisão); **legendas: par guia × sem-voz no mesmo instante (2º beat da tela 30, fundo claro) em `conferencia/legendas-conferencia.png`; luminância da zona da legenda: guia 83 (caixa escura), sem-voz 255 (fundo claro) → sem legenda no sem-voz**. Ajuste único no script de verificação: a prova passou a usar a cena "canto" da lista de zonas (na primeira rodada a cena escolhida era a divisória laranja, onde a luminância de fundo é baixa e a checagem avisou "conferir os frames"; o par da divisória também mostra o sem-voz sem legenda).
- Entrega: sem-voz inteiro (23,6 MiB); guia em 2 partes sem reencode (17,7 + 15,9 MiB); narração e SFX como FLAC só para o envio; originais em `entrega/`.
