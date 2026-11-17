import { Component, DestroyRef, ElementRef, afterNextRender, inject } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-gsap-scroll-reveal',
  templateUrl: './gsap-scroll-reveal.html',
  styleUrl: './gsap-scroll-reveal.css',
})
export class GsapScrollReveal {
  protected readonly cards = ["Timeline", "Stagger", "Easing", "ScrollTrigger", "Batch", "Scrub"];

  constructor() {
    const host = inject(ElementRef<HTMLElement>).nativeElement;
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      // matchMedia reverte tudo sozinho quando a preferência muda ou no revert()
      const mm = gsap.matchMedia(host);
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const cards = host.querySelectorAll('.card');
        gsap.set(cards, { opacity: 0, y: 60 });
    ScrollTrigger.batch(cards, {
      start: 'top 85%',
      onEnter: (lote) =>
        gsap.to(lote, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.12, overwrite: true }),
    });
      });
      destroyRef.onDestroy(() => mm.revert());
    });
  }
}
