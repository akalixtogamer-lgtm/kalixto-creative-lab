import { describe, expect, it } from 'vitest';
import { planejarFigma } from '../figma-plano';
import { importarNoFigma } from '../figma/construir';
import { criarFigmaMock } from '../figma/figma-mock';
import { criarPacote, serializar } from '../serializar';
import { validarPacote } from '../validar';
import { TIPOS_CONSTRUTOR, configPadrao, montarDoConstrutor } from '.';

const montar = (tipo: string, mudar: Record<string, unknown> = {}) => {
  const def = TIPOS_CONSTRUTOR.find((t) => t.id === tipo)!;
  const comp = montarDoConstrutor({ ...configPadrao(def), ...mudar });
  const pacote = criarPacote([comp]);
  expect(validarPacote(JSON.parse(serializar(pacote))).erros).toEqual([]);
  return { comp, pacote, plano: planejarFigma(pacote) };
};

describe('Fase 3 — composição e protótipo avançado', () => {
  it('hero: os botões são instâncias do Botão, que vai junto no pacote e é criado antes', async () => {
    const { comp, pacote, plano } = montar('hero');
    const sub = `${comp.id}-botao`;
    expect(pacote.componentes.map((c) => c.id)).toEqual([comp.id, sub]);
    const hero = plano.componentes.find((c) => c.id === comp.id)!;
    const inst = JSON.stringify(hero.variantes[0].arvore);
    expect(inst).toContain(`"componente":"${sub}"`);
    expect(hero.usa).toEqual([sub]);
    const { figma } = criarFigmaMock();
    const rel = await importarNoFigma(figma, plano, '{}');
    expect(rel.componentes.map((c) => c.nome)).toEqual([
      'Hero (topo da página) · Botão',
      'Hero (topo da página)',
    ]);
    expect(rel.avisos.filter((a) => /não encontrado|instância/.test(a))).toEqual([]);
  });

  it('modal: slot “Conteúdo livre”, Esc fecha e tela de protótipo com overlay', async () => {
    const { plano } = montar('modal');
    const c = plano.componentes[0];
    expect(c.prototipo?.overlay).toMatchObject({ de: 'Estado=Fechado', overlay: 'Estado=Aberto' });
    expect(c.interacoes!.some((i) => i.gatilho === 'tecla' && i.tecla === 'Escape')).toBe(true);
    const { figma } = criarFigmaMock();
    const rel = await importarNoFigma(figma, plano, '{}');
    expect(rel.propriedades).toContain('Conteúdo livre (slot)');
    expect(rel.interacoes.some((i) => i.includes('overlay'))).toBe(true);
  });

  it('chave com “Troca o tema”: cria os modos e troca o modo de KCX · Colors no clique', async () => {
    const { plano } = montar('switch', {
      recursos: { desativado: true, tema: true },
    });
    const cores = plano.colecoes.find((c) => c.nome === 'KCX · Colors')!;
    expect(cores.modos).toEqual(['Dark', 'Light']);
    const { figma } = criarFigmaMock();
    const rel = await importarNoFigma(figma, plano, '{}');
    expect(rel.avisos.filter((a) => a.includes('modo'))).toEqual([]);
  });

  it('modos Desktop e Celular: espaço e texto menores no celular, derivadas recalculadas', () => {
    const { plano } = montar('card-preco', { telas: true });
    const esp = plano.colecoes.find((c) => c.nome === 'KCX · Spacing')!;
    expect(esp.modos).toEqual(['Desktop', 'Celular']);
    expect(
      esp.variaveis.some((x) => Number(x.valores['Celular']) < Number(x.valores['Desktop'])),
    ).toBe(true);
  });

  it('galeria: layout Grid do Figma com 3 colunas', () => {
    const { plano } = montar('galeria');
    expect(plano.componentes[0].variantes[0].arvore.grade).toMatchObject({ colunas: 3, linhas: 2 });
  });

  it('carrossel: arrastar passa o slide (On drag)', () => {
    const { plano } = montar('carrossel');
    expect(plano.componentes[0].interacoes!.some((i) => i.gatilho === 'arrastar')).toBe(true);
  });
});
