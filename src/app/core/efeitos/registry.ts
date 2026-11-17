import { EFFECTS, DEMOS_POR_LAB } from '../data/effects.data';
import { findLab } from '../data/labs.data';
import { EffectKit, Interacao, NivelFicha, Tecnologia } from '../models/effect-sheet.model';
import { ANIMATED_BORDER } from './kits/animated-border.kit';
import { ANIMATED_GRADIENT } from './kits/animated-gradient.kit';
import { BUTTON_HOVER } from './kits/button-hover.kit';
import { CARD_TILT } from './kits/card-tilt.kit';
import { FADE_IN } from './kits/fade-in.kit';
import { GLOW_BUTTON } from './kits/glow-button.kit';
import { MAGNETIC_BUTTON } from './kits/magnetic-button.kit';
import { SCALE_REVEAL } from './kits/scale-reveal.kit';
import { SLIDE_IN } from './kits/slide-in.kit';
import { TEXT_REVEAL } from './kits/text-reveal.kit';
import { CUSTOM_CURSOR } from './kits/custom-cursor.kit';
import { GSAP_SCROLL_REVEAL } from './kits/gsap-scroll-reveal.kit';
import { IMAGE_DISTORTION } from './kits/image-distortion.kit';
import { LAYERED_PARALLAX } from './kits/layered-parallax.kit';
import { SCROLL_PROGRESS } from './kits/scroll-progress.kit';
import { SCROLL_REVEAL } from './kits/scroll-reveal.kit';
import { SMOOTH_SCROLL } from './kits/smooth-scroll.kit';
import { SPOTLIGHT_REVEAL } from './kits/spotlight-reveal.kit';
import { KINETIC_CAPTIONS } from './kits/kinetic-captions.kit';
import { ISOMETRIC_LAYERS } from './kits/isometric-layers.kit';
import { NEON_HANDWRITING } from './kits/neon-handwriting.kit';
import { THEME_WIPE } from './kits/theme-wipe.kit';
import { IMAGE_RIBBON } from './kits/image-ribbon.kit';
import { LENS_FOCUS } from './kits/lens-focus.kit';
import { PUFFY_TEXT } from './kits/puffy-text.kit';

/**
 * Registro central de efeitos.
 *
 * Kits: efeitos com ficha técnica completa e código autossuficiente.
 * Para adicionar um efeito, crie kits/<id>.kit.ts e inclua-o nesta lista.
 */
export const EFFECT_REGISTRY: EffectKit[] = [
  FADE_IN,
  SLIDE_IN,
  SCALE_REVEAL,
  BUTTON_HOVER,
  MAGNETIC_BUTTON,
  GLOW_BUTTON,
  ANIMATED_GRADIENT,
  TEXT_REVEAL,
  CARD_TILT,
  ANIMATED_BORDER,
  // Fase 3 — rolagem, cursor, máscaras e distorção
  SCROLL_REVEAL,
  SCROLL_PROGRESS,
  LAYERED_PARALLAX,
  GSAP_SCROLL_REVEAL,
  SMOOTH_SCROLL,
  CUSTOM_CURSOR,
  SPOTLIGHT_REVEAL,
  IMAGE_DISTORTION,
  // Referências em vídeo (Reels mapeados em 17/11/2026) — docs/REFERENCIAS-ANIMACAO.md
  KINETIC_CAPTIONS,
  ISOMETRIC_LAYERS,
  NEON_HANDWRITING,
  THEME_WIPE,
  IMAGE_RIBBON,
  LENS_FOCUS,
  PUFFY_TEXT,
];

export function findKit(id: string): EffectKit | undefined {
  return EFFECT_REGISTRY.find((k) => k.ficha.id === id);
}

/**
 * Categoria de cada demo dos laboratórios ("lab:demo" → categoria).
 * As demos continuam nos laboratórios; aqui só ganham lugar no mapa de efeitos.
 */
export const CATEGORIA_DAS_DEMOS: Record<string, string> = {
  'css:transitions': 'transicoes',
  'css:keyframes': 'transicoes',
  'css:transform': 'transicoes',
  'css:hover': 'microinteracoes',
  'css:floating': 'microinteracoes',
  'css:perspective': 'cards-imagens',
  'css:clip-path': 'svg-geometria',
  'css:microinteracoes': 'microinteracoes',
  'css:divisores': 'svg-geometria',
  'gsap:to': 'transicoes',
  'gsap:from': 'transicoes',
  'gsap:fromto': 'transicoes',
  'gsap:timeline': 'transicoes',
  'gsap:stagger': 'transicoes',
  'gsap:easing': 'transicoes',
  'gsap:reproducao': 'transicoes',
  'gsap:splittext': 'tipografia',
  'scroll:gatilho': 'scroll',
  'scroll:scrub': 'scroll',
  'scroll:pin': 'scroll',
  'scroll:parallax': 'scroll',
  'scroll:horizontal': 'scroll',
  'scroll:progresso': 'scroll',
  'scroll:storytelling': 'scroll',
  'scroll:navbar': 'navegacao',
  'scroll:capitulos': 'scroll',
  'svg:stroke': 'svg-geometria',
  'svg:mascara': 'svg-geometria',
  'svg:morph': 'svg-geometria',
  'svg:filtros': 'svg-geometria',
  'svg:motion-path': 'svg-geometria',
  'three:geometria': '3d-webgl',
  'three:camera': '3d-webgl',
  'three:iluminacao': '3d-webgl',
  'three:materiais': '3d-webgl',
  'three:texturas': '3d-webgl',
  'three:animacao': '3d-webgl',
  'three:mouse': '3d-webgl',
  'three:raycasting': '3d-webgl',
  'three:gltf': '3d-webgl',
  'webgl:fragment': '3d-webgl',
  'webgl:vertex': '3d-webgl',
  'webgl:glsl': '3d-webgl',
  'webgl:noise': 'experimental',
  'webgl:distortion': 'experimental',
  'webgl:procedural': 'experimental',
  'webgl:transicao': 'experimental',
  'ui:hero-editorial': 'tipografia',
  'ui:orbita': 'cursor',
  'ui:texto-profundidade': 'tipografia',
  'ui:mascara-formas': 'cards-imagens',
  'ui:divisores-svg': 'svg-geometria',
  'ui:carrossel-vidro': 'cards-imagens',
  'ui:numeros': 'componentes-dados',
  'ui:tipografia-vazada': 'tipografia',
  'ui:bento': 'cards-imagens',
  'ui:cards-profundidade': 'luz-profundidade',
  'ui:grao-filme': 'backgrounds',
  'ui:magnetico': 'cursor',
  'ui:marquee': 'tipografia',
};

/** Tecnologias e dependências de cada laboratório (o que o código das demos usa). */
const TEC_DO_LAB: Record<string, { tec: Tecnologia[]; dep: string[] }> = {
  css: { tec: ['CSS', 'HTML'], dep: [] },
  gsap: { tec: ['GSAP', 'JavaScript'], dep: ['gsap'] },
  scroll: { tec: ['GSAP', 'ScrollTrigger'], dep: ['gsap'] },
  svg: { tec: ['SVG', 'GSAP'], dep: ['gsap'] },
  three: { tec: ['Three.js', 'WebGL'], dep: ['three'] },
  webgl: { tec: ['WebGL', 'GLSL', 'Three.js'], dep: ['three'] },
  ui: { tec: ['CSS', 'GSAP'], dep: ['gsap'] },
};

/** Item da Biblioteca: um kit (ficha completa) ou uma demo de laboratório. */
export interface ItemCatalogo {
  chave: string;
  tipo: 'kit' | 'demo';
  nome: string;
  descricao: string;
  categoria: string;
  nivel: NivelFicha;
  tecnologias: Tecnologia[];
  dependencias: string[];
  interacoes: Interacao[];
  tags: string[];
  aplicacoes: string[];
  /** Texto do cartão acima do título (ex.: "CSS Playground · Hover"). */
  origem: string;
  rota: string[];
  query?: Record<string, string>;
  labId?: string;
  demoId?: string;
}

export const CATALOGO: ItemCatalogo[] = [
  ...EFFECT_REGISTRY.map(
    ({ ficha: f }): ItemCatalogo => ({
      chave: `kit:${f.id}`,
      tipo: 'kit',
      nome: f.nomeAmigavel,
      descricao: f.descricao,
      categoria: f.categoria,
      nivel: f.nivel,
      tecnologias: f.tecnologias,
      dependencias: f.dependencias,
      interacoes: f.interacoes,
      tags: [f.nomeTecnico, ...f.tags],
      aplicacoes: f.aplicacoes,
      origem: `Kit · ${f.nomeTecnico}`,
      rota: ['/efeitos', f.id],
    }),
  ),
  ...EFFECTS.map((e): ItemCatalogo => {
    const t = TEC_DO_LAB[e.labId] ?? { tec: [], dep: [] };
    return {
      chave: `demo:${e.labId}:${e.demoId}`,
      tipo: 'demo',
      nome: e.nome,
      descricao: e.descricao,
      categoria: CATEGORIA_DAS_DEMOS[`${e.labId}:${e.demoId}`] ?? 'experimental',
      nivel: e.nivel,
      tecnologias: t.tec,
      dependencias: t.dep,
      interacoes: [],
      tags: [e.topico],
      aplicacoes: [],
      origem: `${findLab(e.labId)?.titulo ?? e.labId} · ${e.topico}`,
      rota: ['/labs', e.labId],
      query: { demo: e.demoId ?? '' },
      labId: e.labId,
      demoId: e.demoId,
    };
  }),
];

/** Garante que toda demo dos laboratórios tem categoria (usado nos testes). */
export function demosSemCategoria(): string[] {
  return Object.entries(DEMOS_POR_LAB).flatMap(([lab, demos]) =>
    demos.map((d) => `${lab}:${d.id}`).filter((k) => !CATEGORIA_DAS_DEMOS[k]),
  );
}
