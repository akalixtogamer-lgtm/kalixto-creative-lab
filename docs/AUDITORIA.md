# Fase Zero — Auditoria do Kalixto Creative Lab

Data: 17/11/2026 · Base auditada: `main` em `a16be36` (v1.1.0-rc.1).

Todos os números abaixo vêm de inspeção do código ou de comandos executados
nesta data (`ng version`, `npm test`, `ng build`, `npm audit`, `npm outdated`).

## 1. Diagnóstico

O projeto está saudável:

- O build passa sem avisos.
- Os 233 testes passam, em 9 arquivos.
- `npm audit` não aponta vulnerabilidades.
- A última verificação com axe-core (v1.1.0-rc.1) não encontrou violações.

Já existe a base de uma plataforma de estudo: 60 demos em 7 laboratórios. Cada
demo tem controles, código que acompanha os valores, explicação, dica, presets
e desafio.

O que falta para virar a "biblioteca técnica" do Master Prompt:

- **Não existe ficha técnica por efeito.** O modelo `Effect` tem só nome,
  laboratório, tópico, nível e descrição. Faltam aplicações, tecnologias,
  dependências, acessibilidade, performance, limitações, tipo de interação,
  tags e status.
- **A organização é por tecnologia, não por categoria de efeito.** Os 7
  laboratórios não correspondem às 15 categorias do mapa.
- **O código exibido é um trecho.** Ele não roda sozinho, então não pode ser
  copiado e usado como está em outro projeto.
- **Não há preview isolado.** Cada demo é renderizada dentro do próprio Angular,
  o que é seguro porque o código é fixo, mas não permite executar código editado.
- **A redução de movimento é parcial.** O CSS respeita
  `prefers-reduced-motion` (tokens de duração zerados), mas as animações em
  GSAP e Three.js não verificam essa preferência.

## 2. Arquitetura atual

| Item | Situação encontrada |
|---|---|
| Angular | 22.2.6 (CLI 22.2.7), standalone, sem NgModules |
| TypeScript | 6.0.3 |
| Node | 22.23.4 |
| Renderização | CSR (sem SSR), `@angular/build` (esbuild) |
| Rotas | 16 rotas filhas de um `Shell`, todas com `loadComponent` (lazy) e `withComponentInputBinding` |
| Estado | Signals; `ProgressoService` guarda progresso e presets no `localStorage` (`kalixto-lab:progresso:v1`) |
| Dados | `core/data/*.data.ts` — cada laboratório é uma lista de `LabDemo` tipada; `DEMOS_POR_LAB` gera a Biblioteca |
| Componentes compartilhados | `lab-layout`, `demo-controls`, `code-viewer`, `page-header`, `breadcrumb`, `status-badge`, `icon`, `logo` |
| Diretivas / pipes | Nenhuma diretiva ou pipe próprio |
| Estilos | `styles/tokens.css` (Design System Kalixto), `base`, `components`, `lab` + CSS por componente |
| Testes | Vitest + jsdom, 9 specs, 233 testes |
| Build | Inicial 293,85 kB (78,70 kB transferidos); maior chunk lazy 614,99 kB (Three.js) |

## 3. Funcionalidades existentes (preservar)

- **Dashboard** com progresso, os 7 laboratórios, Trilha, Exercícios (27),
  Comparador, Design System e Roadmap.
- **60 demos** em 7 laboratórios: CSS 9, GSAP 8, Scroll 9, SVG 5, Three.js 9,
  WebGL/GLSL 7 e Interface 13.
- **Biblioteca** com busca e filtros por laboratório, nível e situação.
- **Recursos de cada demo:** progresso, presets próprios e desafios.
- **Publicação:** build para GitHub Pages com `404.html` e workflow manual.

## 4. Problemas encontrados

| # | Problema | Gravidade |
|---|---|---|
| P1 | O modelo `Effect` não tem os campos de ficha técnica pedidos (seção 05) | Alta para o objetivo novo |
| P2 | Não há categorias de efeito, tags nem tipo de interação, então a busca é só textual | Média |
| P3 | O código das demos é um trecho e não reproduz o preview sozinho (regra 7 do novo briefing) | Média |
| P4 | Animações em GSAP/Three.js ignoram `prefers-reduced-motion` | Média (acessibilidade) |
| P5 | O chunk da Biblioteca (42 kB) importa todos os dados das demos, inclusive funções de código | Baixa |
| P6 | Não existe rota individual por efeito, só `labs/:lab?demo=` | Baixa |
| P7 | `typescript` 7 e `jsdom` 31 já saíram (major). Atualizar agora não traz benefício e pode quebrar o Angular 22 | Informativo |

## 5. Recursos que devem ser preservados

- O Design System (tokens, glass, gradiente de botão com contraste AA).
- O padrão de dados tipados por laboratório e o `ProgressoService`, inclusive a chave de storage.
- As URLs atuais (`/labs/*?demo=`, `/biblioteca?lab=`), que já são usadas em links e no Reels.
- O `lab-layout` e os laboratórios, que não serão reescritos.

## 6. Melhorias recomendadas

1. Ficha técnica tipada (`EffectSheet`) com todos os campos da seção 05.
2. Registro central de efeitos (`EFFECT_REGISTRY`), extensível: um arquivo por efeito.
3. As 15 categorias como dado. As 60 demos existentes entram no catálogo
   classificadas por categoria, sem duplicar código.
4. Efeitos novos são **kits autossuficientes**: a mesma função gera HTML, CSS e
   JS a partir dos parâmetros. O preview executa exatamente esse código num
   `iframe` isolado, então código e preview não podem divergir.
5. Rota `/efeitos/:id` com ficha completa, preview, controles, código e download.
6. Redução de movimento nos kits novos já na Fase 1. Nos laboratórios antigos,
   na Fase 7 (P4).

## 7. Arquitetura proposta (Fase 1)

```
core/models/effect-sheet.model.ts   ficha técnica, categorias, níveis, interações
core/efeitos/categorias.ts          as 15 categorias do mapa
core/efeitos/kits/*.kit.ts          um arquivo por efeito novo (ficha + params + gerar())
core/efeitos/registry.ts            EFFECT_REGISTRY (kits) + classificação das 60 demos
core/efeitos/sandbox.ts             monta o documento isolado (CSP, sem rede)
pages/efeito/                       página /efeitos/:id (preview, controles, código, ficha)
pages/biblioteca/                   passa a listar kits + demos, com filtros novos
```

### Segurança do preview

- `<iframe sandbox="allow-scripts">` **sem** `allow-same-origin`: o documento
  roda numa origem opaca e não acessa o Angular, o `localStorage` nem os cookies.
- O documento leva um CSP próprio (`default-src 'none'`), então não carrega
  nada da rede.
- Não há `eval` nem `new Function` na aplicação. O código só é executado dentro do iframe.
- Na Fase 1 o código não é editável, só configurável pelos controles. A edição
  livre entra no Code Lab (Fase 2), dentro do mesmo sandbox.

## 8. Plano de implementação

| Fase | Entrega | Situação |
|---|---|---|
| 0 | Esta auditoria | ✅ |
| 1 | Fichas, registro, 15 categorias, 10 efeitos (Fade, Slide, Scale, Hover, Magnetic, Glow, Gradient, Text Reveal, Card Tilt, Animated Border), busca e filtros, rota por efeito | Em execução |
| 2 | Code Lab (edição no sandbox, abas, numeração, download zip), versão Angular dos kits, Code Explainer em 3 níveis | Próxima |
| 3 | Kits de scroll, cursor, máscara e distorção de imagem; avaliar Lenis | — |
| 4 | Comparação lado a lado e Composer de camadas; favoritos e histórico (IndexedDB) | — |
| 5 | Canvas e partículas; avaliar Lottie, Rive e PixiJS | — |
| 6 | Learning Center e exportação completa | — |
| 7 | QA final, incluindo redução de movimento nos laboratórios antigos (P4) | — |

## 9. Riscos técnicos

- **Peso dos dados:** o catálogo pode crescer muito. Os kits ficam em arquivos
  separados para permitir carregar sob demanda depois.
- **Animações sem hover:** efeitos de cursor (magnético, tilt) não existem no
  toque. Cada kit precisa de uma alternativa por teclado e foco, documentada na ficha.
- **jsdom:** os testes não executam o iframe. A execução real é verificada no
  navegador (Playwright), não só por teste unitário.
- **Duas listagens:** demos e kits convivem na Biblioteca. Para não confundir,
  cada card mostra se é "Kit com ficha completa" ou "Demo de laboratório".

## 10. Critérios de conclusão da Fase 1

- Os 10 kits têm preview funcionando no iframe, controles com efeito real,
  código idêntico ao executado e ficha preenchida.
- A Biblioteca busca por nome, descrição, tecnologia, categoria, aplicação e
  tags. Filtra por categoria, nível, interação, dependência e tipo; ordena por
  nome e por nível.
- `/efeitos/:id` funciona por link direto e recarregando a página.
- Nenhuma funcionalidade existente foi removida e os testes antigos seguem passando.
- Há testes novos para registro, fichas e geração de código; o build passa; o
  axe não acusa violações nas páginas novas; o layout funciona em 390, 820 e 1440 px.
