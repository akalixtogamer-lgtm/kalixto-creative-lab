import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-scale-reveal',
  templateUrl: './scale-reveal.html',
  styleUrl: './scale-reveal.css',
})
export class ScaleReveal {
  /** Muda a cada clique em Repetir; o @for recria o elemento animado. */
  protected readonly ciclo = signal(0);

  protected repetir(): void {
    this.ciclo.update((n) => n + 1);
  }
}
