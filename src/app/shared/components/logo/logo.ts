import { Component, booleanAttribute, computed, input } from '@angular/core';

/**
 * Logo oficial Kalixto (selo circular ilustrado), usada em todos os
 * tamanhos. O navegador escolhe o arquivo certo pelo srcset.
 *
 * Uso: <kx-logo [tamanho]="44" />            (decorativa, sem alt)
 *      <kx-logo [tamanho]="240" descritiva /> (com texto alternativo)
 */
@Component({
  selector: 'kx-logo',
  host: { class: 'kx-logo', '[style.--logo-size.px]': 'tamanho()' },
  template: `
    <img
      src="brand/kalixto-logo-256.webp"
      srcset="
        brand/kalixto-logo-64.webp   64w,
        brand/kalixto-logo-128.webp 128w,
        brand/kalixto-logo-256.webp 256w,
        brand/kalixto-logo-512.webp 512w
      "
      [attr.sizes]="tamanho() + 'px'"
      [width]="tamanho()"
      [height]="tamanho()"
      [alt]="texto()"
      [attr.loading]="tamanho() > 100 ? 'lazy' : null"
      decoding="async"
    />
  `,
  styles: `
    :host {
      display: inline-block;
      flex-shrink: 0;
      width: var(--logo-size);
      height: var(--logo-size);
      border-radius: 50%;
      box-shadow:
        0 0 0 1px rgb(255 43 214 / 0.45),
        0 0 calc(var(--logo-size) * 0.35) rgb(255 43 214 / 0.35);
    }
    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
    }
  `,
})
export class Logo {
  readonly tamanho = input(44);
  /** Quando true, a imagem tem texto alternativo (não é só decoração). */
  readonly descritiva = input(false, { transform: booleanAttribute });
  protected readonly texto = computed(() =>
    this.descritiva() ? 'Logo Kalixto — Professor, Programador, Gamer' : '',
  );
}
