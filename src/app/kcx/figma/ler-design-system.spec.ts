import { describe, expect, it } from 'vitest';
import { validarFundacao } from '../fundacao';
import { criarFigmaMock } from './figma-mock';
import { DesignSystemFigma, fundacaoDoFigma, lerDesignSystem } from './ler-design-system';

const ds: DesignSystemFigma = {
  arquivo: 'Bloomina DS',
  variaveis: [
    {
      nome: 'color/brand/500',
      colecao: 'Colors',
      tipo: 'COLOR',
      valores: { Light: '#aa3377', Dark: '#ff66aa' },
    },
    {
      nome: 'color/brand/100',
      colecao: 'Colors',
      tipo: 'COLOR',
      valores: { Light: '#ffe0ee', Dark: '#331122' },
    },
    {
      nome: 'color/background',
      colecao: 'Colors',
      tipo: 'COLOR',
      valores: { Light: '#ffffff', Dark: '#101010' },
    },
    {
      nome: 'color/text/primary',
      colecao: 'Colors',
      tipo: 'COLOR',
      valores: { Light: '#111111', Dark: '#f5f5f5' },
    },
    {
      nome: 'color/text/muted',
      colecao: 'Colors',
      tipo: 'COLOR',
      valores: { Light: '#666666', Dark: '#aaaaaa' },
    },
    {
      nome: 'color/on-primary',
      colecao: 'Colors',
      tipo: 'COLOR',
      valores: { Light: '#ffffff', Dark: '#000000' },
    },
    {
      nome: 'color/error',
      colecao: 'Colors',
      tipo: 'COLOR',
      valores: { Light: '#d00000', Dark: '#ff5555' },
    },
    { nome: 'spacing/2', colecao: 'Spacing', tipo: 'FLOAT', valores: { Default: 8 } },
    { nome: 'spacing/4', colecao: 'Spacing', tipo: 'FLOAT', valores: { Default: 16 } },
    { nome: 'spacing/6', colecao: 'Spacing', tipo: 'FLOAT', valores: { Default: 24 } },
    { nome: 'radius/sm', colecao: 'Radius', tipo: 'FLOAT', valores: { Default: 4 } },
    { nome: 'radius/md', colecao: 'Radius', tipo: 'FLOAT', valores: { Default: 10 } },
    { nome: 'radius/full', colecao: 'Radius', tipo: 'FLOAT', valores: { Default: 999 } },
  ],
  estilosTexto: [
    {
      nome: 'Heading/H1',
      familia: 'Playfair Display',
      estilo: 'Bold',
      tamanho: 44,
      alturaLinha: 52.8,
    },
    { nome: 'Heading/H2', familia: 'Playfair Display', estilo: 'Semi Bold', tamanho: 32 },
    { nome: 'Body/Regular', familia: 'Lato', estilo: 'Regular', tamanho: 16, alturaLinha: 24 },
    { nome: 'Caption', familia: 'Lato', estilo: 'Medium', tamanho: 12 },
  ],
  sombras: [{ nome: 'Shadow/md', x: 0, y: 4, raio: 12, espalhar: 0, opacidade: 0.2 }],
};

describe('Design system do Figma → Fundação', () => {
  it('reconhece cores (Dark/Light), textos, espaços, raios e sombras pelo nome', () => {
    const r = fundacaoDoFigma(ds);
    const f = r.fundacao;
    expect(validarFundacao(f)).toEqual([]);
    expect(f.nome).toBe('Bloomina DS');
    expect(f.cores.primaria).toEqual({ escuro: '#ff66aa', claro: '#aa3377' });
    expect(f.cores.fundo).toEqual({ escuro: '#101010', claro: '#ffffff' });
    expect(f.cores.texto.claro).toBe('#111111');
    expect(f.cores['texto-suave'].claro).toBe('#666666');
    expect(f.cores['sobre-primaria'].claro).toBe('#ffffff');
    expect(f.cores.perigo.claro).toBe('#d00000');
    expect(f.fontes).toMatchObject({ titulo: 'Playfair Display', corpo: 'Lato' });
    expect(f.texto.h1).toMatchObject({ familia: 'titulo', peso: 700, tamanho: 44, altura: 1.2 });
    expect(f.texto.corpo).toMatchObject({ familia: 'corpo', peso: 400, tamanho: 16, altura: 1.5 });
    expect(f.texto.legenda.peso).toBe(500);
    expect(f.espacos['2']).toBe(8);
    expect(f.espacos['4']).toBe(16);
    expect(f.raios).toMatchObject({ p: 4, m: 10, pill: 999 });
    expect(f.sombras.m).toMatchObject({ y: 4, raio: 12, opacidade: 0.2 });
    expect(r.reconhecido.length).toBeGreaterThan(10);
    expect(r.padrao).toContain('cor sucesso');
  });

  it('lê do Figma: variáveis (com alias), estilos de texto e de efeito', async () => {
    const { figma } = criarFigmaMock();
    const f = figma as unknown as Record<string, unknown>;
    const vars: Record<string, unknown> = {
      v1: {
        name: 'primary',
        resolvedType: 'COLOR',
        valuesByMode: { m1: { r: 1, g: 0, b: 0, a: 1 } },
      },
      v2: {
        name: 'brand',
        resolvedType: 'COLOR',
        valuesByMode: { m1: { type: 'VARIABLE_ALIAS', id: 'v1' } },
      },
      v3: { name: 'spacing/4', resolvedType: 'FLOAT', valuesByMode: { m1: 16 } },
    };
    f['variables'] = {
      ...(f['variables'] as object),
      getLocalVariableCollectionsAsync: async () => [
        {
          name: 'Tokens',
          modes: [{ modeId: 'm1', name: 'Default' }],
          variableIds: ['v1', 'v2', 'v3'],
        },
      ],
      getVariableByIdAsync: async (id: string) => vars[id],
    };
    f['getLocalTextStylesAsync'] = async () => [
      {
        name: 'Body',
        fontName: { family: 'Lato', style: 'Regular' },
        fontSize: 16,
        lineHeight: { unit: 'PERCENT', value: 150 },
        letterSpacing: { unit: 'PIXELS', value: 0 },
      },
    ];
    f['getLocalEffectStylesAsync'] = async () => [
      {
        name: 'Elevation',
        effects: [
          { type: 'DROP_SHADOW', offset: { x: 0, y: 2 }, radius: 8, spread: 0, color: { a: 0.3 } },
        ],
      },
    ];
    f['root'] = { name: 'Meu DS' };
    const lido = await lerDesignSystem(figma);
    expect(lido.variaveis.find((v) => v.nome === 'brand')!.valores['Default']).toBe('#ff0000');
    expect(lido.estilosTexto[0]).toMatchObject({ familia: 'Lato', alturaLinha: 24 });
    expect(lido.sombras![0]).toMatchObject({ y: 2, raio: 8, opacidade: 0.3 });
    expect(fundacaoDoFigma(lido).fundacao.cores.primaria.claro).toBe('#ff0000');
  });
});
