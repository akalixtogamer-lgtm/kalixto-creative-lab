/**
 * Serialização, desserialização, versionamento e comparação de pacotes KCX.
 */
import {
  KCX_FORMATO,
  KCX_SCHEMA_VERSION,
  KcxAlteracao,
  KcxComponente,
  KcxComposicao,
  KcxModoExportacao,
  KcxPacote,
  KcxValor,
  KcxVariavel,
} from './kcx.types';
import type { KcxFundacao } from './fundacao';
import { ResultadoValidacao, validarPacote } from './validar';
import { Valores, normalizarValor, validarValor } from './resolver';

export const ORIGEM_LAB = { ferramenta: 'Kalixto Creative Lab', versao: '1.10.0-rc.1' };

/** Cópia profunda (os pacotes são JSON puro). */
export function clonar<T>(x: T): T {
  return JSON.parse(JSON.stringify(x)) as T;
}

/** Monta um pacote KCX a partir de componentes, já com os valores informados aplicados. */
export function criarPacote(
  componentes: KcxComponente[],
  opcoes: {
    id?: string;
    nome?: string;
    versao?: string;
    modo?: KcxModoExportacao;
    valores?: Record<string, Valores>;
    composicao?: KcxComposicao;
    presetAplicado?: string;
    agora?: Date;
    historico?: KcxAlteracao[];
    /** Fundação do design system que vai junto (tokens + estilos no Figma). */
    fundacao?: KcxFundacao;
  } = {},
): KcxPacote {
  const agora = (opcoes.agora ?? new Date()).toISOString();
  // Subcomponentes (usados por instâncias) vão depois do principal, sem repetir.
  const achatados: KcxComponente[] = [];
  const vistos = new Set<string>();
  const incluir = (c: KcxComponente) => {
    if (vistos.has(c.id)) return;
    vistos.add(c.id);
    const { subcomponentes: subs, ...resto } = c;
    achatados.push(resto as KcxComponente);
    for (const s of subs ?? []) incluir(s);
  };
  componentes.forEach(incluir);
  const comps = achatados.map((c) => {
    const copia = clonar(c);
    const vals = opcoes.valores?.[c.id] ?? {};
    copia.variaveis = copia.variaveis.map((v) =>
      v.id in vals ? { ...v, valor: normalizarValor(v, vals[v.id]) } : v,
    );
    return copia;
  });
  const deps = new Map<string, KcxPacote['dependencias'][number]>();
  comps.forEach((c) => c.dependencias.forEach((d) => deps.set(d.nome, d)));
  return {
    formato: KCX_FORMATO,
    schemaVersion: KCX_SCHEMA_VERSION,
    id: opcoes.id ?? (comps.length === 1 ? comps[0].id : 'composicao'),
    versao: opcoes.versao ?? (comps.length === 1 ? comps[0].versao : '1.0.0'),
    nome: opcoes.nome ?? (comps.length === 1 ? comps[0].nome : 'Composição KCX'),
    criadoEm: agora,
    origem: { ...ORIGEM_LAB },
    exportacao: {
      modo: opcoes.modo ?? 'completo',
      ...(opcoes.presetAplicado ? { presetAplicado: opcoes.presetAplicado } : {}),
    },
    componentes: comps,
    ...(opcoes.composicao ? { composicao: clonar(opcoes.composicao) } : {}),
    ...(opcoes.fundacao ? { fundacao: clonar(opcoes.fundacao) } : {}),
    dependencias: [...deps.values()],
    historico: opcoes.historico ?? [
      {
        versao: opcoes.versao ?? '1.0.0',
        data: agora.slice(0, 10),
        descricao: 'Exportado do Kalixto Creative Lab.',
      },
    ],
  };
}

/** JSON estável (2 espaços, quebra de linha no fim). */
export function serializar(p: KcxPacote): string {
  return JSON.stringify(p, null, 2) + '\n';
}

export type ResultadoLeitura =
  | { ok: true; pacote: KcxPacote; validacao: ResultadoValidacao }
  | { ok: false; erro: string; validacao?: ResultadoValidacao };

/** Migrações por versão de schema (preparado para 1.x → 2.x). */
const MIGRACOES: Record<string, (p: Record<string, unknown>) => Record<string, unknown>> = {};

export function migrar(bruto: Record<string, unknown>): Record<string, unknown> {
  let p = bruto;
  for (let i = 0; i < 10; i++) {
    const m = MIGRACOES[String(p['schemaVersion'])];
    if (!m) break;
    p = m(p);
  }
  return p;
}

/** Lê o texto de um arquivo .kcx.json, migra e valida. */
export function desserializar(texto: string): ResultadoLeitura {
  let bruto: unknown;
  try {
    bruto = JSON.parse(texto);
  } catch (e) {
    return { ok: false, erro: `JSON inválido: ${(e as Error).message}` };
  }
  if (!bruto || typeof bruto !== 'object')
    return { ok: false, erro: 'O arquivo não contém um objeto JSON.' };
  const migrado = migrar(bruto as Record<string, unknown>);
  const validacao = validarPacote(migrado);
  if (!validacao.valido) {
    return {
      ok: false,
      erro: `Pacote KCX inválido (${validacao.erros.length} problema(s)).`,
      validacao,
    };
  }
  return { ok: true, pacote: migrado as unknown as KcxPacote, validacao };
}

/* ============================== Comparação e atualização ============================== */

export interface DiferencaValor {
  variavel: string;
  nome: string;
  antes: KcxValor;
  depois: KcxValor;
  valido: boolean;
  problemas: string[];
}

const igual = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/** Diferenças entre os valores atuais e os recebidos (Figma → Lab). Nada é aplicado aqui. */
export function compararValores(
  variaveis: KcxVariavel[],
  atuais: Valores,
  recebidos: Valores,
): {
  diferencas: DiferencaValor[];
  desconhecidas: string[];
} {
  const diferencas: DiferencaValor[] = [];
  const desconhecidas: string[] = [];
  for (const [id, depois] of Object.entries(recebidos)) {
    const v = variaveis.find((x) => x.id === id);
    if (!v) {
      desconhecidas.push(id);
      continue;
    }
    const antes = atuais[id] ?? v.valor;
    if (igual(antes, depois)) continue;
    const problemas = validarValor(v, depois);
    diferencas.push({
      variavel: id,
      nome: v.nome,
      antes,
      depois,
      valido: problemas.length === 0,
      problemas,
    });
  }
  return { diferencas, desconhecidas };
}

export interface ResultadoMescla {
  valores: Valores;
  /** Personalizações preservadas. */
  mantidas: string[];
  /** Variáveis que deixaram de existir na versão nova. */
  removidas: string[];
  /** Variáveis novas (entram com o padrão). */
  novas: string[];
  /** Personalizações que ficaram inválidas (ex.: fora do novo intervalo) e foram ajustadas. */
  ajustadas: string[];
}

/**
 * Atualiza um componente para uma versão nova SEM sobrescrever as
 * personalizações do usuário: valores personalizados continuam, variáveis
 * novas entram com o padrão e o que deixou de valer é informado.
 */
export function mesclarAtualizacao(novo: KcxComponente, personalizados: Valores): ResultadoMescla {
  const r: ResultadoMescla = { valores: {}, mantidas: [], removidas: [], novas: [], ajustadas: [] };
  for (const v of novo.variaveis) {
    if (!(v.id in personalizados)) {
      r.novas.push(v.id);
      continue;
    }
    const bruto = personalizados[v.id];
    const val = normalizarValor(v, bruto);
    r.valores[v.id] = val;
    (igual(val, bruto) ? r.mantidas : r.ajustadas).push(v.id);
  }
  r.removidas = Object.keys(personalizados).filter((k) => !novo.variaveis.some((v) => v.id === k));
  return r;
}

/** Compara versões SemVer: -1, 0 ou 1. */
export function compararVersoes(a: string, b: string): number {
  const pa = a.split('-')[0].split('.').map(Number);
  const pb = b.split('-')[0].split('.').map(Number);
  for (let i = 0; i < 3; i++) if (pa[i] !== pb[i]) return pa[i] < pb[i] ? -1 : 1;
  return 0;
}
