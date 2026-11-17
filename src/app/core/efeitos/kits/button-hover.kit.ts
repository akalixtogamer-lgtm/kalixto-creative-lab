import { EffectKit } from '../../models/effect-sheet.model';
import { CORES, MDN, VALIDADO_EM, cssAngular, cssPalco, tsSimples } from './_base';

export const BUTTON_HOVER: EffectKit = {
  ficha: {
    id: 'button-hover',
    nomeTecnico: 'Button Hover Lift',
    nomeAmigavel: 'Botão que sobe no hover',
    categoria: 'microinteracoes',
    subcategoria: 'Botões',
    descricao: 'O botão sobe, cresce um pouco e ganha sombra quando o ponteiro passa ou quando recebe foco.',
    objetivoVisual: 'Confirmar que o elemento é clicável e dar resposta imediata.',
    aplicacoes: ['Botões de ação principal', 'Cards clicáveis', 'Links em destaque'],
    nivel: 'iniciante',
    tecnologias: ['HTML', 'CSS'],
    dependencias: [],
    interacoes: ['hover', 'keyboard', 'click'],
    tags: ['hover', 'botão', 'transition', 'sombra', 'focus', 'microinteração'],
    explicacao: [
      'transition anima a mudança entre o estado normal e o estado :hover, sem precisar de keyframes.',
      'O mesmo estilo vale para :focus-visible, então quem navega pelo teclado (Tab) recebe a mesma resposta.',
      ':active devolve o botão para baixo no clique, simulando que foi pressionado.',
      'Este efeito não usa JavaScript.',
    ],
    alternativa: 'Com Angular, a mesma regra fica no CSS do componente; não precisa de @HostListener para um hover simples.',
    compatibilidade: 'Todos os navegadores atuais. :focus-visible é suportado nos navegadores atuais.',
    responsividade: 'Em telas de toque não existe hover; o botão funciona igual e mostra o estado :active ao tocar.',
    acessibilidade: 'Mesmo efeito no hover e no foco do teclado, com contorno visível em :focus-visible. Com redução de movimento, o deslocamento é removido e fica só a sombra.',
    performance: 'transform é animada pelo compositor. box-shadow repinta a área do botão — aceitável em um botão, evite em centenas de elementos ao mesmo tempo.',
    limitacoes: ['Em dispositivos de toque o hover não existe; não esconda informação essencial no estado de hover.'],
    referencias: [MDN.transition, MDN.boxShadow, MDN.reduzir],
    validadoEm: VALIDADO_EM,
    status: 'validado',
  },
  params: [
    { id: 'sobe', rotulo: 'elevação', tipo: 'range', min: 0, max: 16, passo: 1, unidade: 'px', padrao: 4 },
    { id: 'escala', rotulo: 'escala no hover', tipo: 'range', min: 1, max: 1.15, passo: 0.01, unidade: '', padrao: 1.04 },
    { id: 'sombra', rotulo: 'sombra (desfoque)', tipo: 'range', min: 0, max: 60, passo: 2, unidade: 'px', padrao: 24 },
    { id: 'dur', rotulo: 'duração', tipo: 'range', min: 80, max: 600, passo: 20, unidade: 'ms', padrao: 200 },
    { id: 'cor', rotulo: 'cor da sombra', tipo: 'select', opcoes: CORES, padrao: '#ff2bd6' },
  ],
  gerar: (v) => ({
    html: `<button class="botao" type="button">Passe o mouse ou use Tab</button>`,
    css: `${cssPalco()}

/* O efeito */
.botao {
  padding: 14px 28px;
  border: 0;
  border-radius: 12px;
  background: linear-gradient(135deg, #d4119f, #7c3aed);
  color: #fff;
  font: 600 1rem system-ui, sans-serif;
  cursor: pointer;
  transition:
    transform ${v['dur']}ms ease,
    box-shadow ${v['dur']}ms ease;
}

.botao:hover,
.botao:focus-visible {
  transform: translateY(-${v['sobe']}px) scale(${v['escala']});
  box-shadow: 0 ${Math.round(Number(v['sombra']) / 3)}px ${v['sombra']}px ${v['cor']}80;
}

.botao:focus-visible { outline: 2px solid #22e3ff; outline-offset: 4px; }

.botao:active { transform: translateY(0) scale(0.98); }

/* Sem deslocamento para quem prefere menos movimento */
@media (prefers-reduced-motion: reduce) {
  .botao:hover,
  .botao:focus-visible { transform: none; }
}`,
    js: `// Este efeito não precisa de JavaScript.`,
  }),
  angular: (v) => ({
    ts: tsSimples('button-hover'),
    html: `<button class="botao" type="button">Passe o mouse ou use Tab</button>\n`,
    css: cssAngular(BUTTON_HOVER.gerar(v).css),
  }),
  niveis: {
    iniciante: [
      'Quando o mouse passa por cima, o botão sobe um pouco, cresce e ganha uma sombra colorida.',
      'Quem usa o teclado (tecla Tab) vê a mesma coisa quando o botão recebe foco.',
      'Ao clicar, o botão "afunda" de volta, como se fosse apertado.',
    ],
    avancado: [
      'transition em vez de animation: o navegador interpola automaticamente entre os dois estados, inclusive revertendo no meio se o mouse sair cedo.',
      ':focus-visible mostra o foco só quando faz sentido (teclado), sem aparecer no clique do mouse.',
      'box-shadow repinta a cada quadro; para listas grandes, anime a opacidade de um pseudo-elemento com a sombra já pronta.',
      'A cor da sombra usa hexadecimal com alfa (#RRGGBB80 = 50% de opacidade).',
    ],
  },
  glossario: [
    { termo: ':hover', explicacao: 'Estado em que o ponteiro está sobre o elemento.' },
    { termo: ':focus-visible', explicacao: 'Estado de foco vindo do teclado — mesmo efeito para quem não usa mouse.' },
    { termo: ':active', explicacao: 'Estado enquanto o botão está sendo pressionado.' },
    { termo: 'transition', explicacao: 'Anima a mudança entre estados (normal ↔ hover).' },
    { termo: 'box-shadow', explicacao: 'Sombra: deslocamento, desfoque e cor.' },
  ],
};
