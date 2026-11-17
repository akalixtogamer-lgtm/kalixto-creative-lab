import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-isometric-layers',
  templateUrl: './isometric-layers.html',
  styleUrl: './isometric-layers.css',
})
export class IsometricLayers {
  protected readonly camadas = ['Banco de dados', 'Design system', 'Protótipo', 'Deploy'];
  protected readonly descricao = 'Pilha de camadas: ' + this.camadas.join(', ');
  protected readonly aberta = signal(false);
}
