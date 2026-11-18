import { EffectKit } from '../../models/effect-sheet.model';
import { MDN, VALIDADO_EM, cssAngularPagina, cssPagina, nomeClasse } from './_base';

export const SCROLL_ZOOM_HERO: EffectKit = {
  ficha: {
    id: 'scroll-zoom-hero',
    nomeTecnico: 'Scroll Zoom Hero (imagem que abre em tela cheia)',
    nomeAmigavel: 'Hero que abre no scroll',
    categoria: 'scroll',
    subcategoria: 'Scrollytelling cinematográfico',
    descricao: 'Uma imagem pequena e arredondada no meio do título cresce até ocupar a tela inteira enquanto as palavras do título se afastam para os lados.',
    objetivoVisual: 'Transformar a abertura do site numa "entrada de cena": do título para a imagem, com o usuário no controle.',
    aplicacoes: ['Abertura de portfólio e agência', 'Lançamento de produto', 'Páginas de eventos e filmes'],
    nivel: 'intermediario',
    tecnologias: ['HTML', 'CSS', 'JavaScript'],
    dependencias: [],
    interacoes: ['scroll'],
    tags: ['zoom', 'hero', 'scroll', 'tela cheia', 'scale', 'sticky', 'scrollytelling', 'tendência 2026'],
    explicacao: [
      'A seção é alta e o conteúdo fica preso (sticky) na tela enquanto ela passa — é a "trilha" da animação.',
      'O JavaScript só calcula UM número: --p, o progresso de 0 a 1 da rolagem dentro da seção, e grava na seção.',
      'Todo o resto é CSS: scale da moldura, arredondamento e afastamento das palavras são calc() em cima de --p. Mudar o desenho não exige mexer no JS.',
    ],
    alternativa: 'Sem JS: animation-timeline: view() na seção com animation-range: contain (Chrome/Edge; Safari 26+), usando @supports com esta versão como reserva. Com GSAP: ScrollTrigger com scrub e pin.',
    compatibilidade: 'position: sticky, variáveis CSS em calc() e propriedades individuais (scale, translate): todos os navegadores atuais.',
    responsividade: 'A moldura usa vw/vh e as palavras clamp(); o afastamento é em % da largura da palavra, então funciona em qualquer tela.',
    acessibilidade: 'O título é texto real, legível em qualquer ponto da animação. A animação só acontece com a rolagem; com prefers-reduced-motion a seção mostra o estado final, sem zoom.',
    performance: 'Uma escrita de variável por quadro; scale e translate são compostos na GPU, sem refazer layout.',
    limitacoes: [
      'border-radius em elemento com scale também escala: o arredondamento é calculado já compensando o tamanho.',
      'Use uma imagem com resolução de tela cheia: ela começa pequena, mas termina grande.',
    ],
    referencias: [MDN.scrollTimeline, { titulo: 'MDN — scale (propriedade)', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/scale' }, MDN.reduzir],
    validadoEm: VALIDADO_EM,
    status: 'validado',
  },
  params: [
    { id: 'inicio', rotulo: 'tamanho inicial da imagem', tipo: 'range', min: 0.2, max: 0.7, passo: 0.05, unidade: '×', padrao: 0.35 },
    { id: 'altura', rotulo: 'altura da seção', tipo: 'range', min: 200, max: 500, passo: 50, unidade: 'vh', padrao: 300 },
    { id: 'afastar', rotulo: 'afastamento das palavras', tipo: 'range', min: 0, max: 120, passo: 10, unidade: '%', padrao: 80 },
  ],
  gerar: (v) => {
    const s0 = Number(v['inicio']);
    return {
      html: `<section class="zoom-hero">
  <div class="fixo-hero">
    <div class="moldura" role="img" aria-label="Paisagem ao entardecer"></div>
    <h1 class="titulo-hero">
      <span class="lado esq">Novo</span>
      <span class="lado dir">capítulo</span>
    </h1>
  </div>
</section>

<section class="fim"><p>Fim da página</p></section>`,
      css: `${cssPagina()}

.zoom-hero { --p: 0; height: ${v['altura']}vh; }
.fixo-hero {
  position: sticky;
  top: 0;
  display: grid;
  place-items: center;
  height: 100vh;
  overflow: hidden;
}

/* A imagem: começa pequena e cresce até a tela cheia */
.moldura {
  position: absolute;
  inset: 0;
  scale: calc(${s0} + ${(1 - s0).toFixed(2)} * var(--p));
  border-radius: calc((1 - var(--p)) * 32px / ${s0});
  background:
    radial-gradient(circle at 70% 30%, #ffd27a, transparent 25%),
    linear-gradient(180deg, #ff8a5c 0%, #c24d7a 45%, #2a1f6b 70%, #0b0a14 100%);
}

/* As palavras se afastam para os lados */
.titulo-hero {
  position: relative;
  display: flex;
  gap: 0.3em;
  margin: 0;
  font: 800 clamp(2.4rem, 10vw, 7rem) / 1 system-ui, sans-serif;
  letter-spacing: -0.04em;
  mix-blend-mode: difference;
}
.lado.esq { translate: calc(var(--p) * -${v['afastar']}%) 0; }
.lado.dir { translate: calc(var(--p) * ${v['afastar']}%) 0; }

@media (prefers-reduced-motion: reduce) {
  .zoom-hero { --p: 1 !important; height: auto; }
  .fixo-hero { position: relative; }
}`,
      js: `const hero = document.querySelector('.zoom-hero');
let quadro = 0;

// o único trabalho do JS: progresso da rolagem dentro da seção (0 → 1) em --p
function atualizar() {
  quadro = 0;
  const r = hero.getBoundingClientRect();
  const p = Math.min(1, Math.max(0, -r.top / (hero.offsetHeight - innerHeight)));
  hero.style.setProperty('--p', p.toFixed(4));
}

addEventListener('scroll', () => {
  if (!quadro) quadro = requestAnimationFrame(atualizar);
}, { passive: true });
atualizar();`,
    };
  },
  angular: (v) => ({
    ts: `import { Component, DestroyRef, ElementRef, afterNextRender, inject, signal, viewChild } from '@angular/core';

@Component({
  selector: 'app-scroll-zoom-hero',
  templateUrl: './scroll-zoom-hero.html',
  styleUrl: './scroll-zoom-hero.css',
})
export class ${nomeClasse('scroll-zoom-hero')} {
  private readonly hero = viewChild.required<ElementRef<HTMLElement>>('hero');
  /** Progresso da rolagem dentro da seção (0 → 1). */
  protected readonly p = signal(0);

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      let quadro = 0;
      const atualizar = () => {
        quadro = 0;
        const el = this.hero().nativeElement;
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
    html: `<section #hero class="zoom-hero" [style.--p]="p()">
  <div class="fixo-hero">
    <div class="moldura" role="img" aria-label="Paisagem ao entardecer"></div>
    <h1 class="titulo-hero">
      <span class="lado esq">Novo</span>
      <span class="lado dir">capítulo</span>
    </h1>
  </div>
</section>
`,
    css: cssAngularPagina(SCROLL_ZOOM_HERO.gerar(v).css),
  }),
  previewAngular: false,
  niveis: {
    iniciante: [
      'No começo, a foto é um cartão pequeno no meio de um título grande.',
      'Conforme você rola, a foto cresce até encher a tela e as duas palavras do título vão para os lados.',
      'Rolando de volta, tudo volta ao começo.',
    ],
    avancado: [
      'Padrão "uma variável, muito CSS": --p é a única ponte entre JS e estilo; qualquer propriedade pode reagir a ele com calc().',
      'Dividir o raio pelo scale inicial compensa o scale: no começo o raio aparente é exatamente 32px.',
      'mix-blend-mode: difference mantém o título legível sobre a imagem clara e sobre o fundo escuro.',
      'No Angular, --p é um signal ligado com [style.--p]; o listener de scroll é removido no DestroyRef.',
    ],
  },
  glossario: [
    { termo: "setProperty('--p'", explicacao: 'O JS grava o progresso numa variável CSS.' },
    { termo: 'scale: calc(', explicacao: 'O tamanho da imagem é calculado a partir do progresso.' },
    { termo: 'position: sticky', explicacao: 'Prende a cena na tela enquanto a seção alta passa.' },
    { termo: 'mix-blend-mode: difference', explicacao: 'O título inverte a cor sobre a imagem.' },
  ],
};
