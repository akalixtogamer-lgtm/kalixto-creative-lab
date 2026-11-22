import { describe, expect, it } from 'vitest';
import { TIPOS_CONSTRUTOR, configPadrao, montarDoConstrutor } from '.';
import { KCX_COMPONENTES } from '../componentes';
import { importarNoFigma } from '../figma/construir';
import { criarFigmaMock } from '../figma/figma-mock';
import { PlanoNo, planejarFigma } from '../figma-plano';
import { FUNDACAO_PADRAO } from '../fundacao';
import { KcxComponente } from '../kcx.types';
import { resolverSaidas } from '../resolver';
import { criarPacote, serializar } from '../serializar';
import { validarComponente } from '../validar';
import { MODELOS_MONTADOR, configMontada } from './montado';
import {
  IDS_VIDRO,
  PRESETS_VIDRO,
  PRESET_VIDRO,
  ajustesAtuais,
  camadasParaVidro,
  comVidroEditavel,
  valoresVidro,
} from './vidro';

const todos: KcxComponente[] = [
  ...KCX_COMPONENTES,
  ...TIPOS_CONSTRUTOR.map((t) => montarDoConstrutor(configPadrao(t))),
  ...MODELOS_MONTADOR.map((m) =>
    montarDoConstrutor(configMontada(m.sugestao, m.criar(), FUNDACAO_PADRAO)),
  ),
];

const achar = (n: PlanoNo, id: string): PlanoNo | undefined =>
  n.id === id ? n : n.filhos.map((f) => achar(f, id)).find(Boolean);
const comValores = (c: KcxComponente, vals: Record<string, unknown>): KcxComponente => ({
  ...c,
  variaveis: c.variaveis.map((v) => ({ ...v, valor: (vals[v.id] ?? v.valor) as never })),
});
const alpha = (p: unknown) => (p as { cor?: { valor: { a: number } } }).cor?.valor.a;

describe('Vidro editável em qualquer componente', () => {
  it.each(todos.map((c) => [c.id, c] as const))(
    '%s: ganha as variáveis de vidro; desligado = original; ligado = Background blur',
    async (_id, comp) => {
      const { comp: v, camada } = comVidroEditavel(comp);
      expect(v.id).toBe(comp.id);
      expect(validarComponente(v, v.id).map((e) => `${e.caminho}: ${e.mensagem}`)).toEqual([]);
      expect(v.presets.some((p) => p.id === PRESET_VIDRO)).toBe(true);

      // Desligado: a camada mantém a opacidade e o desfoque é zero.
      const antes = achar(
        planejarFigma(criarPacote([comp])).componentes[0].variantes[0].arvore,
        camada,
      )!;
      const desl = achar(
        planejarFigma(criarPacote([v])).componentes[0].variantes[0].arvore,
        camada,
      )!;
      if (antes.preenchimentos[0]?.tipo === 'solido')
        expect(alpha(desl.preenchimentos[0])).toBeCloseTo(alpha(antes.preenchimentos[0])!, 2);
      const blur = (n: PlanoNo) =>
        n.efeitos.find((e) => e.tipo === 'BACKGROUND_BLUR') as
          { raio: { valor: number } } | undefined;
      expect(blur(desl)!.raio.valor).toBe(0);
      expect(
        resolverSaidas(v.variaveis, {}).atributos.every((a) =>
          a.atributo === 'data-kcx-vidro-desfoque' ? a.valor === '0' : true,
        ),
      ).toBe(true);

      // Ligado (preset Vidro, modelo Glass do Figma): gelo 4 px = Background blur 8,
      // com os dados do Glass, e importa no Figma sem falhas.
      const ligado = comValores(v, valoresVidro(v, true));
      const pacote = criarPacote([ligado], { fundacao: FUNDACAO_PADRAO });
      const plano = planejarFigma(pacote);
      const lig = achar(plano.componentes[0].variantes[0].arvore, camada)!;
      expect(blur(lig)!.raio.valor).toBe(8);
      expect(
        (lig.efeitos.find((e) => e.tipo === 'BACKGROUND_BLUR') as { vidro?: unknown }).vidro,
      ).toEqual({
        luz: 0.8,
        angulo: -45,
        refracao: 0.8,
        profundidade: 20,
        dispersao: 0.5,
      });
      const mock = criarFigmaMock();
      const rel = await importarNoFigma(mock.figma, plano, serializar(pacote), 'atualizar');
      expect(rel.vinculosFalhos).toEqual([]);
      const glass = mock.figma.currentPage
        .findAll(() => true)
        .flatMap((n: { effects?: { type: string }[] }) => n.effects ?? [])
        .filter((e: { type: string }) => e.type === 'GLASS');
      expect(glass.length).toBeGreaterThan(0);
    },
  );

  it('card montado: fundo a 25%, borda a 25% e regras de CSS que só valem fora do padrão', () => {
    const card = montarDoConstrutor(
      configMontada(
        'Card',
        MODELOS_MONTADOR.find((m) => m.id === 'card')!.criar(),
        FUNDACAO_PADRAO,
      ),
    );
    const antes = JSON.stringify(card);
    const { comp: v, avisos } = comVidroEditavel(card);
    expect(JSON.stringify(card)).toBe(antes);
    expect(avisos).toEqual([]);
    expect(v.codigo.css).toContain("[data-kcx-vidro-desfoque]:not([data-kcx-vidro-desfoque='0'])");
    expect(v.codigo.css).toContain("[data-kcx-vidro-luz]:not([data-kcx-vidro-luz='0'])");
    expect(v.codigo.css).toContain('cos(var(--kcx-card-vidro-angulo))');
    expect(v.codigo.css).toContain("[data-kcx-vidro-fundo]:not([data-kcx-vidro-fundo='1'])");
    expect(v.codigo.css).toMatch(
      /color-mix\(in srgb, var\([^)]+\) calc\(var\(--kcx-card-vidro-fundo\) \* 100%\)/,
    );
    const lig = comValores(v, valoresVidro(v, true));
    const raiz = planejarFigma(criarPacote([lig])).componentes[0].variantes[0].arvore;
    expect(alpha(raiz.preenchimentos[0])).toBeCloseTo(0.25, 2);
    const saidas = resolverSaidas(lig.variaveis, {});
    expect(saidas.cssVars['--kcx-card-vidro-desfoque']).toBe('4px');
    expect(saidas.cssVars['--kcx-card-vidro-angulo']).toBe('-45deg');
    expect(saidas.atributos).toContainEqual(
      expect.objectContaining({ atributo: 'data-kcx-vidro-fundo', valor: '0.25' }),
    );
  });

  it('camada sem fundo ganha véu; dá para escolher a camada; não duplica', () => {
    const c = KCX_COMPONENTES.find((x) => x.id === 'gauge-meter')!;
    const { comp: v } = comVidroEditavel(c);
    expect(v.variaveis.map((x) => x.id)).toEqual(
      expect.arrayContaining([
        IDS_VIDRO.veu,
        IDS_VIDRO.corVeu,
        IDS_VIDRO.borda,
        IDS_VIDRO.desfoque,
      ]),
    );
    expect(comVidroEditavel(v).comp).toBe(v);
    // Presets e ajustes salvos: aplica e lê de volta.
    for (const pr of PRESETS_VIDRO) {
      const vals = valoresVidro(v, true, pr.ajustes);
      const lidos = ajustesAtuais(v, vals);
      for (const [k, x] of Object.entries(pr.ajustes))
        if (k !== 'fundo') expect(lidos[k as keyof typeof lidos]).toBe(x);
    }
    const h = KCX_COMPONENTES.find((x) => x.id === 'neon-glow')!;
    const ultima = camadasParaVidro(h).at(-1)!.id;
    expect(comVidroEditavel(h, ultima).camada).toBe(ultima);
  });
});
