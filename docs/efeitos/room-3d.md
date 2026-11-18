# Sala 3D (`room-3d`)

> Gerado a partir de `src/app/core/efeitos/kits/room-3d.kit.ts`. Não edite à mão: rode `npm run docs:efeitos`.

Um corredor de concreto com luzes no teto e um vídeo na parede do fundo, feito com 5 divs em CSS 3D. O olhar acompanha o mouse e o botão "Entrar" leva a câmera para dentro.

| Campo | Valor |
|---|---|
| Nome técnico | CSS 3D Room (corredor com perspectiva) |
| Categoria | 11 · 3D e WebGL › Espaços 3D só com CSS |
| Nível | Avançado |
| Tecnologias | HTML, CSS, JavaScript |
| Dependências | nenhuma |
| Interação | Movimento do mouse, Clique, Teclado |
| Status | validado em 2026-11-17 |
| Tags | sala 3d, room, corredor, perspective, perspective-origin, css 3d, showroom, referência em vídeo |

## Objetivo visual

Criar a sensação de galeria ou showroom: o conteúdo principal é "exposto" numa sala, com profundidade real.

## Aplicações

- Case em destaque de portfólio
- Lançamento de vídeo ou campanha
- Galerias e exposições virtuais

## Como funciona

### Nível 1 — Iniciante

- A sala é uma caixa de papelão sem a tampa da frente: fundo, duas paredes, teto e chão.
- Cada parede é um retângulo dobrado a partir da borda da tela, como as abas de uma caixa.
- Mexendo o mouse você "vira a cabeça"; o botão leva você para dentro do corredor.

### Nível 2 — Intermediário

- A sala é uma caixa sem a parede da frente. O fundo é empurrado para trás com translateZ(−profundidade).
- As paredes laterais, o teto e o chão são dobrados a partir das bordas: transform-origin na borda + rotateY(±90°) ou rotateX(±90°). Cada uma tem largura (ou altura) igual à profundidade, então encontra o fundo exatamente.
- perspective no palco é a distância da câmera; perspective-origin é para onde ela olha. Mexer em perspective-origin com o mouse dá a sensação de virar a cabeça dentro da sala.
- "Entrar" move a sala inteira em direção à câmera (translateZ positivo), como um dolly de cinema.

### Nível 3 — Avançado

- As 5 faces compartilham o mesmo espaço 3D graças a preserve-3d na .sala; perspective fica no pai (.palco-sala), que é a câmera.
- rotateY(90deg) com origem na borda esquerda leva a face para −Z; a largura igual à profundidade fecha a junta com o fundo sem cálculo extra.
- Limitar perspective-origin entre 30% e 70% evita ângulos em que as paredes ficam de perfil e somem.
- Para uma cena guiada pelo scroll, troque o botão por ScrollTrigger animando o translateZ da .sala com scrub.

### Glossário do código

| Termo | O que faz |
|---|---|
| `perspective-origin: var(--px) var(--py)` | Para onde a câmera olha (segue o mouse). |
| `transform-origin: left center` | A parede gira a partir da borda, como uma aba. |
| `rotateY(90deg)` | Dobra a parede lateral para dentro da cena. |
| `translateZ(-` | Empurra a parede do fundo para longe. |

## Parâmetros

| Controle | Tipo | Padrão | Faixa / opções |
|---|---|---|---|
| profundidade da sala | range | 600px | 300–900px (passo 50) |
| distância da câmera | range | 500px | 300–1200px (passo 50) |
| quanto entra | range | 300px | 100–500px (passo 20) |

## Outra forma de fazer

Em Three.js, BoxGeometry com side: BackSide e um VideoTexture na face do fundo; dá luz, sombra e reflexo de verdade no chão.

## Compatibilidade

Transformações 3D, preserve-3d e perspective-origin: todos os navegadores atuais.

## Responsividade

O palco mantém 16:10 e as paredes usam % para a largura/altura; só a profundidade é em px (ajustável).

## Acessibilidade

O botão "Entrar na sala" funciona no teclado e informa o estado com aria-pressed. A sala tem role="img" e descrição. Com prefers-reduced-motion, a entrada é instantânea e a "tela" não anima.

## Performance

Cinco camadas com gradientes; perspective-origin muda a cada movimento (uma vez por quadro). Leve até em celulares.

## Limitações

- Se a câmera avançar além da parede do fundo, as paredes somem ou invertem: o avanço máximo deve ser menor que a profundidade + perspective.
- Vídeo real na tela: use <video muted playsinline loop> e pause quando a sala sair da tela.

## Referências

- [MDN — perspective](https://developer.mozilla.org/en-US/docs/Web/CSS/perspective)
- [MDN — perspective-origin](https://developer.mozilla.org/en-US/docs/Web/CSS/perspective-origin)
- [MDN — transform](https://developer.mozilla.org/en-US/docs/Web/CSS/transform)

## Código (valores padrão)

Arquivo único, igual ao baixado pelo botão “Baixar” na página do efeito:

```html
<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data:; font-src data:">
<title>Sala 3D · Kalixto Creative Lab</title>
<style>
/* Palco da demonstração */
* { box-sizing: border-box; }
html, body { height: 100%; margin: 0; }
body {
  display: grid;
  place-items: center;
  gap: 24px;
  padding: 24px;
  background: #0b0a14;
  color: #f4f2ff;
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
}

/* A câmera: distância (perspective) e direção do olhar (perspective-origin) */
.palco-sala {
  --px: 50%;
  --py: 50%;
  position: relative;
  width: min(100%, 640px);
  aspect-ratio: 16 / 10;
  border-radius: 20px;
  overflow: hidden;
  background: #0d0f12;
  perspective: 500px;
  perspective-origin: var(--px) var(--py);
}
.sala {
  position: absolute;
  inset: 0;
  transform-style: preserve-3d;
  transition: transform 1200ms cubic-bezier(0.65, 0, 0.35, 1);
}
.palco-sala.is-dentro .sala { transform: translateZ(300px); }

.parede { position: absolute; }
/* concreto: ruído suave feito com gradientes */
.esquerda, .direita, .fundo {
  background:
    radial-gradient(circle at 30% 40%, rgb(255 255 255 / 0.05), transparent 40%),
    linear-gradient(180deg, #8a8f96, #5b6066);
}
.fundo {
  inset: 0;
  display: grid;
  place-items: center;
  transform: translateZ(-600px);
}
.esquerda { left: 0; top: 0; width: 600px; height: 100%; transform-origin: left center; transform: rotateY(90deg); }
.direita { right: 0; top: 0; width: 600px; height: 100%; transform-origin: right center; transform: rotateY(-90deg); }
.teto {
  left: 0; top: 0; width: 100%; height: 600px;
  transform-origin: center top;
  transform: rotateX(-90deg);
  /* luzes lineares no teto */
  background:
    repeating-linear-gradient(180deg, transparent 0 70px, #f4f8ff 70px 76px, transparent 76px 140px) 50% 0 / 6px 100% no-repeat,
    repeating-linear-gradient(180deg, transparent 0 70px, #f4f8ff 70px 76px, transparent 76px 140px) 20% 0 / 4px 100% no-repeat,
    repeating-linear-gradient(180deg, transparent 0 70px, #f4f8ff 70px 76px, transparent 76px 140px) 80% 0 / 4px 100% no-repeat,
    #6c7178;
}
.chao {
  left: 0; bottom: 0; width: 100%; height: 600px;
  transform-origin: center bottom;
  transform: rotateX(90deg);
  background: linear-gradient(0deg, #2b3036, #b9c2cc 120%);
}

/* A "tela" na parede do fundo (no lugar de um <video>) */
.tela {
  display: grid;
  place-items: center;
  width: 62%;
  aspect-ratio: 16 / 9;
  color: #fff;
  font-weight: 700;
  background: linear-gradient(120deg, #2f7bff, #22e3ff, #ff2bd6, #2f7bff) 0 0 / 300% 100%;
  box-shadow: 0 0 60px rgb(34 227 255 / 0.45);
  animation: passar 6s linear infinite;
}
@keyframes passar { to { background-position: 300% 0; } }

.entrar {
  padding: 10px 20px;
  border: 1px solid #3a3456;
  border-radius: 999px;
  background: transparent;
  color: #f4f2ff;
  font: inherit;
  cursor: pointer;
}
.entrar:focus-visible { outline: 2px solid #22e3ff; outline-offset: 3px; }

@media (prefers-reduced-motion: reduce) {
  .sala { transition: none; }
  .tela { animation: none; }
}
</style>
</head>
<body>
<section class="palco-sala" role="img" aria-label="Corredor de concreto com luzes no teto e um vídeo na parede do fundo">
  <div class="sala">
    <div class="parede fundo">
      <div class="tela"><span>Seu vídeo aqui</span></div>
    </div>
    <div class="parede esquerda"></div>
    <div class="parede direita"></div>
    <div class="parede teto"></div>
    <div class="parede chao"></div>
  </div>
</section>
<button class="entrar" type="button" aria-pressed="false">Entrar na sala</button>
<script>
const palco = document.querySelector('.palco-sala');
const botao = document.querySelector('.entrar');
let quadro = 0;

// o olhar acompanha o mouse: muda o ponto de fuga (perspective-origin)
palco.addEventListener('pointermove', (e) => {
  cancelAnimationFrame(quadro);
  quadro = requestAnimationFrame(() => {
    const r = palco.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    palco.style.setProperty('--px', 30 + x * 40 + '%');
    palco.style.setProperty('--py', 30 + y * 40 + '%');
  });
});

botao.addEventListener('click', () => {
  const dentro = palco.classList.toggle('is-dentro');
  botao.setAttribute('aria-pressed', String(dentro));
  botao.textContent = dentro ? 'Sair da sala' : 'Entrar na sala';
});
</script>
</body>
</html>
```

## Versão Angular (valores padrão)

Também em `src/app/efeitos-angular/room-3d/` (compilada e testada com o app).

`room-3d.ts`

```ts
import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-room-3d',
  templateUrl: './room-3d.html',
  styleUrl: './room-3d.css',
})
export class Room3d {
  protected readonly px = signal('50%');
  protected readonly py = signal('50%');
  protected readonly dentro = signal(false);
  private quadro = 0;

  /** O olhar acompanha o mouse: muda o ponto de fuga (perspective-origin). */
  protected olhar(e: PointerEvent, palco: HTMLElement): void {
    cancelAnimationFrame(this.quadro);
    this.quadro = requestAnimationFrame(() => {
      const r = palco.getBoundingClientRect();
      this.px.set(30 + ((e.clientX - r.left) / r.width) * 40 + '%');
      this.py.set(30 + ((e.clientY - r.top) / r.height) * 40 + '%');
    });
  }
}
```

`room-3d.html`

```html
<section
  #palco
  class="palco-sala"
  role="img"
  aria-label="Corredor de concreto com luzes no teto e um vídeo na parede do fundo"
  [class.is-dentro]="dentro()"
  [style.--px]="px()"
  [style.--py]="py()"
  (pointermove)="olhar($event, palco)"
>
  <div class="sala">
    <div class="parede fundo">
      <div class="tela"><span>Seu vídeo aqui</span></div>
    </div>
    <div class="parede esquerda"></div>
    <div class="parede direita"></div>
    <div class="parede teto"></div>
    <div class="parede chao"></div>
  </div>
</section>
<button class="entrar" type="button" [attr.aria-pressed]="dentro()" (click)="dentro.set(!dentro())">
  {{ dentro() ? 'Sair da sala' : 'Entrar na sala' }}
</button>
```

`room-3d.css`

```css
:host {
  display: grid;
  place-items: center;
  gap: 24px;
}

/* A câmera: distância (perspective) e direção do olhar (perspective-origin) */
.palco-sala {
  --px: 50%;
  --py: 50%;
  position: relative;
  width: min(100%, 640px);
  aspect-ratio: 16 / 10;
  border-radius: 20px;
  overflow: hidden;
  background: #0d0f12;
  perspective: 500px;
  perspective-origin: var(--px) var(--py);
}
.sala {
  position: absolute;
  inset: 0;
  transform-style: preserve-3d;
  transition: transform 1200ms cubic-bezier(0.65, 0, 0.35, 1);
}
.palco-sala.is-dentro .sala { transform: translateZ(300px); }

.parede { position: absolute; }
/* concreto: ruído suave feito com gradientes */
.esquerda, .direita, .fundo {
  background:
    radial-gradient(circle at 30% 40%, rgb(255 255 255 / 0.05), transparent 40%),
    linear-gradient(180deg, #8a8f96, #5b6066);
}
.fundo {
  inset: 0;
  display: grid;
  place-items: center;
  transform: translateZ(-600px);
}
.esquerda { left: 0; top: 0; width: 600px; height: 100%; transform-origin: left center; transform: rotateY(90deg); }
.direita { right: 0; top: 0; width: 600px; height: 100%; transform-origin: right center; transform: rotateY(-90deg); }
.teto {
  left: 0; top: 0; width: 100%; height: 600px;
  transform-origin: center top;
  transform: rotateX(-90deg);
  /* luzes lineares no teto */
  background:
    repeating-linear-gradient(180deg, transparent 0 70px, #f4f8ff 70px 76px, transparent 76px 140px) 50% 0 / 6px 100% no-repeat,
    repeating-linear-gradient(180deg, transparent 0 70px, #f4f8ff 70px 76px, transparent 76px 140px) 20% 0 / 4px 100% no-repeat,
    repeating-linear-gradient(180deg, transparent 0 70px, #f4f8ff 70px 76px, transparent 76px 140px) 80% 0 / 4px 100% no-repeat,
    #6c7178;
}
.chao {
  left: 0; bottom: 0; width: 100%; height: 600px;
  transform-origin: center bottom;
  transform: rotateX(90deg);
  background: linear-gradient(0deg, #2b3036, #b9c2cc 120%);
}

/* A "tela" na parede do fundo (no lugar de um <video>) */
.tela {
  display: grid;
  place-items: center;
  width: 62%;
  aspect-ratio: 16 / 9;
  color: #fff;
  font-weight: 700;
  background: linear-gradient(120deg, #2f7bff, #22e3ff, #ff2bd6, #2f7bff) 0 0 / 300% 100%;
  box-shadow: 0 0 60px rgb(34 227 255 / 0.45);
  animation: passar 6s linear infinite;
}
@keyframes passar { to { background-position: 300% 0; } }

.entrar {
  padding: 10px 20px;
  border: 1px solid #3a3456;
  border-radius: 999px;
  background: transparent;
  color: #f4f2ff;
  font: inherit;
  cursor: pointer;
}
.entrar:focus-visible { outline: 2px solid #22e3ff; outline-offset: 3px; }

@media (prefers-reduced-motion: reduce) {
  .sala { transition: none; }
  .tela { animation: none; }
}
```
