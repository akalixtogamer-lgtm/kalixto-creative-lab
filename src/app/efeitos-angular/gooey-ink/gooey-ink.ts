import { Component, signal } from '@angular/core';

interface Pingo {
  id: number;
  x: string;
  y: string;
  s: string;
}

@Component({
  selector: 'app-gooey-ink',
  templateUrl: './gooey-ink.html',
  styleUrl: './gooey-ink.css',
})
export class GooeyInk {
  protected readonly gotas = [{dx: 0, dy: 26, s: 70}, {dx: 23, dy: -3, s: 107}, {dx: -34, dy: -25, s: 84}, {dx: 27, dy: 10, s: 121}, {dx: -6, dy: 23, s: 98}, {dx: -18, dy: -16, s: 75}];
  protected readonly pingos = signal<Pingo[]>([]);
  private proximo = 0;

  protected pingar(e: PointerEvent, papel: HTMLElement): void {
    const r = papel.getBoundingClientRect();
    const novo: Pingo = {
      id: this.proximo++,
      x: e.clientX - r.left + 'px',
      y: e.clientY - r.top + 'px',
      s: 60 + Math.random() * 90 + 'px',
    };
    // limita a quantidade: o filtro fica mais caro a cada gota
    this.pingos.update((lista) => [...lista, novo].slice(-8));
  }
}
