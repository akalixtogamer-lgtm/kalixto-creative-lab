/**
 * Captura de frames (DOM): tira quadros de um vídeo local ou de imagens
 * enviadas, já reduzidos para caber no navegador.
 */
import { FrameReferencia, novoIdCmp } from '../../../kcx/comparar';
import { LARGURA_ANALISE, QuadroCinza } from '../../../kcx/analise';

/** Lado maior de cada frame guardado. */
export const LADO_FRAME = 960;

function reduzir(
  fonte: CanvasImageSource,
  largura: number,
  altura: number,
): { src: string; largura: number; altura: number } {
  const k = Math.min(1, LADO_FRAME / Math.max(largura, altura));
  const w = Math.max(1, Math.round(largura * k));
  const h = Math.max(1, Math.round(altura * k));
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  c.getContext('2d')?.drawImage(fonte, 0, 0, w, h);
  return { src: c.toDataURL('image/jpeg', 0.82), largura: w, altura: h };
}

/** Frame do vídeo no tempo atual (o vídeo precisa estar carregado). */
export function frameDoVideo(v: HTMLVideoElement, rotulo?: string): FrameReferencia {
  const r = reduzir(v, v.videoWidth, v.videoHeight);
  return {
    id: novoIdCmp('frame'),
    tempo: Math.round(v.currentTime * 100) / 100,
    ...r,
    ...(rotulo ? { rotulo } : {}),
  };
}

function esperar(v: HTMLVideoElement, evento: string): Promise<void> {
  return new Promise((ok, erro) => {
    const t = setTimeout(() => erro(new Error('O vídeo não respondeu.')), 8000);
    v.addEventListener(
      evento,
      () => {
        clearTimeout(t);
        ok();
      },
      { once: true },
    );
    v.addEventListener(
      'error',
      () => {
        clearTimeout(t);
        erro(new Error('O navegador não conseguiu abrir este vídeo.'));
      },
      { once: true },
    );
  });
}

/** Tira `quantos` frames espaçados por igual (num vídeo separado, sem mexer no que está na tela). */
export async function extrairFrames(url: string, quantos: number): Promise<FrameReferencia[]> {
  const v = document.createElement('video');
  v.muted = true;
  v.preload = 'auto';
  v.playsInline = true;
  v.src = url;
  await esperar(v, 'loadeddata');
  const dur = v.duration;
  if (!Number.isFinite(dur) || dur <= 0) throw new Error('Vídeo sem duração.');
  const out: FrameReferencia[] = [];
  const n = Math.max(1, Math.min(24, Math.round(quantos)));
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0 : (dur * i) / (n - 1);
    v.currentTime = Math.min(dur - 0.05, Math.max(0, t));
    await esperar(v, 'seeked');
    out.push(frameDoVideo(v));
  }
  v.removeAttribute('src');
  v.load();
  return out;
}

/** Imagens enviadas viram frames (sem tempo). */
export async function framesDeImagens(arquivos: File[]): Promise<FrameReferencia[]> {
  const out: FrameReferencia[] = [];
  for (const a of arquivos.slice(0, 24)) {
    if (!/^image\/(png|jpeg|webp|gif|avif)$/.test(a.type)) continue;
    const bmp = await createImageBitmap(a);
    out.push({
      id: novoIdCmp('frame'),
      tempo: null,
      ...reduzir(bmp, bmp.width, bmp.height),
      rotulo: a.name.replace(/\.[^.]+$/, '').slice(0, 60),
    });
    bmp.close();
  }
  return out;
}

/** Cor de um ponto de uma imagem ou vídeo (coordenadas no tamanho natural). */
export function corNoPonto(
  fonte: HTMLImageElement | HTMLVideoElement,
  x: number,
  y: number,
): string | null {
  const w = fonte instanceof HTMLVideoElement ? fonte.videoWidth : fonte.naturalWidth;
  const h = fonte instanceof HTMLVideoElement ? fonte.videoHeight : fonte.naturalHeight;
  if (!w || !h) return null;
  const c = document.createElement('canvas');
  c.width = 1;
  c.height = 1;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;
  // Média de 3×3 px para não pegar um pixel de borda.
  ctx.drawImage(fonte, Math.max(0, x - 1), Math.max(0, y - 1), 3, 3, 0, 0, 1, 1);
  const d = ctx.getImageData(0, 0, 1, 1).data;
  return `#${[d[0], d[1], d[2]].map((n) => n.toString(16).padStart(2, '0')).join('')}`;
}

/* ------------------------------ Web Intelligence ------------------------------ */

/** Desenha uma fonte em tons de cinza com `largura` px (a altura segue a proporção). */
function cinza(
  fonte: CanvasImageSource,
  w0: number,
  h0: number,
  t: number,
  largura: number,
): QuadroCinza {
  const w = largura;
  const h = Math.max(8, Math.round((h0 / w0) * largura));
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(fonte, 0, 0, w, h);
  const d = ctx.getImageData(0, 0, w, h).data;
  const px = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++)
    px[i] = Math.round(0.2126 * d[i * 4] + 0.7152 * d[i * 4 + 1] + 0.0722 * d[i * 4 + 2]);
  return { t, largura: w, altura: h, px };
}

/**
 * Amostra o vídeo em `fps` quadros por segundo (no máximo `limite`), num
 * elemento separado: o vídeo da tela não se mexe.
 */
export async function quadrosDoVideo(
  url: string,
  fps: number,
  limite = 240,
  progresso?: (feito: number, total: number) => void,
): Promise<{ quadros: QuadroCinza[]; largura: number }> {
  const v = document.createElement('video');
  v.muted = true;
  v.preload = 'auto';
  v.playsInline = true;
  v.src = url;
  await esperar(v, 'loadeddata');
  const dur = v.duration;
  if (!Number.isFinite(dur) || dur <= 0) throw new Error('Vídeo sem duração.');
  const passo = Math.max(1 / fps, dur / limite);
  const total = Math.floor(dur / passo) + 1;
  const quadros: QuadroCinza[] = [];
  for (let i = 0; i < total; i++) {
    v.currentTime = Math.min(dur - 0.01, i * passo);
    await esperar(v, 'seeked');
    quadros.push(
      cinza(
        v,
        v.videoWidth,
        v.videoHeight,
        Math.round(v.currentTime * 1000) / 1000,
        LARGURA_ANALISE,
      ),
    );
    progresso?.(i + 1, total);
  }
  const largura = v.videoWidth;
  v.removeAttribute('src');
  v.load();
  return { quadros, largura };
}

/** Os frames da referência, na ordem, como sequência (sem tempo: 1 por segundo). */
export async function quadrosDosFrames(
  frames: FrameReferencia[],
): Promise<{ quadros: QuadroCinza[]; largura: number }> {
  const quadros: QuadroCinza[] = [];
  let largura = 0;
  let base: { w: number; h: number } | null = null;
  for (const [i, f] of frames.entries()) {
    const img = new Image();
    img.src = f.src;
    await img.decode();
    base ??= { w: img.naturalWidth, h: img.naturalHeight };
    largura ||= f.largura;
    // Todos no tamanho do primeiro (a análise compara quadros do mesmo tamanho).
    quadros.push(cinza(img, base.w, base.h, f.tempo ?? i, LARGURA_ANALISE));
  }
  return { quadros, largura };
}
