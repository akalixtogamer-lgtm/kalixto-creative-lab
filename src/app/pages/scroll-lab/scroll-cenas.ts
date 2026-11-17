import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Valores } from '../../core/models/demo.model';

gsap.registerPlugin(ScrollTrigger);

/**
 * Cenas do Scroll Lab — uma função por demo.
 * Todas usam `scroller` (a janela de rolagem do palco) em vez da página.
 * Rodam dentro de gsap.context(): revert() remove animações, pins e markers.
 */
type Cena = (palco: HTMLElement, scroller: HTMLElement, v: Valores) => void;

const q = (palco: HTMLElement, s: string) => palco.querySelectorAll<HTMLElement>(s);
const um = (palco: HTMLElement, s: string) => palco.querySelector<HTMLElement>(s)!;
const scrub = (v: Valores) => (v['scrub'] === 'true' ? true : Number(v['scrub']));
const bool = (x: unknown) => x === 'true';

export const CENAS: Record<string, Cena> = {
  gatilho: (palco, scroller, v) => {
    gsap.from(q(palco, '.s-card'), {
      x: -160,
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: um(palco, '.s-card'),
        scroller,
        start: String(v['start']),
        toggleActions: String(v['acoes']),
        markers: bool(v['markers']),
      },
    });
  },

  scrub: (palco, scroller, v) => {
    gsap.to(q(palco, '.s-forma'), {
      x: Number(v['dist']),
      rotation: Number(v['voltas']) * 360,
      ease: 'none',
      scrollTrigger: {
        trigger: um(palco, '.s-secao'),
        scroller,
        start: 'top bottom',
        end: 'bottom top',
        scrub: scrub(v),
      },
    });
  },

  pin: (palco, scroller, v) => {
    gsap
      .timeline({
        scrollTrigger: {
          trigger: um(palco, '.s-painel'),
          scroller,
          start: 'top top',
          end: `+=${v['dist']}`,
          pin: true,
          scrub: scrub(v),
          markers: bool(v['markers']),
        },
      })
      .from(q(palco, '.s-barra-fill'), { scaleX: 0, stagger: 0.3, transformOrigin: 'left center', ease: 'none' });
  },

  parallax: (palco, scroller, v) => {
    for (const [seletor, id] of [['.s-fundo', 'fundo'], ['.s-meio', 'meio'], ['.s-frente', 'frente']]) {
      gsap.to(q(palco, seletor), {
        yPercent: Number(v[id]),
        ease: 'none',
        scrollTrigger: {
          trigger: um(palco, '.s-cena'),
          scroller,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    }
  },

  horizontal: (palco, scroller, v) => {
    const faixa = um(palco, '.s-faixa');
    const n = Number(v['paineis']);
    const distancia = () => faixa.scrollWidth - scroller.clientWidth;
    gsap.to(faixa, {
      x: () => -distancia(),
      ease: 'none',
      scrollTrigger: {
        trigger: um(palco, '.s-horizontal'),
        scroller,
        start: 'top top',
        end: () => `+=${distancia()}`,
        pin: true,
        scrub: scrub(v),
        snap: bool(v['snap']) ? 1 / (n - 1) : undefined,
        invalidateOnRefresh: true,
      },
    });
  },

  progresso: (palco, scroller, v) => {
    const contador = um(palco, '.s-contador');
    gsap.to(q(palco, '.s-progresso'), {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: um(palco, '.s-artigo'),
        scroller,
        start: 'top top',
        end: 'bottom bottom',
        scrub: scrub(v),
        onUpdate: (self) => (contador.textContent = `${Math.round(self.progress * 100)}%`),
      },
    });
  },

  storytelling: (palco, scroller, v) => {
    gsap
      .timeline({
        scrollTrigger: {
          trigger: um(palco, '.s-historia'),
          scroller,
          start: 'top top',
          end: '+=1500',
          pin: true,
          scrub: scrub(v),
          snap: bool(v['snap']) ? 'labels' : undefined,
        },
      })
      .addLabel('danca')
      .to(q(palco, '.s-hforma'), { borderRadius: '8px', rotation: 90, backgroundColor: '#8b5cf6' })
      .to(q(palco, '.s-cap-1'), { opacity: 0, y: -20 }, '<')
      .from(q(palco, '.s-cap-2'), { opacity: 0, y: 20 })
      .addLabel('codigo')
      .to(q(palco, '.s-hforma'), { borderRadius: '50%', scale: 1.3, backgroundColor: '#22e3ff' })
      .to(q(palco, '.s-cap-2'), { opacity: 0, y: -20 }, '<')
      .from(q(palco, '.s-cap-3'), { opacity: 0, y: 20 })
      .addLabel('criacao');
  },
};

/** Rola a janela até o fim (botão "Rolar automaticamente"). */
export function rolarAteOFim(scroller: HTMLElement): gsap.core.Tween {
  const fim = scroller.scrollHeight - scroller.clientHeight;
  const duracao = Math.min(6, Math.max(2.5, fim / 400));
  return gsap.fromTo(scroller, { scrollTop: 0 }, { scrollTop: fim, duration: duracao, ease: 'power1.inOut' });
}

export { ScrollTrigger };
