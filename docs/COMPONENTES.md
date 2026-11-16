# Design System e componentes

Visualização ao vivo: rota `/design-system`.

## Tokens (`src/styles/tokens.css`)

| Grupo | Tokens |
|---|---|
| Marca | `--kx-magenta` · `--kx-roxo` · `--kx-azul` · `--kx-ciano` |
| Fundo/superfície | `--kx-bg` · `--kx-bg-elev` · `--kx-surface` · `--kx-surface-hover` · `--kx-border` |
| Texto | `--kx-text` · `--kx-text-soft` · `--kx-text-muted` |
| Gradientes | `--kx-gradient` · `--kx-gradient-text` · `--kx-glow-magenta` |
| Fontes | `--kx-font-display` · `--kx-font-body` · `--kx-font-mono` |
| Tamanhos | `--kx-fs-xs` … `--kx-fs-2xl` |
| Espaço (4px) | `--kx-space-1` … `--kx-space-7` |
| Movimento | `--kx-dur-fast/base/slow` · `--kx-ease-out` · `--kx-ease-in-out` |

Com `prefers-reduced-motion`, as durações viram 0.

**Acento por elemento:** `data-acento="magenta|roxo|azul|ciano"` define `--kx-acento` para o elemento e seus filhos.

## Classes globais (`src/styles/components.css`)

| Classe | Uso |
|---|---|
| `.kx-page`, `.kx-section`, `.kx-grid` | layout de página |
| `.kx-glass` | superfície de vidro com blur |
| `.kx-card` (+ `__num`, `__title`, `__meta`) | card com linha de acento |
| `.kx-btn--primary` / `.kx-btn--ghost` | botões |
| `.kx-badge--{status}` / `.kx-chip` | selos e etiquetas |
| `.kx-list` · `.kx-callout` · `.kx-code` | conteúdo didático |
| `.kx-breadcrumb` · `.kx-pager` · `.kx-progress` | navegação e progresso |
| `.kx-eyebrow` · `.kx-title` · `.kx-lead` · `.kx-gradient-text` | tipografia |

## Componentes Angular

| Componente | Seletor | Entradas |
|---|---|---|
| `Shell` | `kx-shell` | — (layout + gaveta mobile) |
| `Sidebar` | `kx-sidebar` | saída `navegou` |
| `PageHeader` | `kx-page-header` | `eyebrow`, `titulo`*, `descricao` + conteúdo projetado |
| `StatusBadge` | `kx-status-badge` | `status`* (`em-teste`, `em-construcao`, `planejado`, `bloqueado`, `validado`) |
| `CodeViewer` | `kx-code-viewer` | `codigo`*, `linguagem`, `titulo` — botão Copiar incluso |
| `Breadcrumb` | `kx-breadcrumb` | `itens`* (`{ rotulo, rota? }[]`) |
| `Icon` | `kx-icon` | `name`* (home, library, palette, route, play, reset, copy, check, lock, arrow-left, arrow-right, menu, close) |
| `Logo` | `kx-logo` | `tamanho` (px, padrão 44), `descritiva` (adiciona texto alternativo) |
| `DemoControls` | `kx-demo-controls` | `params`*, `valores`*, saída `mudou` |
| `CssPlayground` · `GsapStudio` | páginas | query `?demo=` |

## Marca

Selo ilustrado completo em todos os tamanhos (círculo, fundo escuro). Arquivos em `public/brand/`:
`kalixto-logo-{64,128,256,512}.webp`, `icon-192.png`, `apple-touch-icon.png` e `public/favicon.ico`.

\* obrigatório
