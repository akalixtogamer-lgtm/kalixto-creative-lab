import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Tela } from '../../kcx/construtor';
import { Briefing, briefingDoJson, briefingVazio, normalizar } from '../../kcx/projeto/briefing';
import {
  Navegacao,
  PaginaMapa,
  lerNavegacao,
  navegacaoVazia,
  novoId,
} from '../../kcx/projeto/navegacao';
import { KcxMeusService } from './kcx-meus.service';

export interface TelaProjeto extends Tela {
  id: string;
}

const CHAVE_TELA_V1 = 'kalixto-lab:kcx-tela:v1';
export const CHAVE_TELAS = 'kalixto-lab:kcx-telas:v2';
export const CHAVE_NAVEGACAO = 'kalixto-lab:kcx-navegacao:v1';
export const CHAVE_BRIEFING = 'kalixto-lab:kcx-briefing:v1';
export const LIMITE_TELAS = 40;

const storage = (): Storage | null => {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
};
const ler = (k: string): unknown => {
  try {
    return JSON.parse(storage()?.getItem(k) ?? 'null');
  } catch {
    return null;
  }
};
const gravar = (k: string, v: unknown) => {
  try {
    storage()?.setItem(k, JSON.stringify(v));
  } catch {
    /* sem espaço ou bloqueado: segue em memória */
  }
};

export function telaNova(nome: string): TelaProjeto {
  return {
    id: novoId('tela'),
    nome,
    dispositivo: 'desktop',
    fidelidade: 'alta',
    secoes: [],
  };
}

function telaValida(t: unknown): t is Tela {
  const x = t as Tela;
  return !!x && typeof x.nome === 'string' && Array.isArray(x.secoes);
}

/** Lê as telas salvas (e migra a tela única da versão anterior). */
function lerTelas(): { telas: TelaProjeto[]; atual: string } {
  const v2 = ler(CHAVE_TELAS) as { telas?: unknown[]; atual?: string } | null;
  let telas: TelaProjeto[] = [];
  if (v2 && Array.isArray(v2.telas))
    telas = v2.telas
      .filter(telaValida)
      .slice(0, LIMITE_TELAS)
      .map((t) => ({
        ...t,
        id: typeof (t as TelaProjeto).id === 'string' ? (t as TelaProjeto).id : novoId('tela'),
        secoes: t.secoes.filter((s) => typeof s === 'string'),
      }));
  if (!telas.length) {
    const v1 = ler(CHAVE_TELA_V1);
    telas = [telaValida(v1) ? { ...v1, id: novoId('tela') } : telaNova('Página inicial')];
  }
  const atual = telas.find((t) => t.id === v2?.atual)?.id ?? telas[0].id;
  return { telas, atual };
}

/**
 * O projeto: as páginas das Telas, o mapa de navegação, os fluxos e o
 * briefing. Tudo no navegador (localStorage).
 */
@Injectable({ providedIn: 'root' })
export class KcxProjetoService {
  private readonly meus = inject(KcxMeusService);
  private readonly inicial = lerTelas();

  readonly telas = signal<TelaProjeto[]>(this.inicial.telas);
  readonly atualId = signal(this.inicial.atual);
  readonly atual = computed(
    () => this.telas().find((t) => t.id === this.atualId()) ?? this.telas()[0],
  );
  readonly navegacao = signal<Navegacao>(lerNavegacao(ler(CHAVE_NAVEGACAO) ?? navegacaoVazia()));
  readonly briefing = signal<Briefing>(briefingDoJson(ler(CHAVE_BRIEFING)) ?? briefingVazio());

  /** As páginas como o mapa vê: nome e o nome de cada seção. */
  readonly paginas = computed<PaginaMapa[]>(() =>
    this.telas().map((t) => ({
      id: t.id,
      nome: t.nome || 'Sem nome',
      secoes: t.secoes.map((id) => this.meus.buscar(id)?.nome ?? '(componente apagado)'),
    })),
  );

  constructor() {
    effect(() => gravar(CHAVE_TELAS, { telas: this.telas(), atual: this.atualId() }));
    effect(() => gravar(CHAVE_NAVEGACAO, this.navegacao()));
    effect(() => gravar(CHAVE_BRIEFING, this.briefing()));
  }

  selecionar(id: string): void {
    if (this.telas().some((t) => t.id === id)) this.atualId.set(id);
  }

  alterarTela(id: string, mudar: (t: TelaProjeto) => void): void {
    this.telas.update((lista) =>
      lista.map((t) => {
        if (t.id !== id) return t;
        const c = structuredClone(t);
        mudar(c);
        return c;
      }),
    );
  }

  novaTela(nome = `Página ${this.telas().length + 1}`, base?: TelaProjeto): TelaProjeto | null {
    if (this.telas().length >= LIMITE_TELAS) return null;
    const t = base
      ? { ...structuredClone(base), id: novoId('tela'), nome }
      : { ...telaNova(nome), dispositivo: this.atual()?.dispositivo ?? 'desktop' };
    this.telas.update((l) => [...l, t]);
    this.atualId.set(t.id);
    return t;
  }

  duplicar(id: string): void {
    const t = this.telas().find((x) => x.id === id);
    if (t) this.novaTela(`${t.nome} (cópia)`, t);
  }

  /** Apaga a página e as ligações e passos que apontavam para ela. */
  excluir(id: string): void {
    if (this.telas().length <= 1) return;
    const i = this.telas().findIndex((t) => t.id === id);
    this.telas.update((l) => l.filter((t) => t.id !== id));
    if (this.atualId() === id) this.atualId.set(this.telas()[Math.max(0, i - 1)].id);
    this.alterarNavegacao((n) => {
      n.ligacoes = n.ligacoes.filter((l) => l.de !== id && l.para !== id);
      if (n.inicio === id) n.inicio = undefined;
      for (const f of n.fluxos) for (const p of f.passos) if (p.telaId === id) delete p.telaId;
    });
  }

  moverTela(i: number, j: number): void {
    this.telas.update((l) => {
      if (i < 0 || j < 0 || i >= l.length || j >= l.length) return l;
      const c = [...l];
      const [x] = c.splice(i, 1);
      c.splice(j, 0, x);
      return c;
    });
  }

  alterarNavegacao(mudar: (n: Navegacao) => void): void {
    const n = structuredClone(this.navegacao());
    mudar(n);
    this.navegacao.set(n);
  }

  /**
   * Cria uma página para cada nome que ainda não existe (ex.: as páginas do
   * briefing). Se só há a página inicial vazia, ela recebe o primeiro nome.
   */
  criarPaginas(nomes: string[]): number {
    const existentes = new Set(this.telas().map((t) => normalizar(t.nome)));
    const novos = nomes.filter((n) => !existentes.has(normalizar(n)));
    if (!novos.length) return 0;
    let criadas = 0;
    const so = this.telas();
    if (so.length === 1 && !so[0].secoes.length && /^p[aá]gina inicial$/i.test(so[0].nome)) {
      const nome = novos.shift()!;
      this.alterarTela(so[0].id, (t) => (t.nome = nome));
      criadas++;
    }
    const primeira = this.atualId();
    for (const n of novos) if (this.novaTela(n)) criadas++;
    this.atualId.set(primeira);
    return criadas;
  }
}
