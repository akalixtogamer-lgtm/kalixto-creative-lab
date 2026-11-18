# Halo de anéis que pulsam (`ripple-halo`)

> Gerado a partir de `src/app/core/efeitos/kits/ripple-halo.kit.ts`. Não edite à mão: rode `npm run docs:efeitos`.

Anéis de luz iridescente nascem atrás de um objeto e se expandem em ondas, como um halo ou a vibração de um som — o objeto parece "especial".

| Campo | Valor |
|---|---|
| Nome técnico | Iridescent Ripple Halo |
| Categoria | 07 · Backgrounds › Brilhos e auras |
| Nível | Iniciante |
| Tecnologias | HTML, CSS, JavaScript |
| Dependências | nenhuma |
| Interação | Automático, Clique |
| Status | validado em 2026-11-17 |
| Tags | halo, ripple, ondas, anéis, aura, iridescente, conic-gradient, referência em vídeo |

## Objetivo visual

Destacar um produto, ícone ou personagem no centro da cena com uma aura viva.

## Aplicações

- Produto em destaque no hero
- Ícone de conquista ou prêmio
- Botão de gravar/ouvir em apps de áudio

## Como funciona

### Nível 1 — Iniciante

- Atrás da esfera, anéis coloridos nascem pequenos e vão crescendo até sumir.
- Como sempre nasce um anel novo, parece uma onda contínua de luz.
- O botão Pausar congela os anéis.

### Nível 2 — Intermediário

- Cada anel é um círculo com fundo conic-gradient (as cores do arco-íris girando em volta) e uma máscara que deixa só a borda: radial-gradient transparente no meio.
- Todos os anéis usam a mesma animação, "expandir": crescem de 0,4 a 1,6 e desaparecem. O atraso de cada um é negativo e espaçado, então sempre há anéis em fases diferentes.
- O resultado é uma onda contínua saindo do centro, sem nenhum JavaScript para a animação — o JS só pausa.

### Nível 3 — Avançado

- Atraso negativo = −i × (duração ÷ n): os anéis ficam igualmente espaçados no tempo e já começam em movimento.
- A máscara radial com quatro paradas (transparente, preto, preto, transparente) desenha uma faixa de anel com bordas suaves.
- scale (propriedade individual) na animação deixa transform livre para, por exemplo, inclinar o halo em perspectiva.
- Troque o conic-gradient por uma única cor para um efeito de "sonar" mais sóbrio.

### Glossário do código

| Termo | O que faz |
|---|---|
| `conic-gradient` | Cores girando em volta do centro: o brilho iridescente. |
| `mask-image` | Deixa só a faixa do anel visível. |
| `animation-play-state: paused` | Congela os anéis quando a pessoa pausa. |
| `calc(var(--i) * -` | Atraso negativo de cada anel, espaçando as ondas. |

## Parâmetros

| Controle | Tipo | Padrão | Faixa / opções |
|---|---|---|---|
| número de anéis | range | 4 | 2–6 (passo 1) |
| tempo de uma onda | range | 4s | 2–8s (passo 0.5) |
| cor do halo | seleção | iridescente | iridescente, dourado, branco |

## Outra forma de fazer

Em canvas, círculos com strokeStyle e globalAlpha decrescente; em SVG, <circle> com <animate> no r e no opacity.

## Compatibilidade

conic-gradient, mask-image e animações: todos os navegadores atuais (com -webkit-mask-image).

## Responsividade

Tamanho dos anéis em % do palco; o objeto central escala junto.

## Acessibilidade

Decorativo (aria-hidden). Movimento infinito com botão Pausar (WCAG 2.2.2). Com prefers-reduced-motion, os anéis ficam parados em tamanhos diferentes.

## Performance

Só transform e opacity animados; 2 a 6 anéis são leves até em celulares.

## Limitações

- Anéis muito grandes com mask e gradiente cônico pedem mais pintura; mantenha o palco do tamanho da área de destaque.

## Referências

- [MDN — conic-gradient()](https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/conic-gradient)
- [MDN — mask-image](https://developer.mozilla.org/en-US/docs/Web/CSS/mask-image)
- [WCAG 2.2 — 2.3.3 Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)

## Código (valores padrão)

Arquivo único, igual ao baixado pelo botão “Baixar” na página do efeito:

```html
<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data:; font-src data:">
<title>Halo de anéis que pulsam · Kalixto Creative Lab</title>
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

.palco-halo {
  position: relative;
  display: grid;
  place-items: center;
  width: min(100%, 640px);
  aspect-ratio: 16 / 10;
  border-radius: 20px;
  overflow: hidden;
  background: linear-gradient(180deg, #1f6fff, #3f8cff);
}
.halo, .objeto { grid-area: 1 / 1; }
.halo { position: relative; width: 60%; aspect-ratio: 1; }

/* Um anel: gradiente cônico com o meio vazado pela máscara */
.anel {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: conic-gradient(from 0deg, #ff9ad5, #ffe27a, #8ef0c6, #7fb2ff, #c9a2ff, #ff9ad5);
  -webkit-mask-image: radial-gradient(circle, transparent 62%, #000 64%, #000 70%, transparent 72%);
  mask-image: radial-gradient(circle, transparent 62%, #000 64%, #000 70%, transparent 72%);
  opacity: 0;
  animation: expandir 4s ease-out calc(var(--i) * -1.00s) infinite;
}
@keyframes expandir {
  0% { scale: 0.4; opacity: 0; }
  20% { opacity: 0.9; }
  100% { scale: 1.6; opacity: 0; }
}
.palco-halo.is-pausado .anel { animation-play-state: paused; }

/* O objeto em destaque */
.objeto {
  position: relative;
  width: 22%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #fff6c9, #f5b73b 45%, #a8650c);
  box-shadow: 0 20px 40px rgb(0 0 0 / 0.3);
}

.pausar {
  padding: 8px 16px;
  border: 1px solid #3a3456;
  border-radius: 999px;
  background: transparent;
  color: #c9c3ea;
  font: inherit;
  cursor: pointer;
}

@media (prefers-reduced-motion: reduce) {
  .anel { animation: none; opacity: 0.5; scale: calc(0.7 + var(--i) * 0.25); }
}
</style>
</head>
<body>
<section class="palco-halo">
  <div class="halo" aria-hidden="true">
    <span class="anel" style="--i: 0"></span>
    <span class="anel" style="--i: 1"></span>
    <span class="anel" style="--i: 2"></span>
    <span class="anel" style="--i: 3"></span>
  </div>
  <div class="objeto" role="img" aria-label="Esfera dourada"></div>
</section>
<button class="pausar" type="button" aria-pressed="false">Pausar</button>
<script>
// WCAG 2.2.2: movimento automático precisa de pausa
const palco = document.querySelector('.palco-halo');
const botao = document.querySelector('.pausar');
botao.addEventListener('click', () => {
  const pausado = palco.classList.toggle('is-pausado');
  botao.setAttribute('aria-pressed', String(pausado));
  botao.textContent = pausado ? 'Continuar' : 'Pausar';
});
</script>
</body>
</html>
```

## Versão Angular (valores padrão)

Também em `src/app/efeitos-angular/ripple-halo/` (compilada e testada com o app).

`ripple-halo.ts`

```ts
import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-ripple-halo',
  templateUrl: './ripple-halo.html',
  styleUrl: './ripple-halo.css',
})
export class RippleHalo {
  protected readonly aneis = Array.from({ length: 4 }, (_, i) => i);
  protected readonly pausado = signal(false);
}
```

`ripple-halo.html`

```html
<section class="palco-halo" [class.is-pausado]="pausado()">
  <div class="halo" aria-hidden="true">
    @for (i of aneis; track i) {
      <span class="anel" [style.--i]="i"></span>
    }
  </div>
  <div class="objeto" role="img" aria-label="Esfera dourada"></div>
</section>
<button class="pausar" type="button" [attr.aria-pressed]="pausado()" (click)="pausado.set(!pausado())">
  {{ pausado() ? 'Continuar' : 'Pausar' }}
</button>
```

`ripple-halo.css`

```css
:host {
  display: grid;
  place-items: center;
  gap: 24px;
}

.palco-halo {
  position: relative;
  display: grid;
  place-items: center;
  width: min(100%, 640px);
  aspect-ratio: 16 / 10;
  border-radius: 20px;
  overflow: hidden;
  background: linear-gradient(180deg, #1f6fff, #3f8cff);
}
.halo, .objeto { grid-area: 1 / 1; }
.halo { position: relative; width: 60%; aspect-ratio: 1; }

/* Um anel: gradiente cônico com o meio vazado pela máscara */
.anel {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: conic-gradient(from 0deg, #ff9ad5, #ffe27a, #8ef0c6, #7fb2ff, #c9a2ff, #ff9ad5);
  -webkit-mask-image: radial-gradient(circle, transparent 62%, #000 64%, #000 70%, transparent 72%);
  mask-image: radial-gradient(circle, transparent 62%, #000 64%, #000 70%, transparent 72%);
  opacity: 0;
  animation: expandir 4s ease-out calc(var(--i) * -1.00s) infinite;
}
@keyframes expandir {
  0% { scale: 0.4; opacity: 0; }
  20% { opacity: 0.9; }
  100% { scale: 1.6; opacity: 0; }
}
.palco-halo.is-pausado .anel { animation-play-state: paused; }

/* O objeto em destaque */
.objeto {
  position: relative;
  width: 22%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #fff6c9, #f5b73b 45%, #a8650c);
  box-shadow: 0 20px 40px rgb(0 0 0 / 0.3);
}

.pausar {
  padding: 8px 16px;
  border: 1px solid #3a3456;
  border-radius: 999px;
  background: transparent;
  color: #c9c3ea;
  font: inherit;
  cursor: pointer;
}

@media (prefers-reduced-motion: reduce) {
  .anel { animation: none; opacity: 0.5; scale: calc(0.7 + var(--i) * 0.25); }
}
```
