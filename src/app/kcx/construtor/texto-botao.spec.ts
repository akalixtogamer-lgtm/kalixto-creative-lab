import { describe, expect, it } from 'vitest';
import { configPadrao, montarDoConstrutor, tipoConstrutor } from '.';
import { PlanoNo, planejarFigma } from '../figma-plano';
import { criarPacote } from '../serializar';

const achar = (n: PlanoNo, f: (n: PlanoNo) => boolean): PlanoNo | undefined =>
  f(n) ? n : n.filhos.map((x) => achar(x, f)).find(Boolean);

describe('Cor do texto do botão independente', () => {
  it.each(['botao', 'botoes', 'botao-liga-desliga', 'seletor-duplo'])(
    '%s: a variável corTextoBotao existe e segue a cor escolhida',
    (id) => {
      const cfg = configPadrao(tipoConstrutor(id)!);
      const c = montarDoConstrutor({ ...cfg, cores: { ...cfg.cores, textoBotao: '#00ff00' } });
      const v = c.variaveis.find((x) => x.id === 'corTextoBotao')!;
      expect(v.padrao).toBe('#00ff00');
      expect(c.codigo.css).toContain('-texto-botao)');
    },
  );

  it('botão primário: texto verde no Figma com o botão na cor principal', () => {
    const cfg = configPadrao(tipoConstrutor('botao')!);
    const c = montarDoConstrutor({ ...cfg, cores: { ...cfg.cores, textoBotao: '#00ff00' } });
    const raiz = planejarFigma(criarPacote([c])).componentes[0].variantes[0].arvore;
    const txt = achar(raiz, (n) => n.tipo === 'texto')!;
    const cor = (txt.preenchimentos[0] as { cor: { valor: { r: number; g: number; b: number } } })
      .cor.valor;
    expect([cor.r, cor.g, cor.b]).toEqual([0, 1, 0]);
  });
});
