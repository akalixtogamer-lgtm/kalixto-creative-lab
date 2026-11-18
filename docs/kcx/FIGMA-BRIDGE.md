# Kalixto Creative Lab — Figma Bridge

Plugin do Figma que importa pacotes KCX e cria estruturas nativas e editáveis.

| | |
|---|---|
| Código | [`figma-bridge/src/`](../../figma-bridge/src) (`code.ts`, `ui.html`) + [`src/app/kcx/figma/construir.ts`](../../src/app/kcx/figma/construir.ts) |
| Plano de importação | [`src/app/kcx/figma-plano.ts`](../../src/app/kcx/figma-plano.ts) — o mesmo usado pelo painel do lab |
| Build | `npm run figma:build` → `figma-bridge/dist/` (e cópia em `public/figma-bridge/` para o download no lab) |
| Checagem de tipos | `npm run figma:check` (com `@figma/plugin-typings`, MIT) |
| Rede | nenhuma (`networkAccess: none`) |

## Instalação e uso

Veja [`figma-bridge/LEIA-ME.md`](../../figma-bridge/LEIA-ME.md).

## O que é criado

1. **Coleções** `KCX · Colors | Dimensions | Spacing | Typography | Motion | Effects | Components`
   (reaproveitadas se já existirem). `Colors` ganha os modos **Dark** e **Light** quando alguma cor tem `modos`.
   Em planos que limitam modos, o plugin avisa e usa só o primeiro.
2. **Variáveis** com tipo (COLOR, FLOAT, BOOLEAN, STRING, TIMING, EASING), descrição, escopo e
   code syntax `WEB` (`var(--kcx-…)`). Documentais ficam sem escopo.
3. **Componente** com variantes (`Estado=…` e, quando há, `Forma=…`), propriedades de texto com o padrão
   ligado à variável de texto, e o pacote KCX guardado em `sharedPluginData` (`kcx`).
4. **Vínculos**: preenchimentos sólidos, paradas de gradiente, cor e espessura do traço, raio canto a canto,
   opacidade, visibilidade, largura/altura, padding e espaço do Auto Layout, sombra (cor, raio, espalhamento),
   desfoque de camada/fundo, traço de vetores vindos de SVG.
5. **Quadro de documentação** com níveis, limitações, variáveis documentais e o código-fonte.
6. **Composição**: quadro com uma instância de cada camada.

Duplicações: o plugin mostra o que já existe e deixa escolher entre **atualizar** as variáveis
existentes ou **criar cópias** com outro nome.

## Regras do Figma descobertas no teste real

| Regra | Como o KCX trata |
|---|---|
| Variável numérica na **opacidade** é lida em **porcentagem** (0–100) | O plano converte 0–1 → 0–100 e o “Figma → Lab” converte de volta |
| **Escopos** só existem em COLOR, FLOAT e STRING (`Cannot set scopes on this variable type` em BOOLEAN/TIMING/EASING) | Escopo só é definido nesses três tipos |
| `cornerRadius` é vinculado canto a canto | O plugin vincula `topLeftRadius`, `topRightRadius`, `bottomLeftRadius`, `bottomRightRadius` |
| Paradas de gradiente aceitam `boundVariables.color` | Cada parada recebe o alias da variável |
| Matriz do gradiente | Conferida visualmente: 90° = esquerda→direita, 180° = cima→baixo, 120° = diagonal para baixo à direita |
| `TIMING` (segundos) e `EASING` (`CUSTOM_CUBIC_BEZIER`) existem | Tempo e curvas usam esses tipos; se o arquivo recusar, cai para FLOAT/STRING com aviso |

## Teste no Figma (18/11/2026)

Arquivo de rascunho “KCX — teste do Figma Bridge” (equipe pessoal). O código do importador
compilado (`construir.ts`) foi executado com o plano do **Neon Glow** (variantes Hover e Sem brilho):

- 6 coleções criadas, `Colors` com Dark/Light; 21 variáveis;
- **48 vínculos, 0 recusados**: paradas do gradiente do halo, desfoque, opacidade e visibilidade do halo,
  traço, raio, padding e sombra do botão, cor do rótulo;
- propriedade de texto `Rótulo` com o padrão ligado à variável `neon-glow/label`;
- variantes `Estado=Hover` / `Estado=Sem brilho`, cada uma com as variáveis da variante;
- partes do SVG Motion e do Animated Gradient testadas separadamente: vetor de SVG com cor e espessura
  vinculadas, tracejado, ponto com largura/altura vinculadas, variável EASING, gradiente com parada vinculada.

O que **não** foi testado no Figma de verdade (coberto por testes com API simulada): a interface do
plugin (`ui.html`), a gravação do `sharedPluginData` e o “Exportar alterações para o lab”. Teste esses
três no Figma Desktop com o plugin instalado pelo manifest.

## O que o Figma não faz (e o KCX não promete)

- Animações contínuas não rodam: duração, velocidade, easing, repetição ficam como variáveis documentais
  (TIMING/EASING quando possível) e os quadros-chave viram variantes. O Figma tem APIs de *motion*
  (keyframes) em liberação gradual — é o próximo passo natural para o nível 2.
- Fórmulas entre variáveis não existem: valores derivados viram variáveis próprias.
- Não há variável de gradiente nem de transformação.
- `filter: brightness()`, `offset-path`, `stroke-dashoffset` animado ficam no código.
