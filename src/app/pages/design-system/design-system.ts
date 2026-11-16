import { Component } from '@angular/core';
import { Logo } from '../../shared/components/logo/logo';
import { PageHeader } from '../../shared/components/page-header/page-header';
import { StatusBadge } from '../../shared/components/status-badge/status-badge';

/**
 * Vitrine do Design System Kalixto: cores, tipografia e componentes.
 * Serve de referência visual para quem for criar novos laboratórios.
 */
@Component({
  selector: 'kx-design-system',
  imports: [Logo, PageHeader, StatusBadge],
  templateUrl: './design-system.html',
  styleUrl: './design-system.css',
})
export class DesignSystem {
  protected readonly cores = [
    { nome: 'Magenta', token: '--kx-magenta', hex: '#FF2BD6' },
    { nome: 'Roxo', token: '--kx-roxo', hex: '#8B5CF6' },
    { nome: 'Azul elétrico', token: '--kx-azul', hex: '#2F7BFF' },
    { nome: 'Ciano', token: '--kx-ciano', hex: '#22E3FF' },
    { nome: 'Fundo', token: '--kx-bg', hex: '#07050F' },
    { nome: 'Texto', token: '--kx-text', hex: '#F5F3FF' },
  ];

  protected readonly tipos = [
    { token: '--kx-fs-2xl', rotulo: 'Título de página', classe: 'ds-t-2xl' },
    { token: '--kx-fs-xl', rotulo: 'Destaque', classe: 'ds-t-xl' },
    { token: '--kx-fs-lg', rotulo: 'Subtítulo', classe: 'ds-t-lg' },
    { token: '--kx-fs-md', rotulo: 'Texto corrido', classe: 'ds-t-md' },
    { token: '--kx-fs-sm', rotulo: 'Texto de apoio', classe: 'ds-t-sm' },
  ];

  protected readonly exemploCodigo = `.meu-card {
  background: var(--kx-surface);
  border: 1px solid var(--kx-border);
  border-radius: var(--kx-radius-lg);
  transition: transform var(--kx-dur-base) var(--kx-ease-out);
}`;
}
