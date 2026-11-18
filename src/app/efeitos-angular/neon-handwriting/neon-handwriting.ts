import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-neon-handwriting',
  templateUrl: './neon-handwriting.html',
  styleUrl: './neon-handwriting.css',
})
export class NeonHandwriting {
  /** Muda a cada clique em Repetir; o @for recria o elemento animado. */
  protected readonly ciclo = signal(0);

  protected repetir(): void {
    this.ciclo.update((n) => n + 1);
  }
}
