/**
 * Sistema de ajuste da reconstrução.
 *
 * Cada ajuste (elemento + propriedade + valor) vira uma VARIÁVEL KCX ligada a
 * uma custom property, e uma regra CSS no fim do código do componente usa essa
 * custom property. Resultado: o componente salvo continua 100% editável pelo
 * editor, por presets e pelo runtime exportado (KCX.set), e mudar o valor no
 * comparador não recarrega o preview.
 *
 * As regras usam `:not(#kcx-ajuste)` para ganhar do CSS do componente sem
 * `!important` — assim uma animação que já mexe na mesma propriedade continua
 * mandando nela enquanto roda.
 */
import type {
  KcxComponente,
  KcxGrupo,
  KcxOpcao,
  KcxSecao,
  KcxTipoVariavel,
  KcxValor,
  KcxVariavel,
} from '../kcx.types';
import { corHex, corValida, lerCor } from '../unidades';
import { EASINGS_COMUNS } from './easing';
import type { Ajuste, EscopoAjuste, MedicaoElemento, PropriedadeAjuste } from './tipos';

export interface DefinicaoAjuste {
  id: PropriedadeAjuste;
  nome: string;
  /** Grupo no painel de ajuste. */
  grupo: 'Posição' | 'Dimensão' | 'Espaçamento' | 'Cor' | 'Efeitos' | 'Transformação' | 'Movimento';
  tipo: KcxTipoVariavel;
  unidade?: 'px' | 'ms' | 'deg' | 'x' | '';
  min?: number;
  max?: number;
  passo?: number;
  kcxGrupo: KcxGrupo;
  secao: KcxSecao;
  descricao: string;
}

export const AJUSTES: DefinicaoAjuste[] = [
  {
    id: 'x',
    nome: 'Posição X',
    grupo: 'Posição',
    tipo: 'dimension',
    unidade: 'px',
    min: -800,
    max: 800,
    passo: 1,
    kcxGrupo: 'dimensions',
    secao: 'aparencia',
    descricao: 'Desloca o elemento na horizontal (translate).',
  },
  {
    id: 'y',
    nome: 'Posição Y',
    grupo: 'Posição',
    tipo: 'dimension',
    unidade: 'px',
    min: -800,
    max: 800,
    passo: 1,
    kcxGrupo: 'dimensions',
    secao: 'aparencia',
    descricao: 'Desloca o elemento na vertical (translate).',
  },
  {
    id: 'largura',
    nome: 'Largura',
    grupo: 'Dimensão',
    tipo: 'dimension',
    unidade: 'px',
    min: 0,
    max: 2400,
    passo: 1,
    kcxGrupo: 'dimensions',
    secao: 'aparencia',
    descricao: 'Largura do elemento.',
  },
  {
    id: 'altura',
    nome: 'Altura',
    grupo: 'Dimensão',
    tipo: 'dimension',
    unidade: 'px',
    min: 0,
    max: 2400,
    passo: 1,
    kcxGrupo: 'dimensions',
    secao: 'aparencia',
    descricao: 'Altura do elemento.',
  },
  {
    id: 'padding',
    nome: 'Respiro interno',
    grupo: 'Espaçamento',
    tipo: 'dimension',
    unidade: 'px',
    min: 0,
    max: 240,
    passo: 1,
    kcxGrupo: 'spacing',
    secao: 'aparencia',
    descricao: 'Padding nos quatro lados.',
  },
  {
    id: 'gap',
    nome: 'Espaço entre itens',
    grupo: 'Espaçamento',
    tipo: 'dimension',
    unidade: 'px',
    min: 0,
    max: 240,
    passo: 1,
    kcxGrupo: 'spacing',
    secao: 'aparencia',
    descricao: 'Gap entre os filhos (flex ou grid).',
  },
  {
    id: 'corTexto',
    nome: 'Cor do texto',
    grupo: 'Cor',
    tipo: 'color',
    kcxGrupo: 'colors',
    secao: 'aparencia',
    descricao: 'Cor do texto do elemento.',
  },
  {
    id: 'corFundo',
    nome: 'Cor de fundo',
    grupo: 'Cor',
    tipo: 'color',
    kcxGrupo: 'colors',
    secao: 'aparencia',
    descricao: 'Fundo do elemento (substitui o fundo original).',
  },
  {
    id: 'opacidade',
    nome: 'Opacidade',
    grupo: 'Cor',
    tipo: 'float',
    unidade: '',
    min: 0,
    max: 1,
    passo: 0.01,
    kcxGrupo: 'effects',
    secao: 'aparencia',
    descricao: 'Transparência do elemento (0 = invisível).',
  },
  {
    id: 'blur',
    nome: 'Desfoque (blur)',
    grupo: 'Efeitos',
    tipo: 'dimension',
    unidade: 'px',
    min: 0,
    max: 60,
    passo: 0.5,
    kcxGrupo: 'effects',
    secao: 'aparencia',
    descricao: 'filter: blur().',
  },
  {
    id: 'sombra',
    nome: 'Sombra (raio)',
    grupo: 'Efeitos',
    tipo: 'dimension',
    unidade: 'px',
    min: 0,
    max: 160,
    passo: 1,
    kcxGrupo: 'effects',
    secao: 'aparencia',
    descricao: 'Raio da sombra (box-shadow).',
  },
  {
    id: 'corSombra',
    nome: 'Cor da sombra',
    grupo: 'Efeitos',
    tipo: 'color',
    kcxGrupo: 'effects',
    secao: 'aparencia',
    descricao: 'Cor da sombra (box-shadow).',
  },
  {
    id: 'escala',
    nome: 'Escala',
    grupo: 'Transformação',
    tipo: 'float',
    unidade: 'x',
    min: 0.05,
    max: 4,
    passo: 0.01,
    kcxGrupo: 'effects',
    secao: 'aparencia',
    descricao: 'scale (soma com a transform da animação).',
  },
  {
    id: 'rotacao',
    nome: 'Rotação',
    grupo: 'Transformação',
    tipo: 'float',
    unidade: 'deg',
    min: -180,
    max: 180,
    passo: 0.5,
    kcxGrupo: 'effects',
    secao: 'aparencia',
    descricao: 'rotate em graus (soma com a transform da animação).',
  },
  {
    id: 'duracao',
    nome: 'Duração',
    grupo: 'Movimento',
    tipo: 'time',
    unidade: 'ms',
    min: 0,
    max: 20000,
    passo: 10,
    kcxGrupo: 'motion',
    secao: 'animacao',
    descricao: 'Duração das animações e transições do elemento.',
  },
  {
    id: 'delay',
    nome: 'Atraso (delay)',
    grupo: 'Movimento',
    tipo: 'time',
    unidade: 'ms',
    min: -10000,
    max: 10000,
    passo: 10,
    kcxGrupo: 'motion',
    secao: 'animacao',
    descricao: 'Atraso antes de começar.',
  },
  {
    id: 'easing',
    nome: 'Curva (easing)',
    grupo: 'Movimento',
    tipo: 'enum',
    kcxGrupo: 'motion',
    secao: 'animacao',
    descricao: 'Aceleração do movimento.',
  },
  {
    id: 'velocidade',
    nome: 'Velocidade',
    grupo: 'Movimento',
    tipo: 'float',
    unidade: 'x',
    min: 0.1,
    max: 4,
    passo: 0.05,
    kcxGrupo: 'motion',
    secao: 'animacao',
    descricao: '2 = duas vezes mais rápido (divide a duração).',
  },
  {
    id: 'gatilho',
    nome: 'Gatilho (trigger)',
    grupo: 'Movimento',
    tipo: 'enum',
    kcxGrupo: 'motion',
    secao: 'comportamento',
    descricao: 'Quando a animação do elemento começa.',
  },
];

export const GATILHOS: KcxOpcao[] = [
  { valor: 'carregar', rotulo: 'Ao carregar' },
  { valor: 'hover', rotulo: 'Ao passar o mouse' },
  { valor: 'clique', rotulo: 'Ao clicar' },
  { valor: 'visivel', rotulo: 'Ao aparecer na tela (scroll)' },
];

export const definicaoAjuste = (p: PropriedadeAjuste) => AJUSTES.find((a) => a.id === p)!;

/** Só seletores simples: nada de chaves, ponto e vírgula ou tags. */
const SELETOR_OK = /^[a-zA-Z0-9_\-.#:>\s()[\]="'*+~,^$|]+$/;
export function seletorSeguro(s: string): boolean {
  return !!s && s.length <= 300 && SELETOR_OK.test(s) && !/<|\/\*|\*\//.test(s);
}

let contador = 0;
/** Id de ajuste: também é o id da variável (camelCase só com minúsculas). */
export function novoIdAjuste(): string {
  contador = (contador + 1) % 1296;
  return `aj${Date.now().toString(36)}${contador.toString(36)}`.replace(/[^a-z0-9]/g, '');
}

const nomeVar = (a: Ajuste) => `--kcx-${a.id}`;
const ref = (a: Ajuste | undefined, padrao: string) => (a ? `var(${nomeVar(a)})` : padrao);

function opcoesEasing(atual: string): KcxOpcao[] {
  const base = EASINGS_COMUNS.map((e) => ({ valor: e.valor, rotulo: e.nome }));
  if (atual && !base.some((o) => o.valor === atual))
    base.unshift({ valor: atual, rotulo: `${atual} (medido)` });
  return base;
}

function hexDe(c: string, reserva: string): string {
  try {
    return corValida(c) && lerCor(c).a > 0.02 ? corHex(lerCor(c)) : reserva;
  } catch {
    return reserva;
  }
}

/** Valor inicial do ajuste: o que o elemento já tem (medido no iframe). */
export function valorInicial(p: PropriedadeAjuste, m?: MedicaoElemento): KcxValor {
  const anim = m?.animacoes[0];
  const trans = m?.transicoes[0];
  switch (p) {
    case 'x':
    case 'y':
    case 'blur':
      return 0;
    case 'largura':
      return Math.round(m?.caixa.largura ?? 200);
    case 'altura':
      return Math.round(m?.caixa.altura ?? 120);
    case 'padding':
      return Math.round(m?.padding ?? 0);
    case 'gap':
      return Math.round(m?.gap ?? 0);
    case 'corTexto':
      return hexDe(m?.corTexto ?? '', '#ffffff');
    case 'corFundo':
      return hexDe(m?.corFundo ?? '', '#1a1530');
    case 'opacidade':
      return Math.round((m?.opacidade ?? 1) * 100) / 100;
    case 'sombra':
      return 24;
    case 'corSombra':
      return '#00000066';
    case 'escala':
    case 'velocidade':
      return 1;
    case 'rotacao':
      return 0;
    case 'duracao':
      return Math.round(anim?.duracao ?? trans?.duracao ?? 600);
    case 'delay':
      return Math.round(anim?.atraso ?? trans?.atraso ?? 0);
    case 'easing':
      return anim?.easing ?? trans?.easing ?? 'ease';
    case 'gatilho':
      return 'carregar';
  }
}

/** Limita o valor ao intervalo da propriedade. */
export function normalizarAjuste(a: Ajuste): Ajuste {
  const d = definicaoAjuste(a.propriedade);
  let valor = a.valor;
  if (d.tipo === 'color') valor = hexDe(String(valor), String(valorInicial(a.propriedade)));
  else if (d.id === 'gatilho') valor = GATILHOS.some((g) => g.valor === valor) ? valor : 'carregar';
  else if (d.id === 'easing') valor = typeof valor === 'string' && valor ? valor : 'ease';
  else {
    let n = Number(valor);
    if (!Number.isFinite(n)) n = Number(valorInicial(a.propriedade));
    if (d.min !== undefined) n = Math.max(d.min, n);
    if (d.max !== undefined) n = Math.min(d.max, n);
    valor = Math.round(n * 1000) / 1000;
  }
  const escopo: EscopoAjuste =
    a.escopo?.tipo === 'ate' || a.escopo?.tipo === 'acima'
      ? {
          tipo: a.escopo.tipo,
          largura: Math.min(4000, Math.max(200, Math.round(a.escopo.largura ?? 768))),
        }
      : { tipo: 'todos' };
  return { ...a, valor, escopo };
}

function variavelDoAjuste(a: Ajuste): KcxVariavel {
  const d = definicaoAjuste(a.propriedade);
  const base: KcxVariavel = {
    id: a.id,
    nome: `${a.elemento} · ${d.nome}`,
    tipo: d.tipo,
    padrao: a.valor,
    valor: a.valor,
    descricao: `Ajuste da reconstrução em ${a.seletor}: ${d.descricao}${a.escopo.tipo === 'todos' ? '' : ` Só ${a.escopo.tipo === 'ate' ? 'até' : 'acima de'} ${a.escopo.largura}px de largura.`}`,
    grupo: d.kcxGrupo,
    secao: d.secao,
    // Ajuste de código: fica no lab e no código exportado, fora dos tokens do Figma.
    exportavel: false,
    vinculos: [],
  };
  if (d.unidade !== undefined) base.unidade = d.unidade;
  if (d.min !== undefined) base.min = d.min;
  if (d.max !== undefined) base.max = d.max;
  if (d.passo !== undefined) base.passo = d.passo;
  if (d.id === 'easing') base.opcoes = opcoesEasing(String(a.valor));
  if (d.id === 'gatilho') {
    base.opcoes = GATILHOS;
    base.vinculos.push({
      propriedade: 'Gatilho da animação',
      alvo: { tipo: 'atributo', seletor: a.seletor, atributo: 'data-kcx-gatilho' },
    });
    return base;
  }
  const saida =
    d.unidade === 'px' ? 'px' : d.unidade === 'ms' ? 'ms' : d.unidade === 'deg' ? 'deg' : undefined;
  base.vinculos.push({
    propriedade: d.nome,
    alvo: { tipo: 'css-var', nome: nomeVar(a) },
    ...(saida ? { unidadeSaida: saida } : {}),
  });
  return base;
}

function declaracoes(grupo: Ajuste[]): string[] {
  const por = (p: PropriedadeAjuste) => grupo.find((a) => a.propriedade === p);
  const d: string[] = [];
  const x = por('x');
  const y = por('y');
  if (x || y) d.push(`translate: ${ref(x, '0px')} ${ref(y, '0px')};`);
  if (por('largura')) d.push(`width: ${ref(por('largura'), 'auto')};`);
  if (por('altura')) d.push(`height: ${ref(por('altura'), 'auto')};`);
  if (por('padding')) d.push(`padding: ${ref(por('padding'), '0')};`);
  if (por('gap')) d.push(`gap: ${ref(por('gap'), '0')};`);
  if (por('corTexto')) d.push(`color: ${ref(por('corTexto'), 'inherit')};`);
  if (por('corFundo')) d.push(`background: ${ref(por('corFundo'), 'none')};`);
  if (por('opacidade')) d.push(`opacity: ${ref(por('opacidade'), '1')};`);
  if (por('blur')) d.push(`filter: blur(${ref(por('blur'), '0px')});`);
  if (por('sombra') || por('corSombra'))
    d.push(
      `box-shadow: 0 0 ${ref(por('sombra'), '24px')} ${ref(por('corSombra'), 'rgb(0 0 0 / 40%)')};`,
    );
  if (por('escala')) d.push(`scale: ${ref(por('escala'), '1')};`);
  if (por('rotacao')) d.push(`rotate: ${ref(por('rotacao'), '0deg')};`);
  const dur = por('duracao');
  const vel = por('velocidade');
  if (dur || vel) {
    const base = dur ? `var(${nomeVar(dur)})` : `${Math.max(1, Math.round(vel?.base ?? 1000))}ms`;
    const v = vel ? `calc(${base} / var(${nomeVar(vel)}))` : base;
    d.push(`animation-duration: ${v};`, `transition-duration: ${v};`);
  }
  if (por('delay'))
    d.push(
      `animation-delay: ${ref(por('delay'), '0ms')};`,
      `transition-delay: ${ref(por('delay'), '0ms')};`,
    );
  if (por('easing'))
    d.push(
      `animation-timing-function: ${ref(por('easing'), 'ease')};`,
      `transition-timing-function: ${ref(por('easing'), 'ease')};`,
    );
  return d;
}

function envolver(escopo: EscopoAjuste, css: string): string {
  if (escopo.tipo === 'todos') return css;
  const q =
    escopo.tipo === 'ate'
      ? `max-width: ${escopo.largura}px`
      : `min-width: ${(escopo.largura ?? 768) + 1}px`;
  return `@media (${q}) {\n${css.replace(/^/gm, '  ')}\n}`;
}

export const MARCA_CSS = '/* KCX · ajustes da reconstrução */';
export const MARCA_JS = '/* KCX · gatilhos da reconstrução */';

/** O CSS dos ajustes (agrupado por elemento e breakpoint). */
export function cssDosAjustes(ajustes: Ajuste[]): string {
  const grupos = new Map<string, Ajuste[]>();
  for (const a of ajustes) {
    const k = `${a.seletor}§${a.escopo.tipo}§${a.escopo.largura ?? ''}`;
    grupos.set(k, [...(grupos.get(k) ?? []), a]);
  }
  const blocos: string[] = [];
  for (const g of grupos.values()) {
    const sel = g[0].seletor
      .split(',')
      .map((s) => `${s.trim()}:not(#kcx-ajuste)`)
      .join(', ');
    const decl = declaracoes(g);
    const partes: string[] = [];
    if (decl.length) partes.push(`${sel} {\n${decl.map((x) => `  ${x}`).join('\n')}\n}`);
    if (g.some((a) => a.propriedade === 'gatilho')) {
      const s = g[0].seletor;
      const espera = `${s}[data-kcx-gatilho]:not([data-kcx-gatilho='carregar']):not([data-kcx-disparado])`;
      partes.push(
        `${espera}, ${espera} * {\n  animation-play-state: paused;\n}\n${s}[data-kcx-gatilho='hover']:hover, ${s}[data-kcx-gatilho='hover']:hover * {\n  animation-play-state: running;\n}`,
      );
    }
    if (partes.length) blocos.push(envolver(g[0].escopo, partes.join('\n')));
  }
  return blocos.length ? `${MARCA_CSS}\n${blocos.join('\n')}` : '';
}

/** Script que dispara as animações por clique ou ao aparecer na tela. */
export const JS_GATILHOS = `${MARCA_JS}
(function () {
  document.addEventListener('click', function (e) {
    var el = e.target && e.target.closest ? e.target.closest('[data-kcx-gatilho="clique"]') : null;
    if (!el) return;
    el.setAttribute('data-kcx-disparado', '');
    (el.getAnimations ? el.getAnimations({ subtree: true }) : []).forEach(function (a) { a.cancel(); a.play(); });
  }, true);
  if (!('IntersectionObserver' in window)) return;
  var io = new IntersectionObserver(function (lista) {
    lista.forEach(function (en) { if (en.isIntersecting) en.target.setAttribute('data-kcx-disparado', ''); });
  }, { threshold: 0.3 });
  function observar() {
    document.querySelectorAll('[data-kcx-gatilho="visivel"]').forEach(function (el) { io.observe(el); });
  }
  observar();
  new MutationObserver(observar).observe(document.documentElement, { subtree: true, attributes: true, attributeFilter: ['data-kcx-gatilho'] });
})();`;

/** Tira do código um bloco de ajustes que já existia (para não duplicar). */
function semBlocoAnterior(codigo: string, marca: string): string {
  const i = codigo.indexOf(marca);
  return i === -1 ? codigo : codigo.slice(0, i).trimEnd();
}

/**
 * O componente com os ajustes aplicados: variáveis novas + CSS (+ JS de
 * gatilho). Ajustes com seletor inseguro são ignorados (e listados em `ignorados`).
 */
export function aplicarAjustes(
  base: KcxComponente,
  ajustes: Ajuste[],
): { comp: KcxComponente; ignorados: Ajuste[] } {
  const validos: Ajuste[] = [];
  const ignorados: Ajuste[] = [];
  const ids = new Set(base.variaveis.map((v) => v.id));
  for (const bruto of ajustes) {
    const a = normalizarAjuste(bruto);
    if (!seletorSeguro(a.seletor) || ids.has(a.id) || !/^[a-z][a-z0-9]*$/.test(a.id))
      ignorados.push(bruto);
    else {
      validos.push(a);
      ids.add(a.id);
    }
  }
  if (!validos.length) return { comp: base, ignorados };
  const c = structuredClone(base);
  c.variaveis.push(...validos.map(variavelDoAjuste));
  const css = cssDosAjustes(validos);
  c.codigo.css = `${semBlocoAnterior(c.codigo.css, MARCA_CSS)}\n\n${css}\n`;
  if (validos.some((a) => a.propriedade === 'gatilho') && !c.codigo.js.includes(MARCA_JS))
    c.codigo.js = `${c.codigo.js.trimEnd()}\n\n${JS_GATILHOS}\n`;
  return { comp: c, ignorados };
}

/** Valores das variáveis dos ajustes (id → valor), para o preview ao vivo. */
export function valoresDosAjustes(ajustes: Ajuste[]): Record<string, KcxValor> {
  return Object.fromEntries(ajustes.map((a) => [a.id, normalizarAjuste(a).valor]));
}

/** Assinatura do que muda o CÓDIGO (não os valores): seletor, propriedade, escopo. */
export function assinaturaAjustes(ajustes: Ajuste[]): string {
  return ajustes
    .map(
      (a) =>
        `${a.id}|${a.seletor}|${a.propriedade}|${a.escopo.tipo}|${a.escopo.largura ?? ''}|${a.propriedade === 'velocidade' ? (a.base ?? '') : ''}`,
    )
    .join('\n');
}
