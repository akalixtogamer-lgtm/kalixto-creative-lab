import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-slide-in',
  templateUrl: './slide-in.html',
  styleUrl: './slide-in.css',
})
export class SlideIn {
  /** Muda a cada clique em Repetir; o @for recria o elemento animado. */
  protected readonly ciclo = signal(0);

  protected repetir(): void {
    this.ciclo.update((n) => n + 1);
  }
}
