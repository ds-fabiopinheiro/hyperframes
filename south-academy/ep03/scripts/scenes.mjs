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


const SCENES_EP03 = {};

// ---------------------------------------------------------------------------------------------
// EP03 · O problema não é a ferramenta: TI e Financeiro
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


Object.assign(SCENES_EP03, {
  // ------------------------------------------------------------------ GANCHO FRIO (tela cheia: gráficos em x>=1210)
  gancho: ({ cues, dur }) => {
    const years = [["2021", 17], ["2022", 17], ["2023", 15], ["2024", 15], ["2025", 15]];
    const inner = `
  <div class="stage" id="g-stage">
    <div id="g-kicker"><b>EP03</b> O problema não é a ferramenta</div>
    <div class="card" id="g-chart">
      <div class="k">Service desk · 2021 a 2025 · contatos resolvidos por autoatendimento</div>
      ${years.map((y, i) => `<div class="hb" id="g-hb${i}"><span class="lab">${y[0]}</span><div class="tr"><div class="fi" id="g-fi${i}"></div></div><span class="v" id="g-v${i}">${y[1]}%</span></div>`).join("")}
    </div>
    <div id="g-big"><div class="n" id="g-pct">15%</div><div class="l" id="g-pctl">de autoatendimento</div><div class="chip" id="g-anos">5 anos parado</div></div>
    <div class="card ink" id="g-diag"><div class="a">Não é um problema de ferramenta.</div><div class="b">É um <em>diagnóstico</em>.</div></div>
  </div>`;
    const css = `
  #root { background: transparent; }
  #root #g-kicker { position: absolute; left: 1210px; top: 64px; font-size: 22px; color: rgba(255,255,255,.75); letter-spacing: .06em; text-transform: uppercase; font-weight: 600; }
  #root #g-kicker b { color: #fff; background: #FF5100; padding: 6px 12px; border-radius: 6px; margin-right: 14px; font-weight: 900; }
  #root #g-chart { left: 1210px; top: 150px; width: 650px; padding: 24px 28px; }
  #root #g-chart .k { font-size: 14px; letter-spacing: .12em; text-transform: uppercase; color: #6B6B6B; font-weight: 800; margin-bottom: 14px; }
  #root .hb { display: grid; grid-template-columns: 70px 1fr 64px; align-items: center; gap: 14px; margin: 10px 0; }
  #root .hb .lab { font-size: 20px; font-weight: 700; color: #1A1A1A; }
  #root .hb .tr { height: 28px; background: #EDEDED; border-radius: 6px; overflow: hidden; }
  #root .hb .fi { height: 100%; width: 100%; background: #6DA9DD; border-radius: 6px; transform-origin: 0 50%; }
  #root .hb .v { font-size: 22px; font-weight: 900; text-align: right; color: #1A1A1A; letter-spacing: -0.02em; }
  #root #g-big { position: absolute; left: 1210px; top: 500px; width: 650px; color: #fff; }
  #root #g-big .n { font-size: 150px; font-weight: 900; letter-spacing: -0.06em; line-height: .9; color: #FF5100; transform-origin: 0% 50%; }
  #root #g-big .l { font-size: 28px; font-weight: 600; color: rgba(255,255,255,.85); margin-top: 10px; }
  #root #g-big .chip { display: inline-block; margin-top: 18px; background: rgba(255,255,255,.08); border: 2px solid rgba(255,255,255,.2); color: #fff; font-size: 30px; font-weight: 800; padding: 12px 22px; border-radius: 14px; }
  #root #g-diag { left: 1210px; top: 790px; width: 650px; padding: 24px 30px; background: #1A1A1A; color: #fff; border: 2px solid rgba(255,255,255,.12); transform-origin: 0% 50%; }
  #root #g-diag .a { font-size: 26px; color: rgba(255,255,255,.8); }
  #root #g-diag .b { font-size: 44px; font-weight: 900; letter-spacing: -0.03em; margin-top: 6px; } #root #g-diag .b em { font-style: normal; color: #FF9A66; }
`;
    const js = `
    hide("#g-kicker, #g-chart, #g-big .n, #g-big .l, #g-anos, #g-diag");
    gsap.set("#g-chart .fi", { scaleX: 0 });
    tl.set("#g-kicker", { opacity: 1 }, ${cues.open});
    tl.fromTo("#g-kicker", { x: 60 }, { x: 0, duration: 0.5, ease: "power4.out", immediateRender: false }, ${cues.open});
    waterfall(tl, ["#g-chart"], ${cues.open} + 0.3, { y: 60, d: 0.2 });
    ${years.map((y, i) => `tl.to("#g-fi${i}", { scaleX: ${y[1] / 100}, duration: 0.7, ease: "power3.out" }, ${cues.open} + ${(0.7 + i * 0.22).toFixed(2)});`).join("\n    ")}
    // "quinze por cento": o número chega grande (inverse zoom); as barras de 15 acendem
    tl.set("#g-pct", { opacity: 1 }, ${cues.pct}); arrive(tl, "#g-pct", ${cues.pct}, 18);
    waterfall(tl, ["#g-pctl"], ${cues.pct} + 0.3, { y: 30 });
    tl.to("#g-fi2, #g-fi3, #g-fi4", { backgroundColor: "#FF5100", duration: 0.3 }, ${cues.pct} + 0.2);
    waterfall(tl, ["#g-anos"], ${cues.anos}, { y: 40, d: 0.2 });
    // "diagnóstico": o cartão escuro assenta embaixo
    tl.set("#g-diag", { opacity: 1 }, ${cues.diag} + 0.1); arrive(tl, "#g-diag", ${cues.diag} + 0.1);
    exitCurve(tl, "#g-kicker", ${dur - 0.3}); exitCurve(tl, "#g-chart", ${dur - 0.3}); exitCurve(tl, "#g-big", ${dur - 0.3}); exitCurve(tl, "#g-diag", ${dur - 0.3});`;
    return root("gancho", dur, inner, css) + script("gancho", js);
  },

  // ------------------------------------------------------------------ VINHETA (igual ao EP02, título do EP03)
  vinheta: ({ dur }) => {
    const inner = `
  <div class="stage" id="v-stage">
    <div id="v-bg"></div><div id="v-net"></div>
    <div id="v-group">
      <img id="v-logo" src="assets/south-logo.png" alt="South System">
      <div id="v-title"><span class="w" id="v-w0">South</span><span class="w" id="v-w1">Academy</span><span class="w" id="v-w2">Executive</span></div>
      <div id="v-sub"><span class="w" id="v-s0">Letramento de IA</span><span class="w" id="v-s1">para líderes</span></div>
      <div id="v-ep"><span class="w" id="v-e0">EP03</span><span class="w" id="v-e1">O problema não é a ferramenta</span></div>
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

  // ------------------------------------------------------------------ TELA 11 · TI
  tela11: ({ cues, dur }) => {
    const cases = [
      { badge: "IA preditiva", badgeInk: true, h: "Triagem e roteamento de chamados", g: "Classifica e encaminha mais rápido, agrupa incidentes e reduz o MTTR.", r: "Categorias consistentes, histórico limpo, base de conhecimento e integração com o ITSM.", w: "Só 28% dos casos de IA em infraestrutura e operações atingem o ROI esperado." },
      { badge: "IA generativa", h: "Agente virtual de service desk", g: "Desvia 15% a 20% dos incidentes; na Sentara Health, −20% no 1º nível e 2–3 contratações evitadas.", r: "Base de conhecimento curada e integrada ao atendimento.", w: "Até 2027, metade dos projetos de IA em service desk pode ser abandonada." },
      { badge: "Generativa agêntica", h: "Agentes de código no ciclo de software", g: "25% a 50% de produtividade até 2028; 30% a 35% menos tempo para escrever backlog.", r: "Especificação como fonte da verdade, sandbox, gateway de IA e testes automatizados.", w: "Até 2027, 40% das empresas com ferramentas por consumo gastarão mais de 2× o orçado." },
    ];
    const stats = [["15%", "r", "dos contatos de service desk são autoatendimento, estável há 5 anos"], ["80%", "g", "dos fluxos centrais de ITSM rodarão de forma autônoma até 2030"], ["30%+", "g", "do custo das plataformas de ITSM será IA em 2028 (era &lt;15% em 2025)"]];
    const inner = `
  <div class="stage" id="s11-stage">
    ${chrome("Módulo 1 · Aplicações", "11")}
    <div class="eyebrow" id="s11-eyebrow">Módulo 1 · TI</div>
    <h2 class="title" id="s11-title">TI: atender, desenvolver e <em>operar com IA</em></h2>
    ${cases.map((c, i) => caseCard("s11", i + 1, c, 96 + i * 442)).join("")}
    <div class="stats">${stats.map((s, i) => `<div class="stat" id="s11-n${i + 1}"><div class="n ${s[1]}">${s[0]}</div><div class="l">${s[2]}</div></div>`).join("")}</div>
    <div class="ask low" id="s11-ask"><span class="k">Pergunta</span><p>Quanto tempo um chamado mal classificado perde <em>até chegar ao time certo?</em></p></div>
    <div class="src">Fontes: Gartner — Critical Capabilities for AI Applications in ITSM; AI Is Rewriting Software Engineering.</div>
  </div>`;
    const css = `${CASE_CSS}
  #root .stats { left: 1420px; top: 300px; width: 404px; }
  #root .card.case { height: 500px; }
  #root #s11-title { font-size: 54px; width: 1700px; }
  #root #s11-ask { top: 818px; width: 1290px; }
  #root .card.case .warn.on { background: #FF5100; color: #fff; } #root .card.case .warn.on b { color: #fff; }
`;
    const js = `
    hide(".card, .warn, .stat, #s11-ask");
    enterCurve(tl, "#s11-stage", 0);
    ${[1, 2, 3].map((i) => `waterfall(tl, ["#s11-c${i}"], ${cues["c" + i]}, { y: 70, d: 0.2 }); waterfall(tl, ["#s11-w${i}"], ${cues["w" + i]}, { y: 24, d: 0.16 });`).join("\n    ")}
    // "preço por token": o alerta do terceiro cartão acende
    tl.set("#s11-w3", { className: "warn on" }, ${cues.token}); press(tl, "#s11-w3", ${cues.token});
    ${[1, 2, 3].map((i) => `waterfall(tl, ["#s11-n${i}"], ${cues["n" + i]}, { y: 50, d: 0.2 });`).join(" ")}
    waterfall(tl, ["#s11-ask"], ${cues.n3} + 1.4, { y: 60, d: 0.2 });
    exitCurve(tl, "#s11-stage", ${dur - 0.3});`;
    return root("tela11", dur, inner, css) + script("tela11", js);
  },

  // ------------------------------------------------------------------ TELA 12 · FINANCEIRO
  tela12: ({ cues, dur }) => {
    const cases = [
      { badge: "IA preditiva", badgeInk: true, h: "Previsão de caixa e cenários", g: "Acurácia de 11% a 23% maior em casos reais; cenários para liquidez e orçamento.", r: "Histórico financeiro e operacional confiável, indicadores externos e ciclo de feedback.", w: "Há resistência a confiar na IA em decisões críticas de liquidez." },
      { badge: "Documentos + generativa", h: "Contas a pagar e conciliações", g: "Faturas e exceções processadas com menos erro; um “ganho provável” para a Gartner.", r: "Integração com o ERP e dados de fornecedor para cruzar fatura, pedido e recebimento.", w: "Formatos fora do padrão reduzem a acurácia; mantenha o ajuste manual." },
      { badge: "Preditiva + generativa", h: "Fechamento e anomalias contábeis", g: "Classifica lançamentos e acha anomalias; ~US$ 742 mil/ano numa empresa de tecnologia típica.", r: "Razão e subledgers integrados e trilha de auditoria imutável.", w: "Nada de lançamento autônomo: caixa-preta não passa em auditoria." },
    ];
    const stats = [["58%", "g", "das equipes de finanças já usam IA em casos específicos"], ["83%", "r", "dos CFOs: menos da metade das iniciativas gera resultado mensurável"], ["62%", "r", "das áreas de finanças não têm processo para escolher casos de uso"]];
    const inner = `
  <div class="stage" id="s12-stage">
    ${chrome("Módulo 1 · Aplicações", "12")}
    <div class="eyebrow" id="s12-eyebrow">Módulo 1 · Financeiro</div>
    <h2 class="title" id="s12-title">Financeiro: prever melhor, <em>fechar com menos esforço</em></h2>
    ${cases.map((c, i) => caseCard("s12", i + 1, c, 96 + i * 442)).join("")}
    <div class="stats">${stats.map((s, i) => `<div class="stat" id="s12-n${i + 1}"><div class="n ${s[1]}">${s[0]}</div><div class="l">${s[2]}</div></div>`).join("")}</div>
    <div class="card" id="s12-quote">
      <div class="q" id="s12-q1">O auditor externo vai perguntar: <b>“quem aprovou este lançamento e por quê”</b>.</div>
      <div class="q" id="s12-q2">Se a resposta for “o modelo”, <b>a conversa acabou.</b></div>
    </div>
    <div class="embed" id="s12-embed">Caixa-preta<br><em>não passa em auditoria.</em></div>
    <div class="card ink" id="s12-cet"><div class="n">83%</div><div class="t">dos CFOs não estão céticos com IA. Estão céticos com a forma como a IA foi <em id="s12-esc">escolhida</em>.</div></div>
    <div class="ask low" id="s12-ask"><span class="k">Pergunta</span><p>Qual relatório ou conciliação <em>consome mais horas do time</em> todo mês?</p></div>
    <div class="src">Fontes: Gartner — Top Insights on AI for CFOs; Target High-Impact Use Cases With the Finance AI Opportunity Radar.</div>
  </div>`;
    const css = `${CASE_CSS}
  #root .stats { left: 1420px; top: 300px; width: 404px; }
  #root .card.case { height: 500px; }
  #root #s12-title { font-size: 54px; width: 1700px; }
  #root #s12-ask { top: 818px; width: 1290px; }
  #root .card.case .warn.on { background: #FF5100; color: #fff; } #root .card.case .warn.on b { color: #fff; }
  #root #s12-quote { left: 96px; top: 300px; width: 1300px; height: 500px; padding: 50px 54px; border-left: 12px solid #FF5100; transform-origin: 0% 50%; }
  #root #s12-quote .q { font-size: 44px; font-weight: 700; letter-spacing: -0.03em; line-height: 1.2; margin-bottom: 36px; } #root #s12-quote .q b { color: #FF5100; font-weight: 900; }
  #root #s12-embed { left: 96px; top: 330px; width: 1300px; font-size: 118px; color: #1A1A1A; transform-origin: 0% 50%; } #root #s12-embed em { font-style: normal; color: #FF5100; }
  #root #s12-cet { left: 96px; top: 300px; width: 1300px; padding: 40px 48px; background: #1A1A1A; color: #fff; transform-origin: 0% 50%; display: flex; gap: 40px; align-items: center; }
  #root #s12-cet .n { font-size: 150px; font-weight: 900; letter-spacing: -0.06em; line-height: .9; color: #FF9A66; }
  #root #s12-cet .t { font-size: 40px; font-weight: 700; line-height: 1.2; letter-spacing: -0.02em; } #root #s12-cet .t em { font-style: normal; color: #FF9A66; }
`;
    const js = `
    hide(".card, .warn, .stat, #s12-q1, #s12-q2, #s12-embed, #s12-ask, #s12-cet");
    enterCurve(tl, "#s12-stage", 0);
    ${[1, 2].map((i) => `waterfall(tl, ["#s12-c${i}"], ${cues["c" + i]}, { y: 70, d: 0.2 }); waterfall(tl, ["#s12-w${i}"], ${cues["w" + i]}, { y: 24, d: 0.16 });`).join("\n    ")}
    waterfall(tl, ["#s12-c3"], ${cues.c3}, { y: 70, d: 0.2 });
    // "nada de lançamento autônomo": o alerta do terceiro cartão acende
    waterfall(tl, ["#s12-w3"], ${cues.auto}, { y: 24, d: 0.16 }); tl.set("#s12-w3", { className: "warn on" }, ${cues.auto} + 0.3);
    // o auditor pergunta: os cartões recuam, a citação chega; depois o embed
    tl.to("#s12-c1, #s12-c2, #s12-c3", { scale: 0.85, opacity: 0, filter: "blur(10px)", duration: 0.25, ease: "power3.in" }, ${cues.auditor});
    tl.set("#s12-quote", { opacity: 1 }, ${cues.auditor} + 0.2); arrive(tl, "#s12-quote", ${cues.auditor} + 0.2);
    waterfall(tl, ["#s12-q1"], ${cues.auditor} + 0.5, { y: 40 });
    waterfall(tl, ["#s12-q2"], ${cues.modelo}, { y: 40 });
    tl.to("#s12-quote", { scale: 0.85, opacity: 0, filter: "blur(10px)", duration: 0.25, ease: "power3.in" }, ${cues.caixa} - 0.05);
    tl.set("#s12-embed", { opacity: 1 }, ${cues.caixa} + 0.2); arrive(tl, "#s12-embed", ${cues.caixa} + 0.2, 18);
    // números: o embed sai pela esquerda, os cartões voltam e as estatísticas entram
    exitCurve(tl, "#s12-embed", ${cues.n1} - 0.1);
    tl.set("#s12-c1, #s12-c2, #s12-c3", { scale: 1, filter: "blur(0px)" }, ${cues.n1});
    tl.to("#s12-c1, #s12-c2, #s12-c3", { opacity: 1, duration: 0.3 }, ${cues.n1});
    ${[1, 2, 3].map((i) => `waterfall(tl, ["#s12-n${i}"], ${cues["n" + i]}, { y: 50, d: 0.2 });`).join(" ")}
    // "não estão céticos com IA": quadro escuro cobre os cartões; "escolhida" acende; a pergunta fecha
    tl.to("#s12-c1, #s12-c2, #s12-c3", { opacity: 0, duration: 0.2 }, ${cues.ceticos});
    tl.set("#s12-cet", { opacity: 1 }, ${cues.ceticos} + 0.1); arrive(tl, "#s12-cet", ${cues.ceticos} + 0.1);
    tl.fromTo("#s12-esc", { color: "#fff" }, { color: "#FF9A66", duration: 0.3, immediateRender: false }, ${cues.escolhida});
    waterfall(tl, ["#s12-ask"], ${cues.mod3}, { y: 60, d: 0.2 });
    exitCurve(tl, "#s12-stage", ${dur - 0.3});`;
    return root("tela12", dur, inner, css) + script("tela12", js);
  },

  // ------------------------------------------------------------------ DECISÃO PARA LEVAR (tela cheia: gráficos em x>=1210)
  decisao: ({ cues, dur }) => {
    const areas = ["Comercial", "Marketing", "TI", "Financeiro", "Jurídico", "RH", "CS"];
    const inner = `
  <div class="stage" id="d-stage">
    <div class="card" id="d-card">
      <div class="kick" id="d-kick"><b>Comitê</b> Para levar ao próximo comitê</div>
      <div class="q" id="d-q">Qual é o processo de <b>maior volume com regra clara</b> da sua área que ainda não tem IA?</div>
      <div class="lab" id="d-lab">A resposta para “por onde começar”, em qualquer uma das sete áreas:</div>
      <div id="d-areas">${areas.map((a, i) => `<span class="chip" id="d-a${i}">${a}</span>`).join("")}</div>
    </div>
    <div class="card" id="d-south">
      <div class="kick"><b>South</b> onde a South entra</div>
      <div class="t">A primeira entrega <b>não é o modelo</b>.</div>
      <div class="step" id="d-s1"><span>1</span><div>Base de conhecimento <b>curada</b></div></div>
      <div class="step" id="d-s2"><span>2</span><div><b>Trilha de auditoria</b></div></div>
      <div class="step" id="d-s3"><span>3</span><div>O modelo, depois: a parte <b>mais rápida</b></div></div>
    </div>
    <div id="d-next">
      <div class="lab" id="d-nl">Próximo episódio</div>
      <div class="ttl" id="d-nt"><b>EP04</b> Jurídico, Pessoas e Atendimento</div>
      <div class="embed" id="d-punch2">Onde a IA ajuda.<br><em>Onde ela não deve decidir.</em></div>
    </div>
  </div>`;
    const css = `
  #root { background: transparent; }
  #root #d-card, #root #d-south { left: 1210px; top: 120px; width: 650px; padding: 30px 34px; transform-origin: 50% 100%; }
  #root .kick { font-size: 18px; letter-spacing: .12em; text-transform: uppercase; color: #6B6B6B; font-weight: 800; margin-bottom: 22px; }
  #root .kick b { background: #C73E00; color: #fff; padding: 6px 12px; border-radius: 6px; margin-right: 12px; letter-spacing: 0; }
  #root #d-card .q { font-size: 34px; font-weight: 700; line-height: 1.2; letter-spacing: -0.02em; color: #1A1A1A; } #root #d-card .q b { color: #C73E00; font-weight: 900; }
  #root #d-card .lab { font-size: 22px; color: #4A4A4A; line-height: 1.3; margin-top: 26px; }
  #root #d-areas { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 16px; }
  #root #d-areas .chip { display: inline-block; background: #FFEEE6; border: 2px solid #FF9A66; color: #1A1A1A; font-size: 20px; font-weight: 700; padding: 8px 16px; border-radius: 999px; }
  #root #d-south .t { font-size: 30px; line-height: 1.25; color: #1A1A1A; margin-bottom: 22px; } #root #d-south .t b { color: #C73E00; font-weight: 900; }
  #root .step { display: flex; gap: 14px; align-items: center; font-size: 26px; line-height: 1.3; margin-bottom: 16px; color: #1A1A1A; }
  #root .step span { flex: none; width: 38px; height: 38px; border-radius: 50%; background: #1A1A1A; color: #fff; display: grid; place-items: center; font-weight: 900; font-size: 19px; }
  #root .step b { color: #C73E00; font-weight: 900; }
  #root #d-next { position: absolute; left: 1210px; top: 200px; width: 650px; }
  #root #d-next .lab { font-size: 22px; letter-spacing: .14em; text-transform: uppercase; color: rgba(255,255,255,.7); font-weight: 800; margin: 0; }
  #root #d-next .ttl { font-size: 54px; font-weight: 900; color: #fff; letter-spacing: -0.04em; line-height: 1.05; margin-top: 16px; } #root #d-next .ttl b { color: #FF5100; margin-right: 14px; }
  #root #d-punch2 { position: static; margin-top: 44px; font-size: 64px; color: #fff; transform-origin: 0% 50%; } #root #d-punch2 em { font-style: normal; color: #FF5100; }
`;
    const js = `
    hide("#d-card, #d-kick, #d-q, #d-lab, #d-areas .chip, #d-south, #d-s1, #d-s2, #d-s3, #d-next .lab, #d-next .ttl, #d-punch2");
    tl.set("#d-card", { opacity: 1 }, ${cues.task});
    waterfall(tl, ["#d-card", "#d-kick"], ${cues.task}, { y: 80, d: 0.22, gap: 0.1 });
    waterfall(tl, ["#d-q"], ${cues.question}, { y: 40, d: 0.2 });
    waterfall(tl, ["#d-lab"], ${cues.sete}, { y: 30 });
    waterfall(tl, [${areas.map((_, i) => `"#d-a${i}"`).join(", ")}], ${cues.sete} + 0.3, { y: 30, d: 0.14, gap: 0.07 });
    // South: o cartão do comitê sai pela esquerda e o cartão South chega
    exitCurve(tl, "#d-card", ${cues.south});
    tl.set("#d-south", { opacity: 1 }, ${cues.south} + 0.15); enterCurve(tl, "#d-south", ${cues.south} + 0.15);
    waterfall(tl, ["#d-s1", "#d-s2"], ${cues.base}, { y: 40, d: 0.2, gap: 0.3 });
    waterfall(tl, ["#d-s3"], ${cues.modelo}, { y: 40, d: 0.2 });
    // próximo episódio: sobe e sai (elevação), teaser chega
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
const SD = "AI Use-Case Assessment for IT Service Desk";
const RM = "2027 Strategic Roadmap for IT Service Management";
const AR = "AI Use Case Assessment for Accounting and Reporting, Tax & IR";
const BA = "AI Use Case Assessment for Business Analytics and Decision Support";
const FIGS = {
  tela11a: { num: "11A", eyebrow: "Módulo 1 · TI · <b>Gartner</b>", title: "Service desk: <em>valor × viabilidade</em>", img: "fig-11a.webp", iw: 1274, ih: 1212,
    desc: "Casos de IA no service desk posicionados por valor e viabilidade.",
    insights: ["<b>Ganhos prováveis:</b> agente virtual, triagem e roteamento inteligente, resumo de chamados, detecção de incidentes graves.", "<b>Riscos calculados:</b> geração de conhecimento de TI e escalonamento inteligente.", "<b>Ganhos marginais:</b> otimização de processos e análise de sentimento."],
    key: "Triagem e resumo de chamados são ganho provável: é o nosso Case 2.",
    src: SD, zooms: { likely: [0.42, 0.08, 0.40, 0.55], case2: [0.42, 0.33, 0.36, 0.2] } },
  tela11b: { num: "11B", eyebrow: "Módulo 1 · TI · <b>Gartner</b>", title: "Service desk: <em>scorecard de casos de uso</em>", img: "fig-11b.webp", iw: 1279, ih: 1441,
    desc: "A nota de cada caso do service desk em valor (custo, eficiência, engajamento) e viabilidade (técnica, prontidão, oferta de produto).",
    insights: ["Círculo maior = nota mais alta.", "<b>Agente virtual</b> e <b>assistente de operações</b> pontuam alto em valor e em disponibilidade de produto.", "Casos com baixa prontidão organizacional pedem preparo antes."],
    key: "Viabilidade não é só técnica: a organização também precisa estar pronta.",
    src: SD, zooms: { col: [0.60, 0.04, 0.26, 0.46], usa: [0.50, 0.04, 0.38, 0.5] } },
  tela11c: { num: "11C", eyebrow: "Módulo 1 · TI · <b>Gartner</b>", title: "Service desk: <em>pipeline de casos de uso</em>", img: "fig-11c.webp", iw: 1278, ih: 1443,
    desc: "Em que estágio cada caso do service desk atua: dar contexto, recomendar ou agir.",
    insights: ["Parte dos casos só dá contexto ou recomenda; outros já executam ações.", "Quanto mais perto de “agir”, mais controle e revisão são necessários.", "<b>Comece por contexto e recomendação.</b>"],
    key: "Primeiro a IA sugere; depois, com confiança, ela age.",
    src: SD, zooms: { cols: [0.22, 0.02, 0.78, 0.14], agir: [0.68, 0.02, 0.32, 0.5] } },
  tela11d: { num: "11D", eyebrow: "Módulo 1 · TI · <b>Gartner</b>", title: "Contatos no service desk: <em>atendidos × autoatendimento</em>", img: "fig-11d.webp", iw: 1800, ih: 1080,
    desc: "Contatos no service desk de 2021 a 2025: atendidos por pessoas × resolvidos por autoatendimento.",
    insights: ["O autoatendimento ficou entre <b>15% e 17%</b> por cinco anos.", "Ter chatbot não bastou para mudar esse número.", "<b>Base de conhecimento curada</b> é o pré-requisito."],
    key: "Ferramenta sem conteúdo bom não muda o resultado.",
    src: RM, zooms: { bars: [0.58, 0.16, 0.28, 0.6], le: "fig" },
    extra: `<div class="embed" id="s11d-embed">Ferramenta sem base curada<br><em>não move indicador.</em></div>` },
  tela11e: { num: "11E", eyebrow: "Módulo 1 · TI · <b>Gartner</b>", title: "Capacidades futuras do <em>analista de service desk</em>", img: "fig-11e.webp", iw: 1800, ih: 1079,
    desc: "As capacidades futuras do analista de service desk com IA.",
    insights: ["Novos papéis: geração de conhecimento, engenharia de prompt, automação de fluxos, construção de agentes.", "<b>Posição Gartner:</b> o cargo muda muito, mas o valor do trabalho permanece.", "A recomendação é redesenhar funções e requalificar."],
    key: "Planeje requalificação, não só redução de equipe.",
    src: RM, zooms: { circle: [0.08, 0.18, 0.44, 0.66], position: [0.55, 0.16, 0.40, 0.66] } },
  tela11f: { num: "11F", eyebrow: "Módulo 1 · TI · <b>Gartner</b>", title: "IA transforma responsabilidades e fluxos: <em>níveis L1 a L5</em>", img: "fig-11f.webp", iw: 1800, ih: 1079,
    desc: "Os cinco níveis de autonomia da IA no trabalho, do assistente estático (L1) aos ambientes com vários agentes (L5).",
    insights: ["A cada nível, a IA assume mais tarefas e a pessoa passa de executora a <b>supervisora</b>.", "L3 e L4: a IA resolve rotinas e a pessoa cuida de exceções.", "Avance de nível conforme maturidade e controle."],
    key: "Autonomia é conquistada por etapas, não comprada pronta.",
    src: RM, zooms: { l1: [0.03, 0.40, 0.26, 0.46], l5: [0.72, 0.08, 0.28, 0.5], etapa: "fig" } },
  tela11g: { num: "11G", eyebrow: "Módulo 1 · TI · <b>Gartner</b>", title: "Lacuna de adoção de IA em <em>infraestrutura e operações</em>", img: "fig-11g.webp", iw: 1800, ih: 1415,
    desc: "Casos de IA em infraestrutura e operações por valor e viabilidade, com o estágio real de adoção.",
    insights: ["<b>Ganhos prováveis:</b> correlação de eventos, automação de fluxos, otimização de custos, previsão de capacidade.", "A cor mostra se o caso está implantado, em piloto avançado ou travado.", "Vários ganhos prováveis ainda estão <b>parados no planejamento</b>."],
    key: "Saber o que vale a pena não basta: é preciso executar.",
    src: "AI Use Case — Technology Adoption Gap Matrix for Infrastructure and Operations", zooms: { orange: [0.33, 0.07, 0.36, 0.34], exec: "fig" } },
  tela12a: { num: "12A", eyebrow: "Módulo 1 · Financeiro · <b>Gartner</b>", title: "Contabilidade, reporte, impostos e RI: <em>valor × viabilidade</em>", img: "fig-12a.webp", iw: 1769, ih: 1057,
    desc: "Casos de IA em contabilidade, reporte, impostos e relações com investidores por valor e viabilidade.",
    insights: ["<b>Ganhos prováveis:</b> detecção de anomalias e erros, conciliações, testes SOX e notificações fiscais.", "<b>Risco calculado:</b> análise de relações com investidores.", "<b>Ganhos marginais:</b> sugestão de lançamentos e relatórios de auditoria."],
    key: "Comece por conciliações e anomalias: alto volume e regra clara.",
    src: AR, zooms: { likely: [0.48, 0.10, 0.28, 0.52], comece: [0.52, 0.18, 0.24, 0.32] } },
  tela12b: { num: "12B", eyebrow: "Módulo 1 · Financeiro · <b>Gartner</b>", title: "Contabilidade, reporte, impostos e RI: <em>scorecard</em>", img: "fig-12b.webp", iw: 1777, ih: 1057,
    desc: "A nota de cada caso contábil em valor (receita, eficiência, risco) e viabilidade (técnica, interna, externa).",
    insights: ["<b>Conciliações</b> e <b>testes SOX</b> têm alta viabilidade técnica e interna.", "Detecção de anomalias se destaca na redução de risco.", "Quase nenhum caso gera receita: o ganho é <b>eficiência e controle</b>."],
    key: "Em finanças, o primeiro retorno costuma vir de risco e eficiência.",
    src: AR, zooms: { col: [0.27, 0.18, 0.18, 0.62], risco: [0.36, 0.18, 0.34, 0.62] } },
  tela12c: { num: "12C", eyebrow: "Módulo 1 · Financeiro · <b>Gartner</b>", title: "Planejamento, orçamento e previsão: <em>valor × viabilidade</em>", img: "fig-12c.webp", iw: 1800, ih: 1507,
    desc: "Casos de IA em planejamento, orçamento e previsão por valor e viabilidade.",
    insights: ["<b>Ganhos prováveis:</b> análise de gastos e previsão automatizada de rotina.", "<b>Riscos calculados:</b> geração de cenários, previsão de caixa, análise de churn e resumos de orçamento.", "Churn é alto valor, mas pede <b>preparo de dados</b>."],
    key: "É a lição da dinâmica de retenção: churn sem dado pronto engana.",
    src: "AI Use Case Assessment for Financial Planning, Budgeting and Forecasting", zooms: { churn: [0.16, 0.20, 0.34, 0.28] } },
  tela12d: { num: "12D", eyebrow: "Módulo 1 · Financeiro · <b>Gartner</b>", title: "Analytics e apoio à decisão: <em>scorecard</em>", img: "fig-12d.webp", iw: 1769, ih: 1058,
    desc: "A nota dos casos de analytics e apoio à decisão em valor e viabilidade.",
    insights: ["<b>Segmentação de clientes</b> e <b>análise aumentada</b> pontuam bem em receita e eficiência.", "<b>Precificação dinâmica</b> tem alto valor e risco de gestão maior.", "Visualização e análise diagnóstica têm valor menor."],
    key: "Dados de clientes bem organizados destravam os casos de maior valor.",
    src: BA, zooms: {} },
  tela12e: { num: "12E", eyebrow: "Módulo 1 · Financeiro · <b>Gartner</b>", title: "Analytics e apoio à decisão: <em>valor × viabilidade</em>", img: "fig-12e.webp", iw: 1769, ih: 1056,
    desc: "Casos de analytics e apoio à decisão por valor e viabilidade.",
    insights: ["<b>Ganho provável:</b> segmentação de clientes.", "<b>Riscos calculados:</b> análise aumentada, precificação dinâmica, painéis e dados sintéticos.", "<b>Ganho marginal:</b> análise diagnóstica e comentários."],
    key: "Para uma carteira de clientes, segmentação é o ponto de partida.",
    src: BA, zooms: { seg: [0.44, 0.34, 0.32, 0.3] } },
  tela12f: { num: "12F", eyebrow: "Módulo 1 · Financeiro · <b>Gartner</b> · corte opcional", title: "Como ler <em>exemplos reais de IA em empresas</em>", img: "fig-12f.webp", iw: 1800, ih: 1125,
    desc: "O formato que a Gartner usa para apresentar exemplos reais de IA em empresas.",
    insights: ["<b>Objetivo:</b> entender a motivação de cada caso.", "<b>Solução:</b> avaliar viabilidade e buscar inspiração.", "<b>Resultados:</b> comparar e calibrar expectativas."],
    key: "Use objetivo, solução e resultado para levar um caso ao comitê.",
    src: "Real-World Finance AI Use Case Company Examples", zooms: {} },
  tela12g: { num: "12G", eyebrow: "Módulo 1 · Financeiro · <b>Gartner</b>", title: "Fluxos de trabalho <em>com IA em finanças</em>", img: "fig-12g.webp", iw: 1800, ih: 1128,
    desc: "Os fluxos de trabalho de finanças onde a IA já tem casos comuns.",
    insights: ["Cinco frentes: analytics, planejamento, processos transacionais, contabilidade e casos multiuso.", "Exemplos: agentes de contas a pagar e a receber, conciliações, previsão de caixa, chatbots de conhecimento.", "A lista ajuda a mapear oportunidades por área."],
    key: "Comece pelos processos transacionais: muito volume, regra clara.",
    src: "CFO’s Guide to Finance AI Use Cases", zooms: { trans: [0.40, 0.12, 0.24, 0.64] } },
};
for (const [id, cfg] of Object.entries(FIGS)) {
  const base = figScene(id, cfg);
  SCENES_EP03[id] = (ctx) => {
    const { inner, css, js } = base(ctx);
    const { cues, dur } = ctx;
    if (id === "tela11d") {
      // parábola do banco: a figura recua, o cartão da história chega; "o que ela lê" devolve a figura; embed no fim
      const extraCss = `
  #root #s11d-quote { left: 96px; top: 290px; width: 1110px; height: 710px; padding: 40px 46px; border-left: 12px solid #FF5100; transform-origin: 0% 50%; }
  #root #s11d-quote .q { font-size: 40px; font-weight: 700; letter-spacing: -0.03em; line-height: 1.15; } #root #s11d-quote .q b { color: #FF5100; font-weight: 900; }
  #root #s11d-quote .row { display: flex; gap: 12px; margin-top: 22px; flex-wrap: wrap; }
  #root #s11d-quote .chip { background: #F1F1F1; border-radius: 999px; padding: 8px 18px; font-size: 22px; font-weight: 700; color: #1A1A1A; }
  #root #s11d-quote .l { font-size: 30px; font-weight: 700; margin-top: 22px; color: #1A1A1A; } #root #s11d-quote .l b { color: #C73E00; font-weight: 900; }
  #root #s11d-quote .l.big { font-size: 40px; }
  #root #s11d-embed { left: 96px; top: 290px; width: 1110px; height: 710px; font-size: 96px; color: #fff; text-align: center; padding-top: 220px; transform-origin: 50% 50%; } #root #s11d-embed em { font-style: normal; color: #FF9A66; }
`;
      const extraJs = `
    hide("#s11d-quote, #s11d-quote .q, #s11d-quote .row, #s11d-quote .l, #s11d-embed");
    tl.to("#tela11d-fig", { scale: 0.8, opacity: 0.15, filter: "blur(10px)", duration: 0.25, ease: "power3.in" }, ${cues.parabola});
    tl.set("#tela11d-fig", { opacity: 0 }, ${cues.parabola} + 0.25);
    tl.set("#s11d-quote", { opacity: 1 }, ${cues.parabola} + 0.2); arrive(tl, "#s11d-quote", ${cues.parabola} + 0.2);
    waterfall(tl, ["#s11d-q1"], ${cues.parabola} + 0.5, { y: 40 });
    waterfall(tl, ["#s11d-n0", "#s11d-n1", "#s11d-n2"], ${cues.novo}, { y: 30, d: 0.16, gap: 0.14 });
    waterfall(tl, ["#s11d-l1"], ${cues.lugar}, { y: 40 });
    waterfall(tl, ["#s11d-l2"], ${cues.base}, { y: 40 });
    waterfall(tl, ["#s11d-l3"], ${cues.metade}, { y: 40 });
    waterfall(tl, ["#s11d-l4"], ${cues.desligado}, { y: 40 });
    // "a IA responde com o que ela lê": a história sai, a figura volta inteira
    tl.to("#s11d-quote", { scale: 0.8, opacity: 0, filter: "blur(10px)", duration: 0.25, ease: "power3.in" }, ${cues.le} - 0.05);
    tl.set("#tela11d-fig", { scale: 1, opacity: 1, filter: "blur(0px)" }, ${cues.le} + 0.2);
    tl.fromTo("#tela11d-fig", { opacity: 0.15, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.4, ease: "expo.out", immediateRender: false }, ${cues.le} + 0.2);
    tl.to("#tela11d-fig", { filter: "brightness(0.25)", duration: 0.4 }, ${cues.embed});
    tl.set("#s11d-embed", { opacity: 1 }, ${cues.embed} + 0.1); arrive(tl, "#s11d-embed", ${cues.embed} + 0.1, 18);`;
      const quote = `
    <div class="card" id="s11d-quote">
      <div class="q" id="s11d-q1">Um banco trocou de chatbot <b>três vezes em quatro anos.</b></div>
      <div class="row" id="s11d-row"><span class="chip" id="s11d-n0">fornecedor novo</span><span class="chip" id="s11d-n1">modelo novo</span><span class="chip" id="s11d-n2">contrato novo</span></div>
      <div class="l" id="s11d-l1">O indicador <b>nunca saiu do lugar.</b></div>
      <div class="l" id="s11d-l2">Na quarta vez, alguém abriu a <b>base de conhecimento</b>.</div>
      <div class="l big" id="s11d-l3"><b>Metade dos artigos</b> tinha mais de três anos.</div>
      <div class="l" id="s11d-l4">Um deles ensinava a configurar um sistema que a empresa <b>tinha desligado</b>.</div>
    </div>`;
      return root(id, dur, inner.replace("\n  </div>", quote + "\n  </div>"), css + extraCss) + script(id, js + extraJs);
    }
    return root(id, dur, inner, css) + script(id, js);
  };
}

export const SCENES = SCENES_EP03;
