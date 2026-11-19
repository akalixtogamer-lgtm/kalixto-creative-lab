/**
 * Estados de interação de design system (Padrão, Hover, Pressionado, Foco,
 * Desativado) para componentes clicáveis.
 *
 * No código o CSS faz :hover, :active, :focus-visible e :disabled. No Figma
 * cada estado é uma variante; três variáveis de estado desenham a diferença:
 * - realce: camada da cor do texto por cima (hover clareia/escurece, pressionado mais);
 * - anel: anel de foco (sombra com espalhamento);
 * - opacidade: desativado fica a 40 %.
 * Protótipo: Padrão → Hover (While hovering) e Hover → Pressionado (While pressing).
 */
import {
  KcxEfeito,
  KcxEstado,
  KcxInteracao,
  KcxNo,
  KcxOperacao,
  KcxRef,
  KcxValor,
} from '../kcx.types';
import { Blocos } from './montar';

export interface EstadosDs {
  realce: string;
  anel: string;
  opacidade: string;
  /** Camada de realce (primeiro filho do Auto Layout, absoluta e esticada). */
  noRealce(cor: KcxRef<string>, nome?: string): KcxNo;
  /** Anel de foco (efeito do Figma). */
  efeitoAnel(cor: KcxRef<string>, nome?: string): KcxEfeito;
  /** Os 5 estados, com valores extras para Padrão e Hover (ex.: força da sombra). */
  estados(extra?: {
    padrao?: Record<string, KcxValor>;
    hover?: Record<string, KcxValor>;
    pressionado?: Record<string, KcxValor>;
  }): KcxEstado[];
  interacoes(no: string): KcxInteracao[];
  /** CSS dos estados (::after de realce, outline de foco, :disabled). */
  css(seletor: string, corAnel: string): string;
}

export const VALORES_DS = {
  padrao: { realce: 0, anel: 0, opacidade: 1 },
  hover: { realce: 0.1 },
  pressionado: { realce: 0.22 },
  foco: { anel: 3 },
  desativado: { opacidade: 0.4 },
};

export function estadosDs(b: Blocos): EstadosDs {
  const realce = b.extra({
    id: 'realce',
    nome: 'Realce do estado',
    tipo: 'float',
    padrao: 0,
    min: 0,
    max: 0.5,
    passo: 0.01,
    descricao:
      'Camada da cor do texto por cima do componente: 0 no Padrão, 0,1 no Hover, 0,22 no Pressionado.',
    grupo: 'effects',
    secao: 'comportamento',
    vinculos: [
      { propriedade: 'Realce (::after)', alvo: { tipo: 'css-var', nome: `${b.P}-realce` } },
    ],
  });
  const anel = b.extra({
    id: 'anelFoco',
    nome: 'Anel de foco',
    tipo: 'dimension',
    padrao: 0,
    min: 0,
    max: 8,
    passo: 1,
    unidade: 'px',
    descricao: 'Espessura do anel de foco (teclado): 0 nos outros estados, 3 px no Foco.',
    grupo: 'effects',
    secao: 'comportamento',
    vinculos: [
      {
        propriedade: 'outline-width',
        alvo: { tipo: 'css-var', nome: `${b.P}-anel` },
        unidadeSaida: 'px',
      },
    ],
  });
  const opacidade = b.extra({
    id: 'opacidadeEstado',
    nome: 'Opacidade do estado',
    tipo: 'float',
    padrao: 1,
    min: 0,
    max: 1,
    passo: 0.05,
    descricao: 'Opacidade do componente: 1 nos estados ativos, 0,4 no Desativado.',
    grupo: 'effects',
    secao: 'comportamento',
    vinculos: [{ propriedade: 'opacity', alvo: { tipo: 'css-var', nome: `${b.P}-opacidade` } }],
  });
  return {
    realce,
    anel,
    opacidade,
    noRealce(cor, nome = 'realce-cor') {
      return {
        id: 'realce',
        nome: 'Realce',
        tipo: 'retangulo',
        absoluto: true,
        restricoes: { h: 'STRETCH', v: 'STRETCH' },
        raio: b.raio,
        preenchimentos: [
          { tipo: 'solido', cor: derivarCor(cor, nome, [{ op: 'alpha', variavel: realce }]) },
        ],
      };
    },
    efeitoAnel(cor, nome = 'anel-cor') {
      return {
        tipo: 'sombra',
        x: 0,
        y: 0,
        raio: 0,
        espalhar: { $var: anel },
        cor: derivarCor(cor, nome, [{ op: 'alpha', valor: 0.45 }]),
      };
    },
    estados(extra = {}) {
      return [
        {
          id: 'padrao',
          nome: 'Padrão',
          gatilho: 'padrao',
          descricao: 'Em repouso.',
          valores: { [realce]: 0, [anel]: 0, [opacidade]: 1, ...extra.padrao },
        },
        {
          id: 'hover',
          nome: 'Hover',
          gatilho: 'hover',
          descricao: 'Mouse por cima.',
          valores: { [realce]: VALORES_DS.hover.realce, ...extra.hover },
        },
        {
          id: 'pressionado',
          nome: 'Pressionado',
          gatilho: 'active',
          descricao: 'Clicando (botão do mouse ou dedo apertado).',
          valores: {
            [realce]: VALORES_DS.pressionado.realce,
            ...extra.padrao,
            ...extra.pressionado,
          },
        },
        {
          id: 'foco',
          nome: 'Foco',
          gatilho: 'focus',
          descricao: 'Selecionado pelo teclado (Tab): anel de foco.',
          valores: { [realce]: 0, [anel]: VALORES_DS.foco.anel, ...extra.padrao },
        },
        {
          id: 'desativado',
          nome: 'Desativado',
          gatilho: 'desativado',
          descricao: 'Não pode ser usado agora.',
          valores: {
            [realce]: 0,
            [opacidade]: VALORES_DS.desativado.opacidade,
            ...extra.padrao,
          },
        },
      ];
    },
    interacoes(no) {
      return [
        {
          no,
          gatilho: 'hover',
          de: 'padrao',
          para: 'hover',
          transicao: 'smart-animate',
          duracao: 200,
        },
        {
          no,
          gatilho: 'pressionar',
          de: 'hover',
          para: 'pressionado',
          transicao: 'smart-animate',
          duracao: 120,
        },
      ];
    },
    css(sel, corAnel) {
      return estadosCss(b, sel, corAnel);
    },
  };
}

/** Nova cor derivada de `cor` ($var ou $derivado) com operações a mais no fim. */
export function derivarCor(cor: KcxRef<string>, nome: string, ops: KcxOperacao[]): KcxRef<string> {
  const c = cor as { $var?: string; $derivado?: string; transformar?: KcxOperacao[] };
  return {
    $derivado: (c.$derivado ?? c.$var)!,
    nome,
    transformar: [...(c.transformar ?? []), ...ops],
  } as KcxRef<string>;
}

/** Só o CSS dos estados (quando as variáveis já foram criadas por estadosDs). */
export function estadosCss(b: Blocos, seletor: string, corAnel = 'currentColor'): string {
  const v = (n: string) => b.v(n);
  return `${seletor} { position: relative; opacity: ${v('opacidade')}; outline: ${v('anel')} solid color-mix(in srgb, ${corAnel} 45%, transparent); outline-offset: 2px; }
${seletor}::after { content: ''; position: absolute; inset: 0; border-radius: inherit; background: currentColor; opacity: ${v('realce')}; pointer-events: none; transition: opacity ${v('duracao')} ${v('easing')}; }
${seletor}:hover::after { opacity: ${VALORES_DS.hover.realce}; }
${seletor}:active::after { opacity: ${VALORES_DS.pressionado.realce}; }
${seletor}:focus-visible { outline-width: 3px; }
${seletor}:disabled, ${seletor}[aria-disabled="true"] { opacity: ${VALORES_DS.desativado.opacidade}; cursor: not-allowed; transform: none; box-shadow: none; animation: none; }
${seletor}:disabled::after, ${seletor}[aria-disabled="true"]::after { opacity: 0; }`;
}
