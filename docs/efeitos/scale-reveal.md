# Crescer ao aparecer (`scale-reveal`)

> Gerado a partir de `src/app/core/efeitos/kits/scale-reveal.kit.ts`. Não edite à mão: rode `npm run docs:efeitos`.

O elemento aparece crescendo a partir de um tamanho menor.

| Campo | Valor |
|---|---|
| Nome técnico | Scale Reveal |
| Categoria | 02 · Entradas, saídas e transições › Entradas |
| Nível | Iniciante |
| Tecnologias | HTML, CSS, JavaScript |
| Dependências | nenhuma |
| Interação | Automático, Clique |
| Status | validado em 2026-11-17 |
| Tags | scale, zoom, entrada, crescer, pop |

## Objetivo visual

Dar ênfase e sensação de "abrir" — bom para destaques e modais.

## Aplicações

- Modais e diálogos
- Cards de destaque
- Ícones de confirmação

## Como funciona

### Nível 1 — Iniciante

- O cartão começa menor e transparente e cresce até o tamanho normal.
- O ponto de origem é o lugar que fica parado enquanto o resto cresce — como abrir a partir do centro ou de um canto.
- A curva "elástico" faz o cartão passar um pouquinho do tamanho e voltar, como um "pop".

### Nível 2 — Intermediário

- transform: scale muda o tamanho visual sem alterar o espaço que o elemento ocupa no layout.
- transform-origin define o ponto fixo do crescimento: centro, topo ou um canto.
- A curva "elástico (back out)" passa um pouco do tamanho final e volta, dando o efeito de "pop".
- Com redução de movimento, a escala é removida e fica só o fade.

### Nível 3 — Avançado

- scale não muda o box no layout: vizinhos não se mexem e o hit-test usa o tamanho transformado.
- Curvas com y > 1 (back out) geram overshoot; com escala inicial muito baixa o exagero aumenta — mantenha entre 0,6 e 0,9.
- Durante a escala o texto pode ser rasterizado como textura e parecer borrado; o navegador redesenha nítido ao fim.
- Para modais, combine com o <dialog> nativo e anime ::backdrop separadamente.

### Glossário do código

| Termo | O que faz |
|---|---|
| `scale(` | Multiplica o tamanho visual: 1 é o tamanho normal, 0,6 é 60%. |
| `transform-origin` | Ponto fixo da transformação (centro, topo, canto…). |
| `cubic-bezier(0.34, 1.56, 0.64, 1)` | Curva com valor acima de 1, que passa do alvo e volta (efeito elástico). |
| `@keyframes` | Estados de início e fim da animação. |

## Parâmetros

| Controle | Tipo | Padrão | Faixa / opções |
|---|---|---|---|
| escala inicial | range | 0.6 | 0–0.95 (passo 0.05) |
| ponto de origem | seleção | center | centro, topo, canto superior esquerdo, canto inferior direito |
| duração | range | 600ms | 100–2000ms (passo 50) |
| curva (easing) | seleção | cubic-bezier(0.34, 1.56, 0.64, 1) | suave (expo out), elástico (back out), ease, ease-in-out, linear |

## Outra forma de fazer

Web Animations API: el.animate([{ transform: "scale(.6)", opacity: 0 }, { transform: "none", opacity: 1 }], 600).

## Compatibilidade

Todos os navegadores atuais.

## Responsividade

A escala é relativa ao próprio elemento, então funciona em qualquer largura.

## Acessibilidade

Respeita prefers-reduced-motion (só opacidade). Escalas iniciais muito pequenas com curva elástica podem incomodar; prefira de 0,6 a 0,9.

## Performance

transform e opacity são animadas pelo compositor.

## Limitações

- Textos podem parecer borrados durante a escala em alguns navegadores; o resultado final fica nítido.

## Referências

- [MDN — transform](https://developer.mozilla.org/en-US/docs/Web/CSS/transform)
- [MDN — @keyframes](https://developer.mozilla.org/en-US/docs/Web/CSS/@keyframes)
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
<title>Crescer ao aparecer · Kalixto Creative Lab</title>
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

.cartao {
  padding: 32px 48px;
  border-radius: 16px;
  background: linear-gradient(135deg, #2563eb, #0891b2);
  font-size: 1.5rem;
  font-weight: 700;
}

/* O efeito */
.scale-reveal {
  transform-origin: center;
  animation: scale-reveal 600ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

@keyframes scale-reveal {
  from { opacity: 0; transform: scale(0.6); }
  to   { opacity: 1; transform: scale(1); }
}

@media (prefers-reduced-motion: reduce) {
  .scale-reveal { animation-name: aparecer; }
  @keyframes aparecer { from { opacity: 0; } to { opacity: 1; } }
}

.repetir {
  padding: 8px 16px;
  border: 1px solid #3a3456;
  border-radius: 999px;
  background: transparent;
  color: #c9c3ea;
  font: inherit;
  cursor: pointer;
}
.repetir:focus-visible { outline: 2px solid #22e3ff; outline-offset: 3px; }
</style>
</head>
<body>
<div class="cartao scale-reveal">Scale reveal</div>
<button class="repetir" type="button">Repetir</button>
<script>
// Repetir: tira a classe, força o navegador a recalcular e coloca de novo
const alvo = document.querySelector('.cartao');
document.querySelector('.repetir').addEventListener('click', () => {
  alvo.classList.remove('scale-reveal');
  void alvo.offsetWidth; // força o reflow para a animação recomeçar
  alvo.classList.add('scale-reveal');
});
</script>
</body>
</html>
```

## Versão Angular (valores padrão)

Também em `src/app/efeitos-angular/scale-reveal/` (compilada e testada com o app).

`scale-reveal.ts`

```ts
import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-scale-reveal',
  templateUrl: './scale-reveal.html',
  styleUrl: './scale-reveal.css',
})
export class ScaleReveal {
  /** Muda a cada clique em Repetir; o @for recria o elemento animado. */
  protected readonly ciclo = signal(0);

  protected repetir(): void {
    this.ciclo.update((n) => n + 1);
  }
}
```

`scale-reveal.html`

```html
@for (c of [ciclo()]; track c) {
  <div class="cartao scale-reveal">Scale reveal</div>
}
<button class="repetir" type="button" (click)="repetir()">Repetir</button>
```

`scale-reveal.css`

```css
:host {
  display: grid;
  place-items: center;
  gap: 24px;
}

.cartao {
  padding: 32px 48px;
  border-radius: 16px;
  background: linear-gradient(135deg, #2563eb, #0891b2);
  font-size: 1.5rem;
  font-weight: 700;
}

/* O efeito */
.scale-reveal {
  transform-origin: center;
  animation: scale-reveal 600ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

@keyframes scale-reveal {
  from { opacity: 0; transform: scale(0.6); }
  to   { opacity: 1; transform: scale(1); }
}

@media (prefers-reduced-motion: reduce) {
  .scale-reveal { animation-name: aparecer; }
  @keyframes aparecer { from { opacity: 0; } to { opacity: 1; } }
}

.repetir {
  padding: 8px 16px;
  border: 1px solid #3a3456;
  border-radius: 999px;
  background: transparent;
  color: #c9c3ea;
  font: inherit;
  cursor: pointer;
}
.repetir:focus-visible { outline: 2px solid #22e3ff; outline-offset: 3px; }
```
