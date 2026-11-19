/**
 * Executor do plano KCX dentro do Figma (usado pelo plugin Figma Bridge).
 *
 * Recebe o PlanoFigma (calculado por figma-plano.ts) e a API `figma` do
 * plugin, e cria: coleções e modos, variáveis (com escopo, descrição e code
 * syntax), componentes com variantes, vínculos de variáveis em cada
 * propriedade suportada, propriedades de texto, quadro de documentação e
 * composição. Guarda o pacote KCX no componente para recuperar o código.
 *
 * Os tipos do Figma ficam soltos aqui (`any`) para este arquivo rodar também
 * nos testes com uma API simulada; o plugin (figma-bridge/src/code.ts) é
 * verificado com @figma/plugin-typings.
 */

export * from './construir/tipos';
export { detectarDuplicados } from './construir/duplicados';
export { importarNoFigma } from './construir/construtor';
export { lerAlteracoes } from './construir/ler-alteracoes';
export { gatilhoFigma, codigoTecla, transicaoFigma } from './construir/prototipo';
