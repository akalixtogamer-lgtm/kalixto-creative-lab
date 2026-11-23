import { describe, expect, it } from 'vitest';
import { TIPOS_CONSTRUTOR, configPadrao, montarDoConstrutor } from './construtor';
import { importarNoFigma } from './figma/construir';
import { criarFigmaMock } from './figma/figma-mock';
import { planejarFigma } from './figma-plano';
import {
  FUNDACAO_PADRAO,
  KcxFundacao,
  NIVEIS_TEXTO,
  completarFundacao,
  construtorDaFundacao,
  cssDaFundacao,
  validarFundacao,
  lerFundacaoImportada,
} from './fundacao';
import { criarPacote, desserializar, serializar } from './serializar';

const botaoDaFundacao = (f: KcxFundacao) => {
  const def = TIPOS_CONSTRUTOR.find((t) => t.id === 'botao')!;
  const d = construtorDaFundacao(f);
  return montarDoConstrutor({ ...configPadrao(def), ...d, modos: true, telas: true });
};

describe('Fundação (tokens do design system)', () => {
  it('o padrão é válido e completar preenche o que falta', () => {
    expect(validarFundacao(FUNDACAO_PADRAO)).toEqual([]);
    const parcial = completarFundacao({
      nome: 'Meu DS',
      cores: { ...FUNDACAO_PADRAO.cores, primaria: { escuro: '#ff0000', claro: '#cc0000' } },
    });
    expect(validarFundacao(parcial)).toEqual([]);
    expect(parcial.cores.primaria.escuro).toBe('#ff0000');
    expect(validarFundacao({ formato: 'kcx-fundacao' })).not.toEqual([]);
  });

  it('o plano leva os tokens e liga os componentes a eles (alias)', () => {
    const pacote = criarPacote([botaoDaFundacao(FUNDACAO_PADRAO)], { fundacao: FUNDACAO_PADRAO });
    const plano = planejarFigma(pacote);
    const cores = plano.colecoes.find((c) => c.nome === 'KCX · Colors')!;
    expect(cores.modos).toEqual(['Dark', 'Light']);
    const tokens = cores.variaveis.filter((v) => v.origem === 'fundacao');
    expect(tokens.map((t) => t.nome)).toContain('Fundação/cor/primaria');
    const alias = plano.colecoes
      .flatMap((c) => c.variaveis)
      .filter(
        (v) =>
          v.origem !== 'fundacao' &&
          Object.values(v.valores).some((x) => typeof x === 'object' && x !== null && 'alias' in x),
      );
    const alvos = new Set(
      alias.flatMap((v) => Object.values(v.valores).map((x) => (x as { alias: string }).alias)),
    );
    expect(alvos).toContain('Fundação/cor/primaria');
    expect(alvos).toContain('Fundação/cor/sobre-primaria');
    expect(alvos).toContain('Fundação/raio/m');
    expect(plano.fundacao!.estilosTexto).toHaveLength(NIVEIS_TEXTO.length);
    expect(plano.fundacao!.estilosSombra).toHaveLength(3);
    expect(plano.avisos.some((a) => a.includes('usam tokens da fundação'))).toBe(true);
  });

  it('a importação cria tokens, alias, estilos de texto e de sombra, sem falhas', async () => {
    const pacote = criarPacote([botaoDaFundacao(FUNDACAO_PADRAO)], { fundacao: FUNDACAO_PADRAO });
    const m = criarFigmaMock();
    const rel = await importarNoFigma(
      m.figma,
      planejarFigma(pacote),
      serializar(pacote),
      'atualizar',
    );
    expect(rel.vinculosFalhos).toEqual([]);
    expect(rel.estilos).toHaveLength(NIVEIS_TEXTO.length + 3);
    expect(m.estilosTexto.map((s) => s.name)).toContain('Fundação/Corpo');
    expect(m.estilosTexto.every((s) => s.boundVariables.fontSize)).toBe(true);
    expect(m.estilosEfeito[1].effects[0].type).toBe('DROP_SHADOW');
    const primaria = m.variaveis.find((v) => v.name === 'Fundação/cor/primaria')!;
    const usaPrimaria = m.variaveis.filter((v) =>
      Object.values(v.valuesByMode as Record<string, { type?: string; id?: string }>).some(
        (x) => x?.type === 'VARIABLE_ALIAS' && x.id === primaria.id,
      ),
    );
    expect(usaPrimaria.length).toBeGreaterThan(0);
    // reimportar atualiza os estilos em vez de duplicar
    await importarNoFigma(m.figma, planejarFigma(pacote), serializar(pacote), 'atualizar');
    expect(m.estilosTexto).toHaveLength(NIVEIS_TEXTO.length);
  });

  it('um pacote só com a fundação é válido e importa os tokens', async () => {
    const pacote = criarPacote([], {
      fundacao: FUNDACAO_PADRAO,
      id: 'fundacao',
      nome: 'Fundação Kalixto',
    });
    const lido = desserializar(serializar(pacote));
    expect(lido.ok).toBe(true);
    const m = criarFigmaMock();
    const rel = await importarNoFigma(
      m.figma,
      planejarFigma(pacote),
      serializar(pacote),
      'atualizar',
    );
    expect(rel.componentes).toEqual([]);
    expect(rel.estilos!.length).toBe(10);
    expect(m.variaveis.filter((v) => v.name.startsWith('Fundação/')).length).toBeGreaterThan(30);
  });

  it('fundação personalizada muda os componentes e o CSS', () => {
    const f = completarFundacao({
      nome: 'Verde',
      cores: { ...FUNDACAO_PADRAO.cores, primaria: { escuro: '#16a34a', claro: '#15803d' } },
    });
    const plano = planejarFigma(criarPacote([botaoDaFundacao(f)], { fundacao: f }));
    const tokens = plano.colecoes.flatMap((c) => c.variaveis);
    expect(
      tokens.some((v) =>
        Object.values(v.valores).some(
          (x) => (x as { alias?: string }).alias === 'Fundação/cor/primaria',
        ),
      ),
    ).toBe(true);
    const css = cssDaFundacao(f);
    expect(css).toContain('--kx-cor-primaria: #16a34a;');
    expect(css).toContain("[data-tema='claro']");
    expect(css).toContain('.kx-texto-h1');
  });

  it('pacote com fundação inválida é recusado na leitura', () => {
    const pacote = criarPacote([botaoDaFundacao(FUNDACAO_PADRAO)], { fundacao: FUNDACAO_PADRAO });
    const bruto = JSON.parse(serializar(pacote));
    bruto.fundacao.cores.primaria.escuro = 'vermelho';
    expect(desserializar(JSON.stringify(bruto)).ok).toBe(false);
  });
});

describe('lerFundacaoImportada (Importar design system)', () => {
  it('aceita o .kcx-fundacao.json do plugin e o pacote KCX com fundação', () => {
    const f = { ...structuredClone(FUNDACAO_PADRAO), nome: 'Glass' };
    const a = lerFundacaoImportada(JSON.parse(JSON.stringify(f)));
    expect('fundacao' in a && a.fundacao.nome).toBe('Glass');
    const b = lerFundacaoImportada({ formato: 'kcx', componentes: [], fundacao: f });
    expect('fundacao' in b && b.fundacao.nome).toBe('Glass');
  });

  it('recusa com explicação um arquivo de componentes ou um JSON qualquer', () => {
    const a = lerFundacaoImportada({ formato: 'kcx', componentes: [] });
    expect('erro' in a && a.erro).toContain('Importar do Figma');
    expect('erro' in lerFundacaoImportada({ qualquer: 1 })).toBe(true);
    expect('erro' in lerFundacaoImportada([1, 2])).toBe(true);
  });
});
