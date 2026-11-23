import { Injectable, computed, signal } from '@angular/core';
import {
  FUNDACAO_PADRAO,
  KcxFundacao,
  completarFundacao,
  validarFundacao,
  lerFundacaoImportada,
} from '../../kcx/fundacao';

export const CHAVE_FUNDACAO = 'kalixto-lab:kcx-fundacao:v1';

interface Guardado {
  fundacao: KcxFundacao;
  /** Levar a fundação em todo pacote exportado para o Figma. */
  usarNoFigma: boolean;
}

function storage(): Storage | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

/**
 * A fundação (tokens do design system) da pessoa, guardada no navegador.
 * Um arquivo antigo ou editado à mão é completado com o padrão em vez de descartado.
 */
@Injectable({ providedIn: 'root' })
export class KcxFundacaoService {
  private readonly s = storage();
  readonly fundacao = signal<KcxFundacao>(structuredClone(FUNDACAO_PADRAO));
  readonly usarNoFigma = signal(true);
  readonly erros = computed(() => validarFundacao(this.fundacao()));
  /** Fundação para levar nos pacotes (ausente quando desligada ou inválida). */
  readonly paraPacote = computed(() =>
    this.usarNoFigma() && !this.erros().length ? this.fundacao() : undefined,
  );

  constructor() {
    try {
      const bruto = this.s?.getItem(CHAVE_FUNDACAO);
      if (bruto) {
        const g = JSON.parse(bruto) as Partial<Guardado>;
        if (g.fundacao) this.fundacao.set(completarFundacao(g.fundacao));
        if (typeof g.usarNoFigma === 'boolean') this.usarNoFigma.set(g.usarNoFigma);
      }
    } catch {
      /* fica o padrão */
    }
  }

  /** Troca a fundação inteira e salva. Devolve os erros (vazio = salvou). */
  definir(f: KcxFundacao): string[] {
    const erros = validarFundacao(f);
    this.fundacao.set(f);
    if (!erros.length) this.gravar();
    return erros;
  }

  /** Aplica uma alteração numa cópia e salva. */
  alterar(mudar: (f: KcxFundacao) => void): string[] {
    const f = structuredClone(this.fundacao());
    mudar(f);
    return this.definir(f);
  }

  /** Importa o texto de um arquivo de design system (fundação). */
  importarTexto(texto: string): { ok: true; nome: string } | { ok: false; erro: string } {
    let dado: unknown;
    try {
      dado = JSON.parse(texto);
    } catch {
      return { ok: false, erro: 'O arquivo não é um JSON válido.' };
    }
    const r = lerFundacaoImportada(dado);
    if ('erro' in r) return { ok: false, erro: r.erro };
    const erros = this.definir(r.fundacao);
    return erros.length ? { ok: false, erro: erros[0] } : { ok: true, nome: r.fundacao.nome };
  }

  definirUsoNoFigma(usar: boolean): void {
    this.usarNoFigma.set(usar);
    this.gravar();
  }

  restaurarPadrao(): void {
    this.definir(structuredClone(FUNDACAO_PADRAO));
  }

  private gravar(): void {
    try {
      this.s?.setItem(
        CHAVE_FUNDACAO,
        JSON.stringify({ fundacao: this.fundacao(), usarNoFigma: this.usarNoFigma() } as Guardado),
      );
    } catch {
      /* navegador recusou: continua em memória */
    }
  }
}
