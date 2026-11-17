import { Component, ElementRef, signal, viewChild } from '@angular/core';

@Component({
  selector: 'app-card-tilt',
  templateUrl: './card-tilt.html',
  styleUrl: './card-tilt.css',
})
export class CardTilt {
  private readonly inclinacao = 12; // graus
  protected readonly escala = 1.03;
  private readonly reduzir = window.matchMedia('(prefers-reduced-motion: reduce)');
  private readonly card = viewChild.required<ElementRef<HTMLElement>>('card');
  private quadro = 0;

  protected readonly ativo = signal(false);
  protected readonly rx = signal<string | null>(null);
  protected readonly ry = signal<string | null>(null);
  protected readonly x = signal('50%');
  protected readonly y = signal('50%');

  protected mover(e: PointerEvent): void {
    if (this.reduzir.matches || e.pointerType !== 'mouse') return;
    cancelAnimationFrame(this.quadro);
    this.quadro = requestAnimationFrame(() => {
      const r = this.card().nativeElement.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5; // -0,5 … 0,5
      const py = (e.clientY - r.top) / r.height - 0.5;
      this.ativo.set(true);
      this.ry.set(px * this.inclinacao * 2 + 'deg');
      this.rx.set(-py * this.inclinacao * 2 + 'deg');
      this.x.set((px + 0.5) * 100 + '%');
      this.y.set((py + 0.5) * 100 + '%');
    });
  }

  protected sair(): void {
    cancelAnimationFrame(this.quadro);
    this.ativo.set(false);
    this.rx.set(null);
    this.ry.set(null);
  }
}
