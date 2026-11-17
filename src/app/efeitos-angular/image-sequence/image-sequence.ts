import { Component, DestroyRef, ElementRef, afterNextRender, inject, viewChild } from '@angular/core';

@Component({
  selector: 'app-image-sequence',
  templateUrl: './image-sequence.html',
  styleUrl: './image-sequence.css',
})
export class ImageSequence {
  private readonly total = 60;
  private readonly secao = viewChild.required<ElementRef<HTMLElement>>('secao');
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const canvas = this.canvas().nativeElement;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const suavizar = reduzir ? 1 : 0.2;
      const quadros = Array.from({ length: this.total }, (_, i) => {
        const c = document.createElement('canvas');
        c.width = canvas.width;
        c.height = canvas.height;
        const cx = c.getContext('2d');
        if (cx) desenharQuadro(cx, c.width, c.height, i / (this.total - 1));
        return c;
      });
      let atual = 0;
      let desenhado = -1;
      let quadro = 0;
      const loop = () => {
        const secao = this.secao().nativeElement;
        const r = secao.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, -r.top / (secao.offsetHeight - window.innerHeight)));
        atual += (p * (this.total - 1) - atual) * suavizar;
        const indice = Math.round(atual);
        if (indice !== desenhado) {
          ctx.drawImage(quadros[indice], 0, 0);
          desenhado = indice;
        }
        quadro = requestAnimationFrame(loop);
      };
      loop();
      destroyRef.onDestroy(() => cancelAnimationFrame(quadro));
    });
  }
}

function desenharQuadro(ctx: CanvasRenderingContext2D, w: number, h: number, t: number): void {
  const fundo = ctx.createRadialGradient(w * 0.5, h * 0.35, 10, w * 0.5, h * 0.5, w * 0.7);
  fundo.addColorStop(0, '#5a3a2a');
  fundo.addColorStop(1, '#120a08');
  ctx.fillStyle = fundo;
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 16; i++) {
    // "aleatório" fixo por grão: o mesmo quadro sempre sai igual
    const sx = Math.abs(Math.sin(i * 12.9898)) % 1;
    const sy = Math.abs(Math.sin(i * 78.233)) % 1;
    const tam = 10 + sx * 18;
    const x = sx * w + Math.sin(t * 6 + i) * 24;
    const y = -40 + ((sy + t * (0.8 + sx)) % 1) * (h + 80);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(i + t * (4 + sy * 6));
    const grao = ctx.createLinearGradient(-tam, -tam, tam, tam);
    grao.addColorStop(0, '#8a5a3c');
    grao.addColorStop(1, '#2a160d');
    ctx.fillStyle = grao;
    ctx.beginPath();
    ctx.ellipse(0, 0, tam, tam * 0.68, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgb(0 0 0 / 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-tam * 0.7, 0);
    ctx.quadraticCurveTo(0, tam * 0.25, tam * 0.7, 0);
    ctx.stroke();
    ctx.restore();
  }
  ctx.globalAlpha = Math.min(1, Math.max(0, (t - 0.35) * 3));
  ctx.fillStyle = '#f4ede6';
  ctx.font = '600 44px Georgia, serif';
  ctx.fillText('Tudo começa no grão', 32, h - 36);
  ctx.globalAlpha = 1;
}
