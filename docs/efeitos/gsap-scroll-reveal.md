# Revelar ao rolar com GSAP (`gsap-scroll-reveal`)

> Gerado a partir de `src/app/core/efeitos/kits/gsap-scroll-reveal.kit.ts`. Não edite à mão: rode `npm run docs:efeitos`.

Os cards entram em lotes quando chegam na tela, ou acompanham a barra de rolagem (scrub), usando GSAP e ScrollTrigger.

| Campo | Valor |
|---|---|
| Nome técnico | ScrollTrigger Batch Reveal |
| Categoria | 03 · Scroll e parallax › Entradas por rolagem |
| Nível | Intermediário |
| Tecnologias | HTML, CSS, JavaScript, GSAP, ScrollTrigger |
| Dependências | gsap |
| Interação | Rolagem |
| Status | validado em 2026-11-17 |
| Tags | gsap, scrolltrigger, batch, scrub, scroll, reveal, stagger |

## Objetivo visual

Entradas por rolagem com curvas ricas e controle fino de início e fim.

## Aplicações

- Grades de projetos
- Seções de recursos
- Narrativas guiadas pela rolagem

## Como funciona

### Nível 1 — Iniciante

- GSAP é uma biblioteca de animação; o ScrollTrigger é a parte dela que reage à rolagem.
- No modo "lote", os cards que aparecem juntos na tela entram um depois do outro.
- No modo "scrub", a animação acompanha a rolagem: se você volta, ela volta junto.

### Nível 2 — Intermediário

- gsap.registerPlugin(ScrollTrigger) ativa o plugin. gsap.matchMedia só cria as animações se o usuário não pediu menos movimento.
- No modo lote, ScrollTrigger.batch agrupa os cards que entram juntos na tela e anima o grupo com stagger (um depois do outro).
- start: "top 85%" significa: dispara quando o topo do card passa 85% da altura da tela.
- No modo scrub, cada card tem sua própria animação presa à rolagem: rolar para cima desfaz a animação.

### Nível 3 — Avançado

- ScrollTrigger.batch reduz o número de triggers e agrupa os callbacks por quadro — bom para grades longas.
- overwrite: true cancela tweens antigos no mesmo elemento, evitando briga entre animações quando o usuário rola rápido.
- gsap.matchMedia cria e reverte animações por media query; no Angular, mm.revert() no DestroyRef limpa triggers e estilos inline.
- No Angular, gsap.matchMedia(host) limita os seletores ao componente.
- scrub: true liga direto à rolagem; scrub: 0.5 adiciona meio segundo de "alcance", suavizando rolagens bruscas.

### Glossário do código

| Termo | O que faz |
|---|---|
| `registerPlugin` | Ativa o plugin ScrollTrigger no GSAP. |
| `gsap.matchMedia` | Cria animações só quando a media query bate (aqui, sem redução de movimento). |
| `ScrollTrigger.batch` | Agrupa os elementos que entram juntos na tela. |
| `stagger` | Intervalo entre o início da animação de cada card. |
| `start: 'top` | Quando dispara: topo do card × posição na tela. |
| `overwrite: true` | Cancela animações anteriores do mesmo card. |

## Parâmetros

| Controle | Tipo | Padrão | Faixa / opções |
|---|---|---|---|
| modo | seleção | lote | entra em lotes (batch), presa à rolagem (scrub) |
| começa quando o topo do card passa | seleção | top 85% | 90% da tela, 85% da tela, 70% da tela |
| distância | range | 60px | 0–160px (passo 10) |
| duração | range | 0.8s | 0.2–2s (passo 0.1) |
| intervalo entre cards | range | 0.12s | 0–0.4s (passo 0.02) |
| curva (ease) | seleção | power3.out | power3.out (suave), expo.out (freada longa), back.out (passa e volta), elastic.out (mola) |

## Outra forma de fazer

Sem biblioteca: IntersectionObserver + transition do CSS (veja o kit "Revelar ao rolar"). É mais leve, mas não tem scrub nem as curvas do GSAP.

## Compatibilidade

GSAP 3 funciona em todos os navegadores atuais.

## Responsividade

start e end são relativos à altura da tela, então o comportamento é o mesmo em qualquer aparelho. ScrollTrigger recalcula as posições quando a janela muda de tamanho.

## Acessibilidade

gsap.matchMedia("(prefers-reduced-motion: no-preference)") só cria as animações para quem não pediu menos movimento; os demais veem os cards direto, sem animação.

## Performance

O GSAP anima transform e opacity. O ScrollTrigger lê as posições uma vez (e no resize), não a cada rolagem. Custo: cerca de 118 kB de bibliotecas minificadas (gsap.min.js + ScrollTrigger.min.js, sem gzip).

## Limitações

- Precisa de duas bibliotecas externas.
- Conteúdo que muda de altura depois de carregar exige ScrollTrigger.refresh().

## Referências

- [GSAP — ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)
- [GSAP — gsap.matchMedia()](https://gsap.com/docs/v3/GSAP/gsap.matchMedia())
- [MDN — prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)

## Código (valores padrão)

Arquivo único, igual ao baixado pelo botão “Baixar” na página do efeito:

```html
<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data:; font-src data:">
<title>Revelar ao rolar com GSAP · Kalixto Creative Lab</title>
<style>
/* Página da demonstração (rolável) */
* { box-sizing: border-box; }
html, body { margin: 0; }
body {
  background: #0b0a14;
  color: #f4f2ff;
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.5;
}
.intro, .fim {
  display: grid;
  place-items: center;
  min-height: 70vh;
  padding: 24px;
  color: #c9c3ea;
  text-align: center;
}

.grade {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;
  max-width: 760px;
  margin: 0 auto;
  padding: 24px;
}
.card {
  display: grid;
  place-items: center;
  min-height: 180px;
  border-radius: 16px;
  background: linear-gradient(160deg, #3b1f5e, #161229);
  border: 1px solid #4b3a76;
}
.card h2 { margin: 0; font-size: 1.15rem; }
</style>
</head>
<body>
<section class="intro"><p>Role para baixo ↓</p></section>

<section class="grade">
  <article class="card"><h2>Timeline</h2></article>
  <article class="card"><h2>Stagger</h2></article>
  <article class="card"><h2>Easing</h2></article>
  <article class="card"><h2>ScrollTrigger</h2></article>
  <article class="card"><h2>Batch</h2></article>
  <article class="card"><h2>Scrub</h2></article>
</section>

<section class="fim"><p>Fim da página</p></section>
<script>
// GSAP e ScrollTrigger são carregados antes deste script
gsap.registerPlugin(ScrollTrigger);

// Só anima para quem não pediu menos movimento
const mm = gsap.matchMedia();
mm.add('(prefers-reduced-motion: no-preference)', () => {
  gsap.set('.card', { opacity: 0, y: 60 });
    ScrollTrigger.batch('.card', {
      start: 'top 85%',
      onEnter: (lote) =>
        gsap.to(lote, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.12, overwrite: true }),
    });
});
</script>
</body>
</html>
```

## Versão Angular (valores padrão)

Também em `src/app/efeitos-angular/gsap-scroll-reveal/` (compilada e testada com o app).

`gsap-scroll-reveal.ts`

```ts
import { Component, DestroyRef, ElementRef, afterNextRender, inject } from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-gsap-scroll-reveal',
  templateUrl: './gsap-scroll-reveal.html',
  styleUrl: './gsap-scroll-reveal.css',
})
export class GsapScrollReveal {
  protected readonly cards = ["Timeline", "Stagger", "Easing", "ScrollTrigger", "Batch", "Scrub"];

  constructor() {
    const host = inject(ElementRef<HTMLElement>).nativeElement;
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      // matchMedia reverte tudo sozinho quando a preferência muda ou no revert()
      const mm = gsap.matchMedia(host);
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const cards = host.querySelectorAll('.card');
        gsap.set(cards, { opacity: 0, y: 60 });
    ScrollTrigger.batch(cards, {
      start: 'top 85%',
      onEnter: (lote) =>
        gsap.to(lote, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.12, overwrite: true }),
    });
      });
      destroyRef.onDestroy(() => mm.revert());
    });
  }
}
```

`gsap-scroll-reveal.html`

```html
<section class="grade">
  @for (c of cards; track c) {
    <article class="card"><h2>{{ c }}</h2></article>
  }
</section>
```

`gsap-scroll-reveal.css`

```css
:host { display: block; }

.grade {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;
  max-width: 760px;
  margin: 0 auto;
  padding: 24px;
}
.card {
  display: grid;
  place-items: center;
  min-height: 180px;
  border-radius: 16px;
  background: linear-gradient(160deg, #3b1f5e, #161229);
  border: 1px solid #4b3a76;
}
.card h2 { margin: 0; font-size: 1.15rem; }
```
