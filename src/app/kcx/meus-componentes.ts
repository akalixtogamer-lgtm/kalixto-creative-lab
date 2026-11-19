/**
 * "Meus componentes": componentes criados no construtor do KCX Studio ou
 * importados do Figma, guardados no navegador (localStorage), em JSON KCX.
 *
 * Formato guardado (v2):
 *   { versao: 2, componentes: KcxComponente[], recuperaveis: KcxRecuperavel[] }
 *
 * Regra de ouro: NADA é descartado em silêncio. Um componente que deixa de
 * passar na validação (porque o formato mudou ou o arquivo foi editado à mão)
 * vai para "recuperáveis", de onde a pessoa pode exportar ou apagar.
 */
import { KcxComponente, KcxPacote } from './kcx.types';
import { validarComponente } from './validar';

/** Chave antiga: um array simples. Fica intacta como backup depois da migração. */
export const CHAVE_MEUS_V1 = 'kalixto-lab:kcx-meus:v1';
export const CHAVE_MEUS = 'kalixto-lab:kcx-meus:v2';
export const VERSAO_ARMAZENAMENTO = 2;

export interface KcxRecuperavel {
  /** O objeto como estava guardado (pode não ser um KcxComponente válido). */
  componente: unknown;
  erros: string[];
  /** Data ISO em que foi separado. */
  quando: string;
}

interface Guardado {
  versao: number;
  componentes: unknown[];
  recuperaveis: KcxRecuperavel[];
}

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

function errosDe(c: unknown): string[] {
  if (!c || typeof c !== 'object') return ['não é um objeto'];
  const id = (c as { id?: unknown }).id;
  return validarComponente(c as KcxComponente, typeof id === 'string' ? id : 'c').map(
    (e) => `${e.caminho}: ${e.mensagem}`,
  );
}

/**
 * Ajustes de formato conhecidos, aplicados antes de validar.
 * Ao mudar o formato do KcxComponente, acrescente aqui a conversão do antigo
 * para o novo (e um teste em meus-componentes.spec.ts).
 */
export function migrarComponente(c: unknown): unknown {
  return c;
}

/** Separa válidos de recuperáveis, sem perder nenhum. */
export function separar(
  brutos: unknown[],
  quando = new Date().toISOString(),
): { componentes: KcxComponente[]; recuperaveis: KcxRecuperavel[] } {
  const componentes: KcxComponente[] = [];
  const recuperaveis: KcxRecuperavel[] = [];
  for (const bruto of brutos) {
    const c = migrarComponente(bruto);
    const erros = errosDe(c);
    if (erros.length) recuperaveis.push({ componente: bruto, erros, quando });
    else componentes.push(c as KcxComponente);
  }
  return { componentes, recuperaveis };
}

export class RepositorioMeusComponentes {
  constructor(private readonly armazenamento: Armazenamento | null = local()) {}

  private ler(): { componentes: KcxComponente[]; recuperaveis: KcxRecuperavel[] } {
    const a = this.armazenamento;
    if (!a) return { componentes: [], recuperaveis: [] };
    try {
      const bruto = a.getItem(CHAVE_MEUS);
      if (bruto) {
        const g = JSON.parse(bruto) as Partial<Guardado>;
        const s = separar(Array.isArray(g.componentes) ? g.componentes : []);
        return {
          componentes: s.componentes,
          recuperaveis: [
            ...(Array.isArray(g.recuperaveis) ? g.recuperaveis : []),
            ...s.recuperaveis,
          ],
        };
      }
      // Migração v1 → v2: lê o array antigo e grava no formato novo.
      const v1 = a.getItem(CHAVE_MEUS_V1);
      if (v1) {
        const lista = JSON.parse(v1) as unknown;
        const s = separar(Array.isArray(lista) ? lista : [lista]);
        this.gravar(s.componentes, s.recuperaveis);
        return s;
      }
    } catch {
      // JSON corrompido: não sobrescreve nada; a pessoa ainda pode exportar o bruto.
    }
    return { componentes: [], recuperaveis: [] };
  }

  private gravar(componentes: KcxComponente[], recuperaveis: KcxRecuperavel[]): boolean {
    const g: Guardado = { versao: VERSAO_ARMAZENAMENTO, componentes, recuperaveis };
    try {
      // Se o que está guardado não é JSON válido, guarda uma cópia antes de sobrescrever.
      const atual = this.armazenamento?.getItem(CHAVE_MEUS);
      if (atual) {
        try {
          JSON.parse(atual);
        } catch {
          this.armazenamento?.setItem(`${CHAVE_MEUS}:corrompido`, atual);
        }
      }
      this.armazenamento?.setItem(CHAVE_MEUS, JSON.stringify(g));
      return true;
    } catch {
      return false;
    }
  }

  listar(): KcxComponente[] {
    return this.ler().componentes;
  }

  /** Componentes guardados que não passam mais na validação. */
  recuperaveis(): KcxRecuperavel[] {
    return this.ler().recuperaveis;
  }

  /** Salva (ou substitui pelo mesmo id). Devolve erros de validação, se houver. */
  salvar(comp: KcxComponente): string[] {
    const erros = errosDe(comp);
    if (erros.length) return erros;
    const atual = this.ler();
    const lista = [comp, ...atual.componentes.filter((c) => c.id !== comp.id)];
    if (!this.gravar(lista, atual.recuperaveis))
      return [
        'O navegador recusou salvar (espaço cheio?). Tente uma imagem menor ou exporte o .kcx.json.',
      ];
    return [];
  }

  remover(id: string): void {
    const atual = this.ler();
    this.gravar(
      atual.componentes.filter((c) => c.id !== id),
      atual.recuperaveis,
    );
  }

  /** Apaga de vez um item de "recuperáveis" (pela posição na lista). */
  descartarRecuperavel(indice: number): void {
    const atual = this.ler();
    this.gravar(
      atual.componentes,
      atual.recuperaveis.filter((_, i) => i !== indice),
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
