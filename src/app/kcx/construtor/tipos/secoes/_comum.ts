/** Ajudantes compartilhados pelos tipos de secoes. */
import { KcxInteracao } from '../../../kcx.types';

export const interacao = (no: string, de: string, para: string): KcxInteracao => ({
  no,
  gatilho: 'clique',
  de,
  para,
  transicao: 'smart-animate',
  duracao: 300,
});

/* ============================== Modal ============================== */

export const REDES = ['instagram', 'whatsapp', 'youtube'];
