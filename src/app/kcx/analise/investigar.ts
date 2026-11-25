/**
 * Investigação de sites: lê a coleta (do coletor no navegador da pessoa ou de
 * um HTML salvo) e separa tecnologias CONFIRMADAS, PROVÁVEIS e NÃO
 * IDENTIFICADAS, sempre com a evidência. Também gera fichas de efeito a
 * partir do que o CSS e as animações mostram.
 *
 * Regras de honestidade:
 * - "confirmada" só com prova direta: global da biblioteca em window, script da
 *   biblioteca carregado, elemento/classe que só a biblioteca cria, ou CSS lido;
 * - um HTML salvo não roda JavaScript: globais e animações ficam sem verificar;
 * - nada aqui vem de vídeo.
 */
import { GLOBAIS_PROCURADAS } from './coletor';
import type {
  ColetaSite,
  FichaEfeito,
  ResultadoInvestigacao,
  StatusTecnologia,
  Tecnologia,
  TipoEfeitoWeb,
} from './tipos';
import { entradaCatalogo } from './catalogo';

/* ------------------------------ Assinaturas ------------------------------ */

interface Assinatura {
  id: string;
  nome: string;
  /** Global em window que confirma. */
  globais?: string[];
  /** src de script que confirma. */
  src?: RegExp;
  /** Marcadores do DOM que confirmam (a própria biblioteca os cria). */
  domConfirma?: string[];
  /** Marcadores do DOM que indicam (podem ser só nomes de classe). */
  domIndica?: string[];
  /** Palavras em scripts inline que indicam. */
  inline?: string[];
  /** Recursos carregados (src de imagens/JSON) que indicam. */
  recursoIndica?: RegExp;
}

/** As tecnologias pedidas e algumas vizinhas que mudam a leitura do efeito. */
export const ASSINATURAS: Assinatura[] = [
  {
    id: 'gsap',
    nome: 'GSAP',
    globais: ['gsap'],
    src: /(^|\/)gsap(@[\d.]+)?(\/|\.min\.js|\.js)|greensock/i,
    inline: ['gsap'],
  },
  {
    id: 'scrolltrigger',
    nome: 'GSAP ScrollTrigger',
    globais: ['ScrollTrigger'],
    src: /scrolltrigger/i,
    domIndica: ['.pin-spacer'],
    inline: ['ScrollTrigger'],
  },
  {
    id: 'framer-motion',
    nome: 'Framer Motion',
    src: /framer-motion/i,
    domIndica: ['[data-framer-appear-id]', '[data-framer-name]', '[data-framer-component-type]'],
    recursoIndica: /framerusercontent\.com/i,
    inline: ['framer'],
  },
  {
    id: 'motion',
    nome: 'Motion (motion.dev)',
    globais: ['Motion'],
    src: /(^|\/)motion(@[\d.]+)?\/|motion\.dev/i,
    domIndica: ['[data-motion]'],
  },
  {
    id: 'three',
    nome: 'Three.js',
    globais: ['THREE', '__THREE__'],
    src: /(^|\/)three(@[\d.]+)?(\/|\.module|\.min|\.js)/i,
    inline: ['THREE'],
  },
  { id: 'webgl', nome: 'WebGL', inline: ["getContext('webgl"] },
  {
    id: 'lottie',
    nome: 'Lottie',
    globais: ['lottie', 'bodymovin'],
    src: /lottie|bodymovin/i,
    domConfirma: ['lottie-player', 'dotlottie-player', 'dotlottie-wc'],
    inline: ['lottie'],
    recursoIndica: /lottie.*\.json|\.lottie$/i,
  },
  {
    id: 'lenis',
    nome: 'Lenis',
    globais: ['Lenis', 'lenis'],
    src: /lenis/i,
    domConfirma: ['html.lenis', '.lenis-smooth'],
    domIndica: ['[data-lenis-prevent]'],
    inline: ['Lenis'],
  },
  {
    id: 'swiper',
    nome: 'Swiper',
    globais: ['Swiper'],
    src: /swiper/i,
    domConfirma: ['.swiper-initialized'],
    domIndica: ['.swiper', '.swiper-wrapper'],
    inline: ['Swiper'],
  },
  { id: 'scroll-driven', nome: 'CSS Scroll-driven Animations' },
  { id: 'view-transitions', nome: 'View Transitions API', inline: ['startViewTransition'] },
  {
    id: 'locomotive',
    nome: 'Locomotive Scroll',
    globais: ['LocomotiveScroll'],
    src: /locomotive/i,
    domConfirma: ['.has-scroll-smooth'],
    domIndica: ['[data-scroll-container]', '[data-scroll-speed]'],
  },
  {
    id: 'aos',
    nome: 'AOS (Animate On Scroll)',
    globais: ['AOS'],
    src: /(^|\/)aos(@[\d.]+)?\//i,
    domConfirma: ['.aos-animate'],
    domIndica: ['[data-aos]'],
  },
  { id: 'barba', nome: 'Barba.js', globais: ['barba'], src: /barba/i, domIndica: ['[data-barba]'] },
  { id: 'swup', nome: 'Swup', globais: ['swup'], src: /swup/i, domIndica: ['#swup'] },
  { id: 'pixi', nome: 'PixiJS', globais: ['PIXI'], src: /pixi(\.min)?\.js|\/pixi\.js@/i },
  {
    id: 'split',
    nome: 'Divisão de texto (SplitText / Splitting / SplitType)',
    globais: ['Splitting', 'SplitType'],
    src: /splitting|split-type|splittext/i,
    domIndica: ['[data-splitting]', '.char', '.word', '.split-line'],
    inline: ['SplitText'],
  },
];

/** As que o pedido exige que sempre apareçam na lista (mesmo sem sinal). */
export const TECNOLOGIAS_OBRIGATORIAS = [
  'gsap',
  'scrolltrigger',
  'framer-motion',
  'motion',
  'three',
  'webgl',
  'lottie',
  'lenis',
  'swiper',
  'scroll-driven',
];

/* ------------------------------ Leitura segura ------------------------------ */

type Obj = Record<string, unknown>;
const obj = (x: unknown): x is Obj => !!x && typeof x === 'object' && !Array.isArray(x);
const txt = (x: unknown, max = 300) => (typeof x === 'string' ? x.slice(0, max) : '');
const num = (x: unknown, max = 1e9) =>
  typeof x === 'number' && Number.isFinite(x) ? Math.max(0, Math.min(max, x)) : 0;
const textos = (x: unknown, n: number, max = 300) =>
  (Array.isArray(x) ? x : [])
    .map((i) => txt(i, max))
    .filter(Boolean)
    .slice(0, n);

/** Confere a forma de um coleta-kcx.json. Devolve null se não for uma coleta. */
export function lerColeta(dado: unknown): ColetaSite | null {
  if (!obj(dado) || dado['formato'] !== 'kcx-coleta') return null;
  const c = obj(dado['css']) ? dado['css'] : {};
  const el = obj(dado['elementos']) ? dado['elementos'] : {};
  const contagem = (x: unknown) => {
    const out: Record<string, number> = {};
    if (obj(x))
      for (const [k, v] of Object.entries(x).slice(0, 80)) out[k.slice(0, 80)] = num(v, 1e6);
    return out;
  };
  const globais: Record<string, string | true> = {};
  if (obj(dado['globais']))
    for (const [k, v] of Object.entries(dado['globais']))
      if ((GLOBAIS_PROCURADAS as readonly string[]).includes(k))
        globais[k] = typeof v === 'string' ? v.slice(0, 20) : true;
  const vp = obj(dado['viewport']) ? dado['viewport'] : null;
  return {
    formato: 'kcx-coleta',
    versao: 1,
    origem: dado['origem'] === 'html' ? 'html' : 'dom',
    url: txt(dado['url'], 500),
    titulo: txt(dado['titulo'], 200),
    coletadoEm: txt(dado['coletadoEm'], 40),
    ...(vp
      ? { viewport: { largura: num(vp['largura'], 10000), altura: num(vp['altura'], 10000) } }
      : {}),
    scripts: textos(dado['scripts'], 150, 500),
    marcadoresInline: textos(dado['marcadoresInline'], 40, 60),
    estilos: textos(dado['estilos'], 80, 500),
    globais,
    marcadoresDom: contagem(dado['marcadoresDom']),
    css: {
      keyframes: textos(c['keyframes'], 100, 80),
      inacessiveis: num(c['inacessiveis'], 1000),
      regrasComTransicao: num(c['regrasComTransicao'], 1e6),
      regrasComAnimacao: num(c['regrasComAnimacao'], 1e6),
      scrollDriven: textos(c['scrollDriven'], 30, 160),
      sticky: num(c['sticky'], 1e6),
      scrollSnap: num(c['scrollSnap'], 1e6),
      viewTransitions: c['viewTransitions'] === true,
      backdropFilter: num(c['backdropFilter'], 1e6),
      hover: num(c['hover'], 1e6),
      perspective: num(c['perspective'], 1e6),
      ...(txt(c['scrollBehavior'], 20) ? { scrollBehavior: txt(c['scrollBehavior'], 20) } : {}),
    },
    animacoes: (Array.isArray(dado['animacoes']) ? dado['animacoes'] : [])
      .filter(obj)
      .slice(0, 80)
      .map((a) => ({
        alvo: txt(a['alvo'], 160),
        nome: txt(a['nome'], 80),
        duracao: num(a['duracao'], 600000),
        easing: txt(a['easing'], 80) || 'linear',
        timeline: (['documento', 'scroll', 'view'].includes(a['timeline'] as string)
          ? a['timeline']
          : 'outra') as 'documento' | 'scroll' | 'view' | 'outra',
        iteracoes:
          a['iteracoes'] === 'infinita' ? ('infinita' as const) : num(a['iteracoes'], 1e6) || 1,
      })),
    recursos: (Array.isArray(dado['recursos']) ? dado['recursos'] : [])
      .filter(obj)
      .slice(0, 250)
      .map((r) => ({
        nome: txt(r['nome'], 300),
        tipo: txt(r['tipo'], 40),
        bytes: num(r['bytes']),
      })),
    elementos: {
      canvas: num(el['canvas'], 1e6),
      video: num(el['video'], 1e6),
      svg: num(el['svg'], 1e6),
      iframes: num(el['iframes'], 1e6),
      fixosOuSticky: (Array.isArray(el['fixosOuSticky']) ? el['fixosOuSticky'] : [])
        .filter(obj)
        .slice(0, 40)
        .map((f) => ({ seletor: txt(f['seletor'], 160), posicao: txt(f['posicao'], 20) })),
    },
    indiciosEventos: contagem(dado['indiciosEventos']),
    avisos: textos(dado['avisos'], 20, 300),
  };
}

/* ------------------------------ HTML salvo ------------------------------ */

const MARCADORES_HTML = [
  ...new Set(ASSINATURAS.flatMap((a) => [...(a.domConfirma ?? []), ...(a.domIndica ?? [])])),
];

function absoluto(src: string, base: string): string {
  try {
    return new URL(src, base || undefined).href;
  } catch {
    return src;
  }
}

/** Contagens de CSS a partir de texto (folhas inline de um HTML salvo). */
export function lerCssTexto(css: string): Omit<ColetaSite['css'], 'inacessiveis'> {
  const conta = (re: RegExp) => (css.match(re) ?? []).length;
  return {
    keyframes: [...css.matchAll(/@(?:-webkit-)?keyframes\s+([\w-]+)/g)]
      .map((m) => m[1])
      .slice(0, 80),
    regrasComTransicao: conta(/transition(?:-duration)?\s*:/g),
    regrasComAnimacao: conta(/animation(?:-name)?\s*:/g),
    scrollDriven: [
      ...css.matchAll(
        /(animation-timeline|view-timeline(?:-name)?|scroll-timeline(?:-name)?)\s*:\s*([^;}]+)/g,
      ),
    ]
      .map((m) => `${m[1]}: ${m[2].trim()}`.slice(0, 120))
      .slice(0, 20),
    sticky: conta(/position\s*:\s*sticky/g),
    scrollSnap: conta(/scroll-snap-type\s*:/g),
    viewTransitions: /view-transition-name\s*:|@view-transition/.test(css),
    backdropFilter: conta(/backdrop-filter\s*:/g),
    hover: conta(/:hover/g),
    perspective: conta(/perspective\s*:/g),
  };
}

/**
 * Lê um HTML salvo ("Salvar página como…" ou código-fonte). Sem JavaScript
 * rodando: só o que está escrito no arquivo.
 */
export function coletaDoHtml(html: string, url = ''): ColetaSite {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const base = doc.querySelector('base')?.getAttribute('href') || url;
  const inline = [...doc.querySelectorAll('script:not([src])')]
    .map((s) => s.textContent ?? '')
    .join('\n');
  const css =
    [...doc.querySelectorAll('style')].map((s) => s.textContent ?? '').join('\n') +
    [...doc.querySelectorAll('[style]')].map((e) => `x{${e.getAttribute('style')}}`).join('\n');
  const marcadoresDom: Record<string, number> = {};
  for (const m of MARCADORES_HTML) {
    try {
      const n = doc.querySelectorAll(m).length;
      if (n) marcadoresDom[m] = n;
    } catch {
      /* seletor que o parser não conhece */
    }
  }
  const estilos = [...doc.querySelectorAll('link[rel~="stylesheet"]')]
    .map((l) => absoluto(l.getAttribute('href') ?? '', base))
    .filter(Boolean);
  const palavras = [
    'gsap',
    'ScrollTrigger',
    'THREE',
    'lottie',
    'Lenis',
    'Swiper',
    'framer',
    'motion',
    'IntersectionObserver',
    'startViewTransition',
    'requestAnimationFrame',
    "getContext('webgl",
  ];
  return {
    formato: 'kcx-coleta',
    versao: 1,
    origem: 'html',
    url,
    titulo: (doc.title || '').slice(0, 200),
    coletadoEm: new Date().toISOString(),
    scripts: [...doc.querySelectorAll('script[src]')]
      .map((s) => absoluto(s.getAttribute('src') ?? '', base))
      .slice(0, 120),
    marcadoresInline: palavras.filter((p) => inline.includes(p)),
    estilos,
    globais: {},
    marcadoresDom,
    css: { ...lerCssTexto(css), inacessiveis: estilos.length },
    animacoes: [],
    recursos: [...doc.querySelectorAll('img[src],video[src],source[src]')]
      .map((e) => ({
        nome: absoluto(e.getAttribute('src') ?? '', base),
        tipo: e.tagName.toLowerCase(),
        bytes: 0,
      }))
      .slice(0, 200),
    elementos: {
      canvas: doc.querySelectorAll('canvas').length,
      video: doc.querySelectorAll('video').length,
      svg: doc.querySelectorAll('svg').length,
      iframes: doc.querySelectorAll('iframe').length,
      fixosOuSticky: [],
    },
    indiciosEventos: {
      'onclick/onmouse*': doc.querySelectorAll(
        '[onclick],[onmouseover],[onmouseenter],[onmousemove]',
      ).length,
      'links e botões': doc.querySelectorAll('a,button,[role=button]').length,
    },
    avisos: [
      'HTML salvo: nenhum JavaScript rodou. Bibliotecas carregadas por outros scripts, globais e animações em andamento não aparecem.',
      ...(estilos.length
        ? [
            `${estilos.length} folha(s) de estilo externa(s) não foram lidas (só o CSS dentro do HTML).`,
          ]
        : []),
    ],
  };
}

/* ------------------------------ Classificação ------------------------------ */

function classificar(c: ColetaSite, a: Assinatura): Tecnologia {
  const conf: string[] = [];
  const prov: string[] = [];
  let versao: string | undefined;
  for (const g of a.globais ?? []) {
    const v = c.globais[g];
    if (v) {
      conf.push(`window.${g} existe na página`);
      if (typeof v === 'string') versao = v;
    }
  }
  if (a.src) {
    const s = c.scripts.find((x) => a.src!.test(x));
    if (s) conf.push(`script carregado: ${s.split('/').slice(-2).join('/')}`);
  }
  for (const m of a.domConfirma ?? [])
    if (c.marcadoresDom[m])
      conf.push(`${c.marcadoresDom[m]}× ${m} no DOM (criado pela biblioteca)`);
  for (const m of a.domIndica ?? [])
    if (c.marcadoresDom[m]) prov.push(`${c.marcadoresDom[m]}× ${m} no DOM`);
  for (const p of a.inline ?? [])
    if (c.marcadoresInline.includes(p)) prov.push(`“${p}” citado em script da página`);
  if (a.recursoIndica) {
    const r = c.recursos.find((x) => a.recursoIndica!.test(x.nome));
    if (r) prov.push(`recurso carregado: ${r.nome.split('/').slice(-2).join('/')}`);
  }

  // Casos que dependem de outros sinais.
  if (a.id === 'scroll-driven') {
    if (c.css.scrollDriven.length) conf.push(`CSS: ${c.css.scrollDriven.slice(0, 2).join(' · ')}`);
    const n = c.animacoes.filter((x) => x.timeline === 'scroll' || x.timeline === 'view').length;
    if (n) conf.push(`${n} animação(ões) ligada(s) a ScrollTimeline/ViewTimeline`);
  }
  if (a.id === 'view-transitions' && c.css.viewTransitions)
    conf.push('CSS com view-transition-name/@view-transition');
  if (a.id === 'webgl') {
    const libs3d = ['THREE', '__THREE__', 'PIXI', 'BABYLON'].filter((g) => c.globais[g]);
    if (c.elementos.canvas && libs3d.length)
      prov.push(
        `${c.elementos.canvas} canvas e ${libs3d.join(', ')} na página (essas bibliotecas desenham com WebGL)`,
      );
    else if (c.elementos.canvas)
      prov.push(
        `${c.elementos.canvas} canvas na página (pode ser 2D ou WebGL; o coletor não abre o contexto para não alterar o site)`,
      );
  }
  if (
    a.id === 'framer-motion' &&
    Object.keys(c.marcadoresDom).some((k) => k.startsWith('[data-framer'))
  )
    prov.push('Site feito no Framer (atributos data-framer-*), que anima com Framer Motion');

  const status: StatusTecnologia = conf.length
    ? 'confirmada'
    : prov.length
      ? 'provavel'
      : 'nao-identificada';
  const evidencias = status === 'confirmada' ? [...conf, ...prov] : prov;
  if (status === 'nao-identificada')
    evidencias.push(
      c.origem === 'html'
        ? 'Nenhum sinal no HTML salvo (sem JavaScript rodando, globais não foram verificadas).'
        : 'Nenhum sinal: sem global, script, marcador de DOM ou CSS correspondente.',
    );
  return { id: a.id, nome: a.nome, status, evidencias, ...(versao ? { versao } : {}) };
}

let contador = 0;
const novoId = () => `ficha-${Date.now().toString(36)}${(++contador).toString(36)}`;

function ficha(
  tipo: TipoEfeitoWeb,
  origem: 'dom' | 'html',
  confianca: FichaEfeito['confianca'],
  evidencias: string[],
  extra: Partial<FichaEfeito> = {},
): FichaEfeito {
  return {
    id: novoId(),
    tipo,
    nome: entradaCatalogo(tipo).nome,
    origem,
    confianca,
    inicio: null,
    fim: null,
    evidencias,
    parametros: {},
    ...extra,
  };
}

/** Efeitos que o DOM/CSS mostram (um por tipo, com a evidência mais forte). */
function fichasDaColeta(c: ColetaSite, tecs: Tecnologia[]): FichaEfeito[] {
  const o = c.origem;
  const tem = (id: string) => tecs.find((t) => t.id === id && t.status !== 'nao-identificada');
  const nomes = (ids: string[]) => ids.filter((id) => tem(id)).map((id) => tem(id)!.nome);
  const out: FichaEfeito[] = [];
  const anim = (filtro: (a: ColetaSite['animacoes'][number]) => boolean) =>
    c.animacoes.find(filtro);
  const kf = (re: RegExp) => c.css.keyframes.filter((k) => re.test(k));
  const parametrosDe = (a?: ColetaSite['animacoes'][number]) =>
    a ? { duracao: a.duracao || undefined, easing: a.easing } : {};

  const vista = anim((a) => a.timeline === 'view');
  const reveal = kf(/reveal|fade|appear|slide-?in|show|enter/i);
  if (
    vista ||
    c.marcadoresDom['[data-aos]'] ||
    c.marcadoresDom['.is-inview'] ||
    c.marcadoresDom['.is-visible'] ||
    reveal.length
  )
    out.push(
      ficha(
        'revelar',
        o,
        vista || c.marcadoresDom['.aos-animate'] ? 'alta' : 'media',
        [
          ...(vista ? [`animação “${vista.nome}” em ${vista.alvo} ligada a ViewTimeline`] : []),
          ...(c.marcadoresDom['[data-aos]'] ? [`${c.marcadoresDom['[data-aos]']}× data-aos`] : []),
          ...(c.marcadoresDom['.is-inview'] || c.marcadoresDom['.is-visible']
            ? ['classes de estado is-inview/is-visible']
            : []),
          ...(reveal.length ? [`keyframes: ${reveal.slice(0, 4).join(', ')}`] : []),
        ],
        {
          parametros: parametrosDe(vista),
          tecnologias: nomes(['scroll-driven', 'aos', 'scrolltrigger', 'motion', 'framer-motion']),
        },
      ),
    );

  const rolagem = anim((a) => a.timeline === 'scroll');
  if (rolagem || c.marcadoresDom['[data-scroll-speed]'] || c.marcadoresDom['[data-speed]'])
    out.push(
      ficha(
        'parallax',
        o,
        rolagem ? 'alta' : 'media',
        [
          ...(rolagem
            ? [`animação “${rolagem.nome}” em ${rolagem.alvo} ligada a ScrollTimeline`]
            : []),
          ...(c.marcadoresDom['[data-scroll-speed]']
            ? [`${c.marcadoresDom['[data-scroll-speed]']}× data-scroll-speed`]
            : []),
          ...(c.marcadoresDom['[data-speed]']
            ? [`${c.marcadoresDom['[data-speed]']}× data-speed`]
            : []),
        ],
        { tecnologias: nomes(['scroll-driven', 'scrolltrigger', 'locomotive', 'lenis']) },
      ),
    );

  const stickys = c.elementos.fixosOuSticky.filter((f) => f.posicao === 'sticky');
  const pins = c.marcadoresDom['.pin-spacer'];
  if (stickys.length || c.css.sticky || pins)
    out.push(
      ficha(
        'sticky',
        o,
        stickys.length || pins ? 'alta' : 'media',
        [
          ...(stickys.length
            ? [
                `${stickys.length} elemento(s) com position: sticky (${stickys
                  .slice(0, 3)
                  .map((s) => s.seletor)
                  .join(', ')})`,
              ]
            : []),
          ...(c.css.sticky ? [`${c.css.sticky} regra(s) CSS com position: sticky`] : []),
          ...(pins ? [`${pins}× .pin-spacer (seção presa pelo ScrollTrigger)`] : []),
        ],
        {
          ...(stickys[0] ? { seletor: stickys[0].seletor } : {}),
          tecnologias: nomes(['scrolltrigger']),
        },
      ),
    );
  if (stickys.length >= 3 || c.css.sticky >= 3)
    out.push(
      ficha('empilhar', o, 'baixa', [
        `${Math.max(stickys.length, c.css.sticky)} elementos sticky: padrão comum de cards empilhados (confira no vídeo)`,
      ]),
    );

  if (tem('swiper') || c.css.scrollSnap)
    out.push(
      ficha(
        'horizontal',
        o,
        tem('swiper') ? 'media' : 'baixa',
        [
          ...(tem('swiper') ? ['Swiper na página (carrossel horizontal)'] : []),
          ...(c.css.scrollSnap ? [`${c.css.scrollSnap} regra(s) com scroll-snap-type`] : []),
        ],
        { tecnologias: nomes(['swiper', 'scrolltrigger']) },
      ),
    );

  const morph = kf(/morph|blob|shape/i);
  if (morph.length)
    out.push(ficha('morph', o, 'media', [`keyframes: ${morph.slice(0, 4).join(', ')}`]));

  if (c.css.hover && c.css.regrasComTransicao)
    out.push(
      ficha('hover', o, 'media', [
        `${c.css.hover} regra(s) :hover e ${c.css.regrasComTransicao} com transition`,
      ]),
    );

  if (tem('split'))
    out.push(
      ficha('texto', o, 'media', tem('split')!.evidencias.slice(0, 3), {
        tecnologias: nomes(['split', 'gsap']),
      }),
    );

  if (c.css.backdropFilter)
    out.push(ficha('vidro', o, 'alta', [`${c.css.backdropFilter} regra(s) com backdrop-filter`]));

  if (c.css.perspective || tem('three') || tem('webgl'))
    out.push(
      ficha(
        'profundidade',
        o,
        tem('three') ? 'media' : 'baixa',
        [
          ...(c.css.perspective ? [`${c.css.perspective} regra(s) com perspective`] : []),
          ...(tem('three') ? ['Three.js na página (cena 3D)'] : []),
        ],
        { tecnologias: nomes(['three', 'webgl', 'pixi']) },
      ),
    );

  const cursor =
    c.indiciosEventos['cursor: none no CSS'] ||
    c.marcadoresDom['.cursor'] ||
    c.marcadoresDom['.custom-cursor'] ||
    c.marcadoresDom['[data-cursor]'];
  if (cursor)
    out.push(
      ficha('cursor', o, 'media', [
        ...(c.indiciosEventos['cursor: none no CSS']
          ? ['CSS esconde o cursor do sistema (cursor: none)']
          : []),
        ...(c.marcadoresDom['.cursor'] || c.marcadoresDom['.custom-cursor']
          ? ['elemento .cursor/.custom-cursor no DOM']
          : []),
        ...(c.marcadoresDom['[data-cursor]'] ? ['atributos data-cursor'] : []),
      ]),
    );

  if (
    c.css.viewTransitions ||
    tem('barba') ||
    tem('swup') ||
    c.marcadoresInline.includes('startViewTransition')
  )
    out.push(
      ficha(
        'transicao',
        o,
        c.css.viewTransitions || tem('barba') || tem('swup') ? 'alta' : 'media',
        [
          ...(c.css.viewTransitions ? ['CSS com View Transitions'] : []),
          ...(c.marcadoresInline.includes('startViewTransition')
            ? ['script chama startViewTransition']
            : []),
          ...(tem('barba') ? ['Barba.js (transição entre páginas)'] : []),
          ...(tem('swup') ? ['Swup (transição entre páginas)'] : []),
        ],
        { tecnologias: nomes(['view-transitions', 'barba', 'swup']) },
      ),
    );

  return out;
}

/** Investiga uma coleta (DOM ou HTML). */
export function investigar(c: ColetaSite): ResultadoInvestigacao {
  const tecnologias = ASSINATURAS.map((a) => classificar(c, a)).filter(
    (t) => t.status !== 'nao-identificada' || TECNOLOGIAS_OBRIGATORIAS.includes(t.id),
  );
  const ordem: StatusTecnologia[] = ['confirmada', 'provavel', 'nao-identificada'];
  tecnologias.sort((a, b) => ordem.indexOf(a.status) - ordem.indexOf(b.status));
  const resumo: string[] = [];
  const kb = Math.round(c.recursos.reduce((s, r) => s + r.bytes, 0) / 1024);
  if (c.recursos.length)
    resumo.push(
      `${c.recursos.length} recurso(s) carregado(s)${kb ? ` (${kb} kB transferidos)` : ''}: ${Object.entries(
        c.recursos.reduce<Record<string, number>>(
          (m, r) => ((m[r.tipo] = (m[r.tipo] ?? 0) + 1), m),
          {},
        ),
      )
        .map(([t, n]) => `${n} ${t}`)
        .join(', ')}.`,
    );
  if (c.scripts.length) resumo.push(`${c.scripts.length} script(s) externo(s).`);
  if (c.css.keyframes.length)
    resumo.push(
      `@keyframes: ${c.css.keyframes.slice(0, 8).join(', ')}${c.css.keyframes.length > 8 ? '…' : ''}.`,
    );
  if (c.animacoes.length)
    resumo.push(
      `${c.animacoes.length} animação(ões) rodando na hora da coleta (${c.animacoes.filter((a) => a.timeline === 'documento').length} pelo tempo, ${c.animacoes.filter((a) => a.timeline === 'scroll' || a.timeline === 'view').length} pelo scroll).`,
    );
  const lenis = tecnologias.find((t) => t.id === 'lenis' && t.status !== 'nao-identificada');
  const loco = tecnologias.find((t) => t.id === 'locomotive' && t.status !== 'nao-identificada');
  resumo.push(
    `Rolagem: ${lenis ? 'suavizada pelo Lenis' : loco ? 'controlada pelo Locomotive Scroll' : c.css.scrollBehavior === 'smooth' ? 'scroll-behavior: smooth (nativo)' : 'nativa do navegador'}${c.css.scrollSnap ? ', com scroll-snap' : ''}${c.css.sticky || c.elementos.fixosOuSticky.length ? ', com partes presas (sticky/fixed)' : ''}.`,
  );
  resumo.push(
    `Transição de página: ${c.css.viewTransitions ? 'View Transitions (CSS)' : tecnologias.some((t) => (t.id === 'barba' || t.id === 'swup') && t.status !== 'nao-identificada') ? 'biblioteca de transição (Barba/Swup)' : 'nenhuma identificada'}.`,
  );
  const ev = Object.entries(c.indiciosEventos)
    .filter(([, n]) => n)
    .map(([k, n]) => `${n} ${k}`);
  if (ev.length) resumo.push(`Interação (indícios, não os listeners reais): ${ev.join(', ')}.`);
  const limites = [
    ...c.avisos,
    c.origem === 'dom'
      ? 'Os eventos (listeners) não podem ser listados por um script na página: aparecem só indícios.'
      : 'Sem o coletor, nada do que o JavaScript cria depois do carregamento foi visto.',
    'Bibliotecas empacotadas (bundles) sem global e sem marcador próprio podem ficar como “não identificada”.',
  ];
  return {
    origem: c.origem,
    url: c.url,
    titulo: c.titulo,
    quando: c.coletadoEm,
    tecnologias,
    fichas: fichasDaColeta(c, tecnologias),
    resumo,
    limites,
  };
}
