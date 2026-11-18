/**
 * KCX — Kalixto Component Exchange.
 *
 * Formato aberto e versionado de troca de componentes animados entre o
 * Kalixto Creative Lab, o Figma (plugin Figma Bridge) e qualquer outra
 * ferramenta. Este arquivo NÃO depende de Angular nem do Figma: é TypeScript
 * puro, usado pelo laboratório, pelos testes e pelo plugin.
 *
 * Especificação completa: docs/kcx/ESPECIFICACAO.md
 */

/** Versão do schema KCX implementada por este código. */
export const KCX_SCHEMA_VERSION = '1.0.0';
/** Identificador do formato, presente em todo arquivo `.kcx.json`. */
export const KCX_FORMATO = 'kcx';

/* ============================== Variáveis ============================== */

export type KcxTipoVariavel =
  | 'color'
  | 'number'
  | 'float'
  | 'boolean'
  | 'string'
  | 'enum'
  | 'dimension'
  | 'time'
  | 'gradient'
  | 'transform';

/** Coleção de destino no Figma (e grupo de tokens). */
export type KcxGrupo =
  'colors' | 'dimensions' | 'spacing' | 'typography' | 'motion' | 'effects' | 'components';

/** Seção do editor visual. */
export type KcxSecao = 'aparencia' | 'animacao' | 'comportamento';

export type KcxUnidade = '' | 'px' | 'rem' | 'em' | '%' | 'ms' | 's' | 'deg' | 'turn' | 'rad' | 'x';

export interface KcxParadaGradiente {
  cor: string;
  /** 0 a 1 */
  posicao: number;
}

export interface KcxGradiente {
  /** graus */
  angulo: number;
  paradas: KcxParadaGradiente[];
}

export interface KcxTransformacao2D {
  x: number;
  y: number;
  escala: number;
  rotacao: number;
}

export type KcxValor = string | number | boolean | KcxGradiente | KcxTransformacao2D;

/** Operações aplicadas ao valor de uma variável antes de chegar na propriedade. */
export type KcxOperacao =
  | { op: 'multiplicar'; fator: number }
  | { op: 'somar'; valor: number }
  | { op: 'mapear'; de: [number, number]; para: [number, number] }
  | { op: 'limitar'; min?: number; max?: number }
  | { op: 'arredondar'; casas: number }
  /** numerador / valor (ex.: velocidade → duração). */
  | { op: 'dividir'; numerador: number }
  /** valor × valor de outra variável numérica. */
  | { op: 'multiplicarPorVariavel'; variavel: string }
  /** valor + fator × valor de outra variável (ex.: centralizar: −0,5 × tamanho). */
  | { op: 'somarVariavel'; variavel: string; fator: number }
  /** cor + transparência (0–1), fixa ou vinda de outra variável. */
  | { op: 'alpha'; valor?: number; variavel?: string }
  /** Converte da unidade da variável para outra (ms → s, px → rem…). */
  | { op: 'converter'; para: KcxUnidade }
  /** Troca o valor (enum ou boolean em texto) por outro texto. */
  | { op: 'mapa'; valores: Record<string, string> }
  /**
   * Só na estrutura visual (quadros do Figma): fração do percurso → coordenada
   * do ponto no caminho escolhido pela variável enum `variavel`.
   */
  | {
      op: 'pontoNoCaminho';
      variavel: string;
      caminhos: Record<string, string>;
      eixo: 'x' | 'y';
      somar?: number;
    }
  /** Só na estrutura visual: fração do percurso → comprimento do traço (px). */
  | { op: 'tracoNoCaminho'; variavel: string; caminhos: Record<string, string> };

export type KcxAlvo =
  /** Custom property CSS. Sempre começa com --kcx-. */
  | { tipo: 'css-var'; nome: string }
  /** Atributo de elementos (ex.: `d` de um path SVG). */
  | { tipo: 'atributo'; seletor: string; atributo: string }
  /** Texto dos elementos (textContent). */
  | { tipo: 'texto'; seletor: string }
  /**
   * Parâmetro do gerador de código de um kit (componentes nível 3 vindos da
   * biblioteca): no lab, mudar a variável regenera o código; no código
   * exportado o valor fica fixo.
   */
  | { tipo: 'parametro-gerador'; parametro: string };

export interface KcxVinculo {
  /** Descrição legível da propriedade controlada (ex.: "Opacidade do brilho"). */
  propriedade: string;
  alvo: KcxAlvo;
  transformar?: KcxOperacao[];
  /** Unidade adicionada ao número final (ex.: "px", "s"). */
  unidadeSaida?: string;
}

export interface KcxOpcao {
  valor: string;
  rotulo: string;
}

export interface KcxVariavel {
  id: string;
  nome: string;
  tipo: KcxTipoVariavel;
  padrao: KcxValor;
  valor: KcxValor;
  unidade?: KcxUnidade;
  min?: number;
  max?: number;
  passo?: number;
  /** Obrigatório para enum. */
  opcoes?: KcxOpcao[];
  descricao: string;
  grupo: KcxGrupo;
  secao: KcxSecao;
  /** Propriedades reais controladas pela variável. Vazio = variável não funcional (proibido). */
  vinculos: KcxVinculo[];
  /** false = fica fora dos tokens e do Figma. */
  exportavel: boolean;
  /** Valores por modo de cor (vira modos Light/Dark no Figma). */
  modos?: { light?: KcxValor; dark?: KcxValor };
}

/* ============================== Estrutura visual ============================== */

/**
 * Referência a uma variável dentro da estrutura visual.
 * - `$var`: a propriedade recebe exatamente o valor da variável (no Figma vira vínculo direto).
 * - `$derivado`: valor calculado a partir de uma variável. No Figma vira uma variável
 *   própria (`nome`), vinculada à propriedade e inicializada com o valor calculado.
 */
export type KcxRef<T> =
  T | { $var: string } | { $derivado: string; nome: string; transformar?: KcxOperacao[] };

export type KcxPreenchimento =
  | { tipo: 'solido'; cor: KcxRef<string> }
  | {
      tipo: 'gradiente-linear';
      angulo: KcxRef<number>;
      paradas: { posicao: number; cor: KcxRef<string> }[];
    }
  /**
   * Gradiente vindo de uma variável do tipo gradient. No Figma, cada parada
   * vira uma variável de cor vinculada à parada (o Figma não tem variável de gradiente).
   */
  | {
      tipo: 'gradiente-variavel';
      variavel: string;
      /** Tamanho do gradiente em % da caixa (como background-size). */
      tamanho?: KcxRef<number>;
      /** Deslocamento em % (como background-position), 0–100. */
      deslocamento?: KcxRef<number>;
    };

export type KcxEfeito =
  | {
      tipo: 'sombra';
      cor: KcxRef<string>;
      raio: KcxRef<number>;
      espalhar?: KcxRef<number>;
      x?: number;
      y?: number;
    }
  | { tipo: 'desfoque-camada'; raio: KcxRef<number> }
  | { tipo: 'desfoque-fundo'; raio: KcxRef<number> };

export type KcxTipoNo = 'frame' | 'retangulo' | 'elipse' | 'texto' | 'svg';

export interface KcxNo {
  id: string;
  nome: string;
  tipo: KcxTipoNo;
  x?: KcxRef<number>;
  y?: KcxRef<number>;
  largura?: KcxRef<number>;
  altura?: KcxRef<number>;
  raio?: KcxRef<number>;
  opacidade?: KcxRef<number>;
  visivel?: KcxRef<boolean>;
  rotacao?: KcxRef<number>;
  preenchimentos?: KcxPreenchimento[];
  traco?: { cor: KcxRef<string>; espessura: KcxRef<number>; tracejado?: KcxRef<number>[] };
  efeitos?: KcxEfeito[];
  texto?: {
    conteudo: KcxRef<string>;
    tamanho: KcxRef<number>;
    familia: string;
    estilo: string;
    espacamento?: KcxRef<number>;
    /** Caixa alta (text-transform: uppercase / textCase UPPER). */
    caixaAlta?: boolean;
    /** Vira propriedade de texto editável no componente do Figma. */
    propriedade?: string;
  };
  /** Marcação SVG (tipo svg). Pode vir de uma variável enum via $derivado + mapa. */
  svg?: KcxRef<string>;
  /** Cor e espessura aplicadas aos traços do SVG importado. */
  svgTraco?: { cor: KcxRef<string>; espessura: KcxRef<number>; tracejado?: KcxRef<number>[] };
  autoLayout?: {
    direcao: 'horizontal' | 'vertical';
    espaco: KcxRef<number>;
    paddingX: KcxRef<number>;
    paddingY: KcxRef<number>;
  };
  /** Clip de conteúdo em frames. */
  recortar?: boolean;
  filhos?: KcxNo[];
}

/* ============================== Estados, presets, animações ============================== */

export type KcxGatilho = 'padrao' | 'hover' | 'focus' | 'active' | 'inicial' | 'final';

export interface KcxEstado {
  id: string;
  nome: string;
  gatilho: KcxGatilho;
  descricao: string;
  /** Valores de variáveis que mudam neste estado. */
  valores: Record<string, KcxValor>;
  /**
   * Valores calculados a partir de outras variáveis (ex.: no hover a
   * intensidade é multiplicada pelo reforço de hover). Aplicados depois de `valores`.
   */
  derivar?: { variavel: string; de: string; op: 'copiar' | 'multiplicar' }[];
}

export interface KcxPreset {
  id: string;
  nome: string;
  descricao?: string;
  /** Conjunto de valores de variáveis (não é uma cópia do componente). */
  valores: Record<string, KcxValor>;
}

export type KcxNivel = 1 | 2 | 3;

export interface KcxAnimacao {
  id: string;
  nome: string;
  tecnica:
    'css-keyframes' | 'css-transition' | 'css-motion-path' | 'waapi' | 'canvas' | 'webgl' | 'js';
  /** Variáveis que controlam a animação. */
  variaveis: string[];
  /** Como aparece no Figma: variantes (quadros-chave), documentação ou não exportada. */
  figma: 'variantes' | 'documental';
  nivel: KcxNivel;
  descricao: string;
}

export interface KcxDependencia {
  nome: string;
  versao: string;
  licenca: string;
  url: string;
  obrigatoria: boolean;
}

export interface KcxLicenca {
  /** Identificador SPDX (ex.: MIT). */
  spdx: string;
  usoComercial: boolean;
  modificacao: boolean;
  redistribuicao: boolean;
  autor: string;
}

export interface KcxCompatibilidade {
  navegadores: string;
  reducedMotion: boolean;
  figma: {
    nivel: KcxNivel;
    /** O que fica nativo e editável no Figma. */
    editavel: string[];
    /** O que fica representado, mas não executa no Figma. */
    parcial: string[];
    /** O que não vai para o Figma (só no código). */
    naoSuportado: string[];
    limitacoes: string[];
    /** Variáveis enum que viram eixos de variantes. */
    eixosVariante?: string[];
  };
}

export interface KcxCodigo {
  html: string;
  /** Usa var(--kcx-…). O bloco :root com os valores é gerado a partir das variáveis. */
  css: string;
  js: string;
  svg?: string;
}

export interface KcxComponente {
  id: string;
  nome: string;
  categoria: string;
  descricao: string;
  tecnologia: string[];
  versao: string;
  licenca: KcxLicenca;
  metadados: {
    autor: string;
    tags: string[];
    criadoEm: string;
    atualizadoEm: string;
    largura: number;
    altura: number;
  };
  codigo: KcxCodigo;
  variaveis: KcxVariavel[];
  estados: KcxEstado[];
  presets: KcxPreset[];
  dependencias: KcxDependencia[];
  estrutura: KcxNo;
  animacoes: KcxAnimacao[];
  compatibilidade: KcxCompatibilidade;
}

/* ============================== Composição ============================== */

export interface KcxCamada {
  /** ID do componente usado (precisa estar em `componentes`). */
  componente: string;
  /** Prefixo único da camada (evita conflito de nomes). */
  prefixo: string;
  papel: 'fundo' | 'centro' | 'sobreposicao';
  /** Valores próprios da camada. */
  valores: Record<string, KcxValor>;
}

export interface KcxVariavelCompartilhada {
  id: string;
  nome: string;
  tipo: KcxTipoVariavel;
  valor: KcxValor;
  /** "prefixo.variavel" que recebem o valor. */
  alvos: string[];
}

export interface KcxComposicao {
  id: string;
  nome: string;
  camadas: KcxCamada[];
  compartilhadas: KcxVariavelCompartilhada[];
}

/* ============================== Pacote ============================== */

export type KcxModoExportacao =
  'completo' | 'visual' | 'variaveis' | 'componentes-variaveis' | 'pacote';

export interface KcxAlteracao {
  versao: string;
  data: string;
  descricao: string;
}

export interface KcxPacote {
  formato: typeof KCX_FORMATO;
  schemaVersion: string;
  id: string;
  versao: string;
  nome: string;
  criadoEm: string;
  origem: { ferramenta: string; versao: string; url?: string };
  exportacao: { modo: KcxModoExportacao; presetAplicado?: string };
  componentes: KcxComponente[];
  composicao?: KcxComposicao;
  dependencias: KcxDependencia[];
  historico: KcxAlteracao[];
}

/** Alterações feitas no Figma e trazidas de volta (Figma → Lab). */
export interface KcxAlteracoesFigma {
  formato: 'kcx-alteracoes';
  schemaVersion: string;
  pacote: string;
  componente: string;
  versao: string;
  exportadoEm: string;
  valores: Record<string, KcxValor>;
}

/** Arquivo de preset avulso (exportar/importar presets). */
export interface KcxArquivoPresets {
  formato: 'kcx-presets';
  schemaVersion: string;
  componente: string;
  presets: KcxPreset[];
}
