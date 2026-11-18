import { Component, DestroyRef, computed, inject, signal } from '@angular/core';

@Component({
  selector: 'app-rotating-headline',
  templateUrl: './rotating-headline.html',
  styleUrl: './rotating-headline.css',
})
export class RotatingHeadline {
  protected readonly frases = ['O mundo pode esperar.', 'Dias que começam sem pressa.', 'Sinta o lugar. Viva o agora.', 'Fique mais um instante.'];
  private readonly reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  private readonly tempo = 3500;

  protected readonly atual = signal(0);
  protected readonly saindo = signal(false);
  protected readonly pausado = signal(false);
  protected readonly palavras = computed(() => this.frases[this.atual()].split(' '));

  constructor() {
    const id = setInterval(() => this.proxima(), this.reduzir ? this.tempo * 2 : this.tempo);
    inject(DestroyRef).onDestroy(() => clearInterval(id));
  }

  private proxima(): void {
    if (this.pausado()) return;
    this.saindo.set(true);
    setTimeout(() => {
      this.atual.update((i) => (i + 1) % this.frases.length);
      this.saindo.set(false);
    }, this.reduzir ? 0 : 600);
  }
}
