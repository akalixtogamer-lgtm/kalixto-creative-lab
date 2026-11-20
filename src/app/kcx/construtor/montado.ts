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
  espaco?: ChaveEspaco | null;
  padX?: ChaveEspaco | null;
  padY?: ChaveEspaco | null;
  fundo?: TokenCor | null;
  borda?: TokenCor | null;
  raio?: ChaveRaio | null;
  sombra?: ChaveSombra | null;
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
}

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
  }
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
    const tag = raiz && m.interativo ? 'button type="button"' : 'div';
    const fecha = raiz && m.interativo ? 'button' : 'div';
    return `<${tag} class="${cl}">\n${filhos}\n${pad}</${fecha}>`;
  };

  const no = (c: CamadaMontada, raiz = false): KcxNo => {
    const sel = `.${classe(c, raiz)}`;
    if (c.tipo === 'texto') {
      const n = c.nivel ?? 'corpo';
      const e = f.texto[n];
      const tam = tamanhoTexto(n);
      const k = cor(c.cor ?? 'texto');
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
      const k = cor(c.cor ?? 'primaria');
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
    const px = c.padX ? espaco(c.padX) : null;
    const py = c.padY ? espaco(c.padY) : null;
    const fundo = c.fundo ? cor(c.fundo) : null;
    const borda = c.borda ? cor(c.borda) : null;
    const r = c.raio ? raio(c.raio) : null;
    const s = c.sombra ? sombra(c.sombra) : null;
    const alinhar = c.alinhar ?? (dir === 'vertical' ? 'inicio' : 'centro');
    const ai = { inicio: 'flex-start', centro: 'center', fim: 'flex-end' }[alinhar];
    cssPartes.push(
      [
        `${sel} { display: flex; flex-direction: ${dir === 'vertical' ? 'column' : 'row'}; align-items: ${ai};`,
        esp ? ` gap: ${esp.css};` : '',
        px || py ? ` padding: ${py?.css ?? '0'} ${px?.css ?? '0'};` : '',
        fundo ? ` background: ${fundo.css};` : '',
        borda ? ` border: 1px solid ${borda.css};` : ' border: 0;',
        r ? ` border-radius: ${r.css};` : '',
        s ? ` box-shadow: ${s.css};` : '',
        c.largura ? ` width: ${c.largura}px;` : '',
        c.altura ? ` min-height: ${c.altura}px;` : '',
        raiz ? ' position: relative; text-align: left; font: inherit; color: inherit;' : '',
        ' }',
      ].join(''),
    );
    const filhos = (c.filhos ?? []).map((x) => no(x));
    const efeitos: KcxEfeito[] = [];
    if (s) efeitos.push(s.efeito);
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
  const css = [...cssPartes, ...(ds ? [ds.css(`.${C}`, b.v('primaria'))] : [])].join('\n');
  return {
    html: html(m.raiz, true),
    css,
    estrutura: { ...estrutura, nome: cfg.nome },
    ...(ds ? { estados: ds.estados(), interacoes: ds.interacoes(m.raiz.id) } : {}),
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
    ],
    tags: ['montado', slug(cfg.nome)],
  };
}
