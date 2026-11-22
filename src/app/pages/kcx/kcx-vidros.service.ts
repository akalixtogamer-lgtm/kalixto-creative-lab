import { Injectable, signal } from '@angular/core';
import { AjustesVidro, IDS_VIDRO } from '../../kcx/construtor';
import { novoId } from '../../kcx/projeto/navegacao';

export const CHAVE_VIDROS = 'kalixto-lab:kcx-vidros:v1';
export const LIMITE_VIDROS = 30;

export interface VidroSalvo {
  id: string;
  nome: string;
  ajustes: AjustesVidro;
}

const CHAVES = Object.keys(IDS_VIDRO).filter((k) => k !== 'corVeu') as (keyof AjustesVidro)[];

/** Só números válidos das chaves conhecidas. */
export function limparAjustes(a: unknown): AjustesVidro {
  const o = (a && typeof a === 'object' ? a : {}) as Record<string, unknown>;
  const r: AjustesVidro = {};
  for (const k of CHAVES) {
    const v = Number(o[k]);
    if (o[k] !== undefined && Number.isFinite(v)) r[k] = v;
  }
  return r;
}

/**
 * Meus vidros: ajustes de vidro salvos com nome, para aplicar em qualquer
 * componente (ficam no navegador).
 */
@Injectable({ providedIn: 'root' })
export class KcxVidrosService {
  readonly salvos = signal<VidroSalvo[]>(this.ler());

  private ler(): VidroSalvo[] {
    try {
      const x = JSON.parse(globalThis.localStorage?.getItem(CHAVE_VIDROS) ?? '[]');
      return (Array.isArray(x) ? x : [])
        .filter((v) => v && typeof v.nome === 'string')
        .slice(0, LIMITE_VIDROS)
        .map((v) => ({
          id: typeof v.id === 'string' ? v.id : novoId('vidro'),
          nome: v.nome.slice(0, 40),
          ajustes: limparAjustes(v.ajustes),
        }));
    } catch {
      return [];
    }
  }
  private gravar(): void {
    try {
      globalThis.localStorage?.setItem(CHAVE_VIDROS, JSON.stringify(this.salvos()));
    } catch {
      /* sem espaço: fica em memória */
    }
  }

  salvar(nome: string, ajustes: AjustesVidro): VidroSalvo | null {
    const n = nome.trim().slice(0, 40);
    if (!n) return null;
    const existente = this.salvos().find((v) => v.nome.toLowerCase() === n.toLowerCase());
    const v: VidroSalvo = {
      id: existente?.id ?? novoId('vidro'),
      nome: n,
      ajustes: limparAjustes(ajustes),
    };
    if (!existente && this.salvos().length >= LIMITE_VIDROS) return null;
    this.salvos.update((l) => (existente ? l.map((x) => (x.id === v.id ? v : x)) : [...l, v]));
    this.gravar();
    return v;
  }

  remover(id: string): void {
    this.salvos.update((l) => l.filter((v) => v.id !== id));
    this.gravar();
  }
}
