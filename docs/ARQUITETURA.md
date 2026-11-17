# Arquitetura

## Ideia central: dados descrevem, componentes executam

Tudo que é conteúdo vive em `src/app/core/data/`:

| Arquivo | O que descreve |
|---|---|
| `labs.data.ts` | Os 7 laboratórios (número, título, fase, status, cor de acento) |
| `*-demos.data.ts` | As demos de cada lab: controles, explicação, dica, código, presets e desafio |
| `effects.data.ts` | `DEMOS_POR_LAB` — junta tudo e gera a Biblioteca |
| `exercicios.data.ts` | Perguntas de múltipla escolha |
| `roadmap.data.ts` | As 6 fases e suas entregas |

Menu, Dashboard, Biblioteca, Trilha e Exercícios **leem** esses arquivos — nunca têm listas próprias.

## Modelo de uma demo (`core/models/demo.model.ts`)

```ts
interface LabDemo {
  id, topico, titulo, nivel, resumo;
  explicacao: string[]; dica: string;
  acao: string;          // texto do botão principal
  instrucao: string;     // aparece embaixo do palco
  params: ParamDef[];    // sliders (range) e listas (select)
  codigo(v): string;     // código exibido, montado com os valores atuais
  presets?; desafio?;    // receitas e desafio prático
  aoVivo?: boolean;      // sem botão Executar (o resultado muda direto)
}
```

## Layout comum (`shared/components/lab-layout`)

Todos os laboratórios usam `<kx-lab-layout>`. Ele cuida de: cabeçalho, seletor de demos (com ✓), controles,
presets, desafio, Code Viewer, explicação, navegação anterior/próximo e registro de progresso.

O laboratório só fornece:
1. o **palco** (`<div palco>…</div>`, projetado no layout);
2. as reações aos eventos `executar`, `reiniciar`, `mudou` e `aplicar`.

## Como cada lab anima

| Lab | Técnica | Onde |
|---|---|---|
| CSS | Valores dos controles viram variáveis CSS (`--dur`, `--ease`…) no palco | `css-playground.css` |
| GSAP | Uma função por demo, rodando em `gsap.context()` (revert desfaz tudo) | `gsap-animacoes.ts` |
| Scroll | Cenas com `ScrollTrigger` usando a janela de rolagem do palco como `scroller` | `scroll-cenas.ts` |
| SVG | GSAP + DrawSVG, MorphSVG e MotionPath | `svg-animacoes.ts` |
| Three.js | `palco-3d.ts` (renderer, câmera, laço, limpeza) + uma cena por demo | `cenas-3d.ts` |
| GLSL | O mesmo palco 3D + `ShaderMaterial`; os shaders ficam no arquivo de dados | `cena-shader.ts` |
| Interface | `montar()` (eventos e animações contínuas) + `executar()` (entradas), em `gsap.context()` | `ui-cenas.ts` |

## Progresso (`core/services/progresso.service.ts`)

Guarda no `localStorage` (chave `kalixto-lab:progresso:v1`): demos executadas, desafios concluídos,
respostas dos exercícios, presets do usuário e a última demo aberta. Se o navegador bloquear o armazenamento,
o progresso vale só na sessão.

## Performance

- Cada página é carregada sob demanda (lazy loading).
- GSAP, ScrollTrigger e plugins de SVG só são baixados nas rotas que usam; Three.js só no Three.js Lab e no GLSL.
- O palco 3D pausa quando a aba ou o palco saem da tela e limita a densidade de pixels a 2x.
- Fontes ficam dentro do projeto (sem depender do Google Fonts).

## Como criar um laboratório novo

1. Cadastre o lab em `labs.data.ts`.
2. Crie `core/data/<lab>-demos.data.ts` e adicione em `DEMOS_POR_LAB`.
3. Crie `pages/<lab>/` com o componente usando `<kx-lab-layout>`.
4. Adicione a rota em `app.routes.ts` (antes de `labs/:id`).
5. Escreva os testes (`<lab>.spec.ts`); o teste de integridade dos dados roda sozinho.

## Biblioteca de efeitos e kits (Master Prompt, Fase 1)

Planejamento completo em [`AUDITORIA.md`](AUDITORIA.md).

| Arquivo | Papel |
|---|---|
| `core/models/effect-sheet.model.ts` | Ficha técnica (`EffectSheet`), `EffectKit`, níveis, interações e tecnologias |
| `core/efeitos/categorias.ts` | As 15 categorias do mapa de efeitos |
| `core/efeitos/kits/*.kit.ts` | Um arquivo por efeito: ficha, parâmetros e `gerar(valores)` → `{ html, css, js }` |
| `core/efeitos/registry.ts` | `EFFECT_REGISTRY` (kits), `CATEGORIA_DAS_DEMOS` (as 60 demos no mapa) e `CATALOGO` (kits + demos) |
| `core/efeitos/sandbox.ts` | `montarDocumento()`: o HTML completo com CSP, usado no preview **e** no download |
| `pages/efeito/` | `/efeitos/:id`: preview isolado, controles, abas de código, ficha técnica |
| `pages/biblioteca/` | Busca e filtros sobre o `CATALOGO` |

**Fluxo:** controle → `valores` (signal) → `kit.gerar()` → `montarDocumento()` →
`iframe.srcdoc`. As abas de código mostram o mesmo objeto, então preview e código
não podem divergir.

### Como criar um efeito novo

1. Crie `core/efeitos/kits/<id>.kit.ts` exportando um `EffectKit`. Use
   `cssPalco()` e os helpers de `_base.ts`.
2. Inclua o kit em `EFFECT_REGISTRY` (`registry.ts`).
3. Rode `npm test`. Os testes verificam se a ficha está completa, se os valores
   padrão são válidos, se **cada controle muda o código** e se há
   `prefers-reduced-motion`.
4. Rode `npm run docs:efeitos` para gerar `docs/efeitos/<id>.md` e atualizar
   `docs/CATALOGO-DE-EFEITOS.md`.

## Fase 2 da biblioteca: Code Lab, versão Angular, exportação e Code Explainer

| Arquivo | Papel |
|---|---|
| `pages/efeito/code-lab/` | Abas HTML/CSS/JS + Angular (TS/HTML/CSS); edição dos três arquivos; Executar no preview; Comparar com o original (diff por linha); Restaurar original |
| `pages/efeito/explicador/` | Explicação em 3 níveis (iniciante, intermediário, avançado) + glossário |
| `core/efeitos/exportar.ts` | Monta o pacote `.zip` (`index.html` + `styles.css` + `script.js` + `README.md` + `angular/`) |
| `shared/utils/zip.ts` | Gerador de ZIP sem dependência (método store + CRC-32) |
| `shared/utils/diff.ts` | Diferença por linha (LCS) |
| `shared/utils/realce.ts` | Realce de sintaxe leve; devolve trechos de texto, **sem `innerHTML`** |
| `efeitos-angular/<id>/` | Versão Angular de cada kit com valores padrão, **gerada** por `npm run gerar:angular` |
| `efeitos-angular/index.ts` | Carregamento sob demanda dos componentes (modo de preview "Angular") |

Cada kit agora tem, além da ficha e de `gerar()`:

- `angular(valores)`: os três arquivos de um componente standalone;
- `niveis`: as explicações iniciante e avançada (a intermediária continua em `ficha.explicacao`);
- `glossario`: termos do código com explicação.

**Garantias:**

- **Componentes Angular:** o teste compila e renderiza cada um.
- **Arquivos gerados:** `npm run verificar:angular` regenera e falha se o arquivo commitado divergir do gerador.
- **Glossário:** todo termo precisa aparecer literalmente no código.

## Fase 3 da biblioteca: kits com bibliotecas e páginas roláveis

| Arquivo | Papel |
|---|---|
| `core/efeitos/bibliotecas.ts` | Lista das bibliotecas permitidas (GSAP, ScrollTrigger, Lenis): versão, licença, arquivo em `/vendor` e pacote npm. `carregarBiblioteca()` baixa e guarda em cache |
| `core/efeitos/sandbox.ts` | `montarDocumento(..., bibliotecas)` embute o código das bibliotecas antes do script do kit |
| `core/efeitos/exportar.ts` | No `.zip`, as bibliotecas vão em `vendor/` e o `index.html` as carrega com `<script defer>` |
| `angular.json` | Copia `gsap.min.js`, `ScrollTrigger.min.js` e `lenis.min.js` para `/vendor` |
| `kits/_base.ts` | `cssPagina()` (página rolável com intro e fim) e `cssAngularPagina()` (o mesmo CSS sem a página, para o componente) |

Campos novos no `EffectKit`:

- `bibliotecas?: BibliotecaId[]`: o preview espera os arquivos carregarem antes de montar o documento.
- `previewAngular?: false`: desliga o modo Angular no preview, para kits que dependem da rolagem da janela. Os arquivos Angular continuam no Code Lab e no `.zip`.
