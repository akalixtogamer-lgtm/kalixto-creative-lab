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
import { GSAP_DEMOS, easeDoDemo } from '../../core/data/gsap-demos.data';
import { findLab } from '../../core/data/labs.data';
import { LabDemo, ParamDef, Valor, Valores, valoresPadrao } from '../../core/models/demo.model';
import { Icon } from '../../shared/components/icon/icon';
import { LabLayout } from '../../shared/components/lab-layout/lab-layout';
import { ANIMACOES, GRAFICO, caminhoDaCurva, pontoDaCurva } from './gsap-animacoes';

/**
 * Laboratório 02 — GSAP Studio.
 * Mesmo fluxo do CSS Playground: escolher → ajustar → Executar → ler o código.
 * Toda animação roda dentro de um gsap.context(), desfeito ao reiniciar,
 * trocar de demo ou sair da página.
 */
@Component({
  selector: 'kx-gsap-studio',
  imports: [Icon, LabLayout],
  templateUrl: './gsap-studio.html',
  styleUrl: './gsap-studio.css',
})
export class GsapStudio implements OnDestroy {
  private readonly injector = inject(Injector);
  private readonly palco = viewChild<ElementRef<HTMLElement>>('palco');

  /** Query param ?demo= */
  readonly demo = input<string>();

  protected readonly lab = findLab('gsap')!;
  protected readonly demos = GSAP_DEMOS;
  protected readonly pontos = Array.from({ length: 15 }, (_, i) => i);
  protected readonly grafico = GRAFICO;

  protected readonly atual = computed<LabDemo>(
    () => GSAP_DEMOS.find((d) => d.id === this.demo()) ?? GSAP_DEMOS[0],
  );

  private readonly todosValores = signal<Record<string, Valores>>(
    Object.fromEntries(GSAP_DEMOS.map((d) => [d.id, valoresPadrao(d)])),
  );
  protected readonly valores = computed(() => this.todosValores()[this.atual().id]);
  protected readonly codigo = computed(() => this.atual().codigo(this.valores()));

  /** Demo de easing: curva desenhada a partir dos controles. */
  protected readonly ease = computed(() => easeDoDemo(this.valores()));
  protected readonly curva = computed(() =>
    this.atual().id === 'easing' ? caminhoDaCurva(this.ease()) : '',
  );
  protected readonly inicioCurva = pontoDaCurva(0, 0);
  protected readonly linhaZero = pontoDaCurva(0, 0).y;
  protected readonly linhaUm = pontoDaCurva(0, 1).y;

  /** Player da demo de reprodução. */
  protected readonly progresso = signal(0);
  protected readonly tocando = signal(false);

  private ctx?: gsap.Context;
  private animacao?: gsap.core.Animation;

  constructor() {
    // Ao trocar de demo: desfaz a animação anterior e prepara a nova
    effect(() => {
      const demo = this.atual();
      untracked(() => {
        this.limpar();
        if (demo.id === 'reproducao') {
          afterNextRender(() => this.criar(), { injector: this.injector });
        }
      });
    });
  }

  ngOnDestroy(): void {
    this.limpar();
  }

  alterar(param: ParamDef, v: Valor): void {
    const id = this.atual().id;
    this.todosValores.update((todos) => ({ ...todos, [id]: { ...todos[id], [param.id]: v } }));
    // A velocidade muda ao vivo, sem recriar a timeline
    if (id === 'reproducao' && param.id === 'vel') this.animacao?.timeScale(Number(v));
  }

  aplicar(valores: Valores): void {
    const id = this.atual().id;
    this.todosValores.update((todos) => ({ ...todos, [id]: valores }));
    if (id === 'reproducao') this.animacao?.timeScale(Number(valores['vel']));
  }

  executar(): void {
    if (this.atual().id === 'reproducao') {
      this.play();
      return;
    }
    this.criar();
  }

  reiniciar(): void {
    const demo = this.atual();
    this.todosValores.update((todos) => ({ ...todos, [demo.id]: valoresPadrao(demo) }));
    this.limpar();
    if (demo.id === 'reproducao') this.criar();
  }

  /* ---------- Player (demo de reprodução) ---------- */
  play(): void {
    if (this.animacao?.progress() === 1) this.animacao.restart();
    else this.animacao?.play();
  }
  pause(): void {
    this.animacao?.pause();
  }
  reverse(): void {
    this.animacao?.reverse();
  }
  restart(): void {
    this.animacao?.restart();
  }
  buscar(valor: string): void {
    this.animacao?.pause().progress(Number(valor));
  }

  /* ---------- Internos ---------- */

  /** Cria a animação da demo atual dentro de um contexto novo. */
  private criar(): void {
    const palco = this.palco()?.nativeElement;
    if (!palco) return;
    this.limpar();
    const demo = this.atual();
    this.ctx = gsap.context(() => {
      this.animacao = ANIMACOES[demo.id](palco, this.valores());
      this.animacao.eventCallback('onUpdate', () => {
        this.progresso.set(this.animacao?.progress() ?? 0);
        this.tocando.set(this.animacao?.isActive() ?? false);
      });
      this.animacao.eventCallback('onComplete', () => this.tocando.set(false));
      this.animacao.eventCallback('onReverseComplete', () => this.tocando.set(false));
    }, palco);
  }

  /** Desfaz tudo que o GSAP fez no palco (volta ao estado original). */
  private limpar(): void {
    this.ctx?.revert();
    this.ctx = undefined;
    // O ponto do gráfico de easing é movido à mão: volta ao início
    const ponto = this.palco()?.nativeElement.querySelector('.g-curva-ponto');
    ponto?.setAttribute('cx', String(this.inicioCurva.x));
    ponto?.setAttribute('cy', String(this.inicioCurva.y));
    this.animacao = undefined;
    this.progresso.set(0);
    this.tocando.set(false);
  }
}
