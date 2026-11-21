/**
 * Tamanho em px editável em QUALQUER componente KCX.
 *
 * `comTamanhoEditavel` acrescenta as variáveis "Largura (px)" e "Altura (px)"
 * com o tamanho original como padrão. No código, a regra só vale quando o valor
 * sai do padrão (atributos data-kcx-largura / data-kcx-altura); no Figma, a
 * largura e a altura da camada principal ficam ligadas às variáveis quando o
 * componente tem tamanho fixo (os que crescem com o conteúdo mudam só no código).
 */
import { KcxComponente } from '../kcx.types';

export const IDS_TAMANHO = { largura: 'tamanhoLargura', altura: 'tamanhoAltura' } as const;

export const temTamanhoEditavel = (c: KcxComponente) =>
  c.variaveis.some((v) => v.id === IDS_TAMANHO.largura);

export function comTamanhoEditavel(original: KcxComponente): KcxComponente {
  if (temTamanhoEditavel(original)) return original;
  const raiz = /class="([^"\s]+)/.exec(original.codigo.html)?.[1];
  if (!raiz) return original;
  const c = structuredClone(original);
  const P = `--kcx-${c.id}`;
  const e = c.estrutura;
  const fixoL = typeof e.largura === 'number';
  const fixoA = typeof e.altura === 'number';
  const L = Math.round(fixoL ? (e.largura as number) : c.metadados.largura || 320);
  const A = Math.round(fixoA ? (e.altura as number) : c.metadados.altura || 200);

  const nova = (
    id: string,
    nome: string,
    padrao: number,
    css: string,
    figma: boolean,
    descricao: string,
  ) =>
    c.variaveis.push({
      id,
      nome,
      tipo: 'dimension',
      padrao,
      valor: padrao,
      unidade: 'px',
      min: 16,
      max: 2400,
      passo: 1,
      descricao: `${descricao}${figma ? '' : ' No Figma, este componente cresce com o conteúdo: a medida muda só no código.'}`,
      grupo: 'dimensions',
      secao: 'aparencia',
      exportavel: figma,
      vinculos: [
        {
          propriedade: css,
          alvo: { tipo: 'css-var', nome: `${P}-${css}` },
          unidadeSaida: 'px',
        },
        {
          propriedade: `${nome} (liga a regra)`,
          alvo: { tipo: 'atributo', seletor: `.${raiz}`, atributo: `data-kcx-${css}` },
        },
      ],
    });
  nova(IDS_TAMANHO.largura, 'Largura (px)', L, 'largura', fixoL, 'Largura do componente.');
  nova(IDS_TAMANHO.altura, 'Altura (px)', A, 'altura', fixoA, 'Altura mínima do componente.');
  if (fixoL) e.largura = { $var: IDS_TAMANHO.largura };
  if (fixoA) e.altura = { $var: IDS_TAMANHO.altura };

  c.codigo = {
    ...c.codigo,
    css: `${c.codigo.css}

/* Tamanho em px: só vale quando sai do tamanho original */
.${raiz}[data-kcx-largura]:not([data-kcx-largura='${L}']) { width: var(${P}-largura); max-width: none; }
.${raiz}[data-kcx-altura]:not([data-kcx-altura='${A}']) { min-height: var(${P}-altura); }`,
  };
  return c;
}
