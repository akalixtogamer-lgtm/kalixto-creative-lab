/**
 * Mapa de navegação (as páginas e os links entre elas) e fluxos de
 * interação (o passo a passo de uma tarefa: telas, ações e decisões).
 *
 * TS puro: calcula o layout e desenha em SVG. O mesmo diagrama vai para a
 * página, para o arquivo .svg e (como .kcx-diagrama.json) para o Figma.
 */

export interface PaginaMapa {
  id: string;
  nome: string;
  /** Nomes das seções (componentes) da página, de cima para baixo. */
  secoes: string[];
}

export interface Ligacao {
  id: string;
  de: string;
  para: string;
  /** O que a pessoa faz para ir: "Clique em Comprar", "Menu → Sobre". */
  gatilho: string;
}

export type TipoPasso = 'inicio' | 'tela' | 'acao' | 'decisao' | 'fim';

export interface Passo {
  id: string;
  tipo: TipoPasso;
  rotulo: string;
  /** Página das Telas (só para tipo "tela"). */
  telaId?: string;
  /** Próximo passo; ausente = o seguinte da lista. */
  proximo?: string;
  /** Decisão: para onde vai no "sim" e no "não". */
  sim?: string;
  nao?: string;
}

export interface Fluxo {
  id: string;
  nome: string;
  /** O que a pessoa quer conseguir (ex.: "Comprar um ingresso"). */
  objetivo: string;
  passos: Passo[];
}

export interface Navegacao {
  /** Página de entrada (padrão: a primeira). */
  inicio?: string;
  ligacoes: Ligacao[];
  fluxos: Fluxo[];
}

export const TIPOS_PASSO: Record<TipoPasso, { nome: string; dica: string }> = {
  inicio: { nome: 'Início', dica: 'Onde a tarefa começa (ex.: "Abre o app").' },
  tela: { nome: 'Tela', dica: 'Uma página das Telas que a pessoa vê.' },
  acao: { nome: 'Ação', dica: 'O que a pessoa faz (ex.: "Toca em Comprar").' },
  decisao: { nome: 'Decisão', dica: 'Uma pergunta com dois caminhos: sim e não.' },
  fim: { nome: 'Fim', dica: 'A tarefa concluída (ou abandonada).' },
};

export const LIMITE_LIGACOES = 200;
export const LIMITE_PASSOS = 60;
export const LIMITE_FLUXOS = 20;

let contador = 0;
export function novoId(prefixo: string): string {
  contador = (contador + 1) % 1e6;
  return `${prefixo}-${Date.now().toString(36)}${contador.toString(36)}`;
}

export function navegacaoVazia(): Navegacao {
  return { ligacoes: [], fluxos: [] };
}

/* ============================ Leitura segura ============================ */

const texto = (x: unknown, max = 120) => (typeof x === 'string' ? x.slice(0, max) : '');
const TIPOS = Object.keys(TIPOS_PASSO) as TipoPasso[];

/** Aceita um objeto qualquer (do localStorage ou de um arquivo) e devolve só o que é válido. */
export function lerNavegacao(dado: unknown): Navegacao {
  const o = (dado && typeof dado === 'object' ? dado : {}) as Record<string, unknown>;
  const ligacoes = (Array.isArray(o['ligacoes']) ? o['ligacoes'] : [])
    .slice(0, LIMITE_LIGACOES)
    .map((l: Record<string, unknown>) => ({
      id: texto(l?.['id'], 60) || novoId('lig'),
      de: texto(l?.['de'], 80),
      para: texto(l?.['para'], 80),
      gatilho: texto(l?.['gatilho']),
    }))
    .filter((l) => l.de && l.para);
  const fluxos = (Array.isArray(o['fluxos']) ? o['fluxos'] : [])
    .slice(0, LIMITE_FLUXOS)
    .map((f: Record<string, unknown>) => ({
      id: texto(f?.['id'], 60) || novoId('fluxo'),
      nome: texto(f?.['nome'], 80) || 'Fluxo',
      objetivo: texto(f?.['objetivo'], 200),
      passos: (Array.isArray(f?.['passos']) ? (f['passos'] as Record<string, unknown>[]) : [])
        .slice(0, LIMITE_PASSOS)
        .map((p) => {
          const tipo = TIPOS.includes(p?.['tipo'] as TipoPasso) ? (p['tipo'] as TipoPasso) : 'acao';
          const passo: Passo = {
            id: texto(p?.['id'], 60) || novoId('p'),
            tipo,
            rotulo: texto(p?.['rotulo']),
          };
          for (const k of ['telaId', 'proximo', 'sim', 'nao'] as const) {
            const v = texto(p?.[k], 80);
            if (v) passo[k] = v;
          }
          return passo;
        }),
    }));
  const inicio = texto(o['inicio'], 80) || undefined;
  return { inicio, ligacoes, fluxos };
}

/* ============================== Análise ============================== */

export interface AvisoNav {
  nivel: 'erro' | 'aviso' | 'dica';
  texto: string;
  /** Página ou passo a que se refere. */
  alvo?: string;
}

function saidas(ligacoes: Ligacao[]): Map<string, string[]> {
  const m = new Map<string, string[]>();
  for (const l of ligacoes) m.set(l.de, [...(m.get(l.de) ?? []), l.para]);
  return m;
}

/** Cliques (menor caminho) do início até cada página. */
export function distancias(inicio: string, ligacoes: Ligacao[]): Map<string, number> {
  const s = saidas(ligacoes);
  const d = new Map([[inicio, 0]]);
  const fila = [inicio];
  while (fila.length) {
    const a = fila.shift()!;
    for (const b of s.get(a) ?? [])
      if (!d.has(b)) {
        d.set(b, d.get(a)! + 1);
        fila.push(b);
      }
  }
  return d;
}

export function inicioDe(paginas: PaginaMapa[], nav: Navegacao): string | undefined {
  return paginas.find((p) => p.id === nav.inicio)?.id ?? paginas[0]?.id;
}

/** Só as ligações entre páginas que ainda existem. */
export function ligacoesValidas(paginas: PaginaMapa[], nav: Navegacao): Ligacao[] {
  const ids = new Set(paginas.map((p) => p.id));
  return nav.ligacoes.filter((l) => ids.has(l.de) && ids.has(l.para) && l.de !== l.para);
}

export function analisarMapa(paginas: PaginaMapa[], nav: Navegacao): AvisoNav[] {
  const av: AvisoNav[] = [];
  const inicio = inicioDe(paginas, nav);
  if (!inicio) return [{ nivel: 'dica', texto: 'Crie páginas nas Telas para montar o mapa.' }];
  if (paginas.length === 1)
    return [{ nivel: 'dica', texto: 'Com mais de uma página, ligue-as para formar o mapa.' }];
  const ligs = ligacoesValidas(paginas, nav);
  if (!ligs.length)
    av.push({
      nivel: 'dica',
      texto: 'Nenhuma ligação ainda: diga como se vai de uma página a outra.',
    });
  const d = distancias(inicio, ligs);
  const s = saidas(ligs);
  for (const p of paginas) {
    if (p.id === inicio) continue;
    if (!d.has(p.id))
      av.push({
        nivel: 'erro',
        texto: `"${p.nome}" não tem caminho a partir do início: ninguém chega nela.`,
        alvo: p.id,
      });
    else if (d.get(p.id)! > 3)
      av.push({
        nivel: 'aviso',
        texto: `"${p.nome}" fica a ${d.get(p.id)} cliques do início (o ideal é até 3).`,
        alvo: p.id,
      });
  }
  for (const p of paginas)
    if (ligs.length && !s.get(p.id)?.length)
      av.push({
        nivel: 'aviso',
        texto: `"${p.nome}" não leva a lugar nenhum: inclua um voltar ou o menu.`,
        alvo: p.id,
      });
  return av;
}

/** Arestas de um fluxo, com o "próximo" padrão (o passo seguinte da lista). */
export function arestasDoFluxo(f: Fluxo): { de: string; para: string; rotulo: string }[] {
  const ids = new Set(f.passos.map((p) => p.id));
  const r: { de: string; para: string; rotulo: string }[] = [];
  f.passos.forEach((p, i) => {
    if (p.tipo === 'fim') return;
    if (p.tipo === 'decisao') {
      if (p.sim && ids.has(p.sim)) r.push({ de: p.id, para: p.sim, rotulo: 'Sim' });
      if (p.nao && ids.has(p.nao)) r.push({ de: p.id, para: p.nao, rotulo: 'Não' });
      return;
    }
    const prox = p.proximo && ids.has(p.proximo) ? p.proximo : f.passos[i + 1]?.id;
    if (prox && prox !== p.id) r.push({ de: p.id, para: prox, rotulo: '' });
  });
  return r;
}

export function analisarFluxo(f: Fluxo, paginas: PaginaMapa[]): AvisoNav[] {
  const av: AvisoNav[] = [];
  if (!f.passos.length) return [{ nivel: 'dica', texto: 'Adicione os passos do fluxo.' }];
  const inicio = f.passos.find((p) => p.tipo === 'inicio');
  if (!inicio) av.push({ nivel: 'aviso', texto: 'O fluxo não tem um passo de Início.' });
  if (!f.passos.some((p) => p.tipo === 'fim'))
    av.push({ nivel: 'aviso', texto: 'O fluxo não tem um Fim: onde a tarefa termina?' });
  const ar = arestasDoFluxo(f);
  const raiz = inicio?.id ?? f.passos[0].id;
  const alcance = distancias(
    raiz,
    ar.map((a, i) => ({ id: String(i), de: a.de, para: a.para, gatilho: '' })),
  );
  const ids = new Set(paginas.map((p) => p.id));
  for (const p of f.passos) {
    const nome = p.rotulo || TIPOS_PASSO[p.tipo].nome;
    if (!alcance.has(p.id))
      av.push({
        nivel: 'erro',
        texto: `"${nome}" não é alcançado por nenhum caminho.`,
        alvo: p.id,
      });
    if (p.tipo === 'decisao' && (!p.sim || !p.nao))
      av.push({
        nivel: 'aviso',
        texto: `A decisão "${nome}" precisa dos dois caminhos (sim e não).`,
        alvo: p.id,
      });
    if (p.tipo === 'tela' && p.telaId && !ids.has(p.telaId))
      av.push({
        nivel: 'aviso',
        texto: `"${nome}" aponta para uma página que foi apagada.`,
        alvo: p.id,
      });
  }
  const acoes = f.passos.filter((p) => p.tipo === 'acao').length;
  if (acoes > 7)
    av.push({
      nivel: 'dica',
      texto: `São ${acoes} ações até o fim. Dá para juntar ou pular alguma?`,
    });
  return av;
}

/**
 * Fluxo pelo menor caminho do mapa entre duas páginas:
 * Início → Tela → Ação (o gatilho da ligação) → Tela … → Fim.
 */
export function fluxoDoCaminho(
  paginas: PaginaMapa[],
  nav: Navegacao,
  de: string,
  para: string,
  nome: string,
): Fluxo | null {
  const ligs = ligacoesValidas(paginas, nav);
  const anterior = new Map<string, Ligacao>();
  const vistos = new Set([de]);
  const fila = [de];
  while (fila.length && !vistos.has(para)) {
    const a = fila.shift()!;
    for (const l of ligs)
      if (l.de === a && !vistos.has(l.para)) {
        vistos.add(l.para);
        anterior.set(l.para, l);
        fila.push(l.para);
      }
  }
  if (de !== para && !anterior.has(para)) return null;
  const caminho: Ligacao[] = [];
  for (let x = para; x !== de; x = anterior.get(x)!.de) caminho.unshift(anterior.get(x)!);
  const nomeDe = (id: string) => paginas.find((p) => p.id === id)?.nome ?? 'Página';
  const passos: Passo[] = [
    { id: novoId('p'), tipo: 'inicio', rotulo: `Chega em ${nomeDe(de)}` },
    { id: novoId('p'), tipo: 'tela', rotulo: nomeDe(de), telaId: de },
  ];
  for (const l of caminho) {
    passos.push({
      id: novoId('p'),
      tipo: 'acao',
      rotulo: l.gatilho || `Vai para ${nomeDe(l.para)}`,
    });
    passos.push({ id: novoId('p'), tipo: 'tela', rotulo: nomeDe(l.para), telaId: l.para });
  }
  passos.push({ id: novoId('p'), tipo: 'fim', rotulo: nome || 'Concluído' });
  return {
    id: novoId('fluxo'),
    nome: nome || `${nomeDe(de)} → ${nomeDe(para)}`,
    objetivo: '',
    passos,
  };
}

/* =============================== Layout =============================== */

export type FormaNo = 'pagina' | 'pilula' | 'retangulo' | 'losango' | 'tela';

export interface NoDiagrama {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  forma: FormaNo;
  titulo: string;
  /** Linhas menores (seções da página). */
  linhas: string[];
  /** Selo acima do título (ex.: "INÍCIO", "TELA"). */
  etiqueta?: string;
  estado?: 'inicio' | 'erro' | 'aviso';
}

export interface ArestaDiagrama {
  de: string;
  para: string;
  rotulo: string;
  /** Caminho SVG (curva). */
  d: string;
  /** Posição do rótulo. */
  lx: number;
  ly: number;
  /** Ponta da seta e o ângulo (graus) em que ela aponta. */
  ponta: { x: number; y: number; angulo: number };
  /** Volta para trás (link para uma página já vista): tracejada. */
  volta: boolean;
}

export interface Diagrama {
  nome: string;
  tipo: 'mapa' | 'fluxo';
  largura: number;
  altura: number;
  nos: NoDiagrama[];
  arestas: ArestaDiagrama[];
}

const MARGEM = 48;
const VAO_X = 56;
const VAO_Y = 96;

/** Quebra um texto em linhas de até `max` caracteres (no máximo `linhas`). */
export function quebrar(t: string, max: number, linhas = 3): string[] {
  const palavras = t.trim().split(/\s+/).filter(Boolean);
  const saida: string[] = [];
  let atual = '';
  for (const p of palavras) {
    const tentativa = atual ? `${atual} ${p}` : p;
    if (tentativa.length <= max) atual = tentativa;
    else {
      if (atual) saida.push(atual);
      atual = p.length > max ? p.slice(0, max - 1) + '…' : p;
    }
    if (saida.length === linhas) break;
  }
  if (atual && saida.length < linhas) saida.push(atual);
  if (saida.length === linhas && palavras.join(' ').length > saida.join(' ').length) {
    const u = saida[linhas - 1];
    saida[linhas - 1] = (u.length >= max ? u.slice(0, max - 1) : u) + '…';
  }
  return saida.length ? saida : [''];
}

interface Caixa {
  id: string;
  w: number;
  h: number;
}

/**
 * Camadas de cima para baixo: no mapa, a distância em cliques do início;
 * no fluxo, o caminho mais longo (para que juntar caminhos não suba a seta).
 */
function camadas(
  caixas: Caixa[],
  arestas: { de: string; para: string }[],
  raiz: string,
  modo: 'curto' | 'longo',
): Map<string, number> {
  const ids = caixas.map((c) => c.id);
  const sai = new Map<string, string[]>();
  for (const a of arestas) sai.set(a.de, [...(sai.get(a.de) ?? []), a.para]);
  const nivel = new Map<string, number>();
  if (modo === 'curto') {
    for (const [k, v] of distancias(
      raiz,
      arestas.map((a, i) => ({ id: String(i), de: a.de, para: a.para, gatilho: '' })),
    ))
      nivel.set(k, v);
  } else {
    // Arestas de avanço (sem as que fecham ciclo), depois caminho mais longo.
    const avanco: { de: string; para: string }[] = [];
    const estado = new Map<string, 1 | 2>();
    const visitar = (a: string) => {
      estado.set(a, 1);
      for (const b of sai.get(a) ?? []) {
        if (estado.get(b) === 1) continue; // ciclo: volta
        avanco.push({ de: a, para: b });
        if (!estado.has(b)) visitar(b);
      }
      estado.set(a, 2);
    };
    visitar(raiz);
    nivel.set(raiz, 0);
    let mudou = true;
    for (let volta = 0; mudou && volta < ids.length + 1; volta++) {
      mudou = false;
      for (const a of avanco) {
        const n = (nivel.get(a.de) ?? 0) + 1;
        if (nivel.has(a.de) && (nivel.get(a.para) ?? -1) < n) {
          nivel.set(a.para, n);
          mudou = true;
        }
      }
    }
  }
  // Quem não foi alcançado vai para uma camada à parte, no fim.
  const ultimo = Math.max(-1, ...nivel.values());
  for (const id of ids) if (!nivel.has(id)) nivel.set(id, ultimo + 1);
  return nivel;
}

function posicionar(
  caixas: Caixa[],
  arestas: { de: string; para: string }[],
  nivel: Map<string, number>,
): Map<string, { x: number; y: number }> {
  const porNivel: Caixa[][] = [];
  for (const c of caixas) (porNivel[nivel.get(c.id)!] ??= []).push(c);
  const filas = porNivel.filter(Boolean);
  // Ordena cada camada pela posição média de quem aponta para ela (uma passada).
  const ordem = new Map<string, number>();
  filas[0]?.forEach((c, i) => ordem.set(c.id, i));
  for (let k = 1; k < filas.length; k++) {
    const media = (id: string) => {
      const pais = arestas
        .filter((a) => a.para === id && ordem.has(a.de))
        .map((a) => ordem.get(a.de)!);
      return pais.length ? pais.reduce((s, x) => s + x, 0) / pais.length : Infinity;
    };
    filas[k] = filas[k]
      .map((c, i) => ({ c, m: media(c.id), i }))
      .sort((a, b) => a.m - b.m || a.i - b.i)
      .map((x) => x.c);
    filas[k].forEach((c, i) => ordem.set(c.id, i));
  }
  const larguras = filas.map((f) => f.reduce((s, c) => s + c.w, 0) + VAO_X * (f.length - 1));
  const maior = Math.max(0, ...larguras);
  const pos = new Map<string, { x: number; y: number }>();
  let y = MARGEM;
  filas.forEach((f, k) => {
    let x = MARGEM + (maior - larguras[k]) / 2;
    const alt = Math.max(...f.map((c) => c.h));
    for (const c of f) {
      pos.set(c.id, { x, y: y + (alt - c.h) / 2 });
      x += c.w + VAO_X;
    }
    y += alt + VAO_Y;
  });
  return pos;
}

const r1 = (n: number) => Math.round(n * 10) / 10;

/** Curva entre dois nós, com a ponta da seta e o lugar do rótulo. */
function curva(
  a: NoDiagrama,
  b: NoDiagrama,
  indice: number,
): Omit<ArestaDiagrama, 'de' | 'para' | 'rotulo'> {
  const desce = b.y > a.y + a.h - 1;
  let p0: [number, number], c1: [number, number], c2: [number, number], p3: [number, number];
  let volta = false;
  if (desce) {
    p0 = [a.x + a.w / 2, a.y + a.h];
    p3 = [b.x + b.w / 2, b.y];
    const dy = Math.max(40, (p3[1] - p0[1]) / 2);
    c1 = [p0[0], p0[1] + dy];
    c2 = [p3[0], p3[1] - dy];
  } else {
    // Mesma camada ou acima: sai pela lateral e entra pela lateral.
    volta = b.y < a.y - 1;
    const direita = volta || b.x >= a.x;
    const sx = direita ? a.x + a.w : a.x;
    const ex = volta ? (direita ? b.x + b.w : b.x) : direita ? b.x : b.x + b.w;
    p0 = [sx, a.y + a.h / 2 + (indice % 3) * 8 - 8];
    p3 = [ex, b.y + b.h / 2 + (indice % 3) * 8 - 8];
    const fora = 70 + (indice % 3) * 24;
    if (volta) {
      const lado = direita ? 1 : -1;
      const x = (direita ? Math.max(a.x + a.w, b.x + b.w) : Math.min(a.x, b.x)) + lado * fora;
      c1 = [x, p0[1]];
      c2 = [x, p3[1]];
    } else {
      const meio = (p0[0] + p3[0]) / 2;
      c1 = [meio, p0[1] - 30];
      c2 = [meio, p3[1] - 30];
    }
  }
  const t = 0.5;
  const mt = 1 - t;
  const bz = (i: 0 | 1) =>
    mt ** 3 * p0[i] + 3 * mt ** 2 * t * c1[i] + 3 * mt * t ** 2 * c2[i] + t ** 3 * p3[i];
  const angulo = (Math.atan2(p3[1] - c2[1], p3[0] - c2[0]) * 180) / Math.PI;
  return {
    d: `M${r1(p0[0])} ${r1(p0[1])} C${r1(c1[0])} ${r1(c1[1])} ${r1(c2[0])} ${r1(c2[1])} ${r1(p3[0])} ${r1(p3[1])}`,
    lx: r1(bz(0)),
    ly: r1(bz(1)),
    ponta: { x: r1(p3[0]), y: r1(p3[1]), angulo: r1(angulo) },
    volta,
  };
}

function montar(
  nome: string,
  tipo: Diagrama['tipo'],
  nos: Omit<NoDiagrama, 'x' | 'y'>[],
  arestas: { de: string; para: string; rotulo: string }[],
  raiz: string,
): Diagrama {
  const nivel = camadas(nos, arestas, raiz, tipo === 'mapa' ? 'curto' : 'longo');
  const pos = posicionar(nos, arestas, nivel);
  const prontos: NoDiagrama[] = nos.map((n) => ({ ...n, ...pos.get(n.id)! }));
  const porId = new Map(prontos.map((n) => [n.id, n]));
  const saidas = arestas.map((a, i) => ({
    de: a.de,
    para: a.para,
    rotulo: a.rotulo,
    ...curva(porId.get(a.de)!, porId.get(a.para)!, i),
  }));
  const xs = [
    ...prontos.map((n) => n.x + n.w),
    ...saidas.flatMap((a) => [...a.d.matchAll(/(-?[\d.]+) (-?[\d.]+)/g)].map((m) => +m[1])),
  ];
  const ys = prontos.map((n) => n.y + n.h);
  return {
    nome,
    tipo,
    largura: Math.ceil(Math.max(320, ...xs) + MARGEM),
    altura: Math.ceil(Math.max(200, ...ys) + MARGEM),
    nos: prontos,
    arestas: saidas,
  };
}

/** Diagrama do mapa: uma caixa por página (com as seções), setas com o gatilho. */
export function diagramaDoMapa(
  paginas: PaginaMapa[],
  nav: Navegacao,
  nome = 'Mapa de navegação',
): Diagrama {
  const inicio = inicioDe(paginas, nav);
  const ligs = ligacoesValidas(paginas, nav);
  const avisos = analisarMapa(paginas, nav);
  const nos = paginas.map((p) => {
    const linhas = p.secoes.slice(0, 6).map((s) => (s.length > 26 ? s.slice(0, 25) + '…' : s));
    if (p.secoes.length > 6) linhas[5] = `+ ${p.secoes.length - 5} seções`;
    if (!linhas.length) linhas.push('(sem seções)');
    const titulo = quebrar(p.nome, 22, 2);
    const erro = avisos.some((a) => a.alvo === p.id && a.nivel === 'erro');
    const aviso = avisos.some((a) => a.alvo === p.id && a.nivel === 'aviso');
    return {
      id: p.id,
      w: 200,
      h: 44 + titulo.length * 18 + linhas.length * 18 + 12,
      forma: 'pagina' as const,
      titulo: titulo.join('\n'),
      linhas,
      etiqueta: p.id === inicio ? 'INÍCIO' : undefined,
      estado:
        p.id === inicio
          ? ('inicio' as const)
          : erro
            ? ('erro' as const)
            : aviso
              ? ('aviso' as const)
              : undefined,
    };
  });
  // Ligações repetidas entre o mesmo par viram uma seta com os gatilhos juntos.
  const pares = new Map<string, { de: string; para: string; rotulo: string }>();
  for (const l of ligs) {
    const k = `${l.de}>${l.para}`;
    const g = l.gatilho.trim();
    const atual = pares.get(k);
    if (atual) atual.rotulo = [atual.rotulo, g].filter(Boolean).join(' / ');
    else pares.set(k, { de: l.de, para: l.para, rotulo: g });
  }
  return montar(nome, 'mapa', nos, [...pares.values()], inicio ?? '');
}

/** Diagrama do fluxo: início/fim em pílula, telas, ações e decisões em losango. */
export function diagramaDoFluxo(f: Fluxo, paginas: PaginaMapa[]): Diagrama {
  const avisos = analisarFluxo(f, paginas);
  const nos = f.passos.map((p) => {
    const base = p.rotulo || TIPOS_PASSO[p.tipo].nome;
    const erro = avisos.some((a) => a.alvo === p.id && a.nivel === 'erro');
    const aviso = avisos.some((a) => a.alvo === p.id && a.nivel === 'aviso');
    const estado = erro ? ('erro' as const) : aviso ? ('aviso' as const) : undefined;
    if (p.tipo === 'decisao') {
      const t = quebrar(base, 16, 3);
      return {
        id: p.id,
        w: 190,
        h: 110,
        forma: 'losango' as const,
        titulo: t.join('\n'),
        linhas: [],
        estado,
      };
    }
    if (p.tipo === 'inicio' || p.tipo === 'fim') {
      const t = quebrar(base, 22, 2);
      return {
        id: p.id,
        w: 190,
        h: 30 + t.length * 18,
        forma: 'pilula' as const,
        titulo: t.join('\n'),
        linhas: [],
        estado: p.tipo === 'inicio' ? ('inicio' as const) : estado,
      };
    }
    const tela = p.tipo === 'tela' ? paginas.find((x) => x.id === p.telaId) : undefined;
    const t = quebrar(base, 22, 3);
    return {
      id: p.id,
      w: 190,
      h: (p.tipo === 'tela' ? 44 : 26) + t.length * 18 + (tela && tela.nome !== base ? 18 : 0),
      forma: p.tipo === 'tela' ? ('tela' as const) : ('retangulo' as const),
      titulo: t.join('\n'),
      linhas: tela && tela.nome !== base ? [tela.nome] : [],
      etiqueta: p.tipo === 'tela' ? 'TELA' : undefined,
      estado,
    };
  });
  const raiz = f.passos.find((p) => p.tipo === 'inicio')?.id ?? f.passos[0]?.id ?? '';
  return montar(f.nome || 'Fluxo', 'fluxo', nos, arestasDoFluxo(f), raiz);
}

/* ================================ SVG ================================ */

export interface CoresDiagrama {
  fundo: string;
  caixa: string;
  borda: string;
  texto: string;
  suave: string;
  acento: string;
  linha: string;
  erro: string;
  aviso: string;
}

export const CORES_ESCURO: CoresDiagrama = {
  fundo: '#0f0e17',
  caixa: '#1d1b2c',
  borda: '#3a3656',
  texto: '#f4f2fb',
  suave: '#a9a4c4',
  acento: '#d4119f',
  linha: '#8f89b3',
  erro: '#f43f5e',
  aviso: '#f59e0b',
};
export const CORES_CLARO: CoresDiagrama = {
  fundo: '#ffffff',
  caixa: '#f4f3f9',
  borda: '#cfcbe0',
  texto: '#1b1830',
  suave: '#5b5677',
  acento: '#b00d84',
  linha: '#6d6890',
  erro: '#e11d48',
  aviso: '#b45309',
};

const escX = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  );
const hexOk = (c: string, padrao: string) => (/^#[0-9a-f]{6}$/i.test(c) ? c : padrao);

/** Cor da borda/realce de um nó conforme o estado. */
export function corDoNo(n: NoDiagrama, c: CoresDiagrama): string {
  return n.estado === 'inicio'
    ? c.acento
    : n.estado === 'erro'
      ? c.erro
      : n.estado === 'aviso'
        ? c.aviso
        : c.borda;
}

/** Desenho em SVG (autônomo). `data-no` em cada nó permite clicar na página. */
export function diagramaSvg(
  d: Diagrama,
  cores: CoresDiagrama = CORES_ESCURO,
  selecionado?: string,
): string {
  const c = Object.fromEntries(
    Object.entries(cores).map(([k, v]) => [
      k,
      hexOk(v, (CORES_ESCURO as unknown as Record<string, string>)[k]),
    ]),
  ) as unknown as CoresDiagrama;
  const fonte = `font-family="Inter, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"`;
  const setas = d.arestas
    .map((a) => {
      const traco = a.volta ? ' stroke-dasharray="6 5"' : '';
      const { x, y, angulo } = a.ponta;
      const rot = a.rotulo
        ? (() => {
            const l = quebrar(a.rotulo, 24, 2);
            const w = Math.max(...l.map((s) => s.length)) * 6.6 + 16;
            const h = l.length * 15 + 8;
            return `<g><rect x="${r1(a.lx - w / 2)}" y="${r1(a.ly - h / 2)}" width="${r1(w)}" height="${h}" rx="6" fill="${c.fundo}" stroke="${c.borda}"/>${l
              .map(
                (s, i) =>
                  `<text x="${a.lx}" y="${r1(a.ly - h / 2 + 16 + i * 15)}" text-anchor="middle" font-size="11.5" fill="${c.suave}">${escX(s)}</text>`,
              )
              .join('')}</g>`;
          })()
        : '';
      return `<g class="aresta"><path d="${a.d}" fill="none" stroke="${c.linha}" stroke-width="1.6"${traco}/><path d="M0 0 L-10 -5 L-10 5 Z" fill="${c.linha}" transform="translate(${x} ${y}) rotate(${angulo})"/>${rot}</g>`;
    })
    .join('');
  const nos = d.nos
    .map((n) => {
      const borda = corDoNo(n, c);
      const larg = n.id === selecionado ? 3 : n.estado ? 2 : 1.2;
      const cx = n.x + n.w / 2;
      const titulo = n.titulo.split('\n');
      let forma: string;
      let ty: number;
      if (n.forma === 'losango') {
        forma = `<polygon points="${cx},${n.y} ${n.x + n.w},${n.y + n.h / 2} ${cx},${n.y + n.h} ${n.x},${n.y + n.h / 2}" fill="${c.caixa}" stroke="${borda}" stroke-width="${larg}"/>`;
        ty = n.y + n.h / 2 - ((titulo.length - 1) * 17) / 2 + 5;
      } else if (n.forma === 'pilula') {
        forma = `<rect x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="${n.h / 2}" fill="${n.estado === 'inicio' ? c.acento : c.caixa}" stroke="${borda}" stroke-width="${larg}"/>`;
        ty = n.y + n.h / 2 - ((titulo.length - 1) * 18) / 2 + 5;
      } else {
        forma = `<rect x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="12" fill="${c.caixa}" stroke="${borda}" stroke-width="${larg}"/>`;
        if (n.forma === 'pagina' || n.forma === 'tela')
          forma += `<path d="M${n.x} ${n.y + 12} a12 12 0 0 1 12 -12 h${n.w - 24} a12 12 0 0 1 12 12 v6 h-${n.w} Z" fill="${borda}" opacity=".55"/><circle cx="${n.x + 12}" cy="${n.y + 9}" r="2.5" fill="${c.texto}" opacity=".6"/><circle cx="${n.x + 21}" cy="${n.y + 9}" r="2.5" fill="${c.texto}" opacity=".6"/>`;
        ty = n.forma === 'retangulo' ? n.y + 22 : n.y + 40;
      }
      const etiqueta =
        n.etiqueta && n.forma !== 'pilula'
          ? `<text x="${n.x + n.w - 12}" y="${n.y + 13}" text-anchor="end" font-size="9.5" font-weight="700" letter-spacing="1" fill="${n.estado === 'inicio' ? c.acento : c.suave}">${escX(n.etiqueta)}</text>`
          : '';
      const centro = n.forma !== 'pagina';
      const corTitulo = n.forma === 'pilula' && n.estado === 'inicio' ? '#ffffff' : c.texto;
      const tt = titulo
        .map(
          (s, i) =>
            `<text x="${centro ? cx : n.x + 14}" y="${r1(ty + i * 18)}"${centro ? ' text-anchor="middle"' : ''} font-size="14" font-weight="600" fill="${corTitulo}">${escX(s)}</text>`,
        )
        .join('');
      const linhasY = ty + titulo.length * 18 + 4;
      const ll = n.linhas
        .map(
          (s, i) =>
            `<text x="${centro ? cx : n.x + 14}" y="${r1(linhasY + i * 18)}"${centro ? ' text-anchor="middle"' : ''} font-size="12" fill="${c.suave}">${centro ? '' : '▪ '}${escX(s)}</text>`,
        )
        .join('');
      return `<g class="no" data-no="${escX(n.id)}" style="cursor:pointer">${forma}${etiqueta}${tt}${ll}</g>`;
    })
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${d.largura}" height="${d.altura}" viewBox="0 0 ${d.largura} ${d.altura}" ${fonte}><title>${escX(d.nome)}</title><rect width="100%" height="100%" fill="${c.fundo}"/>${setas}${nos}</svg>`;
}

/* ============================ Para o Figma ============================ */

export const FORMATO_DIAGRAMA = 'kcx-diagrama';

/** Arquivo .kcx-diagrama.json: o diagrama já com posições, para o Figma Bridge. */
export function arquivoDoDiagrama(d: Diagrama, cores: CoresDiagrama = CORES_ESCURO): string {
  return JSON.stringify({ formato: FORMATO_DIAGRAMA, versao: 1, cores, diagrama: d }, null, 2);
}

/** Lê e valida um .kcx-diagrama.json (usado pelo plugin). */
export function lerArquivoDiagrama(
  textoArquivo: string,
): { diagrama: Diagrama; cores: CoresDiagrama } | { erro: string } {
  let o: Record<string, unknown>;
  try {
    o = JSON.parse(textoArquivo);
  } catch {
    return { erro: 'JSON inválido.' };
  }
  if (o?.['formato'] !== FORMATO_DIAGRAMA) return { erro: 'Não é um diagrama KCX.' };
  const d = o['diagrama'] as Diagrama;
  const num = (n: unknown) => typeof n === 'number' && Number.isFinite(n) && Math.abs(n) < 100000;
  if (!d || !Array.isArray(d.nos) || !Array.isArray(d.arestas) || !num(d.largura) || !num(d.altura))
    return { erro: 'Diagrama incompleto.' };
  if (d.nos.length > 300 || d.arestas.length > 600) return { erro: 'Diagrama grande demais.' };
  const formas: FormaNo[] = ['pagina', 'pilula', 'retangulo', 'losango', 'tela'];
  for (const n of d.nos)
    if (
      ![n.x, n.y, n.w, n.h].every(num) ||
      !formas.includes(n.forma) ||
      typeof n.titulo !== 'string' ||
      !Array.isArray(n.linhas)
    )
      return { erro: 'Caixa inválida no diagrama.' };
  for (const a of d.arestas)
    if (
      typeof a.d !== 'string' ||
      !/^[MCL\d\s.-]+$/.test(a.d) ||
      !num(a.lx) ||
      !num(a.ly) ||
      !num(a.ponta?.x) ||
      !num(a.ponta?.y) ||
      !num(a.ponta?.angulo)
    )
      return { erro: 'Seta inválida no diagrama.' };
  const cin = (o['cores'] ?? {}) as Record<string, unknown>;
  const cores = Object.fromEntries(
    Object.entries(CORES_ESCURO).map(([k, v]) => [
      k,
      typeof cin[k] === 'string' ? hexOk(cin[k] as string, v) : v,
    ]),
  ) as unknown as CoresDiagrama;
  return { diagrama: d, cores };
}
