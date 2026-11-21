/**
 * Vidro (glassmorphism) editável em QUALQUER componente KCX: da biblioteca, do
 * construtor de tipos, do montador ou importado do Figma.
 *
 * `comVidroEditavel` acrescenta ao próprio componente as variáveis "Vidro · …"
 * ligadas a uma camada (caixa ou retângulo):
 * - Vidro · fundo (0–1): transparência do fundo da camada;
 * - Vidro · véu (0–1): véu branco, só quando a camada não tem fundo;
 * - Vidro · borda (0–1): transparência da borda (ou contorno branco, se não tinha);
 * - Vidro · desfoque (px): desfoque do que fica atrás.
 *
 * Os valores padrão deixam o componente igual ao original (vidro desligado); o
 * preset "Vidro" liga o efeito. No código vira color-mix + backdrop-filter; no
 * Figma, cores com transparência e Background blur, tudo ligado às variáveis.
 */
import {
  KcxComponente,
  KcxEfeito,
  KcxNo,
  KcxPreenchimento,
  KcxRef,
  KcxValor,
  KcxVariavel,
} from '../kcx.types';
import { corValida } from '../unidades';

export const IDS_VIDRO = {
  fundo: 'vidroFundo',
  veu: 'vidroVeu',
  borda: 'vidroBorda',
  desfoque: 'vidroDesfoque',
  corVeu: 'vidroCorVeu',
} as const;

/** Receita do efeito (o que o preset "Vidro" aplica), por variável. */
export const RECEITA_VIDRO: Record<string, number> = {
  [IDS_VIDRO.fundo]: 0.35,
  [IDS_VIDRO.veu]: 0.14,
  [IDS_VIDRO.borda]: 0.2,
  [IDS_VIDRO.desfoque]: 16,
};
export const PRESET_VIDRO = 'vidro';

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

/** O componente já tem as variáveis de vidro. */
export const temVidroEditavel = (c: KcxComponente) =>
  c.variaveis.some((v) => v.id === IDS_VIDRO.desfoque);

/** Valores que ligam (receita) ou desligam (padrão) o vidro neste componente. */
export function valoresVidro(c: KcxComponente, ligado: boolean): Record<string, KcxValor> {
  const r: Record<string, KcxValor> = {};
  for (const v of c.variaveis)
    if (v.id in RECEITA_VIDRO) r[v.id] = ligado ? RECEITA_VIDRO[v.id] : v.padrao;
  return r;
}

/** Classe CSS da camada no HTML do componente (ou null se não der para achar). */
function seletorDa(comp: KcxComponente, alvoId: string): string | null {
  const classes = [...comp.codigo.html.matchAll(/class="([^"]+)"/g)].flatMap((m) =>
    m[1].split(/\s+/),
  );
  const raiz = classes[0];
  if (!raiz) return null;
  if (alvoId === comp.estrutura.id) return raiz;
  const candidatos = [
    `${raiz}__${alvoId}`,
    `${raiz}__${alvoId.replace(/-([a-z]+)$/, '--$1')}`,
    `${raiz}__${alvoId.replace(/-?\d+$/, '')}`,
  ];
  return (
    candidatos.find((x) => classes.includes(x)) ??
    classes.find((x) => x.endsWith(`__${alvoId}`) || x.endsWith(`-${alvoId}`)) ??
    null
  );
}

export interface ResultadoVidro {
  comp: KcxComponente;
  camada: string;
  /** O que não sai igual no código e no Figma. */
  avisos: string[];
}

/**
 * Acrescenta o vidro editável ao componente (mesmo id, mesmo nome). Com o vidro
 * desligado (valores padrão), o componente fica igual ao original.
 */
export function comVidroEditavel(original: KcxComponente, camada?: string): ResultadoVidro {
  if (temVidroEditavel(original))
    return { comp: original, camada: camada ?? camadaSugerida(original), avisos: [] };
  const avisos: string[] = [];
  const c = structuredClone(original);
  const alvoId = camada && acharNo(c.estrutura, camada) ? camada : camadaSugerida(c);
  const no = acharNo(c.estrutura, alvoId)!;
  const orig = acharNo(original.estrutura, alvoId)!;
  if (!podeVidro(no)) return { comp: original, camada: alvoId, avisos: ['Camada sem caixa.'] };

  const P = `--kcx-${c.id}-vidro`;
  const seletor = seletorDa(original, alvoId);
  const nova = (v: Omit<KcxVariavel, 'valor' | 'exportavel' | 'grupo' | 'secao'>): void => {
    c.variaveis.push({
      ...v,
      valor: v.padrao,
      exportavel: true,
      grupo: 'effects',
      secao: 'aparencia',
    } as KcxVariavel);
  };
  const fracao = (id: string, nome: string, padrao: number, descricao: string, css: string) =>
    nova({
      id,
      nome,
      tipo: 'float',
      padrao,
      min: 0,
      max: 1,
      passo: 0.05,
      descricao,
      vinculos: [
        { propriedade: nome, alvo: { tipo: 'css-var', nome: `${P}-${css}` } },
        ...(seletor
          ? [
              {
                propriedade: `${nome} (liga a regra)`,
                alvo: {
                  tipo: 'atributo' as const,
                  seletor: `.${seletor}`,
                  atributo: `data-kcx-vidro-${css}`,
                },
              },
            ]
          : []),
      ],
    });
  const corVeu = () => {
    if (c.variaveis.some((v) => v.id === IDS_VIDRO.corVeu)) return;
    nova({
      id: IDS_VIDRO.corVeu,
      nome: 'Vidro · cor do véu',
      tipo: 'color',
      padrao: '#ffffff',
      descricao: 'Cor do véu e do contorno do vidro.',
      vinculos: [{ propriedade: 'Cor do véu', alvo: { tipo: 'css-var', nome: `${P}-cor-veu` } }],
    });
  };

  /* ---------- Figma: cores com transparência ligada às variáveis ---------- */
  let k = 0;
  const comAlphaDe = (ref: KcxRef<string>, variavel: string): KcxRef<string> | null => {
    if (ehVar(ref)) {
      if (c.variaveis.find((x) => x.id === ref.$var)?.tipo !== 'color') return null;
      return {
        $derivado: ref.$var,
        nome: `vidro-${++k}`,
        transformar: [{ op: 'alpha', variavel }],
      };
    }
    if (ehDerivada(ref))
      return {
        ...ref,
        nome: `${ref.nome}-vidro`,
        transformar: [...(ref.transformar ?? []), { op: 'alpha', variavel }],
      } as KcxRef<string>;
    if (typeof ref === 'string' && corValida(ref)) {
      const id = `vidroCor${++k}`;
      nova({
        id,
        nome: `Vidro · cor ${k}`,
        tipo: 'color',
        padrao: ref,
        descricao: 'Cor fixa da camada, como variável para receber a transparência do vidro.',
        vinculos: [
          { propriedade: 'Cor da camada', alvo: { tipo: 'css-var', nome: `${P}-cor-${k}` } },
        ],
      });
      return { $derivado: id, nome: `vidro-${k}`, transformar: [{ op: 'alpha', variavel }] };
    }
    return null;
  };
  /** Cor em CSS a partir da referência original (variável com css-var ou hex fixo). */
  const cssCor = (ref: KcxRef<string> | undefined): string | null => {
    const id = ehVar(ref) ? ref.$var : ehDerivada(ref) ? ref.$derivado : null;
    if (id) {
      const v = original.variaveis.find((x) => x.id === id);
      const cv = v?.vinculos.find((x) => x.alvo.tipo === 'css-var')?.alvo as
        { nome: string } | undefined;
      return cv ? `var(${cv.nome})` : null;
    }
    return typeof ref === 'string' && corValida(ref) ? ref : null;
  };
  /** Regras só valem quando a variável sai do padrão (padrão = como o original). */
  const regras: string[] = [];
  const regra = (css: string, padrao: number, decl: string[]) =>
    regras.push(
      `.${seletor}[data-kcx-vidro-${css}]:not([data-kcx-vidro-${css}='${padrao}']) {\n${decl.map((d) => `  ${d}`).join('\n')}\n}`,
    );

  /* fundo */
  if (no.preenchimentos?.length) {
    fracao(IDS_VIDRO.fundo, 'Vidro · fundo', 1, 'Opacidade do fundo (1 = sólido).', 'fundo');
    let algum = false;
    const marcar = <T>(r: T | null, x: T): T => {
      if (r) algum = true;
      return r ?? x;
    };
    no.preenchimentos = no.preenchimentos.map((p): KcxPreenchimento => {
      if (p.tipo === 'solido')
        return { ...p, cor: marcar(comAlphaDe(p.cor, IDS_VIDRO.fundo), p.cor) };
      if (p.tipo === 'gradiente-linear' || p.tipo === 'gradiente-conico')
        return {
          ...p,
          paradas: p.paradas.map((x) => ({
            ...x,
            cor: marcar(comAlphaDe(x.cor, IDS_VIDRO.fundo), x.cor),
          })),
        };
      return p;
    });
    if (!algum) avisos.push('O fundo desta camada vem de um gradiente variável: continua opaco.');
    const p0 = orig.preenchimentos![0];
    const base = p0.tipo === 'solido' ? cssCor(p0.cor) : null;
    if (base)
      regra('fundo', 1, [
        `background: color-mix(in srgb, ${base} calc(var(${P}-fundo) * 100%), transparent);`,
      ]);
    else if (seletor)
      avisos.push('No código, o fundo em gradiente continua opaco (no Figma fica translúcido).');
  } else {
    fracao(IDS_VIDRO.veu, 'Vidro · véu', 0, 'Véu branco atrás do conteúdo.', 'veu');
    corVeu();
    no.preenchimentos = [
      {
        tipo: 'solido',
        cor: {
          $derivado: IDS_VIDRO.corVeu,
          nome: 'vidro-veu',
          transformar: [{ op: 'alpha', variavel: IDS_VIDRO.veu }],
        },
      },
    ];
    regra('veu', 0, [
      `background: color-mix(in srgb, var(${P}-cor-veu) calc(var(${P}-veu) * 100%), transparent);`,
    ]);
  }

  /* borda */
  const t = no.traco;
  const corT = t?.cor ?? (t?.pintura?.tipo === 'solido' ? t.pintura.cor : undefined);
  if (t && corT !== undefined) {
    fracao(IDS_VIDRO.borda, 'Vidro · borda', 1, 'Opacidade da borda (1 = como era).', 'borda');
    const r = comAlphaDe(corT, IDS_VIDRO.borda);
    if (r)
      no.traco =
        t.cor !== undefined ? { ...t, cor: r } : { ...t, pintura: { tipo: 'solido', cor: r } };
    const base = cssCor(corT);
    if (base)
      regra('borda', 1, [
        `border-color: color-mix(in srgb, ${base} calc(var(${P}-borda) * 100%), transparent);`,
      ]);
  } else if (!t) {
    fracao(
      IDS_VIDRO.borda,
      'Vidro · borda',
      0,
      'Contorno claro do vidro (0 = sem contorno).',
      'borda',
    );
    corVeu();
    no.traco = {
      cor: {
        $derivado: IDS_VIDRO.corVeu,
        nome: 'vidro-contorno',
        transformar: [{ op: 'alpha', variavel: IDS_VIDRO.borda }],
      },
      espessura: 1,
    };
    regra('borda', 0, [
      `outline: 1px solid color-mix(in srgb, var(${P}-cor-veu) calc(var(${P}-borda) * 100%), transparent);`,
      'outline-offset: -1px;',
    ]);
  }

  /* desfoque */
  nova({
    id: IDS_VIDRO.desfoque,
    nome: 'Vidro · desfoque',
    tipo: 'dimension',
    padrao: 0,
    min: 0,
    max: 40,
    passo: 1,
    unidade: 'px',
    descricao: 'Desfoque do que fica atrás (0 = sem vidro). No Figma: Background blur.',
    vinculos: [
      {
        propriedade: 'Desfoque do fundo',
        alvo: { tipo: 'css-var', nome: `${P}-desfoque` },
        unidadeSaida: 'px',
      },
      ...(seletor
        ? [
            {
              propriedade: 'Liga o desfoque',
              alvo: {
                tipo: 'atributo' as const,
                seletor: `.${seletor}`,
                atributo: 'data-kcx-vidro-desfoque',
              },
            },
          ]
        : []),
    ],
  });
  const efeitos: KcxEfeito[] = (no.efeitos ?? []).filter((e) => e.tipo !== 'desfoque-fundo');
  // O raio do Background blur no Figma é o dobro do blur() do CSS.
  efeitos.push({
    tipo: 'desfoque-fundo',
    raio: {
      $derivado: IDS_VIDRO.desfoque,
      nome: 'vidro-desfoque',
      transformar: [{ op: 'multiplicar', fator: 2 }],
    },
  });
  no.efeitos = efeitos;

  /* ---------- Código ---------- */
  if (!seletor) {
    avisos.push(`No código não achei a classe de "${no.nome}": o vidro fica só no Figma.`);
  } else {
    // backdrop-filter só com desfoque > 0: senão vira bloco de contenção e
    // quebraria filhos com position: fixed (modais, menus).
    c.codigo = {
      ...c.codigo,
      css: `${c.codigo.css}

/* Vidro (glassmorphism): variáveis "Vidro · …". Cada regra só vale quando a
   variável sai do padrão, então o padrão fica igual ao original. */
${[
  ...regras,
  `.${seletor}[data-kcx-vidro-desfoque]:not([data-kcx-vidro-desfoque='0']) {\n  -webkit-backdrop-filter: blur(var(${P}-desfoque));\n  backdrop-filter: blur(var(${P}-desfoque));\n}`,
].join('\n')}`,
    };
  }

  c.presets = [
    ...c.presets.filter((p) => p.id !== PRESET_VIDRO),
    {
      id: PRESET_VIDRO,
      nome: 'Vidro (glassmorphism)',
      descricao: `Fundo e borda translúcidos e desfoque em "${no.nome}".`,
      valores: valoresVidro(c, true),
    },
  ];
  c.compatibilidade = {
    ...c.compatibilidade,
    figma: {
      ...c.compatibilidade.figma,
      editavel: [
        ...(c.compatibilidade.figma.editavel ?? []),
        `Vidro em "${no.nome}": transparência e Background blur ligados às variáveis Vidro`,
      ],
    },
  };
  return { comp: c, camada: alvoId, avisos: [...new Set(avisos)] };
}
