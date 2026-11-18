import { Component, ElementRef, afterNextRender, signal, viewChild } from '@angular/core';

@Component({
  selector: 'app-lens-focus',
  templateUrl: './lens-focus.html',
  styleUrl: './lens-focus.css',
})
export class LensFocus {
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
