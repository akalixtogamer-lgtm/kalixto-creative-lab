import { EffectKit } from '../../models/effect-sheet.model';
import { CORES, MDN, VALIDADO_EM, cssAngular, cssPalco, tsSimples } from './_base';

export const ANIMATED_BORDER: EffectKit = {
  ficha: {
    id: 'animated-border',
    nomeTecnico: 'Animated Border (conic gradient)',
    nomeAmigavel: 'Borda animada',
    categoria: 'microinteracoes',
    subcategoria: 'Bordas',
    descricao: 'Uma borda em gradiente que gira em volta do elemento sem parar.',
    objetivoVisual: 'Chamar atenção para um card ou plano em destaque.',
    aplicacoes: ['Plano "recomendado" numa tabela de preços', 'Card em destaque', 'Campo ativo'],
    nivel: 'intermediario',
    tecnologias: ['HTML', 'CSS'],
    dependencias: [],
    interacoes: ['autoplay'],
    tags: ['borda', 'border', 'conic-gradient', '@property', 'gradiente', 'destaque'],
    explicacao: [
      'A borda é transparente e o elemento tem dois fundos: um sólido limitado ao padding-box (o miolo) e um conic-gradient no border-box (aparece só na faixa da borda).',
      '@property registra --angulo como <angle>. Só assim o navegador consegue interpolar a variável numa animação.',
      'A animação gira --angulo de 0 a 360°, e o conic-gradient usa esse valor como ponto de partida, então a cor percorre a borda.',
      'Este efeito não usa JavaScript.',
    ],
    alternativa:
      'Sem @property: um pseudo-elemento maior, com o gradiente girando via transform: rotate, recortado pelo overflow: hidden do card.',
    compatibilidade:
      '@property: Chrome e Edge 85+, Safari 16.4+, Firefox 128+. Em navegadores sem suporte a borda aparece com o gradiente parado.',
    responsividade: 'A borda acompanha qualquer tamanho e raio do elemento.',
    acessibilidade:
      'Puramente decorativo. A rotação para com prefers-reduced-motion, e o contraste do texto não depende da borda.',
    performance:
      'Animar uma custom property repinta o elemento a cada quadro. Use em poucos elementos por tela.',
    limitacoes: ['Bordas muito finas (1 px) quase não mostram o gradiente.'],
    referencias: [MDN.property, MDN.conicGradient, MDN.reduzir],
    validadoEm: VALIDADO_EM,
    status: 'validado',
  },
  params: [
    {
      id: 'esp',
      rotulo: 'espessura',
      tipo: 'range',
      min: 1,
      max: 8,
      passo: 1,
      unidade: 'px',
      padrao: 3,
    },
    {
      id: 'vel',
      rotulo: 'tempo de uma volta',
      tipo: 'range',
      min: 1,
      max: 12,
      passo: 0.5,
      unidade: 's',
      padrao: 4,
    },
    { id: 'c1', rotulo: 'cor 1', tipo: 'select', opcoes: CORES, padrao: '#ff2bd6' },
    { id: 'c2', rotulo: 'cor 2', tipo: 'select', opcoes: CORES, padrao: '#22e3ff' },
    {
      id: 'raio',
      rotulo: 'arredondamento',
      tipo: 'range',
      min: 0,
      max: 40,
      passo: 2,
      unidade: 'px',
      padrao: 20,
    },
  ],
  gerar: (v) => ({
    html: `<article class="borda">
  <h2>Plano Pro</h2>
  <p>O card em destaque.</p>
</article>`,
    css: `${cssPalco()}

/* Registra a variável como ângulo para ela poder ser animada */
@property --angulo {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}

/* O efeito */
.borda {
  width: min(80vw, 320px);
  padding: 32px;
  border: ${v['esp']}px solid transparent;
  border-radius: ${v['raio']}px;
  background:
    linear-gradient(#0f0d1a, #0f0d1a) padding-box,
    conic-gradient(from var(--angulo), ${v['c1']}, ${v['c2']}, ${v['c1']}) border-box;
  animation: girar ${v['vel']}s linear infinite;
}

.borda h2 { margin: 0 0 6px; }
.borda p { margin: 0; color: #c9c3ea; }

@keyframes girar {
  to { --angulo: 360deg; }
}

@media (prefers-reduced-motion: reduce) {
  .borda { animation: none; }
}`,
    js: `// Este efeito não precisa de JavaScript.`,
  }),
  angular: (v) => ({
    ts: tsSimples('animated-border'),
    html: `<article class="borda">\n  <h2>Plano Pro</h2>\n  <p>O card em destaque.</p>\n</article>\n`,
    css: cssAngular(ANIMATED_BORDER.gerar(v).css),
  }),
  niveis: {
    iniciante: [
      'A borda é transparente e, por trás dela, existe um degradê circular colorido.',
      'O miolo do card tem um fundo escuro por cima, então o degradê só aparece na faixa da borda.',
      'O degradê gira o tempo todo, e a cor parece correr em volta do card.',
    ],
    avancado: [
      'Dois fundos com caixas diferentes: padding-box (miolo sólido) e border-box (gradiente) — a borda transparente revela o segundo.',
      '@property registra --angulo como <angle>; sem isso a variável é texto e a animação só "pula" no fim.',
      'Animar custom property invalida o estilo e repinta o elemento a cada quadro — use em poucos elementos.',
      'Fallback: sem suporte a @property, o gradiente aparece parado, então a borda continua bonita.',
    ],
  },
  glossario: [
    {
      termo: '@property',
      explicacao: 'Registra a variável com tipo (<angle>) para ela poder ser animada.',
    },
    {
      termo: 'conic-gradient',
      explicacao: 'Degradê que gira em volta de um centro, como um relógio.',
    },
    {
      termo: 'padding-box',
      explicacao: 'Faz o fundo ocupar só o miolo, sem passar por baixo da borda.',
    },
    {
      termo: 'border-box',
      explicacao: 'Faz o fundo ocupar até a borda — é o que aparece na faixa transparente.',
    },
    { termo: 'linear infinite', explicacao: 'Velocidade constante, girando para sempre.' },
  ],
};
