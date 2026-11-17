# Botão com brilho neon (`glow-button`)

> Gerado a partir de `src/app/core/efeitos/kits/glow-button.kit.ts`. Não edite à mão: rode `npm run docs:efeitos`.

Um contorno luminoso em volta do botão, que pode pulsar e fica mais forte no hover e no foco.

| Campo | Valor |
|---|---|
| Nome técnico | Glow Button |
| Categoria | 08 · Luz, sombra e profundidade › Neon e glow |
| Nível | Iniciante |
| Tecnologias | HTML, CSS |
| Dependências | nenhuma |
| Interação | Automático, Hover, Teclado |
| Status | validado em 2026-11-17 |
| Tags | glow, neon, brilho, box-shadow, pulsar, botão |

## Objetivo visual

Destacar uma ação em interfaces escuras com estética neon.

## Aplicações

- Chamada principal em fundo escuro
- Estados "ao vivo" ou "gravando"
- Interfaces de games e tecnologia

## Como funciona

### Nível 1 — Iniciante

- O brilho é uma sombra sem deslocamento: ela se espalha igual para todos os lados, parecendo luz.
- Uma sombra fica por fora e outra por dentro do botão, como um tubo de neon.
- O pulso faz o brilho crescer e diminuir sem parar.

### Nível 2 — Intermediário

- O brilho é feito com box-shadow sem deslocamento: só desfoque e cor, em duas camadas (uma interna, uma externa).
- O pulso é uma animação que alterna o tamanho do desfoque, repetida para sempre (infinite) e indo e voltando (alternate).
- No hover e no foco o desfoque aumenta com transition.
- Este efeito não usa JavaScript.

### Nível 3 — Avançado

- Várias sombras separadas por vírgula se somam; inset desenha a sombra para dentro da borda.
- animation-direction: alternate evita o salto do fim para o início: o pulso vai e volta.
- Animar box-shadow causa repintura a cada quadro. Uma alternativa mais barata é um pseudo-elemento com a sombra máxima e animar só opacity.
- filter: drop-shadow acompanha o contorno real (bom para SVG e PNG com transparência), mas é mais caro.

### Glossário do código

| Termo | O que faz |
|---|---|
| `box-shadow` | Sombra; com deslocamento 0 vira um halo de luz. |
| `inset` | Desenha a sombra para dentro do elemento. |
| `infinite` | Repete a animação para sempre. |
| `alternate` | Cada repetição inverte o sentido (vai e volta). |
| `:focus-visible` | Foco pelo teclado com o mesmo destaque do hover. |

## Parâmetros

| Controle | Tipo | Padrão | Faixa / opções |
|---|---|---|---|
| cor do brilho | seleção | #22e3ff | Magenta, Roxo, Azul, Ciano |
| intensidade | range | 16px | 4–40px (passo 2) |
| pulsar | seleção | sim | sim, não |
| velocidade do pulso | range | 2s | 0.6–4s (passo 0.2) |

## Outra forma de fazer

filter: drop-shadow() segue o formato real do elemento (útil em ícones SVG), mas custa mais para o navegador.

## Compatibilidade

Todos os navegadores atuais.

## Responsividade

Não depende do tamanho da tela. Em toque, o estado de brilho forte aparece ao tocar (:active).

## Acessibilidade

O texto mantém contraste sobre o fundo do botão. O pulso para quando o sistema pede menos movimento. O foco do teclado tem contorno próprio, além do brilho.

## Performance

Animar box-shadow repinta o botão a cada quadro. Para um botão é leve; evite pulsar dezenas de elementos ao mesmo tempo.

## Limitações

- Em fundos claros o brilho quase não aparece — o efeito foi pensado para fundos escuros.

## Referências

- [MDN — box-shadow](https://developer.mozilla.org/en-US/docs/Web/CSS/box-shadow)
- [MDN — animation](https://developer.mozilla.org/en-US/docs/Web/CSS/animation)
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
<title>Botão com brilho neon · Kalixto Creative Lab</title>
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

/* O efeito */
.neon {
  padding: 14px 32px;
  border: 2px solid #22e3ff;
  border-radius: 12px;
  background: #0f0d1a;
  color: #fff;
  font: 600 1rem system-ui, sans-serif;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  box-shadow: 0 0 16px #22e3ff, inset 0 0 8px #22e3ff66;
  transition: box-shadow 200ms ease;
  animation: pulsar 2s ease-in-out infinite alternate;
}

.neon:hover,
.neon:focus-visible {
  box-shadow: 0 0 32px #22e3ff, inset 0 0 16px #22e3ff99;
}

.neon:focus-visible { outline: 2px solid #fff; outline-offset: 6px; }

@keyframes pulsar {
  from { box-shadow: 0 0 8px #22e3ff, inset 0 0 4px #22e3ff66; }
  to   { box-shadow: 0 0 32px #22e3ff, inset 0 0 16px #22e3ff99; }
}

@media (prefers-reduced-motion: reduce) {
  .neon { animation: none; }
}
</style>
</head>
<body>
<button class="neon" type="button">Ao vivo</button>
<script>
// Este efeito não precisa de JavaScript.
</script>
</body>
</html>
```

## Versão Angular (valores padrão)

Também em `src/app/efeitos-angular/glow-button/` (compilada e testada com o app).

`glow-button.ts`

```ts
import { Component } from '@angular/core';

/** glow-button: efeito só de CSS — o componente não precisa de lógica. */
@Component({
  selector: 'app-glow-button',
  templateUrl: './glow-button.html',
  styleUrl: './glow-button.css',
})
export class GlowButton {}
```

`glow-button.html`

```html
<button class="neon" type="button">Ao vivo</button>
```

`glow-button.css`

```css
:host {
  display: grid;
  place-items: center;
  gap: 24px;
}

/* O efeito */
.neon {
  padding: 14px 32px;
  border: 2px solid #22e3ff;
  border-radius: 12px;
  background: #0f0d1a;
  color: #fff;
  font: 600 1rem system-ui, sans-serif;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  box-shadow: 0 0 16px #22e3ff, inset 0 0 8px #22e3ff66;
  transition: box-shadow 200ms ease;
  animation: pulsar 2s ease-in-out infinite alternate;
}

.neon:hover,
.neon:focus-visible {
  box-shadow: 0 0 32px #22e3ff, inset 0 0 16px #22e3ff99;
}

.neon:focus-visible { outline: 2px solid #fff; outline-offset: 6px; }

@keyframes pulsar {
  from { box-shadow: 0 0 8px #22e3ff, inset 0 0 4px #22e3ff66; }
  to   { box-shadow: 0 0 32px #22e3ff, inset 0 0 16px #22e3ff99; }
}

@media (prefers-reduced-motion: reduce) {
  .neon { animation: none; }
}
```
