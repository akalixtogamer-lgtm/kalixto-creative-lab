# Tipografia inflada (`puffy-text`)

> Gerado a partir de `src/app/core/efeitos/kits/puffy-text.kit.ts`. Não edite à mão: rode `npm run docs:efeitos`.

Letras grossas que parecem infladas, com volume feito de sombras empilhadas; cada letra "respira" e estufa quando o mouse passa por cima.

| Campo | Valor |
|---|---|
| Nome técnico | Puffy / Inflated Text (text-shadow em camadas) |
| Categoria | 04 · Tipografia e texto › Volume e tipografia 3D |
| Nível | Iniciante |
| Tecnologias | HTML, CSS, JavaScript |
| Dependências | nenhuma |
| Interação | Hover, Automático |
| Status | validado em 2026-11-17 |
| Tags | puffy, inflado, inflated, 3d text, text-shadow, balão, tipografia 3d, referência em vídeo |

## Objetivo visual

Dar um ar tátil e divertido a títulos de seção, como letras de balão ou de borracha.

## Aplicações

- Títulos de seção ("Trabalhos", "Contato")
- Marcas jovens e de entretenimento
- Posters e capas em HTML

## Como funciona

### Nível 1 — Iniciante

- As letras são grossas e coloridas, com uma "lateral" mais escura embaixo — parecem objetos fofos, como balões.
- Essa lateral é feita de várias sombras, uma embaixo da outra.
- As letras respiram devagar, uma depois da outra, e estufam quando o mouse passa por cima.

### Nível 2 — Intermediário

- O volume é uma pilha de text-shadow: cada sombra desce 1px a mais, numa cor mais escura que a letra. Juntas, parecem a lateral de um objeto.
- Uma última sombra, borrada e transparente, faz a sombra no "chão". -webkit-text-stroke claro desenha o brilho na borda de cima.
- Cada letra é um <span> com a posição --i. A animação "respirar" mexe na propriedade scale com atraso por letra, como uma onda.
- No hover, a letra ganha transform: scale() com uma curva elástica. Como respirar usa scale e o hover usa transform, um não apaga o outro.

### Nível 3 — Avançado

- Gerar as sombras em código (um loop de 1px até o volume) evita escrever dezenas de valores à mão e deixa a profundidade ajustável.
- scale com dois valores (1.04 0.97) achata e alarga ao mesmo tempo: é o "squash and stretch" da animação clássica.
- Propriedades individuais (scale, translate, rotate) se combinam com transform na ordem translate → rotate → scale → transform.
- A cor da lateral é calculada escurecendo a cor principal; em CSS puro, color-mix(in oklab, cor, black 45%) faz o mesmo.

### Glossário do código

| Termo | O que faz |
|---|---|
| `text-shadow` | Sombras do texto; empilhadas, viram o volume da letra. |
| `-webkit-text-stroke` | Contorno das letras — aqui, claro, faz o brilho da borda. |
| `scale: 1.04 0.97` | Achata e alarga a letra: a respiração. |
| `cubic-bezier(0.34, 1.56, 0.64, 1)` | Curva que passa do ponto e volta: o "estufar" elástico. |

## Parâmetros

| Controle | Tipo | Padrão | Faixa / opções |
|---|---|---|---|
| volume (camadas) | range | 7px | 2–12px (passo 1) |
| cor | seleção | #8fd3ff | Azul bebê, Vermelho, Lima, Chiclete |
| estufar no hover | range | 1.18× | 1–1.4× (passo 0.02) |

## Outra forma de fazer

Para volume real com luz e reflexo, use Three.js com TextGeometry (bevel alto) ou um modelo 3D exportado do Spline/Blender.

## Compatibilidade

text-shadow múltiplo, -webkit-text-stroke e a propriedade individual scale: todos os navegadores atuais.

## Responsividade

O tamanho da fonte usa clamp(); a profundidade é em px fixos e continua proporcional nas telas menores.

## Acessibilidade

O título tem aria-label com a palavra inteira e as letras são aria-hidden. A respiração é lenta e de baixa amplitude; com prefers-reduced-motion ela para e o hover não anima.

## Performance

Sombras de texto com muitas camadas custam na pintura. A respiração anima só scale (composição), sem repintar as sombras a cada quadro.

## Limitações

- Sombras empilhadas criam volume para baixo apenas; não há luz que muda com o ângulo.
- Com volume muito alto em fontes finas, as camadas aparecem como "degraus". Use fontes bem pesadas (900).

## Referências

- [MDN — text-shadow](https://developer.mozilla.org/en-US/docs/Web/CSS/text-shadow)
- [MDN — scale (propriedade)](https://developer.mozilla.org/en-US/docs/Web/CSS/scale)
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
<title>Tipografia inflada · Kalixto Creative Lab</title>
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

.inflado {
  margin: 0;
  font: 900 clamp(2.4rem, 11vw, 6rem) / 1 'Arial Black', 'Helvetica Neue', system-ui, sans-serif;
  letter-spacing: 0.02em;
  color: #8fd3ff;
  -webkit-text-stroke: 2px rgb(255 255 255 / 0.35);
}

/* Volume: uma sombra por pixel de profundidade + a sombra no chão */
.letra {
  display: inline-block;
  text-shadow:
    0 1px 0 #4f748c,
    0 2px 0 #4f748c,
    0 3px 0 #4f748c,
    0 4px 0 #4f748c,
    0 5px 0 #4f748c,
    0 6px 0 #4f748c,
    0 7px 0 #4f748c,
    0 13px 18px rgb(0 0 0 / 0.45);
  transition: transform 450ms cubic-bezier(0.34, 1.56, 0.64, 1);
  animation: respirar 3200ms ease-in-out calc(var(--i) * 120ms) infinite;
}
.letra:hover { transform: scale(1.18) translateY(-4%); }

/* respirar mexe em "scale"; o hover mexe em "transform": um não apaga o outro */
@keyframes respirar {
  50% { scale: 1.04 0.97; }
}

@media (prefers-reduced-motion: reduce) {
  .letra { animation: none; transition: none; }
}
</style>
</head>
<body>
<h1 class="inflado" aria-label="TRABALHOS"></h1>
<script>
const titulo = document.querySelector('.inflado');

// uma letra por <span>, com a posição em --i (para a onda da respiração)
titulo.replaceChildren(
  ...[...titulo.getAttribute('aria-label')].map((caractere, i) => {
    const letra = document.createElement('span');
    letra.className = 'letra';
    letra.textContent = caractere;
    letra.setAttribute('aria-hidden', 'true');
    letra.style.setProperty('--i', i);
    return letra;
  }),
);
</script>
</body>
</html>
```

## Versão Angular (valores padrão)

Também em `src/app/efeitos-angular/puffy-text/` (compilada e testada com o app).

`puffy-text.ts`

```ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-puffy-text',
  templateUrl: './puffy-text.html',
  styleUrl: './puffy-text.css',
})
export class PuffyText {
  protected readonly palavra = 'TRABALHOS';
  protected readonly letras = [...this.palavra];
}
```

`puffy-text.html`

```html
<h1 class="inflado" [attr.aria-label]="palavra">
  @for (l of letras; track $index) {
    <span class="letra" aria-hidden="true" [style.--i]="$index">{{ l }}</span>
  }
</h1>
```

`puffy-text.css`

```css
:host {
  display: grid;
  place-items: center;
  gap: 24px;
}

.inflado {
  margin: 0;
  font: 900 clamp(2.4rem, 11vw, 6rem) / 1 'Arial Black', 'Helvetica Neue', system-ui, sans-serif;
  letter-spacing: 0.02em;
  color: #8fd3ff;
  -webkit-text-stroke: 2px rgb(255 255 255 / 0.35);
}

/* Volume: uma sombra por pixel de profundidade + a sombra no chão */
.letra {
  display: inline-block;
  text-shadow:
    0 1px 0 #4f748c,
    0 2px 0 #4f748c,
    0 3px 0 #4f748c,
    0 4px 0 #4f748c,
    0 5px 0 #4f748c,
    0 6px 0 #4f748c,
    0 7px 0 #4f748c,
    0 13px 18px rgb(0 0 0 / 0.45);
  transition: transform 450ms cubic-bezier(0.34, 1.56, 0.64, 1);
  animation: respirar 3200ms ease-in-out calc(var(--i) * 120ms) infinite;
}
.letra:hover { transform: scale(1.18) translateY(-4%); }

/* respirar mexe em "scale"; o hover mexe em "transform": um não apaga o outro */
@keyframes respirar {
  50% { scale: 1.04 0.97; }
}

@media (prefers-reduced-motion: reduce) {
  .letra { animation: none; transition: none; }
}
```
