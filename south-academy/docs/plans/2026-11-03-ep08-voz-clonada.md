# EP08 · Três projetos reais, com o número e a origem (piloto do formato final)

Branch `south-academy-voz-clonada`. Primeiro episódio no formato final (HANDOFF §2A): um único `entrega/ep08.mp4` com
a voz clonada "Fabio - Voice 2" (HeyGen, motor `heygen_voice`), sem legendas renderizadas, sem a caixa do narrador,
foto do Fabio no gancho, na vinheta e no cartão final. Render local único; parar para aprovação no fim.

## Fontes

- Teleprompter: `docs/teleprompter.md`, seção "# EP08" (telas 37 a 50, decisão e cartão final; completa).
- Deck: `deck/ep08_tela_37.html` a `deck/ep08_tela_50.html` (nenhuma figura da Gartner nestas telas).
- Meta de duração: "cerca de 14 min" → 840 s ± 30 s.

## Premissas

- P1. Siglas mantidas como no teleprompter (N1, B2B, LGPD, PCI, AUC, KS, RFP, CFO, NPS, MCP); a voz da HeyGen as lê.
  Por extenso: "ISO vinte e sete mil e um", "episódio seis" (no lugar de EP06) e "junho de dois mil e vinte e seis".
- P2. Telas recriadas só com texto e números do deck. As cenas de tela cheia (gancho e decisão) usam texto da
  narração, como nos episódios anteriores: R$ 0,09 e R$ 510 (também no deck, tela 40), "< 1 s", "nível de
  evidência", "produção, teste, plano", "5 meses no papel, 6 anos na vida real".
- P3. A parábola dos três fornecedores (tela 50) não ganha texto novo na tela: os níveis "Provado em produção",
  "demonstrado em teste" e "planejado" do cartão 6 acendem conforme a narração.
- P4. A pergunta do deck aparece na tela mesmo quando a narração não a lê (telas 42, 47 e 50).
- P5. Crumb do módulo: "Módulo 4 · Cases" (crumb do deck nas telas de corpo).
- P6. Beats lentos (`[RITMO: lento]` e o gancho, marcado "ritmo lento") vão com `speed` 0,9 na API da HeyGen.
- P7. Folga (`beatSlack`) começa em 0,3 e é ajustada por interpolação para cair na meta.

## Testes antes do render (TDD do episódio)

- `tools/validate-script.mjs ep08`: vermelho primeiro (18 cenas sem template), verde depois das cenas (18 cenas, 116 beats).
- `scripts/fidelity.mjs`: 13 de 14 telas na primeira rodada; a tela 50 falhou por uma marcação que separava a vírgula
  ("Provado em produção, demonstrado em teste ou planejado."); corrigida, 14 de 14.
- `hyperframes check`: aviso informativo de título encoberto na tela 47 e sobreposição do título com o "04" na tela 37
  (vista nos quadros); os dois corrigidos.
