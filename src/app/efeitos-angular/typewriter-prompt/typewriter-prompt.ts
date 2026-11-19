import { Component, DestroyRef, afterNextRender, inject, signal } from '@angular/core';

type Estado = 'digitando' | 'gerando' | 'pronto';

@Component({
  selector: 'app-typewriter-prompt',
  templateUrl: './typewriter-prompt.html',
  styleUrl: './typewriter-prompt.css',
})
export class TypewriterPrompt {
  protected readonly texto = 'Crie uma página de vendas para um lançamento imobiliário';
  private readonly velocidade = 45;
  private readonly geracao = 2000;
  private readonly reduzir = window.matchMedia('(prefers-reduced-motion: reduce)');
  private temporizador = 0;
  private quadro = 0;

  protected readonly digitado = signal('');
  protected readonly estado = signal<Estado>('digitando');
  protected readonly p = signal(0);

  protected readonly rotulos: Record<Estado, string> = {
    digitando: 'Escrevendo…',
    gerando: 'Gerando…',
    pronto: 'Pronto',
  };

  constructor() {
    afterNextRender(() => this.comecar());
    inject(DestroyRef).onDestroy(() => {
      clearTimeout(this.temporizador);
      cancelAnimationFrame(this.quadro);
    });
  }

  protected comecar(): void {
    clearTimeout(this.temporizador);
    cancelAnimationFrame(this.quadro);
    this.p.set(0);
    this.estado.set('digitando');
    if (this.reduzir.matches) {
      this.digitado.set(this.texto);
      return this.gerar();
    }
    let n = 0;
    const digitar = () => {
      this.digitado.set(this.texto.slice(0, ++n));
      this.temporizador = window.setTimeout(
        n < this.texto.length ? digitar : () => this.gerar(),
        n < this.texto.length ? this.velocidade : 400,
      );
    };
    digitar();
  }

  private gerar(): void {
    this.estado.set('gerando');
    const inicio = performance.now();
    const passo = (agora: number) => {
      const p = this.reduzir.matches ? 1 : Math.min(1, (agora - inicio) / this.geracao);
      this.p.set(p);
      if (p < 1) this.quadro = requestAnimationFrame(passo);
      else this.estado.set('pronto');
    };
    this.quadro = requestAnimationFrame(passo);
  }
}
