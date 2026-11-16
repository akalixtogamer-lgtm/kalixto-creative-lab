import { Effect } from '../models/effect.model';
import { CSS_DEMOS } from './css-demos.data';
import { GSAP_DEMOS } from './gsap-demos.data';

/**
 * Biblioteca de Efeitos — estrutura inicial (Fase 1).
 *
 * Catálogo do MVP. `implementado: true` significa que a demonstração
 * interativa, o código e a explicação já existem; a validação final
 * segue os critérios da seção 16 (docs/ROADMAP.md).
 */
export const EFFECTS: Effect[] = [
  // ---------- 01 · CSS Playground (gerado a partir de CSS_DEMOS) ----------
  ...CSS_DEMOS.map(
    (d): Effect => ({
      id: `css-${d.id}`,
      nome: d.titulo,
      labId: 'css',
      topico: d.topico,
      nivel: d.nivel,
      descricao: d.resumo,
      demoId: d.id,
      implementado: true,
    }),
  ),
  // ---------- 02 · GSAP Studio (gerado a partir de GSAP_DEMOS) ----------
  ...GSAP_DEMOS.map(
    (d): Effect => ({
      id: `gsap-${d.id}`,
      nome: d.titulo,
      labId: 'gsap',
      topico: d.topico,
      nivel: d.nivel,
      descricao: d.resumo,
      demoId: d.id,
      implementado: true,
    }),
  ),
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
