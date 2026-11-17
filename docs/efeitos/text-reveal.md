# Revelar texto em sequência (`text-reveal`)

> Gerado a partir de `src/app/core/efeitos/kits/text-reveal.kit.ts`. Não edite à mão: rode `npm run docs:efeitos`.

O título é dividido em letras ou palavras, que aparecem uma depois da outra.

| Campo | Valor |
|---|---|
| Nome técnico | Text Reveal (stagger) |
| Categoria | 04 · Tipografia e texto › Revelação de texto |
| Nível | Intermediário |
| Tecnologias | HTML, CSS, JavaScript |
| Dependências | nenhuma |
| Interação | Automático, Clique |
| Status | validado em 2026-11-17 |
| Tags | texto, split, stagger, letras, palavras, tipografia, reveal |

## Objetivo visual

Dar ritmo à leitura de um título e criar uma entrada marcante.

## Aplicações

- Títulos de hero
- Frases de impacto
- Aberturas de seção

## Como funciona

### Nível 1 — Iniciante

- O título é cortado em pedacinhos (letras ou palavras), e cada pedaço aparece um pouco depois do anterior.
- Cada pedaço sabe sua posição na fila (0, 1, 2…) e espera esse número vezes o intervalo.
- Quem usa leitor de tela ouve a frase inteira, e não letra por letra.

### Nível 2 — Intermediário

- O JavaScript quebra o texto em <span>, um por letra ou por palavra, e grava o índice de cada um na variável CSS --i. As letras de uma palavra ficam dentro de um bloco .palavra, para a linha nunca quebrar no meio da palavra.
- Todas as partes usam a mesma animação; o atraso de cada uma é calc(var(--i) * stagger). Isso cria a cascata.
- O título recebe aria-label com o texto completo e os spans ficam com aria-hidden, para o leitor de tela ler a frase inteira e não letra por letra.
- Os espaços entre as palavras ficam como texto normal, então a quebra de linha continua natural em qualquer largura.

### Nível 3 — Avançado

- O atraso é calculado no CSS com calc(var(--i) * intervalo): o JavaScript só grava o índice, não controla tempo.
- Letras agrupadas em .palavra com white-space: nowrap impedem quebra de linha no meio da palavra.
- Dividir em spans quebra kerning e ligaduras; em fontes com muitas ligaduras prefira o modo palavras.
- Divisão por linhas exige medir a quebra real após o layout (e refazer no resize) — é o que SplitText faz.
- No Angular, [style.--i] liga a custom property direto no template, sem manipular o DOM.

### Glossário do código

| Termo | O que faz |
|---|---|
| `--i` | Variável CSS com a posição de cada parte na sequência. |
| `calc(var(--i)` | Multiplica a posição pelo intervalo para calcular o atraso de cada parte. |
| `aria-label` | Texto que o leitor de tela lê no lugar das partes. |
| `aria-hidden` | Esconde as partes do leitor de tela (evita leitura letra por letra). |
| `white-space: nowrap` | Impede a palavra de quebrar no meio. |
| `inline-block` | Permite usar transform em cada parte, que é um elemento de texto. |

## Parâmetros

| Controle | Tipo | Padrão | Faixa / opções |
|---|---|---|---|
| dividir por | seleção | letras | letras, palavras |
| efeito | seleção | subir | subir, desfocar, girar (3D) |
| intervalo entre partes | range | 35ms | 10–200ms (passo 5) |
| duração de cada parte | range | 600ms | 200–1500ms (passo 50) |
| curva (easing) | seleção | cubic-bezier(0.22, 1, 0.36, 1) | suave (expo out), elástico (back out), ease, ease-in-out, linear |

## Outra forma de fazer

GSAP SplitText faz a divisão (inclusive por linhas, respeitando a quebra real do texto) e anima com stagger — veja a demo no GSAP Studio.

## Compatibilidade

Todos os navegadores atuais.

## Responsividade

O texto continua quebrando linha normalmente, porque cada palavra fica num bloco próprio.

## Acessibilidade

aria-label preserva a leitura da frase. Com redução de movimento, as partes só aparecem (sem deslocar, desfocar ou girar).

## Performance

Uma animação por letra. Para títulos curtos não há problema; em parágrafos longos prefira o modo palavras.

## Limitações

- A divisão por letras quebra ligaduras tipográficas e o kerning entre letras.
- Não divide por linhas: para isso é preciso medir a quebra real (SplitText faz isso).

## Referências

- [MDN — animation-delay](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-delay)
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
<title>Revelar texto em sequência · Kalixto Creative Lab</title>
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

.titulo {
  max-width: 14ch;
  margin: 0;
  font-size: clamp(2rem, 7vw, 3.5rem);
  line-height: 1.1;
  text-align: center;
  perspective: 600px;
}

/* cada palavra é um bloco que não quebra no meio */
.palavra { display: inline-block; white-space: nowrap; }

/* O efeito: cada parte espera --i vezes o intervalo */
.parte {
  display: inline-block;
  opacity: 0;
  transform: translateY(0.6em);
  animation: revelar 600ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
  animation-delay: calc(var(--i) * 35ms);
}

@keyframes revelar {
  to { opacity: 1; transform: none; filter: none; }
}

@media (prefers-reduced-motion: reduce) {
  .parte { transform: none; filter: none; animation-duration: 200ms; }
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
<h1 class="titulo">Experimente. Entenda. Codifique.</h1>
<button class="repetir" type="button">Repetir</button>
<script>
const titulo = document.querySelector('.titulo');
const texto = titulo.textContent;
const MODO = 'letras'; // 'letras' ou 'palavras'

function parte(conteudo, i) {
  const span = document.createElement('span');
  span.className = 'parte';
  span.style.setProperty('--i', i);
  span.textContent = conteudo;
  return span;
}

function dividir() {
  // o leitor de tela lê a frase inteira; os pedaços ficam escondidos dele
  titulo.setAttribute('aria-label', texto);
  titulo.textContent = '';
  let i = 0;

  texto.split(' ').forEach((palavra, n) => {
    if (n > 0) titulo.append(' '); // espaço normal: a linha pode quebrar aqui
    // cada palavra fica num bloco que não quebra, então as letras não se separam
    const bloco = document.createElement('span');
    bloco.className = 'palavra';
    bloco.setAttribute('aria-hidden', 'true');
    if (MODO === 'letras') {
      for (const letra of palavra) bloco.append(parte(letra, i++));
    } else {
      bloco.append(parte(palavra, i++));
    }
    titulo.append(bloco);
  });
}

dividir();
document.querySelector('.repetir').addEventListener('click', dividir);
</script>
</body>
</html>
```

## Versão Angular (valores padrão)

Também em `src/app/efeitos-angular/text-reveal/` (compilada e testada com o app).

`text-reveal.ts`

```ts
import { Component, signal } from '@angular/core';

/** Uma parte do texto (letra ou palavra) e sua posição na sequência. */
interface Parte {
  texto: string;
  i: number;
}

@Component({
  selector: 'app-text-reveal',
  templateUrl: './text-reveal.html',
  styleUrl: './text-reveal.css',
})
export class TextReveal {
  protected readonly texto = 'Experimente. Entenda. Codifique.';
  private readonly modo: 'letras' | 'palavras' = 'letras';

  /** Muda a cada clique em Repetir; o @for recria as partes e a animação recomeça. */
  protected readonly ciclo = signal(0);

  /** Palavras, cada uma com suas partes (letras ou a palavra inteira). */
  protected readonly palavras: Parte[][] = this.dividir();

  protected repetir(): void {
    this.ciclo.update((n) => n + 1);
  }

  private dividir(): Parte[][] {
    let i = 0;
    return this.texto.split(' ').map((palavra) =>
      this.modo === 'letras'
        ? [...palavra].map((letra) => ({ texto: letra, i: i++ }))
        : [{ texto: palavra, i: i++ }],
    );
  }
}
```

`text-reveal.html`

```html
<!-- o leitor de tela lê o aria-label; as partes ficam escondidas dele -->
<h1 class="titulo" [attr.aria-label]="texto">
  @for (c of [ciclo()]; track c) {
    @for (palavra of palavras; track $index; let ultima = $last) {
      <span class="palavra" aria-hidden="true">@for (p of palavra; track p.i) {<span class="parte" [style.--i]="p.i">{{ p.texto }}</span>}</span>
      <!-- espaço entre palavras: é onde a linha pode quebrar -->
      @if (!ultima) {
        {{ ' ' }}
      }
    }
  }
</h1>
<button class="repetir" type="button" (click)="repetir()">Repetir</button>
```

`text-reveal.css`

```css
:host {
  display: grid;
  place-items: center;
  gap: 24px;
}

.titulo {
  max-width: 14ch;
  margin: 0;
  font-size: clamp(2rem, 7vw, 3.5rem);
  line-height: 1.1;
  text-align: center;
  perspective: 600px;
}

/* cada palavra é um bloco que não quebra no meio */
.palavra { display: inline-block; white-space: nowrap; }

/* O efeito: cada parte espera --i vezes o intervalo */
.parte {
  display: inline-block;
  opacity: 0;
  transform: translateY(0.6em);
  animation: revelar 600ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
  animation-delay: calc(var(--i) * 35ms);
}

@keyframes revelar {
  to { opacity: 1; transform: none; filter: none; }
}

@media (prefers-reduced-motion: reduce) {
  .parte { transform: none; filter: none; animation-duration: 200ms; }
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
