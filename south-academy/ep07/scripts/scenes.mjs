/**
 * scenes.mjs — templates das cenas (cabeçalho compartilhado desde o EP01).
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



const SCENES_EP07 = {};

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
const figScene = (id, { num, crumb = "Módulo 3 · Priorização", eyebrow, title, img, iw, ih, desc, insights, key = "", src, zooms = {}, extra = "" }) =>
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


// ---------------------------------------------------------------------------------------------
// EP07 · Carteira, não coleção de pilotos (Módulo 3)
// Regra das cenas de tela cheia (gancho, decisão): gráficos e legendas em x >= 1210 (o vídeo do
// narrador ocupa x < 1140). Telas com narrador no canto: nada em x > 1472 e y > 807.
// ---------------------------------------------------------------------------------------------

const CRUMB = "Módulo 3 · Priorização";
const CP_CSS = `
  #root .card.cp { top: 300px; width: 420px; height: 330px; padding: 24px 28px; transform-origin: 50% 100%; }
  #root .card.cp h4 { font-size: 26px; margin-top: 12px; } #root .card.cp h4 em { font-style: normal; color: #FF5100; }
  #root .card.cp h4.on { color: #C73E00; }
  #root .card.cp .k { font-size: 14px; letter-spacing: .14em; text-transform: uppercase; font-weight: 800; color: #6B6B6B; margin-top: 0; }
  #root .card.cp p.on { color: #C73E00; font-weight: 800; }
  #root .card.cp.ink { background: #1A1A1A; color: #fff; } #root .card.cp.ink p { color: rgba(255,255,255,.85); } #root .card.cp.ink .k { color: #FF9A66; } #root .card.cp.ink h4 em { color: #FF9A66; } #root .card.cp.ink p.on { color: #FF9A66; }
  #root .side { position: absolute; left: 1420px; top: 300px; width: 404px; display: flex; flex-direction: column; gap: 14px; }
  #root .side .card { position: static; padding: 20px 22px; transform-origin: 0% 50%; }
  #root .side .card .k { font-size: 13px; letter-spacing: .14em; text-transform: uppercase; font-weight: 800; color: #6B6B6B; margin-bottom: 10px; }
  #root .side .card .t { font-size: 22px; line-height: 1.3; color: #1A1A1A; } #root .side .card .t b { color: #C73E00; font-weight: 900; }
  #root .side .chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
  #root .side .chip { background: #1A1A1A; color: #FF9A66; font-size: 17px; font-weight: 800; padding: 7px 14px; border-radius: 999px; }
  #root .side .card.ink { background: #1A1A1A; } #root .side .card.ink .k { color: #FF9A66; } #root .side .card.ink .t { color: #fff; } #root .side .card.ink .t b { color: #FF9A66; }
  #root .band.low { top: 736px; width: 1300px; transform-origin: 0% 50%; }
  #root .ask.low { top: 830px; width: 1290px; }
  #root .tbl { left: 96px; top: 300px; width: 1300px; padding: 16px 20px; transform-origin: 50% 100%; }
  #root .tbl table { width: 100%; border-collapse: collapse; table-layout: fixed; }
  #root .tbl th { text-align: left; padding: 8px 12px 12px; border-bottom: 2px solid #E6E6E6; font-size: 15px; letter-spacing: .1em; text-transform: uppercase; font-weight: 800; color: #6B6B6B; }
  #root .tbl th.on { color: #C73E00; }
  #root .tbl td { font-size: 17px; line-height: 1.3; color: #1A1A1A; padding: 9px 12px; vertical-align: top; border-bottom: 1px solid #EDEDED; }
  #root .tbl td.k1 { font-size: 15px; letter-spacing: .06em; text-transform: uppercase; font-weight: 800; color: #6B6B6B; padding-top: 11px; }
  #root .tbl td.lv1 { color: #8A3A2A; } #root .tbl td.lv5 { color: #1B7A3E; }
  #root .tbl tr.on td { background: #FFEEE6; } #root .tbl tr.on td.k1 { color: #C73E00; }
  #root .quote { left: 96px; top: 300px; width: 1300px; height: 480px; padding: 36px 44px; border-left: 12px solid #FF5100; transform-origin: 0% 50%; }
  #root .quote .q { font-size: 34px; font-weight: 700; letter-spacing: -0.03em; line-height: 1.15; } #root .quote .q b { color: #FF5100; font-weight: 900; }
  #root .quote .l { font-size: 27px; font-weight: 700; margin-top: 14px; color: #1A1A1A; } #root .quote .l b { color: #C73E00; font-weight: 900; }
  #root .quote .l.big { font-size: 42px; letter-spacing: -0.03em; line-height: 1.1; margin-top: 20px; }
  #root .quote .score { display: inline-flex; gap: 10px; align-items: center; background: #FFEEE6; border-radius: 10px; padding: 6px 14px; margin-right: 12px; font-size: 24px; } #root .quote .score b { color: #C73E00; font-size: 30px; }
  #root .stepcard { position: static; display: flex; align-items: center; gap: 12px; padding: 10px 16px; font-size: 19px; color: #1A1A1A; transform-origin: 0% 50%; }
  #root .stepcard .n { flex: none; width: 30px; height: 30px; border-radius: 50%; background: #1A1A1A; color: #fff; display: grid; place-items: center; font-weight: 900; font-size: 15px; }
  #root .stepcard b { color: #C73E00; font-weight: 900; }
  #root .stepcard.on { outline: 3px solid #FF5100; }
`;

Object.assign(SCENES_EP07, {
  // ------------------------------------------------------------------ GANCHO FRIO (tela cheia: gráficos em x>=1210)
  gancho: ({ cues, dur }) => {
    const inner = `
  <div class="stage" id="g-stage">
    <div id="g-kicker"><b>EP07</b> Carteira, não coleção de pilotos</div>
    <div class="card" id="g-count">
      <div class="k">Iniciativas de IA · diretor de operações</div>
      <div class="row"><span class="n" id="g-n">17</span><span class="l" id="g-l">no EP01</span></div>
      <div class="chips"><span class="chip" id="g-c0">nenhuma morreu</span><span class="chip" id="g-c1">nenhuma escalou</span></div>
      <div class="stamp" id="g-stamp">COLEÇÃO DE PILOTOS</div>
    </div>
    <div class="card ink" id="g-punch"><div class="a">Hoje:</div><div class="b"><s>coleção</s> → <em>carteira</em></div></div>
  </div>`;
    const css = `
  #root { background: transparent; }
  #root #g-kicker { position: absolute; left: 1210px; top: 64px; font-size: 22px; color: rgba(255,255,255,.75); letter-spacing: .06em; text-transform: uppercase; font-weight: 600; }
  #root #g-kicker b { color: #fff; background: #FF5100; padding: 6px 12px; border-radius: 6px; margin-right: 14px; font-weight: 900; }
  #root #g-count { left: 1210px; top: 140px; width: 650px; padding: 24px 30px; }
  #root #g-count .k { font-size: 14px; letter-spacing: .12em; text-transform: uppercase; color: #6B6B6B; font-weight: 800; margin-bottom: 10px; padding-right: 300px; line-height: 1.3; }
  #root #g-count .row { display: flex; align-items: baseline; gap: 18px; }
  #root #g-count .n { font-size: 150px; font-weight: 900; letter-spacing: -0.06em; line-height: .9; color: #FF5100; }
  #root #g-count .l { font-size: 28px; color: #4A4A4A; font-weight: 600; }
  #root #g-count .chips { display: flex; gap: 10px; margin-top: 18px; } #root #g-count .chip { background: #1A1A1A; color: #FF9A66; font-size: 22px; font-weight: 800; padding: 8px 18px; border-radius: 999px; }
  #root .stamp { position: absolute; right: 22px; top: 18px; font-size: 26px; font-weight: 900; color: #fff; background: #C73E00; padding: 6px 16px; border-radius: 10px; transform: rotate(-8deg); letter-spacing: .04em; }
  #root #g-punch { left: 1210px; top: 520px; width: 650px; padding: 28px 34px; background: #1A1A1A; color: #fff; border: 2px solid rgba(255,255,255,.12); transform-origin: 0% 50%; }
  #root #g-punch .a { font-size: 28px; font-weight: 700; color: rgba(255,255,255,.75); }
  #root #g-punch .b { font-size: 56px; font-weight: 900; letter-spacing: -0.04em; line-height: 1.05; margin-top: 8px; } #root #g-punch em { font-style: normal; color: #FF9A66; } #root #g-punch s { color: rgba(255,255,255,.45); }
`;
    const js = `
    hide("#g-kicker, #g-count, #g-count .chip, #g-stamp, #g-punch");
    tl.set("#g-kicker", { opacity: 1 }, ${cues.open});
    tl.fromTo("#g-kicker", { x: 60 }, { x: 0, duration: 0.5, ease: "power4.out", immediateRender: false }, ${cues.open});
    waterfall(tl, ["#g-count"], ${cues.open} + 0.3, { y: 60, d: 0.2 });
    // "eram vinte e três": o número sobe de 17 para 23
    countUp(tl, "#g-n", 23, ${cues.vinte} + 0.3, { dur: 1.0, from: 17 });
    tl.set("#g-l", { textContent: "seis meses depois" }, ${cues.vinte} + 0.3);
    waterfall(tl, ["#g-c0", "#g-c1"], ${cues.nenhuma} + 0.2, { y: 20, d: 0.16, gap: 0.9 });
    tl.set("#g-stamp", { opacity: 1 }, ${cues.nome} + 0.6);
    tl.fromTo("#g-stamp", { scale: 2.2, rotation: -8 }, { scale: 1, rotation: -8, duration: 0.4, ease: "expo.out", immediateRender: false }, ${cues.nome} + 0.6);
    tl.set("#g-punch", { opacity: 1 }, ${cues.carteira} + 0.1); arrive(tl, "#g-punch", ${cues.carteira} + 0.1);
    exitCurve(tl, "#g-kicker", ${dur - 0.3}); exitCurve(tl, "#g-count", ${dur - 0.3}); exitCurve(tl, "#g-punch", ${dur - 0.3});`;
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
      <div id="v-ep"><span class="w" id="v-e0">EP07</span><span class="w" id="v-e1">Carteira, não coleção de pilotos</span></div>
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

  // ------------------------------------------------------------------ TELA 29 · DIVISÓRIA · MÓDULO 3
  tela29: ({ cues, dur }) => {
    const chips = ["Valor de negócio", "Viabilidade", "Riscos e dependências", "Matriz de decisão"];
    const inner = `
  <div class="stage" id="s29-stage">
    <div id="s29-net"></div>
    ${chrome(CRUMB, "29", true)}
    <div id="s29-num" aria-hidden="true" data-contrast-allow="decorative">03</div>
    <div id="s29-body">
      <div class="eyebrow light" id="s29-eye">Módulo 3 · <b>Priorização do portfólio de dados e IA</b></div>
      <h1 id="s29-title"><span class="w" id="s29-t0">Quais iniciativas merecem</span><span class="w" id="s29-t1"><em>começar primeiro?</em></span></h1>
      <p id="s29-note">Valor de negócio, viabilidade, riscos e dependências. No fim, cada ideia recebe uma decisão: <b>iniciar, preparar melhor ou adiar.</b></p>
      <div id="s29-chips">${chips.map((a, i) => `<span class="chip" id="s29-a${i}">${a}</span>`).join("")}</div>
      <div id="s29-dec"><span class="d" id="s29-d0">iniciar</span><span class="d" id="s29-d1">preparar melhor</span><span class="d" id="s29-d2">adiar</span></div>
      <div id="s29-mapa">Mapa do <b>EP04</b> na mão.</div>
    </div>
  </div>`;
    const css = `
  #root { background: #FF5100; }
  #root #s29-net { position: absolute; inset: 0; background: url(assets/cover-bg.jpg) center / cover no-repeat; }
  #root #s29-eye { position: static; } #root .eyebrow.light { color: rgba(255,255,255,.85); } #root .eyebrow.light b { color: #fff; }
  #root #s29-num { position: absolute; right: 120px; top: 150px; font-size: 420px; font-weight: 900; letter-spacing: -0.06em; color: rgba(255,154,102,.6); line-height: 1; }
  #root #s29-body { position: absolute; left: 96px; top: 168px; width: 1300px; }
  #root #s29-title { margin-top: 100px; font-size: 96px; line-height: 1.02; font-weight: 900; letter-spacing: -0.045em; color: #fff; }
  #root #s29-title em { font-style: normal; color: #1A1A1A; }
  #root #s29-note { margin-top: 26px; width: 1150px; font-size: 27px; line-height: 1.45; color: rgba(255,255,255,.92); }
  #root #s29-note b { color: #fff; }
  #root #s29-chips { margin-top: 30px; display: flex; flex-wrap: wrap; gap: 12px; width: 1300px; }
  #root .chip { display: inline-block; background: rgba(255,255,255,.14); border: 2px solid rgba(255,255,255,.35); color: #fff; font-size: 24px; font-weight: 700; padding: 12px 22px; border-radius: 999px; }
  #root #s29-dec { margin-top: 22px; display: flex; gap: 12px; } #root #s29-dec .d { background: #1A1A1A; color: #FF9A66; font-size: 26px; font-weight: 900; padding: 10px 22px; border-radius: 12px; }
  #root #s29-mapa { margin-top: 22px; font-size: 28px; color: #fff; font-weight: 600; } #root #s29-mapa b { color: #1A1A1A; font-weight: 900; }
  #root .w { display: inline-block; margin-right: .22em; }
`;
    const js = `
    hide("#s29-num, #s29-eye, .w, #s29-note, .chip, #s29-dec .d, #s29-mapa");
    enterPush(tl, "#s29-body", 0, 18);
    waterfall(tl, ["#s29-num"], 0.1, { y: 90, d: 0.25 });
    waterfall(tl, ["#s29-eye"], ${cues.title}, { y: 40 });
    waterfall(tl, ["#s29-t0", "#s29-t1"], ${cues.title} + 0.2, { y: 80, d: 0.2, gap: 0.1 });
    waterfall(tl, ["#s29-note"], ${cues.title} + 0.7, { y: 40 });
    waterfall(tl, [${chips.map((_, i) => `"#s29-a${i}"`).join(", ")}], ${cues.chips} + 0.2, { y: 40, d: 0.14, gap: 0.45 });
    waterfall(tl, ["#s29-d0", "#s29-d1", "#s29-d2"], ${cues.decisoes} + 2.2, { y: 30, d: 0.16, gap: 0.6 });
    waterfall(tl, ["#s29-mapa"], ${cues.mapa} + 0.2, { y: 30 });
    exitCurve(tl, "#s29-stage", ${dur - 0.3});`;
    return root("tela29", dur, inner, css) + script("tela29", js);
  },

  // ------------------------------------------------------------------ TELA 30 · SEM MÉTODO, A CARTEIRA VIRA COLEÇÃO DE PILOTOS
  tela30: ({ cues, dur }) => {
    const stats = [[75, "das iniciativas sem objetivo de negócio definido desde o início <b>não vão gerar valor</b> até 2029", "bad"], [40, "das provas de conceito de IA <b>chegam à produção</b>", ""], [54, "citam a <b>dificuldade de medir valor</b> como uma das maiores barreiras", "bad"]];
    const inner = `
  <div class="stage" id="s30-stage">
    ${chrome(CRUMB, "30")}
    <div class="eyebrow" id="s30-eyebrow">Módulo 3 · Por que priorizar</div>
    <h2 class="title" id="s30-title">Sem método, a carteira vira <em>coleção de pilotos</em></h2>
    <div id="s30-stats">${stats.map((s, i) => `<div class="st ${s[2]}" id="s30-s${i + 1}"><div class="n" id="s30-n${i + 1}">${s[0]}%</div><div class="l">${s[1]}</div></div>`).join("")}</div>
    <div class="card cp rule" id="s30-r1"><h4 id="s30-h1">Pontue com critério, <em>não com debate</em></h4><p>Critérios definidos e iguais para todas as ideias tornam a comparação transparente e aceleram o consenso.</p><p class="x" id="s30-x1">O debate favorece <b>quem fala melhor</b>. O critério, <b>a ideia melhor</b>.</p></div>
    <div class="card cp rule ink" id="s30-r2"><h4 id="s30-h2">Respeite <em>a maturidade</em></h4><p id="s30-p2">Tentar casos acima da maturidade da área é uma das principais causas de fracasso.</p><div class="chips"><span class="chip" id="s30-c0">Engatinhar</span><span class="chip" id="s30-c1">→ Andar</span><span class="chip" id="s30-c2">→ Correr</span></div></div>
    <div class="ask low" id="s30-ask"><span class="k">Pergunta</span><p>Quantas iniciativas de IA vocês conhecem na empresa? Quantas <em id="s30-q2">têm um objetivo de negócio escrito?</em></p></div>
    <div class="src">Fontes: Gartner — Enterprise Architects Enable AI Value for Corporate Finance; Construct AI Use Case Portfolios for B2B Commerce.</div>
  </div>`;
    const css = `${CP_CSS}
  #root #s30-title { font-size: 54px; width: 1700px; }
  #root #s30-stats { position: absolute; left: 96px; top: 300px; width: 630px; display: flex; flex-direction: column; gap: 12px; }
  #root .st { display: grid; grid-template-columns: 190px 1fr; align-items: center; gap: 16px; background: #fff; border-radius: 16px; padding: 16px 22px; box-shadow: 0 1px 2px rgba(26,26,26,.04), 0 14px 40px -24px rgba(26,26,26,.18); transform-origin: 50% 100%; }
  #root .st .n { font-size: 64px; font-weight: 900; letter-spacing: -0.05em; line-height: 1; color: #1A1A1A; } #root .st.bad .n { color: #C73E00; }
  #root .st .l { font-size: 19px; line-height: 1.3; color: #4A4A4A; } #root .st .l b { color: #1A1A1A; font-weight: 800; }
  #root .card.cp.rule { left: 756px; width: 640px; height: 236px; padding: 20px 26px; }
  #root #s30-r1 { top: 300px; } #root #s30-r2 { top: 552px; }
  #root .card.cp.rule h4 { font-size: 27px; margin-top: 0; } #root .card.cp.rule p { font-size: 18px; margin-top: 8px; line-height: 1.35; }
  #root .card.cp.rule p.x { color: #C73E00; font-weight: 700; } #root .card.cp.rule p.x b { font-weight: 900; }
  #root .card.cp.rule .chips { display: flex; gap: 10px; margin-top: 12px; } #root .card.cp.rule .chip { background: rgba(255,255,255,.12); border: 2px solid rgba(255,255,255,.3); color: #fff; font-size: 19px; font-weight: 800; padding: 6px 14px; border-radius: 999px; }
  #root .card.cp.rule .chip.on { background: #FF5100; border-color: #FF5100; }
  #root #s30-q2.on { background: #FFEEE6; padding: 0 6px; border-radius: 6px; }
`;
    const js = `
    hide(".st, .card.cp, #s30-x1, .chip, #s30-ask");
    enterCurve(tl, "#s30-stage", 0);
    ${[1, 2, 3].map((i) => `waterfall(tl, ["#s30-s${i}"], ${cues["n" + i]}, { y: 50, d: 0.2 }); countUp(tl, "#s30-n${i}", ${stats[i - 1][0]}, ${cues["n" + i]} + 0.2, { dur: 1.0, suffix: "%" });`).join("\n    ")}
    waterfall(tl, ["#s30-r1"], ${cues.r1}, { y: 60, d: 0.2 });
    waterfall(tl, ["#s30-x1"], ${cues.r1b} + 0.2, { y: 20 });
    waterfall(tl, ["#s30-r2"], ${cues.r2}, { y: 60, d: 0.2 });
    tl.set("#s30-p2", { className: "on" }, ${cues.r2b} + 0.2); press(tl, "#s30-p2", ${cues.r2b} + 0.2);
    waterfall(tl, ["#s30-c0", "#s30-c1", "#s30-c2"], ${cues.chips} + 0.2, { y: 16, d: 0.16, gap: 0.7 });
    ${[0, 1, 2].map((i) => `tl.set("#s30-c${i}", { className: "chip on" }, ${cues.chips} + ${(0.4 + i * 0.7).toFixed(1)});${i > 0 ? ` tl.set("#s30-c${i - 1}", { className: "chip" }, ${cues.chips} + ${(0.4 + i * 0.7).toFixed(1)});` : ""}`).join(" ")}
    waterfall(tl, ["#s30-ask"], ${cues.q1} + 0.2, { y: 60, d: 0.2 });
    tl.set("#s30-q2", { className: "on" }, ${cues.q2} + 0.3);
    exitCurve(tl, "#s30-stage", ${dur - 0.3});`;
    return root("tela30", dur, inner, css) + script("tela30", js);
  },

  // ------------------------------------------------------------------ TELA 31 · DEFENDER, EXPANDIR E TRANSFORMAR
  tela31: ({ cues, dur }) => {
    const cards = [["Retorno em 3 a 6 meses", "Defender", "Eficiência e paridade com a concorrência. Menor risco.", "faturas, resumo de chamados."], ["Retorno em 6 a 12 meses", "Expandir", "Diferenciação por processos complexos. Risco médio a alto.", "triagem de N1, previsão de churn."], ["12 a 24 meses ou mais", "Transformar", "Novos modelos de negócio e receitas. Maior risco.", "novos serviços baseados em IA."]];
    const inner = `
  <div class="stage" id="s31-stage">
    ${chrome(CRUMB, "31")}
    <div class="eyebrow" id="s31-eyebrow">Módulo 3 · Equilíbrio da carteira</div>
    <h2 class="title" id="s31-title">Defender, expandir e <em>transformar</em></h2>
    <div id="s31-time"><span>Menor risco · retorno rápido</span><div class="ln"></div><span>Maior risco · retorno longo</span></div>
    ${cards.map((c, i) => `<div class="card cp g3 ${i === 2 ? "ink" : ""}" id="s31-c${i + 1}" style="left:${96 + i * 442}px"><div class="k">${c[0]}</div><h4>${c[1]}</h4><p>${c[2]}</p><p><b>Ex. no nosso contexto:</b> ${c[3]}</p></div>`).join("")}
    <div class="side"><div class="card ink" id="s31-ceo"><div class="k">Cadeira: CEO</div><div class="t">Se for tudo "defender", você está <b>protegendo margem</b>. Mas não está <b>construindo diferença</b>.</div></div></div>
    <div class="ask low" id="s31-ask"><span class="k">Pergunta</span><p>Se a carteira de IA da sua área fosse uma pizza, <em>quanto dela seria "defender" hoje?</em></p></div>
    <div class="src">Fonte: Gartner — Construct AI Use Case Portfolios for B2B Commerce (via Ask Gartner, out/2026).</div>
  </div>`;
    const css = `${CP_CSS}
  #root #s31-time { position: absolute; left: 96px; top: 300px; width: 1300px; display: flex; align-items: center; gap: 16px; font-size: 18px; letter-spacing: .08em; text-transform: uppercase; font-weight: 800; color: #6B6B6B; }
  #root #s31-time .ln { flex: 1; height: 4px; background: linear-gradient(90deg, #1A1A1A, #FF5100); border-radius: 2px; transform-origin: 0 50%; }
  #root .card.cp.g3 { top: 356px; height: 360px; }
  #root .card.cp.g3 h4 { font-size: 40px; letter-spacing: -0.03em; margin-top: 10px; } #root .card.cp.g3 p { font-size: 19px; margin-top: 12px; } #root .card.cp.g3 p b { color: #C73E00; }
  #root .card.cp.g3.ink h4 { color: #FF9A66; } #root .card.cp.g3.ink p b { color: #FF9A66; }
`;
    const js = `
    hide("#s31-time, .card.cp, #s31-ceo, #s31-ask");
    enterCurve(tl, "#s31-stage", 0);
    waterfall(tl, ["#s31-time"], ${cues.intro} + 0.2, { y: 24 });
    tl.fromTo("#s31-time .ln", { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: "power3.out", immediateRender: false }, ${cues.intro} + 0.3);
    ${[1, 2, 3].map((i) => `waterfall(tl, ["#s31-c${i}"], ${cues["c" + i]} + 0.2, { y: 70, d: 0.22 });`).join(" ")}
    waterfall(tl, ["#s31-ask"], ${cues.pizza} + 0.3, { y: 60, d: 0.2 });
    tl.set("#s31-ceo", { opacity: 1 }, ${cues.tudo} + 0.2); arrive(tl, "#s31-ceo", ${cues.tudo} + 0.2);
    exitCurve(tl, "#s31-stage", ${dur - 0.3});`;
    return root("tela31", dur, inner, css) + script("tela31", js);
  },

  // ------------------------------------------------------------------ TELA 32 · MIX DE CARTEIRA CONFORME A MATURIDADE
  tela32: ({ cues, dur }) => {
    const rows = [["Inicial", "nível 1", [80, 15, 5]], ["Em escala", "níveis 2 e 3", [40, 50, 10]], ["Otimizada", "níveis 4 e 5", [20, 40, 40]]];
    const inner = `
  <div class="stage" id="s32-stage">
    ${chrome(CRUMB, "32")}
    <div class="eyebrow" id="s32-eyebrow">Módulo 3 · Equilíbrio da carteira</div>
    <h2 class="title" id="s32-title">Mix de carteira sugerido <em>conforme a maturidade em IA</em></h2>
    <p class="sub" id="s32-sub">Quanto mais madura a área, mais espaço para expandir e transformar.</p>
    <div class="card" id="s32-mix">
      <div class="leg"><span><i class="d"></i>Defender</span><span><i class="e"></i>Expandir</span><span><i class="t"></i>Transformar</span></div>
      ${rows.map((r, i) => `<div class="row" id="s32-l${i + 1}"><div class="lab"><h4>${r[0]}</h4><p class="st-lab">${r[1]}</p></div><div class="stack">${r[2].map((v, j) => `<span class="seg ${"det"[j]}" id="s32-l${i + 1}s${j}" style="width:${v}%"><b>${v}%</b></span>`).join("")}</div></div>`).join("")}
    </div>
    <div class="side">
      <div class="card" id="s32-q1"><div class="k">Uma pergunta honesta</div><div class="t">Em que linha a sua empresa <b>está</b>?</div></div>
      <div class="card ink" id="s32-q2"><div class="k">E outra</div><div class="t">Em que linha o seu plano estratégico <b>finge</b> que ela está?</div></div>
    </div>
    <div class="src">Fonte: Gartner — Construct AI Use Case Portfolios for B2B Commerce (via Ask Gartner, out/2026).</div>
  </div>`;
    const css = `${CP_CSS}
  #root #s32-title { font-size: 54px; width: 1700px; }
  #root #s32-sub { top: 300px; width: 1300px; font-size: 24px; }
  #root #s32-mix { left: 96px; top: 360px; width: 1300px; padding: 22px 28px; transform-origin: 50% 100%; }
  #root #s32-mix .leg { display: flex; gap: 22px; font-size: 16px; letter-spacing: .1em; text-transform: uppercase; font-weight: 800; color: #6B6B6B; margin-bottom: 12px; }
  #root #s32-mix .leg span { display: inline-flex; align-items: center; gap: 8px; } #root #s32-mix .leg i { width: 14px; height: 14px; border-radius: 4px; display: inline-block; }
  #root #s32-mix i.d, #root .seg.d { background: #1A1A1A; } #root #s32-mix i.e, #root .seg.e { background: #FF5100; } #root #s32-mix i.t, #root .seg.t { background: #FF9A66; }
  #root #s32-mix .row { display: grid; grid-template-columns: 240px 1fr; align-items: center; gap: 20px; padding: 12px 0; border-top: 1px solid #EDEDED; }
  #root #s32-mix h4 { font-size: 26px; font-weight: 800; letter-spacing: -0.02em; } #root #s32-mix .st-lab { font-size: 16px; color: #6B6B6B; margin-top: 2px; }
  #root .stack { display: flex; height: 64px; border-radius: 12px; overflow: hidden; }
  #root .seg { display: flex; align-items: center; justify-content: center; color: #fff; font-size: 24px; transform-origin: 0 50%; } #root .seg.t { color: #1A1A1A; }
  #root .seg b { font-weight: 900; }
`;
    const js = `
    hide("#s32-sub, #s32-mix .row, #s32-q1, #s32-q2");
    enterCurve(tl, "#s32-stage", 0);
    waterfall(tl, ["#s32-sub"], 0.3, { y: 30 });
    gsap.set(".seg", { scaleX: 0 });
    // cada linha chega e as barras crescem na ordem defender → expandir → transformar
    ${[1, 2, 3].map((i) => `waterfall(tl, ["#s32-l${i}"], ${cues["l" + i]}, { y: 30, d: 0.2 }); ${[0, 1, 2].map((j) => `tl.to("#s32-l${i}s${j}", { scaleX: 1, duration: 0.5, ease: "power3.out" }, ${cues["l" + i]} + ${(0.3 + j * 0.45).toFixed(2)});`).join(" ")}`).join("\n    ")}
    tl.set("#s32-q1", { opacity: 1 }, ${cues.q1} + 0.2); arrive(tl, "#s32-q1", ${cues.q1} + 0.2);
    tl.set("#s32-q2", { opacity: 1 }, ${cues.q2} + 0.2); arrive(tl, "#s32-q2", ${cues.q2} + 0.2);
    exitCurve(tl, "#s32-stage", ${dur - 0.3});`;
    return root("tela32", dur, inner, css) + script("tela32", js);
  },

  // ------------------------------------------------------------------ TELA 33 · VALOR: TRÊS CRITÉRIOS
  tela33: ({ cues, dur }) => {
    const rows = [["Impacto no resultado", "Quanto muda receita, custo, perda ou risco?", "Efeito marginal, difícil de medir", "Ganho mensurável em uma equipe", "Efeito relevante no resultado ou em meta da empresa"], ["Relevância estratégica", "Conecta com as prioridades da empresa e dos clientes?", "Iniciativa isolada", "Apoia uma meta da área", "Habilita a estratégia ou um diferencial competitivo"], ["Alcance", "Quantas pessoas, clientes ou transações toca?", "Poucos usuários, uso eventual", "Uma área ou um processo inteiro", "Várias áreas, clientes ou alto volume diário"]];
    const inner = `
  <div class="stage" id="s33-stage">
    ${chrome(CRUMB, "33")}
    <div class="eyebrow" id="s33-eyebrow">Módulo 3 · Valor de negócio</div>
    <h2 class="title" id="s33-title">Valor: três critérios, <em>notas de 1 a 5</em></h2>
    <div class="card tbl" id="s33-tbl"><table>
      <tr><th>Critério</th><th>O que pergunta</th><th>1 · baixo</th><th>3 · médio</th><th>5 · alto</th></tr>
      ${rows.map((r, i) => `<tr id="s33-r${i + 1}"><td class="k1">${r[0]}</td><td>${r[1]}</td><td class="lv1">${r[2]}</td><td class="lv3">${r[3]}</td><td class="lv5">${r[4]}</td></tr>`).join("")}
    </table></div>
    <div class="band low" id="s33-band">Nota de valor = <b>média dos três critérios.</b> <span id="s33-ex">Peça um número para o impacto, mesmo aproximado: <em id="s33-meta">ele vira a meta do Módulo 5.</em></span></div>
    <div class="side"><div class="card ink" id="s33-regua"><div class="k">Exigência</div><div class="t">Ideia <b>sem número</b> não entra na régua.</div></div></div>
  </div>`;
    const css = `${CP_CSS}
  #root #s33-tbl th:nth-child(1) { width: 210px; } #root #s33-tbl th:nth-child(2) { width: 320px; }
  #root #s33-band { top: 640px; } #root #s33-band b { color: #fff; } #root #s33-band em { color: #FF9A66; } #root #s33-ex { opacity: 0; }
  #root #s33-band em.on { background: #FF5100; color: #fff; border-radius: 6px; padding: 0 6px; }
`;
    const js = `
    hide("#s33-tbl, #s33-tbl tr[id], #s33-band, #s33-regua");
    enterCurve(tl, "#s33-stage", 0);
    waterfall(tl, ["#s33-tbl"], ${cues.intro} + 0.3, { y: 60, d: 0.22 });
    ${[1, 2, 3].map((i) => `waterfall(tl, ["#s33-r${i}"], ${cues["c" + i]} + 0.1, { y: 16, d: 0.16 }); tl.set("#s33-r${i}", { className: "on" }, ${cues["c" + i]} + 0.3);${i > 1 ? ` tl.set("#s33-r${i - 1}", { className: "" }, ${cues["c" + i]} + 0.3);` : ""}`).join("\n    ")}
    tl.set("#s33-r3", { className: "" }, ${cues.media});
    tl.set("#s33-band", { opacity: 1 }, ${cues.media} + 0.1); arrive(tl, "#s33-band", ${cues.media} + 0.1, 14);
    tl.to("#s33-ex", { opacity: 1, duration: 0.3 }, ${cues.numero} + 0.2);
    tl.set("#s33-meta", { className: "on" }, ${cues.meta} + 0.2); press(tl, "#s33-meta", ${cues.meta} + 0.2);
    tl.set("#s33-regua", { opacity: 1 }, ${cues.regua} + 0.2); arrive(tl, "#s33-regua", ${cues.regua} + 0.2);
    exitCurve(tl, "#s33-stage", ${dur - 0.3});`;
    return root("tela33", dur, inner, css) + script("tela33", js);
  },

  // ------------------------------------------------------------------ TELA 34 · VIABILIDADE: CINCO CRITÉRIOS
  tela34: ({ cues, dur }) => {
    const rows = [["Dados disponíveis", "Não existem ou estão espalhados e sem dono", "Existem, com lacunas conhecidas", "Existem, com qualidade, contexto e dono"], ["Integração", "Sistemas legados, sem API", "Possível, com esforço moderado", "Ferramentas e APIs já disponíveis"], ["Custo", "Alto e variável, sem teto", "Moderado e previsível", "Baixo ou já coberto por licença existente"], ["Competências", "Ninguém domina; depende de terceiros", "Time parcial, precisa de apoio", "Time com experiência comprovada"], ["Adoção", "Muda muito a rotina; resistência provável", "Exige treino e ajuste de processo", "Encaixa no fluxo atual; usuários pedem"]];
    const inner = `
  <div class="stage" id="s34-stage">
    ${chrome(CRUMB, "34")}
    <div class="eyebrow" id="s34-eyebrow">Módulo 3 · Viabilidade</div>
    <h2 class="title" id="s34-title">Viabilidade: cinco critérios, <em>notas de 1 a 5</em></h2>
    <div class="card tbl" id="s34-tbl"><table>
      <tr><th>Critério</th><th>1 · baixo</th><th>3 · médio</th><th>5 · alto</th></tr>
      ${rows.map((r, i) => `<tr id="s34-r${i + 1}"><td class="k1">${r[0]}</td><td class="lv1">${r[1]}</td><td class="lv3">${r[2]}</td><td class="lv5">${r[3]}</td></tr>`).join("")}
    </table></div>
    <div class="band low" id="s34-band">Nota de viabilidade = <b>média dos cinco critérios.</b> <span id="s34-veto"><em>Um risco bloqueante pode vetar a iniciativa</em> mesmo com nota alta.</span></div>
    <div class="side"><div class="card ink" id="s34-cro"><div class="k">Cadeira: CRO · é veto, não desconto</div>
      <div class="chips"><span class="chip" id="s34-v0">dado pessoal sem base legal</span><span class="chip" id="s34-v1">ferramenta fora do ambiente aprovado</span><span class="chip" id="s34-v2">decisão sem explicabilidade</span></div>
      <div class="t" id="s34-nao" style="margin-top:14px">Qualquer um desses é <b>veto</b>. Não é desconto na nota.</div>
    </div></div>
  </div>`;
    const css = `${CP_CSS}
  #root #s34-title { font-size: 54px; width: 1700px; }
  #root #s34-tbl th:nth-child(1) { width: 220px; } #root #s34-tbl td { font-size: 16px; padding: 7px 12px; }
  #root #s34-band { top: 690px; } #root #s34-band b { color: #fff; } #root #s34-band em { color: #FF9A66; } #root #s34-veto { opacity: 0; }
  #root #s34-band em.on { background: #FF5100; color: #fff; border-radius: 6px; padding: 0 6px; }
  #root .side .card.ink .chip { background: rgba(255,255,255,.12); border: 2px solid rgba(255,255,255,.3); color: #FF9A66; }
`;
    const js = `
    hide("#s34-tbl, #s34-tbl tr[id], #s34-band, #s34-cro, #s34-cro .chip, #s34-nao");
    enterCurve(tl, "#s34-stage", 0);
    waterfall(tl, ["#s34-tbl"], ${cues.intro} + 0.3, { y: 60, d: 0.22 });
    waterfall(tl, ["#s34-r1", "#s34-r2", "#s34-r3", "#s34-r4", "#s34-r5"], ${cues.cinco} + 0.1, { y: 16, d: 0.16, gap: 0.55 });
    tl.set("#s34-band", { opacity: 1 }, ${cues.media} + 0.1); arrive(tl, "#s34-band", ${cues.media} + 0.1, 14);
    // a cláusula do veto: a segunda metade da faixa acende
    tl.to("#s34-veto", { opacity: 1, duration: 0.3 }, ${cues.veto} + 0.2);
    tl.set("#s34-band em", { className: "on" }, ${cues.veto} + 1.2); press(tl, "#s34-band", ${cues.veto} + 1.2);
    tl.set("#s34-cro", { opacity: 1 }, ${cues.cro} + 0.1); arrive(tl, "#s34-cro", ${cues.cro} + 0.1);
    waterfall(tl, ["#s34-v0", "#s34-v1", "#s34-v2"], ${cues.cro} + 0.5, { y: 20, d: 0.16, gap: 1.2 });
    waterfall(tl, ["#s34-nao"], ${cues.naoeh} + 0.2, { y: 20 });
    exitCurve(tl, "#s34-stage", ${dur - 0.3});`;
    return root("tela34", dur, inner, css) + script("tela34", js);
  },

  // ------------------------------------------------------------------ TELA 35 · MATRIZ DE DECISÃO
  tela35: ({ cues, dur }) => {
    const inner = `
  <div class="stage" id="s35-stage">
    ${chrome(CRUMB, "35")}
    <div class="eyebrow" id="s35-eyebrow">Módulo 3 · Matriz de decisão</div>
    <h2 class="title" id="s35-title">Valor × viabilidade: <em>onde cada ideia cai</em></h2>
    <div id="s35-mx">
      <div class="yl"><span>Valor baixo</span><span>Valor alto</span></div>
      <div class="cells">
        <div class="cell" id="s35-prep"><div class="k">Gartner: riscos calculados</div><h4>Preparar melhor</h4><p id="s35-prep2">6 a 18 meses de preparo em dados, pessoas e integração; reavaliar a cada trimestre.</p></div>
        <div class="cell go" id="s35-ini"><div class="k">Gartner: ganhos prováveis</div><h4>Iniciar</h4><p id="s35-ini2">Acelerador de 3 a 6 meses com meta e linha de base; depois, seguir, ajustar ou parar.</p></div>
        <div class="cell wide" id="s35-adiar"><div class="k">Gartner: ganhos marginais</div><h4>Adiar</h4><p>Valor baixo, com qualquer viabilidade: não dilua recursos; reavalie a cada trimestre ou se a estratégia mudar.</p></div>
      </div>
      <div class="xl"><span>Viabilidade baixa</span><span>Viabilidade alta</span></div>
    </div>
    <div id="s35-rules">
      <div class="k" id="s35-rk">Regras de decisão</div>
      <div class="card stepcard" id="s35-r1"><div class="n">1</div><span>Pontue com <b>critérios definidos</b>, não por debate.</span></div>
      <div class="card stepcard" id="s35-r2"><div class="n">2</div><span>Corte em <b>3,5 nos dois eixos</b> (convenção do programa).</span></div>
      <div class="card stepcard" id="s35-r3"><div class="n">3</div><span>Risco bloqueante sem mitigação: <b>adiar</b>, qualquer que seja a nota.</span></div>
      <div class="card stepcard" id="s35-r4"><div class="n">4</div><span>Revise a carteira <b>a cada trimestre</b>: valor e viabilidade mudam.</span></div>
    </div>
    <div class="card quote" id="s35-quote">
      <div class="q" id="s35-q0">Numa seguradora, a ideia mais defendida no comitê era um <b>agente de subscrição</b>.</div>
      <div class="l" id="s35-q1"><span class="score">valor <b>5</b></span></div>
      <div class="l" id="s35-q2"><span class="score">viabilidade <b>2</b></span> dados de sinistro em três sistemas, sem dono</div>
      <div class="l" id="s35-q3">Segunda ideia, <b>resumo automático de laudo</b>: <span class="score">valor <b>3</b></span><span class="score">viabilidade <b>5</b></span></div>
      <div class="l" id="s35-q4">O comitê aprovou a segunda; a primeira foi para <b>“preparar melhor”</b>, com um projeto de dados de nove meses.</div>
      <div class="l big" id="s35-q5">Um ano depois, a segunda estava em produção <b>pagando a primeira</b>.</div>
      <div class="l" id="s35-q6">Sem a matriz: a <b>mais bonita</b> primeiro. E parada nos dados.</div>
    </div>
    <div class="band low" id="s35-olho">Onde caiu a <em>ideia do seu mapa</em>?</div>
    <div class="src">Fontes: Gartner — Construct AI Use Case Portfolios for B2B Commerce; AI Use-Case Assessments (via Ask Gartner, out/2026).</div>
  </div>`;
    const css = `${CP_CSS}
  #root #s35-mx { position: absolute; left: 96px; top: 300px; width: 760px; height: 480px; display: grid; grid-template-columns: 34px 1fr; grid-template-rows: 1fr 30px; gap: 8px; }
  #root #s35-mx .yl { display: flex; flex-direction: column; justify-content: space-between; font-size: 14px; letter-spacing: .08em; text-transform: uppercase; font-weight: 800; color: #6B6B6B; writing-mode: vertical-rl; transform: rotate(180deg); text-align: center; }
  #root #s35-mx .xl { grid-column: 2; display: flex; justify-content: space-between; font-size: 14px; letter-spacing: .08em; text-transform: uppercase; font-weight: 800; color: #6B6B6B; }
  #root #s35-mx .cells { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 10px; }
  #root .cell { background: #fff; border-radius: 14px; padding: 14px 18px; box-shadow: 0 1px 2px rgba(26,26,26,.04), 0 14px 40px -24px rgba(26,26,26,.18); transform-origin: 50% 50%; }
  #root .cell.wide { grid-column: 1 / span 2; }
  #root .cell .k { font-size: 12px; letter-spacing: .12em; text-transform: uppercase; font-weight: 800; color: #6B6B6B; }
  #root .cell h4 { font-size: 30px; font-weight: 900; letter-spacing: -0.03em; margin-top: 4px; } #root .cell p { font-size: 15px; line-height: 1.3; color: #4A4A4A; margin-top: 6px; }
  #root .cell.go { background: #FF5100; } #root .cell.go .k { color: rgba(255,255,255,.8); } #root .cell.go h4 { color: #fff; } #root .cell.go p { color: #fff; }
  #root .cell.on { outline: 4px solid #1A1A1A; } #root .cell p.on { font-weight: 800; color: #1A1A1A; } #root .cell.go p.on { color: #fff; }
  #root #s35-rules { position: absolute; left: 880px; top: 300px; width: 516px; display: flex; flex-direction: column; gap: 8px; }
  #root #s35-rules .k { font-size: 14px; letter-spacing: .14em; text-transform: uppercase; font-weight: 800; color: #6B6B6B; margin-bottom: 4px; }
  #root #s35-rules .stepcard { font-size: 18px; padding: 10px 14px; }
  #root #s35-olho { top: 830px; width: 1290px; }
`;
    const js = `
    hide("#s35-mx, .cell, #s35-rk, .stepcard, #s35-quote, #s35-quote .q, #s35-quote .l, #s35-olho");
    enterCurve(tl, "#s35-stage", 0);
    waterfall(tl, ["#s35-mx"], ${cues.intro} + 0.3, { y: 60, d: 0.22 });
    // os quadrantes chegam na ordem do teleprompter: iniciar, preparar melhor, adiar
    tl.set("#s35-ini", { opacity: 1 }, ${cues.iniciar} + 0.1); arrive(tl, "#s35-ini", ${cues.iniciar} + 0.1, 12);
    tl.set("#s35-ini2", { className: "on" }, ${cues.iniciar2} + 0.2); press(tl, "#s35-ini2", ${cues.iniciar2} + 0.2);
    tl.set("#s35-prep", { opacity: 1 }, ${cues.preparar} + 0.1); arrive(tl, "#s35-prep", ${cues.preparar} + 0.1, 12);
    tl.set("#s35-prep2", { className: "on" }, ${cues.preparar2} + 0.2); press(tl, "#s35-prep2", ${cues.preparar2} + 0.2);
    tl.set("#s35-adiar", { opacity: 1 }, ${cues.adiar} + 0.1); arrive(tl, "#s35-adiar", ${cues.adiar} + 0.1, 12);
    // parábola da seguradora: matriz recua, cartão da história chega linha a linha
    tl.to("#s35-mx", { scale: 0.85, opacity: 0, filter: "blur(10px)", duration: 0.25, ease: "power3.in" }, ${cues.parabola});
    tl.set("#s35-quote", { opacity: 1 }, ${cues.parabola} + 0.2); arrive(tl, "#s35-quote", ${cues.parabola} + 0.2);
    waterfall(tl, ["#s35-q0"], ${cues.parabola} + 0.5, { y: 40 });
    waterfall(tl, ["#s35-q1"], ${cues.v5}, { y: 30 });
    waterfall(tl, ["#s35-q2"], ${cues.v2}, { y: 30 });
    waterfall(tl, ["#s35-q3"], ${cues.segunda}, { y: 30 });
    waterfall(tl, ["#s35-q4"], ${cues.aprovou}, { y: 30 });
    waterfall(tl, ["#s35-q5"], ${cues.pagando}, { y: 40, d: 0.22 });
    waterfall(tl, ["#s35-q6"], ${cues.bonita}, { y: 30 });
    // regras: a história sai, a matriz volta e as quatro regras entram uma a uma
    tl.to("#s35-quote", { scale: 0.85, opacity: 0, filter: "blur(10px)", duration: 0.25, ease: "power3.in" }, ${cues.regras} - 0.05);
    tl.set("#s35-mx", { scale: 1, filter: "blur(0px)" }, ${cues.regras} + 0.2); tl.to("#s35-mx", { opacity: 1, duration: 0.3 }, ${cues.regras} + 0.2);
    waterfall(tl, ["#s35-rk"], ${cues.regras} + 0.3, { y: 20 });
    ${[1, 2, 3, 4].map((i) => `waterfall(tl, ["#s35-r${i}"], ${cues["r" + i]} + 0.1, { y: 24, d: 0.18 }); tl.set("#s35-r${i}", { className: "card stepcard on" }, ${cues["r" + i]} + 0.3);${i > 1 ? ` tl.set("#s35-r${i - 1}", { className: "card stepcard" }, ${cues["r" + i]} + 0.3);` : ""}`).join("\n    ")}
    tl.set("#s35-r4", { className: "card stepcard" }, ${cues.olho});
    tl.set("#s35-olho", { opacity: 1 }, ${cues.olho} + 0.1); arrive(tl, "#s35-olho", ${cues.olho} + 0.1, 14);
    exitCurve(tl, "#s35-stage", ${dur - 0.3});`;
    return root("tela35", dur, inner, css) + script("tela35", js);
  },

  // ------------------------------------------------------------------ TELA 36 · SEIS CHECAGENS ANTES DE APROVAR
  tela36: ({ cues, dur }) => {
    const cards = [
      ["Dados", "Os dados existem, têm dono e servem a este caso de uso?", "Com dados maduros, 1,7× mais protótipos chegam à produção"],
      ["Integração e custo", "Os sistemas têm API? Quem sustenta? O uso variável tem teto?", "50% dos projetos de GenAI vão estourar o orçamento até 2028"],
      ["Segurança e compliance", "Há dado pessoal ou sigiloso? Quem aprova? Dá para explicar a decisão?", "70% citam segurança e governança como o maior bloqueio da GenAI"],
      ["Pessoas e patrocínio", "Há competências no time e um patrocinador com orçamento?", "Sem dono único, a IA vira \"problema de todos e de ninguém\""],
      ["Adoção e mudança", "Quem treina, quem muda o processo, quem mede o uso?", "100 dias de implantação pedem +25 de treino e até +200 de mudança"],
      ["Medição", "KPIs e linha de base definidos antes do piloto?", "54% têm dificuldade de medir valor; só 11% capturam valor significativo"],
    ];
    const pos = [[96, 300], [538, 300], [980, 300], [96, 556], [538, 556], [980, 556]];
    const inner = `
  <div class="stage" id="s36-stage">
    ${chrome(CRUMB, "36")}
    <div class="eyebrow" id="s36-eyebrow">Módulo 3 · Riscos e dependências</div>
    <h2 class="title" id="s36-title">Seis checagens <em>antes de aprovar</em></h2>
    ${cards.map((c, i) => `<div class="card cp chk" id="s36-c${i + 1}" style="left:${pos[i][0]}px;top:${pos[i][1]}px"><div class="num">0${i + 1}</div><h4>${c[0]}</h4><p>${c[1]}</p><div class="irow" id="s36-i${i + 1}"><span>${c[2]}</span></div></div>`).join("")}
    <div class="src">Fontes: Gartner, via Ask Gartner (out/2026): priorização de carteira, ROI e dados prontos para IA.</div>
  </div>`;
    const css = `${CP_CSS}
  #root .card.cp.chk { width: 420px; height: 236px; padding: 18px 24px; }
  #root .card.cp.chk .num { font-size: 14px; letter-spacing: .14em; color: #767676; font-weight: 800; }
  #root .card.cp.chk h4 { font-size: 24px; margin-top: 6px; } #root .card.cp.chk p { font-size: 17px; margin-top: 6px; line-height: 1.3; }
  #root .card.cp.chk .irow { margin-top: 10px; padding: 8px 10px; background: #FFEEE6; border-left: 5px solid #FF5100; border-radius: 8px; font-size: 15px; line-height: 1.3; color: #1A1A1A; font-weight: 700; }
  #root .card.cp.chk .irow.on { background: #FF5100; color: #fff; }
`;
    const js = `
    hide(".card.cp, .irow");
    enterCurve(tl, "#s36-stage", 0);
    press(tl, "#s36-title", ${cues.intro} + 0.2);
    ${[1, 2, 3, 4, 5, 6].map((i) => `waterfall(tl, ["#s36-c${i}"], ${cues["c" + i]} + 0.1, { y: 60, d: 0.2 }); waterfall(tl, ["#s36-i${i}"], ${cues["c" + i]} + ${i === 4 ? "0.4" : "2.2"}, { y: 16, d: 0.16 });`).join("\n    ")}
    tl.set("#s36-i4", { className: "irow on" }, ${cues.c4b} + 0.2); press(tl, "#s36-i4", ${cues.c4b} + 0.2);
    exitCurve(tl, "#s36-stage", ${dur - 0.3});`;
    return root("tela36", dur, inner, css) + script("tela36", js);
  },

  // ------------------------------------------------------------------ DECISÃO PARA LEVAR (tela cheia: gráficos em x>=1210)
  decisao: ({ cues, dur }) => {
    const inner = `
  <div class="stage" id="d-stage">
    <div class="card" id="d-card">
      <div class="kick" id="d-kick"><b>Comitê</b> A decisão deste episódio</div>
      <div class="row"><div class="big" id="d-big">1</div><div class="t">ideia do seu mapa, <b>com número</b>. Não dezessete.</div></div>
      <div class="chk"><span id="d-k0">pontuada</span><span id="d-k1">na matriz</span><span id="d-k2">seis checagens</span></div>
    </div>
    <div class="card" id="d-south">
      <div class="kick"><b>South</b> Três formas de ajudar</div>
      <div class="way" id="d-s1"><span class="w">preparar melhor</span><div>assessment de dados e risco para encurtar os <b>18 meses</b></div></div>
      <div class="way" id="d-s2"><span class="w">iniciar</span><div>squad gerenciado, escopo almejado, do papel em <b>90 dias</b></div></div>
      <div class="way" id="d-s3"><span class="w">prova</span><div>escopo fechado: <b>número, prazo e critério de aceite</b></div></div>
    </div>
    <div id="d-next">
      <div class="lab" id="d-nl">Próximo episódio · Módulo 4</div>
      <div class="ttl" id="d-nt"><b>EP08</b> Três projetos reais da South</div>
      <div class="embed" id="d-punch2">Com o número.<br><em>E com a origem do número.</em></div>
    </div>
  </div>`;
    const css = `
  #root { background: transparent; }
  #root #d-card, #root #d-south { left: 1210px; top: 120px; width: 650px; padding: 30px 34px; transform-origin: 50% 100%; }
  #root .kick { font-size: 18px; letter-spacing: .12em; text-transform: uppercase; color: #6B6B6B; font-weight: 800; margin-bottom: 22px; }
  #root .kick b { background: #C73E00; color: #fff; padding: 6px 12px; border-radius: 6px; margin-right: 12px; letter-spacing: 0; }
  #root #d-card .row { display: flex; align-items: center; gap: 22px; }
  #root #d-card .big { font-size: 170px; font-weight: 900; letter-spacing: -0.06em; line-height: .9; color: #FF5100; transform-origin: 0% 50%; }
  #root #d-card .t { font-size: 32px; font-weight: 700; line-height: 1.2; letter-spacing: -0.02em; color: #1A1A1A; } #root #d-card .t b { color: #C73E00; font-weight: 900; }
  #root #d-card .chk { display: flex; gap: 10px; margin-top: 22px; flex-wrap: wrap; } #root #d-card .chk span { background: #1A1A1A; color: #FF9A66; font-size: 22px; font-weight: 800; padding: 8px 16px; border-radius: 999px; }
  #root .way { display: grid; grid-template-columns: 190px 1fr; gap: 14px; align-items: center; font-size: 21px; line-height: 1.3; color: #1A1A1A; padding: 12px 0; border-top: 1px solid #EDEDED; }
  #root .way .w { font-size: 17px; letter-spacing: .06em; text-transform: uppercase; font-weight: 900; color: #C73E00; } #root .way b { color: #C73E00; font-weight: 900; }
  #root #d-next { position: absolute; left: 1210px; top: 200px; width: 650px; }
  #root #d-next .lab { font-size: 22px; letter-spacing: .14em; text-transform: uppercase; color: rgba(255,255,255,.7); font-weight: 800; margin: 0; }
  #root #d-next .ttl { font-size: 54px; font-weight: 900; color: #fff; letter-spacing: -0.04em; line-height: 1.05; margin-top: 16px; } #root #d-next .ttl b { color: #FF5100; margin-right: 14px; }
  #root #d-punch2 { position: static; margin-top: 40px; font-size: 64px; color: #fff; transform-origin: 0% 50%; } #root #d-punch2 em { font-style: normal; color: #FF5100; }
`;
    const js = `
    hide("#d-card, #d-kick, #d-big, #d-card .t, #d-card .chk span, #d-south, .way, #d-nl, #d-nt, #d-punch2");
    tl.set("#d-card", { opacity: 1 }, ${cues.task});
    waterfall(tl, ["#d-card", "#d-kick"], ${cues.task}, { y: 80, d: 0.22, gap: 0.1 });
    waterfall(tl, ["#d-k0", "#d-k1", "#d-k2"], ${cues.task} + 2.6, { y: 20, d: 0.16, gap: 0.8 });
    tl.set("#d-big", { opacity: 1 }, ${cues.uma} + 0.2); arrive(tl, "#d-big", ${cues.uma} + 0.2, 18);
    waterfall(tl, ["#d-card .t"], ${cues.uma} + 0.5, { y: 30 });
    exitCurve(tl, "#d-card", ${cues.south});
    tl.set("#d-south", { opacity: 1 }, ${cues.south} + 0.15); enterCurve(tl, "#d-south", ${cues.south} + 0.15);
    waterfall(tl, ["#d-s1"], ${cues.s1} + 0.2, { y: 24 }); waterfall(tl, ["#d-s2"], ${cues.s2} + 0.2, { y: 24 }); waterfall(tl, ["#d-s3"], ${cues.s3} + 0.2, { y: 24 });
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
const VET = "AI Portfolio: How to Vet, Prioritize and Fund AI Use Cases";
const POL = "AI Policy Must Be Translated Into Governance Controls";
const FIGS = {
  tela31a: { num: "31A", eyebrow: "Módulo 3 · Carteira · <b>Gartner</b>", title: "Mapa de valor do portfólio de IA: <em>defender, estender, transformar</em>", img: "fig-31a.webp", iw: 1272, ih: 881,
    desc: "Mapa de valor do portfólio de IA: defender, estender e transformar.",
    insights: ["<b>Defender:</b> paridade e eficiência; exige competência tecnológica.", "<b>Estender:</b> vantagem competitiva; exige competência de negócio.", "<b>Transformar:</b> mudança do negócio; exige competência comportamental."],
    key: "Quanto mais ambicioso o caso, mais a mudança é de pessoas, não de tecnologia.", src: VET,
    zooms: { defend: [0.14, 0.48, 0.24, 0.38], extend: [0.38, 0.3, 0.24, 0.56], upend: [0.62, 0.1, 0.24, 0.76], pessoas: "fig" } },
  tela36a: { num: "36A", eyebrow: "Módulo 3 · Governança · <b>Gartner</b>", title: "Governança de IA: <em>framework em três passos</em>", img: "fig-36a.webp", iw: 1800, ih: 1079,
    desc: "Os três passos da Gartner para colocar a governança de IA em prática.",
    insights: ["1. Traduzir a política em controles: documentação, registro de IA e gestão de mudanças.", "2. Embutir os controles no desenho dos sistemas.", "3. Aplicar em escala, com monitoramento contínuo e feedback."],
    key: "Política no papel não protege; controle no sistema protege.", src: POL,
    zooms: { cro: [0.36, 0.14, 0.28, 0.28], pipeline: [0.57, 0.45, 0.3, 0.26] } },
  tela36b: { num: "36B", eyebrow: "Módulo 3 · Governança · <b>Gartner</b>", title: "Atendimento ao cliente: <em>processo e artefatos de IA</em>", img: "fig-36b.webp", iw: 1280, ih: 770,
    desc: "Exemplo de atendimento ao cliente: que registros de governança cada camada de IA precisa ter.",
    insights: ["<b>Processo:</b> avaliação de impacto da IA.", "<b>Casos de uso e modelos:</b> registro de responsáveis, fichas de modelo, logs de versão e relatórios de viés.", "<b>Dados:</b> fichas descrevendo cada base usada."],
    key: "Cada caso de IA precisa de dono, documentação e trilha.", src: POL,
    zooms: { camadas: [0.02, 0.1, 0.38, 0.72], dossie: "fig" } },
  tela36c: { num: "36C", eyebrow: "Módulo 3 · Governança · <b>Gartner</b>", title: "Seis princípios <em>de ética em IA</em>", img: "fig-36c.webp", iw: 1800, ih: 1079,
    desc: "Os seis princípios de ética em IA e as áreas responsáveis por cada um.",
    insights: ["Sustentável, centrado no ser humano, justo, responsável, seguro, explicável e transparente.", "Cada princípio tem donos claros: compliance, TI, riscos, produto, dados.", "Ética em IA é responsabilidade compartilhada."],
    key: "Princípio sem dono vira só discurso.", src: POL,
    zooms: { dono: [0.06, 0.56, 0.3, 0.3] } },
};
for (const [id, cfg] of Object.entries(FIGS)) {
  const base = figScene(id, cfg);
  SCENES_EP07[id] = (ctx) => {
    const { inner, css, js } = base(ctx);
    // títulos longos das figuras em uma linha, sem invadir o cartão
    return root(id, ctx.dur, inner, css + `\n  #root .title { font-size: 44px; width: 1720px; }\n`) + script(id, js);
  };
}

export const SCENES = SCENES_EP07;
