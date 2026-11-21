/**
 * Tipos de controle e navegação menores: caixa de seleção, opções (radio),
 * chave liga/desliga, trilha (breadcrumb), paginação, etapas (stepper),
 * dica (tooltip), faixa de aviso (banner) e menu suspenso (dropdown).
 */
import { DefinicaoTipo } from '../../montar';
import { CHECKBOX } from './checkbox';
import { RADIO } from './radio';
import { SWITCH } from './switch';
import { SELETOR_DUPLO } from './seletor-duplo';
import { BREADCRUMB } from './breadcrumb';
import { PAGINACAO } from './paginacao';
import { STEPPER } from './stepper';
import { TOOLTIP } from './tooltip';
import { BANNER } from './banner';
import { DROPDOWN } from './dropdown';

export const TIPOS_CONTROLES: DefinicaoTipo[] = [
  CHECKBOX,
  RADIO,
  SWITCH,
  SELETOR_DUPLO,
  BREADCRUMB,
  PAGINACAO,
  STEPPER,
  TOOLTIP,
  BANNER,
  DROPDOWN,
];
