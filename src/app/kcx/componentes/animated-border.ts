import { KcxComponente } from '../kcx.types';
import { DATA_KCX, LICENCA_MIT, variavel } from './_base';

const P = '--kcx-animated-border';

/**
 * Animated Border — card com borda em gradiente cônico que gira.
 * Nível 1 no Figma: o traço vira um gradiente angular nativo com as cores
 * vinculadas a variáveis; o giro fica no código.
 */
export const ANIMATED_BORDER_KCX: KcxComponente = {
  id: 'animated-border',
  nome: 'Animated Border',
  categoria: 'bordas',
  descricao: 'Card com borda em gradiente cônico que gira em volta do conteúdo.',
  tecnologia: ['HTML', 'CSS', 'Angular'],
  versao: '1.0.0',
  licenca: LICENCA_MIT,
  metadados: {
    autor: 'dev-Kalixto',
    tags: ['borda', 'border', 'conic-gradient', '@property', 'card'],
    criadoEm: DATA_KCX,
    atualizadoEm: DATA_KCX,
    largura: 320,
    altura: 150,
  },
  variaveis: [
    variavel({
      id: 'color1',
      nome: 'Cor 1',
      tipo: 'color',
      padrao: '#ff2bd6',
      descricao: 'Cor que abre e fecha o giro da borda.',
      grupo: 'colors',
      secao: 'aparencia',
      vinculos: [
        {
          propriedade: 'Cor 1 do conic-gradient da borda',
          alvo: { tipo: 'css-var', nome: `${P}-c1` },
        },
      ],
    }),
    variavel({
      id: 'color2',
      nome: 'Cor 2',
      tipo: 'color',
      padrao: '#22e3ff',
      descricao: 'Cor do meio do giro.',
      grupo: 'colors',
      secao: 'aparencia',
      vinculos: [
        {
          propriedade: 'Cor 2 do conic-gradient da borda',
          alvo: { tipo: 'css-var', nome: `${P}-c2` },
        },
      ],
    }),
    variavel({
      id: 'cardColor',
      nome: 'Fundo do card',
      tipo: 'color',
      padrao: '#0f0d1a',
      modos: { dark: '#0f0d1a', light: '#ffffff' },
      descricao: 'Fundo por dentro da borda.',
      grupo: 'colors',
      secao: 'aparencia',
      vinculos: [
        {
          propriedade: 'Fundo do card (padding-box)',
          alvo: { tipo: 'css-var', nome: `${P}-card` },
        },
      ],
    }),
    variavel({
      id: 'textColor',
      nome: 'Cor do título',
      tipo: 'color',
      padrao: '#f4f2ff',
      modos: { dark: '#f4f2ff', light: '#1a1530' },
      descricao: 'Cor do título.',
      grupo: 'colors',
      secao: 'aparencia',
      vinculos: [{ propriedade: 'Cor do título', alvo: { tipo: 'css-var', nome: `${P}-text` } }],
    }),
    variavel({
      id: 'mutedColor',
      nome: 'Cor do texto',
      tipo: 'color',
      padrao: '#c9c3ea',
      modos: { dark: '#c9c3ea', light: '#5b5478' },
      descricao: 'Cor do parágrafo.',
      grupo: 'colors',
      secao: 'aparencia',
      vinculos: [
        { propriedade: 'Cor do parágrafo', alvo: { tipo: 'css-var', nome: `${P}-muted` } },
      ],
    }),
    variavel({
      id: 'borderWidth',
      nome: 'Espessura da borda',
      tipo: 'dimension',
      padrao: 3,
      min: 1,
      max: 8,
      passo: 1,
      unidade: 'px',
      descricao: 'Espessura da borda em gradiente.',
      grupo: 'dimensions',
      secao: 'aparencia',
      vinculos: [
        {
          propriedade: 'border-width',
          alvo: { tipo: 'css-var', nome: `${P}-border` },
          unidadeSaida: 'px',
        },
      ],
    }),
    variavel({
      id: 'radius',
      nome: 'Border radius',
      tipo: 'dimension',
      padrao: 20,
      min: 0,
      max: 40,
      passo: 1,
      unidade: 'px',
      descricao: 'Arredondamento do card.',
      grupo: 'dimensions',
      secao: 'aparencia',
      vinculos: [
        {
          propriedade: 'border-radius',
          alvo: { tipo: 'css-var', nome: `${P}-radius` },
          unidadeSaida: 'px',
        },
      ],
    }),
    variavel({
      id: 'width',
      nome: 'Largura',
      tipo: 'dimension',
      padrao: 320,
      min: 200,
      max: 520,
      passo: 10,
      unidade: 'px',
      descricao: 'Largura do card (a altura acompanha o conteúdo).',
      grupo: 'dimensions',
      secao: 'aparencia',
      vinculos: [
        { propriedade: 'width', alvo: { tipo: 'css-var', nome: `${P}-width` }, unidadeSaida: 'px' },
      ],
    }),
    variavel({
      id: 'padding',
      nome: 'Espaçamento interno',
      tipo: 'dimension',
      padrao: 32,
      min: 12,
      max: 56,
      passo: 2,
      unidade: 'px',
      descricao: 'Padding do card.',
      grupo: 'spacing',
      secao: 'aparencia',
      vinculos: [
        {
          propriedade: 'padding',
          alvo: { tipo: 'css-var', nome: `${P}-padding` },
          unidadeSaida: 'px',
        },
      ],
    }),
    variavel({
      id: 'gap',
      nome: 'Espaço entre textos',
      tipo: 'dimension',
      padrao: 6,
      min: 0,
      max: 24,
      passo: 1,
      unidade: 'px',
      descricao: 'Distância entre o título e o parágrafo.',
      grupo: 'spacing',
      secao: 'aparencia',
      vinculos: [
        { propriedade: 'gap', alvo: { tipo: 'css-var', nome: `${P}-gap` }, unidadeSaida: 'px' },
      ],
    }),
    variavel({
      id: 'title',
      nome: 'Título',
      tipo: 'string',
      padrao: 'Plano Pro',
      descricao: 'Título do card.',
      grupo: 'components',
      secao: 'aparencia',
      vinculos: [
        {
          propriedade: 'Texto do título',
          alvo: { tipo: 'texto', seletor: '.kcx-animated-border__titulo' },
        },
      ],
    }),
    variavel({
      id: 'body',
      nome: 'Texto',
      tipo: 'string',
      padrao: 'O card em destaque.',
      descricao: 'Parágrafo do card.',
      grupo: 'components',
      secao: 'aparencia',
      vinculos: [
        {
          propriedade: 'Texto do parágrafo',
          alvo: { tipo: 'texto', seletor: '.kcx-animated-border__texto' },
        },
      ],
    }),
    variavel({
      id: 'startAngle',
      nome: 'Ângulo inicial',
      tipo: 'float',
      padrao: 0,
      min: 0,
      max: 360,
      passo: 5,
      unidade: 'deg',
      descricao: 'Onde o gradiente começa (e o ponto de partida do giro).',
      grupo: 'effects',
      secao: 'comportamento',
      vinculos: [
        {
          propriedade: 'from do conic-gradient',
          alvo: { tipo: 'css-var', nome: `${P}-start` },
          unidadeSaida: 'deg',
        },
      ],
    }),
    variavel({
      id: 'duration',
      nome: 'Tempo de uma volta',
      tipo: 'time',
      padrao: 4,
      min: 1,
      max: 12,
      passo: 0.5,
      unidade: 's',
      descricao: 'Duração de um giro completo (antes da velocidade).',
      grupo: 'motion',
      secao: 'animacao',
      vinculos: [
        {
          propriedade: 'animation-duration',
          alvo: { tipo: 'css-var', nome: `${P}-duration` },
          unidadeSaida: 's',
        },
      ],
    }),
    variavel({
      id: 'speed',
      nome: 'Velocidade',
      tipo: 'float',
      padrao: 1,
      min: 0.25,
      max: 4,
      passo: 0.05,
      unidade: 'x',
      descricao: 'Divide a duração da volta.',
      grupo: 'motion',
      secao: 'animacao',
      vinculos: [
        { propriedade: 'Divisor da duração', alvo: { tipo: 'css-var', nome: `${P}-speed` } },
      ],
    }),
    variavel({
      id: 'direction',
      nome: 'Sentido',
      tipo: 'enum',
      padrao: 'normal',
      opcoes: [
        { valor: 'normal', rotulo: 'horário' },
        { valor: 'reverse', rotulo: 'anti-horário' },
      ],
      descricao: 'Sentido do giro.',
      grupo: 'motion',
      secao: 'animacao',
      vinculos: [
        { propriedade: 'animation-direction', alvo: { tipo: 'css-var', nome: `${P}-direction` } },
      ],
    }),
    variavel({
      id: 'animate',
      nome: 'Girar',
      tipo: 'boolean',
      padrao: true,
      descricao: 'Liga ou desliga o giro (a borda continua no ângulo inicial).',
      grupo: 'motion',
      secao: 'comportamento',
      vinculos: [
        {
          propriedade: 'animation-name',
          alvo: { tipo: 'css-var', nome: `${P}-animation` },
          transformar: [
            { op: 'mapa', valores: { true: 'kcx-animated-border-girar', false: 'none' } },
          ],
        },
      ],
    }),
  ],
  codigo: {
    html: `<article class="kcx-animated-border">
  <h2 class="kcx-animated-border__titulo">Plano Pro</h2>
  <p class="kcx-animated-border__texto">O card em destaque.</p>
</article>`,
    css: `/* Animated Border — controlado pelas variáveis KCX */
/* Registrar o ângulo permite animá-lo (sem isso o gradiente pularia). */
@property --kcx-animated-border-giro {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}

.kcx-animated-border {
  display: grid;
  gap: var(${P}-gap);
  width: min(100%, var(${P}-width));
  padding: var(${P}-padding);
  border: var(${P}-border) solid transparent;
  border-radius: var(${P}-radius);
  background:
    linear-gradient(var(${P}-card), var(${P}-card)) padding-box,
    conic-gradient(
      from calc(var(${P}-start) + var(--kcx-animated-border-giro)),
      var(${P}-c1), var(${P}-c2), var(${P}-c1)
    ) border-box;
  animation: var(${P}-animation) calc(var(${P}-duration) / var(${P}-speed)) linear infinite var(${P}-direction);
}

.kcx-animated-border__titulo { margin: 0; color: var(${P}-text); font: 700 1.25rem/1.2 Inter, system-ui, sans-serif; }
.kcx-animated-border__texto { margin: 0; color: var(${P}-muted); font: 400 0.95rem/1.5 Inter, system-ui, sans-serif; }

@keyframes kcx-animated-border-girar {
  to { --kcx-animated-border-giro: 360deg; }
}

@media (prefers-reduced-motion: reduce) {
  .kcx-animated-border { animation: none; }
}`,
    js: `// Sem JavaScript: o giro é uma custom property registrada com @property.`,
  },
  estados: [],
  presets: [
    { id: 'neon-purple', nome: 'Neon Purple', valores: { color1: '#8b5cf6', color2: '#ff2bd6' } },
    { id: 'cyber-pink', nome: 'Cyber Pink', valores: { color1: '#ff2bd6', color2: '#22e3ff' } },
    {
      id: 'electric-blue',
      nome: 'Electric Blue',
      valores: { color1: '#2f7bff', color2: '#22e3ff' },
    },
    { id: 'slow-motion', nome: 'Slow Motion', valores: { duration: 10, speed: 0.5 } },
    { id: 'fast-motion', nome: 'Fast Motion', valores: { duration: 1.5, speed: 2 } },
  ],
  dependencias: [],
  estrutura: {
    id: 'raiz',
    nome: 'Animated Border',
    tipo: 'frame',
    largura: { $var: 'width' },
    raio: { $var: 'radius' },
    preenchimentos: [{ tipo: 'solido', cor: { $var: 'cardColor' } }],
    traco: {
      pintura: {
        tipo: 'gradiente-conico',
        angulo: { $var: 'startAngle' },
        paradas: [
          { posicao: 0, cor: { $var: 'color1' } },
          { posicao: 0.5, cor: { $var: 'color2' } },
          { posicao: 1, cor: { $var: 'color1' } },
        ],
      },
      espessura: { $var: 'borderWidth' },
    },
    autoLayout: {
      direcao: 'vertical',
      espaco: { $var: 'gap' },
      paddingX: { $var: 'padding' },
      paddingY: { $var: 'padding' },
    },
    filhos: [
      {
        id: 'titulo',
        nome: 'Título',
        tipo: 'texto',
        preenchimentos: [{ tipo: 'solido', cor: { $var: 'textColor' } }],
        texto: {
          conteudo: { $var: 'title' },
          tamanho: 20,
          familia: 'Inter',
          estilo: 'Bold',
          preencher: true,
          propriedade: 'Título',
        },
      },
      {
        id: 'texto',
        nome: 'Texto',
        tipo: 'texto',
        preenchimentos: [{ tipo: 'solido', cor: { $var: 'mutedColor' } }],
        texto: {
          conteudo: { $var: 'body' },
          tamanho: 15,
          familia: 'Inter',
          estilo: 'Regular',
          preencher: true,
          propriedade: 'Texto',
        },
        propriedadeVisivel: 'Mostrar texto',
      },
    ],
  },
  animacoes: [
    {
      id: 'girar',
      nome: 'Giro da borda',
      tecnica: 'css-property',
      variaveis: ['duration', 'speed', 'direction', 'animate', 'startAngle'],
      figma: 'documental',
      nivel: 1,
      descricao:
        'Anima uma custom property registrada (@property) que gira o conic-gradient. No Figma o traço é um gradiente angular parado no ângulo inicial.',
    },
  ],
  compatibilidade: {
    navegadores:
      '@property: Chrome 85+, Safari 16.4+, Firefox 128+. Sem suporte, a borda aparece parada.',
    reducedMotion: true,
    figma: {
      nivel: 1,
      editavel: [
        'Componente reutilizável com instância de exemplo',
        'Borda: traço em gradiente angular nativo, cores e espessura por variáveis',
        'Tamanho: largura por variável e altura que acompanha o texto (Auto Layout)',
        'Formato: raio, padding e espaço entre textos por variáveis',
        'Título e Texto (propriedades de texto) e Mostrar texto (liga/desliga)',
        'Cores do card e dos textos com modos Dark/Light',
      ],
      parcial: [],
      naoSuportado: ['O giro da borda (animação contínua)'],
      limitacoes: [
        'O Figma não anima o gradiente: o traço fica parado no ângulo inicial. Gire pelo ângulo inicial no lab ou pela alça do gradiente no Figma.',
      ],
    },
  },
};
