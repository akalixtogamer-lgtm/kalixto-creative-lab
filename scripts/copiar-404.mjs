// GitHub Pages não conhece as rotas do Angular: ao abrir um link direto
// (ex.: /kalixto-creative-lab/labs/css) ele procura 404.html.
// Copiar o index.html para 404.html faz o Angular assumir a rota.
import { copyFileSync } from 'node:fs';

const pasta = 'dist/kalixto-creative-lab/browser';
copyFileSync(`${pasta}/index.html`, `${pasta}/404.html`);
console.log('404.html criado para o GitHub Pages.');
