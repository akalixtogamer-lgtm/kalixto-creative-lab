/** Ajudantes compartilhados pelos tipos de navegacao. */
import { KcxInteracao } from '../../../kcx.types';
import { Blocos, ICONES } from '../../montar';

export const interacao = (
  no: string,
  de: string,
  para: string,
  gatilho: KcxInteracao['gatilho'] = 'clique',
): KcxInteracao => ({ no, gatilho, de, para, transicao: 'smart-animate', duracao: 320 });

/** Interações "clicar no item i leva ao estado i" a partir de todos os outros estados. */
export function trocaPorIndice(
  prefixoNo: string,
  prefixoEstado: string,
  total: number,
): KcxInteracao[] {
  const r: KcxInteracao[] = [];
  for (let de = 1; de <= total; de++)
    for (let para = 1; para <= total; para++)
      if (de !== para)
        r.push(
          interacao(`${prefixoNo}${para}`, `${prefixoEstado}${de}`, `${prefixoEstado}${para}`),
        );
  return r;
}

/** Repete as regras do modo mobile para a container query e para o atributo data-vista. */
export function mobile(b: Blocos, largura: number, regras: string): string {
  const escopo = (sel: string) =>
    regras.replace(/(^|\})\s*([^{}@]+)\{/g, (_, fim: string, seletores: string) => {
      const lista = seletores
        .split(',')
        .map((x) => `${sel} ${x.trim()}`)
        .join(', ');
      return `${fim}\n${lista} {`;
    });
  return `@container ${b.C} (max-width: ${largura}px) {${escopo(`.${b.C}`)}\n}\n${escopo(`.${b.C}[data-vista="true"]`)}`;
}

export function textoBotao(b: Blocos, slot: string): string {
  return `<a class="${b.c('botao')}" href="#">${b.span(slot)}</a>`;
}

/* ============================== Navbar ============================== */

export const PADRAO_TABBAR = ['casa', 'busca', 'coracao', 'usuario', 'config'];

export const ICONES_TABBAR = [
  ICONES.casa,
  'M 11 4 C 15 4 18 7 18 11 C 18 15 15 18 11 18 C 7 18 4 15 4 11 C 4 7 7 4 11 4 M 16 16 L 20 20',
  'M 12 20 L 4.5 12.5 C 2 10 3.5 5 7.5 5 C 9.5 5 11 6.5 12 8 C 13 6.5 14.5 5 16.5 5 C 20.5 5 22 10 19.5 12.5 Z',
  'M 12 4 C 14.2 4 16 5.8 16 8 C 16 10.2 14.2 12 12 12 C 9.8 12 8 10.2 8 8 C 8 5.8 9.8 4 12 4 M 5 20 C 5 16.5 8 14 12 14 C 16 14 19 16.5 19 20',
  'M 5 6 L 19 6 L 19 18 L 5 18 Z M 5 10 L 19 10',
];
