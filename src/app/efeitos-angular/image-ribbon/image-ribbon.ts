import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-image-ribbon',
  templateUrl: './image-ribbon.html',
  styleUrl: './image-ribbon.css',
})
export class ImageRibbon {
  protected readonly total = 10;
  protected readonly pausada = signal(false);

  /** Um degradê por card, com o matiz espalhado pelo círculo de cores. */
  protected readonly cards = Array.from({ length: this.total }, (_, i) => {
    const matiz = Math.round((i * 360) / this.total);
    return `linear-gradient(135deg, hsl(${matiz} 85% 62%), hsl(${matiz + 40} 80% 35%))`;
  });
}
