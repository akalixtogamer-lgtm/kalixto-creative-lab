# Bolha de vidro que troca a fonte (`liquid-glass-lens`)

> Gerado a partir de `src/app/core/efeitos/kits/liquid-glass-lens.kit.ts`. Não edite à mão: rode `npm run docs:efeitos`.

Uma bolha de vidro líquido segue o ponteiro sobre um título; dentro dela, as letras aparecem em outra fonte (itálico com serifa, contorno ou ultranegrito), levemente ampliadas.

| Campo | Valor |
|---|---|
| Nome técnico | Liquid Glass Lens (troca de tipografia) |
| Categoria | 05 · Mouse e cursor › Máscaras guiadas pelo ponteiro |
| Nível | Avançado |
| Tecnologias | HTML, CSS, JavaScript |
| Dependências | nenhuma |
| Interação | Movimento do mouse, Toque |
| Status | validado em 2026-11-17 |
| Tags | liquid glass, vidro líquido, bolha, lente, tipografia, mask-image, backdrop-filter, referência em vídeo |

## Objetivo visual

Dar um toque de "vidro líquido" (a estética de 2025–2026) e brincar com a identidade tipográfica de um nome ou marca.

## Aplicações

- Hero de proposta comercial ou portfólio
- Nome de marca em destaque
- Páginas de apresentação pessoal

## Como funciona

### Nível 1 — Iniciante

- O nome aparece escrito duas vezes, uma em cima da outra, com fontes diferentes.
- A de cima só aparece dentro de uma bolha redonda que segue o mouse.
- A bolha tem brilhos e borda clara, para parecer uma gota de vidro passando sobre as letras.

### Nível 2 — Intermediário

- O título existe duas vezes, no mesmo lugar: a versão normal embaixo e a versão "alternativa" (outra fonte) em cima.
- As duas têm máscaras opostas na posição do ponteiro: a alternativa só aparece dentro do círculo, e a normal só fora dele — assim as letras nunca se sobrepõem.
- A bolha é só desenho: borda clara, brilhos com radial-gradient, sombra interna e backdrop-filter, que realça a cor do que está atrás — é isso que dá o aspecto de vidro.
- A versão alternativa recebe scale() com transform-origin no ponteiro, como a lente de aumento de uma gota d’água.

### Nível 3 — Avançado

- A máscara é medida a partir da caixa do próprio elemento: por isso os títulos ocupam o palco inteiro (place-self: stretch) — senão o círculo ficaria deslocado em relação ao ponteiro.
- mask-image com "#000 98%, transparent" dá uma borda quase dura, mas com 2% de suavização, evitando serrilhado.
- backdrop-filter: saturate() + brightness() imita o realce de cor do vidro; blur() deixaria o fundo leitoso.
- No Angular, --x/--y são signals ligados com [style.--x]; afterNextRender centraliza a bolha só no navegador.

### Glossário do código

| Termo | O que faz |
|---|---|
| `mask-image` | Mostra o título alternativo só dentro do círculo. |
| `backdrop-filter` | Realça o que está atrás da bolha, como vidro. |
| `place-self: stretch` | Cada título ocupa o palco inteiro: a máscara usa as mesmas coordenadas do ponteiro. |
| `transform-origin: var(--x) var(--y)` | A ampliação parte do centro da bolha. |

## Parâmetros

| Controle | Tipo | Padrão | Faixa / opções |
|---|---|---|---|
| raio da bolha | range | 85px | 50–140px (passo 5) |
| fonte dentro da bolha | seleção | serifa | itálico com serifa, só contorno, ultranegrito |
| aumento da gota | range | 1.08× | 1–1.3× (passo 0.02) |

## Outra forma de fazer

Para refração de verdade (as bordas "entortando" o fundo), use um filtro SVG feDisplacementMap no backdrop-filter (só Chromium) ou um shader de vidro em WebGL.

## Compatibilidade

mask-image: Chrome/Edge 120+, Firefox 53+, Safari 15.4+ (com -webkit-mask-image). backdrop-filter: todos os navegadores atuais.

## Responsividade

A bolha segue o dedo (touch-action: none só no palco). O título usa clamp() e quebra em telas estreitas.

## Acessibilidade

Só o título normal é lido (a cópia é aria-hidden). Não há movimento automático. Com prefers-reduced-motion, a bolha anda sem transição de entrada.

## Performance

Duas variáveis CSS por quadro (requestAnimationFrame). backdrop-filter numa área pequena é leve; evite bolhas enormes.

## Limitações

- As duas fontes têm larguras diferentes: as letras de dentro não coincidem exatamente com as de fora (faz parte do charme, como na referência).

## Referências

- [MDN — mask-image](https://developer.mozilla.org/en-US/docs/Web/CSS/mask-image)
- [MDN — backdrop-filter](https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter)
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
<title>Bolha de vidro que troca a fonte · Kalixto Creative Lab</title>
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

.vidro-palco {
  --x: 50%;
  --y: 50%;
  position: relative;
  display: grid;
  place-items: center;
  width: min(100%, 680px);
  aspect-ratio: 16 / 10;
  border-radius: 20px;
  overflow: hidden;
  touch-action: none; /* o dedo move a bolha em vez de rolar a página */
  background:
    radial-gradient(ellipse 120% 60% at 50% 120%, #1d4ed8 45%, #60a5fa 55%, transparent 56%),
    linear-gradient(180deg, #ff7a1a, #f05a0a);
}
/* As duas versões do título ocupam o palco inteiro, uma sobre a outra
   (assim --x/--y valem igual para o palco e para as máscaras) */
.nome {
  grid-area: 1 / 1;
  place-self: stretch;
  display: grid;
  place-items: center;
  margin: 0;
  color: #fff;
  font: 700 clamp(2.4rem, 10vw, 5rem) / 1 system-ui, sans-serif;
  letter-spacing: -0.04em;
  white-space: nowrap;
}
/* A versão normal some DENTRO do círculo (para não aparecer atrás da outra) */
.nome:not(.nome--alt) {
  -webkit-mask-image: radial-gradient(circle 85px at var(--x) var(--y), transparent 98%, #000);
  mask-image: radial-gradient(circle 85px at var(--x) var(--y), transparent 98%, #000);
}
/* A versão alternativa só aparece dentro do círculo */
.nome--alt {
  font-family: Georgia, 'Times New Roman', serif;
  font-style: italic;
  font-weight: 400;
  transform: scale(1.08);
  transform-origin: var(--x) var(--y);
  -webkit-mask-image: radial-gradient(circle 85px at var(--x) var(--y), #000 98%, transparent);
  mask-image: radial-gradient(circle 85px at var(--x) var(--y), #000 98%, transparent);
}

/* A bolha de vidro: só desenho, segue o mesmo ponto */
.bolha {
  position: absolute;
  left: 0;
  top: 0;
  width: 170px;
  height: 170px;
  margin: -85px 0 0 -85px;
  translate: var(--x) var(--y);
  border: 1.5px solid rgb(255 255 255 / 0.55);
  border-radius: 50%;
  background:
    radial-gradient(circle at 30% 25%, rgb(255 255 255 / 0.55), transparent 22%),
    radial-gradient(circle at 70% 80%, rgb(255 255 255 / 0.18), transparent 35%);
  box-shadow: inset 0 -10px 30px rgb(255 255 255 / 0.18), inset 0 8px 20px rgb(0 0 0 / 0.12), 0 12px 40px rgb(0 0 0 / 0.25);
  backdrop-filter: saturate(1.6) brightness(1.08);
  pointer-events: none;
  transition: opacity 300ms ease;
}

@media (prefers-reduced-motion: reduce) {
  .bolha { transition: none; }
}
</style>
</head>
<body>
<section class="vidro-palco">
  <h1 class="nome">Kalixto Lab</h1>
  <h1 class="nome nome--alt" aria-hidden="true">Kalixto Lab</h1>
  <div class="bolha" aria-hidden="true"></div>
</section>
<script>
const palco = document.querySelector('.vidro-palco');
let quadro = 0;

function mirar(x, y) {
  palco.style.setProperty('--x', x + 'px');
  palco.style.setProperty('--y', y + 'px');
}

// começa no meio (a bolha precisa de pixels para se posicionar)
const r0 = palco.getBoundingClientRect();
mirar(r0.width / 2, r0.height / 2);

palco.addEventListener('pointermove', (e) => {
  cancelAnimationFrame(quadro);
  quadro = requestAnimationFrame(() => {
    const r = palco.getBoundingClientRect();
    mirar(e.clientX - r.left, e.clientY - r.top);
  });
});
</script>
</body>
</html>
```

## Versão Angular (valores padrão)

Também em `src/app/efeitos-angular/liquid-glass-lens/` (compilada e testada com o app).

`liquid-glass-lens.ts`

```ts
import { Component, ElementRef, afterNextRender, signal, viewChild } from '@angular/core';

@Component({
  selector: 'app-liquid-glass-lens',
  templateUrl: './liquid-glass-lens.html',
  styleUrl: './liquid-glass-lens.css',
})
export class LiquidGlassLens {
  protected readonly nome = 'Kalixto Lab';
  private readonly palco = viewChild.required<ElementRef<HTMLElement>>('palco');
  private quadro = 0;

  protected readonly x = signal('50%');
  protected readonly y = signal('50%');

  constructor() {
    afterNextRender(() => {
      const r = this.palco().nativeElement.getBoundingClientRect();
      this.mirar(r.width / 2, r.height / 2);
    });
  }

  protected mover(e: PointerEvent): void {
    cancelAnimationFrame(this.quadro);
    this.quadro = requestAnimationFrame(() => {
      const r = this.palco().nativeElement.getBoundingClientRect();
      this.mirar(e.clientX - r.left, e.clientY - r.top);
    });
  }

  private mirar(x: number, y: number): void {
    this.x.set(x + 'px');
    this.y.set(y + 'px');
  }
}
```

`liquid-glass-lens.html`

```html
<section #palco class="vidro-palco" [style.--x]="x()" [style.--y]="y()" (pointermove)="mover($event)">
  <h1 class="nome">{{ nome }}</h1>
  <h1 class="nome nome--alt" aria-hidden="true">{{ nome }}</h1>
  <div class="bolha" aria-hidden="true"></div>
</section>
```

`liquid-glass-lens.css`

```css
:host {
  display: grid;
  place-items: center;
  gap: 24px;
}

.vidro-palco {
  --x: 50%;
  --y: 50%;
  position: relative;
  display: grid;
  place-items: center;
  width: min(100%, 680px);
  aspect-ratio: 16 / 10;
  border-radius: 20px;
  overflow: hidden;
  touch-action: none; /* o dedo move a bolha em vez de rolar a página */
  background:
    radial-gradient(ellipse 120% 60% at 50% 120%, #1d4ed8 45%, #60a5fa 55%, transparent 56%),
    linear-gradient(180deg, #ff7a1a, #f05a0a);
}
/* As duas versões do título ocupam o palco inteiro, uma sobre a outra
   (assim --x/--y valem igual para o palco e para as máscaras) */
.nome {
  grid-area: 1 / 1;
  place-self: stretch;
  display: grid;
  place-items: center;
  margin: 0;
  color: #fff;
  font: 700 clamp(2.4rem, 10vw, 5rem) / 1 system-ui, sans-serif;
  letter-spacing: -0.04em;
  white-space: nowrap;
}
/* A versão normal some DENTRO do círculo (para não aparecer atrás da outra) */
.nome:not(.nome--alt) {
  -webkit-mask-image: radial-gradient(circle 85px at var(--x) var(--y), transparent 98%, #000);
  mask-image: radial-gradient(circle 85px at var(--x) var(--y), transparent 98%, #000);
}
/* A versão alternativa só aparece dentro do círculo */
.nome--alt {
  font-family: Georgia, 'Times New Roman', serif;
  font-style: italic;
  font-weight: 400;
  transform: scale(1.08);
  transform-origin: var(--x) var(--y);
  -webkit-mask-image: radial-gradient(circle 85px at var(--x) var(--y), #000 98%, transparent);
  mask-image: radial-gradient(circle 85px at var(--x) var(--y), #000 98%, transparent);
}

/* A bolha de vidro: só desenho, segue o mesmo ponto */
.bolha {
  position: absolute;
  left: 0;
  top: 0;
  width: 170px;
  height: 170px;
  margin: -85px 0 0 -85px;
  translate: var(--x) var(--y);
  border: 1.5px solid rgb(255 255 255 / 0.55);
  border-radius: 50%;
  background:
    radial-gradient(circle at 30% 25%, rgb(255 255 255 / 0.55), transparent 22%),
    radial-gradient(circle at 70% 80%, rgb(255 255 255 / 0.18), transparent 35%);
  box-shadow: inset 0 -10px 30px rgb(255 255 255 / 0.18), inset 0 8px 20px rgb(0 0 0 / 0.12), 0 12px 40px rgb(0 0 0 / 0.25);
  backdrop-filter: saturate(1.6) brightness(1.08);
  pointer-events: none;
  transition: opacity 300ms ease;
}

@media (prefers-reduced-motion: reduce) {
  .bolha { transition: none; }
}
```
