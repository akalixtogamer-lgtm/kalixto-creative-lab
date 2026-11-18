/**
 * Gera a versão Angular de cada componente KCX em src/app/kcx-angular/.
 * Os testes compilam e renderizam esses arquivos. `npm run verificar:kcx-angular`
 * confere se o que está no repositório bate com o gerador.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { KCX_COMPONENTES } from '../src/app/kcx/componentes';
import { RUNTIME_ANGULAR, angularKcx, classeAngular } from '../src/app/kcx/angular';

const base = 'src/app/kcx-angular';
mkdirSync(base, { recursive: true });
writeFileSync(`${base}/kcx-runtime.ts`, RUNTIME_ANGULAR);
for (const c of KCX_COMPONENTES) {
  const a = angularKcx(c);
  mkdirSync(`${base}/${c.id}`, { recursive: true });
  writeFileSync(`${base}/${c.id}/${c.id}.component.ts`, a.ts);
  writeFileSync(`${base}/${c.id}/${c.id}.component.html`, a.html);
  writeFileSync(`${base}/${c.id}/${c.id}.component.css`, a.css);
}
writeFileSync(
  `${base}/index.ts`,
  `/** Componentes Angular dos componentes KCX (gerado por npm run gerar:kcx-angular). */\n` +
    KCX_COMPONENTES.map(
      (c) => `export { ${classeAngular(c.id)} } from './${c.id}/${c.id}.component';`,
    ).join('\n') +
    '\n',
);
console.log(`${KCX_COMPONENTES.length} componentes Angular KCX gerados em ${base}/`);
