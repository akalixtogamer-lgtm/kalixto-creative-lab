import { describe, expect, it } from 'vitest';
import { planejarFigma } from '../figma-plano';
import { criarPacote } from '../serializar';
import { alinhar, distribuirVertical, empilhar, encaixar } from './alinhar';
import { configPadrao, montarDoConstrutor, tipoConstrutor } from './index';
import { montarTela, posicoesDaTela } from './tela';

describe('Telas em posição livre', () => {
  it('ímã: encaixa no centro da página e na borda de outra seção, com guias', () => {
    const r = encaixar(
      { x: 517, y: 98, w: 400, h: 100 },
      [{ x: 100, y: 300, w: 300, h: 80 }],
      1440,
    );
    expect(r.x).toBe(520); // centro 720 - 200
    expect(r.guias).toContainEqual({ tipo: 'v', pos: 720 });
    const r2 = encaixar(
      { x: 103, y: 384, w: 200, h: 50 },
      [{ x: 100, y: 300, w: 300, h: 80 }],
      1440,
    );
    expect(r2).toMatchObject({ x: 100, y: 380 });
    const longe = encaixar({ x: 50, y: 50, w: 10, h: 10 }, [], 1440);
    expect(longe).toEqual({ x: 50, y: 50, guias: [] });
  });

  it('alinhar uma seção na página e várias entre si; distribuir; empilhar', () => {
    const cx = [
      { x: 10, y: 10, w: 100, h: 50 },
      { x: 300, y: 200, w: 200, h: 50 },
      { x: 50, y: 400, w: 100, h: 50 },
    ];
    expect(alinhar(cx, [0], 'centro', 1000)[0]).toEqual({ x: 450, y: 10 });
    expect(alinhar(cx, [0], 'direita', 1000)[0].x).toBe(900);
    const v = alinhar(cx, [0, 1], 'esquerda', 1000);
    expect(v[1].x).toBe(10);
    expect(alinhar(cx, [0, 1], 'base', 1000)[0].y).toBe(200);
    const d = distribuirVertical(cx, [0, 1, 2]);
    expect(d[1].y - (d[0].y + 50)).toBe(d[2].y - (d[1].y + 50));
    expect(empilhar(cx, 1000)).toEqual([
      { x: 450, y: 32 },
      { x: 400, y: 114 },
      { x: 450, y: 196 },
    ]);
  });

  it('a tela livre vira frame com as seções nas posições (código e Figma)', () => {
    const botao = montarDoConstrutor({
      ...configPadrao(tipoConstrutor('botao')!, 'Botão'),
      id: 'botao-x',
    });
    const hero = montarDoConstrutor({
      ...configPadrao(tipoConstrutor('hero')!, 'Hero'),
      id: 'hero-x',
    });
    const tela = {
      nome: 'Livre',
      dispositivo: 'desktop' as const,
      fidelidade: 'alta' as const,
      secoes: ['hero-x', 'botao-x'],
      livre: true,
      posicoes: [{ x: 40, y: 60 }],
    };
    const pos = posicoesDaTela(tela, [hero, botao]);
    expect(pos[0]).toEqual({ x: 40, y: 60 });
    expect(pos[1].y).toBeGreaterThan(60);
    const c = montarTela(tela, [hero, botao]);
    expect(c.codigo.css).toContain('position: absolute');
    expect(c.codigo.css).toContain('left: 40px; top: 60px;');
    const raiz = planejarFigma(criarPacote([c])).componentes.find((x) => x.id === c.id)!
      .variantes[0].arvore;
    expect(raiz.autoLayout).toBeFalsy();
    expect(raiz.filhos[0]).toMatchObject({ x: 40, y: 60 });
    // Empilhada continua como era
    const empilhada = montarTela({ ...tela, livre: false }, [hero, botao]);
    expect(empilhada.codigo.css).toContain('flex-direction: column');
  });
});
