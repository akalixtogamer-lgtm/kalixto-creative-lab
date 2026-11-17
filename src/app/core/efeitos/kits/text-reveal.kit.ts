import { EffectKit } from '../../models/effect-sheet.model';
import { CSS_REPETIR, EASINGS, MDN, VALIDADO_EM, cssAngular, cssPalco, nomeClasse } from './_base';

const INICIO: Record<string, string> = {
  subir: 'transform: translateY(0.6em);',
  desfocar: 'filter: blur(8px);',
  girar: 'transform: rotateX(-80deg); transform-origin: 50% 100%;',
};

export const TEXT_REVEAL: EffectKit = {
  ficha: {
    id: 'text-reveal',
    nomeTecnico: 'Text Reveal (stagger)',
    nomeAmigavel: 'Revelar texto em sequência',
    categoria: 'tipografia',
    subcategoria: 'Revelação de texto',
    descricao: 'O título é dividido em letras ou palavras, que aparecem uma depois da outra.',
    objetivoVisual: 'Dar ritmo à leitura de um título e criar uma entrada marcante.',
    aplicacoes: ['Títulos de hero', 'Frases de impacto', 'Aberturas de seção'],
    nivel: 'intermediario',
    tecnologias: ['HTML', 'CSS', 'JavaScript'],
    dependencias: [],
    interacoes: ['autoplay', 'click'],
    tags: ['texto', 'split', 'stagger', 'letras', 'palavras', 'tipografia', 'reveal'],
    explicacao: [
      'O JavaScript quebra o texto em <span>, um por letra ou por palavra, e grava o índice de cada um na variável CSS --i. As letras de uma palavra ficam dentro de um bloco .palavra, para a linha nunca quebrar no meio da palavra.',
      'Todas as partes usam a mesma animação; o atraso de cada uma é calc(var(--i) * stagger). Isso cria a cascata.',
      'O título recebe aria-label com o texto completo e os spans ficam com aria-hidden, para o leitor de tela ler a frase inteira e não letra por letra.',
      'Os espaços entre as palavras ficam como texto normal, então a quebra de linha continua natural em qualquer largura.',
    ],
    alternativa: 'GSAP SplitText faz a divisão (inclusive por linhas, respeitando a quebra real do texto) e anima com stagger — veja a demo no GSAP Studio.',
    compatibilidade: 'Todos os navegadores atuais.',
    responsividade: 'O texto continua quebrando linha normalmente, porque cada palavra fica num bloco próprio.',
    acessibilidade: 'aria-label preserva a leitura da frase. Com redução de movimento, as partes só aparecem (sem deslocar, desfocar ou girar).',
    performance: 'Uma animação por letra. Para títulos curtos não há problema; em parágrafos longos prefira o modo palavras.',
    limitacoes: ['A divisão por letras quebra ligaduras tipográficas e o kerning entre letras.', 'Não divide por linhas: para isso é preciso medir a quebra real (SplitText faz isso).'],
    referencias: [MDN.animationDelay, MDN.keyframes, MDN.reduzir],
    validadoEm: VALIDADO_EM,
    status: 'validado',
  },
  params: [
    {
      id: 'modo',
      rotulo: 'dividir por',
      tipo: 'select',
      opcoes: [
        { valor: 'letras', rotulo: 'letras' },
        { valor: 'palavras', rotulo: 'palavras' },
      ],
      padrao: 'letras',
    },
    {
      id: 'efeito',
      rotulo: 'efeito',
      tipo: 'select',
      opcoes: [
        { valor: 'subir', rotulo: 'subir' },
        { valor: 'desfocar', rotulo: 'desfocar' },
        { valor: 'girar', rotulo: 'girar (3D)' },
      ],
      padrao: 'subir',
    },
    { id: 'stagger', rotulo: 'intervalo entre partes', tipo: 'range', min: 10, max: 200, passo: 5, unidade: 'ms', padrao: 35 },
    { id: 'dur', rotulo: 'duração de cada parte', tipo: 'range', min: 200, max: 1500, passo: 50, unidade: 'ms', padrao: 600 },
    { id: 'easing', rotulo: 'curva (easing)', tipo: 'select', opcoes: EASINGS, padrao: 'cubic-bezier(0.22, 1, 0.36, 1)' },
  ],
  gerar: (v) => ({
    html: `<h1 class="titulo">Experimente. Entenda. Codifique.</h1>
<button class="repetir" type="button">Repetir</button>`,
    css: `${cssPalco()}

.titulo {
  max-width: 14ch;
  margin: 0;
  font-size: clamp(2rem, 7vw, 3.5rem);
  line-height: 1.1;
  text-align: center;
  perspective: 600px;
}

/* cada palavra é um bloco que não quebra no meio */
.palavra { display: inline-block; white-space: nowrap; }

/* O efeito: cada parte espera --i vezes o intervalo */
.parte {
  display: inline-block;
  opacity: 0;
  ${INICIO[String(v['efeito'])]}
  animation: revelar ${v['dur']}ms ${v['easing']} forwards;
  animation-delay: calc(var(--i) * ${v['stagger']}ms);
}

@keyframes revelar {
  to { opacity: 1; transform: none; filter: none; }
}

@media (prefers-reduced-motion: reduce) {
  .parte { transform: none; filter: none; animation-duration: 200ms; }
}
${CSS_REPETIR}`,
    js: `const titulo = document.querySelector('.titulo');
const texto = titulo.textContent;
const MODO = '${v['modo']}'; // 'letras' ou 'palavras'

function parte(conteudo, i) {
  const span = document.createElement('span');
  span.className = 'parte';
  span.style.setProperty('--i', i);
  span.textContent = conteudo;
  return span;
}

function dividir() {
  // o leitor de tela lê a frase inteira; os pedaços ficam escondidos dele
  titulo.setAttribute('aria-label', texto);
  titulo.textContent = '';
  let i = 0;

  texto.split(' ').forEach((palavra, n) => {
    if (n > 0) titulo.append(' '); // espaço normal: a linha pode quebrar aqui
    // cada palavra fica num bloco que não quebra, então as letras não se separam
    const bloco = document.createElement('span');
    bloco.className = 'palavra';
    bloco.setAttribute('aria-hidden', 'true');
    if (MODO === 'letras') {
      for (const letra of palavra) bloco.append(parte(letra, i++));
    } else {
      bloco.append(parte(palavra, i++));
    }
    titulo.append(bloco);
  });
}

dividir();
document.querySelector('.repetir').addEventListener('click', dividir);`,
  }),
  angular: (v) => ({
    ts: `import { Component, signal } from '@angular/core';

/** Uma parte do texto (letra ou palavra) e sua posição na sequência. */
interface Parte {
  texto: string;
  i: number;
}

@Component({
  selector: 'app-text-reveal',
  templateUrl: './text-reveal.html',
  styleUrl: './text-reveal.css',
})
export class ${nomeClasse('text-reveal')} {
  protected readonly texto = 'Experimente. Entenda. Codifique.';
  private readonly modo: 'letras' | 'palavras' = '${v['modo']}';

  /** Muda a cada clique em Repetir; o @for recria as partes e a animação recomeça. */
  protected readonly ciclo = signal(0);

  /** Palavras, cada uma com suas partes (letras ou a palavra inteira). */
  protected readonly palavras: Parte[][] = this.dividir();

  protected repetir(): void {
    this.ciclo.update((n) => n + 1);
  }

  private dividir(): Parte[][] {
    let i = 0;
    return this.texto.split(' ').map((palavra) =>
      this.modo === 'letras'
        ? [...palavra].map((letra) => ({ texto: letra, i: i++ }))
        : [{ texto: palavra, i: i++ }],
    );
  }
}
`,
    html: `<!-- o leitor de tela lê o aria-label; as partes ficam escondidas dele -->
<h1 class="titulo" [attr.aria-label]="texto">
  @for (c of [ciclo()]; track c) {
    @for (palavra of palavras; track $index; let ultima = $last) {
      <span class="palavra" aria-hidden="true">@for (p of palavra; track p.i) {<span class="parte" [style.--i]="p.i">{{ p.texto }}</span>}</span>
      <!-- espaço entre palavras: é onde a linha pode quebrar -->
      @if (!ultima) {
        {{ ' ' }}
      }
    }
  }
</h1>
<button class="repetir" type="button" (click)="repetir()">Repetir</button>
`,
    css: cssAngular(TEXT_REVEAL.gerar(v).css),
  }),
  niveis: {
    iniciante: [
      'O título é cortado em pedacinhos (letras ou palavras), e cada pedaço aparece um pouco depois do anterior.',
      'Cada pedaço sabe sua posição na fila (0, 1, 2…) e espera esse número vezes o intervalo.',
      'Quem usa leitor de tela ouve a frase inteira, e não letra por letra.',
    ],
    avancado: [
      'O atraso é calculado no CSS com calc(var(--i) * intervalo): o JavaScript só grava o índice, não controla tempo.',
      'Letras agrupadas em .palavra com white-space: nowrap impedem quebra de linha no meio da palavra.',
      'Dividir em spans quebra kerning e ligaduras; em fontes com muitas ligaduras prefira o modo palavras.',
      'Divisão por linhas exige medir a quebra real após o layout (e refazer no resize) — é o que SplitText faz.',
      'No Angular, [style.--i] liga a custom property direto no template, sem manipular o DOM.',
    ],
  },
  glossario: [
    { termo: '--i', explicacao: 'Variável CSS com a posição de cada parte na sequência.' },
    { termo: 'calc(var(--i)', explicacao: 'Multiplica a posição pelo intervalo para calcular o atraso de cada parte.' },
    { termo: 'aria-label', explicacao: 'Texto que o leitor de tela lê no lugar das partes.' },
    { termo: 'aria-hidden', explicacao: 'Esconde as partes do leitor de tela (evita leitura letra por letra).' },
    { termo: 'white-space: nowrap', explicacao: 'Impede a palavra de quebrar no meio.' },
    { termo: 'inline-block', explicacao: 'Permite usar transform em cada parte, que é um elemento de texto.' },
  ],
};
