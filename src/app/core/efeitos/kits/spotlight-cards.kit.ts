import { EffectKit } from '../../models/effect-sheet.model';
import { MDN, VALIDADO_EM, cssAngular, cssPalco, nomeClasse } from './_base';

const LUZES = [
  { valor: '139 92 246', rotulo: 'Roxo' },
  { valor: '34 227 255', rotulo: 'Ciano' },
  { valor: '198 255 61', rotulo: 'Lima' },
  { valor: '255 43 214', rotulo: 'Magenta' },
] as const;

const CARDS = [
  { titulo: 'Rápido', texto: 'Tudo carrega em menos de um segundo.' },
  { titulo: 'Acessível', texto: 'Teclado, leitor de tela e contraste.' },
  { titulo: 'Animado', texto: 'Movimento com propósito.' },
  { titulo: 'Seu', texto: 'Código aberto para copiar.' },
];

export const SPOTLIGHT_CARDS: EffectKit = {
  ficha: {
    id: 'spotlight-cards',
    nomeTecnico: 'Spotlight Cards (borda e brilho que seguem o mouse)',
    nomeAmigavel: 'Cards com luz que segue o mouse',
    categoria: 'luz-profundidade',
    subcategoria: 'Brilho e bordas reativas',
    descricao:
      'Uma grade de cards escuros em que a borda e o interior acendem perto do ponteiro — inclusive nos cards vizinhos —, como uma lanterna passando por cima.',
    objetivoVisual:
      'Dar acabamento "premium" a grades de features e bento grids, típico de sites de produtos de tecnologia.',
    aplicacoes: ['Grade de features de SaaS', 'Bento grids', 'Planos e preços'],
    nivel: 'intermediario',
    tecnologias: ['HTML', 'CSS', 'JavaScript'],
    dependencias: [],
    interacoes: ['mouse', 'hover'],
    tags: [
      'spotlight',
      'glow',
      'borda',
      'bento',
      'radial-gradient',
      'mask-composite',
      'linear style',
      'tendência 2026',
    ],
    explicacao: [
      'Ao mover o mouse sobre a grade, o JS grava em cada card a posição do ponteiro relativa a ele (--mx, --my) — até nos cards em que o mouse não está.',
      'O ::before desenha a luz da borda: um radial-gradient na posição do mouse, recortado só na moldura de 1px com uma máscara dupla (content-box "menos" a caixa inteira).',
      'O ::after desenha um brilho bem fraco no interior, com o mesmo gradiente maior e transparente.',
      'Os dois pseudo-elementos ficam invisíveis até o mouse entrar na grade (opacity com transição).',
    ],
    alternativa:
      'Só com CSS dá para fazer o brilho interno com :hover e background-attachment, mas a borda acendendo nos vizinhos exige saber a posição do mouse — por isso o JS.',
    compatibilidade:
      'mask-composite: exclude (sem prefixo): Chrome/Edge 120+, Firefox 53+, Safari 15.4+; o CSS traz também -webkit-mask-composite: xor.',
    responsividade:
      'Grade com auto-fit: 2 colunas no computador e 1 no celular. No toque, os cards ficam com a borda padrão (sem luz).',
    acessibilidade:
      'O efeito é só decorativo; o conteúdo dos cards não depende dele. Não há movimento automático; a transição de opacidade é desligada com prefers-reduced-motion.',
    performance:
      'Duas variáveis por card a cada movimento (com requestAnimationFrame). Os gradientes repintam só a área de cada card.',
    limitacoes: ['Com dezenas de cards, calcule apenas os que estão próximos do ponteiro.'],
    referencias: [
      MDN.mask,
      {
        titulo: 'MDN — mask-composite',
        url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/mask-composite',
      },
      MDN.pointer,
    ],
    validadoEm: VALIDADO_EM,
    status: 'validado',
  },
  params: [
    {
      id: 'raio',
      rotulo: 'raio da luz',
      tipo: 'range',
      min: 100,
      max: 500,
      passo: 20,
      unidade: 'px',
      padrao: 280,
    },
    { id: 'cor', rotulo: 'cor da luz', tipo: 'select', opcoes: LUZES, padrao: '139 92 246' },
    {
      id: 'intensidade',
      rotulo: 'brilho interno',
      tipo: 'range',
      min: 0.05,
      max: 0.4,
      passo: 0.05,
      unidade: '',
      padrao: 0.15,
    },
  ],
  gerar: (v) => {
    const raio = Number(v['raio']);
    const cor = String(v['cor']);
    return {
      html: `<section class="grade-luz">
${CARDS.map(
  (c) => `  <article class="card-luz">
    <h2>${c.titulo}</h2>
    <p>${c.texto}</p>
  </article>`,
).join('\n')}
</section>`,
      css: `${cssPalco()}

.grade-luz {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
  width: min(100%, 640px);
}
.card-luz {
  --mx: -999px;
  --my: -999px;
  position: relative;
  padding: 28px 24px;
  border: 1px solid rgb(255 255 255 / 0.08);
  border-radius: 16px;
  background: #13111f;
}
.card-luz h2 { margin: 0 0 6px; font-size: 20px; }
.card-luz p { margin: 0; color: #a9a3c9; font-size: 15px; }

/* luz na borda: o gradiente só aparece na moldura de 1px */
.card-luz::before,
.card-luz::after {
  content: '';
  position: absolute;
  border-radius: inherit;
  pointer-events: none;
  opacity: 0;
  transition: opacity 400ms ease;
}
.card-luz::before {
  inset: -1px;
  padding: 1px;
  background: radial-gradient(${raio}px circle at var(--mx) var(--my), rgb(${cor} / 0.9), transparent 60%);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}
/* brilho fraco no interior */
.card-luz::after {
  inset: 0;
  background: radial-gradient(${Math.round(raio * 1.4)}px circle at var(--mx) var(--my), rgb(${cor} / ${v['intensidade']}), transparent 60%);
}
.grade-luz:hover .card-luz::before,
.grade-luz:hover .card-luz::after { opacity: 1; }

@media (prefers-reduced-motion: reduce) {
  .card-luz::before, .card-luz::after { transition: none; }
}`,
      js: `const grade = document.querySelector('.grade-luz');
const cards = grade.querySelectorAll('.card-luz');
let quadro = 0;

// cada card recebe a posição do mouse relativa a ele mesmo (até os vizinhos)
grade.addEventListener('pointermove', (e) => {
  cancelAnimationFrame(quadro);
  quadro = requestAnimationFrame(() => {
    cards.forEach((card) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', e.clientX - r.left + 'px');
      card.style.setProperty('--my', e.clientY - r.top + 'px');
    });
  });
});`,
    };
  },
  angular: (v) => ({
    ts: `import { Component, ElementRef, viewChildren } from '@angular/core';

@Component({
  selector: 'app-spotlight-cards',
  templateUrl: './spotlight-cards.html',
  styleUrl: './spotlight-cards.css',
})
export class ${nomeClasse('spotlight-cards')} {
  protected readonly cards = ${JSON.stringify(CARDS, null, 2)
    .replace(/\n/g, '\n  ')
    .replace(/"(\w+)":/g, '$1:')
    .replace(/"/g, "'")};
  private readonly elementos = viewChildren<ElementRef<HTMLElement>>('card');
  private quadro = 0;

  /** Escrita direta no estilo de cada card: muda a cada movimento. */
  protected mover(e: PointerEvent): void {
    cancelAnimationFrame(this.quadro);
    this.quadro = requestAnimationFrame(() => {
      for (const { nativeElement: card } of this.elementos()) {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', e.clientX - r.left + 'px');
        card.style.setProperty('--my', e.clientY - r.top + 'px');
      }
    });
  }
}
`,
    html: `<section class="grade-luz" (pointermove)="mover($event)">
  @for (c of cards; track c.titulo) {
    <article #card class="card-luz">
      <h2>{{ c.titulo }}</h2>
      <p>{{ c.texto }}</p>
    </article>
  }
</section>
`,
    css: cssAngular(SPOTLIGHT_CARDS.gerar(v).css),
  }),
  niveis: {
    iniciante: [
      'São quatro cartões escuros lado a lado.',
      'Quando o mouse passa por cima, a borda dos cartões acende perto dele, como se houvesse uma lanterna.',
      'A luz vaza para os cartões vizinhos, porque todos sabem onde o mouse está.',
    ],
    avancado: [
      'A máscara dupla (content-box + caixa inteira) com composite exclude deixa visível só a área do padding: a moldura de 1px.',
      'Calcular a posição relativa de todos os cards (não só do que está sob o mouse) é o que faz a luz "atravessar" o vão entre eles.',
      '--mx/--my começam em −999px: antes do primeiro movimento, a luz fica fora do card.',
      'Cor em canais separados (rgb(139 92 246 / α)) permite reaproveitar a mesma cor com transparências diferentes na borda e no interior.',
    ],
  },
  glossario: [
    { termo: 'mask-composite: exclude', explicacao: 'Recorta a luz só na moldura do card.' },
    { termo: 'radial-gradient(', explicacao: 'O círculo de luz centrado no mouse.' },
    { termo: '--mx', explicacao: 'Posição horizontal do mouse relativa ao card.' },
    { termo: 'border-radius: inherit', explicacao: 'A luz segue o arredondamento do card.' },
  ],
};
