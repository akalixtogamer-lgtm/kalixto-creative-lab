# Distorção líquida na imagem (`image-distortion`)

> Gerado a partir de `src/app/core/efeitos/kits/image-distortion.kit.ts`. Não edite à mão: rode `npm run docs:efeitos`.

A imagem ondula como se estivesse debaixo d’água quando recebe o mouse ou o foco, usando filtros SVG.

| Campo | Valor |
|---|---|
| Nome técnico | Image Distortion (SVG displacement) |
| Categoria | 15 · Experimental e creative coding › Distorções |
| Nível | Avançado |
| Tecnologias | HTML, SVG, JavaScript |
| Dependências | nenhuma |
| Interação | Hover, Teclado, Automático |
| Status | validado em 2026-11-17 |
| Tags | distorção, displacement, feTurbulence, feDisplacementMap, svg, filtro, líquido, onda |

## Objetivo visual

Dar uma resposta orgânica e surpreendente a imagens e cards.

## Aplicações

- Galerias de projetos
- Hovers de capa
- Aberturas experimentais

## Como funciona

### Nível 1 — Iniciante

- O navegador cria um "mapa" de manchas aleatórias, como nuvens.
- Esse mapa empurra os pixels da imagem para os lados, deixando tudo ondulado como reflexo na água.
- O código aumenta e diminui a força desse empurrão quando o mouse entra e sai.

### Nível 2 — Intermediário

- feTurbulence gera um ruído (manchas aleatórias suaves). baseFrequency controla o tamanho das manchas.
- feDisplacementMap usa esse ruído para empurrar cada pixel da imagem; scale é a força do empurrão.
- O JavaScript anima scale (de 0 até a intensidade) e muda baseFrequency com o tempo, para a ondulação "andar".
- No modo hover, a distorção entra com mouseenter ou foco e sai com mouseleave ou blur; no modo contínuo, ela nunca para.

### Nível 3 — Avançado

- feDisplacementMap desloca cada pixel por (canal − 0,5) × scale; com xChannelSelector R e yChannelSelector G, o ruído controla os dois eixos.
- fractalNoise com numOctaves 2 dá ondas suaves; mais oitavas aumentam o detalhe e o custo.
- A região do filtro (x/y/width/height) precisa ser maior que a imagem, senão as bordas deslocadas são cortadas.
- Mudar baseFrequency força recalcular o ruído inteiro; para áreas grandes, prefira animar só scale ou usar WebGL.
- IDs de filtro são globais no documento: em componentes repetidos, gere um id único por instância para não colidir.

### Glossário do código

| Termo | O que faz |
|---|---|
| `feTurbulence` | Gera o ruído (manchas suaves) que guia a distorção. |
| `baseFrequency` | Tamanho das ondas: valores menores dão ondas maiores. |
| `feDisplacementMap` | Empurra os pixels da imagem usando o ruído. |
| `scale` | Força da distorção (0 = imagem normal). |
| `role="img"` | Faz o leitor de tela tratar o SVG como uma imagem com nome. |
| `pointerenter` | O mouse entrou na imagem: liga a distorção. |

## Parâmetros

| Controle | Tipo | Padrão | Faixa / opções |
|---|---|---|---|
| intensidade | range | 30 | 5–80 (passo 5) |
| tamanho das ondas (frequência) | range | 0.02 | 0.005–0.06 (passo 0.005) |
| velocidade | range | 1× | 0.2–3× (passo 0.1) |
| quando | seleção | hover | no hover e no foco, sempre |

## Outra forma de fazer

Em WebGL, um shader de distorção faz o mesmo com imagens reais e muito mais desempenho — veja a demo "Distorcer uma imagem" no laboratório WebGL & GLSL.

## Compatibilidade

Filtros SVG (feTurbulence, feDisplacementMap) funcionam em todos os navegadores atuais.

## Responsividade

O SVG usa viewBox, então a cena escala com a largura disponível.

## Acessibilidade

A cena tem role="img" e um nome acessível. O efeito também é acionado pelo foco do teclado. Com prefers-reduced-motion, a ondulação não se move: no hover a distorção aparece parada, e no modo contínuo ela fica desligada.

## Performance

Filtros SVG são calculados na CPU em muitos navegadores; manter a área pequena e animar só enquanto visível é importante. O laço para quando a distorção volta a zero.

## Limitações

- Áreas grandes com filtro animado podem pesar em celulares.
- O ruído é recalculado a cada mudança de baseFrequency.

## Referências

- [MDN — <feTurbulence>](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feTurbulence)
- [MDN — <feDisplacementMap>](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feDisplacementMap)
- [MDN — requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame)
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
<title>Distorção líquida na imagem · Kalixto Creative Lab</title>
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

.imagem {
  width: min(100%, 560px);
  border-radius: 16px;
  overflow: hidden;
  line-height: 0;
}
.imagem svg { width: 100%; height: auto; }
.imagem:focus-visible { outline: 2px solid #22e3ff; outline-offset: 4px; }
.dica { margin: 0; color: #c9c3ea; font-size: 0.9rem; }
</style>
</head>
<body>
<div class="imagem" tabindex="0">
  <svg viewBox="0 0 400 250" role="img" aria-label="Paisagem com montanhas, sol e o nome KALIXTO">
    <filter id="distorcer" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed="3" result="ruido" />
      <feDisplacementMap in="SourceGraphic" in2="ruido" scale="0" xChannelSelector="R" yChannelSelector="G" />
    </filter>
    <defs>
      <linearGradient id="ceu" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#1a1040" />
        <stop offset="0.7" stop-color="#7c3aed" />
        <stop offset="1" stop-color="#ff2bd6" />
      </linearGradient>
    </defs>
    <g filter="url(#distorcer)">
      <rect width="400" height="250" fill="url(#ceu)" />
      <circle cx="200" cy="150" r="42" fill="#ffd27a" />
      <polygon points="0,190 70,140 140,185 210,130 290,180 360,145 400,170 400,250 0,250" fill="#2d1a66" />
      <polygon points="0,220 90,190 180,225 270,195 400,225 400,250 0,250" fill="#0b0a14" />
      <text x="200" y="80" text-anchor="middle" font-size="34" font-weight="700" fill="#f4f2ff" font-family="system-ui, sans-serif">KALIXTO</text>
    </g>
  </svg>
</div>
<p class="dica">Passe o mouse ou use Tab para focar a imagem.</p>
<script>
const imagem = document.querySelector('.imagem');
const ruido = imagem.querySelector('feTurbulence');
const mapa = imagem.querySelector('feDisplacementMap');
const INTENSIDADE = 30;
const FREQUENCIA = 0.02;
const VELOCIDADE = 1;
const CONTINUO = false;
const reduzir = window.matchMedia('(prefers-reduced-motion: reduce)');

let alvo = 0;  // força desejada (0 = sem distorção)
let forca = 0; // força atual
let quadro = 0;

function desenhar(t) {
  forca += (alvo - forca) * 0.08; // aproxima suavemente do alvo
  const onda = Math.sin((t / 1000) * VELOCIDADE) * 0.25 + 1; // a frequência "respira"
  ruido.setAttribute('baseFrequency', String(FREQUENCIA * onda));
  mapa.setAttribute('scale', forca.toFixed(2));
  const parado = alvo === 0 && forca < 0.1;
  quadro = parado ? 0 : requestAnimationFrame(desenhar);
}

function ligar() {
  alvo = INTENSIDADE;
  if (reduzir.matches) { mapa.setAttribute('scale', String(alvo)); return; } // sem movimento
  if (!quadro) quadro = requestAnimationFrame(desenhar);
}

function desligar() {
  alvo = 0;
  if (reduzir.matches) { mapa.setAttribute('scale', '0'); return; }
  if (!quadro) quadro = requestAnimationFrame(desenhar);
}

if (CONTINUO) {
  if (!reduzir.matches) ligar();
} else {
  imagem.addEventListener('pointerenter', ligar);
  imagem.addEventListener('pointerleave', desligar);
  imagem.addEventListener('focus', ligar);
  imagem.addEventListener('blur', desligar);
}
</script>
</body>
</html>
```

## Versão Angular (valores padrão)

Também em `src/app/efeitos-angular/image-distortion/` (compilada e testada com o app).

`image-distortion.ts`

```ts
import { Component, DestroyRef, ElementRef, afterNextRender, inject, viewChild } from '@angular/core';

@Component({
  selector: 'app-image-distortion',
  templateUrl: './image-distortion.html',
  styleUrl: './image-distortion.css',
})
export class ImageDistortion {
  protected readonly frequencia = 0.02;
  protected readonly continuo = false;
  private readonly intensidade = 30;
  private readonly velocidade = 1;
  private readonly reduzir = window.matchMedia('(prefers-reduced-motion: reduce)');
  private readonly ruido = viewChild.required<ElementRef<SVGFETurbulenceElement>>('ruido');
  private readonly mapa = viewChild.required<ElementRef<SVGFEDisplacementMapElement>>('mapa');

  private alvo = 0;
  private forca = 0;
  private quadro = 0;

  constructor() {
    inject(DestroyRef).onDestroy(() => cancelAnimationFrame(this.quadro));
    afterNextRender(() => {
      if (this.continuo && !this.reduzir.matches) this.ligar();
    });
  }

  protected ligar(): void {
    this.alvo = this.intensidade;
    if (this.reduzir.matches) {
      this.mapa().nativeElement.setAttribute('scale', String(this.alvo));
      return;
    }
    if (!this.quadro) this.quadro = requestAnimationFrame((t) => this.desenhar(t));
  }

  protected desligar(): void {
    if (this.continuo) return;
    this.alvo = 0;
    if (this.reduzir.matches) {
      this.mapa().nativeElement.setAttribute('scale', '0');
      return;
    }
    if (!this.quadro) this.quadro = requestAnimationFrame((t) => this.desenhar(t));
  }

  private desenhar(t: number): void {
    this.forca += (this.alvo - this.forca) * 0.08;
    const onda = Math.sin((t / 1000) * this.velocidade) * 0.25 + 1;
    this.ruido().nativeElement.setAttribute('baseFrequency', String(this.frequencia * onda));
    this.mapa().nativeElement.setAttribute('scale', this.forca.toFixed(2));
    const parado = this.alvo === 0 && this.forca < 0.1;
    this.quadro = parado ? 0 : requestAnimationFrame((t2) => this.desenhar(t2));
  }
}
```

`image-distortion.html`

```html
<div
  class="imagem"
  tabindex="0"
  (pointerenter)="continuo || ligar()"
  (pointerleave)="desligar()"
  (focus)="continuo || ligar()"
  (blur)="desligar()"
>
  <svg viewBox="0 0 400 250" role="img" aria-label="Paisagem com montanhas, sol e o nome KALIXTO">
    <filter id="distorcer" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence #ruido type="fractalNoise" [attr.baseFrequency]="frequencia" numOctaves="2" seed="3" result="ruido" />
      <feDisplacementMap #mapa in="SourceGraphic" in2="ruido" scale="0" xChannelSelector="R" yChannelSelector="G" />
    </filter>
    <defs>
      <linearGradient id="ceu" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#1a1040" />
        <stop offset="0.7" stop-color="#7c3aed" />
        <stop offset="1" stop-color="#ff2bd6" />
      </linearGradient>
    </defs>
    <g filter="url(#distorcer)">
      <rect width="400" height="250" fill="url(#ceu)" />
      <circle cx="200" cy="150" r="42" fill="#ffd27a" />
      <polygon points="0,190 70,140 140,185 210,130 290,180 360,145 400,170 400,250 0,250" fill="#2d1a66" />
      <polygon points="0,220 90,190 180,225 270,195 400,225 400,250 0,250" fill="#0b0a14" />
      <text x="200" y="80" text-anchor="middle" font-size="34" font-weight="700" fill="#f4f2ff" font-family="system-ui, sans-serif">KALIXTO</text>
    </g>
  </svg>
</div>
<p class="dica">{{ continuo ? 'A distorção roda o tempo todo.' : 'Passe o mouse ou use Tab para focar a imagem.' }}</p>
```

`image-distortion.css`

```css
:host {
  display: grid;
  place-items: center;
  gap: 24px;
}

.imagem {
  width: min(100%, 560px);
  border-radius: 16px;
  overflow: hidden;
  line-height: 0;
}
.imagem svg { width: 100%; height: auto; }
.imagem:focus-visible { outline: 2px solid #22e3ff; outline-offset: 4px; }
.dica { margin: 0; color: #c9c3ea; font-size: 0.9rem; }
```
