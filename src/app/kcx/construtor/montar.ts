import type { Montagem } from './montado';
import type { KcxFundacao } from '../fundacao';
import { KcxLogo, ehSvg, larguraPara, noDaImagem, validarLogo } from '../logo';
/**
 * Construtor KCX — monta um componente completo (variáveis, código, estrutura
 * do Figma, estados e interações) a partir de um tipo + os nomes e a animação
 * que a pessoa escolheu no KCX Studio. Só CSS, SVG e Angular (sem dependências).
 */
import { ICONES_KCX } from '../icones';
import {
  KcxAnimacao,
  KcxComponente,
  KcxEstado,
  KcxInteracao,
  KcxNo,
  KcxPrototipo,
  KcxRef,
  KcxVariavel,
} from '../kcx.types';
import { LICENCA_MIT, MAPA_EASING, EASINGS_KCX, variavel } from '../componentes/_base';

/* ============================== Configuração ============================== */

export interface CoresConstrutor {
  primaria: string;
  fundo: string;
  superficie: string;
  texto: string;
  /** Cor do texto dos botões cheios (independente da cor do botão). Padrão: a cor de fundo. */
  textoBotao?: string;
}

export interface ConfigConstrutor {
  tipo: string;
  /** Nome do componente (ex.: "Menu do site"). */
  nome: string;
  /** kebab-case; se vazio, vem do nome. */
  id?: string;
  /** Textos nomeados do tipo (título, botão, etc.). */
  textos: Record<string, string>;
  /** Lista do tipo (links, slides, abas, perguntas…). */
  itens: string[];
  /** Subtítulo de cada item, nos tipos com `subItens` (ex.: linha abaixo do título do slide). */
  subItens?: string[];
  /** Id da animação escolhida entre as do tipo. */
  animacao: string;
  cores: CoresConstrutor;
  raio: number;
  /** URL (https ou data:) de imagem ou vídeo, nos tipos com mídia. */
  midia?: string;
  /** Cor de cada item, nos tipos com `coresPorItem` (ex.: um botão de cada cor). */
  coresItens?: string[];
  /** Recursos do Figma ligados (ids de `DefinicaoTipo.recursos`). Ausente = desligado. */
  recursos?: Record<string, boolean>;
  /** Ícone escolhido para cada lugar (`DefinicaoTipo.icones`), da biblioteca KCX. */
  icones?: Record<string, string>;
  /** Criar os modos Claro e Escuro nas variáveis de cor do Figma. */
  modos?: boolean;
  /** Criar os modos Desktop e Celular nas medidas (espaço e texto menores no celular). */
  telas?: boolean;
  /** Curva das interações no protótipo do Figma. */
  curva?: 'suave' | 'linear' | 'entrada-saida' | 'mola' | 'quique';
  /** Cores do tema oposto (modos Claro/Escuro). Ausente = tema padrão do KCX. Vem da fundação. */
  temaOposto?: { fundo: string; superficie: string; texto: string; suave: string };
  /** Cor do texto secundário. Ausente = #a9a3c9. Vem da fundação. */
  corSuave?: string;
  /** Carrossel: quantos slides aparecem juntos no desktop (1, 3 ou 4). No celular é sempre 1. */
  porTela?: number;
  /** Montador visual: as camadas do componente montado do zero. */
  montagem?: Montagem;
  /** Montador visual: a fundação (tokens) usada na montagem. */
  fundacaoMontagem?: KcxFundacao;
  /** Logo da marca: troca o texto da marca (navbar, rodapé, menus) pela imagem. */
  logo?: KcxLogo;
  /** Altura da logo em px (padrão 32). */
  alturaLogo?: number;
}

/** Tema oposto (para o modo Claro/Escuro). */
const TEMA_CLARO = { fundo: '#ffffff', superficie: '#f3f1fb', texto: '#1a1530', suave: '#5b5675' };
const TEMA_ESCURO = { fundo: '#0b0a14', superficie: '#1a1530', texto: '#f4f2ff', suave: '#a9a3c9' };

function ehClaro(hex: string): boolean {
  const m = /^#?([0-9a-f]{6})/i.exec(hex);
  if (!m) return false;
  const n = parseInt(m[1], 16);
  const lum = (0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255;
  return lum > 0.6;
}

/** Recurso opcional de um tipo (vira variantes, propriedades ou interações no Figma). */
export interface RecursoTipo {
  id: string;
  nome: string;
  descricao: string;
  padrao: boolean;
  /** Recurso que não combina com uma animação (ex.: Tipos com “Preenche no hover”). */
  exceto?: string[];
}

export interface CampoTexto {
  id: string;
  rotulo: string;
  padrao: string;
  /** Só existe com este recurso ligado. */
  recurso?: string;
}

export interface OpcaoAnimacao {
  id: string;
  nome: string;
  descricao: string;
}

export type CategoriaConstrutor =
  'acoes' | 'navegacao' | 'sobreposicao' | 'conteudo' | 'formularios' | 'secoes';

export const CATEGORIAS_CONSTRUTOR: { id: CategoriaConstrutor; nome: string }[] = [
  { id: 'navegacao', nome: 'Navegação' },
  { id: 'acoes', nome: 'Botões e ações' },
  { id: 'sobreposicao', nome: 'Janelas e avisos' },
  { id: 'conteudo', nome: 'Cards e conteúdo' },
  { id: 'formularios', nome: 'Formulários' },
  { id: 'secoes', nome: 'Seções de página' },
];

export interface Partes {
  html: string;
  css: string;
  js?: string;
  estrutura: KcxNo;
  variaveis?: KcxVariavel[];
  estados?: KcxEstado[];
  interacoes?: KcxInteracao[];
  /** Eixos de variante além do Estado (ids de variáveis enum). */
  eixos?: string[];
  animacao: Omit<KcxAnimacao, 'id' | 'figma' | 'nivel'> & { figma?: KcxAnimacao['figma'] };
  editavel: string[];
  parcial?: string[];
  naoSuportado?: string[];
  limitacoes?: string[];
  tags?: string[];
  /** Componentes usados por instâncias (vão junto para o Figma). */
  subcomponentes?: KcxComponente[];
  /** Protótipo de exemplo (overlay). */
  prototipo?: KcxPrototipo;
}

export interface DefinicaoTipo {
  id: string;
  nome: string;
  categoria: CategoriaConstrutor;
  descricao: string;
  /** Plataforma onde o tipo costuma aparecer. */
  uso: string;
  textos: CampoTexto[];
  itens?: { rotulo: string; padrao: string[]; min: number; max: number };
  /** Cada item tem a sua cor (cfg.coresItens). */
  coresPorItem?: boolean;
  /** Recursos do Figma que a pessoa liga e desliga (estados, tipos, ícones…). */
  recursos?: RecursoTipo[];
  /**
   * Partes que a pessoa liga e desliga (recurso "partes"): cada uma vira uma
   * propriedade liga/desliga no Figma e um atributo data-mostrar-<id> no código.
   */
  partes?: { no: string; nome: string; classe: string }[];
  /** Lugares com ícone trocável (ex.: à esquerda e à direita do texto). */
  icones?: { id: string; rotulo: string; padrao: string; recurso?: string }[];
  animacoes: OpcaoAnimacao[];
  midia?: 'imagem' | 'video';
  largura: number;
  altura: number;
  gerar(cfg: ConfigConstrutor, b: Blocos): Partes;
  /** Carrossel: cards por vez no desktop de um componente novo. */
  porTela?: number;
  /** Uma segunda linha por item (subtítulo do slide), ligada a um recurso. */
  subItens?: { rotulo: string; padrao: string[]; recurso: string };
}

/* ============================== Blocos de montagem ============================== */

const pascal = (s: string) =>
  s
    .replace(/[^a-zA-Z0-9]+(.)?/g, (_, c: string | undefined) => (c ? c.toUpperCase() : ''))
    .replace(/^./, (c) => c.toUpperCase());

export function slug(texto: string): string {
  return (
    texto
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'componente'
  );
}

export const escHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Ferramentas que cada tipo usa para escrever HTML/CSS e a estrutura do Figma. */
export class Blocos {
  readonly id: string;
  /** Prefixo das custom properties: --kcx-<id>. */
  readonly P: string;
  /** Classe raiz: kcx-<id>. */
  readonly C: string;
  readonly extras: KcxVariavel[] = [];

  constructor(readonly cfg: ConfigConstrutor) {
    this.id = cfg.id || slug(cfg.nome);
    this.P = `--kcx-${this.id}`;
    this.C = `kcx-${this.id}`;
  }

  /** O recurso está ligado? (configurações antigas, sem `recursos`, ficam como eram). */
  tem(recurso: string): boolean {
    return this.cfg.recursos?.[recurso] === true;
  }

  /** Ícone escolhido para o lugar `id` (ou o padrão). */
  nomeIcone(id: string, padrao: string): string {
    const n = this.cfg.icones?.[id];
    return n && n in ICONES_KCX ? n : padrao;
  }

  /** SVG inline de um ícone da biblioteca KCX (currentColor). */
  svgKcx(nome: string, classe: string, tamanho = 20): string {
    return svgIcone(ICONES_KCX[nome] ?? ICONES_KCX['mais'], classe, tamanho);
  }

  /** Instância de um ícone da biblioteca KCX no Figma (com troca de instância). */
  noIcone(
    id: string,
    nome: string,
    icone: string,
    cor: KcxRef<string>,
    tamanho: KcxRef<number> = 20,
    extra: Partial<KcxNo> & { troca?: string } = {},
  ): KcxNo {
    const { troca, ...resto } = extra;
    return {
      id,
      nome,
      tipo: 'icone',
      icone: { nome: icone, cor, tamanho, propriedade: troca },
      ...resto,
    };
  }

  /** Classe BEM: kcx-<id>__<parte>. */
  c(parte: string): string {
    return `${this.C}__${parte}`;
  }

  /** var(--kcx-<id>-<nome>). */
  v(nome: string): string {
    return `var(${this.P}-${nome})`;
  }

  /** Id da variável de um texto nomeado. */
  idTexto(slot: string): string {
    return `texto${pascal(slot)}`;
  }

  texto(slot: string): string {
    return this.cfg.textos[slot] ?? '';
  }

  idItem(i: number): string {
    return `item${i + 1}`;
  }

  /** HTML de um texto nomeado ligado à variável (o conteúdo muda sem recarregar). */
  span(slot: string, tag = 'span', attrs = ''): string {
    return `<${tag} class="${this.c(slot)}"${attrs ? ' ' + attrs : ''}>${escHtml(this.texto(slot))}</${tag}>`;
  }

  /** HTML de um item da lista, ligado a item<N>. */
  idSubItem(i: number): string {
    return `subItem${i + 1}`;
  }

  /** HTML do subtítulo do item i (data-kcx-sub). */
  subItem(i: number, tag = 'p', attrs = ''): string {
    return `<${tag} data-kcx-sub="${i + 1}"${attrs ? ' ' + attrs : ''}>${escHtml(this.cfg.subItens?.[i] ?? '')}</${tag}>`;
  }

  /** Nó do Figma do subtítulo do item i. */
  noSubItem(
    i: number,
    opts: { tamanho?: KcxRef<number>; estilo?: string; cor?: KcxRef<string> } = {},
  ): KcxNo {
    return {
      id: `sub-${i + 1}`,
      nome: `Subtítulo ${i + 1}`,
      tipo: 'texto',
      preenchimentos: [{ tipo: 'solido', cor: opts.cor ?? this.cor('texto') }],
      texto: {
        conteudo: { $var: this.idSubItem(i) },
        tamanho: opts.tamanho ?? this.fonte,
        familia: 'Inter',
        estilo: opts.estilo ?? 'Regular',
        propriedade: `Subtítulo ${i + 1}`,
      },
    };
  }

  item(i: number, tag = 'span', attrs = ''): string {
    return `<${tag} data-kcx-item="${i + 1}"${attrs ? ' ' + attrs : ''}>${escHtml(this.cfg.itens[i] ?? '')}</${tag}>`;
  }

  /** Variável extra do tipo (dimensão, número, boolean…). */
  extra(v: Omit<KcxVariavel, 'valor' | 'exportavel'>): string {
    this.extras.push(variavel(v));
    return v.id;
  }

  /** Dimensão extra em px ligada a --kcx-<id>-<css>. */
  dim(
    id: string,
    nome: string,
    padrao: number,
    min: number,
    max: number,
    css: string,
    descricao: string,
    grupo: KcxVariavel['grupo'] = 'dimensions',
  ): string {
    return this.extra({
      id,
      nome,
      tipo: 'dimension',
      padrao,
      min,
      max,
      passo: 1,
      unidade: 'px',
      descricao,
      grupo,
      secao: 'aparencia',
      vinculos: [
        {
          propriedade: css,
          alvo: { tipo: 'css-var', nome: `${this.P}-${css}` },
          unidadeSaida: 'px',
        },
      ],
    });
  }

  /** Boolean que liga um atributo data-* na raiz (abrir/fechar, ativo…). */
  estadoAberto(id = 'aberto', nome = 'Aberto', descricao = 'Mostra o componente aberto.'): string {
    return this.extra({
      id,
      nome,
      tipo: 'boolean',
      padrao: false,
      descricao: `${descricao} No código, o clique alterna sozinho; aqui serve para ver e exportar o estado.`,
      grupo: 'components',
      secao: 'comportamento',
      vinculos: [
        {
          propriedade: `data-${id} na raiz`,
          alvo: { tipo: 'atributo', seletor: `.${this.C}`, atributo: `data-${id}` },
          transformar: [{ op: 'mapa', valores: { true: 'true', false: 'false' } }],
        },
      ],
    });
  }

  /** Número inteiro (ex.: slide ou aba ativa) que vai para data-* na raiz e para uma custom property. */
  indiceAtivo(id: string, nome: string, total: number, descricao: string): string {
    return this.extra({
      id,
      nome,
      tipo: 'number',
      padrao: 1,
      min: 1,
      max: Math.max(1, total),
      passo: 1,
      descricao,
      grupo: 'components',
      secao: 'comportamento',
      vinculos: [
        {
          propriedade: `data-${id} na raiz`,
          alvo: { tipo: 'atributo', seletor: `.${this.C}`, atributo: `data-${id}` },
        },
        {
          propriedade: `--${id}`,
          alvo: { tipo: 'css-var', nome: `${this.P}-${id.toLowerCase()}` },
        },
      ],
    });
  }

  /* ---------- Estrutura do Figma ---------- */

  /** Boolean invertido (ex.: esconder os links quando a vista é mobile). */
  /**
   * Cor do texto dos botões cheios, independente da cor do botão (variável
   * corTextoBotao). Devolve o var() do CSS; no Figma use { $var: 'corTextoBotao' }.
   */
  textoBotao(): string {
    if (!this.extras.some((v) => v.id === 'corTextoBotao'))
      this.extra({
        id: 'corTextoBotao',
        nome: 'Cor do texto do botão',
        tipo: 'color',
        padrao: this.cfg.cores.textoBotao ?? this.cfg.cores.fundo,
        descricao: 'Texto dos botões cheios, independente da cor do botão.',
        grupo: 'colors',
        secao: 'aparencia',
        vinculos: [
          { propriedade: 'texto-botao', alvo: { tipo: 'css-var', nome: `${this.P}-texto-botao` } },
        ],
      });
    return this.v('texto-botao');
  }

  nao(id: string, nome: string): KcxRef<boolean> {
    return {
      $derivado: id,
      nome,
      transformar: [{ op: 'mapa', valores: { true: 'false', false: 'true' } }],
    } as unknown as KcxRef<boolean>;
  }

  /** Verdadeiro quando o índice `id` vale `n` (de 1 a total; 0 = nenhum). */
  quando(id: string, n: number, total: number, nome: string, incluirZero = false): KcxRef<boolean> {
    const valores: Record<string, string> = {};
    for (let k = incluirZero ? 0 : 1; k <= total; k++)
      valores[String(k)] = k === n ? 'true' : 'false';
    return {
      $derivado: id,
      nome,
      transformar: [{ op: 'mapa', valores }],
    } as unknown as KcxRef<boolean>;
  }

  /** Posição que anda com o índice: (índice − 1) × passo + inicio. */
  posicao(id: string, nome: string, passo: number, inicio = 0): KcxRef<number> {
    return {
      $derivado: id,
      nome,
      transformar: [
        { op: 'somar', valor: -1 },
        { op: 'multiplicar', fator: passo },
        { op: 'somar', valor: inicio },
      ],
    };
  }

  /** Espaçamento × fator (paddings proporcionais). */
  espacoX(fator: number, nome: string): KcxRef<number> {
    return { $derivado: 'espaco', nome, transformar: [{ op: 'multiplicar', fator }] };
  }

  /** Fonte × fator (títulos). */
  fonteX(fator: number, nome: string): KcxRef<number> {
    return {
      $derivado: 'fonte',
      nome,
      transformar: [
        { op: 'multiplicar', fator },
        { op: 'arredondar', casas: 0 },
      ],
    };
  }

  /** Cor com transparência (sombra, fundo escurecido). */
  corAlpha(cor: string, nome: string, alpha: number | string): KcxRef<string> {
    return {
      $derivado: cor,
      nome,
      transformar: [
        typeof alpha === 'number'
          ? { op: 'alpha', valor: alpha }
          : { op: 'alpha', variavel: alpha },
      ],
    };
  }

  /** Botão do Figma (Auto Layout + texto nomeado). */
  noBotao(
    id: string,
    slot: string,
    rotulo: string,
    tipo: 'primario' | 'secundario' = 'primario',
    extra: Partial<KcxNo> = {},
  ): KcxNo {
    return this.pilha(
      id,
      rotulo,
      'horizontal',
      [
        this.noTexto(slot, rotulo, {
          estilo: 'Semi Bold',
          cor: tipo === 'primario' ? { $var: 'corFundo' } : this.cor('texto'),
        }),
      ],
      {
        px: this.espacoX(1.5, 'botao-px'),
        py: this.espacoX(0.75, 'botao-py'),
        raio: this.raio,
        preenchimentos: tipo === 'primario' ? [{ tipo: 'solido', cor: this.cor('primaria') }] : [],
        traco: tipo === 'secundario' ? { cor: this.cor('suave'), espessura: 1 } : undefined,
        ...extra,
      },
    );
  }

  cor(nome: 'primaria' | 'fundo' | 'superficie' | 'texto' | 'suave'): KcxRef<string> {
    return { $var: `cor${pascal(nome)}` };
  }

  get raio(): KcxRef<number> {
    return { $var: 'raio' };
  }

  get fonte(): KcxRef<number> {
    return { $var: 'fonte' };
  }

  get espaco(): KcxRef<number> {
    return { $var: 'espaco' };
  }

  /** Nó de texto ligado a um texto nomeado (vira propriedade de texto no Figma). */
  noTexto(
    slot: string,
    rotulo: string,
    opts: {
      tamanho?: KcxRef<number>;
      estilo?: string;
      cor?: KcxRef<string>;
      alinhamento?: 'esquerda' | 'centro' | 'direita';
      preencher?: boolean;
      caixaAlta?: boolean;
    } = {},
  ): KcxNo {
    return {
      id: `t-${slot}`,
      nome: rotulo,
      tipo: 'texto',
      preenchimentos: [{ tipo: 'solido', cor: opts.cor ?? this.cor('texto') }],
      texto: {
        conteudo: { $var: this.idTexto(slot) },
        tamanho: opts.tamanho ?? this.fonte,
        familia: 'Inter',
        estilo: opts.estilo ?? 'Regular',
        alinhamento: opts.alinhamento,
        preencher: opts.preencher,
        caixaAlta: opts.caixaAlta,
        propriedade: rotulo,
      },
    };
  }

  /** Nó de texto de um item da lista. */
  noItem(
    i: number,
    opts: {
      tamanho?: KcxRef<number>;
      estilo?: string;
      cor?: KcxRef<string>;
      preencher?: boolean;
      prefixo?: string;
    } = {},
  ): KcxNo {
    return {
      id: `${opts.prefixo ?? 'item'}-${i + 1}`,
      nome: `Item ${i + 1}`,
      tipo: 'texto',
      preenchimentos: [{ tipo: 'solido', cor: opts.cor ?? this.cor('texto') }],
      texto: {
        conteudo: { $var: this.idItem(i) },
        tamanho: opts.tamanho ?? this.fonte,
        familia: 'Inter',
        estilo: opts.estilo ?? 'Regular',
        preencher: opts.preencher,
        propriedade: `Item ${i + 1}`,
      },
    };
  }

  /** Frame com Auto Layout (colunas alinham à esquerda, como no CSS; linhas centralizam). */
  pilha(
    id: string,
    nome: string,
    direcao: 'horizontal' | 'vertical',
    filhos: KcxNo[],
    extra: Partial<KcxNo> & {
      espaco?: KcxRef<number>;
      px?: KcxRef<number>;
      py?: KcxRef<number>;
      alinhar?: 'inicio' | 'centro' | 'fim';
      quebrar?: boolean;
      distribuir?: boolean;
    } = {},
  ): KcxNo {
    const { espaco, px, py, alinhar, quebrar, distribuir, ...resto } = extra;
    return {
      id,
      nome,
      tipo: 'frame',
      preenchimentos: [],
      autoLayout: {
        direcao,
        espaco: espaco ?? 0,
        paddingX: px ?? 0,
        paddingY: py ?? 0,
        alinhar: alinhar ?? (direcao === 'vertical' ? 'inicio' : 'centro'),
        quebrar,
        ...(distribuir ? { distribuir } : {}),
      },
      filhos,
      ...resto,
    };
  }

  /** Ícone SVG nativo (vetor editável no Figma). */
  icone(
    id: string,
    nome: string,
    d: string,
    tamanho = 24,
    cor: KcxRef<string> = this.cor('texto'),
  ): KcxNo {
    return {
      id,
      nome,
      tipo: 'svg',
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${tamanho}" height="${tamanho}" viewBox="0 0 24 24"><path d="${d}" fill="none" stroke="#fff" stroke-width="2"/></svg>`,
      svgTraco: { cor, espessura: 2 },
    };
  }
}

/** Ícones (comandos absolutos, traço 2px, 24×24). */
export const ICONES = {
  menu: 'M 4 7 L 20 7 M 4 12 L 20 12 M 4 17 L 20 17',
  fechar: 'M 6 6 L 18 18 M 18 6 L 6 18',
  esquerda: 'M 15 5 L 8 12 L 15 19',
  direita: 'M 9 5 L 16 12 L 9 19',
  baixo: 'M 6 9 L 12 15 L 18 9',
  play: 'M 8 5 L 19 12 L 8 19 Z',
  check: 'M 5 12 L 10 17 L 19 7',
  info: 'M 12 11 L 12 17 M 12 7 L 12 7.5',
  casa: 'M 4 11 L 12 4 L 20 11 L 20 20 L 4 20 Z',
};

/** SVG inline para usar no HTML (currentColor). */
export function svgIcone(d: string, classe: string, tamanho = 24): string {
  return `<svg class="${classe}" width="${tamanho}" height="${tamanho}" viewBox="0 0 24 24" aria-hidden="true"><path d="${d}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

/* ============================== Montagem ============================== */

export const CORES_PADRAO: CoresConstrutor = {
  primaria: '#d4119f',
  fundo: '#0b0a14',
  superficie: '#1a1530',
  texto: '#f4f2ff',
};

/** Configuração inicial de um tipo (textos e itens padrão, primeira animação). */
export function configPadrao(def: DefinicaoTipo, nome = def.nome): ConfigConstrutor {
  return {
    tipo: def.id,
    nome,
    textos: Object.fromEntries(def.textos.map((t) => [t.id, t.padrao])),
    itens: [...(def.itens?.padrao ?? [])],
    animacao: def.animacoes[0]?.id ?? '',
    cores: { ...CORES_PADRAO },
    raio: 12,
    midia: '',
    recursos: Object.fromEntries((def.recursos ?? []).map((r) => [r.id, r.padrao])),
    icones: Object.fromEntries((def.icones ?? []).map((i) => [i.id, i.padrao])),
    ...(def.porTela ? { porTela: def.porTela } : {}),
    ...(def.subItens ? { subItens: [...def.subItens.padrao] } : {}),
  };
}

function variaveisBase(b: Blocos, def: DefinicaoTipo): KcxVariavel[] {
  const { P, cfg } = b;
  const cor = (id: string, nome: string, padrao: string, css: string, descricao: string) =>
    variavel({
      id,
      nome,
      tipo: 'color',
      padrao,
      descricao,
      grupo: 'colors',
      secao: 'aparencia',
      vinculos: [{ propriedade: css, alvo: { tipo: 'css-var', nome: `${P}-${css}` } }],
    });
  const vars: KcxVariavel[] = [
    cor(
      'corPrimaria',
      'Cor principal',
      cfg.cores.primaria,
      'primaria',
      'Botões, destaques e item ativo.',
    ),
    cor('corFundo', 'Cor de fundo', cfg.cores.fundo, 'fundo', 'Fundo do componente.'),
    cor(
      'corSuperficie',
      'Cor da superfície',
      cfg.cores.superficie,
      'superficie',
      'Cards, painéis e janelas.',
    ),
    cor('corTexto', 'Cor do texto', cfg.cores.texto, 'texto', 'Texto principal.'),
    variavel({
      id: 'corSuave',
      nome: 'Cor do texto secundário',
      tipo: 'color',
      padrao: cfg.corSuave ?? '#a9a3c9',
      descricao: 'Legendas, descrições e itens inativos.',
      grupo: 'colors',
      secao: 'aparencia',
      vinculos: [{ propriedade: 'suave', alvo: { tipo: 'css-var', nome: `${P}-suave` } }],
    }),
    variavel({
      id: 'raio',
      nome: 'Arredondamento',
      tipo: 'dimension',
      padrao: cfg.raio,
      min: 0,
      max: 40,
      passo: 1,
      unidade: 'px',
      descricao: 'Raio dos cantos (botões, cards, painéis).',
      grupo: 'dimensions',
      secao: 'aparencia',
      vinculos: [
        {
          propriedade: 'border-radius',
          alvo: { tipo: 'css-var', nome: `${P}-raio` },
          unidadeSaida: 'px',
        },
      ],
    }),
    variavel({
      id: 'espaco',
      nome: 'Espaçamento',
      tipo: 'dimension',
      padrao: 16,
      min: 4,
      max: 48,
      passo: 2,
      unidade: 'px',
      descricao: 'Espaço interno e entre os elementos.',
      grupo: 'spacing',
      secao: 'aparencia',
      vinculos: [
        {
          propriedade: 'padding e gap',
          alvo: { tipo: 'css-var', nome: `${P}-espaco` },
          unidadeSaida: 'px',
        },
      ],
    }),
    variavel({
      id: 'fonte',
      nome: 'Tamanho do texto',
      tipo: 'dimension',
      padrao: 16,
      min: 12,
      max: 28,
      passo: 1,
      unidade: 'px',
      descricao: 'Tamanho base do texto (títulos crescem a partir dele).',
      grupo: 'typography',
      secao: 'aparencia',
      vinculos: [
        {
          propriedade: 'font-size',
          alvo: { tipo: 'css-var', nome: `${P}-fonte` },
          unidadeSaida: 'px',
        },
      ],
    }),
    variavel({
      id: 'duracao',
      nome: 'Duração da animação',
      tipo: 'time',
      padrao: 320,
      min: 80,
      max: 1200,
      passo: 20,
      unidade: 'ms',
      descricao: 'Tempo de abrir, trocar, entrar ou reagir ao hover.',
      grupo: 'motion',
      secao: 'animacao',
      vinculos: [
        {
          propriedade: 'transition/animation-duration',
          alvo: { tipo: 'css-var', nome: `${P}-duracao` },
          unidadeSaida: 'ms',
        },
      ],
    }),
    variavel({
      id: 'easing',
      nome: 'Curva da animação',
      tipo: 'enum',
      padrao: 'suave',
      opcoes: EASINGS_KCX,
      descricao: 'Aceleração do movimento.',
      grupo: 'motion',
      secao: 'animacao',
      vinculos: [
        {
          propriedade: 'transition-timing-function',
          alvo: { tipo: 'css-var', nome: `${P}-easing` },
          transformar: [{ op: 'mapa', valores: MAPA_EASING }],
        },
      ],
    }),
  ];
  for (const t of def.textos.filter((x) => !x.recurso || b.tem(x.recurso)))
    vars.push(
      variavel({
        id: b.idTexto(t.id),
        nome: t.rotulo,
        tipo: 'string',
        padrao: cfg.textos[t.id] ?? t.padrao,
        descricao: `Texto: ${t.rotulo.toLowerCase()}.`,
        grupo: 'components',
        secao: 'aparencia',
        vinculos: [{ propriedade: 'Texto', alvo: { tipo: 'texto', seletor: `.${b.c(t.id)}` } }],
      }),
    );
  cfg.itens.forEach((txt, i) =>
    vars.push(
      variavel({
        id: b.idItem(i),
        nome: `${def.itens?.rotulo ?? 'Item'} ${i + 1}`,
        tipo: 'string',
        padrao: txt,
        descricao: `${def.itens?.rotulo ?? 'Item'} ${i + 1}.`,
        grupo: 'components',
        secao: 'aparencia',
        vinculos: [
          {
            propriedade: 'Texto',
            alvo: { tipo: 'texto', seletor: `.${b.C} [data-kcx-item="${i + 1}"]` },
          },
        ],
      }),
    ),
  );
  if (def.subItens && b.tem(def.subItens.recurso))
    cfg.itens.forEach((_, i) =>
      vars.push(
        variavel({
          id: b.idSubItem(i),
          nome: `${def.subItens!.rotulo} ${i + 1}`,
          tipo: 'string',
          padrao: cfg.subItens?.[i] ?? '',
          descricao: `${def.subItens!.rotulo} do item ${i + 1}.`,
          grupo: 'components',
          secao: 'aparencia',
          vinculos: [
            {
              propriedade: 'Texto',
              alvo: { tipo: 'texto', seletor: `.${b.C} [data-kcx-sub="${i + 1}"]` },
            },
          ],
        }),
      ),
    );
  if (cfg.telas) {
    for (const v of vars) {
      if (v.id === 'espaco') v.modos = { celular: Math.round(Number(v.valor) * 0.75) };
      if (v.id === 'fonte')
        v.modos = { celular: Math.max(12, Math.round(Number(v.valor) * 0.875)) };
    }
  }
  if (cfg.modos || cfg.recursos?.['tema']) {
    const claro = ehClaro(cfg.cores.fundo);
    const outro = cfg.temaOposto ?? (claro ? TEMA_ESCURO : TEMA_CLARO);
    const mapa: Record<string, string> = {
      corFundo: outro.fundo,
      corSuperficie: outro.superficie,
      corTexto: outro.texto,
      corSuave: outro.suave,
    };
    for (const v of vars)
      if (v.id in mapa) v.modos = claro ? { dark: mapa[v.id] } : { light: mapa[v.id] };
  }
  return vars;
}

/** CSS comum (tipografia, foco visível e redução de movimento). */
function cssBase(b: Blocos): string {
  return `.${b.C} {
  box-sizing: border-box;
  font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  font-size: ${b.v('fonte')};
  color: ${b.v('texto')};
}
.${b.C} *, .${b.C} *::before, .${b.C} *::after { box-sizing: inherit; }
.${b.C} :is(button, a, input, summary):focus-visible { outline: 2px solid ${b.v('primaria')}; outline-offset: 3px; }
.${b.C} button { font: inherit; color: inherit; cursor: pointer; }`;
}

const CSS_SEM_MOVIMENTO = (b: Blocos) => `
@media (prefers-reduced-motion: reduce) {
  .${b.C}, .${b.C} * { animation-duration: 1ms !important; animation-iteration-count: 1 !important; transition-duration: 1ms !important; }
}`;

/** Gera o componente KCX completo. */
/** Tipos com marca em texto: a logo entra no lugar do texto da marca. */
export const temMarca = (def: DefinicaoTipo) => def.textos.some((t) => t.id === 'marca');

function aplicarLogo(
  def: DefinicaoTipo,
  cfg: ConfigConstrutor,
  b: Blocos,
  partes: ReturnType<DefinicaoTipo['gerar']>,
): void {
  const logo = cfg.logo;
  if (!logo || !temMarca(def) || validarLogo(logo).length) return;
  const C = b.C;
  const H = Math.min(120, Math.max(12, Math.round(cfg.alturaLogo ?? 32)));
  const W = larguraPara(logo, H);
  const alt = escHtml(b.texto('marca') || logo.nome || 'Logo');
  const img = `<img class="${C}__marca ${C}__logo" src="${logo.src}" alt="${alt}" width="${W}" height="${H}">`;
  const re = new RegExp(`<(\\w+) class="${C}__marca"[^>]*>[\\s\\S]*?</\\1>`);
  if (!re.test(partes.html)) return;
  partes.html = partes.html.replace(re, img);
  partes.css += `\n.${C}__logo { display: block; flex: none; width: auto; height: ${H}px; object-fit: contain; }`;
  const trocar = (n: KcxNo): KcxNo =>
    n.id === 't-marca'
      ? noDaImagem('logo', 'Logo', logo.src, W, H, 'caber')
      : n.filhos
        ? { ...n, filhos: n.filhos.map(trocar) }
        : n;
  partes.estrutura = trocar(partes.estrutura);
  partes.editavel = [
    ...(partes.editavel ?? []),
    ehSvg(logo.src)
      ? 'Logo em SVG: vetores editáveis no Figma'
      : 'Logo como imagem (troque pelo arquivo novo com Fill → Image)',
  ];
}

export function construirComponente(def: DefinicaoTipo, cfg: ConfigConstrutor): KcxComponente {
  const b = new Blocos(cfg);
  const partes = def.gerar(cfg, b);
  aplicarPartesOpcionais(def, b, partes);
  aplicarLogo(def, cfg, b, partes);
  const anim = def.animacoes.find((a) => a.id === cfg.animacao) ?? def.animacoes[0];
  const hoje = new Date().toISOString().slice(0, 10);
  const variaveis = [...variaveisBase(b, def), ...b.extras, ...(partes.variaveis ?? [])];
  const nivel = 2 as const;
  return {
    id: b.id,
    nome: cfg.nome || def.nome,
    categoria: def.categoria,
    descricao: `${def.descricao}${anim ? ` Animação: ${anim.nome.toLowerCase()}.` : ''}`,
    tecnologia: ['HTML', 'CSS', 'Angular'],
    versao: '1.0.0',
    licenca: LICENCA_MIT,
    metadados: {
      autor: 'Criado no KCX Studio',
      tags: [def.nome.toLowerCase(), def.uso, ...(partes.tags ?? [])],
      criadoEm: hoje,
      atualizadoEm: hoje,
      largura: def.largura,
      altura: def.altura,
    },
    variaveis,
    codigo: {
      html: partes.html,
      css: `/* ${cfg.nome || def.nome} — ${def.nome} criado no KCX Studio (variáveis KCX) */\n${cssBase(b)}\n\n${partes.css.trim()}\n${CSS_SEM_MOVIMENTO(b)}`,
      js: partes.js ?? '// Sem JavaScript: a interação é só CSS.',
    },
    estados: partes.estados ?? [
      {
        id: 'padrao',
        nome: 'Padrão',
        gatilho: 'padrao',
        descricao: 'Estado inicial.',
        valores: {},
      },
    ],
    presets: [
      {
        id: 'escuro',
        nome: 'Escuro',
        valores: {
          corFundo: '#0b0a14',
          corSuperficie: '#1a1530',
          corTexto: '#f4f2ff',
          corSuave: '#a9a3c9',
        },
      },
      {
        id: 'claro',
        nome: 'Claro',
        valores: {
          corFundo: '#ffffff',
          corSuperficie: '#f3f1fb',
          corTexto: '#1a1530',
          corSuave: '#5b5675',
        },
      },
      { id: 'quadrado', nome: 'Cantos retos', valores: { raio: 0 } },
      { id: 'pilula', nome: 'Bem arredondado', valores: { raio: 28 } },
      { id: 'lento', nome: 'Animação lenta', valores: { duracao: 800 } },
      { id: 'rapido', nome: 'Animação rápida', valores: { duracao: 160 } },
    ],
    dependencias: [],
    estrutura: partes.estrutura,
    animacoes: [
      {
        id: anim?.id ?? 'animacao',
        nivel,
        figma: partes.animacao.figma ?? 'variantes',
        nome: partes.animacao.nome,
        tecnica: partes.animacao.tecnica,
        variaveis: partes.animacao.variaveis,
        descricao: partes.animacao.descricao,
      },
    ],
    compatibilidade: {
      navegadores: 'Chrome, Edge, Firefox e Safari atuais.',
      reducedMotion: true,
      figma: {
        nivel,
        editavel: [
          'Componente reutilizável com instância de exemplo',
          'Cores, arredondamento, espaçamento e tamanho do texto por variáveis (modos Dark/Light)',
          'Todos os textos como propriedades de texto da instância',
          ...partes.editavel,
        ],
        parcial: partes.parcial ?? [],
        naoSuportado: partes.naoSuportado ?? [],
        limitacoes: [
          'O Figma não executa CSS: o movimento aparece como troca de variantes com Smart Animate no protótipo.',
          ...(partes.limitacoes ?? []),
        ],
        eixosVariante: partes.eixos,
      },
    },
    subcomponentes: partes.subcomponentes,
    prototipo: partes.prototipo,
    interacoes: cfg.curva
      ? partes.interacoes?.map((i) => ({ ...i, curva: i.curva ?? cfg.curva }))
      : partes.interacoes,
    origemCriacao: { tipo: 'construtor', config: cfg },
  };
}

/** Busca um nó da estrutura pelo id. */
export function acharNo(raiz: KcxNo, id: string): KcxNo | undefined {
  if (raiz.id === id) return raiz;
  for (const f of raiz.filhos ?? []) {
    const r = acharNo(f, id);
    if (r) return r;
  }
  return undefined;
}

/**
 * Recurso "partes": cada parte vira uma variável booleana (Mostrar …) ligada a
 * data-mostrar-<id> na raiz e à visibilidade da camada, com propriedade
 * liga/desliga no componente do Figma.
 */
function aplicarPartesOpcionais(def: DefinicaoTipo, b: Blocos, partes: Partes): void {
  if (!def.partes?.length || !b.tem('partes')) return;
  const regras: string[] = [];
  for (const parte of def.partes) {
    const no = acharNo(partes.estrutura, parte.no);
    if (!no) continue;
    const id = `mostrar${pascal(parte.no.replace(/^t-/, ''))}`;
    const attr = `data-mostrar-${slug(parte.no.replace(/^t-/, ''))}`;
    b.extra({
      id,
      nome: `Mostrar ${parte.nome.toLowerCase()}`,
      tipo: 'boolean',
      padrao: true,
      descricao: `Liga e desliga “${parte.nome}”. No Figma é uma propriedade liga/desliga da instância.`,
      grupo: 'components',
      secao: 'aparencia',
      vinculos: [
        {
          propriedade: attr,
          alvo: { tipo: 'atributo', seletor: `.${b.C}`, atributo: attr },
          transformar: [{ op: 'mapa', valores: { true: 'true', false: 'false' } }],
        },
      ],
    });
    no.visivel = { $var: id };
    no.propriedadeVisivel = `Mostrar ${parte.nome.toLowerCase()}`;
    regras.push(`.${b.C}[${attr}="false"] .${b.c(parte.classe)} { display: none !important; }`);
  }
  partes.css += `\n${regras.join('\n')}`;
  partes.editavel = [
    ...partes.editavel,
    `Partes liga/desliga na instância: ${def.partes.map((p) => p.nome).join(', ')}`,
  ];
}
