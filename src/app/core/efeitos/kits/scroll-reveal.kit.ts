import { EffectKit } from '../../models/effect-sheet.model';
import { EASINGS, MDN, VALIDADO_EM, cssAngularPagina, cssPagina, nomeClasse } from './_base';

const CARDS = ['Descobrir', 'Experimentar', 'Entender', 'Modificar', 'Reutilizar', 'Criar'];

export const SCROLL_REVEAL: EffectKit = {
  ficha: {
    id: 'scroll-reveal',
    nomeTecnico: 'Scroll Reveal (Intersection Observer)',
    nomeAmigavel: 'Revelar ao rolar',
    categoria: 'scroll',
    subcategoria: 'Entradas por rolagem',
    descricao: 'Os elementos aparecem quando entram na área visível da página, um depois do outro.',
    objetivoVisual: 'Guiar o olhar pela página e dar ritmo à leitura.',
    aplicacoes: ['Seções de landing pages', 'Listas de cards e serviços', 'Linhas do tempo'],
    nivel: 'iniciante',
    tecnologias: ['HTML', 'CSS', 'JavaScript'],
    dependencias: [],
    interacoes: ['scroll'],
    tags: ['scroll', 'reveal', 'intersection observer', 'entrada', 'rolagem', 'aparecer'],
    explicacao: [
      'IntersectionObserver avisa quando um elemento entra ou sai da área visível — sem ficar escutando cada pixel de rolagem.',
      'Quando o card entra, o JavaScript coloca a classe is-visivel; o CSS faz a transição de opacidade e posição.',
      'threshold define quanto do card precisa aparecer para contar como "visível" (0,2 = 20%).',
      'Cada card recebe --i (sua posição) para o atraso em cascata; no modo "uma vez", o observador para de vigiar o card depois que ele aparece.',
    ],
    alternativa: 'GSAP ScrollTrigger com ScrollTrigger.batch() faz o mesmo e permite atrelar a animação à barra de rolagem (scrub) — veja o kit "Revelar ao rolar com GSAP".',
    compatibilidade: 'IntersectionObserver funciona em todos os navegadores atuais.',
    responsividade: 'Funciona em qualquer largura; o grid de cards se reorganiza sozinho.',
    acessibilidade: 'O conteúdo está no HTML desde o início. Com prefers-reduced-motion, os cards aparecem sem deslocamento. Se o JavaScript falhar, a classe .js nunca é aplicada e tudo fica visível.',
    performance: 'Nenhum trabalho por quadro de rolagem: o navegador só chama o observador quando a visibilidade muda. Só transform e opacity são animadas.',
    limitacoes: ['Elementos que já estão visíveis ao carregar animam imediatamente.', 'No modo "sempre", rolar rápido para cima e para baixo repete muitas animações.'],
    referencias: [MDN.io, MDN.transition, MDN.reduzir],
    validadoEm: VALIDADO_EM,
    status: 'validado',
  },
  params: [
    { id: 'limiar', rotulo: 'quanto precisa aparecer', tipo: 'range', min: 0, max: 1, passo: 0.05, unidade: '', padrao: 0.2 },
    { id: 'dist', rotulo: 'distância', tipo: 'range', min: 0, max: 120, passo: 4, unidade: 'px', padrao: 40 },
    { id: 'dur', rotulo: 'duração', tipo: 'range', min: 200, max: 1500, passo: 50, unidade: 'ms', padrao: 700 },
    { id: 'cascata', rotulo: 'intervalo entre cards', tipo: 'range', min: 0, max: 300, passo: 10, unidade: 'ms', padrao: 80 },
    {
      id: 'repetir',
      rotulo: 'animar',
      tipo: 'select',
      opcoes: [
        { valor: 'uma', rotulo: 'só na primeira vez' },
        { valor: 'sempre', rotulo: 'toda vez que entrar' },
      ],
      padrao: 'uma',
    },
    { id: 'easing', rotulo: 'curva (easing)', tipo: 'select', opcoes: EASINGS, padrao: 'cubic-bezier(0.22, 1, 0.36, 1)' },
  ],
  gerar: (v) => ({
    html: `<section class="intro"><p>Role para baixo ↓</p></section>

<section class="grade">
${CARDS.map((c, i) => `  <article class="card revelar" style="--i: ${i % 3}"><h2>${c}</h2></article>`).join('\n')}
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
  background: linear-gradient(160deg, #2a1f4d, #161229);
  border: 1px solid #3a3456;
}
.card h2 { margin: 0; font-size: 1.2rem; }

/* O efeito: só esconde se o JavaScript estiver ativo (classe .js no <html>) */
.js .revelar {
  opacity: 0;
  transform: translateY(${v['dist']}px);
  transition:
    opacity ${v['dur']}ms ${v['easing']},
    transform ${v['dur']}ms ${v['easing']};
  transition-delay: calc(var(--i) * ${v['cascata']}ms);
}
.js .revelar.is-visivel {
  opacity: 1;
  transform: none;
}

@media (prefers-reduced-motion: reduce) {
  .js .revelar { transform: none; }
}`,
    js: `document.documentElement.classList.add('js');

const SO_UMA_VEZ = ${v['repetir'] === 'uma'};
const observador = new IntersectionObserver((entradas) => {
  for (const entrada of entradas) {
    if (entrada.isIntersecting) {
      entrada.target.classList.add('is-visivel');
      if (SO_UMA_VEZ) observador.unobserve(entrada.target); // não precisa mais vigiar
    } else if (!SO_UMA_VEZ) {
      entrada.target.classList.remove('is-visivel');
    }
  }
}, { threshold: ${v['limiar']} });

document.querySelectorAll('.revelar').forEach((el) => observador.observe(el));`,
  }),
  angular: (v) => ({
    ts: `import { Component, DestroyRef, ElementRef, afterNextRender, inject, signal, viewChildren } from '@angular/core';

@Component({
  selector: 'app-scroll-reveal',
  templateUrl: './scroll-reveal.html',
  styleUrl: './scroll-reveal.css',
  host: { class: 'js' },
})
export class ${nomeClasse('scroll-reveal')} {
  protected readonly cards = ${JSON.stringify(CARDS).replace(/,/g, ', ')};
  private readonly soUmaVez = ${v['repetir'] === 'uma'};
  private readonly elementos = viewChildren<ElementRef<HTMLElement>>('revelar');
  /** Índices dos cards visíveis. */
  protected readonly visiveis = signal(new Set<number>());

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const observador = new IntersectionObserver((entradas) => {
        for (const entrada of entradas) {
          const i = Number((entrada.target as HTMLElement).dataset['i']);
          if (entrada.isIntersecting) {
            this.visiveis.update((s) => new Set(s).add(i));
            if (this.soUmaVez) observador.unobserve(entrada.target);
          } else if (!this.soUmaVez) {
            this.visiveis.update((s) => {
              const n = new Set(s);
              n.delete(i);
              return n;
            });
          }
        }
      }, { threshold: ${v['limiar']} });
      this.elementos().forEach((e) => observador.observe(e.nativeElement));
      destroyRef.onDestroy(() => observador.disconnect());
    });
  }
}
`,
    html: `<section class="grade">
  @for (c of cards; track c; let i = $index) {
    <article
      #revelar
      class="card revelar"
      [attr.data-i]="i"
      [style.--i]="i % 3"
      [class.is-visivel]="visiveis().has(i)"
    >
      <h2>{{ c }}</h2>
    </article>
  }
</section>
`,
    css: cssAngularPagina(SCROLL_REVEAL.gerar(v).css).replace(/\.js \.revelar/g, ':host(.js) .revelar'),
  }),
  previewAngular: false,
  niveis: {
    iniciante: [
      'O navegador avisa quando um card aparece na tela; nessa hora o card ganha uma classe e o CSS faz ele surgir.',
      'Os cards da mesma linha aparecem um pouco depois do outro, em cascata.',
      'Você pode escolher se a animação acontece só na primeira vez ou toda vez que o card volta à tela.',
    ],
    avancado: [
      'IntersectionObserver roda fora da thread principal de rolagem; é muito mais barato que ler getBoundingClientRect em cada evento scroll.',
      'A classe .js no <html> é progressive enhancement: sem JavaScript, nada fica escondido.',
      'rootMargin (ex.: "0px 0px -10% 0px") antecipa ou atrasa o disparo sem mudar o threshold.',
      'No Angular, o observador nasce em afterNextRender (só no navegador, compatível com SSR) e é desconectado no DestroyRef.',
      'transition-delay com calc(var(--i) * intervalo) resolve a cascata no CSS, sem timers no JavaScript.',
    ],
  },
  glossario: [
    { termo: 'IntersectionObserver', explicacao: 'API que avisa quando um elemento entra ou sai da área visível.' },
    { termo: 'threshold', explicacao: 'Quanto do elemento precisa estar visível para disparar (0 a 1).' },
    { termo: 'isIntersecting', explicacao: 'true quando o elemento está visível segundo o threshold.' },
    { termo: 'unobserve', explicacao: 'Para de vigiar o elemento (usado no modo "só na primeira vez").' },
    { termo: 'transition-delay', explicacao: 'Atraso de cada card, calculado pela posição --i.' },
    { termo: "classList.add('js')", explicacao: 'Marca que o JavaScript está ativo; só então os cards começam escondidos.' },
  ],
};
