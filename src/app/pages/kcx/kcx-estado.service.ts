import { Injectable } from '@angular/core';
import { KcxComponente } from '../../kcx/kcx.types';
import { Valores, normalizarValor, valoresAtuais } from '../../kcx/resolver';
import { RepositorioPresets } from '../../kcx/presets';

const CHAVE_VALORES = 'kalixto-lab:kcx-valores:v1';

function storageSeguro(): Storage | null {
  try {
    const s = globalThis.localStorage;
    const k = '__kcx_teste__';
    s.setItem(k, '1');
    s.removeItem(k);
    return s;
  } catch {
    return null;
  }
}

/**
 * Estado do KCX Studio no navegador: valores atuais de cada componente
 * (para a comparação Figma → Lab) e presets do usuário.
 */
@Injectable({ providedIn: 'root' })
export class KcxEstadoService {
  private readonly storage = storageSeguro();
  private memoria: Record<string, Valores> = {};
  readonly presets = new RepositorioPresets(this.storage);

  private lerTodos(): Record<string, Valores> {
    if (!this.storage) return this.memoria;
    try {
      return JSON.parse(this.storage.getItem(CHAVE_VALORES) ?? '{}') as Record<string, Valores>;
    } catch {
      return {};
    }
  }

  /** Valores salvos (validados contra a versão atual do componente). */
  valores(comp: KcxComponente): Valores {
    const salvos = this.lerTodos()[comp.id] ?? {};
    const out = valoresAtuais(comp.variaveis);
    for (const v of comp.variaveis)
      if (v.id in salvos) out[v.id] = normalizarValor(v, salvos[v.id]);
    return out;
  }

  salvar(comp: KcxComponente, valores: Valores): void {
    const todos = { ...this.lerTodos(), [comp.id]: valores };
    if (!this.storage) {
      this.memoria = todos;
      return;
    }
    try {
      this.storage.setItem(CHAVE_VALORES, JSON.stringify(todos));
    } catch {
      this.memoria = todos;
    }
  }
}

/** Baixa um texto ou bytes como arquivo. */
export function baixarArquivo(conteudo: string | Uint8Array, nome: string, tipo: string): void {
  const blob = new Blob([conteudo as BlobPart], { type: tipo });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nome;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Lê o arquivo escolhido num <input type="file">. */
export function lerArquivo(evento: Event): Promise<string | null> {
  const input = evento.target as HTMLInputElement;
  const arq = input.files?.[0];
  input.value = '';
  if (!arq) return Promise.resolve(null);
  return arq.text();
}
