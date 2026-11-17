import { EffectKit } from '../../models/effect-sheet.model';
import { CSS_REPETIR, EASINGS, MDN, VALIDADO_EM, cssPalco } from './_base';

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
};
