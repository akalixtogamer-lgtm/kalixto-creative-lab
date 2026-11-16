/**
 * Modelo de um efeito da Biblioteca de Efeitos.
 * A Fase 1 entrega só a estrutura; os efeitos reais entram na Fase 2
 * junto com o CSS Playground, o GSAP Studio e o Scroll Lab.
 */

export type EffectNivel = 'iniciante' | 'intermediario' | 'avancado';

export interface Effect {
  /** Identificador único (ex.: "css-hover-lift"). */
  id: string;
  nome: string;
  /** Laboratório onde o efeito é demonstrado (id do Lab). */
  labId: string;
  /** Tópico do laboratório (ex.: "Transitions"). */
  topico: string;
  nivel: EffectNivel;
  descricao: string;
  /** id da demonstração dentro do laboratório (?demo=), quando existir. */
  demoId?: string;
  /** Indica se a demonstração interativa já está implementada. */
  implementado: boolean;
  /** Trechos de código exibidos no Code Viewer (Fase 2). */
  codigo?: {
    html?: string;
    css?: string;
    ts?: string;
  };
}
