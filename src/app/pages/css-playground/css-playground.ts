import { Component, computed, input, linkedSignal, signal } from '@angular/core';
import {
  CLIP_FORMAS,
  CSS_DEMOS,
  estiloDivisor,
  CssDemo,
  ParamDef,
  Valor,
  Valores,
  valoresPadrao,
} from '../../core/data/css-demos.data';
import { findLab } from '../../core/data/labs.data';
import { LabLayout } from '../../shared/components/lab-layout/lab-layout';

/**
 * Laboratório 01 — CSS Playground.
 *
 * Fluxo de uso: escolher uma demo → ajustar os controles → Executar →
 * ler o código gerado no Code Viewer → ler a explicação.
 * A demo escolhida fica na URL (?demo=hover), então dá para compartilhar.
 */
@Component({
  selector: 'kx-css-playground',
  imports: [LabLayout],
  templateUrl: './css-playground.html',
  styleUrl: './css-playground.css',
})
export class CssPlayground {

  /** Query param ?demo= (withComponentInputBinding). */
  readonly demo = input<string>();

  protected readonly lab = findLab('css')!;
  protected readonly demos = CSS_DEMOS;
  protected readonly clipFormas = CLIP_FORMAS;

  protected readonly atual = computed<CssDemo>(
    () => CSS_DEMOS.find((d) => d.id === this.demo()) ?? CSS_DEMOS[0],
  );

  /** Valores dos controles de todas as demos (cada uma guarda os seus). */
  private readonly todosValores = signal<Record<string, Valores>>(
    Object.fromEntries(CSS_DEMOS.map((d) => [d.id, valoresPadrao(d)])),
  );
  protected readonly valores = computed(() => this.todosValores()[this.atual().id]);

  /** Estado ligado/desligado do palco; volta a false ao trocar de demo. */
  protected readonly ativo = linkedSignal({ source: this.atual, computation: () => false });
  /** Interruptor da demo de microinterações. */
  protected readonly ligado = linkedSignal({ source: this.atual, computation: () => false });
  /** Muda a cada "Executar" para recriar o elemento e reiniciar animações. */
  protected readonly rodada = signal(0);

  protected readonly codigo = computed(() => this.atual().codigo(this.valores()));
  /** Estilo da seção de baixo na demo de divisores (mesmo CSS do Code Viewer). */
  protected readonly divisor = computed(() =>
    this.atual().id === 'divisores' ? estiloDivisor(this.valores()) : {},
  );

  /** Valores dos controles como variáveis CSS aplicadas no palco. */
  protected readonly vars = computed(() => {
    const estilo: Record<string, string> = {};
    for (const p of this.atual().params) {
      const v = this.valores()[p.id];
      estilo[`--${p.id}`] = p.tipo === 'range' ? `${v}${p.unidade}` : String(v);
    }
    return estilo;
  });

  alterar(param: ParamDef, v: Valor): void {
    const id = this.atual().id;
    this.todosValores.update((todos) => ({ ...todos, [id]: { ...todos[id], [param.id]: v } }));
  }

  /** Preset escolhido: troca todos os valores da demo de uma vez. */
  aplicar(valores: Valores): void {
    const id = this.atual().id;
    this.todosValores.update((todos) => ({ ...todos, [id]: valores }));
  }

  /** Botão principal: cada demo interpreta "Executar" do seu jeito. */
  executar(): void {
    const demo = this.atual();
    if (demo.id === 'transform') {
      this.aleatorio(demo);
      return;
    }
    if (demo.id === 'keyframes' || demo.id === 'microinteracoes') {
      this.ativo.set(demo.id === 'keyframes' ? true : !this.ativo());
      this.rodada.update((r) => r + 1);
      return;
    }
    this.ativo.update((a) => !a);
  }

  reiniciar(): void {
    const demo = this.atual();
    this.todosValores.update((todos) => ({ ...todos, [demo.id]: valoresPadrao(demo) }));
    this.ativo.set(false);
    this.ligado.set(false);
    this.rodada.update((r) => r + 1);
  }

  curtir(): void {
    this.ativo.update((a) => !a);
    this.rodada.update((r) => r + 1);
  }

  private aleatorio(demo: CssDemo): void {
    const novos: Valores = {};
    for (const p of demo.params) {
      if (p.tipo !== 'range') continue;
      const passos = Math.round((p.max - p.min) / p.passo);
      const v = p.min + Math.round(Math.random() * passos) * p.passo;
      novos[p.id] = Number(v.toFixed(2));
    }
    this.todosValores.update((todos) => ({ ...todos, [demo.id]: novos }));
  }
}
