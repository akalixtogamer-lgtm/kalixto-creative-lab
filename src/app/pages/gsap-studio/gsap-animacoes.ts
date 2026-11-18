import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { Valores } from '../../core/models/demo.model';
import { easeDoDemo } from '../../core/data/gsap-demos.data';

/**
 * Animações reais do GSAP Studio — uma função por demo.
 * Cada função recebe o palco (para buscar os elementos) e os valores
 * dos controles, e devolve a animação criada.
 *
 * Elas rodam dentro de gsap.context(), então o componente consegue
 * desfazer tudo (revert) ao reiniciar ou trocar de demo.
 */
gsap.registerPlugin(SplitText);

type Construtor = (palco: HTMLElement, v: Valores) => gsap.core.Animation;

const q = (palco: HTMLElement, seletor: string) => palco.querySelectorAll<HTMLElement>(seletor);

export const ANIMACOES: Record<string, Construtor> = {
  to: (palco, v) =>
    gsap.to(q(palco, '.g-caixa'), {
      x: Number(v['x']),
      rotation: Number(v['rot']),
      duration: Number(v['dur']),
      ease: String(v['ease']),
    }),

  from: (palco, v) =>
    gsap.from(q(palco, '.g-titulo, .g-sub'), {
      y: Number(v['y']),
      opacity: Number(v['op']),
      duration: Number(v['dur']),
      ease: String(v['ease']),
      stagger: 0.12,
    }),

  fromto: (palco, v) =>
    gsap.fromTo(
      q(palco, '.g-caixa'),
      { x: Number(v['xDe']), scale: Number(v['escDe']) },
      { x: Number(v['xPara']), scale: 1, duration: Number(v['dur']), ease: String(v['ease']) },
    ),

  timeline: (palco, v) => {
    const dur = Number(v['dur']);
    const pos = Number(v['sob']) > 0 ? `-=${v['sob']}` : '>';
    return gsap
      .timeline({ repeat: Number(v['rep']), yoyo: v['yoyo'] === 'true' })
      .to(q(palco, '.g-circulo'), { x: 180, duration: dur })
      .to(q(palco, '.g-quadrado'), { x: 180, duration: dur }, pos)
      .to(q(palco, '.g-triangulo'), { x: 180, duration: dur }, pos);
  },

  stagger: (palco, v) =>
    gsap.from(q(palco, '.g-ponto'), {
      y: -40,
      scale: 0,
      opacity: 0,
      duration: 0.6,
      ease: String(v['ease']),
      stagger: {
        each: Number(v['each']),
        from: String(v['from']) as gsap.StaggerVars['from'],
        grid: 'auto',
      },
    }),

  easing: (palco, v) => {
    const ease = easeDoDemo(v);
    const dur = Number(v['dur']);
    const trilho = palco.querySelector<HTMLElement>('.g-trilho');
    const ponto = palco.querySelector<SVGCircleElement>('.g-curva-ponto');
    const tempo = { t: 0 };
    const curva = gsap.parseEase(ease);
    return gsap
      .timeline()
      .to(
        q(palco, '.g-bola'),
        { x: () => (trilho?.clientWidth ?? 300) - 36, duration: dur, ease },
        0,
      )
      .to(
        tempo,
        {
          t: 1,
          duration: dur,
          ease: 'none',
          onUpdate: () => {
            // Move o ponto sobre o gráfico: x = tempo, y = progresso
            const p = pontoDaCurva(tempo.t, curva(tempo.t));
            ponto?.setAttribute('cx', String(p.x));
            ponto?.setAttribute('cy', String(p.y));
          },
        },
        0,
      );
  },

  splittext: (palco, v) => {
    const tipo = String(v['dividir']) as 'chars' | 'words' | 'lines';
    const efeito = String(v['efeito']);
    const split = SplitText.create(palco.querySelector('.g-split')!, {
      type: tipo === 'chars' ? 'words,chars' : tipo,
      mask: efeito === 'subir' ? tipo : undefined,
    });
    const de: gsap.TweenVars =
      efeito === 'subir'
        ? { yPercent: 110 }
        : efeito === 'girar'
          ? { rotationX: -90, opacity: 0, transformOrigin: '50% 50% -20px' }
          : efeito === 'espalhar'
            ? {
                x: () => gsap.utils.random(-120, 120),
                y: () => gsap.utils.random(-80, 80),
                opacity: 0,
              }
            : { opacity: 0 };
    return gsap.from(split[tipo], {
      ...de,
      duration: Number(v['dur']),
      stagger: Number(v['stagger']),
      ease: 'power3.out',
    });
  },

  reproducao: (palco, v) =>
    gsap
      .timeline({ paused: true })
      .to(q(palco, '.g-card'), { x: 140, duration: 1, ease: 'power2.inOut' })
      .to(q(palco, '.g-card'), { rotation: 180, scale: 0.7, duration: 1, ease: 'power2.inOut' })
      .to(q(palco, '.g-card'), { x: -140, borderRadius: '50%', duration: 1, ease: 'power2.inOut' })
      .timeScale(Number(v['vel'])),
};

/* ---------- Gráfico da curva de easing ---------- */

/** Área do gráfico (viewBox 0 0 260 180), com folga para curvas que passam do limite. */
export const GRAFICO = { largura: 260, altura: 180, margem: 20, yMin: -0.35, yMax: 1.35 };

export function pontoDaCurva(t: number, y: number): { x: number; y: number } {
  const { largura, altura, margem, yMin, yMax } = GRAFICO;
  const w = largura - margem * 2;
  return {
    x: margem + t * w,
    y: altura - ((y - yMin) / (yMax - yMin)) * altura,
  };
}

/** Caminho SVG da curva de easing. */
export function caminhoDaCurva(ease: string): string {
  const curva = gsap.parseEase(ease);
  const pontos: string[] = [];
  for (let i = 0; i <= 80; i++) {
    const t = i / 80;
    const p = pontoDaCurva(t, curva(t));
    pontos.push(`${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`);
  }
  return pontos.join(' ');
}
