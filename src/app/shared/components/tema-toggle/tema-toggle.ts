import { Component, computed, inject, input } from '@angular/core';
import { TemaService } from '../../../core/services/tema.service';
import { Icon } from '../icon/icon';

/**
 * Botão que alterna entre modo claro e escuro.
 * Uso: <kx-tema-toggle /> ou <kx-tema-toggle [compacto]="true" /> (só o ícone).
 */
@Component({
  selector: 'kx-tema-toggle',
  imports: [Icon],
  template: `
    <button
      type="button"
      class="kx-btn kx-btn--ghost tema-toggle"
      [class.tema-toggle--compacto]="compacto()"
      [attr.aria-label]="rotuloCompleto()"
      [attr.title]="rotuloCompleto()"
      (click)="tema.alternar()"
    >
      <kx-icon [name]="claro() ? 'moon' : 'sun'" />
      @if (!compacto()) {
        <span aria-hidden="true">{{ rotulo() }}</span>
      }
    </button>
  `,
  styles: `
    .tema-toggle { width: 100%; justify-content: flex-start; }
    .tema-toggle--compacto { width: auto; min-width: 44px; justify-content: center; }
  `,
})
export class TemaToggle {
  readonly compacto = input(false);
  protected readonly tema = inject(TemaService);
  protected readonly claro = computed(() => this.tema.tema() === 'claro');
  /** O texto diz para onde o botão leva (por isso não usa aria-pressed). */
  protected readonly rotulo = computed(() => (this.claro() ? 'Modo escuro' : 'Modo claro'));
  protected readonly rotuloCompleto = computed(() => 'Mudar para o ' + this.rotulo().toLowerCase());
}
