import { EffectKit } from '../../models/effect-sheet.model';
import { CORES, MDN, VALIDADO_EM, cssAngular, cssPalco, nomeClasse } from './_base';

export const CUSTOM_CURSOR: EffectKit = {
  ficha: {
    id: 'custom-cursor',
    nomeTecnico: 'Custom Cursor (dot + follower)',
    nomeAmigavel: 'Cursor personalizado',
    categoria: 'cursor',
    subcategoria: 'Cursores',
    descricao:
      'Um ponto acompanha o mouse na hora e um anel vem atrás com atraso; o anel cresce sobre links e botões.',
    objetivoVisual: 'Dar identidade à navegação e destacar o que é clicável.',
    aplicacoes: ['Portfólios e sites autorais', 'Galerias e vitrines', 'Experiências interativas'],
    nivel: 'intermediario',
    tecnologias: ['HTML', 'CSS', 'JavaScript'],
    dependencias: [],
    interacoes: ['mouse', 'hover'],
    tags: ['cursor', 'mouse', 'follower', 'lerp', 'ponteiro', 'mix-blend-mode'],
    explicacao: [
      'O ponto vai direto para a posição do mouse; o anel anda só uma fração (a suavidade) da distância a cada quadro — isso é interpolação linear (lerp).',
      'Um laço com requestAnimationFrame atualiza o anel até ele alcançar o ponteiro.',
      'Quando o ponteiro entra num link ou botão (pointerover com closest), o anel ganha a classe is-sobre e cresce.',
      '@media (pointer: fine) só ativa o cursor personalizado em mouse e trackpad; em telas de toque nada muda.',
    ],
    alternativa:
      'cursor: url(icone.svg) 8 8, auto troca o cursor nativo por uma imagem, sem JavaScript — mas sem atraso nem animação.',
    compatibilidade:
      'Pointer Events, requestAnimationFrame e @media (pointer) funcionam em todos os navegadores atuais.',
    responsividade:
      'Só existe em dispositivos com ponteiro fino. Em celulares e tablets o elemento fica escondido.',
    acessibilidade:
      'O cursor é decorativo (aria-hidden). Por padrão o cursor nativo continua visível; escondê-lo é opcional. Com prefers-reduced-motion o anel acompanha sem atraso. O foco do teclado tem contorno próprio e não depende do cursor.',
    performance:
      'Um laço de requestAnimationFrame que para quando o anel alcança o ponteiro. Só transform é alterada.',
    limitacoes: [
      'Esconder o cursor nativo pode confundir quem tem baixa visão; prefira manter.',
      'mix-blend-mode: difference muda a cor do cursor conforme o fundo, o que pode reduzir o contraste em fundos médios.',
    ],
    referencias: [MDN.pointer, MDN.raf, MDN.pointerMedia, MDN.cursor],
    validadoEm: VALIDADO_EM,
    status: 'validado',
  },
  params: [
    {
      id: 'suave',
      rotulo: 'suavidade do anel',
      tipo: 'range',
      min: 0.05,
      max: 0.5,
      passo: 0.01,
      unidade: '',
      padrao: 0.15,
    },
    {
      id: 'anel',
      rotulo: 'tamanho do anel',
      tipo: 'range',
      min: 20,
      max: 80,
      passo: 2,
      unidade: 'px',
      padrao: 36,
    },
    { id: 'cor', rotulo: 'cor', tipo: 'select', opcoes: CORES, padrao: '#22e3ff' },
    {
      id: 'mistura',
      rotulo: 'mistura com o fundo',
      tipo: 'select',
      opcoes: [
        { valor: 'normal', rotulo: 'normal' },
        { valor: 'difference', rotulo: 'difference (inverte)' },
      ],
      padrao: 'normal',
    },
    {
      id: 'nativo',
      rotulo: 'cursor do sistema',
      tipo: 'select',
      opcoes: [
        { valor: 'mostrar', rotulo: 'mostrar' },
        { valor: 'esconder', rotulo: 'esconder' },
      ],
      padrao: 'mostrar',
    },
  ],
  gerar: (v) => ({
    html: `<div class="cursor" aria-hidden="true">
  <span class="cursor__anel"></span>
  <span class="cursor__ponto"></span>
</div>

<main class="vitrine">
  <h1>Passe o mouse aqui</h1>
  <p>O anel cresce sobre <a href="#">links</a> e botões.</p>
  <button type="button">Um botão</button>
</main>`,
    css: `${cssPalco()}

.vitrine { text-align: center; }
.vitrine a { color: #22e3ff; }
.vitrine button {
  margin-top: 12px;
  padding: 12px 24px;
  border: 1px solid #3a3456;
  border-radius: 12px;
  background: #1a1530;
  color: #fff;
  font: inherit;
}
.vitrine a:focus-visible,
.vitrine button:focus-visible { outline: 2px solid #22e3ff; outline-offset: 3px; }

/* O efeito: só para mouse e trackpad */
.cursor { display: none; }

@media (pointer: fine) {
  .cursor {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 100;
    pointer-events: none; /* nunca bloqueia cliques */
    mix-blend-mode: ${v['mistura']};
  }
  .cursor__ponto,
  .cursor__anel {
    position: absolute;
    top: 0;
    left: 0;
    border-radius: 50%;
    opacity: 0;
  }
  .cursor__ponto {
    width: 8px;
    height: 8px;
    margin: -4px 0 0 -4px;
    background: ${v['cor']};
  }
  .cursor__anel {
    width: ${v['anel']}px;
    height: ${v['anel']}px;
    margin: -${Number(v['anel']) / 2}px 0 0 -${Number(v['anel']) / 2}px;
    border: 2px solid ${v['cor']};
  }
  .cursor.is-ativo .cursor__ponto,
  .cursor.is-ativo .cursor__anel { opacity: 1; }
  .cursor.is-sobre .cursor__anel { scale: 1.8; background: ${v['cor']}22; }
  .cursor__ponto { transition: opacity 200ms ease; }
  .cursor__anel { transition: opacity 200ms ease, scale 250ms ease, background 250ms ease; }
${v['nativo'] === 'esconder' ? '\n  body, a, button { cursor: none; }\n' : ''}}`,
    js: `const cursor = document.querySelector('.cursor');
const ponto = cursor.querySelector('.cursor__ponto');
const anel = cursor.querySelector('.cursor__anel');
const SUAVIDADE = ${v['suave']}; // fração da distância que o anel anda por quadro
const reduzir = window.matchMedia('(prefers-reduced-motion: reduce)');

let mx = 0, my = 0; // posição do mouse
let ax = 0, ay = 0; // posição do anel
let quadro = 0;

function seguir() {
  const s = reduzir.matches ? 1 : SUAVIDADE; // sem atraso para quem prefere menos movimento
  ax += (mx - ax) * s; // lerp: anda uma fração do que falta
  ay += (my - ay) * s;
  anel.style.transform = \`translate(\${ax}px, \${ay}px)\`;
  quadro = Math.hypot(mx - ax, my - ay) > 0.1 ? requestAnimationFrame(seguir) : 0;
}

window.addEventListener('pointermove', (e) => {
  if (e.pointerType !== 'mouse') return;
  mx = e.clientX;
  my = e.clientY;
  ponto.style.transform = \`translate(\${mx}px, \${my}px)\`;
  cursor.classList.add('is-ativo');
  if (!quadro) quadro = requestAnimationFrame(seguir);
});

// cresce sobre elementos clicáveis
document.addEventListener('pointerover', (e) => {
  cursor.classList.toggle('is-sobre', !!e.target.closest('a, button'));
});

document.documentElement.addEventListener('pointerleave', () => cursor.classList.remove('is-ativo'));`,
  }),
  angular: (v) => ({
    ts: `import { Component, ElementRef, signal, viewChild } from '@angular/core';

@Component({
  selector: 'app-custom-cursor',
  templateUrl: './custom-cursor.html',
  styleUrl: './custom-cursor.css',
  host: {
    '(window:pointermove)': 'mover($event)',
    '(document:pointerover)': 'sobre($event)',
    '(document:pointerout)': 'sair($event)',
  },
})
export class ${nomeClasse('custom-cursor')} {
  private readonly suavidade = ${v['suave']};
  private readonly reduzir = window.matchMedia('(prefers-reduced-motion: reduce)');
  private readonly ponto = viewChild.required<ElementRef<HTMLElement>>('ponto');
  private readonly anel = viewChild.required<ElementRef<HTMLElement>>('anel');
  private mx = 0;
  private my = 0;
  private ax = 0;
  private ay = 0;
  private quadro = 0;

  protected readonly ativo = signal(false);
  protected readonly sobreClicavel = signal(false);

  protected mover(e: PointerEvent): void {
    if (e.pointerType !== 'mouse') return;
    this.mx = e.clientX;
    this.my = e.clientY;
    // escrita direta no estilo: muda a cada evento, sem passar pela detecção de mudanças
    this.ponto().nativeElement.style.transform = \`translate(\${this.mx}px, \${this.my}px)\`;
    this.ativo.set(true);
    if (!this.quadro) this.quadro = requestAnimationFrame(() => this.seguir());
  }

  protected sobre(e: PointerEvent): void {
    this.sobreClicavel.set(!!(e.target as Element).closest?.('a, button'));
  }

  /** relatedTarget nulo = o ponteiro saiu da janela. */
  protected sair(e: PointerEvent): void {
    if (!e.relatedTarget) this.ativo.set(false);
  }

  private seguir(): void {
    const s = this.reduzir.matches ? 1 : this.suavidade;
    this.ax += (this.mx - this.ax) * s;
    this.ay += (this.my - this.ay) * s;
    this.anel().nativeElement.style.transform = \`translate(\${this.ax}px, \${this.ay}px)\`;
    this.quadro = Math.hypot(this.mx - this.ax, this.my - this.ay) > 0.1 ? requestAnimationFrame(() => this.seguir()) : 0;
  }
}
`,
    html: `<div class="cursor" aria-hidden="true" [class.is-ativo]="ativo()" [class.is-sobre]="sobreClicavel()">
  <span #anel class="cursor__anel"></span>
  <span #ponto class="cursor__ponto"></span>
</div>

<main class="vitrine">
  <h1>Passe o mouse aqui</h1>
  <p>O anel cresce sobre <a href="#">links</a> e botões.</p>
  <button type="button">Um botão</button>
</main>
`,
    css: cssAngular(CUSTOM_CURSOR.gerar(v).css),
  }),
  niveis: {
    iniciante: [
      'São dois elementos que seguem o mouse: um ponto pequeno, que vai junto, e um anel, que vem atrás.',
      'O anel percorre só um pedaço do caminho a cada quadro, por isso parece ter "peso".',
      'Em cima de um link ou botão, o anel cresce para mostrar que dá para clicar.',
    ],
    avancado: [
      'lerp (a + (b − a) × t) com t fixo por quadro gera uma aproximação exponencial: rápida no começo e cada vez mais lenta.',
      'O laço para quando a distância cai abaixo de 0,1 px: sem rAF infinito gastando bateria parado.',
      'pointer-events: none no cursor garante que ele nunca intercepte cliques; position: fixed + translate evita reflow.',
      'pointerover com delegação (closest) cobre elementos adicionados depois, sem um listener por link.',
      'No Angular, as posições são escritas direto no estilo (sem signals) porque mudam a cada evento; só os estados (ativo, sobre) passam por signals.',
    ],
  },
  glossario: [
    {
      termo: 'pointer: fine',
      explicacao: 'Media query que identifica mouse e trackpad (ponteiro preciso).',
    },
    { termo: 'pointer-events: none', explicacao: 'O cursor desenhado nunca bloqueia cliques.' },
    { termo: 'SUAVIDADE', explicacao: 'Fração da distância que o anel anda por quadro (lerp).' },
    {
      termo: 'closest',
      explicacao: 'Procura o link ou botão mais próximo do elemento sob o mouse.',
    },
    { termo: 'mix-blend-mode', explicacao: 'Como o cursor se mistura com as cores de trás.' },
    {
      termo: 'requestAnimationFrame',
      explicacao: 'Atualiza o anel a cada quadro até alcançar o mouse.',
    },
  ],
};
