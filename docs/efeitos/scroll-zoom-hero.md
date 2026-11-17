# Hero que abre no scroll (`scroll-zoom-hero`)

> Gerado a partir de `src/app/core/efeitos/kits/scroll-zoom-hero.kit.ts`. Não edite à mão: rode `npm run docs:efeitos`.

Uma imagem pequena e arredondada no meio do título cresce até ocupar a tela inteira enquanto as palavras do título se afastam para os lados.

| Campo | Valor |
|---|---|
| Nome técnico | Scroll Zoom Hero (imagem que abre em tela cheia) |
| Categoria | 03 · Scroll e parallax › Scrollytelling cinematográfico |
| Nível | Intermediário |
| Tecnologias | HTML, CSS, JavaScript |
| Dependências | nenhuma |
| Interação | Rolagem |
| Status | validado em 2026-11-17 |
| Tags | zoom, hero, scroll, tela cheia, scale, sticky, scrollytelling, tendência 2026 |

## Objetivo visual

Transformar a abertura do site numa "entrada de cena": do título para a imagem, com o usuário no controle.

## Aplicações

- Abertura de portfólio e agência
- Lançamento de produto
- Páginas de eventos e filmes

## Como funciona

### Nível 1 — Iniciante

- No começo, a foto é um cartão pequeno no meio de um título grande.
- Conforme você rola, a foto cresce até encher a tela e as duas palavras do título vão para os lados.
- Rolando de volta, tudo volta ao começo.

### Nível 2 — Intermediário

- A seção é alta e o conteúdo fica preso (sticky) na tela enquanto ela passa — é a "trilha" da animação.
- O JavaScript só calcula UM número: --p, o progresso de 0 a 1 da rolagem dentro da seção, e grava na seção.
- Todo o resto é CSS: scale da moldura, arredondamento e afastamento das palavras são calc() em cima de --p. Mudar o desenho não exige mexer no JS.

### Nível 3 — Avançado

- Padrão "uma variável, muito CSS": --p é a única ponte entre JS e estilo; qualquer propriedade pode reagir a ele com calc().
- Dividir o raio pelo scale inicial compensa o scale: no começo o raio aparente é exatamente 32px.
- mix-blend-mode: difference mantém o título legível sobre a imagem clara e sobre o fundo escuro.
- No Angular, --p é um signal ligado com [style.--p]; o listener de scroll é removido no DestroyRef.

### Glossário do código

| Termo | O que faz |
|---|---|
| `setProperty('--p'` | O JS grava o progresso numa variável CSS. |
| `scale: calc(` | O tamanho da imagem é calculado a partir do progresso. |
| `position: sticky` | Prende a cena na tela enquanto a seção alta passa. |
| `mix-blend-mode: difference` | O título inverte a cor sobre a imagem. |

## Parâmetros

| Controle | Tipo | Padrão | Faixa / opções |
|---|---|---|---|
| tamanho inicial da imagem | range | 0.35× | 0.2–0.7× (passo 0.05) |
| altura da seção | range | 300vh | 200–500vh (passo 50) |
| afastamento das palavras | range | 80% | 0–120% (passo 10) |

## Outra forma de fazer

Sem JS: animation-timeline: view() na seção com animation-range: contain (Chrome/Edge; Safari 26+), usando @supports com esta versão como reserva. Com GSAP: ScrollTrigger com scrub e pin.

## Compatibilidade

position: sticky, variáveis CSS em calc() e propriedades individuais (scale, translate): todos os navegadores atuais.

## Responsividade

A moldura usa vw/vh e as palavras clamp(); o afastamento é em % da largura da palavra, então funciona em qualquer tela.

## Acessibilidade

O título é texto real, legível em qualquer ponto da animação. A animação só acontece com a rolagem; com prefers-reduced-motion a seção mostra o estado final, sem zoom.

## Performance

Uma escrita de variável por quadro; scale e translate são compostos na GPU, sem refazer layout.

## Limitações

- border-radius em elemento com scale também escala: o arredondamento é calculado já compensando o tamanho.
- Use uma imagem com resolução de tela cheia: ela começa pequena, mas termina grande.

## Referências

- [MDN — CSS scroll-driven animations](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_scroll-driven_animations)
- [MDN — scale (propriedade)](https://developer.mozilla.org/en-US/docs/Web/CSS/scale)
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
<title>Hero que abre no scroll · Kalixto Creative Lab</title>
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

.zoom-hero { --p: 0; height: 300vh; }
.fixo-hero {
  position: sticky;
  top: 0;
  display: grid;
  place-items: center;
  height: 100vh;
  overflow: hidden;
}

/* A imagem: começa pequena e cresce até a tela cheia */
.moldura {
  position: absolute;
  inset: 0;
  scale: calc(0.35 + 0.65 * var(--p));
  border-radius: calc((1 - var(--p)) * 32px / 0.35);
  background:
    radial-gradient(circle at 70% 30%, #ffd27a, transparent 25%),
    linear-gradient(180deg, #ff8a5c 0%, #c24d7a 45%, #2a1f6b 70%, #0b0a14 100%);
}

/* As palavras se afastam para os lados */
.titulo-hero {
  position: relative;
  display: flex;
  gap: 0.3em;
  margin: 0;
  font: 800 clamp(2.4rem, 10vw, 7rem) / 1 system-ui, sans-serif;
  letter-spacing: -0.04em;
  mix-blend-mode: difference;
}
.lado.esq { translate: calc(var(--p) * -80%) 0; }
.lado.dir { translate: calc(var(--p) * 80%) 0; }

@media (prefers-reduced-motion: reduce) {
  .zoom-hero { --p: 1 !important; height: auto; }
  .fixo-hero { position: relative; }
}
</style>
</head>
<body>
<section class="zoom-hero">
  <div class="fixo-hero">
    <div class="moldura" role="img" aria-label="Paisagem ao entardecer"></div>
    <h1 class="titulo-hero">
      <span class="lado esq">Novo</span>
      <span class="lado dir">capítulo</span>
    </h1>
  </div>
</section>

<section class="fim"><p>Fim da página</p></section>
<script>
const hero = document.querySelector('.zoom-hero');
let quadro = 0;

// o único trabalho do JS: progresso da rolagem dentro da seção (0 → 1) em --p
function atualizar() {
  quadro = 0;
  const r = hero.getBoundingClientRect();
  const p = Math.min(1, Math.max(0, -r.top / (hero.offsetHeight - innerHeight)));
  hero.style.setProperty('--p', p.toFixed(4));
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

Também em `src/app/efeitos-angular/scroll-zoom-hero/` (compilada e testada com o app).

`scroll-zoom-hero.ts`

```ts
import { Component, DestroyRef, ElementRef, afterNextRender, inject, signal, viewChild } from '@angular/core';

@Component({
  selector: 'app-scroll-zoom-hero',
  templateUrl: './scroll-zoom-hero.html',
  styleUrl: './scroll-zoom-hero.css',
})
export class ScrollZoomHero {
  private readonly hero = viewChild.required<ElementRef<HTMLElement>>('hero');
  /** Progresso da rolagem dentro da seção (0 → 1). */
  protected readonly p = signal(0);

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      let quadro = 0;
      const atualizar = () => {
        quadro = 0;
        const el = this.hero().nativeElement;
        const r = el.getBoundingClientRect();
        this.p.set(Math.min(1, Math.max(0, -r.top / (el.offsetHeight - window.innerHeight))));
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

`scroll-zoom-hero.html`

```html
<section #hero class="zoom-hero" [style.--p]="p()">
  <div class="fixo-hero">
    <div class="moldura" role="img" aria-label="Paisagem ao entardecer"></div>
    <h1 class="titulo-hero">
      <span class="lado esq">Novo</span>
      <span class="lado dir">capítulo</span>
    </h1>
  </div>
</section>
```

`scroll-zoom-hero.css`

```css
:host { display: block; }

.zoom-hero { --p: 0; height: 300vh; }
.fixo-hero {
  position: sticky;
  top: 0;
  display: grid;
  place-items: center;
  height: 100vh;
  overflow: hidden;
}

/* A imagem: começa pequena e cresce até a tela cheia */
.moldura {
  position: absolute;
  inset: 0;
  scale: calc(0.35 + 0.65 * var(--p));
  border-radius: calc((1 - var(--p)) * 32px / 0.35);
  background:
    radial-gradient(circle at 70% 30%, #ffd27a, transparent 25%),
    linear-gradient(180deg, #ff8a5c 0%, #c24d7a 45%, #2a1f6b 70%, #0b0a14 100%);
}

/* As palavras se afastam para os lados */
.titulo-hero {
  position: relative;
  display: flex;
  gap: 0.3em;
  margin: 0;
  font: 800 clamp(2.4rem, 10vw, 7rem) / 1 system-ui, sans-serif;
  letter-spacing: -0.04em;
  mix-blend-mode: difference;
}
.lado.esq { translate: calc(var(--p) * -80%) 0; }
.lado.dir { translate: calc(var(--p) * 80%) 0; }

@media (prefers-reduced-motion: reduce) {
  .zoom-hero { --p: 1 !important; height: auto; }
  .fixo-hero { position: relative; }
}
```
