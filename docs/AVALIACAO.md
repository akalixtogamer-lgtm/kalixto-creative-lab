# Roteiro de avaliação — todas as fases

Cada fase está numa branch e numa versão do Git, para você avaliar etapa por etapa:

| Fase | O que entrega | Versão (tag) | Branch |
|---|---|---|---|
| 1 | Fundação Angular | `v0.1.0` | `main` |
| 2 | MVP: CSS Playground, GSAP Studio, Scroll Lab | `v0.4.0` | `fase-2` |
| 3 | Organização educacional: SVG Lab, Trilha, Exercícios, Comparador | `v0.5.0` | `fase-3` |
| 4 | Three.js Lab | `v0.6.0` | `fase-4` |
| 5 | WebGL & GLSL | `v0.7.0` | `fase-5` |
| 6 | QA, acessibilidade, performance, documentação | `v1.0.0-rc.1` | `fase-6` |
| + | Navbar ao rolar e divisores de seção (pedido de 16/11) | `v1.0.0-rc.2` | `melhorias-navbar-divisores` |
| + | Efeitos das referências: Interface Lab, capítulos, SplitText | `v1.1.0-rc.1` | `efeitos-referencias` |
| B1 | Biblioteca técnica, Fase 1: fichas, 15 categorias, 10 kits, `/efeitos/:id` | `v1.2.0-rc.1` | `efeitos-fase1` (atual) |

O mais simples é avaliar tudo na versão atual (`efeitos-fase1`), que contém todas as fases.
Para ver uma fase isolada: `git checkout v0.4.0` (por exemplo), `npm install`, `npm start`. Volte com `git checkout efeitos-fase1`.

Antes de começar: `npm install` e `npm start`, depois abra http://localhost:4200.

---

## Fase 2 — MVP (CSS, GSAP, Scroll)

Para **cada** laboratório (menu → 01, 02 e 03):
- [ ] Todas as demos abrem pela faixa de botões
- [ ] O botão principal executa algo visível; **Reiniciar** volta ao início
- [ ] Mexer nos controles muda o efeito e o código
- [ ] **Copiar** copia o código
- [ ] Um preset pronto (chips abaixo dos controles) muda os valores
- [ ] Salvar um preset seu (★) e usá-lo de novo
- [ ] Fazer um **desafio**: ajustar até "Valores certos!" e executar → aparece "Desafio concluído"
- [ ] A demo executada ganha ✓ na faixa de botões

Scroll Lab, em especial:
- [ ] A rolagem dentro da janela do palco anima a cena; "Rolar automaticamente" funciona
- [ ] Pin, Horizontal e Storytelling prendem a seção enquanto você rola

## Fase 3 — Organização educacional

- [ ] **SVG Lab**: traço se desenha, máscara revela a logo, círculo vira estrela/coração/raio, texto ondula, foguete segue o caminho
- [ ] **Trilha**: mostra seu progresso; "Continuar" leva à próxima demo pendente; "Zerar progresso" pede confirmação
- [ ] **Exercícios**: responder mostra certo/errado e a explicação; "Refazer" limpa
- [ ] **Comparador**: "Executar nos três" roda o mesmo efeito em CSS, Web Animations e GSAP
- [ ] **Biblioteca**: filtros de laboratório, nível e "já executados"
- [ ] Fechar e abrir o navegador: o progresso continua lá

## Fase 4 — Three.js

- [ ] As 9 cenas aparecem; arrastar gira a câmera e a roda/pinça aproxima
- [ ] Materiais, luzes e texturas mudam ao vivo
- [ ] Animação 3D: o cubo pula com achatamento
- [ ] Interação por mouse e Raycasting respondem ao ponteiro (no celular, ao toque)
- [ ] GLTF: o troféu Kalixto carrega; "Carregar meu .glb" abre um modelo seu

## Fase 5 — WebGL & GLSL

- [ ] Os 7 shaders aparecem e reagem aos controles ao vivo
- [ ] O código mostrado é o GLSL de verdade, com os valores dos uniforms
- [ ] Distortion reage ao mouse; Transição troca de imagem ao clicar

## Pedido extra — navbar e divisores

- [ ] **Scroll Lab → Navbar ao rolar**: transparente sobre o hero; ao rolar ganha fundo e sombra; no modo "esconde ao descer" some e volta ao subir
- [ ] **CSS Playground → Divisores de seção**: diagonal, seta, curva, zigue-zague e ondas; altura e direção mudam ao vivo

## Pedido extra — efeitos das referências (`docs/REFERENCIAS.md`)

**Interface Lab** (menu → 07):
- [ ] Hero editorial: "Tocar entrada" anima menu, título (subir ou máscara), linha e botão; o botão circular reage ao hover
- [ ] Órbita: o planeta percorre o anel; as esferas seguem o mouse em profundidades diferentes
- [ ] Texto atrás do objeto: a silhueta cobre a base das letras na proporção escolhida
- [ ] Imagem em formas: pílulas, corte em X, forma orgânica e onda; "Revelar formas" anima
- [ ] Divisores SVG: os 17 formatos, com inverter e espelhar
- [ ] Carrossel de vidro: arrastar encaixa; card ativo cresce; paginação "0N — 05" atualiza
- [ ] Números: o gráfico se desenha e o número conta
- [ ] Tipografia vazada, bento grid, cards com profundidade, grão de filme, botão magnético e faixa infinita

**Scroll Lab → Capítulos**: a linha à esquerda se preenche e o capítulo do centro acende.
**GSAP Studio → SplitText**: letras, palavras e linhas com os quatro efeitos; Reiniciar devolve o texto original.

## Biblioteca técnica · Fase 1 (`docs/AUDITORIA.md`)

**Biblioteca** (menu → Biblioteca de efeitos):
- [ ] O texto do topo diz "10 kits … e 60 demos"; os kits aparecem primeiro, com borda ciano e o selo "Ficha completa"
- [ ] A busca encontra por tecnologia e aplicação, ignorando acentos: "botao", "hero", "conic"
- [ ] Os filtros Categoria, Tipo, Nível, Interação e Dependências funcionam; "Limpar filtros" volta tudo
- [ ] `/biblioteca?categoria=cursor` abre já filtrada

**Página de cada kit** (`/efeitos/fade-in` e os outros nove):
- [ ] O preview funciona; mexer em qualquer controle muda o preview **e** a aba de código
- [ ] Reiniciar, Restaurar valores e Baixar `.html` funcionam (o arquivo baixado abre sozinho no navegador)
- [ ] Magnético e Card tilt reagem ao mouse; com Tab, o botão e o card mostram o foco
- [ ] A ficha técnica aparece completa embaixo; as setas levam ao kit anterior e ao próximo
- [ ] Recarregar a página (F5) num `/efeitos/...` continua funcionando

## Fase 6 — Qualidade

- [ ] Celular (F12 → modo dispositivo): nenhuma página rola para o lado; menu abre e fecha
- [ ] Teclado: Tab mostra "Pular para o conteúdo" e o foco é sempre visível
- [ ] Logo no menu, no Dashboard, na barra do celular e na aba do navegador
- [ ] `npm test` → **233 passed**
- [ ] `npm run build:pages` termina sem erro

---

**Tudo certo?** Me avise para eu juntar tudo na `main`, criar a tag `v1.0.0` e preparar a publicação.
**Algo errado?** Diga a fase e o que aconteceu (um print ajuda) — corrijo na branch certa.
