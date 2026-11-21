# Mergulho pelo portal (`portal-zoom`)

> Gerado a partir de `src/app/core/efeitos/kits/portal-zoom.kit.ts`. Não edite à mão: rode `npm run docs:efeitos`.

A primeira cena tem um furo (portal, janela ou as lentes de um óculos de RV). A rolagem aproxima a câmera até o furo tomar a tela e a pessoa "atravessa" para a cena de trás.

| Campo | Valor |
|---|---|
| Nome técnico | Scroll Portal Zoom (zoom através de um furo com mask-image) |
| Categoria | 03 · Scroll e parallax › Scrollytelling cinematográfico |
| Nível | Intermediário |
| Tecnologias | HTML, CSS, JavaScript |
| Dependências | nenhuma |
| Interação | Rolagem |
| Status | validado em 2026-11-17 |
| Tags | portal, mask-image, máscara, zoom, lente, realidade virtual, transição de cena, scrollytelling, referência em vídeo |

## Objetivo visual

Trocar de cena sem corte, como se a câmera entrasse num portal ou num visor — a transição dos sites de turismo, games e realidade virtual.

## Aplicações

- Hero de destinos e experiências ("Step into wonder")
- Produtos de RV/AR: entrar pela lente do óculos
- Passagem entre capítulos de um storytelling

## Como funciona

### Nível 1 — Iniciante

- A primeira cena tem um buraco no meio, como um portal (ou as duas lentes de um óculos de realidade virtual).
- Rolando, a câmera chega cada vez mais perto do buraco, até ele ficar maior que a tela.
- Aí você está "do outro lado", na cena que estava escondida atrás.

### Nível 2 — Intermediário

- Duas cenas empilhadas numa área presa (sticky): o destino atrás e a moldura na frente.
- A moldura usa mask-image com radial-gradient: transparente dentro do furo, opaca fora. Vários furos (as duas lentes) se combinam com mask-composite: intersect.
- O JS grava só --p (0 → 1). O CSS escala a moldura com uma curva acelerada (p³): começa devagar e "mergulha" no fim, até o furo ficar maior que a tela.
- O destino faz o caminho contrário (de 1,25× para 1×), o que dá a sensação de profundidade; os textos de cada cena aparecem e somem com opacity em cima de --p.

### Nível 3 — Avançado

- mask-image com radial-gradient (transparente → preto) faz o furo; mask-composite: intersect soma vários furos numa máscara só.
- A curva p³ deixa o começo lento e o fim rápido, a sensação de mergulho. Experimente trocar por p² ou por uma cubic-bezier.
- A cena de trás faz um zoom contrário (1,25 → 1) e as duas se cruzam: é a mesma ideia do dolly zoom do cinema.
- No Angular, --p é um signal ligado com [style.--p]; todo o resto é CSS.

### Glossário do código

| Termo | O que faz |
|---|---|
| `mask-image` | Esconde as partes transparentes da máscara: aqui, o furo. |
| `mask-composite: intersect` | Junta várias máscaras (as duas lentes). |
| `scale: calc(` | O zoom da moldura calculado a partir do progresso. |
| `position: sticky` | Prende as cenas na tela enquanto a seção alta passa. |

## Parâmetros

| Controle | Tipo | Padrão | Faixa / opções |
|---|---|---|---|
| formato do portal | seleção | circulo | círculo (portal), oval, duas lentes (óculos de RV) |
| tamanho do furo | range | 18vmin | 10–30vmin (passo 2) |
| zoom final | range | 14× | 6–24× (passo 2) |
| altura da seção | range | 350vh | 200–600vh (passo 50) |

## Outra forma de fazer

Com GSAP: ScrollTrigger com pin e scrub animando scale. Com SVG: um <mask> com o furo desenhado como path (para formatos livres, como um arco ou o contorno real do óculos).

## Compatibilidade

mask-image e mask-composite: intersect funcionam em todos os navegadores atuais (Safari 15.4+).

## Responsividade

O furo é medido em vmin, então mantém a proporção em telas deitadas e em pé.

## Acessibilidade

Os textos das duas cenas são HTML real. Com prefers-reduced-motion não há zoom: as duas cenas aparecem uma depois da outra, sem animação.

## Performance

Só scale e opacity (compostos na GPU) e uma variável CSS por quadro. A máscara é desenhada uma vez e só escalada.

## Limitações

- Com scale muito alto a borda do furo pode serrilhar: termine a animação um pouco antes ou troque para a cena de trás com opacity.
- radial-gradient só faz círculos e elipses; para um portal com forma livre, use uma máscara SVG.

## Referências

- [MDN — mask-image](https://developer.mozilla.org/en-US/docs/Web/CSS/mask-image)
- [MDN — mask-composite](https://developer.mozilla.org/en-US/docs/Web/CSS/mask-composite)
- [MDN — CSS scroll-driven animations](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_scroll-driven_animations)
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
<title>Mergulho pelo portal · Kalixto Creative Lab</title>
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

.portal { --p: 0; height: 350vh; }
.cenas {
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: hidden;
}

/* Atrás: o lugar para onde o portal leva */
.destino {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background:
    radial-gradient(circle at 70% 25%, #fff4c9 0 4%, transparent 18%),
    linear-gradient(180deg, #8ec5ff 0%, #ffd1e8 55%, #ffe7c7 70%, #7fc6a4 71%, #2f7d64 100%);
  scale: calc(1.25 - 0.25 * var(--p));
}
.texto-destino {
  margin: 0;
  text-align: center;
  font: 400 clamp(2rem, 6vw, 4.5rem) / 1.05 Georgia, serif;
  color: #1d2b3a;
  opacity: clamp(0, calc((var(--p) - 0.75) * 5), 1);
}

/* Na frente: a cena com o furo, que cresce cada vez mais rápido (p³) */
.moldura {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 50% 50%, transparent 18.0vmin, rgb(255 190 140 / 0.85) 18.8vmin, transparent 23.0vmin),
    radial-gradient(circle at 15% 85%, #ff5f8f 0 2.5%, transparent 3%),
    radial-gradient(circle at 82% 78%, #ffb347 0 2%, transparent 2.5%),
    radial-gradient(circle at 25% 20%, #c86bff 0 1.5%, transparent 2%),
    radial-gradient(circle at 75% 15%, #ff8fab 0 1.8%, transparent 2.3%),
    radial-gradient(ellipse at 50% 50%, #3c1d4f 0%, #170b22 70%);
  mask-image: radial-gradient(circle at 50% 50%, transparent 18vmin, #000 18.6vmin);
  mask-composite: intersect;
  scale: calc(1 + 13 * var(--p) * var(--p) * var(--p));
  opacity: clamp(0, calc((1 - var(--p)) * 8), 1);
}

.texto-entrada {
  position: absolute;
  left: 6vw;
  bottom: 10vh;
  margin: 0;
  font: 400 clamp(1.8rem, 5vw, 3.6rem) / 1 Georgia, serif;
  color: #fff;
  opacity: calc(1 - var(--p) * 4);
}

@media (prefers-reduced-motion: reduce) {
  .portal { height: auto; }
  .cenas { position: relative; height: auto; }
  .moldura, .texto-entrada { display: none; }
  .destino { position: relative; height: 100vh; scale: 1; }
  .texto-destino { opacity: 1; }
}
</style>
</head>
<body>
<section class="intro"><p>Role para baixo ↓</p></section>

<section class="portal">
  <div class="cenas">
    <div class="destino">
      <p class="texto-destino">Bem-vindo<br />do outro lado.</p>
    </div>
    <div class="moldura" aria-hidden="true"></div>
    <h2 class="texto-entrada">Entre na<br />maravilha.</h2>
  </div>
</section>

<section class="fim"><p>Fim da página</p></section>
<script>
const secao = document.querySelector('.portal');
let quadro = 0;

// o único trabalho do JS: progresso da rolagem dentro da seção (0 → 1) em --p
function atualizar() {
  quadro = 0;
  const r = secao.getBoundingClientRect();
  const p = Math.min(1, Math.max(0, -r.top / (secao.offsetHeight - innerHeight)));
  secao.style.setProperty('--p', p.toFixed(4));
}

addEventListener('scroll', () => {
  if (!quadro) quadro = requestAnimationFrame(atualizar);
}, { passive: true });
atualizar();
</script>
</body>
</html>
```

## Versão Angular (valores padrão)

Também em `src/app/efeitos-angular/portal-zoom/` (compilada e testada com o app).

`portal-zoom.ts`

```ts
import { Component, DestroyRef, ElementRef, afterNextRender, inject, signal, viewChild } from '@angular/core';

@Component({
  selector: 'app-portal-zoom',
  templateUrl: './portal-zoom.html',
  styleUrl: './portal-zoom.css',
})
export class PortalZoom {
  private readonly secao = viewChild.required<ElementRef<HTMLElement>>('secao');
  /** Progresso da rolagem dentro da seção (0 → 1). */
  protected readonly p = signal(0);

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      let quadro = 0;
      const atualizar = () => {
        quadro = 0;
        const el = this.secao().nativeElement;
        const r = el.getBoundingClientRect();
        this.p.set(Math.min(1, Math.max(0, -r.top / (el.offsetHeight - window.innerHeight))));
      };
      const aoRolar = () => {
        if (!quadro) quadro = requestAnimationFrame(atualizar);
      };
      window.addEventListener('scroll', aoRolar, { passive: true });
      atualizar();
      destroyRef.onDestroy(() => window.removeEventListener('scroll', aoRolar));
    });
  }
}
```

`portal-zoom.html`

```html
<section #secao class="portal" [style.--p]="p()">
  <div class="cenas">
    <div class="destino">
      <p class="texto-destino">Bem-vindo<br />do outro lado.</p>
    </div>
    <div class="moldura" aria-hidden="true"></div>
    <h2 class="texto-entrada">Entre na<br />maravilha.</h2>
  </div>
</section>
```

`portal-zoom.css`

```css
:host { display: block; }

.portal { --p: 0; height: 350vh; }
.cenas {
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: hidden;
}

/* Atrás: o lugar para onde o portal leva */
.destino {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background:
    radial-gradient(circle at 70% 25%, #fff4c9 0 4%, transparent 18%),
    linear-gradient(180deg, #8ec5ff 0%, #ffd1e8 55%, #ffe7c7 70%, #7fc6a4 71%, #2f7d64 100%);
  scale: calc(1.25 - 0.25 * var(--p));
}
.texto-destino {
  margin: 0;
  text-align: center;
  font: 400 clamp(2rem, 6vw, 4.5rem) / 1.05 Georgia, serif;
  color: #1d2b3a;
  opacity: clamp(0, calc((var(--p) - 0.75) * 5), 1);
}

/* Na frente: a cena com o furo, que cresce cada vez mais rápido (p³) */
.moldura {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 50% 50%, transparent 18.0vmin, rgb(255 190 140 / 0.85) 18.8vmin, transparent 23.0vmin),
    radial-gradient(circle at 15% 85%, #ff5f8f 0 2.5%, transparent 3%),
    radial-gradient(circle at 82% 78%, #ffb347 0 2%, transparent 2.5%),
    radial-gradient(circle at 25% 20%, #c86bff 0 1.5%, transparent 2%),
    radial-gradient(circle at 75% 15%, #ff8fab 0 1.8%, transparent 2.3%),
    radial-gradient(ellipse at 50% 50%, #3c1d4f 0%, #170b22 70%);
  mask-image: radial-gradient(circle at 50% 50%, transparent 18vmin, #000 18.6vmin);
  mask-composite: intersect;
  scale: calc(1 + 13 * var(--p) * var(--p) * var(--p));
  opacity: clamp(0, calc((1 - var(--p)) * 8), 1);
}

.texto-entrada {
  position: absolute;
  left: 6vw;
  bottom: 10vh;
  margin: 0;
  font: 400 clamp(1.8rem, 5vw, 3.6rem) / 1 Georgia, serif;
  color: #fff;
  opacity: calc(1 - var(--p) * 4);
}

@media (prefers-reduced-motion: reduce) {
  .portal { height: auto; }
  .cenas { position: relative; height: auto; }
  .moldura, .texto-entrada { display: none; }
  .destino { position: relative; height: 100vh; scale: 1; }
  .texto-destino { opacity: 1; }
}
```
