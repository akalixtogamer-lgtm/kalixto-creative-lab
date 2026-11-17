# Deslizar para dentro (`slide-in`)

> Gerado a partir de `src/app/core/efeitos/kits/slide-in.kit.ts`. Não edite à mão: rode `npm run docs:efeitos`.

O elemento entra deslizando de uma direção enquanto aparece.

| Campo | Valor |
|---|---|
| Nome técnico | Slide In |
| Categoria | 02 · Entradas, saídas e transições › Entradas |
| Nível | Iniciante |
| Tecnologias | HTML, CSS, JavaScript |
| Dependências | nenhuma |
| Interação | Automático, Clique |
| Status | validado em 2026-11-17 |
| Tags | slide, translate, entrada, deslizar, keyframes |

## Objetivo visual

Mostrar de onde o conteúdo vem e dar sensação de fluxo.

## Aplicações

- Seções que entram ao rolar
- Menus e painéis laterais
- Notificações

## Como funciona

1. transform: translate move o elemento sem mexer no layout: os vizinhos não saem do lugar.
2. A animação começa deslocada (translateX ou translateY) e transparente, e termina na posição original e visível.
3. Distâncias curtas (16 a 40 px) parecem mais elegantes; distâncias longas chamam mais atenção.
4. Com redução de movimento, o deslocamento é removido e fica só o fade.

## Parâmetros

| Controle | Tipo | Padrão | Faixa / opções |
|---|---|---|---|
| vem de | seleção | baixo | baixo, cima, esquerda, direita |
| distância | range | 40px | 8–200px (passo 4) |
| duração | range | 700ms | 100–2000ms (passo 50) |
| curva (easing) | seleção | cubic-bezier(0.22, 1, 0.36, 1) | suave (expo out), elástico (back out), ease, ease-in-out, linear |

## Outra forma de fazer

GSAP: gsap.from(el, { y: 40, opacity: 0, duration: 0.7 }) — útil quando a entrada depende de rolagem (ScrollTrigger).

## Compatibilidade

Todos os navegadores atuais.

## Responsividade

Em telas estreitas, prefira distâncias menores ou o eixo vertical, para não gerar rolagem horizontal durante a entrada.

## Acessibilidade

Respeita prefers-reduced-motion: sem deslocamento, só a opacidade. O elemento está no HTML desde o início.

## Performance

transform e opacity são animadas pelo compositor, sem recalcular layout.

## Limitações

- Entradas pela lateral podem gerar barra de rolagem horizontal se o contêiner não tiver overflow controlado.

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
<title>Deslizar para dentro · Kalixto Creative Lab</title>
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
  overflow: hidden;
}

.cartao {
  padding: 32px 48px;
  border-radius: 16px;
  background: linear-gradient(135deg, #7c3aed, #2563eb);
  font-size: 1.5rem;
  font-weight: 700;
}

/* O efeito */
.slide-in {
  animation: slide-in 700ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes slide-in {
  from { opacity: 0; transform: translateY(40px); }
  to   { opacity: 1; transform: none; }
}

/* Sem deslocamento para quem prefere menos movimento */
@media (prefers-reduced-motion: reduce) {
  .slide-in { animation-name: aparecer; }
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
<div class="cartao slide-in">Slide in</div>
<button class="repetir" type="button">Repetir</button>
<script>
// Repetir: tira a classe, força o navegador a recalcular e coloca de novo
const alvo = document.querySelector('.cartao');
document.querySelector('.repetir').addEventListener('click', () => {
  alvo.classList.remove('slide-in');
  void alvo.offsetWidth; // força o reflow para a animação recomeçar
  alvo.classList.add('slide-in');
});
</script>
</body>
</html>
```
