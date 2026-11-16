import { Lab } from '../models/lab.model';

/**
 * Registro central dos laboratórios.
 * Dashboard, navegação e rotas leem desta lista — para adicionar
 * ou liberar um laboratório, altere apenas aqui.
 */
export const LABS: Lab[] = [
  {
    id: 'css',
    numero: '01',
    titulo: 'CSS Playground',
    resumo: 'Animações e microinterações só com CSS: do transition ao clip-path.',
    fase: 2,
    status: 'em-construcao',
    tecnologias: ['CSS'],
    topicos: [
      'Transitions',
      'Keyframes',
      'Transform',
      'Hover',
      'Floating',
      'Perspective',
      'Clip-path',
      'Microinterações',
    ],
    acento: 'magenta',
  },
  {
    id: 'gsap',
    numero: '02',
    titulo: 'GSAP Studio',
    resumo: 'Tweens, timelines e easing com controles de reprodução.',
    fase: 2,
    status: 'em-construcao',
    tecnologias: ['GSAP'],
    topicos: [
      'gsap.to()',
      'gsap.from()',
      'gsap.fromTo()',
      'Timeline',
      'Stagger',
      'Easing',
      'Controles de reprodução',
    ],
    acento: 'roxo',
  },
  {
    id: 'scroll',
    numero: '03',
    titulo: 'Scroll Lab',
    resumo: 'Animações guiadas pela rolagem com ScrollTrigger.',
    fase: 2,
    status: 'em-construcao',
    tecnologias: ['GSAP', 'ScrollTrigger'],
    topicos: [
      'ScrollTrigger',
      'Scrub',
      'Pin',
      'Parallax',
      'Horizontal Scroll',
      'Scroll Progress',
      'Scroll Storytelling',
    ],
    acento: 'azul',
  },
  {
    id: 'svg',
    numero: '04',
    titulo: 'SVG Lab',
    resumo: 'Traços, máscaras e morphing em gráficos vetoriais.',
    fase: 3,
    status: 'planejado',
    tecnologias: ['SVG', 'CSS', 'GSAP'],
    topicos: ['Stroke animation', 'Máscaras', 'Morphing', 'Filtros'],
    acento: 'ciano',
  },
  {
    id: 'three',
    numero: '05',
    titulo: 'Three.js Lab',
    resumo: 'Cenas 3D com câmeras, luzes, materiais e interação.',
    fase: 4,
    status: 'bloqueado',
    tecnologias: ['Three.js'],
    topicos: [
      'Objetos geométricos',
      'Câmeras',
      'Iluminação',
      'Materiais',
      'Texturas',
      'Animações 3D',
      'Interação por mouse',
      'Raycasting',
      'Modelos GLTF/GLB',
    ],
    acento: 'roxo',
  },
  {
    id: 'webgl',
    numero: '06',
    titulo: 'WebGL & GLSL',
    resumo: 'Shaders, noise e distorções procedurais.',
    fase: 5,
    status: 'bloqueado',
    tecnologias: ['WebGL', 'GLSL', 'Three.js'],
    topicos: [
      'Vertex Shaders',
      'Fragment Shaders',
      'GLSL',
      'Noise',
      'Distortion',
      'Efeitos procedurais',
      'Transições com shaders',
    ],
    acento: 'magenta',
  },
];

/** Busca um laboratório pelo id da rota. */
export function findLab(id: string | null | undefined): Lab | undefined {
  return LABS.find((lab) => lab.id === id);
}
