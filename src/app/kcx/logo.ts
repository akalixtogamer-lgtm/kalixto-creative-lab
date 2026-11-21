/**
 * Logo (e imagens enviadas pela pessoa) dentro dos componentes KCX.
 *
 * A imagem fica embutida como data URL (o lab não tem servidor). Formatos:
 * PNG, JPG, WebP, GIF e SVG. SVG com script, eventos (on…), foreignObject ou
 * links javascript: é recusado: ele vai para o preview e para o Figma.
 *
 * No código vira <img>. No Figma: SVG vira vetor editável; as outras viram um
 * retângulo com preenchimento de imagem (IMAGE).
 */
import { KcxNo } from './kcx.types';

export interface KcxLogo {
  /** data:image/...;base64,… */
  src: string;
  /** Tamanho natural em px (para manter a proporção). */
  largura: number;
  altura: number;
  nome?: string;
}

/** Tamanho máximo do arquivo (fica guardado no navegador e no .kcx.json). */
export const MAX_BYTES_IMAGEM = 400 * 1024;

const RASTER = /^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/]+=*$/;
const SVG_B64 = /^data:image\/svg\+xml;base64,([A-Za-z0-9+/]+=*)$/;
const SVG_TXT = /^data:image\/svg\+xml(;charset=utf-8)?,(.+)$/is;
const PERIGOSO = /<script|<foreignObject|\son[a-z]+\s*=|javascript:|<iframe|<embed|<object/i;

function decodificarBase64(b64: string): string {
  const bin = atob(b64);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/** Texto do SVG de uma data URL SVG (ou null se não for SVG). */
export function svgDaDataUrl(src: string): string | null {
  try {
    const b = SVG_B64.exec(src);
    if (b) return decodificarBase64(b[1]);
    const t = SVG_TXT.exec(src);
    if (t) return decodeURIComponent(t[2]);
  } catch {
    return null;
  }
  return null;
}

/** Problema da imagem (vazio = pode usar). */
export function problemaDaImagem(src: string): string | null {
  if (typeof src !== 'string' || !src.startsWith('data:image/'))
    return 'Envie um arquivo de imagem (PNG, JPG, WebP, GIF ou SVG).';
  if (src.length * 0.75 > MAX_BYTES_IMAGEM)
    return `Imagem muito grande: até ${Math.round(MAX_BYTES_IMAGEM / 1024)} KB.`;
  if (RASTER.test(src)) return null;
  const svg = svgDaDataUrl(src);
  if (svg === null) return 'Formato não aceito: use PNG, JPG, WebP, GIF ou SVG.';
  if (!/<svg[\s>]/i.test(svg)) return 'O arquivo SVG não tem uma tag <svg>.';
  if (PERIGOSO.test(svg)) return 'Este SVG tem script ou eventos: exporte de novo sem eles.';
  return null;
}

export const ehImagemValida = (src: unknown): src is string =>
  typeof src === 'string' && problemaDaImagem(src) === null;

export const ehSvg = (src: string) => src.startsWith('data:image/svg+xml');

/** Valida um objeto de logo (fundação ou configuração). */
export function validarLogo(l: unknown): string[] {
  const o = l as Partial<KcxLogo> | null;
  if (!o || typeof o !== 'object') return ['logo precisa ser um objeto.'];
  const erros: string[] = [];
  const p = problemaDaImagem(o.src as string);
  if (p) erros.push(`logo: ${p}`);
  for (const k of ['largura', 'altura'] as const)
    if (!(Number(o[k]) > 0 && Number(o[k]) <= 10000)) erros.push(`logo.${k} precisa ser > 0.`);
  return erros;
}

/** Largura para uma altura, mantendo a proporção. */
export const larguraPara = (l: KcxLogo, altura: number) =>
  Math.max(1, Math.round((l.largura / l.altura) * altura));

/**
 * Nó do Figma para a imagem: SVG vira vetor (cores originais); as outras viram
 * retângulo com preenchimento de imagem.
 */
export function noDaImagem(
  id: string,
  nome: string,
  src: string,
  largura: number,
  altura: number,
  ajuste: 'caber' | 'preencher' = 'caber',
  extra: Partial<KcxNo> = {},
): KcxNo {
  const svg = ehImagemValida(src) && ehSvg(src) ? svgDaDataUrl(src) : null;
  if (svg) return { id, nome, tipo: 'svg', svg, largura, altura, ...extra };
  return {
    id,
    nome,
    tipo: 'retangulo',
    largura,
    altura,
    preenchimentos: ehImagemValida(src)
      ? [{ tipo: 'imagem', src, ajuste }]
      : [{ tipo: 'solido', cor: '#8a84a8' }],
    ...extra,
  };
}

/** Lê um arquivo do computador e devolve a logo (data URL + tamanho natural). */
export async function lerImagem(arquivo: File): Promise<KcxLogo> {
  if (arquivo.size > MAX_BYTES_IMAGEM)
    throw new Error(`Imagem muito grande: até ${Math.round(MAX_BYTES_IMAGEM / 1024)} KB.`);
  const src = await new Promise<string>((ok, erro) => {
    const r = new FileReader();
    r.onload = () => ok(String(r.result));
    r.onerror = () => erro(new Error('Não deu para ler o arquivo.'));
    r.readAsDataURL(arquivo);
  });
  const p = problemaDaImagem(src);
  if (p) throw new Error(p);
  const { largura, altura } = await new Promise<{ largura: number; altura: number }>((ok) => {
    const img = new Image();
    img.onload = () => ok({ largura: img.naturalWidth || 200, altura: img.naturalHeight || 60 });
    img.onerror = () => ok({ largura: 200, altura: 60 });
    img.src = src;
  });
  return { src, largura, altura, nome: arquivo.name };
}
