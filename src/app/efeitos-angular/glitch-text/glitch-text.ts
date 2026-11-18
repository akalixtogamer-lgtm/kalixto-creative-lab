import { Component } from '@angular/core';

/** glitch-text: efeito só de CSS — o texto vai no conteúdo e no data-texto. */
@Component({
  selector: 'app-glitch-text',
  templateUrl: './glitch-text.html',
  styleUrl: './glitch-text.css',
})
export class GlitchText {
  protected readonly texto = 'o céu mudou de dono';
}
