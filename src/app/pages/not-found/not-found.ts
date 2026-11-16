import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageHeader } from '../../shared/components/page-header/page-header';

/** Página para rotas inexistentes. */
@Component({
  selector: 'kx-not-found',
  imports: [RouterLink, PageHeader],
  template: `
    <div class="kx-page">
      <kx-page-header eyebrow="Erro 404" titulo="Página não encontrada" descricao="Esse experimento ainda não existe." />
      <a class="kx-btn kx-btn--primary" routerLink="/" style="align-self: flex-start">Voltar ao Dashboard</a>
    </div>
  `,
})
export class NotFound {}
