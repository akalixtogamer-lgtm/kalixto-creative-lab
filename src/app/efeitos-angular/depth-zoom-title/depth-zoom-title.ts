import {
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';

interface Camada {
  tipo: 'fundo' | 'sujeito' | 'letra';
  texto: string;
  z: number;
  x: number;
  y: number;
}

@Component({
  selector: 'app-depth-zoom-title',
  templateUrl: './depth-zoom-title.html',
  styleUrl: './depth-zoom-title.css',
})
export class DepthZoomTitle {
  private readonly profundidade = 2.6;
  private readonly secao = viewChild.required<ElementRef<HTMLElement>>('secao');
  /** Da mais longe para a mais perto (a ordem vira o z-index). */
  protected readonly camadas: Camada[] = [
    { tipo: 'fundo', texto: '', z: 9, x: 0, y: 0 },
    { tipo: 'letra', texto: 'O', z: 3.6, x: -36, y: 0 },
    { tipo: 'letra', texto: 'I', z: 3.6, x: -7.2, y: 0 },
    { tipo: 'letra', texto: 'E', z: 3.6, x: 21.6, y: 0 },
    { tipo: 'sujeito', texto: '', z: 3, x: 0, y: 4 },
    { tipo: 'letra', texto: 'R', z: 2.3, x: -21.6, y: 0 },
    { tipo: 'letra', texto: 'G', z: 2.3, x: 7.2, y: 0 },
    { tipo: 'letra', texto: 'M', z: 2.3, x: 36, y: 0 },
  ];
  protected readonly p = signal(0);
  /** Transform e opacidade de cada camada, recalculados na rolagem. */
  protected readonly estilos = signal(this.camadas.map(() => ({ transform: '', opacity: 1 })));

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      let quadro = 0;
      const atualizar = () => {
        quadro = 0;
        const el = this.secao().nativeElement;
        const r = el.getBoundingClientRect();
        const p = reduzir
          ? 0
          : Math.min(1, Math.max(0, -r.top / (el.offsetHeight - window.innerHeight)));
        this.p.set(p);
        const c = p * this.profundidade;
        this.estilos.set(
          this.camadas.map((k) => {
            const d = k.z - c;
            if (d <= 0.15) return { transform: 'scale(0)', opacity: 0 };
            const s = k.z / d;
            return {
              transform: `translate(${(k.x * s).toFixed(2)}vw, ${(k.y * s).toFixed(2)}vh) scale(${s.toFixed(3)})`,
              opacity: Math.min(1, (d - 0.15) / 0.45),
            };
          }),
        );
      };
      const aoRolar = () => {
        if (!quadro) quadro = requestAnimationFrame(atualizar);
      };
      window.addEventListener('scroll', aoRolar, { passive: true });
      atualizar();
      destroyRef.onDestroy(() => {
        window.removeEventListener('scroll', aoRolar);
        cancelAnimationFrame(quadro);
      });
    });
  }
}
