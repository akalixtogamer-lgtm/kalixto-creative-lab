import { Component, input } from '@angular/core';

/**
 * Cabeçalho padrão das páginas.
 * Uso: <kx-page-header eyebrow="Fase 1" titulo="Dashboard" descricao="..." />
 */
@Component({
  selector: 'kx-page-header',
  template: `
    <header class="kx-page-header">
      @if (eyebrow()) {
        <p class="kx-eyebrow">{{ eyebrow() }}</p>
      }
      <h1 class="kx-title">{{ titulo() }}</h1>
      @if (descricao()) {
        <p class="kx-lead">{{ descricao() }}</p>
      }
      <ng-content />
    </header>
  `,
})
export class PageHeader {
  readonly eyebrow = input<string>('');
  readonly titulo = input.required<string>();
  readonly descricao = input<string>('');
}
