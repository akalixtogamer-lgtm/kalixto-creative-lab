import { Component, ElementRef, OnDestroy, computed, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { gsap } from 'gsap';
import { CodeViewer } from '../../shared/components/code-viewer/code-viewer';
import { Icon } from '../../shared/components/icon/icon';
import { PageHeader } from '../../shared/components/page-header/page-header';
import { CODIGOS, EFEITOS_COMPARADOS, EfeitoId, TECNOLOGIAS } from './comparador.data';

/**
 * Comparador de tecnologias: tabela de quando usar cada uma e o mesmo
 * efeito feito com CSS, Web Animations API e GSAP, rodando lado a lado.
 */
@Component({
  selector: 'kx-comparador',
  imports: [RouterLink, CodeViewer, Icon, PageHeader],
  templateUrl: './comparador.html',
  styleUrl: './comparador.css',
})
export class Comparador implements OnDestroy {
  private readonly palcoWaapi = viewChild<ElementRef<HTMLElement>>('waapi');
  private readonly palcoGsap = viewChild<ElementRef<HTMLElement>>('gsap');

  protected readonly tecnologias = TECNOLOGIAS;
  protected readonly efeitos = EFEITOS_COMPARADOS;
  protected readonly escala = [1, 2, 3, 4, 5];

  protected readonly efeito = signal<EfeitoId>('entrada');
  protected readonly codigos = computed(() => CODIGOS[this.efeito()]);
  /** Muda a cada execução para reiniciar a versão em CSS. */
  protected readonly rodada = signal(0);
  protected readonly rodando = signal(false);

  private ctx?: gsap.Context;
  private animacoes: Animation[] = [];

  escolher(id: EfeitoId): void {
    this.limpar();
    this.rodando.set(false);
    this.efeito.set(id);
  }

  executar(): void {
    this.limpar();
    this.rodando.set(true);
    this.rodada.update((r) => r + 1);
    // Espera o Angular recriar os elementos da versão CSS antes de rodar as outras
    requestAnimationFrame(() => {
      this.rodarWaapi();
      this.rodarGsap();
    });
  }

  ngOnDestroy(): void {
    this.limpar();
  }

  private rodarWaapi(): void {
    const palco = this.palcoWaapi()?.nativeElement;
    if (!palco?.animate) return;
    const caixa = palco.querySelector<HTMLElement>('.cmp-caixa');
    const bolas = [...palco.querySelectorAll<HTMLElement>('.cmp-bola')];
    const ef = this.efeito();
    if (ef === 'entrada' && caixa) {
      this.animacoes.push(
        caixa.animate(
          [
            { opacity: 0, transform: 'translateY(40px)' },
            { opacity: 1, transform: 'translateY(0)' },
          ],
          { duration: 800, easing: 'ease-out' },
        ),
      );
    } else if (ef === 'pulso' && caixa) {
      this.animacoes.push(
        caixa.animate(
          [{ transform: 'scale(1)' }, { transform: 'scale(1.2)' }, { transform: 'scale(1)' }],
          {
            duration: 500,
            iterations: 3,
            easing: 'ease-in-out',
          },
        ),
      );
    } else if (ef === 'sequencia') {
      const passo = [{ transform: 'translateX(0)' }, { transform: 'translateX(120px)' }];
      bolas.forEach((b, i) =>
        this.animacoes.push(
          b.animate(passo, {
            duration: 500,
            delay: i * 500,
            fill: 'forwards',
            easing: 'ease-in-out',
          }),
        ),
      );
    }
  }

  private rodarGsap(): void {
    const palco = this.palcoGsap()?.nativeElement;
    if (!palco) return;
    const ef = this.efeito();
    this.ctx = gsap.context(() => {
      if (ef === 'entrada')
        gsap.from('.cmp-caixa', { opacity: 0, y: 40, duration: 0.8, ease: 'power2.out' });
      if (ef === 'pulso')
        gsap.to('.cmp-caixa', {
          scale: 1.2,
          duration: 0.25,
          repeat: 5,
          yoyo: true,
          ease: 'sine.inOut',
        });
      if (ef === 'sequencia') {
        gsap
          .timeline()
          .to('.cmp-bola-1', { x: 120, duration: 0.5 })
          .to('.cmp-bola-2', { x: 120, duration: 0.5 })
          .to('.cmp-bola-3', { x: 120, duration: 0.5 });
      }
    }, palco);
  }

  private limpar(): void {
    this.ctx?.revert();
    this.ctx = undefined;
    this.animacoes.forEach((a) => a.cancel());
    this.animacoes = [];
  }
}
