import { Component, signal } from '@angular/core';

/** Uma parte do texto (letra ou palavra) e sua posição na sequência. */
interface Parte {
  texto: string;
  i: number;
}

@Component({
  selector: 'app-text-reveal',
  templateUrl: './text-reveal.html',
  styleUrl: './text-reveal.css',
})
export class TextReveal {
  protected readonly texto = 'Experimente. Entenda. Codifique.';
  private readonly modo: 'letras' | 'palavras' = 'letras';

  /** Muda a cada clique em Repetir; o @for recria as partes e a animação recomeça. */
  protected readonly ciclo = signal(0);

  /** Palavras, cada uma com suas partes (letras ou a palavra inteira). */
  protected readonly palavras: Parte[][] = this.dividir();

  protected repetir(): void {
    this.ciclo.update((n) => n + 1);
  }

  private dividir(): Parte[][] {
    let i = 0;
    return this.texto
      .split(' ')
      .map((palavra) =>
        this.modo === 'letras'
          ? [...palavra].map((letra) => ({ texto: letra, i: i++ }))
          : [{ texto: palavra, i: i++ }],
      );
  }
}
