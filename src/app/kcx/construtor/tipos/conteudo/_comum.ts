/** Ajudantes compartilhados pelos tipos de conteudo. */
import { KcxEfeito, KcxEstado, KcxInteracao } from '../../../kcx.types';
import { Blocos, ConfigConstrutor } from '../../montar';

export const interacao = (
  no: string,
  de: string,
  para: string,
  gatilho: KcxInteracao['gatilho'] = 'clique',
): KcxInteracao => ({ no, gatilho, de, para, transicao: 'smart-animate', duracao: 300 });

/** Força da sombra no hover (variável + efeito do Figma + estados Padrão/Hover). */
export function sombraHover(b: Blocos, noRaiz: string) {
  const id = b.extra({
    id: 'forcaSombra',
    nome: 'Força da sombra no hover',
    tipo: 'float',
    padrao: 0.55,
    min: 0,
    max: 1,
    passo: 0.05,
    descricao: 'Opacidade da sombra colorida que aparece no hover.',
    grupo: 'effects',
    secao: 'aparencia',
    vinculos: [
      {
        propriedade: 'Opacidade da sombra (color-mix)',
        alvo: { tipo: 'css-var', nome: `${b.P}-sombra` },
        transformar: [{ op: 'multiplicar', fator: 100 }],
        unidadeSaida: '%',
      },
    ],
  });
  const efeito: KcxEfeito = {
    tipo: 'sombra',
    x: 0,
    y: 10,
    raio: 28,
    cor: b.corAlpha('corPrimaria', 'sombra-cor', id),
  };
  const estados: KcxEstado[] = [
    {
      id: 'padrao',
      nome: 'Padrão',
      gatilho: 'padrao',
      descricao: 'Em repouso.',
      valores: { [id]: 0 },
    },
    {
      id: 'hover',
      nome: 'Hover',
      gatilho: 'hover',
      descricao: 'Mouse por cima (ou foco).',
      valores: {},
    },
  ];
  return {
    id,
    efeito,
    estados,
    interacoes: [interacao(noRaiz, 'padrao', 'hover', 'hover')],
    sombraCss: `0 10px 28px color-mix(in srgb, ${b.v('primaria')} ${b.v('sombra')}, transparent)`,
  };
}

/** Imagem padrão (gradiente nas cores do tema) quando a pessoa não escolheu uma. */
export function imagemPadrao(cfg: ConfigConstrutor, rotulo = 'Sua imagem aqui'): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${cfg.cores.primaria}"/><stop offset="1" stop-color="${cfg.cores.superficie}"/></linearGradient></defs><rect width="640" height="400" fill="url(#g)"/><text x="320" y="210" text-anchor="middle" font-family="Inter, sans-serif" font-size="28" fill="#ffffff" fill-opacity=".8">${rotulo}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export const gradienteMidia = (b: Blocos) => [
  {
    tipo: 'gradiente-linear' as const,
    angulo: 135,
    paradas: [
      { posicao: 0, cor: b.cor('primaria') },
      { posicao: 1, cor: b.cor('superficie') },
    ],
  },
];

/** Tamanhos P/M/G dos botões (padding e texto, em px). */
export const TAMANHOS = [
  { valor: 'p', rotulo: 'P', px: 16, py: 8, fonte: 14 },
  { valor: 'm', rotulo: 'M', px: 24, py: 12, fonte: 16 },
  { valor: 'g', rotulo: 'G', px: 32, py: 16, fonte: 20 },
];

/* ============================== Botão ============================== */

/**
 * Animação "Preenche no hover" no Figma: vazado no Padrão (contorno + texto
 * na cor) e preenchido no Hover. Duas variáveis de estado controlam a opacidade
 * do preenchimento e da cor do texto (o Smart Animate faz a transição).
 */
export function varsPreencher(b: Blocos): { cheio: string; vazio: string } {
  const comum = {
    tipo: 'float' as const,
    min: 0,
    max: 1,
    passo: 1,
    grupo: 'effects' as const,
    secao: 'comportamento' as const,
  };
  const cheio = b.extra({
    ...comum,
    id: 'preenchido',
    nome: 'Preenchido',
    padrao: 1,
    descricao: 'Estado do preenchimento: 0 no Padrão (vazado), 1 no Hover (cheio).',
    vinculos: [{ propriedade: 'Preenchimento', alvo: { tipo: 'css-var', nome: `${b.P}-cheio` } }],
  });
  const vazio = b.extra({
    ...comum,
    id: 'vazado',
    nome: 'Vazado',
    padrao: 0,
    descricao: 'Inverso de Preenchido: 1 no Padrão (texto na cor), 0 no Hover.',
    vinculos: [{ propriedade: 'Contorno', alvo: { tipo: 'css-var', nome: `${b.P}-vazado` } }],
  });
  return { cheio, vazio };
}

export const PALETA_BOTOES = ['#d4119f', '#7c3aed', '#22e3ff', '#3ddc97', '#ffb547', '#ff5c7a'];

/** Cor do botão i: a escolhida, ou a principal (1º) e a paleta (demais). */
export function corDoBotao(cfg: ConfigConstrutor, i: number): string {
  const escolhida = cfg.coresItens?.[i];
  if (escolhida && /^#[0-9a-f]{6}$/i.test(escolhida)) return escolhida;
  return i === 0 ? cfg.cores.primaria : PALETA_BOTOES[i % PALETA_BOTOES.length];
}
