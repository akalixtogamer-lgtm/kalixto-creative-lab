import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { findLab } from '../../core/data/labs.data';
import { EFFECTS } from '../../core/data/effects.data';
import { PageHeader } from '../../shared/components/page-header/page-header';
import { StatusBadge } from '../../shared/components/status-badge/status-badge';

/**
 * Página genérica de laboratório (Fase 1).
 * Recebe o `id` da rota /labs/:id e mostra o planejamento do lab.
 * Na Fase 2, CSS, GSAP e Scroll ganham componentes próprios com as
 * demonstrações reais — esta página continua servindo os labs futuros.
 */
@Component({
  selector: 'kx-lab-page',
  imports: [RouterLink, PageHeader, StatusBadge],
  templateUrl: './lab-page.html',
  styleUrl: './lab-page.css',
})
export class LabPage {
  /** Vem da rota graças a withComponentInputBinding(). */
  readonly id = input<string>();

  protected readonly lab = computed(() => findLab(this.id()));
  protected readonly efeitos = computed(() => EFFECTS.filter((e) => e.labId === this.id()));
}
