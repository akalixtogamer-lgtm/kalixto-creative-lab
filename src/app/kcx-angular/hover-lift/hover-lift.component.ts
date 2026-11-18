import { Component, ElementRef, ViewEncapsulation, afterRenderEffect, computed, inject, input } from '@angular/core';
import { resolverKcx } from '../kcx-runtime';

/** Vínculos das variáveis (gerado pelo Kalixto Creative Lab — KCX hover-lift v1.0.0). */
const VARIAVEIS = [{"id":"color1","tipo":"color","padrao":"#d4119f","valor":"#d4119f","vinculos":[{"propriedade":"Início do gradiente","alvo":{"tipo":"css-var","nome":"--kcx-hover-lift-c1"}}]},{"id":"color2","tipo":"color","padrao":"#7c3aed","valor":"#7c3aed","vinculos":[{"propriedade":"Fim do gradiente","alvo":{"tipo":"css-var","nome":"--kcx-hover-lift-c2"}}]},{"id":"textColor","tipo":"color","padrao":"#ffffff","valor":"#ffffff","vinculos":[{"propriedade":"color","alvo":{"tipo":"css-var","nome":"--kcx-hover-lift-text"}}]},{"id":"shadowColor","tipo":"color","padrao":"#ff2bd6","valor":"#ff2bd6","vinculos":[{"propriedade":"Cor da box-shadow no hover","alvo":{"tipo":"css-var","nome":"--kcx-hover-lift-shadow"}}]},{"id":"shadowAlpha","tipo":"float","padrao":0.5,"valor":0.5,"min":0,"max":1,"vinculos":[{"propriedade":"Opacidade da sombra (color-mix)","alvo":{"tipo":"css-var","nome":"--kcx-hover-lift-shadow-alpha"},"transformar":[{"op":"multiplicar","fator":100}],"unidadeSaida":"%"}]},{"id":"shadowBlur","tipo":"dimension","padrao":24,"valor":24,"unidade":"px","min":0,"max":60,"vinculos":[{"propriedade":"Desfoque e deslocamento da sombra","alvo":{"tipo":"css-var","nome":"--kcx-hover-lift-blur"},"unidadeSaida":"px"}]},{"id":"radius","tipo":"dimension","padrao":12,"valor":12,"unidade":"px","min":0,"max":32,"vinculos":[{"propriedade":"border-radius","alvo":{"tipo":"css-var","nome":"--kcx-hover-lift-radius"},"unidadeSaida":"px"}]},{"id":"paddingX","tipo":"dimension","padrao":28,"valor":28,"unidade":"px","min":12,"max":56,"vinculos":[{"propriedade":"padding lateral","alvo":{"tipo":"css-var","nome":"--kcx-hover-lift-px"},"unidadeSaida":"px"}]},{"id":"paddingY","tipo":"dimension","padrao":14,"valor":14,"unidade":"px","min":6,"max":28,"vinculos":[{"propriedade":"padding vertical","alvo":{"tipo":"css-var","nome":"--kcx-hover-lift-py"},"unidadeSaida":"px"}]},{"id":"fontSize","tipo":"dimension","padrao":16,"valor":16,"unidade":"px","min":12,"max":28,"vinculos":[{"propriedade":"font-size","alvo":{"tipo":"css-var","nome":"--kcx-hover-lift-font"},"unidadeSaida":"px"}]},{"id":"label","tipo":"string","padrao":"Quero participar","valor":"Quero participar","vinculos":[{"propriedade":"Texto do botão","alvo":{"tipo":"texto","seletor":".kcx-hover-lift__rotulo"}}]},{"id":"lift","tipo":"dimension","padrao":4,"valor":4,"unidade":"px","min":0,"max":16,"vinculos":[{"propriedade":"translateY no hover","alvo":{"tipo":"css-var","nome":"--kcx-hover-lift-lift"},"unidadeSaida":"px"}]},{"id":"scale","tipo":"float","padrao":1.04,"valor":1.04,"unidade":"x","min":1,"max":1.15,"vinculos":[{"propriedade":"scale no hover","alvo":{"tipo":"css-var","nome":"--kcx-hover-lift-scale"}}]},{"id":"duration","tipo":"time","padrao":200,"valor":200,"unidade":"ms","min":80,"max":600,"vinculos":[{"propriedade":"transition-duration","alvo":{"tipo":"css-var","nome":"--kcx-hover-lift-duration"},"unidadeSaida":"ms"}]}] as const;

/**
 * Hover Lift Button — Botão em gradiente que sobe, cresce um pouco e ganha uma sombra colorida no hover e no foco.
 * Cada input é uma variável KCX: mudar o valor muda o componente na hora.
 * Licença MIT.
 */
@Component({
  selector: 'kcx-hover-lift',
  templateUrl: './hover-lift.component.html',
  styleUrl: './hover-lift.component.css',
  // Sem encapsulamento: as animações usam o nome do @keyframes vindo de uma custom property.
  // As classes já têm o prefixo kcx-hover-lift, então não vazam para o resto da página.
  encapsulation: ViewEncapsulation.None,
  host: { '[style]': 'saidas().cssVars' },
})
export class KcxHoverLift {
  /** Cor inicial — Início do gradiente do botão. Controla: Início do gradiente. */
  readonly color1 = input<string>("#d4119f");

  /** Cor final — Fim do gradiente do botão. Controla: Fim do gradiente. */
  readonly color2 = input<string>("#7c3aed");

  /** Cor do texto — Cor do rótulo. Controla: color. */
  readonly textColor = input<string>("#ffffff");

  /** Cor da sombra — Cor da sombra que aparece no hover. Controla: Cor da box-shadow no hover. */
  readonly shadowColor = input<string>("#ff2bd6");

  /** Força da sombra — Opacidade da sombra no hover. Controla: Opacidade da sombra (color-mix). */
  readonly shadowAlpha = input<number>(0.5);

  /** Desfoque da sombra — Tamanho da sombra no hover (o deslocamento vertical é um terço disso). Controla: Desfoque e deslocamento da sombra. */
  readonly shadowBlur = input<number>(24);

  /** Border radius — Arredondamento (32 = pílula). Controla: border-radius. */
  readonly radius = input<number>(12);

  /** Espaçamento horizontal — Padding lateral. Controla: padding lateral. */
  readonly paddingX = input<number>(28);

  /** Espaçamento vertical — Padding vertical. Controla: padding vertical. */
  readonly paddingY = input<number>(14);

  /** Tamanho do texto — Tamanho da fonte do rótulo. Controla: font-size. */
  readonly fontSize = input<number>(16);

  /** Rótulo — Texto do botão. Controla: Texto do botão. */
  readonly label = input<string>("Quero participar");

  /** Elevação — Quanto o botão sobe no hover. Controla: translateY no hover. */
  readonly lift = input<number>(4);

  /** Escala no hover — Quanto o botão cresce no hover. Controla: scale no hover. */
  readonly scale = input<number>(1.04);

  /** Duração — Tempo da transição. Controla: transition-duration. */
  readonly duration = input<number>(200);

  /** Valores finais de cada propriedade vinculada. */
  protected readonly saidas = computed(() =>
    resolverKcx(VARIAVEIS, {
      color1: this.color1(),
      color2: this.color2(),
      textColor: this.textColor(),
      shadowColor: this.shadowColor(),
      shadowAlpha: this.shadowAlpha(),
      shadowBlur: this.shadowBlur(),
      radius: this.radius(),
      paddingX: this.paddingX(),
      paddingY: this.paddingY(),
      fontSize: this.fontSize(),
      label: this.label(),
      lift: this.lift(),
      scale: this.scale(),
      duration: this.duration(),
    }),
  );

  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    // Atributos (ex.: d de um path) e textos vinculados às variáveis.
    afterRenderEffect(() => {
      const s = this.saidas();
      const raiz = this.el.nativeElement;
      for (const a of s.atributos) {
        if (/^on/i.test(a.atributo)) continue;
        raiz.querySelectorAll(a.seletor).forEach((n) => n.setAttribute(a.atributo, a.valor));
      }
      for (const t of s.textos) raiz.querySelectorAll(t.seletor).forEach((n) => (n.textContent = t.valor));
    });
  }
}
