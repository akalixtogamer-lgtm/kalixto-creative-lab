import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface Migalha {
  rotulo: string;
  rota?: string;
}

/**
 * Trilha de navegação ("Dashboard / Laboratórios / CSS Playground").
 * O último item é a página atual e não tem link.
 */
@Component({
  selector: 'kx-breadcrumb',
  imports: [RouterLink],
  template: `
    <nav class="kx-breadcrumb" aria-label="Você está em">
      <ol>
        @for (m of itens(); track m.rotulo; let ultimo = $last) {
          <li>
            @if (m.rota && !ultimo) {
              <a [routerLink]="m.rota">{{ m.rotulo }}</a>
            } @else {
              <span [attr.aria-current]="ultimo ? 'page' : null">{{ m.rotulo }}</span>
            }
          </li>
        }
      </ol>
    </nav>
  `,
})
export class Breadcrumb {
  readonly itens = input.required<Migalha[]>();
}
