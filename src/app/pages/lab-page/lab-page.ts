import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LABS, findLab, vizinhos } from '../../core/data/labs.data';
import { EFFECTS } from '../../core/data/effects.data';
import { Breadcrumb } from '../../shared/components/breadcrumb/breadcrumb';
import { Icon } from '../../shared/components/icon/icon';
import { PageHeader } from '../../shared/components/page-header/page-header';
import { StatusBadge } from '../../shared/components/status-badge/status-badge';

/**
 * Página genérica de laboratório: usada pelos labs que ainda não têm
 * demonstrações (mostra o plano). Labs prontos têm componente próprio
 * — ex.: /labs/css → CssPlayground.
 */
@Component({
  selector: 'kx-lab-page',
  imports: [RouterLink, Breadcrumb, Icon, PageHeader, StatusBadge],
  templateUrl: './lab-page.html',
  styleUrl: './lab-page.css',
})
export class LabPage {
  /** Vem da rota graças a withComponentInputBinding(). */
  readonly id = input<string>();

  protected readonly lab = computed(() => findLab(this.id()));
  protected readonly efeitos = computed(() => EFFECTS.filter((e) => e.labId === this.id()));
  protected readonly navegacao = computed(() => vizinhos(this.id()));
  /** Primeiro laboratório com demos, sugerido enquanto este não fica pronto. */
  protected readonly labPronto = LABS.find((l) => l.disponivel);
}
