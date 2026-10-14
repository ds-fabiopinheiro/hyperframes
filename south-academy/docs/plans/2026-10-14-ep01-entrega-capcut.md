# EP01 · entrega para CapCut (sem HeyGen) — plano

> Execução: superpowers:executing-plans (nativa, nesta sessão). Spec: mensagem do Fabio de 2026-10-14 ("Mudança de plano. Sem HeyGen").

**Goal:** EP01 com duração entre 5m30s e 6m30s, zona reservada limpa para o vídeo do Fabio e os 5 entregáveis em `south-academy/ep01/entrega/`.

**Restrições:** nenhuma chamada à HeyGen (API ou MCP); render local; mudanças cirúrgicas em `build.mjs` e `ep01.json`; `scenes.mjs` intocado.

**Premissas registradas**
- P1 Ritmo: Kokoro a 0,85 da velocidade (0,78 nos beats `[RITMO: lento]`), folga de 25% da fala após cada beat, gap entre linhas 0,5 s. Ajustar uma vez se sair da faixa.
- P2 Zona tela cheia = 1920×1080 inteiro, como no teleprompter. Nos ganchos e na decisão, os gráficos ficam à direita (x ≥ 1210) e o CSV avisa; o Fabio decide cobrir tudo ou manter o vídeo dele em x < 1140.
- P3 Zona canto = 400×225 em (1472, 807), igual ao rascunho aprovado nas telas.
- P4 `ep01-sem-voz.mp4` é um segundo render com o `<audio id="vo">` omitido, não uma edição do guia.

## Tarefas
1. `ep01.json`: `timing.speed`, `timing.slowSpeed`, `timing.beatSlack`; `slow: true` nos 12 beats lentos. (5 min)
2. `tts.py`: ler `speed`/`slowSpeed` do json; `--force` regenerar os 69 WAVs. Verificar: 69 arquivos novos. (4 min)
3. `build.mjs`: folga por beat; zona limpa no narrador (moldura, sem texto); flag `VOICE=0`; escrever `entrega/ep01-zonas.csv`, `entrega/ep01-roteiro-tempos.md`, `entrega/sfx-manifest.json`. Verificar: total entre 330 e 390 s. (20 min)
4. `lint` + `check` passam com 0 erros. (3 min)
5. Renders locais: guia (com voz) e sem-voz; stems: narração WAV e SFX WAV via ffmpeg a partir do manifesto. (2 × ~20 min em segundo plano)
6. Verificação: ffprobe das durações; volume médio do sem-voz num trecho só de fala = silêncio; 3 snapshots com o retângulo do CSV desenhado por cima; `grep` do log de rede = zero chamadas heygen. (10 min)
7. Commit + push + atualizar PR #1; parar e aguardar aprovação. (5 min)
