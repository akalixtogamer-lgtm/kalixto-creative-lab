import { describe, expect, it } from 'vitest';
import { montarDoConstrutor } from '.';
import { importarNoFigma } from '../figma/construir';
import { criarFigmaMock } from '../figma/figma-mock';
import { planejarFigma } from '../figma-plano';
import { FUNDACAO_PADRAO } from '../fundacao';
import { criarPacote, serializar } from '../serializar';
import { validarComponente, validarPacote } from '../validar';
import { KCX_COMPONENTES } from '../componentes';
import { MODELOS_MONTADOR, configMontada } from './montado';
import { Fidelidade, Tela, aplicarFidelidade, corNaFidelidade, montarTela, naoCabem } from './tela';

const modelo = (id: string) => {
  const m = MODELOS_MONTADOR.find((x) => x.id === id)!;
  return montarDoConstrutor(configMontada(m.sugestao, m.criar(), FUNDACAO_PADRAO));
};
const comps = [modelo('navbar'), modelo('hero'), modelo('card'), modelo('botao')];
const tela = (fidelidade: Fidelidade, dispositivo: Tela['dispositivo'] = 'desktop'): Tela => ({
  nome: 'Página inicial',
  dispositivo,
  fidelidade,
  secoes: comps.map((c) => c.id),
});

describe('Telas (mockup e wireframe)', () => {
  it('cores por fidelidade: média é cinza fiel, baixa usa poucos cinzas', () => {
    expect(corNaFidelidade('#d4119f', 'alta')).toBe('#d4119f');
    const m = corNaFidelidade('#d4119f', 'media');
    expect(m.slice(1, 3)).toBe(m.slice(3, 5));
    expect(['#ffffff', '#ededed', '#c8c8c8', '#6e6e6e']).toContain(
      corNaFidelidade('#f3f1fb', 'baixa'),
    );
    expect(corNaFidelidade('#00000080', 'media')).toMatch(/80$/);
  });

  it('a fidelidade troca o id, as cores e esvazia as fotos', () => {
    const card = comps[2];
    const wf = aplicarFidelidade(card, 'baixa');
    expect(wf.id).toBe(`${card.id}-wireframe-baixa`);
    const cores = wf.variaveis.filter((v) => v.tipo === 'color').map((v) => String(v.valor));
    for (const c of cores) expect(c.slice(1, 3)).toBe(c.slice(3, 5));
    expect(card.variaveis.find((v) => v.tipo === 'color')!.valor).not.toBe(cores[0]);
  });

  it.each(['alta', 'media', 'baixa'] as Fidelidade[])(
    'tela %s: componente válido, plano com instâncias e importação sem falhas',
    async (fid) => {
      const t = montarTela(tela(fid), comps, FUNDACAO_PADRAO);
      expect(validarComponente(t, t.id).map((e) => e.caminho + ': ' + e.mensagem)).toEqual([]);
      expect(t.subcomponentes).toHaveLength(4);
      expect(t.codigo.html).toContain('<main class=');
      const pacote = criarPacote([t], { fundacao: FUNDACAO_PADRAO });
      expect(validarPacote(JSON.parse(serializar(pacote))).erros).toEqual([]);
      const plano = planejarFigma(pacote);
      const raiz = plano.componentes.find((c) => c.id === t.id)!.variantes[0].arvore;
      expect(raiz.filhos.filter((n) => n.instancia)).toHaveLength(4);
      expect(raiz.largura?.valor).toBe(1440);
      const rel = await importarNoFigma(
        criarFigmaMock().figma,
        plano,
        serializar(pacote),
        'atualizar',
      );
      expect(rel.vinculosFalhos).toEqual([]);
      expect(rel.componentes.map((c) => c.nome)).toContain('Página inicial');
    },
  );

  it('cores dentro de gradientes e SVGs também viram cinza', () => {
    const coloridas = /#(22e3ff|8b5cf6|ff2bd6)/i;
    for (const c of KCX_COMPONENTES) {
      const w = aplicarFidelidade(c, 'media');
      const resto = JSON.stringify({ v: w.variaveis, e: w.estrutura, c: w.codigo });
      expect(resto, c.id).not.toMatch(coloridas);
      expect(
        validarComponente(w, w.id).map((e) => e.caminho + ': ' + e.mensagem),
        c.id,
      ).toEqual([]);
    }
  });

  it('celular avisa o que não cabe', () => {
    const t = tela('alta', 'celular');
    expect(naoCabem(t, comps).join(' ')).toContain('Minha navbar (960 px)');
    const c = montarTela(t, comps);
    expect(c.estrutura.largura).toBe(390);
  });

  it('a mesma seção pode aparecer duas vezes', () => {
    const t = montarTela({ ...tela('media'), secoes: [comps[3].id, comps[3].id] }, comps);
    expect(t.subcomponentes).toHaveLength(1);
    expect(t.estrutura.filhos).toHaveLength(2);
  });
});
