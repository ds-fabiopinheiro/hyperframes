#!/bin/bash
# Verificação dos entregáveis (verification-before-completion):
#  1. durações dos MP4/WAV vs. timing.json
#  2. ep05-sem-voz.mp4 sem narração: trecho só de fala (gancho, 2–18 s) deve ser silêncio
#  3. 3 frames do guia com o retângulo da zona do CSV desenhado por cima
set -e
P="$(cd "$(dirname "$0")/.." && pwd)"
E="$P/entrega"
EP=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$P/script/ep05.json','utf8')).episode.toLowerCase())")
TOTAL=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$P/script/$EP.timing.json','utf8')).total)")
dur() { ffprobe -v error -show_entries format=duration -of csv=p=0 "$1"; }
echo "timing.json total: $TOTAL s"
# meta do teleprompter do EP05: "cerca de 7 min" → 420 s ± 30 s
META=420; TOL=30
FINAL=$(dur "$E/$EP-guia.mp4")
node -e "const f=$FINAL,m=$META,t=$TOL;const d=f-m;console.log('duração final vs meta do teleprompter: '+f.toFixed(2)+' s vs '+m+' s ('+(d>=0?'+':'')+d.toFixed(1)+' s; faixa '+(m-t)+'–'+(m+t)+' s) → '+(Math.abs(d)<=t?'OK':'FORA DA FAIXA'))"
for f in "$E/$EP-sem-voz.mp4" "$E/$EP-guia.mp4" "$E/$EP-narracao-kokoro.wav" "$E/$EP-sfx.wav"; do
  printf "%-32s %s s\n" "$(basename "$f")" "$(dur "$f")"
done
echo "--- volume médio em 2–18 s (gancho, sem SFX): sem-voz deve ser silêncio (-91 dB), guia deve ter fala"
for f in "$E/$EP-sem-voz.mp4" "$E/$EP-guia.mp4"; do
  printf "%-32s " "$(basename "$f")"
  ffmpeg -v info -ss 2 -t 16 -i "$f" -af volumedetect -f null - 2>&1 | grep -oE "mean_volume: [-0-9.]+ dB"
done
echo "--- frames com a zona do CSV sobreposta"
mkdir -p "$E/conferencia"
i=0
# uma linha do CSV por modo: tela_cheia (gancho), canto (tela11), tela_cheia (decisao)
for cena in gancho tela19 decisao; do
  row=$(grep ",$cena," "$E/$EP-zonas.csv")
  IFS=, read -r ini fim modo x y w h _ <<<"$row"
  t=$(node -e "console.log((($ini*1+$fim*1)/2).toFixed(2))")
  out="$E/conferencia/zona-$cena-${modo}-t${t}.png"
  ffmpeg -v error -y -ss "$t" -i "$E/$EP-guia.mp4" -frames:v 1 \
    -vf "drawbox=x=$x:y=$y:w=$w:h=$h:color=lime@0.9:t=6,drawtext=text='$modo $x,$y ${w}x$h  t=${t}s':x=40:y=40:fontsize=36:fontcolor=lime:box=1:boxcolor=black@0.6" "$out"
  echo "$out"
  i=$((i+1))
done
ffmpeg -v error -y -i "$E/conferencia/zona-gancho-"*.png -i "$E/conferencia/zona-tela19-"*.png -i "$E/conferencia/zona-decisao-"*.png \
  -filter_complex "[0][1][2]hstack=inputs=3,scale=1800:-1" "$E/conferencia/zonas-conferencia.png"
echo "sheet: $E/conferencia/zonas-conferencia.png"
