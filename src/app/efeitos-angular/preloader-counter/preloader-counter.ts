import { Component, DestroyRef, afterNextRender, inject, signal } from '@angular/core';

@Component({
  selector: 'app-preloader-counter',
  templateUrl: './preloader-counter.html',
  styleUrl: './preloader-counter.css',
})
export class PreloaderCounter {
  private readonly duracao = 2000;
  private readonly reduzir = window.matchMedia('(prefers-reduced-motion: reduce)');
  private quadro = 0;

  protected readonly p = signal(0);
  protected readonly pronto = signal(false);

  constructor() {
    afterNextRender(() => this.carregar());
    inject(DestroyRef).onDestroy(() => cancelAnimationFrame(this.quadro));
  }

  protected carregar(): void {
    cancelAnimationFrame(this.quadro);
    this.pronto.set(false);
    if (this.reduzir.matches) return this.terminar();
    const suave = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
    const inicio = performance.now();
    const passo = (agora: number) => {
      const p = suave(Math.min(1, (agora - inicio) / this.duracao));
      this.p.set(p);
      if (p < 1) this.quadro = requestAnimationFrame(passo);
      else this.terminar();
    };
    this.quadro = requestAnimationFrame(passo);
  }

  private terminar(): void {
    this.p.set(1);
    this.pronto.set(true);
  }
}
