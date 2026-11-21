import { describe, expect, it } from 'vitest';
import { montarDoConstrutor } from '.';
import { importarNoFigma } from '../figma/construir';
import { criarFigmaMock } from '../figma/figma-mock';
import { planejarFigma } from '../figma-plano';
import { FUNDACAO_PADRAO } from '../fundacao';
import { criarPacote, serializar } from '../serializar';
import { validarComponente } from '../validar';
import {
  MODELOS_MONTADOR,
  acharCamada,
  configMontada,
  montagemPadrao,
  novaCamada,
  temVidro,
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

describe('Modelos e eixos do montador', () => {
  it.each(MODELOS_MONTADOR.map((m) => [m.id, m] as const))(
    'modelo %s: válido, monta, importa no Figma sem falhas',
    async (_id, modelo) => {
      const m = modelo.criar();
      expect(validarMontagem(m)).toEqual([]);
      const comp = montarDoConstrutor(configMontada(modelo.sugestao, m, FUNDACAO_PADRAO));
      expect(validarComponente(comp, comp.id)).toEqual([]);
      const pacote = criarPacote([comp], { fundacao: FUNDACAO_PADRAO });
      const plano = planejarFigma(pacote);
      const eixos = (m.eixos?.tipo ? 3 : 1) * (m.eixos?.tamanho ? 3 : 1);
      expect(plano.componentes[0].variantes).toHaveLength(comp.estados.length * eixos);
      const rel = await importarNoFigma(
        criarFigmaMock().figma,
        plano,
        serializar(pacote),
        'atualizar',
      );
      expect(rel.vinculosFalhos).toEqual([]);
      expect(rel.avisos.filter((a) => !a.startsWith('Fonte'))).toEqual([]);
    },
  );

  it('botão: Tipo muda fundo, contorno e cor do rótulo; Tamanho muda margem e texto', () => {
    const modelo = MODELOS_MONTADOR.find((x) => x.id === 'botao')!;
    const comp = montarDoConstrutor(configMontada('Botão', modelo.criar(), FUNDACAO_PADRAO));
    expect(comp.codigo.html).toContain('data-tipo="primario" data-tamanho="m"');
    expect(comp.codigo.css).toContain("[data-tipo='secundario'] { background: transparent;");
    expect(comp.codigo.css).toContain("[data-tamanho='p'] { padding:");
    const plano = planejarFigma(criarPacote([comp], { fundacao: FUNDACAO_PADRAO }));
    const variantes = plano.componentes[0].variantes;
    const achar = (nome: string) => variantes.find((v) => v.nome === nome)!.arvore;
    const prim = achar('Estado=Padrão, Tipo=Primário, Tamanho=M');
    const sec = achar('Estado=Padrão, Tipo=Secundário, Tamanho=M');
    const p = achar('Estado=Padrão, Tipo=Primário, Tamanho=P');
    const g = achar('Estado=Padrão, Tipo=Primário, Tamanho=G');
    const fundoA = (n: typeof prim) =>
      (n.preenchimentos[0] as { cor: { valor: { a: number } } }).cor.valor.a;
    expect(fundoA(prim)).toBe(1);
    expect(fundoA(sec)).toBe(0);
    expect(Number(p.autoLayout!.paddingX.valor)).toBeLessThan(
      Number(prim.autoLayout!.paddingX.valor),
    );
    expect(Number(g.autoLayout!.paddingX.valor)).toBeGreaterThan(
      Number(prim.autoLayout!.paddingX.valor),
    );
    const rotulo = (n: typeof prim) => n.filhos.find((x) => x.texto)!;
    expect(Number(rotulo(g).texto!.tamanho.valor)).toBe(18);
    expect(rotulo(sec).preenchimentos[0]).not.toEqual(rotulo(prim).preenchimentos[0]);
  });

  it('eixo Tipo sem fundo na principal é recusado', () => {
    const m = montagemPadrao();
    m.raiz.fundo = null;
    m.eixos = { tipo: true };
    expect(validarMontagem(m).join(' ')).toContain('fundo');
  });

  it('vidro: fundo e borda translúcidos e Background blur no Figma', async () => {
    const modelo = MODELOS_MONTADOR.find((x) => x.id === 'card-vidro')!;
    const m = modelo.criar();
    expect(temVidro(m.raiz)).toBe(true);
    const comp = montarDoConstrutor(configMontada('Vidro', m, FUNDACAO_PADRAO));
    expect(comp.codigo.css).toContain('backdrop-filter: blur(16px)');
    expect(comp.codigo.css).toContain('-webkit-backdrop-filter: blur(16px)');
    expect(comp.codigo.css).toMatch(
      /background: color-mix\(in srgb, var\([^)]+\) 35%, transparent\)/,
    );
    expect(comp.codigo.css).toMatch(
      /border: 1px solid color-mix\(in srgb, var\([^)]+\) 20%, transparent\)/,
    );
    const pacote = criarPacote([comp], { fundacao: FUNDACAO_PADRAO });
    const plano = planejarFigma(pacote);
    const raiz = plano.componentes[0].variantes[0].arvore;
    expect(raiz.efeitos).toContainEqual(
      expect.objectContaining({
        tipo: 'BACKGROUND_BLUR',
        raio: expect.objectContaining({ valor: 32 }),
      }),
    );
    const a = (p: unknown) => (p as { cor: { valor: { a: number } } }).cor.valor.a;
    expect(a(raiz.preenchimentos[0])).toBeCloseTo(0.35, 2);
    expect(a((raiz.traco as unknown as { pintura: unknown }).pintura)).toBeCloseTo(0.2, 2);
    // a variável translúcida existe nos dois temas (Dark/Light)
    const vars = plano.colecoes.flatMap((c) => c.variaveis);
    const fundo = vars.find((v) => v.nome.endsWith('/fundo-raiz'))!;
    expect(Object.keys(fundo.valores).length).toBeGreaterThanOrEqual(2);
    const rel = await importarNoFigma(
      criarFigmaMock().figma,
      plano,
      serializar(pacote),
      'atualizar',
    );
    expect(rel.vinculosFalhos).toEqual([]);
  });

  it('vidro com eixo Tipo: a opacidade vale no Primário; opacidade fora de 0–100 é recusada', () => {
    const m = MODELOS_MONTADOR.find((x) => x.id === 'botao')!.criar();
    m.raiz.opacidadeFundo = 40;
    const comp = montarDoConstrutor(configMontada('Botão', m, FUNDACAO_PADRAO));
    const plano = planejarFigma(criarPacote([comp], { fundacao: FUNDACAO_PADRAO }));
    const achar = (nome: string) =>
      plano.componentes[0].variantes.find((v) => v.nome === nome)!.arvore;
    const a = (n: ReturnType<typeof achar>) =>
      (n.preenchimentos[0] as { cor: { valor: { a: number } } }).cor.valor.a;
    expect(a(achar('Estado=Padrão, Tipo=Primário, Tamanho=M'))).toBeCloseTo(0.4, 2);
    expect(a(achar('Estado=Padrão, Tipo=Fantasma, Tamanho=M'))).toBe(0);
    m.raiz.opacidadeFundo = 140;
    expect(validarMontagem(m).join(' ')).toContain('0 a 100');
  });
});
