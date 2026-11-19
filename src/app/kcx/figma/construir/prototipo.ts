/** Tradução de interações KCX para a API de protótipo do Figma (funções puras). */
import { PlanoInteracao } from '../../figma-plano';

/** Gatilho do protótipo do Figma para uma interação KCX. */
export function gatilhoFigma(it: PlanoInteracao): Record<string, unknown> {
  switch (it.gatilho) {
    case 'hover':
      return { type: 'ON_HOVER' };
    case 'pressionar':
      return { type: 'ON_PRESS' };
    case 'entrar':
      return { type: 'MOUSE_ENTER', delay: 0 };
    case 'sair':
      return { type: 'MOUSE_LEAVE', delay: 0 };
    case 'atraso':
      return { type: 'AFTER_TIMEOUT', timeout: Math.max(0, (it.atraso ?? 1000) / 1000) };
    case 'arrastar':
      return { type: 'ON_DRAG' };
    case 'tecla':
      return { type: 'ON_KEY_DOWN', device: 'KEYBOARD', keyCodes: [codigoTecla(it.tecla)] };
    default:
      return { type: 'ON_CLICK' };
  }
}

/** Códigos de tecla (keyCode) que o Figma usa no gatilho Key/Gamepad. */
export function codigoTecla(tecla = 'Escape'): number {
  const mapa: Record<string, number> = {
    Escape: 27,
    Enter: 13,
    ' ': 32,
    Espaco: 32,
    ArrowLeft: 37,
    ArrowUp: 38,
    ArrowRight: 39,
    ArrowDown: 40,
    Tab: 9,
  };
  return mapa[tecla] ?? (tecla.length === 1 ? tecla.toUpperCase().charCodeAt(0) : 27);
}

/**
 * Transição do Figma (tipo, curva, direção e duração). Mover e empurrar só
 * valem para navegar e overlays: na troca de variante (Change to) o Figma
 * recusa, então viram Smart Animate (visto no Figma real).
 */
export function transicaoFigma(
  it: PlanoInteracao,
  trocaDeVariante = true,
): Record<string, unknown> | null {
  if (it.transicao === 'instantanea') return null;
  const easing =
    it.curva === 'linear'
      ? { type: 'LINEAR' }
      : it.curva === 'entrada-saida'
        ? { type: 'EASE_IN_AND_OUT' }
        : it.curva === 'mola'
          ? { type: 'GENTLE' }
          : it.curva === 'quique'
            ? { type: 'BOUNCY' }
            : { type: 'EASE_OUT' };
  const duration = it.duracao / 1000;
  if ((it.transicao === 'mover' || it.transicao === 'empurrar') && !trocaDeVariante) {
    const dir = { esquerda: 'LEFT', direita: 'RIGHT', cima: 'TOP', baixo: 'BOTTOM' }[
      it.direcao ?? 'esquerda'
    ];
    return {
      type: it.transicao === 'mover' ? 'MOVE_IN' : 'PUSH',
      direction: dir,
      matchLayers: false,
      easing,
      duration,
    };
  }
  return { type: it.transicao === 'dissolver' ? 'DISSOLVE' : 'SMART_ANIMATE', easing, duration };
}
