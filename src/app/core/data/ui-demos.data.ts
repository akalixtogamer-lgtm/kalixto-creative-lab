import { LabDemo, Valores } from '../models/demo.model';

/**
 * Demonstrações do Laboratório 07 — Interface Lab.
 *
 * Técnicas de composição de página extraídas das referências do Wallace
 * (pasta "efeitos pra site"), recriadas com conteúdo e ilustrações próprias.
 * Mapa referência → efeito: docs/REFERENCIAS.md
 * Animações: pages/ui-lab/ui-cenas.ts
 */

const CORES_DESTAQUE = [
  { valor: '#f5c46b', rotulo: 'dourado' },
  { valor: '#ff2bd6', rotulo: 'magenta' },
  { valor: '#22e3ff', rotulo: 'ciano' },
  { valor: '#ff7a1a', rotulo: 'laranja' },
];

const EASES = [
  { valor: 'power3.out', rotulo: 'power3.out' },
  { valor: 'expo.out', rotulo: 'expo.out' },
  { valor: 'back.out(1.6)', rotulo: 'back.out' },
];

/* =========================================================
   Biblioteca de divisores SVG (viewBox 0 0 1000 100)
   Cada camada é a área ABAIXO da borda, pintada com a cor da
   seção de baixo. Camadas com opacidade criam profundidade.
   ========================================================= */

interface Camada {
  d: string;
  opacidade: number;
}

/** Gera um caminho a partir de pontos da borda (x, y) e fecha embaixo. */
const borda = (pontos: string) => `M0,100 L${pontos} L1000,100 Z`;

function zigue(dentes: number, alto: number, baixo: number): string {
  const passo = 1000 / dentes;
  const p = Array.from(
    { length: dentes + 1 },
    (_, i) => `${(i * passo).toFixed(1)},${i % 2 ? baixo : alto}`,
  );
  return borda(p.join(' L'));
}

function ondinhas(qtd: number, y: number, amp: number): string {
  const passo = 1000 / qtd;
  let d = `M0,100 L0,${y}`;
  for (let i = 0; i < qtd; i++) {
    const x = i * passo;
    d += ` Q${(x + passo / 4).toFixed(1)},${y - amp} ${(x + passo / 2).toFixed(1)},${y} T${(x + passo).toFixed(1)},${y}`;
  }
  return d + ' L1000,100 Z';
}

function gotas(): string {
  // Gotas "escorrendo": a seção de cima avança para baixo em tubos estreitos
  const larguras = [22, 14, 30, 18, 26, 12, 34, 20, 16, 28, 22, 14, 30, 18, 24];
  const comprimentos = [38, 22, 55, 30, 46, 18, 62, 34, 26, 50, 40, 20, 58, 28, 44];
  let x = 0;
  let d = 'M0,100 L0,24';
  larguras.forEach((w, i) => {
    const vao = 1000 / larguras.length;
    const ini = x + (vao - w) / 2;
    const fim = ini + w;
    const fundo = 24 + comprimentos[i];
    d += ` L${ini.toFixed(1)},24 L${ini.toFixed(1)},${fundo - w / 2} A${w / 2},${w / 2} 0 0,0 ${fim.toFixed(1)},${fundo - w / 2} L${fim.toFixed(1)},24`;
    x += vao;
  });
  // Atenção: a área pintada é a de BAIXO, então as gotas são "vazios"
  return d + ' L1000,24 L1000,100 Z';
}

function nuvens(): string {
  const raios = [55, 40, 70, 45, 60, 38, 75, 50, 42, 66];
  let x = 0;
  let d = 'M0,100 L0,70';
  const passo = 1000 / raios.length;
  raios.forEach((r) => {
    const fim = x + passo;
    d += ` A${r},${r * 0.9} 0 0,1 ${fim.toFixed(1)},${60 + ((r * 7) % 25)}`;
    x = fim;
  });
  return d + ' L1000,100 Z';
}

export const DIVISORES_SVG: Record<string, { rotulo: string; camadas: Camada[] }> = {
  ondas: {
    rotulo: 'ondas',
    camadas: [
      { d: 'M0,100 L0,40 C150,95 350,0 500,40 C650,80 850,5 1000,45 L1000,100 Z', opacidade: 1 },
    ],
  },
  'ondas-camadas': {
    rotulo: 'ondas em camadas',
    camadas: [
      { d: 'M0,100 L0,25 C200,80 400,0 600,35 C800,70 900,20 1000,30 L1000,100 Z', opacidade: 0.3 },
      {
        d: 'M0,100 L0,45 C180,10 380,90 620,45 C820,10 920,70 1000,50 L1000,100 Z',
        opacidade: 0.55,
      },
      { d: 'M0,100 L0,65 C200,95 420,40 640,70 C820,95 920,55 1000,70 L1000,100 Z', opacidade: 1 },
    ],
  },
  leque: {
    rotulo: 'leque (opacidade)',
    camadas: [
      { d: 'M0,100 L0,40 Q500,100 1000,40 L1000,100 Z', opacidade: 0.25 },
      { d: 'M0,100 L0,55 Q500,100 1000,55 L1000,100 Z', opacidade: 0.5 },
      { d: 'M0,100 L0,70 Q500,100 1000,70 L1000,100 Z', opacidade: 1 },
    ],
  },
  triangulo: { rotulo: 'triângulo', camadas: [{ d: borda('0,0 L500,98 L1000,0'), opacidade: 1 }] },
  'triangulo-assimetrico': {
    rotulo: 'triângulo assimétrico',
    camadas: [{ d: borda('0,0 L280,98 L1000,25'), opacidade: 1 }],
  },
  inclinado: { rotulo: 'inclinado', camadas: [{ d: borda('0,85 L1000,5'), opacidade: 1 }] },
  'inclinado-opacidade': {
    rotulo: 'inclinado (opacidade)',
    camadas: [
      { d: borda('0,55 L1000,0'), opacidade: 0.35 },
      { d: borda('0,90 L1000,25'), opacidade: 1 },
    ],
  },
  curva: {
    rotulo: 'curva',
    camadas: [{ d: 'M0,100 L0,0 Q500,200 1000,0 L1000,100 Z', opacidade: 1 }],
  },
  'curva-assimetrica': {
    rotulo: 'curva assimétrica',
    camadas: [{ d: 'M0,100 L0,0 C150,170 650,130 1000,10 L1000,100 Z', opacidade: 1 }],
  },
  livro: {
    rotulo: 'livro',
    camadas: [{ d: 'M0,100 L0,5 Q250,100 500,35 Q750,100 1000,5 L1000,100 Z', opacidade: 1 }],
  },
  piramides: {
    rotulo: 'pirâmides',
    camadas: [{ d: borda('0,15 L200,60 L320,38 L580,98 L1000,15'), opacidade: 1 }],
  },
  nuvens: { rotulo: 'nuvens', camadas: [{ d: nuvens(), opacidade: 1 }] },
  gotas: { rotulo: 'gotas', camadas: [{ d: gotas(), opacidade: 1 }] },
  montanhas: {
    rotulo: 'montanhas (camadas)',
    camadas: [
      {
        d: 'M0,100 L0,45 C90,20 160,55 240,30 C330,5 400,50 480,25 C560,5 640,45 730,20 C820,0 900,40 1000,25 L1000,100 Z',
        opacidade: 0.3,
      },
      {
        d: 'M0,100 L0,60 C110,35 190,75 290,48 C380,25 460,70 560,45 C660,20 760,65 860,42 C930,30 970,50 1000,45 L1000,100 Z',
        opacidade: 0.55,
      },
      {
        d: 'M0,100 L0,78 C120,58 220,92 340,72 C450,55 560,90 680,70 C800,52 900,85 1000,68 L1000,100 Z',
        opacidade: 1,
      },
    ],
  },
  'padrao-ondas': {
    rotulo: 'padrão de ondas',
    camadas: [{ d: ondinhas(24, 70, 26), opacidade: 1 }],
  },
  'zigue-zague': { rotulo: 'zigue-zague fino', camadas: [{ d: zigue(60, 70, 92), opacidade: 1 }] },
  split: {
    rotulo: 'split (seta central)',
    camadas: [{ d: borda('0,60 L480,60 L500,92 L520,60 L1000,60'), opacidade: 1 }],
  },
};

/** Texto do SVG do divisor (usado no palco e no Code Viewer). */
export function svgDivisor(v: Valores, cor = '#0e0a1d'): string {
  const div = DIVISORES_SVG[String(v['forma'])];
  const transformacoes = [
    v['inverter'] === 'true' ? 'scaleY(-1)' : '',
    v['espelhar'] === 'true' ? 'scaleX(-1)' : '',
  ]
    .filter(Boolean)
    .join(' ');
  const caminhos = div.camadas
    .map(
      (c) =>
        `  <path d="${c.d}" fill="${cor}"${c.opacidade < 1 ? ` opacity="${c.opacidade}"` : ''} />`,
    )
    .join('\n');
  return `<svg class="divisor" viewBox="0 0 1000 100" preserveAspectRatio="none"
     style="height: ${v['altura']}px${transformacoes ? `; transform: ${transformacoes}` : ''}">
${caminhos}
</svg>`;
}

/* =========================================================
   Máscaras de imagem (viewBox 0 0 600 400)
   ========================================================= */
export const MASCARAS: Record<string, { rotulo: string; formas: string[] }> = {
  pilulas: {
    rotulo: 'pílulas diagonais',
    formas: [
      '<rect x="250" y="-60" width="110" height="420" rx="55" transform="rotate(35 305 150)" />',
      '<rect x="390" y="-20" width="110" height="460" rx="55" transform="rotate(35 445 210)" />',
      '<rect x="520" y="60" width="110" height="420" rx="55" transform="rotate(35 575 270)" />',
    ],
  },
  'corte-x': {
    rotulo: 'corte em X',
    formas: [
      '<polygon points="320,0 620,0 470,170" />',
      '<polygon points="600,30 600,370 495,200" />',
      '<polygon points="320,400 620,400 470,230" />',
    ],
  },
  blob: {
    rotulo: 'forma orgânica',
    formas: [
      '<path d="M330,0 C290,70 360,120 320,190 C280,260 330,330 300,400 L600,400 L600,0 Z" />',
    ],
  },
  onda: {
    rotulo: 'onda em camadas',
    formas: [
      '<path d="M360,0 C300,80 420,120 360,200 C300,280 420,330 340,400 L600,400 L600,0 Z" />',
    ],
  },
};

export function svgMascara(forma: string): string {
  const m = MASCARAS[forma];
  return `<svg viewBox="0 0 600 400">
  <clipPath id="recorte">
    ${m.formas.join('\n    ')}
  </clipPath>
  <image href="paisagem.svg" width="600" height="400"
         preserveAspectRatio="xMidYMid slice" clip-path="url(#recorte)" />
</svg>`;
}

/* =========================================================
   Layouts do bento grid
   ========================================================= */
export const BENTO_LAYOUTS: Record<string, string> = {
  classico: `"a a b" "a a c" "d e e"`,
  destaque: `"a b b" "c b b" "d d e"`,
  mosaico: `"a b c" "d d c" "d d e"`,
};

/* =========================================================
   DEMOS
   ========================================================= */
export const UI_DEMOS: LabDemo[] = [
  // ---------------------------------------------------------------- 1
  {
    id: 'hero-editorial',
    topico: 'Hero editorial',
    titulo: 'Hero com título editorial e entrada em sequência',
    nivel: 'intermediario',
    resumo:
      'Título fino com palavra de destaque, linha que cresce, botão circular e indicador de rolagem.',
    explicacao: [
      'A força de um hero editorial está no contraste: título grande e leve, uma única palavra em cor de destaque e muito respiro.',
      'Uma timeline do GSAP faz a entrada em ordem de leitura: menu, título (linha por linha), linha divisória, texto e botão.',
      'No modo "máscara", cada linha do título fica dentro de um recipiente com overflow: hidden e sobe de yPercent: 100 — parece surgir de uma fenda.',
    ],
    dica: 'O indicador "scroll" com uma bolinha descendo convida a rolar sem precisar de texto longo.',
    acao: 'Tocar entrada',
    instrucao: 'Escolha a cor de destaque e o tipo de entrada. Passe o mouse no botão circular.',
    presets: [
      { nome: 'Cinema', valores: { destaque: '#f5c46b', entrada: 'mascara', dur: 1.2 } },
      { nome: 'Rápido', valores: { entrada: 'subir', dur: 0.5 } },
    ],
    desafio: {
      enunciado: 'Monte uma entrada em máscara com destaque ciano em 0,8 s.',
      meta: { entrada: 'mascara', destaque: '#22e3ff', dur: 0.8 },
    },
    params: [
      {
        id: 'destaque',
        rotulo: 'Cor de destaque',
        tipo: 'select',
        opcoes: CORES_DESTAQUE,
        padrao: '#f5c46b',
      },
      {
        id: 'entrada',
        rotulo: 'Entrada do título',
        tipo: 'select',
        opcoes: [
          { valor: 'subir', rotulo: 'subir com fade' },
          { valor: 'mascara', rotulo: 'máscara (linha por linha)' },
        ],
        padrao: 'subir',
      },
      {
        id: 'dur',
        rotulo: 'Duração de cada passo',
        tipo: 'range',
        min: 0.4,
        max: 1.6,
        passo: 0.1,
        unidade: 's',
        padrao: 0.9,
      },
    ],
    codigo: (v) => `<h1 class="titulo">
  <span class="linha"><span>Movimento</span></span>
  <span class="linha"><span>além do <em style="color: ${v['destaque']}">código.</em></span></span>
</h1>

.linha { display: block; overflow: hidden; } /* a "fenda" */

const tl = gsap.timeline({ defaults: { duration: ${v['dur']}, ease: "power3.out" } });
tl.from(".nav a", { y: -20, opacity: 0, stagger: 0.08 })
  .from(".linha > span", ${
    v['entrada'] === 'mascara'
      ? '{ yPercent: 100, stagger: 0.12 }'
      : '{ y: 40, opacity: 0, stagger: 0.12 }'
  }, "-=0.4")
  .from(".divisoria", { scaleX: 0, transformOrigin: "left" }, "-=0.5")
  .from(".texto, .cta", { y: 20, opacity: 0, stagger: 0.1 }, "-=0.5");`,
  },
  // ---------------------------------------------------------------- 2
  {
    id: 'orbita',
    topico: 'Órbita e parallax',
    titulo: 'Anel orbital e camadas que seguem o mouse',
    nivel: 'avancado',
    resumo:
      'Um planeta percorre uma elipse inclinada enquanto esferas flutuam em profundidades diferentes.',
    explicacao: [
      'O anel é uma elipse do SVG convertida em caminho; o MotionPathPlugin faz o planeta percorrê-la sem parar.',
      'O anel fica dentro de um <g> com rotate(): inclinar o grupo inclina o desenho e o caminho do planeta juntos.',
      'Cada esfera tem uma profundidade: gsap.quickTo move as próximas mais que as distantes quando o mouse anda — isso é parallax por mouse.',
    ],
    dica: 'quickTo cria uma função de animação reaproveitável — muito mais leve do que criar um tween novo a cada movimento do mouse.',
    acao: '',
    aoVivo: true,
    instrucao: 'Mexa o mouse (ou o dedo) sobre o palco e ajuste a órbita.',
    presets: [
      { nome: 'Lento e profundo', valores: { vel: 18, profundidade: 40 } },
      { nome: 'Anel reto', valores: { inclinacao: 0 } },
    ],
    desafio: {
      enunciado: 'Incline o anel para o outro lado (20°) e deixe a órbita em 6 s.',
      meta: { inclinacao: 20, vel: 6 },
    },
    params: [
      {
        id: 'vel',
        rotulo: 'Tempo de uma volta',
        tipo: 'range',
        min: 4,
        max: 20,
        passo: 1,
        unidade: 's',
        padrao: 10,
      },
      {
        id: 'inclinacao',
        rotulo: 'Inclinação do anel',
        tipo: 'range',
        min: -40,
        max: 40,
        passo: 5,
        unidade: '°',
        padrao: -20,
      },
      {
        id: 'profundidade',
        rotulo: 'Força do parallax',
        tipo: 'range',
        min: 0,
        max: 40,
        passo: 5,
        unidade: 'px',
        padrao: 20,
      },
    ],
    codigo: (v) => `gsap.registerPlugin(MotionPathPlugin);

// O planeta percorre o anel (uma elipse convertida em caminho)
const [trilha] = MotionPathPlugin.convertToPath("#anel");
gsap.to("#planeta", {
  motionPath: { path: trilha, align: trilha, alignOrigin: [0.5, 0.5] },
  duration: ${v['vel']},
  repeat: -1,
  ease: "none",
});
// anel inclinado: <g transform="rotate(${v['inclinacao']} 300 200)">

// Parallax por mouse: cada camada com sua profundidade
const camadas = [...document.querySelectorAll("[data-profundidade]")].map((el) => ({
  x: gsap.quickTo(el, "x", { duration: 0.6, ease: "power3" }),
  y: gsap.quickTo(el, "y", { duration: 0.6, ease: "power3" }),
  p: Number(el.dataset.profundidade),
}));
palco.addEventListener("pointermove", (e) => {
  const r = palco.getBoundingClientRect();
  const mx = (e.clientX - r.left) / r.width - 0.5;
  const my = (e.clientY - r.top) / r.height - 0.5;
  camadas.forEach((c) => {
    c.x(mx * ${v['profundidade']} * c.p);
    c.y(my * ${v['profundidade']} * c.p);
  });
});`,
  },
  // ---------------------------------------------------------------- 3
  {
    id: 'texto-profundidade',
    topico: 'Texto atrás do objeto',
    titulo: 'Título gigante entre camadas',
    nivel: 'intermediario',
    resumo:
      'O texto fica entre o céu e o primeiro plano, como se a paisagem estivesse na frente das letras.',
    explicacao: [
      'O truque é empilhar três camadas: fundo (céu), texto e primeiro plano (silhueta com fundo transparente).',
      'Com z-index, a silhueta cobre a parte de baixo das letras — o cérebro entende que o texto está "atrás" da paisagem.',
      'Mover as camadas em velocidades diferentes com o mouse reforça a profundidade (parallax).',
    ],
    dica: 'Em fotos reais, recorte o objeto da frente em PNG/WebP com transparência e coloque-o sobre o título.',
    acao: 'Entrada',
    instrucao: 'Ajuste o tamanho do título e quanto a frente o cobre. Mova o mouse sobre o palco.',
    presets: [
      { nome: 'Monumental', valores: { tamanho: 150, sobreposicao: 45 } },
      { nome: 'Discreto', valores: { tamanho: 90, sobreposicao: 20, parallax: 5 } },
    ],
    desafio: {
      enunciado: 'Deixe a frente cobrindo 60% e sem parallax (0).',
      meta: { sobreposicao: 60, parallax: 0 },
    },
    params: [
      {
        id: 'tamanho',
        rotulo: 'Tamanho do título',
        tipo: 'range',
        min: 60,
        max: 160,
        passo: 10,
        unidade: 'px',
        padrao: 120,
      },
      {
        id: 'sobreposicao',
        rotulo: 'Frente cobrindo as letras',
        tipo: 'range',
        min: 10,
        max: 60,
        passo: 5,
        unidade: '%',
        padrao: 35,
      },
      {
        id: 'parallax',
        rotulo: 'Parallax por mouse',
        tipo: 'range',
        min: 0,
        max: 30,
        passo: 5,
        unidade: 'px',
        padrao: 15,
      },
    ],
    codigo: (v) => `<div class="cena">
  <img class="ceu" src="paisagem.svg" alt="" />
  <h1 class="titulo">KALIXTO</h1>
  <img class="frente" src="silhueta.svg" alt="" />  <!-- fundo transparente -->
</div>

.cena    { position: relative; overflow: hidden; }
.ceu     { position: absolute; inset: 0; z-index: 0; }
.titulo  { position: relative; z-index: 1; font-size: ${v['tamanho']}px; }
.frente  { position: absolute; bottom: 0; z-index: 2; height: 42%; }
/* o título desce ${v['sobreposicao']}% da sua altura para trás da frente */
.titulo  { bottom: calc(42% - 1em * ${Number(v['sobreposicao']) / 100}); }

// Entrada: o título sobe de trás da paisagem
gsap.from(".titulo", { yPercent: 60, opacity: 0, duration: 1.2, ease: "power3.out" });

// Parallax: frente anda mais que o título
gsap.quickTo(".frente", "x")(mouseX * ${v['parallax']});
gsap.quickTo(".titulo", "x")(mouseX * ${Number(v['parallax']) / 3});`,
  },
  // ---------------------------------------------------------------- 4
  {
    id: 'mascara-formas',
    topico: 'Imagem em formas',
    titulo: 'Recortar a imagem com formas',
    nivel: 'intermediario',
    resumo:
      'A imagem aparece só dentro de pílulas, cortes em X ou curvas orgânicas — como nas capas de apresentação.',
    explicacao: [
      'Um <clipPath> do SVG reúne várias formas; a imagem só aparece onde elas estão.',
      'Pílulas são retângulos com rx igual à metade da largura, giradas com transform.',
      'Formas orgânicas usam curvas de Bézier (C) num <path>; a "onda em camadas" ganha um contorno deslocado em outra cor.',
    ],
    dica: 'Deixe o texto do lado liso e a forma do lado da imagem: o recorte guia o olhar até o título.',
    acao: 'Revelar formas',
    instrucao: 'Troque a forma e clique em “Revelar formas”.',
    presets: [
      { nome: 'Pílulas no pôr do sol', valores: { forma: 'pilulas', imagem: 'por-do-sol' } },
      { nome: 'Onda na aurora', valores: { forma: 'onda', imagem: 'aurora' } },
    ],
    desafio: {
      enunciado: 'Recorte a paisagem do oceano com uma forma orgânica.',
      meta: { forma: 'blob', imagem: 'oceano' },
    },
    params: [
      {
        id: 'forma',
        rotulo: 'Forma do recorte',
        tipo: 'select',
        opcoes: Object.entries(MASCARAS).map(([valor, m]) => ({ valor, rotulo: m.rotulo })),
        padrao: 'pilulas',
      },
      {
        id: 'imagem',
        rotulo: 'Imagem',
        tipo: 'select',
        opcoes: [
          { valor: 'noite', rotulo: 'noite' },
          { valor: 'por-do-sol', rotulo: 'pôr do sol' },
          { valor: 'aurora', rotulo: 'aurora' },
          { valor: 'oceano', rotulo: 'oceano' },
        ],
        padrao: 'noite',
      },
    ],
    codigo: (v) => `${svgMascara(String(v['forma']))}

// Revelar: cada forma do recorte cresce a partir do centro
gsap.from("#recorte > *", {
  scale: 0,
  transformOrigin: "50% 50%",
  duration: 0.9,
  stagger: 0.12,
  ease: "back.out(1.4)",
});`,
  },
  // ---------------------------------------------------------------- 5
  {
    id: 'divisores-svg',
    topico: 'Divisores SVG',
    titulo: 'Biblioteca de divisores de seção',
    nivel: 'iniciante',
    resumo:
      '17 formatos de borda entre seções: ondas, nuvens, gotas, montanhas, livro, pirâmides e mais.',
    explicacao: [
      'O divisor é um SVG largo e baixo colado no fim da seção, pintado com a cor da seção seguinte.',
      'preserveAspectRatio="none" deixa o desenho esticar para qualquer largura de tela sem perder a forma geral.',
      'Camadas com opacidade (leque, montanhas, ondas em camadas) criam profundidade com uma única cor.',
    ],
    dica: 'Para inverter a direção, use transform: scaleY(-1); para espelhar, scaleX(-1). Não precisa redesenhar.',
    acao: '',
    aoVivo: true,
    instrucao: 'Escolha o formato e a altura — o resultado é ao vivo.',
    presets: [
      { nome: 'Montanhas altas', valores: { forma: 'montanhas', altura: 160 } },
      { nome: 'Nuvens', valores: { forma: 'nuvens', altura: 90 } },
      { nome: 'Gotas', valores: { forma: 'gotas', altura: 80 } },
    ],
    desafio: {
      enunciado: 'Use o divisor "livro" espelhado e invertido, com 120px.',
      meta: { forma: 'livro', espelhar: 'true', inverter: 'true', altura: 120 },
    },
    params: [
      {
        id: 'forma',
        rotulo: 'Formato',
        tipo: 'select',
        opcoes: Object.entries(DIVISORES_SVG).map(([valor, d]) => ({ valor, rotulo: d.rotulo })),
        padrao: 'ondas',
      },
      {
        id: 'altura',
        rotulo: 'Altura',
        tipo: 'range',
        min: 30,
        max: 200,
        passo: 10,
        unidade: 'px',
        padrao: 100,
      },
      {
        id: 'inverter',
        rotulo: 'Inverter (de cabeça para baixo)',
        tipo: 'select',
        opcoes: [
          { valor: 'false', rotulo: 'não' },
          { valor: 'true', rotulo: 'sim' },
        ],
        padrao: 'false',
      },
      {
        id: 'espelhar',
        rotulo: 'Espelhar (esquerda ↔ direita)',
        tipo: 'select',
        opcoes: [
          { valor: 'false', rotulo: 'não' },
          { valor: 'true', rotulo: 'sim' },
        ],
        padrao: 'false',
      },
    ],
    codigo: (v) => `<section class="secao-cima">
  …
  ${svgDivisor(v).replace(/\n/g, '\n  ')}
</section>
<section class="secao-baixo">…</section>

.secao-cima { position: relative; }
.divisor {
  position: absolute;
  left: 0;
  bottom: -1px;   /* evita uma linha fina entre as seções */
  width: 100%;
  display: block;
}`,
  },
  // ---------------------------------------------------------------- 6
  {
    id: 'carrossel-vidro',
    topico: 'Carrossel de vidro',
    titulo: 'Cards de vidro sobre uma paisagem',
    nivel: 'intermediario',
    resumo: 'Carrossel horizontal com encaixe, card ativo em destaque e paginação "02 — 05".',
    explicacao: [
      'scroll-snap-type: x mandatory faz a rolagem horizontal "encaixar" em cada card — funciona com dedo, roda e teclado.',
      'backdrop-filter: blur() desfoca o que está atrás do card, criando o vidro.',
      'Um IntersectionObserver descobre qual card está no centro para destacá-lo e atualizar a paginação.',
    ],
    dica: 'Mostre um pedaço do próximo card na borda: é o sinal mais claro de que dá para arrastar.',
    acao: 'Próximo card',
    instrucao: 'Arraste os cards (ou use “Próximo card”). Ajuste o vidro e o espaçamento.',
    presets: [
      { nome: 'Vidro forte', valores: { blur: 20, escala: 0.85 } },
      { nome: 'Sem vidro', valores: { blur: 0, escala: 1 } },
    ],
    desafio: {
      enunciado: 'Deixe os cards inativos em 80% do tamanho e com 32px de espaço.',
      meta: { escala: 0.8, espaco: 32 },
    },
    params: [
      {
        id: 'blur',
        rotulo: 'Desfoque do vidro',
        tipo: 'range',
        min: 0,
        max: 24,
        passo: 2,
        unidade: 'px',
        padrao: 12,
      },
      {
        id: 'espaco',
        rotulo: 'Espaço entre cards',
        tipo: 'range',
        min: 8,
        max: 40,
        passo: 4,
        unidade: 'px',
        padrao: 16,
      },
      {
        id: 'escala',
        rotulo: 'Tamanho dos inativos',
        tipo: 'range',
        min: 0.8,
        max: 1,
        passo: 0.05,
        unidade: 'x',
        padrao: 0.9,
      },
    ],
    codigo: (v) => `.trilho {
  display: flex;
  gap: ${v['espaco']}px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
}
.card {
  flex: 0 0 70%;
  scroll-snap-align: center;
  background: rgb(255 255 255 / 0.08);
  backdrop-filter: blur(${v['blur']}px);
  transform: scale(${v['escala']});
  transition: transform 0.4s, opacity 0.4s;
}
.card.ativo { transform: scale(1); }

// Qual card está no centro?
const obs = new IntersectionObserver((entradas) => {
  entradas.forEach((e) => {
    e.target.classList.toggle("ativo", e.isIntersecting);
    if (e.isIntersecting) paginacao.textContent = String(e.target.dataset.n).padStart(2, "0");
  });
}, { root: trilho, threshold: 0.6 });
cards.forEach((c) => obs.observe(c));`,
  },
  // ---------------------------------------------------------------- 7
  {
    id: 'numeros',
    topico: 'Números animados',
    titulo: 'Estatísticas com gráfico que se desenha',
    nivel: 'iniciante',
    resumo: 'O gráfico de linha se desenha enquanto o número conta do zero até o valor final.',
    explicacao: [
      'O DrawSVGPlugin desenha a linha do gráfico de 0% a 100%.',
      'Para contar, o GSAP anima um objeto { valor: 0 } e, a cada quadro, escreve o número formatado no texto.',
      'toLocaleString("pt-BR") coloca vírgula decimal e ponto de milhar do jeito brasileiro.',
    ],
    dica: 'Dispare a contagem quando o bloco entra na tela (ScrollTrigger) — número parado não chama atenção.',
    acao: 'Contar',
    instrucao: 'Clique em “Contar”. Mude a duração e o formato.',
    presets: [
      { nome: 'Rápido', valores: { dur: 0.75, ease: 'expo.out' } },
      { nome: 'Dramático', valores: { dur: 3, ease: 'power3.out' } },
    ],
    desafio: {
      enunciado: 'Conte com uma casa decimal, em 2 s, com ease expo.out.',
      meta: { formato: 'decimal', dur: 2, ease: 'expo.out' },
    },
    params: [
      {
        id: 'dur',
        rotulo: 'Duração',
        tipo: 'range',
        min: 0.5,
        max: 3,
        passo: 0.25,
        unidade: 's',
        padrao: 1.5,
      },
      { id: 'ease', rotulo: 'ease', tipo: 'select', opcoes: EASES, padrao: 'power3.out' },
      {
        id: 'formato',
        rotulo: 'Formato do número',
        tipo: 'select',
        opcoes: [
          { valor: 'inteiro', rotulo: 'inteiro (1.234)' },
          { valor: 'decimal', rotulo: 'decimal (20,5)' },
        ],
        padrao: 'inteiro',
      },
    ],
    codigo: (v) => `gsap.registerPlugin(DrawSVGPlugin);

const tl = gsap.timeline({ defaults: { duration: ${v['dur']}, ease: "${v['ease']}" } });

// 1. A linha do gráfico se desenha
tl.from(".grafico path", { drawSVG: "0%" }, 0);

// 2. O número conta junto
const contador = { valor: 0 };
tl.to(contador, {
  valor: 45,
  onUpdate: () => {
    numero.textContent = contador.valor.toLocaleString("pt-BR", {
      minimumFractionDigits: ${v['formato'] === 'decimal' ? 1 : 0},
      maximumFractionDigits: ${v['formato'] === 'decimal' ? 1 : 0},
    });
  },
}, 0);`,
  },
  // ---------------------------------------------------------------- 8
  {
    id: 'tipografia-vazada',
    topico: 'Tipografia vazada',
    titulo: 'Texto vazado, misto e que preenche no hover',
    nivel: 'iniciante',
    resumo:
      'Letras só com contorno, misturadas com letras cheias — muito usado em capas e títulos de seção.',
    explicacao: [
      '-webkit-text-stroke desenha o contorno das letras; com color: transparent, o miolo fica vazado.',
      'Misturar uma palavra cheia e outra vazada cria ritmo e hierarquia sem trocar de fonte.',
      'Para "preencher" no hover, um gradiente com background-clip: text cresce de 0% a 100% da largura.',
    ],
    dica: 'Contorno funciona melhor em fontes grossas (700 ou mais) e tamanhos grandes.',
    acao: '',
    aoVivo: true,
    instrucao: 'Troque o estilo. No estilo “preenche no hover”, passe o mouse no título.',
    presets: [
      { nome: 'Capa', valores: { estilo: 'misto', tamanho: 110, espessura: 2 } },
      { nome: 'Fino', valores: { estilo: 'vazado', espessura: 1 } },
    ],
    desafio: {
      enunciado: 'Configure o preenchimento no hover com contorno de 3px.',
      meta: { estilo: 'preenche', espessura: 3 },
    },
    params: [
      {
        id: 'estilo',
        rotulo: 'Estilo',
        tipo: 'select',
        opcoes: [
          { valor: 'misto', rotulo: 'misto (cheio + vazado)' },
          { valor: 'vazado', rotulo: 'só vazado' },
          { valor: 'preenche', rotulo: 'preenche no hover' },
        ],
        padrao: 'misto',
      },
      {
        id: 'espessura',
        rotulo: 'Espessura do contorno',
        tipo: 'range',
        min: 1,
        max: 4,
        passo: 0.5,
        unidade: 'px',
        padrao: 2,
      },
      {
        id: 'tamanho',
        rotulo: 'Tamanho',
        tipo: 'range',
        min: 40,
        max: 120,
        passo: 10,
        unidade: 'px',
        padrao: 90,
      },
    ],
    codigo: (v) => {
      const base = `.vazado {
  color: transparent;
  -webkit-text-stroke: ${v['espessura']}px #f5f3ff;
  font-size: ${v['tamanho']}px;
  font-weight: 800;
}`;
      if (v['estilo'] === 'preenche') {
        return `${base}

/* Preenche da esquerda para a direita no hover */
.vazado {
  background: linear-gradient(90deg, #ff2bd6, #22e3ff) no-repeat left / 0% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  transition: background-size 0.6s ease;
}
.vazado:hover { background-size: 100% 100%; }`;
      }
      return v['estilo'] === 'misto'
        ? `<h1><span class="cheio">CRIAR</span> <span class="vazado">MOVER</span></h1>

.cheio { color: #ff2bd6; }
${base}`
        : base;
    },
  },
  // ---------------------------------------------------------------- 9
  {
    id: 'bento',
    topico: 'Bento grid',
    titulo: 'Grade bento com blocos de destaque',
    nivel: 'intermediario',
    resumo: 'Blocos de tamanhos diferentes numa grade, alternando imagem, texto e cor de destaque.',
    explicacao: [
      'grid-template-areas desenha o layout com nomes: cada letra é um bloco, e repetir a letra faz o bloco ocupar mais células.',
      'Trocar só essa propriedade reorganiza tudo — o HTML não muda.',
      'Um ou dois blocos em cor sólida de destaque guiam o olhar entre imagens e textos.',
    ],
    dica: 'No celular, troque as áreas por uma coluna só com uma media query.',
    acao: 'Entrada',
    instrucao: 'Troque o layout e ajuste o espaço e o arredondamento.',
    presets: [
      { nome: 'Compacto', valores: { gap: 6, raio: 8 } },
      { nome: 'Arejado', valores: { gap: 20, raio: 28, layout: 'destaque' } },
    ],
    desafio: {
      enunciado: 'Monte o layout mosaico sem arredondamento (raio 0).',
      meta: { layout: 'mosaico', raio: 0 },
    },
    params: [
      {
        id: 'layout',
        rotulo: 'Layout',
        tipo: 'select',
        opcoes: [
          { valor: 'classico', rotulo: 'clássico' },
          { valor: 'destaque', rotulo: 'destaque grande' },
          { valor: 'mosaico', rotulo: 'mosaico' },
        ],
        padrao: 'classico',
      },
      {
        id: 'gap',
        rotulo: 'Espaço',
        tipo: 'range',
        min: 4,
        max: 24,
        passo: 2,
        unidade: 'px',
        padrao: 12,
      },
      {
        id: 'raio',
        rotulo: 'Arredondamento',
        tipo: 'range',
        min: 0,
        max: 32,
        passo: 4,
        unidade: 'px',
        padrao: 16,
      },
    ],
    codigo: (v) => `.bento {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-areas: ${BENTO_LAYOUTS[String(v['layout'])]};
  gap: ${v['gap']}px;
}
.bento > * { border-radius: ${v['raio']}px; }
.a { grid-area: a; } .b { grid-area: b; } .c { grid-area: c; }
.d { grid-area: d; } .e { grid-area: e; }

@media (max-width: 600px) {
  .bento { grid-template-columns: 1fr; grid-template-areas: "a" "b" "c" "d" "e"; }
}`,
  },
  // ---------------------------------------------------------------- 10
  {
    id: 'cards-profundidade',
    topico: 'Cards com profundidade',
    titulo: 'Cards escuros com sombras suaves e forma de destaque',
    nivel: 'intermediario',
    resumo: 'Cards numerados que parecem saltar do fundo, sobre um grande círculo de cor.',
    explicacao: [
      'Duas sombras opostas — uma escura embaixo/direita e uma clara bem sutil em cima/esquerda — dão volume ao card (neumorfismo escuro).',
      'Um círculo enorme e parcialmente cortado atrás do conteúdo cria movimento na composição sem disputar com o texto.',
      'Números grandes em cor de destaque organizam a leitura em etapas.',
    ],
    dica: 'Use a forma de destaque em no máximo 1/3 da área: ela emoldura, não compete.',
    acao: 'Entrada',
    instrucao: 'Ajuste a profundidade das sombras, o arredondamento e a cor.',
    presets: [
      { nome: 'Flutuando', valores: { profundidade: 28, raio: 28 } },
      { nome: 'Chapado', valores: { profundidade: 0, raio: 8 } },
    ],
    desafio: {
      enunciado: 'Use destaque laranja, profundidade 20 e cards bem redondos (raio 36).',
      meta: { cor: '#ff7a1a', profundidade: 20, raio: 36 },
    },
    params: [
      {
        id: 'profundidade',
        rotulo: 'Profundidade da sombra',
        tipo: 'range',
        min: 0,
        max: 30,
        passo: 2,
        unidade: 'px',
        padrao: 14,
      },
      {
        id: 'raio',
        rotulo: 'Arredondamento',
        tipo: 'range',
        min: 8,
        max: 40,
        passo: 4,
        unidade: 'px',
        padrao: 20,
      },
      {
        id: 'cor',
        rotulo: 'Cor de destaque',
        tipo: 'select',
        opcoes: CORES_DESTAQUE,
        padrao: '#ff2bd6',
      },
    ],
    codigo: (v) => {
      const p = Number(v['profundidade']);
      return `.card {
  border-radius: ${v['raio']}px;
  background: linear-gradient(145deg, #1c1630, #0f0b1d);
  box-shadow:
    ${p}px ${p}px ${p * 2}px rgb(0 0 0 / 0.6),       /* sombra escura */
    -${Math.round(p / 2)}px -${Math.round(p / 2)}px ${p}px rgb(255 255 255 / 0.05); /* luz sutil */
}
.card .numero { color: ${v['cor']}; font-size: 3rem; font-weight: 800; }

.destaque {           /* o grande círculo atrás */
  position: absolute;
  width: 70%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: ${v['cor']};
  right: -20%;
  bottom: -40%;
}`;
    },
  },
  // ---------------------------------------------------------------- 11
  {
    id: 'grao-filme',
    topico: 'Grão de filme',
    titulo: 'Grão de filme e vinheta cinematográfica',
    nivel: 'iniciante',
    resumo: 'Textura de ruído e bordas escurecidas que dão cara de cinema a qualquer imagem.',
    explicacao: [
      'O grão é um ruído gerado por <feTurbulence> num SVG usado como imagem de fundo de uma camada por cima de tudo.',
      'Uma animação em steps() desloca a camada alguns pixels várias vezes por segundo — o ruído "ferve" como película.',
      'A vinheta é um radial-gradient transparente no centro e escuro nas bordas.',
    ],
    dica: 'Mantenha o grão sutil (opacidade até 0,2) e use pointer-events: none para não bloquear cliques.',
    acao: '',
    aoVivo: true,
    instrucao: 'Ajuste o grão e a vinheta — o resultado é ao vivo.',
    presets: [
      { nome: 'Película', valores: { grao: 0.2, vinheta: 0.7, animado: 'true' } },
      { nome: 'Limpo', valores: { grao: 0, vinheta: 0 } },
    ],
    desafio: {
      enunciado: 'Grão bem sutil (0.1), parado, com vinheta forte (0.8).',
      meta: { grao: 0.1, animado: 'false', vinheta: 0.8 },
    },
    params: [
      {
        id: 'grao',
        rotulo: 'Intensidade do grão',
        tipo: 'range',
        min: 0,
        max: 0.4,
        passo: 0.05,
        unidade: '',
        padrao: 0.15,
      },
      {
        id: 'vinheta',
        rotulo: 'Vinheta',
        tipo: 'range',
        min: 0,
        max: 0.9,
        passo: 0.1,
        unidade: '',
        padrao: 0.5,
      },
      {
        id: 'animado',
        rotulo: 'Grão animado',
        tipo: 'select',
        opcoes: [
          { valor: 'true', rotulo: 'sim' },
          { valor: 'false', rotulo: 'não' },
        ],
        padrao: 'true',
      },
    ],
    codigo: (v) => `.cena { position: relative; }

/* Vinheta */
.cena::before {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, transparent 45%, rgb(0 0 0 / ${v['vinheta']}) 100%);
  pointer-events: none;
}

/* Grão */
.cena::after {
  content: "";
  position: absolute;
  inset: -50%;
  background: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23g)'/></svg>");
  opacity: ${v['grao']};
  pointer-events: none;${
    v['animado'] === 'true'
      ? `
  animation: grao 0.6s steps(6) infinite;
}
@keyframes grao {
  0%   { transform: translate(0, 0); }
  33%  { transform: translate(-5%, 3%); }
  66%  { transform: translate(4%, -4%); }
  100% { transform: translate(-2%, 5%); }`
      : ''
  }
}`,
  },
  // ---------------------------------------------------------------- 12
  {
    id: 'magnetico',
    topico: 'Botão magnético',
    titulo: 'Botões magnéticos e cursor personalizado',
    nivel: 'intermediario',
    resumo:
      'Os botões "puxam" o ponteiro quando ele chega perto, e um cursor próprio acompanha o mouse.',
    explicacao: [
      'Para cada botão, medimos a distância do mouse até o centro; dentro do raio, o botão se desloca uma fração dessa distância.',
      'gsap.quickTo move o botão e o cursor com suavidade sem criar milhares de animações.',
      'O cursor personalizado é um círculo com pointer-events: none que segue o mouse e cresce sobre elementos clicáveis.',
    ],
    dica: 'Use só no desktop (pointer: fine): no celular não existe "mouse perto".',
    acao: '',
    aoVivo: true,
    instrucao: 'Passe o mouse perto dos botões. Ajuste a força e o raio do ímã.',
    presets: [
      { nome: 'Ímã forte', valores: { forca: 0.8, raio: 160 } },
      { nome: 'Sutil', valores: { forca: 0.2, raio: 80 } },
    ],
    desafio: {
      enunciado: 'Ímã com força 0.5, raio 120 e cursor só de ponto.',
      meta: { forca: 0.5, raio: 120, cursor: 'ponto' },
    },
    params: [
      {
        id: 'forca',
        rotulo: 'Força',
        tipo: 'range',
        min: 0.1,
        max: 1,
        passo: 0.1,
        unidade: '',
        padrao: 0.4,
      },
      {
        id: 'raio',
        rotulo: 'Raio de atração',
        tipo: 'range',
        min: 40,
        max: 160,
        passo: 20,
        unidade: 'px',
        padrao: 100,
      },
      {
        id: 'cursor',
        rotulo: 'Cursor',
        tipo: 'select',
        opcoes: [
          { valor: 'anel', rotulo: 'anel' },
          { valor: 'ponto', rotulo: 'ponto' },
          { valor: 'nenhum', rotulo: 'padrão do sistema' },
        ],
        padrao: 'anel',
      },
    ],
    codigo: (v) => `const botoes = [...document.querySelectorAll(".magnetico")].map((el) => ({
  el,
  x: gsap.quickTo(el, "x", { duration: 0.4, ease: "power3" }),
  y: gsap.quickTo(el, "y", { duration: 0.4, ease: "power3" }),
}));

window.addEventListener("pointermove", (e) => {
  botoes.forEach((b) => {
    const r = b.el.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    const perto = Math.hypot(dx, dy) < ${v['raio']};
    b.x(perto ? dx * ${v['forca']} : 0);
    b.y(perto ? dy * ${v['forca']} : 0);
  });
});
${
  v['cursor'] === 'nenhum'
    ? ''
    : `
// Cursor personalizado (${v['cursor']})
const cursorX = gsap.quickTo(".cursor", "x", { duration: 0.2 });
const cursorY = gsap.quickTo(".cursor", "y", { duration: 0.2 });
window.addEventListener("pointermove", (e) => { cursorX(e.clientX); cursorY(e.clientY); });`
}`,
  },
  // ---------------------------------------------------------------- 13
  {
    id: 'marquee',
    topico: 'Faixa infinita',
    titulo: 'Marquee: faixa de texto que não para',
    nivel: 'iniciante',
    resumo:
      'Duas faixas de palavras correndo em sentidos opostos, inclinadas, que pausam no hover.',
    explicacao: [
      'O conteúdo da faixa é repetido duas vezes; a animação move -50% e recomeça — como o fim encontra o começo, o laço é invisível.',
      'Só CSS: @keyframes com translateX e animation linear infinite.',
      'Inclinar a faixa com rotate() quebra a horizontalidade da página — o mesmo objetivo dos divisores.',
    ],
    dica: 'Para acessibilidade, marque a cópia repetida com aria-hidden="true" e pause em prefers-reduced-motion.',
    acao: '',
    aoVivo: true,
    instrucao: 'Ajuste a velocidade e a inclinação. Passe o mouse para pausar.',
    presets: [
      { nome: 'Banner de evento', valores: { vel: 10, inclinacao: -4 } },
      { nome: 'Calmo', valores: { vel: 36, inclinacao: 0 } },
    ],
    desafio: {
      enunciado: 'Faixas retas (0°), rápidas (8 s) e sem pausar no hover.',
      meta: { inclinacao: 0, vel: 8, pausa: 'false' },
    },
    params: [
      {
        id: 'vel',
        rotulo: 'Tempo de uma volta',
        tipo: 'range',
        min: 6,
        max: 40,
        passo: 2,
        unidade: 's',
        padrao: 18,
      },
      {
        id: 'inclinacao',
        rotulo: 'Inclinação',
        tipo: 'range',
        min: -6,
        max: 6,
        passo: 1,
        unidade: '°',
        padrao: -3,
      },
      {
        id: 'pausa',
        rotulo: 'Pausar no hover',
        tipo: 'select',
        opcoes: [
          { valor: 'true', rotulo: 'sim' },
          { valor: 'false', rotulo: 'não' },
        ],
        padrao: 'true',
      },
    ],
    codigo: (v) => `<div class="faixa" style="rotate: ${v['inclinacao']}deg">
  <div class="faixa__trilho">
    <span>CSS · GSAP · SCROLL · SVG · THREE.JS · GLSL ·</span>
    <span aria-hidden="true">CSS · GSAP · SCROLL · SVG · THREE.JS · GLSL ·</span>
  </div>
</div>

.faixa { overflow: hidden; }
.faixa__trilho {
  display: flex;
  width: max-content;
  animation: correr ${v['vel']}s linear infinite;
}
.faixa--reversa .faixa__trilho { animation-direction: reverse; }${
      v['pausa'] === 'true' ? '\n.faixa:hover .faixa__trilho { animation-play-state: paused; }' : ''
    }

@keyframes correr { to { transform: translateX(-50%); } }

@media (prefers-reduced-motion: reduce) {
  .faixa__trilho { animation-play-state: paused; }
}`,
  },
];
