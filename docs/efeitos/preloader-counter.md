# Tela de carregamento com contador (`preloader-counter`)

> Gerado a partir de `src/app/core/efeitos/kits/preloader-counter.kit.ts`. Não edite à mão: rode `npm run docs:efeitos`.

Um número gigante conta de 0 a 100 com uma barra fina; ao terminar, a tela de carregamento sai (sobe, fecha como cortina ou abre ao meio) e revela o hero.

| Campo | Valor |
|---|---|
| Nome técnico | Preloader com contador (0 → 100) |
| Categoria | 14 · Navegação e experiência de página › Abertura e carregamento |
| Nível | Intermediário |
| Tecnologias | HTML, CSS, JavaScript |
| Dependências | nenhuma |
| Interação | Automático, Clique |
| Status | validado em 2026-11-17 |
| Tags | preloader, loader, contador, counter, intro, carregamento, cortina, tendência 2026 |

## Objetivo visual

Criar expectativa na primeira visita e esconder o carregamento de imagens pesadas, como nos sites de agência premiados.

## Aplicações

- Portfólios e agências
- Sites com vídeo ou 3D pesado
- Lançamentos e eventos

## Como funciona

### Nível 1 — Iniciante

- Antes de mostrar o site, aparece uma tela colorida com um número grande contando de 0 a 100.
- Uma linha fininha embaixo vai enchendo junto com o número.
- Quando chega a 100, a tela sai do caminho e o título do site aparece.

### Nível 2 — Intermediário

- O contador não é um setInterval: a cada quadro calculamos o tempo decorrido ÷ duração, passamos por uma curva (ease) e arredondamos para 0–100.
- A barra usa o mesmo progresso em scale do eixo X (transform-origin à esquerda), então número e barra andam juntos.
- Ao chegar em 100, a classe is-pronto dispara a saída só com CSS: translate (subir), clip-path inset de baixo para cima (cortina) ou do centro para fora (abrir).
- O hero tem a sua própria transição de entrada, com um pequeno atraso, para "nascer" logo depois que a tela sai.

### Nível 3 — Avançado

- Contagem por tempo + função de easing: o número desacelera no fim, o que parece mais "natural" que uma contagem linear.
- font-variant-numeric: tabular-nums deixa todos os algarismos com a mesma largura — o número não treme enquanto conta.
- clip-path: inset() anima o recorte sem mover o conteúdo; translate move a tela inteira. São leituras diferentes de "sair".
- Para medir carregamento real: conte quantos recursos já resolveram (Promise.allSettled) e use esse valor como alvo do contador.

### Glossário do código

| Termo | O que faz |
|---|---|
| `tabular-nums` | Algarismos com largura igual: o número não "pula". |
| `scaleX(var(--p, 0))` | A barra enche junto com o progresso. |
| `role="status"` | Anuncia "Carregando" e "Pronto" ao leitor de tela. |
| `cubic-bezier(0.76, 0, 0.24, 1)` | Curva forte de entrada e saída para a tela sair com impacto. |

## Parâmetros

| Controle | Tipo | Padrão | Faixa / opções |
|---|---|---|---|
| tempo de contagem | range | 2000ms | 800–4000ms (passo 100) |
| saída da tela | seleção | subir | subir, cortina (fecha para cima), abrir ao meio |
| cor da tela | seleção | #c6ff3d | Lima, Papel, Vermelho |

## Outra forma de fazer

Num site real, ligue o progresso ao carregamento verdadeiro: Promise.all das imagens/fontes (document.fonts.ready, img.decode()) e use o contador só como mínimo de tempo.

## Compatibilidade

clip-path inset(), propriedades individuais e requestAnimationFrame: todos os navegadores atuais.

## Responsividade

O número usa clamp() com vw; a barra ocupa a largura do palco.

## Acessibilidade

O número é decorativo (aria-hidden); uma região role="status" anuncia "Carregando" e depois "Pronto". Com prefers-reduced-motion o contador é pulado e o conteúdo aparece direto. Evite loaders longos: mais de 2–3 s irrita.

## Performance

Um textContent e um transform por quadro durante a contagem; a saída é uma transição CSS.

## Limitações

- Um loader "falso" (sem medir carregamento real) só atrasa o site: use com moderação, de preferência só na primeira visita (sessionStorage).

## Referências

- [MDN — requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame)
- [MDN — clip-path](https://developer.mozilla.org/en-US/docs/Web/CSS/clip-path)
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
<title>Tela de carregamento com contador · Kalixto Creative Lab</title>
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

.site {
  position: relative;
  display: grid;
  place-items: center;
  width: min(100%, 640px);
  aspect-ratio: 16 / 10;
  border-radius: 20px;
  overflow: hidden;
  background: #16132a;
}
.hero-loader {
  margin: 0;
  font-size: clamp(1.8rem, 7vw, 3.4rem);
  letter-spacing: -0.03em;
  opacity: 0;
  translate: 0 30px;
  transition: opacity 700ms ease 300ms, translate 700ms cubic-bezier(0.22, 1, 0.36, 1) 300ms;
}
.site.is-pronto .hero-loader { opacity: 1; translate: 0 0; }

/* A tela de carregamento cobre tudo */
.loader {
  position: absolute;
  inset: 0;
  background: #c6ff3d;
  color: #0b0a14;
  clip-path: inset(0 0 0 0);
  transition: translate 900ms cubic-bezier(0.76, 0, 0.24, 1), clip-path 900ms cubic-bezier(0.76, 0, 0.24, 1);
}
.numero {
  position: absolute;
  left: 24px;
  bottom: 12px;
  font: 800 clamp(4rem, 22vw, 10rem) / 0.8 system-ui, sans-serif;
  letter-spacing: -0.06em;
  font-variant-numeric: tabular-nums;
}
.barra {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 4px;
  background: #0b0a14;
  transform: scaleX(var(--p, 0));
  transform-origin: left center;
}
/* Saída */
.loader.is-pronto { translate: 0 -100%; }
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
  .loader, .hero-loader { transition: none; }
}
</style>
</head>
<body>
<section class="site">
  <h1 class="hero-loader">Bem-vindo ao lab</h1>
  <div class="loader">
    <span class="numero" aria-hidden="true">0</span>
    <span class="barra" aria-hidden="true"></span>
  </div>
  <p class="status" role="status">Carregando</p>
</section>
<button class="repetir" type="button">Repetir</button>
<script>
const DURACAO = 2000;
const site = document.querySelector('.site');
const loader = site.querySelector('.loader');
const numero = site.querySelector('.numero');
const status = site.querySelector('.status');
const reduzir = matchMedia('(prefers-reduced-motion: reduce)');
const suave = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2); // ease-in-out
let quadro = 0;

function carregar() {
  cancelAnimationFrame(quadro);
  site.classList.remove('is-pronto');
  loader.classList.remove('is-pronto');
  status.textContent = 'Carregando';
  if (reduzir.matches) return terminar();
  const inicio = performance.now();
  const passo = (agora) => {
    const p = suave(Math.min(1, (agora - inicio) / DURACAO));
    numero.textContent = Math.round(p * 100);
    loader.style.setProperty('--p', p);
    if (p < 1) quadro = requestAnimationFrame(passo);
    else terminar();
  };
  quadro = requestAnimationFrame(passo);
}

function terminar() {
  numero.textContent = 100;
  site.classList.add('is-pronto');
  loader.classList.add('is-pronto');
  status.textContent = 'Pronto';
}

carregar();
document.querySelector('.repetir').addEventListener('click', carregar);
</script>
</body>
</html>
```

## Versão Angular (valores padrão)

Também em `src/app/efeitos-angular/preloader-counter/` (compilada e testada com o app).

`preloader-counter.ts`

```ts
import { Component, DestroyRef, afterNextRender, inject, signal } from '@angular/core';

@Component({
  selector: 'app-preloader-counter',
  templateUrl: './preloader-counter.html',
  styleUrl: './preloader-counter.css',
})
export class PreloaderCounter {
  private readonly duracao = 2000;
  private readonly reduzir = window.matchMedia('(prefers-reduced-motion: reduce)');
  private quadro = 0;

  protected readonly p = signal(0);
  protected readonly pronto = signal(false);

  constructor() {
    afterNextRender(() => this.carregar());
    inject(DestroyRef).onDestroy(() => cancelAnimationFrame(this.quadro));
  }

  protected carregar(): void {
    cancelAnimationFrame(this.quadro);
    this.pronto.set(false);
    if (this.reduzir.matches) return this.terminar();
    const suave = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
    const inicio = performance.now();
    const passo = (agora: number) => {
      const p = suave(Math.min(1, (agora - inicio) / this.duracao));
      this.p.set(p);
      if (p < 1) this.quadro = requestAnimationFrame(passo);
      else this.terminar();
    };
    this.quadro = requestAnimationFrame(passo);
  }

  private terminar(): void {
    this.p.set(1);
    this.pronto.set(true);
  }
}
```

`preloader-counter.html`

```html
<section class="site" [class.is-pronto]="pronto()">
  <h1 class="hero-loader">Bem-vindo ao lab</h1>
  <div class="loader" [class.is-pronto]="pronto()" [style.--p]="p()">
    <span class="numero" aria-hidden="true">{{ (p() * 100).toFixed(0) }}</span>
    <span class="barra" aria-hidden="true"></span>
  </div>
  <p class="status" role="status">{{ pronto() ? 'Pronto' : 'Carregando' }}</p>
</section>
<button class="repetir" type="button" (click)="carregar()">Repetir</button>
```

`preloader-counter.css`

```css
:host {
  display: grid;
  place-items: center;
  gap: 24px;
}

.site {
  position: relative;
  display: grid;
  place-items: center;
  width: min(100%, 640px);
  aspect-ratio: 16 / 10;
  border-radius: 20px;
  overflow: hidden;
  background: #16132a;
}
.hero-loader {
  margin: 0;
  font-size: clamp(1.8rem, 7vw, 3.4rem);
  letter-spacing: -0.03em;
  opacity: 0;
  translate: 0 30px;
  transition: opacity 700ms ease 300ms, translate 700ms cubic-bezier(0.22, 1, 0.36, 1) 300ms;
}
.site.is-pronto .hero-loader { opacity: 1; translate: 0 0; }

/* A tela de carregamento cobre tudo */
.loader {
  position: absolute;
  inset: 0;
  background: #c6ff3d;
  color: #0b0a14;
  clip-path: inset(0 0 0 0);
  transition: translate 900ms cubic-bezier(0.76, 0, 0.24, 1), clip-path 900ms cubic-bezier(0.76, 0, 0.24, 1);
}
.numero {
  position: absolute;
  left: 24px;
  bottom: 12px;
  font: 800 clamp(4rem, 22vw, 10rem) / 0.8 system-ui, sans-serif;
  letter-spacing: -0.06em;
  font-variant-numeric: tabular-nums;
}
.barra {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 4px;
  background: #0b0a14;
  transform: scaleX(var(--p, 0));
  transform-origin: left center;
}
/* Saída */
.loader.is-pronto { translate: 0 -100%; }
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
  .loader, .hero-loader { transition: none; }
}
```
