import { Component, ElementRef, signal, viewChild } from '@angular/core';

interface Tema {
  nome: string;
  fundo: string;
  tinta: string;
}

/** Uma camada da vitrine: um tema e o ponto onde o círculo nasce. */
interface Mundo {
  id: number;
  tema: Tema;
  x: string;
  y: string;
  entrando: boolean;
}

@Component({
  selector: 'app-theme-wipe',
  templateUrl: './theme-wipe.html',
  styleUrl: './theme-wipe.css',
})
export class ThemeWipe {
  protected readonly temas: Tema[] = [
    {
      nome: 'Lima',
      fundo: '#c6ff3d',
      tinta: '#0b0a14'
    },
    {
      nome: 'Fogo',
      fundo: '#ff5a1f',
      tinta: '#1a0800'
    },
    {
      nome: 'Gelo',
      fundo: '#bfe3ff',
      tinta: '#0a2540'
    },
    {
      nome: 'Noite',
      fundo: '#2a1f6b',
      tinta: '#f4f2ff'
    }
  ];
  private readonly vitrine = viewChild.required<ElementRef<HTMLElement>>('vitrine');
  private readonly reduzir = window.matchMedia('(prefers-reduced-motion: reduce)');
  private proximo = 1;

  protected readonly atual = signal(0);
  protected readonly mundos = signal<Mundo[]>([
    { id: 0, tema: this.temas[0], x: '50%', y: '50%', entrando: false },
  ]);

  protected trocar(i: number, botao: HTMLElement): void {
    const v = this.vitrine().nativeElement.getBoundingClientRect();
    const b = botao.getBoundingClientRect();
    const x = b.left + b.width / 2 - v.left + 'px';
    const y = b.top + b.height / 2 - v.top + 'px';
    const novo: Mundo = { id: this.proximo++, tema: this.temas[i], x, y, entrando: !this.reduzir.matches };
    this.mundos.update((lista) => (novo.entrando ? [...lista, novo] : [novo]));
    this.atual.set(i);
  }

  /** Fim da animação: só a camada que acabou de entrar fica. */
  protected limpar(id: number): void {
    this.mundos.update((lista) => lista.filter((m) => m.id >= id));
  }
}
