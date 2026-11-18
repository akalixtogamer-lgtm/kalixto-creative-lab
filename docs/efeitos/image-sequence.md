# Sequência de quadros no scroll (`image-sequence`)

> Gerado a partir de `src/app/core/efeitos/kits/image-sequence.kit.ts`. Não edite à mão: rode `npm run docs:efeitos`.

Um "vídeo" que anda para frente e para trás com a rolagem: cada posição do scroll mostra um quadro diferente num canvas fixo na tela.

| Campo | Valor |
|---|---|
| Nome técnico | Scroll Image Sequence (canvas) |
| Categoria | 03 · Scroll e parallax › Scrollytelling cinematográfico |
| Nível | Avançado |
| Tecnologias | HTML, CSS, JavaScript, Canvas |
| Dependências | nenhuma |
| Interação | Rolagem |
| Status | validado em 2026-11-17 |
| Tags | image sequence, sequência de quadros, canvas, scrollytelling, apple, cinematográfico, sticky, referência em vídeo |

## Objetivo visual

Contar a história de um produto como num comercial, com o usuário no controle do tempo — o efeito dos sites "cinematográficos".

## Aplicações

- Lançamento de produto (giro 360°, explosão de peças)
- Heros de marcas de café, bebidas, tênis
- Storytelling de marca

## Como funciona

### Nível 1 — Iniciante

- É como um "folioscópio" (aquele bloquinho que vira desenho animado quando você passa as folhas rápido).
- Cada pedacinho da rolagem mostra uma folha diferente. Rolando para baixo o filme anda; rolando para cima ele volta.
- A tela do filme fica parada no meio enquanto você rola a seção.

### Nível 2 — Intermediário

- A seção é bem alta (várias telas) e o canvas fica preso no meio dela com position: sticky. Rolar a seção = avançar o "vídeo".
- O progresso é (quanto já rolou dentro da seção) ÷ (altura da seção − altura da tela), de 0 a 1. Multiplicado pelo número de quadros, vira o índice do quadro.
- Os quadros são preparados antes (aqui, desenhados em canvas fora da tela; num site real, imagens carregadas com new Image()). Na rolagem só acontece drawImage — rápido.
- A suavização aproxima o quadro atual do quadro-alvo aos poucos (interpolação), escondendo o "degrau" entre quadros quando o scroll é brusco.

### Nível 3 — Avançado

- Separar "preparar" (pré-carregar/decodificar) de "mostrar" (drawImage) é o que deixa o efeito fluido; decodificar imagem durante o scroll trava.
- O loop com requestAnimationFrame + interpolação (atual += (alvo − atual) × k) é o mesmo princípio do scrub com atraso do GSAP (scrub: 0.5).
- Com imagens reais, use img.decode() antes de marcar o quadro como pronto e pare o loop quando a seção sair da tela (IntersectionObserver).
- Em telas retina, multiplique width/height do canvas por devicePixelRatio e reduza com CSS para não ficar borrado.

### Glossário do código

| Termo | O que faz |
|---|---|
| `position: sticky` | Prende o canvas na tela enquanto a seção alta passa. |
| `drawImage` | Copia um quadro já pronto para o canvas visível. |
| `getBoundingClientRect` | Posição da seção na tela — base do cálculo do progresso. |
| `requestAnimationFrame` | Executa o desenho uma vez por quadro de tela. |

## Parâmetros

| Controle | Tipo | Padrão | Faixa / opções |
|---|---|---|---|
| número de quadros | range | 60 | 24–120 (passo 12) |
| altura da seção | range | 400vh | 200–600vh (passo 50) |
| suavização | range | 0.2 | 0.05–1 (passo 0.05) |

## Outra forma de fazer

Com GSAP: ScrollTrigger com scrub e pin animando um objeto { frame: 0 → n } e desenhando no onUpdate. Ou um <video> com currentTime ligado ao scroll (mais leve de baixar, mas trava em muitos navegadores).

## Compatibilidade

Canvas 2D e position: sticky: todos os navegadores atuais.

## Responsividade

O canvas tem tamanho interno fixo e escala pelo CSS (width: min(92vw, 720px)). No celular, use uma sequência com menos quadros e imagens menores.

## Acessibilidade

O canvas tem role="img" e aria-label descrevendo a cena. O movimento só acontece quando a pessoa rola (não é automático); com prefers-reduced-motion a suavização é desligada.

## Performance

Pré-desenhar os quadros custa memória (largura × altura × 4 bytes cada). 60 quadros de 640×400 ≈ 60 MB: em sites reais use 720p, WebP/AVIF e carregue a sequência sob demanda.

## Limitações

- Sequências reais pesam muitos megabytes; carregue só quando a seção estiver perto (IntersectionObserver) e mostre o primeiro quadro como pôster.
- Quadros demais não aumentam a fluidez além da taxa do scroll: 60 a 150 quadros costumam bastar.

## Referências

- [MDN — CanvasRenderingContext2D.drawImage()](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage)
- [MDN — position: sticky](https://developer.mozilla.org/en-US/docs/Web/CSS/position)
- [GSAP — ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)

## Código (valores padrão)

Arquivo único, igual ao baixado pelo botão “Baixar” na página do efeito:

```html
<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data:; font-src data:">
<title>Sequência de quadros no scroll · Kalixto Creative Lab</title>
<style>
/* Página da demonstração (rolável) */
* { box-sizing: border-box; }
html, body { margin: 0; }
body {
  background: #0b0a14;
  color: #f4f2ff;
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.5;
}
.intro, .fim {
  display: grid;
  place-items: center;
  min-height: 70vh;
  padding: 24px;
  color: #c9c3ea;
  text-align: center;
}

/* A seção alta é a "trilha" do vídeo; o canvas fica preso no meio dela */
.sequencia { height: 400vh; }
.fixo {
  position: sticky;
  top: 0;
  display: grid;
  place-items: center;
  height: 100vh;
}
.quadro {
  width: min(92vw, 720px);
  height: auto;
  border-radius: 16px;
  box-shadow: 0 30px 80px rgb(0 0 0 / 0.5);
}
</style>
</head>
<body>
<section class="intro"><p>Role para baixo ↓</p></section>

<section class="sequencia">
  <div class="fixo">
    <canvas class="quadro" width="640" height="400" role="img" aria-label="Grãos de café caindo e girando; no fim aparece a frase Tudo começa no grão"></canvas>
  </div>
</section>

<section class="fim"><p>Fim da página</p></section>
<script>
const QUADROS = 60;
const reduzir = matchMedia('(prefers-reduced-motion: reduce)');
const SUAVIZAR = reduzir.matches ? 1 : 0.2;
const secao = document.querySelector('.sequencia');
const canvas = document.querySelector('.quadro');
const ctx = canvas.getContext('2d');

function desenharQuadro(ctx, w, h, t) {
  const fundo = ctx.createRadialGradient(w * 0.5, h * 0.35, 10, w * 0.5, h * 0.5, w * 0.7);
  fundo.addColorStop(0, '#5a3a2a');
  fundo.addColorStop(1, '#120a08');
  ctx.fillStyle = fundo;
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 16; i++) {
    // "aleatório" fixo por grão: o mesmo quadro sempre sai igual
    const sx = Math.abs(Math.sin(i * 12.9898)) % 1;
    const sy = Math.abs(Math.sin(i * 78.233)) % 1;
    const tam = 10 + sx * 18;
    const x = sx * w + Math.sin(t * 6 + i) * 24;
    const y = -40 + ((sy + t * (0.8 + sx)) % 1) * (h + 80);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(i + t * (4 + sy * 6));
    const grao = ctx.createLinearGradient(-tam, -tam, tam, tam);
    grao.addColorStop(0, '#8a5a3c');
    grao.addColorStop(1, '#2a160d');
    ctx.fillStyle = grao;
    ctx.beginPath();
    ctx.ellipse(0, 0, tam, tam * 0.68, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgb(0 0 0 / 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-tam * 0.7, 0);
    ctx.quadraticCurveTo(0, tam * 0.25, tam * 0.7, 0);
    ctx.stroke();
    ctx.restore();
  }
  ctx.globalAlpha = Math.min(1, Math.max(0, (t - 0.35) * 3));
  ctx.fillStyle = '#f4ede6';
  ctx.font = '600 44px Georgia, serif';
  ctx.fillText('Tudo começa no grão', 32, h - 36);
  ctx.globalAlpha = 1;
}

// 1) Prepara todos os quadros antes (num site real: new Image() para cada arquivo)
const quadros = Array.from({ length: QUADROS }, (_, i) => {
  const c = document.createElement('canvas');
  c.width = canvas.width;
  c.height = canvas.height;
  desenharQuadro(c.getContext('2d'), c.width, c.height, i / (QUADROS - 1));
  return c;
});

// 2) Progresso da rolagem dentro da seção (0 → 1)
function progresso() {
  const r = secao.getBoundingClientRect();
  const total = secao.offsetHeight - innerHeight;
  return Math.min(1, Math.max(0, -r.top / total));
}

// 3) A cada quadro da tela, aproxima o quadro atual do alvo e desenha
let atual = 0;
let desenhado = -1;
function loop() {
  const alvo = progresso() * (QUADROS - 1);
  atual += (alvo - atual) * SUAVIZAR;
  const indice = Math.round(atual);
  if (indice !== desenhado) {
    ctx.drawImage(quadros[indice], 0, 0);
    desenhado = indice;
  }
  requestAnimationFrame(loop);
}
loop();
</script>
</body>
</html>
```

## Versão Angular (valores padrão)

Também em `src/app/efeitos-angular/image-sequence/` (compilada e testada com o app).

`image-sequence.ts`

```ts
import { Component, DestroyRef, ElementRef, afterNextRender, inject, viewChild } from '@angular/core';

@Component({
  selector: 'app-image-sequence',
  templateUrl: './image-sequence.html',
  styleUrl: './image-sequence.css',
})
export class ImageSequence {
  private readonly total = 60;
  private readonly secao = viewChild.required<ElementRef<HTMLElement>>('secao');
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const canvas = this.canvas().nativeElement;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const suavizar = reduzir ? 1 : 0.2;
      const quadros = Array.from({ length: this.total }, (_, i) => {
        const c = document.createElement('canvas');
        c.width = canvas.width;
        c.height = canvas.height;
        const cx = c.getContext('2d');
        if (cx) desenharQuadro(cx, c.width, c.height, i / (this.total - 1));
        return c;
      });
      let atual = 0;
      let desenhado = -1;
      let quadro = 0;
      const loop = () => {
        const secao = this.secao().nativeElement;
        const r = secao.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, -r.top / (secao.offsetHeight - window.innerHeight)));
        atual += (p * (this.total - 1) - atual) * suavizar;
        const indice = Math.round(atual);
        if (indice !== desenhado) {
          ctx.drawImage(quadros[indice], 0, 0);
          desenhado = indice;
        }
        quadro = requestAnimationFrame(loop);
      };
      loop();
      destroyRef.onDestroy(() => cancelAnimationFrame(quadro));
    });
  }
}

function desenharQuadro(ctx: CanvasRenderingContext2D, w: number, h: number, t: number): void {
  const fundo = ctx.createRadialGradient(w * 0.5, h * 0.35, 10, w * 0.5, h * 0.5, w * 0.7);
  fundo.addColorStop(0, '#5a3a2a');
  fundo.addColorStop(1, '#120a08');
  ctx.fillStyle = fundo;
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 16; i++) {
    // "aleatório" fixo por grão: o mesmo quadro sempre sai igual
    const sx = Math.abs(Math.sin(i * 12.9898)) % 1;
    const sy = Math.abs(Math.sin(i * 78.233)) % 1;
    const tam = 10 + sx * 18;
    const x = sx * w + Math.sin(t * 6 + i) * 24;
    const y = -40 + ((sy + t * (0.8 + sx)) % 1) * (h + 80);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(i + t * (4 + sy * 6));
    const grao = ctx.createLinearGradient(-tam, -tam, tam, tam);
    grao.addColorStop(0, '#8a5a3c');
    grao.addColorStop(1, '#2a160d');
    ctx.fillStyle = grao;
    ctx.beginPath();
    ctx.ellipse(0, 0, tam, tam * 0.68, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgb(0 0 0 / 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-tam * 0.7, 0);
    ctx.quadraticCurveTo(0, tam * 0.25, tam * 0.7, 0);
    ctx.stroke();
    ctx.restore();
  }
  ctx.globalAlpha = Math.min(1, Math.max(0, (t - 0.35) * 3));
  ctx.fillStyle = '#f4ede6';
  ctx.font = '600 44px Georgia, serif';
  ctx.fillText('Tudo começa no grão', 32, h - 36);
  ctx.globalAlpha = 1;
}
```

`image-sequence.html`

```html
<section #secao class="sequencia">
  <div class="fixo">
    <canvas
      #canvas
      class="quadro"
      width="640"
      height="400"
      role="img"
      aria-label="Grãos de café caindo e girando; no fim aparece a frase Tudo começa no grão"
    ></canvas>
  </div>
</section>
```

`image-sequence.css`

```css
:host { display: block; }

/* A seção alta é a "trilha" do vídeo; o canvas fica preso no meio dela */
.sequencia { height: 400vh; }
.fixo {
  position: sticky;
  top: 0;
  display: grid;
  place-items: center;
  height: 100vh;
}
.quadro {
  width: min(92vw, 720px);
  height: auto;
  border-radius: 16px;
  box-shadow: 0 30px 80px rgb(0 0 0 / 0.5);
}
```
