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
  animation: { titulo: 'MDN — animation', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/animation' },
  keyframes: { titulo: 'MDN — @keyframes', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/@keyframes' },
  transform: { titulo: 'MDN — transform', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/transform' },
  transition: { titulo: 'MDN — transition', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/transition' },
  reduzir: {
    titulo: 'MDN — prefers-reduced-motion',
    url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion',
  },
  pointer: { titulo: 'MDN — Pointer events', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events' },
  raf: {
    titulo: 'MDN — requestAnimationFrame',
    url: 'https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame',
  },
  boxShadow: { titulo: 'MDN — box-shadow', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/box-shadow' },
  linearGradient: {
    titulo: 'MDN — linear-gradient()',
    url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/linear-gradient',
  },
  conicGradient: {
    titulo: 'MDN — conic-gradient()',
    url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/conic-gradient',
  },
  property: { titulo: 'MDN — @property', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/@property' },
  perspective: { titulo: 'MDN — perspective', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/perspective' },
  wcagMovimento: {
    titulo: 'WCAG 2.2 — 2.3.3 Animation from Interactions',
    url: 'https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html',
  },
  animationDelay: {
    titulo: 'MDN — animation-delay',
    url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/animation-delay',
  },
};

export const VALIDADO_EM = '2026-11-17';
