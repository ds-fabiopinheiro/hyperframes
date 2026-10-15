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


const SCENES_EP02 = {};

// ---------------------------------------------------------------------------------------------
// EP02 · Onde o valor está escondido: Comercial e Marketing
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
      if (b.cue === "fig") moves.push(`tl.to("#${id}-z", { scale: 1, x: 0, y: 0, duration: 1.1, ease: "power2.inOut" }, ${b.t});`);
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

Object.assign(SCENES_EP02, {
  // ------------------------------------------------------------------ GANCHO FRIO (tela cheia: gráficos em x>=1210)
  gancho: ({ cues, dur }) => {
    const inner = `
  <div class="stage" id="g-stage">
    <div id="g-kicker"><b>EP02</b> Onde o valor está escondido</div>
    <div class="card" id="g-pedido"><div class="k">Pedido da equipe comercial</div><div class="t">Orçamento: assistente de IA para os gerentes de conta</div><div class="stamp" id="g-sim">SIM</div></div>
    <div id="g-chips"><div class="chip" id="g-chip-0">barato</div><div class="chip" id="g-chip-1">rápido</div><div class="chip" id="g-chip-2">todo mundo tem</div></div>
    <div id="g-matrix">
      <div class="q q1">Riscos calculados</div><div class="q q2">Ganhos prováveis</div><div class="q q3" id="g-q3">Ganhos marginais</div>
      <div class="dot" id="g-dot"></div>
      <div class="lab" id="g-lab">assistente do vendedor = <b>menor valor</b></div>
    </div>
  </div>`;
    const css = `
  #root { background: transparent; }
  #root #g-kicker { position: absolute; left: 1210px; top: 64px; font-size: 22px; color: rgba(255,255,255,.75); letter-spacing: .06em; text-transform: uppercase; font-weight: 600; }
  #root #g-kicker b { color: #fff; background: #FF5100; padding: 6px 12px; border-radius: 6px; margin-right: 14px; font-weight: 900; }
  #root #g-pedido { left: 1210px; top: 170px; width: 650px; padding: 26px 30px; }
  #root #g-pedido .k { font-size: 15px; letter-spacing: .14em; text-transform: uppercase; color: #6B6B6B; font-weight: 800; }
  #root #g-pedido .t { font-size: 30px; font-weight: 800; letter-spacing: -0.02em; margin-top: 8px; line-height: 1.2; }
  #root .stamp { position: absolute; right: 26px; top: 22px; font-size: 44px; font-weight: 900; color: #fff; background: #FF5100; padding: 6px 20px; border-radius: 10px; transform: rotate(-8deg); letter-spacing: .04em; }
  #root #g-chips { position: absolute; left: 1210px; top: 380px; display: flex; gap: 14px; flex-wrap: wrap; width: 650px; }
  #root .chip { background: rgba(255,255,255,.08); border: 2px solid rgba(255,255,255,.18); color: #fff; font-size: 28px; font-weight: 700; padding: 14px 24px; border-radius: 14px; }
  #root #g-matrix { position: absolute; left: 1210px; top: 500px; width: 650px; height: 440px; }
  #root #g-matrix .q { position: absolute; width: 318px; height: 180px; border-radius: 12px; padding: 14px; font-size: 20px; font-weight: 800; color: #fff; }
  #root #g-matrix .q1 { left: 0; top: 0; background: #2B6FB3; } #root #g-matrix .q2 { left: 332px; top: 0; background: #1F4E8C; }
  #root #g-matrix .q3 { left: 332px; top: 194px; background: #6DA9DD; color: #0B2A4A; }
  #root #g-matrix .dot { position: absolute; left: 520px; top: 280px; width: 34px; height: 34px; border-radius: 50%; background: #FF5100; box-shadow: 0 0 0 10px rgba(255,81,0,.25); }
  #root #g-matrix .lab { position: absolute; left: 0; top: 214px; width: 300px; font-size: 24px; color: #fff; line-height: 1.3; } #root #g-matrix .lab b { color: #FF9A66; }
`;
    const js = `
    hide("#g-kicker, #g-pedido, #g-sim, .chip, #g-matrix, #g-dot, #g-lab");
    tl.set("#g-kicker", { opacity: 1 }, ${cues.open});
    tl.fromTo("#g-kicker", { x: 60 }, { x: 0, duration: 0.5, ease: "power4.out", immediateRender: false }, ${cues.open});
    waterfall(tl, ["#g-pedido"], ${cues.open} + 0.4, { y: 60, d: 0.2 });
    // "sim": carimbo chega grande e assenta (inverse zoom)
    tl.set("#g-sim", { opacity: 1 }, ${cues.sim} + 0.1);
    tl.fromTo("#g-sim", { scale: 2.2, rotation: -8 }, { scale: 1, rotation: -8, duration: 0.4, ease: "expo.out", immediateRender: false }, ${cues.sim} + 0.1);
    waterfall(tl, ["#g-chip-0", "#g-chip-1", "#g-chip-2"], ${cues.chips} + 0.2, { y: 50, d: 0.16, gap: 0.12 });
    // a matriz chega; o ponto cai no quadrante de menor valor
    tl.set("#g-matrix", { opacity: 1 }, ${cues.embed});
    tl.fromTo("#g-matrix", { y: 80 }, { y: 0, duration: 0.3, ease: "power4.out", immediateRender: false }, ${cues.embed});
    tl.set("#g-dot", { opacity: 1 }, ${cues.embed} + 0.5);
    tl.fromTo("#g-dot", { scale: 3, opacity: 0.3 }, { scale: 1, opacity: 1, duration: 0.45, ease: "expo.out", immediateRender: false }, ${cues.embed} + 0.5);
    tl.to("#g-q3", { backgroundColor: "#FFEEE6", duration: 0.3 }, ${cues.embed} + 0.9);
    waterfall(tl, ["#g-lab"], ${cues.embed} + 1.0, { y: 30 });
    exitCurve(tl, "#g-kicker", ${dur - 0.3}); exitCurve(tl, "#g-pedido", ${dur - 0.3}); exitCurve(tl, "#g-chips", ${dur - 0.3}); exitCurve(tl, "#g-matrix", ${dur - 0.3});`;
    return root("gancho", dur, inner, css) + script("gancho", js);
  },

  // ------------------------------------------------------------------ VINHETA (igual ao EP01, título do EP02)
  vinheta: ({ dur }) => {
    const inner = `
  <div class="stage" id="v-stage">
    <div id="v-bg"></div><div id="v-net"></div>
    <div id="v-group">
      <img id="v-logo" src="assets/south-logo.png" alt="South System">
      <div id="v-title"><span class="w" id="v-w0">South</span><span class="w" id="v-w1">Academy</span><span class="w" id="v-w2">Executive</span></div>
      <div id="v-sub"><span class="w" id="v-s0">Letramento de IA</span><span class="w" id="v-s1">para líderes</span></div>
      <div id="v-ep"><span class="w" id="v-e0">EP02</span><span class="w" id="v-e1">Onde o valor está escondido</span></div>
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

  // ------------------------------------------------------------------ TELA 06 · DIVISÓRIA · MÓDULO 1
  tela06: ({ cues, dur }) => {
    const areas = ["Comercial e Pré-vendas", "Marketing", "TI", "Financeiro", "Jurídico", "RH", "CS"];
    const inner = `
  <div class="stage" id="s6-stage">
    <div id="s6-net"></div>
    ${chrome("Módulo 1 · Aplicações", "06", true)}
    <div id="s6-num" aria-hidden="true" data-contrast-allow="decorative">01</div>
    <div id="s6-body">
      <div class="eyebrow light" id="s6-eye">Módulo 1 · <b>Aplicações de IA nas áreas de negócio</b></div>
      <h1 id="s6-title"><span class="w" id="s6-t0">Onde a IA pode</span><span class="w" id="s6-t1"><em>ajudar minha área?</em></span></h1>
      <p id="s6-note">Casos de uso em sete áreas, com <b>benefícios, condições de implementação e limitações</b>. Ganhos em produtividade, experiência do cliente e qualidade das decisões.</p>
      <div id="s6-chips">${areas.map((a, i) => `<span class="chip" id="s6-a${i}">${a}</span>`).join("")}</div>
      <div id="s6-hoje">Hoje: <b>Comercial</b> e <b>Marketing</b></div>
    </div>
  </div>`;
    const css = `
  #root { background: #FF5100; }
  #root #s6-net { position: absolute; inset: 0; background: url(assets/cover-bg.jpg) center / cover no-repeat; }
  #root #s6-eye { position: static; } #root .eyebrow.light { color: rgba(255,255,255,.85); } #root .eyebrow.light b { color: #fff; }
  #root #s6-num { position: absolute; right: 120px; top: 150px; font-size: 420px; font-weight: 900; letter-spacing: -0.06em; color: rgba(255,154,102,.6); line-height: 1; }
  #root #s6-body { position: absolute; left: 96px; top: 168px; width: 1300px; }
  #root #s6-title { margin-top: 110px; font-size: 104px; line-height: 1.02; font-weight: 900; letter-spacing: -0.045em; color: #fff; }
  #root #s6-title em { font-style: normal; color: #1A1A1A; }
  #root #s6-note { margin-top: 30px; width: 1100px; font-size: 28px; line-height: 1.45; color: rgba(255,255,255,.92); }
  #root #s6-note b { color: #fff; }
  #root #s6-chips { margin-top: 40px; display: flex; flex-wrap: wrap; gap: 12px; width: 1300px; }
  #root .chip { display: inline-block; background: rgba(255,255,255,.14); border: 2px solid rgba(255,255,255,.35); color: #fff; font-size: 24px; font-weight: 700; padding: 12px 22px; border-radius: 999px; }
  #root .chip.on { background: #1A1A1A; border-color: #1A1A1A; color: #FF9A66; }
  #root #s6-hoje { position: absolute; left: 0; top: 760px; font-size: 30px; color: #fff; font-weight: 600; } #root #s6-hoje b { color: #1A1A1A; font-weight: 900; }
  #root .w { display: inline-block; margin-right: .22em; }
`;
    const js = `
    hide("#s6-num, #s6-eye, .w, #s6-note, .chip, #s6-hoje");
    // chegada da divisória: zoom-through (push) vindo da vinheta
    enterPush(tl, "#s6-body", 0, 18);
    waterfall(tl, ["#s6-num"], 0.1, { y: 90, d: 0.25 });
    waterfall(tl, ["#s6-eye"], ${cues.title}, { y: 40 });
    waterfall(tl, ["#s6-t0", "#s6-t1"], ${cues.title} + 0.2, { y: 80, d: 0.2, gap: 0.1 });
    waterfall(tl, ["#s6-note"], ${cues.title} + 0.7, { y: 40 });
    waterfall(tl, [${areas.map((_, i) => `"#s6-a${i}"`).join(", ")}], ${cues.chips} + 0.2, { y: 40, d: 0.14, gap: 0.08 });
    // "hoje, Comercial e Marketing": os dois acendem, os outros recuam
    tl.set("#s6-a0", { className: "chip on" }, ${cues.hoje});
    tl.set("#s6-a1", { className: "chip on" }, ${cues.hoje} + 0.12);
    ${[2, 3, 4, 5, 6].map((i) => `tl.to("#s6-a${i}", { opacity: 0.35, duration: 0.3 }, ${cues.hoje});`).join(" ")}
    waterfall(tl, ["#s6-hoje"], ${cues.hoje} + 0.3, { y: 40 });
    exitCurve(tl, "#s6-stage", ${dur - 0.3});`;
    return root("tela06", dur, inner, css) + script("tela06", js);
  },

  // ------------------------------------------------------------------ TELA 07 · TRÊS TIPOS DE VALOR
  tela07: ({ cues, dur, beats }) => {
    const b = Object.fromEntries(beats.map((x) => [x.cue, x]));
    const cards = [
      { h: "Produtividade", q: "Fazer o mesmo trabalho com menos tempo e esforço.", ex: "agente virtual de service desk desvia 15% a 20% dos incidentes." },
      { h: "Experiência do cliente", q: "Resposta mais rápida, personalizada e sem atrito.", ex: "até 2028, 70% dos clientes devem iniciar o atendimento por IA conversacional." },
      { h: "Qualidade da decisão", q: "Prever, priorizar e detectar riscos e padrões.", ex: "previsão de caixa com IA ganhou de 11% a 23% em acurácia em casos reais." },
    ];
    const inner = `
  <div class="stage" id="s7-stage">
    ${chrome("Módulo 1 · Aplicações", "07")}
    <div class="eyebrow" id="s7-eyebrow">Módulo 1 · Tipos de valor</div>
    <h2 class="title" id="s7-title">Três tipos de valor para <em>procurar na sua área</em></h2>
    <p class="sub" id="s7-sub">Toda oportunidade de IA deveria melhorar pelo menos um destes resultados. Se não melhora nenhum, é tecnologia procurando problema.</p>
    ${cards.map((c, i) => `<div class="card tv" id="s7-c${i + 1}" style="left:${96 + i * 442}px"><div class="n">0${i + 1}</div><h4>${c.h}</h4><p>${c.q}</p><div class="ex"><b>Exemplo:</b> ${c.ex}</div></div>`).join("")}
    <div class="ask low" id="s7-ask"><span class="k">Pergunta</span><p>Na sua área, qual dos três tipos de valor é <em>mais urgente hoje?</em></p></div>
    <div class="src">Fontes: Gartner, via Ask Gartner (out/2026), e Gartner Newsroom (29/07/2024).</div>
  </div>`;
    const css = `
  #root #s7-sub { width: 1720px; font-size: 25px; }
  #root .card.tv { top: 440px; width: 420px; height: 330px; padding: 26px 28px; display: flex; flex-direction: column; gap: 10px; transform-origin: 50% 50%; }
  #root .card.tv .n { font-size: 16px; letter-spacing: .14em; color: #6B6B6B; font-weight: 800; }
  #root .card.tv h4 { font-size: 30px; }
  #root .card.tv p { font-size: 21px; margin-top: 0; }
  #root .card.tv .ex { margin-top: auto; background: #FFEEE6; border-radius: 10px; padding: 12px 14px; font-size: 18px; line-height: 1.35; } #root .card.tv .ex b { color: #C73E00; }
  #root .card.tv.on { box-shadow: 0 0 0 4px #FF5100, 0 24px 60px -30px rgba(26,26,26,.35); }
  #root .card.tv.ink { background: #1A1A1A; color: #fff; } #root .card.tv.ink p { color: rgba(255,255,255,.85); } #root .card.tv.ink .ex { background: rgba(255,255,255,.1); color: #fff; } #root .card.tv.ink .ex b { color: #FF9A66; }
  #root #s7-ask { top: 800px; }
  #root .src { bottom: 48px; }
`;
    const seg = Math.max(0.6, (b.three.dur - 0.3) / 3);
    const js = `
    hide(".card, #s7-ask");
    enterCurve(tl, "#s7-stage", 0);
    waterfall(tl, ["#s7-c1", "#s7-c2", "#s7-c3"], ${cues.cards} + 0.2, { y: 70, d: 0.2, gap: 0.1 });
    // "produtividade, experiência, decisão": cada cartão acende na sua vez
    ${[1, 2, 3].map((i) => `tl.set("#s7-c${i}", { className: "card tv on" }, ${cues.three} + ${((i - 1) * seg).toFixed(2)}); press(tl, "#s7-c${i}", ${cues.three} + ${((i - 1) * seg).toFixed(2)});${i > 1 ? ` tl.set("#s7-c${i - 1}", { className: "card tv" }, ${cues.three} + ${((i - 1) * seg).toFixed(2)});` : ""}`).join("\n    ")}
    // "decisão é o menos explorado": o terceiro vira ink, os outros recuam
    tl.set("#s7-c3", { className: "card tv ink" }, ${cues.decisao});
    tl.to("#s7-c1, #s7-c2", { opacity: 0.45, scale: 0.97, duration: 0.4, ease: "power2.out" }, ${cues.decisao});
    waterfall(tl, ["#s7-ask"], ${cues.ask}, { y: 60, d: 0.2 });
    exitCurve(tl, "#s7-stage", ${dur - 0.3});`;
    return root("tela07", dur, inner, css) + script("tela07", js);
  },

  // ------------------------------------------------------------------ TELA 08 · BENEFÍCIOS RELATADOS
  tela08: ({ cues, dur, beats }) => {
    const b = Object.fromEntries(beats.map((x) => [x.cue, x]));
    const bars = [["Produtividade", 73, ""], ["Redução de custos", 64, ""], ["Aumento de receita", 59, "mid"], ["Experiência do cliente", 50, "mid"], ["Qualidade da decisão", 45, "tan"]];
    const inner = `
  <div class="stage" id="s8-stage">
    ${chrome("Módulo 1 · Aplicações", "08")}
    <div class="eyebrow" id="s8-eyebrow">Módulo 1 · O que as empresas relatam</div>
    <h2 class="title" id="s8-title">Benefícios que as empresas <em>relatam com IA</em></h2>
    <div class="card" id="s8-bars">
      <div class="k">% das empresas que relatam cada benefício</div>
      ${bars.map((r, i) => `<div class="hb" id="s8-hb${i}"><span class="lab">${r[0]}</span><div class="tr"><div class="fi ${r[2]}" id="s8-fi${i}"></div></div><span class="v" id="s8-v${i}">0%</span></div>`).join("")}
    </div>
    <div class="card dark" id="s8-dark">
      <div class="k">GenAI · médias relatadas por 822 líderes</div>
      <div class="row"><div class="big" id="s8-b0">+0,0%</div><p>produtividade</p></div>
      <div class="row"><div class="big" id="s8-b1">+0,0%</div><p>receita</p></div>
      <div class="row"><div class="big" id="s8-b2">−0,0%</div><p>custos</p></div>
    </div>
    <div class="src">Fontes: Gartner, via Ask Gartner (out/2026), e Gartner Newsroom (29/07/2024).</div>
  </div>`;
    const css = `
  #root #s8-bars { left: 96px; top: 330px; width: 880px; height: 560px; padding: 28px 32px; }
  #root .card .k { font-size: 15px; letter-spacing: .14em; text-transform: uppercase; font-weight: 800; color: #6B6B6B; margin-bottom: 18px; }
  #root .hb { display: grid; grid-template-columns: 250px 1fr 90px; align-items: center; gap: 16px; margin: 14px 0; }
  #root .hb .lab { font-size: 22px; font-weight: 700; }
  #root .hb .tr { height: 38px; background: #EDEDED; border-radius: 8px; overflow: hidden; }
  #root .hb .fi { height: 100%; width: 100%; background: #FF5100; border-radius: 8px; transform-origin: 0 50%; }
  #root .hb .fi.mid { background: #FF7A33; } #root .hb .fi.tan { background: #E8A200; }
  #root .hb .v { font-size: 26px; font-weight: 900; text-align: right; letter-spacing: -0.03em; }
  #root .hb.on .lab { color: #C73E00; }
  #root #s8-dark { left: 1010px; top: 330px; width: 400px; height: 560px; background: #1A1A1A; color: #fff; padding: 28px 30px; transform-origin: 0% 50%; }
  #root #s8-dark .k { color: rgba(255,255,255,.6); }
  #root #s8-dark .row { margin: 14px 0 22px; } #root #s8-dark .big { font-size: 60px; color: #FF9A66; } #root #s8-dark p { font-size: 20px; color: rgba(255,255,255,.85); margin-top: 2px; }
`;
    const seg = Math.max(0.5, (b.bars.dur - 0.6) / 4);
    const js = `
    hide("#s8-bars, #s8-dark");
    gsap.set(".hb .fi", { scaleX: 0 });
    enterCurve(tl, "#s8-stage", 0);
    waterfall(tl, ["#s8-bars"], 0.2, { y: 60, d: 0.2 });
    // barras crescem em sequência durante a enumeração; a última ("decisão") no seu beat
    ${[0, 1, 2, 3].map((i) => `tl.to("#s8-fi${i}", { scaleX: ${bars[i][1] / 100}, duration: 0.8, ease: "power3.out" }, ${cues.bars} + ${(i * seg).toFixed(2)}); countUp(tl, "#s8-v${i}", ${bars[i][1]}, ${cues.bars} + ${(i * seg).toFixed(2)}, { dur: 0.8, suffix: "%" });`).join("\n    ")}
    tl.to("#s8-fi4", { scaleX: 0.45, duration: 0.9, ease: "power3.out" }, ${cues.bar5}); countUp(tl, "#s8-v4", 45, ${cues.bar5}, { dur: 0.9, suffix: "%" });
    // quadro escuro chega (inverse zoom) e os números contam
    tl.set("#s8-dark", { opacity: 1 }, ${cues.dark} + 0.1); arrive(tl, "#s8-dark", ${cues.dark} + 0.1);
    countUp(tl, "#s8-b0", 22.6, ${cues.darknums}, { dur: 1.0, dec: 1, prefix: "+", suffix: "%" });
    countUp(tl, "#s8-b1", 15.8, ${cues.darknums} + 0.5, { dur: 1.0, dec: 1, prefix: "+", suffix: "%" });
    countUp(tl, "#s8-b2", 15.2, ${cues.darknums} + 1.0, { dur: 1.0, dec: 1, prefix: "−", suffix: "%" });
    // "onde ganhou menos em decisão": a última barra pulsa uma vez e o rótulo acende
    tl.set("#s8-hb4", { className: "hb on" }, ${cues.onde});
    tl.fromTo("#s8-fi4", { scaleX: 0.45 }, { scaleX: 0.5, duration: 0.25, ease: "power2.out", immediateRender: false }, ${cues.onde});
    tl.to("#s8-fi4", { scaleX: 0.45, duration: 0.4, ease: "power2.inOut" }, ${cues.onde} + 0.25);
    exitCurve(tl, "#s8-stage", ${dur - 0.3});`;
    return root("tela08", dur, inner, css) + script("tela08", js);
  },

  // ------------------------------------------------------------------ TELA 09 · COMERCIAL E PRÉ-VENDAS
  tela09: ({ cues, dur }) => {
    const cases = [
      { badge: "IA generativa", h: "Assistente do vendedor", r: "Transcrições e CRM integrados; consentimento para gravar (LGPD).", g: "Resume reuniões, rascunha follow-ups e atualiza o CRM; até 50% menos tempo de preparo.", w: "Atualizar o CRM sem validação corrompe os dados." },
      { badge: "IA generativa", h: "Respostas a RFP e propostas", r: "Base de respostas aprovadas, cases e templates atualizados.", g: "Um dos dois únicos casos com alto impacto em eficácia de vendas, não só em eficiência.", w: "Revisão humana obrigatória; dado competitivo velho gera resposta genérica." },
      { badge: "IA preditiva", badgeInk: true, h: "Previsão e priorização de oportunidades", r: "CRM com estágios consistentes e histórico de ganhos e perdas.", g: "Chance de ganho por oportunidade para focar o pipeline; times com IA têm 2,5× mais chance de bater metas.", w: "Nota sem próxima ação recomendada é ignorada." },
    ];
    const stats = [["75%+", "g", "menos tempo longe do cliente até 2028 (previsão)"], ["1 em 3", "r", "dos CSOs relata benefício da GenAI bem abaixo do esperado"], ["<80%", "r", "de aceitação das sugestões da IA sinaliza falta de confiança"]];
    const inner = `
  <div class="stage" id="s9-stage">
    ${chrome("Módulo 1 · Aplicações", "09")}
    <div class="eyebrow" id="s9-eyebrow">Módulo 1 · Comercial e Pré-vendas</div>
    <h2 class="title" id="s9-title">Comercial e Pré-vendas: <em>mais tempo com o cliente</em></h2>
    ${cases.map((c, i) => caseCard("s9", i + 1, c, 96 + i * 442)).join("")}
    <div class="stats">${stats.map((s, i) => `<div class="stat" id="s9-n${i + 1}"><div class="n ${s[1]}">${s[0]}</div><div class="l">${s[2]}</div></div>`).join("")}</div>
    <div class="ask low" id="s9-ask"><span class="k">Pergunta</span><p>Qual tarefa administrativa <em>mais rouba tempo de cliente</em> do seu time?</p></div>
    <div class="src">Fontes: Gartner — 13 Generative AI Use Cases for B2B Sales; Boost Sales Effectiveness With Targeted AI Investments.</div>
  </div>`;
    const css = `${CASE_CSS}
  #root .stats { left: 1420px; top: 300px; width: 404px; }
  #root .card.case { height: 500px; }
  #root #s9-title { font-size: 54px; width: 1700px; }
  #root #s9-ask { top: 818px; width: 1290px; }
`;
    const js = `
    hide(".card, .warn, .stat, #s9-ask");
    enterCurve(tl, "#s9-stage", 0);
    ${[1, 2, 3].map((i) => `waterfall(tl, ["#s9-c${i}"], ${cues["c" + i]}, { y: 70, d: 0.2 }); waterfall(tl, ["#s9-w${i}"], ${cues["w" + i]}, { y: 24, d: 0.16 });`).join("\n    ")}
    ${[1, 2, 3].map((i) => `waterfall(tl, ["#s9-n${i}"], ${cues["n" + i]}, { y: 50, d: 0.2 });`).join(" ")}
    waterfall(tl, ["#s9-ask"], ${cues.ask}, { y: 60, d: 0.2 });
    exitCurve(tl, "#s9-stage", ${dur - 0.3});`;
    return root("tela09", dur, inner, css) + script("tela09", js);
  },

  // ------------------------------------------------------------------ TELA 10 · MARKETING
  tela10: ({ cues, dur }) => {
    const cases = [
      { badge: "IA generativa", h: "Geração e otimização de conteúdo", r: "Guia de marca, histórico de campanhas e integração com as plataformas de mídia.", g: "Variações de anúncios, e-mails e páginas em escala, com testes A/B mais rápidos.", w: "Alucinação, viés e risco à marca exigem aprovação humana e trilha de auditoria." },
      { badge: "IA preditiva", badgeInk: true, h: "Qualificação de contas e sinais de intenção", r: "Dados de contas, histórico de negócios e sinais de intenção integrados.", g: "Prioriza as contas com maior chance de compra e deixa o pipeline mais preciso.", w: "O modelo herda vieses do histórico e precisa ser re-treinado." },
      { badge: "Preditiva + generativa", h: "Personalização para o grupo de compra", r: "Camada única de dados do cliente (CDP), o pré-requisito número 1.", g: "Conteúdo por papel no comitê de compra (5 a 12 pessoas), no canal e no momento certos.", w: "Plataformas imaturas e preço por consumo de agentes podem estourar o orçamento." },
    ];
    const stats = [["79%", "r", "dos CMOs miram produtividade; só 48% miram receita"], ["57%", "g", "de CEOs e CFOs veem CX como a principal alavanca de crescimento"], ["60%", "g", "das marcas usarão IA agêntica em interações 1:1 até 2028"]];
    const inner = `
  <div class="stage" id="s10-stage">
    ${chrome("Módulo 1 · Aplicações", "10")}
    <div class="eyebrow" id="s10-eyebrow">Módulo 1 · Marketing</div>
    <h2 class="title" id="s10-title">Marketing: personalizar em escala, <em>marca protegida</em></h2>
    ${cases.map((c, i) => caseCard("s10", i + 1, c, 96 + i * 442)).join("")}
    <div class="stats">${stats.map((s, i) => `<div class="stat" id="s10-n${i + 1}"><div class="n ${s[1]}">${s[0]}</div><div class="l">${s[2]}</div></div>`).join("")}</div>
    <div class="ask low" id="s10-ask"><span class="k">Pergunta</span><p>Que parte do nosso marketing hoje é <em>volume</em> e que parte é <em>decisão?</em></p></div>
    <div class="src">Fontes: Gartner — Tech Buying Drivers (CMOs Beyond Efficiency-Only AI); MQ B2B Marketing Automation Platforms.</div>
  </div>`;
    const css = `${CASE_CSS}
  #root #s10-title { font-size: 54px; width: 1700px; }
  #root .card.case { height: 500px; }
  #root #s10-ask { top: 818px; width: 1290px; }
`;
    const js = `
    hide(".card, .warn, .stat, #s10-ask");
    enterCurve(tl, "#s10-stage", 0);
    ${[1, 2, 3].map((i) => `waterfall(tl, ["#s10-c${i}"], ${cues["c" + i]}, { y: 70, d: 0.2 }); waterfall(tl, ["#s10-w${i}"], ${cues["w" + i]}, { y: 24, d: 0.16 });`).join("\n    ")}
    ${[1, 2, 3].map((i) => `waterfall(tl, ["#s10-n${i}"], ${cues["n" + i]}, { y: 50, d: 0.2 });`).join(" ")}
    waterfall(tl, ["#s10-ask"], ${cues.ask}, { y: 60, d: 0.2 });
    exitCurve(tl, "#s10-stage", ${dur - 0.3});`;
    return root("tela10", dur, inner, css) + script("tela10", js);
  },

  // ------------------------------------------------------------------ DECISÃO PARA LEVAR (tela cheia: gráficos em x>=1210)
  decisao: ({ cues, dur }) => {
    const inner = `
  <div class="stage" id="d-stage">
    <div class="card" id="d-card">
      <div class="kick" id="d-kick"><b>Esta semana</b> Decisão para levar</div>
      <div class="step" id="d-s1"><span>1</span><div>Pegue a iniciativa de IA <b>comercial ou de marketing</b> em andamento.</div></div>
      <div class="step" id="d-s2"><span>2</span><div>Pergunte: <b>em qual quadrante ela cai?</b></div></div>
      <div id="d-matrix">
        <div class="q q1">Riscos calculados</div><div class="q q2">Ganhos prováveis</div><div class="q q3" id="d-q3">Ganhos marginais</div>
        <div class="dot" id="d-dot"></div>
      </div>
      <div class="lab" id="d-marg">“Ganho marginal”: <b>não cancele.</b></div>
      <div class="lab punch" id="d-punch">Só não a chame de <b>estratégia.</b></div>
    </div>
    <div class="card" id="d-south">
      <div class="kick"><b>South</b> onde a South entra</div>
      <div class="t">Assessment curto para separar, na carteira comercial,</div>
      <div class="vv"><span id="d-v1">o que é <b>viável</b></span><span id="d-v2">do que é <b>valioso</b></span></div>
    </div>
    <div id="d-next">
      <div class="lab" id="d-nl">Próximo episódio</div>
      <div class="ttl" id="d-nt"><b>EP03</b> O problema não é a ferramenta</div>
      <div class="sub" id="d-ns">TI e Financeiro.</div>
      <div class="embed" id="d-punch2">5 anos de chatbot.<br><em>15% parados.</em></div>
    </div>
  </div>`;
    const css = `
  #root { background: transparent; }
  #root #d-card, #root #d-south { left: 1210px; top: 120px; width: 650px; padding: 30px 34px; transform-origin: 50% 100%; }
  #root #d-card { height: 820px; }
  #root .kick { font-size: 18px; letter-spacing: .12em; text-transform: uppercase; color: #6B6B6B; font-weight: 800; margin-bottom: 22px; }
  #root .kick b { background: #C73E00; color: #fff; padding: 6px 12px; border-radius: 6px; margin-right: 12px; letter-spacing: 0; }
  #root .step { display: flex; gap: 14px; align-items: flex-start; font-size: 23px; line-height: 1.3; margin-bottom: 16px; color: #1A1A1A; }
  #root .step span { flex: none; width: 36px; height: 36px; border-radius: 50%; background: #1A1A1A; color: #fff; display: grid; place-items: center; font-weight: 900; font-size: 18px; }
  #root .step b { color: #C73E00; font-weight: 900; }
  #root #d-matrix { position: relative; width: 582px; height: 300px; margin-top: 10px; }
  #root #d-matrix .q { position: absolute; width: 285px; height: 142px; border-radius: 12px; padding: 12px; font-size: 19px; font-weight: 800; color: #fff; }
  #root #d-matrix .q1 { left: 0; top: 0; background: #2B6FB3; } #root #d-matrix .q2 { left: 297px; top: 0; background: #1F4E8C; } #root #d-matrix .q3 { left: 297px; top: 154px; background: #6DA9DD; color: #0B2A4A; }
  #root #d-matrix .dot { position: absolute; left: 470px; top: 215px; width: 30px; height: 30px; border-radius: 50%; background: #FF5100; box-shadow: 0 0 0 10px rgba(255,81,0,.22); }
  #root .lab { font-size: 24px; line-height: 1.3; color: #1A1A1A; margin-top: 18px; } #root .lab b { color: #C73E00; font-weight: 900; }
  #root .lab.punch { font-size: 30px; font-weight: 700; }
  #root #d-south .t { font-size: 26px; line-height: 1.35; color: #1A1A1A; }
  #root .vv { display: flex; flex-direction: column; gap: 10px; margin-top: 22px; font-size: 34px; font-weight: 700; letter-spacing: -0.02em; } #root .vv b { color: #C73E00; font-weight: 900; }
  #root #d-next { position: absolute; left: 1210px; top: 200px; width: 650px; }
  #root #d-next .lab { font-size: 22px; letter-spacing: .14em; text-transform: uppercase; color: rgba(255,255,255,.7); font-weight: 800; margin: 0; }
  #root #d-next .ttl { font-size: 54px; font-weight: 900; color: #fff; letter-spacing: -0.04em; line-height: 1.05; margin-top: 16px; } #root #d-next .ttl b { color: #FF5100; margin-right: 14px; }
  #root #d-next .sub { position: static; width: 620px; font-size: 28px; color: rgba(255,255,255,.85); margin-top: 20px; }
  #root #d-punch2 { position: static; margin-top: 34px; font-size: 72px; color: #fff; transform-origin: 0% 50%; } #root #d-punch2 em { font-style: normal; color: #FF5100; }
`;
    const js = `
    hide("#d-card, #d-kick, .step, #d-matrix, #d-dot, #d-marg, #d-punch, #d-south, #d-v1, #d-v2, #d-next .lab, #d-next .ttl, #d-next .sub, #d-punch2");
    tl.set("#d-card", { opacity: 1 }, ${cues.task});
    waterfall(tl, ["#d-card", "#d-kick"], ${cues.task}, { y: 80, d: 0.22, gap: 0.1 });
    waterfall(tl, ["#d-s1"], ${cues.list}, { y: 40 });
    waterfall(tl, ["#d-s2", "#d-matrix"], ${cues.quad}, { y: 40, d: 0.2, gap: 0.12 });
    // "ganho marginal": o ponto cai no quadrante e o quadrante acende
    tl.set("#d-dot", { opacity: 1 }, ${cues.marginal} + 0.1);
    tl.fromTo("#d-dot", { scale: 3, opacity: 0.3 }, { scale: 1, opacity: 1, duration: 0.45, ease: "expo.out", immediateRender: false }, ${cues.marginal} + 0.1);
    tl.to("#d-q3", { backgroundColor: "#FFEEE6", duration: 0.3 }, ${cues.marginal} + 0.4);
    waterfall(tl, ["#d-marg"], ${cues.marginal} + 0.5, { y: 30 });
    waterfall(tl, ["#d-punch"], ${cues.punch}, { y: 40, d: 0.2 });
    // South: o cartão de decisão sai pela esquerda e o cartão South chega
    exitCurve(tl, "#d-card", ${cues.south});
    tl.set("#d-south", { opacity: 1 }, ${cues.south} + 0.15); enterCurve(tl, "#d-south", ${cues.south} + 0.15);
    waterfall(tl, ["#d-v1"], ${cues.vv}, { y: 40 }); waterfall(tl, ["#d-v2"], ${cues.vv} + 0.35, { y: 40 });
    // próximo episódio: sobe e sai (elevação), teaser chega
    tl.to("#d-south", { y: -230, duration: 0.3, ease: "power4.in" }, ${cues.next} - 0.2);
    tl.to("#d-south", { opacity: 0, duration: 0.18, ease: "none" }, ${cues.next} - 0.2);
    waterfall(tl, ["#d-nl", "#d-nt", "#d-ns"], ${cues.next} + 0.1, { y: 70, d: 0.2, gap: 0.09 });
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
const FIGS = {
  tela09a: { num: "09A", eyebrow: "Módulo 1 · Comercial · <b>Gartner</b>", title: "Casos de IA generativa em vendas B2B: <em>valor × viabilidade</em>", img: "fig-09a.webp", iw: 1273, ih: 1180,
    desc: "13 casos de IA generativa em vendas B2B posicionados por valor (vertical) e viabilidade (horizontal).",
    insights: ["<b>Ganhos prováveis:</b> automação de propostas (RFP), mensagens de valor, inteligência de negócios e operações de vendas.", "<b>Riscos calculados:</b> inteligência de decisão de vendas, “vendedores digitais” e dados sintéticos.", "<b>Ganhos marginais:</b> assistente do vendedor e pesquisa de mercado: fáceis, mas de pouco valor."],
    key: "O mais fácil de comprar nem sempre é o que mais vale.",
    src: "13 Generative AI Use Cases for B2B Sales", zooms: { likely: [0.40, 0.08, 0.36, 0.52], risks: [0.05, 0.08, 0.36, 0.52], marginal: [0.05, 0.59, 0.72, 0.27], parabola: [0, 0, 1, 1] } },
  tela09b: { num: "09B", eyebrow: "Módulo 1 · Comercial · <b>Gartner</b>", title: "Casos de IA generativa em vendas B2B: <em>scorecard</em>", img: "fig-09b.webp", iw: 1273, ih: 916,
    desc: "A nota de cada caso de vendas em valor (receita, eficiência, experiência do comprador) e viabilidade (técnica e interna).",
    insights: ["Círculo maior e mais escuro = nota mais alta.", "<b>Automação de RFP</b> e <b>criação de mensagens de valor</b> pontuam alto em quase todos os critérios.", "É o mesmo raciocínio da régua do Módulo 3."],
    key: "Pontue as ideias da sua área com critérios iguais para todas.",
    src: "13 Generative AI Use Cases for B2B Sales", zooms: { rows: [0.0, 0.52, 1.0, 0.32] } },
  tela09c: { num: "09C", eyebrow: "Módulo 1 · Comercial · <b>Gartner</b>", title: "Casos de IA generativa em vendas B2B: <em>pipeline de adoção</em>", img: "fig-09c.webp", iw: 1273, ih: 892,
    desc: "Em que etapa da jornada (marketing, vendas, pós-venda) cada caso de IA atua.",
    insights: ["Vários casos atravessam a jornada inteira, do marketing ao sucesso do cliente.", "Isso exige uma <b>base única de dados do cliente</b>.", "Ajuda a definir qual área é dona de cada iniciativa."],
    key: "Caso que cruza áreas precisa de um dono só.",
    src: "13 Generative AI Use Cases for B2B Sales", zooms: { arrows: [0.22, 0.08, 0.76, 0.78] } },
  tela09d: { num: "09D", eyebrow: "Módulo 1 · Comercial · <b>Gartner</b>", title: "Eficácia de vendas impulsionada por <em>investimentos estratégicos em IA</em>", img: "fig-09d.webp", iw: 1274, ih: 858,
    desc: "Como agentes de IA, vendedores e investimentos em IA se combinam ao longo do processo de vendas.",
    insights: ["A IA concentra valor em <b>qualificar, descobrir e avaliar</b> oportunidades.", "Negociação e fechamento seguem com pessoas.", "Tudo depende de um <b>processo de vendas repetível</b>."],
    key: "IA acelera o funil; o relacionamento continua humano.",
    src: "Boost Sales Effectiveness With Targeted AI Investments", zooms: { mid: [0.17, 0.14, 0.5, 0.66], right: [0.58, 0.14, 0.42, 0.66], process: [0.0, 0.66, 1.0, 0.18] } },
  tela09e: { num: "09E", eyebrow: "Módulo 1 · Comercial · <b>Gartner</b>", title: "IA generativa em tecnologia de vendas: <em>visão geral do mercado</em>", img: "fig-09e.webp", iw: 1273, ih: 691,
    desc: "Os quatro segmentos do mercado de IA generativa para vendas e quem costuma comprar cada um.",
    insights: ["Funções em ferramentas de vendas e startups de IA: quem compra é <b>Vendas</b>.", "Recursos de IA em ferramentas de escritório e provedores de modelos: quem compra é <b>TI</b>.", "Cada caminho tem custo, integração e governança diferentes."],
    key: "Antes de comprar, defina quem decide e quem sustenta.",
    src: "Navigate GenAI in Sales Tech: Balance Opportunities and Risks", zooms: { buyer: [0.72, 0.12, 0.28, 0.7] } },
  tela09f: { num: "09F", eyebrow: "Módulo 1 · Comercial · <b>Gartner</b>", title: "IA generativa em tecnologia de vendas: <em>mapa de mercado</em>", img: "fig-09f.webp", iw: 1273, ih: 836,
    desc: "O mapa de categorias de tecnologia de vendas impactadas pela IA generativa.",
    insights: ["<b>CRM</b>, orquestração de receita, assistentes e agentes de vendas estão no centro da mudança.", "Três rupturas: sintetizar informação, simplificar o uso das ferramentas e gerar conteúdo e insights.", "O CRM tende a virar plataforma com agentes embutidos."],
    key: "A ferramenta atual pode já trazer a IA; avalie antes de comprar outra.",
    src: "Navigate GenAI in Sales Tech: Balance Opportunities and Risks", zooms: { crm: [0.46, 0.12, 0.54, 0.58], disrupt: [0.0, 0.7, 1.0, 0.17] } },
  tela09g: { num: "09G", eyebrow: "Módulo 1 · Comercial · <b>Gartner</b>", title: "O futuro da IA agêntica <em>nas aplicações corporativas</em>", img: "fig-09g.webp", iw: 1280, ih: 770,
    desc: "Linha do tempo da IA agêntica nas aplicações corporativas, de 2025 a 2029.",
    insights: ["<b>2025:</b> assistentes de IA em toda aplicação.", "<b>2026 e 2027:</b> agentes por tarefa, depois colaborando dentro da aplicação.", "<b>2028 e 2029:</b> ecossistemas de agentes entre aplicações e o “novo normal”."],
    key: "Dados e governança precisam estar prontos antes da autonomia.",
    src: "Innovation Insight: AI-Native CRM", zooms: { pan: [0.22, 0.68, 0.76, 0.22], steps: [0.22, 0.08, 0.76, 0.3] } },
  tela10a: { num: "10A", eyebrow: "Módulo 1 · Marketing · <b>Gartner</b>", title: "Adoção de IA nos <em>casos de uso de marketing</em>", img: "fig-10a.webp", iw: 1269, ih: 798,
    desc: "Percentual de líderes de marketing que já usam, vão usar ou não pretendem usar IA em cada caso.",
    insights: ["Produção de conteúdo lidera: <b>64%</b> já usam.", "Gestão de campanhas (54%) e experimentação (45%) vêm a seguir.", "Qualificação de contas B2B ainda é pouco adotada: <b>13%</b> usam."],
    key: "O mercado começou pelo conteúdo; o valor maior está em qualificar e personalizar.",
    src: "Tech Buying Drivers: Tech Providers Must Move CMOs Beyond Efficiency-Only AI", zooms: { top: [0.0, 0.2, 1.0, 0.13], bottom: [0.0, 0.72, 1.0, 0.1] } },
  tela10b: { num: "10B", eyebrow: "Módulo 1 · Marketing · <b>Gartner</b>", title: "Principais estratégias de crescimento <em>de CEOs e CFOs</em>", img: "fig-10b.webp", iw: 1492, ih: 1189,
    desc: "As principais estratégias de crescimento citadas por 125 CEOs e CFOs.",
    insights: ["Melhorar a experiência do cliente é a nº 1: <b>57%</b>.", "Depois vêm melhorar produtos (46%) e lançar novos (45%).", "Preço e novos públicos aparecem bem abaixo."],
    key: "IA em marketing deve mirar o cliente e a receita, não só eficiência.",
    src: "Tech Buying Drivers: Tech Providers Must Move CMOs Beyond Efficiency-Only AI", zooms: { bar: [0.0, 0.11, 1.0, 0.14], x35: [0, 0, 1, 1] } },
  tela10c: { num: "10C", eyebrow: "Módulo 1 · Marketing · <b>Gartner</b> · corte opcional", title: "Modelo de mercado: <em>marketing digital e estratégia de marca</em>", img: "fig-10c.webp", iw: 1280, ih: 1096,
    desc: "Como a Gartner projeta o mercado de serviços de marketing digital e estratégia de marca até 2029.",
    insights: ["Crescimento previsto de <b>US$ 54 bilhões</b> em cinco anos (5,4% ao ano).", "IA e IA generativa aparecem entre os fatores que mudam o investimento em marketing.", "CMOs devem recorrer mais a parceiros externos."],
    key: "A IA muda onde o orçamento de marketing é gasto.",
    src: "Forecast Analysis: Digital Marketing and Brand Strategy Services, Worldwide", zooms: { top: [0.1, 0.06, 0.8, 0.13] } },
  tela10d: { num: "10D", eyebrow: "Módulo 1 · Marketing · <b>Gartner</b> · corte opcional", title: "Marketing digital e marca: <em>gasto por segmento</em>", img: "fig-10d.webp", iw: 1275, ih: 1003,
    desc: "Crescimento em 2025 × crescimento anual até 2029 por segmento de serviços de marketing. O tamanho da bolha é o gasto.",
    insights: ["<b>Consultoria de tecnologia</b> e <b>implementação de aplicações</b> crescem mais.", "Serviços gerenciados crescem menos.", "Os serviços que integram dados e ferramentas lideram."],
    key: "O valor está em integrar, não em ter mais ferramentas.",
    src: "Forecast Analysis: Digital Marketing and Brand Strategy Services, Worldwide", zooms: { bubbles: [0.5, 0.08, 0.45, 0.45] } },
  tela10e: { num: "10E", eyebrow: "Módulo 1 · Marketing · <b>Gartner</b> · corte opcional", title: "Previsões Gartner: <em>da pesquisa ao futuro</em>", img: "fig-10e.webp", iw: 1310, ih: 608,
    desc: "Como a Gartner transforma pesquisa acumulada em previsões de mercado.",
    insights: ["As previsões combinam dados de pesquisa e análise de especialistas.", "Servem para orientar direção e prioridades.", "<b>Não substituem a linha de base da sua empresa.</b>"],
    key: "Use previsão como bússola, não como meta.",
    src: "Over 100 Data, Analytics and AI Predictions Through 2031", zooms: {},
    extra: `<div class="embed" id="s10e-embed"><em>Bússola,</em> não meta.</div>` },
};
for (const [id, cfg] of Object.entries(FIGS)) {
  const base = figScene(id, cfg);
  SCENES_EP02[id] = (ctx) => {
    const { inner, css, js } = base(ctx);
    const { cues, dur } = ctx;
    let extraCss = "", extraJs = "";
    if (id === "tela09a") {
      // parábola do diretor comercial: a figura recua, o cartão da história chega; "igual" e o embed
      extraCss = `
  #root #s9a-quote { left: 96px; top: 330px; width: 1110px; height: 560px; padding: 44px 48px; border-left: 12px solid #FF5100; transform-origin: 0% 50%; }
  #root #s9a-quote .q { font-size: 46px; font-weight: 700; letter-spacing: -0.03em; line-height: 1.15; }
  #root #s9a-quote .q b { color: #FF5100; font-weight: 900; }
  #root #s9a-quote .row { display: flex; gap: 30px; margin-top: 34px; align-items: flex-end; }
  #root #s9a-quote .m { font-size: 110px; font-weight: 900; letter-spacing: -0.05em; line-height: 1; color: #FF5100; }
  #root #s9a-quote .ml { font-size: 24px; color: #4A4A4A; margin-bottom: 14px; }
  #root #s9a-quote .igual { font-size: 80px; font-weight: 900; color: #1A1A1A; letter-spacing: -0.04em; }
  #root #s9a-embed { left: 96px; top: 380px; width: 1110px; font-size: 110px; color: #1A1A1A; transform-origin: 0% 50%; } #root #s9a-embed em { font-style: normal; color: #FF5100; }
`;
      extraJs = `
    hide("#s9a-quote, #s9a-quote .q, #s9a-quote .row, #s9a-quote .igual, #s9a-embed");
    tl.to("#tela09a-fig", { scale: 0.8, opacity: 0.15, filter: "blur(10px)", duration: 0.25, ease: "power3.in" }, ${cues.parabola});
    tl.set("#tela09a-fig", { opacity: 0 }, ${cues.parabola} + 0.25);
    tl.set("#s9a-quote", { opacity: 1 }, ${cues.parabola} + 0.2); arrive(tl, "#s9a-quote", ${cues.parabola} + 0.2);
    waterfall(tl, ["#s9a-q1"], ${cues.parabola} + 0.5, { y: 40 });
    waterfall(tl, ["#s9a-row"], ${cues.p90}, { y: 40 }); countUp(tl, "#s9a-m", 90, ${cues.p90}, { dur: 1.0, suffix: "%" });
    waterfall(tl, ["#s9a-q2"], ${cues.cfo}, { y: 40 });
    waterfall(tl, ["#s9a-igual"], ${cues.igual}, { y: 60, d: 0.22 });
    tl.to("#s9a-quote", { scale: 0.8, opacity: 0.15, filter: "blur(10px)", duration: 0.25, ease: "power3.in" }, ${cues.embed} - 0.05);
    tl.set("#s9a-quote", { opacity: 0 }, ${cues.embed} + 0.2);
    tl.set("#s9a-embed", { opacity: 1 }, ${cues.embed} + 0.2); arrive(tl, "#s9a-embed", ${cues.embed} + 0.2, 18);`;
      const quote = `
    <div class="card" id="s9a-quote">
      <div class="q" id="s9a-q1">O diretor comercial de uma seguradora comprou licenças de assistente <b>para toda a força de vendas.</b></div>
      <div class="row" id="s9a-row"><div class="m" id="s9a-m">0%</div><div class="ml">de adoção seis meses depois. Festa.</div></div>
      <div class="q" id="s9a-q2" style="margin-top:30px">Aí o CFO perguntou: <b>“e a taxa de conversão?”</b></div>
      <div class="igual" id="s9a-igual">Igual.</div>
    </div>
    <div class="embed" id="s9a-embed">Viabilidade alta<br><em>não é valor alto.</em></div>`;
      return root(id, dur, inner.replace("\n  </div>", quote + "\n  </div>"), css + extraCss) + script(id, js + extraJs);
    }
    if (id === "tela10e") {
      extraCss = `
  #root #s10e-embed { left: 96px; top: 300px; width: 1110px; font-size: 128px; color: #fff; text-align: center; padding-top: 220px; transform-origin: 50% 50%; } #root #s10e-embed em { font-style: normal; color: #FF9A66; }
`;
      extraJs = `
    hide("#s10e-embed");
    tl.to("#tela10e-fig", { filter: "brightness(0.25)", duration: 0.4 }, ${cues.embed});
    tl.set("#s10e-embed", { opacity: 1 }, ${cues.embed} + 0.1); arrive(tl, "#s10e-embed", ${cues.embed} + 0.1, 18);`;
      return root(id, dur, inner, css + extraCss) + script(id, js + extraJs);
    }
    return root(id, dur, inner, css) + script(id, js);
  };
}

export const SCENES = SCENES_EP02;
