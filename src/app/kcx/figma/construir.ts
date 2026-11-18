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
  PlanoNo,
  PlanoPaint,
  PlanoProp,
  PlanoVariavel,
} from '../figma-plano';

type Figma = any;
type No = any;

export type ModoDuplicados = 'atualizar' | 'copia';

export interface RelatorioImportacao {
  colecoes: { nome: string; criada: boolean; modos: string[] }[];
  variaveisCriadas: string[];
  variaveisAtualizadas: string[];
  vinculos: number;
  vinculosFalhos: string[];
  componentes: { nome: string; id: string; variantes: number }[];
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
      const modoIds: Record<string, string> = {};
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
      this.rel.colecoes.push({ nome: c.nome, criada, modos: Object.keys(modoIds) });
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
        for (const [modo, valor] of Object.entries(pv.valores)) {
          const id = modoIds[modo] ?? Object.values(modoIds)[0];
          if (!id) continue;
          if (valor && typeof valor === 'object' && 'alias' in valor)
            pendentesAlias.push({ variavel: v, modo: id, alvo: valor.alias });
          else
            v.setValueForMode(
              id,
              this.valorParaFigma({ ...pv, tipo: v.resolvedType ?? tipo }, valor),
            );
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
      type: 'GRADIENT_LINEAR',
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

  private construirNo(
    p: PlanoNo,
    alvo: No | null,
    paiAutoLayout: boolean,
    onde: string,
    refsTexto: { no: No; prop: string; plano: PlanoNo }[],
  ): No {
    const f = this.figma;
    let no: No;
    const local = `${onde} › ${p.nome}`;
    if (p.tipo === 'svg') {
      no = f.createNodeFromSvg(p.svg ?? '<svg xmlns="http://www.w3.org/2000/svg"/>');
      no.fills = [];
      const vetores = no.findAll ? no.findAll((x: No) => x.type === 'VECTOR') : [];
      for (const vet of vetores) {
        if (p.svgTraco) {
          vet.strokes = [this.pintura({ tipo: 'solido', cor: p.svgTraco.cor }, local)];
          vet.strokeWeight = Number(p.svgTraco.espessura.valor);
          this.vincular(vet, 'strokeWeight', p.svgTraco.espessura, local);
          if (p.svgTraco.tracejado?.length) vet.dashPattern = p.svgTraco.tracejado;
          vet.strokeCap = 'ROUND';
        }
      }
    } else if (p.tipo === 'texto' && p.texto) {
      no = f.createText();
      no.fontName = this.fonte(p.texto.familia, p.texto.estilo);
      no.characters = String(p.texto.conteudo.valor);
      no.fontSize = Number(p.texto.tamanho.valor);
      if (p.texto.espacamento)
        no.letterSpacing = { value: Number(p.texto.espacamento.valor), unit: 'PIXELS' };
      if (p.texto.caixaAlta) no.textCase = 'UPPER';
      no.textAutoResize = 'WIDTH_AND_HEIGHT';
      // Texto com propriedade de componente: a propriedade (com padrão ligado à variável) controla o texto.
      if (!p.texto.propriedade) this.vincular(no, 'characters', p.texto.conteudo, local);
      this.vincularTexto(no, 'fontSize', p.texto.tamanho, local);
      if (p.texto.espacamento) this.vincularTexto(no, 'letterSpacing', p.texto.espacamento, local);
      if (p.texto.propriedade) refsTexto.push({ no, prop: p.texto.propriedade, plano: p });
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

    if (p.tipo === 'frame' && p.autoLayout) {
      no.layoutMode = p.autoLayout.direcao;
      no.primaryAxisAlignItems = 'CENTER';
      no.counterAxisAlignItems = 'CENTER';
      no.itemSpacing = Number(p.autoLayout.espaco.valor);
      no.paddingLeft = no.paddingRight = Number(p.autoLayout.paddingX.valor);
      no.paddingTop = no.paddingBottom = Number(p.autoLayout.paddingY.valor);
      this.vincular(no, 'itemSpacing', p.autoLayout.espaco, local);
      for (const lado of ['paddingLeft', 'paddingRight'])
        this.vincular(no, lado, p.autoLayout.paddingX, local);
      for (const lado of ['paddingTop', 'paddingBottom'])
        this.vincular(no, lado, p.autoLayout.paddingY, local);
      const fixo = p.largura !== undefined;
      no.primaryAxisSizingMode = fixo ? 'FIXED' : 'AUTO';
      no.counterAxisSizingMode = fixo ? 'FIXED' : 'AUTO';
    }
    if (p.largura && p.altura && p.tipo !== 'texto' && p.tipo !== 'svg') {
      no.resize(Math.max(0.01, Number(p.largura.valor)), Math.max(0.01, Number(p.altura.valor)));
      this.vincular(no, 'width', p.largura, local);
      this.vincular(no, 'height', p.altura, local);
    }
    if (!paiAutoLayout) {
      if (p.x !== undefined) no.x = p.x;
      if (p.y !== undefined) no.y = p.y;
    }
    if (p.rotacao) no.rotation = p.rotacao;
    if (p.opacidade) {
      no.opacity = Math.min(1, Math.max(0, Number(p.opacidade.valor)));
      this.vincular(no, 'opacity', p.opacidade, local);
    }
    if (p.visivel) {
      no.visible = p.visivel.valor !== false;
      this.vincular(no, 'visible', p.visivel, local);
    }
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
      no.strokes = [this.pintura({ tipo: 'solido', cor: p.traco.cor }, local)];
      no.strokeWeight = Number(p.traco.espessura.valor);
      no.strokeAlign = 'INSIDE';
      this.vincular(no, 'strokeWeight', p.traco.espessura, local);
    }
    this.efeitos(no, p, local);

    for (const filho of p.filhos) {
      const n = this.construirNo(filho, null, !!p.autoLayout, local, refsTexto);
      no.appendChild(n);
    }
    return no;
  }

  /* ------------------------------ Componentes ------------------------------ */

  private construirComponente(c: PlanoComponente, x0: number, y0: number): No {
    const f = this.figma;
    const variantes: No[] = [];
    const refsPorVariante: { no: No; prop: string; plano: PlanoNo }[][] = [];
    c.variantes.forEach((v) => {
      const comp = f.createComponent();
      const refs: { no: No; prop: string; plano: PlanoNo }[] = [];
      this.construirNo(v.arvore, comp, false, c.nome, refs);
      comp.name = c.variantes.length > 1 ? v.nome : c.nome;
      variantes.push(comp);
      refsPorVariante.push(refs);
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

    // Propriedades de texto editáveis (padrão ligado à variável de texto, quando houver).
    const nomesProps = new Set(refsPorVariante.flat().map((r) => r.prop));
    for (const nome of nomesProps) {
      const ref = refsPorVariante[0].find((r) => r.prop === nome);
      if (!ref?.plano.texto) continue;
      const v = this.variavel(ref.plano.texto.conteudo);
      let chave: string;
      try {
        chave = principal.addComponentProperty(
          nome,
          'TEXT',
          v ? f.variables.createVariableAlias(v) : String(ref.plano.texto.conteudo.valor),
        );
      } catch {
        chave = principal.addComponentProperty(
          nome,
          'TEXT',
          String(ref.plano.texto.conteudo.valor),
        );
        this.rel.avisos.push(
          `Propriedade "${nome}": o padrão não pôde ser ligado à variável; ficou com o texto atual.`,
        );
      }
      for (const refs of refsPorVariante) {
        for (const r of refs.filter((x) => x.prop === nome)) {
          try {
            r.no.componentPropertyReferences = { characters: chave };
          } catch (e) {
            this.rel.avisos.push(`Propriedade "${nome}": ${(e as Error).message}`);
          }
        }
      }
    }

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
        `Nível ${c.nivel} · ${c.nivel === 1 ? 'nativo editável' : c.nivel === 2 ? 'parcialmente editável' : 'pacote de desenvolvimento'} · pacote ${c.pacote}`,
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
    const principais = new Map<string, No>();
    const criados: No[] = [];
    for (const c of this.plano.componentes) {
      const p = this.construirComponente(c, x, y);
      principais.set(c.id, p);
      criados.push(p);
      if (this.plano.documentacao) criados.push(this.construirDocumentacao(c, x + p.width + 80, y));
      y += Math.max(p.height, 200) + 120;
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
