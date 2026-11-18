import { mkdirSync, writeFileSync } from 'node:fs';
import { KCX_JSON_SCHEMA } from '../src/app/kcx/kcx.schema';
import { KCX_COMPONENTES } from '../src/app/kcx/componentes';
import { criarPacote, serializar } from '../src/app/kcx/serializar';

mkdirSync('docs/kcx/exemplos', { recursive: true });
writeFileSync('docs/kcx/kcx.schema.json', JSON.stringify(KCX_JSON_SCHEMA, null, 2) + '\n');
const agora = new Date('2026-11-18T12:00:00Z');
for (const c of KCX_COMPONENTES) {
  writeFileSync(
    `docs/kcx/exemplos/${c.id}.kcx.json`,
    serializar(criarPacote([c], { agora, modo: 'completo' })),
  );
}
console.log('docs/kcx/kcx.schema.json e docs/kcx/exemplos/*.kcx.json atualizados.');
