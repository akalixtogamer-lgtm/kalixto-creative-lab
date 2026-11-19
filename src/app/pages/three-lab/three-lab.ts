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
import { findLab } from '../../core/data/labs.data';
import { THREE_DEMOS } from '../../core/data/three-demos.data';
import { LabDemo, ParamDef, Valor, Valores, valoresPadrao } from '../../core/models/demo.model';
import { LabLayout } from '../../shared/components/lab-layout/lab-layout';
import { CENAS_3D, Cena3D } from './cenas-3d';
import { Palco3D, criarPalco3D, temWebGL } from './palco-3d';

/**
 * Laboratório 05 — Three.js Lab.
 * Um único palco 3D é criado ao abrir a página e reaproveitado por todas
 * as demos: trocar de demo só limpa a cena e monta a próxima.
 */
@Component({
  selector: 'kx-three-lab',
  imports: [LabLayout],
  templateUrl: './three-lab.html',
  styleUrl: './three-lab.css',
})
export class ThreeLab implements OnDestroy {
  private readonly injector = inject(Injector);
  private readonly container = viewChild<ElementRef<HTMLElement>>('container');

  readonly demo = input<string>();

  protected readonly lab = findLab('three')!;
  protected readonly demos = THREE_DEMOS;
  protected readonly suportado = temWebGL();

  protected readonly atual = computed<LabDemo>(
    () => THREE_DEMOS.find((d) => d.id === this.demo()) ?? THREE_DEMOS[0],
  );
  private readonly todosValores = signal<Record<string, Valores>>(
    Object.fromEntries(THREE_DEMOS.map((d) => [d.id, valoresPadrao(d)])),
  );
  protected readonly valores = computed(() => this.todosValores()[this.atual().id]);
  protected readonly codigo = computed(() => this.atual().codigo(this.valores()));
  protected readonly nomeArquivo = signal('');

  private palco?: Palco3D;
  private cena?: Cena3D;

  constructor() {
    // Monta a cena da demo atual (depois que o container existir)
    effect(() => {
      const demo = this.atual();
      untracked(() => afterNextRender(() => this.montar(demo), { injector: this.injector }));
    });
    // Controles mudaram → atualiza a cena ao vivo
    effect(() => {
      const v = this.valores();
      untracked(() => this.cena?.atualizar(v));
    });
  }

  ngOnDestroy(): void {
    this.cena?.destruir?.();
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
    this.cena?.executar?.(this.valores());
  }

  reiniciar(): void {
    const demo = this.atual();
    this.todosValores.update((t) => ({ ...t, [demo.id]: valoresPadrao(demo) }));
    this.nomeArquivo.set('');
    this.montar(demo);
  }

  /** Demo GLTF: o arquivo é lido localmente, nada é enviado para a internet. */
  carregarArquivo(evento: Event): void {
    const arquivo = (evento.target as HTMLInputElement).files?.[0];
    if (!arquivo) return;
    this.nomeArquivo.set(arquivo.name);
    this.cena?.carregarArquivo?.(URL.createObjectURL(arquivo));
  }

  private montar(demo: LabDemo): void {
    if (!this.suportado) return;
    const el = this.container()?.nativeElement;
    if (!el) return;
    this.palco ??= criarPalco3D(el);
    this.cena?.destruir?.();
    this.palco.aCadaQuadro(null);
    this.palco.limparCena();
    this.palco.resetarCamera();
    this.cena = CENAS_3D[demo.id](this.palco);
    this.cena.atualizar(this.valores());
  }
}
