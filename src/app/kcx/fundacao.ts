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
}

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
  };
}

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
        `Token de cor "${NOMES_COR[t]}" da fundação ${f.nome}.`,
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
  return out;
}

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
function candidatos(pv: PlanoVariavel, tokens: PlanoVariavel[]): PlanoVariavel[] {
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
  return `/* Fundação ${f.nome} — gerada pelo KCX Studio (formato ${FORMATO_FUNDACAO} ${f.versao}) */
:root {
${linhas('escuro')}
${medidas}
}
[data-tema='claro'] {
${linhas('claro')}
}
${celular ? `@media (max-width: 640px) {\n  :root {\n${celular}\n  }\n}\n` : ''}${classes}
`;
}
