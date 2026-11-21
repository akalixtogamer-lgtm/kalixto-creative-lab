# Mergulho no título em profundidade (`depth-zoom-title`)

> Gerado a partir de `src/app/core/efeitos/kits/depth-zoom-title.kit.ts`. Não edite à mão: rode `npm run docs:efeitos`.

A rolagem leva a câmera para dentro da cena: as letras do título estão em profundidades diferentes (umas na frente do objeto, outras atrás) e passam pela câmera uma a uma.

| Campo | Valor |
|---|---|
| Nome técnico | Scroll Depth Zoom (camadas em Z com letras na frente e atrás) |
| Categoria | 03 · Scroll e parallax › Scrollytelling cinematográfico |
| Nível | Avançado |
| Tecnologias | HTML, CSS, JavaScript |
| Dependências | nenhuma |
| Interação | Rolagem |
| Status | validado em 2026-11-17 |
| Tags | profundidade, z-depth, zoom, perspectiva, título, camadas, dolly, scrollytelling, referência em vídeo |

## Objetivo visual

Dar ao hero a sensação de "câmera entrando", como nos sites premiados em que o animal ou o produto atravessa o título.

## Aplicações

- Heros de marcas de moda, esporte e bebida
- Abertura de campanhas e lançamentos
- Portfólios de 3D e motion

## Como funciona

### Nível 1 — Iniciante

- É como andar para dentro de uma vitrine: rolando, você chega mais perto da esfera e das letras.
- Algumas letras estão na frente da esfera e outras atrás. As da frente passam por você primeiro e somem.
- No fim, a esfera ocupa a tela e aparece a frase.

### Nível 2 — Intermediário

- Cada camada tem uma distância z da câmera. A rolagem move a câmera (c = p × profundidade) e o tamanho de cada camada é z ÷ (z − c): começa em 1 (o título se lê inteiro) e cresce mais rápido nas camadas mais próximas — é a perspectiva feita à mão.
- A posição também é multiplicada pelo mesmo fator, então as letras se afastam do centro ao se aproximarem, como num carro entrando num túnel.
- A ordem de desenho (z-index) vem da profundidade: letras com z menor que o do objeto ficam na frente dele; as outras, atrás.
- Quando uma camada chega muito perto (z − c pequeno), ela some com opacity para não "explodir" na tela.

### Nível 3 — Avançado

- Projeção perspectiva à mão: escala = z ÷ (z − câmera), normalizada para que todas as camadas comecem no tamanho de 1×. É o mesmo cálculo que o CSS faz com perspective + translateZ.
- A posição x/y também é multiplicada pela escala, então tudo "foge do centro" ao se aproximar — o ponto de fuga é o centro da tela.
- O z-index é fixo e vem da ordem por profundidade (as camadas nunca trocam de ordem porque a câmera só anda em z).
- No Angular, as camadas são dados e o template usa @for/@switch; os estilos vêm de um signal recalculado na rolagem.

### Glossário do código

| Termo | O que faz |
|---|---|
| `k.z / d` | Escala da camada: quanto mais perto da câmera, maior. |
| `data-z` | A profundidade de cada camada. |
| `z-index` | Quem fica na frente: as camadas mais próximas. |
| `position: sticky` | Prende a cena na tela enquanto a seção alta passa. |

## Parâmetros

| Controle | Tipo | Padrão | Faixa / opções |
|---|---|---|---|
| letras | seleção | alternadas | alternadas (frente e atrás), todas atrás do objeto, todas na frente |
| quanto a câmera entra | range | 2.6 | 1.5–2.9 (passo 0.1) |
| altura da seção | range | 400vh | 250–600vh (passo 50) |
| cor do objeto | seleção | azul | azul, coral, verde |

## Outra forma de fazer

CSS 3D: perspective no palco e translateZ em cada camada, animando o translateZ do grupo com a rolagem (animation-timeline: scroll()). Com GSAP: ScrollTrigger com scrub animando a variável c.

## Compatibilidade

Só transform, opacity e position: sticky — todos os navegadores atuais.

## Responsividade

Posições em vw/vh e tamanhos em vmin: a cena se adapta a qualquer proporção de tela.

## Acessibilidade

O título é um h1 com aria-label com a palavra inteira; as letras soltas são aria-hidden. Com prefers-reduced-motion a cena fica parada no primeiro quadro, com a frase final visível.

## Performance

Por quadro: um transform e uma opacidade por camada (7 camadas), só quando a rolagem muda. Nada de layout.

## Limitações

- Com muitas camadas (dezenas), prefira CSS 3D ou WebGL, que fazem a perspectiva na GPU sem JS por camada.
- O "objeto" aqui é uma esfera em CSS; num site real, use uma imagem PNG/WebP recortada (com fundo transparente).

## Referências

- [MDN — transform](https://developer.mozilla.org/en-US/docs/Web/CSS/transform)
- [MDN — perspective](https://developer.mozilla.org/en-US/docs/Web/CSS/perspective)
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
<title>Mergulho no título em profundidade · Kalixto Creative Lab</title>
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

.mergulho { --p: 0; height: 400vh; }
.palco {
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: hidden;
  background: #eef1f6;
}
.titulo { margin: 0; font-weight: 400; }

/* Toda camada nasce no centro; o JS aplica escala e posição pela profundidade */
.camada {
  display: block;
  position: absolute;
  left: 50%;
  top: 50%;
  translate: -50% -50%;
  transform-origin: center;
  will-change: transform, opacity;
}
.fundo {
  width: 100vw;
  height: 100vh;
  background: radial-gradient(ellipse at 50% 60%, #ffffff 0%, #dfe6f1 55%, #b9c4d6 100%);
}
.sujeito {
  width: 42vmin;
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #dff0ff 0%, #4f8cff 38%, #13235c 100%);
  box-shadow: 0 30px 80px rgb(0 0 0 / 0.25), inset -20px -30px 60px rgb(0 0 0 / 0.25);
}
.letra {
  font: 400 clamp(4rem, 16vmin, 11rem) / 1 Georgia, 'Times New Roman', serif;
  color: #1c2440;
}
.letra:nth-child(3n) { color: #d7263d; }

.frase {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 12vh;
  z-index: 100;
  margin: 0;
  text-align: center;
  font: 600 clamp(1.4rem, 4vw, 2.6rem) / 1.1 system-ui, sans-serif;
  color: #fff;
  text-shadow: 0 2px 20px rgb(0 0 0 / 0.35);
  opacity: clamp(0, calc((var(--p) - 0.7) * 4), 1);
}

@media (prefers-reduced-motion: reduce) {
  .mergulho { height: auto; }
  .palco { position: relative; }
  .frase { opacity: 1; color: #1c2440; text-shadow: none; }
}
</style>
</head>
<body>
<section class="intro"><p>Role para baixo ↓</p></section>

<section class="mergulho">
  <div class="palco">
    <h1 class="titulo" aria-label="Origem">
      <span class="camada fundo" data-z="9" data-x="0.0" data-y="0" style="z-index: 1"></span>
      <span class="camada letra" data-z="3.6" data-x="-36.0" data-y="0" style="z-index: 2" aria-hidden="true">O</span>
      <span class="camada letra" data-z="3.6" data-x="-7.2" data-y="0" style="z-index: 3" aria-hidden="true">I</span>
      <span class="camada letra" data-z="3.6" data-x="21.6" data-y="0" style="z-index: 4" aria-hidden="true">E</span>
      <span class="camada sujeito" data-z="3" data-x="0.0" data-y="4" style="z-index: 5" role="img" aria-label="Esfera brilhante no centro da cena"></span>
      <span class="camada letra" data-z="2.3" data-x="-21.6" data-y="0" style="z-index: 6" aria-hidden="true">R</span>
      <span class="camada letra" data-z="2.3" data-x="7.2" data-y="0" style="z-index: 7" aria-hidden="true">G</span>
      <span class="camada letra" data-z="2.3" data-x="36.0" data-y="0" style="z-index: 8" aria-hidden="true">M</span>
    </h1>
    <p class="frase">Vá além do que se vê.</p>
  </div>
</section>

<section class="fim"><p>Fim da página</p></section>
<script>
const PROFUNDIDADE = 2.6;
const reduzir = matchMedia('(prefers-reduced-motion: reduce)').matches;
const secao = document.querySelector('.mergulho');
const camadas = [...document.querySelectorAll('.camada')].map((el) => ({
  el,
  z: Number(el.dataset.z),
  x: Number(el.dataset.x),
  y: Number(el.dataset.y),
}));

let quadro = 0;
function atualizar() {
  quadro = 0;
  const r = secao.getBoundingClientRect();
  const p = reduzir ? 0 : Math.min(1, Math.max(0, -r.top / (secao.offsetHeight - innerHeight)));
  secao.style.setProperty('--p', p.toFixed(4));
  const c = p * PROFUNDIDADE; // posição da câmera
  for (const k of camadas) {
    const d = k.z - c; // distância até a câmera
    if (d <= 0.15) {
      k.el.style.opacity = '0';
      continue;
    }
    const s = k.z / d; // começa em 1 e cresce ao se aproximar
    k.el.style.transform = 'translate(' + (k.x * s).toFixed(2) + 'vw, ' + (k.y * s).toFixed(2) + 'vh) scale(' + s.toFixed(3) + ')';
    k.el.style.opacity = Math.min(1, (d - 0.15) / 0.45).toFixed(3);
  }
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

Também em `src/app/efeitos-angular/depth-zoom-title/` (compilada e testada com o app).

`depth-zoom-title.ts`

```ts
import { Component, DestroyRef, ElementRef, afterNextRender, inject, signal, viewChild } from '@angular/core';

interface Camada {
  tipo: 'fundo' | 'sujeito' | 'letra';
  texto: string;
  z: number;
  x: number;
  y: number;
}

@Component({
  selector: 'app-depth-zoom-title',
  templateUrl: './depth-zoom-title.html',
  styleUrl: './depth-zoom-title.css',
})
export class DepthZoomTitle {
  private readonly profundidade = 2.6;
  private readonly secao = viewChild.required<ElementRef<HTMLElement>>('secao');
  /** Da mais longe para a mais perto (a ordem vira o z-index). */
  protected readonly camadas: Camada[] = [{"tipo":"fundo","texto":"","z":9,"x":0,"y":0},{"tipo":"letra","texto":"O","z":3.6,"x":-36,"y":0},{"tipo":"letra","texto":"I","z":3.6,"x":-7.2,"y":0},{"tipo":"letra","texto":"E","z":3.6,"x":21.6,"y":0},{"tipo":"sujeito","texto":"","z":3,"x":0,"y":4},{"tipo":"letra","texto":"R","z":2.3,"x":-21.6,"y":0},{"tipo":"letra","texto":"G","z":2.3,"x":7.2,"y":0},{"tipo":"letra","texto":"M","z":2.3,"x":36,"y":0}];
  protected readonly p = signal(0);
  /** Transform e opacidade de cada camada, recalculados na rolagem. */
  protected readonly estilos = signal(this.camadas.map(() => ({ transform: '', opacity: 1 })));

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      let quadro = 0;
      const atualizar = () => {
        quadro = 0;
        const el = this.secao().nativeElement;
        const r = el.getBoundingClientRect();
        const p = reduzir ? 0 : Math.min(1, Math.max(0, -r.top / (el.offsetHeight - window.innerHeight)));
        this.p.set(p);
        const c = p * this.profundidade;
        this.estilos.set(
          this.camadas.map((k) => {
            const d = k.z - c;
            if (d <= 0.15) return { transform: 'scale(0)', opacity: 0 };
            const s = k.z / d;
            return {
              transform: `translate(${(k.x * s).toFixed(2)}vw, ${(k.y * s).toFixed(2)}vh) scale(${s.toFixed(3)})`,
              opacity: Math.min(1, (d - 0.15) / 0.45),
            };
          }),
        );
      };
      const aoRolar = () => {
        if (!quadro) quadro = requestAnimationFrame(atualizar);
      };
      window.addEventListener('scroll', aoRolar, { passive: true });
      atualizar();
      destroyRef.onDestroy(() => {
        window.removeEventListener('scroll', aoRolar);
        cancelAnimationFrame(quadro);
      });
    });
  }
}
```

`depth-zoom-title.html`

```html
<section #secao class="mergulho" [style.--p]="p()">
  <div class="palco">
    <h1 class="titulo" aria-label="Origem">
      @for (k of camadas; track $index; let i = $index) {
        @switch (k.tipo) {
          @case ('letra') {
            <span
              class="camada letra"
              aria-hidden="true"
              [style.z-index]="i + 1"
              [style.transform]="estilos()[i].transform"
              [style.opacity]="estilos()[i].opacity"
              >{{ k.texto }}</span
            >
          }
          @case ('sujeito') {
            <span
              class="camada sujeito"
              role="img"
              aria-label="Esfera brilhante no centro da cena"
              [style.z-index]="i + 1"
              [style.transform]="estilos()[i].transform"
              [style.opacity]="estilos()[i].opacity"
            ></span>
          }
          @default {
            <span
              class="camada fundo"
              [style.z-index]="i + 1"
              [style.transform]="estilos()[i].transform"
              [style.opacity]="estilos()[i].opacity"
            ></span>
          }
        }
      }
    </h1>
    <p class="frase">Vá além do que se vê.</p>
  </div>
</section>
```

`depth-zoom-title.css`

```css
:host { display: block; }

.mergulho { --p: 0; height: 400vh; }
.palco {
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: hidden;
  background: #eef1f6;
}
.titulo { margin: 0; font-weight: 400; }

/* Toda camada nasce no centro; o JS aplica escala e posição pela profundidade */
.camada {
  display: block;
  position: absolute;
  left: 50%;
  top: 50%;
  translate: -50% -50%;
  transform-origin: center;
  will-change: transform, opacity;
}
.fundo {
  width: 100vw;
  height: 100vh;
  background: radial-gradient(ellipse at 50% 60%, #ffffff 0%, #dfe6f1 55%, #b9c4d6 100%);
}
.sujeito {
  width: 42vmin;
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #dff0ff 0%, #4f8cff 38%, #13235c 100%);
  box-shadow: 0 30px 80px rgb(0 0 0 / 0.25), inset -20px -30px 60px rgb(0 0 0 / 0.25);
}
.letra {
  font: 400 clamp(4rem, 16vmin, 11rem) / 1 Georgia, 'Times New Roman', serif;
  color: #1c2440;
}
.letra:nth-child(3n) { color: #d7263d; }

.frase {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 12vh;
  z-index: 100;
  margin: 0;
  text-align: center;
  font: 600 clamp(1.4rem, 4vw, 2.6rem) / 1.1 system-ui, sans-serif;
  color: #fff;
  text-shadow: 0 2px 20px rgb(0 0 0 / 0.35);
  opacity: clamp(0, calc((var(--p) - 0.7) * 4), 1);
}

@media (prefers-reduced-motion: reduce) {
  .mergulho { height: auto; }
  .palco { position: relative; }
  .frase { opacity: 1; color: #1c2440; text-shadow: none; }
}
```
