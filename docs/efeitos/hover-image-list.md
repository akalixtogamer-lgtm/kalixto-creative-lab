# Lista com imagem que segue o cursor (`hover-image-list`)

> Gerado a partir de `src/app/core/efeitos/kits/hover-image-list.kit.ts`. Não edite à mão: rode `npm run docs:efeitos`.

Uma lista de projetos em texto grande; ao passar o mouse numa linha, a imagem daquele projeto aparece flutuando junto ao cursor, com atraso suave e inclinação pela velocidade.

| Campo | Valor |
|---|---|
| Nome técnico | Hover Image Reveal (lista de projetos) |
| Categoria | 05 · Mouse e cursor › Prévia flutuante |
| Nível | Intermediário |
| Tecnologias | HTML, CSS, JavaScript |
| Dependências | nenhuma |
| Interação | Movimento do mouse, Hover, Teclado |
| Status | validado em 2026-11-17 |
| Tags | hover reveal, imagem flutuante, lista de projetos, portfólio, cursor, lerp, tendência 2026 |

## Objetivo visual

Manter a página limpa e tipográfica, mas dar uma prévia visual imediata de cada trabalho — padrão clássico de portfólios premiados.

## Aplicações

- Lista de projetos de portfólio
- Cardápio com foto do prato
- Lista de artistas, eventos ou produtos

## Como funciona

### Nível 1 — Iniciante

- Os nomes dos projetos ficam numa lista, só com texto grande.
- Passando o mouse num nome, aparece a imagem daquele projeto, que vai atrás do mouse com um pouquinho de atraso.
- Se você mexer rápido, a imagem inclina, como se tivesse peso.

### Nível 2 — Intermediário

- Existe uma única "prévia" fixa na página. Entrar numa linha troca o fundo dela pelo do projeto e a mostra; sair da lista a esconde.
- A posição segue o mouse com interpolação: a cada quadro a prévia anda uma fração (atraso) da distância até o cursor. Fração pequena = movimento preguiçoso e elegante.
- A inclinação vem da velocidade horizontal (diferença entre o alvo e a posição atual), limitada ao ângulo máximo — ela "balança" ao mover rápido.
- No teclado, o foco num link mostra a prévia ao lado da linha, sem depender do mouse.

### Nível 3 — Avançado

- Interpolação linear (lerp): x += (alvo − x) × k. É uma mola sem rebote; k é a "rigidez".
- O loop para quando a distância fica abaixo de 0,5px: nenhum trabalho com a página parada.
- position: fixed + translate com clientX/clientY: a prévia usa coordenadas da janela, então não depende do scroll.
- pointerType === "mouse" evita a prévia "presa" em telas de toque, onde não existe pointerleave confiável.

### Glossário do código

| Termo | O que faz |
|---|---|
| `pointerType` | Diferencia mouse, caneta e toque. |
| `position: fixed` | A prévia usa as coordenadas da janela. |
| `dataset.fundo` | Lê a imagem/fundo guardado no atributo data-fundo do link. |
| `requestAnimationFrame` | Move a prévia uma vez por quadro de tela. |

## Parâmetros

| Controle | Tipo | Padrão | Faixa / opções |
|---|---|---|---|
| suavidade do movimento | range | 0.15 | 0.05–0.5 (passo 0.05) |
| inclinação máxima | range | 8deg | 0–20deg (passo 2) |
| tamanho da prévia | range | 200px | 140–300px (passo 20) |

## Outra forma de fazer

Com GSAP: gsap.quickTo(previa, "x", { duration: 0.6, ease: "power3" }) faz a interpolação em uma linha. Em WebGL, a imagem pode ainda deformar com a velocidade (efeito "rgb shift").

## Compatibilidade

Pointer events e propriedades individuais (translate, rotate): todos os navegadores atuais.

## Responsividade

Em telas de toque não há hover: a prévia só aparece com ponteiro do tipo mouse (pointerType), e os links continuam funcionando normalmente.

## Acessibilidade

A prévia é decorativa (aria-hidden); o conteúdo está nos links. Foco por teclado mostra a prévia. Com prefers-reduced-motion não há atraso nem inclinação.

## Performance

Um loop de requestAnimationFrame que para sozinho quando a prévia alcança o cursor; só translate e rotate mudam.

## Limitações

- Com imagens reais, pré-carregue todas (new Image()) para a troca não piscar no primeiro hover.

## Referências

- [MDN — Pointer events](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events)
- [MDN — requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame)
- [MDN — @media (pointer)](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/pointer)

## Código (valores padrão)

Arquivo único, igual ao baixado pelo botão “Baixar” na página do efeito:

```html
<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data:; font-src data:">
<title>Lista com imagem que segue o cursor · Kalixto Creative Lab</title>
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

.projetos {
  width: min(100%, 640px);
  margin: 0;
  padding: 0;
  list-style: none;
}
.projetos a {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 18px 4px;
  border-bottom: 1px solid #2a2540;
  color: #f4f2ff;
  text-decoration: none;
  font-size: clamp(1.6rem, 6vw, 2.8rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  transition: color 300ms ease, padding 300ms ease;
}
.projetos a small { font-size: 14px; font-weight: 400; color: #8f88b5; }
.projetos:hover a { color: #4a4466; }
.projetos a:hover, .projetos a:focus-visible { color: #f4f2ff; padding-left: 16px; }
.projetos a:focus-visible { outline: 2px solid #22e3ff; outline-offset: 2px; }

/* Uma prévia só, presa à tela, que segue o ponteiro */
.previa {
  position: fixed;
  left: 0;
  top: 0;
  width: 200px;
  aspect-ratio: 4 / 3;
  margin: -75px 0 0 -100px;
  border-radius: 12px;
  background: var(--fundo);
  box-shadow: 0 20px 50px rgb(0 0 0 / 0.45);
  pointer-events: none;
  opacity: 0;
  scale: 0.8;
  transition: opacity 250ms ease, scale 250ms ease;
}
.previa.is-visivel { opacity: 1; scale: 1; }

@media (prefers-reduced-motion: reduce) {
  .previa, .projetos a { transition: none; }
}
</style>
</head>
<body>
<ul class="projetos">
  <li><a href="#" data-fundo="linear-gradient(135deg, #2f7bff, #22e3ff)"><span>Maré</span><small>2026</small></a></li>
  <li><a href="#" data-fundo="linear-gradient(135deg, #1f6b4a, #c6ff3d)"><span>Erva Brava</span><small>2025</small></a></li>
  <li><a href="#" data-fundo="linear-gradient(135deg, #ff2e3e, #ff8a5c)"><span>Pedal</span><small>2025</small></a></li>
  <li><a href="#" data-fundo="linear-gradient(135deg, #2a1f6b, #ff2bd6)"><span>Sopro</span><small>2024</small></a></li>
</ul>
<div class="previa" aria-hidden="true"></div>
<script>
const previa = document.querySelector('.previa');
const lista = document.querySelector('.projetos');
const reduzir = matchMedia('(prefers-reduced-motion: reduce)');
const ATRASO = reduzir.matches ? 1 : 0.15;
const INCLINACAO = reduzir.matches ? 0 : 8;
let alvoX = 0, alvoY = 0, x = 0, y = 0, quadro = 0;

function seguir() {
  const dx = alvoX - x;
  x += dx * ATRASO;
  y += (alvoY - y) * ATRASO;
  // inclina pela velocidade horizontal, limitada ao ângulo máximo
  const angulo = Math.max(-INCLINACAO, Math.min(INCLINACAO, dx * 0.1));
  previa.style.translate = x + 'px ' + y + 'px';
  previa.style.rotate = angulo + 'deg';
  quadro = Math.abs(dx) + Math.abs(alvoY - y) > 0.5 ? requestAnimationFrame(seguir) : 0;
}

function mirar(px, py) {
  alvoX = px;
  alvoY = py;
  if (!quadro) quadro = requestAnimationFrame(seguir);
}

function mostrar(link) {
  previa.style.setProperty('--fundo', link.dataset.fundo);
  previa.classList.add('is-visivel');
}

lista.querySelectorAll('a').forEach((link) => {
  link.addEventListener('pointerenter', (e) => {
    if (e.pointerType !== 'mouse') return;
    if (!previa.classList.contains('is-visivel')) { x = e.clientX; y = e.clientY; }
    mostrar(link);
  });
  // teclado: a prévia aparece ao lado da linha focada
  link.addEventListener('focus', () => {
    const r = link.getBoundingClientRect();
    x = alvoX = r.right - 200 / 2;
    y = alvoY = r.top + r.height / 2;
    mostrar(link);
    mirar(alvoX, alvoY);
  });
  link.addEventListener('blur', () => previa.classList.remove('is-visivel'));
  link.addEventListener('click', (e) => e.preventDefault());
});
lista.addEventListener('pointermove', (e) => mirar(e.clientX, e.clientY));
lista.addEventListener('pointerleave', () => previa.classList.remove('is-visivel'));
</script>
</body>
</html>
```

## Versão Angular (valores padrão)

Também em `src/app/efeitos-angular/hover-image-list/` (compilada e testada com o app).

`hover-image-list.ts`

```ts
import { Component, ElementRef, signal, viewChild } from '@angular/core';

interface Projeto {
  nome: string;
  ano: string;
  fundo: string;
}

@Component({
  selector: 'app-hover-image-list',
  templateUrl: './hover-image-list.html',
  styleUrl: './hover-image-list.css',
})
export class HoverImageList {
  protected readonly projetos: Projeto[] = [
    {
      nome: 'Maré',
      ano: '2026',
      fundo: 'linear-gradient(135deg, #2f7bff, #22e3ff)'
    },
    {
      nome: 'Erva Brava',
      ano: '2025',
      fundo: 'linear-gradient(135deg, #1f6b4a, #c6ff3d)'
    },
    {
      nome: 'Pedal',
      ano: '2025',
      fundo: 'linear-gradient(135deg, #ff2e3e, #ff8a5c)'
    },
    {
      nome: 'Sopro',
      ano: '2024',
      fundo: 'linear-gradient(135deg, #2a1f6b, #ff2bd6)'
    }
  ];
  private readonly reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  private readonly atraso = this.reduzir ? 1 : 0.15;
  private readonly inclinacao = this.reduzir ? 0 : 8;
  private readonly previa = viewChild.required<ElementRef<HTMLElement>>('previa');
  private alvoX = 0;
  private alvoY = 0;
  private x = 0;
  private y = 0;
  private quadro = 0;

  protected readonly fundo = signal('');
  protected readonly visivel = signal(false);

  protected entrar(e: PointerEvent, p: Projeto): void {
    if (e.pointerType !== 'mouse') return;
    if (!this.visivel()) {
      this.x = e.clientX;
      this.y = e.clientY;
    }
    this.mostrar(p);
  }

  protected focar(link: HTMLElement, p: Projeto): void {
    const r = link.getBoundingClientRect();
    this.x = this.alvoX = r.right - 200 / 2;
    this.y = this.alvoY = r.top + r.height / 2;
    this.mostrar(p);
    this.mirar(this.alvoX, this.alvoY);
  }

  protected mirar(px: number, py: number): void {
    this.alvoX = px;
    this.alvoY = py;
    if (!this.quadro) this.quadro = requestAnimationFrame(() => this.seguir());
  }

  private mostrar(p: Projeto): void {
    this.fundo.set(p.fundo);
    this.visivel.set(true);
  }

  /** Escrita direta no estilo: muda a cada quadro, fora da detecção de mudanças. */
  private seguir(): void {
    const dx = this.alvoX - this.x;
    this.x += dx * this.atraso;
    this.y += (this.alvoY - this.y) * this.atraso;
    const angulo = Math.max(-this.inclinacao, Math.min(this.inclinacao, dx * 0.1));
    const el = this.previa().nativeElement;
    el.style.translate = this.x + 'px ' + this.y + 'px';
    el.style.rotate = angulo + 'deg';
    this.quadro =
      Math.abs(dx) + Math.abs(this.alvoY - this.y) > 0.5 ? requestAnimationFrame(() => this.seguir()) : 0;
  }
}
```

`hover-image-list.html`

```html
<ul class="projetos" (pointermove)="mirar($event.clientX, $event.clientY)" (pointerleave)="visivel.set(false)">
  @for (p of projetos; track p.nome) {
    <li>
      <a
        #link
        href="#"
        (pointerenter)="entrar($event, p)"
        (focus)="focar(link, p)"
        (blur)="visivel.set(false)"
        (click)="$event.preventDefault()"
        ><span>{{ p.nome }}</span><small>{{ p.ano }}</small></a
      >
    </li>
  }
</ul>
<div #previa class="previa" aria-hidden="true" [class.is-visivel]="visivel()" [style.--fundo]="fundo()"></div>
```

`hover-image-list.css`

```css
:host {
  display: grid;
  place-items: center;
  gap: 24px;
}

.projetos {
  width: min(100%, 640px);
  margin: 0;
  padding: 0;
  list-style: none;
}
.projetos a {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 18px 4px;
  border-bottom: 1px solid #2a2540;
  color: #f4f2ff;
  text-decoration: none;
  font-size: clamp(1.6rem, 6vw, 2.8rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  transition: color 300ms ease, padding 300ms ease;
}
.projetos a small { font-size: 14px; font-weight: 400; color: #8f88b5; }
.projetos:hover a { color: #4a4466; }
.projetos a:hover, .projetos a:focus-visible { color: #f4f2ff; padding-left: 16px; }
.projetos a:focus-visible { outline: 2px solid #22e3ff; outline-offset: 2px; }

/* Uma prévia só, presa à tela, que segue o ponteiro */
.previa {
  position: fixed;
  left: 0;
  top: 0;
  width: 200px;
  aspect-ratio: 4 / 3;
  margin: -75px 0 0 -100px;
  border-radius: 12px;
  background: var(--fundo);
  box-shadow: 0 20px 50px rgb(0 0 0 / 0.45);
  pointer-events: none;
  opacity: 0;
  scale: 0.8;
  transition: opacity 250ms ease, scale 250ms ease;
}
.previa.is-visivel { opacity: 1; scale: 1; }

@media (prefers-reduced-motion: reduce) {
  .previa, .projetos a { transition: none; }
}
```
