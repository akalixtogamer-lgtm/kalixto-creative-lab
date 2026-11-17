import { EffectKit } from '../../models/effect-sheet.model';
import { CSS_REPETIR, EASINGS, MDN, VALIDADO_EM, cssAngular, cssPalco, htmlRepetir, jsRepetir, tsRepetir } from './_base';

export const SCALE_REVEAL: EffectKit = {
  ficha: {
    id: 'scale-reveal',
    nomeTecnico: 'Scale Reveal',
    nomeAmigavel: 'Crescer ao aparecer',
    categoria: 'transicoes',
    subcategoria: 'Entradas',
    descricao: 'O elemento aparece crescendo a partir de um tamanho menor.',
    objetivoVisual: 'Dar ênfase e sensação de "abrir" — bom para destaques e modais.',
    aplicacoes: ['Modais e diálogos', 'Cards de destaque', 'Ícones de confirmação'],
    nivel: 'iniciante',
    tecnologias: ['HTML', 'CSS', 'JavaScript'],
    dependencias: [],
    interacoes: ['autoplay', 'click'],
    tags: ['scale', 'zoom', 'entrada', 'crescer', 'pop'],
    explicacao: [
      'transform: scale muda o tamanho visual sem alterar o espaço que o elemento ocupa no layout.',
      'transform-origin define o ponto fixo do crescimento: centro, topo ou um canto.',
      'A curva "elástico (back out)" passa um pouco do tamanho final e volta, dando o efeito de "pop".',
      'Com redução de movimento, a escala é removida e fica só o fade.',
    ],
    alternativa: 'Web Animations API: el.animate([{ transform: "scale(.6)", opacity: 0 }, { transform: "none", opacity: 1 }], 600).',
    compatibilidade: 'Todos os navegadores atuais.',
    responsividade: 'A escala é relativa ao próprio elemento, então funciona em qualquer largura.',
    acessibilidade: 'Respeita prefers-reduced-motion (só opacidade). Escalas iniciais muito pequenas com curva elástica podem incomodar; prefira de 0,6 a 0,9.',
    performance: 'transform e opacity são animadas pelo compositor.',
    limitacoes: ['Textos podem parecer borrados durante a escala em alguns navegadores; o resultado final fica nítido.'],
    referencias: [MDN.transform, MDN.keyframes, MDN.reduzir],
    validadoEm: VALIDADO_EM,
    status: 'validado',
  },
  params: [
    { id: 'escala', rotulo: 'escala inicial', tipo: 'range', min: 0, max: 0.95, passo: 0.05, unidade: '', padrao: 0.6 },
    {
      id: 'origem',
      rotulo: 'ponto de origem',
      tipo: 'select',
      opcoes: [
        { valor: 'center', rotulo: 'centro' },
        { valor: 'top', rotulo: 'topo' },
        { valor: 'top left', rotulo: 'canto superior esquerdo' },
        { valor: 'bottom right', rotulo: 'canto inferior direito' },
      ],
      padrao: 'center',
    },
    { id: 'dur', rotulo: 'duração', tipo: 'range', min: 100, max: 2000, passo: 50, unidade: 'ms', padrao: 600 },
    { id: 'easing', rotulo: 'curva (easing)', tipo: 'select', opcoes: EASINGS, padrao: 'cubic-bezier(0.34, 1.56, 0.64, 1)' },
  ],
  gerar: (v) => ({
    html: `<div class="cartao scale-reveal">Scale reveal</div>
<button class="repetir" type="button">Repetir</button>`,
    css: `${cssPalco()}

.cartao {
  padding: 32px 48px;
  border-radius: 16px;
  background: linear-gradient(135deg, #2563eb, #0891b2);
  font-size: 1.5rem;
  font-weight: 700;
}

/* O efeito */
.scale-reveal {
  transform-origin: ${v['origem']};
  animation: scale-reveal ${v['dur']}ms ${v['easing']} both;
}

@keyframes scale-reveal {
  from { opacity: 0; transform: scale(${v['escala']}); }
  to   { opacity: 1; transform: scale(1); }
}

@media (prefers-reduced-motion: reduce) {
  .scale-reveal { animation-name: aparecer; }
  @keyframes aparecer { from { opacity: 0; } to { opacity: 1; } }
}
${CSS_REPETIR}`,
    js: jsRepetir('.cartao', 'scale-reveal'),
  }),
  angular: (v) => ({
    ts: tsRepetir('scale-reveal'),
    html: htmlRepetir('<div class="cartao scale-reveal">Scale reveal</div>'),
    css: cssAngular(SCALE_REVEAL.gerar(v).css),
  }),
  niveis: {
    iniciante: [
      'O cartão começa menor e transparente e cresce até o tamanho normal.',
      'O ponto de origem é o lugar que fica parado enquanto o resto cresce — como abrir a partir do centro ou de um canto.',
      'A curva "elástico" faz o cartão passar um pouquinho do tamanho e voltar, como um "pop".',
    ],
    avancado: [
      'scale não muda o box no layout: vizinhos não se mexem e o hit-test usa o tamanho transformado.',
      'Curvas com y > 1 (back out) geram overshoot; com escala inicial muito baixa o exagero aumenta — mantenha entre 0,6 e 0,9.',
      'Durante a escala o texto pode ser rasterizado como textura e parecer borrado; o navegador redesenha nítido ao fim.',
      'Para modais, combine com o <dialog> nativo e anime ::backdrop separadamente.',
    ],
  },
  glossario: [
    { termo: 'scale(', explicacao: 'Multiplica o tamanho visual: 1 é o tamanho normal, 0,6 é 60%.' },
    { termo: 'transform-origin', explicacao: 'Ponto fixo da transformação (centro, topo, canto…).' },
    { termo: 'cubic-bezier(0.34, 1.56, 0.64, 1)', explicacao: 'Curva com valor acima de 1, que passa do alvo e volta (efeito elástico).' },
    { termo: '@keyframes', explicacao: 'Estados de início e fim da animação.' },
  ],
};
