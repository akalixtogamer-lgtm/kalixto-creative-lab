import { Component, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../../../shared/components/icon/icon';
import { lerArquivo } from '../kcx-estado.service';
import { KcxFundacaoService } from '../kcx-fundacao.service';

/**
 * Botão "Importar design system": lê o .kcx-fundacao.json do plugin Figma
 * Bridge (ou o JSON da Fundação) e troca a fundação do lab. Fica em vários
 * lugares (KCX Studio, guia do design system) para ser fácil de achar.
 */
@Component({
  selector: 'kx-kcx-importar-ds',
  imports: [RouterLink, Icon],
  template: `
    <label class="kx-btn" [class.kx-btn--primary]="destaque()" [class.kx-btn--ghost]="!destaque()">
      <kx-icon name="upload" /> Importar design system
      <input
        type="file"
        accept=".json,.kcx,application/json"
        aria-label="Importar design system (.kcx-fundacao.json ou JSON da Fundação)"
        (change)="importar($event)"
      />
    </label>
    @if (resultado(); as r) {
      <p class="kcxids__msg" [class.kcxids__msg--erro]="!r.ok" role="status">
        {{ r.texto }}
        @if (r.ok) {
          <a routerLink="/kcx/fundacao">Ver a Fundação</a> ·
          <a routerLink="/kcx/design-system">Ver o guia</a>
        }
      </p>
    }
  `,
  styles: `
    :host {
      display: contents;
    }
    label {
      position: relative;
      cursor: pointer;
    }
    input {
      position: absolute;
      inset: 0;
      opacity: 0;
      cursor: pointer;
    }
    .kcxids__msg {
      flex-basis: 100%;
      margin: 0.25rem 0 0;
      font-size: 0.88rem;
    }
    .kcxids__msg--erro {
      color: var(--kx-perigo, #ff5470);
    }
  `,
})
export class KcxImportarDs {
  private readonly servico = inject(KcxFundacaoService);
  readonly destaque = input(false);
  protected readonly resultado = signal<{ ok: boolean; texto: string } | null>(null);

  protected async importar(e: Event): Promise<void> {
    const texto = await lerArquivo(e);
    if (texto === null) return;
    const r = this.servico.importarTexto(texto);
    this.resultado.set(
      r.ok
        ? { ok: true, texto: `Design system “${r.nome}” importado.` }
        : { ok: false, texto: r.erro },
    );
  }
}
