import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-ripple-halo',
  templateUrl: './ripple-halo.html',
  styleUrl: './ripple-halo.css',
})
export class RippleHalo {
  protected readonly aneis = Array.from({ length: 4 }, (_, i) => i);
  protected readonly pausado = signal(false);
}
