# Relatório de QA — Fase 6

Data: 16/11/2026 · Versão: `1.0.0-rc.1`

## 1. Testes automáticos (`npm test`)

**233 testes passando**, em 9 arquivos:

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
