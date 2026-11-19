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
  selector: 'app-frosted-navbar',
  templateUrl: './frosted-navbar.html',
  styleUrl: './frosted-navbar.css',
})
export class FrostedNavbar {
  private readonly sensor = viewChild.required<ElementRef<HTMLElement>>('sensor');
  protected readonly vidro = signal(false);

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      // quando o sensor do topo sai da tela, a pessoa rolou: liga o vidro
      const observador = new IntersectionObserver(([entrada]) =>
        this.vidro.set(!entrada.isIntersecting),
      );
      observador.observe(this.sensor().nativeElement);
      destroyRef.onDestroy(() => observador.disconnect());
    });
  }
}
