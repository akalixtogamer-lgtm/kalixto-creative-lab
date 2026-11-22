import { describe, expect, it } from 'vitest';
import { contrastesDaFundacao } from '../guia-design-system';
import { validarComponente } from '../validar';
import { FUNDACAO_PADRAO, validarFundacao } from '../fundacao';
import { tipoConstrutor } from '../construtor';
import {
  MOLDES,
  TROCAS_SUGERIDAS,
  configDaSecao,
  fundacaoDoMolde,
  montarMolde,
  previaMolde,
  trocarTipo,
} from './moldes';

describe('Moldes de página por área', () => {
  it('tem as áreas pedidas (dança, games, livros) e outras', () => {
    const areas = MOLDES.map((m) => m.id);
    expect(areas).toEqual(expect.arrayContaining(['danca', 'games', 'livros']));
    expect(MOLDES.length).toBeGreaterThanOrEqual(8);
    expect(new Set(areas).size).toBe(areas.length);
  });

  it.each(MOLDES.map((m) => [m.id, m] as const))(
    '%s: fundação válida e legível; todas as seções montam e validam',
    (_id, m) => {
      const f = fundacaoDoMolde(m);
      expect(validarFundacao(f)).toEqual([]);
      const ruins = contrastesDaFundacao(f, 'escuro').filter(
        (p) => p.uso === 'texto' && p.nota === 'Falha',
      );
      expect(ruins.map((p) => `${p.nome} ${p.razao.toFixed(2)}`)).toEqual([]);
      const r = montarMolde(m, f, ['navbar']);
      expect(r.erros).toEqual([]);
      expect(r.paginas.length).toBe(m.paginas.length);
      // A navbar e o rodapé repetidos nas páginas viram o mesmo componente.
      expect(r.paginas[0].secoes[0]).toBe(r.paginas[1].secoes[0]);
      expect(new Set(r.componentes.map((c) => c.id)).size).toBe(r.componentes.length);
      expect(r.componentes.map((c) => c.id)).not.toContain('navbar');
      for (const c of r.componentes) expect(validarComponente(c, c.id)).toEqual([]);
      expect(r.ligacoes.length).toBe((m.paginas.length - 1) * 2);
      expect(previaMolde(m, f).length).toBe(m.paginas[0].secoes.length);
    },
  );

  it('os textos da seção entram no componente', () => {
    const s = MOLDES[0].paginas[0].secoes.find((x) => x.tipo === 'hero')!;
    const cfg = configDaSecao(s, FUNDACAO_PADRAO)!;
    expect(cfg.textos['titulo']).toBe('Dance do seu jeito, no seu ritmo');
    const car = configDaSecao(
      MOLDES[0].paginas[0].secoes.find((x) => x.tipo === 'carrossel')!,
      FUNDACAO_PADRAO,
    )!;
    expect(car.itens).toHaveLength(5);
    expect(car.subItens?.[0]).toBe('Seg e qua · 19h');
    expect(car.porTela).toBe(3);
  });

  it('trocar o tipo mantém nome, cores, textos e a lista', () => {
    const cfg = configDaSecao(
      MOLDES[0].paginas[0].secoes.find((x) => x.tipo === 'carrossel')!,
      fundacaoDoMolde(MOLDES[0]),
    )!;
    const g = trocarTipo(cfg, 'galeria')!;
    expect(g.tipo).toBe('galeria');
    expect(g.nome).toBe('Turmas');
    expect(g.cores.primaria).toBe(cfg.cores.primaria);
    expect(g.itens.slice(0, 5)).toEqual(cfg.itens);
    const preco = trocarTipo(
      configDaSecao(MOLDES[0].paginas[1].secoes[2], FUNDACAO_PADRAO)!,
      'card-foto',
    )!;
    expect(preco.textos['titulo']).toBe('Plano Livre');
    expect(trocarTipo(cfg, 'nao-existe')).toBeNull();
    for (const [de, paras] of Object.entries(TROCAS_SUGERIDAS)) {
      expect(tipoConstrutor(de), de).toBeTruthy();
      for (const p of paras) expect(tipoConstrutor(p), p).toBeTruthy();
    }
  });
});
