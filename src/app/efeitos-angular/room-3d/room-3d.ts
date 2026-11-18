import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-room-3d',
  templateUrl: './room-3d.html',
  styleUrl: './room-3d.css',
})
export class Room3d {
  protected readonly px = signal('50%');
  protected readonly py = signal('50%');
  protected readonly dentro = signal(false);
  private quadro = 0;

  /** O olhar acompanha o mouse: muda o ponto de fuga (perspective-origin). */
  protected olhar(e: PointerEvent, palco: HTMLElement): void {
    cancelAnimationFrame(this.quadro);
    this.quadro = requestAnimationFrame(() => {
      const r = palco.getBoundingClientRect();
      this.px.set(30 + ((e.clientX - r.left) / r.width) * 40 + '%');
      this.py.set(30 + ((e.clientY - r.top) / r.height) * 40 + '%');
    });
  }
}
