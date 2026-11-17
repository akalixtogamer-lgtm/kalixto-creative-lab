# Cards com luz que segue o mouse (`spotlight-cards`)

> Gerado a partir de `src/app/core/efeitos/kits/spotlight-cards.kit.ts`. Não edite à mão: rode `npm run docs:efeitos`.

Uma grade de cards escuros em que a borda e o interior acendem perto do ponteiro — inclusive nos cards vizinhos —, como uma lanterna passando por cima.

| Campo | Valor |
|---|---|
| Nome técnico | Spotlight Cards (borda e brilho que seguem o mouse) |
| Categoria | 08 · Luz, sombra e profundidade › Brilho e bordas reativas |
| Nível | Intermediário |
| Tecnologias | HTML, CSS, JavaScript |
| Dependências | nenhuma |
| Interação | Movimento do mouse, Hover |
| Status | validado em 2026-11-17 |
| Tags | spotlight, glow, borda, bento, radial-gradient, mask-composite, linear style, tendência 2026 |

## Objetivo visual

Dar acabamento "premium" a grades de features e bento grids, típico de sites de produtos de tecnologia.

## Aplicações

- Grade de features de SaaS
- Bento grids
- Planos e preços

## Como funciona

### Nível 1 — Iniciante

- São quatro cartões escuros lado a lado.
- Quando o mouse passa por cima, a borda dos cartões acende perto dele, como se houvesse uma lanterna.
- A luz vaza para os cartões vizinhos, porque todos sabem onde o mouse está.

### Nível 2 — Intermediário

- Ao mover o mouse sobre a grade, o JS grava em cada card a posição do ponteiro relativa a ele (--mx, --my) — até nos cards em que o mouse não está.
- O ::before desenha a luz da borda: um radial-gradient na posição do mouse, recortado só na moldura de 1px com uma máscara dupla (content-box "menos" a caixa inteira).
- O ::after desenha um brilho bem fraco no interior, com o mesmo gradiente maior e transparente.
- Os dois pseudo-elementos ficam invisíveis até o mouse entrar na grade (opacity com transição).

### Nível 3 — Avançado

- A máscara dupla (content-box + caixa inteira) com composite exclude deixa visível só a área do padding: a moldura de 1px.
- Calcular a posição relativa de todos os cards (não só do que está sob o mouse) é o que faz a luz "atravessar" o vão entre eles.
- --mx/--my começam em −999px: antes do primeiro movimento, a luz fica fora do card.
- Cor em canais separados (rgb(139 92 246 / α)) permite reaproveitar a mesma cor com transparências diferentes na borda e no interior.

### Glossário do código

| Termo | O que faz |
|---|---|
| `mask-composite: exclude` | Recorta a luz só na moldura do card. |
| `radial-gradient(` | O círculo de luz centrado no mouse. |
| `--mx` | Posição horizontal do mouse relativa ao card. |
| `border-radius: inherit` | A luz segue o arredondamento do card. |

## Parâmetros

| Controle | Tipo | Padrão | Faixa / opções |
|---|---|---|---|
| raio da luz | range | 280px | 100–500px (passo 20) |
| cor da luz | seleção | 139 92 246 | Roxo, Ciano, Lima, Magenta |
| brilho interno | range | 0.15 | 0.05–0.4 (passo 0.05) |

## Outra forma de fazer

Só com CSS dá para fazer o brilho interno com :hover e background-attachment, mas a borda acendendo nos vizinhos exige saber a posição do mouse — por isso o JS.

## Compatibilidade

mask-composite: exclude (sem prefixo): Chrome/Edge 120+, Firefox 53+, Safari 15.4+; o CSS traz também -webkit-mask-composite: xor.

## Responsividade

Grade com auto-fit: 2 colunas no computador e 1 no celular. No toque, os cards ficam com a borda padrão (sem luz).

## Acessibilidade

O efeito é só decorativo; o conteúdo dos cards não depende dele. Não há movimento automático; a transição de opacidade é desligada com prefers-reduced-motion.

## Performance

Duas variáveis por card a cada movimento (com requestAnimationFrame). Os gradientes repintam só a área de cada card.

## Limitações

- Com dezenas de cards, calcule apenas os que estão próximos do ponteiro.

## Referências

- [MDN — mask-image](https://developer.mozilla.org/en-US/docs/Web/CSS/mask-image)
- [MDN — mask-composite](https://developer.mozilla.org/en-US/docs/Web/CSS/mask-composite)
- [MDN — Pointer events](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events)

## Código (valores padrão)

Arquivo único, igual ao baixado pelo botão “Baixar” na página do efeito:

```html
<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data:; font-src data:">
<title>Cards com luz que segue o mouse · Kalixto Creative Lab</title>
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

.grade-luz {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
  width: min(100%, 640px);
}
.card-luz {
  --mx: -999px;
  --my: -999px;
  position: relative;
  padding: 28px 24px;
  border: 1px solid rgb(255 255 255 / 0.08);
  border-radius: 16px;
  background: #13111f;
}
.card-luz h2 { margin: 0 0 6px; font-size: 20px; }
.card-luz p { margin: 0; color: #a9a3c9; font-size: 15px; }

/* luz na borda: o gradiente só aparece na moldura de 1px */
.card-luz::before,
.card-luz::after {
  content: '';
  position: absolute;
  border-radius: inherit;
  pointer-events: none;
  opacity: 0;
  transition: opacity 400ms ease;
}
.card-luz::before {
  inset: -1px;
  padding: 1px;
  background: radial-gradient(280px circle at var(--mx) var(--my), rgb(139 92 246 / 0.9), transparent 60%);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}
/* brilho fraco no interior */
.card-luz::after {
  inset: 0;
  background: radial-gradient(392px circle at var(--mx) var(--my), rgb(139 92 246 / 0.15), transparent 60%);
}
.grade-luz:hover .card-luz::before,
.grade-luz:hover .card-luz::after { opacity: 1; }

@media (prefers-reduced-motion: reduce) {
  .card-luz::before, .card-luz::after { transition: none; }
}
</style>
</head>
<body>
<section class="grade-luz">
  <article class="card-luz">
    <h2>Rápido</h2>
    <p>Tudo carrega em menos de um segundo.</p>
  </article>
  <article class="card-luz">
    <h2>Acessível</h2>
    <p>Teclado, leitor de tela e contraste.</p>
  </article>
  <article class="card-luz">
    <h2>Animado</h2>
    <p>Movimento com propósito.</p>
  </article>
  <article class="card-luz">
    <h2>Seu</h2>
    <p>Código aberto para copiar.</p>
  </article>
</section>
<script>
const grade = document.querySelector('.grade-luz');
const cards = grade.querySelectorAll('.card-luz');
let quadro = 0;

// cada card recebe a posição do mouse relativa a ele mesmo (até os vizinhos)
grade.addEventListener('pointermove', (e) => {
  cancelAnimationFrame(quadro);
  quadro = requestAnimationFrame(() => {
    cards.forEach((card) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', e.clientX - r.left + 'px');
      card.style.setProperty('--my', e.clientY - r.top + 'px');
    });
  });
});
</script>
</body>
</html>
```

## Versão Angular (valores padrão)

Também em `src/app/efeitos-angular/spotlight-cards/` (compilada e testada com o app).

`spotlight-cards.ts`

```ts
import { Component, ElementRef, viewChildren } from '@angular/core';

@Component({
  selector: 'app-spotlight-cards',
  templateUrl: './spotlight-cards.html',
  styleUrl: './spotlight-cards.css',
})
export class SpotlightCards {
  protected readonly cards = [
    {
      titulo: 'Rápido',
      texto: 'Tudo carrega em menos de um segundo.'
    },
    {
      titulo: 'Acessível',
      texto: 'Teclado, leitor de tela e contraste.'
    },
    {
      titulo: 'Animado',
      texto: 'Movimento com propósito.'
    },
    {
      titulo: 'Seu',
      texto: 'Código aberto para copiar.'
    }
  ];
  private readonly elementos = viewChildren<ElementRef<HTMLElement>>('card');
  private quadro = 0;

  /** Escrita direta no estilo de cada card: muda a cada movimento. */
  protected mover(e: PointerEvent): void {
    cancelAnimationFrame(this.quadro);
    this.quadro = requestAnimationFrame(() => {
      for (const { nativeElement: card } of this.elementos()) {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', e.clientX - r.left + 'px');
        card.style.setProperty('--my', e.clientY - r.top + 'px');
      }
    });
  }
}
```

`spotlight-cards.html`

```html
<section class="grade-luz" (pointermove)="mover($event)">
  @for (c of cards; track c.titulo) {
    <article #card class="card-luz">
      <h2>{{ c.titulo }}</h2>
      <p>{{ c.texto }}</p>
    </article>
  }
</section>
```

`spotlight-cards.css`

```css
:host {
  display: grid;
  place-items: center;
  gap: 24px;
}

.grade-luz {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
  width: min(100%, 640px);
}
.card-luz {
  --mx: -999px;
  --my: -999px;
  position: relative;
  padding: 28px 24px;
  border: 1px solid rgb(255 255 255 / 0.08);
  border-radius: 16px;
  background: #13111f;
}
.card-luz h2 { margin: 0 0 6px; font-size: 20px; }
.card-luz p { margin: 0; color: #a9a3c9; font-size: 15px; }

/* luz na borda: o gradiente só aparece na moldura de 1px */
.card-luz::before,
.card-luz::after {
  content: '';
  position: absolute;
  border-radius: inherit;
  pointer-events: none;
  opacity: 0;
  transition: opacity 400ms ease;
}
.card-luz::before {
  inset: -1px;
  padding: 1px;
  background: radial-gradient(280px circle at var(--mx) var(--my), rgb(139 92 246 / 0.9), transparent 60%);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}
/* brilho fraco no interior */
.card-luz::after {
  inset: 0;
  background: radial-gradient(392px circle at var(--mx) var(--my), rgb(139 92 246 / 0.15), transparent 60%);
}
.grade-luz:hover .card-luz::before,
.grade-luz:hover .card-luz::after { opacity: 1; }

@media (prefers-reduced-motion: reduce) {
  .card-luz::before, .card-luz::after { transition: none; }
}
```
