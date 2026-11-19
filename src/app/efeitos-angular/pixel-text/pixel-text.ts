import {
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  viewChild,
} from '@angular/core';

@Component({
  selector: 'app-pixel-text',
  templateUrl: './pixel-text.html',
  styleUrl: './pixel-text.css',
})
export class PixelText {
  protected readonly texto = 'REVOLUÇÃO.';
  private readonly duracao = 1600;
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
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches)
      return desenhar(ctx, amostra, 1);
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

const PIXEL = 8;

// Desenha o texto numa tela escondida e guarda as células "cheias" da grade
function amostrar(w: number, h: number, texto: string): Amostra {
  const tela = document.createElement('canvas');
  tela.width = w;
  tela.height = h;
  const o = tela.getContext('2d') as CanvasRenderingContext2D;
  o.fillStyle = '#ffffff';
  o.font = '800 ' + Math.round(h * 0.42) + 'px system-ui, sans-serif';
  o.textAlign = 'center';
  o.textBaseline = 'middle';
  o.fillText(texto, w / 2, h / 2);
  const dados = o.getImageData(0, 0, w, h).data;
  const celulas: Celula[] = [];
  for (let y = 0; y < h; y += PIXEL) {
    for (let x = 0; x < w; x += PIXEL) {
      const i = (Math.min(h - 1, y + (PIXEL >> 1)) * w + Math.min(w - 1, x + (PIXEL >> 1))) * 4;
      if (dados[i + 3] > 100) {
        // ordem de aparição (0 → 1): da esquerda para a direita, com um pouco de acaso
        celulas.push({ x, y, ordem: (x / w) * 0.8 + Math.random() * 0.2 });
      }
    }
  }
  return { tela, celulas };
}

// Quadro t (0 → 1): células já "acesas" em branco, a frente da onda em lima
function desenhar(ctx: CanvasRenderingContext2D, amostra: Amostra, t: number): void {
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
}
