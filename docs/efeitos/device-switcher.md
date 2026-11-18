# Troca de dispositivo (computador, tablet, celular) (`device-switcher`)

> Gerado a partir de `src/app/core/efeitos/kits/device-switcher.kit.ts`. Não edite à mão: rode `npm run docs:efeitos`.

Um controle segmentado com indicador deslizante troca a moldura da prévia entre computador, tablet e celular; a moldura se transforma suavemente e o conteúdo se reorganiza.

| Campo | Valor |
|---|---|
| Nome técnico | Device Preview Switcher |
| Categoria | 01 · Microinterações e UI › Controles segmentados |
| Nível | Intermediário |
| Tecnologias | HTML, CSS, JavaScript |
| Dependências | nenhuma |
| Interação | Clique, Teclado |
| Status | validado em 2026-11-17 |
| Tags | responsivo, device, dispositivo, segmented control, controle segmentado, indicador deslizante, container queries, referência em vídeo |

## Objetivo visual

Provar que um site é responsivo, de forma visual e interativa — o cliente "vê" o celular sem precisar abrir no celular.

## Aplicações

- Apresentação de site para cliente
- Portfólio e estudos de caso
- Ferramentas de prévia e editores

## Como funciona

### Nível 1 — Iniciante

- Três botões em cima: Computador, Tablet e Celular. Uma "pílula" desliza para baixo do botão escolhido.
- A moldura da prévia muda de formato, como se o site trocasse de aparelho.
- Dentro dela, os cartões mudam de três colunas para duas (tablet) e uma (celular), igual a um site de verdade.

### Nível 2 — Intermediário

- Cada opção do controle é um botão com aria-pressed. Ao clicar, o JS mede a posição e a largura do botão e move o indicador para lá (translate + width com transição).
- A moldura recebe as medidas do dispositivo em variáveis (--largura, --proporcao, --raio) e as transições fazem ela "virar" outro aparelho.
- O conteúdo dentro da moldura usa container queries (@container): quando a moldura fica estreita, a grade passa de 3 para 2 colunas (tablet) e 1 (celular) — é o mesmo site se adaptando, não uma imagem trocada.

### Nível 3 — Avançado

- offsetLeft/offsetWidth do botão dão a posição exata do indicador, mesmo com rótulos de tamanhos diferentes.
- container-type: inline-size na moldura + @container (max-width) faz o conteúdo responder à moldura, não à janela — é o que permite simular o celular dentro do computador.
- Unidade cqi (1% da largura do contêiner) no título faz a fonte encolher junto com a moldura.
- No Angular, o dispositivo atual é um signal; a moldura recebe as três medidas com [style.--largura] etc.

### Glossário do código

| Termo | O que faz |
|---|---|
| `container-type: inline-size` | A moldura vira um contêiner que o conteúdo consegue "medir". |
| `@container` | Regra que muda o layout conforme a largura da moldura. |
| `offsetLeft` | Posição do botão, usada para mover o indicador. |
| `aria-pressed` | Marca qual dispositivo está selecionado. |

## Parâmetros

| Controle | Tipo | Padrão | Faixa / opções |
|---|---|---|---|
| duração da troca | range | 600ms | 300–1200ms (passo 50) |
| curva (easing) | seleção | cubic-bezier(0.22, 1, 0.36, 1) | suave (expo out), elástico (back out), ease, ease-in-out, linear |
| estilo do indicador | seleção | pilula | pílula, sublinhado |

## Outra forma de fazer

Para mostrar o site real, coloque um <iframe> dentro da moldura; com View Transitions, a troca de layout do conteúdo também ganha animação automática.

## Compatibilidade

Container queries e aspect-ratio animado: Chrome/Edge 105+, Firefox 110+, Safari 16+.

## Responsividade

A própria moldura é relativa ao palco; no celular a prévia de "computador" ocupa a largura toda.

## Acessibilidade

Os botões são um grupo (role="group") com aria-pressed e funcionam no teclado. Com prefers-reduced-motion a troca é instantânea.

## Performance

Transicionar width e aspect-ratio refaz o layout da moldura (só ela). Para dezenas de molduras, prefira scale.

## Limitações

- aspect-ratio animado interpola entre proporções; em navegadores antigos a troca acontece sem transição.

## Referências

- [MDN — CSS container queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries)
- [MDN — aria-pressed](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-pressed)
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
<title>Troca de dispositivo (computador, tablet, celular) · Kalixto Creative Lab</title>
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

/* Controle segmentado com indicador que desliza */
.segmentos {
  position: relative;
  display: inline-flex;
  padding: 4px;
  border: 1px solid rgb(255 255 255 / 0.12);
  border-radius: 999px;
  background: #15110d;
}
.indicador {
  position: absolute;
  width: var(--w, 0px);
  translate: var(--x, 0px) 0;
  transition: translate 600ms cubic-bezier(0.22, 1, 0.36, 1), width 600ms cubic-bezier(0.22, 1, 0.36, 1);
}
.indicador { inset: 4px auto 4px 0; border-radius: 999px; background: #ff6a1a; }
.opcao[aria-pressed='true'] { color: #160b05; }
.opcao {
  position: relative;
  padding: 8px 16px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: #c9c3ea;
  font: 600 13px system-ui, sans-serif;
  cursor: pointer;
  transition: color 300ms ease;
}
.opcao:focus-visible { outline: 2px solid #22e3ff; outline-offset: 2px; }

/* A moldura vira outro aparelho trocando três medidas */
.area-previa { display: grid; place-items: center; width: min(100%, 620px); height: 420px; }
.moldura {
  --largura: 100%;
  --proporcao: 16 / 10;
  --raio: 12px;
  width: var(--largura);
  max-height: 100%;
  aspect-ratio: var(--proporcao);
  padding: 8px;
  border: 2px solid #3a3456;
  border-radius: var(--raio);
  background: #0f0c18;
  container-type: inline-size; /* o conteúdo reage à largura da moldura */
  transition: width 600ms cubic-bezier(0.22, 1, 0.36, 1), aspect-ratio 600ms cubic-bezier(0.22, 1, 0.36, 1), border-radius 600ms cubic-bezier(0.22, 1, 0.36, 1);
}
.site-falso {
  display: grid;
  align-content: start;
  gap: 10px;
  height: 100%;
  padding: 12px;
  border-radius: calc(var(--raio) - 6px);
  background: linear-gradient(180deg, #2a1d14, #120d0a);
  overflow: hidden;
}
.site-falso header { display: flex; justify-content: space-between; }
.logo { width: 40px; height: 10px; border-radius: 4px; background: #ff6a1a; }
.menu { width: 60px; height: 10px; border-radius: 4px; background: rgb(255 255 255 / 0.2); }
.site-falso h2 { margin: 8px 0; font: 400 clamp(1rem, 7cqi, 2.4rem) / 1 Georgia, serif; color: #f6e9dc; }
.cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.cards span { aspect-ratio: 4 / 3; border-radius: 8px; background: linear-gradient(135deg, #ff6a1a, #6b2a0c); }
/* moldura média (tablet): duas colunas; estreita (celular): uma */
@container (max-width: 420px) {
  .cards { grid-template-columns: repeat(2, 1fr); }
}
@container (max-width: 220px) {
  .cards { grid-template-columns: 1fr; }
}

@media (prefers-reduced-motion: reduce) {
  .indicador, .moldura, .opcao { transition: none; }
}
</style>
</head>
<body>
<div class="segmentos" role="group" aria-label="Ver em">
  <span class="indicador" aria-hidden="true"></span>
  <button class="opcao" type="button" aria-pressed="true" data-largura="100%" data-proporcao="16 / 10" data-raio="12px">Computador</button>
  <button class="opcao" type="button" aria-pressed="false" data-largura="48%" data-proporcao="3 / 4" data-raio="22px">Tablet</button>
  <button class="opcao" type="button" aria-pressed="false" data-largura="30%" data-proporcao="9 / 19" data-raio="30px">Celular</button>
</div>
<section class="area-previa">
  <div class="moldura">
    <div class="site-falso">
      <header><span class="logo"></span><span class="menu"></span></header>
      <h2>Lumen Residencial</h2>
      <div class="cards"><span></span><span></span><span></span></div>
    </div>
  </div>
</section>
<script>
const grupo = document.querySelector('.segmentos');
const indicador = grupo.querySelector('.indicador');
const opcoes = [...grupo.querySelectorAll('.opcao')];
const moldura = document.querySelector('.moldura');

// leva o indicador para baixo do botão escolhido
function moverIndicador(botao) {
  indicador.style.setProperty('--x', botao.offsetLeft + 'px');
  indicador.style.setProperty('--w', botao.offsetWidth + 'px');
}

function escolher(botao) {
  opcoes.forEach((o) => o.setAttribute('aria-pressed', String(o === botao)));
  moverIndicador(botao);
  moldura.style.setProperty('--largura', botao.dataset.largura);
  moldura.style.setProperty('--proporcao', botao.dataset.proporcao);
  moldura.style.setProperty('--raio', botao.dataset.raio);
}

opcoes.forEach((o) => o.addEventListener('click', () => escolher(o)));
moverIndicador(opcoes[0]);
</script>
</body>
</html>
```

## Versão Angular (valores padrão)

Também em `src/app/efeitos-angular/device-switcher/` (compilada e testada com o app).

`device-switcher.ts`

```ts
import { Component, ElementRef, afterNextRender, signal, viewChildren } from '@angular/core';

interface Dispositivo {
  id: string;
  rotulo: string;
  largura: string;
  proporcao: string;
  raio: string;
}

@Component({
  selector: 'app-device-switcher',
  templateUrl: './device-switcher.html',
  styleUrl: './device-switcher.css',
})
export class DeviceSwitcher {
  protected readonly dispositivos: Dispositivo[] = [
    {
      id: 'computador',
      rotulo: 'Computador',
      largura: '100%',
      proporcao: '16 / 10',
      raio: '12px'
    },
    {
      id: 'tablet',
      rotulo: 'Tablet',
      largura: '48%',
      proporcao: '3 / 4',
      raio: '22px'
    },
    {
      id: 'celular',
      rotulo: 'Celular',
      largura: '30%',
      proporcao: '9 / 19',
      raio: '30px'
    }
  ];
  private readonly botoes = viewChildren<ElementRef<HTMLButtonElement>>('opcao');

  protected readonly atual = signal(this.dispositivos[0]);
  protected readonly x = signal('0px');
  protected readonly w = signal('0px');

  constructor() {
    afterNextRender(() => this.medir(0));
  }

  protected escolher(i: number): void {
    this.atual.set(this.dispositivos[i]);
    this.medir(i);
  }

  /** Leva o indicador para baixo do botão escolhido. */
  private medir(i: number): void {
    const b = this.botoes()[i]?.nativeElement;
    if (!b) return;
    this.x.set(b.offsetLeft + 'px');
    this.w.set(b.offsetWidth + 'px');
  }
}
```

`device-switcher.html`

```html
<div class="segmentos" role="group" aria-label="Ver em">
  <span class="indicador" aria-hidden="true" [style.--x]="x()" [style.--w]="w()"></span>
  @for (d of dispositivos; track d.id; let i = $index) {
    <button #opcao class="opcao" type="button" [attr.aria-pressed]="atual().id === d.id" (click)="escolher(i)">
      {{ d.rotulo }}
    </button>
  }
</div>
<section class="area-previa">
  <div class="moldura" [style.--largura]="atual().largura" [style.--proporcao]="atual().proporcao" [style.--raio]="atual().raio">
    <div class="site-falso">
      <header><span class="logo"></span><span class="menu"></span></header>
      <h2>Lumen Residencial</h2>
      <div class="cards"><span></span><span></span><span></span></div>
    </div>
  </div>
</section>
```

`device-switcher.css`

```css
:host {
  display: grid;
  place-items: center;
  gap: 24px;
}

/* Controle segmentado com indicador que desliza */
.segmentos {
  position: relative;
  display: inline-flex;
  padding: 4px;
  border: 1px solid rgb(255 255 255 / 0.12);
  border-radius: 999px;
  background: #15110d;
}
.indicador {
  position: absolute;
  width: var(--w, 0px);
  translate: var(--x, 0px) 0;
  transition: translate 600ms cubic-bezier(0.22, 1, 0.36, 1), width 600ms cubic-bezier(0.22, 1, 0.36, 1);
}
.indicador { inset: 4px auto 4px 0; border-radius: 999px; background: #ff6a1a; }
.opcao[aria-pressed='true'] { color: #160b05; }
.opcao {
  position: relative;
  padding: 8px 16px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: #c9c3ea;
  font: 600 13px system-ui, sans-serif;
  cursor: pointer;
  transition: color 300ms ease;
}
.opcao:focus-visible { outline: 2px solid #22e3ff; outline-offset: 2px; }

/* A moldura vira outro aparelho trocando três medidas */
.area-previa { display: grid; place-items: center; width: min(100%, 620px); height: 420px; }
.moldura {
  --largura: 100%;
  --proporcao: 16 / 10;
  --raio: 12px;
  width: var(--largura);
  max-height: 100%;
  aspect-ratio: var(--proporcao);
  padding: 8px;
  border: 2px solid #3a3456;
  border-radius: var(--raio);
  background: #0f0c18;
  container-type: inline-size; /* o conteúdo reage à largura da moldura */
  transition: width 600ms cubic-bezier(0.22, 1, 0.36, 1), aspect-ratio 600ms cubic-bezier(0.22, 1, 0.36, 1), border-radius 600ms cubic-bezier(0.22, 1, 0.36, 1);
}
.site-falso {
  display: grid;
  align-content: start;
  gap: 10px;
  height: 100%;
  padding: 12px;
  border-radius: calc(var(--raio) - 6px);
  background: linear-gradient(180deg, #2a1d14, #120d0a);
  overflow: hidden;
}
.site-falso header { display: flex; justify-content: space-between; }
.logo { width: 40px; height: 10px; border-radius: 4px; background: #ff6a1a; }
.menu { width: 60px; height: 10px; border-radius: 4px; background: rgb(255 255 255 / 0.2); }
.site-falso h2 { margin: 8px 0; font: 400 clamp(1rem, 7cqi, 2.4rem) / 1 Georgia, serif; color: #f6e9dc; }
.cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.cards span { aspect-ratio: 4 / 3; border-radius: 8px; background: linear-gradient(135deg, #ff6a1a, #6b2a0c); }
/* moldura média (tablet): duas colunas; estreita (celular): uma */
@container (max-width: 420px) {
  .cards { grid-template-columns: repeat(2, 1fr); }
}
@container (max-width: 220px) {
  .cards { grid-template-columns: 1fr; }
}

@media (prefers-reduced-motion: reduce) {
  .indicador, .moldura, .opcao { transition: none; }
}
```
