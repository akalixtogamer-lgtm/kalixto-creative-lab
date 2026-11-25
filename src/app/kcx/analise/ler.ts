/**
 * Leitura defensiva da análise guardada numa comparação (navegador ou arquivo
 * importado): nada é confiado, tudo é cortado e conferido.
 */
import { TIPOS_EFEITO_WEB } from './catalogo';
import type {
  AnaliseReferencia,
  Confianca,
  FichaEfeito,
  OrigemAnalise,
  ParametrosEfeito,
  RegiaoPct,
  ResultadoInvestigacao,
  StatusTecnologia,
  Tecnologia,
  TipoEfeitoWeb,
} from './tipos';

type Obj = Record<string, unknown>;
const obj = (x: unknown): x is Obj => !!x && typeof x === 'object' && !Array.isArray(x);
const txt = (x: unknown, max = 300) => (typeof x === 'string' ? x.slice(0, max) : '');
const num = (x: unknown, min: number, max: number): number | undefined =>
  typeof x === 'number' && Number.isFinite(x) ? Math.min(max, Math.max(min, x)) : undefined;
const textos = (x: unknown, n: number, max = 300) =>
  (Array.isArray(x) ? x : [])
    .map((i) => txt(i, max))
    .filter(Boolean)
    .slice(0, n);
const tempo = (x: unknown) => (num(x, 0, 36000) ?? null) as number | null;

const ORIGENS: OrigemAnalise[] = ['dom', 'html', 'video', 'manual'];
const CONFIANCAS: Confianca[] = ['alta', 'media', 'baixa'];
const DIRECOES = ['cima', 'baixo', 'esquerda', 'direita', 'dentro', 'fora'] as const;

function regiao(x: unknown): RegiaoPct | undefined {
  if (!obj(x)) return undefined;
  const r = {
    x: num(x['x'], 0, 100) ?? 0,
    y: num(x['y'], 0, 100) ?? 0,
    largura: num(x['largura'], 0, 100) ?? 0,
    altura: num(x['altura'], 0, 100) ?? 0,
  };
  return r.largura > 0 && r.altura > 0 ? r : undefined;
}

function parametros(x: unknown): ParametrosEfeito {
  const o = obj(x) ? x : {};
  const p: ParametrosEfeito = {};
  const set = <K extends keyof ParametrosEfeito>(k: K, v: ParametrosEfeito[K] | undefined) => {
    if (v !== undefined) p[k] = v;
  };
  set('duracao', num(o['duracao'], 0, 600000));
  set('distancia', num(o['distancia'], 0, 100000));
  set('velocidade', num(o['velocidade'], 0, 100000));
  set('fator', num(o['fator'], 0, 20));
  set('intensidade', num(o['intensidade'], 0, 1));
  set('atraso', num(o['atraso'], 0, 10000));
  if ((DIRECOES as readonly string[]).includes(o['direcao'] as string))
    p.direcao = o['direcao'] as ParametrosEfeito['direcao'];
  const e = txt(o['easing'], 80);
  if (e) p.easing = e;
  return p;
}

export function lerFicha(x: unknown): FichaEfeito | null {
  if (!obj(x) || !TIPOS_EFEITO_WEB.includes(x['tipo'] as TipoEfeitoWeb)) return null;
  const f: FichaEfeito = {
    id: txt(x['id'], 60) || `ficha-${Math.random().toString(36).slice(2, 9)}`,
    tipo: x['tipo'] as TipoEfeitoWeb,
    nome: txt(x['nome'], 80) || 'Efeito',
    origem: ORIGENS.includes(x['origem'] as OrigemAnalise)
      ? (x['origem'] as OrigemAnalise)
      : 'manual',
    confianca: CONFIANCAS.includes(x['confianca'] as Confianca)
      ? (x['confianca'] as Confianca)
      : 'baixa',
    inicio: tempo(x['inicio']),
    fim: tempo(x['fim']),
    evidencias: textos(x['evidencias'], 8, 400),
    parametros: parametros(x['parametros']),
  };
  const reg = regiao(x['regiao']);
  if (reg) f.regiao = reg;
  const tecs = textos(x['tecnologias'], 10, 80);
  if (tecs.length) f.tecnologias = tecs;
  const sel = txt(x['seletor'], 200);
  if (sel) f.seletor = sel;
  const obs = txt(x['observacao'], 300);
  if (obs) f.observacao = obs;
  const oc = (Array.isArray(x['ocorrencias']) ? x['ocorrencias'] : [])
    .filter(obj)
    .map((o) => ({ inicio: tempo(o['inicio']), fim: tempo(o['fim']) }))
    .filter((o): o is { inicio: number; fim: number } => o.inicio !== null && o.fim !== null)
    .slice(0, 50);
  if (oc.length) f.ocorrencias = oc;
  return f;
}

const STATUS: StatusTecnologia[] = ['confirmada', 'provavel', 'nao-identificada'];

function lerInvestigacao(x: unknown): ResultadoInvestigacao | undefined {
  if (!obj(x)) return undefined;
  return {
    origem: x['origem'] === 'html' ? 'html' : 'dom',
    url: txt(x['url'], 500),
    titulo: txt(x['titulo'], 200),
    quando: txt(x['quando'], 40),
    tecnologias: (Array.isArray(x['tecnologias']) ? x['tecnologias'] : [])
      .filter(obj)
      .slice(0, 40)
      .map((t): Tecnologia => ({
        id: txt(t['id'], 40),
        nome: txt(t['nome'], 80),
        status: STATUS.includes(t['status'] as StatusTecnologia)
          ? (t['status'] as StatusTecnologia)
          : 'nao-identificada',
        evidencias: textos(t['evidencias'], 8, 300),
        ...(txt(t['versao'], 20) ? { versao: txt(t['versao'], 20) } : {}),
      })),
    fichas: [],
    resumo: textos(x['resumo'], 20, 400),
    limites: textos(x['limites'], 20, 400),
  };
}

export function lerAnalise(x: unknown): AnaliseReferencia | undefined {
  if (!obj(x)) return undefined;
  const fichas = (Array.isArray(x['fichas']) ? x['fichas'] : [])
    .map(lerFicha)
    .filter((f): f is FichaEfeito => !!f)
    .slice(0, 80);
  const reconstruidos: Record<string, string> = {};
  if (obj(x['reconstruidos']))
    for (const [k, v] of Object.entries(x['reconstruidos']).slice(0, 80))
      if (typeof v === 'string' && /^[a-z0-9-]{1,80}$/.test(v)) reconstruidos[k.slice(0, 60)] = v;
  const a: AnaliseReferencia = { fichas, reconstruidos };
  const inv = lerInvestigacao(x['investigacao']);
  if (inv) a.investigacao = inv;
  if (obj(x['video'])) {
    const v = x['video'];
    a.video = {
      quadros: num(v['quadros'], 0, 10000) ?? 0,
      duracao: num(v['duracao'], 0, 36000) ?? 0,
      escala: num(v['escala'], 0, 1000) ?? 1,
      trechos: (Array.isArray(v['trechos']) ? v['trechos'] : [])
        .filter(obj)
        .slice(0, 200)
        .map((t) => ({
          inicio: tempo(t['inicio']) ?? 0,
          fim: tempo(t['fim']) ?? 0,
          descricao: txt(t['descricao'], 80),
        })),
      limites: textos(v['limites'], 10, 400),
    };
  }
  return a;
}
