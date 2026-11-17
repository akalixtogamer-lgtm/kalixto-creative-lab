# Borda animada (`animated-border`)

> Gerado a partir de `src/app/core/efeitos/kits/animated-border.kit.ts`. Não edite à mão: rode `npm run docs:efeitos`.

Uma borda em gradiente que gira em volta do elemento sem parar.

| Campo | Valor |
|---|---|
| Nome técnico | Animated Border (conic gradient) |
| Categoria | 01 · Microinterações e UI › Bordas |
| Nível | Intermediário |
| Tecnologias | HTML, CSS |
| Dependências | nenhuma |
| Interação | Automático |
| Status | validado em 2026-11-17 |
| Tags | borda, border, conic-gradient, @property, gradiente, destaque |

## Objetivo visual

Chamar atenção para um card ou plano em destaque.

## Aplicações

- Plano "recomendado" numa tabela de preços
- Card em destaque
- Campo ativo

## Como funciona

1. A borda é transparente e o elemento tem dois fundos: um sólido limitado ao padding-box (o miolo) e um conic-gradient no border-box (aparece só na faixa da borda).
2. @property registra --angulo como <angle>. Só assim o navegador consegue interpolar a variável numa animação.
3. A animação gira --angulo de 0 a 360°, e o conic-gradient usa esse valor como ponto de partida, então a cor percorre a borda.
4. Este efeito não usa JavaScript.

## Parâmetros

| Controle | Tipo | Padrão | Faixa / opções |
|---|---|---|---|
| espessura | range | 3px | 1–8px (passo 1) |
| tempo de uma volta | range | 4s | 1–12s (passo 0.5) |
| cor 1 | seleção | #ff2bd6 | Magenta, Roxo, Azul, Ciano |
| cor 2 | seleção | #22e3ff | Magenta, Roxo, Azul, Ciano |
| arredondamento | range | 20px | 0–40px (passo 2) |

## Outra forma de fazer

Sem @property: um pseudo-elemento maior, com o gradiente girando via transform: rotate, recortado pelo overflow: hidden do card.

## Compatibilidade

@property: Chrome e Edge 85+, Safari 16.4+, Firefox 128+. Em navegadores sem suporte a borda aparece com o gradiente parado.

## Responsividade

A borda acompanha qualquer tamanho e raio do elemento.

## Acessibilidade

Puramente decorativo. A rotação para com prefers-reduced-motion, e o contraste do texto não depende da borda.

## Performance

Animar uma custom property repinta o elemento a cada quadro. Use em poucos elementos por tela.

## Limitações

- Bordas muito finas (1 px) quase não mostram o gradiente.

## Referências

- [MDN — @property](https://developer.mozilla.org/en-US/docs/Web/CSS/@property)
- [MDN — conic-gradient()](https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/conic-gradient)
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
<title>Borda animada · Kalixto Creative Lab</title>
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

/* Registra a variável como ângulo para ela poder ser animada */
@property --angulo {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}

/* O efeito */
.borda {
  width: min(80vw, 320px);
  padding: 32px;
  border: 3px solid transparent;
  border-radius: 20px;
  background:
    linear-gradient(#0f0d1a, #0f0d1a) padding-box,
    conic-gradient(from var(--angulo), #ff2bd6, #22e3ff, #ff2bd6) border-box;
  animation: girar 4s linear infinite;
}

.borda h2 { margin: 0 0 6px; }
.borda p { margin: 0; color: #c9c3ea; }

@keyframes girar {
  to { --angulo: 360deg; }
}

@media (prefers-reduced-motion: reduce) {
  .borda { animation: none; }
}
</style>
</head>
<body>
<article class="borda">
  <h2>Plano Pro</h2>
  <p>O card em destaque.</p>
</article>
<script>
// Este efeito não precisa de JavaScript.
</script>
</body>
</html>
```
