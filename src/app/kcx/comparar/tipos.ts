/**
 * Reference vs. Reconstruction — tipos do módulo de comparação.
 *
 * Uma SESSÃO junta a análise de uma referência (site, vídeo, frames, estados,
 * marcos de tempo, anotações) e a reconstrução dela no KCX (um componente da
 * biblioteca + valores + ajustes). Cada ajuste vira uma variável KCX de verdade,
 * então a reconstrução nunca deixa de estar ligada ao sistema de variáveis.
 *
 * O formato `ReferenciaAnalisada` é a porta de entrada do Web Motion &
 * Interaction Analyzer: o que ele produzir entra aqui sem conversão.
 *
 * TypeScript puro: sem Angular, sem DOM.
 */
import type { KcxValor } from '../kcx.types';
import type { AnaliseReferencia } from '../analise/tipos';

/* ============================== Referência ============================== */

export type TipoReferencia = 'url' | 'video' | 'frames';

/** Um quadro tirado da gravação (ou enviado como imagem). */
export interface FrameReferencia {
  id: string;
  /** Segundos no vídeo (null quando é uma imagem solta). */
  tempo: number | null;
  /** data URL JPEG/PNG/WebP reduzida. */
  src: string;
  largura: number;
  altura: number;
  rotulo?: string;
}

/** Retângulo em px da referência (do frame ou da área visível do site). */
export interface Caixa {
  x: number;
  y: number;
  largura: number;
  altura: number;
}

export type TipoMarco = 'estado' | 'efeito' | 'interacao';

/**
 * Ponto da linha do tempo: um estado, o começo de um efeito ou uma interação.
 * `ref` é o tempo na referência; `rec`, o tempo equivalente na reconstrução.
 * Os dois não precisam ser iguais (a sincronia é feita por pares de marcos).
 */
export interface Marco {
  id: string;
  nome: string;
  tipo: TipoMarco;
  /** Segundos na referência (início). */
  ref: number | null;
  /** Segundos na referência (fim), para medir a duração. */
  refFim?: number | null;
  /** Segundos na reconstrução (início). */
  rec: number | null;
  recFim?: number | null;
  /** Curva observada na referência (palavra CSS ou cubic-bezier()). */
  easingRef?: string;
  /** Seletor do elemento da reconstrução que faz este movimento. */
  seletorRec?: string;
  anotacao?: string;
  /** Frame de referência que mostra este estado. */
  frameId?: string;
}

/** Elemento marcado na referência e o elemento equivalente na reconstrução. */
export interface ElementoPar {
  id: string;
  nome: string;
  /** Frame onde a caixa foi desenhada. */
  frameId?: string;
  caixaRef?: Caixa;
  /** Cor tirada do frame (conta-gotas), #rrggbb. */
  corRef?: string;
  /** Qual cor da reconstrução comparar com corRef. */
  corAlvo?: 'texto' | 'fundo';
  /** Tamanho de fonte medido ou informado na referência (px do frame). */
  fonteRef?: number;
  familiaRef?: string;
  pesoRef?: number;
  /** Ordem de empilhamento na referência (1 = na frente). */
  camadaRef?: number;
  seletorRec?: string;
  anotacao?: string;
}

export type TipoComportamento =
  'hover' | 'scroll' | 'clique' | 'arrastar' | 'expandir' | 'recolher' | 'transicao' | 'navegacao';

export type StatusComportamento = 'reproduzido' | 'difere' | 'nao-implementado' | 'nao-testado';

/** Comportamento visto na referência e como ficou na reconstrução. */
export interface Comportamento {
  id: string;
  tipo: TipoComportamento;
  descricao: string;
  /** Elemento da reconstrução que deveria reagir. */
  seletorRec?: string;
  status: StatusComportamento;
  /** O que o teste registrou (preenchido pelo log de eventos). */
  evidencia?: string;
  observacao?: string;
}

/**
 * Resultado da análise de uma referência. Hoje é preenchido no próprio
 * comparador; o Analyzer pode gerar o mesmo objeto.
 */
export interface ReferenciaAnalisada {
  tipo: TipoReferencia;
  nome: string;
  /** Site (https) quando tipo = 'url'. */
  url?: string;
  /** Vídeo guardado no IndexedDB (chave) — o arquivo em si não vai no JSON. */
  videoChave?: string;
  videoNome?: string;
  /** Duração em segundos. */
  duracao?: number;
  /** Tamanho natural do vídeo, do frame ou da janela do site. */
  largura: number;
  altura: number;
  frames: FrameReferencia[];
  marcos: Marco[];
  elementos: ElementoPar[];
  comportamentos: Comportamento[];
}

/* ============================== Reconstrução ============================== */

/** Propriedades que o sistema de ajuste sabe mexer em qualquer elemento. */
export type PropriedadeAjuste =
  | 'x'
  | 'y'
  | 'largura'
  | 'altura'
  | 'padding'
  | 'gap'
  | 'corTexto'
  | 'corFundo'
  | 'opacidade'
  | 'blur'
  | 'sombra'
  | 'corSombra'
  | 'escala'
  | 'rotacao'
  | 'duracao'
  | 'delay'
  | 'easing'
  | 'velocidade'
  | 'gatilho';

/** Onde o ajuste vale (o breakpoint entra como media query). */
export interface EscopoAjuste {
  tipo: 'todos' | 'ate' | 'acima';
  /** Largura do breakpoint em px. */
  largura?: number;
}

/**
 * Um ajuste: uma propriedade de um elemento da reconstrução. Vira uma variável
 * KCX (id `ajN…`) ligada a uma custom property usada por uma regra CSS.
 */
export interface Ajuste {
  id: string;
  seletor: string;
  /** Nome legível do elemento (ex.: "Título"). */
  elemento: string;
  propriedade: PropriedadeAjuste;
  valor: KcxValor;
  escopo: EscopoAjuste;
  /** Velocidade: duração original (ms) que a velocidade divide. */
  base?: number;
}

export interface EstadoReconstrucao {
  /** Componente KCX usado como base (referência ou "Meus componentes"). */
  componenteId: string;
  /** Valores das variáveis do componente base. */
  valores: Record<string, KcxValor>;
  ajustes: Ajuste[];
}

/* ============================== Fidelidade ============================== */

export type GrupoFidelidade = 'visual' | 'comportamental' | 'tecnica';

export type IdCriterio =
  | 'composicao'
  | 'posicionamento'
  | 'proporcoes'
  | 'tipografia'
  | 'cores'
  | 'camadas'
  | 'efeitos'
  | 'duracao'
  | 'easing'
  | 'interacoes'
  | 'responsividade'
  | 'variaveis'
  | 'movimentoReduzido'
  | 'desempenho';

export type EstadoCriterio = 'corresponde' | 'proximo' | 'difere' | 'sem-medicao';

export interface Medida {
  /** O que foi medido (ex.: "Título"). */
  item: string;
  /** Diferença legível (ex.: "Δx 6 px · Δy 2 px"). */
  diferenca: string;
  estado: Exclude<EstadoCriterio, 'sem-medicao'>;
  /** Elemento da reconstrução ligado à medida (para ir direto ao ajuste). */
  seletor?: string;
}

export interface ResultadoCriterio {
  id: IdCriterio;
  nome: string;
  grupo: GrupoFidelidade;
  estado: EstadoCriterio;
  /** Regra usada para dizer se corresponde (sempre visível). */
  criterio: string;
  medidas: Medida[];
  /** O que fazer para medir, quando não há dados. */
  comoMedir?: string;
}

/** Medições feitas dentro do iframe da reconstrução (pelo inspetor). */
export interface MedicaoElemento {
  seletor: string;
  caixa: Caixa;
  corTexto: string;
  corFundo: string;
  fonte: number;
  familia: string;
  peso: number;
  opacidade: number;
  /** Padding de cima (px). */
  padding: number;
  /** Gap entre filhos (px; 0 quando não é flex/grid). */
  gap: number;
  /** Posição na pilha de pintura no centro do elemento (0 = na frente). */
  camada: number;
  animacoes: { nome: string; duracao: number; atraso: number; easing: string }[];
  transicoes: { propriedade: string; duracao: number; atraso: number; easing: string }[];
}

export interface MedicaoViewport {
  largura: number;
  /** Conteúdo mais largo que a tela (rolagem horizontal). */
  transborda: boolean;
  /** Seletores dos elementos que passam da borda direita. */
  foraDaTela: string[];
}

export interface MedicoesReconstrucao {
  /** Largura e altura do palco da reconstrução quando as caixas foram medidas. */
  palco: { largura: number; altura: number };
  elementos: Record<string, MedicaoElemento>;
  viewports: MedicaoViewport[];
}

/* ============================== Versões ============================== */

export interface ResumoFidelidade {
  corresponde: number;
  proximo: number;
  difere: number;
  semMedicao: number;
  /** Estado de cada critério nesta versão. */
  criterios: Partial<Record<IdCriterio, EstadoCriterio>>;
}

export interface VersaoReconstrucao {
  id: string;
  nome: string;
  /** ISO. */
  data: string;
  estado: EstadoReconstrucao;
  /** Ids dos componentes usados (base + subcomponentes). */
  componentes: string[];
  /** Nomes das variáveis que saíram do padrão. */
  modificadas: string[];
  /** Variáveis (id → valor) desta versão, só as que saíram do padrão. */
  variaveis: Record<string, KcxValor>;
  /** Animações do componente. */
  animacoes: string[];
  observacoes: string;
  comparacao: ResumoFidelidade;
  aprovada: boolean;
}

/* ============================== Sessão ============================== */

export interface SessaoComparacao {
  formato: 'kcx-comparacao';
  versao: 1;
  id: string;
  nome: string;
  criadaEm: string;
  atualizadaEm: string;
  referencia: ReferenciaAnalisada;
  /** Estado de trabalho (o que está no Painel B agora). */
  atual: EstadoReconstrucao;
  versoes: VersaoReconstrucao[];
  /** Última medição feita no iframe da reconstrução. */
  medicoes?: MedicoesReconstrucao;
  /**
   * Alinhamento do overlay: a reconstrução é deslocada (px do palco) e
   * escalada sobre a referência. As medidas de posição usam o mesmo alinhamento.
   */
  alinhamento: { x: number; y: number; escala: number };
  /** Id do componente salvo a partir da versão aprovada. */
  salvoComo?: string;
  /** Web Intelligence: fichas de efeitos, investigação do site, resumo do vídeo. */
  analise?: AnaliseReferencia;
}
