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



// ===================================================================================== EP08
// Formato final (2026-11-03): sem janela do narrador e sem legendas. O tools/build.mjs injeta o fundo escuro
// das cenas de tela cheia e a foto no gancho, na vinheta e no cartão final.
const SCENES_EP08 = {};

const CRUMB = "Módulo 4 · Cases";
const SRC_PIX =
  "Cliente anonimizado por confidencialidade. Fonte: deck de cases da South (ago/2026) e playbook interno do acelerador de streaming.";
const E8_CSS = `
  #root .title { font-size: 56px; width: 1720px; }
  #root .src { width: 1500px; }
  #root .xchips { position: absolute; left: 96px; top: 300px; width: 1728px; display: flex; flex-wrap: wrap; gap: 12px; }
  #root .xchip { display: inline-flex; align-items: center; gap: 12px; background: #fff; border-radius: 999px; padding: 12px 22px; font-size: 22px; font-weight: 700; color: #1A1A1A; box-shadow: 0 1px 2px rgba(26,26,26,.04), 0 14px 40px -24px rgba(26,26,26,.18); }
  #root .xchip i { width: 12px; height: 12px; border-radius: 50%; background: #1B7A3E; flex: none; }
  #root .xchip.on { outline: 3px solid #FF5100; }
  #root .steps { position: absolute; left: 96px; top: 300px; width: 1728px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
  #root .step { position: relative; background: #fff; border-radius: 18px; padding: 26px 28px; min-height: 340px; box-shadow: 0 1px 2px rgba(26,26,26,.04), 0 14px 40px -24px rgba(26,26,26,.18); transform-origin: 50% 100%; }
  #root .step .no { font-size: 56px; font-weight: 900; letter-spacing: -0.04em; color: #E04600; line-height: 1; }
  #root .step h4 { font-size: 32px; font-weight: 800; margin-top: 14px; letter-spacing: -0.02em; color: #1A1A1A; }
  #root .step p { font-size: 22px; line-height: 1.4; color: #4A4A4A; margin-top: 12px; }
  #root .step p b { color: #1A1A1A; font-weight: 800; }
  #root .step.on { outline: 3px solid #FF5100; }
  #root .band.wide { top: 690px; width: 1728px; font-size: 32px; transform-origin: 0% 50%; }
  #root .band b { color: #FF9A66; font-weight: 900; }
  #root .band .hl { border-radius: 8px; padding: 0 6px; }
  #root .band .hl.on { color: #fff; background: #C73E00; }
  #root .trio { position: absolute; left: 96px; top: 300px; width: 1728px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px; }
  #root .trio .card { position: relative; padding: 28px 30px; transform-origin: 50% 100%; }
  #root .trio .card h4 { font-size: 32px; }
  #root .trio .card p { font-size: 23px; }
  #root .trio .card.on { outline: 3px solid #FF5100; }
  #root .k { font-size: 16px; letter-spacing: .14em; text-transform: uppercase; font-weight: 800; color: #6B6B6B; }
  #root .ask.e8 { width: 1728px; }
  #root .ask.e8 p { margin: 0; }
  #root .lens { position: absolute; background: #FFEEE6; border-radius: 18px; padding: 22px 28px; font-size: 23px; line-height: 1.4; color: #1A1A1A; border-left: 8px solid #FF5100; }
  #root .lens .k { color: #C73E00; margin-bottom: 8px; }
  #root .lens b.on { background: #C73E00; color: #fff; border-radius: 6px; padding: 0 6px; }
`;

Object.assign(SCENES_EP08, {
  // ------------------------------------------------------------------ GANCHO FRIO (tela cheia: gráficos em x>=1210, foto à esquerda pelo build)
  gancho: ({ cues, dur }) => {
    const inner = `
  <div class="stage" id="g-stage">
    <div id="g-kicker"><b>EP08</b> Três projetos reais</div>
    <div class="card gpix" id="g-p1"><div class="k">Pix 1</div><div class="v">R$ 0,09</div><span class="tag" id="g-t1">Pix comum</span></div>
    <div class="card gpix" id="g-p2"><div class="k">Pix 2 · um minuto depois</div><div class="v">R$ 510</div><span class="tag" id="g-t2">Pix comum</span></div>
    <div id="g-link"><b>Juntos:</b> o teste de conta antes do golpe</div>
    <div class="card ink" id="g-sec"><div class="n">&lt; 1 s</div><div class="l">para a prevenção enxergar a relação</div></div>
  </div>`;
    const css = `
  #root { background: transparent; }
  #root #g-kicker { position: absolute; left: 1210px; top: 64px; font-size: 22px; color: rgba(255,255,255,.8); letter-spacing: .06em; text-transform: uppercase; font-weight: 600; }
  #root #g-kicker b { color: #fff; background: #FF5100; padding: 6px 12px; border-radius: 6px; margin-right: 14px; font-weight: 900; }
  #root .gpix { left: 1210px; width: 650px; padding: 22px 30px; transform-origin: 0% 50%; }
  #root #g-p1 { top: 140px; } #root #g-p2 { top: 330px; }
  #root .gpix .v { font-size: 92px; font-weight: 900; letter-spacing: -0.05em; line-height: 1; color: #1A1A1A; margin-top: 8px; }
  #root .gpix .tag { position: absolute; right: 26px; top: 22px; background: #EDEDED; color: #4A4A4A; font-size: 19px; font-weight: 800; padding: 6px 14px; border-radius: 999px; }
  #root .gpix.on { outline: 4px solid #FF5100; }
  #root #g-link { position: absolute; left: 1210px; top: 528px; width: 650px; background: #C73E00; color: #fff; font-size: 30px; font-weight: 700; padding: 18px 26px; border-radius: 14px; transform-origin: 0% 50%; }
  #root #g-link b { font-weight: 900; }
  #root #g-sec { left: 1210px; top: 650px; width: 650px; padding: 26px 30px; background: #1A1A1A; border: 2px solid rgba(255,255,255,.14); }
  #root #g-sec .n { font-size: 110px; font-weight: 900; letter-spacing: -0.05em; line-height: .95; color: #FF9A66; }
  #root #g-sec .l { font-size: 30px; color: #fff; font-weight: 700; margin-top: 10px; }
`;
    const js = `
    hide("#g-kicker, #g-p1, #g-p2, .gpix .tag, #g-link, #g-sec");
    tl.set("#g-kicker", { opacity: 1 }, 0.2);
    tl.fromTo("#g-kicker", { x: 60 }, { x: 0, duration: 0.5, ease: "power4.out", immediateRender: false }, 0.2);
    waterfall(tl, ["#g-p1"], ${cues.open}, { y: 60, d: 0.2 });
    waterfall(tl, ["#g-p2"], ${cues.r510} + 0.2, { y: 60, d: 0.2 });
    waterfall(tl, ["#g-t1", "#g-t2"], ${cues.sep} + 0.3, { y: 16, d: 0.14, gap: 0.5 });
    tl.set("#g-p1, #g-p2", { className: "card gpix on" }, ${cues.juntos} + 0.2);
    tl.set("#g-link", { opacity: 1 }, ${cues.juntos} + 0.2); arrive(tl, "#g-link", ${cues.juntos} + 0.2);
    tl.set("#g-sec", { opacity: 1 }, ${cues.seg} + 0.3); arrive(tl, "#g-sec", ${cues.seg} + 0.3);
    exitCurve(tl, "#g-stage", ${dur - 0.3});`;
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
      <div id="v-ep"><span class="w" id="v-e0">EP08</span><span class="w" id="v-e1">Três projetos reais, com o número e a origem</span></div>
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

  // ------------------------------------------------------------------ TELA 37 · DIVISÓRIA · MÓDULO 4
  tela37: ({ cues, dur }) => {
    const cases = ["Antifraude Pix em tempo real", "Agente de IA para triagem N1 em ITSM", "Agentic Commerce B2B"];
    const inner = `
  <div class="stage" id="s37-stage">
    <div id="s37-net"></div>
    ${chrome(CRUMB, "37", true)}
    <div id="s37-num" aria-hidden="true" data-contrast-allow="decorative">04</div>
    <div id="s37-body">
      <div class="eyebrow light" id="s37-eye">Módulo 4 · <b>Cases da South e aprendizados</b></div>
      <h1 id="s37-title"><span class="w" id="s37-t0">Nossos cases:</span><span class="w" id="s37-t1"><em>como as oportunidades viram projetos reais</em></span></h1>
      <p id="s37-note">Em cada case: o cliente, a dor, a solução, a governança e os resultados, <b id="s37-orig">com a origem de cada número.</b></p>
      <div id="s37-cases">${cases.map((c, i) => `<span class="case" id="s37-c${i}"><i>${i + 1}</i>${c}</span>`).join("")}</div>
    </div>
  </div>`;
    const css = `
  #root { background: #FF5100; }
  #root #s37-net { position: absolute; inset: 0; background: url(assets/cover-bg.jpg) center / cover no-repeat; }
  #root #s37-eye { position: static; } #root .eyebrow.light { color: rgba(255,255,255,.85); } #root .eyebrow.light b { color: #fff; }
  #root #s37-num { position: absolute; right: 120px; top: 150px; font-size: 420px; font-weight: 900; letter-spacing: -0.06em; color: rgba(255,154,102,.6); line-height: 1; }
  #root #s37-body { position: absolute; left: 96px; top: 168px; width: 1180px; }
  #root #s37-title { margin-top: 80px; font-size: 74px; line-height: 1.04; font-weight: 900; letter-spacing: -0.045em; color: #fff; }
  #root #s37-title em { font-style: normal; color: #1A1A1A; }
  #root #s37-note { margin-top: 28px; width: 1150px; font-size: 28px; line-height: 1.45; color: rgba(255,255,255,.95); }
  #root #s37-note b { color: #fff; font-weight: 800; border-radius: 8px; padding: 0 4px; }
  #root #s37-note b.on { background: #1A1A1A; color: #FF9A66; }
  #root #s37-cases { margin-top: 32px; display: flex; flex-direction: column; gap: 12px; }
  #root .case { display: inline-flex; align-items: center; gap: 16px; align-self: flex-start; background: #1A1A1A; color: #fff; font-size: 30px; font-weight: 800; padding: 12px 24px 12px 12px; border-radius: 14px; }
  #root .case i { font-style: normal; width: 44px; height: 44px; border-radius: 10px; background: #FF5100; color: #1A1A1A; display: grid; place-items: center; font-weight: 900; }
  #root .w { display: inline-block; margin-right: .22em; }
`;
    const js = `
    hide("#s37-num, #s37-eye, .w, #s37-note, .case");
    enterPush(tl, "#s37-body", 0, 18);
    waterfall(tl, ["#s37-num"], 0.1, { y: 90, d: 0.25 });
    waterfall(tl, ["#s37-eye"], ${cues.title}, { y: 40 });
    waterfall(tl, ["#s37-t0", "#s37-t1"], ${cues.title} + 0.3, { y: 80, d: 0.2, gap: 0.12 });
    waterfall(tl, ["#s37-c0", "#s37-c1", "#s37-c2"], ${cues.cases} + 0.2, { y: 40, d: 0.16, gap: 1.2 });
    waterfall(tl, ["#s37-note"], ${cues.each} + 0.2, { y: 40 });
    tl.set("#s37-orig", { className: "on" }, ${cues.origem} + 0.2); press(tl, "#s37-orig", ${cues.origem} + 0.2);
    exitCurve(tl, "#s37-stage", ${dur - 0.3});`;
    return root("tela37", dur, inner, css) + script("tela37", js);
  },

  // ------------------------------------------------------------------ TELA 38 · CASE 1 · NO PIX, A FRAUDE SE DECIDE EM MENOS DE UM SEGUNDO
  tela38: ({ cues, dur }) => {
    const chips = ["Banco digital brasileiro · Pix de alto volume", "Decisão regulada: explicável e auditável (LGPD)", "Deu origem ao acelerador de fraude da South"];
    const inner = `
  <div class="stage" id="s38-stage">
    ${chrome(CRUMB, "38")}
    <div class="eyebrow">Case 1 · O cliente e a dor</div>
    <h2 class="title">No Pix, a fraude se decide <em>em menos de um segundo</em></h2>
    <div class="xchips">${chips.map((c, i) => `<span class="xchip" id="s38-c${i}"><i></i>${c}</span>`).join("")}</div>
    <div class="card" id="s38-card">
      <svg viewBox="0 0 960 230" width="1660" height="398" aria-label="Linha do tempo da decisão de fraude">
        <defs><marker id="s38-ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5 0 10z" fill="#6E6E6E"/></marker></defs>
        <g id="s38-line"><line x1="30" y1="120" x2="930" y2="120" stroke="#8C8C8C" stroke-width="2" marker-end="url(#s38-ar)"/>
          <rect x="30" y="98" width="230" height="44" rx="22" fill="#FFEEE6"/><circle cx="54" cy="120" r="12" fill="#1A1A1A"/><text x="76" y="125" font-size="13" font-weight="800" fill="#1A1A1A">Transação Pix</text>
          <circle cx="470" cy="120" r="9" fill="#1A1A1A"/><text x="470" y="158" text-anchor="middle" font-size="12" font-weight="800" fill="#1A1A1A">Liquidação</text></g>
        <g id="s38-fast"><rect x="200" y="20" width="170" height="62" rx="14" fill="#C73E00"/><text x="285" y="48" text-anchor="middle" font-size="22" font-weight="800" fill="#fff">&lt; 1 s</text>
          <text x="285" y="69" text-anchor="middle" font-size="11" font-weight="700" fill="#fff">aprovar ou reter a transação</text>
          <line x1="285" y1="82" x2="285" y2="108" stroke="#C73E00" stroke-width="2"/><circle cx="285" cy="120" r="9" fill="#C73E00"/>
          <text x="285" y="158" text-anchor="middle" font-size="12" font-weight="800" fill="#C73E00">decisão antes da liquidação</text></g>
        <g id="s38-slow"><rect x="700" y="20" width="200" height="62" rx="14" fill="#FBE3E1"/><text x="800" y="48" text-anchor="middle" font-size="22" font-weight="800" fill="#B3261E">D+1</text>
          <text x="800" y="69" text-anchor="middle" font-size="11" font-weight="700" fill="#B3261E">análise em lote chegava</text>
          <line x1="800" y1="82" x2="800" y2="108" stroke="#B3261E" stroke-width="2"/><circle cx="800" cy="120" r="9" fill="#B3261E"/></g>
        <text id="s38-late" x="800" y="158" text-anchor="middle" font-size="12" font-weight="800" fill="#B3261E">a fraude já tinha acontecido</text>
      </svg>
    </div>
    <div class="src">${SRC_PIX}</div>
  </div>`;
    const css = `${E8_CSS}
  #root #s38-card { left: 96px; top: 400px; width: 1728px; padding: 22px 34px; transform-origin: 50% 100%; }
  #root #s38-card.on { outline: 3px solid #FF5100; }
`;
    const js = `
    hide(".xchip, #s38-card, #s38-fast, #s38-slow, #s38-late");
    enterCurve(tl, "#s38-stage", 0);
    waterfall(tl, ["#s38-c0"], ${cues.open} + 0.3, { y: 30 });
    waterfall(tl, ["#s38-card"], ${cues.fisica}, { y: 60, d: 0.22 });
    tl.set("#s38-fast", { opacity: 1 }, ${cues.seg} + 1.6); arrive(tl, "#s38-fast", ${cues.seg} + 1.6, 6);
    tl.set("#s38-slow", { opacity: 1 }, ${cues.lote} + 0.4); arrive(tl, "#s38-slow", ${cues.lote} + 0.4, 6);
    tl.set("#s38-late", { opacity: 1 }, ${cues.tarde} + 0.4);
    waterfall(tl, ["#s38-c1"], ${cues.cro} + 0.3, { y: 30 });
    tl.set("#s38-card", { className: "card on" }, ${cues.bloq}); press(tl, "#s38-card", ${cues.bloq});
    tl.set("#s38-card", { className: "card" }, ${cues.acel});
    waterfall(tl, ["#s38-c2"], ${cues.acel} + 0.2, { y: 30 });
    tl.set("#s38-c2", { className: "xchip on" }, ${cues.acel} + 0.6);
    exitCurve(tl, "#s38-stage", ${dur - 0.3});`;
    return root("tela38", dur, inner, css) + script("tela38", js);
  },

  // ------------------------------------------------------------------ TELA 39 · CASE 1 · CLASSE RARA
  tela39: ({ cues, dur }) => {
    // grade de 26 x 9 pontos; dois pontos de fraude em posições fixas (determinístico)
    const dots = [];
    for (let r = 0; r < 9; r++)
      for (let c = 0; c < 26; c++) {
        const fraud = (r === 2 && c === 17) || (r === 6 && c === 7);
        dots.push(`<circle${fraud ? ` class="fr" id="s39-f${r}"` : ""} cx="${14 + c * 22}" cy="${14 + r * 22}" r="${fraud ? 8 : 6}" fill="${fraud ? "#D93025" : "#C9C9C9"}"/>`);
      }
    const inner = `
  <div class="stage" id="s39-stage">
    ${chrome(CRUMB, "39")}
    <div class="eyebrow">Case 1 · O cliente e a dor</div>
    <h2 class="title">Milhões de transações legítimas, <em>pouquíssimas fraudes</em></h2>
    <div class="card" id="s39-grid">
      <div class="k">Milhões × poucas</div>
      <svg viewBox="0 0 580 210" width="790" height="286" aria-hidden="true">${dots.join("")}</svg>
      <div class="leg"><span class="lg"><i></i>Fraude</span></div>
      <p id="s39-rare">Classes raras: a fraude é <b>exceção estatística</b>, e o modelo precisa achá-la.</p>
    </div>
    <div class="card" id="s39-shelf"><h4>Modelos de prateleira falham</h4><p>No desequilíbrio extremo entre classes, a solução genérica não aprende o padrão da fraude.</p></div>
    <div class="card ink" id="s39-neck"><div class="k">O gargalo</div><h4><span class="hl" id="s39-hl">não era o modelo</span></h4><p id="s39-time">Era calcular as variáveis de comportamento no prazo em que a decisão ainda vale.</p></div>
    <div class="src">${SRC_PIX}</div>
  </div>`;
    const css = `${E8_CSS}
  #root #s39-grid { left: 96px; top: 300px; width: 860px; padding: 26px 34px; transform-origin: 50% 100%; }
  #root #s39-grid svg { display: block; margin-top: 12px; }
  #root #s39-grid .leg { margin-top: 10px; font-size: 20px; font-weight: 800; color: #B3261E; }
  #root #s39-grid .lg i { display: inline-block; width: 14px; height: 14px; border-radius: 50%; background: #D93025; margin-right: 10px; vertical-align: -1px; }
  #root #s39-rare { font-size: 23px; } #root #s39-rare b { color: #1A1A1A; }
  #root #s39-shelf { left: 990px; top: 300px; width: 834px; padding: 26px 32px; transform-origin: 0% 50%; }
  #root #s39-shelf h4 { font-size: 34px; }
  #root #s39-shelf p { font-size: 24px; }
  #root #s39-neck { left: 990px; top: 548px; width: 834px; padding: 28px 32px; background: #1A1A1A; transform-origin: 0% 50%; }
  #root #s39-neck .k { color: #FF9A66; }
  #root #s39-neck h4 { font-size: 46px; color: #fff; margin-top: 8px; letter-spacing: -0.03em; }
  #root #s39-neck .hl { border-radius: 10px; padding: 0 8px; }
  #root #s39-neck .hl.on { background: #C73E00; }
  #root #s39-neck p { font-size: 25px; color: rgba(255,255,255,.88); }
  #root #s39-neck p.on { color: #FF9A66; font-weight: 700; }
`;
    const js = `
    hide("#s39-grid, .fr, #s39-shelf, #s39-neck");
    enterCurve(tl, "#s39-stage", 0);
    waterfall(tl, ["#s39-grid"], ${cues.open} + 0.2, { y: 60, d: 0.22 });
    tl.set(".fr", { opacity: 1 }, ${cues.dots} + 1.6);
    tl.fromTo(".fr", { scale: 2.6 }, { scale: 1, duration: 0.45, ease: "expo.out", transformOrigin: "50% 50%", immediateRender: false }, ${cues.dots} + 1.6);
    waterfall(tl, ["#s39-shelf"], ${cues.prat}, { y: 50, d: 0.2 });
    tl.set("#s39-neck", { opacity: 1 }, ${cues.garg}); arrive(tl, "#s39-neck", ${cues.garg});
    tl.set("#s39-hl", { className: "hl on" }, ${cues.garg} + 1.0);
    tl.set("#s39-time", { className: "on" }, ${cues.tempo} + 0.3);
    press(tl, "#s39-neck", ${cues.eng} + 0.3);
    exitCurve(tl, "#s39-stage", ${dur - 0.3});`;
    return root("tela39", dur, inner, css) + script("tela39", js);
  },

  // ------------------------------------------------------------------ TELA 40 · CASE 1 · A SOLUÇÃO
  tela40: ({ cues, dur }) => {
    const steps = [
      ["01", "Captura", "Cada transação entra como evento em streaming (<b>Kafka</b>), antes da liquidação."],
      ["02", "Calcula", "Variáveis de comportamento em janelas de <b>1 min, 1 h, 24 h e 7 dias</b>, por CPF, conta ou cartão."],
      ["03", "Decide", "Um modelo <b>XGBoost</b> pontua a transação em milissegundos, 100% explicável."],
      ["04", "Aprende", "Dados sintéticos (<b>SMOTE, GANs</b>) equilibram as classes raras no treinamento."],
    ];
    const inner = `
  <div class="stage" id="s40-stage">
    ${chrome(CRUMB, "40")}
    <div class="eyebrow">Case 1 · A solução</div>
    <h2 class="title">Decidir antes da liquidação, <em>com um modelo explicável</em></h2>
    <div class="steps">${steps.map((s, i) => `<div class="step" id="s40-d${i + 1}"><div class="no">${s[0]}</div><h4>${s[1]}</h4><p>${s[2]}</p></div>`).join("")}</div>
    <div class="band wide" id="s40-band">A fraude está na relação entre eventos: <b class="hl" id="s40-hl">R$ 0,09 seguido de R$ 510 em um minuto</b> dispara alerta. <span class="hl" id="s40-iso">Os mesmos valores, isolados, não.</span></div>
  </div>`;
    const css = `${E8_CSS}`;
    const js = `
    hide(".step, #s40-band");
    enterCurve(tl, "#s40-stage", 0);
    ${[1, 2, 3, 4].map((i) => `waterfall(tl, ["#s40-d${i}"], ${cues["d" + i]}, { y: 60, d: 0.2 }); tl.set("#s40-d${i}", { className: "step on" }, ${cues["d" + i]});${i > 1 ? ` tl.set("#s40-d${i - 1}", { className: "step" }, ${cues["d" + i]});` : ""}`).join("\n    ")}
    tl.set("#s40-d4", { className: "step" }, ${cues.band});
    tl.set("#s40-band", { opacity: 1 }, ${cues.band} + 0.2); arrive(tl, "#s40-band", ${cues.band} + 0.2, 8);
    tl.set("#s40-hl", { className: "hl on" }, ${cues.r510} + 0.2);
    tl.set("#s40-iso", { className: "hl on" }, ${cues.iso} + 0.2);
    exitCurve(tl, "#s40-stage", ${dur - 0.3});`;
    return root("tela40", dur, inner, css) + script("tela40", js);
  },

  // ------------------------------------------------------------------ TELA 41 · CASE 1 · GOVERNANÇA
  tela41: ({ cues, dur }) => {
    const cards = [
      ["Sem caixa-preta", "Modelo explicável, pronto para auditoria e para responder ao regulador (LGPD)."],
      ["Sem expor dados reais", "O padrão da fraude é aprendido com dados sintéticos, sem usar dados pessoais no treinamento."],
      ["Sintético com rigor", "Risco de padrões artificiais, mitigado com testes comparativos e validação em base cega (AUC e KS)."],
    ];
    const pipe = [["Kafka", "evento a evento"], ["Janelas com estado", "1 min · 1 h · 24 h · 7 d"], ["XGBoost", "pontua em ms"], ["Decisão", "recuperação via checkpoint"]];
    const inner = `
  <div class="stage" id="s41-stage">
    ${chrome(CRUMB, "41")}
    <div class="eyebrow">Case 1 · Governança</div>
    <h2 class="title">Governança: <em>decisão auditável</em></h2>
    <div class="trio">${cards.map((c, i) => `<div class="card" id="s41-c${i + 1}"><h4>${c[0]}</h4><p>${c[1]}</p></div>`).join("")}</div>
    <div id="s41-pipe">${pipe.map((n, i) => `${i ? `<span class="ar" id="s41-a${i}">→</span>` : ""}<div class="node" id="s41-n${i}"><b>${n[0]}</b><span>${n[1]}</span></div>`).join("")}</div>
  </div>`;
    const css = `${E8_CSS}
  #root .trio .card { min-height: 300px; }
  #root #s41-pipe { position: absolute; left: 96px; top: 680px; width: 1728px; display: flex; align-items: center; gap: 14px; background: #1A1A1A; border-radius: 18px; padding: 24px 28px; transform-origin: 0% 50%; }
  #root #s41-pipe .node { flex: 1; background: rgba(255,255,255,.08); border-radius: 12px; padding: 14px 18px; display: flex; flex-direction: column; gap: 6px; }
  #root #s41-pipe .node b { color: #FF9A66; font-size: 26px; font-weight: 900; }
  #root #s41-pipe .node span { color: #fff; font-size: 21px; font-weight: 600; }
  #root #s41-pipe .ar { color: #FF9A66; font-size: 34px; font-weight: 900; }
`;
    const js = `
    hide(".trio .card, #s41-pipe, #s41-pipe .node, #s41-pipe .ar");
    enterCurve(tl, "#s41-stage", 0);
    ${[1, 2, 3].map((i) => `waterfall(tl, ["#s41-c${i}"], ${cues["c" + i]}, { y: 60, d: 0.2 }); tl.set("#s41-c${i}", { className: "card on" }, ${cues["c" + i]});${i > 1 ? ` tl.set("#s41-c${i - 1}", { className: "card" }, ${cues["c" + i]});` : ""}`).join("\n    ")}
    tl.set("#s41-c3", { className: "card" }, ${cues.cro});
    tl.set("#s41-pipe", { opacity: 1 }, ${cues.cro} + 0.2); enterCurve(tl, "#s41-pipe", ${cues.cro} + 0.2);
    waterfall(tl, ["#s41-n0", "#s41-a1", "#s41-n1", "#s41-a2", "#s41-n2", "#s41-a3", "#s41-n3"], ${cues.cro} + 0.45, { y: 20, d: 0.14, gap: 0.3 });
    exitCurve(tl, "#s41-stage", ${dur - 0.3});`;
    return root("tela41", dur, inner, css) + script("tela41", js);
  },

  // ------------------------------------------------------------------ TELA 42 · CASE 1 · RESULTADOS
  tela42: ({ cues, dur }) => {
    const inner = `
  <div class="stage" id="s42-stage">
    ${chrome(CRUMB, "42")}
    <div class="eyebrow">Case 1 · Resultados</div>
    <h2 class="title">AUC acima de 0,98, <em>com a decisão antes da liquidação</em></h2>
    <div class="card" id="s42-auc"><div class="k">Separação entre fraude e transação legítima</div><div class="big" id="s42-n">AUC &gt; 0,98</div><p>Capacidade do modelo de separar fraude de transação legítima, com a decisão tomada antes da liquidação.</p></div>
    <div id="s42-side">
      <div class="card st" id="s42-ks"><div class="n">KS &gt; 0,90</div><div class="l">separação entre fraude e transação legítima</div></div>
      <div class="card st" id="s42-ms"><div class="n">ms</div><div class="l">latência de decisão, evento a evento, no lugar do lote D+1</div></div>
      <div class="card st" id="s42-lgpd"><div class="n">LGPD</div><div class="l">modelo explicável, treinado sem expor dados reais</div></div>
    </div>
    <div class="lens" id="s42-lens"><div class="k">Lente Gartner</div>No Pix, a decisão precisa sair em menos de 1 s. No Swedbank, o modelo híbrido cortou <b id="s42-50">cerca de 50% dos falsos positivos.</b></div>
    <div class="ask e8" id="s42-ask"><span class="k">Pergunta</span><p>Vocês têm alguma decisão que precisa ser tomada <em>em segundos?</em> Quanto custa decidir tarde?</p></div>
    <div class="src">Métricas do deck de cases da South (ago/2026); solução entregue e validada no cliente. Demo do acelerador no ambiente da South: 1 a 2 s, dominada pela janela.</div>
  </div>`;
    const css = `${E8_CSS}
  #root #s42-auc { left: 96px; top: 300px; width: 830px; height: 300px; padding: 28px 34px; transform-origin: 50% 100%; }
  #root #s42-auc .big { font-size: 110px; margin-top: 16px; letter-spacing: -0.05em; color: #C73E00; }
  #root #s42-auc p { font-size: 23px; }
  #root #s42-auc.on { outline: 4px solid #FF5100; }
  #root #s42-side { position: absolute; left: 956px; top: 300px; width: 868px; display: flex; flex-direction: column; gap: 12px; }
  #root #s42-side .card { position: relative; display: grid; grid-template-columns: 210px 1fr; align-items: center; gap: 18px; padding: 18px 24px; transform-origin: 0% 50%; }
  #root #s42-side .n { font-size: 40px; font-weight: 900; letter-spacing: -0.03em; color: #1A1A1A; }
  #root #s42-side .l { font-size: 21px; line-height: 1.3; color: #4A4A4A; }
  #root #s42-side .card.on { outline: 3px solid #FF5100; }
  #root #s42-lens { left: 96px; top: 628px; width: 830px; transform-origin: 0% 50%; }
  #root #s42-ask { top: 800px; }
`;
    const js = `
    hide("#s42-auc, #s42-side .card, #s42-lens, #s42-ask");
    enterCurve(tl, "#s42-stage", 0);
    waterfall(tl, ["#s42-auc"], ${cues.open}, { y: 60, d: 0.22 });
    countUp(tl, "#s42-n", 0.98, ${cues.auc} + 0.2, { dur: 1.2, dec: 2, prefix: "AUC > " });
    waterfall(tl, ["#s42-ks"], ${cues.auc} + 2.6, { y: 40, d: 0.2 });
    press(tl, "#s42-ks", ${cues.risco} + 0.3);
    tl.set("#s42-auc", { className: "card on" }, ${cues.comite} + 0.2); press(tl, "#s42-auc", ${cues.comite} + 0.2);
    tl.set("#s42-auc", { className: "card" }, ${cues.ms});
    waterfall(tl, ["#s42-ms", "#s42-lgpd"], ${cues.ms} + 0.2, { y: 40, d: 0.2, gap: 0.8 });
    tl.set("#s42-lens", { opacity: 1 }, ${cues.gartner} + 0.2); enterCurve(tl, "#s42-lens", ${cues.gartner} + 0.2);
    tl.set("#s42-50", { className: "on" }, ${cues.swed} + 1.2);
    press(tl, "#s42-lens", ${cues.cfo} + 0.2);
    waterfall(tl, ["#s42-ask"], ${cues.receita} + 0.4, { y: 60, d: 0.2 });
    exitCurve(tl, "#s42-stage", ${dur - 0.3});`;
    return root("tela42", dur, inner, css) + script("tela42", js);
  },
});

const SRC_N1 = "Cliente anonimizado por confidencialidade. Case validado pelo time (out/2026).";

Object.assign(SCENES_EP08, {
  // ------------------------------------------------------------------ TELA 43 · CASE 2 · O N1 PROCURANDO
  tela43: ({ cues, dur }) => {
    const chips = ["Uma das três maiores adquirentes do Brasil", "Brasil e América Latina", "Ambiente regulado: PCI e ISO 27001"];
    const stats = [
      ["1 fila", "por área no ServiceNow, com no mínimo duas pessoas em cada"],
      ["~40 mil", "incidentes no histórico, pesquisados à mão a cada chamado"],
      ["3", "idiomas na operação: português, espanhol e inglês"],
    ];
    const inner = `
  <div class="stage" id="s43-stage">
    ${chrome(CRUMB, "43")}
    <div class="eyebrow">Case 2 · O cliente e a dor</div>
    <h2 class="title">O N1 gastava mais tempo <em id="s43-em">procurando do que resolvendo</em></h2>
    <div class="xchips">${chips.map((c, i) => `<span class="xchip" id="s43-c${i}"><i></i>${c}</span>`).join("")}</div>
    <div class="trio" id="s43-stats">${stats.map((st, i) => `<div class="card" id="s43-r${i + 1}"><div class="n" id="s43-n${i + 1}">${st[0]}</div><p>${st[1]}</p></div>`).join("")}</div>
    <div id="s43-pains">
      <div class="card pain" id="s43-p1"><h4>Buscador nativo lento</h4><p>Incapaz de dar conta do volume do histórico.</p></div>
      <div class="card pain" id="s43-p2"><h4>IA do fornecedor indisponível</h4><p>O módulo de IA do ITSM não estava disponível na época da contratação.</p></div>
    </div>
    <div class="src">${SRC_N1}</div>
  </div>`;
    const css = `${E8_CSS}
  #root #s43-stats { top: 390px; }
  #root #s43-stats .card { min-height: 0; padding: 22px 28px; }
  #root #s43-stats .n { font-size: 72px; font-weight: 900; letter-spacing: -0.05em; line-height: 1; color: #C73E00; }
  #root #s43-stats p { font-size: 22px; margin-top: 10px; }
  #root #s43-pains { position: absolute; left: 96px; top: 640px; width: 1728px; display: grid; grid-template-columns: 1fr 1fr; gap: 22px; }
  #root .card.pain { position: relative; padding: 22px 28px; background: #1A1A1A; transform-origin: 50% 100%; }
  #root .card.pain h4 { color: #FF9A66; font-size: 30px; }
  #root .card.pain p { color: rgba(255,255,255,.88); font-size: 23px; }
  #root #s43-em.on { background: #FFEEE6; border-radius: 10px; padding: 0 8px; }
`;
    const js = `
    hide(".xchip, #s43-stats .card, .card.pain");
    enterCurve(tl, "#s43-stage", 0);
    waterfall(tl, ["#s43-c0", "#s43-c1", "#s43-c2"], ${cues.open} + 0.4, { y: 30, d: 0.14, gap: 1.6 });
    tl.set("#s43-em", { className: "on" }, ${cues.dor} + 1.0);
    waterfall(tl, ["#s43-r1"], ${cues.r1}, { y: 50, d: 0.2 });
    waterfall(tl, ["#s43-r2"], ${cues.r2}, { y: 50, d: 0.2 }); countUp(tl, "#s43-n2", 40, ${cues.r2} + 0.2, { dur: 1.0, prefix: "~", suffix: " mil" });
    waterfall(tl, ["#s43-r3"], ${cues.r3}, { y: 50, d: 0.2 });
    waterfall(tl, ["#s43-p1", "#s43-p2"], ${cues.pains} + 0.2, { y: 50, d: 0.2, gap: 2.0 });
    press(tl, "#s43-r3", ${cues.lente} + 0.3);
    exitCurve(tl, "#s43-stage", ${dur - 0.3});`;
    return root("tela43", dur, inner, css) + script("tela43", js);
  },

  // ------------------------------------------------------------------ TELA 44 · CASE 2 · A SOLUÇÃO
  tela44: ({ cues, dur }) => {
    const steps = [
      ["01", "Lê", "A descrição do incidente via <b>API do ServiceNow</b>, a cada 15 minutos."],
      ["02", "Consulta", "Uma <b>base vetorial</b> com o histórico de incidentes resolvidos (RAG)."],
      ["03", "Analisa", "Classifica, prioriza e sugere o roteamento com <b>IA generativa.</b>"],
      ["04", "Escreve", "A análise completa de volta nas <b>notas de trabalho</b> do chamado."],
    ];
    const inner = `
  <div class="stage" id="s44-stage">
    ${chrome(CRUMB, "44")}
    <div class="eyebrow">Case 2 · A solução</div>
    <h2 class="title">Um agente que lê, consulta o histórico e <em>pré-analisa o chamado</em></h2>
    <div class="steps">${steps.map((st, i) => `<div class="step" id="s44-d${i + 1}"><div class="no">${st[0]}</div><h4>${st[1]}</h4><p>${st[2]}</p></div>`).join("")}</div>
    <div class="band wide" id="s44-band">O atendente não muda de ferramenta. <b class="hl" id="s44-hl">A IA vai até onde ele já trabalha.</b></div>
  </div>`;
    const css = `${E8_CSS}`;
    const js = `
    hide(".step, #s44-band");
    enterCurve(tl, "#s44-stage", 0);
    ${[1, 2, 3, 4].map((i) => `waterfall(tl, ["#s44-d${i}"], ${cues["d" + i]}, { y: 60, d: 0.2 }); tl.set("#s44-d${i}", { className: "step on" }, ${cues["d" + i]});${i > 1 ? ` tl.set("#s44-d${i - 1}", { className: "step" }, ${cues["d" + i]});` : ""}`).join("\n    ")}
    tl.set("#s44-d4", { className: "step" }, ${cues.band});
    tl.set("#s44-band", { opacity: 1 }, ${cues.band} + 0.1); arrive(tl, "#s44-band", ${cues.band} + 0.1, 8);
    tl.set("#s44-hl", { className: "hl on" }, ${cues.band2} + 0.2);
    press(tl, "#s44-band", ${cues.nota} + 1.6);
    exitCurve(tl, "#s44-stage", ${dur - 0.3});`;
    return root("tela44", dur, inner, css) + script("tela44", js);
  },

  // ------------------------------------------------------------------ TELA 45 · CASE 2 · GOVERNANÇA
  tela45: ({ cues, dur }) => {
    const cards = [
      ["Sem mudar a operação", "O ServiceNow continua sendo a interface. O dia a dia do time não muda."],
      ["Só notas internas", "O agente não escreve em comentários visíveis ao cliente final, por decisão do cliente."],
      ["Aprendizado contínuo", "O feedback dos atendentes já é capturado. Na fase 2, ele passa a realimentar o modelo."],
    ];
    const inner = `
  <div class="stage" id="s45-stage">
    ${chrome(CRUMB, "45")}
    <div class="eyebrow">Case 2 · Governança</div>
    <h2 class="title">IA que sugere, <em id="s45-em">pessoas que decidem</em></h2>
    <div class="trio">${cards.map((c, i) => `<div class="card" id="s45-c${i + 1}"><h4>${c[0]}</h4><p>${c[1]}</p></div>`).join("")}</div>
    <div class="band wide" id="s45-band"><span class="k2">Arquitetura · ambiente financeiro regulado</span> Segurança e rastreabilidade compatíveis com um ambiente <b class="hl" id="s45-hl">PCI e ISO 27001.</b></div>
  </div>`;
    const css = `${E8_CSS}
  #root .trio .card { min-height: 300px; }
  #root #s45-band .k2 { display: block; font-size: 18px; letter-spacing: .14em; text-transform: uppercase; font-weight: 800; color: #FF9A66; margin-bottom: 8px; }
  #root #s45-em.on { background: #FFEEE6; border-radius: 10px; padding: 0 8px; }
`;
    const js = `
    hide(".trio .card, #s45-band");
    enterCurve(tl, "#s45-stage", 0);
    ${[1, 2, 3].map((i) => `waterfall(tl, ["#s45-c${i}"], ${cues["c" + i]}, { y: 60, d: 0.2 }); tl.set("#s45-c${i}", { className: "card on" }, ${cues["c" + i]});${i > 1 ? ` tl.set("#s45-c${i - 1}", { className: "card" }, ${cues["c" + i]});` : ""}`).join("\n    ")}
    tl.set("#s45-c3", { className: "card" }, ${cues.cro});
    tl.set("#s45-em", { className: "on" }, ${cues.cro} + 0.4); press(tl, "#s45-em", ${cues.cro} + 0.4);
    tl.set("#s45-band", { opacity: 1 }, ${cues.pci}); arrive(tl, "#s45-band", ${cues.pci}, 8);
    tl.set("#s45-hl", { className: "hl on" }, ${cues.pci} + 0.6);
    exitCurve(tl, "#s45-stage", ${dur - 0.3});`;
    return root("tela45", dur, inner, css) + script("tela45", js);
  },

  // ------------------------------------------------------------------ TELA 46 · CASE 2 · ANÁLISE PRONTA
  tela46: ({ cues, dur }) => {
    const items = [
      ["Resumo executivo", ""],
      ["Classificação, impacto e prioridade sugeridos", ""],
      ["Grau de confiança da sugestão", '<span class="pill hi">alta</span>'],
      ["Roteamento sugerido", ""],
      ["Incidentes similares, com % de similaridade", '<span class="pill">92%</span><span class="pill">81%</span><span class="pill">67%</span>'],
      ["Análise técnica", ""],
      ["Comentário sugerido ao usuário", ""],
      ["Próximos passos", ""],
      ["Correlação e problema associado preenchidos", ""],
    ];
    const inner = `
  <div class="stage" id="s46-stage">
    ${chrome(CRUMB, "46")}
    <div class="eyebrow">Case 2 · O que o atendente recebe</div>
    <h2 class="title">Chamado aberto, <em>análise pronta</em></h2>
    <div class="card" id="s46-notes">
      <div class="k">Notas de trabalho · chamado N1</div>
      <div class="hd">Pré-análise da IA</div>
      <ul>${items.map((it, i) => `<li id="s46-i${i}"><span class="t">${it[0]}</span>${it[1] ? `<span class="x">${it[1]}</span>` : ""}</li>`).join("")}</ul>
    </div>
    <div class="card ink" id="s46-gestor"><div class="k">Para o gestor</div><p class="a">Cada item é uma decisão que o analista antes tomava <b>sem contexto.</b></p><p class="b" id="s46-b">A IA entrega o contexto; a decisão continua com a pessoa, registrada no chamado.</p></div>
    <div class="card" id="s46-panel"><h4>+ Painel analítico</h4><p>Dashboard, lista de incidentes e botão de feedback do atendente.</p></div>
  </div>`;
    const css = `${E8_CSS}
  #root #s46-notes { left: 96px; top: 290px; width: 1000px; padding: 24px 30px; transform-origin: 50% 100%; }
  #root #s46-notes .hd { font-size: 28px; font-weight: 900; color: #1A1A1A; margin-top: 8px; }
  #root #s46-notes ul { list-style: none; margin-top: 10px; }
  #root #s46-notes li { display: flex; align-items: center; justify-content: space-between; gap: 14px; font-size: 22px; line-height: 1.25; color: #1A1A1A; padding: 8px 0; border-top: 1px solid #EDEDED; }
  #root #s46-notes li .t { font-weight: 600; }
  #root #s46-notes li .x { display: flex; gap: 8px; }
  #root .pill { background: #EDEDED; color: #1A1A1A; font-size: 18px; font-weight: 800; padding: 4px 12px; border-radius: 999px; }
  #root .pill.hi { background: #1B7A3E; color: #fff; }
  #root #s46-gestor { left: 1126px; top: 290px; width: 698px; padding: 26px 30px; background: #1A1A1A; transform-origin: 0% 50%; }
  #root #s46-gestor .k { color: #FF9A66; }
  #root #s46-gestor p { color: #fff; font-size: 26px; line-height: 1.35; margin-top: 12px; }
  #root #s46-gestor p b { color: #FF9A66; }
  #root #s46-gestor p.b { color: rgba(255,255,255,.85); }
  #root #s46-gestor p.b.on { color: #fff; font-weight: 700; }
  #root #s46-panel { left: 1126px; top: 690px; width: 698px; padding: 24px 30px; transform-origin: 0% 50%; }
  #root #s46-panel h4 { font-size: 30px; }
`;
    const js = `
    hide("#s46-notes, #s46-notes li, #s46-gestor, #s46-panel");
    enterCurve(tl, "#s46-stage", 0);
    waterfall(tl, ["#s46-notes"], 0.4, { y: 60, d: 0.22 });
    waterfall(tl, [${items.map((_, i) => `"#s46-i${i}"`).join(", ")}], ${cues.notes} + 0.3, { y: 16, d: 0.14, gap: 0.9, decay: 1 });
    tl.set("#s46-gestor", { opacity: 1 }, ${cues.gestor} + 0.1); enterCurve(tl, "#s46-gestor", ${cues.gestor} + 0.1);
    tl.set("#s46-b", { className: "b on" }, ${cues.decide} + 0.2);
    waterfall(tl, ["#s46-panel"], ${cues.decide} + 1.4, { y: 40, d: 0.2 });
    exitCurve(tl, "#s46-stage", ${dur - 0.3});`;
    return root("tela46", dur, inner, css) + script("tela46", js);
  },

  // ------------------------------------------------------------------ TELA 47 · CASE 2 · 48 MIN → 7 MIN
  tela47: ({ cues, dur }) => {
    const inner = `
  <div class="stage" id="s47-stage">
    ${chrome(CRUMB, "47")}
    <div class="eyebrow">Case 2 · Resultados</div>
    <h2 class="title">48 min → 7 min: <em>cerca de 85% menos</em> tempo humano por chamado</h2>
    <div class="card" id="s47-big">
      <div class="k">Localizar e entender um chamado</div>
      <div class="num" id="s47-num"><span id="s47-48">48</span><span class="arr" id="s47-arr"> → </span><span id="s47-7">7</span><small> min</small></div>
      <p><span id="s47-85">Tempo humano, cerca de 85% menor.</span> <span id="s47-dec">Declarado pela gestão do projeto no cliente.</span></p>
    </div>
    <div id="s47-side">
      <div class="card st" id="s47-v1"><div class="n">100%</div><div class="l">dos <b>294 incidentes</b> das filas N1 contratadas processados pelo agente</div></div>
      <div class="card st" id="s47-v2"><div class="n">Jun/2026</div><div class="l">em <b>produção assistida</b></div></div>
      <div class="card st" id="s47-v3"><div class="n">+12 filas</div><div class="l">incorporadas além do escopo inicial</div></div>
    </div>
    <div class="ask e8" id="s47-ask"><span class="k">Pergunta</span><p>Vocês têm um N1 grande, terceirizado ou <em>em mais de um idioma?</em></p></div>
    <div class="src" id="s47-src">Volume medido no painel do projeto, em homologação. Lente Gartner: resultados medidos ainda são raros; Databricks relata 73% dos tickets resolvidos sem humano, Infosys MTTR 30% menor.</div>
  </div>`;
    const css = `${E8_CSS}
  #root .title { font-size: 46px; }
  #root #s47-big { left: 96px; top: 300px; width: 860px; height: 470px; padding: 30px 36px; transform-origin: 50% 50%; }
  #root #s47-big .num { font-size: 200px; font-weight: 900; letter-spacing: -0.06em; line-height: 1; margin-top: 30px; color: #1A1A1A; white-space: nowrap; }
  #root #s47-big .num #s47-7 { color: #C73E00; }
  #root #s47-big .num .arr { color: #6B6B6B; }
  #root #s47-big .num small { font-size: 56px; letter-spacing: -0.02em; color: #4A4A4A; }
  #root #s47-big p { font-size: 25px; margin-top: 26px; }
  #root #s47-big p span { border-radius: 8px; padding: 0 4px; }
  #root #s47-big p span.on { background: #FFEEE6; color: #1A1A1A; font-weight: 700; }
  #root #s47-side { position: absolute; left: 986px; top: 300px; width: 838px; display: flex; flex-direction: column; gap: 14px; }
  #root #s47-side .card { position: relative; display: grid; grid-template-columns: 250px 1fr; align-items: center; gap: 18px; padding: 22px 26px; transform-origin: 0% 50%; }
  #root #s47-side .n { font-size: 46px; font-weight: 900; letter-spacing: -0.04em; color: #C73E00; }
  #root #s47-side .l { font-size: 22px; line-height: 1.3; color: #4A4A4A; } #root #s47-side .l b { color: #1A1A1A; }
  #root #s47-side .card.on { outline: 3px solid #FF5100; }
  #root #s47-ask { top: 800px; }
  #root #s47-src.on { color: #1A1A1A; }
`;
    const js = `
    hide("#s47-big, #s47-48, #s47-arr, #s47-7, #s47-big small, #s47-side .card, #s47-ask");
    enterCurve(tl, "#s47-stage", 0);
    waterfall(tl, ["#s47-big"], ${cues.open} + 0.1, { y: 60, d: 0.22 });
    tl.set("#s47-48", { opacity: 1 }, ${cues.m48} + 2.4); arrive(tl, "#s47-48", ${cues.m48} + 2.4, 10);
    tl.fromTo("#s47-num", { scale: 1 }, { scale: 1.06, duration: 2.6, ease: "sine.inOut", transformOrigin: "0% 50%", immediateRender: false }, ${cues.m48} + 2.6);
    tl.set("#s47-arr, #s47-big small", { opacity: 1 }, ${cues.m7});
    tl.set("#s47-7", { opacity: 1 }, ${cues.m7} + 0.2); arrive(tl, "#s47-7", ${cues.m7} + 0.2, 12);
    tl.to("#s47-num", { scale: 1, duration: 0.5, ease: "power3.out" }, ${cues.m7} + 0.2);
    tl.set("#s47-85", { className: "on" }, ${cues.p85} + 0.3);
    tl.set("#s47-dec", { className: "on" }, ${cues.origem} + 0.3);
    waterfall(tl, ["#s47-v1"], ${cues.v1}, { y: 40, d: 0.2 });
    waterfall(tl, ["#s47-v2"], ${cues.v2}, { y: 40, d: 0.2 });
    waterfall(tl, ["#s47-v3"], ${cues.v3} + 1.4, { y: 40, d: 0.2 });
    tl.set("#s47-v3", { className: "card st on" }, ${cues.pede} + 0.2); press(tl, "#s47-v3", ${cues.doze});
    tl.set("#s47-src", { className: "src on" }, ${cues.gartner} + 0.4);
    waterfall(tl, ["#s47-ask"], ${cues.src} + 1.2, { y: 60, d: 0.2 });
    exitCurve(tl, "#s47-stage", ${dur - 0.3});`;
    return root("tela47", dur, inner, css) + script("tela47", js);
  },

  // ------------------------------------------------------------------ TELA 48 · AGENTIC COMMERCE B2B
  tela48: ({ cues, dur }) => {
    const flow = [
      ["Desenvolvedor parceiro", "Pede a integração em linguagem natural, 24×7."],
      ["Protocolos agênticos", "Padrões de pagamento das bandeiras e de agentes de compra."],
      ["Orquestração MCP", "Conectada às APIs centrais de pagamento, com RAG."],
      ["Resposta em tempo real", "Liquidação e novos canais de venda."],
    ];
    const inner = `
  <div class="stage" id="s48-stage">
    ${chrome(CRUMB, "48")}
    <div class="eyebrow">Case complementar · Agentic Commerce B2B</div>
    <h2 class="title">Agentic Commerce: integrações B2B <em>por autoatendimento</em></h2>
    <div id="s48-flow">${flow.map((f, i) => `${i ? `<span class="ar" id="s48-a${i}">→</span>` : ""}<div class="node" id="s48-f${i}"><h4>${f[0]}</h4><p>${f[1]}</p></div>`).join("")}</div>
    <div class="card" id="s48-res"><div class="k">Resultados</div><div class="big" id="s48-n">+10%</div><p><span id="s48-eur">estimativa de aumento no volume transacionado, cerca de € 24 bilhões por ano.</span></p><p class="first" id="s48-first">Primeiro pagamento agêntico da América Latina, com o protocolo de uma bandeira global.</p></div>
    <div class="card ink" id="s48-learn"><div class="k">Aprendizado aplicável</div><h4>Caso de "transformar": <em>novo canal de receita</em></h4><p><span id="s48-arq">A mesma arquitetura (RAG + MCP) serve ao autosserviço de clientes em outros setores.</span> <span id="s48-orq">Agentes especializados e orquestrados dão mais controle que um agente único.</span></p></div>
  </div>`;
    const css = `${E8_CSS}
  #root #s48-flow { position: absolute; left: 96px; top: 300px; width: 1728px; display: flex; align-items: stretch; gap: 12px; }
  #root #s48-flow .node { flex: 1; background: #fff; border-radius: 16px; padding: 20px 22px; box-shadow: 0 1px 2px rgba(26,26,26,.04), 0 14px 40px -24px rgba(26,26,26,.18); }
  #root #s48-flow .node h4 { font-size: 26px; font-weight: 800; color: #1A1A1A; }
  #root #s48-flow .node p { font-size: 20px; line-height: 1.35; color: #4A4A4A; margin-top: 8px; }
  #root #s48-flow .ar { align-self: center; color: #E04600; font-size: 34px; font-weight: 900; }
  #root #s48-res { left: 96px; top: 540px; width: 840px; padding: 26px 32px; transform-origin: 50% 100%; }
  #root #s48-res .big { font-size: 96px; letter-spacing: -0.05em; color: #C73E00; margin-top: 6px; }
  #root #s48-res p { font-size: 23px; } #root #s48-res span.on, #root #s48-res p.first.on { background: #FFEEE6; color: #1A1A1A; font-weight: 700; border-radius: 6px; }
  #root #s48-res p.first { font-weight: 700; color: #1A1A1A; }
  #root #s48-learn { left: 966px; top: 540px; width: 858px; padding: 26px 32px; background: #1A1A1A; transform-origin: 0% 50%; }
  #root #s48-learn .k { color: #FF9A66; }
  #root #s48-learn h4 { color: #fff; font-size: 32px; margin-top: 10px; } #root #s48-learn h4 em { font-style: normal; color: #FF9A66; }
  #root #s48-learn p { color: rgba(255,255,255,.85); font-size: 23px; }
  #root #s48-learn span.on { color: #fff; font-weight: 700; }
`;
    const js = `
    hide("#s48-flow .node, #s48-flow .ar, #s48-res, #s48-learn");
    enterCurve(tl, "#s48-stage", 0);
    waterfall(tl, ["#s48-f0"], ${cues.d1}, { y: 40, d: 0.2 });
    waterfall(tl, ["#s48-a1", "#s48-f1", "#s48-a2", "#s48-f2", "#s48-a3", "#s48-f3"], ${cues.d2}, { y: 30, d: 0.16, gap: 0.8, decay: 1 });
    tl.set("#s48-res", { opacity: 1 }, ${cues.p10}); arrive(tl, "#s48-res", ${cues.p10});
    countUp(tl, "#s48-n", 10, ${cues.p10} + 0.4, { dur: 1.0, prefix: "+", suffix: "%" });
    tl.set("#s48-eur", { className: "on" }, ${cues.eur} + 0.3);
    tl.set("#s48-first", { className: "first on" }, ${cues.first} + 0.3);
    tl.set("#s48-learn", { opacity: 1 }, ${cues.ceo} + 0.2); enterCurve(tl, "#s48-learn", ${cues.ceo} + 0.2);
    tl.set("#s48-arq", { className: "on" }, ${cues.arq} + 0.2);
    tl.set("#s48-orq", { className: "on" }, ${cues.orq} + 0.2);
    exitCurve(tl, "#s48-stage", ${dur - 0.3});`;
    return root("tela48", dur, inner, css) + script("tela48", js);
  },

  // ------------------------------------------------------------------ TELA 49 · LIÇÕES · DADOS E MODELOS
  tela49: ({ cues, dur }) => {
    const cards = [
      ["1", "A inteligência", "nasce nos dados.", "Em projetos com RAG, cerca de 90% do sucesso vem do tratamento, enriquecimento e curadoria da base.", "<b>Não</b> do modelo, do prompt ou dos hiperparâmetros."],
      ["2", "Dados sintéticos", "exigem rigor.", "Resolvem classes raras, mas podem gerar padrões artificiais.", "<b>Regra:</b> valide em bases cegas (AUC e KS)."],
      ["3", "Agentes especializados,", "não monolito.", "Orquestrar agentes especializados dá controle, autocorreção e governança.", "<b>Risco:</b> um agente único concentra falhas."],
    ];
    return lessons("tela49", "49", "O que ninguém conta: <em>dados e modelos</em>", cards, "Lições vindas do deck de cases da South (ago/2026).", cues, dur);
  },

  // ------------------------------------------------------------------ TELA 50 · LIÇÕES · DESENHO E EVIDÊNCIA
  tela50: ({ cues, dur }) => {
    const cards = [
      ["4", "Comece pela decisão", "e pelo prazo dela.", "Tempo real só quando a decisão perde valor em segundos.", "<b>Sinal:</b> o gargalo raramente é o modelo."],
      ["5", "Humano no loop", "por desenho.", "No N1, a IA sugere e registra no chamado; a decisão continua com a pessoa.", "<b>Regra:</b> automatizar o repetitivo, decidir com pessoas."],
      ["6", "Evidência", "tem nível.", '<i class="lv" id="tela50-l1">Provado em produção</i>, <i class="lv" id="tela50-l2">demonstrado em teste</i> ou <i class="lv" id="tela50-l3">planejado</i>.', '<b>Regra:</b> <i class="lv" id="tela50-rq">diga sempre qual é, com o número medido.</i>'],
    ];
    return lessons("tela50", "50", "O que ninguém conta: <em>desenho e evidência</em>", cards, "Lições vindas dos cases deste módulo.", cues, dur, {
      ask: "Qual destes aprendizados <em>mais faltou</em> nos projetos da sua área?",
    });
  },

  // ------------------------------------------------------------------ DECISÃO PARA LEVAR (tela cheia; o build centraliza a coluna)
  decisao: ({ cues, dur }) => {
    const inner = `
  <div class="stage" id="d-stage">
    <div class="card" id="d-card">
      <div class="kick" id="d-kick"><b>Comitê</b> A decisão deste episódio</div>
      <div class="t" id="d-t">Defina com procurement o <b>nível de evidência</b> que a empresa aceita para aprovar um projeto de IA.</div>
      <div class="chk"><span id="d-k0">produção</span><span id="d-k1">teste</span><span id="d-k2">plano</span></div>
      <div class="rfp" id="d-rfp">Escreva isso na RFP.</div>
    </div>
    <div class="card" id="d-south"><div class="t">Isso vai mudar o que os fornecedores te apresentam. <b>Inclusive a South.</b></div></div>
    <div id="d-next">
      <div class="lab" id="d-nl">Próximo episódio</div>
      <div class="ttl" id="d-nt"><b>EP09</b> A conta que o CFO vai fazer</div>
      <div class="embed" id="d-punch2">5 meses no papel.<br><em>6 anos na vida real.</em></div>
    </div>
  </div>`;
    const css = `
  #root { background: transparent; }
  #root #d-card { left: 1210px; top: 120px; width: 650px; padding: 30px 34px; transform-origin: 50% 100%; }
  #root .kick { font-size: 18px; letter-spacing: .12em; text-transform: uppercase; color: #6B6B6B; font-weight: 800; margin-bottom: 22px; }
  #root .kick b { background: #C73E00; color: #fff; padding: 6px 12px; border-radius: 6px; margin-right: 12px; letter-spacing: 0; }
  #root #d-card .t { font-size: 34px; font-weight: 700; line-height: 1.22; letter-spacing: -0.02em; color: #1A1A1A; } #root #d-card .t b { color: #C73E00; font-weight: 900; }
  #root #d-card .chk { display: flex; gap: 10px; margin-top: 24px; flex-wrap: wrap; } #root #d-card .chk span { background: #1A1A1A; color: #FF9A66; font-size: 24px; font-weight: 800; padding: 8px 18px; border-radius: 999px; }
  #root #d-card .rfp { margin-top: 20px; font-size: 30px; font-weight: 900; color: #C73E00; }
  #root #d-south { left: 1210px; top: 560px; width: 650px; padding: 28px 34px; transform-origin: 50% 100%; }
  #root #d-south .t { font-size: 32px; font-weight: 700; line-height: 1.25; color: #1A1A1A; } #root #d-south .t b { color: #C73E00; font-weight: 900; }
  #root #d-next { position: absolute; left: 1210px; top: 200px; width: 650px; }
  #root #d-next .lab { font-size: 22px; letter-spacing: .14em; text-transform: uppercase; color: rgba(255,255,255,.75); font-weight: 800; }
  #root #d-next .ttl { font-size: 54px; font-weight: 900; color: #fff; letter-spacing: -0.04em; line-height: 1.05; margin-top: 16px; } #root #d-next .ttl b { color: #FF9A66; margin-right: 14px; }
  #root #d-punch2 { position: static; margin-top: 40px; font-size: 64px; color: #fff; transform-origin: 0% 50%; } #root #d-punch2 em { font-style: normal; color: #FF9A66; }
`;
    const js = `
    hide("#d-card, #d-kick, #d-t, #d-card .chk span, #d-rfp, #d-south, #d-nl, #d-nt, #d-punch2");
    tl.set("#d-card", { opacity: 1 }, ${cues.task});
    waterfall(tl, ["#d-card", "#d-kick"], ${cues.task}, { y: 80, d: 0.22, gap: 0.1 });
    waterfall(tl, ["#d-t"], ${cues.def} + 0.3, { y: 30 });
    waterfall(tl, ["#d-k0", "#d-k1", "#d-k2"], ${cues.rfp}, { y: 20, d: 0.16, gap: 0.45 });
    waterfall(tl, ["#d-rfp"], ${cues.rfp} + 1.6, { y: 20 });
    tl.set("#d-south", { opacity: 1 }, ${cues.south} + 0.1); arrive(tl, "#d-south", ${cues.south} + 0.1);
    tl.to("#d-card, #d-south", { y: -230, duration: 0.3, ease: "power4.in" }, ${cues.next} - 0.2);
    tl.to("#d-card, #d-south", { opacity: 0, duration: 0.18, ease: "none" }, ${cues.next} - 0.2);
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

/** Telas de lições (49 e 50): três cartões numerados, linha de regra e, opcionalmente, a pergunta do deck. */
function lessons(id, num, title, cards, src, cues, dur, { ask } = {}) {
  const inner = `
  <div class="stage" id="${id}-stage">
    ${chrome(CRUMB, num)}
    <div class="eyebrow">Módulo 4 · Lições aprendidas</div>
    <h2 class="title">${title}</h2>
    <div class="trio">${cards.map((c, i) => `<div class="card les" id="${id}-c${i + 1}"><div class="no">${c[0]}</div><h4>${c[1]} <em>${c[2]}</em></h4><p>${c[3]}</p><p class="rule">${c[4]}</p></div>`).join("")}</div>
    ${ask ? `<div class="ask e8" id="${id}-ask"><span class="k">Pergunta</span><p>${ask}</p></div>` : ""}
    <div class="src">${src}</div>
  </div>`;
  const css = `${E8_CSS}
  #root .card.les { min-height: 470px; }
  #root .card.les .no { font-size: 64px; font-weight: 900; color: #E04600; letter-spacing: -0.04em; line-height: 1; }
  #root .card.les h4 { font-size: 34px; margin-top: 12px; } #root .card.les h4 em { font-style: normal; color: #C73E00; }
  #root .card.les p { font-size: 23px; }
  #root .card.les p.rule { margin-top: 16px; padding-top: 14px; border-top: 2px solid #EDEDED; color: #1A1A1A; } #root .card.les p.rule b { color: #C73E00; }
  #root .lv { font-style: normal; border-radius: 6px; padding: 0 4px; }
  #root .lv.on { background: #C73E00; color: #fff; font-weight: 700; }
  #root #${id}-ask { top: 820px; }
`;
  const c = cues;
  const levels =
    id === "tela50"
      ? `
    tl.set("#tela50-l1, #tela50-l2, #tela50-l3", { className: "lv on" }, ${c.lv} + 0.2);
    tl.set("#tela50-l1, #tela50-l2, #tela50-l3", { className: "lv" }, ${c.par});
    tl.set("#tela50-l2", { className: "lv on" }, ${c.v2} + 0.3);
    tl.set("#tela50-l2", { className: "lv" }, ${c.v3});
    tl.set("#tela50-l1", { className: "lv on" }, ${c.v3} + 0.3);
    tl.set("#tela50-l2, #tela50-l3", { className: "lv on" }, ${c.niveis} + 0.3);
    tl.set("#tela50-l2, #tela50-l3", { className: "lv" }, ${c.um});
    press(tl, "#tela50-c3", ${c.um} + 0.4);
    tl.set("#tela50-rq", { className: "lv on" }, ${c.qual} + 0.3);
    waterfall(tl, ["#tela50-ask"], ${c.mesa} + 0.4, { y: 60, d: 0.2 });`
      : "";
  const js = `
    hide(".card.les${ask ? `, #${id}-ask` : ""}");
    enterCurve(tl, "#${id}-stage", 0);
    ${[1, 2, 3].map((i) => `waterfall(tl, ["#${id}-c${i}"], ${c["c" + i]}, { y: 60, d: 0.2 }); tl.set("#${id}-c${i}", { className: "card les on" }, ${c["c" + i]});${i > 1 ? ` tl.set("#${id}-c${i - 1}", { className: "card les" }, ${c["c" + i]});` : ""}`).join("\n    ")}
    tl.set("#${id}-c3", { className: "card les" }, ${id === "tela50" ? c.par : dur - 0.5});${levels}
    exitCurve(tl, "#${id}-stage", ${dur - 0.3});`;
  return root(id, dur, inner, css) + script(id, js);
}


export const SCENES = SCENES_EP08;
