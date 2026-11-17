# Texto embaralhado (decodificar) (`text-scramble`)

> Gerado a partir de `src/app/core/efeitos/kits/text-scramble.kit.ts`. Não edite à mão: rode `npm run docs:efeitos`.

As letras viram caracteres aleatórios e vão "decodificando" da esquerda para a direita até formar o texto — no título ao carregar e nos links do menu ao passar o mouse.

| Campo | Valor |
|---|---|
| Nome técnico | Text Scramble / Decode |
| Categoria | 04 · Tipografia e texto › Texto que se transforma |
| Nível | Intermediário |
| Tecnologias | HTML, CSS, JavaScript |
| Dependências | nenhuma |
| Interação | Automático, Hover, Teclado, Clique |
| Status | validado em 2026-11-17 |
| Tags | scramble, decode, embaralhar, glitch, terminal, hacker, menu, tendência 2026 |

## Objetivo visual

Dar um ar tecnológico, de terminal ou de "hacker", a títulos e menus, com uma microinteração que recompensa o hover.

## Aplicações

- Menus de portfólios dev
- Títulos de landing pages de tecnologia
- Telas de abertura e loaders

## Como funciona

### Nível 1 — Iniciante

- O texto aparece primeiro como uma bagunça de símbolos.
- Da esquerda para a direita, cada símbolo vai virando a letra certa, como se o computador estivesse decifrando uma mensagem.
- Os links do menu fazem a mesma coisa quando o mouse passa por cima.

### Nível 2 — Intermediário

- O texto verdadeiro fica guardado no aria-label. Dentro do elemento há um <span> aria-hidden, que é o que muda na tela.
- A cada quadro, calcula-se o progresso (tempo decorrido ÷ duração). As letras com posição menor que progresso × tamanho já mostram o caractere certo; as demais mostram um caractere sorteado do conjunto.
- Espaços nunca são sorteados, para as palavras manterem o formato. A fonte monoespaçada evita que o texto "pule" de largura enquanto embaralha.

### Nível 3 — Avançado

- O progresso é baseado em tempo (performance.now), não em contagem de quadros: a duração é a mesma em telas de 60 Hz e 120 Hz.
- Cada elemento guarda o id do seu requestAnimationFrame para cancelar a animação anterior se o hover acontecer de novo no meio.
- Variação comum: revelar em ordem aleatória (embaralhe os índices) ou por "ondas" (cada letra tem um atraso próprio).
- No Angular, o texto do span é escrito direto no DOM (fora do template) porque muda a cada quadro; o WeakMap guarda o quadro de cada elemento.

### Glossário do código

| Termo | O que faz |
|---|---|
| `performance.now()` | Relógio preciso usado para calcular o progresso. |
| `Math.random()` | Sorteia o caractere das letras ainda não decifradas. |
| `aria-label` | Guarda o texto real para o leitor de tela. |
| `cancelAnimationFrame` | Interrompe a animação anterior antes de começar outra. |

## Parâmetros

| Controle | Tipo | Padrão | Faixa / opções |
|---|---|---|---|
| duração | range | 1200ms | 400–2500ms (passo 100) |
| caracteres sorteados | seleção | simbolos | símbolos, binário (0 e 1), letras |
| cor do destaque | seleção | #c6ff3d | Lima, Ciano, Magenta |

## Outra forma de fazer

GSAP tem o plugin ScrambleText (gratuito desde 2025), com opções de velocidade, caracteres e revelação por palavra.

## Compatibilidade

requestAnimationFrame e performance.now(): todos os navegadores atuais.

## Responsividade

Funciona em qualquer tamanho; no toque, o menu embaralha no foco (toque/teclado) em vez do hover.

## Acessibilidade

O leitor de tela lê o aria-label (texto correto), nunca os caracteres sorteados. Com prefers-reduced-motion o texto aparece direto, sem embaralhar.

## Performance

Só troca o textContent de um span por quadro, durante no máximo a duração escolhida. Custo desprezível.

## Limitações

- Com fontes proporcionais o texto treme de largura; use monoespaçada ou fixe a largura do elemento.
- Em textos longos (parágrafos) o efeito cansa: reserve para títulos curtos e itens de menu.

## Referências

- [MDN — requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame)
- [GSAP — ScrambleTextPlugin](https://gsap.com/docs/v3/Plugins/ScrambleTextPlugin/)
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
<title>Texto embaralhado (decodificar) · Kalixto Creative Lab</title>
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

.titulo-codigo {
  margin: 0;
  font: 700 clamp(1.6rem, 6vw, 3rem) / 1.1 'JetBrains Mono', ui-monospace, monospace;
  color: #c6ff3d;
  text-align: center;
}
.menu-codigo { display: flex; flex-wrap: wrap; gap: 24px; justify-content: center; }
.menu-codigo a {
  font: 500 18px 'JetBrains Mono', ui-monospace, monospace;
  color: #f4f2ff;
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.menu-codigo a:hover, .menu-codigo a:focus-visible { color: #c6ff3d; }
.menu-codigo a:focus-visible { outline: 2px solid #22e3ff; outline-offset: 4px; }

.repetir {
  padding: 8px 16px;
  border: 1px solid #3a3456;
  border-radius: 999px;
  background: transparent;
  color: #c9c3ea;
  font: inherit;
  cursor: pointer;
}
</style>
</head>
<body>
<h1 class="embaralhar titulo-codigo" aria-label="Código vira movimento"><span aria-hidden="true">Código vira movimento</span></h1>
<nav class="menu-codigo" aria-label="Menu de exemplo">
  <a class="embaralhar" href="#" aria-label="Projetos"><span aria-hidden="true">Projetos</span></a>
  <a class="embaralhar" href="#" aria-label="Laboratório"><span aria-hidden="true">Laboratório</span></a>
  <a class="embaralhar" href="#" aria-label="Contato"><span aria-hidden="true">Contato</span></a>
</nav>
<button class="repetir" type="button">Repetir título</button>
<script>
const CARACTERES = '!<>-_/[]{}=+*^?#';
const DURACAO = 1200;
const reduzir = matchMedia('(prefers-reduced-motion: reduce)');

function embaralhar(el) {
  const alvo = el.querySelector('span');
  const final = el.getAttribute('aria-label');
  if (reduzir.matches) {
    alvo.textContent = final;
    return;
  }
  cancelAnimationFrame(el._quadro);
  const inicio = performance.now();
  const passo = (agora) => {
    const p = Math.min(1, (agora - inicio) / DURACAO);
    let texto = '';
    for (let i = 0; i < final.length; i++) {
      const certo = final[i] === ' ' || i < p * final.length;
      texto += certo ? final[i] : CARACTERES[Math.floor(Math.random() * CARACTERES.length)];
    }
    alvo.textContent = texto;
    if (p < 1) el._quadro = requestAnimationFrame(passo);
  };
  el._quadro = requestAnimationFrame(passo);
}

const titulo = document.querySelector('.titulo-codigo');
embaralhar(titulo);
document.querySelector('.repetir').addEventListener('click', () => embaralhar(titulo));

// menu: embaralha no hover e no foco do teclado
document.querySelectorAll('.menu-codigo a').forEach((link) => {
  link.addEventListener('pointerenter', () => embaralhar(link));
  link.addEventListener('focus', () => embaralhar(link));
  link.addEventListener('click', (e) => e.preventDefault());
});
</script>
</body>
</html>
```

## Versão Angular (valores padrão)

Também em `src/app/efeitos-angular/text-scramble/` (compilada e testada com o app).

`text-scramble.ts`

```ts
import { Component, ElementRef, afterNextRender, viewChild } from '@angular/core';

@Component({
  selector: 'app-text-scramble',
  templateUrl: './text-scramble.html',
  styleUrl: './text-scramble.css',
})
export class TextScramble {
  protected readonly titulo = 'Código vira movimento';
  protected readonly links = ['Projetos', 'Laboratório', 'Contato'];
  private readonly caracteres = '!<>-_/[]{}=+*^?#';
  private readonly duracao = 1200;
  private readonly reduzir = window.matchMedia('(prefers-reduced-motion: reduce)');
  private readonly quadros = new WeakMap<HTMLElement, number>();
  private readonly alvoTitulo = viewChild.required<ElementRef<HTMLElement>>('alvoTitulo');

  constructor() {
    afterNextRender(() => this.embaralhar(this.alvoTitulo().nativeElement, this.titulo));
  }

  protected repetir(): void {
    this.embaralhar(this.alvoTitulo().nativeElement, this.titulo);
  }

  /** Escreve direto no span (aria-hidden): muda a cada quadro, fora da detecção de mudanças. */
  protected embaralhar(alvo: HTMLElement, final: string): void {
    if (this.reduzir.matches) {
      alvo.textContent = final;
      return;
    }
    cancelAnimationFrame(this.quadros.get(alvo) ?? 0);
    const inicio = performance.now();
    const passo = (agora: number) => {
      const p = Math.min(1, (agora - inicio) / this.duracao);
      let texto = '';
      for (let i = 0; i < final.length; i++) {
        const certo = final[i] === ' ' || i < p * final.length;
        texto += certo ? final[i] : this.caracteres[Math.floor(Math.random() * this.caracteres.length)];
      }
      alvo.textContent = texto;
      if (p < 1) this.quadros.set(alvo, requestAnimationFrame(passo));
    };
    this.quadros.set(alvo, requestAnimationFrame(passo));
  }
}
```

`text-scramble.html`

```html
<h1 class="embaralhar titulo-codigo" [attr.aria-label]="titulo">
  <span #alvoTitulo aria-hidden="true">{{ titulo }}</span>
</h1>
<nav class="menu-codigo" aria-label="Menu de exemplo">
  @for (t of links; track t) {
    <a
      class="embaralhar"
      href="#"
      [attr.aria-label]="t"
      (pointerenter)="embaralhar(alvo, t)"
      (focus)="embaralhar(alvo, t)"
      (click)="$event.preventDefault()"
      ><span #alvo aria-hidden="true">{{ t }}</span></a
    >
  }
</nav>
<button class="repetir" type="button" (click)="repetir()">Repetir título</button>
```

`text-scramble.css`

```css
:host {
  display: grid;
  place-items: center;
  gap: 24px;
}

.titulo-codigo {
  margin: 0;
  font: 700 clamp(1.6rem, 6vw, 3rem) / 1.1 'JetBrains Mono', ui-monospace, monospace;
  color: #c6ff3d;
  text-align: center;
}
.menu-codigo { display: flex; flex-wrap: wrap; gap: 24px; justify-content: center; }
.menu-codigo a {
  font: 500 18px 'JetBrains Mono', ui-monospace, monospace;
  color: #f4f2ff;
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.menu-codigo a:hover, .menu-codigo a:focus-visible { color: #c6ff3d; }
.menu-codigo a:focus-visible { outline: 2px solid #22e3ff; outline-offset: 4px; }

.repetir {
  padding: 8px 16px;
  border: 1px solid #3a3456;
  border-radius: 999px;
  background: transparent;
  color: #c9c3ea;
  font: inherit;
  cursor: pointer;
}
```
