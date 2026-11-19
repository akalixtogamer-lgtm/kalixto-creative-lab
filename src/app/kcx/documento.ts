/**
 * Documento HTML de um componente KCX: o mesmo texto vai para o preview
 * (iframe sandbox) e para o arquivo exportado.
 */
import { CSP_PREVIEW } from '../core/efeitos/sandbox';

/**
 * CSP dos documentos KCX: igual à dos kits, mas aceita imagens e vídeos por
 * https (cards de foto e vídeo). Continua sem fetch, sem fontes externas e sem iframes.
 */
export const CSP_KCX = CSP_PREVIEW.replace(
  'img-src data:',
  'img-src data: https: blob:; media-src data: https: blob:',
);
import { KcxCodigo, KcxComponente } from './kcx.types';
import { Saidas, Valores, blocoRoot, resolverSaidas } from './resolver';
import { RUNTIME_PREVIEW, runtimeStandalone } from './runtime';

function proteger(codigo: string, tag: 'script' | 'style'): string {
  return codigo.replace(new RegExp(`</${tag}`, 'gi'), `<\\/${tag}`);
}

export const CSS_PALCO_KCX = `/* Palco */
* { box-sizing: border-box; }
html, body { height: 100%; margin: 0; }
body {
  display: grid;
  place-items: center;
  padding: 24px;
  background: #0b0a14;
  color: #f4f2ff;
  font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
}`;

/** Aplica os atributos calculados no HTML (o primeiro quadro já sai certo, sem piscar). */
export function aplicarAtributosNoHtml(html: string, saidas: Saidas): string {
  if ((!saidas.atributos.length && !saidas.textos.length) || typeof DOMParser === 'undefined')
    return html;
  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html');
  for (const a of saidas.atributos) {
    if (/^on/i.test(a.atributo)) continue;
    doc.body.querySelectorAll(a.seletor).forEach((el) => el.setAttribute(a.atributo, a.valor));
  }
  for (const t of saidas.textos)
    doc.body.querySelectorAll(t.seletor).forEach((el) => (el.textContent = t.valor));
  return doc.body.innerHTML;
}

export interface OpcoesDocumento {
  /** 'preview' = runtime que recebe postMessage; 'exportado' = runtime com KCX.set(). */
  modo: 'preview' | 'exportado';
  /** Código editado no Code Lab (substitui o do componente). */
  codigo?: KcxCodigo;
}

/** CSS completo: palco + bloco :root com as variáveis + CSS do componente. */
export function cssCompleto(
  comp: KcxComponente,
  valores: Valores,
  codigo: KcxCodigo = comp.codigo,
): string {
  return `${CSS_PALCO_KCX}\n\n${blocoRoot(resolverSaidas(comp.variaveis, valores))}\n\n${codigo.css.trim()}\n`;
}

export function montarDocumentoKcx(
  comp: KcxComponente,
  valores: Valores,
  op: OpcoesDocumento,
): string {
  const codigo = op.codigo ?? comp.codigo;
  const saidas = resolverSaidas(comp.variaveis, valores);
  const runtime =
    op.modo === 'preview'
      ? RUNTIME_PREVIEW
      : runtimeStandalone(
          comp.id,
          comp.variaveis.map((v) => ({ ...v, valor: valores[v.id] ?? v.valor })),
        );
  const t = comp.nome.replace(/[<>&"]/g, '');
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="${CSP_KCX}">
<title>${t} · KCX · Kalixto Creative Lab</title>
<style>
${proteger(cssCompleto(comp, valores, codigo), 'style')}
</style>
</head>
<body>
${aplicarAtributosNoHtml(codigo.html, saidas)}
<script>
${proteger(runtime, 'script')}
</script>
<script>
${proteger(codigo.js, 'script')}
</script>
</body>
</html>
`;
}
