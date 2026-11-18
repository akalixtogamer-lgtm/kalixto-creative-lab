# Registro de dependências

Verificado em **16/11/2026**.

## Aplicação

| Pacote | Versão | Uso |
|---|---|---|
| Angular (core, router, forms, common…) | 22.2 | base do projeto (standalone + signals) |
| rxjs | 7.8 | exigido pelo Angular |
| gsap | 3.15 | GSAP Studio, Scroll Lab (ScrollTrigger), SVG Lab (DrawSVG, MorphSVG, MotionPath), Three.js e GLSL |
| three | 0.187 | Three.js Lab e WebGL & GLSL |
| lenis | 1.3.27 | só o kit "Rolagem suave" (Fase 3), embutido no preview isolado |
| @fontsource/inter · space-grotesk · jetbrains-mono | 5.x | fontes dentro do projeto |

Desde a versão 3.13 todos os plugins do GSAP (incluindo DrawSVG e MorphSVG) são gratuitos e vêm no pacote `gsap`.

## Desenvolvimento

| Pacote | Versão | Uso |
|---|---|---|
| @angular/cli · @angular/build | 22.2.7 | build (esbuild) e servidor |
| TypeScript | 6.0 | |
| Vitest + jsdom | 5.x / 30.x | testes (`npm test`) |
| @types/three | 0.187 | tipos do Three.js |

## Ambiente

- Node.js 22 ou mais recente (testado com 22.23) · npm 10.9

## Ferramentas usadas só no QA (fora do projeto)

- Playwright + Chromium (conferência visual, WebGL e rolagem)
- axe-core 4 (auditoria de acessibilidade)

## Licença do GSAP e o KCX

A licença Standard "No Charge" do GSAP é gratuita e permite uso comercial, mas **não é open source**:
proíbe o uso em ferramentas que permitem criar animações visuais sem código e que concorram com o Webflow.
Por isso o núcleo do KCX (editor de variáveis, componentes de referência, runtime e plugin) usa só CSS,
SVG e JavaScript nativos. Kits que dependem de GSAP exportam como pacote de desenvolvimento (nível 3),
com o aviso da licença. Fonte: https://gsap.com/standard-license

| Pacote | Versão | Licença | Uso |
|---|---|---|---|
| @figma/plugin-typings | 1.142 | MIT | só tipos do plugin Figma Bridge (desenvolvimento) |
