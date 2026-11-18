import { EffectKit } from '../../models/effect-sheet.model';
import { MDN, VALIDADO_EM, cssAngular, cssPalco, nomeClasse } from './_base';

const CONJUNTOS: Record<string, string> = {
  simbolos: '!<>-_/[]{}=+*^?#',
  binario: '01',
  letras: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
};

const TEXTOS = ['Código vira movimento', 'Projetos', 'Laboratório', 'Contato'];

export const TEXT_SCRAMBLE: EffectKit = {
  ficha: {
    id: 'text-scramble',
    nomeTecnico: 'Text Scramble / Decode',
    nomeAmigavel: 'Texto embaralhado (decodificar)',
    categoria: 'tipografia',
    subcategoria: 'Texto que se transforma',
    descricao:
      'As letras viram caracteres aleatórios e vão "decodificando" da esquerda para a direita até formar o texto — no título ao carregar e nos links do menu ao passar o mouse.',
    objetivoVisual:
      'Dar um ar tecnológico, de terminal ou de "hacker", a títulos e menus, com uma microinteração que recompensa o hover.',
    aplicacoes: [
      'Menus de portfólios dev',
      'Títulos de landing pages de tecnologia',
      'Telas de abertura e loaders',
    ],
    nivel: 'intermediario',
    tecnologias: ['HTML', 'CSS', 'JavaScript'],
    dependencias: [],
    interacoes: ['autoplay', 'hover', 'keyboard', 'click'],
    tags: [
      'scramble',
      'decode',
      'embaralhar',
      'glitch',
      'terminal',
      'hacker',
      'menu',
      'tendência 2026',
    ],
    explicacao: [
      'O texto verdadeiro fica guardado no aria-label. Dentro do elemento há um <span> aria-hidden, que é o que muda na tela.',
      'A cada quadro, calcula-se o progresso (tempo decorrido ÷ duração). As letras com posição menor que progresso × tamanho já mostram o caractere certo; as demais mostram um caractere sorteado do conjunto.',
      'Espaços nunca são sorteados, para as palavras manterem o formato. A fonte monoespaçada evita que o texto "pule" de largura enquanto embaralha.',
    ],
    alternativa:
      'GSAP tem o plugin ScrambleText (gratuito desde 2025), com opções de velocidade, caracteres e revelação por palavra.',
    compatibilidade: 'requestAnimationFrame e performance.now(): todos os navegadores atuais.',
    responsividade:
      'Funciona em qualquer tamanho; no toque, o menu embaralha no foco (toque/teclado) em vez do hover.',
    acessibilidade:
      'O leitor de tela lê o aria-label (texto correto), nunca os caracteres sorteados. Com prefers-reduced-motion o texto aparece direto, sem embaralhar.',
    performance:
      'Só troca o textContent de um span por quadro, durante no máximo a duração escolhida. Custo desprezível.',
    limitacoes: [
      'Com fontes proporcionais o texto treme de largura; use monoespaçada ou fixe a largura do elemento.',
      'Em textos longos (parágrafos) o efeito cansa: reserve para títulos curtos e itens de menu.',
    ],
    referencias: [
      MDN.raf,
      {
        titulo: 'GSAP — ScrambleTextPlugin',
        url: 'https://gsap.com/docs/v3/Plugins/ScrambleTextPlugin/',
      },
      MDN.reduzir,
    ],
    validadoEm: VALIDADO_EM,
    status: 'validado',
  },
  params: [
    {
      id: 'duracao',
      rotulo: 'duração',
      tipo: 'range',
      min: 400,
      max: 2500,
      passo: 100,
      unidade: 'ms',
      padrao: 1200,
    },
    {
      id: 'caracteres',
      rotulo: 'caracteres sorteados',
      tipo: 'select',
      opcoes: [
        { valor: 'simbolos', rotulo: 'símbolos' },
        { valor: 'binario', rotulo: 'binário (0 e 1)' },
        { valor: 'letras', rotulo: 'letras' },
      ],
      padrao: 'simbolos',
    },
    {
      id: 'cor',
      rotulo: 'cor do destaque',
      tipo: 'select',
      opcoes: [
        { valor: '#c6ff3d', rotulo: 'Lima' },
        { valor: '#22e3ff', rotulo: 'Ciano' },
        { valor: '#ff2bd6', rotulo: 'Magenta' },
      ],
      padrao: '#c6ff3d',
    },
  ],
  gerar: (v) => {
    const chars = CONJUNTOS[String(v['caracteres'])];
    return {
      html: `<h1 class="embaralhar titulo-codigo" aria-label="${TEXTOS[0]}"><span aria-hidden="true">${TEXTOS[0]}</span></h1>
<nav class="menu-codigo" aria-label="Menu de exemplo">
${TEXTOS.slice(1)
  .map(
    (t) =>
      `  <a class="embaralhar" href="#" aria-label="${t}"><span aria-hidden="true">${t}</span></a>`,
  )
  .join('\n')}
</nav>
<button class="repetir" type="button">Repetir título</button>`,
      css: `${cssPalco()}

.titulo-codigo {
  margin: 0;
  font: 700 clamp(1.6rem, 6vw, 3rem) / 1.1 'JetBrains Mono', ui-monospace, monospace;
  color: ${v['cor']};
  text-align: center;
}
.menu-codigo { display: flex; flex-wrap: wrap; gap: 24px; justify-content: center; }
.menu-codigo a {
  font: 500 18px 'JetBrains Mono', ui-monospace, monospace;
  color: #f4f2ff;
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.menu-codigo a:hover, .menu-codigo a:focus-visible { color: ${v['cor']}; }
.menu-codigo a:focus-visible { outline: 2px solid #22e3ff; outline-offset: 4px; }

.repetir {
  padding: 8px 16px;
  border: 1px solid #3a3456;
  border-radius: 999px;
  background: transparent;
  color: #c9c3ea;
  font: inherit;
  cursor: pointer;
}`,
      js: `const CARACTERES = '${chars}';
const DURACAO = ${v['duracao']};
const reduzir = matchMedia('(prefers-reduced-motion: reduce)');

function embaralhar(el) {
  const alvo = el.querySelector('span');
  const final = el.getAttribute('aria-label');
  if (reduzir.matches) {
    alvo.textContent = final;
    return;
  }
  cancelAnimationFrame(el._quadro);
  const inicio = performance.now();
  const passo = (agora) => {
    const p = Math.min(1, (agora - inicio) / DURACAO);
    let texto = '';
    for (let i = 0; i < final.length; i++) {
      const certo = final[i] === ' ' || i < p * final.length;
      texto += certo ? final[i] : CARACTERES[Math.floor(Math.random() * CARACTERES.length)];
    }
    alvo.textContent = texto;
    if (p < 1) el._quadro = requestAnimationFrame(passo);
  };
  el._quadro = requestAnimationFrame(passo);
}

const titulo = document.querySelector('.titulo-codigo');
embaralhar(titulo);
document.querySelector('.repetir').addEventListener('click', () => embaralhar(titulo));

// menu: embaralha no hover e no foco do teclado
document.querySelectorAll('.menu-codigo a').forEach((link) => {
  link.addEventListener('pointerenter', () => embaralhar(link));
  link.addEventListener('focus', () => embaralhar(link));
  link.addEventListener('click', (e) => e.preventDefault());
});`,
    };
  },
  angular: (v) => ({
    ts: `import { Component, ElementRef, afterNextRender, viewChild } from '@angular/core';

@Component({
  selector: 'app-text-scramble',
  templateUrl: './text-scramble.html',
  styleUrl: './text-scramble.css',
})
export class ${nomeClasse('text-scramble')} {
  protected readonly titulo = '${TEXTOS[0]}';
  protected readonly links = ${JSON.stringify(TEXTOS.slice(1)).replace(/"/g, "'").replace(/,/g, ', ')};
  private readonly caracteres = '${CONJUNTOS[String(v['caracteres'])]}';
  private readonly duracao = ${v['duracao']};
  private readonly reduzir = window.matchMedia('(prefers-reduced-motion: reduce)');
  private readonly quadros = new WeakMap<HTMLElement, number>();
  private readonly alvoTitulo = viewChild.required<ElementRef<HTMLElement>>('alvoTitulo');

  constructor() {
    afterNextRender(() => this.embaralhar(this.alvoTitulo().nativeElement, this.titulo));
  }

  protected repetir(): void {
    this.embaralhar(this.alvoTitulo().nativeElement, this.titulo);
  }

  /** Escreve direto no span (aria-hidden): muda a cada quadro, fora da detecção de mudanças. */
  protected embaralhar(alvo: HTMLElement, final: string): void {
    if (this.reduzir.matches) {
      alvo.textContent = final;
      return;
    }
    cancelAnimationFrame(this.quadros.get(alvo) ?? 0);
    const inicio = performance.now();
    const passo = (agora: number) => {
      const p = Math.min(1, (agora - inicio) / this.duracao);
      let texto = '';
      for (let i = 0; i < final.length; i++) {
        const certo = final[i] === ' ' || i < p * final.length;
        texto += certo ? final[i] : this.caracteres[Math.floor(Math.random() * this.caracteres.length)];
      }
      alvo.textContent = texto;
      if (p < 1) this.quadros.set(alvo, requestAnimationFrame(passo));
    };
    this.quadros.set(alvo, requestAnimationFrame(passo));
  }
}
`,
    html: `<h1 class="embaralhar titulo-codigo" [attr.aria-label]="titulo">
  <span #alvoTitulo aria-hidden="true">{{ titulo }}</span>
</h1>
<nav class="menu-codigo" aria-label="Menu de exemplo">
  @for (t of links; track t) {
    <a
      class="embaralhar"
      href="#"
      [attr.aria-label]="t"
      (pointerenter)="embaralhar(alvo, t)"
      (focus)="embaralhar(alvo, t)"
      (click)="$event.preventDefault()"
      ><span #alvo aria-hidden="true">{{ t }}</span></a
    >
  }
</nav>
<button class="repetir" type="button" (click)="repetir()">Repetir título</button>
`,
    css: cssAngular(TEXT_SCRAMBLE.gerar(v).css),
  }),
  niveis: {
    iniciante: [
      'O texto aparece primeiro como uma bagunça de símbolos.',
      'Da esquerda para a direita, cada símbolo vai virando a letra certa, como se o computador estivesse decifrando uma mensagem.',
      'Os links do menu fazem a mesma coisa quando o mouse passa por cima.',
    ],
    avancado: [
      'O progresso é baseado em tempo (performance.now), não em contagem de quadros: a duração é a mesma em telas de 60 Hz e 120 Hz.',
      'Cada elemento guarda o id do seu requestAnimationFrame para cancelar a animação anterior se o hover acontecer de novo no meio.',
      'Variação comum: revelar em ordem aleatória (embaralhe os índices) ou por "ondas" (cada letra tem um atraso próprio).',
      'No Angular, o texto do span é escrito direto no DOM (fora do template) porque muda a cada quadro; o WeakMap guarda o quadro de cada elemento.',
    ],
  },
  glossario: [
    { termo: 'performance.now()', explicacao: 'Relógio preciso usado para calcular o progresso.' },
    { termo: 'Math.random()', explicacao: 'Sorteia o caractere das letras ainda não decifradas.' },
    { termo: 'aria-label', explicacao: 'Guarda o texto real para o leitor de tela.' },
    {
      termo: 'cancelAnimationFrame',
      explicacao: 'Interrompe a animação anterior antes de começar outra.',
    },
  ],
};
