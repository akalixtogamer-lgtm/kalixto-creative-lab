/**
 * Mapa de navegação e fluxos no Figma: um frame com uma caixa (frame) por
 * página ou passo, setas como vetores e os gatilhos como etiquetas.
 * Tudo editável: as caixas têm nome, e o texto é texto de verdade.
 */
import { CoresDiagrama, Diagrama, NoDiagrama, corDoNo } from '../projeto/navegacao';
import { Figma, No } from './construir/tipos';

const rgb = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
};
const solido = (hex: string, opacity = 1) => [{ type: 'SOLID', color: rgb(hex), opacity }];
const escSvg = (s: string) =>
  s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

interface Fontes {
  normal: { family: string; style: string };
  forte: { family: string; style: string };
}

async function carregarFontes(f: Figma): Promise<Fontes> {
  const normal = { family: 'Inter', style: 'Regular' };
  await f.loadFontAsync(normal);
  for (const style of ['Semi Bold', 'Bold']) {
    try {
      await f.loadFontAsync({ family: 'Inter', style });
      return { normal, forte: { family: 'Inter', style } };
    } catch {
      /* tenta a próxima */
    }
  }
  return { normal, forte: normal };
}

function texto(
  f: Figma,
  fontes: Fontes,
  conteudo: string,
  o: { tamanho: number; cor: string; forte?: boolean; centro?: boolean; largura?: number },
): No {
  const t = f.createText();
  t.fontName = o.forte ? fontes.forte : fontes.normal;
  t.fontSize = o.tamanho;
  t.characters = conteudo;
  t.fills = solido(o.cor);
  t.lineHeight = { value: Math.round(o.tamanho * 1.3), unit: 'PIXELS' };
  if (o.largura) {
    t.textAutoResize = 'HEIGHT';
    t.resize(o.largura, t.height || o.tamanho * 1.3);
  }
  if (o.centro) t.textAlignHorizontal = 'CENTER';
  return t;
}

function caixa(
  f: Figma,
  fontes: Fontes,
  n: NoDiagrama,
  c: CoresDiagrama,
  tipo: Diagrama['tipo'],
): No {
  const borda = corDoNo(n, c);
  const larg = n.estado ? 2 : 1;
  const quadro = f.createFrame();
  quadro.name =
    n.forma === 'pagina'
      ? `Página · ${n.titulo.replace(/\n/g, ' ')}`
      : `${{ pilula: 'Início/Fim', retangulo: 'Ação', losango: 'Decisão', tela: 'Tela', pagina: '' }[n.forma]} · ${n.titulo.replace(/\n/g, ' ')}`;
  quadro.x = n.x;
  quadro.y = n.y;
  quadro.resize(n.w, n.h);
  quadro.clipsContent = false;
  quadro.setSharedPluginData?.('kcx', 'diagrama-no', `${tipo}:${n.id}`);
  const centro = n.forma !== 'pagina';
  const corTitulo = n.forma === 'pilula' && n.estado === 'inicio' ? '#ffffff' : c.texto;

  if (n.forma === 'losango') {
    quadro.fills = [];
    const forma = f.createNodeFromSvg(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${n.w}" height="${n.h}" viewBox="0 0 ${n.w} ${n.h}"><polygon points="${n.w / 2},1 ${n.w - 1},${n.h / 2} ${n.w / 2},${n.h - 1} 1,${n.h / 2}" fill="${c.caixa}" stroke="${borda}" stroke-width="${larg}"/></svg>`,
    );
    forma.name = 'Losango';
    forma.fills = [];
    quadro.appendChild(forma);
  } else {
    quadro.fills = solido(n.forma === 'pilula' && n.estado === 'inicio' ? c.acento : c.caixa);
    quadro.strokes = solido(borda);
    quadro.strokeWeight = larg;
    quadro.cornerRadius = n.forma === 'pilula' ? n.h / 2 : 12;
    if (n.forma === 'pagina' || n.forma === 'tela') {
      const barra = f.createRectangle();
      barra.name = 'Barra do navegador';
      barra.resize(n.w, 18);
      barra.fills = solido(borda, 0.55);
      barra.topLeftRadius = 12;
      barra.topRightRadius = 12;
      quadro.appendChild(barra);
    }
  }

  const titulo = texto(f, fontes, n.titulo, {
    tamanho: 14,
    cor: corTitulo,
    forte: true,
    centro,
    largura: n.w - 28,
  });
  titulo.name = 'Título';
  titulo.x = 14;
  const linhasTitulo = n.titulo.split('\n').length;
  titulo.y =
    n.forma === 'pagina' || n.forma === 'tela'
      ? 26
      : n.forma === 'retangulo'
        ? 8
        : Math.round(n.h / 2 - (linhasTitulo * 18) / 2);
  quadro.appendChild(titulo);

  if (n.linhas.length) {
    const linhas = texto(f, fontes, n.linhas.map((l) => (centro ? l : `▪ ${l}`)).join('\n'), {
      tamanho: 12,
      cor: c.suave,
      centro,
      largura: n.w - 28,
    });
    linhas.name = n.forma === 'pagina' ? 'Seções' : 'Detalhe';
    linhas.x = 14;
    linhas.y = titulo.y + linhasTitulo * 18 + 4;
    quadro.appendChild(linhas);
  }
  if (n.etiqueta && n.forma !== 'pilula') {
    const et = texto(f, fontes, n.etiqueta, {
      tamanho: 9,
      cor: n.estado === 'inicio' ? c.acento : c.suave,
      forte: true,
    });
    et.name = 'Etiqueta';
    et.letterSpacing = { value: 1, unit: 'PIXELS' };
    et.x = n.w - 12 - (et.width || 40);
    et.y = 3;
    quadro.appendChild(et);
  }
  return quadro;
}

/** Ponta de seta (triângulo) já girada, em coordenadas do diagrama. */
function ponta(x: number, y: number, angulo: number): string {
  const a = (angulo * Math.PI) / 180;
  const p = (dx: number, dy: number) =>
    `${Math.round((x + dx * Math.cos(a) - dy * Math.sin(a)) * 10) / 10} ${Math.round((y + dx * Math.sin(a) + dy * Math.cos(a)) * 10) / 10}`;
  return `M${p(0, 0)} L${p(-10, -5)} L${p(-10, 5)} Z`;
}

export interface RelatorioDiagrama {
  nome: string;
  caixas: number;
  setas: number;
  id: string;
}

export async function construirDiagrama(
  f: Figma,
  d: Diagrama,
  c: CoresDiagrama,
): Promise<RelatorioDiagrama> {
  const fontes = await carregarFontes(f);
  const quadro = f.createFrame();
  quadro.name = `${d.tipo === 'mapa' ? 'Mapa de navegação' : 'Fluxo'} · ${d.nome}`;
  quadro.resize(d.largura, d.altura);
  quadro.fills = solido(c.fundo);
  quadro.cornerRadius = 16;
  quadro.clipsContent = false;
  quadro.setSharedPluginData?.('kcx', 'diagrama', d.tipo);

  // Setas primeiro (ficam por baixo das caixas).
  for (const a of d.arestas) {
    const traco = a.volta ? ' stroke-dasharray="6 5"' : '';
    const seta = f.createNodeFromSvg(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${d.largura}" height="${d.altura}" viewBox="0 0 ${d.largura} ${d.altura}"><path d="${escSvg(a.d)}" fill="none" stroke="${c.linha}" stroke-width="1.6"${traco}/><path d="${ponta(a.ponta.x, a.ponta.y, a.ponta.angulo)}" fill="${c.linha}"/></svg>`,
    );
    seta.name = `Seta · ${a.rotulo || 'ligação'}`;
    seta.fills = [];
    seta.x = 0;
    seta.y = 0;
    quadro.appendChild(seta);
  }
  for (const n of d.nos) quadro.appendChild(caixa(f, fontes, n, c, d.tipo));
  // Gatilhos por cima de tudo, numa etiqueta com fundo.
  for (const a of d.arestas) {
    if (!a.rotulo) continue;
    const et = f.createFrame();
    et.name = `Gatilho · ${a.rotulo}`;
    et.layoutMode = 'HORIZONTAL';
    et.primaryAxisSizingMode = 'AUTO';
    et.counterAxisSizingMode = 'AUTO';
    et.paddingLeft = et.paddingRight = 8;
    et.paddingTop = et.paddingBottom = 4;
    et.cornerRadius = 6;
    et.fills = solido(c.fundo);
    et.strokes = solido(c.borda);
    et.strokeWeight = 1;
    et.appendChild(texto(f, fontes, a.rotulo, { tamanho: 11, cor: c.suave }));
    quadro.appendChild(et);
    et.x = Math.round(a.lx - (et.width || 0) / 2);
    et.y = Math.round(a.ly - (et.height || 0) / 2);
  }

  const centro = f.viewport?.center ?? { x: 0, y: 0 };
  quadro.x = Math.round(centro.x - d.largura / 2);
  quadro.y = Math.round(centro.y - d.altura / 2);
  f.currentPage.appendChild(quadro);
  f.currentPage.selection = [quadro];
  f.viewport?.scrollAndZoomIntoView?.([quadro]);
  return { nome: quadro.name, caixas: d.nos.length, setas: d.arestas.length, id: quadro.id };
}
