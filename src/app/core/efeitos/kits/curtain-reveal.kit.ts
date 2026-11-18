import { EffectKit } from '../../models/effect-sheet.model';
import { VALIDADO_EM, cssAngular, cssPalco, nomeClasse } from './_base';

const TECIDOS = [
  { valor: '#7a1030', rotulo: 'Vinho' },
  { valor: '#8a8f99', rotulo: 'Cinza linho' },
  { valor: '#1e2a5a', rotulo: 'Azul-noite' },
] as const;

/** Como cada metade se move ao abrir. */
const ABERTURAS: Record<string, string> = {
  lados: `.cortina.esq { transform-origin: left center; }
.cortina.dir { transform-origin: right center; }
.palco-cortina.is-aberta .cortina { transform: scaleX(0.08); }`,
  cima: `.cortina.esq, .cortina.dir { transform-origin: center top; }
.palco-cortina.is-aberta .cortina { transform: scaleY(0.06); }`,
};

export const CURTAIN_REVEAL: EffectKit = {
  ficha: {
    id: 'curtain-reveal',
    nomeTecnico: 'Fabric Curtain Reveal',
    nomeAmigavel: 'Cortina que se abre',
    categoria: 'transicoes',
    subcategoria: 'Revelação de página',
    descricao: 'Duas metades de cortina de tecido, com dobras e sombra, se recolhem para os lados (ou sobem) e revelam o conteúdo — como a abertura de um palco.',
    objetivoVisual: 'Fazer da entrada da página um "momento de estreia", com cara de teatro, museu ou campanha artística.',
    aplicacoes: ['Abertura de portfólio e campanha', 'Lançamentos e eventos', 'Revelar um produto ou resultado'],
    nivel: 'intermediario',
    tecnologias: ['HTML', 'CSS', 'JavaScript'],
    dependencias: [],
    interacoes: ['click', 'keyboard', 'autoplay'],
    tags: ['cortina', 'curtain', 'palco', 'reveal', 'tecido', 'scaleX', 'transform-origin', 'referência em vídeo'],
    explicacao: [
      'Cada metade é um painel que ocupa metade do palco. O "tecido" é um repeating-linear-gradient horizontal alternando faixas claras e escuras: são as dobras.',
      'Para abrir, o painel não desliza: ele encolhe na largura (scaleX) a partir da borda de fora (transform-origin). As dobras se apertam, como pano sendo recolhido.',
      'Um gradiente por cima escurece a borda de dentro e o pé da cortina, dando volume.',
      'A cortina abre sozinha ao carregar e o botão abre e fecha de novo; o conteúdo atrás é HTML normal.',
    ],
    alternativa: 'Com WebGL, um plano subdividido com ondas no vertex shader dá o balanço do tecido; em vídeo, um loop de cortina com fundo transparente (WebM com alfa).',
    compatibilidade: 'Transformações e gradientes repetidos: todos os navegadores atuais.',
    responsividade: 'Painéis em %, então a cortina cobre qualquer proporção de palco.',
    acessibilidade: 'O conteúdo atrás existe no HTML desde o início (a cortina é aria-hidden). O botão informa o estado com aria-pressed. Com prefers-reduced-motion a cortina já começa aberta, sem animação.',
    performance: 'Só transform anima; os gradientes são desenhados uma vez.',
    limitacoes: ['scaleX achata as dobras em vez de enrugá-las de verdade; para pano realista, use vídeo ou WebGL.'],
    referencias: [
      { titulo: 'MDN — repeating-linear-gradient()', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/repeating-linear-gradient' },
      { titulo: 'MDN — transform-origin', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/transform-origin' },
      { titulo: 'MDN — prefers-reduced-motion', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion' },
    ],
    validadoEm: VALIDADO_EM,
    status: 'validado',
  },
  params: [
    { id: 'duracao', rotulo: 'tempo para abrir', tipo: 'range', min: 600, max: 2500, passo: 100, unidade: 'ms', padrao: 1400 },
    {
      id: 'abertura',
      rotulo: 'como abre',
      tipo: 'select',
      opcoes: [
        { valor: 'lados', rotulo: 'para os lados' },
        { valor: 'cima', rotulo: 'para cima' },
      ],
      padrao: 'lados',
    },
    { id: 'tecido', rotulo: 'cor do tecido', tipo: 'select', opcoes: TECIDOS, padrao: '#7a1030' },
  ],
  gerar: (v) => {
    const cor = String(v['tecido']);
    return {
      html: `<section class="palco-cortina">
  <div class="cena-atras">
    <h1>A estreia começa agora</h1>
  </div>
  <div class="cortina esq" aria-hidden="true"></div>
  <div class="cortina dir" aria-hidden="true"></div>
</section>
<button class="abrir" type="button" aria-pressed="false">Fechar cortina</button>`,
      css: `${cssPalco()}

.palco-cortina {
  position: relative;
  width: min(100%, 680px);
  aspect-ratio: 16 / 10;
  border-radius: 20px;
  overflow: hidden;
}
.cena-atras {
  display: grid;
  place-items: center;
  height: 100%;
  padding: 24px;
  text-align: center;
  background:
    radial-gradient(circle at 75% 25%, #fff 0 6%, transparent 7%),
    radial-gradient(ellipse at 30% 80%, rgb(255 255 255 / 0.9) 0 12%, transparent 13%),
    linear-gradient(180deg, #1f6fff, #6aa8ff);
}
.cena-atras h1 { margin: 0; font: 400 clamp(1.8rem, 7vw, 3.4rem) / 1.05 Georgia, serif; }

/* O tecido: dobras com faixas claras e escuras + sombra para dar volume */
.cortina {
  position: absolute;
  top: 0;
  width: 50%;
  height: 100%;
  background:
    linear-gradient(180deg, transparent 70%, rgb(0 0 0 / 0.35)),
    repeating-linear-gradient(90deg, rgb(0 0 0 / 0.28) 0 6px, rgb(255 255 255 / 0.1) 14px, rgb(0 0 0 / 0.28) 26px),
    ${cor};
  transition: transform ${v['duracao']}ms cubic-bezier(0.65, 0, 0.35, 1);
}
.cortina.esq { left: 0; box-shadow: inset -18px 0 30px rgb(0 0 0 / 0.45); }
.cortina.dir { right: 0; box-shadow: inset 18px 0 30px rgb(0 0 0 / 0.45); }

/* Abertura */
${ABERTURAS[String(v['abertura'])]}

.abrir {
  padding: 10px 20px;
  border: 1px solid #3a3456;
  border-radius: 999px;
  background: transparent;
  color: #f4f2ff;
  font: inherit;
  cursor: pointer;
}
.abrir:focus-visible { outline: 2px solid #22e3ff; outline-offset: 3px; }

@media (prefers-reduced-motion: reduce) {
  .cortina { transition: none; }
}`,
      js: `const palco = document.querySelector('.palco-cortina');
const botao = document.querySelector('.abrir');

function definir(aberta) {
  palco.classList.toggle('is-aberta', aberta);
  botao.setAttribute('aria-pressed', String(!aberta));
  botao.textContent = aberta ? 'Fechar cortina' : 'Abrir cortina';
}

// abre sozinha logo depois de carregar (dois quadros: o navegador desenha fechada primeiro)
requestAnimationFrame(() => requestAnimationFrame(() => definir(true)));
botao.addEventListener('click', () => definir(!palco.classList.contains('is-aberta')));`,
    };
  },
  angular: (v) => ({
    ts: `import { Component, afterNextRender, signal } from '@angular/core';

@Component({
  selector: 'app-curtain-reveal',
  templateUrl: './curtain-reveal.html',
  styleUrl: './curtain-reveal.css',
})
export class ${nomeClasse('curtain-reveal')} {
  protected readonly aberta = signal(false);

  constructor() {
    // abre logo depois do primeiro desenho (fechada → aberta, com transição)
    afterNextRender(() => requestAnimationFrame(() => this.aberta.set(true)));
  }
}
`,
    html: `<section class="palco-cortina" [class.is-aberta]="aberta()">
  <div class="cena-atras">
    <h1>A estreia começa agora</h1>
  </div>
  <div class="cortina esq" aria-hidden="true"></div>
  <div class="cortina dir" aria-hidden="true"></div>
</section>
<button class="abrir" type="button" [attr.aria-pressed]="!aberta()" (click)="aberta.set(!aberta())">
  {{ aberta() ? 'Fechar cortina' : 'Abrir cortina' }}
</button>
`,
    css: cssAngular(CURTAIN_REVEAL.gerar(v).css),
  }),
  niveis: {
    iniciante: [
      'Há duas metades de cortina na frente do conteúdo, como num teatro.',
      'Ao abrir, cada metade se encolhe para o seu lado (ou sobe), e o pano fica todo franzido na beirada.',
      'O botão fecha e abre a cortina de novo.',
    ],
    avancado: [
      'scaleX com transform-origin na borda externa é o truque: o painel "recolhe" para a borda em vez de sair da tela, e as faixas do gradiente se comprimem como dobras.',
      'Dois requestAnimationFrame seguidos garantem que o navegador desenhe o estado fechado antes de aplicar a classe aberta — senão a transição não acontece.',
      'box-shadow inset na borda de dentro dá a sombra do volume do pano sem imagem.',
      'No Angular, afterNextRender + requestAnimationFrame cumprem o mesmo papel do duplo quadro.',
    ],
  },
  glossario: [
    { termo: 'repeating-linear-gradient', explicacao: 'Faixas repetidas claras e escuras: as dobras do tecido.' },
    { termo: 'transform-origin', explicacao: 'A metade encolhe a partir da borda de fora.' },
    { termo: 'scaleX(0.08)', explicacao: 'Cortina recolhida: quase sem largura.' },
    { termo: 'aria-pressed', explicacao: 'Informa se a cortina está fechada.' },
  ],
};
