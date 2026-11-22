import { Injectable, computed, signal } from '@angular/core';
import {
  LIMITE_SESSOES,
  SessaoComparacao,
  lerSessao,
  novaSessao,
  novoIdCmp,
} from '../../kcx/comparar';

/**
 * Sessões do comparador Reference vs. Reconstruction, guardadas no IndexedDB
 * do navegador (frames e vídeos são grandes demais para o localStorage).
 * Mesmo banco do moodboard: `kalixto-lab` / loja `projeto`.
 */
const BANCO = 'kalixto-lab';
const LOJA = 'projeto';
const CHAVE_SESSOES = 'comparar:sessoes:v1';
const CHAVE_ATUAL = 'comparar:atual:v1';
const PREFIXO_VIDEO = 'comparar:video:';
/** Vídeos maiores que isso não são guardados (continuam valendo até recarregar). */
export const LIMITE_VIDEO = 200 * 1024 * 1024;

function abrir(): Promise<IDBDatabase> {
  return new Promise((ok, erro) => {
    if (!globalThis.indexedDB) {
      erro(new Error('Sem IndexedDB'));
      return;
    }
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

@Injectable({ providedIn: 'root' })
export class KcxComparacaoService {
  readonly sessoes = signal<SessaoComparacao[]>([]);
  readonly atualId = signal<string>('');
  readonly carregado = signal(false);
  /** Mensagem quando o navegador recusa guardar (modo privado, espaço cheio…). */
  readonly aviso = signal('');
  readonly atual = computed(() => this.sessoes().find((s) => s.id === this.atualId()) ?? null);

  private gravando: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    void this.carregar();
  }

  private async carregar(): Promise<void> {
    try {
      const bruto = await operar<unknown>('readonly', (s) => s.get(CHAVE_SESSOES));
      const lista = (Array.isArray(bruto) ? bruto : [])
        .map(lerSessao)
        .filter((s): s is SessaoComparacao => !!s);
      const atual = await operar<unknown>('readonly', (s) => s.get(CHAVE_ATUAL));
      // Não sobrescreve o que a pessoa já fez antes do banco responder.
      this.sessoes.update((agora) => [
        ...agora,
        ...lista.filter((s) => !agora.some((x) => x.id === s.id)),
      ]);
      if (!this.atualId()) {
        const id = typeof atual === 'string' && lista.some((s) => s.id === atual) ? atual : '';
        this.atualId.set(id || this.sessoes()[0]?.id || '');
      }
    } catch {
      this.aviso.set(
        'Este navegador não deixou guardar as comparações: elas valem até recarregar.',
      );
    } finally {
      this.carregado.set(true);
    }
  }

  private persistir(): void {
    if (this.gravando) clearTimeout(this.gravando);
    this.gravando = setTimeout(() => {
      this.gravando = null;
      const dados = JSON.parse(JSON.stringify(this.sessoes())) as unknown;
      operar('readwrite', (s) => s.put(dados, CHAVE_SESSOES))
        .then(() => operar('readwrite', (s) => s.put(this.atualId(), CHAVE_ATUAL)))
        .then(() => this.aviso.set(''))
        .catch(() =>
          this.aviso.set('O navegador recusou guardar (espaço cheio?). Exporte a comparação.'),
        );
    }, 400);
  }

  selecionar(id: string): void {
    if (this.sessoes().some((s) => s.id === id)) {
      this.atualId.set(id);
      this.persistir();
    }
  }

  criar(nome: string, componenteId: string): SessaoComparacao | null {
    if (this.sessoes().length >= LIMITE_SESSOES) {
      this.aviso.set(`Limite de ${LIMITE_SESSOES} comparações: exclua ou exporte uma antiga.`);
      return null;
    }
    const s = novaSessao(nome, componenteId);
    this.sessoes.update((l) => [s, ...l]);
    this.atualId.set(s.id);
    this.persistir();
    return s;
  }

  /** Muda a sessão atual (numa cópia) e guarda. */
  alterar(mudar: (s: SessaoComparacao) => void): void {
    const id = this.atualId();
    this.sessoes.update((l) =>
      l.map((s) => {
        if (s.id !== id) return s;
        const c = structuredClone(s);
        mudar(c);
        c.atualizadaEm = new Date().toISOString();
        return c;
      }),
    );
    this.persistir();
  }

  excluir(id: string): void {
    const s = this.sessoes().find((x) => x.id === id);
    if (s?.referencia.videoChave) void this.apagarVideo(s.referencia.videoChave);
    this.sessoes.update((l) => l.filter((x) => x.id !== id));
    if (this.atualId() === id) this.atualId.set(this.sessoes()[0]?.id ?? '');
    this.persistir();
  }

  /** Importa um .kcx-comparacao.json (o vídeo não vai no arquivo). */
  importar(dado: unknown): SessaoComparacao | null {
    const s = lerSessao(dado);
    if (!s) return null;
    if (this.sessoes().some((x) => x.id === s.id)) s.id = novoIdCmp('cmp');
    delete s.referencia.videoChave;
    this.sessoes.update((l) => [s, ...l]);
    this.atualId.set(s.id);
    this.persistir();
    return s;
  }

  /* ---------- vídeo ---------- */

  async salvarVideo(sessaoId: string, arquivo: Blob): Promise<string | null> {
    if (arquivo.size > LIMITE_VIDEO) return null;
    const chave = `${PREFIXO_VIDEO}${sessaoId}`;
    try {
      await operar('readwrite', (s) => s.put(arquivo, chave));
      return chave;
    } catch {
      return null;
    }
  }

  async lerVideo(chave: string): Promise<Blob | null> {
    if (!chave.startsWith(PREFIXO_VIDEO)) return null;
    try {
      const b = await operar<unknown>('readonly', (s) => s.get(chave));
      return b instanceof Blob ? b : null;
    } catch {
      return null;
    }
  }

  async apagarVideo(chave: string): Promise<void> {
    if (!chave.startsWith(PREFIXO_VIDEO)) return;
    try {
      await operar('readwrite', (s) => s.delete(chave));
    } catch {
      /* nada a fazer */
    }
  }
}
