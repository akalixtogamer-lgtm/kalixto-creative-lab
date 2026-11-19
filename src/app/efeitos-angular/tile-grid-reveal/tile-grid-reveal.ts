import { Component, signal } from '@angular/core';

interface Celula {
  d: string;
  l: string;
}

@Component({
  selector: 'app-tile-grid-reveal',
  templateUrl: './tile-grid-reveal.html',
  styleUrl: './tile-grid-reveal.css',
})
export class TileGridReveal {
  /** Muda a cada Repetir: o @for recria as células e as animações recomeçam. */
  protected readonly ciclo = signal(0);
  protected readonly celulas = signal(this.criar());

  protected repetir(): void {
    this.celulas.set(this.criar());
    this.ciclo.update((n) => n + 1);
  }

  private criar(): Celula[] {
    const colunas = 16;
    const linhas = Math.round(colunas * 0.6);
    const lista: Celula[] = [];
    for (let l = 0; l < linhas; l++) {
      for (let c = 0; c < colunas; c++) {
        lista.push({
          d: Math.random().toFixed(3),
          l: 8 + Math.round(Math.random() * 24) + '%',
        });
      }
    }
    return lista;
  }
}
