import { describe, expect, it } from 'vitest';
import { validarPacote } from '../validar';
import { criarPacote, serializar } from '../serializar';
import { eixosDoComponente, planejarFigma, variantesDoComponente } from '../figma-plano';
import { documentoDaVariante } from '../plano-html';
import { importarNoFigma } from '../figma/construir';
import { criarFigmaMock } from '../figma/figma-mock';
import { resolverSaidas, valoresAtuais } from '../resolver';
import { montarDocumentoKcx } from '../documento';
import { TIPOS_CONSTRUTOR, configPadrao, corDoBotao, montarDoConstrutor, slug } from '.';

const agora = new Date('2026-11-18T12:00:00Z');

describe('Construtor KCX — todos os tipos', () => {
  it('tem os tipos de tela, site e app pedidos', () => {
    const ids = TIPOS_CONSTRUTOR.map((t) => t.id);
    for (const id of [
      'navbar',
      'menu-sanduiche',
      'menu-lateral',
      'modal',
      'carrossel',
      'card-foto',
      'card-video',
    ])
      expect(ids).toContain(id);
    expect(ids.length).toBeGreaterThanOrEqual(16);
    expect(new Set(ids).size).toBe(ids.length);
  });

  for (const def of TIPOS_CONSTRUTOR) {
    describe(def.nome, () => {
      for (const anim of def.animacoes) {
        it(`animação "${anim.nome}": pacote válido, Figma sem falhas`, async () => {
          const cfg = { ...configPadrao(def, `Meu ${def.nome}`), animacao: anim.id };
          const comp = montarDoConstrutor(cfg);
          const pacote = criarPacote([comp], { modo: 'completo', agora });
          const val = validarPacote(JSON.parse(serializar(pacote)));
          expect(val.erros, JSON.stringify(val.erros, null, 1)).toEqual([]);

          // código: CSS só usa custom properties que as variáveis definem
          const saidas = resolverSaidas(comp.variaveis, valoresAtuais(comp.variaveis, {}));
          const definidas = new Set(Object.keys(saidas.cssVars));
          const usadas = [...comp.codigo.css.matchAll(/var\((--kcx-[a-z0-9-]+)\)/g)].map(
            (m) => m[1],
          );
          for (const u of usadas) expect(definidas, `${u} não é definida`).toContain(u);
          expect(montarDocumentoKcx(comp, {}, { modo: 'preview' })).toContain(
            comp.codigo.html.slice(0, 20),
          );

          // Figma: plano sem avisos de vínculo e importação simulada sem falhas
          const plano = planejarFigma(pacote);
          const mock = criarFigmaMock();
          const rel = await importarNoFigma(mock.figma, plano, serializar(pacote), 'atualizar');
          expect(rel.vinculosFalhos).toEqual([]);
          const eixos = (comp.compatibilidade.figma.eixosVariante ?? []).map(
            (id) => comp.variaveis.find((v) => v.id === id)!.opcoes!.length,
          );
          expect(rel.componentes[0].variantes).toBe(
            eixos.reduce((a, b) => a * b, comp.estados.length),
          );
          expect(rel.avisos.filter((a) => !a.startsWith('Fonte'))).toEqual([]);
          // cada interação aponta para nós e estados que existem
          for (const it of comp.interacoes ?? []) {
            expect(comp.estados.map((e) => e.id)).toContain(it.de);
            expect(comp.estados.map((e) => e.id)).toContain(it.para);
            expect(JSON.stringify(comp.estrutura)).toContain(`"id":"${it.no}"`);
          }
        });
      }
    });
  }

  it('o nome do botão vira variável de texto e propriedade de texto no Figma', async () => {
    const def = TIPOS_CONSTRUTOR.find((t) => t.id === 'botao')!;
    const comp = montarDoConstrutor({
      ...configPadrao(def, 'CTA Inscrição'),
      textos: { rotulo: 'Quero me inscrever' },
    });
    expect(comp.id).toBe('cta-inscricao');
    const v = comp.variaveis.find((x) => x.id === 'textoRotulo')!;
    expect(v.valor).toBe('Quero me inscrever');
    const saidas = resolverSaidas(comp.variaveis, valoresAtuais(comp.variaveis, {}));
    expect(saidas.textos).toContainEqual({
      seletor: '.kcx-cta-inscricao__rotulo',
      valor: 'Quero me inscrever',
    });
    const rel = await importarNoFigma(
      criarFigmaMock().figma,
      planejarFigma(criarPacote([comp], { agora })),
      '{}',
      'atualizar',
    );
    expect(rel.propriedades).toContain('Texto do botão (texto)');
  });

  it('menu sanduíche: clicar no ícone leva à variante Aberto (Smart Animate) e o X volta', async () => {
    const def = TIPOS_CONSTRUTOR.find((t) => t.id === 'menu-sanduiche')!;
    const comp = montarDoConstrutor(configPadrao(def));
    const plano = planejarFigma(criarPacote([comp], { agora }));
    expect(plano.componentes[0].interacoes).toEqual([
      {
        variante: 'Estado=Fechado',
        no: 'burger',
        gatilho: 'clique',
        destino: 'Estado=Aberto',
        transicao: 'smart-animate',
        duracao: 320,
      },
      {
        variante: 'Estado=Aberto',
        no: 'fechar',
        gatilho: 'clique',
        destino: 'Estado=Fechado',
        transicao: 'smart-animate',
        duracao: 320,
      },
    ]);
    const { figma, pagina } = criarFigmaMock();
    const rel = await importarNoFigma(figma, plano, '{}', 'atualizar');
    expect(rel.interacoes).toHaveLength(2);
    const set = pagina.children.find((n) => n.name === comp.nome)!;
    const [fechado, aberto] = set.children;
    const burger = fechado.findAll((n) => n.name === 'Abrir')[0];
    expect(burger.reactions[0].trigger.type).toBe('ON_CLICK');
    expect(burger.reactions[0].actions[0]).toMatchObject({
      navigation: 'CHANGE_TO',
      destinationId: aberto.id,
      transition: { type: 'SMART_ANIMATE' },
    });
  });

  it('carrossel: a seta passa para o próximo slide e o último volta ao primeiro', () => {
    const def = TIPOS_CONSTRUTOR.find((t) => t.id === 'carrossel')!;
    const plano = planejarFigma(criarPacote([montarDoConstrutor(configPadrao(def))], { agora }));
    const prox = plano.componentes[0].interacoes!.filter((i) => i.no === 'seta-prox');
    expect(prox.map((i) => `${i.variante} → ${i.destino}`)).toEqual([
      'Estado=Slide 1 → Estado=Slide 2',
      'Estado=Slide 2 → Estado=Slide 3',
      'Estado=Slide 3 → Estado=Slide 1',
    ]);
    // o trilho anda: x = -(ativo - 1) × 480
    const trilho = (i: number) => plano.componentes[0].variantes[i].arvore.filhos[0].filhos[0];
    expect([0, 1, 2].map((i) => trilho(i).x)).toEqual([-0, -480, -960].map((x) => x || 0));
  });

  it('conjunto de botões: Entrar e Criar conta × P/M/G × Padrão/Hover, com cor e nome de cada um', async () => {
    const def = TIPOS_CONSTRUTOR.find((t) => t.id === 'botoes')!;
    const comp = montarDoConstrutor({
      ...configPadrao(def, 'Botões de acesso'),
      itens: ['Entrar', 'Criar conta'],
    });
    const plano = planejarFigma(criarPacote([comp], { agora }));
    const vs = plano.componentes[0].variantes;
    expect(vs).toHaveLength(30); // 2 botões × 3 tamanhos × 5 estados
    const achar = (nome: string) => vs.find((v) => v.nome === nome)!.arvore;
    const entrarM = achar('Estado=Padrão, Botão=Entrar, Tamanho=M');
    const criarG = achar('Estado=Hover, Botão=Criar conta, Tamanho=G');
    const txt = (n: typeof entrarM) => n.filhos.find((f) => f.texto)!.texto!.conteudo.valor;
    expect(txt(entrarM)).toBe('Entrar');
    expect(txt(criarG)).toBe('Criar conta');
    expect(entrarM.preenchimentos[0]).not.toEqual(criarG.preenchimentos[0]);
    expect(criarG.autoLayout!.paddingX.valor).toBe(32);
    expect(entrarM.autoLayout!.paddingX.valor).toBe(24);
    expect(Number(criarG.efeitos[0].tipo === 'DROP_SHADOW' && criarG.efeitos[0].raio.valor)).toBe(
      24,
    );
    const rel = await importarNoFigma(criarFigmaMock().figma, plano, '{}', 'atualizar');
    expect(rel.vinculosFalhos).toEqual([]);
    expect(rel.interacoes.length).toBe(12); // hover (Padrão) e pressionar (Hover) em cada botão × tamanho
  });

  it('a lista de itens respeita mínimo e máximo do tipo', () => {
    const def = TIPOS_CONSTRUTOR.find((t) => t.id === 'navbar')!;
    const muitos = montarDoConstrutor({
      ...configPadrao(def),
      itens: Array.from({ length: 20 }, (_, i) => `L${i}`),
    });
    expect(muitos.variaveis.filter((v) => /^item\d+$/.test(v.id))).toHaveLength(def.itens!.max);
    const poucos = montarDoConstrutor({ ...configPadrao(def), itens: [] });
    expect(poucos.variaveis.filter((v) => /^item\d+$/.test(v.id))).toHaveLength(def.itens!.min);
  });

  it('cada variante tem valores para o preview e desenha a prévia do Figma', () => {
    for (const def of TIPOS_CONSTRUTOR) {
      const comp = montarDoConstrutor(configPadrao(def));
      const vs = variantesDoComponente(comp);
      const plano = planejarFigma(criarPacote([comp])).componentes[0];
      expect(
        vs.map((v) => v.nome),
        def.id,
      ).toEqual(plano.variantes.map((v) => v.nome));
      const eixos = eixosDoComponente(comp);
      expect(eixos[0].nome, def.id).toBe('Estado');
      for (const v of plano.variantes) {
        const doc = documentoDaVariante(v.arvore);
        expect(doc, def.id).toContain('<div id="v">');
        // Só o script de ajuste de zoom; nada do componente executa.
        expect(doc.match(/<script/gi)?.length, def.id).toBe(1);
      }
    }
  });

  it('a prévia esconde as camadas invisíveis da variante (navbar no celular sem os links)', () => {
    const def = TIPOS_CONSTRUTOR.find((t) => t.id === 'navbar')!;
    const plano = planejarFigma(criarPacote([montarDoConstrutor(configPadrao(def))]))
      .componentes[0];
    const cel = plano.variantes.find((v) => v.nome.startsWith('Estado=Celular,'))!;
    const html = documentoDaVariante(cel.arvore);
    const links = html.indexOf('>Sobre<');
    expect(links).toBeGreaterThan(0);
    const antes = html.slice(0, links);
    expect(antes.slice(antes.lastIndexOf('flex-direction:row')).length).toBeGreaterThan(0);
    expect(html).toMatch(/display:flex[^"]*display:none/);
  });

  it('conjunto de botões: cada botão pode ter a sua cor, e a sombra some no Padrão', () => {
    const def = TIPOS_CONSTRUTOR.find((t) => t.id === 'botoes')!;
    const cfg = { ...configPadrao(def), coresItens: ['#112233', '#445566'] };
    expect(corDoBotao(cfg, 1)).toBe('#445566');
    const comp = montarDoConstrutor(cfg);
    expect(comp.variaveis.find((v) => v.id === 'corBotao2')!.valor).toBe('#445566');
    const plano = planejarFigma(criarPacote([comp])).componentes[0];
    const padrao = plano.variantes.find((v) => v.nome.startsWith('Estado=Padrão'))!;
    const sombra = padrao.arvore.efeitos.find((e) => e.tipo === 'DROP_SHADOW') as {
      cor: { valor: { a: number } };
    };
    expect(sombra.cor.valor.a).toBe(0);
    const hover = plano.variantes.find((v) => v.nome.startsWith('Estado=Hover'))!;
    const sh = hover.arvore.efeitos.find((e) => e.tipo === 'DROP_SHADOW') as {
      cor: { valor: { a: number } };
    };
    expect(sh.cor.valor.a).toBeGreaterThan(0.4);
  });

  it('slug tira acentos e espaços', () => {
    expect(slug('Menu Lateral do App!')).toBe('menu-lateral-do-app');
    expect(slug('Ação')).toBe('acao');
  });
});
