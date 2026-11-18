import { Injectable, effect, signal } from '@angular/core';

export type Tema = 'escuro' | 'claro';

/** Chave do localStorage (a mesma lida pelo script do index.html, antes do Angular carregar). */
export const CHAVE_TEMA = 'kalixto-lab:tema';

/** Cor da barra do navegador no celular, por tema. */
const COR_BARRA: Record<Tema, string> = { escuro: '#07050f', claro: '#fbf7ff' };

function preferenciaSalva(): Tema | null {
  try {
    const t = localStorage.getItem(CHAVE_TEMA);
    return t === 'claro' || t === 'escuro' ? t : null;
  } catch {
    return null; // navegação privada ou armazenamento bloqueado
  }
}

function preferenciaDoSistema(): Tema {
  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'claro' : 'escuro';
}

/**
 * Modo claro / escuro.
 * - Sem escolha salva, segue o sistema (e acompanha se o sistema mudar).
 * - Depois que a pessoa escolhe no botão, a escolha fica salva neste navegador.
 * As cores ficam em src/styles/tokens.css (:root e :root[data-tema='claro']).
 */
@Injectable({ providedIn: 'root' })
export class TemaService {
  readonly tema = signal<Tema>(preferenciaSalva() ?? preferenciaDoSistema());

  constructor() {
    effect(() => {
      const t = this.tema();
      document.documentElement.dataset['tema'] = t;
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', COR_BARRA[t]);
    });

    // Sem escolha salva: acompanha a troca de tema do sistema
    window.matchMedia?.('(prefers-color-scheme: light)').addEventListener?.('change', () => {
      if (!preferenciaSalva()) this.tema.set(preferenciaDoSistema());
    });
  }

  alternar(): void {
    const novo: Tema = this.tema() === 'escuro' ? 'claro' : 'escuro';
    this.tema.set(novo);
    try {
      localStorage.setItem(CHAVE_TEMA, novo);
    } catch {
      /* sem armazenamento: vale só nesta visita */
    }
  }
}
