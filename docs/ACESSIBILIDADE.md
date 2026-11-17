# Acessibilidade

A referência é a WCAG 2.2 AA. Este documento corresponde ao `ACCESSIBILITY.md`
pedido no Master Prompt.

## Verificação automática (axe-core 4, regras WCAG 2.0/2.1 A e AA + boas práticas)

| Data | Páginas | Violações |
|---|---|---|
| 17/11/2026 | `/biblioteca`, `/biblioteca?categoria=cursor`, os 10 `/efeitos/:id`, `/efeitos/nao-existe`, `/`, `/labs/css` | **0** |
| 17/11/2026 | Documento dentro do preview de cada um dos 10 kits | **0** |
| v1.1.0-rc.1 | As 19 rotas/demos anteriores | 0 (ver `QA.md`) |

O axe não substitui teste manual com leitor de tela, que ainda está pendente
(ver "Pendências").

## O que cada kit faz

| Requisito | Como foi resolvido |
|---|---|
| Redução de movimento | Todo kit tem regra `prefers-reduced-motion` no CSS ou no JS (há teste unitário para isso). Deslocamento, escala, rotação e pulso são removidos; transições só de opacidade ficam mais curtas |
| Alternativa ao mouse | Hover e foco têm o mesmo estilo (`:focus-visible`). Magnético e tilt são decorativos: o botão e o card continuam usáveis por teclado e toque, com foco visível |
| Toque | Efeitos de ponteiro só reagem a `pointerType === 'mouse'`; no toque o elemento fica parado e funcional |
| Leitor de tela | No Text Reveal, o título recebe `aria-label` com a frase inteira e os pedaços ficam com `aria-hidden`, então a frase é lida inteira, não letra por letra |
| Contraste | Texto branco sempre sobre fundos escuros ou gradientes escuros (`#d4119f → #7c3aed`) |

## Página do efeito

- **iframe:** tem `title` com o nome do efeito.
- **Abas de código:** usam `role="tablist"`/`tab`/`tabpanel`, com setas ← → e tabindex itinerante.
- **Controles:** são os mesmos `kx-demo-controls` dos laboratórios, com `label` e `output`.
- **Biblioteca:** o formulário de busca tem `role="search"` e a contagem de resultados é anunciada com `aria-live`.

## Pendências

- As animações GSAP e Three.js dos laboratórios antigos ainda não checam
  `prefers-reduced-motion` (P4 da auditoria). A correção está planejada para a Fase 7.
- Teste manual com NVDA e VoiceOver.
