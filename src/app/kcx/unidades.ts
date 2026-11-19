/**
 * Conversão de unidades e cores do KCX. Funções puras, sem dependências.
 */
import { KcxUnidade } from './kcx.types';

/** Base usada para rem/em quando não há contexto (16px, padrão dos navegadores). */
export const BASE_REM = 16;

type Familia = 'tempo' | 'comprimento' | 'angulo' | 'proporcao' | 'nenhuma';

const FAMILIA: Record<KcxUnidade, Familia> = {
  '': 'nenhuma',
  x: 'nenhuma',
  px: 'comprimento',
  rem: 'comprimento',
  em: 'comprimento',
  '%': 'proporcao',
  ms: 'tempo',
  s: 'tempo',
  deg: 'angulo',
  turn: 'angulo',
  rad: 'angulo',
};

/** Fator para a unidade base de cada família (ms, px, deg). */
const PARA_BASE: Record<KcxUnidade, number> = {
  '': 1,
  x: 1,
  px: 1,
  rem: BASE_REM,
  em: BASE_REM,
  '%': 1,
  ms: 1,
  s: 1000,
  deg: 1,
  turn: 360,
  rad: 180 / Math.PI,
};

export function familiaDe(u: KcxUnidade): Familia {
  return FAMILIA[u];
}

/** true quando as duas unidades medem a mesma coisa. */
export function conversivel(de: KcxUnidade, para: KcxUnidade): boolean {
  return de === para || (FAMILIA[de] === FAMILIA[para] && FAMILIA[de] !== 'nenhuma');
}

/** Converte um número entre unidades compatíveis (ms ↔ s, px ↔ rem, deg ↔ turn ↔ rad). */
export function converter(valor: number, de: KcxUnidade, para: KcxUnidade): number {
  if (de === para) return valor;
  if (!conversivel(de, para)) {
    throw new Error(
      `KCX: não dá para converter "${de || 'sem unidade'}" em "${para || 'sem unidade'}".`,
    );
  }
  return (valor * PARA_BASE[de]) / PARA_BASE[para];
}

/** Arredonda sem lixo de ponto flutuante (0.30000000000000004 → 0.3). */
export function arredondar(n: number, casas = 4): number {
  const f = 10 ** casas;
  return Math.round(n * f) / f;
}

/* ============================== Cores ============================== */

export interface Rgba {
  r: number; // 0–255
  g: number;
  b: number;
  a: number; // 0–1
}

const HEX = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const RGB =
  /^rgba?\(\s*(\d{1,3})\s*[, ]\s*(\d{1,3})\s*[, ]\s*(\d{1,3})\s*(?:[,/]\s*([\d.]+%?)\s*)?\)$/i;

export function corValida(c: unknown): c is string {
  return typeof c === 'string' && (HEX.test(c.trim()) || lerRgb(c.trim()) !== null);
}

function lerRgb(c: string): Rgba | null {
  const m = RGB.exec(c);
  if (!m) return null;
  const [r, g, b] = [m[1], m[2], m[3]].map(Number);
  if ([r, g, b].some((x) => x > 255)) return null;
  let a = 1;
  if (m[4] !== undefined) a = m[4].endsWith('%') ? Number(m[4].slice(0, -1)) / 100 : Number(m[4]);
  if (!(a >= 0 && a <= 1)) return null;
  return { r, g, b, a };
}

/** Lê #rgb, #rgba, #rrggbb, #rrggbbaa, rgb() e rgba(). */
export function lerCor(c: string): Rgba {
  const t = c.trim();
  const rgb = lerRgb(t);
  if (rgb) return rgb;
  if (!HEX.test(t)) throw new Error(`KCX: cor inválida "${c}".`);
  let h = t.slice(1);
  if (h.length <= 4) h = [...h].map((x) => x + x).join('');
  const n = (i: number) => parseInt(h.slice(i, i + 2), 16);
  return { r: n(0), g: n(2), b: n(4), a: h.length === 8 ? arredondar(n(6) / 255, 3) : 1 };
}

const hex2 = (n: number) =>
  Math.round(Math.min(255, Math.max(0, n)))
    .toString(16)
    .padStart(2, '0');

/** #rrggbb, ou #rrggbbaa quando há transparência. */
export function corHex(c: Rgba): string {
  const base = `#${hex2(c.r)}${hex2(c.g)}${hex2(c.b)}`;
  return c.a >= 1 ? base : base + hex2(c.a * 255);
}

/** Aplica uma transparência (0–1) sobre a cor (multiplica a que ela já tem). */
export function comAlpha(c: string, alpha: number): string {
  const rgba = lerCor(c);
  const a = Math.min(1, Math.max(0, alpha));
  return corHex({ ...rgba, a: arredondar(rgba.a * a, 3) });
}

/** Cor no formato do Figma: canais de 0 a 1. */
export function corFigma(c: string): { r: number; g: number; b: number; a: number } {
  const { r, g, b, a } = lerCor(c);
  return { r: arredondar(r / 255), g: arredondar(g / 255), b: arredondar(b / 255), a };
}

/** Cor do Figma (0–1) de volta para hex. */
export function corDeFigma(c: { r: number; g: number; b: number; a?: number }): string {
  return corHex({ r: c.r * 255, g: c.g * 255, b: c.b * 255, a: c.a ?? 1 });
}
