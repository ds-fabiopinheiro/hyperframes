/**
 * scenes.mjs — templates das cenas do EP01.
 * Cada função recebe { scene, cues, dur, beats, esc, capHtml, SHARED_CSS } e devolve o
 * conteúdo do <template> (style + root + script). Tempos em segundos, locais à cena.
 *
 * Doutrina de movimento aplicada (motion-doctrine / cut-the-curve):
 *  - corrente do filme: ESQUERDA (slide → slide = cut-the-curve para a esquerda);
 *  - vinheta → capa: zoom-through (push, Z para frente);
 *  - tela05 → decisão: push (o PiP do narrador cresce até a tela cheia: é o carrier);
 *  - decisão → cartão final: vetor para cima (elevação / conclusão).
 */

export const SHARED_CSS = `
  #root, #root * { margin: 0; padding: 0; box-sizing: border-box; }
  #root { position: absolute; inset: 0; overflow: hidden; font-family: Inter, Arial, Helvetica, sans-serif; color: #1A1A1A; background: #EDEDED; }
  #root .stage { position: absolute; inset: 0; }
  #root .chrome { position: absolute; inset: 0; pointer-events: none; }
  #root .logo { position: absolute; left: 96px; top: 64px; display: flex; align-items: center; gap: 18px; }
  #root .logo .sep { width: 2px; height: 36px; background: rgba(26,26,26,.18); }
  #root .logo img { height: 30px; width: auto; display: block; }
  #root .crumb { position: absolute; right: 96px; top: 66px; font-size: 22px; letter-spacing: .08em; text-transform: uppercase; color: #5F5F5F; font-weight: 600; display: flex; gap: 14px; align-items: center; }
  #root .crumb b { color: #F54E00; }
  #root .crumb .num { background: #1A1A1A; color: #fff; padding: 4px 12px; border-radius: 6px; letter-spacing: .04em; font-weight: 800; }
  #root .eyebrow { position: absolute; left: 96px; top: 168px; font-size: 22px; letter-spacing: .14em; text-transform: uppercase; color: #E04600; font-weight: 800; }
  #root .title { position: absolute; left: 96px; top: 210px; width: 1500px; font-size: 64px; line-height: 1.12; font-weight: 800; letter-spacing: -0.03em; }
  #root .title em { font-style: normal; color: #F54E00; }
  #root .sub { position: absolute; left: 96px; top: 372px; width: 1300px; font-size: 27px; color: #4A4A4A; line-height: 1.4; }
  #root .card { position: absolute; background: #fff; border-radius: 18px; box-shadow: 0 1px 2px rgba(26,26,26,.04), 0 14px 40px -24px rgba(26,26,26,.18); padding: 30px 34px; }
  #root .card h4 { font-size: 28px; font-weight: 800; letter-spacing: -0.02em; line-height: 1.15; }
  #root .card p { font-size: 22px; color: #4A4A4A; line-height: 1.4; margin-top: 12px; }
  #root .badge { display: inline-flex; align-items: center; gap: 10px; font-size: 16px; letter-spacing: .12em; text-transform: uppercase; font-weight: 800; color: #C73E00; background: #FFEEE6; border-radius: 999px; padding: 8px 16px; }
  #root .badge i { width: 8px; height: 8px; border-radius: 50%; background: #FF5100; }
  #root .badge.ink { color: #fff; background: #1A1A1A; } #root .badge.ink i { background: #FF9A66; }
  #root .band { position: absolute; left: 96px; background: #1A1A1A; color: rgba(255,255,255,.82); border-radius: 18px; padding: 26px 36px; font-size: 30px; line-height: 1.45; }
  #root .band em { font-style: normal; color: #fff; font-weight: 800; }
  #root .ask { position: absolute; left: 96px; display: flex; align-items: center; gap: 22px; background: #FFEEE6; border-radius: 18px; padding: 22px 30px; font-size: 28px; line-height: 1.35; color: #1A1A1A; }
  #root .ask .k { font-size: 16px; letter-spacing: .14em; text-transform: uppercase; font-weight: 900; color: #C73E00; border: 2px solid #FF9A66; border-radius: 999px; padding: 6px 14px; white-space: nowrap; }
  #root .ask em { font-style: normal; font-weight: 800; color: #E04600; }
  #root .src { position: absolute; left: 96px; bottom: 48px; width: 380px; font-size: 15px; line-height: 1.3; color: #5F5F5F; letter-spacing: .01em; }
  #root .hl { position: relative; display: inline; }
  #root .big { font-size: 64px; font-weight: 900; letter-spacing: -0.04em; color: #FF5100; line-height: 1; }
  #root .big.ink { color: #1A1A1A; } #root .big.neg { color: #D93025; }
  #root .embed { position: absolute; font-weight: 900; letter-spacing: -0.045em; line-height: .95; }
  #root .cursor { position: absolute; width: 134px; height: 134px; z-index: 20; filter: drop-shadow(0 4px 6px rgba(0,0,0,.3)); pointer-events: none; will-change: transform; }
`;

// helpers de timeline incluídos em cada cena (GSAP, seek-safe: set + fromTo com immediateRender:false)
export const SHARED_JS = `
  const q = (s) => document.querySelector(s);
  const qa = (s) => Array.from(document.querySelectorAll(s));
  const hide = (sel) => gsap.set(sel, { opacity: 0 });
  // cut-the-curve (entrada): +230 → 0, opacidade ignição 0.35, power4.out 0.34s
  const enterCurve = (tl, sel, t, dir = 1) => {
    tl.fromTo(sel, { x: 230 * dir, opacity: 0.35 }, { x: 0, opacity: 1, duration: 0.34, ease: "power4.out", immediateRender: false }, t);
  };
  // cut-the-curve (saída): 0 → -230 power4.in 0.3s, fade termina a ~30% do trajeto
  const exitCurve = (tl, sel, t, dir = 1) => {
    tl.to(sel, { x: -230 * dir, duration: 0.3, ease: "power4.in" }, t);
    tl.to(sel, { opacity: 0, duration: 0.18, ease: "none" }, t);
  };
  // zoom-through push (saída): cresce + blur 10/18 + fade separado
  const exitPush = (tl, sel, t, blur = 10, scale = 1.2) => {
    tl.to(sel, { scale, filter: "blur(" + blur + "px)", duration: 0.2, ease: "power3.in" }, t);
    tl.to(sel, { opacity: 0.15, duration: 0.2, ease: "none" }, t);
    tl.set(sel, { opacity: 0 }, t + 0.2);
  };
  // zoom-through push (entrada): 0.75 → 1, blur 10 → 0, 0.15 → 1, expo.out 0.5s
  const enterPush = (tl, sel, t, blur = 10) => {
    tl.fromTo(sel, { scale: 0.75, filter: "blur(" + blur + "px)", opacity: 0.15 }, { scale: 1, filter: "blur(0px)", opacity: 1, duration: 0.5, ease: "expo.out", immediateRender: false }, t);
  };
  // inverse zoom (chegada): 1.25 → 1, algo maior aterrissa
  const arrive = (tl, sel, t, blur = 10) => {
    tl.fromTo(sel, { scale: 1.25, filter: "blur(" + blur + "px)", opacity: 0.15 }, { scale: 1, filter: "blur(0px)", opacity: 1, duration: 0.5, ease: "expo.out", immediateRender: false }, t);
  };
  // waterfall entry (§6): chegada em cascata por baixo, opacidade binária, gaps encolhem x0.84
  const waterfall = (tl, els, t, { y = 56, d = 0.17, gap = 0.07, decay = 0.84 } = {}) => {
    let at = t;
    let g = gap;
    els.forEach((el, i) => {
      tl.set(el, { opacity: 1 }, at);
      tl.fromTo(el, { y }, { y: 0, duration: d, ease: "power4.out", immediateRender: false }, at);
      at += g; g *= decay;
    });
    return at;
  };
  // nudge (§7): deslocamento lento-rápido-lento de um grupo composto
  const nudge = (tl, sel, prop, from, to, t, total = 0.7) => {
    const mix = (k) => from + (to - from) * k;
    tl.fromTo(sel, { [prop]: from }, { [prop]: mix(0.10), duration: total * 0.20, ease: "power3.in", immediateRender: false }, t);
    tl.to(sel, { [prop]: mix(0.75), duration: total * 0.18, ease: "none" }, t + total * 0.20);
    tl.to(sel, { [prop]: to, duration: total * 0.62, ease: "power4.out" }, t + total * 0.38);
  };
  // contagem de número (seek-safe via objeto proxy)
  const countUp = (tl, sel, to, t, { dur = 0.9, prefix = "", suffix = "", dec = 0, ease = "power2.out", from = 0 } = {}) => {
    const el = q(sel);
    const o = { v: from };
    const fmt = (v) => prefix + v.toFixed(dec).replace(".", ",") + suffix;
    el.textContent = fmt(from);
    tl.to(o, { v: to, duration: dur, ease, onUpdate: () => { el.textContent = fmt(o.v); } }, t);
  };
  // cursor macOS superdimensionado (oversized-cursor): ponta em 21% 14%
  // ponta da seta em 21% / 14% da caixa (134px): x,y via transform (sub-pixel, seek-safe)
  const TIP = { x: 0.21 * 134, y: 0.14 * 134 };
  const cursorMove = (tl, sel, cx, cy, t, dur = 0.6, ease = "power3.out") => {
    tl.to(sel, { x: cx - TIP.x, y: cy - TIP.y, duration: dur, ease }, t);
  };
  const cursorClick = (tl, sel, t) => {
    tl.to(sel, { scale: 0.84, duration: 0.1, ease: "power2.in", transformOrigin: "21% 14%" }, t);
    tl.to(sel, { scale: 1, duration: 0.22, ease: "power2.out", transformOrigin: "21% 14%" }, t + 0.1);
  };
  const press = (tl, sel, t) => {
    tl.to(sel, { scale: 0.96, duration: 0.1, ease: "power2.in" }, t);
    tl.to(sel, { scale: 1, duration: 0.3, ease: "back.out(1.6)" }, t + 0.1);
  };
`;

const CURSOR_SVG = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M5 3l14 9.5-6.2 1.2 3.4 6.3-2.6 1.4-3.4-6.3L5 19.5z" fill="#1c1c1c" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/></svg>`;

const chrome = (crumb, num, light = false) => `
  <div class="chrome">
    <div class="logo"><span class="sep"></span><img src="assets/south-logo.png" alt="South System"${light ? ' style="filter:brightness(0) invert(1)"' : ""}></div>
    <div class="crumb"${light ? ' style="color:rgba(255,255,255,.8)"' : ""}>Letramento de IA <b${light ? ' style="color:#fff"' : ""}>·</b> ${crumb} <span class="num" id="num-${num}">${num} / 67</span></div>
  </div>`;

const root = (id, dur, inner, extraCss = "") => `
<style>${SHARED_CSS}${extraCss}</style>
<div id="root" data-composition-id="${id}" data-width="1920" data-height="1080" data-duration="${dur}">
${inner}
</div>`;

const script = (id, body) => `
<script>
  (() => {
    ${SHARED_JS}
    const tl = gsap.timeline({ paused: true });
    ${body}
    window.__timelines["${id}"] = tl;
  })();
</script>`;


const SCENES_EP04 = {};

// ---------------------------------------------------------------------------------------------
// EP04 · Jurídico, Pessoas, Atendimento: onde a IA não decide
// Regra das cenas de tela cheia (gancho, decisão): gráficos e legendas em x >= 1210 (o vídeo do
// narrador ocupa x < 1140). Telas Gartner: figura original à esquerda, nota de insight à direita,
// zoom/pan nas regiões citadas pelo teleprompter ([TELA: zoom em …]).
// ---------------------------------------------------------------------------------------------

const FIG_CSS = `
  #root .fig { position: absolute; left: 96px; top: 290px; width: 1110px; height: 710px; background: #fff; border-radius: 18px; box-shadow: 0 1px 2px rgba(26,26,26,.04), 0 14px 40px -24px rgba(26,26,26,.18); overflow: hidden; }
  #root .fig .box { position: absolute; left: 20px; top: 20px; width: 1070px; height: 670px; overflow: hidden; }
  #root .fig .zoomer { position: absolute; left: 0; top: 0; width: 1070px; height: 670px; transform-origin: 0 0; }
  #root .fig img { position: absolute; display: block; }
  #root .note { position: absolute; left: 1260px; top: 290px; width: 564px; }
  #root .note .k { font-size: 16px; letter-spacing: .14em; text-transform: uppercase; font-weight: 900; color: #B83800; margin-bottom: 12px; }
  #root .note .desc { font-size: 22px; line-height: 1.4; color: #4A4A4A; margin-bottom: 16px; }
  #root .note ul { list-style: none; display: flex; flex-direction: column; gap: 10px; }
  #root .note li { font-size: 20px; line-height: 1.4; color: #1A1A1A; padding-left: 26px; position: relative; }
  #root .note .takeaway { margin-top: 18px; padding: 12px 16px; background: #FFEEE6; border-left: 6px solid #FF5100; border-radius: 10px; font-size: 20px; line-height: 1.35; font-weight: 700; color: #1A1A1A; }
  #root .note .takeaway span { display: block; font-size: 13px; letter-spacing: .14em; text-transform: uppercase; color: #B83800; font-weight: 900; margin-bottom: 4px; }
  #root .note li::before { content: ""; position: absolute; left: 0; top: 11px; width: 10px; height: 10px; border-radius: 50%; background: #FF5100; }
  #root .note li b { font-weight: 900; }
  #root .figsrc { position: absolute; left: 1260px; top: 766px; width: 564px; font-size: 15px; line-height: 1.3; color: #5F5F5F; }
`;

/**
 * Cena Gartner: figura + nota + zooms por cue.
 * zooms: { cue: [fx, fy, fw, fh] } em frações da imagem; "fig" volta ao enquadramento inteiro.
 */
const figScene = (id, { num, crumb = "Módulo 1 · Aplicações", eyebrow, title, img, iw, ih, desc, insights, key = "", src, zooms = {}, extra = "" }) =>
  ({ cues, dur, beats }) => {
    const BW = 1070, BH = 670;
    const s0 = Math.min(BW / iw, BH / ih);
    const w0 = Math.round(iw * s0), h0 = Math.round(ih * s0);
    const ox = Math.round((BW - w0) / 2), oy = Math.round((BH - h0) / 2);
    const cam = (r) => {
      const [fx, fy, fw, fh] = r;
      const k = Math.min(BW / (fw * w0), BH / (fh * h0), 2.4);
      return { k: +k.toFixed(3), x: Math.round(BW / 2 - k * (ox + (fx + fw / 2) * w0)), y: Math.round(BH / 2 - k * (oy + (fy + fh / 2) * h0)) };
    };
    const moves = [];
    for (const b of beats) {
      if (!b.cue) continue;
      if (b.cue === "fig" || zooms[b.cue] === "fig") moves.push(`tl.to("#${id}-z", { scale: 1, x: 0, y: 0, duration: 1.1, ease: "power2.inOut" }, ${b.t});`);
      else if (zooms[b.cue]) {
        const c = cam(zooms[b.cue]);
        moves.push(`tl.to("#${id}-z", { scale: ${c.k}, x: ${c.x}, y: ${c.y}, duration: 1.1, ease: "power2.inOut" }, ${b.t});`);
      }
    }
    const inner = `
  <div class="stage" id="${id}-stage">
    ${chrome(crumb, num)}
    <div class="eyebrow" id="${id}-eyebrow">${eyebrow}</div>
    <h2 class="title" id="${id}-title">${title}</h2>
    <div class="fig" id="${id}-fig"><div class="box"><div class="zoomer" id="${id}-z" data-layout-allow-overflow><img src="assets/${img}" width="${w0}" height="${h0}" style="left:${ox}px;top:${oy}px" alt=""></div></div></div>
    <div class="note" id="${id}-note">
      <div class="k" id="${id}-nk">O que a figura mostra</div>
      <div class="desc" id="${id}-nd">${desc}</div>
      <ul>${insights.map((t, i) => `<li id="${id}-li${i}">${t}</li>`).join("")}</ul>
      ${key ? `<div class="takeaway" id="${id}-key"><span>Para levar</span>${key}</div>` : ""}
    </div>
    <div class="figsrc">Fonte: Gartner — ${src}. Uso interno South System.</div>
    ${extra}
  </div>`;
    const css = `${FIG_CSS}
  #root .title { font-size: 50px; width: 1500px; }
`;
    const js = `
    hide("#${id}-fig, #${id}-nk, #${id}-nd, #${id}-note li, #${id}-key");
    enterCurve(tl, "#${id}-stage", 0);
    waterfall(tl, ["#${id}-fig"], 0.25, { y: 60, d: 0.22 });
    waterfall(tl, ["#${id}-nk", "#${id}-nd"], 0.6, { y: 36, d: 0.16, gap: 0.08 });
    waterfall(tl, [${insights.map((_, i) => `"#${id}-li${i}"`).join(", ")}], ${Math.min(2.2, Math.max(1.2, (beats[0]?.end ?? 1.2)))}, { y: 30, d: 0.14, gap: 0.08 });
    ${key ? `waterfall(tl, ["#${id}-key"], ${Math.min(2.2, Math.max(1.2, (beats[0]?.end ?? 1.2))) + 0.08 * insights.length + 0.5}, { y: 30, d: 0.18 });` : ""}
    ${moves.join("\n    ")}
    exitCurve(tl, "#${id}-stage", ${dur - 0.3});`;
    return { inner, css, js };
  };

// cartão de caso (telas 09 e 10): badge, título, ganho, atenção (revelada no cue wN)
const caseCard = (id, i, c, x) => `
    <div class="card case" id="${id}-c${i}" style="left:${x}px">
      <span class="badge${c.badgeInk ? " ink" : ""}"><i></i>${c.badge}</span>
      <h4>${c.h}</h4>
      <p><b>Ganho:</b> ${c.g}</p>
      <p class="req"><b>Requer:</b> ${c.r}</p>
      <div class="warn" id="${id}-w${i}"><b>Atenção:</b> ${c.w}</div>
    </div>`;
const CASE_CSS = `
  #root .card.case { top: 300px; width: 420px; height: 500px; padding: 24px 28px; display: flex; flex-direction: column; gap: 10px; }
  #root .card.case h4 { font-size: 26px; min-height: 62px; }
  #root .card.case p { font-size: 19px; line-height: 1.35; margin-top: 0; }
  #root .card.case p.req b { color: #1A1A1A; }
  #root .card.case .warn { margin-top: auto; background: #FFEEE6; border-left: 6px solid #FF5100; border-radius: 10px; padding: 12px 14px; font-size: 18px; line-height: 1.35; color: #1A1A1A; }
  #root .card.case .warn b { color: #C73E00; }
  #root .stats { position: absolute; left: 1420px; top: 300px; width: 404px; display: flex; flex-direction: column; gap: 14px; }
  #root .stat { background: #1A1A1A; color: #fff; border-radius: 14px; padding: 16px 20px; }
  #root .stat .n { font-size: 46px; font-weight: 900; letter-spacing: -0.04em; line-height: 1; color: #FF9A66; }
  #root .stat .n.g { color: #FF9A66; } #root .stat .n.r { color: #FF7A33; }
  #root .stat .l { font-size: 17px; color: rgba(255,255,255,.8); margin-top: 6px; line-height: 1.3; }
  #root .ask.low { top: 818px; width: 1290px; }
`;



const CASE_EXTRA_CSS = `
  #root .card.case .warn.on { background: #FF5100; color: #fff; } #root .card.case .warn.on b { color: #fff; }
  #root .card.case p.req.on { background: #FFEEE6; border-radius: 8px; padding: 4px 8px; margin-left: -8px; }
  #root .stat.on { outline: 4px solid #FF5100; }
  #root .dark-panel { position: absolute; left: 96px; top: 300px; width: 1300px; padding: 40px 48px; background: #1A1A1A; color: #fff; border-radius: 18px; transform-origin: 0% 50%; }
  #root .dark-panel .n { font-size: 150px; font-weight: 900; letter-spacing: -0.06em; line-height: .9; color: #FF9A66; }
  #root .dark-panel .t { font-size: 40px; font-weight: 700; line-height: 1.2; letter-spacing: -0.02em; } #root .dark-panel .t em { font-style: normal; color: #FF9A66; }
  #root .dark-panel .chips { display: flex; gap: 14px; flex-wrap: wrap; margin-top: 26px; }
  #root .dark-panel .chip { background: rgba(255,255,255,.1); border: 2px solid rgba(255,255,255,.25); color: #fff; font-size: 30px; font-weight: 800; padding: 12px 22px; border-radius: 14px; }
  #root .dark-panel .big { font-size: 96px; font-weight: 900; letter-spacing: -0.045em; line-height: 1; color: #fff; margin-top: 10px; } #root .dark-panel .big em { font-style: normal; color: #FF9A66; }
`;

Object.assign(SCENES_EP04, {
  // ------------------------------------------------------------------ GANCHO FRIO (tela cheia: gráficos em x>=1210)
  gancho: ({ cues, dur }) => {
    const inner = `
  <div class="stage" id="g-stage">
    <div id="g-kicker"><b>EP04</b> Onde a IA não decide</div>
    <div class="card" id="g-score">
      <div class="k">Modelo de churn · cooperada</div>
      <div class="row"><span class="lab">Risco de saída</span><div class="tr"><div class="fi" id="g-fi"></div></div><span class="v">alto</span></div>
      <div class="chip" id="g-acao">Condição especial · conta retida</div>
      <div class="stamp" id="g-errado">ERRADO</div>
    </div>
    <div class="lab2" id="g-taxa">Três meses depois: ela <b>nunca ia sair</b>. Taxa menor por <b>erro de dado</b>.</div>
    <div class="card ink" id="g-punch"><div class="a">Score <em>orienta</em>.</div><div class="b">Score <em>não decide</em>.</div></div>
    <div id="g-front">Hoje: <b>essa fronteira</b></div>
  </div>`;
    const css = `
  #root { background: transparent; }
  #root #g-kicker { position: absolute; left: 1210px; top: 64px; font-size: 22px; color: rgba(255,255,255,.75); letter-spacing: .06em; text-transform: uppercase; font-weight: 600; }
  #root #g-kicker b { color: #fff; background: #FF5100; padding: 6px 12px; border-radius: 6px; margin-right: 14px; font-weight: 900; }
  #root #g-score { left: 1210px; top: 150px; width: 650px; padding: 26px 30px; }
  #root #g-score .k { font-size: 14px; letter-spacing: .12em; text-transform: uppercase; color: #6B6B6B; font-weight: 800; margin-bottom: 16px; }
  #root #g-score .row { display: grid; grid-template-columns: 150px 1fr 70px; align-items: center; gap: 14px; }
  #root #g-score .lab { font-size: 20px; font-weight: 700; } #root #g-score .v { font-size: 22px; font-weight: 900; color: #C73E00; text-transform: uppercase; }
  #root #g-score .tr { height: 30px; background: #EDEDED; border-radius: 6px; overflow: hidden; } #root #g-score .fi { height: 100%; width: 100%; background: #FF5100; border-radius: 6px; transform-origin: 0 50%; }
  #root #g-score .chip { display: inline-block; margin-top: 20px; background: #F1F1F1; border-radius: 999px; padding: 10px 18px; font-size: 22px; font-weight: 700; color: #1A1A1A; }
  #root .stamp { position: absolute; right: 24px; top: 18px; font-size: 40px; font-weight: 900; color: #fff; background: #C73E00; padding: 6px 18px; border-radius: 10px; transform: rotate(-8deg); letter-spacing: .04em; }
  #root .lab2 { position: absolute; left: 1210px; top: 395px; width: 650px; font-size: 28px; line-height: 1.3; color: rgba(255,255,255,.9); } #root .lab2 b { color: #FF9A66; }
  #root #g-punch { left: 1210px; top: 520px; width: 650px; padding: 30px 34px; background: #1A1A1A; color: #fff; border: 2px solid rgba(255,255,255,.12); transform-origin: 0% 50%; }
  #root #g-punch .a, #root #g-punch .b { font-size: 60px; font-weight: 900; letter-spacing: -0.04em; line-height: 1.05; } #root #g-punch em { font-style: normal; color: #FF9A66; }
  #root #g-front { position: absolute; left: 1210px; top: 790px; font-size: 30px; color: rgba(255,255,255,.85); font-weight: 600; } #root #g-front b { color: #FF5100; font-weight: 900; }
`;
    const js = `
    hide("#g-kicker, #g-score, #g-acao, #g-errado, #g-taxa, #g-punch, #g-front");
    gsap.set("#g-fi", { scaleX: 0 });
    tl.set("#g-kicker", { opacity: 1 }, ${cues.open});
    tl.fromTo("#g-kicker", { x: 60 }, { x: 0, duration: 0.5, ease: "power4.out", immediateRender: false }, ${cues.open});
    waterfall(tl, ["#g-score"], ${cues.open} + 0.3, { y: 60, d: 0.2 });
    tl.to("#g-fi", { scaleX: 0.86, duration: 0.9, ease: "power3.out" }, ${cues.open} + 0.7);
    waterfall(tl, ["#g-acao"], ${cues.acao} + 0.2, { y: 30 });
    // "errado": o carimbo chega grande e assenta
    tl.set("#g-errado", { opacity: 1 }, ${cues.errado} + 0.1);
    tl.fromTo("#g-errado", { scale: 2.2, rotation: -8 }, { scale: 1, rotation: -8, duration: 0.4, ease: "expo.out", immediateRender: false }, ${cues.errado} + 0.1);
    tl.to("#g-fi", { backgroundColor: "#BDBDBD", duration: 0.3 }, ${cues.errado} + 0.3);
    waterfall(tl, ["#g-taxa"], ${cues.taxa}, { y: 30 });
    tl.set("#g-punch", { opacity: 1 }, ${cues.punch} + 0.1); arrive(tl, "#g-punch", ${cues.punch} + 0.1);
    waterfall(tl, ["#g-front"], ${cues.fronteira}, { y: 30 });
    exitCurve(tl, "#g-kicker", ${dur - 0.3}); exitCurve(tl, "#g-score", ${dur - 0.3}); exitCurve(tl, "#g-taxa", ${dur - 0.3}); exitCurve(tl, "#g-punch", ${dur - 0.3}); exitCurve(tl, "#g-front", ${dur - 0.3});`;
    return root("gancho", dur, inner, css) + script("gancho", js);
  },

  // ------------------------------------------------------------------ VINHETA
  vinheta: ({ dur }) => {
    const inner = `
  <div class="stage" id="v-stage">
    <div id="v-bg"></div><div id="v-net"></div>
    <div id="v-group">
      <img id="v-logo" src="assets/south-logo.png" alt="South System">
      <div id="v-title"><span class="w" id="v-w0">South</span><span class="w" id="v-w1">Academy</span><span class="w" id="v-w2">Executive</span></div>
      <div id="v-sub"><span class="w" id="v-s0">Letramento de IA</span><span class="w" id="v-s1">para líderes</span></div>
      <div id="v-ep"><span class="w" id="v-e0">EP04</span><span class="w" id="v-e1">Onde a IA não decide</span></div>
    </div>
  </div>`;
    const css = `
  #root { background: #FF5100; }
  #root #v-bg { position: absolute; inset: 0; background: url(assets/cover-bg.jpg) center / cover no-repeat; }
  #root #v-net { position: absolute; inset: 0; background: url(assets/network-art.png) right -80px top -60px / 1100px auto no-repeat; opacity: .18; mix-blend-mode: multiply; }
  #root #v-group { position: absolute; left: 160px; top: 300px; width: 1400px; transform-origin: 30% 50%; }
  #root #v-logo { height: 54px; width: auto; display: block; filter: brightness(0) invert(1); }
  #root #v-title { margin-top: 40px; font-size: 128px; font-weight: 900; letter-spacing: -0.045em; line-height: 1; color: #fff; }
  #root #v-sub { margin-top: 22px; font-size: 44px; font-weight: 600; color: rgba(255,255,255,.92); letter-spacing: -0.01em; }
  #root #v-ep { margin-top: 40px; display: flex; align-items: center; gap: 18px; font-size: 32px; color: #fff; font-weight: 700; }
  #root #v-ep #v-e0 { background: #1A1A1A; padding: 10px 18px; border-radius: 10px; letter-spacing: .06em; font-weight: 900; }
  #root .w { display: inline-block; margin-right: .22em; }
`;
    const js = `
    hide("#v-logo, .w");
    tl.set("#v-logo", { opacity: 1 }, 0);
    tl.fromTo("#v-logo", { x: 230, opacity: 0.35 }, { x: 0, opacity: 1, duration: 0.34, ease: "power4.out", immediateRender: false }, 0);
    waterfall(tl, ["#v-w0", "#v-w1", "#v-w2"], 0.55, { y: 80, d: 0.2, gap: 0.09 });
    waterfall(tl, ["#v-s0", "#v-s1"], 0.95, { y: 46, d: 0.15, gap: 0.06 });
    waterfall(tl, ["#v-e0", "#v-e1"], 1.3, { y: 40, d: 0.13, gap: 0.05 });
    exitPush(tl, "#v-group", ${dur - 0.22}, 18, 1.2);`;
    return root("vinheta", dur, inner, css) + script("vinheta", js);
  },

  // ------------------------------------------------------------------ TELA 13 · JURÍDICO
  tela13: ({ cues, dur }) => {
    const cases = [
      { badge: "IA generativa", h: "Revisão e análise de contratos", g: "Extrai cláusulas e aponta desvios do playbook; 55% dos líderes jurídicos veem alto impacto.", r: "Base de contratos e playbooks, integrada à gestão de contratos (CLM).", w: "Só 21% implantaram de fato, embora 46% planejem." },
      { badge: "IA generativa", h: "Pesquisa jurídica e redação", g: "Resumos e minutas em minutos; ganho realista de 10% a 20% em 2 a 5 anos.", r: "Bibliotecas de cláusulas, modelos aprovados e fontes jurídicas confiáveis.", w: "Precedentes inventados: 60% citam alucinação como a principal barreira." },
      { badge: "Generativa agêntica", badgeInk: true, h: "Triagem de demandas (intake)", g: "Até 2029, 60% dos jurídicos terão intake com IA respondendo metade das demandas.", r: "Categorias de demanda padronizadas e histórico de respostas.", w: "Automatize por completo só o que é simples, repetitivo e de baixo risco." },
    ];
    const stats = [["68%", "g", "dos líderes jurídicos relatam retorno positivo da IA em 2025"], ["25–40%", "g", "mais confiáveis: ferramentas jurídicas específicas vs. genéricas"], ["3,6%", "r", "de redução de equipe em 12–18 meses: o ganho vem como capacidade"]];
    const inner = `
  <div class="stage" id="s13-stage">
    ${chrome("Módulo 1 · Aplicações", "13")}
    <div class="eyebrow" id="s13-eyebrow">Módulo 1 · Jurídico</div>
    <h2 class="title" id="s13-title">Jurídico: mais velocidade, <em>com sigilo e revisão</em></h2>
    ${cases.map((c, i) => caseCard("s13", i + 1, c, 96 + i * 442)).join("")}
    <div class="stats">${stats.map((s, i) => `<div class="stat" id="s13-n${i + 1}"><div class="n ${s[1]}">${s[0]}</div><div class="l">${s[2]}</div></div>`).join("")}</div>
    <div class="ask low" id="s13-ask"><span class="k">Pergunta</span><p>Que demanda chega ao Jurídico repetidamente e <em>poderia ter resposta padrão?</em></p></div>
    <div class="src">Fontes: Gartner — Generative AI Use Cases for Legal and Compliance; Drive AI Adoption in Legal to Maximize ROI.</div>
  </div>`;
    const css = `${CASE_CSS}${CASE_EXTRA_CSS}
  #root .stats { left: 1420px; top: 300px; width: 404px; }
  #root .card.case { height: 500px; }
  #root #s13-title { font-size: 54px; width: 1700px; }
  #root #s13-ask { top: 818px; width: 1290px; }
`;
    const js = `
    hide(".card, .warn, .stat, #s13-ask");
    enterCurve(tl, "#s13-stage", 0);
    ${[1, 2, 3].map((i) => `waterfall(tl, ["#s13-c${i}"], ${cues["c" + i]}, { y: 70, d: 0.2 }); waterfall(tl, ["#s13-w${i}"], ${cues["w" + i]}, { y: 24, d: 0.16 });`).join("\n    ")}
    // "a diferença é playbook e base integrada": a linha Requer do primeiro cartão acende
    tl.set("#s13-c1 p.req", { className: "req on" }, ${cues.req1}); press(tl, "#s13-c1 p.req", ${cues.req1});
    // "risco de imagem e sanção": o alerta do segundo cartão acende
    tl.set("#s13-w2", { className: "warn on" }, ${cues.cro}); press(tl, "#s13-w2", ${cues.cro});
    ${[1, 2, 3].map((i) => `waterfall(tl, ["#s13-n${i}"], ${cues["n" + i]}, { y: 50, d: 0.2 });`).join(" ")}
    tl.set("#s13-n3", { className: "stat on" }, ${cues.capacidade}); press(tl, "#s13-n3", ${cues.capacidade});
    waterfall(tl, ["#s13-ask"], ${cues.capacidade} + 1.2, { y: 60, d: 0.2 });
    exitCurve(tl, "#s13-stage", ${dur - 0.3});`;
    return root("tela13", dur, inner, css) + script("tela13", js);
  },

  // ------------------------------------------------------------------ TELA 14 · PESSOAS
  tela14: ({ cues, dur }) => {
    const cases = [
      { badge: "IA generativa", h: "Assistente virtual de RH", g: "Reduz até 50% das perguntas repetitivas e atende o colaborador na hora.", r: "Integração com folha, benefícios e sistema de RH; políticas atualizadas.", w: "Base de políticas desatualizada gera resposta errada." },
      { badge: "Preditiva + generativa", h: "Skills e trilhas de carreira", g: "Mapeia habilidades e recomenda trilhas e mobilidade interna.", r: "Arquitetura de cargos, taxonomia de skills e dados de desempenho integrados.", w: "Recomendação sem contexto gera ceticismo: o gestor precisa mediar." },
      { badge: "IA preditiva", badgeInk: true, h: "Recrutamento e risco de saída", g: "Ranking de candidatos e alerta de risco de desligamento para agir antes.", r: "ATS integrado, auditoria de viés e transparência com as pessoas.", w: "53% dos líderes de RH temem viés e discriminação: a decisão é humana." },
    ];
    const stats = [["13%", "r", "dos casos de IA em RH avaliados tiveram ROI positivo; 60% não sabem"], ["12–17", "g", "meses, em média, até a IA em RH gerar valor"], ["57%", "r", "dos RHs têm iniciativas de IA ad hoc, sem governança central"]];
    const inner = `
  <div class="stage" id="s14-stage">
    ${chrome("Módulo 1 · Aplicações", "14")}
    <div class="eyebrow" id="s14-eyebrow">Módulo 1 · Pessoas e Cultura</div>
    <h2 class="title" id="s14-title">Pessoas: atendimento ágil e <em>decisões com cuidado</em></h2>
    ${cases.map((c, i) => caseCard("s14", i + 1, c, 96 + i * 442)).join("")}
    <div class="stats">${stats.map((s, i) => `<div class="stat" id="s14-n${i + 1}"><div class="n ${s[1]}">${s[0]}</div><div class="l">${s[2]}</div></div>`).join("")}</div>
    <div class="dark-panel" id="s14-dark">
      <div class="t">Não é só opinião.</div>
      <div class="chips"><span class="chip" id="s14-ch0">LGPD</span><span class="chip" id="s14-ch1">risco trabalhista</span><span class="chip" id="s14-ch2">reputação</span></div>
      <div class="big" id="s14-big">A decisão é humana.<br><em>Sempre.</em></div>
    </div>
    <div class="ask low" id="s14-ask"><span class="k">Pergunta</span><p>Quais perguntas o time de Pessoas <em>responde toda semana, sempre iguais?</em></p></div>
    <div class="src">Fontes: Gartner — AI Use-Case Assessment for HR; Traditional HCM Pricing Stalls Enterprise AI Adoption.</div>
  </div>`;
    const css = `${CASE_CSS}${CASE_EXTRA_CSS}
  #root .stats { left: 1420px; top: 300px; width: 404px; }
  #root .card.case { height: 500px; }
  #root #s14-title { font-size: 54px; width: 1700px; }
  #root #s14-ask { top: 818px; width: 1290px; }
  #root #s14-dark { height: 500px; }
`;
    const js = `
    hide(".card, .warn, .stat, #s14-ask, #s14-dark, #s14-dark .chip, #s14-big");
    enterCurve(tl, "#s14-stage", 0);
    ${[1, 2, 3].map((i) => `waterfall(tl, ["#s14-c${i}"], ${cues["c" + i]}, { y: 70, d: 0.2 }); waterfall(tl, ["#s14-w${i}"], ${cues["w" + i]}, { y: 24, d: 0.16 });`).join("\n    ")}
    tl.set("#s14-w3", { className: "warn on" }, ${cues.w3} + 0.3);
    // "LGPD, risco trabalhista, reputação": os cartões recuam, o painel escuro chega com as três fichas; depois "a decisão é humana"
    tl.to("#s14-c1, #s14-c2, #s14-c3", { scale: 0.85, opacity: 0, filter: "blur(10px)", duration: 0.25, ease: "power3.in" }, ${cues.lgpd});
    tl.set("#s14-dark", { opacity: 1 }, ${cues.lgpd} + 0.2); arrive(tl, "#s14-dark", ${cues.lgpd} + 0.2);
    waterfall(tl, ["#s14-ch0", "#s14-ch1", "#s14-ch2"], ${cues.lgpd} + 0.6, { y: 30, d: 0.16, gap: 0.3 });
    tl.set("#s14-big", { opacity: 1 }, ${cues.humana}); arrive(tl, "#s14-big", ${cues.humana}, 14);
    // números: o painel sai, os cartões voltam e as estatísticas entram
    exitCurve(tl, "#s14-dark", ${cues.n1} - 0.1);
    tl.set("#s14-c1, #s14-c2, #s14-c3", { scale: 1, filter: "blur(0px)" }, ${cues.n1});
    tl.to("#s14-c1, #s14-c2, #s14-c3", { opacity: 1, duration: 0.3 }, ${cues.n1});
    waterfall(tl, ["#s14-n1"], ${cues.n1}, { y: 50, d: 0.2 });
    tl.set("#s14-n1", { className: "stat on" }, ${cues.n1b}); press(tl, "#s14-n1", ${cues.n1b});
    waterfall(tl, ["#s14-n2"], ${cues.n2}, { y: 50, d: 0.2 }); waterfall(tl, ["#s14-n3"], ${cues.n3}, { y: 50, d: 0.2 });
    waterfall(tl, ["#s14-ask"], ${cues.n3} + 1.4, { y: 60, d: 0.2 });
    exitCurve(tl, "#s14-stage", ${dur - 0.3});`;
    return root("tela14", dur, inner, css) + script("tela14", js);
  },

  // ------------------------------------------------------------------ TELA 15 · CS E ATENDIMENTO
  tela15: ({ cues, dur }) => {
    const cases = [
      { badge: "IA preditiva", badgeInk: true, h: "Previsão de churn e health score", g: "Identifica contas em risco e dispara ações antes da perda; é o caso mais maduro.", r: "CRM, uso do produto, faturamento e suporte integrados; modelo monitorado.", w: "O score orienta o CSM, não substitui o julgamento em contas estratégicas." },
      { badge: "Generativa + preditiva", h: "Assistente do agente (agent assist)", g: "Intenção, sentimento, resumo e próxima ação em tempo real; menos tempo por atendimento.", r: "Base de conhecimento otimizada para IA; 61% dos líderes têm atualização atrasada.", w: "Custo por uso: aplicações de GenAI devem ficar 40% mais caras até 2027." },
      { badge: "IA generativa", h: "Autoatendimento conversacional", g: "Atendimento 24/7 para demandas repetitivas; 70% das jornadas começarão por IA até 2028.", r: "Integração com sistemas de registro e passagem de contexto ao humano.", w: "Só 14% dos problemas se resolvem por completo no autoatendimento digital." },
    ];
    const stats = [["42%", "r", "dos casos avaliados têm ROI incerto; 24% negativo, 24% positivo"], ["11%", "g", "das empresas com GenAI reduziram equipe de linha de frente"], ["70%", "r", "das que trocaram o atendimento por IA vão recontratar até 2027"]];
    const inner = `
  <div class="stage" id="s15-stage">
    ${chrome("Módulo 1 · Aplicações", "15")}
    <div class="eyebrow" id="s15-eyebrow">Módulo 1 · CS e Atendimento</div>
    <h2 class="title" id="s15-title">CS e Atendimento: <em>reter e resolver mais rápido</em></h2>
    ${cases.map((c, i) => caseCard("s15", i + 1, c, 96 + i * 442)).join("")}
    <div class="card" id="s15-ctx">
      <div class="k">Churn, no seu contexto</div>
      <div class="row" id="s15-x0"><b>Cooperativa:</b> cooperado que leva a conta e o capital.</div>
      <div class="row" id="s15-x1"><b>Adquirente:</b> estabelecimento que troca a maquininha.</div>
      <div class="row" id="s15-x2"><b>Seguradora:</b> renovação que não acontece.</div>
    </div>
    <div class="stats">${stats.map((s, i) => `<div class="stat" id="s15-n${i + 1}"><div class="n ${s[1]}">${s[0]}</div><div class="l">${s[2]}</div></div>`).join("")}</div>
    <div class="dark-panel" id="s15-dark">
      <div style="display:flex;gap:40px;align-items:center"><div class="n">70%</div><div class="t" id="s15-t1">vão recontratar até 2027.</div></div>
      <div class="t" id="s15-t2" style="margin-top:24px;color:rgba(255,255,255,.8)">Não é um argumento contra IA no atendimento.</div>
      <div class="big" id="s15-big">Assistir,<br><em>não substituir.</em></div>
    </div>
    <div class="ask low" id="s15-ask"><span class="k">Pergunta</span><p>Que sinais de risco de um cliente nós <em>só percebemos tarde demais?</em></p></div>
    <div class="src">Fontes: Gartner — 2026 AI Use-Case Trends for Service and Support; The Trillion-Dollar Question.</div>
  </div>`;
    const css = `${CASE_CSS}${CASE_EXTRA_CSS}
  #root .stats { left: 1420px; top: 300px; width: 404px; }
  #root .card.case { height: 500px; }
  #root #s15-title { font-size: 54px; width: 1700px; }
  #root #s15-ask { top: 818px; width: 1290px; }
  #root #s15-ctx { left: 538px; top: 300px; width: 862px; height: 500px; padding: 30px 36px; transform-origin: 0% 50%; }
  #root #s15-ctx .k { font-size: 15px; letter-spacing: .14em; text-transform: uppercase; font-weight: 800; color: #6B6B6B; margin-bottom: 18px; }
  #root #s15-ctx .row { font-size: 32px; line-height: 1.25; margin: 18px 0; color: #1A1A1A; } #root #s15-ctx .row b { color: #C73E00; font-weight: 900; }
  #root #s15-dark { height: 500px; }
`;
    const js = `
    hide(".card, .warn, .stat, #s15-ask, #s15-ctx .row, #s15-dark, #s15-t2, #s15-big");
    enterCurve(tl, "#s15-stage", 0);
    waterfall(tl, ["#s15-c1"], ${cues.c1}, { y: 70, d: 0.2 });
    // churn no contexto: o cartão de exemplos ocupa o lugar dos cartões 2 e 3 e sai quando o segundo caso chega
    waterfall(tl, ["#s15-ctx"], ${cues.coop} - 0.2, { y: 60, d: 0.2 });
    waterfall(tl, ["#s15-x0"], ${cues.coop}, { y: 30 }); waterfall(tl, ["#s15-x1"], ${cues.adq}, { y: 30 }); waterfall(tl, ["#s15-x2"], ${cues.seg}, { y: 30 });
    waterfall(tl, ["#s15-w1"], ${cues.w1}, { y: 24, d: 0.16 }); tl.set("#s15-w1", { className: "warn on" }, ${cues.w1} + 0.3);
    exitCurve(tl, "#s15-ctx", ${cues.c2} - 0.1);
    waterfall(tl, ["#s15-c2"], ${cues.c2} + 0.1, { y: 70, d: 0.2 });
    tl.set("#s15-c2 p.req", { className: "req on" }, ${cues.r2}); press(tl, "#s15-c2 p.req", ${cues.r2});
    waterfall(tl, ["#s15-w2"], ${cues.w2}, { y: 24, d: 0.16 });
    waterfall(tl, ["#s15-c3"], ${cues.c3}, { y: 70, d: 0.2 }); waterfall(tl, ["#s15-w3"], ${cues.w3}, { y: 24, d: 0.16 });
    ${[1, 2, 3].map((i) => `waterfall(tl, ["#s15-n${i}"], ${cues["n" + i]}, { y: 50, d: 0.2 });`).join(" ")}
    // "setenta por cento vão recontratar": os cartões somem, painel escuro; "assistir, não substituir"; a pergunta fecha
    tl.to("#s15-c1, #s15-c2, #s15-c3", { opacity: 0, duration: 0.2 }, ${cues.olho1});
    tl.set("#s15-dark", { opacity: 1 }, ${cues.olho1} + 0.1); arrive(tl, "#s15-dark", ${cues.olho1} + 0.1);
    waterfall(tl, ["#s15-t2"], ${cues.olho2}, { y: 30 });
    tl.set("#s15-big", { opacity: 1 }, ${cues.embed}); arrive(tl, "#s15-big", ${cues.embed}, 14);
    waterfall(tl, ["#s15-ask"], ${cues.embed} + 1.6, { y: 60, d: 0.2 });
    exitCurve(tl, "#s15-stage", ${dur - 0.3});`;
    return root("tela15", dur, inner, css) + script("tela15", js);
  },

  // ------------------------------------------------------------------ TELA 16 · CINCO PADRÕES
  tela16: ({ cues, dur }) => {
    const pats = [
      ["Eficiência não é eficácia", "A IA acelera tarefas; o resultado de negócio exige redesenhar processo e papéis."],
      ["A base de conhecimento manda", "Assistentes e agentes são tão bons quanto o conteúdo e os dados que consultam."],
      ["Humano no loop, na medida do risco", "Quanto maior o impacto da decisão, mais forte precisa ser a revisão humana."],
      ["Custo variável é risco real", "Preço por uso (tokens, agentes) precisa de teto, monitoramento e um dono."],
      ["Alto volume e baixo risco primeiro", "Tarefas repetitivas, mensuráveis e reversíveis geram aprendizado e confiança."],
    ];
    const pos = [[96, 300], [538, 300], [980, 300], [96, 550], [538, 550]];
    const inner = `
  <div class="stage" id="s16-stage">
    ${chrome("Módulo 1 · Aplicações", "16")}
    <div class="eyebrow" id="s16-eyebrow">Módulo 1 · Síntese</div>
    <h2 class="title" id="s16-title">Cinco padrões que se repetem <em>em todas as áreas</em></h2>
    ${pats.map((p, i) => `<div class="card pat" id="s16-p${i + 1}" style="left:${pos[i][0]}px;top:${pos[i][1]}px"><div class="n">0${i + 1}</div><h4>${p[0]}</h4><p>${p[1]}</p></div>`).join("")}
    <div class="card pat ink" id="s16-ink" style="left:980px;top:550px"><div class="k">Na prática</div><p>Comece pequeno, meça contra a linha de base e só então amplie.</p></div>
  </div>`;
    const css = `
  #root .card.pat { width: 420px; height: 230px; padding: 24px 28px; transform-origin: 50% 100%; }
  #root .card.pat .n { font-size: 15px; letter-spacing: .14em; color: #767676; font-weight: 800; }
  #root .card.pat h4 { font-size: 26px; font-weight: 800; letter-spacing: -0.02em; line-height: 1.15; margin-top: 8px; color: #1A1A1A; }
  #root .card.pat p { font-size: 19px; line-height: 1.35; color: #4A4A4A; margin-top: 10px; }
  #root .card.pat.on h4 { color: #C73E00; }
  #root .card.pat.ink { background: #1A1A1A; color: #fff; } #root .card.pat.ink .k { font-size: 15px; letter-spacing: .14em; text-transform: uppercase; color: #FF9A66; font-weight: 800; }
  #root .card.pat.ink p { color: #fff; font-size: 26px; font-weight: 700; line-height: 1.25; margin-top: 14px; }
`;
    const js = `
    hide(".card");
    enterCurve(tl, "#s16-stage", 0);
    ${[1, 2, 3, 4, 5].map((i) => `waterfall(tl, ["#s16-p${i}"], ${cues["p" + i]}, { y: 60, d: 0.2 }); tl.set("#s16-p${i}", { className: "card pat on" }, ${cues["p" + i]} + 0.3);${i > 1 ? ` tl.set("#s16-p${i - 1}", { className: "card pat" }, ${cues["p" + i]} + 0.3);` : ""}`).join("\n    ")}
    tl.set("#s16-p5", { className: "card pat" }, ${cues.pratica});
    tl.set("#s16-ink", { opacity: 1 }, ${cues.pratica} + 0.1); arrive(tl, "#s16-ink", ${cues.pratica} + 0.1);
    exitCurve(tl, "#s16-stage", ${dur - 0.3});`;
    return root("tela16", dur, inner, css) + script("tela16", js);
  },

  // ------------------------------------------------------------------ TELA 17 · ATIVIDADE · MAPA DE OPORTUNIDADES
  tela17: ({ cues, dur }) => {
    const heads = ["Tarefa ou dor", "Valor buscado", "Tipo de IA", "Dado necessário", "Risco principal", "Como medir"];
    const ex = ["<b>Exemplo:</b> responder dúvidas repetidas de clientes sobre faturas", "Cliente e produtividade", "Generativa com base de conhecimento", "FAQ e histórico de chamados (existem, mas desatualizados)", "Resposta errada ao cliente", "% resolvido sem humano; tempo de atendimento"];
    const ctx = ["Reanálise de proposta de crédito que volta por documento faltante", "Sinistro simples que espera três dias por um parecer padrão", "Chargeback que o analista pesquisa à mão em quatro sistemas", "Pergunta de PLD que chega igual toda semana"];
    const inner = `
  <div class="stage" id="s17-stage">
    ${chrome("Módulo 1 · Aplicações", "17")}
    <div class="eyebrow" id="s17-eyebrow">Módulo 1 · Atividade em duplas · 15 min</div>
    <h2 class="title" id="s17-title">Mapa de oportunidades <em>da sua área</em></h2>
    <p class="sub" id="s17-sub">Liste três tarefas ou dores da sua área e preencha uma linha para cada. Guarde o resultado: ele volta no Módulo 3.</p>
    <div class="card" id="s17-tbl">
      <table>
        <tr>${heads.map((h, i) => `<th id="s17-h${i}">${h}</th>`).join("")}</tr>
        <tr class="ex">${ex.map((t, i) => `<td id="s17-e${i}">${t}</td>`).join("")}</tr>
        ${[1, 2, 3].map((n) => `<tr class="blank" id="s17-r${n}"><td>${n}.</td><td></td><td></td><td></td><td></td><td></td></tr>`).join("")}
      </table>
      <div class="chips"><span class="chip" id="s17-l0"><b>Valor:</b> produtividade, cliente ou decisão</span><span class="chip" id="s17-l1"><b>Tipo de IA:</b> preditiva, generativa, composta ou nenhuma</span></div>
      <div class="take" id="s17-take">Comece pela dor real, não pela tecnologia</div>
    </div>
    <div class="card" id="s17-ctx">
      <div class="k">No seu contexto</div>
      ${ctx.map((t, i) => `<div class="row" id="s17-x${i}"><span>${i + 1}</span>${t}</div>`).join("")}
      <div class="pause" id="s17-pause">Pause o vídeo · <b>10 min</b> · “nenhuma IA” é resposta válida; se uma regra resolve, escreva “regra”.</div>
    </div>
  </div>`;
    const css = `
  #root #s17-sub { top: 300px; width: 1300px; font-size: 24px; }
  #root #s17-tbl { left: 96px; top: 376px; width: 1304px; padding: 20px 24px; transform-origin: 50% 100%; }
  #root #s17-tbl table { width: 100%; border-collapse: collapse; table-layout: fixed; }
  #root #s17-tbl th { text-align: left; font-size: 15px; letter-spacing: .08em; text-transform: uppercase; color: #6B6B6B; padding: 8px 10px; border-bottom: 2px solid #E6E6E6; }
  #root #s17-tbl th.on { color: #C73E00; background: #FFEEE6; }
  #root #s17-tbl td { font-size: 16px; line-height: 1.3; color: #1A1A1A; padding: 10px; vertical-align: top; border-bottom: 1px solid #EDEDED; }
  #root #s17-tbl tr.ex td { background: #FAFAFA; } #root #s17-tbl tr.ex td b { color: #C73E00; }
  #root #s17-tbl tr.blank td { height: 44px; font-weight: 800; color: #767676; } #root #s17-tbl tr.blank.on td { background: #FFEEE6; }
  #root #s17-tbl .chips { display: flex; gap: 12px; margin-top: 14px; flex-wrap: wrap; }
  #root #s17-tbl .chip { background: #F1F1F1; border-radius: 999px; padding: 8px 16px; font-size: 17px; color: #1A1A1A; } #root #s17-tbl .chip b { color: #C73E00; }
  #root #s17-tbl .take { margin-top: 14px; font-size: 20px; font-weight: 800; color: #1A1A1A; border-left: 6px solid #FF5100; padding-left: 12px; }
  #root #s17-ctx { left: 1420px; top: 300px; width: 404px; height: 490px; padding: 22px 24px; transform-origin: 0% 50%; }
  #root #s17-ctx .k { font-size: 14px; letter-spacing: .14em; text-transform: uppercase; font-weight: 800; color: #6B6B6B; margin-bottom: 12px; }
  #root #s17-ctx .row { display: flex; gap: 10px; align-items: flex-start; font-size: 18px; line-height: 1.3; color: #1A1A1A; margin-bottom: 10px; }
  #root #s17-ctx .row span { flex: none; width: 26px; height: 26px; border-radius: 50%; background: #1A1A1A; color: #fff; display: grid; place-items: center; font-weight: 900; font-size: 14px; }
  #root #s17-ctx .pause { margin-top: 12px; background: #1A1A1A; color: #fff; border-radius: 12px; padding: 12px 14px; font-size: 17px; line-height: 1.3; } #root #s17-ctx .pause b { color: #FF9A66; }
`;
    const js = `
    hide("#s17-sub, #s17-tbl, tr.ex td, .chip, #s17-take, #s17-ctx, #s17-ctx .row, #s17-pause");
    enterCurve(tl, "#s17-stage", 0);
    waterfall(tl, ["#s17-tbl"], ${cues.intro} + 0.3, { y: 60, d: 0.22 });
    waterfall(tl, ["#s17-sub"], ${cues.folha}, { y: 30 });
    ${[1, 2, 3].map((n) => `tl.set("#s17-r${n}", { className: "blank on" }, ${cues.linhas} + ${(n - 1) * 0.25});`).join(" ")}
    ${[1, 2, 3].map((n) => `tl.set("#s17-r${n}", { className: "blank" }, ${cues.cols});`).join(" ")}
    // colunas: cada cabeçalho acende em sequência
    ${[1, 2, 3, 4, 5].map((i) => `tl.set("#s17-h${i}", { className: "on" }, ${cues.cols} + ${((i - 1) * 0.55).toFixed(2)});${i > 1 ? ` tl.set("#s17-h${i - 1}", { className: "" }, ${cues.cols} + ${((i - 1) * 0.55).toFixed(2)});` : ""}`).join("\n    ")}
    tl.set("#s17-h5", { className: "" }, ${cues.exemplo});
    // exemplo: a linha aparece célula a célula
    waterfall(tl, [${[0, 1, 2, 3, 4, 5].map((i) => `"#s17-e${i}"`).join(", ")}], ${cues.exemplo} + 0.2, { y: 16, d: 0.14, gap: 0.22 });
    waterfall(tl, ["#s17-ctx"], ${cues.exemplo} + 0.4, { y: 60, d: 0.2 });
    ${[0, 1, 2, 3].map((i) => `waterfall(tl, ["#s17-x${i}"], ${cues["ex" + (i + 1)]}, { y: 24, d: 0.16 });`).join(" ")}
    waterfall(tl, ["#s17-l0", "#s17-l1"], ${cues.ex4} + 0.8, { y: 20, d: 0.16, gap: 0.12 });
    waterfall(tl, ["#s17-pause"], ${cues.pausa}, { y: 24, d: 0.2 });
    waterfall(tl, ["#s17-take"], ${cues.regra} + 0.3, { y: 20, d: 0.16 });
    exitCurve(tl, "#s17-stage", ${dur - 0.3});`;
    return root("tela17", dur, inner, css) + script("tela17", js);
  },

  // ------------------------------------------------------------------ CARTÃO DE PAUSA (5 s, sem narrador)
  pausa: ({ dur }) => {
    const inner = `
  <div class="stage" id="p-stage">
    <div id="p-group">
      <div class="lab" id="p-lab">Atividade · Mapa de oportunidades da sua área</div>
      <div class="ttl" id="p-ttl">Pause o vídeo</div>
      <div class="big" id="p-big">10 min</div>
      <div class="sub" id="p-sub">Três linhas. Valor, tipo de IA, dado, risco, métrica. “Nenhuma IA” é resposta válida.</div>
    </div>
  </div>`;
    const css = `
  #root { background: #1A1A1A; }
  #root #p-group { position: absolute; left: 160px; top: 280px; width: 1600px; color: #fff; }
  #root #p-group .lab { font-size: 24px; letter-spacing: .14em; text-transform: uppercase; color: rgba(255,255,255,.7); font-weight: 800; }
  #root #p-group .ttl { margin-top: 24px; font-size: 120px; font-weight: 900; letter-spacing: -0.045em; line-height: 1; }
  #root #p-group .big { margin-top: 10px; font-size: 200px; font-weight: 900; letter-spacing: -0.06em; line-height: 1; color: #FF5100; }
  #root #p-group .sub { margin-top: 30px; font-size: 32px; color: rgba(255,255,255,.85); }
`;
    const js = `
    hide("#p-lab, #p-ttl, #p-big, #p-sub");
    waterfall(tl, ["#p-lab", "#p-ttl", "#p-big", "#p-sub"], 0.1, { y: 60, d: 0.22, gap: 0.1 });
    exitPush(tl, "#p-group", ${dur - 0.22}, 18, 1.2);`;
    return root("pausa", dur, inner, css) + script("pausa", js);
  },

  // ------------------------------------------------------------------ DECISÃO PARA LEVAR (tela cheia: gráficos em x>=1210)
  decisao: ({ cues, dur }) => {
    const inner = `
  <div class="stage" id="d-stage">
    <div class="card" id="d-card">
      <div class="kick" id="d-kick"><b>Mapa</b> O que você leva do Módulo 1</div>
      <div class="big" id="d-big">3</div>
      <div class="t" id="d-t">oportunidades <b>escritas</b>, com <b>risco e métrica</b>.</div>
      <div class="lab" id="d-lab">Algo que a maioria das diretorias não tem.</div>
    </div>
    <div class="card" id="d-south">
      <div class="kick"><b>South</b> South Design</div>
      <div class="t">O mapa é o ponto de partida.</div>
      <div class="step" id="d-s1"><span>1</span><div><b>Uma semana</b></div></div>
      <div class="step" id="d-s2"><span>2</span><div>Três linhas → um caso com <b>dado, risco e número</b></div></div>
    </div>
    <div id="d-next">
      <div class="lab" id="d-nl">Próximo episódio · Módulo 2</div>
      <div class="ttl" id="d-nt"><b>EP05</b> Preditiva, generativa ou nenhuma IA</div>
      <div class="embed" id="d-punch2">Devagar em<br><em>quando não usar.</em></div>
    </div>
  </div>`;
    const css = `
  #root { background: transparent; }
  #root #d-card, #root #d-south { left: 1210px; top: 120px; width: 650px; padding: 30px 34px; transform-origin: 50% 100%; }
  #root .kick { font-size: 18px; letter-spacing: .12em; text-transform: uppercase; color: #6B6B6B; font-weight: 800; margin-bottom: 22px; }
  #root .kick b { background: #C73E00; color: #fff; padding: 6px 12px; border-radius: 6px; margin-right: 12px; letter-spacing: 0; }
  #root #d-card .big { font-size: 170px; font-weight: 900; letter-spacing: -0.06em; line-height: .9; color: #FF5100; transform-origin: 0% 50%; }
  #root #d-card .t { font-size: 34px; font-weight: 700; line-height: 1.2; letter-spacing: -0.02em; color: #1A1A1A; margin-top: 14px; } #root #d-card .t b { color: #C73E00; font-weight: 900; }
  #root #d-card .lab { font-size: 22px; color: #4A4A4A; line-height: 1.3; margin-top: 22px; }
  #root #d-south .t { font-size: 30px; line-height: 1.25; color: #1A1A1A; margin-bottom: 22px; }
  #root .step { display: flex; gap: 14px; align-items: center; font-size: 26px; line-height: 1.3; margin-bottom: 16px; color: #1A1A1A; }
  #root .step span { flex: none; width: 38px; height: 38px; border-radius: 50%; background: #1A1A1A; color: #fff; display: grid; place-items: center; font-weight: 900; font-size: 19px; }
  #root .step b { color: #C73E00; font-weight: 900; }
  #root #d-next { position: absolute; left: 1210px; top: 200px; width: 650px; }
  #root #d-next .lab { font-size: 22px; letter-spacing: .14em; text-transform: uppercase; color: rgba(255,255,255,.7); font-weight: 800; margin: 0; }
  #root #d-next .ttl { font-size: 54px; font-weight: 900; color: #fff; letter-spacing: -0.04em; line-height: 1.05; margin-top: 16px; } #root #d-next .ttl b { color: #FF5100; margin-right: 14px; }
  #root #d-punch2 { position: static; margin-top: 44px; font-size: 72px; color: #fff; transform-origin: 0% 50%; } #root #d-punch2 em { font-style: normal; color: #FF5100; }
`;
    const js = `
    hide("#d-card, #d-kick, #d-big, #d-t, #d-lab, #d-south, #d-s1, #d-s2, #d-next .lab, #d-next .ttl, #d-punch2");
    tl.set("#d-card", { opacity: 1 }, ${cues.task});
    waterfall(tl, ["#d-card", "#d-kick", "#d-lab"], ${cues.task}, { y: 80, d: 0.22, gap: 0.1 });
    tl.set("#d-big", { opacity: 1 }, ${cues.tres}); arrive(tl, "#d-big", ${cues.tres}, 18);
    waterfall(tl, ["#d-t"], ${cues.tres} + 0.3, { y: 40, d: 0.2 });
    exitCurve(tl, "#d-card", ${cues.south});
    tl.set("#d-south", { opacity: 1 }, ${cues.south} + 0.15); enterCurve(tl, "#d-south", ${cues.south} + 0.15);
    waterfall(tl, ["#d-s1", "#d-s2"], ${cues.semana}, { y: 40, d: 0.2, gap: 0.3 });
    tl.to("#d-south", { y: -230, duration: 0.3, ease: "power4.in" }, ${cues.next} - 0.2);
    tl.to("#d-south", { opacity: 0, duration: 0.18, ease: "none" }, ${cues.next} - 0.2);
    waterfall(tl, ["#d-nl", "#d-nt"], ${cues.next} + 0.1, { y: 70, d: 0.2, gap: 0.09 });
    tl.set("#d-punch2", { opacity: 1 }, ${cues.punch2}); arrive(tl, "#d-punch2", ${cues.punch2});
    tl.to("#d-next", { y: -230, duration: 0.3, ease: "power4.in" }, ${dur - 0.3});
    tl.to("#d-next", { opacity: 0, duration: 0.18, ease: "none" }, ${dur - 0.3});`;
    return root("decisao", dur, inner, css) + script("decisao", js);
  },

  // ------------------------------------------------------------------ CARTÃO FINAL
  final: ({ scene, dur }) => {
    const inner = `
  <div class="stage" id="f-stage">
    <div id="f-bg"></div>
    <div id="f-group">
      <img id="f-logo" src="assets/south-logo.png" alt="South System">
      <div class="lab" id="f-lab">Próximo episódio</div>
      <div class="ttl" id="f-ttl">${scene.next}</div>
      <div class="ser" id="f-ser">South Academy Executive · Letramento de IA para líderes</div>
      <div class="int" id="f-int">Uso interno South System · Conteúdo Gartner consultado via Ask Gartner; não compartilhar fora da empresa.</div>
    </div>
    <div id="f-dark"></div>
  </div>`;
    const css = `
  #root { background: #FF5100; }
  #root #f-bg { position: absolute; inset: 0; background: url(assets/cover-bg.jpg) center / cover no-repeat; }
  #root #f-group { position: absolute; left: 160px; top: 320px; width: 1500px; }
  #root #f-logo { height: 46px; width: auto; display: block; filter: brightness(0) invert(1); }
  #root #f-group .lab { margin-top: 48px; font-size: 24px; letter-spacing: .14em; text-transform: uppercase; color: rgba(255,255,255,.8); font-weight: 800; }
  #root #f-group .ttl { margin-top: 14px; font-size: 92px; font-weight: 900; color: #fff; letter-spacing: -0.045em; line-height: 1.02; }
  #root #f-group .ser { margin-top: 28px; font-size: 30px; color: rgba(255,255,255,.9); font-weight: 600; }
  #root #f-group .int { margin-top: 60px; font-size: 18px; color: rgba(255,255,255,.7); }
  #root #f-dark { position: absolute; inset: 0; background: #1A1A1A; opacity: 0; }
`;
    const js = `
    tl.fromTo("#f-group", { y: 230, opacity: 0.35 }, { y: 0, opacity: 1, duration: 0.34, ease: "power4.out", immediateRender: false }, 0);
    tl.to("#f-dark", { opacity: 1, duration: 0.6, ease: "power2.in" }, ${dur - 0.65});`;
    return root("final", dur, inner, css) + script("final", js);
  },
});

// ------------------------------------------------------------------ TELAS GARTNER (figura + nota + zoom)
const LG = "4 Ways AI Will Change Your Legal Department Structure";
const HR = "How to Evaluate Use Cases for Generative AI in HR";
const PM = "AI in Performance Management: Established, Experimental and Controversial Use Cases";
const ST = "AI Use-Case Assessment for Strategy and Strategic Planning";
const SV = "Emerging Tech: Top AI Use Cases in IT Services";
const FIGS = {
  tela13a: { num: "13A", eyebrow: "Módulo 1 · Jurídico · <b>Gartner</b>", title: "Quatro formas como a IA <em>muda a estrutura do jurídico</em>", img: "fig-13a.webp", iw: 1800, ih: 1128,
    desc: "Quatro formas como a IA muda a estrutura do jurídico.",
    insights: ["A estrutura passa de <b>pirâmide para diamante</b>: menos base operacional.", "Gestores supervisionam pessoas e agentes de IA.", "Times se organizam por resultado de negócio e surgem papéis focados em IA."],
    key: "A IA muda o desenho do time, não só a ferramenta.", src: LG, zooms: { time: [0.64, 0.08, 0.34, 0.76] } },
  tela13b: { num: "13B", eyebrow: "Módulo 1 · Jurídico · <b>Gartner</b>", title: "Jurídico organizado por <em>resultados de negócio</em>", img: "fig-13b.webp", iw: 1800, ih: 1128,
    desc: "Exemplo de jurídico reorganizado por capacidades de negócio, em vez de especialidade.",
    insights: ["<b>Antes:</b> gerentes por área do direito (contencioso, trabalhista, contratos).", "<b>Depois:</b> gestores de produto jurídico, engenheiro jurídico e especialista em IA.", "Agentes de IA entram como parte do time."],
    key: "Organize o trabalho pelo resultado que o negócio precisa.", src: LG, zooms: { caixas: [0.66, 0.44, 0.34, 0.3] } },
  tela13c: { num: "13C", eyebrow: "Módulo 1 · Jurídico · <b>Gartner</b>", title: "A IA agêntica vai <em>transformar o trabalho jurídico</em>", img: "fig-13c.webp", iw: 1770, ih: 1057,
    desc: "Linha do tempo da IA agêntica no trabalho jurídico, de 2026 a 2029.",
    insights: ["<b>2026:</b> assistentes de IA na maioria das ferramentas jurídicas.", "<b>2027 e 2028:</b> agentes por tarefa e, depois, colaborando entre si.", "<b>2029:</b> agentes criados sob demanda, trabalhando com advogados."],
    key: "O jurídico precisa de regras de uso antes da escala.", src: "Predicts 2026: AI and Agentic AI Will Enable Legal Self-Service", zooms: { pan: [0.52, 0.1, 0.48, 0.8], regras: "fig" } },
  tela13d: { num: "13D", eyebrow: "Módulo 1 · Jurídico · <b>Gartner</b>", title: "Case LogicMonitor: <em>impacto na eficiência jurídica</em>", img: "fig-13d.webp", iw: 1273, ih: 1009,
    desc: "Painel do assistente de contratos da LogicMonitor desde o lançamento.",
    insights: ["<b>364</b> solicitações e <b>4.558</b> horas economizadas.", "Ganhos em redação, revisão, extração e análise de contratos.", "O cálculo é do fornecedor, <b>não auditado</b> pela Gartner."],
    key: "Bom para inspirar; antes de virar meta, meça a sua linha de base.", src: "Case Study: AI-Powered Contract Review to Accelerate Legal Operations (LogicMonitor)", zooms: { nums: [0.02, 0.08, 0.72, 0.28], honesto: [0.68, 0.36, 0.32, 0.4], meta: "fig" } },
  tela14a: { num: "14A", eyebrow: "Módulo 1 · Pessoas · <b>Gartner</b>", title: "Prisma de casos de uso de <em>IA em gestão de pessoas</em>", img: "fig-14a.webp", iw: 1273, ih: 866,
    desc: "Prisma com 20 casos de IA em gestão de pessoas por valor de negócio e viabilidade.",
    insights: ["Casos de recrutamento, aprendizagem e atendimento ao colaborador aparecem lado a lado.", "Os mais próximos do topo combinam <b>valor e viabilidade altos</b>.", "Decisões sobre pessoas pedem revisão humana e teste de viés."],
    key: "Priorize pelo par valor e viabilidade, não pela moda.", src: HR, zooms: { topo: [0.26, 0.06, 0.48, 0.46], par: "fig" } },
  tela14b: { num: "14B", eyebrow: "Módulo 1 · Pessoas · <b>Gartner</b>", title: "Casos de IA generativa <em>priorizados pelos líderes de RH</em>", img: "fig-14b.webp", iw: 1303, ih: 1124,
    desc: "Os casos de IA generativa priorizados por 132 líderes de RH.",
    insights: ["Tarefas administrativas e documentos lideram: <b>53%</b>.", "Descrição de cargos (52%) e chatbot para colaboradores (51%) vêm a seguir.", "Só <b>7%</b> não pretendem usar IA generativa."],
    key: "O RH começa pelo operacional repetitivo.", src: HR, zooms: { bars: [0.22, 0.05, 0.76, 0.3], certo: "fig" } },
  tela14c: { num: "14C", eyebrow: "Módulo 1 · Pessoas · <b>Gartner</b>", title: "Gestão de desempenho: <em>adoção da IA generativa</em>", img: "fig-14c.webp", iw: 1800, ih: 1128,
    desc: "Adoção de IA generativa em três usos da gestão de desempenho.",
    insights: ["Resumo de feedback: <b>38%</b> já usam.", "Planos de desenvolvimento: 24% usam e 40% planejam.", "Notas de desempenho: <b>60%</b> não pretendem usar IA."],
    key: "IA ajuda a escrever e resumir; quem avalia é o gestor.", src: PM, zooms: { feedback: [0.26, 0.37, 0.64, 0.26], nota: [0.26, 0.16, 0.64, 0.26], gestor: "fig" } },
  tela14d: { num: "14D", eyebrow: "Módulo 1 · Pessoas · <b>Gartner</b>", title: "Gestão de desempenho: <em>risco × retorno das aplicações de IA</em>", img: "fig-14d.webp", iw: 1800, ih: 1128,
    desc: "Risco × retorno das aplicações de IA na gestão de desempenho.",
    insights: ["<b>Adotar:</b> planos de desenvolvimento, apoio para metas, resumo e escrita de feedback.", "<b>Equilibrar:</b> resumo de indicadores e preparação da calibração.", "<b>Evitar:</b> dar a nota de desempenho, inferir comportamento e criar planos de melhoria."],
    key: "Quanto mais a IA decide sobre pessoas, maior o risco.", src: PM, zooms: { adopt: [0.08, 0.1, 0.46, 0.5], balance: [0.52, 0.1, 0.44, 0.45], avoid: [0.52, 0.42, 0.44, 0.42] },
    extra: `<div class="embed" id="s14d-embed">Quanto mais a IA toca em pessoas,<br><em>maior o risco.</em></div>` },
  tela16a: { num: "16A", eyebrow: "Módulo 1 · Estratégia e serviços de TI · <b>Gartner</b>", title: "Estratégia e planejamento: <em>valor × viabilidade</em>", img: "fig-16a.webp", iw: 1800, ih: 1079,
    desc: "Casos de IA em estratégia e planejamento por valor e viabilidade.",
    insights: ["<b>Ganhos prováveis:</b> monitoramento externo, inteligência competitiva, insights de cliente e produto, assistentes de cenário e previsão.", "<b>Riscos calculados:</b> gêmeo digital da organização e planejamento de cenários com agentes.", "<b>Ganhos marginais:</b> redação de estratégia com IA generativa."],
    key: "A IA ajuda mais a enxergar o mercado do que a escrever a estratégia.", src: ST, zooms: { likely: [0.55, 0.05, 0.42, 0.55], drafting: [0.6, 0.5, 0.38, 0.3], mercado: "fig" } },
  tela16b: { num: "16B", eyebrow: "Módulo 1 · Estratégia e serviços de TI · <b>Gartner</b>", title: "Estratégia e planejamento: <em>pipeline de casos de uso</em>", img: "fig-16b.webp", iw: 1800, ih: 1079,
    desc: "Em que etapa do ciclo de estratégia cada caso de IA atua.",
    insights: ["Do monitoramento do ambiente à adaptação da estratégia.", "A maioria dos casos atua no início (<b>monitorar e formular</b>) e no fim (<b>adaptar</b>).", "Monitorar o ambiente é o ponto de partida mais simples."],
    key: "Comece usando IA para enxergar mudanças cedo.", src: ST, zooms: { cedo: [0.1, 0.04, 0.42, 0.9] } },
  tela16c: { num: "16C", eyebrow: "Módulo 1 · Estratégia e serviços de TI · <b>Gartner</b>", title: "Estratégia e planejamento: <em>scorecard</em>", img: "fig-16c.webp", iw: 1800, ih: 1079,
    desc: "A nota dos casos de estratégia em valor (receita, eficiência, risco) e viabilidade.",
    insights: ["Inteligência competitiva e insights de cliente pontuam alto em receita.", "Monitoramento externo e previsão com agentes ajudam a reduzir risco.", "A <b>viabilidade externa</b> (oferta de produtos) já é alta na maioria."],
    key: "Já existe ferramenta pronta para os casos de maior valor.", src: ST, zooms: { external: [0.68, 0.06, 0.3, 0.9] } },
  tela16d: { num: "16D", eyebrow: "Módulo 1 · Estratégia e serviços de TI · <b>Gartner</b> · corte opcional", title: "Serviços de IA: <em>insights e recomendações</em>", img: "fig-16d.webp", iw: 2200, ih: 1697,
    desc: "Insights e recomendações da Gartner sobre serviços de IA.",
    insights: ["IA melhora o engajamento com clientes e a eficiência operacional.", "Empresas usam IA para organizar dados e gerar insights.", "Assistência preditiva melhora a qualidade das decisões."],
    key: "Valor vem de dados organizados, não só do modelo.", src: SV, zooms: {} },
  tela16e: { num: "16E", eyebrow: "Módulo 1 · Estratégia e serviços de TI · <b>Gartner</b>", title: "Serviços de IA: <em>casos mais adotados</em>", img: "fig-16e.webp", iw: 2200, ih: 1898,
    desc: "Os casos de uso de IA mais adotados, em percentual do total (171 casos).",
    insights: ["Engajamento do cliente lidera: <b>17%</b>.", "Dados e analytics (13%), conteúdo com IA generativa (12%) e assistência preditiva (11%) vêm a seguir.", "IA conversacional e análise de texto: 9% cada."],
    key: "O mercado começa pelo cliente e pelos dados.", src: SV, zooms: { bar: [0.22, 0.03, 0.74, 0.2], cliente: "fig" } },
};
for (const [id, cfg] of Object.entries(FIGS)) {
  const base = figScene(id, cfg);
  SCENES_EP04[id] = (ctx) => {
    const { inner, css, js } = base(ctx);
    const { cues, dur } = ctx;
    if (id === "tela14d") {
      // parábola do gerente de agência: a figura recua, o cartão da história chega; o embed fecha sobre a figura escurecida
      const extraCss = `
  #root #s14d-quote { left: 96px; top: 290px; width: 1110px; height: 710px; padding: 44px 48px; border-left: 12px solid #FF5100; transform-origin: 0% 50%; }
  #root #s14d-quote .q { font-size: 42px; font-weight: 700; letter-spacing: -0.03em; line-height: 1.15; } #root #s14d-quote .q b { color: #FF5100; font-weight: 900; }
  #root #s14d-quote .l { font-size: 34px; font-weight: 700; margin-top: 26px; color: #1A1A1A; } #root #s14d-quote .l b { color: #C73E00; font-weight: 900; }
  #root #s14d-quote .l.big { font-size: 52px; letter-spacing: -0.03em; line-height: 1.1; margin-top: 40px; }
  #root #s14d-embed { left: 96px; top: 290px; width: 1110px; height: 710px; font-size: 88px; color: #fff; text-align: center; padding-top: 200px; transform-origin: 50% 50%; } #root #s14d-embed em { font-style: normal; color: #FF9A66; }
  #root #s14d-log { position: absolute; left: 96px; top: 880px; width: 1110px; text-align: center; font-size: 34px; font-weight: 700; color: #fff; }
`;
      const extraJs = `
    hide("#s14d-quote, #s14d-quote .q, #s14d-quote .l, #s14d-embed, #s14d-log");
    tl.to("#tela14d-fig", { scale: 0.8, opacity: 0.15, filter: "blur(10px)", duration: 0.25, ease: "power3.in" }, ${cues.parabola});
    tl.set("#tela14d-fig", { opacity: 0 }, ${cues.parabola} + 0.25);
    tl.set("#s14d-quote", { opacity: 1 }, ${cues.parabola} + 0.2); arrive(tl, "#s14d-quote", ${cues.parabola} + 0.2);
    waterfall(tl, ["#s14d-q1"], ${cues.parabola} + 0.5, { y: 40 });
    waterfall(tl, ["#s14d-l1"], ${cues.nada}, { y: 40 });
    waterfall(tl, ["#s14d-l2"], ${cues.olhar}, { y: 40 });
    waterfall(tl, ["#s14d-l3"], ${cues.decidiu}, { y: 50, d: 0.22 });
    tl.to("#s14d-quote", { scale: 0.8, opacity: 0, filter: "blur(10px)", duration: 0.25, ease: "power3.in" }, ${cues.embed} - 0.05);
    tl.set("#tela14d-fig", { scale: 1, opacity: 1, filter: "brightness(0.25) blur(0px)" }, ${cues.embed} + 0.2);
    tl.set("#s14d-embed", { opacity: 1 }, ${cues.embed} + 0.2); arrive(tl, "#s14d-embed", ${cues.embed} + 0.2, 18);
    waterfall(tl, ["#s14d-log"], ${cues.log}, { y: 30 });`;
      const quote = `
    <div class="card" id="s14d-quote">
      <div class="q" id="s14d-q1">O gerente de agência recebe um <b>ranking de risco de desligamento</b> da equipe.</div>
      <div class="l" id="s14d-l1">Ele <b>não fez nada</b> com o ranking.</div>
      <div class="l" id="s14d-l2">Mas passou a <b>olhar diferente</b> para quem estava no topo da lista.</div>
      <div class="l big" id="s14d-l3">A IA não decidiu nada.<br><b>E mesmo assim decidiu.</b></div>
    </div>
    <div id="s14d-log">E parte desse risco não aparece em nenhum log.</div>`;
      return root(id, dur, inner.replace("\n  </div>", quote + "\n  </div>"), css + extraCss) + script(id, js + extraJs);
    }
    return root(id, dur, inner, css) + script(id, js);
  };
}

export const SCENES = SCENES_EP04;
