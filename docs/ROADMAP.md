# Roadmap — KALIXTO CREATIVE LAB

Desenvolvimento incremental: **uma fase por vez**, e cada fase só é concluída depois de validada.
Os dados exibidos na página `/roadmap` ficam em `src/app/core/data/roadmap.data.ts`.

| Fase | Nome | Situação | Branch / tag |
|---|---|---|---|
| 1 | Fundação Angular | ✅ Concluída | `main` · `v0.1.0` |
| 2 | MVP Funcional (CSS, GSAP, Scroll) | 🟡 Em andamento | `fase-2` |
| 3 | Organização Educacional | Futura | `fase-3` |
| 4 | Three.js e Experiências 3D | 🔒 Bloqueada | `fase-4` |
| 5 | WebGL e GLSL | 🔒 Bloqueada | `fase-5` |
| 6 | Otimização e Consolidação | Futura | `fase-6` |

**Regra:** não avançar para Three.js enquanto os três primeiros laboratórios não estiverem funcionais e validados.

---

## Fase 1 — Fundação Angular

**Critério de conclusão:** aplicação executável, arquitetura organizada e navegação funcional.

- [x] Configuração do Angular
- [x] Verificação das versões e dependências → `docs/DEPENDENCIAS.md`
- [x] Arquitetura de componentes
- [x] Design System Kalixto
- [x] Dashboard
- [x] Navegação
- [x] Estrutura da biblioteca de efeitos
- [x] Liberada pelo Wallace para seguir

## Fase 2 — MVP Funcional (em andamento)

- [x] Revisão de UI/UX da base
- [x] Laboratório 01 — CSS Playground (8 demos) → **testar com `docs/CHECKLIST-FASE-2-CSS.md`**
- [ ] Laboratório 02 — GSAP Studio (instalar `gsap` nesta fase)
- [ ] Laboratório 03 — Scroll Lab
- [x] Code Viewer
- [x] Documentação dos efeitos (CSS)
- [x] Controles interativos, botões de executar e reiniciar (CSS)
- [ ] Responsividade e testes funcionais

---

## Critérios de passagem entre fases

1. Funcionalidade implementada
2. Demonstração executável
3. Código-fonte disponível
4. Explicação didática
5. Controles funcionando
6. Responsividade validada
7. Ausência de erros críticos
8. Performance aceitável
9. Documentação atualizada

Não considerar uma fase concluída só porque a interface foi construída.

## Fluxo de versionamento

```
main      ← só recebe fases validadas (versões estáveis, com tag)
fase-N    ← trabalho em andamento da fase atual
```

Quando a fase for validada: merge de `fase-N` em `main`, tag `vX.Y.0`, atualizar CHANGELOG e esta página.
