import { Component, ElementRef, afterNextRender, signal, viewChildren } from '@angular/core';

interface Dispositivo {
  id: string;
  rotulo: string;
  largura: string;
  proporcao: string;
  raio: string;
}

@Component({
  selector: 'app-device-switcher',
  templateUrl: './device-switcher.html',
  styleUrl: './device-switcher.css',
})
export class DeviceSwitcher {
  protected readonly dispositivos: Dispositivo[] = [
    {
      id: 'computador',
      rotulo: 'Computador',
      largura: '100%',
      proporcao: '16 / 10',
      raio: '12px'
    },
    {
      id: 'tablet',
      rotulo: 'Tablet',
      largura: '48%',
      proporcao: '3 / 4',
      raio: '22px'
    },
    {
      id: 'celular',
      rotulo: 'Celular',
      largura: '30%',
      proporcao: '9 / 19',
      raio: '30px'
    }
  ];
  private readonly botoes = viewChildren<ElementRef<HTMLButtonElement>>('opcao');

  protected readonly atual = signal(this.dispositivos[0]);
  protected readonly x = signal('0px');
  protected readonly w = signal('0px');

  constructor() {
    afterNextRender(() => this.medir(0));
  }

  protected escolher(i: number): void {
    this.atual.set(this.dispositivos[i]);
    this.medir(i);
  }

  /** Leva o indicador para baixo do botão escolhido. */
  private medir(i: number): void {
    const b = this.botoes()[i]?.nativeElement;
    if (!b) return;
    this.x.set(b.offsetLeft + 'px');
    this.w.set(b.offsetWidth + 'px');
  }
}
