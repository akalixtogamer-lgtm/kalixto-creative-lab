# Botão magnético (`magnetic-button`)

> Gerado a partir de `src/app/core/efeitos/kits/magnetic-button.kit.ts`. Não edite à mão: rode `npm run docs:efeitos`.

Quando o ponteiro se aproxima, o botão é "puxado" na direção dele e volta ao lugar quando o ponteiro se afasta.

| Campo | Valor |
|---|---|
| Nome técnico | Magnetic Button |
| Categoria | 05 · Mouse e cursor › Elementos magnéticos |
| Nível | Intermediário |
| Tecnologias | HTML, CSS, JavaScript |
| Dependências | nenhuma |
| Interação | Movimento do mouse, Teclado |
| Status | validado em 2026-11-17 |
| Tags | magnético, magnetic, cursor, pointer, botão, hover |

## Objetivo visual

Dar personalidade e sensação tátil a uma ação importante.

## Aplicações

- Botão principal de um hero
- Links de contato
- Ícones de redes sociais

## Como funciona

### Nível 1 — Iniciante

- O código mede a distância entre o mouse e o centro do botão.
- Se o mouse está perto, o botão anda um pedaço dessa distância na direção dele; se está longe, volta ao lugar.
- A força decide quanto ele anda: 0,4 significa 40% da distância.

### Nível 2 — Intermediário

- O JavaScript escuta pointermove na janela e calcula a distância entre o ponteiro e o centro do botão.
- Dentro do raio de alcance, o botão é deslocado por uma fração (a força) dessa distância, com transform: translate.
- Fora do raio, o transform é limpo e a transition do CSS faz o botão voltar suavemente.
- requestAnimationFrame agrupa as atualizações a no máximo uma por quadro, evitando trabalho desnecessário.

### Nível 3 — Avançado

- getBoundingClientRect dá a posição na tela; com clientX/clientY do evento o cálculo continua certo mesmo com a página rolada.
- requestAnimationFrame + cancelAnimationFrame limitam o trabalho a uma leitura e uma escrita por quadro, mesmo com dezenas de pointermove por quadro.
- Duas durações de transition: curta enquanto atrai (segue o mouse) e longa ao soltar (volta macia) — controladas pela classe is-atraindo.
- No Angular, os listeners globais ficam em host (window:pointermove) e são removidos automaticamente quando o componente é destruído.
- GSAP quickTo faz a mesma suavização com uma função reutilizável, sem depender de transition.

### Glossário do código

| Termo | O que faz |
|---|---|
| `pointermove` | Evento disparado quando o ponteiro se move. |
| `pointerType` | Tipo de ponteiro (mouse, touch, pen) — o efeito só roda com mouse. |
| `getBoundingClientRect` | Posição e tamanho do botão na tela. |
| `Math.hypot` | Distância em linha reta entre o mouse e o centro do botão. |
| `requestAnimationFrame` | Agenda a atualização para o próximo quadro de desenho. |
| `is-atraindo` | Classe que deixa a transition rápida enquanto o botão segue o mouse. |

## Parâmetros

| Controle | Tipo | Padrão | Faixa / opções |
|---|---|---|---|
| força | range | 0.4 | 0.1–1 (passo 0.05) |
| raio de alcance | range | 80px | 20–200px (passo 10) |
| tempo de retorno | range | 500ms | 100–1200ms (passo 50) |

## Outra forma de fazer

GSAP: gsap.quickTo(botao, "x", { duration: 0.4 }) cria uma função que segue o ponteiro com suavização — usado na demo do Interface Lab.

## Compatibilidade

Pointer Events e requestAnimationFrame funcionam em todos os navegadores atuais.

## Responsividade

Só reage a mouse (pointerType "mouse"). Em toque o botão funciona normalmente, sem o efeito.

## Acessibilidade

O efeito é decorativo: o botão continua sendo um <button> comum, com foco visível pelo teclado. Com prefers-reduced-motion o movimento é desativado.

## Performance

Uma leitura de getBoundingClientRect e uma escrita de transform por quadro, só enquanto o ponteiro se move.

## Limitações

- Força muito alta faz o botão "fugir" do clique.
- Em páginas com rolagem, o cálculo usa a posição na tela, então continua correto ao rolar.

## Referências

- [MDN — Pointer events](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events)
- [MDN — requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame)
- [MDN — transform](https://developer.mozilla.org/en-US/docs/Web/CSS/transform)
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
<title>Botão magnético · Kalixto Creative Lab</title>
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

.magnetico {
  padding: 18px 34px;
  border: 0;
  border-radius: 999px;
  background: linear-gradient(135deg, #d4119f, #7c3aed);
  color: #fff;
  font: 600 1rem system-ui, sans-serif;
  cursor: pointer;
  /* volta ao lugar com suavidade */
  transition: transform 500ms cubic-bezier(0.22, 1, 0.36, 1);
}

/* enquanto está sendo atraído, segue o ponteiro mais rápido */
.magnetico.is-atraindo { transition-duration: 120ms; }

.magnetico:focus-visible { outline: 2px solid #22e3ff; outline-offset: 4px; }
</style>
</head>
<body>
<button class="magnetico" type="button">Aproxime o mouse</button>
<script>
const botao = document.querySelector('.magnetico');
const FORCA = 0.4;      // fração da distância que o botão anda
const ALCANCE = 80;   // px além da borda do botão
const reduzir = window.matchMedia('(prefers-reduced-motion: reduce)');
let quadro = 0;

function soltar() {
  botao.style.transform = '';
  botao.classList.remove('is-atraindo');
}

window.addEventListener('pointermove', (e) => {
  if (reduzir.matches || e.pointerType !== 'mouse') return;
  cancelAnimationFrame(quadro);
  quadro = requestAnimationFrame(() => {
    const r = botao.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    const limite = ALCANCE + Math.max(r.width, r.height) / 2;

    if (Math.hypot(dx, dy) < limite) {
      botao.classList.add('is-atraindo');
      botao.style.transform = `translate(${dx * FORCA}px, ${dy * FORCA}px)`;
    } else {
      soltar();
    }
  });
});

document.documentElement.addEventListener('pointerleave', soltar);
</script>
</body>
</html>
```

## Versão Angular (valores padrão)

Também em `src/app/efeitos-angular/magnetic-button/` (compilada e testada com o app).

`magnetic-button.ts`

```ts
import { Component, ElementRef, signal, viewChild } from '@angular/core';

@Component({
  selector: 'app-magnetic-button',
  templateUrl: './magnetic-button.html',
  styleUrl: './magnetic-button.css',
  host: {
    '(window:pointermove)': 'mover($event)',
    '(document:pointerout)': 'sairDaJanela($event)',
  },
})
export class MagneticButton {
  private readonly forca = 0.4;    // fração da distância que o botão anda
  private readonly alcance = 80;   // px além da borda do botão
  private readonly reduzir = window.matchMedia('(prefers-reduced-motion: reduce)');
  private readonly botao = viewChild.required<ElementRef<HTMLButtonElement>>('botao');
  private quadro = 0;

  protected readonly atraindo = signal(false);
  protected readonly deslocamento = signal('');

  protected mover(e: PointerEvent): void {
    if (this.reduzir.matches || e.pointerType !== 'mouse') return;
    cancelAnimationFrame(this.quadro);
    this.quadro = requestAnimationFrame(() => {
      const r = this.botao().nativeElement.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const limite = this.alcance + Math.max(r.width, r.height) / 2;

      if (Math.hypot(dx, dy) < limite) {
        this.atraindo.set(true);
        this.deslocamento.set(`translate(${dx * this.forca}px, ${dy * this.forca}px)`);
      } else {
        this.soltar();
      }
    });
  }

  /** O ponteiro saiu da janela (relatedTarget nulo): o botão volta ao lugar. */
  protected sairDaJanela(e: PointerEvent): void {
    if (!e.relatedTarget) this.soltar();
  }

  private soltar(): void {
    this.atraindo.set(false);
    this.deslocamento.set('');
  }
}
```

`magnetic-button.html`

```html
<button
  #botao
  class="magnetico"
  type="button"
  [class.is-atraindo]="atraindo()"
  [style.transform]="deslocamento()"
>
  Aproxime o mouse
</button>
```

`magnetic-button.css`

```css
:host {
  display: grid;
  place-items: center;
  gap: 24px;
}

.magnetico {
  padding: 18px 34px;
  border: 0;
  border-radius: 999px;
  background: linear-gradient(135deg, #d4119f, #7c3aed);
  color: #fff;
  font: 600 1rem system-ui, sans-serif;
  cursor: pointer;
  /* volta ao lugar com suavidade */
  transition: transform 500ms cubic-bezier(0.22, 1, 0.36, 1);
}

/* enquanto está sendo atraído, segue o ponteiro mais rápido */
.magnetico.is-atraindo { transition-duration: 120ms; }

.magnetico:focus-visible { outline: 2px solid #22e3ff; outline-offset: 4px; }
```
