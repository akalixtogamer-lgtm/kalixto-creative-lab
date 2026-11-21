import { describe, expect, it } from 'vitest';
import { configPadrao, montarDoConstrutor, tipoConstrutor } from '../..';
import { importarNoFigma } from '../../../figma/construir';
import { criarFigmaMock } from '../../../figma/figma-mock';
import { PlanoNo, planejarFigma } from '../../../figma-plano';
import { resolverSaidas } from '../../../resolver';
import { criarPacote, serializar } from '../../../serializar';
import { validarComponente } from '../../../validar';

const def = tipoConstrutor('seletor-duplo')!;
const achar = (n: PlanoNo, id: string): PlanoNo | undefined =>
  n.id === id ? n : n.filhos.map((f) => achar(f, id)).find(Boolean);

describe('Seletor de duas opções (um ou outro)', () => {
  it('código: radiogroup com Português/Inglês e valor verdadeiro/falso', () => {
    const c = montarDoConstrutor(configPadrao(def));
    expect(validarComponente(c, c.id)).toEqual([]);
    expect(c.codigo.html).toContain('role="radiogroup"');
    expect(c.codigo.html).toContain('>Português</button>');
    expect(c.codigo.html).toContain('>Inglês</button>');
    const v = c.variaveis.find((x) => x.id === 'segunda')!;
    expect(v.tipo).toBe('boolean');
    const fal = resolverSaidas(c.variaveis, { segunda: false }).atributos;
    const ver = resolverSaidas(c.variaveis, { segunda: true }).atributos;
    const aria = (a: typeof fal, sel: string) =>
      a.find((x) => x.seletor.endsWith(sel) && x.atributo === 'aria-checked')!.valor;
    expect([aria(fal, '__a'), aria(fal, '__b')]).toEqual(['true', 'false']);
    expect([aria(ver, '__a'), aria(ver, '__b')]).toEqual(['false', 'true']);
    expect(c.codigo.js).toContain('ArrowRight');
  });

  it('Figma: Primeira/Segunda (+ Desativado) × Tamanho, destaque desliza, clique troca', async () => {
    const c = montarDoConstrutor(configPadrao(def));
    expect(c.estados.map((e) => e.nome)).toEqual(['Primeira', 'Segunda', 'Desativado']);
    expect(c.interacoes?.map((i) => `${i.no}:${i.de}>${i.para}`)).toEqual([
      'opcao-b:primeira>segunda',
      'opcao-a:segunda>primeira',
    ]);
    const pacote = criarPacote([c]);
    const plano = planejarFigma(pacote);
    const vs = plano.componentes[0].variantes;
    expect(vs).toHaveLength(9);
    const x = (nome: string) => achar(vs.find((v) => v.nome === nome)!.arvore, 'indicador')!.x!;
    expect(x('Estado=Segunda, Tamanho=M')).toBeGreaterThan(x('Estado=Primeira, Tamanho=M'));
    const rel = await importarNoFigma(
      criarFigmaMock().figma,
      plano,
      serializar(pacote),
      'atualizar',
    );
    expect(rel.vinculosFalhos).toEqual([]);
    expect(rel.componentes[0].variantes).toBe(9);
  });
});
