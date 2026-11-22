/**
 * Design system em PDF (A4, vetorial), organizado a partir da Fundação:
 * capa, sumário, cores por função, escalas, contraste, tipografia,
 * espaçamento, cantos, sombras, movimento, grid, componentes e tokens.
 *
 * Usa pdf-lib (sem navegador): a página só precisa entregar a logo em PNG/JPG.
 */
import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb } from 'pdf-lib';
import { escalaTonal } from './cores';
import {
  CHAVES_ESPACO,
  CHAVES_RAIO,
  CHAVES_SOMBRA,
  GRUPOS_COR,
  KcxFundacao,
  LAYOUT_PADRAO,
  MOVIMENTO_PADRAO,
  NIVEIS_TEXTO,
  NOMES_COR,
  NOMES_TEXTO,
  TOKENS_ESCALA,
  cssDaFundacao,
  funcaoDaCor,
  usoDoTexto,
} from './fundacao';
import { TemaGuia, contrastesDaFundacao } from './guia-design-system';

export interface ComponentePdf {
  nome: string;
  categoria: string;
  variantes: number;
}

export interface OpcoesPdf {
  tema?: TemaGuia;
  componentes?: ComponentePdf[];
  /** Logo já em PNG ou JPG. */
  logo?: { bytes: Uint8Array; tipo: 'png' | 'jpg' };
  /** Data por extenso para a capa (ex.: "21 de novembro de 2026"). */
  data?: string;
}

const A4 = { l: 595.28, a: 841.89 };
const M = 48; // margem
const LARGURA = A4.l - M * 2;

/* ---------------------------- Texto e cores ---------------------------- */

const WIN_ANSI_EXTRA = '€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ';
const TROCAS: Record<string, string> = {
  '→': '->',
  '←': '<-',
  '−': '-',
  '≥': '>=',
  '≤': '<=',
  '✓': 'ok',
  '✕': 'x',
  '×': 'x',
  '›': '>',
  '\t': '  ',
};
/** As fontes padrão do PDF só têm o alfabeto WinAnsi: troca o que não cabe. */
export function textoPdf(s: string): string {
  let r = '';
  for (const c of s) {
    const n = c.codePointAt(0)!;
    if ((n >= 0x20 && n <= 0x7e) || (n >= 0xa0 && n <= 0xff) || WIN_ANSI_EXTRA.includes(c)) r += c;
    else if (TROCAS[c]) r += TROCAS[c];
    else if (c === '\n') r += ' ';
    else r += '?';
  }
  return r;
}

const deHex = (hex: string) => {
  const h = /^#[0-9a-f]{6}$/i.test(hex) ? hex : '#888888';
  const n = parseInt(h.slice(1), 16);
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
};
const lum = (hex: string) => {
  const c = deHex(hex);
  return 0.299 * c.red + 0.587 * c.green + 0.114 * c.blue;
};
const sobre = (hex: string) => (lum(hex) > 0.6 ? rgb(0.08, 0.07, 0.12) : rgb(1, 1, 1));

const TINTA = rgb(0.1, 0.09, 0.16);
const SUAVE = rgb(0.4, 0.38, 0.48);
const LINHA = rgb(0.86, 0.85, 0.9);
const FUNDO_CAIXA = rgb(0.965, 0.96, 0.98);

/** Caminho SVG de um retângulo arredondado (origem no canto de cima, y para baixo). */
function retArredondado(w: number, h: number, r: number): string {
  const k = Math.max(0, Math.min(r, w / 2, h / 2));
  return `M ${k} 0 H ${w - k} Q ${w} 0 ${w} ${k} V ${h - k} Q ${w} ${h} ${w - k} ${h} H ${k} Q 0 ${h} 0 ${h - k} V ${k} Q 0 0 ${k} 0 Z`;
}

/* ------------------------------ Documento ------------------------------ */

class Doc {
  pagina!: PDFPage;
  y = 0;
  numero = 0;
  secao = '';
  readonly sumario: { titulo: string; pagina: number }[] = [];
  readonly paginas: PDFPage[] = [];

  constructor(
    readonly pdf: PDFDocument,
    readonly f: { normal: PDFFont; negrito: PDFFont; mono: PDFFont },
    readonly marca: string,
    readonly acento: string,
  ) {}

  novaPagina(): void {
    this.pagina = this.pdf.addPage([A4.l, A4.a]);
    this.paginas.push(this.pagina);
    this.numero++;
    this.y = A4.a - M - 18;
    // cabeçalho e rodapé
    this.texto(this.marca.toUpperCase(), M, A4.a - 30, 7.5, { cor: SUAVE, negrito: true });
    if (this.secao)
      this.texto(this.secao, A4.l - M - this.largura(this.secao, 7.5), A4.a - 30, 7.5, {
        cor: SUAVE,
      });
    this.pagina.drawLine({
      start: { x: M, y: A4.a - 38 },
      end: { x: A4.l - M, y: A4.a - 38 },
      thickness: 0.5,
      color: LINHA,
    });
    const n = String(this.numero);
    this.texto(n, A4.l - M - this.largura(n, 8), 24, 8, { cor: SUAVE });
    this.texto('Design system', M, 24, 8, { cor: SUAVE });
  }

  largura(s: string, tam: number, negrito = false): number {
    return (negrito ? this.f.negrito : this.f.normal).widthOfTextAtSize(textoPdf(s), tam);
  }

  texto(
    s: string,
    x: number,
    y: number,
    tam: number,
    o: { cor?: ReturnType<typeof rgb>; negrito?: boolean; mono?: boolean } = {},
  ): void {
    this.pagina.drawText(textoPdf(s), {
      x,
      y,
      size: tam,
      font: o.mono ? this.f.mono : o.negrito ? this.f.negrito : this.f.normal,
      color: o.cor ?? TINTA,
    });
  }

  /** Quebra em linhas que cabem na largura. */
  linhas(s: string, tam: number, largura: number, negrito = false, mono = false): string[] {
    const fonte = mono ? this.f.mono : negrito ? this.f.negrito : this.f.normal;
    const saida: string[] = [];
    for (const par of textoPdf(s).split(/\s*\n\s*/)) {
      let atual = '';
      for (const p of par.split(' ')) {
        const t = atual ? `${atual} ${p}` : p;
        if (fonte.widthOfTextAtSize(t, tam) <= largura) atual = t;
        else {
          if (atual) saida.push(atual);
          atual = p;
        }
      }
      if (atual) saida.push(atual);
    }
    return saida;
  }

  paragrafo(
    s: string,
    x: number,
    tam: number,
    largura: number,
    o: { cor?: ReturnType<typeof rgb>; negrito?: boolean; entre?: number } = {},
  ): number {
    const ls = this.linhas(s, tam, largura, o.negrito);
    const passo = tam * (o.entre ?? 1.4);
    for (const l of ls) {
      this.garantir(passo);
      this.texto(l, x, this.y - tam, tam, o);
      this.y -= passo;
    }
    return ls.length;
  }

  /** Pula de página se não couber `altura`. */
  garantir(altura: number): void {
    if (this.y - altura < M + 10) this.novaPagina();
  }

  /** Abre uma seção numa página nova, com título grande e entrada no sumário. */
  secaoNova(titulo: string, lead: string): void {
    this.secao = titulo;
    this.novaPagina();
    this.sumario.push({ titulo, pagina: this.numero });
    this.pagina.drawRectangle({
      x: M,
      y: this.y - 2,
      width: 28,
      height: 3,
      color: deHex(this.acento),
    });
    this.y -= 14;
    this.texto(titulo, M, this.y - 22, 22, { negrito: true });
    this.y -= 34;
    this.paragrafo(lead, M, 10, LARGURA, { cor: SUAVE });
    this.y -= 12;
  }

  subtitulo(s: string): void {
    this.garantir(40);
    this.y -= 6;
    this.texto(s, M, this.y - 13, 13, { negrito: true });
    this.y -= 22;
  }

  caixa(
    x: number,
    yTopo: number,
    w: number,
    h: number,
    cor: ReturnType<typeof rgb>,
    raio = 6,
    borda?: ReturnType<typeof rgb>,
  ) {
    this.pagina.drawSvgPath(retArredondado(w, h, raio), {
      x,
      y: yTopo,
      color: cor,
      ...(borda ? { borderColor: borda, borderWidth: 0.6 } : {}),
    });
  }
}

/* -------------------------------- Seções -------------------------------- */

function capa(
  d: Doc,
  f: KcxFundacao,
  op: OpcoesPdf,
  logo?: { img: Awaited<ReturnType<PDFDocument['embedPng']>> },
) {
  d.pagina = d.pdf.addPage([A4.l, A4.a]);
  d.paginas.push(d.pagina);
  d.numero++;
  const fundo = f.cores.fundo.escuro;
  d.pagina.drawRectangle({ x: 0, y: 0, width: A4.l, height: A4.a, color: deHex(fundo) });
  // faixa de cores da marca
  const marca = ['primaria', 'secundaria', 'destaque'] as const;
  marca.forEach((t, i) =>
    d.pagina.drawRectangle({
      x: (A4.l / 3) * i,
      y: 0,
      width: A4.l / 3 + 1,
      height: 14,
      color: deHex(f.cores[t].escuro),
    }),
  );
  const claro = sobre(fundo);
  let y = A4.a - 140;
  if (logo) {
    const k = Math.min(180 / logo.img.width, 70 / logo.img.height, 1);
    const w = logo.img.width * k;
    const h = logo.img.height * k;
    d.pagina.drawImage(logo.img, { x: M, y: y - h + 20, width: w, height: h });
    y -= h + 30;
  }
  d.texto('DESIGN SYSTEM', M, y, 10, { cor: deHex(f.cores.primaria.escuro), negrito: true });
  y -= 52;
  for (const l of d.linhas(f.nome, 44, LARGURA, true)) {
    d.texto(l, M, y, 44, { cor: claro, negrito: true });
    y -= 50;
  }
  y -= 4;
  d.texto('Cores, tipografia, espaçamento, movimento, grid e componentes', M, y, 12, {
    cor: claro,
  });
  d.texto(
    `Versão ${f.versao}${op.data ? ` · ${op.data}` : ''} · tema ${op.tema === 'claro' ? 'claro' : 'escuro'} em destaque`,
    M,
    60,
    9,
    { cor: claro },
  );
  d.texto('Gerado pelo Kalixto Creative Lab (KCX Studio)', M, 44, 8, { cor: claro });
}

function cores(d: Doc, f: KcxFundacao, tema: TemaGuia) {
  d.secaoNova(
    'Cores por função',
    'Cada cor tem um papel. Use pela função, não pela aparência: assim trocar a marca não quebra a interface. Cada amostra mostra o tema escuro e o claro.',
  );
  for (const g of GRUPOS_COR) {
    d.subtitulo(g.nome);
    d.paragrafo(g.descricao, M, 9, LARGURA, { cor: SUAVE });
    d.y -= 6;
    for (const t of g.tokens) {
      const funcao = d.linhas(funcaoDaCor(f, t), 8.5, LARGURA - 190);
      const h = Math.max(52, 30 + funcao.length * 11);
      d.garantir(h + 8);
      const topo = d.y;
      const principal = f.cores[t][tema];
      const outro = f.cores[t][tema === 'escuro' ? 'claro' : 'escuro'];
      d.caixa(M, topo, 56, h - 6, deHex(principal), 6, LINHA);
      d.caixa(M + 60, topo, 22, h - 6, deHex(outro), 4, LINHA);
      d.texto('Aa', M + 17, topo - (h - 6) / 2 - 5, 13, { cor: sobre(principal), negrito: true });
      const x = M + 96;
      d.texto(NOMES_COR[t], x, topo - 12, 11, { negrito: true });
      d.texto(`--kx-cor-${t}`, x + d.largura(NOMES_COR[t], 11, true) + 8, topo - 12, 8, {
        cor: SUAVE,
        mono: true,
      });
      d.texto(
        `${tema === 'escuro' ? 'Escuro' : 'Claro'} ${principal.toUpperCase()}   ·   ${tema === 'escuro' ? 'Claro' : 'Escuro'} ${outro.toUpperCase()}`,
        x,
        topo - 25,
        8,
        { cor: SUAVE, mono: true },
      );
      funcao.forEach((l, i) => d.texto(l, x, topo - 39 - i * 11, 8.5));
      d.y -= h + 4;
    }
  }
}

function escalas(d: Doc, f: KcxFundacao, tema: TemaGuia) {
  d.secaoNova(
    'Escalas tonais',
    'Dez tons de cada cor de marca e de feedback, do 50 (mais claro) ao 900 (mais escuro). O 500 é a própria cor. Use os tons claros para fundos de destaque e os escuros para texto sobre eles.',
  );
  const w = LARGURA / 10;
  for (const t of TOKENS_ESCALA) {
    d.garantir(70);
    d.texto(NOMES_COR[t], M, d.y - 11, 11, { negrito: true });
    d.texto(`--kx-${t}-50 ... --kx-${t}-900`, M + 90, d.y - 11, 7.5, { cor: SUAVE, mono: true });
    d.y -= 18;
    const topo = d.y;
    escalaTonal(f.cores[t][tema]).forEach((p, i) => {
      d.pagina.drawRectangle({
        x: M + i * w,
        y: topo - 34,
        width: w,
        height: 34,
        color: deHex(p.cor),
      });
      d.texto(String(p.passo), M + i * w + 4, topo - 12, 7.5, { cor: sobre(p.cor), negrito: true });
      d.texto(p.cor.toUpperCase(), M + i * w + 3, topo - 46, 6, { cor: SUAVE, mono: true });
    });
    d.y -= 60;
  }
}

function contraste(d: Doc, f: KcxFundacao, tema: TemaGuia) {
  d.secaoNova(
    'Acessibilidade de contraste',
    `Pares de cores avaliados pelo WCAG 2.1 no tema ${tema}: texto precisa de 4,5:1 (AA) ou 7:1 (AAA); ícones, bordas e texto grande, 3:1.`,
  );
  const cols = [M, M + 46, M + 290, M + 360, M + 450];
  d.texto('Amostra', cols[0], d.y - 9, 8, { cor: SUAVE, negrito: true });
  d.texto('Par', cols[1], d.y - 9, 8, { cor: SUAVE, negrito: true });
  d.texto('Contraste', cols[2], d.y - 9, 8, { cor: SUAVE, negrito: true });
  d.texto('Mínimo', cols[3], d.y - 9, 8, { cor: SUAVE, negrito: true });
  d.texto('Nota', cols[4], d.y - 9, 8, { cor: SUAVE, negrito: true });
  d.y -= 16;
  for (const p of contrastesDaFundacao(f, tema)) {
    d.garantir(26);
    const topo = d.y;
    d.caixa(cols[0], topo, 34, 18, deHex(f.cores[p.fundo][tema]), 4, LINHA);
    d.texto('Aa', cols[0] + 9, topo - 13, 9, { cor: deHex(f.cores[p.texto][tema]), negrito: true });
    d.texto(p.nome, cols[1], topo - 12, 9);
    d.texto(`${p.razao.toFixed(2)}:1`, cols[2], topo - 12, 9, { mono: true });
    d.texto(p.uso === 'texto' ? '4,5:1' : '3:1', cols[3], topo - 12, 9, { cor: SUAVE });
    const cor = p.nota === 'Falha' ? rgb(0.86, 0.16, 0.3) : rgb(0.1, 0.55, 0.35);
    d.caixa(cols[4], topo - 2, 40, 15, cor, 7);
    d.texto(p.nota, cols[4] + 20 - d.largura(p.nota, 8, true) / 2, topo - 12.5, 8, {
      cor: rgb(1, 1, 1),
      negrito: true,
    });
    d.pagina.drawLine({
      start: { x: M, y: topo - 23 },
      end: { x: A4.l - M, y: topo - 23 },
      thickness: 0.4,
      color: LINHA,
    });
    d.y -= 27;
  }
}

function tipografia(d: Doc, f: KcxFundacao) {
  d.secaoNova(
    'Tipografia',
    'Três famílias e sete níveis de texto. As amostras usam a fonte padrão do PDF no tamanho e peso de cada nível; no site e no Figma entram as famílias abaixo.',
  );
  const familias = [
    ['Títulos', f.fontes.titulo],
    ['Texto corrido', f.fontes.corpo],
    ['Código e números', f.fontes.mono],
  ] as const;
  const w = (LARGURA - 16) / 3;
  const topo = d.y;
  familias.forEach(([uso, nome], i) => {
    const x = M + i * (w + 8);
    d.caixa(x, topo, w, 62, FUNDO_CAIXA, 8);
    d.texto('Aa', x + 12, topo - 30, 22, { negrito: true });
    d.texto(nome, x + 12, topo - 44, 10, { negrito: true });
    d.texto(uso, x + 12, topo - 55, 8, { cor: SUAVE });
  });
  d.y -= 80;
  d.subtitulo('Hierarquia');
  for (const n of NIVEIS_TEXTO) {
    const e = f.texto[n];
    let tam = Math.min(40, Math.max(8, e.tamanho * 0.72));
    while (tam > 8 && d.largura(`${NOMES_TEXTO[n]} · Kalixto`, tam, e.peso >= 600) > 270) tam -= 1;
    const uso = d.linhas(usoDoTexto(f, n), 8, 210);
    const h = Math.max(tam * 1.3 + 14, 18 + uso.length * 10 + 12);
    d.garantir(h + 6);
    const t = d.y;
    d.texto(`${NOMES_TEXTO[n]} · Kalixto`, M, t - tam, tam, { negrito: e.peso >= 600 });
    const x = M + 290;
    d.texto(`${NOMES_TEXTO[n]}  .kx-texto-${n}`, x, t - 9, 8.5, { negrito: true });
    d.texto(
      `${e.familia === 'titulo' ? f.fontes.titulo : e.familia === 'mono' ? f.fontes.mono : f.fontes.corpo} · ${e.peso} · ${e.tamanho}px (cel. ${e.tamanhoCelular}px) · altura ${e.altura}`,
      x,
      t - 20,
      7.5,
      { cor: SUAVE },
    );
    uso.forEach((l, i) => d.texto(l, x, t - 31 - i * 10, 8));
    d.pagina.drawLine({
      start: { x: M, y: t - h },
      end: { x: A4.l - M, y: t - h },
      thickness: 0.4,
      color: LINHA,
    });
    d.y -= h + 6;
  }
}

function espacosRaiosSombras(d: Doc, f: KcxFundacao) {
  d.secaoNova(
    'Espaçamento, cantos e sombras',
    'Espaços numa escala de 4 px (espaco-4 = 16 px), raios de canto e três níveis de sombra para dar profundidade.',
  );
  d.subtitulo('Espaçamento');
  const max = Math.max(...CHAVES_ESPACO.map((k) => f.espacos[k]), 1);
  for (const k of CHAVES_ESPACO) {
    d.garantir(18);
    const v = f.espacos[k];
    d.texto(`espaco-${k}`, M, d.y - 10, 8.5, { mono: true });
    d.pagina.drawRectangle({
      x: M + 80,
      y: d.y - 12,
      width: Math.max(2, (v / max) * (LARGURA - 140)),
      height: 10,
      color: deHex(f.cores.primaria.escuro),
    });
    d.texto(`${v}px`, A4.l - M - 34, d.y - 10, 8.5, { cor: SUAVE });
    d.y -= 18;
  }
  d.y -= 8;
  d.subtitulo('Cantos');
  d.garantir(90);
  const topo = d.y;
  CHAVES_RAIO.forEach((k, i) => {
    const x = M + i * 120;
    const r = k === 'pill' ? 999 : f.raios[k];
    d.caixa(x, topo, 96, 54, FUNDO_CAIXA, Math.min(r, 27), deHex(f.cores.primaria.escuro));
    d.texto(`raio-${k}`, x, topo - 68, 8.5, { mono: true });
    d.texto(k === 'pill' ? 'pílula' : `${f.raios[k]}px`, x, topo - 79, 8, { cor: SUAVE });
  });
  d.y -= 96;
  d.subtitulo('Sombras');
  d.garantir(110);
  const t2 = d.y;
  CHAVES_SOMBRA.forEach((k, i) => {
    const s = f.sombras[k];
    const x = M + 10 + i * 160;
    // aproximação: camadas que se espalham com opacidade decrescente
    const passos = 6;
    for (let j = passos; j >= 1; j--) {
      const e = (s.raio / 2) * (j / passos) + s.espalhar;
      d.pagina.drawSvgPath(retArredondado(110 + e * 2, 60 + e * 2, 10 + e), {
        x: x + s.x - e,
        y: t2 - s.y + e,
        color: rgb(0, 0, 0),
        opacity: (s.opacidade / passos) * 0.9,
      });
    }
    d.caixa(x, t2, 110, 60, rgb(1, 1, 1), 10);
    d.texto(`sombra-${k}`, x + 10, t2 - 22, 9, { negrito: true, mono: true });
    d.texto(
      `${s.x} ${s.y} ${s.raio} ${s.espalhar} · ${Math.round(s.opacidade * 100)}%`,
      x + 10,
      t2 - 36,
      7.5,
      { cor: SUAVE },
    );
  });
  d.y -= 100;
}

function movimentoGrid(d: Doc, f: KcxFundacao) {
  const mov = f.movimento ?? MOVIMENTO_PADRAO;
  const lay = f.layout ?? LAYOUT_PADRAO;
  d.secaoNova(
    'Movimento e grid',
    'Durações e curva padrão das animações, e o grid que organiza a página em telas largas e no celular.',
  );
  d.subtitulo('Movimento');
  const linhas: [string, string, string][] = [
    ['Rápido', `${mov.rapido} ms`, 'Hover, foco, troca de ícone'],
    ['Normal', `${mov.normal} ms`, 'Abrir menus, abas, acordeões'],
    ['Lento', `${mov.lento} ms`, 'Modais, entradas de seção, heros'],
  ];
  for (const [n, v, u] of linhas) {
    d.texto(n, M, d.y - 10, 9.5, { negrito: true });
    d.texto(v, M + 90, d.y - 10, 9.5, { mono: true });
    d.texto(u, M + 170, d.y - 10, 9, { cor: SUAVE });
    d.y -= 17;
  }
  d.texto(`Curva: ${mov.easing}`, M, d.y - 10, 9, { mono: true });
  d.y -= 20;
  const m = mov.easing.match(/cubic-bezier\(([^)]+)\)/);
  if (m) {
    const [x1, y1, x2, y2] = m[1].split(',').map(Number);
    if ([x1, y1, x2, y2].every(Number.isFinite)) {
      d.garantir(120);
      const s = 100;
      const topo = d.y;
      d.caixa(M, topo, s + 20, s + 20, FUNDO_CAIXA, 8);
      d.pagina.drawSvgPath(`M 0 ${s} C ${x1 * s} ${s - y1 * s} ${x2 * s} ${s - y2 * s} ${s} 0`, {
        x: M + 10,
        y: topo - 10,
        borderColor: deHex(f.cores.primaria.escuro),
        borderWidth: 2,
      });
      d.texto('tempo ->', M + 128, topo - s - 6, 7.5, { cor: SUAVE });
      d.y -= s + 36;
    }
  }
  d.subtitulo('Grid');
  const dados: [string, string][] = [
    ['Largura máxima', `${lay.container}px`],
    ['Colunas', String(lay.colunas)],
    ['Espaço entre colunas', `${lay.gutter}px`],
    ['Margem no celular', `${lay.margem}px`],
    ['Tablet a partir de', `${lay.tablet}px`],
    ['Desktop a partir de', `${lay.desktop}px`],
  ];
  for (const [k, v] of dados) {
    d.texto(k, M, d.y - 10, 9);
    d.texto(v, M + 150, d.y - 10, 9, { mono: true });
    d.y -= 15;
  }
  d.garantir(80);
  d.y -= 8;
  const cols = Math.max(1, Math.min(24, lay.colunas));
  const g = (lay.gutter / lay.container) * LARGURA;
  const wc = (LARGURA - g * (cols - 1)) / cols;
  for (let i = 0; i < cols; i++)
    d.pagina.drawRectangle({
      x: M + i * (wc + g),
      y: d.y - 60,
      width: wc,
      height: 60,
      color: deHex(f.cores.primaria.escuro),
      opacity: 0.18,
    });
  d.texto(
    `${cols} colunas em ${lay.container}px · classes .kx-container e .kx-grid`,
    M,
    d.y - 74,
    8,
    { cor: SUAVE },
  );
  d.y -= 86;
}

function componentes(d: Doc, lista: ComponentePdf[]) {
  d.secaoNova(
    'Componentes',
    'Os componentes do projeto, todos ligados aos tokens desta Fundação. No Figma, cada um vira um conjunto de variantes com as mesmas variáveis.',
  );
  d.texto('Componente', M, d.y - 9, 8, { cor: SUAVE, negrito: true });
  d.texto('Categoria', M + 260, d.y - 9, 8, { cor: SUAVE, negrito: true });
  d.texto('Variantes', M + 420, d.y - 9, 8, { cor: SUAVE, negrito: true });
  d.y -= 16;
  for (const c of lista) {
    d.garantir(18);
    d.texto(c.nome, M, d.y - 10, 9.5, { negrito: true });
    d.texto(c.categoria, M + 260, d.y - 10, 9, { cor: SUAVE });
    d.texto(String(c.variantes), M + 420, d.y - 10, 9);
    d.pagina.drawLine({
      start: { x: M, y: d.y - 15 },
      end: { x: A4.l - M, y: d.y - 15 },
      thickness: 0.4,
      color: LINHA,
    });
    d.y -= 19;
  }
}

function tokens(d: Doc, f: KcxFundacao) {
  d.secaoNova(
    'Tokens (CSS)',
    'As variáveis CSS geradas pela Fundação. Cole num arquivo .css do projeto (ou baixe pronto em Design system -> Baixar tokens).',
  );
  for (const l of cssDaFundacao(f).split('\n')) {
    for (const parte of d.linhas(l || ' ', 7, LARGURA, false, true)) {
      d.garantir(9);
      d.texto(parte, M, d.y - 7, 7, { mono: true });
      d.y -= 9;
    }
  }
}

/** Gera o PDF do design system. */
export async function pdfDoDesignSystem(f: KcxFundacao, op: OpcoesPdf = {}): Promise<Uint8Array> {
  const tema = op.tema ?? 'escuro';
  const pdf = await PDFDocument.create();
  pdf.setTitle(textoPdf(`Design system ${f.nome}`));
  pdf.setSubject('Design system gerado pelo Kalixto Creative Lab');
  pdf.setCreator('Kalixto Creative Lab · KCX Studio');
  pdf.setLanguage('pt-BR');
  const fontes = {
    normal: await pdf.embedFont(StandardFonts.Helvetica),
    negrito: await pdf.embedFont(StandardFonts.HelveticaBold),
    mono: await pdf.embedFont(StandardFonts.Courier),
  };
  const d = new Doc(pdf, fontes, f.nome, f.cores.primaria.escuro);
  let logo;
  if (op.logo) {
    try {
      logo = {
        img:
          op.logo.tipo === 'png'
            ? await pdf.embedPng(op.logo.bytes)
            : await pdf.embedJpg(op.logo.bytes),
      };
    } catch {
      logo = undefined;
    }
  }
  capa(d, f, op, logo);
  // Sumário: página reservada, preenchida no fim
  d.secao = 'Sumário';
  d.novaPagina();
  const paginaSumario = d.pagina;
  cores(d, f, tema);
  escalas(d, f, tema);
  contraste(d, f, tema);
  tipografia(d, f);
  espacosRaiosSombras(d, f);
  movimentoGrid(d, f);
  if (op.componentes?.length) componentes(d, op.componentes);
  tokens(d, f);

  d.pagina = paginaSumario;
  let y = A4.a - M - 18;
  d.texto('Sumário', M, y - 22, 22, { negrito: true });
  y -= 60;
  d.sumario.forEach((s, i) => {
    const n = String(s.pagina);
    d.texto(`${String(i + 1).padStart(2, '0')}`, M, y, 11, {
      cor: deHex(f.cores.primaria.escuro),
      negrito: true,
    });
    d.texto(s.titulo, M + 30, y, 12);
    const xn = A4.l - M - d.largura(n, 12);
    const inicio = M + 38 + d.largura(s.titulo, 12);
    d.pagina.drawLine({
      start: { x: inicio, y: y + 3 },
      end: { x: xn - 8, y: y + 3 },
      thickness: 0.5,
      color: LINHA,
      dashArray: [1.5, 3],
    });
    d.texto(n, xn, y, 12);
    y -= 26;
  });
  return pdf.save();
}
