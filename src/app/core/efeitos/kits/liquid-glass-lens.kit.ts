import { EffectKit } from '../../models/effect-sheet.model';
import { MDN, VALIDADO_EM, cssAngular, cssPalco, nomeClasse } from './_base';

const NOME = 'Kalixto Lab';

/** Como o texto aparece DENTRO da bolha de vidro. */
const ESTILOS_DENTRO: Record<string, string> = {
  serifa:
    "font-family: Georgia, 'Times New Roman', serif;\n  font-style: italic;\n  font-weight: 400;",
  contorno: 'color: transparent;\n  -webkit-text-stroke: 2px #fff;',
  negrito: 'font-weight: 900;\n  letter-spacing: -0.06em;',
};

export const LIQUID_GLASS_LENS: EffectKit = {
  ficha: {
    id: 'liquid-glass-lens',
    nomeTecnico: 'Liquid Glass Lens (troca de tipografia)',
    nomeAmigavel: 'Bolha de vidro que troca a fonte',
    categoria: 'cursor',
    subcategoria: 'Máscaras guiadas pelo ponteiro',
    descricao:
      'Uma bolha de vidro líquido segue o ponteiro sobre um título; dentro dela, as letras aparecem em outra fonte (itálico com serifa, contorno ou ultranegrito), levemente ampliadas.',
    objetivoVisual:
      'Dar um toque de "vidro líquido" (a estética de 2025–2026) e brincar com a identidade tipográfica de um nome ou marca.',
    aplicacoes: [
      'Hero de proposta comercial ou portfólio',
      'Nome de marca em destaque',
      'Páginas de apresentação pessoal',
    ],
    nivel: 'avancado',
    tecnologias: ['HTML', 'CSS', 'JavaScript'],
    dependencias: [],
    interacoes: ['mouse', 'touch'],
    tags: [
      'liquid glass',
      'vidro líquido',
      'bolha',
      'lente',
      'tipografia',
      'mask-image',
      'backdrop-filter',
      'referência em vídeo',
    ],
    explicacao: [
      'O título existe duas vezes, no mesmo lugar: a versão normal embaixo e a versão "alternativa" (outra fonte) em cima.',
      'As duas têm máscaras opostas na posição do ponteiro: a alternativa só aparece dentro do círculo, e a normal só fora dele — assim as letras nunca se sobrepõem.',
      'A bolha é só desenho: borda clara, brilhos com radial-gradient, sombra interna e backdrop-filter, que realça a cor do que está atrás — é isso que dá o aspecto de vidro.',
      'A versão alternativa recebe scale() com transform-origin no ponteiro, como a lente de aumento de uma gota d’água.',
    ],
    alternativa:
      'Para refração de verdade (as bordas "entortando" o fundo), use um filtro SVG feDisplacementMap no backdrop-filter (só Chromium) ou um shader de vidro em WebGL.',
    compatibilidade:
      'mask-image: Chrome/Edge 120+, Firefox 53+, Safari 15.4+ (com -webkit-mask-image). backdrop-filter: todos os navegadores atuais.',
    responsividade:
      'A bolha segue o dedo (touch-action: none só no palco). O título usa clamp() e quebra em telas estreitas.',
    acessibilidade:
      'Só o título normal é lido (a cópia é aria-hidden). Não há movimento automático. Com prefers-reduced-motion, a bolha anda sem transição de entrada.',
    performance:
      'Duas variáveis CSS por quadro (requestAnimationFrame). backdrop-filter numa área pequena é leve; evite bolhas enormes.',
    limitacoes: [
      'As duas fontes têm larguras diferentes: as letras de dentro não coincidem exatamente com as de fora (faz parte do charme, como na referência).',
    ],
    referencias: [
      MDN.mask,
      {
        titulo: 'MDN — backdrop-filter',
        url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter',
      },
      MDN.pointer,
    ],
    validadoEm: VALIDADO_EM,
    status: 'validado',
  },
  params: [
    {
      id: 'raio',
      rotulo: 'raio da bolha',
      tipo: 'range',
      min: 50,
      max: 140,
      passo: 5,
      unidade: 'px',
      padrao: 85,
    },
    {
      id: 'estilo',
      rotulo: 'fonte dentro da bolha',
      tipo: 'select',
      opcoes: [
        { valor: 'serifa', rotulo: 'itálico com serifa' },
        { valor: 'contorno', rotulo: 'só contorno' },
        { valor: 'negrito', rotulo: 'ultranegrito' },
      ],
      padrao: 'serifa',
    },
    {
      id: 'zoom',
      rotulo: 'aumento da gota',
      tipo: 'range',
      min: 1,
      max: 1.3,
      passo: 0.02,
      unidade: '×',
      padrao: 1.08,
    },
  ],
  gerar: (v) => {
    const r = Number(v['raio']);
    return {
      html: `<section class="vidro-palco">
  <h1 class="nome">${NOME}</h1>
  <h1 class="nome nome--alt" aria-hidden="true">${NOME}</h1>
  <div class="bolha" aria-hidden="true"></div>
</section>`,
      css: `${cssPalco()}

.vidro-palco {
  --x: 50%;
  --y: 50%;
  position: relative;
  display: grid;
  place-items: center;
  width: min(100%, 680px);
  aspect-ratio: 16 / 10;
  border-radius: 20px;
  overflow: hidden;
  touch-action: none; /* o dedo move a bolha em vez de rolar a página */
  background:
    radial-gradient(ellipse 120% 60% at 50% 120%, #1d4ed8 45%, #60a5fa 55%, transparent 56%),
    linear-gradient(180deg, #ff7a1a, #f05a0a);
}
/* As duas versões do título ocupam o palco inteiro, uma sobre a outra
   (assim --x/--y valem igual para o palco e para as máscaras) */
.nome {
  grid-area: 1 / 1;
  place-self: stretch;
  display: grid;
  place-items: center;
  margin: 0;
  color: #fff;
  font: 700 clamp(2.4rem, 10vw, 5rem) / 1 system-ui, sans-serif;
  letter-spacing: -0.04em;
  white-space: nowrap;
}
/* A versão normal some DENTRO do círculo (para não aparecer atrás da outra) */
.nome:not(.nome--alt) {
  -webkit-mask-image: radial-gradient(circle ${r}px at var(--x) var(--y), transparent 98%, #000);
  mask-image: radial-gradient(circle ${r}px at var(--x) var(--y), transparent 98%, #000);
}
/* A versão alternativa só aparece dentro do círculo */
.nome--alt {
  ${ESTILOS_DENTRO[String(v['estilo'])]}
  transform: scale(${v['zoom']});
  transform-origin: var(--x) var(--y);
  -webkit-mask-image: radial-gradient(circle ${r}px at var(--x) var(--y), #000 98%, transparent);
  mask-image: radial-gradient(circle ${r}px at var(--x) var(--y), #000 98%, transparent);
}

/* A bolha de vidro: só desenho, segue o mesmo ponto */
.bolha {
  position: absolute;
  left: 0;
  top: 0;
  width: ${r * 2}px;
  height: ${r * 2}px;
  margin: ${-r}px 0 0 ${-r}px;
  translate: var(--x) var(--y);
  border: 1.5px solid rgb(255 255 255 / 0.55);
  border-radius: 50%;
  background:
    radial-gradient(circle at 30% 25%, rgb(255 255 255 / 0.55), transparent 22%),
    radial-gradient(circle at 70% 80%, rgb(255 255 255 / 0.18), transparent 35%);
  box-shadow: inset 0 -10px 30px rgb(255 255 255 / 0.18), inset 0 8px 20px rgb(0 0 0 / 0.12), 0 12px 40px rgb(0 0 0 / 0.25);
  backdrop-filter: saturate(1.6) brightness(1.08);
  pointer-events: none;
  transition: opacity 300ms ease;
}

@media (prefers-reduced-motion: reduce) {
  .bolha { transition: none; }
}`,
      js: `const palco = document.querySelector('.vidro-palco');
let quadro = 0;

function mirar(x, y) {
  palco.style.setProperty('--x', x + 'px');
  palco.style.setProperty('--y', y + 'px');
}

// começa no meio (a bolha precisa de pixels para se posicionar)
const r0 = palco.getBoundingClientRect();
mirar(r0.width / 2, r0.height / 2);

palco.addEventListener('pointermove', (e) => {
  cancelAnimationFrame(quadro);
  quadro = requestAnimationFrame(() => {
    const r = palco.getBoundingClientRect();
    mirar(e.clientX - r.left, e.clientY - r.top);
  });
});`,
    };
  },
  angular: (v) => ({
    ts: `import { Component, ElementRef, afterNextRender, signal, viewChild } from '@angular/core';

@Component({
  selector: 'app-liquid-glass-lens',
  templateUrl: './liquid-glass-lens.html',
  styleUrl: './liquid-glass-lens.css',
})
export class ${nomeClasse('liquid-glass-lens')} {
  protected readonly nome = '${NOME}';
  private readonly palco = viewChild.required<ElementRef<HTMLElement>>('palco');
  private quadro = 0;

  protected readonly x = signal('50%');
  protected readonly y = signal('50%');

  constructor() {
    afterNextRender(() => {
      const r = this.palco().nativeElement.getBoundingClientRect();
      this.mirar(r.width / 2, r.height / 2);
    });
  }

  protected mover(e: PointerEvent): void {
    cancelAnimationFrame(this.quadro);
    this.quadro = requestAnimationFrame(() => {
      const r = this.palco().nativeElement.getBoundingClientRect();
      this.mirar(e.clientX - r.left, e.clientY - r.top);
    });
  }

  private mirar(x: number, y: number): void {
    this.x.set(x + 'px');
    this.y.set(y + 'px');
  }
}
`,
    html: `<section #palco class="vidro-palco" [style.--x]="x()" [style.--y]="y()" (pointermove)="mover($event)">
  <h1 class="nome">{{ nome }}</h1>
  <h1 class="nome nome--alt" aria-hidden="true">{{ nome }}</h1>
  <div class="bolha" aria-hidden="true"></div>
</section>
`,
    css: cssAngular(LIQUID_GLASS_LENS.gerar(v).css),
  }),
  niveis: {
    iniciante: [
      'O nome aparece escrito duas vezes, uma em cima da outra, com fontes diferentes.',
      'A de cima só aparece dentro de uma bolha redonda que segue o mouse.',
      'A bolha tem brilhos e borda clara, para parecer uma gota de vidro passando sobre as letras.',
    ],
    avancado: [
      'A máscara é medida a partir da caixa do próprio elemento: por isso os títulos ocupam o palco inteiro (place-self: stretch) — senão o círculo ficaria deslocado em relação ao ponteiro.',
      'mask-image com "#000 98%, transparent" dá uma borda quase dura, mas com 2% de suavização, evitando serrilhado.',
      'backdrop-filter: saturate() + brightness() imita o realce de cor do vidro; blur() deixaria o fundo leitoso.',
      'No Angular, --x/--y são signals ligados com [style.--x]; afterNextRender centraliza a bolha só no navegador.',
    ],
  },
  glossario: [
    { termo: 'mask-image', explicacao: 'Mostra o título alternativo só dentro do círculo.' },
    { termo: 'backdrop-filter', explicacao: 'Realça o que está atrás da bolha, como vidro.' },
    {
      termo: 'place-self: stretch',
      explicacao:
        'Cada título ocupa o palco inteiro: a máscara usa as mesmas coordenadas do ponteiro.',
    },
    {
      termo: 'transform-origin: var(--x) var(--y)',
      explicacao: 'A ampliação parte do centro da bolha.',
    },
  ],
};
