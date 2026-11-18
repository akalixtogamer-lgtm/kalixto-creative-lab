/**
 * Plano de importação no Figma.
 *
 * Calcula, sem tocar no Figma, TUDO o que o plugin Figma Bridge vai criar:
 * coleções, modos, variáveis (com tipo, escopo e valor), quais propriedades
 * de quais camadas ficam vinculadas, variantes e limitações.
 *
 * O mesmo plano é mostrado no painel "Exportar para Figma" do laboratório e
 * executado pelo plugin — o que o painel promete é exatamente o que o plugin faz.
 */
import {
  KcxComponente,
  KcxModoExportacao,
  KcxNo,
  KcxOperacao,
  KcxPacote,
  KcxRef,
  KcxValor,
  KcxVariavel,
  KcxGradiente,
  KcxGrupo,
} from './kcx.types';
import { Valores, aplicarOperacoes, valoresAtuais } from './resolver';
import { ehRefDerivada, ehRefVariavel } from './validar';
import { corFigma } from './unidades';

export type FigmaTipo = 'COLOR' | 'FLOAT' | 'BOOLEAN' | 'STRING' | 'TIMING' | 'EASING';
export type FigmaCor = { r: number; g: number; b: number; a: number };
export interface FigmaEasing {
  type: 'CUSTOM_CUBIC_BEZIER';
  easingFunctionCubicBezier: { x1: number; y1: number; x2: number; y2: number };
}
export type FigmaValor = FigmaCor | number | boolean | string | FigmaEasing | { alias: string };

/** Curvas CSS → easing do Figma (variáveis EASING). */
export function easingFigma(css: string): FigmaEasing | null {
  const nomes: Record<string, [number, number, number, number]> = {
    linear: [0, 0, 1, 1],
    ease: [0.25, 0.1, 0.25, 1],
    'ease-in': [0.42, 0, 1, 1],
    'ease-out': [0, 0, 0.58, 1],
    'ease-in-out': [0.42, 0, 0.58, 1],
  };
  const m =
    /^cubic-bezier\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)$/.exec(
      css.trim(),
    );
  const p = m ? (m.slice(1).map(Number) as [number, number, number, number]) : nomes[css.trim()];
  return p
    ? {
        type: 'CUSTOM_CUBIC_BEZIER',
        easingFunctionCubicBezier: { x1: p[0], y1: p[1], x2: p[2], y2: p[3] },
      }
    : null;
}

/** Curva CSS que uma variável enum produz para cada opção (se todas forem curvas). */
function curvasDoEnum(v: KcxVariavel): Record<string, FigmaEasing> | null {
  if (v.tipo !== 'enum') return null;
  const mapa = v.vinculos.flatMap((l) => l.transformar ?? []).find((o) => o.op === 'mapa');
  const fonte =
    mapa && mapa.op === 'mapa'
      ? mapa.valores
      : Object.fromEntries((v.opcoes ?? []).map((o) => [o.valor, o.valor]));
  const out: Record<string, FigmaEasing> = {};
  for (const o of v.opcoes ?? []) {
    const e = easingFigma(fonte[o.valor] ?? '');
    if (!e) return null;
    out[o.valor] = e;
  }
  return out;
}

/**
 * No Figma, uma variável numérica aplicada à opacidade da camada é lida
 * em porcentagem (0–100). No KCX a opacidade é 0–1, então o plano converte.
 */
export const OPACIDADE_EM_PORCENTAGEM = true;

export const COLECOES: Record<KcxGrupo, string> = {
  colors: 'KCX · Colors',
  dimensions: 'KCX · Dimensions',
  spacing: 'KCX · Spacing',
  typography: 'KCX · Typography',
  motion: 'KCX · Motion',
  effects: 'KCX · Effects',
  components: 'KCX · Components',
};

export type OrigemVariavel =
  'direta' | 'derivada' | 'estado' | 'parada' | 'documental' | 'compartilhada';

export interface PlanoVariavel {
  nome: string;
  colecao: string;
  tipo: FigmaTipo;
  /** Valor por modo (nome do modo → valor). */
  valores: Record<string, FigmaValor>;
  escopos: string[];
  descricao: string;
  /** Custom property equivalente no código (code syntax WEB). */
  codigoWeb?: string;
  origem: OrigemVariavel;
  variavelKcx: string;
  /** Propriedades de camadas vinculadas a ela (vazio = documental). */
  vinculadaA: string[];
}

export interface PlanoProp<T> {
  valor: T;
  /** Nome da variável do Figma vinculada (ausente = valor fixo). */
  variavel?: string;
}

export type PlanoPaint =
  | { tipo: 'solido'; cor: PlanoProp<FigmaCor> }
  | {
      tipo: 'gradiente';
      transformacao: [[number, number, number], [number, number, number]];
      paradas: { posicao: number; cor: PlanoProp<FigmaCor> }[];
    };

export type PlanoEfeito =
  | {
      tipo: 'DROP_SHADOW';
      cor: PlanoProp<FigmaCor>;
      raio: PlanoProp<number>;
      espalhar: PlanoProp<number>;
      x: number;
      y: number;
    }
  | { tipo: 'LAYER_BLUR' | 'BACKGROUND_BLUR'; raio: PlanoProp<number> };

export interface PlanoNo {
  id: string;
  nome: string;
  tipo: KcxNo['tipo'];
  x?: number;
  y?: number;
  rotacao?: number;
  largura?: PlanoProp<number>;
  altura?: PlanoProp<number>;
  raio?: PlanoProp<number>;
  opacidade?: PlanoProp<number>;
  visivel?: PlanoProp<boolean>;
  preenchimentos: PlanoPaint[];
  traco?: { cor: PlanoProp<FigmaCor>; espessura: PlanoProp<number> };
  efeitos: PlanoEfeito[];
  texto?: {
    conteudo: PlanoProp<string>;
    tamanho: PlanoProp<number>;
    espacamento?: PlanoProp<number>;
    familia: string;
    estilo: string;
    caixaAlta: boolean;
    propriedade?: string;
  };
  svg?: string;
  svgTraco?: { cor: PlanoProp<FigmaCor>; espessura: PlanoProp<number>; tracejado?: number[] };
  autoLayout?: {
    direcao: 'HORIZONTAL' | 'VERTICAL';
    espaco: PlanoProp<number>;
    paddingX: PlanoProp<number>;
    paddingY: PlanoProp<number>;
  };
  recortar: boolean;
  filhos: PlanoNo[];
}

export interface PlanoVariante {
  /** "Estado=Hover, Forma=laço" */
  nome: string;
  propriedades: Record<string, string>;
  arvore: PlanoNo;
}

export interface PlanoComponente {
  id: string;
  nome: string;
  versao: string;
  pacote: string;
  nivel: 1 | 2 | 3;
  descricao: string;
  variantes: PlanoVariante[];
  limitacoes: string[];
  editavel: string[];
  parcial: string[];
  naoSuportado: string[];
  /** Código-fonte e pacote KCX guardados no componente (recuperáveis). */
  codigo: { html: string; css: string; js: string };
  largura: number;
  altura: number;
}

export interface PlanoColecao {
  nome: string;
  modos: string[];
  variaveis: PlanoVariavel[];
}

export interface PlanoFigma {
  modo: KcxModoExportacao;
  pacote: { id: string; versao: string; nome: string };
  colecoes: PlanoColecao[];
  componentes: PlanoComponente[];
  /** Quadro com a instância de cada camada (composições). */
  composicao?: { nome: string; camadas: { componente: string; papel: string }[] };
  /** Frame de documentação (código, limitações, variáveis documentais). */
  documentacao: boolean;
  avisos: string[];
  resumo: {
    variaveis: number;
    vinculadas: number;
    documentais: number;
    componentes: number;
    variantes: number;
    camadas: number;
  };
}

/* ============================== Utilidades ============================== */

const kebab = (s: string) =>
  s
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .toLowerCase();

function tipoFigma(v: KcxVariavel): FigmaTipo {
  if (v.tipo === 'color') return 'COLOR';
  if (v.tipo === 'boolean') return 'BOOLEAN';
  if (v.tipo === 'string' || v.tipo === 'enum') return 'STRING';
  return 'FLOAT';
}

function valorFigma(v: KcxVariavel, x: KcxValor, campo?: Campo): FigmaValor {
  if (v.tipo === 'color' || campo?.tipo === 'COLOR') return corFigma(String(x));
  if (typeof x === 'number' && campo?.porcentagem) return Math.round(x * 1000) / 10;
  if (typeof x === 'boolean' || typeof x === 'number' || typeof x === 'string') return x;
  return JSON.stringify(x);
}

/** Campos do Figma: tipo e escopo da variável, se aceita vínculo. */
interface Campo {
  tipo: FigmaTipo;
  escopo: string[];
  vinculavel: boolean;
  porcentagem?: boolean;
  rotulo: string;
}

const CAMPOS: Record<string, Campo> = {
  largura: { tipo: 'FLOAT', escopo: ['WIDTH_HEIGHT'], vinculavel: true, rotulo: 'largura' },
  altura: { tipo: 'FLOAT', escopo: ['WIDTH_HEIGHT'], vinculavel: true, rotulo: 'altura' },
  raio: { tipo: 'FLOAT', escopo: ['CORNER_RADIUS'], vinculavel: true, rotulo: 'raio' },
  opacidade: {
    tipo: 'FLOAT',
    escopo: ['OPACITY'],
    vinculavel: true,
    porcentagem: OPACIDADE_EM_PORCENTAGEM,
    rotulo: 'opacidade',
  },
  visivel: { tipo: 'BOOLEAN', escopo: ['ALL_SCOPES'], vinculavel: true, rotulo: 'visibilidade' },
  corPreenchimento: {
    tipo: 'COLOR',
    escopo: ['ALL_FILLS'],
    vinculavel: true,
    rotulo: 'preenchimento',
  },
  corParada: {
    tipo: 'COLOR',
    escopo: ['ALL_FILLS'],
    vinculavel: true,
    rotulo: 'parada do gradiente',
  },
  corTraco: { tipo: 'COLOR', escopo: ['STROKE_COLOR'], vinculavel: true, rotulo: 'cor do traço' },
  espessura: {
    tipo: 'FLOAT',
    escopo: ['STROKE_FLOAT'],
    vinculavel: true,
    rotulo: 'espessura do traço',
  },
  corEfeito: { tipo: 'COLOR', escopo: ['EFFECT_COLOR'], vinculavel: true, rotulo: 'cor do efeito' },
  raioEfeito: {
    tipo: 'FLOAT',
    escopo: ['EFFECT_FLOAT'],
    vinculavel: true,
    rotulo: 'raio do efeito',
  },
  conteudo: { tipo: 'STRING', escopo: ['TEXT_CONTENT'], vinculavel: true, rotulo: 'texto' },
  tamanhoFonte: {
    tipo: 'FLOAT',
    escopo: ['FONT_SIZE'],
    vinculavel: true,
    rotulo: 'tamanho da fonte',
  },
  espacamento: {
    tipo: 'FLOAT',
    escopo: ['LETTER_SPACING'],
    vinculavel: true,
    rotulo: 'espaçamento entre letras',
  },
  gap: { tipo: 'FLOAT', escopo: ['GAP'], vinculavel: true, rotulo: 'espaço do Auto Layout' },
  padding: { tipo: 'FLOAT', escopo: ['GAP'], vinculavel: true, rotulo: 'padding' },
  fixo: { tipo: 'FLOAT', escopo: [], vinculavel: false, rotulo: 'valor fixo' },
};

/* ============================== Construtor do plano ============================== */

interface Contexto {
  comp: KcxComponente;
  valores: Valores;
  /** Sufixo da variante quando ela muda valores (ex.: "hover"). */
  sufixo: string;
  base: Valores;
  usarVariaveis: boolean;
  modos: string[];
  registrar: (pv: PlanoVariavel, onde: string) => void;
}

function nomeVar(comp: string, sufixo: string, nome: string): string {
  return sufixo ? `${comp}/${sufixo}/${nome}` : `${comp}/${nome}`;
}

function porId(comp: KcxComponente, id: string): KcxVariavel {
  const v = comp.variaveis.find((x) => x.id === id);
  if (!v) throw new Error(`KCX: variável ${id} não existe em ${comp.id}`);
  return v;
}

/** Valores por modo de uma variável (Dark = valor atual; Light = modos.light). */
function valoresPorModo(
  v: KcxVariavel,
  atual: KcxValor,
  modos: string[],
  campo?: Campo,
  transformar?: (x: KcxValor) => KcxValor,
) {
  const t = transformar ?? ((x: KcxValor) => x);
  const out: Record<string, FigmaValor> = {};
  for (const m of modos) {
    const bruto =
      m === 'Light' && v.modos?.light !== undefined && atual === v.valor ? v.modos.light : atual;
    out[m] = valorFigma(v, t(bruto), campo);
  }
  return out;
}

/** Usa uma variável cujo valor depende da variante (mesmo nome se for igual à base). */
function difereDaBase(ctx: Contexto, ids: string[]): boolean {
  return ids.some((id) => JSON.stringify(ctx.valores[id]) !== JSON.stringify(ctx.base[id]));
}

function idsDeOps(ops: KcxOperacao[] = []): string[] {
  return ops.flatMap((o) => ('variavel' in o && o.variavel ? [o.variavel] : []));
}

/** Resolve uma referência da estrutura em valor + (opcional) variável do Figma. */
function resolverRef<T>(
  ref: KcxRef<T> | undefined,
  campo: Campo,
  onde: string,
  ctx: Contexto,
): PlanoProp<T> | undefined {
  if (ref === undefined) return undefined;
  const { comp, valores } = ctx;
  if (ehRefVariavel(ref)) {
    const v = porId(comp, ref.$var);
    const atual = valores[v.id];
    const valor = (v.tipo === 'color' ? corFigma(String(atual)) : atual) as T;
    if (!ctx.usarVariaveis || !campo.vinculavel || !v.exportavel) return { valor };
    const sufixo = difereDaBase(ctx, [v.id]) ? ctx.sufixo : '';
    const nome = nomeVar(comp.id, sufixo, kebab(v.id));
    ctx.registrar(
      {
        nome,
        colecao: COLECOES[v.grupo],
        tipo: campo.tipo,
        valores: valoresPorModo(v, atual, ctx.modos, campo),
        escopos: campo.escopo,
        descricao: `${v.nome} — ${v.descricao}${sufixo ? ` (valor da variante ${sufixo})` : ''}`,
        codigoWeb:
          v.vinculos.find((x) => x.alvo.tipo === 'css-var' && !x.transformar?.length)?.alvo.tipo ===
          'css-var'
            ? `var(${(v.vinculos.find((x) => x.alvo.tipo === 'css-var' && !x.transformar?.length)!.alvo as { nome: string }).nome})`
            : undefined,
        origem: sufixo ? 'estado' : 'direta',
        variavelKcx: v.id,
        vinculadaA: [],
      },
      onde,
    );
    return { valor, variavel: nome };
  }
  if (ehRefDerivada(ref)) {
    const v = porId(comp, ref.$derivado);
    const calc = aplicarOperacoes(v, valores[v.id], ref.transformar, valores, comp.variaveis);
    const valor = (campo.tipo === 'COLOR' ? corFigma(String(calc)) : calc) as T;
    if (!ctx.usarVariaveis || !campo.vinculavel) return { valor };
    const sufixo = difereDaBase(ctx, [v.id, ...idsDeOps(ref.transformar)]) ? ctx.sufixo : '';
    const nome = nomeVar(comp.id, sufixo, ref.nome);
    const grupo: KcxGrupo =
      campo.tipo === 'COLOR' ? 'colors' : v.grupo === 'motion' ? 'effects' : v.grupo;
    ctx.registrar(
      {
        nome,
        colecao: COLECOES[grupo],
        tipo: campo.tipo,
        valores: Object.fromEntries(ctx.modos.map((m) => [m, valorFigma(v, calc, campo)])),
        escopos: campo.escopo,
        descricao: `Derivada de "${v.nome}" no lab (${(ref.transformar ?? []).map((o) => o.op).join(' → ') || 'cópia'}). O Figma não recalcula fórmulas: edite aqui ou reexporte do lab.`,
        origem: sufixo ? 'estado' : 'derivada',
        variavelKcx: v.id,
        vinculadaA: [],
      },
      onde,
    );
    return { valor, variavel: nome };
  }
  const literal = (campo.tipo === 'COLOR' ? corFigma(String(ref)) : ref) as T;
  return { valor: literal };
}

function corRef(
  ref: KcxRef<string>,
  campo: Campo,
  onde: string,
  ctx: Contexto,
): PlanoProp<FigmaCor> {
  return resolverRef(ref as KcxRef<unknown>, campo, onde, ctx) as unknown as PlanoProp<FigmaCor>;
}

/** Valor literal (campo não vinculável no Figma), aceitando refs. */
function literal(ref: KcxRef<number> | undefined, ctx: Contexto): number | undefined {
  if (ref === undefined) return undefined;
  const r = resolverRef(ref, CAMPOS['fixo'], '', { ...ctx, usarVariaveis: false });
  return r ? Number(r.valor) : undefined;
}

/**
 * Matriz do gradiente no Figma a partir do ângulo CSS, do tamanho
 * (background-size %) e do deslocamento (background-position %).
 */
export function matrizGradiente(
  anguloCss: number,
  tamanhoPct = 100,
  deslocPct = 0,
): [[number, number, number], [number, number, number]] {
  const t = (anguloCss * Math.PI) / 180;
  const d = { x: Math.sin(t), y: -Math.cos(t) };
  const n = { x: Math.cos(t), y: Math.sin(t) };
  const L = Math.abs(d.x) + Math.abs(d.y) || 1;
  const S = Math.max(1, tamanhoPct / 100);
  const off = { x: (deslocPct / 100) * (S - 1), y: 0.5 * (S - 1) };
  const c = { x: 0.5, y: 0.5 };
  const r = (k: number) => Math.round(k * 10000) / 10000 || 0;
  const linha = (u: { x: number; y: number }): [number, number, number] => [
    r(u.x / (S * L)),
    r(u.y / (S * L)),
    r((u.x * (off.x / S - c.x) + u.y * (off.y / S - c.y)) / L + 0.5),
  ];
  return [linha(d), linha(n)];
}

function planejarNo(no: KcxNo, ctx: Contexto, caminho: string): PlanoNo {
  const onde = (campo: string) => `${ctx.comp.nome} › ${caminho} › ${campo}`;
  const p: PlanoNo = {
    id: no.id,
    nome: no.nome,
    tipo: no.tipo,
    x: literal(no.x, ctx),
    y: literal(no.y, ctx),
    rotacao: literal(no.rotacao, ctx),
    largura: resolverRef(no.largura, CAMPOS['largura'], onde('largura'), ctx),
    altura: resolverRef(no.altura, CAMPOS['altura'], onde('altura'), ctx),
    raio: resolverRef(no.raio, CAMPOS['raio'], onde('raio'), ctx),
    opacidade: resolverRef(no.opacidade, CAMPOS['opacidade'], onde('opacidade'), ctx),
    visivel: resolverRef(no.visivel, CAMPOS['visivel'], onde('visibilidade'), ctx),
    preenchimentos: [],
    efeitos: [],
    recortar: !!no.recortar,
    filhos: [],
  };
  (no.preenchimentos ?? []).forEach((f, i) => {
    if (f.tipo === 'solido') {
      p.preenchimentos.push({
        tipo: 'solido',
        cor: corRef(f.cor, CAMPOS['corPreenchimento'], onde('preenchimento'), ctx)!,
      });
    } else if (f.tipo === 'gradiente-linear') {
      p.preenchimentos.push({
        tipo: 'gradiente',
        transformacao: matrizGradiente(literal(f.angulo, ctx) ?? 90),
        paradas: f.paradas.map((s) => ({
          posicao: s.posicao,
          cor: corRef(s.cor, CAMPOS['corParada'], onde(`parada ${s.posicao}`), ctx)!,
        })),
      });
    } else {
      const v = porId(ctx.comp, f.variavel);
      const g = ctx.valores[v.id] as KcxGradiente;
      const tamanho = literal(f.tamanho, ctx) ?? 100;
      const desloc = literal(f.deslocamento, ctx) ?? 0;
      p.preenchimentos.push({
        tipo: 'gradiente',
        transformacao: matrizGradiente(g.angulo, tamanho, desloc),
        paradas: [...g.paradas]
          .sort((a, b) => a.posicao - b.posicao)
          .map((s, j) => {
            const cor = corFigma(s.cor);
            if (!ctx.usarVariaveis) return { posicao: s.posicao, cor: { valor: cor } };
            const sufixo = difereDaBase(ctx, [v.id]) ? ctx.sufixo : '';
            const nome = nomeVar(ctx.comp.id, sufixo, `${kebab(v.id)}/stop-${j + 1}`);
            ctx.registrar(
              {
                nome,
                colecao: COLECOES['colors'],
                tipo: 'COLOR',
                valores: Object.fromEntries(ctx.modos.map((m) => [m, cor])),
                escopos: CAMPOS['corParada'].escopo,
                descricao: `Parada ${j + 1} de "${v.nome}" (posição ${Math.round(s.posicao * 100)}%). Representação do gradiente: uma variável de cor por parada.`,
                origem: 'parada',
                variavelKcx: v.id,
                vinculadaA: [],
              },
              onde(`preenchimento ${i + 1} › parada ${j + 1}`),
            );
            return { posicao: s.posicao, cor: { valor: cor, variavel: nome } };
          }),
      });
    }
  });
  if (no.traco) {
    p.traco = {
      cor: corRef(no.traco.cor, CAMPOS['corTraco'], onde('cor do traço'), ctx)!,
      espessura: resolverRef(
        no.traco.espessura,
        CAMPOS['espessura'],
        onde('espessura do traço'),
        ctx,
      )!,
    };
  }
  (no.efeitos ?? []).forEach((ef, i) => {
    if (ef.tipo === 'sombra') {
      p.efeitos.push({
        tipo: 'DROP_SHADOW',
        cor: corRef(ef.cor, CAMPOS['corEfeito'], onde(`sombra ${i + 1} › cor`), ctx)!,
        raio: resolverRef(ef.raio, CAMPOS['raioEfeito'], onde(`sombra ${i + 1} › raio`), ctx)!,
        espalhar: resolverRef(
          ef.espalhar ?? 0,
          CAMPOS['raioEfeito'],
          onde(`sombra ${i + 1} › espalhamento`),
          ctx,
        )!,
        x: ef.x ?? 0,
        y: ef.y ?? 0,
      });
    } else {
      p.efeitos.push({
        tipo: ef.tipo === 'desfoque-camada' ? 'LAYER_BLUR' : 'BACKGROUND_BLUR',
        raio: resolverRef(ef.raio, CAMPOS['raioEfeito'], onde(`desfoque ${i + 1}`), ctx)!,
      });
    }
  });
  if (no.texto) {
    p.texto = {
      conteudo: resolverRef(no.texto.conteudo, CAMPOS['conteudo'], onde('texto'), ctx)!,
      tamanho: resolverRef(
        no.texto.tamanho,
        CAMPOS['tamanhoFonte'],
        onde('tamanho da fonte'),
        ctx,
      )!,
      espacamento: resolverRef(
        no.texto.espacamento,
        CAMPOS['espacamento'],
        onde('espaçamento'),
        ctx,
      ),
      familia: no.texto.familia,
      estilo: no.texto.estilo,
      caixaAlta: !!no.texto.caixaAlta,
      propriedade: no.texto.propriedade,
    };
  }
  if (no.svg !== undefined) {
    const r = resolverRef(no.svg as KcxRef<string>, { ...CAMPOS['fixo'], tipo: 'STRING' }, '', {
      ...ctx,
      usarVariaveis: false,
    });
    p.svg = String(r?.valor ?? '');
  }
  if (no.svgTraco) {
    p.svgTraco = {
      cor: corRef(no.svgTraco.cor, CAMPOS['corTraco'], onde('cor do traço'), ctx)!,
      espessura: resolverRef(
        no.svgTraco.espessura,
        CAMPOS['espessura'],
        onde('espessura do traço'),
        ctx,
      )!,
      tracejado: no.svgTraco.tracejado?.map((t) => Math.round((literal(t, ctx) ?? 0) * 100) / 100),
    };
  }
  if (no.autoLayout) {
    p.autoLayout = {
      direcao: no.autoLayout.direcao === 'horizontal' ? 'HORIZONTAL' : 'VERTICAL',
      espaco: resolverRef(no.autoLayout.espaco, CAMPOS['gap'], onde('espaço'), ctx)!,
      paddingX: resolverRef(
        no.autoLayout.paddingX,
        CAMPOS['padding'],
        onde('padding horizontal'),
        ctx,
      )!,
      paddingY: resolverRef(
        no.autoLayout.paddingY,
        CAMPOS['padding'],
        onde('padding vertical'),
        ctx,
      )!,
    };
  }
  p.filhos = (no.filhos ?? []).map((f) => planejarNo(f, ctx, `${caminho} › ${f.nome}`));
  return p;
}

/** Combinações de variantes: estados × opções das variáveis enum marcadas como eixo. */
function combinacoes(
  comp: KcxComponente,
  atuais: Valores,
): { nome: string; props: Record<string, string>; valores: Valores; sufixo: string }[] {
  const estados = comp.estados.length
    ? comp.estados
    : [
        {
          id: 'padrao',
          nome: 'Padrão',
          valores: {},
          derivar: [],
        } as unknown as KcxComponente['estados'][number],
      ];
  const eixos = (comp.compatibilidade.figma.eixosVariante ?? []).map((id) => porId(comp, id));
  let combos: { props: Record<string, string>; valores: Valores; partes: string[] }[] = estados.map(
    (s) => {
      const vals: Valores = { ...atuais, ...s.valores };
      for (const d of s.derivar ?? []) {
        const alvo = porId(comp, d.variavel);
        let x = d.op === 'copiar' ? vals[d.de] : Number(vals[d.variavel]) * Number(vals[d.de]);
        if (typeof x === 'number')
          x = Math.min(alvo.max ?? Infinity, Math.max(alvo.min ?? -Infinity, x));
        vals[d.variavel] = x;
      }
      return { props: { Estado: s.nome }, valores: vals, partes: [s.id] };
    },
  );
  for (const eixo of eixos) {
    combos = combos.flatMap((c) =>
      (eixo.opcoes ?? []).map((o) => ({
        props: { ...c.props, [eixo.nome]: o.rotulo },
        valores: { ...c.valores, [eixo.id]: o.valor },
        partes: [...c.partes, o.valor],
      })),
    );
  }
  return combos.map((c) => ({
    nome: Object.entries(c.props)
      .map(([k, v]) => `${k}=${v}`)
      .join(', '),
    props: c.props,
    valores: c.valores,
    sufixo: c.partes.join('-'),
  }));
}

/** Gera o plano de importação de um pacote KCX. */
export function planejarFigma(
  pacote: KcxPacote,
  modo: KcxModoExportacao = pacote.exportacao.modo,
): PlanoFigma {
  const usarVariaveis = modo !== 'visual';
  const criarComponentes = modo !== 'variaveis';
  const vars = new Map<string, PlanoVariavel>();
  const avisos: string[] = [];
  const temModos = pacote.componentes.some((c) => c.variaveis.some((v) => v.modos));
  const modosDe = (colecao: string) =>
    temModos && colecao === COLECOES.colors ? ['Dark', 'Light'] : ['Valor'];

  const registrar = (pv: PlanoVariavel, onde: string) => {
    pv.valores = Object.fromEntries(
      modosDe(pv.colecao).map((m) => [
        m,
        pv.valores[m] ?? pv.valores['Dark'] ?? pv.valores['Valor'] ?? Object.values(pv.valores)[0],
      ]),
    );
    const existente = vars.get(pv.nome);
    if (existente) {
      if (
        JSON.stringify(existente.valores) !== JSON.stringify(pv.valores) &&
        existente.origem !== 'estado'
      ) {
        avisos.push(
          `A variável ${pv.nome} recebeu valores diferentes em camadas diferentes; foi mantido o primeiro.`,
        );
      }
      if (onde && !existente.vinculadaA.includes(onde)) existente.vinculadaA.push(onde);
      return;
    }
    vars.set(pv.nome, { ...pv, vinculadaA: onde ? [onde] : [] });
  };

  const componentes: PlanoComponente[] = [];
  for (const comp of pacote.componentes) {
    const atuais = valoresAtuais(comp.variaveis);
    const combos = combinacoes(comp, atuais);
    const base = combos[0]?.valores ?? atuais;
    const variantes: PlanoVariante[] = combos.map((c, i) => {
      const ctx: Contexto = {
        comp,
        valores: c.valores,
        base,
        sufixo: i === 0 ? '' : c.sufixo,
        usarVariaveis,
        modos: [],
        registrar,
      };
      // modos são decididos por coleção no registrar; aqui passamos Dark/Light para gerar os dois valores.
      ctx.modos = temModos ? ['Dark', 'Light', 'Valor'] : ['Valor'];
      return {
        nome: c.nome,
        propriedades: c.props,
        arvore: planejarNo(comp.estrutura, ctx, comp.estrutura.nome),
      };
    });
    // Variáveis que não foram vinculadas a nenhuma camada: documentais (com aviso explícito).
    if (usarVariaveis) {
      for (const v of comp.variaveis) {
        if (!v.exportavel) continue;
        const ehEixo = comp.compatibilidade.figma.eixosVariante?.includes(v.id);
        const usada = [...vars.values()].some(
          (pv) =>
            pv.variavelKcx === v.id && pv.nome.startsWith(`${comp.id}/`) && pv.vinculadaA.length,
        );
        if (usada || ehEixo) continue;
        if (v.tipo === 'gradient' || v.tipo === 'transform') {
          avisos.push(
            `${comp.nome}: "${v.nome}" (${v.tipo}) não tem representação vinculável no Figma; fica no código.`,
          );
          continue;
        }
        // Tempo e easing usam os tipos de movimento do Figma (TIMING em segundos, EASING em curva).
        const curvas = curvasDoEnum(v);
        const tipoDoc: FigmaTipo = v.tipo === 'time' ? 'TIMING' : curvas ? 'EASING' : tipoFigma(v);
        const emSegundos = (x: KcxValor) => (v.unidade === 'ms' ? Number(x) / 1000 : Number(x));
        const valoresDoc =
          tipoDoc === 'TIMING'
            ? { Valor: emSegundos(atuais[v.id]) }
            : tipoDoc === 'EASING'
              ? { Valor: curvas![String(atuais[v.id])] }
              : valoresPorModo(v, atuais[v.id], temModos ? ['Dark', 'Light', 'Valor'] : ['Valor']);
        registrar(
          {
            nome: nomeVar(comp.id, '', kebab(v.id)),
            colecao: COLECOES[v.grupo],
            tipo: tipoDoc,
            valores: valoresDoc,
            escopos: [],
            descricao: `[Documental — não executável no Figma] ${v.nome}: ${v.descricao} Controla no código: ${v.vinculos.map((x) => x.propriedade).join('; ')}.`,
            codigoWeb:
              v.vinculos[0].alvo.tipo === 'css-var' ? `var(${v.vinculos[0].alvo.nome})` : undefined,
            origem: 'documental',
            variavelKcx: v.id,
            vinculadaA: [],
          },
          '',
        );
      }
    }
    if (criarComponentes) {
      const f = comp.compatibilidade.figma;
      componentes.push({
        id: comp.id,
        nome: comp.nome,
        versao: comp.versao,
        pacote: pacote.id,
        nivel: f.nivel,
        descricao: comp.descricao,
        variantes,
        limitacoes: f.limitacoes,
        editavel: f.editavel,
        parcial: f.parcial,
        naoSuportado: f.naoSuportado,
        codigo: { html: comp.codigo.html, css: comp.codigo.css, js: comp.codigo.js },
        largura: comp.metadados.largura,
        altura: comp.metadados.altura,
      });
    }
  }

  // Variáveis compartilhadas de composição: a variável de cada camada vira um alias da compartilhada.
  if (usarVariaveis && pacote.composicao) {
    for (const s of pacote.composicao.compartilhadas) {
      const nome = `${pacote.composicao.id}/${kebab(s.id)}`;
      const primeiroAlvo = s.alvos[0].split('.');
      const cam = pacote.composicao.camadas.find((c) => c.prefixo === primeiroAlvo[0]);
      const comp = pacote.componentes.find((c) => c.id === cam?.componente);
      const v = comp?.variaveis.find((x) => x.id === primeiroAlvo[1]);
      if (!v) continue;
      registrar(
        {
          nome,
          colecao: COLECOES.components,
          tipo: tipoFigma(v),
          valores: { Valor: valorFigma(v, s.valor) },
          escopos: ['ALL_SCOPES'],
          descricao: `Compartilhada da composição "${pacote.composicao.nome}": controla ${s.alvos.join(', ')}.`,
          origem: 'compartilhada',
          variavelKcx: s.id,
          vinculadaA: [],
        },
        '',
      );
      for (const alvo of s.alvos) {
        const [prefixo, varId] = alvo.split('.');
        const camada = pacote.composicao.camadas.find((c) => c.prefixo === prefixo)!;
        const alvoNome = nomeVar(camada.componente, '', kebab(varId));
        const pv = vars.get(alvoNome);
        if (pv) {
          pv.valores = Object.fromEntries(Object.keys(pv.valores).map((m) => [m, { alias: nome }]));
          vars.get(nome)!.vinculadaA.push(`${alvoNome} (alias)`);
        }
      }
    }
  }

  const colecoes: PlanoColecao[] = [];
  for (const pv of vars.values()) {
    let c = colecoes.find((x) => x.nome === pv.colecao);
    if (!c) colecoes.push((c = { nome: pv.colecao, modos: modosDe(pv.colecao), variaveis: [] }));
    c.variaveis.push(pv);
  }
  const ordem = Object.values(COLECOES);
  colecoes.sort((a, b) => ordem.indexOf(a.nome) - ordem.indexOf(b.nome));

  const todas = [...vars.values()];
  const contar = (n: PlanoNo): number => 1 + n.filhos.reduce((s, f) => s + contar(f), 0);
  return {
    modo,
    pacote: { id: pacote.id, versao: pacote.versao, nome: pacote.nome },
    colecoes,
    componentes,
    composicao:
      pacote.composicao && criarComponentes
        ? {
            nome: pacote.composicao.nome,
            camadas: pacote.composicao.camadas.map((c) => ({
              componente: c.componente,
              papel: c.papel,
            })),
          }
        : undefined,
    documentacao: modo === 'completo' || modo === 'pacote',
    avisos,
    resumo: {
      variaveis: todas.length,
      vinculadas: todas.filter((v) => v.vinculadaA.length > 0).length,
      documentais: todas.filter((v) => v.origem === 'documental').length,
      componentes: componentes.length,
      variantes: componentes.reduce((s, c) => s + c.variantes.length, 0),
      camadas: componentes.reduce(
        (s, c) => s + c.variantes.reduce((t, v) => t + contar(v.arvore), 0),
        0,
      ),
    },
  };
}
