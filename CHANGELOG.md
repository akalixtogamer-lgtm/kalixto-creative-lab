# Changelog

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/).
Cada versão corresponde a uma etapa funcional do roadmap.

## [Não publicado]

Nada ainda.

## [0.2.0] — 2026-11-16 · Fase 2 — CSS Playground + revisão de UI/UX

> Status: **pronto para testar** (ver `docs/CHECKLIST-FASE-2-CSS.md`). Ainda não publicado no GitHub Pages.

### Adicionado
- **Laboratório 01 — CSS Playground** com 8 demos interativas: Transitions, Keyframes, Transform, Hover, Floating, Perspective, Clip-path e Microinterações.
- Cada demo tem palco, controles (sliders e seletores), botões Executar e Reiniciar, Code Viewer com o código gerado a partir dos valores atuais e explicação com dica.
- A demo escolhida fica na URL (`/labs/css?demo=hover`).
- Componentes compartilhados: `kx-code-viewer` (com botão Copiar), `kx-breadcrumb`, `kx-icon` (ícones SVG).
- 15 testes novos do CSS Playground (31 no total).

### Alterado (revisão de UI/UX)
- Dashboard: CTA principal leva direto ao laboratório pronto; nova seção "Como usar" em 3 passos; cards com barra de progresso e indicação "Abrir" / "Ver plano".
- Labs sem demos: botões desabilitados (que pareciam quebrados) trocados por um aviso claro "Em breve" com atalho para o lab pronto.
- Breadcrumb e navegação anterior/próximo em laboratórios e demos.
- Menu: ícones SVG consistentes; etiquetas "testar", "em breve" e cadeado; item ativo com marcação lateral.
- Biblioteca: efeitos prontos viram links que abrem a demo diretamente.
- Novo status "Pronto para testar".

## [0.1.0] — 2026-11-16 · Fase 1 — Fundação Angular

> Status: concluída.

### Adicionado
- Projeto Angular 22 (componentes standalone, signals, controle de fluxo `@if`/`@for`).
- Design System Kalixto: tokens de cor, tipografia, espaçamento, raios e movimento; componentes globais `.kx-*` com glassmorphism.
- Fontes Inter, Space Grotesk e JetBrains Mono hospedadas no próprio projeto (sem depender do Google Fonts).
- Layout com menu lateral fixo no desktop e gaveta no mobile (fecha com Esc, clique fora ou ao navegar).
- Dashboard com resumo do projeto, fase atual e cards dos laboratórios.
- Página genérica de laboratório (`/labs/:id`) com área de demonstração, tópicos e efeitos planejados.
- Three.js Lab e WebGL & GLSL marcados como bloqueados, conforme a regra do roadmap.
- Biblioteca de efeitos com busca, filtro por laboratório e filtro via URL (`?lab=`).
- Páginas Design System, Roadmap e 404.
- Lazy loading em todas as páginas.
- Acessibilidade base: link "pular para o conteúdo", foco visível, `aria-current` no menu, respeito a `prefers-reduced-motion`.
- 16 testes automatizados (navegação e integridade dos dados).
- Workflow de publicação no GitHub Pages **somente manual** (exige digitar `PUBLICAR`).
- Documentação: README, ROADMAP, DEPENDENCIAS, COMPONENTES, EFEITOS, PROBLEMAS-CONHECIDOS e checklist da Fase 1.
