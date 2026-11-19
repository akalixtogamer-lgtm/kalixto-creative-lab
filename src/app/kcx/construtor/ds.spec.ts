import { describe, expect, it } from 'vitest';
import { planejarFigma } from '../figma-plano';
import { importarNoFigma } from '../figma/construir';
import { criarFigmaMock } from '../figma/figma-mock';
import { criarPacote } from '../serializar';
import { validarPacote } from '../validar';
import { TIPOS_CONSTRUTOR, configPadrao, montarDoConstrutor } from '.';

const montar = (tipo: string, mudar: Record<string, unknown> = {}) => {
  const def = TIPOS_CONSTRUTOR.find((t) => t.id === tipo)!;
  const comp = montarDoConstrutor({ ...configPadrao(def), ...mudar });
  const pacote = criarPacote([comp]);
  expect(validarPacote(pacote).erros).toEqual([]);
  return { comp, pacote, plano: planejarFigma(pacote) };
};

describe('Botão de design system', () => {
  it('Tipo × Tamanho × Estado (4 × 3 × 5 = 60 variantes) com hover e pressionar', () => {
    const { plano } = montar('botao');
    const c = plano.componentes[0];
    expect(c.variantes).toHaveLength(60);
    const nomes = c.variantes.map((v) => v.nome);
    expect(nomes).toContain('Estado=Pressionado, Tipo=Destrutivo, Tamanho=G');
    expect(c.interacoes!.filter((i) => i.gatilho === 'hover')).toHaveLength(12);
    expect(c.interacoes!.filter((i) => i.gatilho === 'pressionar')).toHaveLength(12);
    expect(plano.icones).toBeDefined();
  });

  it('secundário é contorno sem fundo; desativado fica a 40 %', () => {
    const { plano } = montar('botao');
    const c = plano.componentes[0];
    const sec = c.variantes.find((v) => v.nome === 'Estado=Padrão, Tipo=Secundário, Tamanho=M')!;
    expect((sec.arvore.preenchimentos[0] as { cor: { valor: { a: number } } }).cor.valor.a).toBe(0);
    const tr = sec.arvore.traco!.pintura as { cor: { valor: { a: number } } };
    expect(tr.cor.valor.a).toBe(1);
    const des = c.variantes.find((v) => v.nome === 'Estado=Desativado, Tipo=Primário, Tamanho=M')!;
    expect(Number(des.arvore.opacidade!.valor)).toBeCloseTo(0.4);
  });

  it('no Figma: ícones da biblioteca, troca de instância e liga/desliga', async () => {
    const { plano } = montar('botao');
    const { figma } = criarFigmaMock();
    const rel = await importarNoFigma(figma, plano, '{}');
    expect(rel.propriedades).toEqual(
      expect.arrayContaining([
        'Ícone à esquerda (mostrar/ocultar)',
        'Ícone à esquerda (trocar) (troca de ícone)',
        'Texto do botão (texto)',
      ]),
    );
    expect(rel.pecas.some((p) => p.nome === 'KCX · Ícones')).toBe(true);
    expect(rel.avisos.filter((a) => /ícone|Interação/.test(a))).toEqual([]);
  });

  it('sem recursos (configuração antiga) continua com 2 variantes', () => {
    const { plano } = montar('botao', { recursos: undefined, icones: undefined });
    expect(plano.componentes[0].variantes).toHaveLength(2);
  });
});
