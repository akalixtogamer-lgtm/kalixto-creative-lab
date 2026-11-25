/**
 * Catálogo dos efeitos web que o KCX reconhece e reconstrói. Cada entrada é a
 * base da ficha técnica: o que é, como se reconhece (no vídeo e no DOM), como
 * o KCX reconstrói (só CSS e um JavaScript pequeno, sem bibliotecas) e o que
 * não dá para garantir.
 */
import type { TipoEfeitoWeb } from './tipos';

export interface EntradaCatalogo {
  tipo: TipoEfeitoWeb;
  nome: string;
  descricao: string;
  /** Como aparece numa gravação. */
  noVideo: string;
  /** Como aparece no DOM/CSS. */
  noDom: string;
  /** Como o KCX reconstrói (sem GSAP, Framer, Lenis…). */
  reconstrucao: string;
  /** Tecnologias que costumam fazer este efeito nos sites. */
  tecnologiasComuns: string[];
  limitacoes: string[];
}

export const CATALOGO_EFEITOS: EntradaCatalogo[] = [
  {
    tipo: 'revelar',
    nome: 'Scroll reveal',
    descricao: 'Elementos aparecem (sobem, surgem ou desfocam → focam) quando entram na tela.',
    noVideo:
      'Durante a rolagem, uma região passa de vazia para cheia de detalhe em poucos quadros.',
    noDom:
      'Classes de estado (is-visible, aos-animate, data-aos), IntersectionObserver, animation-timeline: view().',
    reconstrucao:
      'IntersectionObserver liga data-visivel; transition de opacity e transform com atraso por item.',
    tecnologiasComuns: ['GSAP ScrollTrigger', 'AOS', 'Motion', 'CSS Scroll-driven Animations'],
    limitacoes: ['O ponto exato de disparo (threshold) é estimado.'],
  },
  {
    tipo: 'parallax',
    nome: 'Parallax',
    descricao: 'Camadas rolam em velocidades diferentes, criando profundidade.',
    noVideo:
      'Na mesma rolagem, partes da tela andam em velocidades diferentes (razão medida entre elas).',
    noDom:
      'transform ligado ao scroll (data-speed, data-scroll-speed, ScrollTrigger scrub, animation-timeline: scroll()).',
    reconstrucao: 'O scroll do palco vira --rolagem; cada camada usa translateY(rolagem × fator).',
    tecnologiasComuns: [
      'GSAP ScrollTrigger',
      'Locomotive Scroll',
      'Lenis',
      'CSS Scroll-driven Animations',
    ],
    limitacoes: ['A separação das camadas vem da imagem: camadas sobrepostas podem virar uma só.'],
  },
  {
    tipo: 'sticky',
    nome: 'Sticky section',
    descricao: 'Uma parte fica presa enquanto o resto da página rola.',
    noVideo: 'Durante a rolagem, uma região não se move enquanto o resto anda.',
    noDom: 'position: sticky/fixed; .pin-spacer (ScrollTrigger pin).',
    reconstrucao: 'position: sticky dentro do palco de rolagem.',
    tecnologiasComuns: ['CSS position: sticky', 'GSAP ScrollTrigger (pin)'],
    limitacoes: [
      'No vídeo, um cabeçalho fixo e uma seção presa parecem iguais; a região diz qual é.',
    ],
  },
  {
    tipo: 'horizontal',
    nome: 'Horizontal scroll',
    descricao: 'Rolar para baixo move o conteúdo para o lado.',
    noVideo: 'O conteúdo anda na horizontal enquanto a página quase não anda na vertical.',
    noDom:
      'Trilho com transform: translateX ligado ao scroll, seção presa (pin) e largura maior que a tela.',
    reconstrucao: 'Seção alta com trilho sticky; o progresso do scroll vira translateX.',
    tecnologiasComuns: ['GSAP ScrollTrigger', 'Swiper (carrossel)', 'CSS scroll-snap'],
    limitacoes: ['Um carrossel arrastado e um scroll horizontal parecem iguais no vídeo.'],
  },
  {
    tipo: 'empilhar',
    nome: 'Card stacking',
    descricao: 'Cards ficam presos e os seguintes sobem e se empilham por cima.',
    noVideo: 'Uma região fica parada enquanto conteúdo novo sobe por cima dela.',
    noDom: 'Vários position: sticky com top crescente, ou pin + scale no card anterior.',
    reconstrucao: 'Cards position: sticky com top escalonado e um leve scale no de trás.',
    tecnologiasComuns: ['CSS position: sticky', 'GSAP ScrollTrigger'],
    limitacoes: ['Diferenciar empilhamento de troca de seção depende da região e do tempo.'],
  },
  {
    tipo: 'morph',
    nome: 'Morphing',
    descricao:
      'Uma forma muda de contorno suavemente (blob, botão que vira card, ícone que vira outro).',
    noVideo: 'Uma região muda de forma aos poucos sem se deslocar como um todo.',
    noDom: 'border-radius/clip-path animados, SVG path com d animado, flubber, MorphSVG.',
    reconstrucao: '@keyframes de border-radius e rotate (forma orgânica) com estado alternativo.',
    tecnologiasComuns: ['CSS border-radius/clip-path', 'SVG', 'GSAP MorphSVG'],
    limitacoes: ['Morph de caminhos SVG complexos vira uma forma orgânica aproximada.'],
  },
  {
    tipo: 'hover',
    nome: 'Hover',
    descricao: 'Elementos reagem quando o mouse passa: sobem, crescem, brilham.',
    noVideo:
      'Uma região pequena muda enquanto o resto fica parado (às vezes com o cursor por perto).',
    noDom: 'Regras :hover com transform/box-shadow/filter e transition.',
    reconstrucao: ':hover e :focus-visible com transform, sombra e transition.',
    tecnologiasComuns: ['CSS :hover', 'Motion (whileHover)', 'Framer Motion'],
    limitacoes: [
      'Gravações de celular não mostram o cursor: o hover é inferido pela mudança local.',
    ],
  },
  {
    tipo: 'texto',
    nome: 'Texto animado',
    descricao: 'Título que entra por palavras ou letras (sobe, desfoca → foca, máscara).',
    noVideo: 'Uma faixa de texto muda aos poucos da esquerda para a direita ou de baixo para cima.',
    noDom: 'Spans por palavra/letra (SplitText, split-type, data-splitting) com atraso por índice.',
    reconstrucao: 'O título é dividido em palavras no carregamento; cada uma sobe com atraso.',
    tecnologiasComuns: ['GSAP SplitText', 'Splitting.js', 'Motion'],
    limitacoes: ['A divisão por letra vira divisão por palavra (mais acessível e leve).'],
  },
  {
    tipo: 'vidro',
    nome: 'Glassmorphism',
    descricao: 'Superfície translúcida que desfoca o que está atrás.',
    noVideo: 'Região retangular mais clara e com pouco detalhe sobre um fundo cheio de detalhe.',
    noDom: 'backdrop-filter: blur(), fundo rgba e borda clara.',
    reconstrucao: 'backdrop-filter com intensidade variável sobre manchas de cor animadas.',
    tecnologiasComuns: ['CSS backdrop-filter'],
    limitacoes: ['A quantidade de desfoque é estimada pela perda de detalhe.'],
  },
  {
    tipo: 'profundidade',
    nome: 'Efeito de profundidade',
    descricao: 'Zoom, aproximação ou camadas em 3D que dão sensação de entrar na cena.',
    noVideo:
      'As bordas da imagem se afastam do centro (zoom) ou camadas crescem em ritmos diferentes.',
    noDom: 'scale/translateZ ligados ao scroll, perspective, Three.js/WebGL.',
    reconstrucao: 'Cada card cresce e aparece conforme chega ao centro do palco (scale + opacity).',
    tecnologiasComuns: ['CSS perspective/scale', 'GSAP ScrollTrigger', 'Three.js', 'WebGL'],
    limitacoes: ['Cenas 3D reais (Three.js/WebGL) viram uma aproximação 2D com CSS.'],
  },
  {
    tipo: 'cursor',
    nome: 'Interação com cursor',
    descricao: 'Cursor personalizado, elementos magnéticos ou que inclinam seguindo o mouse.',
    noVideo: 'Um elemento acompanha uma posição que muda (o cursor), com atraso.',
    noDom: 'Elemento fixo que segue pointermove; cursor: none; transform ligado ao mouse.',
    reconstrucao:
      'Seguidor com atraso por transition e cards que inclinam com o ponteiro (pointermove).',
    tecnologiasComuns: ['JavaScript (pointermove)', 'GSAP quickTo', 'Motion'],
    limitacoes: [
      'Sem cursor visível no vídeo, este efeito só entra por marcação manual ou pelo DOM.',
    ],
  },
  {
    tipo: 'transicao',
    nome: 'Transição',
    descricao: 'Troca de cena ou de página: corte, fade, cortina, círculo que cresce.',
    noVideo: 'Quase toda a tela muda sem deslocamento; em um quadro (corte) ou em vários (fade).',
    noDom: 'View Transitions API (view-transition-name), Barba.js, Swup, rotas com animação.',
    reconstrucao: 'Duas telas alternadas por clip-path circular ou fade, com duração variável.',
    tecnologiasComuns: [
      'View Transitions API',
      'Barba.js',
      'Swup',
      'Framer Motion (AnimatePresence)',
    ],
    limitacoes: ['Transições entre páginas reais viram troca entre duas telas do componente.'],
  },
];

export function entradaCatalogo(tipo: TipoEfeitoWeb): EntradaCatalogo {
  return CATALOGO_EFEITOS.find((e) => e.tipo === tipo) ?? CATALOGO_EFEITOS[0];
}

export const TIPOS_EFEITO_WEB = CATALOGO_EFEITOS.map((e) => e.tipo);
