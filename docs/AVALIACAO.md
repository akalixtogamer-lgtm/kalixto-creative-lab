# Roteiro de avaliação — todas as fases

Cada fase está numa branch e numa versão do Git, para você avaliar etapa por etapa:

| Fase | O que entrega | Versão (tag) | Branch |
|---|---|---|---|
| 1 | Fundação Angular | `v0.1.0` | `main` |
| 2 | MVP: CSS Playground, GSAP Studio, Scroll Lab | `v0.4.0` | `fase-2` |
| 3 | Organização educacional: SVG Lab, Trilha, Exercícios, Comparador | `v0.5.0` | `fase-3` |
| 4 | Three.js Lab | `v0.6.0` | `fase-4` |
| 5 | WebGL & GLSL | `v0.7.0` | `fase-5` |
| 6 | QA, acessibilidade, performance, documentação | `v1.0.0-rc.1` | `fase-6` (atual) |

O mais simples é avaliar tudo na versão atual (`fase-6`), que contém todas as fases.
Para ver uma fase isolada: `git checkout v0.4.0` (por exemplo), `npm install`, `npm start`. Volte com `git checkout fase-6`.

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

## Fase 6 — Qualidade

- [ ] Celular (F12 → modo dispositivo): nenhuma página rola para o lado; menu abre e fecha
- [ ] Teclado: Tab mostra "Pular para o conteúdo" e o foco é sempre visível
- [ ] Logo no menu, no Dashboard, na barra do celular e na aba do navegador
- [ ] `npm test` → **174 passed**
- [ ] `npm run build:pages` termina sem erro

---

**Tudo certo?** Me avise para eu juntar tudo na `main`, criar a tag `v1.0.0` e preparar a publicação.
**Algo errado?** Diga a fase e o que aconteceu (um print ajuda) — corrijo na branch certa.
