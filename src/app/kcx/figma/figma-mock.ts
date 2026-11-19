/**
 * API do Figma simulada para os testes do Figma Bridge.
 * Reproduz só o que o importador usa, registrando vínculos e pluginData,
 * e recusa vínculos em campos que o Figma não aceita (VariableBindableNodeField).
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

const CAMPOS_NO = new Set([
  'height',
  'width',
  'characters',
  'itemSpacing',
  'paddingLeft',
  'paddingRight',
  'paddingTop',
  'paddingBottom',
  'visible',
  'cornerRadius',
  'topLeftRadius',
  'topRightRadius',
  'bottomLeftRadius',
  'bottomRightRadius',
  'minWidth',
  'maxWidth',
  'minHeight',
  'maxHeight',
  'counterAxisSpacing',
  'strokeWeight',
  'opacity',
  'fontFamily',
  'fontSize',
  'fontStyle',
  'fontWeight',
  'letterSpacing',
  'lineHeight',
  'paragraphSpacing',
  'paragraphIndent',
]);

let seq = 0;
const novoId = () => `${++seq}:${seq}`;

export class NoMock {
  id = novoId();
  name = '';
  children: NoMock[] = [];
  parent: NoMock | null = null;
  width = 100;
  height = 100;
  x = 0;
  y = 0;
  boundVariables: Record<string, any> = {};
  pluginData: Record<string, string> = {};
  componentPropertyDefinitions: Record<string, any> = {};
  componentPropertyReferences: Record<string, string> | null = null;
  fills: any[] = [];
  strokes: any[] = [];
  effects: any[] = [];
  [k: string]: any;

  constructor(public type: string) {
    if (['FRAME', 'RECTANGLE', 'COMPONENT'].includes(type)) this['cornerRadius'] = 0;
    if (type === 'COMPONENT') this['key'] = `chave-${this.id}`;
  }

  appendChild(n: NoMock): void {
    if (n.parent) n.parent.children = n.parent.children.filter((c) => c !== n);
    n.parent = this;
    this.children.push(n);
  }
  resize(w: number, h: number): void {
    this.width = w;
    this.height = h;
  }
  resizeWithoutConstraints(w: number, h: number): void {
    this.resize(w, h);
  }
  setBoundVariable(campo: string, v: any): void {
    if (!CAMPOS_NO.has(campo)) throw new Error(`campo não vinculável: ${campo}`);
    if (campo === 'characters' && this.type !== 'TEXT') throw new Error('characters só em texto');
    this.boundVariables[campo] = { type: 'VARIABLE_ALIAS', id: v.id };
  }
  findAll(f: (n: NoMock) => boolean): NoMock[] {
    const out: NoMock[] = [];
    const visitar = (n: NoMock) => n.children.forEach((c) => (f(c) && out.push(c), visitar(c)));
    visitar(this);
    return out;
  }
  findAllWithCriteria(c: { types: string[] }): NoMock[] {
    return this.findAll((n) => c.types.includes(n.type));
  }
  setSharedPluginData(ns: string, k: string, v: string): void {
    this.pluginData[`${ns}:${k}`] = v;
  }
  getSharedPluginData(ns: string, k: string): string {
    return this.pluginData[`${ns}:${k}`] ?? '';
  }
  addComponentProperty(nome: string, tipo: string, padrao: any, opcoes?: any): string {
    if (this.type !== 'COMPONENT' && this.type !== 'COMPONENT_SET')
      throw new Error('só em componentes');
    const chave = `${nome}#${Object.keys(this.componentPropertyDefinitions).length + 1}:0`;
    if (tipo === 'INSTANCE_SWAP' && typeof padrao !== 'string')
      throw new Error('INSTANCE_SWAP precisa do id do componente');
    this.componentPropertyDefinitions[chave] = {
      type: tipo,
      defaultValue: padrao,
      ...(opcoes?.preferredValues ? { preferredValues: opcoes.preferredValues } : {}),
    };
    return chave;
  }
  setRangeBoundVariable(_i: number, _f: number, campo: string, v: any): void {
    this.boundVariables[campo] = { type: 'VARIABLE_ALIAS', id: v.id };
  }
  /** Exportação de vetores (Figma: exportAsync({ format: 'SVG_STRING' })). */
  async exportAsync(_op?: unknown): Promise<string> {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" onload="x()"><path d="M0 0L24 24"/><script>alert(1)</script></svg>';
  }
  /** Interações do protótipo (Figma: setReactionsAsync). */
  reactions: any[] = [];
  async setReactionsAsync(r: any[]): Promise<void> {
    const gatilhos = [
      'ON_CLICK',
      'ON_HOVER',
      'ON_PRESS',
      'MOUSE_ENTER',
      'MOUSE_LEAVE',
      'AFTER_TIMEOUT',
      'ON_KEY_DOWN',
      'ON_DRAG',
    ];
    const tipos = r.map((x) => x.trigger.type);
    if (tipos.includes('ON_CLICK') && tipos.includes('ON_HOVER'))
      throw new Error('On click e While hovering não podem estar no mesmo objeto');
    for (const x of r) {
      if (!gatilhos.includes(x.trigger.type))
        throw new Error(`gatilho inválido: ${x.trigger.type}`);
      if (tipos.filter((t) => t === x.trigger.type).length > 1 && x.trigger.type !== 'ON_KEY_DOWN')
        throw new Error(`gatilho repetido: ${x.trigger.type}`);
    }
    for (const x of r)
      for (const a of x.actions)
        if (
          a.navigation === 'CHANGE_TO' &&
          ['PUSH', 'MOVE_IN', 'MOVE_OUT', 'SLIDE_IN', 'SLIDE_OUT'].includes(a.transition?.type)
        )
          throw new Error('Reaction at index 0 was invalid');
    for (const x of r)
      for (const a of x.actions)
        if (a.type === 'NODE' && !a.destinationId) throw new Error('destinationId ausente');
    this.reactions = r;
  }
  remove(): void {
    if (this.parent) this.parent.children = this.parent.children.filter((c) => c !== this);
    this.parent = null;
  }
  /** Instância: cópia rasa dos filhos (para testar overrides). */
  createInstance(): NoMock {
    const i = new NoMock('INSTANCE');
    i.width = this.width;
    i.height = this.height;
    i['mainComponent'] = this;
    const copiar = (de: NoMock, para: NoMock) =>
      de.children.forEach((c) => {
        const n = new NoMock(c.type);
        Object.assign(n, {
          name: c.name,
          strokes: c.strokes,
          boundVariables: { ...c.boundVariables },
        });
        para.appendChild(n);
        copiar(c, n);
      });
    copiar(this, i);
    return i;
  }
  get defaultVariant(): NoMock {
    return this.children[0];
  }
}

export function criarFigmaMock() {
  const colecoes: any[] = [];
  const variaveis: any[] = [];
  const pagina = new NoMock('PAGE');
  const alias = (v: any) => ({ type: 'VARIABLE_ALIAS', id: v.id });
  const figma: any = {
    currentPage: pagina,
    viewport: { center: { x: 0, y: 0 }, scrollAndZoomIntoView: () => undefined },
    loadFontAsync: async (f: { family: string; style: string }) => {
      if (f.family === 'Roboto Mono') throw new Error('sem fonte');
    },
    createFrame: () => new NoMock('FRAME'),
    createRectangle: () => new NoMock('RECTANGLE'),
    createEllipse: () => new NoMock('ELLIPSE'),
    createText: () => new NoMock('TEXT'),
    createComponent: () => new NoMock('COMPONENT'),
    createNodeFromSvg: (svg: string) => {
      const f = new NoMock('FRAME');
      const v = new NoMock('VECTOR');
      v['svg'] = svg;
      f.appendChild(v);
      return f;
    },
    combineAsVariants: (nos: NoMock[], pai: NoMock) => {
      const set = new NoMock('COMPONENT_SET');
      nos.forEach((n) => set.appendChild(n));
      pai.appendChild(set);
      return set;
    },
    variables: {
      getLocalVariableCollectionsAsync: async () => [...colecoes],
      getLocalVariablesAsync: async () => [...variaveis],
      getVariableByIdAsync: async (id: string) => variaveis.find((v) => v.id === id) ?? null,
      createVariableCollection: (name: string) => {
        const modo = novoId();
        const c: any = {
          id: novoId(),
          name,
          defaultModeId: modo,
          modes: [{ modeId: modo, name: 'Mode 1' }],
          renameMode(id: string, n: string) {
            this.modes.find((m: any) => m.modeId === id).name = n;
          },
          addMode(n: string) {
            const id = novoId();
            this.modes.push({ modeId: id, name: n });
            return id;
          },
        };
        colecoes.push(c);
        return c;
      },
      createVariable: (name: string, col: any, resolvedType: string) => {
        let escopos = ['ALL_SCOPES'];
        const v: any = {
          id: novoId(),
          name,
          resolvedType,
          variableCollectionId: col.id,
          valuesByMode: {},
          description: '',
          get scopes() {
            return escopos;
          },
          set scopes(x: string[]) {
            if (!['COLOR', 'FLOAT', 'STRING'].includes(resolvedType))
              throw new Error('Cannot set scopes on this variable type');
            escopos = x;
          },
          codeSyntax: {} as Record<string, string>,
          pluginData: {} as Record<string, string>,
          setValueForMode(m: string, x: any) {
            this.valuesByMode[m] = x;
          },
          setVariableCodeSyntax(p: string, s: string) {
            this.codeSyntax[p] = s;
          },
          setSharedPluginData(ns: string, k: string, x: string) {
            this.pluginData[`${ns}:${k}`] = x;
          },
        };
        variaveis.push(v);
        return v;
      },
      createVariableAlias: alias,
      setBoundVariableForPaint: (p: any, campo: string, v: any) => {
        if (p.type !== 'SOLID' || campo !== 'color') throw new Error('só SOLID.color');
        return { ...p, boundVariables: { color: alias(v) } };
      },
      setBoundVariableForEffect: (e: any, campo: string, v: any) => {
        if (!['color', 'radius', 'spread', 'offsetX', 'offsetY'].includes(campo))
          throw new Error('campo de efeito inválido');
        return { ...e, boundVariables: { ...(e.boundVariables ?? {}), [campo]: alias(v) } };
      },
    },
  };
  return { figma, colecoes, variaveis, pagina };
}
