# Parallax em camadas (`layered-parallax`)

> Gerado a partir de `src/app/core/efeitos/kits/layered-parallax.kit.ts`. Não edite à mão: rode `npm run docs:efeitos`.

As camadas de uma cena se movem em velocidades diferentes durante a rolagem, criando profundidade.

| Campo | Valor |
|---|---|
| Nome técnico | Layered Parallax |
| Categoria | 03 · Scroll e parallax › Parallax |
| Nível | Intermediário |
| Tecnologias | HTML, CSS, JavaScript |
| Dependências | nenhuma |
| Interação | Rolagem |
| Status | validado em 2026-11-17 |
| Tags | parallax, camadas, profundidade, scroll, hero, rolagem |

## Objetivo visual

Dar sensação de espaço e profundidade a um hero ilustrado.

## Aplicações

- Heros ilustrados
- Abertura de campanhas
- Storytelling visual

## Como funciona

### Nível 1 — Iniciante

- A cena é feita de camadas empilhadas: céu, sol, três montanhas e o título.
- Ao rolar, cada camada anda numa velocidade diferente — as do fundo mais devagar, como na vida real quando você olha pela janela do ônibus.
- Essa diferença de velocidade dá a sensação de profundidade.

### Nível 2 — Intermediário

- Cada camada tem um data-velocidade: quanto maior, mais devagar ela "sobe" em relação à página — como objetos distantes.
- No scroll, o script calcula scrollY × velocidade × intensidade e aplica translateY em cada camada.
- requestAnimationFrame junta várias rolagens num só cálculo por quadro.
- As montanhas são polígonos feitos com clip-path, e o sol é um radial-gradient — a cena não usa imagens.

### Nível 3 — Avançado

- Velocidade 0 acompanha a página; velocidades maiores "atrasam" a camada, como se estivesse mais longe.
- will-change: transform promove cada camada para a GPU; use com moderação, porque cada camada ocupa memória de vídeo.
- O listener passivo e o requestAnimationFrame mantêm a rolagem fluida mesmo com várias camadas.
- Para cenas no meio da página, calcule o progresso a partir de getBoundingClientRect da seção (ou use ScrollTrigger), em vez de scrollY total.
- No Angular, um único signal y alimenta o [style.transform] de todas as camadas.

### Glossário do código

| Termo | O que faz |
|---|---|
| `data-velocidade` | Quanto cada camada fica para trás em relação à rolagem. |
| `scrollY` | Quantos pixels a página já rolou. |
| `translateY` | Move a camada na vertical sem mexer no layout. |
| `clip-path: polygon` | Recorta a camada no formato de montanha. |
| `will-change` | Avisa o navegador que a camada vai se mover, para prepará-la na GPU. |
| `prefers-reduced-motion` | Com essa preferência, a cena fica parada. |

## Parâmetros

| Controle | Tipo | Padrão | Faixa / opções |
|---|---|---|---|
| intensidade | range | 1× | 0.1–1.5× (passo 0.1) |
| sentido | seleção | 1 | camadas ficam para trás, camadas se adiantam |
| altura da cena | range | 90vh | 60–100vh (passo 5) |

## Outra forma de fazer

Com GSAP ScrollTrigger: gsap.to(camada, { yPercent: 40, scrollTrigger: { scrub: true } }) — veja a demo "Camadas em velocidades diferentes" no Scroll Lab.

## Compatibilidade

Todos os navegadores atuais.

## Responsividade

As camadas usam porcentagens e vw, então a cena se adapta à largura. Em telas pequenas, intensidades menores ficam melhores.

## Acessibilidade

Parallax pode causar desconforto em pessoas com distúrbios vestibulares: com prefers-reduced-motion o script não move nada e a cena fica estática. O título é texto real.

## Performance

Uma escrita de transform por camada por quadro, só enquanto a página rola, com listener passivo. Nenhuma leitura de layout dentro do quadro.

## Limitações

- Só funciona bem perto do topo da página: a cena calcula a partir de scrollY total.
- Intensidade alta pode deixar vãos aparecendo na base da cena.

## Referências

- [MDN — transform](https://developer.mozilla.org/en-US/docs/Web/CSS/transform)
- [MDN — requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame)
- [MDN — prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)
- [WCAG 2.2 — 2.3.3 Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)

## Código (valores padrão)

Arquivo único, igual ao baixado pelo botão “Baixar” na página do efeito:

```html
<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data:; font-src data:">
<title>Parallax em camadas · Kalixto Creative Lab</title>
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

.cena {
  position: relative;
  height: 90vh;
  overflow: hidden;
  background: linear-gradient(#1a1040, #6d2bd9 70%, #ff2bd6);
}
.camada {
  position: absolute;
  inset: 0;
  will-change: transform;
}
.sol {
  background: radial-gradient(circle at 50% 55%, #ffd27a 0 9vmin, transparent 9.3vmin);
}
.montanha--fundo { background: #4b2a99; clip-path: polygon(0 70%, 18% 48%, 36% 66%, 55% 40%, 78% 62%, 100% 46%, 100% 100%, 0 100%); }
.montanha--meio  { background: #2d1a66; clip-path: polygon(0 80%, 22% 60%, 44% 78%, 66% 56%, 86% 74%, 100% 64%, 100% 100%, 0 100%); }
.montanha--frente { background: #0b0a14; clip-path: polygon(0 90%, 25% 78%, 50% 92%, 75% 80%, 100% 90%, 100% 100%, 0 100%); }
.titulo {
  display: grid;
  place-items: center;
  margin: 0;
  font-size: clamp(2rem, 9vw, 5rem);
  letter-spacing: 0.04em;
  text-shadow: 0 4px 24px rgb(0 0 0 / 0.4);
}
</style>
</head>
<body>
<section class="cena">
  <div class="camada sol" data-velocidade="0.6" aria-hidden="true"></div>
  <div class="camada montanha montanha--fundo" data-velocidade="0.35" aria-hidden="true"></div>
  <div class="camada montanha montanha--meio" data-velocidade="0.2" aria-hidden="true"></div>
  <h1 class="camada titulo" data-velocidade="0.5">Profundidade</h1>
  <div class="camada montanha montanha--frente" data-velocidade="0" aria-hidden="true"></div>
</section>

<section class="fim"><p>Role para cima e para baixo para ver as camadas.</p></section>
<script>
const camadas = document.querySelectorAll('.camada');
const INTENSIDADE = 1;
const SENTIDO = 1; // 1 = camadas ficam para trás · -1 = se adiantam
const reduzir = window.matchMedia('(prefers-reduced-motion: reduce)');
let quadro = 0;

function mover() {
  const y = window.scrollY;
  camadas.forEach((camada) => {
    const velocidade = Number(camada.dataset.velocidade);
    camada.style.transform = `translateY(${y * velocidade * INTENSIDADE * SENTIDO}px)`;
  });
}

window.addEventListener('scroll', () => {
  if (reduzir.matches) return; // cena estática para quem prefere menos movimento
  cancelAnimationFrame(quadro);
  quadro = requestAnimationFrame(mover);
}, { passive: true });
</script>
</body>
</html>
```

## Versão Angular (valores padrão)

Também em `src/app/efeitos-angular/layered-parallax/` (compilada e testada com o app).

`layered-parallax.ts`

```ts
import { Component, signal } from '@angular/core';

interface Camada {
  classe: string;
  velocidade: number;
}

@Component({
  selector: 'app-layered-parallax',
  templateUrl: './layered-parallax.html',
  styleUrl: './layered-parallax.css',
  host: { '(window:scroll)': 'rolou()' },
})
export class LayeredParallax {
  protected readonly camadas: Camada[] = [
    { classe: 'sol', velocidade: 0.6 },
    { classe: 'montanha montanha--fundo', velocidade: 0.35 },
    { classe: 'montanha montanha--meio', velocidade: 0.2 },
    { classe: 'titulo', velocidade: 0.5 },
    { classe: 'montanha montanha--frente', velocidade: 0 },
  ];
  private readonly intensidade = 1;
  private readonly sentido = 1;
  private readonly reduzir = window.matchMedia('(prefers-reduced-motion: reduce)');
  private quadro = 0;

  /** Rolagem atual da janela, em px. */
  protected readonly y = signal(0);

  protected rolou(): void {
    if (this.reduzir.matches) return;
    cancelAnimationFrame(this.quadro);
    this.quadro = requestAnimationFrame(() => this.y.set(window.scrollY));
  }

  protected deslocamento(c: Camada): string {
    return `translateY(${this.y() * c.velocidade * this.intensidade * this.sentido}px)`;
  }
}
```

`layered-parallax.html`

```html
<section class="cena">
  @for (c of camadas; track c.classe) {
    @if (c.classe === 'titulo') {
      <h1 class="camada titulo" [style.transform]="deslocamento(c)">Profundidade</h1>
    } @else {
      <div class="camada" [class]="'camada ' + c.classe" aria-hidden="true" [style.transform]="deslocamento(c)"></div>
    }
  }
</section>
```

`layered-parallax.css`

```css
:host { display: block; }

.cena {
  position: relative;
  height: 90vh;
  overflow: hidden;
  background: linear-gradient(#1a1040, #6d2bd9 70%, #ff2bd6);
}
.camada {
  position: absolute;
  inset: 0;
  will-change: transform;
}
.sol {
  background: radial-gradient(circle at 50% 55%, #ffd27a 0 9vmin, transparent 9.3vmin);
}
.montanha--fundo { background: #4b2a99; clip-path: polygon(0 70%, 18% 48%, 36% 66%, 55% 40%, 78% 62%, 100% 46%, 100% 100%, 0 100%); }
.montanha--meio  { background: #2d1a66; clip-path: polygon(0 80%, 22% 60%, 44% 78%, 66% 56%, 86% 74%, 100% 64%, 100% 100%, 0 100%); }
.montanha--frente { background: #0b0a14; clip-path: polygon(0 90%, 25% 78%, 50% 92%, 75% 80%, 100% 90%, 100% 100%, 0 100%); }
.titulo {
  display: grid;
  place-items: center;
  margin: 0;
  font-size: clamp(2rem, 9vw, 5rem);
  letter-spacing: 0.04em;
  text-shadow: 0 4px 24px rgb(0 0 0 / 0.4);
}
```
