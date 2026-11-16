/**
 * Modelo de um laboratório do KALIXTO CREATIVE LAB.
 * Cada laboratório pertence a uma fase do roadmap e só é liberado
 * quando a fase anterior é validada (seção 16 do briefing).
 */

/** Situação do laboratório dentro do roadmap. */
export type LabStatus =
  | 'em-construcao' // fase atual, sendo desenvolvido
  | 'planejado' // fase futura já desbloqueada no roadmap
  | 'bloqueado' // depende da validação de fases anteriores
  | 'validado'; // passou pelos critérios de passagem

export interface Lab {
  /** Identificador usado na URL: /labs/:id */
  id: string;
  /** Número exibido no card (ex.: "01"). */
  numero: string;
  titulo: string;
  /** Frase curta explicando o propósito do laboratório. */
  resumo: string;
  /** Fase do roadmap em que o laboratório é entregue. */
  fase: number;
  status: LabStatus;
  /** Tecnologias principais (ex.: CSS, GSAP). */
  tecnologias: string[];
  /** Tópicos que o laboratório vai cobrir. */
  topicos: string[];
  /** Cor de destaque do card (token do Design System). */
  acento: 'magenta' | 'roxo' | 'azul' | 'ciano';
}
