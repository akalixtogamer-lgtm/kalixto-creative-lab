# Changelog

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/).
Cada versão corresponde a uma etapa funcional do roadmap.

## [Não publicado]

Nada ainda.

## [1.10.0-rc.1] — 2026-11-18 · KCX — Construtor de componentes e Figma → Studio

### Adicionado
- **Construtor no KCX Studio** (`/kcx/criar`): escolha o tipo, dê os nomes dos botões, links, abas e
  slides, escolha a animação, as cores e o arredondamento, com preview ao vivo do código de verdade.
  **16 tipos**: navbar (vira menu sanduíche abaixo de 720 px), menu sanduíche, menu lateral (gaveta),
  abas, tab bar de app, botão, card de foto, card de vídeo, carrossel, acordeão (FAQ), card de preço,
  modal (`<dialog>`), aviso (toast), formulário, hero e rodapé — cada um com 3 ou 4 animações.
- **Meus componentes**: o que você cria fica salvo no navegador e abre no mesmo editor (variáveis,
  presets, código, Angular, exportação). “Editar no construtor” reabre a configuração; “Excluir” remove.
- **Interações de protótipo no Figma**: o plugin cria as reactions — clicar no ícone abre o menu,
  as setas passam o slide, a aba troca, o modal abre e fecha, o hover troca a variante — com Smart
  Animate. Testado no Figma real (menu sanduíche: 0 vínculos recusados, 2 interações).
- **Figma → Studio**: botão “Enviar seleção para o lab” no plugin. O frame desenhado vira `.kcx.json`
  com estrutura, cores (com o nome das variáveis do Figma), textos, arredondamentos, espaçamentos e
  vetores (SVG limpo). No Studio: “Importar do Figma” e, no editor, a variável **Animação**
  (entrada, hover ou contínua) e **Elementos em sequência**.
- Auto Layout: frames podem ocupar a largura do pai (`encher`) e alinhar no eixo cruzado (`alinhar`).
- Preview KCX aceita imagens e vídeos por `https:` (cards de foto e vídeo).

### Limitações honestas
- Abrir/fechar (menus, modal, acordeão) existe nos tipos do construtor; um desenho importado do Figma
  recebe animações de entrada, hover ou contínuas.
- Imagens e vídeos não vão para o Figma pelo plugin: a camada fica pronta para você arrastar a foto.

## [1.9.0-rc.1] — 2026-11-18 · KCX — Kalixto Component Exchange

### Adicionado
- **Formato KCX 1.0.0** (`src/app/kcx/`): schema tipado em TypeScript + JSON Schema, validação, serialização,
  migração de versões, comparação de valores e atualização sem sobrescrever personalizações.
- **Variáveis funcionais**: 10 tipos (cor, número, float, boolean, texto, enum, dimensão, tempo, gradiente,
  transformação), vínculos com várias propriedades, operações (mapear, limitar, dividir, converter unidade,
  alpha, mapa…), conversão de unidades e proteção contra valores inconsistentes.
- **KCX Studio** (`/kcx`), **editor** (`/kcx/:id`) e **composição** (`/kcx/compor`):
  preview ao vivo que muda sem recarregar (postMessage), reproduzir/pausar/reiniciar/velocidade,
  antes/depois, controles por tipo, presets (criar, duplicar, renomear, editar, excluir, exportar, importar,
  restaurar), código sincronizado com edição avançada do `:root`, painel “Exportar para Figma” com os 5 modos
  e “Trazer alterações do Figma” com comparação antes de aplicar.
- **6 componentes** (MIT, sem dependências): Neon Glow, Animated Gradient, SVG Motion e, trazidos da
  Biblioteca, Animated Border (borda cônica com `@property`), Hover Lift e Gauge Meter (arcos).
- **Só CSS, SVG e Angular**: o schema recusa dependências e tecnologias fora de HTML/CSS/SVG/Angular/TypeScript.
- **Edição total no Figma**: Auto Layout que cresce com o texto, camadas absolutas com Stretch/Scale,
  propriedades liga/desliga (`BOOLEAN`) e de texto com padrão ligado à variável, raio canto a canto,
  arcos, traço em gradiente cônico, peça reutilizável para caminhos SVG (`SVG Motion · Caminho`) e
  instância de exemplo de cada componente.
- **Saída Angular**: componente standalone com um `input()` por variável (aba Angular no código, pasta
  `angular/` no `.zip`, `npm run gerar:kcx-angular`).
- **Plugin Kalixto Creative Lab — Figma Bridge** (`figma-bridge/`): importa `.kcx.json`, cria coleções
  (Colors, Dimensions, Spacing, Typography, Motion, Effects, Components), modos Dark/Light, variáveis
  vinculadas, componentes com variantes, propriedades de texto, documentação e composição; detecta
  duplicações; exporta alterações de volta para o lab. Testado no Figma (Neon Glow: 54 vínculos, 0 recusados; halo acompanha o rótulo de 167 → 433 px).
- **Exportação de código independente**: `.zip` com `index.html`, CSS com `:root`, `kcx-runtime.js`
  (`KCX.set()`), pacote `.kcx.json`, tokens W3C, SVG e README.
- Documentação: `docs/kcx/ESPECIFICACAO.md`, `docs/kcx/FIGMA-BRIDGE.md`, `docs/kcx/AUDITORIA-E-GUIA.md`.

### Licenças
- O núcleo KCX não usa GSAP: a licença Standard do GSAP não é open source e proíbe uso em ferramentas
  visuais de animação que concorram com o Webflow. Por isso o KCX ficou só com CSS, SVG e Angular.

### Corrigido (visto no Figma real)
- Coleção já existente com Dark/Light: componente de modo único criava um modo novo e deixava o padrão vazio (branco).
- Tracejado parcial do SVG Motion aparecia picotado (o Figma redistribui `dashPattern` por segmento): agora o quadro usa um vetor já cortado.
- Escopo em variáveis BOOLEAN/TIMING/EASING era recusado; agora só COLOR/FLOAT/STRING recebem escopo.

## [1.8.0-rc.1] — 2026-11-18 · Vidro e desfoque

### Adicionado
- **3 kits de vidro e desfoque** (53 no total), com ficha, controles, versão Angular, 3 níveis de explicação e glossário:
  - **Gerador de vidro (glassmorphism)** — desfoque, opacidade, saturação, brilho da borda e cor do vidro (branco, lilás, rosa, azul ou fumê), com reflexo que segue o mouse e plano B (`@supports`) para navegadores sem `backdrop-filter`.
  - **Menu que vira vidro ao rolar** — cabeçalho sticky transparente no topo e fosco depois de rolar (IntersectionObserver), tom claro ou escuro.
  - **Janela com fundo desfocado** — `<dialog>` nativo com `::backdrop` desfocado e escurecido, entrada com `@starting-style`, fecha com Esc, botões ou clique fora.
- Antes, o vidro aparecia só dentro de outros efeitos (carrossel de vidro, bolha de vidro líquido, lente de foco, feixes de palco); agora há kits dedicados para criar e ajustar.

## [1.7.0-rc.1] — 2026-11-18 · Referências em vídeo, lote 4

### Adicionado
- **Vídeos 7 e 8 mapeados** em `docs/REFERENCIAS-ANIMACAO.md`: 15 animações, 7 novas.
- **7 kits novos** (50 no total), com ficha, controles, versão Angular, 3 níveis de explicação e glossário:
  - **Cortina que se abre** — tecido com dobras em gradiente, abre para os lados ou para cima.
  - **Halo de anéis que pulsam** — ondas iridescentes, douradas ou brancas atrás de um objeto, com Pausar.
  - **Frases que se revezam no hero** — palavra por palavra, saindo do desfoque, com Pausar.
  - **Prompt digitado até o "pronto"** — digitação, barra de progresso e selo carimbado.
  - **Medidor de nota (gauge)** — arco SVG de 270° com cor por faixa e `role="meter"`.
  - **Etapas que se desbloqueiam** — cadeados que tremem e abrem, automático ou no clique.
  - **Troca de dispositivo** — controle segmentado e moldura com container queries (3 → 2 → 1 coluna).

## [1.6.0-rc.1] — 2026-11-17 · Referências em vídeo, lote 3

### Adicionado
- **Vídeo 6 mapeado** em `docs/REFERENCIAS-ANIMACAO.md` (proposta comercial com DNA e vidro líquido): 9 animações, 5 novas.
- **5 kits novos** (43 no total), com ficha, controles, versão Angular, 3 níveis de explicação e glossário:
  - **Bolha de vidro que troca a fonte** — dentro da bolha o título vira itálico com serifa, contorno ou ultranegrito (máscaras opostas + `backdrop-filter`).
  - **Hélice de DNA em partículas** — canvas com profundidade falsa, botão Pausar.
  - **Texto com eco** — cópias empilhadas que se juntam, com aura de luz.
  - **Feixes de luz de palco** — refletores que varrem um card de vidro, botão Pausar.
  - **Texto com glitch RGB** — em rajadas, sempre ou só no hover; só CSS.
- Os kits entram automaticamente no Glossário A–Z.

## [1.5.0-rc.1] — 2026-11-17 · Referências em vídeo

### Adicionado
- **Mapa das referências** em [`docs/REFERENCIAS-ANIMACAO.md`](docs/REFERENCIAS-ANIMACAO.md): 5 Reels decupados quadro a quadro, 31 animações identificadas e ligadas a um kit do lab, a seção "As animações mais usadas hoje" e uma lista de galerias e tutoriais para buscar mais referências.
- **20 kits novos** (38 no total), com ficha, controles, versão Angular, 3 níveis de explicação e glossário:
  - **Tipografia:** Legenda cinética (palavra por palavra, estilo Reels), Escrita neon à mão (SVG `stroke-dashoffset` + brilho), Tipografia inflada (`text-shadow` em camadas).
  - **Luz e profundidade:** Interface isométrica em camadas (vista explodida em CSS 3D).
  - **Transições:** Troca de mundo com revelação circular (`clip-path: circle()` a partir do botão).
  - **Cards e imagens:** Fita 3D de imagens (cilindro CSS girando em volta do título, com Pausar).
  - **Cursor:** Lente de foco (página desfocada, óculos com conteúdo nítido e ampliado).
  - **Scroll:** Sequência de quadros no scroll (canvas + sticky), Cards empilhados no scroll, Hero que abre no scroll.
  - **SVG:** Mancha de tinta viva (filtro gooey com `feColorMatrix`, clique pinga gotas).
  - **3D:** Sala 3D em CSS (corredor com `perspective-origin` seguindo o mouse e botão Entrar).
  - **Tipografia:** Texto embaralhado (decode) no título e no menu.
  - **Navegação:** Tela de carregamento com contador 0 → 100 e 3 saídas.
  - **Cursor:** Lista com imagem que segue o cursor (lerp + inclinação pela velocidade).
  - **Luz:** Cards com luz que segue o mouse (borda com `mask-composite`).
  - **Cards e imagens:** Galeria sanfona (`flex-grow`).
  - **Lote 2 das referências:** Título que se monta em pixels (canvas `getImageData`), Campo de partículas com constelação (primeiro kit da categoria Partículas), Mosaico de células que acendem.
- Tags "referência em vídeo" e "tendência 2026" para filtrar na Biblioteca.
- **Glossário A–Z** (`/glossario`, no menu Geral e na Biblioteca): os 38 efeitos, as 60 demos e os 150 termos de código em ordem alfabética, com busca (também pela URL, `?q=`), filtro por tipo e índice de letras fixo no topo. Efeitos têm "Testar" e "Ver e copiar o código"; demos abrem o laboratório já na demo; termos levam a cada efeito que os usa.
- **Modo claro e escuro.** Botão no menu lateral (e no topo, no celular). O modo claro usa rosa, azul, lilás e branco, com todos os textos em contraste AA (≥ 4,5:1). Sem escolha salva, o lab segue o tema do sistema; a escolha fica salva no navegador e é aplicada antes da página aparecer (sem piscar). Palcos das demos, previews e blocos de código continuam escuros nos dois modos, porque os efeitos foram desenhados para fundo escuro. As cores ficam em `src/styles/tokens.css` (`:root` e `:root[data-tema='claro']`).
- **Code Lab abre na aba certa:** `/efeitos/:id?arquivo=css|js|html` abre direto no arquivo, e links com `#ef-codigo` rolam até o Code Lab.

## [1.4.1-rc.1] — 2026-11-17 · Correção

### Corrigido
- **Página do efeito "abrindo mais de uma vez" (celular e computador).**
  - Cada atualização do preview (abrir o próximo efeito, mexer num controle, Reiniciar, executar código editado) trocava o `srcdoc` do iframe, e o navegador registrava isso como uma página nova no histórico. Era preciso tocar em "Voltar" várias vezes para sair do efeito.
  - Agora o preview troca o iframe por um novo já com o código. Só a navegação real entra no histórico.
  - Verificado no Chromium: abrir, mexer 5 vezes no controle, Reiniciar, alternar Angular e executar código editado não criam entradas; "Voltar" leva direto à página anterior.

## [1.4.0-rc.1] — 2026-11-17 · Biblioteca técnica, Fase 3

### Adicionado
- **8 kits novos** (18 no total), com ficha, controles, versão Angular, 3 níveis de explicação e glossário:
  - **Rolagem:** Revelar ao rolar (IntersectionObserver), Barra de progresso de leitura (`animation-timeline: scroll()` com reserva em JS), Parallax em camadas, Revelar ao rolar com GSAP (ScrollTrigger `batch` ou `scrub`, com `gsap.matchMedia`).
  - **Navegação:** Rolagem suave com **Lenis** (com modo nativo para comparar).
  - **Cursor e máscaras:** Cursor personalizado (ponto + anel com atraso), Lanterna com `mask-image`.
  - **Experimental:** Distorção líquida com filtros SVG (`feTurbulence` + `feDisplacementMap`).
- **Bibliotecas nos kits:** um kit pode declarar `bibliotecas` (GSAP, ScrollTrigger, Lenis).
  - **Preview e `.html` único:** o código delas vai embutido no documento isolado, porque o CSP continua bloqueando a rede.
  - **`.zip`:** elas vão na pasta `vendor/`, e o README traz a licença e o `npm install`.
  - **Code Lab:** mostra uma nota com os nomes, as versões e os links das licenças.
- **Lenis 1.3.27** (MIT) instalado, usado só no kit de rolagem suave. A aplicação continua com rolagem nativa.
- Kits de página rolável (`previewAngular: false`): o botão **Angular** fica desabilitado com explicação, porque o componente depende da rolagem da janela inteira. Os arquivos Angular continuam no Code Lab e no `.zip`.

### Alterado
- Testes da versão Angular: aceitam componentes sem texto (a barra de progresso) e ignoram o CSS da página de demonstração.

## [1.3.0-rc.1] — 2026-11-17 · Biblioteca técnica, Fase 2

### Adicionado
- **Code Lab** na página de cada efeito:
  - abas HTML, CSS e JavaScript, mais os três arquivos da versão Angular;
  - edição dos arquivos HTML/CSS/JS, executada no mesmo preview isolado (sandbox + CSP);
  - **Comparar com o original** (diferença por linha) e **Restaurar original**;
  - limite de 50.000 caracteres por arquivo.
- **Versão Angular dos 10 kits:** componentes standalone com os valores dos controles.
  - Os arquivos com valores padrão ficam em `src/app/efeitos-angular/`, são compilados com o app, renderizados nos testes e mostrados no preview (botão **Angular**).
  - Novos scripts: `npm run gerar:angular` e `npm run verificar:angular`.
- **Exportação em pacote `.zip`**, sem biblioteca: `README.md`, `index.html`, `styles.css`, `script.js` e `angular/`. O README é gerado da ficha, com os valores usados e um aviso quando o código foi editado.
- **Code Explainer:** explicação em 3 níveis (iniciante, intermediário, avançado) e **glossário do código**. Um teste garante que cada termo existe no código exibido.
- **Code Viewer** com numeração de linhas e realce de sintaxe (HTML, CSS, JS/TS, GLSL). Vale também para os laboratórios e o Comparador.
- Os docs por efeito (`npm run docs:efeitos`) agora incluem os 3 níveis, o glossário e a versão Angular.
- 39 testes novos (334 no total).

### Corrigido durante a verificação
- O realce com `[innerHTML]` trazia o sanitizador do Angular para o pacote inicial (+5,5 kB). Agora o realce é renderizado como texto.

### Alterado
- "Restaurar valores" passou para o painel de controles. Na barra do preview ficaram Reiniciar, Baixar pacote .zip e Baixar .html único.

## [1.2.0-rc.1] — 2026-11-17 · Biblioteca técnica, Fase 1

> Master Prompt "Auditoria, expansão, implementação e documentação de efeitos web". Diagnóstico em `docs/AUDITORIA.md`.

### Adicionado
- **Ficha técnica tipada** (`EffectSheet`) com os campos da seção 05: categoria, subcategoria, objetivo, aplicações, nível (inclusive experimental), tecnologias, dependências, interação, tags, explicação, alternativa, compatibilidade, responsividade, acessibilidade, performance, limitações, referências, data de validação e status.
- **15 categorias** do mapa de efeitos. As 60 demos existentes foram classificadas sem duplicar código.
- **10 kits** autossuficientes: Fade In, Slide In, Scale Reveal, Button Hover, Magnetic Button, Glow Button, Animated Gradient, Text Reveal, 3D Card Tilt e Animated Border. Todos em HTML, CSS e JS nativos, sem bibliotecas.
- **Página `/efeitos/:id`:**
  - preview em `iframe sandbox="allow-scripts"` com CSP sem rede, rodando exatamente o código exibido;
  - controles, abas HTML/CSS/JS, Reiniciar, Restaurar valores e download do `.html`;
  - ficha técnica completa.
- **Biblioteca:**
  - busca por nome, descrição, tecnologia, categoria, aplicação e tags, ignorando acentos;
  - filtros por categoria, tipo, nível, interação e dependências;
  - ordenação por nome e por dificuldade;
  - `?categoria=` na URL.
- `npm run docs:efeitos` gera `docs/CATALOGO-DE-EFEITOS.md` e uma página por kit em `docs/efeitos/`.
- Documentação nova: `AUDITORIA`, `SEGURANCA`, `ACESSIBILIDADE`, `PERFORMANCE` e `TECNOLOGIAS`.
- 62 testes novos (295 no total). Entre eles, um teste garante que **cada controle muda o código** e que todo kit respeita `prefers-reduced-motion`.

### Corrigido durante a verificação
- Text Reveal quebrava palavras no meio da linha no modo letras. Agora as letras ficam agrupadas por palavra.
- Bind dinâmico do atributo `sandbox` é bloqueado pelo Angular (NG0910). O atributo passou a ser estático no template.

### Preservado
- Todas as rotas, os laboratórios, o progresso salvo e os filtros antigos da Biblioteca (`?lab=`, situação).

## [1.1.0-rc.1] — 2026-11-16 · Efeitos das referências

> Avaliação das 8 imagens da pasta "efeitos pra site" em `docs/REFERENCIAS.md`.

### Adicionado
- **Laboratório 07 — Interface Lab** com 13 demos: hero editorial, órbita e parallax por mouse, texto atrás do objeto, imagem recortada em formas, biblioteca de 17 divisores SVG, carrossel de cards em vidro, números animados com gráfico, tipografia vazada, bento grid, cards com profundidade, grão de filme e vinheta, botão magnético com cursor personalizado e faixa infinita (marquee).
- **Scroll Lab → Capítulos com linha do tempo**: linha que se preenche, capítulo ativo e zoom/parallax nas imagens.
- **GSAP Studio → SplitText**: revelar texto por letras, palavras ou linhas, com quatro efeitos.
- 4 paisagens e uma silhueta em SVG próprias (`public/ilustracoes/`), no lugar de fotos.
- 4 exercícios do Interface Lab (27 no total); 51 testes novos (233 no total).

### Corrigido
- Três presets novos com valores fora do passo dos sliders (pegos pelo teste de integridade).

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
