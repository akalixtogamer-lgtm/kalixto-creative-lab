# Texto com glitch RGB (`glitch-text`)

> Gerado a partir de `src/app/core/efeitos/kits/glitch-text.kit.ts`. Não edite à mão: rode `npm run docs:efeitos`.

O título "falha" como um sinal de TV: fatias horizontais se deslocam e a cor se separa em vermelho e ciano por instantes.

| Campo | Valor |
|---|---|
| Nome técnico | RGB Split Glitch Text |
| Categoria | 15 · Experimental e creative coding › Glitch e distorção |
| Nível | Intermediário |
| Tecnologias | HTML, CSS |
| Dependências | nenhuma |
| Interação | Automático, Hover, Teclado |
| Status | validado em 2026-11-17 |
| Tags | glitch, rgb split, chromatic aberration, falha, clip-path, pseudo-elemento, referência em vídeo |

## Objetivo visual

Dar impacto, tensão ou estética digital/retrô a um título curto — uma "virada" de narrativa.

## Aplicações

- Títulos de campanha e lançamento
- Sites de música, games e moda
- Páginas 404 e telas de erro

## Como funciona

### Nível 1 — Iniciante

- O título tem duas cópias escondidas, uma vermelha e uma ciano, bem em cima dele.
- De vez em quando, pedaços dessas cópias aparecem tortos para os lados, como uma TV com chiado.
- Logo depois tudo volta ao normal — por isso parece uma falha rápida.

### Nível 2 — Intermediário

- O texto é copiado duas vezes pelo CSS, nos pseudo-elementos ::before e ::after, lendo o atributo data-texto (content: attr(data-texto)).
- Cada cópia tem uma cor (vermelho e ciano) e fica exatamente sobre o texto original — invisível enquanto está parada.
- A animação, com steps(1), troca de uma vez entre "quadros": em cada um, clip-path: inset() mostra só uma fatia da cópia e translate a desloca alguns pixels. Isso é a "falha".
- Como a maior parte dos quadros mostra a fatia vazia (inset 100%), o glitch acontece em rajadas curtas.

### Nível 3 — Avançado

- content: attr(data-texto) evita repetir o texto no HTML; o Angular liga o atributo com [attr.data-texto].
- steps(1) troca os quadros de uma vez: sem interpolação, as fatias "pulam", que é a cara do glitch.
- Duas animações com durações diferentes (ou percentuais diferentes) desalinham as cópias e deixam a falha menos repetitiva.
- mix-blend-mode: screen nas cópias faz vermelho + ciano somarem branco onde se sobrepõem, como a separação de canais de uma tela real.

### Glossário do código

| Termo | O que faz |
|---|---|
| `attr(data-texto)` | O pseudo-elemento copia o texto do atributo data-texto. |
| `clip-path: inset(` | Mostra só uma fatia horizontal da cópia. |
| `steps(1)` | Troca os quadros da falha de uma vez, sem transição. |
| `mix-blend-mode: screen` | Soma as cores das cópias, como canais de uma tela. |

## Parâmetros

| Controle | Tipo | Padrão | Faixa / opções |
|---|---|---|---|
| deslocamento | range | 4px | 1–10px (passo 1) |
| quando falha | seleção | rajadas | em rajadas, sempre, no hover/foco |
| cores separadas | seleção | rgb | vermelho e ciano, rosa e azul, lima e magenta |

## Outra forma de fazer

Com SVG: feColorMatrix separando canais + feOffset; com WebGL: um shader que desloca os canais R, G e B em faixas aleatórias (muito usado em transições de imagem).

## Compatibilidade

clip-path inset(), attr() em content e animações: todos os navegadores atuais.

## Responsividade

O texto usa clamp(); o deslocamento é em px e continua sutil no celular.

## Acessibilidade

O leitor de tela lê só o h1 (os pseudo-elementos de attr() não duplicam o conteúdo na maioria dos leitores, e o h1 tem aria-label). O efeito não pisca a tela toda (WCAG 2.3.1), mas com prefers-reduced-motion ele é desligado.

## Performance

Só clip-path e translate nos pseudo-elementos; sem JavaScript.

## Limitações

- Funciona em textos de uma linha (white-space: nowrap); em várias linhas, as fatias cortam linhas diferentes de forma estranha.

## Referências

- [MDN — attr()](https://developer.mozilla.org/en-US/docs/Web/CSS/attr)
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
<title>Texto com glitch RGB · Kalixto Creative Lab</title>
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

.cartaz {
  display: grid;
  place-items: center;
  width: min(100%, 640px);
  aspect-ratio: 16 / 10;
  padding: 24px;
  border-radius: 20px;
  background: linear-gradient(160deg, #ff4d1a, #c22a0a);
}
.glitch {
  position: relative;
  margin: 0;
  color: #fff;
  font: 800 clamp(1.4rem, 6vw, 3.2rem) / 1 system-ui, sans-serif;
  letter-spacing: -0.03em;
  text-align: center;
  white-space: nowrap;
}
/* As duas cópias coloridas, exatamente sobre o texto */
.glitch::before,
.glitch::after {
  content: attr(data-texto);
  position: absolute;
  inset: 0;
  clip-path: inset(100% 0 0 0); /* escondidas */
}
.glitch::before { color: #ff1f4b; mix-blend-mode: screen; }
.glitch::after { color: #1fe0ff; mix-blend-mode: screen; }

/* Quadros da falha: cada um mostra uma fatia deslocada (a maioria fica vazia) */
@keyframes fatiar-a {
  0% { clip-path: inset(10% 0 70% 0); translate: -4px 0; }
  4% { clip-path: inset(55% 0 20% 0); translate: 4px 0; }
  8% { clip-path: inset(30% 0 50% 0); translate: -2px 0; }
  12%, 100% { clip-path: inset(100% 0 0 0); translate: 0 0; }
}
@keyframes fatiar-b {
  0% { clip-path: inset(60% 0 15% 0); translate: 4px 0; }
  5% { clip-path: inset(20% 0 65% 0); translate: -4px 0; }
  9% { clip-path: inset(75% 0 5% 0); translate: 2px 0; }
  14%, 100% { clip-path: inset(100% 0 0 0); translate: 0 0; }
}
/* em rajadas: a animação dura 3s, mas só "falha" em ~15% do tempo */
.glitch::before { animation: fatiar-a 3s steps(1) infinite; }
.glitch::after { animation: fatiar-b 3s steps(1) infinite; }

@media (prefers-reduced-motion: reduce) {
  .glitch::before, .glitch::after { animation: none !important; }
}
</style>
</head>
<body>
<section class="cartaz">
  <h1 class="glitch" aria-label="o céu mudou de dono" data-texto="o céu mudou de dono">o céu mudou de dono</h1>
</section>
<script>
// Sem JavaScript: o efeito é todo em CSS (pseudo-elementos + clip-path).
// Para trocar o texto, mude o conteúdo E o atributo data-texto juntos:
// titulo.textContent = titulo.dataset.texto = 'novo texto';
</script>
</body>
</html>
```

## Versão Angular (valores padrão)

Também em `src/app/efeitos-angular/glitch-text/` (compilada e testada com o app).

`glitch-text.ts`

```ts
import { Component } from '@angular/core';

/** glitch-text: efeito só de CSS — o texto vai no conteúdo e no data-texto. */
@Component({
  selector: 'app-glitch-text',
  templateUrl: './glitch-text.html',
  styleUrl: './glitch-text.css',
})
export class GlitchText {
  protected readonly texto = 'o céu mudou de dono';
}
```

`glitch-text.html`

```html
<section class="cartaz">
  <h1 class="glitch" [attr.aria-label]="texto" [attr.data-texto]="texto">{{ texto }}</h1>
</section>
```

`glitch-text.css`

```css
:host {
  display: grid;
  place-items: center;
  gap: 24px;
}

.cartaz {
  display: grid;
  place-items: center;
  width: min(100%, 640px);
  aspect-ratio: 16 / 10;
  padding: 24px;
  border-radius: 20px;
  background: linear-gradient(160deg, #ff4d1a, #c22a0a);
}
.glitch {
  position: relative;
  margin: 0;
  color: #fff;
  font: 800 clamp(1.4rem, 6vw, 3.2rem) / 1 system-ui, sans-serif;
  letter-spacing: -0.03em;
  text-align: center;
  white-space: nowrap;
}
/* As duas cópias coloridas, exatamente sobre o texto */
.glitch::before,
.glitch::after {
  content: attr(data-texto);
  position: absolute;
  inset: 0;
  clip-path: inset(100% 0 0 0); /* escondidas */
}
.glitch::before { color: #ff1f4b; mix-blend-mode: screen; }
.glitch::after { color: #1fe0ff; mix-blend-mode: screen; }

/* Quadros da falha: cada um mostra uma fatia deslocada (a maioria fica vazia) */
@keyframes fatiar-a {
  0% { clip-path: inset(10% 0 70% 0); translate: -4px 0; }
  4% { clip-path: inset(55% 0 20% 0); translate: 4px 0; }
  8% { clip-path: inset(30% 0 50% 0); translate: -2px 0; }
  12%, 100% { clip-path: inset(100% 0 0 0); translate: 0 0; }
}
@keyframes fatiar-b {
  0% { clip-path: inset(60% 0 15% 0); translate: 4px 0; }
  5% { clip-path: inset(20% 0 65% 0); translate: -4px 0; }
  9% { clip-path: inset(75% 0 5% 0); translate: 2px 0; }
  14%, 100% { clip-path: inset(100% 0 0 0); translate: 0 0; }
}
/* em rajadas: a animação dura 3s, mas só "falha" em ~15% do tempo */
.glitch::before { animation: fatiar-a 3s steps(1) infinite; }
.glitch::after { animation: fatiar-b 3s steps(1) infinite; }

@media (prefers-reduced-motion: reduce) {
  .glitch::before, .glitch::after { animation: none !important; }
}
```
