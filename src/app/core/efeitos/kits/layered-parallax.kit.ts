import { EffectKit } from '../../models/effect-sheet.model';
import { MDN, VALIDADO_EM, cssAngularPagina, cssPagina, nomeClasse } from './_base';

/** Camadas da cena, do fundo para a frente, com a velocidade relativa de cada uma. */
const CAMADAS = [
  { classe: 'sol', vel: 0.6 },
  { classe: 'montanha montanha--fundo', vel: 0.35 },
  { classe: 'montanha montanha--meio', vel: 0.2 },
  { classe: 'titulo', vel: 0.5 },
  { classe: 'montanha montanha--frente', vel: 0 },
];

export const LAYERED_PARALLAX: EffectKit = {
  ficha: {
    id: 'layered-parallax',
    nomeTecnico: 'Layered Parallax',
    nomeAmigavel: 'Parallax em camadas',
    categoria: 'scroll',
    subcategoria: 'Parallax',
    descricao:
      'As camadas de uma cena se movem em velocidades diferentes durante a rolagem, criando profundidade.',
    objetivoVisual: 'Dar sensação de espaço e profundidade a um hero ilustrado.',
    aplicacoes: ['Heros ilustrados', 'Abertura de campanhas', 'Storytelling visual'],
    nivel: 'intermediario',
    tecnologias: ['HTML', 'CSS', 'JavaScript'],
    dependencias: [],
    interacoes: ['scroll'],
    tags: ['parallax', 'camadas', 'profundidade', 'scroll', 'hero', 'rolagem'],
    explicacao: [
      'Cada camada tem um data-velocidade: quanto maior, mais devagar ela "sobe" em relação à página — como objetos distantes.',
      'No scroll, o script calcula scrollY × velocidade × intensidade e aplica translateY em cada camada.',
      'requestAnimationFrame junta várias rolagens num só cálculo por quadro.',
      'As montanhas são polígonos feitos com clip-path, e o sol é um radial-gradient — a cena não usa imagens.',
    ],
    alternativa:
      'Com GSAP ScrollTrigger: gsap.to(camada, { yPercent: 40, scrollTrigger: { scrub: true } }) — veja a demo "Camadas em velocidades diferentes" no Scroll Lab.',
    compatibilidade: 'Todos os navegadores atuais.',
    responsividade:
      'As camadas usam porcentagens e vw, então a cena se adapta à largura. Em telas pequenas, intensidades menores ficam melhores.',
    acessibilidade:
      'Parallax pode causar desconforto em pessoas com distúrbios vestibulares: com prefers-reduced-motion o script não move nada e a cena fica estática. O título é texto real.',
    performance:
      'Uma escrita de transform por camada por quadro, só enquanto a página rola, com listener passivo. Nenhuma leitura de layout dentro do quadro.',
    limitacoes: [
      'Só funciona bem perto do topo da página: a cena calcula a partir de scrollY total.',
      'Intensidade alta pode deixar vãos aparecendo na base da cena.',
    ],
    referencias: [MDN.transform, MDN.raf, MDN.reduzir, MDN.wcagMovimento],
    validadoEm: VALIDADO_EM,
    status: 'validado',
  },
  params: [
    {
      id: 'intens',
      rotulo: 'intensidade',
      tipo: 'range',
      min: 0.1,
      max: 1.5,
      passo: 0.1,
      unidade: '×',
      padrao: 1,
    },
    {
      id: 'sentido',
      rotulo: 'sentido',
      tipo: 'select',
      opcoes: [
        { valor: '1', rotulo: 'camadas ficam para trás' },
        { valor: '-1', rotulo: 'camadas se adiantam' },
      ],
      padrao: '1',
    },
    {
      id: 'altura',
      rotulo: 'altura da cena',
      tipo: 'range',
      min: 60,
      max: 100,
      passo: 5,
      unidade: 'vh',
      padrao: 90,
    },
  ],
  gerar: (v) => ({
    html: `<section class="cena">
${CAMADAS.map((c) =>
  c.classe === 'titulo'
    ? `  <h1 class="camada titulo" data-velocidade="${c.vel}">Profundidade</h1>`
    : `  <div class="camada ${c.classe}" data-velocidade="${c.vel}" aria-hidden="true"></div>`,
).join('\n')}
</section>

<section class="fim"><p>Role para cima e para baixo para ver as camadas.</p></section>`,
    css: `${cssPagina()}

.cena {
  position: relative;
  height: ${v['altura']}vh;
  overflow: hidden;
  background: linear-gradient(#1a1040, #6d2bd9 70%, #ff2bd6);
}
.camada {
  position: absolute;
  inset: 0;
  will-change: transform;
}
.sol {
  background: radial-gradient(circle at 50% 55%, #ffd27a 0 9vmin, transparent 9.3vmin);
}
.montanha--fundo { background: #4b2a99; clip-path: polygon(0 70%, 18% 48%, 36% 66%, 55% 40%, 78% 62%, 100% 46%, 100% 100%, 0 100%); }
.montanha--meio  { background: #2d1a66; clip-path: polygon(0 80%, 22% 60%, 44% 78%, 66% 56%, 86% 74%, 100% 64%, 100% 100%, 0 100%); }
.montanha--frente { background: #0b0a14; clip-path: polygon(0 90%, 25% 78%, 50% 92%, 75% 80%, 100% 90%, 100% 100%, 0 100%); }
.titulo {
  display: grid;
  place-items: center;
  margin: 0;
  font-size: clamp(2rem, 9vw, 5rem);
  letter-spacing: 0.04em;
  text-shadow: 0 4px 24px rgb(0 0 0 / 0.4);
}`,
    js: `const camadas = document.querySelectorAll('.camada');
const INTENSIDADE = ${v['intens']};
const SENTIDO = ${v['sentido']}; // 1 = camadas ficam para trás · -1 = se adiantam
const reduzir = window.matchMedia('(prefers-reduced-motion: reduce)');
let quadro = 0;

function mover() {
  const y = window.scrollY;
  camadas.forEach((camada) => {
    const velocidade = Number(camada.dataset.velocidade);
    camada.style.transform = \`translateY(\${y * velocidade * INTENSIDADE * SENTIDO}px)\`;
  });
}

window.addEventListener('scroll', () => {
  if (reduzir.matches) return; // cena estática para quem prefere menos movimento
  cancelAnimationFrame(quadro);
  quadro = requestAnimationFrame(mover);
}, { passive: true });`,
  }),
  angular: (v) => ({
    ts: `import { Component, signal } from '@angular/core';

interface Camada {
  classe: string;
  velocidade: number;
}

@Component({
  selector: 'app-layered-parallax',
  templateUrl: './layered-parallax.html',
  styleUrl: './layered-parallax.css',
  host: { '(window:scroll)': 'rolou()' },
})
export class ${nomeClasse('layered-parallax')} {
  protected readonly camadas: Camada[] = [
${CAMADAS.map((c) => `    { classe: '${c.classe}', velocidade: ${c.vel} },`).join('\n')}
  ];
  private readonly intensidade = ${v['intens']};
  private readonly sentido = ${v['sentido']};
  private readonly reduzir = window.matchMedia('(prefers-reduced-motion: reduce)');
  private quadro = 0;

  /** Rolagem atual da janela, em px. */
  protected readonly y = signal(0);

  protected rolou(): void {
    if (this.reduzir.matches) return;
    cancelAnimationFrame(this.quadro);
    this.quadro = requestAnimationFrame(() => this.y.set(window.scrollY));
  }

  protected deslocamento(c: Camada): string {
    return \`translateY(\${this.y() * c.velocidade * this.intensidade * this.sentido}px)\`;
  }
}
`,
    html: `<section class="cena">
  @for (c of camadas; track c.classe) {
    @if (c.classe === 'titulo') {
      <h1 class="camada titulo" [style.transform]="deslocamento(c)">Profundidade</h1>
    } @else {
      <div class="camada" [class]="'camada ' + c.classe" aria-hidden="true" [style.transform]="deslocamento(c)"></div>
    }
  }
</section>
`,
    css: cssAngularPagina(LAYERED_PARALLAX.gerar(v).css),
  }),
  previewAngular: false,
  niveis: {
    iniciante: [
      'A cena é feita de camadas empilhadas: céu, sol, três montanhas e o título.',
      'Ao rolar, cada camada anda numa velocidade diferente — as do fundo mais devagar, como na vida real quando você olha pela janela do ônibus.',
      'Essa diferença de velocidade dá a sensação de profundidade.',
    ],
    avancado: [
      'Velocidade 0 acompanha a página; velocidades maiores "atrasam" a camada, como se estivesse mais longe.',
      'will-change: transform promove cada camada para a GPU; use com moderação, porque cada camada ocupa memória de vídeo.',
      'O listener passivo e o requestAnimationFrame mantêm a rolagem fluida mesmo com várias camadas.',
      'Para cenas no meio da página, calcule o progresso a partir de getBoundingClientRect da seção (ou use ScrollTrigger), em vez de scrollY total.',
      'No Angular, um único signal y alimenta o [style.transform] de todas as camadas.',
    ],
  },
  glossario: [
    {
      termo: 'data-velocidade',
      explicacao: 'Quanto cada camada fica para trás em relação à rolagem.',
    },
    { termo: 'scrollY', explicacao: 'Quantos pixels a página já rolou.' },
    { termo: 'translateY', explicacao: 'Move a camada na vertical sem mexer no layout.' },
    { termo: 'clip-path: polygon', explicacao: 'Recorta a camada no formato de montanha.' },
    {
      termo: 'will-change',
      explicacao: 'Avisa o navegador que a camada vai se mover, para prepará-la na GPU.',
    },
    { termo: 'prefers-reduced-motion', explicacao: 'Com essa preferência, a cena fica parada.' },
  ],
};
