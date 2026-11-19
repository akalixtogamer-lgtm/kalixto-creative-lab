import {
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';

interface Grao {
  t: number;
  dx: number;
  dy: number;
  a: number;
}

@Component({
  selector: 'app-particle-helix',
  templateUrl: './particle-helix.html',
  styleUrl: './particle-helix.css',
})
export class ParticleHelix {
  private readonly palco = viewChild.required<ElementRef<HTMLElement>>('palco');
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly velocidade = 0.01;
  private fase = 0;
  private quadro = 0;
  private desenhar: () => void = () => {};

  protected readonly pausado = signal(false);

  constructor() {
    afterNextRender(() => {
      const palco = this.palco().nativeElement;
      const canvas = this.canvas().nativeElement;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const dpr = window.devicePixelRatio || 1;
      const w = palco.clientWidth;
      const h = palco.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);
      this.desenhar = () => desenharHelice(ctx, w, h, this.fase);
      this.desenhar();
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) this.pausado.set(true);
      else this.loop();
    });
    inject(DestroyRef).onDestroy(() => cancelAnimationFrame(this.quadro));
  }

  protected alternar(): void {
    this.pausado.update((p) => !p);
    cancelAnimationFrame(this.quadro);
    if (!this.pausado()) this.loop();
  }

  private loop(): void {
    this.fase += this.velocidade;
    this.desenhar();
    this.quadro = requestAnimationFrame(() => this.loop());
  }
}

const VOLTAS = 3;
const INCLINACAO = (-30 * Math.PI) / 180;
const PONTOS = 260;

// poeira fixa em volta da hélice (sorteada uma vez)
const POEIRA: Grao[] = Array.from({ length: 220 }, () => ({
  t: Math.random(),
  dx: (Math.random() - 0.5) * 2.4,
  dy: (Math.random() - 0.5) * 40,
  a: Math.random() * 0.6,
}));

function desenharHelice(ctx: CanvasRenderingContext2D, w: number, h: number, fase: number): void {
  ctx.clearRect(0, 0, w, h);
  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.rotate(INCLINACAO);
  const comprimento = Math.hypot(w, h) * 0.9;
  const raio = Math.min(w, h) * 0.16;
  const ponto = (t: number, lado: number) => {
    const ang = t * VOLTAS * Math.PI * 2 + fase + lado * Math.PI;
    return { x: (t - 0.5) * comprimento, y: Math.cos(ang) * raio, z: Math.sin(ang) };
  };
  // degraus entre as duas fitas (a cada 8 pontos)
  for (let i = 0; i < PONTOS; i += 8) {
    const t = i / PONTOS;
    const a = ponto(t, 0);
    const b = ponto(t, 1);
    ctx.strokeStyle = 'rgb(255 255 255 / ' + (0.08 + (0.12 * (a.z + 1)) / 2) + ')';
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
  // as duas fitas: pontos maiores e mais claros quando estão "na frente" (z > 0)
  for (const lado of [0, 1]) {
    for (let i = 0; i < PONTOS; i++) {
      const p = ponto(i / PONTOS, lado);
      const frente = (p.z + 1) / 2;
      ctx.fillStyle =
        lado === 0
          ? 'rgb(255 154 213 / ' + (0.25 + 0.75 * frente) + ')'
          : 'rgb(127 178 255 / ' + (0.25 + 0.75 * frente) + ')';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 0.6 + 1.8 * frente, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // poeira brilhante acompanhando a hélice
  for (const g of POEIRA) {
    const p = ponto(g.t, 0);
    ctx.fillStyle = 'rgb(255 255 255 / ' + g.a + ')';
    ctx.fillRect(p.x + g.dx * raio, p.y * 0.2 + g.dy, 1.4, 1.4);
  }
  ctx.restore();
}
