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
import { gsap } from 'gsap';
import { findLab } from '../../core/data/labs.data';
import { BENTO_LAYOUTS, DIVISORES_SVG, UI_DEMOS } from '../../core/data/ui-demos.data';
import { LabDemo, ParamDef, Valor, Valores, valoresPadrao } from '../../core/models/demo.model';
import { LabLayout } from '../../shared/components/lab-layout/lab-layout';
import { CENAS_UI } from './ui-cenas';

/**
 * Laboratório 07 — Interface Lab.
 * Técnicas de composição de página trazidas das referências do Wallace.
 * Mesmo ciclo do Scroll Lab: a cena é remontada quando a demo ou um
 * controle muda; "Executar" toca a entrada/ação da demo.
 */
@Component({
  selector: 'kx-ui-lab',
  imports: [LabLayout],
  templateUrl: './ui-lab.html',
  styleUrl: './ui-lab.css',
})
export class UiLab implements OnDestroy {
  private readonly injector = inject(Injector);
  private readonly palco = viewChild<ElementRef<HTMLElement>>('palco');

  readonly demo = input<string>();

  protected readonly lab = findLab('ui')!;
  protected readonly demos = UI_DEMOS;
  protected readonly bentoAreas = BENTO_LAYOUTS;

  protected readonly atual = computed<LabDemo>(
    () => UI_DEMOS.find((d) => d.id === this.demo()) ?? UI_DEMOS[0],
  );
  private readonly todosValores = signal<Record<string, Valores>>(
    Object.fromEntries(UI_DEMOS.map((d) => [d.id, valoresPadrao(d)])),
  );
  protected readonly valores = computed(() => this.todosValores()[this.atual().id]);
  protected readonly codigo = computed(() => this.atual().codigo(this.valores()));

  /** Divisor SVG atual (desenhado direto no template). */
  protected readonly divisor = computed(() => {
    const v = this.valores();
    const d = DIVISORES_SVG[String(v['forma'])] ?? DIVISORES_SVG['ondas'];
    const t = [
      v['inverter'] === 'true' ? 'scaleY(-1)' : '',
      v['espelhar'] === 'true' ? 'scaleX(-1)' : '',
    ]
      .filter(Boolean)
      .join(' ');
    return { camadas: d.camadas, transformacao: t || null };
  });

  protected readonly cards = [
    { n: 1, titulo: 'Rota da Dança', local: 'Morro do Borel, RJ', img: 'por-do-sol' },
    { n: 2, titulo: 'Noite do Código', local: 'Zona Portuária, RJ', img: 'noite' },
    { n: 3, titulo: 'Aurora Criativa', local: 'Laboratório 07', img: 'aurora' },
    { n: 4, titulo: 'Maré de Ideias', local: 'Copacabana, RJ', img: 'oceano' },
    { n: 5, titulo: 'Ritmo & Pixel', local: 'Formiga, RJ', img: 'por-do-sol' },
  ];
  protected readonly numeros = [
    {
      final: 45,
      unidade: 'demos',
      rotulo: 'interativas no lab',
      d: 'M5,40 L30,32 L55,36 L80,20 L105,24 L130,10 L155,14',
    },
    {
      final: 20.5,
      unidade: 'km',
      rotulo: 'de trilha percorrida',
      d: 'M5,30 C25,10 40,45 60,25 S95,5 115,20 S145,35 155,12',
    },
    {
      final: 950,
      unidade: 'm',
      rotulo: 'de subida acumulada',
      d: 'M5,42 L35,36 L50,38 L75,24 L95,28 L120,12 L155,6',
    },
  ];
  protected readonly etapas = ['Ritmo', 'Repetição', 'Lógica', 'Criação'];
  protected readonly palavras = 'CSS · GSAP · SCROLL · SVG · THREE.JS · GLSL · ';

  private ctx?: gsap.Context;

  constructor() {
    effect(() => {
      this.atual();
      this.valores();
      untracked(() => afterNextRender(() => this.montar(), { injector: this.injector }));
    });
  }

  ngOnDestroy(): void {
    this.ctx?.revert();
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
    const cena = CENAS_UI[this.atual().id];
    if (!palco || !cena?.executar) return;
    this.ctx?.add(() => cena.executar!(palco, this.valores()));
  }

  reiniciar(): void {
    const demo = this.atual();
    this.todosValores.update((t) => ({ ...t, [demo.id]: valoresPadrao(demo) }));
  }

  private montar(): void {
    const palco = this.palco()?.nativeElement;
    if (!palco) return;
    this.ctx?.revert();
    const cena = CENAS_UI[this.atual().id];
    const v = this.valores();
    this.ctx = gsap.context(() => cena?.montar?.(palco, v) ?? undefined, palco);
  }
}
