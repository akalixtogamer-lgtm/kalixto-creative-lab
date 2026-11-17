# Botão que sobe no hover (`button-hover`)

> Gerado a partir de `src/app/core/efeitos/kits/button-hover.kit.ts`. Não edite à mão: rode `npm run docs:efeitos`.

O botão sobe, cresce um pouco e ganha sombra quando o ponteiro passa ou quando recebe foco.

| Campo | Valor |
|---|---|
| Nome técnico | Button Hover Lift |
| Categoria | 01 · Microinterações e UI › Botões |
| Nível | Iniciante |
| Tecnologias | HTML, CSS |
| Dependências | nenhuma |
| Interação | Hover, Teclado, Clique |
| Status | validado em 2026-11-17 |
| Tags | hover, botão, transition, sombra, focus, microinteração |

## Objetivo visual

Confirmar que o elemento é clicável e dar resposta imediata.

## Aplicações

- Botões de ação principal
- Cards clicáveis
- Links em destaque

## Como funciona

1. transition anima a mudança entre o estado normal e o estado :hover, sem precisar de keyframes.
2. O mesmo estilo vale para :focus-visible, então quem navega pelo teclado (Tab) recebe a mesma resposta.
3. :active devolve o botão para baixo no clique, simulando que foi pressionado.
4. Este efeito não usa JavaScript.

## Parâmetros

| Controle | Tipo | Padrão | Faixa / opções |
|---|---|---|---|
| elevação | range | 4px | 0–16px (passo 1) |
| escala no hover | range | 1.04 | 1–1.15 (passo 0.01) |
| sombra (desfoque) | range | 24px | 0–60px (passo 2) |
| duração | range | 200ms | 80–600ms (passo 20) |
| cor da sombra | seleção | #ff2bd6 | Magenta, Roxo, Azul, Ciano |

## Outra forma de fazer

Com Angular, a mesma regra fica no CSS do componente; não precisa de @HostListener para um hover simples.

## Compatibilidade

Todos os navegadores atuais. :focus-visible é suportado nos navegadores atuais.

## Responsividade

Em telas de toque não existe hover; o botão funciona igual e mostra o estado :active ao tocar.

## Acessibilidade

Mesmo efeito no hover e no foco do teclado, com contorno visível em :focus-visible. Com redução de movimento, o deslocamento é removido e fica só a sombra.

## Performance

transform é animada pelo compositor. box-shadow repinta a área do botão — aceitável em um botão, evite em centenas de elementos ao mesmo tempo.

## Limitações

- Em dispositivos de toque o hover não existe; não esconda informação essencial no estado de hover.

## Referências

- [MDN — transition](https://developer.mozilla.org/en-US/docs/Web/CSS/transition)
- [MDN — box-shadow](https://developer.mozilla.org/en-US/docs/Web/CSS/box-shadow)
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
<title>Botão que sobe no hover · Kalixto Creative Lab</title>
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
.botao {
  padding: 14px 28px;
  border: 0;
  border-radius: 12px;
  background: linear-gradient(135deg, #d4119f, #7c3aed);
  color: #fff;
  font: 600 1rem system-ui, sans-serif;
  cursor: pointer;
  transition:
    transform 200ms ease,
    box-shadow 200ms ease;
}

.botao:hover,
.botao:focus-visible {
  transform: translateY(-4px) scale(1.04);
  box-shadow: 0 8px 24px #ff2bd680;
}

.botao:focus-visible { outline: 2px solid #22e3ff; outline-offset: 4px; }

.botao:active { transform: translateY(0) scale(0.98); }

/* Sem deslocamento para quem prefere menos movimento */
@media (prefers-reduced-motion: reduce) {
  .botao:hover,
  .botao:focus-visible { transform: none; }
}
</style>
</head>
<body>
<button class="botao" type="button">Passe o mouse ou use Tab</button>
<script>
// Este efeito não precisa de JavaScript.
</script>
</body>
</html>
```
