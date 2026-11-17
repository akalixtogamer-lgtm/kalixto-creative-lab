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
      opcoes: readonly { valor: string; rotulo: string }[];
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
  /** Combinações prontas de valores ("receitas") sugeridas pela demo. */
  presets?: Preset[];
  /** Desafio prático: chegar nos valores da meta e clicar em Executar. */
  desafio?: Desafio;
  /**
   * Demo "ao vivo": o resultado muda direto nos controles ou no mouse,
   * sem botão Executar. Mexer num controle já conta como executada, e o
   * desafio conclui assim que os valores batem.
   */
  aoVivo?: boolean;
}

export interface Preset {
  nome: string;
  valores: Valores;
}

export interface Desafio {
  enunciado: string;
  /** Valores que precisam estar nos controles (só as chaves listadas). */
  meta: Valores;
}

/** true quando os valores atuais batem com a meta do desafio. */
export function cumpreMeta(valores: Valores, meta: Valores): boolean {
  return Object.entries(meta).every(([k, v]) => String(valores[k]) === String(v));
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
