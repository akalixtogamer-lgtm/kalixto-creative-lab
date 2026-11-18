import { EFFECTS } from '../data/effects.data';
import { findLab } from '../data/labs.data';
import { Valores } from '../models/demo.model';
import { EffectKit } from '../models/effect-sheet.model';
import { findCategoria } from './categorias';
import { EFFECT_REGISTRY } from './registry';

/**
 * Glossário A–Z do lab: todos os efeitos (kits), as demos dos laboratórios
 * e os termos de código explicados nos kits — cada um com links para
 * testar e para abrir o código (que tem o botão Copiar).
 */

export type TipoEntrada = 'efeito' | 'demo' | 'termo';

/** Arquivo do Code Lab que abre direto (?arquivo=). */
export type ArquivoCodigo = 'html' | 'css' | 'js';

export interface LinkGlossario {
  rotulo: string;
  rota: string[];
  query?: Record<string, string>;
  /** Âncora na página de destino (ex.: o Code Lab). */
  fragmento?: string;
}

export interface EntradaGlossario {
  chave: string;
  tipo: TipoEntrada;
  nome: string;
  /** Outro nome (o nome técnico do efeito). */
  apelido?: string;
  detalhe: string;
  /** De onde vem: "Kit · Tipografia", "Interface Lab · Bento"… */
  origem: string;
  /** Letra do índice (A–Z ou # para números e símbolos). */
  letra: string;
  links: LinkGlossario[];
  /** Texto normalizado usado pela busca. */
  busca: string;
}

export const TIPO_ROTULO: Record<TipoEntrada, string> = {
  efeito: 'Efeito',
  demo: 'Demo de laboratório',
  termo: 'Termo de código',
};

/** Minúsculas e sem acentos (para buscar e ordenar). */
export function normalizar(texto: string): string {
  return texto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

/** Texto usado para ordenar: ignora símbolos do começo (ex.: "-webkit-…", "@property"). */
function chaveOrdem(nome: string): string {
  return normalizar(nome).replace(/^[^a-z0-9]+/, '');
}

export function letraDe(nome: string): string {
  const c = chaveOrdem(nome).charAt(0).toUpperCase();
  return /[A-Z]/.test(c) ? c : '#';
}

function padrao(kit: EffectKit): Valores {
  return Object.fromEntries(kit.params.map((p) => [p.id, p.padrao]));
}

/** Em qual arquivo do código gerado o termo aparece (para abrir a aba certa). */
export function arquivoDoTermo(kit: EffectKit, termo: string): ArquivoCodigo {
  const c = kit.gerar(padrao(kit));
  if (c.css.includes(termo)) return 'css';
  if (c.js.includes(termo)) return 'js';
  return 'html';
}

function entradasDeEfeitos(): EntradaGlossario[] {
  return EFFECT_REGISTRY.map(({ ficha: f }) => {
    const categoria = findCategoria(f.categoria)?.nome ?? '';
    return {
      chave: `efeito:${f.id}`,
      tipo: 'efeito',
      nome: f.nomeAmigavel,
      apelido: f.nomeTecnico,
      detalhe: f.descricao,
      origem: `Kit · ${categoria}`,
      letra: letraDe(f.nomeAmigavel),
      links: [
        { rotulo: 'Testar', rota: ['/efeitos', f.id] },
        { rotulo: 'Ver e copiar o código', rota: ['/efeitos', f.id], fragmento: 'ef-codigo' },
      ],
      busca: normalizar(
        [f.nomeAmigavel, f.nomeTecnico, f.descricao, categoria, ...f.tags].join(' '),
      ),
    };
  });
}

function entradasDeDemos(): EntradaGlossario[] {
  return EFFECTS.filter((e) => e.implementado && e.demoId).map((e) => {
    const lab = findLab(e.labId)?.titulo ?? e.labId;
    return {
      chave: `demo:${e.labId}:${e.demoId}`,
      tipo: 'demo',
      nome: e.nome,
      detalhe: e.descricao,
      origem: `${lab} · ${e.topico}`,
      letra: letraDe(e.nome),
      links: [
        {
          rotulo: 'Testar e copiar o código',
          rota: ['/labs', e.labId],
          query: { demo: e.demoId ?? '' },
        },
      ],
      busca: normalizar([e.nome, e.descricao, lab, e.topico].join(' ')),
    };
  });
}

/** Termos dos glossários dos kits; o mesmo termo em vários kits vira uma entrada só. */
function entradasDeTermos(): EntradaGlossario[] {
  const porTermo = new Map<string, { termo: string; explicacao: string; kits: EffectKit[] }>();
  for (const kit of EFFECT_REGISTRY) {
    for (const g of kit.glossario) {
      const chave = normalizar(g.termo.trim());
      const atual = porTermo.get(chave);
      if (atual) atual.kits.push(kit);
      else porTermo.set(chave, { termo: g.termo.trim(), explicacao: g.explicacao, kits: [kit] });
    }
  }
  return [...porTermo.entries()].map(([chave, t]) => ({
    chave: `termo:${chave}`,
    tipo: 'termo',
    nome: t.termo,
    detalhe: t.explicacao,
    origem: t.kits.length === 1 ? 'Usado em 1 efeito' : `Usado em ${t.kits.length} efeitos`,
    letra: letraDe(t.termo),
    links: t.kits.map((k) => ({
      rotulo: k.ficha.nomeAmigavel,
      rota: ['/efeitos', k.ficha.id],
      query: { arquivo: arquivoDoTermo(k, t.termo) },
      fragmento: 'ef-codigo',
    })),
    busca: normalizar(
      [t.termo, t.explicacao, ...t.kits.map((k) => k.ficha.nomeAmigavel)].join(' '),
    ),
  }));
}

/** Todas as entradas, em ordem alfabética (pt-BR, ignorando acentos e símbolos iniciais). */
export const GLOSSARIO: EntradaGlossario[] = [
  ...entradasDeEfeitos(),
  ...entradasDeDemos(),
  ...entradasDeTermos(),
].sort(
  (a, b) =>
    chaveOrdem(a.nome).localeCompare(chaveOrdem(b.nome), 'pt-BR') || a.tipo.localeCompare(b.tipo),
);
