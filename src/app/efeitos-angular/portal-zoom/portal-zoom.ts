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
  selector: 'app-portal-zoom',
  templateUrl: './portal-zoom.html',
  styleUrl: './portal-zoom.css',
})
export class PortalZoom {
  private readonly secao = viewChild.required<ElementRef<HTMLElement>>('secao');
  /** Progresso da rolagem dentro da seção (0 → 1). */
  protected readonly p = signal(0);

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      let quadro = 0;
      const atualizar = () => {
        quadro = 0;
        const el = this.secao().nativeElement;
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
