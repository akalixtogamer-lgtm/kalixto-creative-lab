/**
 * Guia do design system: um documento HTML autônomo, gerado da Fundação, com
 * identidade, cores por função (e o porquê de cada uma), escalas tonais,
 * contraste (WCAG), hierarquia de texto, espaços, raios, sombras, movimento,
 * grid e os componentes. É o mesmo HTML que aparece na plataforma e o que se
 * baixa para compartilhar ou imprimir em PDF.
 */
import { contraste, escalaTonal, notaContraste } from './cores';
import { PlanoNo } from './figma-plano';
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
  TokenCor,
  cssDaFundacao,
  funcaoDaCor,
  usoDoTexto,
} from './fundacao';
import { ehImagemValida } from './logo';
import { planoParaHtml } from './plano-html';

export type TemaGuia = 'escuro' | 'claro';

export interface ComponenteGuia {
  nome: string;
  categoria: string;
  variantes: number;
  arvore?: PlanoNo;
  largura: number;
  altura: number;
}

export interface OpcoesGuia {
  tema?: TemaGuia;
  componentes?: ComponenteGuia[];
  /** Data mostrada na capa (padrão: hoje). */
  data?: string;
}

const esc = (s: unknown) =>
  String(s ?? '').replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  );
const fonteSegura = (s: string) => s.replace(/[^\p{L}\p{N} -]/gu, '').trim() || 'Inter';

/** Pares de contraste que importam para leitura e interface. */
export const PARES_CONTRASTE: {
  texto: TokenCor;
  fundo: TokenCor;
  uso: 'texto' | 'interface';
  nome: string;
}[] = [
  { texto: 'texto', fundo: 'fundo', uso: 'texto', nome: 'Texto sobre o fundo' },
  { texto: 'texto', fundo: 'superficie', uso: 'texto', nome: 'Texto sobre a superfície' },
  { texto: 'texto-suave', fundo: 'fundo', uso: 'texto', nome: 'Texto suave sobre o fundo' },
  {
    texto: 'texto-suave',
    fundo: 'superficie',
    uso: 'texto',
    nome: 'Texto suave sobre a superfície',
  },
  { texto: 'sobre-primaria', fundo: 'primaria', uso: 'texto', nome: 'Rótulo do botão principal' },
  {
    texto: 'primaria',
    fundo: 'fundo',
    uso: 'interface',
    nome: 'Primária sobre o fundo (links, ícones)',
  },
  { texto: 'borda', fundo: 'fundo', uso: 'interface', nome: 'Borda de campos sobre o fundo' },
  { texto: 'perigo', fundo: 'fundo', uso: 'interface', nome: 'Erro sobre o fundo' },
  { texto: 'sucesso', fundo: 'fundo', uso: 'interface', nome: 'Sucesso sobre o fundo' },
  { texto: 'aviso', fundo: 'fundo', uso: 'interface', nome: 'Aviso sobre o fundo' },
];

/** Avaliação de contraste da fundação num tema. */
export function contrastesDaFundacao(f: KcxFundacao, tema: TemaGuia) {
  return PARES_CONTRASTE.map((p) => {
    const r = contraste(f.cores[p.texto][tema], f.cores[p.fundo][tema]);
    return { ...p, razao: r, nota: notaContraste(r, p.uso) };
  });
}

export function guiaDoDesignSystem(f: KcxFundacao, op: OpcoesGuia = {}): string {
  const tema: TemaGuia = op.tema ?? 'escuro';
  const c = (t: TokenCor) => f.cores[t][tema];
  const mov = f.movimento ?? MOVIMENTO_PADRAO;
  const lay = f.layout ?? LAYOUT_PADRAO;
  const familias = [...new Set([f.fontes.titulo, f.fontes.corpo, f.fontes.mono].map(fonteSegura))];
  const googleFonts = `https://fonts.googleapis.com/css2?${familias
    .map((x) => `family=${encodeURIComponent(x).replace(/%20/g, '+')}:wght@400;500;600;700;800`)
    .join('&')}&display=swap`;
  const fonte = (k: 'titulo' | 'corpo' | 'mono') =>
    `'${fonteSegura(f.fontes[k])}', ${k === 'mono' ? 'ui-monospace, monospace' : 'system-ui, sans-serif'}`;
  const data = op.data ?? new Date().toISOString().slice(0, 10);

  /* ---------- Seções ---------- */
  const logo =
    f.logo && ehImagemValida(f.logo.src)
      ? `<img class="logo" src="${f.logo.src}" alt="Logo ${esc(f.nome)}">`
      : `<div class="logo-texto">${esc(f.nome)}</div>`;

  const swatch = (t: TokenCor) => {
    const pares = PARES_CONTRASTE.filter((p) => p.texto === t || p.fundo === t)
      .slice(0, 2)
      .map((p) => {
        const r = contraste(c(p.texto), c(p.fundo));
        const n = notaContraste(r, p.uso);
        return `<span class="nota nota--${n === 'Falha' ? 'falha' : 'ok'}" title="${esc(p.nome)}">${esc(p.nome.split(' ')[0])} ${r}:1 · ${n}</span>`;
      })
      .join('');
    return `<article class="cor">
  <div class="cor__amostra" style="background:${c(t)};color:${contraste(c(t), '#ffffff') > contraste(c(t), '#000000') ? '#fff' : '#000'}">Aa</div>
  <div class="cor__info">
    <h4>${esc(NOMES_COR[t])} <code>--kx-cor-${t}</code></h4>
    <p class="hex"><span><i style="background:${f.cores[t].escuro}"></i>Escuro ${f.cores[t].escuro}</span><span><i style="background:${f.cores[t].claro}"></i>Claro ${f.cores[t].claro}</span></p>
    <p>${esc(funcaoDaCor(f, t))}</p>
    ${pares ? `<p class="notas">${pares}</p>` : ''}
  </div>
</article>`;
  };
  const cores = GRUPOS_COR.map(
    (g) => `<div class="grupo">
  <h3>${esc(g.nome)}</h3><p class="suave">${esc(g.descricao)}</p>
  <div class="cores">${g.tokens.map(swatch).join('')}</div>
</div>`,
  ).join('');

  const escalas = TOKENS_ESCALA.map(
    (t) => `<div class="escala">
  <h4>${esc(NOMES_COR[t])}</h4>
  <div class="escala__faixa">${escalaTonal(c(t))
    .map(
      (x) =>
        `<div class="escala__passo" style="background:${x.cor};color:${contraste(x.cor, '#ffffff') > contraste(x.cor, '#000000') ? '#fff' : '#000'}"><b>${x.passo}</b><span>${x.cor}</span></div>`,
    )
    .join('')}</div>
</div>`,
  ).join('');

  const tabelaContraste = contrastesDaFundacao(f, tema)
    .map(
      (p) =>
        `<tr><td><span class="par" style="background:${c(p.fundo)};color:${c(p.texto)}">Aa</span></td><td>${esc(p.nome)}</td><td>${p.razao}:1</td><td>${p.uso === 'texto' ? 'Texto (mín. 4,5:1)' : 'Interface (mín. 3:1)'}</td><td><span class="nota nota--${p.nota === 'Falha' ? 'falha' : 'ok'}">${p.nota}</span></td></tr>`,
    )
    .join('');

  const tipografia = NIVEIS_TEXTO.map((n) => {
    const e = f.texto[n];
    return `<div class="tipo">
  <div class="tipo__amostra" style="font-family:${fonte(e.familia)};font-weight:${e.peso};font-size:${e.tamanho}px;line-height:${e.altura};letter-spacing:${e.espacamento}px">${esc(NOMES_TEXTO[n])} · ${esc(f.nome)}</div>
  <div class="tipo__specs"><b>${esc(NOMES_TEXTO[n])}</b> <code>.kx-texto-${n}</code><br>${esc(f.fontes[e.familia])} · peso ${e.peso} · ${e.tamanho}px (celular ${e.tamanhoCelular}px) · altura ${e.altura} · espaçamento ${e.espacamento}px<br><span class="suave">${esc(usoDoTexto(f, n))}</span></div>
</div>`;
  }).join('');

  const espacos = CHAVES_ESPACO.map(
    (k) =>
      `<div class="esp"><code>espaco/${k}</code><span class="esp__barra" style="width:${f.espacos[k]}px"></span><span>${f.espacos[k]} px</span></div>`,
  ).join('');
  const raios = CHAVES_RAIO.map(
    (k) =>
      `<div class="raio"><div class="raio__caixa" style="border-radius:${Math.min(f.raios[k], 60)}px"></div><code>raio/${k}</code><span>${f.raios[k]} px</span></div>`,
  ).join('');
  const sombras = CHAVES_SOMBRA.map((k) => {
    const s = f.sombras[k];
    return `<div class="sombra"><div class="sombra__caixa" style="box-shadow:${s.x}px ${s.y}px ${s.raio}px ${s.espalhar}px rgb(0 0 0 / ${s.opacidade})"></div><code>sombra/${k}</code><span>${s.x} ${s.y} ${s.raio} ${s.espalhar} · ${Math.round(s.opacidade * 100)}%</span></div>`;
  }).join('');
  const movimento = (['rapido', 'normal', 'lento'] as const)
    .map(
      (k) =>
        `<div class="mov"><code>movimento/${k}</code><div class="mov__trilho"><span class="mov__bola" style="animation-duration:${mov[k] * 4}ms"></span></div><span>${mov[k]} ms</span></div>`,
    )
    .join('');
  const grid = Array.from({ length: Math.min(24, lay.colunas) }, () => '<span></span>').join('');
  const componentes = (op.componentes ?? [])
    .slice(0, 40)
    .map((k) => {
      const escala = Math.min(1, 260 / Math.max(1, k.largura), 150 / Math.max(1, k.altura));
      return `<figure class="comp">
  <div class="comp__previa"><div style="transform:scale(${escala.toFixed(3)});transform-origin:center">${k.arvore ? planoParaHtml(k.arvore) : ''}</div></div>
  <figcaption><b>${esc(k.nome)}</b><span>${esc(k.categoria)} · ${k.variantes} variante${k.variantes === 1 ? '' : 's'}</span></figcaption>
</figure>`;
    })
    .join('');

  const secoes: [string, string, string][] = [
    [
      'cores',
      'Cores por função',
      `<p class="suave">Cada cor tem um papel. Use pela função, não pela aparência: assim trocar a marca não quebra a interface.</p>${cores}`,
    ],
    [
      'escalas',
      'Escalas tonais',
      `<p class="suave">De 50 (mais clara) a 900 (mais escura); 500 é a própria cor. Para fundos de destaque, estados e gráficos.</p>${escalas}`,
    ],
    [
      'contraste',
      'Acessibilidade de contraste',
      `<p class="suave">WCAG 2.1: texto precisa de 4,5:1 (AA) ou 7:1 (AAA); ícones, bordas e texto grande, 3:1.</p><table><thead><tr><th></th><th>Par</th><th>Contraste</th><th>Mínimo</th><th>Nota</th></tr></thead><tbody>${tabelaContraste}</tbody></table>`,
    ],
    [
      'tipografia',
      'Tipografia',
      `<div class="familias">${(['titulo', 'corpo', 'mono'] as const)
        .map(
          (k) =>
            `<div class="familia"><span style="font-family:${fonte(k)}">Aa</span><b>${esc(f.fontes[k])}</b><small>${k === 'titulo' ? 'Títulos' : k === 'corpo' ? 'Texto corrido' : 'Código e números'}</small></div>`,
        )
        .join('')}</div><h3>Hierarquia</h3>${tipografia}`,
    ],
    [
      'espacos',
      'Espaçamento',
      `<p class="suave">Escala de 4 px. Espaços pequenos agrupam; grandes separam.</p>${espacos}`,
    ],
    ['raios', 'Cantos (raios)', `<div class="linha">${raios}</div>`],
    [
      'sombras',
      'Sombras (elevação)',
      `<p class="suave">P para cards, M para menus, G para janelas.</p><div class="linha">${sombras}</div>`,
    ],
    [
      'movimento',
      'Movimento',
      `<p class="suave">Curva padrão <code>${esc(mov.easing)}</code>. Rápido para hover, normal para abrir e fechar, lento para entradas grandes. Respeite “reduzir movimento”.</p>${movimento}`,
    ],
    [
      'grid',
      'Layout e grid',
      `<p class="suave">Conteúdo até ${lay.container} px · ${lay.colunas} colunas com ${lay.gutter} px entre elas no desktop (a partir de ${lay.desktop} px), 8 no tablet (a partir de ${lay.tablet} px) e 4 no celular, com margem de ${lay.margem} px.</p><div class="grid" style="grid-template-columns:repeat(${Math.min(24, lay.colunas)},1fr);gap:${Math.min(lay.gutter, 40)}px">${grid}</div>`,
    ],
    ...(componentes
      ? ([
          [
            'componentes',
            'Componentes',
            `<p class="suave">Componentes feitos com esta fundação (como ficam no Figma).</p><div class="comps">${componentes}</div>`,
          ],
        ] as [string, string, string][])
      : []),
    [
      'codigo',
      'Tokens (CSS)',
      `<p class="suave">Cole no seu projeto. No Figma, os mesmos tokens são variáveis "Fundação/…".</p><pre>${esc(cssDaFundacao(f))}</pre>`,
    ],
  ];

  return `<!doctype html>
<html lang="pt-BR" data-tema="${tema}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data: https:; style-src 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com">
<title>Design system ${esc(f.nome)}</title>
<link rel="stylesheet" href="${googleFonts}">
<style>
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;background:${c('fundo')};color:${c('texto')};font-family:${fonte('corpo')};font-size:16px;line-height:1.55}
main{max-width:1100px;margin:0 auto;padding:48px 32px 96px}
h1,h2,h3,h4{font-family:${fonte('titulo')};margin:0;line-height:1.15}
h2{font-size:32px;margin:72px 0 8px;padding-top:24px;border-top:1px solid ${c('borda')}}
h3{font-size:20px;margin:32px 0 4px}
h4{font-size:16px}
code{font-family:${fonte('mono')};font-size:.8em;color:${c('texto-suave')}}
.suave{color:${c('texto-suave')};margin:4px 0 16px}
.capa{display:grid;gap:16px;padding:48px;border-radius:${f.raios.g}px;background:linear-gradient(135deg,${c('primaria')},${c('secundaria')});color:${c('sobre-primaria')}}
.capa h1{font-size:${Math.min(64, f.texto.display.tamanho)}px}
.capa p{margin:0;opacity:.9}
.logo{max-height:72px;max-width:280px;object-fit:contain;justify-self:start}
.logo-texto{font-family:${fonte('titulo')};font-weight:800;font-size:28px}
nav{display:flex;flex-wrap:wrap;gap:8px;margin:24px 0}
nav a{padding:6px 12px;border-radius:999px;background:${c('superficie')};color:${c('texto')};text-decoration:none;font-size:14px;border:1px solid ${c('borda')}}
.cores{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px}
.cor{display:grid;grid-template-columns:88px 1fr;gap:16px;padding:16px;border-radius:${f.raios.m}px;background:${c('superficie')};border:1px solid ${c('borda')}}
.cor__amostra{display:grid;place-items:center;border-radius:${f.raios.m}px;font:700 24px ${fonte('titulo')};min-height:88px;box-shadow:inset 0 0 0 1px rgb(127 127 127 / .25)}
.cor__info p{margin:6px 0 0;font-size:14px}
.hex{display:flex;flex-wrap:wrap;gap:12px;color:${c('texto-suave')};font-family:${fonte('mono')};font-size:12px!important}
.hex i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:4px;vertical-align:-1px;box-shadow:0 0 0 1px rgb(127 127 127 / .4)}
.notas{display:flex;flex-wrap:wrap;gap:6px}
.nota{display:inline-block;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:600}
.nota--ok{background:color-mix(in srgb,${c('sucesso')} 22%,transparent);color:${c('texto')}}
.nota--falha{background:color-mix(in srgb,${c('perigo')} 28%,transparent);color:${c('texto')}}
.escala{margin:16px 0}
.escala__faixa{display:grid;grid-template-columns:repeat(10,1fr);border-radius:${f.raios.m}px;overflow:hidden}
.escala__passo{display:grid;gap:2px;padding:28px 6px 8px;font-size:11px}
.escala__passo span{font-family:${fonte('mono')};opacity:.85}
table{width:100%;border-collapse:collapse;font-size:14px}
th,td{text-align:left;padding:10px 8px;border-bottom:1px solid ${c('borda')}}
.par{display:inline-grid;place-items:center;width:40px;height:28px;border-radius:6px;font-weight:700;box-shadow:inset 0 0 0 1px rgb(127 127 127 / .3)}
.familias{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.familia{display:grid;gap:4px;padding:20px;border-radius:${f.raios.m}px;background:${c('superficie')};border:1px solid ${c('borda')}}
.familia span{font-size:56px;line-height:1}
.familia small{color:${c('texto-suave')}}
.tipo{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(0,1fr);gap:24px;align-items:center;padding:20px 0;border-bottom:1px solid ${c('borda')}}
.tipo__amostra{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.tipo__specs{font-size:13px;line-height:1.6}
.esp{display:grid;grid-template-columns:110px 1fr 70px;align-items:center;gap:12px;margin:8px 0}
.esp__barra{height:16px;border-radius:4px;background:${c('primaria')}}
.linha{display:flex;flex-wrap:wrap;gap:24px}
.raio,.sombra{display:grid;gap:6px;justify-items:start;font-size:13px}
.raio__caixa{width:96px;height:96px;background:${c('superficie')};border:2px solid ${c('primaria')}}
.sombra__caixa{width:140px;height:96px;border-radius:${f.raios.m}px;background:${c('superficie')}}
.mov{display:grid;grid-template-columns:130px 1fr 70px;gap:12px;align-items:center;margin:10px 0}
.mov__trilho{position:relative;height:16px;border-radius:999px;background:${c('superficie')};border:1px solid ${c('borda')}}
.mov__bola{position:absolute;top:1px;left:2px;width:12px;height:12px;border-radius:50%;background:${c('primaria')};animation:anda ease-in-out infinite alternate;animation-timing-function:${esc(mov.easing)}}
@keyframes anda{to{left:calc(100% - 14px)}}
@media (prefers-reduced-motion:reduce){.mov__bola{animation:none}}
.grid{display:grid;height:120px;padding:0 ${Math.min(lay.margem, 40)}px;border-radius:${f.raios.m}px;background:${c('superficie')};border:1px solid ${c('borda')}}
.grid span{background:color-mix(in srgb,${c('primaria')} 22%,transparent);border-inline:1px solid color-mix(in srgb,${c('primaria')} 50%,transparent)}
.comps{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px}
.comp{margin:0;border-radius:${f.raios.m}px;overflow:hidden;background:${c('superficie')};border:1px solid ${c('borda')}}
.comp__previa{display:grid;place-items:center;height:180px;overflow:hidden;background:${c('fundo')}}
.comp figcaption{display:grid;gap:2px;padding:12px 16px;font-size:14px}
.comp figcaption span{color:${c('texto-suave')};font-size:12px}
.svg svg{display:block;width:100%;height:100%;overflow:visible}
pre{overflow:auto;max-height:420px;padding:16px;border-radius:${f.raios.m}px;background:${c('superficie')};border:1px solid ${c('borda')};font:12px/1.5 ${fonte('mono')};color:${c('texto')}}
footer{margin-top:64px;color:${c('texto-suave')};font-size:13px}
@media (max-width:720px){main{padding:24px 16px}.cor{grid-template-columns:64px 1fr}.familias{grid-template-columns:1fr}.tipo{grid-template-columns:1fr}.escala__faixa{grid-template-columns:repeat(5,1fr)}}
@media print{h2{break-before:page}nav{display:none}.mov__bola{animation:none}}
</style>
</head>
<body>
<main>
<header class="capa">
  ${logo}
  <h1>Design system ${esc(f.nome)}</h1>
  <p>Versão ${esc(f.versao)} · ${esc(data)} · Tema ${tema === 'escuro' ? 'escuro' : 'claro'} · Títulos em ${esc(f.fontes.titulo)}, texto em ${esc(f.fontes.corpo)}</p>
</header>
<nav aria-label="Sumário">${secoes.map(([id, nome]) => `<a href="#${id}">${esc(nome)}</a>`).join('')}</nav>
${secoes.map(([id, nome, html]) => `<section id="${id}"><h2>${esc(nome)}</h2>${html}</section>`).join('\n')}
<footer>Gerado pelo KCX Studio · Kalixto Creative Lab. Os mesmos tokens estão no CSS acima e no Figma (variáveis e estilos "Fundação/…").</footer>
</main>
</body>
</html>`;
}
