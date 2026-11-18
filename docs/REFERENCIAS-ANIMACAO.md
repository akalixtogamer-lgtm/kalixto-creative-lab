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
| 2.3 | Faixas de tecido/fumaça atravessando a tela na transição | Vídeo ou sequência de imagens em `<canvas>` | ✅ [`image-sequence`](../src/app/core/efeitos/kits/image-sequence.kit.ts) |

## Vídeo 3 — "Seu próximo projeto pode ir além" (@luccas2santos · 25 s)

Três sites gravados no notebook.

| # | O que aparece | Técnica | No lab |
|---|---|---|---|
| 3.1 | Hero editorial "More Than Fashion" com foto em camadas e título serifado | Parallax em camadas + hero editorial | 🔁 Kit `layered-parallax` + Interface Lab → *Hero editorial* |
| 3.2 | Fita curva de imagens girando em volta do título "We design / Really fast" | Cilindro CSS 3D: `rotateY(i × 360° ÷ n)` + `translateZ(raio)` | ✅ [`image-ribbon`](../src/app/core/efeitos/kits/image-ribbon.kit.ts) |
| 3.3 | "The Pod / The Ferment": grãos de café caindo com motion blur, troca de capítulo com desfoque | Sequência de quadros no scroll (canvas) + transição com blur | ✅ [`image-sequence`](../src/app/core/efeitos/kits/image-sequence.kit.ts) · 🔁 Scroll Lab → *Storytelling* e *Capítulos* |

## Vídeo 4 — "Copie o prompt" (@profitize.ai · 41 s)

Sites gerados por IA, gravados na tela do notebook.

| # | O que aparece | Técnica | No lab |
|---|---|---|---|
| 4.1 | "SOPRO" gigante com mancha de tinta que se espalha | SVG com filtro gooey (`feGaussianBlur` + `feColorMatrix`) | ✅ [`gooey-ink`](../src/app/core/efeitos/kits/gooey-ink.kit.ts) · 🔁 SVG Lab → *Filtros* |
| 4.2 | Título "TRABALHOS" inflado, com volume, letras que respiram | `text-shadow` em camadas + `scale` animado | ✅ [`puffy-text`](../src/app/core/efeitos/kits/puffy-text.kit.ts) |
| 4.3 | Contadores (140 / 9 / 13) | Números animados | 🔁 Interface Lab → *Números* |
| 4.4 | Corredor 3D com vídeo no fundo | Caixa CSS 3D (5 faces com `perspective`) | ✅ [`room-3d`](../src/app/core/efeitos/kits/room-3d.kit.ts) |
| 4.5 | Ícones 3D vermelhos e azuis flutuando ("Bora encher essa ideia?") | Modelos 3D (Spline/Three.js) + flutuação | 🔁 Three.js Lab → *GLTF* e *Animação* |
| 4.6 | Óculos que seguem o mouse: tudo embaçado fora das lentes, nítido e ampliado dentro | Duas camadas: `filter: blur()` embaixo, `mask-image` + `scale()` em cima | ✅ [`lens-focus`](../src/app/core/efeitos/kits/lens-focus.kit.ts) |
| 4.7 | Texto embaçado que entra em foco ("Agende seu exame") | Split em letras + `filter: blur()` → 0 | 🔁 Kit `text-reveal` (efeito *desfocar*) |
| 4.8 | Galeria de sites em grade | Bento grid | 🔁 Interface Lab → *Bento* |

## Vídeo 5 — "IA só faz site genérico?" (@luccas2santos · 27 s)

Dois sites gravados no notebook: uma marca de sementes de milho e uma transportadora (projeto demonstrativo).

| # | O que aparece | Técnica | No lab |
|---|---|---|---|
| 5.1 | "CORN. REVOLUTIONIZED." se montando em blocos, como pixels de LED, até ficar nítido | Texto amostrado em canvas (`getImageData`) e redesenhado célula a célula | ✅ [`pixel-text`](../src/app/core/efeitos/kits/pixel-text.kit.ts) |
| 5.2 | Pontos de luz verdes flutuando, ligados por linhas finas ("Computers cut down the contenders") | Partículas em canvas + linhas entre vizinhos próximos | ✅ [`particle-field`](../src/app/core/efeitos/kits/particle-field.kit.ts) |
| 5.3 | Parede de pequenas células verdes acendendo atrás de "Testing, testing and more testing" | CSS Grid com atraso por célula (aleatório, diagonal, centro) | ✅ [`tile-grid-reveal`](../src/app/core/efeitos/kits/tile-grid-reveal.kit.ts) |
| 5.4 | Broto de milho crescendo / semente que vira planta conforme a rolagem | Sequência de quadros no scroll | 🔁 Kit `image-sequence` |
| 5.5 | Grão de milho 3D flutuando sobre um pôr do sol | Modelo 3D + flutuação | 🔁 Three.js Lab → *GLTF* e *Animação* |
| 5.6 | Links do rodapé centralizados entrando um a um | Revelação em sequência (stagger) | 🔁 Kit `text-reveal` / GSAP Studio → *Stagger* |
| 5.7 | Caminhão em vídeo de fundo com o título "O mundo não para" empilhado e cortado pela imagem | Hero com vídeo + texto atrás do objeto | 🔁 Interface Lab → *Texto atrás do objeto* · kit `scroll-zoom-hero` |
| 5.8 | "Logística que conecta o Brasil" surgindo palavra por palavra sobre a estrada | Kinetic typography | 🔁 Kit `kinetic-captions` |
| 5.9 | Contador de quilômetros | Números animados | 🔁 Interface Lab → *Números* |
| 5.10 | Troca de cena com desfoque entre seções | Transição com blur entre capítulos | 🔁 Scroll Lab → *Capítulos* |

## Vídeo 6 — Proposta comercial "Site completo" (@tommello.edit · 23 s)

Página de proposta comercial gravada no notebook, com portfólio rodando ao fundo.

| # | O que aparece | Técnica | No lab |
|---|---|---|---|
| 6.1 | Bolha de vidro passando sobre "Mateus Souza": dentro dela as letras viram itálico com serifa | Duas cópias do título com máscaras opostas + bolha com `backdrop-filter` | ✅ [`liquid-glass-lens`](../src/app/core/efeitos/kits/liquid-glass-lens.kit.ts) |
| 6.2 | Hélice de DNA de partículas rosa e azul girando atrás dos cards do portfólio | Hélice paramétrica em canvas com profundidade por tamanho/opacidade | ✅ [`particle-helix`](../src/app/core/efeitos/kits/particle-helix.kit.ts) |
| 6.3 | "Site completo" e "R$ 3.000" chegando com cópias empilhadas que se juntam, sobre uma aura laranja | Ecos com `--i` (deslocamento e transparência) + aura com blur | ✅ [`echo-text`](../src/app/core/efeitos/kits/echo-text.kit.ts) |
| 6.4 | Card de vidro com feixes de luz de palco ("Sua operação…") | Feixes com `clip-path` + `rotate` a partir do topo, somados com `screen` | ✅ [`light-beams`](../src/app/core/efeitos/kits/light-beams.kit.ts) |
| 6.5 | "o céu mudou de dono" falhando sobre um card laranja | Glitch RGB com pseudo-elementos e `clip-path: inset()` | ✅ [`glitch-text`](../src/app/core/efeitos/kits/glitch-text.kit.ts) |
| 6.6 | Galáxia azul de partículas com cursor em anel | Partículas + cursor personalizado | 🔁 Kits `particle-field` e `custom-cursor` |
| 6.7 | Cards de projeto em vidro, inclinados, passando em 3D | Cards em perspectiva | 🔁 Kits `card-tilt` e `image-ribbon` |
| 6.8 | Portal circular com borda brilhante mostrando o mar | Imagem recortada em forma | 🔁 Interface Lab → *Imagem em formas* |
| 6.9 | Etapas do processo (coleta, layout, aprovação) entrando em colunas | Revelação em sequência | 🔁 Kit `text-reveal` / GSAP Studio → *Stagger* |

---

## As animações mais usadas hoje (importadas para o lab)

Escolhidas cruzando as galerias abaixo (Awwwards, Recent/Godly, Landing.love, Made With GSAP, Codrops) com levantamentos de tendências de 2026: scroll storytelling, seções presas (sticky) e cards empilhados, tipografia cinética, bento grids e microinterações aparecem em todas. Todas foram reescritas do zero para o lab — nenhum código de terceiros foi copiado.

| Animação | Por que está em alta | No lab |
|---|---|---|
| Cards empilhados no scroll | Organiza etapas, serviços e cases um por vez; presente em quase todo site de agência | ✅ [`sticky-stack`](../src/app/core/efeitos/kits/sticky-stack.kit.ts) |
| Hero que abre no scroll (imagem pequena → tela cheia) | A "entrada de cena" dos sites cinematográficos | ✅ [`scroll-zoom-hero`](../src/app/core/efeitos/kits/scroll-zoom-hero.kit.ts) |
| Sequência de quadros no scroll | O efeito "Apple" de produto girando/explodindo | ✅ [`image-sequence`](../src/app/core/efeitos/kits/image-sequence.kit.ts) |
| Texto embaralhado (decode) | Assinatura de portfólios dev e menus de agência | ✅ [`text-scramble`](../src/app/core/efeitos/kits/text-scramble.kit.ts) |
| Loader com contador 0 → 100 | Intro clássica dos sites premiados | ✅ [`preloader-counter`](../src/app/core/efeitos/kits/preloader-counter.kit.ts) |
| Lista com imagem que segue o cursor | Padrão de lista de projetos em portfólios | ✅ [`hover-image-list`](../src/app/core/efeitos/kits/hover-image-list.kit.ts) |
| Cards com luz que segue o mouse | Acabamento de bento grids e páginas de SaaS | ✅ [`spotlight-cards`](../src/app/core/efeitos/kits/spotlight-cards.kit.ts) |
| Galeria sanfona | Muitas categorias num espaço pequeno | ✅ [`expanding-gallery`](../src/app/core/efeitos/kits/expanding-gallery.kit.ts) |
| Mancha de tinta viva (gooey) | Heros orgânicos de estúdios criativos | ✅ [`gooey-ink`](../src/app/core/efeitos/kits/gooey-ink.kit.ts) |
| Sala 3D em CSS | Showrooms e "case em destaque" | ✅ [`room-3d`](../src/app/core/efeitos/kits/room-3d.kit.ts) |

Já existiam no lab e também estão entre as mais usadas: marquee infinito, cursor personalizado, botão magnético, revelar ao rolar, parallax, rolagem suave (Lenis), bento grid, números animados e texto revelado por letras.

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
