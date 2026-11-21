import { describe, expect, it } from 'vitest';
import { CORES_CLARO, diagramaDoFluxo, diagramaDoMapa, Fluxo } from '../projeto/navegacao';
import { construirDiagrama } from './construir-diagrama';
import { criarFigmaMock } from './figma-mock';

const paginas = [
  { id: 'home', nome: 'Home', secoes: ['Navbar', 'Hero'] },
  { id: 'sobre', nome: 'Sobre', secoes: [] },
];

describe('Mapa e fluxo no Figma', () => {
  it('cria um frame com uma caixa por página, setas e o gatilho como etiqueta', async () => {
    const d = diagramaDoMapa(paginas, {
      ligacoes: [
        { id: 'a', de: 'home', para: 'sobre', gatilho: 'Menu → Sobre' },
        { id: 'b', de: 'sobre', para: 'home', gatilho: '' },
      ],
      fluxos: [],
    });
    const { figma } = criarFigmaMock();
    const r = await construirDiagrama(figma, d, CORES_CLARO);
    expect(r).toMatchObject({ caixas: 2, setas: 2 });
    const quadro = figma.currentPage.children.at(-1);
    expect(quadro.name).toBe('Mapa de navegação · Mapa de navegação');
    expect(figma.currentPage.selection).toEqual([quadro]);
    const nomes = quadro.children.map((c: { name: string }) => c.name);
    expect(nomes).toContain('Página · Home');
    expect(nomes).toContain('Gatilho · Menu → Sobre');
    expect(nomes.filter((n: string) => n.startsWith('Seta'))).toHaveLength(2);
    const home = quadro.children.find((c: { name: string }) => c.name === 'Página · Home');
    const textos = home.findAll((n: { type: string }) => n.type === 'TEXT');
    expect(textos.map((t: { characters: string }) => t.characters)).toEqual(
      expect.arrayContaining(['Home', '▪ Navbar\n▪ Hero', 'INÍCIO']),
    );
    // A seta volta tracejada (Sobre → Home).
    const svgs = quadro
      .findAll((n: { type: string }) => n.type === 'VECTOR')
      .map((v: { svg: string }) => v.svg);
    expect(svgs.some((s: string) => s.includes('stroke-dasharray'))).toBe(true);
  });

  it('decisão do fluxo vira losango', async () => {
    const f: Fluxo = {
      id: 'f',
      nome: 'Login',
      objetivo: '',
      passos: [
        { id: 'i', tipo: 'inicio', rotulo: 'Abre' },
        { id: 'q', tipo: 'decisao', rotulo: 'Tem conta?', sim: 'fim', nao: 'fim' },
        { id: 'fim', tipo: 'fim', rotulo: 'Pronto' },
      ],
    };
    const { figma } = criarFigmaMock();
    await construirDiagrama(figma, diagramaDoFluxo(f, paginas), CORES_CLARO);
    const quadro = figma.currentPage.children.at(-1);
    const decisao = quadro.children.find(
      (c: { name: string }) => c.name === 'Decisão · Tem conta?',
    );
    expect(decisao.children[0].name).toBe('Losango');
  });
});
