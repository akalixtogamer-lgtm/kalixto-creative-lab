import { KcxComponente } from '../kcx.types';
import { DATA_KCX, EASINGS_KCX, LICENCA_MIT, MAPA_EASING, MAPA_LOOP, variavel } from './_base';

const P = '--kcx-animated-gradient';

/**
 * Animated Gradient — fundo em gradiente que desliza entre um estado inicial e um final.
 * Nível 2 no Figma: gradiente com paradas vinculadas a variáveis de cor;
 * os quadros inicial e final viram variantes.
 */
export const ANIMATED_GRADIENT_KCX: KcxComponente = {
  id: 'animated-gradient',
  nome: 'Animated Gradient',
  categoria: 'backgrounds',
  descricao:
    'Fundo em gradiente que desliza devagar entre uma posição inicial e uma final, com título sobreposto.',
  tecnologia: ['HTML', 'CSS', 'Angular'],
  versao: '1.0.0',
  licenca: LICENCA_MIT,
  metadados: {
    autor: 'dev-Kalixto',
    tags: ['gradiente', 'gradient', 'background', 'hero', 'cores'],
    criadoEm: DATA_KCX,
    atualizadoEm: DATA_KCX,
    largura: 640,
    altura: 360,
  },
  variaveis: [
    variavel({
      id: 'gradient',
      nome: 'Gradiente',
      tipo: 'gradient',
      padrao: {
        angulo: 120,
        paradas: [
          { cor: '#ff2bd6', posicao: 0 },
          { cor: '#8b5cf6', posicao: 0.5 },
          { cor: '#22e3ff', posicao: 1 },
        ],
      },
      descricao: 'Ângulo e paradas de cor. No Figma cada parada vira uma variável de cor.',
      grupo: 'colors',
      secao: 'aparencia',
      vinculos: [
        { propriedade: 'background-image do fundo', alvo: { tipo: 'css-var', nome: `${P}-image` } },
      ],
    }),
    variavel({
      id: 'textColor',
      nome: 'Cor do texto',
      tipo: 'color',
      padrao: '#ffffff',
      modos: { dark: '#ffffff', light: '#1a1530' },
      descricao: 'Cor do título.',
      grupo: 'colors',
      secao: 'aparencia',
      vinculos: [{ propriedade: 'Cor do título', alvo: { tipo: 'css-var', nome: `${P}-text` } }],
    }),
    variavel({
      id: 'title',
      nome: 'Título',
      tipo: 'string',
      padrao: 'Gradiente animado',
      descricao: 'Texto sobre o fundo.',
      grupo: 'components',
      secao: 'aparencia',
      vinculos: [
        {
          propriedade: 'Texto do título',
          alvo: { tipo: 'texto', seletor: '.kcx-animated-gradient__titulo' },
        },
      ],
    }),
    variavel({
      id: 'titleSize',
      nome: 'Tamanho do título',
      tipo: 'dimension',
      padrao: 40,
      min: 16,
      max: 72,
      passo: 1,
      unidade: 'px',
      descricao: 'Tamanho da fonte do título.',
      grupo: 'typography',
      secao: 'aparencia',
      vinculos: [
        {
          propriedade: 'font-size do título',
          alvo: { tipo: 'css-var', nome: `${P}-title-size` },
          unidadeSaida: 'px',
        },
      ],
    }),
    variavel({
      id: 'width',
      nome: 'Largura',
      tipo: 'dimension',
      padrao: 640,
      min: 240,
      max: 960,
      passo: 10,
      unidade: 'px',
      descricao: 'Largura da área (a altura segue 16:9).',
      grupo: 'dimensions',
      secao: 'aparencia',
      vinculos: [
        {
          propriedade: 'Largura',
          alvo: { tipo: 'css-var', nome: `${P}-width` },
          unidadeSaida: 'px',
        },
        {
          propriedade: 'Altura (16:9)',
          alvo: { tipo: 'css-var', nome: `${P}-height` },
          transformar: [
            { op: 'multiplicar', fator: 0.5625 },
            { op: 'arredondar', casas: 0 },
          ],
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
      max: 48,
      passo: 1,
      unidade: 'px',
      descricao: 'Arredondamento.',
      grupo: 'dimensions',
      secao: 'aparencia',
      vinculos: [
        {
          propriedade: 'Arredondamento',
          alvo: { tipo: 'css-var', nome: `${P}-radius` },
          unidadeSaida: 'px',
        },
      ],
    }),
    variavel({
      id: 'size',
      nome: 'Tamanho do gradiente',
      tipo: 'dimension',
      padrao: 300,
      min: 150,
      max: 600,
      passo: 25,
      unidade: '%',
      descricao: 'Quanto o gradiente é maior que a caixa (folga para deslizar).',
      grupo: 'effects',
      secao: 'aparencia',
      vinculos: [
        {
          propriedade: 'background-size',
          alvo: { tipo: 'css-var', nome: `${P}-size` },
          unidadeSaida: '%',
        },
      ],
    }),
    variavel({
      id: 'duration',
      nome: 'Duração do ciclo',
      tipo: 'time',
      padrao: 10,
      min: 2,
      max: 30,
      passo: 0.5,
      unidade: 's',
      descricao: 'Tempo de ida (antes da velocidade).',
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
      id: 'delay',
      nome: 'Atraso',
      tipo: 'time',
      padrao: 0,
      min: 0,
      max: 5000,
      passo: 100,
      unidade: 'ms',
      descricao: 'Espera antes de começar (em milissegundos; convertido para segundos no CSS).',
      grupo: 'motion',
      secao: 'animacao',
      vinculos: [
        {
          propriedade: 'animation-delay',
          alvo: { tipo: 'css-var', nome: `${P}-delay` },
          transformar: [{ op: 'converter', para: 's' }],
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
      descricao: 'Divide a duração do ciclo.',
      grupo: 'motion',
      secao: 'animacao',
      vinculos: [
        { propriedade: 'Divisor da duração', alvo: { tipo: 'css-var', nome: `${P}-speed` } },
      ],
    }),
    variavel({
      id: 'easing',
      nome: 'Easing',
      tipo: 'enum',
      padrao: 'ease-in-out',
      opcoes: EASINGS_KCX,
      descricao: 'Curva de aceleração.',
      grupo: 'motion',
      secao: 'animacao',
      vinculos: [
        {
          propriedade: 'animation-timing-function',
          alvo: { tipo: 'css-var', nome: `${P}-easing` },
          transformar: [{ op: 'mapa', valores: MAPA_EASING }],
        },
      ],
    }),
    variavel({
      id: 'direction',
      nome: 'Direção',
      tipo: 'enum',
      padrao: 'alternate',
      opcoes: [
        { valor: 'alternate', rotulo: 'vai e volta' },
        { valor: 'normal', rotulo: 'só ida' },
        { valor: 'reverse', rotulo: 'só volta' },
      ],
      descricao: 'Sentido do movimento a cada repetição.',
      grupo: 'motion',
      secao: 'animacao',
      vinculos: [
        { propriedade: 'animation-direction', alvo: { tipo: 'css-var', nome: `${P}-direction` } },
      ],
    }),
    variavel({
      id: 'loop',
      nome: 'Repetir',
      tipo: 'boolean',
      padrao: true,
      descricao: 'Repete para sempre ou roda uma vez.',
      grupo: 'motion',
      secao: 'comportamento',
      vinculos: [
        {
          propriedade: 'animation-iteration-count',
          alvo: { tipo: 'css-var', nome: `${P}-iterations` },
          transformar: [{ op: 'mapa', valores: MAPA_LOOP }],
        },
      ],
    }),
    variavel({
      id: 'autoplay',
      nome: 'Reprodução automática',
      tipo: 'boolean',
      padrao: true,
      descricao: 'Começa sozinho ou fica parado no estado inicial.',
      grupo: 'motion',
      secao: 'comportamento',
      vinculos: [
        {
          propriedade: 'animation-play-state',
          alvo: { tipo: 'css-var', nome: `${P}-play` },
          transformar: [{ op: 'mapa', valores: { true: 'running', false: 'paused' } }],
        },
      ],
    }),
    variavel({
      id: 'startPosition',
      nome: 'Estado inicial',
      tipo: 'float',
      padrao: 0,
      min: 0,
      max: 100,
      passo: 1,
      unidade: '%',
      descricao: 'Posição do gradiente no início (background-position).',
      grupo: 'motion',
      secao: 'comportamento',
      vinculos: [
        {
          propriedade: 'background-position inicial',
          alvo: { tipo: 'css-var', nome: `${P}-from` },
          unidadeSaida: '%',
        },
      ],
    }),
    variavel({
      id: 'endPosition',
      nome: 'Estado final',
      tipo: 'float',
      padrao: 100,
      min: 0,
      max: 100,
      passo: 1,
      unidade: '%',
      descricao: 'Posição do gradiente no fim.',
      grupo: 'motion',
      secao: 'comportamento',
      vinculos: [
        {
          propriedade: 'background-position final',
          alvo: { tipo: 'css-var', nome: `${P}-to` },
          unidadeSaida: '%',
        },
      ],
    }),
  ],
  codigo: {
    html: `<section class="kcx-animated-gradient">
  <h1 class="kcx-animated-gradient__titulo">Gradiente animado</h1>
</section>`,
    css: `/* Animated Gradient — controlado pelas variáveis KCX */
.kcx-animated-gradient {
  display: grid;
  place-items: center;
  width: min(100%, var(${P}-width));
  height: min(var(${P}-height), 56.25vw);
  border-radius: var(${P}-radius);
  background-image: var(${P}-image);
  background-size: var(${P}-size) var(${P}-size);
  background-position: var(${P}-from) 50%;
  animation: kcx-animated-gradient-deslizar calc(var(${P}-duration) / var(${P}-speed)) var(${P}-easing) var(${P}-delay)
    var(${P}-iterations) var(${P}-direction) both;
  animation-play-state: var(${P}-play);
}

.kcx-animated-gradient__titulo {
  margin: 0;
  padding: 0 24px;
  color: var(${P}-text);
  font: 700 var(${P}-title-size) / 1.1 Inter, system-ui, sans-serif;
  text-align: center;
  text-shadow: 0 2px 12px rgb(0 0 0 / 0.45);
}

.kcx-animated-gradient__titulo:empty { display: none; }

@keyframes kcx-animated-gradient-deslizar {
  from { background-position: var(${P}-from) 50%; }
  to   { background-position: var(${P}-to) 50%; }
}

@media (prefers-reduced-motion: reduce) {
  .kcx-animated-gradient { animation: none; }
}`,
    js: `// Não precisa de JavaScript. Controle em tempo real: KCX.set('duration', 4)`,
  },
  estados: [
    {
      id: 'inicial',
      nome: 'Inicial',
      gatilho: 'inicial',
      descricao: 'Quadro do início da animação.',
      valores: {},
    },
    {
      id: 'final',
      nome: 'Final',
      gatilho: 'final',
      descricao: 'Quadro do fim da animação.',
      valores: {},
      derivar: [{ variavel: 'startPosition', de: 'endPosition', op: 'copiar' }],
    },
  ],
  presets: [
    {
      id: 'neon-purple',
      nome: 'Neon Purple',
      valores: {
        gradient: {
          angulo: 135,
          paradas: [
            { cor: '#8b5cf6', posicao: 0 },
            { cor: '#ff2bd6', posicao: 0.5 },
            { cor: '#2f7bff', posicao: 1 },
          ],
        },
      },
    },
    {
      id: 'cyber-pink',
      nome: 'Cyber Pink',
      valores: {
        gradient: {
          angulo: 90,
          paradas: [
            { cor: '#ff2bd6', posicao: 0 },
            { cor: '#ff7ae6', posicao: 0.5 },
            { cor: '#22e3ff', posicao: 1 },
          ],
        },
      },
    },
    {
      id: 'electric-blue',
      nome: 'Electric Blue',
      valores: {
        gradient: {
          angulo: 160,
          paradas: [
            { cor: '#0b1d5c', posicao: 0 },
            { cor: '#2f7bff', posicao: 0.5 },
            { cor: '#22e3ff', posicao: 1 },
          ],
        },
      },
    },
    {
      id: 'slow-motion',
      nome: 'Slow Motion',
      valores: { duration: 24, speed: 0.5, easing: 'ease-in-out' },
    },
    {
      id: 'fast-motion',
      nome: 'Fast Motion',
      valores: { duration: 3, speed: 2, easing: 'linear' },
    },
  ],
  dependencias: [],
  estrutura: {
    id: 'raiz',
    nome: 'Animated Gradient',
    tipo: 'frame',
    largura: { $var: 'width' },
    altura: {
      $derivado: 'width',
      nome: 'height',
      transformar: [
        { op: 'multiplicar', fator: 0.5625 },
        { op: 'arredondar', casas: 0 },
      ],
    },
    raio: { $var: 'radius' },
    recortar: true,
    preenchimentos: [
      {
        tipo: 'gradiente-variavel',
        variavel: 'gradient',
        tamanho: { $var: 'size' },
        deslocamento: { $var: 'startPosition' },
      },
    ],
    autoLayout: { direcao: 'vertical', espaco: 0, paddingX: 24, paddingY: 24 },
    filhos: [
      {
        id: 'titulo',
        nome: 'Título',
        tipo: 'texto',
        preenchimentos: [{ tipo: 'solido', cor: { $var: 'textColor' } }],
        texto: {
          conteudo: { $var: 'title' },
          tamanho: { $var: 'titleSize' },
          familia: 'Inter',
          estilo: 'Bold',
          alinhamento: 'centro',
          preencher: true,
          propriedade: 'Título',
        },
        propriedadeVisivel: 'Mostrar título',
        efeitos: [{ tipo: 'sombra', cor: '#00000073', raio: 12, x: 0, y: 2 }],
      },
    ],
  },
  animacoes: [
    {
      id: 'deslizar',
      nome: 'Deslizar o gradiente',
      tecnica: 'css-keyframes',
      variaveis: [
        'duration',
        'delay',
        'speed',
        'easing',
        'direction',
        'loop',
        'autoplay',
        'startPosition',
        'endPosition',
      ],
      figma: 'variantes',
      nivel: 2,
      descricao:
        'Anima background-position do estado inicial ao final. No Figma: variantes Estado=Inicial e Estado=Final.',
    },
  ],
  compatibilidade: {
    navegadores: 'Todos os navegadores atuais.',
    reducedMotion: true,
    figma: {
      nivel: 2,
      editavel: [
        'Componente reutilizável com instância de exemplo',
        'Tamanho: redimensione à vontade — o título quebra linha e continua centralizado',
        'Cores: cada parada do gradiente é uma variável de cor',
        'Título (propriedade de texto) e Mostrar título (liga/desliga), tamanho e cor por variáveis',
        'Formato: largura e raio por variáveis',
      ],
      parcial: [
        'Quadros Inicial e Final como variantes',
        'Tamanho e posição do gradiente (fixos em cada variante)',
      ],
      naoSuportado: ['Movimento contínuo entre os quadros', 'Easing, atraso, repetição e direção'],
      limitacoes: [
        'O Figma não tem variável de gradiente: cada parada vira uma variável de cor; o ângulo, o tamanho e a posição ficam fixos em cada variante.',
        'O movimento não roda no Figma; use as variantes Inicial/Final com Smart Animate num protótipo.',
      ],
    },
  },
};
