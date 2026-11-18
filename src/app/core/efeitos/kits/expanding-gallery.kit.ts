import { EffectKit } from '../../models/effect-sheet.model';
import { EASINGS, VALIDADO_EM, cssAngular, cssPalco, nomeClasse } from './_base';

const PAINEIS = [
  { nome: 'Montanha', fundo: 'linear-gradient(160deg, #9fd8ff, #2f8f6b 70%)' },
  { nome: 'Deserto', fundo: 'linear-gradient(160deg, #ffd27a, #c24d2c 75%)' },
  { nome: 'Oceano', fundo: 'linear-gradient(160deg, #22e3ff, #0a2540 80%)' },
  { nome: 'Cidade', fundo: 'linear-gradient(160deg, #ff2bd6, #2a1f6b 70%)' },
  { nome: 'Floresta', fundo: 'linear-gradient(160deg, #c6ff3d, #1f4a2a 70%)' },
];

export const EXPANDING_GALLERY: EffectKit = {
  ficha: {
    id: 'expanding-gallery',
    nomeTecnico: 'Expanding Panels Gallery (flex-grow)',
    nomeAmigavel: 'Galeria sanfona',
    categoria: 'cards-imagens',
    subcategoria: 'Galerias interativas',
    descricao: 'Faixas de imagem lado a lado; a faixa sob o mouse (ou em foco, ou clicada) se abre e as outras se estreitam, revelando o título dela.',
    objetivoVisual: 'Mostrar várias categorias num espaço pequeno, convidando a explorar uma de cada vez.',
    aplicacoes: ['Categorias de produto ou destinos', 'Cases de portfólio', 'Equipe ou depoimentos'],
    nivel: 'iniciante',
    tecnologias: ['HTML', 'CSS', 'JavaScript'],
    dependencias: [],
    interacoes: ['hover', 'click', 'keyboard', 'touch'],
    tags: ['accordion', 'sanfona', 'expanding cards', 'flex-grow', 'galeria', 'painéis', 'tendência 2026'],
    explicacao: [
      'As faixas estão num contêiner flex. Todas começam com flex-grow: 1 (dividem o espaço igualmente).',
      'A faixa ativa recebe flex-grow maior (o valor de "abertura"). A transição de flex-grow faz as outras encolherem suavemente para dar espaço.',
      'O título de cada faixa aparece só quando ela está aberta (opacidade e deslocamento com um pequeno atraso).',
      'Cada faixa é um <button>: clique ou Enter fixa a faixa aberta (aria-pressed), o que também resolve o toque no celular.',
    ],
    alternativa: 'Com CSS Grid: grid-template-columns com a coluna ativa em 5fr; a transição de grid-template-columns já é suportada nos navegadores atuais.',
    compatibilidade: 'Flexbox com transição de flex-grow: todos os navegadores atuais.',
    responsividade: 'Abaixo de 560px a galeria vira vertical (flex-direction: column), e as faixas crescem em altura.',
    acessibilidade: 'Faixas focáveis (botões) com nome visível no foco; aria-pressed indica a faixa fixada. Com prefers-reduced-motion a troca é instantânea.',
    performance: 'Transicionar flex-grow refaz o layout da galeria a cada quadro; com 5–7 faixas é imperceptível, mas evite em listas grandes.',
    limitacoes: ['Muitas faixas deixam as fechadas finas demais para reconhecer a imagem: 4 a 7 é o ideal.'],
    referencias: [
      { titulo: 'MDN — flex-grow', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/flex-grow' },
      { titulo: 'MDN — aria-pressed', url: 'https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-pressed' },
      { titulo: 'MDN — prefers-reduced-motion', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion' },
    ],
    validadoEm: VALIDADO_EM,
    status: 'validado',
  },
  params: [
    { id: 'abertura', rotulo: 'quanto a faixa abre', tipo: 'range', min: 2, max: 8, passo: 1, unidade: '×', padrao: 5 },
    { id: 'duracao', rotulo: 'duração', tipo: 'range', min: 300, max: 1200, passo: 50, unidade: 'ms', padrao: 650 },
    { id: 'easing', rotulo: 'curva (easing)', tipo: 'select', opcoes: EASINGS, padrao: 'cubic-bezier(0.22, 1, 0.36, 1)' },
  ],
  gerar: (v) => ({
    html: `<section class="sanfona" aria-label="Destinos">
${PAINEIS.map((p, i) => `  <button class="faixa${i === 0 ? ' is-ativa' : ''}" type="button" aria-pressed="${i === 0}" style="--fundo: ${p.fundo}">
    <span>${p.nome}</span>
  </button>`).join('\n')}
</section>`,
    css: `${cssPalco()}

.sanfona {
  display: flex;
  gap: 8px;
  width: min(100%, 680px);
  height: 380px;
}
.faixa {
  position: relative;
  flex: 1 1 0;
  min-width: 0;
  padding: 0;
  border: 0;
  border-radius: 18px;
  overflow: hidden;
  background: var(--fundo);
  color: #fff;
  font: inherit;
  cursor: pointer;
  transition: flex-grow ${v['duracao']}ms ${v['easing']};
}
.faixa span {
  position: absolute;
  left: 18px;
  bottom: 16px;
  font-size: 22px;
  font-weight: 700;
  white-space: nowrap;
  text-shadow: 0 2px 10px rgb(0 0 0 / 0.4);
  opacity: 0;
  translate: 0 12px;
  transition: opacity 300ms ease, translate 300ms ease;
}

/* aberta: a do hover/foco; sem hover, a fixada pelo clique */
.faixa:hover,
.faixa:focus-visible,
.sanfona:not(:hover) .faixa.is-ativa { flex-grow: ${v['abertura']}; }
.faixa:hover span,
.faixa:focus-visible span,
.sanfona:not(:hover) .faixa.is-ativa span { opacity: 1; translate: 0 0; transition-delay: 200ms; }
.faixa:focus-visible { outline: 3px solid #22e3ff; outline-offset: 3px; }

@media (max-width: 560px) {
  .sanfona { flex-direction: column; height: 520px; }
}
@media (prefers-reduced-motion: reduce) {
  .faixa, .faixa span { transition: none; }
}`,
    js: `const faixas = document.querySelectorAll('.faixa');

// clique, Enter ou toque fixam a faixa aberta
faixas.forEach((faixa) => {
  faixa.addEventListener('click', () => {
    faixas.forEach((f) => {
      const ativa = f === faixa;
      f.classList.toggle('is-ativa', ativa);
      f.setAttribute('aria-pressed', String(ativa));
    });
  });
});`,
  }),
  angular: (v) => ({
    ts: `import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-expanding-gallery',
  templateUrl: './expanding-gallery.html',
  styleUrl: './expanding-gallery.css',
})
export class ${nomeClasse('expanding-gallery')} {
  protected readonly paineis = ${JSON.stringify(PAINEIS, null, 2).replace(/\n/g, '\n  ').replace(/"(\w+)":/g, '$1:').replace(/"/g, "'")};
  /** Faixa fixada pelo clique (aberta quando o mouse não está na galeria). */
  protected readonly ativa = signal(0);
}
`,
    html: `<section class="sanfona" aria-label="Destinos">
  @for (p of paineis; track p.nome; let i = $index) {
    <button
      class="faixa"
      type="button"
      [class.is-ativa]="ativa() === i"
      [attr.aria-pressed]="ativa() === i"
      [style.--fundo]="p.fundo"
      (click)="ativa.set(i)"
    >
      <span>{{ p.nome }}</span>
    </button>
  }
</section>
`,
    css: cssAngular(EXPANDING_GALLERY.gerar(v).css),
  }),
  niveis: {
    iniciante: [
      'Cinco faixas coloridas ficam lado a lado, como as dobras de uma sanfona.',
      'A faixa em que o mouse está se abre e as outras ficam mais finas.',
      'Clicando numa faixa, ela continua aberta mesmo quando o mouse sai.',
    ],
    avancado: [
      'flex: 1 1 0 com min-width: 0 garante que todas partam da mesma base e possam encolher abaixo do tamanho do conteúdo.',
      ':not(:hover) no contêiner faz a faixa fixada "ceder" enquanto o usuário explora as outras com o mouse.',
      'transition-delay só no estado aberto do título: ele aparece depois que a faixa abriu, mas some imediatamente ao fechar.',
      'Para imagens reais: background-size: cover e background-position: center mantêm o assunto da foto visível nas faixas estreitas.',
    ],
  },
  glossario: [
    { termo: 'flex-grow', explicacao: 'Quanto do espaço livre a faixa ocupa — a ativa ganha mais.' },
    { termo: ':not(:hover)', explicacao: 'Só mostra a faixa fixada quando o mouse está fora da galeria.' },
    { termo: 'aria-pressed', explicacao: 'Indica qual faixa está fixada.' },
    { termo: 'min-width: 0', explicacao: 'Deixa a faixa encolher além do tamanho do texto.' },
  ],
};
