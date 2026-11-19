import { EffectKit } from '../../models/effect-sheet.model';
import { MDN, VALIDADO_EM, cssAngular, cssPalco, nomeClasse } from './_base';

/** Simulação comum (JS puro e Angular). */
const NUCLEO = (qtd: number, dist: number, reacao: string) => `const QUANTIDADE = ${qtd};
const DISTANCIA = ${dist};
const FORCA = ${reacao === 'atrair' ? '0.02' : '-0.6'}; // ${reacao === 'atrair' ? 'positivo atrai' : 'negativo repele'}

function criarParticulas(w, h) {
  return Array.from({ length: QUANTIDADE }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    r: 1 + Math.random() * 2,
  }));
}

function passo(ctx, ps, w, h, mouse) {
  ctx.clearRect(0, 0, w, h);
  for (const p of ps) {
    // reação ao mouse dentro de um raio de 140px
    if (mouse.ativo) {
      const dx = mouse.x - p.x;
      const dy = mouse.y - p.y;
      const d = Math.hypot(dx, dy) || 1;
      if (d < 140) {
        p.vx += (dx / d) * FORCA * (1 - d / 140);
        p.vy += (dy / d) * FORCA * (1 - d / 140);
      }
    }
    p.vx *= 0.98; // atrito: a velocidade volta ao normal
    p.vy *= 0.98;
    p.x = (p.x + p.vx + 0.15 + w) % w; // deriva leve para a direita e dá a volta
    p.y = (p.y + p.vy + h) % h;
  }
  // linhas entre partículas próximas (constelação)
  for (let i = 0; i < ps.length; i++) {
    for (let j = i + 1; j < ps.length; j++) {
      const d = Math.hypot(ps[i].x - ps[j].x, ps[i].y - ps[j].y);
      if (d < DISTANCIA) {
        ctx.strokeStyle = 'rgb(198 255 61 / ' + (1 - d / DISTANCIA) * 0.35 + ')';
        ctx.beginPath();
        ctx.moveTo(ps[i].x, ps[i].y);
        ctx.lineTo(ps[j].x, ps[j].y);
        ctx.stroke();
      }
    }
  }
  // pontos com brilho
  ctx.shadowColor = '#c6ff3d';
  ctx.shadowBlur = 8;
  ctx.fillStyle = '#e8ffb0';
  for (const p of ps) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.shadowBlur = 0;
}`;

export const PARTICLE_FIELD: EffectKit = {
  ficha: {
    id: 'particle-field',
    nomeTecnico: 'Particle Constellation (canvas)',
    nomeAmigavel: 'Campo de partículas com constelação',
    categoria: 'particulas',
    subcategoria: 'Partículas 2D',
    descricao:
      'Pontos de luz flutuam devagar sobre o fundo; os que estão perto se ligam por linhas finas, e o mouse empurra (ou atrai) as partículas.',
    objetivoVisual:
      'Sugerir dados, conexões e ciência — o fundo "vivo" de heros de tecnologia, agro, saúde e IA.',
    aplicacoes: [
      'Fundo de hero de tecnologia',
      'Seções sobre dados e redes',
      'Telas de login e espera',
    ],
    nivel: 'intermediario',
    tecnologias: ['HTML', 'CSS', 'JavaScript', 'Canvas'],
    dependencias: [],
    interacoes: ['autoplay', 'mouse', 'click'],
    tags: [
      'partículas',
      'particles',
      'constelação',
      'canvas',
      'network',
      'vagalumes',
      'fundo animado',
      'referência em vídeo',
    ],
    explicacao: [
      'Cada partícula é um objeto com posição (x, y), velocidade (vx, vy) e raio. A cada quadro, a posição soma a velocidade.',
      'O atrito (× 0,98) faz o empurrão do mouse passar aos poucos; o resto (%) faz a partícula que sai de um lado voltar pelo outro.',
      'Para as linhas, comparamos todos os pares: se a distância é menor que o limite, desenhamos uma linha cuja opacidade cai com a distância.',
      'O mouse aplica uma força na direção dele (atrair) ou contrária (repelir), mais forte quanto mais perto.',
    ],
    alternativa:
      'Para milhares de partículas: Three.js com Points e BufferGeometry (GPU), ou um fragment shader. Bibliotecas prontas: tsParticles.',
    compatibilidade: 'Canvas 2D: todos os navegadores atuais.',
    responsividade:
      'O canvas é redimensionado para o tamanho real do palco (vezes devicePixelRatio) ao carregar, então fica nítido em qualquer tela.',
    acessibilidade:
      'Decorativo (aria-hidden). Movimento automático tem botão Pausar (WCAG 2.2.2). Com prefers-reduced-motion, um quadro estático é desenhado e a animação não começa.',
    performance:
      'As linhas comparam todos os pares (n²): 90 partículas = ~4 mil comparações por quadro, tranquilo. Acima de ~250, use uma grade espacial ou WebGL.',
    limitacoes: [
      'shadowBlur é caro em alguns navegadores; para muitos pontos, desenhe o brilho com um gradiente radial pré-pronto (sprite).',
    ],
    referencias: [
      MDN.raf,
      {
        titulo: 'MDN — Canvas API: tutorial de animação',
        url: 'https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Basic_animations',
      },
      MDN.wcagMovimento,
    ],
    validadoEm: VALIDADO_EM,
    status: 'validado',
  },
  params: [
    {
      id: 'quantidade',
      rotulo: 'partículas',
      tipo: 'range',
      min: 30,
      max: 200,
      passo: 10,
      unidade: '',
      padrao: 90,
    },
    {
      id: 'distancia',
      rotulo: 'alcance das linhas',
      tipo: 'range',
      min: 0,
      max: 160,
      passo: 10,
      unidade: 'px',
      padrao: 90,
    },
    {
      id: 'reacao',
      rotulo: 'reação ao mouse',
      tipo: 'select',
      opcoes: [
        { valor: 'repelir', rotulo: 'repelir' },
        { valor: 'atrair', rotulo: 'atrair' },
      ],
      padrao: 'repelir',
    },
  ],
  gerar: (v) => ({
    html: `<section class="campo">
  <canvas class="particulas" aria-hidden="true"></canvas>
  <h1>Dados que crescem</h1>
</section>
<button class="pausar" type="button" aria-pressed="false">Pausar</button>`,
    css: `${cssPalco()}

.campo {
  position: relative;
  display: grid;
  place-items: center;
  width: min(100%, 680px);
  aspect-ratio: 16 / 10;
  border-radius: 20px;
  overflow: hidden;
  background: radial-gradient(ellipse at 50% 100%, #1f4a2a, #071009 70%);
}
.particulas { position: absolute; inset: 0; width: 100%; height: 100%; }
.campo h1 { position: relative; margin: 0; font-size: clamp(1.8rem, 7vw, 3.4rem); letter-spacing: -0.03em; pointer-events: none; }

.pausar {
  padding: 8px 16px;
  border: 1px solid #3a3456;
  border-radius: 999px;
  background: transparent;
  color: #c9c3ea;
  font: inherit;
  cursor: pointer;
}`,
    js: `${NUCLEO(Number(v['quantidade']), Number(v['distancia']), String(v['reacao']))}

const campo = document.querySelector('.campo');
const canvas = campo.querySelector('.particulas');
const ctx = canvas.getContext('2d');
const reduzir = matchMedia('(prefers-reduced-motion: reduce)');

// tamanho real do palco × densidade de pixels: nítido em telas retina
const dpr = devicePixelRatio || 1;
const w = campo.clientWidth;
const h = campo.clientHeight;
canvas.width = w * dpr;
canvas.height = h * dpr;
ctx.scale(dpr, dpr);

const particulas = criarParticulas(w, h);
const mouse = { x: 0, y: 0, ativo: false };
let rodando = !reduzir.matches;

campo.addEventListener('pointermove', (e) => {
  const r = campo.getBoundingClientRect();
  mouse.x = e.clientX - r.left;
  mouse.y = e.clientY - r.top;
  mouse.ativo = true;
});
campo.addEventListener('pointerleave', () => (mouse.ativo = false));

function loop() {
  if (!rodando) return;
  passo(ctx, particulas, w, h, mouse);
  requestAnimationFrame(loop);
}
passo(ctx, particulas, w, h, mouse); // primeiro quadro (também o estático)
loop();

const botao = document.querySelector('.pausar');
botao.addEventListener('click', () => {
  rodando = !rodando;
  botao.setAttribute('aria-pressed', String(!rodando));
  botao.textContent = rodando ? 'Pausar' : 'Continuar';
  loop();
});`,
  }),
  angular: (v) => ({
    ts: `import { Component, DestroyRef, ElementRef, afterNextRender, inject, signal, viewChild } from '@angular/core';

interface Particula {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
}

interface Mouse {
  x: number;
  y: number;
  ativo: boolean;
}

@Component({
  selector: 'app-particle-field',
  templateUrl: './particle-field.html',
  styleUrl: './particle-field.css',
})
export class ${nomeClasse('particle-field')} {
  private readonly campo = viewChild.required<ElementRef<HTMLElement>>('campo');
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly mouse: Mouse = { x: 0, y: 0, ativo: false };
  private quadro = 0;
  private desenhar: () => void = () => undefined;

  protected readonly pausado = signal(false);

  constructor() {
    afterNextRender(() => {
      const campo = this.campo().nativeElement;
      const canvas = this.canvas().nativeElement;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const dpr = window.devicePixelRatio || 1;
      const w = campo.clientWidth;
      const h = campo.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);
      const particulas = criarParticulas(w, h);
      this.desenhar = () => passo(ctx, particulas, w, h, this.mouse);
      this.desenhar(); // primeiro quadro (também o estático)
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) this.pausado.set(true);
      else this.loop();
    });
    inject(DestroyRef).onDestroy(() => cancelAnimationFrame(this.quadro));
  }

  protected mover(e: PointerEvent): void {
    const r = this.campo().nativeElement.getBoundingClientRect();
    this.mouse.x = e.clientX - r.left;
    this.mouse.y = e.clientY - r.top;
    this.mouse.ativo = true;
  }

  protected sair(): void {
    this.mouse.ativo = false;
  }

  protected alternar(): void {
    this.pausado.update((p) => !p);
    cancelAnimationFrame(this.quadro);
    if (!this.pausado()) this.loop();
  }

  private loop(): void {
    this.desenhar();
    this.quadro = requestAnimationFrame(() => this.loop());
  }
}

${NUCLEO(Number(v['quantidade']), Number(v['distancia']), String(v['reacao']))
  .replace(
    'function criarParticulas(w, h) {',
    'function criarParticulas(w: number, h: number): Particula[] {',
  )
  .replace(
    'function passo(ctx, ps, w, h, mouse) {',
    'function passo(ctx: CanvasRenderingContext2D, ps: Particula[], w: number, h: number, mouse: Mouse): void {',
  )}
`,
    html: `<section #campo class="campo" (pointermove)="mover($event)" (pointerleave)="sair()">
  <canvas #canvas class="particulas" aria-hidden="true"></canvas>
  <h1>Dados que crescem</h1>
</section>
<button class="pausar" type="button" [attr.aria-pressed]="pausado()" (click)="alternar()">
  {{ pausado() ? 'Continuar' : 'Pausar' }}
</button>
`,
    css: cssAngular(PARTICLE_FIELD.gerar(v).css),
  }),
  niveis: {
    iniciante: [
      'Dezenas de pontinhos de luz flutuam devagar, como vagalumes.',
      'Quando dois pontinhos ficam perto, aparece uma linha fininha ligando os dois, formando uma "constelação".',
      'O mouse empurra os pontinhos para longe (ou puxa, se você escolher atrair). O botão Pausar para tudo.',
    ],
    avancado: [
      'Integração de Euler simples: posição += velocidade; velocidade += força; velocidade × atrito. É a base de quase toda simulação de partículas.',
      'O % com (+ w) antes evita módulo negativo em JS, que daria posição negativa quando a partícula sai pela esquerda.',
      'ctx.scale(dpr, dpr) permite desenhar em "pixels CSS" e ainda assim ter nitidez de tela retina.',
      'No Angular, o loop roda fora de signals (desenho direto no canvas); só o estado do botão é um signal.',
    ],
  },
  glossario: [
    { termo: 'Math.hypot', explicacao: 'Distância entre dois pontos (teorema de Pitágoras).' },
    { termo: 'shadowBlur', explicacao: 'Brilho em volta de cada ponto.' },
    {
      termo: 'devicePixelRatio',
      explicacao: 'Densidade de pixels da tela, para o canvas ficar nítido.',
    },
    { termo: 'aria-pressed', explicacao: 'Indica se a animação está pausada.' },
  ],
};
