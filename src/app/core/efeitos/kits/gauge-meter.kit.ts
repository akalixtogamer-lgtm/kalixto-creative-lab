import { EffectKit } from '../../models/effect-sheet.model';
import { MDN, VALIDADO_EM, cssAngular, cssPalco, nomeClasse } from './_base';

/** Comprimento do arco de 270° num círculo de raio 80 (2π × 80 × 0,75). */
const ARCO = 377;

export const GAUGE_METER: EffectKit = {
  ficha: {
    id: 'gauge-meter',
    nomeTecnico: 'Radial Gauge (SVG stroke-dashoffset)',
    nomeAmigavel: 'Medidor de nota (gauge)',
    categoria: 'componentes-dados',
    subcategoria: 'Progresso e estados',
    descricao:
      'Um velocímetro circular enche até a nota, enquanto o número conta junto e a cor muda conforme a faixa: vermelho, amarelo ou verde.',
    objetivoVisual:
      'Transformar um número (nota de velocidade, nível, satisfação) num indicador imediato e com emoção.',
    aplicacoes: [
      'Relatórios de desempenho (Lighthouse, PageSpeed)',
      'Dashboards e KPIs',
      'Resultados de testes e quizzes',
    ],
    nivel: 'intermediario',
    tecnologias: ['HTML', 'SVG', 'CSS', 'JavaScript'],
    dependencias: [],
    interacoes: ['autoplay', 'click'],
    tags: [
      'gauge',
      'medidor',
      'velocímetro',
      'progresso circular',
      'stroke-dashoffset',
      'svg',
      'kpi',
      'referência em vídeo',
    ],
    explicacao: [
      'O medidor são dois arcos de SVG iguais, de 270°: o de fundo, apagado, e o de valor, colorido. stroke-dasharray com o comprimento do arco faz o traço ser "um pedaço só".',
      'stroke-dashoffset esconde parte do traço: comprimento × (1 − valor/100). Com transition, o arco enche sozinho até a nota.',
      'O número conta de 0 até a nota no mesmo tempo, com requestAnimationFrame e a mesma curva.',
      'A cor vem da faixa: abaixo de 50 vermelho, até 89 amarelo, a partir de 90 verde — como nos relatórios de velocidade de site.',
    ],
    alternativa:
      'Em CSS puro: conic-gradient com uma variável @property animável (--valor) dá um anel sem SVG; Canvas ou bibliotecas de gráficos servem para medidores com ponteiro e marcas.',
    compatibilidade: 'SVG com stroke-dashoffset e transições: todos os navegadores atuais.',
    responsividade: 'O SVG usa viewBox e escala com a largura; o número usa clamp().',
    acessibilidade:
      'O medidor tem role="meter" com aria-valuenow, valuemin e valuemax, e a nota aparece em texto. Com prefers-reduced-motion o arco e o número já mostram o valor final.',
    performance:
      'Uma transição de stroke-dashoffset e um textContent por quadro durante a contagem.',
    limitacoes: [
      'O comprimento do arco (377) depende do raio; mudando o raio, recalcule 2πr × 0,75.',
    ],
    referencias: [
      {
        titulo: 'MDN — stroke-dasharray',
        url: 'https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dasharray',
      },
      {
        titulo: 'MDN — ARIA: meter role',
        url: 'https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/meter_role',
      },
      MDN.reduzir,
    ],
    validadoEm: VALIDADO_EM,
    status: 'validado',
  },
  params: [
    {
      id: 'valor',
      rotulo: 'nota',
      tipo: 'range',
      min: 0,
      max: 100,
      passo: 1,
      unidade: '',
      padrao: 82,
    },
    {
      id: 'duracao',
      rotulo: 'tempo para encher',
      tipo: 'range',
      min: 600,
      max: 3000,
      passo: 100,
      unidade: 'ms',
      padrao: 1600,
    },
    {
      id: 'espessura',
      rotulo: 'espessura do arco',
      tipo: 'range',
      min: 6,
      max: 20,
      passo: 1,
      unidade: 'px',
      padrao: 12,
    },
  ],
  gerar: (v) => {
    const valor = Number(v['valor']);
    const cor = valor < 50 ? '#ff4e5e' : valor < 90 ? '#ffb547' : '#2ee59d';
    const faixa = valor < 50 ? 'lenta' : valor < 90 ? 'média' : 'rápida';
    return {
      html: `<section class="medidor" role="meter" aria-label="Nota de velocidade" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${valor}">
  <svg viewBox="0 0 200 200" aria-hidden="true">
    <circle class="trilho" cx="100" cy="100" r="80" />
    <circle class="valor" cx="100" cy="100" r="80" />
  </svg>
  <div class="leitura">
    <span class="numero">0</span>
    <span class="rotulo">nota de velocidade · ${faixa}</span>
  </div>
</section>
<button class="repetir" type="button">Repetir</button>`,
      css: `${cssPalco()}

.medidor {
  --cor: ${cor};
  position: relative;
  display: grid;
  place-items: center;
  width: min(80vw, 300px);
}
.medidor svg { width: 100%; rotate: 135deg; } /* começa embaixo à esquerda */
.medidor circle {
  fill: none;
  stroke-width: ${v['espessura']}px;
  stroke-linecap: round;
  /* arco de 270°: traço do tamanho do arco + vazio que esconde o resto do círculo */
  stroke-dasharray: ${ARCO} 1000;
}
.trilho { stroke: rgb(255 255 255 / 0.1); }
.valor {
  stroke: var(--cor);
  stroke-dashoffset: ${ARCO};
  filter: drop-shadow(0 0 8px var(--cor));
  transition: stroke-dashoffset ${v['duracao']}ms cubic-bezier(0.22, 1, 0.36, 1);
}
.medidor.is-cheio .valor { stroke-dashoffset: ${Math.round(ARCO * (1 - valor / 100))}; }

.leitura { position: absolute; display: grid; place-items: center; gap: 4px; }
.numero {
  color: var(--cor);
  font: 800 clamp(3rem, 14vw, 4.5rem) / 1 system-ui, sans-serif;
  font-variant-numeric: tabular-nums;
}
.rotulo { max-width: 9em; color: #c9c3ea; font-size: 11px; letter-spacing: 0.1em; line-height: 1.3; text-align: center; text-transform: uppercase; }

.repetir {
  padding: 8px 16px;
  border: 1px solid #3a3456;
  border-radius: 999px;
  background: transparent;
  color: #c9c3ea;
  font: inherit;
  cursor: pointer;
}

@media (prefers-reduced-motion: reduce) {
  .valor { transition: none; }
}`,
      js: `const VALOR = ${valor};
const DURACAO = ${v['duracao']};
const reduzir = matchMedia('(prefers-reduced-motion: reduce)');
const medidor = document.querySelector('.medidor');
const numero = medidor.querySelector('.numero');
const suave = (t) => 1 - (1 - t) ** 3; // a mesma desaceleração do arco
let quadro = 0;

function encher() {
  cancelAnimationFrame(quadro);
  medidor.classList.remove('is-cheio');
  numero.textContent = 0;
  if (reduzir.matches) {
    medidor.classList.add('is-cheio');
    numero.textContent = VALOR;
    return;
  }
  // dois quadros: o navegador desenha o arco vazio antes de enchê-lo
  requestAnimationFrame(() => requestAnimationFrame(() => {
    medidor.classList.add('is-cheio');
    const inicio = performance.now();
    const passo = (agora) => {
      const t = Math.min(1, (agora - inicio) / DURACAO);
      numero.textContent = Math.round(suave(t) * VALOR);
      if (t < 1) quadro = requestAnimationFrame(passo);
    };
    quadro = requestAnimationFrame(passo);
  }));
}

encher();
document.querySelector('.repetir').addEventListener('click', encher);`,
    };
  },
  angular: (v) => {
    const valor = Number(v['valor']);
    const faixa = valor < 50 ? 'lenta' : valor < 90 ? 'média' : 'rápida';
    return {
      ts: `import { Component, DestroyRef, afterNextRender, inject, signal } from '@angular/core';

@Component({
  selector: 'app-gauge-meter',
  templateUrl: './gauge-meter.html',
  styleUrl: './gauge-meter.css',
})
export class ${nomeClasse('gauge-meter')} {
  protected readonly valor = ${valor};
  private readonly duracao = ${v['duracao']};
  private quadro = 0;

  protected readonly cheio = signal(false);
  protected readonly mostrado = signal(0);

  constructor() {
    afterNextRender(() => this.encher());
    inject(DestroyRef).onDestroy(() => cancelAnimationFrame(this.quadro));
  }

  protected encher(): void {
    cancelAnimationFrame(this.quadro);
    this.cheio.set(false);
    this.mostrado.set(0);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.cheio.set(true);
      this.mostrado.set(this.valor);
      return;
    }
    const suave = (t: number) => 1 - (1 - t) ** 3;
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        this.cheio.set(true);
        const inicio = performance.now();
        const passo = (agora: number) => {
          const t = Math.min(1, (agora - inicio) / this.duracao);
          this.mostrado.set(Math.round(suave(t) * this.valor));
          if (t < 1) this.quadro = requestAnimationFrame(passo);
        };
        this.quadro = requestAnimationFrame(passo);
      }),
    );
  }
}
`,
      html: `<section
  class="medidor"
  [class.is-cheio]="cheio()"
  role="meter"
  aria-label="Nota de velocidade"
  aria-valuemin="0"
  aria-valuemax="100"
  [attr.aria-valuenow]="valor"
>
  <svg viewBox="0 0 200 200" aria-hidden="true">
    <circle class="trilho" cx="100" cy="100" r="80" />
    <circle class="valor" cx="100" cy="100" r="80" />
  </svg>
  <div class="leitura">
    <span class="numero">{{ mostrado() }}</span>
    <span class="rotulo">nota de velocidade · ${faixa}</span>
  </div>
</section>
<button class="repetir" type="button" (click)="encher()">Repetir</button>
`,
      css: cssAngular(GAUGE_METER.gerar(v).css),
    };
  },
  niveis: {
    iniciante: [
      'É um velocímetro redondo que vai enchendo até a nota.',
      'O número no meio conta junto, de 0 até a nota.',
      'A cor mostra se a nota é ruim (vermelho), média (amarelo) ou boa (verde).',
    ],
    avancado: [
      'stroke-dasharray: 377 1000 — o primeiro valor é o arco visível (270°), o segundo um vazio maior que o resto do círculo, para não repetir o traço.',
      'rotate: 135deg no SVG coloca o início do arco embaixo à esquerda, deixando a abertura de 90° na parte de baixo.',
      'A transição do arco e a contagem do número usam curvas parecidas (expo out × cúbica), para os dois chegarem juntos.',
      'role="meter" é o papel ARIA certo para uma medida dentro de uma faixa conhecida (diferente de progressbar, que é para tarefas).',
    ],
  },
  glossario: [
    { termo: 'stroke-dasharray', explicacao: 'Faz o traço do círculo ser só o arco de 270°.' },
    { termo: 'stroke-dashoffset', explicacao: 'Quanto do arco está escondido: anima até a nota.' },
    { termo: 'role="meter"', explicacao: 'Diz ao leitor de tela que é uma medida de 0 a 100.' },
    {
      termo: 'tabular-nums',
      explicacao: 'Algarismos de mesma largura: o número não treme ao contar.',
    },
  ],
};
