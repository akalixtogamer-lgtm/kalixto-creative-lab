import { EffectKit } from '../../models/effect-sheet.model';
import { CORES, MDN, VALIDADO_EM, cssPalco } from './_base';

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
    alternativa: 'Sem @property: um pseudo-elemento maior, com o gradiente girando via transform: rotate, recortado pelo overflow: hidden do card.',
    compatibilidade: '@property: Chrome e Edge 85+, Safari 16.4+, Firefox 128+. Em navegadores sem suporte a borda aparece com o gradiente parado.',
    responsividade: 'A borda acompanha qualquer tamanho e raio do elemento.',
    acessibilidade: 'Puramente decorativo. A rotação para com prefers-reduced-motion, e o contraste do texto não depende da borda.',
    performance: 'Animar uma custom property repinta o elemento a cada quadro. Use em poucos elementos por tela.',
    limitacoes: ['Bordas muito finas (1 px) quase não mostram o gradiente.'],
    referencias: [MDN.property, MDN.conicGradient, MDN.reduzir],
    validadoEm: VALIDADO_EM,
    status: 'validado',
  },
  params: [
    { id: 'esp', rotulo: 'espessura', tipo: 'range', min: 1, max: 8, passo: 1, unidade: 'px', padrao: 3 },
    { id: 'vel', rotulo: 'tempo de uma volta', tipo: 'range', min: 1, max: 12, passo: 0.5, unidade: 's', padrao: 4 },
    { id: 'c1', rotulo: 'cor 1', tipo: 'select', opcoes: CORES, padrao: '#ff2bd6' },
    { id: 'c2', rotulo: 'cor 2', tipo: 'select', opcoes: CORES, padrao: '#22e3ff' },
    { id: 'raio', rotulo: 'arredondamento', tipo: 'range', min: 0, max: 40, passo: 2, unidade: 'px', padrao: 20 },
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
};
