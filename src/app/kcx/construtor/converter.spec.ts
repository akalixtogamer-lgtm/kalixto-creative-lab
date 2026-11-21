import { describe, expect, it } from 'vitest';
import { montarDoConstrutor } from '.';
import { FUNDACAO_PADRAO } from '../fundacao';
import { validarComponente } from '../validar';
import { converterParaTipo } from './converter';
import { CamadaMontada, configMontada } from './montado';

const card = (i: number): CamadaMontada => ({
  id: `card-${i}`,
  tipo: 'caixa',
  nome: `Card ${i}`,
  direcao: 'vertical',
  fundo: 'superficie',
  raio: 'g',
  padX: '4',
  padY: '4',
  filhos: [
    { id: `t-${i}`, tipo: 'texto', nome: 'Título', texto: `Aula ${i}`, nivel: 'h3', cor: 'texto' },
    {
      id: `d-${i}`,
      tipo: 'texto',
      nome: 'Desc',
      texto: `Descrição ${i}`,
      nivel: 'corpo',
      cor: 'texto-suave',
    },
  ],
});
const trilho = montarDoConstrutor(
  configMontada(
    'Trilho de aulas',
    {
      interativo: false,
      raiz: {
        id: 'raiz',
        tipo: 'caixa',
        nome: 'Seção',
        direcao: 'vertical',
        fundo: 'fundo',
        filhos: [
          {
            id: 'titulo',
            tipo: 'texto',
            nome: 'Título',
            texto: 'Nossas aulas',
            nivel: 'h2',
            cor: 'texto',
          },
          {
            id: 'linha',
            tipo: 'caixa',
            nome: 'Trilho',
            direcao: 'horizontal',
            espaco: '4',
            filhos: [1, 2, 3, 4, 5, 6, 7].map(card),
          },
        ],
      },
    },
    FUNDACAO_PADRAO,
  ),
);

describe('Converter um desenho em outro tipo', () => {
  it('trilho de cards → carrossel: um slide por card, cores e raio aproveitados', () => {
    const { cfg, aproveitado } = converterParaTipo(trilho, 'carrossel');
    expect(cfg.tipo).toBe('carrossel');
    expect(cfg.itens).toEqual([
      'Aula 1',
      'Aula 2',
      'Aula 3',
      'Aula 4',
      'Aula 5',
      'Aula 6',
      'Aula 7',
    ]);
    expect(cfg.textos['legenda']).toBe('Nossas aulas');
    expect(cfg.cores.fundo).toBe(FUNDACAO_PADRAO.cores.fundo.escuro);
    expect(cfg.raio).toBe(FUNDACAO_PADRAO.raios.g);
    expect(aproveitado.join(' ')).toContain('7 slide');
    const c = montarDoConstrutor(cfg);
    expect(validarComponente(c, c.id)).toEqual([]);
  });

  it('o mesmo desenho vira navbar (links) ou abas, respeitando o máximo de itens', () => {
    const nav = converterParaTipo(trilho, 'navbar').cfg;
    expect(nav.itens.length).toBeLessThanOrEqual(7);
    expect(nav.itens[0]).toBe('Aula 1');
    expect(nav.textos['marca']).toBe('Nossas aulas');
    for (const t of ['abas', 'acordeao-faq', 'card-de-foto', 'hero-topo-da-pagina']) {
      const id =
        t === 'acordeao-faq'
          ? 'acordeao'
          : t === 'card-de-foto'
            ? 'card-foto'
            : t === 'hero-topo-da-pagina'
              ? 'hero'
              : t;
      const c = montarDoConstrutor(converterParaTipo(trilho, id).cfg);
      expect(validarComponente(c, c.id)).toEqual([]);
    }
  });
});
