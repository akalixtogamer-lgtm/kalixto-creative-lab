import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NOMES_COR, TokenCor } from '../../../kcx/fundacao';
import {
  LIMITE_MOODBOARD,
  moodboardHtml,
  paletaGeral,
  sugerirPapeis,
  vagas,
} from '../../../kcx/projeto/moodboard';
import { Icon } from '../../../shared/components/icon/icon';
import { baixarArquivo } from '../kcx-estado.service';
import { KcxFundacaoService } from '../kcx-fundacao.service';
import { KcxMoodboardService, prepararImagem } from '../kcx-moodboard.service';
import { KcxProjetoService } from '../kcx-projeto.service';

type Papel = 'primaria' | 'secundaria' | 'destaque' | 'fundo' | 'texto';

/**
 * Moodboard (/kcx/moodboard): até 20 imagens de referência, com legenda,
 * a paleta tirada delas e a opção de levar as cores para a Fundação.
 */
@Component({
  selector: 'kx-kcx-moodboard',
  imports: [RouterLink, Icon],
  templateUrl: './kcx-moodboard.html',
  styleUrl: './kcx-moodboard.css',
  host: { '(document:keydown.escape)': 'aberta.set(null)' },
})
export class KcxMoodboardPagina {
  private readonly srv = inject(KcxMoodboardService);
  private readonly fundacaoSrv = inject(KcxFundacaoService);
  private readonly projeto = inject(KcxProjetoService);

  protected readonly limite = LIMITE_MOODBOARD;
  protected readonly m = this.srv.moodboard;
  protected readonly carregado = this.srv.carregado;
  protected readonly persistente = this.srv.persistente;
  protected readonly paleta = computed(() => paletaGeral(this.m().imagens));
  protected readonly papeis = computed(() =>
    (Object.entries(sugerirPapeis(this.paleta())) as [Papel, string][]).map(([t, c]) => ({
      t,
      c,
      nome: NOMES_COR[t as TokenCor],
    })),
  );
  protected readonly enviando = signal(0);
  protected readonly mensagens = signal<{ tipo: 'ok' | 'erro'; texto: string }[]>([]);
  protected readonly sobre = signal(false);
  protected readonly arrastando = signal<number | null>(null);
  protected readonly alvo = signal<number | null>(null);
  protected readonly copiada = signal<string | null>(null);
  protected readonly aberta = signal<number | null>(null);

  protected escolher(e: Event): void {
    const input = e.target as HTMLInputElement;
    const arquivos = [...(input.files ?? [])];
    input.value = '';
    void this.adicionar(arquivos);
  }
  protected soltarArquivos(e: DragEvent): void {
    e.preventDefault();
    this.sobre.set(false);
    if (this.arrastando() !== null) return;
    void this.adicionar([...(e.dataTransfer?.files ?? [])]);
  }
  protected arrastarSobre(e: DragEvent): void {
    if (this.arrastando() !== null) return;
    e.preventDefault();
    this.sobre.set(true);
  }

  private async adicionar(arquivos: File[]): Promise<void> {
    if (!arquivos.length) return;
    const msgs: { tipo: 'ok' | 'erro'; texto: string }[] = [];
    const { entram, sobram } = vagas(this.m().imagens.length, arquivos.length);
    if (sobram)
      msgs.push({
        tipo: 'erro',
        texto: `O moodboard aceita até ${LIMITE_MOODBOARD} imagens: ${sobram} ficaram de fora.`,
      });
    let ok = 0;
    this.enviando.set(entram);
    for (const arq of arquivos.slice(0, entram)) {
      try {
        const img = await prepararImagem(arq);
        if (this.m().imagens.length >= LIMITE_MOODBOARD) break;
        this.srv.alterar((m) => m.imagens.push(img));
        ok++;
      } catch (e) {
        msgs.push({ tipo: 'erro', texto: (e as Error).message });
      } finally {
        this.enviando.update((n) => Math.max(0, n - 1));
      }
    }
    if (ok) msgs.unshift({ tipo: 'ok', texto: `${ok} imagem(ns) adicionada(s).` });
    this.mensagens.set(msgs);
  }

  protected definir<K extends 'titulo' | 'palavras' | 'layout'>(k: K, v: string): void {
    this.srv.alterar((m) => ((m as unknown as Record<string, string>)[k] = v.slice(0, 500)));
  }
  protected legenda(i: number, v: string): void {
    this.srv.alterar((m) => (m.imagens[i].legenda = v.slice(0, 300)));
  }
  protected remover(i: number): void {
    this.srv.alterar((m) => m.imagens.splice(i, 1));
    if (this.aberta() !== null) this.aberta.set(null);
  }
  protected mover(i: number, d: -1 | 1): void {
    this.trocar(i, i + d);
  }
  private trocar(i: number, j: number): void {
    this.srv.alterar((m) => {
      if (j < 0 || j >= m.imagens.length) return;
      const [x] = m.imagens.splice(i, 1);
      m.imagens.splice(j, 0, x);
    });
  }
  protected limparTudo(): void {
    if (!globalThis.confirm?.('Tirar todas as imagens do moodboard?')) return;
    this.srv.alterar((m) => (m.imagens = []));
  }

  /* Arrastar para reordenar */
  protected comecar(i: number, e: DragEvent): void {
    this.arrastando.set(i);
    e.dataTransfer?.setData('text/plain', String(i));
    if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
  }
  protected sobreImagem(j: number, e: DragEvent): void {
    if (this.arrastando() === null) return;
    e.preventDefault();
    this.alvo.set(j);
  }
  protected soltarImagem(j: number, e: DragEvent): void {
    const i = this.arrastando();
    if (i === null) return;
    e.preventDefault();
    e.stopPropagation();
    this.terminar();
    if (i !== j) this.trocar(i, j);
  }
  protected terminar(): void {
    this.arrastando.set(null);
    this.alvo.set(null);
  }

  protected async copiar(c: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(c);
      this.copiada.set(c);
      setTimeout(() => this.copiada.set(null), 1500);
    } catch {
      /* sem área de transferência */
    }
  }

  /** Leva a paleta sugerida para a Fundação (marca nos dois temas; fundo e texto no escuro). */
  protected aplicarNaFundacao(): void {
    const papeis = this.papeis();
    if (!papeis.length) return;
    if (
      !globalThis.confirm?.(
        `Trocar na Fundação: ${papeis.map((p) => `${p.nome} → ${p.c}`).join(', ')}?`,
      )
    )
      return;
    const erros = this.fundacaoSrv.alterar((f) => {
      for (const { t, c } of papeis) {
        if (t === 'fundo' || t === 'texto') f.cores[t].escuro = c;
        else f.cores[t] = { escuro: c, claro: c };
      }
    });
    this.mensagens.set([
      erros.length
        ? { tipo: 'erro', texto: erros[0] }
        : {
            tipo: 'ok',
            texto: 'Cores levadas para a Fundação. Confira o contraste no guia do design system.',
          },
    ]);
  }

  protected baixar(): void {
    const nome =
      (this.m().titulo || 'moodboard')
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || 'moodboard';
    baixarArquivo(moodboardHtml(this.m(), this.projeto.briefing()), `${nome}.html`, 'text/html');
  }

  /** Texto escuro sobre cores claras. */
  protected textoSobre(hex: string): string {
    const n = parseInt(hex.slice(1), 16);
    const l = 0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255);
    return l > 160 ? '#111' : '#fff';
  }

  protected valor(e: Event): string {
    return (e.target as HTMLInputElement).value;
  }
}
