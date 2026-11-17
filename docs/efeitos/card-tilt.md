# Card que inclina com o mouse (`card-tilt`)

> Gerado a partir de `src/app/core/efeitos/kits/card-tilt.kit.ts`. Não edite à mão: rode `npm run docs:efeitos`.

O card gira em 3D acompanhando a posição do ponteiro, com um reflexo de luz que segue o mouse.

| Campo | Valor |
|---|---|
| Nome técnico | 3D Card Tilt |
| Categoria | 06 · Cards, imagens e galerias › Cards com profundidade |
| Nível | Intermediário |
| Tecnologias | HTML, CSS, JavaScript |
| Dependências | nenhuma |
| Interação | Movimento do mouse, Teclado |
| Status | validado em 2026-11-17 |
| Tags | tilt, 3d, card, perspectiva, mouse, reflexo, profundidade |

## Objetivo visual

Dar sensação de objeto físico e profundidade a um card.

## Aplicações

- Cards de produto
- Cartões de perfil
- Vitrines de projetos

## Como funciona

1. perspective no contêiner define a distância do "olho" até o card: valores menores deixam o 3D mais exagerado.
2. No pointermove, a posição do ponteiro dentro do card vira um número de -0,5 a 0,5 em cada eixo.
3. Esse número multiplicado pela inclinação máxima vira rotateX e rotateY.
4. As mesmas coordenadas vão para as variáveis --x e --y, usadas no radial-gradient do reflexo.

## Parâmetros

| Controle | Tipo | Padrão | Faixa / opções |
|---|---|---|---|
| inclinação máxima | range | 12° | 2–30° (passo 1) |
| perspectiva | range | 800px | 300–2000px (passo 50) |
| escala no hover | range | 1.03 | 1–1.1 (passo 0.01) |
| reflexo de luz | seleção | sim | sim, não |

## Outra forma de fazer

Com GSAP, gsap.to(card, { rotationY, rotationX, duration: 0.4 }) suaviza o movimento sem transition no CSS.

## Compatibilidade

transform 3D e Pointer Events funcionam em todos os navegadores atuais.

## Responsividade

Só reage a mouse. Em toque o card fica parado e legível. A largura do card se adapta à tela.

## Acessibilidade

O card recebe foco pelo teclado e mostra um estado de destaque (leve elevação e contorno). A inclinação é decorativa e é desativada com prefers-reduced-motion.

## Performance

Uma leitura de getBoundingClientRect e uma escrita de estilo por quadro, só enquanto o ponteiro está sobre o card.

## Limitações

- Textos pequenos podem ficar menos nítidos enquanto o card está inclinado.
- Inclinações acima de 20° dificultam a leitura.

## Referências

- [MDN — perspective](https://developer.mozilla.org/en-US/docs/Web/CSS/perspective)
- [MDN — transform](https://developer.mozilla.org/en-US/docs/Web/CSS/transform)
- [MDN — Pointer events](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events)
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
<title>Card que inclina com o mouse · Kalixto Creative Lab</title>
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

.cena { perspective: 800px; }

/* O efeito */
.card {
  position: relative;
  width: min(80vw, 300px);
  aspect-ratio: 3 / 4;
  display: grid;
  align-content: end;
  padding: 24px;
  border-radius: 20px;
  background: linear-gradient(160deg, #2a1f4d, #120f22);
  border: 1px solid #3a3456;
  transform: rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)) scale(var(--s, 1));
  transition: transform 400ms cubic-bezier(0.22, 1, 0.36, 1);
  overflow: hidden;
}

.card h2 { margin: 0 0 4px; }
.card p { margin: 0; color: #c9c3ea; }

/* enquanto o mouse está em cima, acompanha sem atraso */
.card.is-ativo { transition-duration: 80ms; }

.card:focus-visible {
  outline: 2px solid #22e3ff;
  outline-offset: 6px;
  --s: 1.03;
}

/* reflexo: um brilho circular na posição do ponteiro */
.card::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at var(--x, 50%) var(--y, 50%), rgb(255 255 255 / 0.22), transparent 55%);
  opacity: 0;
  transition: opacity 300ms ease;
  pointer-events: none;
}
.card.is-ativo::after { opacity: 1; }

@media (prefers-reduced-motion: reduce) {
  .card { transform: none; }
}
</style>
</head>
<body>
<div class="cena">
  <article class="card" tabindex="0">
    <h2>Card 3D</h2>
    <p>Passe o mouse sobre o card.</p>
  </article>
</div>
<script>
const card = document.querySelector('.card');
const INCLINACAO = 12; // graus
const ESCALA = 1.03;
const reduzir = window.matchMedia('(prefers-reduced-motion: reduce)');
let quadro = 0;

card.addEventListener('pointermove', (e) => {
  if (reduzir.matches || e.pointerType !== 'mouse') return;
  cancelAnimationFrame(quadro);
  quadro = requestAnimationFrame(() => {
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;  // -0,5 … 0,5
    const py = (e.clientY - r.top) / r.height - 0.5;
    card.classList.add('is-ativo');
    card.style.setProperty('--ry', px * INCLINACAO * 2 + 'deg');
    card.style.setProperty('--rx', -py * INCLINACAO * 2 + 'deg');
    card.style.setProperty('--s', ESCALA);
    card.style.setProperty('--x', (px + 0.5) * 100 + '%');
    card.style.setProperty('--y', (py + 0.5) * 100 + '%');
  });
});

card.addEventListener('pointerleave', () => {
  cancelAnimationFrame(quadro);
  card.classList.remove('is-ativo');
  for (const p of ['--rx', '--ry', '--s']) card.style.removeProperty(p);
});
</script>
</body>
</html>
```
