/**
 * Vidro (glassmorphism) para QUALQUER componente KCX: da biblioteca, do
 * construtor de tipos, do montador ou importado do Figma.
 *
 * Gera uma cópia "· vidro" com uma camada escolhida (caixa ou retângulo)
 * translúcida: fundo e borda com transparência, desfoque do que fica atrás
 * (Background blur no Figma, backdrop-filter no código). O original não muda.
 */
import { KcxComponente, KcxEfeito, KcxNo, KcxPreenchimento, KcxRef } from '../kcx.types';
import { comAlpha, corValida } from '../unidades';
import { DESFOQUES, ChaveDesfoque } from './montado';

export interface OpcoesVidro {
  /** Opacidade do fundo, 0–100%. */
  fundo: number;
  /** Opacidade da borda, 0–100%. */
  borda: number;
  desfoque: ChaveDesfoque;
  /** Id da camada que vira vidro (padrão: a primeira caixa com fundo). */
  camada?: string;
}

export const VIDRO_PADRAO: OpcoesVidro = { fundo: 35, borda: 20, desfoque: 'm' };

export interface CamadaVidro {
  id: string;
  nome: string;
  nivel: number;
}

const podeVidro = (n: KcxNo) => n.tipo === 'frame' || n.tipo === 'retangulo';

/** Camadas que podem virar vidro (caixas e retângulos), em ordem de leitura. */
export function camadasParaVidro(comp: KcxComponente): CamadaVidro[] {
  const lista: CamadaVidro[] = [];
  const andar = (n: KcxNo, nivel: number) => {
    if (podeVidro(n)) lista.push({ id: n.id, nome: n.nome, nivel });
    (n.filhos ?? []).forEach((f) => andar(f, nivel + 1));
  };
  andar(comp.estrutura, 0);
  return lista;
}

/** A primeira caixa com fundo sólido (em largura), ou a raiz. */
export function camadaSugerida(comp: KcxComponente): string {
  const fila: KcxNo[] = [comp.estrutura];
  while (fila.length) {
    const n = fila.shift()!;
    if (podeVidro(n) && n.preenchimentos?.some((p) => p.tipo === 'solido')) return n.id;
    fila.push(...(n.filhos ?? []));
  }
  return comp.estrutura.id;
}

function acharNo(n: KcxNo, id: string): KcxNo | undefined {
  if (n.id === id) return n;
  for (const f of n.filhos ?? []) {
    const x = acharNo(f, id);
    if (x) return x;
  }
  return undefined;
}

const ehVar = (r: unknown): r is { $var: string } =>
  !!r && typeof r === 'object' && '$var' in (r as object);
const ehDerivada = (r: unknown): r is { $derivado: string; nome: string; transformar?: [] } =>
  !!r && typeof r === 'object' && '$derivado' in (r as object);

export interface ResultadoVidro {
  comp: KcxComponente;
  /** O que não deu para fazer igual no código e no Figma. */
  avisos: string[];
}

/** Cópia do componente com a camada escolhida em vidro. */
export function comVidro(
  original: KcxComponente,
  o: OpcoesVidro = VIDRO_PADRAO,
  ocupados: string[] = [],
): ResultadoVidro {
  const fundoA = Math.min(100, Math.max(0, Math.round(o.fundo))) / 100;
  const bordaA = Math.min(100, Math.max(0, Math.round(o.borda))) / 100;
  const blur = DESFOQUES[o.desfoque] ?? DESFOQUES.m;
  const avisos: string[] = [];

  const c = structuredClone(original);
  // Vidro de um vidro parte do mesmo nome (sem acumular "-vidro-vidro").
  const jaVidro =
    (original.origemCriacao?.config as { tipo?: string } | undefined)?.tipo === 'vidro';
  const raizId = jaVidro ? original.id.replace(/-vidro(-\d+)?$/, '') : original.id;
  const base = `${raizId}-vidro`;
  let id = base;
  for (let n = 2; ocupados.includes(id) || id === original.id; n++) id = `${base}-${n}`;
  c.id = id;
  c.nome = `${jaVidro ? original.nome.replace(/ · vidro$/, '') : original.nome} · vidro`;
  c.descricao = `Versão de vidro (glassmorphism) de "${original.nome}". ${original.descricao}`;
  c.origemCriacao = {
    tipo: 'construtor',
    config: { tipo: 'vidro', base: original.id, opcoes: { ...o } },
  };

  const alvoId = o.camada && acharNo(c.estrutura, o.camada) ? o.camada : camadaSugerida(c);
  const no = acharNo(c.estrutura, alvoId)!;
  if (!podeVidro(no)) throw new Error(`"${no.nome}" não é uma caixa: escolha outra camada.`);

  /* ---------- Figma (estrutura) ---------- */
  let k = 0;
  const comTransparencia = (ref: KcxRef<string>, a: number): KcxRef<string> => {
    if (ehVar(ref)) {
      const v = c.variaveis.find((x) => x.id === ref.$var);
      if (v?.tipo !== 'color') return ref;
      return {
        $derivado: ref.$var,
        nome: `vidro-${++k}`,
        transformar: [{ op: 'alpha', valor: a }],
      };
    }
    if (ehDerivada(ref))
      return {
        ...ref,
        nome: `${ref.nome}-vidro`,
        transformar: [...(ref.transformar ?? []), { op: 'alpha', valor: a }],
      } as KcxRef<string>;
    return typeof ref === 'string' && corValida(ref) ? comAlpha(ref, a) : ref;
  };
  const translucido = (p: KcxPreenchimento): KcxPreenchimento => {
    if (p.tipo === 'solido') return { ...p, cor: comTransparencia(p.cor, fundoA) };
    if (p.tipo === 'gradiente-linear' || p.tipo === 'gradiente-conico')
      return {
        ...p,
        paradas: p.paradas.map((x) => ({ ...x, cor: comTransparencia(x.cor, fundoA) })),
      };
    avisos.push('O fundo vem de uma variável de gradiente: ele continua opaco.');
    return p;
  };

  const veu = comAlpha('#ffffff', fundoA * 0.4);
  if (no.preenchimentos?.length) no.preenchimentos = no.preenchimentos.map(translucido);
  else {
    no.preenchimentos = [{ tipo: 'solido', cor: veu }];
    avisos.push('A camada não tinha fundo: ganhou um véu branco translúcido.');
  }

  const veuBorda = comAlpha('#ffffff', bordaA);
  if (no.traco?.cor !== undefined)
    no.traco = { ...no.traco, cor: comTransparencia(no.traco.cor, bordaA) };
  else if (no.traco?.pintura?.tipo === 'solido')
    no.traco = {
      ...no.traco,
      pintura: { ...no.traco.pintura, cor: comTransparencia(no.traco.pintura.cor, bordaA) },
    };
  else if (!no.traco) no.traco = { cor: veuBorda, espessura: 1 };

  const efeitos: KcxEfeito[] = (no.efeitos ?? []).filter((e) => e.tipo !== 'desfoque-fundo');
  // O raio do Background blur no Figma é o dobro do blur() do CSS.
  efeitos.push({ tipo: 'desfoque-fundo', raio: blur * 2 });
  no.efeitos = efeitos;

  /* ---------- Código (HTML/CSS) ---------- */
  const classes = [...original.codigo.html.matchAll(/class="([^"]+)"/g)].flatMap((m) =>
    m[1].split(/\s+/),
  );
  const raizCls = classes[0];
  const semNumero = alvoId.replace(/-?\d+$/, '');
  const candidatos = [
    `${raizCls}__${alvoId}`,
    `${raizCls}__${alvoId.replace(/-([a-z]+)$/, '--$1')}`,
    `${raizCls}__${semNumero}`,
  ];
  const seletor =
    alvoId === original.estrutura.id
      ? raizCls
      : (candidatos.find((x) => classes.includes(x)) ??
        classes.find((x) => x.endsWith(`__${alvoId}`) || x.endsWith(`-${alvoId}`)));
  if (!seletor) {
    avisos.push(`No código não achei a classe de "${no.nome}": o vidro fica só no Figma.`);
  } else {
    const cssCor = (ref: KcxRef<string> | undefined, a: number): string | null => {
      const idVar = ehVar(ref) ? ref.$var : ehDerivada(ref) ? ref.$derivado : null;
      if (idVar) {
        const v = original.variaveis.find((x) => x.id === idVar);
        const cv = v?.vinculos.find((x) => x.alvo.tipo === 'css-var')?.alvo as
          { nome: string } | undefined;
        return cv
          ? `color-mix(in srgb, var(${cv.nome}) ${Math.round(a * 100)}%, transparent)`
          : null;
      }
      return typeof ref === 'string' && corValida(ref) ? comAlpha(ref, a) : null;
    };
    const orig = acharNo(original.estrutura, alvoId)!;
    const p0 = orig.preenchimentos?.[0];
    const fundoCss = !orig.preenchimentos?.length
      ? veu
      : p0?.tipo === 'solido'
        ? cssCor(p0.cor, fundoA)
        : null;
    if (!fundoCss && orig.preenchimentos?.length)
      avisos.push('No código, o fundo em gradiente continua opaco (no Figma fica translúcido).');
    const t = orig.traco;
    const bordaCss = t
      ? cssCor(t.cor ?? (t.pintura?.tipo === 'solido' ? t.pintura.cor : undefined), bordaA)
      : veuBorda;
    c.codigo = {
      ...c.codigo,
      css: `${c.codigo.css}

/* Vidro (glassmorphism) */
.${seletor} {${fundoCss ? `\n  background: ${fundoCss};` : ''}${
        bordaCss ? `\n  outline: 1px solid ${bordaCss};\n  outline-offset: -1px;` : ''
      }
  -webkit-backdrop-filter: blur(${blur}px);
  backdrop-filter: blur(${blur}px);
}`,
    };
  }

  c.compatibilidade = {
    ...c.compatibilidade,
    figma: {
      ...c.compatibilidade.figma,
      editavel: [
        ...(c.compatibilidade.figma.editavel ?? []),
        `Vidro em "${no.nome}": fundo e borda translúcidos e Background blur`,
      ],
    },
  };
  c.metadados = {
    ...c.metadados,
    tags: [...new Set([...c.metadados.tags, 'vidro', 'glassmorphism'])],
  };
  return { comp: c, avisos: [...new Set(avisos)] };
}
