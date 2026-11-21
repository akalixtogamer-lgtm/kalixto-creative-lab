import { describe, expect, it } from 'vitest';
import { contraste, escalaTonal, notaContraste } from './cores';
import { planejarFigma } from './figma-plano';
import {
  FUNDACAO_PADRAO,
  GRUPOS_COR,
  TOKENS_COR,
  completarFundacao,
  cssDaFundacao,
  funcaoDaCor,
  validarFundacao,
  variaveisDaFundacao,
} from './fundacao';
import { contrastesDaFundacao, guiaDoDesignSystem } from './guia-design-system';
import { KCX_COMPONENTES } from './componentes';
import { criarPacote } from './serializar';

describe('Design system completo', () => {
  it('escala tonal de 50 a 900 e contraste WCAG', () => {
    const e = escalaTonal('#d4119f');
    expect(e.map((x) => x.passo)).toEqual([50, 100, 200, 300, 400, 500, 600, 700, 800, 900]);
    expect(e[5].cor).toBe('#d4119f');
    expect(contraste('#000000', '#ffffff')).toBe(21);
    expect(notaContraste(4.6, 'texto')).toBe('AA');
    expect(notaContraste(3.2, 'texto')).toBe('Falha');
    expect(notaContraste(3.2, 'interface')).toBe('AA');
  });

  it('toda cor está num grupo de função e tem uma função (editável)', () => {
    const agrupadas = GRUPOS_COR.flatMap((g) => g.tokens);
    expect([...agrupadas].sort()).toEqual([...TOKENS_COR].sort());
    const f = completarFundacao({ ...FUNDACAO_PADRAO, funcoes: { primaria: 'Só no CTA' } });
    expect(funcaoDaCor(f, 'primaria')).toBe('Só no CTA');
    expect(funcaoDaCor(f, 'fundo')).toContain('Fundo da página');
    expect(validarFundacao(f)).toEqual([]);
  });

  it('movimento e layout: padrão, validação, CSS e Figma', () => {
    const f = completarFundacao(FUNDACAO_PADRAO);
    expect(f.movimento?.normal).toBe(300);
    expect(f.layout?.colunas).toBe(12);
    expect(
      validarFundacao({ ...f, movimento: { ...f.movimento!, easing: 'rápido' } }).join(' '),
    ).toContain('easing');
    expect(validarFundacao({ ...f, layout: { ...f.layout!, colunas: 40 } }).join(' ')).toContain(
      'colunas',
    );
    const css = cssDaFundacao(f);
    expect(css).toContain('--kx-escala-primaria-100');
    expect(css).toContain('--kx-movimento-normal: 300ms');
    expect(css).toContain('.kx-grid');
    const vars = variaveisDaFundacao(f).map((v) => v.nome);
    expect(vars).toContain('Fundação/escala/primaria/900');
    expect(vars).toContain('Fundação/layout/container');
    expect(vars).toContain('Fundação/movimento/rapido');
  });

  it('o guia tem todas as seções, escapa textos e mostra componentes', () => {
    const f = completarFundacao({
      ...FUNDACAO_PADRAO,
      nome: 'Bloomina <script>',
      funcoes: { destaque: 'Use em <b>selos</b>' },
    });
    const comp = KCX_COMPONENTES[0];
    const arvore = planejarFigma(criarPacote([comp])).componentes[0].variantes[0].arvore;
    const html = guiaDoDesignSystem(f, {
      tema: 'claro',
      data: '2026-11-21',
      componentes: [
        {
          nome: comp.nome,
          categoria: comp.categoria,
          variantes: 2,
          arvore,
          largura: 320,
          altura: 120,
        },
      ],
    });
    for (const id of [
      'cores',
      'escalas',
      'contraste',
      'tipografia',
      'espacos',
      'raios',
      'sombras',
      'movimento',
      'grid',
      'componentes',
      'codigo',
    ])
      expect(html).toContain(`<section id="${id}">`);
    expect(html).not.toContain('<script>');
    expect(html).toContain('Bloomina &lt;script&gt;');
    expect(html).toContain('Use em &lt;b&gt;selos&lt;/b&gt;');
    expect(html).toContain(comp.nome);
    expect(html).toContain('data-tema="claro"');
    const c = contrastesDaFundacao(f, 'escuro');
    expect(c.find((p) => p.texto === 'texto' && p.fundo === 'fundo')!.nota).toBe('AAA');
  });
});
