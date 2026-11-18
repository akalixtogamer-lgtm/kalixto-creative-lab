/**
 * Exportações de um componente KCX: pacote .kcx.json (5 modos), tokens
 * (formato W3C Design Tokens), SVG estático e código-fonte independente (.zip).
 */
import { ArquivoZip } from '../shared/utils/zip';
import { montarDocumentoKcx, cssCompleto } from './documento';
import { KcxComponente, KcxGradiente, KcxModoExportacao, KcxPacote } from './kcx.types';
import { PlanoEfeito, PlanoNo, PlanoPaint, planejarFigma, FigmaCor } from './figma-plano';
import { Valores, blocoRoot, gradienteCss, resolverSaidas, valoresAtuais } from './resolver';
import { runtimeStandalone } from './runtime';
import { criarPacote, serializar } from './serializar';
import { corDeFigma } from './unidades';

export const MODOS_EXPORTACAO: { id: KcxModoExportacao; nome: string; descricao: string }[] = [
  {
    id: 'completo',
    nome: 'Componente completo',
    descricao:
      'Componente com variantes, variáveis vinculadas, documentação e código-fonte guardado no Figma.',
  },
  {
    id: 'visual',
    nome: 'Apenas elementos visuais',
    descricao: 'Camadas e variantes com os valores atuais fixos, sem criar variáveis.',
  },
  {
    id: 'variaveis',
    nome: 'Apenas variáveis',
    descricao: 'Só as coleções e variáveis (Colors, Dimensions, Motion…), sem camadas.',
  },
  {
    id: 'componentes-variaveis',
    nome: 'Componentes e variáveis',
    descricao: 'Componente e variáveis vinculadas, sem o quadro de documentação.',
  },
  {
    id: 'pacote',
    nome: 'Pacote KCX completo',
    descricao:
      'Tudo: componente, variáveis, documentação, presets, estados e código. O plugin importa como "completo".',
  },
];

/** Pacote para download, já com os valores atuais do editor. */
export function pacoteDoEditor(
  comp: KcxComponente,
  valores: Valores,
  modo: KcxModoExportacao,
  presetAplicado?: string,
): KcxPacote {
  // Em todos os modos o pacote continua completo e válido; o modo só orienta o plugin.
  return criarPacote([comp], { modo, valores: { [comp.id]: valores }, presetAplicado });
}

/* ============================== Tokens (W3C Design Tokens) ============================== */

const kebab = (s: string) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

export function tokensW3C(comp: KcxComponente, valores: Valores): Record<string, unknown> {
  const atuais = valoresAtuais(comp.variaveis, valores);
  const grupo: Record<string, unknown> = {};
  for (const v of comp.variaveis) {
    if (!v.exportavel) continue;
    const x = atuais[v.id];
    const base = {
      $description: v.descricao,
      $extensions: {
        'com.kalixto.kcx': {
          tipo: v.tipo,
          grupo: v.grupo,
          vinculos: v.vinculos.map((l) => l.propriedade),
        },
      },
    };
    let token: Record<string, unknown>;
    switch (v.tipo) {
      case 'color':
        token = { $type: 'color', $value: x };
        break;
      case 'dimension':
        token = { $type: 'dimension', $value: `${x}${v.unidade ?? 'px'}` };
        break;
      case 'time':
        token = { $type: 'duration', $value: `${x}${v.unidade ?? 's'}` };
        break;
      case 'number':
      case 'float':
        token = { $type: 'number', $value: x };
        break;
      case 'gradient':
        token = {
          $type: 'gradient',
          $value: (x as KcxGradiente).paradas.map((p) => ({ color: p.cor, position: p.posicao })),
          $extensions: {
            'com.kalixto.kcx': {
              angulo: (x as KcxGradiente).angulo,
              css: gradienteCss(x as KcxGradiente),
            },
          },
        };
        break;
      default:
        token = { $value: x };
    }
    grupo[kebab(v.id)] = { ...base, ...token };
  }
  return { [comp.id]: grupo };
}

/* ============================== SVG estático ============================== */

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const cor = (c: FigmaCor) => corDeFigma(c).slice(0, 7);
const alfa = (c: FigmaCor) => (c.a < 1 ? ` stop-opacity="${c.a}"` : '');

/** Tamanho de um nó (texto estimado; Auto Layout soma os filhos). */
function medir(n: PlanoNo): { w: number; h: number } {
  if (n.texto) {
    const t = n.texto.caixaAlta ? n.texto.conteudo.valor.toUpperCase() : n.texto.conteudo.valor;
    const tam = Number(n.texto.tamanho.valor);
    return {
      w: Math.round(t.length * tam * 0.62 + t.length * Number(n.texto.espacamento?.valor ?? 0)),
      h: Math.round(tam * 1.2),
    };
  }
  if (n.autoLayout && n.largura === undefined) {
    const filhos = n.filhos.map(medir);
    const gap = Number(n.autoLayout.espaco.valor);
    const px = Number(n.autoLayout.paddingX.valor);
    const py = Number(n.autoLayout.paddingY.valor);
    const hor = n.autoLayout.direcao === 'HORIZONTAL';
    const soma =
      filhos.reduce((s, f) => s + (hor ? f.w : f.h), 0) + gap * Math.max(0, filhos.length - 1);
    const max = Math.max(0, ...filhos.map((f) => (hor ? f.h : f.w)));
    return hor ? { w: soma + 2 * px, h: max + 2 * py } : { w: max + 2 * px, h: soma + 2 * py };
  }
  return { w: Number(n.largura?.valor ?? 0), h: Number(n.altura?.valor ?? 0) };
}

/** Pontos do gradiente (objectBoundingBox) a partir da matriz do Figma. */
function extremos(m: [[number, number, number], [number, number, number]]) {
  const [[a, b, c], [d, e, f]] = m;
  const det = a * e - b * d || 1;
  const inv = (gx: number, gy: number) => ({
    x: (e * (gx - c) - b * (gy - f)) / det,
    y: (-d * (gx - c) + a * (gy - f)) / det,
  });
  return { p1: inv(0, 0.5), p2: inv(1, 0.5) };
}

function svgNo(n: PlanoNo, defs: string[], x0: number, y0: number): string {
  const { w, h } = medir(n);
  const x = x0 + (n.x ?? 0);
  const y = y0 + (n.y ?? 0);
  if (n.visivel && n.visivel.valor === false) return '';
  const filtros = n.efeitos
    .map((ef: PlanoEfeito) =>
      ef.tipo === 'DROP_SHADOW'
        ? `<feDropShadow dx="${ef.x}" dy="${ef.y}" stdDeviation="${Number(ef.raio.valor) / 2}" flood-color="${cor(ef.cor.valor)}" flood-opacity="${ef.cor.valor.a}"/>`
        : `<feGaussianBlur stdDeviation="${Number(ef.raio.valor) / 2}"/>`,
    )
    .join('');
  const idF = `f-${n.id}-${defs.length}`;
  if (filtros)
    defs.push(
      `<filter id="${idF}" x="-100%" y="-100%" width="300%" height="300%">${filtros}</filter>`,
    );
  const attrs = `${n.opacidade ? ` opacity="${n.opacidade.valor}"` : ''}${filtros ? ` filter="url(#${idF})"` : ''}`;
  const preench = (p: PlanoPaint | undefined) => {
    if (!p) return 'none';
    if (p.tipo === 'solido') return cor(p.cor.valor);
    const id = `g-${n.id}-${defs.length}`;
    const { p1, p2 } = extremos(p.transformacao);
    defs.push(
      `<linearGradient id="${id}" x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}">${p.paradas
        .map(
          (s) =>
            `<stop offset="${s.posicao}" stop-color="${cor(s.cor.valor)}"${alfa(s.cor.valor)}/>`,
        )
        .join('')}</linearGradient>`,
    );
    return `url(#${id})`;
  };
  const raio = n.raio ? ` rx="${n.raio.valor}"` : '';
  const traco = n.traco
    ? ` stroke="${cor(n.traco.cor.valor)}" stroke-width="${n.traco.espessura.valor}"`
    : '';
  if (n.tipo === 'texto' && n.texto) {
    const t = n.texto.caixaAlta ? n.texto.conteudo.valor.toUpperCase() : n.texto.conteudo.valor;
    const peso = /bold/i.test(n.texto.estilo) ? (/semi/i.test(n.texto.estilo) ? 600 : 700) : 400;
    return `<text x="${x}" y="${y + Number(n.texto.tamanho.valor)}" font-family="${esc(n.texto.familia)}, system-ui, sans-serif" font-size="${n.texto.tamanho.valor}" font-weight="${peso}" letter-spacing="${n.texto.espacamento?.valor ?? 0}" fill="${preench(n.preenchimentos[0])}"${attrs}>${esc(t)}</text>`;
  }
  if (n.tipo === 'svg' && n.svg) {
    const interno = n.svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
    const st = n.svgTraco;
    const estilo = st
      ? interno
          .replace(/stroke="[^"]*"/g, `stroke="${cor(st.cor.valor)}"`)
          .replace(/stroke-width="[^"]*"/g, `stroke-width="${st.espessura.valor}"`)
          .replace(
            /<path /g,
            st.tracejado ? `<path stroke-dasharray="${st.tracejado.join(' ')}" ` : '<path ',
          )
      : interno;
    const vb = /viewBox="([^"]+)"/.exec(n.svg)?.[1] ?? `0 0 ${w} ${h}`;
    const [, , vw, vh] = vb.split(/\s+/).map(Number);
    return `<svg x="${x}" y="${y}" width="${vw}" height="${vh}" viewBox="${vb}" overflow="visible"${attrs}>${estilo}</svg>`;
  }
  const forma =
    n.tipo === 'elipse'
      ? `<ellipse cx="${x + w / 2}" cy="${y + h / 2}" rx="${w / 2}" ry="${h / 2}" fill="${preench(n.preenchimentos[0])}"${traco}${attrs}/>`
      : n.preenchimentos.length || n.traco
        ? `<rect x="${x}" y="${y}" width="${w}" height="${h}"${raio} fill="${preench(n.preenchimentos[0])}"${traco}${attrs}/>`
        : '';
  let filhos = '';
  if (n.autoLayout) {
    const hor = n.autoLayout.direcao === 'HORIZONTAL';
    // Auto Layout centralizado: começa no meio do espaço livre (como o Figma faz).
    const medidas = n.filhos.map(medir);
    const ocupado =
      medidas.reduce((s, m) => s + (hor ? m.w : m.h), 0) +
      Number(n.autoLayout.espaco.valor) * Math.max(0, n.filhos.length - 1);
    const pad = hor ? Number(n.autoLayout.paddingX.valor) : Number(n.autoLayout.paddingY.valor);
    let cursor = Math.max(pad, ((hor ? w : h) - ocupado) / 2);
    for (const f of n.filhos) {
      const m = medir(f);
      const fx = hor ? cursor : (w - m.w) / 2;
      const fy = hor ? (h - m.h) / 2 : cursor;
      filhos += svgNo({ ...f, x: 0, y: 0 }, defs, x + fx, y + fy);
      cursor += (hor ? m.w : m.h) + Number(n.autoLayout.espaco.valor);
    }
  } else {
    filhos = n.filhos.map((f) => svgNo(f, defs, x, y)).join('');
  }
  const grupoOpacidade =
    n.tipo === 'frame' && n.opacidade && !forma
      ? `<g opacity="${n.opacidade.valor}">${filhos}</g>`
      : filhos;
  return forma + grupoOpacidade;
}

/** SVG estático da primeira variante (valores atuais), com as camadas reais. */
export function svgEstatico(comp: KcxComponente, valores: Valores): string {
  const plano = planejarFigma(criarPacote([comp], { valores: { [comp.id]: valores } }), 'visual');
  // Variante que corresponde às opções atuais das variáveis enum usadas como eixo.
  const atuais = valoresAtuais(comp.variaveis, valores);
  const eixos = (comp.compatibilidade.figma.eixosVariante ?? []).map((id) =>
    comp.variaveis.find((v) => v.id === id)!,
  );
  const variantes = plano.componentes[0].variantes;
  const certa = variantes.find((v) =>
    eixos.every(
      (e) => v.propriedades[e.nome] === e.opcoes?.find((o) => o.valor === atuais[e.id])?.rotulo,
    ),
  );
  const raiz = (certa ?? variantes[0]).arvore;
  const { w, h } = medir(raiz);
  const defs: string[] = [];
  const corpo = svgNo({ ...raiz, x: 0, y: 0 }, defs, 0, 0);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(comp.nome)}">
<title>${esc(comp.nome)} · KCX</title>
<defs>${defs.join('')}</defs>
${corpo}
</svg>
`;
}

/* ============================== Código-fonte independente ============================== */

export function readmeKcx(comp: KcxComponente, valores: Valores): string {
  const atuais = valoresAtuais(comp.variaveis, valores);
  const linhas = comp.variaveis.map(
    (v) =>
      `| \`${v.id}\` | ${v.nome} | ${v.tipo} | \`${JSON.stringify(atuais[v.id])}\` | ${v.vinculos.map((l) => l.propriedade).join('; ')} |`,
  );
  return `# ${comp.nome} — componente KCX

${comp.descricao}

Gerado pelo **Kalixto Creative Lab** no formato **KCX (Kalixto Component Exchange)**. Licença: ${comp.licenca.spdx}
(uso comercial, modificação e redistribuição permitidos). Sem dependências externas.

## Arquivos

| Arquivo | O que é |
|---|---|
| \`index.html\` | Página pronta: abra no navegador |
| \`${comp.id}.css\` | CSS do componente com o bloco \`:root\` das variáveis |
| \`${comp.id}.html\` | Marcação do componente |
| \`kcx-runtime.js\` | Opcional: controla as variáveis em tempo real (\`KCX.set\`) |
| \`${comp.id}.kcx.json\` | Pacote KCX (importe no plugin Figma Bridge ou de volta no lab) |
| \`tokens.json\` | Variáveis no formato W3C Design Tokens |
| \`${comp.id}.svg\` | Imagem estática da estrutura visual |

## Variáveis

| ID | Nome | Tipo | Valor | Controla |
|---|---|---|---|---|
${linhas.join('\n')}

## Controlar em tempo real

\`\`\`js
KCX.set('${comp.variaveis[0].id}', ${JSON.stringify(atuais[comp.variaveis[0].id])});
KCX.pause(); KCX.play(); KCX.restart(); KCX.speed(0.5);
\`\`\`

Sem o runtime, edite os valores do bloco \`:root\` em \`${comp.id}.css\`.

## Figma

Nível de compatibilidade: **${comp.compatibilidade.figma.nivel}**.

${comp.compatibilidade.figma.limitacoes.map((l) => `- ${l}`).join('\n')}
`;
}

/** Arquivos do pacote de código independente (.zip). */
export function arquivosCodigo(comp: KcxComponente, valores: Valores): ArquivoZip[] {
  const dir = `${comp.id}-kcx`;
  const saidas = resolverSaidas(comp.variaveis, valores);
  const css = `${blocoRoot(saidas)}\n\n${comp.codigo.css.trim()}\n`;
  const runtime = runtimeStandalone(
    comp.id,
    comp.variaveis.map((v) => ({ ...v, valor: valores[v.id] ?? v.valor })),
  );
  return [
    {
      nome: `${dir}/index.html`,
      conteudo: montarDocumentoKcx(comp, valores, { modo: 'exportado' }),
    },
    { nome: `${dir}/${comp.id}.css`, conteudo: css },
    { nome: `${dir}/${comp.id}.html`, conteudo: comp.codigo.html + '\n' },
    { nome: `${dir}/kcx-runtime.js`, conteudo: runtime + '\n' },
    {
      nome: `${dir}/${comp.id}.kcx.json`,
      conteudo: serializar(
        criarPacote([comp], { valores: { [comp.id]: valores }, modo: 'pacote' }),
      ),
    },
    {
      nome: `${dir}/tokens.json`,
      conteudo: JSON.stringify(tokensW3C(comp, valores), null, 2) + '\n',
    },
    { nome: `${dir}/${comp.id}.svg`, conteudo: svgEstatico(comp, valores) },
    { nome: `${dir}/README.md`, conteudo: readmeKcx(comp, valores) },
  ];
}

export { cssCompleto };
