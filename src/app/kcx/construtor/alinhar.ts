/**
 * Posição livre nas Telas (como no Figma): ímãs de alinhamento, guias,
 * alinhar e distribuir. TS puro, em px do dispositivo.
 */

export interface Caixa {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Guia {
  /** v = linha vertical (alinha em x); h = horizontal (alinha em y). */
  tipo: 'v' | 'h';
  pos: number;
}

export const LIMIAR_IMA = 6;

/**
 * Encaixa a caixa movida nas bordas e centros da página e das outras caixas
 * (o mais perto dentro do limiar, em cada eixo) e devolve as guias para desenhar.
 */
export function encaixar(
  movida: Caixa,
  outras: Caixa[],
  largura: number,
  limiar = LIMIAR_IMA,
): { x: number; y: number; guias: Guia[] } {
  const xs = [0, largura / 2, largura];
  const ys: number[] = [0];
  for (const o of outras) {
    xs.push(o.x, o.x + o.w / 2, o.x + o.w);
    ys.push(o.y, o.y + o.h / 2, o.y + o.h);
  }
  const melhor = (pontos: number[], alvos: number[]) => {
    let r: { d: number; alvo: number; desloc: number } | null = null;
    for (const p of pontos)
      for (const a of alvos) {
        const d = Math.abs(a - p);
        if (d <= limiar && (!r || d < r.d)) r = { d, alvo: a, desloc: a - p };
      }
    return r;
  };
  const bx = melhor([movida.x, movida.x + movida.w / 2, movida.x + movida.w], xs);
  const by = melhor([movida.y, movida.y + movida.h / 2, movida.y + movida.h], ys);
  const guias: Guia[] = [];
  if (bx) guias.push({ tipo: 'v', pos: bx.alvo });
  if (by) guias.push({ tipo: 'h', pos: by.alvo });
  return {
    x: Math.round(movida.x + (bx?.desloc ?? 0)),
    y: Math.round(movida.y + (by?.desloc ?? 0)),
    guias,
  };
}

export type ModoAlinhar = 'esquerda' | 'centro' | 'direita' | 'topo' | 'meio' | 'base';

/**
 * Alinha as caixas escolhidas. Uma caixa só: em relação à página (largura);
 * várias: em relação ao contorno da seleção. Devolve as novas posições (x, y).
 */
export function alinhar(
  caixas: Caixa[],
  indices: number[],
  modo: ModoAlinhar,
  largura: number,
): { x: number; y: number }[] {
  const r = caixas.map((c) => ({ x: c.x, y: c.y }));
  const sel = indices.filter((i) => caixas[i]);
  if (!sel.length) return r;
  const so = sel.length === 1;
  const esq = so ? 0 : Math.min(...sel.map((i) => caixas[i].x));
  const dir = so ? largura : Math.max(...sel.map((i) => caixas[i].x + caixas[i].w));
  const topo = Math.min(...sel.map((i) => caixas[i].y));
  const base = Math.max(...sel.map((i) => caixas[i].y + caixas[i].h));
  for (const i of sel) {
    const c = caixas[i];
    if (modo === 'esquerda') r[i].x = esq;
    if (modo === 'centro') r[i].x = Math.round((esq + dir) / 2 - c.w / 2);
    if (modo === 'direita') r[i].x = dir - c.w;
    if (!so) {
      if (modo === 'topo') r[i].y = topo;
      if (modo === 'meio') r[i].y = Math.round((topo + base) / 2 - c.h / 2);
      if (modo === 'base') r[i].y = base - c.h;
    } else if (modo === 'topo') r[i].y = 0;
  }
  return r;
}

/** Distribui na vertical com o mesmo espaço entre as caixas (ordem pela posição). */
export function distribuirVertical(
  caixas: Caixa[],
  indices: number[],
  espaco?: number,
): { x: number; y: number }[] {
  const r = caixas.map((c) => ({ x: c.x, y: c.y }));
  const sel = indices.filter((i) => caixas[i]).sort((a, b) => caixas[a].y - caixas[b].y);
  if (sel.length < 2) return r;
  const topo = caixas[sel[0]].y;
  const fim = Math.max(...sel.map((i) => caixas[i].y + caixas[i].h));
  const total = sel.reduce((s, i) => s + caixas[i].h, 0);
  const vao = espaco ?? Math.max(0, (fim - topo - total) / (sel.length - 1));
  let y = topo;
  for (const i of sel) {
    r[i].y = Math.round(y);
    y += caixas[i].h + vao;
  }
  return r;
}

/** Empilha tudo de novo (como o modo empilhado): centralizado, com espaço entre as seções. */
export function empilhar(
  caixas: Caixa[],
  largura: number,
  espaco = 32,
): { x: number; y: number }[] {
  let y = espaco;
  return caixas.map((c) => {
    const p = { x: Math.max(0, Math.round((largura - c.w) / 2)), y };
    y += c.h + espaco;
    return p;
  });
}
