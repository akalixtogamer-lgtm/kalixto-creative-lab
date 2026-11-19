import {
  Component,
  ElementRef,
  OnDestroy,
  computed,
  effect,
  input,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { gsap } from 'gsap';
import { findLab } from '../../core/data/labs.data';
import { SVG_DEMOS } from '../../core/data/svg-demos.data';
import { LabDemo, ParamDef, Valor, Valores, valoresPadrao } from '../../core/models/demo.model';
import { LabLayout } from '../../shared/components/lab-layout/lab-layout';
import { ANIMACOES_SVG, FORMAS_MORPH } from './svg-animacoes';

/** Laboratório 04 — SVG Lab (traço, máscara, morph, filtros e motion path). */
@Component({
  selector: 'kx-svg-lab',
  imports: [LabLayout],
  templateUrl: './svg-lab.html',
  styleUrl: './svg-lab.css',
})
export class SvgLab implements OnDestroy {
  private readonly palco = viewChild<ElementRef<HTMLElement>>('palco');

  readonly demo = input<string>();

  protected readonly lab = findLab('svg')!;
  protected readonly demos = SVG_DEMOS;
  protected readonly circulo = FORMAS_MORPH['circulo'].d;

  protected readonly atual = computed<LabDemo>(
    () => SVG_DEMOS.find((d) => d.id === this.demo()) ?? SVG_DEMOS[0],
  );
  private readonly todosValores = signal<Record<string, Valores>>(
    Object.fromEntries(SVG_DEMOS.map((d) => [d.id, valoresPadrao(d)])),
  );
  protected readonly valores = computed(() => this.todosValores()[this.atual().id]);
  protected readonly codigo = computed(() => this.atual().codigo(this.valores()));

  private ctx?: gsap.Context;

  constructor() {
    // Trocar de demo desfaz a animação anterior
    effect(() => {
      this.atual();
      untracked(() => this.limpar());
    });
  }

  ngOnDestroy(): void {
    this.limpar();
  }

  alterar(param: ParamDef, v: Valor): void {
    const id = this.atual().id;
    this.todosValores.update((t) => ({ ...t, [id]: { ...t[id], [param.id]: v } }));
  }

  aplicar(valores: Valores): void {
    const id = this.atual().id;
    this.todosValores.update((t) => ({ ...t, [id]: valores }));
  }

  executar(): void {
    const palco = this.palco()?.nativeElement;
    if (!palco) return;
    this.limpar();
    const demo = this.atual();
    this.ctx = gsap.context(() => ANIMACOES_SVG[demo.id](palco, this.valores()), palco);
  }

  reiniciar(): void {
    const demo = this.atual();
    this.todosValores.update((t) => ({ ...t, [demo.id]: valoresPadrao(demo) }));
    this.limpar();
  }

  private limpar(): void {
    this.ctx?.revert();
    this.ctx = undefined;
  }
}
