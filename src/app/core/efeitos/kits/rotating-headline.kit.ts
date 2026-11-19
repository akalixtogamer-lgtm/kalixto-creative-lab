import { EffectKit } from '../../models/effect-sheet.model';
import { MDN, VALIDADO_EM, cssAngular, cssPalco, nomeClasse } from './_base';

const FRASES = [
  'O mundo pode esperar.',
  'Dias que começam sem pressa.',
  'Sinta o lugar. Viva o agora.',
  'Fique mais um instante.',
];

const ENTRADAS: Record<string, { de: string; ate: string }> = {
  desfocar: {
    de: 'opacity: 0; filter: blur(12px); translate: 0 0.2em;',
    ate: 'opacity: 0; filter: blur(12px); translate: 0 -0.2em;',
  },
  subir: { de: 'opacity: 0; translate: 0 0.8em;', ate: 'opacity: 0; translate: 0 -0.8em;' },
};

export const ROTATING_HEADLINE: EffectKit = {
  ficha: {
    id: 'rotating-headline',
    nomeTecnico: 'Rotating Headline (frases em revezamento)',
    nomeAmigavel: 'Frases que se revezam no hero',
    categoria: 'tipografia',
    subcategoria: 'Legendas e texto falado',
    descricao:
      'Sobre a foto do hero, uma frase curta entra palavra por palavra, fica alguns segundos e sai, dando lugar à próxima — como as legendas de um filme de viagem.',
    objetivoVisual:
      'Contar a promessa da marca em várias frases sem ocupar espaço, criando um clima calmo e cinematográfico.',
    aplicacoes: [
      'Hero de hotel, pousada e turismo',
      'Marcas de bem-estar e lifestyle',
      'Apresentações de manifesto',
    ],
    nivel: 'intermediario',
    tecnologias: ['HTML', 'CSS', 'JavaScript'],
    dependencias: [],
    interacoes: ['autoplay', 'click'],
    tags: [
      'headline',
      'frases',
      'revezamento',
      'rotating text',
      'hero',
      'blur',
      'palavra por palavra',
      'referência em vídeo',
    ],
    explicacao: [
      'O JavaScript guarda a lista de frases e, a cada intervalo, troca a frase visível: divide em palavras (um <span> para cada) e grava a posição de cada uma em --i.',
      'A entrada é CSS: cada palavra anima de "desfocada e um pouco abaixo" para nítida, com atraso --i × atraso por palavra.',
      'Antes de trocar, a frase atual recebe a classe de saída: as palavras sobem e desfocam, na mesma ordem. Só depois a próxima frase entra.',
      'Para o leitor de tela, todas as frases estão numa lista oculta; a frase animada é aria-hidden e não é anunciada a cada troca.',
    ],
    alternativa:
      'Com GSAP: uma timeline repetida com SplitText em cada frase (from e to com stagger) e um label por frase — permite sincronizar com vídeo de fundo.',
    compatibilidade: 'Animações CSS e filter: blur(): todos os navegadores atuais.',
    responsividade:
      'O texto usa clamp() e quebra em duas linhas no celular; as palavras são inline-block e quebram naturalmente.',
    acessibilidade:
      'Texto rotativo automático precisa de pausa (WCAG 2.2.2): o botão Pausar congela a frase atual. Com prefers-reduced-motion, as frases trocam sem animação e mais devagar.',
    performance:
      'Uma troca de DOM a cada poucos segundos; a animação usa opacity, filter e translate.',
    limitacoes: [
      'blur em texto grande pode pesar em celulares simples; a entrada "subir" é a mais leve.',
    ],
    referencias: [MDN.animation, MDN.animationDelay, MDN.wcagMovimento],
    validadoEm: VALIDADO_EM,
    status: 'validado',
  },
  params: [
    {
      id: 'tempo',
      rotulo: 'tempo de cada frase',
      tipo: 'range',
      min: 2000,
      max: 6000,
      passo: 250,
      unidade: 'ms',
      padrao: 3500,
    },
    {
      id: 'entrada',
      rotulo: 'entrada das palavras',
      tipo: 'select',
      opcoes: [
        { valor: 'desfocar', rotulo: 'desfocar' },
        { valor: 'subir', rotulo: 'subir' },
      ],
      padrao: 'desfocar',
    },
    {
      id: 'atraso',
      rotulo: 'atraso entre palavras',
      tipo: 'range',
      min: 40,
      max: 200,
      passo: 10,
      unidade: 'ms',
      padrao: 90,
    },
  ],
  gerar: (v) => {
    const e = ENTRADAS[String(v['entrada'])];
    return {
      html: `<section class="hero-frases">
  <ul class="sr-frases">
${FRASES.map((f) => `    <li>${f}</li>`).join('\n')}
  </ul>
  <h1 class="frase" aria-hidden="true"></h1>
</section>
<button class="pausar" type="button" aria-pressed="false">Pausar</button>`,
      css: `${cssPalco()}

.hero-frases {
  position: relative;
  display: flex;
  align-items: flex-end;
  width: min(100%, 680px);
  aspect-ratio: 16 / 10;
  padding: 28px;
  border-radius: 20px;
  overflow: hidden;
  background:
    linear-gradient(180deg, transparent 40%, rgb(0 0 0 / 0.55)),
    radial-gradient(circle at 70% 55%, #ffd27a 0 4%, transparent 5%),
    linear-gradient(180deg, #f0a35e 0%, #c2566b 40%, #3b2a55 62%, #1c4b55 63%, #2f7a74 100%);
}
.sr-frases { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
.frase {
  margin: 0;
  max-width: 16ch;
  font: 300 clamp(1.8rem, 7vw, 3.4rem) / 1.05 system-ui, sans-serif;
  letter-spacing: -0.03em;
  color: #fff;
}

/* Entrada: palavra a palavra */
.palavra {
  display: inline-block;
  margin-right: 0.25em;
  animation: entrar 700ms cubic-bezier(0.22, 1, 0.36, 1) calc(var(--i) * ${v['atraso']}ms) both;
}
@keyframes entrar {
  from { ${e.de} }
}
/* Saída: na mesma ordem */
.frase.is-saindo .palavra {
  animation: sair 500ms ease-in calc(var(--i) * ${Math.round(Number(v['atraso']) / 2)}ms) both;
}
@keyframes sair {
  to { ${e.ate} }
}

.pausar {
  padding: 8px 16px;
  border: 1px solid #3a3456;
  border-radius: 999px;
  background: transparent;
  color: #c9c3ea;
  font: inherit;
  cursor: pointer;
}

@media (prefers-reduced-motion: reduce) {
  .palavra, .frase.is-saindo .palavra { animation: none; }
}`,
      js: `const FRASES = [...document.querySelectorAll('.sr-frases li')].map((li) => li.textContent);
const TEMPO = ${v['tempo']};
const reduzir = matchMedia('(prefers-reduced-motion: reduce)');
const titulo = document.querySelector('.frase');
let atual = 0;
let pausado = false;

function mostrar(i) {
  titulo.classList.remove('is-saindo');
  titulo.replaceChildren(
    ...FRASES[i].split(' ').map((texto, n) => {
      const palavra = document.createElement('span');
      palavra.className = 'palavra';
      palavra.textContent = texto;
      palavra.style.setProperty('--i', n);
      return palavra;
    }),
  );
}

function proxima() {
  if (pausado) return;
  titulo.classList.add('is-saindo');
  // espera a saída terminar antes de trocar (sem animação: troca na hora)
  setTimeout(() => {
    atual = (atual + 1) % FRASES.length;
    mostrar(atual);
  }, reduzir.matches ? 0 : 600);
}

mostrar(0);
setInterval(proxima, reduzir.matches ? TEMPO * 2 : TEMPO);

const botao = document.querySelector('.pausar');
botao.addEventListener('click', () => {
  pausado = !pausado;
  botao.setAttribute('aria-pressed', String(pausado));
  botao.textContent = pausado ? 'Continuar' : 'Pausar';
});`,
    };
  },
  angular: (v) => ({
    ts: `import { Component, DestroyRef, computed, inject, signal } from '@angular/core';

@Component({
  selector: 'app-rotating-headline',
  templateUrl: './rotating-headline.html',
  styleUrl: './rotating-headline.css',
})
export class ${nomeClasse('rotating-headline')} {
  protected readonly frases = ${JSON.stringify(FRASES).replace(/"/g, "'").replace(/','/g, "', '")};
  private readonly reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  private readonly tempo = ${v['tempo']};

  protected readonly atual = signal(0);
  protected readonly saindo = signal(false);
  protected readonly pausado = signal(false);
  protected readonly palavras = computed(() => this.frases[this.atual()].split(' '));

  constructor() {
    const id = setInterval(() => this.proxima(), this.reduzir ? this.tempo * 2 : this.tempo);
    inject(DestroyRef).onDestroy(() => clearInterval(id));
  }

  private proxima(): void {
    if (this.pausado()) return;
    this.saindo.set(true);
    setTimeout(() => {
      this.atual.update((i) => (i + 1) % this.frases.length);
      this.saindo.set(false);
    }, this.reduzir ? 0 : 600);
  }
}
`,
    html: `<section class="hero-frases">
  <ul class="sr-frases">
    @for (f of frases; track f) {
      <li>{{ f }}</li>
    }
  </ul>
  @for (i of [atual()]; track i) {
    <h1 class="frase" aria-hidden="true" [class.is-saindo]="saindo()">
      @for (p of palavras(); track $index) {
        <span class="palavra" [style.--i]="$index">{{ p }}</span>
      }
    </h1>
  }
</section>
<button class="pausar" type="button" [attr.aria-pressed]="pausado()" (click)="pausado.set(!pausado())">
  {{ pausado() ? 'Continuar' : 'Pausar' }}
</button>
`,
    css: cssAngular(ROTATING_HEADLINE.gerar(v).css),
  }),
  niveis: {
    iniciante: [
      'Sobre a imagem de pôr do sol aparecem frases curtas, uma de cada vez.',
      'Cada frase surge palavra por palavra, saindo do desfoque, fica um tempinho e vai embora para cima.',
      'O botão Pausar segura a frase que está na tela.',
    ],
    avancado: [
      'Duas classes, duas animações: a entrada usa @keyframes com só "from" (termina no estado natural) e a saída usa só "to".',
      'O setTimeout de 600 ms espera a saída (500 ms + atraso) antes de trocar o DOM; com reduced motion a troca é imediata.',
      'A lista oculta (.sr-frases) dá ao leitor de tela todas as frases de uma vez, sem anúncios repetidos a cada troca.',
      'No Angular, o @for com a chave atual() recria o h1 a cada frase, e as palavras vêm de um computed.',
    ],
  },
  glossario: [
    { termo: 'filter: blur(', explicacao: 'A palavra entra saindo do desfoque.' },
    { termo: 'setInterval', explicacao: 'Troca de frase a cada intervalo.' },
    { termo: 'is-saindo', explicacao: 'Classe que dispara a animação de saída.' },
    { termo: 'calc(var(--i) *', explicacao: 'Atraso de cada palavra na frase.' },
  ],
};
