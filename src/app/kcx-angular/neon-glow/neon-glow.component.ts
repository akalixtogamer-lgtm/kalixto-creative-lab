import { Component, ElementRef, ViewEncapsulation, afterRenderEffect, computed, inject, input } from '@angular/core';
import { resolverKcx } from '../kcx-runtime';

/** Vínculos das variáveis (gerado pelo Kalixto Creative Lab — KCX neon-glow v1.0.0). */
const VARIAVEIS = [{"id":"primaryColor","tipo":"color","padrao":"#ff2bd6","valor":"#ff2bd6","vinculos":[{"propriedade":"Borda, sombra e início do halo","alvo":{"tipo":"css-var","nome":"--kcx-neon-glow-primary"}}]},{"id":"secondaryColor","tipo":"color","padrao":"#22e3ff","valor":"#22e3ff","vinculos":[{"propriedade":"Fim do halo e contorno de foco","alvo":{"tipo":"css-var","nome":"--kcx-neon-glow-secondary"}}]},{"id":"backgroundColor","tipo":"color","padrao":"#0f0d1a","valor":"#0f0d1a","vinculos":[{"propriedade":"Fundo do botão","alvo":{"tipo":"css-var","nome":"--kcx-neon-glow-bg"}}]},{"id":"textColor","tipo":"color","padrao":"#ffffff","valor":"#ffffff","vinculos":[{"propriedade":"Cor do rótulo","alvo":{"tipo":"css-var","nome":"--kcx-neon-glow-text"}}]},{"id":"glowIntensity","tipo":"float","padrao":1,"valor":1,"unidade":"x","min":0,"max":2,"vinculos":[{"propriedade":"Transparência das camadas luminosas (halo)","alvo":{"tipo":"css-var","nome":"--kcx-neon-glow-layer-alpha"},"transformar":[{"op":"mapear","de":[0,2],"para":[0.15,0.85]},{"op":"limitar","min":0,"max":1}]},{"propriedade":"Intensidade do filtro (brightness)","alvo":{"tipo":"css-var","nome":"--kcx-neon-glow-filter"},"transformar":[{"op":"mapear","de":[0,2],"para":[0.9,1.6]}]},{"propriedade":"Alcance visual da sombra (intensidade × distância)","alvo":{"tipo":"css-var","nome":"--kcx-neon-glow-reach"},"transformar":[{"op":"multiplicarPorVariavel","variavel":"glowDistance"},{"op":"limitar","min":0,"max":160}],"unidadeSaida":"px"},{"propriedade":"Opacidade do brilho interno (inset)","alvo":{"tipo":"css-var","nome":"--kcx-neon-glow-inner"},"transformar":[{"op":"mapear","de":[0,2],"para":[0,0.6]}]}]},{"id":"glowDistance","tipo":"dimension","padrao":24,"valor":24,"unidade":"px","min":0,"max":80,"vinculos":[{"propriedade":"Afastamento do halo","alvo":{"tipo":"css-var","nome":"--kcx-neon-glow-distance"},"unidadeSaida":"px"}]},{"id":"blur","tipo":"dimension","padrao":14,"valor":14,"unidade":"px","min":0,"max":40,"vinculos":[{"propriedade":"Desfoque do halo","alvo":{"tipo":"css-var","nome":"--kcx-neon-glow-blur"},"unidadeSaida":"px"}]},{"id":"opacity","tipo":"float","padrao":1,"valor":1,"min":0,"max":1,"vinculos":[{"propriedade":"Opacidade do componente","alvo":{"tipo":"css-var","nome":"--kcx-neon-glow-opacity"}}]},{"id":"borderWidth","tipo":"dimension","padrao":2,"valor":2,"unidade":"px","min":0,"max":8,"vinculos":[{"propriedade":"Espessura da borda","alvo":{"tipo":"css-var","nome":"--kcx-neon-glow-border"},"unidadeSaida":"px"}]},{"id":"radius","tipo":"dimension","padrao":12,"valor":12,"unidade":"px","min":0,"max":40,"vinculos":[{"propriedade":"Arredondamento","alvo":{"tipo":"css-var","nome":"--kcx-neon-glow-radius"},"unidadeSaida":"px"}]},{"id":"paddingX","tipo":"dimension","padrao":32,"valor":32,"unidade":"px","min":12,"max":64,"vinculos":[{"propriedade":"Padding lateral","alvo":{"tipo":"css-var","nome":"--kcx-neon-glow-px"},"unidadeSaida":"px"}]},{"id":"paddingY","tipo":"dimension","padrao":14,"valor":14,"unidade":"px","min":6,"max":32,"vinculos":[{"propriedade":"Padding vertical","alvo":{"tipo":"css-var","nome":"--kcx-neon-glow-py"},"unidadeSaida":"px"}]},{"id":"label","tipo":"string","padrao":"Ao vivo","valor":"Ao vivo","vinculos":[{"propriedade":"Texto do botão","alvo":{"tipo":"texto","seletor":".kcx-neon-glow__rotulo"}}]},{"id":"pulseDuration","tipo":"time","padrao":2,"valor":2,"unidade":"s","min":0.4,"max":6,"vinculos":[{"propriedade":"animation-duration do halo","alvo":{"tipo":"css-var","nome":"--kcx-neon-glow-duration"},"unidadeSaida":"s"}]},{"id":"speed","tipo":"float","padrao":1,"valor":1,"unidade":"x","min":0.25,"max":4,"vinculos":[{"propriedade":"Divisor da duração do pulso","alvo":{"tipo":"css-var","nome":"--kcx-neon-glow-speed"}},{"propriedade":"Duração das transições (hover e foco)","alvo":{"tipo":"css-var","nome":"--kcx-neon-glow-transition"},"transformar":[{"op":"dividir","numerador":240},{"op":"arredondar","casas":0}],"unidadeSaida":"ms"}]},{"id":"animate","tipo":"boolean","padrao":true,"valor":true,"vinculos":[{"propriedade":"animation-name do halo","alvo":{"tipo":"css-var","nome":"--kcx-neon-glow-animation"},"transformar":[{"op":"mapa","valores":{"true":"kcx-neon-glow-pulsar","false":"none"}}]}]},{"id":"glowEnabled","tipo":"boolean","padrao":true,"valor":true,"vinculos":[{"propriedade":"Visibilidade do halo","alvo":{"tipo":"css-var","nome":"--kcx-neon-glow-enabled"},"transformar":[{"op":"mapa","valores":{"true":"1","false":"0"}}]}]},{"id":"hoverBoost","tipo":"float","padrao":1.5,"valor":1.5,"unidade":"x","min":1,"max":2,"vinculos":[{"propriedade":"Escala do halo e da sombra no hover/foco","alvo":{"tipo":"css-var","nome":"--kcx-neon-glow-hover"}}]}] as const;

/**
 * Neon Glow — Botão com halo neon em gradiente que pulsa, com brilho, distância e desfoque controlados por variáveis.
 * Cada input é uma variável KCX: mudar o valor muda o componente na hora.
 * Licença MIT.
 */
@Component({
  selector: 'kcx-neon-glow',
  templateUrl: './neon-glow.component.html',
  styleUrl: './neon-glow.component.css',
  // Sem encapsulamento: as animações usam o nome do @keyframes vindo de uma custom property.
  // As classes já têm o prefixo kcx-neon-glow, então não vazam para o resto da página.
  encapsulation: ViewEncapsulation.None,
  host: { '[style]': 'saidas().cssVars' },
})
export class KcxNeonGlow {
  /** Cor principal — Borda do botão, sombra luminosa e início do halo. Controla: Borda, sombra e início do halo. */
  readonly primaryColor = input<string>("#ff2bd6");

  /** Cor secundária — Fim do halo e contorno de foco. Controla: Fim do halo e contorno de foco. */
  readonly secondaryColor = input<string>("#22e3ff");

  /** Cor de fundo — Fundo do botão. Controla: Fundo do botão. */
  readonly backgroundColor = input<string>("#0f0d1a");

  /** Cor do texto — Cor do rótulo. Controla: Cor do rótulo. */
  readonly textColor = input<string>("#ffffff");

  /** Intensidade do brilho — Variável vinculada: controla ao mesmo tempo a opacidade do halo, o filtro de brilho, o alcance da sombra e a transparência das camadas de luz. Controla: Transparência das camadas luminosas (halo); Intensidade do filtro (brightness); Alcance visual da sombra (intensidade × distância); Opacidade do brilho interno (inset). */
  readonly glowIntensity = input<number>(1);

  /** Distância do brilho — Quanto o halo se afasta do botão. Controla: Afastamento do halo. */
  readonly glowDistance = input<number>(24);

  /** Desfoque — Desfoque do halo (filter: blur). No Figma: desfoque da camada. Controla: Desfoque do halo. */
  readonly blur = input<number>(14);

  /** Opacidade — Opacidade do componente inteiro. Controla: Opacidade do componente. */
  readonly opacity = input<number>(1);

  /** Espessura da borda — Espessura da borda neon. Controla: Espessura da borda. */
  readonly borderWidth = input<number>(2);

  /** Border radius — Arredondamento do botão e do halo. Controla: Arredondamento. */
  readonly radius = input<number>(12);

  /** Espaçamento horizontal — Padding lateral do botão. Controla: Padding lateral. */
  readonly paddingX = input<number>(32);

  /** Espaçamento vertical — Padding vertical do botão. Controla: Padding vertical. */
  readonly paddingY = input<number>(14);

  /** Rótulo — Texto do botão. Controla: Texto do botão. */
  readonly label = input<string>("Ao vivo");

  /** Duração da pulsação — Tempo de um ciclo do pulso (antes da velocidade). Controla: animation-duration do halo. */
  readonly pulseDuration = input<number>(2);

  /** Velocidade — Variável vinculada: divide a duração do pulso e acelera as transições de hover. Controla: Divisor da duração do pulso; Duração das transições (hover e foco). */
  readonly speed = input<number>(1);

  /** Ativar animação — Liga ou desliga a pulsação. Controla: animation-name do halo. */
  readonly animate = input<boolean>(true);

  /** Ativar brilho — Mostra ou esconde o halo. No Figma controla a visibilidade da camada. Controla: Visibilidade do halo. */
  readonly glowEnabled = input<boolean>(true);

  /** Reforço no hover — Multiplica o alcance do brilho no hover e no foco. Controla: Escala do halo e da sombra no hover/foco. */
  readonly hoverBoost = input<number>(1.5);

  /** Valores finais de cada propriedade vinculada. */
  protected readonly saidas = computed(() =>
    resolverKcx(VARIAVEIS, {
      primaryColor: this.primaryColor(),
      secondaryColor: this.secondaryColor(),
      backgroundColor: this.backgroundColor(),
      textColor: this.textColor(),
      glowIntensity: this.glowIntensity(),
      glowDistance: this.glowDistance(),
      blur: this.blur(),
      opacity: this.opacity(),
      borderWidth: this.borderWidth(),
      radius: this.radius(),
      paddingX: this.paddingX(),
      paddingY: this.paddingY(),
      label: this.label(),
      pulseDuration: this.pulseDuration(),
      speed: this.speed(),
      animate: this.animate(),
      glowEnabled: this.glowEnabled(),
      hoverBoost: this.hoverBoost(),
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
