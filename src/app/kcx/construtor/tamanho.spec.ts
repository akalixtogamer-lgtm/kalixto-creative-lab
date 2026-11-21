import { describe, expect, it } from 'vitest';
import { TIPOS_CONSTRUTOR, configPadrao, montarDoConstrutor } from '.';
import { KCX_COMPONENTES } from '../componentes';
import { importarNoFigma } from '../figma/construir';
import { criarFigmaMock } from '../figma/figma-mock';
import { planejarFigma } from '../figma-plano';
import { FUNDACAO_PADRAO } from '../fundacao';
import { KcxComponente } from '../kcx.types';
import { resolverSaidas } from '../resolver';
import { criarPacote, serializar } from '../serializar';
import { validarComponente } from '../validar';
import { MODELOS_MONTADOR, configMontada } from './montado';
import { IDS_TAMANHO, comTamanhoEditavel } from './tamanho';
import { comVidroEditavel } from './vidro';

const todos: KcxComponente[] = [
  ...KCX_COMPONENTES,
  ...TIPOS_CONSTRUTOR.map((t) => montarDoConstrutor(configPadrao(t))),
  ...MODELOS_MONTADOR.map((m) =>
    montarDoConstrutor(configMontada(m.sugestao, m.criar(), FUNDACAO_PADRAO)),
  ),
];
const comValores = (c: KcxComponente, vals: Record<string, number>): KcxComponente => ({
  ...c,
  variaveis: c.variaveis.map((v) => (v.id in vals ? { ...v, valor: vals[v.id] } : v)),
});

const val = (x: unknown) => (x && typeof x === 'object' ? (x as { valor: unknown }).valor : x);

describe('Tamanho em px em qualquer componente', () => {
  it.each(todos.map((c) => [c.id, c] as const))(
    '%s: largura e altura em px; padrão = original; com vidro também',
    async (_id, comp) => {
      const t = comVidroEditavel(comTamanhoEditavel(comp)).comp;
      expect(validarComponente(t, t.id).map((e) => `${e.caminho}: ${e.mensagem}`)).toEqual([]);
      const L = t.variaveis.find((v) => v.id === IDS_TAMANHO.largura)!;
      const antes = planejarFigma(criarPacote([comp])).componentes[0].variantes[0].arvore;
      const depois = planejarFigma(criarPacote([t])).componentes[0].variantes[0].arvore;
      expect(val(depois.largura)).toEqual(val(antes.largura));
      const attr = resolverSaidas(t.variaveis, {}).atributos.find(
        (a) => a.atributo === 'data-kcx-largura',
      )!;
      expect(attr.valor).toBe(String(L.padrao));
      expect(t.codigo.css).toContain(`[data-kcx-largura]:not([data-kcx-largura='${L.padrao}'])`);
      const maior = comValores(t, { [IDS_TAMANHO.largura]: 777 });
      const pacote = criarPacote([maior]);
      const plano = planejarFigma(pacote);
      if (typeof comp.estrutura.largura === 'number')
        expect(val(plano.componentes[0].variantes[0].arvore.largura)).toBe(777);
      const rel = await importarNoFigma(
        criarFigmaMock().figma,
        plano,
        serializar(pacote),
        'atualizar',
      );
      expect(rel.vinculosFalhos).toEqual([]);
      expect(resolverSaidas(maior.variaveis, {}).cssVars[`--kcx-${t.id}-largura`]).toBe('777px');
    },
  );
});
