import { KcxComponente } from '../kcx.types';
import { DATA_KCX, EASINGS_KCX, LICENCA_MIT, MAPA_EASING, variavel } from './_base';

const P = '--kcx-gauge-meter';
/** Comprimento do arco de 270° num círculo de raio 80 (2π·80·0,75). */
const ARCO = 377;

/**
 * Gauge Meter — medidor de 270° que enche até a nota, com o número contando.
 * Só CSS e SVG: o número conta com uma custom property inteira registrada (@property).
 * Nível 2 no Figma: os arcos são arcos nativos (elipse com arcData), e os
 * quadros Cheio/Vazio viram variantes.
 */
export const GAUGE_METER_KCX: KcxComponente = {
  id: 'gauge-meter',
  nome: 'Gauge Meter',
  categoria: 'dados',
  descricao: 'Medidor circular de 270° que enche até a nota, com o número contando junto.',
  tecnologia: ['HTML', 'CSS', 'SVG', 'Angular'],
  versao: '1.0.0',
  licenca: LICENCA_MIT,
  metadados: {
    autor: 'dev-Kalixto',
    tags: ['gauge', 'medidor', 'meter', 'svg', 'progresso', 'nota'],
    criadoEm: DATA_KCX,
    atualizadoEm: DATA_KCX,
    largura: 240,
    altura: 240,
  },
  variaveis: [
    variavel({
      id: 'value',
      nome: 'Nota',
      tipo: 'number',
      padrao: 82,
      min: 0,
      max: 100,
      passo: 1,
      descricao: 'Valor de 0 a 100: o arco, o número e o aria-valuenow acompanham.',
      grupo: 'components',
      secao: 'aparencia',
      vinculos: [
        { propriedade: 'Número exibido (contador)', alvo: { tipo: 'css-var', nome: `${P}-value` } },
        {
          propriedade: 'Fração do arco preenchida',
          alvo: { tipo: 'css-var', nome: `${P}-frac` },
          transformar: [{ op: 'mapear', de: [0, 100], para: [0, 1] }],
        },
        {
          propriedade: 'aria-valuenow',
          alvo: { tipo: 'atributo', seletor: '.kcx-gauge-meter', atributo: 'aria-valuenow' },
        },
      ],
    }),
    variavel({
      id: 'arcColor',
      nome: 'Cor do arco',
      tipo: 'color',
      padrao: '#ffb547',
      descricao: 'Cor do arco preenchido, do brilho e do número.',
      grupo: 'colors',
      secao: 'aparencia',
      vinculos: [
        {
          propriedade: 'stroke do arco, brilho e número',
          alvo: { tipo: 'css-var', nome: `${P}-arc` },
        },
      ],
    }),
    variavel({
      id: 'trackColor',
      nome: 'Cor do trilho',
      tipo: 'color',
      padrao: '#ffffff1a',
      modos: { dark: '#ffffff1a', light: '#1a15301a' },
      descricao: 'Cor do arco de fundo.',
      grupo: 'colors',
      secao: 'aparencia',
      vinculos: [
        { propriedade: 'stroke do trilho', alvo: { tipo: 'css-var', nome: `${P}-track` } },
      ],
    }),
    variavel({
      id: 'labelColor',
      nome: 'Cor do rótulo',
      tipo: 'color',
      padrao: '#c9c3ea',
      modos: { dark: '#c9c3ea', light: '#5b5478' },
      descricao: 'Cor do texto abaixo do número.',
      grupo: 'colors',
      secao: 'aparencia',
      vinculos: [{ propriedade: 'Cor do rótulo', alvo: { tipo: 'css-var', nome: `${P}-label` } }],
    }),
    variavel({
      id: 'size',
      nome: 'Tamanho',
      tipo: 'dimension',
      padrao: 240,
      min: 140,
      max: 360,
      passo: 10,
      unidade: 'px',
      descricao: 'Largura e altura do medidor.',
      grupo: 'dimensions',
      secao: 'aparencia',
      vinculos: [
        {
          propriedade: 'width do medidor',
          alvo: { tipo: 'css-var', nome: `${P}-size` },
          unidadeSaida: 'px',
        },
      ],
    }),
    variavel({
      id: 'thickness',
      nome: 'Espessura do arco',
      tipo: 'dimension',
      padrao: 12,
      min: 4,
      max: 24,
      passo: 1,
      unidade: 'px',
      descricao: 'Espessura do trilho e do arco (no viewBox de 200).',
      grupo: 'dimensions',
      secao: 'aparencia',
      vinculos: [
        { propriedade: 'stroke-width', alvo: { tipo: 'css-var', nome: `${P}-thickness` } },
      ],
    }),
    variavel({
      id: 'glow',
      nome: 'Brilho',
      tipo: 'dimension',
      padrao: 8,
      min: 0,
      max: 20,
      passo: 1,
      unidade: 'px',
      descricao: 'Desfoque do brilho do arco.',
      grupo: 'effects',
      secao: 'aparencia',
      vinculos: [
        {
          propriedade: 'drop-shadow do arco',
          alvo: { tipo: 'css-var', nome: `${P}-glow` },
          unidadeSaida: 'px',
        },
      ],
    }),
    variavel({
      id: 'label',
      nome: 'Rótulo',
      tipo: 'string',
      padrao: 'nota de velocidade',
      descricao: 'Texto abaixo do número.',
      grupo: 'components',
      secao: 'aparencia',
      vinculos: [
        {
          propriedade: 'Texto do rótulo',
          alvo: { tipo: 'texto', seletor: '.kcx-gauge-meter__rotulo' },
        },
      ],
    }),
    variavel({
      id: 'duration',
      nome: 'Tempo para encher',
      tipo: 'time',
      padrao: 1600,
      min: 300,
      max: 4000,
      passo: 100,
      unidade: 'ms',
      descricao: 'Duração da animação de entrada.',
      grupo: 'motion',
      secao: 'animacao',
      vinculos: [
        {
          propriedade: 'animation-duration',
          alvo: { tipo: 'css-var', nome: `${P}-duration` },
          unidadeSaida: 'ms',
        },
      ],
    }),
    variavel({
      id: 'easing',
      nome: 'Easing',
      tipo: 'enum',
      padrao: 'suave',
      opcoes: EASINGS_KCX,
      descricao: 'Curva da animação (o número usa a mesma).',
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
      id: 'animate',
      nome: 'Animar ao aparecer',
      tipo: 'boolean',
      padrao: true,
      descricao: 'Enche do zero ao aparecer; desligado, já mostra o valor.',
      grupo: 'motion',
      secao: 'comportamento',
      vinculos: [
        {
          propriedade: 'animation-name',
          alvo: { tipo: 'css-var', nome: `${P}-animation` },
          transformar: [{ op: 'mapa', valores: { true: 'kcx-gauge-meter-encher', false: 'none' } }],
        },
      ],
    }),
  ],
  codigo: {
    html: `<section class="kcx-gauge-meter" role="meter" aria-label="Nota" aria-valuemin="0" aria-valuemax="100" aria-valuenow="82">
  <svg viewBox="0 0 200 200" aria-hidden="true">
    <circle class="kcx-gauge-meter__trilho" cx="100" cy="100" r="80" />
    <circle class="kcx-gauge-meter__valor" cx="100" cy="100" r="80" />
  </svg>
  <div class="kcx-gauge-meter__leitura">
    <span class="kcx-gauge-meter__numero" aria-hidden="true"></span>
    <span class="kcx-gauge-meter__rotulo">nota de velocidade</span>
  </div>
</section>`,
    css: `/* Gauge Meter — controlado pelas variáveis KCX, só CSS e SVG */
/* Inteiro registrado: o navegador anima de 0 até a nota e o contador mostra. */
@property --kcx-gauge-meter-n {
  syntax: '<integer>';
  initial-value: 0;
  inherits: true;
}
@property --kcx-gauge-meter-f {
  syntax: '<number>';
  initial-value: 0;
  inherits: true;
}

.kcx-gauge-meter {
  --kcx-gauge-meter-n: var(${P}-value);
  --kcx-gauge-meter-f: var(${P}-frac);
  position: relative;
  display: grid;
  place-items: center;
  width: min(80vw, var(${P}-size));
  aspect-ratio: 1;
  animation: var(${P}-animation) var(${P}-duration) var(${P}-easing) both;
}

.kcx-gauge-meter svg { width: 100%; rotate: 135deg; } /* começa embaixo à esquerda */

.kcx-gauge-meter circle {
  fill: none;
  stroke-width: var(${P}-thickness);
  stroke-linecap: round;
  stroke-dasharray: ${ARCO} 1000; /* arco de 270° + vazio que esconde o resto */
}
.kcx-gauge-meter__trilho { stroke: var(${P}-track); }
.kcx-gauge-meter__valor {
  stroke: var(${P}-arc);
  stroke-dashoffset: calc(${ARCO} * (1 - var(--kcx-gauge-meter-f)));
  filter: drop-shadow(0 0 var(${P}-glow) var(${P}-arc));
}

.kcx-gauge-meter__leitura { position: absolute; display: grid; place-items: center; gap: 4px; }
.kcx-gauge-meter__numero {
  counter-reset: kcx-nota var(--kcx-gauge-meter-n);
  color: var(${P}-arc);
  font: 800 calc(var(${P}-size) * 0.27) / 1 Inter, system-ui, sans-serif;
  font-variant-numeric: tabular-nums;
}
.kcx-gauge-meter__numero::after { content: counter(kcx-nota); }
.kcx-gauge-meter__rotulo {
  max-width: 9em;
  color: var(${P}-label);
  font: 600 11px/1.3 Inter, system-ui, sans-serif;
  letter-spacing: 0.1em;
  text-align: center;
  text-transform: uppercase;
}

@keyframes kcx-gauge-meter-encher {
  from { --kcx-gauge-meter-n: 0; --kcx-gauge-meter-f: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .kcx-gauge-meter { animation: none; }
}`,
    js: `// Sem JavaScript: o número conta com uma custom property inteira (@property) e counter().`,
  },
  estados: [
    { id: 'cheio', nome: 'Cheio', gatilho: 'final', descricao: 'Arco na nota atual.', valores: {} },
    {
      id: 'vazio',
      nome: 'Vazio',
      gatilho: 'inicial',
      descricao: 'Antes de encher.',
      valores: { value: 0 },
    },
  ],
  presets: [
    { id: 'lenta', nome: 'Faixa lenta', valores: { value: 38, arcColor: '#ff4e5e' } },
    { id: 'media', nome: 'Faixa média', valores: { value: 72, arcColor: '#ffb547' } },
    { id: 'rapida', nome: 'Faixa rápida', valores: { value: 96, arcColor: '#2ee59d' } },
    { id: 'neon-purple', nome: 'Neon Purple', valores: { arcColor: '#8b5cf6' } },
    { id: 'slow-motion', nome: 'Slow Motion', valores: { duration: 3500, easing: 'ease-in-out' } },
    { id: 'fast-motion', nome: 'Fast Motion', valores: { duration: 500, easing: 'linear' } },
  ],
  dependencias: [],
  estrutura: {
    id: 'raiz',
    nome: 'Gauge Meter',
    tipo: 'frame',
    largura: { $var: 'size' },
    altura: { $var: 'size' },
    autoLayout: { direcao: 'vertical', espaco: 4, paddingX: 16, paddingY: 16 },
    filhos: [
      {
        id: 'trilho',
        nome: 'Trilho',
        tipo: 'elipse',
        absoluto: true,
        restricoes: { h: 'STRETCH', v: 'STRETCH' },
        largura: 100,
        altura: 100,
        arco: {
          inicio: 135,
          fim: 405,
          interno: {
            $derivado: 'thickness',
            nome: 'anel',
            transformar: [
              { op: 'multiplicar', fator: 1 / 86 },
              { op: 'multiplicar', fator: -1 },
              { op: 'somar', valor: 1 },
            ],
          },
        },
        preenchimentos: [{ tipo: 'solido', cor: { $var: 'trackColor' } }],
      },
      {
        id: 'arco',
        nome: 'Arco',
        tipo: 'elipse',
        absoluto: true,
        restricoes: { h: 'STRETCH', v: 'STRETCH' },
        largura: 100,
        altura: 100,
        arco: {
          inicio: 135,
          fim: {
            $derivado: 'value',
            nome: 'fim-do-arco',
            transformar: [
              { op: 'multiplicar', fator: 2.7 },
              { op: 'somar', valor: 135.01 },
            ],
          },
          interno: {
            $derivado: 'thickness',
            nome: 'anel',
            transformar: [
              { op: 'multiplicar', fator: 1 / 86 },
              { op: 'multiplicar', fator: -1 },
              { op: 'somar', valor: 1 },
            ],
          },
        },
        preenchimentos: [{ tipo: 'solido', cor: { $var: 'arcColor' } }],
        efeitos: [
          { tipo: 'sombra', cor: { $var: 'arcColor' }, raio: { $var: 'glow' }, x: 0, y: 0 },
        ],
      },
      {
        id: 'numero',
        nome: 'Número',
        tipo: 'texto',
        preenchimentos: [{ tipo: 'solido', cor: { $var: 'arcColor' } }],
        texto: {
          conteudo: {
            $derivado: 'value',
            nome: 'numero',
            transformar: [{ op: 'arredondar', casas: 0 }],
          },
          tamanho: {
            $derivado: 'size',
            nome: 'numero-size',
            transformar: [
              { op: 'multiplicar', fator: 0.27 },
              { op: 'arredondar', casas: 0 },
            ],
          },
          familia: 'Inter',
          estilo: 'Extra Bold',
          alinhamento: 'centro',
        },
      },
      {
        id: 'rotulo',
        nome: 'Rótulo',
        tipo: 'texto',
        preenchimentos: [{ tipo: 'solido', cor: { $var: 'labelColor' } }],
        texto: {
          conteudo: { $var: 'label' },
          tamanho: 11,
          espacamento: 1.1,
          familia: 'Inter',
          estilo: 'Semi Bold',
          caixaAlta: true,
          alinhamento: 'centro',
          propriedade: 'Rótulo',
        },
        propriedadeVisivel: 'Mostrar rótulo',
      },
    ],
  },
  animacoes: [
    {
      id: 'encher',
      nome: 'Encher e contar',
      tecnica: 'css-property',
      variaveis: ['value', 'duration', 'easing', 'animate'],
      figma: 'variantes',
      nivel: 2,
      descricao:
        'Anima duas custom properties registradas (fração do arco e número). No Figma: variantes Estado=Cheio e Estado=Vazio.',
    },
  ],
  compatibilidade: {
    navegadores:
      '@property: Chrome 85+, Safari 16.4+, Firefox 128+. Sem suporte, o medidor aparece direto no valor final.',
    reducedMotion: true,
    figma: {
      nivel: 2,
      editavel: [
        'Componente reutilizável com instância de exemplo',
        'Formato: arcos nativos do Figma (trilho e valor) — ajuste o início, o fim e a espessura do anel nas alças do arco',
        'Tamanho: redimensione e os arcos esticam junto (o tamanho também é variável)',
        'Cores do arco, do trilho e do rótulo por variáveis (modos Dark/Light)',
        'Número e tamanho do número por variáveis; Rótulo (propriedade de texto) e Mostrar rótulo (liga/desliga)',
      ],
      parcial: ['Quadros Cheio e Vazio como variantes'],
      naoSuportado: ['A contagem do número e o arco enchendo (animação)'],
      limitacoes: [
        'O fim do arco é calculado da nota no lab: no Figma, mude a nota reexportando ou arraste a alça do arco.',
        'O arco nativo do Figma tem pontas retas; no navegador as pontas são arredondadas (stroke-linecap).',
      ],
    },
  },
};
