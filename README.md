# KALIXTO CREATIVE LAB

> **Aprender. Experimentar. Construir.**

Laboratório independente de aprendizagem e experimentação de **Creative Development**.
Transforma conceitos técnicos em experiências visuais que podem ser exploradas, modificadas e compreendidas.

Não é portfólio, currículo, site institucional nem vitrine de serviços — é uma **plataforma de aprendizagem e prototipagem**.

---

## Status

| Item | Situação |
|---|---|
| Versão | `0.3.0` |
| Fase atual | **Fase 2 — MVP Funcional** · CSS Playground e GSAP Studio prontos para testar |
| Publicado no GitHub Pages | **Não** — só depois dos testes |

Veja o andamento completo em [`docs/ROADMAP.md`](docs/ROADMAP.md).

---

## Como rodar no seu computador

Pré-requisito: **Node.js 22 ou mais recente** (`node -v` para conferir).

```bash
npm install      # instala as dependências (só na primeira vez)
npm start        # abre em http://localhost:4200
npm test         # roda os testes (44)
npm run build    # gera a versão de produção em dist/
```

## Como usar o laboratório

1. Abra o **CSS Playground** ou o **GSAP Studio** (itens 01 e 02 do menu).
2. Escolha uma demo na faixa de botões (Transitions, Keyframes, Hover…).
3. Mexa nos **Controles** e clique em **Executar** — o botão muda conforme a demo (ex.: "Alternar estado", "Virar card").
4. Veja o **Código** mudar junto com os controles e use **Copiar**.
5. **Reiniciar** volta tudo ao padrão.

Labs marcados como "em breve" ainda mostram só o plano do que vão ensinar.

## Roteiro de teste

- Fase 2 (GSAP Studio): [`docs/CHECKLIST-FASE-2-GSAP.md`](docs/CHECKLIST-FASE-2-GSAP.md)
- Fase 2 (CSS Playground): [`docs/CHECKLIST-FASE-2-CSS.md`](docs/CHECKLIST-FASE-2-CSS.md)
- Fase 1 (base): [`docs/CHECKLIST-FASE-1.md`](docs/CHECKLIST-FASE-1.md)

---

## Estrutura do projeto

```
src/
├── styles/                    Design System Kalixto
│   ├── tokens.css             cores, fontes, espaçamentos, movimento
│   ├── base.css               reset, foco, acessibilidade
│   ├── lab.css                layout comum dos laboratórios
│   └── components.css         .kx-card, .kx-btn, .kx-badge, .kx-glass…
└── app/
    ├── core/
    │   ├── models/            tipos: Lab, Effect
    │   ├── models/            Lab, Effect, LabDemo
    │   └── data/              labs · effects · roadmap · css-demos · gsap-demos
    ├── layout/
    │   ├── shell/             estrutura geral (menu + conteúdo, gaveta no mobile)
    │   └── sidebar/           menu lateral gerado a partir de LABS
    ├── shared/components/     kx-page-header · kx-status-badge · kx-code-viewer · kx-breadcrumb · kx-icon · kx-logo · kx-demo-controls
    └── pages/
        ├── dashboard/         página inicial
        ├── css-playground/    Laboratório 01 (/labs/css?demo=…)
        ├── gsap-studio/       Laboratório 02 (/labs/gsap?demo=…)
        ├── lab-page/          plano dos labs ainda sem demos (/labs/:id)
        ├── biblioteca/        biblioteca de efeitos com busca e filtro
        ├── design-system/     vitrine dos tokens e componentes
        ├── roadmap/           linha do tempo das fases
        └── not-found/         404
```

**Regra de ouro:** laboratórios, efeitos e fases são cadastrados **só** nos arquivos de `core/data/`.
Dashboard, menu, biblioteca e roadmap se atualizam sozinhos a partir deles.

### Rotas

| Rota | Página |
|---|---|
| `/` | Dashboard |
| `/labs/css` | CSS Playground — 8 demos (`?demo=hover` abre direto) |
| `/labs/gsap` | GSAP Studio — 7 demos (`?demo=easing` abre direto) |
| `/labs/scroll` | Próximo laboratório do MVP |
| `/labs/svg` | SVG Lab (Fase 3) |
| `/labs/three` · `/labs/webgl` | Bloqueados até validar o MVP |
| `/biblioteca` | Biblioteca de efeitos (aceita `?lab=css`) |
| `/design-system` | Design System Kalixto |
| `/roadmap` | Roadmap e critérios de passagem |

---

## Publicação no GitHub Pages (somente depois de testar)

O projeto já está preparado, mas **nada vai ao ar sozinho**.

1. Crie o repositório `kalixto-creative-lab` no GitHub e envie o código (`git push`).
2. No GitHub: **Settings → Pages → Source: GitHub Actions**.
3. Na aba **Actions**, abra **"Publicar no GitHub Pages"** → **Run workflow** e digite `PUBLICAR`.

O workflow roda os testes antes de publicar; se algum falhar, nada é publicado.
Endereço final: `https://akalixtogamer-lgtm.github.io/kalixto-creative-lab/`

Para gerar o build do Pages localmente: `npm run build:pages`.

---

## Documentação

- [`CHANGELOG.md`](CHANGELOG.md) — histórico de versões
- [`docs/ROADMAP.md`](docs/ROADMAP.md) — fases, critérios e próximas etapas
- [`docs/DEPENDENCIAS.md`](docs/DEPENDENCIAS.md) — versões verificadas
- [`docs/COMPONENTES.md`](docs/COMPONENTES.md) — Design System e componentes
- [`docs/EFEITOS.md`](docs/EFEITOS.md) — registro dos efeitos
- [`docs/PROBLEMAS-CONHECIDOS.md`](docs/PROBLEMAS-CONHECIDOS.md)

---

Feito por **Wallace Toledo · dev-Kalixto** — Professor · Programador · Gamer
