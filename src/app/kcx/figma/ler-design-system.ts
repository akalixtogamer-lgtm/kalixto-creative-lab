/**
 * Design system do Figma → Fundação KCX.
 *
 * O plugin lê as variáveis locais (cores e números) e os estilos de texto e
 * efeito do arquivo aberto; esta função reconhece os papéis pelo nome (em
 * português ou inglês: primary/primária, background/fundo, body/corpo, h1…) e
 * monta a fundação. O que não reconhece fica com o valor padrão do KCX e entra
 * no relatório, para a pessoa conferir.
 */
import {
  CHAVES_ESPACO,
  CHAVES_RAIO,
  ChaveEspaco,
  ChaveRaio,
  EstiloTextoFundacao,
  FUNDACAO_PADRAO,
  KcxFundacao,
  NIVEIS_TEXTO,
  NivelTexto,
  TokenCor,
  completarFundacao,
} from '../fundacao';

export interface VariavelDs {
  nome: string;
  /** Nome da coleção (ajuda a separar cores, espaços e raios). */
  colecao: string;
  tipo: 'COLOR' | 'FLOAT' | 'STRING' | 'BOOLEAN';
  /** Valor por nome de modo; cores em hex (#rrggbb). Aliases já resolvidos. */
  valores: Record<string, string | number>;
}

export interface EstiloTextoDs {
  nome: string;
  familia: string;
  /** Ex.: "Bold", "Semi Bold", "Regular". */
  estilo: string;
  tamanho: number;
  /** px; ausente = automático. */
  alturaLinha?: number;
  /** px. */
  espacamento?: number;
}

export interface SombraDs {
  nome: string;
  x: number;
  y: number;
  raio: number;
  espalhar: number;
  /** 0–1. */
  opacidade: number;
}

export interface DesignSystemFigma {
  arquivo: string;
  variaveis: VariavelDs[];
  estilosTexto: EstiloTextoDs[];
  sombras?: SombraDs[];
}

export interface ResultadoDs {
  fundacao: KcxFundacao;
  /** O que foi reconhecido (para mostrar à pessoa). */
  reconhecido: string[];
  /** O que ficou com o padrão do KCX. */
  padrao: string[];
}

/** Normaliza: sem acento, minúsculas, só letras e números separados por espaço. */
const norm = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

/** Palavras que identificam cada token de cor (a ordem importa: mais específico primeiro). */
const PISTAS_COR: [TokenCor, RegExp][] = [
  [
    'sobre-primaria',
    /\b(on primary|sobre primaria|primary foreground|primary contrast|on brand)\b/,
  ],
  [
    'texto-suave',
    /\b(text (secondary|muted|subtle|soft)|muted|texto (suave|secundario)|foreground muted|subtle)\b/,
  ],
  ['secundaria', /\b(secondary|secundaria)\b/],
  ['destaque', /\b(accent|destaque|highlight|tertiary)\b/],
  ['perigo', /\b(danger|error|erro|perigo|destructive|negative)\b/],
  ['sucesso', /\b(success|sucesso|positive)\b/],
  ['aviso', /\b(warning|aviso|alerta|caution)\b/],
  ['superficie', /\b(surface|superficie|card|panel|elevated)\b/],
  ['borda', /\b(border|borda|stroke|outline|divider)\b/],
  ['fundo', /\b(background|fundo|bg|canvas|page)\b/],
  ['texto', /\b(text|texto|foreground|fg|on background|on surface)\b/],
  ['primaria', /\b(primary|primaria|brand|marca|principal)\b/],
];

const ehEscuro = (m: string) => /dark|escuro|noite|night/i.test(m);
const ehClaro = (m: string) => /light|claro|dia|day/i.test(m);
const HEX = /^#[0-9a-f]{6}$/i;

function pesoDe(estilo: string): number {
  const e = estilo.toLowerCase();
  if (/black|heavy|extra ?bold|ultra ?bold/.test(e)) return 800;
  if (/semi ?bold|demi/.test(e)) return 600;
  if (/bold/.test(e)) return 700;
  if (/medium/.test(e)) return 500;
  return 400;
}

/** Nível de texto pelo nome do estilo. */
function nivelDe(nome: string): NivelTexto | null {
  const n = norm(nome);
  if (/\b(display|hero|jumbo)\b/.test(n)) return 'display';
  if (/\b(h1|heading 1|title 1|titulo 1|headline 1|title large)\b/.test(n)) return 'h1';
  if (/\b(h2|heading 2|title 2|titulo 2|headline 2|title medium)\b/.test(n)) return 'h2';
  if (/\b(h3|heading 3|title 3|titulo 3|headline 3|title small|subtitle|subtitulo)\b/.test(n))
    return 'h3';
  if (/\b(caption|legenda|overline|label small|tiny)\b/.test(n)) return 'legenda';
  if (/\b(small|pequeno|body small|label|footnote)\b/.test(n)) return 'pequeno';
  if (/\b(body|corpo|paragraph|paragrafo|text|texto|regular|base)\b/.test(n)) return 'corpo';
  return null;
}

/** Celular: o mesmo tamanho até 20 px; acima, ~80 % (como a fundação padrão). */
const celular = (px: number) => (px <= 20 ? px : Math.round(px * 0.8));

export function fundacaoDoFigma(ds: DesignSystemFigma): ResultadoDs {
  const reconhecido: string[] = [];
  const padrao: string[] = [];
  const f: KcxFundacao = JSON.parse(JSON.stringify(FUNDACAO_PADRAO));
  f.nome = ds.arquivo?.trim() || 'Design system do Figma';

  /* ---------- Cores ---------- */
  const cores = ds.variaveis.filter((v) => v.tipo === 'COLOR');
  const usado = new Set<string>();
  for (const [token, pista] of PISTAS_COR) {
    const candidatas = cores.filter((v) => !usado.has(v.nome) && pista.test(norm(v.nome)));
    // Preferir o tom "base" (500, default, base) quando há uma escala.
    const v =
      candidatas.find((c) => /\b(500|base|default|padrao|main)\b/.test(norm(c.nome))) ??
      candidatas.sort((a, b) => a.nome.length - b.nome.length)[0];
    if (!v) {
      padrao.push(`cor ${token}`);
      continue;
    }
    const modos = Object.keys(v.valores);
    const escuro = modos.find(ehEscuro);
    const claro = modos.find(ehClaro);
    const um = String(v.valores[modos[0]]);
    const e = String(escuro ? v.valores[escuro] : claro ? v.valores[claro] : um);
    const c = String(claro ? v.valores[claro] : um);
    if (!HEX.test(e) || !HEX.test(c)) {
      padrao.push(`cor ${token}`);
      continue;
    }
    usado.add(v.nome);
    f.cores[token] = { escuro: e.toLowerCase(), claro: c.toLowerCase() };
    reconhecido.push(`cor ${token} ← "${v.nome}"`);
  }

  /* ---------- Texto ---------- */
  const porNivel = new Map<NivelTexto, EstiloTextoDs>();
  for (const s of ds.estilosTexto) {
    const n = nivelDe(s.nome);
    if (n && !porNivel.has(n)) porNivel.set(n, s);
  }
  const titulo = porNivel.get('h1') ?? porNivel.get('display') ?? porNivel.get('h2');
  const corpo = porNivel.get('corpo') ?? porNivel.get('pequeno');
  if (titulo) f.fontes.titulo = titulo.familia;
  if (corpo) f.fontes.corpo = corpo.familia;
  const mono = ds.estilosTexto.find((s) => /mono|code|codigo/i.test(s.familia + ' ' + s.nome));
  if (mono) f.fontes.mono = mono.familia;
  for (const n of NIVEIS_TEXTO) {
    const s = porNivel.get(n);
    if (!s) {
      padrao.push(`texto ${n}`);
      continue;
    }
    const t: EstiloTextoFundacao = {
      familia: s.familia === f.fontes.titulo && n !== 'corpo' ? 'titulo' : 'corpo',
      peso: pesoDe(s.estilo),
      tamanho: Math.round(s.tamanho),
      tamanhoCelular: celular(Math.round(s.tamanho)),
      altura: s.alturaLinha
        ? Math.round((s.alturaLinha / s.tamanho) * 100) / 100
        : f.texto[n].altura,
      espacamento: Math.round((s.espacamento ?? 0) * 10) / 10,
    };
    f.texto[n] = t;
    reconhecido.push(`texto ${n} ← "${s.nome}" (${s.familia} ${t.tamanho}px)`);
  }

  /* ---------- Espaços e raios ---------- */
  const numeros = ds.variaveis.filter((v) => v.tipo === 'FLOAT');
  const valor = (v: VariavelDs) => Number(v.valores[Object.keys(v.valores)[0]]);
  const espacos = numeros.filter((v) =>
    /\b(spacing|space|espaco|espacamento|gap|padding|margin|size)\b/.test(
      norm(`${v.colecao} ${v.nome}`),
    ),
  );
  if (espacos.length) {
    const lista = espacos.map(valor).filter((x) => x > 0 && x <= 512);
    for (const k of CHAVES_ESPACO) {
      const alvo = Number(k) * 4;
      // O valor mais próximo de k × 4 px (até 50 % de diferença).
      const melhor = lista.reduce<number | null>(
        (m, x) => (m === null || Math.abs(x - alvo) < Math.abs(m - alvo) ? x : m),
        null,
      );
      if (melhor !== null && Math.abs(melhor - alvo) <= alvo * 0.5) {
        f.espacos[k as ChaveEspaco] = melhor;
      } else padrao.push(`espaço ${k}`);
    }
    reconhecido.push(`espaços ← ${espacos.length} variável(is)`);
  } else padrao.push('espaços');

  const raios = numeros.filter((v) =>
    /\b(radius|raio|radii|corner|rounded)\b/.test(norm(`${v.colecao} ${v.nome}`)),
  );
  if (raios.length) {
    const pista: Record<ChaveRaio, RegExp> = {
      p: /\b(sm|small|s|p|pequeno|xs)\b/,
      m: /\b(md|medium|m|medio|default|base)\b/,
      g: /\b(lg|large|l|g|grande|xl)\b/,
      pill: /\b(full|pill|round|circle|999|9999)\b/,
    };
    for (const k of CHAVES_RAIO) {
      const v = raios.find((r) => pista[k].test(norm(r.nome)));
      if (v) {
        f.raios[k] = valor(v);
        reconhecido.push(`raio ${k} ← "${v.nome}"`);
      } else padrao.push(`raio ${k}`);
    }
  } else padrao.push('raios');

  /* ---------- Sombras ---------- */
  const sombras = ds.sombras ?? [];
  if (sombras.length) {
    const ord = [...sombras].sort((a, b) => a.raio - b.raio);
    const pega = (i: number) => ord[Math.min(ord.length - 1, i)];
    (['p', 'm', 'g'] as const).forEach((k, i) => {
      const s = pega(Math.round((i * (ord.length - 1)) / 2));
      f.sombras[k] = { x: s.x, y: s.y, raio: s.raio, espalhar: s.espalhar, opacidade: s.opacidade };
    });
    reconhecido.push(`sombras ← ${sombras.length} estilo(s) de efeito`);
  } else padrao.push('sombras');

  return { fundacao: completarFundacao(f), reconhecido, padrao };
}

/* ============================== Leitura no Figma (plugin) ============================== */

type Figma = any; // eslint-disable-line @typescript-eslint/no-explicit-any

const hexDe = (c: { r: number; g: number; b: number }) =>
  '#' +
  [c.r, c.g, c.b]
    .map((x) =>
      Math.round(Math.min(1, Math.max(0, x)) * 255)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('');

/** Lê variáveis locais, estilos de texto e de sombra do arquivo aberto. */
export async function lerDesignSystem(figma: Figma): Promise<DesignSystemFigma> {
  const colecoes = (await figma.variables.getLocalVariableCollectionsAsync()) ?? [];
  const variaveis: VariavelDs[] = [];
  const resolver = async (valor: unknown, modo: string, prof = 0): Promise<unknown> => {
    const v = valor as { type?: string; id?: string };
    if (v && v.type === 'VARIABLE_ALIAS' && v.id && prof < 5) {
      const alvo = await figma.variables.getVariableByIdAsync(v.id);
      if (!alvo) return undefined;
      const val = alvo.valuesByMode[modo] ?? Object.values(alvo.valuesByMode)[0];
      return resolver(val, modo, prof + 1);
    }
    return valor;
  };
  for (const col of colecoes) {
    for (const id of col.variableIds ?? []) {
      const v = await figma.variables.getVariableByIdAsync(id);
      if (!v || (v.resolvedType !== 'COLOR' && v.resolvedType !== 'FLOAT')) continue;
      const valores: Record<string, string | number> = {};
      for (const m of col.modes ?? []) {
        const bruto = await resolver(v.valuesByMode[m.modeId], m.modeId);
        if (v.resolvedType === 'COLOR' && bruto && typeof bruto === 'object')
          valores[m.name] = hexDe(bruto as { r: number; g: number; b: number });
        else if (typeof bruto === 'number') valores[m.name] = bruto;
      }
      if (Object.keys(valores).length)
        variaveis.push({ nome: v.name, colecao: col.name, tipo: v.resolvedType, valores });
    }
  }
  const textos = (await figma.getLocalTextStylesAsync?.()) ?? [];
  const estilosTexto: EstiloTextoDs[] = textos.map((s: Figma) => ({
    nome: s.name,
    familia: s.fontName?.family ?? 'Inter',
    estilo: s.fontName?.style ?? 'Regular',
    tamanho: Number(s.fontSize) || 16,
    alturaLinha:
      s.lineHeight?.unit === 'PIXELS'
        ? s.lineHeight.value
        : s.lineHeight?.unit === 'PERCENT'
          ? (s.lineHeight.value / 100) * (Number(s.fontSize) || 16)
          : undefined,
    espacamento:
      s.letterSpacing?.unit === 'PIXELS'
        ? s.letterSpacing.value
        : s.letterSpacing?.unit === 'PERCENT'
          ? (s.letterSpacing.value / 100) * (Number(s.fontSize) || 16)
          : 0,
  }));
  const efeitos = (await figma.getLocalEffectStylesAsync?.()) ?? [];
  const sombras: SombraDs[] = [];
  for (const e of efeitos) {
    const s = (e.effects ?? []).find((x: Figma) => x.type === 'DROP_SHADOW');
    if (s)
      sombras.push({
        nome: e.name,
        x: s.offset?.x ?? 0,
        y: s.offset?.y ?? 0,
        raio: s.radius ?? 0,
        espalhar: s.spread ?? 0,
        opacidade: Math.round((s.color?.a ?? 0.25) * 100) / 100,
      });
  }
  return { arquivo: figma.root?.name ?? 'Figma', variaveis, estilosTexto, sombras };
}
