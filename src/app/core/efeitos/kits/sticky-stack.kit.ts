import { EffectKit } from '../../models/effect-sheet.model';
import { MDN, VALIDADO_EM, cssAngularPagina, cssPagina, nomeClasse } from './_base';

const CARDS = [
  { titulo: 'Estratégia', cor: '#2a1f6b' },
  { titulo: 'Design', cor: '#7c3aed' },
  { titulo: 'Código', cor: '#ff2bd6' },
  { titulo: 'Lançamento', cor: '#22e3ff' },
];

export const STICKY_STACK: EffectKit = {
  ficha: {
    id: 'sticky-stack',
    nomeTecnico: 'Sticky Stacking Cards',
    nomeAmigavel: 'Cards empilhados no scroll',
    categoria: 'scroll',
    subcategoria: 'Seções presas (sticky)',
    descricao:
      'Ao rolar, cada card gruda no topo e o próximo sobe por cima dele, enquanto o de baixo encolhe e escurece — formando uma pilha.',
    objetivoVisual:
      'Apresentar etapas, serviços ou cases um de cada vez, com sensação de profundidade e progresso.',
    aplicacoes: ['Etapas de um processo', 'Serviços de uma agência', 'Cases e depoimentos'],
    nivel: 'intermediario',
    tecnologias: ['HTML', 'CSS', 'JavaScript'],
    dependencias: [],
    interacoes: ['scroll'],
    tags: ['sticky', 'stacking cards', 'cards empilhados', 'pilha', 'scroll', 'tendência 2026'],
    explicacao: [
      'O empilhamento é só CSS: todos os cards têm position: sticky, cada um com um top um pouco maior (--i × deslocamento). O card seguinte, que vem depois no HTML, sobe por cima.',
      'O JavaScript só faz o "encolher": para cada card, mede a distância do próximo card até o ponto onde ele vai grudar. Quanto mais perto, menor e mais escuro fica o de baixo.',
      'Esse progresso (0 a 1) vira scale e brightness por propriedades individuais, atualizadas uma vez por quadro.',
    ],
    alternativa:
      'Com CSS scroll-driven animations: cada card dentro de um "trilho" com view-timeline e animation-range, sem JavaScript (Chrome/Edge; Safari 26+). Com GSAP: ScrollTrigger com pin e scrub em cada card.',
    compatibilidade:
      'position: sticky e a propriedade individual scale: todos os navegadores atuais.',
    responsividade: 'Alturas em vh e largura limitada; funciona igual no celular.',
    acessibilidade:
      'Os cards são conteúdo normal, na ordem de leitura. Com prefers-reduced-motion eles continuam empilhando (é a rolagem do usuário), mas não encolhem.',
    performance:
      'Um getBoundingClientRect por card a cada quadro de rolagem; escala e filtro são compostos na GPU.',
    limitacoes: [
      'sticky não funciona se algum ancestral tiver overflow: hidden/auto.',
      'O último card precisa de espaço depois dele (margem) para a pilha terminar antes da próxima seção.',
    ],
    referencias: [
      {
        titulo: 'MDN — position: sticky',
        url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/position',
      },
      MDN.scrollTimeline,
      MDN.reduzir,
    ],
    validadoEm: VALIDADO_EM,
    status: 'validado',
  },
  params: [
    {
      id: 'deslocamento',
      rotulo: 'degrau entre cards',
      tipo: 'range',
      min: 0,
      max: 40,
      passo: 4,
      unidade: 'px',
      padrao: 24,
    },
    {
      id: 'encolher',
      rotulo: 'tamanho do card de baixo',
      tipo: 'range',
      min: 0.8,
      max: 1,
      passo: 0.02,
      unidade: '×',
      padrao: 0.9,
    },
    {
      id: 'raio',
      rotulo: 'arredondamento',
      tipo: 'range',
      min: 0,
      max: 40,
      passo: 4,
      unidade: 'px',
      padrao: 24,
    },
  ],
  gerar: (v) => ({
    html: `<section class="intro"><p>Role para baixo ↓</p></section>

<section class="pilha-cards">
${CARDS.map(
  (c, i) => `  <article class="card-pilha" style="--i: ${i}; --fundo: ${c.cor}">
    <span>0${i + 1}</span>
    <h2>${c.titulo}</h2>
  </article>`,
).join('\n')}
</section>

<section class="fim"><p>Fim da página</p></section>`,
    css: `${cssPagina()}

.pilha-cards {
  max-width: 720px;
  margin: 0 auto;
  padding: 0 20px 30vh;
}
/* todos grudam no topo, cada um um degrau abaixo do anterior */
.card-pilha {
  position: sticky;
  top: calc(12vh + var(--i) * ${v['deslocamento']}px);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 60vh;
  margin-bottom: 20vh;
  padding: 32px;
  border-radius: ${v['raio']}px;
  background: var(--fundo);
  color: #fff;
  box-shadow: 0 -10px 40px rgb(0 0 0 / 0.35);
  transform-origin: center top;
}
.card-pilha span { font: 600 14px ui-monospace, monospace; opacity: 0.8; }
.card-pilha h2 { margin: 0; font-size: clamp(2rem, 8vw, 4rem); letter-spacing: -0.03em; }`,
    js: `const cards = [...document.querySelectorAll('.card-pilha')];
const ENCOLHER = ${v['encolher']};
const DEGRAU = ${v['deslocamento']};
const reduzir = matchMedia('(prefers-reduced-motion: reduce)');
let quadro = 0;

function atualizar() {
  quadro = 0;
  if (reduzir.matches) return;
  const topo = innerHeight * 0.12;
  cards.forEach((card, i) => {
    const proximo = cards[i + 1];
    if (!proximo) return;
    // 0 = próximo card ainda lá embaixo · 1 = próximo card já grudou por cima
    const onde = proximo.getBoundingClientRect().top - (topo + i * DEGRAU);
    const p = Math.min(1, Math.max(0, 1 - (onde - DEGRAU) / (innerHeight - topo)));
    card.style.scale = String(1 - (1 - ENCOLHER) * p);
    card.style.filter = 'brightness(' + (1 - 0.5 * p) + ')';
  });
}

addEventListener('scroll', () => {
  if (!quadro) quadro = requestAnimationFrame(atualizar);
}, { passive: true });
atualizar();`,
  }),
  angular: (v) => ({
    ts: `import { Component, DestroyRef, ElementRef, afterNextRender, inject, viewChildren } from '@angular/core';

@Component({
  selector: 'app-sticky-stack',
  templateUrl: './sticky-stack.html',
  styleUrl: './sticky-stack.css',
})
export class ${nomeClasse('sticky-stack')} {
  protected readonly cards = ${JSON.stringify(CARDS)
    .replace(/"(\w+)":/g, '$1: ')
    .replace(/"/g, "'")
    .replace(/,(\w)/g, ', $1')
    .replace(/},{/g, '}, {')};
  private readonly elementos = viewChildren<ElementRef<HTMLElement>>('card');
  private readonly encolher = ${v['encolher']};
  private readonly degrau = ${v['deslocamento']};

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const reduzir = window.matchMedia('(prefers-reduced-motion: reduce)');
      let quadro = 0;
      const atualizar = () => {
        quadro = 0;
        if (reduzir.matches) return;
        const lista = this.elementos().map((e) => e.nativeElement);
        const topo = window.innerHeight * 0.12;
        lista.forEach((card, i) => {
          const proximo = lista[i + 1];
          if (!proximo) return;
          const onde = proximo.getBoundingClientRect().top - (topo + i * this.degrau);
          const p = Math.min(1, Math.max(0, 1 - (onde - this.degrau) / (window.innerHeight - topo)));
          card.style.scale = String(1 - (1 - this.encolher) * p);
          card.style.filter = 'brightness(' + (1 - 0.5 * p) + ')';
        });
      };
      const aoRolar = () => {
        if (!quadro) quadro = requestAnimationFrame(atualizar);
      };
      window.addEventListener('scroll', aoRolar, { passive: true });
      atualizar();
      destroyRef.onDestroy(() => window.removeEventListener('scroll', aoRolar));
    });
  }
}
`,
    html: `<section class="pilha-cards">
  @for (c of cards; track c.titulo; let i = $index) {
    <article #card class="card-pilha" [style.--i]="i" [style.--fundo]="c.cor">
      <span>0{{ i + 1 }}</span>
      <h2>{{ c.titulo }}</h2>
    </article>
  }
</section>
`,
    css: cssAngularPagina(STICKY_STACK.gerar(v).css),
  }),
  previewAngular: false,
  niveis: {
    iniciante: [
      'São quatro cartões grandes, um depois do outro.',
      'Ao rolar, cada cartão para no topo da tela e o próximo sobe por cima, como cartas sendo empilhadas.',
      'O cartão que ficou embaixo diminui e escurece um pouco, para parecer que está mais longe.',
    ],
    avancado: [
      'Elementos sticky irmãos no mesmo contêiner empilham naturalmente: a ordem do DOM decide quem fica por cima, sem z-index.',
      'transform-origin: center top faz o card encolher "para dentro" da pilha, mantendo a borda de cima no degrau.',
      'O cálculo usa a posição do próximo card (não a do próprio), porque o próprio está parado enquanto gruda.',
      'Versão sem JS: envolva cada card num trilho com view-timeline-name e use animation-range: exit para escalar.',
    ],
  },
  glossario: [
    { termo: 'position: sticky', explicacao: 'O card gruda no topo enquanto o contêiner passa.' },
    {
      termo: 'top: calc(12vh + var(--i) *',
      explicacao: 'Cada card gruda um degrau abaixo do anterior.',
    },
    { termo: 'transform-origin: center top', explicacao: 'Encolhe a partir da borda de cima.' },
    { termo: 'passive: true', explicacao: 'Avisa que o ouvinte de rolagem não bloqueia o scroll.' },
  ],
};
