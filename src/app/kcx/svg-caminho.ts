/**
 * Geometria de caminhos SVG (comandos absolutos M, L, H, V, C, S, Q, Z).
 * Usada para representar no Figma os quadros de uma animação de traço:
 * comprimento do caminho (tracejado) e ponto em uma fração do percurso.
 */
export interface Ponto {
  x: number;
  y: number;
}

/** Converte o caminho em uma polilinha (amostras em curvas). */
export function amostrar(d: string, passos = 32): Ponto[] {
  const tokens = d.match(/[MLHVCSQZ]|-?\d*\.?\d+(?:e-?\d+)?/gi) ?? [];
  const pts: Ponto[] = [];
  let i = 0;
  let cmd = '';
  let atual: Ponto = { x: 0, y: 0 };
  let inicio: Ponto = { x: 0, y: 0 };
  let ultimoControle: Ponto | null = null;
  const num = () => Number(tokens[i++]);
  const cubica = (p0: Ponto, p1: Ponto, p2: Ponto, p3: Ponto) => {
    for (let k = 1; k <= passos; k++) {
      const t = k / passos;
      const u = 1 - t;
      pts.push({
        x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
        y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
      });
    }
  };
  while (i < tokens.length) {
    if (/^[MLHVCSQZ]$/i.test(tokens[i])) cmd = tokens[i++];
    if (/[a-z]/.test(cmd) && cmd !== 'z')
      throw new Error(`KCX: comando relativo "${cmd}" não suportado; use absolutos.`);
    switch (cmd.toUpperCase()) {
      case 'M':
        atual = { x: num(), y: num() };
        inicio = atual;
        pts.push(atual);
        cmd = 'L';
        ultimoControle = null;
        break;
      case 'L':
        atual = { x: num(), y: num() };
        pts.push(atual);
        ultimoControle = null;
        break;
      case 'H':
        atual = { x: num(), y: atual.y };
        pts.push(atual);
        ultimoControle = null;
        break;
      case 'V':
        atual = { x: atual.x, y: num() };
        pts.push(atual);
        ultimoControle = null;
        break;
      case 'C': {
        const c1 = { x: num(), y: num() };
        const c2 = { x: num(), y: num() };
        const fim = { x: num(), y: num() };
        cubica(atual, c1, c2, fim);
        ultimoControle = c2;
        atual = fim;
        break;
      }
      case 'S': {
        const c1 = ultimoControle
          ? { x: 2 * atual.x - ultimoControle.x, y: 2 * atual.y - ultimoControle.y }
          : atual;
        const c2 = { x: num(), y: num() };
        const fim = { x: num(), y: num() };
        cubica(atual, c1, c2, fim);
        ultimoControle = c2;
        atual = fim;
        break;
      }
      case 'Q': {
        const c = { x: num(), y: num() };
        const fim = { x: num(), y: num() };
        cubica(
          atual,
          { x: atual.x + (2 / 3) * (c.x - atual.x), y: atual.y + (2 / 3) * (c.y - atual.y) },
          { x: fim.x + (2 / 3) * (c.x - fim.x), y: fim.y + (2 / 3) * (c.y - fim.y) },
          fim,
        );
        ultimoControle = null;
        atual = fim;
        break;
      }
      case 'Z':
        atual = inicio;
        pts.push(atual);
        ultimoControle = null;
        break;
      default:
        throw new Error(`KCX: comando "${cmd}" não suportado.`);
    }
  }
  return pts;
}

const dist = (a: Ponto, b: Ponto) => Math.hypot(b.x - a.x, b.y - a.y);

export function comprimento(d: string): number {
  const p = amostrar(d);
  let total = 0;
  for (let k = 1; k < p.length; k++) total += dist(p[k - 1], p[k]);
  return total;
}

/** Ponto na fração `t` (0–1) do percurso. */
export function pontoEm(d: string, t: number): Ponto {
  const p = amostrar(d);
  const alvo = Math.min(1, Math.max(0, t)) * comprimento(d);
  let andado = 0;
  for (let k = 1; k < p.length; k++) {
    const seg = dist(p[k - 1], p[k]);
    if (andado + seg >= alvo) {
      const f = seg === 0 ? 0 : (alvo - andado) / seg;
      return {
        x: p[k - 1].x + (p[k].x - p[k - 1].x) * f,
        y: p[k - 1].y + (p[k].y - p[k - 1].y) * f,
      };
    }
    andado += seg;
  }
  return p[p.length - 1];
}
