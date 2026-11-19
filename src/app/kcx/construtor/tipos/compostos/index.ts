/**
 * Tipos da Fase 3: seleção (select), controle deslizante (slider), mega menu,
 * botão flutuante (FAB), galeria em grade e login montado com instâncias.
 */
import { DefinicaoTipo } from '../../montar';
import { SELECT } from './select';
import { SLIDER } from './slider';
import { MEGA_MENU } from './mega-menu';
import { FAB } from './fab';
import { GALERIA } from './galeria';
import { LOGIN } from './login';

export const TIPOS_COMPOSTOS: DefinicaoTipo[] = [SELECT, SLIDER, MEGA_MENU, FAB, GALERIA, LOGIN];
