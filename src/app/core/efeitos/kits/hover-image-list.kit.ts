import { EffectKit } from '../../models/effect-sheet.model';
import { MDN, VALIDADO_EM, cssAngular, cssPalco, nomeClasse } from './_base';

const PROJETOS = [
  { nome: 'Maré', ano: '2026', fundo: 'linear-gradient(135deg, #2f7bff, #22e3ff)' },
  { nome: 'Erva Brava', ano: '2025', fundo: 'linear-gradient(135deg, #1f6b4a, #c6ff3d)' },
  { nome: 'Pedal', ano: '2025', fundo: 'linear-gradient(135deg, #ff2e3e, #ff8a5c)' },
  { nome: 'Sopro', ano: '2024', fundo: 'linear-gradient(135deg, #2a1f6b, #ff2bd6)' },
];

export const HOVER_IMAGE_LIST: EffectKit = {
  ficha: {
    id: 'hover-image-list',
    nomeTecnico: 'Hover Image Reveal (lista de projetos)',
    nomeAmigavel: 'Lista com imagem que segue o cursor',
    categoria: 'cursor',
    subcategoria: 'Prévia flutuante',
    descricao:
      'Uma lista de projetos em texto grande; ao passar o mouse numa linha, a imagem daquele projeto aparece flutuando junto ao cursor, com atraso suave e inclinação pela velocidade.',
    objetivoVisual:
      'Manter a página limpa e tipográfica, mas dar uma prévia visual imediata de cada trabalho — padrão clássico de portfólios premiados.',
    aplicacoes: [
      'Lista de projetos de portfólio',
      'Cardápio com foto do prato',
      'Lista de artistas, eventos ou produtos',
    ],
    nivel: 'intermediario',
    tecnologias: ['HTML', 'CSS', 'JavaScript'],
    dependencias: [],
    interacoes: ['mouse', 'hover', 'keyboard'],
    tags: [
      'hover reveal',
      'imagem flutuante',
      'lista de projetos',
      'portfólio',
      'cursor',
      'lerp',
      'tendência 2026',
    ],
    explicacao: [
      'Existe uma única "prévia" fixa na página. Entrar numa linha troca o fundo dela pelo do projeto e a mostra; sair da lista a esconde.',
      'A posição segue o mouse com interpolação: a cada quadro a prévia anda uma fração (atraso) da distância até o cursor. Fração pequena = movimento preguiçoso e elegante.',
      'A inclinação vem da velocidade horizontal (diferença entre o alvo e a posição atual), limitada ao ângulo máximo — ela "balança" ao mover rápido.',
      'No teclado, o foco num link mostra a prévia ao lado da linha, sem depender do mouse.',
    ],
    alternativa:
      'Com GSAP: gsap.quickTo(previa, "x", { duration: 0.6, ease: "power3" }) faz a interpolação em uma linha. Em WebGL, a imagem pode ainda deformar com a velocidade (efeito "rgb shift").',
    compatibilidade:
      'Pointer events e propriedades individuais (translate, rotate): todos os navegadores atuais.',
    responsividade:
      'Em telas de toque não há hover: a prévia só aparece com ponteiro do tipo mouse (pointerType), e os links continuam funcionando normalmente.',
    acessibilidade:
      'A prévia é decorativa (aria-hidden); o conteúdo está nos links. Foco por teclado mostra a prévia. Com prefers-reduced-motion não há atraso nem inclinação.',
    performance:
      'Um loop de requestAnimationFrame que para sozinho quando a prévia alcança o cursor; só translate e rotate mudam.',
    limitacoes: [
      'Com imagens reais, pré-carregue todas (new Image()) para a troca não piscar no primeiro hover.',
    ],
    referencias: [MDN.pointer, MDN.raf, MDN.pointerMedia],
    validadoEm: VALIDADO_EM,
    status: 'validado',
  },
  params: [
    {
      id: 'atraso',
      rotulo: 'suavidade do movimento',
      tipo: 'range',
      min: 0.05,
      max: 0.5,
      passo: 0.05,
      unidade: '',
      padrao: 0.15,
    },
    {
      id: 'inclinacao',
      rotulo: 'inclinação máxima',
      tipo: 'range',
      min: 0,
      max: 20,
      passo: 2,
      unidade: 'deg',
      padrao: 8,
    },
    {
      id: 'tamanho',
      rotulo: 'tamanho da prévia',
      tipo: 'range',
      min: 140,
      max: 300,
      passo: 20,
      unidade: 'px',
      padrao: 200,
    },
  ],
  gerar: (v) => ({
    html: `<ul class="projetos">
${PROJETOS.map((p) => `  <li><a href="#" data-fundo="${p.fundo}"><span>${p.nome}</span><small>${p.ano}</small></a></li>`).join('\n')}
</ul>
<div class="previa" aria-hidden="true"></div>`,
    css: `${cssPalco()}

.projetos {
  width: min(100%, 640px);
  margin: 0;
  padding: 0;
  list-style: none;
}
.projetos a {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 18px 4px;
  border-bottom: 1px solid #2a2540;
  color: #f4f2ff;
  text-decoration: none;
  font-size: clamp(1.6rem, 6vw, 2.8rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  transition: color 300ms ease, padding 300ms ease;
}
.projetos a small { font-size: 14px; font-weight: 400; color: #8f88b5; }
.projetos:hover a { color: #4a4466; }
.projetos a:hover, .projetos a:focus-visible { color: #f4f2ff; padding-left: 16px; }
.projetos a:focus-visible { outline: 2px solid #22e3ff; outline-offset: 2px; }

/* Uma prévia só, presa à tela, que segue o ponteiro */
.previa {
  position: fixed;
  left: 0;
  top: 0;
  width: ${v['tamanho']}px;
  aspect-ratio: 4 / 3;
  margin: ${-Number(v['tamanho']) * 0.375}px 0 0 ${-Number(v['tamanho']) / 2}px;
  border-radius: 12px;
  background: var(--fundo);
  box-shadow: 0 20px 50px rgb(0 0 0 / 0.45);
  pointer-events: none;
  opacity: 0;
  scale: 0.8;
  transition: opacity 250ms ease, scale 250ms ease;
}
.previa.is-visivel { opacity: 1; scale: 1; }

@media (prefers-reduced-motion: reduce) {
  .previa, .projetos a { transition: none; }
}`,
    js: `const previa = document.querySelector('.previa');
const lista = document.querySelector('.projetos');
const reduzir = matchMedia('(prefers-reduced-motion: reduce)');
const ATRASO = reduzir.matches ? 1 : ${v['atraso']};
const INCLINACAO = reduzir.matches ? 0 : ${v['inclinacao']};
let alvoX = 0, alvoY = 0, x = 0, y = 0, quadro = 0;

function seguir() {
  const dx = alvoX - x;
  x += dx * ATRASO;
  y += (alvoY - y) * ATRASO;
  // inclina pela velocidade horizontal, limitada ao ângulo máximo
  const angulo = Math.max(-INCLINACAO, Math.min(INCLINACAO, dx * 0.1));
  previa.style.translate = x + 'px ' + y + 'px';
  previa.style.rotate = angulo + 'deg';
  quadro = Math.abs(dx) + Math.abs(alvoY - y) > 0.5 ? requestAnimationFrame(seguir) : 0;
}

function mirar(px, py) {
  alvoX = px;
  alvoY = py;
  if (!quadro) quadro = requestAnimationFrame(seguir);
}

function mostrar(link) {
  previa.style.setProperty('--fundo', link.dataset.fundo);
  previa.classList.add('is-visivel');
}

lista.querySelectorAll('a').forEach((link) => {
  link.addEventListener('pointerenter', (e) => {
    if (e.pointerType !== 'mouse') return;
    if (!previa.classList.contains('is-visivel')) { x = e.clientX; y = e.clientY; }
    mostrar(link);
  });
  // teclado: a prévia aparece ao lado da linha focada
  link.addEventListener('focus', () => {
    const r = link.getBoundingClientRect();
    x = alvoX = r.right - ${v['tamanho']} / 2;
    y = alvoY = r.top + r.height / 2;
    mostrar(link);
    mirar(alvoX, alvoY);
  });
  link.addEventListener('blur', () => previa.classList.remove('is-visivel'));
  link.addEventListener('click', (e) => e.preventDefault());
});
lista.addEventListener('pointermove', (e) => mirar(e.clientX, e.clientY));
lista.addEventListener('pointerleave', () => previa.classList.remove('is-visivel'));`,
  }),
  angular: (v) => ({
    ts: `import { Component, ElementRef, signal, viewChild } from '@angular/core';

interface Projeto {
  nome: string;
  ano: string;
  fundo: string;
}

@Component({
  selector: 'app-hover-image-list',
  templateUrl: './hover-image-list.html',
  styleUrl: './hover-image-list.css',
})
export class ${nomeClasse('hover-image-list')} {
  protected readonly projetos: Projeto[] = ${JSON.stringify(PROJETOS, null, 2)
    .replace(/\n/g, '\n  ')
    .replace(/"(\w+)":/g, '$1:')
    .replace(/"/g, "'")};
  private readonly reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  private readonly atraso = this.reduzir ? 1 : ${v['atraso']};
  private readonly inclinacao = this.reduzir ? 0 : ${v['inclinacao']};
  private readonly previa = viewChild.required<ElementRef<HTMLElement>>('previa');
  private alvoX = 0;
  private alvoY = 0;
  private x = 0;
  private y = 0;
  private quadro = 0;

  protected readonly fundo = signal('');
  protected readonly visivel = signal(false);

  protected entrar(e: PointerEvent, p: Projeto): void {
    if (e.pointerType !== 'mouse') return;
    if (!this.visivel()) {
      this.x = e.clientX;
      this.y = e.clientY;
    }
    this.mostrar(p);
  }

  protected focar(link: HTMLElement, p: Projeto): void {
    const r = link.getBoundingClientRect();
    this.x = this.alvoX = r.right - ${v['tamanho']} / 2;
    this.y = this.alvoY = r.top + r.height / 2;
    this.mostrar(p);
    this.mirar(this.alvoX, this.alvoY);
  }

  protected mirar(px: number, py: number): void {
    this.alvoX = px;
    this.alvoY = py;
    if (!this.quadro) this.quadro = requestAnimationFrame(() => this.seguir());
  }

  private mostrar(p: Projeto): void {
    this.fundo.set(p.fundo);
    this.visivel.set(true);
  }

  /** Escrita direta no estilo: muda a cada quadro, fora da detecção de mudanças. */
  private seguir(): void {
    const dx = this.alvoX - this.x;
    this.x += dx * this.atraso;
    this.y += (this.alvoY - this.y) * this.atraso;
    const angulo = Math.max(-this.inclinacao, Math.min(this.inclinacao, dx * 0.1));
    const el = this.previa().nativeElement;
    el.style.translate = this.x + 'px ' + this.y + 'px';
    el.style.rotate = angulo + 'deg';
    this.quadro =
      Math.abs(dx) + Math.abs(this.alvoY - this.y) > 0.5 ? requestAnimationFrame(() => this.seguir()) : 0;
  }
}
`,
    html: `<ul class="projetos" (pointermove)="mirar($event.clientX, $event.clientY)" (pointerleave)="visivel.set(false)">
  @for (p of projetos; track p.nome) {
    <li>
      <a
        #link
        href="#"
        (pointerenter)="entrar($event, p)"
        (focus)="focar(link, p)"
        (blur)="visivel.set(false)"
        (click)="$event.preventDefault()"
        ><span>{{ p.nome }}</span><small>{{ p.ano }}</small></a
      >
    </li>
  }
</ul>
<div #previa class="previa" aria-hidden="true" [class.is-visivel]="visivel()" [style.--fundo]="fundo()"></div>
`,
    css: cssAngular(HOVER_IMAGE_LIST.gerar(v).css),
  }),
  niveis: {
    iniciante: [
      'Os nomes dos projetos ficam numa lista, só com texto grande.',
      'Passando o mouse num nome, aparece a imagem daquele projeto, que vai atrás do mouse com um pouquinho de atraso.',
      'Se você mexer rápido, a imagem inclina, como se tivesse peso.',
    ],
    avancado: [
      'Interpolação linear (lerp): x += (alvo − x) × k. É uma mola sem rebote; k é a "rigidez".',
      'O loop para quando a distância fica abaixo de 0,5px: nenhum trabalho com a página parada.',
      'position: fixed + translate com clientX/clientY: a prévia usa coordenadas da janela, então não depende do scroll.',
      'pointerType === "mouse" evita a prévia "presa" em telas de toque, onde não existe pointerleave confiável.',
    ],
  },
  glossario: [
    { termo: 'pointerType', explicacao: 'Diferencia mouse, caneta e toque.' },
    { termo: 'position: fixed', explicacao: 'A prévia usa as coordenadas da janela.' },
    {
      termo: 'dataset.fundo',
      explicacao: 'Lê a imagem/fundo guardado no atributo data-fundo do link.',
    },
    { termo: 'requestAnimationFrame', explicacao: 'Move a prévia uma vez por quadro de tela.' },
  ],
};
