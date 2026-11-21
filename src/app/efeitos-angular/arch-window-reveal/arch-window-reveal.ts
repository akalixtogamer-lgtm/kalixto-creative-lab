import {
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';

@Component({
  selector: 'app-arch-window-reveal',
  templateUrl: './arch-window-reveal.html',
  styleUrl: './arch-window-reveal.css',
})
export class ArchWindowReveal {
  private readonly corte = 0.6;
  private readonly secao = viewChild.required<ElementRef<HTMLElement>>('secao');
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  protected readonly legendas = [
    'Casas com história',
    'Mesa para doze',
    'Pé-direito de 7 metros',
    'Volta para o poente',
  ];
  /** Fase 2 (0 → 1): a cena encolhe até a janela. */
  protected readonly q = signal(0);
  /** Legenda acesa (-1 = nenhuma). */
  protected readonly atual = signal(0);

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const canvas = this.canvas().nativeElement;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const medir = () => {
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        canvas.width = Math.round(canvas.clientWidth * dpr);
        canvas.height = Math.round(canvas.clientHeight * dpr);
      };
      let quadro = 0;
      const atualizar = () => {
        quadro = 0;
        const el = this.secao().nativeElement;
        const r = el.getBoundingClientRect();
        const p = reduzir
          ? 1
          : Math.min(1, Math.max(0, -r.top / (el.offsetHeight - window.innerHeight)));
        const voo = Math.min(1, p / this.corte);
        const q = Math.max(0, (p - this.corte) / (1 - this.corte));
        this.q.set(q);
        desenharVoo(ctx, canvas.width, canvas.height, voo);
        const n = this.legendas.length;
        this.atual.set(q === 0 && n ? Math.min(n - 1, Math.floor(voo * n)) : -1);
      };
      const pedir = () => {
        if (!quadro) quadro = requestAnimationFrame(atualizar);
      };
      const aoMudarTamanho = () => {
        medir();
        pedir();
      };
      window.addEventListener('scroll', pedir, { passive: true });
      window.addEventListener('resize', aoMudarTamanho);
      medir();
      atualizar();
      destroyRef.onDestroy(() => {
        window.removeEventListener('scroll', pedir);
        window.removeEventListener('resize', aoMudarTamanho);
        cancelAnimationFrame(quadro);
      });
    });
  }
}

function desenharVoo(ctx: CanvasRenderingContext2D, w: number, h: number, t: number): void {
  const SALAS = 5;
  const foco = Math.max(w, h * 1.6) * 0.5;
  const camera = t * SALAS;
  // Lá fora: céu de entardecer e gramado (o fim do voo)
  const ceu = ctx.createLinearGradient(0, 0, 0, h);
  ceu.addColorStop(0, '#2a2350');
  ceu.addColorStop(0.45, '#e9896a');
  ceu.addColorStop(0.62, '#ffd59a');
  ceu.addColorStop(0.63, '#5d7a3e');
  ceu.addColorStop(1, '#2f4a22');
  ctx.fillStyle = ceu;
  ctx.fillRect(0, 0, w, h);
  // Paredes da mais longe para a mais perto (pintor)
  for (let i = SALAS; i >= 1; i--) {
    const z = i - camera;
    if (z < 0.06) continue;
    const s = foco / z;
    const X = (x: number) => w / 2 + x * s;
    const Y = (y: number) => h * 0.5 - y * s;
    // chão da sala atrás desta parede (madeira, mais clara ao longe)
    const z2 = z + 1;
    const s2 = foco / z2;
    const luz = Math.max(0.35, 1 - z * 0.14);
    ctx.fillStyle =
      'rgb(' +
      Math.round(150 * luz) +
      ' ' +
      Math.round(104 * luz) +
      ' ' +
      Math.round(70 * luz) +
      ')';
    ctx.beginPath();
    ctx.moveTo(w / 2 - 1.4 * s, h * 0.5 + 0.6 * s);
    ctx.lineTo(w / 2 + 1.4 * s, h * 0.5 + 0.6 * s);
    ctx.lineTo(w / 2 + 1.4 * s2, h * 0.5 + 0.6 * s2);
    ctx.lineTo(w / 2 - 1.4 * s2, h * 0.5 + 0.6 * s2);
    ctx.fill();
    // a parede com a porta em arco recortada (evenodd = furo)
    const r = 0.36;
    ctx.beginPath();
    ctx.rect(0, 0, w, h);
    ctx.moveTo(X(-r), Y(-0.6));
    ctx.lineTo(X(-r), Y(0.35));
    ctx.arc(X(0), Y(0.35), r * s, Math.PI, 0);
    ctx.lineTo(X(r), Y(-0.6));
    ctx.closePath();
    const parede = ctx.createLinearGradient(0, 0, w, 0);
    parede.addColorStop(
      0,
      'rgb(' +
        Math.round(200 * luz) +
        ' ' +
        Math.round(186 * luz) +
        ' ' +
        Math.round(168 * luz) +
        ')',
    );
    parede.addColorStop(
      0.5,
      'rgb(' +
        Math.round(238 * luz) +
        ' ' +
        Math.round(226 * luz) +
        ' ' +
        Math.round(208 * luz) +
        ')',
    );
    parede.addColorStop(
      1,
      'rgb(' +
        Math.round(196 * luz) +
        ' ' +
        Math.round(180 * luz) +
        ' ' +
        Math.round(160 * luz) +
        ')',
    );
    ctx.fillStyle = parede;
    ctx.fill('evenodd');
    // moldura da porta
    ctx.strokeStyle = 'rgb(255 244 224 / ' + (0.5 * luz).toFixed(2) + ')';
    ctx.lineWidth = Math.max(1, 0.025 * s);
    ctx.beginPath();
    ctx.moveTo(X(-r), Y(-0.6));
    ctx.lineTo(X(-r), Y(0.35));
    ctx.arc(X(0), Y(0.35), r * s, Math.PI, 0);
    ctx.lineTo(X(r), Y(-0.6));
    ctx.stroke();
  }
}
