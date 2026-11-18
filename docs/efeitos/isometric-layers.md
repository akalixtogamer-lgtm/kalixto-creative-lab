# Interface isométrica em camadas (`isometric-layers`)

> Gerado a partir de `src/app/core/efeitos/kits/isometric-layers.kit.ts`. Não edite à mão: rode `npm run docs:efeitos`.

Telas em traço fino, empilhadas numa vista isométrica, que se separam no espaço ao passar o mouse ou clicar — a "vista explodida" de um produto digital.

| Campo | Valor |
|---|---|
| Nome técnico | Isometric Exploded Layers (CSS 3D) |
| Categoria | 08 · Luz, sombra e profundidade › Camadas 3D e vistas explodidas |
| Nível | Intermediário |
| Tecnologias | HTML, CSS, JavaScript |
| Dependências | nenhuma |
| Interação | Hover, Clique, Teclado |
| Status | validado em 2026-11-17 |
| Tags | isométrico, isometric, exploded view, vista explodida, wireframe, camadas, preserve-3d, referência em vídeo |

## Objetivo visual

Explicar que um produto é feito de partes (dados, design, protótipo, deploy) mostrando as camadas se afastando.

## Aplicações

- Seções "como funciona"
- Apresentar uma arquitetura ou fluxo
- Heros de produtos SaaS

## Como funciona

### Nível 1 — Iniciante

- Quatro "telas" desenhadas só com linhas ficam empilhadas, como folhas de papel.
- A pilha é girada e deitada para parecer vista de cima, na diagonal (isso se chama vista isométrica).
- Ao passar o mouse ou clicar no botão, as telas se afastam umas das outras para cima.

### Nível 2 — Intermediário

- A .pilha recebe rotateX + rotateZ(-45deg): é isso que cria a vista isométrica (o "chão" visto de cima, na diagonal).
- transform-style: preserve-3d faz as camadas filhas viverem no mesmo espaço 3D da pilha, em vez de serem achatadas.
- Cada camada tem a posição --n. Fechada, todas ficam em translateZ(0); aberta, cada uma sobe n × separação pixels — e a transição faz o movimento.
- O "traço fino" é só border + gradientes lineares de 1px desenhando as linhas da tela, sem nenhuma imagem.

### Nível 3 — Avançado

- rotateX seguido de rotateZ(-45deg): a ordem importa — primeiro deita o plano, depois gira sobre o próprio eixo.
- Sem perspective o resultado é uma projeção ortográfica, que é exatamente o que define a isometria (linhas paralelas continuam paralelas).
- Escalonar a transição com transition-delay: calc(var(--n) * 60ms) dá um efeito de "desmontar em sequência".
- Com ScrollTrigger e scrub, a separação pode acompanhar a rolagem, como nos sites de produto que explicam a arquitetura.

### Glossário do código

| Termo | O que faz |
|---|---|
| `rotateZ(-45deg)` | Gira o plano deitado em 45°, formando a vista isométrica. |
| `preserve-3d` | Mantém as camadas no mesmo espaço 3D da pilha. |
| `translateZ(calc(var(--n) *` | Afasta cada camada de acordo com a posição dela na pilha. |
| `aria-pressed` | Diz ao leitor de tela se a pilha está aberta. |

## Parâmetros

| Controle | Tipo | Padrão | Faixa / opções |
|---|---|---|---|
| separação das camadas | range | 60px | 20–120px (passo 5) |
| inclinação (rotateX) | range | 55deg | 40–70deg (passo 1) |
| cor do traço | seleção | #f4f2ff | Branco, Vermelho, Ciano, Lima |

## Outra forma de fazer

Em SVG, desenhando as telas já em perspectiva isométrica e animando o translate de cada grupo com GSAP; ou em Three.js com planos e EdgesGeometry.

## Compatibilidade

Transformações 3D e preserve-3d: todos os navegadores atuais.

## Responsividade

O tamanho da pilha usa min() com a largura da tela; a separação máxima cabe na altura do palco do celular.

## Acessibilidade

O botão "Separar camadas" funciona no teclado e informa o estado com aria-pressed. A pilha tem role="img" e um aria-label que descreve as camadas.

## Performance

Só transform é animado (composição na GPU). Quatro camadas leves; dá para usar dezenas sem custo perceptível.

## Limitações

- Textos dentro das camadas ficam inclinados (é a estética do efeito), por isso não use texto longo ou essencial dentro delas.
- overflow: hidden num ancestral achata o 3D: mantenha o palco sem overflow ou com espaço sobrando.

## Referências

- [MDN — transform](https://developer.mozilla.org/en-US/docs/Web/CSS/transform)
- [MDN — perspective](https://developer.mozilla.org/en-US/docs/Web/CSS/perspective)
- [MDN — transition](https://developer.mozilla.org/en-US/docs/Web/CSS/transition)

## Código (valores padrão)

Arquivo único, igual ao baixado pelo botão “Baixar” na página do efeito:

```html
<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data:; font-src data:">
<title>Interface isométrica em camadas · Kalixto Creative Lab</title>
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

/* Vista isométrica: deita o plano e gira 45° */
.pilha {
  position: relative;
  width: min(62vw, 260px);
  aspect-ratio: 4 / 3;
  margin-block: 170px 30px;
  transform: rotateX(55deg) rotateZ(-45deg);
  transform-style: preserve-3d;
}

/* Cada camada é uma "tela" desenhada só com traço */
.camada {
  position: absolute;
  inset: 0;
  border: 1.5px solid #f4f2ff;
  border-radius: 14px;
  background:
    linear-gradient(#f4f2ff, #f4f2ff) 14px 34px / 45% 1px no-repeat,
    linear-gradient(#f4f2ff, #f4f2ff) 14px 48px / 30% 1px no-repeat,
    linear-gradient(#f4f2ff, #f4f2ff) 0 22px / 100% 1px no-repeat,
    rgb(11 10 20 / 0.82);
  transform: translateZ(0);
  transition: transform 700ms cubic-bezier(0.22, 1, 0.36, 1);
}
.camada span {
  position: absolute;
  right: 12px;
  bottom: 10px;
  color: #f4f2ff;
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.8;
}

/* Aberta (hover ou botão): cada camada sobe n × separação */
.pilha:hover .camada,
.pilha.is-aberta .camada {
  transform: translateZ(calc(var(--n) * 60px));
}

.separar {
  padding: 10px 20px;
  border: 1px solid #3a3456;
  border-radius: 999px;
  background: transparent;
  color: #f4f2ff;
  font: inherit;
  cursor: pointer;
}
.separar:focus-visible { outline: 2px solid #22e3ff; outline-offset: 3px; }

@media (prefers-reduced-motion: reduce) {
  .camada { transition: none; }
}
</style>
</head>
<body>
<div class="pilha" role="img" aria-label="Pilha de camadas: Banco de dados, Design system, Protótipo, Deploy">
  <div class="camada" style="--n: 0"><span>Banco de dados</span></div>
  <div class="camada" style="--n: 1"><span>Design system</span></div>
  <div class="camada" style="--n: 2"><span>Protótipo</span></div>
  <div class="camada" style="--n: 3"><span>Deploy</span></div>
</div>
<button class="separar" type="button" aria-pressed="false">Separar camadas</button>
<script>
const pilha = document.querySelector('.pilha');
const botao = document.querySelector('.separar');

// alternativa ao hover (teclado e toque): abre e fecha a pilha
botao.addEventListener('click', () => {
  const aberta = pilha.classList.toggle('is-aberta');
  botao.setAttribute('aria-pressed', String(aberta));
  botao.textContent = aberta ? 'Juntar camadas' : 'Separar camadas';
});
</script>
</body>
</html>
```

## Versão Angular (valores padrão)

Também em `src/app/efeitos-angular/isometric-layers/` (compilada e testada com o app).

`isometric-layers.ts`

```ts
import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-isometric-layers',
  templateUrl: './isometric-layers.html',
  styleUrl: './isometric-layers.css',
})
export class IsometricLayers {
  protected readonly camadas = ['Banco de dados', 'Design system', 'Protótipo', 'Deploy'];
  protected readonly descricao = 'Pilha de camadas: ' + this.camadas.join(', ');
  protected readonly aberta = signal(false);
}
```

`isometric-layers.html`

```html
<div class="pilha" role="img" [attr.aria-label]="descricao" [class.is-aberta]="aberta()">
  @for (nome of camadas; track nome; let n = $index) {
    <div class="camada" [style.--n]="n"><span>{{ nome }}</span></div>
  }
</div>
<button class="separar" type="button" [attr.aria-pressed]="aberta()" (click)="aberta.set(!aberta())">
  {{ aberta() ? 'Juntar camadas' : 'Separar camadas' }}
</button>
```

`isometric-layers.css`

```css
:host {
  display: grid;
  place-items: center;
  gap: 24px;
}

/* Vista isométrica: deita o plano e gira 45° */
.pilha {
  position: relative;
  width: min(62vw, 260px);
  aspect-ratio: 4 / 3;
  margin-block: 170px 30px;
  transform: rotateX(55deg) rotateZ(-45deg);
  transform-style: preserve-3d;
}

/* Cada camada é uma "tela" desenhada só com traço */
.camada {
  position: absolute;
  inset: 0;
  border: 1.5px solid #f4f2ff;
  border-radius: 14px;
  background:
    linear-gradient(#f4f2ff, #f4f2ff) 14px 34px / 45% 1px no-repeat,
    linear-gradient(#f4f2ff, #f4f2ff) 14px 48px / 30% 1px no-repeat,
    linear-gradient(#f4f2ff, #f4f2ff) 0 22px / 100% 1px no-repeat,
    rgb(11 10 20 / 0.82);
  transform: translateZ(0);
  transition: transform 700ms cubic-bezier(0.22, 1, 0.36, 1);
}
.camada span {
  position: absolute;
  right: 12px;
  bottom: 10px;
  color: #f4f2ff;
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.8;
}

/* Aberta (hover ou botão): cada camada sobe n × separação */
.pilha:hover .camada,
.pilha.is-aberta .camada {
  transform: translateZ(calc(var(--n) * 60px));
}

.separar {
  padding: 10px 20px;
  border: 1px solid #3a3456;
  border-radius: 999px;
  background: transparent;
  color: #f4f2ff;
  font: inherit;
  cursor: pointer;
}
.separar:focus-visible { outline: 2px solid #22e3ff; outline-offset: 3px; }

@media (prefers-reduced-motion: reduce) {
  .camada { transition: none; }
}
```
