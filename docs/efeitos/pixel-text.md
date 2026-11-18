# Título que se monta em pixels (`pixel-text`)

> Gerado a partir de `src/app/core/efeitos/kits/pixel-text.kit.ts`. Não edite à mão: rode `npm run docs:efeitos`.

O título surge bloco a bloco, como pixels acendendo num painel de LED, com uma "frente" colorida percorrendo as letras, até virar texto nítido.

| Campo | Valor |
|---|---|
| Nome técnico | Pixel Dissolve Text (canvas) |
| Categoria | 04 · Tipografia e texto › Texto que se transforma |
| Nível | Avançado |
| Tecnologias | HTML, CSS, JavaScript, Canvas |
| Dependências | nenhuma |
| Interação | Automático, Clique |
| Status | validado em 2026-11-17 |
| Tags | pixel, dissolve, glitch, led, canvas, getImageData, texto digital, referência em vídeo |

## Objetivo visual

Dar um ar digital, de dados e tecnologia, a títulos de seção — como nos sites de agrotech e ciência.

## Aplicações

- Títulos de seção em sites de tecnologia
- Telas de abertura
- Manchetes de campanhas

## Como funciona

### Nível 1 — Iniciante

- O título é dividido em quadradinhos, como os pixels de uma tela de LED.
- Os quadradinhos acendem aos poucos — da esquerda para a direita ou espalhados — e os mais novos piscam em verde-limão.
- No final, os quadradinhos dão lugar ao texto liso e nítido.

### Nível 2 — Intermediário

- O texto é desenhado primeiro numa tela escondida. getImageData lê os pixels dela, e a gente percorre uma grade (de PIXEL em PIXEL) guardando só as células que caíram em cima de alguma letra.
- Cada célula recebe uma "ordem" de 0 a 1: aleatória (dissolver) ou crescendo da esquerda para a direita (varrer).
- A cada quadro, desenhamos os quadradinhos cuja ordem já passou do progresso t. Os mais recentes (até 0,08 atrás) saem em lima: é a frente da onda.
- Quando t chega a 1, a tela escondida inteira é copiada: o texto termina nítido, com as curvas das letras.

### Nível 3 — Avançado

- Amostrar no centro de cada célula (x + PIXEL/2) é mais barato que somar o alfa da célula toda e já dá o contorno das letras.
- getImageData em canvas com texto não "contamina" a tela (sem imagens de outra origem), então a leitura é permitida.
- A ordem com acaso limitado (x/w × 0,8 + acaso × 0,2) cria uma frente de onda irregular, que parece mais "glitch" que uma linha reta.
- Para um glitch mais forte, desloque horizontalmente algumas células da frente (x ± PIXEL) por um ou dois quadros.

### Glossário do código

| Termo | O que faz |
|---|---|
| `getImageData` | Lê os pixels do texto desenhado na tela escondida. |
| `fillRect` | Desenha cada quadradinho (célula) do título. |
| `document.fonts.ready` | Espera a fonte carregar antes de amostrar o texto. |
| `drawImage` | No fim, copia o texto nítido para a tela visível. |

## Parâmetros

| Controle | Tipo | Padrão | Faixa / opções |
|---|---|---|---|
| tamanho do pixel | range | 8px | 4–20px (passo 2) |
| duração | range | 1600ms | 600–3000ms (passo 100) |
| como aparece | seleção | varrer | varrer (esquerda → direita), dissolver (aleatório) |

## Outra forma de fazer

Sem canvas: cada letra como <span> com clip-path de "degraus" animado (steps()). Em WebGL: um shader que pixeliza (floor(uv × n) / n) diminuindo n até o texto ficar nítido.

## Compatibilidade

Canvas 2D e getImageData: todos os navegadores atuais.

## Responsividade

O canvas tem tamanho interno fixo e escala pelo CSS; em telas retina multiplique o tamanho por devicePixelRatio.

## Acessibilidade

O texto real está num <h1> visualmente oculto; o canvas é aria-hidden. Com prefers-reduced-motion o texto aparece direto, já nítido.

## Performance

getImageData roda uma vez. Por quadro, só fillRect das células visíveis (centenas) durante a duração escolhida.

## Limitações

- A fonte do canvas precisa estar carregada antes da amostragem (document.fonts.ready) — senão a amostra sai com a fonte de reserva.
- Texto longo vira milhares de células: use em títulos curtos.

## Referências

- [MDN — getImageData()](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/getImageData)
- [MDN — fillText()](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fillText)
- [MDN — prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)

## Código (valores padrão)

Arquivo único, igual ao baixado pelo botão “Baixar” na página do efeito:

```html
<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data:; font-src data:">
<title>Título que se monta em pixels · Kalixto Creative Lab</title>
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

.painel {
  width: min(100%, 720px);
  height: auto;
  border-radius: 16px;
  background: radial-gradient(ellipse at 50% 120%, #1f6b4a, #0b1a12 70%);
}
.oculto { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
.repetir {
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
<h1 class="oculto">REVOLUÇÃO.</h1>
<canvas class="painel" width="720" height="200" aria-hidden="true"></canvas>
<button class="repetir" type="button">Repetir</button>
<script>
const PIXEL = 8;

// Desenha o texto numa tela escondida e guarda as células "cheias" da grade
function amostrar(w, h, texto) {
  const tela = document.createElement('canvas');
  tela.width = w;
  tela.height = h;
  const o = tela.getContext('2d');
  o.fillStyle = '#ffffff';
  o.font = '800 ' + Math.round(h * 0.42) + 'px system-ui, sans-serif';
  o.textAlign = 'center';
  o.textBaseline = 'middle';
  o.fillText(texto, w / 2, h / 2);
  const dados = o.getImageData(0, 0, w, h).data;
  const celulas = [];
  for (let y = 0; y < h; y += PIXEL) {
    for (let x = 0; x < w; x += PIXEL) {
      const i = (Math.min(h - 1, y + (PIXEL >> 1)) * w + Math.min(w - 1, x + (PIXEL >> 1))) * 4;
      if (dados[i + 3] > 100) {
        // ordem de aparição (0 → 1): da esquerda para a direita, com um pouco de acaso
        celulas.push({ x, y, ordem: (x / w) * 0.8 + Math.random() * 0.2 });
      }
    }
  }
  return { tela, celulas };
}

// Quadro t (0 → 1): células já "acesas" em branco, a frente da onda em lima
function desenhar(ctx, amostra, t) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  if (t >= 1) {
    ctx.drawImage(amostra.tela, 0, 0); // fim: o texto nítido
    return;
  }
  for (const c of amostra.celulas) {
    if (c.ordem > t) continue;
    ctx.fillStyle = t - c.ordem < 0.08 ? '#c6ff3d' : '#ffffff';
    ctx.fillRect(c.x, c.y, PIXEL - 1, PIXEL - 1);
  }
}

const DURACAO = 1600;
const canvas = document.querySelector('.painel');
const ctx = canvas.getContext('2d');
const texto = document.querySelector('.oculto').textContent;
const reduzir = matchMedia('(prefers-reduced-motion: reduce)');
let quadro = 0;

function montar() {
  cancelAnimationFrame(quadro);
  const amostra = amostrar(canvas.width, canvas.height, texto);
  if (reduzir.matches) return desenhar(ctx, amostra, 1);
  const inicio = performance.now();
  const passo = (agora) => {
    const t = Math.min(1, (agora - inicio) / DURACAO);
    desenhar(ctx, amostra, t);
    if (t < 1) quadro = requestAnimationFrame(passo);
  };
  quadro = requestAnimationFrame(passo);
}

// espera a fonte para a amostra sair com as letras certas
document.fonts.ready.then(montar);
document.querySelector('.repetir').addEventListener('click', montar);
</script>
</body>
</html>
```

## Versão Angular (valores padrão)

Também em `src/app/efeitos-angular/pixel-text/` (compilada e testada com o app).

`pixel-text.ts`

```ts
import { Component, DestroyRef, ElementRef, afterNextRender, inject, viewChild } from '@angular/core';

@Component({
  selector: 'app-pixel-text',
  templateUrl: './pixel-text.html',
  styleUrl: './pixel-text.css',
})
export class PixelText {
  protected readonly texto = 'REVOLUÇÃO.';
  private readonly duracao = 1600;
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private quadro = 0;

  constructor() {
    // espera a fonte (fora do navegador, document.fonts pode não existir)
    afterNextRender(() => (document.fonts?.ready ?? Promise.resolve()).then(() => this.montar()));
    inject(DestroyRef).onDestroy(() => cancelAnimationFrame(this.quadro));
  }

  protected montar(): void {
    const canvas = this.canvas().nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    cancelAnimationFrame(this.quadro);
    const amostra = amostrar(canvas.width, canvas.height, this.texto);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return desenhar(ctx, amostra, 1);
    const inicio = performance.now();
    const passo = (agora: number) => {
      const t = Math.min(1, (agora - inicio) / this.duracao);
      desenhar(ctx, amostra, t);
      if (t < 1) this.quadro = requestAnimationFrame(passo);
    };
    this.quadro = requestAnimationFrame(passo);
  }
}

interface Celula {
  x: number;
  y: number;
  ordem: number;
}

interface Amostra {
  tela: HTMLCanvasElement;
  celulas: Celula[];
}

const PIXEL = 8;

// Desenha o texto numa tela escondida e guarda as células "cheias" da grade
function amostrar(w: number, h: number, texto: string): Amostra {
  const tela = document.createElement('canvas');
  tela.width = w;
  tela.height = h;
  const o = tela.getContext('2d') as CanvasRenderingContext2D;
  o.fillStyle = '#ffffff';
  o.font = '800 ' + Math.round(h * 0.42) + 'px system-ui, sans-serif';
  o.textAlign = 'center';
  o.textBaseline = 'middle';
  o.fillText(texto, w / 2, h / 2);
  const dados = o.getImageData(0, 0, w, h).data;
  const celulas: Celula[] = [];
  for (let y = 0; y < h; y += PIXEL) {
    for (let x = 0; x < w; x += PIXEL) {
      const i = (Math.min(h - 1, y + (PIXEL >> 1)) * w + Math.min(w - 1, x + (PIXEL >> 1))) * 4;
      if (dados[i + 3] > 100) {
        // ordem de aparição (0 → 1): da esquerda para a direita, com um pouco de acaso
        celulas.push({ x, y, ordem: (x / w) * 0.8 + Math.random() * 0.2 });
      }
    }
  }
  return { tela, celulas };
}

// Quadro t (0 → 1): células já "acesas" em branco, a frente da onda em lima
function desenhar(ctx: CanvasRenderingContext2D, amostra: Amostra, t: number): void {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  if (t >= 1) {
    ctx.drawImage(amostra.tela, 0, 0); // fim: o texto nítido
    return;
  }
  for (const c of amostra.celulas) {
    if (c.ordem > t) continue;
    ctx.fillStyle = t - c.ordem < 0.08 ? '#c6ff3d' : '#ffffff';
    ctx.fillRect(c.x, c.y, PIXEL - 1, PIXEL - 1);
  }
}
```

`pixel-text.html`

```html
<h1 class="oculto">{{ texto }}</h1>
<canvas #canvas class="painel" width="720" height="200" aria-hidden="true"></canvas>
<button class="repetir" type="button" (click)="montar()">Repetir</button>
```

`pixel-text.css`

```css
:host {
  display: grid;
  place-items: center;
  gap: 24px;
}

.painel {
  width: min(100%, 720px);
  height: auto;
  border-radius: 16px;
  background: radial-gradient(ellipse at 50% 120%, #1f6b4a, #0b1a12 70%);
}
.oculto { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
.repetir {
  padding: 8px 16px;
  border: 1px solid #3a3456;
  border-radius: 999px;
  background: transparent;
  color: #c9c3ea;
  font: inherit;
  cursor: pointer;
}
```
