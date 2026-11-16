import { Effect } from '../models/effect.model';

/**
 * Biblioteca de Efeitos — estrutura inicial (Fase 1).
 *
 * Os itens abaixo são o catálogo planejado do MVP. Todos começam com
 * `implementado: false`; cada um só muda para `true` quando a
 * demonstração, o código e a explicação estiverem prontos e testados
 * (critérios da seção 16).
 */
export const EFFECTS: Effect[] = [
  // ---------- 01 · CSS Playground ----------
  {
    id: 'css-transition-basica',
    nome: 'Transição de cor e escala',
    labId: 'css',
    topico: 'Transitions',
    nivel: 'iniciante',
    descricao: 'Interpolar propriedades entre dois estados com transition.',
    implementado: false,
  },
  {
    id: 'css-keyframes-pulse',
    nome: 'Pulse com @keyframes',
    labId: 'css',
    topico: 'Keyframes',
    nivel: 'iniciante',
    descricao: 'Criar uma animação em loop definindo etapas com @keyframes.',
    implementado: false,
  },
  {
    id: 'css-card-3d',
    nome: 'Card com perspectiva 3D',
    labId: 'css',
    topico: 'Perspective',
    nivel: 'intermediario',
    descricao: 'Girar um card no espaço 3D usando perspective e rotateY.',
    implementado: false,
  },
  {
    id: 'css-clip-reveal',
    nome: 'Revelação com clip-path',
    labId: 'css',
    topico: 'Clip-path',
    nivel: 'intermediario',
    descricao: 'Mostrar conteúdo recortando a área visível com clip-path.',
    implementado: false,
  },
  // ---------- 02 · GSAP Studio ----------
  {
    id: 'gsap-to',
    nome: 'Primeiro tween com gsap.to()',
    labId: 'gsap',
    topico: 'gsap.to()',
    nivel: 'iniciante',
    descricao: 'Animar um elemento do estado atual até um estado final.',
    implementado: false,
  },
  {
    id: 'gsap-timeline',
    nome: 'Sequência com Timeline',
    labId: 'gsap',
    topico: 'Timeline',
    nivel: 'intermediario',
    descricao: 'Encadear animações e controlar play, pause e reverse.',
    implementado: false,
  },
  {
    id: 'gsap-stagger',
    nome: 'Entrada em cascata (stagger)',
    labId: 'gsap',
    topico: 'Stagger',
    nivel: 'intermediario',
    descricao: 'Animar uma lista de elementos com atraso entre cada um.',
    implementado: false,
  },
  // ---------- 03 · Scroll Lab ----------
  {
    id: 'scroll-scrub',
    nome: 'Animação presa à rolagem (scrub)',
    labId: 'scroll',
    topico: 'Scrub',
    nivel: 'intermediario',
    descricao: 'Fazer o progresso da animação acompanhar a barra de rolagem.',
    implementado: false,
  },
  {
    id: 'scroll-pin',
    nome: 'Seção fixa (pin)',
    labId: 'scroll',
    topico: 'Pin',
    nivel: 'intermediario',
    descricao: 'Fixar uma seção na tela enquanto a animação acontece.',
    implementado: false,
  },
  {
    id: 'scroll-horizontal',
    nome: 'Rolagem horizontal',
    labId: 'scroll',
    topico: 'Horizontal Scroll',
    nivel: 'avancado',
    descricao: 'Converter rolagem vertical em deslocamento horizontal.',
    implementado: false,
  },
];
