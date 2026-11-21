import { Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  CHAVES_DESFOQUE,
  ChaveDesfoque,
  DESFOQUES,
  VIDRO_PADRAO,
  camadaSugerida,
  camadasParaVidro,
  comVidro,
} from '../../../kcx/construtor';
import { KcxComponente } from '../../../kcx/kcx.types';
import { fundoColorido } from '../../../kcx/plano-html';
import { KcxFundacaoService } from '../kcx-fundacao.service';
import { KcxMeusService } from '../kcx-meus.service';
import { KcxVariantes } from '../kcx-variantes/kcx-variantes';

/**
 * Efeito vidro (glassmorphism) em qualquer componente: escolhe a camada, a
 * opacidade do fundo e da borda e o desfoque, vê a prévia em cima de um fundo
 * colorido e salva uma cópia "· vidro" em Meus componentes.
 */
@Component({
  selector: 'kx-kcx-vidro-painel',
  imports: [KcxVariantes],
  templateUrl: './kcx-vidro-painel.html',
  styleUrl: './kcx-vidro-painel.css',
})
export class KcxVidroPainel {
  readonly comp = input.required<KcxComponente>();

  private readonly meus = inject(KcxMeusService);
  private readonly router = inject(Router);
  private readonly fundacao = inject(KcxFundacaoService).fundacao;

  protected readonly desfoques = CHAVES_DESFOQUE;
  protected readonly px = DESFOQUES;
  protected readonly camadas = computed(() => camadasParaVidro(this.comp()));
  protected readonly camada = linkedSignal(() => camadaSugerida(this.comp()));
  protected readonly fundo = signal(VIDRO_PADRAO.fundo);
  protected readonly borda = signal(VIDRO_PADRAO.borda);
  protected readonly desfoque = signal<ChaveDesfoque>(VIDRO_PADRAO.desfoque);
  protected readonly erros = signal<string[]>([]);

  protected readonly resultado = computed(() => {
    try {
      return comVidro(
        this.comp(),
        {
          fundo: this.fundo(),
          borda: this.borda(),
          desfoque: this.desfoque(),
          camada: this.camada(),
        },
        this.meus.ids(),
      );
    } catch (e) {
      return { erro: (e as Error).message };
    }
  });
  protected readonly vidro = computed(() => {
    const r = this.resultado();
    return 'comp' in r ? r : null;
  });
  protected readonly erro = computed(() => {
    const r = this.resultado();
    return 'erro' in r ? r.erro : '';
  });

  protected readonly fundoPrevia = computed(() => {
    const c = this.fundacao().cores;
    return fundoColorido([c.primaria.escuro, c.destaque.escuro, c.secundaria.escuro]);
  });

  protected numero(e: Event): number {
    return Math.round(Math.min(100, Math.max(0, Number((e.target as HTMLInputElement).value))));
  }
  protected valor(e: Event): string {
    return (e.target as HTMLSelectElement).value;
  }
  protected recuo(nivel: number): string {
    return '  '.repeat(nivel);
  }

  protected salvar(): void {
    const v = this.vidro();
    if (!v) return;
    const erros = this.meus.salvar(v.comp);
    this.erros.set(erros);
    if (!erros.length) void this.router.navigate(['/kcx', v.comp.id]);
  }
}
