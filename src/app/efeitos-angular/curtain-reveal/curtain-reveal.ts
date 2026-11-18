import { Component, afterNextRender, signal } from '@angular/core';

@Component({
  selector: 'app-curtain-reveal',
  templateUrl: './curtain-reveal.html',
  styleUrl: './curtain-reveal.css',
})
export class CurtainReveal {
  protected readonly aberta = signal(false);

  constructor() {
    // abre logo depois do primeiro desenho (fechada → aberta, com transição)
    afterNextRender(() => requestAnimationFrame(() => this.aberta.set(true)));
  }
}
