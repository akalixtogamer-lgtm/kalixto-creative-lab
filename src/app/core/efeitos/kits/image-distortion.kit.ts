import { EffectKit } from '../../models/effect-sheet.model';
import { MDN, VALIDADO_EM, cssAngular, cssPalco, nomeClasse } from './_base';

/** Cena vetorial usada como "imagem" (sem arquivos externos). */
const CENA = `<defs>
      <linearGradient id="ceu" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#1a1040" />
        <stop offset="0.7" stop-color="#7c3aed" />
        <stop offset="1" stop-color="#ff2bd6" />
      </linearGradient>
    </defs>
    <g filter="url(#distorcer)">
      <rect width="400" height="250" fill="url(#ceu)" />
      <circle cx="200" cy="150" r="42" fill="#ffd27a" />
      <polygon points="0,190 70,140 140,185 210,130 290,180 360,145 400,170 400,250 0,250" fill="#2d1a66" />
      <polygon points="0,220 90,190 180,225 270,195 400,225 400,250 0,250" fill="#0b0a14" />
      <text x="200" y="80" text-anchor="middle" font-size="34" font-weight="700" fill="#f4f2ff" font-family="system-ui, sans-serif">KALIXTO</text>
    </g>`;

export const IMAGE_DISTORTION: EffectKit = {
  ficha: {
    id: 'image-distortion',
    nomeTecnico: 'Image Distortion (SVG displacement)',
    nomeAmigavel: 'Distorção líquida na imagem',
    categoria: 'experimental',
    subcategoria: 'Distorções',
    descricao:
      'A imagem ondula como se estivesse debaixo d’água quando recebe o mouse ou o foco, usando filtros SVG.',
    objetivoVisual: 'Dar uma resposta orgânica e surpreendente a imagens e cards.',
    aplicacoes: ['Galerias de projetos', 'Hovers de capa', 'Aberturas experimentais'],
    nivel: 'avancado',
    tecnologias: ['HTML', 'SVG', 'JavaScript'],
    dependencias: [],
    interacoes: ['hover', 'keyboard', 'autoplay'],
    tags: [
      'distorção',
      'displacement',
      'feTurbulence',
      'feDisplacementMap',
      'svg',
      'filtro',
      'líquido',
      'onda',
    ],
    explicacao: [
      'feTurbulence gera um ruído (manchas aleatórias suaves). baseFrequency controla o tamanho das manchas.',
      'feDisplacementMap usa esse ruído para empurrar cada pixel da imagem; scale é a força do empurrão.',
      'O JavaScript anima scale (de 0 até a intensidade) e muda baseFrequency com o tempo, para a ondulação "andar".',
      'No modo hover, a distorção entra com mouseenter ou foco e sai com mouseleave ou blur; no modo contínuo, ela nunca para.',
    ],
    alternativa:
      'Em WebGL, um shader de distorção faz o mesmo com imagens reais e muito mais desempenho — veja a demo "Distorcer uma imagem" no laboratório WebGL & GLSL.',
    compatibilidade:
      'Filtros SVG (feTurbulence, feDisplacementMap) funcionam em todos os navegadores atuais.',
    responsividade: 'O SVG usa viewBox, então a cena escala com a largura disponível.',
    acessibilidade:
      'A cena tem role="img" e um nome acessível. O efeito também é acionado pelo foco do teclado. Com prefers-reduced-motion, a ondulação não se move: no hover a distorção aparece parada, e no modo contínuo ela fica desligada.',
    performance:
      'Filtros SVG são calculados na CPU em muitos navegadores; manter a área pequena e animar só enquanto visível é importante. O laço para quando a distorção volta a zero.',
    limitacoes: [
      'Áreas grandes com filtro animado podem pesar em celulares.',
      'O ruído é recalculado a cada mudança de baseFrequency.',
    ],
    referencias: [MDN.turbulence, MDN.displacement, MDN.raf, MDN.reduzir],
    validadoEm: VALIDADO_EM,
    status: 'validado',
  },
  params: [
    {
      id: 'intens',
      rotulo: 'intensidade',
      tipo: 'range',
      min: 5,
      max: 80,
      passo: 5,
      unidade: '',
      padrao: 30,
    },
    {
      id: 'freq',
      rotulo: 'tamanho das ondas (frequência)',
      tipo: 'range',
      min: 0.005,
      max: 0.06,
      passo: 0.005,
      unidade: '',
      padrao: 0.02,
    },
    {
      id: 'vel',
      rotulo: 'velocidade',
      tipo: 'range',
      min: 0.2,
      max: 3,
      passo: 0.1,
      unidade: '×',
      padrao: 1,
    },
    {
      id: 'modo',
      rotulo: 'quando',
      tipo: 'select',
      opcoes: [
        { valor: 'hover', rotulo: 'no hover e no foco' },
        { valor: 'continuo', rotulo: 'sempre' },
      ],
      padrao: 'hover',
    },
  ],
  gerar: (v) => ({
    html: `<div class="imagem" tabindex="0">
  <svg viewBox="0 0 400 250" role="img" aria-label="Paisagem com montanhas, sol e o nome KALIXTO">
    <filter id="distorcer" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="${v['freq']}" numOctaves="2" seed="3" result="ruido" />
      <feDisplacementMap in="SourceGraphic" in2="ruido" scale="0" xChannelSelector="R" yChannelSelector="G" />
    </filter>
    ${CENA}
  </svg>
</div>
<p class="dica">${v['modo'] === 'hover' ? 'Passe o mouse ou use Tab para focar a imagem.' : 'A distorção roda o tempo todo.'}</p>`,
    css: `${cssPalco()}

.imagem {
  width: min(100%, 560px);
  border-radius: 16px;
  overflow: hidden;
  line-height: 0;
}
.imagem svg { width: 100%; height: auto; }
.imagem:focus-visible { outline: 2px solid #22e3ff; outline-offset: 4px; }
.dica { margin: 0; color: #c9c3ea; font-size: 0.9rem; }`,
    js: `const imagem = document.querySelector('.imagem');
const ruido = imagem.querySelector('feTurbulence');
const mapa = imagem.querySelector('feDisplacementMap');
const INTENSIDADE = ${v['intens']};
const FREQUENCIA = ${v['freq']};
const VELOCIDADE = ${v['vel']};
const CONTINUO = ${v['modo'] === 'continuo'};
const reduzir = window.matchMedia('(prefers-reduced-motion: reduce)');

let alvo = 0;  // força desejada (0 = sem distorção)
let forca = 0; // força atual
let quadro = 0;

function desenhar(t) {
  forca += (alvo - forca) * 0.08; // aproxima suavemente do alvo
  const onda = Math.sin((t / 1000) * VELOCIDADE) * 0.25 + 1; // a frequência "respira"
  ruido.setAttribute('baseFrequency', String(FREQUENCIA * onda));
  mapa.setAttribute('scale', forca.toFixed(2));
  const parado = alvo === 0 && forca < 0.1;
  quadro = parado ? 0 : requestAnimationFrame(desenhar);
}

function ligar() {
  alvo = INTENSIDADE;
  if (reduzir.matches) { mapa.setAttribute('scale', String(alvo)); return; } // sem movimento
  if (!quadro) quadro = requestAnimationFrame(desenhar);
}

function desligar() {
  alvo = 0;
  if (reduzir.matches) { mapa.setAttribute('scale', '0'); return; }
  if (!quadro) quadro = requestAnimationFrame(desenhar);
}

if (CONTINUO) {
  if (!reduzir.matches) ligar();
} else {
  imagem.addEventListener('pointerenter', ligar);
  imagem.addEventListener('pointerleave', desligar);
  imagem.addEventListener('focus', ligar);
  imagem.addEventListener('blur', desligar);
}`,
  }),
  angular: (v) => ({
    ts: `import { Component, DestroyRef, ElementRef, afterNextRender, inject, viewChild } from '@angular/core';

@Component({
  selector: 'app-image-distortion',
  templateUrl: './image-distortion.html',
  styleUrl: './image-distortion.css',
})
export class ${nomeClasse('image-distortion')} {
  protected readonly frequencia = ${v['freq']};
  protected readonly continuo = ${v['modo'] === 'continuo'};
  private readonly intensidade = ${v['intens']};
  private readonly velocidade = ${v['vel']};
  private readonly reduzir = window.matchMedia('(prefers-reduced-motion: reduce)');
  private readonly ruido = viewChild.required<ElementRef<SVGFETurbulenceElement>>('ruido');
  private readonly mapa = viewChild.required<ElementRef<SVGFEDisplacementMapElement>>('mapa');

  private alvo = 0;
  private forca = 0;
  private quadro = 0;

  constructor() {
    inject(DestroyRef).onDestroy(() => cancelAnimationFrame(this.quadro));
    afterNextRender(() => {
      if (this.continuo && !this.reduzir.matches) this.ligar();
    });
  }

  protected ligar(): void {
    this.alvo = this.intensidade;
    if (this.reduzir.matches) {
      this.mapa().nativeElement.setAttribute('scale', String(this.alvo));
      return;
    }
    if (!this.quadro) this.quadro = requestAnimationFrame((t) => this.desenhar(t));
  }

  protected desligar(): void {
    if (this.continuo) return;
    this.alvo = 0;
    if (this.reduzir.matches) {
      this.mapa().nativeElement.setAttribute('scale', '0');
      return;
    }
    if (!this.quadro) this.quadro = requestAnimationFrame((t) => this.desenhar(t));
  }

  private desenhar(t: number): void {
    this.forca += (this.alvo - this.forca) * 0.08;
    const onda = Math.sin((t / 1000) * this.velocidade) * 0.25 + 1;
    this.ruido().nativeElement.setAttribute('baseFrequency', String(this.frequencia * onda));
    this.mapa().nativeElement.setAttribute('scale', this.forca.toFixed(2));
    const parado = this.alvo === 0 && this.forca < 0.1;
    this.quadro = parado ? 0 : requestAnimationFrame((t2) => this.desenhar(t2));
  }
}
`,
    html: `<div
  class="imagem"
  tabindex="0"
  (pointerenter)="continuo || ligar()"
  (pointerleave)="desligar()"
  (focus)="continuo || ligar()"
  (blur)="desligar()"
>
  <svg viewBox="0 0 400 250" role="img" aria-label="Paisagem com montanhas, sol e o nome KALIXTO">
    <filter id="distorcer" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence #ruido type="fractalNoise" [attr.baseFrequency]="frequencia" numOctaves="2" seed="3" result="ruido" />
      <feDisplacementMap #mapa in="SourceGraphic" in2="ruido" scale="0" xChannelSelector="R" yChannelSelector="G" />
    </filter>
    ${CENA}
  </svg>
</div>
<p class="dica">{{ continuo ? 'A distorção roda o tempo todo.' : 'Passe o mouse ou use Tab para focar a imagem.' }}</p>
`,
    css: cssAngular(IMAGE_DISTORTION.gerar(v).css),
  }),
  niveis: {
    iniciante: [
      'O navegador cria um "mapa" de manchas aleatórias, como nuvens.',
      'Esse mapa empurra os pixels da imagem para os lados, deixando tudo ondulado como reflexo na água.',
      'O código aumenta e diminui a força desse empurrão quando o mouse entra e sai.',
    ],
    avancado: [
      'feDisplacementMap desloca cada pixel por (canal − 0,5) × scale; com xChannelSelector R e yChannelSelector G, o ruído controla os dois eixos.',
      'fractalNoise com numOctaves 2 dá ondas suaves; mais oitavas aumentam o detalhe e o custo.',
      'A região do filtro (x/y/width/height) precisa ser maior que a imagem, senão as bordas deslocadas são cortadas.',
      'Mudar baseFrequency força recalcular o ruído inteiro; para áreas grandes, prefira animar só scale ou usar WebGL.',
      'IDs de filtro são globais no documento: em componentes repetidos, gere um id único por instância para não colidir.',
    ],
  },
  glossario: [
    { termo: 'feTurbulence', explicacao: 'Gera o ruído (manchas suaves) que guia a distorção.' },
    { termo: 'baseFrequency', explicacao: 'Tamanho das ondas: valores menores dão ondas maiores.' },
    { termo: 'feDisplacementMap', explicacao: 'Empurra os pixels da imagem usando o ruído.' },
    { termo: 'scale', explicacao: 'Força da distorção (0 = imagem normal).' },
    {
      termo: 'role="img"',
      explicacao: 'Faz o leitor de tela tratar o SVG como uma imagem com nome.',
    },
    { termo: 'pointerenter', explicacao: 'O mouse entrou na imagem: liga a distorção.' },
  ],
};
