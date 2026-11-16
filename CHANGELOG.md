# Changelog

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/).
Cada versão corresponde a uma etapa funcional do roadmap.

## [Não publicado]

Nada ainda.

## [0.1.0] — 2026-11-16 · Fase 1 — Fundação Angular

> Status: **aguardando validação** (ver `docs/CHECKLIST-FASE-1.md`). Ainda não publicado no GitHub Pages.

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
