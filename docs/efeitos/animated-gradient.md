# Gradiente animado (`animated-gradient`)

> Gerado a partir de `src/app/core/efeitos/kits/animated-gradient.kit.ts`. Não edite à mão: rode `npm run docs:efeitos`.

Um fundo em gradiente que desliza devagar, trocando as cores de lugar.

| Campo | Valor |
|---|---|
| Nome técnico | Animated Gradient |
| Categoria | 07 · Backgrounds › Gradientes |
| Nível | Iniciante |
| Tecnologias | HTML, CSS |
| Dependências | nenhuma |
| Interação | Automático |
| Status | validado em 2026-11-17 |
| Tags | gradiente, gradient, background, fundo, cores |

## Objetivo visual

Dar vida a um hero ou seção sem usar vídeo nem imagem.

## Aplicações

- Fundo de hero
- Telas de carregamento
- Banners de campanha

## Como funciona

1. linear-gradient cria o degradê. A primeira cor se repete no fim para o movimento não ter emenda.
2. background-size maior que 100% deixa o gradiente maior que a caixa; só uma parte aparece por vez.
3. A animação move background-position de um lado para o outro, então a parte visível do gradiente muda.
4. Este efeito não usa JavaScript.

## Parâmetros

| Controle | Tipo | Padrão | Faixa / opções |
|---|---|---|---|
| cor 1 | seleção | #ff2bd6 | Magenta, Roxo, Azul, Ciano |
| cor 2 | seleção | #8b5cf6 | Magenta, Roxo, Azul, Ciano |
| cor 3 | seleção | #22e3ff | Magenta, Roxo, Azul, Ciano |
| ângulo | range | 120° | 0–360° (passo 5) |
| duração do ciclo | range | 10s | 3–30s (passo 1) |
| tamanho do gradiente | range | 300% | 150–600% (passo 25) |

## Outra forma de fazer

Com @property é possível animar as próprias cores ou o ângulo do gradiente (veja o kit Borda animada).

## Compatibilidade

Todos os navegadores atuais.

## Responsividade

O fundo acompanha o tamanho da caixa; a porcentagem de background-size mantém a proporção em qualquer tela.

## Acessibilidade

O movimento é lento e para com prefers-reduced-motion. O texto sobre o fundo usa sombra para manter a leitura em todas as cores.

## Performance

Animar background-position repinta a área a cada quadro. Em uma seção é leve; em telas grandes e celulares fracos, prefira velocidades mais lentas.

## Limitações

- Cores muito diferentes entre si podem deixar o texto ilegível em algum momento da animação.

## Referências

- [MDN — linear-gradient()](https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/linear-gradient)
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
<title>Gradiente animado · Kalixto Creative Lab</title>
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
.gradiente {
  display: grid;
  place-items: center;
  width: min(100%, 720px);
  aspect-ratio: 16 / 9;
  border-radius: 20px;
  background: linear-gradient(120deg, #ff2bd6, #8b5cf6, #22e3ff, #ff2bd6);
  background-size: 300% 300%;
  animation: deslizar 10s ease-in-out infinite alternate;
}

.gradiente h1 {
  margin: 0;
  font-size: clamp(1.4rem, 5vw, 2.6rem);
  text-shadow: 0 2px 12px rgb(0 0 0 / 0.45);
}

@keyframes deslizar {
  from { background-position: 0% 50%; }
  to   { background-position: 100% 50%; }
}

@media (prefers-reduced-motion: reduce) {
  .gradiente { animation: none; }
}
</style>
</head>
<body>
<section class="gradiente">
  <h1>Gradiente animado</h1>
</section>
<script>
// Este efeito não precisa de JavaScript.
</script>
</body>
</html>
```
