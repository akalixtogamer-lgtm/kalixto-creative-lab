import {
  Component,
  ElementRef,
  Injector,
  OnDestroy,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { GLSL_DEMOS, SHADERS } from '../../core/data/glsl-demos.data';
import { findLab } from '../../core/data/labs.data';
import { LabDemo, ParamDef, Valor, Valores, valoresPadrao } from '../../core/models/demo.model';
import { LabLayout } from '../../shared/components/lab-layout/lab-layout';
import { Palco3D, criarPalco3D, temWebGL } from '../three-lab/palco-3d';
import { CenaShader, montarShader } from './cena-shader';

/**
 * Laboratório 06 — WebGL & GLSL.
 * Reaproveita o palco 3D do Three.js Lab; cada demo é um ShaderMaterial.
 */
@Component({
  selector: 'kx-glsl-lab',
  imports: [LabLayout],
  templateUrl: './glsl-lab.html',
  styleUrl: '../three-lab/three-lab.css',
})
export class GlslLab implements OnDestroy {
  private readonly injector = inject(Injector);
  private readonly container = viewChild<ElementRef<HTMLElement>>('container');

  readonly demo = input<string>();

  protected readonly lab = findLab('webgl')!;
  protected readonly demos = GLSL_DEMOS;
  protected readonly suportado = temWebGL();

  protected readonly atual = computed<LabDemo>(() => GLSL_DEMOS.find((d) => d.id === this.demo()) ?? GLSL_DEMOS[0]);
  private readonly todosValores = signal<Record<string, Valores>>(
    Object.fromEntries(GLSL_DEMOS.map((d) => [d.id, valoresPadrao(d)])),
  );
  protected readonly valores = computed(() => this.todosValores()[this.atual().id]);
  protected readonly codigo = computed(() => this.atual().codigo(this.valores()));

  private palco?: Palco3D;
  private cena?: CenaShader;

  constructor() {
    effect(() => {
      const demo = this.atual();
      untracked(() => afterNextRender(() => this.montar(demo), { injector: this.injector }));
    });
    effect(() => {
      const v = this.valores();
      untracked(() => this.cena?.atualizar(v));
    });
  }

  ngOnDestroy(): void {
    this.cena?.destruir();
    this.palco?.destruir();
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
    this.cena?.alternar(Number(this.valores()['dur'] ?? 1.5));
  }

  reiniciar(): void {
    const demo = this.atual();
    this.todosValores.update((t) => ({ ...t, [demo.id]: valoresPadrao(demo) }));
    this.montar(demo);
  }

  private montar(demo: LabDemo): void {
    if (!this.suportado) return;
    const el = this.container()?.nativeElement;
    if (!el) return;
    this.palco ??= criarPalco3D(el);
    this.cena?.destruir();
    this.palco.aCadaQuadro(null);
    this.palco.limparCena();
    this.palco.resetarCamera();
    this.cena = montarShader(this.palco, SHADERS[demo.id], this.valores());
  }
}
