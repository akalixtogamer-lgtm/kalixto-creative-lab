import { Component, DestroyRef, ElementRef, afterNextRender, inject, viewChildren } from '@angular/core';

@Component({
  selector: 'app-sticky-stack',
  templateUrl: './sticky-stack.html',
  styleUrl: './sticky-stack.css',
})
export class StickyStack {
  protected readonly cards = [{titulo: 'Estratégia', cor: '#2a1f6b'}, {titulo: 'Design', cor: '#7c3aed'}, {titulo: 'Código', cor: '#ff2bd6'}, {titulo: 'Lançamento', cor: '#22e3ff'}];
  private readonly elementos = viewChildren<ElementRef<HTMLElement>>('card');
  private readonly encolher = 0.9;
  private readonly degrau = 24;

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const reduzir = window.matchMedia('(prefers-reduced-motion: reduce)');
      let quadro = 0;
      const atualizar = () => {
        quadro = 0;
        if (reduzir.matches) return;
        const lista = this.elementos().map((e) => e.nativeElement);
        const topo = window.innerHeight * 0.12;
        lista.forEach((card, i) => {
          const proximo = lista[i + 1];
          if (!proximo) return;
          const onde = proximo.getBoundingClientRect().top - (topo + i * this.degrau);
          const p = Math.min(1, Math.max(0, 1 - (onde - this.degrau) / (window.innerHeight - topo)));
          card.style.scale = String(1 - (1 - this.encolher) * p);
          card.style.filter = 'brightness(' + (1 - 0.5 * p) + ')';
        });
      };
      const aoRolar = () => {
        if (!quadro) quadro = requestAnimationFrame(atualizar);
      };
      window.addEventListener('scroll', aoRolar, { passive: true });
      atualizar();
      destroyRef.onDestroy(() => window.removeEventListener('scroll', aoRolar));
    });
  }
}
