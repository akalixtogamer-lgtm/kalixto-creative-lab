# KCX no Kalixto Creative Lab — auditoria, arquitetura e guia

## 1. Auditoria (antes do KCX, v1.8.0-rc.1)

| Item | Situação encontrada |
|---|---|
| Stack | Angular 22 standalone + signals, Vitest (jsdom), sem dependências de UI |
| Biblioteca | 56 kits (`core/efeitos/kits/*.kit.ts`): ficha técnica, `params` (range/select), `gerar(valores)` → HTML/CSS/JS, versão Angular, explicação em 3 níveis, glossário |
| Preview dos kits | iframe `sandbox="allow-scripts"` + CSP `default-src 'none'`; **cada ajuste regenera o código e recria o iframe** (a animação recomeça) |
| Parâmetros | Interpolados no texto do código — não existem como variáveis independentes; não há tipos cor/boolean/tempo/gradiente |
| Presets | Só nas demos dos labs (fixos no código); presets do usuário no `ProgressoService` |
| Exportação | `.zip` (HTML/CSS/JS + Angular + vendor) e `.html` único; nada para Figma; nenhum formato de troca |
| Dependências | GSAP 3.15 (licença Standard "No Charge", **não é open source**), Lenis (MIT), Three.js (MIT) |
| Testes | 688 passando; deploy no GitHub Pages **só manual** (workflow com confirmação) |

Conclusão: a arquitetura "dados descrevem, componentes executam" foi mantida. O KCX entra como uma
**camada nova e independente** (`src/app/kcx/`, TypeScript puro), sem alterar os labs nem os kits.

## 2. Arquitetura

```
src/app/kcx/                   ← núcleo KCX (sem Angular; usado pelo lab, pelos testes e pelo plugin)
  kcx.types.ts                 tipos do formato
  kcx.schema.ts                JSON Schema
  validar.ts                   validação (forma + regras)
  serializar.ts                criar/serializar/desserializar, migração, comparação, mesclar atualização
  unidades.ts                  conversão de unidades e cores
  resolver.ts                  variáveis → vínculos → operações → valores CSS/atributos/textos
  runtime.ts                   runtime do preview (postMessage) e runtime standalone (KCX.set)
  documento.ts                 documento HTML (preview e exportado)
  figma-plano.ts               plano de importação no Figma (o que será criado e vinculado)
  figma/construir.ts           executor do plano dentro do Figma
  exportar-kcx.ts              5 modos, tokens W3C, SVG estático, código independente (.zip)
  composicao.ts                camadas + variáveis compartilhadas
  presets.ts                   presets do usuário (localStorage) com import/export
  angular.ts                   gerador do componente Angular standalone (input() por variável)
  svg-caminho.ts               comprimento, ponto e corte de caminhos SVG
  componentes/                 Neon Glow, Animated Gradient, SVG Motion, Animated Border, Hover Lift, Gauge Meter
src/app/kcx-angular/           ← componentes Angular gerados (npm run gerar:kcx-angular)
src/app/pages/kcx/             ← interface Angular
  kcx-studio/                  /kcx — componentes, o que é editável no Figma, validador de arquivos, licenças
  kcx-editor/                  /kcx/:id — editor
  kcx-compositor/              /kcx/compor — composição
  kcx-preview/                 iframe ao vivo (sem recarregar)
  kcx-controles/               controles por tipo de variável
  kcx-presets-painel/  kcx-codigo-painel/  kcx-exportar-painel/  kcx-importar-painel/
figma-bridge/                  ← plugin do Figma (src + dist)
```

### Fluxo do preview ao vivo

```
controle → valores (signal) → resolverSaidas() → postMessage({kcx:'set', cssVars, atributos, textos})
                                                    ↓
                       iframe (runtime) → documentElement.style.setProperty('--kcx-…')
```

O documento do iframe depende só do **código**; os valores são lidos sem rastrear (`untracked`), então
mudar uma variável nunca recria o iframe. O teste do editor confirma que o iframe continua o mesmo e que a
mensagem leva o novo valor; no navegador (Playwright + Chrome) a duração da animação mudou de 2000 ms para
5000 ms sem a página do iframe recarregar.

### Três camadas sincronizadas

| Camada | Como sincroniza |
|---|---|
| Variáveis → preview | postMessage (acima) |
| Variáveis → código | o bloco `:root` é gerado das variáveis; o CSS usa `var(--kcx-…)` |
| Código → variáveis | “Edição avançada”: o `:root` editado é lido de volta (`lerBlocoRoot`) e validado; HTML/CSS/JS editados passam a rodar no preview, continuando controlados pelas variáveis |

## 3. Como criar um componente KCX

1. Crie `src/app/kcx/componentes/<id>.ts` exportando um `KcxComponente` (use `variavel()` de `_base.ts`).
2. Escreva o CSS só com `var(--kcx-<id>-…)` no que for configurável.
3. Para cada variável, liste os **vínculos** (o que ela controla). Uma variável pode controlar várias propriedades.
4. Descreva a `estrutura` visual com `$var`/`$derivado` nos campos que devem ficar vinculados no Figma.
5. Liste `estados` (viram variantes), `presets`, `animacoes` e a `compatibilidade` honesta (nível, limitações).
6. Adicione em `componentes/index.ts`. Rode `npm test` — os testes verificam schema, vínculos, NaN, uso de
   todas as custom properties no CSS, runtime = resolver, plano do Figma e importação simulada.
7. `npm run kcx:schema` atualiza `docs/kcx/exemplos/`.

## 4. Licenças

| Item | Licença | Observação |
|---|---|---|
| Núcleo KCX, runtime, componentes de referência, plugin | MIT | sem dependências externas |
| `@figma/plugin-typings` | MIT | só tipos, em desenvolvimento |
| GSAP / ScrollTrigger | GSAP Standard "No Charge" | gratuita, comercial, **não é open source**; proíbe uso em ferramentas visuais de animação sem código que concorram com o Webflow — por isso o KCX não usa GSAP. |
| Lenis, Three.js | MIT | usados só nos kits e labs; ficam fora do KCX (o KCX aceita só CSS, SVG e Angular) |

## 5. Critérios de aceitação

| # | Critério | Onde é provado |
|---|---|---|
| 1–4 | Variáveis controlam duração, cor e intensidade reais | `kcx-core.spec.ts` (“variáveis controlam o componente”) + navegador |
| 5 | Preview em tempo real sem recarregar | `kcx.spec.ts` (mesmo iframe) + teste no Chrome |
| 6 | Exportação KCX | `kcx-core.spec.ts` (serializar/desserializar), botão no editor |
| 7–9 | Plugin importa, cria camadas editáveis, cria e vincula variáveis | `figma-bridge.spec.ts` + teste real no Figma (48 vínculos, 0 recusados) |
| 10 | Valores preservados | plano usa os valores atuais; ida e volta testada |
| 11 | Código original recuperável | pacote guardado no componente + quadro de documentação + `.zip` |
| 12 | Limitações informadas | painel de exportação, UI do plugin, quadro de documentação, descrição do componente |
| 13 | Testes | `npm test` |
| 14 | Reuso fora do lab | `.zip` com `index.html`, CSS com `:root`, `kcx-runtime.js`, tokens W3C, SVG |

## 6. Próximas fases

- Aplicar variáveis funcionais (nível 1/2) aos demais kits, começando por glass-card, animated-border e text-reveal.
- Usar as APIs de *motion* do Figma (keyframes) quando estiverem liberadas, para levar a pulsação e o
  desenho do traço como animação nativa.
- Text Reveal e Hover Interaction como camadas da composição.
