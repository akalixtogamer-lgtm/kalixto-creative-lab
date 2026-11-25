/**
 * Ficha técnica → componente KCX próprio (tipo do construtor "Efeito de
 * movimento (web)"). As medidas da referência viram o valor inicial das
 * variáveis — e continuam editáveis no editor, nas versões e no Figma.
 *
 * Só usa a medida quando ela significa a mesma coisa no componente: a duração
 * de um trecho de rolagem, por exemplo, não é a duração da animação de um card.
 */
import { MAPA_EASING } from '../componentes/_base';
import { distanciaEasing } from '../comparar/easing';
import type { Marco } from '../comparar/tipos';
import {
  ConfigConstrutor,
  configPadrao,
  montarDoConstrutor,
  slug,
  tipoConstrutor,
} from '../construtor';
import { KcxFundacao, construtorDaFundacao } from '../fundacao';
import type { KcxComponente, KcxValor } from '../kcx.types';
import { idLivre } from '../meus-componentes';
import { entradaCatalogo } from './catalogo';
import type { FichaEfeito, TipoEfeitoWeb } from './tipos';

/** Efeitos em que a duração medida é a duração do movimento de cada elemento. */
const DURACAO_DO_ELEMENTO: TipoEfeitoWeb[] = ['revelar', 'texto', 'hover', 'transicao', 'morph'];

/** Curva CSS → a opção de easing do construtor mais parecida. */
export function easingDoConstrutor(css: string): { valor: string; distancia: number } | null {
  let melhor: { valor: string; distancia: number } | null = null;
  for (const [valor, curva] of Object.entries(MAPA_EASING)) {
    const d = distanciaEasing(css, curva);
    if (d !== null && (!melhor || d < melhor.distancia)) melhor = { valor, distancia: d };
  }
  return melhor;
}

export interface Reconstrucao {
  cfg: ConfigConstrutor;
  comp: KcxComponente;
  /** O que veio da referência e o que ficou no padrão (frases para a pessoa). */
  notas: string[];
}

/** Valores iniciais a partir dos parâmetros da ficha. */
export function valoresDaFicha(f: FichaEfeito): {
  valores: Record<string, KcxValor>;
  notas: string[];
} {
  const valores: Record<string, KcxValor> = {};
  const notas: string[] = [];
  const p = f.parametros;
  if (p.duracao && DURACAO_DO_ELEMENTO.includes(f.tipo)) {
    valores['duracaoMovimento'] = Math.round(p.duracao);
    notas.push(`Duração ${Math.round(p.duracao)} ms medida na referência.`);
  }
  if (p.easing) {
    const e = easingDoConstrutor(p.easing);
    if (e) {
      valores['easing'] = e.valor;
      notas.push(
        `Curva “${p.easing}” → “${e.valor}” (distância ${e.distancia.toLocaleString('pt-BR')}).`,
      );
    }
  }
  if (f.tipo === 'parallax' && p.fator) {
    const i = Math.min(1, Math.max(0.1, Math.abs(1 - p.fator) * 1.2));
    valores['intensidade'] = Math.round(i * 100) / 100;
    notas.push(`Camada a ${p.fator}× da velocidade → intensidade ${valores['intensidade']}.`);
  }
  if (f.tipo === 'vidro' && p.intensidade) {
    valores['intensidade'] = Math.round(p.intensidade * 100) / 100;
    notas.push(`Desfoque estimado → intensidade ${valores['intensidade']}.`);
  }
  if (p.atraso) {
    valores['atrasoItens'] = Math.round(p.atraso);
    notas.push(`Atraso entre itens ${Math.round(p.atraso)} ms.`);
  }
  if (!notas.length)
    notas.push(
      'A ficha não trouxe medidas que valham para o componente: valores padrão, prontos para ajustar.',
    );
  return { valores, notas };
}

/** Monta o componente KCX de uma ficha (não salva). */
export function reconstruirFicha(
  f: FichaEfeito,
  op: { ocupados: string[]; fundacao?: KcxFundacao | null; nome?: string },
): Reconstrucao {
  const def = tipoConstrutor('efeito-web');
  if (!def) throw new Error('O tipo “Efeito de movimento (web)” não está no construtor.');
  const nome = (op.nome?.trim() || `${f.nome} da referência`).slice(0, 80);
  const base = configPadrao(def, nome);
  const { valores, notas } = valoresDaFicha(f);
  const cfg: ConfigConstrutor = {
    ...base,
    ...(op.fundacao ? construtorDaFundacao(op.fundacao) : {}),
    nome,
    animacao: f.tipo,
    valores,
    id: idLivre(slug(nome), op.ocupados),
  };
  const comp = montarDoConstrutor(cfg);
  const cat = entradaCatalogo(f.tipo);
  comp.descricao = `${cat.descricao} Reconstruído de uma ficha (${f.origem === 'video' ? 'análise de vídeo' : f.origem === 'dom' ? 'inspeção do site' : f.origem === 'html' ? 'HTML salvo' : 'marcação manual'}, confiança ${f.confianca}). ${cat.reconstrucao}`;
  comp.metadados = {
    ...comp.metadados,
    tags: [...new Set([...comp.metadados.tags, 'web intelligence', `ficha:${f.origem}`])],
  };
  return { cfg, comp, notas };
}

/** A ficha vira um marco do tipo "efeito" na linha do tempo da comparação. */
export function marcoDaFicha(f: FichaEfeito, id: string): Marco {
  const m: Marco = {
    id,
    nome: f.nome,
    tipo: 'efeito',
    ref: f.inicio,
    rec: null,
    anotacao: `${f.evidencias[0] ?? ''} (${f.origem}, confiança ${f.confianca})`.slice(0, 500),
  };
  if (f.fim !== null && f.inicio !== null && f.fim > f.inicio) m.refFim = f.fim;
  if (f.parametros.easing) m.easingRef = f.parametros.easing;
  return m;
}
