import { EffectKit } from '../../models/effect-sheet.model';
import { MDN, VALIDADO_EM, cssAngular, cssPalco, nomeClasse } from './_base';

const CORES_INFLADAS = [
  { valor: '#8fd3ff', rotulo: 'Azul bebê' },
  { valor: '#ff2e3e', rotulo: 'Vermelho' },
  { valor: '#c6ff3d', rotulo: 'Lima' },
  { valor: '#ff8ad8', rotulo: 'Chiclete' },
] as const;

const PALAVRA = 'TRABALHOS';

/** Escurece uma cor #rrggbb (f = 0 mantém, f = 1 vira preto). */
function escurecer(hex: string, f: number): string {
  const n = parseInt(hex.slice(1), 16);
  const c = [n >> 16, (n >> 8) & 255, n & 255].map((x) => Math.round(x * (1 - f)));
  return '#' + c.map((x) => x.toString(16).padStart(2, '0')).join('');
}

export const PUFFY_TEXT: EffectKit = {
  ficha: {
    id: 'puffy-text',
    nomeTecnico: 'Puffy / Inflated Text (text-shadow em camadas)',
    nomeAmigavel: 'Tipografia inflada',
    categoria: 'tipografia',
    subcategoria: 'Volume e tipografia 3D',
    descricao: 'Letras grossas que parecem infladas, com volume feito de sombras empilhadas; cada letra "respira" e estufa quando o mouse passa por cima.',
    objetivoVisual: 'Dar um ar tátil e divertido a títulos de seção, como letras de balão ou de borracha.',
    aplicacoes: ['Títulos de seção ("Trabalhos", "Contato")', 'Marcas jovens e de entretenimento', 'Posters e capas em HTML'],
    nivel: 'iniciante',
    tecnologias: ['HTML', 'CSS', 'JavaScript'],
    dependencias: [],
    interacoes: ['hover', 'autoplay'],
    tags: ['puffy', 'inflado', 'inflated', '3d text', 'text-shadow', 'balão', 'tipografia 3d', 'referência em vídeo'],
    explicacao: [
      'O volume é uma pilha de text-shadow: cada sombra desce 1px a mais, numa cor mais escura que a letra. Juntas, parecem a lateral de um objeto.',
      'Uma última sombra, borrada e transparente, faz a sombra no "chão". -webkit-text-stroke claro desenha o brilho na borda de cima.',
      'Cada letra é um <span> com a posição --i. A animação "respirar" mexe na propriedade scale com atraso por letra, como uma onda.',
      'No hover, a letra ganha transform: scale() com uma curva elástica. Como respirar usa scale e o hover usa transform, um não apaga o outro.',
    ],
    alternativa: 'Para volume real com luz e reflexo, use Three.js com TextGeometry (bevel alto) ou um modelo 3D exportado do Spline/Blender.',
    compatibilidade: 'text-shadow múltiplo, -webkit-text-stroke e a propriedade individual scale: todos os navegadores atuais.',
    responsividade: 'O tamanho da fonte usa clamp(); a profundidade é em px fixos e continua proporcional nas telas menores.',
    acessibilidade: 'O título tem aria-label com a palavra inteira e as letras são aria-hidden. A respiração é lenta e de baixa amplitude; com prefers-reduced-motion ela para e o hover não anima.',
    performance: 'Sombras de texto com muitas camadas custam na pintura. A respiração anima só scale (composição), sem repintar as sombras a cada quadro.',
    limitacoes: [
      'Sombras empilhadas criam volume para baixo apenas; não há luz que muda com o ângulo.',
      'Com volume muito alto em fontes finas, as camadas aparecem como "degraus". Use fontes bem pesadas (900).',
    ],
    referencias: [
      { titulo: 'MDN — text-shadow', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/text-shadow' },
      { titulo: 'MDN — scale (propriedade)', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/scale' },
      MDN.reduzir,
    ],
    validadoEm: VALIDADO_EM,
    status: 'validado',
  },
  params: [
    { id: 'volume', rotulo: 'volume (camadas)', tipo: 'range', min: 2, max: 12, passo: 1, unidade: 'px', padrao: 7 },
    { id: 'cor', rotulo: 'cor', tipo: 'select', opcoes: CORES_INFLADAS, padrao: '#8fd3ff' },
    { id: 'estufar', rotulo: 'estufar no hover', tipo: 'range', min: 1, max: 1.4, passo: 0.02, unidade: '×', padrao: 1.18 },
  ],
  gerar: (v) => {
    const cor = String(v['cor']);
    const vol = Number(v['volume']);
    const lateral = escurecer(cor, 0.45);
    const camadas = Array.from({ length: vol }, (_, k) => `    0 ${k + 1}px 0 ${lateral}`);
    camadas.push(`    0 ${vol + 6}px 18px rgb(0 0 0 / 0.45)`);
    return {
      html: `<h1 class="inflado" aria-label="${PALAVRA}"></h1>`,
      css: `${cssPalco()}

.inflado {
  margin: 0;
  font: 900 clamp(2.4rem, 11vw, 6rem) / 1 'Arial Black', 'Helvetica Neue', system-ui, sans-serif;
  letter-spacing: 0.02em;
  color: ${cor};
  -webkit-text-stroke: 2px rgb(255 255 255 / 0.35);
}

/* Volume: uma sombra por pixel de profundidade + a sombra no chão */
.letra {
  display: inline-block;
  text-shadow:
${camadas.join(',\n')};
  transition: transform 450ms cubic-bezier(0.34, 1.56, 0.64, 1);
  animation: respirar 3200ms ease-in-out calc(var(--i) * 120ms) infinite;
}
.letra:hover { transform: scale(${v['estufar']}) translateY(-4%); }

/* respirar mexe em "scale"; o hover mexe em "transform": um não apaga o outro */
@keyframes respirar {
  50% { scale: 1.04 0.97; }
}

@media (prefers-reduced-motion: reduce) {
  .letra { animation: none; transition: none; }
}`,
      js: `const titulo = document.querySelector('.inflado');

// uma letra por <span>, com a posição em --i (para a onda da respiração)
titulo.replaceChildren(
  ...[...titulo.getAttribute('aria-label')].map((caractere, i) => {
    const letra = document.createElement('span');
    letra.className = 'letra';
    letra.textContent = caractere;
    letra.setAttribute('aria-hidden', 'true');
    letra.style.setProperty('--i', i);
    return letra;
  }),
);`,
    };
  },
  angular: (v) => ({
    ts: `import { Component } from '@angular/core';

@Component({
  selector: 'app-puffy-text',
  templateUrl: './puffy-text.html',
  styleUrl: './puffy-text.css',
})
export class ${nomeClasse('puffy-text')} {
  protected readonly palavra = '${PALAVRA}';
  protected readonly letras = [...this.palavra];
}
`,
    html: `<h1 class="inflado" [attr.aria-label]="palavra">
  @for (l of letras; track $index) {
    <span class="letra" aria-hidden="true" [style.--i]="$index">{{ l }}</span>
  }
</h1>
`,
    css: cssAngular(PUFFY_TEXT.gerar(v).css),
  }),
  niveis: {
    iniciante: [
      'As letras são grossas e coloridas, com uma "lateral" mais escura embaixo — parecem objetos fofos, como balões.',
      'Essa lateral é feita de várias sombras, uma embaixo da outra.',
      'As letras respiram devagar, uma depois da outra, e estufam quando o mouse passa por cima.',
    ],
    avancado: [
      'Gerar as sombras em código (um loop de 1px até o volume) evita escrever dezenas de valores à mão e deixa a profundidade ajustável.',
      'scale com dois valores (1.04 0.97) achata e alarga ao mesmo tempo: é o "squash and stretch" da animação clássica.',
      'Propriedades individuais (scale, translate, rotate) se combinam com transform na ordem translate → rotate → scale → transform.',
      'A cor da lateral é calculada escurecendo a cor principal; em CSS puro, color-mix(in oklab, cor, black 45%) faz o mesmo.',
    ],
  },
  glossario: [
    { termo: 'text-shadow', explicacao: 'Sombras do texto; empilhadas, viram o volume da letra.' },
    { termo: '-webkit-text-stroke', explicacao: 'Contorno das letras — aqui, claro, faz o brilho da borda.' },
    { termo: 'scale: 1.04 0.97', explicacao: 'Achata e alarga a letra: a respiração.' },
    { termo: 'cubic-bezier(0.34, 1.56, 0.64, 1)', explicacao: 'Curva que passa do ponto e volta: o "estufar" elástico.' },
  ],
};
