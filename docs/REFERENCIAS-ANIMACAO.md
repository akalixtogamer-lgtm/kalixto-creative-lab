# Referências de animação — mapa dos Reels (17/11/2026)

Quatro gravações de tela de anúncios do Instagram, decupadas quadro a quadro.
Para cada animação: **o que aparece**, **a técnica por trás** e **onde ela está no lab**.

Legenda do status: ✅ kit novo nesta versão · 🔁 já existia no lab · 🧪 planejado (ainda não implementado)

---

## Vídeo 1 — "Do Design ao Deploy" (@lucasmarte.ia · 76 s)

Reel de workshop: apresentador falando + inserts em motion design sobre fundo preto.

| # | O que aparece | Técnica | No lab |
|---|---|---|---|
| 1.1 | Legenda palavra por palavra, centralizada, com a palavra da vez em destaque | Kinetic typography: split em palavras + `animation-delay` por índice | ✅ [`kinetic-captions`](../src/app/core/efeitos/kits/kinetic-captions.kit.ts) |
| 1.2 | Telas de app em traço fino, em vista isométrica, que se montam e se separam em camadas | CSS 3D: `rotateX` + `rotateZ(-45deg)` + `translateZ` por camada | ✅ [`isometric-layers`](../src/app/core/efeitos/kits/isometric-layers.kit.ts) |
| 1.3 | Palavra manuscrita vermelha com brilho ("hand-off") no meio da frase | SVG `stroke-dashoffset` + `drop-shadow` + oscilação de neon | ✅ [`neon-handwriting`](../src/app/core/efeitos/kits/neon-handwriting.kit.ts) |
| 1.4 | Letreiro gigante em pincel ("Design / Deploy") cortado pelas bordas, atrás do apresentador | Tipografia vazada + texto atrás do objeto | 🔁 Interface Lab → *Texto atrás do objeto* e *Tipografia vazada* |
| 1.5 | Linhas finas conectando as telas (fluxo Figma → MCP → Supabase → Vercel) | SVG path com traço animado | 🔁 SVG Lab → *Traço* e *Motion path* |

## Vídeo 2 — "Sites cinematográficos" (anúncio de treinamento · 40 s)

Site de moda fictício: o mesmo personagem 3D em quatro "mundos" de cor.

| # | O que aparece | Técnica | No lab |
|---|---|---|---|
| 2.1 | O hero troca de cenário (lima → fogo → gelo → noite) com uma explosão de cor | Camadas com `clip-path: circle()` animado a partir do clique | ✅ [`theme-wipe`](../src/app/core/efeitos/kits/theme-wipe.kit.ts) |
| 2.2 | Título enorme cortado pelo personagem ("SWITCH THE LOOK") | Texto atrás do objeto (recorte em PNG por cima do título) | 🔁 Interface Lab → *Texto atrás do objeto* |
| 2.3 | Faixas de tecido/fumaça atravessando a tela na transição | Vídeo ou sequência de imagens em `<canvas>` | 🧪 *Image sequence no scroll* |

## Vídeo 3 — "Seu próximo projeto pode ir além" (@luccas2santos · 25 s)

Três sites gravados no notebook.

| # | O que aparece | Técnica | No lab |
|---|---|---|---|
| 3.1 | Hero editorial "More Than Fashion" com foto em camadas e título serifado | Parallax em camadas + hero editorial | 🔁 Kit `layered-parallax` + Interface Lab → *Hero editorial* |
| 3.2 | Fita curva de imagens girando em volta do título "We design / Really fast" | Cilindro CSS 3D: `rotateY(i × 360° ÷ n)` + `translateZ(raio)` | ✅ [`image-ribbon`](../src/app/core/efeitos/kits/image-ribbon.kit.ts) |
| 3.3 | "The Pod / The Ferment": grãos de café caindo com motion blur, troca de capítulo com desfoque | Sequência de quadros no scroll (canvas) + transição com blur | 🔁 Scroll Lab → *Storytelling* e *Capítulos* · 🧪 *Image sequence no scroll* |

## Vídeo 4 — "Copie o prompt" (@profitize.ai · 41 s)

Sites gerados por IA, gravados na tela do notebook.

| # | O que aparece | Técnica | No lab |
|---|---|---|---|
| 4.1 | "SOPRO" gigante com mancha de tinta que se espalha | SVG com filtro gooey (`feGaussianBlur` + `feColorMatrix`) | 🔁 SVG Lab → *Filtros* · 🧪 *Mancha de tinta* |
| 4.2 | Título "TRABALHOS" inflado, com volume, letras que respiram | `text-shadow` em camadas + `scale` animado | ✅ [`puffy-text`](../src/app/core/efeitos/kits/puffy-text.kit.ts) |
| 4.3 | Contadores (140 / 9 / 13) | Números animados | 🔁 Interface Lab → *Números* |
| 4.4 | Corredor 3D com vídeo no fundo | Caixa CSS 3D (5 faces com `perspective`) | 🧪 *Sala 3D* |
| 4.5 | Ícones 3D vermelhos e azuis flutuando ("Bora encher essa ideia?") | Modelos 3D (Spline/Three.js) + flutuação | 🔁 Three.js Lab → *GLTF* e *Animação* |
| 4.6 | Óculos que seguem o mouse: tudo embaçado fora das lentes, nítido e ampliado dentro | Duas camadas: `filter: blur()` embaixo, `mask-image` + `scale()` em cima | ✅ [`lens-focus`](../src/app/core/efeitos/kits/lens-focus.kit.ts) |
| 4.7 | Texto embaçado que entra em foco ("Agende seu exame") | Split em letras + `filter: blur()` → 0 | 🔁 Kit `text-reveal` (efeito *desfocar*) |
| 4.8 | Galeria de sites em grade | Bento grid | 🔁 Interface Lab → *Bento* |

---

## Próximos kits sugeridos (🧪)

1. **Image sequence no scroll** — quadros de um vídeo desenhados num `<canvas>` conforme a rolagem (técnica dos sites de produto; cobre 2.3 e 3.3).
2. **Mancha de tinta (gooey)** — círculos SVG com filtro gooey que se fundem e crescem atrás de um título (4.1).
3. **Sala 3D** — corredor em CSS 3D com um vídeo na parede do fundo e câmera que avança no scroll (4.4).

---

## Onde encontrar mais referências de animação

**Galerias de sites com movimento (veja em vídeo, não em print)**
- [Awwwards — Animated websites](https://www.awwwards.com/websites/animation/) e a seção *Elements* (recortes de animação isolados)
- [Recent (antigo Godly)](https://godly.website) — sites mostrados em vídeo curto
- [Landing.love](https://www.landing.love) — landing pages escolhidas pela animação
- [Framer Gallery — Animations](https://framer.com/gallery/styles/animations)
- [Made With GSAP](https://madewithgsap.com) — efeitos prontos com GSAP, um por página
- [GSAP Showcase](https://gsap.com/showcase/)
- [SiteInspire](https://www.siteinspire.com), [Httpster](https://httpster.net), [Minimal Gallery](https://minimal.gallery), [Land-book](https://land-book.com), [Lapa Ninja](https://www.lapa.ninja), [One Page Love](https://onepagelove.com)

**Tutoriais com código (para reproduzir no lab)**
- [Codrops](https://tympanus.net/codrops/) — demos de efeitos com artigo explicando passo a passo
- [CodePen — Trending](https://codepen.io/trending) e as coleções de *Creative Coding*
- [Three.js Examples](https://threejs.org/examples/) e [Shadertoy](https://www.shadertoy.com) (shaders GLSL)
- [Motion — Examples](https://motion.dev/examples) (animações de UI)

**Microinterações e UI de app**
- [Mobbin](https://mobbin.com) — fluxos de apps reais, com gravações
- [Ripplix](https://ripplix.com) — só animações de UI e microinterações
- [Uiverse](https://uiverse.io) — componentes animados em HTML/CSS de código aberto
- [Dribbble — Motion](https://dribbble.com/tags/motion) e [Behance — Motion Graphics](https://www.behance.net/galleries/motion)

**3D e motion design**
- [Spline Community](https://spline.design/community) — cenas 3D web para remixar
- [Awwwards Academy](https://www.awwwards.com/academy/) — cursos curtos de creative development

> Dica de estudo: abra a referência, grave 5 s da tela, decupe quadro a quadro (como neste documento) e só então procure a técnica no lab.
