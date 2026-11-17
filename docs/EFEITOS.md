# Registro dos efeitos

Gerado a partir dos arquivos `src/app/core/data/*-demos.data.ts` (a fonte única).
Cada demo tem controles, Executar/Reiniciar (ou é ao vivo), Code Viewer, explicação, dica, presets e um desafio.
**Total: 43 demos interativas em 6 laboratórios.**


## CSS Playground — `/labs/css` (8 demos)

| Demo | Tópico | Nível | Link direto |
|---|---|---|---|
| 1. Transição entre dois estados | Transitions | iniciante | `/labs/css?demo=transitions` |
| 2. Animação com @keyframes | Keyframes | iniciante | `/labs/css?demo=keyframes` |
| 3. Mover, girar, escalar e inclinar | Transform | iniciante | `/labs/css?demo=transform` |
| 4. Estados de hover em botões | Hover | iniciante | `/labs/css?demo=hover` |
| 5. Elemento flutuante | Floating | iniciante | `/labs/css?demo=floating` |
| 6. Card 3D com perspectiva | Perspective | intermediário | `/labs/css?demo=perspective` |
| 7. Revelação com clip-path | Clip-path | intermediário | `/labs/css?demo=clip-path` |
| 8. Curtir e interruptor | Microinterações | intermediário | `/labs/css?demo=microinteracoes` |

## GSAP Studio — `/labs/gsap` (7 demos)

| Demo | Tópico | Nível | Link direto |
|---|---|---|---|
| 1. Animar até um estado final | gsap.to() | iniciante | `/labs/gsap?demo=to` |
| 2. Entrar a partir de um estado inicial | gsap.from() | iniciante | `/labs/gsap?demo=from` |
| 3. Definir início e fim | gsap.fromTo() | iniciante | `/labs/gsap?demo=fromto` |
| 4. Sequência com Timeline | Timeline | intermediário | `/labs/gsap?demo=timeline` |
| 5. Entrada em cascata | Stagger | intermediário | `/labs/gsap?demo=stagger` |
| 6. Curvas de easing | Easing | intermediário | `/labs/gsap?demo=easing` |
| 7. Play, pause, reverse e progresso | Controles de reprodução | intermediário | `/labs/gsap?demo=reproducao` |

## Scroll Lab — `/labs/scroll` (7 demos)

| Demo | Tópico | Nível | Link direto |
|---|---|---|---|
| 1. Disparar animação ao rolar | ScrollTrigger | iniciante | `/labs/scroll?demo=gatilho` |
| 2. Animação presa à barra de rolagem | Scrub | intermediário | `/labs/scroll?demo=scrub` |
| 3. Fixar uma seção enquanto anima | Pin | intermediário | `/labs/scroll?demo=pin` |
| 4. Camadas em velocidades diferentes | Parallax | intermediário | `/labs/scroll?demo=parallax` |
| 5. Rolagem vertical vira horizontal | Horizontal Scroll | avançado | `/labs/scroll?demo=horizontal` |
| 6. Barra de progresso de leitura | Scroll Progress | iniciante | `/labs/scroll?demo=progresso` |
| 7. Contar uma história com a rolagem | Scroll Storytelling | avançado | `/labs/scroll?demo=storytelling` |

## SVG Lab — `/labs/svg` (5 demos)

| Demo | Tópico | Nível | Link direto |
|---|---|---|---|
| 1. Desenhar o traço | Stroke animation | iniciante | `/labs/svg?demo=stroke` |
| 2. Revelar com máscara | Máscaras | intermediário | `/labs/svg?demo=mascara` |
| 3. Transformar uma forma em outra | Morphing | intermediário | `/labs/svg?demo=morph` |
| 4. Distorção com filtros SVG | Filtros | avançado | `/labs/svg?demo=filtros` |
| 5. Seguir um caminho | Motion Path | intermediário | `/labs/svg?demo=motion-path` |

## Three.js Lab — `/labs/three` (9 demos)

| Demo | Tópico | Nível | Link direto |
|---|---|---|---|
| 1. Cena, câmera, renderizador e um objeto | Objetos geométricos | iniciante | `/labs/three?demo=geometria` |
| 2. Campo de visão e distância | Câmeras | iniciante | `/labs/three?demo=camera` |
| 3. Luz ambiente, direcional e pontual | Iluminação | intermediário | `/labs/three?demo=iluminacao` |
| 4. Como a superfície reage à luz | Materiais | intermediário | `/labs/three?demo=materiais` |
| 5. Imagens na superfície | Texturas | intermediário | `/labs/three?demo=texturas` |
| 6. GSAP animando objetos 3D | Animações 3D | intermediário | `/labs/three?demo=animacao` |
| 7. Objeto que segue o ponteiro | Interação por mouse | intermediário | `/labs/three?demo=mouse` |
| 8. Descobrir em qual objeto o mouse está | Raycasting | avançado | `/labs/three?demo=raycasting` |
| 9. Importar um modelo 3D | Modelos GLTF/GLB | avançado | `/labs/three?demo=gltf` |

## WebGL & GLSL — `/labs/webgl` (7 demos)

| Demo | Tópico | Nível | Link direto |
|---|---|---|---|
| 1. Pintar cada pixel com código | Fragment Shaders | intermediário | `/labs/webgl?demo=fragment` |
| 2. Mover os vértices de uma malha | Vertex Shaders | intermediário | `/labs/webgl?demo=vertex` |
| 3. Formas com matemática | GLSL | intermediário | `/labs/webgl?demo=glsl` |
| 4. Ruído e fbm | Noise | avançado | `/labs/webgl?demo=noise` |
| 5. Distorcer uma imagem | Distortion | avançado | `/labs/webgl?demo=distortion` |
| 6. Plasma e Voronoi | Efeitos procedurais | avançado | `/labs/webgl?demo=procedural` |
| 7. Trocar de imagem com ruído | Transições com shaders | avançado | `/labs/webgl?demo=transicao` |

## Como adicionar uma demo

1. Acrescente o objeto da demo no arquivo de dados do laboratório (controles, explicação, `codigo()`, presets e desafio).
2. Implemente o efeito no componente do lab (palco no HTML + animação/cena com o mesmo `id`).
3. Rode `npm test`: o teste de integridade confere se presets e desafios usam valores válidos.

A Biblioteca, a Trilha, o Dashboard e o menu se atualizam sozinhos.
