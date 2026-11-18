# Cortina que se abre (`curtain-reveal`)

> Gerado a partir de `src/app/core/efeitos/kits/curtain-reveal.kit.ts`. Não edite à mão: rode `npm run docs:efeitos`.

Duas metades de cortina de tecido, com dobras e sombra, se recolhem para os lados (ou sobem) e revelam o conteúdo — como a abertura de um palco.

| Campo | Valor |
|---|---|
| Nome técnico | Fabric Curtain Reveal |
| Categoria | 02 · Entradas, saídas e transições › Revelação de página |
| Nível | Intermediário |
| Tecnologias | HTML, CSS, JavaScript |
| Dependências | nenhuma |
| Interação | Clique, Teclado, Automático |
| Status | validado em 2026-11-17 |
| Tags | cortina, curtain, palco, reveal, tecido, scaleX, transform-origin, referência em vídeo |

## Objetivo visual

Fazer da entrada da página um "momento de estreia", com cara de teatro, museu ou campanha artística.

## Aplicações

- Abertura de portfólio e campanha
- Lançamentos e eventos
- Revelar um produto ou resultado

## Como funciona

### Nível 1 — Iniciante

- Há duas metades de cortina na frente do conteúdo, como num teatro.
- Ao abrir, cada metade se encolhe para o seu lado (ou sobe), e o pano fica todo franzido na beirada.
- O botão fecha e abre a cortina de novo.

### Nível 2 — Intermediário

- Cada metade é um painel que ocupa metade do palco. O "tecido" é um repeating-linear-gradient horizontal alternando faixas claras e escuras: são as dobras.
- Para abrir, o painel não desliza: ele encolhe na largura (scaleX) a partir da borda de fora (transform-origin). As dobras se apertam, como pano sendo recolhido.
- Um gradiente por cima escurece a borda de dentro e o pé da cortina, dando volume.
- A cortina abre sozinha ao carregar e o botão abre e fecha de novo; o conteúdo atrás é HTML normal.

### Nível 3 — Avançado

- scaleX com transform-origin na borda externa é o truque: o painel "recolhe" para a borda em vez de sair da tela, e as faixas do gradiente se comprimem como dobras.
- Dois requestAnimationFrame seguidos garantem que o navegador desenhe o estado fechado antes de aplicar a classe aberta — senão a transição não acontece.
- box-shadow inset na borda de dentro dá a sombra do volume do pano sem imagem.
- No Angular, afterNextRender + requestAnimationFrame cumprem o mesmo papel do duplo quadro.

### Glossário do código

| Termo | O que faz |
|---|---|
| `repeating-linear-gradient` | Faixas repetidas claras e escuras: as dobras do tecido. |
| `transform-origin` | A metade encolhe a partir da borda de fora. |
| `scaleX(0.08)` | Cortina recolhida: quase sem largura. |
| `aria-pressed` | Informa se a cortina está fechada. |

## Parâmetros

| Controle | Tipo | Padrão | Faixa / opções |
|---|---|---|---|
| tempo para abrir | range | 1400ms | 600–2500ms (passo 100) |
| como abre | seleção | lados | para os lados, para cima |
| cor do tecido | seleção | #7a1030 | Vinho, Cinza linho, Azul-noite |

## Outra forma de fazer

Com WebGL, um plano subdividido com ondas no vertex shader dá o balanço do tecido; em vídeo, um loop de cortina com fundo transparente (WebM com alfa).

## Compatibilidade

Transformações e gradientes repetidos: todos os navegadores atuais.

## Responsividade

Painéis em %, então a cortina cobre qualquer proporção de palco.

## Acessibilidade

O conteúdo atrás existe no HTML desde o início (a cortina é aria-hidden). O botão informa o estado com aria-pressed. Com prefers-reduced-motion a cortina já começa aberta, sem animação.

## Performance

Só transform anima; os gradientes são desenhados uma vez.

## Limitações

- scaleX achata as dobras em vez de enrugá-las de verdade; para pano realista, use vídeo ou WebGL.

## Referências

- [MDN — repeating-linear-gradient()](https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/repeating-linear-gradient)
- [MDN — transform-origin](https://developer.mozilla.org/en-US/docs/Web/CSS/transform-origin)
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
<title>Cortina que se abre · Kalixto Creative Lab</title>
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

.palco-cortina {
  position: relative;
  width: min(100%, 680px);
  aspect-ratio: 16 / 10;
  border-radius: 20px;
  overflow: hidden;
}
.cena-atras {
  display: grid;
  place-items: center;
  height: 100%;
  padding: 24px;
  text-align: center;
  background:
    radial-gradient(circle at 75% 25%, #fff 0 6%, transparent 7%),
    radial-gradient(ellipse at 30% 80%, rgb(255 255 255 / 0.9) 0 12%, transparent 13%),
    linear-gradient(180deg, #1f6fff, #6aa8ff);
}
.cena-atras h1 { margin: 0; font: 400 clamp(1.8rem, 7vw, 3.4rem) / 1.05 Georgia, serif; }

/* O tecido: dobras com faixas claras e escuras + sombra para dar volume */
.cortina {
  position: absolute;
  top: 0;
  width: 50%;
  height: 100%;
  background:
    linear-gradient(180deg, transparent 70%, rgb(0 0 0 / 0.35)),
    repeating-linear-gradient(90deg, rgb(0 0 0 / 0.28) 0 6px, rgb(255 255 255 / 0.1) 14px, rgb(0 0 0 / 0.28) 26px),
    #7a1030;
  transition: transform 1400ms cubic-bezier(0.65, 0, 0.35, 1);
}
.cortina.esq { left: 0; box-shadow: inset -18px 0 30px rgb(0 0 0 / 0.45); }
.cortina.dir { right: 0; box-shadow: inset 18px 0 30px rgb(0 0 0 / 0.45); }

/* Abertura */
.cortina.esq { transform-origin: left center; }
.cortina.dir { transform-origin: right center; }
.palco-cortina.is-aberta .cortina { transform: scaleX(0.08); }

.abrir {
  padding: 10px 20px;
  border: 1px solid #3a3456;
  border-radius: 999px;
  background: transparent;
  color: #f4f2ff;
  font: inherit;
  cursor: pointer;
}
.abrir:focus-visible { outline: 2px solid #22e3ff; outline-offset: 3px; }

@media (prefers-reduced-motion: reduce) {
  .cortina { transition: none; }
}
</style>
</head>
<body>
<section class="palco-cortina">
  <div class="cena-atras">
    <h1>A estreia começa agora</h1>
  </div>
  <div class="cortina esq" aria-hidden="true"></div>
  <div class="cortina dir" aria-hidden="true"></div>
</section>
<button class="abrir" type="button" aria-pressed="false">Fechar cortina</button>
<script>
const palco = document.querySelector('.palco-cortina');
const botao = document.querySelector('.abrir');

function definir(aberta) {
  palco.classList.toggle('is-aberta', aberta);
  botao.setAttribute('aria-pressed', String(!aberta));
  botao.textContent = aberta ? 'Fechar cortina' : 'Abrir cortina';
}

// abre sozinha logo depois de carregar (dois quadros: o navegador desenha fechada primeiro)
requestAnimationFrame(() => requestAnimationFrame(() => definir(true)));
botao.addEventListener('click', () => definir(!palco.classList.contains('is-aberta')));
</script>
</body>
</html>
```

## Versão Angular (valores padrão)

Também em `src/app/efeitos-angular/curtain-reveal/` (compilada e testada com o app).

`curtain-reveal.ts`

```ts
import { Component, afterNextRender, signal } from '@angular/core';

@Component({
  selector: 'app-curtain-reveal',
  templateUrl: './curtain-reveal.html',
  styleUrl: './curtain-reveal.css',
})
export class CurtainReveal {
  protected readonly aberta = signal(false);

  constructor() {
    // abre logo depois do primeiro desenho (fechada → aberta, com transição)
    afterNextRender(() => requestAnimationFrame(() => this.aberta.set(true)));
  }
}
```

`curtain-reveal.html`

```html
<section class="palco-cortina" [class.is-aberta]="aberta()">
  <div class="cena-atras">
    <h1>A estreia começa agora</h1>
  </div>
  <div class="cortina esq" aria-hidden="true"></div>
  <div class="cortina dir" aria-hidden="true"></div>
</section>
<button class="abrir" type="button" [attr.aria-pressed]="!aberta()" (click)="aberta.set(!aberta())">
  {{ aberta() ? 'Fechar cortina' : 'Abrir cortina' }}
</button>
```

`curtain-reveal.css`

```css
:host {
  display: grid;
  place-items: center;
  gap: 24px;
}

.palco-cortina {
  position: relative;
  width: min(100%, 680px);
  aspect-ratio: 16 / 10;
  border-radius: 20px;
  overflow: hidden;
}
.cena-atras {
  display: grid;
  place-items: center;
  height: 100%;
  padding: 24px;
  text-align: center;
  background:
    radial-gradient(circle at 75% 25%, #fff 0 6%, transparent 7%),
    radial-gradient(ellipse at 30% 80%, rgb(255 255 255 / 0.9) 0 12%, transparent 13%),
    linear-gradient(180deg, #1f6fff, #6aa8ff);
}
.cena-atras h1 { margin: 0; font: 400 clamp(1.8rem, 7vw, 3.4rem) / 1.05 Georgia, serif; }

/* O tecido: dobras com faixas claras e escuras + sombra para dar volume */
.cortina {
  position: absolute;
  top: 0;
  width: 50%;
  height: 100%;
  background:
    linear-gradient(180deg, transparent 70%, rgb(0 0 0 / 0.35)),
    repeating-linear-gradient(90deg, rgb(0 0 0 / 0.28) 0 6px, rgb(255 255 255 / 0.1) 14px, rgb(0 0 0 / 0.28) 26px),
    #7a1030;
  transition: transform 1400ms cubic-bezier(0.65, 0, 0.35, 1);
}
.cortina.esq { left: 0; box-shadow: inset -18px 0 30px rgb(0 0 0 / 0.45); }
.cortina.dir { right: 0; box-shadow: inset 18px 0 30px rgb(0 0 0 / 0.45); }

/* Abertura */
.cortina.esq { transform-origin: left center; }
.cortina.dir { transform-origin: right center; }
.palco-cortina.is-aberta .cortina { transform: scaleX(0.08); }

.abrir {
  padding: 10px 20px;
  border: 1px solid #3a3456;
  border-radius: 999px;
  background: transparent;
  color: #f4f2ff;
  font: inherit;
  cursor: pointer;
}
.abrir:focus-visible { outline: 2px solid #22e3ff; outline-offset: 3px; }

@media (prefers-reduced-motion: reduce) {
  .cortina { transition: none; }
}
```
