# Voo que sai pela janela em arco (`arch-window-reveal`)

> Gerado a partir de `src/app/core/efeitos/kits/arch-window-reveal.kit.ts`. Não edite à mão: rode `npm run docs:efeitos`.

Um voo de câmera preso à rolagem atravessa os cômodos com legendas por capítulo e, no fim, a cena encolhe para dentro de uma janela em arco recortada na página.

| Campo | Valor |
|---|---|
| Nome técnico | Scroll Fly-through + Arch Mask Reveal (clip-path) |
| Categoria | 03 · Scroll e parallax › Scrollytelling cinematográfico |
| Nível | Avançado |
| Tecnologias | HTML, CSS, JavaScript, Canvas |
| Dependências | nenhuma |
| Interação | Rolagem |
| Status | validado em 2026-11-17 |
| Tags | clip-path, janela em arco, máscara, drone, fly-through, scrollytelling, sticky, imobiliária, referência em vídeo |

## Objetivo visual

Fazer a transição do "filme" para o site sem corte: o vídeo de tela cheia vira uma moldura da própria página — a assinatura dos sites de imobiliária e arquitetura.

## Aplicações

- Imobiliárias e lançamentos de alto padrão
- Hotéis, pousadas e espaços de evento
- Arquitetura e design de interiores
- Qualquer hero com vídeo que precisa "entrar" na página

## Como funciona

### Nível 1 — Iniciante

- Rolando, você "voa" pelos cômodos de uma casa, passando por portas em arco, e uma frase aparece em cada cômodo.
- No fim do voo, a imagem de tela cheia encolhe e vira uma janela em arco no meio da página do site.
- Rolando de volta, a janela cresce de novo e o voo volta para trás.

### Nível 2 — Intermediário

- A seção é alta e a cena fica presa (sticky). O JS calcula o progresso p (0 → 1) e o divide em duas fases: o voo (0 → corte) e a saída pela janela (corte → 1).
- Fase 1: cada valor do voo desenha um quadro no canvas (num site real, quadros de um vídeo de drone). As legendas trocam por capítulo: o voo dividido pelo número de legendas diz qual acende.
- Fase 2: o JS só grava --q (0 → 1). O CSS faz o resto com clip-path: inset(...) round ... — as bordas entram até o tamanho da janela e os cantos de cima viram um arco (raio = metade da largura).
- A página (título e texto) fica atrás da cena e aparece com opacity: var(--q), então o vídeo "vira" a janela sem nenhum corte.

### Nível 3 — Avançado

- Duas fases numa rolagem só: p é dividido em voo = p ÷ corte e q = (p − corte) ÷ (1 − corte). É o mesmo que uma timeline do GSAP com dois trechos.
- clip-path: inset(t r b l round …) anima as quatro bordas e os raios ao mesmo tempo; raio de canto = metade da largura transforma o retângulo num arco.
- Variáveis --lj e --aj guardam o tamanho final da janela; o CSS mistura vw, vh e px em calc() sem o JS saber de nada disso.
- A cena é desenhada com o algoritmo do pintor (do fundo para a frente) e fill("evenodd") recorta a porta em arco de cada parede.
- No Angular, --q é um signal ligado com [style.--q] e a legenda acesa vem de outro signal; listeners e o requestAnimationFrame são limpos no DestroyRef.

### Glossário do código

| Termo | O que faz |
|---|---|
| `clip-path: inset(` | Recorta o elemento entrando pelas bordas; com round, arredonda os cantos. |
| `setProperty('--q'` | O JS grava o progresso da fase 2 numa variável CSS. |
| `fill('evenodd')` | Preenche a parede deixando a porta em arco vazada. |
| `position: sticky` | Prende a cena na tela enquanto a seção alta passa. |
| `devicePixelRatio` | Deixa o canvas nítido em telas retina. |

## Parâmetros

| Controle | Tipo | Padrão | Faixa / opções |
|---|---|---|---|
| formato da janela | seleção | arco | arco, círculo, retângulo arredondado |
| largura final da janela | range | 26vw | 16–50vw (passo 2) |
| onde o voo termina | range | 0.6 | 0.4–0.8 (passo 0.05) |
| altura da seção | range | 550vh | 300–800vh (passo 50) |
| legendas por capítulo | seleção | sim | sim, não |

## Outra forma de fazer

Com GSAP: ScrollTrigger com pin e scrub numa timeline com dois trechos (voo e clipPath). Sem JS: animation-timeline: view() animando clip-path (Chrome/Edge; Safari 26+), com esta versão como reserva.

## Compatibilidade

clip-path: inset() com round, position: sticky e canvas 2D funcionam em todos os navegadores atuais.

## Responsividade

A janela usa max(vw, px) na largura e min(vh, …) na altura; o canvas é redimensionado com a tela (até 2× em telas retina).

## Acessibilidade

O canvas tem descrição (role="img" + aria-label); as legendas são decorativas e o conteúdo real está no texto da página. Com prefers-reduced-motion a seção mostra direto a página com a janela, sem voo.

## Performance

Por quadro: um desenho no canvas e uma variável CSS. clip-path e opacity não refazem o layout. O desenho só acontece quando a rolagem muda (requestAnimationFrame).

## Limitações

- Desenhar a cena com código é só para estudo: num projeto, use quadros de um vídeo real (como no kit image-sequence) e pré-carregue antes.
- clip-path recorta também a sombra: para uma sombra na janela, use filter: drop-shadow() num elemento pai.

## Referências

- [MDN — clip-path](https://developer.mozilla.org/en-US/docs/Web/CSS/clip-path)
- [MDN — basic-shape: inset()](https://developer.mozilla.org/en-US/docs/Web/CSS/basic-shape/inset)
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
<title>Voo que sai pela janela em arco · Kalixto Creative Lab</title>
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

.voo-janela {
  --q: 0;
  --lj: max(26vw, 180px);
  --aj: min(66vh, calc(var(--lj) * 1.9));
  height: 550vh;
}
.cena-fixa {
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: hidden;
  background: #f4efe8;
  color: #2a2320;
}

/* A página que já estava atrás do vídeo: aparece junto com a janela */
.pagina {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: 1fr var(--lj) 1fr;
  align-items: center;
  gap: 4vw;
  padding: 6vh 5vw;
  opacity: var(--q);
}
.marca {
  position: absolute;
  top: 4vh;
  left: 5vw;
  margin: 0;
  font: 600 0.8rem/1 system-ui, sans-serif;
  letter-spacing: 0.4em;
}
.titulo-pagina {
  grid-column: 1;
  margin: 0;
  font: 400 clamp(1.6rem, 3.4vw, 3rem) / 1.1 Georgia, 'Times New Roman', serif;
  translate: 0 calc((1 - var(--q)) * 30px);
}
.texto-pagina {
  grid-column: 3;
  max-width: 26ch;
  margin: 0;
  font-size: 0.95rem;
}

/* O vídeo: tela cheia que encolhe até virar a janela */
.janela {
  position: absolute;
  inset: 0;
  clip-path: inset(calc(var(--q) * (50vh - var(--aj) / 2)) calc(var(--q) * (50vw - var(--lj) / 2)) round calc(var(--q) * var(--lj) / 2) calc(var(--q) * var(--lj) / 2) 0 0);
}
.voo {
  display: block;
  width: 100%;
  height: 100%;
}

/* Uma legenda por capítulo do voo */
.legendas {
  position: absolute;
  left: 5vw;
  bottom: 10vh;
  margin: 0;
  padding: 0;
  list-style: none;
  opacity: calc(1 - var(--q) * 4);
}
.legendas li {
  position: absolute;
  bottom: 0;
  width: max-content;
  font: 400 clamp(1.8rem, 5vw, 4rem) / 1 Georgia, serif;
  color: #fff;
  text-shadow: 0 2px 18px rgb(0 0 0 / 0.45);
  opacity: 0;
  translate: 0 20px;
  transition: opacity 0.5s, translate 0.5s;
}
.legendas li.ativa { opacity: 1; translate: 0 0; }

@media (max-width: 640px) {
  .pagina { grid-template-columns: 1fr; align-content: end; }
  .titulo-pagina, .texto-pagina { grid-column: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .voo-janela { --q: 1 !important; height: auto; }
  .cena-fixa { position: relative; }
}
</style>
</head>
<body>
<section class="intro"><p>Role para baixo ↓</p></section>

<section class="voo-janela">
  <div class="cena-fixa">
    <div class="pagina">
      <p class="marca">MAISON</p>
      <h2 class="titulo-pagina">Poucas casas,<br />bem vendidas.</h2>
      <p class="texto-pagina">Cada imóvel é visitado, fotografado e contado como um filme.</p>
    </div>
    <div class="janela">
      <canvas class="voo" role="img" aria-label="Voo de câmera atravessando os cômodos de uma casa até o jardim ao pôr do sol"></canvas>
      <ol class="legendas" aria-hidden="true">
        <li>Casas com história</li>
        <li>Mesa para doze</li>
        <li>Pé-direito de 7 metros</li>
        <li>Volta para o poente</li>
      </ol>
    </div>
  </div>
</section>

<section class="fim"><p>Fim da página</p></section>
<script>
const CORTE = 0.6;
const reduzir = matchMedia('(prefers-reduced-motion: reduce)').matches;
const secao = document.querySelector('.voo-janela');
const canvas = document.querySelector('.voo');
const ctx = canvas.getContext('2d');
const legendas = [...document.querySelectorAll('.legendas li')];

function desenharVoo(ctx, w, h, t) {
  const SALAS = 5;
  const foco = Math.max(w, h * 1.6) * 0.5;
  const camera = t * SALAS;
  // Lá fora: céu de entardecer e gramado (o fim do voo)
  const ceu = ctx.createLinearGradient(0, 0, 0, h);
  ceu.addColorStop(0, '#2a2350');
  ceu.addColorStop(0.45, '#e9896a');
  ceu.addColorStop(0.62, '#ffd59a');
  ceu.addColorStop(0.63, '#5d7a3e');
  ceu.addColorStop(1, '#2f4a22');
  ctx.fillStyle = ceu;
  ctx.fillRect(0, 0, w, h);
  // Paredes da mais longe para a mais perto (pintor)
  for (let i = SALAS; i >= 1; i--) {
    const z = i - camera;
    if (z < 0.06) continue;
    const s = foco / z;
    const X = (x) => w / 2 + x * s;
    const Y = (y) => h * 0.5 - y * s;
    // chão da sala atrás desta parede (madeira, mais clara ao longe)
    const z2 = z + 1;
    const s2 = foco / z2;
    const luz = Math.max(0.35, 1 - z * 0.14);
    ctx.fillStyle = 'rgb(' + Math.round(150 * luz) + ' ' + Math.round(104 * luz) + ' ' + Math.round(70 * luz) + ')';
    ctx.beginPath();
    ctx.moveTo(w / 2 - 1.4 * s, h * 0.5 + 0.6 * s);
    ctx.lineTo(w / 2 + 1.4 * s, h * 0.5 + 0.6 * s);
    ctx.lineTo(w / 2 + 1.4 * s2, h * 0.5 + 0.6 * s2);
    ctx.lineTo(w / 2 - 1.4 * s2, h * 0.5 + 0.6 * s2);
    ctx.fill();
    // a parede com a porta em arco recortada (evenodd = furo)
    const r = 0.36;
    ctx.beginPath();
    ctx.rect(0, 0, w, h);
    ctx.moveTo(X(-r), Y(-0.6));
    ctx.lineTo(X(-r), Y(0.35));
    ctx.arc(X(0), Y(0.35), r * s, Math.PI, 0);
    ctx.lineTo(X(r), Y(-0.6));
    ctx.closePath();
    const parede = ctx.createLinearGradient(0, 0, w, 0);
    parede.addColorStop(0, 'rgb(' + Math.round(200 * luz) + ' ' + Math.round(186 * luz) + ' ' + Math.round(168 * luz) + ')');
    parede.addColorStop(0.5, 'rgb(' + Math.round(238 * luz) + ' ' + Math.round(226 * luz) + ' ' + Math.round(208 * luz) + ')');
    parede.addColorStop(1, 'rgb(' + Math.round(196 * luz) + ' ' + Math.round(180 * luz) + ' ' + Math.round(160 * luz) + ')');
    ctx.fillStyle = parede;
    ctx.fill('evenodd');
    // moldura da porta
    ctx.strokeStyle = 'rgb(255 244 224 / ' + (0.5 * luz).toFixed(2) + ')';
    ctx.lineWidth = Math.max(1, 0.025 * s);
    ctx.beginPath();
    ctx.moveTo(X(-r), Y(-0.6));
    ctx.lineTo(X(-r), Y(0.35));
    ctx.arc(X(0), Y(0.35), r * s, Math.PI, 0);
    ctx.lineTo(X(r), Y(-0.6));
    ctx.stroke();
  }
}

// O canvas acompanha o tamanho da tela (até 2× em telas retina)
function medir() {
  const dpr = Math.min(2, devicePixelRatio || 1);
  canvas.width = Math.round(canvas.clientWidth * dpr);
  canvas.height = Math.round(canvas.clientHeight * dpr);
}

let quadro = 0;
function atualizar() {
  quadro = 0;
  const r = secao.getBoundingClientRect();
  const p = reduzir ? 1 : Math.min(1, Math.max(0, -r.top / (secao.offsetHeight - innerHeight)));
  const voo = Math.min(1, p / CORTE); // fase 1: o voo
  const q = Math.max(0, (p - CORTE) / (1 - CORTE)); // fase 2: a janela
  secao.style.setProperty('--q', q.toFixed(4));
  desenharVoo(ctx, canvas.width, canvas.height, voo);
  const atual = Math.min(legendas.length - 1, Math.floor(voo * legendas.length));
  legendas.forEach((li, i) => li.classList.toggle('ativa', i === atual && q === 0));
}

const pedir = () => {
  if (!quadro) quadro = requestAnimationFrame(atualizar);
};
addEventListener('scroll', pedir, { passive: true });
addEventListener('resize', () => {
  medir();
  pedir();
});
medir();
atualizar();
</script>
</body>
</html>
```

## Versão Angular (valores padrão)

Também em `src/app/efeitos-angular/arch-window-reveal/` (compilada e testada com o app).

`arch-window-reveal.ts`

```ts
import { Component, DestroyRef, ElementRef, afterNextRender, inject, signal, viewChild } from '@angular/core';

@Component({
  selector: 'app-arch-window-reveal',
  templateUrl: './arch-window-reveal.html',
  styleUrl: './arch-window-reveal.css',
})
export class ArchWindowReveal {
  private readonly corte = 0.6;
  private readonly secao = viewChild.required<ElementRef<HTMLElement>>('secao');
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  protected readonly legendas = ["Casas com história","Mesa para doze","Pé-direito de 7 metros","Volta para o poente"];
  /** Fase 2 (0 → 1): a cena encolhe até a janela. */
  protected readonly q = signal(0);
  /** Legenda acesa (-1 = nenhuma). */
  protected readonly atual = signal(0);

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const canvas = this.canvas().nativeElement;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const medir = () => {
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        canvas.width = Math.round(canvas.clientWidth * dpr);
        canvas.height = Math.round(canvas.clientHeight * dpr);
      };
      let quadro = 0;
      const atualizar = () => {
        quadro = 0;
        const el = this.secao().nativeElement;
        const r = el.getBoundingClientRect();
        const p = reduzir ? 1 : Math.min(1, Math.max(0, -r.top / (el.offsetHeight - window.innerHeight)));
        const voo = Math.min(1, p / this.corte);
        const q = Math.max(0, (p - this.corte) / (1 - this.corte));
        this.q.set(q);
        desenharVoo(ctx, canvas.width, canvas.height, voo);
        const n = this.legendas.length;
        this.atual.set(q === 0 && n ? Math.min(n - 1, Math.floor(voo * n)) : -1);
      };
      const pedir = () => {
        if (!quadro) quadro = requestAnimationFrame(atualizar);
      };
      const aoMudarTamanho = () => {
        medir();
        pedir();
      };
      window.addEventListener('scroll', pedir, { passive: true });
      window.addEventListener('resize', aoMudarTamanho);
      medir();
      atualizar();
      destroyRef.onDestroy(() => {
        window.removeEventListener('scroll', pedir);
        window.removeEventListener('resize', aoMudarTamanho);
        cancelAnimationFrame(quadro);
      });
    });
  }
}

function desenharVoo(ctx: CanvasRenderingContext2D, w: number, h: number, t: number): void {
  const SALAS = 5;
  const foco = Math.max(w, h * 1.6) * 0.5;
  const camera = t * SALAS;
  // Lá fora: céu de entardecer e gramado (o fim do voo)
  const ceu = ctx.createLinearGradient(0, 0, 0, h);
  ceu.addColorStop(0, '#2a2350');
  ceu.addColorStop(0.45, '#e9896a');
  ceu.addColorStop(0.62, '#ffd59a');
  ceu.addColorStop(0.63, '#5d7a3e');
  ceu.addColorStop(1, '#2f4a22');
  ctx.fillStyle = ceu;
  ctx.fillRect(0, 0, w, h);
  // Paredes da mais longe para a mais perto (pintor)
  for (let i = SALAS; i >= 1; i--) {
    const z = i - camera;
    if (z < 0.06) continue;
    const s = foco / z;
    const X = (x: number) => w / 2 + x * s;
    const Y = (y: number) => h * 0.5 - y * s;
    // chão da sala atrás desta parede (madeira, mais clara ao longe)
    const z2 = z + 1;
    const s2 = foco / z2;
    const luz = Math.max(0.35, 1 - z * 0.14);
    ctx.fillStyle = 'rgb(' + Math.round(150 * luz) + ' ' + Math.round(104 * luz) + ' ' + Math.round(70 * luz) + ')';
    ctx.beginPath();
    ctx.moveTo(w / 2 - 1.4 * s, h * 0.5 + 0.6 * s);
    ctx.lineTo(w / 2 + 1.4 * s, h * 0.5 + 0.6 * s);
    ctx.lineTo(w / 2 + 1.4 * s2, h * 0.5 + 0.6 * s2);
    ctx.lineTo(w / 2 - 1.4 * s2, h * 0.5 + 0.6 * s2);
    ctx.fill();
    // a parede com a porta em arco recortada (evenodd = furo)
    const r = 0.36;
    ctx.beginPath();
    ctx.rect(0, 0, w, h);
    ctx.moveTo(X(-r), Y(-0.6));
    ctx.lineTo(X(-r), Y(0.35));
    ctx.arc(X(0), Y(0.35), r * s, Math.PI, 0);
    ctx.lineTo(X(r), Y(-0.6));
    ctx.closePath();
    const parede = ctx.createLinearGradient(0, 0, w, 0);
    parede.addColorStop(0, 'rgb(' + Math.round(200 * luz) + ' ' + Math.round(186 * luz) + ' ' + Math.round(168 * luz) + ')');
    parede.addColorStop(0.5, 'rgb(' + Math.round(238 * luz) + ' ' + Math.round(226 * luz) + ' ' + Math.round(208 * luz) + ')');
    parede.addColorStop(1, 'rgb(' + Math.round(196 * luz) + ' ' + Math.round(180 * luz) + ' ' + Math.round(160 * luz) + ')');
    ctx.fillStyle = parede;
    ctx.fill('evenodd');
    // moldura da porta
    ctx.strokeStyle = 'rgb(255 244 224 / ' + (0.5 * luz).toFixed(2) + ')';
    ctx.lineWidth = Math.max(1, 0.025 * s);
    ctx.beginPath();
    ctx.moveTo(X(-r), Y(-0.6));
    ctx.lineTo(X(-r), Y(0.35));
    ctx.arc(X(0), Y(0.35), r * s, Math.PI, 0);
    ctx.lineTo(X(r), Y(-0.6));
    ctx.stroke();
  }
}
```

`arch-window-reveal.html`

```html
<section #secao class="voo-janela" [style.--q]="q()">
  <div class="cena-fixa">
    <div class="pagina">
      <p class="marca">MAISON</p>
      <h2 class="titulo-pagina">Poucas casas,<br />bem vendidas.</h2>
      <p class="texto-pagina">Cada imóvel é visitado, fotografado e contado como um filme.</p>
    </div>
    <div class="janela">
      <canvas
        #canvas
        class="voo"
        role="img"
        aria-label="Voo de câmera atravessando os cômodos de uma casa até o jardim ao pôr do sol"
      ></canvas>
      <ol class="legendas" aria-hidden="true">
        @for (l of legendas; track l; let i = $index) {
          <li [class.ativa]="i === atual()">{{ l }}</li>
        }
      </ol>
    </div>
  </div>
</section>
```

`arch-window-reveal.css`

```css
:host { display: block; }

.voo-janela {
  --q: 0;
  --lj: max(26vw, 180px);
  --aj: min(66vh, calc(var(--lj) * 1.9));
  height: 550vh;
}
.cena-fixa {
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: hidden;
  background: #f4efe8;
  color: #2a2320;
}

/* A página que já estava atrás do vídeo: aparece junto com a janela */
.pagina {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: 1fr var(--lj) 1fr;
  align-items: center;
  gap: 4vw;
  padding: 6vh 5vw;
  opacity: var(--q);
}
.marca {
  position: absolute;
  top: 4vh;
  left: 5vw;
  margin: 0;
  font: 600 0.8rem/1 system-ui, sans-serif;
  letter-spacing: 0.4em;
}
.titulo-pagina {
  grid-column: 1;
  margin: 0;
  font: 400 clamp(1.6rem, 3.4vw, 3rem) / 1.1 Georgia, 'Times New Roman', serif;
  translate: 0 calc((1 - var(--q)) * 30px);
}
.texto-pagina {
  grid-column: 3;
  max-width: 26ch;
  margin: 0;
  font-size: 0.95rem;
}

/* O vídeo: tela cheia que encolhe até virar a janela */
.janela {
  position: absolute;
  inset: 0;
  clip-path: inset(calc(var(--q) * (50vh - var(--aj) / 2)) calc(var(--q) * (50vw - var(--lj) / 2)) round calc(var(--q) * var(--lj) / 2) calc(var(--q) * var(--lj) / 2) 0 0);
}
.voo {
  display: block;
  width: 100%;
  height: 100%;
}

/* Uma legenda por capítulo do voo */
.legendas {
  position: absolute;
  left: 5vw;
  bottom: 10vh;
  margin: 0;
  padding: 0;
  list-style: none;
  opacity: calc(1 - var(--q) * 4);
}
.legendas li {
  position: absolute;
  bottom: 0;
  width: max-content;
  font: 400 clamp(1.8rem, 5vw, 4rem) / 1 Georgia, serif;
  color: #fff;
  text-shadow: 0 2px 18px rgb(0 0 0 / 0.45);
  opacity: 0;
  translate: 0 20px;
  transition: opacity 0.5s, translate 0.5s;
}
.legendas li.ativa { opacity: 1; translate: 0 0; }

@media (max-width: 640px) {
  .pagina { grid-template-columns: 1fr; align-content: end; }
  .titulo-pagina, .texto-pagina { grid-column: 1; }
}

@media (prefers-reduced-motion: reduce) {
  .voo-janela { --q: 1 !important; height: auto; }
  .cena-fixa { position: relative; }
}
```
