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



const SCENES_EP05 = {};

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
// EP05 · Preditiva, generativa, nenhuma: a pergunta de ouro (Módulo 2)
// Regra das cenas de tela cheia (gancho, decisão): gráficos e legendas em x >= 1210 (o vídeo do
// narrador ocupa x < 1140). Telas com narrador no canto: nada em x > 1472 e y > 807.
// ---------------------------------------------------------------------------------------------

const CRUMB = "Módulo 2 · Fundamentos";
const CP_CSS = `
  #root .card.cp { top: 300px; width: 420px; height: 330px; padding: 24px 28px; transform-origin: 50% 100%; }
  #root .card.cp .dot { width: 44px; height: 44px; border-radius: 50%; background: #1A1A1A; color: #fff; display: grid; place-items: center; font-weight: 900; font-size: 22px; }
  #root .card.cp h4 { font-size: 27px; margin-top: 14px; min-height: 64px; }
  #root .card.cp h4.on { color: #C73E00; }
  #root .irow { display: flex; gap: 12px; align-items: flex-start; margin-top: 14px; font-size: 19px; line-height: 1.3; color: #1A1A1A; }
  #root .irow > span:first-child { flex: none; display: inline-flex; align-items: center; gap: 8px; font-size: 15px; letter-spacing: .1em; text-transform: uppercase; font-weight: 800; color: #6B6B6B; width: 118px; padding-top: 3px; }
  #root .irow > span:first-child i { width: 8px; height: 8px; border-radius: 50%; background: #BDBDBD; }
  #root .irow.on > span:first-child { color: #C73E00; } #root .irow.on > span:first-child i { background: #FF5100; }
  #root .irow.on > span:last-child { font-weight: 800; }
  #root .side { position: absolute; left: 1420px; top: 300px; width: 404px; display: flex; flex-direction: column; gap: 14px; }
  #root .verd { background: #fff; border-radius: 14px; padding: 16px 20px; box-shadow: 0 1px 2px rgba(26,26,26,.04), 0 14px 40px -24px rgba(26,26,26,.18); transform-origin: 0% 50%; }
  #root .verd .k { font-size: 17px; line-height: 1.3; color: #4A4A4A; }
  #root .verd .v { font-size: 34px; font-weight: 900; letter-spacing: -0.03em; color: #FF5100; margin-top: 6px; line-height: 1; }
  #root .verd.ink { background: #1A1A1A; } #root .verd.ink .k { color: rgba(255,255,255,.8); } #root .verd.ink .v { color: #FF9A66; }
  #root .band.low { top: 660px; width: 1300px; }
  #root .ask.low { top: 818px; width: 1290px; }
`;

Object.assign(SCENES_EP05, {
  // ------------------------------------------------------------------ GANCHO FRIO (tela cheia: gráficos em x>=1210)
  gancho: ({ cues, dur, beats }) => {
    const credEnd = beats.find((b) => b.id === "g02")?.end ?? cues.credito + 6;
    const inner = `
  <div class="stage" id="g-stage">
    <div id="g-kicker"><b>EP05</b> Preditiva, generativa, nenhuma</div>
    <div class="card" id="g-chat">
      <div class="k">Desde 2023</div>
      <div class="row"><span class="bub" id="g-b1">“IA”</span><span class="eq" id="g-eq">=</span><span class="bub ink" id="g-b2">chat</span></div>
    </div>
    <div class="card" id="g-cred">
      <div class="k">Modelo de crédito da sua empresa</div>
      <div class="row2"><span class="n" id="g-n1">10</span><span class="l">anos rodando</span></div>
      <div class="row2"><span class="n" id="g-n2">bilhões</span><span class="l">em concessão, decididos por ele</span></div>
      <div class="stamp" id="g-antigo">COISA ANTIGA</div>
    </div>
    <div class="card ink" id="g-punch"><div class="a">Hoje a gente</div><div class="b"><em>devolve as coisas ao lugar.</em></div></div>
  </div>`;
    const css = `
  #root { background: transparent; }
  #root #g-kicker { position: absolute; left: 1210px; top: 64px; font-size: 22px; color: rgba(255,255,255,.75); letter-spacing: .06em; text-transform: uppercase; font-weight: 600; }
  #root #g-kicker b { color: #fff; background: #FF5100; padding: 6px 12px; border-radius: 6px; margin-right: 14px; font-weight: 900; }
  #root #g-chat { left: 1210px; top: 140px; width: 650px; padding: 24px 30px; }
  #root #g-chat .k, #root #g-cred .k { font-size: 14px; letter-spacing: .12em; text-transform: uppercase; color: #6B6B6B; font-weight: 800; margin-bottom: 14px; }
  #root #g-chat .row { display: flex; align-items: center; gap: 18px; }
  #root .bub { display: inline-block; background: #F1F1F1; border-radius: 22px 22px 22px 4px; padding: 12px 22px; font-size: 40px; font-weight: 900; letter-spacing: -0.03em; color: #1A1A1A; }
  #root .bub.ink { background: #FF5100; color: #fff; border-radius: 22px 22px 4px 22px; }
  #root .eq { font-size: 44px; font-weight: 900; color: #6B6B6B; }
  #root #g-cred { left: 1210px; top: 318px; width: 650px; padding: 24px 30px; }
  #root #g-cred .row2 { display: flex; align-items: baseline; gap: 16px; margin-top: 6px; }
  #root #g-cred .n { font-size: 56px; font-weight: 900; letter-spacing: -0.04em; color: #1A1A1A; line-height: 1; }
  #root #g-cred .l { font-size: 24px; color: #4A4A4A; }
  #root .stamp { position: absolute; right: 22px; top: 18px; font-size: 30px; font-weight: 900; color: #fff; background: #C73E00; padding: 6px 16px; border-radius: 10px; transform: rotate(-8deg); letter-spacing: .04em; }
  #root #g-punch { left: 1210px; top: 560px; width: 650px; padding: 30px 34px; background: #1A1A1A; color: #fff; border: 2px solid rgba(255,255,255,.12); transform-origin: 0% 50%; }
  #root #g-punch .a { font-size: 34px; font-weight: 700; color: rgba(255,255,255,.8); }
  #root #g-punch .b { font-size: 54px; font-weight: 900; letter-spacing: -0.04em; line-height: 1.05; margin-top: 8px; } #root #g-punch em { font-style: normal; color: #FF9A66; }
`;
    const js = `
    hide("#g-kicker, #g-chat, #g-b1, #g-eq, #g-b2, #g-cred, #g-antigo, #g-punch");
    tl.set("#g-kicker", { opacity: 1 }, ${cues.open});
    tl.fromTo("#g-kicker", { x: 60 }, { x: 0, duration: 0.5, ease: "power4.out", immediateRender: false }, ${cues.open});
    waterfall(tl, ["#g-chat"], ${cues.open} + 0.3, { y: 60, d: 0.2 });
    waterfall(tl, ["#g-b1", "#g-eq", "#g-b2"], ${cues.open} + 0.8, { y: 30, d: 0.16, gap: 0.35 });
    press(tl, "#g-b2", ${cues.open} + 1.6);
    waterfall(tl, ["#g-cred"], ${cues.credito}, { y: 60, d: 0.2 });
    countUp(tl, "#g-n1", 10, ${cues.credito} + 0.3, { dur: 0.8 });
    // "coisa antiga": o carimbo chega grande e assenta no fim da frase
    tl.set("#g-antigo", { opacity: 1 }, ${(credEnd - 1.3).toFixed(2)});
    tl.fromTo("#g-antigo", { scale: 2.2, rotation: -8 }, { scale: 1, rotation: -8, duration: 0.4, ease: "expo.out", immediateRender: false }, ${(credEnd - 1.3).toFixed(2)});
    tl.set("#g-punch", { opacity: 1 }, ${cues.lugar} + 0.1); arrive(tl, "#g-punch", ${cues.lugar} + 0.1);
    exitCurve(tl, "#g-kicker", ${dur - 0.3}); exitCurve(tl, "#g-chat", ${dur - 0.3}); exitCurve(tl, "#g-cred", ${dur - 0.3}); exitCurve(tl, "#g-punch", ${dur - 0.3});`;
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
      <div id="v-ep"><span class="w" id="v-e0">EP05</span><span class="w" id="v-e1">A pergunta de ouro</span></div>
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

  // ------------------------------------------------------------------ TELA 18 · DIVISÓRIA · MÓDULO 2
  tela18: ({ cues, dur }) => {
    const chips = ["Preditiva × generativa", "Dados confiáveis", "Dinâmica: quando o dado engana", "Revisão humana"];
    const inner = `
  <div class="stage" id="s18-stage">
    <div id="s18-net"></div>
    ${chrome(CRUMB, "18", true)}
    <div id="s18-num" aria-hidden="true" data-contrast-allow="decorative">02</div>
    <div id="s18-body">
      <div class="eyebrow light" id="s18-eye">Módulo 2 · <b>Fundamentos de dados e IA</b></div>
      <h1 id="s18-title"><span class="w" id="s18-t0">O que preciso entender para</span><span class="w" id="s18-t1"><em>usar e avaliar IA?</em></span></h1>
      <p id="s18-note">O gestor não precisa construir modelos. Precisa fazer as perguntas certas: <b>que tipo de IA, que dado, que risco e quem revisa.</b></p>
      <div id="s18-chips">${chips.map((a, i) => `<span class="chip" id="s18-a${i}">${a}</span>`).join("")}</div>
    </div>
  </div>`;
    const css = `
  #root { background: #FF5100; }
  #root #s18-net { position: absolute; inset: 0; background: url(assets/cover-bg.jpg) center / cover no-repeat; }
  #root #s18-eye { position: static; } #root .eyebrow.light { color: rgba(255,255,255,.85); } #root .eyebrow.light b { color: #fff; }
  #root #s18-num { position: absolute; right: 120px; top: 150px; font-size: 420px; font-weight: 900; letter-spacing: -0.06em; color: rgba(255,154,102,.6); line-height: 1; }
  #root #s18-body { position: absolute; left: 96px; top: 168px; width: 1300px; }
  #root #s18-title { margin-top: 110px; font-size: 100px; line-height: 1.02; font-weight: 900; letter-spacing: -0.045em; color: #fff; }
  #root #s18-title em { font-style: normal; color: #1A1A1A; }
  #root #s18-note { margin-top: 30px; width: 1150px; font-size: 28px; line-height: 1.45; color: rgba(255,255,255,.92); }
  #root #s18-note b { color: #fff; }
  #root #s18-chips { margin-top: 40px; display: flex; flex-wrap: wrap; gap: 12px; width: 1300px; }
  #root .chip { display: inline-block; background: rgba(255,255,255,.14); border: 2px solid rgba(255,255,255,.35); color: #fff; font-size: 24px; font-weight: 700; padding: 12px 22px; border-radius: 999px; }
  #root .chip.on { background: #1A1A1A; border-color: #1A1A1A; color: #FF9A66; }
  #root .w { display: inline-block; margin-right: .22em; }
`;
    const js = `
    hide("#s18-num, #s18-eye, .w, #s18-note, .chip");
    // chegada da divisória: zoom-through (push) vindo da vinheta
    enterPush(tl, "#s18-body", 0, 18);
    waterfall(tl, ["#s18-num"], 0.1, { y: 90, d: 0.25 });
    waterfall(tl, ["#s18-eye"], ${cues.title}, { y: 40 });
    waterfall(tl, ["#s18-t0", "#s18-t1"], ${cues.title} + 0.2, { y: 80, d: 0.2, gap: 0.1 });
    waterfall(tl, ["#s18-note"], ${cues.title} + 0.7, { y: 40 });
    // "que tipo, que dado, que risco, quem revisa": os quatro chips chegam em cascata; o de hoje acende
    waterfall(tl, [${chips.map((_, i) => `"#s18-a${i}"`).join(", ")}], ${cues.chips} + 0.2, { y: 40, d: 0.14, gap: 0.3 });
    tl.set("#s18-a0", { className: "chip on" }, ${cues.chips} + 1.8);
    exitCurve(tl, "#s18-stage", ${dur - 0.3});`;
    return root("tela18", dur, inner, css) + script("tela18", js);
  },

  // ------------------------------------------------------------------ TELA 19 · PREDITIVA × GENERATIVA (tabela)
  tela19: ({ cues, dur }) => {
    const rows = [
      ["Pergunta que responde", "O que vai acontecer? Em que categoria isto se encaixa?", "O que escrever, resumir ou interpretar?"],
      ["O que faz", "Prevê, classifica, detecta padrões e anomalias", "Produz, resume, extrai e explica conteúdo"],
      ["Exemplos", "Churn, demanda, fraude, triagem de chamados, risco de crédito", "Propostas, resumos de reunião, análise de contratos, atendimento"],
      ["Dado de entrada", "Estruturado e numérico, com histórico rotulado", "Texto, documentos, imagens e áudio"],
      ["Ponto forte", "Consistente, explicável e auditável", "Lida com linguagem e conteúdo não estruturado"],
      ["Limite", "Fica presa ao padrão histórico; precisa de dado rotulado", "Pode errar com confiança (alucinação); fraca em cálculo"],
    ];
    const inner = `
  <div class="stage" id="s19-stage">
    ${chrome(CRUMB, "19")}
    <div class="eyebrow" id="s19-eyebrow">Módulo 2 · Tipos de IA</div>
    <h2 class="title" id="s19-title">IA preditiva e IA generativa <em>resolvem problemas diferentes</em></h2>
    <div class="card" id="s19-tbl">
      <table>
        <tr><th></th><th id="s19-hp"><span><i></i>IA preditiva</span></th><th id="s19-hg"><span><i></i>IA generativa</span></th></tr>
        ${rows.map((r, i) => `<tr id="s19-r${i}"><td class="k1">${r[0]}</td><td class="v p" id="s19-p${i}">${r[1]}</td><td class="v g" id="s19-g${i}">${r[2]}</td></tr>`).join("")}
      </table>
    </div>
    <div class="card" id="s19-cro">
      <div class="k">Cadeira: CRO</div>
      <div class="q">Numa decisão regulada, <b>“erra com confiança”</b> é uma frase que deveria estar na <b>política de risco</b>.</div>
    </div>
    <div class="ask low" id="s19-ask"><span class="k">Pergunta</span><p>Na lista do Módulo 1, quais oportunidades são <em>preditivas</em> e quais são <em>generativas?</em></p></div>
    <div class="src">Fontes: Gartner — When Not to Use Generative AI; Augment Predictive and Prescriptive Analytics With GenAI and AI Agents.</div>
  </div>`;
    const css = `${CP_CSS}
  #root #s19-title { font-size: 54px; width: 1700px; }
  #root #s19-tbl { left: 96px; top: 300px; width: 1300px; padding: 16px 20px; transform-origin: 50% 100%; }
  #root #s19-tbl table { width: 100%; border-collapse: collapse; table-layout: fixed; }
  #root #s19-tbl th { text-align: left; width: 530px; padding: 8px 12px 12px; border-bottom: 2px solid #E6E6E6; }
  #root #s19-tbl th:first-child { width: 200px; }
  #root #s19-tbl th span { display: inline-flex; align-items: center; gap: 10px; font-size: 17px; letter-spacing: .1em; text-transform: uppercase; font-weight: 800; color: #6B6B6B; }
  #root #s19-tbl th span i { width: 10px; height: 10px; border-radius: 50%; background: #BDBDBD; }
  #root #s19-tbl th.on span { color: #C73E00; } #root #s19-tbl th.on span i { background: #FF5100; }
  #root #s19-tbl td { font-size: 18px; line-height: 1.3; color: #1A1A1A; padding: 9px 12px; vertical-align: top; border-bottom: 1px solid #EDEDED; }
  #root #s19-tbl td.k1 { font-size: 15px; letter-spacing: .08em; text-transform: uppercase; font-weight: 800; color: #6B6B6B; padding-top: 11px; }
  #root #s19-tbl tr.on td { background: #FFEEE6; } #root #s19-tbl tr.on td.k1 { color: #C73E00; }
  #root #s19-tbl td.v.on { font-weight: 800; color: #C73E00; }
  #root #s19-cro { left: 1420px; top: 300px; width: 404px; padding: 22px 24px; border-left: 10px solid #FF5100; transform-origin: 0% 50%; }
  #root #s19-cro .k { font-size: 14px; letter-spacing: .14em; text-transform: uppercase; font-weight: 800; color: #6B6B6B; margin-bottom: 12px; }
  #root #s19-cro .q { font-size: 24px; line-height: 1.3; color: #1A1A1A; } #root #s19-cro .q b { color: #C73E00; font-weight: 900; }
`;
    const js = `
    hide("#s19-tbl, td.v, #s19-cro, #s19-ask");
    enterCurve(tl, "#s19-stage", 0);
    waterfall(tl, ["#s19-tbl"], ${cues.intro} + 0.3, { y: 60, d: 0.22 });
    // preditiva: coluna da esquerda, linha a linha
    tl.set("#s19-hp", { className: "on" }, ${cues.pred1});
    waterfall(tl, ["#s19-p0", "#s19-p1", "#s19-p2"], ${cues.pred1} + 0.1, { y: 16, d: 0.14, gap: 0.3 });
    waterfall(tl, ["#s19-p3", "#s19-p4"], ${cues.pred2} + 0.1, { y: 16, d: 0.14, gap: 0.3 });
    press(tl, "#s19-hp", ${cues.pred3});
    // generativa: coluna da direita
    tl.set("#s19-hp", { className: "" }, ${cues.gen1}); tl.set("#s19-hg", { className: "on" }, ${cues.gen1});
    waterfall(tl, ["#s19-g0", "#s19-g1", "#s19-g2"], ${cues.gen1} + 0.1, { y: 16, d: 0.14, gap: 0.3 });
    waterfall(tl, ["#s19-g3", "#s19-g4"], ${cues.gen2} + 0.1, { y: 16, d: 0.14, gap: 0.3 });
    // "a linha que importa é a última": a linha Limite acende; cada célula chega com a frase
    tl.set("#s19-hg", { className: "" }, ${cues.limite});
    tl.set("#s19-r5", { className: "on" }, ${cues.limite} + 0.2);
    waterfall(tl, ["#s19-p5"], ${cues.lim1}, { y: 16, d: 0.16 }); tl.set("#s19-p5", { className: "v p on" }, ${cues.lim1} + 0.2);
    waterfall(tl, ["#s19-g5"], ${cues.lim2}, { y: 16, d: 0.16 }); tl.set("#s19-g5", { className: "v g on" }, ${cues.lim2} + 0.2);
    // cadeira do CRO: cartão lateral; a pergunta fecha a tela
    tl.set("#s19-cro", { opacity: 1 }, ${cues.cro} + 0.1); arrive(tl, "#s19-cro", ${cues.cro} + 0.1);
    waterfall(tl, ["#s19-ask"], ${cues.cro} + 3.2, { y: 60, d: 0.2 });
    exitCurve(tl, "#s19-stage", ${dur - 0.3});`;
    return root("tela19", dur, inner, css) + script("tela19", js);
  },

  // ------------------------------------------------------------------ TELA 20 · TRÊS PERGUNTAS
  tela20: ({ cues, dur }) => {
    const qs = [
      ["Que dado eu tenho?", "Estruturado e numérico.", "Texto, documento ou imagem."],
      ["Quanta precisão a decisão exige?", "Exata e auditável.", "“Boa o suficiente” para alguém revisar."],
      ["Qual o custo de errar?", "Alto: preditiva com revisão humana.", "Baixo, de apoio."],
    ];
    const inner = `
  <div class="stage" id="s20-stage">
    ${chrome(CRUMB, "20")}
    <div class="eyebrow" id="s20-eyebrow">Módulo 2 · Como escolher</div>
    <h2 class="title" id="s20-title">Três perguntas para <em>escolher a técnica, ou combinar</em></h2>
    ${qs.map((q, i) => `
    <div class="card cp" id="s20-c${i + 1}" style="left:${96 + i * 442}px">
      <div class="dot">${i + 1}</div>
      <h4 id="s20-h${i + 1}">${q[0]}</h4>
      <div class="irow" id="s20-p${i + 1}"><span><i></i>Preditiva</span><span>${q[1]}</span></div>
      <div class="irow" id="s20-g${i + 1}"><span><i></i>Generativa</span><span>${q[2]}</span></div>
    </div>`).join("")}
    <div class="side">
      <div class="verd" id="s20-v1"><div class="k">Numérico, exato e caro</div><div class="v">preditiva</div></div>
      <div class="verd" id="s20-v2"><div class="k">Texto, “bom o suficiente”, barato de corrigir</div><div class="v">generativa</div></div>
      <div class="verd ink" id="s20-v3"><div class="k">Regra bem escrita, ou dado que não existe</div><div class="v">nenhuma IA</div></div>
    </div>
    <div class="band low" id="s20-band">E às vezes a resposta é <em>nenhuma IA</em>: regra simples ou dado insuficiente.</div>
    <div class="ask low" id="s20-ask"><span class="k">Pergunta</span><p>Escolham uma oportunidade da lista de vocês e <em>respondam as três perguntas.</em></p></div>
    <div class="src">Fontes: Gartner — Choose the Right AI Technique for Your Finance Use Case; CIO Leadership Mistakes: Fixating on GenAI.</div>
  </div>`;
    const css = `${CP_CSS}
  #root #s20-title { font-size: 54px; width: 1700px; }
  #root #s20-band { transform-origin: 0% 50%; }
`;
    const js = `
    hide(".card.cp, .irow, .verd, #s20-band, #s20-ask");
    enterCurve(tl, "#s20-stage", 0);
    waterfall(tl, ["#s20-c1", "#s20-c2", "#s20-c3"], ${cues.intro} + 0.3, { y: 70, d: 0.2, gap: 0.12 });
    // "que dado, quanta precisão, qual o custo": as três perguntas acendem em sequência
    ${[1, 2, 3].map((i) => `tl.set("#s20-h${i}", { className: "on" }, ${cues.q123} + ${((i - 1) * 1.1).toFixed(1)});${i > 1 ? ` tl.set("#s20-h${i - 1}", { className: "" }, ${cues.q123} + ${((i - 1) * 1.1).toFixed(1)});` : ""}`).join("\n    ")}
    tl.set("#s20-h3", { className: "" }, ${cues.pred});
    // preditiva: as três linhas e o veredito; depois a generativa
    waterfall(tl, ["#s20-p1", "#s20-p2", "#s20-p3"], ${cues.pred}, { y: 20, d: 0.16, gap: 0.25 });
    ${[1, 2, 3].map((i) => `tl.set("#s20-p${i}", { className: "irow on" }, ${cues.pred} + ${(0.3 + (i - 1) * 0.25).toFixed(2)});`).join(" ")}
    tl.set("#s20-v1", { opacity: 1 }, ${cues.pred} + 1.2); arrive(tl, "#s20-v1", ${cues.pred} + 1.2);
    ${[1, 2, 3].map((i) => `tl.set("#s20-p${i}", { className: "irow" }, ${cues.gen});`).join(" ")}
    waterfall(tl, ["#s20-g1", "#s20-g2", "#s20-g3"], ${cues.gen}, { y: 20, d: 0.16, gap: 0.25 });
    ${[1, 2, 3].map((i) => `tl.set("#s20-g${i}", { className: "irow on" }, ${cues.gen} + ${(0.3 + (i - 1) * 0.25).toFixed(2)});`).join(" ")}
    tl.set("#s20-v2", { opacity: 1 }, ${cues.gen} + 1.4); arrive(tl, "#s20-v2", ${cues.gen} + 1.4);
    // "nenhuma IA": a faixa chega e o terceiro veredito acende
    ${[1, 2, 3].map((i) => `tl.set("#s20-g${i}", { className: "irow" }, ${cues.nenhuma});`).join(" ")}
    tl.set("#s20-band", { opacity: 1 }, ${cues.nenhuma} + 0.1); arrive(tl, "#s20-band", ${cues.nenhuma} + 0.1, 14);
    tl.set("#s20-v3", { opacity: 1 }, ${cues.nenhuma} + 0.6); arrive(tl, "#s20-v3", ${cues.nenhuma} + 0.6);
    press(tl, "#s20-band", ${cues.regra});
    waterfall(tl, ["#s20-ask"], ${cues.regra} + 1.6, { y: 60, d: 0.2 });
    exitCurve(tl, "#s20-stage", ${dur - 0.3});`;
    return root("tela20", dur, inner, css) + script("tela20", js);
  },

  // ------------------------------------------------------------------ TELA 21 · IA COMPOSTA
  tela21: ({ cues, dur }) => {
    const inner = `
  <div class="stage" id="s21-stage">
    ${chrome(CRUMB, "21")}
    <div class="eyebrow" id="s21-eyebrow">Módulo 2 · IA composta</div>
    <h2 class="title" id="s21-title">IA composta: <em>as duas juntas</em></h2>
    <p class="sub" id="s21-sub">Exemplo: um pagamento a fornecedor foge do padrão. Cada técnica faz a parte em que é melhor.</p>
    <div class="card cp flow" id="s21-c1" style="left:96px"><span class="badge"><i></i>Preditiva</span><h4 id="s21-h1">Detectar</h4><p>Pagamento a fornecedor foge do padrão histórico.</p></div>
    <div class="arr" id="s21-a1" style="left:505px">→</div>
    <div class="card cp flow pale" id="s21-c2" style="left:538px"><span class="badge"><i></i>Generativa</span><h4 id="s21-h2">Interpretar</h4><p>Lê contrato e e-mails: fraude, disputa ou mudança de processo?</p></div>
    <div class="arr" id="s21-a2" style="left:947px">→</div>
    <div class="card cp flow ink" id="s21-c3" style="left:980px"><span class="badge ink"><i></i>Pessoa + IA</span><h4 id="s21-h3">Decidir</h4><p>O analista decide com o número e o contexto na mão.</p></div>
    <div class="chips" id="s21-chips"><span class="lab">Vocês já operam assim em</span><span class="chip" id="s21-k0">PLD</span><span class="chip" id="s21-k1">sinistro</span><span class="chip" id="s21-k2">chargeback</span></div>
    <div class="band low" id="s21-band">A novidade é a camada que <em>lê o contexto</em>. Não a que decide.</div>
    <div class="src">Fontes: Gartner — Choose the Right AI Technique for Your Finance Use Case; CIO Leadership Mistakes: Fixating on GenAI.</div>
  </div>`;
    const css = `${CP_CSS}
  #root #s21-sub { top: 300px; width: 1300px; font-size: 25px; }
  #root .card.cp.flow { top: 376px; height: 300px; }
  #root .card.cp.flow h4 { font-size: 40px; min-height: 0; letter-spacing: -0.03em; margin-top: 18px; }
  #root .card.cp.flow h4.on { color: #FF5100; }
  #root .card.cp.flow p { font-size: 21px; margin-top: 12px; }
  #root .card.cp.flow.pale { background: #FFEEE6; }
  #root .card.cp.flow.ink { background: #1A1A1A; color: #fff; } #root .card.cp.flow.ink p { color: rgba(255,255,255,.85); } #root .card.cp.flow.ink h4.on { color: #FF9A66; }
  #root .arr { position: absolute; top: 500px; width: 44px; height: 44px; border-radius: 50%; background: #1A1A1A; color: #fff; display: grid; place-items: center; font-size: 26px; font-weight: 900; z-index: 3; }
  #root #s21-chips { position: absolute; left: 96px; top: 716px; display: flex; align-items: center; gap: 12px; }
  #root #s21-chips .lab { font-size: 22px; color: #4A4A4A; margin-right: 8px; }
  #root #s21-chips .chip { background: #1A1A1A; color: #FF9A66; font-size: 24px; font-weight: 800; padding: 10px 20px; border-radius: 999px; }
  #root #s21-band { top: 800px; width: 1290px; transform-origin: 0% 50%; }
`;
    const js = `
    hide("#s21-sub, .card.cp, .arr, #s21-chips .lab, .chip, #s21-band");
    enterCurve(tl, "#s21-stage", 0);
    press(tl, "#s21-title", ${cues.intro} + 0.2);
    // o exemplo chega com o primeiro cartão; cada técnica entra quando é dita, seguindo as setas
    waterfall(tl, ["#s21-sub"], ${cues.pag}, { y: 30 });
    waterfall(tl, ["#s21-c1"], ${cues.pag} + 0.4, { y: 70, d: 0.2 });
    tl.set("#s21-h1", { className: "on" }, ${cues.detecta}); press(tl, "#s21-h1", ${cues.detecta});
    waterfall(tl, ["#s21-a1"], ${cues.detecta} + 0.5, { y: 0, d: 0.1 });
    tl.set("#s21-c2", { opacity: 1 }, ${cues.le}); enterCurve(tl, "#s21-c2", ${cues.le});
    tl.set("#s21-h2", { className: "on" }, ${cues.le} + 0.4);
    waterfall(tl, ["#s21-a2"], ${cues.decide} - 0.4, { y: 0, d: 0.1 });
    tl.set("#s21-c3", { opacity: 1 }, ${cues.decide}); enterCurve(tl, "#s21-c3", ${cues.decide});
    tl.set("#s21-h3", { className: "on" }, ${cues.decide} + 0.4);
    waterfall(tl, ["#s21-chips .lab", "#s21-k0", "#s21-k1", "#s21-k2"], ${cues.opera} + 0.3, { y: 24, d: 0.16, gap: 0.45 });
    tl.set("#s21-band", { opacity: 1 }, ${cues.novidade} + 0.1); arrive(tl, "#s21-band", ${cues.novidade} + 0.1, 14);
    tl.set("#s21-h1", { className: "" }, ${cues.novidade}); tl.set("#s21-h3", { className: "" }, ${cues.novidade});
    exitCurve(tl, "#s21-stage", ${dur - 0.3});`;
    return root("tela21", dur, inner, css) + script("tela21", js);
  },

  // ------------------------------------------------------------------ TELA 22 · QUANDO NÃO USAR IA GENERATIVA
  tela22: ({ cues, dur }) => {
    const rows = [
      ["Previsão numérica", "Previsão numérica e planejamento (receita, demanda, capacidade)", "Modelo preditivo: modelos de linguagem não foram feitos para precisão numérica"],
      ["Decisão crítica", "Decisão crítica como ferramenta principal (fraude, crédito, alerta de segurança)", "Preditiva decide; a generativa explica e comunica"],
      ["Modelo que funciona", "Substituir um modelo preditivo que já funciona", "Mantenha o modelo; use GenAI para resumir e comunicar o resultado"],
      ["Regras fixas", "Regras determinísticas (aplicar a mesma política para todos)", "Motor de regras ou automação simples"],
      ["Dado sensível", "Dado sensível fora de um ambiente aprovado", "Só ferramentas autorizadas, com governança e controle de acesso"],
    ];
    const inner = `
  <div class="stage" id="s22-stage">
    ${chrome(CRUMB, "22")}
    <div class="eyebrow" id="s22-eyebrow">Módulo 2 · Limites</div>
    <h2 class="title" id="s22-title">Quando <em>não usar</em> IA generativa</h2>
    <div id="s22-rows">
      ${rows.map((r, i) => `<div class="fx" id="s22-r${i + 1}"><div class="lab">${r[0]}</div><div class="no"><i>✕</i><span><b>Não use GenAI:</b> ${r[1]}</span></div><div class="ok" id="s22-ok${i + 1}"><i>✓</i><span><b>Use:</b> ${r[2]}</span></div></div>`).join("")}
    </div>
    <div class="card" id="s22-side"><div class="k">Cinco situações</div><div class="big" id="s22-n">5</div><div class="t">em que a IA generativa é a <b>ferramenta errada</b>.</div></div>
    <div class="card" id="s22-quote">
      <div class="q" id="s22-q1">Uma fintech decidiu <b>“modernizar”</b> o motor de decisão de crédito com IA generativa.</div>
      <div class="l" id="s22-l1">O modelo antigo: <b>dez anos</b> e <b>KS estável</b>.</div>
      <div class="l" id="s22-l2">O novo: explicava lindamente cada recusa.</div>
      <div class="l big" id="s22-l3">E aprovava errado em <b>1 a cada 12</b> casos.</div>
      <div class="l" id="s22-l4">Voltaram ao antigo em <b>seis semanas</b>. A generativa ficou só para a <b>carta ao cliente</b>.</div>
    </div>
    <div class="dark-panel" id="s22-dark">
      <div class="k">Pergunta de ouro</div>
      <div class="big" id="s22-big">Preditiva, regras ou nenhuma IA <em>resolveriam melhor?</em></div>
      <div class="l" id="s22-pronto">Se ninguém souber responder, o projeto <b>ainda não está pronto</b> para ser aprovado.</div>
    </div>
    <div class="src">Fontes: Gartner — When Not to Use Generative AI; CIO Leadership Mistakes: Fixating on GenAI and Agentic AI.</div>
  </div>`;
    const css = `
  #root #s22-rows { position: absolute; left: 96px; top: 300px; width: 1300px; display: flex; flex-direction: column; gap: 8px; }
  #root .fx { display: grid; grid-template-columns: 200px 1fr 1fr; gap: 14px; align-items: start; background: #fff; border-radius: 14px; padding: 12px 16px; box-shadow: 0 1px 2px rgba(26,26,26,.04), 0 14px 40px -24px rgba(26,26,26,.18); }
  #root .fx .lab { font-size: 19px; font-weight: 900; letter-spacing: -0.01em; color: #1A1A1A; padding-top: 2px; }
  #root .fx .no, #root .fx .ok { display: flex; gap: 10px; align-items: flex-start; font-size: 16px; line-height: 1.3; color: #1A1A1A; }
  #root .fx i { flex: none; font-style: normal; font-weight: 900; width: 24px; height: 24px; border-radius: 50%; display: grid; place-items: center; font-size: 14px; }
  #root .fx .no i { background: #FFE4E0; color: #C73E00; } #root .fx .ok i { background: #E3F4EA; color: #1B7A3E; }
  #root .fx .no b { color: #C73E00; } #root .fx .ok b { color: #1B7A3E; }
  #root .fx .ok.on { background: #E3F4EA; border-radius: 8px; padding: 4px 8px; margin: -4px -8px; }
  #root #s22-side { left: 1420px; top: 300px; width: 404px; padding: 22px 24px; transform-origin: 0% 50%; }
  #root #s22-side .k { font-size: 14px; letter-spacing: .14em; text-transform: uppercase; font-weight: 800; color: #6B6B6B; }
  #root #s22-side .big { font-size: 150px; font-weight: 900; letter-spacing: -0.06em; line-height: .9; color: #FF5100; margin-top: 8px; }
  #root #s22-side .t { font-size: 24px; line-height: 1.3; color: #1A1A1A; margin-top: 10px; } #root #s22-side .t b { color: #C73E00; font-weight: 900; }
  #root #s22-quote { left: 96px; top: 300px; width: 1300px; height: 480px; padding: 36px 44px; border-left: 12px solid #FF5100; transform-origin: 0% 50%; }
  #root #s22-quote .q { font-size: 38px; font-weight: 700; letter-spacing: -0.03em; line-height: 1.15; } #root #s22-quote .q b { color: #FF5100; font-weight: 900; }
  #root #s22-quote .l { font-size: 30px; font-weight: 700; margin-top: 18px; color: #1A1A1A; } #root #s22-quote .l b { color: #C73E00; font-weight: 900; }
  #root #s22-quote .l.big { font-size: 48px; letter-spacing: -0.03em; line-height: 1.1; margin-top: 24px; }
  #root #s22-dark { position: absolute; left: 96px; top: 300px; width: 1300px; height: 480px; padding: 40px 48px; background: #1A1A1A; color: #fff; border-radius: 18px; transform-origin: 0% 50%; }
  #root #s22-dark .k { font-size: 20px; letter-spacing: .14em; text-transform: uppercase; font-weight: 900; color: #FF9A66; }
  #root #s22-dark .big { font-size: 72px; font-weight: 900; letter-spacing: -0.045em; line-height: 1.02; margin-top: 22px; transform-origin: 0% 50%; } #root #s22-dark .big em { font-style: normal; color: #FF9A66; }
  #root #s22-dark .l { font-size: 30px; line-height: 1.3; color: rgba(255,255,255,.85); margin-top: 30px; } #root #s22-dark .l b { color: #fff; font-weight: 900; }
`;
    const js = `
    hide(".fx, #s22-side, #s22-quote, #s22-quote .q, #s22-quote .l, #s22-dark, #s22-big, #s22-pronto");
    enterCurve(tl, "#s22-stage", 0);
    press(tl, "#s22-title", ${cues.intro} + 0.2);
    tl.set("#s22-side", { opacity: 1 }, ${cues.cinco} + 0.1); arrive(tl, "#s22-side", ${cues.cinco} + 0.1);
    countUp(tl, "#s22-n", 5, ${cues.cinco} + 0.3, { dur: 0.7 });
    // uma linha por vez
    ${[1, 2, 3, 4, 5].map((i) => `waterfall(tl, ["#s22-r${i}"], ${cues["r" + i]}, { y: 40, d: 0.2 });`).join(" ")}
    // "use a generativa para explicar ao comitê": a coluna Use da linha 3 acende
    tl.set("#s22-ok3", { className: "ok on" }, ${cues.r3b}); press(tl, "#s22-ok3", ${cues.r3b});
    // parábola da fintech: as linhas recuam, o cartão da história chega
    tl.to("#s22-rows", { scale: 0.85, opacity: 0, filter: "blur(10px)", duration: 0.25, ease: "power3.in" }, ${cues.parabola});
    tl.set("#s22-quote", { opacity: 1 }, ${cues.parabola} + 0.2); arrive(tl, "#s22-quote", ${cues.parabola} + 0.2);
    waterfall(tl, ["#s22-q1"], ${cues.parabola} + 0.5, { y: 40 });
    waterfall(tl, ["#s22-l1"], ${cues.antigo}, { y: 40 });
    waterfall(tl, ["#s22-l2"], ${cues.novo}, { y: 40 });
    waterfall(tl, ["#s22-l3"], ${cues.errado}, { y: 50, d: 0.22 });
    waterfall(tl, ["#s22-l4"], ${cues.voltaram}, { y: 40 });
    // pergunta de ouro: painel escuro no lugar da história
    tl.to("#s22-quote", { scale: 0.8, opacity: 0, filter: "blur(10px)", duration: 0.25, ease: "power3.in" }, ${cues.ouro} - 0.05);
    tl.set("#s22-dark", { opacity: 1 }, ${cues.ouro} + 0.2); arrive(tl, "#s22-dark", ${cues.ouro} + 0.2);
    tl.set("#s22-big", { opacity: 1 }, ${cues.pergunta}); arrive(tl, "#s22-big", ${cues.pergunta}, 18);
    waterfall(tl, ["#s22-pronto"], ${cues.pronto}, { y: 40 });
    exitCurve(tl, "#s22-stage", ${dur - 0.3});`;
    return root("tela22", dur, inner, css) + script("tela22", js);
  },

  // ------------------------------------------------------------------ DECISÃO PARA LEVAR (tela cheia: gráficos em x>=1210)
  decisao: ({ cues, dur, beats }) => {
    const taskEnd = beats.find((b) => b.id === "d01")?.end ?? cues.task + 6;
    const inner = `
  <div class="stage" id="d-stage">
    <div class="card" id="d-card">
      <div class="kick" id="d-kick"><b>Tarefa</b> Próxima reunião de status</div>
      <div class="t" id="d-t">Pegue um projeto de IA generativa <b>em andamento</b> na sua área e faça a <b>pergunta de ouro</b>.</div>
      <div class="q" id="d-q">Preditiva, regras ou nenhuma IA resolveriam melhor?</div>
    </div>
    <div class="card" id="d-two">
      <div class="kick"><b>Resposta</b> O que ela te diz</div>
      <div class="pair"><span class="opt" id="d-o1">projeto</span><span class="ou" id="d-ou">ou</span><span class="opt" id="d-o2">experimento</span></div>
      <div class="lab" id="d-orc">Os dois são válidos. <b>Só não têm o mesmo orçamento.</b></div>
    </div>
    <div id="d-next">
      <div class="lab" id="d-nl">Próximo episódio · o mais importante da série</div>
      <div class="ttl" id="d-nt"><b>EP06</b> O painel perfeito que estava errado</div>
      <div class="line" id="d-painel">Um painel de retenção que <b>parece perfeito</b>.</div>
      <div class="embed" id="d-punch2">Decidir <em>certo</em><br>com o dado <em>errado</em>.</div>
    </div>
  </div>`;
    const css = `
  #root { background: transparent; }
  #root #d-card, #root #d-two { left: 1210px; top: 120px; width: 650px; padding: 30px 34px; transform-origin: 50% 100%; }
  #root .kick { font-size: 18px; letter-spacing: .12em; text-transform: uppercase; color: #6B6B6B; font-weight: 800; margin-bottom: 22px; }
  #root .kick b { background: #C73E00; color: #fff; padding: 6px 12px; border-radius: 6px; margin-right: 12px; letter-spacing: 0; }
  #root #d-card .t { font-size: 32px; font-weight: 700; line-height: 1.22; letter-spacing: -0.02em; color: #1A1A1A; } #root #d-card .t b { color: #C73E00; font-weight: 900; }
  #root #d-card .q { margin-top: 24px; background: #1A1A1A; color: #FF9A66; border-radius: 14px; padding: 18px 22px; font-size: 30px; font-weight: 900; letter-spacing: -0.03em; line-height: 1.15; transform-origin: 0% 50%; }
  #root .pair { display: flex; align-items: center; gap: 18px; }
  #root .opt { font-size: 44px; font-weight: 900; letter-spacing: -0.04em; color: #1A1A1A; background: #FFEEE6; border-radius: 14px; padding: 10px 20px; }
  #root .ou { font-size: 26px; color: #6B6B6B; font-weight: 700; }
  #root #d-two .lab { font-size: 26px; color: #4A4A4A; line-height: 1.3; margin-top: 24px; } #root #d-two .lab b { color: #C73E00; font-weight: 900; }
  #root #d-next { position: absolute; left: 1210px; top: 200px; width: 650px; }
  #root #d-next .lab { font-size: 22px; letter-spacing: .14em; text-transform: uppercase; color: rgba(255,255,255,.7); font-weight: 800; margin: 0; }
  #root #d-next .ttl { font-size: 54px; font-weight: 900; color: #fff; letter-spacing: -0.04em; line-height: 1.05; margin-top: 16px; } #root #d-next .ttl b { color: #FF5100; margin-right: 14px; }
  #root #d-next .line { margin-top: 28px; font-size: 30px; color: rgba(255,255,255,.9); line-height: 1.3; } #root #d-next .line b { color: #FF9A66; font-weight: 900; }
  #root #d-punch2 { position: static; margin-top: 40px; font-size: 72px; color: #fff; transform-origin: 0% 50%; } #root #d-punch2 em { font-style: normal; color: #FF5100; }
`;
    const js = `
    hide("#d-card, #d-kick, #d-t, #d-q, #d-two, #d-o1, #d-ou, #d-o2, #d-orc, #d-nl, #d-nt, #d-painel, #d-punch2");
    tl.set("#d-card", { opacity: 1 }, ${cues.task});
    waterfall(tl, ["#d-card", "#d-kick", "#d-t"], ${cues.task}, { y: 80, d: 0.22, gap: 0.1 });
    tl.set("#d-q", { opacity: 1 }, ${(taskEnd - 2.2).toFixed(2)}); arrive(tl, "#d-q", ${(taskEnd - 2.2).toFixed(2)}, 14);
    exitCurve(tl, "#d-card", ${cues.resposta});
    tl.set("#d-two", { opacity: 1 }, ${cues.resposta} + 0.15); enterCurve(tl, "#d-two", ${cues.resposta} + 0.15);
    waterfall(tl, ["#d-o1", "#d-ou", "#d-o2"], ${cues.resposta} + 1.2, { y: 40, d: 0.2, gap: 0.4 });
    waterfall(tl, ["#d-orc"], ${cues.orcamento} + 0.2, { y: 40, d: 0.2 });
    tl.to("#d-two", { y: -230, duration: 0.3, ease: "power4.in" }, ${cues.next} - 0.2);
    tl.to("#d-two", { opacity: 0, duration: 0.18, ease: "none" }, ${cues.next} - 0.2);
    waterfall(tl, ["#d-nl", "#d-nt"], ${cues.next} + 0.1, { y: 70, d: 0.2, gap: 0.09 });
    waterfall(tl, ["#d-painel"], ${cues.painel}, { y: 40 });
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
const AG = "Augment Predictive and Prescriptive Analytics With Generative AI and AI Agents";
const FIGS = {
  tela21a: { num: "21A", eyebrow: "Módulo 2 · IA composta · <b>Gartner</b>", title: "Preditiva, prescritiva e generativa: <em>depende do caso e da maturidade</em>", img: "fig-21a.webp", iw: 1272, ih: 781,
    desc: "Seis cenários que combinam IA preditiva, prescritiva e generativa, com exemplos.",
    insights: ["Preditiva prevê, prescritiva recomenda, generativa cria e explica.", "<b>Cenário 5:</b> dados sintéticos para detectar fraude em bancos, como no nosso Case 1.", "A escolha depende do caso e da maturidade da empresa."],
    key: "Não é uma ou outra: as técnicas se combinam.", src: AG, zooms: { cinco: [0.38, 0.6, 0.6, 0.13], case: "fig" } },
  tela21b: { num: "21B", eyebrow: "Módulo 2 · IA composta · <b>Gartner</b>", title: "Técnicas preditivas e prescritivas <em>ampliadas pela IA generativa</em>", img: "fig-21b.webp", iw: 1274, ih: 991,
    desc: "Como técnicas preditivas e prescritivas ganham força com a IA generativa.",
    insights: ["<b>Preditiva:</b> probabilidades, previsões e simulações.", "<b>Prescritiva:</b> regras e otimização.", "A IA generativa acrescenta cenários, simulação de estratégias e avaliação dinâmica."],
    key: "Resultado: decisões mais rápidas e adaptáveis.", src: AG, zooms: { pred: [0.02, 0.12, 0.54, 0.6], gen: [0.58, 0.12, 0.4, 0.62], resultado: "fig" } },
};
for (const [id, cfg] of Object.entries(FIGS)) {
  const base = figScene(id, cfg);
  SCENES_EP05[id] = (ctx) => {
    const { inner, css, js } = base(ctx);
    // títulos longos das duas figuras: uma linha só, sem invadir o cartão da figura
    return root(id, ctx.dur, inner, css + `\n  #root .title { font-size: 44px; width: 1720px; }\n`) + script(id, js);
  };
}

export const SCENES = SCENES_EP05;
