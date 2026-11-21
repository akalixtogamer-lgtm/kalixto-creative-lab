/**
 * Cores do design system: escala tonal (50–900) e contraste (WCAG 2.1).
 * Sem dependências: usado pela fundação, pelo guia e pelo plugin do Figma.
 */

const rgb = (hex: string): [number, number, number] => {
  const h = hex.replace('#', '').slice(0, 6);
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
};
const hex = (c: number[]) =>
  '#' +
  c
    .map((x) =>
      Math.round(Math.min(255, Math.max(0, x)))
        .toString(16)
        .padStart(2, '0'),
    )
    .join('');
const misturar = (a: string, b: string, t: number) => {
  const x = rgb(a);
  const y = rgb(b);
  return hex(x.map((v, i) => v + (y[i] - v) * t));
};

/** Passos da escala tonal e quanto cada um mistura de branco (−) ou preto (+). */
export const PASSOS_ESCALA = [
  [50, -0.92],
  [100, -0.82],
  [200, -0.66],
  [300, -0.46],
  [400, -0.24],
  [500, 0],
  [600, 0.14],
  [700, 0.3],
  [800, 0.46],
  [900, 0.62],
] as const;

/** Escala tonal de uma cor: 500 é a própria cor, 50 a mais clara, 900 a mais escura. */
export function escalaTonal(base: string): { passo: number; cor: string }[] {
  return PASSOS_ESCALA.map(([passo, t]) => ({
    passo,
    cor:
      t === 0
        ? base.toLowerCase().slice(0, 7)
        : t < 0
          ? misturar(base, '#ffffff', -t)
          : misturar(base, '#000000', t),
  }));
}

/** Luminância relativa (WCAG). */
function luminancia(c: string): number {
  const [r, g, b] = rgb(c).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Razão de contraste entre duas cores (1 a 21). */
export function contraste(a: string, b: string): number {
  const [x, y] = [luminancia(a), luminancia(b)].sort((p, q) => q - p);
  return Math.round(((x + 0.05) / (y + 0.05)) * 100) / 100;
}

/** Nota WCAG para texto (normal) ou para elementos de interface/texto grande. */
export function notaContraste(razao: number, uso: 'texto' | 'interface'): 'AAA' | 'AA' | 'Falha' {
  if (uso === 'interface') return razao >= 4.5 ? 'AAA' : razao >= 3 ? 'AA' : 'Falha';
  return razao >= 7 ? 'AAA' : razao >= 4.5 ? 'AA' : 'Falha';
}
