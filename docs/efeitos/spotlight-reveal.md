# Lanterna que revela (`spotlight-reveal`)

> Gerado a partir de `src/app/core/efeitos/kits/spotlight-reveal.kit.ts`. Não edite à mão: rode `npm run docs:efeitos`.

Uma camada escura cobre o conteúdo e o ponteiro abre um círculo de luz, como uma lanterna.

| Campo | Valor |
|---|---|
| Nome técnico | Spotlight Reveal (mask-image) |
| Categoria | 05 · Mouse e cursor › Máscaras guiadas pelo ponteiro |
| Nível | Intermediário |
| Tecnologias | HTML, CSS, JavaScript |
| Dependências | nenhuma |
| Interação | Movimento do mouse, Toque, Clique, Teclado |
| Status | validado em 2026-11-17 |
| Tags | spotlight, lanterna, mask, mask-image, máscara, revelar, cursor |

## Objetivo visual

Criar descoberta e curiosidade: o usuário explora a área para ver o que está escondido.

## Aplicações

- Heros interativos
- Revelação de produto
- Easter eggs e jogos

## Como funciona

### Nível 1 — Iniciante

- Existe uma tela escura por cima de uma imagem colorida.
- Essa tela tem um buraco redondo, que segue o mouse (ou o dedo) e mostra o que está embaixo.
- O botão "Acender tudo" tira a tela escura para quem não pode usar o mouse.

### Nível 2 — Intermediário

- A camada .sombra fica por cima do conteúdo. mask-image com um radial-gradient deixa transparente só um círculo dela.
- O centro do círculo vem das variáveis --x e --y, que o JavaScript atualiza com a posição do ponteiro (mouse ou dedo).
- A distância entre as duas paradas do gradiente (raio e raio + borda) define se a borda da luz é dura ou suave.
- O botão "Acender tudo" remove a camada: é a alternativa para teclado e para quem não usa ponteiro.

### Nível 3 — Avançado

- Numa máscara, o que é opaco na imagem da máscara fica visível e o que é transparente some: transparent no centro abre o "furo".
- Variáveis CSS em mask-image fazem só a máscara repintar; o conteúdo embaixo não é redesenhado.
- touch-action: none deixa o dedo mover a luz sem rolar a página — use só na área do efeito.
- Camada com pointer-events: none: o conteúdo embaixo continua clicável e selecionável.
- No Angular, --x e --y vêm de signals ligados com [style.--x]; o palco é passado por template reference (#palco).

### Glossário do código

| Termo | O que faz |
|---|---|
| `mask-image` | Imagem que define o que aparece (opaco) e o que some (transparente). |
| `radial-gradient(circle at var(--x) var(--y)` | Círculo de luz centrado na posição do ponteiro. |
| `touch-action: none` | O toque move a luz em vez de rolar a página. |
| `pointer-events: none` | A camada escura não bloqueia cliques. |
| `aria-pressed` | Informa ao leitor de tela se o botão Acender tudo está ligado. |

## Parâmetros

| Controle | Tipo | Padrão | Faixa / opções |
|---|---|---|---|
| raio da luz | range | 110px | 40–240px (passo 10) |
| suavidade da borda | range | 40px | 0–120px (passo 5) |
| escuridão | range | 0.94 | 0.6–1 (passo 0.02) |

## Outra forma de fazer

clip-path: circle(R at x y) recorta com borda dura e funciona em ainda mais navegadores; mask-image permite borda suave.

## Compatibilidade

mask-image sem prefixo: Chrome e Edge 120+, Firefox 53+, Safari 15.4+. O CSS inclui -webkit-mask-image para navegadores mais antigos baseados em Chromium.

## Responsividade

Funciona com toque: o círculo segue o dedo enquanto ele desliza sobre a área.

## Acessibilidade

O texto escondido está no HTML e é lido normalmente pelo leitor de tela (a camada é decorativa, aria-hidden). O botão Acender tudo dá acesso visual sem ponteiro. Não há movimento automático.

## Performance

Cada movimento troca duas variáveis CSS (uma vez por quadro, com requestAnimationFrame); o navegador repinta só a camada da máscara.

## Limitações

- A camada escura cobre o conteúdo: links embaixo dela não recebem clique, a menos que a camada tenha pointer-events: none (como aqui).

## Referências

- [MDN — mask-image](https://developer.mozilla.org/en-US/docs/Web/CSS/mask-image)
- [MDN — Pointer events](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events)
- [MDN — requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame)

## Código (valores padrão)

Arquivo único, igual ao baixado pelo botão “Baixar” na página do efeito:

```html
<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data:; font-src data:">
<title>Lanterna que revela · Kalixto Creative Lab</title>
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

.palco-luz {
  position: relative;
  width: min(100%, 640px);
  aspect-ratio: 16 / 10;
  border-radius: 20px;
  overflow: hidden;
  touch-action: none; /* o dedo move a luz em vez de rolar a página */
}
.conteudo {
  display: grid;
  place-content: center;
  height: 100%;
  padding: 24px;
  text-align: center;
  background:
    radial-gradient(circle at 20% 30%, #ff2bd6, transparent 45%),
    radial-gradient(circle at 80% 70%, #22e3ff, transparent 45%),
    linear-gradient(135deg, #2a1f6b, #7c3aed);
}
.conteudo h1 { margin: 0 0 8px; font-size: clamp(1.5rem, 6vw, 2.6rem); }
.conteudo p { margin: 0; }

/* O efeito: uma camada escura com um "furo" redondo onde está o ponteiro */
.sombra {
  position: absolute;
  inset: 0;
  background: rgb(5 5 5 / 0.94);
  pointer-events: none;
  --x: 50%;
  --y: 50%;
  -webkit-mask-image: radial-gradient(circle at var(--x) var(--y), transparent 110px, #000 150px);
  mask-image: radial-gradient(circle at var(--x) var(--y), transparent 110px, #000 150px);
  transition: opacity 400ms ease;
}
.palco-luz.is-acesa .sombra { opacity: 0; }

.acender {
  padding: 10px 20px;
  border: 1px solid #3a3456;
  border-radius: 999px;
  background: transparent;
  color: #f4f2ff;
  font: inherit;
  cursor: pointer;
}
.acender:focus-visible { outline: 2px solid #22e3ff; outline-offset: 3px; }

@media (prefers-reduced-motion: reduce) {
  .sombra { transition: none; }
}
</style>
</head>
<body>
<section class="palco-luz">
  <div class="conteudo">
    <h1>Criatividade escondida</h1>
    <p>Explore a área com o mouse ou o dedo.</p>
  </div>
  <div class="sombra" aria-hidden="true"></div>
</section>
<button class="acender" type="button" aria-pressed="false">Acender tudo</button>
<script>
const palco = document.querySelector('.palco-luz');
const sombra = palco.querySelector('.sombra');
const botao = document.querySelector('.acender');
let quadro = 0;

palco.addEventListener('pointermove', (e) => {
  cancelAnimationFrame(quadro);
  quadro = requestAnimationFrame(() => {
    const r = palco.getBoundingClientRect();
    sombra.style.setProperty('--x', e.clientX - r.left + 'px');
    sombra.style.setProperty('--y', e.clientY - r.top + 'px');
  });
});

// alternativa sem ponteiro: acender a área toda
botao.addEventListener('click', () => {
  const acesa = palco.classList.toggle('is-acesa');
  botao.setAttribute('aria-pressed', String(acesa));
  botao.textContent = acesa ? 'Apagar' : 'Acender tudo';
});
</script>
</body>
</html>
```

## Versão Angular (valores padrão)

Também em `src/app/efeitos-angular/spotlight-reveal/` (compilada e testada com o app).

`spotlight-reveal.ts`

```ts
import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-spotlight-reveal',
  templateUrl: './spotlight-reveal.html',
  styleUrl: './spotlight-reveal.css',
})
export class SpotlightReveal {
  protected readonly x = signal('50%');
  protected readonly y = signal('50%');
  protected readonly acesa = signal(false);
  private quadro = 0;

  protected mover(e: PointerEvent, palco: HTMLElement): void {
    cancelAnimationFrame(this.quadro);
    this.quadro = requestAnimationFrame(() => {
      const r = palco.getBoundingClientRect();
      this.x.set(e.clientX - r.left + 'px');
      this.y.set(e.clientY - r.top + 'px');
    });
  }
}
```

`spotlight-reveal.html`

```html
<section #palco class="palco-luz" [class.is-acesa]="acesa()" (pointermove)="mover($event, palco)">
  <div class="conteudo">
    <h1>Criatividade escondida</h1>
    <p>Explore a área com o mouse ou o dedo.</p>
  </div>
  <div class="sombra" aria-hidden="true" [style.--x]="x()" [style.--y]="y()"></div>
</section>
<button class="acender" type="button" [attr.aria-pressed]="acesa()" (click)="acesa.set(!acesa())">
  {{ acesa() ? 'Apagar' : 'Acender tudo' }}
</button>
```

`spotlight-reveal.css`

```css
:host {
  display: grid;
  place-items: center;
  gap: 24px;
}

.palco-luz {
  position: relative;
  width: min(100%, 640px);
  aspect-ratio: 16 / 10;
  border-radius: 20px;
  overflow: hidden;
  touch-action: none; /* o dedo move a luz em vez de rolar a página */
}
.conteudo {
  display: grid;
  place-content: center;
  height: 100%;
  padding: 24px;
  text-align: center;
  background:
    radial-gradient(circle at 20% 30%, #ff2bd6, transparent 45%),
    radial-gradient(circle at 80% 70%, #22e3ff, transparent 45%),
    linear-gradient(135deg, #2a1f6b, #7c3aed);
}
.conteudo h1 { margin: 0 0 8px; font-size: clamp(1.5rem, 6vw, 2.6rem); }
.conteudo p { margin: 0; }

/* O efeito: uma camada escura com um "furo" redondo onde está o ponteiro */
.sombra {
  position: absolute;
  inset: 0;
  background: rgb(5 5 5 / 0.94);
  pointer-events: none;
  --x: 50%;
  --y: 50%;
  -webkit-mask-image: radial-gradient(circle at var(--x) var(--y), transparent 110px, #000 150px);
  mask-image: radial-gradient(circle at var(--x) var(--y), transparent 110px, #000 150px);
  transition: opacity 400ms ease;
}
.palco-luz.is-acesa .sombra { opacity: 0; }

.acender {
  padding: 10px 20px;
  border: 1px solid #3a3456;
  border-radius: 999px;
  background: transparent;
  color: #f4f2ff;
  font: inherit;
  cursor: pointer;
}
.acender:focus-visible { outline: 2px solid #22e3ff; outline-offset: 3px; }

@media (prefers-reduced-motion: reduce) {
  .sombra { transition: none; }
}
```
