# Cards empilhados no scroll (`sticky-stack`)

> Gerado a partir de `src/app/core/efeitos/kits/sticky-stack.kit.ts`. Não edite à mão: rode `npm run docs:efeitos`.

Ao rolar, cada card gruda no topo e o próximo sobe por cima dele, enquanto o de baixo encolhe e escurece — formando uma pilha.

| Campo | Valor |
|---|---|
| Nome técnico | Sticky Stacking Cards |
| Categoria | 03 · Scroll e parallax › Seções presas (sticky) |
| Nível | Intermediário |
| Tecnologias | HTML, CSS, JavaScript |
| Dependências | nenhuma |
| Interação | Rolagem |
| Status | validado em 2026-11-17 |
| Tags | sticky, stacking cards, cards empilhados, pilha, scroll, tendência 2026 |

## Objetivo visual

Apresentar etapas, serviços ou cases um de cada vez, com sensação de profundidade e progresso.

## Aplicações

- Etapas de um processo
- Serviços de uma agência
- Cases e depoimentos

## Como funciona

### Nível 1 — Iniciante

- São quatro cartões grandes, um depois do outro.
- Ao rolar, cada cartão para no topo da tela e o próximo sobe por cima, como cartas sendo empilhadas.
- O cartão que ficou embaixo diminui e escurece um pouco, para parecer que está mais longe.

### Nível 2 — Intermediário

- O empilhamento é só CSS: todos os cards têm position: sticky, cada um com um top um pouco maior (--i × deslocamento). O card seguinte, que vem depois no HTML, sobe por cima.
- O JavaScript só faz o "encolher": para cada card, mede a distância do próximo card até o ponto onde ele vai grudar. Quanto mais perto, menor e mais escuro fica o de baixo.
- Esse progresso (0 a 1) vira scale e brightness por propriedades individuais, atualizadas uma vez por quadro.

### Nível 3 — Avançado

- Elementos sticky irmãos no mesmo contêiner empilham naturalmente: a ordem do DOM decide quem fica por cima, sem z-index.
- transform-origin: center top faz o card encolher "para dentro" da pilha, mantendo a borda de cima no degrau.
- O cálculo usa a posição do próximo card (não a do próprio), porque o próprio está parado enquanto gruda.
- Versão sem JS: envolva cada card num trilho com view-timeline-name e use animation-range: exit para escalar.

### Glossário do código

| Termo | O que faz |
|---|---|
| `position: sticky` | O card gruda no topo enquanto o contêiner passa. |
| `top: calc(12vh + var(--i) *` | Cada card gruda um degrau abaixo do anterior. |
| `transform-origin: center top` | Encolhe a partir da borda de cima. |
| `passive: true` | Avisa que o ouvinte de rolagem não bloqueia o scroll. |

## Parâmetros

| Controle | Tipo | Padrão | Faixa / opções |
|---|---|---|---|
| degrau entre cards | range | 24px | 0–40px (passo 4) |
| tamanho do card de baixo | range | 0.9× | 0.8–1× (passo 0.02) |
| arredondamento | range | 24px | 0–40px (passo 4) |

## Outra forma de fazer

Com CSS scroll-driven animations: cada card dentro de um "trilho" com view-timeline e animation-range, sem JavaScript (Chrome/Edge; Safari 26+). Com GSAP: ScrollTrigger com pin e scrub em cada card.

## Compatibilidade

position: sticky e a propriedade individual scale: todos os navegadores atuais.

## Responsividade

Alturas em vh e largura limitada; funciona igual no celular.

## Acessibilidade

Os cards são conteúdo normal, na ordem de leitura. Com prefers-reduced-motion eles continuam empilhando (é a rolagem do usuário), mas não encolhem.

## Performance

Um getBoundingClientRect por card a cada quadro de rolagem; escala e filtro são compostos na GPU.

## Limitações

- sticky não funciona se algum ancestral tiver overflow: hidden/auto.
- O último card precisa de espaço depois dele (margem) para a pilha terminar antes da próxima seção.

## Referências

- [MDN — position: sticky](https://developer.mozilla.org/en-US/docs/Web/CSS/position)
- [MDN — CSS scroll-driven animations](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_scroll-driven_animations)
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
<title>Cards empilhados no scroll · Kalixto Creative Lab</title>
<style>
/* Página da demonstração (rolável) */
* { box-sizing: border-box; }
html, body { margin: 0; }
body {
  background: #0b0a14;
  color: #f4f2ff;
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.5;
}
.intro, .fim {
  display: grid;
  place-items: center;
  min-height: 70vh;
  padding: 24px;
  color: #c9c3ea;
  text-align: center;
}

.pilha-cards {
  max-width: 720px;
  margin: 0 auto;
  padding: 0 20px 30vh;
}
/* todos grudam no topo, cada um um degrau abaixo do anterior */
.card-pilha {
  position: sticky;
  top: calc(12vh + var(--i) * 24px);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 60vh;
  margin-bottom: 20vh;
  padding: 32px;
  border-radius: 24px;
  background: var(--fundo);
  color: #fff;
  box-shadow: 0 -10px 40px rgb(0 0 0 / 0.35);
  transform-origin: center top;
}
.card-pilha span { font: 600 14px ui-monospace, monospace; opacity: 0.8; }
.card-pilha h2 { margin: 0; font-size: clamp(2rem, 8vw, 4rem); letter-spacing: -0.03em; }
</style>
</head>
<body>
<section class="intro"><p>Role para baixo ↓</p></section>

<section class="pilha-cards">
  <article class="card-pilha" style="--i: 0; --fundo: #2a1f6b">
    <span>01</span>
    <h2>Estratégia</h2>
  </article>
  <article class="card-pilha" style="--i: 1; --fundo: #7c3aed">
    <span>02</span>
    <h2>Design</h2>
  </article>
  <article class="card-pilha" style="--i: 2; --fundo: #ff2bd6">
    <span>03</span>
    <h2>Código</h2>
  </article>
  <article class="card-pilha" style="--i: 3; --fundo: #22e3ff">
    <span>04</span>
    <h2>Lançamento</h2>
  </article>
</section>

<section class="fim"><p>Fim da página</p></section>
<script>
const cards = [...document.querySelectorAll('.card-pilha')];
const ENCOLHER = 0.9;
const DEGRAU = 24;
const reduzir = matchMedia('(prefers-reduced-motion: reduce)');
let quadro = 0;

function atualizar() {
  quadro = 0;
  if (reduzir.matches) return;
  const topo = innerHeight * 0.12;
  cards.forEach((card, i) => {
    const proximo = cards[i + 1];
    if (!proximo) return;
    // 0 = próximo card ainda lá embaixo · 1 = próximo card já grudou por cima
    const onde = proximo.getBoundingClientRect().top - (topo + i * DEGRAU);
    const p = Math.min(1, Math.max(0, 1 - (onde - DEGRAU) / (innerHeight - topo)));
    card.style.scale = String(1 - (1 - ENCOLHER) * p);
    card.style.filter = 'brightness(' + (1 - 0.5 * p) + ')';
  });
}

addEventListener('scroll', () => {
  if (!quadro) quadro = requestAnimationFrame(atualizar);
}, { passive: true });
atualizar();
</script>
</body>
</html>
```

## Versão Angular (valores padrão)

Também em `src/app/efeitos-angular/sticky-stack/` (compilada e testada com o app).

`sticky-stack.ts`

```ts
import { Component, DestroyRef, ElementRef, afterNextRender, inject, viewChildren } from '@angular/core';

@Component({
  selector: 'app-sticky-stack',
  templateUrl: './sticky-stack.html',
  styleUrl: './sticky-stack.css',
})
export class StickyStack {
  protected readonly cards = [{titulo: 'Estratégia', cor: '#2a1f6b'}, {titulo: 'Design', cor: '#7c3aed'}, {titulo: 'Código', cor: '#ff2bd6'}, {titulo: 'Lançamento', cor: '#22e3ff'}];
  private readonly elementos = viewChildren<ElementRef<HTMLElement>>('card');
  private readonly encolher = 0.9;
  private readonly degrau = 24;

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const reduzir = window.matchMedia('(prefers-reduced-motion: reduce)');
      let quadro = 0;
      const atualizar = () => {
        quadro = 0;
        if (reduzir.matches) return;
        const lista = this.elementos().map((e) => e.nativeElement);
        const topo = window.innerHeight * 0.12;
        lista.forEach((card, i) => {
          const proximo = lista[i + 1];
          if (!proximo) return;
          const onde = proximo.getBoundingClientRect().top - (topo + i * this.degrau);
          const p = Math.min(1, Math.max(0, 1 - (onde - this.degrau) / (window.innerHeight - topo)));
          card.style.scale = String(1 - (1 - this.encolher) * p);
          card.style.filter = 'brightness(' + (1 - 0.5 * p) + ')';
        });
      };
      const aoRolar = () => {
        if (!quadro) quadro = requestAnimationFrame(atualizar);
      };
      window.addEventListener('scroll', aoRolar, { passive: true });
      atualizar();
      destroyRef.onDestroy(() => window.removeEventListener('scroll', aoRolar));
    });
  }
}
```

`sticky-stack.html`

```html
<section class="pilha-cards">
  @for (c of cards; track c.titulo; let i = $index) {
    <article #card class="card-pilha" [style.--i]="i" [style.--fundo]="c.cor">
      <span>0{{ i + 1 }}</span>
      <h2>{{ c.titulo }}</h2>
    </article>
  }
</section>
```

`sticky-stack.css`

```css
:host { display: block; }

.pilha-cards {
  max-width: 720px;
  margin: 0 auto;
  padding: 0 20px 30vh;
}
/* todos grudam no topo, cada um um degrau abaixo do anterior */
.card-pilha {
  position: sticky;
  top: calc(12vh + var(--i) * 24px);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 60vh;
  margin-bottom: 20vh;
  padding: 32px;
  border-radius: 24px;
  background: var(--fundo);
  color: #fff;
  box-shadow: 0 -10px 40px rgb(0 0 0 / 0.35);
  transform-origin: center top;
}
.card-pilha span { font: 600 14px ui-monospace, monospace; opacity: 0.8; }
.card-pilha h2 { margin: 0; font-size: clamp(2rem, 8vw, 4rem); letter-spacing: -0.03em; }
```
