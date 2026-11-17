# Mosaico de células que acendem (`tile-grid-reveal`)

> Gerado a partir de `src/app/core/efeitos/kits/tile-grid-reveal.kit.ts`. Não edite à mão: rode `npm run docs:efeitos`.

Uma parede de pequenas células em vários tons acende aos poucos (aleatório, em diagonal ou do centro para fora) e forma o fundo de um título; passar o mouse acende as células de novo.

| Campo | Valor |
|---|---|
| Nome técnico | Tile Grid Reveal (mosaico de células) |
| Categoria | 07 · Backgrounds › Grades e mosaicos animados |
| Nível | Iniciante |
| Tecnologias | HTML, CSS, JavaScript |
| Dependências | nenhuma |
| Interação | Automático, Hover, Clique |
| Status | validado em 2026-11-17 |
| Tags | grid, mosaico, tiles, células, stagger, pixel, fundo animado, referência em vídeo |

## Objetivo visual

Visualizar "muitos dados" ou "muitos testes" — como uma plantação vista de cima ou uma planilha viva — atrás de uma frase de impacto.

## Aplicações

- Seções sobre dados e pesquisa
- Fundo de hero de tecnologia
- Transições entre seções

## Como funciona

### Nível 1 — Iniciante

- O fundo é uma parede de quadradinhos verdes, cada um num tom diferente.
- Os quadradinhos aparecem aos poucos: espalhados, em diagonal ou a partir do meio.
- Passando o mouse, os quadradinhos acendem e vão apagando devagar, deixando um rastro.

### Nível 2 — Intermediário

- O JavaScript cria as células numa CSS Grid e dá a cada uma duas variáveis: --d (o atraso, de 0 a 1, conforme o padrão) e --l (a luminosidade, sorteada, para variar o tom).
- Toda a animação é CSS: cada célula entra com animation-delay = --d × duração. O padrão "diagonal" soma coluna e linha; o "centro" usa a distância até o meio.
- No hover, a célula ganha brilho na hora e volta devagar (transição só na saída), deixando um rastro por onde o mouse passa.

### Nível 3 — Avançado

- Calcular só um número (--d de 0 a 1) e multiplicar pela duração no CSS deixa o padrão independente do tempo total.
- Distância normalizada ao centro (dividida pela distância do canto) garante que o último a acender seja sempre o canto, em qualquer tamanho de grade.
- Transição só na saída: transition: none no :hover e transition normal fora dele — o "acender" é instantâneo e o "apagar" é lento.
- No Angular, o @for externo com a chave ciclo() recria a grade inteira e reinicia as animações.

### Glossário do código

| Termo | O que faz |
|---|---|
| `grid-template-columns: repeat(` | Quantidade de colunas da grade. |
| `calc(var(--d) *` | Atraso de cada célula conforme o padrão. |
| `hsl(95 70% var(--l))` | Mesmo verde em luminosidades sorteadas. |
| `replaceChildren` | Troca todas as células de uma vez (reinicia a animação). |

## Parâmetros

| Controle | Tipo | Padrão | Faixa / opções |
|---|---|---|---|
| colunas | range | 16 | 8–24 (passo 2) |
| tempo total | range | 1800ms | 600–3000ms (passo 100) |
| ordem das células | seleção | aleatorio | aleatória, diagonal, do centro para fora |

## Outra forma de fazer

Em canvas, desenhando retângulos num loop — melhor para grades com milhares de células. Com GSAP: gsap.from(celulas, { opacity: 0, stagger: { grid: [linhas, colunas], from: "center" } }).

## Compatibilidade

CSS Grid, variáveis em calc() e animações: todos os navegadores atuais.

## Responsividade

As colunas são fixas e as células quadradas (aspect-ratio), então a grade escala com a largura do palco.

## Acessibilidade

A grade é decorativa (aria-hidden); o título é texto real por cima. Com prefers-reduced-motion as células aparecem prontas, sem animação.

## Performance

Só opacity e scale animados. Com 16 colunas × 10 linhas são 160 elementos — leve. Acima de ~1000 células, prefira canvas.

## Limitações

- Muitas células = muitos elementos no DOM; mantenha a grade moderada ou use canvas.

## Referências

- [MDN — CSS Grid Layout](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout)
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
<title>Mosaico de células que acendem · Kalixto Creative Lab</title>
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

.mosaico-palco {
  position: relative;
  display: grid;
  place-items: center;
  width: min(100%, 680px);
  border-radius: 20px;
  overflow: hidden;
  background: #071009;
}
.mosaico {
  display: grid;
  grid-template-columns: repeat(16, 1fr);
  gap: 3px;
  width: 100%;
  padding: 3px;
}
/* cada célula: tom sorteado (--l) e atraso pelo padrão (--d) */
.celula {
  aspect-ratio: 1;
  border-radius: 2px;
  background: hsl(95 70% var(--l));
  animation: acender 500ms cubic-bezier(0.22, 1, 0.36, 1) calc(var(--d) * 1800ms) both;
  transition: filter 900ms ease;
}
@keyframes acender {
  from { opacity: 0; scale: 0.4; }
}
/* rastro do mouse: acende na hora, apaga devagar */
.celula:hover { filter: brightness(2.2); transition: none; }

.mosaico-palco h1 {
  position: absolute;
  margin: 0;
  padding: 0 24px;
  font: 800 clamp(1.8rem, 7vw, 3.6rem) / 1 system-ui, sans-serif;
  letter-spacing: -0.03em;
  text-align: center;
  text-shadow: 0 4px 30px rgb(0 0 0 / 0.8);
  pointer-events: none;
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
  .celula { animation: none; transition: none; }
}
</style>
</head>
<body>
<section class="mosaico-palco">
  <div class="mosaico" aria-hidden="true"></div>
  <h1>Testar, testar e testar.</h1>
</section>
<button class="repetir" type="button">Repetir</button>
<script>
const mosaico = document.querySelector('.mosaico');
const colunas = 16;
const linhas = Math.round(colunas * 0.6);

function montar() {
  const celulas = [];
  for (let l = 0; l < linhas; l++) {
    for (let c = 0; c < colunas; c++) {
      const celula = document.createElement('span');
      celula.className = 'celula';
      celula.style.setProperty('--d', (Math.random()).toFixed(3));
      celula.style.setProperty('--l', 8 + Math.round(Math.random() * 24) + '%');
      celulas.push(celula);
    }
  }
  mosaico.replaceChildren(...celulas); // recriar reinicia as animações
}

montar();
document.querySelector('.repetir').addEventListener('click', montar);
</script>
</body>
</html>
```

## Versão Angular (valores padrão)

Também em `src/app/efeitos-angular/tile-grid-reveal/` (compilada e testada com o app).

`tile-grid-reveal.ts`

```ts
import { Component, signal } from '@angular/core';

interface Celula {
  d: string;
  l: string;
}

@Component({
  selector: 'app-tile-grid-reveal',
  templateUrl: './tile-grid-reveal.html',
  styleUrl: './tile-grid-reveal.css',
})
export class TileGridReveal {
  /** Muda a cada Repetir: o @for recria as células e as animações recomeçam. */
  protected readonly ciclo = signal(0);
  protected readonly celulas = signal(this.criar());

  protected repetir(): void {
    this.celulas.set(this.criar());
    this.ciclo.update((n) => n + 1);
  }

  private criar(): Celula[] {
    const colunas = 16;
    const linhas = Math.round(colunas * 0.6);
    const lista: Celula[] = [];
    for (let l = 0; l < linhas; l++) {
      for (let c = 0; c < colunas; c++) {
        lista.push({
          d: (Math.random()).toFixed(3),
          l: 8 + Math.round(Math.random() * 24) + '%',
        });
      }
    }
    return lista;
  }
}
```

`tile-grid-reveal.html`

```html
<section class="mosaico-palco">
  @for (k of [ciclo()]; track k) {
    <div class="mosaico" aria-hidden="true">
      @for (cel of celulas(); track $index) {
        <span class="celula" [style.--d]="cel.d" [style.--l]="cel.l"></span>
      }
    </div>
  }
  <h1>Testar, testar e testar.</h1>
</section>
<button class="repetir" type="button" (click)="repetir()">Repetir</button>
```

`tile-grid-reveal.css`

```css
:host {
  display: grid;
  place-items: center;
  gap: 24px;
}

.mosaico-palco {
  position: relative;
  display: grid;
  place-items: center;
  width: min(100%, 680px);
  border-radius: 20px;
  overflow: hidden;
  background: #071009;
}
.mosaico {
  display: grid;
  grid-template-columns: repeat(16, 1fr);
  gap: 3px;
  width: 100%;
  padding: 3px;
}
/* cada célula: tom sorteado (--l) e atraso pelo padrão (--d) */
.celula {
  aspect-ratio: 1;
  border-radius: 2px;
  background: hsl(95 70% var(--l));
  animation: acender 500ms cubic-bezier(0.22, 1, 0.36, 1) calc(var(--d) * 1800ms) both;
  transition: filter 900ms ease;
}
@keyframes acender {
  from { opacity: 0; scale: 0.4; }
}
/* rastro do mouse: acende na hora, apaga devagar */
.celula:hover { filter: brightness(2.2); transition: none; }

.mosaico-palco h1 {
  position: absolute;
  margin: 0;
  padding: 0 24px;
  font: 800 clamp(1.8rem, 7vw, 3.6rem) / 1 system-ui, sans-serif;
  letter-spacing: -0.03em;
  text-align: center;
  text-shadow: 0 4px 30px rgb(0 0 0 / 0.8);
  pointer-events: none;
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
  .celula { animation: none; transition: none; }
}
```
