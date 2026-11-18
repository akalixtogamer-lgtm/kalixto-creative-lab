import { Component, DestroyRef, afterNextRender, inject } from '@angular/core';
import Lenis from 'lenis';

@Component({
  selector: 'app-smooth-scroll',
  templateUrl: './smooth-scroll.html',
  styleUrl: './smooth-scroll.css',
})
export class SmoothScroll {
  protected readonly secoes = ['Experimente', 'Entenda', 'Codifique', 'Crie'];
  private lenis?: Lenis;

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      this.lenis = new Lenis({ duration: 1.2, wheelMultiplier: 1, autoRaf: true });
      destroyRef.onDestroy(() => this.lenis?.destroy());
    });
  }

  protected irPara(e: Event, alvo: string): void {
    if (!this.lenis) return; // sem Lenis, o link segue o comportamento nativo
    e.preventDefault();
    this.lenis.scrollTo(alvo, { offset: -60 });
  }
}
