import { describe, expect, it } from 'vitest';
import { analisarSequencia, easingMaisProximo } from './video';
import { cena } from './sinteticos';

const tipos = (r: ReturnType<typeof analisarSequencia>) => r.fichas.map((f) => f.tipo);

describe('análise de vídeo (sem DOM)', () => {
  it('rolagem com faixa presa no meio vira sticky, com região e origem vídeo', () => {
    const r = analisarSequencia(cena({ dy: 3, presas: 0, camada: undefined }), {
      larguraReferencia: 960,
    });
    expect(r.trechos[0].descricao).toBe('rolagem vertical');
    expect(r.fichas.every((f) => f.origem === 'video')).toBe(true);
  });

  it('reconhece sticky quando uma região fica parada durante a rolagem', () => {
    const r = analisarSequencia(cena({ dy: 3, presas: 48 }), { larguraReferencia: 960 });
    const s = r.fichas.find((f) => f.tipo === 'sticky');
    expect(s).toBeTruthy();
    expect(s!.regiao!.y).toBe(0);
    expect(s!.parametros.distancia).toBeGreaterThan(100);
  });

  it('reconhece parallax: uma faixa rola na metade da velocidade', () => {
    const r = analisarSequencia(cena({ dy: 4, camada: { y0: 64, y1: 128, fator: 0.5 } }));
    const p = r.fichas.find((f) => f.tipo === 'parallax');
    expect(p).toBeTruthy();
    expect(p!.parametros.fator).toBeCloseTo(0.5, 1);
  });

  it('reconhece scroll horizontal', () => {
    const r = analisarSequencia(cena({ dx: 3 }), { larguraReferencia: 960 });
    const h = r.fichas.find((f) => f.tipo === 'horizontal');
    expect(h).toBeTruthy();
    // Direção = para onde o conteúdo anda (a cena desliza para a esquerda).
    expect(h!.parametros.direcao).toBe('esquerda');
  });

  it('reconhece corte (transição) e não inventa efeito com a tela parada', () => {
    expect(tipos(analisarSequencia(cena({ corteEm: 4 })))).toContain('transicao');
    expect(analisarSequencia(cena({})).fichas).toEqual([]);
  });

  it('estima a curva do movimento', () => {
    const f = (t: number) => 1 - (1 - t) ** 3;
    const prog = Array.from({ length: 9 }, (_, i) => f(i / 8));
    expect(easingMaisProximo(prog)!.easing).not.toBe('linear');
    expect(easingMaisProximo([0, 0.25, 0.5, 0.75, 1])!.easing).toBe('linear');
  });

  it('com menos de 2 quadros explica o limite', () => {
    const r = analisarSequencia([]);
    expect(r.fichas).toEqual([]);
    expect(r.limites[0]).toContain('2 quadros');
  });
});
