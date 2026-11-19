/** Ajudantes compartilhados pelos tipos de compostos. */
import { KcxInteracao } from '../../../kcx.types';

export const interacao = (
  no: string,
  de: string,
  para: string,
  gatilho: KcxInteracao['gatilho'] = 'clique',
  duracao = 240,
): KcxInteracao => ({ no, gatilho, de, para, transicao: 'smart-animate', duracao });

export const mapaBool = (id: string, nome: string, sim: string, nao: string) =>
  ({
    $derivado: id,
    nome,
    transformar: [{ op: 'mapa', valores: { true: sim, false: nao } }],
  }) as never;

/* ============================== Seleção (select) ============================== */
