import { KcxComponente } from '../kcx.types';
import { ANIMATED_BORDER_KCX } from './animated-border';
import { ANIMATED_GRADIENT_KCX } from './animated-gradient';
import { GAUGE_METER_KCX } from './gauge-meter';
import { HOVER_LIFT } from './hover-lift';
import { NEON_GLOW } from './neon-glow';
import { SVG_MOTION } from './svg-motion';

/**
 * Componentes KCX (só CSS, SVG e Angular), com variáveis funcionais e
 * exportação editável para o Figma.
 */
export const KCX_COMPONENTES: KcxComponente[] = [
  NEON_GLOW,
  ANIMATED_GRADIENT_KCX,
  SVG_MOTION,
  ANIMATED_BORDER_KCX,
  HOVER_LIFT,
  GAUGE_METER_KCX,
];

export function findKcx(id: string): KcxComponente | undefined {
  return KCX_COMPONENTES.find((c) => c.id === id);
}

export {
  NEON_GLOW,
  ANIMATED_GRADIENT_KCX,
  SVG_MOTION,
  ANIMATED_BORDER_KCX,
  HOVER_LIFT,
  GAUGE_METER_KCX,
};
