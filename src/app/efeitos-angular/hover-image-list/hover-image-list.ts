import { Component, ElementRef, signal, viewChild } from '@angular/core';

interface Projeto {
  nome: string;
  ano: string;
  fundo: string;
}

@Component({
  selector: 'app-hover-image-list',
  templateUrl: './hover-image-list.html',
  styleUrl: './hover-image-list.css',
})
export class HoverImageList {
  protected readonly projetos: Projeto[] = [
    {
      nome: 'Maré',
      ano: '2026',
      fundo: 'linear-gradient(135deg, #2f7bff, #22e3ff)'
    },
    {
      nome: 'Erva Brava',
      ano: '2025',
      fundo: 'linear-gradient(135deg, #1f6b4a, #c6ff3d)'
    },
    {
      nome: 'Pedal',
      ano: '2025',
      fundo: 'linear-gradient(135deg, #ff2e3e, #ff8a5c)'
    },
    {
      nome: 'Sopro',
      ano: '2024',
      fundo: 'linear-gradient(135deg, #2a1f6b, #ff2bd6)'
    }
  ];
  private readonly reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  private readonly atraso = this.reduzir ? 1 : 0.15;
  private readonly inclinacao = this.reduzir ? 0 : 8;
  private readonly previa = viewChild.required<ElementRef<HTMLElement>>('previa');
  private alvoX = 0;
  private alvoY = 0;
  private x = 0;
  private y = 0;
  private quadro = 0;

  protected readonly fundo = signal('');
  protected readonly visivel = signal(false);

  protected entrar(e: PointerEvent, p: Projeto): void {
    if (e.pointerType !== 'mouse') return;
    if (!this.visivel()) {
      this.x = e.clientX;
      this.y = e.clientY;
    }
    this.mostrar(p);
  }

  protected focar(link: HTMLElement, p: Projeto): void {
    const r = link.getBoundingClientRect();
    this.x = this.alvoX = r.right - 200 / 2;
    this.y = this.alvoY = r.top + r.height / 2;
    this.mostrar(p);
    this.mirar(this.alvoX, this.alvoY);
  }

  protected mirar(px: number, py: number): void {
    this.alvoX = px;
    this.alvoY = py;
    if (!this.quadro) this.quadro = requestAnimationFrame(() => this.seguir());
  }

  private mostrar(p: Projeto): void {
    this.fundo.set(p.fundo);
    this.visivel.set(true);
  }

  /** Escrita direta no estilo: muda a cada quadro, fora da detecção de mudanças. */
  private seguir(): void {
    const dx = this.alvoX - this.x;
    this.x += dx * this.atraso;
    this.y += (this.alvoY - this.y) * this.atraso;
    const angulo = Math.max(-this.inclinacao, Math.min(this.inclinacao, dx * 0.1));
    const el = this.previa().nativeElement;
    el.style.translate = this.x + 'px ' + this.y + 'px';
    el.style.rotate = angulo + 'deg';
    this.quadro =
      Math.abs(dx) + Math.abs(this.alvoY - this.y) > 0.5 ? requestAnimationFrame(() => this.seguir()) : 0;
  }
}
