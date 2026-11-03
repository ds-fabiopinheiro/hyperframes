#!/bin/bash
# Verificação do vídeo final de um episódio (formato único com a voz clonada, a partir de 2026-11-03).
#
#   south-academy/tools/verify-final.sh south-academy/ep08 <META em segundos> [TOL=30]
#
#  1. composição: sem legendas e sem janela do narrador (index.html e compositions/)
#  2. duração do MP4 vs timing.json e vs meta do teleprompter (META ± TOL)
#  3. áudio: fala presente no gancho (2–18 s), volume médio e loudness integrado
#  4. quadros: vinheta, gancho, um slide, decisão e cartão final em entrega/conferencia/
#  5. provas por pixel num slide: faixa da legenda e canto inferior direito sem caixa escura
set -e
P="$(cd "$1" && pwd)"
META="${2:?uso: verify-final.sh <pasta-do-episodio> <meta-em-segundos> [tolerancia]}"
TOL="${3:-30}"
EP="${EPNAME:-$(basename "$P")}"
E="$P/entrega"
V="$E/$EP.mp4"
C="$E/conferencia"
mkdir -p "$C"
[ -f "$V" ] || { echo "falta $V"; exit 1; }
dur() { ffprobe -v error -show_entries format=duration -of csv=p=0 "$1"; }
TIMING="$P/script/$EP.timing.json"
TOTAL=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$TIMING','utf8')).total)")

echo "--- 1. composição"
bad=0
for pat in el-captions el-narrator nar-win; do
  n=$(grep -c "$pat" "$P/index.html" || true)
  [ "$n" = "0" ] || { echo "ATENÇÃO: index.html contém $pat"; bad=1; }
done
for f in captions narrator; do
  [ ! -f "$P/compositions/$f.html" ] || { echo "ATENÇÃO: compositions/$f.html existe"; bad=1; }
done
[ "$bad" = "0" ] && echo "OK: sem legendas e sem janela do narrador"

echo "--- 2. duração"
FINAL=$(dur "$V")
echo "timing.json: $TOTAL s · $EP.mp4: $FINAL s"
node -e "
const f=$FINAL,t=$TOTAL,m=$META,tol=$TOL;
console.log('MP4 vs timing.json: '+(f-t>=0?'+':'')+(f-t).toFixed(2)+' s → '+(Math.abs(f-t)<=0.5?'OK':'ATENÇÃO'));
const d=f-m;console.log('duração final vs meta do teleprompter: '+f.toFixed(2)+' s vs '+m+' s ('+(d>=0?'+':'')+d.toFixed(1)+' s; faixa '+(m-tol)+'–'+(m+tol)+' s) → '+(Math.abs(d)<=tol?'OK':'FORA DA FAIXA'))"

echo "--- 3. áudio"
printf "fala no gancho (2–18 s): "
ffmpeg -nostdin -v info -ss 2 -t 16 -i "$V" -af volumedetect -f null - 2>&1 | grep -oE "mean_volume: [-0-9.]+ dB" | tr '\n' ' '
M=$(ffmpeg -nostdin -v info -ss 2 -t 16 -i "$V" -af volumedetect -f null - 2>&1 | grep -oE "mean_volume: [-0-9.]+" | grep -oE "[-0-9.]+$")
node -e "console.log(($M)>-45?'→ OK, há fala':'→ ATENÇÃO: trecho quase mudo')"
printf "episódio inteiro: "
ffmpeg -nostdin -v info -i "$V" -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I:|LRA:|Peak:)" | tr -s ' ' | tr '\n' ' '
echo

echo "--- 4. quadros"
# 5 instantes de cena + até 5 slides espaçados (beat do meio) para as provas por pixel
node -e "
const t=JSON.parse(require('fs').readFileSync('$TIMING','utf8'));
const by=(id)=>t.scenes.find(x=>x.id===id);
const mid=(s,k)=>{const b=s.beats[Math.min(k,s.beats.length-1)];return +(s.start+(b.t+b.end)/2).toFixed(2)};
const slides=t.scenes.filter(s=>/^tela/.test(s.id)&&s.beats.length>2);
const n=Math.min(5,slides.length);
const chosen=Array.from({length:n},(_,i)=>slides[Math.floor(i*slides.length/n)]);
const mids=chosen.map(s=>[s.id,mid(s,1)]);
const pick=[['vinheta',by('vinheta').start+1.8],['gancho',mid(by('gancho'),2)],['slide-'+mids[Math.floor(n/2)][0],mids[Math.floor(n/2)][1]],['decisao',by('decisao').start+by('decisao').dur*0.3],['final',by('final').start+by('final').dur-1.5]];
console.log('PICK '+pick.map(([a,b])=>a+':'+b).join(' '));
console.log('SLIDES '+mids.map(([a,b])=>a+':'+b).join(' '));
" > /tmp/vf-picks.$$
PICKS=$(grep '^PICK ' /tmp/vf-picks.$$ | cut -d' ' -f2-)
SLIDES=$(grep '^SLIDES ' /tmp/vf-picks.$$ | cut -d' ' -f2-)
for kv in $PICKS; do
  n="${kv%%:*}"; tt="${kv##*:}"
  ffmpeg -nostdin -v error -y -ss "$tt" -i "$V" -frames:v 1 -vf "drawtext=text='$n t=${tt}s':x=24:y=24:fontsize=34:fontcolor=lime:box=1:boxcolor=black@0.6" "$C/q-$n.png"
  echo "$C/q-$n.png"
done
ffmpeg -nostdin -v error -y $(for kv in $PICKS; do echo -n "-i $C/q-${kv%%:*}.png "; done) \
  -filter_complex "[0]scale=640:-1[a];[1]scale=640:-1[b];[2]scale=640:-1[c];[3]scale=640:-1[d];[4]scale=640:-1[e];[a][b][c][d][e]xstack=inputs=5:layout=0_0|640_0|1280_0|0_360|640_360" "$C/quadros-conferencia.png"
echo "montagem: $C/quadros-conferencia.png"
rm -f /tmp/vf-picks.$$

echo "--- 5. provas por pixel nos slides (luminância 0–255; fundo dos slides é claro)"
px() { ffmpeg -nostdin -v error -ss "$1" -i "$V" -frames:v 1 -vf "$2,scale=1:1" -f rawvideo -pix_fmt gray - | od -An -tu1 | tr -d ' '; }
okleg=0; okcanto=0; tot=0
for kv in $SLIDES; do
  n="${kv%%:*}"; tt="${kv##*:}"
  l=$(px "$tt" "crop=900:90:510:960"); c=$(px "$tt" "crop=400:225:1472:807")
  [ "$l" -gt 150 ] && okleg=$((okleg+1)); [ "$c" -gt 150 ] && okcanto=$((okcanto+1)); tot=$((tot+1))
  echo "  $n t=${tt}s: faixa da legenda $l · canto inferior direito $c"
done
need=$(( (tot*6+9)/10 ))
echo "faixa da legenda (900x90 em 510,960) clara em $okleg de $tot → $([ "$okleg" -ge "$need" ] && echo 'OK, sem caixa de legenda' || echo 'ATENÇÃO: conferir os quadros')"
echo "canto inferior direito (400x225 em 1472,807) claro em $okcanto de $tot → $([ "$okcanto" -ge "$need" ] && echo 'OK, sem caixa do narrador' || echo 'ATENÇÃO: conferir os quadros')"
