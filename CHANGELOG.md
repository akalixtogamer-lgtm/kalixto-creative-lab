# Changelog

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/).
Cada versão corresponde a uma etapa funcional do roadmap.

## [Não publicado]

### Melhorado — Variáveis detectadas recolhíveis
- No painel de exportação, **Variáveis detectadas** vira um bloco com seta: começa fechado,
  mostrando só o total, as vinculadas e as documentais. Aberto, a tabela tem altura limitada,
  rolagem própria e cabeçalho fixo.

### Melhorado — Importar design system fácil de achar
- Botão **Importar design system** também no topo do **KCX Studio** e no **guia do Design
  system** (além da Fundação e dos Moldes). Aceita o `.kcx-fundacao.json` do plugin Figma
  Bridge, o JSON da Fundação e pacotes KCX que levem a fundação.
- Um arquivo sem design system (ex.: um `.kcx.json` só de componentes) agora é recusado com
  explicação, em vez de virar a fundação padrão sem aviso.

### Adicionado — Reference vs. Reconstruction (`/kcx/comparar`)
- **Painel A — Original reference**: site por URL, gravação de vídeo (guardada no navegador),
  frames extraídos ou imagens enviadas, com sequência temporal (estados, efeitos e interações),
  elementos marcados no frame (caixa, conta-gotas, fonte, camada) e anotações. O original nunca
  é modificado.
- **Painel B — KCX reconstruction**: um componente KCX com inspetor embutido (selecionar
  elemento, medir caixas, cores, fontes, camadas e animações, registrar interações).
- **Quatro modos**: Side by side (divisor arrastável, zoom, viewport, reprodução independente),
  Overlay (opacidade, posição, escala, mistura "diferença", fundo transparente), Motion sync
  (tempo real do vídeo como base, pontos de sincronia por marco, sem supor tempos iguais) e
  Interaction test (reproduzido, difere, não implementado, com evidência do registro).
- **Painel de fidelidade** sem nota arbitrária: 14 critérios em correspondência visual,
  comportamental e técnica, cada um com a medida (Δpx, ΔE 2000, ms, distância entre curvas) e a
  regra. Usar a mesma tecnologia da referência não conta.
- **Sistema de ajuste**: posição, dimensão, espaçamento, cor, opacidade, blur, sombra,
  transform, duração, delay, easing, velocidade, gatilho e breakpoint por elemento. Cada ajuste
  vira uma variável KCX e atualiza o Painel B na hora, sem recarregar.
- **Versões**: salvar, duplicar, comparar, restaurar e definir a aprovada (decisão da pessoa).
- **Aprovação e integração**: salvar como componente, criar variante, Motion Library (nova seção
  no KCX Studio), aplicar numa página das Telas, substituir componente e exportar código. O
  componente aprovado continua ligado às variáveis.
- Exportar e importar a comparação (`.kcx-comparacao.json`). No editor: "Comparar com uma
  referência".

### Melhorado — Importar do Figma e editar no lab
- **Importar do Figma (.kcx.json)** agora mostra, para cada componente importado, o botão
  **Editar "nome"** (abre o editor) e avisa quando o arquivo substituiu uma versão que já estava
  no lab.
- **Validar um arquivo KCX** deixa claro que conferir não adiciona o componente e oferece
  **Adicionar aos meus componentes para editar**.
- Os seletores de arquivo aceitam também **.kcx** (downloads que o navegador salvou sem `.json`).
- No editor, componentes vindos do Figma ganham **Editar no construtor** no topo: leva à
  conversão em um tipo do construtor e explica o que já dá para editar sem converter.

### Corrigido — Construtor e valores do editor
- **Enviar imagem no construtor** não trava mais o "Revisar tudo": o campo de endereço fica
  vazio (com "Imagem enviada ✓", "Trocar imagem" e "Tirar a imagem") em vez de mostrar um texto
  que o navegador recusava como URL.
- **Editar no construtor** e **reimportar do Figma** (.kcx.json com o mesmo id): os valores que
  mudaram na nova versão aparecem no editor. Antes, os valores salvos no editor escondiam os
  textos e cores novos; agora só os ajustes que a nova versão não tocou (ex.: o vidro) continuam.

### Adicionado — Vidro do Figma, moldes, Telas livres e PDF
- **Vidro no modelo Glass do Figma** em qualquer componente: luz (ângulo e intensidade, com
  controle de luz), refração, profundidade, dispersão, gelo e splay, além de fundo, véu e borda.
  No Figma vira o **efeito Glass nativo**; no código, desfoque, realce e brilho direcional.
- **Vidros prontos** (Líquido do Figma, Fosco, Gelo, Cristal, Fumê) e **Meus vidros**: salve
  um vidro com nome e aplique em qualquer outro componente.
- **Controles no estilo do Figma** (barra + campo numérico) no vidro e nos controles da
  Biblioteca de efeitos e dos laboratórios.
- **Design system em PDF** (A4, vetorial): capa com logo, sumário, cores por função, escalas,
  contraste, tipografia, espaços, cantos, sombras, movimento, grid, componentes e tokens.
- **Moldes de página** (`/kcx/moldes`) para dança, games, livros, música, café, moda, curso e
  portfólio: páginas montadas com componentes, cores e fontes da área (ou a sua Fundação, ou um
  design system importado), animações que combinam e o mapa de navegação já ligado.
- **Trocar seção** nas Telas: outro tipo com o mesmo conteúdo (ex.: Carrossel → Galeria) ou
  outro componente pronto.
- **Telas em posição livre** (como no Figma): arraste com mouse, caneta ou dedo, com ímãs e guias
  de alinhamento, seleção múltipla, alinhar, distribuir, reempilhar, X/Y e setas do teclado. No
  Figma, cada seção vai na mesma posição.

### Adicionado — Referências em vídeo, lote 5
- **Voo que sai pela janela em arco** (`arch-window-reveal`): voo de câmera preso ao scroll com
  legendas por cômodo, que termina encolhendo para uma janela em arco (ou círculo, ou retângulo)
  recortada na página. Ficha técnica, controles, versão Angular e explicação em 3 níveis.
- **Mergulho no título em profundidade** (`depth-zoom-title`): a câmera entra na cena e as letras
  do título, umas na frente e outras atrás do objeto, passam por ela (referência "PRIMAL").
- **Mergulho pelo portal** (`portal-zoom`): zoom através de um furo feito com `mask-image` —
  círculo, oval ou as duas lentes de um óculos de RV (referências "Step into Wonder" e "Enter
  spatial freedom").
- Mapa dos vídeos "Origin Café", "Maison" e "templates animados" em
  `docs/REFERENCIAS-ANIMACAO.md`: as demais animações já estavam na plataforma.

### Adicionado — Projeto: briefing, moodboard, mapa e fluxos
- **Briefing** (`/kcx/briefing`): importa **Word (.docx)**, .txt, .md ou o próprio .json, lido
  no navegador. Os títulos (Objetivo, Público-alvo, Tom de voz, Páginas, Prazo…) viram campos
  editáveis e o resto vai para Observações. Baixa em Markdown ou .json. As páginas listadas viram
  páginas das Telas com um clique.
- **Moodboard** (`/kcx/moodboard`): até **20 imagens** (PNG, JPG, WebP, GIF, AVIF), reduzidas e
  guardadas no navegador (IndexedDB). Legenda, arrastar para reordenar, mosaico ou grade, lupa,
  paleta tirada das imagens com sugestão de papéis e "Levar para a Fundação". Baixa em HTML.
- **Telas com várias páginas:** criar, duplicar e excluir páginas (a tela única antiga é migrada).
- **Mapa de navegação** (`/kcx/mapa`): as páginas e as ligações entre elas (com o gatilho),
  desenhadas em camadas pelos cliques a partir do início. Aponta páginas sem entrada, becos sem
  saída e páginas a mais de 3 cliques.
- **Fluxos de interação:** início, telas, ações, decisões (sim/não) e fim, com análise de passos
  soltos. Dá para gerar um fluxo pelo caminho mais curto do mapa.
- **Para o Figma:** mapa e fluxo baixam em SVG ou `.kcx-diagrama.json`; o plugin cria um frame
  com caixas editáveis, setas e os gatilhos como etiquetas.

### Adicionado — Design system completo
- **Página Design system** (`/kcx/design-system`, link no KCX Studio): um guia vivo gerado da
  Fundação, com capa e logo, sumário, cores por função, escalas tonais, contraste, tipografia,
  espaçamento, raios, sombras, movimento, grid, componentes e código dos tokens. Tema escuro ou
  claro, e aviso quando algum par de cores não atinge o contraste mínimo.
- **Baixar o guia** em HTML (pronto para imprimir em PDF) e os **tokens em CSS**.
- **Cores por função:** cada cor ganhou um campo "Função" (Marca, Superfícies, Texto e Feedback),
  que vai para o guia e para a descrição das variáveis no Figma.
- **Escalas tonais 50–900** das cores de marca e de feedback (`--kx-<cor>-<passo>`), também como
  variáveis no Figma.
- **Contraste WCAG 2.1** calculado para os pares principais (AA, AAA ou Falha).
- **Hierarquia de texto com uso:** cada nível (Display, H1… Legenda) diz onde se usa.
- **Movimento** (durações rápida, normal e lenta e a curva) e **layout** (container, colunas,
  gutter, margem e pontos de quebra), com as classes `.kx-container` e `.kx-grid`.

### Adicionado — Pedidos da turma
- **Cor do texto do botão** independente da cor do botão (Botão, Conjunto de botões, Botão
  liga/desliga e Seletor de duas opções). Com a Fundação, nasce com "Texto sobre a primária".
- **Subtítulo** nos cards de foto e de vídeo e **dentro de cada slide do carrossel**, abaixo do
  título (um campo por slide em Criar componente; também no Figma). Na conversão de um trilho do
  Figma, o segundo texto de cada card vira o subtítulo.
- **Sem borda tracejada:** o plugin tira a borda roxa tracejada que o Figma põe nos conjuntos de
  variantes, e o botão "Tirar a borda tracejada" limpa os que já estavam no arquivo.
- **Carrossel** com até **15** slides; no desktop mostra **1, 3 ou 4** cards por vez e, no celular
  (carrossel com até 440 px), **1**. No Figma, uma variante por posição.
- **Telas:** arraste as seções **no próprio mockup** (ou na lista) para mudar a ordem.
- **Tamanho em px** em qualquer componente: Largura e Altura no editor (preview, código, Telas e,
  nos de tamanho fixo, Figma).
- **Converter em outro tipo:** um desenho (ex.: trilho de cards vindo do Figma) vira Carrossel,
  Navbar, Abas… aproveitando os itens que se repetem, os textos, as cores e os cantos.
- **Design system do Figma → Fundação:** no plugin, "Enviar design system para o lab" lê
  variáveis de cor e número, estilos de texto e de sombra e gera um `.kcx-fundacao.json` para
  importar na Fundação.

### Adicionado — Logo
- **Logo na Fundação** (PNG, JPG, WebP, GIF ou SVG, até 400 KB). SVG com script ou eventos é recusado.
- **Criar componente:** Navbar, Menu sanduíche, Rodapé e Aviso usam a logo no lugar do texto da
  marca (dá para enviar outra só para aquele componente e ajustar a altura).
- **Montador:** botão **+ Logo** (transforma a camada "Logo" em imagem, ou entra no começo da
  caixa) e, em qualquer camada de imagem, **Enviar imagem do computador**, **Usar a logo da
  fundação** e o ajuste Preencher/Caber.
- **Figma:** logo em SVG vira vetor editável; PNG/JPG viram preenchimento de imagem (IMAGE). Nos
  wireframes de baixa e média fidelidade, fotos e logos viram um bloco cinza.

### Adicionado — Seletor de duas opções (um ou outro)
- Novo tipo **Seletor de duas opções** em Criar componente: escolhe **uma OU outra** (Português |
  Inglês, Mensal | Anual). A variável **Segunda opção escolhida** é verdadeiro/falso: falso = a
  primeira, verdadeiro = a segunda. Os dois textos são editáveis.
- Tamanhos P/M/G, estado Desativado, três animações (Desliza, com mola, Troca suave) e a opção de
  trocar o tema no protótipo do Figma.
- Código acessível: `role="radiogroup"` com dois `role="radio"`; clique ou setas do teclado trocam
  e o componente dispara um evento `change`. No Figma: Primeira/Segunda (+ Desativado) × Tamanho,
  e clicar na outra opção faz o destaque deslizar (Smart Animate).

### Adicionado — Botão liga/desliga
- Novo tipo **Botão liga/desliga** em Criar componente (Seguir/Seguindo, Favoritar, Silenciar):
  desligado com contorno, ligado cheio, com **texto e ícone próprios** para cada lado.
- Mesmos recursos dos outros botões: **Tamanhos** P/M/G, **Estados** (Hover, Pressionado, Foco e
  Desativado, ligado e desligado), ícones trocáveis, três animações (Preenche, Pop, Ícone gira)
  e o **Efeito vidro**.
- Código acessível: `<button aria-pressed>` que alterna ao clicar. No Figma: 30 variantes
  (Estado × Tamanho) e protótipo em que o clique liga e desliga com Smart Animate.

### Adicionado — Vidro (glassmorphism) em qualquer componente
- Seção **Efeito vidro** na edição de **todo** componente (biblioteca, criados por tipo,
  montados ou importados do Figma): **Aplicar efeito vidro** / **Desligar vidro**, escolha da
  camada e ajuste de fundo, véu, borda e desfoque, com o preview mudando na hora (o palco ganha
  um fundo colorido quando o vidro está ligado).
- Cada componente ganha as variáveis **Vidro · fundo / véu / borda / desfoque** (e o preset
  "Vidro"). Desligado = igual ao original. No código: `color-mix` e `backdrop-filter`, só quando
  a variável sai do padrão; no Figma: cores com transparência e **Background blur** ligados às
  variáveis. Os valores ficam salvos e aparecem também nas Telas.
- Quando algo não sai igual no código (fundo em gradiente, classe não encontrada), a seção avisa.

### Adicionado — Vidro (glassmorphism) no Montador
- **Opacidade do fundo e da borda** (0–100%) em qualquer caixa, sempre com as cores da fundação.
  No código vira `color-mix(...)`; no Figma, variável de cor com transparência nos temas Dark e
  Light.
- **Desfoque do fundo** P, M e G (8, 16 e 24 px): `backdrop-filter` no código e **Background
  blur** no Figma.
- Botão **Aplicar efeito vidro** e modelos **Card de vidro** e **Navbar de vidro**.
- **Fundo colorido** atrás da prévia do Montador (liga sozinho quando há vidro) e fundo
  **Colorido** nas Telas (gradiente com as cores da fundação, em cinza nos wireframes).
- Telas: a página ocupa a altura toda do aparelho na prévia.

### Adicionado — Telas: mockup de desktop e celular, wireframes
- **Telas** em `/kcx/telas`: empilhe componentes como seções de uma página (adicionar,
  reordenar, tirar; a mesma seção pode repetir) e veja num **mockup de desktop** (1440 × 900,
  moldura de navegador) ou de **celular** (390 × 844, moldura com entalhe), com zoom e rolagem.
- **Fidelidade:** Baixa (caixas em poucos cinzas, sem fotos), Média (escala de cinza fiel ao
  contraste, sem fotos) e Alta (cores, fotos e tokens). Cores dentro de gradientes, sombras e
  SVGs também viram cinza.
- **Aviso** quando uma seção é mais larga que o celular.
- **Baixar para o Figma:** a tela sai como componente com cada seção como instância; nos
  wireframes vão cópias "· wireframe baixa/média" dos componentes, sem mexer nos originais.
- Botão "Ver no mockup" no editor e atalho "Telas e wireframes" no KCX Studio.

### Adicionado — Montador: modelos e variantes
- **Modelos para começar:** Botão, Card, Navbar, Chip, Campo de texto, Item de lista, Hero e Em
  branco. Tudo continua editável camada por camada.
- **Eixos de variante no montador:** Tipo (Primário, Secundário com contorno, Fantasma), a
  partir do fundo da camada principal, e Tamanho (P, M, G: margem interna um passo da escala e
  textos 87,5% / 112,5%). No Figma viram eixos de variante junto com os estados (o Botão sai com
  45 variantes).
- **Espalhar de ponta a ponta** nas caixas (Figma: Space between), usado na Navbar.

### Adicionado — Fundação do design system e Montador visual
- **Fundação (tokens)** em `/kcx/fundacao`: cores com versão escura e clara (primária,
  secundária, destaque, fundo, superfície, borda, texto, texto suave, texto sobre a primária,
  perigo, sucesso, aviso), fontes, escala de texto (Display, H1–H3, Corpo, Pequeno, Legenda com
  tamanho de celular), raios, espaços (escala de 4 px) e sombras, com prévia ao vivo nos dois
  temas. Baixa CSS e JSON, importa e envia para o Figma.
- **No Figma:** tokens "Fundação/…" nas coleções KCX (modos Dark/Light e Desktop/Celular),
  estilos de texto com o tamanho ligado ao token e estilos de sombra. As variáveis dos
  componentes com o valor de um token viram **alias** dele, e os textos que batem com a escala
  recebem o estilo de texto. Reimportar atualiza sem duplicar.
- O construtor usa a paleta **Minha fundação** por padrão (tema oposto, texto suave e raio da
  fundação), e a exportação para o Figma leva a fundação junto (dá para desligar).
- **Montador visual** em `/kcx/montar`: componente do zero com camadas (caixa com Auto Layout,
  texto, ícone, imagem), cada propriedade escolhida entre os tokens; opção de estados de design
  system; prévia "como fica no Figma"; salva em Meus componentes e reabre no montador.

### Engenharia — auditoria de 19/11/2026
- **CI em todo push e PR** (`.github/workflows/ci.yml`): Prettier, ESLint, tipos do plugin do
  Figma, código gerado em dia, testes e build. A publicação continua só manual.
- **Componentes salvos não somem mais:** o armazenamento ganhou versão (v2) e migração do v1 (que
  fica como backup); o que não valida vai para “Para recuperar” no KCX Studio, com Baixar JSON e
  Descartar. Antes, salvar ou remover qualquer componente apagava de vez os inválidos.
- **ESLint** (angular-eslint) com fronteiras: o núcleo do KCX não importa Angular nem telas, e
  `core/` não importa de `pages/`; sem `any`. 11 problemas corrigidos.
- **Prettier** aplicado e obrigatório; **husky + lint-staged** no pre-commit; `npm run verificar`
  roda tudo de uma vez.
- `verificar:angular` e `verificar:kcx-angular` voltaram a passar: os geradores agora formatam a
  saída com o Prettier (antes acusavam diferença em 115 arquivos).
- `strict` e `strictTemplates` declarados no `tsconfig.json`; aviso de tipo corrigido no seletor
  de variantes.
- **Grade de variantes num documento só:** o Botão padrão abria 61 iframes na revisão; agora são 2
  (prévia + grade). A grade segue as cores do tema.
- Orçamentos de tamanho mais justos (inicial 400 kB) e um limite por chunk (700 kB).
- `CONTRIBUTING.md` com o fluxo de branches (worktree) e as regras do projeto.
- **Construtor do KCX: um arquivo por tipo** (`construtor/tipos/<categoria>/<tipo>.ts`). Os 5
  arquivos de até 1.984 linhas viraram 32 arquivos; o maior tem 538. Saída idêntica.
- **Importador do Figma em camadas** (`figma/construir/`): variáveis → nós → protótipo. A API
  pública não muda e a importação simulada dos 32 tipos dá o mesmo resultado byte a byte.

### Adicionado — mapa KCX × Figma (3 fases)
- **Fase 1 · estados e propriedades:** biblioteca **KCX Ícone** (40 ícones) com troca de instância
  e ícones sugeridos; estados Padrão, Hover, Pressionado, Foco e Desativado (While hovering e While
  pressing); Botão com tipos (Primário, Secundário, Terciário, Destrutivo), tamanhos e ícones;
  partes liga/desliga nos cards; aviso com tipos e “some sozinho”; navbar com página ativa; tab
  bar e rodapé com ícones trocáveis; formulário com Desativado e ícone; seção **Recursos do Figma**
  no construtor.
- **Fase 2 · variações e layout:** Botão carregando e contador; carrossel automático e pelo
  teclado; padding por lado, largura mín./máx. e quebra de linha; modos Claro/Escuro; curva do
  protótipo (mola, quique); 9 tipos novos — caixa de seleção, opções, chave, trilha, paginação,
  etapas, dica, faixa de aviso e menu suspenso.
- **Fase 3 · composição e protótipo:** instâncias de componentes (Hero e Login usam o Botão),
  slots (card e modal), tela de protótipo com Open/Close overlay, Esc fecha, chave que troca o
  tema (Set variable mode), On drag, layout Grid, modos Desktop/Celular; 6 tipos novos —
  seleção, controle deslizante, mega menu, botão flutuante, galeria em grade e login.
- Gatilhos novos: Mouse enter/leave, After delay, tecla, On drag. Mover/empurrar dentro de um
  componente viram Smart Animate (o Figma recusa na troca de variante).


- **Construtor em 3 etapas** (`/kcx/criar`): 1. Escolher tipo → 2. Personalizar → 3. Revisar e salvar.
  Salvar só acontece na revisão, depois de ver tudo.
- **Ver cada variante**: abaixo do preview, um grupo de botões por eixo (Estado, Botão, Tamanho…).
  Clicar troca o preview do código para aquela variante e mostra como ela fica no Figma.
- **Revisão**: todas as variantes lado a lado (como ficam no Figma), resumo com nome, itens, cores,
  animação e o que vai para o Figma. Clicar numa variante a mostra no preview.
- **Paletas prontas** (Kalixto, Oceano, Floresta, Pôr do sol, Claro, Preto e branco); as cores uma a
  uma ficam em “Escolher cada cor”.
- **Conjunto de botões**: cada botão tem a sua cor (seletor ao lado do nome).
- **Aviso “No Figma”** em cada animação do construtor: selo (Igual no Figma · Parte no Figma · Só no
  código) e, na animação escolhida e na revisão, o que acontece no Figma (ex.: “Sobe com sombra” ganha
  a sombra, mas não sobe).
- **Editor**: o mesmo seletor de variantes aparece abaixo do preview.
- `variantesDoComponente`, `eixosDoComponente` e `plano-html.ts` (prévia HTML de uma variante do plano
  do Figma, sem executar o código do componente).

### Corrigido

- **Sobe com sombra** sem sombra no preview: com a variante Padrão escolhida, o preview do código
  zerava a força da sombra e o :hover ficava sem sombra. Agora as variáveis do par Padrão/Hover
  ficam com o valor atual no código (quem faz o hover é o CSS); a prévia do Figma continua mostrando
  cada variante como ela é.
- **Preenche no hover** (Botão e Conjunto de botões): no Figma a variante Padrão agora é vazada
  (contorno e texto na cor do botão) e a Hover é preenchida (texto na cor de fundo). Antes as duas
  saíam cheias. O Smart Animate faz a transição entre elas.
- Conjunto de botões: no estado Padrão a sombra não aparece mais como um bloco duro no Figma (a cor
  da sombra usa a força da sombra como opacidade).

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
