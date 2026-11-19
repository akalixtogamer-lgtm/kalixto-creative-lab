/**
 * Peças comuns aos kits de efeito: palco do preview, opções de easing e cores.
 * Tudo aqui vira texto do código gerado — o que o usuário vê é o que roda.
 */

/** CSS do palco (fundo escuro centralizado), igual em todos os kits. */
export function cssPalco(extra = ''): string {
  return `/* Palco da demonstração */
* { box-sizing: border-box; }
html, body { height: 100%; margin: 0; }
body {
  display: grid;
  place-items: center;
  gap: 24px;
  padding: 24px;
  background: #0b0a14;
  color: #f4f2ff;
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
${extra}}`;
}

/** Botão "Repetir" usado pelos efeitos de entrada. */
export const CSS_REPETIR = `
.repetir {
  padding: 8px 16px;
  border: 1px solid #3a3456;
  border-radius: 999px;
  background: transparent;
  color: #c9c3ea;
  font: inherit;
  cursor: pointer;
}
.repetir:focus-visible { outline: 2px solid #22e3ff; outline-offset: 3px; }`;

/** Reinicia uma animação CSS removendo e recolocando a classe. */
export function jsRepetir(seletor: string, classe: string): string {
  return `// Repetir: tira a classe, força o navegador a recalcular e coloca de novo
const alvo = document.querySelector('${seletor}');
document.querySelector('.repetir').addEventListener('click', () => {
  alvo.classList.remove('${classe}');
  void alvo.offsetWidth; // força o reflow para a animação recomeçar
  alvo.classList.add('${classe}');
});`;
}

export const EASINGS = [
  { valor: 'cubic-bezier(0.22, 1, 0.36, 1)', rotulo: 'suave (expo out)' },
  { valor: 'cubic-bezier(0.34, 1.56, 0.64, 1)', rotulo: 'elástico (back out)' },
  { valor: 'ease', rotulo: 'ease' },
  { valor: 'ease-in-out', rotulo: 'ease-in-out' },
  { valor: 'linear', rotulo: 'linear' },
] as const;

export const CORES = [
  { valor: '#ff2bd6', rotulo: 'Magenta' },
  { valor: '#8b5cf6', rotulo: 'Roxo' },
  { valor: '#2f7bff', rotulo: 'Azul' },
  { valor: '#22e3ff', rotulo: 'Ciano' },
] as const;

export const MDN = {
  animation: {
    titulo: 'MDN — animation',
    url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/animation',
  },
  keyframes: {
    titulo: 'MDN — @keyframes',
    url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/@keyframes',
  },
  transform: {
    titulo: 'MDN — transform',
    url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/transform',
  },
  transition: {
    titulo: 'MDN — transition',
    url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/transition',
  },
  reduzir: {
    titulo: 'MDN — prefers-reduced-motion',
    url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion',
  },
  pointer: {
    titulo: 'MDN — Pointer events',
    url: 'https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events',
  },
  raf: {
    titulo: 'MDN — requestAnimationFrame',
    url: 'https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame',
  },
  boxShadow: {
    titulo: 'MDN — box-shadow',
    url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/box-shadow',
  },
  linearGradient: {
    titulo: 'MDN — linear-gradient()',
    url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/linear-gradient',
  },
  conicGradient: {
    titulo: 'MDN — conic-gradient()',
    url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/conic-gradient',
  },
  property: {
    titulo: 'MDN — @property',
    url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/@property',
  },
  perspective: {
    titulo: 'MDN — perspective',
    url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/perspective',
  },
  wcagMovimento: {
    titulo: 'WCAG 2.2 — 2.3.3 Animation from Interactions',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html',
  },
  animationDelay: {
    titulo: 'MDN — animation-delay',
    url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/animation-delay',
  },
  io: {
    titulo: 'MDN — Intersection Observer API',
    url: 'https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API',
  },
  scrollTimeline: {
    titulo: 'MDN — CSS scroll-driven animations',
    url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_scroll-driven_animations',
  },
  mask: {
    titulo: 'MDN — mask-image',
    url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/mask-image',
  },
  displacement: {
    titulo: 'MDN — <feDisplacementMap>',
    url: 'https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feDisplacementMap',
  },
  turbulence: {
    titulo: 'MDN — <feTurbulence>',
    url: 'https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feTurbulence',
  },
  scrollTrigger: {
    titulo: 'GSAP — ScrollTrigger',
    url: 'https://gsap.com/docs/v3/Plugins/ScrollTrigger/',
  },
  gsapMatchMedia: {
    titulo: 'GSAP — gsap.matchMedia()',
    url: 'https://gsap.com/docs/v3/GSAP/gsap.matchMedia()',
  },
  lenis: {
    titulo: 'Lenis — repositório oficial',
    url: 'https://github.com/darkroomengineering/lenis',
  },
  scrollBehavior: {
    titulo: 'MDN — scroll-behavior',
    url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-behavior',
  },
  cursor: {
    titulo: 'MDN — cursor',
    url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/cursor',
  },
  pointerMedia: {
    titulo: 'MDN — @media (pointer)',
    url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/@media/pointer',
  },
};

export const VALIDADO_EM = '2026-11-17';

/* ===================== Versão Angular ===================== */

/** "card-tilt" → "CardTilt" (nome da classe do componente). */
export function nomeClasse(id: string): string {
  return id.replace(/(^|-)([a-z0-9])/g, (_, __, c: string) => c.toUpperCase());
}

/**
 * CSS do componente Angular: o mesmo CSS do kit, sem o bloco do palco
 * (html/body), que no Angular é responsabilidade da página. :host centraliza.
 */
export function cssAngular(cssDoKit: string): string {
  const semPalco = cssDoKit.replace(/\/\* Palco da demonstração \*\/[\s\S]*?\n}\n*/, '');
  return `:host {
  display: grid;
  place-items: center;
  gap: 24px;
}

${semPalco.trim()}
`;
}

/** Componente sem lógica (efeitos só de CSS). */
export function tsSimples(id: string): string {
  return `import { Component } from '@angular/core';

/** ${id}: efeito só de CSS — o componente não precisa de lógica. */
@Component({
  selector: 'app-${id}',
  templateUrl: './${id}.html',
  styleUrl: './${id}.css',
})
export class ${nomeClasse(id)} {}
`;
}

/**
 * Componente com botão Repetir: o @for com uma chave que muda
 * recria o elemento, e a animação CSS recomeça do zero.
 */
export function tsRepetir(id: string): string {
  return `import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-${id}',
  templateUrl: './${id}.html',
  styleUrl: './${id}.css',
})
export class ${nomeClasse(id)} {
  /** Muda a cada clique em Repetir; o @for recria o elemento animado. */
  protected readonly ciclo = signal(0);

  protected repetir(): void {
    this.ciclo.update((n) => n + 1);
  }
}
`;
}

/** Template com o elemento animado recriado a cada ciclo. */
export function htmlRepetir(elemento: string): string {
  return `@for (c of [ciclo()]; track c) {
  ${elemento}
}
<button class="repetir" type="button" (click)="repetir()">Repetir</button>
`;
}

/* ===================== Kits de rolagem ===================== */

/** CSS de página rolável (o documento do preview rola sozinho). */
export function cssPagina(extra = ''): string {
  return `/* Página da demonstração (rolável) */
* { box-sizing: border-box; }
html, body { margin: 0; }
body {
  background: #0b0a14;
  color: #f4f2ff;
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.5;
${extra}}
.intro, .fim {
  display: grid;
  place-items: center;
  min-height: 70vh;
  padding: 24px;
  color: #c9c3ea;
  text-align: center;
}`;
}

/** CSS Angular de um kit de página rolável: tira o bloco da página e a intro/fim. */
export function cssAngularPagina(cssDoKit: string): string {
  const semPagina = cssDoKit.replace(
    /\/\* Página da demonstração[\s\S]*?\n}\n\.intro, \.fim \{[\s\S]*?\n}\n*/,
    '',
  );
  return `:host { display: block; }

${semPagina.trim()}
`;
}
