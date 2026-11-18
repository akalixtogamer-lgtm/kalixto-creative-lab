import { EffectKit } from '../../models/effect-sheet.model';
import { MDN, VALIDADO_EM, cssAngular, cssPalco, nomeClasse } from './_base';

const TITULO = 'Site completo';
const PRECO = 'R$ 3.000';

export const ECHO_TEXT: EffectKit = {
  ficha: {
    id: 'echo-text',
    nomeTecnico: 'Echo / Trail Text (cópias que se juntam)',
    nomeAmigavel: 'Texto com eco',
    categoria: 'tipografia',
    subcategoria: 'Texto que se transforma',
    descricao:
      'O título chega acompanhado de "ecos" — cópias empilhadas e cada vez mais transparentes — que deslizam e se juntam numa palavra só, sobre uma aura de luz.',
    objetivoVisual:
      'Dar peso e ritmo a uma informação-chave (um preço, um título de oferta), como um rastro de movimento congelado.',
    aplicacoes: [
      'Preço e oferta em proposta comercial',
      'Títulos de seção',
      'Abertura de vídeos e apresentações',
    ],
    nivel: 'iniciante',
    tecnologias: ['HTML', 'CSS', 'JavaScript'],
    dependencias: [],
    interacoes: ['autoplay', 'hover', 'click'],
    tags: [
      'echo',
      'eco',
      'trail',
      'rastro',
      'texto repetido',
      'stagger',
      'aura',
      'referência em vídeo',
    ],
    explicacao: [
      'Atrás do texto real há várias cópias (aria-hidden), todas na mesma posição. Cada cópia sabe o seu número (--i).',
      'Elas começam deslocadas para baixo (i × distância) e transparentes em degraus; a animação traz todas para a posição do texto real, com atraso maior para as de trás.',
      'No hover o eco "solta" de novo e volta, numa transição — a palavra parece vibrar com o rastro.',
      'A aura atrás é um radial-gradient desfocado que pulsa devagar.',
    ],
    alternativa:
      'Só com text-shadow (várias sombras deslocadas) dá um eco parado e barato; com GSAP, uma timeline com stagger nas cópias permite eco para cima, para os lados ou em leque.',
    compatibilidade:
      'Animações CSS, variáveis em calc() e filter: blur(): todos os navegadores atuais.',
    responsividade:
      'O texto usa clamp(); a distância do eco é em px e continua proporcional no celular.',
    acessibilidade:
      'Só o texto real é lido; os ecos são aria-hidden. Com prefers-reduced-motion os ecos ficam escondidos e a aura não pulsa.',
    performance: 'Só transform e opacity nas cópias; a aura pulsa com scale (composição na GPU).',
    limitacoes: ['Muitas cópias de um texto grande pesam na pintura; até 6–8 ecos é o ideal.'],
    referencias: [MDN.animation, MDN.animationDelay, MDN.reduzir],
    validadoEm: VALIDADO_EM,
    status: 'validado',
  },
  params: [
    {
      id: 'copias',
      rotulo: 'número de ecos',
      tipo: 'range',
      min: 2,
      max: 8,
      passo: 1,
      unidade: '',
      padrao: 4,
    },
    {
      id: 'distancia',
      rotulo: 'distância entre ecos',
      tipo: 'range',
      min: 4,
      max: 30,
      passo: 2,
      unidade: 'px',
      padrao: 14,
    },
    {
      id: 'duracao',
      rotulo: 'duração',
      tipo: 'range',
      min: 400,
      max: 2000,
      passo: 100,
      unidade: 'ms',
      padrao: 900,
    },
  ],
  gerar: (v) => {
    const n = Number(v['copias']);
    const ecos = (texto: string) =>
      Array.from(
        { length: n },
        (_, i) => `<span class="eco" aria-hidden="true" style="--i: ${i + 1}">${texto}</span>`,
      ).join('');
    return {
      html: `<section class="oferta">
  <div class="aura" aria-hidden="true"></div>
  <h2 class="ecoar"><span class="real">${TITULO}</span>${ecos(TITULO)}</h2>
  <p class="ecoar preco"><span class="real">${PRECO}</span>${ecos(PRECO)}</p>
</section>
<button class="repetir" type="button">Repetir</button>`,
      css: `${cssPalco()}

.oferta {
  position: relative;
  display: grid;
  place-items: center;
  gap: 12px;
  width: min(100%, 640px);
  padding: 56px 24px;
  border-radius: 20px;
  overflow: hidden;
  background: #0d0806;
  text-align: center;
}
.aura {
  position: absolute;
  top: -10%;
  width: 70%;
  aspect-ratio: 2;
  border-radius: 50%;
  background: radial-gradient(ellipse, #ff6a3d, transparent 70%);
  filter: blur(30px);
  opacity: 0.55;
  animation: pulsar 4s ease-in-out infinite alternate;
}
@keyframes pulsar { to { scale: 1.15; opacity: 0.75; } }

/* Texto real + ecos na mesma célula */
.ecoar { position: relative; display: grid; margin: 0; }
.ecoar > span { grid-area: 1 / 1; }
.ecoar h2, h2.ecoar { font-size: clamp(1.8rem, 7vw, 3rem); font-weight: 600; }
.preco { font-size: clamp(2.8rem, 12vw, 5.5rem); font-weight: 800; letter-spacing: -0.04em; }
.real { position: relative; z-index: 1; }

/* Cada eco começa i × distância abaixo e mais transparente, e se junta ao texto */
.eco {
  color: #fff;
  opacity: 0;
  animation: juntar ${v['duracao']}ms cubic-bezier(0.22, 1, 0.36, 1) calc(var(--i) * 60ms) both;
  transition: translate 500ms cubic-bezier(0.22, 1, 0.36, 1);
}
@keyframes juntar {
  from { translate: 0 calc(var(--i) * ${v['distancia']}px); opacity: calc(0.7 - var(--i) * 0.08); }
  to { translate: 0 0; opacity: 0; }
}
/* hover: o eco "solta" de novo, parado */
.ecoar:hover .eco {
  animation: none;
  translate: 0 calc(var(--i) * ${Math.round(Number(v['distancia']) / 2)}px);
  opacity: calc(0.5 - var(--i) * 0.06);
}

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
  .eco { display: none; }
  .aura { animation: none; }
}`,
      js: `// Repetir: recria os ecos (copiar e recolocar reinicia as animações)
document.querySelector('.repetir').addEventListener('click', () => {
  document.querySelectorAll('.ecoar').forEach((bloco) => {
    const ecos = [...bloco.querySelectorAll('.eco')];
    ecos.forEach((eco) => eco.replaceWith(eco.cloneNode(true)));
  });
});`,
    };
  },
  angular: (v) => ({
    ts: `import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-echo-text',
  templateUrl: './echo-text.html',
  styleUrl: './echo-text.css',
})
export class ${nomeClasse('echo-text')} {
  protected readonly titulo = '${TITULO}';
  protected readonly preco = '${PRECO}';
  /** Posição de cada eco (1, 2, 3…). */
  protected readonly ecos = Array.from({ length: ${v['copias']} }, (_, i) => i + 1);
  /** Muda a cada Repetir: o @for recria os ecos e as animações recomeçam. */
  protected readonly ciclo = signal(0);

  protected repetir(): void {
    this.ciclo.update((n) => n + 1);
  }
}
`,
    html: `<section class="oferta">
  <div class="aura" aria-hidden="true"></div>
  @for (c of [ciclo()]; track c) {
    <h2 class="ecoar">
      <span class="real">{{ titulo }}</span>
      @for (i of ecos; track i) {
        <span class="eco" aria-hidden="true" [style.--i]="i">{{ titulo }}</span>
      }
    </h2>
    <p class="ecoar preco">
      <span class="real">{{ preco }}</span>
      @for (i of ecos; track i) {
        <span class="eco" aria-hidden="true" [style.--i]="i">{{ preco }}</span>
      }
    </p>
  }
</section>
<button class="repetir" type="button" (click)="repetir()">Repetir</button>
`,
    css: cssAngular(ECHO_TEXT.gerar(v).css),
  }),
  niveis: {
    iniciante: [
      'O título e o preço aparecem com várias "sombras" de si mesmos, uma embaixo da outra.',
      'Essas sombras sobem e se juntam com o texto, até sobrar só uma palavra.',
      'Passando o mouse, as sombras aparecem de novo, como um eco.',
    ],
    avancado: [
      'opacity: calc(0.7 − var(--i) × 0.08) dentro do @keyframes: cada cópia começa num degrau de transparência diferente com a mesma regra.',
      'A animação termina com opacity 0 e fill both: o eco some sozinho, e o texto real (z-index 1) fica nítido.',
      'No hover, animation: none + valores fixos faz a transição (translate) assumir — dá para combinar animação de entrada e transição de interação.',
      'cloneNode(true) + replaceWith é um jeito simples de reiniciar animações CSS sem reflow forçado.',
    ],
  },
  glossario: [
    { termo: 'calc(var(--i) *', explicacao: 'Deslocamento e atraso de cada eco.' },
    { termo: 'grid-area: 1 / 1', explicacao: 'Empilha o texto real e os ecos no mesmo lugar.' },
    { termo: 'filter: blur(', explicacao: 'Desfoca a aura de luz atrás do texto.' },
    { termo: 'cloneNode', explicacao: 'Recria os ecos para reiniciar a animação.' },
  ],
};
