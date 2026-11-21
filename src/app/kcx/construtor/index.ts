/** Construtor do KCX Studio: catálogo de tipos e montagem. */
import { KcxComponente } from '../kcx.types';
import { ConfigConstrutor, DefinicaoTipo, construirComponente } from './montar';
import { TIPOS_CONTEUDO } from './tipos/conteudo';
import { TIPOS_NAVEGACAO } from './tipos/navegacao';
import { TIPOS_SECOES } from './tipos/secoes';
import { TIPOS_CONTROLES } from './tipos/controles';
import { TIPOS_COMPOSTOS } from './tipos/compostos';
import { MONTADO_ID, definicaoMontada } from './montado';

export * from './montar';
export { corDoBotao } from './tipos/conteudo/_comum';
export * from './figma-animacoes';
export * from './montado';
export * from './tela';

/** Todos os tipos que o construtor sabe montar. */
export const TIPOS_CONSTRUTOR: DefinicaoTipo[] = [
  ...TIPOS_NAVEGACAO,
  ...TIPOS_CONTEUDO,
  ...TIPOS_SECOES,
  ...TIPOS_CONTROLES,
  ...TIPOS_COMPOSTOS,
];

export function tipoConstrutor(id: string): DefinicaoTipo | undefined {
  return TIPOS_CONSTRUTOR.find((t) => t.id === id);
}

/** Monta o componente de uma configuração (lança erro se o tipo não existe). */
export function montarDoConstrutor(cfg: ConfigConstrutor): KcxComponente {
  const def = cfg.tipo === MONTADO_ID ? definicaoMontada(cfg) : tipoConstrutor(cfg.tipo);
  if (!def) throw new Error(`Tipo "${cfg.tipo}" não existe no construtor.`);
  const itens = def.itens
    ? cfg.itens
        .slice(0, def.itens.max)
        .concat(def.itens.padrao.slice(cfg.itens.length, def.itens.min))
    : [];
  return construirComponente(def, { ...cfg, itens });
}
export * from './vidro';
