import { gsap } from 'gsap';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { FORMAS_MORPH } from '../../core/data/svg-demos.data';
import { Valores } from '../../core/models/demo.model';

gsap.registerPlugin(DrawSVGPlugin, MorphSVGPlugin, MotionPathPlugin);

/** Animações do SVG Lab — uma função por demo (rodam dentro de gsap.context). */
type Construtor = (palco: HTMLElement, v: Valores) => gsap.core.Animation;
const um = <T extends Element = SVGElement>(palco: HTMLElement, s: string) => palco.querySelector<T>(s)!;

export const ANIMACOES_SVG: Record<string, Construtor> = {
  stroke: (palco, v) =>
    gsap.fromTo(
      um(palco, '.v-assinatura'),
      { drawSVG: '0% 0%' },
      { drawSVG: `${v['inicio']}% ${v['fim']}%`, duration: Number(v['dur']), ease: String(v['ease']) },
    ),

  mascara: (palco, v) => {
    const furo = um(palco, '.v-furo');
    const [cx, cy] = v['origem'] === 'canto' ? [0, 0] : [150, 100];
    return gsap.fromTo(
      furo,
      { attr: { cx, cy, r: 0 } },
      { attr: { r: Number(v['raio']) }, duration: Number(v['dur']), ease: 'power2.out' },
    );
  },

  morph: (palco, v) =>
    gsap.to(um(palco, '.v-forma'), {
      morphSVG: FORMAS_MORPH[String(v['destino'])].d,
      duration: Number(v['dur']),
      ease: String(v['ease']),
    }),

  filtros: (palco, v) => {
    const deslocar = um(palco, '.v-deslocar');
    const ruido = um(palco, '.v-ruido');
    const metade = Number(v['dur']) / 2;
    gsap.set(ruido, { attr: { baseFrequency: Number(v['freq']) } });
    return gsap
      .timeline()
      .to(deslocar, { attr: { scale: Number(v['escala']) }, duration: metade, ease: 'power2.in' })
      .to(deslocar, { attr: { scale: 0 }, duration: metade, ease: 'power2.out' });
  },

  'motion-path': (palco, v) =>
    gsap.to(um(palco, '.v-foguete'), {
      duration: Number(v['dur']),
      ease: String(v['ease']),
      motionPath: {
        path: um<SVGPathElement>(palco, '.v-trilha'),
        align: um<SVGPathElement>(palco, '.v-trilha'),
        alignOrigin: [0.5, 0.5],
        autoRotate: v['girar'] === 'true',
      },
    }),
};

export { FORMAS_MORPH };
