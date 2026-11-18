/** Dados do Comparador de tecnologias. */

export interface Tecnologia {
  nome: string;
  labId: string;
  melhorPara: string;
  curva: number; // 1 (fácil) a 5 (difícil)
  controle: number; // 1 a 5
  peso: string;
  quandoEvitar: string;
}

export const TECNOLOGIAS: Tecnologia[] = [
  {
    nome: 'CSS',
    labId: 'css',
    melhorPara: 'Hover, transições de estado, microinterações simples',
    curva: 1,
    controle: 2,
    peso: '0 kB (nativo)',
    quandoEvitar: 'Sequências longas e animações que dependem de lógica',
  },
  {
    nome: 'GSAP',
    labId: 'gsap',
    melhorPara: 'Sequências, timelines e controle fino (pausar, voltar, acelerar)',
    curva: 2,
    controle: 5,
    peso: '~25 kB',
    quandoEvitar: 'Um único hover simples, que o CSS resolve',
  },
  {
    nome: 'ScrollTrigger',
    labId: 'scroll',
    melhorPara: 'Animações ligadas à rolagem: pin, parallax, storytelling',
    curva: 3,
    controle: 5,
    peso: '~15 kB (plugin)',
    quandoEvitar: 'Páginas curtas sem narrativa — vira enfeite',
  },
  {
    nome: 'SVG',
    labId: 'svg',
    melhorPara: 'Ícones, ilustrações, traços que se desenham e morphing',
    curva: 3,
    controle: 4,
    peso: '0 kB (nativo) + plugins',
    quandoEvitar: 'Fotos e cenas muito detalhadas',
  },
  {
    nome: 'Three.js',
    labId: 'three',
    melhorPara: 'Objetos e cenas 3D interativas no navegador',
    curva: 4,
    controle: 5,
    peso: '~150 kB',
    quandoEvitar: 'Quando um efeito 2D já transmite a ideia',
  },
  {
    nome: 'WebGL / GLSL',
    labId: 'webgl',
    melhorPara: 'Efeitos de pixel: ruído, distorção, transições com shader',
    curva: 5,
    controle: 5,
    peso: 'depende (Three.js ajuda)',
    quandoEvitar: 'Projetos sem tempo para testar desempenho em celulares',
  },
];

export type EfeitoId = 'entrada' | 'pulso' | 'sequencia';

export const EFEITOS_COMPARADOS: { id: EfeitoId; nome: string; descricao: string }[] = [
  {
    id: 'entrada',
    nome: 'Entrada (fade + subir)',
    descricao: 'O elemento aparece subindo 40px em 0,8 s.',
  },
  { id: 'pulso', nome: 'Pulso 3 vezes', descricao: 'Cresce 20% e volta, três vezes seguidas.' },
  {
    id: 'sequencia',
    nome: 'Sequência de 3',
    descricao: 'Três bolinhas andam uma depois da outra.',
  },
];

/** Código de cada efeito em cada tecnologia. */
export const CODIGOS: Record<EfeitoId, { css: string; waapi: string; gsap: string }> = {
  entrada: {
    css: `@keyframes entrar {
  from { opacity: 0; transform: translateY(40px); }
  to   { opacity: 1; transform: translateY(0); }
}
.caixa { animation: entrar 0.8s ease-out; }`,
    waapi: `caixa.animate(
  [
    { opacity: 0, transform: "translateY(40px)" },
    { opacity: 1, transform: "translateY(0)" },
  ],
  { duration: 800, easing: "ease-out" }
);`,
    gsap: `gsap.from(".caixa", {
  opacity: 0,
  y: 40,
  duration: 0.8,
  ease: "power2.out",
});`,
  },
  pulso: {
    css: `@keyframes pulsar {
  50% { transform: scale(1.2); }
}
.caixa { animation: pulsar 0.5s ease-in-out 3; }`,
    waapi: `caixa.animate(
  [{ transform: "scale(1)" }, { transform: "scale(1.2)" }, { transform: "scale(1)" }],
  { duration: 500, iterations: 3, easing: "ease-in-out" }
);`,
    gsap: `gsap.to(".caixa", {
  scale: 1.2,
  duration: 0.25,
  repeat: 5,     // ida + volta = 3 pulsos
  yoyo: true,
  ease: "sine.inOut",
});`,
  },
  sequencia: {
    css: `@keyframes andar { to { transform: translateX(120px); } }
.bola { animation: andar 0.5s ease-in-out forwards; }
.bola:nth-child(2) { animation-delay: 0.5s; }
.bola:nth-child(3) { animation-delay: 1s; }`,
    waapi: `const opcoes = { duration: 500, fill: "forwards", easing: "ease-in-out" };
const passo = [{ transform: "translateX(0)" }, { transform: "translateX(120px)" }];

const a = bolas[0].animate(passo, opcoes);
await a.finished;
const b = bolas[1].animate(passo, opcoes);
await b.finished;
bolas[2].animate(passo, opcoes);`,
    gsap: `gsap.timeline()
  .to(".bola-1", { x: 120, duration: 0.5 })
  .to(".bola-2", { x: 120, duration: 0.5 })
  .to(".bola-3", { x: 120, duration: 0.5 });`,
  },
};
