# KCX — Kalixto Component Exchange · Especificação 1.0.0

Formato aberto, versionado e independente do Figma para trocar componentes animados entre o
Kalixto Creative Lab, o Figma (plugin **Figma Bridge**) e qualquer outra ferramenta.

- Tipos TypeScript: [`src/app/kcx/kcx.types.ts`](../../src/app/kcx/kcx.types.ts)
- JSON Schema (forma do arquivo): [`kcx.schema.json`](kcx.schema.json) — `npm run kcx:schema`
- Validação completa (forma + regras de significado): [`src/app/kcx/validar.ts`](../../src/app/kcx/validar.ts)
- Exemplos reais: [`exemplos/`](exemplos/)
- Licença do formato, do runtime e dos componentes de referência: MIT

## 1. Princípio

**As variáveis controlam o componente, não o descrevem.** Toda variável KCX tem pelo menos um
**vínculo** com uma propriedade real (custom property CSS, atributo ou texto). Um pacote com uma
variável sem vínculo é **inválido**. No Figma, o que não pode ser vinculado é criado como variável
**documental** — com a descrição começando por `[Documental — não executável no Figma]`, sem escopo
(não aparece nos seletores de propriedade) e listado no painel de exportação e no quadro de documentação.

## 2. Pacote (`.kcx.json`)

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `formato` | `"kcx"` | sim | Identifica o arquivo |
| `schemaVersion` | SemVer | sim | Versão do schema (major diferente = incompatível) |
| `id` | texto | sim | ID único do pacote |
| `versao` | SemVer | sim | Versão do pacote |
| `nome` | texto | sim | |
| `criadoEm` | ISO 8601 | sim | |
| `origem` | `{ ferramenta, versao, url? }` | sim | Quem gerou |
| `exportacao` | `{ modo, presetAplicado? }` | sim | Modo pedido ao plugin (ver §8) |
| `componentes` | `KcxComponente[]` | sim (≥1) | |
| `composicao` | `KcxComposicao` | não | Combinação de componentes (§7) |
| `dependencias` | `KcxDependencia[]` | sim | União das dependências dos componentes |
| `historico` | `{ versao, data, descricao }[]` | sim | Histórico de alterações |

## 3. Componente

Identificação (`id` kebab-case, `nome`, `categoria`, `descricao`, `tecnologia`, `versao`, `licenca`),
`metadados` (autor, tags, datas, largura/altura), `codigo` (`html`, `css`, `js`, `svg?`),
`variaveis`, `estados`, `presets`, `dependencias`, `estrutura` (árvore visual), `animacoes` e
`compatibilidade` (navegadores, `reducedMotion`, nível no Figma e o que é editável/parcial/não suportado).

O CSS do componente usa **somente** `var(--kcx-…)` para o que é configurável. O bloco `:root` com os
valores é **gerado** das variáveis — por isso código, variáveis e preview não divergem.

`licenca` = `{ spdx, usoComercial, modificacao, redistribuicao, autor }`.

## 4. Variáveis

```ts
{ id, nome, tipo, padrao, valor, unidade?, min?, max?, passo?, opcoes?,
  descricao, grupo, secao, vinculos, exportavel, modos?: { light?, dark? } }
```

| Tipo | Valor | Figma |
|---|---|---|
| `color` | `#rgb`, `#rrggbb`, `#rrggbbaa`, `rgb()`, `rgba()` | COLOR |
| `number` | inteiro | FLOAT |
| `float` | número | FLOAT |
| `dimension` | número + `unidade` (px, rem, em, %) | FLOAT |
| `time` | número + `unidade` (ms, s) | **TIMING** (segundos) |
| `boolean` | `true`/`false` | BOOLEAN |
| `string` | texto | STRING |
| `enum` | uma das `opcoes` | STRING, **EASING** (se as opções forem curvas) ou propriedade de variante |
| `gradient` | `{ angulo, paradas: [{ cor, posicao 0–1 }] }` | uma variável COLOR por parada |
| `transform` | `{ x, y, escala, rotacao }` | fica no código |

`grupo` define a coleção no Figma: `colors`, `dimensions`, `spacing`, `typography`, `motion`,
`effects`, `components` → `KCX · Colors`, `KCX · Dimensions`…

`secao` define o bloco no editor: `aparencia`, `animacao`, `comportamento`.

Conversão de unidades: ms ↔ s, px ↔ rem/em (base 16), deg ↔ turn ↔ rad (`unidades.ts`).

### 4.1 Vínculos (uma variável → várias propriedades)

```json
{ "propriedade": "Alcance visual da sombra",
  "alvo": { "tipo": "css-var", "nome": "--kcx-neon-glow-reach" },
  "transformar": [{ "op": "multiplicarPorVariavel", "variavel": "glowDistance" }, { "op": "limitar", "max": 160 }],
  "unidadeSaida": "px" }
```

Alvos: `css-var` (sempre `--kcx-*`), `atributo` (`seletor` + `atributo`, nunca `on*`), `texto`
(`textContent`).

Operações: `multiplicar`, `somar`, `mapear` (`de` → `para`), `limitar`, `arredondar`, `dividir`
(`numerador / valor`), `multiplicarPorVariavel`, `dividirPorVariavel`, `somarVariavel`, `alpha`, `converter` (unidade),
`mapa` (enum/boolean → texto). Na estrutura visual também `pontoNoCaminho` e `tracoNoCaminho`.

Consistência: números são limitados por `min`/`max`; se uma conta der `NaN`/`Infinity`, o valor
calculado com o padrão é usado. Um teste sorteia 200 combinações por componente e garante que nenhuma
saída tem `NaN`, `Infinity` ou `undefined`.

## 5. Estrutura visual

Árvore de nós (`frame`, `retangulo`, `elipse`, `texto`, `svg`) com preenchimentos, traço, efeitos
(sombra, desfoque de camada, desfoque de fundo), texto, Auto Layout e filhos. Qualquer campo pode ser:

- um valor fixo;
- `{ "$var": "primaryColor" }` → no Figma, **vínculo direto** com a variável;
- `{ "$derivado": "glowIntensity", "nome": "halo-opacity", "transformar": [...] }` → no Figma, uma
  variável própria (o Figma não calcula fórmulas) vinculada ao campo, com o valor calculado no lab.

`gradiente-variavel` usa uma variável `gradient` (cada parada vira variável de cor no Figma).

## 6. Estados e presets

- **Estado**: `{ id, nome, gatilho, descricao, valores, derivar? }`. `derivar` calcula valores a partir de
  outras variáveis (ex.: no hover, `glowIntensity × hoverBoost`). Viram **variantes** `Estado=…` no Figma.
- **Preset**: conjunto de valores de variáveis (nunca uma cópia do componente). Arquivo avulso:
  `{ "formato": "kcx-presets", "schemaVersion", "componente", "presets": [...] }`.
- Variáveis enum listadas em `compatibilidade.figma.eixosVariante` viram um segundo eixo de variantes.

## 7. Composição

```json
{ "id": "hero-neon", "nome": "Hero Neon",
  "camadas": [{ "componente": "neon-glow", "prefixo": "botao", "papel": "centro", "valores": {} }],
  "compartilhadas": [{ "id": "corDestaque", "nome": "Cor de destaque", "tipo": "color", "valor": "#ff2bd6",
                       "alvos": ["botao.primaryColor", "linha.accentColor"] }] }
```

Cada camada mantém as próprias variáveis. Uma compartilhada alimenta vários alvos `prefixo.variavel`
do mesmo tipo. No Figma, a variável de cada alvo vira **alias** da compartilhada. Um componente aparece
em no máximo uma camada (as custom properties colidiriam).

## 8. Modos de exportação

| Modo | Figma |
|---|---|
| `completo` | Variáveis vinculadas + componente com variantes + quadro de documentação + pacote guardado no componente |
| `visual` | Só camadas e variantes, valores fixos, nenhuma variável |
| `variaveis` | Só coleções e variáveis |
| `componentes-variaveis` | Componente e variáveis, sem documentação |
| `pacote` | Tudo (o plugin trata como `completo`) |

## 9. Níveis de compatibilidade

KCX aceita só **HTML, CSS, SVG e Angular** (TypeScript gerado). Nada de GSAP, Three.js, WebGL,
Canvas ou bibliotecas externas: `dependencias` precisa ser vazio e `tecnologia` só aceita
`HTML`, `CSS`, `SVG`, `Angular` e `TypeScript`. Assim tudo que o componente desenha vira camada
nativa no Figma.

1. **Nativo editável** — formas, textos, gradientes (lineares e cônicos), arcos, opacidade, sombras e desfoques: tudo vira camada nativa ligada a variáveis.
2. **Parcialmente editável** — a estrutura e as variáveis são nativas, e os quadros-chave viram variantes; o movimento contínuo (keyframes, transições) não roda no Figma.

## 9.1 Edição total no Figma

O Figma Bridge entrega cada componente para ser **mudado e reutilizado** no Figma:

| O que | Como |
|---|---|
| Cor | Variável COLOR ligada a preenchimento, traço, sombra e paradas de gradiente; modos Dark/Light em Colors |
| Formato | Raio canto a canto, borda, padding e arcos por variável; caminhos SVG viram vetores nativos numa **peça** reutilizável (`<Comp> · Caminho`, uma variante por forma) — editar a peça muda todas as variantes |
| Tamanho | Auto Layout (cresce com o texto), camadas absolutas com restrição Stretch/Scale (halo, fundo, arcos acompanham) e largura/altura por variável |
| Conteúdo | Propriedades de texto (`TEXT`) com padrão ligado à variável |
| Mostrar/ocultar | Propriedades `BOOLEAN` (Brilho, Trilha, Ponto, Mostrar texto…) com padrão ligado à variável |
| Reutilização | Componente com variantes (estados × eixos), **instância de exemplo** ao lado, quadro de documentação |

Limites reais da API do Figma (verificados no arquivo de teste):
- O tracejado (`dashPattern`) é redistribuído por segmento do vetor, então não reproduz `stroke-dashoffset`.
  Quadros com traço completo usam a peça sem tracejado; quadros parciais recebem um vetor já cortado no progresso.
- Escopos só existem em variáveis COLOR, FLOAT e STRING.
- Coleções compartilhadas: quando um componente de modo único entra numa coleção que já tem Dark/Light,
  o valor é gravado em todos os modos existentes (nenhum modo novo é criado).

## 9.2 Saída Angular

`angularKcx(componente, valores)` gera um componente standalone (`selector: 'kcx-<id>'`) com um
`input()` por variável, `computed` que resolve as saídas com o mesmo runtime (`kcx-runtime.ts`) e
`host: { '[style]': ... }` para as propriedades `--kcx-*`. Está na aba **Angular** do painel de código
e na pasta `angular/` do `.zip`. `npm run gerar:kcx-angular` gera os 6 componentes em `src/app/kcx-angular/`.

## 10. Versionamento

- `schemaVersion` com o mesmo major é aceito (aviso se o minor for diferente); major diferente é recusado.
- `migrar()` aplica migrações registradas por versão de schema antes da validação.
- `mesclarAtualizacao(componenteNovo, personalizados)` atualiza um componente **sem sobrescrever**
  personalizações: mantém o que ainda vale, ajusta o que saiu do intervalo, informa variáveis novas e removidas.

## 11. Ida e volta (Figma → Lab)

O plugin gera `{ "formato": "kcx-alteracoes", "pacote", "componente", "versao", "exportadoEm", "valores" }`
a partir das variáveis do componente selecionado. O lab compara com os valores atuais, mostra cada
diferença (inválidas ficam desmarcadas) e aplica **só o que o usuário marcar**. Variáveis derivadas não
voltam (não há caminho reverso para uma fórmula).

## 12. Runtime

`kcx-runtime.js` (exportado com o código) traz o mesmo cálculo dos vínculos em JavaScript puro:

```js
KCX.set('glowIntensity', 1.6); KCX.apply({ primaryColor: '#8b5cf6' });
KCX.pause(); KCX.play(); KCX.restart(); KCX.speed(0.5);
```

Um teste compara 300 combinações entre o runtime e o resolver TypeScript.


## 13. Construtor (KCX Studio → Criar componente)

`src/app/kcx/construtor/` monta um `KcxComponente` completo a partir de `ConfigConstrutor`
(`tipo`, `nome`, `textos`, `itens`, `animacao`, `cores`, `raio`, `midia`). Cada tipo
(`DefinicaoTipo`) gera HTML, CSS, JS, a estrutura do Figma, os estados e as interações.
Variáveis comuns: `corPrimaria`, `corFundo`, `corSuperficie`, `corTexto`, `corSuave`, `raio`,
`espaco`, `fonte`, `duracao`, `easing`; cada texto vira `texto<Nome>` e cada item `item<N>`.
O componente guarda a configuração em `origemCriacao` para ser reaberto no construtor.

## 14. Interações (`interacoes`)

`{ no, gatilho: 'clique' | 'hover', de, para, transicao: 'smart-animate' | 'dissolver' | 'instantanea', duracao }`:
no estado `de`, clicar (ou passar o mouse) no nó `no` troca para a variante do estado `para`. O plano
resolve isso para nomes de variante (respeitando eixos extras) e o plugin chama `setReactionsAsync`
com `CHANGE_TO`.

## 15. Figma → KCX (`figma/ler-selecao.ts`)

Lê o frame selecionado: Auto Layout (direção, gap, padding, alinhamentos, Fill/Hug/Fixed), posições
absolutas, preenchimentos sólidos e gradientes, traços, sombras e desfoques, textos (fonte, peso,
tamanho, espaçamento, altura de linha, alinhamento, caixa) e vetores (`exportAsync` SVG, limpo de
scripts e eventos). Cores, textos, raios e espaçamentos viram variáveis (cores com o nome da variável
do Figma, quando ligadas). A animação é a variável `animacao` (atributo `data-animacao` na raiz).
