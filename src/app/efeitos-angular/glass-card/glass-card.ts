import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-glass-card',
  templateUrl: './glass-card.html',
  styleUrl: './glass-card.css',
})
export class GlassCard {
  private readonly reduzir = window.matchMedia('(prefers-reduced-motion: reduce)');
  private quadro = 0;

  protected readonly rx = signal('30%');
  protected readonly ry = signal('0%');

  /** O reflexo segue o ponteiro sobre o card. */
  protected mover(e: PointerEvent, vidro: HTMLElement): void {
    if (this.reduzir.matches) return;
    cancelAnimationFrame(this.quadro);
    this.quadro = requestAnimationFrame(() => {
      const r = vidro.getBoundingClientRect();
      this.rx.set(((e.clientX - r.left) / r.width) * 100 + '%');
      this.ry.set(((e.clientY - r.top) / r.height) * 100 + '%');
    });
  }
}
