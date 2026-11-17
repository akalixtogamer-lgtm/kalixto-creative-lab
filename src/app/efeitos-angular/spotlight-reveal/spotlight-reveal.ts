import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-spotlight-reveal',
  templateUrl: './spotlight-reveal.html',
  styleUrl: './spotlight-reveal.css',
})
export class SpotlightReveal {
  protected readonly x = signal('50%');
  protected readonly y = signal('50%');
  protected readonly acesa = signal(false);
  private quadro = 0;

  protected mover(e: PointerEvent, palco: HTMLElement): void {
    cancelAnimationFrame(this.quadro);
    this.quadro = requestAnimationFrame(() => {
      const r = palco.getBoundingClientRect();
      this.x.set(e.clientX - r.left + 'px');
      this.y.set(e.clientY - r.top + 'px');
    });
  }
}
