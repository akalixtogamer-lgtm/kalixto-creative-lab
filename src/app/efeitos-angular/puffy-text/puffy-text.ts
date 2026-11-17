import { Component } from '@angular/core';

@Component({
  selector: 'app-puffy-text',
  templateUrl: './puffy-text.html',
  styleUrl: './puffy-text.css',
})
export class PuffyText {
  protected readonly palavra = 'TRABALHOS';
  protected readonly letras = [...this.palavra];
}
