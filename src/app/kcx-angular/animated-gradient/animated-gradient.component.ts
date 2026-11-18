import { Component, ElementRef, ViewEncapsulation, afterRenderEffect, computed, inject, input } from '@angular/core';
import { resolverKcx } from '../kcx-runtime';

/** Vínculos das variáveis (gerado pelo Kalixto Creative Lab — KCX animated-gradient v1.0.0). */
const VARIAVEIS = [{"id":"gradient","tipo":"gradient","padrao":{"angulo":120,"paradas":[{"cor":"#ff2bd6","posicao":0},{"cor":"#8b5cf6","posicao":0.5},{"cor":"#22e3ff","posicao":1}]},"valor":{"angulo":120,"paradas":[{"cor":"#ff2bd6","posicao":0},{"cor":"#8b5cf6","posicao":0.5},{"cor":"#22e3ff","posicao":1}]},"vinculos":[{"propriedade":"background-image do fundo","alvo":{"tipo":"css-var","nome":"--kcx-animated-gradient-image"}}]},{"id":"textColor","tipo":"color","padrao":"#ffffff","valor":"#ffffff","vinculos":[{"propriedade":"Cor do título","alvo":{"tipo":"css-var","nome":"--kcx-animated-gradient-text"}}]},{"id":"title","tipo":"string","padrao":"Gradiente animado","valor":"Gradiente animado","vinculos":[{"propriedade":"Texto do título","alvo":{"tipo":"texto","seletor":".kcx-animated-gradient__titulo"}}]},{"id":"titleSize","tipo":"dimension","padrao":40,"valor":40,"unidade":"px","min":16,"max":72,"vinculos":[{"propriedade":"font-size do título","alvo":{"tipo":"css-var","nome":"--kcx-animated-gradient-title-size"},"unidadeSaida":"px"}]},{"id":"width","tipo":"dimension","padrao":640,"valor":640,"unidade":"px","min":240,"max":960,"vinculos":[{"propriedade":"Largura","alvo":{"tipo":"css-var","nome":"--kcx-animated-gradient-width"},"unidadeSaida":"px"},{"propriedade":"Altura (16:9)","alvo":{"tipo":"css-var","nome":"--kcx-animated-gradient-height"},"transformar":[{"op":"multiplicar","fator":0.5625},{"op":"arredondar","casas":0}],"unidadeSaida":"px"}]},{"id":"radius","tipo":"dimension","padrao":20,"valor":20,"unidade":"px","min":0,"max":48,"vinculos":[{"propriedade":"Arredondamento","alvo":{"tipo":"css-var","nome":"--kcx-animated-gradient-radius"},"unidadeSaida":"px"}]},{"id":"size","tipo":"dimension","padrao":300,"valor":300,"unidade":"%","min":150,"max":600,"vinculos":[{"propriedade":"background-size","alvo":{"tipo":"css-var","nome":"--kcx-animated-gradient-size"},"unidadeSaida":"%"}]},{"id":"duration","tipo":"time","padrao":10,"valor":10,"unidade":"s","min":2,"max":30,"vinculos":[{"propriedade":"animation-duration","alvo":{"tipo":"css-var","nome":"--kcx-animated-gradient-duration"},"unidadeSaida":"s"}]},{"id":"delay","tipo":"time","padrao":0,"valor":0,"unidade":"ms","min":0,"max":5000,"vinculos":[{"propriedade":"animation-delay","alvo":{"tipo":"css-var","nome":"--kcx-animated-gradient-delay"},"transformar":[{"op":"converter","para":"s"}],"unidadeSaida":"s"}]},{"id":"speed","tipo":"float","padrao":1,"valor":1,"unidade":"x","min":0.25,"max":4,"vinculos":[{"propriedade":"Divisor da duração","alvo":{"tipo":"css-var","nome":"--kcx-animated-gradient-speed"}}]},{"id":"easing","tipo":"enum","padrao":"ease-in-out","valor":"ease-in-out","vinculos":[{"propriedade":"animation-timing-function","alvo":{"tipo":"css-var","nome":"--kcx-animated-gradient-easing"},"transformar":[{"op":"mapa","valores":{"suave":"cubic-bezier(0.22, 1, 0.36, 1)","elastico":"cubic-bezier(0.34, 1.56, 0.64, 1)","ease-in-out":"ease-in-out","linear":"linear"}}]}]},{"id":"direction","tipo":"enum","padrao":"alternate","valor":"alternate","vinculos":[{"propriedade":"animation-direction","alvo":{"tipo":"css-var","nome":"--kcx-animated-gradient-direction"}}]},{"id":"loop","tipo":"boolean","padrao":true,"valor":true,"vinculos":[{"propriedade":"animation-iteration-count","alvo":{"tipo":"css-var","nome":"--kcx-animated-gradient-iterations"},"transformar":[{"op":"mapa","valores":{"true":"infinite","false":"1"}}]}]},{"id":"autoplay","tipo":"boolean","padrao":true,"valor":true,"vinculos":[{"propriedade":"animation-play-state","alvo":{"tipo":"css-var","nome":"--kcx-animated-gradient-play"},"transformar":[{"op":"mapa","valores":{"true":"running","false":"paused"}}]}]},{"id":"startPosition","tipo":"float","padrao":0,"valor":0,"unidade":"%","min":0,"max":100,"vinculos":[{"propriedade":"background-position inicial","alvo":{"tipo":"css-var","nome":"--kcx-animated-gradient-from"},"unidadeSaida":"%"}]},{"id":"endPosition","tipo":"float","padrao":100,"valor":100,"unidade":"%","min":0,"max":100,"vinculos":[{"propriedade":"background-position final","alvo":{"tipo":"css-var","nome":"--kcx-animated-gradient-to"},"unidadeSaida":"%"}]}] as const;

/**
 * Animated Gradient — Fundo em gradiente que desliza devagar entre uma posição inicial e uma final, com título sobreposto.
 * Cada input é uma variável KCX: mudar o valor muda o componente na hora.
 * Licença MIT.
 */
@Component({
  selector: 'kcx-animated-gradient',
  templateUrl: './animated-gradient.component.html',
  styleUrl: './animated-gradient.component.css',
  // Sem encapsulamento: as animações usam o nome do @keyframes vindo de uma custom property.
  // As classes já têm o prefixo kcx-animated-gradient, então não vazam para o resto da página.
  encapsulation: ViewEncapsulation.None,
  host: { '[style]': 'saidas().cssVars' },
})
export class KcxAnimatedGradient {
  /** Gradiente — Ângulo e paradas de cor. No Figma cada parada vira uma variável de cor. Controla: background-image do fundo. */
  readonly gradient = input<{ angulo: number; paradas: { cor: string; posicao: number }[] }>({"angulo":120,"paradas":[{"cor":"#ff2bd6","posicao":0},{"cor":"#8b5cf6","posicao":0.5},{"cor":"#22e3ff","posicao":1}]});

  /** Cor do texto — Cor do título. Controla: Cor do título. */
  readonly textColor = input<string>("#ffffff");

  /** Título — Texto sobre o fundo. Controla: Texto do título. */
  readonly title = input<string>("Gradiente animado");

  /** Tamanho do título — Tamanho da fonte do título. Controla: font-size do título. */
  readonly titleSize = input<number>(40);

  /** Largura — Largura da área (a altura segue 16:9). Controla: Largura; Altura (16:9). */
  readonly width = input<number>(640);

  /** Border radius — Arredondamento. Controla: Arredondamento. */
  readonly radius = input<number>(20);

  /** Tamanho do gradiente — Quanto o gradiente é maior que a caixa (folga para deslizar). Controla: background-size. */
  readonly size = input<number>(300);

  /** Duração do ciclo — Tempo de ida (antes da velocidade). Controla: animation-duration. */
  readonly duration = input<number>(10);

  /** Atraso — Espera antes de começar (em milissegundos; convertido para segundos no CSS). Controla: animation-delay. */
  readonly delay = input<number>(0);

  /** Velocidade — Divide a duração do ciclo. Controla: Divisor da duração. */
  readonly speed = input<number>(1);

  /** Easing — Curva de aceleração. Controla: animation-timing-function. */
  readonly easing = input<"suave" | "elastico" | "ease-in-out" | "linear">("ease-in-out");

  /** Direção — Sentido do movimento a cada repetição. Controla: animation-direction. */
  readonly direction = input<"alternate" | "normal" | "reverse">("alternate");

  /** Repetir — Repete para sempre ou roda uma vez. Controla: animation-iteration-count. */
  readonly loop = input<boolean>(true);

  /** Reprodução automática — Começa sozinho ou fica parado no estado inicial. Controla: animation-play-state. */
  readonly autoplay = input<boolean>(true);

  /** Estado inicial — Posição do gradiente no início (background-position). Controla: background-position inicial. */
  readonly startPosition = input<number>(0);

  /** Estado final — Posição do gradiente no fim. Controla: background-position final. */
  readonly endPosition = input<number>(100);

  /** Valores finais de cada propriedade vinculada. */
  protected readonly saidas = computed(() =>
    resolverKcx(VARIAVEIS, {
      gradient: this.gradient(),
      textColor: this.textColor(),
      title: this.title(),
      titleSize: this.titleSize(),
      width: this.width(),
      radius: this.radius(),
      size: this.size(),
      duration: this.duration(),
      delay: this.delay(),
      speed: this.speed(),
      easing: this.easing(),
      direction: this.direction(),
      loop: this.loop(),
      autoplay: this.autoplay(),
      startPosition: this.startPosition(),
      endPosition: this.endPosition(),
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
