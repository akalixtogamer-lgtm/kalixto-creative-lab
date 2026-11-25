/**
 * Quadros sintéticos para os testes da análise de vídeo (página texturizada
 * rolando, faixa presa, camada em outra velocidade, corte). Só testes.
 */
import type { QuadroCinza } from './tipos';

/** Padrão determinístico com bastante detalhe (para o casamento de blocos). */
export function padrao(x: number, y: number, semente = 1): number {
  const v =
    Math.sin(x * 0.9 * semente + y * 0.37) * 60 + Math.cos(y * 0.71 + x * 0.23 * semente) * 50;
  return Math.max(0, Math.min(255, Math.round(128 + v + ((x * 7 + y * 13 * semente) % 23))));
}

export interface Cena {
  w?: number;
  h?: number;
  quadros?: number;
  fps?: number;
  /** px por quadro, na vertical (rolagem) */
  dy?: number;
  /** px por quadro, na horizontal */
  dx?: number;
  /** linhas do topo que ficam presas (sticky) */
  presas?: number;
  /** faixa [y0, y1) que anda em outra velocidade (parallax), com o fator */
  camada?: { y0: number; y1: number; fator: number };
  /** quadro em que a cena inteira é trocada (corte) */
  corteEm?: number;
}

export function cena(c: Cena = {}): QuadroCinza[] {
  const w = c.w ?? 96;
  const h = c.h ?? 128;
  const n = c.quadros ?? 8;
  const fps = c.fps ?? 8;
  const out: QuadroCinza[] = [];
  for (let k = 0; k < n; k++) {
    const px = new Uint8Array(w * h);
    const outra = c.corteEm !== undefined && k >= c.corteEm;
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        let sy = y + k * (c.dy ?? 0);
        let sx = x + k * (c.dx ?? 0);
        if (c.presas && y < c.presas) {
          sy = y;
          sx = x;
        } else if (c.camada && y >= c.camada.y0 && y < c.camada.y1) {
          sy = y + k * (c.dy ?? 0) * c.camada.fator + 400;
        }
        px[y * w + x] = padrao(sx, sy, outra ? 3 : c.presas && y < c.presas ? 2 : 1);
      }
    out.push({ t: k / fps, largura: w, altura: h, px });
  }
  return out;
}
