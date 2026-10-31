#!/bin/bash
# Verificação dos entregáveis (verification-before-completion):
#  1. durações dos MP4/WAV vs. timing.json
#  2. ep07-sem-voz.mp4 sem narração: trecho só de fala (gancho, 2–18 s) deve ser silêncio
#  3. 3 frames do guia com o retângulo da zona do CSV desenhado por cima
#  4. duração final do guia vs. meta do teleprompter (META ± TOL)
#  5. desde o EP06: o sem-voz sai SEM legendas; um frame do sem-voz no mesmo instante de um frame
#     legendado do guia prova a ausência (par guia × sem-voz em conferencia/legendas-conferencia.png)
set -e
P="$(cd "$(dirname "$0")/.." && pwd)"
E="$P/entrega"
EP=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$P/script/ep07.json','utf8')).episode.toLowerCase())")
TOTAL=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$P/script/$EP.timing.json','utf8')).total)")
dur() { ffprobe -v error -show_entries format=duration -of csv=p=0 "$1"; }
echo "timing.json total: $TOTAL s"
# meta do teleprompter do EP07: "cerca de 12 min" → 720 s ± 30 s
META=720; TOL=30
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
for cena in gancho tela30 decisao; do
  row=$(grep ",$cena," "$E/$EP-zonas.csv")
  IFS=, read -r ini fim modo x y w h _ <<<"$row"
  t=$(node -e "console.log((($ini*1+$fim*1)/2).toFixed(2))")
  out="$E/conferencia/zona-$cena-${modo}-t${t}.png"
  ffmpeg -v error -y -ss "$t" -i "$E/$EP-guia.mp4" -frames:v 1 \
    -vf "drawbox=x=$x:y=$y:w=$w:h=$h:color=lime@0.9:t=6,drawtext=text='$modo $x,$y ${w}x$h  t=${t}s':x=40:y=40:fontsize=36:fontcolor=lime:box=1:boxcolor=black@0.6" "$out"
  echo "$out"
  i=$((i+1))
done
ffmpeg -v error -y -i "$E/conferencia/zona-gancho-"*.png -i "$E/conferencia/zona-tela30-"*.png -i "$E/conferencia/zona-decisao-"*.png \
  -filter_complex "[0][1][2]hstack=inputs=3,scale=1800:-1" "$E/conferencia/zonas-conferencia.png"
echo "sheet: $E/conferencia/zonas-conferencia.png"
echo "--- legendas: guia legendado × sem-voz sem legenda, no mesmo instante"
# instante no meio do 2º beat da primeira tela (narrador no canto, legenda embaixo no guia)
tc=$(node -e "const sc=JSON.parse(require('fs').readFileSync('$P/script/$EP.json','utf8')).scenes.find(s=>s.kind==='slide'&&s.beats&&s.beats.length>1).id;const t=JSON.parse(require('fs').readFileSync('$P/script/$EP.timing.json','utf8'));const s=t.scenes.find(x=>x.id===sc);const b=s.beats[1];console.log((s.start+(b.t+b.end)/2).toFixed(2))")
ffmpeg -v error -y -ss "$tc" -i "$E/$EP-guia.mp4" -frames:v 1 -vf "drawtext=text='guia · com legenda · t=${tc}s':x=40:y=40:fontsize=36:fontcolor=lime:box=1:boxcolor=black@0.6" "$E/conferencia/legenda-guia-t${tc}.png"
ffmpeg -v error -y -ss "$tc" -i "$E/$EP-sem-voz.mp4" -frames:v 1 -vf "drawtext=text='sem-voz · sem legenda · t=${tc}s':x=40:y=40:fontsize=36:fontcolor=lime:box=1:boxcolor=black@0.6" "$E/conferencia/legenda-semvoz-t${tc}.png"
ffmpeg -v error -y -i "$E/conferencia/legenda-guia-t${tc}.png" -i "$E/conferencia/legenda-semvoz-t${tc}.png" -filter_complex "[0][1]hstack=inputs=2,scale=1800:-1" "$E/conferencia/legendas-conferencia.png"
echo "sheet: $E/conferencia/legendas-conferencia.png"
# prova por pixels: a faixa inferior central (zona da legenda) do sem-voz não pode ter o fundo escuro da legenda
node -e "
const {execFileSync}=require('child_process');
const px=(f)=>execFileSync('ffmpeg',['-v','error','-ss','$tc','-i',f,'-frames:v','1','-vf','crop=900:90:510:960,scale=1:1','-f','rawvideo','-pix_fmt','gray','-']).readUInt8(0);
const g=px('$E/$EP-guia.mp4'), s=px('$E/$EP-sem-voz.mp4');
console.log('luminância média da zona da legenda: guia '+g+' (escuro = caixa da legenda), sem-voz '+s+' (claro = fundo da tela) → '+(s-g>40?'OK, sem legenda no sem-voz':'ATENÇÃO: conferir os frames'));"
