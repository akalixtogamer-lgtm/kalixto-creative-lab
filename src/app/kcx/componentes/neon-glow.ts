import { KcxComponente } from '../kcx.types';
import { DATA_KCX, LICENCA_MIT, variavel } from './_base';

const P = '--kcx-neon-glow';

/**
 * Neon Glow — botão com halo luminoso que pulsa.
 * Nível 2 no Figma: estrutura, cores, brilho, desfoque e estados são nativos
 * e vinculados a variáveis; a pulsação fica documentada (o Figma não executa
 * animações contínuas).
 */
export const NEON_GLOW: KcxComponente = {
  id: 'neon-glow',
  nome: 'Neon Glow',
  categoria: 'luz-profundidade',
  descricao:
    'Botão com halo neon em gradiente que pulsa, com brilho, distância e desfoque controlados por variáveis.',
  tecnologia: ['HTML', 'CSS'],
  versao: '1.0.0',
  licenca: LICENCA_MIT,
  metadados: {
    autor: 'dev-Kalixto',
    tags: ['neon', 'glow', 'brilho', 'botão', 'pulsar'],
    criadoEm: DATA_KCX,
    atualizadoEm: DATA_KCX,
    largura: 280,
    altura: 140,
  },
  variaveis: [
    variavel({
      id: 'primaryColor',
      nome: 'Cor principal',
      tipo: 'color',
      padrao: '#ff2bd6',
      descricao: 'Borda do botão, sombra luminosa e início do halo.',
      grupo: 'colors',
      secao: 'aparencia',
      vinculos: [
        {
          propriedade: 'Borda, sombra e início do halo',
          alvo: { tipo: 'css-var', nome: `${P}-primary` },
        },
      ],
    }),
    variavel({
      id: 'secondaryColor',
      nome: 'Cor secundária',
      tipo: 'color',
      padrao: '#22e3ff',
      descricao: 'Fim do halo e contorno de foco.',
      grupo: 'colors',
      secao: 'aparencia',
      vinculos: [
        {
          propriedade: 'Fim do halo e contorno de foco',
          alvo: { tipo: 'css-var', nome: `${P}-secondary` },
        },
      ],
    }),
    variavel({
      id: 'backgroundColor',
      nome: 'Cor de fundo',
      tipo: 'color',
      padrao: '#0f0d1a',
      modos: { dark: '#0f0d1a', light: '#ffffff' },
      descricao: 'Fundo do botão.',
      grupo: 'colors',
      secao: 'aparencia',
      vinculos: [{ propriedade: 'Fundo do botão', alvo: { tipo: 'css-var', nome: `${P}-bg` } }],
    }),
    variavel({
      id: 'textColor',
      nome: 'Cor do texto',
      tipo: 'color',
      padrao: '#ffffff',
      modos: { dark: '#ffffff', light: '#1a1530' },
      descricao: 'Cor do rótulo.',
      grupo: 'colors',
      secao: 'aparencia',
      vinculos: [{ propriedade: 'Cor do rótulo', alvo: { tipo: 'css-var', nome: `${P}-text` } }],
    }),
    variavel({
      id: 'glowIntensity',
      nome: 'Intensidade do brilho',
      tipo: 'float',
      padrao: 1,
      min: 0,
      max: 2,
      passo: 0.05,
      unidade: 'x',
      descricao:
        'Variável vinculada: controla ao mesmo tempo a opacidade do halo, o filtro de brilho, o alcance da sombra e a transparência das camadas de luz.',
      grupo: 'effects',
      secao: 'aparencia',
      vinculos: [
        {
          propriedade: 'Transparência das camadas luminosas (halo)',
          alvo: { tipo: 'css-var', nome: `${P}-layer-alpha` },
          transformar: [
            { op: 'mapear', de: [0, 2], para: [0.15, 0.85] },
            { op: 'limitar', min: 0, max: 1 },
          ],
        },
        {
          propriedade: 'Intensidade do filtro (brightness)',
          alvo: { tipo: 'css-var', nome: `${P}-filter` },
          transformar: [{ op: 'mapear', de: [0, 2], para: [0.9, 1.6] }],
        },
        {
          propriedade: 'Alcance visual da sombra (intensidade × distância)',
          alvo: { tipo: 'css-var', nome: `${P}-reach` },
          transformar: [
            { op: 'multiplicarPorVariavel', variavel: 'glowDistance' },
            { op: 'limitar', min: 0, max: 160 },
          ],
          unidadeSaida: 'px',
        },
        {
          propriedade: 'Opacidade do brilho interno (inset)',
          alvo: { tipo: 'css-var', nome: `${P}-inner` },
          transformar: [{ op: 'mapear', de: [0, 2], para: [0, 0.6] }],
        },
      ],
    }),
    variavel({
      id: 'glowDistance',
      nome: 'Distância do brilho',
      tipo: 'dimension',
      padrao: 24,
      min: 0,
      max: 80,
      passo: 1,
      unidade: 'px',
      descricao: 'Quanto o halo se afasta do botão.',
      grupo: 'effects',
      secao: 'aparencia',
      vinculos: [
        {
          propriedade: 'Afastamento do halo',
          alvo: { tipo: 'css-var', nome: `${P}-distance` },
          unidadeSaida: 'px',
        },
      ],
    }),
    variavel({
      id: 'blur',
      nome: 'Desfoque',
      tipo: 'dimension',
      padrao: 14,
      min: 0,
      max: 40,
      passo: 1,
      unidade: 'px',
      descricao: 'Desfoque do halo (filter: blur). No Figma: desfoque da camada.',
      grupo: 'effects',
      secao: 'aparencia',
      vinculos: [
        {
          propriedade: 'Desfoque do halo',
          alvo: { tipo: 'css-var', nome: `${P}-blur` },
          unidadeSaida: 'px',
        },
      ],
    }),
    variavel({
      id: 'opacity',
      nome: 'Opacidade',
      tipo: 'float',
      padrao: 1,
      min: 0,
      max: 1,
      passo: 0.05,
      descricao: 'Opacidade do componente inteiro.',
      grupo: 'effects',
      secao: 'aparencia',
      vinculos: [
        { propriedade: 'Opacidade do componente', alvo: { tipo: 'css-var', nome: `${P}-opacity` } },
      ],
    }),
    variavel({
      id: 'borderWidth',
      nome: 'Espessura da borda',
      tipo: 'dimension',
      padrao: 2,
      min: 0,
      max: 8,
      passo: 1,
      unidade: 'px',
      descricao: 'Espessura da borda neon.',
      grupo: 'dimensions',
      secao: 'aparencia',
      vinculos: [
        {
          propriedade: 'Espessura da borda',
          alvo: { tipo: 'css-var', nome: `${P}-border` },
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
      max: 40,
      passo: 1,
      unidade: 'px',
      descricao: 'Arredondamento do botão e do halo.',
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
      id: 'paddingX',
      nome: 'Espaçamento horizontal',
      tipo: 'dimension',
      padrao: 32,
      min: 12,
      max: 64,
      passo: 2,
      unidade: 'px',
      descricao: 'Padding lateral do botão.',
      grupo: 'spacing',
      secao: 'aparencia',
      vinculos: [
        {
          propriedade: 'Padding lateral',
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
      max: 32,
      passo: 1,
      unidade: 'px',
      descricao: 'Padding vertical do botão.',
      grupo: 'spacing',
      secao: 'aparencia',
      vinculos: [
        {
          propriedade: 'Padding vertical',
          alvo: { tipo: 'css-var', nome: `${P}-py` },
          unidadeSaida: 'px',
        },
      ],
    }),
    variavel({
      id: 'label',
      nome: 'Rótulo',
      tipo: 'string',
      padrao: 'Ao vivo',
      descricao: 'Texto do botão.',
      grupo: 'components',
      secao: 'aparencia',
      vinculos: [
        {
          propriedade: 'Texto do botão',
          alvo: { tipo: 'texto', seletor: '.kcx-neon-glow__rotulo' },
        },
      ],
    }),
    variavel({
      id: 'pulseDuration',
      nome: 'Duração da pulsação',
      tipo: 'time',
      padrao: 2,
      min: 0.4,
      max: 6,
      passo: 0.1,
      unidade: 's',
      descricao: 'Tempo de um ciclo do pulso (antes da velocidade).',
      grupo: 'motion',
      secao: 'animacao',
      vinculos: [
        {
          propriedade: 'animation-duration do halo',
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
      descricao: 'Variável vinculada: divide a duração do pulso e acelera as transições de hover.',
      grupo: 'motion',
      secao: 'animacao',
      vinculos: [
        {
          propriedade: 'Divisor da duração do pulso',
          alvo: { tipo: 'css-var', nome: `${P}-speed` },
        },
        {
          propriedade: 'Duração das transições (hover e foco)',
          alvo: { tipo: 'css-var', nome: `${P}-transition` },
          transformar: [
            { op: 'dividir', numerador: 240 },
            { op: 'arredondar', casas: 0 },
          ],
          unidadeSaida: 'ms',
        },
      ],
    }),
    variavel({
      id: 'animate',
      nome: 'Ativar animação',
      tipo: 'boolean',
      padrao: true,
      descricao: 'Liga ou desliga a pulsação.',
      grupo: 'motion',
      secao: 'comportamento',
      vinculos: [
        {
          propriedade: 'animation-name do halo',
          alvo: { tipo: 'css-var', nome: `${P}-animation` },
          transformar: [{ op: 'mapa', valores: { true: 'kcx-neon-glow-pulsar', false: 'none' } }],
        },
      ],
    }),
    variavel({
      id: 'glowEnabled',
      nome: 'Ativar brilho',
      tipo: 'boolean',
      padrao: true,
      descricao: 'Mostra ou esconde o halo. No Figma controla a visibilidade da camada.',
      grupo: 'components',
      secao: 'comportamento',
      vinculos: [
        {
          propriedade: 'Visibilidade do halo',
          alvo: { tipo: 'css-var', nome: `${P}-enabled` },
          transformar: [{ op: 'mapa', valores: { true: '1', false: '0' } }],
        },
      ],
    }),
    variavel({
      id: 'hoverBoost',
      nome: 'Reforço no hover',
      tipo: 'float',
      padrao: 1.5,
      min: 1,
      max: 2,
      passo: 0.05,
      unidade: 'x',
      descricao: 'Multiplica o alcance do brilho no hover e no foco.',
      grupo: 'effects',
      secao: 'comportamento',
      vinculos: [
        {
          propriedade: 'Escala do halo e da sombra no hover/foco',
          alvo: { tipo: 'css-var', nome: `${P}-hover` },
        },
      ],
    }),
  ],
  codigo: {
    html: `<div class="kcx-neon-glow">
  <span class="kcx-neon-glow__halo" aria-hidden="true"></span>
  <button class="kcx-neon-glow__botao" type="button"><span class="kcx-neon-glow__rotulo">Ao vivo</span></button>
</div>`,
    css: `/* Neon Glow — todas as propriedades vêm das variáveis KCX (bloco :root acima) */
.kcx-neon-glow {
  position: relative;
  display: inline-grid;
  place-items: center;
  opacity: var(${P}-opacity);
}

.kcx-neon-glow__halo {
  position: absolute;
  inset: calc(var(${P}-distance) * -0.5);
  border-radius: calc(var(${P}-radius) + var(${P}-distance) * 0.5);
  background: linear-gradient(90deg, var(${P}-primary), var(${P}-secondary));
  filter: blur(var(${P}-blur)) brightness(var(${P}-filter));
  opacity: calc(var(${P}-layer-alpha) * var(${P}-enabled));
  animation: var(${P}-animation) calc(var(${P}-duration) / var(${P}-speed)) ease-in-out infinite alternate;
  transition: scale var(${P}-transition) ease, opacity var(${P}-transition) ease;
  pointer-events: none;
}

@keyframes kcx-neon-glow-pulsar {
  from { transform: scale(0.94); opacity: calc(var(${P}-layer-alpha) * 0.55 * var(${P}-enabled)); }
  to   { transform: scale(1.04); opacity: calc(var(${P}-layer-alpha) * var(${P}-enabled)); }
}

.kcx-neon-glow__botao {
  position: relative;
  padding: var(${P}-py) var(${P}-px);
  border: var(${P}-border) solid var(${P}-primary);
  border-radius: var(${P}-radius);
  background: var(${P}-bg);
  color: var(${P}-text);
  font: 600 1rem/1 Inter, system-ui, sans-serif;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  box-shadow:
    0 0 var(${P}-reach) var(${P}-primary),
    inset 0 0 calc(var(${P}-reach) * 0.5) rgb(255 255 255 / var(${P}-inner));
  transition: box-shadow var(${P}-transition) ease, transform var(${P}-transition) ease;
}

/* Estados */
.kcx-neon-glow:hover .kcx-neon-glow__halo,
.kcx-neon-glow:focus-within .kcx-neon-glow__halo { scale: var(${P}-hover); }

.kcx-neon-glow__botao:hover,
.kcx-neon-glow__botao:focus-visible {
  box-shadow:
    0 0 calc(var(${P}-reach) * var(${P}-hover)) var(${P}-primary),
    inset 0 0 var(${P}-reach) rgb(255 255 255 / var(${P}-inner));
}

.kcx-neon-glow__botao:active { transform: scale(0.97); }
.kcx-neon-glow__botao:focus-visible { outline: 2px solid var(${P}-secondary); outline-offset: 6px; }

@media (prefers-reduced-motion: reduce) {
  .kcx-neon-glow__halo { animation: none; }
}`,
    js: `// Neon Glow não precisa de JavaScript. Para controlar em tempo real, use o runtime KCX:
// KCX.set('glowIntensity', 1.6)`,
  },
  estados: [
    { id: 'padrao', nome: 'Padrão', gatilho: 'padrao', descricao: 'Repouso.', valores: {} },
    {
      id: 'hover',
      nome: 'Hover',
      gatilho: 'hover',
      descricao: 'Mouse sobre o botão: brilho × reforço de hover.',
      valores: {},
      derivar: [{ variavel: 'glowIntensity', de: 'hoverBoost', op: 'multiplicar' }],
    },
    {
      id: 'foco',
      nome: 'Foco',
      gatilho: 'focus',
      descricao: 'Foco pelo teclado: mesmo brilho do hover.',
      valores: {},
      derivar: [{ variavel: 'glowIntensity', de: 'hoverBoost', op: 'multiplicar' }],
    },
    {
      id: 'desligado',
      nome: 'Sem brilho',
      gatilho: 'final',
      descricao: 'Halo desligado.',
      valores: { glowEnabled: false },
    },
  ],
  presets: [
    {
      id: 'neon-purple',
      nome: 'Neon Purple',
      valores: { primaryColor: '#8b5cf6', secondaryColor: '#ff2bd6' },
    },
    {
      id: 'cyber-pink',
      nome: 'Cyber Pink',
      valores: { primaryColor: '#ff2bd6', secondaryColor: '#22e3ff' },
    },
    {
      id: 'electric-blue',
      nome: 'Electric Blue',
      valores: { primaryColor: '#2f7bff', secondaryColor: '#22e3ff' },
    },
    {
      id: 'soft-glow',
      nome: 'Soft Glow',
      valores: { glowIntensity: 0.6, blur: 22, glowDistance: 16 },
    },
    {
      id: 'intense-glow',
      nome: 'Intense Glow',
      valores: { glowIntensity: 1.9, blur: 8, glowDistance: 40 },
    },
    { id: 'slow-motion', nome: 'Slow Motion', valores: { pulseDuration: 5, speed: 0.5 } },
    { id: 'fast-motion', nome: 'Fast Motion', valores: { pulseDuration: 0.8, speed: 2 } },
  ],
  dependencias: [],
  estrutura: {
    id: 'raiz',
    nome: 'Neon Glow',
    tipo: 'frame',
    largura: 280,
    altura: 140,
    opacidade: { $var: 'opacity' },
    filhos: [
      {
        id: 'halo',
        nome: 'Halo',
        tipo: 'retangulo',
        x: 56,
        y: 32,
        largura: 167,
        altura: 75,
        raio: { $var: 'radius' },
        visivel: { $var: 'glowEnabled' },
        opacidade: {
          $derivado: 'glowIntensity',
          nome: 'halo-opacity',
          transformar: [
            { op: 'mapear', de: [0, 2], para: [0.15, 0.85] },
            { op: 'limitar', min: 0, max: 1 },
          ],
        },
        preenchimentos: [
          {
            tipo: 'gradiente-linear',
            angulo: 90,
            paradas: [
              { posicao: 0, cor: { $var: 'primaryColor' } },
              { posicao: 1, cor: { $var: 'secondaryColor' } },
            ],
          },
        ],
        efeitos: [{ tipo: 'desfoque-camada', raio: { $var: 'blur' } }],
      },
      {
        id: 'botao',
        nome: 'Botão',
        tipo: 'frame',
        x: 68,
        y: 44,
        raio: { $var: 'radius' },
        preenchimentos: [{ tipo: 'solido', cor: { $var: 'backgroundColor' } }],
        traco: { cor: { $var: 'primaryColor' }, espessura: { $var: 'borderWidth' } },
        efeitos: [
          {
            tipo: 'sombra',
            cor: { $var: 'primaryColor' },
            x: 0,
            y: 0,
            raio: {
              $derivado: 'glowIntensity',
              nome: 'glow-reach',
              transformar: [
                { op: 'multiplicarPorVariavel', variavel: 'glowDistance' },
                { op: 'limitar', min: 0, max: 160 },
              ],
            },
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
              tamanho: 16,
              familia: 'Inter',
              estilo: 'Semi Bold',
              espacamento: 1.3,
              caixaAlta: true,
              propriedade: 'Rótulo',
            },
          },
        ],
      },
    ],
  },
  animacoes: [
    {
      id: 'pulsar',
      nome: 'Pulsação do halo',
      tecnica: 'css-keyframes',
      variaveis: ['pulseDuration', 'speed', 'animate', 'glowIntensity'],
      figma: 'documental',
      nivel: 2,
      descricao:
        'Keyframes de escala e opacidade, em loop alternado. No Figma fica documentada nas variáveis de Motion; os estados Hover/Foco viram variantes.',
    },
    {
      id: 'hover',
      nome: 'Transição de hover',
      tecnica: 'css-transition',
      variaveis: ['speed', 'hoverBoost'],
      figma: 'variantes',
      nivel: 2,
      descricao:
        'Aumenta a sombra e o halo no hover e no foco. No Figma: variantes Estado=Hover e Estado=Foco.',
    },
  ],
  compatibilidade: {
    navegadores: 'Navegadores atuais (scale individual: Chrome 104+, Safari 14.1+, Firefox 72+).',
    reducedMotion: true,
    figma: {
      nivel: 2,
      editavel: [
        'Botão com Auto Layout',
        'Rótulo (propriedade de texto)',
        'Cores (modos Dark/Light)',
        'Borda, raio e padding',
        'Halo com gradiente e desfoque de camada',
        'Sombra luminosa',
        'Visibilidade do halo',
      ],
      parcial: [
        'Estados Hover/Foco/Sem brilho como variantes',
        'Intensidade do brilho → variáveis derivadas (halo-opacity, glow-reach)',
      ],
      naoSuportado: ['Pulsação contínua (keyframes)', 'Filtro brightness()', 'Transições de hover'],
      limitacoes: [
        'O Figma não executa animações contínuas: duração, velocidade e ativação da pulsação ficam como variáveis de Motion documentais.',
        'O Figma não calcula fórmulas entre variáveis: halo-opacity e glow-reach são variáveis próprias, criadas com o valor calculado no lab.',
        'filter: brightness() não existe no Figma; a intensidade aparece pela opacidade do halo e pelo raio da sombra.',
        'O halo tem tamanho fixo (botão com o rótulo padrão + distância do brilho): com um rótulo bem maior, ajuste o halo à mão.',
      ],
    },
  },
};
