// Escreve a versão Angular de cada kit (valores padrão) em src/app/efeitos-angular/<id>/.
// Esses arquivos são compilados com o app: o teste compara com o gerador e renderiza cada um.
import { mkdirSync, writeFileSync } from 'node:fs';
import { EFFECT_REGISTRY } from '../src/app/core/efeitos/registry';

const base = 'src/app/efeitos-angular';
for (const k of EFFECT_REGISTRY) {
  const v = Object.fromEntries(k.params.map((p) => [p.id, p.padrao]));
  const a = k.angular(v);
  const dir = `${base}/${k.ficha.id}`;
  mkdirSync(dir, { recursive: true });
  writeFileSync(`${dir}/${k.ficha.id}.ts`, a.ts);
  writeFileSync(`${dir}/${k.ficha.id}.html`, a.html);
  writeFileSync(`${dir}/${k.ficha.id}.css`, a.css);
}
console.log(`${EFFECT_REGISTRY.length} componentes Angular gerados em ${base}/`);
