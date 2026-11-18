import { EffectKit } from '../../models/effect-sheet.model';
import { EASINGS, MDN, VALIDADO_EM, cssAngular, cssPalco, nomeClasse } from './_base';

/** Os "mundos" da vitrine: cor de fundo e cor da tinta (texto). */
const TEMAS = [
  { nome: 'Lima', fundo: '#c6ff3d', tinta: '#0b0a14' },
  { nome: 'Fogo', fundo: '#ff5a1f', tinta: '#1a0800' },
  { nome: 'Gelo', fundo: '#bfe3ff', tinta: '#0a2540' },
  { nome: 'Noite', fundo: '#2a1f6b', tinta: '#f4f2ff' },
];

export const THEME_WIPE: EffectKit = {
  ficha: {
    id: 'theme-wipe',
    nomeTecnico: 'Theme Switch with Circular Wipe (clip-path)',
    nomeAmigavel: 'Troca de mundo com revelação circular',
    categoria: 'transicoes',
    subcategoria: 'Troca de tema e de cenário',
    descricao: 'Ao escolher uma cor, o novo "mundo" (fundo, texto e figura) cresce em círculo a partir do botão e cobre o anterior — um estilo, vários cenários.',
    objetivoVisual: 'Mostrar o mesmo produto em vários universos visuais, com uma troca que parece uma explosão de cor saindo do botão.',
    aplicacoes: ['Vitrine de coleções e variações de produto', 'Troca de tema claro/escuro', 'Heros de moda e e-commerce'],
    nivel: 'intermediario',
    tecnologias: ['HTML', 'CSS', 'JavaScript'],
    dependencias: [],
    interacoes: ['click', 'keyboard'],
    tags: ['tema', 'theme switch', 'wipe', 'clip-path', 'circle', 'revelação', 'coleção', 'referência em vídeo'],
    explicacao: [
      'Cada mundo é uma camada absoluta que ocupa a vitrine inteira. Trocar de mundo = colocar uma camada nova por cima.',
      'A camada nova nasce com clip-path: circle(0% at x y) — invisível — e a animação abre o círculo até 150%, que cobre até os cantos.',
      'x e y vêm do centro do botão clicado (ou do meio da vitrine), gravados nas variáveis --x e --y da camada.',
      'No fim da animação (animationend), as camadas antigas saem do DOM: a vitrine nunca acumula mais de duas.',
    ],
    alternativa: 'A View Transitions API (document.startViewTransition) faz o mesmo trocando o DOM de uma vez e animando ::view-transition-new(root) com clip-path — ótimo para trocar o tema da página inteira.',
    compatibilidade: 'clip-path: circle() animado e variáveis dentro de @keyframes: todos os navegadores atuais.',
    responsividade: 'A figura e o título usam porcentagens e clamp(); o círculo de 150% cobre qualquer proporção de tela.',
    acessibilidade: 'Os botões de cor têm nome ("Mundo Lima"…) e aria-pressed. O nome do mundo atual é anunciado numa região aria-live. Com prefers-reduced-motion, a troca é instantânea.',
    performance: 'clip-path animado é composto pelo navegador sem refazer o layout. Só há duas camadas ao mesmo tempo.',
    limitacoes: [
      'Cliques muito rápidos empilham várias camadas animando; todas são limpas quando a última termina.',
      'Conteúdo interativo dentro das camadas é recriado a cada troca — guarde estado fora delas.',
    ],
    referencias: [
      { titulo: 'MDN — clip-path', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/clip-path' },
      { titulo: 'MDN — View Transition API', url: 'https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API' },
      MDN.reduzir,
    ],
    validadoEm: VALIDADO_EM,
    status: 'validado',
  },
  params: [
    { id: 'duracao', rotulo: 'duração da troca', tipo: 'range', min: 300, max: 1500, passo: 50, unidade: 'ms', padrao: 800 },
    { id: 'easing', rotulo: 'curva (easing)', tipo: 'select', opcoes: EASINGS, padrao: 'cubic-bezier(0.22, 1, 0.36, 1)' },
    {
      id: 'origem',
      rotulo: 'origem do círculo',
      tipo: 'select',
      opcoes: [
        { valor: 'botao', rotulo: 'botão clicado' },
        { valor: 'centro', rotulo: 'centro da vitrine' },
      ],
      padrao: 'botao',
    },
  ],
  gerar: (v) => {
    const doBotao = v['origem'] === 'botao';
    return {
      html: `<section class="vitrine" aria-label="Vitrine com quatro mundos"></section>
<div class="amostras" role="group" aria-label="Escolher mundo">
${TEMAS.map((t, i) => `  <button class="amostra" type="button" style="--cor: ${t.fundo}" aria-pressed="${i === 0}">Mundo ${t.nome}</button>`).join('\n')}
</div>
<p class="anuncio" aria-live="polite"></p>`,
      css: `${cssPalco()}

.vitrine {
  position: relative;
  width: min(100%, 640px);
  aspect-ratio: 16 / 10;
  border-radius: 20px;
  overflow: hidden;
}

/* Um mundo: fundo, título enorme e uma figura na frente */
.mundo {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: var(--fundo);
  color: var(--tinta);
}
.mundo .titulo {
  margin: 0;
  font: 900 clamp(2rem, 11vw, 5rem) / 0.9 system-ui, sans-serif;
  letter-spacing: -0.04em;
  text-align: center;
  text-transform: uppercase;
}
.mundo .figura {
  position: absolute;
  bottom: 0;
  width: 30%;
  aspect-ratio: 3 / 4;
  border-radius: 48% 48% 12px 12px;
  background: radial-gradient(circle at 35% 30%, rgb(255 255 255 / 0.55), transparent 40%), var(--tinta);
  opacity: 0.92;
}

/* A camada nova abre em círculo a partir de (--x, --y) */
.mundo.entrando {
  animation: revelar ${v['duracao']}ms ${v['easing']} both;
}
@keyframes revelar {
  from { clip-path: circle(0% at var(--x) var(--y)); }
  to { clip-path: circle(150% at var(--x) var(--y)); }
}

.amostras { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
.amostra {
  padding: 8px 14px 8px 10px;
  border: 1px solid #3a3456;
  border-radius: 999px;
  background: transparent;
  color: #f4f2ff;
  font: inherit;
  cursor: pointer;
}
.amostra::before {
  content: '';
  display: inline-block;
  width: 12px;
  height: 12px;
  margin-right: 8px;
  border-radius: 50%;
  background: var(--cor);
  vertical-align: -1px;
}
.amostra[aria-pressed='true'] { border-color: var(--cor); }
.amostra:focus-visible { outline: 2px solid #22e3ff; outline-offset: 3px; }
.anuncio { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }

@media (prefers-reduced-motion: reduce) {
  .mundo.entrando { animation: none; }
}`,
      js: `const TEMAS = ${JSON.stringify(TEMAS)};
const vitrine = document.querySelector('.vitrine');
const anuncio = document.querySelector('.anuncio');
const botoes = document.querySelectorAll('.amostra');
const reduzir = matchMedia('(prefers-reduced-motion: reduce)');

function criarMundo(tema) {
  const mundo = document.createElement('div');
  mundo.className = 'mundo';
  mundo.style.setProperty('--fundo', tema.fundo);
  mundo.style.setProperty('--tinta', tema.tinta);
  mundo.innerHTML = '<p class="titulo">Troque<br>o visual</p><span class="figura"></span>';
  return mundo;
}

vitrine.append(criarMundo(TEMAS[0]));

botoes.forEach((botao, i) => {
  botao.addEventListener('click', () => {
    const novo = criarMundo(TEMAS[i]);
${
  doBotao
    ? `    // o círculo nasce no centro do botão (pode estar fora da vitrine)
    const v = vitrine.getBoundingClientRect();
    const b = botao.getBoundingClientRect();
    novo.style.setProperty('--x', b.left + b.width / 2 - v.left + 'px');
    novo.style.setProperty('--y', b.top + b.height / 2 - v.top + 'px');`
    : `    // o círculo nasce no meio da vitrine
    novo.style.setProperty('--x', '50%');
    novo.style.setProperty('--y', '50%');`
}
    novo.classList.add('entrando');

    const antigos = [...vitrine.children];
    vitrine.append(novo);
    const limpar = () => antigos.forEach((m) => m.remove());
    if (reduzir.matches) limpar();
    else novo.addEventListener('animationend', limpar, { once: true });

    botoes.forEach((b, j) => b.setAttribute('aria-pressed', String(i === j)));
    anuncio.textContent = 'Mundo ' + TEMAS[i].nome;
  });
});`,
    };
  },
  angular: (v) => {
    const doBotao = v['origem'] === 'botao';
    return {
      ts: `import { Component, ElementRef, signal, viewChild } from '@angular/core';

interface Tema {
  nome: string;
  fundo: string;
  tinta: string;
}

/** Uma camada da vitrine: um tema e o ponto onde o círculo nasce. */
interface Mundo {
  id: number;
  tema: Tema;
  x: string;
  y: string;
  entrando: boolean;
}

@Component({
  selector: 'app-theme-wipe',
  templateUrl: './theme-wipe.html',
  styleUrl: './theme-wipe.css',
})
export class ${nomeClasse('theme-wipe')} {
  protected readonly temas: Tema[] = ${JSON.stringify(TEMAS, null, 2).replace(/\n/g, '\n  ').replace(/"(\w+)":/g, '$1:').replace(/"/g, "'")};
  private readonly vitrine = viewChild.required<ElementRef<HTMLElement>>('vitrine');
  private readonly reduzir = window.matchMedia('(prefers-reduced-motion: reduce)');
  private proximo = 1;

  protected readonly atual = signal(0);
  protected readonly mundos = signal<Mundo[]>([
    { id: 0, tema: this.temas[0], x: '50%', y: '50%', entrando: false },
  ]);

  protected trocar(i: number, botao: HTMLElement): void {
${
  doBotao
    ? `    const v = this.vitrine().nativeElement.getBoundingClientRect();
    const b = botao.getBoundingClientRect();
    const x = b.left + b.width / 2 - v.left + 'px';
    const y = b.top + b.height / 2 - v.top + 'px';`
    : `    void botao; // a origem é o centro da vitrine
    const x = '50%';
    const y = '50%';`
}
    const novo: Mundo = { id: this.proximo++, tema: this.temas[i], x, y, entrando: !this.reduzir.matches };
    this.mundos.update((lista) => (novo.entrando ? [...lista, novo] : [novo]));
    this.atual.set(i);
  }

  /** Fim da animação: só a camada que acabou de entrar fica. */
  protected limpar(id: number): void {
    this.mundos.update((lista) => lista.filter((m) => m.id >= id));
  }
}
`,
      html: `<section #vitrine class="vitrine" aria-label="Vitrine com quatro mundos">
  @for (m of mundos(); track m.id) {
    <div
      class="mundo"
      [class.entrando]="m.entrando"
      [style.--fundo]="m.tema.fundo"
      [style.--tinta]="m.tema.tinta"
      [style.--x]="m.x"
      [style.--y]="m.y"
      (animationend)="limpar(m.id)"
    >
      <p class="titulo">Troque<br />o visual</p>
      <span class="figura"></span>
    </div>
  }
</section>
<div class="amostras" role="group" aria-label="Escolher mundo">
  @for (t of temas; track t.nome; let i = $index) {
    <button
      #botao
      class="amostra"
      type="button"
      [style.--cor]="t.fundo"
      [attr.aria-pressed]="atual() === i"
      (click)="trocar(i, botao)"
    >
      Mundo {{ t.nome }}
    </button>
  }
</div>
<p class="anuncio" aria-live="polite">Mundo {{ temas[atual()].nome }}</p>
`,
      css: cssAngular(THEME_WIPE.gerar(v).css),
    };
  },
  niveis: {
    iniciante: [
      'A vitrine mostra um "mundo": uma cor de fundo, um título grande e uma figura.',
      'Ao clicar numa cor, o mundo novo aparece dentro de um círculo pequenininho que cresce até cobrir tudo.',
      'Quando o círculo termina de crescer, o mundo antigo é jogado fora.',
    ],
    avancado: [
      'circle(150% at x y): o raio em % é relativo à diagonal "normalizada" da caixa, então 150% cobre os cantos mesmo partindo de uma borda.',
      'Variáveis CSS dentro de @keyframes são resolvidas no elemento animado: cada camada abre a partir do seu próprio --x/--y.',
      'Começar o círculo fora da vitrine (no botão abaixo dela) é válido: o clip-path aceita coordenadas negativas ou maiores que a caixa.',
      'No Angular, a lista de mundos é um signal; (animationend) filtra as camadas antigas pelo id, mantendo a que acabou de entrar.',
    ],
  },
  glossario: [
    { termo: 'clip-path: circle(0% at var(--x) var(--y))', explicacao: 'Começo da revelação: um círculo de raio zero no ponto escolhido.' },
    { termo: 'animationend', explicacao: 'Evento disparado quando a revelação termina — hora de remover os mundos antigos.' },
    { termo: 'aria-live', explicacao: 'Anuncia o nome do mundo novo para o leitor de tela.' },
    { termo: 'aria-pressed', explicacao: 'Marca qual botão de cor está ativo.' },
  ],
};
