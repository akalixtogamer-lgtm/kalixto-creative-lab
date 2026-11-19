import { Component, ElementRef, afterNextRender, viewChild } from '@angular/core';

@Component({
  selector: 'app-text-scramble',
  templateUrl: './text-scramble.html',
  styleUrl: './text-scramble.css',
})
export class TextScramble {
  protected readonly titulo = 'Código vira movimento';
  protected readonly links = ['Projetos', 'Laboratório', 'Contato'];
  private readonly caracteres = '!<>-_/[]{}=+*^?#';
  private readonly duracao = 1200;
  private readonly reduzir = window.matchMedia('(prefers-reduced-motion: reduce)');
  private readonly quadros = new WeakMap<HTMLElement, number>();
  private readonly alvoTitulo = viewChild.required<ElementRef<HTMLElement>>('alvoTitulo');

  constructor() {
    afterNextRender(() => this.embaralhar(this.alvoTitulo().nativeElement, this.titulo));
  }

  protected repetir(): void {
    this.embaralhar(this.alvoTitulo().nativeElement, this.titulo);
  }

  /** Escreve direto no span (aria-hidden): muda a cada quadro, fora da detecção de mudanças. */
  protected embaralhar(alvo: HTMLElement, final: string): void {
    if (this.reduzir.matches) {
      alvo.textContent = final;
      return;
    }
    cancelAnimationFrame(this.quadros.get(alvo) ?? 0);
    const inicio = performance.now();
    const passo = (agora: number) => {
      const p = Math.min(1, (agora - inicio) / this.duracao);
      let texto = '';
      for (let i = 0; i < final.length; i++) {
        const certo = final[i] === ' ' || i < p * final.length;
        texto += certo
          ? final[i]
          : this.caracteres[Math.floor(Math.random() * this.caracteres.length)];
      }
      alvo.textContent = texto;
      if (p < 1) this.quadros.set(alvo, requestAnimationFrame(passo));
    };
    this.quadros.set(alvo, requestAnimationFrame(passo));
  }
}
