import { Component, ElementRef, signal, viewChild } from '@angular/core';

@Component({
  selector: 'app-magnetic-button',
  templateUrl: './magnetic-button.html',
  styleUrl: './magnetic-button.css',
  host: {
    '(window:pointermove)': 'mover($event)',
    '(document:pointerout)': 'sairDaJanela($event)',
  },
})
export class MagneticButton {
  private readonly forca = 0.4; // fração da distância que o botão anda
  private readonly alcance = 80; // px além da borda do botão
  private readonly reduzir = window.matchMedia('(prefers-reduced-motion: reduce)');
  private readonly botao = viewChild.required<ElementRef<HTMLButtonElement>>('botao');
  private quadro = 0;

  protected readonly atraindo = signal(false);
  protected readonly deslocamento = signal('');

  protected mover(e: PointerEvent): void {
    if (this.reduzir.matches || e.pointerType !== 'mouse') return;
    cancelAnimationFrame(this.quadro);
    this.quadro = requestAnimationFrame(() => {
      const r = this.botao().nativeElement.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const limite = this.alcance + Math.max(r.width, r.height) / 2;

      if (Math.hypot(dx, dy) < limite) {
        this.atraindo.set(true);
        this.deslocamento.set(`translate(${dx * this.forca}px, ${dy * this.forca}px)`);
      } else {
        this.soltar();
      }
    });
  }

  /** O ponteiro saiu da janela (relatedTarget nulo): o botão volta ao lugar. */
  protected sairDaJanela(e: PointerEvent): void {
    if (!e.relatedTarget) this.soltar();
  }

  private soltar(): void {
    this.atraindo.set(false);
    this.deslocamento.set('');
  }
}
