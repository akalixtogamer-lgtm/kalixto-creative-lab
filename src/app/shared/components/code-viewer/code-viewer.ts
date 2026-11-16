import { Component, input, signal } from '@angular/core';
import { Icon } from '../icon/icon';

/**
 * Code Viewer — mostra o código da demonstração e permite copiar.
 * O código chega pronto (já com os valores atuais dos controles).
 * Uso: <kx-code-viewer [codigo]="css" linguagem="CSS" />
 */
@Component({
  selector: 'kx-code-viewer',
  imports: [Icon],
  templateUrl: './code-viewer.html',
  styleUrl: './code-viewer.css',
})
export class CodeViewer {
  readonly codigo = input.required<string>();
  readonly linguagem = input('CSS');
  readonly titulo = input('Code Viewer');

  protected readonly copiado = signal(false);
  private timer?: ReturnType<typeof setTimeout>;

  async copiar(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.codigo());
    } catch {
      // Fallback para navegadores sem a API de área de transferência
      const area = document.createElement('textarea');
      area.value = this.codigo();
      document.body.append(area);
      area.select();
      document.execCommand('copy');
      area.remove();
    }
    this.copiado.set(true);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.copiado.set(false), 1800);
  }
}
