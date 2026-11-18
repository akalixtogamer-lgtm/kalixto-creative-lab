import { EffectKit } from '../../models/effect-sheet.model';
import { VALIDADO_EM, cssAngularPagina, cssPagina, nomeClasse } from './_base';

export const FROSTED_NAVBAR: EffectKit = {
  ficha: {
    id: 'frosted-navbar',
    nomeTecnico: 'Frosted Glass Navbar on Scroll',
    nomeAmigavel: 'Menu que vira vidro ao rolar',
    categoria: 'navegacao',
    subcategoria: 'Navbars e cabeçalhos',
    descricao: 'O menu do topo começa transparente sobre o hero; ao rolar, ele vira uma barra de vidro fosco, encolhe um pouco e ganha borda — o conteúdo passa desfocado por baixo.',
    objetivoVisual: 'Manter a navegação sempre visível sem esconder o conteúdo, com o acabamento de vidro dos sites e apps atuais.',
    aplicacoes: ['Cabeçalho de qualquer site', 'Barras de ferramentas em apps web', 'Menus sobre heros com foto ou vídeo'],
    nivel: 'iniciante',
    tecnologias: ['HTML', 'CSS', 'JavaScript'],
    dependencias: [],
    interacoes: ['scroll'],
    tags: ['navbar', 'menu', 'cabeçalho', 'header', 'vidro', 'glassmorphism', 'backdrop-filter', 'sticky', 'tendência 2026'],
    explicacao: [
      'O cabeçalho é position: sticky no topo. Sem rolagem, o fundo é transparente e não há desfoque.',
      'Um IntersectionObserver vigia um "sensor" de 1px no topo da página: quando ele sai da tela (a pessoa rolou), o cabeçalho ganha a classe is-vidro.',
      'is-vidro liga o fundo translúcido, o backdrop-filter (desfoque + saturação), a borda inferior e diminui o padding — tudo com transição.',
      'Usar o observer (e não o evento scroll) evita rodar código a cada pixel rolado.',
    ],
    alternativa: 'Só CSS: com scroll-driven animations (animation-timeline: scroll()) dá para animar o fundo do cabeçalho conforme a rolagem, sem JS, em Chrome/Edge e Safari 26+.',
    compatibilidade: 'backdrop-filter: Chrome/Edge 76+, Firefox 103+, Safari 18+ (com -webkit- para versões anteriores); IntersectionObserver: todos os navegadores atuais.',
    responsividade: 'O menu quebra os links em telas pequenas; o vidro funciona igual no celular.',
    acessibilidade: 'O cabeçalho é um <header> com <nav> rotulado. Com vidro, o fundo nunca fica totalmente transparente sob o texto (mínimo de 0,6 de opacidade no modo fosco). Com prefers-reduced-motion as transições são desligadas.',
    performance: 'Um observer em vez de scroll; o backdrop-filter numa barra fina é barato.',
    limitacoes: ['sticky não funciona se um ancestral tiver overflow diferente de visible.'],
    referencias: [
      { titulo: 'MDN — backdrop-filter', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter' },
      { titulo: 'MDN — Intersection Observer API', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API' },
      { titulo: 'MDN — position: sticky', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/position' },
    ],
    validadoEm: VALIDADO_EM,
    status: 'validado',
  },
  params: [
    { id: 'desfoque', rotulo: 'desfoque do vidro', tipo: 'range', min: 4, max: 32, passo: 2, unidade: 'px', padrao: 14 },
    { id: 'opacidade', rotulo: 'opacidade do vidro', tipo: 'range', min: 0.6, max: 0.95, passo: 0.05, unidade: '', padrao: 0.7 },
    {
      id: 'tema',
      rotulo: 'tom do vidro',
      tipo: 'select',
      opcoes: [
        { valor: 'escuro', rotulo: 'escuro' },
        { valor: 'claro', rotulo: 'claro' },
      ],
      padrao: 'escuro',
    },
  ],
  gerar: (v) => {
    const claro = v['tema'] === 'claro';
    const fundo = claro ? '251 247 255' : '12 10 24';
    const texto = claro ? '#231640' : '#f4f2ff';
    return {
      html: `<span class="sensor" aria-hidden="true"></span>
<header class="topo">
  <a class="marca" href="#">Kalixto</a>
  <nav aria-label="Principal">
    <a href="#">Projetos</a>
    <a href="#">Sobre</a>
    <a href="#">Contato</a>
  </nav>
</header>

<section class="hero-foto">
  <h1>Role e veja o menu virar vidro</h1>
</section>
<section class="conteudo-longo">
  <p>As faixas coloridas abaixo passam por trás do menu: repare como elas aparecem desfocadas através do vidro.</p>
  <div class="faixas" aria-hidden="true"><span></span><span></span><span></span><span></span></div>
</section>

<section class="fim"><p>Fim da página</p></section>`,
      css: `${cssPagina()}

.sensor { position: absolute; top: 0; height: 1px; width: 1px; }

/* Cabeçalho: transparente no topo, vidro depois de rolar */
.topo {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 22px 28px;
  border-bottom: 1px solid transparent;
  background: rgb(${fundo} / 0);
  transition: padding 300ms ease, background 300ms ease, border-color 300ms ease, backdrop-filter 300ms ease;
}
.topo.is-vidro {
  padding-block: 12px;
  border-color: rgb(255 255 255 / 0.12);
  background: rgb(${fundo} / ${v['opacidade']});
  -webkit-backdrop-filter: blur(${v['desfoque']}px) saturate(1.5);
  backdrop-filter: blur(${v['desfoque']}px) saturate(1.5);
}
/* sobre o hero os links são brancos; no vidro, usam a cor do tema */
.topo a { color: #fff; text-decoration: none; transition: color 300ms ease; }
.topo.is-vidro a { color: ${texto}; }
.marca { font-weight: 800; letter-spacing: 0.06em; }
.topo nav { display: flex; flex-wrap: wrap; gap: 18px; font-size: 15px; }
.topo a:focus-visible { outline: 2px solid #22e3ff; outline-offset: 3px; }

.hero-foto {
  display: grid;
  place-items: center;
  min-height: 80vh;
  margin-top: -70px;
  padding: 24px;
  text-align: center;
  background:
    radial-gradient(circle at 25% 30%, #ff8ad8, transparent 40%),
    radial-gradient(circle at 75% 60%, #60a5fa, transparent 45%),
    linear-gradient(160deg, #7c4ddb, #1d1530);
}
.hero-foto h1 { max-width: 14ch; margin: 0; font-size: clamp(2rem, 7vw, 3.6rem); color: #fff; }
.conteudo-longo { max-width: 680px; margin: 0 auto; padding: 48px 24px; }
.faixas { display: grid; gap: 16px; }
.faixas span { height: 120px; border-radius: 16px; background: linear-gradient(90deg, #ff2bd6, #7c4ddb, #2f7bff); }
.faixas span:nth-child(2n) { background: linear-gradient(90deg, #c6ff3d, #22e3ff); }

@media (prefers-reduced-motion: reduce) {
  .topo { transition: none; }
}`,
      js: `const topo = document.querySelector('.topo');
const sensor = document.querySelector('.sensor');

// quando o sensor do topo sai da tela, a pessoa rolou: liga o vidro
new IntersectionObserver(([entrada]) => {
  topo.classList.toggle('is-vidro', !entrada.isIntersecting);
}).observe(sensor);`,
    };
  },
  angular: (v) => ({
    ts: `import { Component, DestroyRef, ElementRef, afterNextRender, inject, signal, viewChild } from '@angular/core';

@Component({
  selector: 'app-frosted-navbar',
  templateUrl: './frosted-navbar.html',
  styleUrl: './frosted-navbar.css',
})
export class ${nomeClasse('frosted-navbar')} {
  private readonly sensor = viewChild.required<ElementRef<HTMLElement>>('sensor');
  protected readonly vidro = signal(false);

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      // quando o sensor do topo sai da tela, a pessoa rolou: liga o vidro
      const observador = new IntersectionObserver(([entrada]) => this.vidro.set(!entrada.isIntersecting));
      observador.observe(this.sensor().nativeElement);
      destroyRef.onDestroy(() => observador.disconnect());
    });
  }
}
`,
    html: `<span #sensor class="sensor" aria-hidden="true"></span>
<header class="topo" [class.is-vidro]="vidro()">
  <a class="marca" href="#">Kalixto</a>
  <nav aria-label="Principal">
    <a href="#">Projetos</a>
    <a href="#">Sobre</a>
    <a href="#">Contato</a>
  </nav>
</header>
<section class="hero-foto">
  <h1>Role e veja o menu virar vidro</h1>
</section>
<section class="conteudo-longo">
  <p>As faixas coloridas abaixo passam por trás do menu: repare como elas aparecem desfocadas através do vidro.</p>
  <div class="faixas" aria-hidden="true"><span></span><span></span><span></span><span></span></div>
</section>
`,
    css: cssAngularPagina(FROSTED_NAVBAR.gerar(v).css),
  }),
  previewAngular: false,
  niveis: {
    iniciante: [
      'No topo da página, o menu é invisível: só os links aparecem sobre a imagem.',
      'Quando você rola, o menu vira uma barra de vidro fosco, um pouco mais fina.',
      'O que passa por baixo dele aparece borrado, como atrás de um vidro jateado.',
    ],
    avancado: [
      'Sensor + IntersectionObserver é o padrão moderno para "mudou de estado ao rolar": o callback roda só quando o sensor entra ou sai da tela.',
      'Transição de backdrop-filter funciona nos navegadores atuais, mas o desfoque pode "pular" em alguns; animar só a opacidade do fundo é a versão mais segura.',
      'margin-top negativo no hero faz a imagem começar atrás do cabeçalho, para o vidro ter o que desfocar desde o início.',
      'No Angular, o estado do vidro é um signal e o observer é desconectado no DestroyRef.',
    ],
  },
  glossario: [
    { termo: 'IntersectionObserver', explicacao: 'Avisa quando o sensor do topo sai da tela.' },
    { termo: 'backdrop-filter', explicacao: 'Desfoca o conteúdo que passa por baixo do menu.' },
    { termo: 'position: sticky', explicacao: 'O menu fica preso no topo enquanto a página rola.' },
    { termo: 'is-vidro', explicacao: 'Classe que liga o modo vidro do cabeçalho.' },
  ],
};
