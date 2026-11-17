import { EffectKit } from '../../models/effect-sheet.model';
import { MDN, VALIDADO_EM, cssAngular, cssPalco, nomeClasse } from './_base';

const SAIDAS: Record<string, string> = {
  subir: `.loader.is-pronto { translate: 0 -100%; }`,
  cortina: `.loader.is-pronto { clip-path: inset(0 0 100% 0); }`,
  abrir: `.loader.is-pronto { clip-path: inset(0 50% 0 50%); }`,
};

export const PRELOADER_COUNTER: EffectKit = {
  ficha: {
    id: 'preloader-counter',
    nomeTecnico: 'Preloader com contador (0 → 100)',
    nomeAmigavel: 'Tela de carregamento com contador',
    categoria: 'navegacao',
    subcategoria: 'Abertura e carregamento',
    descricao: 'Um número gigante conta de 0 a 100 com uma barra fina; ao terminar, a tela de carregamento sai (sobe, fecha como cortina ou abre ao meio) e revela o hero.',
    objetivoVisual: 'Criar expectativa na primeira visita e esconder o carregamento de imagens pesadas, como nos sites de agência premiados.',
    aplicacoes: ['Portfólios e agências', 'Sites com vídeo ou 3D pesado', 'Lançamentos e eventos'],
    nivel: 'intermediario',
    tecnologias: ['HTML', 'CSS', 'JavaScript'],
    dependencias: [],
    interacoes: ['autoplay', 'click'],
    tags: ['preloader', 'loader', 'contador', 'counter', 'intro', 'carregamento', 'cortina', 'tendência 2026'],
    explicacao: [
      'O contador não é um setInterval: a cada quadro calculamos o tempo decorrido ÷ duração, passamos por uma curva (ease) e arredondamos para 0–100.',
      'A barra usa o mesmo progresso em scale do eixo X (transform-origin à esquerda), então número e barra andam juntos.',
      'Ao chegar em 100, a classe is-pronto dispara a saída só com CSS: translate (subir), clip-path inset de baixo para cima (cortina) ou do centro para fora (abrir).',
      'O hero tem a sua própria transição de entrada, com um pequeno atraso, para "nascer" logo depois que a tela sai.',
    ],
    alternativa: 'Num site real, ligue o progresso ao carregamento verdadeiro: Promise.all das imagens/fontes (document.fonts.ready, img.decode()) e use o contador só como mínimo de tempo.',
    compatibilidade: 'clip-path inset(), propriedades individuais e requestAnimationFrame: todos os navegadores atuais.',
    responsividade: 'O número usa clamp() com vw; a barra ocupa a largura do palco.',
    acessibilidade: 'O número é decorativo (aria-hidden); uma região role="status" anuncia "Carregando" e depois "Pronto". Com prefers-reduced-motion o contador é pulado e o conteúdo aparece direto. Evite loaders longos: mais de 2–3 s irrita.',
    performance: 'Um textContent e um transform por quadro durante a contagem; a saída é uma transição CSS.',
    limitacoes: [
      'Um loader "falso" (sem medir carregamento real) só atrasa o site: use com moderação, de preferência só na primeira visita (sessionStorage).',
    ],
    referencias: [MDN.raf, { titulo: 'MDN — clip-path', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/clip-path' }, MDN.reduzir],
    validadoEm: VALIDADO_EM,
    status: 'validado',
  },
  params: [
    { id: 'duracao', rotulo: 'tempo de contagem', tipo: 'range', min: 800, max: 4000, passo: 100, unidade: 'ms', padrao: 2000 },
    {
      id: 'saida',
      rotulo: 'saída da tela',
      tipo: 'select',
      opcoes: [
        { valor: 'subir', rotulo: 'subir' },
        { valor: 'cortina', rotulo: 'cortina (fecha para cima)' },
        { valor: 'abrir', rotulo: 'abrir ao meio' },
      ],
      padrao: 'subir',
    },
    {
      id: 'fundo',
      rotulo: 'cor da tela',
      tipo: 'select',
      opcoes: [
        { valor: '#c6ff3d', rotulo: 'Lima' },
        { valor: '#f1efe9', rotulo: 'Papel' },
        { valor: '#ff2e3e', rotulo: 'Vermelho' },
      ],
      padrao: '#c6ff3d',
    },
  ],
  gerar: (v) => ({
    html: `<section class="site">
  <h1 class="hero-loader">Bem-vindo ao lab</h1>
  <div class="loader">
    <span class="numero" aria-hidden="true">0</span>
    <span class="barra" aria-hidden="true"></span>
  </div>
  <p class="status" role="status">Carregando</p>
</section>
<button class="repetir" type="button">Repetir</button>`,
    css: `${cssPalco()}

.site {
  position: relative;
  display: grid;
  place-items: center;
  width: min(100%, 640px);
  aspect-ratio: 16 / 10;
  border-radius: 20px;
  overflow: hidden;
  background: #16132a;
}
.hero-loader {
  margin: 0;
  font-size: clamp(1.8rem, 7vw, 3.4rem);
  letter-spacing: -0.03em;
  opacity: 0;
  translate: 0 30px;
  transition: opacity 700ms ease 300ms, translate 700ms cubic-bezier(0.22, 1, 0.36, 1) 300ms;
}
.site.is-pronto .hero-loader { opacity: 1; translate: 0 0; }

/* A tela de carregamento cobre tudo */
.loader {
  position: absolute;
  inset: 0;
  background: ${v['fundo']};
  color: #0b0a14;
  clip-path: inset(0 0 0 0);
  transition: translate 900ms cubic-bezier(0.76, 0, 0.24, 1), clip-path 900ms cubic-bezier(0.76, 0, 0.24, 1);
}
.numero {
  position: absolute;
  left: 24px;
  bottom: 12px;
  font: 800 clamp(4rem, 22vw, 10rem) / 0.8 system-ui, sans-serif;
  letter-spacing: -0.06em;
  font-variant-numeric: tabular-nums;
}
.barra {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 4px;
  background: #0b0a14;
  transform: scaleX(var(--p, 0));
  transform-origin: left center;
}
/* Saída */
${SAIDAS[String(v['saida'])]}
.status { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }

.repetir {
  padding: 8px 16px;
  border: 1px solid #3a3456;
  border-radius: 999px;
  background: transparent;
  color: #c9c3ea;
  font: inherit;
  cursor: pointer;
}

@media (prefers-reduced-motion: reduce) {
  .loader, .hero-loader { transition: none; }
}`,
    js: `const DURACAO = ${v['duracao']};
const site = document.querySelector('.site');
const loader = site.querySelector('.loader');
const numero = site.querySelector('.numero');
const status = site.querySelector('.status');
const reduzir = matchMedia('(prefers-reduced-motion: reduce)');
const suave = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2); // ease-in-out
let quadro = 0;

function carregar() {
  cancelAnimationFrame(quadro);
  site.classList.remove('is-pronto');
  loader.classList.remove('is-pronto');
  status.textContent = 'Carregando';
  if (reduzir.matches) return terminar();
  const inicio = performance.now();
  const passo = (agora) => {
    const p = suave(Math.min(1, (agora - inicio) / DURACAO));
    numero.textContent = Math.round(p * 100);
    loader.style.setProperty('--p', p);
    if (p < 1) quadro = requestAnimationFrame(passo);
    else terminar();
  };
  quadro = requestAnimationFrame(passo);
}

function terminar() {
  numero.textContent = 100;
  site.classList.add('is-pronto');
  loader.classList.add('is-pronto');
  status.textContent = 'Pronto';
}

carregar();
document.querySelector('.repetir').addEventListener('click', carregar);`,
  }),
  angular: (v) => ({
    ts: `import { Component, DestroyRef, afterNextRender, inject, signal } from '@angular/core';

@Component({
  selector: 'app-preloader-counter',
  templateUrl: './preloader-counter.html',
  styleUrl: './preloader-counter.css',
})
export class ${nomeClasse('preloader-counter')} {
  private readonly duracao = ${v['duracao']};
  private readonly reduzir = window.matchMedia('(prefers-reduced-motion: reduce)');
  private quadro = 0;

  protected readonly p = signal(0);
  protected readonly pronto = signal(false);

  constructor() {
    afterNextRender(() => this.carregar());
    inject(DestroyRef).onDestroy(() => cancelAnimationFrame(this.quadro));
  }

  protected carregar(): void {
    cancelAnimationFrame(this.quadro);
    this.pronto.set(false);
    if (this.reduzir.matches) return this.terminar();
    const suave = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
    const inicio = performance.now();
    const passo = (agora: number) => {
      const p = suave(Math.min(1, (agora - inicio) / this.duracao));
      this.p.set(p);
      if (p < 1) this.quadro = requestAnimationFrame(passo);
      else this.terminar();
    };
    this.quadro = requestAnimationFrame(passo);
  }

  private terminar(): void {
    this.p.set(1);
    this.pronto.set(true);
  }
}
`,
    html: `<section class="site" [class.is-pronto]="pronto()">
  <h1 class="hero-loader">Bem-vindo ao lab</h1>
  <div class="loader" [class.is-pronto]="pronto()" [style.--p]="p()">
    <span class="numero" aria-hidden="true">{{ (p() * 100).toFixed(0) }}</span>
    <span class="barra" aria-hidden="true"></span>
  </div>
  <p class="status" role="status">{{ pronto() ? 'Pronto' : 'Carregando' }}</p>
</section>
<button class="repetir" type="button" (click)="carregar()">Repetir</button>
`,
    css: cssAngular(PRELOADER_COUNTER.gerar(v).css),
  }),
  niveis: {
    iniciante: [
      'Antes de mostrar o site, aparece uma tela colorida com um número grande contando de 0 a 100.',
      'Uma linha fininha embaixo vai enchendo junto com o número.',
      'Quando chega a 100, a tela sai do caminho e o título do site aparece.',
    ],
    avancado: [
      'Contagem por tempo + função de easing: o número desacelera no fim, o que parece mais "natural" que uma contagem linear.',
      'font-variant-numeric: tabular-nums deixa todos os algarismos com a mesma largura — o número não treme enquanto conta.',
      'clip-path: inset() anima o recorte sem mover o conteúdo; translate move a tela inteira. São leituras diferentes de "sair".',
      'Para medir carregamento real: conte quantos recursos já resolveram (Promise.allSettled) e use esse valor como alvo do contador.',
    ],
  },
  glossario: [
    { termo: 'tabular-nums', explicacao: 'Algarismos com largura igual: o número não "pula".' },
    { termo: 'scaleX(var(--p, 0))', explicacao: 'A barra enche junto com o progresso.' },
    { termo: 'role="status"', explicacao: 'Anuncia "Carregando" e "Pronto" ao leitor de tela.' },
    { termo: 'cubic-bezier(0.76, 0, 0.24, 1)', explicacao: 'Curva forte de entrada e saída para a tela sair com impacto.' },
  ],
};
