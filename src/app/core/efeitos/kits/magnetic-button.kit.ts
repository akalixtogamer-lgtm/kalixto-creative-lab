import { EffectKit } from '../../models/effect-sheet.model';
import { MDN, VALIDADO_EM, cssAngular, cssPalco, nomeClasse } from './_base';

export const MAGNETIC_BUTTON: EffectKit = {
  ficha: {
    id: 'magnetic-button',
    nomeTecnico: 'Magnetic Button',
    nomeAmigavel: 'Botão magnético',
    categoria: 'cursor',
    subcategoria: 'Elementos magnéticos',
    descricao: 'Quando o ponteiro se aproxima, o botão é "puxado" na direção dele e volta ao lugar quando o ponteiro se afasta.',
    objetivoVisual: 'Dar personalidade e sensação tátil a uma ação importante.',
    aplicacoes: ['Botão principal de um hero', 'Links de contato', 'Ícones de redes sociais'],
    nivel: 'intermediario',
    tecnologias: ['HTML', 'CSS', 'JavaScript'],
    dependencias: [],
    interacoes: ['mouse', 'keyboard'],
    tags: ['magnético', 'magnetic', 'cursor', 'pointer', 'botão', 'hover'],
    explicacao: [
      'O JavaScript escuta pointermove na janela e calcula a distância entre o ponteiro e o centro do botão.',
      'Dentro do raio de alcance, o botão é deslocado por uma fração (a força) dessa distância, com transform: translate.',
      'Fora do raio, o transform é limpo e a transition do CSS faz o botão voltar suavemente.',
      'requestAnimationFrame agrupa as atualizações a no máximo uma por quadro, evitando trabalho desnecessário.',
    ],
    alternativa: 'GSAP: gsap.quickTo(botao, "x", { duration: 0.4 }) cria uma função que segue o ponteiro com suavização — usado na demo do Interface Lab.',
    compatibilidade: 'Pointer Events e requestAnimationFrame funcionam em todos os navegadores atuais.',
    responsividade: 'Só reage a mouse (pointerType "mouse"). Em toque o botão funciona normalmente, sem o efeito.',
    acessibilidade: 'O efeito é decorativo: o botão continua sendo um <button> comum, com foco visível pelo teclado. Com prefers-reduced-motion o movimento é desativado.',
    performance: 'Uma leitura de getBoundingClientRect e uma escrita de transform por quadro, só enquanto o ponteiro se move.',
    limitacoes: ['Força muito alta faz o botão "fugir" do clique.', 'Em páginas com rolagem, o cálculo usa a posição na tela, então continua correto ao rolar.'],
    referencias: [MDN.pointer, MDN.raf, MDN.transform, MDN.reduzir],
    validadoEm: VALIDADO_EM,
    status: 'validado',
  },
  params: [
    { id: 'forca', rotulo: 'força', tipo: 'range', min: 0.1, max: 1, passo: 0.05, unidade: '', padrao: 0.4 },
    { id: 'alcance', rotulo: 'raio de alcance', tipo: 'range', min: 20, max: 200, passo: 10, unidade: 'px', padrao: 80 },
    { id: 'volta', rotulo: 'tempo de retorno', tipo: 'range', min: 100, max: 1200, passo: 50, unidade: 'ms', padrao: 500 },
  ],
  gerar: (v) => ({
    html: `<button class="magnetico" type="button">Aproxime o mouse</button>`,
    css: `${cssPalco()}

.magnetico {
  padding: 18px 34px;
  border: 0;
  border-radius: 999px;
  background: linear-gradient(135deg, #d4119f, #7c3aed);
  color: #fff;
  font: 600 1rem system-ui, sans-serif;
  cursor: pointer;
  /* volta ao lugar com suavidade */
  transition: transform ${v['volta']}ms cubic-bezier(0.22, 1, 0.36, 1);
}

/* enquanto está sendo atraído, segue o ponteiro mais rápido */
.magnetico.is-atraindo { transition-duration: 120ms; }

.magnetico:focus-visible { outline: 2px solid #22e3ff; outline-offset: 4px; }`,
    js: `const botao = document.querySelector('.magnetico');
const FORCA = ${v['forca']};      // fração da distância que o botão anda
const ALCANCE = ${v['alcance']};   // px além da borda do botão
const reduzir = window.matchMedia('(prefers-reduced-motion: reduce)');
let quadro = 0;

function soltar() {
  botao.style.transform = '';
  botao.classList.remove('is-atraindo');
}

window.addEventListener('pointermove', (e) => {
  if (reduzir.matches || e.pointerType !== 'mouse') return;
  cancelAnimationFrame(quadro);
  quadro = requestAnimationFrame(() => {
    const r = botao.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    const limite = ALCANCE + Math.max(r.width, r.height) / 2;

    if (Math.hypot(dx, dy) < limite) {
      botao.classList.add('is-atraindo');
      botao.style.transform = \`translate(\${dx * FORCA}px, \${dy * FORCA}px)\`;
    } else {
      soltar();
    }
  });
});

document.documentElement.addEventListener('pointerleave', soltar);`,
  }),
  angular: (v) => ({
    ts: `import { Component, ElementRef, signal, viewChild } from '@angular/core';

@Component({
  selector: 'app-magnetic-button',
  templateUrl: './magnetic-button.html',
  styleUrl: './magnetic-button.css',
  host: {
    '(window:pointermove)': 'mover($event)',
    '(document:pointerout)': 'sairDaJanela($event)',
  },
})
export class ${nomeClasse('magnetic-button')} {
  private readonly forca = ${v['forca']};    // fração da distância que o botão anda
  private readonly alcance = ${v['alcance']};   // px além da borda do botão
  private readonly reduzir = window.matchMedia('(prefers-reduced-motion: reduce)');
  private readonly botao = viewChild.required<ElementRef<HTMLButtonElement>>('botao');
  private quadro = 0;

  protected readonly atraindo = signal(false);
  protected readonly deslocamento = signal('');

  protected mover(e: PointerEvent): void {
    if (this.reduzir.matches || e.pointerType !== 'mouse') return;
    cancelAnimationFrame(this.quadro);
    this.quadro = requestAnimationFrame(() => {
      const r = this.botao().nativeElement.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const limite = this.alcance + Math.max(r.width, r.height) / 2;

      if (Math.hypot(dx, dy) < limite) {
        this.atraindo.set(true);
        this.deslocamento.set(\`translate(\${dx * this.forca}px, \${dy * this.forca}px)\`);
      } else {
        this.soltar();
      }
    });
  }

  /** O ponteiro saiu da janela (relatedTarget nulo): o botão volta ao lugar. */
  protected sairDaJanela(e: PointerEvent): void {
    if (!e.relatedTarget) this.soltar();
  }

  private soltar(): void {
    this.atraindo.set(false);
    this.deslocamento.set('');
  }
}
`,
    html: `<button
  #botao
  class="magnetico"
  type="button"
  [class.is-atraindo]="atraindo()"
  [style.transform]="deslocamento()"
>
  Aproxime o mouse
</button>
`,
    css: cssAngular(MAGNETIC_BUTTON.gerar(v).css),
  }),
  niveis: {
    iniciante: [
      'O código mede a distância entre o mouse e o centro do botão.',
      'Se o mouse está perto, o botão anda um pedaço dessa distância na direção dele; se está longe, volta ao lugar.',
      'A força decide quanto ele anda: 0,4 significa 40% da distância.',
    ],
    avancado: [
      'getBoundingClientRect dá a posição na tela; com clientX/clientY do evento o cálculo continua certo mesmo com a página rolada.',
      'requestAnimationFrame + cancelAnimationFrame limitam o trabalho a uma leitura e uma escrita por quadro, mesmo com dezenas de pointermove por quadro.',
      'Duas durações de transition: curta enquanto atrai (segue o mouse) e longa ao soltar (volta macia) — controladas pela classe is-atraindo.',
      'No Angular, os listeners globais ficam em host (window:pointermove) e são removidos automaticamente quando o componente é destruído.',
      'GSAP quickTo faz a mesma suavização com uma função reutilizável, sem depender de transition.',
    ],
  },
  glossario: [
    { termo: 'pointermove', explicacao: 'Evento disparado quando o ponteiro se move.' },
    { termo: 'pointerType', explicacao: 'Tipo de ponteiro (mouse, touch, pen) — o efeito só roda com mouse.' },
    { termo: 'getBoundingClientRect', explicacao: 'Posição e tamanho do botão na tela.' },
    { termo: 'Math.hypot', explicacao: 'Distância em linha reta entre o mouse e o centro do botão.' },
    { termo: 'requestAnimationFrame', explicacao: 'Agenda a atualização para o próximo quadro de desenho.' },
    { termo: 'is-atraindo', explicacao: 'Classe que deixa a transition rápida enquanto o botão segue o mouse.' },
  ],
};
