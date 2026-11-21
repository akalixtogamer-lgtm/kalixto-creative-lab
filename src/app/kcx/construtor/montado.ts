/**
 * Montador visual: componente montado do zero com camadas (caixa, texto, ícone
 * e imagem), cada propriedade escolhida entre os tokens da fundação.
 *
 * A montagem vira uma DefinicaoTipo dinâmica e passa pelo mesmo construtor dos
 * 32 tipos: sai com variáveis, código (HTML/CSS), estados de design system e
 * estrutura para o Figma — e, por usar os valores dos tokens, no Figma as
 * variáveis viram alias da fundação.
 */
import { KcxEfeito, KcxNo, KcxRef } from '../kcx.types';
import {
  CHAVES_ESPACO,
  ChaveEspaco,
  ChaveRaio,
  ChaveSombra,
  FUNDACAO_PADRAO,
  KcxFundacao,
  NOMES_TEXTO,
  NivelTexto,
  TokenCor,
  construtorDaFundacao,
  estiloDoPeso,
} from '../fundacao';
import { estadosDs } from './estados-ds';
import { Blocos, ConfigConstrutor, DefinicaoTipo, escHtml, slug } from './montar';

export const MONTADO_ID = 'montado';

export type ChaveDesfoque = 'p' | 'm' | 'g';
/** Desfoque do fundo em px de CSS (`backdrop-filter: blur(…)`). */
export const DESFOQUES: Record<ChaveDesfoque, number> = { p: 8, m: 16, g: 24 };
export const CHAVES_DESFOQUE = Object.keys(DESFOQUES) as ChaveDesfoque[];

/** Receita do efeito vidro (glassmorphism) aplicada a uma caixa. */
export const VIDRO = {
  fundo: 'superficie',
  opacidadeFundo: 35,
  borda: 'texto',
  opacidadeBorda: 20,
  desfoque: 'm',
} as const satisfies Partial<CamadaMontada>;

/** A caixa usa transparência ou desfoque (pede um fundo colorido para aparecer). */
export function temVidro(c: CamadaMontada): boolean {
  return todasCamadas(c).some(
    (x) => !!x.desfoque || (x.opacidadeFundo ?? 100) < 100 || (x.opacidadeBorda ?? 100) < 100,
  );
}
export const MAX_CAMADAS = 60;
export const MAX_PROFUNDIDADE = 6;

export type TipoCamada = 'caixa' | 'texto' | 'icone' | 'imagem';

export interface CamadaMontada {
  /** Único na montagem (letras, números e hífen). */
  id: string;
  tipo: TipoCamada;
  nome: string;
  /* caixa */
  direcao?: 'horizontal' | 'vertical';
  alinhar?: 'inicio' | 'centro' | 'fim';
  /** Espalhar os filhos de ponta a ponta (ex.: logo à esquerda, botão à direita). */
  distribuir?: boolean;
  espaco?: ChaveEspaco | null;
  padX?: ChaveEspaco | null;
  padY?: ChaveEspaco | null;
  fundo?: TokenCor | null;
  borda?: TokenCor | null;
  raio?: ChaveRaio | null;
  sombra?: ChaveSombra | null;
  /** Opacidade do fundo em % (0–100); ausente = 100 (sólido). */
  opacidadeFundo?: number;
  /** Opacidade da borda em % (0–100); ausente = 100. */
  opacidadeBorda?: number;
  /** Desfoque do que fica atrás da caixa (vidro). No Figma: Background blur. */
  desfoque?: ChaveDesfoque | null;
  /** px; 0/ausente = automático. Também vale para imagem. */
  largura?: number;
  altura?: number;
  /* texto e ícone */
  texto?: string;
  nivel?: NivelTexto;
  cor?: TokenCor;
  icone?: string;
  tamanho?: number;
  /* imagem */
  url?: string;
  filhos?: CamadaMontada[];
}

export interface Montagem {
  raiz: CamadaMontada;
  /** Estados de design system (Padrão, Hover, Pressionado, Foco, Desativado). */
  interativo: boolean;
  /**
   * Eixos de variante além do Estado.
   * - tamanho: P, M e G (margem interna da camada principal e tamanho dos textos);
   * - tipo: Primário, Secundário (contorno) e Fantasma (só o conteúdo), a partir do
   *   fundo da camada principal; textos e ícones na cor "Texto sobre a primária"
   *   passam a usar a cor do fundo no Secundário e no Fantasma.
   */
  eixos?: { tamanho?: boolean; tipo?: boolean };
}

export const OPCOES_TAMANHO = [
  { valor: 'p', rotulo: 'P' },
  { valor: 'm', rotulo: 'M' },
  { valor: 'g', rotulo: 'G' },
];
export const OPCOES_TIPO = [
  { valor: 'primario', rotulo: 'Primário' },
  { valor: 'secundario', rotulo: 'Secundário' },
  { valor: 'fantasma', rotulo: 'Fantasma' },
];
/** Escala dos textos por tamanho (M = o tamanho do token). */
export const ESCALA_TAMANHO = { p: 0.875, m: 1, g: 1.125 } as const;

/* ============================== Criação e edição ============================== */

export function montagemPadrao(): Montagem {
  return {
    interativo: true,
    raiz: {
      id: 'raiz',
      tipo: 'caixa',
      nome: 'Card',
      direcao: 'vertical',
      alinhar: 'inicio',
      espaco: '3',
      padX: '6',
      padY: '6',
      fundo: 'superficie',
      borda: 'borda',
      raio: 'm',
      sombra: 'm',
      largura: 320,
      filhos: [
        {
          id: 'titulo',
          tipo: 'texto',
          nome: 'Título',
          texto: 'Título do card',
          nivel: 'h3',
          cor: 'texto',
        },
        {
          id: 'descricao',
          tipo: 'texto',
          nome: 'Descrição',
          texto: 'Uma frase curta explicando o conteúdo.',
          nivel: 'corpo',
          cor: 'texto-suave',
        },
        {
          id: 'rodape',
          tipo: 'caixa',
          nome: 'Rodapé',
          direcao: 'horizontal',
          alinhar: 'centro',
          espaco: '2',
          filhos: [
            {
              id: 'icone',
              tipo: 'icone',
              nome: 'Ícone',
              icone: 'estrela',
              tamanho: 20,
              cor: 'primaria',
            },
            {
              id: 'acao',
              tipo: 'texto',
              nome: 'Ação',
              texto: 'Saiba mais',
              nivel: 'pequeno',
              cor: 'primaria',
            },
          ],
        },
      ],
    },
  };
}

/* ============================== Modelos ============================== */

const txt = (
  id: string,
  nome: string,
  texto: string,
  nivel: NivelTexto,
  cor: TokenCor,
): CamadaMontada => ({ id, tipo: 'texto', nome, texto, nivel, cor });
const ico = (
  id: string,
  nome: string,
  icone: string,
  cor: TokenCor,
  tamanho = 20,
): CamadaMontada => ({
  id,
  tipo: 'icone',
  nome,
  icone,
  cor,
  tamanho,
});

export interface ModeloMontador {
  id: string;
  nome: string;
  descricao: string;
  /** Nome sugerido para o componente. */
  sugestao: string;
  criar(): Montagem;
}

/** Pontos de partida do montador: tudo continua editável camada por camada. */
export const MODELOS_MONTADOR: ModeloMontador[] = [
  {
    id: 'botao',
    nome: 'Botão',
    descricao: 'Ícone + rótulo, com Tipo (primário, secundário, fantasma) e Tamanho P/M/G.',
    sugestao: 'Meu botão',
    criar: () => ({
      interativo: true,
      eixos: { tipo: true, tamanho: true },
      raiz: {
        id: 'raiz',
        tipo: 'caixa',
        nome: 'Botão',
        direcao: 'horizontal',
        alinhar: 'centro',
        espaco: '2',
        padX: '6',
        padY: '3',
        fundo: 'primaria',
        raio: 'pill',
        filhos: [
          ico('icone', 'Ícone', 'mais', 'sobre-primaria', 18),
          txt('rotulo', 'Rótulo', 'Começar agora', 'corpo', 'sobre-primaria'),
        ],
      },
    }),
  },
  {
    id: 'card',
    nome: 'Card',
    descricao: 'Título, descrição e rodapé com ícone, sobre a superfície.',
    sugestao: 'Meu card',
    criar: montagemPadrao,
  },
  {
    id: 'card-vidro',
    nome: 'Card de vidro',
    descricao: 'Glassmorphism: fundo translúcido, borda clara e desfoque do que fica atrás.',
    sugestao: 'Meu card de vidro',
    criar: () => {
      const m = montagemPadrao();
      Object.assign(m.raiz, VIDRO, { nome: 'Card de vidro', raio: 'g' });
      return m;
    },
  },
  {
    id: 'navbar',
    nome: 'Navbar',
    descricao: 'Logo, links e botão de ação numa barra horizontal.',
    sugestao: 'Minha navbar',
    criar: () => ({
      interativo: false,
      raiz: {
        id: 'raiz',
        tipo: 'caixa',
        nome: 'Navbar',
        direcao: 'horizontal',
        alinhar: 'centro',
        distribuir: true,
        espaco: '12',
        padX: '8',
        padY: '4',
        fundo: 'superficie',
        borda: 'borda',
        largura: 960,
        filhos: [
          txt('logo', 'Logo', 'Kalixto', 'h3', 'primaria'),
          {
            id: 'links',
            tipo: 'caixa',
            nome: 'Links',
            direcao: 'horizontal',
            alinhar: 'centro',
            espaco: '6',
            filhos: [
              txt('link-1', 'Link 1', 'Início', 'corpo', 'texto'),
              txt('link-2', 'Link 2', 'Aulas', 'corpo', 'texto-suave'),
              txt('link-3', 'Link 3', 'Contato', 'corpo', 'texto-suave'),
            ],
          },
          {
            id: 'acao',
            tipo: 'caixa',
            nome: 'Botão',
            direcao: 'horizontal',
            alinhar: 'centro',
            padX: '4',
            padY: '2',
            fundo: 'primaria',
            raio: 'pill',
            filhos: [txt('acao-rotulo', 'Rótulo do botão', 'Entrar', 'pequeno', 'sobre-primaria')],
          },
        ],
      },
    }),
  },
  {
    id: 'navbar-vidro',
    nome: 'Navbar de vidro',
    descricao: 'A Navbar fosca: o conteúdo da página aparece desfocado por trás.',
    sugestao: 'Minha navbar de vidro',
    criar: () => {
      const m = MODELOS_MONTADOR.find((x) => x.id === 'navbar')!.criar();
      Object.assign(m.raiz, VIDRO, { nome: 'Navbar de vidro' });
      return m;
    },
  },
  {
    id: 'chip',
    nome: 'Chip / etiqueta',
    descricao: 'Selo pequeno com ícone, para filtros e categorias.',
    sugestao: 'Meu chip',
    criar: () => ({
      interativo: true,
      eixos: { tipo: true },
      raiz: {
        id: 'raiz',
        tipo: 'caixa',
        nome: 'Chip',
        direcao: 'horizontal',
        alinhar: 'centro',
        espaco: '1',
        padX: '3',
        padY: '1',
        fundo: 'primaria',
        raio: 'pill',
        filhos: [
          ico('icone', 'Ícone', 'check', 'sobre-primaria', 14),
          txt('rotulo', 'Rótulo', 'Samba', 'legenda', 'sobre-primaria'),
        ],
      },
    }),
  },
  {
    id: 'campo',
    nome: 'Campo de texto',
    descricao: 'Rótulo, caixa com ícone e texto de exemplo, e ajuda embaixo.',
    sugestao: 'Meu campo',
    criar: () => ({
      interativo: false,
      raiz: {
        id: 'raiz',
        tipo: 'caixa',
        nome: 'Campo',
        direcao: 'vertical',
        alinhar: 'inicio',
        espaco: '2',
        largura: 320,
        filhos: [
          txt('rotulo', 'Rótulo', 'E-mail', 'pequeno', 'texto'),
          {
            id: 'caixa',
            tipo: 'caixa',
            nome: 'Caixa',
            direcao: 'horizontal',
            alinhar: 'centro',
            espaco: '2',
            padX: '3',
            padY: '3',
            fundo: 'fundo',
            borda: 'borda',
            raio: 'm',
            largura: 320,
            filhos: [
              ico('icone', 'Ícone', 'email', 'texto-suave', 18),
              txt('exemplo', 'Texto de exemplo', 'voce@email.com', 'corpo', 'texto-suave'),
            ],
          },
          txt('ajuda', 'Ajuda', 'Usamos só para avisar das aulas.', 'legenda', 'texto-suave'),
        ],
      },
    }),
  },
  {
    id: 'item-lista',
    nome: 'Item de lista',
    descricao: 'Foto redonda, nome, detalhe e seta, para listas e menus.',
    sugestao: 'Meu item de lista',
    criar: () => ({
      interativo: true,
      raiz: {
        id: 'raiz',
        tipo: 'caixa',
        nome: 'Item',
        direcao: 'horizontal',
        alinhar: 'centro',
        espaco: '3',
        padX: '4',
        padY: '3',
        fundo: 'superficie',
        raio: 'm',
        largura: 360,
        filhos: [
          {
            id: 'foto',
            tipo: 'imagem',
            nome: 'Foto',
            largura: 40,
            altura: 40,
            raio: 'pill',
            url: '',
          },
          {
            id: 'textos',
            tipo: 'caixa',
            nome: 'Textos',
            direcao: 'vertical',
            alinhar: 'inicio',
            espaco: '1',
            largura: 232,
            filhos: [
              txt('nome', 'Nome', 'Wallace Toledo', 'corpo', 'texto'),
              txt('detalhe', 'Detalhe', 'Aula de forró · 19h', 'pequeno', 'texto-suave'),
            ],
          },
          ico('seta', 'Seta', 'direita', 'texto-suave', 18),
        ],
      },
    }),
  },
  {
    id: 'hero',
    nome: 'Hero',
    descricao: 'Topo de página: selo, título grande, subtítulo e dois botões.',
    sugestao: 'Meu hero',
    criar: () => ({
      interativo: false,
      raiz: {
        id: 'raiz',
        tipo: 'caixa',
        nome: 'Hero',
        direcao: 'vertical',
        alinhar: 'centro',
        espaco: '4',
        padX: '8',
        padY: '16',
        fundo: 'fundo',
        largura: 960,
        filhos: [
          txt('selo', 'Selo', 'NOVIDADE', 'legenda', 'primaria'),
          txt('titulo', 'Título', 'Dance com quem entende', 'display', 'texto'),
          txt(
            'subtitulo',
            'Subtítulo',
            'Aulas de dança de salão para todos os níveis.',
            'corpo',
            'texto-suave',
          ),
          {
            id: 'acoes',
            tipo: 'caixa',
            nome: 'Ações',
            direcao: 'horizontal',
            alinhar: 'centro',
            espaco: '3',
            filhos: [
              {
                id: 'botao-1',
                tipo: 'caixa',
                nome: 'Botão principal',
                direcao: 'horizontal',
                alinhar: 'centro',
                padX: '6',
                padY: '3',
                fundo: 'primaria',
                raio: 'pill',
                filhos: [
                  txt(
                    'botao-1-rotulo',
                    'Rótulo principal',
                    'Agendar aula',
                    'corpo',
                    'sobre-primaria',
                  ),
                ],
              },
              {
                id: 'botao-2',
                tipo: 'caixa',
                nome: 'Botão secundário',
                direcao: 'horizontal',
                alinhar: 'centro',
                padX: '6',
                padY: '3',
                borda: 'primaria',
                raio: 'pill',
                filhos: [
                  txt('botao-2-rotulo', 'Rótulo secundário', 'Ver horários', 'corpo', 'primaria'),
                ],
              },
            ],
          },
        ],
      },
    }),
  },
  {
    id: 'vazio',
    nome: 'Em branco',
    descricao: 'Só uma caixa: monte tudo do zero.',
    sugestao: 'Meu componente',
    criar: () => ({
      interativo: false,
      raiz: {
        id: 'raiz',
        tipo: 'caixa',
        nome: 'Componente',
        direcao: 'vertical',
        alinhar: 'inicio',
        espaco: '3',
        padX: '4',
        padY: '4',
        fundo: 'superficie',
        raio: 'm',
        filhos: [],
      },
    }),
  },
];

/** Camada nova com valores razoáveis (id único dentro de `ocupados`). */
export function novaCamada(tipo: TipoCamada, ocupados: string[]): CamadaMontada {
  const base = { caixa: 'caixa', texto: 'texto', icone: 'icone', imagem: 'imagem' }[tipo];
  let n = 1;
  while (ocupados.includes(`${base}-${n}`)) n++;
  const id = `${base}-${n}`;
  switch (tipo) {
    case 'caixa':
      return {
        id,
        tipo,
        nome: `Caixa ${n}`,
        direcao: 'horizontal',
        alinhar: 'centro',
        espaco: '2',
        filhos: [],
      };
    case 'texto':
      return { id, tipo, nome: `Texto ${n}`, texto: 'Novo texto', nivel: 'corpo', cor: 'texto' };
    case 'icone':
      return { id, tipo, nome: `Ícone ${n}`, icone: 'estrela', tamanho: 20, cor: 'primaria' };
    case 'imagem':
      return { id, tipo, nome: `Imagem ${n}`, largura: 280, altura: 160, raio: 'm', url: '' };
  }
}

export function todasCamadas(c: CamadaMontada): CamadaMontada[] {
  return [c, ...(c.filhos ?? []).flatMap(todasCamadas)];
}

export function acharCamada(c: CamadaMontada, id: string): CamadaMontada | undefined {
  return todasCamadas(c).find((x) => x.id === id);
}

export function paiDe(raiz: CamadaMontada, id: string): CamadaMontada | undefined {
  return todasCamadas(raiz).find((x) => x.filhos?.some((f) => f.id === id));
}

/** Problemas da montagem (vazio = pode montar). */
export function validarMontagem(m: Montagem): string[] {
  const erros: string[] = [];
  const todas = todasCamadas(m.raiz);
  if (m.raiz.tipo !== 'caixa') erros.push('A camada principal precisa ser uma caixa.');
  if (todas.length > MAX_CAMADAS) erros.push(`No máximo ${MAX_CAMADAS} camadas.`);
  const ids = new Set<string>();
  for (const c of todas) {
    if (!/^[a-z][a-z0-9-]*$/.test(c.id)) erros.push(`Id inválido: "${c.id}".`);
    if (ids.has(c.id)) erros.push(`Id repetido: "${c.id}".`);
    ids.add(c.id);
    if (c.tipo !== 'caixa' && c.filhos?.length)
      erros.push(`"${c.nome}" não é caixa e não pode ter filhos.`);
    for (const k of ['opacidadeFundo', 'opacidadeBorda'] as const) {
      const v = c[k];
      if (v !== undefined && !(Number.isInteger(v) && v >= 0 && v <= 100))
        erros.push(`"${c.nome}": a opacidade vai de 0 a 100%.`);
    }
    if (c.desfoque && !(c.desfoque in DESFOQUES)) erros.push(`"${c.nome}": desfoque inválido.`);
  }
  if (m.eixos?.tipo && !m.raiz.fundo)
    erros.push('Para ter o eixo Tipo, escolha um fundo para a camada principal.');
  const prof = (c: CamadaMontada): number => 1 + Math.max(0, ...(c.filhos ?? []).map(prof));
  if (prof(m.raiz) > MAX_PROFUNDIDADE)
    erros.push(`No máximo ${MAX_PROFUNDIDADE} níveis de caixas uma dentro da outra.`);
  return erros;
}

/* ============================== Configuração ============================== */

/** Configuração do construtor para uma montagem (cores e raio vindos da fundação). */
export function configMontada(
  nome: string,
  montagem: Montagem,
  fundacao: KcxFundacao = FUNDACAO_PADRAO,
  id?: string,
): ConfigConstrutor {
  const textos = Object.fromEntries(
    todasCamadas(montagem.raiz)
      .filter((c) => c.tipo === 'texto')
      .map((c) => [c.id, c.texto ?? '']),
  );
  return {
    tipo: MONTADO_ID,
    nome,
    ...(id ? { id } : {}),
    textos,
    itens: [],
    animacao: 'estados',
    midia: '',
    ...construtorDaFundacao(fundacao),
    modos: true,
    telas: true,
    montagem: structuredClone(montagem),
    fundacaoMontagem: structuredClone(fundacao),
  };
}

/* ============================== Definição dinâmica ============================== */

const pascal = (s: string) =>
  s
    .replace(/[^a-zA-Z0-9]+(.)?/g, (_, c?: string) => (c ? c.toUpperCase() : ''))
    .replace(/^./, (c) => c.toUpperCase());

/** Cores do construtor que já existem como variáveis base. */
const BASE_COR: Partial<Record<TokenCor, 'primaria' | 'fundo' | 'superficie' | 'texto' | 'suave'>> =
  {
    primaria: 'primaria',
    fundo: 'fundo',
    superficie: 'superficie',
    texto: 'texto',
    'texto-suave': 'suave',
  };

export function definicaoMontada(cfg: ConfigConstrutor): DefinicaoTipo {
  const m = cfg.montagem ?? montagemPadrao();
  const textos = todasCamadas(m.raiz)
    .filter((c) => c.tipo === 'texto')
    .map((c) => ({ id: c.id, rotulo: c.nome, padrao: c.texto ?? '' }));
  return {
    id: MONTADO_ID,
    nome: 'Componente montado',
    categoria: 'conteudo',
    uso: 'site e app',
    descricao: 'Componente montado do zero no Montador visual, com os tokens da fundação.',
    textos,
    animacoes: [
      { id: 'estados', nome: 'Estados', descricao: 'Realce no hover e no clique, anel de foco.' },
    ],
    largura: Math.max(240, (m.raiz.largura ?? 320) + 80),
    altura: 320,
    gerar: (c, b) => gerarMontado(c, b, m),
  };
}

function gerarMontado(cfg: ConfigConstrutor, b: Blocos, m: Montagem) {
  const f = cfg.fundacaoMontagem ?? FUNDACAO_PADRAO;
  const C = b.C;
  const P = b.P;
  const criados = new Set<string>();
  const uma = (id: string, criar: () => void) => {
    if (!criados.has(id)) {
      criados.add(id);
      criar();
    }
    return id;
  };

  /** Variável e custom property de um token de cor. */
  const cor = (t: TokenCor): { ref: KcxRef<string>; css: string } => {
    const base = BASE_COR[t];
    if (base) return { ref: b.cor(base), css: b.v(base) };
    const id = uma(`cor${pascal(t)}`, () =>
      b.extra({
        id: `cor${pascal(t)}`,
        nome: `Cor ${t}`,
        tipo: 'color',
        padrao: f.cores[t].escuro,
        modos: { light: f.cores[t].claro },
        descricao: `Token cor/${t} da fundação.`,
        grupo: 'colors',
        secao: 'aparencia',
        vinculos: [{ propriedade: `cor-${t}`, alvo: { tipo: 'css-var', nome: `${P}-cor-${t}` } }],
      }),
    );
    return { ref: { $var: id }, css: `var(${P}-cor-${t})` };
  };
  const medida = (
    grupo: 'dimensions' | 'spacing' | 'typography',
    id: string,
    nome: string,
    valor: number,
    css: string,
    celular?: number,
  ): { ref: KcxRef<number>; css: string } => {
    uma(id, () =>
      b.extra({
        id,
        nome,
        tipo: 'dimension',
        padrao: valor,
        min: 0,
        max: 999,
        passo: 1,
        unidade: 'px',
        ...(celular !== undefined && celular !== valor ? { modos: { celular } } : {}),
        descricao: `Token da fundação (${css}).`,
        grupo,
        secao: 'aparencia',
        vinculos: [
          { propriedade: css, alvo: { tipo: 'css-var', nome: `${P}-${css}` }, unidadeSaida: 'px' },
        ],
      }),
    );
    return { ref: { $var: id }, css: `var(${P}-${css})` };
  };
  const raio = (k: ChaveRaio) =>
    k === 'm'
      ? { ref: b.raio, css: b.v('raio') }
      : medida('dimensions', `raio${pascal(k)}`, `Raio ${k}`, f.raios[k], `raio-${k}`);
  const espaco = (k: ChaveEspaco) =>
    medida('spacing', `espaco${k}`, `Espaço ${k}`, f.espacos[k], `espaco-${k}`);
  const tamanhoTexto = (n: NivelTexto) =>
    medida(
      'typography',
      `texto${pascal(n)}`,
      `Texto ${NOMES_TEXTO[n]}`,
      f.texto[n].tamanho,
      `texto-${n}`,
      f.texto[n].tamanhoCelular,
    );
  const sombra = (k: ChaveSombra): { efeito: KcxEfeito; css: string } => {
    const s = f.sombras[k];
    const alpha = Math.round(s.opacidade * 255)
      .toString(16)
      .padStart(2, '0');
    return {
      efeito: {
        tipo: 'sombra',
        cor: `#000000${alpha}`,
        raio: s.raio,
        espalhar: s.espalhar,
        x: s.x,
        y: s.y,
      },
      css: `${s.x}px ${s.y}px ${s.raio}px ${s.espalhar}px rgb(0 0 0 / ${s.opacidade})`,
    };
  };

  const ds = m.interativo ? estadosDs(b) : null;
  const cssPartes: string[] = [];

  /* ---------- Eixos de variante (Tamanho e Tipo) ---------- */
  const eixoTam = m.eixos?.tamanho
    ? b.extra({
        id: 'tamanho',
        nome: 'Tamanho',
        tipo: 'enum',
        padrao: 'm',
        opcoes: OPCOES_TAMANHO,
        descricao: 'P, M ou G. No Figma é um eixo de variante.',
        grupo: 'dimensions',
        secao: 'aparencia',
        vinculos: [
          {
            propriedade: 'data-tamanho',
            alvo: { tipo: 'atributo', seletor: `.${C}`, atributo: 'data-tamanho' },
          },
        ],
      })
    : undefined;
  const fundoRaiz = m.raiz.fundo ?? null;
  const eixoTipo =
    m.eixos?.tipo && fundoRaiz
      ? b.extra({
          id: 'tipo',
          nome: 'Tipo',
          tipo: 'enum',
          padrao: 'primario',
          opcoes: OPCOES_TIPO,
          descricao:
            'Primário (cheio), Secundário (contorno) ou Fantasma (só o conteúdo). No Figma é um eixo de variante.',
          grupo: 'components',
          secao: 'aparencia',
          vinculos: [
            {
              propriedade: 'data-tipo',
              alvo: { tipo: 'atributo', seletor: `.${C}`, atributo: 'data-tipo' },
            },
          ],
        })
      : undefined;
  const idDe = (ref: KcxRef<string>) => (ref as { $var: string }).$var;
  /** Cor do token com transparência: variável derivada no Figma, color-mix no CSS. */
  const translucida = (
    base: { ref: KcxRef<string>; css: string },
    pct: number | undefined,
    nome: string,
  ): { ref: KcxRef<string>; css: string } =>
    pct === undefined || pct >= 100
      ? base
      : {
          ref: {
            $derivado: idDe(base.ref),
            nome,
            transformar: [{ op: 'alpha', valor: pct / 100 }],
          } as never,
          css: `color-mix(in srgb, ${base.css} ${pct}%, transparent)`,
        };
  /** Cor que muda com o Tipo: o fundo da principal vira contorno/conteúdo. */
  const porTipo = (
    nome: string,
    normal: string,
    alt: string,
    alphas?: Record<string, number>,
  ): KcxRef<string> =>
    ({
      $derivado: eixoTipo!,
      nome,
      transformar: [
        { op: 'variavelPorOpcao', variaveis: { primario: normal, secundario: alt, fantasma: alt } },
        ...(alphas ? [{ op: 'alphaPorOpcao', variavel: eixoTipo!, valores: alphas }] : []),
      ],
    }) as never;
  const ordemEsp = [...CHAVES_ESPACO];
  const vizinho = (k: ChaveEspaco, d: -1 | 1): ChaveEspaco =>
    ordemEsp[Math.min(ordemEsp.length - 1, Math.max(0, ordemEsp.indexOf(k) + d))];
  /** Espaço da principal que cresce/encolhe com o Tamanho (um passo da escala). */
  const espacoTam = (k: ChaveEspaco, nome: string): { ref: KcxRef<number>; css: string } => {
    const base = espaco(k);
    if (!eixoTam) return base;
    return {
      ref: {
        $derivado: eixoTam,
        nome,
        transformar: [
          {
            op: 'mapa',
            valores: {
              p: String(f.espacos[vizinho(k, -1)]),
              m: String(f.espacos[k]),
              g: String(f.espacos[vizinho(k, 1)]),
            },
          },
        ],
      } as never,
      css: base.css,
    };
  };
  const tamTexto = (n: NivelTexto, id: string): { ref: KcxRef<number>; css: string; t: number } => {
    const base = tamanhoTexto(n);
    const t = f.texto[n].tamanho;
    if (!eixoTam) return { ...base, t };
    return {
      ref: {
        $derivado: eixoTam,
        nome: `texto-${id}`,
        transformar: [
          {
            op: 'mapa',
            valores: Object.fromEntries(
              Object.entries(ESCALA_TAMANHO).map(([k, x]) => [k, String(Math.round(t * x))]),
            ),
          },
        ],
      } as never,
      css: base.css,
      t,
    };
  };
  const cssEixos: string[] = [];
  const classe = (c: CamadaMontada, raiz: boolean) => (raiz ? C : `${C}__${c.id}`);

  const html = (c: CamadaMontada, raiz = false, nivel = 1): string => {
    const cl = classe(c, raiz);
    const pad = '  '.repeat(nivel);
    if (c.tipo === 'texto') {
      const n = c.nivel ?? 'corpo';
      const tag = n === 'h1' || n === 'h2' || n === 'h3' ? n : n === 'display' ? 'h1' : 'p';
      return `<${tag} class="${cl}">${escHtml(b.texto(c.id))}</${tag}>`;
    }
    if (c.tipo === 'icone') return b.svgKcx(c.icone ?? 'estrela', cl, c.tamanho ?? 20);
    if (c.tipo === 'imagem')
      return `<img class="${cl}" src="${escHtml(c.url || '')}" alt="${escHtml(c.nome)}" loading="lazy">`;
    const filhos = (c.filhos ?? []).map((x) => `${pad}  ${html(x, false, nivel + 1)}`).join('\n');
    const dados =
      raiz && (eixoTam || eixoTipo)
        ? `${eixoTipo ? ' data-tipo="primario"' : ''}${eixoTam ? ' data-tamanho="m"' : ''}`
        : '';
    const tag = (raiz && m.interativo ? 'button type="button"' : 'div') + dados;
    const fecha = raiz && m.interativo ? 'button' : 'div';
    return `<${tag} class="${cl}">\n${filhos}\n${pad}</${fecha}>`;
  };

  const no = (c: CamadaMontada, raiz = false): KcxNo => {
    const sel = `.${classe(c, raiz)}`;
    if (c.tipo === 'texto') {
      const n = c.nivel ?? 'corpo';
      const e = f.texto[n];
      const tam = tamTexto(n, c.id);
      const corBase = cor(c.cor ?? 'texto');
      const muda = eixoTipo && c.cor === 'sobre-primaria';
      const k = muda
        ? {
            ref: porTipo(`cor-${c.id}`, idDe(corBase.ref), idDe(cor(fundoRaiz!).ref)),
            css: corBase.css,
          }
        : corBase;
      if (muda)
        cssEixos.push(
          `.${C}[data-tipo='secundario'] ${sel}, .${C}[data-tipo='fantasma'] ${sel} { color: ${cor(fundoRaiz!).css}; }`,
        );
      if (eixoTam)
        for (const [kk, x] of Object.entries(ESCALA_TAMANHO))
          if (kk !== 'm')
            cssEixos.push(
              `.${C}[data-tamanho='${kk}'] ${sel} { font-size: ${Math.round(tam.t * x)}px; }`,
            );
      cssPartes.push(
        `${sel} { margin: 0; font-family: '${f.fontes[e.familia]}', system-ui, sans-serif; font-weight: ${e.peso}; font-size: ${tam.css}; line-height: ${e.altura}; letter-spacing: ${e.espacamento}px; color: ${k.css}; }`,
      );
      const t = b.noTexto(c.id, c.nome, {
        tamanho: tam.ref,
        estilo: estiloDoPeso(e.peso),
        cor: k.ref,
      });
      return { ...t, texto: { ...t.texto!, familia: f.fontes[e.familia] } };
    }
    if (c.tipo === 'icone') {
      const corBase = cor(c.cor ?? 'primaria');
      const muda = eixoTipo && c.cor === 'sobre-primaria';
      const k = muda
        ? {
            ref: porTipo(`cor-${c.id}`, idDe(corBase.ref), idDe(cor(fundoRaiz!).ref)),
            css: corBase.css,
          }
        : corBase;
      if (muda)
        cssEixos.push(
          `.${C}[data-tipo='secundario'] ${sel}, .${C}[data-tipo='fantasma'] ${sel} { color: ${cor(fundoRaiz!).css}; }`,
        );
      cssPartes.push(`${sel} { flex: none; color: ${k.css}; }`);
      return b.noIcone(c.id, c.nome, c.icone ?? 'estrela', k.ref, c.tamanho ?? 20, {
        troca: c.nome,
      });
    }
    if (c.tipo === 'imagem') {
      const L = c.largura || 280;
      const A = c.altura || 160;
      const r = c.raio ? raio(c.raio) : null;
      b.extra({
        id: `imagem${pascal(c.id)}`,
        nome: `${c.nome} (URL)`,
        tipo: 'string',
        padrao: c.url ?? '',
        descricao:
          'Endereço da imagem (https://… ou data:). No Figma, arraste a foto para a camada.',
        grupo: 'components',
        secao: 'aparencia',
        vinculos: [
          { propriedade: 'src', alvo: { tipo: 'atributo', seletor: sel, atributo: 'src' } },
        ],
      });
      cssPartes.push(
        `${sel} { display: block; flex: none; width: ${L}px; height: ${A}px; object-fit: cover;${r ? ` border-radius: ${r.css};` : ''} background: ${cor('superficie').css}; }`,
      );
      return {
        id: c.id,
        nome: c.nome,
        tipo: 'retangulo',
        largura: L,
        altura: A,
        ...(r ? { raio: r.ref } : {}),
        preenchimentos: [{ tipo: 'solido', cor: cor('superficie').ref }],
      };
    }
    // caixa
    const dir = c.direcao ?? 'vertical';
    const esp = c.espaco ? espaco(c.espaco) : null;
    const px = c.padX ? (raiz ? espacoTam(c.padX, 'pad-x') : espaco(c.padX)) : null;
    const py = c.padY ? (raiz ? espacoTam(c.padY, 'pad-y') : espaco(c.padY)) : null;
    const tipoAqui = raiz && !!eixoTipo;
    const fundoBase = c.fundo ? cor(c.fundo) : null;
    const opFundo = (c.opacidadeFundo ?? 100) / 100;
    const fundo =
      fundoBase && tipoAqui
        ? {
            ref: porTipo('fundo-tipo', idDe(fundoBase.ref), idDe(fundoBase.ref), {
              primario: opFundo,
              secundario: 0,
              fantasma: 0,
            }),
            css: translucida(fundoBase, c.opacidadeFundo, 'x').css,
          }
        : fundoBase
          ? translucida(fundoBase, c.opacidadeFundo, `fundo-${c.id}`)
          : null;
    const borda =
      tipoAqui && fundoBase
        ? {
            ref: porTipo('borda-tipo', idDe(fundoBase.ref), idDe(fundoBase.ref), {
              primario: 0,
              secundario: 1,
              fantasma: 0,
            }),
            css: 'transparent',
          }
        : c.borda
          ? translucida(cor(c.borda), c.opacidadeBorda, `borda-${c.id}`)
          : null;
    if (raiz && eixoTam && (c.padX || c.padY))
      for (const kk of ['p', 'g'] as const) {
        const d = kk === 'p' ? -1 : 1;
        const y = c.padY ? espaco(vizinho(c.padY, d)).css : '0';
        const x = c.padX ? espaco(vizinho(c.padX, d)).css : '0';
        cssEixos.push(`.${C}[data-tamanho='${kk}'] { padding: ${y} ${x}; }`);
      }
    if (tipoAqui && fundoBase)
      cssEixos.push(
        `.${C}[data-tipo='secundario'] { background: transparent; border-color: ${fundoBase.css}; }`,
        `.${C}[data-tipo='fantasma'] { background: transparent; border-color: transparent; }`,
      );
    const r = c.raio ? raio(c.raio) : null;
    const s = c.sombra ? sombra(c.sombra) : null;
    const blur = c.desfoque ? DESFOQUES[c.desfoque] : 0;
    const alinhar = c.alinhar ?? (dir === 'vertical' ? 'inicio' : 'centro');
    const ai = { inicio: 'flex-start', centro: 'center', fim: 'flex-end' }[alinhar];
    cssPartes.push(
      [
        `${sel} { display: flex; flex-direction: ${dir === 'vertical' ? 'column' : 'row'}; align-items: ${ai};${c.distribuir ? ' justify-content: space-between;' : ''}`,
        esp ? ` gap: ${esp.css};` : '',
        px || py ? ` padding: ${py?.css ?? '0'} ${px?.css ?? '0'};` : '',
        fundo ? ` background: ${fundo.css};` : '',
        borda ? ` border: 1px solid ${borda.css};` : ' border: 0;',
        r ? ` border-radius: ${r.css};` : '',
        s ? ` box-shadow: ${s.css};` : '',
        blur ? ` -webkit-backdrop-filter: blur(${blur}px); backdrop-filter: blur(${blur}px);` : '',
        c.largura ? ` width: ${c.largura}px;` : '',
        c.altura ? ` min-height: ${c.altura}px;` : '',
        raiz ? ' position: relative; text-align: left; font: inherit; color: inherit;' : '',
        ' }',
      ].join(''),
    );
    const filhos = (c.filhos ?? []).map((x) => no(x));
    const efeitos: KcxEfeito[] = [];
    if (s) efeitos.push(s.efeito);
    // O raio do Background blur no Figma é o dobro do blur() do CSS.
    if (blur) efeitos.push({ tipo: 'desfoque-fundo', raio: blur * 2 });
    if (raiz && ds) efeitos.push(ds.efeitoAnel(b.cor('primaria')));
    return b.pilha(
      c.id,
      c.nome,
      dir,
      raiz && ds ? [ds.noRealce(b.cor('texto')), ...filhos] : filhos,
      {
        ...(esp ? { espaco: esp.ref } : {}),
        ...(px ? { px: px.ref } : {}),
        ...(py ? { py: py.ref } : {}),
        alinhar,
        ...(c.distribuir ? { distribuir: true } : {}),
        ...(c.largura ? { largura: c.largura } : {}),
        ...(c.altura ? { altura: c.altura } : {}),
        ...(r ? { raio: r.ref } : {}),
        preenchimentos: fundo ? [{ tipo: 'solido', cor: fundo.ref }] : [],
        ...(borda ? { traco: { cor: borda.ref, espessura: 1 } } : {}),
        ...(efeitos.length ? { efeitos } : {}),
        ...(raiz && ds ? { opacidade: { $var: ds.opacidade } } : {}),
      },
    );
  };

  const estrutura = no(m.raiz, true);
  const css = [...cssPartes, ...cssEixos, ...(ds ? [ds.css(`.${C}`, b.v('primaria'))] : [])].join(
    '\n',
  );
  return {
    html: html(m.raiz, true),
    css,
    estrutura: { ...estrutura, nome: cfg.nome },
    ...(ds ? { estados: ds.estados(), interacoes: ds.interacoes(m.raiz.id) } : {}),
    eixos: [eixoTipo, eixoTam].filter((x): x is string => !!x),
    animacao: {
      nome: 'Estados',
      tecnica: 'css-transition' as const,
      variaveis: ['duracao', 'easing'],
      descricao: m.interativo
        ? 'Realce no hover e no clique, anel de foco e opacidade no desativado.'
        : 'Componente estático.',
    },
    editavel: [
      'Camadas com Auto Layout, cores, raios, espaços e textos ligados aos tokens da fundação',
      ...(m.interativo ? ['Variantes Padrão, Hover, Pressionado, Foco e Desativado'] : []),
      ...(eixoTipo ? ['Eixo Tipo: Primário, Secundário (contorno) e Fantasma'] : []),
      ...(eixoTam ? ['Eixo Tamanho: P, M e G (margem interna e textos)'] : []),
      ...(temVidro(m.raiz)
        ? ['Vidro: fundo e borda translúcidos (variáveis com transparência) e Background blur']
        : []),
    ],
    tags: ['montado', slug(cfg.nome)],
  };
}
