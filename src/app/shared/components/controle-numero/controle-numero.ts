import { Component, computed, input, output } from '@angular/core';

let seq = 0;

/**
 * Controle numérico no estilo dos painéis do Figma: rótulo, barra e campo com
 * o número (dá para arrastar a barra ou digitar). `escala` converte o valor
 * guardado para o que aparece (ex.: 0–1 aparece como 0–100).
 */
@Component({
  selector: 'kx-controle-numero',
  template: `
    <label class="cn__rotulo" [for]="idBarra">{{ rotulo() }}</label>
    @if (barra()) {
      <input
        class="cn__barra"
        type="range"
        [id]="idBarra"
        [min]="min()"
        [max]="max()"
        [step]="passo()"
        [value]="valor()"
        [style.--cn-p]="porcentagem()"
        [attr.aria-valuetext]="texto()"
        (input)="emitir(+$any($event.target).value)"
      />
    }
    <span class="cn__campo">
      <input
        type="number"
        inputmode="decimal"
        [attr.aria-label]="rotulo() + (unidade() ? ' (' + unidade() + ')' : '')"
        [min]="min() * escala()"
        [max]="max() * escala()"
        [step]="passo() * escala()"
        [value]="exibido()"
        (change)="digitar($any($event.target))"
      />
      @if (unidade()) {
        <small>{{ unidade() }}</small>
      }
    </span>
  `,
  styleUrl: './controle-numero.css',
  host: { '[class.cn--sem-barra]': '!barra()' },
})
export class ControleNumero {
  readonly rotulo = input.required<string>();
  readonly valor = input.required<number>();
  readonly min = input(0);
  readonly max = input(100);
  readonly passo = input(1);
  readonly escala = input(1);
  readonly unidade = input('');
  /** false = só o campo numérico (ex.: ângulo ao lado de um controle visual). */
  readonly barra = input(true);
  readonly mudou = output<number>();

  protected readonly idBarra = `kx-cn-${++seq}`;
  private readonly casas = computed(() => {
    const p = this.passo() * this.escala();
    return p >= 1 ? 0 : Math.min(3, String(p).split('.')[1]?.length ?? 0);
  });
  protected readonly exibido = computed(() =>
    Number((this.valor() * this.escala()).toFixed(this.casas())),
  );
  protected readonly texto = computed(() => `${this.exibido()}${this.unidade()}`);
  protected readonly porcentagem = computed(() => {
    const t = this.max() - this.min();
    return `${t ? ((this.valor() - this.min()) / t) * 100 : 0}%`;
  });

  protected emitir(v: number): void {
    if (Number.isFinite(v)) this.mudou.emit(v);
  }
  protected digitar(el: HTMLInputElement): void {
    const n = Number(el.value.replace(',', '.'));
    if (!Number.isFinite(n)) {
      el.value = String(this.exibido());
      return;
    }
    const v = Math.min(this.max(), Math.max(this.min(), n / this.escala()));
    el.value = String(Number((v * this.escala()).toFixed(this.casas())));
    this.mudou.emit(v);
  }
}
