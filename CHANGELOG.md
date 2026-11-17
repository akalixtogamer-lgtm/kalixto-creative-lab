# Changelog

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/).
Cada versão corresponde a uma etapa funcional do roadmap.

## [Não publicado]

Nada ainda.

## [1.0.0-rc.2] — 2026-11-16 · Navbar ao rolar e divisores de seção

### Adicionado
- **Scroll Lab → Navbar ao rolar**: navbar transparente sobre o hero que, ao rolar, fica fixa com fundo (vidro ou sólido) e sombra ajustável; opção de esconder ao descer e mostrar ao subir.
- **CSS Playground → Divisores de seção**: bordas entre seções em diagonal, seta, curva, zigue-zague e ondas, com altura e direção ajustáveis. O palco e o Code Viewer usam a mesma função (`estiloDivisor`).
- Presets e desafio nas duas demos; 8 testes novos (182 no total).

## [1.0.0-rc.1] — 2026-11-16 · Fase 6 — Otimização e consolidação

> Candidata à versão 1.0. Aguardando a avaliação do Wallace (`docs/AVALIACAO.md`). Ainda não publicado.

### Adicionado
- Relatório de QA (`docs/QA.md`), arquitetura (`docs/ARQUITETURA.md`) e roteiro de avaliação (`docs/AVALIACAO.md`).
- Registro das 43 demos gerado a partir dos dados (`docs/EFEITOS.md`).
- Dashboard indica "Roadmap completo".

### Corrigido
- Acessibilidade (axe-core, WCAG 2.1 AA): 0 violações em 14 páginas.
  - Contraste de texto branco sobre magenta: botões e marcadores usam o novo `--kx-gradient-btn`.
  - `aria-label` em elementos sem papel → `role="img"`.
  - Conteúdo de trás fica inativo (`inert`) com o menu do celular aberto.
- Link "Pular para o conteúdo" cobria o botão do menu no celular e aparecia cortado no topo.
- Alvos de toque com pelo menos 32 px (breadcrumb, sliders, tabela do Comparador).
- Textos do topo do Dashboard passavam por baixo da logo no desktop.
- "Como usar" desalinhado no celular.

## [0.7.0] — 2026-11-16 · Fase 5 — WebGL e GLSL

### Adicionado
- **Laboratório 06 — WebGL & GLSL** com 7 demos: fragment shader (gradiente animado), vertex shader (superfície ondulando), formas com GLSL (length, smoothstep, fract, step), noise com fbm e domain warping, distorção da logo com ondas de água no mouse, efeitos procedurais (plasma e Voronoi) e transição entre imagens com ruído animada pelo GSAP.
- Os shaders ficam no catálogo de demos: o Code Viewer mostra exatamente o GLSL que roda, mais os uniforms com os valores atuais.
- Teste que garante que todo uniform controlado pela tela existe no shader.

## [0.6.0] — 2026-11-16 · Fase 4 — Three.js

### Adicionado
- **Laboratório 05 — Three.js Lab** com 9 demos: objetos geométricos, câmeras (fov, distância, voo com GSAP), iluminação (ambiente, direcional, pontual), materiais (Basic, Lambert, Phong, Standard, Normal), texturas (logo e padrões feitos em canvas), animação 3D com squash and stretch, interação por mouse (lerp), raycasting (hover e clique) e importação GLTF/GLB.
- Modelo próprio `public/models/kalixto-trofeu.glb`, gerado por código (`scripts/gerar-modelo.mjs`); dá para carregar um .glb seu, lido só no seu computador.
- Palco 3D reutilizável (`palco-3d.ts`): ajusta o tamanho sozinho, pausa quando a aba ou o palco saem da tela, limita a densidade de pixels e libera a memória da placa de vídeo ao sair.
- Demos "ao vivo" (sem botão Executar): contam como feitas ao mexer, e o desafio conclui sozinho.
- Mensagem alternativa quando o navegador não tem WebGL.
- Three.js carregado só na rota do lab (~140 kB comprimido).

### Corrigido
- Textos para leitores de tela dentro da faixa de demos alargavam a página no celular.

## [0.5.0] — 2026-11-16 · Fase 3 — Organização educacional

### Adicionado
- **Laboratório 04 — SVG Lab** com 5 demos: traço que se desenha (DrawSVG), máscara revelando a logo, morphing de formas (MorphSVG), distorção com filtros e motion path.
- **Trilha de aprendizagem** (`/trilha`): todos os labs em ordem, ✓ por demo executada, ★ por desafio, anel de progresso, "Continuar de onde parei" e "Zerar progresso" com confirmação.
- **Exercícios** (`/exercicios`): 23 questões de múltipla escolha (CSS, GSAP, Scroll, SVG, Three.js, WebGL) com correção, explicação e "Refazer".
- **Comparador de tecnologias** (`/comparador`): tabela de quando usar cada ferramenta e o mesmo efeito em CSS, Web Animations API e GSAP rodando lado a lado.
- Dashboard com "Seu progresso"; menu com a seção **Estudar**.
- Biblioteca com filtros de nível e de situação (executados / pendentes).
- 121 testes passando.

## [0.4.0] — 2026-11-16 · Fase 2 concluída — Scroll Lab

### Adicionado
- **Laboratório 03 — Scroll Lab** com 7 demos de ScrollTrigger: gatilho, Scrub, Pin, Parallax, Horizontal Scroll, Scroll Progress e Scroll Storytelling (Dança → Código → Criação).
- Cada demo roda numa janela de rolagem própria; o resultado é ao vivo e "Rolar automaticamente" faz a rolagem sozinho.
- **Layout comum dos laboratórios** (`kx-lab-layout`): CSS, GSAP e Scroll usam a mesma estrutura.
- **Presets** em todas as demos (receitas prontas) e presets do usuário salvos no navegador.
- **Desafios** práticos em todas as demos, com conclusão registrada.
- **Progresso salvo** no navegador (`ProgressoService`): demos executadas ganham ✓ no seletor.
- Teste de integridade: todo preset/desafio usa valores que os controles conseguem produzir.
- 98 testes passando.

## [0.3.0] — 2026-11-16 · Fase 2 — GSAP Studio + logo Kalixto

> Status: **pronto para testar** (ver `docs/CHECKLIST-FASE-2-GSAP.md`). Ainda não publicado no GitHub Pages.

### Adicionado
- **Laboratório 02 — GSAP Studio** com 7 demos: gsap.to(), gsap.from(), gsap.fromTo(), Timeline, Stagger, Easing (com gráfico da curva ao vivo) e Controles de reprodução (play, pause, reverse, restart, barra de progresso e timeScale).
- Animações rodam em `gsap.context()`: Reiniciar e trocar de demo desfazem tudo, sem sobras de estilo.
- GSAP 3.15 é carregado só quando o GSAP Studio abre (~30 kB).
- **Logo oficial Kalixto** aplicada: menu lateral, barra do celular, Dashboard, favicon, ícone do iPhone e seção "Marca" no Design System. Componente `kx-logo`, arquivos em `public/brand/`.
- Componente compartilhado `kx-demo-controls` e layout comum dos labs em `src/styles/lab.css`.
- 13 testes novos do GSAP Studio (44 no total).

### Alterado
- Modelo comum de demos em `core/models/demo.model.ts` (usado por CSS e GSAP).
- Níveis exibidos com acento (intermediário, avançado).

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
