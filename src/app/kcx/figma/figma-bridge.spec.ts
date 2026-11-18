/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from 'vitest';
import { ANIMATED_GRADIENT_KCX, KCX_COMPONENTES, NEON_GLOW, SVG_MOTION } from '../componentes';
import { COMPOSICAO_PADRAO, pacoteComposicao, resolverComposicao } from '../composicao';
import { planejarFigma, matrizGradiente } from '../figma-plano';
import { clonar, compararValores, criarPacote, serializar } from '../serializar';
import { valoresAtuais } from '../resolver';
import { detectarDuplicados, importarNoFigma, lerAlteracoes } from './construir';
import { NoMock, criarFigmaMock } from './figma-mock';

const pacote = (comps = [NEON_GLOW], modo: any = 'completo') =>
  criarPacote(comps, { modo, agora: new Date('2026-11-18T12:00:00Z') });

async function importar(
  comps = [NEON_GLOW],
  modo: any = 'completo',
  mock = criarFigmaMock(),
  dup: any = 'atualizar',
) {
  const p = pacote(comps, modo);
  const rel = await importarNoFigma(mock.figma, planejarFigma(p, modo), serializar(p), dup);
  return { ...mock, rel, p };
}

const porNome = (vars: any[], nome: string) => vars.find((v) => v.name === nome);
const no = (raiz: NoMock, nome: string) => raiz.findAll((n) => n.name === nome)[0];

describe('Figma Bridge — plano', () => {
  it('cada variável vinculada no plano aponta para uma propriedade de camada', () => {
    const plano = planejarFigma(pacote(KCX_COMPONENTES));
    for (const v of plano.colecoes.flatMap((c) => c.variaveis)) {
      if (v.origem === 'documental') {
        expect(v.vinculadaA).toEqual([]);
        expect(v.descricao.startsWith('[Documental')).toBe(true);
      } else expect(v.vinculadaA.length, v.nome).toBeGreaterThan(0);
    }
  });
  it('organiza as coleções pedidas e cria modos Dark/Light só em Colors', () => {
    const plano = planejarFigma(pacote(KCX_COMPONENTES));
    expect(plano.colecoes.map((c) => c.nome)).toEqual([
      'KCX · Colors',
      'KCX · Dimensions',
      'KCX · Spacing',
      'KCX · Typography',
      'KCX · Motion',
      'KCX · Effects',
      'KCX · Components',
    ]);
    expect(plano.colecoes[0].modos).toEqual(['Dark', 'Light']);
    expect(plano.colecoes[1].modos).toEqual(['Valor']);
  });
  it('opacidade vai em porcentagem para a variável do Figma', () => {
    const v = planejarFigma(pacote())
      .colecoes.flatMap((c) => c.variaveis)
      .find((x) => x.nome === 'neon-glow/opacity')!;
    expect(v.valores['Valor']).toBe(100);
    expect(v.escopos).toEqual(['OPACITY']);
  });
  it('matriz do gradiente: 90° é a identidade (esquerda → direita)', () => {
    expect(matrizGradiente(90)).toEqual([
      [1, 0, 0],
      [0, 1, 0],
    ]);
  });
  it('modo visual não cria variáveis e modo variáveis não cria camadas', () => {
    expect(planejarFigma(pacote([NEON_GLOW], 'visual')).colecoes).toEqual([]);
    expect(planejarFigma(pacote([NEON_GLOW], 'variaveis')).componentes).toEqual([]);
  });
  it('SVG Motion: formas × quadros viram 9 variantes com ponto posicionado no caminho', () => {
    const plano = planejarFigma(pacote([SVG_MOTION]));
    const vs = plano.componentes[0].variantes;
    expect(vs).toHaveLength(9);
    const ponto = (i: number) => vs[i].arvore.filhos.find((f) => f.id === 'ponto')!;
    expect(ponto(6).x).toBeCloseTo(10 - 7); // início da onda (10, 80) menos meio ponto
    expect(ponto(0).x).toBeCloseTo(390 - 7); // fim (primeira variante = caminho completo)
    const dash = (i: number) =>
      vs[i].arvore.filhos.find((f) => f.id === 'linha')!.svgTraco!.tracejado![0];
    expect(dash(6)).toBeLessThan(1);
    expect(dash(0)).toBeGreaterThan(300);
  });
});

describe('Figma Bridge — importação (API simulada)', () => {
  it('cria coleções, modos e variáveis com tipo, valor, escopo e code syntax', async () => {
    const { colecoes, variaveis, rel } = await importar();
    expect(colecoes.find((c) => c.name === 'KCX · Colors').modes.map((m: any) => m.name)).toEqual([
      'Dark',
      'Light',
    ]);
    const prim = porNome(variaveis, 'neon-glow/primary-color');
    expect(prim.resolvedType).toBe('COLOR');
    expect(Object.values(prim.valuesByMode)[0]).toEqual({ r: 1, g: 0.1686, b: 0.8392, a: 1 });
    expect(prim.codeSyntax.WEB).toBe('var(--kcx-neon-glow-primary)');
    const bg = porNome(variaveis, 'neon-glow/background-color');
    expect(Object.values(bg.valuesByMode)[1]).toEqual({ r: 1, g: 1, b: 1, a: 1 }); // Light
    const doc = porNome(variaveis, 'neon-glow/pulse-duration');
    expect(doc.resolvedType).toBe('TIMING'); // TIMING não aceita escopo (verificado no Figma)
    expect(porNome(variaveis, 'neon-glow/glow-distance').scopes).toEqual([]); // documental fica fora dos seletores
    expect(Object.values(doc.valuesByMode)[0]).toBe(2);
    expect(porNome(variaveis, 'neon-glow/radius').resolvedType).toBe('FLOAT');
    expect(rel.vinculosFalhos).toEqual([]);
  });

  it('vincula as variáveis às camadas: gradiente, desfoque, visibilidade, borda, padding e sombra', async () => {
    const { pagina, variaveis } = await importar();
    const set = pagina.children.find((n) => n.type === 'COMPONENT_SET')!;
    expect(set.children.map((c) => c.name)).toEqual([
      'Estado=Padrão',
      'Estado=Hover',
      'Estado=Foco',
      'Estado=Sem brilho',
    ]);
    const id = (n: string) => porNome(variaveis, n).id;
    const padrao = set.children[0];
    const halo = no(padrao, 'Halo');
    expect(halo.fills[0].gradientStops.map((s: any) => s.boundVariables.color.id)).toEqual([
      id('neon-glow/primary-color'),
      id('neon-glow/secondary-color'),
    ]);
    expect(halo.effects[0].boundVariables.radius.id).toBe(id('neon-glow/blur'));
    expect(halo.boundVariables['visible'].id).toBe(id('neon-glow/glow-enabled'));
    expect(halo.boundVariables['opacity'].id).toBe(id('neon-glow/halo-opacity'));
    const botao = no(padrao, 'Botão');
    expect(botao.strokes[0].boundVariables.color.id).toBe(id('neon-glow/primary-color'));
    expect(botao.boundVariables['strokeWeight'].id).toBe(id('neon-glow/border-width'));
    expect(botao.boundVariables['paddingLeft'].id).toBe(id('neon-glow/padding-x'));
    expect(botao.effects[0].boundVariables.radius.id).toBe(id('neon-glow/glow-reach'));
    // Variantes com valores próprios usam variáveis próprias
    expect(no(set.children[1], 'Halo').boundVariables['opacity'].id).toBe(
      id('neon-glow/hover/halo-opacity'),
    );
    expect(no(set.children[3], 'Halo').boundVariables['visible'].id).toBe(
      id('neon-glow/desligado/glow-enabled'),
    );
  });

  it('cria a propriedade de texto com padrão ligado à variável e guarda o código', async () => {
    const { pagina, variaveis, p } = await importar();
    const set = pagina.children.find((n) => n.type === 'COMPONENT_SET')!;
    const [chave, def] = Object.entries(set.componentPropertyDefinitions)[0] as [string, any];
    expect(chave.startsWith('Rótulo')).toBe(true);
    expect(def.defaultValue.id).toBe(porNome(variaveis, 'neon-glow/label').id);
    expect(no(set.children[0], 'Rótulo').componentPropertyReferences).toEqual({
      characters: chave,
    });
    expect(JSON.parse(set.getSharedPluginData('kcx', 'pacote'))).toEqual(p);
    const doc = pagina.children.find((n) => n.name.includes('documentação'))!;
    expect(
      doc
        .findAll((n) => n.type === 'TEXT')
        .some((t) => t['characters'].includes('.kcx-neon-glow__halo')),
    ).toBe(true);
  });

  it('tempo vira TIMING (segundos) e easing vira EASING; atraso em ms é convertido', async () => {
    const { variaveis } = await importar([ANIMATED_GRADIENT_KCX]);
    const delay = porNome(variaveis, 'animated-gradient/delay');
    expect(delay.resolvedType).toBe('TIMING');
    const easing = porNome(variaveis, 'animated-gradient/easing');
    expect(easing.resolvedType).toBe('EASING');
    expect(Object.values(easing.valuesByMode)[0]).toEqual({
      type: 'CUSTOM_CUBIC_BEZIER',
      easingFunctionCubicBezier: { x1: 0.42, y1: 0, x2: 0.58, y2: 1 },
    });
  });

  it('o raio é vinculado canto a canto', async () => {
    const { pagina, variaveis } = await importar();
    const botao = no(pagina.children.find((n) => n.type === 'COMPONENT_SET')!.children[0], 'Botão');
    for (const c of ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius']) {
      expect(botao.boundVariables[c].id).toBe(porNome(variaveis, 'neon-glow/radius').id);
    }
  });

  it('SVG Motion: vetores com traço vinculado e ponto com tamanho vinculado', async () => {
    const { pagina, variaveis } = await importar([SVG_MOTION]);
    const set = pagina.children.find((n) => n.type === 'COMPONENT_SET')!;
    expect(set.children).toHaveLength(9);
    const linha = no(set.children[0], 'Linha').children[0];
    expect(linha.type).toBe('VECTOR');
    expect(linha.boundVariables['strokeWeight'].id).toBe(
      porNome(variaveis, 'svg-motion/stroke-width').id,
    );
    expect(linha.strokes[0].boundVariables.color.id).toBe(
      porNome(variaveis, 'svg-motion/stroke-color').id,
    );
    expect(no(set.children[0], 'Ponto').boundVariables['width'].id).toBe(
      porNome(variaveis, 'svg-motion/dot-size').id,
    );
  });

  it('Animated Gradient: cada parada do gradiente vira uma variável de cor vinculada', async () => {
    const { pagina, variaveis } = await importar([ANIMATED_GRADIENT_KCX]);
    const raiz = pagina.children.find((n) => n.type === 'COMPONENT_SET')!.children[0];
    expect(raiz.fills[0].gradientStops.map((s: any) => s.boundVariables.color.id)).toEqual(
      [1, 2, 3].map((i) => porNome(variaveis, `animated-gradient/gradient/stop-${i}`).id),
    );
  });

  it('modo visual: camadas sem nenhuma variável nem vínculo', async () => {
    const { variaveis, pagina, rel } = await importar([NEON_GLOW], 'visual');
    expect(variaveis).toEqual([]);
    expect(rel.vinculos).toBe(0);
    expect(pagina.children.some((n) => n.type === 'COMPONENT_SET')).toBe(true);
  });

  it('duplicações: detecta, atualiza sem duplicar ou cria cópias', async () => {
    const mock = criarFigmaMock();
    await importar([NEON_GLOW], 'completo', mock);
    const total = mock.variaveis.length;
    const dup = await detectarDuplicados(mock.figma, planejarFigma(pacote()));
    expect(dup.variaveis.length).toBe(total);
    expect(dup.componentes).toEqual(['Neon Glow (neon-glow)']);
    await importar([NEON_GLOW], 'completo', mock, 'atualizar');
    expect(mock.variaveis.length).toBe(total);
    await importar([NEON_GLOW], 'completo', mock, 'copia');
    expect(mock.variaveis.length).toBe(total * 2);
    expect(porNome(mock.variaveis, 'neon-glow/primary-color 2')).toBeTruthy();
  });

  it('composição: variáveis das camadas viram alias da compartilhada e há um quadro com instâncias', async () => {
    const camadas = resolverComposicao(COMPOSICAO_PADRAO, KCX_COMPONENTES);
    const p = pacoteComposicao(COMPOSICAO_PADRAO, camadas);
    const mock = criarFigmaMock();
    const rel = await importarNoFigma(mock.figma, planejarFigma(p), serializar(p));
    const comp = porNome(mock.variaveis, 'hero-neon/cor-destaque');
    const alvo = porNome(mock.variaveis, 'neon-glow/primary-color');
    expect(Object.values(alvo.valuesByMode)[0]).toEqual({ type: 'VARIABLE_ALIAS', id: comp.id });
    const quadro = mock.pagina.children.find((n) => n.name === 'KCX · Hero Neon')!;
    expect(quadro.children.map((c) => c.type)).toEqual(['INSTANCE', 'INSTANCE', 'INSTANCE']);
    expect(rel.composicao).toBe(quadro.id);
  });
});

describe('Figma → Lab', () => {
  it('lê os valores editados no Figma e o lab compara antes de aplicar', async () => {
    const { figma, pagina, variaveis } = await importar();
    const prim = porNome(variaveis, 'neon-glow/primary-color');
    const modo = Object.keys(prim.valuesByMode)[0];
    prim.setValueForMode(modo, { r: 0, g: 1, b: 0, a: 1 });
    const op = porNome(variaveis, 'neon-glow/opacity');
    op.setValueForMode(Object.keys(op.valuesByMode)[0], 50);
    const set = pagina.children.find((n) => n.type === 'COMPONENT_SET')!;
    const r = await lerAlteracoes(figma, no(set.children[0], 'Halo'));
    if ('erro' in r) throw new Error(r.erro);
    const arq = r.arquivo as { valores: Record<string, unknown> };
    expect(arq.valores['primaryColor']).toBe('#00ff00');
    expect(arq.valores['opacity']).toBe(0.5);
    const atuais = valoresAtuais(clonar(NEON_GLOW).variaveis);
    const diff = compararValores(NEON_GLOW.variaveis, atuais, arq.valores as never);
    expect(diff.diferencas.map((d) => d.variavel).sort()).toEqual(['opacity', 'primaryColor']);
  });
  it('recusa seleção que não veio do Figma Bridge', async () => {
    const { figma } = criarFigmaMock();
    const r = await lerAlteracoes(figma, new NoMock('FRAME'));
    expect('erro' in r).toBe(true);
  });
});
