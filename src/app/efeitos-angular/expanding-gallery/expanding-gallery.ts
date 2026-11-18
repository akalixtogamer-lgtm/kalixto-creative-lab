import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-expanding-gallery',
  templateUrl: './expanding-gallery.html',
  styleUrl: './expanding-gallery.css',
})
export class ExpandingGallery {
  protected readonly paineis = [
    {
      nome: 'Montanha',
      fundo: 'linear-gradient(160deg, #9fd8ff, #2f8f6b 70%)',
    },
    {
      nome: 'Deserto',
      fundo: 'linear-gradient(160deg, #ffd27a, #c24d2c 75%)',
    },
    {
      nome: 'Oceano',
      fundo: 'linear-gradient(160deg, #22e3ff, #0a2540 80%)',
    },
    {
      nome: 'Cidade',
      fundo: 'linear-gradient(160deg, #ff2bd6, #2a1f6b 70%)',
    },
    {
      nome: 'Floresta',
      fundo: 'linear-gradient(160deg, #c6ff3d, #1f4a2a 70%)',
    },
  ];
  /** Faixa fixada pelo clique (aberta quando o mouse não está na galeria). */
  protected readonly ativa = signal(0);
}
