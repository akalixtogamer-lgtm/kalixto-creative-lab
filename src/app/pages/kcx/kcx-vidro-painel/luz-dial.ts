import { Component, computed, input, output } from '@angular/core';

/**
 * Controle de luz do vidro (como o do painel Glass do Figma): o ponto na borda
 * do quadrado diz de onde vem a luz. Arraste, clique ou use as setas.
 */
@Component({
  selector: 'kx-luz-dial',
  template: `
    <div
      class="ld"
      role="slider"
      tabindex="0"
      aria-label="Ângulo da luz"
      aria-valuemin="-180"
      aria-valuemax="180"
      [attr.aria-valuenow]="angulo()"
      [attr.aria-valuetext]="angulo() + ' graus'"
      [style.--ld-x]="ponto().x + '%'"
      [style.--ld-y]="ponto().y + '%'"
      [style.--ld-i]="intensidade()"
      (pointerdown)="comecar($event)"
      (pointermove)="mover($event)"
      (pointerup)="soltar($event)"
      (pointercancel)="soltar($event)"
      (keydown)="tecla($event)"
    >
      <span class="ld__brilho"></span>
      <span class="ld__ponto"></span>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .ld {
      position: relative;
      width: 84px;
      aspect-ratio: 1;
      border-radius: 12px;
      background: linear-gradient(135deg, #3a3a46, #1c1c22);
      overflow: hidden;
      touch-action: none;
      cursor: crosshair;
    }
    .ld:focus-visible {
      outline: 2px solid var(--kx-acento, #22e3ff);
      outline-offset: 2px;
    }
    .ld__brilho {
      position: absolute;
      inset: 0;
      background: radial-gradient(
        circle at var(--ld-x) var(--ld-y),
        rgb(255 255 255 / calc(var(--ld-i) * 0.85)),
        transparent 70%
      );
    }
    .ld__ponto {
      position: absolute;
      left: var(--ld-x);
      top: var(--ld-y);
      width: 14px;
      height: 14px;
      translate: -50% -50%;
      border-radius: 50%;
      background: #fff;
      box-shadow:
        0 0 0 2px var(--kx-acento, #22e3ff),
        0 1px 4px rgb(0 0 0 / 40%);
    }
  `,
})
export class LuzDial {
  readonly angulo = input.required<number>();
  readonly intensidade = input(0.8);
  readonly mudou = output<number>();
  private arrastando = false;

  /**
   * Posição do ponto na borda de um círculo dentro do quadrado, na convenção do
   * Figma: −45° = luz vindo de cima, à esquerda; 0° = da esquerda.
   */
  protected readonly ponto = computed(() => {
    const a = (this.angulo() * Math.PI) / 180;
    return { x: 50 - Math.cos(a) * 36, y: 50 + Math.sin(a) * 36 };
  });

  private daPosicao(e: PointerEvent): void {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const dx = r.left + r.width / 2 - e.clientX;
    const dy = e.clientY - (r.top + r.height / 2);
    if (Math.hypot(dx, dy) < 2) return;
    this.mudou.emit(Math.round((Math.atan2(dy, dx) * 180) / Math.PI));
  }
  protected comecar(e: PointerEvent): void {
    this.arrastando = true;
    try {
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    } catch {
      /* ponteiro já solto */
    }
    this.daPosicao(e);
  }
  protected mover(e: PointerEvent): void {
    if (this.arrastando) this.daPosicao(e);
  }
  protected soltar(e: PointerEvent): void {
    this.arrastando = false;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {
      /* já liberado */
    }
  }
  protected tecla(e: KeyboardEvent): void {
    const passo = e.shiftKey ? 15 : 1;
    const d = { ArrowLeft: passo, ArrowUp: passo, ArrowRight: -passo, ArrowDown: -passo }[e.key];
    if (d === undefined) return;
    e.preventDefault();
    let a = this.angulo() + d;
    if (a > 180) a -= 360;
    if (a < -180) a += 360;
    this.mudou.emit(a);
  }
}
