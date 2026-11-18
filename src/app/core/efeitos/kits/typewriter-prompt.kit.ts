import { EffectKit } from '../../models/effect-sheet.model';
import { VALIDADO_EM, cssAngular, cssPalco, nomeClasse } from './_base';

const ACENTOS = [
  { valor: '#ff6a1a', rotulo: 'Laranja' },
  { valor: '#a78bfa', rotulo: 'Lilás' },
  { valor: '#22e3ff', rotulo: 'Ciano' },
] as const;

const PROMPT = 'Crie uma página de vendas para um lançamento imobiliário';

export const TYPEWRITER_PROMPT: EffectKit = {
  ficha: {
    id: 'typewriter-prompt',
    nomeTecnico: 'Typewriter Prompt → Progress → Stamp',
    nomeAmigavel: 'Prompt digitado até o "pronto"',
    categoria: 'componentes-dados',
    subcategoria: 'Progresso e estados',
    descricao: 'Um campo de prompt é digitado letra por letra com cursor piscando; o botão vira "gerando", uma barra enche de 0 a 100% e um selo "PRONTO" carimba o resultado.',
    objetivoVisual: 'Mostrar um processo (gerar, enviar, publicar) como uma pequena história: pedido → trabalho → resultado.',
    aplicacoes: ['Demonstração de produto de IA', 'Onboarding e tutoriais', 'Vídeos de divulgação gravados da tela'],
    nivel: 'intermediario',
    tecnologias: ['HTML', 'CSS', 'JavaScript'],
    dependencias: [],
    interacoes: ['autoplay', 'click'],
    tags: ['typewriter', 'máquina de escrever', 'prompt', 'ia', 'progresso', 'loading', 'selo', 'carimbo', 'referência em vídeo'],
    explicacao: [
      'A digitação é um setTimeout encadeado: a cada intervalo, o texto visível ganha mais uma letra (slice(0, n)). O cursor é um ::after com animação de piscar (steps).',
      'Ao terminar de digitar, o botão muda de texto e de estado (data-estado="gerando") e começa a contagem: requestAnimationFrame calcula o progresso pelo tempo decorrido.',
      'A barra usa scaleX(progresso) e o número mostra o mesmo valor arredondado.',
      'No fim, o selo "PRONTO" entra com uma animação de carimbo: começa grande e girado e "bate" no lugar com um leve tremor.',
    ],
    alternativa: 'Com GSAP: TextPlugin para digitar e uma timeline com três etapas (digitar, progresso, selo) — fácil de repetir, pausar e sincronizar com áudio.',
    compatibilidade: 'requestAnimationFrame, setTimeout e animações CSS: todos os navegadores atuais.',
    responsividade: 'O cartão usa largura máxima e o texto do prompt quebra em várias linhas no celular.',
    acessibilidade: 'O texto completo do prompt está no aria-label do campo; o status (gerando / pronto) é anunciado por role="status". Com prefers-reduced-motion o texto aparece inteiro e a barra pula para 100%.',
    performance: 'Uma troca de texto por letra e um transform por quadro durante o progresso. Desprezível.',
    limitacoes: ['É uma simulação: num produto real, ligue a barra ao progresso verdadeiro do pedido.'],
    referencias: [
      { titulo: 'MDN — setTimeout()', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Window/setTimeout' },
      { titulo: 'MDN — ARIA: status role', url: 'https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/status_role' },
      { titulo: 'MDN — prefers-reduced-motion', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion' },
    ],
    validadoEm: VALIDADO_EM,
    status: 'validado',
  },
  params: [
    { id: 'velocidade', rotulo: 'tempo por letra', tipo: 'range', min: 20, max: 120, passo: 5, unidade: 'ms', padrao: 45 },
    { id: 'geracao', rotulo: 'tempo gerando', tipo: 'range', min: 1000, max: 4000, passo: 250, unidade: 'ms', padrao: 2000 },
    { id: 'acento', rotulo: 'cor de destaque', tipo: 'select', opcoes: ACENTOS, padrao: '#ff6a1a' },
  ],
  gerar: (v) => {
    const cor = String(v['acento']);
    return {
      html: `<section class="painel-ia">
  <p class="campo" aria-label="${PROMPT}"><span class="digitado" aria-hidden="true"></span></p>
  <div class="rodape">
    <button class="gerar" type="button" data-estado="digitando" disabled>Escrevendo…</button>
    <div class="progresso" aria-hidden="true"><span class="barra"></span></div>
    <span class="porcento" aria-hidden="true">0%</span>
  </div>
  <span class="selo" aria-hidden="true">✓ PRONTO</span>
  <p class="status" role="status"></p>
</section>
<button class="repetir" type="button">Repetir</button>`,
      css: `${cssPalco()}

.painel-ia {
  position: relative;
  display: grid;
  gap: 16px;
  width: min(100%, 560px);
  padding: 24px;
  border: 1px solid rgb(255 255 255 / 0.1);
  border-radius: 16px;
  background: #16110d;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
}
.campo { min-height: 3.2em; margin: 0; font-size: 18px; color: #f4f2ff; }
/* cursor piscando */
.digitado::after {
  content: '';
  display: inline-block;
  width: 0.55em;
  height: 1.1em;
  margin-left: 2px;
  vertical-align: -0.15em;
  background: ${cor};
  animation: piscar 1s steps(1) infinite;
}
@keyframes piscar { 50% { opacity: 0; } }

.rodape { display: flex; align-items: center; gap: 12px; }
.gerar {
  padding: 8px 14px;
  border: 0;
  border-radius: 999px;
  background: ${cor};
  color: #160b05;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
}
.gerar[data-estado='digitando'] { opacity: 0.45; }
.gerar[data-estado='gerando'] { animation: respirar 800ms ease-in-out infinite alternate; }
@keyframes respirar { to { opacity: 0.6; } }
.progresso { flex: 1; height: 6px; border-radius: 999px; background: rgb(255 255 255 / 0.1); overflow: hidden; }
.barra { display: block; height: 100%; background: ${cor}; transform: scaleX(var(--p, 0)); transform-origin: left center; }
.porcento { min-width: 4ch; color: ${cor}; font-variant-numeric: tabular-nums; text-align: right; }

/* Selo: começa grande e girado e "bate" no lugar */
.selo {
  position: absolute;
  right: 20px;
  top: -14px;
  padding: 6px 14px;
  border: 2px solid ${cor};
  border-radius: 8px;
  background: #16110d;
  color: ${cor};
  font-weight: 800;
  letter-spacing: 0.08em;
  rotate: -8deg;
  opacity: 0;
}
.painel-ia.is-pronto .selo { animation: carimbar 450ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
@keyframes carimbar {
  0% { opacity: 0; scale: 2.2; rotate: -24deg; }
  70% { opacity: 1; scale: 0.92; rotate: -6deg; }
  100% { opacity: 1; scale: 1; rotate: -8deg; }
}
.status { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }

.repetir {
  padding: 8px 16px;
  border: 1px solid #3a3456;
  border-radius: 999px;
  background: transparent;
  color: #c9c3ea;
  font: inherit;
  cursor: pointer;
}

@media (prefers-reduced-motion: reduce) {
  .digitado::after, .gerar[data-estado='gerando'] { animation: none; }
  .painel-ia.is-pronto .selo { animation: none; opacity: 1; }
}`,
      js: `const VELOCIDADE = ${v['velocidade']};
const GERACAO = ${v['geracao']};
const reduzir = matchMedia('(prefers-reduced-motion: reduce)');
const painel = document.querySelector('.painel-ia');
const campo = painel.querySelector('.campo');
const digitado = painel.querySelector('.digitado');
const botao = painel.querySelector('.gerar');
const porcento = painel.querySelector('.porcento');
const status = painel.querySelector('.status');
const texto = campo.getAttribute('aria-label');
let temporizador = 0;
let quadro = 0;

function estado(nome, rotulo) {
  botao.dataset.estado = nome;
  botao.textContent = rotulo;
}

function progresso(p) {
  painel.style.setProperty('--p', p);
  porcento.textContent = Math.round(p * 100) + '%';
}

function comecar() {
  clearTimeout(temporizador);
  cancelAnimationFrame(quadro);
  painel.classList.remove('is-pronto');
  status.textContent = '';
  progresso(0);
  estado('digitando', 'Escrevendo…');
  if (reduzir.matches) {
    digitado.textContent = texto;
    return gerar();
  }
  let n = 0;
  const digitar = () => {
    digitado.textContent = texto.slice(0, ++n);
    if (n < texto.length) temporizador = setTimeout(digitar, VELOCIDADE);
    else temporizador = setTimeout(gerar, 400);
  };
  digitar();
}

function gerar() {
  estado('gerando', 'Gerando…');
  status.textContent = 'Gerando';
  const inicio = performance.now();
  const passo = (agora) => {
    const p = reduzir.matches ? 1 : Math.min(1, (agora - inicio) / GERACAO);
    progresso(p);
    if (p < 1) quadro = requestAnimationFrame(passo);
    else {
      estado('pronto', 'Pronto');
      painel.classList.add('is-pronto');
      status.textContent = 'Pronto';
    }
  };
  quadro = requestAnimationFrame(passo);
}

comecar();
document.querySelector('.repetir').addEventListener('click', comecar);`,
    };
  },
  angular: (v) => ({
    ts: `import { Component, DestroyRef, afterNextRender, inject, signal } from '@angular/core';

type Estado = 'digitando' | 'gerando' | 'pronto';

@Component({
  selector: 'app-typewriter-prompt',
  templateUrl: './typewriter-prompt.html',
  styleUrl: './typewriter-prompt.css',
})
export class ${nomeClasse('typewriter-prompt')} {
  protected readonly texto = '${PROMPT}';
  private readonly velocidade = ${v['velocidade']};
  private readonly geracao = ${v['geracao']};
  private readonly reduzir = window.matchMedia('(prefers-reduced-motion: reduce)');
  private temporizador = 0;
  private quadro = 0;

  protected readonly digitado = signal('');
  protected readonly estado = signal<Estado>('digitando');
  protected readonly p = signal(0);

  protected readonly rotulos: Record<Estado, string> = { digitando: 'Escrevendo…', gerando: 'Gerando…', pronto: 'Pronto' };

  constructor() {
    afterNextRender(() => this.comecar());
    inject(DestroyRef).onDestroy(() => {
      clearTimeout(this.temporizador);
      cancelAnimationFrame(this.quadro);
    });
  }

  protected comecar(): void {
    clearTimeout(this.temporizador);
    cancelAnimationFrame(this.quadro);
    this.p.set(0);
    this.estado.set('digitando');
    if (this.reduzir.matches) {
      this.digitado.set(this.texto);
      return this.gerar();
    }
    let n = 0;
    const digitar = () => {
      this.digitado.set(this.texto.slice(0, ++n));
      this.temporizador = window.setTimeout(n < this.texto.length ? digitar : () => this.gerar(), n < this.texto.length ? this.velocidade : 400);
    };
    digitar();
  }

  private gerar(): void {
    this.estado.set('gerando');
    const inicio = performance.now();
    const passo = (agora: number) => {
      const p = this.reduzir.matches ? 1 : Math.min(1, (agora - inicio) / this.geracao);
      this.p.set(p);
      if (p < 1) this.quadro = requestAnimationFrame(passo);
      else this.estado.set('pronto');
    };
    this.quadro = requestAnimationFrame(passo);
  }
}
`,
    html: `<section class="painel-ia" [class.is-pronto]="estado() === 'pronto'" [style.--p]="p()">
  <p class="campo" [attr.aria-label]="texto"><span class="digitado" aria-hidden="true">{{ digitado() }}</span></p>
  <div class="rodape">
    <button class="gerar" type="button" [attr.data-estado]="estado()" [disabled]="estado() === 'digitando'">
      {{ rotulos[estado()] }}
    </button>
    <div class="progresso" aria-hidden="true"><span class="barra"></span></div>
    <span class="porcento" aria-hidden="true">{{ (p() * 100).toFixed(0) }}%</span>
  </div>
  <span class="selo" aria-hidden="true">✓ PRONTO</span>
  <p class="status" role="status">{{ estado() === 'digitando' ? '' : rotulos[estado()] }}</p>
</section>
<button class="repetir" type="button" (click)="comecar()">Repetir</button>
`,
    css: cssAngular(TYPEWRITER_PROMPT.gerar(v).css),
  }),
  niveis: {
    iniciante: [
      'Um texto vai sendo escrito sozinho, letra por letra, como numa máquina de escrever.',
      'Quando termina, o botão muda para "Gerando…" e uma barrinha enche até 100%.',
      'No final, aparece um carimbo "PRONTO" batendo no cartão.',
    ],
    avancado: [
      'setTimeout encadeado (e não setInterval) facilita variar o ritmo — por exemplo, pausas maiores depois de vírgulas.',
      'data-estado no botão concentra os estilos de cada fase no CSS; o JS só troca o valor.',
      'steps(1) no cursor faz ele piscar "seco", como num terminal, em vez de esmaecer.',
      'A animação de carimbo passa do ponto (scale 0.92) antes de assentar: a curva elástica dá a sensação de impacto.',
    ],
  },
  glossario: [
    { termo: 'slice(0', explicacao: 'Pega as primeiras n letras do texto: a digitação.' },
    { termo: 'data-estado', explicacao: 'Fase atual do botão (digitando, gerando, pronto).' },
    { termo: 'scaleX(var(--p, 0))', explicacao: 'A barra enche conforme o progresso.' },
    { termo: 'role="status"', explicacao: 'Anuncia "Gerando" e "Pronto" ao leitor de tela.' },
  ],
};
