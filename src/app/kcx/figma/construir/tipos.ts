/** Tipos e utilitários do importador KCX → Figma. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { FigmaCor, PlanoNo } from '../../figma-plano';

export type Figma = any;
export type No = any;
export type Ref = { no: No; prop: string; plano: PlanoNo };
export type Refs = {
  texto: Ref[];
  visivel: Ref[];
  icone?: Ref[];
  nos?: Map<string, No>;
  /** Componente da variante (para criar slots). */
  raiz?: No;
  slots?: string[];
};

export type ModoDuplicados = 'atualizar' | 'copia';

export interface RelatorioImportacao {
  colecoes: { nome: string; criada: boolean; modos: string[] }[];
  variaveisCriadas: string[];
  variaveisAtualizadas: string[];
  vinculos: number;
  vinculosFalhos: string[];
  componentes: { nome: string; id: string; variantes: number }[];
  /** Peças reutilizáveis (ex.: Caminho do SVG Motion). */
  pecas: { nome: string; id: string; variantes: number }[];
  /** Propriedades de componente criadas. */
  propriedades: string[];
  /** Instâncias de exemplo. */
  exemplos: string[];
  /** Camadas que receberam interações de protótipo (nome: quantidade). */
  interacoes: string[];
  documentacao?: string;
  composicao?: string;
  avisos: string[];
}

export const CHAVE_PLUGIN = 'kcx';

export function rgb(c: FigmaCor) {
  return { r: c.r, g: c.g, b: c.b };
}

/** Procura uma variável local pelo nome dentro da coleção. */
export async function variaveisLocais(figma: Figma): Promise<any[]> {
  return figma.variables.getLocalVariablesAsync
    ? await figma.variables.getLocalVariablesAsync()
    : [];
}

/** Coleções/variáveis do plano que já existem no arquivo (para avisar antes). */
