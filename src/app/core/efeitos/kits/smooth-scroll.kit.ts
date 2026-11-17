import { EffectKit } from '../../models/effect-sheet.model';
import { MDN, VALIDADO_EM, cssAngularPagina, cssPagina, nomeClasse } from './_base';

const SECOES = ['Experimente', 'Entenda', 'Codifique', 'Crie'];

export const SMOOTH_SCROLL: EffectKit = {
  ficha: {
    id: 'smooth-scroll',
    nomeTecnico: 'Smooth Scroll (Lenis × nativo)',
    nomeAmigavel: 'Rolagem suave',
    categoria: 'navegacao',
    subcategoria: 'Rolagem',
    descricao: 'Compara a rolagem suavizada pela biblioteca Lenis com a rolagem suave nativa do CSS, incluindo os links de âncora.',
    objetivoVisual: 'Deixar a rolagem com sensação de inércia, comum em sites de portfólio e campanhas.',
    aplicacoes: ['Sites editoriais e de campanha', 'Páginas com muitas animações de rolagem', 'Menus de âncora'],
    nivel: 'intermediario',
    tecnologias: ['HTML', 'CSS', 'JavaScript'],
    dependencias: ['lenis'],
    interacoes: ['scroll', 'click'],
    tags: ['lenis', 'smooth scroll', 'rolagem suave', 'scroll-behavior', 'âncora', 'inércia'],
    explicacao: [
      'No modo Lenis, a biblioteca intercepta a roda do mouse e o trackpad e move a página aos poucos, com inércia (autoRaf cuida do laço de animação).',
      'duration controla quanto tempo a página leva para "alcançar" o destino; wheelMultiplier controla quanto cada giro da roda anda.',
      'Os links de âncora chamam lenis.scrollTo, para que a navegação pelo menu também fique suave.',
      'No modo nativo, só o CSS scroll-behavior: smooth atua: a roda funciona normal e só os saltos de âncora ficam suaves.',
    ],
    alternativa: 'Só CSS: html { scroll-behavior: smooth; } — sem biblioteca e sem inércia na roda, mas com âncoras suaves e respeitando o sistema.',
    compatibilidade: 'Lenis 1.3 funciona nos navegadores atuais. scroll-behavior também. Em telas de toque, o Lenis mantém a rolagem nativa por padrão.',
    responsividade: 'Não depende da largura. Em celulares a rolagem por toque continua nativa.',
    acessibilidade: 'Com prefers-reduced-motion o Lenis não é iniciado e scroll-behavior volta a auto (saltos instantâneos). Teclado (setas, espaço, Page Down) continua com a rolagem nativa. Rolagem suavizada pode atrapalhar algumas pessoas; use com moderação.',
    performance: 'Lenis roda um laço de requestAnimationFrame enquanto há rolagem pendente. Custo: lenis.min.js tem 18,8 kB minificado (sem gzip).',
    limitacoes: ['Elementos com rolagem própria dentro da página precisam do atributo data-lenis-prevent.', 'position: sticky e fixed continuam funcionando, mas efeitos ligados à rolagem precisam ouvir os eventos do Lenis para ficarem sincronizados.'],
    referencias: [MDN.lenis, MDN.scrollBehavior, MDN.reduzir],
    validadoEm: VALIDADO_EM,
    status: 'validado',
  },
  params: [
    {
      id: 'modo',
      rotulo: 'rolagem',
      tipo: 'select',
      opcoes: [
        { valor: 'lenis', rotulo: 'Lenis (com inércia)' },
        { valor: 'nativo', rotulo: 'nativa (só CSS)' },
      ],
      padrao: 'lenis',
    },
    { id: 'dur', rotulo: 'duração da suavização', tipo: 'range', min: 0.4, max: 2.4, passo: 0.1, unidade: 's', padrao: 1.2 },
    { id: 'roda', rotulo: 'força da roda do mouse', tipo: 'range', min: 0.5, max: 2, passo: 0.1, unidade: '×', padrao: 1 },
  ],
  bibliotecas: ['lenis'],
  gerar: (v) => {
    const lenis = v['modo'] === 'lenis';
    return {
      html: `<nav class="menu">
${SECOES.map((s, i) => `  <a href="#s${i + 1}">${s}</a>`).join('\n')}
</nav>

${SECOES.map((s, i) => `<section class="secao" id="s${i + 1}"><h2>${i + 1}. ${s}</h2></section>`).join('\n')}`,
      css: `${cssPagina()}

html { scroll-behavior: smooth; }

.menu {
  position: sticky;
  top: 0;
  z-index: 5;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: rgb(11 10 20 / 0.85);
  backdrop-filter: blur(8px);
}
.menu a {
  padding: 6px 14px;
  border: 1px solid #3a3456;
  border-radius: 999px;
  color: #f4f2ff;
  text-decoration: none;
}
.menu a:focus-visible { outline: 2px solid #22e3ff; outline-offset: 2px; }

.secao {
  display: grid;
  place-items: center;
  min-height: 90vh;
  border-bottom: 1px solid #221d3b;
}
.secao:nth-child(odd) { background: #120f22; }
.secao h2 { font-size: clamp(1.6rem, 6vw, 3rem); }
${
  lenis
    ? `
/* Estilos recomendados pelo Lenis */
html.lenis, html.lenis body { height: auto; }
.lenis.lenis-smooth { scroll-behavior: auto !important; }
`
    : ''
}
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
}`,
      js: lenis
        ? `// Lenis é carregado antes deste script
const reduzir = window.matchMedia('(prefers-reduced-motion: reduce)');

if (!reduzir.matches) {
  const lenis = new Lenis({
    duration: ${v['dur']},       // segundos para alcançar o destino
    wheelMultiplier: ${v['roda']}, // quanto cada giro da roda anda
    autoRaf: true,         // o próprio Lenis roda o requestAnimationFrame
  });

  // Âncoras do menu também com rolagem suave
  document.querySelectorAll('.menu a').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      lenis.scrollTo(link.getAttribute('href'), { offset: -60 });
    });
  });
}`
        : `// Modo nativo: só o CSS (scroll-behavior: smooth) suaviza as âncoras.
// A roda do mouse continua com a rolagem normal do navegador.
// duração ${v['dur']}s e força ${v['roda']}× só valem no modo Lenis.`,
    };
  },
  angular: (v) => ({
    ts: `import { Component, DestroyRef, afterNextRender, inject } from '@angular/core';
import Lenis from 'lenis';

@Component({
  selector: 'app-smooth-scroll',
  templateUrl: './smooth-scroll.html',
  styleUrl: './smooth-scroll.css',
})
export class ${nomeClasse('smooth-scroll')} {
  protected readonly secoes = ${JSON.stringify(SECOES).replace(/,/g, ', ')};
  private lenis?: Lenis;

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      ${v['modo'] === 'lenis' ? '' : '// modo nativo escolhido: nada a iniciar (o CSS cuida das âncoras)\n      return;\n      '}if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      this.lenis = new Lenis({ duration: ${v['dur']}, wheelMultiplier: ${v['roda']}, autoRaf: true });
      destroyRef.onDestroy(() => this.lenis?.destroy());
    });
  }

  protected irPara(e: Event, alvo: string): void {
    if (!this.lenis) return; // sem Lenis, o link segue o comportamento nativo
    e.preventDefault();
    this.lenis.scrollTo(alvo, { offset: -60 });
  }
}
`,
    html: `<nav class="menu">
  @for (s of secoes; track s; let i = $index) {
    <a [href]="'#s' + (i + 1)" (click)="irPara($event, '#s' + (i + 1))">{{ s }}</a>
  }
</nav>

@for (s of secoes; track s; let i = $index) {
  <section class="secao" [id]="'s' + (i + 1)"><h2>{{ i + 1 }}. {{ s }}</h2></section>
}
`,
    css: cssAngularPagina(SMOOTH_SCROLL.gerar(v).css)
      .replace('html { scroll-behavior: smooth; }', ':host { display: block; }\n/* no projeto real, coloque no styles.css global: */\n/* html { scroll-behavior: smooth; } */')
      .replace(/^:host \{ display: block; \}\n\n/, ''),
  }),
  previewAngular: false,
  niveis: {
    iniciante: [
      'Rolagem suave faz a página deslizar até o destino em vez de pular de uma vez.',
      'O Lenis deixa até a roda do mouse com sensação de "peso": a página continua andando um pouquinho depois que você para.',
      'No modo nativo, só os links do menu deslizam; a roda do mouse continua normal.',
    ],
    avancado: [
      'O Lenis lê o delta do evento wheel, acumula um alvo e interpola a posição a cada quadro; a rolagem continua sendo a do documento, então position: sticky e âncoras funcionam.',
      'Animações de rolagem (ScrollTrigger) precisam ouvir lenis.on("scroll", ScrollTrigger.update) para não ficarem um quadro atrasadas.',
      'Elementos com rolagem própria (modais, listas) precisam de data-lenis-prevent, senão o Lenis "rouba" a roda.',
      'A classe lenis-smooth desliga scroll-behavior: smooth enquanto o Lenis atua, evitando duas suavizações somadas.',
      'Por acessibilidade, deixe a rolagem suave opcional e sempre desligada com prefers-reduced-motion.',
    ],
  },
  glossario: [
    { termo: 'new Lenis', explicacao: 'Cria a rolagem suave com as opções escolhidas.' },
    { termo: 'autoRaf', explicacao: 'O Lenis cuida sozinho do laço de animação (requestAnimationFrame).' },
    { termo: 'wheelMultiplier', explicacao: 'Quanto cada giro da roda do mouse faz a página andar.' },
    { termo: 'lenis.scrollTo', explicacao: 'Rola suavemente até uma âncora ou posição.' },
    { termo: 'scroll-behavior: smooth', explicacao: 'Rolagem suave nativa do CSS para saltos de âncora.' },
    { termo: 'position: sticky', explicacao: 'Mantém o menu grudado no topo enquanto a página rola.' },
  ],
};
