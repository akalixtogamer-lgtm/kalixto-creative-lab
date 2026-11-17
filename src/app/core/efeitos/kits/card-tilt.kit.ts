import { EffectKit } from '../../models/effect-sheet.model';
import { MDN, VALIDADO_EM, cssAngular, cssPalco, nomeClasse } from './_base';

export const CARD_TILT: EffectKit = {
  ficha: {
    id: 'card-tilt',
    nomeTecnico: '3D Card Tilt',
    nomeAmigavel: 'Card que inclina com o mouse',
    categoria: 'cards-imagens',
    subcategoria: 'Cards com profundidade',
    descricao: 'O card gira em 3D acompanhando a posição do ponteiro, com um reflexo de luz que segue o mouse.',
    objetivoVisual: 'Dar sensação de objeto físico e profundidade a um card.',
    aplicacoes: ['Cards de produto', 'Cartões de perfil', 'Vitrines de projetos'],
    nivel: 'intermediario',
    tecnologias: ['HTML', 'CSS', 'JavaScript'],
    dependencias: [],
    interacoes: ['mouse', 'keyboard'],
    tags: ['tilt', '3d', 'card', 'perspectiva', 'mouse', 'reflexo', 'profundidade'],
    explicacao: [
      'perspective no contêiner define a distância do "olho" até o card: valores menores deixam o 3D mais exagerado.',
      'No pointermove, a posição do ponteiro dentro do card vira um número de -0,5 a 0,5 em cada eixo.',
      'Esse número multiplicado pela inclinação máxima vira rotateX e rotateY.',
      'As mesmas coordenadas vão para as variáveis --x e --y, usadas no radial-gradient do reflexo.',
    ],
    alternativa: 'Com GSAP, gsap.to(card, { rotationY, rotationX, duration: 0.4 }) suaviza o movimento sem transition no CSS.',
    compatibilidade: 'transform 3D e Pointer Events funcionam em todos os navegadores atuais.',
    responsividade: 'Só reage a mouse. Em toque o card fica parado e legível. A largura do card se adapta à tela.',
    acessibilidade: 'O card recebe foco pelo teclado e mostra um estado de destaque (leve elevação e contorno). A inclinação é decorativa e é desativada com prefers-reduced-motion.',
    performance: 'Uma leitura de getBoundingClientRect e uma escrita de estilo por quadro, só enquanto o ponteiro está sobre o card.',
    limitacoes: ['Textos pequenos podem ficar menos nítidos enquanto o card está inclinado.', 'Inclinações acima de 20° dificultam a leitura.'],
    referencias: [MDN.perspective, MDN.transform, MDN.pointer, MDN.reduzir],
    validadoEm: VALIDADO_EM,
    status: 'validado',
  },
  params: [
    { id: 'incl', rotulo: 'inclinação máxima', tipo: 'range', min: 2, max: 30, passo: 1, unidade: '°', padrao: 12 },
    { id: 'persp', rotulo: 'perspectiva', tipo: 'range', min: 300, max: 2000, passo: 50, unidade: 'px', padrao: 800 },
    { id: 'escala', rotulo: 'escala no hover', tipo: 'range', min: 1, max: 1.1, passo: 0.01, unidade: '', padrao: 1.03 },
    {
      id: 'reflexo',
      rotulo: 'reflexo de luz',
      tipo: 'select',
      opcoes: [
        { valor: 'sim', rotulo: 'sim' },
        { valor: 'nao', rotulo: 'não' },
      ],
      padrao: 'sim',
    },
  ],
  gerar: (v) => {
    const reflexo = v['reflexo'] === 'sim';
    return {
      html: `<div class="cena">
  <article class="card" tabindex="0">
    <h2>Card 3D</h2>
    <p>Passe o mouse sobre o card.</p>
  </article>
</div>`,
      css: `${cssPalco()}

.cena { perspective: ${v['persp']}px; }

/* O efeito */
.card {
  position: relative;
  width: min(80vw, 300px);
  aspect-ratio: 3 / 4;
  display: grid;
  align-content: end;
  padding: 24px;
  border-radius: 20px;
  background: linear-gradient(160deg, #2a1f4d, #120f22);
  border: 1px solid #3a3456;
  transform: rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)) scale(var(--s, 1));
  transition: transform 400ms cubic-bezier(0.22, 1, 0.36, 1);
  overflow: hidden;
}

.card h2 { margin: 0 0 4px; }
.card p { margin: 0; color: #c9c3ea; }

/* enquanto o mouse está em cima, acompanha sem atraso */
.card.is-ativo { transition-duration: 80ms; }

.card:focus-visible {
  outline: 2px solid #22e3ff;
  outline-offset: 6px;
  --s: ${v['escala']};
}
${
  reflexo
    ? `
/* reflexo: um brilho circular na posição do ponteiro */
.card::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at var(--x, 50%) var(--y, 50%), rgb(255 255 255 / 0.22), transparent 55%);
  opacity: 0;
  transition: opacity 300ms ease;
  pointer-events: none;
}
.card.is-ativo::after { opacity: 1; }
`
    : ''
}
@media (prefers-reduced-motion: reduce) {
  .card { transform: none; }
}`,
      js: `const card = document.querySelector('.card');
const INCLINACAO = ${v['incl']}; // graus
const ESCALA = ${v['escala']};
const reduzir = window.matchMedia('(prefers-reduced-motion: reduce)');
let quadro = 0;

card.addEventListener('pointermove', (e) => {
  if (reduzir.matches || e.pointerType !== 'mouse') return;
  cancelAnimationFrame(quadro);
  quadro = requestAnimationFrame(() => {
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;  // -0,5 … 0,5
    const py = (e.clientY - r.top) / r.height - 0.5;
    card.classList.add('is-ativo');
    card.style.setProperty('--ry', px * INCLINACAO * 2 + 'deg');
    card.style.setProperty('--rx', -py * INCLINACAO * 2 + 'deg');
    card.style.setProperty('--s', ESCALA);
    card.style.setProperty('--x', (px + 0.5) * 100 + '%');
    card.style.setProperty('--y', (py + 0.5) * 100 + '%');
  });
});

card.addEventListener('pointerleave', () => {
  cancelAnimationFrame(quadro);
  card.classList.remove('is-ativo');
  for (const p of ['--rx', '--ry', '--s']) card.style.removeProperty(p);
});`,
    };
  },
  angular: (v) => ({
    ts: `import { Component, ElementRef, signal, viewChild } from '@angular/core';

@Component({
  selector: 'app-card-tilt',
  templateUrl: './card-tilt.html',
  styleUrl: './card-tilt.css',
})
export class ${nomeClasse('card-tilt')} {
  private readonly inclinacao = ${v['incl']}; // graus
  protected readonly escala = ${v['escala']};
  private readonly reduzir = window.matchMedia('(prefers-reduced-motion: reduce)');
  private readonly card = viewChild.required<ElementRef<HTMLElement>>('card');
  private quadro = 0;

  protected readonly ativo = signal(false);
  protected readonly rx = signal<string | null>(null);
  protected readonly ry = signal<string | null>(null);
  protected readonly x = signal('50%');
  protected readonly y = signal('50%');

  protected mover(e: PointerEvent): void {
    if (this.reduzir.matches || e.pointerType !== 'mouse') return;
    cancelAnimationFrame(this.quadro);
    this.quadro = requestAnimationFrame(() => {
      const r = this.card().nativeElement.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5; // -0,5 … 0,5
      const py = (e.clientY - r.top) / r.height - 0.5;
      this.ativo.set(true);
      this.ry.set(px * this.inclinacao * 2 + 'deg');
      this.rx.set(-py * this.inclinacao * 2 + 'deg');
      this.x.set((px + 0.5) * 100 + '%');
      this.y.set((py + 0.5) * 100 + '%');
    });
  }

  protected sair(): void {
    cancelAnimationFrame(this.quadro);
    this.ativo.set(false);
    this.rx.set(null);
    this.ry.set(null);
  }
}
`,
    html: `<div class="cena">
  <article
    #card
    class="card"
    tabindex="0"
    [class.is-ativo]="ativo()"
    [style.--rx]="rx()"
    [style.--ry]="ry()"
    [style.--s]="ativo() ? escala : null"
    [style.--x]="x()"
    [style.--y]="y()"
    (pointermove)="mover($event)"
    (pointerleave)="sair()"
  >
    <h2>Card 3D</h2>
    <p>Passe o mouse sobre o card.</p>
  </article>
</div>
`,
    css: cssAngular(CARD_TILT.gerar(v).css),
  }),
  niveis: {
    iniciante: [
      'O card gira um pouco para o lado onde o mouse está, como se fosse um cartão de verdade na sua mão.',
      'Quanto mais perto da borda, mais ele inclina, até o limite que você escolhe.',
      'Um brilho segue o mouse, imitando a luz refletindo no cartão.',
    ],
    avancado: [
      'perspective fica no contêiner (.cena), e não no card: assim o ponto de fuga é fixo e a rotação parece física.',
      'As rotações vão para variáveis CSS (--rx, --ry); o transform do CSS as combina, e a mesma lógica serve no JS puro e no Angular.',
      'pointermove só no card (não na janela) reduz trabalho; requestAnimationFrame agrupa as escritas.',
      'Rotações em X e Y com transform 3D criam uma camada de composição; textos pequenos podem perder nitidez enquanto inclinados.',
      'No Angular, [style.--rx] liga a variável direto do signal, sem tocar no DOM.',
    ],
  },
  glossario: [
    { termo: 'perspective', explicacao: 'Distância do "olho" até o objeto: menor = 3D mais exagerado.' },
    { termo: 'rotateX', explicacao: 'Gira o card em volta do eixo horizontal (inclina para cima/baixo).' },
    { termo: 'rotateY', explicacao: 'Gira o card em volta do eixo vertical (inclina para os lados).' },
    { termo: 'radial-gradient', explicacao: 'Brilho circular usado como reflexo, centrado em --x e --y.' },
    { termo: 'pointerleave', explicacao: 'O mouse saiu do card: as rotações são zeradas e ele volta.' },
    { termo: 'tabindex="0"', explicacao: 'Permite focar o card pelo teclado.' },
  ],
};
