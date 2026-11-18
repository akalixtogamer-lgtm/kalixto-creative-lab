# Feixes de luz de palco (`light-beams`)

> Gerado a partir de `src/app/core/efeitos/kits/light-beams.kit.ts`. Não edite à mão: rode `npm run docs:efeitos`.

Refletores no alto do palco lançam feixes de luz que varrem a cena devagar, se cruzando sobre um card de vidro no centro.

| Campo | Valor |
|---|---|
| Nome técnico | Stage Light Beams (feixes de palco) |
| Categoria | 08 · Luz, sombra e profundidade › Luz volumétrica |
| Nível | Intermediário |
| Tecnologias | HTML, CSS, JavaScript |
| Dependências | nenhuma |
| Interação | Automático, Clique |
| Status | validado em 2026-11-17 |
| Tags | spotlight, refletor, feixe de luz, palco, conic-gradient, mix-blend-mode, show, referência em vídeo |

## Objetivo visual

Criar clima de show, lançamento ou "momento de destaque" para um depoimento, um número ou uma oferta.

## Aplicações

- Destaque de depoimento ou case
- Páginas de eventos, shows e dança
- Lançamentos de produto

## Como funciona

### Nível 1 — Iniciante

- No alto do palco há refletores, e cada um lança um feixe de luz para baixo.
- Os feixes balançam de um lado para o outro, cada um no seu ritmo, e se cruzam no meio.
- Onde os feixes se cruzam a luz fica mais forte, igual num show.

### Nível 2 — Intermediário

- Cada feixe é um retângulo alto e estreito, preso pelo topo (transform-origin: top center), com um gradiente que vai da cor da luz até transparente.
- clip-path em forma de trapézio deixa o feixe fino no refletor e largo embaixo; filter: blur() suaviza a borda como luz no ar.
- Cada feixe balança (rotate) para um lado e para o outro, com duração e atraso diferentes — por isso eles se cruzam em momentos variados.
- mix-blend-mode: screen soma as luzes: onde dois feixes se cruzam, a área fica mais clara, como na vida real.

### Nível 3 — Avançado

- transform-origin: top center + rotate: o feixe gira em volta do refletor, não do próprio centro.
- Atraso negativo (calc(var(--i) × −1.7s)) começa cada feixe numa fase diferente da animação, já em movimento ao carregar.
- mix-blend-mode: screen no grupo faz as luzes somarem entre si e com o fundo, sem estourar o card de vidro (que está fora do grupo).
- Propriedade individual rotate deixa transform livre para outros ajustes (ex.: escalar os feixes no hover).

### Glossário do código

| Termo | O que faz |
|---|---|
| `transform-origin: top center` | O feixe gira a partir do refletor, no topo. |
| `clip-path: polygon(` | Recorta o feixe em forma de trapézio. |
| `mix-blend-mode: screen` | Soma as luzes onde os feixes se cruzam. |
| `animation-play-state: paused` | Congela os feixes quando a pessoa pausa. |

## Parâmetros

| Controle | Tipo | Padrão | Faixa / opções |
|---|---|---|---|
| número de feixes | range | 4 | 2–6 (passo 1) |
| cor da luz | seleção | 196 181 253 | Lilás, Rosa, Azul, Branco |
| tempo de uma varredura | range | 6s | 3–12s (passo 1) |

## Outra forma de fazer

Em Three.js, SpotLight com um cone de material aditivo (ou o plugin de luz volumétrica) dá feixes com perspectiva e poeira de verdade.

## Compatibilidade

clip-path polygon(), filter: blur() e mix-blend-mode: todos os navegadores atuais.

## Responsividade

Feixes posicionados em % da largura; o card central usa clamp() e quebra o texto no celular.

## Acessibilidade

Feixes decorativos (aria-hidden). Movimento infinito com botão Pausar (WCAG 2.2.2). Com prefers-reduced-motion os feixes ficam parados.

## Performance

blur grande em elementos que giram custa: poucos feixes (até 6) e área do palco limitada.

## Limitações

- blur muito alto em telas grandes pode pesar em celulares simples; reduza o blur ou use imagens PNG dos feixes.

## Referências

- [MDN — clip-path](https://developer.mozilla.org/en-US/docs/Web/CSS/clip-path)
- [MDN — mix-blend-mode](https://developer.mozilla.org/en-US/docs/Web/CSS/mix-blend-mode)
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
<title>Feixes de luz de palco · Kalixto Creative Lab</title>
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

.palco-show {
  position: relative;
  display: grid;
  place-items: center;
  width: min(100%, 680px);
  aspect-ratio: 16 / 10;
  border-radius: 20px;
  overflow: hidden;
  background: radial-gradient(ellipse at 50% 110%, #2a1f5c, #07060f 70%);
}
.luzes { position: absolute; inset: 0; mix-blend-mode: screen; }

/* Um feixe: preso no topo, estreito no refletor e largo embaixo */
.feixe {
  position: absolute;
  top: -10%;
  left: var(--x);
  width: 34%;
  height: 130%;
  margin-left: -17%;
  background: linear-gradient(180deg, rgb(196 181 253 / 0.85), rgb(196 181 253 / 0.15) 70%, transparent);
  clip-path: polygon(46% 0, 54% 0, 100% 100%, 0 100%);
  filter: blur(6px);
  transform-origin: top center;
  animation: varrer 6s ease-in-out calc(var(--i) * -1.7s) infinite alternate;
}
@keyframes varrer {
  from { rotate: -24deg; }
  to { rotate: 24deg; }
}
.palco-show.is-pausado .feixe { animation-play-state: paused; }

/* Card de vidro no centro */
.card-vidro {
  position: relative;
  display: grid;
  gap: 6px;
  width: min(80%, 380px);
  padding: 24px;
  border: 1px solid rgb(255 255 255 / 0.18);
  border-radius: 18px;
  background: rgb(255 255 255 / 0.06);
  backdrop-filter: blur(10px);
  text-align: center;
}
.card-vidro p { margin: 0; color: #e7e3ff; }
.card-vidro strong { font-size: clamp(1.6rem, 6vw, 2.4rem); }

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
  .feixe { animation: none; rotate: calc((var(--i) - 1.5) * 10deg); }
}
</style>
</head>
<body>
<section class="palco-show">
  <div class="luzes" aria-hidden="true">
  <span class="feixe" style="--x: 20%; --i: 0"></span>
  <span class="feixe" style="--x: 40%; --i: 1"></span>
  <span class="feixe" style="--x: 60%; --i: 2"></span>
  <span class="feixe" style="--x: 80%; --i: 3"></span>
  </div>
  <article class="card-vidro">
    <p>Sua operação deixa de depender de você</p>
    <strong>24h por dia</strong>
  </article>
</section>
<button class="pausar" type="button" aria-pressed="false">Pausar</button>
<script>
// WCAG 2.2.2: movimento automático precisa de pausa
const palco = document.querySelector('.palco-show');
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

Também em `src/app/efeitos-angular/light-beams/` (compilada e testada com o app).

`light-beams.ts`

```ts
import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-light-beams',
  templateUrl: './light-beams.html',
  styleUrl: './light-beams.css',
})
export class LightBeams {
  /** Posição horizontal de cada feixe (distribuídos pela largura). */
  protected readonly feixes = Array.from({ length: 4 }, (_, i) => Math.round(((i + 1) / 5) * 100) + '%');
  protected readonly pausado = signal(false);
}
```

`light-beams.html`

```html
<section class="palco-show" [class.is-pausado]="pausado()">
  <div class="luzes" aria-hidden="true">
    @for (x of feixes; track $index) {
      <span class="feixe" [style.--x]="x" [style.--i]="$index"></span>
    }
  </div>
  <article class="card-vidro">
    <p>Sua operação deixa de depender de você</p>
    <strong>24h por dia</strong>
  </article>
</section>
<button class="pausar" type="button" [attr.aria-pressed]="pausado()" (click)="pausado.set(!pausado())">
  {{ pausado() ? 'Continuar' : 'Pausar' }}
</button>
```

`light-beams.css`

```css
:host {
  display: grid;
  place-items: center;
  gap: 24px;
}

.palco-show {
  position: relative;
  display: grid;
  place-items: center;
  width: min(100%, 680px);
  aspect-ratio: 16 / 10;
  border-radius: 20px;
  overflow: hidden;
  background: radial-gradient(ellipse at 50% 110%, #2a1f5c, #07060f 70%);
}
.luzes { position: absolute; inset: 0; mix-blend-mode: screen; }

/* Um feixe: preso no topo, estreito no refletor e largo embaixo */
.feixe {
  position: absolute;
  top: -10%;
  left: var(--x);
  width: 34%;
  height: 130%;
  margin-left: -17%;
  background: linear-gradient(180deg, rgb(196 181 253 / 0.85), rgb(196 181 253 / 0.15) 70%, transparent);
  clip-path: polygon(46% 0, 54% 0, 100% 100%, 0 100%);
  filter: blur(6px);
  transform-origin: top center;
  animation: varrer 6s ease-in-out calc(var(--i) * -1.7s) infinite alternate;
}
@keyframes varrer {
  from { rotate: -24deg; }
  to { rotate: 24deg; }
}
.palco-show.is-pausado .feixe { animation-play-state: paused; }

/* Card de vidro no centro */
.card-vidro {
  position: relative;
  display: grid;
  gap: 6px;
  width: min(80%, 380px);
  padding: 24px;
  border: 1px solid rgb(255 255 255 / 0.18);
  border-radius: 18px;
  background: rgb(255 255 255 / 0.06);
  backdrop-filter: blur(10px);
  text-align: center;
}
.card-vidro p { margin: 0; color: #e7e3ff; }
.card-vidro strong { font-size: clamp(1.6rem, 6vw, 2.4rem); }

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
  .feixe { animation: none; rotate: calc((var(--i) - 1.5) * 10deg); }
}
```
