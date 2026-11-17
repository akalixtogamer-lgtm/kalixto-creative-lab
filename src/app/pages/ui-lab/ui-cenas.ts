import { gsap } from 'gsap';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { MASCARAS } from '../../core/data/ui-demos.data';
import { Valores } from '../../core/models/demo.model';

gsap.registerPlugin(DrawSVGPlugin, MotionPathPlugin);

/**
 * Cenas do Interface Lab.
 *  - montar(palco, v): prepara a demo (eventos, animações contínuas). Roda ao
 *    entrar na demo e sempre que um controle muda. Pode devolver uma limpeza.
 *  - executar(palco, v): o botão principal (entradas, contagens…).
 * Tudo roda dentro de gsap.context(): revert() desfaz animações e estilos.
 */
export interface CenaUI {
  montar?(palco: HTMLElement, v: Valores): void | (() => void);
  executar?(palco: HTMLElement, v: Valores): void;
}

const q = (palco: HTMLElement, s: string) => [...palco.querySelectorAll<HTMLElement>(s)];
const um = <T extends Element = HTMLElement>(palco: HTMLElement, s: string) => palco.querySelector<T>(s)!;

/** Posição do ponteiro de -0.5 a 0.5 em relação ao palco. */
function mouseRelativo(palco: HTMLElement, e: PointerEvent) {
  const r = palco.getBoundingClientRect();
  return { x: (e.clientX - r.left) / r.width - 0.5, y: (e.clientY - r.top) / r.height - 0.5 };
}

const formatar = (n: number, decimal: boolean) =>
  n.toLocaleString('pt-BR', { minimumFractionDigits: decimal ? 1 : 0, maximumFractionDigits: decimal ? 1 : 0 });

export const CENAS_UI: Record<string, CenaUI> = {
  'hero-editorial': {
    executar: (palco, v) => {
      const mascara = v['entrada'] === 'mascara';
      gsap
        .timeline({ defaults: { duration: Number(v['dur']), ease: 'power3.out' } })
        .from(q(palco, '.u-nav__links > span, .u-nav__marca'), { y: -20, opacity: 0, stagger: 0.08 })
        .from(q(palco, '.u-linha > span'), mascara ? { yPercent: 105, stagger: 0.12 } : { y: 40, opacity: 0, stagger: 0.12 }, '-=0.4')
        .from(q(palco, '.u-divisoria'), { scaleX: 0, transformOrigin: 'left center' }, '-=0.5')
        .from(q(palco, '.u-hero__texto, .u-cta'), { y: 20, opacity: 0, stagger: 0.1 }, '-=0.5')
        .from(q(palco, '.u-scroll'), { opacity: 0 }, '-=0.3');
    },
  },

  orbita: {
    montar: (palco, v) => {
      const trilha = um<SVGPathElement>(palco, '.u-trilha');
      gsap.to(um(palco, '.u-planeta'), {
        motionPath: { path: trilha, align: trilha, alignOrigin: [0.5, 0.5] },
        duration: Number(v['vel']),
        repeat: -1,
        ease: 'none',
      });
      const camadas = q(palco, '[data-profundidade]').map((el) => ({
        x: gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3' }),
        y: gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3' }),
        p: Number(el.dataset['profundidade']),
      }));
      const forca = Number(v['profundidade']);
      const mover = (e: PointerEvent) => {
        const m = mouseRelativo(palco, e);
        camadas.forEach((c) => {
          c.x(m.x * forca * c.p);
          c.y(m.y * forca * c.p);
        });
      };
      palco.addEventListener('pointermove', mover);
      return () => palco.removeEventListener('pointermove', mover);
    },
  },

  'texto-profundidade': {
    montar: (palco, v) => {
      const frente = gsap.quickTo(um(palco, '.u-frente'), 'x', { duration: 0.8, ease: 'power3' });
      const titulo = gsap.quickTo(um(palco, '.u-gigante'), 'x', { duration: 0.8, ease: 'power3' });
      const forca = Number(v['parallax']);
      const mover = (e: PointerEvent) => {
        const m = mouseRelativo(palco, e);
        frente(m.x * forca * 2);
        titulo(m.x * forca * 0.6);
      };
      palco.addEventListener('pointermove', mover);
      return () => palco.removeEventListener('pointermove', mover);
    },
    executar: (palco) => {
      gsap
        .timeline()
        .from(um(palco, '.u-gigante'), { yPercent: 60, opacity: 0, duration: 1.2, ease: 'power3.out' })
        .from(um(palco, '.u-frente'), { yPercent: 30, duration: 1.2, ease: 'power3.out' }, 0);
    },
  },

  'mascara-formas': {
    montar: (palco, v) => {
      const m = MASCARAS[String(v['forma'])];
      const contorno =
        v['forma'] === 'onda'
          ? `<path d="M360,0 C300,80 420,120 360,200 C300,280 420,330 340,400" transform="translate(-16,0)" fill="none" stroke="#22e3ff" stroke-width="6" opacity="0.8"/>`
          : '';
      um(palco, '.u-mascara').innerHTML = `
        <svg viewBox="220 0 400 400" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Paisagem recortada">
          <defs><clipPath id="u-recorte">${m.formas.join('')}</clipPath></defs>
          ${contorno}
          <image href="ilustracoes/paisagem-${v['imagem']}.svg" width="600" height="400"
            preserveAspectRatio="xMidYMid slice" clip-path="url(#u-recorte)" />
        </svg>`;
    },
    executar: (palco) => {
      gsap.from(q(palco, '#u-recorte > *'), {
        scale: 0,
        transformOrigin: '50% 50%',
        duration: 0.9,
        stagger: 0.12,
        ease: 'back.out(1.4)',
      });
    },
  },

  'carrossel-vidro': {
    montar: (palco) => {
      const trilho = um(palco, '.u-trilho');
      const atual = um(palco, '.u-pag__atual');
      const obs = new IntersectionObserver(
        (entradas) =>
          entradas.forEach((e) => {
            e.target.classList.toggle('ativo', e.isIntersecting);
            if (e.isIntersecting) atual.textContent = String((e.target as HTMLElement).dataset['n']).padStart(2, '0');
          }),
        { root: trilho, threshold: 0.6 },
      );
      q(palco, '.u-card').forEach((c) => obs.observe(c));
      return () => obs.disconnect();
    },
    executar: (palco) => {
      const trilho = um(palco, '.u-trilho');
      const cards = q(palco, '.u-card');
      const i = Math.max(0, cards.findIndex((c) => c.classList.contains('ativo')));
      const prox = cards[(i + 1) % cards.length];
      trilho.scrollTo({ left: prox.offsetLeft - (trilho.clientWidth - prox.clientWidth) / 2, behavior: 'smooth' });
    },
  },

  numeros: {
    montar: (palco, v) => {
      const decimal = v['formato'] === 'decimal';
      q(palco, '.u-num__valor').forEach((el) => (el.textContent = formatar(Number(el.dataset['final']), decimal)));
    },
    executar: (palco, v) => {
      const decimal = v['formato'] === 'decimal';
      const tl = gsap.timeline({ defaults: { duration: Number(v['dur']), ease: String(v['ease']) } });
      tl.from(q(palco, '.u-num__linha'), { drawSVG: '0%' }, 0);
      q(palco, '.u-num__valor').forEach((el) => {
        const contador = { valor: 0 };
        tl.to(contador, { valor: Number(el.dataset['final']), onUpdate: () => (el.textContent = formatar(contador.valor, decimal)) }, 0);
      });
    },
  },

  bento: {
    executar: (palco) => {
      gsap.from(q(palco, '.u-bento > *'), { scale: 0.85, opacity: 0, duration: 0.6, stagger: 0.08, ease: 'back.out(1.5)' });
    },
  },

  'cards-profundidade': {
    executar: (palco) => {
      gsap
        .timeline()
        .from(um(palco, '.u-circulo'), { scale: 0, duration: 0.9, ease: 'expo.out', transformOrigin: '50% 50%' })
        .from(q(palco, '.u-pcard'), { y: 40, opacity: 0, duration: 0.6, stagger: 0.12, ease: 'power3.out' }, '-=0.5');
    },
  },

  magnetico: {
    montar: (palco, v) => {
      const forca = Number(v['forca']);
      const raio = Number(v['raio']);
      const botoes = q(palco, '.u-mag').map((el) => ({
        el,
        x: gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3' }),
        y: gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3' }),
      }));
      const cursor = palco.querySelector<HTMLElement>('.u-cursor');
      const cx = cursor ? gsap.quickTo(cursor, 'x', { duration: 0.2, ease: 'power3' }) : undefined;
      const cy = cursor ? gsap.quickTo(cursor, 'y', { duration: 0.2, ease: 'power3' }) : undefined;
      const mover = (e: PointerEvent) => {
        const area = palco.getBoundingClientRect();
        cx?.(e.clientX - area.left);
        cy?.(e.clientY - area.top);
        let sobre = false;
        botoes.forEach((b) => {
          const r = b.el.getBoundingClientRect();
          const dx = e.clientX - (r.left + r.width / 2);
          const dy = e.clientY - (r.top + r.height / 2);
          const perto = Math.hypot(dx, dy) < raio;
          sobre ||= perto;
          b.x(perto ? dx * forca : 0);
          b.y(perto ? dy * forca : 0);
        });
        cursor?.classList.toggle('sobre', sobre);
        cursor?.classList.add('visivel');
      };
      const sair = () => {
        botoes.forEach((b) => (b.x(0), b.y(0)));
        cursor?.classList.remove('visivel');
      };
      palco.addEventListener('pointermove', mover);
      palco.addEventListener('pointerleave', sair);
      return () => {
        palco.removeEventListener('pointermove', mover);
        palco.removeEventListener('pointerleave', sair);
      };
    },
  },
};
