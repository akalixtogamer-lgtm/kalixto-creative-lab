import { Injectable, signal } from '@angular/core';
import {
  ImagemMood,
  LADO_MAXIMO,
  LIMITE_MOODBOARD,
  Moodboard,
  moodboardVazio,
  paletaDePixels,
  recusarArquivo,
  reduzir,
} from '../../kcx/projeto/moodboard';
import { novoId } from '../../kcx/projeto/navegacao';

const BANCO = 'kalixto-lab';
const LOJA = 'projeto';
const CHAVE = 'moodboard:v1';

function abrir(): Promise<IDBDatabase> {
  return new Promise((ok, erro) => {
    const r = globalThis.indexedDB.open(BANCO, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(LOJA);
    r.onsuccess = () => ok(r.result);
    r.onerror = () => erro(r.error);
  });
}

async function operar<T>(
  modo: IDBTransactionMode,
  fazer: (s: IDBObjectStore) => IDBRequest,
): Promise<T> {
  const db = await abrir();
  try {
    return await new Promise<T>((ok, erro) => {
      const r = fazer(db.transaction(LOJA, modo).objectStore(LOJA));
      r.onsuccess = () => ok(r.result as T);
      r.onerror = () => erro(r.error);
    });
  } finally {
    db.close();
  }
}

/** Lê o moodboard guardado, aceitando só o que tem a forma certa. */
function validar(dado: unknown): Moodboard | null {
  const m = dado as Moodboard;
  if (!m || typeof m !== 'object' || !Array.isArray(m.imagens)) return null;
  const base = moodboardVazio();
  return {
    titulo: typeof m.titulo === 'string' ? m.titulo.slice(0, 120) : base.titulo,
    palavras: typeof m.palavras === 'string' ? m.palavras.slice(0, 500) : '',
    layout: m.layout === 'grade' ? 'grade' : 'mosaico',
    imagens: m.imagens
      .filter(
        (i) =>
          i &&
          typeof i.id === 'string' &&
          typeof i.src === 'string' &&
          /^data:image\/(png|jpeg|webp|gif|avif);base64,/.test(i.src),
      )
      .slice(0, LIMITE_MOODBOARD)
      .map((i) => ({
        id: i.id,
        nome: String(i.nome ?? '').slice(0, 120),
        legenda: String(i.legenda ?? '').slice(0, 300),
        src: i.src,
        largura: Number(i.largura) || 1,
        altura: Number(i.altura) || 1,
        cores: Array.isArray(i.cores)
          ? i.cores.filter((c) => /^#[0-9a-f]{6}$/i.test(c)).slice(0, 6)
          : [],
      })),
  };
}

/** Reduz a imagem (até 1600 px no lado maior) e tira as cores principais. */
export async function prepararImagem(arquivo: File): Promise<ImagemMood> {
  const motivo = recusarArquivo(arquivo);
  if (motivo) throw new Error(motivo);
  let bmp: ImageBitmap;
  try {
    bmp = await createImageBitmap(arquivo);
  } catch {
    throw new Error(`${arquivo.name}: o navegador não conseguiu abrir a imagem.`);
  }
  const { l, a } = reduzir(bmp.width, bmp.height, LADO_MAXIMO);
  const canvas = document.createElement('canvas');
  canvas.width = l;
  canvas.height = a;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Sem canvas neste navegador.');
  ctx.drawImage(bmp, 0, 0, l, a);
  // Paleta a partir de uma miniatura (rápido e suficiente).
  const mini = document.createElement('canvas');
  const m = reduzir(l, a, 64);
  mini.width = m.l;
  mini.height = m.a;
  const mctx = mini.getContext('2d')!;
  mctx.drawImage(canvas, 0, 0, m.l, m.a);
  const cores = paletaDePixels(mctx.getImageData(0, 0, m.l, m.a).data, 5);
  bmp.close();
  let src = canvas.toDataURL('image/webp', 0.82);
  if (!src.startsWith('data:image/webp')) src = canvas.toDataURL('image/jpeg', 0.85);
  return {
    id: novoId('img'),
    nome: arquivo.name.replace(/\.[^.]+$/, '').slice(0, 120),
    legenda: '',
    src,
    largura: l,
    altura: a,
    cores,
  };
}

/**
 * O moodboard fica no IndexedDB do navegador (as imagens não cabem no
 * localStorage). Sem IndexedDB, funciona só enquanto a página estiver aberta.
 */
@Injectable({ providedIn: 'root' })
export class KcxMoodboardService {
  readonly moodboard = signal<Moodboard>(moodboardVazio());
  readonly carregado = signal(false);
  /** false = o navegador não deixou guardar (aba anônima, cota cheia…). */
  readonly persistente = signal(true);

  constructor() {
    void this.carregar();
  }

  private async carregar(): Promise<void> {
    try {
      const m = validar(await operar<unknown>('readonly', (s) => s.get(CHAVE)));
      if (m) this.moodboard.set(m);
    } catch {
      this.persistente.set(false);
    } finally {
      this.carregado.set(true);
    }
  }

  private async salvar(): Promise<void> {
    try {
      await operar('readwrite', (s) => s.put(this.moodboard(), CHAVE));
      this.persistente.set(true);
    } catch {
      this.persistente.set(false);
    }
  }

  alterar(mudar: (m: Moodboard) => void): void {
    const m = structuredClone(this.moodboard());
    mudar(m);
    this.moodboard.set(m);
    void this.salvar();
  }

  definir(m: Moodboard): void {
    this.moodboard.set(m);
    void this.salvar();
  }
}
