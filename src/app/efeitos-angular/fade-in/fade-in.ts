import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-fade-in',
  templateUrl: './fade-in.html',
  styleUrl: './fade-in.css',
})
export class FadeIn {
  /** Muda a cada clique em Repetir; o @for recria o elemento animado. */
  protected readonly ciclo = signal(0);

  protected repetir(): void {
    this.ciclo.update((n) => n + 1);
  }
}
