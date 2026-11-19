import { KcxComponente } from '../kcx.types';
import { DATA_KCX, EASINGS_KCX, LICENCA_MIT, MAPA_EASING, MAPA_LOOP, variavel } from './_base';

const P = '--kcx-svg-motion';

/** Caminhos (viewBox 0 0 400 160, comandos absolutos). */
export const CAMINHOS_SVG_MOTION: Record<string, string> = {
  onda: 'M 10 80 C 60 10 110 10 160 80 S 260 150 310 80 S 380 20 390 40',
  laco: 'M 20 120 C 80 120 120 20 200 30 C 280 40 260 140 200 130 C 140 120 170 40 380 40',
  zigue: 'M 10 130 L 80 30 L 150 130 L 220 30 L 290 130 L 390 30',
};

const svgDe = (d: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="160" viewBox="0 0 400 160"><path d="${d}" fill="none" stroke="#22e3ff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const MAPA_D = CAMINHOS_SVG_MOTION;
const MAPA_OFFSET = Object.fromEntries(
  Object.entries(CAMINHOS_SVG_MOTION).map(([k, d]) => [k, `path("${d}")`]),
);
const MAPA_SVG = Object.fromEntries(
  Object.entries(CAMINHOS_SVG_MOTION).map(([k, d]) => [k, svgDe(d)]),
);

/**
 * SVG Motion — uma linha que se desenha (stroke-dashoffset) e um ponto que
 * percorre o mesmo caminho (CSS Motion Path).
 * Nível 1/2 no Figma: o caminho vira vetor nativo com traço vinculado às
 * variáveis; formas e quadros (início, meio, fim) viram variantes.
 */
export const SVG_MOTION: KcxComponente = {
  id: 'svg-motion',
  nome: 'SVG Motion',
  categoria: 'svg',
  descricao:
    'Linha SVG que se desenha e um ponto luminoso que percorre o mesmo caminho, com forma, tempo e progresso controlados por variáveis.',
  tecnologia: ['HTML', 'CSS', 'SVG', 'Angular'],
  versao: '1.0.0',
  licenca: LICENCA_MIT,
  metadados: {
    autor: 'dev-Kalixto',
    tags: ['svg', 'path', 'line drawing', 'motion path', 'traço'],
    criadoEm: DATA_KCX,
    atualizadoEm: DATA_KCX,
    largura: 400,
    altura: 160,
  },
  variaveis: [
    variavel({
      id: 'strokeColor',
      nome: 'Cor da linha',
      tipo: 'color',
      padrao: '#22e3ff',
      descricao: 'Cor do traço e da trilha.',
      grupo: 'colors',
      secao: 'aparencia',
      vinculos: [
        {
          propriedade: 'stroke da linha e da trilha',
          alvo: { tipo: 'css-var', nome: `${P}-stroke` },
        },
      ],
    }),
    variavel({
      id: 'accentColor',
      nome: 'Cor do ponto',
      tipo: 'color',
      padrao: '#ff2bd6',
      descricao: 'Cor e brilho do ponto que percorre o caminho.',
      grupo: 'colors',
      secao: 'aparencia',
      vinculos: [
        { propriedade: 'Fundo e brilho do ponto', alvo: { tipo: 'css-var', nome: `${P}-accent` } },
      ],
    }),
    variavel({
      id: 'strokeWidth',
      nome: 'Espessura',
      tipo: 'dimension',
      padrao: 4,
      min: 1,
      max: 12,
      passo: 0.5,
      unidade: 'px',
      descricao: 'Espessura do traço.',
      grupo: 'dimensions',
      secao: 'aparencia',
      vinculos: [{ propriedade: 'stroke-width', alvo: { tipo: 'css-var', nome: `${P}-width` } }],
    }),
    variavel({
      id: 'trailOpacity',
      nome: 'Opacidade da trilha',
      tipo: 'float',
      padrao: 0.2,
      min: 0,
      max: 1,
      passo: 0.05,
      descricao: 'Opacidade do caminho completo, por baixo da linha desenhada.',
      grupo: 'effects',
      secao: 'aparencia',
      vinculos: [
        { propriedade: 'Opacidade da trilha', alvo: { tipo: 'css-var', nome: `${P}-trail` } },
      ],
    }),
    variavel({
      id: 'dotSize',
      nome: 'Tamanho do ponto',
      tipo: 'dimension',
      padrao: 14,
      min: 4,
      max: 32,
      passo: 1,
      unidade: 'px',
      descricao: 'Diâmetro do ponto (o brilho acompanha).',
      grupo: 'dimensions',
      secao: 'aparencia',
      vinculos: [
        {
          propriedade: 'Largura, altura e brilho do ponto',
          alvo: { tipo: 'css-var', nome: `${P}-dot` },
          unidadeSaida: 'px',
        },
      ],
    }),
    variavel({
      id: 'shape',
      nome: 'Forma do caminho',
      tipo: 'enum',
      padrao: 'onda',
      opcoes: [
        { valor: 'onda', rotulo: 'onda' },
        { valor: 'laco', rotulo: 'laço' },
        { valor: 'zigue', rotulo: 'zigue-zague' },
      ],
      descricao: 'Troca o desenho do caminho. No Figma vira uma propriedade de variante.',
      grupo: 'components',
      secao: 'aparencia',
      vinculos: [
        {
          propriedade: 'Atributo d dos paths',
          alvo: { tipo: 'atributo', seletor: '.kcx-svg-motion path', atributo: 'd' },
          transformar: [{ op: 'mapa', valores: MAPA_D }],
        },
        {
          propriedade: 'offset-path do ponto',
          alvo: { tipo: 'css-var', nome: `${P}-path` },
          transformar: [{ op: 'mapa', valores: MAPA_OFFSET }],
        },
      ],
    }),
    variavel({
      id: 'duration',
      nome: 'Duração',
      tipo: 'time',
      padrao: 3,
      min: 0.5,
      max: 10,
      passo: 0.1,
      unidade: 's',
      descricao: 'Tempo para percorrer o caminho (antes da velocidade).',
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
      max: 3,
      passo: 0.1,
      unidade: 's',
      descricao: 'Espera antes de começar.',
      grupo: 'motion',
      secao: 'animacao',
      vinculos: [
        {
          propriedade: 'animation-delay',
          alvo: { tipo: 'css-var', nome: `${P}-delay` },
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
      descricao: 'Divide a duração.',
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
      padrao: 'suave',
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
      descricao: 'Sentido a cada repetição.',
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
      descricao: 'Anima sozinho; desligado, o desenho para no progresso escolhido.',
      grupo: 'motion',
      secao: 'comportamento',
      vinculos: [
        {
          propriedade: 'Animação da linha',
          alvo: { tipo: 'css-var', nome: `${P}-anim-linha` },
          transformar: [
            { op: 'mapa', valores: { true: 'kcx-svg-motion-desenhar', false: 'none' } },
          ],
        },
        {
          propriedade: 'Animação do ponto',
          alvo: { tipo: 'css-var', nome: `${P}-anim-ponto` },
          transformar: [
            { op: 'mapa', valores: { true: 'kcx-svg-motion-percorrer', false: 'none' } },
          ],
        },
      ],
    }),
    variavel({
      id: 'progress',
      nome: 'Progresso (parado)',
      tipo: 'float',
      padrao: 1,
      min: 0,
      max: 1,
      passo: 0.01,
      descricao:
        'Quanto do caminho aparece quando a animação está desligada (e com movimento reduzido).',
      grupo: 'motion',
      secao: 'comportamento',
      vinculos: [
        {
          propriedade: 'stroke-dashoffset da linha',
          alvo: { tipo: 'css-var', nome: `${P}-offset` },
          transformar: [{ op: 'mapear', de: [0, 1], para: [1, 0] }],
        },
        {
          propriedade: 'offset-distance do ponto',
          alvo: { tipo: 'css-var', nome: `${P}-distance` },
          transformar: [{ op: 'multiplicar', fator: 100 }],
          unidadeSaida: '%',
        },
      ],
    }),
  ],
  codigo: {
    html: `<div class="kcx-svg-motion" role="img" aria-label="Linha que se desenha com um ponto percorrendo o caminho">
  <svg viewBox="0 0 400 160" width="400" height="160" aria-hidden="true">
    <path class="kcx-svg-motion__trilha" d="${CAMINHOS_SVG_MOTION['onda']}" pathLength="1" />
    <path class="kcx-svg-motion__linha" d="${CAMINHOS_SVG_MOTION['onda']}" pathLength="1" />
  </svg>
  <span class="kcx-svg-motion__ponto"></span>
</div>`,
    css: `/* SVG Motion — controlado pelas variáveis KCX */
.kcx-svg-motion {
  position: relative;
  width: 400px;
  height: 160px;
  max-width: 100%;
}

.kcx-svg-motion svg { position: absolute; inset: 0; overflow: visible; }

.kcx-svg-motion path {
  fill: none;
  stroke: var(${P}-stroke);
  stroke-width: var(${P}-width);
  stroke-linecap: round;
  stroke-linejoin: round;
}

.kcx-svg-motion__trilha { opacity: var(${P}-trail); }

.kcx-svg-motion__linha {
  stroke-dasharray: 1;
  stroke-dashoffset: var(${P}-offset);
  animation: var(${P}-anim-linha) calc(var(${P}-duration) / var(${P}-speed)) var(${P}-easing) var(${P}-delay)
    var(${P}-iterations) var(${P}-direction) both;
}

.kcx-svg-motion__ponto {
  position: absolute;
  top: 0;
  left: 0;
  width: var(${P}-dot);
  height: var(${P}-dot);
  border-radius: 50%;
  background: var(${P}-accent);
  box-shadow: 0 0 var(${P}-dot) var(${P}-accent);
  offset-path: var(${P}-path);
  offset-distance: var(${P}-distance);
  offset-rotate: 0deg;
  animation: var(${P}-anim-ponto) calc(var(${P}-duration) / var(${P}-speed)) var(${P}-easing) var(${P}-delay)
    var(${P}-iterations) var(${P}-direction) both;
}

@keyframes kcx-svg-motion-desenhar {
  from { stroke-dashoffset: 1; }
  to   { stroke-dashoffset: 0; }
}

@keyframes kcx-svg-motion-percorrer {
  from { offset-distance: 0%; }
  to   { offset-distance: 100%; }
}

@media (prefers-reduced-motion: reduce) {
  .kcx-svg-motion__linha,
  .kcx-svg-motion__ponto { animation: none; }
}`,
    js: `// Não precisa de JavaScript. A forma troca o atributo d dos paths (feito pelo runtime KCX):
// KCX.set('shape', 'laco')`,
    svg: svgDe(CAMINHOS_SVG_MOTION['onda']),
  },
  estados: [
    {
      id: 'fim',
      nome: 'Fim',
      gatilho: 'final',
      descricao: 'Caminho completo, ponto no fim.',
      valores: { progress: 1 },
    },
    {
      id: 'meio',
      nome: 'Meio',
      gatilho: 'padrao',
      descricao: 'Metade do percurso.',
      valores: { progress: 0.5 },
    },
    {
      id: 'inicio',
      nome: 'Início',
      gatilho: 'inicial',
      descricao: 'Nada desenhado, ponto no começo.',
      valores: { progress: 0 },
    },
  ],
  presets: [
    {
      id: 'neon-purple',
      nome: 'Neon Purple',
      valores: { strokeColor: '#8b5cf6', accentColor: '#ff2bd6' },
    },
    {
      id: 'cyber-pink',
      nome: 'Cyber Pink',
      valores: { strokeColor: '#ff2bd6', accentColor: '#22e3ff' },
    },
    {
      id: 'electric-blue',
      nome: 'Electric Blue',
      valores: { strokeColor: '#2f7bff', accentColor: '#22e3ff' },
    },
    {
      id: 'slow-motion',
      nome: 'Slow Motion',
      valores: { duration: 7, speed: 0.5, easing: 'ease-in-out' },
    },
    {
      id: 'fast-motion',
      nome: 'Fast Motion',
      valores: { duration: 1, speed: 2, easing: 'linear' },
    },
  ],
  dependencias: [],
  estrutura: {
    id: 'raiz',
    nome: 'SVG Motion',
    tipo: 'frame',
    largura: 400,
    altura: 160,
    filhos: [
      {
        id: 'trilha',
        nome: 'Trilha',
        tipo: 'svg',
        x: 0,
        y: 0,
        peca: { nome: 'Caminho', eixo: 'shape' },
        restricoes: { h: 'SCALE', v: 'SCALE' },
        propriedadeVisivel: 'Trilha',
        opacidade: { $var: 'trailOpacity' },
        svg: {
          $derivado: 'shape',
          nome: 'svg-trilha',
          transformar: [{ op: 'mapa', valores: MAPA_SVG }],
        },
        svgTraco: { cor: { $var: 'strokeColor' }, espessura: { $var: 'strokeWidth' } },
      },
      {
        id: 'linha',
        nome: 'Linha',
        tipo: 'svg',
        x: 0,
        y: 0,
        peca: { nome: 'Caminho', eixo: 'shape' },
        restricoes: { h: 'SCALE', v: 'SCALE' },
        svg: {
          $derivado: 'shape',
          nome: 'svg-linha',
          transformar: [{ op: 'mapa', valores: MAPA_SVG }],
        },
        svgTraco: {
          cor: { $var: 'strokeColor' },
          espessura: { $var: 'strokeWidth' },
          tracejado: [
            {
              $derivado: 'progress',
              nome: 'dash',
              transformar: [
                { op: 'tracoNoCaminho', variavel: 'shape', caminhos: CAMINHOS_SVG_MOTION },
                { op: 'somar', valor: 0.01 },
              ],
            },
            2000,
          ],
        },
      },
      {
        id: 'ponto',
        nome: 'Ponto',
        tipo: 'elipse',
        restricoes: { h: 'SCALE', v: 'SCALE' },
        propriedadeVisivel: 'Ponto',
        largura: { $var: 'dotSize' },
        altura: { $var: 'dotSize' },
        x: {
          $derivado: 'progress',
          nome: 'ponto-x',
          transformar: [
            { op: 'pontoNoCaminho', variavel: 'shape', caminhos: CAMINHOS_SVG_MOTION, eixo: 'x' },
            { op: 'somarVariavel', variavel: 'dotSize', fator: -0.5 },
          ],
        },
        y: {
          $derivado: 'progress',
          nome: 'ponto-y',
          transformar: [
            { op: 'pontoNoCaminho', variavel: 'shape', caminhos: CAMINHOS_SVG_MOTION, eixo: 'y' },
            { op: 'somarVariavel', variavel: 'dotSize', fator: -0.5 },
          ],
        },
        preenchimentos: [{ tipo: 'solido', cor: { $var: 'accentColor' } }],
        efeitos: [
          { tipo: 'sombra', cor: { $var: 'accentColor' }, raio: { $var: 'dotSize' }, x: 0, y: 0 },
        ],
      },
    ],
  },
  animacoes: [
    {
      id: 'desenhar',
      nome: 'Desenhar a linha',
      tecnica: 'css-keyframes',
      variaveis: [
        'duration',
        'delay',
        'speed',
        'easing',
        'direction',
        'loop',
        'autoplay',
        'progress',
      ],
      figma: 'variantes',
      nivel: 2,
      descricao:
        'stroke-dashoffset de 1 a 0 com pathLength="1". No Figma: variantes Estado=Início/Meio/Fim; Fim usa a peça Caminho, Início/Meio são vetores já cortados no progresso.',
    },
    {
      id: 'percorrer',
      nome: 'Ponto no caminho',
      tecnica: 'css-motion-path',
      variaveis: [
        'duration',
        'delay',
        'speed',
        'easing',
        'direction',
        'loop',
        'autoplay',
        'progress',
        'shape',
      ],
      figma: 'variantes',
      nivel: 2,
      descricao:
        'offset-path + offset-distance. No Figma o ponto é posicionado no caminho em cada variante.',
    },
  ],
  compatibilidade: {
    navegadores: 'offset-path com path(): Chrome 55+, Firefox 72+, Safari 15.4+.',
    reducedMotion: true,
    figma: {
      nivel: 2,
      editavel: [
        'Componente reutilizável com instância de exemplo',
        'Formato: os caminhos são vetores nativos numa peça própria (SVG Motion · Caminho) — edite o desenho uma vez e todas as variantes mudam',
        'Tamanho: redimensione o componente e o caminho e o ponto acompanham (restrições Scale)',
        'Cor e espessura do traço, opacidade da trilha, cor e tamanho do ponto por variáveis',
        'Propriedades Trilha e Ponto (liga/desliga)',
      ],
      parcial: [
        'Formas como variantes (Forma=onda/laço/zigue-zague)',
        'Quadros Início/Meio/Fim como variantes (trecho desenhado e posição do ponto calculados no lab)',
      ],
      naoSuportado: ['Movimento contínuo', 'Easing, atraso, repetição e direção'],
      limitacoes: [
        'O Figma não executa stroke-dashoffset nem offset-path, e o tracejado dele se ajusta a cada segmento: cada quadro é uma variante com o trecho desenhado e a posição do ponto já calculados.',
        'Redesenhar a peça Caminho muda a trilha e o quadro Fim; os quadros Início/Meio são vetores calculados a partir do desenho original — exporte de novo pelo lab para recalcular.',
      ],
      eixosVariante: ['shape'],
    },
  },
};
