import { Component, ElementRef, afterNextRender, signal, viewChild } from '@angular/core';

@Component({
  selector: 'app-liquid-glass-lens',
  templateUrl: './liquid-glass-lens.html',
  styleUrl: './liquid-glass-lens.css',
})
export class LiquidGlassLens {
  protected readonly nome = 'Kalixto Lab';
  private readonly palco = viewChild.required<ElementRef<HTMLElement>>('palco');
  private quadro = 0;

  protected readonly x = signal('50%');
  protected readonly y = signal('50%');

  constructor() {
    afterNextRender(() => {
      const r = this.palco().nativeElement.getBoundingClientRect();
      this.mirar(r.width / 2, r.height / 2);
    });
  }

  protected mover(e: PointerEvent): void {
    cancelAnimationFrame(this.quadro);
    this.quadro = requestAnimationFrame(() => {
      const r = this.palco().nativeElement.getBoundingClientRect();
      this.mirar(e.clientX - r.left, e.clientY - r.top);
    });
  }

  private mirar(x: number, y: number): void {
    this.x.set(x + 'px');
    this.y.set(y + 'px');
  }
}
