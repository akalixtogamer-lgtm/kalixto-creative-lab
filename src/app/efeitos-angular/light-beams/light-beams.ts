import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-light-beams',
  templateUrl: './light-beams.html',
  styleUrl: './light-beams.css',
})
export class LightBeams {
  /** Posição horizontal de cada feixe (distribuídos pela largura). */
  protected readonly feixes = Array.from(
    { length: 4 },
    (_, i) => Math.round(((i + 1) / 5) * 100) + '%',
  );
  protected readonly pausado = signal(false);
}
