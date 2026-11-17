/**
 * Ficha técnica de um efeito (Master Prompt, seção 05).
 *
 * Um "kit" é um efeito autossuficiente: a ficha descreve o efeito e a função
 * gerar() produz o HTML, o CSS e o JS que rodam no preview — o mesmo código
 * que o usuário copia ou baixa. Assim preview e código nunca divergem.
 */
import { EffectNivel } from './effect.model';
import { ParamDef, Valores } from './demo.model';

/** Níveis da ficha: os três do laboratório + "experimental". */
export type NivelFicha = EffectNivel | 'experimental';

export type Interacao =
  | 'hover'
  | 'click'
  | 'scroll'
  | 'drag'
  | 'mouse'
  | 'touch'
  | 'autoplay'
  | 'keyboard'
  | 'audio';

export type Tecnologia =
  | 'HTML'
  | 'CSS'
  | 'JavaScript'
  | 'TypeScript'
  | 'Angular'
  | 'SVG'
  | 'Canvas'
  | 'GSAP'
  | 'ScrollTrigger'
  | 'Three.js'
  | 'WebGL'
  | 'GLSL';

/** Situação de implementação do efeito no laboratório. */
export type StatusEfeito = 'validado' | 'em-desenvolvimento' | 'planejado';

export interface CategoriaEfeito {
  id: string;
  numero: string;
  nome: string;
  descricao: string;
}

/** Arquivos gerados por um kit. */
export interface CodigoKit {
  html: string;
  css: string;
  js: string;
}

export interface EffectSheet {
  /** ID único, em kebab-case (também é a URL: /efeitos/:id). */
  id: string;
  nomeTecnico: string;
  nomeAmigavel: string;
  categoria: string;
  subcategoria: string;
  descricao: string;
  objetivoVisual: string;
  aplicacoes: string[];
  nivel: NivelFicha;
  tecnologias: Tecnologia[];
  /** Bibliotecas externas necessárias. Vazio = só recursos nativos. */
  dependencias: string[];
  interacoes: Interacao[];
  tags: string[];
  /** Explicação didática, em parágrafos curtos. */
  explicacao: string[];
  /** Outra forma de implementar o mesmo efeito. */
  alternativa: string;
  compatibilidade: string;
  responsividade: string;
  acessibilidade: string;
  performance: string;
  limitacoes: string[];
  /** Referências oficiais (título + URL). */
  referencias: { titulo: string; url: string }[];
  /** Data da última validação (AAAA-MM-DD). */
  validadoEm: string;
  status: StatusEfeito;
}

/** Arquivos de um componente Angular standalone gerado por um kit. */
export interface CodigoAngular {
  ts: string;
  html: string;
  css: string;
}

/** Termo do código explicado no glossário (o teste confirma que ele aparece no código). */
export interface TermoGlossario {
  termo: string;
  explicacao: string;
}

/** Explicação em três níveis (Code Explainer). */
export interface ExplicacaoNiveis {
  /** Nível 1: conceitos fundamentais, sem jargão. */
  iniciante: string[];
  /** Nível 2: lógica, propriedades e comportamento (é a explicação da ficha). */
  intermediario: string[];
  /** Nível 3: arquitetura, otimização, performance e alternativas. */
  avancado: string[];
}

/** Efeito completo: ficha + parâmetros + gerador de código. */
export interface EffectKit {
  ficha: EffectSheet;
  params: ParamDef[];
  /** Gera o código a partir dos valores atuais dos controles. */
  gerar: (v: Valores) => CodigoKit;
  /** Gera a versão Angular (componente standalone) com os mesmos valores. */
  angular: (v: Valores) => CodigoAngular;
  /** Explicações de nível 1 e 3 (o nível 2 é ficha.explicacao). */
  niveis: { iniciante: string[]; avancado: string[] };
  glossario: TermoGlossario[];
}

export const NIVEL_FICHA_ROTULO: Record<NivelFicha, string> = {
  iniciante: 'iniciante',
  intermediario: 'intermediário',
  avancado: 'avançado',
  experimental: 'experimental',
};

/** Ordem usada para ordenar por dificuldade. */
export const NIVEL_ORDEM: Record<NivelFicha, number> = {
  iniciante: 0,
  intermediario: 1,
  avancado: 2,
  experimental: 3,
};

export const INTERACAO_ROTULO: Record<Interacao, string> = {
  hover: 'Hover',
  click: 'Clique',
  scroll: 'Rolagem',
  drag: 'Arrastar',
  mouse: 'Movimento do mouse',
  touch: 'Toque',
  autoplay: 'Automático',
  keyboard: 'Teclado',
  audio: 'Áudio',
};
