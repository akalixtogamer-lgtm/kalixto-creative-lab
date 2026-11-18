import {
  Component,
  ElementRef,
  ViewEncapsulation,
  afterRenderEffect,
  computed,
  inject,
  input,
} from '@angular/core';
import { resolverKcx } from '../kcx-runtime';

/** Vínculos das variáveis (gerado pelo Kalixto Creative Lab — KCX animated-border v1.0.0). */
const VARIAVEIS = [
  {
    id: 'color1',
    tipo: 'color',
    padrao: '#ff2bd6',
    valor: '#ff2bd6',
    vinculos: [
      {
        propriedade: 'Cor 1 do conic-gradient da borda',
        alvo: { tipo: 'css-var', nome: '--kcx-animated-border-c1' },
      },
    ],
  },
  {
    id: 'color2',
    tipo: 'color',
    padrao: '#22e3ff',
    valor: '#22e3ff',
    vinculos: [
      {
        propriedade: 'Cor 2 do conic-gradient da borda',
        alvo: { tipo: 'css-var', nome: '--kcx-animated-border-c2' },
      },
    ],
  },
  {
    id: 'cardColor',
    tipo: 'color',
    padrao: '#0f0d1a',
    valor: '#0f0d1a',
    vinculos: [
      {
        propriedade: 'Fundo do card (padding-box)',
        alvo: { tipo: 'css-var', nome: '--kcx-animated-border-card' },
      },
    ],
  },
  {
    id: 'textColor',
    tipo: 'color',
    padrao: '#f4f2ff',
    valor: '#f4f2ff',
    vinculos: [
      {
        propriedade: 'Cor do título',
        alvo: { tipo: 'css-var', nome: '--kcx-animated-border-text' },
      },
    ],
  },
  {
    id: 'mutedColor',
    tipo: 'color',
    padrao: '#c9c3ea',
    valor: '#c9c3ea',
    vinculos: [
      {
        propriedade: 'Cor do parágrafo',
        alvo: { tipo: 'css-var', nome: '--kcx-animated-border-muted' },
      },
    ],
  },
  {
    id: 'borderWidth',
    tipo: 'dimension',
    padrao: 3,
    valor: 3,
    unidade: 'px',
    min: 1,
    max: 8,
    vinculos: [
      {
        propriedade: 'border-width',
        alvo: { tipo: 'css-var', nome: '--kcx-animated-border-border' },
        unidadeSaida: 'px',
      },
    ],
  },
  {
    id: 'radius',
    tipo: 'dimension',
    padrao: 20,
    valor: 20,
    unidade: 'px',
    min: 0,
    max: 40,
    vinculos: [
      {
        propriedade: 'border-radius',
        alvo: { tipo: 'css-var', nome: '--kcx-animated-border-radius' },
        unidadeSaida: 'px',
      },
    ],
  },
  {
    id: 'width',
    tipo: 'dimension',
    padrao: 320,
    valor: 320,
    unidade: 'px',
    min: 200,
    max: 520,
    vinculos: [
      {
        propriedade: 'width',
        alvo: { tipo: 'css-var', nome: '--kcx-animated-border-width' },
        unidadeSaida: 'px',
      },
    ],
  },
  {
    id: 'padding',
    tipo: 'dimension',
    padrao: 32,
    valor: 32,
    unidade: 'px',
    min: 12,
    max: 56,
    vinculos: [
      {
        propriedade: 'padding',
        alvo: { tipo: 'css-var', nome: '--kcx-animated-border-padding' },
        unidadeSaida: 'px',
      },
    ],
  },
  {
    id: 'gap',
    tipo: 'dimension',
    padrao: 6,
    valor: 6,
    unidade: 'px',
    min: 0,
    max: 24,
    vinculos: [
      {
        propriedade: 'gap',
        alvo: { tipo: 'css-var', nome: '--kcx-animated-border-gap' },
        unidadeSaida: 'px',
      },
    ],
  },
  {
    id: 'title',
    tipo: 'string',
    padrao: 'Plano Pro',
    valor: 'Plano Pro',
    vinculos: [
      {
        propriedade: 'Texto do título',
        alvo: { tipo: 'texto', seletor: '.kcx-animated-border__titulo' },
      },
    ],
  },
  {
    id: 'body',
    tipo: 'string',
    padrao: 'O card em destaque.',
    valor: 'O card em destaque.',
    vinculos: [
      {
        propriedade: 'Texto do parágrafo',
        alvo: { tipo: 'texto', seletor: '.kcx-animated-border__texto' },
      },
    ],
  },
  {
    id: 'startAngle',
    tipo: 'float',
    padrao: 0,
    valor: 0,
    unidade: 'deg',
    min: 0,
    max: 360,
    vinculos: [
      {
        propriedade: 'from do conic-gradient',
        alvo: { tipo: 'css-var', nome: '--kcx-animated-border-start' },
        unidadeSaida: 'deg',
      },
    ],
  },
  {
    id: 'duration',
    tipo: 'time',
    padrao: 4,
    valor: 4,
    unidade: 's',
    min: 1,
    max: 12,
    vinculos: [
      {
        propriedade: 'animation-duration',
        alvo: { tipo: 'css-var', nome: '--kcx-animated-border-duration' },
        unidadeSaida: 's',
      },
    ],
  },
  {
    id: 'speed',
    tipo: 'float',
    padrao: 1,
    valor: 1,
    unidade: 'x',
    min: 0.25,
    max: 4,
    vinculos: [
      {
        propriedade: 'Divisor da duração',
        alvo: { tipo: 'css-var', nome: '--kcx-animated-border-speed' },
      },
    ],
  },
  {
    id: 'direction',
    tipo: 'enum',
    padrao: 'normal',
    valor: 'normal',
    vinculos: [
      {
        propriedade: 'animation-direction',
        alvo: { tipo: 'css-var', nome: '--kcx-animated-border-direction' },
      },
    ],
  },
  {
    id: 'animate',
    tipo: 'boolean',
    padrao: true,
    valor: true,
    vinculos: [
      {
        propriedade: 'animation-name',
        alvo: { tipo: 'css-var', nome: '--kcx-animated-border-animation' },
        transformar: [
          { op: 'mapa', valores: { true: 'kcx-animated-border-girar', false: 'none' } },
        ],
      },
    ],
  },
] as const;

/**
 * Animated Border — Card com borda em gradiente cônico que gira em volta do conteúdo.
 * Cada input é uma variável KCX: mudar o valor muda o componente na hora.
 * Licença MIT.
 */
@Component({
  selector: 'kcx-animated-border',
  templateUrl: './animated-border.component.html',
  styleUrl: './animated-border.component.css',
  // Sem encapsulamento: as animações usam o nome do @keyframes vindo de uma custom property.
  // As classes já têm o prefixo kcx-animated-border, então não vazam para o resto da página.
  encapsulation: ViewEncapsulation.None,
  host: { '[style]': 'saidas().cssVars' },
})
export class KcxAnimatedBorder {
  /** Cor 1 — Cor que abre e fecha o giro da borda. Controla: Cor 1 do conic-gradient da borda. */
  readonly color1 = input<string>('#ff2bd6');

  /** Cor 2 — Cor do meio do giro. Controla: Cor 2 do conic-gradient da borda. */
  readonly color2 = input<string>('#22e3ff');

  /** Fundo do card — Fundo por dentro da borda. Controla: Fundo do card (padding-box). */
  readonly cardColor = input<string>('#0f0d1a');

  /** Cor do título — Cor do título. Controla: Cor do título. */
  readonly textColor = input<string>('#f4f2ff');

  /** Cor do texto — Cor do parágrafo. Controla: Cor do parágrafo. */
  readonly mutedColor = input<string>('#c9c3ea');

  /** Espessura da borda — Espessura da borda em gradiente. Controla: border-width. */
  readonly borderWidth = input<number>(3);

  /** Border radius — Arredondamento do card. Controla: border-radius. */
  readonly radius = input<number>(20);

  /** Largura — Largura do card (a altura acompanha o conteúdo). Controla: width. */
  readonly width = input<number>(320);

  /** Espaçamento interno — Padding do card. Controla: padding. */
  readonly padding = input<number>(32);

  /** Espaço entre textos — Distância entre o título e o parágrafo. Controla: gap. */
  readonly gap = input<number>(6);

  /** Título — Título do card. Controla: Texto do título. */
  readonly title = input<string>('Plano Pro');

  /** Texto — Parágrafo do card. Controla: Texto do parágrafo. */
  readonly body = input<string>('O card em destaque.');

  /** Ângulo inicial — Onde o gradiente começa (e o ponto de partida do giro). Controla: from do conic-gradient. */
  readonly startAngle = input<number>(0);

  /** Tempo de uma volta — Duração de um giro completo (antes da velocidade). Controla: animation-duration. */
  readonly duration = input<number>(4);

  /** Velocidade — Divide a duração da volta. Controla: Divisor da duração. */
  readonly speed = input<number>(1);

  /** Sentido — Sentido do giro. Controla: animation-direction. */
  readonly direction = input<'normal' | 'reverse'>('normal');

  /** Girar — Liga ou desliga o giro (a borda continua no ângulo inicial). Controla: animation-name. */
  readonly animate = input<boolean>(true);

  /** Valores finais de cada propriedade vinculada. */
  protected readonly saidas = computed(() =>
    resolverKcx(VARIAVEIS, {
      color1: this.color1(),
      color2: this.color2(),
      cardColor: this.cardColor(),
      textColor: this.textColor(),
      mutedColor: this.mutedColor(),
      borderWidth: this.borderWidth(),
      radius: this.radius(),
      width: this.width(),
      padding: this.padding(),
      gap: this.gap(),
      title: this.title(),
      body: this.body(),
      startAngle: this.startAngle(),
      duration: this.duration(),
      speed: this.speed(),
      direction: this.direction(),
      animate: this.animate(),
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
      for (const t of s.textos)
        raiz.querySelectorAll(t.seletor).forEach((n) => (n.textContent = t.valor));
    });
  }
}
