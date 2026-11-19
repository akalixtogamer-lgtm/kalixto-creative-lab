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
import { SCROLL_DEMOS } from '../../core/data/scroll-demos.data';
import { LabDemo, ParamDef, Valor, Valores, valoresPadrao } from '../../core/models/demo.model';
import { LabLayout } from '../../shared/components/lab-layout/lab-layout';
import { CENAS, ScrollTrigger, rolarAteOFim } from './scroll-cenas';

/**
 * Laboratório 03 — Scroll Lab.
 * As cenas são recriadas sempre que a demo ou um controle muda
 * (o resultado é ao vivo); "Executar" rola a janela sozinho.
 */
@Component({
  selector: 'kx-scroll-lab',
  imports: [LabLayout],
  templateUrl: './scroll-lab.html',
  styleUrl: './scroll-lab.css',
})
export class ScrollLab implements OnDestroy {
  private readonly injector = inject(Injector);
  private readonly palco = viewChild<ElementRef<HTMLElement>>('palco');
  private readonly scroller = viewChild<ElementRef<HTMLElement>>('scroller');

  readonly demo = input<string>();

  protected readonly lab = findLab('scroll')!;
  protected readonly demos = SCROLL_DEMOS;
  protected readonly paragrafos = Array.from({ length: 7 }, (_, i) => i);
  protected readonly capitulos = [
    { titulo: 'O começo', texto: 'Todo movimento começa com um passo.', img: 'por-do-sol' },
    { titulo: 'A jornada', texto: 'Ensaios, erros e repetição.', img: 'oceano' },
    { titulo: 'Conexão', texto: 'Gente, ritmo e comunidade.', img: 'aurora' },
    { titulo: 'O desafio', texto: 'Aprender algo novo do zero.', img: 'noite' },
    { titulo: 'A criação', texto: 'Movimento e código juntos.', img: 'por-do-sol' },
  ];

  protected readonly atual = computed<LabDemo>(
    () => SCROLL_DEMOS.find((d) => d.id === this.demo()) ?? SCROLL_DEMOS[0],
  );
  private readonly todosValores = signal<Record<string, Valores>>(
    Object.fromEntries(SCROLL_DEMOS.map((d) => [d.id, valoresPadrao(d)])),
  );
  protected readonly valores = computed(() => this.todosValores()[this.atual().id]);
  protected readonly codigo = computed(() => this.atual().codigo(this.valores()));
  protected readonly paineis = computed(() =>
    Array.from({ length: Number(this.valores()['paineis'] ?? 4) }, (_, i) => i + 1),
  );

  private ctx?: gsap.Context;
  private rolagem?: gsap.core.Tween;
  private ultimaDemo?: string;

  constructor() {
    // Demo ou valores mudaram → recria a cena depois que o HTML atualizar
    effect(() => {
      this.atual();
      this.valores();
      untracked(() => afterNextRender(() => this.montar(), { injector: this.injector }));
    });
  }

  ngOnDestroy(): void {
    this.desmontar();
  }

  alterar(param: ParamDef, v: Valor): void {
    const id = this.atual().id;
    this.todosValores.update((todos) => ({ ...todos, [id]: { ...todos[id], [param.id]: v } }));
  }

  aplicar(valores: Valores): void {
    const id = this.atual().id;
    this.todosValores.update((todos) => ({ ...todos, [id]: valores }));
  }

  executar(): void {
    const s = this.scroller()?.nativeElement;
    if (!s) return;
    this.rolagem?.kill();
    this.rolagem = rolarAteOFim(s);
  }

  reiniciar(): void {
    const demo = this.atual();
    this.rolagem?.kill();
    this.todosValores.update((todos) => ({ ...todos, [demo.id]: valoresPadrao(demo) }));
    const s = this.scroller()?.nativeElement;
    if (s) s.scrollTop = 0;
  }

  private montar(): void {
    const palco = this.palco()?.nativeElement;
    const scroller = this.scroller()?.nativeElement;
    if (!palco || !scroller) return;
    const demo = this.atual();
    // Ao mexer num controle, mantém a posição; ao trocar de demo, volta ao topo
    const topo = demo.id === this.ultimaDemo ? scroller.scrollTop : 0;
    this.ultimaDemo = demo.id;
    this.desmontar();
    scroller.scrollTop = 0;
    this.ctx = gsap.context(
      () => CENAS[demo.id](palco, scroller, this.valores()) ?? undefined,
      palco,
    );
    ScrollTrigger.refresh();
    scroller.scrollTop = topo;
  }

  private desmontar(): void {
    this.rolagem?.kill();
    this.ctx?.revert();
    this.ctx = undefined;
  }
}
