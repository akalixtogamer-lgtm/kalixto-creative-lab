import { Component, computed, input, output } from '@angular/core';
import {
  KcxGradiente,
  KcxSecao,
  KcxTransformacao2D,
  KcxValor,
  KcxVariavel,
} from '../../../kcx/kcx.types';
import { Valores } from '../../../kcx/resolver';
import { converter, lerCor, corHex } from '../../../kcx/unidades';

export interface MudancaVariavel {
  id: string;
  valor: KcxValor;
}

const SECOES: { id: KcxSecao; nome: string }[] = [
  { id: 'aparencia', nome: 'Aparência' },
  { id: 'animacao', nome: 'Animação' },
  { id: 'comportamento', nome: 'Comportamento' },
];

/**
 * Editor visual das variáveis KCX: um controle adequado a cada tipo
 * (cor, número, tempo, dimensão, boolean, texto, enum, gradiente, transformação).
 * Cada controle mostra QUAIS propriedades ele controla.
 */
@Component({
  selector: 'kx-kcx-controles',
  templateUrl: './kcx-controles.html',
  styleUrl: './kcx-controles.css',
})
export class KcxControles {
  readonly variaveis = input.required<KcxVariavel[]>();
  readonly valores = input.required<Valores>();
  /** Prefixo dos ids (evita repetição quando há várias camadas). */
  readonly prefixo = input('kcx');
  /** Variáveis que vêm de uma variável compartilhada (ficam travadas aqui). */
  readonly herdadas = input<Record<string, string>>({});
  readonly desabilitado = input(false);
  readonly mudou = output<MudancaVariavel>();

  protected readonly secoes = computed(() =>
    SECOES.map((s) => ({ ...s, vars: this.variaveis().filter((v) => v.secao === s.id) })).filter(
      (s) => s.vars.length,
    ),
  );

  protected id(v: KcxVariavel, sufixo = ''): string {
    return `${this.prefixo()}-${v.id}${sufixo}`;
  }

  protected valor(v: KcxVariavel): KcxValor {
    return this.valores()[v.id] ?? v.valor;
  }

  protected num(v: KcxVariavel): number {
    return Number(this.valor(v));
  }

  protected texto(v: KcxVariavel): string {
    return String(this.valor(v));
  }

  protected bool(v: KcxVariavel): boolean {
    return this.valor(v) === true;
  }

  protected grad(v: KcxVariavel): KcxGradiente {
    return this.valor(v) as KcxGradiente;
  }

  protected trans(v: KcxVariavel): KcxTransformacao2D {
    return this.valor(v) as KcxTransformacao2D;
  }

  /** #rrggbb para o <input type="color"> (que não aceita alpha). */
  protected hex6(c: string): string {
    try {
      return corHex({ ...lerCor(c), a: 1 });
    } catch {
      return '#000000';
    }
  }

  protected exibir(v: KcxVariavel): string {
    const n = this.num(v);
    if (v.unidade === 'ms' && n >= 1000) return `${n} ms (${converter(n, 'ms', 's')} s)`;
    return `${n}${v.unidade && v.unidade !== 'x' ? (v.unidade === '%' ? '%' : ' ' + v.unidade) : v.unidade === 'x' ? '×' : ''}`;
  }

  protected emitir(v: KcxVariavel, valor: KcxValor): void {
    this.mudou.emit({ id: v.id, valor });
  }

  protected emitirNumero(v: KcxVariavel, bruto: string): void {
    const n = Number(bruto);
    if (bruto.trim() === '' || !Number.isFinite(n)) return;
    this.emitir(v, n);
  }

  protected emitirCor(v: KcxVariavel, bruto: string): void {
    const t = bruto.trim();
    if (/^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(t)) this.emitir(v, t.toLowerCase());
  }

  protected mudarParada(v: KcxVariavel, i: number, campo: 'cor' | 'posicao', bruto: string): void {
    const g = structuredClone(this.grad(v));
    if (campo === 'cor') g.paradas[i].cor = bruto;
    else g.paradas[i].posicao = Math.min(1, Math.max(0, Number(bruto) / 100));
    this.emitir(v, g);
  }

  protected mudarAngulo(v: KcxVariavel, bruto: string): void {
    this.emitir(v, { ...structuredClone(this.grad(v)), angulo: Number(bruto) });
  }

  protected adicionarParada(v: KcxVariavel): void {
    const g = structuredClone(this.grad(v));
    if (g.paradas.length >= 6) return;
    const ultima = g.paradas[g.paradas.length - 1];
    g.paradas.push({ cor: ultima.cor, posicao: 1 });
    g.paradas.sort((a, b) => a.posicao - b.posicao);
    this.emitir(v, g);
  }

  protected removerParada(v: KcxVariavel, i: number): void {
    const g = structuredClone(this.grad(v));
    if (g.paradas.length <= 2) return;
    g.paradas.splice(i, 1);
    this.emitir(v, g);
  }

  protected mudarTrans(v: KcxVariavel, campo: keyof KcxTransformacao2D, bruto: string): void {
    const n = Number(bruto);
    if (!Number.isFinite(n)) return;
    this.emitir(v, { ...this.trans(v), [campo]: n });
  }

  protected fundoGrad(v: KcxVariavel): string {
    const paradas = [...this.grad(v).paradas].sort((a, b) => a.posicao - b.posicao);
    return `linear-gradient(90deg, ${paradas.map((p) => `${p.cor} ${p.posicao * 100}%`).join(', ')})`;
  }

  protected controla(v: KcxVariavel): string {
    return v.vinculos.map((l) => l.propriedade).join(' · ');
  }
}
