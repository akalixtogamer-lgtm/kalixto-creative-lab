import { Component, DestroyRef, ElementRef, afterNextRender, inject, viewChild } from '@angular/core';

@Component({
  selector: 'app-image-distortion',
  templateUrl: './image-distortion.html',
  styleUrl: './image-distortion.css',
})
export class ImageDistortion {
  protected readonly frequencia = 0.02;
  protected readonly continuo = false;
  private readonly intensidade = 30;
  private readonly velocidade = 1;
  private readonly reduzir = window.matchMedia('(prefers-reduced-motion: reduce)');
  private readonly ruido = viewChild.required<ElementRef<SVGFETurbulenceElement>>('ruido');
  private readonly mapa = viewChild.required<ElementRef<SVGFEDisplacementMapElement>>('mapa');

  private alvo = 0;
  private forca = 0;
  private quadro = 0;

  constructor() {
    inject(DestroyRef).onDestroy(() => cancelAnimationFrame(this.quadro));
    afterNextRender(() => {
      if (this.continuo && !this.reduzir.matches) this.ligar();
    });
  }

  protected ligar(): void {
    this.alvo = this.intensidade;
    if (this.reduzir.matches) {
      this.mapa().nativeElement.setAttribute('scale', String(this.alvo));
      return;
    }
    if (!this.quadro) this.quadro = requestAnimationFrame((t) => this.desenhar(t));
  }

  protected desligar(): void {
    if (this.continuo) return;
    this.alvo = 0;
    if (this.reduzir.matches) {
      this.mapa().nativeElement.setAttribute('scale', '0');
      return;
    }
    if (!this.quadro) this.quadro = requestAnimationFrame((t) => this.desenhar(t));
  }

  private desenhar(t: number): void {
    this.forca += (this.alvo - this.forca) * 0.08;
    const onda = Math.sin((t / 1000) * this.velocidade) * 0.25 + 1;
    this.ruido().nativeElement.setAttribute('baseFrequency', String(this.frequencia * onda));
    this.mapa().nativeElement.setAttribute('scale', this.forca.toFixed(2));
    const parado = this.alvo === 0 && this.forca < 0.1;
    this.quadro = parado ? 0 : requestAnimationFrame((t2) => this.desenhar(t2));
  }
}
