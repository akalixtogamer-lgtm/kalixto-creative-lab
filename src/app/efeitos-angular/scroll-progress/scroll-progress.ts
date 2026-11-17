import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-scroll-progress',
  templateUrl: './scroll-progress.html',
  styleUrl: './scroll-progress.css',
  host: { '(window:scroll)': 'rolou()' },
})
export class ScrollProgress {
  /** De 0 a 1: quanto da página já foi rolado. */
  protected readonly progresso = signal(0);
  private readonly usaCss = CSS.supports('animation-timeline: scroll()');
  private quadro = 0;

  protected rolou(): void {
    if (this.usaCss) return; // o CSS já cuida da barra
    cancelAnimationFrame(this.quadro);
    this.quadro = requestAnimationFrame(() => {
      const rolavel = document.documentElement.scrollHeight - window.innerHeight;
      this.progresso.set(rolavel > 0 ? window.scrollY / rolavel : 0);
    });
  }
}
