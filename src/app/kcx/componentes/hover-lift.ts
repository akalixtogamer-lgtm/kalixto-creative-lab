import { KcxComponente } from '../kcx.types';
import { DATA_KCX, LICENCA_MIT, variavel } from './_base';

const P = '--kcx-hover-lift';

/**
 * Hover Lift — botão em gradiente que sobe e ganha sombra colorida no hover.
 * Nível 2 no Figma: estados Padrão/Hover/Pressionado como variantes.
 */
export const HOVER_LIFT: KcxComponente = {
  id: 'hover-lift',
  nome: 'Hover Lift Button',
  categoria: 'botoes',
  descricao:
    'Botão em gradiente que sobe, cresce um pouco e ganha uma sombra colorida no hover e no foco.',
  tecnologia: ['HTML', 'CSS', 'Angular'],
  versao: '1.0.0',
  licenca: LICENCA_MIT,
  metadados: {
    autor: 'dev-Kalixto',
    tags: ['botão', 'hover', 'sombra', 'transition', 'cta'],
    criadoEm: DATA_KCX,
    atualizadoEm: DATA_KCX,
    largura: 220,
    altura: 52,
  },
  variaveis: [
    variavel({
      id: 'color1',
      nome: 'Cor inicial',
      tipo: 'color',
      padrao: '#d4119f',
      descricao: 'Início do gradiente do botão.',
      grupo: 'colors',
      secao: 'aparencia',
      vinculos: [
        { propriedade: 'Início do gradiente', alvo: { tipo: 'css-var', nome: `${P}-c1` } },
      ],
    }),
    variavel({
      id: 'color2',
      nome: 'Cor final',
      tipo: 'color',
      padrao: '#7c3aed',
      descricao: 'Fim do gradiente do botão.',
      grupo: 'colors',
      secao: 'aparencia',
      vinculos: [{ propriedade: 'Fim do gradiente', alvo: { tipo: 'css-var', nome: `${P}-c2` } }],
    }),
    variavel({
      id: 'textColor',
      nome: 'Cor do texto',
      tipo: 'color',
      padrao: '#ffffff',
      descricao: 'Cor do rótulo.',
      grupo: 'colors',
      secao: 'aparencia',
      vinculos: [{ propriedade: 'color', alvo: { tipo: 'css-var', nome: `${P}-text` } }],
    }),
    variavel({
      id: 'shadowColor',
      nome: 'Cor da sombra',
      tipo: 'color',
      padrao: '#ff2bd6',
      descricao: 'Cor da sombra que aparece no hover.',
      grupo: 'colors',
      secao: 'aparencia',
      vinculos: [
        {
          propriedade: 'Cor da box-shadow no hover',
          alvo: { tipo: 'css-var', nome: `${P}-shadow` },
        },
      ],
    }),
    variavel({
      id: 'shadowAlpha',
      nome: 'Força da sombra',
      tipo: 'float',
      padrao: 0.5,
      min: 0,
      max: 1,
      passo: 0.05,
      descricao: 'Opacidade da sombra no hover.',
      grupo: 'effects',
      secao: 'aparencia',
      vinculos: [
        {
          propriedade: 'Opacidade da sombra (color-mix)',
          alvo: { tipo: 'css-var', nome: `${P}-shadow-alpha` },
          transformar: [{ op: 'multiplicar', fator: 100 }],
          unidadeSaida: '%',
        },
      ],
    }),
    variavel({
      id: 'shadowBlur',
      nome: 'Desfoque da sombra',
      tipo: 'dimension',
      padrao: 24,
      min: 0,
      max: 60,
      passo: 2,
      unidade: 'px',
      descricao: 'Tamanho da sombra no hover (o deslocamento vertical é um terço disso).',
      grupo: 'effects',
      secao: 'aparencia',
      vinculos: [
        {
          propriedade: 'Desfoque e deslocamento da sombra',
          alvo: { tipo: 'css-var', nome: `${P}-blur` },
          unidadeSaida: 'px',
        },
      ],
    }),
    variavel({
      id: 'radius',
      nome: 'Border radius',
      tipo: 'dimension',
      padrao: 12,
      min: 0,
      max: 32,
      passo: 1,
      unidade: 'px',
      descricao: 'Arredondamento (32 = pílula).',
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
      id: 'paddingX',
      nome: 'Espaçamento horizontal',
      tipo: 'dimension',
      padrao: 28,
      min: 12,
      max: 56,
      passo: 2,
      unidade: 'px',
      descricao: 'Padding lateral.',
      grupo: 'spacing',
      secao: 'aparencia',
      vinculos: [
        {
          propriedade: 'padding lateral',
          alvo: { tipo: 'css-var', nome: `${P}-px` },
          unidadeSaida: 'px',
        },
      ],
    }),
    variavel({
      id: 'paddingY',
      nome: 'Espaçamento vertical',
      tipo: 'dimension',
      padrao: 14,
      min: 6,
      max: 28,
      passo: 1,
      unidade: 'px',
      descricao: 'Padding vertical.',
      grupo: 'spacing',
      secao: 'aparencia',
      vinculos: [
        {
          propriedade: 'padding vertical',
          alvo: { tipo: 'css-var', nome: `${P}-py` },
          unidadeSaida: 'px',
        },
      ],
    }),
    variavel({
      id: 'fontSize',
      nome: 'Tamanho do texto',
      tipo: 'dimension',
      padrao: 16,
      min: 12,
      max: 28,
      passo: 1,
      unidade: 'px',
      descricao: 'Tamanho da fonte do rótulo.',
      grupo: 'typography',
      secao: 'aparencia',
      vinculos: [
        {
          propriedade: 'font-size',
          alvo: { tipo: 'css-var', nome: `${P}-font` },
          unidadeSaida: 'px',
        },
      ],
    }),
    variavel({
      id: 'label',
      nome: 'Rótulo',
      tipo: 'string',
      padrao: 'Quero participar',
      descricao: 'Texto do botão.',
      grupo: 'components',
      secao: 'aparencia',
      vinculos: [
        {
          propriedade: 'Texto do botão',
          alvo: { tipo: 'texto', seletor: '.kcx-hover-lift__rotulo' },
        },
      ],
    }),
    variavel({
      id: 'lift',
      nome: 'Elevação',
      tipo: 'dimension',
      padrao: 4,
      min: 0,
      max: 16,
      passo: 1,
      unidade: 'px',
      descricao: 'Quanto o botão sobe no hover.',
      grupo: 'motion',
      secao: 'comportamento',
      vinculos: [
        {
          propriedade: 'translateY no hover',
          alvo: { tipo: 'css-var', nome: `${P}-lift` },
          unidadeSaida: 'px',
        },
      ],
    }),
    variavel({
      id: 'scale',
      nome: 'Escala no hover',
      tipo: 'float',
      padrao: 1.04,
      min: 1,
      max: 1.15,
      passo: 0.01,
      unidade: 'x',
      descricao: 'Quanto o botão cresce no hover.',
      grupo: 'motion',
      secao: 'comportamento',
      vinculos: [{ propriedade: 'scale no hover', alvo: { tipo: 'css-var', nome: `${P}-scale` } }],
    }),
    variavel({
      id: 'duration',
      nome: 'Duração',
      tipo: 'time',
      padrao: 200,
      min: 80,
      max: 600,
      passo: 20,
      unidade: 'ms',
      descricao: 'Tempo da transição.',
      grupo: 'motion',
      secao: 'animacao',
      vinculos: [
        {
          propriedade: 'transition-duration',
          alvo: { tipo: 'css-var', nome: `${P}-duration` },
          unidadeSaida: 'ms',
        },
      ],
    }),
  ],
  codigo: {
    html: `<button class="kcx-hover-lift" type="button"><span class="kcx-hover-lift__rotulo">Quero participar</span></button>`,
    css: `/* Hover Lift Button — controlado pelas variáveis KCX */
.kcx-hover-lift {
  padding: var(${P}-py) var(${P}-px);
  border: 0;
  border-radius: var(${P}-radius);
  background: linear-gradient(135deg, var(${P}-c1), var(${P}-c2));
  color: var(${P}-text);
  font: 600 var(${P}-font) / 1.2 Inter, system-ui, sans-serif;
  cursor: pointer;
  transition:
    transform var(${P}-duration) ease,
    box-shadow var(${P}-duration) ease;
}

.kcx-hover-lift:hover,
.kcx-hover-lift:focus-visible {
  transform: translateY(calc(var(${P}-lift) * -1)) scale(var(${P}-scale));
  box-shadow: 0 calc(var(${P}-blur) / 3) var(${P}-blur)
    color-mix(in srgb, var(${P}-shadow) var(${P}-shadow-alpha), transparent);
}

.kcx-hover-lift:focus-visible { outline: 2px solid var(${P}-shadow); outline-offset: 4px; }
.kcx-hover-lift:active { transform: translateY(0) scale(0.98); }

@media (prefers-reduced-motion: reduce) {
  .kcx-hover-lift:hover,
  .kcx-hover-lift:focus-visible { transform: none; }
}`,
    js: `// Sem JavaScript: hover e foco são só CSS.`,
  },
  estados: [
    {
      id: 'padrao',
      nome: 'Padrão',
      gatilho: 'padrao',
      descricao: 'Repouso, sem sombra.',
      valores: { shadowAlpha: 0 },
    },
    {
      id: 'hover',
      nome: 'Hover',
      gatilho: 'hover',
      descricao: 'Mouse sobre o botão (ou foco): sombra colorida.',
      valores: {},
    },
    {
      id: 'pressionado',
      nome: 'Pressionado',
      gatilho: 'active',
      descricao: 'Clique: sombra mais fraca.',
      valores: { shadowAlpha: 0.2, shadowBlur: 8 },
    },
  ],
  presets: [
    {
      id: 'neon-purple',
      nome: 'Neon Purple',
      valores: { color1: '#8b5cf6', color2: '#4c1d95', shadowColor: '#8b5cf6' },
    },
    {
      id: 'cyber-pink',
      nome: 'Cyber Pink',
      valores: { color1: '#ff2bd6', color2: '#ff7ae6', shadowColor: '#ff2bd6' },
    },
    {
      id: 'electric-blue',
      nome: 'Electric Blue',
      valores: { color1: '#2f7bff', color2: '#22e3ff', shadowColor: '#2f7bff' },
    },
    { id: 'soft-glow', nome: 'Soft Glow', valores: { shadowAlpha: 0.3, shadowBlur: 40, lift: 2 } },
    {
      id: 'intense-glow',
      nome: 'Intense Glow',
      valores: { shadowAlpha: 0.9, shadowBlur: 28, lift: 8, scale: 1.08 },
    },
    { id: 'slow-motion', nome: 'Slow Motion', valores: { duration: 500 } },
    { id: 'fast-motion', nome: 'Fast Motion', valores: { duration: 100 } },
  ],
  dependencias: [],
  estrutura: {
    id: 'botao',
    nome: 'Hover Lift Button',
    tipo: 'frame',
    raio: { $var: 'radius' },
    preenchimentos: [
      {
        tipo: 'gradiente-linear',
        angulo: 135,
        paradas: [
          { posicao: 0, cor: { $var: 'color1' } },
          { posicao: 1, cor: { $var: 'color2' } },
        ],
      },
    ],
    efeitos: [
      {
        tipo: 'sombra',
        x: 0,
        y: 8,
        cor: {
          $derivado: 'shadowColor',
          nome: 'shadow-color',
          transformar: [{ op: 'alpha', variavel: 'shadowAlpha' }],
        },
        raio: { $var: 'shadowBlur' },
      },
    ],
    autoLayout: {
      direcao: 'horizontal',
      espaco: 0,
      paddingX: { $var: 'paddingX' },
      paddingY: { $var: 'paddingY' },
    },
    filhos: [
      {
        id: 'rotulo',
        nome: 'Rótulo',
        tipo: 'texto',
        preenchimentos: [{ tipo: 'solido', cor: { $var: 'textColor' } }],
        texto: {
          conteudo: { $var: 'label' },
          tamanho: { $var: 'fontSize' },
          familia: 'Inter',
          estilo: 'Semi Bold',
          propriedade: 'Rótulo',
        },
      },
    ],
  },
  animacoes: [
    {
      id: 'hover',
      nome: 'Elevação no hover',
      tecnica: 'css-transition',
      variaveis: ['lift', 'scale', 'duration', 'shadowAlpha', 'shadowBlur'],
      figma: 'variantes',
      nivel: 2,
      descricao:
        'transform + box-shadow com transition. No Figma: variantes Padrão, Hover e Pressionado (use Smart Animate no protótipo).',
    },
  ],
  compatibilidade: {
    navegadores: 'color-mix(): Chrome 111+, Safari 16.2+, Firefox 113+.',
    reducedMotion: true,
    figma: {
      nivel: 2,
      editavel: [
        'Componente reutilizável com instância de exemplo',
        'Tamanho: Auto Layout — o botão cresce com o rótulo, o tamanho da fonte e o padding',
        'Cores do gradiente, do texto e da sombra por variáveis',
        'Formato: raio por variável (32 = pílula)',
        'Rótulo (propriedade de texto)',
      ],
      parcial: ['Estados Padrão, Hover e Pressionado como variantes (sombra própria em cada uma)'],
      naoSuportado: ['A subida (translateY) e a escala do hover', 'A transição'],
      limitacoes: [
        'O Figma não sobe nem escala o botão: a variante Hover mostra a sombra. Para ver o movimento, use Smart Animate entre as variantes num protótipo.',
        'A sombra de cada variante é uma variável própria (shadow-color), já com a força aplicada.',
      ],
    },
  },
};
