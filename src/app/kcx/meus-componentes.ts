/**
 * "Meus componentes": componentes criados no construtor do KCX Studio ou
 * importados do Figma, guardados no navegador (localStorage), em JSON KCX.
 */
import { KcxComponente, KcxPacote } from './kcx.types';
import { validarComponente } from './validar';

export const CHAVE_MEUS = 'kalixto-lab:kcx-meus:v1';

interface Armazenamento {
  getItem(k: string): string | null;
  setItem(k: string, v: string): void;
}

function local(): Armazenamento | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

export class RepositorioMeusComponentes {
  constructor(private readonly armazenamento: Armazenamento | null = local()) {}

  listar(): KcxComponente[] {
    try {
      const bruto = this.armazenamento?.getItem(CHAVE_MEUS);
      const lista = bruto ? (JSON.parse(bruto) as KcxComponente[]) : [];
      // Ignora o que não passa na validação (arquivo antigo ou editado à mão).
      return Array.isArray(lista) ? lista.filter((c) => !validarComponente(c, 'c').length) : [];
    } catch {
      return [];
    }
  }

  /** Salva (ou substitui pelo mesmo id). Devolve erros de validação, se houver. */
  salvar(comp: KcxComponente): string[] {
    const erros = validarComponente(comp, comp.id).map((e) => `${e.caminho}: ${e.mensagem}`);
    if (erros.length) return erros;
    const lista = this.listar().filter((c) => c.id !== comp.id);
    lista.unshift(comp);
    try {
      this.armazenamento?.setItem(CHAVE_MEUS, JSON.stringify(lista));
    } catch {
      return [
        'O navegador recusou salvar (espaço cheio?). Tente uma imagem menor ou exporte o .kcx.json.',
      ];
    }
    return [];
  }

  remover(id: string): void {
    this.armazenamento?.setItem(
      CHAVE_MEUS,
      JSON.stringify(this.listar().filter((c) => c.id !== id)),
    );
  }

  /** Adiciona os componentes de um pacote (ex.: vindo do Figma). Devolve os ids salvos. */
  importarPacote(p: KcxPacote): { salvos: string[]; erros: string[] } {
    const salvos: string[] = [];
    const erros: string[] = [];
    for (const c of p.componentes) {
      const e = this.salvar(c);
      if (e.length) erros.push(...e);
      else salvos.push(c.id);
    }
    return { salvos, erros };
  }
}

/** Id livre: acrescenta -2, -3… se já existir. */
export function idLivre(id: string, ocupados: string[]): string {
  if (!ocupados.includes(id)) return id;
  let n = 2;
  while (ocupados.includes(`${id}-${n}`)) n++;
  return `${id}-${n}`;
}
