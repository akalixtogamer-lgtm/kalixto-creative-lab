/**
 * Sistema de variáveis funcionais do KCX.
 *
 * Variável → vínculos → operações → valor final de uma propriedade real
 * (custom property CSS ou atributo). É esta função que faz a variável
 * CONTROLAR o componente: o preview, o código exportado e o runtime
 * standalone usam exatamente o mesmo cálculo.
 */
import {
  KcxGradiente,
  KcxOperacao,
  KcxTransformacao2D,
  KcxValor,
  KcxVariavel,
  KcxVinculo,
} from './kcx.types';
import { arredondar, comAlpha, conversivel, converter, corValida } from './unidades';
import { comprimento, pontoEm } from './svg-caminho';

export type Valores = Record<string, KcxValor>;

export interface SaidaAtributo {
  seletor: string;
  atributo: string;
  valor: string;
}

export interface Saidas {
  /** --kcx-… → valor CSS */
  cssVars: Record<string, string>;
  atributos: SaidaAtributo[];
  /** Textos (textContent) por seletor. */
  textos: { seletor: string; valor: string }[];
}

/* ============================== Validação de valores ============================== */

const NUMERICOS = new Set(['number', 'float', 'dimension', 'time']);

export function ehNumerico(v: KcxVariavel): boolean {
  return NUMERICOS.has(v.tipo);
}

function ehGradiente(x: unknown): x is KcxGradiente {
  const g = x as KcxGradiente;
  return (
    !!g &&
    typeof g === 'object' &&
    typeof g.angulo === 'number' &&
    Array.isArray(g.paradas) &&
    g.paradas.length >= 2 &&
    g.paradas.every(
      (p) => corValida(p?.cor) && typeof p.posicao === 'number' && p.posicao >= 0 && p.posicao <= 1,
    )
  );
}

function ehTransformacao(x: unknown): x is KcxTransformacao2D {
  const t = x as KcxTransformacao2D;
  return (
    !!t &&
    typeof t === 'object' &&
    ['x', 'y', 'escala', 'rotacao'].every((k) => Number.isFinite(t[k as keyof KcxTransformacao2D]))
  );
}

/** Lista os problemas de um valor para a variável (vazio = válido). */
export function validarValor(v: KcxVariavel, valor: unknown): string[] {
  const e: string[] = [];
  switch (v.tipo) {
    case 'color':
      if (!corValida(valor)) e.push(`"${v.id}": cor inválida (${String(valor)}).`);
      break;
    case 'boolean':
      if (typeof valor !== 'boolean') e.push(`"${v.id}": esperado verdadeiro/falso.`);
      break;
    case 'string':
      if (typeof valor !== 'string') e.push(`"${v.id}": esperado texto.`);
      break;
    case 'enum':
      if (!v.opcoes?.some((o) => o.valor === valor))
        e.push(`"${v.id}": opção "${String(valor)}" não existe.`);
      break;
    case 'gradient':
      if (!ehGradiente(valor))
        e.push(`"${v.id}": gradiente inválido (ângulo + 2 ou mais paradas com cor e posição 0–1).`);
      break;
    case 'transform':
      if (!ehTransformacao(valor))
        e.push(`"${v.id}": transformação inválida (x, y, escala, rotação numéricos).`);
      break;
    default: {
      if (typeof valor !== 'number' || !Number.isFinite(valor)) {
        e.push(`"${v.id}": esperado número.`);
        break;
      }
      if (v.min !== undefined && valor < v.min)
        e.push(`"${v.id}": ${valor} abaixo do mínimo ${v.min}.`);
      if (v.max !== undefined && valor > v.max)
        e.push(`"${v.id}": ${valor} acima do máximo ${v.max}.`);
      if (v.tipo === 'number' && !Number.isInteger(valor))
        e.push(`"${v.id}": esperado número inteiro.`);
    }
  }
  return e;
}

/**
 * Corrige um valor vindo de fora (controle, preset, arquivo importado):
 * números são limitados ao intervalo e inteiros arredondados; o que não
 * pode ser corrigido volta ao padrão.
 */
export function normalizarValor(v: KcxVariavel, valor: unknown): KcxValor {
  if (ehNumerico(v)) {
    let n = typeof valor === 'string' && valor.trim() !== '' ? Number(valor) : (valor as number);
    if (typeof n !== 'number' || !Number.isFinite(n)) return v.padrao;
    if (v.min !== undefined) n = Math.max(v.min, n);
    if (v.max !== undefined) n = Math.min(v.max, n);
    if (v.tipo === 'number') n = Math.round(n);
    return arredondar(n);
  }
  if (v.tipo === 'boolean' && (valor === 'true' || valor === 'false')) return valor === 'true';
  return validarValor(v, valor).length ? v.padrao : (valor as KcxValor);
}

/* ============================== Conversões para CSS ============================== */

export function gradienteCss(g: KcxGradiente): string {
  const paradas = [...g.paradas]
    .sort((a, b) => a.posicao - b.posicao)
    .map((p) => `${p.cor} ${arredondar(p.posicao * 100, 2)}%`)
    .join(', ');
  return `linear-gradient(${g.angulo}deg, ${paradas})`;
}

export function transformacaoCss(t: KcxTransformacao2D): string {
  return `translate(${t.x}px, ${t.y}px) scale(${t.escala}) rotate(${t.rotacao}deg)`;
}

/* ============================== Operações ============================== */

function comoNumero(x: KcxValor, id: string): number {
  if (typeof x !== 'number') throw new Error(`KCX: a operação em "${id}" precisa de número.`);
  return x;
}

/**
 * Aplica as operações de um vínculo. `valores` dá acesso às outras
 * variáveis (multiplicarPorVariavel, alpha com variável).
 */
export function aplicarOperacoes(
  variavel: KcxVariavel,
  valor: KcxValor,
  ops: KcxOperacao[] = [],
  valores: Valores = {},
  todas: KcxVariavel[] = [],
): KcxValor {
  let x: KcxValor = valor;
  let unidade = variavel.unidade ?? '';
  for (const o of ops) {
    switch (o.op) {
      case 'multiplicar':
        x = comoNumero(x, variavel.id) * o.fator;
        break;
      case 'somar':
        x = comoNumero(x, variavel.id) + o.valor;
        break;
      case 'mapear': {
        const n = comoNumero(x, variavel.id);
        const [a, b] = o.de;
        const [c, d] = o.para;
        x = b === a ? c : c + ((n - a) * (d - c)) / (b - a);
        break;
      }
      case 'limitar': {
        let n = comoNumero(x, variavel.id);
        if (o.min !== undefined) n = Math.max(o.min, n);
        if (o.max !== undefined) n = Math.min(o.max, n);
        x = n;
        break;
      }
      case 'arredondar':
        x = arredondar(comoNumero(x, variavel.id), o.casas);
        break;
      case 'dividir': {
        const n = comoNumero(x, variavel.id);
        x = n === 0 ? o.numerador : o.numerador / n;
        break;
      }
      case 'multiplicarPorVariavel': {
        const outra = valores[o.variavel] ?? todas.find((t) => t.id === o.variavel)?.valor;
        x = comoNumero(x, variavel.id) * comoNumero(outra as KcxValor, o.variavel);
        break;
      }
      case 'somarVariavel': {
        const outra = valores[o.variavel] ?? todas.find((t) => t.id === o.variavel)?.valor;
        x = comoNumero(x, variavel.id) + o.fator * comoNumero(outra as KcxValor, o.variavel);
        break;
      }
      case 'alpha': {
        if (typeof x !== 'string')
          throw new Error(`KCX: alpha em "${variavel.id}" precisa de cor.`);
        const a = o.variavel
          ? (valores[o.variavel] ?? todas.find((t) => t.id === o.variavel)?.valor)
          : o.valor;
        x = comAlpha(x, comoNumero((a ?? 1) as KcxValor, o.variavel ?? variavel.id));
        break;
      }
      case 'converter':
        if (!conversivel(unidade, o.para))
          throw new Error(`KCX: "${variavel.id}" não converte ${unidade} → ${o.para}.`);
        x = converter(comoNumero(x, variavel.id), unidade, o.para);
        unidade = o.para;
        break;
      case 'mapa': {
        const chave = String(x);
        if (!(chave in o.valores))
          throw new Error(`KCX: "${variavel.id}" sem mapa para "${chave}".`);
        x = o.valores[chave];
        break;
      }
      case 'pontoNoCaminho':
      case 'tracoNoCaminho': {
        const forma = String(valores[o.variavel] ?? todas.find((t) => t.id === o.variavel)?.valor);
        const d = o.caminhos[forma];
        if (!d) throw new Error(`KCX: caminho "${forma}" não encontrado.`);
        const t = comoNumero(x, variavel.id);
        x = o.op === 'tracoNoCaminho' ? comprimento(d) * t : pontoEm(d, t)[o.eixo] + (o.somar ?? 0);
        break;
      }
    }
  }
  return x;
}

/** Valor final (texto CSS) de um vínculo. */
export function valorDoVinculo(
  variavel: KcxVariavel,
  vinculo: KcxVinculo,
  valores: Valores,
  todas: KcxVariavel[],
): string {
  const atual = valores[variavel.id] ?? variavel.valor;
  let x = aplicarOperacoes(variavel, atual, vinculo.transformar, valores, todas);
  if (typeof x === 'number') {
    // Proteção contra NaN/Infinity: volta ao valor calculado com o padrão.
    if (!Number.isFinite(x))
      x = aplicarOperacoes(variavel, variavel.padrao, vinculo.transformar, {}, todas);
    return `${arredondar(x as number)}${vinculo.unidadeSaida ?? ''}`;
  }
  if (typeof x === 'boolean') return x ? '1' : '0';
  if (typeof x === 'string') return x;
  if (variavel.tipo === 'gradient') return gradienteCss(x as KcxGradiente);
  return transformacaoCss(x as KcxTransformacao2D);
}

/** Valores atuais de todas as variáveis (sobrepostos por `valores`). */
export function valoresAtuais(variaveis: KcxVariavel[], valores: Valores = {}): Valores {
  return Object.fromEntries(variaveis.map((v) => [v.id, valores[v.id] ?? v.valor]));
}

export function valoresPadrao(variaveis: KcxVariavel[]): Valores {
  return Object.fromEntries(variaveis.map((v) => [v.id, v.padrao]));
}

/**
 * Calcula todas as propriedades controladas pelas variáveis.
 * É o coração do KCX: o mesmo resultado vai para o preview, para o
 * bloco :root do código e para o runtime exportado.
 */
export function resolverSaidas(variaveis: KcxVariavel[], valores: Valores = {}): Saidas {
  const atuais = valoresAtuais(variaveis, valores);
  const cssVars: Record<string, string> = {};
  const atributos: SaidaAtributo[] = [];
  const textos: Saidas['textos'] = [];
  for (const v of variaveis) {
    for (const vin of v.vinculos) {
      if (vin.alvo.tipo === 'parametro-gerador') continue;
      const valor = valorDoVinculo(v, vin, atuais, variaveis);
      if (vin.alvo.tipo === 'css-var') cssVars[vin.alvo.nome] = valor;
      else if (vin.alvo.tipo === 'atributo')
        atributos.push({ seletor: vin.alvo.seletor, atributo: vin.alvo.atributo, valor });
      else textos.push({ seletor: vin.alvo.seletor, valor });
    }
  }
  return { cssVars, atributos, textos };
}

/** Bloco :root com as custom properties (é ele que liga as variáveis ao CSS). */
export function blocoRoot(saidas: Saidas, seletor = ':root'): string {
  const linhas = Object.entries(saidas.cssVars).map(([k, v]) => `  ${k}: ${v};`);
  return `${seletor} {\n  /* KCX: gerado a partir das variáveis — edite os valores ou use o runtime */\n${linhas.join('\n')}\n}`;
}

/**
 * Lê de volta um bloco :root editado à mão e descobre os valores das
 * variáveis cujo vínculo é direto (sem operações ou só com unidade).
 * É o caminho Código → Variáveis da sincronização de três camadas.
 */
export function lerBlocoRoot(
  css: string,
  variaveis: KcxVariavel[],
): { valores: Valores; ignoradas: string[]; erros: string[] } {
  const m = /:root\s*\{([\s\S]*?)\}/.exec(css);
  const valores: Valores = {};
  const ignoradas: string[] = [];
  const erros: string[] = [];
  if (!m) return { valores, ignoradas, erros: ['Bloco :root não encontrado.'] };
  const decl = new Map<string, string>();
  for (const linha of m[1].split(';')) {
    const d = /^\s*(--kcx-[\w-]+)\s*:\s*([\s\S]+?)\s*$/.exec(
      linha.replace(/\/\*[\s\S]*?\*\//g, ''),
    );
    if (d) decl.set(d[1], d[2]);
  }
  for (const v of variaveis) {
    const direto = v.vinculos.find(
      (vin) =>
        vin.alvo.tipo === 'css-var' &&
        (vin.transformar ?? []).length === 0 &&
        v.tipo !== 'gradient' &&
        v.tipo !== 'transform',
    );
    if (!direto || direto.alvo.tipo !== 'css-var') {
      ignoradas.push(v.id);
      continue;
    }
    const bruto = decl.get(direto.alvo.nome);
    if (bruto === undefined) continue;
    let valor: unknown = bruto;
    if (ehNumerico(v)) valor = Number(bruto.replace(direto.unidadeSaida ?? '', ''));
    if (v.tipo === 'boolean') valor = bruto === '1';
    const problemas = validarValor(v, valor);
    if (problemas.length) erros.push(...problemas);
    else valores[v.id] = valor as KcxValor;
  }
  return { valores, ignoradas, erros };
}
