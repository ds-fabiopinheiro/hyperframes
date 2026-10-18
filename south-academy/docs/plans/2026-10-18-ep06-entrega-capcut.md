# EP06 · O painel perfeito que estava errado — plano

> Execução: superpowers:executing-plans (nativa). Spec: mensagens do Fabio de 2026-10-18 ("EP05 aprovado … siga para o EP06 no mesmo padrão do HANDOFF.md" e "Ajuste único a partir do EP06 … no epXX-sem-voz.mp4, NÃO renderize a faixa de legendas fixas") + teleprompter EP06 (`docs/teleprompter.md`) + deck (telas 23, 24, 25, 26, 27, 28).

**Goal:** EP06 com os 5 entregáveis em `south-academy/ep06/entrega/`, duração na meta do teleprompter ("cerca de 11 min" → 630–690 s), legendas renderizadas **só no guia** (sem-voz sem legendas, flag no build), fidelidade por script antes do render, um render só, zero HeyGen, sem workflows multi-agente, render local.

**Premissas**
- P1 Branch `south-academy-ep06` a partir de `main` (PR #5 mesclado) → PR #6.
- P2 Mesmo pipeline do EP05; `beatSlack` inicial 0,30 e ajuste por interpolação para 630–690 s.
- P3 Crumb "Módulo 2 · Fundamentos" (crumb do deck nas telas 23–28; não há telas Gartner neste episódio).
- P4 Legendas: `VOICE=0` passa a omitir também `el-captions` (`CAPTIONS=0/1` sobrescreve). O guia mantém as legendas. Verificação ganha o par guia × sem-voz no mesmo instante e uma checagem por luminância da zona da legenda. EP01–EP05 não são re-renderizados.
- P5 Tela 23: quatro cartões + quadro escuro "O teste: representatividade" + cartão do CRO ("o raro é o sinal"). Tela 24: tabela do deck (6 dimensões × relatório/IA) em pares, com "Erros e outliers" em destaque; parábola do navio (painel do capitão × sala de máquinas) em cartão de história; regra "pronto para qual caso de uso?". Tela 25: quatro anéis com os números do deck (60 / 63 / 40 / 14%), um por beat. Tela 26: painel de retenção (8 clientes, colunas do deck) em tela cheia da área útil com narrador no canto, três regras, cartão de pausa de 5 s ("Pause · escolha 3 clientes", conforme `[EDIÇÃO]`), e retomada com Alfa e Beta destacadas. Tela 27: quatro cartões de revelação (Contexto/Beta, Atualização/Alfa, Qualidade/Épsilon, Governança/Alfa + Alfa Serviços) um por vez, faixa "Alfa sai, Beta entra…", painel escuro "Duas das três escolhas mudam", bloco "substitua você por um modelo", quatro causas de gestão, "Debate". Tela 28: três degraus (baixo/médio/alto) com Quando, Exemplos e Controle mínimo; destaque "A IA recomenda. A pessoa decide."
- P6 Pendências de texto herdadas ("Detalhes nas notas.", rótulo "Insights", crumb das telas Gartner) mantidas; não se aplicam a este episódio (sem telas Gartner).
- P7 `[PAUSA LONGA]` do teleprompter = `pauseLong` 2,5 s; `[RITMO: lento]` na revelação (tela 27) e no alto risco (tela 28) com `slow`.

## Tarefas
1. Flag de legendas no `build.mjs` + verificação + HANDOFF. (15 min)
2. `script/ep06.json` + TTS Kokoro. (25 min)
3. `scripts/scenes.mjs` (cabeçalho do EP05 + cenas novas: gancho, 23–28, pausa, decisão, final). (80 min)
4. `fidelity.mjs` (6 slides) + build + lint + check + snapshots; duração na faixa. (25 min)
5. Render único + stems + `verify-entrega.sh` + entrega + commit + PR #6; parar. (2 × ~18 min de render)

## Resultado (2026-10-18)
- Flag de legendas: `build.mjs` com `NO_VOICE`/`CAPTIONS`; conferido nos três modos (com voz: `el-captions` e `vo` presentes; `VOICE=0`: ambos omitidos; `VOICE=0 CAPTIONS=1`: legendas presentes). `verify-entrega.sh` com META=660 e a prova de legenda (par guia × sem-voz + luminância). HANDOFF.md atualizado (regra 5, §4.8, §4.9, tabela de scripts).
- Fidelidade deck × cenas (`fidelity.mjs`, 6 slides): **0 faltas no 1º build**.
- Duração: 539,6 s com folga 0,30 (abaixo da faixa) → 2º build com 0,70 (690,8 s) → interpolação → **`beatSlack` 0,619 → 660,2 s (11m00s)**, meta "cerca de 11 min" (630–690 s). P2 aplicada.
- `lint` 0/0; `check` passou no 1º build sem avisos (contraste 80/80). 57 snapshots nos cues principais conferidos antes do render; nenhum ajuste necessário.
- Render: um único ciclo (sem voz sem legendas 22:58–23:15, guia com legendas 23:15–23:33, stems), sem interrupção.
- Verificação (`verify-entrega.sh`): sem-voz e guia 660,20 s, narração 660,22 s, SFX 660,18 s (timing.json 660,18 s); **duração final × meta do teleprompter: 660,20 s vs 660 s (+0,2 s; faixa 630–690 s) → OK**; trecho 2–18 s do sem-voz em silêncio (−91 dB), guia com fala (−26,5 dB); frames com a zona do CSV (gancho, tela 23 canto, decisão); **legendas: par guia × sem-voz no mesmo instante (t = 41,47 s, 2º beat da tela 23) em `conferencia/legendas-conferencia.png`; luminância da zona da legenda: guia 122 (caixa escura da legenda), sem-voz 255 (fundo claro) → sem legenda no sem-voz**. Correção única no script de verificação: a cena da prova é escolhida pelo `kind` em `script/ep06.json` (o timing.json não carrega `kind`).
- Entrega: sem-voz (16,0 MiB) e guia (25,4 MiB) inteiros, sem divisão; narração (30,2 MiB) e SFX como FLAC só para o envio; originais em `entrega/`.
