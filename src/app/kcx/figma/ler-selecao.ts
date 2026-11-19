/**
 * Figma → KCX: lê um frame/componente selecionado no Figma e gera um
 * componente KCX (estrutura, variáveis, HTML e CSS). Roda dentro do plugin
 * Figma Bridge; o arquivo .kcx.json resultante entra em "Meus componentes"
 * no KCX Studio, onde se escolhe a animação.
 *
 * O que vira variável: cores (sólidas e paradas de gradiente), textos,
 * arredondamentos e espaçamentos do Auto Layout. O resto vira CSS fixo.
 */
import { KcxComponente, KcxNo, KcxPreenchimento, KcxRef, KcxVariavel } from '../kcx.types';
import { LICENCA_MIT, EASINGS_KCX, MAPA_EASING, variavel } from '../componentes/_base';
import { corDeFigma } from '../unidades';

/* eslint-disable @typescript-eslint/no-explicit-any */
type No = any;
type Figma = any;

const kebab = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'componente';

const camel = (s: string) => {
  const k = kebab(s).replace(/-([a-z0-9])/g, (_, c: string) => c.toUpperCase());
  return /^[a-z]/.test(k) ? k : `v${k}`;
};

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Remove o que não pode rodar num SVG colado no HTML. */
export function limparSvg(svg: string): string {
  return svg
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*')/gi, '')
    .replace(/(href\s*=\s*["'])\s*javascript:[^"']*/gi, '$1#')
    .replace(/<\?xml[^>]*>/g, '')
    .trim();
}

const PESO: Record<string, number> = {
  thin: 100,
  extralight: 200,
  light: 300,
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  black: 900,
};
const peso = (estilo: string) => PESO[estilo.toLowerCase().replace(/[\s-]|italic/g, '')] ?? 400;

const ALINHA: Record<string, string> = {
  MIN: 'flex-start',
  CENTER: 'center',
  MAX: 'flex-end',
  SPACE_BETWEEN: 'space-between',
  BASELINE: 'baseline',
};

const ANIMACOES = [
  { valor: 'nenhuma', rotulo: 'Nenhuma' },
  { valor: 'entrada-subir', rotulo: 'Entrada: sobe' },
  { valor: 'entrada-fade', rotulo: 'Entrada: aparece' },
  { valor: 'entrada-zoom', rotulo: 'Entrada: zoom' },
  { valor: 'entrada-desfoque', rotulo: 'Entrada: sai do desfoque' },
  { valor: 'hover-elevar', rotulo: 'Hover: sobe com sombra' },
  { valor: 'hover-brilho', rotulo: 'Hover: brilho' },
  { valor: 'hover-crescer', rotulo: 'Hover: cresce' },
  { valor: 'pulsar', rotulo: 'Contínua: pulsa' },
  { valor: 'flutuar', rotulo: 'Contínua: flutua' },
];

export interface OpcoesLeitura {
  /** Id desejado (kebab-case); por padrão vem do nome da camada. */
  id?: string;
  agora?: Date;
}

/** Lê a seleção e devolve o componente KCX (async: SVG e nomes de variáveis do Figma). */
export async function lerSelecao(
  figma: Figma,
  selecionado: No,
  op: OpcoesLeitura = {},
): Promise<KcxComponente> {
  let raiz = selecionado;
  const avisos: string[] = [];
  if (raiz.type === 'COMPONENT_SET') {
    avisos.push(
      `“${raiz.name}” tem ${raiz.children.length} variantes; foi importada a variante padrão.`,
    );
    raiz = raiz.defaultVariant ?? raiz.children[0];
  }
  // Variante selecionada: o nome vem do conjunto ("Menu — Aberto"), não de "Estado=Aberto".
  const pai = selecionado.parent;
  const nome =
    pai?.type === 'COMPONENT_SET'
      ? `${pai.name} — ${String(selecionado.name)
          .split(',')
          .map((p: string) => p.split('=').pop()!.trim())
          .join(' ')}`
      : String(selecionado.name || 'Componente do Figma');
  const id = op.id ?? kebab(nome);
  const P = `--kcx-${id}`;
  const C = `kcx-${id}`;
  const vars: KcxVariavel[] = [];
  const porCor = new Map<string, string>();
  const porRaio = new Map<number, string>();
  const porEspaco = new Map<number, string>();
  const nomesVar = new Map<string, string>();
  const ids = new Set<string>();
  let contador = 0;
  const css: string[] = [];

  const idUnico = (base: string) => {
    let x = base;
    let n = 2;
    while (ids.has(x)) x = `${base}${n++}`;
    ids.add(x);
    return x;
  };

  /** Nome da variável do Figma ligada a um campo (se houver). */
  const nomeLigado = async (alias: any): Promise<string | undefined> => {
    if (!alias?.id || !figma?.variables?.getVariableByIdAsync) return undefined;
    if (nomesVar.has(alias.id)) return nomesVar.get(alias.id);
    try {
      const v = await figma.variables.getVariableByIdAsync(alias.id);
      const n = v?.name ? String(v.name).split('/').pop() : undefined;
      if (n) nomesVar.set(alias.id, n);
      return n;
    } catch {
      return undefined;
    }
  };

  const corVar = async (
    cor: { r: number; g: number; b: number; a?: number },
    opacidade = 1,
    alias?: any,
  ): Promise<string> => {
    const hex = corDeFigma({ r: cor.r, g: cor.g, b: cor.b, a: (cor.a ?? 1) * opacidade });
    const existente = porCor.get(hex);
    if (existente) return existente;
    const ligado = await nomeLigado(alias);
    const vid = idUnico(
      ligado ? camel(/^cor\b/i.test(ligado) ? ligado : `cor ${ligado}`) : `cor${porCor.size + 1}`,
    );
    porCor.set(hex, vid);
    vars.push(
      variavel({
        id: vid,
        nome: ligado ? (/^cor\b/i.test(ligado) ? ligado : `Cor ${ligado}`) : `Cor ${porCor.size}`,
        tipo: 'color',
        padrao: hex,
        descricao: ligado ? `Vinda da variável “${ligado}” do Figma.` : 'Cor lida do Figma.',
        grupo: 'colors',
        secao: 'aparencia',
        vinculos: [{ propriedade: 'cor', alvo: { tipo: 'css-var', nome: `${P}-${kebab(vid)}` } }],
      }),
    );
    return vid;
  };

  const dimVar = (
    mapa: Map<number, string>,
    valor: number,
    prefixo: 'raio' | 'espaco',
    rotulo: string,
  ): string => {
    const r = Math.round(valor * 100) / 100;
    const existente = mapa.get(r);
    if (existente) return existente;
    const vid = idUnico(`${prefixo}${mapa.size + 1}`);
    mapa.set(r, vid);
    vars.push(
      variavel({
        id: vid,
        nome: `${rotulo} ${mapa.size}`,
        tipo: 'dimension',
        padrao: r,
        min: 0,
        max: Math.max(64, Math.ceil(r * 3)),
        passo: 1,
        unidade: 'px',
        descricao: `${rotulo} lido do Figma (${r} px).`,
        grupo: prefixo === 'raio' ? 'dimensions' : 'spacing',
        secao: 'aparencia',
        vinculos: [
          {
            propriedade: rotulo.toLowerCase(),
            alvo: { tipo: 'css-var', nome: `${P}-${kebab(vid)}` },
            unidadeSaida: 'px',
          },
        ],
      }),
    );
    return vid;
  };
  const v = (vid: string) => `var(${P}-${kebab(vid)})`;

  /** Preenchimentos → CSS background + KCX. */
  const pinturas = async (no: No): Promise<{ css: string[]; kcx: KcxPreenchimento[] }> => {
    const saida = { css: [] as string[], kcx: [] as KcxPreenchimento[] };
    const fills = Array.isArray(no.fills) ? no.fills.filter((f: any) => f.visible !== false) : [];
    for (const f of [...fills].reverse()) {
      if (f.type === 'SOLID') {
        const vid = await corVar(f.color, f.opacity ?? 1, f.boundVariables?.color);
        saida.css.push(v(vid));
        saida.kcx.unshift({ tipo: 'solido', cor: { $var: vid } });
      } else if (
        f.type === 'GRADIENT_LINEAR' ||
        f.type === 'GRADIENT_RADIAL' ||
        f.type === 'GRADIENT_ANGULAR'
      ) {
        const paradas = [];
        for (const s of f.gradientStops ?? [])
          paradas.push({
            posicao: s.position,
            cor: {
              $var: await corVar(s.color, f.opacity ?? 1, s.boundVariables?.color),
            } as KcxRef<string>,
          });
        const m = f.gradientTransform ?? [
          [1, 0, 0],
          [0, 1, 0],
        ];
        const angulo = Math.round((Math.atan2(m[0][1], m[0][0]) * 180) / Math.PI + 90);
        const lista = paradas
          .map((p) => `${v((p.cor as { $var: string }).$var)} ${Math.round(p.posicao * 100)}%`)
          .join(', ');
        saida.css.push(
          f.type === 'GRADIENT_RADIAL'
            ? `radial-gradient(circle, ${lista})`
            : f.type === 'GRADIENT_ANGULAR'
              ? `conic-gradient(from ${angulo}deg, ${lista})`
              : `linear-gradient(${angulo}deg, ${lista})`,
        );
        saida.kcx.unshift({
          tipo: f.type === 'GRADIENT_ANGULAR' ? 'gradiente-conico' : 'gradiente-linear',
          angulo,
          paradas,
        });
      } else if (f.type === 'IMAGE') {
        avisos.push(
          `“${no.name}”: imagem do Figma não é exportada; ficou um fundo neutro (troque no código).`,
        );
        saida.css.push('linear-gradient(135deg, #3a3357, #1a1530)');
      }
    }
    return saida;
  };

  const sombras = async (no: No): Promise<{ css: string[]; filtro: string[]; fundo: string[] }> => {
    const r = { css: [] as string[], filtro: [] as string[], fundo: [] as string[] };
    for (const e of Array.isArray(no.effects) ? no.effects : []) {
      if (e.visible === false) continue;
      if (e.type === 'DROP_SHADOW' || e.type === 'INNER_SHADOW') {
        const vid = await corVar(e.color, 1, e.boundVariables?.color);
        r.css.push(
          `${e.type === 'INNER_SHADOW' ? 'inset ' : ''}${e.offset?.x ?? 0}px ${e.offset?.y ?? 0}px ${e.radius ?? 0}px ${e.spread ?? 0}px ${v(vid)}`,
        );
      } else if (e.type === 'LAYER_BLUR') r.filtro.push(`blur(${e.radius}px)`);
      else if (e.type === 'BACKGROUND_BLUR') r.fundo.push(`blur(${e.radius}px)`);
    }
    return r;
  };

  /** Converte um nó; devolve HTML e o nó KCX. */
  const converter = async (
    no: No,
    paiAutoLayout: string | null,
    primeiro: boolean,
  ): Promise<{ html: string; kcx: KcxNo } | null> => {
    if (no.visible === false) return null;
    const n = ++contador;
    const cls = primeiro ? C : `${C}__n${n}`;
    const nid = idUnico(primeiro ? 'raiz' : `n${n}-${kebab(no.name).slice(0, 20)}`);
    const regras: string[] = [];
    const kcx: KcxNo = { id: nid, nome: String(no.name || `Camada ${n}`), tipo: 'frame' };
    const ehTexto = no.type === 'TEXT';
    const ehVetor = ['VECTOR', 'BOOLEAN_OPERATION', 'STAR', 'POLYGON', 'LINE'].includes(no.type);
    const al = no.layoutMode && no.layoutMode !== 'NONE' ? no.layoutMode : null;

    // Posição e tamanho
    if (paiAutoLayout === null && !primeiro)
      regras.push(
        'position: absolute',
        `left: ${Math.round(no.x)}px`,
        `top: ${Math.round(no.y)}px`,
      );
    if (paiAutoLayout !== null && no.layoutPositioning === 'ABSOLUTE')
      regras.push(
        'position: absolute',
        `left: ${Math.round(no.x)}px`,
        `top: ${Math.round(no.y)}px`,
      );
    const sh = no.layoutSizingHorizontal ?? 'FIXED';
    const sv = no.layoutSizingVertical ?? 'FIXED';
    if (!ehTexto || no.textAutoResize === 'NONE' || no.textAutoResize === 'HEIGHT') {
      if (sh === 'FILL')
        regras.push(paiAutoLayout === 'HORIZONTAL' ? 'flex: 1 1 0' : 'align-self: stretch');
      else if (sh === 'FIXED' || !al) regras.push(`width: ${Math.round(no.width)}px`);
    }
    if (!ehTexto || no.textAutoResize === 'NONE') {
      if (sv === 'FILL')
        regras.push(paiAutoLayout === 'VERTICAL' ? 'flex: 1 1 0' : 'align-self: stretch');
      else if (sv === 'FIXED' || !al) regras.push(`height: ${Math.round(no.height)}px`);
    }
    if (primeiro) regras.push('max-width: 100%');
    if (typeof no.opacity === 'number' && no.opacity < 1) {
      regras.push(`opacity: ${Math.round(no.opacity * 100) / 100}`);
      kcx.opacidade = Math.round(no.opacity * 100) / 100;
    }
    if (no.rotation) regras.push(`rotate: ${-Math.round(no.rotation)}deg`);
    if (!ehTexto) {
      kcx.largura = Math.round(no.width);
      kcx.altura = Math.round(no.height);
    }
    if (paiAutoLayout === null && !primeiro) {
      kcx.x = Math.round(no.x);
      kcx.y = Math.round(no.y);
    }

    // Vetor: SVG exportado do Figma
    if (ehVetor) {
      let svg = '';
      try {
        svg = limparSvg(String(await no.exportAsync({ format: 'SVG_STRING' })));
      } catch {
        avisos.push(`“${no.name}”: vetor não exportado.`);
      }
      css.push(`.${cls} { ${regras.join('; ')}; display: block; }`);
      kcx.tipo = 'svg';
      kcx.svg = svg || '<svg xmlns="http://www.w3.org/2000/svg"/>';
      delete kcx.largura;
      delete kcx.altura;
      return { html: svg.replace('<svg', `<svg class="${cls}" aria-hidden="true"`), kcx };
    }

    // Texto
    if (ehTexto) {
      const tid = idUnico(camel(`texto ${no.name}`));
      const conteudo = String(no.characters ?? '');
      vars.push(
        variavel({
          id: tid,
          nome: `Texto: ${no.name}`,
          tipo: 'string',
          padrao: conteudo,
          descricao: 'Texto lido do Figma.',
          grupo: 'components',
          secao: 'aparencia',
          vinculos: [{ propriedade: 'Texto', alvo: { tipo: 'texto', seletor: `.${cls}` } }],
        }),
      );
      const fonte =
        no.fontName && typeof no.fontName === 'object'
          ? no.fontName
          : { family: 'Inter', style: 'Regular' };
      const tamanho = typeof no.fontSize === 'number' ? no.fontSize : 16;
      const p = await pinturas(no);
      regras.push(
        `font-family: '${String(fonte.family).replace(/'/g, '')}', Inter, system-ui, sans-serif`,
        `font-size: ${tamanho}px`,
        `font-weight: ${peso(String(fonte.style))}`,
        'margin: 0',
      );
      if (/italic/i.test(String(fonte.style))) regras.push('font-style: italic');
      if (p.css.length)
        regras.push(
          p.css[0].includes('gradient')
            ? `background: ${p.css[0]}; -webkit-background-clip: text; background-clip: text; color: transparent`
            : `color: ${p.css[0]}`,
        );
      if (no.letterSpacing && typeof no.letterSpacing === 'object' && no.letterSpacing.value)
        regras.push(
          `letter-spacing: ${no.letterSpacing.unit === 'PERCENT' ? `${no.letterSpacing.value / 100}em` : `${no.letterSpacing.value}px`}`,
        );
      if (no.lineHeight && typeof no.lineHeight === 'object' && no.lineHeight.unit !== 'AUTO')
        regras.push(
          `line-height: ${no.lineHeight.unit === 'PERCENT' ? no.lineHeight.value / 100 : `${no.lineHeight.value}px`}`,
        );
      if (no.textAlignHorizontal && no.textAlignHorizontal !== 'LEFT')
        regras.push(
          `text-align: ${String(no.textAlignHorizontal).toLowerCase().replace('justified', 'justify')}`,
        );
      if (no.textCase === 'UPPER') regras.push('text-transform: uppercase');
      if (no.textCase === 'LOWER') regras.push('text-transform: lowercase');
      css.push(`.${cls} { ${regras.join('; ')}; }`);
      kcx.tipo = 'texto';
      kcx.preenchimentos = p.kcx.length ? [p.kcx[0]] : [{ tipo: 'solido', cor: '#000000' }];
      kcx.texto = {
        conteudo: { $var: tid },
        tamanho,
        familia: String(fonte.family),
        estilo: String(fonte.style),
        alinhamento:
          no.textAlignHorizontal === 'CENTER'
            ? 'centro'
            : no.textAlignHorizontal === 'RIGHT'
              ? 'direita'
              : undefined,
        caixaAlta: no.textCase === 'UPPER' || undefined,
        preencher: sh === 'FILL' || undefined,
        propriedade: String(no.name),
      };
      if (sh === 'FILL') kcx.encher = true;
      return { html: `<p class="${cls}">${esc(conteudo)}</p>`, kcx };
    }

    // Frame, grupo, retângulo, elipse, instância
    if (no.type === 'ELLIPSE') {
      kcx.tipo = 'elipse';
      regras.push('border-radius: 50%');
    } else if (no.type === 'RECTANGLE') kcx.tipo = 'retangulo';
    const p = await pinturas(no);
    if (p.css.length) regras.push(`background: ${p.css.join(', ')}`);
    kcx.preenchimentos = p.kcx;
    if (no.type !== 'ELLIPSE' && typeof no.cornerRadius === 'number' && no.cornerRadius > 0) {
      const rid = dimVar(porRaio, no.cornerRadius, 'raio', 'Arredondamento');
      regras.push(`border-radius: ${v(rid)}`);
      kcx.raio = { $var: rid };
    } else if (
      no.type !== 'ELLIPSE' &&
      [no.topLeftRadius, no.topRightRadius, no.bottomRightRadius, no.bottomLeftRadius].some(
        (x) => x > 0,
      )
    ) {
      regras.push(
        `border-radius: ${[no.topLeftRadius, no.topRightRadius, no.bottomRightRadius, no.bottomLeftRadius].map((x) => `${x ?? 0}px`).join(' ')}`,
      );
    }
    const tracos = Array.isArray(no.strokes)
      ? no.strokes.filter((s: any) => s.visible !== false && s.type === 'SOLID')
      : [];
    if (tracos.length && no.strokeWeight > 0) {
      const vid = await corVar(
        tracos[0].color,
        tracos[0].opacity ?? 1,
        tracos[0].boundVariables?.color,
      );
      regras.push(
        no.strokeAlign === 'OUTSIDE'
          ? `outline: ${no.strokeWeight}px solid ${v(vid)}`
          : `box-shadow: inset 0 0 0 ${no.strokeWeight}px ${v(vid)}`,
      );
      kcx.traco = { cor: { $var: vid }, espessura: no.strokeWeight };
    }
    const s = await sombras(no);
    const insetBorda = regras.find((r) => r.startsWith('box-shadow: inset'));
    if (s.css.length) {
      if (insetBorda) regras.splice(regras.indexOf(insetBorda), 1);
      regras.push(
        `box-shadow: ${[insetBorda?.replace('box-shadow: ', ''), ...s.css].filter(Boolean).join(', ')}`,
      );
    }
    if (s.filtro.length) regras.push(`filter: ${s.filtro.join(' ')}`);
    if (s.fundo.length) regras.push(`backdrop-filter: ${s.fundo.join(' ')}`);
    if (no.clipsContent) {
      regras.push('overflow: hidden');
      kcx.recortar = true;
    }
    if (al) {
      const gap = no.itemSpacing ?? 0;
      const gid = gap > 0 ? dimVar(porEspaco, gap, 'espaco', 'Espaçamento') : null;
      const px = no.paddingLeft ?? 0;
      const py = no.paddingTop ?? 0;
      const pxid = px > 0 ? dimVar(porEspaco, px, 'espaco', 'Espaçamento') : null;
      const pyid = py > 0 ? dimVar(porEspaco, py, 'espaco', 'Espaçamento') : null;
      regras.push(
        'display: flex',
        `flex-direction: ${al === 'HORIZONTAL' ? 'row' : 'column'}`,
        `justify-content: ${ALINHA[no.primaryAxisAlignItems] ?? 'flex-start'}`,
        `align-items: ${ALINHA[no.counterAxisAlignItems] ?? 'flex-start'}`,
        `gap: ${gid ? v(gid) : '0'}`,
        `padding: ${pyid ? v(pyid) : '0'} ${no.paddingRight === px ? (pxid ? v(pxid) : '0') : `${no.paddingRight ?? 0}px`} ${no.paddingBottom === py ? (pyid ? v(pyid) : '0') : `${no.paddingBottom ?? 0}px`} ${pxid ? v(pxid) : '0'}`,
      );
      if (no.layoutWrap === 'WRAP') regras.push('flex-wrap: wrap');
      kcx.autoLayout = {
        direcao: al === 'HORIZONTAL' ? 'horizontal' : 'vertical',
        espaco: gid ? { $var: gid } : 0,
        paddingX: pxid ? { $var: pxid } : 0,
        paddingY: pyid ? { $var: pyid } : 0,
      };
      if (sh !== 'FIXED') delete kcx.largura;
      if (sv !== 'FIXED') delete kcx.altura;
    } else if (Array.isArray(no.children) && no.children.length) regras.push('position: relative');
    if (sh === 'FILL') kcx.encher = true;
    css.push(`.${cls} { ${regras.join('; ')}; }`);

    const filhos: string[] = [];
    kcx.filhos = [];
    let i = 0;
    for (const f of Array.isArray(no.children) ? no.children : []) {
      const r = await converter(f, al, false);
      if (!r) continue;
      filhos.push(primeiro ? r.html.replace(/^<(\w+)/, `<$1 style="--i:${i++}"`) : r.html);
      kcx.filhos.push(r.kcx);
    }
    if (!kcx.filhos.length) delete kcx.filhos;
    const html = filhos.length
      ? `<div class="${cls}">\n${filhos.map((h) => '  ' + h).join('\n')}\n</div>`
      : `<div class="${cls}"></div>`;
    return { html, kcx };
  };

  const r = await converter(raiz, null, true);
  if (!r) throw new Error('A camada selecionada está oculta.');

  // Animação escolhida no KCX Studio (atributo na raiz)
  const destaque = porCor.values().next().value as string | undefined;
  const corDestaque = destaque ? v(destaque) : 'rgb(255 255 255 / .6)';
  vars.push(
    variavel({
      id: 'animacao',
      nome: 'Animação',
      tipo: 'enum',
      padrao: 'entrada-subir',
      opcoes: ANIMACOES,
      descricao: 'Escolha a animação do componente: entrada, hover ou contínua.',
      grupo: 'motion',
      secao: 'animacao',
      vinculos: [
        {
          propriedade: 'data-animacao na raiz',
          alvo: { tipo: 'atributo', seletor: `.${C}`, atributo: 'data-animacao' },
        },
      ],
    }),
    variavel({
      id: 'emSequencia',
      nome: 'Elementos em sequência',
      tipo: 'boolean',
      padrao: false,
      descricao: 'Na entrada, cada elemento de dentro aparece um depois do outro.',
      grupo: 'motion',
      secao: 'animacao',
      vinculos: [
        {
          propriedade: 'data-sequencia na raiz',
          alvo: { tipo: 'atributo', seletor: `.${C}`, atributo: 'data-sequencia' },
          transformar: [{ op: 'mapa', valores: { true: 'true', false: 'false' } }],
        },
      ],
    }),
    variavel({
      id: 'duracao',
      nome: 'Duração',
      tipo: 'time',
      padrao: 500,
      min: 100,
      max: 3000,
      passo: 50,
      unidade: 'ms',
      descricao: 'Tempo da animação.',
      grupo: 'motion',
      secao: 'animacao',
      vinculos: [
        {
          propriedade: 'animation/transition-duration',
          alvo: { tipo: 'css-var', nome: `${P}-duracao` },
          unidadeSaida: 'ms',
        },
      ],
    }),
    variavel({
      id: 'easing',
      nome: 'Curva',
      tipo: 'enum',
      padrao: 'suave',
      opcoes: EASINGS_KCX,
      descricao: 'Aceleração do movimento.',
      grupo: 'motion',
      secao: 'animacao',
      vinculos: [
        {
          propriedade: 'timing-function',
          alvo: { tipo: 'css-var', nome: `${P}-easing` },
          transformar: [{ op: 'mapa', valores: MAPA_EASING }],
        },
      ],
    }),
  );
  const D = `var(${P}-duracao)`;
  const E = `var(${P}-easing)`;
  const entrada = (nomeAnim: string) =>
    `.${C}[data-animacao="entrada-${nomeAnim}"]:not([data-sequencia="true"]), .${C}[data-animacao="entrada-${nomeAnim}"][data-sequencia="true"] > * { animation: ${C}-${nomeAnim} ${D} ${E} both; }`;
  const cssAnim = `
/* Animações (escolha na variável "Animação" do KCX Studio) */
.${C} { transition: transform ${D} ${E}, box-shadow ${D} ${E}, filter ${D} ${E}; }
${entrada('subir')}
${entrada('fade')}
${entrada('zoom')}
${entrada('desfoque')}
.${C}[data-sequencia="true"] > * { animation-delay: calc(var(--i, 0) * ${D} * .25) !important; }
@keyframes ${C}-subir { from { opacity: 0; transform: translateY(24px); } }
@keyframes ${C}-fade { from { opacity: 0; } }
@keyframes ${C}-zoom { from { opacity: 0; transform: scale(.85); } }
@keyframes ${C}-desfoque { from { opacity: 0; filter: blur(12px); } }
.${C}[data-animacao="hover-elevar"]:hover { transform: translateY(-6px); box-shadow: 0 16px 32px color-mix(in srgb, ${corDestaque} 45%, transparent); }
.${C}[data-animacao="hover-brilho"]:hover { box-shadow: 0 0 28px color-mix(in srgb, ${corDestaque} 70%, transparent); filter: brightness(1.08); }
.${C}[data-animacao="hover-crescer"]:hover { transform: scale(1.04); }
.${C}[data-animacao="pulsar"] { animation: ${C}-pulsar calc(${D} * 4) ease-in-out infinite; }
.${C}[data-animacao="flutuar"] { animation: ${C}-flutuar calc(${D} * 6) ease-in-out infinite; }
@keyframes ${C}-pulsar { 50% { transform: scale(1.04); } }
@keyframes ${C}-flutuar { 50% { transform: translateY(-8px); } }
@media (prefers-reduced-motion: reduce) { .${C}, .${C} * { animation: none !important; transition-duration: 1ms !important; } }`;

  const hoje = (op.agora ?? new Date()).toISOString().slice(0, 10);
  const html = r.html.replace(
    `class="${C}"`,
    `class="${C}" data-animacao="entrada-subir" data-sequencia="false"`,
  );
  return {
    id,
    nome,
    categoria: 'figma',
    descricao: `Importado do Figma (“${nome}”).${avisos.length ? ' ' + avisos.join(' ') : ''}`,
    tecnologia: ['HTML', 'CSS', 'SVG', 'Angular'],
    versao: '1.0.0',
    licenca: LICENCA_MIT,
    metadados: {
      autor: 'Importado do Figma pelo Figma Bridge',
      tags: ['figma', 'importado'],
      criadoEm: hoje,
      atualizadoEm: hoje,
      largura: Math.round(raiz.width ?? 320),
      altura: Math.round(raiz.height ?? 200),
    },
    variaveis: vars,
    codigo: {
      html,
      css: `/* ${nome} — importado do Figma pelo Kalixto Creative Lab (KCX) */\n.${C}, .${C} * { box-sizing: border-box; }\n${css.join('\n')}\n${cssAnim}`,
      js: '// Sem JavaScript: as animações são CSS.',
    },
    estados: [
      {
        id: 'padrao',
        nome: 'Padrão',
        gatilho: 'padrao',
        descricao: 'Como estava no Figma.',
        valores: {},
      },
    ],
    presets: [
      {
        id: 'entrada',
        nome: 'Entrada em sequência',
        valores: { animacao: 'entrada-subir', emSequencia: true },
      },
      { id: 'hover', nome: 'Hover com sombra', valores: { animacao: 'hover-elevar' } },
      { id: 'flutuar', nome: 'Flutuando', valores: { animacao: 'flutuar', duracao: 800 } },
    ],
    dependencias: [],
    estrutura: r.kcx,
    animacoes: [
      {
        id: 'animacao',
        nome: 'Animação escolhida no Studio',
        tecnica: 'css-keyframes',
        variaveis: ['animacao', 'emSequencia', 'duracao', 'easing'],
        figma: 'documental',
        nivel: 2,
        descricao:
          'Entradas, hover e animações contínuas em CSS, escolhidas pela variável “Animação”.',
      },
    ],
    compatibilidade: {
      navegadores: 'Chrome, Edge, Firefox e Safari atuais.',
      reducedMotion: true,
      figma: {
        nivel: 2,
        editavel: [
          'Estrutura, cores, textos, arredondamentos e espaçamentos do desenho original',
          'Ao reexportar para o Figma, tudo volta ligado a variáveis',
        ],
        parcial: avisos,
        naoSuportado: ['A animação escolhida no Studio (fica no código)'],
        limitacoes: [
          'Imagens do Figma não são exportadas pelo plugin; troque no código ou no Figma.',
          'Só a variante padrão de um conjunto de variantes é importada.',
        ],
      },
    },
    origemCriacao: { tipo: 'figma' },
  };
}
