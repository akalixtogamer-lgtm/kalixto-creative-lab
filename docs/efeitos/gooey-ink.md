# Mancha de tinta viva (`gooey-ink`)

> Gerado a partir de `src/app/core/efeitos/kits/gooey-ink.kit.ts`. Não edite à mão: rode `npm run docs:efeitos`.

Gotas de tinta que se juntam e se separam como líquido atrás de um título gigante; cada clique pinga uma gota nova que se espalha.

| Campo | Valor |
|---|---|
| Nome técnico | Gooey Ink Blobs (filtro SVG) |
| Categoria | 09 · SVG, geometria e máscaras › Filtros e formas líquidas |
| Nível | Intermediário |
| Tecnologias | SVG, CSS, JavaScript |
| Dependências | nenhuma |
| Interação | Automático, Clique, Toque |
| Status | validado em 2026-11-17 |
| Tags | gooey, metaball, tinta, ink, blob, líquido, feColorMatrix, mix-blend-mode, referência em vídeo |

## Objetivo visual

Dar uma identidade orgânica e "de ateliê" ao hero, com o texto invertendo de cor sobre a tinta.

## Aplicações

- Heros de estúdios criativos
- Marcas de arte, tinta, café
- Telas de abertura interativas

## Como funciona

### Nível 1 — Iniciante

- Há várias bolinhas de tinta passeando atrás da palavra.
- Quando duas bolinhas chegam perto, elas "grudam" como gotas de água — isso é feito com um filtro.
- Clicando no papel, cai uma gota nova que se espalha. A palavra muda de cor sozinha quando passa por cima da tinta.

### Nível 2 — Intermediário

- As gotas são círculos comuns que se movem devagar. O "efeito líquido" vem de um filtro SVG aplicado ao grupo inteiro.
- Primeiro feGaussianBlur borra tudo, e os círculos próximos se misturam numa névoa só. Depois feColorMatrix aumenta muito o contraste do canal alfa: o que era meio transparente vira sólido e a borda volta a ficar nítida.
- Resultado: onde dois círculos se aproximam, nasce uma "ponte" de tinta entre eles — é a técnica do metaball.
- O título usa mix-blend-mode: difference. Sobre o papel claro ele fica escuro; sobre a tinta escura ele fica claro, sem precisar de duas camadas de texto.

### Nível 3 — Avançado

- Na matriz do feColorMatrix, a última linha (0 0 0 22 −9) é o alfa: alfa_final = 22 × alfa − 9. Quem tinha alfa abaixo de ~0,41 some; acima, vira opaco.
- stdDeviation maior = gotas "se enxergam" de mais longe (mais viscoso); menor = só grudam quando quase se tocam.
- translate como propriedade individual na animação deixa o scale do pingo livre para outra animação, sem um transform sobrescrever o outro.
- No Angular, [style.--dx.%] e [style.--s.px] acrescentam a unidade ao número; a lista de pingos é um signal limitado aos 8 mais recentes.

### Glossário do código

| Termo | O que faz |
|---|---|
| `feGaussianBlur` | Borra as gotas para que se misturem. |
| `feColorMatrix` | Aumenta o contraste do alfa e devolve a borda nítida. |
| `filter: url(#gooey)` | Aplica o filtro SVG ao grupo de gotas. |
| `mix-blend-mode: difference` | O título inverte de cor sobre a tinta. |

## Parâmetros

| Controle | Tipo | Padrão | Faixa / opções |
|---|---|---|---|
| número de gotas | range | 6 | 3–9 (passo 1) |
| viscosidade (desfoque) | range | 12 | 6–20 (passo 1) |
| cor da tinta | seleção | #111111 | Nanquim, Vermelho, Azul, Roxo |

## Outra forma de fazer

Em WebGL, um shader de metaballs (soma de campos 1/d²) dá bordas perfeitas e milhares de gotas. Em CSS puro, filter: blur() + contrast() no contêiner imita o efeito, mas só com fundo sólido.

## Compatibilidade

Filtros SVG referenciados por CSS (filter: url(#…)) e mix-blend-mode: todos os navegadores atuais.

## Responsividade

Posições em % do palco e tamanho das gotas fixo; no celular as gotas ocupam mais área relativa, o que reforça a mancha.

## Acessibilidade

O título é texto real. A tinta é decorativa (aria-hidden). Com prefers-reduced-motion as gotas ficam paradas e o clique ainda pinga gotas, sem a animação de espalhar.

## Performance

Filtros SVG são calculados na CPU em vários navegadores: mantenha a área filtrada pequena (só o palco) e poucas gotas (até ~12).

## Limitações

- O filtro "come" um pouco a borda das gotas: a forma final é menor que o círculo original. Aumente o tamanho para compensar.
- O contraste no alfa funciona com fundo transparente; não coloque um fundo dentro do grupo filtrado.

## Referências

- [MDN — <feColorMatrix>](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feColorMatrix)
- [MDN — <feGaussianBlur>](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feGaussianBlur)
- [MDN — mix-blend-mode](https://developer.mozilla.org/en-US/docs/Web/CSS/mix-blend-mode)

## Código (valores padrão)

Arquivo único, igual ao baixado pelo botão “Baixar” na página do efeito:

```html
<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data:; font-src data:">
<title>Mancha de tinta viva · Kalixto Creative Lab</title>
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

.filtros { position: absolute; }

.papel {
  position: relative;
  display: grid;
  place-items: center;
  width: min(100%, 640px);
  aspect-ratio: 16 / 10;
  border-radius: 20px;
  overflow: hidden;
  background: #f1efe9;
  cursor: crosshair;
}

/* O grupo inteiro passa pelo filtro: as gotas viram líquido */
.tinta {
  position: absolute;
  inset: 0;
  filter: url(#gooey);
}
.gota {
  position: absolute;
  left: 50%;
  top: 50%;
  width: var(--s);
  aspect-ratio: 1;
  margin: calc(var(--s) / -2) 0 0 calc(var(--s) / -2);
  border-radius: 50%;
  background: #111111;
  animation: vagar calc(5s + var(--i) * 0.7s) ease-in-out calc(var(--i) * -1.3s) infinite alternate;
}
@keyframes vagar {
  from { translate: calc(var(--dx) * -0.6) calc(var(--dy) * -0.6); }
  to { translate: calc(var(--dx) * 2) calc(var(--dy) * 2); }
}

/* Gota pingada pelo clique: nasce pequena e se espalha */
.gota.pingo {
  left: var(--x);
  top: var(--y);
  animation: espalhar 1400ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
}
@keyframes espalhar {
  from { scale: 0.1; }
  to { scale: 1; }
}

/* Texto que inverte sobre a tinta */
.sopro {
  position: relative;
  margin: 0;
  font: 900 clamp(3rem, 16vw, 8rem) / 1 'Arial Black', system-ui, sans-serif;
  letter-spacing: -0.04em;
  color: #fff;
  mix-blend-mode: difference;
  pointer-events: none;
}
.dica { margin: 0; color: #c9c3ea; font-size: 14px; }

@media (prefers-reduced-motion: reduce) {
  .gota, .gota.pingo { animation: none; }
}
</style>
</head>
<body>
<svg class="filtros" width="0" height="0" aria-hidden="true">
  <filter id="gooey">
    <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="borrado" />
    <feColorMatrix in="borrado" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9" />
  </filter>
</svg>
<section class="papel">
  <div class="tinta" aria-hidden="true">
    <span class="gota" style="--dx: 0%; --dy: 26%; --s: 70px; --i: 0"></span>
    <span class="gota" style="--dx: 23%; --dy: -3%; --s: 107px; --i: 1"></span>
    <span class="gota" style="--dx: -34%; --dy: -25%; --s: 84px; --i: 2"></span>
    <span class="gota" style="--dx: 27%; --dy: 10%; --s: 121px; --i: 3"></span>
    <span class="gota" style="--dx: -6%; --dy: 23%; --s: 98px; --i: 4"></span>
    <span class="gota" style="--dx: -18%; --dy: -16%; --s: 75px; --i: 5"></span>
  </div>
  <h1 class="sopro">SOPRO</h1>
</section>
<p class="dica">Clique ou toque no papel para pingar tinta.</p>
<script>
const papel = document.querySelector('.papel');
const tinta = papel.querySelector('.tinta');
const MAX_PINGOS = 8;

// cada clique pinga uma gota nova no ponto tocado
papel.addEventListener('pointerdown', (e) => {
  const r = papel.getBoundingClientRect();
  const pingo = document.createElement('span');
  pingo.className = 'gota pingo';
  pingo.style.setProperty('--x', e.clientX - r.left + 'px');
  pingo.style.setProperty('--y', e.clientY - r.top + 'px');
  pingo.style.setProperty('--s', 60 + Math.random() * 90 + 'px');
  tinta.append(pingo);
  // limita a quantidade: o filtro fica mais caro a cada gota
  const pingos = tinta.querySelectorAll('.pingo');
  if (pingos.length > MAX_PINGOS) pingos[0].remove();
});
</script>
</body>
</html>
```

## Versão Angular (valores padrão)

Também em `src/app/efeitos-angular/gooey-ink/` (compilada e testada com o app).

`gooey-ink.ts`

```ts
import { Component, signal } from '@angular/core';

interface Pingo {
  id: number;
  x: string;
  y: string;
  s: string;
}

@Component({
  selector: 'app-gooey-ink',
  templateUrl: './gooey-ink.html',
  styleUrl: './gooey-ink.css',
})
export class GooeyInk {
  protected readonly gotas = [{dx: 0, dy: 26, s: 70}, {dx: 23, dy: -3, s: 107}, {dx: -34, dy: -25, s: 84}, {dx: 27, dy: 10, s: 121}, {dx: -6, dy: 23, s: 98}, {dx: -18, dy: -16, s: 75}];
  protected readonly pingos = signal<Pingo[]>([]);
  private proximo = 0;

  protected pingar(e: PointerEvent, papel: HTMLElement): void {
    const r = papel.getBoundingClientRect();
    const novo: Pingo = {
      id: this.proximo++,
      x: e.clientX - r.left + 'px',
      y: e.clientY - r.top + 'px',
      s: 60 + Math.random() * 90 + 'px',
    };
    // limita a quantidade: o filtro fica mais caro a cada gota
    this.pingos.update((lista) => [...lista, novo].slice(-8));
  }
}
```

`gooey-ink.html`

```html
<svg class="filtros" width="0" height="0" aria-hidden="true">
  <filter id="gooey">
    <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="borrado" />
    <feColorMatrix in="borrado" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9" />
  </filter>
</svg>
<section #papel class="papel" (pointerdown)="pingar($event, papel)">
  <div class="tinta" aria-hidden="true">
    @for (g of gotas; track $index) {
      <span class="gota" [style.--dx.%]="g.dx" [style.--dy.%]="g.dy" [style.--s.px]="g.s" [style.--i]="$index"></span>
    }
    @for (p of pingos(); track p.id) {
      <span class="gota pingo" [style.--x]="p.x" [style.--y]="p.y" [style.--s]="p.s"></span>
    }
  </div>
  <h1 class="sopro">SOPRO</h1>
</section>
<p class="dica">Clique ou toque no papel para pingar tinta.</p>
```

`gooey-ink.css`

```css
:host {
  display: grid;
  place-items: center;
  gap: 24px;
}

.filtros { position: absolute; }

.papel {
  position: relative;
  display: grid;
  place-items: center;
  width: min(100%, 640px);
  aspect-ratio: 16 / 10;
  border-radius: 20px;
  overflow: hidden;
  background: #f1efe9;
  cursor: crosshair;
}

/* O grupo inteiro passa pelo filtro: as gotas viram líquido */
.tinta {
  position: absolute;
  inset: 0;
  filter: url(#gooey);
}
.gota {
  position: absolute;
  left: 50%;
  top: 50%;
  width: var(--s);
  aspect-ratio: 1;
  margin: calc(var(--s) / -2) 0 0 calc(var(--s) / -2);
  border-radius: 50%;
  background: #111111;
  animation: vagar calc(5s + var(--i) * 0.7s) ease-in-out calc(var(--i) * -1.3s) infinite alternate;
}
@keyframes vagar {
  from { translate: calc(var(--dx) * -0.6) calc(var(--dy) * -0.6); }
  to { translate: calc(var(--dx) * 2) calc(var(--dy) * 2); }
}

/* Gota pingada pelo clique: nasce pequena e se espalha */
.gota.pingo {
  left: var(--x);
  top: var(--y);
  animation: espalhar 1400ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
}
@keyframes espalhar {
  from { scale: 0.1; }
  to { scale: 1; }
}

/* Texto que inverte sobre a tinta */
.sopro {
  position: relative;
  margin: 0;
  font: 900 clamp(3rem, 16vw, 8rem) / 1 'Arial Black', system-ui, sans-serif;
  letter-spacing: -0.04em;
  color: #fff;
  mix-blend-mode: difference;
  pointer-events: none;
}
.dica { margin: 0; color: #c9c3ea; font-size: 14px; }

@media (prefers-reduced-motion: reduce) {
  .gota, .gota.pingo { animation: none; }
}
```
