import { Component, DestroyRef, computed, inject, signal } from '@angular/core';

@Component({
  selector: 'app-step-unlock',
  templateUrl: './step-unlock.html',
  styleUrl: './step-unlock.css',
})
export class StepUnlock {
  protected readonly passos = [
    {
      titulo: 'Design system',
      detalhe: 'Cores, fontes e componentes',
    },
    {
      titulo: 'Página',
      detalhe: 'Copy, layout e animações',
    },
    {
      titulo: 'Publicação',
      detalhe: 'Domínio e site no ar',
    },
  ];
  protected readonly automatico = true;
  private readonly intervalo = 1300;
  private readonly reduzir = window.matchMedia('(prefers-reduced-motion: reduce)');
  private temporizador = 0;

  /** Quantas etapas já estão livres e qual está tremendo agora. */
  protected readonly livres = signal(0);
  protected readonly tremendo = signal(-1);
  protected readonly terminou = computed(() => this.livres() === this.passos.length);

  constructor() {
    if (this.automatico) this.agendar();
    inject(DestroyRef).onDestroy(() => clearTimeout(this.temporizador));
  }

  protected clicar(): void {
    if (this.automatico || this.terminou()) this.recomecar();
    else this.desbloquear();
  }

  private agendar(): void {
    this.temporizador = window.setTimeout(() => this.desbloquear(), this.intervalo);
  }

  private desbloquear(): void {
    const i = this.livres();
    if (i >= this.passos.length || this.tremendo() !== -1) return;
    this.tremendo.set(i);
    setTimeout(
      () => {
        this.tremendo.set(-1);
        this.livres.set(i + 1);
        if (this.automatico && i + 1 < this.passos.length) this.agendar();
      },
      this.reduzir.matches ? 0 : 350,
    );
  }

  private recomecar(): void {
    clearTimeout(this.temporizador);
    this.livres.set(0);
    this.tremendo.set(-1);
    if (this.automatico) this.agendar();
  }
}
