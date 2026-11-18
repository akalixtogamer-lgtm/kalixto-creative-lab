import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-echo-text',
  templateUrl: './echo-text.html',
  styleUrl: './echo-text.css',
})
export class EchoText {
  protected readonly titulo = 'Site completo';
  protected readonly preco = 'R$ 3.000';
  /** Posição de cada eco (1, 2, 3…). */
  protected readonly ecos = Array.from({ length: 4 }, (_, i) => i + 1);
  /** Muda a cada Repetir: o @for recria os ecos e as animações recomeçam. */
  protected readonly ciclo = signal(0);

  protected repetir(): void {
    this.ciclo.update((n) => n + 1);
  }
}
