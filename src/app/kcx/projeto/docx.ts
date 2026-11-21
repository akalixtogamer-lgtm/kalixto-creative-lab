/**
 * Texto de um .docx, lido no navegador sem biblioteca: o .docx é um ZIP;
 * abrimos word/document.xml (descompactado com DecompressionStream) e
 * transformamos os parágrafos em linhas.
 */

const ASSINATURA_FIM = 0x06054b50;
const ASSINATURA_CENTRAL = 0x02014b50;
const ASSINATURA_LOCAL = 0x04034b50;
export const LIMITE_DOCX = 15 * 1024 * 1024;

interface EntradaZip {
  nome: string;
  metodo: number;
  tamanho: number;
  original: number;
  local: number;
}

/** Lista as entradas do diretório central do ZIP. */
export function entradasDoZip(bytes: Uint8Array): EntradaZip[] {
  const v = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let fim = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--) {
    if (v.getUint32(i, true) === ASSINATURA_FIM) {
      fim = i;
      break;
    }
  }
  if (fim < 0) throw new Error('Não é um arquivo .docx válido (ZIP não reconhecido).');
  const total = v.getUint16(fim + 10, true);
  let p = v.getUint32(fim + 16, true);
  const lista: EntradaZip[] = [];
  const dec = new TextDecoder();
  for (let n = 0; n < total && p + 46 <= bytes.length; n++) {
    if (v.getUint32(p, true) !== ASSINATURA_CENTRAL) break;
    const metodo = v.getUint16(p + 10, true);
    const tamanho = v.getUint32(p + 20, true);
    const original = v.getUint32(p + 24, true);
    const lNome = v.getUint16(p + 28, true);
    const lExtra = v.getUint16(p + 30, true);
    const lComent = v.getUint16(p + 32, true);
    const local = v.getUint32(p + 42, true);
    const nome = dec.decode(bytes.subarray(p + 46, p + 46 + lNome));
    lista.push({ nome, metodo, tamanho, original, local });
    p += 46 + lNome + lExtra + lComent;
  }
  return lista;
}

/** Bytes (descompactados) de uma entrada do ZIP. */
export async function lerEntrada(bytes: Uint8Array, e: EntradaZip): Promise<Uint8Array> {
  const v = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (v.getUint32(e.local, true) !== ASSINATURA_LOCAL) throw new Error('ZIP corrompido.');
  const inicio = e.local + 30 + v.getUint16(e.local + 26, true) + v.getUint16(e.local + 28, true);
  const dados = bytes.subarray(inicio, inicio + e.tamanho);
  if (e.metodo === 0) return dados;
  if (e.metodo !== 8) throw new Error('Compactação do .docx não suportada.');
  if (e.original > 50 * 1024 * 1024) throw new Error('O texto do .docx é grande demais.');
  const ds = new DecompressionStream('deflate-raw');
  const saida = new Response(dados as BodyInit).body!.pipeThrough(ds);
  return new Uint8Array(await new Response(saida).arrayBuffer());
}

const ENTIDADES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
};

/** Texto (uma linha por parágrafo) do XML do Word. */
export function textoDoXmlWord(xml: string): string {
  return xml
    .replace(/<w:tab\/>/g, '\t')
    .replace(/<w:br[^>]*\/>/g, '\n')
    .replace(/<\/w:p>/g, '\n')
    .replace(/<w:delText[^>]*>[\s\S]*?<\/w:delText>/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&(#x?[0-9a-f]+|\w+);/gi, (m, e: string) => {
      if (e[0] === '#') {
        const n = e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
        return Number.isFinite(n) && n > 0 && n < 0x110000 ? String.fromCodePoint(n) : '';
      }
      return ENTIDADES[e] ?? m;
    })
    .replace(/[ \u00a0]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Texto de um .docx (ArrayBuffer do arquivo). */
export async function textoDoDocx(arquivo: ArrayBuffer): Promise<string> {
  if (arquivo.byteLength > LIMITE_DOCX) throw new Error('O arquivo passa de 15 MB.');
  const bytes = new Uint8Array(arquivo);
  const doc = entradasDoZip(bytes).find((e) => e.nome === 'word/document.xml');
  if (!doc) throw new Error('Este arquivo não tem texto do Word (word/document.xml).');
  const xml = new TextDecoder().decode(await lerEntrada(bytes, doc));
  return textoDoXmlWord(xml);
}
