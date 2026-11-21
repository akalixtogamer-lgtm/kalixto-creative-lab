import { describe, expect, it } from 'vitest';
import { TIPOS_CONSTRUTOR, configPadrao, montarDoConstrutor } from '.';
import { KCX_COMPONENTES } from '../componentes';
import { importarNoFigma } from '../figma/construir';
import { criarFigmaMock } from '../figma/figma-mock';
import { PlanoNo, planejarFigma } from '../figma-plano';
import { FUNDACAO_PADRAO } from '../fundacao';
import { KcxComponente } from '../kcx.types';
import { criarPacote, serializar } from '../serializar';
import { validarComponente } from '../validar';
import { MODELOS_MONTADOR, configMontada } from './montado';
import { camadaSugerida, camadasParaVidro, comVidro } from './vidro';

const todos: KcxComponente[] = [
  ...KCX_COMPONENTES,
  ...TIPOS_CONSTRUTOR.map((t) => montarDoConstrutor(configPadrao(t))),
  ...MODELOS_MONTADOR.map((m) =>
    montarDoConstrutor(configMontada(m.sugestao, m.criar(), FUNDACAO_PADRAO)),
  ),
];

const achar = (n: PlanoNo, id: string): PlanoNo | undefined =>
  n.id === id ? n : n.filhos.map((f) => achar(f, id)).find(Boolean);

describe('Vidro em qualquer componente', () => {
  it.each(todos.map((c) => [c.id, c] as const))(
    '%s: vira vidro válido, com Background blur no Figma',
    async (_id, comp) => {
      const { comp: v } = comVidro(comp);
      expect(v.id).toBe(`${comp.id}-vidro`);
      expect(validarComponente(v, v.id).map((e) => `${e.caminho}: ${e.mensagem}`)).toEqual([]);
      const pacote = criarPacote([v], { fundacao: FUNDACAO_PADRAO });
      const plano = planejarFigma(pacote);
      const alvo = achar(plano.componentes[0].variantes[0].arvore, camadaSugerida(comp))!;
      expect(alvo.efeitos.some((e) => e.tipo === 'BACKGROUND_BLUR')).toBe(true);
      const rel = await importarNoFigma(
        criarFigmaMock().figma,
        plano,
        serializar(pacote),
        'atualizar',
      );
      expect(rel.vinculosFalhos).toEqual([]);
    },
  );

  it('fundo e borda translúcidos no Figma e no código; o original não muda', () => {
    const card = montarDoConstrutor(
      configMontada(
        'Card',
        MODELOS_MONTADOR.find((m) => m.id === 'card')!.criar(),
        FUNDACAO_PADRAO,
      ),
    );
    const antes = JSON.stringify(card);
    const { comp: v, avisos } = comVidro(card, { fundo: 40, borda: 25, desfoque: 'g' });
    expect(JSON.stringify(card)).toBe(antes);
    expect(avisos).toEqual([]);
    expect(v.codigo.css).toContain('backdrop-filter: blur(24px)');
    expect(v.codigo.css).toMatch(/background: color-mix\(in srgb, var\([^)]+\) 40%, transparent\)/);
    expect(v.codigo.css).toMatch(/outline: 1px solid color-mix\(in srgb, var\([^)]+\) 25%/);
    const raiz = planejarFigma(criarPacote([v])).componentes[0].variantes[0].arvore;
    const a = (p: unknown) => (p as { cor: { valor: { a: number } } }).cor.valor.a;
    expect(a(raiz.preenchimentos[0])).toBeCloseTo(0.4, 2);
    expect(raiz.efeitos).toContainEqual(
      expect.objectContaining({
        tipo: 'BACKGROUND_BLUR',
        raio: expect.objectContaining({ valor: 48 }),
      }),
    );
  });

  it('dá para escolher a camada, e ids não se repetem', () => {
    const c = KCX_COMPONENTES.find((x) => x.id === 'hover-lift')!;
    const camadas = camadasParaVidro(c);
    expect(camadas.length).toBeGreaterThan(0);
    const ultima = camadas[camadas.length - 1].id;
    const { comp: v } = comVidro(c, { fundo: 30, borda: 20, desfoque: 'p', camada: ultima }, [
      'hover-lift-vidro',
    ]);
    expect(v.id).toBe('hover-lift-vidro-2');
    expect(
      achar(planejarFigma(criarPacote([v])).componentes[0].variantes[0].arvore, ultima)!.efeitos,
    ).toContainEqual(expect.objectContaining({ tipo: 'BACKGROUND_BLUR' }));
    // vidro de um vidro não acumula sufixos
    expect(comVidro(v).comp.id).toBe('hover-lift-vidro');
  });
});
