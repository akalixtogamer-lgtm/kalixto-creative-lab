/**
 * Briefing do projeto: o que o cliente quer, para quem e com que limites.
 *
 * TS puro (sem navegador): reconhece os campos num texto livre (vindo de um
 * .docx, .txt ou .md), valida o arquivo próprio e gera o Markdown.
 */

export const CAMPOS_BRIEFING = [
  {
    id: 'projeto',
    rotulo: 'Projeto',
    dica: 'Nome do projeto ou do produto.',
    sinonimos: ['projeto', 'nome do projeto', 'produto', 'titulo', 'nome'],
    longo: false,
  },
  {
    id: 'cliente',
    rotulo: 'Cliente',
    dica: 'Empresa ou pessoa que encomendou.',
    sinonimos: ['cliente', 'empresa', 'marca', 'contratante', 'solicitante'],
    longo: false,
  },
  {
    id: 'contato',
    rotulo: 'Contato',
    dica: 'Quem responde pelo projeto (nome, e-mail, telefone).',
    sinonimos: ['contato', 'responsavel', 'ponto focal', 'email', 'telefone'],
    longo: false,
  },
  {
    id: 'contexto',
    rotulo: 'Contexto',
    dica: 'Quem é o cliente, o momento da marca e o mercado.',
    sinonimos: [
      'contexto',
      'sobre',
      'sobre a empresa',
      'sobre o cliente',
      'sobre a marca',
      'historico',
      'apresentacao',
      'cenario',
    ],
    longo: true,
  },
  {
    id: 'problema',
    rotulo: 'Problema',
    dica: 'O que não funciona hoje e precisa ser resolvido.',
    sinonimos: ['problema', 'desafio', 'dor', 'dores', 'necessidade', 'situacao atual'],
    longo: true,
  },
  {
    id: 'objetivo',
    rotulo: 'Objetivo',
    dica: 'O resultado esperado. De preferência, mensurável.',
    sinonimos: ['objetivo', 'objetivos', 'meta', 'metas', 'proposito', 'resultado esperado'],
    longo: true,
  },
  {
    id: 'publico',
    rotulo: 'Público-alvo',
    dica: 'Quem vai usar: idade, rotina, o que busca, persona.',
    sinonimos: ['publico', 'publico alvo', 'publico-alvo', 'persona', 'personas', 'usuarios'],
    longo: true,
  },
  {
    id: 'mensagem',
    rotulo: 'Mensagem principal',
    dica: 'A única ideia que a pessoa precisa levar.',
    sinonimos: ['mensagem', 'mensagem principal', 'mensagem chave', 'proposta de valor', 'slogan'],
    longo: true,
  },
  {
    id: 'tom',
    rotulo: 'Tom e estilo',
    dica: 'Personalidade da marca e palavras que definem o visual.',
    sinonimos: [
      'tom',
      'tom de voz',
      'estilo',
      'identidade',
      'identidade visual',
      'personalidade',
      'linguagem',
    ],
    longo: true,
  },
  {
    id: 'entregas',
    rotulo: 'Entregas',
    dica: 'O que será entregue (site, app, logo, posts…).',
    sinonimos: ['entregas', 'entregaveis', 'escopo', 'o que sera entregue', 'servicos'],
    longo: true,
  },
  {
    id: 'paginas',
    rotulo: 'Páginas e telas',
    dica: 'Uma por linha. Viram as páginas das Telas e do mapa de navegação.',
    sinonimos: [
      'paginas',
      'telas',
      'secoes',
      'estrutura',
      'mapa do site',
      'sitemap',
      'arquitetura',
      'menu',
    ],
    longo: true,
  },
  {
    id: 'funcionalidades',
    rotulo: 'Funcionalidades',
    dica: 'O que a pessoa consegue fazer (login, carrinho, agenda…).',
    sinonimos: ['funcionalidades', 'funcoes', 'recursos', 'requisitos', 'features'],
    longo: true,
  },
  {
    id: 'referencias',
    rotulo: 'Referências',
    dica: 'Sites, marcas e imagens de que o cliente gosta (e por quê).',
    sinonimos: ['referencias', 'referencia', 'inspiracoes', 'inspiracao', 'benchmark'],
    longo: true,
  },
  {
    id: 'concorrentes',
    rotulo: 'Concorrentes',
    dica: 'Quem disputa o mesmo público.',
    sinonimos: ['concorrentes', 'concorrencia', 'mercado'],
    longo: true,
  },
  {
    id: 'restricoes',
    rotulo: 'Restrições',
    dica: 'O que não pode: cores, palavras, tecnologias, regras da marca.',
    sinonimos: ['restricoes', 'restricao', 'limitacoes', 'nao pode', 'evitar', 'obrigatorios'],
    longo: true,
  },
  {
    id: 'prazo',
    rotulo: 'Prazo',
    dica: 'Datas de entrega e marcos.',
    sinonimos: ['prazo', 'prazos', 'cronograma', 'datas', 'entrega', 'data de entrega'],
    longo: false,
  },
  {
    id: 'orcamento',
    rotulo: 'Orçamento',
    dica: 'Valor ou faixa disponível.',
    sinonimos: ['orcamento', 'investimento', 'verba', 'valor', 'budget'],
    longo: false,
  },
  {
    id: 'sucesso',
    rotulo: 'Como medir o sucesso',
    dica: 'Indicadores: cadastros, vendas, tempo na página…',
    sinonimos: ['sucesso', 'metricas', 'indicadores', 'kpi', 'kpis', 'como medir'],
    longo: true,
  },
  {
    id: 'observacoes',
    rotulo: 'Observações',
    dica: 'Tudo o mais (o texto que não se encaixou em outro campo vem para cá).',
    sinonimos: ['observacoes', 'obs', 'notas', 'outros', 'informacoes adicionais', 'anotacoes'],
    longo: true,
  },
] as const;

export type CampoBriefing = (typeof CAMPOS_BRIEFING)[number]['id'];
export type Briefing = Record<CampoBriefing, string>;

export const LIMITE_CAMPO = 8000;

export function briefingVazio(): Briefing {
  return Object.fromEntries(CAMPOS_BRIEFING.map((c) => [c.id, ''])) as Briefing;
}

export const normalizar = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, ' ')
    .replace(/[\s-]+/g, ' ')
    .trim();

const SINONIMOS = CAMPOS_BRIEFING.flatMap((c) =>
  c.sinonimos.map((s) => ({ id: c.id as CampoBriefing, s: normalizar(s) })),
).sort((a, b) => b.s.length - a.s.length);

/** Tira marcadores de título e de lista: "## 2. Objetivo", "**Objetivo**", "- Objetivo". */
const semMarcadores = (l: string) =>
  l
    .replace(/^\s{0,3}#{1,6}\s*/, '')
    .replace(/^\s*(?:[-*•▪◦]|\d{1,2}[.)]|[a-z][.)])\s+/i, '')
    .replace(/\*\*|__/g, '')
    .trim();

/**
 * Se a linha é um rótulo de campo, devolve o campo e o que veio depois dos
 * dois-pontos. "Objetivo: vender mais" → objetivo + "vender mais";
 * "Público-alvo" sozinho numa linha curta → publico + "".
 */
export function rotuloDaLinha(
  linha: string,
  emLista = false,
): { id: CampoBriefing; resto: string } | null {
  const l = semMarcadores(linha);
  if (!l) return null;
  const doisPontos = l.match(/^([^:：]{2,60})[:：]\s*(.*)$/);
  // Item de lista ("- Sobre") nunca é título; dentro de uma lista (ex.: Páginas),
  // só um título claro (#, negrito, dois-pontos ou MAIÚSCULAS) troca de campo.
  const marcador = /^\s*[-*•▪◦]\s+/.test(linha);
  const forte =
    !!doisPontos ||
    /^\s{0,3}#{1,6}\s/.test(linha) ||
    /^\s*\*\*.+\*\*\s*$/.test(linha) ||
    (/[A-ZÀ-Ú]{3}/.test(l) && l === l.toUpperCase());
  if ((marcador && !doisPontos) || (emLista && !forte)) return null;
  const cabeca = normalizar(doisPontos ? doisPontos[1] : l);
  if (!doisPontos && (l.length > 60 || /[.!?]$/.test(l))) return null;
  for (const { id, s } of SINONIMOS) {
    // Rótulo inteiro ("objetivo") ou começando por ele ("objetivo do projeto").
    if (cabeca === s || (cabeca.startsWith(s + ' ') && cabeca.split(' ').length <= 6))
      return { id, resto: doisPontos ? doisPontos[2].trim() : '' };
  }
  return null;
}

/** Campos que costumam ser listas, onde "Sobre" ou "Contato" são itens, não títulos. */
const CAMPOS_LISTA: CampoBriefing[] = ['paginas', 'funcionalidades', 'entregas', 'referencias'];

export interface LeituraBriefing {
  briefing: Briefing;
  /** Campos preenchidos a partir do texto. */
  reconhecidos: CampoBriefing[];
}

/** Reconhece os campos num texto livre; o que sobra vai para Observações. */
export function briefingDoTexto(texto: string): LeituraBriefing {
  const b = briefingVazio();
  const partes: Partial<Record<CampoBriefing, string[]>> = {};
  const soltas: string[] = [];
  const rotulados = new Set<CampoBriefing>();
  let atual: CampoBriefing | null = null;
  const linhas = texto.replace(/\r\n?/g, '\n').split('\n');
  for (const bruta of linhas) {
    const linha = bruta.replace(/\s+$/, '');
    const r = rotuloDaLinha(linha, !!atual && CAMPOS_LISTA.includes(atual));
    if (r) {
      atual = r.id;
      rotulados.add(atual);
      partes[atual] ??= [];
      if (r.resto) {
        partes[atual]!.push(r.resto);
        // "Prazo: 15/12" já disse tudo: o que vier depois não é do prazo.
        if (!CAMPOS_BRIEFING.find((c) => c.id === r.id)!.longo) atual = null;
      }
      continue;
    }
    if (atual) partes[atual]!.push(linha);
    else soltas.push(linha);
  }
  // Primeira linha curta antes de qualquer campo: é o título → projeto.
  const primeira = soltas.findIndex((l) => l.trim());
  if (!partes.projeto && primeira >= 0) {
    const t = semMarcadores(soltas[primeira]).replace(/^briefing\s*[-–:]?\s*/i, '');
    if (t && t.length <= 80 && !/[.!?]$/.test(t)) {
      partes.projeto = [t];
      soltas.splice(primeira, 1);
    }
  }
  if (soltas.some((l) => l.trim())) (partes.observacoes ??= []).unshift(...soltas);
  const reconhecidos: CampoBriefing[] = [];
  for (const c of CAMPOS_BRIEFING) {
    const v = limpar((partes[c.id] ?? []).join('\n'));
    if (!v) continue;
    b[c.id] = v;
    if (rotulados.has(c.id) || c.id === 'projeto') reconhecidos.push(c.id);
  }
  return { briefing: b, reconhecidos };
}

function limpar(s: string): string {
  return s
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, LIMITE_CAMPO);
}

/** Lista simples (uma por linha, ou separada por vírgula/ponto e vírgula). */
export function itensDoCampo(s: string, max = 30): string[] {
  const vistos = new Set<string>();
  return s
    .split(/\n|;|,(?![^(]*\))/)
    .map((x) => semMarcadores(x).replace(/[.:]$/, '').trim())
    .filter((x) => x && x.length <= 60)
    .filter((x) => {
      const k = normalizar(x);
      if (!k || vistos.has(k)) return false;
      vistos.add(k);
      return true;
    })
    .slice(0, max);
}

export const FORMATO_BRIEFING = 'kcx-briefing';

/** Aceita o arquivo próprio ({ formato, briefing }) ou um objeto com os campos. */
export function briefingDoJson(dado: unknown): Briefing | null {
  if (!dado || typeof dado !== 'object') return null;
  const o = dado as Record<string, unknown>;
  const fonte = (o['formato'] === FORMATO_BRIEFING ? o['briefing'] : o) as Record<string, unknown>;
  if (!fonte || typeof fonte !== 'object') return null;
  const b = briefingVazio();
  let algum = false;
  for (const c of CAMPOS_BRIEFING) {
    const v = fonte[c.id];
    if (typeof v === 'string') {
      b[c.id] = v.slice(0, LIMITE_CAMPO);
      algum ||= !!v.trim();
    }
  }
  return algum ? b : null;
}

export function arquivoDoBriefing(b: Briefing): string {
  return JSON.stringify({ formato: FORMATO_BRIEFING, versao: 1, briefing: b }, null, 2);
}

export function briefingParaMarkdown(b: Briefing): string {
  const linhas = [`# Briefing — ${b.projeto.trim() || 'Projeto sem nome'}`, ''];
  for (const c of CAMPOS_BRIEFING) {
    if (c.id === 'projeto' || !b[c.id].trim()) continue;
    linhas.push(`## ${c.rotulo}`, '', b[c.id].trim(), '');
  }
  return linhas.join('\n');
}

/** Quanto do briefing está preenchido (0–1), contando os campos essenciais. */
export const ESSENCIAIS: CampoBriefing[] = [
  'projeto',
  'objetivo',
  'publico',
  'tom',
  'entregas',
  'prazo',
];
export function progressoBriefing(b: Briefing): {
  feitos: number;
  total: number;
  faltam: string[];
} {
  const faltam = ESSENCIAIS.filter((k) => !b[k].trim()).map(
    (k) => CAMPOS_BRIEFING.find((c) => c.id === k)!.rotulo,
  );
  return { feitos: ESSENCIAIS.length - faltam.length, total: ESSENCIAIS.length, faltam };
}
