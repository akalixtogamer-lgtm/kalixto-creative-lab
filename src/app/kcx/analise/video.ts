/**
 * Análise temporal de uma gravação (ou de uma sequência de imagens), sem DOM.
 *
 * Cada quadro é reduzido a tons de cinza (≈96 px de largura) e dividido numa
 * grade de blocos. Entre dois quadros seguidos, cada bloco procura o
 * deslocamento (vertical e depois horizontal) que melhor explica a mudança.
 * Com isso:
 *
 * - todos os blocos andando juntos na vertical → rolagem;
 * - blocos em velocidades diferentes na mesma rolagem → parallax;
 * - blocos parados enquanto o resto rola → sticky (e, se o conteúdo dentro
 *   deles muda, card stacking);
 * - deslocamento horizontal sem vertical → horizontal scroll;
 * - bloco que ganha detalhe de repente durante a rolagem → scroll reveal;
 * - bordas se afastando do centro → profundidade (zoom);
 * - quase tudo mudando sem deslocamento → transição (corte ou suave);
 * - mudança em poucos blocos com a tela parada → hover/microinteração ou
 *   texto animado (faixa horizontal);
 * - região lisa e clara cercada de detalhe → possível vidro.
 *
 * Tudo isso é estimativa: o resultado diz a confiança e a evidência medida, e
 * nunca afirma tecnologia (isso só com o DOM).
 */
import { EASINGS_COMUNS, lerEasing } from '../comparar/easing';
import { entradaCatalogo } from './catalogo';
import type {
  Confianca,
  FichaEfeito,
  QuadroCinza,
  RegiaoPct,
  ResultadoVideo,
  TipoEfeitoWeb,
} from './tipos';

export const LARGURA_ANALISE = 96;

interface Bloco {
  x: number;
  y: number;
  w: number;
  h: number;
  col: number;
  lin: number;
}

interface MedidaBloco {
  dy: number | null;
  dx: number | null;
  /** diferença média depois de compensar o movimento (0–255) */
  residuo: number;
  /** diferença média sem compensar */
  diff0: number;
  texturaA: number;
  texturaB: number;
}

interface Par {
  t0: number;
  t1: number;
  blocos: MedidaBloco[];
  dyMed: number;
  dxMed: number;
  /** fração dos blocos com deslocamento medido */
  validos: number;
  /** fração dos blocos que mudaram (diff0 alto) */
  mudaram: number;
  diffMedio: number;
  /** (dy da linha de baixo − dy da linha de cima): > 0 = afastando do centro */
  zoomV: number;
  zoomH: number;
}

const px = (q: QuadroCinza, x: number, y: number) => q.px[y * q.largura + x] as number;

export function grade(q: QuadroCinza, colunas = 3): Bloco[] {
  const linhas = Math.min(8, Math.max(3, Math.round((colunas * q.altura) / q.largura)));
  const out: Bloco[] = [];
  const bw = Math.floor(q.largura / colunas);
  const bh = Math.floor(q.altura / linhas);
  for (let l = 0; l < linhas; l++)
    for (let c = 0; c < colunas; c++)
      out.push({ x: c * bw, y: l * bh, w: bw, h: bh, col: c, lin: l });
  return out;
}

/** Desvio padrão da luminância no bloco (0 = liso). */
export function textura(q: QuadroCinza, b: Bloco): number {
  let s = 0;
  let s2 = 0;
  let n = 0;
  for (let y = b.y; y < b.y + b.h; y += 2)
    for (let x = b.x; x < b.x + b.w; x += 2) {
      const v = px(q, x, y);
      s += v;
      s2 += v * v;
      n++;
    }
  const m = s / n;
  return Math.sqrt(Math.max(0, s2 / n - m * m));
}

/** Nitidez: média do |laplaciano| (cai quando a região está desfocada). */
export function nitidez(q: QuadroCinza, b: Bloco): number {
  let s = 0;
  let n = 0;
  for (let y = Math.max(1, b.y); y < Math.min(q.altura - 1, b.y + b.h); y += 2)
    for (let x = Math.max(1, b.x); x < Math.min(q.largura - 1, b.x + b.w); x += 2) {
      s += Math.abs(
        4 * px(q, x, y) - px(q, x - 1, y) - px(q, x + 1, y) - px(q, x, y - 1) - px(q, x, y + 1),
      );
      n++;
    }
  return n ? s / n : 0;
}

function brilho(q: QuadroCinza, b: Bloco): number {
  let s = 0;
  let n = 0;
  for (let y = b.y; y < b.y + b.h; y += 3)
    for (let x = b.x; x < b.x + b.w; x += 3) {
      s += px(q, x, y);
      n++;
    }
  return s / n;
}

/** Diferença média entre o bloco em A e o bloco deslocado em B. */
function sad(a: QuadroCinza, b: QuadroCinza, bl: Bloco, dx: number, dy: number): number {
  let s = 0;
  let n = 0;
  for (let y = bl.y; y < bl.y + bl.h; y += 2) {
    const y2 = y + dy;
    if (y2 < 0 || y2 >= b.altura) continue;
    for (let x = bl.x; x < bl.x + bl.w; x += 2) {
      const x2 = x + dx;
      if (x2 < 0 || x2 >= b.largura) continue;
      s += Math.abs(px(a, x, y) - px(b, x2, y2));
      n++;
    }
  }
  // Pouca sobreposição não serve de prova.
  return n >= ((bl.w * bl.h) / 4) * 0.4 ? s / n : Infinity;
}

const mediana = (v: number[]) => {
  if (!v.length) return 0;
  const o = [...v].sort((a, b) => a - b);
  const m = o.length >> 1;
  return o.length % 2 ? o[m] : (o[m - 1] + o[m]) / 2;
};

function medirBloco(a: QuadroCinza, b: QuadroCinza, bl: Bloco): MedidaBloco {
  const texturaA = textura(a, bl);
  const texturaB = textura(b, bl);
  const diff0 = sad(a, b, bl, 0, 0);
  const R = Math.max(3, Math.round(a.altura * 0.18));
  const Rx = Math.max(3, Math.round(a.largura * 0.18));
  // Procura nos dois eixos a partir do zero e fica com o melhor; depois
  // refina o outro eixo (movimento diagonal).
  let v = { d: diff0, dy: 0, dx: 0 };
  for (let dy = -R; dy <= R; dy++) {
    const s = sad(a, b, bl, 0, dy);
    if (s < v.d - 0.01) v = { d: s, dy, dx: 0 };
  }
  let h = { d: diff0, dy: 0, dx: 0 };
  for (let dx = -Rx; dx <= Rx; dx++) {
    const s = sad(a, b, bl, dx, 0);
    if (s < h.d - 0.01) h = { d: s, dy: 0, dx };
  }
  let melhor = v.d <= h.d ? v : h;
  if (melhor === v)
    for (let dx = -Rx; dx <= Rx; dx++) {
      const s = sad(a, b, bl, dx, v.dy);
      if (s < melhor.d - 0.01) melhor = { d: s, dy: v.dy, dx };
    }
  else
    for (let dy = -R; dy <= R; dy++) {
      const s = sad(a, b, bl, h.dx, dy);
      if (s < melhor.d - 0.01) melhor = { d: s, dy, dx: h.dx };
    }
  // Só confia no deslocamento em bloco com detalhe e com ganho claro.
  const confiavel = texturaA >= 6 && (melhor.d < diff0 * 0.7 || diff0 < 2);
  return {
    dy: confiavel ? melhor.dy : null,
    dx: confiavel ? melhor.dx : null,
    residuo: melhor.d,
    diff0,
    texturaA,
    texturaB,
  };
}

function medirPar(a: QuadroCinza, b: QuadroCinza, blocos: Bloco[]): Par {
  const med = blocos.map((bl) => medirBloco(a, b, bl));
  const dys = med.filter((m) => m.dy !== null).map((m) => m.dy as number);
  const dxs = med.filter((m) => m.dx !== null).map((m) => m.dx as number);
  const linhas = Math.max(...blocos.map((b) => b.lin)) + 1;
  const colunas = Math.max(...blocos.map((b) => b.col)) + 1;
  const dyLinha = (l: number) =>
    mediana(med.filter((m, i) => blocos[i].lin === l && m.dy !== null).map((m) => m.dy as number));
  const dxColuna = (c: number) =>
    mediana(med.filter((m, i) => blocos[i].col === c && m.dx !== null).map((m) => m.dx as number));
  return {
    t0: a.t,
    t1: b.t,
    blocos: med,
    dyMed: mediana(dys),
    dxMed: mediana(dxs),
    validos: dys.length / med.length,
    mudaram: med.filter((m) => m.diff0 > 14).length / med.length,
    diffMedio: med.reduce((s, m) => s + (Number.isFinite(m.diff0) ? m.diff0 : 0), 0) / med.length,
    zoomV: dyLinha(linhas - 1) - dyLinha(0),
    zoomH: dxColuna(colunas - 1) - dxColuna(0),
  };
}

/* ------------------------------ Segmentação ------------------------------ */

type Estado = 'vertical' | 'horizontal' | 'zoom' | 'mudanca' | 'local' | 'parado';

function estadoDo(p: Par): Estado {
  const v = Math.abs(p.dyMed);
  const h = Math.abs(p.dxMed);
  if (p.validos >= 0.3 && v >= 1 && v >= h) return 'vertical';
  if (p.validos >= 0.3 && h >= 1 && h > v) return 'horizontal';
  if (Math.abs(p.zoomV) >= 2 && Math.abs(p.zoomH) >= 1 && Math.sign(p.zoomV) === Math.sign(p.zoomH))
    return 'zoom';
  if (p.mudaram >= 0.55) return 'mudanca';
  if (p.mudaram > 0) return 'local';
  return 'parado';
}

interface Trecho {
  estado: Estado;
  pares: Par[];
  inicio: number;
  fim: number;
}

function segmentar(pares: Par[]): Trecho[] {
  const out: Trecho[] = [];
  for (const p of pares) {
    const e = estadoDo(p);
    const ult = out[out.length - 1];
    if (ult && ult.estado === e) {
      ult.pares.push(p);
      ult.fim = p.t1;
    } else out.push({ estado: e, pares: [p], inicio: p.t0, fim: p.t1 });
  }
  return out;
}

/* ------------------------------ Fichas ------------------------------ */

let contador = 0;
const novoId = () => `ficha-v${Date.now().toString(36)}${(++contador).toString(36)}`;
const r1 = (n: number) => Math.round(n * 10) / 10;
const r2 = (n: number) => Math.round(n * 100) / 100;

function regiaoDe(blocos: Bloco[], idx: number[], q: QuadroCinza): RegiaoPct {
  const bs = idx.map((i) => blocos[i]);
  const x0 = Math.min(...bs.map((b) => b.x));
  const y0 = Math.min(...bs.map((b) => b.y));
  const x1 = Math.max(...bs.map((b) => b.x + b.w));
  const y1 = Math.max(...bs.map((b) => b.y + b.h));
  return {
    x: Math.round((x0 / q.largura) * 100),
    y: Math.round((y0 / q.altura) * 100),
    largura: Math.round(((x1 - x0) / q.largura) * 100),
    altura: Math.round(((y1 - y0) / q.altura) * 100),
  };
}

/** Curva CSS mais próxima de um progresso medido (0→1) ao longo do tempo. */
export function easingMaisProximo(
  progresso: number[],
): { easing: string; distancia: number } | null {
  if (progresso.length < 4) return null;
  const n = progresso.length - 1;
  let melhor: { easing: string; distancia: number } | null = null;
  for (const e of EASINGS_COMUNS) {
    const f = lerEasing(e.valor);
    if (!f) continue;
    let d = 0;
    for (let i = 0; i <= n; i++) d = Math.max(d, Math.abs(f(i / n) - progresso[i]));
    if (!melhor || d < melhor.distancia) melhor = { easing: e.valor, distancia: r2(d) };
  }
  return melhor;
}

function progressoDe(deslocs: number[]): number[] {
  const total = deslocs.reduce((s, d) => s + d, 0);
  if (!total) return [];
  let acc = 0;
  return [0, ...deslocs.map((d) => (acc += d) / total)];
}

interface Contexto {
  blocos: Bloco[];
  quadro: QuadroCinza;
  escala: number;
}

function nova(
  tipo: TipoEfeitoWeb,
  confianca: Confianca,
  inicio: number,
  fim: number,
  evidencias: string[],
  extra: Partial<FichaEfeito> = {},
): FichaEfeito {
  return {
    id: novoId(),
    tipo,
    nome: entradaCatalogo(tipo).nome,
    origem: 'video',
    confianca,
    inicio: r2(inicio),
    fim: r2(fim),
    evidencias,
    parametros: {},
    ...extra,
  };
}

function fichasDaRolagem(tr: Trecho, ctx: Contexto): FichaEfeito[] {
  const out: FichaEfeito[] = [];
  const { blocos, quadro, escala } = ctx;
  const n = tr.pares.length;
  const dur = tr.fim - tr.inicio;
  const deslocs = tr.pares.map((p) => Math.abs(p.dyMed));
  const total = deslocs.reduce((s, d) => s + d, 0);
  const dir = Math.sign(tr.pares.reduce((s, p) => s + p.dyMed, 0));
  const velocidade = dur > 0 ? (total * escala) / dur : 0;

  // Velocidade típica de cada bloco no trecho.
  const porBloco = blocos.map((_, i) => {
    const v = tr.pares.map((p) => p.blocos[i].dy).filter((d): d is number => d !== null);
    return { n: v.length, dy: mediana(v), parado: v.filter((d) => Math.abs(d) <= 0.5).length };
  });
  // Velocidade de referência: a do maior grupo de blocos (empate: o mais rápido,
  // que costuma ser o primeiro plano). A mediana erra quando metade é camada lenta.
  const grupos = new Map<number, number>();
  for (const b of porBloco)
    if (b.n >= Math.max(1, n * 0.5) && Math.abs(b.dy) >= 0.5) {
      const k = Math.round(b.dy * 2) / 2;
      grupos.set(k, (grupos.get(k) ?? 0) + 1);
    }
  const medGeral = grupos.size
    ? [...grupos.entries()].sort((a, b) => b[1] - a[1] || Math.abs(b[0]) - Math.abs(a[0]))[0][0]
    : mediana(tr.pares.map((p) => p.dyMed));
  const confiaveis = porBloco
    .map((b, i) => ({ ...b, i }))
    .filter((b) => b.n >= Math.max(1, n * 0.5));

  // Sticky: blocos parados na maioria dos pares enquanto o resto rola.
  const parados = confiaveis
    .filter((b) => b.parado >= Math.max(1, n * 0.6) && Math.abs(medGeral) >= 1)
    .map((b) => b.i);
  if (parados.length && parados.length < blocos.length * 0.7) {
    const reg = regiaoDe(blocos, parados, quadro);
    const topo = reg.y === 0 && reg.altura <= 25;
    // Conteúdo trocando dentro da área parada → empilhamento.
    const trocas = tr.pares.filter((p) => parados.some((i) => p.blocos[i].residuo > 10)).length;
    out.push(
      nova(
        'sticky',
        n >= 3 ? 'media' : 'baixa',
        tr.inicio,
        tr.fim,
        [
          `${parados.length} de ${blocos.length} blocos ficaram parados enquanto a tela rolava ${r1(Math.abs(medGeral) * escala)} px por quadro`,
          topo
            ? 'A região parada é uma faixa no topo: pode ser um cabeçalho fixo.'
            : 'A região parada não está só no topo: parece seção presa.',
        ],
        {
          regiao: reg,
          parametros: { duracao: Math.round(dur * 1000), distancia: Math.round(total * escala) },
        },
      ),
    );
    if (!topo && trocas >= Math.max(2, n * 0.4))
      out.push(
        nova(
          'empilhar',
          'baixa',
          tr.inicio,
          tr.fim,
          [
            `Dentro da região parada o conteúdo trocou em ${trocas} de ${n} pares de quadros (algo sobe por cima dela)`,
          ],
          { regiao: reg, parametros: { duracao: Math.round(dur * 1000) } },
        ),
      );
  }

  // Parallax: blocos que andam, mas em velocidade bem diferente da mediana.
  const andando = confiaveis.filter((b) => Math.abs(b.dy) >= 0.5 && !parados.includes(b.i));
  if (Math.abs(medGeral) >= 1 && andando.length >= 2) {
    const diferentes = andando.filter((b) => {
      const k = b.dy / medGeral;
      return k > 0 && (k <= 0.75 || k >= 1.35);
    });
    if (diferentes.length && diferentes.length < andando.length) {
      const fatores = diferentes.map((b) => r2(b.dy / medGeral));
      out.push(
        nova(
          'parallax',
          n >= 3 && diferentes.length >= 2 ? 'media' : 'baixa',
          tr.inicio,
          tr.fim,
          [
            `${diferentes.length} bloco(s) rolaram em outra velocidade: ${[...new Set(fatores)].slice(0, 4).join('×, ')}× a do resto`,
          ],
          {
            regiao: regiaoDe(
              blocos,
              diferentes.map((b) => b.i),
              quadro,
            ),
            parametros: {
              fator: mediana(fatores),
              velocidade: Math.round(velocidade),
              direcao: dir < 0 ? 'cima' : 'baixo',
              duracao: Math.round(dur * 1000),
            },
          },
        ),
      );
    }
  }

  // Scroll reveal: bloco que estava liso e ganha detalhe de uma vez.
  const aparecem: number[] = [];
  tr.pares.forEach((p) => {
    const resMed = mediana(p.blocos.map((b) => b.residuo).filter(Number.isFinite));
    p.blocos.forEach((b, i) => {
      if (
        b.texturaA < 10 &&
        b.texturaB > b.texturaA * 1.8 + 4 &&
        b.residuo > Math.max(8, resMed * 2.5)
      )
        aparecem.push(i);
    });
  });
  const unicos = [...new Set(aparecem)];
  if (unicos.length && aparecem.length >= 2)
    out.push(
      nova(
        'revelar',
        aparecem.length >= 3 ? 'media' : 'baixa',
        tr.inicio,
        tr.fim,
        [
          `${aparecem.length} vez(es) um bloco liso ganhou detalhe de repente durante a rolagem (algo surgiu, não só passou)`,
        ],
        {
          regiao: regiaoDe(blocos, unicos, quadro),
          parametros: { direcao: dir < 0 ? 'cima' : 'baixo' },
        },
      ),
    );

  // Rolagem com curva própria (scroll suavizado): só para registrar o easing.
  const prog = progressoDe(deslocs);
  const ease = easingMaisProximo(prog);
  if (ease && out.length) for (const f of out) f.parametros.easing ??= ease.easing;
  return out;
}

function fichaHorizontal(tr: Trecho, ctx: Contexto): FichaEfeito {
  const dur = tr.fim - tr.inicio;
  const deslocs = tr.pares.map((p) => Math.abs(p.dxMed));
  const total = deslocs.reduce((s, d) => s + d, 0);
  const dir = Math.sign(tr.pares.reduce((s, p) => s + p.dxMed, 0));
  const ease = easingMaisProximo(progressoDe(deslocs));
  return nova(
    'horizontal',
    tr.pares.length >= 3 ? 'media' : 'baixa',
    tr.inicio,
    tr.fim,
    [
      `O conteúdo andou ${Math.round(total * ctx.escala)} px na horizontal em ${r2(dur)} s com a página quase parada na vertical`,
      'No vídeo, scroll horizontal e carrossel arrastado parecem iguais.',
    ],
    {
      parametros: {
        duracao: Math.round(dur * 1000),
        distancia: Math.round(total * ctx.escala),
        velocidade: dur > 0 ? Math.round((total * ctx.escala) / dur) : undefined,
        direcao: dir < 0 ? 'esquerda' : 'direita',
        ...(ease ? { easing: ease.easing } : {}),
      },
    },
  );
}

function fichaZoom(tr: Trecho): FichaEfeito {
  const soma = tr.pares.reduce((s, p) => s + p.zoomV, 0);
  const dur = tr.fim - tr.inicio;
  return nova(
    'profundidade',
    tr.pares.length >= 2 ? 'media' : 'baixa',
    tr.inicio,
    tr.fim,
    [
      `As bordas ${soma > 0 ? 'se afastaram do' : 'se aproximaram do'} centro em ${tr.pares.length} par(es) de quadros (zoom ${soma > 0 ? 'para dentro' : 'para fora'})`,
    ],
    { parametros: { duracao: Math.round(dur * 1000), direcao: soma > 0 ? 'dentro' : 'fora' } },
  );
}

function fichaMudanca(tr: Trecho): FichaEfeito {
  const dur = tr.fim - tr.inicio;
  const corte = tr.pares.length === 1;
  const frac = mediana(tr.pares.map((p) => p.mudaram));
  return nova(
    'transicao',
    corte ? 'media' : 'media',
    tr.inicio,
    tr.fim,
    [
      corte
        ? `Corte: ${Math.round(frac * 100)}% da tela mudou de um quadro para o outro, sem deslocamento`
        : `Transição suave: ${Math.round(frac * 100)}% da tela mudou aos poucos em ${tr.pares.length} pares de quadros, sem deslocamento`,
    ],
    {
      parametros: { duracao: corte ? 0 : Math.round(dur * 1000), intensidade: r2(frac) },
      observacao: corte ? 'corte' : 'suave',
    },
  );
}

function fichasLocais(tr: Trecho, ctx: Contexto): FichaEfeito[] {
  const { blocos, quadro } = ctx;
  const dur = tr.fim - tr.inicio;
  const mudou = new Map<number, number>();
  tr.pares.forEach((p) =>
    p.blocos.forEach((b, i) => b.diff0 > 14 && mudou.set(i, (mudou.get(i) ?? 0) + 1)),
  );
  const idx = [...mudou.keys()];
  if (!idx.length) return [];
  const reg = regiaoDe(blocos, idx, quadro);
  const linhas = new Set(idx.map((i) => blocos[i].lin));
  const colunas = new Set(idx.map((i) => blocos[i].col));
  const fracao = idx.length / blocos.length;
  // Região grande trocando sem deslocamento: slide, fade ou troca de imagem.
  if ((fracao >= 0.3 || idx.length >= 3) && linhas.size >= 2)
    return [
      nova(
        'transicao',
        tr.pares.length >= 2 ? 'media' : 'baixa',
        tr.inicio,
        tr.fim,
        [
          `Troca de conteúdo numa região (${reg.largura}% × ${reg.altura}% da tela) sem deslocamento, em ${tr.pares.length} par(es) de quadros: slide, fade ou troca de imagem`,
        ],
        {
          regiao: reg,
          parametros: { duracao: Math.round(dur * 1000), intensidade: r2(fracao) },
          observacao: 'regional',
        },
      ),
    ];
  // Faixa de uma linha que muda da esquerda para a direita → texto.
  const ordemCol = tr.pares
    .map((p) => p.blocos.map((b, i) => (b.diff0 > 14 ? blocos[i].col : -1)).filter((c) => c >= 0))
    .filter((c) => c.length)
    .map((c) => mediana(c));
  const varre = ordemCol.length >= 2 && ordemCol[ordemCol.length - 1] > ordemCol[0];
  if (linhas.size === 1 && colunas.size >= 2)
    return [
      nova(
        'texto',
        'baixa',
        tr.inicio,
        tr.fim,
        [
          `Mudança só numa faixa horizontal fina${varre ? ', avançando da esquerda para a direita' : ''}, com o resto parado (comum em título que entra por palavras)`,
        ],
        { regiao: reg, parametros: { duracao: Math.round(dur * 1000) } },
      ),
    ];
  // Mudança demorada numa região pequena/média → forma ou conteúdo se transformando.
  if (tr.pares.length >= 3)
    return [
      nova(
        'morph',
        'baixa',
        tr.inicio,
        tr.fim,
        [
          `Uma região (${reg.largura}% × ${reg.altura}% da tela) mudou aos poucos por ${r2(dur)} s sem se deslocar`,
        ],
        { regiao: reg, parametros: { duracao: Math.round(dur * 1000) } },
      ),
    ];
  return [
    nova(
      'hover',
      'baixa',
      tr.inicio,
      tr.fim,
      [
        `Mudança rápida só em ${idx.length} bloco(s) com o resto parado (hover ou microinteração; o vídeo não mostra o cursor)`,
      ],
      { regiao: reg, parametros: { duracao: Math.round(dur * 1000) } },
    ),
  ];
}

/** Região lisa e clara cercada de detalhe, em vários quadros → possível vidro. */
function fichaVidro(quadros: QuadroCinza[], blocos: Bloco[]): FichaEfeito | null {
  const amostra = quadros.filter((_, i) => i % Math.max(1, Math.floor(quadros.length / 8)) === 0);
  const colunas = Math.max(...blocos.map((b) => b.col)) + 1;
  const vizinhos = (i: number) =>
    blocos
      .map((b, j) => ({ b, j }))
      .filter(({ b }) => Math.abs(b.col - blocos[i].col) + Math.abs(b.lin - blocos[i].lin) === 1)
      .map(({ j }) => j);
  const achados = new Map<number, number>();
  for (const q of amostra) {
    const nit = blocos.map((b) => nitidez(q, b));
    const bri = blocos.map((b) => brilho(q, b));
    blocos.forEach((_, i) => {
      const viz = vizinhos(i);
      const nitViz = mediana(viz.map((j) => nit[j]));
      const briViz = mediana(viz.map((j) => bri[j]));
      if (nitViz > 6 && nit[i] < nitViz * 0.4 && bri[i] >= briViz - 4 && bri[i] > 40)
        achados.set(i, (achados.get(i) ?? 0) + 1);
    });
  }
  const fortes = [...achados.entries()]
    .filter(([, n]) => n >= Math.max(2, amostra.length * 0.3))
    .map(([i]) => i);
  if (!fortes.length || fortes.length > colunas * 2) return null;
  const q = quadros[0];
  return {
    id: novoId(),
    tipo: 'vidro',
    nome: entradaCatalogo('vidro').nome,
    origem: 'video',
    confianca: 'baixa',
    inicio: null,
    fim: null,
    regiao: regiaoDe(blocos, fortes, q),
    evidencias: [
      `Região com ${Math.round((1 - 0.4) * 100)}% menos detalhe que a vizinhança e tão clara quanto ela, em ${Math.max(...fortes.map((i) => achados.get(i) ?? 0))} de ${amostra.length} quadros (parece superfície desfocada)`,
    ],
    parametros: { intensidade: 0.6 },
  };
}

/* ------------------------------ Entrada principal ------------------------------ */

export interface OpcoesVideo {
  /** Largura da referência em px (para converter as medidas). */
  larguraReferencia?: number;
  colunas?: number;
}

/** Analisa uma sequência de quadros (já em tons de cinza, mesmo tamanho). */
export function analisarSequencia(quadros: QuadroCinza[], op: OpcoesVideo = {}): ResultadoVideo {
  const limites = [
    'Análise só por imagem: nenhum DOM foi inspecionado e nenhuma tecnologia é afirmada.',
    'O cursor não aparece em gravações de celular: hover e interações com cursor são inferidos ou marcados à mão.',
    'Medidas em px vêm da gravação reduzida e convertidas para o tamanho da referência; servem de ponto de partida.',
  ];
  const ok = quadros.filter(
    (q) =>
      q.largura === quadros[0]?.largura &&
      q.altura === quadros[0]?.altura &&
      q.px.length === q.largura * q.altura,
  );
  if (ok.length < 2)
    return {
      quadros: ok.length,
      duracao: 0,
      escala: 1,
      fichas: [],
      trechos: [],
      limites: ['São precisos pelo menos 2 quadros do mesmo tamanho.', ...limites],
    };
  const q0 = ok[0];
  const escala = (op.larguraReferencia ?? q0.largura) / q0.largura;
  const blocos = grade(q0, op.colunas ?? 3);
  const pares: Par[] = [];
  for (let i = 1; i < ok.length; i++) pares.push(medirPar(ok[i - 1], ok[i], blocos));
  const trechos = segmentar(pares);
  const ctx: Contexto = { blocos, quadro: q0, escala };
  const fichas: FichaEfeito[] = [];
  const descricao: Record<Estado, string> = {
    vertical: 'rolagem vertical',
    horizontal: 'movimento horizontal',
    zoom: 'zoom',
    mudanca: 'troca de cena',
    local: 'mudança local',
    parado: 'tela parada',
  };
  for (const tr of trechos) {
    if (tr.estado === 'vertical' && tr.pares.length >= 2) fichas.push(...fichasDaRolagem(tr, ctx));
    else if (tr.estado === 'horizontal' && tr.pares.length >= 2)
      fichas.push(fichaHorizontal(tr, ctx));
    else if (tr.estado === 'zoom') fichas.push(fichaZoom(tr));
    else if (tr.estado === 'mudanca') fichas.push(fichaMudanca(tr));
    else if (tr.estado === 'local') fichas.push(...fichasLocais(tr, ctx));
  }
  const vidro = fichaVidro(ok, blocos);
  if (vidro) fichas.push(vidro);
  return {
    quadros: ok.length,
    duracao: r2(ok[ok.length - 1].t - ok[0].t),
    escala: r2(escala),
    fichas: agruparRepetidas(juntarParecidas(fichas)),
    trechos: trechos.map((t) => ({
      inicio: r2(t.inicio),
      fim: r2(t.fim),
      descricao: descricao[t.estado],
    })),
    limites,
  };
}

/** Junta fichas do mesmo tipo que se tocam no tempo (ex.: dois trechos de rolagem com sticky). */
function juntarParecidas(fichas: FichaEfeito[]): FichaEfeito[] {
  const out: FichaEfeito[] = [];
  for (const f of fichas.sort((a, b) => (a.inicio ?? 0) - (b.inicio ?? 0))) {
    const ult = [...out].reverse().find((x) => x.tipo === f.tipo);
    if (
      ult &&
      ult.fim !== null &&
      f.inicio !== null &&
      f.inicio - ult.fim <= 0.3 &&
      f.tipo !== 'transicao'
    ) {
      ult.fim = f.fim;
      ult.evidencias = [...new Set([...ult.evidencias, ...f.evidencias])].slice(0, 6);
      continue;
    }
    out.push(f);
  }
  return out;
}

const sobreposicao = (a?: RegiaoPct, b?: RegiaoPct) => {
  if (!a || !b) return a === b ? 1 : 0;
  const x = Math.max(0, Math.min(a.x + a.largura, b.x + b.largura) - Math.max(a.x, b.x));
  const y = Math.max(0, Math.min(a.y + a.altura, b.y + b.altura) - Math.max(a.y, b.y));
  const menor = Math.min(a.largura * a.altura, b.largura * b.altura) || 1;
  return (x * y) / menor;
};

/** O mesmo efeito, na mesma região, várias vezes → uma ficha com as ocorrências. */
export function agruparRepetidas(fichas: FichaEfeito[]): FichaEfeito[] {
  const out: FichaEfeito[] = [];
  const ordem = { alta: 0, media: 1, baixa: 2 } as const;
  for (const f of fichas) {
    const igual = out.find((x) => x.tipo === f.tipo && sobreposicao(x.regiao, f.regiao) >= 0.7);
    if (!igual) {
      out.push({ ...f });
      continue;
    }
    if (f.inicio !== null && f.fim !== null)
      igual.ocorrencias = [...(igual.ocorrencias ?? []), { inicio: f.inicio, fim: f.fim }];
    if (ordem[f.confianca] < ordem[igual.confianca]) igual.confianca = f.confianca;
  }
  for (const f of out)
    if (f.ocorrencias?.length) {
      const n = f.ocorrencias.length + 1;
      f.evidencias = [
        `Aparece ${n} vezes na gravação, sempre na mesma região.`,
        ...f.evidencias,
      ].slice(0, 6);
      // Repetido várias vezes, o padrão fica mais confiável.
      if (n >= 3 && f.confianca === 'baixa') f.confianca = 'media';
    }
  return out;
}
