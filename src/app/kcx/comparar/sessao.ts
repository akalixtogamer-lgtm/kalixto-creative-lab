/**
 * Sessões de comparação: criação, leitura defensiva (o que vem do navegador
 * ou de um arquivo nunca é confiado), versões e aprovação.
 */
import type { KcxComponente, KcxValor } from '../kcx.types';
import { normalizarAjuste, seletorSeguro } from './ajustes';
import { CRITERIOS, ROTULO_ESTADO, resumir } from './fidelidade';
import { lerAnalise } from '../analise/ler';
import type {
  Ajuste,
  Caixa,
  Comportamento,
  ElementoPar,
  EstadoReconstrucao,
  FrameReferencia,
  Marco,
  MedicoesReconstrucao,
  ReferenciaAnalisada,
  ResultadoCriterio,
  SessaoComparacao,
  StatusComportamento,
  TipoComportamento,
  TipoMarco,
  TipoReferencia,
  VersaoReconstrucao,
} from './tipos';

export const LIMITE_FRAMES = 24;
export const LIMITE_VERSOES = 30;
export const LIMITE_SESSOES = 20;

let contador = 0;
export function novoIdCmp(prefixo: string): string {
  contador = (contador + 1) % 1e6;
  return `${prefixo}-${Date.now().toString(36)}${contador.toString(36)}`;
}

export function referenciaVazia(): ReferenciaAnalisada {
  return {
    tipo: 'video',
    nome: 'Referência',
    largura: 1280,
    altura: 720,
    frames: [],
    marcos: [],
    elementos: [],
    comportamentos: [],
  };
}

export function novaSessao(
  nome: string,
  componenteId: string,
  agora = new Date(),
): SessaoComparacao {
  const iso = agora.toISOString();
  return {
    formato: 'kcx-comparacao',
    versao: 1,
    id: novoIdCmp('cmp'),
    nome: nome.trim().slice(0, 120) || 'Nova comparação',
    criadaEm: iso,
    atualizadaEm: iso,
    referencia: referenciaVazia(),
    atual: { componenteId, valores: {}, ajustes: [] },
    versoes: [],
    alinhamento: { x: 0, y: 0, escala: 1 },
  };
}

/* ------------------------------ Leitura segura ------------------------------ */

type Obj = Record<string, unknown>;
const obj = (x: unknown): x is Obj => !!x && typeof x === 'object' && !Array.isArray(x);
const txt = (x: unknown, max = 200, padrao = ''): string =>
  typeof x === 'string' ? x.slice(0, max) : padrao;
const num = (x: unknown, padrao: number, min = -1e7, max = 1e7): number =>
  typeof x === 'number' && Number.isFinite(x) ? Math.min(max, Math.max(min, x)) : padrao;
const numOuNulo = (x: unknown): number | null =>
  typeof x === 'number' && Number.isFinite(x) && x >= 0 && x <= 36000 ? x : null;
const lista = (x: unknown): unknown[] => (Array.isArray(x) ? x : []);
const IMAGEM = /^data:image\/(png|jpeg|webp);base64,[a-z0-9+/=]+$/i;
const HEX = /^#[0-9a-f]{6}$/i;

function caixa(x: unknown): Caixa | undefined {
  if (!obj(x)) return undefined;
  const c = {
    x: num(x['x'], 0, -1e5, 1e5),
    y: num(x['y'], 0, -1e5, 1e5),
    largura: num(x['largura'], 0, 0, 1e5),
    altura: num(x['altura'], 0, 0, 1e5),
  };
  return c.largura > 0 && c.altura > 0 ? c : undefined;
}

const seletor = (x: unknown): string | undefined => {
  const s = txt(x, 300).trim();
  return s && seletorSeguro(s) ? s : undefined;
};

function frame(x: unknown): FrameReferencia | null {
  if (!obj(x) || typeof x['src'] !== 'string' || !IMAGEM.test(x['src'])) return null;
  const f: FrameReferencia = {
    id: txt(x['id'], 60) || novoIdCmp('frame'),
    tempo: numOuNulo(x['tempo']),
    src: x['src'],
    largura: num(x['largura'], 0, 1, 10000),
    altura: num(x['altura'], 0, 1, 10000),
  };
  const r = txt(x['rotulo'], 80);
  if (r) f.rotulo = r;
  return f;
}

const TIPOS_MARCO: TipoMarco[] = ['estado', 'efeito', 'interacao'];
function marco(x: unknown): Marco | null {
  if (!obj(x)) return null;
  const m: Marco = {
    id: txt(x['id'], 60) || novoIdCmp('marco'),
    nome: txt(x['nome'], 80) || 'Marco',
    tipo: TIPOS_MARCO.includes(x['tipo'] as TipoMarco) ? (x['tipo'] as TipoMarco) : 'estado',
    ref: numOuNulo(x['ref']),
    rec: numOuNulo(x['rec']),
  };
  const refFim = numOuNulo(x['refFim']);
  const recFim = numOuNulo(x['recFim']);
  if (refFim !== null) m.refFim = refFim;
  if (recFim !== null) m.recFim = recFim;
  const e = txt(x['easingRef'], 80);
  if (e) m.easingRef = e;
  const s = seletor(x['seletorRec']);
  if (s) m.seletorRec = s;
  const a = txt(x['anotacao'], 500);
  if (a) m.anotacao = a;
  const f = txt(x['frameId'], 60);
  if (f) m.frameId = f;
  return m;
}

function elemento(x: unknown): ElementoPar | null {
  if (!obj(x)) return null;
  const e: ElementoPar = {
    id: txt(x['id'], 60) || novoIdCmp('el'),
    nome: txt(x['nome'], 80) || 'Elemento',
  };
  const f = txt(x['frameId'], 60);
  if (f) e.frameId = f;
  const c = caixa(x['caixaRef']);
  if (c) e.caixaRef = c;
  if (typeof x['corRef'] === 'string' && HEX.test(x['corRef'])) e.corRef = x['corRef'];
  if (x['corAlvo'] === 'texto' || x['corAlvo'] === 'fundo') e.corAlvo = x['corAlvo'];
  const fonte = num(x['fonteRef'], 0, 0, 1000);
  if (fonte > 0) e.fonteRef = fonte;
  const fam = txt(x['familiaRef'], 80);
  if (fam) e.familiaRef = fam;
  const peso = num(x['pesoRef'], 0, 0, 1000);
  if (peso > 0) e.pesoRef = peso;
  const cam = num(x['camadaRef'], 0, 0, 99);
  if (cam > 0) e.camadaRef = Math.round(cam);
  const s = seletor(x['seletorRec']);
  if (s) e.seletorRec = s;
  const a = txt(x['anotacao'], 500);
  if (a) e.anotacao = a;
  return e;
}

export const TIPOS_COMPORTAMENTO: { id: TipoComportamento; nome: string }[] = [
  { id: 'hover', nome: 'Hover' },
  { id: 'scroll', nome: 'Scroll' },
  { id: 'clique', nome: 'Clique' },
  { id: 'arrastar', nome: 'Arrastar' },
  { id: 'expandir', nome: 'Expandir' },
  { id: 'recolher', nome: 'Recolher' },
  { id: 'transicao', nome: 'Transição' },
  { id: 'navegacao', nome: 'Estado de navegação' },
];
const STATUS: StatusComportamento[] = ['reproduzido', 'difere', 'nao-implementado', 'nao-testado'];

function comportamento(x: unknown): Comportamento | null {
  if (!obj(x)) return null;
  const tipo = TIPOS_COMPORTAMENTO.some((t) => t.id === x['tipo'])
    ? (x['tipo'] as TipoComportamento)
    : 'hover';
  const c: Comportamento = {
    id: txt(x['id'], 60) || novoIdCmp('comp'),
    tipo,
    descricao: txt(x['descricao'], 200) || 'Comportamento',
    status: STATUS.includes(x['status'] as StatusComportamento)
      ? (x['status'] as StatusComportamento)
      : 'nao-testado',
  };
  const s = seletor(x['seletorRec']);
  if (s) c.seletorRec = s;
  const ev = txt(x['evidencia'], 600);
  if (ev) c.evidencia = ev;
  const ob = txt(x['observacao'], 500);
  if (ob) c.observacao = ob;
  return c;
}

function valores(x: unknown): Record<string, KcxValor> {
  if (!obj(x)) return {};
  const out: Record<string, KcxValor> = {};
  for (const [k, v] of Object.entries(x).slice(0, 400)) {
    if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(k)) continue;
    if (['string', 'number', 'boolean'].includes(typeof v) || obj(v)) out[k] = v as KcxValor;
  }
  return out;
}

function ajuste(x: unknown): Ajuste | null {
  if (!obj(x)) return null;
  const id = txt(x['id'], 40);
  const sel = seletor(x['seletor']);
  if (!/^[a-z][a-z0-9]*$/.test(id) || !sel) return null;
  try {
    const escopo = obj(x['escopo']) ? x['escopo'] : {};
    const a: Ajuste = {
      id,
      seletor: sel,
      elemento: txt(x['elemento'], 60) || 'Elemento',
      propriedade: x['propriedade'] as Ajuste['propriedade'],
      valor: x['valor'] as KcxValor,
      escopo: {
        tipo: escopo['tipo'] === 'ate' || escopo['tipo'] === 'acima' ? escopo['tipo'] : 'todos',
        largura: num(escopo['largura'], 768, 200, 4000),
      },
    };
    const base = num(x['base'], 0, 0, 60000);
    if (base > 0) a.base = base;
    return normalizarAjuste(a);
  } catch {
    return null; // propriedade desconhecida
  }
}

function estado(x: unknown): EstadoReconstrucao {
  const o = obj(x) ? x : {};
  return {
    componenteId: txt(o['componenteId'], 80),
    valores: valores(o['valores']),
    ajustes: lista(o['ajustes'])
      .map(ajuste)
      .filter((a): a is Ajuste => !!a)
      .slice(0, 200),
  };
}

function versao(x: unknown): VersaoReconstrucao | null {
  if (!obj(x)) return null;
  const c = obj(x['comparacao']) ? x['comparacao'] : {};
  return {
    id: txt(x['id'], 60) || novoIdCmp('versao'),
    nome: txt(x['nome'], 120) || 'Versão',
    data: txt(x['data'], 40) || new Date(0).toISOString(),
    estado: estado(x['estado']),
    componentes: lista(x['componentes'])
      .map((i) => txt(i, 80))
      .filter(Boolean),
    modificadas: lista(x['modificadas'])
      .map((i) => txt(i, 120))
      .filter(Boolean),
    variaveis: valores(x['variaveis']),
    animacoes: lista(x['animacoes'])
      .map((i) => txt(i, 120))
      .filter(Boolean),
    observacoes: txt(x['observacoes'], 2000),
    comparacao: {
      corresponde: num(c['corresponde'], 0, 0, 99),
      proximo: num(c['proximo'], 0, 0, 99),
      difere: num(c['difere'], 0, 0, 99),
      semMedicao: num(c['semMedicao'], 0, 0, 99),
      criterios: obj(c['criterios'])
        ? (c['criterios'] as VersaoReconstrucao['comparacao']['criterios'])
        : {},
    },
    aprovada: x['aprovada'] === true,
  };
}

function medicoes(x: unknown): MedicoesReconstrucao | undefined {
  if (!obj(x) || !obj(x['palco']) || !obj(x['elementos'])) return undefined;
  // Medições são refeitas a cada clique; aqui só confere a forma geral.
  const elementos: MedicoesReconstrucao['elementos'] = {};
  for (const [k, v] of Object.entries(x['elementos']).slice(0, 60))
    if (seletorSeguro(k) && obj(v) && caixa(v['caixa']))
      elementos[k] = v as unknown as MedicoesReconstrucao['elementos'][string];
  return {
    palco: {
      largura: num(x['palco']['largura'], 0, 0, 10000),
      altura: num(x['palco']['altura'], 0, 0, 10000),
    },
    elementos,
    viewports: lista(x['viewports'])
      .filter(obj)
      .map((v) => ({
        largura: num(v['largura'], 0, 0, 10000),
        transborda: v['transborda'] === true,
        foraDaTela: lista(v['foraDaTela'])
          .map((s) => txt(s, 300))
          .filter(Boolean)
          .slice(0, 5),
      }))
      .slice(0, 6),
  };
}

const TIPOS_REF: TipoReferencia[] = ['url', 'video', 'frames'];

/** Lê uma sessão guardada ou importada. Devolve null se não for uma sessão. */
export function lerSessao(x: unknown): SessaoComparacao | null {
  if (!obj(x) || x['formato'] !== 'kcx-comparacao') return null;
  const r = obj(x['referencia']) ? x['referencia'] : {};
  const url = txt(r['url'], 2000);
  const referencia: ReferenciaAnalisada = {
    tipo: TIPOS_REF.includes(r['tipo'] as TipoReferencia) ? (r['tipo'] as TipoReferencia) : 'video',
    nome: txt(r['nome'], 120) || 'Referência',
    largura: num(r['largura'], 1280, 1, 10000),
    altura: num(r['altura'], 720, 1, 10000),
    frames: lista(r['frames'])
      .map(frame)
      .filter((f): f is FrameReferencia => !!f)
      .slice(0, LIMITE_FRAMES),
    marcos: lista(r['marcos'])
      .map(marco)
      .filter((m): m is Marco => !!m)
      .slice(0, 200),
    elementos: lista(r['elementos'])
      .map(elemento)
      .filter((e): e is ElementoPar => !!e)
      .slice(0, 60),
    comportamentos: lista(r['comportamentos'])
      .map(comportamento)
      .filter((c): c is Comportamento => !!c)
      .slice(0, 100),
  };
  if (url && urlSegura(url)) referencia.url = url;
  const vc = txt(r['videoChave'], 120);
  if (vc) referencia.videoChave = vc;
  const vn = txt(r['videoNome'], 200);
  if (vn) referencia.videoNome = vn;
  const dur = numOuNulo(r['duracao']);
  if (dur !== null) referencia.duracao = dur;
  const al = obj(x['alinhamento']) ? x['alinhamento'] : {};
  const s: SessaoComparacao = {
    formato: 'kcx-comparacao',
    versao: 1,
    id: txt(x['id'], 60) || novoIdCmp('cmp'),
    nome: txt(x['nome'], 120) || 'Comparação',
    criadaEm: txt(x['criadaEm'], 40) || new Date().toISOString(),
    atualizadaEm: txt(x['atualizadaEm'], 40) || new Date().toISOString(),
    referencia,
    atual: estado(x['atual']),
    versoes: lista(x['versoes'])
      .map(versao)
      .filter((v): v is VersaoReconstrucao => !!v)
      .slice(0, LIMITE_VERSOES),
    alinhamento: {
      x: num(al['x'], 0, -5000, 5000),
      y: num(al['y'], 0, -5000, 5000),
      escala: num(al['escala'], 1, 0.05, 10),
    },
  };
  const med = medicoes(x['medicoes']);
  if (med) s.medicoes = med;
  const salvo = txt(x['salvoComo'], 80);
  if (salvo) s.salvoComo = salvo;
  const analise = lerAnalise(x['analise']);
  if (analise) s.analise = analise;
  // Só uma versão aprovada.
  let achou = false;
  for (const v of s.versoes) {
    if (v.aprovada && achou) v.aprovada = false;
    if (v.aprovada) achou = true;
  }
  return s;
}

/** Só sites https (ou http) de fora: nada de javascript:, data: ou arquivos locais. */
export function urlSegura(u: string, origemDoApp?: string): boolean {
  try {
    const url = new URL(u);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return false;
    if (origemDoApp && url.origin === origemDoApp) return false;
    return true;
  } catch {
    return false;
  }
}

/* ------------------------------ Versões ------------------------------ */

/** Variáveis do componente que saíram do padrão (id → valor). */
export function valoresModificados(
  comp: KcxComponente,
  valores: Record<string, KcxValor>,
): Record<string, KcxValor> {
  const out: Record<string, KcxValor> = {};
  for (const v of comp.variaveis) {
    if (!(v.id in valores)) continue;
    if (JSON.stringify(valores[v.id]) !== JSON.stringify(v.padrao)) out[v.id] = valores[v.id];
  }
  return out;
}

export function criarVersao(
  s: SessaoComparacao,
  base: KcxComponente,
  resultados: ResultadoCriterio[],
  nome: string,
  observacoes: string,
  agora = new Date(),
): VersaoReconstrucao {
  const mod = valoresModificados(base, s.atual.valores);
  const nomes = new Map(base.variaveis.map((v) => [v.id, v.nome]));
  return {
    id: novoIdCmp('versao'),
    nome: nome.trim().slice(0, 120) || `Versão ${s.versoes.length + 1}`,
    data: agora.toISOString(),
    estado: structuredClone(s.atual),
    componentes: [base.id, ...(base.subcomponentes ?? []).map((c) => c.id)],
    modificadas: [
      ...Object.keys(mod).map((id) => nomes.get(id) ?? id),
      ...s.atual.ajustes.map((a) => `${a.elemento} · ${a.propriedade}`),
    ],
    variaveis: {
      ...mod,
      ...Object.fromEntries(s.atual.ajustes.map((a) => [a.id, a.valor])),
    },
    animacoes: base.animacoes.map((a) => a.nome),
    observacoes: observacoes.slice(0, 2000),
    comparacao: resumir(resultados),
    aprovada: false,
  };
}

export function duplicarVersao(v: VersaoReconstrucao, agora = new Date()): VersaoReconstrucao {
  return {
    ...structuredClone(v),
    id: novoIdCmp('versao'),
    nome: `${v.nome} (cópia)`.slice(0, 120),
    data: agora.toISOString(),
    aprovada: false,
  };
}

/** Aprova uma versão (e só ela). Passe null para tirar a aprovação. */
export function aprovarVersao(
  versoes: VersaoReconstrucao[],
  id: string | null,
): VersaoReconstrucao[] {
  return versoes.map((v) => ({ ...v, aprovada: v.id === id }));
}

export interface DiferencaVersao {
  campo: string;
  a: string;
  b: string;
}

const mostrar = (v: unknown) =>
  v === undefined ? '—' : typeof v === 'object' ? JSON.stringify(v) : String(v);

/** O que muda de uma versão para outra: valores, ajustes e estado dos critérios. */
export function compararVersoes(
  a: VersaoReconstrucao,
  b: VersaoReconstrucao,
  nomes: Record<string, string> = {},
): DiferencaVersao[] {
  const out: DiferencaVersao[] = [];
  if (a.estado.componenteId !== b.estado.componenteId)
    out.push({ campo: 'Componente', a: a.estado.componenteId, b: b.estado.componenteId });
  const ajustesA = new Map(a.estado.ajustes.map((x) => [x.id, x]));
  const ajustesB = new Map(b.estado.ajustes.map((x) => [x.id, x]));
  const rotulo = (id: string) => {
    const aj = ajustesA.get(id) ?? ajustesB.get(id);
    return aj ? `${aj.elemento} · ${aj.propriedade}` : (nomes[id] ?? id);
  };
  const chaves = new Set([...Object.keys(a.variaveis), ...Object.keys(b.variaveis)]);
  for (const k of chaves) {
    const va = a.variaveis[k];
    const vb = b.variaveis[k];
    if (JSON.stringify(va) !== JSON.stringify(vb))
      out.push({ campo: rotulo(k), a: mostrar(va), b: mostrar(vb) });
  }
  for (const [id, x] of ajustesA)
    if (!ajustesB.has(id) && !(id in b.variaveis))
      out.push({ campo: `Ajuste ${x.elemento} · ${x.propriedade}`, a: 'existe', b: 'removido' });
  const crit = new Set([
    ...Object.keys(a.comparacao.criterios),
    ...Object.keys(b.comparacao.criterios),
  ]) as Set<keyof VersaoReconstrucao['comparacao']['criterios']>;
  for (const c of crit) {
    const ea = a.comparacao.criterios[c];
    const eb = b.comparacao.criterios[c];
    if (ea !== eb)
      out.push({
        campo: `Fidelidade · ${CRITERIOS.find((x) => x.id === c)?.nome ?? c}`,
        a: ea ? ROTULO_ESTADO[ea] : '—',
        b: eb ? ROTULO_ESTADO[eb] : '—',
      });
  }
  return out;
}
