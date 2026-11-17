# Aparecer suavemente (`fade-in`)

> Gerado a partir de `src/app/core/efeitos/kits/fade-in.kit.ts`. Não edite à mão: rode `npm run docs:efeitos`.

O elemento surge indo de transparente a totalmente visível.

| Campo | Valor |
|---|---|
| Nome técnico | Fade In |
| Categoria | 02 · Entradas, saídas e transições › Entradas |
| Nível | Iniciante |
| Tecnologias | HTML, CSS, JavaScript |
| Dependências | nenhuma |
| Interação | Automático, Clique |
| Status | validado em 2026-11-17 |
| Tags | fade, opacity, entrada, aparecer, keyframes |

## Objetivo visual

Dar uma entrada calma, sem chamar atenção para o movimento.

## Aplicações

- Conteúdo que carrega depois da página
- Mensagens de confirmação
- Imagens que terminam de baixar

## Como funciona

1. A animação muda só a propriedade opacity, de 0 (invisível) a 1 (visível).
2. @keyframes descreve o começo e o fim; animation diz quanto tempo leva, qual curva usa e quanto espera para começar.
3. O valor both em animation-fill-mode mantém o estado inicial durante o atraso e o final depois que a animação acaba.
4. O JavaScript só existe para o botão Repetir: ele tira e recoloca a classe para a animação recomeçar.

## Parâmetros

| Controle | Tipo | Padrão | Faixa / opções |
|---|---|---|---|
| duração | range | 700ms | 100–2000ms (passo 50) |
| atraso | range | 0ms | 0–1000ms (passo 50) |
| curva (easing) | seleção | ease | suave (expo out), elástico (back out), ease, ease-in-out, linear |

## Outra forma de fazer

Com JavaScript puro: element.animate([{ opacity: 0 }, { opacity: 1 }], { duration, easing }) — Web Animations API, sem precisar de classe.

## Compatibilidade

Todos os navegadores atuais (animation e @keyframes são suportados há muitos anos).

## Responsividade

Não depende do tamanho da tela.

## Acessibilidade

Mudar só a opacidade não provoca sensação de movimento, então o efeito é mantido mesmo com redução de movimento; nesse caso a duração cai para 200 ms. O conteúdo existe no HTML desde o início, então leitores de tela o encontram normalmente.

## Performance

opacity é processada pela GPU (compositor) e não recalcula o layout.

## Limitações

- Elementos com opacity 0 continuam ocupando espaço e podendo receber cliques durante a animação.

## Referências

- [MDN — animation](https://developer.mozilla.org/en-US/docs/Web/CSS/animation)
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
<title>Aparecer suavemente · Kalixto Creative Lab</title>
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
  background: linear-gradient(135deg, #d4119f, #7c3aed);
  font-size: 1.5rem;
  font-weight: 700;
}

/* O efeito */
.fade-in {
  animation: fade-in 700ms ease 0ms both;
}

@keyframes fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

/* Opacidade não é movimento: mantemos o efeito, só mais curto */
@media (prefers-reduced-motion: reduce) {
  .fade-in { animation-duration: 200ms; animation-delay: 0ms; }
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
<div class="cartao fade-in">Fade in</div>
<button class="repetir" type="button">Repetir</button>
<script>
// Repetir: tira a classe, força o navegador a recalcular e coloca de novo
const alvo = document.querySelector('.cartao');
document.querySelector('.repetir').addEventListener('click', () => {
  alvo.classList.remove('fade-in');
  void alvo.offsetWidth; // força o reflow para a animação recomeçar
  alvo.classList.add('fade-in');
});
</script>
</body>
</html>
```
