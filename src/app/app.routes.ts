import { Routes } from '@angular/router';
import { Shell } from './layout/shell/shell';

/**
 * Rotas do KALIXTO CREATIVE LAB.
 * Todas as páginas são carregadas sob demanda (lazy loading), assim
 * os laboratórios pesados (GSAP, Three.js…) não pesam no carregamento inicial.
 */
export const routes: Routes = [
  {
    path: '',
    component: Shell,
    children: [
      {
        path: '',
        title: 'Dashboard · Kalixto Creative Lab',
        loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'labs/css',
        title: 'CSS Playground · Kalixto Creative Lab',
        loadComponent: () =>
          import('./pages/css-playground/css-playground').then((m) => m.CssPlayground),
      },
      {
        path: 'labs/gsap',
        title: 'GSAP Studio · Kalixto Creative Lab',
        loadComponent: () => import('./pages/gsap-studio/gsap-studio').then((m) => m.GsapStudio),
      },
      {
        path: 'labs/scroll',
        title: 'Scroll Lab · Kalixto Creative Lab',
        loadComponent: () => import('./pages/scroll-lab/scroll-lab').then((m) => m.ScrollLab),
      },
      {
        path: 'labs/svg',
        title: 'SVG Lab · Kalixto Creative Lab',
        loadComponent: () => import('./pages/svg-lab/svg-lab').then((m) => m.SvgLab),
      },
      {
        path: 'labs/three',
        title: 'Three.js Lab · Kalixto Creative Lab',
        loadComponent: () => import('./pages/three-lab/three-lab').then((m) => m.ThreeLab),
      },
      {
        path: 'labs/webgl',
        title: 'WebGL & GLSL · Kalixto Creative Lab',
        loadComponent: () => import('./pages/glsl-lab/glsl-lab').then((m) => m.GlslLab),
      },
      {
        path: 'labs/ui',
        title: 'Interface Lab · Kalixto Creative Lab',
        loadComponent: () => import('./pages/ui-lab/ui-lab').then((m) => m.UiLab),
      },
      {
        path: 'labs/:id',
        title: 'Laboratório · Kalixto Creative Lab',
        loadComponent: () => import('./pages/lab-page/lab-page').then((m) => m.LabPage),
      },
      {
        path: 'biblioteca',
        title: 'Biblioteca de efeitos · Kalixto Creative Lab',
        loadComponent: () => import('./pages/biblioteca/biblioteca').then((m) => m.Biblioteca),
      },
      {
        path: 'efeitos/:id',
        title: 'Efeito · Kalixto Creative Lab',
        loadComponent: () => import('./pages/efeito/efeito').then((m) => m.Efeito),
      },
      {
        path: 'efeitos',
        redirectTo: 'biblioteca',
        pathMatch: 'full',
      },
      {
        path: 'kcx',
        title: 'KCX Studio · Kalixto Creative Lab',
        loadComponent: () => import('./pages/kcx/kcx-studio/kcx-studio').then((m) => m.KcxStudio),
      },
      {
        path: 'kcx/compor',
        title: 'Composição KCX · Kalixto Creative Lab',
        loadComponent: () =>
          import('./pages/kcx/kcx-compositor/kcx-compositor').then((m) => m.KcxCompositor),
      },
      {
        path: 'kcx/design-system',
        title: 'Design system · KCX Studio · Kalixto Creative Lab',
        loadComponent: () =>
          import('./pages/kcx/kcx-design-system/kcx-design-system').then(
            (m) => m.KcxDesignSystemPagina,
          ),
      },
      {
        path: 'kcx/briefing',
        title: 'Briefing · KCX Studio · Kalixto Creative Lab',
        loadComponent: () =>
          import('./pages/kcx/kcx-briefing/kcx-briefing').then((m) => m.KcxBriefingPagina),
      },
      {
        path: 'kcx/moodboard',
        title: 'Moodboard · KCX Studio · Kalixto Creative Lab',
        loadComponent: () =>
          import('./pages/kcx/kcx-moodboard/kcx-moodboard').then((m) => m.KcxMoodboardPagina),
      },
      {
        path: 'kcx/moldes',
        title: 'Moldes de página · KCX Studio · Kalixto Creative Lab',
        loadComponent: () =>
          import('./pages/kcx/kcx-moldes/kcx-moldes').then((m) => m.KcxMoldesPagina),
      },
      {
        path: 'kcx/mapa',
        title: 'Mapa de navegação e fluxos · KCX Studio · Kalixto Creative Lab',
        loadComponent: () => import('./pages/kcx/kcx-mapa/kcx-mapa').then((m) => m.KcxMapaPagina),
      },
      {
        path: 'kcx/fundacao',
        title: 'Fundação do design system · KCX Studio · Kalixto Creative Lab',
        loadComponent: () =>
          import('./pages/kcx/kcx-fundacao/kcx-fundacao').then((m) => m.KcxFundacaoPagina),
      },
      {
        path: 'kcx/montar',
        title: 'Montador visual · KCX Studio · Kalixto Creative Lab',
        loadComponent: () =>
          import('./pages/kcx/kcx-montador/kcx-montador').then((m) => m.KcxMontador),
      },
      {
        path: 'kcx/telas',
        title: 'Telas e wireframes · KCX Studio · Kalixto Creative Lab',
        loadComponent: () => import('./pages/kcx/kcx-telas/kcx-telas').then((m) => m.KcxTelas),
      },
      {
        path: 'kcx/comparar',
        title: 'Reference vs. Reconstruction · KCX Studio · Kalixto Creative Lab',
        loadComponent: () =>
          import('./pages/kcx/kcx-comparar/kcx-comparar').then((m) => m.KcxComparar),
      },
      {
        path: 'kcx/criar',
        title: 'Criar componente · KCX Studio · Kalixto Creative Lab',
        loadComponent: () => import('./pages/kcx/kcx-criar/kcx-criar').then((m) => m.KcxCriar),
      },
      {
        path: 'kcx/:id',
        title: 'Editor KCX · Kalixto Creative Lab',
        loadComponent: () => import('./pages/kcx/kcx-editor/kcx-editor').then((m) => m.KcxEditor),
      },
      {
        path: 'glossario',
        title: 'Glossário A–Z · Kalixto Creative Lab',
        loadComponent: () => import('./pages/glossario/glossario').then((m) => m.Glossario),
      },
      {
        path: 'trilha',
        title: 'Trilha de aprendizagem · Kalixto Creative Lab',
        loadComponent: () => import('./pages/trilha/trilha').then((m) => m.Trilha),
      },
      {
        path: 'exercicios',
        title: 'Exercícios · Kalixto Creative Lab',
        loadComponent: () => import('./pages/exercicios/exercicios').then((m) => m.Exercicios),
      },
      {
        path: 'comparador',
        title: 'Comparador de tecnologias · Kalixto Creative Lab',
        loadComponent: () => import('./pages/comparador/comparador').then((m) => m.Comparador),
      },
      {
        path: 'design-system',
        title: 'Design System · Kalixto Creative Lab',
        loadComponent: () =>
          import('./pages/design-system/design-system').then((m) => m.DesignSystem),
      },
      {
        path: 'roadmap',
        title: 'Roadmap · Kalixto Creative Lab',
        loadComponent: () => import('./pages/roadmap/roadmap').then((m) => m.Roadmap),
      },
      {
        path: '**',
        title: 'Página não encontrada · Kalixto Creative Lab',
        loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFound),
      },
    ],
  },
];
