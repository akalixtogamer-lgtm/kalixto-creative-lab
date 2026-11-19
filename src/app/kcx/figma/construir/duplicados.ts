/** Detecta o que já existe no arquivo antes de importar. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { PlanoFigma } from '../../figma-plano';
import { Figma, CHAVE_PLUGIN, variaveisLocais } from './tipos';

export async function detectarDuplicados(figma: Figma, plano: PlanoFigma) {
  const colecoes = await figma.variables.getLocalVariableCollectionsAsync();
  const vars = await variaveisLocais(figma);
  const nomesCol = new Set(colecoes.map((c: any) => c.name));
  const existentes: string[] = [];
  for (const c of plano.colecoes) {
    const col = colecoes.find((x: any) => x.name === c.nome);
    if (!col) continue;
    for (const v of c.variaveis)
      if (vars.some((x: any) => x.name === v.nome && x.variableCollectionId === col.id))
        existentes.push(v.nome);
  }
  const componentes: string[] = [];
  const pagina = figma.currentPage;
  const nos = pagina.findAllWithCriteria
    ? pagina.findAllWithCriteria({ types: ['COMPONENT_SET', 'COMPONENT'] })
    : [];
  for (const n of nos) {
    let id = '';
    try {
      id = n.getSharedPluginData(CHAVE_PLUGIN, 'componente');
    } catch {
      /* sem pluginData */
    }
    if (id && plano.componentes.some((c) => c.id === id)) componentes.push(`${n.name} (${id})`);
  }
  return {
    colecoes: plano.colecoes.filter((c) => nomesCol.has(c.nome)).map((c) => c.nome),
    variaveis: existentes,
    componentes,
  };
}
