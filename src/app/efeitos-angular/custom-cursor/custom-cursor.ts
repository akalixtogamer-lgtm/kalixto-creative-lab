import { Component, ElementRef, signal, viewChild } from '@angular/core';

@Component({
  selector: 'app-custom-cursor',
  templateUrl: './custom-cursor.html',
  styleUrl: './custom-cursor.css',
  host: {
    '(window:pointermove)': 'mover($event)',
    '(document:pointerover)': 'sobre($event)',
    '(document:pointerout)': 'sair($event)',
  },
})
export class CustomCursor {
  private readonly suavidade = 0.15;
  private readonly reduzir = window.matchMedia('(prefers-reduced-motion: reduce)');
  private readonly ponto = viewChild.required<ElementRef<HTMLElement>>('ponto');
  private readonly anel = viewChild.required<ElementRef<HTMLElement>>('anel');
  private mx = 0;
  private my = 0;
  private ax = 0;
  private ay = 0;
  private quadro = 0;

  protected readonly ativo = signal(false);
  protected readonly sobreClicavel = signal(false);

  protected mover(e: PointerEvent): void {
    if (e.pointerType !== 'mouse') return;
    this.mx = e.clientX;
    this.my = e.clientY;
    // escrita direta no estilo: muda a cada evento, sem passar pela detecção de mudanças
    this.ponto().nativeElement.style.transform = `translate(${this.mx}px, ${this.my}px)`;
    this.ativo.set(true);
    if (!this.quadro) this.quadro = requestAnimationFrame(() => this.seguir());
  }

  protected sobre(e: PointerEvent): void {
    this.sobreClicavel.set(!!(e.target as Element).closest?.('a, button'));
  }

  /** relatedTarget nulo = o ponteiro saiu da janela. */
  protected sair(e: PointerEvent): void {
    if (!e.relatedTarget) this.ativo.set(false);
  }

  private seguir(): void {
    const s = this.reduzir.matches ? 1 : this.suavidade;
    this.ax += (this.mx - this.ax) * s;
    this.ay += (this.my - this.ay) * s;
    this.anel().nativeElement.style.transform = `translate(${this.ax}px, ${this.ay}px)`;
    this.quadro = Math.hypot(this.mx - this.ax, this.my - this.ay) > 0.1 ? requestAnimationFrame(() => this.seguir()) : 0;
  }
}
