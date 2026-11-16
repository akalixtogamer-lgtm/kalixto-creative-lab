# Checklist de validação — Fase 1

Rode `npm install` (primeira vez) e `npm start`, abra http://localhost:4200 e marque cada item.

## Executável
- [ ] `npm start` abre sem erros no terminal
- [ ] `npm test` mostra **16 passed**
- [ ] `npm run build` termina sem erro
- [ ] Console do navegador (F12) sem erros vermelhos

## Navegação
- [ ] Dashboard abre na página inicial
- [ ] Todos os itens do menu levam à página certa
- [ ] O item ativo do menu fica destacado
- [ ] Os cards do Dashboard abrem os laboratórios
- [ ] Three.js Lab e WebGL mostram o aviso de bloqueado
- [ ] Endereço inexistente (ex.: `/teste`) mostra a página 404
- [ ] Botão voltar do navegador funciona

## Biblioteca
- [ ] A busca filtra os efeitos
- [ ] O filtro por laboratório funciona
- [ ] "Ver na biblioteca" dentro de um lab já abre filtrado

## Responsividade
- [ ] Celular (F12 → modo dispositivo, ~390px): aparece o botão ☰
- [ ] O menu abre, fecha no ✕, no clique fora, com Esc e ao escolher uma página
- [ ] Nenhuma página tem rolagem para os lados
- [ ] Tablet (~800px) e desktop grande ficam organizados

## Acessibilidade
- [ ] Dá para navegar só com Tab e Enter; o foco aparece
- [ ] O primeiro Tab mostra "Pular para o conteúdo"

## Design System
- [ ] Cores, fontes e componentes da página Design System estão do jeito que você quer

---

**Tudo marcado?** Me avise para eu fechar a Fase 1 (merge em `main`, tag `v0.1.0`) e começar a Fase 2.
Achou problema? Anote em `docs/PROBLEMAS-CONHECIDOS.md` ou me mande.
