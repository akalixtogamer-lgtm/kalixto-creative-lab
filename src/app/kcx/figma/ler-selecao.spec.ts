import { describe, expect, it } from 'vitest';
import { NoMock, criarFigmaMock } from './figma-mock';
import { lerSelecao, limparSvg } from './ler-selecao';
import { criarPacote, serializar } from '../serializar';
import { validarPacote } from '../validar';
import { resolverSaidas, valoresAtuais } from '../resolver';
import { planejarFigma } from '../figma-plano';
import { importarNoFigma } from './construir';
import { montarDocumentoKcx } from '../documento';

const roxo = { r: 0.83, g: 0.07, b: 0.62 };

/** Card desenhado no Figma: Auto Layout vertical, texto, botão e ícone. */
function desenho(): NoMock {
  const card = Object.assign(new NoMock('FRAME'), {
    name: 'Card Aula',
    width: 320,
    height: 200,
    layoutMode: 'VERTICAL',
    itemSpacing: 12,
    paddingLeft: 24,
    paddingRight: 24,
    paddingTop: 20,
    paddingBottom: 20,
    primaryAxisAlignItems: 'MIN',
    counterAxisAlignItems: 'MIN',
    cornerRadius: 16,
    fills: [{ type: 'SOLID', color: { r: 0.1, g: 0.08, b: 0.19 }, visible: true }],
    effects: [
      {
        type: 'DROP_SHADOW',
        color: { r: 0, g: 0, b: 0, a: 0.4 },
        offset: { x: 0, y: 8 },
        radius: 24,
        spread: 0,
        visible: true,
      },
    ],
  });
  const titulo = Object.assign(new NoMock('TEXT'), {
    name: 'Título',
    characters: 'Samba no pé',
    fontSize: 24,
    fontName: { family: 'Inter', style: 'Bold' },
    textAutoResize: 'WIDTH_AND_HEIGHT',
    fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, visible: true }],
    width: 150,
    height: 30,
  });
  const botao = Object.assign(new NoMock('FRAME'), {
    name: 'Botão',
    layoutMode: 'HORIZONTAL',
    layoutSizingHorizontal: 'HUG',
    layoutSizingVertical: 'HUG',
    itemSpacing: 8,
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 10,
    paddingBottom: 10,
    cornerRadius: 16,
    width: 120,
    height: 40,
    fills: [{ type: 'SOLID', color: roxo, visible: true }],
  });
  const rotulo = Object.assign(new NoMock('TEXT'), {
    name: 'Rótulo',
    characters: 'Inscrever',
    fontSize: 16,
    fontName: { family: 'Inter', style: 'Semi Bold' },
    fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, visible: true }],
    width: 80,
    height: 20,
  });
  const icone = Object.assign(new NoMock('VECTOR'), { name: 'Seta', width: 24, height: 24 });
  botao.appendChild(rotulo);
  botao.appendChild(icone);
  card.appendChild(titulo);
  card.appendChild(botao);
  return card;
}

describe('Figma → KCX (lerSelecao)', () => {
  it('gera um componente KCX válido com cores, textos, raios e espaços como variáveis', async () => {
    const { figma } = criarFigmaMock();
    const comp = await lerSelecao(figma, desenho(), { agora: new Date('2026-11-18T12:00:00Z') });
    expect(comp.id).toBe('card-aula');
    const pacote = criarPacote([comp]);
    expect(validarPacote(JSON.parse(serializar(pacote))).erros).toEqual([]);
    const tipos = comp.variaveis.map((v) => v.tipo);
    expect(tipos.filter((t) => t === 'color').length).toBeGreaterThanOrEqual(3);
    expect(comp.variaveis.find((v) => v.valor === 'Samba no pé')).toBeDefined();
    expect(comp.variaveis.find((v) => v.valor === 'Inscrever')).toBeDefined();
    // o raio 16 aparece duas vezes e vira uma variável só
    expect(comp.variaveis.filter((v) => v.id.startsWith('raio'))).toHaveLength(1);
    // CSS fiel ao Auto Layout
    expect(comp.codigo.css).toContain('flex-direction: column');
    expect(comp.codigo.css).toContain('font-weight: 700');
    // toda custom property usada é definida
    const definidas = Object.keys(
      resolverSaidas(comp.variaveis, valoresAtuais(comp.variaveis)).cssVars,
    );
    for (const m of comp.codigo.css.matchAll(/var\((--kcx-[a-z0-9-]+)\)/g))
      expect(definidas).toContain(m[1]);
    // SVG do vetor sem script nem evento
    expect(comp.codigo.html).toContain('<svg class="kcx-card-aula__n');
    expect(comp.codigo.html).not.toMatch(/script|onload/);
    expect(montarDocumentoKcx(comp, {}, { modo: 'preview' })).toContain('Samba no pé');
  });

  it('a animação é escolhida por variável e volta ao Figma sem falhas', async () => {
    const { figma } = criarFigmaMock();
    const comp = await lerSelecao(figma, desenho());
    const anim = comp.variaveis.find((v) => v.id === 'animacao')!;
    expect(anim.opcoes!.map((o) => o.valor)).toContain('hover-elevar');
    const saidas = resolverSaidas(comp.variaveis, {
      ...valoresAtuais(comp.variaveis),
      animacao: 'flutuar',
    });
    expect(saidas.atributos).toContainEqual({
      seletor: '.kcx-card-aula',
      atributo: 'data-animacao',
      valor: 'flutuar',
    });
    expect(comp.codigo.css).toContain('[data-animacao="flutuar"]');
    const destino = criarFigmaMock();
    const rel = await importarNoFigma(
      destino.figma,
      planejarFigma(criarPacote([comp])),
      '{}',
      'atualizar',
    );
    expect(rel.vinculosFalhos).toEqual([]);
  });

  it('conjunto de variantes: importa a padrão e avisa', async () => {
    const { figma } = criarFigmaMock();
    const set = Object.assign(new NoMock('COMPONENT_SET'), { name: 'Botões' });
    const v1 = desenho();
    set.appendChild(v1);
    const comp = await lerSelecao(figma, set);
    expect(comp.id).toBe('botoes');
    expect(comp.descricao).toContain('variante padrão');
  });

  it('variante selecionada: nome vem do conjunto', async () => {
    const { figma } = criarFigmaMock();
    const set = Object.assign(new NoMock('COMPONENT_SET'), { name: 'Menu' });
    const v = Object.assign(desenho(), { name: 'Estado=Aberto' });
    set.appendChild(v);
    const comp = await lerSelecao(figma, v);
    expect(comp.nome).toBe('Menu — Aberto');
    expect(comp.id).toBe('menu-aberto');
  });

  it('limparSvg remove script, eventos e javascript:', () => {
    expect(
      limparSvg('<svg onclick="x()"><a href="javascript:alert(1)"/><script>1</script></svg>'),
    ).toBe('<svg><a href="#"/></svg>');
  });
});
