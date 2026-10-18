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



const SCENES_EP06 = {};

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
const figScene = (id, { num, crumb = "Módulo 2 · Fundamentos", eyebrow, title, img, iw, ih, desc, insights, key = "", src, zooms = {}, extra = "" }) =>
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
// EP06 · O painel perfeito que estava errado (Módulo 2)
// Regra das cenas de tela cheia (gancho, decisão): gráficos e legendas em x >= 1210 (o vídeo do
// narrador ocupa x < 1140). Telas com narrador no canto: nada em x > 1472 e y > 807.
// ---------------------------------------------------------------------------------------------

const CRUMB = "Módulo 2 · Fundamentos";
const CP_CSS = `
  #root .card.cp { top: 300px; width: 420px; height: 330px; padding: 24px 28px; transform-origin: 50% 100%; }
  #root .card.cp h4 { font-size: 26px; margin-top: 12px; }
  #root .card.cp h4.on { color: #C73E00; }
  #root .card.cp .k { font-size: 14px; letter-spacing: .14em; text-transform: uppercase; font-weight: 800; color: #6B6B6B; margin-top: 14px; }
  #root .card.cp p.on { color: #C73E00; font-weight: 800; }
  #root .card.cp.ink { background: #1A1A1A; color: #fff; } #root .card.cp.ink p { color: rgba(255,255,255,.85); } #root .card.cp.ink .k { color: #FF9A66; } #root .card.cp.ink h4 em { color: #FF9A66; } #root .card.cp.ink p.on { color: #FF9A66; }
  #root .card.cp.q { width: 310px; height: 250px; padding: 22px 24px; }
  #root .card.cp.q h4 { font-size: 26px; margin-top: 0; }
  #root .card.cp.q p { font-size: 18px; margin-top: 10px; line-height: 1.35; }
  #root .card.cp .badge { margin-bottom: 4px; }
  #root .side { position: absolute; left: 1420px; top: 300px; width: 404px; display: flex; flex-direction: column; gap: 14px; }
  #root .side .card { position: static; padding: 20px 22px; transform-origin: 0% 50%; }
  #root .side .card .k { font-size: 13px; letter-spacing: .14em; text-transform: uppercase; font-weight: 800; color: #6B6B6B; margin-bottom: 10px; }
  #root .side .card .t { font-size: 22px; line-height: 1.3; color: #1A1A1A; } #root .side .card .t b { color: #C73E00; font-weight: 900; }
  #root .side .chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
  #root .side .chip { background: #1A1A1A; color: #FF9A66; font-size: 17px; font-weight: 800; padding: 7px 14px; border-radius: 999px; }
  #root .band.low { top: 736px; width: 1300px; transform-origin: 0% 50%; }
  #root .ask.low { top: 830px; width: 1290px; }
  #root .tbl { left: 96px; top: 300px; width: 1300px; padding: 16px 20px; transform-origin: 50% 100%; }
  #root .tbl table { width: 100%; border-collapse: collapse; table-layout: fixed; }
  #root .tbl th { text-align: left; padding: 8px 12px 12px; border-bottom: 2px solid #E6E6E6; font-size: 16px; letter-spacing: .1em; text-transform: uppercase; font-weight: 800; color: #6B6B6B; }
  #root .tbl th span { display: inline-flex; align-items: center; gap: 10px; }
  #root .tbl th span i { width: 10px; height: 10px; border-radius: 50%; background: #BDBDBD; }
  #root .tbl th.on { color: #C73E00; } #root .tbl th.on span i { background: #FF5100; }
  #root .tbl td { font-size: 18px; line-height: 1.3; color: #1A1A1A; padding: 9px 12px; vertical-align: top; border-bottom: 1px solid #EDEDED; }
  #root .tbl td.k1 { font-size: 15px; letter-spacing: .08em; text-transform: uppercase; font-weight: 800; color: #6B6B6B; padding-top: 11px; }
  #root .tbl tr.on td { background: #FFEEE6; } #root .tbl tr.on td.k1 { color: #C73E00; }
  #root .tbl tr.dim td { color: #9A9A9A; }
  #root .dark { position: absolute; left: 96px; top: 300px; width: 1300px; height: 480px; padding: 40px 48px; background: #1A1A1A; color: #fff; border-radius: 18px; transform-origin: 0% 50%; }
  #root .dark .k { font-size: 18px; letter-spacing: .14em; text-transform: uppercase; font-weight: 900; color: #FF9A66; }
  #root .dark .big { font-size: 64px; font-weight: 900; letter-spacing: -0.045em; line-height: 1.02; margin-top: 18px; transform-origin: 0% 50%; } #root .dark .big em { font-style: normal; color: #FF9A66; }
  #root .dark .l { font-size: 30px; line-height: 1.3; color: rgba(255,255,255,.85); margin-top: 22px; } #root .dark .l b { color: #fff; font-weight: 900; }
  #root .dark .chips { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 22px; }
  #root .dark .chip { background: rgba(255,255,255,.1); border: 2px solid rgba(255,255,255,.25); color: #fff; font-size: 26px; font-weight: 800; padding: 10px 20px; border-radius: 14px; }
  #root .quote { left: 96px; top: 300px; width: 1300px; height: 480px; padding: 36px 44px; border-left: 12px solid #FF5100; transform-origin: 0% 50%; }
  #root .quote .q { font-size: 36px; font-weight: 700; letter-spacing: -0.03em; line-height: 1.15; } #root .quote .q b { color: #FF5100; font-weight: 900; }
  #root .quote .l { font-size: 28px; font-weight: 700; margin-top: 16px; color: #1A1A1A; } #root .quote .l b { color: #C73E00; font-weight: 900; }
  #root .quote .l.big { font-size: 44px; letter-spacing: -0.03em; line-height: 1.1; margin-top: 22px; }
`;

// painel de retenção (tela 26): 8 clientes, colunas do deck
const CLIENTES = [
  ["Alfa", "R$ 1,20 mi", 82, 9], ["Beta", "R$ 95 mil", 76, 7], ["Gama", "R$ 640 mil", 71, 6], ["Delta", "R$ 780 mil", 35, 2],
  ["Épsilon", "R$ 410 mil", 22, 0], ["Zeta", "R$ 520 mil", 64, 5], ["Eta", "R$ 300 mil", 58, 4], ["Alfa Serviços", "R$ 1,10 mi", 18, 1],
];
const painel = (id) => `
    <div class="card tbl painel" id="${id}-tbl">
      <div class="k">Painel de retenção · receita e risco por cliente</div>
      <table>
        <tr><th id="${id}-h0">Cliente</th><th id="${id}-h1">Receita</th><th id="${id}-h2">Risco de churn</th><th id="${id}-h3" class="c">Chamados críticos 90d</th></tr>
        ${CLIENTES.map((c, i) => `<tr id="${id}-r${i}"><td class="k1">${c[0]}</td><td>${c[1]}</td><td><div class="bar"><div class="tr"><div class="fi" style="width:${c[2]}%"></div></div><b>${c[2]}%</b></div></td><td class="c">${c[3]}</td></tr>`).join("")}
      </table>
    </div>`;
const PAINEL_CSS = `
  #root .painel { left: 538px; top: 300px; width: 858px; padding: 14px 18px; }
  #root .painel .k { font-size: 13px; letter-spacing: .14em; text-transform: uppercase; font-weight: 800; color: #6B6B6B; margin-bottom: 8px; }
  #root .painel th { font-size: 13px; padding: 6px 10px 8px; } #root .painel th.c, #root .painel td.c { text-align: center; }
  #root .painel td { font-size: 18px; padding: 6px 10px; } #root .painel td.k1 { font-size: 16px; text-transform: none; letter-spacing: 0; color: #1A1A1A; font-weight: 800; padding-top: 7px; }
  #root .painel .bar { display: flex; align-items: center; gap: 10px; } #root .painel .tr { flex: 1; height: 12px; background: #EDEDED; border-radius: 6px; overflow: hidden; } #root .painel .fi { height: 100%; background: #FF5100; border-radius: 6px; }
  #root .painel tr.on td { background: #FFEEE6; } #root .painel tr.on td.k1 { color: #C73E00; }
  #root .painel tr.out td { background: #F1F1F1; color: #9A9A9A; } #root .painel tr.out .fi { background: #BDBDBD; }
  #root .painel tr.in td { background: #E3F4EA; } #root .painel tr.in td.k1 { color: #1B7A3E; }
`;

Object.assign(SCENES_EP06, {
  // ------------------------------------------------------------------ GANCHO FRIO (tela cheia: gráficos em x>=1210)
  gancho: ({ cues, dur }) => {
    const inner = `
  <div class="stage" id="g-stage">
    <div id="g-kicker"><b>EP06</b> O painel perfeito que estava errado</div>
    <div class="card" id="g-panel">
      <div class="k">Painel de retenção</div>
      <div class="cols"><span class="col" id="g-c0">Receita</span><span class="col" id="g-c1">Risco de churn</span><span class="col" id="g-c2">Chamados críticos</span></div>
      <div class="rows" id="g-rows">${[0, 1, 2, 3, 4].map((i) => `<div class="row"><i style="width:${[70, 40, 55, 30, 62][i]}%"></i></div>`).join("")}</div>
    </div>
    <div class="card" id="g-pick"><div class="k">Sua campanha</div><div class="slots"><span>1</span><span>2</span><span>3</span></div><div class="t">Escolha <b>três clientes</b>.</div></div>
    <div class="card ink" id="g-punch"><div class="a">E depois:</div><div class="b">o que a sua área de dados <em>não te contou.</em></div></div>
  </div>`;
    const css = `
  #root { background: transparent; }
  #root #g-kicker { position: absolute; left: 1210px; top: 64px; font-size: 22px; color: rgba(255,255,255,.75); letter-spacing: .06em; text-transform: uppercase; font-weight: 600; }
  #root #g-kicker b { color: #fff; background: #FF5100; padding: 6px 12px; border-radius: 6px; margin-right: 14px; font-weight: 900; }
  #root #g-panel { left: 1210px; top: 140px; width: 650px; padding: 22px 28px; }
  #root #g-panel .k, #root #g-pick .k { font-size: 14px; letter-spacing: .12em; text-transform: uppercase; color: #6B6B6B; font-weight: 800; margin-bottom: 12px; }
  #root #g-panel .cols { display: flex; gap: 10px; } #root #g-panel .col { font-size: 17px; font-weight: 800; color: #1A1A1A; background: #F1F1F1; border-radius: 999px; padding: 8px 14px; }
  #root #g-panel .rows { margin-top: 14px; display: flex; flex-direction: column; gap: 8px; } #root #g-panel .row { height: 14px; background: #EDEDED; border-radius: 7px; overflow: hidden; } #root #g-panel .row i { display: block; height: 100%; background: #FF5100; border-radius: 7px; }
  #root #g-pick { left: 1210px; top: 420px; width: 650px; padding: 22px 28px; }
  #root #g-pick .slots { display: flex; gap: 12px; } #root #g-pick .slots span { width: 64px; height: 64px; border-radius: 14px; border: 3px dashed #BDBDBD; display: grid; place-items: center; font-size: 26px; font-weight: 900; color: #9A9A9A; }
  #root #g-pick .t { margin-top: 14px; font-size: 26px; color: #1A1A1A; } #root #g-pick .t b { color: #C73E00; font-weight: 900; }
  #root #g-punch { left: 1210px; top: 640px; width: 650px; padding: 28px 34px; background: #1A1A1A; color: #fff; border: 2px solid rgba(255,255,255,.12); transform-origin: 0% 50%; }
  #root #g-punch .a { font-size: 28px; font-weight: 700; color: rgba(255,255,255,.75); }
  #root #g-punch .b { font-size: 44px; font-weight: 900; letter-spacing: -0.04em; line-height: 1.08; margin-top: 8px; } #root #g-punch em { font-style: normal; color: #FF9A66; }
`;
    const js = `
    hide("#g-kicker, #g-panel, .col, #g-rows .row, #g-pick, #g-punch");
    tl.set("#g-kicker", { opacity: 1 }, ${cues.open});
    tl.fromTo("#g-kicker", { x: 60 }, { x: 0, duration: 0.5, ease: "power4.out", immediateRender: false }, ${cues.open});
    waterfall(tl, ["#g-panel"], ${cues.open} + 0.3, { y: 60, d: 0.2 });
    waterfall(tl, qa("#g-rows .row"), ${cues.open} + 0.7, { y: 10, d: 0.14, gap: 0.08 });
    waterfall(tl, ["#g-c0", "#g-c1", "#g-c2"], ${cues.cols}, { y: 20, d: 0.16, gap: 0.5 });
    waterfall(tl, ["#g-pick"], ${cues.escolha} + 0.2, { y: 60, d: 0.2 });
    tl.set("#g-punch", { opacity: 1 }, ${cues.depois} + 0.1); arrive(tl, "#g-punch", ${cues.depois} + 0.1);
    exitCurve(tl, "#g-kicker", ${dur - 0.3}); exitCurve(tl, "#g-panel", ${dur - 0.3}); exitCurve(tl, "#g-pick", ${dur - 0.3}); exitCurve(tl, "#g-punch", ${dur - 0.3});`;
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
      <div id="v-ep"><span class="w" id="v-e0">EP06</span><span class="w" id="v-e1">O painel perfeito que estava errado</span></div>
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

  // ------------------------------------------------------------------ TELA 23 · DADO CONFIÁVEL PARA IA
  tela23: ({ cues, dur }) => {
    const dims = [
      ["Qualidade", "Correto, completo e sem duplicidade: suficiente para refletir a realidade, não perfeito."],
      ["Contexto", "Significado, unidade, origem e dono documentados. Sem contexto, o número engana."],
      ["Atualização", "Frequência compatível com a decisão. Cópias em planilhas e ferramentas de IA envelhecem."],
      ["Governança", "Quem acessa, para quê e com quais regras; rastreabilidade do dado até a decisão."],
    ];
    const inner = `
  <div class="stage" id="s23-stage">
    ${chrome(CRUMB, "23")}
    <div class="eyebrow" id="s23-eyebrow">Módulo 2 · Dados confiáveis</div>
    <h2 class="title" id="s23-title">Dado confiável para IA: <em>quatro dimensões e um teste</em></h2>
    ${dims.map((d, i) => `<div class="card cp q" id="s23-d${i + 1}" style="left:${96 + i * 330}px"><h4 id="s23-h${i + 1}">${d[0]}</h4><p>${d[1]}</p></div>`).join("")}
    <div class="card cp ink" id="s23-test"><div class="k">O teste: representatividade</div><h4>O dado representa o caso de uso, <em>inclusive erros, outliers e eventos raros?</em></h4><p>Para IA, o caso raro costuma ser o sinal: fraude, falha, cliente prestes a sair.</p></div>
    <div class="side">
      <div class="card" id="s23-cro"><div class="k">Cadeira: CRO</div><div class="t">Para a IA, <b>o raro é o sinal</b>.</div>
        <div class="chips"><span class="chip" id="s23-x0">fraude</span><span class="chip" id="s23-x1">sinistro atípico</span><span class="chip" id="s23-x2">cooperado prestes a sair</span></div>
        <div class="t" id="s23-limpa" style="margin-top:14px;font-size:19px">Se a qualidade <b>limpa o raro</b>, limpa o que o modelo <b>precisava ver</b>.</div>
      </div>
    </div>
    <div class="ask low" id="s23-ask"><span class="k">Pergunta</span><p>Qual destas quatro dimensões é <em>o calcanhar de Aquiles</em> dos dados da sua área?</p></div>
    <div class="src">Fontes: Gartner — Foundations of AI-Ready Data; Gartner Newsroom (26/02/2025).</div>
  </div>`;
    const css = `${CP_CSS}
  #root #s23-title { font-size: 54px; width: 1700px; }
  #root #s23-test { left: 96px; top: 574px; width: 1300px; height: 150px; padding: 20px 28px; }
  #root #s23-test .k { margin-top: 0; } #root #s23-test h4 { font-size: 26px; margin-top: 8px; } #root #s23-test p { font-size: 19px; margin-top: 8px; }
  #root .card.cp.q h4.on { color: #C73E00; }
`;
    const js = `
    hide(".card.cp, #s23-cro, #s23-cro .chip, #s23-limpa, #s23-ask");
    enterCurve(tl, "#s23-stage", 0);
    waterfall(tl, ["#s23-d1", "#s23-d2", "#s23-d3", "#s23-d4"], ${cues.dims} + 0.6, { y: 60, d: 0.2, gap: 0.55 });
    // "o que muda para IA": as quatro acendem em sequência
    ${[1, 2, 3, 4].map((i) => `tl.set("#s23-h${i}", { className: "on" }, ${cues.muda} + ${(0.2 + (i - 1) * 0.3).toFixed(1)});`).join(" ")}
    tl.set("#s23-test", { opacity: 1 }, ${cues.teste} + 0.1); arrive(tl, "#s23-test", ${cues.teste} + 0.1);
    tl.set("#s23-cro", { opacity: 1 }, ${cues.raro} + 0.1); arrive(tl, "#s23-cro", ${cues.raro} + 0.1);
    waterfall(tl, ["#s23-x0", "#s23-x1", "#s23-x2"], ${cues.exemplos} + 0.2, { y: 20, d: 0.16, gap: 0.6 });
    waterfall(tl, ["#s23-limpa"], ${cues.limpa} + 0.2, { y: 24, d: 0.18 });
    waterfall(tl, ["#s23-ask"], ${cues.limpa} + 3.2, { y: 60, d: 0.2 });
    exitCurve(tl, "#s23-stage", ${dur - 0.3});`;
    return root("tela23", dur, inner, css) + script("tela23", js);
  },

  // ------------------------------------------------------------------ TELA 24 · RELATÓRIO × IA
  tela24: ({ cues, dur }) => {
    const rows = [
      ["Objetivo", "Perfeição e um padrão único para toda a empresa", "Representar a realidade do caso de uso específico"],
      ["Erros e outliers", "Removidos como \"sujeira\"", "Preservados quando são sinal (fraude, falha)"],
      ["Avaliação", "Periódica", "Contínua: desvio (drift), completude e atualidade"],
      ["Metadados", "Opcionais", "Essenciais: significado, origem, dono, sensibilidade"],
      ["Governança", "Acesso e conformidade", "Risco: viés, rastreabilidade e uso permitido"],
      ["Versões", "Foto do momento", "Dados, pipelines, features e modelos versionados"],
    ];
    const inner = `
  <div class="stage" id="s24-stage">
    ${chrome(CRUMB, "24")}
    <div class="eyebrow" id="s24-eyebrow">Módulo 2 · Dados confiáveis</div>
    <h2 class="title" id="s24-title">Dado bom para relatório <em>nem sempre serve para IA</em></h2>
    <div class="card tbl" id="s24-tbl">
      <table>
        <tr><th>Dimensão</th><th id="s24-hr"><span><i></i>Dado para relatório</span></th><th id="s24-hi"><span><i></i>Dado pronto para IA</span></th></tr>
        ${rows.map((r, i) => `<tr id="s24-r${i}"><td class="k1">${r[0]}</td><td class="v" id="s24-a${i}">${r[1]}</td><td class="v" id="s24-b${i}">${r[2]}</td></tr>`).join("")}
      </table>
    </div>
    <div class="card quote" id="s24-quote">
      <div class="q" id="s24-q0">A <b>sala de máquinas</b> de um navio e o <b>painel do capitão</b>.</div>
      <div class="cols">
        <div class="col" id="s24-col1"><div class="h">Painel do capitão</div><div class="l" id="s24-l1">Velocidade e rumo, <b>lindos e estáveis</b>.</div><div class="l" id="s24-l3">Feito para <b>quem decide</b>.</div><div class="l" id="s24-l5">O dashboard que o comitê adora.</div></div>
        <div class="col" id="s24-col2"><div class="h">Sala de máquinas</div><div class="l" id="s24-l2">Mostra <b>cada vibração estranha</b>.</div><div class="l" id="s24-l4">Para <b>quem prevê a falha</b>.</div><div class="l" id="s24-l6">O que o <b>modelo de IA</b> precisa.</div></div>
      </div>
    </div>
    <div class="ask low" id="s24-ask"><span class="k">Regra</span><p>Pergunte sempre: pronto <em>para qual caso de uso?</em></p></div>
    <div class="src">Fontes: Gartner — Foundations of AI-Ready Data; A Journey Guide to Deliver AI Success Through AI-Ready Data.</div>
  </div>`;
    const css = `${CP_CSS}
  #root #s24-title { font-size: 54px; width: 1700px; }
  #root #s24-tbl th:first-child { width: 220px; }
  #root #s24-quote .cols { display: flex; gap: 40px; margin-top: 26px; }
  #root #s24-quote .col { flex: 1; } #root #s24-quote .col .h { font-size: 15px; letter-spacing: .14em; text-transform: uppercase; font-weight: 900; color: #6B6B6B; }
  #root #s24-quote .col .l { font-size: 27px; margin-top: 14px; }
  #root #s24-quote #s24-col2 .h { color: #C73E00; }
`;
    const js = `
    hide("#s24-tbl, td.v, #s24-quote, #s24-quote .q, #s24-quote .l, #s24-ask");
    enterCurve(tl, "#s24-stage", 0);
    waterfall(tl, ["#s24-tbl"], ${cues.intro} + 0.3, { y: 60, d: 0.22 });
    // comparação em pares: relatório à esquerda, IA à direita, linha a linha
    tl.set("#s24-hr", { className: "on" }, ${cues.par1}); waterfall(tl, ["#s24-a0"], ${cues.par1} + 0.1, { y: 16, d: 0.14 });
    tl.set("#s24-hr", { className: "" }, ${cues.par1} + 2.0); tl.set("#s24-hi", { className: "on" }, ${cues.par1} + 2.0); waterfall(tl, ["#s24-b0"], ${cues.par1} + 2.1, { y: 16, d: 0.14 });
    tl.set("#s24-hi", { className: "" }, ${cues.par2}); tl.set("#s24-r1", { className: "on" }, ${cues.par2});
    waterfall(tl, ["#s24-a1"], ${cues.par2} + 0.1, { y: 16, d: 0.14 }); waterfall(tl, ["#s24-b1"], ${cues.par2} + 2.0, { y: 16, d: 0.14 });
    waterfall(tl, ["#s24-a2"], ${cues.par3} + 0.1, { y: 16, d: 0.14 }); waterfall(tl, ["#s24-b2"], ${cues.par3} + 1.4, { y: 16, d: 0.14 });
    waterfall(tl, ["#s24-a3", "#s24-b3", "#s24-a4", "#s24-b4", "#s24-a5", "#s24-b5"], ${cues.par3} + 2.6, { y: 12, d: 0.12, gap: 0.12 });
    // parábola do navio: a tabela recua, o cartão da história chega; as duas colunas crescem linha a linha
    tl.to("#s24-tbl", { scale: 0.85, opacity: 0, filter: "blur(10px)", duration: 0.25, ease: "power3.in" }, ${cues.parabola});
    tl.set("#s24-quote", { opacity: 1 }, ${cues.parabola} + 0.2); arrive(tl, "#s24-quote", ${cues.parabola} + 0.2);
    waterfall(tl, ["#s24-q0"], ${cues.parabola} + 0.5, { y: 40 });
    waterfall(tl, ["#s24-l1"], ${cues.painel}, { y: 30 });
    waterfall(tl, ["#s24-l2"], ${cues.sala}, { y: 30 });
    waterfall(tl, ["#s24-l3"], ${cues.quem}, { y: 30 }); waterfall(tl, ["#s24-l4"], ${cues.quem} + 1.6, { y: 30 });
    waterfall(tl, ["#s24-l5"], ${cues.dash}, { y: 30 });
    waterfall(tl, ["#s24-l6"], ${cues.modelo}, { y: 30 });
    // regra: a história sai, a tabela volta, a regra fecha
    tl.to("#s24-quote", { scale: 0.85, opacity: 0, filter: "blur(10px)", duration: 0.25, ease: "power3.in" }, ${cues.regra} - 0.05);
    tl.set("#s24-tbl", { scale: 1, filter: "blur(0px)" }, ${cues.regra} + 0.2); tl.to("#s24-tbl", { opacity: 1, duration: 0.3 }, ${cues.regra} + 0.2);
    waterfall(tl, ["#s24-ask"], ${cues.regra} + 0.5, { y: 60, d: 0.2 });
    exitCurve(tl, "#s24-stage", ${dur - 0.3});`;
    return root("tela24", dur, inner, css) + script("tela24", js);
  },

  // ------------------------------------------------------------------ TELA 25 · O CUSTO DE DADOS QUE NÃO ESTÃO PRONTOS
  tela25: ({ cues, dur }) => {
    const stats = [
      [60, "dos projetos de IA sem dados prontos serão abandonados até 2026", "neg"],
      [63, "das organizações não têm, ou não sabem se têm, práticas de dados adequadas para IA", "neg"],
      [40, "citam falta de dados ou dados ruins entre as três maiores barreiras", "neg"],
      [14, "estão muito confiantes de que seus dados estão seguros e governados para IA", ""],
    ];
    const C = 2 * Math.PI * 52;
    const inner = `
  <div class="stage" id="s25-stage">
    ${chrome(CRUMB, "25")}
    <div class="eyebrow" id="s25-eyebrow">Módulo 2 · Dados prontos para IA</div>
    <h2 class="title" id="s25-title">O custo de dados <em>que não estão prontos</em></h2>
    ${stats.map((s, i) => `
    <div class="card cp q ring" id="s25-c${i + 1}" style="left:${96 + i * 330}px">
      <div class="rg"><svg viewBox="0 0 120 120" aria-hidden="true"><circle class="bg" cx="60" cy="60" r="52"/><circle class="fg ${s[2]}" id="s25-g${i + 1}" cx="60" cy="60" r="52" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${C.toFixed(1)}"/></svg><div class="rv ${s[2]}" id="s25-v${i + 1}">${s[0]}%</div></div>
      <p>${s[1]}</p>
    </div>`).join("")}
    <div class="band low" id="s25-band">Chega de número. <em>Vamos jogar.</em></div>
    <div class="src">Fontes: Gartner Newsroom (26/02/2025); 3 CIO Actions to Integrate AI-Ready Data into Governance Models.</div>
  </div>`;
    const css = `${CP_CSS}
  #root .card.cp.q.ring { height: 400px; }
  #root .rg { position: relative; width: 170px; height: 170px; }
  #root .rg svg { width: 170px; height: 170px; transform: rotate(-90deg); }
  #root .rg circle { fill: none; stroke-width: 12; } #root .rg circle.bg { stroke: #EDEDED; } #root .rg circle.fg { stroke: #1A1A1A; stroke-linecap: round; } #root .rg circle.fg.neg { stroke: #FF5100; }
  #root .rv { position: absolute; inset: 0; display: grid; place-items: center; font-size: 44px; font-weight: 900; letter-spacing: -0.04em; color: #1A1A1A; } #root .rv.neg { color: #C73E00; }
  #root .card.cp.q.ring p { font-size: 19px; margin-top: 16px; }
`;
    const js = `
    hide(".card.cp, #s25-band");
    enterCurve(tl, "#s25-stage", 0);
    // um número por respiração: cartão chega, o anel se fecha e o número conta
    ${[1, 2, 3, 4].map((i) => `waterfall(tl, ["#s25-c${i}"], ${cues["n" + i]}, { y: 60, d: 0.2 });
    tl.to("#s25-g${i}", { strokeDashoffset: ${(C * (1 - stats[i - 1][0] / 100)).toFixed(1)}, duration: 1.1, ease: "power2.out" }, ${cues["n" + i]} + 0.2);
    countUp(tl, "#s25-v${i}", ${stats[i - 1][0]}, ${cues["n" + i]} + 0.2, { dur: 1.1, suffix: "%" });`).join("\n    ")}
    tl.set("#s25-band", { opacity: 1 }, ${cues.jogar} + 0.1); arrive(tl, "#s25-band", ${cues.jogar} + 0.1, 14);
    exitCurve(tl, "#s25-stage", ${dur - 0.3});`;
    return root("tela25", dur, inner, css) + script("tela25", js);
  },

  // ------------------------------------------------------------------ TELA 26 · DINÂMICA · A CAMPANHA DE RETENÇÃO
  tela26: ({ cues, dur }) => {
    const inner = `
  <div class="stage" id="s26-stage">
    ${chrome(CRUMB, "26")}
    <div class="eyebrow" id="s26-eyebrow">Módulo 2 · Dinâmica em grupos · 15 min</div>
    <h2 class="title" id="s26-title">A campanha de retenção: <em>3 de 8 clientes</em></h2>
    <div class="card cp sit" id="s26-sit"><h4>Você tem orçamento para uma ação de retenção em <em>3 de 8 clientes.</em></h4><p>O painel ao lado, alimentado pela base de dados, é tudo o que você tem.</p></div>
    <div class="steps" id="s26-steps">
      <div class="step card" id="s26-s1"><div class="n">1</div><span>Em grupos, escolham <b>3 clientes.</b></span></div>
      <div class="step card" id="s26-s2"><div class="n">2</div><span>Anotem o <b>critério usado.</b></span></div>
      <div class="step card" id="s26-s3"><div class="n">3</div><span>Não vale pedir mais dados. <b>Ainda.</b></span></div>
      <span class="fic" id="s26-fic"><i></i>Dados fictícios, criados para a dinâmica</span>
    </div>
    ${painel("s26")}
    <div class="band low" id="s26-coo">Na sua carteira: cooperados de maior <em>saldo</em>, estabelecimentos de maior <em>TPV</em>, apólices de maior <em>prêmio</em>.</div>
    <div class="ask low" id="s26-ask"><span class="k">Pause o vídeo</span><p><em>2 minutos.</em> Escolha 3 clientes e anote o critério.</p></div>
  </div>`;
    const css = `${CP_CSS}${PAINEL_CSS}
  #root #s26-title { font-size: 54px; width: 1700px; }
  #root #s26-sit { left: 96px; top: 300px; width: 420px; height: 190px; padding: 20px 24px; }
  #root #s26-sit h4 { font-size: 24px; margin-top: 0; } #root #s26-sit h4 em { font-style: normal; color: #FF5100; } #root #s26-sit p { font-size: 18px; margin-top: 10px; }
  #root #s26-steps { position: absolute; left: 96px; top: 506px; width: 420px; display: flex; flex-direction: column; gap: 8px; }
  #root .step { position: static; display: flex; align-items: center; gap: 12px; padding: 10px 16px; font-size: 19px; color: #1A1A1A; transform-origin: 0% 50%; }
  #root .step .n { flex: none; width: 30px; height: 30px; border-radius: 50%; background: #1A1A1A; color: #fff; display: grid; place-items: center; font-weight: 900; font-size: 15px; }
  #root .step b { color: #C73E00; font-weight: 900; }
  #root .fic { display: inline-flex; align-items: center; gap: 8px; font-size: 15px; color: #6B6B6B; margin-top: 4px; } #root .fic i { width: 8px; height: 8px; border-radius: 50%; background: #BDBDBD; }
  #root #s26-coo { top: 740px; }
  #root #s26-ask { top: 830px; }
`;
    const js = `
    hide("#s26-sit, .step, #s26-fic, #s26-tbl, #s26-coo, #s26-ask");
    enterCurve(tl, "#s26-stage", 0);
    press(tl, "#s26-title", ${cues.intro} + 0.2);
    waterfall(tl, ["#s26-sit"], ${cues.tres}, { y: 60, d: 0.2 });
    waterfall(tl, ["#s26-tbl"], ${cues.painel} + 0.2, { y: 60, d: 0.22 });
    // colunas: cada cabeçalho acende quando é dito
    ${[1, 2, 3].map((i) => `tl.set("#s26-h${i}", { className: "on" }, ${cues.cols} + ${((i - 1) * 0.9).toFixed(1)});${i > 1 ? ` tl.set("#s26-h${i - 1}", { className: "" }, ${cues.cols} + ${((i - 1) * 0.9).toFixed(1)});` : ""}`).join("\n    ")}
    tl.set("#s26-h3", { className: "c" }, ${cues.carteira});
    tl.set("#s26-coo", { opacity: 1 }, ${cues.carteira} + 0.2); arrive(tl, "#s26-coo", ${cues.carteira} + 0.2, 14);
    waterfall(tl, ["#s26-s1", "#s26-s2", "#s26-s3"], ${cues.regras} + 0.6, { y: 24, d: 0.16, gap: 0.9 });
    waterfall(tl, ["#s26-fic"], ${cues.ficticios} + 0.2, { y: 16, d: 0.16 });
    exitCurve(tl, "#s26-coo", ${cues.pause} - 0.1);
    waterfall(tl, ["#s26-ask"], ${cues.pause} + 0.2, { y: 60, d: 0.2 });
    exitCurve(tl, "#s26-stage", ${dur - 0.3});`;
    return root("tela26", dur, inner, css) + script("tela26", js);
  },

  // ------------------------------------------------------------------ CARTÃO DE PAUSA (5 s, sem narrador): painel parado
  pausa: ({ dur }) => {
    const inner = `
  <div class="stage" id="p-stage">
    <div id="p-group">
      <div class="lab" id="p-lab">Dinâmica · A campanha de retenção</div>
      <div class="ttl" id="p-ttl">Pause · escolha 3 clientes</div>
      <div class="big" id="p-big">2 min</div>
      <div class="sub" id="p-sub">${CLIENTES.map((c) => `<span>${c[0]}</span>`).join("")}</div>
      <div class="sub2" id="p-sub2">Anote o critério. Não vale pedir mais dado. Ainda.</div>
    </div>
  </div>`;
    const css = `
  #root { background: #1A1A1A; }
  #root #p-group { position: absolute; left: 160px; top: 230px; width: 1600px; color: #fff; }
  #root #p-group .lab { font-size: 24px; letter-spacing: .14em; text-transform: uppercase; color: rgba(255,255,255,.7); font-weight: 800; }
  #root #p-group .ttl { margin-top: 24px; font-size: 96px; font-weight: 900; letter-spacing: -0.045em; line-height: 1; }
  #root #p-group .big { margin-top: 10px; font-size: 200px; font-weight: 900; letter-spacing: -0.06em; line-height: 1; color: #FF5100; }
  #root #p-group .sub { margin-top: 30px; display: flex; flex-wrap: wrap; gap: 12px; } #root #p-group .sub span { background: rgba(255,255,255,.1); border: 2px solid rgba(255,255,255,.25); border-radius: 999px; padding: 10px 22px; font-size: 28px; font-weight: 800; }
  #root #p-group .sub2 { margin-top: 24px; font-size: 30px; color: rgba(255,255,255,.85); }
`;
    const js = `
    hide("#p-lab, #p-ttl, #p-big, #p-sub, #p-sub2");
    waterfall(tl, ["#p-lab", "#p-ttl", "#p-big", "#p-sub", "#p-sub2"], 0.1, { y: 60, d: 0.22, gap: 0.1 });
    exitPush(tl, "#p-group", ${dur - 0.22}, 18, 1.2);`;
    return root("pausa", dur, inner, css) + script("pausa", js);
  },

  // ------------------------------------------------------------------ TELA 26 · RETOMADA ("deixa eu adivinhar")
  tela26b: ({ cues, dur }) => {
    const inner = `
  <div class="stage" id="s26b-stage">
    ${chrome(CRUMB, "26")}
    <div class="eyebrow" id="s26b-eyebrow">Módulo 2 · Dinâmica em grupos · 15 min</div>
    <h2 class="title" id="s26b-title">A campanha de retenção: <em>3 de 8 clientes</em></h2>
    <div class="card cp sit" id="s26b-sit"><h4>Pronto? <em>Deixa eu adivinhar.</em></h4><p>Receita vezes risco: é o que qualquer comitê usaria.</p></div>
    <div class="card cp guess" id="s26b-alfa"><span class="badge"><i></i>Na sua lista</span><h4>Alfa</h4><p><b>82%</b> de risco · <b>R$ 1,2 mi</b> · <b>9</b> chamados</p></div>
    <div class="card cp guess" id="s26b-beta"><span class="badge ink"><i></i>Ficou de fora</span><h4>Beta</h4><p><b>R$ 95 mil</b>. Pequena.</p></div>
    ${painel("s26b")}
    <div class="band low" id="s26b-guarde">Guarde a <em>sua escolha</em>.</div>
  </div>`;
    const css = `${CP_CSS}${PAINEL_CSS}
  #root #s26b-title { font-size: 54px; width: 1700px; }
  #root #s26b-sit { left: 96px; top: 300px; width: 420px; height: 150px; padding: 20px 24px; }
  #root #s26b-sit h4 { font-size: 26px; margin-top: 0; } #root #s26b-sit h4 em { font-style: normal; color: #FF5100; } #root #s26b-sit p { font-size: 18px; margin-top: 10px; }
  #root .card.cp.guess { left: 96px; width: 420px; height: 150px; padding: 18px 24px; }
  #root .card.cp.guess h4 { font-size: 30px; margin-top: 6px; } #root .card.cp.guess p { font-size: 19px; margin-top: 6px; } #root .card.cp.guess p b { color: #C73E00; }
  #root #s26b-alfa { top: 470px; } #root #s26b-beta { top: 640px; }
  #root #s26b-guarde { top: 820px; }
`;
    const js = `
    hide("#s26b-sit, .guess, #s26b-guarde");
    enterCurve(tl, "#s26b-stage", 0);
    tl.set("#s26b-tbl", { opacity: 1 }, 0);
    waterfall(tl, ["#s26b-sit"], ${cues.pronto} + 0.2, { y: 60, d: 0.2 });
    // Alfa: a linha acende no painel e o cartão chega; Beta: idem, em cinza
    tl.set("#s26b-r0", { className: "on" }, ${cues.alfa}); waterfall(tl, ["#s26b-alfa"], ${cues.alfa} + 0.2, { y: 50, d: 0.2 });
    tl.set("#s26b-r1", { className: "out" }, ${cues.beta}); waterfall(tl, ["#s26b-beta"], ${cues.beta} + 0.2, { y: 50, d: 0.2 });
    tl.set("#s26b-guarde", { opacity: 1 }, ${cues.guarde} + 0.1); arrive(tl, "#s26b-guarde", ${cues.guarde} + 0.1, 14);
    exitCurve(tl, "#s26b-stage", ${dur - 0.3});`;
    return root("tela26b", dur, inner, css) + script("tela26b", js);
  },

  // ------------------------------------------------------------------ TELA 27 · REVELAÇÃO
  tela27: ({ cues, dur }) => {
    const cards = [
      ["Contexto", "Beta", "A receita é <b>mensal</b>; as demais são anuais. Em base anual, R$ 1,14 mi: a 2ª maior carteira, com 76% de risco."],
      ["Atualização", "Alfa", "O risco vem de um retrato de <b>seis meses atrás</b>. Os problemas foram resolvidos; o risco atual estimado é de ~30%."],
      ["Qualidade", "Épsilon", "Mostra <b>zero chamados</b> porque os tickets migraram para uma ferramenta não integrada. Foram 8 críticos."],
      ["Governança", "Alfa + Alfa Serviços", "O mesmo grupo, <b>cadastrado duas vezes.</b> A receita real do grupo é R$ 1,2 mi, não R$ 2,3 mi."],
    ];
    const causes = [["Base mensal × anual", "falta de dicionário de dados"], ["Retrato de seis meses", "falta de SLA de atualização"], ["Ferramenta não integrada", "projeto que terminou sem integração"], ["Cadastro duplicado", "falta de dono do cadastro"]];
    const inner = `
  <div class="stage" id="s27-stage">
    ${chrome(CRUMB, "27")}
    <div class="eyebrow" id="s27-eyebrow">Módulo 2 · Dinâmica · Revelação</div>
    <h2 class="title" id="s27-title">O que o painel <em>não mostrava</em></h2>
    <div id="s27-cards">${cards.map((c, i) => `<div class="card cp q rev" id="s27-c${i + 1}" style="left:${96 + i * 330}px"><span class="badge"><i></i>${c[0]}</span><h4>${c[1]}</h4><p id="s27-p${i + 1}">${c[2]}</p></div>`).join("")}</div>
    <div class="band low" id="s27-band">Com os dados corrigidos, a <b>Alfa sai</b>, a <b>Beta entra</b> e a Épsilon disputa a 3ª vaga com a Zeta. <em id="s27-duas">Em geral, duas das três escolhas mudam.</em></div>
    <div class="side">
      <div class="card" id="s27-placar"><div class="k">Sua escolha × dado corrigido</div>
        <div class="t" id="s27-pl1"><b>Alfa</b> sai</div><div class="t" id="s27-pl2"><b>Beta</b> entra</div><div class="t" id="s27-pl3"><b>Épsilon</b> disputa a 3ª vaga com a Zeta</div>
      </div>
    </div>
    <div class="dark" id="s27-dark">
      <div class="k">E repare no que aconteceu</div>
      <div class="l" id="s27-k1">Você usou o <b>critério certo</b>: receita × risco. É o que qualquer comitê usaria.</div>
      <div class="big" id="s27-k2"><em>O dado</em> é que estava errado.</div>
      <div class="l" id="s27-k3">Substitua você por um <b>modelo de propensão</b> treinado nesse painel:</div>
      <div class="chips"><span class="chip" id="s27-k4">erraria igual</span><span class="chip" id="s27-k5">com a mesma confiança</span><span class="chip" id="s27-k6">mais rápido</span><span class="chip" id="s27-k7">para a carteira inteira</span></div>
    </div>
    <div class="card" id="s27-ceo">
      <div class="k">Cadeira: CEO · nenhum desses quatro erros é de tecnologia</div>
      ${causes.map((c, i) => `<div class="cause" id="s27-e${i + 1}"><span>${c[0]}</span><i>→</i><b>${c[1]}</b></div>`).join("")}
      <div class="foot" id="s27-gestao">Quatro decisões de gestão <b>que ninguém tomou</b>.</div>
    </div>
    <div class="ask low" id="s27-ask"><span class="k">Debate</span><p>Que controle teria evitado cada erro? <em>Quem é o dono de cada dado?</em></p></div>
  </div>`;
    const css = `${CP_CSS}
  #root .card.cp.q.rev { height: 300px; } #root .card.cp.q.rev h4 { font-size: 28px; margin-top: 6px; } #root .card.cp.q.rev p { font-size: 17px; margin-top: 8px; } #root .card.cp.q.rev p b { color: #C73E00; }
  #root .card.cp.q.rev p.on b { background: #FFEEE6; border-radius: 6px; padding: 0 4px; }
  #root #s27-band { top: 624px; } #root #s27-band em { color: #FF9A66; font-style: normal; font-weight: 900; } #root #s27-band b { color: #fff; }
  #root #s27-placar .t { margin-top: 8px; }
  #root #s27-dark .big { font-size: 60px; } #root #s27-dark .l { font-size: 27px; margin-top: 16px; } #root #s27-dark .chips { margin-top: 18px; } #root #s27-dark .chip { font-size: 24px; }
  #root #s27-ceo { left: 96px; top: 300px; width: 1300px; height: 480px; padding: 30px 40px; transform-origin: 0% 50%; }
  #root #s27-ceo .k { font-size: 15px; letter-spacing: .14em; text-transform: uppercase; font-weight: 900; color: #B83800; margin-bottom: 18px; }
  #root .cause { display: grid; grid-template-columns: 420px 40px 1fr; align-items: center; gap: 12px; font-size: 27px; padding: 10px 0; border-bottom: 1px solid #EDEDED; color: #1A1A1A; }
  #root .cause i { font-style: normal; color: #FF5100; font-weight: 900; } #root .cause b { color: #C73E00; font-weight: 900; }
  #root #s27-ceo .foot { margin-top: 18px; font-size: 34px; font-weight: 900; letter-spacing: -0.03em; } #root #s27-ceo .foot b { color: #FF5100; }
`;
    const js = `
    hide(".card.cp, #s27-band, #s27-placar, #s27-placar .t, #s27-dark, #s27-dark .l, #s27-dark .big, #s27-dark .chip, #s27-ceo, .cause, #s27-gestao, #s27-ask");
    enterCurve(tl, "#s27-stage", 0);
    press(tl, "#s27-title", ${cues.intro} + 0.2);
    // um cartão por vez, da esquerda para a direita; a frase-chave de cada um acende nos beats seguintes
    ${[1, 2, 3, 4].map((i) => `waterfall(tl, ["#s27-c${i}"], ${cues["c" + i]} + 0.2, { y: 60, d: 0.22 }); tl.set("#s27-p${i}", { className: "on" }, ${cues["c" + i + "b"]} + 0.2); press(tl, "#s27-p${i}", ${cues["c" + i + "b"]} + 0.2);`).join("\n    ")}
    tl.set("#s27-band", { opacity: 1 }, ${cues.faixa} + 0.1); arrive(tl, "#s27-band", ${cues.faixa} + 0.1, 14);
    tl.set("#s27-placar", { opacity: 1 }, ${cues.faixa} + 0.3); arrive(tl, "#s27-placar", ${cues.faixa} + 0.3);
    waterfall(tl, ["#s27-pl1", "#s27-pl2", "#s27-pl3"], ${cues.faixa} + 0.8, { y: 20, d: 0.16, gap: 0.6 });
    press(tl, "#s27-duas", ${cues.duas} + 0.1);
    // "repare": cartões e faixa recuam, painel escuro com o argumento
    tl.to("#s27-cards, #s27-band", { scale: 0.85, opacity: 0, filter: "blur(10px)", duration: 0.25, ease: "power3.in" }, ${cues.repare});
    tl.set("#s27-dark", { opacity: 1 }, ${cues.repare} + 0.2); arrive(tl, "#s27-dark", ${cues.repare} + 0.2);
    waterfall(tl, ["#s27-k1"], ${cues.criterio}, { y: 30 });
    tl.set("#s27-k2", { opacity: 1 }, ${cues.dado}); arrive(tl, "#s27-k2", ${cues.dado}, 14);
    waterfall(tl, ["#s27-k3"], ${cues.modelo}, { y: 30 });
    waterfall(tl, ["#s27-k4", "#s27-k5"], ${cues.igual}, { y: 24, d: 0.16, gap: 0.8 });
    waterfall(tl, ["#s27-k6", "#s27-k7"], ${cues.rapido}, { y: 24, d: 0.16, gap: 0.8 });
    // cadeira do CEO: o painel sai, as quatro causas de gestão entram uma a uma
    tl.to("#s27-dark", { scale: 0.85, opacity: 0, filter: "blur(10px)", duration: 0.25, ease: "power3.in" }, ${cues.ceo} - 0.05);
    tl.set("#s27-ceo", { opacity: 1 }, ${cues.ceo} + 0.2); arrive(tl, "#s27-ceo", ${cues.ceo} + 0.2);
    ${[1, 2, 3, 4].map((i) => `waterfall(tl, ["#s27-e${i}"], ${cues["e" + i]}, { y: 24, d: 0.18 });`).join(" ")}
    waterfall(tl, ["#s27-gestao"], ${cues.gestao} + 0.2, { y: 30, d: 0.2 });
    exitCurve(tl, "#s27-placar", ${cues.debate} - 0.1);
    waterfall(tl, ["#s27-ask"], ${cues.debate} + 0.2, { y: 60, d: 0.2 });
    exitCurve(tl, "#s27-stage", ${dur - 0.3});`;
    return root("tela27", dur, inner, css) + script("tela27", js);
  },

  // ------------------------------------------------------------------ TELA 28 · REVISÃO HUMANA NA MEDIDA DO RISCO
  tela28: ({ cues, dur }) => {
    const lv = [
      ["Baixo risco", "Uso interno e reversível", "Resumo de reunião, rascunho de e-mail interno, pesquisa", "Autor revisa antes de usar; checagem por amostragem", ""],
      ["Médio risco", "Vai para cliente ou parceiro", "Resposta de atendimento, proposta, conteúdo de marketing", "Revisão obrigatória antes de enviar; base aprovada; registro de quem aprovou", ""],
      ["Alto risco", "Dinheiro, pessoas, direitos ou compliance", "Crédito, bloqueio por fraude, contratação, lançamento contábil", "IA recomenda, pessoa decide; trilha de auditoria; teste de viés; plano de contingência", "ink"],
    ];
    const inner = `
  <div class="stage" id="s28-stage">
    ${chrome(CRUMB, "28")}
    <div class="eyebrow" id="s28-eyebrow">Módulo 2 · Revisão humana</div>
    <h2 class="title" id="s28-title">Revisão humana <em>na medida do risco</em></h2>
    <p class="sub" id="s28-sub">Se o dado pode enganar, a resposta da IA também pode. Quanto mais a decisão mexe com dinheiro, pessoas ou compliance, mais forte precisa ser a revisão.</p>
    ${lv.map((l, i) => `
    <div class="card cp lv ${l[4]}" id="s28-c${i + 1}" style="left:${96 + i * 442}px"><span class="badge${l[4] ? " ink" : ""}"><i></i>${l[0]}</span><div class="k">Quando</div><h4>${l[1]}</h4><div class="k">Exemplos</div><p id="s28-x${i + 1}">${l[2]}</p><div class="k">Controle mínimo</div><p id="s28-m${i + 1}">${l[3]}</p></div>`).join("")}
    <div class="side">
      <div class="card" id="s28-cro"><div class="k">Cadeira: CRO</div><div class="t">No setor financeiro, quase tudo que chega ao cliente está <b>do degrau do meio para cima</b>.</div>
        <div class="t" id="s28-des" style="margin-top:12px;font-size:19px">Não é obstáculo: é o seu <b>desenho de controle</b>.</div>
        <div class="t" id="s28-reg" style="margin-top:12px;font-size:19px">É o que o <b>regulador</b> vai perguntar na documentação do modelo.</div>
      </div>
    </div>
    <div class="band low" id="s28-band">A IA <em>recomenda</em>. A pessoa <em>decide</em>.</div>
    <div class="ask low" id="s28-ask"><span class="k">Pergunta</span><p>Em qual nível estão <em>as oportunidades que vocês mapearam?</em></p></div>
    <div class="src">Fontes: Gartner — Microsoft 365 Copilot and Agents: Assessing Impact and Value in 2026; AI Agents in Financial Close.</div>
  </div>`;
    const css = `${CP_CSS}
  #root #s28-title { font-size: 54px; width: 1700px; }
  #root #s28-sub { top: 300px; width: 1300px; font-size: 22px; }
  #root .card.cp.lv { top: 386px; height: 420px; padding: 20px 26px; }
  #root .card.cp.lv .k { margin-top: 12px; } #root .card.cp.lv h4 { font-size: 24px; margin-top: 6px; } #root .card.cp.lv p { font-size: 17px; margin-top: 6px; line-height: 1.35; }
  #root .card.cp.lv.ink h4 { color: #fff; }
  #root #s28-band { top: 830px; width: 1290px; }
  #root #s28-ask { top: 830px; }
`;
    const js = `
    hide("#s28-sub, .card.cp, #s28-cro, #s28-des, #s28-reg, #s28-band, #s28-ask");
    enterCurve(tl, "#s28-stage", 0);
    waterfall(tl, ["#s28-sub"], ${cues.intro} + 0.2, { y: 30 });
    press(tl, "#s28-title", ${cues.calibrada} + 0.2);
    waterfall(tl, ["#s28-c1"], ${cues.baixo}, { y: 70, d: 0.2 });
    waterfall(tl, ["#s28-c2"], ${cues.medio}, { y: 70, d: 0.2 });
    // alto risco: o cartão escuro chega; exemplos e controles acendem; a frase-chave fecha embaixo
    tl.set("#s28-c3", { opacity: 1 }, ${cues.alto} + 0.1); arrive(tl, "#s28-c3", ${cues.alto} + 0.1);
    tl.set("#s28-x3", { className: "on" }, ${cues.exemplos} + 0.2); press(tl, "#s28-x3", ${cues.exemplos} + 0.2);
    tl.set("#s28-band", { opacity: 1 }, ${cues.decide} + 0.1); arrive(tl, "#s28-band", ${cues.decide} + 0.1, 14);
    tl.set("#s28-x3", { className: "" }, ${cues.controles}); tl.set("#s28-m3", { className: "on" }, ${cues.controles} + 0.2); press(tl, "#s28-m3", ${cues.controles} + 0.2);
    tl.set("#s28-cro", { opacity: 1 }, ${cues.cro} + 0.1); arrive(tl, "#s28-cro", ${cues.cro} + 0.1);
    waterfall(tl, ["#s28-des"], ${cues.desenho} + 0.2, { y: 20 });
    exitCurve(tl, "#s28-band", ${cues.regulador} - 0.1);
    waterfall(tl, ["#s28-reg"], ${cues.regulador} + 0.2, { y: 20 });
    waterfall(tl, ["#s28-ask"], ${cues.regulador} + 0.6, { y: 60, d: 0.2 });
    exitCurve(tl, "#s28-stage", ${dur - 0.3});`;
    return root("tela28", dur, inner, css) + script("tela28", js);
  },

  // ------------------------------------------------------------------ DECISÃO PARA LEVAR (tela cheia: gráficos em x>=1210)
  decisao: ({ cues, dur }) => {
    const inner = `
  <div class="stage" id="d-stage">
    <div class="card" id="d-card">
      <div class="kick" id="d-kick"><b>Lista</b> A decisão mais cara da sua área</div>
      <div class="rows" id="d-rows">${[1, 2, 3, 4, 5].map((i) => `<div class="row" id="d-row${i}"><span class="n">${i}</span><span class="d">dado</span><i>→</i><span class="o" id="d-o${i}">dono</span></div>`).join("")}</div>
      <div class="lab" id="d-branco">Campo em branco = <b>seu próximo projeto</b>. E ele <b>não é de IA</b>.</div>
    </div>
    <div class="card" id="d-south">
      <div class="kick"><b>South</b> Assessment de dados</div>
      <div class="t">É esta lista que a South monta primeiro.</div>
      <div class="chips"><span class="chip" id="d-i0">dono</span><span class="chip" id="d-i1">dicionário</span><span class="chip" id="d-i2">SLA de atualização</span><span class="chip" id="d-i3">integração</span></div>
      <div class="lab" id="d-ultima">O modelo é a <b>última linha</b> do plano. Não a primeira.</div>
    </div>
    <div id="d-next">
      <div class="lab" id="d-nl">Próximo episódio · Módulo 3</div>
      <div class="ttl" id="d-nt"><b>EP07</b> Carteira, não coleção de pilotos</div>
      <div class="embed" id="d-punch2">Carteira,<br><em>não coleção de pilotos.</em></div>
      <div class="line" id="d-mapa">Traga o seu <b>mapa</b>.</div>
    </div>
  </div>`;
    const css = `
  #root { background: transparent; }
  #root #d-card, #root #d-south { left: 1210px; top: 120px; width: 650px; padding: 30px 34px; transform-origin: 50% 100%; }
  #root .kick { font-size: 18px; letter-spacing: .12em; text-transform: uppercase; color: #6B6B6B; font-weight: 800; margin-bottom: 22px; }
  #root .kick b { background: #C73E00; color: #fff; padding: 6px 12px; border-radius: 6px; margin-right: 12px; letter-spacing: 0; }
  #root #d-rows { display: flex; flex-direction: column; gap: 10px; }
  #root .row { display: grid; grid-template-columns: 36px 1fr 30px 1fr; align-items: center; gap: 10px; font-size: 24px; color: #1A1A1A; }
  #root .row .n { width: 32px; height: 32px; border-radius: 50%; background: #1A1A1A; color: #fff; display: grid; place-items: center; font-weight: 900; font-size: 15px; }
  #root .row .d, #root .row .o { border-bottom: 3px solid #E6E6E6; padding: 6px 4px; color: #9A9A9A; font-weight: 700; }
  #root .row .o.on { color: #C73E00; border-color: #FF5100; } #root .row i { font-style: normal; color: #FF5100; font-weight: 900; text-align: center; }
  #root .row.blank .o { background: #FFEEE6; color: #FFEEE6; border-color: #FF5100; }
  #root #d-card .lab { font-size: 24px; color: #4A4A4A; line-height: 1.3; margin-top: 22px; } #root #d-card .lab b { color: #C73E00; font-weight: 900; }
  #root #d-south .t { font-size: 30px; line-height: 1.25; color: #1A1A1A; }
  #root #d-south .chips { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 18px; } #root #d-south .chip { background: #1A1A1A; color: #FF9A66; font-size: 22px; font-weight: 800; padding: 8px 16px; border-radius: 999px; }
  #root #d-south .lab { font-size: 24px; color: #4A4A4A; line-height: 1.3; margin-top: 22px; } #root #d-south .lab b { color: #C73E00; font-weight: 900; }
  #root #d-next { position: absolute; left: 1210px; top: 200px; width: 650px; }
  #root #d-next .lab { font-size: 22px; letter-spacing: .14em; text-transform: uppercase; color: rgba(255,255,255,.7); font-weight: 800; margin: 0; }
  #root #d-next .ttl { font-size: 54px; font-weight: 900; color: #fff; letter-spacing: -0.04em; line-height: 1.05; margin-top: 16px; } #root #d-next .ttl b { color: #FF5100; margin-right: 14px; }
  #root #d-punch2 { position: static; margin-top: 40px; font-size: 68px; color: #fff; transform-origin: 0% 50%; } #root #d-punch2 em { font-style: normal; color: #FF5100; }
  #root #d-next .line { margin-top: 28px; font-size: 32px; color: rgba(255,255,255,.9); } #root #d-next .line b { color: #FF9A66; font-weight: 900; }
`;
    const js = `
    hide("#d-card, #d-kick, .row, #d-branco, #d-south, #d-south .chip, #d-ultima, #d-nl, #d-nt, #d-punch2, #d-mapa");
    tl.set("#d-card", { opacity: 1 }, ${cues.task});
    waterfall(tl, ["#d-card", "#d-kick"], ${cues.task}, { y: 80, d: 0.22, gap: 0.1 });
    waterfall(tl, ["#d-row1", "#d-row2", "#d-row3", "#d-row4", "#d-row5"], ${cues.cinco} + 0.2, { y: 24, d: 0.16, gap: 0.22 });
    ${[1, 2, 3, 4, 5].map((i) => `tl.set("#d-o${i}", { className: "o on" }, ${cues.dono} + ${(0.2 + (i - 1) * 0.18).toFixed(2)});`).join(" ")}
    tl.set("#d-row4", { className: "row blank" }, ${cues.branco} + 0.2); press(tl, "#d-row4", ${cues.branco} + 0.2);
    waterfall(tl, ["#d-branco"], ${cues.branco} + 0.6, { y: 30 });
    exitCurve(tl, "#d-card", ${cues.south});
    tl.set("#d-south", { opacity: 1 }, ${cues.south} + 0.15); enterCurve(tl, "#d-south", ${cues.south} + 0.15);
    waterfall(tl, ["#d-i0", "#d-i1", "#d-i2", "#d-i3"], ${cues.itens} + 0.2, { y: 20, d: 0.16, gap: 0.5 });
    waterfall(tl, ["#d-ultima"], ${cues.ultima} + 0.2, { y: 30 });
    tl.to("#d-south", { y: -230, duration: 0.3, ease: "power4.in" }, ${cues.next} - 0.2);
    tl.to("#d-south", { opacity: 0, duration: 0.18, ease: "none" }, ${cues.next} - 0.2);
    waterfall(tl, ["#d-nl", "#d-nt"], ${cues.next} + 0.1, { y: 70, d: 0.2, gap: 0.09 });
    tl.set("#d-punch2", { opacity: 1 }, ${cues.punch2}); arrive(tl, "#d-punch2", ${cues.punch2});
    waterfall(tl, ["#d-mapa"], ${cues.mapa} + 0.1, { y: 30 });
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

export const SCENES = SCENES_EP06;
