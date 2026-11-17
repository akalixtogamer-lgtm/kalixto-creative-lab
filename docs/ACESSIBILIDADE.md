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

## Fase 2 (17/11/2026)

- **Code Lab:**
  - As abas usam `role="tablist"`, as setas ← → e tabindex itinerante.
  - O editor é um `<textarea>` com rótulo. **Tab** insere dois espaços e **Esc** tira o foco do editor, para quem navega pelo teclado não ficar preso.
  - Os avisos ("rodando o seu código editado" e erros) são anunciados (`role="status"` / `role="alert"`).
  - No diff, cada linha alterada traz o texto "adicionada:"/"removida:" para leitores de tela, além da cor.
- **Code Explainer:** os níveis são um grupo de rádio nativo (`fieldset` + `legend`), e a lista é atualizada com `aria-live`.
- **Controles:** ficam num `fieldset` que é desabilitado enquanto o código editado está em uso, com a explicação visível.
- **Verificação com axe:** 0 violações em `/efeitos/*` (modo isolado, modo Angular, editando, comparando), em `/labs/css`, `/labs/gsap`, `/comparador` e em `/biblioteca`.

## Fase 3 (17/11/2026)

- **Redução de movimento** (verificado no Chromium com `prefers-reduced-motion: reduce`):
  - **Revelar:** os cards aparecem sem deslocamento.
  - **Parallax:** as camadas ficam paradas (`transform` vazio).
  - **GSAP:** os cards ficam visíveis (opacidade 1), porque as animações só são criadas dentro de `gsap.matchMedia('(prefers-reduced-motion: no-preference)')`.
  - **Lenis:** não é iniciado.
  - **Distorção:** fica parada no hover.
  - **Cursor:** o anel acompanha sem atraso.
- **Cursor personalizado:**
  - É decorativo (`aria-hidden`) e só aparece com `pointer: fine`.
  - O cursor nativo continua visível por padrão.
- **Lanterna:** o texto escondido está no HTML (o leitor de tela lê), e o botão "Acender tudo" dá o mesmo acesso sem ponteiro.
- **Distorção:** a cena tem `role="img"` com nome, e o efeito também liga com o foco do teclado.
- **Verificação com axe:**
  - **Página `/efeitos/*` dos 8 kits:** 0 violações. Sem overflow horizontal em 1440, 820 e 390 px.
  - **Dentro dos iframes de demonstração:** só aparecem regras de boas práticas de página inteira (`landmark-one-main`, `region`, `page-has-heading-one`), porque o documento é um trecho de exemplo, não uma página.
