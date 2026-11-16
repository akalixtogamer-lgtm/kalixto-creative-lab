import { Component, computed, input } from '@angular/core';
import { LabStatus } from '../../../core/models/lab.model';

/** Rótulos legíveis para cada status. */
const ROTULOS: Record<LabStatus, string> = {
  'em-construcao': 'Em construção',
  planejado: 'Planejado',
  bloqueado: 'Bloqueado',
  validado: 'Validado',
};

/**
 * Selo de status reutilizável (Design System Kalixto).
 * Uso: <kx-status-badge [status]="lab.status" />
 */
@Component({
  selector: 'kx-status-badge',
  template: `<span [class]="'kx-badge kx-badge--' + status()">{{ rotulo() }}</span>`,
})
export class StatusBadge {
  readonly status = input.required<LabStatus>();
  protected readonly rotulo = computed(() => ROTULOS[this.status()]);
}
