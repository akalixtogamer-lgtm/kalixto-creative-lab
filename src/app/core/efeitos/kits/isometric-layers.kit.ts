import { EffectKit } from '../../models/effect-sheet.model';
import { MDN, VALIDADO_EM, cssAngular, cssPalco, nomeClasse } from './_base';

const TRACOS = [
  { valor: '#f4f2ff', rotulo: 'Branco' },
  { valor: '#ff2e3e', rotulo: 'Vermelho' },
  { valor: '#22e3ff', rotulo: 'Ciano' },
  { valor: '#c6ff3d', rotulo: 'Lima' },
] as const;

/** Camadas da pilha, de baixo para cima. */
const CAMADAS = ['Banco de dados', 'Design system', 'Protótipo', 'Deploy'];

export const ISOMETRIC_LAYERS: EffectKit = {
  ficha: {
    id: 'isometric-layers',
    nomeTecnico: 'Isometric Exploded Layers (CSS 3D)',
    nomeAmigavel: 'Interface isométrica em camadas',
    categoria: 'luz-profundidade',
    subcategoria: 'Camadas 3D e vistas explodidas',
    descricao:
      'Telas em traço fino, empilhadas numa vista isométrica, que se separam no espaço ao passar o mouse ou clicar — a "vista explodida" de um produto digital.',
    objetivoVisual:
      'Explicar que um produto é feito de partes (dados, design, protótipo, deploy) mostrando as camadas se afastando.',
    aplicacoes: [
      'Seções "como funciona"',
      'Apresentar uma arquitetura ou fluxo',
      'Heros de produtos SaaS',
    ],
    nivel: 'intermediario',
    tecnologias: ['HTML', 'CSS', 'JavaScript'],
    dependencias: [],
    interacoes: ['hover', 'click', 'keyboard'],
    tags: [
      'isométrico',
      'isometric',
      'exploded view',
      'vista explodida',
      'wireframe',
      'camadas',
      'preserve-3d',
      'referência em vídeo',
    ],
    explicacao: [
      'A .pilha recebe rotateX + rotateZ(-45deg): é isso que cria a vista isométrica (o "chão" visto de cima, na diagonal).',
      'transform-style: preserve-3d faz as camadas filhas viverem no mesmo espaço 3D da pilha, em vez de serem achatadas.',
      'Cada camada tem a posição --n. Fechada, todas ficam em translateZ(0); aberta, cada uma sobe n × separação pixels — e a transição faz o movimento.',
      'O "traço fino" é só border + gradientes lineares de 1px desenhando as linhas da tela, sem nenhuma imagem.',
    ],
    alternativa:
      'Em SVG, desenhando as telas já em perspectiva isométrica e animando o translate de cada grupo com GSAP; ou em Three.js com planos e EdgesGeometry.',
    compatibilidade: 'Transformações 3D e preserve-3d: todos os navegadores atuais.',
    responsividade:
      'O tamanho da pilha usa min() com a largura da tela; a separação máxima cabe na altura do palco do celular.',
    acessibilidade:
      'O botão "Separar camadas" funciona no teclado e informa o estado com aria-pressed. A pilha tem role="img" e um aria-label que descreve as camadas.',
    performance:
      'Só transform é animado (composição na GPU). Quatro camadas leves; dá para usar dezenas sem custo perceptível.',
    limitacoes: [
      'Textos dentro das camadas ficam inclinados (é a estética do efeito), por isso não use texto longo ou essencial dentro delas.',
      'overflow: hidden num ancestral achata o 3D: mantenha o palco sem overflow ou com espaço sobrando.',
    ],
    referencias: [MDN.transform, MDN.perspective, MDN.transition],
    validadoEm: VALIDADO_EM,
    status: 'validado',
  },
  params: [
    {
      id: 'separacao',
      rotulo: 'separação das camadas',
      tipo: 'range',
      min: 20,
      max: 120,
      passo: 5,
      unidade: 'px',
      padrao: 60,
    },
    {
      id: 'inclinacao',
      rotulo: 'inclinação (rotateX)',
      tipo: 'range',
      min: 40,
      max: 70,
      passo: 1,
      unidade: 'deg',
      padrao: 55,
    },
    { id: 'traco', rotulo: 'cor do traço', tipo: 'select', opcoes: TRACOS, padrao: '#f4f2ff' },
  ],
  gerar: (v) => {
    const sep = Number(v['separacao']);
    const traco = String(v['traco']);
    return {
      html: `<div class="pilha" role="img" aria-label="Pilha de camadas: ${CAMADAS.join(', ')}">
${CAMADAS.map((nome, n) => `  <div class="camada" style="--n: ${n}"><span>${nome}</span></div>`).join('\n')}
</div>
<button class="separar" type="button" aria-pressed="false">Separar camadas</button>`,
      css: `${cssPalco()}

/* Vista isométrica: deita o plano e gira 45° */
.pilha {
  position: relative;
  width: min(62vw, 260px);
  aspect-ratio: 4 / 3;
  margin-block: 170px 30px;
  transform: rotateX(${v['inclinacao']}deg) rotateZ(-45deg);
  transform-style: preserve-3d;
}

/* Cada camada é uma "tela" desenhada só com traço */
.camada {
  position: absolute;
  inset: 0;
  border: 1.5px solid ${traco};
  border-radius: 14px;
  background:
    linear-gradient(${traco}, ${traco}) 14px 34px / 45% 1px no-repeat,
    linear-gradient(${traco}, ${traco}) 14px 48px / 30% 1px no-repeat,
    linear-gradient(${traco}, ${traco}) 0 22px / 100% 1px no-repeat,
    rgb(11 10 20 / 0.82);
  transform: translateZ(0);
  transition: transform 700ms cubic-bezier(0.22, 1, 0.36, 1);
}
.camada span {
  position: absolute;
  right: 12px;
  bottom: 10px;
  color: ${traco};
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.8;
}

/* Aberta (hover ou botão): cada camada sobe n × separação */
.pilha:hover .camada,
.pilha.is-aberta .camada {
  transform: translateZ(calc(var(--n) * ${sep}px));
}

.separar {
  padding: 10px 20px;
  border: 1px solid #3a3456;
  border-radius: 999px;
  background: transparent;
  color: #f4f2ff;
  font: inherit;
  cursor: pointer;
}
.separar:focus-visible { outline: 2px solid #22e3ff; outline-offset: 3px; }

@media (prefers-reduced-motion: reduce) {
  .camada { transition: none; }
}`,
      js: `const pilha = document.querySelector('.pilha');
const botao = document.querySelector('.separar');

// alternativa ao hover (teclado e toque): abre e fecha a pilha
botao.addEventListener('click', () => {
  const aberta = pilha.classList.toggle('is-aberta');
  botao.setAttribute('aria-pressed', String(aberta));
  botao.textContent = aberta ? 'Juntar camadas' : 'Separar camadas';
});`,
    };
  },
  angular: (v) => ({
    ts: `import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-isometric-layers',
  templateUrl: './isometric-layers.html',
  styleUrl: './isometric-layers.css',
})
export class ${nomeClasse('isometric-layers')} {
  protected readonly camadas = ${JSON.stringify(CAMADAS).replace(/"/g, "'").replace(/','/g, "', '")};
  protected readonly descricao = 'Pilha de camadas: ' + this.camadas.join(', ');
  protected readonly aberta = signal(false);
}
`,
    html: `<div class="pilha" role="img" [attr.aria-label]="descricao" [class.is-aberta]="aberta()">
  @for (nome of camadas; track nome; let n = $index) {
    <div class="camada" [style.--n]="n"><span>{{ nome }}</span></div>
  }
</div>
<button class="separar" type="button" [attr.aria-pressed]="aberta()" (click)="aberta.set(!aberta())">
  {{ aberta() ? 'Juntar camadas' : 'Separar camadas' }}
</button>
`,
    css: cssAngular(ISOMETRIC_LAYERS.gerar(v).css),
  }),
  niveis: {
    iniciante: [
      'Quatro "telas" desenhadas só com linhas ficam empilhadas, como folhas de papel.',
      'A pilha é girada e deitada para parecer vista de cima, na diagonal (isso se chama vista isométrica).',
      'Ao passar o mouse ou clicar no botão, as telas se afastam umas das outras para cima.',
    ],
    avancado: [
      'rotateX seguido de rotateZ(-45deg): a ordem importa — primeiro deita o plano, depois gira sobre o próprio eixo.',
      'Sem perspective o resultado é uma projeção ortográfica, que é exatamente o que define a isometria (linhas paralelas continuam paralelas).',
      'Escalonar a transição com transition-delay: calc(var(--n) * 60ms) dá um efeito de "desmontar em sequência".',
      'Com ScrollTrigger e scrub, a separação pode acompanhar a rolagem, como nos sites de produto que explicam a arquitetura.',
    ],
  },
  glossario: [
    {
      termo: 'rotateZ(-45deg)',
      explicacao: 'Gira o plano deitado em 45°, formando a vista isométrica.',
    },
    { termo: 'preserve-3d', explicacao: 'Mantém as camadas no mesmo espaço 3D da pilha.' },
    {
      termo: 'translateZ(calc(var(--n) *',
      explicacao: 'Afasta cada camada de acordo com a posição dela na pilha.',
    },
    { termo: 'aria-pressed', explicacao: 'Diz ao leitor de tela se a pilha está aberta.' },
  ],
};
