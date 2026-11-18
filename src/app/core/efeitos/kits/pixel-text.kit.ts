import { EffectKit } from '../../models/effect-sheet.model';
import { MDN, VALIDADO_EM, cssAngular, cssPalco, nomeClasse } from './_base';

const TEXTO = 'REVOLUÇÃO.';

/** Lógica comum (JS puro e Angular): amostra o texto em células e desenha o quadro t. */
const NUCLEO = (pixel: number, modo: string) => `const PIXEL = ${pixel};

// Desenha o texto numa tela escondida e guarda as células "cheias" da grade
function amostrar(w, h, texto) {
  const tela = document.createElement('canvas');
  tela.width = w;
  tela.height = h;
  const o = tela.getContext('2d');
  o.fillStyle = '#ffffff';
  o.font = '800 ' + Math.round(h * 0.42) + 'px system-ui, sans-serif';
  o.textAlign = 'center';
  o.textBaseline = 'middle';
  o.fillText(texto, w / 2, h / 2);
  const dados = o.getImageData(0, 0, w, h).data;
  const celulas = [];
  for (let y = 0; y < h; y += PIXEL) {
    for (let x = 0; x < w; x += PIXEL) {
      const i = (Math.min(h - 1, y + (PIXEL >> 1)) * w + Math.min(w - 1, x + (PIXEL >> 1))) * 4;
      if (dados[i + 3] > 100) {
        // ordem de aparição (0 → 1): ${modo === 'varrer' ? 'da esquerda para a direita, com um pouco de acaso' : 'totalmente aleatória'}
        celulas.push({ x, y, ordem: ${modo === 'varrer' ? '(x / w) * 0.8 + Math.random() * 0.2' : 'Math.random()'} });
      }
    }
  }
  return { tela, celulas };
}

// Quadro t (0 → 1): células já "acesas" em branco, a frente da onda em lima
function desenhar(ctx, amostra, t) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  if (t >= 1) {
    ctx.drawImage(amostra.tela, 0, 0); // fim: o texto nítido
    return;
  }
  for (const c of amostra.celulas) {
    if (c.ordem > t) continue;
    ctx.fillStyle = t - c.ordem < 0.08 ? '#c6ff3d' : '#ffffff';
    ctx.fillRect(c.x, c.y, PIXEL - 1, PIXEL - 1);
  }
}`;

export const PIXEL_TEXT: EffectKit = {
  ficha: {
    id: 'pixel-text',
    nomeTecnico: 'Pixel Dissolve Text (canvas)',
    nomeAmigavel: 'Título que se monta em pixels',
    categoria: 'tipografia',
    subcategoria: 'Texto que se transforma',
    descricao: 'O título surge bloco a bloco, como pixels acendendo num painel de LED, com uma "frente" colorida percorrendo as letras, até virar texto nítido.',
    objetivoVisual: 'Dar um ar digital, de dados e tecnologia, a títulos de seção — como nos sites de agrotech e ciência.',
    aplicacoes: ['Títulos de seção em sites de tecnologia', 'Telas de abertura', 'Manchetes de campanhas'],
    nivel: 'avancado',
    tecnologias: ['HTML', 'CSS', 'JavaScript', 'Canvas'],
    dependencias: [],
    interacoes: ['autoplay', 'click'],
    tags: ['pixel', 'dissolve', 'glitch', 'led', 'canvas', 'getImageData', 'texto digital', 'referência em vídeo'],
    explicacao: [
      'O texto é desenhado primeiro numa tela escondida. getImageData lê os pixels dela, e a gente percorre uma grade (de PIXEL em PIXEL) guardando só as células que caíram em cima de alguma letra.',
      'Cada célula recebe uma "ordem" de 0 a 1: aleatória (dissolver) ou crescendo da esquerda para a direita (varrer).',
      'A cada quadro, desenhamos os quadradinhos cuja ordem já passou do progresso t. Os mais recentes (até 0,08 atrás) saem em lima: é a frente da onda.',
      'Quando t chega a 1, a tela escondida inteira é copiada: o texto termina nítido, com as curvas das letras.',
    ],
    alternativa: 'Sem canvas: cada letra como <span> com clip-path de "degraus" animado (steps()). Em WebGL: um shader que pixeliza (floor(uv × n) / n) diminuindo n até o texto ficar nítido.',
    compatibilidade: 'Canvas 2D e getImageData: todos os navegadores atuais.',
    responsividade: 'O canvas tem tamanho interno fixo e escala pelo CSS; em telas retina multiplique o tamanho por devicePixelRatio.',
    acessibilidade: 'O texto real está num <h1> visualmente oculto; o canvas é aria-hidden. Com prefers-reduced-motion o texto aparece direto, já nítido.',
    performance: 'getImageData roda uma vez. Por quadro, só fillRect das células visíveis (centenas) durante a duração escolhida.',
    limitacoes: [
      'A fonte do canvas precisa estar carregada antes da amostragem (document.fonts.ready) — senão a amostra sai com a fonte de reserva.',
      'Texto longo vira milhares de células: use em títulos curtos.',
    ],
    referencias: [
      { titulo: 'MDN — getImageData()', url: 'https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/getImageData' },
      { titulo: 'MDN — fillText()', url: 'https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fillText' },
      MDN.reduzir,
    ],
    validadoEm: VALIDADO_EM,
    status: 'validado',
  },
  params: [
    { id: 'pixel', rotulo: 'tamanho do pixel', tipo: 'range', min: 4, max: 20, passo: 2, unidade: 'px', padrao: 8 },
    { id: 'duracao', rotulo: 'duração', tipo: 'range', min: 600, max: 3000, passo: 100, unidade: 'ms', padrao: 1600 },
    {
      id: 'modo',
      rotulo: 'como aparece',
      tipo: 'select',
      opcoes: [
        { valor: 'varrer', rotulo: 'varrer (esquerda → direita)' },
        { valor: 'dissolver', rotulo: 'dissolver (aleatório)' },
      ],
      padrao: 'varrer',
    },
  ],
  gerar: (v) => ({
    html: `<h1 class="oculto">${TEXTO}</h1>
<canvas class="painel" width="720" height="200" aria-hidden="true"></canvas>
<button class="repetir" type="button">Repetir</button>`,
    css: `${cssPalco()}

.painel {
  width: min(100%, 720px);
  height: auto;
  border-radius: 16px;
  background: radial-gradient(ellipse at 50% 120%, #1f6b4a, #0b1a12 70%);
}
.oculto { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
.repetir {
  padding: 8px 16px;
  border: 1px solid #3a3456;
  border-radius: 999px;
  background: transparent;
  color: #c9c3ea;
  font: inherit;
  cursor: pointer;
}`,
    js: `${NUCLEO(Number(v['pixel']), String(v['modo']))}

const DURACAO = ${v['duracao']};
const canvas = document.querySelector('.painel');
const ctx = canvas.getContext('2d');
const texto = document.querySelector('.oculto').textContent;
const reduzir = matchMedia('(prefers-reduced-motion: reduce)');
let quadro = 0;

function montar() {
  cancelAnimationFrame(quadro);
  const amostra = amostrar(canvas.width, canvas.height, texto);
  if (reduzir.matches) return desenhar(ctx, amostra, 1);
  const inicio = performance.now();
  const passo = (agora) => {
    const t = Math.min(1, (agora - inicio) / DURACAO);
    desenhar(ctx, amostra, t);
    if (t < 1) quadro = requestAnimationFrame(passo);
  };
  quadro = requestAnimationFrame(passo);
}

// espera a fonte para a amostra sair com as letras certas
document.fonts.ready.then(montar);
document.querySelector('.repetir').addEventListener('click', montar);`,
  }),
  angular: (v) => ({
    ts: `import { Component, DestroyRef, ElementRef, afterNextRender, inject, viewChild } from '@angular/core';

@Component({
  selector: 'app-pixel-text',
  templateUrl: './pixel-text.html',
  styleUrl: './pixel-text.css',
})
export class ${nomeClasse('pixel-text')} {
  protected readonly texto = '${TEXTO}';
  private readonly duracao = ${v['duracao']};
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private quadro = 0;

  constructor() {
    // espera a fonte (fora do navegador, document.fonts pode não existir)
    afterNextRender(() => (document.fonts?.ready ?? Promise.resolve()).then(() => this.montar()));
    inject(DestroyRef).onDestroy(() => cancelAnimationFrame(this.quadro));
  }

  protected montar(): void {
    const canvas = this.canvas().nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    cancelAnimationFrame(this.quadro);
    const amostra = amostrar(canvas.width, canvas.height, this.texto);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return desenhar(ctx, amostra, 1);
    const inicio = performance.now();
    const passo = (agora: number) => {
      const t = Math.min(1, (agora - inicio) / this.duracao);
      desenhar(ctx, amostra, t);
      if (t < 1) this.quadro = requestAnimationFrame(passo);
    };
    this.quadro = requestAnimationFrame(passo);
  }
}

interface Celula {
  x: number;
  y: number;
  ordem: number;
}

interface Amostra {
  tela: HTMLCanvasElement;
  celulas: Celula[];
}

${NUCLEO(Number(v['pixel']), String(v['modo']))
  .replace('function amostrar(w, h, texto) {', 'function amostrar(w: number, h: number, texto: string): Amostra {')
  .replace("const o = tela.getContext('2d');", "const o = tela.getContext('2d') as CanvasRenderingContext2D;")
  .replace('const celulas = [];', 'const celulas: Celula[] = [];')
  .replace('function desenhar(ctx, amostra, t) {', 'function desenhar(ctx: CanvasRenderingContext2D, amostra: Amostra, t: number): void {')}
`,
    html: `<h1 class="oculto">{{ texto }}</h1>
<canvas #canvas class="painel" width="720" height="200" aria-hidden="true"></canvas>
<button class="repetir" type="button" (click)="montar()">Repetir</button>
`,
    css: cssAngular(PIXEL_TEXT.gerar(v).css),
  }),
  niveis: {
    iniciante: [
      'O título é dividido em quadradinhos, como os pixels de uma tela de LED.',
      'Os quadradinhos acendem aos poucos — da esquerda para a direita ou espalhados — e os mais novos piscam em verde-limão.',
      'No final, os quadradinhos dão lugar ao texto liso e nítido.',
    ],
    avancado: [
      'Amostrar no centro de cada célula (x + PIXEL/2) é mais barato que somar o alfa da célula toda e já dá o contorno das letras.',
      'getImageData em canvas com texto não "contamina" a tela (sem imagens de outra origem), então a leitura é permitida.',
      'A ordem com acaso limitado (x/w × 0,8 + acaso × 0,2) cria uma frente de onda irregular, que parece mais "glitch" que uma linha reta.',
      'Para um glitch mais forte, desloque horizontalmente algumas células da frente (x ± PIXEL) por um ou dois quadros.',
    ],
  },
  glossario: [
    { termo: 'getImageData', explicacao: 'Lê os pixels do texto desenhado na tela escondida.' },
    { termo: 'fillRect', explicacao: 'Desenha cada quadradinho (célula) do título.' },
    { termo: 'document.fonts.ready', explicacao: 'Espera a fonte carregar antes de amostrar o texto.' },
    { termo: 'drawImage', explicacao: 'No fim, copia o texto nítido para a tela visível.' },
  ],
};
