# Campo de partículas com constelação (`particle-field`)

> Gerado a partir de `src/app/core/efeitos/kits/particle-field.kit.ts`. Não edite à mão: rode `npm run docs:efeitos`.

Pontos de luz flutuam devagar sobre o fundo; os que estão perto se ligam por linhas finas, e o mouse empurra (ou atrai) as partículas.

| Campo | Valor |
|---|---|
| Nome técnico | Particle Constellation (canvas) |
| Categoria | 10 · Partículas e simulações › Partículas 2D |
| Nível | Intermediário |
| Tecnologias | HTML, CSS, JavaScript, Canvas |
| Dependências | nenhuma |
| Interação | Automático, Movimento do mouse, Clique |
| Status | validado em 2026-11-17 |
| Tags | partículas, particles, constelação, canvas, network, vagalumes, fundo animado, referência em vídeo |

## Objetivo visual

Sugerir dados, conexões e ciência — o fundo "vivo" de heros de tecnologia, agro, saúde e IA.

## Aplicações

- Fundo de hero de tecnologia
- Seções sobre dados e redes
- Telas de login e espera

## Como funciona

### Nível 1 — Iniciante

- Dezenas de pontinhos de luz flutuam devagar, como vagalumes.
- Quando dois pontinhos ficam perto, aparece uma linha fininha ligando os dois, formando uma "constelação".
- O mouse empurra os pontinhos para longe (ou puxa, se você escolher atrair). O botão Pausar para tudo.

### Nível 2 — Intermediário

- Cada partícula é um objeto com posição (x, y), velocidade (vx, vy) e raio. A cada quadro, a posição soma a velocidade.
- O atrito (× 0,98) faz o empurrão do mouse passar aos poucos; o resto (%) faz a partícula que sai de um lado voltar pelo outro.
- Para as linhas, comparamos todos os pares: se a distância é menor que o limite, desenhamos uma linha cuja opacidade cai com a distância.
- O mouse aplica uma força na direção dele (atrair) ou contrária (repelir), mais forte quanto mais perto.

### Nível 3 — Avançado

- Integração de Euler simples: posição += velocidade; velocidade += força; velocidade × atrito. É a base de quase toda simulação de partículas.
- O % com (+ w) antes evita módulo negativo em JS, que daria posição negativa quando a partícula sai pela esquerda.
- ctx.scale(dpr, dpr) permite desenhar em "pixels CSS" e ainda assim ter nitidez de tela retina.
- No Angular, o loop roda fora de signals (desenho direto no canvas); só o estado do botão é um signal.

### Glossário do código

| Termo | O que faz |
|---|---|
| `Math.hypot` | Distância entre dois pontos (teorema de Pitágoras). |
| `shadowBlur` | Brilho em volta de cada ponto. |
| `devicePixelRatio` | Densidade de pixels da tela, para o canvas ficar nítido. |
| `aria-pressed` | Indica se a animação está pausada. |

## Parâmetros

| Controle | Tipo | Padrão | Faixa / opções |
|---|---|---|---|
| partículas | range | 90 | 30–200 (passo 10) |
| alcance das linhas | range | 90px | 0–160px (passo 10) |
| reação ao mouse | seleção | repelir | repelir, atrair |

## Outra forma de fazer

Para milhares de partículas: Three.js com Points e BufferGeometry (GPU), ou um fragment shader. Bibliotecas prontas: tsParticles.

## Compatibilidade

Canvas 2D: todos os navegadores atuais.

## Responsividade

O canvas é redimensionado para o tamanho real do palco (vezes devicePixelRatio) ao carregar, então fica nítido em qualquer tela.

## Acessibilidade

Decorativo (aria-hidden). Movimento automático tem botão Pausar (WCAG 2.2.2). Com prefers-reduced-motion, um quadro estático é desenhado e a animação não começa.

## Performance

As linhas comparam todos os pares (n²): 90 partículas = ~4 mil comparações por quadro, tranquilo. Acima de ~250, use uma grade espacial ou WebGL.

## Limitações

- shadowBlur é caro em alguns navegadores; para muitos pontos, desenhe o brilho com um gradiente radial pré-pronto (sprite).

## Referências

- [MDN — requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame)
- [MDN — Canvas API: tutorial de animação](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Basic_animations)
- [WCAG 2.2 — 2.3.3 Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)

## Código (valores padrão)

Arquivo único, igual ao baixado pelo botão “Baixar” na página do efeito:

```html
<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data:; font-src data:">
<title>Campo de partículas com constelação · Kalixto Creative Lab</title>
<style>
/* Palco da demonstração */
* { box-sizing: border-box; }
html, body { height: 100%; margin: 0; }
body {
  display: grid;
  place-items: center;
  gap: 24px;
  padding: 24px;
  background: #0b0a14;
  color: #f4f2ff;
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
}

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
}
</style>
</head>
<body>
<section class="campo">
  <canvas class="particulas" aria-hidden="true"></canvas>
  <h1>Dados que crescem</h1>
</section>
<button class="pausar" type="button" aria-pressed="false">Pausar</button>
<script>
const QUANTIDADE = 90;
const DISTANCIA = 90;
const FORCA = -0.6; // negativo repele

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
}

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
});
</script>
</body>
</html>
```

## Versão Angular (valores padrão)

Também em `src/app/efeitos-angular/particle-field/` (compilada e testada com o app).

`particle-field.ts`

```ts
import { Component, DestroyRef, ElementRef, afterNextRender, inject, signal, viewChild } from '@angular/core';

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
export class ParticleField {
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

const QUANTIDADE = 90;
const DISTANCIA = 90;
const FORCA = -0.6; // negativo repele

function criarParticulas(w: number, h: number): Particula[] {
  return Array.from({ length: QUANTIDADE }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    r: 1 + Math.random() * 2,
  }));
}

function passo(ctx: CanvasRenderingContext2D, ps: Particula[], w: number, h: number, mouse: Mouse): void {
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
}
```

`particle-field.html`

```html
<section #campo class="campo" (pointermove)="mover($event)" (pointerleave)="sair()">
  <canvas #canvas class="particulas" aria-hidden="true"></canvas>
  <h1>Dados que crescem</h1>
</section>
<button class="pausar" type="button" [attr.aria-pressed]="pausado()" (click)="alternar()">
  {{ pausado() ? 'Continuar' : 'Pausar' }}
</button>
```

`particle-field.css`

```css
:host {
  display: grid;
  place-items: center;
  gap: 24px;
}

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
}
```
