/**
 * Curvas de easing: lê o texto CSS (palavra, cubic-bezier(), steps(), linear())
 * e compara duas curvas pela maior distância entre elas no tempo 0 → 1.
 * Assim "ease-out" e "cubic-bezier(0, 0, 0.58, 1)" são reconhecidas como iguais.
 */

export type FuncaoEasing = (t: number) => number;

const PALAVRAS: Record<string, [number, number, number, number]> = {
  ease: [0.25, 0.1, 0.25, 1],
  'ease-in': [0.42, 0, 1, 1],
  'ease-out': [0, 0, 0.58, 1],
  'ease-in-out': [0.42, 0, 0.58, 1],
};

/** Curvas que aparecem para escolher ao anotar a referência. */
export const EASINGS_COMUNS: { valor: string; nome: string }[] = [
  { valor: 'linear', nome: 'Linear (velocidade constante)' },
  { valor: 'ease', nome: 'Ease (padrão do CSS)' },
  { valor: 'ease-in', nome: 'Começa devagar (ease-in)' },
  { valor: 'ease-out', nome: 'Termina devagar (ease-out)' },
  { valor: 'ease-in-out', nome: 'Devagar nas pontas (ease-in-out)' },
  { valor: 'cubic-bezier(0.16, 1, 0.3, 1)', nome: 'Expo out (freada longa)' },
  { valor: 'cubic-bezier(0.34, 1.56, 0.64, 1)', nome: 'Back out (passa e volta)' },
  { valor: 'cubic-bezier(0.65, 0, 0.35, 1)', nome: 'Cubic in-out (suave forte)' },
  { valor: 'steps(4, end)', nome: 'Em degraus (steps)' },
];

/** Curva de Bézier cúbica CSS: x(t) → resolve t por Newton + bisseção, devolve y. */
export function bezier(x1: number, y1: number, x2: number, y2: number): FuncaoEasing {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const sx = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sy = (t: number) => ((ay * t + by) * t + cy) * t;
  const dx = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  const resolver = (x: number) => {
    let t = x;
    for (let i = 0; i < 8; i++) {
      const err = sx(t) - x;
      if (Math.abs(err) < 1e-6) return t;
      const d = dx(t);
      if (Math.abs(d) < 1e-6) break;
      t -= err / d;
    }
    let lo = 0;
    let hi = 1;
    t = x;
    for (let i = 0; i < 40; i++) {
      const v = sx(t);
      if (Math.abs(v - x) < 1e-6) break;
      if (v < x) lo = t;
      else hi = t;
      t = (lo + hi) / 2;
    }
    return t;
  };
  return (x) => (x <= 0 ? 0 : x >= 1 ? 1 : sy(resolver(x)));
}

function numeros(txt: string): number[] {
  return txt
    .split(/[\s,]+/)
    .filter(Boolean)
    .map((n) => Number(n.replace('%', '')));
}

/** Lê uma curva CSS. Devolve null se não reconhecer. */
export function lerEasing(css: string | undefined | null): FuncaoEasing | null {
  if (!css) return null;
  const t = css.trim().toLowerCase();
  if (t === 'linear') return (x) => x;
  if (t in PALAVRAS) return bezier(...PALAVRAS[t]);
  if (t === 'step-start') return (x) => (x <= 0 ? 0 : 1);
  if (t === 'step-end') return (x) => (x >= 1 ? 1 : 0);
  let m = /^cubic-bezier\(([^)]*)\)$/.exec(t);
  if (m) {
    const n = numeros(m[1]);
    if (n.length !== 4 || n.some((v) => !Number.isFinite(v))) return null;
    if (n[0] < 0 || n[0] > 1 || n[2] < 0 || n[2] > 1) return null;
    return bezier(n[0], n[1], n[2], n[3]);
  }
  m = /^steps\(\s*(\d+)\s*(?:,\s*([a-z-]+)\s*)?\)$/.exec(t);
  if (m) {
    const passos = Math.max(1, Number(m[1]));
    const inicio = m[2] === 'start' || m[2] === 'jump-start';
    return (x) => {
      if (x >= 1) return 1;
      const k = Math.floor(x * passos) + (inicio ? 1 : 0);
      return Math.min(1, k / passos);
    };
  }
  m = /^linear\(([^)]*)\)$/.exec(t);
  if (m) {
    // linear(0, 0.5 30%, 1): pontos com posição opcional.
    const partes = m[1].split(',').map((p) => p.trim().split(/\s+/));
    const pts = partes.map((p) => ({
      y: Number(p[0]),
      x: p[1] !== undefined ? Number(p[1].replace('%', '')) / 100 : NaN,
    }));
    if (pts.length < 2 || pts.some((p) => !Number.isFinite(p.y))) return null;
    if (!Number.isFinite(pts[0].x)) pts[0].x = 0;
    if (!Number.isFinite(pts[pts.length - 1].x)) pts[pts.length - 1].x = 1;
    // Posições que faltam: distribuídas entre as conhecidas.
    for (let i = 1; i < pts.length - 1; i++) {
      if (Number.isFinite(pts[i].x)) continue;
      let j = i;
      while (!Number.isFinite(pts[j].x)) j++;
      const a = pts[i - 1].x;
      const passo = (pts[j].x - a) / (j - i + 1);
      for (let k = i; k < j; k++) pts[k].x = a + passo * (k - i + 1);
    }
    return (x) => {
      if (x <= pts[0].x) return pts[0].y;
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1];
        const b = pts[i];
        if (x <= b.x) return b.x === a.x ? b.y : a.y + ((x - a.x) / (b.x - a.x)) * (b.y - a.y);
      }
      return pts[pts.length - 1].y;
    };
  }
  return null;
}

/**
 * Maior diferença vertical entre duas curvas (0 = iguais), amostrando 41
 * pontos. Null se alguma das duas não for reconhecida.
 */
export function distanciaEasing(a: string, b: string): number | null {
  const fa = lerEasing(a);
  const fb = lerEasing(b);
  if (!fa || !fb) return null;
  let max = 0;
  for (let i = 0; i <= 40; i++) {
    const t = i / 40;
    max = Math.max(max, Math.abs(fa(t) - fb(t)));
  }
  return Math.round(max * 1000) / 1000;
}

/** Caminho SVG (viewBox 0 0 100 100, y para cima) para desenhar a curva. */
export function caminhoEasing(css: string, amostras = 40): string {
  const f = lerEasing(css);
  if (!f) return '';
  const pts: string[] = [];
  for (let i = 0; i <= amostras; i++) {
    const t = i / amostras;
    pts.push(`${(t * 100).toFixed(1)} ${(100 - f(t) * 100).toFixed(1)}`);
  }
  return `M${pts.join(' L')}`;
}
