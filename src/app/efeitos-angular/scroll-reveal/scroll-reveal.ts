import { Component, DestroyRef, ElementRef, afterNextRender, inject, signal, viewChildren } from '@angular/core';

@Component({
  selector: 'app-scroll-reveal',
  templateUrl: './scroll-reveal.html',
  styleUrl: './scroll-reveal.css',
  host: { class: 'js' },
})
export class ScrollReveal {
  protected readonly cards = ["Descobrir", "Experimentar", "Entender", "Modificar", "Reutilizar", "Criar"];
  private readonly soUmaVez = true;
  private readonly elementos = viewChildren<ElementRef<HTMLElement>>('revelar');
  /** Índices dos cards visíveis. */
  protected readonly visiveis = signal(new Set<number>());

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const observador = new IntersectionObserver((entradas) => {
        for (const entrada of entradas) {
          const i = Number((entrada.target as HTMLElement).dataset['i']);
          if (entrada.isIntersecting) {
            this.visiveis.update((s) => new Set(s).add(i));
            if (this.soUmaVez) observador.unobserve(entrada.target);
          } else if (!this.soUmaVez) {
            this.visiveis.update((s) => {
              const n = new Set(s);
              n.delete(i);
              return n;
            });
          }
        }
      }, { threshold: 0.2 });
      this.elementos().forEach((e) => observador.observe(e.nativeElement));
      destroyRef.onDestroy(() => observador.disconnect());
    });
  }
}
