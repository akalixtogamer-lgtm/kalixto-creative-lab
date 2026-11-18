# Texto com eco (`echo-text`)

> Gerado a partir de `src/app/core/efeitos/kits/echo-text.kit.ts`. Não edite à mão: rode `npm run docs:efeitos`.

O título chega acompanhado de "ecos" — cópias empilhadas e cada vez mais transparentes — que deslizam e se juntam numa palavra só, sobre uma aura de luz.

| Campo | Valor |
|---|---|
| Nome técnico | Echo / Trail Text (cópias que se juntam) |
| Categoria | 04 · Tipografia e texto › Texto que se transforma |
| Nível | Iniciante |
| Tecnologias | HTML, CSS, JavaScript |
| Dependências | nenhuma |
| Interação | Automático, Hover, Clique |
| Status | validado em 2026-11-17 |
| Tags | echo, eco, trail, rastro, texto repetido, stagger, aura, referência em vídeo |

## Objetivo visual

Dar peso e ritmo a uma informação-chave (um preço, um título de oferta), como um rastro de movimento congelado.

## Aplicações

- Preço e oferta em proposta comercial
- Títulos de seção
- Abertura de vídeos e apresentações

## Como funciona

### Nível 1 — Iniciante

- O título e o preço aparecem com várias "sombras" de si mesmos, uma embaixo da outra.
- Essas sombras sobem e se juntam com o texto, até sobrar só uma palavra.
- Passando o mouse, as sombras aparecem de novo, como um eco.

### Nível 2 — Intermediário

- Atrás do texto real há várias cópias (aria-hidden), todas na mesma posição. Cada cópia sabe o seu número (--i).
- Elas começam deslocadas para baixo (i × distância) e transparentes em degraus; a animação traz todas para a posição do texto real, com atraso maior para as de trás.
- No hover o eco "solta" de novo e volta, numa transição — a palavra parece vibrar com o rastro.
- A aura atrás é um radial-gradient desfocado que pulsa devagar.

### Nível 3 — Avançado

- opacity: calc(0.7 − var(--i) × 0.08) dentro do @keyframes: cada cópia começa num degrau de transparência diferente com a mesma regra.
- A animação termina com opacity 0 e fill both: o eco some sozinho, e o texto real (z-index 1) fica nítido.
- No hover, animation: none + valores fixos faz a transição (translate) assumir — dá para combinar animação de entrada e transição de interação.
- cloneNode(true) + replaceWith é um jeito simples de reiniciar animações CSS sem reflow forçado.

### Glossário do código

| Termo | O que faz |
|---|---|
| `calc(var(--i) *` | Deslocamento e atraso de cada eco. |
| `grid-area: 1 / 1` | Empilha o texto real e os ecos no mesmo lugar. |
| `filter: blur(` | Desfoca a aura de luz atrás do texto. |
| `cloneNode` | Recria os ecos para reiniciar a animação. |

## Parâmetros

| Controle | Tipo | Padrão | Faixa / opções |
|---|---|---|---|
| número de ecos | range | 4 | 2–8 (passo 1) |
| distância entre ecos | range | 14px | 4–30px (passo 2) |
| duração | range | 900ms | 400–2000ms (passo 100) |

## Outra forma de fazer

Só com text-shadow (várias sombras deslocadas) dá um eco parado e barato; com GSAP, uma timeline com stagger nas cópias permite eco para cima, para os lados ou em leque.

## Compatibilidade

Animações CSS, variáveis em calc() e filter: blur(): todos os navegadores atuais.

## Responsividade

O texto usa clamp(); a distância do eco é em px e continua proporcional no celular.

## Acessibilidade

Só o texto real é lido; os ecos são aria-hidden. Com prefers-reduced-motion os ecos ficam escondidos e a aura não pulsa.

## Performance

Só transform e opacity nas cópias; a aura pulsa com scale (composição na GPU).

## Limitações

- Muitas cópias de um texto grande pesam na pintura; até 6–8 ecos é o ideal.

## Referências

- [MDN — animation](https://developer.mozilla.org/en-US/docs/Web/CSS/animation)
- [MDN — animation-delay](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-delay)
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
<title>Texto com eco · Kalixto Creative Lab</title>
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

.oferta {
  position: relative;
  display: grid;
  place-items: center;
  gap: 12px;
  width: min(100%, 640px);
  padding: 56px 24px;
  border-radius: 20px;
  overflow: hidden;
  background: #0d0806;
  text-align: center;
}
.aura {
  position: absolute;
  top: -10%;
  width: 70%;
  aspect-ratio: 2;
  border-radius: 50%;
  background: radial-gradient(ellipse, #ff6a3d, transparent 70%);
  filter: blur(30px);
  opacity: 0.55;
  animation: pulsar 4s ease-in-out infinite alternate;
}
@keyframes pulsar { to { scale: 1.15; opacity: 0.75; } }

/* Texto real + ecos na mesma célula */
.ecoar { position: relative; display: grid; margin: 0; }
.ecoar > span { grid-area: 1 / 1; }
.ecoar h2, h2.ecoar { font-size: clamp(1.8rem, 7vw, 3rem); font-weight: 600; }
.preco { font-size: clamp(2.8rem, 12vw, 5.5rem); font-weight: 800; letter-spacing: -0.04em; }
.real { position: relative; z-index: 1; }

/* Cada eco começa i × distância abaixo e mais transparente, e se junta ao texto */
.eco {
  color: #fff;
  opacity: 0;
  animation: juntar 900ms cubic-bezier(0.22, 1, 0.36, 1) calc(var(--i) * 60ms) both;
  transition: translate 500ms cubic-bezier(0.22, 1, 0.36, 1);
}
@keyframes juntar {
  from { translate: 0 calc(var(--i) * 14px); opacity: calc(0.7 - var(--i) * 0.08); }
  to { translate: 0 0; opacity: 0; }
}
/* hover: o eco "solta" de novo, parado */
.ecoar:hover .eco {
  animation: none;
  translate: 0 calc(var(--i) * 7px);
  opacity: calc(0.5 - var(--i) * 0.06);
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

@media (prefers-reduced-motion: reduce) {
  .eco { display: none; }
  .aura { animation: none; }
}
</style>
</head>
<body>
<section class="oferta">
  <div class="aura" aria-hidden="true"></div>
  <h2 class="ecoar"><span class="real">Site completo</span><span class="eco" aria-hidden="true" style="--i: 1">Site completo</span><span class="eco" aria-hidden="true" style="--i: 2">Site completo</span><span class="eco" aria-hidden="true" style="--i: 3">Site completo</span><span class="eco" aria-hidden="true" style="--i: 4">Site completo</span></h2>
  <p class="ecoar preco"><span class="real">R$ 3.000</span><span class="eco" aria-hidden="true" style="--i: 1">R$ 3.000</span><span class="eco" aria-hidden="true" style="--i: 2">R$ 3.000</span><span class="eco" aria-hidden="true" style="--i: 3">R$ 3.000</span><span class="eco" aria-hidden="true" style="--i: 4">R$ 3.000</span></p>
</section>
<button class="repetir" type="button">Repetir</button>
<script>
// Repetir: recria os ecos (copiar e recolocar reinicia as animações)
document.querySelector('.repetir').addEventListener('click', () => {
  document.querySelectorAll('.ecoar').forEach((bloco) => {
    const ecos = [...bloco.querySelectorAll('.eco')];
    ecos.forEach((eco) => eco.replaceWith(eco.cloneNode(true)));
  });
});
</script>
</body>
</html>
```

## Versão Angular (valores padrão)

Também em `src/app/efeitos-angular/echo-text/` (compilada e testada com o app).

`echo-text.ts`

```ts
import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-echo-text',
  templateUrl: './echo-text.html',
  styleUrl: './echo-text.css',
})
export class EchoText {
  protected readonly titulo = 'Site completo';
  protected readonly preco = 'R$ 3.000';
  /** Posição de cada eco (1, 2, 3…). */
  protected readonly ecos = Array.from({ length: 4 }, (_, i) => i + 1);
  /** Muda a cada Repetir: o @for recria os ecos e as animações recomeçam. */
  protected readonly ciclo = signal(0);

  protected repetir(): void {
    this.ciclo.update((n) => n + 1);
  }
}
```

`echo-text.html`

```html
<section class="oferta">
  <div class="aura" aria-hidden="true"></div>
  @for (c of [ciclo()]; track c) {
    <h2 class="ecoar">
      <span class="real">{{ titulo }}</span>
      @for (i of ecos; track i) {
        <span class="eco" aria-hidden="true" [style.--i]="i">{{ titulo }}</span>
      }
    </h2>
    <p class="ecoar preco">
      <span class="real">{{ preco }}</span>
      @for (i of ecos; track i) {
        <span class="eco" aria-hidden="true" [style.--i]="i">{{ preco }}</span>
      }
    </p>
  }
</section>
<button class="repetir" type="button" (click)="repetir()">Repetir</button>
```

`echo-text.css`

```css
:host {
  display: grid;
  place-items: center;
  gap: 24px;
}

.oferta {
  position: relative;
  display: grid;
  place-items: center;
  gap: 12px;
  width: min(100%, 640px);
  padding: 56px 24px;
  border-radius: 20px;
  overflow: hidden;
  background: #0d0806;
  text-align: center;
}
.aura {
  position: absolute;
  top: -10%;
  width: 70%;
  aspect-ratio: 2;
  border-radius: 50%;
  background: radial-gradient(ellipse, #ff6a3d, transparent 70%);
  filter: blur(30px);
  opacity: 0.55;
  animation: pulsar 4s ease-in-out infinite alternate;
}
@keyframes pulsar { to { scale: 1.15; opacity: 0.75; } }

/* Texto real + ecos na mesma célula */
.ecoar { position: relative; display: grid; margin: 0; }
.ecoar > span { grid-area: 1 / 1; }
.ecoar h2, h2.ecoar { font-size: clamp(1.8rem, 7vw, 3rem); font-weight: 600; }
.preco { font-size: clamp(2.8rem, 12vw, 5.5rem); font-weight: 800; letter-spacing: -0.04em; }
.real { position: relative; z-index: 1; }

/* Cada eco começa i × distância abaixo e mais transparente, e se junta ao texto */
.eco {
  color: #fff;
  opacity: 0;
  animation: juntar 900ms cubic-bezier(0.22, 1, 0.36, 1) calc(var(--i) * 60ms) both;
  transition: translate 500ms cubic-bezier(0.22, 1, 0.36, 1);
}
@keyframes juntar {
  from { translate: 0 calc(var(--i) * 14px); opacity: calc(0.7 - var(--i) * 0.08); }
  to { translate: 0 0; opacity: 0; }
}
/* hover: o eco "solta" de novo, parado */
.ecoar:hover .eco {
  animation: none;
  translate: 0 calc(var(--i) * 7px);
  opacity: calc(0.5 - var(--i) * 0.06);
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

@media (prefers-reduced-motion: reduce) {
  .eco { display: none; }
  .aura { animation: none; }
}
```
