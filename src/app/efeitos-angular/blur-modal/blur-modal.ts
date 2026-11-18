import { Component, ElementRef, viewChild } from '@angular/core';

@Component({
  selector: 'app-blur-modal',
  templateUrl: './blur-modal.html',
  styleUrl: './blur-modal.css',
})
export class BlurModal {
  private readonly janela = viewChild.required<ElementRef<HTMLDialogElement>>('janela');

  protected abrir(): void {
    this.janela().nativeElement.showModal();
  }

  /** Clicar fora da janela (no fundo desfocado) também fecha. */
  protected clicarFora(e: MouseEvent): void {
    if (e.target === this.janela().nativeElement) this.janela().nativeElement.close();
  }
}
