# KALIXTO CREATIVE LAB

> **Aprender. Experimentar. Construir.**

Laboratório independente de aprendizagem e experimentação de **Creative Development**.
Transforma conceitos técnicos em experiências visuais que podem ser exploradas, modificadas e compreendidas.

Não é portfólio, currículo, site institucional nem vitrine de serviços — é uma **plataforma de aprendizagem e prototipagem**.

---

## Status

| Item | Situação |
|---|---|
| Versão | `1.3.0-rc.1` (candidata — Fase 2 da biblioteca técnica) |
| Roadmap | **6 de 6 fases implementadas** — aguardando a validação do Wallace |
| Conteúdo | 7 laboratórios · 60 demos interativas · 10 kits de efeito com ficha técnica · 27 exercícios · 60 desafios |
| Testes | 334 automáticos passando · acessibilidade WCAG 2.1 AA sem violações (axe-core) |
| Publicado no GitHub Pages | Sim, a `v1.2.0-rc.1`. A `v1.3.0-rc.1` só vai depois da sua avaliação |

Roteiro de avaliação, fase por fase: [`docs/AVALIACAO.md`](docs/AVALIACAO.md).

---

## Como rodar no seu computador

Pré-requisito: **Node.js 22 ou mais recente** (`node -v` para conferir).

```bash
npm install          # instala as dependências (rode sempre que o projeto ganhar bibliotecas novas)
npm start            # abre em http://localhost:4200
npm test             # roda os 233 testes
npm run build        # versão de produção em dist/
npm run build:pages  # versão para o GitHub Pages (com 404.html)
```

---

## O que tem dentro

### Laboratórios

| # | Laboratório | Demos | Rota |
|---|---|---|---|
| 01 | CSS Playground | 9 — transitions, keyframes, transform, hover, floating, perspective, clip-path, microinterações, divisores de seção | `/labs/css` |
| 02 | GSAP Studio | 8 — to, from, fromTo, timeline, stagger, easing, controles de reprodução, SplitText | `/labs/gsap` |
| 03 | Scroll Lab | 9 — ScrollTrigger, scrub, pin, parallax, horizontal, progress, storytelling, navbar ao rolar, capítulos | `/labs/scroll` |
| 04 | SVG Lab | 5 — traço, máscara, morphing, filtros, motion path | `/labs/svg` |
| 05 | Three.js Lab | 9 — geometria, câmera, luzes, materiais, texturas, animação, mouse, raycasting, GLTF | `/labs/three` |
| 06 | WebGL & GLSL | 7 — fragment, vertex, GLSL, noise, distortion, procedural, transição | `/labs/webgl` |
| 07 | Interface Lab | 13 — hero editorial, órbita, texto atrás do objeto, imagem em formas, 17 divisores SVG, carrossel de vidro, números, tipografia vazada, bento, cards com profundidade, grão de filme, botão magnético, marquee | `/labs/ui` |

Todas as demos seguem o mesmo fluxo: **escolher → ajustar os controles → Executar → ler o código (e copiar) → entender**.
Cada uma tem presets prontos, um desafio prático e fica na URL (`?demo=…`) para compartilhar.

### Estudar

| Página | O que faz | Rota |
|---|---|---|
| Trilha de aprendizagem | Caminho do CSS ao WebGL, com ✓ por demo, ★ por desafio e "Continuar de onde parei" | `/trilha` |
| Exercícios | 27 perguntas com correção e explicação | `/exercicios` |
| Comparador | Quando usar cada tecnologia + o mesmo efeito em CSS, Web Animations e GSAP | `/comparador` |
| Biblioteca de efeitos | 10 kits + 60 demos nas 15 categorias, com busca (nome, tecnologia, aplicação, tags) e filtros (categoria, tipo, lab, nível, interação, dependências, situação) | `/biblioteca` |
| Ficha do efeito | Preview isolado ou componente Angular, controles, Code Lab (editar, executar, comparar), versão Angular, explicação em 3 níveis, download .zip/.html e ficha técnica | `/efeitos/:id` |

O progresso (demos executadas, desafios, exercícios e presets) fica salvo **no navegador** — nada é enviado para a internet.

---

## Estrutura do projeto

```
src/
├── styles/                     Design System Kalixto
│   ├── tokens.css              cores, fontes, espaçamentos, movimento
│   ├── base.css                reset, foco visível, acessibilidade
│   ├── components.css          .kx-card, .kx-btn, .kx-badge, .kx-glass…
│   └── lab.css                 layout comum dos laboratórios
├── test-setup.ts               APIs do navegador simuladas para os testes
└── app/
    ├── core/
    │   ├── models/             Lab, Effect, LabDemo (demo.model.ts)
    │   ├── data/               labs · roadmap · exercicios · *-demos (um por laboratório)
    │   └── services/           progresso.service.ts (localStorage)
    ├── layout/                 shell (menu + conteúdo) e sidebar
    ├── shared/components/      lab-layout · demo-controls · code-viewer · logo · icon · breadcrumb…
    └── pages/
        ├── css-playground/  gsap-studio/  scroll-lab/  svg-lab/
        ├── three-lab/          inclui palco-3d.ts (reaproveitado pelo GLSL)
        ├── glsl-lab/  ui-lab/
        ├── trilha/  exercicios/  comparador/  biblioteca/
        └── dashboard/  design-system/  roadmap/  lab-page/  not-found/
public/
├── brand/                      logo Kalixto em vários tamanhos + ícones
├── ilustracoes/                paisagens SVG próprias (substituem fotos nas demos)
└── models/kalixto-trofeu.glb   modelo 3D (gerado por scripts/gerar-modelo.mjs)
```

Detalhes de como as peças se encaixam: [`docs/ARQUITETURA.md`](docs/ARQUITETURA.md).

---

## Publicação no GitHub Pages (somente depois de avaliar)

Nada vai ao ar sozinho.

1. Depois de validar, junte a branch final na `main` (`git checkout main && git merge fase-6`).
2. Crie o repositório `kalixto-creative-lab` no GitHub e envie (`git push -u origin main --tags`).
3. No GitHub: **Settings → Pages → Source: GitHub Actions**.
4. Na aba **Actions**, abra **"Publicar no GitHub Pages"** → **Run workflow** e digite `PUBLICAR`.

O workflow roda os testes antes; se algum falhar, nada é publicado.
Endereço final: `https://akalixtogamer-lgtm.github.io/kalixto-creative-lab/`

---

## Documentação

| Arquivo | Conteúdo |
|---|---|
| [`docs/AVALIACAO.md`](docs/AVALIACAO.md) | Roteiro para você avaliar cada fase |
| [`docs/AUDITORIA.md`](docs/AUDITORIA.md) | Fase Zero: diagnóstico, arquitetura proposta e plano |
| [`docs/CATALOGO-DE-EFEITOS.md`](docs/CATALOGO-DE-EFEITOS.md) | Catálogo por categoria (gerado) + uma página por kit em `docs/efeitos/` |
| [`docs/SEGURANCA.md`](docs/SEGURANCA.md) | Isolamento do preview (sandbox + CSP) e verificações |
| [`docs/ACESSIBILIDADE.md`](docs/ACESSIBILIDADE.md) | WCAG 2.2 AA: o que foi feito e o que falta |
| [`docs/PERFORMANCE.md`](docs/PERFORMANCE.md) | Pacotes medidos e decisões |
| [`docs/TECNOLOGIAS.md`](docs/TECNOLOGIAS.md) | Bibliotecas em uso e avaliadas (Lenis, Lottie, Rive, PixiJS) |
| [`docs/ROADMAP.md`](docs/ROADMAP.md) | Fases, critérios de passagem e versões |
| [`docs/ARQUITETURA.md`](docs/ARQUITETURA.md) | Como o projeto funciona e como estender |
| [`docs/EFEITOS.md`](docs/EFEITOS.md) | Registro das 60 demos com links diretos |
| [`docs/COMPONENTES.md`](docs/COMPONENTES.md) | Design System e componentes |
| [`docs/QA.md`](docs/QA.md) | Relatório de QA (testes, acessibilidade, performance) |
| [`docs/REFERENCIAS.md`](docs/REFERENCIAS.md) | Avaliação das referências enviadas e efeitos extraídos |
| [`docs/DEPENDENCIAS.md`](docs/DEPENDENCIAS.md) | Versões verificadas |
| [`docs/PROBLEMAS-CONHECIDOS.md`](docs/PROBLEMAS-CONHECIDOS.md) | Limitações conhecidas |
| [`CHANGELOG.md`](CHANGELOG.md) | Histórico de versões |

---

Feito por **Wallace Toledo · dev-Kalixto** — Professor · Programador · Gamer
