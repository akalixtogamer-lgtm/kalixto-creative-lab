import { Component, computed, inject, input, output } from '@angular/core';
import {
  IDS_VIDRO,
  camadasParaVidro,
  temVidroEditavel,
  valoresVidro,
} from '../../../kcx/construtor';
import { KcxComponente, KcxValor } from '../../../kcx/kcx.types';
import { Valores } from '../../../kcx/resolver';
import { KcxMeusService } from '../kcx-meus.service';

interface Controle {
  id: string;
  nome: string;
  min: number;
  max: number;
  passo: number;
  /** Como mostrar o valor: % para 0–1, px para o desfoque. */
  formato: 'pct' | 'px';
}

/**
 * Efeito vidro (glassmorphism) dentro da edição de qualquer componente: liga e
 * desliga, escolhe a camada e ajusta fundo, borda e desfoque. Mexe nas
 * variáveis "Vidro · …" do próprio componente (preview ao vivo, código e Figma).
 */
@Component({
  selector: 'kx-kcx-vidro-painel',
  templateUrl: './kcx-vidro-painel.html',
  styleUrl: './kcx-vidro-painel.css',
})
export class KcxVidroPainel {
  readonly comp = input.required<KcxComponente>();
  readonly valores = input.required<Valores>();
  readonly aplicar = output<Record<string, KcxValor>>();

  private readonly meus = inject(KcxMeusService);

  protected readonly disponivel = computed(() => temVidroEditavel(this.comp()));
  protected readonly camadas = computed(() => camadasParaVidro(this.comp()));
  protected readonly info = computed(() => this.meus.vidro(this.comp().id));

  protected readonly controles = computed<Controle[]>(() => {
    const ids = new Set(this.comp().variaveis.map((v) => v.id));
    const lista: Controle[] = [
      { id: IDS_VIDRO.fundo, nome: 'Fundo', min: 0, max: 1, passo: 0.05, formato: 'pct' },
      { id: IDS_VIDRO.veu, nome: 'Véu claro', min: 0, max: 1, passo: 0.05, formato: 'pct' },
      { id: IDS_VIDRO.borda, nome: 'Borda', min: 0, max: 1, passo: 0.05, formato: 'pct' },
      { id: IDS_VIDRO.desfoque, nome: 'Desfoque', min: 0, max: 40, passo: 1, formato: 'px' },
    ];
    return lista.filter((c) => ids.has(c.id));
  });

  /** Ligado = algum valor de vidro fora do padrão. */
  protected readonly ligado = computed(() => {
    const padrao = valoresVidro(this.comp(), false);
    return Object.entries(padrao).some(([id, v]) => (this.valores()[id] ?? v) !== v);
  });

  protected valor(id: string): number {
    const v = this.comp().variaveis.find((x) => x.id === id);
    return Number(this.valores()[id] ?? v?.valor ?? 0);
  }
  protected rotulo(c: Controle): string {
    const v = this.valor(c.id);
    return c.formato === 'pct' ? `${Math.round(v * 100)}%` : `${v} px`;
  }

  protected alternar(): void {
    this.aplicar.emit(valoresVidro(this.comp(), !this.ligado()));
  }
  protected mudar(id: string, e: Event): void {
    this.aplicar.emit({ [id]: Number((e.target as HTMLInputElement).value) });
  }
  protected trocarCamada(e: Event): void {
    const ligado = this.ligado();
    this.meus.definirCamadaVidro(this.comp().id, (e.target as HTMLSelectElement).value);
    // Os ids das variáveis mudam com a camada: reaplica o efeito se estava ligado.
    if (ligado) queueMicrotask(() => this.aplicar.emit(valoresVidro(this.comp(), true)));
  }
  protected recuo(nivel: number): string {
    return '  '.repeat(nivel);
  }
}
