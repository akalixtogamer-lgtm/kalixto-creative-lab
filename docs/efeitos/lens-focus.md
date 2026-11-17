# Lente de foco (`lens-focus`)

> Gerado a partir de `src/app/core/efeitos/kits/lens-focus.kit.ts`. Não edite à mão: rode `npm run docs:efeitos`.

A página fica desfocada e uma lente (ou um par de óculos) segue o ponteiro mostrando, dentro dela, o conteúdo nítido e levemente ampliado.

| Campo | Valor |
|---|---|
| Nome técnico | Lens Focus Reveal (blur + mask + zoom) |
| Categoria | 05 · Mouse e cursor › Máscaras guiadas pelo ponteiro |
| Nível | Avançado |
| Tecnologias | HTML, CSS, JavaScript |
| Dependências | nenhuma |
| Interação | Movimento do mouse, Toque, Clique, Teclado |
| Status | validado em 2026-11-17 |
| Tags | lente, lupa, óculos, blur, foco, mask-image, zoom, magnifier, referência em vídeo |

## Objetivo visual

Fazer o usuário "experimentar" o produto — enxergar com a lente — e transformar a navegação numa descoberta.

## Aplicações

- Óticas e produtos de visão
- Heros interativos com lupa
- Revelar detalhes de uma foto ou mapa

## Como funciona

### Nível 1 — Iniciante

- A cena tem duas cópias da mesma imagem: uma embaçada embaixo e uma nítida em cima.
- A cópia nítida só aparece dentro de um ou dois círculos que seguem o mouse — como se você olhasse pela lente dos óculos.
- Dentro da lente a imagem fica um pouquinho maior, igual a uma lupa.

### Nível 2 — Intermediário

- Existem duas cópias do mesmo conteúdo, uma em cima da outra. A de baixo tem filter: blur() — é a "visão sem óculos".
- A de cima é nítida, mas uma mask-image com radial-gradient só deixa aparecer um círculo em volta do ponteiro (dois círculos no modo óculos).
- Dentro da camada nítida, o conteúdo recebe scale() com transform-origin no próprio ponteiro: o ponto sob a lente fica parado e o resto cresce em volta dele, como numa lupa.
- O aro é só desenho: bordas e sombras que seguem o mesmo --x/--y. O botão "Tudo em foco" tira a máscara e mostra tudo nítido.

### Nível 3 — Avançado

- Duas radial-gradient na mesma mask-image somam as áreas visíveis (mask-composite: add é o padrão): assim saem as duas lentes dos óculos.
- transform-origin: var(--x) var(--y) no scale() é o truque da lupa — o ponto sob o ponteiro é o centro da ampliação, então ele não "foge" da lente.
- A máscara fica na .nitida e o scale no filho .zoom: se os dois estivessem no mesmo elemento, a máscara também cresceria junto com o zoom.
- O aro usa a propriedade individual translate (não transform), lendo as mesmas variáveis; no Angular, --x e --y vêm de signals e afterNextRender centraliza a lente só no navegador.

### Glossário do código

| Termo | O que faz |
|---|---|
| `filter: blur(` | Desfoca a camada de baixo (a visão sem lente). |
| `mask-image` | Só deixa aparecer a camada nítida dentro das lentes. |
| `transform-origin: var(--x) var(--y)` | Centro da ampliação = posição do ponteiro. |
| `touch-action: none` | O dedo move a lente em vez de rolar a página. |

## Parâmetros

| Controle | Tipo | Padrão | Faixa / opções |
|---|---|---|---|
| raio da lente | range | 85px | 50–160px (passo 5) |
| desfoque fora da lente | range | 8px | 2–16px (passo 1) |
| ampliação | range | 1.15× | 1–1.6× (passo 0.05) |
| formato | seleção | oculos | óculos (duas lentes), lupa (uma lente) |

## Outra forma de fazer

backdrop-filter numa lente que se move faz o oposto (desfoca o que está atrás dela). Para refração real, com distorção nas bordas, use um shader de lente em WebGL (Three.js + MeshTransmissionMaterial ou um fragment shader).

## Compatibilidade

mask-image sem prefixo: Chrome e Edge 120+, Firefox 53+, Safari 15.4+ (o CSS também traz -webkit-mask-image). filter: blur(): todos os navegadores atuais.

## Responsividade

A lente segue o dedo (touch-action: none só na cena). O tamanho da fonte usa clamp() e a cena mantém a proporção 16:10.

## Acessibilidade

Só a camada nítida é lida pelo leitor de tela (a desfocada é aria-hidden). O botão "Tudo em foco" é a alternativa a quem não usa ponteiro. Não há movimento automático.

## Performance

O blur é estático (desenhado uma vez). A cada movimento mudam duas variáveis CSS, uma vez por quadro (requestAnimationFrame): o navegador repinta só a máscara e o aro.

## Limitações

- O conteúdo existe em dobro no DOM: para páginas inteiras, prefira aplicar o efeito só no hero.
- A ampliação é de imagem plana: não há a distorção de borda de uma lente de vidro (veja a alternativa em WebGL).

## Referências

- [MDN — mask-image](https://developer.mozilla.org/en-US/docs/Web/CSS/mask-image)
- [MDN — filter: blur()](https://developer.mozilla.org/en-US/docs/Web/CSS/filter-function/blur)
- [MDN — Pointer events](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events)

## Código (valores padrão)

Arquivo único, igual ao baixado pelo botão “Baixar” na página do efeito:

```html
<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data:; font-src data:">
<title>Lente de foco · Kalixto Creative Lab</title>
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

.cena-lente {
  --x: 50%;
  --y: 50%;
  position: relative;
  width: min(100%, 640px);
  aspect-ratio: 16 / 10;
  border-radius: 20px;
  overflow: hidden;
  touch-action: none; /* o dedo move a lente em vez de rolar a página */
}
.camada { position: absolute; inset: 0; }
.conteudo {
  display: grid;
  place-content: center;
  height: 100%;
  padding: 24px;
  text-align: center;
  color: #fff;
  background:
    linear-gradient(180deg, transparent 55%, rgb(8 40 30 / 0.85)),
    radial-gradient(ellipse at 50% 120%, #1f6b4a 30%, transparent 60%),
    linear-gradient(180deg, #3aa0ff 0%, #9fd8ff 45%, #e8f4ff 60%, #2f8f6b 61%);
}
.conteudo h1 { margin: 0; font-size: clamp(2rem, 9vw, 4.4rem); line-height: 0.95; letter-spacing: -0.03em; }
.conteudo p { margin: 12px 0 0; font-weight: 600; }

/* Visão "sem óculos" */
.desfocada { filter: blur(8px); }

/* Visão "com óculos": só aparece dentro da(s) lente(s) */
.nitida {
  -webkit-mask-image: radial-gradient(circle at calc(var(--x) - 95px) var(--y), #000 85px, transparent 86px), radial-gradient(circle at calc(var(--x) + 95px) var(--y), #000 85px, transparent 86px);
  mask-image: radial-gradient(circle at calc(var(--x) - 95px) var(--y), #000 85px, transparent 86px), radial-gradient(circle at calc(var(--x) + 95px) var(--y), #000 85px, transparent 86px);
}
/* lupa: amplia em volta do ponteiro (o ponto sob a lente não se move) */
.zoom {
  transform: scale(1.15);
  transform-origin: var(--x) var(--y);
}

/* O aro (só desenho) segue o mesmo ponto */
.aro {
  position: absolute;
  left: 0;
  top: 0;
  translate: var(--x) var(--y);
  pointer-events: none;
  transition: opacity 300ms ease;
}
.aro::before, .aro::after {
  content: '';
  position: absolute;
  top: -85px;
  left: -180px;
  width: 170px;
  height: 170px;
  border: 3px solid rgb(255 255 255 / 0.8);
  border-radius: 50%;
  box-shadow: inset 0 0 18px rgb(255 255 255 / 0.35), 0 8px 28px rgb(0 0 0 / 0.35);
}
.aro::after { left: 10px; }

/* Botão: tudo nítido, sem lente */
.cena-lente.is-foco .nitida { -webkit-mask-image: none; mask-image: none; }
.cena-lente.is-foco .zoom { transform: none; }
.cena-lente.is-foco .aro { opacity: 0; }

.foco-total {
  padding: 10px 20px;
  border: 1px solid #3a3456;
  border-radius: 999px;
  background: transparent;
  color: #f4f2ff;
  font: inherit;
  cursor: pointer;
}
.foco-total:focus-visible { outline: 2px solid #22e3ff; outline-offset: 3px; }

@media (prefers-reduced-motion: reduce) {
  .aro { transition: none; }
}
</style>
</head>
<body>
<section class="cena-lente">
  <div class="camada desfocada" aria-hidden="true">
    <div class="conteudo">
      <h1>Tudo em foco</h1>
      <p>Uma distância só, nítido de borda a borda.</p>
    </div>
  </div>
  <div class="camada nitida">
    <div class="conteudo zoom">
      <h1>Tudo em foco</h1>
      <p>Uma distância só, nítido de borda a borda.</p>
    </div>
  </div>
  <div class="aro" aria-hidden="true"></div>
</section>
<button class="foco-total" type="button" aria-pressed="false">Tudo em foco</button>
<script>
const cena = document.querySelector('.cena-lente');
const botao = document.querySelector('.foco-total');
let quadro = 0;

function mirar(x, y) {
  cena.style.setProperty('--x', x + 'px');
  cena.style.setProperty('--y', y + 'px');
}

// começa no meio da cena (o aro precisa de pixels para se posicionar)
const r0 = cena.getBoundingClientRect();
mirar(r0.width / 2, r0.height / 2);

cena.addEventListener('pointermove', (e) => {
  cancelAnimationFrame(quadro);
  quadro = requestAnimationFrame(() => {
    const r = cena.getBoundingClientRect();
    mirar(e.clientX - r.left, e.clientY - r.top);
  });
});

// alternativa sem ponteiro: tudo nítido
botao.addEventListener('click', () => {
  const foco = cena.classList.toggle('is-foco');
  botao.setAttribute('aria-pressed', String(foco));
  botao.textContent = foco ? 'Voltar à lente' : 'Tudo em foco';
});
</script>
</body>
</html>
```

## Versão Angular (valores padrão)

Também em `src/app/efeitos-angular/lens-focus/` (compilada e testada com o app).

`lens-focus.ts`

```ts
import { Component, ElementRef, afterNextRender, signal, viewChild } from '@angular/core';

@Component({
  selector: 'app-lens-focus',
  templateUrl: './lens-focus.html',
  styleUrl: './lens-focus.css',
})
export class LensFocus {
  private readonly cena = viewChild.required<ElementRef<HTMLElement>>('cena');
  private quadro = 0;

  protected readonly x = signal('50%');
  protected readonly y = signal('50%');
  protected readonly foco = signal(false);

  constructor() {
    // começa no meio da cena (o aro precisa de pixels para se posicionar)
    afterNextRender(() => {
      const r = this.cena().nativeElement.getBoundingClientRect();
      this.mirar(r.width / 2, r.height / 2);
    });
  }

  protected mover(e: PointerEvent): void {
    cancelAnimationFrame(this.quadro);
    this.quadro = requestAnimationFrame(() => {
      const r = this.cena().nativeElement.getBoundingClientRect();
      this.mirar(e.clientX - r.left, e.clientY - r.top);
    });
  }

  private mirar(x: number, y: number): void {
    this.x.set(x + 'px');
    this.y.set(y + 'px');
  }
}
```

`lens-focus.html`

```html
<section
  #cena
  class="cena-lente"
  [class.is-foco]="foco()"
  [style.--x]="x()"
  [style.--y]="y()"
  (pointermove)="mover($event)"
>
  <div class="camada desfocada" aria-hidden="true">
    <div class="conteudo">
      <h1>Tudo em foco</h1>
      <p>Uma distância só, nítido de borda a borda.</p>
    </div>
  </div>
  <div class="camada nitida">
    <div class="conteudo zoom">
      <h1>Tudo em foco</h1>
      <p>Uma distância só, nítido de borda a borda.</p>
    </div>
  </div>
  <div class="aro" aria-hidden="true"></div>
</section>
<button class="foco-total" type="button" [attr.aria-pressed]="foco()" (click)="foco.set(!foco())">
  {{ foco() ? 'Voltar à lente' : 'Tudo em foco' }}
</button>
```

`lens-focus.css`

```css
:host {
  display: grid;
  place-items: center;
  gap: 24px;
}

.cena-lente {
  --x: 50%;
  --y: 50%;
  position: relative;
  width: min(100%, 640px);
  aspect-ratio: 16 / 10;
  border-radius: 20px;
  overflow: hidden;
  touch-action: none; /* o dedo move a lente em vez de rolar a página */
}
.camada { position: absolute; inset: 0; }
.conteudo {
  display: grid;
  place-content: center;
  height: 100%;
  padding: 24px;
  text-align: center;
  color: #fff;
  background:
    linear-gradient(180deg, transparent 55%, rgb(8 40 30 / 0.85)),
    radial-gradient(ellipse at 50% 120%, #1f6b4a 30%, transparent 60%),
    linear-gradient(180deg, #3aa0ff 0%, #9fd8ff 45%, #e8f4ff 60%, #2f8f6b 61%);
}
.conteudo h1 { margin: 0; font-size: clamp(2rem, 9vw, 4.4rem); line-height: 0.95; letter-spacing: -0.03em; }
.conteudo p { margin: 12px 0 0; font-weight: 600; }

/* Visão "sem óculos" */
.desfocada { filter: blur(8px); }

/* Visão "com óculos": só aparece dentro da(s) lente(s) */
.nitida {
  -webkit-mask-image: radial-gradient(circle at calc(var(--x) - 95px) var(--y), #000 85px, transparent 86px), radial-gradient(circle at calc(var(--x) + 95px) var(--y), #000 85px, transparent 86px);
  mask-image: radial-gradient(circle at calc(var(--x) - 95px) var(--y), #000 85px, transparent 86px), radial-gradient(circle at calc(var(--x) + 95px) var(--y), #000 85px, transparent 86px);
}
/* lupa: amplia em volta do ponteiro (o ponto sob a lente não se move) */
.zoom {
  transform: scale(1.15);
  transform-origin: var(--x) var(--y);
}

/* O aro (só desenho) segue o mesmo ponto */
.aro {
  position: absolute;
  left: 0;
  top: 0;
  translate: var(--x) var(--y);
  pointer-events: none;
  transition: opacity 300ms ease;
}
.aro::before, .aro::after {
  content: '';
  position: absolute;
  top: -85px;
  left: -180px;
  width: 170px;
  height: 170px;
  border: 3px solid rgb(255 255 255 / 0.8);
  border-radius: 50%;
  box-shadow: inset 0 0 18px rgb(255 255 255 / 0.35), 0 8px 28px rgb(0 0 0 / 0.35);
}
.aro::after { left: 10px; }

/* Botão: tudo nítido, sem lente */
.cena-lente.is-foco .nitida { -webkit-mask-image: none; mask-image: none; }
.cena-lente.is-foco .zoom { transform: none; }
.cena-lente.is-foco .aro { opacity: 0; }

.foco-total {
  padding: 10px 20px;
  border: 1px solid #3a3456;
  border-radius: 999px;
  background: transparent;
  color: #f4f2ff;
  font: inherit;
  cursor: pointer;
}
.foco-total:focus-visible { outline: 2px solid #22e3ff; outline-offset: 3px; }

@media (prefers-reduced-motion: reduce) {
  .aro { transition: none; }
}
```
