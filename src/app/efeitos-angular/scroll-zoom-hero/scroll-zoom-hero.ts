import {
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';

@Component({
  selector: 'app-scroll-zoom-hero',
  templateUrl: './scroll-zoom-hero.html',
  styleUrl: './scroll-zoom-hero.css',
})
export class ScrollZoomHero {
  private readonly hero = viewChild.required<ElementRef<HTMLElement>>('hero');
  /** Progresso da rolagem dentro da seção (0 → 1). */
  protected readonly p = signal(0);

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      let quadro = 0;
      const atualizar = () => {
        quadro = 0;
        const el = this.hero().nativeElement;
        const r = el.getBoundingClientRect();
        this.p.set(Math.min(1, Math.max(0, -r.top / (el.offsetHeight - window.innerHeight))));
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
