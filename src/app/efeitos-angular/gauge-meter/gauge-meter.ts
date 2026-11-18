import { Component, DestroyRef, afterNextRender, inject, signal } from '@angular/core';

@Component({
  selector: 'app-gauge-meter',
  templateUrl: './gauge-meter.html',
  styleUrl: './gauge-meter.css',
})
export class GaugeMeter {
  protected readonly valor = 82;
  private readonly duracao = 1600;
  private quadro = 0;

  protected readonly cheio = signal(false);
  protected readonly mostrado = signal(0);

  constructor() {
    afterNextRender(() => this.encher());
    inject(DestroyRef).onDestroy(() => cancelAnimationFrame(this.quadro));
  }

  protected encher(): void {
    cancelAnimationFrame(this.quadro);
    this.cheio.set(false);
    this.mostrado.set(0);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.cheio.set(true);
      this.mostrado.set(this.valor);
      return;
    }
    const suave = (t: number) => 1 - (1 - t) ** 3;
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        this.cheio.set(true);
        const inicio = performance.now();
        const passo = (agora: number) => {
          const t = Math.min(1, (agora - inicio) / this.duracao);
          this.mostrado.set(Math.round(suave(t) * this.valor));
          if (t < 1) this.quadro = requestAnimationFrame(passo);
        };
        this.quadro = requestAnimationFrame(passo);
      }),
    );
  }
}
