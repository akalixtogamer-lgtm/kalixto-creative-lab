/**
 * Converter um desenho vindo do Figma (ou qualquer componente) em um tipo do
 * construtor: um "trilho" de cards vira Carrossel, uma barra vira Navbar, etc.
 *
 * Aproveita o que dá para reconhecer no desenho:
 * - itens: o grupo que se repete (≥ 2 filhos parecidos) vira a lista do tipo
 *   (slides, links, abas, perguntas…), um item por filho, com o primeiro texto;
 * - textos: os outros textos, na ordem de leitura, preenchem os textos do tipo;
 * - cores: fundo (camada principal), texto (primeiro texto), superfície e a cor
 *   mais viva como principal;
 * - raio: o arredondamento da camada principal (ou da primeira caixa).
 * O resultado é uma configuração do construtor, que a pessoa revisa e salva.
 */
import { PlanoNo, planejarFigma } from '../figma-plano';
import { KcxComponente } from '../kcx.types';
import { criarPacote } from '../serializar';
import { corDeFigma } from '../unidades';
import { tipoConstrutor } from './index';
import { ConfigConstrutor, configPadrao } from './montar';

interface Lido {
  texto: string;
  /** Em ordem de leitura (de cima para baixo, da esquerda para a direita). */
  ordem: number;
}

const textosDe = (n: PlanoNo, saida: Lido[] = []): Lido[] => {
  if (n.tipo === 'texto' && n.texto) {
    const t = String(n.texto.conteudo.valor ?? '').trim();
    if (t) saida.push({ texto: t, ordem: saida.length });
  }
  (n.filhos ?? []).forEach((f) => textosDe(f, saida));
  return saida;
};

/** O grupo que mais se repete: um pai com ≥ 2 filhos-caixa que têm texto. */
function grupoRepetido(raiz: PlanoNo): PlanoNo | null {
  let melhor: PlanoNo | null = null;
  const andar = (n: PlanoNo) => {
    const caixas = (n.filhos ?? []).filter(
      (f) => (f.tipo === 'frame' || f.tipo === 'instancia') && textosDe(f).length,
    );
    if (caixas.length >= 2 && caixas.length > (melhor ? contar(melhor) : 1)) melhor = n;
    (n.filhos ?? []).forEach(andar);
  };
  const contar = (n: PlanoNo) =>
    (n.filhos ?? []).filter(
      (f) => (f.tipo === 'frame' || f.tipo === 'instancia') && textosDe(f).length,
    ).length;
  andar(raiz);
  return melhor;
}

const solidos = (n: PlanoNo, saida: string[] = []): string[] => {
  for (const p of n.preenchimentos ?? [])
    if (p.tipo === 'solido' && (p.cor.valor.a ?? 1) > 0.5)
      saida.push(corDeFigma(p.cor.valor).slice(0, 7));
  (n.filhos ?? []).forEach((f) => solidos(f, saida));
  return saida;
};

/** Saturação × contraste com o cinza: a cor "mais viva". */
function vivacidade(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max === 0 ? 0 : ((max - min) / max) * max;
}

export interface Conversao {
  cfg: ConfigConstrutor;
  /** O que foi aproveitado do desenho (para mostrar à pessoa). */
  aproveitado: string[];
}

export function converterParaTipo(comp: KcxComponente, tipoId: string): Conversao {
  const def = tipoConstrutor(tipoId);
  if (!def) throw new Error(`Tipo "${tipoId}" não existe.`);
  const cfg = configPadrao(def, `${comp.nome} (${def.nome})`);
  const aproveitado: string[] = [];
  const raiz = planejarFigma(criarPacote([comp])).componentes[0]?.variantes[0]?.arvore;
  if (!raiz) return { cfg, aproveitado };

  /* itens e textos */
  const grupo = grupoRepetido(raiz);
  const doGrupo = new Set<string>();
  let itens: string[] = [];
  if (grupo) {
    for (const f of grupo.filhos) {
      const t = textosDe(f);
      if (!t.length) continue;
      itens.push(t[0].texto.slice(0, 60));
      t.forEach((x) => doGrupo.add(x.texto));
    }
  }
  const todos = textosDe(raiz);
  const resto = todos.filter((t) => !doGrupo.has(t.texto)).map((t) => t.texto);
  if (def.itens) {
    if (!itens.length) itens = resto.splice(0, def.itens.max).map((t) => t.slice(0, 60));
    const { min, max, padrao } = def.itens;
    itens = itens.slice(0, max);
    for (let i = itens.length; i < min; i++) itens.push(padrao[i] ?? `Item ${i + 1}`);
    cfg.itens = itens;
    aproveitado.push(`${itens.length} ${def.itens.rotulo.toLowerCase()}(s) do desenho`);
    if (def.porTela && itens.length > 4) cfg.porTela = Math.min(4, def.porTela);
  } else if (itens.length) resto.unshift(...itens);
  const textos = def.textos.filter((t) => !t.recurso || cfg.recursos?.[t.recurso]);
  textos.forEach((t, i) => {
    if (resto[i]) cfg.textos[t.id] = resto[i].slice(0, 120);
  });
  const usados = Math.min(textos.length, resto.length);
  if (usados)
    aproveitado.push(
      `${usados} texto(s): ${textos
        .slice(0, usados)
        .map((t) => t.rotulo)
        .join(', ')}`,
    );

  /* cores */
  const fundoRaiz = raiz.preenchimentos?.find((p) => p.tipo === 'solido');
  const cores = solidos(raiz);
  if (fundoRaiz?.tipo === 'solido') {
    cfg.cores.fundo = corDeFigma(fundoRaiz.cor.valor).slice(0, 7);
    aproveitado.push(`fundo ${cfg.cores.fundo}`);
  }
  const viva = [...cores].sort((a, b) => vivacidade(b) - vivacidade(a))[0];
  if (viva && vivacidade(viva) > 0.25) {
    cfg.cores.primaria = viva;
    aproveitado.push(`cor principal ${viva}`);
  }
  const superficie = cores.find((c) => c !== cfg.cores.fundo && c !== viva && vivacidade(c) < 0.25);
  if (superficie) cfg.cores.superficie = superficie;
  const txt = (() => {
    const achar = (n: PlanoNo): PlanoNo | undefined =>
      n.tipo === 'texto' ? n : (n.filhos ?? []).map(achar).find(Boolean);
    const p = achar(raiz)?.preenchimentos?.find((x) => x.tipo === 'solido');
    return p?.tipo === 'solido' ? corDeFigma(p.cor.valor).slice(0, 7) : null;
  })();
  if (txt) cfg.cores.texto = txt;

  /* raio */
  const raio = (() => {
    const fila = [raiz];
    while (fila.length) {
      const n = fila.shift()!;
      const r = Number(n.raio?.valor);
      if (r > 0) return r;
      fila.push(...(n.filhos ?? []));
    }
    return null;
  })();
  if (raio !== null) {
    cfg.raio = Math.min(48, Math.round(raio));
    aproveitado.push(`cantos de ${cfg.raio} px`);
  }
  return { cfg, aproveitado };
}
