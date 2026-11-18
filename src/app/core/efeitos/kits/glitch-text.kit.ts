import { EffectKit } from '../../models/effect-sheet.model';
import { MDN, VALIDADO_EM, cssAngular, cssPalco, nomeClasse } from './_base';

const TEXTO = 'o céu mudou de dono';

const PARES: Record<string, [string, string]> = {
  rgb: ['#ff1f4b', '#1fe0ff'],
  'rosa-azul': ['#ff5fc8', '#5f8bff'],
  lima: ['#c6ff3d', '#ff2bd6'],
};

/** Quando o glitch acontece. */
const GATILHOS: Record<string, string> = {
  rajadas: `/* em rajadas: a animação dura 3s, mas só "falha" em ~15% do tempo */
.glitch::before { animation: fatiar-a 3s steps(1) infinite; }
.glitch::after { animation: fatiar-b 3s steps(1) infinite; }`,
  sempre: `/* sempre falhando */
.glitch::before { animation: fatiar-a 0.9s steps(1) infinite; }
.glitch::after { animation: fatiar-b 0.9s steps(1) infinite; }`,
  hover: `/* só ao passar o mouse ou focar */
.glitch:hover::before, .glitch:focus-visible::before { animation: fatiar-a 0.9s steps(1) infinite; }
.glitch:hover::after, .glitch:focus-visible::after { animation: fatiar-b 0.9s steps(1) infinite; }`,
};

export const GLITCH_TEXT: EffectKit = {
  ficha: {
    id: 'glitch-text',
    nomeTecnico: 'RGB Split Glitch Text',
    nomeAmigavel: 'Texto com glitch RGB',
    categoria: 'experimental',
    subcategoria: 'Glitch e distorção',
    descricao:
      'O título "falha" como um sinal de TV: fatias horizontais se deslocam e a cor se separa em vermelho e ciano por instantes.',
    objetivoVisual:
      'Dar impacto, tensão ou estética digital/retrô a um título curto — uma "virada" de narrativa.',
    aplicacoes: [
      'Títulos de campanha e lançamento',
      'Sites de música, games e moda',
      'Páginas 404 e telas de erro',
    ],
    nivel: 'intermediario',
    tecnologias: ['HTML', 'CSS'],
    dependencias: [],
    interacoes: ['autoplay', 'hover', 'keyboard'],
    tags: [
      'glitch',
      'rgb split',
      'chromatic aberration',
      'falha',
      'clip-path',
      'pseudo-elemento',
      'referência em vídeo',
    ],
    explicacao: [
      'O texto é copiado duas vezes pelo CSS, nos pseudo-elementos ::before e ::after, lendo o atributo data-texto (content: attr(data-texto)).',
      'Cada cópia tem uma cor (vermelho e ciano) e fica exatamente sobre o texto original — invisível enquanto está parada.',
      'A animação, com steps(1), troca de uma vez entre "quadros": em cada um, clip-path: inset() mostra só uma fatia da cópia e translate a desloca alguns pixels. Isso é a "falha".',
      'Como a maior parte dos quadros mostra a fatia vazia (inset 100%), o glitch acontece em rajadas curtas.',
    ],
    alternativa:
      'Com SVG: feColorMatrix separando canais + feOffset; com WebGL: um shader que desloca os canais R, G e B em faixas aleatórias (muito usado em transições de imagem).',
    compatibilidade:
      'clip-path inset(), attr() em content e animações: todos os navegadores atuais.',
    responsividade: 'O texto usa clamp(); o deslocamento é em px e continua sutil no celular.',
    acessibilidade:
      'O leitor de tela lê só o h1 (os pseudo-elementos de attr() não duplicam o conteúdo na maioria dos leitores, e o h1 tem aria-label). O efeito não pisca a tela toda (WCAG 2.3.1), mas com prefers-reduced-motion ele é desligado.',
    performance: 'Só clip-path e translate nos pseudo-elementos; sem JavaScript.',
    limitacoes: [
      'Funciona em textos de uma linha (white-space: nowrap); em várias linhas, as fatias cortam linhas diferentes de forma estranha.',
    ],
    referencias: [
      { titulo: 'MDN — attr()', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/attr' },
      {
        titulo: 'MDN — clip-path',
        url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/clip-path',
      },
      MDN.reduzir,
    ],
    validadoEm: VALIDADO_EM,
    status: 'validado',
  },
  params: [
    {
      id: 'intensidade',
      rotulo: 'deslocamento',
      tipo: 'range',
      min: 1,
      max: 10,
      passo: 1,
      unidade: 'px',
      padrao: 4,
    },
    {
      id: 'gatilho',
      rotulo: 'quando falha',
      tipo: 'select',
      opcoes: [
        { valor: 'rajadas', rotulo: 'em rajadas' },
        { valor: 'sempre', rotulo: 'sempre' },
        { valor: 'hover', rotulo: 'no hover/foco' },
      ],
      padrao: 'rajadas',
    },
    {
      id: 'cores',
      rotulo: 'cores separadas',
      tipo: 'select',
      opcoes: [
        { valor: 'rgb', rotulo: 'vermelho e ciano' },
        { valor: 'rosa-azul', rotulo: 'rosa e azul' },
        { valor: 'lima', rotulo: 'lima e magenta' },
      ],
      padrao: 'rgb',
    },
  ],
  gerar: (v) => {
    const d = Number(v['intensidade']);
    const [a, b] = PARES[String(v['cores'])];
    const hover = v['gatilho'] === 'hover';
    return {
      html: `<section class="cartaz">
  <h1 class="glitch" aria-label="${TEXTO}" data-texto="${TEXTO}"${hover ? ' tabindex="0"' : ''}>${TEXTO}</h1>
</section>`,
      css: `${cssPalco()}

.cartaz {
  display: grid;
  place-items: center;
  width: min(100%, 640px);
  aspect-ratio: 16 / 10;
  padding: 24px;
  border-radius: 20px;
  background: linear-gradient(160deg, #ff4d1a, #c22a0a);
}
.glitch {
  position: relative;
  margin: 0;
  color: #fff;
  font: 800 clamp(1.4rem, 6vw, 3.2rem) / 1 system-ui, sans-serif;
  letter-spacing: -0.03em;
  text-align: center;
  white-space: nowrap;
}
/* As duas cópias coloridas, exatamente sobre o texto */
.glitch::before,
.glitch::after {
  content: attr(data-texto);
  position: absolute;
  inset: 0;
  clip-path: inset(100% 0 0 0); /* escondidas */
}
.glitch::before { color: ${a}; mix-blend-mode: screen; }
.glitch::after { color: ${b}; mix-blend-mode: screen; }

/* Quadros da falha: cada um mostra uma fatia deslocada (a maioria fica vazia) */
@keyframes fatiar-a {
  0% { clip-path: inset(10% 0 70% 0); translate: -${d}px 0; }
  4% { clip-path: inset(55% 0 20% 0); translate: ${d}px 0; }
  8% { clip-path: inset(30% 0 50% 0); translate: -${Math.ceil(d / 2)}px 0; }
  12%, 100% { clip-path: inset(100% 0 0 0); translate: 0 0; }
}
@keyframes fatiar-b {
  0% { clip-path: inset(60% 0 15% 0); translate: ${d}px 0; }
  5% { clip-path: inset(20% 0 65% 0); translate: -${d}px 0; }
  9% { clip-path: inset(75% 0 5% 0); translate: ${Math.ceil(d / 2)}px 0; }
  14%, 100% { clip-path: inset(100% 0 0 0); translate: 0 0; }
}
${GATILHOS[String(v['gatilho'])]}

@media (prefers-reduced-motion: reduce) {
  .glitch::before, .glitch::after { animation: none !important; }
}`,
      js: `// Sem JavaScript: o efeito é todo em CSS (pseudo-elementos + clip-path).
// Para trocar o texto, mude o conteúdo E o atributo data-texto juntos:
// titulo.textContent = titulo.dataset.texto = 'novo texto';`,
    };
  },
  angular: (v) => ({
    ts: `import { Component } from '@angular/core';

/** glitch-text: efeito só de CSS — o texto vai no conteúdo e no data-texto. */
@Component({
  selector: 'app-glitch-text',
  templateUrl: './glitch-text.html',
  styleUrl: './glitch-text.css',
})
export class ${nomeClasse('glitch-text')} {
  protected readonly texto = '${TEXTO}';
}
`,
    html: `<section class="cartaz">
  <h1 class="glitch" [attr.aria-label]="texto" [attr.data-texto]="texto"${v['gatilho'] === 'hover' ? ' tabindex="0"' : ''}>{{ texto }}</h1>
</section>
`,
    css: cssAngular(GLITCH_TEXT.gerar(v).css),
  }),
  niveis: {
    iniciante: [
      'O título tem duas cópias escondidas, uma vermelha e uma ciano, bem em cima dele.',
      'De vez em quando, pedaços dessas cópias aparecem tortos para os lados, como uma TV com chiado.',
      'Logo depois tudo volta ao normal — por isso parece uma falha rápida.',
    ],
    avancado: [
      'content: attr(data-texto) evita repetir o texto no HTML; o Angular liga o atributo com [attr.data-texto].',
      'steps(1) troca os quadros de uma vez: sem interpolação, as fatias "pulam", que é a cara do glitch.',
      'Duas animações com durações diferentes (ou percentuais diferentes) desalinham as cópias e deixam a falha menos repetitiva.',
      'mix-blend-mode: screen nas cópias faz vermelho + ciano somarem branco onde se sobrepõem, como a separação de canais de uma tela real.',
    ],
  },
  glossario: [
    {
      termo: 'attr(data-texto)',
      explicacao: 'O pseudo-elemento copia o texto do atributo data-texto.',
    },
    { termo: 'clip-path: inset(', explicacao: 'Mostra só uma fatia horizontal da cópia.' },
    { termo: 'steps(1)', explicacao: 'Troca os quadros da falha de uma vez, sem transição.' },
    {
      termo: 'mix-blend-mode: screen',
      explicacao: 'Soma as cores das cópias, como canais de uma tela.',
    },
  ],
};
