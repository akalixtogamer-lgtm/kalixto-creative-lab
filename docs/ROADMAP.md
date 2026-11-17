# Roadmap — KALIXTO CREATIVE LAB

Desenvolvimento incremental, uma fase por vez. Os dados exibidos na página `/roadmap` ficam em
`src/app/core/data/roadmap.data.ts`.

| Fase | Nome | Situação | Versão | Branch |
|---|---|---|---|---|
| 1 | Fundação Angular | ✅ Validada | `v0.1.0` | `main` |
| 2 | MVP Funcional (CSS, GSAP, Scroll) | 🟡 Pronta para avaliar | `v0.4.0` | `fase-2` |
| 3 | Organização Educacional | 🟡 Pronta para avaliar | `v0.5.0` | `fase-3` |
| 4 | Three.js e Experiências 3D | 🟡 Pronta para avaliar | `v0.6.0` | `fase-4` |
| 5 | WebGL e GLSL | 🟡 Pronta para avaliar | `v0.7.0` | `fase-5` |
| 6 | Otimização e Consolidação | 🟡 Pronta para avaliar | `v1.0.0-rc.1` | `fase-6` |

> A regra original pedia validar o MVP antes do Three.js. Em 16/11/2026 o Wallace pediu para produzir todas as
> fases direto e avaliar cada etapa no final; por isso cada fase tem sua branch e sua tag.

Roteiro de avaliação: [`AVALIACAO.md`](AVALIACAO.md).

### Segunda etapa: biblioteca técnica (Master Prompt de 17/11/2026)

O roadmap desta etapa substitui o `IMPLEMENTATION_ROADMAP.md` pedido no Master
Prompt. O plano completo está em [`AUDITORIA.md`](AUDITORIA.md).

| Fase | Entrega | Situação | Versão | Branch |
|---|---|---|---|---|
| 0 | Auditoria do projeto | ✅ | — | `efeitos-fase1` |
| 1 | Fichas, registro, 15 categorias, 10 kits, busca/filtros, `/efeitos/:id` | 🟡 Pronta para avaliar | `v1.2.0-rc.1` | `efeitos-fase1` |
| 2 | Code Lab (edição no sandbox), versão Angular dos kits, Code Explainer | ⏳ | — | — |
| 3 | Scroll, cursor, máscaras, distorção de imagem; avaliar Lenis | ⏳ | — | — |
| 4 | Comparação lado a lado, Composer de camadas, favoritos e histórico | ⏳ | — | — |
| 5 | Canvas e partículas; avaliar Lottie, Rive e PixiJS | ⏳ | — | — |
| 6 | Learning Center e exportação completa | ⏳ | — | — |
| 7 | QA final e estabilização | ⏳ | — | — |

---

## Fase 1 — Fundação Angular ✅
Angular 22, Design System Kalixto, Dashboard, navegação, estrutura da biblioteca.

## Fase 2 — MVP Funcional
- [x] Revisão de UI/UX da base e logo Kalixto
- [x] CSS Playground — 8 demos
- [x] GSAP Studio — 7 demos
- [x] Scroll Lab — 7 demos
- [x] Code Viewer, documentação dos efeitos, controles, Executar/Reiniciar
- [x] Layout comum dos labs, presets, desafios e progresso salvo
- [x] Responsividade e testes funcionais

## Fase 3 — Organização Educacional
- [x] Biblioteca de efeitos com filtros
- [x] SVG Lab — 5 demos
- [x] Comparador de tecnologias
- [x] Trilha de aprendizagem
- [x] Exercícios (27) e desafios (60)
- [x] Interface Lab (13 demos) a partir das referências do Wallace — ver [`REFERENCIAS.md`](REFERENCIAS.md)
- [x] Presets (prontos e do usuário)
- [x] Persistência local do progresso

## Fase 4 — Three.js
- [x] Objetos, câmeras, iluminação, materiais, texturas
- [x] Animações 3D, interação por mouse, raycasting
- [x] Importação GLTF/GLB (modelo próprio + arquivo do usuário)

## Fase 5 — WebGL e GLSL
- [x] Vertex e fragment shaders, GLSL básico
- [x] Noise, distortion, efeitos procedurais
- [x] Transições com shaders (GSAP + Three.js)

## Fase 6 — Otimização e Consolidação
- [x] QA completo — ver [`QA.md`](QA.md)
- [x] Responsividade (390 / 820 / 1440 px) e acessibilidade (axe: 0 violações)
- [x] Performance (carregamento inicial ~78 kB; bibliotecas pesadas sob demanda)
- [x] Documentação final
- [x] Preparação para o GitHub Pages (testado em subpasta com links diretos)
- [ ] **Validação do Wallace** → depois: merge na `main`, tag `v1.0.0` e publicação

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

## Fluxo de versionamento

```
main     ← só versões validadas (com tag)
fase-N   ← cada fase, partindo da anterior
```
