import { Component, computed, input, signal } from '@angular/core';
import { Icon } from '../icon/icon';
import { Linguagem, Trecho, realcarLinhas } from '../../utils/realce';

/** Rótulo exibido → regras de realce. Linguagens sem regra ficam sem cor. */
const REALCE: Record<string, Linguagem> = {
  HTML: 'html',
  CSS: 'css',
  JS: 'js',
  JavaScript: 'js',
  TS: 'js',
  TypeScript: 'js',
  GLSL: 'js',
};

/**
 * Code Viewer — mostra o código com numeração de linhas e realce, e permite copiar.
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

  /** Trechos de cada linha (texto + classe de realce). */
  protected readonly linhas = computed<Trecho[][]>(() => {
    const lang = REALCE[this.linguagem()];
    const codigo = this.codigo().replace(/\n$/, '');
    return lang
      ? realcarLinhas(codigo, lang)
      : codigo.split('\n').map((t) => (t ? [{ c: null, t }] : []));
  });

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
