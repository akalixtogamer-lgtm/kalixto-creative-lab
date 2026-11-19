/**
 * Executor do plano KCX dentro do Figma (usado pelo plugin Figma Bridge).
 *
 * Recebe o PlanoFigma (calculado por figma-plano.ts) e a API `figma` do
 * plugin, e cria: coleções e modos, variáveis (com escopo, descrição e code
 * syntax), componentes com variantes, vínculos de variáveis em cada
 * propriedade suportada, propriedades de texto, quadro de documentação e
 * composição. Guarda o pacote KCX no componente para recuperar o código.
 *
 * Os tipos do Figma ficam soltos aqui (`any`) para este arquivo rodar também
 * nos testes com uma API simulada; o plugin (figma-bridge/src/code.ts) é
 * verificado com @figma/plugin-typings.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  FigmaCor,
  FigmaValor,
  easingFigma,
  PlanoComponente,
  PlanoFigma,
  PlanoInteracao,
  PlanoNo,
  PlanoPaint,
  PlanoProp,
  PlanoVariavel,
} from '../figma-plano';

type Figma = any;
type No = any;
type Ref = { no: No; prop: string; plano: PlanoNo };
type Refs = {
  texto: Ref[];
  visivel: Ref[];
  icone?: Ref[];
  nos?: Map<string, No>;
  /** Componente da variante (para criar slots). */
  raiz?: No;
  slots?: string[];
};

export type ModoDuplicados = 'atualizar' | 'copia';

export interface RelatorioImportacao {
  colecoes: { nome: string; criada: boolean; modos: string[] }[];
  variaveisCriadas: string[];
  variaveisAtualizadas: string[];
  vinculos: number;
  vinculosFalhos: string[];
  componentes: { nome: string; id: string; variantes: number }[];
  /** Peças reutilizáveis (ex.: Caminho do SVG Motion). */
  pecas: { nome: string; id: string; variantes: number }[];
  /** Propriedades de componente criadas. */
  propriedades: string[];
  /** Instâncias de exemplo. */
  exemplos: string[];
  /** Camadas que receberam interações de protótipo (nome: quantidade). */
  interacoes: string[];
  documentacao?: string;
  composicao?: string;
  avisos: string[];
}

export const CHAVE_PLUGIN = 'kcx';

function rgb(c: FigmaCor) {
  return { r: c.r, g: c.g, b: c.b };
}

/** Procura uma variável local pelo nome dentro da coleção. */
async function variaveisLocais(figma: Figma): Promise<any[]> {
  return figma.variables.getLocalVariablesAsync
    ? await figma.variables.getLocalVariablesAsync()
    : [];
}

/** Coleções/variáveis do plano que já existem no arquivo (para avisar antes). */
export async function detectarDuplicados(figma: Figma, plano: PlanoFigma) {
  const colecoes = await figma.variables.getLocalVariableCollectionsAsync();
  const vars = await variaveisLocais(figma);
  const nomesCol = new Set(colecoes.map((c: any) => c.name));
  const existentes: string[] = [];
  for (const c of plano.colecoes) {
    const col = colecoes.find((x: any) => x.name === c.nome);
    if (!col) continue;
    for (const v of c.variaveis)
      if (vars.some((x: any) => x.name === v.nome && x.variableCollectionId === col.id))
        existentes.push(v.nome);
  }
  const componentes: string[] = [];
  const pagina = figma.currentPage;
  const nos = pagina.findAllWithCriteria
    ? pagina.findAllWithCriteria({ types: ['COMPONENT_SET', 'COMPONENT'] })
    : [];
  for (const n of nos) {
    let id = '';
    try {
      id = n.getSharedPluginData(CHAVE_PLUGIN, 'componente');
    } catch {
      /* sem pluginData */
    }
    if (id && plano.componentes.some((c) => c.id === id)) componentes.push(`${n.name} (${id})`);
  }
  return {
    colecoes: plano.colecoes.filter((c) => nomesCol.has(c.nome)).map((c) => c.nome),
    variaveis: existentes,
    componentes,
  };
}

class Construtor {
  private readonly vars = new Map<string, any>();
  private readonly rel: RelatorioImportacao = {
    colecoes: [],
    variaveisCriadas: [],
    variaveisAtualizadas: [],
    vinculos: 0,
    vinculosFalhos: [],
    componentes: [],
    pecas: [],
    propriedades: [],
    exemplos: [],
    interacoes: [],
    avisos: [],
  };
  private fontePadrao = { family: 'Inter', style: 'Regular' };
  private fontesOk = new Set<string>();

  constructor(
    private readonly figma: Figma,
    private readonly plano: PlanoFigma,
    private readonly pacoteJson: string,
    private readonly duplicados: ModoDuplicados,
  ) {}

  /* ------------------------------ Variáveis ------------------------------ */

  private async criarVariaveis(): Promise<void> {
    const f = this.figma;
    const colecoes = await f.variables.getLocalVariableCollectionsAsync();
    const existentes = await variaveisLocais(f);
    const pendentesAlias: { variavel: any; modo: string; alvo: string }[] = [];
    for (const c of this.plano.colecoes) {
      let col = colecoes.find((x: any) => x.name === c.nome);
      const criada = !col;
      if (!col) col = f.variables.createVariableCollection(c.nome);
      // Modos: o primeiro é renomeado; os outros são procurados pelo nome ou criados.
      // Coleção que já existe (criada por outro componente) com modos diferentes:
      // um plano de modo único escreve em TODOS os modos existentes, em vez de
      // criar um modo novo e deixar o modo padrão vazio.
      const modoIds: Record<string, string> = {};
      const unicoEmExistente =
        !criada && c.modos.length === 1 && !col.modes.some((x: any) => x.name === c.modos[0]);
      if (unicoEmExistente) modoIds[c.modos[0]] = col.modes[0].modeId;
      else
        c.modos.forEach((m, i) => {
          const achado = col.modes.find((x: any) => x.name === m);
          if (achado) modoIds[m] = achado.modeId;
          else if (i === 0 && criada) {
            col.renameMode(col.modes[0].modeId, m);
            modoIds[m] = col.modes[0].modeId;
          } else {
            try {
              modoIds[m] = col.addMode(m);
            } catch {
              this.rel.avisos.push(
                `Modo "${m}" não foi criado em ${c.nome} (o plano do Figma limita a quantidade de modos). Usado só o primeiro modo.`,
              );
            }
          }
        });
      // Modos da coleção que o plano não cobre recebem o valor do primeiro modo do plano.
      const descobertos: string[] = col.modes
        .map((x: any) => x.modeId)
        .filter((id: string) => !Object.values(modoIds).includes(id));
      this.rel.colecoes.push({ nome: c.nome, criada, modos: Object.keys(modoIds) });
      this.colecoesFigma.set(c.nome, { id: col.id, modos: modoIds });
      for (const pv of c.variaveis) {
        let v = existentes.find(
          (x: any) => x.name === pv.nome && x.variableCollectionId === col.id,
        );
        let nome = pv.nome;
        if (v && this.duplicados === 'copia') {
          let i = 2;
          while (
            existentes.some(
              (x: any) => x.name === `${pv.nome} ${i}` && x.variableCollectionId === col.id,
            )
          )
            i++;
          nome = `${pv.nome} ${i}`;
          v = undefined;
        }
        let tipo = pv.tipo;
        if (v) this.rel.variaveisAtualizadas.push(nome);
        else {
          try {
            v = f.variables.createVariable(nome, col, tipo);
          } catch {
            // TIMING/EASING podem não estar liberados no arquivo: cai para FLOAT/STRING.
            tipo = tipo === 'TIMING' ? 'FLOAT' : 'STRING';
            v = f.variables.createVariable(nome, col, tipo);
            this.rel.avisos.push(`${nome}: tipo ${pv.tipo} indisponível; criada como ${tipo}.`);
          }
          this.rel.variaveisCriadas.push(nome);
        }
        v.description = pv.descricao;
        // Escopos só existem em COLOR, FLOAT e STRING (o Figma recusa em BOOLEAN, TIMING e EASING).
        if (['COLOR', 'FLOAT', 'STRING'].includes(v.resolvedType ?? tipo)) {
          try {
            v.scopes = pv.vinculadaA.length || pv.origem === 'compartilhada' ? pv.escopos : [];
          } catch {
            /* tipo sem escopo */
          }
        }
        if (pv.codigoWeb) {
          try {
            v.setVariableCodeSyntax('WEB', pv.codigoWeb);
          } catch {
            /* code syntax é opcional */
          }
        }
        try {
          v.setSharedPluginData(
            CHAVE_PLUGIN,
            'variavel',
            JSON.stringify({ kcx: pv.variavelKcx, origem: pv.origem, nome: pv.nome }),
          );
        } catch {
          /* pluginData indisponível */
        }
        const entradas = Object.entries(pv.valores);
        for (const [i, [modo, valor]] of entradas.entries()) {
          const id = modoIds[modo] ?? Object.values(modoIds)[0];
          if (!id) continue;
          const ids = i === 0 ? [id, ...descobertos] : [id];
          for (const alvoModo of ids) {
            if (valor && typeof valor === 'object' && 'alias' in valor)
              pendentesAlias.push({ variavel: v, modo: alvoModo, alvo: valor.alias });
            else
              v.setValueForMode(
                alvoModo,
                this.valorParaFigma({ ...pv, tipo: v.resolvedType ?? tipo }, valor),
              );
          }
        }
        this.vars.set(pv.nome, v);
      }
    }
    for (const p of pendentesAlias) {
      const alvo = this.vars.get(p.alvo);
      if (alvo) p.variavel.setValueForMode(p.modo, f.variables.createVariableAlias(alvo));
    }
  }

  private valorParaFigma(pv: PlanoVariavel, valor: FigmaValor): any {
    if ((pv.tipo === 'COLOR' || pv.tipo === 'EASING') && typeof valor === 'object') return valor;
    if (pv.tipo === 'FLOAT' || pv.tipo === 'TIMING') return Number(valor);
    if (pv.tipo === 'BOOLEAN') return valor === true || valor === 'true';
    return typeof valor === 'object' ? JSON.stringify(valor) : String(valor);
  }

  /* ------------------------------ Vínculos ------------------------------ */

  private variavel(prop: PlanoProp<unknown> | undefined): any | null {
    if (!prop?.variavel || this.plano.modo === 'visual') return null;
    return this.vars.get(prop.variavel) ?? null;
  }

  private vincular(
    no: No,
    campo: string,
    prop: PlanoProp<unknown> | undefined,
    onde: string,
  ): void {
    const v = this.variavel(prop);
    if (!v) return;
    try {
      no.setBoundVariable(campo, v);
      this.rel.vinculos++;
    } catch (e) {
      this.rel.vinculosFalhos.push(`${onde} › ${campo}: ${(e as Error).message}`);
    }
  }

  /** Campos de texto: tenta o nó inteiro e, se o Figma recusar, o intervalo do texto. */
  private vincularTexto(
    no: No,
    campo: string,
    prop: PlanoProp<unknown> | undefined,
    onde: string,
  ): void {
    const v = this.variavel(prop);
    if (!v) return;
    try {
      no.setBoundVariable(campo, v);
      this.rel.vinculos++;
    } catch {
      try {
        no.setRangeBoundVariable(0, no.characters.length, campo, v);
        this.rel.vinculos++;
      } catch (e) {
        this.rel.vinculosFalhos.push(`${onde} › ${campo}: ${(e as Error).message}`);
      }
    }
  }

  private pintura(p: PlanoPaint, onde: string): any {
    const f = this.figma;
    if (p.tipo === 'solido') {
      let paint: any = {
        type: 'SOLID',
        color: rgb(p.cor.valor),
        opacity: p.cor.valor.a,
        visible: true,
      };
      const v = this.variavel(p.cor);
      if (v) {
        try {
          paint = f.variables.setBoundVariableForPaint(paint, 'color', v);
          this.rel.vinculos++;
        } catch (e) {
          this.rel.vinculosFalhos.push(`${onde} › preenchimento: ${(e as Error).message}`);
        }
      }
      return paint;
    }
    return {
      type: p.subtipo ?? 'GRADIENT_LINEAR',
      gradientTransform: p.transformacao,
      visible: true,
      gradientStops: p.paradas.map((s) => {
        const v = this.variavel(s.cor);
        const stop: any = { position: s.posicao, color: s.cor.valor };
        if (v) {
          stop.boundVariables = { color: f.variables.createVariableAlias(v) };
          this.rel.vinculos++;
        }
        return stop;
      }),
    };
  }

  private efeitos(no: No, p: PlanoNo, onde: string): void {
    const f = this.figma;
    if (!p.efeitos.length) return;
    no.effects = p.efeitos.map((ef) => {
      let e: any;
      if (ef.tipo === 'DROP_SHADOW') {
        e = {
          type: 'DROP_SHADOW',
          color: ef.cor.valor,
          offset: { x: ef.x, y: ef.y },
          radius: Number(ef.raio.valor),
          spread: Number(ef.espalhar.valor),
          visible: true,
          blendMode: 'NORMAL',
          showShadowBehindNode: false,
        };
        for (const [campo, prop] of [
          ['radius', ef.raio],
          ['color', ef.cor],
          ['spread', ef.espalhar],
        ] as const) {
          const v = this.variavel(prop as PlanoProp<unknown>);
          if (!v) continue;
          try {
            e = f.variables.setBoundVariableForEffect(e, campo, v);
            this.rel.vinculos++;
          } catch (err) {
            this.rel.vinculosFalhos.push(`${onde} › sombra.${campo}: ${(err as Error).message}`);
          }
        }
      } else {
        e = { type: ef.tipo, blurType: 'NORMAL', radius: Number(ef.raio.valor), visible: true };
        const v = this.variavel(ef.raio);
        if (v) {
          try {
            e = f.variables.setBoundVariableForEffect(e, 'radius', v);
            this.rel.vinculos++;
          } catch (err) {
            this.rel.vinculosFalhos.push(`${onde} › desfoque: ${(err as Error).message}`);
          }
        }
      }
      return e;
    });
  }

  /* ------------------------------ Fontes ------------------------------ */

  private async carregarFontes(): Promise<void> {
    const fontes = new Map<string, { family: string; style: string }>();
    const visitar = (n: PlanoNo) => {
      if (n.texto)
        fontes.set(`${n.texto.familia}|${n.texto.estilo}`, {
          family: n.texto.familia,
          style: n.texto.estilo,
        });
      n.filhos.forEach(visitar);
    };
    this.plano.componentes.forEach((c) => c.variantes.forEach((v) => visitar(v.arvore)));
    fontes.set('Inter|Regular', this.fontePadrao);
    fontes.set('Inter|Bold', { family: 'Inter', style: 'Bold' });
    for (const [k, fonte] of fontes) {
      try {
        await this.figma.loadFontAsync(fonte);
        this.fontesOk.add(k);
      } catch {
        this.rel.avisos.push(
          `Fonte ${fonte.family} ${fonte.style} indisponível; usada Inter Regular.`,
        );
      }
    }
  }

  private fonte(familia: string, estilo: string) {
    return this.fontesOk.has(`${familia}|${estilo}`)
      ? { family: familia, style: estilo }
      : this.fontePadrao;
  }

  /* ------------------------------ Camadas ------------------------------ */

  /** Componentes das peças reutilizáveis já criados: "peça|variante" → componente. */
  private readonly pecas = new Map<string, No>();

  /** Aplica traço (cor/espessura vinculadas) aos vetores de um SVG importado. */
  private tracarVetores(
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
  private readonly principais = new Map<string, No>();

  /** Componentes da biblioteca de ícones (nome → componente). */
  private readonly icones = new Map<string, No>();

  /**
   * Biblioteca "KCX · Ícones": um componente por ícone ("KCX Ícone/<nome>"),
   * 24 × 24, traço de 2 px. Reaproveita a biblioteca que já estiver na página.
   */
  private construirIcones(x: number, y: number): No | null {
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
  private construirPecas(c: PlanoComponente, x: number, y: number): No | null {
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

  private construirNo(
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
      no.primaryAxisAlignItems = 'CENTER';
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
  private propriedades(principal: No, refsPorVariante: Refs[]): void {
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

  private construirComponente(c: PlanoComponente, x0: number, y0: number): No {
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

  /** Nós de cada variante (para ligar as interações do protótipo). */
  private nosPorVariante = new Map<string, { variante: No; nos: Map<string, No> }>();

  /** Interações do protótipo: clique/hover troca para outra variante (Smart Animate). */
  private async criarInteracoes(c: PlanoComponente): Promise<void> {
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

  /** Coleções criadas (nome → id e modos), para a ação de trocar modo. */
  private colecoesFigma = new Map<string, { id: string; modos: Record<string, string> }>();

  /** Ações extras de uma interação (trocar modo, alternar variável). */
  private acoesExtras(c: PlanoComponente, it: PlanoInteracao): unknown[] {
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
  private async construirPrototipo(c: PlanoComponente, principal: No, x: number, y: number) {
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
  private construirExemplo(c: PlanoComponente, principal: No, x: number, y: number): No {
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

  private texto(
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

  private construirDocumentacao(c: PlanoComponente, x: number, y: number): No {
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

  private construirComposicao(principais: Map<string, No>, x: number, y: number): void {
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

/* ============================== Figma → Lab ============================== */

const kebab = (s: string) =>
  s
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .toLowerCase();
const hex2 = (n: number) =>
  Math.round(Math.min(1, Math.max(0, n)) * 255)
    .toString(16)
    .padStart(2, '0');

/**
 * Lê os valores atuais das variáveis de um componente importado e monta o
 * arquivo de alterações (kcx-alteracoes) para o laboratório comparar.
 * Só volta o que tem caminho de volta: variáveis diretas, documentais e
 * paradas de gradiente. Derivadas (calculadas no lab) não voltam.
 */
export async function lerAlteracoes(
  figma: Figma,
  no: No,
): Promise<{ arquivo: object; ignoradas: string[] } | { erro: string }> {
  let alvo = no;
  while (alvo && !alvo.getSharedPluginData?.(CHAVE_PLUGIN, 'componente')) {
    alvo =
      alvo.type === 'INSTANCE' && alvo.getMainComponentAsync
        ? await alvo.getMainComponentAsync()
        : alvo.parent;
    if (alvo?.type === 'PAGE' || alvo?.type === 'DOCUMENT') alvo = null;
  }
  if (!alvo)
    return { erro: 'Selecione um componente importado pelo Figma Bridge (ou uma instância dele).' };
  const compId = alvo.getSharedPluginData(CHAVE_PLUGIN, 'componente');
  let pacote: any;
  try {
    pacote = JSON.parse(alvo.getSharedPluginData(CHAVE_PLUGIN, 'pacote'));
  } catch {
    return { erro: 'O componente não guarda o pacote KCX; importe de novo pelo Figma Bridge.' };
  }
  const comp = pacote.componentes.find((c: any) => c.id === compId);
  const locais = await variaveisLocais(figma);
  const colecoes = await figma.variables.getLocalVariableCollectionsAsync();
  const porNome = new Map(locais.map((v: any) => [v.name, v]));
  const ler = async (v: any) => {
    const col = colecoes.find((c: any) => c.id === v.variableCollectionId);
    let x = v.valuesByMode[col?.defaultModeId ?? Object.keys(v.valuesByMode)[0]];
    for (let i = 0; x && typeof x === 'object' && x.type === 'VARIABLE_ALIAS' && i < 5; i++) {
      const a = await figma.variables.getVariableByIdAsync(x.id);
      const ca = colecoes.find((c: any) => c.id === a?.variableCollectionId);
      x = a?.valuesByMode[ca?.defaultModeId ?? Object.keys(a?.valuesByMode ?? {})[0]];
    }
    return x;
  };
  const valores: Record<string, unknown> = {};
  const ignoradas: string[] = [];
  for (const kv of comp.variaveis) {
    const nome = `${compId}/${kebab(kv.id)}`;
    if (kv.tipo === 'gradient') {
      const paradas = [];
      for (let i = 1; porNome.has(`${nome}/stop-${i}`); i++) {
        const c = await ler(porNome.get(`${nome}/stop-${i}`));
        const orig = [...kv.valor.paradas].sort((a: any, b: any) => a.posicao - b.posicao)[i - 1];
        paradas.push({
          cor: `#${hex2(c.r)}${hex2(c.g)}${hex2(c.b)}${c.a < 1 ? hex2(c.a) : ''}`,
          posicao: orig?.posicao ?? i - 1,
        });
      }
      if (paradas.length >= 2) valores[kv.id] = { angulo: kv.valor.angulo, paradas };
      continue;
    }
    const v = porNome.get(nome);
    if (!v) {
      ignoradas.push(kv.id);
      continue;
    }
    const x = await ler(v);
    if (v.resolvedType === 'COLOR')
      valores[kv.id] = `#${hex2(x.r)}${hex2(x.g)}${hex2(x.b)}${x.a < 1 ? hex2(x.a) : ''}`;
    else if (v.resolvedType === 'FLOAT')
      valores[kv.id] = (v.scopes ?? []).includes('OPACITY') ? Math.round(x * 10) / 1000 : x;
    else if (v.resolvedType === 'TIMING')
      valores[kv.id] = kv.unidade === 'ms' ? Math.round(x * 1000) : x;
    else if (v.resolvedType === 'EASING') {
      const b = x?.easingFunctionCubicBezier;
      const op = (kv.opcoes ?? []).find((o: any) => {
        const e = easingFigma(
          kv.vinculos.flatMap((l: any) => l.transformar ?? []).find((o2: any) => o2.op === 'mapa')
            ?.valores?.[o.valor] ?? o.valor,
        );
        const c = e?.easingFunctionCubicBezier;
        return (
          c && b && ['x1', 'y1', 'x2', 'y2'].every((k) => Math.abs((c as any)[k] - b[k]) < 1e-3)
        );
      });
      if (op) valores[kv.id] = op.valor;
      else ignoradas.push(kv.id);
    } else valores[kv.id] = x;
  }
  return {
    arquivo: {
      formato: 'kcx-alteracoes',
      schemaVersion: pacote.schemaVersion,
      pacote: pacote.id,
      componente: compId,
      versao: comp.versao,
      exportadoEm: new Date().toISOString(),
      valores,
    },
    ignoradas,
  };
}

/** Gatilho do protótipo do Figma para uma interação KCX. */
export function gatilhoFigma(it: PlanoInteracao): Record<string, unknown> {
  switch (it.gatilho) {
    case 'hover':
      return { type: 'ON_HOVER' };
    case 'pressionar':
      return { type: 'ON_PRESS' };
    case 'entrar':
      return { type: 'MOUSE_ENTER', delay: 0 };
    case 'sair':
      return { type: 'MOUSE_LEAVE', delay: 0 };
    case 'atraso':
      return { type: 'AFTER_TIMEOUT', timeout: Math.max(0, (it.atraso ?? 1000) / 1000) };
    case 'arrastar':
      return { type: 'ON_DRAG' };
    case 'tecla':
      return { type: 'ON_KEY_DOWN', device: 'KEYBOARD', keyCodes: [codigoTecla(it.tecla)] };
    default:
      return { type: 'ON_CLICK' };
  }
}

/** Códigos de tecla (keyCode) que o Figma usa no gatilho Key/Gamepad. */
export function codigoTecla(tecla = 'Escape'): number {
  const mapa: Record<string, number> = {
    Escape: 27,
    Enter: 13,
    ' ': 32,
    Espaco: 32,
    ArrowLeft: 37,
    ArrowUp: 38,
    ArrowRight: 39,
    ArrowDown: 40,
    Tab: 9,
  };
  return mapa[tecla] ?? (tecla.length === 1 ? tecla.toUpperCase().charCodeAt(0) : 27);
}

/**
 * Transição do Figma (tipo, curva, direção e duração). Mover e empurrar só
 * valem para navegar e overlays: na troca de variante (Change to) o Figma
 * recusa, então viram Smart Animate (visto no Figma real).
 */
export function transicaoFigma(
  it: PlanoInteracao,
  trocaDeVariante = true,
): Record<string, unknown> | null {
  if (it.transicao === 'instantanea') return null;
  const easing =
    it.curva === 'linear'
      ? { type: 'LINEAR' }
      : it.curva === 'entrada-saida'
        ? { type: 'EASE_IN_AND_OUT' }
        : it.curva === 'mola'
          ? { type: 'GENTLE' }
          : it.curva === 'quique'
            ? { type: 'BOUNCY' }
            : { type: 'EASE_OUT' };
  const duration = it.duracao / 1000;
  if ((it.transicao === 'mover' || it.transicao === 'empurrar') && !trocaDeVariante) {
    const dir = { esquerda: 'LEFT', direita: 'RIGHT', cima: 'TOP', baixo: 'BOTTOM' }[
      it.direcao ?? 'esquerda'
    ];
    return {
      type: it.transicao === 'mover' ? 'MOVE_IN' : 'PUSH',
      direction: dir,
      matchLayers: false,
      easing,
      duration,
    };
  }
  return { type: it.transicao === 'dissolver' ? 'DISSOLVE' : 'SMART_ANIMATE', easing, duration };
}
