/**
 * Mensagens e Feedback dos botões (KCX Studio).
 *
 * A AÇÃO do botão (a operação) fica separada da MENSAGEM exibida: a mensagem
 * só é escolhida depois que a operação termina, pelo resultado real dela.
 * Operação que falha nunca mostra sucesso.
 */

export const TIPOS_FEEDBACK = ['success', 'error', 'warning', 'info', 'loading'] as const;
export type TipoFeedback = (typeof TIPOS_FEEDBACK)[number];

export const ROTULO_TIPO: Record<TipoFeedback, string> = {
  success: 'Sucesso',
  error: 'Erro',
  warning: 'Aviso',
  info: 'Informação',
  loading: 'Carregando',
};

export const POSICOES_FEEDBACK = [
  'topo-esquerda',
  'topo-centro',
  'topo-direita',
  'base-esquerda',
  'base-centro',
  'base-direita',
] as const;
export type PosicaoFeedback = (typeof POSICOES_FEEDBACK)[number];

export const ROTULO_POSICAO: Record<PosicaoFeedback, string> = {
  'topo-esquerda': 'Topo · esquerda',
  'topo-centro': 'Topo · centro',
  'topo-direita': 'Topo · direita',
  'base-esquerda': 'Base · esquerda',
  'base-centro': 'Base · centro',
  'base-direita': 'Base · direita',
};

/** Ícones disponíveis (texto simples: funciona em qualquer tema e no código exportado). */
export const ICONES_FEEDBACK: Record<string, string> = {
  nenhum: '',
  check: '✓',
  x: '✕',
  alerta: '!',
  info: 'i',
  relogio: '⏳',
  estrela: '★',
  coracao: '♥',
};

export interface MensagemFeedback {
  ativo: boolean;
  titulo: string;
  mensagem: string;
  corTexto: string;
  corFundo: string;
  icone: string;
  /** ms até sumir sozinha; 0 = fica até fechar. LOADING fica até a operação terminar. */
  duracao: number;
  posicao: PosicaoFeedback;
  /** px */
  largura: number;
  /** px */
  raio: number;
}

/** Resultado escolhido para a operação de teste do preview. */
export type ResultadoSimulado = 'sucesso' | 'erro' | 'pendencia' | 'info';

export interface ConfigFeedback {
  versao: 1;
  /** Liga o feedback ao clique no botão do preview. */
  ativo: boolean;
  mensagens: Record<TipoFeedback, MensagemFeedback>;
  /** Operação de teste (o lab não tem backend): resultado e tempo de resposta. */
  simulacao: { resultado: ResultadoSimulado; atrasoMs: number };
}

/** O que a operação devolve quando termina sem erro. */
export interface ResultadoOperacao {
  /** Concluiu, mas há pendência → WARNING. */
  pendencia?: string;
  /** Concluiu com uma informação para a pessoa → INFO. */
  info?: string;
}

export interface ExibicaoFeedback extends MensagemFeedback {
  tipo: TipoFeedback;
  /** Muda a cada exibição (reinicia o tempo mesmo com o mesmo tipo). */
  id: number;
  /** Detalhe vindo da operação (mensagem do erro, pendência ou info). */
  detalhe?: string;
}

const PADRAO_MSG: Record<TipoFeedback, Omit<MensagemFeedback, 'posicao' | 'largura' | 'raio'>> = {
  success: {
    ativo: true,
    titulo: 'Pronto!',
    mensagem: 'Operação concluída.',
    corTexto: '#04140d',
    corFundo: '#2ee59d',
    icone: 'check',
    duracao: 3000,
  },
  error: {
    ativo: true,
    titulo: 'Algo deu errado',
    mensagem: 'A operação falhou. Tente de novo.',
    corTexto: '#ffffff',
    corFundo: '#c01d47',
    icone: 'x',
    duracao: 5000,
  },
  warning: {
    ativo: true,
    titulo: 'Atenção',
    mensagem: 'Concluído, mas há uma pendência.',
    corTexto: '#1f1300',
    corFundo: '#ffb547',
    icone: 'alerta',
    duracao: 4000,
  },
  info: {
    ativo: true,
    titulo: 'Para saber',
    mensagem: 'Veja os detalhes da operação.',
    corTexto: '#ffffff',
    corFundo: '#2563eb',
    icone: 'info',
    duracao: 4000,
  },
  loading: {
    ativo: true,
    titulo: 'Processando…',
    mensagem: 'Aguarde um instante.',
    corTexto: '#f5f3ff',
    corFundo: '#2a2045',
    icone: 'relogio',
    duracao: 0,
  },
};

export function feedbackPadrao(): ConfigFeedback {
  const mensagens = {} as Record<TipoFeedback, MensagemFeedback>;
  for (const t of TIPOS_FEEDBACK)
    mensagens[t] = { ...PADRAO_MSG[t], posicao: 'base-centro', largura: 320, raio: 12 };
  return { versao: 1, ativo: true, mensagens, simulacao: { resultado: 'sucesso', atrasoMs: 1200 } };
}

/* ------------------------------ normalização ------------------------------ */

const COR = /^(#[0-9a-f]{3,8}|rgba?\([\d\s.,/%]+\)|hsla?\([\d\s.,/%deg]+\)|transparent)$/i;

const texto = (v: unknown, padrao: string, max: number): string =>
  typeof v === 'string' ? v.slice(0, max) : padrao;
const cor = (v: unknown, padrao: string): string =>
  typeof v === 'string' && COR.test(v.trim()) ? v.trim() : padrao;
const numero = (v: unknown, padrao: number, min: number, max: number): number => {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? Math.round(Math.min(max, Math.max(min, n))) : padrao;
};
const deLista = <T extends string>(v: unknown, lista: readonly T[], padrao: T): T =>
  lista.includes(v as T) ? (v as T) : padrao;

export const LIMITES = {
  duracao: [0, 30000],
  largura: [160, 640],
  raio: [0, 40],
  atraso: [0, 10000],
  titulo: 80,
  mensagem: 240,
} as const;

function normalizarMensagem(v: unknown, padrao: MensagemFeedback): MensagemFeedback {
  const o = (v && typeof v === 'object' ? v : {}) as Partial<
    Record<keyof MensagemFeedback, unknown>
  >;
  return {
    ativo: typeof o.ativo === 'boolean' ? o.ativo : padrao.ativo,
    titulo: texto(o.titulo, padrao.titulo, LIMITES.titulo),
    mensagem: texto(o.mensagem, padrao.mensagem, LIMITES.mensagem),
    corTexto: cor(o.corTexto, padrao.corTexto),
    corFundo: cor(o.corFundo, padrao.corFundo),
    icone: typeof o.icone === 'string' && o.icone in ICONES_FEEDBACK ? o.icone : padrao.icone,
    duracao: numero(o.duracao, padrao.duracao, ...LIMITES.duracao),
    posicao: deLista(o.posicao, POSICOES_FEEDBACK, padrao.posicao),
    largura: numero(o.largura, padrao.largura, ...LIMITES.largura),
    raio: numero(o.raio, padrao.raio, ...LIMITES.raio),
  };
}

/** Lê uma configuração salva (de qualquer versão ou corrompida) sem quebrar. */
export function normalizarFeedback(bruto: unknown): ConfigFeedback {
  const p = feedbackPadrao();
  if (!bruto || typeof bruto !== 'object') return p;
  const o = bruto as Partial<ConfigFeedback>;
  const msgs = (o.mensagens && typeof o.mensagens === 'object' ? o.mensagens : {}) as Record<
    string,
    unknown
  >;
  const mensagens = {} as Record<TipoFeedback, MensagemFeedback>;
  for (const t of TIPOS_FEEDBACK) mensagens[t] = normalizarMensagem(msgs[t], p.mensagens[t]);
  const s = (o.simulacao ?? {}) as Partial<ConfigFeedback['simulacao']>;
  return {
    versao: 1,
    ativo: typeof o.ativo === 'boolean' ? o.ativo : p.ativo,
    mensagens,
    simulacao: {
      resultado: deLista(
        s.resultado,
        ['sucesso', 'erro', 'pendencia', 'info'] as const,
        p.simulacao.resultado,
      ),
      atrasoMs: numero(s.atrasoMs, p.simulacao.atrasoMs, ...LIMITES.atraso),
    },
  };
}

/* -------------------------------- execução -------------------------------- */

let proximoId = 1;

export function exibicao(
  cfg: ConfigFeedback,
  tipo: TipoFeedback,
  detalhe?: string,
): ExibicaoFeedback {
  return { ...cfg.mensagens[tipo], tipo, id: proximoId++, detalhe: detalhe || undefined };
}

/** Qual mensagem o resultado da operação pede (sucesso só se ela terminou sem erro). */
export function tipoDoResultado(r: ResultadoOperacao | void): TipoFeedback {
  if (r && r.pendencia) return 'warning';
  if (r && r.info) return 'info';
  return 'success';
}

/**
 * Roda a operação e exibe o feedback do resultado REAL:
 * LOADING enquanto roda → SUCCESS / WARNING / INFO se terminou, ERROR se falhou.
 * Mensagem desativada não aparece (e nunca é trocada por outra).
 */
export async function executarComFeedback(
  operacao: () => Promise<ResultadoOperacao | void>,
  cfg: ConfigFeedback,
  exibir: (m: ExibicaoFeedback | null) => void,
): Promise<TipoFeedback> {
  const mostrar = (tipo: TipoFeedback, detalhe?: string) =>
    exibir(cfg.mensagens[tipo].ativo ? exibicao(cfg, tipo, detalhe) : null);

  if (cfg.mensagens.loading.ativo) mostrar('loading');
  let tipo: TipoFeedback;
  let detalhe: string | undefined;
  try {
    const r = await operacao();
    tipo = tipoDoResultado(r);
    detalhe = r ? (r.pendencia ?? r.info) : undefined;
  } catch (e) {
    tipo = 'error';
    detalhe = e instanceof Error ? e.message : undefined;
  }
  mostrar(tipo, detalhe);
  return tipo;
}

/** Operação de teste do preview: responde depois do atraso com o resultado escolhido. */
export function operacaoSimulada(
  resultado: ResultadoSimulado,
  atrasoMs: number,
  esperar: (ms: number) => Promise<void> = (ms) => new Promise((ok) => setTimeout(ok, ms)),
): () => Promise<ResultadoOperacao> {
  return async () => {
    await esperar(atrasoMs);
    if (resultado === 'erro') throw new Error('Falha simulada no teste do preview.');
    if (resultado === 'pendencia') return { pendencia: 'Pendência simulada no teste.' };
    if (resultado === 'info') return { info: 'Informação simulada no teste.' };
    return {};
  };
}

/** Componentes que são botões (recebem a seção Mensagens e Feedback). */
export function ehBotao(c: { categoria: string; codigo: { html: string } }): boolean {
  return (
    c.categoria === 'acoes' ||
    c.categoria === 'botoes' ||
    /<button\b|role=["']button["']/i.test(c.codigo.html)
  );
}
