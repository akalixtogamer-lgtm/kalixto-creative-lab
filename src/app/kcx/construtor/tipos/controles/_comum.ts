/** Ajudantes compartilhados pelos tipos de controles. */
import { KcxInteracao, KcxRef } from '../../../kcx.types';
import { Blocos } from '../../montar';

export const interacao = (
  no: string,
  de: string,
  para: string,
  gatilho: KcxInteracao['gatilho'] = 'clique',
  duracao = 260,
): KcxInteracao => ({ no, gatilho, de, para, transicao: 'smart-animate', duracao });

/** Clicar no nó i leva ao estado i, a partir de todos os outros estados. */
export function porIndice(no: (i: number) => string, estado: (i: number) => string, n: number) {
  const r: KcxInteracao[] = [];
  for (let de = 1; de <= n; de++)
    for (let para = 1; para <= n; para++)
      if (de !== para) r.push(interacao(no(para), estado(de), estado(para)));
  return r;
}

/** Cor que troca conforme o índice ativo: `ativo` quando idx === i. */
export function corPorIndice(
  b: Blocos,
  idx: string,
  i: number,
  n: number,
  nome: string,
  ativa: string,
  inativa: string,
  incluirZero = false,
): KcxRef<string> {
  const variaveis: Record<string, string> = {};
  for (let k = incluirZero ? 0 : 1; k <= n; k++) variaveis[String(k)] = k === i ? ativa : inativa;
  return { $derivado: idx, nome, transformar: [{ op: 'variavelPorOpcao', variaveis }] } as never;
}

export const boolAttr = (b: Blocos, id: string, nome: string, padrao: boolean, descricao: string) =>
  b.extra({
    id,
    nome,
    tipo: 'boolean',
    padrao,
    descricao,
    grupo: 'components',
    secao: 'comportamento',
    vinculos: [
      {
        propriedade: `data-${id}`,
        alvo: { tipo: 'atributo', seletor: `.${b.C}`, atributo: `data-${id}` },
        transformar: [{ op: 'mapa', valores: { true: 'true', false: 'false' } }],
      },
    ],
  });

export const mapaBool = (id: string, nome: string, sim: string, nao: string) =>
  ({
    $derivado: id,
    nome,
    transformar: [{ op: 'mapa', valores: { true: sim, false: nao } }],
  }) as never;

/* ============================== Caixa de seleção ============================== */
