import { LabDemo } from '../models/demo.model';
import { Effect } from '../models/effect.model';
import { CSS_DEMOS } from './css-demos.data';
import { GSAP_DEMOS } from './gsap-demos.data';
import { SCROLL_DEMOS } from './scroll-demos.data';

/**
 * Biblioteca de Efeitos — gerada a partir das demos de cada laboratório.
 * Para incluir um laboratório novo, adicione a lista de demos em DEMOS_POR_LAB.
 */
export const DEMOS_POR_LAB: Record<string, LabDemo[]> = {
  css: CSS_DEMOS,
  gsap: GSAP_DEMOS,
  scroll: SCROLL_DEMOS,
};

export const EFFECTS: Effect[] = Object.entries(DEMOS_POR_LAB).flatMap(([labId, demos]) =>
  demos.map(
    (d): Effect => ({
      id: `${labId}-${d.id}`,
      nome: d.titulo,
      labId,
      topico: d.topico,
      nivel: d.nivel,
      descricao: d.resumo,
      demoId: d.id,
      implementado: true,
    }),
  ),
);
