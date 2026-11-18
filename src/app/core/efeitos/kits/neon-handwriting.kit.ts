import { EffectKit } from '../../models/effect-sheet.model';
import { MDN, VALIDADO_EM, cssAngular, cssPalco, htmlRepetir, tsRepetir } from './_base';

const NEONS = [
  { valor: '#ff2e3e', rotulo: 'Vermelho' },
  { valor: '#ff2bd6', rotulo: 'Magenta' },
  { valor: '#22e3ff', rotulo: 'Ciano' },
  { valor: '#c6ff3d', rotulo: 'Lima' },
] as const;

const SVG = `<svg class="neon" viewBox="0 0 640 220" role="img" aria-label="hand-off">
    <text class="escrita" x="50%" y="62%" text-anchor="middle">hand-off</text>
  </svg>`;

export const NEON_HANDWRITING: EffectKit = {
  ficha: {
    id: 'neon-handwriting',
    nomeTecnico: 'Neon Handwriting (SVG stroke + glow)',
    nomeAmigavel: 'Escrita neon à mão',
    categoria: 'tipografia',
    subcategoria: 'Texto desenhado e letreiros',
    descricao: 'Uma palavra em letra cursiva é "escrita" traço a traço e depois acende como um letreiro de neon, com uma leve oscilação de luz.',
    objetivoVisual: 'Dar ênfase emocional a uma palavra-chave, como a palavra manuscrita em destaque no meio de uma frase.',
    aplicacoes: ['Palavra de destaque num título', 'Assinaturas e logos manuscritos', 'Letreiros de eventos e bares'],
    nivel: 'intermediario',
    tecnologias: ['SVG', 'CSS', 'JavaScript'],
    dependencias: [],
    interacoes: ['autoplay', 'click'],
    tags: ['neon', 'glow', 'handwriting', 'manuscrito', 'stroke-dashoffset', 'letreiro', 'svg text', 'referência em vídeo'],
    explicacao: [
      'O texto é um <text> de SVG com contorno (stroke). stroke-dasharray transforma o contorno em um traço gigante seguido de um vazio do mesmo tamanho.',
      'Começando com stroke-dashoffset igual ao tamanho do traço, nada aparece; animando até 0, o contorno é "desenhado" na tela.',
      'Quando a escrita termina, uma segunda animação acende o preenchimento (fill-opacity) e duas drop-shadow da mesma cor fazem o brilho do neon.',
      'A terceira animação, infinita, baixa a opacidade em instantes irregulares: é a oscilação típica de um letreiro de neon de verdade.',
    ],
    alternativa: 'Para uma escrita realmente "à mão", converta a palavra em <path> (no Figma ou Illustrator) e use pathLength="1" — o traço segue a ordem em que a letra é desenhada.',
    compatibilidade: 'stroke-dasharray em <text> e filter: drop-shadow() em SVG: todos os navegadores atuais. A fonte cursiva depende do sistema (Segoe Script no Windows, Snell Roundhand no macOS/iOS).',
    responsividade: 'O SVG usa viewBox, então a palavra escala com a largura do palco sem perder nitidez.',
    acessibilidade: 'O SVG tem role="img" e aria-label com a palavra. A oscilação é sutil (sem flashes acima de 3 por segundo) e some com prefers-reduced-motion, que mostra o letreiro já aceso.',
    performance: 'drop-shadow é recalculado a cada quadro da oscilação. Num letreiro pequeno é leve; em textos enormes, prefira oscilar só o brilho de uma camada separada.',
    limitacoes: [
      'Num <text>, o traço é desenhado no contorno de cada letra ao mesmo tempo, não na ordem da escrita. Para ordem real, use path (veja a alternativa).',
      'O tamanho do traço (stroke-dasharray) precisa ser maior que o contorno da palavra; palavras mais longas pedem um valor maior.',
    ],
    referencias: [
      { titulo: 'MDN — stroke-dashoffset', url: 'https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dashoffset' },
      { titulo: 'MDN — filter: drop-shadow()', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/filter-function/drop-shadow' },
      MDN.reduzir,
    ],
    validadoEm: VALIDADO_EM,
    status: 'validado',
  },
  params: [
    { id: 'duracao', rotulo: 'tempo da escrita', tipo: 'range', min: 800, max: 4000, passo: 100, unidade: 'ms', padrao: 2200 },
    { id: 'cor', rotulo: 'cor do neon', tipo: 'select', opcoes: NEONS, padrao: '#ff2e3e' },
    { id: 'brilho', rotulo: 'intensidade do brilho', tipo: 'range', min: 0, max: 24, passo: 2, unidade: 'px', padrao: 10 },
  ],
  gerar: (v) => {
    const dur = Number(v['duracao']);
    const cor = String(v['cor']);
    const b = Number(v['brilho']);
    return {
      html: `${SVG.replace(/\n {2}/g, '\n')}
<button class="repetir" type="button">Repetir</button>`,
      css: `${cssPalco()}

.neon { width: min(100%, 640px); overflow: visible; }

.neon .escrita {
  font: italic 700 120px 'Segoe Script', 'Snell Roundhand', 'Brush Script MT', cursive;
  fill: ${cor};
  fill-opacity: 0;
  stroke: ${cor};
  stroke-width: 2px;
  /* traço gigante + vazio do mesmo tamanho; o deslocamento esconde tudo */
  stroke-dasharray: 1400;
  stroke-dashoffset: 1400;
  filter: drop-shadow(0 0 ${b}px ${cor}) drop-shadow(0 0 ${b * 2}px ${cor});
  animation:
    escrever ${dur}ms cubic-bezier(0.45, 0, 0.25, 1) forwards,
    acender 400ms ease ${dur}ms forwards,
    oscilar 4s linear ${dur + 400}ms infinite;
}
@keyframes escrever { to { stroke-dashoffset: 0; } }
@keyframes acender { to { fill-opacity: 1; } }
@keyframes oscilar {
  0%, 17%, 21%, 24%, 52%, 56%, 100% { opacity: 1; }
  19%, 23%, 54% { opacity: 0.6; }
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
.repetir:focus-visible { outline: 2px solid #22e3ff; outline-offset: 3px; }

@media (prefers-reduced-motion: reduce) {
  .neon .escrita { animation: none; stroke-dashoffset: 0; fill-opacity: 1; }
}`,
      js: `// Repetir: tira a classe, força o navegador a recalcular e coloca de novo
const alvo = document.querySelector('.neon text');
document.querySelector('.repetir').addEventListener('click', () => {
  alvo.classList.remove('escrita');
  void alvo.getBoundingClientRect(); // elementos SVG não têm offsetWidth: isto força o reflow
  alvo.classList.add('escrita');
});`,
    };
  },
  angular: (v) => ({
    ts: tsRepetir('neon-handwriting'),
    html: htmlRepetir(SVG),
    css: cssAngular(NEON_HANDWRITING.gerar(v).css),
  }),
  niveis: {
    iniciante: [
      'A palavra começa invisível e vai sendo desenhada, como se uma caneta passasse pelas letras.',
      'Quando termina de desenhar, as letras se enchem de cor e ganham um brilho em volta, igual a um letreiro de neon.',
      'De vez em quando o brilho dá uma piscadinha fraca, como uma lâmpada de neon de verdade.',
    ],
    avancado: [
      'Três animações encadeadas só pelo atraso: escrever (0 → dur), acender (dur → dur+400ms) e oscilar (a partir de dur+400ms, infinita).',
      'Duas drop-shadow empilhadas (raio r e 2r) imitam o halo do neon melhor que uma só: a primeira dá o núcleo, a segunda o espalhamento.',
      'Num SVG, filter vale para o elemento inteiro; para animar só o brilho sem repintar o texto, duplique o <text> (um para o traço, outro com o filtro).',
      'O Repetir remove a classe .escrita, força um reflow (getBoundingClientRect, porque SVG não tem offsetWidth) e devolve a classe — todas as três animações recomeçam do zero.',
    ],
  },
  glossario: [
    { termo: 'stroke-dasharray', explicacao: 'Transforma o contorno das letras em traço + vazio.' },
    { termo: 'stroke-dashoffset', explicacao: 'Desloca o traço; animar até 0 "desenha" a palavra.' },
    { termo: 'drop-shadow', explicacao: 'Sombra que segue a forma das letras — aqui, colorida, vira brilho.' },
    { termo: 'fill-opacity', explicacao: 'Transparência só do preenchimento das letras.' },
  ],
};
