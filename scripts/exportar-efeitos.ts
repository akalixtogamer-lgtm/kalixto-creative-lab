// Exporta fichas + código padrão dos kits em JSON (usado por gerar-docs-efeitos.py).
import { EFFECT_REGISTRY, CATALOGO } from '../src/app/core/efeitos/registry';
import { CATEGORIAS } from '../src/app/core/efeitos/categorias';
import { montarDocumento } from '../src/app/core/efeitos/sandbox';
const kits = EFFECT_REGISTRY.map((k) => {
  const v = Object.fromEntries(k.params.map((p) => [p.id, p.padrao]));
  const codigo = k.gerar(v);
  return { ficha: k.ficha, params: k.params, codigo, documento: montarDocumento(k.ficha.nomeAmigavel, codigo) };
});
const catalogo = CATALOGO.map(({ chave, tipo, nome, categoria, nivel, origem }) => ({ chave, tipo, nome, categoria, nivel, origem }));
console.log(JSON.stringify({ kits, catalogo, categorias: CATEGORIAS }));
