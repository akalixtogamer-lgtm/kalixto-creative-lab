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
