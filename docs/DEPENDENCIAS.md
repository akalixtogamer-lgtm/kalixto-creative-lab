# Registro de dependências

Verificado em **16/11/2026** (Fase 1).

| Ferramenta | Versão | Observação |
|---|---|---|
| Node.js | 22.x (mínimo) | testado com 22.23 |
| npm | 10.9 | |
| Angular (core, router, forms…) | 22.2 | standalone + signals |
| Angular CLI / @angular/build | 22.2.7 | builder `application` (esbuild) |
| TypeScript | 6.0 | |
| RxJS | 7.8 | |
| Vitest | 5.x | testes unitários (`npm test`) |
| jsdom | 30.x | ambiente de teste |
| @fontsource/inter | 5.x | fonte do texto |
| @fontsource/space-grotesk | 5.x | fonte dos títulos |
| @fontsource/jetbrains-mono | 5.x | fonte de código |
| gsap | 3.15 | GSAP Studio (Fase 2) — carregado só na rota /labs/gsap |

## Entram nas próximas fases (ainda **não** instaladas)

| Biblioteca | Fase | Uso |
|---|---|---|
| ScrollTrigger (vem dentro do `gsap`) | 2 | Scroll Lab |
| `three` | 4 | Three.js Lab |

Regra: só instalar uma biblioteca quando a fase que a usa começar.
