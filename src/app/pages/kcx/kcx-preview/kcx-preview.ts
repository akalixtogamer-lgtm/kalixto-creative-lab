import {
  Component,
  DestroyRef,
  ElementRef,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { Saidas } from '../../../kcx/resolver';

export type AcaoPreview = 'tocar' | 'pausar' | 'reiniciar' | 'velocidade';

/**
 * Preview KCX ao vivo.
 *
 * O documento (HTML/CSS/JS) só é recarregado quando o CÓDIGO muda. Quando as
 * VARIÁVEIS mudam, os novos valores vão por postMessage para o runtime dentro
 * do iframe, que atualiza as custom properties — a animação não reinicia.
 *
 * O iframe é sandbox="allow-scripts" (origem opaca, sem acesso ao app);
 * mensagens só são aceitas se vierem do próprio iframe.
 */
@Component({
  selector: 'kx-kcx-preview',
  host: { '[style.--kcxp-altura]': 'altura()' },
  template: `<div #host class="kcxp__host">
    <iframe class="kcxp__frame" sandbox="allow-scripts" [title]="titulo()"></iframe>
  </div>`,
  styles: `
    :host {
      display: block;
    }
    .kcxp__frame {
      display: block;
      width: 100%;
      height: var(--kcxp-altura, 360px);
      border: 1px solid var(--kx-border);
      border-radius: var(--kx-radius-md);
      background: #0b0a14;
    }
  `,
})
export class KcxPreview {
  readonly documento = input.required<string>();
  readonly saidas = input.required<Saidas>();
  readonly titulo = input('Preview do componente KCX');
  readonly altura = input('clamp(300px, 48vh, 460px)');

  /** Quantas vezes o documento foi carregado (as variáveis não recarregam). */
  readonly recargas = signal(0);
  /** Mensagens de variáveis enviadas sem recarregar. */
  readonly atualizacoesAoVivo = signal(0);

  private readonly host = viewChild.required<ElementRef<HTMLElement>>('host');
  private frame: HTMLIFrameElement | null = null;
  private pronto = false;
  private ultimoDoc = '';
  private velocidade = 1;
  private pausado = false;

  constructor() {
    const ouvir = (e: MessageEvent) => {
      if (!this.frame || e.source !== this.frame.contentWindow) return;
      if ((e.data as { kcx?: string })?.kcx === 'pronto') {
        this.pronto = true;
        this.enviar();
        if (this.velocidade !== 1) this.controlar('velocidade', this.velocidade);
        if (this.pausado) this.controlar('pausar');
      }
    };
    window.addEventListener('message', ouvir);
    inject(DestroyRef).onDestroy(() => window.removeEventListener('message', ouvir));

    // Código mudou → novo documento.
    effect(() => {
      const doc = this.documento();
      const host = this.host().nativeElement;
      if (doc === this.ultimoDoc) return;
      this.ultimoDoc = doc;
      this.carregar(host, doc);
    });

    // Variáveis mudaram → postMessage (sem recarregar).
    effect(() => {
      this.saidas();
      this.enviar();
    });
  }

  /**
   * Um iframe novo a cada documento: mudar srcdoc de um iframe existente cria
   * uma entrada no histórico do navegador (ver pages/efeito).
   */
  private carregar(host: HTMLElement, doc: string): void {
    const atual = host.querySelector('iframe');
    if (!atual) return;
    const novo = atual.cloneNode(false) as HTMLIFrameElement;
    novo.srcdoc = doc;
    this.pronto = false;
    host.replaceChildren(novo);
    this.frame = novo;
    this.recargas.update((n) => n + 1);
  }

  private enviar(): void {
    const s = this.saidas();
    if (!this.frame?.contentWindow || !this.pronto) return;
    this.frame.contentWindow.postMessage(
      { kcx: 'set', cssVars: s.cssVars, atributos: s.atributos, textos: s.textos },
      '*',
    );
    this.atualizacoesAoVivo.update((n) => n + 1);
  }

  controlar(acao: AcaoPreview, valor?: number): void {
    if (acao === 'velocidade' && valor) this.velocidade = valor;
    if (acao === 'pausar') this.pausado = true;
    if (acao === 'tocar') this.pausado = false;
    this.frame?.contentWindow?.postMessage({ kcx: 'controle', acao, valor }, '*');
  }

  /** Recarrega o mesmo documento (volta tudo ao primeiro quadro). */
  recarregar(): void {
    this.carregar(this.host().nativeElement, this.ultimoDoc);
  }
}
