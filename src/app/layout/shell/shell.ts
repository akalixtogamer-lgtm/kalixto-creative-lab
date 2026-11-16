import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar';
import { Icon } from '../../shared/components/icon/icon';

/**
 * Estrutura geral da aplicação: menu lateral + área de conteúdo.
 * No mobile o menu vira uma gaveta aberta pelo botão da barra superior.
 */
@Component({
  selector: 'kx-shell',
  imports: [RouterOutlet, Sidebar, Icon],
  templateUrl: './shell.html',
  styleUrl: './shell.css',
  host: { '(document:keydown.escape)': 'fecharMenu()' },
})
export class Shell {
  protected readonly menuAberto = signal(false);

  alternarMenu(): void {
    this.menuAberto.update((aberto) => !aberto);
  }

  fecharMenu(): void {
    this.menuAberto.set(false);
  }
}
