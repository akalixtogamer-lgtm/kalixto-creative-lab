/**
 * Realce de sintaxe leve (HTML, CSS, JS/TS) sem biblioteca.
 * Devolve, para cada linha de código, a lista de trechos com sua classe de realce.
 * É só visual: o código copiado e executado é sempre o texto original.
 */

export type Linguagem = 'html' | 'css' | 'js';

const REGRAS: Record<Linguagem, [string, RegExp][]> = {
  css: [
    ['comentario', /\/\*[\s\S]*?\*\//y],
    ['texto', /'[^'\n]*'|"[^"\n]*"/y],
    ['regra', /@[\w-]+/y],
    ['cor', /#[0-9a-fA-F]{3,8}\b/y],
    ['propriedade', /--?[\w-]+(?=\s*:\s)|[a-z-]+(?=\s*:\s)/y],
    ['numero', /-?\d*\.?\d+(?:ms|s|px|deg|%|em|rem|vw|vh|ch|fr)?/y],
  ],
  js: [
    ['comentario', /\/\/[^\n]*|\/\*[\s\S]*?\*\//y],
    ['texto', /'(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"|`(?:\\.|[^`\\])*`/y],
    [
      'palavra',
      /\b(?:const|let|var|function|return|if|else|for|of|in|new|class|import|export|from|private|protected|public|readonly|interface|this|true|false|null|void|typeof)\b/y,
    ],
    ['numero', /\b\d*\.?\d+\b/y],
  ],
  html: [
    ['comentario', /<!--[\s\S]*?-->/y],
    ['texto', /"[^"]*"|'[^']*'/y],
    ['tag', /<\/?[\w-]+|\/?>/y],
    ['bloco', /@(?:for|if|else|switch|case)\b|\{\{|\}\}/y],
    ['atributo', /[\w\-:.#[\]()@]+(?==)/y],
  ],
};

/** Quebra o código em tokens [classe | null, texto]. */
function tokens(codigo: string, lang: Linguagem): [string | null, string][] {
  const regras = REGRAS[lang];
  const out: [string | null, string][] = [];
  let livre = '';
  let i = 0;
  while (i < codigo.length) {
    let achou = false;
    for (const [classe, re] of regras) {
      re.lastIndex = i;
      const m = re.exec(codigo);
      if (m && m[0].length > 0) {
        if (livre) out.push([null, livre]);
        livre = '';
        out.push([classe, m[0]]);
        i += m[0].length;
        achou = true;
        break;
      }
    }
    if (!achou) livre += codigo[i++];
  }
  if (livre) out.push([null, livre]);
  return out;
}

/** Um trecho de texto com a classe de realce (null = texto comum). */
export interface Trecho {
  c: string | null;
  t: string;
}

/**
 * Trechos de cada linha. Os tokens que atravessam linhas (comentários longos)
 * são divididos, e cada linha recebe só os seus pedaços.
 * Sem innerHTML: o template renderiza cada trecho como texto.
 */
export function realcarLinhas(codigo: string, lang: Linguagem): Trecho[][] {
  const linhas: Trecho[][] = [[]];
  for (const [classe, texto] of tokens(codigo, lang)) {
    texto.split('\n').forEach((pedaco, k) => {
      if (k > 0) linhas.push([]);
      if (pedaco) linhas[linhas.length - 1].push({ c: classe ? `tk-${classe}` : null, t: pedaco });
    });
  }
  return linhas;
}
