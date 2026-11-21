import { describe, expect, it } from 'vitest';
import { configPadrao, montarDoConstrutor, tipoConstrutor } from '../..';
import { importarNoFigma } from '../../../figma/construir';
import { criarFigmaMock } from '../../../figma/figma-mock';
import { PlanoNo, planejarFigma } from '../../../figma-plano';
import { criarPacote, serializar } from '../../../serializar';
import { validarComponente } from '../../../validar';

const def = tipoConstrutor('botao-liga-desliga')!;
const achar = (n: PlanoNo, id: string): PlanoNo | undefined =>
  n.id === id ? n : n.filhos.map((f) => achar(f, id)).find(Boolean);

describe('Botão liga/desliga', () => {
  it('código: <button aria-pressed> que alterna, textos e ícones de cada lado', () => {
    const c = montarDoConstrutor(configPadrao(def));
    expect(validarComponente(c, c.id)).toEqual([]);
    expect(c.codigo.html).toContain('aria-pressed="false" data-ligado="false"');
    expect(c.codigo.html).toContain('Seguir');
    expect(c.codigo.html).toContain('Seguindo');
    expect(c.codigo.js).toContain("setAttribute('aria-pressed'");
    expect(c.codigo.css).toContain('[data-ligado="true"] { background:');
    const v = c.variaveis.find((x) => x.id === 'ligado')!;
    expect(v.vinculos.map((x) => (x.alvo as { atributo: string }).atributo)).toEqual([
      'data-ligado',
      'aria-pressed',
    ]);
  });

  it('Figma: Desligado/Ligado × estados × Tamanho, cheio só ligado, clique alterna', async () => {
    const c = montarDoConstrutor(configPadrao(def));
    expect(c.estados.map((e) => e.nome)).toEqual([
      'Desligado',
      'Desligado · Hover',
      'Desligado · Pressionado',
      'Desligado · Foco',
      'Desligado · Desativado',
      'Ligado',
      'Ligado · Hover',
      'Ligado · Pressionado',
      'Ligado · Foco',
      'Ligado · Desativado',
    ]);
    expect(c.interacoes).toContainEqual(
      expect.objectContaining({ gatilho: 'clique', de: 'hover', para: 'ligado-hover' }),
    );
    expect(c.interacoes).toContainEqual(
      expect.objectContaining({ gatilho: 'clique', de: 'ligado-hover', para: 'hover' }),
    );
    const pacote = criarPacote([c]);
    const plano = planejarFigma(pacote);
    const vs = plano.componentes[0].variantes;
    expect(vs).toHaveLength(30);
    const raiz = (nome: string) => vs.find((v) => v.nome === nome)!.arvore;
    const a = (n: PlanoNo) =>
      (n.preenchimentos[0] as { cor: { valor: { a: number } } }).cor.valor.a;
    const off = raiz('Estado=Desligado, Tamanho=M');
    const on = raiz('Estado=Ligado, Tamanho=M');
    expect(a(off)).toBe(0);
    expect(a(on)).toBe(1);
    expect(achar(off, 't-rotulo')!.visivel?.valor).toBe(true);
    expect(achar(on, 't-rotulo')!.visivel?.valor).toBe(false);
    expect(achar(on, 't-rotuloLigado')!.visivel?.valor).toBe(true);
    const rel = await importarNoFigma(
      criarFigmaMock().figma,
      plano,
      serializar(pacote),
      'atualizar',
    );
    expect(rel.vinculosFalhos).toEqual([]);
    expect(rel.componentes[0].variantes).toBe(30);
  });

  it('sem estados: só Desligado e Ligado, e o clique alterna', () => {
    const cfg = configPadrao(def);
    const c = montarDoConstrutor({ ...cfg, recursos: { ...cfg.recursos, estados: false } });
    expect(c.estados.map((e) => e.nome)).toEqual(['Desligado', 'Ligado']);
    expect(c.interacoes?.map((i) => `${i.de}>${i.para}`)).toEqual([
      'padrao>ligado',
      'ligado>padrao',
    ]);
  });
});
