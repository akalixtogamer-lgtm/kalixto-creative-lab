/**
 * Build do plugin Kalixto Creative Lab — Figma Bridge.
 * Gera figma-bridge/dist/ (manifest.json, code.js, ui.html, LEIA-ME.md)
 * e copia para public/figma-bridge/ (o lab oferece o download do plugin).
 */
import { build } from 'esbuild';
import { copyFileSync, mkdirSync } from 'node:fs';

const dist = 'figma-bridge/dist';
mkdirSync(dist, { recursive: true });
await build({
  entryPoints: ['figma-bridge/src/code.ts'],
  bundle: true,
  format: 'iife',
  target: 'es2017',
  outfile: `${dist}/code.js`,
  logLevel: 'error',
  legalComments: 'inline',
  banner: { js: '/* Kalixto Creative Lab — Figma Bridge · KCX · MIT */' },
});
for (const f of ['manifest.json', 'LEIA-ME.md']) copyFileSync(`figma-bridge/${f}`, `${dist}/${f}`);
copyFileSync('figma-bridge/src/ui.html', `${dist}/ui.html`);
mkdirSync('public/figma-bridge', { recursive: true });
for (const f of ['manifest.json', 'code.js', 'ui.html', 'LEIA-ME.md'])
  copyFileSync(`${dist}/${f}`, `public/figma-bridge/${f}`);
console.log('Figma Bridge: figma-bridge/dist e public/figma-bridge atualizados.');
