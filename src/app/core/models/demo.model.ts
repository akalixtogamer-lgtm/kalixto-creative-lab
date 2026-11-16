/**
 * Modelo comum das demonstrações dos laboratórios (CSS, GSAP, Scroll…).
 * Cada demo descreve controles, explicação e o código exibido.
 */
import { EffectNivel } from './effect.model';

export type Valor = number | string;
export type Valores = Record<string, Valor>;

export type ParamDef =
  | {
      id: string;
      rotulo: string;
      tipo: 'range';
      min: number;
      max: number;
      passo: number;
      unidade: string;
      padrao: number;
    }
  | {
      id: string;
      rotulo: string;
      tipo: 'select';
      opcoes: { valor: string; rotulo: string }[];
      padrao: string;
    };

export interface LabDemo {
  id: string;
  topico: string;
  titulo: string;
  nivel: EffectNivel;
  resumo: string;
  /** Parágrafos curtos de explicação. */
  explicacao: string[];
  /** Dica prática para usar em projetos reais. */
  dica: string;
  /** Texto do botão principal (o que "Executar" faz nesta demo). */
  acao: string;
  /** Instrução curta que aparece no palco. */
  instrucao: string;
  params: ParamDef[];
  codigo: (v: Valores) => string;
}

/** Valores iniciais de uma demo. */
export function valoresPadrao(demo: LabDemo): Valores {
  return Object.fromEntries(demo.params.map((p) => [p.id, p.padrao]));
}

/** Rótulos dos níveis para exibir na tela. */
export const NIVEL_ROTULO: Record<EffectNivel, string> = {
  iniciante: 'iniciante',
  intermediario: 'intermediário',
  avancado: 'avançado',
};
