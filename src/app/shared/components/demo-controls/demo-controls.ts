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

  protected exibir(param: ParamDef): string {
    const v = this.valores()[param.id];
    if (param.tipo === 'select') {
      return param.opcoes.find((o) => o.valor === v)?.rotulo ?? String(v);
    }
    return `${v}${param.unidade}`;
  }
}
