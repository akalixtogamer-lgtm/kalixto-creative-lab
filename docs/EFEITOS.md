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
| gsap-to | GSAP Studio | gsap.to() | iniciante | ✅ `/labs/gsap?demo=to` |
| gsap-from | GSAP Studio | gsap.from() | iniciante | ✅ `?demo=from` |
| gsap-fromto | GSAP Studio | gsap.fromTo() | iniciante | ✅ `?demo=fromto` |
| gsap-timeline | GSAP Studio | Timeline | intermediário | ✅ `?demo=timeline` |
| gsap-stagger | GSAP Studio | Stagger | intermediário | ✅ `?demo=stagger` |
| gsap-easing | GSAP Studio | Easing | intermediário | ✅ `?demo=easing` |
| gsap-reproducao | GSAP Studio | Controles de reprodução | intermediário | ✅ `?demo=reproducao` |
| scroll-scrub | Scroll Lab | Scrub | intermediário | ⏳ |
| scroll-pin | Scroll Lab | Pin | intermediário | ⏳ |
| scroll-horizontal | Scroll Lab | Horizontal Scroll | avançado | ⏳ |

Total: 18 catalogados · 15 com demo interativa.

## Como adicionar uma demo ao CSS Playground

1. Adicione um objeto em `CSS_DEMOS` (`css-demos.data.ts`): controles, explicação e função `codigo()`.
2. Adicione um `@case` com o HTML da demo em `css-playground.html`.
3. Escreva o CSS da demo em `css-playground.css` usando as variáveis dos controles (`--dur`, etc.).
4. A biblioteca, o dashboard e os testes por demo se atualizam sozinhos.

## Como adicionar uma demo ao GSAP Studio

1. Dados em `GSAP_DEMOS` (`gsap-demos.data.ts`): controles, explicação e `codigo()`.
2. Animação em `pages/gsap-studio/gsap-animacoes.ts` (função com o mesmo id).
3. HTML do palco num `@case` em `gsap-studio.html` e aparência em `gsap-studio.css`.
