import { EffectKit } from '../../models/effect-sheet.model';
import { CORES, MDN, VALIDADO_EM, cssAngularPagina, cssPagina, nomeClasse } from './_base';

const PARAGRAFOS = [
  'A barra no topo mostra quanto da página você já leu.',
  'Ela cresce da esquerda para a direita conforme a rolagem avança.',
  'Nos navegadores que suportam animações guiadas por rolagem, o próprio CSS faz o trabalho.',
  'Nos outros, um pequeno script calcula a porcentagem e atualiza uma variável CSS.',
  'Role até o fim para ver a barra completa.',
];

export const SCROLL_PROGRESS: EffectKit = {
  ficha: {
    id: 'scroll-progress',
    nomeTecnico: 'Scroll Progress (scroll-driven animation)',
    nomeAmigavel: 'Barra de progresso de leitura',
    categoria: 'scroll',
    subcategoria: 'Indicadores de rolagem',
    descricao: 'Uma barra fina que cresce conforme a página é rolada, indicando quanto falta para o fim.',
    objetivoVisual: 'Dar noção de tamanho e de avanço em textos longos.',
    aplicacoes: ['Artigos e posts de blog', 'Documentação', 'Páginas de termos e políticas'],
    nivel: 'intermediario',
    tecnologias: ['HTML', 'CSS', 'JavaScript'],
    dependencias: [],
    interacoes: ['scroll'],
    tags: ['scroll', 'progresso', 'progress', 'animation-timeline', 'scroll-driven', 'leitura'],
    explicacao: [
      'A barra é um elemento fixo no topo, com transform: scaleX — 0 é vazia e 1 é cheia.',
      'Com animation-timeline: scroll(root), a animação não depende de tempo: o progresso dela é a própria rolagem da página.',
      '@supports só aplica esse bloco onde o navegador entende scroll-driven animations.',
      'Onde não entende (ou no modo "sempre JavaScript"), o script calcula scrollY dividido pela altura rolável e grava em --progresso.',
    ],
    alternativa: 'GSAP ScrollTrigger com scrub: true anima a barra presa à rolagem e funciona igual em todos os navegadores (veja a demo "Barra de progresso de leitura" no Scroll Lab).',
    compatibilidade: 'animation-timeline: Chrome e Edge 115+ (e versões recentes do Safari). Nos demais navegadores entra o fallback em JavaScript, que funciona em todos os atuais.',
    responsividade: 'A barra ocupa a largura toda em qualquer tela.',
    acessibilidade: 'A barra acompanha a rolagem feita pelo próprio usuário, então não é movimento automático. Ela é decorativa (aria-hidden). Com redução de movimento, a suavização do fallback é removida.',
    performance: 'No modo CSS não há JavaScript por quadro. No fallback, um listener de scroll passivo agenda no máximo uma atualização por quadro com requestAnimationFrame. Só transform é animada.',
    limitacoes: ['Mede a página inteira: para medir só um artigo dentro da página, use view() ou calcule a partir do elemento.'],
    referencias: [MDN.scrollTimeline, MDN.raf, MDN.transform],
    validadoEm: VALIDADO_EM,
    status: 'validado',
  },
  params: [
    { id: 'altura', rotulo: 'espessura', tipo: 'range', min: 2, max: 12, passo: 1, unidade: 'px', padrao: 4 },
    { id: 'c1', rotulo: 'cor inicial', tipo: 'select', opcoes: CORES, padrao: '#ff2bd6' },
    { id: 'c2', rotulo: 'cor final', tipo: 'select', opcoes: CORES, padrao: '#22e3ff' },
    {
      id: 'lugar',
      rotulo: 'posição',
      tipo: 'select',
      opcoes: [
        { valor: 'top', rotulo: 'topo' },
        { valor: 'bottom', rotulo: 'base' },
      ],
      padrao: 'top',
    },
    {
      id: 'modo',
      rotulo: 'tecnologia',
      tipo: 'select',
      opcoes: [
        { valor: 'auto', rotulo: 'CSS (com JavaScript de reserva)' },
        { valor: 'js', rotulo: 'sempre JavaScript' },
      ],
      padrao: 'auto',
    },
  ],
  gerar: (v) => {
    const auto = v['modo'] === 'auto';
    return {
      html: `<div class="progresso" aria-hidden="true"></div>

<article class="texto">
  <h1>Progresso de leitura</h1>
${PARAGRAFOS.map((p) => `  <p>${p}</p>`).join('\n')}
</article>`,
      css: `${cssPagina()}

.texto {
  max-width: 60ch;
  margin: 0 auto;
  padding: 48px 24px 60vh;
}
.texto p { margin: 0 0 40vh; font-size: 1.15rem; }

/* O efeito */
.progresso {
  position: fixed;
  ${v['lugar']}: 0;
  left: 0;
  right: 0;
  z-index: 10;
  height: ${v['altura']}px;
  background: linear-gradient(90deg, ${v['c1']}, ${v['c2']});
  transform-origin: 0 50%;
  transform: scaleX(var(--progresso, 0));
  transition: transform 80ms linear; /* suaviza o fallback em JavaScript */
}
${
  auto
    ? `
/* Navegadores com scroll-driven animations: a rolagem É a linha do tempo */
@supports (animation-timeline: scroll()) {
  .progresso {
    transition: none;
    animation: encher linear both;
    animation-timeline: scroll(root);
  }
  @keyframes encher {
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
  }
}
`
    : ''
}
@media (prefers-reduced-motion: reduce) {
  .progresso { transition: none; }
}`,
      js: `const barra = document.querySelector('.progresso');
${auto ? "const usaCss = CSS.supports('animation-timeline: scroll()');\n" : ''}let quadro = 0;

function atualizar() {
  const rolavel = document.documentElement.scrollHeight - window.innerHeight;
  const progresso = rolavel > 0 ? window.scrollY / rolavel : 0;
  barra.style.setProperty('--progresso', progresso.toFixed(4));
}

${auto ? 'if (!usaCss) {\n  ' : ''}window.addEventListener('scroll', () => {
${auto ? '  ' : ''}  cancelAnimationFrame(quadro);
${auto ? '  ' : ''}  quadro = requestAnimationFrame(atualizar);
${auto ? '  ' : ''}}, { passive: true });
${auto ? '  ' : ''}atualizar();${auto ? '\n}' : ''}`,
    };
  },
  angular: (v) => ({
    ts: `import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-scroll-progress',
  templateUrl: './scroll-progress.html',
  styleUrl: './scroll-progress.css',
  host: { '(window:scroll)': 'rolou()' },
})
export class ${nomeClasse('scroll-progress')} {
  /** De 0 a 1: quanto da página já foi rolado. */
  protected readonly progresso = signal(0);
  ${v['modo'] === 'auto' ? "private readonly usaCss = CSS.supports('animation-timeline: scroll()');" : '// modo "sempre JavaScript"'}
  private quadro = 0;

  protected rolou(): void {
    ${v['modo'] === 'auto' ? 'if (this.usaCss) return; // o CSS já cuida da barra\n    ' : ''}cancelAnimationFrame(this.quadro);
    this.quadro = requestAnimationFrame(() => {
      const rolavel = document.documentElement.scrollHeight - window.innerHeight;
      this.progresso.set(rolavel > 0 ? window.scrollY / rolavel : 0);
    });
  }
}
`,
    html: `<div class="progresso" aria-hidden="true" [style.--progresso]="progresso()"></div>
`,
    css: cssAngularPagina(SCROLL_PROGRESS.gerar(v).css).replace(
      /\n\.texto \{[\s\S]*?\n}\n\.texto p \{[^\n]*\}\n/,
      '\n',
    ),
  }),
  previewAngular: false,
  niveis: {
    iniciante: [
      'A barra começa vazia e vai enchendo enquanto você rola a página para baixo.',
      'Quando você chega ao fim do texto, ela fica cheia.',
      'Ela não anda sozinha: só se mexe quando você rola.',
    ],
    avancado: [
      'scroll(root) cria uma ScrollTimeline da rolagem do documento; animation-duration perde o sentido e o progresso vem da posição de rolagem.',
      'animation-timeline precisa vir depois do atalho animation, porque animation reinicia animation-timeline para auto.',
      'Listener passivo ({ passive: true }) diz ao navegador que o código não cancela a rolagem, liberando a rolagem suave na thread de composição.',
      'Usar scaleX em vez de width evita recalcular layout a cada quadro.',
      'Para medir um único artigo, troque scroll() por view() com animation-range, ou calcule com getBoundingClientRect do artigo.',
    ],
  },
  glossario: [
    { termo: 'animation-timeline', explicacao: 'Liga a animação a uma linha do tempo de rolagem, em vez do relógio.' },
    { termo: '@supports', explicacao: 'Aplica o bloco só se o navegador entender a propriedade.' },
    { termo: 'scaleX', explicacao: 'Estica a barra na horizontal: 0 é vazia, 1 é cheia.' },
    { termo: 'transform-origin: 0 50%', explicacao: 'Faz a barra crescer a partir da esquerda.' },
    { termo: 'scrollHeight', explicacao: 'Altura total do documento, incluindo a parte fora da tela.' },
    { termo: 'passive: true', explicacao: 'Avisa que o listener não bloqueia a rolagem.' },
  ],
};
