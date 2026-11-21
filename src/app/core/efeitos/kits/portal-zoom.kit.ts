import { EffectKit } from '../../models/effect-sheet.model';
import { MDN, VALIDADO_EM, cssAngularPagina, cssPagina, nomeClasse } from './_base';

/**
 * Furos do portal em mask-image: cada furo é um radial-gradient transparente no
 * meio e opaco fora; com mask-composite: intersect, vários furos convivem.
 */
function furos(formato: string, t: number): string[] {
  if (formato === 'lente')
    return [
      `radial-gradient(circle at calc(50% - ${(t * 0.62).toFixed(1)}vmin) 50%, transparent ${(t * 0.5).toFixed(1)}vmin, #000 ${(t * 0.5 + 0.6).toFixed(1)}vmin)`,
      `radial-gradient(circle at calc(50% + ${(t * 0.62).toFixed(1)}vmin) 50%, transparent ${(t * 0.5).toFixed(1)}vmin, #000 ${(t * 0.5 + 0.6).toFixed(1)}vmin)`,
    ];
  if (formato === 'oval')
    return [
      `radial-gradient(${(t * 0.72).toFixed(1)}vmin ${(t * 1.05).toFixed(1)}vmin at 50% 50%, transparent 98%, #000 100%)`,
    ];
  return [`radial-gradient(circle at 50% 50%, transparent ${t}vmin, #000 ${t + 0.6}vmin)`];
}

/** Brilho em volta de cada furo (mesmas posições), no fundo da moldura. */
function brilhos(formato: string, t: number): string[] {
  const anel = (pos: string, r: number) =>
    `radial-gradient(circle at ${pos}, transparent ${r.toFixed(1)}vmin, rgb(255 190 140 / 0.85) ${(r + 0.8).toFixed(1)}vmin, transparent ${(r + 5).toFixed(1)}vmin)`;
  if (formato === 'lente')
    return [
      anel(`calc(50% - ${(t * 0.62).toFixed(1)}vmin) 50%`, t * 0.5),
      anel(`calc(50% + ${(t * 0.62).toFixed(1)}vmin) 50%`, t * 0.5),
    ];
  if (formato === 'oval')
    return [
      `radial-gradient(${(t * 0.72 + 4).toFixed(1)}vmin ${(t * 1.05 + 5).toFixed(1)}vmin at 50% 50%, transparent 78%, rgb(255 190 140 / 0.85) 86%, transparent 100%)`,
    ];
  return [anel('50% 50%', t)];
}

export const PORTAL_ZOOM: EffectKit = {
  ficha: {
    id: 'portal-zoom',
    nomeTecnico: 'Scroll Portal Zoom (zoom através de um furo com mask-image)',
    nomeAmigavel: 'Mergulho pelo portal',
    categoria: 'scroll',
    subcategoria: 'Scrollytelling cinematográfico',
    descricao:
      'A primeira cena tem um furo (portal, janela ou as lentes de um óculos de RV). A rolagem aproxima a câmera até o furo tomar a tela e a pessoa "atravessa" para a cena de trás.',
    objetivoVisual:
      'Trocar de cena sem corte, como se a câmera entrasse num portal ou num visor — a transição dos sites de turismo, games e realidade virtual.',
    aplicacoes: [
      'Hero de destinos e experiências ("Step into wonder")',
      'Produtos de RV/AR: entrar pela lente do óculos',
      'Passagem entre capítulos de um storytelling',
    ],
    nivel: 'intermediario',
    tecnologias: ['HTML', 'CSS', 'JavaScript'],
    dependencias: [],
    interacoes: ['scroll'],
    tags: [
      'portal',
      'mask-image',
      'máscara',
      'zoom',
      'lente',
      'realidade virtual',
      'transição de cena',
      'scrollytelling',
      'referência em vídeo',
    ],
    explicacao: [
      'Duas cenas empilhadas numa área presa (sticky): o destino atrás e a moldura na frente.',
      'A moldura usa mask-image com radial-gradient: transparente dentro do furo, opaca fora. Vários furos (as duas lentes) se combinam com mask-composite: intersect.',
      'O JS grava só --p (0 → 1). O CSS escala a moldura com uma curva acelerada (p³): começa devagar e "mergulha" no fim, até o furo ficar maior que a tela.',
      'O destino faz o caminho contrário (de 1,25× para 1×), o que dá a sensação de profundidade; os textos de cada cena aparecem e somem com opacity em cima de --p.',
    ],
    alternativa:
      'Com GSAP: ScrollTrigger com pin e scrub animando scale. Com SVG: um <mask> com o furo desenhado como path (para formatos livres, como um arco ou o contorno real do óculos).',
    compatibilidade:
      'mask-image e mask-composite: intersect funcionam em todos os navegadores atuais (Safari 15.4+).',
    responsividade: 'O furo é medido em vmin, então mantém a proporção em telas deitadas e em pé.',
    acessibilidade:
      'Os textos das duas cenas são HTML real. Com prefers-reduced-motion não há zoom: as duas cenas aparecem uma depois da outra, sem animação.',
    performance:
      'Só scale e opacity (compostos na GPU) e uma variável CSS por quadro. A máscara é desenhada uma vez e só escalada.',
    limitacoes: [
      'Com scale muito alto a borda do furo pode serrilhar: termine a animação um pouco antes ou troque para a cena de trás com opacity.',
      'radial-gradient só faz círculos e elipses; para um portal com forma livre, use uma máscara SVG.',
    ],
    referencias: [
      MDN.mask,
      {
        titulo: 'MDN — mask-composite',
        url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/mask-composite',
      },
      MDN.scrollTimeline,
      MDN.reduzir,
    ],
    validadoEm: VALIDADO_EM,
    status: 'validado',
  },
  params: [
    {
      id: 'formato',
      rotulo: 'formato do portal',
      tipo: 'select',
      opcoes: [
        { valor: 'circulo', rotulo: 'círculo (portal)' },
        { valor: 'oval', rotulo: 'oval' },
        { valor: 'lente', rotulo: 'duas lentes (óculos de RV)' },
      ],
      padrao: 'circulo',
    },
    {
      id: 'tamanho',
      rotulo: 'tamanho do furo',
      tipo: 'range',
      min: 10,
      max: 30,
      passo: 2,
      unidade: 'vmin',
      padrao: 18,
    },
    {
      id: 'zoom',
      rotulo: 'zoom final',
      tipo: 'range',
      min: 6,
      max: 24,
      passo: 2,
      unidade: '×',
      padrao: 14,
    },
    {
      id: 'altura',
      rotulo: 'altura da seção',
      tipo: 'range',
      min: 200,
      max: 600,
      passo: 50,
      unidade: 'vh',
      padrao: 350,
    },
  ],
  gerar: (v) => {
    const formato = String(v['formato']);
    const t = Number(v['tamanho']);
    const mascara = furos(formato, t);
    const lentes = formato === 'lente';
    return {
      html: `<section class="intro"><p>Role para baixo ↓</p></section>

<section class="portal">
  <div class="cenas">
    <div class="destino">
      <p class="texto-destino">Bem-vindo<br />do outro lado.</p>
    </div>
    <div class="moldura" aria-hidden="true"></div>
    <h2 class="texto-entrada">${lentes ? 'Entre na<br />realidade.' : 'Entre na<br />maravilha.'}</h2>
  </div>
</section>

<section class="fim"><p>Fim da página</p></section>`,
      css: `${cssPagina()}

.portal { --p: 0; height: ${v['altura']}vh; }
.cenas {
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: hidden;
}

/* Atrás: o lugar para onde o portal leva */
.destino {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background:
    radial-gradient(circle at 70% 25%, #fff4c9 0 4%, transparent 18%),
    linear-gradient(180deg, #8ec5ff 0%, #ffd1e8 55%, #ffe7c7 70%, #7fc6a4 71%, #2f7d64 100%);
  scale: calc(1.25 - 0.25 * var(--p));
}
.texto-destino {
  margin: 0;
  text-align: center;
  font: 400 clamp(2rem, 6vw, 4.5rem) / 1.05 Georgia, serif;
  color: #1d2b3a;
  opacity: clamp(0, calc((var(--p) - 0.75) * 5), 1);
}

/* Na frente: a cena com o furo, que cresce cada vez mais rápido (p³) */
.moldura {
  position: absolute;
  inset: 0;
  background:
    ${brilhos(formato, t).join(',\n    ')},
    radial-gradient(circle at 15% 85%, #ff5f8f 0 2.5%, transparent 3%),
    radial-gradient(circle at 82% 78%, #ffb347 0 2%, transparent 2.5%),
    radial-gradient(circle at 25% 20%, #c86bff 0 1.5%, transparent 2%),
    radial-gradient(circle at 75% 15%, #ff8fab 0 1.8%, transparent 2.3%),
    radial-gradient(ellipse at 50% 50%, #3c1d4f 0%, #170b22 70%);
  mask-image: ${mascara.join(', ')};
  mask-composite: intersect;
  scale: calc(1 + ${Number(v['zoom']) - 1} * var(--p) * var(--p) * var(--p));
  opacity: clamp(0, calc((1 - var(--p)) * 8), 1);
}

.texto-entrada {
  position: absolute;
  left: 6vw;
  bottom: 10vh;
  margin: 0;
  font: 400 clamp(1.8rem, 5vw, 3.6rem) / 1 Georgia, serif;
  color: #fff;
  opacity: calc(1 - var(--p) * 4);
}

@media (prefers-reduced-motion: reduce) {
  .portal { height: auto; }
  .cenas { position: relative; height: auto; }
  .moldura, .texto-entrada { display: none; }
  .destino { position: relative; height: 100vh; scale: 1; }
  .texto-destino { opacity: 1; }
}`,
      js: `const secao = document.querySelector('.portal');
let quadro = 0;

// o único trabalho do JS: progresso da rolagem dentro da seção (0 → 1) em --p
function atualizar() {
  quadro = 0;
  const r = secao.getBoundingClientRect();
  const p = Math.min(1, Math.max(0, -r.top / (secao.offsetHeight - innerHeight)));
  secao.style.setProperty('--p', p.toFixed(4));
}

addEventListener('scroll', () => {
  if (!quadro) quadro = requestAnimationFrame(atualizar);
}, { passive: true });
atualizar();`,
    };
  },
  angular: (v) => {
    const lentes = v['formato'] === 'lente';
    return {
      ts: `import { Component, DestroyRef, ElementRef, afterNextRender, inject, signal, viewChild } from '@angular/core';

@Component({
  selector: 'app-portal-zoom',
  templateUrl: './portal-zoom.html',
  styleUrl: './portal-zoom.css',
})
export class ${nomeClasse('portal-zoom')} {
  private readonly secao = viewChild.required<ElementRef<HTMLElement>>('secao');
  /** Progresso da rolagem dentro da seção (0 → 1). */
  protected readonly p = signal(0);

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      let quadro = 0;
      const atualizar = () => {
        quadro = 0;
        const el = this.secao().nativeElement;
        const r = el.getBoundingClientRect();
        this.p.set(Math.min(1, Math.max(0, -r.top / (el.offsetHeight - window.innerHeight))));
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
      html: `<section #secao class="portal" [style.--p]="p()">
  <div class="cenas">
    <div class="destino">
      <p class="texto-destino">Bem-vindo<br />do outro lado.</p>
    </div>
    <div class="moldura" aria-hidden="true"></div>
    <h2 class="texto-entrada">${lentes ? 'Entre na<br />realidade.' : 'Entre na<br />maravilha.'}</h2>
  </div>
</section>
`,
      css: cssAngularPagina(PORTAL_ZOOM.gerar(v).css),
    };
  },
  previewAngular: false,
  niveis: {
    iniciante: [
      'A primeira cena tem um buraco no meio, como um portal (ou as duas lentes de um óculos de realidade virtual).',
      'Rolando, a câmera chega cada vez mais perto do buraco, até ele ficar maior que a tela.',
      'Aí você está "do outro lado", na cena que estava escondida atrás.',
    ],
    avancado: [
      'mask-image com radial-gradient (transparente → preto) faz o furo; mask-composite: intersect soma vários furos numa máscara só.',
      'A curva p³ deixa o começo lento e o fim rápido, a sensação de mergulho. Experimente trocar por p² ou por uma cubic-bezier.',
      'A cena de trás faz um zoom contrário (1,25 → 1) e as duas se cruzam: é a mesma ideia do dolly zoom do cinema.',
      'No Angular, --p é um signal ligado com [style.--p]; todo o resto é CSS.',
    ],
  },
  glossario: [
    {
      termo: 'mask-image',
      explicacao: 'Esconde as partes transparentes da máscara: aqui, o furo.',
    },
    { termo: 'mask-composite: intersect', explicacao: 'Junta várias máscaras (as duas lentes).' },
    { termo: 'scale: calc(', explicacao: 'O zoom da moldura calculado a partir do progresso.' },
    {
      termo: 'position: sticky',
      explicacao: 'Prende as cenas na tela enquanto a seção alta passa.',
    },
  ],
};
