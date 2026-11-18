import { EffectKit } from '../../models/effect-sheet.model';
import { MDN, VALIDADO_EM, cssAngular, cssPalco, nomeClasse } from './_base';

/** Desenho comum (JS puro e Angular): um quadro da hélice girada em "fase". */
const NUCLEO = (voltas: number, inclinacao: number) => `const VOLTAS = ${voltas};
const INCLINACAO = ${inclinacao} * Math.PI / 180;
const PONTOS = 260;

// poeira fixa em volta da hélice (sorteada uma vez)
const POEIRA = Array.from({ length: 220 }, () => ({
  t: Math.random(),
  dx: (Math.random() - 0.5) * 2.4,
  dy: (Math.random() - 0.5) * 40,
  a: Math.random() * 0.6,
}));

function desenharHelice(ctx, w, h, fase) {
  ctx.clearRect(0, 0, w, h);
  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.rotate(INCLINACAO);
  const comprimento = Math.hypot(w, h) * 0.9;
  const raio = Math.min(w, h) * 0.16;
  const ponto = (t, lado) => {
    const ang = t * VOLTAS * Math.PI * 2 + fase + lado * Math.PI;
    return { x: (t - 0.5) * comprimento, y: Math.cos(ang) * raio, z: Math.sin(ang) };
  };
  // degraus entre as duas fitas (a cada 8 pontos)
  for (let i = 0; i < PONTOS; i += 8) {
    const t = i / PONTOS;
    const a = ponto(t, 0);
    const b = ponto(t, 1);
    ctx.strokeStyle = 'rgb(255 255 255 / ' + (0.08 + 0.12 * (a.z + 1) / 2) + ')';
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
  // as duas fitas: pontos maiores e mais claros quando estão "na frente" (z > 0)
  for (const lado of [0, 1]) {
    for (let i = 0; i < PONTOS; i++) {
      const p = ponto(i / PONTOS, lado);
      const frente = (p.z + 1) / 2;
      ctx.fillStyle = lado === 0
        ? 'rgb(255 154 213 / ' + (0.25 + 0.75 * frente) + ')'
        : 'rgb(127 178 255 / ' + (0.25 + 0.75 * frente) + ')';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 0.6 + 1.8 * frente, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // poeira brilhante acompanhando a hélice
  for (const g of POEIRA) {
    const p = ponto(g.t, 0);
    ctx.fillStyle = 'rgb(255 255 255 / ' + g.a + ')';
    ctx.fillRect(p.x + g.dx * raio, p.y * 0.2 + g.dy, 1.4, 1.4);
  }
  ctx.restore();
}`;

export const PARTICLE_HELIX: EffectKit = {
  ficha: {
    id: 'particle-helix',
    nomeTecnico: 'Particle Helix (DNA em canvas)',
    nomeAmigavel: 'Hélice de DNA em partículas',
    categoria: 'particulas',
    subcategoria: 'Partículas 2D com profundidade',
    descricao: 'Duas fitas de pontos de luz, rosa e azul, giram em volta de um eixo como um DNA, ligadas por degraus finos e cercadas de poeira brilhante.',
    objetivoVisual: 'Simbolizar "a essência da marca", ciência ou crescimento; fundo vivo para vitrines de projetos e heros escuros.',
    aplicacoes: ['Fundo de portfólio e proposta comercial', 'Saúde, biotecnologia e ciência', 'Telas de abertura'],
    nivel: 'avancado',
    tecnologias: ['HTML', 'CSS', 'JavaScript', 'Canvas'],
    dependencias: [],
    interacoes: ['autoplay', 'click'],
    tags: ['dna', 'hélice', 'helix', 'partículas', 'canvas', '3d falso', 'profundidade', 'referência em vídeo'],
    explicacao: [
      'Cada fita é uma sequência de pontos ao longo de um eixo. A posição "vertical" de cada ponto é cos(ângulo) × raio; as duas fitas estão defasadas em meia volta (π).',
      'sin(ângulo) é usado como profundidade (z): pontos com z positivo estão "na frente", então ficam maiores e mais opacos. É um 3D falso, sem WebGL.',
      'Somar a "fase" ao ângulo a cada quadro faz a hélice girar. O canvas inteiro é rotacionado pela inclinação para deitar o DNA na diagonal.',
      'Os degraus ligam o mesmo ponto das duas fitas a cada 8 pontos; a poeira é sorteada uma vez e acompanha a fita.',
    ],
    alternativa: 'Em Three.js: Points com BufferGeometry para os pontos e LineSegments para os degraus, com câmera de verdade e profundidade real (e milhares de pontos).',
    compatibilidade: 'Canvas 2D: todos os navegadores atuais.',
    responsividade: 'O canvas pega o tamanho do palco × devicePixelRatio; raio e comprimento são proporcionais ao palco.',
    acessibilidade: 'Decorativo (aria-hidden). Movimento infinito com botão Pausar (WCAG 2.2.2). Com prefers-reduced-motion, um quadro parado é desenhado.',
    performance: '~520 pontos + degraus + poeira por quadro: leve em canvas 2D. Pare o loop quando o palco sair da tela (IntersectionObserver).',
    limitacoes: ['Profundidade só no tamanho/opacidade: os pontos não se escondem uns atrás dos outros de verdade (não há z-buffer).'],
    referencias: [MDN.raf, { titulo: 'MDN — Canvas: transformações', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Transformations' }, MDN.wcagMovimento],
    validadoEm: VALIDADO_EM,
    status: 'validado',
  },
  params: [
    { id: 'voltas', rotulo: 'voltas da hélice', tipo: 'range', min: 2, max: 6, passo: 1, unidade: '', padrao: 3 },
    { id: 'velocidade', rotulo: 'velocidade do giro', tipo: 'range', min: 0.002, max: 0.03, passo: 0.002, unidade: '', padrao: 0.01 },
    { id: 'inclinacao', rotulo: 'inclinação', tipo: 'range', min: -60, max: 60, passo: 5, unidade: 'deg', padrao: -30 },
  ],
  gerar: (v) => ({
    html: `<section class="helice-palco">
  <canvas class="helice" aria-hidden="true"></canvas>
  <h1>A essência da sua marca</h1>
</section>
<button class="pausar" type="button" aria-pressed="false">Pausar</button>`,
    css: `${cssPalco()}

.helice-palco {
  position: relative;
  display: grid;
  place-items: center;
  width: min(100%, 680px);
  aspect-ratio: 16 / 10;
  border-radius: 20px;
  overflow: hidden;
  background: radial-gradient(ellipse at 50% 40%, #12142e, #05050c 75%);
}
.helice { position: absolute; inset: 0; width: 100%; height: 100%; }
.helice-palco h1 {
  position: relative;
  margin: 0;
  font: 400 clamp(1.6rem, 6vw, 3rem) / 1.1 Georgia, serif;
  text-align: center;
  text-shadow: 0 2px 20px rgb(0 0 0 / 0.8);
}
.pausar {
  padding: 8px 16px;
  border: 1px solid #3a3456;
  border-radius: 999px;
  background: transparent;
  color: #c9c3ea;
  font: inherit;
  cursor: pointer;
}`,
    js: `${NUCLEO(Number(v['voltas']), Number(v['inclinacao']))}

const palco = document.querySelector('.helice-palco');
const canvas = palco.querySelector('.helice');
const ctx = canvas.getContext('2d');
const VELOCIDADE = ${v['velocidade']};
const reduzir = matchMedia('(prefers-reduced-motion: reduce)');

const dpr = devicePixelRatio || 1;
const w = palco.clientWidth;
const h = palco.clientHeight;
canvas.width = w * dpr;
canvas.height = h * dpr;
ctx.scale(dpr, dpr);

let fase = 0;
let rodando = !reduzir.matches;
function loop() {
  if (!rodando) return;
  fase += VELOCIDADE;
  desenharHelice(ctx, w, h, fase);
  requestAnimationFrame(loop);
}
desenharHelice(ctx, w, h, fase); // quadro inicial (e o estático)
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

interface Grao {
  t: number;
  dx: number;
  dy: number;
  a: number;
}

@Component({
  selector: 'app-particle-helix',
  templateUrl: './particle-helix.html',
  styleUrl: './particle-helix.css',
})
export class ${nomeClasse('particle-helix')} {
  private readonly palco = viewChild.required<ElementRef<HTMLElement>>('palco');
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly velocidade = ${v['velocidade']};
  private fase = 0;
  private quadro = 0;
  private desenhar: () => void = () => {};

  protected readonly pausado = signal(false);

  constructor() {
    afterNextRender(() => {
      const palco = this.palco().nativeElement;
      const canvas = this.canvas().nativeElement;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const dpr = window.devicePixelRatio || 1;
      const w = palco.clientWidth;
      const h = palco.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);
      this.desenhar = () => desenharHelice(ctx, w, h, this.fase);
      this.desenhar();
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) this.pausado.set(true);
      else this.loop();
    });
    inject(DestroyRef).onDestroy(() => cancelAnimationFrame(this.quadro));
  }

  protected alternar(): void {
    this.pausado.update((p) => !p);
    cancelAnimationFrame(this.quadro);
    if (!this.pausado()) this.loop();
  }

  private loop(): void {
    this.fase += this.velocidade;
    this.desenhar();
    this.quadro = requestAnimationFrame(() => this.loop());
  }
}

${NUCLEO(Number(v['voltas']), Number(v['inclinacao']))
  .replace('const POEIRA = Array.from', 'const POEIRA: Grao[] = Array.from')
  .replace('function desenharHelice(ctx, w, h, fase) {', 'function desenharHelice(ctx: CanvasRenderingContext2D, w: number, h: number, fase: number): void {')
  .replace('const ponto = (t, lado) => {', 'const ponto = (t: number, lado: number) => {')}
`,
    html: `<section #palco class="helice-palco">
  <canvas #canvas class="helice" aria-hidden="true"></canvas>
  <h1>A essência da sua marca</h1>
</section>
<button class="pausar" type="button" [attr.aria-pressed]="pausado()" (click)="alternar()">
  {{ pausado() ? 'Continuar' : 'Pausar' }}
</button>
`,
    css: cssAngular(PARTICLE_HELIX.gerar(v).css),
  }),
  niveis: {
    iniciante: [
      'São duas fileiras de pontinhos de luz, uma rosa e uma azul, enroladas uma na outra como um DNA.',
      'Elas giram devagar. Os pontos que estão "na frente" ficam maiores e mais brilhantes.',
      'Pontinhos soltos em volta dão o efeito de poeira de estrelas.',
    ],
    avancado: [
      'Hélice paramétrica: x = t × comprimento, y = cos(θ) × r, z = sin(θ), com θ = t × voltas × 2π + fase. A segunda fita usa θ + π.',
      'ctx.save()/translate()/rotate()/restore() inclinam o desenho inteiro sem recalcular cada ponto.',
      'Profundidade por tamanho e alfa é o "2.5D" mais barato; para ordenar por z de verdade, junte os pontos das duas fitas e ordene por z antes de desenhar.',
      'No Angular, o loop vive fora dos signals (desenho direto no canvas); só o estado do botão é um signal.',
    ],
  },
  glossario: [
    { termo: 'Math.cos', explicacao: 'Altura de cada ponto na volta da hélice.' },
    { termo: 'ctx.rotate', explicacao: 'Inclina o desenho inteiro da hélice.' },
    { termo: 'devicePixelRatio', explicacao: 'Deixa o canvas nítido em telas de alta densidade.' },
    { termo: 'aria-pressed', explicacao: 'Indica se a animação está pausada.' },
  ],
};
