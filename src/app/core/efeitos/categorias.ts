import { CategoriaEfeito } from '../models/effect-sheet.model';

/**
 * As 15 categorias do mapa de efeitos (Master Prompt, seção 04).
 * Para criar uma categoria nova, basta acrescentar um item aqui:
 * a Biblioteca e os filtros leem esta lista.
 */
export const CATEGORIAS: CategoriaEfeito[] = [
  {
    id: 'microinteracoes',
    numero: '01',
    nome: 'Microinterações e UI',
    descricao: 'Botões, toggles, tooltips, menus e respostas imediatas a uma ação.',
  },
  {
    id: 'transicoes',
    numero: '02',
    nome: 'Entradas, saídas e transições',
    descricao: 'Como um elemento aparece, some ou troca de estado.',
  },
  {
    id: 'scroll',
    numero: '03',
    nome: 'Scroll e parallax',
    descricao: 'Efeitos controlados pela rolagem da página.',
  },
  {
    id: 'tipografia',
    numero: '04',
    nome: 'Tipografia e texto',
    descricao: 'Revelar, animar e estilizar texto.',
  },
  {
    id: 'cursor',
    numero: '05',
    nome: 'Mouse e cursor',
    descricao: 'Elementos que reagem à posição do ponteiro.',
  },
  {
    id: 'cards-imagens',
    numero: '06',
    nome: 'Cards, imagens e galerias',
    descricao: 'Profundidade, máscaras e carrosséis de conteúdo visual.',
  },
  {
    id: 'backgrounds',
    numero: '07',
    nome: 'Backgrounds',
    descricao: 'Fundos animados, texturas e padrões.',
  },
  {
    id: 'luz-profundidade',
    numero: '08',
    nome: 'Luz, sombra e profundidade',
    descricao: 'Brilho, reflexo, vidro e camadas.',
  },
  {
    id: 'svg-geometria',
    numero: '09',
    nome: 'SVG, geometria e máscaras',
    descricao: 'Traços, morphing, recortes e filtros vetoriais.',
  },
  {
    id: 'particulas',
    numero: '10',
    nome: 'Partículas e simulações',
    descricao: 'Sistemas de partículas e física simples.',
  },
  {
    id: '3d-webgl',
    numero: '11',
    nome: '3D e WebGL',
    descricao: 'Cenas 3D, câmeras, materiais e shaders.',
  },
  {
    id: 'audio',
    numero: '12',
    nome: 'Áudio e audiovisual',
    descricao: 'Visualizações que reagem ao som.',
  },
  {
    id: 'componentes-dados',
    numero: '13',
    nome: 'Componentes e dados',
    descricao: 'Progresso, contadores, gráficos e linhas do tempo.',
  },
  {
    id: 'navegacao',
    numero: '14',
    nome: 'Navegação e experiência de página',
    descricao: 'Navbars, transições de página e menus.',
  },
  {
    id: 'experimental',
    numero: '15',
    nome: 'Experimental e creative coding',
    descricao: 'Distorções, glitch, procedural e arte generativa.',
  },
];

export function findCategoria(id: string): CategoriaEfeito | undefined {
  return CATEGORIAS.find((c) => c.id === id);
}
