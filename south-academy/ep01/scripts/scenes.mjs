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

export const SCENES = {
  // ------------------------------------------------------------------ GANCHO FRIO
  gancho: ({ cues, dur, beats }) => {
    const b = Object.fromEntries(beats.map((x) => [x.cue, x]));
    const chips = ["Modelo de crédito", "Antifraude", "Chatbot", "Copiloto no time de TI"];
    const inner = `
  <div class="stage" id="g-stage">
    <div id="g-kicker"><b>EP01</b> O paradoxo de quem já usa IA</div>
    <div id="g-chips">${chips.map((c, i) => `<div class="chip" id="g-chip-${i}"><i></i>${c}</div>`).join("")}</div>
    <div class="embed" id="g-embed">quanto disso<br><em>apareceu no balanço?</em></div>
  </div>`;
    const css = `
  #root { background: transparent; }
  #root #g-kicker { position: absolute; left: 1210px; top: 64px; font-size: 24px; color: rgba(255,255,255,.75); letter-spacing: .06em; text-transform: uppercase; font-weight: 600; }
  #root #g-kicker b { color: #fff; background: #FF5100; padding: 6px 12px; border-radius: 6px; margin-right: 14px; font-weight: 900; }
  #root #g-chips { position: absolute; left: 1230px; top: 300px; display: flex; flex-direction: column; gap: 22px; }
  #root .chip { display: flex; align-items: center; gap: 16px; background: rgba(255,255,255,.08); border: 2px solid rgba(255,255,255,.18); color: #fff; font-size: 34px; font-weight: 700; padding: 18px 28px; border-radius: 16px; width: 560px; }
  #root .chip i { width: 14px; height: 14px; border-radius: 50%; background: #FF5100; flex: none; }
  #root #g-embed { left: 1180px; top: 330px; width: 700px; font-size: 92px; color: #fff; }
  #root #g-embed em { font-style: normal; color: #FF5100; }
`;
    const js = `
    hide("#g-kicker, .chip, #g-embed");
    gsap.set("#g-embed", { transformOrigin: "0% 50%" });
    // kicker entra pela corrente (esquerda → chega)
    tl.set("#g-kicker", { opacity: 1 }, ${cues.open});
    tl.fromTo("#g-kicker", { x: -60 }, { x: 0, duration: 0.5, ease: "power4.out", immediateRender: false }, ${cues.open});
    // chips: cascata durante a enumeração (${b.chips.dur}s de fala)
    ${chips
      .map(
        (
          _,
          i,
        ) => `tl.set("#g-chip-${i}", { opacity: 1 }, ${cues.chips} + ${(0.15 + (i * (b.chips.dur - 0.6)) / 3).toFixed(2)});
    tl.fromTo("#g-chip-${i}", { y: 60, x: 0 }, { y: 0, duration: 0.18, ease: "power4.out", immediateRender: false }, ${cues.chips} + ${(0.15 + (i * (b.chips.dur - 0.6)) / 3).toFixed(2)});`,
      )
      .join("\n    ")}
    // "não vou te explicar": os chips saem pela esquerda, em cascata
    ${chips.map((_, i) => `exitCurve(tl, "#g-chip-${i}", ${cues.clear} + ${(i * 0.05).toFixed(2)});`).join("\n    ")}
    // embed (pico escasso do gancho): chegada inverse-zoom
    tl.set("#g-embed", { opacity: 1 }, ${cues.embed});
    arrive(tl, "#g-embed", ${cues.embed});
    // saída para a vinheta (fronteira de capítulo): tudo sai pela esquerda
    exitCurve(tl, "#g-kicker", ${dur - 0.3});
    exitCurve(tl, "#g-embed", ${dur - 0.3});`;
    return root("gancho", dur, inner, css) + script("gancho", js);
  },

  // ------------------------------------------------------------------ VINHETA
  vinheta: ({ dur }) => {
    const inner = `
  <div class="stage" id="v-stage">
    <div id="v-bg"></div>
    <div id="v-net"></div>
    <div id="v-group">
      <img id="v-logo" src="assets/south-logo.png" alt="South System">
      <div id="v-title"><span class="w" id="v-w0">South</span><span class="w" id="v-w1">Academy</span><span class="w" id="v-w2">Executive</span></div>
      <div id="v-sub"><span class="w" id="v-s0">Letramento de IA</span><span class="w" id="v-s1">para líderes</span></div>
      <div id="v-ep"><span class="w" id="v-e0">EP01</span><span class="w" id="v-e1">O paradoxo de quem já usa IA</span></div>
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
    // entrada da vinheta: corrente (logo chega pela direita, mid-flight) + impacto
    tl.set("#v-logo", { opacity: 1 }, 0);
    tl.fromTo("#v-logo", { x: 230, opacity: 0.35 }, { x: 0, opacity: 1, duration: 0.34, ease: "power4.out", immediateRender: false }, 0);
    // cascata (waterfall entry): pesos diferentes por elemento
    waterfall(tl, ["#v-w0", "#v-w1", "#v-w2"], 0.55, { y: 80, d: 0.2, gap: 0.09 });
    waterfall(tl, ["#v-s0", "#v-s1"], 0.95, { y: 46, d: 0.15, gap: 0.06 });
    waterfall(tl, ["#v-e0", "#v-e1"], 1.3, { y: 40, d: 0.13, gap: 0.05 });
    // saída: zoom-through (push) — a capa entra crescendo (mesmo sinal de escala)
    exitPush(tl, "#v-group", ${dur - 0.22}, 18, 1.2);`;
    return root("vinheta", dur, inner, css) + script("vinheta", js);
  },

  // ------------------------------------------------------------------ TELA 01 · CAPA
  tela01: ({ cues, dur }) => {
    const inner = `
  <div class="stage" id="s1-stage">
    <div id="s1-bg"></div>
    <div id="s1-net"></div>
    ${chrome("Abertura", "01", true)}
    <div id="s1-cover">
      <div class="eyebrow light" id="s1-eyebrow">Treinamento in company · <b>Letramento de IA</b></div>
      <div class="eyebrow light" id="s1-academy">South Academy Executive</div>
      <h1 id="s1-title"><span class="w" id="s1-t0">Letramento</span><span class="w" id="s1-t1">de IA</span><span class="w" id="s1-t2">para</span><span class="w" id="s1-t3"><em>líderes.</em></span></h1>
      <p id="s1-sub">Aplicações, priorização e retorno: reconhecer uma boa oportunidade de IA, julgar se ela é viável e provar que gerou valor.</p>
    </div>
    <div id="s1-tese">
      <div class="tl" id="s1-l0">A tese da série cabe numa frase:</div>
      <div class="tb" id="s1-l1">No setor financeiro, <em>quase todo mundo já usa IA.</em></div>
      <div class="tb" id="s1-l2"><em>Pouca gente</em> captura o valor.</div>
      <div class="tl" id="s1-l3">E a diferença não está na tecnologia.</div>
    </div>
    <div id="s1-verbos">
      <div class="lab" id="s1-vl">Três verbos</div>
      <div class="pill" id="s1-v1"><b>reconhecer</b> uma boa oportunidade</div>
      <div class="pill" id="s1-v2"><b>julgar</b> se ela é viável</div>
      <div class="pill" id="s1-v3"><b>provar</b> que ela gerou valor</div>
    </div>
    <div id="s1-lower"><b>Fabio Pinheiro</b><span>South System</span></div>
  </div>`;
    const css = `
  #root { background: #FF5100; }
  #root #s1-bg { position: absolute; inset: 0; background: url(assets/cover-bg.jpg) center / cover no-repeat; }
  #root #s1-net { position: absolute; inset: 0; background: url(assets/network-art.png) right -140px top -40px / 1000px auto no-repeat; opacity: .16; mix-blend-mode: multiply; }
  #root .eyebrow.light { color: rgba(255,255,255,.85); } #root .eyebrow.light b { color: #fff; }
  #root #s1-cover { position: absolute; inset: 0; transform-origin: 20% 40%; }
  #root #s1-academy { top: 168px; }
  #root #s1-title { position: absolute; left: 96px; top: 300px; width: 1500px; font-size: 128px; line-height: 1.02; font-weight: 900; letter-spacing: -0.045em; color: #fff; }
  #root #s1-title em { font-style: normal; color: #1A1A1A; }
  #root #s1-sub { position: absolute; left: 96px; top: 600px; width: 1180px; font-size: 30px; line-height: 1.45; color: rgba(255,255,255,.92); }
  #root #s1-tese { position: absolute; left: 96px; top: 250px; width: 1360px; transform-origin: 20% 40%; }
  #root #s1-tese .tl { font-size: 34px; color: rgba(255,255,255,.85); margin-bottom: 22px; font-weight: 600; }
  #root #s1-tese .tb { font-size: 84px; font-weight: 900; letter-spacing: -0.045em; line-height: 1.02; color: #fff; margin-bottom: 26px; }
  #root #s1-tese .tb em { font-style: normal; color: #1A1A1A; }
  #root #s1-verbos { position: absolute; left: 96px; top: 760px; display: flex; gap: 18px; align-items: center; }
  #root #s1-verbos .lab { font-size: 18px; letter-spacing: .14em; text-transform: uppercase; color: rgba(255,255,255,.8); font-weight: 800; margin-right: 8px; }
  #root .pill { background: #1A1A1A; color: rgba(255,255,255,.85); font-size: 27px; padding: 16px 26px; border-radius: 999px; white-space: nowrap; }
  #root .pill b { color: #FF9A66; font-weight: 900; }
  #root #s1-lower { position: absolute; left: 96px; top: 860px; background: #fff; color: #1A1A1A; padding: 18px 30px; border-radius: 14px; font-size: 30px; display: flex; gap: 18px; align-items: baseline; box-shadow: 0 20px 50px -30px rgba(0,0,0,.5); }
  #root #s1-lower b { font-weight: 900; } #root #s1-lower span { font-size: 20px; letter-spacing: .1em; text-transform: uppercase; color: #E04600; font-weight: 800; }
  #root .w { display: inline-block; margin-right: .2em; }
`;
    const js = `
    hide("#s1-academy, .tl, .tb, .lab, .pill, #s1-lower, .w");
    gsap.set("#s1-tese, #s1-verbos", { opacity: 1 });
    // entrada: zoom-through (push) vindo da vinheta; o conteúdo chega composto e depois cascateia
    enterPush(tl, "#s1-cover", 0, 18);
    waterfall(tl, ["#s1-t0", "#s1-t1", "#s1-t2", "#s1-t3"], 0.35, { y: 90, d: 0.2, gap: 0.09 });
    // apresentação: lower-third do narrador
    waterfall(tl, ["#s1-lower"], ${cues.nome}, { y: 70, d: 0.2 });
    // "South Academy Executive": troca de texto por zoom-through no eyebrow
    exitPush(tl, "#s1-eyebrow", ${cues.academy});
    tl.set("#s1-academy", { opacity: 1 }, ${cues.academy} + 0.2);
    enterPush(tl, "#s1-academy", ${cues.academy} + 0.2);
    // tese: a capa sai por push, as linhas da tese chegam em cascata nos beats
    exitPush(tl, "#s1-cover", ${cues.tese}, 18, 1.15);
    exitCurve(tl, "#s1-lower", ${cues.tese});
    waterfall(tl, ["#s1-l0"], ${cues.tese} + 0.25, { y: 50 });
    waterfall(tl, ["#s1-l1"], ${cues.tese1}, { y: 80, d: 0.2 });
    waterfall(tl, ["#s1-l2"], ${cues.tese2}, { y: 80, d: 0.2 });
    waterfall(tl, ["#s1-l3"], ${cues.tese3}, { y: 50 });
    // três verbos: o bloco da tese sobe (nudge) para abrir espaço; pílulas em cascata nos beats
    nudge(tl, "#s1-tese", "y", 0, -90, ${cues.verbos});
    tl.to("#s1-l0", { opacity: 0, duration: 0.25 }, ${cues.verbos});
    waterfall(tl, ["#s1-vl"], ${cues.verbos} + 0.5, { y: 40 });
    waterfall(tl, ["#s1-v1"], ${cues.v1}, { y: 60 });
    waterfall(tl, ["#s1-v2"], ${cues.v2}, { y: 60 });
    waterfall(tl, ["#s1-v3"], ${cues.v3}, { y: 60 });
    // saída: cut-the-curve para a esquerda (corrente do filme)
    exitCurve(tl, "#s1-tese", ${dur - 0.3});
    exitCurve(tl, "#s1-verbos", ${dur - 0.3});`;
    return root("tela01", dur, inner, css) + script("tela01", js);
  },

  // ------------------------------------------------------------------ TELA 02 · 3 CARTÕES
  tela02: ({ cues, dur }) => {
    const cards = [
      {
        n: "01",
        h: "Identificar",
        p: "Onde a IA ajuda a sua área: produtividade, experiência do cliente e qualidade das decisões.",
        b: "Módulo 1",
        ic: `<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>`,
        c: "#FF5100",
      },
      {
        n: "02",
        h: "Avaliar",
        p: "Se a ideia é viável: dados, integração, custo, competências, adoção e riscos.",
        b: "Módulos 2 e 3",
        ic: `<path d="M12 3v18M7 21h10M5 7h14M5 7l-3 7a3 3 0 0 0 6 0L5 7zM19 7l-3 7a3 3 0 0 0 6 0l-3-7z"/>`,
        c: "#E04600",
      },
      {
        n: "03",
        h: "Estimar e <em>comprovar</em>",
        p: "Linha de base, benefícios e custos. E se o retorno de fato aconteceu.",
        b: "Módulo 5",
        ic: `<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>`,
        c: "#FF7A33",
        ink: true,
      },
    ];
    const inner = `
  <div class="stage" id="s2-stage">
    ${chrome("Abertura", "02")}
    <div class="eyebrow" id="s2-eyebrow">Abertura · Objetivos</div>
    <h2 class="title" id="s2-title">Ao final do programa, você será capaz de <em>identificar, avaliar e comprovar.</em></h2>
    ${cards
      .map(
        (c, i) => `
    <div class="card ic" id="s2-c${i + 1}" style="left:${96 + i * 586}px">
      <svg viewBox="0 0 24 24" fill="none" stroke="${c.c}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${c.ic}</svg>
      <div><div class="n">${c.n}</div><h4>${c.h}</h4><p>${c.p}</p><span class="badge${c.ink ? " ink" : ""}"><i></i>${c.b}</span></div>
    </div>`,
      )
      .join("")}
    <div class="ask" id="s2-ask"><span class="k">Pergunta</span><p>Qual tarefa da sua equipe você gostaria que <em id="s2-em">nunca mais precisasse ser feita à mão?</em></p></div>
    <div id="s2-cara">Não a mais chata. <b>A mais cara.</b></div>
    <div class="badge ink" id="s2-ep4"><i></i>Volta no EP04</div>
  </div>`;
    const css = `
  #root .card.ic { top: 400px; width: 556px; height: 330px; display: grid; grid-template-columns: 64px 1fr; gap: 22px; align-items: start; }
  #root .card.ic svg { width: 64px; height: 64px; }
  #root .card.ic .n { font-size: 16px; letter-spacing: .14em; color: #6E6E6E; font-weight: 800; margin-bottom: 6px; }
  #root .card.ic .badge { margin-top: 16px; }
  #root .card.ic h4 em { font-style: normal; color: #F54E00; }
  #root #s2-ask { top: 790px; width: 1290px; }
  #root #s2-em { position: relative; }
  #root #s2-cara { position: absolute; left: 1420px; top: 400px; width: 420px; font-size: 40px; font-weight: 700; line-height: 1.2; color: #1A1A1A; }
  #root #s2-cara b { color: #FF5100; font-weight: 900; display: block; font-size: 64px; letter-spacing: -0.04em; }
  #root #s2-ep4 { position: absolute; left: 1200px; top: 740px; font-size: 18px; }
`;
    const js = `
    hide(".card, #s2-ask, #s2-cara, #s2-ep4");
    // entrada pela corrente (cut-the-curve, esquerda)
    enterCurve(tl, "#s2-stage", 0);
    // três cartões, um por beat
    waterfall(tl, ["#s2-c1"], ${cues.c1}, { y: 70, d: 0.2 });
    waterfall(tl, ["#s2-c2"], ${cues.c2}, { y: 70, d: 0.2 });
    waterfall(tl, ["#s2-c3"], ${cues.c3}, { y: 70, d: 0.2 });
    // faixa "Pergunta"
    waterfall(tl, ["#s2-ask"], ${cues.ask}, { y: 70, d: 0.2 });
    // "a mais cara": o terceiro cartão sai pela esquerda e a frase chega no lugar (push)
    exitCurve(tl, "#s2-c3", ${cues.cara});
    tl.set("#s2-cara", { opacity: 1 }, ${cues.cara} + 0.15);
    arrive(tl, "#s2-cara", ${cues.cara} + 0.15);
    // "ela volta no episódio 4"
    waterfall(tl, ["#s2-ep4"], ${cues.ep4}, { y: 40, d: 0.14 });
    exitCurve(tl, "#s2-stage", ${dur - 0.3});`;
    return root("tela02", dur, inner, css) + script("tela02", js);
  },

  // ------------------------------------------------------------------ TELA 03 · 5 MÓDULOS + CURSOR
  tela03: ({ cues, dur, beats }) => {
    const b = Object.fromEntries(beats.map((x) => [x.cue, x]));
    const mods = [
      { n: "01", h: "Aplicações", p: "Onde a IA pode ajudar minha área?", c: "#E04600" },
      {
        n: "02",
        h: "Fundamentos",
        p: "O que preciso entender para usar e avaliar IA?",
        c: "#FF5100",
      },
      { n: "03", h: "Priorização", p: "Quais iniciativas merecem começar primeiro?", c: "#FF9A66" },
      { n: "04", h: "Cases South", p: "Como isso vira projeto real?", c: "#E8A200" },
      { n: "05", h: "ROI da IA", p: "Como saber se o investimento valeu a pena?", c: "#1A1A1A" },
    ];
    const W = 330,
      G = 22,
      X0 = 96,
      Y = 400;
    const inner = `
  <div class="stage" id="s3-stage">
    ${chrome("Abertura", "03")}
    <div class="eyebrow" id="s3-eyebrow">Abertura · Agenda</div>
    <h2 class="title" id="s3-title">Cinco módulos. Cada um responde <em>uma pergunta do gestor.</em></h2>
    ${mods
      .map(
        (m, i) => `
    <div class="card mod" id="s3-m${i + 1}" style="left:${X0 + i * (W + G)}px;--c:${m.c}"><div class="bar"></div><div class="n">${m.n}</div><h4>${m.h}</h4><p>${m.p}</p></div>`,
      )
      .join("")}
    <div class="band" id="s3-band">O programa não é sobre tecnologia. É sobre <em id="s3-em">reconhecer, julgar e provar<span class="ul" id="s3-ul"></span></em> o valor de uma oportunidade de IA.</div>
    <div class="cursor" id="s3-cursor">${CURSOR_SVG}</div>
  </div>`;
    const css = `
  #root .card.mod { top: ${Y}px; width: ${W}px; height: 300px; padding: 30px 28px; }
  #root .card.mod .bar { position: absolute; left: 0; top: 0; right: 0; height: 10px; background: var(--c); border-radius: 18px 18px 0 0; }
  #root .card.mod .n { font-size: 44px; font-weight: 900; color: var(--c); letter-spacing: -0.04em; margin-bottom: 10px; }
  #root .card.mod h4 { font-size: 30px; }
  #root .card.mod p { font-size: 22px; }
  #root .card.mod.on { box-shadow: 0 0 0 4px var(--c), 0 24px 60px -30px rgba(26,26,26,.35); }
  #root #s3-band { top: 790px; width: 1290px; }
  #root #s3-em { position: relative; }
  #root #s3-em .ul { position: absolute; left: -6px; right: -6px; bottom: -2px; height: 12px; background: #FF5100; opacity: .8; border-radius: 4px; display: block; }
  #root #s3-cursor { left: 0; top: 0; }
`;
    // cursor: caminha pelos cartões; cada clique acende o cartão (reação em paralelo, mesmo frame)
    const centers = mods.map((_, i) => ({ x: X0 + i * (W + G) + W / 2, y: Y + 150 }));
    const seg1 = (b.walk1.dur - 0.9) / 3,
      seg2 = (b.walk2.dur - 0.6) / 2;
    const walk = (i, t) => `
    cursorMove(tl, "#s3-cursor", ${centers[i].x}, ${centers[i].y}, ${t.toFixed(2)}, 0.55);
    cursorClick(tl, "#s3-cursor", ${(t + 0.6).toFixed(2)});
    press(tl, "#s3-m${i + 1}", ${(t + 0.6).toFixed(2)});
    tl.set("#s3-m${i + 1}", { className: "card mod on" }, ${(t + 0.6).toFixed(2)});`;
    const js = `
    hide(".card, #s3-band");
    gsap.set("#s3-ul", { scaleX: 0, transformOrigin: "0% 50%" });
    enterCurve(tl, "#s3-stage", 0);
    waterfall(tl, ["#s3-m1", "#s3-m2", "#s3-m3", "#s3-m4", "#s3-m5"], ${cues.cards} + 0.1, { y: 70, d: 0.2, gap: 0.09 });
    // o cursor entra por baixo (nunca aparece por fade) e caminha pelos cinco cartões
    gsap.set("#s3-cursor", { x: ${centers[0].x} - TIP.x, y: 1080 * 1.15 });
    tl.fromTo("#s3-cursor", { x: ${centers[0].x} - TIP.x, y: 1080 * 1.15 }, { y: ${centers[0].y} - TIP.y, duration: 0.85, ease: "power3.out", immediateRender: false }, ${cues.walk1} - 0.5);
    cursorClick(tl, "#s3-cursor", ${cues.walk1} + 0.4); press(tl, "#s3-m1", ${cues.walk1} + 0.4); tl.set("#s3-m1", { className: "card mod on" }, ${cues.walk1} + 0.4);
    ${walk(1, cues.walk1 + 0.5 + seg1)}
    ${walk(2, cues.walk1 + 0.5 + seg1 * 2)}
    ${walk(3, cues.walk2 + 0.1)}
    ${walk(4, cues.walk2 + 0.1 + seg2)}
    // o cursor sai fisicamente pela borda direita e a faixa chega
    tl.to("#s3-cursor", { x: 1920 * 1.18, y: 1080 * 0.6, duration: 0.6, ease: "power2.in" }, ${cues.band} - 0.2);
    waterfall(tl, ["#s3-band"], ${cues.band}, { y: 70, d: 0.2 });
    tl.fromTo("#s3-ul", { scaleX: 0, transformOrigin: "0% 50%" }, { scaleX: 1, duration: 0.45, ease: "power4.out", immediateRender: false }, ${cues.band2});
    tl.to("#s3-em", { color: "#FF9A66", duration: 0.3 }, ${cues.band2});
    exitCurve(tl, "#s3-stage", ${dur - 0.3});`;
    return root("tela03", dur, inner, css) + script("tela03", js);
  },

  // ------------------------------------------------------------------ TELA 04 · PARADOXO (4 ANÉIS + PARÁBOLA)
  tela04: ({ cues, dur }) => {
    const rings = [
      {
        id: "r1",
        v: 79,
        pre: "",
        suf: "%",
        txt: "das organizações relatam algum valor mensurável com IA e GenAI",
        neg: false,
        arc: 0.79,
      },
      {
        id: "r2",
        v: 30,
        pre: "<",
        suf: "%",
        txt: "dos líderes de IA dizem que o ROI superou a expectativa do CEO",
        neg: true,
        arc: 0.3,
      },
      {
        id: "r3",
        v: 50,
        pre: ">",
        suf: "%",
        txt: "dos projetos de IA não chegam à produção",
        neg: true,
        arc: 0.5,
      },
      {
        id: "r4",
        v: 40,
        pre: "",
        suf: "%+",
        txt: "dos projetos de IA agêntica devem ser cancelados até o fim de 2027",
        neg: true,
        arc: 0.4,
      },
    ];
    const C = 2 * Math.PI * 42;
    const inner = `
  <div class="stage" id="s4-stage">
    ${chrome("Abertura", "04")}
    <div class="eyebrow" id="s4-eyebrow">Abertura · O contexto</div>
    <h2 class="title" id="s4-title">Muitos investem em IA; <em>poucos capturam o valor.</em></h2>
    <div id="s4-rings">
    ${rings
      .map(
        (r, i) => `
      <div class="card ring" id="s4-${r.id}" style="left:${96 + i * 430}px">
        <div class="rw"><svg viewBox="0 0 100 100"><circle class="trk" cx="50" cy="50" r="42"/><circle class="arc${r.neg ? " neg" : ""}" id="s4-${r.id}-arc" cx="50" cy="50" r="42" style="stroke-dasharray:${C.toFixed(1)};stroke-dashoffset:${C.toFixed(1)}"/></svg><div class="rv${r.neg ? " neg" : ""}" id="s4-${r.id}-v">0%</div></div>
        <p>${r.txt}</p>
      </div>`,
      )
      .join("")}
    </div>
    <div class="card" id="s4-quote">
      <div class="q" id="s4-q1">“A gente tem <b id="s4-n17">17</b> iniciativas de IA.”</div>
      <div class="grid" id="s4-grid">${Array.from({ length: 17 }, (_, i) => `<i id="s4-sq${i}"></i>`).join("")}</div>
      <div class="lab" id="s4-dono">Quantas têm <b>dono com meta financeira?</b></div>
      <div class="lab" id="s4-dedos"><b>Quatro.</b> Contou nos dedos de uma mão. E sobrou dedo.</div>
      <div class="q" id="s4-inv1">17 iniciativas <b>não é uma estratégia.</b></div>
    </div>
    <div class="embed" id="s4-inv2">É um <em>inventário.</em></div>
    <div class="band" id="s4-band">O diferencial não é usar IA. É <em id="s4-em">escolher o problema certo, preparar dados e pessoas e medir o resultado.</em></div>
    <div class="src">Fontes: Gartner, via Ask Gartner (out/2026), e Gartner Newsroom (25/06/2025). Documentos nas notas.</div>
  </div>`;
    const css = `
  #root #s4-rings { position: absolute; inset: 0; transform-origin: 50% 40%; }
  #root .card.ring { top: 380px; width: 400px; height: 360px; display: flex; flex-direction: column; align-items: center; text-align: center; padding: 28px 30px; }
  #root .card.ring .rw { position: relative; width: 170px; height: 170px; }
  #root .card.ring svg { width: 170px; height: 170px; transform: rotate(-90deg); }
  #root .card.ring .trk { fill: none; stroke: #EDEDED; stroke-width: 10; }
  #root .card.ring .arc { fill: none; stroke: #FF5100; stroke-width: 10; stroke-linecap: round; }
  #root .card.ring .arc.neg { stroke: #D93025; }
  #root .card.ring .rv { position: absolute; inset: 0; display: grid; place-items: center; font-size: 44px; font-weight: 900; letter-spacing: -0.04em; color: #FF5100; }
  #root .card.ring .rv.neg { color: #D93025; }
  #root .card.ring p { font-size: 21px; margin-top: 18px; }
  #root #s4-quote { left: 96px; top: 380px; width: 1120px; height: 400px; padding: 40px 48px; border-left: 12px solid #FF5100; transform-origin: 0% 50%; }
  #root #s4-quote .q { font-size: 54px; font-weight: 700; letter-spacing: -0.03em; line-height: 1.15; }
  #root #s4-quote .q b { color: #FF5100; font-weight: 900; }
  #root #s4-grid { position: absolute; left: 48px; top: 190px; display: grid; grid-template-columns: repeat(17, 44px); gap: 10px; }
  #root #s4-grid i { display: block; width: 44px; height: 44px; border-radius: 8px; background: #E2E2E2; }
  #root #s4-grid i.on { background: #FF5100; }
  #root #s4-quote .lab { position: absolute; left: 48px; top: 270px; font-size: 32px; color: #4A4A4A; }
  #root #s4-quote .lab b { color: #1A1A1A; font-weight: 900; }
  #root #s4-inv1 { position: absolute; left: 48px; top: 40px; width: 1000px; }
  #root #s4-inv2 { left: 96px; top: 380px; font-size: 150px; color: #1A1A1A; transform-origin: 0% 50%; }
  #root #s4-inv2 em { font-style: normal; color: #FF5100; }
  #root #s4-band { top: 800px; width: 1290px; }
`;
    const js = `
    hide(".card, #s4-quote .q, #s4-quote .lab, #s4-inv2, #s4-band, #s4-grid i");
    gsap.set("#s4-quote .q, #s4-quote .lab", { opacity: 0 });
    enterCurve(tl, "#s4-stage", 0);
    // quatro anéis em sequência: cartão chega, arco desenha, número conta
    ${rings
      .map(
        (r) => `
    waterfall(tl, ["#s4-${r.id}"], ${cues[r.id]}, { y: 70, d: 0.2 });
    tl.to("#s4-${r.id}-arc", { strokeDashoffset: ${(C * (1 - r.arc)).toFixed(1)}, duration: 1.0, ease: "power2.out" }, ${cues[r.id]} + 0.15);
    countUp(tl, "#s4-${r.id}-v", ${r.v}, ${cues[r.id]} + 0.15, { dur: 1.0, prefix: "${r.pre}", suffix: "${r.suf}" });`,
      )
      .join("")}
    // parábola: os anéis recuam (pull) e o cartão da citação chega oversized (inverse zoom — chegada)
    tl.to("#s4-rings", { scale: 0.8, opacity: 0.15, filter: "blur(10px)", duration: 0.25, ease: "power3.in" }, ${cues.parabola});
    tl.set("#s4-rings", { opacity: 0 }, ${cues.parabola} + 0.25);
    tl.set("#s4-quote", { opacity: 1 }, ${cues.parabola} + 0.2);
    arrive(tl, "#s4-quote", ${cues.parabola} + 0.2);
    // "dezessete iniciativas": a frase chega; os 17 quadrados acendem em cascata
    waterfall(tl, ["#s4-q1"], ${cues.dezessete}, { y: 40 });
    countUp(tl, "#s4-n17", 17, ${cues.dezessete}, { dur: 1.2, ease: "power1.inOut" });
    ${Array.from({ length: 17 }, (_, i) => `tl.set("#s4-sq${i}", { opacity: 1 }, ${cues.dezessete} + ${(0.1 + i * 0.07).toFixed(2)});`).join("\n    ")}
    // "quantas têm dono?" → "quatro": só 4 dos 17 acendem
    waterfall(tl, ["#s4-dono"], ${cues.dono}, { y: 40 });
    tl.to("#s4-dono", { opacity: 0, duration: 0.2 }, ${cues.dedos} - 0.1);
    waterfall(tl, ["#s4-dedos"], ${cues.dedos}, { y: 40 });
    ${[0, 1, 2, 3].map((i) => `tl.set("#s4-sq${i}", { className: "on" }, ${cues.dedos} + ${(0.3 + i * 0.18).toFixed(2)});`).join("\n    ")}
    ${Array.from({ length: 13 }, (_, i) => `tl.to("#s4-sq${i + 4}", { opacity: 0.35, duration: 0.3 }, ${cues.dedos} + 0.3);`).join("\n    ")}
    // "não é uma estratégia": troca de frase por zoom-through; "inventário" = chegada inverse-zoom (pico)
    exitPush(tl, "#s4-q1", ${cues.inv1});
    tl.set("#s4-inv1", { opacity: 1 }, ${cues.inv1} + 0.2);
    enterPush(tl, "#s4-inv1", ${cues.inv1} + 0.2);
    tl.to("#s4-quote", { scale: 0.8, opacity: 0.15, filter: "blur(10px)", duration: 0.25, ease: "power3.in" }, ${cues.inv2} - 0.05);
    tl.set("#s4-quote", { opacity: 0 }, ${cues.inv2} + 0.2);
    tl.set("#s4-inv2", { opacity: 1 }, ${cues.inv2} + 0.2);
    arrive(tl, "#s4-inv2", ${cues.inv2} + 0.2, 18);
    // faixa de síntese
    nudge(tl, "#s4-inv2", "y", 0, -50, ${cues.band} - 0.1);
    waterfall(tl, ["#s4-band"], ${cues.band}, { y: 70, d: 0.2 });
    tl.to("#s4-em", { color: "#FF9A66", duration: 0.3 }, ${cues.band2});
    exitCurve(tl, "#s4-stage", ${dur - 0.3});`;
    return root("tela04", dur, inner, css) + script("tela04", js);
  },

  // ------------------------------------------------------------------ TELA 05 · 5 DIFERENCIAIS
  tela05: ({ cues, dur }) => {
    const d = [
      {
        h: "Problema antes da tecnologia",
        big: "2,4×",
        p: "Só 14% alinham negócio, TI e executivos sobre o problema. Esses têm 2,4× mais chance de relatar valor.",
        b: "Módulos 1 e 3",
        cls: "",
        num: { to: 2.4, dec: 1, suf: "×" },
      },
      {
        h: "Um dono para o valor",
        big: "1 dono",
        p: "Antes do deploy, um executivo responde por converter ganho operacional em resultado financeiro.",
        b: "Módulo 5",
        cls: "ink",
      },
      {
        h: "Dados prontos para o caso de uso",
        big: "60%",
        p: "dos projetos sem dados prontos para IA serão abandonados até 2026 (previsão).",
        b: "Módulo 2",
        cls: "neg",
        num: { to: 60, dec: 0, suf: "%" },
      },
      {
        h: "Pessoas tão prontas quanto a tecnologia",
        big: "11%",
        p: "das organizações combinam alta prontidão tecnológica e humana.",
        b: "Módulos 2 e 5",
        cls: "neg",
        num: { to: 11, dec: 0, suf: "%" },
      },
      {
        h: "Medição desde o dia zero",
        big: "Dia 0",
        p: "Linha de base, metas e acompanhamento da captura financeira. Não só da adoção.",
        b: "Módulo 5",
        cls: "",
      },
    ];
    const W = 330,
      G = 22,
      X0 = 96,
      Y = 400;
    const inner = `
  <div class="stage" id="s5-stage">
    ${chrome("Abertura", "05")}
    <div class="eyebrow" id="s5-eyebrow">Abertura · O que funciona</div>
    <h2 class="title" id="s5-title">O que separa <em>quem captura valor</em></h2>
    <p class="sub" id="s5-sub">Cinco diferenciais. Cada um é retomado em um módulo do programa.</p>
    <div id="s5-cards">
    ${d
      .map(
        (c, i) => `
      <div class="slot" id="s5-slot${i + 1}" style="left:${X0 + i * (W + G)}px"><span>${i + 1}</span></div>
      <div class="card dif" id="s5-d${i + 1}" style="left:${X0 + i * (W + G)}px"><h4>${c.h}</h4><div class="big ${c.cls}" id="s5-d${i + 1}-big">${c.big}</div><p>${c.p}</p><span class="badge"><i></i>${c.b}</span></div>`,
      )
      .join("")}
    </div>
    <div id="s5-perfis">
      <div class="lab" id="s5-pl">Três perfis na diretoria</div>
      <div class="pf" id="s5-p1"><b>Pioneiro</b> quer vantagem</div>
      <div class="pf" id="s5-p2"><b>Cauteloso</b> quer prova antes de escalar</div>
      <div class="pf" id="s5-p3"><b>Protetor</b> quer governança e trilha</div>
      <div class="pf ok" id="s5-ok">Os cinco diferenciais são o que os três concordam.</div>
    </div>
    <div class="src">Fontes: Gartner, via Ask Gartner (out/2026), e Gartner Newsroom (26/02/2025). Documentos nas notas.</div>
  </div>`;
    const css = `
  #root #s5-cards { position: absolute; inset: 0; transform-origin: 50% 0%; }
  #root .slot { position: absolute; top: ${Y}px; width: ${W}px; height: 380px; border: 3px dashed #B5B5B5; border-radius: 18px; display: grid; place-items: center; font-size: 64px; font-weight: 900; color: #767676; }
  #root .card.dif { top: ${Y}px; width: ${W}px; height: 380px; padding: 28px 26px; display: flex; flex-direction: column; gap: 12px; }
  #root .card.dif h4 { font-size: 24px; min-height: 58px; }
  #root .card.dif p { font-size: 19px; margin-top: 0; }
  #root .card.dif .badge { margin-top: auto; font-size: 14px; }
  #root #s5-perfis { position: absolute; left: 96px; top: 830px; display: flex; gap: 16px; align-items: center; }
  #root #s5-perfis .lab { font-size: 16px; letter-spacing: .14em; text-transform: uppercase; color: #6E6E6E; font-weight: 800; }
  #root .pf { background: #fff; border: 2px solid #E2E2E2; border-radius: 999px; padding: 14px 24px; font-size: 24px; white-space: nowrap; }
  #root .pf b { color: #FF5100; font-weight: 900; margin-right: 6px; }
  #root .pf.ok { background: #1A1A1A; color: #fff; border-color: #1A1A1A; font-weight: 700; }
`;
    const js = `
    hide(".slot, .card, #s5-perfis .lab, .pf");
    enterCurve(tl, "#s5-stage", 0);
    // "cinco diferenciais": cinco vagas numeradas aparecem; cada beat preenche uma
    waterfall(tl, ["#s5-slot1", "#s5-slot2", "#s5-slot3", "#s5-slot4", "#s5-slot5"], ${cues.intro} + 0.2, { y: 40, d: 0.16, gap: 0.07 });
    ${d
      .map(
        (c, i) => `
    tl.to("#s5-slot${i + 1}", { opacity: 0, duration: 0.15 }, ${cues["d" + (i + 1)]});
    waterfall(tl, ["#s5-d${i + 1}"], ${cues["d" + (i + 1)]}, { y: 70, d: 0.2 });${
      c.num
        ? `
    countUp(tl, "#s5-d${i + 1}-big", ${c.num.to}, ${cues["d" + (i + 1) + "n"] ?? cues["d" + (i + 1)] + 0.3}, { dur: 0.9, dec: ${c.num.dec}, suffix: "${c.num.suf}" });`
        : `
    press(tl, "#s5-d${i + 1}-big", ${cues["d" + (i + 1) + "n"] ?? cues["d" + (i + 1)] + 0.3});`
    }`,
      )
      .join("")}
    // três perfis: os cartões recuam um pouco (nudge) e as pílulas chegam em cascata
    tl.to("#s5-sub", { opacity: 0, duration: 0.2 }, ${cues.perfis} - 0.3);
    nudge(tl, "#s5-cards", "y", 0, -40, ${cues.perfis} - 0.2);
    tl.to("#s5-cards", { scale: 0.92, duration: 0.7, ease: "power4.out" }, ${cues.perfis} - 0.2);
    waterfall(tl, ["#s5-pl"], ${cues.perfis} + 0.3, { y: 30 });
    waterfall(tl, ["#s5-p1"], ${cues.p1}, { y: 50 });
    waterfall(tl, ["#s5-p2"], ${cues.p2}, { y: 50 });
    waterfall(tl, ["#s5-p3"], ${cues.p3}, { y: 50 });
    // "são o que os três concordam": os cinco cartões voltam ao foco e a pílula-síntese chega
    tl.to("#s5-cards", { scale: 1, y: -40, duration: 0.5, ease: "power3.out" }, ${cues.concordam});
    waterfall(tl, ["#s5-ok"], ${cues.concordam} + 0.2, { y: 50 });
    // saída: push (o narrador cresce até a tela cheia — mesmo sinal de escala)
    exitPush(tl, "#s5-stage", ${dur - 0.3}, 18, 1.15);`;
    return root("tela05", dur, inner, css) + script("tela05", js);
  },

  // ------------------------------------------------------------------ DECISÃO PARA LEVAR
  decisao: ({ cues, dur }) => {
    const items = [
      "Problema antes da tecnologia",
      "Um dono para o valor",
      "Dados prontos para o caso de uso",
      "Pessoas tão prontas quanto a tecnologia",
      "Medição desde o dia zero",
    ];
    const inner = `
  <div class="stage" id="d-stage">
    <div class="card" id="d-card">
      <div class="kick" id="d-kick"><b>⏱ 2 min</b> Decisão para levar</div>
      <div class="step" id="d-s1"><span>1</span><div>Pegue a iniciativa de IA <b>mais visível</b> da sua área.</div></div>
      <div class="step" id="d-s2"><span>2</span><div>Marque qual dos cinco diferenciais está <b>mais fraco</b>:</div></div>
      <div class="list" id="d-list">${items.map((it, i) => `<div class="it" id="d-it${i}"><i class="box"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" style="stroke-dasharray:24;stroke-dashoffset:24"/></svg></i>${it}${i === 1 ? '<span class="tag" id="d-tag">O mais comum</span>' : ""}</div>`).join("")}</div>
    </div>
    <div id="d-next">
      <div class="lab" id="d-nl">Próximo episódio</div>
      <div class="ttl" id="d-nt"><b>EP02</b> Onde o valor está escondido</div>
      <div class="sub" id="d-ns">Comercial e Marketing. E por que o assistente que todo mundo compra primeiro…</div>
      <div class="embed" id="d-punch">é o que <em>menos vale.</em></div>
    </div>
  </div>`;
    const css = `
  #root { background: transparent; }
  #root #d-card { left: 1210px; top: 150px; width: 630px; height: 660px; padding: 36px 38px; transform-origin: 50% 100%; }
  #root #d-card .kick { font-size: 20px; letter-spacing: .12em; text-transform: uppercase; color: #6E6E6E; font-weight: 800; margin-bottom: 26px; }
  #root #d-card .kick b { background: #FF5100; color: #fff; padding: 6px 12px; border-radius: 6px; margin-right: 12px; letter-spacing: 0; }
  #root .step { display: flex; gap: 16px; align-items: flex-start; font-size: 25px; line-height: 1.3; margin-bottom: 18px; color: #1A1A1A; }
  #root .step span { flex: none; width: 40px; height: 40px; border-radius: 50%; background: #1A1A1A; color: #fff; display: grid; place-items: center; font-weight: 900; font-size: 20px; }
  #root .step b { color: #E04600; font-weight: 900; }
  #root .list { margin: 10px 0 0 56px; display: flex; flex-direction: column; gap: 12px; }
  #root .it { display: flex; align-items: center; gap: 14px; font-size: 22px; color: #4A4A4A; }
  #root .it .box { width: 34px; height: 34px; border-radius: 8px; border: 3px solid #C9C9C9; display: block; flex: none; }
  #root .it .box svg { width: 100%; height: 100%; }
  #root .it.on { color: #1A1A1A; font-weight: 800; } #root .it.on .box { background: #FF5100; border-color: #FF5100; }
  #root .tag { display: inline-block; margin-left: 10px; background: #FFEEE6; color: #C73E00; font-size: 16px; letter-spacing: .12em; text-transform: uppercase; font-weight: 900; padding: 8px 14px; border-radius: 999px; }
  #root #d-next { position: absolute; left: 1210px; top: 200px; width: 640px; }
  #root #d-next .lab { font-size: 22px; letter-spacing: .14em; text-transform: uppercase; color: rgba(255,255,255,.7); font-weight: 800; }
  #root #d-next .ttl { font-size: 58px; font-weight: 900; color: #fff; letter-spacing: -0.04em; line-height: 1.05; margin-top: 16px; }
  #root #d-next .ttl b { color: #FF5100; margin-right: 14px; }
  #root #d-next .sub { position: static; width: 620px; font-size: 27px; color: rgba(255,255,255,.85); margin-top: 24px; line-height: 1.4; }
  #root #d-punch { position: static; margin-top: 30px; font-size: 84px; color: #fff; transform-origin: 0% 50%; }
  #root #d-punch em { font-style: normal; color: #FF5100; }
`;
    const js = `
    hide("#d-card, .kick, .step, .it, .tag, #d-next .lab, #d-next .ttl, #d-next .sub, #d-punch");
    // o narrador já cresceu até a tela cheia (carrier); as entradas começam depois da costura assentar
    tl.set("#d-card", { opacity: 1 }, ${cues.task});
    waterfall(tl, ["#d-card", "#d-kick"], ${cues.task}, { y: 80, d: 0.22, gap: 0.1 });
    waterfall(tl, ["#d-s1"], ${cues.list}, { y: 40 });
    waterfall(tl, ["#d-s2"], ${cues.mark}, { y: 40 });
    waterfall(tl, ["#d-it0", "#d-it1", "#d-it2", "#d-it3", "#d-it4"], ${cues.mark} + 0.35, { y: 30, d: 0.14, gap: 0.06 });
    // "um dono para o valor": o item é marcado (check desenha) e recebe a etiqueta
    tl.set("#d-it1", { className: "it on" }, ${cues.dono} + 0.2);
    tl.to("#d-it1 path", { strokeDashoffset: 0, duration: 0.35, ease: "power2.out" }, ${cues.dono} + 0.25);
    waterfall(tl, ["#d-tag"], ${cues.dono} + 0.6, { y: 24 });
    // próximo episódio: o cartão sobe e sai (elevação), o teaser chega
    tl.to("#d-card", { y: -230, duration: 0.3, ease: "power4.in" }, ${cues.next} - 0.2);
    tl.to("#d-card", { opacity: 0, duration: 0.18, ease: "none" }, ${cues.next} - 0.2);
    waterfall(tl, ["#d-nl", "#d-nt", "#d-ns"], ${cues.next} + 0.1, { y: 70, d: 0.2, gap: 0.09 });
    tl.set("#d-punch", { opacity: 1 }, ${cues.punch});
    arrive(tl, "#d-punch", ${cues.punch});
    // saída para o cartão final: vetor para cima (conclusão)
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
    // chegada por baixo (continua o vetor para cima da decisão), depois fade final para o preto
    tl.fromTo("#f-group", { y: 230, opacity: 0.35 }, { y: 0, opacity: 1, duration: 0.34, ease: "power4.out", immediateRender: false }, 0);
    tl.to("#f-dark", { opacity: 1, duration: 0.6, ease: "power2.in" }, ${dur - 0.65});`;
    return root("final", dur, inner, css) + script("final", js);
  },
};
