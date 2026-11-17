# Escrita neon à mão (`neon-handwriting`)

> Gerado a partir de `src/app/core/efeitos/kits/neon-handwriting.kit.ts`. Não edite à mão: rode `npm run docs:efeitos`.

Uma palavra em letra cursiva é "escrita" traço a traço e depois acende como um letreiro de neon, com uma leve oscilação de luz.

| Campo | Valor |
|---|---|
| Nome técnico | Neon Handwriting (SVG stroke + glow) |
| Categoria | 04 · Tipografia e texto › Texto desenhado e letreiros |
| Nível | Intermediário |
| Tecnologias | SVG, CSS, JavaScript |
| Dependências | nenhuma |
| Interação | Automático, Clique |
| Status | validado em 2026-11-17 |
| Tags | neon, glow, handwriting, manuscrito, stroke-dashoffset, letreiro, svg text, referência em vídeo |

## Objetivo visual

Dar ênfase emocional a uma palavra-chave, como a palavra manuscrita em destaque no meio de uma frase.

## Aplicações

- Palavra de destaque num título
- Assinaturas e logos manuscritos
- Letreiros de eventos e bares

## Como funciona

### Nível 1 — Iniciante

- A palavra começa invisível e vai sendo desenhada, como se uma caneta passasse pelas letras.
- Quando termina de desenhar, as letras se enchem de cor e ganham um brilho em volta, igual a um letreiro de neon.
- De vez em quando o brilho dá uma piscadinha fraca, como uma lâmpada de neon de verdade.

### Nível 2 — Intermediário

- O texto é um <text> de SVG com contorno (stroke). stroke-dasharray transforma o contorno em um traço gigante seguido de um vazio do mesmo tamanho.
- Começando com stroke-dashoffset igual ao tamanho do traço, nada aparece; animando até 0, o contorno é "desenhado" na tela.
- Quando a escrita termina, uma segunda animação acende o preenchimento (fill-opacity) e duas drop-shadow da mesma cor fazem o brilho do neon.
- A terceira animação, infinita, baixa a opacidade em instantes irregulares: é a oscilação típica de um letreiro de neon de verdade.

### Nível 3 — Avançado

- Três animações encadeadas só pelo atraso: escrever (0 → dur), acender (dur → dur+400ms) e oscilar (a partir de dur+400ms, infinita).
- Duas drop-shadow empilhadas (raio r e 2r) imitam o halo do neon melhor que uma só: a primeira dá o núcleo, a segunda o espalhamento.
- Num SVG, filter vale para o elemento inteiro; para animar só o brilho sem repintar o texto, duplique o <text> (um para o traço, outro com o filtro).
- O Repetir remove a classe .escrita, força um reflow (getBoundingClientRect, porque SVG não tem offsetWidth) e devolve a classe — todas as três animações recomeçam do zero.

### Glossário do código

| Termo | O que faz |
|---|---|
| `stroke-dasharray` | Transforma o contorno das letras em traço + vazio. |
| `stroke-dashoffset` | Desloca o traço; animar até 0 "desenha" a palavra. |
| `drop-shadow` | Sombra que segue a forma das letras — aqui, colorida, vira brilho. |
| `fill-opacity` | Transparência só do preenchimento das letras. |

## Parâmetros

| Controle | Tipo | Padrão | Faixa / opções |
|---|---|---|---|
| tempo da escrita | range | 2200ms | 800–4000ms (passo 100) |
| cor do neon | seleção | #ff2e3e | Vermelho, Magenta, Ciano, Lima |
| intensidade do brilho | range | 10px | 0–24px (passo 2) |

## Outra forma de fazer

Para uma escrita realmente "à mão", converta a palavra em <path> (no Figma ou Illustrator) e use pathLength="1" — o traço segue a ordem em que a letra é desenhada.

## Compatibilidade

stroke-dasharray em <text> e filter: drop-shadow() em SVG: todos os navegadores atuais. A fonte cursiva depende do sistema (Segoe Script no Windows, Snell Roundhand no macOS/iOS).

## Responsividade

O SVG usa viewBox, então a palavra escala com a largura do palco sem perder nitidez.

## Acessibilidade

O SVG tem role="img" e aria-label com a palavra. A oscilação é sutil (sem flashes acima de 3 por segundo) e some com prefers-reduced-motion, que mostra o letreiro já aceso.

## Performance

drop-shadow é recalculado a cada quadro da oscilação. Num letreiro pequeno é leve; em textos enormes, prefira oscilar só o brilho de uma camada separada.

## Limitações

- Num <text>, o traço é desenhado no contorno de cada letra ao mesmo tempo, não na ordem da escrita. Para ordem real, use path (veja a alternativa).
- O tamanho do traço (stroke-dasharray) precisa ser maior que o contorno da palavra; palavras mais longas pedem um valor maior.

## Referências

- [MDN — stroke-dashoffset](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dashoffset)
- [MDN — filter: drop-shadow()](https://developer.mozilla.org/en-US/docs/Web/CSS/filter-function/drop-shadow)
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
<title>Escrita neon à mão · Kalixto Creative Lab</title>
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

.neon { width: min(100%, 640px); overflow: visible; }

.neon .escrita {
  font: italic 700 120px 'Segoe Script', 'Snell Roundhand', 'Brush Script MT', cursive;
  fill: #ff2e3e;
  fill-opacity: 0;
  stroke: #ff2e3e;
  stroke-width: 2px;
  /* traço gigante + vazio do mesmo tamanho; o deslocamento esconde tudo */
  stroke-dasharray: 1400;
  stroke-dashoffset: 1400;
  filter: drop-shadow(0 0 10px #ff2e3e) drop-shadow(0 0 20px #ff2e3e);
  animation:
    escrever 2200ms cubic-bezier(0.45, 0, 0.25, 1) forwards,
    acender 400ms ease 2200ms forwards,
    oscilar 4s linear 2600ms infinite;
}
@keyframes escrever { to { stroke-dashoffset: 0; } }
@keyframes acender { to { fill-opacity: 1; } }
@keyframes oscilar {
  0%, 17%, 21%, 24%, 52%, 56%, 100% { opacity: 1; }
  19%, 23%, 54% { opacity: 0.6; }
}

.repetir {
  padding: 8px 16px;
  border: 1px solid #3a3456;
  border-radius: 999px;
  background: transparent;
  color: #c9c3ea;
  font: inherit;
  cursor: pointer;
}
.repetir:focus-visible { outline: 2px solid #22e3ff; outline-offset: 3px; }

@media (prefers-reduced-motion: reduce) {
  .neon .escrita { animation: none; stroke-dashoffset: 0; fill-opacity: 1; }
}
</style>
</head>
<body>
<svg class="neon" viewBox="0 0 640 220" role="img" aria-label="hand-off">
  <text class="escrita" x="50%" y="62%" text-anchor="middle">hand-off</text>
</svg>
<button class="repetir" type="button">Repetir</button>
<script>
// Repetir: tira a classe, força o navegador a recalcular e coloca de novo
const alvo = document.querySelector('.neon text');
document.querySelector('.repetir').addEventListener('click', () => {
  alvo.classList.remove('escrita');
  void alvo.getBoundingClientRect(); // elementos SVG não têm offsetWidth: isto força o reflow
  alvo.classList.add('escrita');
});
</script>
</body>
</html>
```

## Versão Angular (valores padrão)

Também em `src/app/efeitos-angular/neon-handwriting/` (compilada e testada com o app).

`neon-handwriting.ts`

```ts
import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-neon-handwriting',
  templateUrl: './neon-handwriting.html',
  styleUrl: './neon-handwriting.css',
})
export class NeonHandwriting {
  /** Muda a cada clique em Repetir; o @for recria o elemento animado. */
  protected readonly ciclo = signal(0);

  protected repetir(): void {
    this.ciclo.update((n) => n + 1);
  }
}
```

`neon-handwriting.html`

```html
@for (c of [ciclo()]; track c) {
  <svg class="neon" viewBox="0 0 640 220" role="img" aria-label="hand-off">
    <text class="escrita" x="50%" y="62%" text-anchor="middle">hand-off</text>
  </svg>
}
<button class="repetir" type="button" (click)="repetir()">Repetir</button>
```

`neon-handwriting.css`

```css
:host {
  display: grid;
  place-items: center;
  gap: 24px;
}

.neon { width: min(100%, 640px); overflow: visible; }

.neon .escrita {
  font: italic 700 120px 'Segoe Script', 'Snell Roundhand', 'Brush Script MT', cursive;
  fill: #ff2e3e;
  fill-opacity: 0;
  stroke: #ff2e3e;
  stroke-width: 2px;
  /* traço gigante + vazio do mesmo tamanho; o deslocamento esconde tudo */
  stroke-dasharray: 1400;
  stroke-dashoffset: 1400;
  filter: drop-shadow(0 0 10px #ff2e3e) drop-shadow(0 0 20px #ff2e3e);
  animation:
    escrever 2200ms cubic-bezier(0.45, 0, 0.25, 1) forwards,
    acender 400ms ease 2200ms forwards,
    oscilar 4s linear 2600ms infinite;
}
@keyframes escrever { to { stroke-dashoffset: 0; } }
@keyframes acender { to { fill-opacity: 1; } }
@keyframes oscilar {
  0%, 17%, 21%, 24%, 52%, 56%, 100% { opacity: 1; }
  19%, 23%, 54% { opacity: 0.6; }
}

.repetir {
  padding: 8px 16px;
  border: 1px solid #3a3456;
  border-radius: 999px;
  background: transparent;
  color: #c9c3ea;
  font: inherit;
  cursor: pointer;
}
.repetir:focus-visible { outline: 2px solid #22e3ff; outline-offset: 3px; }

@media (prefers-reduced-motion: reduce) {
  .neon .escrita { animation: none; stroke-dashoffset: 0; fill-opacity: 1; }
}
```
