/**
 * Fundação do design system (tokens): cores com versão clara e escura,
 * fontes, escala tipográfica, raios, espaçamentos e sombras.
 *
 * Definida uma vez no KCX Studio e levada junto no pacote. No Figma vira:
 * - variáveis "Fundação/…" dentro das coleções KCX de sempre (cores com os
 *   modos Dark/Light; medidas com Desktop/Celular), e
 * - estilos de texto e de efeito "Fundação/…".
 * As variáveis dos componentes com o mesmo valor de um token viram *alias*
 * dele: mudar a fundação no Figma muda todos os componentes.
 *
 * TypeScript puro (roda no lab, nos testes e no plugin do Figma).
 */
import type { FigmaCor, FigmaValor, PlanoFigma, PlanoNo, PlanoVariavel } from './figma-plano';
import { KcxLogo, validarLogo } from './logo';
import { escalaTonal } from './cores';
import { corFigma } from './unidades';

export const FORMATO_FUNDACAO = 'kcx-fundacao';
export const VERSAO_FUNDACAO = '1.0.0';

export const TOKENS_COR = [
  'primaria',
  'secundaria',
  'destaque',
  'fundo',
  'superficie',
  'borda',
  'texto',
  'texto-suave',
  'sobre-primaria',
  'perigo',
  'sucesso',
  'aviso',
] as const;
export type TokenCor = (typeof TOKENS_COR)[number];

export const NOMES_COR: Record<TokenCor, string> = {
  primaria: 'Primária',
  secundaria: 'Secundária',
  destaque: 'Destaque',
  fundo: 'Fundo',
  superficie: 'Superfície',
  borda: 'Borda',
  texto: 'Texto',
  'texto-suave': 'Texto suave',
  'sobre-primaria': 'Texto sobre a primária',
  perigo: 'Perigo',
  sucesso: 'Sucesso',
  aviso: 'Aviso',
};

export const NIVEIS_TEXTO = ['display', 'h1', 'h2', 'h3', 'corpo', 'pequeno', 'legenda'] as const;
export type NivelTexto = (typeof NIVEIS_TEXTO)[number];

export const NOMES_TEXTO: Record<NivelTexto, string> = {
  display: 'Display',
  h1: 'H1',
  h2: 'H2',
  h3: 'H3',
  corpo: 'Corpo',
  pequeno: 'Pequeno',
  legenda: 'Legenda',
};

export interface EstiloTextoFundacao {
  familia: 'titulo' | 'corpo' | 'mono';
  /** 400, 500, 600, 700, 800. */
  peso: number;
  /** px no desktop. */
  tamanho: number;
  /** px no celular. */
  tamanhoCelular: number;
  /** Altura da linha (multiplicador, ex.: 1.5). */
  altura: number;
  /** Espaçamento entre letras em px. */
  espacamento: number;
}

export interface SombraFundacao {
  x: number;
  y: number;
  raio: number;
  espalhar: number;
  /** 0–1. */
  opacidade: number;
}

export const CHAVES_RAIO = ['p', 'm', 'g', 'pill'] as const;
export type ChaveRaio = (typeof CHAVES_RAIO)[number];
export const CHAVES_ESPACO = ['1', '2', '3', '4', '6', '8', '12', '16'] as const;
export type ChaveEspaco = (typeof CHAVES_ESPACO)[number];
export const CHAVES_SOMBRA = ['p', 'm', 'g'] as const;
export type ChaveSombra = (typeof CHAVES_SOMBRA)[number];

export interface KcxFundacao {
  formato: typeof FORMATO_FUNDACAO;
  versao: string;
  nome: string;
  cores: Record<TokenCor, { escuro: string; claro: string }>;
  fontes: { titulo: string; corpo: string; mono: string };
  texto: Record<NivelTexto, EstiloTextoFundacao>;
  raios: Record<ChaveRaio, number>;
  /** Escala de 4 px: espaco/4 = 16 px. */
  espacos: Record<ChaveEspaco, number>;
  sombras: Record<ChaveSombra, SombraFundacao>;
  /** Logo da marca (opcional): entra na navbar, no rodapé e no montador. */
  logo?: KcxLogo;
  /** Função de cada cor (onde e para que usar). Ausente = texto padrão do KCX. */
  funcoes?: Partial<Record<TokenCor, string>>;
  /** Uso de cada nível de texto. Ausente = texto padrão do KCX. */
  usoTexto?: Partial<Record<NivelTexto, string>>;
  /** Movimento: durações (ms) e curva padrão. */
  movimento?: MovimentoFundacao;
  /** Layout: largura do conteúdo, grid e pontos de quebra (px). */
  layout?: LayoutFundacao;
}

export interface MovimentoFundacao {
  rapido: number;
  normal: number;
  lento: number;
  /** cubic-bezier(x1, y1, x2, y2) */
  easing: string;
}

export interface LayoutFundacao {
  /** Largura máxima do conteúdo. */
  container: number;
  colunas: number;
  /** Espaço entre colunas. */
  gutter: number;
  /** Margem lateral no celular. */
  margem: number;
  /** A partir de quantos px vale tablet e desktop. */
  tablet: number;
  desktop: number;
}

export const MOVIMENTO_PADRAO: MovimentoFundacao = {
  rapido: 150,
  normal: 300,
  lento: 500,
  easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
};

export const LAYOUT_PADRAO: LayoutFundacao = {
  container: 1200,
  colunas: 12,
  gutter: 24,
  margem: 16,
  tablet: 768,
  desktop: 1024,
};

/** Grupos de cor por função. */
export const GRUPOS_COR: { id: string; nome: string; descricao: string; tokens: TokenCor[] }[] = [
  {
    id: 'marca',
    nome: 'Marca',
    descricao: 'As cores que identificam a marca e chamam para a ação.',
    tokens: ['primaria', 'secundaria', 'destaque'],
  },
  {
    id: 'superficies',
    nome: 'Superfícies',
    descricao: 'Fundos e divisões: dão estrutura sem disputar atenção.',
    tokens: ['fundo', 'superficie', 'borda'],
  },
  {
    id: 'texto',
    nome: 'Texto',
    descricao: 'Leitura: contraste alto para o principal, menor para o apoio.',
    tokens: ['texto', 'texto-suave', 'sobre-primaria'],
  },
  {
    id: 'feedback',
    nome: 'Feedback',
    descricao: 'Estados do sistema: erro, sucesso e atenção.',
    tokens: ['perigo', 'sucesso', 'aviso'],
  },
];

/** Função padrão de cada cor (a pessoa pode reescrever na Fundação). */
export const FUNCOES_COR: Record<TokenCor, string> = {
  primaria:
    'Ação principal: botões de destaque, links, item ativo, foco. Use com moderação para não perder a força.',
  secundaria:
    'Ações e elementos de apoio: botões secundários, selos, gráficos. Complementa a primária.',
  destaque: 'Detalhes que precisam saltar aos olhos: novidades, badges, realces pontuais.',
  fundo: 'Fundo da página. Base de todas as outras cores.',
  superficie: 'Cards, painéis, menus e janelas: tudo que fica “por cima” do fundo.',
  borda: 'Divisórias, contornos de campos e cards.',
  texto: 'Títulos e texto corrido. Precisa de contraste alto com o fundo e a superfície.',
  'texto-suave': 'Textos de apoio: legendas, descrições, placeholders, datas.',
  'sobre-primaria': 'Texto e ícones em cima da cor primária (ex.: rótulo do botão principal).',
  perigo: 'Erros, ações destrutivas (excluir) e alertas críticos.',
  sucesso: 'Confirmações, concluído, valores positivos.',
  aviso: 'Atenção sem ser erro: pendências, limites próximos.',
};

/** Uso padrão de cada nível de texto. */
export const USO_TEXTO: Record<NivelTexto, string> = {
  display: 'Chamada principal de páginas e heróis. Uma por tela.',
  h1: 'Título da página.',
  h2: 'Títulos de seção.',
  h3: 'Títulos de cards e blocos menores.',
  corpo: 'Texto corrido, parágrafos e a maior parte da interface.',
  pequeno: 'Rótulos de botões, campos e textos secundários.',
  legenda: 'Notas, datas, créditos e informações de apoio.',
};

/** Fundação padrão: identidade Kalixto. */
export const FUNDACAO_PADRAO: KcxFundacao = {
  formato: FORMATO_FUNDACAO,
  versao: VERSAO_FUNDACAO,
  nome: 'Kalixto',
  cores: {
    primaria: { escuro: '#d4119f', claro: '#b00d84' },
    secundaria: { escuro: '#7c3aed', claro: '#6d28d9' },
    destaque: { escuro: '#22e3ff', claro: '#0891b2' },
    fundo: { escuro: '#0b0a14', claro: '#ffffff' },
    superficie: { escuro: '#1a1530', claro: '#f3f1fb' },
    borda: { escuro: '#2e2850', claro: '#dcd8ec' },
    texto: { escuro: '#f4f2ff', claro: '#1a1530' },
    'texto-suave': { escuro: '#a9a3c9', claro: '#5b5675' },
    'sobre-primaria': { escuro: '#ffffff', claro: '#ffffff' },
    perigo: { escuro: '#ff5c7a', claro: '#dc2626' },
    sucesso: { escuro: '#3ddc97', claro: '#15803d' },
    aviso: { escuro: '#ffb547', claro: '#b45309' },
  },
  fontes: { titulo: 'Space Grotesk', corpo: 'Inter', mono: 'JetBrains Mono' },
  texto: {
    display: {
      familia: 'titulo',
      peso: 700,
      tamanho: 56,
      tamanhoCelular: 40,
      altura: 1.1,
      espacamento: -1,
    },
    h1: {
      familia: 'titulo',
      peso: 700,
      tamanho: 40,
      tamanhoCelular: 32,
      altura: 1.15,
      espacamento: -0.5,
    },
    h2: {
      familia: 'titulo',
      peso: 700,
      tamanho: 32,
      tamanhoCelular: 26,
      altura: 1.2,
      espacamento: 0,
    },
    h3: {
      familia: 'titulo',
      peso: 600,
      tamanho: 24,
      tamanhoCelular: 20,
      altura: 1.3,
      espacamento: 0,
    },
    corpo: {
      familia: 'corpo',
      peso: 400,
      tamanho: 16,
      tamanhoCelular: 15,
      altura: 1.5,
      espacamento: 0,
    },
    pequeno: {
      familia: 'corpo',
      peso: 400,
      tamanho: 14,
      tamanhoCelular: 13,
      altura: 1.45,
      espacamento: 0,
    },
    legenda: {
      familia: 'corpo',
      peso: 500,
      tamanho: 12,
      tamanhoCelular: 12,
      altura: 1.4,
      espacamento: 0.4,
    },
  },
  raios: { p: 6, m: 12, g: 20, pill: 999 },
  espacos: { '1': 4, '2': 8, '3': 12, '4': 16, '6': 24, '8': 32, '12': 48, '16': 64 },
  sombras: {
    p: { x: 0, y: 2, raio: 6, espalhar: 0, opacidade: 0.18 },
    m: { x: 0, y: 8, raio: 24, espalhar: -4, opacidade: 0.24 },
    g: { x: 0, y: 20, raio: 48, espalhar: -8, opacidade: 0.32 },
  },
};

/* ============================== Validação ============================== */

const HEX = /^#[0-9a-f]{6}([0-9a-f]{2})?$/i;

/** Erros de uma fundação (vazio = válida). */
export function validarFundacao(f: unknown): string[] {
  const erros: string[] = [];
  const o = f as Partial<KcxFundacao> | null;
  if (!o || typeof o !== 'object') return ['A fundação não é um objeto.'];
  if (o.formato !== FORMATO_FUNDACAO) erros.push(`formato deve ser "${FORMATO_FUNDACAO}".`);
  if (typeof o.nome !== 'string' || !o.nome.trim()) erros.push('nome obrigatório.');
  if (o.logo !== undefined) erros.push(...validarLogo(o.logo));
  if (o.movimento !== undefined) {
    const m = o.movimento;
    for (const k of ['rapido', 'normal', 'lento'] as const)
      if (!(Number(m?.[k]) >= 0 && Number(m?.[k]) <= 5000))
        erros.push(`movimento.${k} precisa ser de 0 a 5000 ms.`);
    if (
      !/^cubic-bezier\(\s*[-\d.]+\s*,\s*[-\d.]+\s*,\s*[-\d.]+\s*,\s*[-\d.]+\s*\)$/.test(
        m?.easing ?? '',
      )
    )
      erros.push('movimento.easing precisa ser cubic-bezier(x1, y1, x2, y2).');
  }
  if (o.layout !== undefined) {
    const l = o.layout;
    for (const k of ['container', 'colunas', 'gutter', 'margem', 'tablet', 'desktop'] as const)
      if (!(Number(l?.[k]) >= 0 && Number(l?.[k]) <= 4000)) erros.push(`layout.${k} inválido.`);
    if (!(Number(l?.colunas) >= 1 && Number(l?.colunas) <= 24))
      erros.push('layout.colunas vai de 1 a 24.');
  }
  for (const t of TOKENS_COR) {
    const c = o.cores?.[t];
    if (!c || !HEX.test(c.escuro ?? '') || !HEX.test(c.claro ?? ''))
      erros.push(`cores.${t}: precisa de "escuro" e "claro" em hex (#rrggbb).`);
  }
  for (const k of ['titulo', 'corpo', 'mono'] as const)
    if (typeof o.fontes?.[k] !== 'string' || !o.fontes[k].trim())
      erros.push(`fontes.${k} obrigatória.`);
  for (const n of NIVEIS_TEXTO) {
    const e = o.texto?.[n];
    if (!e || !(e.tamanho > 0) || !(e.tamanhoCelular > 0) || !(e.altura > 0) || !(e.peso >= 100))
      erros.push(`texto.${n}: tamanho, tamanhoCelular, altura e peso positivos.`);
  }
  for (const k of CHAVES_RAIO)
    if (!(Number(o.raios?.[k]) >= 0)) erros.push(`raios.${k} precisa ser um número ≥ 0.`);
  for (const k of CHAVES_ESPACO)
    if (!(Number(o.espacos?.[k]) >= 0)) erros.push(`espacos.${k} precisa ser um número ≥ 0.`);
  for (const k of CHAVES_SOMBRA) {
    const s = o.sombras?.[k];
    if (!s || [s.x, s.y, s.raio, s.espalhar, s.opacidade].some((x) => typeof x !== 'number'))
      erros.push(`sombras.${k}: x, y, raio, espalhar e opacidade numéricos.`);
  }
  return erros;
}

/** Completa uma fundação parcial com o padrão (para arquivos antigos ou editados à mão). */
export function completarFundacao(f: Partial<KcxFundacao>): KcxFundacao {
  const p = FUNDACAO_PADRAO;
  return {
    formato: FORMATO_FUNDACAO,
    versao: f.versao ?? p.versao,
    nome: f.nome?.trim() || p.nome,
    cores: { ...p.cores, ...f.cores },
    fontes: { ...p.fontes, ...f.fontes },
    texto: Object.fromEntries(
      NIVEIS_TEXTO.map((n) => [n, { ...p.texto[n], ...f.texto?.[n] }]),
    ) as KcxFundacao['texto'],
    raios: { ...p.raios, ...f.raios },
    espacos: { ...p.espacos, ...f.espacos },
    sombras: Object.fromEntries(
      CHAVES_SOMBRA.map((k) => [k, { ...p.sombras[k], ...f.sombras?.[k] }]),
    ) as KcxFundacao['sombras'],
    ...(f.logo && !validarLogo(f.logo).length ? { logo: f.logo } : {}),
    ...(f.funcoes ? { funcoes: textosValidos(f.funcoes, TOKENS_COR) } : {}),
    ...(f.usoTexto ? { usoTexto: textosValidos(f.usoTexto, NIVEIS_TEXTO) } : {}),
    movimento: { ...MOVIMENTO_PADRAO, ...f.movimento },
    layout: { ...LAYOUT_PADRAO, ...f.layout },
  };
}

function textosValidos<K extends string>(o: Partial<Record<K, string>>, chaves: readonly K[]) {
  const r: Partial<Record<K, string>> = {};
  for (const k of chaves) {
    const t = o?.[k];
    if (typeof t === 'string' && t.trim()) r[k] = t.trim().slice(0, 300);
  }
  return r;
}

/** Função da cor (a escrita pela pessoa ou a padrão). */
export const funcaoDaCor = (f: KcxFundacao, t: TokenCor) => f.funcoes?.[t] || FUNCOES_COR[t];
/** Uso do nível de texto (o escrito pela pessoa ou o padrão). */
export const usoDoTexto = (f: KcxFundacao, n: NivelTexto) => f.usoTexto?.[n] || USO_TEXTO[n];

/* ============================== Nomes ============================== */

export const PREFIXO_FUNDACAO = 'Fundação';
export const nomeTokenCor = (t: TokenCor) => `${PREFIXO_FUNDACAO}/cor/${t}`;
export const nomeTokenRaio = (k: ChaveRaio) => `${PREFIXO_FUNDACAO}/raio/${k}`;
export const nomeTokenEspaco = (k: ChaveEspaco) => `${PREFIXO_FUNDACAO}/espaco/${k}`;
export const nomeTokenTamanho = (n: NivelTexto) => `${PREFIXO_FUNDACAO}/texto/${n}/tamanho`;
export const nomeTokenFonte = (k: 'titulo' | 'corpo' | 'mono') => `${PREFIXO_FUNDACAO}/fonte/${k}`;
export const nomeEstiloTexto = (n: NivelTexto) => `${PREFIXO_FUNDACAO}/${NOMES_TEXTO[n]}`;
export const nomeEstiloSombra = (k: ChaveSombra) => `${PREFIXO_FUNDACAO}/Sombra ${k.toUpperCase()}`;
const cssVar = (s: string) => `--kx-${s.replace(/\//g, '-')}`;

/** Peso → estilo de fonte do Figma. */
export function estiloDoPeso(peso: number): string {
  if (peso >= 800) return 'Extra Bold';
  if (peso >= 700) return 'Bold';
  if (peso >= 600) return 'Semi Bold';
  if (peso >= 500) return 'Medium';
  return 'Regular';
}

/* ============================== Plano do Figma ============================== */

export const COLECAO_CORES = 'KCX · Colors';
export const COLECAO_ESPACO = 'KCX · Spacing';
export const COLECAO_DIMENSOES = 'KCX · Dimensions';
export const COLECAO_TIPOGRAFIA = 'KCX · Typography';

export interface PlanoEstiloTexto {
  nome: string;
  nivel: NivelTexto;
  familia: string;
  estilo: string;
  tamanho: number;
  /** Altura da linha em px. */
  alturaLinha: number;
  espacamento: number;
  /** Variável de tamanho a vincular (modos Desktop/Celular). */
  variavelTamanho: string;
  descricao: string;
}

export interface PlanoEstiloSombra {
  nome: string;
  sombra: { x: number; y: number; raio: number; espalhar: number; cor: FigmaCor };
  descricao: string;
}

export interface PlanoFundacao {
  nome: string;
  versao: string;
  estilosTexto: PlanoEstiloTexto[];
  estilosSombra: PlanoEstiloSombra[];
}

/** Variáveis da fundação (entram nas coleções KCX de sempre, no grupo "Fundação"). */
export function variaveisDaFundacao(f: KcxFundacao): PlanoVariavel[] {
  const out: PlanoVariavel[] = [];
  const base = (
    nome: string,
    colecao: string,
    tipo: PlanoVariavel['tipo'],
    valores: Record<string, FigmaValor>,
    escopos: string[],
    descricao: string,
  ): PlanoVariavel => ({
    nome,
    colecao,
    tipo,
    valores,
    escopos,
    descricao,
    codigoWeb: `var(${cssVar(nome.slice(PREFIXO_FUNDACAO.length + 1))})`,
    origem: 'fundacao',
    variavelKcx: nome,
    vinculadaA: [],
  });
  for (const t of TOKENS_COR)
    out.push(
      base(
        nomeTokenCor(t),
        COLECAO_CORES,
        'COLOR',
        { Dark: corFigma(f.cores[t].escuro), Light: corFigma(f.cores[t].claro) },
        t.startsWith('texto') || t === 'sobre-primaria'
          ? ['TEXT_FILL', 'STROKE_COLOR']
          : ['ALL_FILLS', 'STROKE_COLOR', 'EFFECT_COLOR'],
        `${NOMES_COR[t]}: ${funcaoDaCor(f, t)}`,
      ),
    );
  for (const k of CHAVES_RAIO)
    out.push(
      base(
        nomeTokenRaio(k),
        COLECAO_DIMENSOES,
        'FLOAT',
        { Desktop: f.raios[k], Celular: f.raios[k] },
        ['CORNER_RADIUS'],
        `Raio ${k.toUpperCase()} da fundação.`,
      ),
    );
  for (const k of CHAVES_ESPACO)
    out.push(
      base(
        nomeTokenEspaco(k),
        COLECAO_ESPACO,
        'FLOAT',
        { Desktop: f.espacos[k], Celular: f.espacos[k] },
        ['GAP', 'WIDTH_HEIGHT'],
        `Espaço ${k} (${f.espacos[k]} px) da fundação.`,
      ),
    );
  for (const n of NIVEIS_TEXTO)
    out.push(
      base(
        nomeTokenTamanho(n),
        COLECAO_TIPOGRAFIA,
        'FLOAT',
        { Desktop: f.texto[n].tamanho, Celular: f.texto[n].tamanhoCelular },
        ['FONT_SIZE'],
        `Tamanho do texto ${NOMES_TEXTO[n]} (desktop e celular).`,
      ),
    );
  for (const k of ['titulo', 'corpo', 'mono'] as const)
    out.push(
      base(
        nomeTokenFonte(k),
        COLECAO_TIPOGRAFIA,
        'STRING',
        { Desktop: f.fontes[k], Celular: f.fontes[k] },
        ['FONT_FAMILY'],
        `Família da fonte de ${k === 'titulo' ? 'títulos' : k === 'corpo' ? 'texto corrido' : 'código'}.`,
      ),
    );
  // Escalas tonais das cores de marca (50–900), nos dois temas.
  for (const t of TOKENS_ESCALA) {
    const e = escalaTonal(f.cores[t].escuro);
    const c = escalaTonal(f.cores[t].claro);
    e.forEach(({ passo }, i) =>
      out.push(
        base(
          `${PREFIXO_FUNDACAO}/escala/${t}/${passo}`,
          COLECAO_CORES,
          'COLOR',
          { Dark: corFigma(e[i].cor), Light: corFigma(c[i].cor) },
          ['ALL_FILLS', 'STROKE_COLOR', 'TEXT_FILL', 'EFFECT_COLOR'],
          `Escala de ${NOMES_COR[t]}: ${passo} (${passo < 500 ? 'mais clara' : passo > 500 ? 'mais escura' : 'a própria cor'}).`,
        ),
      ),
    );
  }
  const mov = f.movimento ?? MOVIMENTO_PADRAO;
  for (const k of ['rapido', 'normal', 'lento'] as const)
    out.push(
      base(
        `${PREFIXO_FUNDACAO}/movimento/${k}`,
        COLECAO_DIMENSOES,
        'FLOAT',
        { Desktop: mov[k], Celular: mov[k] },
        [],
        `[Documental] Duração ${k} das animações: ${mov[k]} ms (${mov.easing}).`,
      ),
    );
  const lay = f.layout ?? LAYOUT_PADRAO;
  for (const k of ['container', 'colunas', 'gutter', 'margem'] as const)
    out.push(
      base(
        `${PREFIXO_FUNDACAO}/layout/${k}`,
        COLECAO_DIMENSOES,
        'FLOAT',
        { Desktop: lay[k], Celular: k === 'colunas' ? 4 : k === 'gutter' ? lay.margem : lay[k] },
        k === 'gutter' || k === 'margem' ? ['GAP'] : k === 'container' ? ['WIDTH_HEIGHT'] : [],
        `Layout: ${k} (${k === 'colunas' ? 'colunas do grid' : 'px'}).`,
      ),
    );
  return out;
}

/** Cores que ganham escala tonal (50–900). */
export const TOKENS_ESCALA: TokenCor[] = [
  'primaria',
  'secundaria',
  'destaque',
  'perigo',
  'sucesso',
  'aviso',
];

/** Estilos de texto e de sombra da fundação. */
export function planoDaFundacao(f: KcxFundacao): PlanoFundacao {
  return {
    nome: f.nome,
    versao: f.versao,
    estilosTexto: NIVEIS_TEXTO.map((n) => {
      const e = f.texto[n];
      return {
        nome: nomeEstiloTexto(n),
        nivel: n,
        familia: f.fontes[e.familia],
        estilo: estiloDoPeso(e.peso),
        tamanho: e.tamanho,
        alturaLinha: Math.round(e.tamanho * e.altura),
        espacamento: e.espacamento,
        variavelTamanho: nomeTokenTamanho(n),
        descricao: `${NOMES_TEXTO[n]}: ${f.fontes[e.familia]} ${e.peso}, ${e.tamanho}/${Math.round(e.tamanho * e.altura)} px (celular ${e.tamanhoCelular} px).`,
      };
    }),
    estilosSombra: CHAVES_SOMBRA.map((k) => {
      const s = f.sombras[k];
      return {
        nome: nomeEstiloSombra(k),
        sombra: {
          x: s.x,
          y: s.y,
          raio: s.raio,
          espalhar: s.espalhar,
          cor: { r: 0, g: 0, b: 0, a: s.opacidade },
        },
        descricao: `Sombra ${k.toUpperCase()}: ${s.x} ${s.y} ${s.raio} ${s.espalhar}, preto a ${Math.round(s.opacidade * 100)}%.`,
      };
    }),
  };
}

/* ============================== Ligação aos tokens ============================== */

const igual = (a: FigmaValor | undefined, b: FigmaValor | undefined): boolean => {
  if (a === undefined || b === undefined) return false;
  if (typeof a === 'object' && typeof b === 'object' && 'r' in a && 'r' in b) {
    const p = (x: number) => Math.round(x * 255);
    return (
      p(a.r) === p(b.r) &&
      p(a.g) === p(b.g) &&
      p(a.b) === p(b.b) &&
      Math.round((a.a ?? 1) * 100) === Math.round((b.a ?? 1) * 100)
    );
  }
  return a === b;
};

/** Categoria de um token pela coleção e pelos escopos de uma variável de componente. */
function candidatos(pv: PlanoVariavel, todos: PlanoVariavel[]): PlanoVariavel[] {
  // Escalas, layout e movimento são referência: os componentes ligam nos tokens base.
  const tokens = todos.filter((t) => !/\/(escala|layout|movimento)\//.test(t.nome));
  if (pv.tipo === 'COLOR') return tokens.filter((t) => t.tipo === 'COLOR');
  if (pv.tipo !== 'FLOAT') return [];
  if (pv.escopos.includes('CORNER_RADIUS'))
    return tokens.filter((t) => t.escopos.includes('CORNER_RADIUS'));
  if (pv.escopos.includes('FONT_SIZE'))
    return tokens.filter((t) => t.escopos.includes('FONT_SIZE'));
  if (pv.escopos.includes('GAP')) return tokens.filter((t) => t.escopos.includes('GAP'));
  return [];
}

/**
 * Liga as variáveis dos componentes aos tokens: quem tem exatamente o valor de
 * um token (no primeiro modo, e no segundo quando ele é diferente do primeiro)
 * vira alias dele. Também marca os textos que batem com um estilo de texto.
 * Devolve quantas variáveis foram ligadas.
 */
export function ligarAFundacao(plano: PlanoFigma, f: KcxFundacao): number {
  const tokens = plano.colecoes.flatMap((c) => c.variaveis).filter((v) => v.origem === 'fundacao');
  let ligadas = 0;
  for (const c of plano.colecoes)
    for (const pv of c.variaveis) {
      if (pv.origem === 'fundacao' || pv.origem === 'documental') continue;
      const modos = Object.keys(pv.valores);
      if (
        modos.some(
          (m) =>
            typeof pv.valores[m] === 'object' &&
            pv.valores[m] !== null &&
            'alias' in (pv.valores[m] as object),
        )
      )
        continue;
      const [m0, m1] = modos;
      const proprio = m1 !== undefined && !igual(pv.valores[m0], pv.valores[m1]);
      const alvo = candidatos(pv, tokens).find(
        (t) =>
          igual(pv.valores[m0], t.valores[m0]) &&
          (!proprio || igual(pv.valores[m1], t.valores[m1])),
      );
      if (!alvo) continue;
      pv.valores = Object.fromEntries(modos.map((m) => [m, { alias: alvo.nome }]));
      pv.descricao = `${pv.descricao} → usa o token ${alvo.nome}.`;
      if (!alvo.vinculadaA.includes(pv.nome)) alvo.vinculadaA.push(`${pv.nome} (alias)`);
      ligadas++;
    }

  // Textos com o mesmo tamanho, família e peso de um nível da escala recebem o estilo de texto.
  const estilos = NIVEIS_TEXTO.map((n) => ({
    n,
    familia: f.fontes[f.texto[n].familia],
    estilo: estiloDoPeso(f.texto[n].peso),
    tamanho: f.texto[n].tamanho,
  }));
  const marcar = (no: PlanoNo) => {
    const t = no.texto;
    if (t) {
      const e = estilos.find(
        (x) =>
          x.tamanho === Number(t.tamanho.valor) && x.familia === t.familia && x.estilo === t.estilo,
      );
      if (e) t.estiloTexto = nomeEstiloTexto(e.n);
    }
    no.filhos.forEach(marcar);
  };
  for (const comp of plano.componentes) for (const v of comp.variantes) marcar(v.arvore);
  return ligadas;
}

/* ============================== Construtor ============================== */

/**
 * Cores, raio e tema oposto do construtor a partir da fundação: os componentes
 * nascem com os valores dos tokens e por isso viram alias deles no Figma.
 * `tema` escolhe qual versão (escura ou clara) é a principal.
 */
export function construtorDaFundacao(
  f: KcxFundacao,
  tema: 'escuro' | 'claro' = 'escuro',
): {
  cores: { primaria: string; fundo: string; superficie: string; texto: string; textoBotao: string };
  temaOposto: { fundo: string; superficie: string; texto: string; suave: string };
  corSuave: string;
  raio: number;
} {
  const outro = tema === 'escuro' ? 'claro' : 'escuro';
  return {
    cores: {
      primaria: f.cores.primaria[tema],
      fundo: f.cores.fundo[tema],
      superficie: f.cores.superficie[tema],
      texto: f.cores.texto[tema],
      textoBotao: f.cores['sobre-primaria'][tema],
    },
    temaOposto: {
      fundo: f.cores.fundo[outro],
      superficie: f.cores.superficie[outro],
      texto: f.cores.texto[outro],
      suave: f.cores['texto-suave'][outro],
    },
    corSuave: f.cores['texto-suave'][tema],
    raio: f.raios.m,
  };
}

/* ============================== Código ============================== */

/** CSS da fundação: tema escuro em :root e o claro em [data-tema="claro"]. */
export function cssDaFundacao(f: KcxFundacao): string {
  const linhas = (modo: 'escuro' | 'claro') =>
    TOKENS_COR.map((t) => `  ${cssVar(`cor/${t}`)}: ${f.cores[t][modo]};`).join('\n');
  const medidas = [
    ...CHAVES_RAIO.map((k) => `  ${cssVar(`raio/${k}`)}: ${f.raios[k]}px;`),
    ...CHAVES_ESPACO.map((k) => `  ${cssVar(`espaco/${k}`)}: ${f.espacos[k]}px;`),
    `  --kx-fonte-titulo: '${f.fontes.titulo}', system-ui, sans-serif;`,
    `  --kx-fonte-corpo: '${f.fontes.corpo}', system-ui, sans-serif;`,
    `  --kx-fonte-mono: '${f.fontes.mono}', ui-monospace, monospace;`,
    ...NIVEIS_TEXTO.flatMap((n) => [
      `  ${cssVar(`texto/${n}/tamanho`)}: ${f.texto[n].tamanho}px;`,
      `  ${cssVar(`texto/${n}/altura`)}: ${f.texto[n].altura};`,
    ]),
    ...CHAVES_SOMBRA.map((k) => {
      const s = f.sombras[k];
      return `  ${cssVar(`sombra/${k}`)}: ${s.x}px ${s.y}px ${s.raio}px ${s.espalhar}px rgb(0 0 0 / ${s.opacidade});`;
    }),
  ].join('\n');
  const celular = NIVEIS_TEXTO.filter((n) => f.texto[n].tamanhoCelular !== f.texto[n].tamanho)
    .map((n) => `    ${cssVar(`texto/${n}/tamanho`)}: ${f.texto[n].tamanhoCelular}px;`)
    .join('\n');
  const classes = NIVEIS_TEXTO.map((n) => {
    const e = f.texto[n];
    return `.kx-texto-${n} { font-family: var(--kx-fonte-${e.familia}); font-weight: ${e.peso}; font-size: var(${cssVar(`texto/${n}/tamanho`)}); line-height: var(${cssVar(`texto/${n}/altura`)}); letter-spacing: ${e.espacamento}px; }`;
  }).join('\n');
  const escalas = (modo: 'escuro' | 'claro') =>
    TOKENS_ESCALA.flatMap((t) =>
      escalaTonal(f.cores[t][modo]).map((x) => `  ${cssVar(`escala/${t}/${x.passo}`)}: ${x.cor};`),
    ).join('\n');
  const mov = f.movimento ?? MOVIMENTO_PADRAO;
  const lay = f.layout ?? LAYOUT_PADRAO;
  const extras = [
    `  ${cssVar('movimento/rapido')}: ${mov.rapido}ms;`,
    `  ${cssVar('movimento/normal')}: ${mov.normal}ms;`,
    `  ${cssVar('movimento/lento')}: ${mov.lento}ms;`,
    `  ${cssVar('movimento/easing')}: ${mov.easing};`,
    `  ${cssVar('layout/container')}: ${lay.container}px;`,
    `  ${cssVar('layout/colunas')}: ${lay.colunas};`,
    `  ${cssVar('layout/gutter')}: ${lay.gutter}px;`,
    `  ${cssVar('layout/margem')}: ${lay.margem}px;`,
  ].join('\n');
  return `/* Fundação ${f.nome} — gerada pelo KCX Studio (formato ${FORMATO_FUNDACAO} ${f.versao}) */
:root {
${linhas('escuro')}
${escalas('escuro')}
${medidas}
${extras}
}
[data-tema='claro'] {
${linhas('claro')}
${escalas('claro')}
}
/* Grid: ${lay.colunas} colunas a partir de ${lay.desktop}px, 8 no tablet (${lay.tablet}px), 4 no celular */
.kx-container { width: 100%; max-width: var(${cssVar('layout/container')}); margin-inline: auto; padding-inline: var(${cssVar('layout/margem')}); }
.kx-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: var(${cssVar('layout/gutter')}); }
@media (min-width: ${lay.tablet}px) { .kx-grid { grid-template-columns: repeat(8, minmax(0, 1fr)); } }
@media (min-width: ${lay.desktop}px) { .kx-grid { grid-template-columns: repeat(var(${cssVar('layout/colunas')}), minmax(0, 1fr)); } }
${celular ? `@media (max-width: 640px) {\n  :root {\n${celular}\n  }\n}\n` : ''}${classes}
`;
}
