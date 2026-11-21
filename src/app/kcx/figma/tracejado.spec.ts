import { describe, expect, it } from 'vitest';
import { configPadrao, montarDoConstrutor, tipoConstrutor } from '../construtor';
import { planejarFigma } from '../figma-plano';
import { criarPacote, serializar } from '../serializar';
import { importarNoFigma, limparTracejados } from './construir';
import { criarFigmaMock } from './figma-mock';

describe('Borda tracejada do conjunto de variantes', () => {
  it('o plugin importa os conjuntos sem a borda roxa tracejada', async () => {
    const c = montarDoConstrutor(configPadrao(tipoConstrutor('botao')!));
    const pacote = criarPacote([c]);
    const mock = criarFigmaMock();
    await importarNoFigma(mock.figma, planejarFigma(pacote), serializar(pacote), 'atualizar');
    const sets = mock.figma.currentPage.findAll(
      (n: { type: string }) => n.type === 'COMPONENT_SET',
    );
    expect(sets.length).toBeGreaterThan(0);
    for (const s of sets) {
      expect(s.strokes).toEqual([]);
      expect((s as unknown as { dashPattern: number[] }).dashPattern).toEqual([]);
    }
  });

  it('"Tirar a borda tracejada" limpa conjuntos que já estavam no arquivo', () => {
    const mock = criarFigmaMock();
    const f = mock.figma as unknown as {
      combineAsVariants(n: unknown[], p: unknown): { strokes: unknown[] };
      createComponent(): unknown;
      currentPage: unknown;
    };
    const set = f.combineAsVariants([f.createComponent(), f.createComponent()], f.currentPage);
    expect(set.strokes.length).toBe(1);
    expect(limparTracejados(mock.figma as never)).toBe(1);
    expect(set.strokes).toEqual([]);
  });
});
