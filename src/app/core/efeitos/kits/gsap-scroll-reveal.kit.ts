import { EffectKit } from '../../models/effect-sheet.model';
import { MDN, VALIDADO_EM, cssAngularPagina, cssPagina, nomeClasse } from './_base';

const CARDS = ['Timeline', 'Stagger', 'Easing', 'ScrollTrigger', 'Batch', 'Scrub'];

const EASES = [
  { valor: 'power3.out', rotulo: 'power3.out (suave)' },
  { valor: 'expo.out', rotulo: 'expo.out (freada longa)' },
  { valor: 'back.out(1.7)', rotulo: 'back.out (passa e volta)' },
  { valor: 'elastic.out(1, 0.5)', rotulo: 'elastic.out (mola)' },
] as const;

function jsAnimacao(v: Record<string, string | number>, alvo: string, escopo = ''): string {
  if (v['modo'] === 'scrub') {
    return `gsap.utils.toArray(${alvo}${escopo}).forEach((card) => {
      gsap.fromTo(card, { opacity: 0, y: ${v['y']} }, {
        opacity: 1,
        y: 0,
        ease: 'none',
        scrollTrigger: { trigger: card, start: '${v['inicio']}', end: 'top 40%', scrub: true },
      });
    });`;
  }
  return `gsap.set(${alvo}${escopo}, { opacity: 0, y: ${v['y']} });
    ScrollTrigger.batch(${alvo}${escopo}, {
      start: '${v['inicio']}',
      onEnter: (lote) =>
        gsap.to(lote, { opacity: 1, y: 0, duration: ${v['dur']}, ease: '${v['ease']}', stagger: ${v['stagger']}, overwrite: true }),
    });`;
}

export const GSAP_SCROLL_REVEAL: EffectKit = {
  ficha: {
    id: 'gsap-scroll-reveal',
    nomeTecnico: 'ScrollTrigger Batch Reveal',
    nomeAmigavel: 'Revelar ao rolar com GSAP',
    categoria: 'scroll',
    subcategoria: 'Entradas por rolagem',
    descricao:
      'Os cards entram em lotes quando chegam na tela, ou acompanham a barra de rolagem (scrub), usando GSAP e ScrollTrigger.',
    objetivoVisual: 'Entradas por rolagem com curvas ricas e controle fino de início e fim.',
    aplicacoes: ['Grades de projetos', 'Seções de recursos', 'Narrativas guiadas pela rolagem'],
    nivel: 'intermediario',
    tecnologias: ['HTML', 'CSS', 'JavaScript', 'GSAP', 'ScrollTrigger'],
    dependencias: ['gsap'],
    interacoes: ['scroll'],
    tags: ['gsap', 'scrolltrigger', 'batch', 'scrub', 'scroll', 'reveal', 'stagger'],
    explicacao: [
      'gsap.registerPlugin(ScrollTrigger) ativa o plugin. gsap.matchMedia só cria as animações se o usuário não pediu menos movimento.',
      'No modo lote, ScrollTrigger.batch agrupa os cards que entram juntos na tela e anima o grupo com stagger (um depois do outro).',
      'start: "top 85%" significa: dispara quando o topo do card passa 85% da altura da tela.',
      'No modo scrub, cada card tem sua própria animação presa à rolagem: rolar para cima desfaz a animação.',
    ],
    alternativa:
      'Sem biblioteca: IntersectionObserver + transition do CSS (veja o kit "Revelar ao rolar"). É mais leve, mas não tem scrub nem as curvas do GSAP.',
    compatibilidade: 'GSAP 3 funciona em todos os navegadores atuais.',
    responsividade:
      'start e end são relativos à altura da tela, então o comportamento é o mesmo em qualquer aparelho. ScrollTrigger recalcula as posições quando a janela muda de tamanho.',
    acessibilidade:
      'gsap.matchMedia("(prefers-reduced-motion: no-preference)") só cria as animações para quem não pediu menos movimento; os demais veem os cards direto, sem animação.',
    performance:
      'O GSAP anima transform e opacity. O ScrollTrigger lê as posições uma vez (e no resize), não a cada rolagem. Custo: cerca de 118 kB de bibliotecas minificadas (gsap.min.js + ScrollTrigger.min.js, sem gzip).',
    limitacoes: [
      'Precisa de duas bibliotecas externas.',
      'Conteúdo que muda de altura depois de carregar exige ScrollTrigger.refresh().',
    ],
    referencias: [MDN.scrollTrigger, MDN.gsapMatchMedia, MDN.reduzir],
    validadoEm: VALIDADO_EM,
    status: 'validado',
  },
  params: [
    {
      id: 'modo',
      rotulo: 'modo',
      tipo: 'select',
      opcoes: [
        { valor: 'lote', rotulo: 'entra em lotes (batch)' },
        { valor: 'scrub', rotulo: 'presa à rolagem (scrub)' },
      ],
      padrao: 'lote',
    },
    {
      id: 'inicio',
      rotulo: 'começa quando o topo do card passa',
      tipo: 'select',
      opcoes: [
        { valor: 'top 90%', rotulo: '90% da tela' },
        { valor: 'top 85%', rotulo: '85% da tela' },
        { valor: 'top 70%', rotulo: '70% da tela' },
      ],
      padrao: 'top 85%',
    },
    {
      id: 'y',
      rotulo: 'distância',
      tipo: 'range',
      min: 0,
      max: 160,
      passo: 10,
      unidade: 'px',
      padrao: 60,
    },
    {
      id: 'dur',
      rotulo: 'duração',
      tipo: 'range',
      min: 0.2,
      max: 2,
      passo: 0.1,
      unidade: 's',
      padrao: 0.8,
    },
    {
      id: 'stagger',
      rotulo: 'intervalo entre cards',
      tipo: 'range',
      min: 0,
      max: 0.4,
      passo: 0.02,
      unidade: 's',
      padrao: 0.12,
    },
    { id: 'ease', rotulo: 'curva (ease)', tipo: 'select', opcoes: EASES, padrao: 'power3.out' },
  ],
  bibliotecas: ['gsap', 'scrolltrigger'],
  gerar: (v) => ({
    html: `<section class="intro"><p>Role para baixo ↓</p></section>

<section class="grade">
${CARDS.map((c) => `  <article class="card"><h2>${c}</h2></article>`).join('\n')}
</section>

<section class="fim"><p>Fim da página</p></section>`,
    css: `${cssPagina()}

.grade {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;
  max-width: 760px;
  margin: 0 auto;
  padding: 24px;
}
.card {
  display: grid;
  place-items: center;
  min-height: 180px;
  border-radius: 16px;
  background: linear-gradient(160deg, #3b1f5e, #161229);
  border: 1px solid #4b3a76;
}
.card h2 { margin: 0; font-size: 1.15rem; }`,
    js: `// GSAP e ScrollTrigger são carregados antes deste script
gsap.registerPlugin(ScrollTrigger);

// Só anima para quem não pediu menos movimento
const mm = gsap.matchMedia();
mm.add('(prefers-reduced-motion: no-preference)', () => {
  ${jsAnimacao(v, "'.card'")}
});`,
  }),
  angular: (v) => ({
    ts: `import { Component, DestroyRef, ElementRef, afterNextRender, inject } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-gsap-scroll-reveal',
  templateUrl: './gsap-scroll-reveal.html',
  styleUrl: './gsap-scroll-reveal.css',
})
export class ${nomeClasse('gsap-scroll-reveal')} {
  protected readonly cards = ${JSON.stringify(CARDS).replace(/,/g, ', ')};

  constructor() {
    const host = inject(ElementRef<HTMLElement>).nativeElement;
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      // matchMedia reverte tudo sozinho quando a preferência muda ou no revert()
      const mm = gsap.matchMedia(host);
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const cards = host.querySelectorAll('.card');
        ${jsAnimacao(v, 'cards').replace(/gsap\.utils\.toArray\(cards\)/, 'gsap.utils.toArray<HTMLElement>(cards)')}
      });
      destroyRef.onDestroy(() => mm.revert());
    });
  }
}
`,
    html: `<section class="grade">
  @for (c of cards; track c) {
    <article class="card"><h2>{{ c }}</h2></article>
  }
</section>
`,
    css: cssAngularPagina(GSAP_SCROLL_REVEAL.gerar(v).css),
  }),
  previewAngular: false,
  niveis: {
    iniciante: [
      'GSAP é uma biblioteca de animação; o ScrollTrigger é a parte dela que reage à rolagem.',
      'No modo "lote", os cards que aparecem juntos na tela entram um depois do outro.',
      'No modo "scrub", a animação acompanha a rolagem: se você volta, ela volta junto.',
    ],
    avancado: [
      'ScrollTrigger.batch reduz o número de triggers e agrupa os callbacks por quadro — bom para grades longas.',
      'overwrite: true cancela tweens antigos no mesmo elemento, evitando briga entre animações quando o usuário rola rápido.',
      'gsap.matchMedia cria e reverte animações por media query; no Angular, mm.revert() no DestroyRef limpa triggers e estilos inline.',
      'No Angular, gsap.matchMedia(host) limita os seletores ao componente.',
      'scrub: true liga direto à rolagem; scrub: 0.5 adiciona meio segundo de "alcance", suavizando rolagens bruscas.',
    ],
  },
  glossario: [
    { termo: 'registerPlugin', explicacao: 'Ativa o plugin ScrollTrigger no GSAP.' },
    {
      termo: 'gsap.matchMedia',
      explicacao: 'Cria animações só quando a media query bate (aqui, sem redução de movimento).',
    },
    { termo: 'ScrollTrigger.batch', explicacao: 'Agrupa os elementos que entram juntos na tela.' },
    { termo: 'stagger', explicacao: 'Intervalo entre o início da animação de cada card.' },
    { termo: "start: 'top", explicacao: 'Quando dispara: topo do card × posição na tela.' },
    { termo: 'overwrite: true', explicacao: 'Cancela animações anteriores do mesmo card.' },
  ],
};
