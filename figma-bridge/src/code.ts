/**
 * Kalixto Creative Lab — Figma Bridge (código principal do plugin).
 *
 * Importa pacotes KCX (.kcx.json) e cria estruturas nativas e editáveis:
 * variáveis organizadas em coleções, componentes com variantes, vínculos,
 * propriedades de texto e documentação. Sem rede, sem serviços externos.
 *
 * A validação e o plano vêm do MESMO código usado pelo laboratório
 * (src/app/kcx), então o que o lab promete é o que o plugin faz.
 */
import { criarPacote, desserializar, serializar } from '../../src/app/kcx/serializar';
import { lerSelecao } from '../../src/app/kcx/figma/ler-selecao';
import { fundacaoDoFigma, lerDesignSystem } from '../../src/app/kcx/figma/ler-design-system';
import { planejarFigma } from '../../src/app/kcx/figma-plano';
import { KcxModoExportacao } from '../../src/app/kcx/kcx.types';
import {
  detectarDuplicados,
  importarNoFigma,
  lerAlteracoes,
  limparTracejados,
  ModoDuplicados,
} from '../../src/app/kcx/figma/construir';

type Mensagem =
  | { tipo: 'analisar'; texto: string; modo?: KcxModoExportacao }
  | { tipo: 'importar'; texto: string; modo?: KcxModoExportacao; duplicados: ModoDuplicados }
  | { tipo: 'exportar-alteracoes' }
  | { tipo: 'enviar-selecao' }
  | { tipo: 'enviar-design-system' }
  | { tipo: 'limpar-tracejado' }
  | { tipo: 'fechar' };

figma.showUI(__html__, { width: 460, height: 660, themeColors: true, title: 'KCX · Figma Bridge' });

function responder(msg: object): void {
  figma.ui.postMessage(msg);
}

function ler(texto: string, modo?: KcxModoExportacao) {
  const r = desserializar(texto);
  if (!r.ok) return { erro: r.erro, problemas: r.validacao?.erros ?? [] };
  const m = modo ?? (r.pacote.exportacao.modo === 'pacote' ? 'completo' : r.pacote.exportacao.modo);
  return { pacote: r.pacote, plano: planejarFigma(r.pacote, m), avisos: r.validacao.avisos };
}

figma.ui.onmessage = async (msg: Mensagem) => {
  try {
    if (msg.tipo === 'analisar') {
      const r = ler(msg.texto, msg.modo);
      if ('erro' in r) return responder({ tipo: 'erro', erro: r.erro, problemas: r.problemas });
      const duplicados = await detectarDuplicados(figma, r.plano);
      responder({
        tipo: 'analise',
        pacote: {
          id: r.pacote.id,
          nome: r.pacote.nome,
          versao: r.pacote.versao,
          schema: r.pacote.schemaVersion,
          origem: r.pacote.origem.ferramenta,
        },
        plano: {
          modo: r.plano.modo,
          resumo: r.plano.resumo,
          colecoes: r.plano.colecoes.map((c) => ({
            nome: c.nome,
            modos: c.modos,
            variaveis: c.variaveis.map((v) => ({
              nome: v.nome,
              tipo: v.tipo,
              vinculada: v.vinculadaA.length > 0,
              origem: v.origem,
            })),
          })),
          componentes: r.plano.componentes.map((c) => ({
            nome: c.nome,
            nivel: c.nivel,
            variantes: c.variantes.map((v) => v.nome),
            editavel: c.editavel,
            parcial: c.parcial,
            naoSuportado: c.naoSuportado,
            limitacoes: c.limitacoes,
          })),
          documentacao: r.plano.documentacao,
          composicao: r.plano.composicao?.nome,
          avisos: [...r.plano.avisos, ...r.avisos.map((a) => a.mensagem)],
        },
        duplicados,
      });
    }
    if (msg.tipo === 'importar') {
      const r = ler(msg.texto, msg.modo);
      if ('erro' in r) return responder({ tipo: 'erro', erro: r.erro, problemas: r.problemas });
      responder({ tipo: 'progresso', texto: 'Criando variáveis e componentes…' });
      const relatorio = await importarNoFigma(figma, r.plano, msg.texto, msg.duplicados);
      figma.notify(
        `KCX: ${relatorio.componentes.length} componente(s), ${relatorio.variaveisCriadas.length} variável(is) nova(s), ${relatorio.vinculos} vínculo(s).`,
      );
      responder({ tipo: 'concluido', relatorio });
    }
    if (msg.tipo === 'exportar-alteracoes') {
      const sel = figma.currentPage.selection[0];
      if (!sel)
        return responder({
          tipo: 'erro',
          erro: 'Selecione um componente importado pelo Figma Bridge.',
        });
      const r = await lerAlteracoes(figma, sel);
      if ('erro' in r) return responder({ tipo: 'erro', erro: r.erro });
      responder({ tipo: 'alteracoes', arquivo: r.arquivo, ignoradas: r.ignoradas });
    }
    if (msg.tipo === 'enviar-selecao') {
      const sel = figma.currentPage.selection[0];
      if (!sel)
        return responder({
          tipo: 'erro',
          erro: 'Selecione um frame, componente ou instância para enviar ao lab.',
        });
      const comp = await lerSelecao(figma, sel);
      const pacote = criarPacote([comp], { modo: 'completo' });
      responder({
        tipo: 'selecao',
        id: comp.id,
        nome: comp.nome,
        texto: serializar(pacote),
        variaveis: comp.variaveis.length,
        avisos: comp.compatibilidade.figma.parcial,
      });
    }
    if (msg.tipo === 'enviar-design-system') {
      const ds = await lerDesignSystem(figma);
      if (!ds.variaveis.length && !ds.estilosTexto.length)
        return responder({
          tipo: 'erro',
          erro: 'Este arquivo não tem variáveis nem estilos de texto locais para enviar.',
        });
      const r = fundacaoDoFigma(ds);
      responder({
        tipo: 'design-system',
        nome: r.fundacao.nome,
        texto: JSON.stringify(r.fundacao, null, 2),
        reconhecido: r.reconhecido,
        padrao: r.padrao,
      });
    }
    if (msg.tipo === 'limpar-tracejado') {
      const n = limparTracejados(figma);
      figma.notify(`KCX: borda tracejada removida de ${n} conjunto(s) de variantes.`);
      responder({ tipo: 'tracejado', n });
    }
    if (msg.tipo === 'fechar') figma.closePlugin();
  } catch (e) {
    responder({ tipo: 'erro', erro: `Falha inesperada: ${(e as Error).message}` });
  }
};
