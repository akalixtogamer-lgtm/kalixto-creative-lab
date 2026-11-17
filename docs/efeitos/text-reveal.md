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

1. O JavaScript quebra o texto em <span>, um por letra ou por palavra, e grava o índice de cada um na variável CSS --i. As letras de uma palavra ficam dentro de um bloco .palavra, para a linha nunca quebrar no meio da palavra.
2. Todas as partes usam a mesma animação; o atraso de cada uma é calc(var(--i) * stagger). Isso cria a cascata.
3. O título recebe aria-label com o texto completo e os spans ficam com aria-hidden, para o leitor de tela ler a frase inteira e não letra por letra.
4. Os espaços entre as palavras ficam como texto normal, então a quebra de linha continua natural em qualquer largura.

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
