import { Type } from '@angular/core';

/**
 * Versão Angular de cada kit, gerada com os valores padrão (npm run gerar:angular).
 * Carregadas sob demanda na página do efeito, no modo "Componente Angular".
 */
export const COMPONENTES_ANGULAR: Record<string, () => Promise<Type<unknown>>> = {
  'fade-in': () => import('./fade-in/fade-in').then((m) => m.FadeIn),
  'slide-in': () => import('./slide-in/slide-in').then((m) => m.SlideIn),
  'scale-reveal': () => import('./scale-reveal/scale-reveal').then((m) => m.ScaleReveal),
  'button-hover': () => import('./button-hover/button-hover').then((m) => m.ButtonHover),
  'magnetic-button': () => import('./magnetic-button/magnetic-button').then((m) => m.MagneticButton),
  'glow-button': () => import('./glow-button/glow-button').then((m) => m.GlowButton),
  'animated-gradient': () => import('./animated-gradient/animated-gradient').then((m) => m.AnimatedGradient),
  'text-reveal': () => import('./text-reveal/text-reveal').then((m) => m.TextReveal),
  'card-tilt': () => import('./card-tilt/card-tilt').then((m) => m.CardTilt),
  'animated-border': () => import('./animated-border/animated-border').then((m) => m.AnimatedBorder),
  'scroll-reveal': () => import('./scroll-reveal/scroll-reveal').then((m) => m.ScrollReveal),
  'scroll-progress': () => import('./scroll-progress/scroll-progress').then((m) => m.ScrollProgress),
  'layered-parallax': () => import('./layered-parallax/layered-parallax').then((m) => m.LayeredParallax),
  'gsap-scroll-reveal': () => import('./gsap-scroll-reveal/gsap-scroll-reveal').then((m) => m.GsapScrollReveal),
  'smooth-scroll': () => import('./smooth-scroll/smooth-scroll').then((m) => m.SmoothScroll),
  'custom-cursor': () => import('./custom-cursor/custom-cursor').then((m) => m.CustomCursor),
  'spotlight-reveal': () => import('./spotlight-reveal/spotlight-reveal').then((m) => m.SpotlightReveal),
  'image-distortion': () => import('./image-distortion/image-distortion').then((m) => m.ImageDistortion),
};
