import { EffectKit } from '../../models/effect-sheet.model';
import { VALIDADO_EM, cssAngular, cssPalco, nomeClasse } from './_base';

const PASSOS = [
  { titulo: 'Design system', detalhe: 'Cores, fontes e componentes' },
  { titulo: 'Página', detalhe: 'Copy, layout e animações' },
  { titulo: 'Publicação', detalhe: 'Domínio e site no ar' },
];

const ACENTOS = [
  { valor: '#ff6a1a', rotulo: 'Laranja' },
  { valor: '#a78bfa', rotulo: 'Lilás' },
  { valor: '#2ee59d', rotulo: 'Verde' },
] as const;

export const STEP_UNLOCK: EffectKit = {
  ficha: {
    id: 'step-unlock',
    nomeTecnico: 'Locked Steps Unlock (progresso por etapas)',
    nomeAmigavel: 'Etapas que se desbloqueiam',
    categoria: 'componentes-dados',
    subcategoria: 'Progresso e estados',
    descricao:
      'Uma trilha de etapas bloqueadas, com cadeado e "?"; uma a uma, o cadeado treme e abre, o nome da etapa aparece e um selo "FEITO" é carimbado, enquanto o contador sobe.',
    objetivoVisual:
      'Mostrar um método em passos de um jeito de jogo: cada etapa concluída é uma pequena conquista.',
    aplicacoes: [
      'Apresentar um método ou processo de trabalho',
      'Onboarding e cursos (trilhas)',
      'Vídeos explicativos de serviço',
    ],
    nivel: 'intermediario',
    tecnologias: ['HTML', 'CSS', 'JavaScript'],
    dependencias: [],
    interacoes: ['autoplay', 'click', 'keyboard'],
    tags: [
      'etapas',
      'passos',
      'steps',
      'desbloquear',
      'cadeado',
      'gamificação',
      'progresso',
      'selo',
      'referência em vídeo',
    ],
    explicacao: [
      'Cada etapa é um <li> com um estado em data-estado: "bloqueado" ou "livre". Todo o visual (cadeado, título escondido, selo) sai do CSS conforme esse atributo.',
      'Ao desbloquear, a etapa recebe primeiro a classe de "tremer" (o cadeado balança), e só depois de 350 ms passa a "livre": o cadeado vira ✓, o título aparece e o selo carimba.',
      'No modo automático, um temporizador desbloqueia a próxima etapa a cada intervalo; no modo clique, o botão faz isso.',
      'O contador "0/3" é atualizado a cada etapa e anunciado ao leitor de tela.',
    ],
    alternativa:
      'Com GSAP: uma timeline com uma etapa por passo (shake → troca de estado → selo), boa para sincronizar com narração de vídeo.',
    compatibilidade:
      'Atributos data-*, seletores de atributo e animações CSS: todos os navegadores atuais.',
    responsividade: 'Lista em coluna única com largura máxima: igual no celular e no computador.',
    acessibilidade:
      'Cada etapa diz o próprio estado em texto ("bloqueada" / "concluída", visível para o leitor de tela). O contador está numa região aria-live. Com prefers-reduced-motion não há tremor nem carimbo animado.',
    performance: 'Só trocas de atributo e animações curtas de transform.',
    limitacoes: [
      'Etapas com títulos longos: o título escondido ("?") reserva pouco espaço; ajuste a largura mínima.',
    ],
    referencias: [
      {
        titulo: 'MDN — Seletores de atributo',
        url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/Attribute_selectors',
      },
      {
        titulo: 'MDN — aria-live',
        url: 'https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-live',
      },
      {
        titulo: 'MDN — prefers-reduced-motion',
        url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion',
      },
    ],
    validadoEm: VALIDADO_EM,
    status: 'validado',
  },
  params: [
    {
      id: 'intervalo',
      rotulo: 'intervalo entre etapas',
      tipo: 'range',
      min: 600,
      max: 2500,
      passo: 100,
      unidade: 'ms',
      padrao: 1300,
    },
    {
      id: 'modo',
      rotulo: 'como desbloqueia',
      tipo: 'select',
      opcoes: [
        { valor: 'automatico', rotulo: 'automático' },
        { valor: 'clique', rotulo: 'no clique' },
      ],
      padrao: 'automatico',
    },
    { id: 'acento', rotulo: 'cor de destaque', tipo: 'select', opcoes: ACENTOS, padrao: '#ff6a1a' },
  ],
  gerar: (v) => {
    const cor = String(v['acento']);
    const auto = v['modo'] === 'automatico';
    return {
      html: `<section class="trilha-passos">
  <p class="contador" aria-live="polite">Desbloqueado <strong>0</strong>/${PASSOS.length}</p>
  <ol class="passos">
${PASSOS.map(
  (p, i) => `    <li class="passo" data-estado="bloqueado">
      <span class="cadeado" aria-hidden="true"></span>
      <span class="num">0${i + 1}</span>
      <span class="texto"><strong>${p.titulo}</strong><small>${p.detalhe}</small></span>
      <span class="sr-estado">bloqueada</span>
      <span class="selo" aria-hidden="true">FEITO</span>
    </li>`,
).join('\n')}
  </ol>
</section>
<button class="avancar" type="button">${auto ? 'Recomeçar' : 'Desbloquear próxima'}</button>`,
      css: `${cssPalco()}

.trilha-passos { display: grid; gap: 12px; width: min(100%, 440px); }
.contador { margin: 0; color: #c9c3ea; font: 600 13px ui-monospace, monospace; letter-spacing: 0.08em; text-transform: uppercase; }
.contador strong { color: ${cor}; }
.passos { display: grid; gap: 10px; margin: 0; padding: 0; list-style: none; }

.passo {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border: 1px solid rgb(255 255 255 / 0.1);
  border-radius: 14px;
  background: #15121c;
  transition: border-color 400ms ease, background 400ms ease;
}
.cadeado {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgb(255 255 255 / 0.06);
}
.cadeado::before { content: '🔒'; font-size: 16px; }
.num { padding: 2px 8px; border-radius: 6px; background: #f4f2ff; color: #15121c; font: 800 13px ui-monospace, monospace; }
.texto { display: grid; }
.texto small { color: #8f88b5; }

/* Bloqueado: título escondido, só "?" */
.passo[data-estado='bloqueado'] .texto { color: transparent; }
.passo[data-estado='bloqueado'] .texto strong::before { content: '?'; color: #f4f2ff; position: absolute; }
.passo[data-estado='bloqueado'] .texto small { color: transparent; }

/* Tremendo: o cadeado balança antes de abrir */
.passo.is-tremendo .cadeado { animation: tremer 350ms ease-in-out; }
@keyframes tremer {
  25% { rotate: -12deg; }
  50% { rotate: 10deg; }
  75% { rotate: -6deg; }
}

/* Livre: ✓, título aparece, selo carimba */
.passo[data-estado='livre'] { border-color: ${cor}; background: color-mix(in srgb, ${cor} 10%, #15121c); }
.passo[data-estado='livre'] .cadeado { background: ${cor}; }
.passo[data-estado='livre'] .cadeado::before { content: '✓'; color: #15121c; font-weight: 800; }
.passo[data-estado='livre'] .texto { animation: revelar 400ms ease both; }
@keyframes revelar { from { opacity: 0; translate: 6px 0; } }
.selo {
  position: absolute;
  right: 12px;
  top: -10px;
  padding: 2px 10px;
  border-radius: 999px;
  background: ${cor};
  color: #15121c;
  font: 800 11px ui-monospace, monospace;
  letter-spacing: 0.08em;
  opacity: 0;
}
.passo[data-estado='livre'] .selo { animation: carimbar 420ms cubic-bezier(0.34, 1.56, 0.64, 1) 150ms both; }
@keyframes carimbar {
  from { opacity: 0; scale: 2; rotate: -18deg; }
  to { opacity: 1; scale: 1; rotate: 0deg; }
}
.sr-estado { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }

.avancar {
  padding: 10px 20px;
  border: 1px solid #3a3456;
  border-radius: 999px;
  background: transparent;
  color: #f4f2ff;
  font: inherit;
  cursor: pointer;
}
.avancar:focus-visible { outline: 2px solid #22e3ff; outline-offset: 3px; }

@media (prefers-reduced-motion: reduce) {
  .passo.is-tremendo .cadeado, .passo[data-estado='livre'] .texto { animation: none; }
  .passo[data-estado='livre'] .selo { animation: none; opacity: 1; }
}`,
      js: `const INTERVALO = ${v['intervalo']};
const AUTOMATICO = ${auto};
const reduzir = matchMedia('(prefers-reduced-motion: reduce)');
const passos = [...document.querySelectorAll('.passo')];
const contador = document.querySelector('.contador strong');
const botao = document.querySelector('.avancar');
let feitos = 0;
let temporizador = 0;

function desbloquear() {
  const passo = passos[feitos];
  if (!passo) return;
  feitos++;
  passo.classList.add('is-tremendo');
  // o cadeado treme primeiro; depois a etapa fica livre
  setTimeout(() => {
    passo.classList.remove('is-tremendo');
    passo.dataset.estado = 'livre';
    passo.querySelector('.sr-estado').textContent = 'concluída';
    contador.textContent = String(passos.filter((p) => p.dataset.estado === 'livre').length);
    if (!AUTOMATICO && feitos === passos.length) botao.textContent = 'Recomeçar';
  }, reduzir.matches ? 0 : 350);
  if (AUTOMATICO && feitos < passos.length) temporizador = setTimeout(desbloquear, INTERVALO);
}

function recomecar() {
  clearTimeout(temporizador);
  feitos = 0;
  passos.forEach((p) => {
    p.dataset.estado = 'bloqueado';
    p.querySelector('.sr-estado').textContent = 'bloqueada';
  });
  contador.textContent = '0';
  botao.textContent = AUTOMATICO ? 'Recomeçar' : 'Desbloquear próxima';
  if (AUTOMATICO) temporizador = setTimeout(desbloquear, INTERVALO);
}

botao.addEventListener('click', () => {
  if (AUTOMATICO || feitos === passos.length) recomecar();
  else desbloquear();
});
if (AUTOMATICO) temporizador = setTimeout(desbloquear, INTERVALO);`,
    };
  },
  angular: (v) => {
    const auto = v['modo'] === 'automatico';
    return {
      ts: `import { Component, DestroyRef, computed, inject, signal } from '@angular/core';

@Component({
  selector: 'app-step-unlock',
  templateUrl: './step-unlock.html',
  styleUrl: './step-unlock.css',
})
export class ${nomeClasse('step-unlock')} {
  protected readonly passos = ${JSON.stringify(PASSOS, null, 2)
    .replace(/\n/g, '\n  ')
    .replace(/"(\w+)":/g, '$1:')
    .replace(/"/g, "'")};
  protected readonly automatico = ${auto};
  private readonly intervalo = ${v['intervalo']};
  private readonly reduzir = window.matchMedia('(prefers-reduced-motion: reduce)');
  private temporizador = 0;

  /** Quantas etapas já estão livres e qual está tremendo agora. */
  protected readonly livres = signal(0);
  protected readonly tremendo = signal(-1);
  protected readonly terminou = computed(() => this.livres() === this.passos.length);

  constructor() {
    if (this.automatico) this.agendar();
    inject(DestroyRef).onDestroy(() => clearTimeout(this.temporizador));
  }

  protected clicar(): void {
    if (this.automatico || this.terminou()) this.recomecar();
    else this.desbloquear();
  }

  private agendar(): void {
    this.temporizador = window.setTimeout(() => this.desbloquear(), this.intervalo);
  }

  private desbloquear(): void {
    const i = this.livres();
    if (i >= this.passos.length || this.tremendo() !== -1) return;
    this.tremendo.set(i);
    setTimeout(() => {
      this.tremendo.set(-1);
      this.livres.set(i + 1);
      if (this.automatico && i + 1 < this.passos.length) this.agendar();
    }, this.reduzir.matches ? 0 : 350);
  }

  private recomecar(): void {
    clearTimeout(this.temporizador);
    this.livres.set(0);
    this.tremendo.set(-1);
    if (this.automatico) this.agendar();
  }
}
`,
      html: `<section class="trilha-passos">
  <p class="contador" aria-live="polite">Desbloqueado <strong>{{ livres() }}</strong>/{{ passos.length }}</p>
  <ol class="passos">
    @for (p of passos; track p.titulo; let i = $index) {
      <li class="passo" [attr.data-estado]="i < livres() ? 'livre' : 'bloqueado'" [class.is-tremendo]="tremendo() === i">
        <span class="cadeado" aria-hidden="true"></span>
        <span class="num">0{{ i + 1 }}</span>
        <span class="texto"><strong>{{ p.titulo }}</strong><small>{{ p.detalhe }}</small></span>
        <span class="sr-estado">{{ i < livres() ? 'concluída' : 'bloqueada' }}</span>
        <span class="selo" aria-hidden="true">FEITO</span>
      </li>
    }
  </ol>
</section>
<button class="avancar" type="button" (click)="clicar()">
  {{ automatico || terminou() ? 'Recomeçar' : 'Desbloquear próxima' }}
</button>
`,
      css: cssAngular(STEP_UNLOCK.gerar(v).css),
    };
  },
  niveis: {
    iniciante: [
      'São três cartões de etapa, todos trancados com cadeado e com um "?" no lugar do nome.',
      'Um por um, o cadeado treme, abre, vira um ✓ e o nome da etapa aparece, com um selo "FEITO".',
      'Em cima, o contador mostra quantas etapas já foram liberadas.',
    ],
    avancado: [
      'Estado no DOM via data-estado: o CSS reage com seletores de atributo ([data-estado="livre"]) — o JS não mexe em estilo nenhum.',
      'Separar "tremer" (classe temporária) de "livre" (estado) permite encadear duas animações com um único setTimeout.',
      'color-mix(in srgb, cor 10%, fundo) gera o fundo tingido da etapa livre a partir da cor de destaque, sem uma segunda variável.',
      'No Angular, o estado é só um número (livres) e um índice (tremendo); o template calcula o data-estado de cada etapa.',
    ],
  },
  glossario: [
    { termo: 'data-estado', explicacao: 'Guarda se a etapa está bloqueada ou livre.' },
    {
      termo: "[data-estado='livre']",
      explicacao: 'Seletor de atributo: estilos da etapa liberada.',
    },
    { termo: 'color-mix', explicacao: 'Mistura a cor de destaque com o fundo.' },
    { termo: 'aria-live', explicacao: 'Anuncia o contador quando uma etapa é liberada.' },
  ],
};
