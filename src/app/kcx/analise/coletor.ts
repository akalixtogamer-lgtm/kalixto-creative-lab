/**
 * Coletor KCX: script que a pessoa cola no Console do PRÓPRIO navegador, com o
 * site de referência aberto. Ele só LÊ a página (DOM, CSS acessível, animações
 * em andamento, recursos carregados e globais de bibliotecas) e baixa um
 * `coleta-kcx.json`. Nada é enviado a lugar nenhum.
 *
 * É o único caminho que respeita CORS e as políticas do site e, mesmo assim,
 * enxerga o que roda de verdade: o lab (no GitHub Pages) não consegue ler o
 * DOM de outro domínio.
 */

/** Globais que o coletor procura em window (nome → onde está a versão). */
export const GLOBAIS_PROCURADAS = [
  'gsap',
  'ScrollTrigger',
  'ScrollSmoother',
  'Flip',
  'THREE',
  '__THREE__',
  'PIXI',
  'BABYLON',
  'lottie',
  'bodymovin',
  'Lenis',
  'lenis',
  'LocomotiveScroll',
  'Swiper',
  'Motion',
  'barba',
  'swup',
  'AOS',
  'anime',
  'Splitting',
  'SplitType',
  'p5',
] as const;

export const SCRIPT_COLETOR = String.raw`(() => {
  const GLOBAIS = ${JSON.stringify(GLOBAIS_PROCURADAS)};
  const MARCADORES = ['.pin-spacer', '[data-framer-appear-id]', '[data-framer-name]', '[data-framer-component-type]', 'html.lenis', '.lenis-smooth', '[data-lenis-prevent]', '.swiper', '.swiper-initialized', '.swiper-wrapper', 'lottie-player', 'dotlottie-player', 'dotlottie-wc', '[data-scroll-container]', '.has-scroll-smooth', '[data-scroll-speed]', '[data-speed]', '[data-barba]', '#swup', '[data-aos]', '.aos-animate', '[data-splitting]', '.char', '.word', '.split-line', '[data-motion]', '.is-visible', '.is-inview', '[data-cursor]', '.cursor', '.custom-cursor'];
  const corta = (s, n) => String(s || '').slice(0, n);
  const seletor = (el) => {
    if (!el || el.nodeType !== 1) return '';
    if (el.id) return '#' + el.id;
    const c = [...el.classList].slice(0, 2).join('.');
    return el.tagName.toLowerCase() + (c ? '.' + c : '');
  };
  const avisos = [];
  const globais = {};
  for (const g of GLOBAIS) {
    try {
      const v = window[g];
      if (v === undefined || v === null) continue;
      const versao = typeof v === 'string' ? v : v.version || v.VERSION || v.REVISION;
      globais[g] = versao ? corta(versao, 20) : true;
    } catch (e) {}
  }
  const marcadoresDom = {};
  for (const m of MARCADORES) {
    try { const n = document.querySelectorAll(m).length; if (n) marcadoresDom[m] = n; } catch (e) {}
  }
  const css = { keyframes: [], inacessiveis: 0, regrasComTransicao: 0, regrasComAnimacao: 0, scrollDriven: [], sticky: 0, scrollSnap: 0, viewTransitions: false, backdropFilter: 0, hover: 0, perspective: 0 };
  const andar = (regras) => {
    for (const r of regras) {
      const texto = r.cssText || '';
      if (r.type === 7 || /^@(-webkit-)?keyframes/.test(texto)) { if (r.name && css.keyframes.length < 80) css.keyframes.push(corta(r.name, 60)); continue; }
      if (/^@view-transition/.test(texto)) css.viewTransitions = true;
      if (r.cssRules && r.type !== 1) { try { andar(r.cssRules); } catch (e) {} continue; }
      const s = r.style;
      if (!s) continue;
      if (s.transitionDuration && !/^0s?(,\s*0s?)*$/.test(s.transitionDuration) || /transition\s*:/.test(texto)) css.regrasComTransicao++;
      if (s.animationName && s.animationName !== 'none') css.regrasComAnimacao++;
      const tl = s.getPropertyValue('animation-timeline') || s.getPropertyValue('view-timeline-name') || s.getPropertyValue('scroll-timeline-name');
      if (tl && css.scrollDriven.length < 20) css.scrollDriven.push(corta((r.selectorText || '') + ' → ' + tl, 120));
      if (/position\s*:\s*sticky/.test(texto)) css.sticky++;
      if (s.getPropertyValue('scroll-snap-type')) css.scrollSnap++;
      if (s.getPropertyValue('view-transition-name')) css.viewTransitions = true;
      if (s.getPropertyValue('backdrop-filter') || s.getPropertyValue('-webkit-backdrop-filter')) css.backdropFilter++;
      if ((r.selectorText || '').includes(':hover')) css.hover++;
      if (s.getPropertyValue('perspective')) css.perspective++;
    }
  };
  for (const folha of document.styleSheets) {
    try { andar(folha.cssRules); } catch (e) { css.inacessiveis++; }
  }
  if (css.inacessiveis) avisos.push(css.inacessiveis + ' folha(s) de estilo de outro domínio não puderam ser lidas (CORS).');
  css.scrollBehavior = getComputedStyle(document.documentElement).scrollBehavior;
  const animacoes = [];
  try {
    for (const a of document.getAnimations().slice(0, 60)) {
      const t = a.effect && a.effect.getTiming ? a.effect.getTiming() : {};
      const nomeTl = a.timeline ? a.timeline.constructor.name : '';
      animacoes.push({
        alvo: corta(seletor(a.effect && a.effect.target), 120),
        nome: corta(a.animationName || a.transitionProperty || a.id || 'animação', 60),
        duracao: typeof t.duration === 'number' ? Math.round(t.duration) : 0,
        easing: corta(t.easing || 'linear', 60),
        timeline: nomeTl === 'ScrollTimeline' ? 'scroll' : nomeTl === 'ViewTimeline' ? 'view' : nomeTl === 'DocumentTimeline' ? 'documento' : 'outra',
        iteracoes: t.iterations === Infinity ? 'infinita' : t.iterations || 1,
      });
    }
  } catch (e) { avisos.push('Este navegador não lista as animações em andamento.'); }
  const recursos = performance.getEntriesByType('resource').slice(0, 200).map((r) => ({ nome: corta(r.name.split('?')[0], 200), tipo: r.initiatorType, bytes: Math.round(r.transferSize || 0) }));
  const fixosOuSticky = [];
  const todos = document.querySelectorAll('body *');
  for (let i = 0; i < todos.length && i < 5000 && fixosOuSticky.length < 30; i++) {
    const p = getComputedStyle(todos[i]).position;
    if (p === 'sticky' || p === 'fixed') fixosOuSticky.push({ seletor: corta(seletor(todos[i]), 120), posicao: p });
  }
  const indiciosEventos = {
    'onclick/onmouse*': document.querySelectorAll('[onclick],[onmouseover],[onmouseenter],[onmousemove]').length,
    'links e botões': document.querySelectorAll('a,button,[role=button]').length,
    'cursor: none no CSS': [...document.styleSheets].reduce((n, f) => { try { return n + [...f.cssRules].filter((r) => /cursor\s*:\s*none/.test(r.cssText)).length; } catch (e) { return n; } }, 0),
  };
  const inline = [...document.querySelectorAll('script:not([src])')].map((s) => s.textContent || '').join('\n');
  const palavras = ['gsap', 'ScrollTrigger', 'THREE', 'lottie', 'Lenis', 'Swiper', 'framer', 'motion', 'IntersectionObserver', 'startViewTransition', 'requestAnimationFrame', 'getContext(\'webgl'];
  const coleta = {
    formato: 'kcx-coleta', versao: 1, origem: 'dom',
    url: location.href.split('#')[0], titulo: corta(document.title, 200), coletadoEm: new Date().toISOString(),
    viewport: { largura: innerWidth, altura: innerHeight },
    scripts: [...document.scripts].map((s) => s.src).filter(Boolean).slice(0, 120),
    marcadoresInline: palavras.filter((p) => inline.includes(p)),
    estilos: [...document.querySelectorAll('link[rel=stylesheet]')].map((l) => l.href).slice(0, 60),
    globais, marcadoresDom, css, animacoes, recursos,
    elementos: { canvas: document.querySelectorAll('canvas').length, video: document.querySelectorAll('video').length, svg: document.querySelectorAll('svg').length, iframes: document.querySelectorAll('iframe').length, fixosOuSticky },
    indiciosEventos, avisos,
  };
  const texto = JSON.stringify(coleta, null, 2);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([texto], { type: 'application/json' }));
  a.download = 'coleta-kcx.json';
  document.body.appendChild(a); a.click(); a.remove();
  console.log('%cKCX: coleta pronta (coleta-kcx.json baixado). Importe o arquivo no Kalixto Creative Lab.', 'color:#00d9ff;font-weight:bold');
  return coleta;
})();`;
