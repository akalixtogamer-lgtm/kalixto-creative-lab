import { LabDemo } from '../models/demo.model';

/**
 * Demonstrações do Laboratório 04 — SVG Lab.
 * Animações reais: pages/svg-lab/svg-animacoes.ts (GSAP + plugins de SVG).
 */

const EASES = [
  { valor: 'power2.inOut', rotulo: 'power2.inOut' },
  { valor: 'power4.out', rotulo: 'power4.out' },
  { valor: 'back.out(1.7)', rotulo: 'back.out' },
  { valor: 'elastic.out(1, 0.5)', rotulo: 'elastic.out' },
  { valor: 'none', rotulo: 'none (linear)' },
];

const DUR = (padrao: number) =>
  ({
    id: 'dur',
    rotulo: 'duration',
    tipo: 'range',
    min: 0.3,
    max: 4,
    passo: 0.1,
    unidade: 's',
    padrao,
  }) as const;

export const FORMAS_MORPH: Record<string, { rotulo: string; d: string }> = {
  circulo: {
    rotulo: 'círculo',
    d: 'M100,30 C138.7,30 170,61.3 170,100 C170,138.7 138.7,170 100,170 C61.3,170 30,138.7 30,100 C30,61.3 61.3,30 100,30 Z',
  },
  estrela: {
    rotulo: 'estrela',
    d: 'M100,20 L120,75 L178,75 L131,110 L149,168 L100,133 L51,168 L69,110 L22,75 L80,75 Z',
  },
  coracao: {
    rotulo: 'coração',
    d: 'M100,170 C60,140 25,110 25,75 C25,50 45,32 68,32 C83,32 95,40 100,52 C105,40 117,32 132,32 C155,32 175,50 175,75 C175,110 140,140 100,170 Z',
  },
  raio: {
    rotulo: 'raio',
    d: 'M115,20 L55,110 L95,110 L80,180 L150,85 L108,85 Z',
  },
};

export const SVG_DEMOS: LabDemo[] = [
  // ---------------------------------------------------------------- 1
  {
    id: 'stroke',
    topico: 'Stroke animation',
    titulo: 'Desenhar o traço',
    nivel: 'iniciante',
    resumo: 'Fazer uma linha "se desenhar" na tela.',
    explicacao: [
      'O truque clássico usa stroke-dasharray e stroke-dashoffset: um traço do tamanho do caminho, deslocado até sumir.',
      'O DrawSVGPlugin do GSAP faz essa conta para você: drawSVG: "0% 100%" desenha o caminho inteiro.',
      'Também dá para desenhar só um trecho, como "40% 60%", e animar esse trecho andando.',
    ],
    dica: 'Funciona com <path>, <line>, <circle>, <rect> e <polyline> — qualquer coisa com stroke.',
    acao: 'Desenhar',
    instrucao: 'Escolha que parte do traço aparece e clique em “Desenhar”.',
    presets: [
      { nome: 'Trecho no meio', valores: { inicio: 40, fim: 60 } },
      { nome: 'Assinatura lenta', valores: { inicio: 0, fim: 100, dur: 3.5, ease: 'none' } },
    ],
    desafio: {
      enunciado: 'Desenhe só a segunda metade do traço (50% a 100%) em 2 s.',
      meta: { inicio: 50, fim: 100, dur: 2 },
    },
    params: [
      {
        id: 'inicio',
        rotulo: 'início do trecho',
        tipo: 'range',
        min: 0,
        max: 100,
        passo: 5,
        unidade: '%',
        padrao: 0,
      },
      {
        id: 'fim',
        rotulo: 'fim do trecho',
        tipo: 'range',
        min: 0,
        max: 100,
        passo: 5,
        unidade: '%',
        padrao: 100,
      },
      DUR(1.6),
      { id: 'ease', rotulo: 'ease', tipo: 'select', opcoes: EASES, padrao: 'power2.inOut' },
    ],
    codigo: (v) => `gsap.registerPlugin(DrawSVGPlugin);

gsap.fromTo("#assinatura",
  { drawSVG: "0% 0%" },
  {
    drawSVG: "${v['inicio']}% ${v['fim']}%",
    duration: ${v['dur']},
    ease: "${v['ease']}",
  }
);`,
  },
  // ---------------------------------------------------------------- 2
  {
    id: 'mascara',
    topico: 'Máscaras',
    titulo: 'Revelar com máscara',
    nivel: 'intermediario',
    resumo: 'Mostrar uma imagem só dentro de uma forma que cresce.',
    explicacao: [
      'Uma <mask> do SVG define o que aparece: branco mostra, preto esconde.',
      'Dentro da máscara há um círculo branco; animando o raio (attr: { r }) a área visível cresce.',
      'O GSAP anima atributos do SVG com attr: { … }, além das propriedades de CSS.',
    ],
    dica: 'Máscaras aceitam qualquer forma, até texto — dá para revelar uma foto por dentro de uma palavra.',
    acao: 'Revelar',
    instrucao: 'Ajuste o raio final e de onde a revelação começa.',
    presets: [
      { nome: 'Holofote', valores: { raio: 50, origem: 'centro' } },
      { nome: 'Do canto', valores: { raio: 300, origem: 'canto' } },
    ],
    desafio: {
      enunciado: 'Revele a imagem inteira a partir do canto em 1,5 s.',
      meta: { origem: 'canto', raio: 300, dur: 1.5 },
    },
    params: [
      {
        id: 'raio',
        rotulo: 'raio final',
        tipo: 'range',
        min: 20,
        max: 300,
        passo: 10,
        unidade: '',
        padrao: 160,
      },
      {
        id: 'origem',
        rotulo: 'origem',
        tipo: 'select',
        opcoes: [
          { valor: 'centro', rotulo: 'centro' },
          { valor: 'canto', rotulo: 'canto superior esquerdo' },
        ],
        padrao: 'centro',
      },
      DUR(1.2),
    ],
    codigo: (v) => {
      const [cx, cy] = v['origem'] === 'canto' ? [0, 0] : [150, 100];
      return `<svg viewBox="0 0 300 200">
  <mask id="mascara">
    <circle id="furo" cx="${cx}" cy="${cy}" r="0" fill="white" />
  </mask>
  <g mask="url(#mascara)"> … imagem … </g>
</svg>

gsap.to("#furo", {
  attr: { r: ${v['raio']} },
  duration: ${v['dur']},
  ease: "power2.out",
});`;
    },
  },
  // ---------------------------------------------------------------- 3
  {
    id: 'morph',
    topico: 'Morphing',
    titulo: 'Transformar uma forma em outra',
    nivel: 'intermediario',
    resumo: 'Animar o próprio desenho do caminho até virar outra figura.',
    explicacao: [
      'O atributo d de um <path> descreve o desenho com comandos (M, L, C, Z).',
      'O MorphSVGPlugin interpola dois caminhos mesmo quando eles têm números de pontos diferentes.',
      'Basta dizer o destino: morphSVG: "#estrela" ou o próprio texto do caminho.',
    ],
    dica: 'Formas com quantidade parecida de pontos geram transições mais limpas.',
    acao: 'Transformar',
    instrucao: 'Escolha a forma de destino e clique em “Transformar”.',
    presets: [
      {
        nome: 'Coração elástico',
        valores: { destino: 'coracao', ease: 'elastic.out(1, 0.5)', dur: 1.6 },
      },
    ],
    desafio: {
      enunciado: 'Transforme o círculo num raio em menos de 1 s (0,6 s).',
      meta: { destino: 'raio', dur: 0.6 },
    },
    params: [
      {
        id: 'destino',
        rotulo: 'destino',
        tipo: 'select',
        opcoes: Object.entries(FORMAS_MORPH)
          .filter(([k]) => k !== 'circulo')
          .map(([valor, f]) => ({ valor, rotulo: f.rotulo })),
        padrao: 'estrela',
      },
      DUR(1),
      { id: 'ease', rotulo: 'ease', tipo: 'select', opcoes: EASES, padrao: 'back.out(1.7)' },
    ],
    codigo: (v) => `gsap.registerPlugin(MorphSVGPlugin);

gsap.to("#forma", {
  morphSVG: "#${v['destino']}",
  duration: ${v['dur']},
  ease: "${v['ease']}",
});`,
  },
  // ---------------------------------------------------------------- 4
  {
    id: 'filtros',
    topico: 'Filtros',
    titulo: 'Distorção com filtros SVG',
    nivel: 'avancado',
    resumo: 'Ondular um texto com ruído e deslocamento.',
    explicacao: [
      '<feTurbulence> gera um ruído; <feDisplacementMap> usa esse ruído para empurrar os pixels.',
      'baseFrequency controla o "tamanho" das ondas; scale controla a força da distorção.',
      'Animar esses atributos com GSAP cria efeitos de água, vidro e glitch.',
    ],
    dica: 'Filtros SVG são pesados: use em elementos pequenos e não deixe rodando o tempo todo.',
    acao: 'Ondular',
    instrucao: 'Ajuste o ruído; “Ondular” anima a distorção e volta ao normal.',
    presets: [
      { nome: 'Água', valores: { freq: 0.02, escala: 20 } },
      { nome: 'Glitch', valores: { freq: 0.09, escala: 50 } },
    ],
    desafio: {
      enunciado: 'Crie uma distorção forte (escala 60) com ondas largas (frequência 0.01).',
      meta: { escala: 60, freq: 0.01 },
    },
    params: [
      {
        id: 'freq',
        rotulo: 'baseFrequency',
        tipo: 'range',
        min: 0.01,
        max: 0.1,
        passo: 0.01,
        unidade: '',
        padrao: 0.03,
      },
      {
        id: 'escala',
        rotulo: 'scale máximo',
        tipo: 'range',
        min: 0,
        max: 60,
        passo: 5,
        unidade: '',
        padrao: 30,
      },
      DUR(1.4),
    ],
    codigo: (v) => `<filter id="onda">
  <feTurbulence id="ruido" type="fractalNoise"
    baseFrequency="${v['freq']}" numOctaves="2" />
  <feDisplacementMap in="SourceGraphic" id="deslocar" scale="0" />
</filter>

gsap.timeline()
  .to("#deslocar", { attr: { scale: ${v['escala']} }, duration: ${Number(v['dur']) / 2} })
  .to("#deslocar", { attr: { scale: 0 }, duration: ${Number(v['dur']) / 2} });`,
  },
  // ---------------------------------------------------------------- 5
  {
    id: 'motion-path',
    topico: 'Motion Path',
    titulo: 'Seguir um caminho',
    nivel: 'intermediario',
    resumo: 'Um objeto que percorre uma trilha desenhada em SVG.',
    explicacao: [
      'O MotionPathPlugin move um elemento ao longo de um <path>, como um trem num trilho.',
      'autoRotate faz o objeto girar acompanhando a curva.',
      'start e end (0 a 1) escolhem o trecho do caminho que será percorrido.',
    ],
    dica: 'Combine com DrawSVG para "desenhar" o caminho enquanto o objeto passa.',
    acao: 'Percorrer',
    instrucao: 'Escolha se o foguete gira na curva e clique em “Percorrer”.',
    presets: [{ nome: 'Volta lenta', valores: { dur: 4, ease: 'none', girar: 'true' } }],
    desafio: {
      enunciado: 'Percorra o caminho sem girar o objeto, em 2,5 s e linear.',
      meta: { girar: 'false', dur: 2.5, ease: 'none' },
    },
    params: [
      {
        id: 'girar',
        rotulo: 'autoRotate',
        tipo: 'select',
        opcoes: [
          { valor: 'true', rotulo: 'true (acompanha a curva)' },
          { valor: 'false', rotulo: 'false' },
        ],
        padrao: 'true',
      },
      DUR(2),
      { id: 'ease', rotulo: 'ease', tipo: 'select', opcoes: EASES, padrao: 'power2.inOut' },
    ],
    codigo: (v) => `gsap.registerPlugin(MotionPathPlugin);

gsap.to("#foguete", {
  duration: ${v['dur']},
  ease: "${v['ease']}",
  motionPath: {
    path: "#trilha",
    align: "#trilha",
    alignOrigin: [0.5, 0.5],
    autoRotate: ${v['girar']},
  },
});`,
  },
];
