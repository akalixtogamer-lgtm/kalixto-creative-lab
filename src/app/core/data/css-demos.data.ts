import { LabDemo, Valores } from '../models/demo.model';

/**
 * Demonstrações do Laboratório 01 — CSS Playground.
 *
 * Cada demo descreve:
 *  - os controles (params) que o usuário ajusta;
 *  - a explicação didática;
 *  - o código CSS mostrado no Code Viewer, gerado com os valores atuais.
 *
 * A parte visual (palco) fica no componente css-playground, que lê os
 * mesmos valores como variáveis CSS (--dur, --ease…).
 */

export type CssDemo = LabDemo;
export type { ParamDef, Valor, Valores } from '../models/demo.model';
export { valoresPadrao } from '../models/demo.model';

const EASINGS = [
  { valor: 'ease', rotulo: 'ease (padrão)' },
  { valor: 'linear', rotulo: 'linear' },
  { valor: 'ease-in-out', rotulo: 'ease-in-out' },
  { valor: 'cubic-bezier(0.34, 1.56, 0.64, 1)', rotulo: 'elástico (cubic-bezier)' },
];

/** Keyframes mostrados no código da demo de @keyframes. */
const KEYFRAMES: Record<string, string> = {
  pulsar: `@keyframes pulsar {
  0%, 100% { transform: scale(1); }
  50%      { transform: scale(1.25); }
}`,
  quicar: `@keyframes quicar {
  0%, 100% { transform: translateY(0); }
  40%      { transform: translateY(-60px); }
  60%      { transform: translateY(-60px); }
}`,
  girar: `@keyframes girar {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}`,
  tremer: `@keyframes tremer {
  0%, 100%      { transform: translateX(0); }
  20%, 60%      { transform: translateX(-12px); }
  40%, 80%      { transform: translateX(12px); }
}`,
};

/** Estados inicial e final do clip-path por forma. */
export const CLIP_FORMAS: Record<string, { de: string; para: string }> = {
  circulo: { de: 'circle(0% at 50% 50%)', para: 'circle(75% at 50% 50%)' },
  cortina: { de: 'inset(0 100% 0 0)', para: 'inset(0 0 0 0)' },
  diagonal: {
    de: 'polygon(0 0, 0 0, 0 0, 0 0)',
    para: 'polygon(0 0, 200% 0, 0 200%, 0 0)',
  },
  losango: {
    de: 'polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)',
    para: 'polygon(50% -50%, 150% 50%, 50% 150%, -50% 50%)',
  },
};

export const CSS_DEMOS: CssDemo[] = [
  // ---------------------------------------------------------------- 1
  {
    id: 'transitions',
    topico: 'Transitions',
    titulo: 'Transição entre dois estados',
    nivel: 'iniciante',
    resumo: 'Interpolar propriedades suavemente quando uma classe muda.',
    explicacao: [
      'transition diz ao navegador: "quando esta propriedade mudar, não pule — anime".',
      'Você define o estado inicial e o final; o navegador calcula todos os quadros do meio.',
      'A curva (easing) controla o ritmo: linear é constante, ease-in-out acelera e freia, e o cubic-bezier elástico passa do ponto e volta.',
    ],
    dica: 'Prefira animar transform e opacity: são as propriedades mais leves para o navegador.',
    acao: 'Alternar estado',
    instrucao: 'Clique em “Alternar estado” e depois mude a duração e a curva.',
    presets: [{ nome: 'Rápido e seco', valores: { dur: 200, ease: 'linear' } }, { nome: 'Elástico', valores: { dur: 900, ease: 'cubic-bezier(0.34, 1.56, 0.64, 1)' } }],
    desafio: { enunciado: 'Faça a caixa percorrer 200px em 1200ms com a curva ease-in-out.', meta: { dist: 200, dur: 1200, ease: 'ease-in-out' } },
    params: [
      { id: 'dur', rotulo: 'Duração', tipo: 'range', min: 100, max: 2000, passo: 50, unidade: 'ms', padrao: 600 },
      { id: 'ease', rotulo: 'Curva (easing)', tipo: 'select', opcoes: EASINGS, padrao: 'ease' },
      { id: 'dist', rotulo: 'Distância', tipo: 'range', min: 0, max: 200, passo: 10, unidade: 'px', padrao: 140 },
    ],
    codigo: (v) => `.caixa {
  transition:
    transform ${v['dur']}ms ${v['ease']},
    background-color ${v['dur']}ms ${v['ease']},
    border-radius ${v['dur']}ms ${v['ease']};
}

.caixa.ativo {
  transform: translateX(${v['dist']}px);
  background-color: #2f7bff;
  border-radius: 50%;
}`,
  },
  // ---------------------------------------------------------------- 2
  {
    id: 'keyframes',
    topico: 'Keyframes',
    titulo: 'Animação com @keyframes',
    nivel: 'iniciante',
    resumo: 'Definir etapas de uma animação que roda sozinha.',
    explicacao: [
      'Com @keyframes você descreve a animação em etapas (0%, 50%, 100%…).',
      'Depois aplica com a propriedade animation: nome, duração, curva e quantas vezes repetir.',
      'Diferente da transition, a animação não precisa de mudança de estado para começar.',
    ],
    dica: 'Use animation-iteration-count: infinite com moderação — movimento constante cansa a leitura.',
    acao: 'Executar animação',
    instrucao: 'Escolha uma animação e clique em “Executar animação”.',
    presets: [{ nome: 'Alerta', valores: { anim: 'tremer', dur: 400, rep: '3' } }, { nome: 'Carregando', valores: { anim: 'girar', dur: 800, rep: 'infinite' } }],
    desafio: { enunciado: 'Crie um botão que quica 3 vezes em 600ms cada.', meta: { anim: 'quicar', dur: 600, rep: '3' } },
    params: [
      {
        id: 'anim',
        rotulo: 'Animação',
        tipo: 'select',
        opcoes: [
          { valor: 'pulsar', rotulo: 'pulsar' },
          { valor: 'quicar', rotulo: 'quicar' },
          { valor: 'girar', rotulo: 'girar' },
          { valor: 'tremer', rotulo: 'tremer' },
        ],
        padrao: 'pulsar',
      },
      { id: 'dur', rotulo: 'Duração', tipo: 'range', min: 200, max: 3000, passo: 100, unidade: 'ms', padrao: 1000 },
      {
        id: 'rep',
        rotulo: 'Repetições',
        tipo: 'select',
        opcoes: [
          { valor: '1', rotulo: '1 vez' },
          { valor: '3', rotulo: '3 vezes' },
          { valor: 'infinite', rotulo: 'infinita' },
        ],
        padrao: '3',
      },
    ],
    codigo: (v) => `${KEYFRAMES[String(v['anim'])]}

.elemento {
  animation: ${v['anim']} ${v['dur']}ms ease-in-out ${v['rep']};
}`,
  },
  // ---------------------------------------------------------------- 3
  {
    id: 'transform',
    topico: 'Transform',
    titulo: 'Mover, girar, escalar e inclinar',
    nivel: 'iniciante',
    resumo: 'Combinar funções de transform e ver o resultado na hora.',
    explicacao: [
      'transform muda a forma e a posição do elemento sem empurrar os vizinhos no layout.',
      'As funções são aplicadas em ordem: translate, depois rotate, depois scale. Trocar a ordem muda o resultado.',
      'O contorno tracejado mostra a posição original do elemento.',
    ],
    dica: 'Para centralizar algo com position: absolute, use translate(-50%, -50%).',
    acao: 'Valores aleatórios',
    instrucao: 'Arraste os controles — o resultado muda em tempo real.',
    presets: [{ nome: 'Carta jogada', valores: { tx: 80, ty: -30, rot: 25, esc: 1.2, skew: 0 } }, { nome: 'Itálico', valores: { tx: 0, ty: 0, rot: 0, esc: 1, skew: -20 } }],
    desafio: { enunciado: 'Deixe o quadrado de cabeça para baixo (180deg) e com o dobro do tamanho.', meta: { rot: 180, esc: 2 } },
    params: [
      { id: 'tx', rotulo: 'translateX', tipo: 'range', min: -120, max: 120, passo: 5, unidade: 'px', padrao: 0 },
      { id: 'ty', rotulo: 'translateY', tipo: 'range', min: -60, max: 60, passo: 5, unidade: 'px', padrao: 0 },
      { id: 'rot', rotulo: 'rotate', tipo: 'range', min: -180, max: 180, passo: 5, unidade: 'deg', padrao: 0 },
      { id: 'esc', rotulo: 'scale', tipo: 'range', min: 0.3, max: 2, passo: 0.1, unidade: '', padrao: 1 },
      { id: 'skew', rotulo: 'skewX', tipo: 'range', min: -45, max: 45, passo: 5, unidade: 'deg', padrao: 0 },
    ],
    codigo: (v) => `.caixa {
  transform:
    translate(${v['tx']}px, ${v['ty']}px)
    rotate(${v['rot']}deg)
    scale(${v['esc']})
    skewX(${v['skew']}deg);
}`,
  },
  // ---------------------------------------------------------------- 4
  {
    id: 'hover',
    topico: 'Hover',
    titulo: 'Estados de hover em botões',
    nivel: 'iniciante',
    resumo: 'Dar resposta visual quando o mouse passa por cima.',
    explicacao: [
      ':hover aplica estilos enquanto o ponteiro está sobre o elemento.',
      'Junto com transition, a mudança fica suave em vez de instantânea.',
      'Sempre repita o efeito em :focus-visible, para quem navega pelo teclado.',
    ],
    dica: 'No celular não existe hover: o efeito não pode ser a única forma de mostrar uma informação.',
    acao: 'Simular hover',
    instrucao: 'Passe o mouse no botão (ou clique em “Simular hover” no celular).',
    presets: [{ nome: 'Neon lento', valores: { estilo: 'brilho', dur: 600 } }],
    desafio: { enunciado: 'Monte um botão de preenchimento que reage em 150ms.', meta: { estilo: 'preencher', dur: 150 } },
    params: [
      {
        id: 'estilo',
        rotulo: 'Estilo',
        tipo: 'select',
        opcoes: [
          { valor: 'levantar', rotulo: 'levantar' },
          { valor: 'brilho', rotulo: 'brilho neon' },
          { valor: 'preencher', rotulo: 'preencher' },
        ],
        padrao: 'levantar',
      },
      { id: 'dur', rotulo: 'Duração', tipo: 'range', min: 100, max: 1000, passo: 50, unidade: 'ms', padrao: 250 },
    ],
    codigo: (v) => {
      const regras: Record<string, string> = {
        levantar: `  transform: translateY(-6px);
  box-shadow: 0 14px 28px rgb(0 0 0 / 0.4);`,
        brilho: `  box-shadow: 0 0 28px #ff2bd6, 0 0 6px #ff2bd6 inset;
  color: #fff;`,
        preencher: `  background-size: 100% 100%;
  color: #07050f;`,
      };
      const extra =
        v['estilo'] === 'preencher'
          ? `
  background: linear-gradient(#22e3ff, #22e3ff) no-repeat left / 0% 100%;`
          : '';
      return `.botao {
  transition: all ${v['dur']}ms ease;${extra}
}

.botao:hover,
.botao:focus-visible {
${regras[String(v['estilo'])]}
}`;
    },
  },
  // ---------------------------------------------------------------- 5
  {
    id: 'floating',
    topico: 'Floating',
    titulo: 'Elemento flutuante',
    nivel: 'iniciante',
    resumo: 'Movimento suave e contínuo de sobe e desce.',
    explicacao: [
      'O efeito flutuante é um @keyframes que vai e volta (alternate) sem parar.',
      'Variáveis CSS (--amplitude) deixam o mesmo keyframe reaproveitável com intensidades diferentes.',
      'A sombra encolhe quando o objeto sobe, o que reforça a sensação de altura.',
    ],
    dica: 'Durações longas (3 s ou mais) parecem mais naturais para flutuação.',
    acao: 'Pausar / retomar',
    instrucao: 'Ajuste altura, ritmo e inclinação. O botão pausa o movimento.',
    presets: [{ nome: 'Bolha calma', valores: { amp: 10, dur: 5, rot: 0 } }, { nome: 'Balão agitado', valores: { amp: 36, dur: 1.5, rot: 12 } }],
    desafio: { enunciado: 'Faça a bolha subir 30px, sem inclinar, num ciclo de 4s.', meta: { amp: 30, rot: 0, dur: 4 } },
    params: [
      { id: 'amp', rotulo: 'Altura', tipo: 'range', min: 4, max: 40, passo: 2, unidade: 'px', padrao: 16 },
      { id: 'dur', rotulo: 'Duração', tipo: 'range', min: 1, max: 8, passo: 0.5, unidade: 's', padrao: 3 },
      { id: 'rot', rotulo: 'Inclinação', tipo: 'range', min: 0, max: 15, passo: 1, unidade: 'deg', padrao: 4 },
    ],
    codigo: (v) => `@keyframes flutuar {
  from { transform: translateY(0) rotate(0deg); }
  to   { transform: translateY(-${v['amp']}px) rotate(${v['rot']}deg); }
}

.objeto {
  animation: flutuar ${v['dur']}s ease-in-out infinite alternate;
}`,
  },
  // ---------------------------------------------------------------- 6
  {
    id: 'perspective',
    topico: 'Perspective',
    titulo: 'Card 3D com perspectiva',
    nivel: 'intermediario',
    resumo: 'Girar um card no espaço 3D e virar para o verso.',
    explicacao: [
      'perspective vai no elemento pai e define a distância do "olho" até a cena: valores menores deixam o 3D mais exagerado.',
      'transform-style: preserve-3d mantém os filhos no espaço 3D.',
      'backface-visibility: hidden esconde o lado de trás de cada face, criando frente e verso.',
    ],
    dica: 'Um perspective entre 600px e 1200px costuma parecer natural na tela.',
    acao: 'Virar card',
    instrucao: 'Incline o card nos controles e clique em “Virar card”.',
    presets: [{ nome: 'Exagerado', valores: { persp: 300, rx: 25, ry: -40 } }, { nome: 'Frontal', valores: { persp: 1000, rx: 0, ry: 0 } }],
    desafio: { enunciado: 'Deixe o card reto (rotateX e rotateY em 0) e vire para o verso.', meta: { rx: 0, ry: 0 } },
    params: [
      { id: 'persp', rotulo: 'perspective', tipo: 'range', min: 200, max: 2000, passo: 50, unidade: 'px', padrao: 800 },
      { id: 'rx', rotulo: 'rotateX', tipo: 'range', min: -60, max: 60, passo: 5, unidade: 'deg', padrao: 10 },
      { id: 'ry', rotulo: 'rotateY', tipo: 'range', min: -60, max: 60, passo: 5, unidade: 'deg', padrao: -20 },
    ],
    codigo: (v) => `.cena {
  perspective: ${v['persp']}px;
}

.card {
  transform-style: preserve-3d;
  transform: rotateX(${v['rx']}deg) rotateY(${v['ry']}deg);
  transition: transform 700ms ease;
}

.card.virado {
  transform: rotateX(${v['rx']}deg) rotateY(${Number(v['ry']) + 180}deg);
}

.frente, .verso {
  backface-visibility: hidden;
}
.verso {
  transform: rotateY(180deg);
}`,
  },
  // ---------------------------------------------------------------- 7
  {
    id: 'clip-path',
    topico: 'Clip-path',
    titulo: 'Revelação com clip-path',
    nivel: 'intermediario',
    resumo: 'Mostrar conteúdo recortando a área visível.',
    explicacao: [
      'clip-path define uma forma; só o que está dentro dela aparece.',
      'Como circle(), inset() e polygon() aceitam números, o navegador consegue animar de uma forma para outra.',
      'No polygon(), o estado inicial e o final precisam ter a mesma quantidade de pontos.',
    ],
    dica: 'Ótimo para transições entre seções e revelação de imagens ao rolar a página.',
    acao: 'Revelar / esconder',
    instrucao: 'Escolha a forma e clique em “Revelar / esconder”.',
    presets: [{ nome: 'Cortina rápida', valores: { forma: 'cortina', dur: 400 } }],
    desafio: { enunciado: 'Revele o conteúdo com um losango em 1500ms.', meta: { forma: 'losango', dur: 1500 } },
    params: [
      {
        id: 'forma',
        rotulo: 'Forma',
        tipo: 'select',
        opcoes: [
          { valor: 'circulo', rotulo: 'círculo' },
          { valor: 'cortina', rotulo: 'cortina' },
          { valor: 'diagonal', rotulo: 'diagonal' },
          { valor: 'losango', rotulo: 'losango' },
        ],
        padrao: 'circulo',
      },
      { id: 'dur', rotulo: 'Duração', tipo: 'range', min: 200, max: 2000, passo: 100, unidade: 'ms', padrao: 800 },
    ],
    codigo: (v) => {
      const f = CLIP_FORMAS[String(v['forma'])];
      return `.imagem {
  clip-path: ${f.de};
  transition: clip-path ${v['dur']}ms ease-in-out;
}

.imagem.revelada {
  clip-path: ${f.para};
}`;
    },
  },
  // ---------------------------------------------------------------- 8
  {
    id: 'microinteracoes',
    topico: 'Microinterações',
    titulo: 'Curtir e interruptor',
    nivel: 'intermediario',
    resumo: 'Pequenas respostas visuais que confirmam a ação do usuário.',
    explicacao: [
      'Microinteração é um retorno rápido a uma ação: curtir, ligar, enviar.',
      'O "pop" do coração é um @keyframes curto que passa um pouco do tamanho final e volta.',
      'O interruptor usa só transition: a bolinha desliza e a cor do fundo muda.',
    ],
    dica: 'Microinterações devem ser curtas (150 a 400 ms) para não atrasar o usuário.',
    acao: 'Curtir',
    instrucao: 'Clique no coração e no interruptor — eles também respondem direto.',
    presets: [{ nome: 'Pop discreto', valores: { dur: 200, esc: 1.15 } }, { nome: 'Pop exagerado', valores: { dur: 600, esc: 1.8 } }],
    desafio: { enunciado: 'Configure um curtir com pop de 1.5x em 250ms.', meta: { esc: 1.5, dur: 250 } },
    params: [
      { id: 'dur', rotulo: 'Duração', tipo: 'range', min: 150, max: 800, passo: 50, unidade: 'ms', padrao: 300 },
      { id: 'esc', rotulo: 'Tamanho do pop', tipo: 'range', min: 1.1, max: 1.8, passo: 0.05, unidade: '', padrao: 1.35 },
    ],
    codigo: (v) => `@keyframes pop {
  50% { transform: scale(${v['esc']}); }
}

.curtir.ativo {
  color: #ff2bd6;
  animation: pop ${v['dur']}ms ease-out;
}

.interruptor .bolinha {
  transition: transform ${v['dur']}ms ease;
}
.interruptor.ligado .bolinha {
  transform: translateX(24px);
}`,
  },
  // ---------------------------------------------------------------- 9
  {
    id: 'divisores',
    topico: 'Divisores de seção',
    titulo: 'Bordas entre seções',
    nivel: 'intermediario',
    resumo: 'Trocar a linha reta entre duas seções por diagonais, curvas, setas ou ondas.',
    explicacao: [
      'A seção de baixo "sobe" sobre a de cima (margin-top negativo) e recorta a própria borda superior.',
      'Diagonal, seta e zigue-zague usam clip-path: polygon(); a curva usa border-radius elíptico; as ondas usam uma máscara (mask) com radial-gradient.',
      'Como tudo é CSS, a borda acompanha a largura da tela sozinha — sem imagens.',
    ],
    dica: 'Use no máximo um ou dois estilos de divisor por página: variar demais deixa o layout confuso.',
    acao: '',
    aoVivo: true,
    instrucao: 'Troque a forma e a altura — o resultado é ao vivo.',
    presets: [
      { nome: 'Diagonal suave', valores: { forma: 'diagonal', altura: 40, lado: 'normal' } },
      { nome: 'Curva funda', valores: { forma: 'curva', altura: 100 } },
      { nome: 'Rasgado', valores: { forma: 'zigzag', altura: 30 } },
    ],
    desafio: {
      enunciado: 'Monte uma seta invertida (apontando para baixo) com 80px de altura.',
      meta: { forma: 'seta', altura: 80, lado: 'invertido' },
    },
    params: [
      {
        id: 'forma',
        rotulo: 'Forma da borda',
        tipo: 'select',
        opcoes: [
          { valor: 'diagonal', rotulo: 'diagonal' },
          { valor: 'seta', rotulo: 'seta' },
          { valor: 'curva', rotulo: 'curva' },
          { valor: 'zigzag', rotulo: 'zigue-zague' },
          { valor: 'ondas', rotulo: 'ondas' },
        ],
        padrao: 'diagonal',
      },
      { id: 'altura', rotulo: 'Altura da borda', tipo: 'range', min: 20, max: 120, passo: 10, unidade: 'px', padrao: 60 },
      {
        id: 'lado',
        rotulo: 'Direção',
        tipo: 'select',
        opcoes: [
          { valor: 'normal', rotulo: 'normal' },
          { valor: 'invertido', rotulo: 'invertida' },
        ],
        padrao: 'normal',
      },
    ],
    codigo: (v) => {
      const regras = Object.entries(estiloDivisor(v))
        .map(([k, x]) => `  ${k}: ${x};`)
        .join('\n');
      return `/* A seção de baixo sobe sobre a de cima e recorta a borda */
.secao-baixo {
${regras}
}`;
    },
  },
];

/**
 * CSS do divisor de seção — usado pelo palco E pelo Code Viewer
 * (assim o código mostrado é exatamente o que está aplicado).
 */
export function estiloDivisor(v: Valores): Record<string, string> {
  const h = Number(v['altura']);
  const inv = v['lado'] === 'invertido';
  const base = { 'margin-top': `-${h}px` };
  switch (v['forma']) {
    case 'diagonal':
      return {
        ...base,
        'clip-path': inv
          ? `polygon(0 0, 100% ${h}px, 100% 100%, 0 100%)`
          : `polygon(0 ${h}px, 100% 0, 100% 100%, 0 100%)`,
      };
    case 'seta':
      return {
        ...base,
        'clip-path': inv
          ? `polygon(0 0, 50% ${h}px, 100% 0, 100% 100%, 0 100%)`
          : `polygon(0 ${h}px, 50% 0, 100% ${h}px, 100% 100%, 0 100%)`,
      };
    case 'curva':
      return inv
        ? { ...base, mask: `radial-gradient(ellipse 70% ${h}px at 50% 0, transparent 98%, #000 100%)` }
        : { ...base, 'border-radius': `50% 50% 0 0 / ${h}px ${h}px 0 0` };
    case 'zigzag': {
      const dentes = 12;
      const pontos = Array.from({ length: dentes + 1 }, (_, i) => {
        const alto = (i % 2 === 0) !== inv;
        return `${((i / dentes) * 100).toFixed(2)}% ${alto ? 0 : h}px`;
      });
      return { ...base, 'clip-path': `polygon(${pontos.join(', ')}, 100% 100%, 0 100%)` };
    }
    default: {
      const r = Math.round(h / 2);
      return {
        ...base,
        mask: inv
          ? `radial-gradient(circle at 50% ${r}px, #000 ${r}px, transparent ${r + 1}px) 50% 0 / ${r * 2}px ${r}px repeat-x, linear-gradient(#000 0 0) 0 ${r}px / 100% 100% no-repeat`
          : `radial-gradient(circle at 50% 0, transparent ${r}px, #000 ${r + 1}px) 50% 0 / ${r * 2}px 100% repeat-x`,
      };
    }
  }
}

