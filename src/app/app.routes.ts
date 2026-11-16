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
