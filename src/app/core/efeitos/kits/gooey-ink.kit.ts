import { EffectKit } from '../../models/effect-sheet.model';
import { MDN, VALIDADO_EM, cssAngular, cssPalco, nomeClasse } from './_base';

const TINTAS = [
  { valor: '#111111', rotulo: 'Nanquim' },
  { valor: '#ff2e3e', rotulo: 'Vermelho' },
  { valor: '#2f7bff', rotulo: 'Azul' },
  { valor: '#8b5cf6', rotulo: 'Roxo' },
] as const;

/** Posições "aleatórias" fixas de cada gota (deslocamento x, y em % e tamanho em px). */
function gotas(n: number): { dx: number; dy: number; s: number }[] {
  return Array.from({ length: n }, (_, i) => ({
    dx: Math.round(Math.sin(i * 2.4) * 34),
    dy: Math.round(Math.cos(i * 1.7) * 26),
    s: 70 + ((i * 37) % 60),
  }));
}

export const GOOEY_INK: EffectKit = {
  ficha: {
    id: 'gooey-ink',
    nomeTecnico: 'Gooey Ink Blobs (filtro SVG)',
    nomeAmigavel: 'Mancha de tinta viva',
    categoria: 'svg-geometria',
    subcategoria: 'Filtros e formas líquidas',
    descricao: 'Gotas de tinta que se juntam e se separam como líquido atrás de um título gigante; cada clique pinga uma gota nova que se espalha.',
    objetivoVisual: 'Dar uma identidade orgânica e "de ateliê" ao hero, com o texto invertendo de cor sobre a tinta.',
    aplicacoes: ['Heros de estúdios criativos', 'Marcas de arte, tinta, café', 'Telas de abertura interativas'],
    nivel: 'intermediario',
    tecnologias: ['SVG', 'CSS', 'JavaScript'],
    dependencias: [],
    interacoes: ['autoplay', 'click', 'touch'],
    tags: ['gooey', 'metaball', 'tinta', 'ink', 'blob', 'líquido', 'feColorMatrix', 'mix-blend-mode', 'referência em vídeo'],
    explicacao: [
      'As gotas são círculos comuns que se movem devagar. O "efeito líquido" vem de um filtro SVG aplicado ao grupo inteiro.',
      'Primeiro feGaussianBlur borra tudo, e os círculos próximos se misturam numa névoa só. Depois feColorMatrix aumenta muito o contraste do canal alfa: o que era meio transparente vira sólido e a borda volta a ficar nítida.',
      'Resultado: onde dois círculos se aproximam, nasce uma "ponte" de tinta entre eles — é a técnica do metaball.',
      'O título usa mix-blend-mode: difference. Sobre o papel claro ele fica escuro; sobre a tinta escura ele fica claro, sem precisar de duas camadas de texto.',
    ],
    alternativa: 'Em WebGL, um shader de metaballs (soma de campos 1/d²) dá bordas perfeitas e milhares de gotas. Em CSS puro, filter: blur() + contrast() no contêiner imita o efeito, mas só com fundo sólido.',
    compatibilidade: 'Filtros SVG referenciados por CSS (filter: url(#…)) e mix-blend-mode: todos os navegadores atuais.',
    responsividade: 'Posições em % do palco e tamanho das gotas fixo; no celular as gotas ocupam mais área relativa, o que reforça a mancha.',
    acessibilidade: 'O título é texto real. A tinta é decorativa (aria-hidden). Com prefers-reduced-motion as gotas ficam paradas e o clique ainda pinga gotas, sem a animação de espalhar.',
    performance: 'Filtros SVG são calculados na CPU em vários navegadores: mantenha a área filtrada pequena (só o palco) e poucas gotas (até ~12).',
    limitacoes: [
      'O filtro "come" um pouco a borda das gotas: a forma final é menor que o círculo original. Aumente o tamanho para compensar.',
      'O contraste no alfa funciona com fundo transparente; não coloque um fundo dentro do grupo filtrado.',
    ],
    referencias: [
      { titulo: 'MDN — <feColorMatrix>', url: 'https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feColorMatrix' },
      { titulo: 'MDN — <feGaussianBlur>', url: 'https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feGaussianBlur' },
      { titulo: 'MDN — mix-blend-mode', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/mix-blend-mode' },
    ],
    validadoEm: VALIDADO_EM,
    status: 'validado',
  },
  params: [
    { id: 'gotas', rotulo: 'número de gotas', tipo: 'range', min: 3, max: 9, passo: 1, unidade: '', padrao: 6 },
    { id: 'viscosidade', rotulo: 'viscosidade (desfoque)', tipo: 'range', min: 6, max: 20, passo: 1, unidade: '', padrao: 12 },
    { id: 'cor', rotulo: 'cor da tinta', tipo: 'select', opcoes: TINTAS, padrao: '#111111' },
  ],
  gerar: (v) => {
    const lista = gotas(Number(v['gotas']));
    return {
      html: `<svg class="filtros" width="0" height="0" aria-hidden="true">
  <filter id="gooey">
    <feGaussianBlur in="SourceGraphic" stdDeviation="${v['viscosidade']}" result="borrado" />
    <feColorMatrix in="borrado" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9" />
  </filter>
</svg>
<section class="papel">
  <div class="tinta" aria-hidden="true">
${lista.map((g, i) => `    <span class="gota" style="--dx: ${g.dx}%; --dy: ${g.dy}%; --s: ${g.s}px; --i: ${i}"></span>`).join('\n')}
  </div>
  <h1 class="sopro">SOPRO</h1>
</section>
<p class="dica">Clique ou toque no papel para pingar tinta.</p>`,
      css: `${cssPalco()}

.filtros { position: absolute; }

.papel {
  position: relative;
  display: grid;
  place-items: center;
  width: min(100%, 640px);
  aspect-ratio: 16 / 10;
  border-radius: 20px;
  overflow: hidden;
  background: #f1efe9;
  cursor: crosshair;
}

/* O grupo inteiro passa pelo filtro: as gotas viram líquido */
.tinta {
  position: absolute;
  inset: 0;
  filter: url(#gooey);
}
.gota {
  position: absolute;
  left: 50%;
  top: 50%;
  width: var(--s);
  aspect-ratio: 1;
  margin: calc(var(--s) / -2) 0 0 calc(var(--s) / -2);
  border-radius: 50%;
  background: ${v['cor']};
  animation: vagar calc(5s + var(--i) * 0.7s) ease-in-out calc(var(--i) * -1.3s) infinite alternate;
}
@keyframes vagar {
  from { translate: calc(var(--dx) * -0.6) calc(var(--dy) * -0.6); }
  to { translate: calc(var(--dx) * 2) calc(var(--dy) * 2); }
}

/* Gota pingada pelo clique: nasce pequena e se espalha */
.gota.pingo {
  left: var(--x);
  top: var(--y);
  animation: espalhar 1400ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
}
@keyframes espalhar {
  from { scale: 0.1; }
  to { scale: 1; }
}

/* Texto que inverte sobre a tinta */
.sopro {
  position: relative;
  margin: 0;
  font: 900 clamp(3rem, 16vw, 8rem) / 1 'Arial Black', system-ui, sans-serif;
  letter-spacing: -0.04em;
  color: #fff;
  mix-blend-mode: difference;
  pointer-events: none;
}
.dica { margin: 0; color: #c9c3ea; font-size: 14px; }

@media (prefers-reduced-motion: reduce) {
  .gota, .gota.pingo { animation: none; }
}`,
      js: `const papel = document.querySelector('.papel');
const tinta = papel.querySelector('.tinta');
const MAX_PINGOS = 8;

// cada clique pinga uma gota nova no ponto tocado
papel.addEventListener('pointerdown', (e) => {
  const r = papel.getBoundingClientRect();
  const pingo = document.createElement('span');
  pingo.className = 'gota pingo';
  pingo.style.setProperty('--x', e.clientX - r.left + 'px');
  pingo.style.setProperty('--y', e.clientY - r.top + 'px');
  pingo.style.setProperty('--s', 60 + Math.random() * 90 + 'px');
  tinta.append(pingo);
  // limita a quantidade: o filtro fica mais caro a cada gota
  const pingos = tinta.querySelectorAll('.pingo');
  if (pingos.length > MAX_PINGOS) pingos[0].remove();
});`,
    };
  },
  angular: (v) => ({
    ts: `import { Component, signal } from '@angular/core';

interface Pingo {
  id: number;
  x: string;
  y: string;
  s: string;
}

@Component({
  selector: 'app-gooey-ink',
  templateUrl: './gooey-ink.html',
  styleUrl: './gooey-ink.css',
})
export class ${nomeClasse('gooey-ink')} {
  protected readonly gotas = ${JSON.stringify(gotas(Number(v['gotas'])))
      .replace(/"(\w+)":/g, '$1: ')
      .replace(/},{/g, '}, {')
      .replace(/,(\w)/g, ', $1')};
  protected readonly pingos = signal<Pingo[]>([]);
  private proximo = 0;

  protected pingar(e: PointerEvent, papel: HTMLElement): void {
    const r = papel.getBoundingClientRect();
    const novo: Pingo = {
      id: this.proximo++,
      x: e.clientX - r.left + 'px',
      y: e.clientY - r.top + 'px',
      s: 60 + Math.random() * 90 + 'px',
    };
    // limita a quantidade: o filtro fica mais caro a cada gota
    this.pingos.update((lista) => [...lista, novo].slice(-8));
  }
}
`,
    html: `<svg class="filtros" width="0" height="0" aria-hidden="true">
  <filter id="gooey">
    <feGaussianBlur in="SourceGraphic" stdDeviation="${v['viscosidade']}" result="borrado" />
    <feColorMatrix in="borrado" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9" />
  </filter>
</svg>
<section #papel class="papel" (pointerdown)="pingar($event, papel)">
  <div class="tinta" aria-hidden="true">
    @for (g of gotas; track $index) {
      <span class="gota" [style.--dx.%]="g.dx" [style.--dy.%]="g.dy" [style.--s.px]="g.s" [style.--i]="$index"></span>
    }
    @for (p of pingos(); track p.id) {
      <span class="gota pingo" [style.--x]="p.x" [style.--y]="p.y" [style.--s]="p.s"></span>
    }
  </div>
  <h1 class="sopro">SOPRO</h1>
</section>
<p class="dica">Clique ou toque no papel para pingar tinta.</p>
`,
    css: cssAngular(GOOEY_INK.gerar(v).css),
  }),
  niveis: {
    iniciante: [
      'Há várias bolinhas de tinta passeando atrás da palavra.',
      'Quando duas bolinhas chegam perto, elas "grudam" como gotas de água — isso é feito com um filtro.',
      'Clicando no papel, cai uma gota nova que se espalha. A palavra muda de cor sozinha quando passa por cima da tinta.',
    ],
    avancado: [
      'Na matriz do feColorMatrix, a última linha (0 0 0 22 −9) é o alfa: alfa_final = 22 × alfa − 9. Quem tinha alfa abaixo de ~0,41 some; acima, vira opaco.',
      'stdDeviation maior = gotas "se enxergam" de mais longe (mais viscoso); menor = só grudam quando quase se tocam.',
      'translate como propriedade individual na animação deixa o scale do pingo livre para outra animação, sem um transform sobrescrever o outro.',
      'No Angular, [style.--dx.%] e [style.--s.px] acrescentam a unidade ao número; a lista de pingos é um signal limitado aos 8 mais recentes.',
    ],
  },
  glossario: [
    { termo: 'feGaussianBlur', explicacao: 'Borra as gotas para que se misturem.' },
    { termo: 'feColorMatrix', explicacao: 'Aumenta o contraste do alfa e devolve a borda nítida.' },
    { termo: 'filter: url(#gooey)', explicacao: 'Aplica o filtro SVG ao grupo de gotas.' },
    { termo: 'mix-blend-mode: difference', explicacao: 'O título inverte de cor sobre a tinta.' },
  ],
};
