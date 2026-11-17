# Design System e componentes

Visualização ao vivo: rota `/design-system`.

## Tokens (`src/styles/tokens.css`)

| Grupo | Tokens |
|---|---|
| Marca | `--kx-magenta` · `--kx-roxo` · `--kx-azul` · `--kx-ciano` |
| Fundo/superfície | `--kx-bg` · `--kx-bg-elev` · `--kx-surface` · `--kx-surface-hover` · `--kx-border` |
| Texto | `--kx-text` · `--kx-text-soft` · `--kx-text-muted` |
| Gradientes | `--kx-gradient` · `--kx-gradient-text` · `--kx-glow-magenta` · `--kx-gradient-btn` (fundos com texto branco, contraste AA) · `--kx-magenta-texto` |
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
| `Icon` | `kx-icon` | `name`* (home, library, palette, route, play, reset, copy, check, lock, arrow-left, arrow-right, menu, close, download…) |
| `Logo` | `kx-logo` | `tamanho` (px, padrão 44), `descritiva` (adiciona texto alternativo) |
| `DemoControls` | `kx-demo-controls` | `params`*, `valores`*, saída `mudou` |
| `LabLayout` | `kx-lab-layout` | `lab`*, `demos`*, `atual`*, `valores`*, `codigo`*, `linguagem`; saídas `executar`, `reiniciar`, `mudou`, `aplicar`; slots `[palco]` e `[toolbar]` |
| `CssPlayground` · `GsapStudio` · `ScrollLab` · `SvgLab` · `ThreeLab` · `GlslLab` · `UiLab` | páginas | query `?demo=` |
| `Efeito` | página `/efeitos/:id` | `id`* (rota) — preview em iframe sandbox, controles, abas HTML/CSS/JS, download, ficha técnica |
| `Biblioteca` | página `/biblioteca` | query `?lab=` e `?categoria=`; busca e 8 filtros sobre kits + demos |

## Marca

Selo ilustrado completo em todos os tamanhos (círculo, fundo escuro). Arquivos em `public/brand/`:
`kalixto-logo-{64,128,256,512}.webp`, `icon-192.png`, `apple-touch-icon.png` e `public/favicon.ico`.

\* obrigatório

## Serviço

| Serviço | Uso |
|---|---|
| `ProgressoService` | demos executadas, desafios, exercícios, presets do usuário (localStorage) |

## Regra de contraste

Texto branco nunca vai direto sobre `--kx-magenta` (#ff2bd6, contraste 3,2:1). Para fundos com texto branco use
`--kx-gradient-btn` ou `--kx-magenta-texto`; sobre a cor de acento de um laboratório, use texto `--kx-bg`.
