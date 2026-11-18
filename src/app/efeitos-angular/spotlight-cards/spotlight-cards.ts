import { Component, ElementRef, viewChildren } from '@angular/core';

@Component({
  selector: 'app-spotlight-cards',
  templateUrl: './spotlight-cards.html',
  styleUrl: './spotlight-cards.css',
})
export class SpotlightCards {
  protected readonly cards = [
    {
      titulo: 'Rápido',
      texto: 'Tudo carrega em menos de um segundo.'
    },
    {
      titulo: 'Acessível',
      texto: 'Teclado, leitor de tela e contraste.'
    },
    {
      titulo: 'Animado',
      texto: 'Movimento com propósito.'
    },
    {
      titulo: 'Seu',
      texto: 'Código aberto para copiar.'
    }
  ];
  private readonly elementos = viewChildren<ElementRef<HTMLElement>>('card');
  private quadro = 0;

  /** Escrita direta no estilo de cada card: muda a cada movimento. */
  protected mover(e: PointerEvent): void {
    cancelAnimationFrame(this.quadro);
    this.quadro = requestAnimationFrame(() => {
      for (const { nativeElement: card } of this.elementos()) {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', e.clientX - r.left + 'px');
        card.style.setProperty('--my', e.clientY - r.top + 'px');
      }
    });
  }
}
