/**
 * Moodboard: até 20 imagens de referência, com legenda e a paleta tirada
 * delas. TS puro: a leitura das imagens (canvas) fica na página.
 */
import { Briefing } from './briefing';

export const LIMITE_MOODBOARD = 20;
/** Tamanho máximo do arquivo enviado (antes de reduzir). */
export const LIMITE_IMAGEM = 15 * 1024 * 1024;
/** Lado maior depois de reduzir. */
export const LADO_MAXIMO = 1600;
export const TIPOS_IMAGEM = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif'];

export interface ImagemMood {
  id: string;
  nome: string;
  legenda: string;
  /** data:image/... já reduzida. */
  src: string;
  largura: number;
  altura: number;
  /** Cores principais da imagem (hex), da mais presente para a menos. */
  cores: string[];
}

export interface Moodboard {
  titulo: string;
  /** Palavras que resumem o clima (ex.: urbano, vibrante, acolhedor). */
  palavras: string;
  layout: 'mosaico' | 'grade';
  imagens: ImagemMood[];
}

export function moodboardVazio(): Moodboard {
  return { titulo: 'Moodboard', palavras: '', layout: 'mosaico', imagens: [] };
}

/** Quantas das imagens escolhidas cabem (e quantas ficam de fora). */
export function vagas(atual: number, novas: number): { entram: number; sobram: number } {
  const livres = Math.max(0, LIMITE_MOODBOARD - atual);
  const entram = Math.min(livres, novas);
  return { entram, sobram: novas - entram };
}

/** Motivo para recusar um arquivo (ou null se pode). */
export function recusarArquivo(f: { type: string; size: number; name: string }): string | null {
  if (!TIPOS_IMAGEM.includes(f.type)) return `${f.name}: use PNG, JPG, WebP, GIF ou AVIF.`;
  if (f.size > LIMITE_IMAGEM) return `${f.name}: passa de 15 MB.`;
  return null;
}

/** Medidas para caber em LADO_MAXIMO mantendo a proporção. */
export function reduzir(l: number, a: number, max = LADO_MAXIMO): { l: number; a: number } {
  const k = Math.min(1, max / Math.max(l, a, 1));
  return { l: Math.max(1, Math.round(l * k)), a: Math.max(1, Math.round(a * k)) };
}

const hex2 = (n: number) => n.toString(16).padStart(2, '0');
const paraHex = (r: number, g: number, b: number) => `#${hex2(r)}${hex2(g)}${hex2(b)}`;
const deHex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
function distancia(a: string, b: string): number {
  const [r1, g1, b1] = deHex(a);
  const [r2, g2, b2] = deHex(b);
  // Distância "redmean": barata e mais perto da percepção que a euclidiana pura.
  const rm = (r1 + r2) / 2;
  const dr = r1 - r2,
    dg = g1 - g2,
    db = b1 - b2;
  return Math.sqrt((2 + rm / 256) * dr * dr + 4 * dg * dg + (2 + (255 - rm) / 256) * db * db);
}

/**
 * Cores principais de uma imagem a partir dos pixels RGBA (já reduzida, ex.: 64×64).
 * Agrupa em caixas de 4 bits por canal, ignora transparentes e junta cores parecidas.
 */
export function paletaDePixels(rgba: ArrayLike<number>, quantas = 5): string[] {
  const caixas = new Map<number, { n: number; r: number; g: number; b: number }>();
  for (let i = 0; i + 3 < rgba.length; i += 4) {
    if (rgba[i + 3] < 128) continue;
    const r = rgba[i],
      g = rgba[i + 1],
      b = rgba[i + 2];
    const k = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4);
    const c = caixas.get(k) ?? { n: 0, r: 0, g: 0, b: 0 };
    c.n++;
    c.r += r;
    c.g += g;
    c.b += b;
    caixas.set(k, c);
  }
  const ordenadas = [...caixas.values()]
    .sort((a, b) => b.n - a.n)
    .map((c) => paraHex(Math.round(c.r / c.n), Math.round(c.g / c.n), Math.round(c.b / c.n)));
  return distintas(ordenadas, quantas);
}

function distintas(cores: string[], quantas: number, minimo = 60): string[] {
  const saida: string[] = [];
  for (const c of cores) {
    if (saida.every((s) => distancia(s, c) >= minimo)) saida.push(c);
    if (saida.length >= quantas) break;
  }
  return saida;
}

/** Paleta do moodboard inteiro: as cores que mais aparecem entre as imagens. */
export function paletaGeral(imagens: Pick<ImagemMood, 'cores'>[], quantas = 8): string[] {
  const peso = new Map<string, number>();
  for (const im of imagens)
    im.cores.forEach((c, i) => peso.set(c, (peso.get(c) ?? 0) + (im.cores.length - i)));
  const ordenadas = [...peso.entries()].sort((a, b) => b[1] - a[1]).map(([c]) => c);
  return distintas(ordenadas, quantas, 45);
}

/** Saturação (0–1) e luminosidade (0–1) de um hex, para sugerir funções. */
function hsl(h: string): { s: number; l: number } {
  const [r, g, b] = deHex(h).map((x) => x / 255);
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  return { s: d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1)), l };
}

/**
 * Sugestão de papel para as cores da paleta: as mais vivas viram marca
 * (primária, secundária, destaque); a mais escura, fundo; a mais clara, texto.
 */
export function sugerirPapeis(
  paleta: string[],
): Partial<Record<'primaria' | 'secundaria' | 'destaque' | 'fundo' | 'texto', string>> {
  if (!paleta.length) return {};
  const info = paleta.map((c) => ({ c, ...hsl(c) }));
  const vivas = info.filter((x) => x.s > 0.25 && x.l > 0.2 && x.l < 0.85).sort((a, b) => b.s - a.s);
  const escura = [...info].sort((a, b) => a.l - b.l)[0];
  const clara = [...info].sort((a, b) => b.l - a.l)[0];
  const r: ReturnType<typeof sugerirPapeis> = {};
  if (vivas[0]) r.primaria = vivas[0].c;
  if (vivas[1]) r.secundaria = vivas[1].c;
  if (vivas[2]) r.destaque = vivas[2].c;
  if (escura && escura.l < 0.25) r.fundo = escura.c;
  if (clara && clara.l > 0.8) r.texto = clara.c;
  return r;
}

const esc = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  );
const corSegura = (c: string) => /^#[0-9a-f]{6}$/i.test(c);
const srcSeguro = (s: string) =>
  /^data:image\/(png|jpeg|webp|gif|avif);base64,[a-z0-9+/=]+$/i.test(s) ? s : '';

/** HTML autônomo do moodboard (para guardar, mandar ou imprimir em PDF). */
export function moodboardHtml(m: Moodboard, briefing?: Partial<Briefing>): string {
  const paleta = paletaGeral(m.imagens).filter(corSegura);
  const palavras = m.palavras
    .split(/[,;\n]/)
    .map((p) => p.trim())
    .filter(Boolean)
    .slice(0, 20);
  const contexto = briefing
    ? (
        [
          ['Projeto', briefing.projeto],
          ['Objetivo', briefing.objetivo],
          ['Público', briefing.publico],
          ['Tom e estilo', briefing.tom],
        ] as const
      )
        .filter(([, v]) => v?.trim())
        .map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v!.trim().slice(0, 400))}</dd></div>`)
        .join('')
    : '';
  const figuras = m.imagens
    .map((im) => {
      const src = srcSeguro(im.src);
      if (!src) return '';
      const cores = im.cores
        .filter(corSegura)
        .map((c) => `<i style="background:${esc(c)}" title="${esc(c)}"></i>`)
        .join('');
      return `<figure><img src="${src}" alt="${esc(im.legenda || im.nome)}" width="${im.largura}" height="${im.altura}">${
        im.legenda ? `<figcaption>${esc(im.legenda)}</figcaption>` : ''
      }<div class="cores">${cores}</div></figure>`;
    })
    .join('');
  const colunas = m.layout === 'grade' ? 'grade' : 'mosaico';
  return `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; style-src 'unsafe-inline'">
<title>${esc(m.titulo || 'Moodboard')}</title>
<style>
*{box-sizing:border-box}body{margin:0;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;background:#0f0e17;color:#f4f2fb;padding:40px}
h1{font-size:40px;margin:0 0 8px;letter-spacing:-.5px}.palavras{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0 24px;padding:0;list-style:none}
.palavras li{border:1px solid #ffffff33;border-radius:999px;padding:4px 14px;font-size:14px}
dl{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px 24px;margin:0 0 28px}dt{font-size:12px;text-transform:uppercase;letter-spacing:1px;opacity:.65}dd{margin:4px 0 0;font-size:14px;line-height:1.5;white-space:pre-line}
.paleta{display:flex;gap:0;border-radius:14px;overflow:hidden;margin:0 0 28px;height:72px}.paleta div{flex:1;display:flex;align-items:flex-end;padding:8px;font:12px ui-monospace,monospace;color:#fff;text-shadow:0 1px 2px #0008}
.mosaico{columns:4 240px;column-gap:16px}.mosaico figure{break-inside:avoid;margin:0 0 16px}
.grade{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px}.grade img{aspect-ratio:4/3;object-fit:cover}
figure{margin:0;background:#1b1a29;border-radius:14px;overflow:hidden}img{display:block;width:100%;height:auto}
figcaption{padding:10px 12px 0;font-size:14px;line-height:1.4}.cores{display:flex;gap:4px;padding:10px 12px 12px}.cores i{width:16px;height:16px;border-radius:50%;border:1px solid #fff3}
@media print{body{background:#fff;color:#111;padding:16px}figure{background:#f3f2f7}.palavras li{border-color:#0003}}
</style></head><body>
<h1>${esc(m.titulo || 'Moodboard')}</h1>
${palavras.length ? `<ul class="palavras">${palavras.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>` : ''}
${contexto ? `<dl>${contexto}</dl>` : ''}
${paleta.length ? `<div class="paleta">${paleta.map((c) => `<div style="background:${c}">${c}</div>`).join('')}</div>` : ''}
<main class="${colunas}">${figuras}</main>
</body></html>`;
}
