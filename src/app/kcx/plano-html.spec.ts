import { describe, expect, it } from 'vitest';
import { KCX_COMPONENTES } from './componentes';
import { planejarFigma } from './figma-plano';
import { documentoDaGrade } from './plano-html';
import { criarPacote } from './serializar';

describe('documentoDaGrade', () => {
  const comp = planejarFigma(criarPacote([KCX_COMPONENTES[0]])).componentes[0];
  const itens = comp.variantes.map((v) => ({
    arvore: v.arvore,
    rotulo: Object.values(v.propriedades).join(' · '),
  }));

  it('desenha todas as variantes num único documento, um botão por variante', () => {
    const doc = documentoDaGrade(itens, { selecionada: 1 });
    expect(doc.match(/class="m"/g)).toHaveLength(itens.length);
    expect(doc).toContain('data-i="1" aria-pressed="true"');
    expect(doc).toContain('Content-Security-Policy');
  });

  it('escapa o rótulo', () => {
    const doc = documentoDaGrade([{ arvore: itens[0].arvore, rotulo: '"><img src=x onerror=1>' }]);
    expect(doc).not.toContain('<img src=x');
  });
});
