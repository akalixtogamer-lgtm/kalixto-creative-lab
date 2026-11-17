import { Component, signal } from '@angular/core';

interface Camada {
  classe: string;
  velocidade: number;
}

@Component({
  selector: 'app-layered-parallax',
  templateUrl: './layered-parallax.html',
  styleUrl: './layered-parallax.css',
  host: { '(window:scroll)': 'rolou()' },
})
export class LayeredParallax {
  protected readonly camadas: Camada[] = [
    { classe: 'sol', velocidade: 0.6 },
    { classe: 'montanha montanha--fundo', velocidade: 0.35 },
    { classe: 'montanha montanha--meio', velocidade: 0.2 },
    { classe: 'titulo', velocidade: 0.5 },
    { classe: 'montanha montanha--frente', velocidade: 0 },
  ];
  private readonly intensidade = 1;
  private readonly sentido = 1;
  private readonly reduzir = window.matchMedia('(prefers-reduced-motion: reduce)');
  private quadro = 0;

  /** Rolagem atual da janela, em px. */
  protected readonly y = signal(0);

  protected rolou(): void {
    if (this.reduzir.matches) return;
    cancelAnimationFrame(this.quadro);
    this.quadro = requestAnimationFrame(() => this.y.set(window.scrollY));
  }

  protected deslocamento(c: Camada): string {
    return `translateY(${this.y() * c.velocidade * this.intensidade * this.sentido}px)`;
  }
}
