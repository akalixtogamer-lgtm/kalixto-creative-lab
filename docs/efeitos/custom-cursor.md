# Cursor personalizado (`custom-cursor`)

> Gerado a partir de `src/app/core/efeitos/kits/custom-cursor.kit.ts`. Não edite à mão: rode `npm run docs:efeitos`.

Um ponto acompanha o mouse na hora e um anel vem atrás com atraso; o anel cresce sobre links e botões.

| Campo | Valor |
|---|---|
| Nome técnico | Custom Cursor (dot + follower) |
| Categoria | 05 · Mouse e cursor › Cursores |
| Nível | Intermediário |
| Tecnologias | HTML, CSS, JavaScript |
| Dependências | nenhuma |
| Interação | Movimento do mouse, Hover |
| Status | validado em 2026-11-17 |
| Tags | cursor, mouse, follower, lerp, ponteiro, mix-blend-mode |

## Objetivo visual

Dar identidade à navegação e destacar o que é clicável.

## Aplicações

- Portfólios e sites autorais
- Galerias e vitrines
- Experiências interativas

## Como funciona

### Nível 1 — Iniciante

- São dois elementos que seguem o mouse: um ponto pequeno, que vai junto, e um anel, que vem atrás.
- O anel percorre só um pedaço do caminho a cada quadro, por isso parece ter "peso".
- Em cima de um link ou botão, o anel cresce para mostrar que dá para clicar.

### Nível 2 — Intermediário

- O ponto vai direto para a posição do mouse; o anel anda só uma fração (a suavidade) da distância a cada quadro — isso é interpolação linear (lerp).
- Um laço com requestAnimationFrame atualiza o anel até ele alcançar o ponteiro.
- Quando o ponteiro entra num link ou botão (pointerover com closest), o anel ganha a classe is-sobre e cresce.
- @media (pointer: fine) só ativa o cursor personalizado em mouse e trackpad; em telas de toque nada muda.

### Nível 3 — Avançado

- lerp (a + (b − a) × t) com t fixo por quadro gera uma aproximação exponencial: rápida no começo e cada vez mais lenta.
- O laço para quando a distância cai abaixo de 0,1 px: sem rAF infinito gastando bateria parado.
- pointer-events: none no cursor garante que ele nunca intercepte cliques; position: fixed + translate evita reflow.
- pointerover com delegação (closest) cobre elementos adicionados depois, sem um listener por link.
- No Angular, as posições são escritas direto no estilo (sem signals) porque mudam a cada evento; só os estados (ativo, sobre) passam por signals.

### Glossário do código

| Termo | O que faz |
|---|---|
| `pointer: fine` | Media query que identifica mouse e trackpad (ponteiro preciso). |
| `pointer-events: none` | O cursor desenhado nunca bloqueia cliques. |
| `SUAVIDADE` | Fração da distância que o anel anda por quadro (lerp). |
| `closest` | Procura o link ou botão mais próximo do elemento sob o mouse. |
| `mix-blend-mode` | Como o cursor se mistura com as cores de trás. |
| `requestAnimationFrame` | Atualiza o anel a cada quadro até alcançar o mouse. |

## Parâmetros

| Controle | Tipo | Padrão | Faixa / opções |
|---|---|---|---|
| suavidade do anel | range | 0.15 | 0.05–0.5 (passo 0.01) |
| tamanho do anel | range | 36px | 20–80px (passo 2) |
| cor | seleção | #22e3ff | Magenta, Roxo, Azul, Ciano |
| mistura com o fundo | seleção | normal | normal, difference (inverte) |
| cursor do sistema | seleção | mostrar | mostrar, esconder |

## Outra forma de fazer

cursor: url(icone.svg) 8 8, auto troca o cursor nativo por uma imagem, sem JavaScript — mas sem atraso nem animação.

## Compatibilidade

Pointer Events, requestAnimationFrame e @media (pointer) funcionam em todos os navegadores atuais.

## Responsividade

Só existe em dispositivos com ponteiro fino. Em celulares e tablets o elemento fica escondido.

## Acessibilidade

O cursor é decorativo (aria-hidden). Por padrão o cursor nativo continua visível; escondê-lo é opcional. Com prefers-reduced-motion o anel acompanha sem atraso. O foco do teclado tem contorno próprio e não depende do cursor.

## Performance

Um laço de requestAnimationFrame que para quando o anel alcança o ponteiro. Só transform é alterada.

## Limitações

- Esconder o cursor nativo pode confundir quem tem baixa visão; prefira manter.
- mix-blend-mode: difference muda a cor do cursor conforme o fundo, o que pode reduzir o contraste em fundos médios.

## Referências

- [MDN — Pointer events](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events)
- [MDN — requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame)
- [MDN — @media (pointer)](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/pointer)
- [MDN — cursor](https://developer.mozilla.org/en-US/docs/Web/CSS/cursor)

## Código (valores padrão)

Arquivo único, igual ao baixado pelo botão “Baixar” na página do efeito:

```html
<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data:; font-src data:">
<title>Cursor personalizado · Kalixto Creative Lab</title>
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

.vitrine { text-align: center; }
.vitrine a { color: #22e3ff; }
.vitrine button {
  margin-top: 12px;
  padding: 12px 24px;
  border: 1px solid #3a3456;
  border-radius: 12px;
  background: #1a1530;
  color: #fff;
  font: inherit;
}
.vitrine a:focus-visible,
.vitrine button:focus-visible { outline: 2px solid #22e3ff; outline-offset: 3px; }

/* O efeito: só para mouse e trackpad */
.cursor { display: none; }

@media (pointer: fine) {
  .cursor {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 100;
    pointer-events: none; /* nunca bloqueia cliques */
    mix-blend-mode: normal;
  }
  .cursor__ponto,
  .cursor__anel {
    position: absolute;
    top: 0;
    left: 0;
    border-radius: 50%;
    opacity: 0;
  }
  .cursor__ponto {
    width: 8px;
    height: 8px;
    margin: -4px 0 0 -4px;
    background: #22e3ff;
  }
  .cursor__anel {
    width: 36px;
    height: 36px;
    margin: -18px 0 0 -18px;
    border: 2px solid #22e3ff;
  }
  .cursor.is-ativo .cursor__ponto,
  .cursor.is-ativo .cursor__anel { opacity: 1; }
  .cursor.is-sobre .cursor__anel { scale: 1.8; background: #22e3ff22; }
  .cursor__ponto { transition: opacity 200ms ease; }
  .cursor__anel { transition: opacity 200ms ease, scale 250ms ease, background 250ms ease; }
}
</style>
</head>
<body>
<div class="cursor" aria-hidden="true">
  <span class="cursor__anel"></span>
  <span class="cursor__ponto"></span>
</div>

<main class="vitrine">
  <h1>Passe o mouse aqui</h1>
  <p>O anel cresce sobre <a href="#">links</a> e botões.</p>
  <button type="button">Um botão</button>
</main>
<script>
const cursor = document.querySelector('.cursor');
const ponto = cursor.querySelector('.cursor__ponto');
const anel = cursor.querySelector('.cursor__anel');
const SUAVIDADE = 0.15; // fração da distância que o anel anda por quadro
const reduzir = window.matchMedia('(prefers-reduced-motion: reduce)');

let mx = 0, my = 0; // posição do mouse
let ax = 0, ay = 0; // posição do anel
let quadro = 0;

function seguir() {
  const s = reduzir.matches ? 1 : SUAVIDADE; // sem atraso para quem prefere menos movimento
  ax += (mx - ax) * s; // lerp: anda uma fração do que falta
  ay += (my - ay) * s;
  anel.style.transform = `translate(${ax}px, ${ay}px)`;
  quadro = Math.hypot(mx - ax, my - ay) > 0.1 ? requestAnimationFrame(seguir) : 0;
}

window.addEventListener('pointermove', (e) => {
  if (e.pointerType !== 'mouse') return;
  mx = e.clientX;
  my = e.clientY;
  ponto.style.transform = `translate(${mx}px, ${my}px)`;
  cursor.classList.add('is-ativo');
  if (!quadro) quadro = requestAnimationFrame(seguir);
});

// cresce sobre elementos clicáveis
document.addEventListener('pointerover', (e) => {
  cursor.classList.toggle('is-sobre', !!e.target.closest('a, button'));
});

document.documentElement.addEventListener('pointerleave', () => cursor.classList.remove('is-ativo'));
</script>
</body>
</html>
```

## Versão Angular (valores padrão)

Também em `src/app/efeitos-angular/custom-cursor/` (compilada e testada com o app).

`custom-cursor.ts`

```ts
import { Component, ElementRef, signal, viewChild } from '@angular/core';

@Component({
  selector: 'app-custom-cursor',
  templateUrl: './custom-cursor.html',
  styleUrl: './custom-cursor.css',
  host: {
    '(window:pointermove)': 'mover($event)',
    '(document:pointerover)': 'sobre($event)',
    '(document:pointerout)': 'sair($event)',
  },
})
export class CustomCursor {
  private readonly suavidade = 0.15;
  private readonly reduzir = window.matchMedia('(prefers-reduced-motion: reduce)');
  private readonly ponto = viewChild.required<ElementRef<HTMLElement>>('ponto');
  private readonly anel = viewChild.required<ElementRef<HTMLElement>>('anel');
  private mx = 0;
  private my = 0;
  private ax = 0;
  private ay = 0;
  private quadro = 0;

  protected readonly ativo = signal(false);
  protected readonly sobreClicavel = signal(false);

  protected mover(e: PointerEvent): void {
    if (e.pointerType !== 'mouse') return;
    this.mx = e.clientX;
    this.my = e.clientY;
    // escrita direta no estilo: muda a cada evento, sem passar pela detecção de mudanças
    this.ponto().nativeElement.style.transform = `translate(${this.mx}px, ${this.my}px)`;
    this.ativo.set(true);
    if (!this.quadro) this.quadro = requestAnimationFrame(() => this.seguir());
  }

  protected sobre(e: PointerEvent): void {
    this.sobreClicavel.set(!!(e.target as Element).closest?.('a, button'));
  }

  /** relatedTarget nulo = o ponteiro saiu da janela. */
  protected sair(e: PointerEvent): void {
    if (!e.relatedTarget) this.ativo.set(false);
  }

  private seguir(): void {
    const s = this.reduzir.matches ? 1 : this.suavidade;
    this.ax += (this.mx - this.ax) * s;
    this.ay += (this.my - this.ay) * s;
    this.anel().nativeElement.style.transform = `translate(${this.ax}px, ${this.ay}px)`;
    this.quadro = Math.hypot(this.mx - this.ax, this.my - this.ay) > 0.1 ? requestAnimationFrame(() => this.seguir()) : 0;
  }
}
```

`custom-cursor.html`

```html
<div class="cursor" aria-hidden="true" [class.is-ativo]="ativo()" [class.is-sobre]="sobreClicavel()">
  <span #anel class="cursor__anel"></span>
  <span #ponto class="cursor__ponto"></span>
</div>

<main class="vitrine">
  <h1>Passe o mouse aqui</h1>
  <p>O anel cresce sobre <a href="#">links</a> e botões.</p>
  <button type="button">Um botão</button>
</main>
```

`custom-cursor.css`

```css
:host {
  display: grid;
  place-items: center;
  gap: 24px;
}

.vitrine { text-align: center; }
.vitrine a { color: #22e3ff; }
.vitrine button {
  margin-top: 12px;
  padding: 12px 24px;
  border: 1px solid #3a3456;
  border-radius: 12px;
  background: #1a1530;
  color: #fff;
  font: inherit;
}
.vitrine a:focus-visible,
.vitrine button:focus-visible { outline: 2px solid #22e3ff; outline-offset: 3px; }

/* O efeito: só para mouse e trackpad */
.cursor { display: none; }

@media (pointer: fine) {
  .cursor {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 100;
    pointer-events: none; /* nunca bloqueia cliques */
    mix-blend-mode: normal;
  }
  .cursor__ponto,
  .cursor__anel {
    position: absolute;
    top: 0;
    left: 0;
    border-radius: 50%;
    opacity: 0;
  }
  .cursor__ponto {
    width: 8px;
    height: 8px;
    margin: -4px 0 0 -4px;
    background: #22e3ff;
  }
  .cursor__anel {
    width: 36px;
    height: 36px;
    margin: -18px 0 0 -18px;
    border: 2px solid #22e3ff;
  }
  .cursor.is-ativo .cursor__ponto,
  .cursor.is-ativo .cursor__anel { opacity: 1; }
  .cursor.is-sobre .cursor__anel { scale: 1.8; background: #22e3ff22; }
  .cursor__ponto { transition: opacity 200ms ease; }
  .cursor__anel { transition: opacity 200ms ease, scale 250ms ease, background 250ms ease; }
}
```
