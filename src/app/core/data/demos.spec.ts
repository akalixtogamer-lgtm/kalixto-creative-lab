import { cumpreMeta, valoresPadrao } from '../models/demo.model';
import { DEMOS_POR_LAB } from './effects.data';

/**
 * Integridade das demos de todos os laboratórios:
 * presets e desafios só podem usar valores que os controles conseguem produzir.
 */
const casos = Object.entries(DEMOS_POR_LAB).flatMap(([lab, demos]) => demos.map((d) => [`${lab}:${d.id}`, d] as const));

describe('Demos · integridade', () => {
  it.each(casos)('%s tem valores de preset e desafio válidos', (_, demo) => {
    const ids = new Set(demo.params.map((p) => p.id));
    const valido = (chave: string, valor: unknown) => {
      const p = demo.params.find((x) => x.id === chave)!;
      expect(ids.has(chave), `controle "${chave}" não existe`).toBe(true);
      if (p.tipo === 'select') {
        expect(p.opcoes.map((o) => o.valor), `opção "${valor}" em ${chave}`).toContain(String(valor));
      } else {
        const n = Number(valor);
        expect(n).toBeGreaterThanOrEqual(p.min);
        expect(n).toBeLessThanOrEqual(p.max);
        const passos = (n - p.min) / p.passo;
        expect(Math.abs(passos - Math.round(passos)), `${chave}=${n} fora do passo`).toBeLessThan(1e-6);
      }
    };
    for (const pr of demo.presets ?? []) Object.entries(pr.valores).forEach(([k, v]) => valido(k, v));
    if (demo.desafio) {
      Object.entries(demo.desafio.meta).forEach(([k, v]) => valido(k, v));
      // O desafio não pode já estar resolvido nos valores iniciais
      expect(cumpreMeta(valoresPadrao(demo), demo.desafio.meta)).toBe(false);
    }
  });

  it.each(casos)('%s gera código sem "undefined"', (_, demo) => {
    expect(demo.codigo(valoresPadrao(demo))).not.toContain('undefined');
    for (const pr of demo.presets ?? []) {
      expect(demo.codigo({ ...valoresPadrao(demo), ...pr.valores })).not.toContain('undefined');
    }
  });
});
