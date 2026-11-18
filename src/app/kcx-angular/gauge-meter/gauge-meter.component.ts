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

/** Vínculos das variáveis (gerado pelo Kalixto Creative Lab — KCX gauge-meter v1.0.0). */
const VARIAVEIS = [
  {
    id: 'value',
    tipo: 'number',
    padrao: 82,
    valor: 82,
    min: 0,
    max: 100,
    vinculos: [
      {
        propriedade: 'Número exibido (contador)',
        alvo: { tipo: 'css-var', nome: '--kcx-gauge-meter-value' },
      },
      {
        propriedade: 'Fração do arco preenchida',
        alvo: { tipo: 'css-var', nome: '--kcx-gauge-meter-frac' },
        transformar: [{ op: 'mapear', de: [0, 100], para: [0, 1] }],
      },
      {
        propriedade: 'aria-valuenow',
        alvo: { tipo: 'atributo', seletor: '.kcx-gauge-meter', atributo: 'aria-valuenow' },
      },
    ],
  },
  {
    id: 'arcColor',
    tipo: 'color',
    padrao: '#ffb547',
    valor: '#ffb547',
    vinculos: [
      {
        propriedade: 'stroke do arco, brilho e número',
        alvo: { tipo: 'css-var', nome: '--kcx-gauge-meter-arc' },
      },
    ],
  },
  {
    id: 'trackColor',
    tipo: 'color',
    padrao: '#ffffff1a',
    valor: '#ffffff1a',
    vinculos: [
      {
        propriedade: 'stroke do trilho',
        alvo: { tipo: 'css-var', nome: '--kcx-gauge-meter-track' },
      },
    ],
  },
  {
    id: 'labelColor',
    tipo: 'color',
    padrao: '#c9c3ea',
    valor: '#c9c3ea',
    vinculos: [
      { propriedade: 'Cor do rótulo', alvo: { tipo: 'css-var', nome: '--kcx-gauge-meter-label' } },
    ],
  },
  {
    id: 'size',
    tipo: 'dimension',
    padrao: 240,
    valor: 240,
    unidade: 'px',
    min: 140,
    max: 360,
    vinculos: [
      {
        propriedade: 'width do medidor',
        alvo: { tipo: 'css-var', nome: '--kcx-gauge-meter-size' },
        unidadeSaida: 'px',
      },
    ],
  },
  {
    id: 'thickness',
    tipo: 'dimension',
    padrao: 12,
    valor: 12,
    unidade: 'px',
    min: 4,
    max: 24,
    vinculos: [
      {
        propriedade: 'stroke-width',
        alvo: { tipo: 'css-var', nome: '--kcx-gauge-meter-thickness' },
      },
    ],
  },
  {
    id: 'glow',
    tipo: 'dimension',
    padrao: 8,
    valor: 8,
    unidade: 'px',
    min: 0,
    max: 20,
    vinculos: [
      {
        propriedade: 'drop-shadow do arco',
        alvo: { tipo: 'css-var', nome: '--kcx-gauge-meter-glow' },
        unidadeSaida: 'px',
      },
    ],
  },
  {
    id: 'label',
    tipo: 'string',
    padrao: 'nota de velocidade',
    valor: 'nota de velocidade',
    vinculos: [
      {
        propriedade: 'Texto do rótulo',
        alvo: { tipo: 'texto', seletor: '.kcx-gauge-meter__rotulo' },
      },
    ],
  },
  {
    id: 'duration',
    tipo: 'time',
    padrao: 1600,
    valor: 1600,
    unidade: 'ms',
    min: 300,
    max: 4000,
    vinculos: [
      {
        propriedade: 'animation-duration',
        alvo: { tipo: 'css-var', nome: '--kcx-gauge-meter-duration' },
        unidadeSaida: 'ms',
      },
    ],
  },
  {
    id: 'easing',
    tipo: 'enum',
    padrao: 'suave',
    valor: 'suave',
    vinculos: [
      {
        propriedade: 'animation-timing-function',
        alvo: { tipo: 'css-var', nome: '--kcx-gauge-meter-easing' },
        transformar: [
          {
            op: 'mapa',
            valores: {
              suave: 'cubic-bezier(0.22, 1, 0.36, 1)',
              elastico: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
              'ease-in-out': 'ease-in-out',
              linear: 'linear',
            },
          },
        ],
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
        alvo: { tipo: 'css-var', nome: '--kcx-gauge-meter-animation' },
        transformar: [{ op: 'mapa', valores: { true: 'kcx-gauge-meter-encher', false: 'none' } }],
      },
    ],
  },
] as const;

/**
 * Gauge Meter — Medidor circular de 270° que enche até a nota, com o número contando junto.
 * Cada input é uma variável KCX: mudar o valor muda o componente na hora.
 * Licença MIT.
 */
@Component({
  selector: 'kcx-gauge-meter',
  templateUrl: './gauge-meter.component.html',
  styleUrl: './gauge-meter.component.css',
  // Sem encapsulamento: as animações usam o nome do @keyframes vindo de uma custom property.
  // As classes já têm o prefixo kcx-gauge-meter, então não vazam para o resto da página.
  encapsulation: ViewEncapsulation.None,
  host: { '[style]': 'saidas().cssVars' },
})
export class KcxGaugeMeter {
  /** Nota — Valor de 0 a 100: o arco, o número e o aria-valuenow acompanham. Controla: Número exibido (contador); Fração do arco preenchida; aria-valuenow. */
  readonly value = input<number>(82);

  /** Cor do arco — Cor do arco preenchido, do brilho e do número. Controla: stroke do arco, brilho e número. */
  readonly arcColor = input<string>('#ffb547');

  /** Cor do trilho — Cor do arco de fundo. Controla: stroke do trilho. */
  readonly trackColor = input<string>('#ffffff1a');

  /** Cor do rótulo — Cor do texto abaixo do número. Controla: Cor do rótulo. */
  readonly labelColor = input<string>('#c9c3ea');

  /** Tamanho — Largura e altura do medidor. Controla: width do medidor. */
  readonly size = input<number>(240);

  /** Espessura do arco — Espessura do trilho e do arco (no viewBox de 200). Controla: stroke-width. */
  readonly thickness = input<number>(12);

  /** Brilho — Desfoque do brilho do arco. Controla: drop-shadow do arco. */
  readonly glow = input<number>(8);

  /** Rótulo — Texto abaixo do número. Controla: Texto do rótulo. */
  readonly label = input<string>('nota de velocidade');

  /** Tempo para encher — Duração da animação de entrada. Controla: animation-duration. */
  readonly duration = input<number>(1600);

  /** Easing — Curva da animação (o número usa a mesma). Controla: animation-timing-function. */
  readonly easing = input<'suave' | 'elastico' | 'ease-in-out' | 'linear'>('suave');

  /** Animar ao aparecer — Enche do zero ao aparecer; desligado, já mostra o valor. Controla: animation-name. */
  readonly animate = input<boolean>(true);

  /** Valores finais de cada propriedade vinculada. */
  protected readonly saidas = computed(() =>
    resolverKcx(VARIAVEIS, {
      value: this.value(),
      arcColor: this.arcColor(),
      trackColor: this.trackColor(),
      labelColor: this.labelColor(),
      size: this.size(),
      thickness: this.thickness(),
      glow: this.glow(),
      label: this.label(),
      duration: this.duration(),
      easing: this.easing(),
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
