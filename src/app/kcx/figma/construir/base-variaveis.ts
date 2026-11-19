/** Camada 1 do importador: coleções, variáveis, vínculos, pinturas, efeitos e fontes. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  FigmaValor,
  PlanoFigma,
  PlanoNo,
  PlanoPaint,
  PlanoProp,
  PlanoVariavel,
} from '../../figma-plano';
import {
  Figma,
  No,
  ModoDuplicados,
  RelatorioImportacao,
  CHAVE_PLUGIN,
  rgb,
  variaveisLocais,
} from './tipos';

export abstract class BaseVariaveis {
  /** Coleções criadas (nome → id e modos), para a ação de trocar modo. */
  protected colecoesFigma = new Map<string, { id: string; modos: Record<string, string> }>();

  protected readonly vars = new Map<string, any>();
  protected readonly rel: RelatorioImportacao = {
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
  protected fontePadrao = { family: 'Inter', style: 'Regular' };
  protected fontesOk = new Set<string>();

  constructor(
    protected readonly figma: Figma,
    protected readonly plano: PlanoFigma,
    protected readonly pacoteJson: string,
    protected readonly duplicados: ModoDuplicados,
  ) {}

  /* ------------------------------ Variáveis ------------------------------ */

  protected async criarVariaveis(): Promise<void> {
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

  protected valorParaFigma(pv: PlanoVariavel, valor: FigmaValor): any {
    if ((pv.tipo === 'COLOR' || pv.tipo === 'EASING') && typeof valor === 'object') return valor;
    if (pv.tipo === 'FLOAT' || pv.tipo === 'TIMING') return Number(valor);
    if (pv.tipo === 'BOOLEAN') return valor === true || valor === 'true';
    return typeof valor === 'object' ? JSON.stringify(valor) : String(valor);
  }

  /* ------------------------------ Vínculos ------------------------------ */

  protected variavel(prop: PlanoProp<unknown> | undefined): any | null {
    if (!prop?.variavel || this.plano.modo === 'visual') return null;
    return this.vars.get(prop.variavel) ?? null;
  }

  protected vincular(
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
  protected vincularTexto(
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

  protected pintura(p: PlanoPaint, onde: string): any {
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

  protected efeitos(no: No, p: PlanoNo, onde: string): void {
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

  protected async carregarFontes(): Promise<void> {
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

  protected fonte(familia: string, estilo: string) {
    return this.fontesOk.has(`${familia}|${estilo}`)
      ? { family: familia, style: estilo }
      : this.fontePadrao;
  }
}
