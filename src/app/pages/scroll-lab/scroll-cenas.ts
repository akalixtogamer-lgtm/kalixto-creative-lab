import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Valores } from '../../core/models/demo.model';

gsap.registerPlugin(ScrollTrigger);

/**
 * Cenas do Scroll Lab — uma função por demo.
 * Todas usam `scroller` (a janela de rolagem do palco) em vez da página.
 * Rodam dentro de gsap.context(): revert() remove animações, pins e markers.
 */
type Cena = (palco: HTMLElement, scroller: HTMLElement, v: Valores) => void | (() => void);

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

/** navbar: transparente sobre o hero, fixa com fundo e sombra depois dele. */
CENAS['navbar'] = (palco, scroller, v) => {
  const nav = um(palco, '.s-nav');
  nav.style.setProperty('--sombra', `${v['sombra']}px`);
  nav.classList.toggle('s-nav--solido', v['estilo'] === 'solido');
  // O hero "começa" no topo da janela; a barra fixa quando ele termina
  ScrollTrigger.create({
    trigger: um(palco, '.s-hero'),
    scroller,
    start: 'bottom top+=64',
    end: 'max',
    onToggle: (self) => nav.classList.toggle('fixa', self.isActive),
  });
  if (v['comportamento'] === 'esconde') {
    ScrollTrigger.create({
      scroller,
      start: 0,
      end: 'max',
      onUpdate: (self) => nav.classList.toggle('escondida', self.direction === 1 && self.scroll() > 200),
    });
  }
  // gsap.context só desfaz o que o GSAP criou: limpamos as classes na saída
  return () => nav.classList.remove('fixa', 'escondida');
};

/** capítulos: linha do tempo que se preenche + capítulo ativo + imagem com efeito. */
CENAS['capitulos'] = (palco, scroller, v) => {
  const lista = um(palco, '.s-capitulos');
  gsap.fromTo(
    um(palco, '.s-tempo__fill'),
    { scaleY: 0 },
    {
      scaleY: 1,
      ease: 'none',
      transformOrigin: 'top center',
      scrollTrigger: { trigger: lista, scroller, start: 'top center', end: 'bottom center', scrub: scrub(v) },
    },
  );
  const caps = q(palco, '.s-cap-item');
  caps.forEach((cap) => {
    ScrollTrigger.create({
      trigger: cap,
      scroller,
      start: 'top center',
      end: 'bottom center',
      onToggle: (self) => cap.classList.toggle('ativo', self.isActive),
    });
    const img = cap.querySelector('img');
    const st = { trigger: cap, scroller, start: 'top bottom', end: 'bottom top', scrub: true };
    if (img && v['imagem'] === 'zoom') gsap.fromTo(img, { scale: 1.25 }, { scale: 1, ease: 'none', scrollTrigger: st });
    if (img && v['imagem'] === 'parallax') gsap.fromTo(img, { yPercent: -12 }, { yPercent: 12, ease: 'none', scrollTrigger: st });
  });
  return () => caps.forEach((c) => c.classList.remove('ativo'));
};

/** Rola a janela até o fim (botão "Rolar automaticamente"). */
export function rolarAteOFim(scroller: HTMLElement): gsap.core.Tween {
  const fim = scroller.scrollHeight - scroller.clientHeight;
  const duracao = Math.min(6, Math.max(2.5, fim / 400));
  return gsap.fromTo(scroller, { scrollTop: 0 }, { scrollTop: fim, duration: duracao, ease: 'power1.inOut' });
}

export { ScrollTrigger };
