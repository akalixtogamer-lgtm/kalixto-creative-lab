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
  // Modelo do efeito Glass do Figma
  luz: 'vidroLuz',
  angulo: 'vidroAngulo',
  refracao: 'vidroRefracao',
  profundidade: 'vidroProfundidade',
  dispersao: 'vidroDispersao',
  splay: 'vidroSplay',
} as const;

/**
 * Ajustes de vidro no modelo do painel Glass do Figma: luz (ângulo e
 * intensidade), refração, profundidade, dispersão, gelo (desfoque) e splay,
 * mais fundo, véu e borda. Valores de 0 a 1, exceto ângulo (graus),
 * profundidade (1–100) e desfoque (px).
 */
export type AjustesVidro = Partial<Record<keyof typeof IDS_VIDRO, number>>;

export interface PresetVidro {
  id: string;
  nome: string;
  descricao: string;
  ajustes: AjustesVidro;
}

/** Vidros prontos (o primeiro é o que o botão "Aplicar efeito vidro" usa). */
export const PRESETS_VIDRO: PresetVidro[] = [
  {
    id: 'liquido',
    nome: 'Líquido (Figma)',
    descricao: 'O padrão do efeito Glass do Figma: luz a −45°, refração forte e pouco gelo.',
    ajustes: {
      fundo: 0.25,
      veu: 0.08,
      borda: 0.25,
      desfoque: 4,
      luz: 0.8,
      angulo: -45,
      refracao: 0.8,
      profundidade: 20,
      dispersao: 0.5,
      splay: 0,
    },
  },
  {
    id: 'fosco',
    nome: 'Fosco',
    descricao: 'Glassmorphism clássico: bastante desfoque, véu claro e borda fina.',
    ajustes: {
      fundo: 0.35,
      veu: 0.14,
      borda: 0.2,
      desfoque: 16,
      luz: 0.3,
      angulo: -45,
      refracao: 0.2,
      profundidade: 10,
      dispersao: 0,
      splay: 0.2,
    },
  },
  {
    id: 'gelo',
    nome: 'Gelo',
    descricao: 'Muito desfoque e véu branco: lê bem sobre fotos agitadas.',
    ajustes: {
      fundo: 0.5,
      veu: 0.3,
      borda: 0.35,
      desfoque: 28,
      luz: 0.5,
      angulo: -60,
      refracao: 0.1,
      profundidade: 30,
      dispersao: 0.1,
      splay: 0.6,
    },
  },
  {
    id: 'cristal',
    nome: 'Cristal',
    descricao: 'Quase transparente, com brilho forte nas bordas e cores separadas (arco-íris).',
    ajustes: {
      fundo: 0.1,
      veu: 0.04,
      borda: 0.4,
      desfoque: 2,
      luz: 1,
      angulo: -30,
      refracao: 1,
      profundidade: 40,
      dispersao: 1,
      splay: 0.1,
    },
  },
  {
    id: 'fumaca',
    nome: 'Fumê',
    descricao: 'Vidro escuro para fundos claros: véu preto e luz suave.',
    ajustes: {
      fundo: 0.45,
      veu: 0.25,
      borda: 0.15,
      desfoque: 12,
      luz: 0.25,
      angulo: -45,
      refracao: 0.3,
      profundidade: 15,
      dispersao: 0,
      splay: 0.3,
    },
  },
];

/** Ajustes → valores por id de variável. */
export function valoresDosAjustes(a: AjustesVidro): Record<string, number> {
  const r: Record<string, number> = {};
  for (const [k, v] of Object.entries(a))
    if (typeof v === 'number' && Number.isFinite(v)) r[IDS_VIDRO[k as keyof typeof IDS_VIDRO]] = v;
  return r;
}

/** Receita do efeito (o que o preset "Vidro" aplica), por variável. */
export const RECEITA_VIDRO: Record<string, number> = valoresDosAjustes(PRESETS_VIDRO[0].ajustes);
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

/** Valores que ligam (receita ou ajustes dados) ou desligam (padrão) o vidro neste componente. */
export function valoresVidro(
  c: KcxComponente,
  ligado: boolean,
  ajustes?: AjustesVidro,
): Record<string, KcxValor> {
  const receita = ajustes ? valoresDosAjustes(ajustes) : RECEITA_VIDRO;
  const r: Record<string, KcxValor> = {};
  for (const v of c.variaveis) if (v.id in receita) r[v.id] = ligado ? receita[v.id] : v.padrao;
  return r;
}

/** Ajustes atuais do vidro (para salvar como estilo e aplicar em outro componente). */
export function ajustesAtuais(c: KcxComponente, valores: Record<string, KcxValor>): AjustesVidro {
  const a: AjustesVidro = {};
  for (const [k, id] of Object.entries(IDS_VIDRO)) {
    if (k === 'corVeu') continue;
    const v = c.variaveis.find((x) => x.id === id);
    if (!v) continue;
    const x = Number(valores[id] ?? v.valor);
    if (Number.isFinite(x)) a[k as keyof AjustesVidro] = x;
  }
  return a;
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

  /* luz, refração, profundidade, dispersão e splay (modelo Glass do Figma) */
  const gatilho = (css: string) =>
    seletor
      ? [
          {
            propriedade: 'Liga a regra',
            alvo: {
              tipo: 'atributo' as const,
              seletor: `.${seletor}`,
              atributo: `data-kcx-vidro-${css}`,
            },
          },
        ]
      : [];
  const ajuste = (
    id: string,
    nome: string,
    css: string,
    descricao: string,
    o: {
      padrao: number;
      min: number;
      max: number;
      passo: number;
      tipo?: 'float' | 'number';
      unidade?: string;
      ligar?: boolean;
    },
  ) =>
    nova({
      id,
      nome,
      tipo: o.tipo ?? 'float',
      padrao: o.padrao,
      min: o.min,
      max: o.max,
      passo: o.passo,
      ...(o.unidade ? { unidade: o.unidade } : {}),
      descricao,
      vinculos: [
        {
          propriedade: nome,
          alvo: { tipo: 'css-var', nome: `${P}-${css}` },
          ...(o.unidade ? { unidadeSaida: o.unidade } : {}),
        },
        ...(o.ligar ? gatilho(css) : []),
      ],
    } as Omit<KcxVariavel, 'valor' | 'exportavel' | 'grupo' | 'secao'>);
  ajuste(
    IDS_VIDRO.luz,
    'Vidro · luz',
    'luz',
    'Intensidade do brilho da luz nas bordas (0 = sem luz).',
    { padrao: 0, min: 0, max: 1, passo: 0.05, ligar: true },
  );
  ajuste(
    IDS_VIDRO.angulo,
    'Vidro · ângulo da luz',
    'angulo',
    'De onde vem a luz, em graus (−45° = de cima, à esquerda).',
    { padrao: -45, min: -180, max: 180, passo: 1, tipo: 'number', unidade: 'deg' },
  );
  ajuste(
    IDS_VIDRO.refracao,
    'Vidro · refração',
    'refracao',
    'Quanto o vidro curva e realça o que está atrás (0 a 1).',
    { padrao: 0, min: 0, max: 1, passo: 0.05, ligar: true },
  );
  ajuste(
    IDS_VIDRO.profundidade,
    'Vidro · profundidade',
    'profundidade',
    'Espessura aparente do vidro (1 a 100).',
    { padrao: 20, min: 1, max: 100, passo: 1, tipo: 'number' },
  );
  ajuste(
    IDS_VIDRO.dispersao,
    'Vidro · dispersão',
    'dispersao',
    'Separação de cores nas bordas, como um prisma (0 a 1).',
    { padrao: 0.5, min: 0, max: 1, passo: 0.05 },
  );
  ajuste(
    IDS_VIDRO.splay,
    'Vidro · splay',
    'splay',
    'Quanto a luz se espalha pela superfície (0 a 1).',
    { padrao: 0, min: 0, max: 1, passo: 0.05 },
  );
  const v = (css: string) => `var(${P}-${css})`;
  regras.push(
    `.${seletor}[data-kcx-vidro-luz]:not([data-kcx-vidro-luz='0']) {
  --kcx-vidro-d: calc(${v('profundidade')} * 0.12px + 1px);
  --kcx-vidro-s: calc(var(--kcx-vidro-d) * (1 + ${v('splay')} * 4));
  box-shadow:
    inset calc(cos(${v('angulo')}) * var(--kcx-vidro-d)) calc(sin(${v('angulo')}) * var(--kcx-vidro-d) * -1) var(--kcx-vidro-s) calc(var(--kcx-vidro-d) * -0.25) rgb(255 255 255 / calc(${v('luz')} * 0.9)),
    inset calc(cos(${v('angulo')}) * var(--kcx-vidro-d) * -1) calc(sin(${v('angulo')}) * var(--kcx-vidro-d)) var(--kcx-vidro-s) calc(var(--kcx-vidro-d) * -0.25) rgb(255 255 255 / calc(${v('luz')} * 0.25)),
    inset calc(${v('dispersao')} * 2.5px) 0 calc(${v('dispersao')} * 3px) rgb(255 0 90 / calc(${v('dispersao')} * ${v('luz')} * 0.45)),
    inset calc(${v('dispersao')} * -2.5px) 0 calc(${v('dispersao')} * 3px) rgb(0 210 255 / calc(${v('dispersao')} * ${v('luz')} * 0.45)),
    0 calc(var(--kcx-vidro-d) * 1.5) calc(var(--kcx-vidro-d) * 4) rgb(0 0 0 / 0.18);
}`,
  );

  /* desfoque (gelo) */
  nova({
    id: IDS_VIDRO.desfoque,
    nome: 'Vidro · gelo (desfoque)',
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
    // No Figma vira o efeito Glass nativo quando há luz ou refração.
    vidro: {
      luz: { $var: IDS_VIDRO.luz },
      angulo: { $var: IDS_VIDRO.angulo },
      refracao: { $var: IDS_VIDRO.refracao },
      profundidade: { $var: IDS_VIDRO.profundidade },
      dispersao: { $var: IDS_VIDRO.dispersao },
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
  `.${seletor}:is([data-kcx-vidro-desfoque]:not([data-kcx-vidro-desfoque='0']), [data-kcx-vidro-refracao]:not([data-kcx-vidro-refracao='0'])) {\n  --kcx-vidro-filtro: blur(var(${P}-desfoque)) saturate(calc(1 + var(${P}-refracao) * 0.8)) brightness(calc(1 + var(${P}-refracao) * 0.08)) contrast(calc(1 + var(${P}-refracao) * 0.1));\n  -webkit-backdrop-filter: var(--kcx-vidro-filtro);\n  backdrop-filter: var(--kcx-vidro-filtro);\n}`,
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
