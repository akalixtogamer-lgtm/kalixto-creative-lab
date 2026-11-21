/**
 * Desenha uma variante do plano do Figma em HTML estático (sem scripts):
 * é a prévia de "como fica no Figma" — mesmas camadas, Auto Layout, cores,
 * raios, sombras e textos que o importador cria. Serve para ver cada variante
 * lado a lado antes de salvar.
 */
import type { FigmaCor, PlanoEfeito, PlanoNo, PlanoPaint } from './figma-plano';
import { ICONES_KCX } from './icones';

const esc = (s: unknown) =>
  String(s ?? '').replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  );

const px = (n: unknown) => `${Math.round(Number(n) * 100) / 100}px`;

export function corCss(c: FigmaCor | undefined, opacidade = 1): string {
  if (!c) return 'transparent';
  const a = (c.a ?? 1) * opacidade;
  const v = (x: number) => Math.round(Math.min(1, Math.max(0, x)) * 255);
  return `rgba(${v(c.r)}, ${v(c.g)}, ${v(c.b)}, ${Math.round(a * 1000) / 1000})`;
}

function pinturaCss(p: PlanoPaint): string {
  if (p.tipo === 'solido') {
    const c = corCss(p.cor.valor);
    return `linear-gradient(${c}, ${c})`;
  }
  const paradas = p.paradas
    .map((s) => `${corCss(s.cor.valor)} ${Math.round(s.posicao * 100)}%`)
    .join(', ');
  if (p.subtipo === 'GRADIENT_ANGULAR') return `conic-gradient(${paradas})`;
  const [[a, b]] = p.transformacao;
  const graus = Math.round(90 + (Math.atan2(b, a) * 180) / Math.PI);
  return `linear-gradient(${graus}deg, ${paradas})`;
}

function sombras(efeitos: PlanoEfeito[]): { sombra: string; filtro: string; fundo: string } {
  const sombra: string[] = [];
  let filtro = '';
  let fundo = '';
  for (const e of efeitos) {
    if (e.tipo === 'DROP_SHADOW') {
      if (Number(e.raio.valor) <= 0 && Number(e.espalhar.valor) <= 0 && e.x === 0 && e.y === 0)
        continue;
      sombra.push(
        `${px(e.x)} ${px(e.y)} ${px(Number(e.raio.valor) / 2)} ${px(e.espalhar.valor)} ${corCss(e.cor.valor)}`,
      );
    } else if (e.tipo === 'LAYER_BLUR') filtro = `blur(${px(Number(e.raio.valor) / 2)})`;
    else fundo = `blur(${px(Number(e.raio.valor) / 2)})`;
  }
  return { sombra: sombra.join(', '), filtro, fundo };
}

const ALINHAR: Record<string, string> = { MIN: 'flex-start', CENTER: 'center', MAX: 'flex-end' };

function no(p: PlanoNo, paiAuto: boolean, paiDirecao?: 'HORIZONTAL' | 'VERTICAL'): string {
  const s: string[] = ['box-sizing:border-box'];
  const noFluxo = paiAuto && !p.absoluto;
  if (!noFluxo) {
    s.push('position:absolute', `left:${px(p.x ?? 0)}`, `top:${px(p.y ?? 0)}`);
    if (p.restricoes?.horizontal === 'STRETCH') s.push('left:0', 'right:0');
    if (p.restricoes?.vertical === 'STRETCH') s.push('top:0', 'bottom:0');
  } else {
    s.push('position:relative', 'flex-shrink:0');
    const encher = p.encher || p.texto?.preencher;
    if (encher) s.push(paiDirecao === 'VERTICAL' ? 'align-self:stretch' : 'flex:1 1 0');
  }
  if (p.tipo !== 'texto') {
    if (p.largura && p.restricoes?.horizontal !== 'STRETCH') s.push(`width:${px(p.largura.valor)}`);
    if (p.altura && p.restricoes?.vertical !== 'STRETCH') s.push(`height:${px(p.altura.valor)}`);
  }
  if (p.larguraMin) s.push(`min-width:${px(p.larguraMin.valor)}`);
  if (p.larguraMax) s.push(`max-width:${px(p.larguraMax.valor)}`);
  if (p.rotacao) s.push(`transform:rotate(${-p.rotacao}deg)`, 'transform-origin:0 0');
  if (p.opacidade) s.push(`opacity:${Math.min(1, Math.max(0, Number(p.opacidade.valor)))}`);
  if (p.raio) s.push(`border-radius:${px(p.raio.valor)}`);
  if (p.tipo === 'elipse') s.push('border-radius:50%');
  if (p.recortar) s.push('overflow:hidden');
  if (p.preenchimentos.length && p.tipo !== 'svg' && p.tipo !== 'texto')
    s.push(`background:${[...p.preenchimentos].reverse().map(pinturaCss).join(', ')}`);
  if (p.traco)
    s.push(
      `box-shadow:inset 0 0 0 ${px(p.traco.espessura.valor)} ${
        p.traco.pintura.tipo === 'solido' ? corCss(p.traco.pintura.cor.valor) : '#888'
      }`,
    );
  const ef = sombras(p.efeitos);
  if (ef.sombra) {
    const i = s.findIndex((x) => x.startsWith('box-shadow:'));
    if (i >= 0) s[i] += `, ${ef.sombra}`;
    else s.push(`box-shadow:${ef.sombra}`);
  }
  if (ef.filtro) s.push(`filter:${ef.filtro}`);
  if (ef.fundo) s.push(`backdrop-filter:${ef.fundo}`);
  if (p.autoLayout) {
    const a = p.autoLayout;
    s.push(
      'display:flex',
      `flex-direction:${a.direcao === 'HORIZONTAL' ? 'row' : 'column'}`,
      `gap:${px(a.espaco.valor)}`,
      `padding:${px((a.lados?.cima ?? a.paddingY).valor)} ${px((a.lados?.direita ?? a.paddingX).valor)} ${px((a.lados?.baixo ?? a.paddingY).valor)} ${px((a.lados?.esquerda ?? a.paddingX).valor)}`,
      a.quebrar ? 'flex-wrap:wrap' : '',
      a.distribuir ? 'justify-content:space-between' : 'justify-content:center',
      `align-items:${ALINHAR[a.alinhar ?? 'CENTER']}`,
    );
  }

  // Por último: ganha do display:flex do Auto Layout.
  if (p.visivel && p.visivel.valor === false) s.push('display:none');

  if (p.tipo === 'texto' && p.texto) {
    const t = p.texto;
    const cor = corDoTexto(p.preenchimentos);
    s.push(
      `font-family:'${esc(t.familia)}', Inter, system-ui, sans-serif`,
      `font-weight:${pesoFonte(t.estilo)}`,
      `font-size:${px(t.tamanho.valor)}`,
      'line-height:1.2',
      `text-align:${t.alinhamento.toLowerCase()}`,
      t.preencher ? 'white-space:normal' : 'white-space:pre',
    );
    if (/italic/i.test(t.estilo)) s.push('font-style:italic');
    if (cor) s.push(`color:${cor}`);
    if (t.espacamento) s.push(`letter-spacing:${px(t.espacamento.valor)}`);
    if (t.caixaAlta) s.push('text-transform:uppercase');
    return `<div style="${s.join(';')}">${esc(t.conteudo.valor)}</div>`;
  }
  if (p.tipo === 'instancia' && p.instancia?.arvore) {
    const dentro = no(
      { ...p.instancia.arvore, absoluto: false, encher: false },
      true,
      'HORIZONTAL',
    );
    return `<div style="${s.join(';')}">${dentro}</div>`;
  }
  if (p.grade) {
    s.push(
      'display:grid',
      `grid-template-columns:repeat(${p.grade.colunas}, max-content)`,
      `gap:${px(p.grade.espaco.valor)}`,
    );
  }
  if (p.slot) s.push('outline:1px dashed rgba(160,150,220,.45)', 'outline-offset:-1px');
  if (p.tipo === 'icone' && p.icone) {
    const t = p.icone.tamanho;
    const d = ICONES_KCX[p.icone.nome] ?? '';
    s.push(`width:${px(t)}`, `height:${px(t)}`, 'line-height:0');
    return `<div style="${s.join(';')}"><svg viewBox="0 0 24 24" width="100%" height="100%" fill="none"><path d="${esc(d)}" stroke="${corCss(p.icone.cor.valor)}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></div>`;
  }
  if (p.tipo === 'svg') {
    const cor = p.svgTraco?.cor.valor !== undefined ? `color:${corCss(p.svgTraco.cor.valor)};` : '';
    return `<div style="${s.join(';')};${cor}line-height:0" class="svg">${svgSeguro(p.svg)}</div>`;
  }
  const filhos = p.filhos
    .map((f) => no(f, !!p.autoLayout || !!p.grade, p.autoLayout?.direcao))
    .join('');
  return `<div style="${s.join(';')}">${filhos}</div>`;
}

/** Cor final do texto: as pinturas sólidas empilhadas (a última fica por cima). */
function corDoTexto(pinturas: PlanoPaint[]): string {
  let r = 0,
    g = 0,
    b = 0,
    a = 0;
  for (const p of pinturas) {
    if (p.tipo !== 'solido') continue;
    const c = p.cor.valor;
    const ca = c.a ?? 1;
    const na = ca + a * (1 - ca);
    if (na <= 0) continue;
    r = (c.r * ca + r * a * (1 - ca)) / na;
    g = (c.g * ca + g * a * (1 - ca)) / na;
    b = (c.b * ca + b * a * (1 - ca)) / na;
    a = na;
  }
  return a > 0 ? corCss({ r, g, b, a }) : '';
}

/** Tira scripts e handlers do SVG (a prévia só desenha). */
function svgSeguro(svg = ''): string {
  return svg
    .replace(/<script[\s\S]*?<\/script\s*>/gi, '')
    .replace(/<foreignObject[\s\S]*?<\/foreignObject\s*>/gi, '')
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/(href\s*=\s*["']?)\s*javascript:/gi, '$1#');
}

function pesoFonte(estilo: string): number {
  const e = estilo.toLowerCase();
  if (e.includes('black')) return 900;
  if (e.includes('extra bold')) return 800;
  if (e.includes('semi bold')) return 600;
  if (e.includes('bold')) return 700;
  if (e.includes('medium')) return 500;
  if (e.includes('light')) return 300;
  return 400;
}

/** HTML do nó raiz de uma variante (posicionado na origem). */
export function planoParaHtml(raiz: PlanoNo): string {
  // A raiz entra "no fluxo" (relative) para o quadro ter o tamanho dela.
  return no({ ...raiz, absoluto: false, encher: false }, true, 'HORIZONTAL');
}

/**
 * Documento completo que mostra a variante centralizada e reduzida para caber
 * no quadro. O único script mede a camada e ajusta o zoom (o iframe é
 * sandbox="allow-scripts", sem acesso ao app).
 */
export function documentoDaVariante(raiz: PlanoNo, fundo = '#0b0a14'): string {
  return `<!doctype html><html><head><meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data: https:; style-src 'unsafe-inline'; script-src 'unsafe-inline'">
<style>
html,body{margin:0;height:100%;background:${fundo};overflow:hidden}
body{display:grid;place-items:center}
#v{position:relative;visibility:hidden}
.svg svg{display:block;width:100%;height:100%;overflow:visible}
</style></head><body><div id="v">${planoParaHtml(raiz)}</div>
<script>(function(){var v=document.getElementById('v');function f(){v.style.zoom=1;var b=v.getBoundingClientRect(),x0=b.left,y0=b.top,x1=b.right,y1=b.bottom;v.querySelectorAll('*').forEach(function(e){var r=e.getBoundingClientRect();if(!r.width&&!r.height)return;x0=Math.min(x0,r.left);y0=Math.min(y0,r.top);x1=Math.max(x1,r.right);y1=Math.max(y1,r.bottom);});var k=Math.min(1,(innerWidth-24)/Math.max(1,x1-x0),(innerHeight-24)/Math.max(1,y1-y0));v.style.zoom=k;v.style.visibility='visible';}f();addEventListener('resize',f);})();</script>
</body></html>`;
}

/** Cores do "cromo" da grade (bordas, rótulos), lidas do tema da página. */
export interface CoresGrade {
  borda: string;
  bordaForte: string;
  superficie: string;
  destaque: string;
  texto: string;
  textoSuave: string;
}

export const CORES_GRADE_PADRAO: CoresGrade = {
  borda: 'rgba(255,255,255,.12)',
  bordaForte: 'rgba(255,255,255,.28)',
  superficie: '#14121f',
  destaque: '#22d3ee',
  texto: '#f5f3ff',
  textoSuave: '#c4c0d9',
};

const escAttr = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * Um documento só com TODAS as variantes em grade (em vez de um iframe por
 * variante). Cada célula é um botão; clicar avisa a página com
 * `postMessage({ kcxVariante: i })`. A página manda `{ kcxSelecionada: i }`
 * para marcar a escolhida, e o documento devolve `{ kcxAltura: px }` para a
 * página ajustar a altura do iframe.
 */
export function documentoDaGrade(
  itens: { arvore: PlanoNo; rotulo: string }[],
  opcoes: { altura?: number; fundo?: string; cores?: CoresGrade; selecionada?: number } = {},
): string {
  const altura = opcoes.altura ?? 150;
  const fundo = opcoes.fundo ?? '#0b0a14';
  const c = opcoes.cores ?? CORES_GRADE_PADRAO;
  const celulas = itens
    .map(
      (it, i) =>
        `<li><button type="button" class="m" data-i="${i}" aria-pressed="${i === opcoes.selecionada}" aria-label="Ver variante ${escAttr(it.rotulo)}"><div class="p" style="height:${altura}px"><div class="v">${planoParaHtml(it.arvore)}</div></div><span class="r">${escAttr(it.rotulo)}</span></button></li>`,
    )
    .join('');
  return `<!doctype html><html><head><meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data: https:; style-src 'unsafe-inline'; script-src 'unsafe-inline'">
<style>
html,body{margin:0;background:transparent;font:13px/1.3 system-ui,sans-serif}
ul{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;margin:0;padding:2px;list-style:none}
.m{display:grid;width:100%;padding:0;overflow:hidden;border:1px solid ${c.borda};border-radius:12px;background:${c.superficie};color:${c.textoSuave};font:inherit;text-align:left;cursor:pointer}
.m:hover{border-color:${c.bordaForte}}
.m:focus-visible{outline:2px solid ${c.destaque};outline-offset:2px}
.m[aria-pressed=true]{border-color:${c.destaque};box-shadow:0 0 0 1px ${c.destaque}}
.m[aria-pressed=true] .r{color:${c.texto};font-weight:600}
.p{display:grid;place-items:center;overflow:hidden;background:${fundo};pointer-events:none}
.v{position:relative;visibility:hidden}
.r{padding:8px 10px}
.svg svg{display:block;width:100%;height:100%;overflow:visible}
</style></head><body><ul>${celulas}</ul>
<script>(function(){
function fit(v){var p=v.parentNode;v.style.zoom=1;var b=v.getBoundingClientRect(),x0=b.left,y0=b.top,x1=b.right,y1=b.bottom;v.querySelectorAll('*').forEach(function(e){var r=e.getBoundingClientRect();if(!r.width&&!r.height)return;x0=Math.min(x0,r.left);y0=Math.min(y0,r.top);x1=Math.max(x1,r.right);y1=Math.max(y1,r.bottom);});var k=Math.min(1,(p.clientWidth-24)/Math.max(1,x1-x0),(p.clientHeight-24)/Math.max(1,y1-y0));v.style.zoom=k;v.style.visibility='visible';}
function tudo(){document.querySelectorAll('.v').forEach(fit);parent.postMessage({kcxAltura:document.documentElement.scrollHeight},'*');}
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('.m');if(b)parent.postMessage({kcxVariante:Number(b.dataset.i)},'*');});
addEventListener('message',function(e){if(e.source!==parent||!e.data||typeof e.data.kcxSelecionada!=='number')return;document.querySelectorAll('.m').forEach(function(b){b.setAttribute('aria-pressed',String(Number(b.dataset.i)===e.data.kcxSelecionada));});});
tudo();addEventListener('resize',tudo);
})();</script>
</body></html>`;
}

/**
 * Página inteira no tamanho real (sem encaixar no espaço): para o mockup de
 * dispositivo. O iframe tem a largura do dispositivo e rola na vertical.
 */
export function documentoDaTela(raiz: PlanoNo, fundo = '#0b0a14', medir = false): string {
  // Com `medir`, um script avisa a página onde cada seção está (para arrastar no mockup).
  const script = medir
    ? `<script>(function(){function m(){var r=document.querySelector('#t>div');if(!r)return;var l=[].map.call(r.children,function(e){var b=e.getBoundingClientRect();return{x:b.left,y:b.top+scrollY,w:b.width,h:b.height}});parent.postMessage({kcxTela:{secoes:l,rolagem:scrollY}},'*')}addEventListener('load',m);addEventListener('resize',m);addEventListener('scroll',m,{passive:true});setTimeout(m,200)})();</script>`
    : '';
  return `<!doctype html><html><head><meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data: https:; style-src 'unsafe-inline'${medir ? "; script-src 'unsafe-inline'" : ''}">
<style>
html,body{margin:0;background:${fundo}}
body{overflow-x:hidden}
#t{position:relative;margin:0 auto;width:max-content;min-width:100%}
#t>*{min-height:100vh;justify-content:flex-start!important}
.svg svg{display:block;width:100%;height:100%;overflow:visible}
</style></head><body><div id="t">${planoParaHtml(raiz)}</div>${script}</body></html>`;
}

/**
 * Fundo colorido (manchas em gradiente) para ver vidro e transparência: em cima
 * de um fundo liso, o desfoque não aparece.
 */
export function fundoColorido(cores: [string, string, string], base = '#0b0a14'): string {
  const [a, b, c] = cores.map(corCssSegura);
  return [
    `radial-gradient(circle at 18% 22%, ${a} 0, transparent 38%)`,
    `radial-gradient(circle at 82% 30%, ${b} 0, transparent 36%)`,
    `radial-gradient(circle at 50% 85%, ${c} 0, transparent 40%)`,
    corCssSegura(base),
  ].join(', ');
}

/** Só aceita cores hex (o valor vai para dentro de um <style>). */
function corCssSegura(c: string): string {
  return /^#[0-9a-fA-F]{3,8}$/.test(c) ? c : '#0b0a14';
}
