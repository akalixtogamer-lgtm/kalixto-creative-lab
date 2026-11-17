/** Diferença linha a linha entre dois textos (LCS), para comparar versões do código. */

export interface LinhaDiff {
  tipo: 'igual' | 'removida' | 'adicionada';
  texto: string;
}

export function diffLinhas(antes: string, depois: string): LinhaDiff[] {
  const a = antes.split('\n');
  const b = depois.split('\n');
  const n = a.length;
  const m = b.length;
  // tabela de maior subsequência comum, preenchida de trás para frente
  const t: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--)
      t[i][j] = a[i] === b[j] ? t[i + 1][j + 1] + 1 : Math.max(t[i + 1][j], t[i][j + 1]);

  const out: LinhaDiff[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      out.push({ tipo: 'igual', texto: a[i] });
      i++;
      j++;
    } else if (t[i + 1][j] >= t[i][j + 1]) {
      out.push({ tipo: 'removida', texto: a[i++] });
    } else {
      out.push({ tipo: 'adicionada', texto: b[j++] });
    }
  }
  while (i < n) out.push({ tipo: 'removida', texto: a[i++] });
  while (j < m) out.push({ tipo: 'adicionada', texto: b[j++] });
  return out;
}
