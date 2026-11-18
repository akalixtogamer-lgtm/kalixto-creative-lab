# Relatório de QA — Fase 6

Data: 16/11/2026 · Versão: `1.0.0-rc.1`

## 1. Testes automáticos (`npm test`)

**608 testes passando**, em 11 arquivos (17/11/2026):

| Arquivo | O que cobre |
|---|---|
| `app.spec.ts` | Navegação de todas as rotas, 404, integridade dos laboratórios |
| `demos.spec.ts` | Para as 43 demos: presets e desafios usam valores possíveis; desafio não começa resolvido; código sem `undefined` |
| `css-playground.spec.ts` | 8 demos, controles → código, Executar/Reiniciar, biblioteca → demo |
| `gsap-studio.spec.ts` | 7 demos, from() aplica estado inicial, Reiniciar desfaz, curva de easing, player |
| `scroll-lab.spec.ts` | 7 demos, painéis do horizontal, presets |
| `fase3.spec.ts` | SVG Lab, progresso salvo, desafios, presets do usuário, Trilha, Exercícios, Comparador |
| `three-lab.spec.ts` | 9 demos, código, demos ao vivo, desafio automático, aviso sem WebGL |
| `glsl-lab.spec.ts` | 7 demos; todo uniform controlado existe no shader |
| `efeitos.spec.ts` | 15 categorias; 10 kits: ficha completa, padrões válidos, código sem `undefined`/`NaN`, **cada controle altera o código**, `prefers-reduced-motion`; todas as demos classificadas; sandbox/CSP; páginas `/efeitos/:id` e Biblioteca |
| `fase2.spec.ts` | Os 10 componentes Angular compilam e renderizam; CSS Angular igual ao do kit; 3 níveis + glossário presente no código; CRC-32 de referência; ZIP; diff; realce; pacote; fluxo editar → executar → comparar → restaurar; modo Angular |
| `ui-lab.spec.ts` | 13 demos do Interface Lab; caminhos dos 17 divisores; bento; tipografia |

> O ambiente de testes (jsdom) não tem WebGL nem layout real. Por isso as cenas 3D, os shaders e a rolagem
> foram conferidos também num Chromium real (seção 2).

## 2. Conferência no navegador (Chromium com WebGL)

- As 43 demos executadas uma a uma, com captura de tela do palco depois de Executar.
- Interações: rolagem automática do Scroll Lab, hover do raycasting, mouse na distorção, player do GSAP.
- Shaders: compilam sem erros no console.
- Troca de demo no meio de uma animação: nenhum estilo do GSAP sobra nos elementos.

## 3. Responsividade

14 páginas × 3 larguras (390 px celular, 820 px tablet, 1440 px desktop):
- **Nenhuma rolagem horizontal.**
- Alvos de toque com pelo menos 32 px no celular.
- Menu do celular abre, fecha (✕, clique fora, Esc, ao navegar) e deixa o conteúdo de trás inativo (`inert`).

Corrigido nesta fase: textos para leitores de tela alargando a página; link "Pular para o conteúdo" cobrindo
o botão do menu; textos do topo do Dashboard passando por baixo da logo.

## 4. Acessibilidade (axe-core 4, WCAG 2.1 A/AA + boas práticas)

**0 violações** nas 19 páginas/demos auditadas, nas 13 demos do Interface Lab e com o menu do celular aberto.

Corrigido nesta fase:
- Contraste: texto branco sobre o magenta da marca dava 3,2:1. Botões e marcadores com texto branco agora usam
  `--kx-gradient-btn` (todas as cores ≥ 4,5:1). O magenta original continua nos acentos e brilhos.
- `aria-label` em elementos sem papel (notas do Comparador, gradiente do Design System) → `role="img"`.

Já existente: link "Pular para o conteúdo", foco visível, `aria-current` no menu e nas demos, rótulos em todos
os controles, `role="switch"` no interruptor, `aria-live` no contador de resultados e nos feedbacks, textos
alternativos nos palcos 3D.

## 5. Performance

| Medida | Valor |
|---|---|
| Carregamento inicial (comprimido) | **~78 kB** |
| GSAP Studio / Scroll Lab / SVG Lab | 4 kB / 21 kB / 17 kB extras |
| Three.js Lab + GLSL (Three.js compartilhado) | ~140 kB extras, só nessas rotas |
| Modelo 3D | 147 kB |

O palco 3D pausa fora da tela e com a aba escondida; densidade de pixels limitada a 2x.

## 6. GitHub Pages

`npm run build:pages` testado num servidor que imita o Pages (subpasta `/kalixto-creative-lab/` e `404.html`):
links diretos para labs e demos abrem certo; logo, texturas e o modelo `.glb` carregam sem erro.

## 7. Biblioteca técnica · Fase 1 (17/11/2026)

Verificado no Chromium (Playwright), sobre o build de produção:

| Verificação | Resultado |
|---|---|
| Os 10 previews carregam no iframe | ✅ 10/10 |
| Magnético: aproximar o mouse gera `translate(...)` | ✅ `translate(13.36px, 6.56px)` |
| Card tilt: mouse no canto gera rotação | ✅ `--ry: 8.17deg` |
| Borda animada: o ângulo avança com o tempo | ✅ 120° → 166° em 0,5 s |
| Gradiente: `background-position` muda | ✅ 3,5% → 8,4% |
| Text Reveal: partes criadas | ✅ 32 letras |
| Sincronia: mudar duração para 1500 ms | ✅ aparece no preview e na aba CSS, que são idênticos |
| Isolamento: `localStorage`, `parent.document`, `fetch` dentro do preview | ✅ todos bloqueados |
| axe na página e dentro dos 10 previews | ✅ 0 violações |
| Overflow horizontal em 390, 820 e 1440 px (`/biblioteca`, `/efeitos/text-reveal`, `/efeitos/card-tilt`) | ✅ 0 px |
| `ng build` | ✅ sem avisos |

## 8. Biblioteca técnica · Fase 2 (17/11/2026)

| Verificação (Chromium, build de produção) | Resultado |
|---|---|
| Modo Angular dos 10 kits renderiza | ✅ 10/10 |
| Magnético Angular: `translate(...)` ao aproximar | ✅ `translate(11.6px, 4.8px)` |
| Tilt Angular: `--ry` ao mover | ✅ `8.25deg` |
| Borda Angular: `@property` anima com encapsulamento do Angular | ✅ 78° → 123° |
| Keyframes renomeados pelo Angular continuam funcionando | ✅ (`_ngcontent-…_fade-in`, `_pulsar`, `_revelar`) |
| Editar CSS e executar: cor do botão no preview | ✅ `rgb(0, 128, 0)` |
| Diff mostra só a linha trocada | ✅ 1 removida, 1 adicionada |
| ZIP: `testzip()` do Python e 7 arquivos | ✅ |
| `index.html` do pacote aberto direto do disco | ✅ aplica `styles.css` |
| Erros no console durante tudo isso | ✅ nenhum |
| axe: modo Angular, editando, comparando, `/labs/css`, `/labs/gsap`, `/comparador`, `/biblioteca` | ✅ 0 violações |
| Overflow horizontal em 390 e 820 px | ✅ 0 px |
| Pacote inicial | ✅ 294,34 kB (igual à Fase 1) |

## 9. Biblioteca técnica · Fase 3 (17/11/2026)

| Verificação (Chromium, build de produção) | Resultado |
|---|---|
| Revelar (IO): cards ganham `is-visivel` ao rolar o iframe | ✅ 3 → 6 |
| Progresso: barra cheia no fim da rolagem | ✅ `matrix(1, 0, 0, 1, 0, 0)` |
| Parallax: camadas com velocidades diferentes | ✅ `translateY` 168 / 98 / 56 px |
| GSAP: bibliotecas embutidas e card revelado ao rolar | ✅ `gsap` e `ScrollTrigger` definidos; opacidade 0 → 0,98 |
| Lenis: classe `lenis` no `<html>` e rolagem funcionando | ✅ |
| Cursor: anel atrasado em relação ao ponto | ✅ |
| Lanterna: `--x`/`--y` seguem o mouse | ✅ |
| Distorção: `scale` 0 → 29,9 no hover, volta a 0,09 ao sair, 29,8 com foco | ✅ |
| Botão Angular desabilitado nos 5 kits de página rolável; renderiza nos outros 3 | ✅ |
| ZIP do kit GSAP: 9 arquivos com `vendor/`; `index.html` aberto do disco carrega as bibliotecas | ✅ |
| Isolamento com bibliotecas embutidas | ✅ `SecurityError` / `TypeError` |
| Erros no console | ✅ nenhum |
| axe nas páginas dos 8 kits | ✅ 0 violações |
| Overflow horizontal em 1440, 820 e 390 px | ✅ 0 |
| `npm test` | ✅ 398 testes |
| `npm audit --omit=dev` | ✅ 0 vulnerabilidades |
