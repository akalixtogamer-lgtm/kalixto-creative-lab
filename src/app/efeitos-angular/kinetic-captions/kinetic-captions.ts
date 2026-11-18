import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-kinetic-captions',
  templateUrl: './kinetic-captions.html',
  styleUrl: './kinetic-captions.css',
})
export class KineticCaptions {
  protected readonly frase = 'A diferença entre o designer e o criador está no movimento';
  protected readonly palavras = this.frase.split(' ');

  /** Muda a cada clique em Repetir; o @for recria as palavras e a animação recomeça. */
  protected readonly ciclo = signal(0);

  protected repetir(): void {
    this.ciclo.update((n) => n + 1);
  }
}
