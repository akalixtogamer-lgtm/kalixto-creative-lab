/**
 * Medidas objetivas usadas no painel de fidelidade: distância de cor (ΔE 2000),
 * caixas na mesma escala, sincronia de tempo entre referência e reconstrução.
 */
import { lerCor } from '../unidades';
import type { Caixa, Marco } from './tipos';

/* ------------------------------ Cor ------------------------------ */

function paraLab(hexOuRgb: string): [number, number, number] {
  const c = lerCor(hexOuRgb);
  const lin = (v: number) => {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  const r = lin(c.r);
  const g = lin(c.g);
  const b = lin(c.b);
  // sRGB → XYZ (D65), normalizado pelo branco.
  const x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
  const y = r * 0.2126 + g * 0.7152 + b * 0.0722;
  const z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
  const f = (t: number) => (t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 / 116) * t + 16 / 116);
  return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))];
}

/**
 * ΔE 2000 entre duas cores (hex ou rgb()). Até ~1 ninguém vê; até 2,3 é a
 * "diferença mínima perceptível"; acima de 10 parecem cores diferentes.
 */
export function deltaE(a: string, b: string): number {
  const [L1, a1, b1] = paraLab(a);
  const [L2, a2, b2] = paraLab(b);
  const rad = Math.PI / 180;
  const C1 = Math.hypot(a1, b1);
  const C2 = Math.hypot(a2, b2);
  const Cm = (C1 + C2) / 2;
  const G = 0.5 * (1 - Math.sqrt(Cm ** 7 / (Cm ** 7 + 25 ** 7)));
  const a1p = (1 + G) * a1;
  const a2p = (1 + G) * a2;
  const C1p = Math.hypot(a1p, b1);
  const C2p = Math.hypot(a2p, b2);
  const h = (x: number, y: number) => {
    if (x === 0 && y === 0) return 0;
    const ang = Math.atan2(y, x) / rad;
    return ang >= 0 ? ang : ang + 360;
  };
  const h1p = h(a1p, b1);
  const h2p = h(a2p, b2);
  const dLp = L2 - L1;
  const dCp = C2p - C1p;
  let dhp = 0;
  if (C1p * C2p !== 0) {
    dhp = h2p - h1p;
    if (dhp > 180) dhp -= 360;
    else if (dhp < -180) dhp += 360;
  }
  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin((dhp * rad) / 2);
  const Lm = (L1 + L2) / 2;
  const Cmp = (C1p + C2p) / 2;
  let hm = h1p + h2p;
  if (C1p * C2p !== 0) {
    if (Math.abs(h1p - h2p) <= 180) hm = (h1p + h2p) / 2;
    else hm = h1p + h2p < 360 ? (h1p + h2p + 360) / 2 : (h1p + h2p - 360) / 2;
  }
  const T =
    1 -
    0.17 * Math.cos((hm - 30) * rad) +
    0.24 * Math.cos(2 * hm * rad) +
    0.32 * Math.cos((3 * hm + 6) * rad) -
    0.2 * Math.cos((4 * hm - 63) * rad);
  const dTheta = 30 * Math.exp(-(((hm - 275) / 25) ** 2));
  const Rc = 2 * Math.sqrt(Cmp ** 7 / (Cmp ** 7 + 25 ** 7));
  const Sl = 1 + (0.015 * (Lm - 50) ** 2) / Math.sqrt(20 + (Lm - 50) ** 2);
  const Sc = 1 + 0.045 * Cmp;
  const Sh = 1 + 0.015 * Cmp * T;
  const Rt = -Math.sin(2 * dTheta * rad) * Rc;
  const dE = Math.sqrt(
    (dLp / Sl) ** 2 + (dCp / Sc) ** 2 + (dHp / Sh) ** 2 + Rt * (dCp / Sc) * (dHp / Sh),
  );
  return Math.round(dE * 100) / 100;
}

/** Cor transparente (rgba com alpha 0) não serve para comparar. */
export function corVisivel(c: string | undefined): boolean {
  if (!c) return false;
  try {
    return lerCor(c).a > 0.02;
  } catch {
    return false;
  }
}

/* ------------------------------ Caixas ------------------------------ */

/**
 * Leva a caixa da referência para a escala do palco da reconstrução: as duas
 * larguras passam a valer o mesmo (a referência pode ser um vídeo 1320 px e
 * a reconstrução um palco de 390 px).
 */
export function caixaNaEscala(c: Caixa, larguraRef: number, larguraRec: number): Caixa {
  const k = larguraRef > 0 ? larguraRec / larguraRef : 1;
  return { x: c.x * k, y: c.y * k, largura: c.largura * k, altura: c.altura * k };
}

export const centro = (c: Caixa) => ({ x: c.x + c.largura / 2, y: c.y + c.altura / 2 });

/** Diferença percentual de a para b (b é a referência). */
export function difPercentual(a: number, b: number): number {
  if (b === 0) return a === 0 ? 0 : 100;
  return Math.round((Math.abs(a - b) / Math.abs(b)) * 1000) / 10;
}

/* ------------------------------ Tempo ------------------------------ */

/** Pares (ref, rec) em ordem, dos marcos que têm os dois tempos. */
export function paresDeSincronia(marcos: Marco[]): { ref: number; rec: number }[] {
  const pares = marcos
    .filter((m) => m.ref !== null && m.rec !== null)
    .map((m) => ({ ref: m.ref as number, rec: m.rec as number }))
    .sort((a, b) => a.ref - b.ref);
  // Remove pares que andariam para trás na reconstrução (a sincronia precisa ser crescente).
  const out: { ref: number; rec: number }[] = [];
  for (const p of pares) {
    const ult = out[out.length - 1];
    if (!ult || (p.ref > ult.ref && p.rec >= ult.rec)) out.push(p);
  }
  return out;
}

/**
 * Tempo da reconstrução equivalente a um tempo da referência. Entre dois
 * marcos, interpola; antes do primeiro e depois do último, segue no mesmo
 * ritmo do trecho vizinho (ou 1:1 se só houver um marco).
 */
export function tempoNaReconstrucao(tRef: number, marcos: Marco[]): number {
  const p = paresDeSincronia(marcos);
  if (!p.length) return tRef;
  if (p.length === 1) return Math.max(0, tRef - p[0].ref + p[0].rec);
  let i = p.findIndex((x) => x.ref >= tRef);
  if (i === -1) i = p.length - 1;
  if (i === 0) i = 1;
  const a = p[i - 1];
  const b = p[i];
  const ritmo = (b.rec - a.rec) / (b.ref - a.ref);
  return Math.max(0, a.rec + (tRef - a.ref) * ritmo);
}

/** O inverso: tempo da referência equivalente a um tempo da reconstrução. */
export function tempoNaReferencia(tRec: number, marcos: Marco[]): number {
  const invertidos = marcos.map((m) => ({ ...m, ref: m.rec, rec: m.ref }));
  return tempoNaReconstrucao(tRec, invertidos);
}

/** "1,25 s" / "850 ms". */
export function formatarTempo(seg: number): string {
  if (!Number.isFinite(seg)) return '—';
  if (Math.abs(seg) < 1) return `${Math.round(seg * 1000)} ms`;
  return `${(Math.round(seg * 100) / 100).toLocaleString('pt-BR')} s`;
}
