import { CodigoKit } from '../models/effect-sheet.model';

/**
 * Política de segurança do documento do preview.
 * default-src 'none': nada de rede (fetch, imagens externas, fontes, iframes).
 * Só o CSS e o JS que estão no próprio documento podem rodar.
 */
export const CSP_PREVIEW =
  "default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data:; font-src data:";

/**
 * Atributo sandbox do iframe: só scripts. Sem allow-same-origin, o documento
 * roda numa origem opaca e não alcança o Angular, o localStorage nem os cookies.
 */
export const SANDBOX_PREVIEW = 'allow-scripts';

/** Impede que "</script>" ou "</style>" dentro do código fechem a tag antes da hora. */
function proteger(codigo: string, tag: 'script' | 'style'): string {
  return codigo.replace(new RegExp(`</${tag}`, 'gi'), `<\\/${tag}`);
}

/**
 * Monta o documento HTML completo de um efeito.
 * É exatamente o mesmo texto usado no preview e no arquivo baixado.
 * Bibliotecas (GSAP, Lenis…) entram embutidas antes do script do kit.
 */
export function montarDocumento(
  titulo: string,
  c: CodigoKit,
  bibliotecas: { nome: string; codigo: string }[] = [],
): string {
  const t = titulo.replace(/[<>&"]/g, '');
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="${CSP_PREVIEW}">
<title>${t} · Kalixto Creative Lab</title>
<style>
${proteger(c.css, 'style')}
</style>
</head>
<body>
${c.html}
${bibliotecas.map((b) => `<script>/* ${b.nome} */\n${proteger(b.codigo, 'script')}\n</script>\n`).join('')}<script>
${proteger(c.js, 'script')}
</script>
</body>
</html>
`;
}
