/** Camada 2 do importador: ícones, peças, nós, propriedades e componentes com variantes. */

import { FigmaCor, PlanoComponente, PlanoNo, PlanoProp } from '../../figma-plano';
import { No, Refs, CHAVE_PLUGIN } from './tipos';
import { BaseVariaveis } from './base-variaveis';

export abstract class BaseNos extends BaseVariaveis {
  /** Nós de cada variante (para ligar as interações do protótipo). */
  protected nosPorVariante = new Map<string, { variante: No; nos: Map<string, No> }>();

  /* ------------------------------ Camadas ------------------------------ */

  /** Componentes das peças reutilizáveis já criados: "peça|variante" → componente. */
  protected readonly pecas = new Map<string, No>();

  /** Aplica traço (cor/espessura vinculadas) aos vetores de um SVG importado. */
  protected tracarVetores(
    vetores: No[],
    traco: { cor: PlanoProp<FigmaCor>; espessura: PlanoProp<number> },
    onde: string,
  ): void {
    for (const vet of vetores) {
      vet.strokes = [this.pintura({ tipo: 'solido', cor: traco.cor }, onde)];
      vet.strokeWeight = Number(traco.espessura.valor);
      this.vincular(vet, 'strokeWeight', traco.espessura, onde);
      vet.strokeCap = 'ROUND';
      vet.strokeJoin = 'ROUND';
      vet.fills = [];
      try {
        vet.constraints = { horizontal: 'SCALE', vertical: 'SCALE' };
      } catch {
        /* sem restrições */
      }
    }
  }

  /** Componentes principais já criados (id KCX → componente ou conjunto). */
  protected readonly principais = new Map<string, No>();

  /** Componentes da biblioteca de ícones (nome → componente). */
  protected readonly icones = new Map<string, No>();

  /**
   * Biblioteca "KCX · Ícones": um componente por ícone ("KCX Ícone/<nome>"),
   * 24 × 24, traço de 2 px. Reaproveita a biblioteca que já estiver na página.
   */
  protected construirIcones(x: number, y: number): No | null {
    const lista = this.plano.icones;
    if (!lista) return null;
    const f = this.figma;
    const existentes: No[] = (() => {
      try {
        return f.currentPage.findAll(
          (n: No) => n.type === 'COMPONENT' && /^KCX Ícone\//.test(n.name),
        );
      } catch {
        return [];
      }
    })();
    for (const e of existentes) this.icones.set(e.name.replace(/^KCX Ícone\//, ''), e);
    const faltam = Object.keys(lista).filter((n) => !this.icones.has(n));
    if (!faltam.length) return null;
    const quadro = f.createFrame();
    quadro.name = 'KCX · Ícones';
    quadro.layoutMode = 'HORIZONTAL';
    quadro.layoutWrap = 'WRAP';
    quadro.itemSpacing = 16;
    quadro.counterAxisSpacing = 16;
    quadro.paddingLeft = quadro.paddingRight = quadro.paddingTop = quadro.paddingBottom = 24;
    quadro.primaryAxisSizingMode = 'FIXED';
    quadro.counterAxisSizingMode = 'AUTO';
    quadro.resize(24 * 8 + 16 * 7 + 48, 100);
    quadro.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
    quadro.cornerRadius = 12;
    for (const nome of faltam) {
      const svg = f.createNodeFromSvg(
        `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="${lista[nome]}" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      );
      const comp = f.createComponent();
      comp.name = `KCX Ícone/${nome}`;
      comp.resize(24, 24);
      comp.fills = [];
      comp.clipsContent = false;
      const vetores = svg.findAll ? svg.findAll((n: No) => n.type === 'VECTOR') : [];
      for (const v of vetores) {
        const vx = v.absoluteTransform ? v.absoluteTransform[0][2] - svg.x : v.x;
        const vy = v.absoluteTransform ? v.absoluteTransform[1][2] - svg.y : v.y;
        comp.appendChild(v);
        v.x = vx;
        v.y = vy;
        // Mesmo nome em todos os ícones: a cor sobrescrita passa para o ícone trocado.
        v.name = 'Traço';
      }
      svg.remove();
      this.tracarVetores(
        vetores,
        { cor: { valor: { r: 0, g: 0, b: 0, a: 1 } }, espessura: { valor: 2 } },
        `Ícone ${nome}`,
      );
      comp.description = `Ícone da biblioteca KCX. Troque nos componentes pela propriedade de ícone (Instance swap).`;
      quadro.appendChild(comp);
      this.icones.set(nome, comp);
    }
    quadro.x = x;
    quadro.y = y;
    f.currentPage.appendChild(quadro);
    this.rel.pecas.push({ nome: quadro.name, id: quadro.id, variantes: faltam.length });
    return quadro;
  }

  /**
   * Peças reutilizáveis: um componente com uma variante por opção (ex.:
   * "SVG Motion · Caminho", Forma=onda/laço/zigue-zague). As variantes do
   * componente principal usam instâncias dela: editar o desenho na peça
   * atualiza todas as variantes.
   */
  protected construirPecas(c: PlanoComponente, x: number, y: number): No | null {
    const f = this.figma;
    let ultimo: No | null = null;
    let cursorY = y;
    for (const peca of c.pecas) {
      const comps: No[] = [];
      for (const op of peca.opcoes) {
        const svg = f.createNodeFromSvg(op.svg);
        const comp = f.createComponent();
        comp.name =
          c.pecas.length && peca.opcoes.length > 1
            ? `Forma=${op.rotulo}`
            : `${c.nome} · ${peca.nome}`;
        comp.resize(Math.max(1, svg.width), Math.max(1, svg.height));
        comp.fills = [];
        comp.clipsContent = false;
        const vetores = svg.findAll ? svg.findAll((n: No) => n.type === 'VECTOR') : [];
        for (const v of vetores) {
          const vx = v.absoluteTransform ? v.absoluteTransform[0][2] - svg.x : v.x;
          const vy = v.absoluteTransform ? v.absoluteTransform[1][2] - svg.y : v.y;
          comp.appendChild(v);
          v.x = vx;
          v.y = vy;
        }
        svg.remove();
        this.tracarVetores(vetores, op.traco, `${c.nome} › ${peca.nome} › ${op.rotulo}`);
        comps.push(comp);
        this.pecas.set(`${peca.nome}|${op.rotulo}`, comp);
      }
      let raiz: No;
      if (comps.length > 1) {
        raiz = f.combineAsVariants(comps, f.currentPage);
        semTracejado(raiz);
        comps.forEach((k, i) => {
          k.x = 20;
          k.y = 20 + i * (k.height + 40);
        });
        raiz.layoutMode = 'NONE';
        try {
          raiz.resizeWithoutConstraints(
            Math.max(...comps.map((k) => k.width)) + 40,
            comps.reduce((s, k) => s + k.height + 40, 0) + 20,
          );
        } catch {
          /* tamanho automático */
        }
      } else {
        raiz = comps[0];
        f.currentPage.appendChild(raiz);
      }
      raiz.name = `${c.nome} · ${peca.nome}`;
      raiz.description = `Peça reutilizável de ${c.nome}. Edite o desenho aqui: todas as variantes de ${c.nome} usam instâncias desta peça.`;
      raiz.x = x;
      raiz.y = cursorY;
      cursorY += raiz.height + 60;
      this.rel.pecas.push({ nome: raiz.name, id: raiz.id, variantes: comps.length });
      ultimo = raiz;
    }
    return ultimo;
  }

  protected construirNo(
    p: PlanoNo,
    alvo: No | null,
    paiAutoLayout: boolean,
    onde: string,
    refs: Refs,
  ): No {
    const f = this.figma;
    let no: No;
    const local = `${onde} › ${p.nome}`;
    const pecaComp = p.peca ? this.pecas.get(`${p.peca.nome}|${p.peca.variante}`) : undefined;
    const iconeComp = p.tipo === 'icone' && p.icone ? this.icones.get(p.icone.nome) : undefined;
    const principalInst =
      p.tipo === 'instancia' && p.instancia
        ? this.principais.get(p.instancia.componente)
        : undefined;
    if (p.tipo === 'instancia' && p.instancia && principalInst) {
      const variante =
        principalInst.type === 'COMPONENT_SET'
          ? (principalInst.children.find((c: No) => c.name === p.instancia!.variante) ??
            principalInst.defaultVariant)
          : principalInst;
      no = variante.createInstance();
      const props = (no.componentProperties ?? {}) as Record<string, unknown>;
      const novos: Record<string, string> = {};
      for (const [nome, valor] of Object.entries(p.instancia.textos)) {
        const chave = Object.keys(props).find((k) => k === nome || k.startsWith(`${nome}#`));
        if (chave) novos[chave] = valor;
      }
      if (Object.keys(novos).length) {
        try {
          no.setProperties(novos);
        } catch (e) {
          this.rel.avisos.push(`${local}: textos da instância: ${(e as Error).message}`);
        }
      }
    } else if (p.tipo === 'instancia') {
      no = f.createFrame();
      no.fills = [];
      this.rel.avisos.push(`${local}: componente "${p.instancia?.componente}" não encontrado.`);
    } else if (p.slot && refs.raiz && typeof refs.raiz.createSlot === 'function') {
      no = refs.raiz.createSlot();
      no.fills = [];
      (refs.slots ??= []).push(p.slot);
    } else if (p.tipo === 'icone' && p.icone && iconeComp) {
      no = iconeComp.createInstance();
      const t = p.icone.tamanho;
      try {
        no.resize(t, t);
      } catch {
        /* tamanho do componente */
      }
      const vetores = no.findAll ? no.findAll((x: No) => x.type === 'VECTOR') : [];
      for (const v of vetores) {
        v.strokes = [this.pintura({ tipo: 'solido', cor: p.icone.cor }, local)];
      }
      if (p.icone.propriedade)
        (refs.icone ??= []).push({ no, prop: p.icone.propriedade, plano: p });
    } else if (p.tipo === 'icone') {
      no = f.createFrame();
      no.fills = [];
      no.resize(p.icone?.tamanho ?? 20, p.icone?.tamanho ?? 20);
      this.rel.avisos.push(`${local}: ícone "${p.icone?.nome}" fora da biblioteca.`);
    } else if (p.tipo === 'svg' && pecaComp) {
      no = pecaComp.createInstance();
      if (p.svgTraco?.tracejado?.length) {
        for (const v of no.findAll((x: No) => x.type === 'VECTOR'))
          v.dashPattern = p.svgTraco.tracejado;
      }
    } else if (p.tipo === 'svg') {
      no = f.createNodeFromSvg(p.svg ?? '<svg xmlns="http://www.w3.org/2000/svg"/>');
      no.fills = [];
      const vetores = no.findAll ? no.findAll((x: No) => x.type === 'VECTOR') : [];
      if (p.svgTraco) {
        this.tracarVetores(vetores, p.svgTraco, local);
        if (p.svgTraco.tracejado?.length)
          for (const v of vetores) v.dashPattern = p.svgTraco.tracejado;
      }
    } else if (p.tipo === 'texto' && p.texto) {
      no = f.createText();
      no.fontName = this.fonte(p.texto.familia, p.texto.estilo);
      no.characters = String(p.texto.conteudo.valor);
      no.fontSize = Number(p.texto.tamanho.valor);
      if (p.texto.espacamento)
        no.letterSpacing = { value: Number(p.texto.espacamento.valor), unit: 'PIXELS' };
      if (p.texto.caixaAlta) no.textCase = 'UPPER';
      no.textAlignHorizontal = p.texto.alinhamento;
      no.textAutoResize = 'WIDTH_AND_HEIGHT';
      // Texto com propriedade de componente: a propriedade (com padrão ligado à variável) controla o texto.
      if (!p.texto.propriedade) this.vincular(no, 'characters', p.texto.conteudo, local);
      this.vincularTexto(no, 'fontSize', p.texto.tamanho, local);
      if (p.texto.espacamento) this.vincularTexto(no, 'letterSpacing', p.texto.espacamento, local);
      if (p.texto.propriedade) refs.texto.push({ no, prop: p.texto.propriedade, plano: p });
      if (p.texto.estiloTexto) this.textosComEstilo.push({ no, estilo: p.texto.estiloTexto });
    } else if (p.tipo === 'elipse') {
      no = f.createEllipse();
    } else if (p.tipo === 'retangulo') {
      no = f.createRectangle();
    } else {
      no = alvo ?? f.createFrame();
      no.fills = [];
      no.clipsContent = p.recortar;
    }
    no.name = p.nome;
    if (p.id) refs.nos?.set(p.id, no);

    if (p.grade) {
      try {
        no.layoutMode = 'GRID';
        no.gridColumnCount = p.grade.colunas;
        no.gridRowCount = p.grade.linhas;
        no.gridColumnGap = no.gridRowGap = Number(p.grade.espaco.valor);
        this.vincular(no, 'gridColumnGap', p.grade.espaco, local);
        this.vincular(no, 'gridRowGap', p.grade.espaco, local);
      } catch {
        // Sem Grid: Auto Layout horizontal com quebra de linha.
        no.layoutMode = 'HORIZONTAL';
        no.layoutWrap = 'WRAP';
        no.itemSpacing = no.counterAxisSpacing = Number(p.grade.espaco.valor);
      }
      no.primaryAxisSizingMode = 'AUTO';
      no.counterAxisSizingMode = 'AUTO';
    }
    if (p.tipo === 'frame' && p.autoLayout) {
      no.layoutMode = p.autoLayout.direcao;
      no.primaryAxisAlignItems = p.autoLayout.distribuir ? 'SPACE_BETWEEN' : 'CENTER';
      no.counterAxisAlignItems = p.autoLayout.alinhar ?? 'CENTER';
      no.itemSpacing = Number(p.autoLayout.espaco.valor);
      no.paddingLeft = no.paddingRight = Number(p.autoLayout.paddingX.valor);
      no.paddingTop = no.paddingBottom = Number(p.autoLayout.paddingY.valor);
      this.vincular(no, 'itemSpacing', p.autoLayout.espaco, local);
      const lados = p.autoLayout.lados ?? {};
      const porLado: [string, PlanoProp<number>][] = [
        ['paddingLeft', lados.esquerda ?? p.autoLayout.paddingX],
        ['paddingRight', lados.direita ?? p.autoLayout.paddingX],
        ['paddingTop', lados.cima ?? p.autoLayout.paddingY],
        ['paddingBottom', lados.baixo ?? p.autoLayout.paddingY],
      ];
      for (const [campo, prop] of porLado) {
        no[campo] = Number(prop.valor);
        this.vincular(no, campo, prop, local);
      }
      if (p.autoLayout.quebrar) {
        try {
          no.layoutWrap = 'WRAP';
          no.counterAxisSpacing = Number(p.autoLayout.espaco.valor);
          this.vincular(no, 'counterAxisSpacing', p.autoLayout.espaco, local);
        } catch {
          /* wrap só em Auto Layout horizontal */
        }
      }
      // Eixo com medida definida fica FIXED; o outro abraça o conteúdo (Hug).
      const hor = p.autoLayout.direcao === 'HORIZONTAL';
      const principal = hor ? p.largura : p.altura;
      const cruzado = hor ? p.altura : p.largura;
      no.primaryAxisSizingMode = principal !== undefined ? 'FIXED' : 'AUTO';
      no.counterAxisSizingMode = cruzado !== undefined ? 'FIXED' : 'AUTO';
    }
    if ((p.largura || p.altura) && p.tipo !== 'texto') {
      const auto = p.tipo === 'frame' && p.autoLayout;
      if (p.largura && p.altura)
        no.resize(Math.max(0.01, Number(p.largura.valor)), Math.max(0.01, Number(p.altura.valor)));
      else if (p.largura && auto)
        no.resize(Math.max(0.01, Number(p.largura.valor)), Math.max(0.01, no.height));
      else if (p.altura && auto)
        no.resize(Math.max(0.01, no.width), Math.max(0.01, Number(p.altura.valor)));
      // resize() deixa os dois eixos FIXED: volta o eixo sem medida para Hug.
      if (auto && !(p.largura && p.altura)) {
        const hor = p.autoLayout!.direcao === 'HORIZONTAL';
        // Com largura fixa, o eixo que cresce sozinho é o cruzado; sem largura, é o principal.
        const cresceNoPrincipal = p.largura ? !hor : hor;
        if (cresceNoPrincipal) no.primaryAxisSizingMode = 'AUTO';
        else no.counterAxisSizingMode = 'AUTO';
      }
      if (p.largura) this.vincular(no, 'width', p.largura, local);
      if (p.altura) this.vincular(no, 'height', p.altura, local);
    }
    for (const [campo, prop] of [
      ['minWidth', p.larguraMin],
      ['maxWidth', p.larguraMax],
    ] as const) {
      if (!prop) continue;
      try {
        no[campo] = Number(prop.valor);
        this.vincular(no, campo, prop, local);
      } catch {
        this.rel.avisos.push(`${local}: ${campo} só vale em Auto Layout.`);
      }
    }
    if (!paiAutoLayout || p.absoluto) {
      if (p.x !== undefined) no.x = p.x;
      if (p.y !== undefined) no.y = p.y;
    }
    if (p.rotacao) no.rotation = p.rotacao;
    if (p.arco && p.tipo === 'elipse') {
      no.arcData = {
        startingAngle: p.arco.inicio,
        endingAngle: p.arco.fim,
        innerRadius: p.arco.interno,
      };
    }
    if (p.opacidade) {
      no.opacity = Math.min(1, Math.max(0, Number(p.opacidade.valor)));
      this.vincular(no, 'opacity', p.opacidade, local);
    }
    if (p.visivel) {
      no.visible = p.visivel.valor !== false;
      // Com propriedade de visibilidade, quem controla é a propriedade (padrão ligado à variável).
      if (!p.propriedadeVisivel) this.vincular(no, 'visible', p.visivel, local);
    }
    if (p.propriedadeVisivel) refs.visivel.push({ no, prop: p.propriedadeVisivel, plano: p });
    if (p.raio && 'cornerRadius' in no) {
      no.cornerRadius = Number(p.raio.valor);
      // O Figma vincula o raio canto a canto.
      for (const canto of [
        'topLeftRadius',
        'topRightRadius',
        'bottomLeftRadius',
        'bottomRightRadius',
      ])
        this.vincular(no, canto, p.raio, local);
    }
    if (p.preenchimentos.length && p.tipo !== 'svg')
      no.fills = p.preenchimentos.map((x) => this.pintura(x, local));
    if (p.traco) {
      no.strokes = [this.pintura(p.traco.pintura, local)];
      no.strokeWeight = Number(p.traco.espessura.valor);
      no.strokeAlign = 'INSIDE';
      this.vincular(no, 'strokeWeight', p.traco.espessura, local);
    }
    this.efeitos(no, p, local);

    const absolutos: { no: No; plano: PlanoNo }[] = [];
    for (const filho of p.filhos) {
      const n = this.construirNo(filho, null, !!p.autoLayout || !!p.grade, local, refs);
      no.appendChild(n);
      if (p.autoLayout && filho.absoluto) {
        n.layoutPositioning = 'ABSOLUTE';
        absolutos.push({ no: n, plano: filho });
      } else if (p.autoLayout && filho.texto?.preencher) {
        n.layoutSizingHorizontal = 'FILL';
        n.textAutoResize = 'HEIGHT';
      } else if (p.autoLayout && filho.encher) {
        // Em Auto Layout vertical, Fill é a largura; em horizontal, também (cresce no eixo).
        try {
          n.layoutSizingHorizontal = 'FILL';
        } catch {
          /* nó sem dimensionamento de Auto Layout */
        }
      }
      if (filho.restricoes) {
        try {
          n.constraints = filho.restricoes;
        } catch {
          /* restrições indisponíveis neste tipo */
        }
      }
    }
    // Camadas absolutas que esticam: ganham o tamanho do pai e acompanham o redimensionamento.
    for (const a of absolutos) {
      if (a.plano.restricoes?.horizontal === 'STRETCH') {
        a.no.x = 0;
        a.no.resize(Math.max(0.01, no.width), a.no.height);
      }
      if (a.plano.restricoes?.vertical === 'STRETCH') {
        a.no.y = 0;
        a.no.resize(a.no.width, Math.max(0.01, no.height));
      }
    }
    return no;
  }

  /** Cria as propriedades de componente (texto e visibilidade) e liga as camadas a elas. */
  protected propriedades(principal: No, refsPorVariante: Refs[]): void {
    const f = this.figma;
    const tipos = [
      { lista: 'texto' as const, tipo: 'TEXT', campo: 'characters' },
      { lista: 'visivel' as const, tipo: 'BOOLEAN', campo: 'visible' },
    ];
    for (const t of tipos) {
      const nomes = new Set(refsPorVariante.flatMap((r) => r[t.lista].map((x) => x.prop)));
      for (const nome of nomes) {
        const ref = refsPorVariante.flatMap((r) => r[t.lista]).find((r) => r.prop === nome)!;
        const prop = t.tipo === 'TEXT' ? ref.plano.texto!.conteudo : ref.plano.visivel;
        const literal =
          t.tipo === 'TEXT' ? String(prop?.valor ?? '') : prop ? prop.valor !== false : true;
        const v = this.variavel(prop);
        let chave: string;
        try {
          chave = principal.addComponentProperty(
            nome,
            t.tipo,
            v ? f.variables.createVariableAlias(v) : literal,
          );
        } catch {
          chave = principal.addComponentProperty(nome, t.tipo, literal);
          this.rel.avisos.push(
            `Propriedade "${nome}": o padrão não pôde ser ligado à variável; ficou com o valor atual.`,
          );
        }
        for (const refs of refsPorVariante) {
          for (const r of refs[t.lista].filter((x) => x.prop === nome)) {
            try {
              r.no.componentPropertyReferences = {
                ...(r.no.componentPropertyReferences ?? {}),
                [t.campo]: chave,
              };
            } catch (e) {
              this.rel.avisos.push(`Propriedade "${nome}": ${(e as Error).message}`);
            }
          }
        }
        this.rel.propriedades.push(`${nome} (${t.tipo === 'TEXT' ? 'texto' : 'mostrar/ocultar'})`);
      }
    }
    // Slots: a propriedade criada com o slot ganha o nome do plano.
    const nomesSlot = new Set(refsPorVariante.flatMap((r) => r.slots ?? []));
    if (nomesSlot.size) {
      const defs = (principal.componentPropertyDefinitions ?? {}) as Record<
        string,
        { type: string }
      >;
      const chaves = Object.keys(defs).filter((k) => defs[k].type === 'SLOT');
      const nome = [...nomesSlot][0];
      for (const k of chaves) {
        if (k.split('#')[0] === nome) continue;
        try {
          principal.editComponentProperty(k, { name: nome });
        } catch {
          /* nome já usado ou slot sem edição */
        }
      }
      this.rel.propriedades.push(...[...nomesSlot].map((n) => `${n} (slot)`));
    }
    // Troca de instância: ícones da biblioteca como sugeridos.
    const nomesIcone = new Set(refsPorVariante.flatMap((r) => (r.icone ?? []).map((x) => x.prop)));
    for (const nome of nomesIcone) {
      const ref = refsPorVariante.flatMap((r) => r.icone ?? []).find((r) => r.prop === nome)!;
      const padrao = this.icones.get(ref.plano.icone!.nome);
      if (!padrao) continue;
      const sugeridos = [...this.icones.values()]
        .filter((c) => c.key)
        .map((c) => ({ type: 'COMPONENT', key: c.key }));
      let chave: string;
      try {
        chave = principal.addComponentProperty(nome, 'INSTANCE_SWAP', padrao.id, {
          preferredValues: sugeridos,
        });
      } catch {
        try {
          chave = principal.addComponentProperty(nome, 'INSTANCE_SWAP', padrao.id);
        } catch (e) {
          this.rel.avisos.push(`Propriedade "${nome}" (troca de ícone): ${(e as Error).message}`);
          continue;
        }
      }
      for (const refs of refsPorVariante) {
        for (const r of (refs.icone ?? []).filter((x) => x.prop === nome)) {
          try {
            r.no.componentPropertyReferences = {
              ...(r.no.componentPropertyReferences ?? {}),
              mainComponent: chave,
            };
          } catch (e) {
            this.rel.avisos.push(`Propriedade "${nome}": ${(e as Error).message}`);
          }
        }
      }
      this.rel.propriedades.push(`${nome} (troca de ícone)`);
    }
  }

  protected construirComponente(c: PlanoComponente, x0: number, y0: number): No {
    const f = this.figma;
    const variantes: No[] = [];
    const refsPorVariante: Refs[] = [];
    c.variantes.forEach((v) => {
      const comp = f.createComponent();
      const refs: Refs = { texto: [], visivel: [], nos: new Map(), raiz: comp };
      this.construirNo(v.arvore, comp, false, c.nome, refs);
      comp.name = c.variantes.length > 1 ? v.nome : c.nome;
      variantes.push(comp);
      refsPorVariante.push(refs);
      this.nosPorVariante.set(`${c.id}|${v.nome}`, { variante: comp, nos: refs.nos! });
    });
    let principal: No;
    if (variantes.length > 1) {
      principal = f.combineAsVariants(variantes, f.currentPage);
      principal.name = c.nome;
      semTracejado(principal);
      // Variantes em grade (até 3 por linha).
      const larg = Math.max(...variantes.map((v) => v.width)) + 40;
      const alt = Math.max(...variantes.map((v) => v.height)) + 40;
      variantes.forEach((v, i) => {
        v.x = 20 + (i % 3) * larg;
        v.y = 20 + Math.floor(i / 3) * alt;
      });
      principal.layoutMode = 'NONE';
      try {
        principal.resizeWithoutConstraints(
          Math.min(3, variantes.length) * larg + 20,
          Math.ceil(variantes.length / 3) * alt + 20,
        );
      } catch {
        /* tamanho automático */
      }
    } else {
      principal = variantes[0];
      f.currentPage.appendChild(principal);
    }
    principal.x = x0;
    principal.y = y0;
    principal.description =
      `${c.descricao}\n\nKCX ${c.id} v${c.versao} · Nível ${c.nivel}.\n` +
      `Editável: ${c.editavel.join('; ')}.\nLimitações: ${c.limitacoes.join(' ')}`;
    this.propriedades(principal, refsPorVariante);

    try {
      principal.setSharedPluginData(CHAVE_PLUGIN, 'componente', c.id);
      principal.setSharedPluginData(CHAVE_PLUGIN, 'versao', c.versao);
      principal.setSharedPluginData(CHAVE_PLUGIN, 'pacote', this.pacoteJson);
    } catch {
      this.rel.avisos.push(
        'Não foi possível guardar o pacote KCX no componente (pluginData indisponível). O código continua no quadro de documentação.',
      );
    }
    this.rel.componentes.push({ nome: c.nome, id: principal.id, variantes: variantes.length });
    return principal;
  }
}

/**
 * O Figma cria o conjunto de variantes com uma borda roxa tracejada (é um
 * traço de verdade, que sai junto no arquivo). O KCX tira: fica sem borda.
 */
export function semTracejado(conjunto: No): void {
  try {
    conjunto.strokes = [];
    conjunto.dashPattern = [];
  } catch {
    /* tipos sem traço */
  }
}
