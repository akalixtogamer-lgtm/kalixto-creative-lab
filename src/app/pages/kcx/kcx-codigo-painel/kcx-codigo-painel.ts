import { Component, computed, input, linkedSignal, output, signal } from '@angular/core';
import { KcxCodigo, KcxComponente } from '../../../kcx/kcx.types';
import { Valores, blocoRoot, lerBlocoRoot, resolverSaidas } from '../../../kcx/resolver';
import { criarPacote, serializar } from '../../../kcx/serializar';
import { svgEstatico } from '../../../kcx/exportar-kcx';
import { angularKcx } from '../../../kcx/angular';
import { CodeViewer } from '../../../shared/components/code-viewer/code-viewer';

type Aba = 'variaveis' | 'html' | 'css' | 'js' | 'svg' | 'ng-ts' | 'ng-css' | 'kcx';

/**
 * Código-fonte do componente, sempre sincronizado com as variáveis.
 * Modo avançado: edita o bloco :root (volta para as variáveis), o HTML,
 * o CSS e o JS (passam a rodar no preview).
 */
@Component({
  selector: 'kx-kcx-codigo-painel',
  imports: [CodeViewer],
  templateUrl: './kcx-codigo-painel.html',
  styleUrl: './kcx-codigo-painel.css',
})
export class KcxCodigoPainel {
  readonly comp = input.required<KcxComponente>();
  readonly valores = input.required<Valores>();
  readonly codigoEditado = input<KcxCodigo | null>(null);
  readonly aplicar = output<{ codigo: KcxCodigo | null; valores: Valores }>();

  protected readonly aba = signal<Aba>('variaveis');
  protected readonly avancado = linkedSignal(() => {
    this.comp();
    return false;
  });
  protected readonly status = signal<{ tipo: 'ok' | 'erro'; texto: string } | null>(null);

  protected readonly codigo = computed(() => this.codigoEditado() ?? this.comp().codigo);
  protected readonly root = computed(() =>
    blocoRoot(resolverSaidas(this.comp().variaveis, this.valores())),
  );
  protected readonly svg = computed(
    () => this.comp().codigo.svg ?? svgEstatico(this.comp(), this.valores()),
  );
  protected readonly angular = computed(() => angularKcx(this.comp(), this.valores()));
  protected readonly kcx = computed(() =>
    serializar(
      criarPacote([this.comp()], { valores: { [this.comp().id]: this.valores() }, modo: 'pacote' }),
    ),
  );

  protected readonly abas: { id: Aba; rotulo: string }[] = [
    { id: 'variaveis', rotulo: 'Variáveis (:root)' },
    { id: 'html', rotulo: 'HTML' },
    { id: 'css', rotulo: 'CSS' },
    { id: 'js', rotulo: 'JS' },
    { id: 'svg', rotulo: 'SVG' },
    { id: 'ng-ts', rotulo: 'Angular (TS)' },
    { id: 'ng-css', rotulo: 'Angular (CSS)' },
    { id: 'kcx', rotulo: 'KCX JSON' },
  ];

  protected texto(): string {
    switch (this.aba()) {
      case 'variaveis':
        return this.root();
      case 'html':
        return this.codigo().html;
      case 'css':
        return this.codigo().css;
      case 'js':
        return this.codigo().js;
      case 'svg':
        return this.svg();
      case 'ng-ts':
        return this.angular().ts;
      case 'ng-css':
        return this.angular().css;
      default:
        return this.kcx();
    }
  }

  protected linguagem(): string {
    const mapa: Record<Aba, string> = {
      variaveis: 'CSS',
      html: 'HTML',
      css: 'CSS',
      js: 'JS',
      svg: 'HTML',
      'ng-ts': 'TS',
      'ng-css': 'CSS',
      kcx: 'JSON',
    };
    return mapa[this.aba()];
  }

  /** Lê os quatro campos do modo avançado e sincroniza as três camadas. */
  protected aplicarEdicao(root: string, html: string, css: string, js: string): void {
    const r = lerBlocoRoot(root, this.comp().variaveis);
    if (r.erros.length) {
      this.status.set({ tipo: 'erro', texto: `Nada aplicado: ${r.erros.join(' ')}` });
      return;
    }
    const original = this.comp().codigo;
    const mudouCodigo = html !== original.html || css !== original.css || js !== original.js;
    const codigo = mudouCodigo ? { ...original, html, css, js } : null;
    this.aplicar.emit({ codigo, valores: r.valores });
    const n = Object.keys(r.valores).length;
    this.status.set({
      tipo: 'ok',
      texto:
        `Sincronizado: ${n} variável(is) lida(s) do :root${mudouCodigo ? ' e código novo no preview' : ''}.` +
        (r.ignoradas.length
          ? ` Estas não são editáveis pelo :root (fórmula, texto ou mapa — use os controles): ${r.ignoradas.join(', ')}.`
          : ''),
    });
  }

  protected restaurarCodigo(): void {
    this.aplicar.emit({ codigo: null, valores: {} });
    this.status.set({ tipo: 'ok', texto: 'Código original restaurado.' });
  }
}
