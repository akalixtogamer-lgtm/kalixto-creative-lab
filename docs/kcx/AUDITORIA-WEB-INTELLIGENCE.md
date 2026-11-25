# Auditoria real — KCX Studio antes do Web Intelligence (25/11/2026)

Auditoria feita sobre o código, não sobre a documentação. Base: `main` em `f7706ea` (PR #24).

## 1. Estado do repositório

| Item | Encontrado | Evidência |
|---|---|---|
| Branch de trabalho | `feat/web-intelligence`, criada a partir de `origin/main` (`f7706ea`) | `git log` |
| Alterações não commitadas | Nenhuma no clone de trabalho. Alterações locais no computador do Wallace não são visíveis daqui e não foram tocadas | `git status` |
| Versão no código | `package.json` diz `1.10.0-rc.1`, mas os PRs #13–#17 foram publicados como `v1.16.0-rc.1`…`v1.21.0-rc.1` e o CHANGELOG guardou tudo em “Não publicado”. **Divergência de versão** | `package.json`, `CHANGELOG.md`, `git log` |
| Versão publicada | Último deploy: `4eb82f9` (PR #23, 23/11). O PR #24 (`f7706ea`, “Mensagens e Feedback”) está na `main`, mas **não foi publicado** | Actions → “Publicar no GitHub Pages” |
| README | Desatualizado: fala em 740 testes e “publicada a v1.8.0-rc.1” | `README.md` → Status |
| Testes | 47 arquivos, **1138 testes passando**; `npm run build` e `npm run build:pages` sem erro | `npm test`, `npm run build:pages` |
| Rotas diretas no Pages | `scripts/copiar-404.mjs` copia `index.html` → `404.html` | `scripts/copiar-404.mjs` |

## 2. Funcionalidades

Legenda: ✅ implementada e testada · 🟢 implementada, sem teste automático · 🟡 parcial · 📄 só documentada · ❌ ausente · 🔴 com erro.

| # | Funcionalidade | Situação | Código | Testes |
|---|---|---|---|---|
| 1 | Rotas (31, todas lazy) | ✅ labs, biblioteca, 404 · 🟢 várias rotas `/kcx/*` sem teste de abertura | `src/app/app.routes.ts` | `app.spec.ts`, `kcx.spec.ts` (só `/kcx/:id`, `/kcx/compor`, `/kcx/criar`) |
| 2 | Formato KCX (tipos, schema, validação, serialização, migração) | ✅ | `src/app/kcx/kcx.types.ts`, `kcx.schema.ts`, `validar.ts`, `serializar.ts` | `kcx-core.spec.ts` (27) |
| 3 | Sistema de variáveis (vínculos, operações, runtime sem recarregar) | ✅ | `resolver.ts`, `runtime.ts`, `documento.ts` | `kcx-core.spec.ts`, `valores-atualizacao.spec.ts`, `kcx.spec.ts` (mesmo iframe) |
| 4 | Componentes de referência (6) | ✅ | `kcx/componentes/` | `kcx-core.spec.ts`, `kcx-angular.spec.ts` |
| 5 | Construtor (tipos em 6 categorias, recursos, ícones, logo, vidro, tamanho) | ✅ | `kcx/construtor/` | `construtor.spec.ts`, `fase3.spec.ts`, `vidro.spec.ts`, `tamanho`, `ds`… |
| 6 | Montador visual | ✅ | `construtor/montado.ts`, `pages/kcx/kcx-montador` | `montado.spec.ts` |
| 7 | Editor (`/kcx/:id`): preview, controles, presets, código, variantes, vidro, feedback | ✅ | `pages/kcx/kcx-editor` | `kcx.spec.ts`, `feedback.spec.ts` |
| 8 | **Duplicar componente** (pedido na etapa 5) | ❌ não existe no editor nem no Studio (só presets, telas e versões) | — | — |
| 9 | Compositor (`/kcx/compor`) | ✅ | `kcx/composicao.ts`, `pages/kcx/kcx-compositor` | `kcx.spec.ts` |
| 10 | Figma Bridge (plano, construção, ida e volta, design system, diagramas) | ✅ (simulado) · real no Figma testado manualmente em versões anteriores | `kcx/figma-plano.ts`, `kcx/figma/`, `figma-bridge/` | `figma-bridge.spec.ts` (21), `ler-selecao`, `ler-design-system`, `diagrama`, `tracejado` |
| 11 | Fundação / Design system (tokens, guia, PDF, importar) | ✅ | `kcx/fundacao.ts`, `guia-design-system.ts`, `pdf-design-system.ts` | `fundacao.spec.ts`, `guia…`, `pdf…` |
| 12 | Projeto: briefing, moodboard, mapa e fluxos | ✅ | `kcx/projeto/` | `projeto.spec.ts`, `diagrama.spec.ts` |
| 13 | Moldes de página e Telas (livres, fidelidades) | ✅ | `kcx/projeto/moldes.ts`, `construtor/tela.ts` | `moldes.spec.ts`, `tela.spec.ts`, `alinhar.spec.ts` |
| 14 | Biblioteca de efeitos (56 kits, fichas, Code Lab, .zip, Angular) | ✅ | `core/efeitos/kits/*.kit.ts` | `efeitos.spec.ts`, `fase2.spec.ts` |
| 15 | Reference vs. Reconstruction (`/kcx/comparar`): 4 modos, fidelidade, ajustes, versões, aprovação, Motion Library | ✅ núcleo · 🟢 interface (testada no Chrome com Playwright fora do repositório) | `kcx/comparar/`, `pages/kcx/kcx-comparar` | `comparar.spec.ts` (18) |
| 16 | Entrada de referências: URL, vídeo, imagens, sequência de imagens | 🟡 URL abre em iframe (muitos sites bloqueiam); vídeo aceita `video/*` (MOV/WEBM dependem do navegador); imagens múltiplas sim | `pages/kcx/kcx-comparar` | — |
| 17 | Investigação técnica de sites (DOM, CSS, bibliotecas, recursos, animações, scroll, transições) | ❌ ausente | — | — |
| 18 | Análise temporal de vídeo (reconhecer efeitos automaticamente) | ❌ ausente — só extração manual de frames e marcos | — | — |
| 19 | Ficha técnica por efeito identificado | ❌ ausente (os marcos são anotações livres) | — | — |
| 20 | Reconstrução de efeitos web como componentes KCX | ❌ ausente — não há tipo do construtor para efeitos de rolagem, parallax, sticky etc. | — | — |
| 21 | Efeito → comparação → biblioteca | 🟡 comparação → aprovação → Motion Library existe; falta o começo (análise → efeito → reconstrução) | `kcx/comparar/integracao.ts` | `comparar.spec.ts` |

## 3. Lacunas que esta entrega fecha

1. Investigação de sites (coletor que roda no próprio site, importação de HTML salvo, tentativa direta respeitando CORS) e classificação de tecnologias em **confirmada / provável / não identificada**.
2. Análise temporal de vídeo e imagens (sem DOM) com fichas técnicas por efeito.
3. Tipo do construtor **Efeito de movimento (web)** com 12 efeitos, para reconstruir dentro do formato KCX existente.
4. Fluxo Referência → Análise → Efeitos → Reconstrução → Comparação dentro do `/kcx/comparar`, sem tela nova.
5. Duplicar componente no editor.
6. Teste de abertura de todas as rotas `/kcx/*`.
7. Versão corrigida e documentação atualizada.

O que já funcionava (Figma Bridge, compositor, Reference vs. Reconstruction, moldes, Telas) foi reaproveitado, não refeito.

## 4. Depois da entrega (`v1.22.0-rc.1`)

| # | Lacuna | Situação | Onde |
|---|---|---|---|
| 1 | Investigação de sites | ✅ implementada e testada (jsdom + Chrome real) | `kcx/analise/coletor.ts`, `investigar.ts`, `analise.spec.ts` |
| 2 | Análise temporal de vídeo e imagens | ✅ implementada e testada (sintéticos + gravação real) | `kcx/analise/video.ts`, `video.spec.ts` |
| 3 | Fichas técnicas | ✅ | `kcx/analise/catalogo.ts`, aba Análise |
| 4 | Reconstrução como componente KCX (12 efeitos) | ✅ implementada e testada (os 12 se movem no Chrome) | `construtor/tipos/movimento/efeito-web.ts`, `construtor.spec.ts`, `analise.spec.ts` |
| 5 | Efeito → comparação → Motion Library | ✅ testado no Chrome | `pages/kcx/kcx-comparar/cmp-analise.*` |
| 6 | Duplicar componente | ✅ | `kcx/meus-componentes.ts` (`duplicarComponente`), editor |
| 7 | Rotas `/kcx/*` | ✅ teste de abertura de todas | `pages/kcx/kcx.spec.ts` |
| 8 | Versão | ✅ `1.22.0-rc.1` no `package.json` e no CHANGELOG | — |
| — | Auditoria axe das telas novas | ⏳ não rodada | — |
