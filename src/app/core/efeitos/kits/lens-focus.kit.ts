import { EffectKit } from '../../models/effect-sheet.model';
import { MDN, VALIDADO_EM, cssAngular, cssPalco, nomeClasse } from './_base';

/** Conteúdo da cena (igual nas duas camadas: a desfocada e a nítida). */
const CONTEUDO = `<h1>Tudo em foco</h1>
      <p>Uma distância só, nítido de borda a borda.</p>`;

export const LENS_FOCUS: EffectKit = {
  ficha: {
    id: 'lens-focus',
    nomeTecnico: 'Lens Focus Reveal (blur + mask + zoom)',
    nomeAmigavel: 'Lente de foco',
    categoria: 'cursor',
    subcategoria: 'Máscaras guiadas pelo ponteiro',
    descricao:
      'A página fica desfocada e uma lente (ou um par de óculos) segue o ponteiro mostrando, dentro dela, o conteúdo nítido e levemente ampliado.',
    objetivoVisual:
      'Fazer o usuário "experimentar" o produto — enxergar com a lente — e transformar a navegação numa descoberta.',
    aplicacoes: [
      'Óticas e produtos de visão',
      'Heros interativos com lupa',
      'Revelar detalhes de uma foto ou mapa',
    ],
    nivel: 'avancado',
    tecnologias: ['HTML', 'CSS', 'JavaScript'],
    dependencias: [],
    interacoes: ['mouse', 'touch', 'click', 'keyboard'],
    tags: [
      'lente',
      'lupa',
      'óculos',
      'blur',
      'foco',
      'mask-image',
      'zoom',
      'magnifier',
      'referência em vídeo',
    ],
    explicacao: [
      'Existem duas cópias do mesmo conteúdo, uma em cima da outra. A de baixo tem filter: blur() — é a "visão sem óculos".',
      'A de cima é nítida, mas uma mask-image com radial-gradient só deixa aparecer um círculo em volta do ponteiro (dois círculos no modo óculos).',
      'Dentro da camada nítida, o conteúdo recebe scale() com transform-origin no próprio ponteiro: o ponto sob a lente fica parado e o resto cresce em volta dele, como numa lupa.',
      'O aro é só desenho: bordas e sombras que seguem o mesmo --x/--y. O botão "Tudo em foco" tira a máscara e mostra tudo nítido.',
    ],
    alternativa:
      'backdrop-filter numa lente que se move faz o oposto (desfoca o que está atrás dela). Para refração real, com distorção nas bordas, use um shader de lente em WebGL (Three.js + MeshTransmissionMaterial ou um fragment shader).',
    compatibilidade:
      'mask-image sem prefixo: Chrome e Edge 120+, Firefox 53+, Safari 15.4+ (o CSS também traz -webkit-mask-image). filter: blur(): todos os navegadores atuais.',
    responsividade:
      'A lente segue o dedo (touch-action: none só na cena). O tamanho da fonte usa clamp() e a cena mantém a proporção 16:10.',
    acessibilidade:
      'Só a camada nítida é lida pelo leitor de tela (a desfocada é aria-hidden). O botão "Tudo em foco" é a alternativa a quem não usa ponteiro. Não há movimento automático.',
    performance:
      'O blur é estático (desenhado uma vez). A cada movimento mudam duas variáveis CSS, uma vez por quadro (requestAnimationFrame): o navegador repinta só a máscara e o aro.',
    limitacoes: [
      'O conteúdo existe em dobro no DOM: para páginas inteiras, prefira aplicar o efeito só no hero.',
      'A ampliação é de imagem plana: não há a distorção de borda de uma lente de vidro (veja a alternativa em WebGL).',
    ],
    referencias: [
      MDN.mask,
      {
        titulo: 'MDN — filter: blur()',
        url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/filter-function/blur',
      },
      MDN.pointer,
    ],
    validadoEm: VALIDADO_EM,
    status: 'validado',
  },
  params: [
    {
      id: 'raio',
      rotulo: 'raio da lente',
      tipo: 'range',
      min: 50,
      max: 160,
      passo: 5,
      unidade: 'px',
      padrao: 85,
    },
    {
      id: 'desfoque',
      rotulo: 'desfoque fora da lente',
      tipo: 'range',
      min: 2,
      max: 16,
      passo: 1,
      unidade: 'px',
      padrao: 8,
    },
    {
      id: 'zoom',
      rotulo: 'ampliação',
      tipo: 'range',
      min: 1,
      max: 1.6,
      passo: 0.05,
      unidade: '×',
      padrao: 1.15,
    },
    {
      id: 'formato',
      rotulo: 'formato',
      tipo: 'select',
      opcoes: [
        { valor: 'oculos', rotulo: 'óculos (duas lentes)' },
        { valor: 'lupa', rotulo: 'lupa (uma lente)' },
      ],
      padrao: 'oculos',
    },
  ],
  gerar: (v) => {
    const r = Number(v['raio']);
    const oculos = v['formato'] === 'oculos';
    // distância do centro de cada lente até o meio dos óculos
    const d = Math.round(r * 1.12);
    const furo = (x: string) =>
      `radial-gradient(circle at ${x} var(--y), #000 ${r}px, transparent ${r + 1}px)`;
    const mascara = oculos
      ? `${furo(`calc(var(--x) - ${d}px)`)}, ${furo(`calc(var(--x) + ${d}px)`)}`
      : furo('var(--x)');
    const aro = (deslocamento: number) => `left: ${deslocamento - r}px;`;
    return {
      html: `<section class="cena-lente">
  <div class="camada desfocada" aria-hidden="true">
    <div class="conteudo">
      ${CONTEUDO}
    </div>
  </div>
  <div class="camada nitida">
    <div class="conteudo zoom">
      ${CONTEUDO}
    </div>
  </div>
  <div class="aro" aria-hidden="true"></div>
</section>
<button class="foco-total" type="button" aria-pressed="false">Tudo em foco</button>`,
      css: `${cssPalco()}

.cena-lente {
  --x: 50%;
  --y: 50%;
  position: relative;
  width: min(100%, 640px);
  aspect-ratio: 16 / 10;
  border-radius: 20px;
  overflow: hidden;
  touch-action: none; /* o dedo move a lente em vez de rolar a página */
}
.camada { position: absolute; inset: 0; }
.conteudo {
  display: grid;
  place-content: center;
  height: 100%;
  padding: 24px;
  text-align: center;
  color: #fff;
  background:
    linear-gradient(180deg, transparent 55%, rgb(8 40 30 / 0.85)),
    radial-gradient(ellipse at 50% 120%, #1f6b4a 30%, transparent 60%),
    linear-gradient(180deg, #3aa0ff 0%, #9fd8ff 45%, #e8f4ff 60%, #2f8f6b 61%);
}
.conteudo h1 { margin: 0; font-size: clamp(2rem, 9vw, 4.4rem); line-height: 0.95; letter-spacing: -0.03em; }
.conteudo p { margin: 12px 0 0; font-weight: 600; }

/* Visão "sem óculos" */
.desfocada { filter: blur(${v['desfoque']}px); }

/* Visão "com óculos": só aparece dentro da(s) lente(s) */
.nitida {
  -webkit-mask-image: ${mascara};
  mask-image: ${mascara};
}
/* lupa: amplia em volta do ponteiro (o ponto sob a lente não se move) */
.zoom {
  transform: scale(${v['zoom']});
  transform-origin: var(--x) var(--y);
}

/* O aro (só desenho) segue o mesmo ponto */
.aro {
  position: absolute;
  left: 0;
  top: 0;
  translate: var(--x) var(--y);
  pointer-events: none;
  transition: opacity 300ms ease;
}
.aro::before${oculos ? ', .aro::after' : ''} {
  content: '';
  position: absolute;
  top: ${-r}px;
  ${aro(oculos ? -d : 0)}
  width: ${r * 2}px;
  height: ${r * 2}px;
  border: 3px solid rgb(255 255 255 / 0.8);
  border-radius: 50%;
  box-shadow: inset 0 0 18px rgb(255 255 255 / 0.35), 0 8px 28px rgb(0 0 0 / 0.35);
}${
        oculos
          ? `
.aro::after { ${aro(d)} }`
          : ''
      }

/* Botão: tudo nítido, sem lente */
.cena-lente.is-foco .nitida { -webkit-mask-image: none; mask-image: none; }
.cena-lente.is-foco .zoom { transform: none; }
.cena-lente.is-foco .aro { opacity: 0; }

.foco-total {
  padding: 10px 20px;
  border: 1px solid #3a3456;
  border-radius: 999px;
  background: transparent;
  color: #f4f2ff;
  font: inherit;
  cursor: pointer;
}
.foco-total:focus-visible { outline: 2px solid #22e3ff; outline-offset: 3px; }

@media (prefers-reduced-motion: reduce) {
  .aro { transition: none; }
}`,
      js: `const cena = document.querySelector('.cena-lente');
const botao = document.querySelector('.foco-total');
let quadro = 0;

function mirar(x, y) {
  cena.style.setProperty('--x', x + 'px');
  cena.style.setProperty('--y', y + 'px');
}

// começa no meio da cena (o aro precisa de pixels para se posicionar)
const r0 = cena.getBoundingClientRect();
mirar(r0.width / 2, r0.height / 2);

cena.addEventListener('pointermove', (e) => {
  cancelAnimationFrame(quadro);
  quadro = requestAnimationFrame(() => {
    const r = cena.getBoundingClientRect();
    mirar(e.clientX - r.left, e.clientY - r.top);
  });
});

// alternativa sem ponteiro: tudo nítido
botao.addEventListener('click', () => {
  const foco = cena.classList.toggle('is-foco');
  botao.setAttribute('aria-pressed', String(foco));
  botao.textContent = foco ? 'Voltar à lente' : 'Tudo em foco';
});`,
    };
  },
  angular: (v) => ({
    ts: `import { Component, ElementRef, afterNextRender, signal, viewChild } from '@angular/core';

@Component({
  selector: 'app-lens-focus',
  templateUrl: './lens-focus.html',
  styleUrl: './lens-focus.css',
})
export class ${nomeClasse('lens-focus')} {
  private readonly cena = viewChild.required<ElementRef<HTMLElement>>('cena');
  private quadro = 0;

  protected readonly x = signal('50%');
  protected readonly y = signal('50%');
  protected readonly foco = signal(false);

  constructor() {
    // começa no meio da cena (o aro precisa de pixels para se posicionar)
    afterNextRender(() => {
      const r = this.cena().nativeElement.getBoundingClientRect();
      this.mirar(r.width / 2, r.height / 2);
    });
  }

  protected mover(e: PointerEvent): void {
    cancelAnimationFrame(this.quadro);
    this.quadro = requestAnimationFrame(() => {
      const r = this.cena().nativeElement.getBoundingClientRect();
      this.mirar(e.clientX - r.left, e.clientY - r.top);
    });
  }

  private mirar(x: number, y: number): void {
    this.x.set(x + 'px');
    this.y.set(y + 'px');
  }
}
`,
    html: `<section
  #cena
  class="cena-lente"
  [class.is-foco]="foco()"
  [style.--x]="x()"
  [style.--y]="y()"
  (pointermove)="mover($event)"
>
  <div class="camada desfocada" aria-hidden="true">
    <div class="conteudo">
      ${CONTEUDO}
    </div>
  </div>
  <div class="camada nitida">
    <div class="conteudo zoom">
      ${CONTEUDO}
    </div>
  </div>
  <div class="aro" aria-hidden="true"></div>
</section>
<button class="foco-total" type="button" [attr.aria-pressed]="foco()" (click)="foco.set(!foco())">
  {{ foco() ? 'Voltar à lente' : 'Tudo em foco' }}
</button>
`,
    css: cssAngular(LENS_FOCUS.gerar(v).css),
  }),
  niveis: {
    iniciante: [
      'A cena tem duas cópias da mesma imagem: uma embaçada embaixo e uma nítida em cima.',
      'A cópia nítida só aparece dentro de um ou dois círculos que seguem o mouse — como se você olhasse pela lente dos óculos.',
      'Dentro da lente a imagem fica um pouquinho maior, igual a uma lupa.',
    ],
    avancado: [
      'Duas radial-gradient na mesma mask-image somam as áreas visíveis (mask-composite: add é o padrão): assim saem as duas lentes dos óculos.',
      'transform-origin: var(--x) var(--y) no scale() é o truque da lupa — o ponto sob o ponteiro é o centro da ampliação, então ele não "foge" da lente.',
      'A máscara fica na .nitida e o scale no filho .zoom: se os dois estivessem no mesmo elemento, a máscara também cresceria junto com o zoom.',
      'O aro usa a propriedade individual translate (não transform), lendo as mesmas variáveis; no Angular, --x e --y vêm de signals e afterNextRender centraliza a lente só no navegador.',
    ],
  },
  glossario: [
    { termo: 'filter: blur(', explicacao: 'Desfoca a camada de baixo (a visão sem lente).' },
    { termo: 'mask-image', explicacao: 'Só deixa aparecer a camada nítida dentro das lentes.' },
    {
      termo: 'transform-origin: var(--x) var(--y)',
      explicacao: 'Centro da ampliação = posição do ponteiro.',
    },
    { termo: 'touch-action: none', explicacao: 'O dedo move a lente em vez de rolar a página.' },
  ],
};
