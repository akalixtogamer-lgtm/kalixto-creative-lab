import { Component, input, output } from '@angular/core';
import { ParamDef, Valor, Valores } from '../../../core/models/demo.model';

/**
 * Controles de uma demo (sliders e seletores), gerados a partir dos params.
 * Uso: <kx-demo-controls [params]="demo.params" [valores]="valores()" (mudou)="alterar($event)" />
 */
@Component({
  selector: 'kx-demo-controls',
  templateUrl: './demo-controls.html',
  styleUrl: './demo-controls.css',
  host: { style: 'display: contents' },
})
export class DemoControls {
  readonly params = input.required<ParamDef[]>();
  readonly valores = input.required<Valores>();
  /** Prefixo dos ids dos campos (evita ids repetidos). */
  readonly prefixo = input('p');
  readonly mudou = output<{ param: ParamDef; valor: Valor }>();

  protected emitir(param: ParamDef, bruto: string): void {
    this.mudou.emit({ param, valor: param.tipo === 'range' ? Number(bruto) : bruto });
  }

  /** Número digitado no campo: limitado ao intervalo e ao passo do controle. */
  protected digitar(param: ParamDef, el: HTMLInputElement): void {
    if (param.tipo !== 'range') return;
    const n = Number(el.value.replace(',', '.'));
    if (!Number.isFinite(n)) {
      el.value = String(this.valores()[param.id]);
      return;
    }
    const passos = Math.round(
      (Math.min(param.max, Math.max(param.min, n)) - param.min) / param.passo,
    );
    const v = Number((param.min + passos * param.passo).toFixed(6));
    el.value = String(v);
    this.mudou.emit({ param, valor: v });
  }

  protected porcentagem(param: ParamDef): string {
    if (param.tipo !== 'range') return '0%';
    const t = param.max - param.min;
    return `${t ? ((Number(this.valores()[param.id]) - param.min) / t) * 100 : 0}%`;
  }

  protected exibir(param: ParamDef): string {
    const v = this.valores()[param.id];
    if (param.tipo === 'select') {
      return param.opcoes.find((o) => o.valor === v)?.rotulo ?? String(v);
    }
    return `${v}${param.unidade}`;
  }
}
