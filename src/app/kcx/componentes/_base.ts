import { KcxLicenca, KcxOpcao, KcxVariavel } from '../kcx.types';

export const LICENCA_MIT: KcxLicenca = {
  spdx: 'MIT',
  usoComercial: true,
  modificacao: true,
  redistribuicao: true,
  autor: 'Wallace Toledo (dev-Kalixto) — Kalixto Creative Lab',
};

export const DATA_KCX = '2026-11-18';

/** Cria uma variável já com valor atual = padrão (reduz repetição nos componentes). */
export function variavel(
  v: Omit<KcxVariavel, 'valor' | 'exportavel'> & { exportavel?: boolean },
): KcxVariavel {
  return { exportavel: true, ...v, valor: v.padrao };
}

export const EASINGS_KCX: KcxOpcao[] = [
  { valor: 'suave', rotulo: 'suave (expo out)' },
  { valor: 'elastico', rotulo: 'elástico (back out)' },
  { valor: 'ease-in-out', rotulo: 'ease-in-out' },
  { valor: 'linear', rotulo: 'linear' },
];

export const MAPA_EASING: Record<string, string> = {
  suave: 'cubic-bezier(0.22, 1, 0.36, 1)',
  elastico: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  'ease-in-out': 'ease-in-out',
  linear: 'linear',
};

export const MAPA_LOOP = { true: 'infinite', false: '1' };
