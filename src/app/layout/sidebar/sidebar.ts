import { Component, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LABS } from '../../core/data/labs.data';
import { Icon, IconName } from '../../shared/components/icon/icon';

/**
 * Menu lateral. Lista as páginas gerais e todos os laboratórios
 * a partir do registro LABS (core/data/labs.data.ts).
 */
@Component({
  selector: 'kx-sidebar',
  imports: [RouterLink, RouterLinkActive, Icon],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  /** Emitido ao clicar num link — usado no mobile para fechar o menu. */
  readonly navegou = output<void>();

  protected readonly labs = LABS;

  protected readonly paginas: { rota: string; rotulo: string; icone: IconName; exato: boolean }[] = [
    { rota: '/', rotulo: 'Dashboard', icone: 'home', exato: true },
    { rota: '/biblioteca', rotulo: 'Biblioteca de efeitos', icone: 'library', exato: false },
    { rota: '/design-system', rotulo: 'Design System', icone: 'palette', exato: false },
    { rota: '/roadmap', rotulo: 'Roadmap', icone: 'route', exato: false },
  ];
}
