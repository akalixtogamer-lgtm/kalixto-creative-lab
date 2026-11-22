import {
  Component,
  ElementRef,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Caixa, ElementoPar, FrameReferencia } from '../../../kcx/comparar';
import { corNoPonto } from './captura';

export type VistaReferencia = 'site' | 'video' | 'frame';
export type Ferramenta = 'nenhuma' | 'caixa' | 'conta-gotas';

/**
 * Painel A — Original reference. Mostra o site, o vídeo ou um frame no mesmo
 * tamanho do palco da reconstrução (largura do viewport × zoom). No frame dá
 * para desenhar a caixa de um elemento e tirar cores com o conta-gotas.
 * O original nunca é modificado.
 */
@Component({
  selector: 'kx-cmp-referencia',
  templateUrl: './cmp-referencia.html',
  styleUrl: './cmp-referencia.css',
  host: {
    '[style.width.px]': 'largura() * zoom()',
    '[style.height.px]': 'altura() * zoom()',
  },
})
export class CmpReferencia {
  private readonly sanitizer = inject(DomSanitizer);

  readonly vista = input.required<VistaReferencia>();
  readonly url = input<string | undefined>();
  readonly videoUrl = input<string>('');
  readonly frame = input<FrameReferencia | null>(null);
  /** Tamanho do palco (px do viewport) e zoom. */
  readonly largura = input.required<number>();
  readonly altura = input.required<number>();
  readonly zoom = input(1);
  readonly elementos = input<ElementoPar[]>([]);
  readonly elementoAtivo = input<string>('');
  readonly ferramenta = input<Ferramenta>('nenhuma');
  /** No overlay, o painel A não recebe cliques (quem recebe é a reconstrução). */
  readonly inerte = input(false);

  readonly tempo = output<number>();
  readonly carregouVideo = output<{ duracao: number; largura: number; altura: number }>();
  readonly erroVideo = output<string>();
  readonly caixa = output<Caixa>();
  readonly cor = output<string>();
  readonly tocandoMudou = output<boolean>();

  private readonly video = viewChild<ElementRef<HTMLVideoElement>>('video');
  private readonly imagem = viewChild<ElementRef<HTMLImageElement>>('imagem');

  protected readonly siteSeguro = computed<SafeResourceUrl | null>(() => {
    const u = this.url();
    // A URL já foi conferida (só http/https de fora do app) antes de chegar aqui.
    return u ? this.sanitizer.bypassSecurityTrustResourceUrl(u) : null;
  });

  /** px na tela por px do frame. */
  protected readonly k = computed(() => {
    const f = this.frame();
    return f ? (this.largura() * this.zoom()) / f.largura : 1;
  });

  protected readonly caixasDoFrame = computed(() => {
    const f = this.frame();
    return this.elementos().filter((e) => e.caixaRef && (!e.frameId || e.frameId === f?.id));
  });

  /** Retângulo sendo desenhado (px da tela). */
  protected readonly desenho = signal<Caixa | null>(null);
  private inicio: { x: number; y: number } | null = null;

  /* ---------- vídeo ---------- */

  get elementoVideo(): HTMLVideoElement | null {
    return this.video()?.nativeElement ?? null;
  }

  tocar(): void {
    void this.elementoVideo?.play().catch(() => undefined);
  }
  pausar(): void {
    this.elementoVideo?.pause();
  }
  irPara(seg: number): void {
    const v = this.elementoVideo;
    if (v && Number.isFinite(seg)) v.currentTime = Math.max(0, Math.min(v.duration || seg, seg));
  }
  velocidade(x: number): void {
    const v = this.elementoVideo;
    if (v) v.playbackRate = x;
  }
  get tempoAtual(): number {
    return this.elementoVideo?.currentTime ?? 0;
  }
  get tocando(): boolean {
    const v = this.elementoVideo;
    return !!v && !v.paused && !v.ended;
  }

  protected aoCarregar(v: HTMLVideoElement): void {
    this.carregouVideo.emit({ duracao: v.duration, largura: v.videoWidth, altura: v.videoHeight });
  }

  protected aoErro(v: HTMLVideoElement): void {
    const codigo = v.error?.code;
    this.erroVideo.emit(
      codigo === 4
        ? 'Este navegador não toca este formato de vídeo. Gravações de iPhone costumam vir em HEVC: exporte em MP4 (H.264) — no próprio iPhone, em Ajustes › Câmera › Formatos › "Mais compatível", ou num editor como CapCut — e envie de novo.'
        : 'Não foi possível abrir o vídeo.',
    );
  }

  /* ---------- caixa e conta-gotas ---------- */

  private ponto(e: PointerEvent): { x: number; y: number } {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  protected apertar(e: PointerEvent): void {
    if (this.ferramenta() === 'nenhuma') return;
    e.preventDefault();
    const p = this.ponto(e);
    if (this.ferramenta() === 'conta-gotas') {
      this.colher(p);
      return;
    }
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    this.inicio = p;
    this.desenho.set({ x: p.x, y: p.y, largura: 0, altura: 0 });
  }

  protected mover(e: PointerEvent): void {
    if (!this.inicio) return;
    const p = this.ponto(e);
    this.desenho.set({
      x: Math.min(p.x, this.inicio.x),
      y: Math.min(p.y, this.inicio.y),
      largura: Math.abs(p.x - this.inicio.x),
      altura: Math.abs(p.y - this.inicio.y),
    });
  }

  protected soltar(): void {
    const d = this.desenho();
    this.inicio = null;
    this.desenho.set(null);
    if (!d || d.largura < 4 || d.altura < 4) return;
    const k = this.escalaFonte();
    this.caixa.emit({
      x: Math.round(d.x / k),
      y: Math.round(d.y / k),
      largura: Math.round(d.largura / k),
      altura: Math.round(d.altura / k),
    });
  }

  /** px na tela por px da fonte (frame, ou o vídeo no tamanho natural). */
  private escalaFonte(): number {
    if (this.vista() === 'frame') return this.k();
    const v = this.elementoVideo;
    return v?.videoWidth ? (this.largura() * this.zoom()) / v.videoWidth : 1;
  }

  private colher(p: { x: number; y: number }): void {
    const k = this.escalaFonte();
    const fonte = this.vista() === 'frame' ? this.imagem()?.nativeElement : this.elementoVideo;
    if (!fonte) return;
    const c = corNoPonto(fonte, Math.round(p.x / k), Math.round(p.y / k));
    if (c) this.cor.emit(c);
  }
}
