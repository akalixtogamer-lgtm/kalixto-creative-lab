# Barra de progresso de leitura (`scroll-progress`)

> Gerado a partir de `src/app/core/efeitos/kits/scroll-progress.kit.ts`. Não edite à mão: rode `npm run docs:efeitos`.

Uma barra fina que cresce conforme a página é rolada, indicando quanto falta para o fim.

| Campo | Valor |
|---|---|
| Nome técnico | Scroll Progress (scroll-driven animation) |
| Categoria | 03 · Scroll e parallax › Indicadores de rolagem |
| Nível | Intermediário |
| Tecnologias | HTML, CSS, JavaScript |
| Dependências | nenhuma |
| Interação | Rolagem |
| Status | validado em 2026-11-17 |
| Tags | scroll, progresso, progress, animation-timeline, scroll-driven, leitura |

## Objetivo visual

Dar noção de tamanho e de avanço em textos longos.

## Aplicações

- Artigos e posts de blog
- Documentação
- Páginas de termos e políticas

## Como funciona

### Nível 1 — Iniciante

- A barra começa vazia e vai enchendo enquanto você rola a página para baixo.
- Quando você chega ao fim do texto, ela fica cheia.
- Ela não anda sozinha: só se mexe quando você rola.

### Nível 2 — Intermediário

- A barra é um elemento fixo no topo, com transform: scaleX — 0 é vazia e 1 é cheia.
- Com animation-timeline: scroll(root), a animação não depende de tempo: o progresso dela é a própria rolagem da página.
- @supports só aplica esse bloco onde o navegador entende scroll-driven animations.
- Onde não entende (ou no modo "sempre JavaScript"), o script calcula scrollY dividido pela altura rolável e grava em --progresso.

### Nível 3 — Avançado

- scroll(root) cria uma ScrollTimeline da rolagem do documento; animation-duration perde o sentido e o progresso vem da posição de rolagem.
- animation-timeline precisa vir depois do atalho animation, porque animation reinicia animation-timeline para auto.
- Listener passivo ({ passive: true }) diz ao navegador que o código não cancela a rolagem, liberando a rolagem suave na thread de composição.
- Usar scaleX em vez de width evita recalcular layout a cada quadro.
- Para medir um único artigo, troque scroll() por view() com animation-range, ou calcule com getBoundingClientRect do artigo.

### Glossário do código

| Termo | O que faz |
|---|---|
| `animation-timeline` | Liga a animação a uma linha do tempo de rolagem, em vez do relógio. |
| `@supports` | Aplica o bloco só se o navegador entender a propriedade. |
| `scaleX` | Estica a barra na horizontal: 0 é vazia, 1 é cheia. |
| `transform-origin: 0 50%` | Faz a barra crescer a partir da esquerda. |
| `scrollHeight` | Altura total do documento, incluindo a parte fora da tela. |
| `passive: true` | Avisa que o listener não bloqueia a rolagem. |

## Parâmetros

| Controle | Tipo | Padrão | Faixa / opções |
|---|---|---|---|
| espessura | range | 4px | 2–12px (passo 1) |
| cor inicial | seleção | #ff2bd6 | Magenta, Roxo, Azul, Ciano |
| cor final | seleção | #22e3ff | Magenta, Roxo, Azul, Ciano |
| posição | seleção | top | topo, base |
| tecnologia | seleção | auto | CSS (com JavaScript de reserva), sempre JavaScript |

## Outra forma de fazer

GSAP ScrollTrigger com scrub: true anima a barra presa à rolagem e funciona igual em todos os navegadores (veja a demo "Barra de progresso de leitura" no Scroll Lab).

## Compatibilidade

animation-timeline: Chrome e Edge 115+ (e versões recentes do Safari). Nos demais navegadores entra o fallback em JavaScript, que funciona em todos os atuais.

## Responsividade

A barra ocupa a largura toda em qualquer tela.

## Acessibilidade

A barra acompanha a rolagem feita pelo próprio usuário, então não é movimento automático. Ela é decorativa (aria-hidden). Com redução de movimento, a suavização do fallback é removida.

## Performance

No modo CSS não há JavaScript por quadro. No fallback, um listener de scroll passivo agenda no máximo uma atualização por quadro com requestAnimationFrame. Só transform é animada.

## Limitações

- Mede a página inteira: para medir só um artigo dentro da página, use view() ou calcule a partir do elemento.

## Referências

- [MDN — CSS scroll-driven animations](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_scroll-driven_animations)
- [MDN — requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame)
- [MDN — transform](https://developer.mozilla.org/en-US/docs/Web/CSS/transform)

## Código (valores padrão)

Arquivo único, igual ao baixado pelo botão “Baixar” na página do efeito:

```html
<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data:; font-src data:">
<title>Barra de progresso de leitura · Kalixto Creative Lab</title>
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

.texto {
  max-width: 60ch;
  margin: 0 auto;
  padding: 48px 24px 60vh;
}
.texto p { margin: 0 0 40vh; font-size: 1.15rem; }

/* O efeito */
.progresso {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  height: 4px;
  background: linear-gradient(90deg, #ff2bd6, #22e3ff);
  transform-origin: 0 50%;
  transform: scaleX(var(--progresso, 0));
  transition: transform 80ms linear; /* suaviza o fallback em JavaScript */
}

/* Navegadores com scroll-driven animations: a rolagem É a linha do tempo */
@supports (animation-timeline: scroll()) {
  .progresso {
    transition: none;
    animation: encher linear both;
    animation-timeline: scroll(root);
  }
  @keyframes encher {
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
  }
}

@media (prefers-reduced-motion: reduce) {
  .progresso { transition: none; }
}
</style>
</head>
<body>
<div class="progresso" aria-hidden="true"></div>

<article class="texto">
  <h1>Progresso de leitura</h1>
  <p>A barra no topo mostra quanto da página você já leu.</p>
  <p>Ela cresce da esquerda para a direita conforme a rolagem avança.</p>
  <p>Nos navegadores que suportam animações guiadas por rolagem, o próprio CSS faz o trabalho.</p>
  <p>Nos outros, um pequeno script calcula a porcentagem e atualiza uma variável CSS.</p>
  <p>Role até o fim para ver a barra completa.</p>
</article>
<script>
const barra = document.querySelector('.progresso');
const usaCss = CSS.supports('animation-timeline: scroll()');
let quadro = 0;

function atualizar() {
  const rolavel = document.documentElement.scrollHeight - window.innerHeight;
  const progresso = rolavel > 0 ? window.scrollY / rolavel : 0;
  barra.style.setProperty('--progresso', progresso.toFixed(4));
}

if (!usaCss) {
  window.addEventListener('scroll', () => {
    cancelAnimationFrame(quadro);
    quadro = requestAnimationFrame(atualizar);
  }, { passive: true });
  atualizar();
}
</script>
</body>
</html>
```

## Versão Angular (valores padrão)

Também em `src/app/efeitos-angular/scroll-progress/` (compilada e testada com o app).

`scroll-progress.ts`

```ts
import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-scroll-progress',
  templateUrl: './scroll-progress.html',
  styleUrl: './scroll-progress.css',
  host: { '(window:scroll)': 'rolou()' },
})
export class ScrollProgress {
  /** De 0 a 1: quanto da página já foi rolado. */
  protected readonly progresso = signal(0);
  private readonly usaCss = CSS.supports('animation-timeline: scroll()');
  private quadro = 0;

  protected rolou(): void {
    if (this.usaCss) return; // o CSS já cuida da barra
    cancelAnimationFrame(this.quadro);
    this.quadro = requestAnimationFrame(() => {
      const rolavel = document.documentElement.scrollHeight - window.innerHeight;
      this.progresso.set(rolavel > 0 ? window.scrollY / rolavel : 0);
    });
  }
}
```

`scroll-progress.html`

```html
<div class="progresso" aria-hidden="true" [style.--progresso]="progresso()"></div>
```

`scroll-progress.css`

```css
:host { display: block; }


/* O efeito */
.progresso {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  height: 4px;
  background: linear-gradient(90deg, #ff2bd6, #22e3ff);
  transform-origin: 0 50%;
  transform: scaleX(var(--progresso, 0));
  transition: transform 80ms linear; /* suaviza o fallback em JavaScript */
}

/* Navegadores com scroll-driven animations: a rolagem É a linha do tempo */
@supports (animation-timeline: scroll()) {
  .progresso {
    transition: none;
    animation: encher linear both;
    animation-timeline: scroll(root);
  }
  @keyframes encher {
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
  }
}

@media (prefers-reduced-motion: reduce) {
  .progresso { transition: none; }
}
```
