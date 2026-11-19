import { describe, expect, it } from 'vitest';
import { planejarFigma, PlanoNo } from '../figma-plano';
import { criarPacote } from '../serializar';
import { validarPacote } from '../validar';
import { NOTAS_FIGMA, TIPOS_CONSTRUTOR, configPadrao, montarDoConstrutor } from '.';

const plano = (tipo: string) => {
  const def = TIPOS_CONSTRUTOR.find((t) => t.id === tipo)!;
  const comp = montarDoConstrutor({ ...configPadrao(def), animacao: 'preencher' });
  const pacote = criarPacote([comp]);
  expect(validarPacote(pacote).erros).toEqual([]);
  return planejarFigma(pacote).componentes[0];
};
const solido = (n: PlanoNo, i = 0) =>
  (n.preenchimentos[i] as { cor: { valor: { a: number } } }).cor.valor;

describe('Preenche no hover — Figma: vazado no Padrão, cheio no Hover', () => {
  for (const tipo of ['botao', 'botoes']) {
    it(tipo, () => {
      const p = plano(tipo);
      const padrao = p.variantes.find((v) => v.nome.startsWith('Estado=Padrão'))!.arvore;
      const hover = p.variantes.find((v) => v.nome.startsWith('Estado=Hover'))!.arvore;
      expect(solido(padrao).a).toBe(0);
      expect(solido(hover).a).toBe(1);
      expect(padrao.traco).toBeDefined();
      // Texto: no Padrão a camada de cor por cima aparece; no Hover some.
      expect(solido(padrao.filhos[0], 1).a).toBe(1);
      expect(solido(hover.filhos[0], 1).a).toBe(0);
    });
  }
});

import { valoresDaVariante } from '../figma-plano';

describe('Preview do código com a variante Padrão escolhida', () => {
  it('mantém a sombra do hover (o CSS faz o :hover)', () => {
    const def = TIPOS_CONSTRUTOR.find((t) => t.id === 'botao')!;
    const comp = montarDoConstrutor({ ...configPadrao(def), animacao: 'elevar' });
    const v = valoresDaVariante(comp, 'Estado=Padrão');
    expect(v['forcaSombra']).toBeGreaterThan(0);
  });
  it('estados que não são hover continuam valendo (menu aberto)', () => {
    const def = TIPOS_CONSTRUTOR.find((t) => t.id === 'menu-sanduiche')!;
    const comp = montarDoConstrutor(configPadrao(def));
    expect(valoresDaVariante(comp, 'Estado=Aberto')['aberto']).toBe(true);
  });
});

describe('Aviso do Figma para cada animação', () => {
  it('toda animação de todo tipo tem uma nota, e não há nota sobrando', () => {
    const chaves = TIPOS_CONSTRUTOR.flatMap((t) => t.animacoes.map((a) => `${t.id}:${a.id}`));
    for (const k of chaves) expect(NOTAS_FIGMA[k], k).toBeDefined();
    expect(Object.keys(NOTAS_FIGMA).sort()).toEqual([...chaves].sort());
  });
});
