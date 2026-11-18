import { KcxComponente } from '../kcx.types';
import { ANIMATED_GRADIENT_KCX } from './animated-gradient';
import { NEON_GLOW } from './neon-glow';
import { SVG_MOTION } from './svg-motion';

/** Componentes KCX nativos (variáveis funcionais + exportação para o Figma). */
export const KCX_COMPONENTES: KcxComponente[] = [NEON_GLOW, ANIMATED_GRADIENT_KCX, SVG_MOTION];

export function findKcx(id: string): KcxComponente | undefined {
  return KCX_COMPONENTES.find((c) => c.id === id);
}

export { NEON_GLOW, ANIMATED_GRADIENT_KCX, SVG_MOTION };
