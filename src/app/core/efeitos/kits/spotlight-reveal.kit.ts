import { EffectKit } from '../../models/effect-sheet.model';
import { MDN, VALIDADO_EM, cssAngular, cssPalco, nomeClasse } from './_base';

export const SPOTLIGHT_REVEAL: EffectKit = {
  ficha: {
    id: 'spotlight-reveal',
    nomeTecnico: 'Spotlight Reveal (mask-image)',
    nomeAmigavel: 'Lanterna que revela',
    categoria: 'cursor',
    subcategoria: 'Máscaras guiadas pelo ponteiro',
    descricao: 'Uma camada escura cobre o conteúdo e o ponteiro abre um círculo de luz, como uma lanterna.',
    objetivoVisual: 'Criar descoberta e curiosidade: o usuário explora a área para ver o que está escondido.',
    aplicacoes: ['Heros interativos', 'Revelação de produto', 'Easter eggs e jogos'],
    nivel: 'intermediario',
    tecnologias: ['HTML', 'CSS', 'JavaScript'],
    dependencias: [],
    interacoes: ['mouse', 'touch', 'click', 'keyboard'],
    tags: ['spotlight', 'lanterna', 'mask', 'mask-image', 'máscara', 'revelar', 'cursor'],
    explicacao: [
      'A camada .sombra fica por cima do conteúdo. mask-image com um radial-gradient deixa transparente só um círculo dela.',
      'O centro do círculo vem das variáveis --x e --y, que o JavaScript atualiza com a posição do ponteiro (mouse ou dedo).',
      'A distância entre as duas paradas do gradiente (raio e raio + borda) define se a borda da luz é dura ou suave.',
      'O botão "Acender tudo" remove a camada: é a alternativa para teclado e para quem não usa ponteiro.',
    ],
    alternativa: 'clip-path: circle(R at x y) recorta com borda dura e funciona em ainda mais navegadores; mask-image permite borda suave.',
    compatibilidade: 'mask-image sem prefixo: Chrome e Edge 120+, Firefox 53+, Safari 15.4+. O CSS inclui -webkit-mask-image para navegadores mais antigos baseados em Chromium.',
    responsividade: 'Funciona com toque: o círculo segue o dedo enquanto ele desliza sobre a área.',
    acessibilidade: 'O texto escondido está no HTML e é lido normalmente pelo leitor de tela (a camada é decorativa, aria-hidden). O botão Acender tudo dá acesso visual sem ponteiro. Não há movimento automático.',
    performance: 'Cada movimento troca duas variáveis CSS (uma vez por quadro, com requestAnimationFrame); o navegador repinta só a camada da máscara.',
    limitacoes: ['A camada escura cobre o conteúdo: links embaixo dela não recebem clique, a menos que a camada tenha pointer-events: none (como aqui).'],
    referencias: [MDN.mask, MDN.pointer, MDN.raf],
    validadoEm: VALIDADO_EM,
    status: 'validado',
  },
  params: [
    { id: 'raio', rotulo: 'raio da luz', tipo: 'range', min: 40, max: 240, passo: 10, unidade: 'px', padrao: 110 },
    { id: 'borda', rotulo: 'suavidade da borda', tipo: 'range', min: 0, max: 120, passo: 5, unidade: 'px', padrao: 40 },
    { id: 'escuro', rotulo: 'escuridão', tipo: 'range', min: 0.6, max: 1, passo: 0.02, unidade: '', padrao: 0.94 },
  ],
  gerar: (v) => {
    const raio = Number(v['raio']);
    const fim = raio + Number(v['borda']);
    return {
      html: `<section class="palco-luz">
  <div class="conteudo">
    <h1>Criatividade escondida</h1>
    <p>Explore a área com o mouse ou o dedo.</p>
  </div>
  <div class="sombra" aria-hidden="true"></div>
</section>
<button class="acender" type="button" aria-pressed="false">Acender tudo</button>`,
      css: `${cssPalco()}

.palco-luz {
  position: relative;
  width: min(100%, 640px);
  aspect-ratio: 16 / 10;
  border-radius: 20px;
  overflow: hidden;
  touch-action: none; /* o dedo move a luz em vez de rolar a página */
}
.conteudo {
  display: grid;
  place-content: center;
  height: 100%;
  padding: 24px;
  text-align: center;
  background:
    radial-gradient(circle at 20% 30%, #ff2bd6, transparent 45%),
    radial-gradient(circle at 80% 70%, #22e3ff, transparent 45%),
    linear-gradient(135deg, #2a1f6b, #7c3aed);
}
.conteudo h1 { margin: 0 0 8px; font-size: clamp(1.5rem, 6vw, 2.6rem); }
.conteudo p { margin: 0; }

/* O efeito: uma camada escura com um "furo" redondo onde está o ponteiro */
.sombra {
  position: absolute;
  inset: 0;
  background: rgb(5 5 5 / ${v['escuro']});
  pointer-events: none;
  --x: 50%;
  --y: 50%;
  -webkit-mask-image: radial-gradient(circle at var(--x) var(--y), transparent ${raio}px, #000 ${fim}px);
  mask-image: radial-gradient(circle at var(--x) var(--y), transparent ${raio}px, #000 ${fim}px);
  transition: opacity 400ms ease;
}
.palco-luz.is-acesa .sombra { opacity: 0; }

.acender {
  padding: 10px 20px;
  border: 1px solid #3a3456;
  border-radius: 999px;
  background: transparent;
  color: #f4f2ff;
  font: inherit;
  cursor: pointer;
}
.acender:focus-visible { outline: 2px solid #22e3ff; outline-offset: 3px; }

@media (prefers-reduced-motion: reduce) {
  .sombra { transition: none; }
}`,
      js: `const palco = document.querySelector('.palco-luz');
const sombra = palco.querySelector('.sombra');
const botao = document.querySelector('.acender');
let quadro = 0;

palco.addEventListener('pointermove', (e) => {
  cancelAnimationFrame(quadro);
  quadro = requestAnimationFrame(() => {
    const r = palco.getBoundingClientRect();
    sombra.style.setProperty('--x', e.clientX - r.left + 'px');
    sombra.style.setProperty('--y', e.clientY - r.top + 'px');
  });
});

// alternativa sem ponteiro: acender a área toda
botao.addEventListener('click', () => {
  const acesa = palco.classList.toggle('is-acesa');
  botao.setAttribute('aria-pressed', String(acesa));
  botao.textContent = acesa ? 'Apagar' : 'Acender tudo';
});`,
    };
  },
  angular: (v) => ({
    ts: `import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-spotlight-reveal',
  templateUrl: './spotlight-reveal.html',
  styleUrl: './spotlight-reveal.css',
})
export class ${nomeClasse('spotlight-reveal')} {
  protected readonly x = signal('50%');
  protected readonly y = signal('50%');
  protected readonly acesa = signal(false);
  private quadro = 0;

  protected mover(e: PointerEvent, palco: HTMLElement): void {
    cancelAnimationFrame(this.quadro);
    this.quadro = requestAnimationFrame(() => {
      const r = palco.getBoundingClientRect();
      this.x.set(e.clientX - r.left + 'px');
      this.y.set(e.clientY - r.top + 'px');
    });
  }
}
`,
    html: `<section #palco class="palco-luz" [class.is-acesa]="acesa()" (pointermove)="mover($event, palco)">
  <div class="conteudo">
    <h1>Criatividade escondida</h1>
    <p>Explore a área com o mouse ou o dedo.</p>
  </div>
  <div class="sombra" aria-hidden="true" [style.--x]="x()" [style.--y]="y()"></div>
</section>
<button class="acender" type="button" [attr.aria-pressed]="acesa()" (click)="acesa.set(!acesa())">
  {{ acesa() ? 'Apagar' : 'Acender tudo' }}
</button>
`,
    css: cssAngular(SPOTLIGHT_REVEAL.gerar(v).css),
  }),
  niveis: {
    iniciante: [
      'Existe uma tela escura por cima de uma imagem colorida.',
      'Essa tela tem um buraco redondo, que segue o mouse (ou o dedo) e mostra o que está embaixo.',
      'O botão "Acender tudo" tira a tela escura para quem não pode usar o mouse.',
    ],
    avancado: [
      'Numa máscara, o que é opaco na imagem da máscara fica visível e o que é transparente some: transparent no centro abre o "furo".',
      'Variáveis CSS em mask-image fazem só a máscara repintar; o conteúdo embaixo não é redesenhado.',
      'touch-action: none deixa o dedo mover a luz sem rolar a página — use só na área do efeito.',
      'Camada com pointer-events: none: o conteúdo embaixo continua clicável e selecionável.',
      'No Angular, --x e --y vêm de signals ligados com [style.--x]; o palco é passado por template reference (#palco).',
    ],
  },
  glossario: [
    { termo: 'mask-image', explicacao: 'Imagem que define o que aparece (opaco) e o que some (transparente).' },
    { termo: 'radial-gradient(circle at var(--x) var(--y)', explicacao: 'Círculo de luz centrado na posição do ponteiro.' },
    { termo: 'touch-action: none', explicacao: 'O toque move a luz em vez de rolar a página.' },
    { termo: 'pointer-events: none', explicacao: 'A camada escura não bloqueia cliques.' },
    { termo: 'aria-pressed', explicacao: 'Informa ao leitor de tela se o botão Acender tudo está ligado.' },
  ],
};
