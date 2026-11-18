import { Component, DestroyRef, ElementRef, afterNextRender, inject, signal, viewChild } from '@angular/core';

interface Particula {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
}

interface Mouse {
  x: number;
  y: number;
  ativo: boolean;
}

@Component({
  selector: 'app-particle-field',
  templateUrl: './particle-field.html',
  styleUrl: './particle-field.css',
})
export class ParticleField {
  private readonly campo = viewChild.required<ElementRef<HTMLElement>>('campo');
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly mouse: Mouse = { x: 0, y: 0, ativo: false };
  private quadro = 0;
  private desenhar: () => void = () => undefined;

  protected readonly pausado = signal(false);

  constructor() {
    afterNextRender(() => {
      const campo = this.campo().nativeElement;
      const canvas = this.canvas().nativeElement;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const dpr = window.devicePixelRatio || 1;
      const w = campo.clientWidth;
      const h = campo.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);
      const particulas = criarParticulas(w, h);
      this.desenhar = () => passo(ctx, particulas, w, h, this.mouse);
      this.desenhar(); // primeiro quadro (também o estático)
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) this.pausado.set(true);
      else this.loop();
    });
    inject(DestroyRef).onDestroy(() => cancelAnimationFrame(this.quadro));
  }

  protected mover(e: PointerEvent): void {
    const r = this.campo().nativeElement.getBoundingClientRect();
    this.mouse.x = e.clientX - r.left;
    this.mouse.y = e.clientY - r.top;
    this.mouse.ativo = true;
  }

  protected sair(): void {
    this.mouse.ativo = false;
  }

  protected alternar(): void {
    this.pausado.update((p) => !p);
    cancelAnimationFrame(this.quadro);
    if (!this.pausado()) this.loop();
  }

  private loop(): void {
    this.desenhar();
    this.quadro = requestAnimationFrame(() => this.loop());
  }
}

const QUANTIDADE = 90;
const DISTANCIA = 90;
const FORCA = -0.6; // negativo repele

function criarParticulas(w: number, h: number): Particula[] {
  return Array.from({ length: QUANTIDADE }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    r: 1 + Math.random() * 2,
  }));
}

function passo(ctx: CanvasRenderingContext2D, ps: Particula[], w: number, h: number, mouse: Mouse): void {
  ctx.clearRect(0, 0, w, h);
  for (const p of ps) {
    // reação ao mouse dentro de um raio de 140px
    if (mouse.ativo) {
      const dx = mouse.x - p.x;
      const dy = mouse.y - p.y;
      const d = Math.hypot(dx, dy) || 1;
      if (d < 140) {
        p.vx += (dx / d) * FORCA * (1 - d / 140);
        p.vy += (dy / d) * FORCA * (1 - d / 140);
      }
    }
    p.vx *= 0.98; // atrito: a velocidade volta ao normal
    p.vy *= 0.98;
    p.x = (p.x + p.vx + 0.15 + w) % w; // deriva leve para a direita e dá a volta
    p.y = (p.y + p.vy + h) % h;
  }
  // linhas entre partículas próximas (constelação)
  for (let i = 0; i < ps.length; i++) {
    for (let j = i + 1; j < ps.length; j++) {
      const d = Math.hypot(ps[i].x - ps[j].x, ps[i].y - ps[j].y);
      if (d < DISTANCIA) {
        ctx.strokeStyle = 'rgb(198 255 61 / ' + (1 - d / DISTANCIA) * 0.35 + ')';
        ctx.beginPath();
        ctx.moveTo(ps[i].x, ps[i].y);
        ctx.lineTo(ps[j].x, ps[j].y);
        ctx.stroke();
      }
    }
  }
  // pontos com brilho
  ctx.shadowColor = '#c6ff3d';
  ctx.shadowBlur = 8;
  ctx.fillStyle = '#e8ffb0';
  for (const p of ps) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.shadowBlur = 0;
}
