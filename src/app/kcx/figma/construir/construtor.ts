/** Camada 3 do importador: interações, protótipo, documentação, composição e a ordem de tudo. */

import { FigmaCor, PlanoComponente, PlanoFigma, PlanoInteracao } from '../../figma-plano';
import { Figma, No, ModoDuplicados, RelatorioImportacao, rgb } from './tipos';
import { gatilhoFigma, transicaoFigma } from './prototipo';
import { BaseNos } from './base-nos';

class Construtor extends BaseNos {
  /** Interações do protótipo: clique/hover troca para outra variante (Smart Animate). */
  protected async criarInteracoes(c: PlanoComponente): Promise<void> {
    if (!c.interacoes?.length) return;
    const porNo = new Map<No, unknown[]>();
    for (const it of c.interacoes) {
      const origem = this.nosPorVariante.get(`${c.id}|${it.variante}`);
      const destino = this.nosPorVariante.get(`${c.id}|${it.destino}`);
      const no = origem?.nos.get(it.no);
      if (!origem || !destino || !no) {
        this.rel.avisos.push(
          `Interação "${it.no}" em ${it.variante}: camada ou variante não encontrada.`,
        );
        continue;
      }
      const lista = porNo.get(no) ?? [];
      lista.push({
        trigger: gatilhoFigma(it),
        actions: [
          ...this.acoesExtras(c, it),
          {
            type: 'NODE',
            destinationId: destino.variante.id,
            navigation: 'CHANGE_TO',
            transition: transicaoFigma(it),
            preserveScrollPosition: false,
          },
        ],
      });
      porNo.set(no, lista);
    }
    for (const [no, reactions] of porNo) {
      try {
        if (typeof no.setReactionsAsync === 'function') await no.setReactionsAsync(reactions);
        else no.reactions = reactions;
        this.rel.interacoes.push(`${no.name}: ${reactions.length}`);
      } catch (e) {
        this.rel.avisos.push(`Interação em "${no.name}" não foi criada: ${(e as Error).message}`);
      }
    }
  }

  /** Ações extras de uma interação (trocar modo, alternar variável). */
  protected acoesExtras(c: PlanoComponente, it: PlanoInteracao): unknown[] {
    const out: unknown[] = [];
    for (const a of it.acoes ?? []) {
      if (a.tipo === 'modo') {
        const col = this.colecoesFigma.get(a.colecao);
        const modo = col?.modos[a.modo];
        if (col && modo)
          out.push({
            type: 'SET_VARIABLE_MODE',
            variableCollectionId: col.id,
            variableModeId: modo,
          });
        else this.rel.avisos.push(`${c.nome}: modo "${a.modo}" de ${a.colecao} não existe.`);
      } else if (a.tipo === 'alternar') {
        const v = [...this.vars.entries()].find(([n]) => n.endsWith(`/${a.variavel}`))?.[1];
        if (v)
          out.push({
            type: 'SET_VARIABLE',
            variableId: v.id,
            variableValue: {
              resolvedType: 'BOOLEAN',
              type: 'EXPRESSION',
              value: {
                expressionFunction: 'NOT',
                expressionArguments: [
                  {
                    resolvedType: 'BOOLEAN',
                    type: 'VARIABLE_ALIAS',
                    value: { type: 'VARIABLE_ALIAS', id: v.id },
                  },
                ],
              },
            },
          });
      }
    }
    return out;
  }

  /**
   * Protótipo de exemplo com overlay: uma tela com o componente fechado e um
   * frame com a variante aberta; clicar abre o overlay (centralizado) e o X fecha.
   */
  protected async construirPrototipo(c: PlanoComponente, principal: No, x: number, y: number) {
    const o = c.prototipo?.overlay;
    if (!o || principal.type !== 'COMPONENT_SET') return null;
    const f = this.figma;
    const de = principal.children.find((v: No) => v.name === o.de);
    const ov = principal.children.find((v: No) => v.name === o.overlay);
    const noOrigem = this.nosPorVariante.get(`${c.id}|${o.de}`)?.nos.get(o.no);
    if (!de || !ov || !noOrigem) return null;
    const tela = f.createFrame();
    tela.name = `${c.nome} · protótipo (tela)`;
    tela.resize(Math.max(480, de.width + 80), Math.max(360, de.height + 80));
    tela.fills = [{ type: 'SOLID', color: { r: 0.043, g: 0.039, b: 0.078 } }];
    const inst = de.createInstance();
    tela.appendChild(inst);
    inst.x = 40;
    inst.y = 40;
    const sobre = f.createFrame();
    sobre.name = `${c.nome} · overlay`;
    sobre.fills = [];
    const instOv = ov.createInstance();
    sobre.resize(instOv.width, instOv.height);
    sobre.appendChild(instOv);
    tela.x = x;
    tela.y = y;
    sobre.x = x + tela.width + 60;
    sobre.y = y;
    f.currentPage.appendChild(tela);
    f.currentPage.appendChild(sobre);
    const achar = (raiz: No, nome: string) =>
      raiz.findOne ? raiz.findOne((n: No) => n.name === nome) : null;
    const gatilho = achar(inst, noOrigem.name) ?? inst;
    try {
      await gatilho.setReactionsAsync([
        {
          trigger: { type: 'ON_CLICK' },
          actions: [
            {
              type: 'NODE',
              destinationId: sobre.id,
              navigation: 'OVERLAY',
              transition: {
                type: 'MOVE_IN',
                direction: 'BOTTOM',
                matchLayers: false,
                easing: { type: 'EASE_OUT' },
                duration: 0.3,
              },
              preserveScrollPosition: false,
            },
          ],
        },
      ]);
      for (const id of o.fechar) {
        const n = this.nosPorVariante.get(`${c.id}|${o.overlay}`)?.nos.get(id);
        const alvo = n ? achar(instOv, n.name) : null;
        if (alvo)
          await alvo.setReactionsAsync([
            { trigger: { type: 'ON_CLICK' }, actions: [{ type: 'CLOSE' }] },
          ]);
      }
      this.rel.interacoes.push(`${c.nome}: overlay no protótipo`);
    } catch (e) {
      this.rel.avisos.push(`Protótipo com overlay de ${c.nome}: ${(e as Error).message}`);
    }
    return [tela, sobre];
  }

  /** Instância do componente pronta para usar, ao lado da definição. */
  protected construirExemplo(c: PlanoComponente, principal: No, x: number, y: number): No {
    const base = principal.type === 'COMPONENT_SET' ? principal.defaultVariant : principal;
    const inst = base.createInstance();
    inst.name = `${c.nome} — instância de exemplo`;
    this.figma.currentPage.appendChild(inst);
    inst.x = x;
    inst.y = y;
    this.rel.exemplos.push(inst.id);
    return inst;
  }

  /* ------------------------------ Documentação ------------------------------ */

  protected texto(
    conteudo: string,
    tamanho: number,
    estilo = 'Regular',
    familia = 'Inter',
    cor: FigmaCor = { r: 0.96, g: 0.95, b: 1, a: 1 },
  ): No {
    const t = this.figma.createText();
    t.fontName = this.fonte(familia, estilo);
    t.characters = conteudo;
    t.fontSize = tamanho;
    t.fills = [{ type: 'SOLID', color: rgb(cor) }];
    t.layoutAlign = 'STRETCH';
    t.textAutoResize = 'HEIGHT';
    return t;
  }

  protected construirDocumentacao(c: PlanoComponente, x: number, y: number): No {
    const f = this.figma;
    const quadro = f.createFrame();
    quadro.name = `KCX · ${c.nome} · documentação`;
    quadro.layoutMode = 'VERTICAL';
    quadro.itemSpacing = 12;
    quadro.paddingLeft = quadro.paddingRight = quadro.paddingTop = quadro.paddingBottom = 32;
    quadro.primaryAxisSizingMode = 'AUTO';
    quadro.counterAxisSizingMode = 'FIXED';
    quadro.resize(720, 100);
    quadro.cornerRadius = 16;
    quadro.fills = [{ type: 'SOLID', color: { r: 0.043, g: 0.039, b: 0.078 } }];
    const docs = this.plano.colecoes
      .flatMap((col) => col.variaveis)
      .filter((v) => v.nome.startsWith(`${c.id}/`) && !v.vinculadaA.length);
    const add = (n: No) => quadro.appendChild(n);
    add(this.texto(`${c.nome} — KCX v${c.versao}`, 28, 'Bold'));
    add(
      this.texto(
        `Nível ${c.nivel} · ${c.nivel === 1 ? 'nativo editável' : 'parcialmente editável'} · pacote ${c.pacote}`,
        14,
      ),
    );
    add(this.texto(`Editável no Figma\n• ${c.editavel.join('\n• ')}`, 14));
    if (c.parcial.length)
      add(this.texto(`Representado, mas não executa\n• ${c.parcial.join('\n• ')}`, 14));
    if (c.naoSuportado.length)
      add(this.texto(`Só no código\n• ${c.naoSuportado.join('\n• ')}`, 14));
    add(this.texto(`Limitações\n• ${c.limitacoes.join('\n• ')}`, 14));
    if (docs.length) {
      add(
        this.texto(
          `Variáveis documentais (não controlam nada no Figma)\n• ${docs.map((v) => v.nome).join('\n• ')}`,
          14,
        ),
      );
    }
    const mono = this.fontesOk.has('Roboto Mono|Regular') ? 'Roboto Mono' : 'Inter';
    for (const [rotulo, codigo] of [
      ['HTML', c.codigo.html],
      ['CSS', c.codigo.css],
      ['JS', c.codigo.js],
    ] as const) {
      add(this.texto(rotulo, 16, 'Bold'));
      add(this.texto(codigo, 11, 'Regular', mono, { r: 0.79, g: 0.76, b: 0.92, a: 1 }));
    }
    quadro.x = x;
    quadro.y = y;
    f.currentPage.appendChild(quadro);
    this.rel.documentacao = quadro.id;
    return quadro;
  }

  protected construirComposicao(principais: Map<string, No>, x: number, y: number): void {
    const comp = this.plano.composicao;
    if (!comp) return;
    const f = this.figma;
    const quadro = f.createFrame();
    quadro.name = `KCX · ${comp.nome}`;
    quadro.fills = [{ type: 'SOLID', color: { r: 0.043, g: 0.039, b: 0.078 } }];
    quadro.clipsContent = true;
    const instancias = comp.camadas
      .map((c) => {
        const p = principais.get(c.componente);
        const base = p?.type === 'COMPONENT_SET' ? p.defaultVariant : p;
        return base ? { papel: c.papel, inst: base.createInstance() } : null;
      })
      .filter((x): x is { papel: string; inst: No } => !!x);
    const fundo = instancias.find((i) => i.papel === 'fundo');
    const larg = Math.max(...instancias.map((i) => i.inst.width), 400);
    const alt = Math.max(
      fundo?.inst.height ?? 0,
      instancias.filter((i) => i.papel !== 'fundo').reduce((s, i) => s + i.inst.height, 0) + 48,
    );
    quadro.resize(larg, alt);
    let cursor =
      (alt - instancias.filter((i) => i.papel !== 'fundo').reduce((s, i) => s + i.inst.height, 0)) /
      2;
    for (const i of instancias) {
      quadro.appendChild(i.inst);
      if (i.papel === 'fundo') {
        i.inst.x = 0;
        i.inst.y = 0;
      } else {
        i.inst.x = (larg - i.inst.width) / 2;
        i.inst.y = cursor;
        cursor += i.inst.height;
      }
    }
    quadro.x = x;
    quadro.y = y;
    f.currentPage.appendChild(quadro);
    this.rel.composicao = quadro.id;
  }

  async executar(): Promise<RelatorioImportacao> {
    if (this.plano.modo !== 'visual') await this.criarVariaveis();
    if (!this.plano.componentes.length) return this.rel;
    await this.carregarFontes();
    try {
      await this.figma.loadFontAsync({ family: 'Roboto Mono', style: 'Regular' });
      this.fontesOk.add('Roboto Mono|Regular');
    } catch {
      /* usa Inter */
    }
    const origem = this.figma.viewport?.center ?? { x: 0, y: 0 };
    let y = Math.round(origem.y);
    const x = Math.round(origem.x);
    const principais = this.principais;
    const criados: No[] = [];
    const biblioteca = this.construirIcones(x - 600, y);
    if (biblioteca) criados.push(biblioteca);
    const ordem: PlanoComponente[] = [];
    const por = (c: PlanoComponente, pilha: Set<string>) => {
      if (ordem.includes(c) || pilha.has(c.id)) return;
      pilha.add(c.id);
      for (const id of c.usa ?? []) {
        const d = this.plano.componentes.find((x) => x.id === id);
        if (d) por(d, pilha);
      }
      ordem.push(c);
    };
    this.plano.componentes.forEach((c) => por(c, new Set()));
    for (const c of ordem) {
      // Peças reutilizáveis à esquerda, componente no meio, documentação à direita, exemplo embaixo.
      const pecas = c.pecas.length ? this.construirPecas(c, x, y) : null;
      const px = pecas ? x + pecas.width + 80 : x;
      const p = this.construirComponente(c, px, y);
      await this.criarInteracoes(c);
      principais.set(c.id, p);
      const proto = await this.construirPrototipo(c, p, px, y + p.height + 60);
      if (proto) criados.push(...proto);
      criados.push(p);
      if (pecas) criados.push(pecas);
      const exemplo = this.construirExemplo(c, p, px, y + p.height + 60);
      criados.push(exemplo);
      let alto = p.height + 60 + exemplo.height;
      if (this.plano.documentacao) {
        const doc = this.construirDocumentacao(c, px + p.width + 80, y);
        criados.push(doc);
        alto = Math.max(alto, doc.height);
      }
      if (pecas) alto = Math.max(alto, pecas.height);
      y += Math.max(alto, 200) + 160;
    }
    if (this.plano.composicao) this.construirComposicao(principais, x, y);
    try {
      this.figma.currentPage.selection = criados;
      this.figma.viewport.scrollAndZoomIntoView(criados);
    } catch {
      /* fora do editor */
    }
    return this.rel;
  }
}

/** Executa o plano no arquivo aberto do Figma. */
export function importarNoFigma(
  figma: Figma,
  plano: PlanoFigma,
  pacoteJson: string,
  duplicados: ModoDuplicados = 'atualizar',
) {
  return new Construtor(figma, plano, pacoteJson, duplicados).executar();
}
