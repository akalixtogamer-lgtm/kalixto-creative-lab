/**
 * Depois da aprovação: a reconstrução vira um componente KCX de verdade
 * (com as variáveis no lugar), uma variante, entra na Motion Library, vai para
 * uma página das Telas ou substitui um componente que já existe.
 *
 * Nada aqui "congela" a reconstrução: os valores aprovados viram o PADRÃO das
 * variáveis, e os ajustes viram variáveis novas. Cores, tipografia, medidas,
 * efeitos, duração, intensidade, comportamento e responsividade continuam
 * editáveis no editor do KCX Studio.
 */
import type { Tela } from '../construtor/tela';
import { slug } from '../construtor/montar';
import type { KcxComponente, KcxValor } from '../kcx.types';
import { idLivre } from '../meus-componentes';
import { normalizarValor } from '../resolver';
import { aplicarAjustes } from './ajustes';
import type { EstadoReconstrucao } from './tipos';

/** Tag dos componentes que fazem parte da Motion Library. */
export const TAG_MOTION_LIBRARY = 'motion-library';
export const TAG_RECONSTRUCAO = 'reconstrucao';

export const naMotionLibrary = (c: KcxComponente) => c.metadados.tags.includes(TAG_MOTION_LIBRARY);

export interface OpcoesComponente {
  id: string;
  nome: string;
  descricao?: string;
  /** Tags a mais (ex.: motion-library, variante-de:…). */
  tags?: string[];
  agora?: Date;
}

/**
 * O componente da reconstrução: base + ajustes, com os valores atuais
 * gravados como padrão das variáveis.
 */
export function componenteDaReconstrucao(
  base: KcxComponente,
  estado: EstadoReconstrucao,
  op: OpcoesComponente,
): KcxComponente {
  const { comp } = aplicarAjustes(base, estado.ajustes);
  const c = structuredClone(comp);
  const iso = (op.agora ?? new Date()).toISOString();
  for (const v of c.variaveis) {
    if (!(v.id in estado.valores)) continue;
    const valor: KcxValor = normalizarValor(v, estado.valores[v.id]);
    v.padrao = valor;
    v.valor = valor;
  }
  c.id = op.id;
  c.nome = op.nome.trim().slice(0, 80) || base.nome;
  c.descricao =
    op.descricao?.trim() ||
    `Reconstrução de referência a partir de “${base.nome}”. ${base.descricao}`.slice(0, 400);
  c.metadados = {
    ...c.metadados,
    tags: [
      ...new Set([
        ...c.metadados.tags.filter((t) => !t.startsWith('reconstrucao-de:')),
        TAG_RECONSTRUCAO,
        `reconstrucao-de:${base.id}`,
        ...(op.tags ?? []),
      ]),
    ],
    criadoEm: iso,
    atualizadoEm: iso,
  };
  // O construtor remontaria o componente a partir da configuração e perderia
  // os ajustes: a reconstrução é um componente próprio (edita-se no editor).
  delete c.origemCriacao;
  c.versao = '1.0.0';
  return c;
}

/** Id e nome livres para um novo componente derivado. */
export function idParaNovo(nome: string, ocupados: string[]): string {
  return idLivre(slug(nome), ocupados);
}

/** Variante: um componente irmão da base, marcado como variante dela. */
export function varianteDaReconstrucao(
  base: KcxComponente,
  estado: EstadoReconstrucao,
  ocupados: string[],
  nome = `${base.nome} · variante`,
): KcxComponente {
  return componenteDaReconstrucao(base, estado, {
    id: idParaNovo(nome, ocupados),
    nome,
    tags: [`variante-de:${base.id}`],
  });
}

/** Liga ou desliga a marca da Motion Library num componente. */
export function comMotionLibrary(c: KcxComponente, dentro: boolean): KcxComponente {
  const tags = c.metadados.tags.filter((t) => t !== TAG_MOTION_LIBRARY);
  if (dentro) tags.push(TAG_MOTION_LIBRARY);
  return { ...c, metadados: { ...c.metadados, tags } };
}

export type OndeNaTela =
  { tipo: 'fim' } | { tipo: 'inicio' } | { tipo: 'substituir'; indice: number };

/** Coloca o componente numa página das Telas (sem mexer no resto da página). */
export function aplicarNaTela<T extends Tela>(tela: T, componenteId: string, onde: OndeNaTela): T {
  const t = structuredClone(tela);
  if (onde.tipo === 'substituir' && onde.indice >= 0 && onde.indice < t.secoes.length) {
    t.secoes[onde.indice] = componenteId;
    return t;
  }
  if (onde.tipo === 'inicio') {
    t.secoes.unshift(componenteId);
    if (t.livre && t.posicoes) t.posicoes.unshift({ x: 0, y: 0 });
    return t;
  }
  t.secoes.push(componenteId);
  return t;
}
