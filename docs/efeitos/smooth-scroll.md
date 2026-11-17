# Rolagem suave (`smooth-scroll`)

> Gerado a partir de `src/app/core/efeitos/kits/smooth-scroll.kit.ts`. Não edite à mão: rode `npm run docs:efeitos`.

Compara a rolagem suavizada pela biblioteca Lenis com a rolagem suave nativa do CSS, incluindo os links de âncora.

| Campo | Valor |
|---|---|
| Nome técnico | Smooth Scroll (Lenis × nativo) |
| Categoria | 14 · Navegação e experiência de página › Rolagem |
| Nível | Intermediário |
| Tecnologias | HTML, CSS, JavaScript |
| Dependências | lenis |
| Interação | Rolagem, Clique |
| Status | validado em 2026-11-17 |
| Tags | lenis, smooth scroll, rolagem suave, scroll-behavior, âncora, inércia |

## Objetivo visual

Deixar a rolagem com sensação de inércia, comum em sites de portfólio e campanhas.

## Aplicações

- Sites editoriais e de campanha
- Páginas com muitas animações de rolagem
- Menus de âncora

## Como funciona

### Nível 1 — Iniciante

- Rolagem suave faz a página deslizar até o destino em vez de pular de uma vez.
- O Lenis deixa até a roda do mouse com sensação de "peso": a página continua andando um pouquinho depois que você para.
- No modo nativo, só os links do menu deslizam; a roda do mouse continua normal.

### Nível 2 — Intermediário

- No modo Lenis, a biblioteca intercepta a roda do mouse e o trackpad e move a página aos poucos, com inércia (autoRaf cuida do laço de animação).
- duration controla quanto tempo a página leva para "alcançar" o destino; wheelMultiplier controla quanto cada giro da roda anda.
- Os links de âncora chamam lenis.scrollTo, para que a navegação pelo menu também fique suave.
- No modo nativo, só o CSS scroll-behavior: smooth atua: a roda funciona normal e só os saltos de âncora ficam suaves.

### Nível 3 — Avançado

- O Lenis lê o delta do evento wheel, acumula um alvo e interpola a posição a cada quadro; a rolagem continua sendo a do documento, então position: sticky e âncoras funcionam.
- Animações de rolagem (ScrollTrigger) precisam ouvir lenis.on("scroll", ScrollTrigger.update) para não ficarem um quadro atrasadas.
- Elementos com rolagem própria (modais, listas) precisam de data-lenis-prevent, senão o Lenis "rouba" a roda.
- A classe lenis-smooth desliga scroll-behavior: smooth enquanto o Lenis atua, evitando duas suavizações somadas.
- Por acessibilidade, deixe a rolagem suave opcional e sempre desligada com prefers-reduced-motion.

### Glossário do código

| Termo | O que faz |
|---|---|
| `new Lenis` | Cria a rolagem suave com as opções escolhidas. |
| `autoRaf` | O Lenis cuida sozinho do laço de animação (requestAnimationFrame). |
| `wheelMultiplier` | Quanto cada giro da roda do mouse faz a página andar. |
| `lenis.scrollTo` | Rola suavemente até uma âncora ou posição. |
| `scroll-behavior: smooth` | Rolagem suave nativa do CSS para saltos de âncora. |
| `position: sticky` | Mantém o menu grudado no topo enquanto a página rola. |

## Parâmetros

| Controle | Tipo | Padrão | Faixa / opções |
|---|---|---|---|
| rolagem | seleção | lenis | Lenis (com inércia), nativa (só CSS) |
| duração da suavização | range | 1.2s | 0.4–2.4s (passo 0.1) |
| força da roda do mouse | range | 1× | 0.5–2× (passo 0.1) |

## Outra forma de fazer

Só CSS: html { scroll-behavior: smooth; } — sem biblioteca e sem inércia na roda, mas com âncoras suaves e respeitando o sistema.

## Compatibilidade

Lenis 1.3 funciona nos navegadores atuais. scroll-behavior também. Em telas de toque, o Lenis mantém a rolagem nativa por padrão.

## Responsividade

Não depende da largura. Em celulares a rolagem por toque continua nativa.

## Acessibilidade

Com prefers-reduced-motion o Lenis não é iniciado e scroll-behavior volta a auto (saltos instantâneos). Teclado (setas, espaço, Page Down) continua com a rolagem nativa. Rolagem suavizada pode atrapalhar algumas pessoas; use com moderação.

## Performance

Lenis roda um laço de requestAnimationFrame enquanto há rolagem pendente. Custo: lenis.min.js tem 18,8 kB minificado (sem gzip).

## Limitações

- Elementos com rolagem própria dentro da página precisam do atributo data-lenis-prevent.
- position: sticky e fixed continuam funcionando, mas efeitos ligados à rolagem precisam ouvir os eventos do Lenis para ficarem sincronizados.

## Referências

- [Lenis — repositório oficial](https://github.com/darkroomengineering/lenis)
- [MDN — scroll-behavior](https://developer.mozilla.org/en-US/docs/Web/CSS/scroll-behavior)
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
<title>Rolagem suave · Kalixto Creative Lab</title>
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

html { scroll-behavior: smooth; }

.menu {
  position: sticky;
  top: 0;
  z-index: 5;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: rgb(11 10 20 / 0.85);
  backdrop-filter: blur(8px);
}
.menu a {
  padding: 6px 14px;
  border: 1px solid #3a3456;
  border-radius: 999px;
  color: #f4f2ff;
  text-decoration: none;
}
.menu a:focus-visible { outline: 2px solid #22e3ff; outline-offset: 2px; }

.secao {
  display: grid;
  place-items: center;
  min-height: 90vh;
  border-bottom: 1px solid #221d3b;
}
.secao:nth-child(odd) { background: #120f22; }
.secao h2 { font-size: clamp(1.6rem, 6vw, 3rem); }

/* Estilos recomendados pelo Lenis */
html.lenis, html.lenis body { height: auto; }
.lenis.lenis-smooth { scroll-behavior: auto !important; }

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
}
</style>
</head>
<body>
<nav class="menu">
  <a href="#s1">Experimente</a>
  <a href="#s2">Entenda</a>
  <a href="#s3">Codifique</a>
  <a href="#s4">Crie</a>
</nav>

<section class="secao" id="s1"><h2>1. Experimente</h2></section>
<section class="secao" id="s2"><h2>2. Entenda</h2></section>
<section class="secao" id="s3"><h2>3. Codifique</h2></section>
<section class="secao" id="s4"><h2>4. Crie</h2></section>
<script>
// Lenis é carregado antes deste script
const reduzir = window.matchMedia('(prefers-reduced-motion: reduce)');

if (!reduzir.matches) {
  const lenis = new Lenis({
    duration: 1.2,       // segundos para alcançar o destino
    wheelMultiplier: 1, // quanto cada giro da roda anda
    autoRaf: true,         // o próprio Lenis roda o requestAnimationFrame
  });

  // Âncoras do menu também com rolagem suave
  document.querySelectorAll('.menu a').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      lenis.scrollTo(link.getAttribute('href'), { offset: -60 });
    });
  });
}
</script>
</body>
</html>
```

## Versão Angular (valores padrão)

Também em `src/app/efeitos-angular/smooth-scroll/` (compilada e testada com o app).

`smooth-scroll.ts`

```ts
import { Component, DestroyRef, afterNextRender, inject } from '@angular/core';
import Lenis from 'lenis';

@Component({
  selector: 'app-smooth-scroll',
  templateUrl: './smooth-scroll.html',
  styleUrl: './smooth-scroll.css',
})
export class SmoothScroll {
  protected readonly secoes = ["Experimente", "Entenda", "Codifique", "Crie"];
  private lenis?: Lenis;

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      this.lenis = new Lenis({ duration: 1.2, wheelMultiplier: 1, autoRaf: true });
      destroyRef.onDestroy(() => this.lenis?.destroy());
    });
  }

  protected irPara(e: Event, alvo: string): void {
    if (!this.lenis) return; // sem Lenis, o link segue o comportamento nativo
    e.preventDefault();
    this.lenis.scrollTo(alvo, { offset: -60 });
  }
}
```

`smooth-scroll.html`

```html
<nav class="menu">
  @for (s of secoes; track s; let i = $index) {
    <a [href]="'#s' + (i + 1)" (click)="irPara($event, '#s' + (i + 1))">{{ s }}</a>
  }
</nav>

@for (s of secoes; track s; let i = $index) {
  <section class="secao" [id]="'s' + (i + 1)"><h2>{{ i + 1 }}. {{ s }}</h2></section>
}
```

`smooth-scroll.css`

```css
:host { display: block; }
/* no projeto real, coloque no styles.css global: */
/* html { scroll-behavior: smooth; } */

.menu {
  position: sticky;
  top: 0;
  z-index: 5;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: rgb(11 10 20 / 0.85);
  backdrop-filter: blur(8px);
}
.menu a {
  padding: 6px 14px;
  border: 1px solid #3a3456;
  border-radius: 999px;
  color: #f4f2ff;
  text-decoration: none;
}
.menu a:focus-visible { outline: 2px solid #22e3ff; outline-offset: 2px; }

.secao {
  display: grid;
  place-items: center;
  min-height: 90vh;
  border-bottom: 1px solid #221d3b;
}
.secao:nth-child(odd) { background: #120f22; }
.secao h2 { font-size: clamp(1.6rem, 6vw, 3rem); }

/* Estilos recomendados pelo Lenis */
html.lenis, html.lenis body { height: auto; }
.lenis.lenis-smooth { scroll-behavior: auto !important; }

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
}
```
