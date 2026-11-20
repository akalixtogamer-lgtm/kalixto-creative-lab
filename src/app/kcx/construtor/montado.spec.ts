import { describe, expect, it } from 'vitest';
import { montarDoConstrutor } from '.';
import { importarNoFigma } from '../figma/construir';
import { criarFigmaMock } from '../figma/figma-mock';
import { planejarFigma } from '../figma-plano';
import { FUNDACAO_PADRAO } from '../fundacao';
import { criarPacote, serializar } from '../serializar';
import { validarComponente } from '../validar';
import {
  acharCamada,
  configMontada,
  montagemPadrao,
  novaCamada,
  todasCamadas,
  validarMontagem,
} from './montado';

describe('Montador visual', () => {
  it('a montagem padrão vira um componente KCX válido', () => {
    const m = montagemPadrao();
    expect(validarMontagem(m)).toEqual([]);
    const comp = montarDoConstrutor(configMontada('Meu card', m));
    expect(validarComponente(comp, comp.id)).toEqual([]);
    expect(comp.estados.map((e) => e.nome)).toEqual([
      'Padrão',
      'Hover',
      'Pressionado',
      'Foco',
      'Desativado',
    ]);
    expect(comp.codigo.html).toContain('<button type="button" class="kcx-meu-card">');
    expect(comp.codigo.html).toContain('Título do card');
    expect(comp.codigo.css).toContain("font-family: 'Space Grotesk'");
    expect(comp.variaveis.map((v) => v.id)).toEqual(
      expect.arrayContaining(['corBorda', 'espaco6', 'textoH3', 'textoCorpo']),
    );
  });

  it('no Figma, tudo vira alias da fundação e os textos recebem os estilos', async () => {
    const comp = montarDoConstrutor(configMontada('Meu card', montagemPadrao(), FUNDACAO_PADRAO));
    const pacote = criarPacote([comp], { fundacao: FUNDACAO_PADRAO });
    const plano = planejarFigma(pacote);
    const aliases = new Set(
      plano.colecoes
        .flatMap((c) => c.variaveis)
        .flatMap((v) => Object.values(v.valores))
        .filter((x): x is { alias: string } => typeof x === 'object' && x !== null && 'alias' in x)
        .map((x) => x.alias),
    );
    for (const t of [
      'Fundação/cor/superficie',
      'Fundação/cor/borda',
      'Fundação/raio/m',
      'Fundação/espaco/6',
      'Fundação/texto/h3/tamanho',
      'Fundação/texto/corpo/tamanho',
    ])
      expect(aliases, t).toContain(t);
    const textos: string[] = [];
    const ver = (n: (typeof plano.componentes)[number]['variantes'][number]['arvore']) => {
      if (n.texto?.estiloTexto) textos.push(n.texto.estiloTexto);
      n.filhos.forEach(ver);
    };
    ver(plano.componentes[0].variantes[0].arvore);
    expect(textos).toEqual(
      expect.arrayContaining(['Fundação/H3', 'Fundação/Corpo', 'Fundação/Pequeno']),
    );
    const mock = criarFigmaMock();
    const rel = await importarNoFigma(mock.figma, plano, serializar(pacote), 'atualizar');
    expect(rel.vinculosFalhos).toEqual([]);
    expect(rel.componentes[0].variantes).toBe(5);
  });

  it('aceita imagem, caixas aninhadas e componente sem estados', () => {
    const m = montagemPadrao();
    m.interativo = false;
    const img = novaCamada(
      'imagem',
      todasCamadas(m.raiz).map((c) => c.id),
    );
    m.raiz.filhos!.unshift(img);
    const caixa = acharCamada(m.raiz, 'rodape')!;
    caixa.filhos!.push(
      novaCamada(
        'caixa',
        todasCamadas(m.raiz).map((c) => c.id),
      ),
    );
    expect(validarMontagem(m)).toEqual([]);
    const comp = montarDoConstrutor(configMontada('Card com foto', m));
    expect(validarComponente(comp, comp.id)).toEqual([]);
    expect(comp.codigo.html).toContain('<img class="kcx-card-com-foto__imagem-1"');
    expect(comp.codigo.html.startsWith('<div')).toBe(true);
    expect(comp.variaveis.some((v) => v.id === 'imagemImagem1')).toBe(true);
  });

  it('recusa ids repetidos, filhos em texto e raiz que não é caixa', () => {
    const m = montagemPadrao();
    m.raiz.filhos![1].id = 'titulo';
    expect(validarMontagem(m).join(' ')).toContain('repetido');
    const t = montagemPadrao();
    t.raiz.filhos![0].filhos = [novaCamada('texto', [])];
    expect(validarMontagem(t).join(' ')).toContain('não pode ter filhos');
    expect(
      validarMontagem({ interativo: false, raiz: novaCamada('texto', []) }).join(' '),
    ).toContain('caixa');
  });
});
