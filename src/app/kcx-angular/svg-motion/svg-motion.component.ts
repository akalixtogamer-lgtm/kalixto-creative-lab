import { Component, ElementRef, ViewEncapsulation, afterRenderEffect, computed, inject, input } from '@angular/core';
import { resolverKcx } from '../kcx-runtime';

/** Vínculos das variáveis (gerado pelo Kalixto Creative Lab — KCX svg-motion v1.0.0). */
const VARIAVEIS = [{"id":"strokeColor","tipo":"color","padrao":"#22e3ff","valor":"#22e3ff","vinculos":[{"propriedade":"stroke da linha e da trilha","alvo":{"tipo":"css-var","nome":"--kcx-svg-motion-stroke"}}]},{"id":"accentColor","tipo":"color","padrao":"#ff2bd6","valor":"#ff2bd6","vinculos":[{"propriedade":"Fundo e brilho do ponto","alvo":{"tipo":"css-var","nome":"--kcx-svg-motion-accent"}}]},{"id":"strokeWidth","tipo":"dimension","padrao":4,"valor":4,"unidade":"px","min":1,"max":12,"vinculos":[{"propriedade":"stroke-width","alvo":{"tipo":"css-var","nome":"--kcx-svg-motion-width"}}]},{"id":"trailOpacity","tipo":"float","padrao":0.2,"valor":0.2,"min":0,"max":1,"vinculos":[{"propriedade":"Opacidade da trilha","alvo":{"tipo":"css-var","nome":"--kcx-svg-motion-trail"}}]},{"id":"dotSize","tipo":"dimension","padrao":14,"valor":14,"unidade":"px","min":4,"max":32,"vinculos":[{"propriedade":"Largura, altura e brilho do ponto","alvo":{"tipo":"css-var","nome":"--kcx-svg-motion-dot"},"unidadeSaida":"px"}]},{"id":"shape","tipo":"enum","padrao":"onda","valor":"onda","vinculos":[{"propriedade":"Atributo d dos paths","alvo":{"tipo":"atributo","seletor":".kcx-svg-motion path","atributo":"d"},"transformar":[{"op":"mapa","valores":{"onda":"M 10 80 C 60 10 110 10 160 80 S 260 150 310 80 S 380 20 390 40","laco":"M 20 120 C 80 120 120 20 200 30 C 280 40 260 140 200 130 C 140 120 170 40 380 40","zigue":"M 10 130 L 80 30 L 150 130 L 220 30 L 290 130 L 390 30"}}]},{"propriedade":"offset-path do ponto","alvo":{"tipo":"css-var","nome":"--kcx-svg-motion-path"},"transformar":[{"op":"mapa","valores":{"onda":"path(\"M 10 80 C 60 10 110 10 160 80 S 260 150 310 80 S 380 20 390 40\")","laco":"path(\"M 20 120 C 80 120 120 20 200 30 C 280 40 260 140 200 130 C 140 120 170 40 380 40\")","zigue":"path(\"M 10 130 L 80 30 L 150 130 L 220 30 L 290 130 L 390 30\")"}}]}]},{"id":"duration","tipo":"time","padrao":3,"valor":3,"unidade":"s","min":0.5,"max":10,"vinculos":[{"propriedade":"animation-duration","alvo":{"tipo":"css-var","nome":"--kcx-svg-motion-duration"},"unidadeSaida":"s"}]},{"id":"delay","tipo":"time","padrao":0,"valor":0,"unidade":"s","min":0,"max":3,"vinculos":[{"propriedade":"animation-delay","alvo":{"tipo":"css-var","nome":"--kcx-svg-motion-delay"},"unidadeSaida":"s"}]},{"id":"speed","tipo":"float","padrao":1,"valor":1,"unidade":"x","min":0.25,"max":4,"vinculos":[{"propriedade":"Divisor da duração","alvo":{"tipo":"css-var","nome":"--kcx-svg-motion-speed"}}]},{"id":"easing","tipo":"enum","padrao":"suave","valor":"suave","vinculos":[{"propriedade":"animation-timing-function","alvo":{"tipo":"css-var","nome":"--kcx-svg-motion-easing"},"transformar":[{"op":"mapa","valores":{"suave":"cubic-bezier(0.22, 1, 0.36, 1)","elastico":"cubic-bezier(0.34, 1.56, 0.64, 1)","ease-in-out":"ease-in-out","linear":"linear"}}]}]},{"id":"direction","tipo":"enum","padrao":"alternate","valor":"alternate","vinculos":[{"propriedade":"animation-direction","alvo":{"tipo":"css-var","nome":"--kcx-svg-motion-direction"}}]},{"id":"loop","tipo":"boolean","padrao":true,"valor":true,"vinculos":[{"propriedade":"animation-iteration-count","alvo":{"tipo":"css-var","nome":"--kcx-svg-motion-iterations"},"transformar":[{"op":"mapa","valores":{"true":"infinite","false":"1"}}]}]},{"id":"autoplay","tipo":"boolean","padrao":true,"valor":true,"vinculos":[{"propriedade":"Animação da linha","alvo":{"tipo":"css-var","nome":"--kcx-svg-motion-anim-linha"},"transformar":[{"op":"mapa","valores":{"true":"kcx-svg-motion-desenhar","false":"none"}}]},{"propriedade":"Animação do ponto","alvo":{"tipo":"css-var","nome":"--kcx-svg-motion-anim-ponto"},"transformar":[{"op":"mapa","valores":{"true":"kcx-svg-motion-percorrer","false":"none"}}]}]},{"id":"progress","tipo":"float","padrao":1,"valor":1,"min":0,"max":1,"vinculos":[{"propriedade":"stroke-dashoffset da linha","alvo":{"tipo":"css-var","nome":"--kcx-svg-motion-offset"},"transformar":[{"op":"mapear","de":[0,1],"para":[1,0]}]},{"propriedade":"offset-distance do ponto","alvo":{"tipo":"css-var","nome":"--kcx-svg-motion-distance"},"transformar":[{"op":"multiplicar","fator":100}],"unidadeSaida":"%"}]}] as const;

/**
 * SVG Motion — Linha SVG que se desenha e um ponto luminoso que percorre o mesmo caminho, com forma, tempo e progresso controlados por variáveis.
 * Cada input é uma variável KCX: mudar o valor muda o componente na hora.
 * Licença MIT.
 */
@Component({
  selector: 'kcx-svg-motion',
  templateUrl: './svg-motion.component.html',
  styleUrl: './svg-motion.component.css',
  // Sem encapsulamento: as animações usam o nome do @keyframes vindo de uma custom property.
  // As classes já têm o prefixo kcx-svg-motion, então não vazam para o resto da página.
  encapsulation: ViewEncapsulation.None,
  host: { '[style]': 'saidas().cssVars' },
})
export class KcxSvgMotion {
  /** Cor da linha — Cor do traço e da trilha. Controla: stroke da linha e da trilha. */
  readonly strokeColor = input<string>("#22e3ff");

  /** Cor do ponto — Cor e brilho do ponto que percorre o caminho. Controla: Fundo e brilho do ponto. */
  readonly accentColor = input<string>("#ff2bd6");

  /** Espessura — Espessura do traço. Controla: stroke-width. */
  readonly strokeWidth = input<number>(4);

  /** Opacidade da trilha — Opacidade do caminho completo, por baixo da linha desenhada. Controla: Opacidade da trilha. */
  readonly trailOpacity = input<number>(0.2);

  /** Tamanho do ponto — Diâmetro do ponto (o brilho acompanha). Controla: Largura, altura e brilho do ponto. */
  readonly dotSize = input<number>(14);

  /** Forma do caminho — Troca o desenho do caminho. No Figma vira uma propriedade de variante. Controla: Atributo d dos paths; offset-path do ponto. */
  readonly shape = input<"onda" | "laco" | "zigue">("onda");

  /** Duração — Tempo para percorrer o caminho (antes da velocidade). Controla: animation-duration. */
  readonly duration = input<number>(3);

  /** Atraso — Espera antes de começar. Controla: animation-delay. */
  readonly delay = input<number>(0);

  /** Velocidade — Divide a duração. Controla: Divisor da duração. */
  readonly speed = input<number>(1);

  /** Easing — Curva de aceleração. Controla: animation-timing-function. */
  readonly easing = input<"suave" | "elastico" | "ease-in-out" | "linear">("suave");

  /** Direção — Sentido a cada repetição. Controla: animation-direction. */
  readonly direction = input<"alternate" | "normal" | "reverse">("alternate");

  /** Repetir — Repete para sempre ou roda uma vez. Controla: animation-iteration-count. */
  readonly loop = input<boolean>(true);

  /** Reprodução automática — Anima sozinho; desligado, o desenho para no progresso escolhido. Controla: Animação da linha; Animação do ponto. */
  readonly autoplay = input<boolean>(true);

  /** Progresso (parado) — Quanto do caminho aparece quando a animação está desligada (e com movimento reduzido). Controla: stroke-dashoffset da linha; offset-distance do ponto. */
  readonly progress = input<number>(1);

  /** Valores finais de cada propriedade vinculada. */
  protected readonly saidas = computed(() =>
    resolverKcx(VARIAVEIS, {
      strokeColor: this.strokeColor(),
      accentColor: this.accentColor(),
      strokeWidth: this.strokeWidth(),
      trailOpacity: this.trailOpacity(),
      dotSize: this.dotSize(),
      shape: this.shape(),
      duration: this.duration(),
      delay: this.delay(),
      speed: this.speed(),
      easing: this.easing(),
      direction: this.direction(),
      loop: this.loop(),
      autoplay: this.autoplay(),
      progress: this.progress(),
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
