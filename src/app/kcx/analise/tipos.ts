/**
 * KCX Web Intelligence — tipos da análise de referências.
 *
 * A análise tem três fontes, e cada resultado diz de onde veio:
 * - 'dom': coleta feita DENTRO do site (coletor rodado pela pessoa no próprio
 *   navegador) — é a única fonte que pode confirmar tecnologia e CSS;
 * - 'html': código-fonte salvo ou baixado (sem JavaScript rodando);
 * - 'video': quadros de uma gravação ou imagens — nunca confirma tecnologia;
 * - 'manual': marcado pela pessoa.
 *
 * TypeScript puro: sem Angular, sem DOM do app.
 */

export type OrigemAnalise = 'dom' | 'html' | 'video' | 'manual';

export type TipoEfeitoWeb =
  | 'revelar'
  | 'parallax'
  | 'sticky'
  | 'horizontal'
  | 'empilhar'
  | 'morph'
  | 'hover'
  | 'texto'
  | 'vidro'
  | 'profundidade'
  | 'cursor'
  | 'transicao';

export type Confianca = 'alta' | 'media' | 'baixa';

/** Região em % do quadro (0–100). */
export interface RegiaoPct {
  x: number;
  y: number;
  largura: number;
  altura: number;
}

/** Ficha técnica de um efeito identificado. */
export interface FichaEfeito {
  id: string;
  tipo: TipoEfeitoWeb;
  nome: string;
  origem: OrigemAnalise;
  confianca: Confianca;
  /** Segundos na referência (vídeo), quando houver. */
  inicio: number | null;
  fim: number | null;
  regiao?: RegiaoPct;
  /** O que foi medido ou encontrado (frases curtas e verificáveis). */
  evidencias: string[];
  parametros: ParametrosEfeito;
  /** Tecnologias ligadas ao efeito (só com origem 'dom' ou 'html'). */
  tecnologias?: string[];
  /** Seletor no site original (origem 'dom'). */
  seletor?: string;
  observacao?: string;
  /** Outras vezes em que o mesmo efeito aparece na mesma região (segundos). */
  ocorrencias?: { inicio: number; fim: number }[];
}

export interface ParametrosEfeito {
  /** ms */
  duracao?: number;
  /** px na referência */
  distancia?: number;
  /** px por segundo */
  velocidade?: number;
  direcao?: 'cima' | 'baixo' | 'esquerda' | 'direita' | 'dentro' | 'fora';
  /** Curva CSS mais próxima do movimento medido. */
  easing?: string;
  /** Razão entre velocidades (parallax) ou fator de escala (profundidade). */
  fator?: number;
  /** 0–1 (desfoque, mudança, amplitude relativa). */
  intensidade?: number;
  /** Atraso entre elementos em ms (sequência). */
  atraso?: number;
}

/* ============================== Investigação de sites ============================== */

export type StatusTecnologia = 'confirmada' | 'provavel' | 'nao-identificada';

export interface Tecnologia {
  id: string;
  nome: string;
  status: StatusTecnologia;
  evidencias: string[];
  versao?: string;
}

/** O que o coletor (ou a leitura do HTML) traz. */
export interface ColetaSite {
  formato: 'kcx-coleta';
  versao: 1;
  origem: 'dom' | 'html';
  url: string;
  titulo: string;
  coletadoEm: string;
  viewport?: { largura: number; altura: number };
  /** src de cada <script>. */
  scripts: string[];
  /** Trechos curtos de scripts inline que citam bibliotecas (só palavras-chave). */
  marcadoresInline: string[];
  estilos: string[];
  /** Globais presentes em window (só com origem 'dom'). */
  globais: Record<string, string | true>;
  /** Classes/atributos indicativos encontrados no DOM (nome → quantidade). */
  marcadoresDom: Record<string, number>;
  css: {
    keyframes: string[];
    /** Folhas que o navegador não deixou ler (CORS). */
    inacessiveis: number;
    regrasComTransicao: number;
    regrasComAnimacao: number;
    scrollDriven: string[];
    sticky: number;
    scrollSnap: number;
    viewTransitions: boolean;
    backdropFilter: number;
    hover: number;
    perspective: number;
    scrollBehavior?: string;
  };
  animacoes: {
    alvo: string;
    nome: string;
    duracao: number;
    easing: string;
    timeline: 'documento' | 'scroll' | 'view' | 'outra';
    iteracoes: number | 'infinita';
  }[];
  recursos: { nome: string; tipo: string; bytes: number }[];
  elementos: {
    canvas: number;
    video: number;
    svg: number;
    iframes: number;
    fixosOuSticky: { seletor: string; posicao: string }[];
  };
  /** Ex.: atributos on*, cursor pointer — o coletor não lê listeners reais. */
  indiciosEventos: Record<string, number>;
  avisos: string[];
}

export interface ResultadoInvestigacao {
  origem: 'dom' | 'html';
  url: string;
  titulo: string;
  quando: string;
  tecnologias: Tecnologia[];
  fichas: FichaEfeito[];
  /** Fatos sobre rolagem, transições de página e recursos. */
  resumo: string[];
  limites: string[];
}

/* ============================== Análise de vídeo ============================== */

/** Quadro em tons de cinza, já reduzido (ex.: 96 px de largura). */
export interface QuadroCinza {
  /** segundos */
  t: number;
  largura: number;
  altura: number;
  /** luminância 0–255, linha a linha */
  px: Uint8Array | number[];
}

export interface ResultadoVideo {
  quadros: number;
  duracao: number;
  /** px do quadro analisado → px da referência */
  escala: number;
  fichas: FichaEfeito[];
  /** Linha do tempo resumida (um texto por trecho). */
  trechos: { inicio: number; fim: number; descricao: string }[];
  limites: string[];
}

/** Tudo o que a análise juntou numa comparação. */
export interface AnaliseReferencia {
  fichas: FichaEfeito[];
  investigacao?: ResultadoInvestigacao;
  video?: Omit<ResultadoVideo, 'fichas'>;
  /** Componentes KCX criados a partir de fichas (id da ficha → id do componente). */
  reconstruidos: Record<string, string>;
}
