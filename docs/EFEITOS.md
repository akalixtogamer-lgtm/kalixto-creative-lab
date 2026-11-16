# Registro dos efeitos

Fonte: `src/app/core/data/effects.data.ts`. Os efeitos do CSS Playground são gerados a partir de `css-demos.data.ts`.

| ID | Laboratório | Tópico | Nível | Demo |
|---|---|---|---|---|
| css-transitions | CSS Playground | Transitions | iniciante | ✅ `/labs/css?demo=transitions` |
| css-keyframes | CSS Playground | Keyframes | iniciante | ✅ `?demo=keyframes` |
| css-transform | CSS Playground | Transform | iniciante | ✅ `?demo=transform` |
| css-hover | CSS Playground | Hover | iniciante | ✅ `?demo=hover` |
| css-floating | CSS Playground | Floating | iniciante | ✅ `?demo=floating` |
| css-perspective | CSS Playground | Perspective | intermediário | ✅ `?demo=perspective` |
| css-clip-path | CSS Playground | Clip-path | intermediário | ✅ `?demo=clip-path` |
| css-microinteracoes | CSS Playground | Microinterações | intermediário | ✅ `?demo=microinteracoes` |
| gsap-to | GSAP Studio | gsap.to() | iniciante | ⏳ |
| gsap-timeline | GSAP Studio | Timeline | intermediário | ⏳ |
| gsap-stagger | GSAP Studio | Stagger | intermediário | ⏳ |
| scroll-scrub | Scroll Lab | Scrub | intermediário | ⏳ |
| scroll-pin | Scroll Lab | Pin | intermediário | ⏳ |
| scroll-horizontal | Scroll Lab | Horizontal Scroll | avançado | ⏳ |

Total: 14 catalogados · 8 com demo interativa.

## Como adicionar uma demo ao CSS Playground

1. Adicione um objeto em `CSS_DEMOS` (`css-demos.data.ts`): controles, explicação e função `codigo()`.
2. Adicione um `@case` com o HTML da demo em `css-playground.html`.
3. Escreva o CSS da demo em `css-playground.css` usando as variáveis dos controles (`--dur`, etc.).
4. A biblioteca, o dashboard e os testes por demo se atualizam sozinhos.
