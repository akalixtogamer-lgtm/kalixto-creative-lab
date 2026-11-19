/**
 * Desenha uma variante do plano do Figma em HTML estático (sem scripts):
 * é a prévia de "como fica no Figma" — mesmas camadas, Auto Layout, cores,
 * raios, sombras e textos que o importador cria. Serve para ver cada variante
 * lado a lado antes de salvar.
 */
import type { FigmaCor, PlanoEfeito, PlanoNo, PlanoPaint } from './figma-plano';

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
      if (Number(e.raio.valor) <= 0 && e.x === 0 && e.y === 0) continue;
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
      `padding:${px(a.paddingY.valor)} ${px(a.paddingX.valor)}`,
      'justify-content:center',
      `align-items:${ALINHAR[a.alinhar ?? 'CENTER']}`,
    );
  }

  // Por último: ganha do display:flex do Auto Layout.
  if (p.visivel && p.visivel.valor === false) s.push('display:none');

  if (p.tipo === 'texto' && p.texto) {
    const t = p.texto;
    const cor = p.preenchimentos[0]?.tipo === 'solido' ? corCss(p.preenchimentos[0].cor.valor) : '';
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
  if (p.tipo === 'svg') {
    const cor = p.svgTraco?.cor.valor !== undefined ? `color:${corCss(p.svgTraco.cor.valor)};` : '';
    return `<div style="${s.join(';')};${cor}line-height:0" class="svg">${svgSeguro(p.svg)}</div>`;
  }
  const filhos = p.filhos.map((f) => no(f, !!p.autoLayout, p.autoLayout?.direcao)).join('');
  return `<div style="${s.join(';')}">${filhos}</div>`;
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
