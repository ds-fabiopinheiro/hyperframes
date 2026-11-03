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

## Voz (HeyGen) e duração

- 116 beats, 6399 caracteres, um por chamada, sem nenhuma nova tentativa; cerca de 6 s por beat.
- Velocidade mediana da voz: 13,6 caracteres por segundo. Nenhum beat fora do padrão para o tamanho do texto
  (o único destaque foi "Resultado.", uma palavra só).
- Folga ajustada por interpolação entre dois builds (0,3 → 715,75 s; 1,0 → 1066,24 s): 0,548 → 839,91 s.
- Transcrição de conferência (whisper.cpp, ggml-small, pt) de cada beat contra o roteiro: taxa média de erro por
  palavra 0,094; 21 beats acima de 0,20, quase todos por formatação de número do whisper ("9 centavos", "85%").
  Trechos a ouvir: "Agentic Commerce" (tela 37, ouvido como "agente de e-commerce"), "Latência em milissegundos"
  (tela 42, ouvido como "lá tem 100 milissegundos"), "AUC" (tela 42, "Ao C") e "Lê o incidente" (tela 44, "Leu").
- Quadros nos cues com o tempo real da voz (gancho "Juntos", tela 38 "< 1 s", tela 47 "48 → 7", tela 50 "Provado em
  produção"): cada animação cai na fala certa.
- O lint do repositório inteiro (gancho de commit) acusou 14 declarações sem uso nos scenes.mjs do EP02 ao EP08;
  removidas, sem mudar nenhum vídeo (o build do EP08 gerou saída idêntica).

## Render e verificação final

- Render local único (`ep08/renders/render.sh`). O primeiro disparo foi interrompido pelo reinício do container e o
  segundo não passou da sondagem do `ffmpeg` logo após o reinício; o terceiro rodou inteiro (cerca de 24 min). Nenhum
  render completo foi descartado.
- `tools/verify-final.sh ep08 840 30`:
  - composição sem legendas e sem janela do narrador;
  - `ep08.mp4` 839,93 s contra `timing.json` 839,91 s (+0,02 s) e contra a meta de 840 s (−0,1 s; faixa 810–870 s);
  - fala no gancho (2 a 18 s): −21,3 dB; episódio inteiro: −14,3 LUFS, LRA 9,5 LU, pico −1,3 dBFS;
  - provas por pixel: faixa da legenda e canto inferior direito claros em 4 de 5 slides; a exceção é a divisória da
    tela 37 (fundo laranja e painel escuro da capa), como a divisória do EP07;
  - montagem com vinheta, gancho, tela 42, decisão e cartão final conferida.
- Entrega: `entrega/ep08.mp4` (31,3 MiB), dividido sem recodificar em duas partes de cerca de 7 min para o envio.
