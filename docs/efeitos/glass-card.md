# Gerador de vidro (glassmorphism) (`glass-card`)

> Gerado a partir de `src/app/core/efeitos/kits/glass-card.kit.ts`. Não edite à mão: rode `npm run docs:efeitos`.

Um card de vidro fosco sobre formas coloridas que flutuam: ajuste desfoque, transparência, saturação, borda, cor do vidro e o reflexo que passa ao apontar — e copie o CSS pronto.

| Campo | Valor |
|---|---|
| Nome técnico | Glassmorphism Generator (backdrop-filter) |
| Categoria | 08 · Luz, sombra e profundidade › Vidro e desfoque |
| Nível | Iniciante |
| Tecnologias | HTML, CSS, JavaScript |
| Dependências | nenhuma |
| Interação | Automático, Movimento do mouse, Hover |
| Status | validado em 2026-11-17 |
| Tags | glassmorphism, vidro, glass, blur, desfoque, backdrop-filter, fosco, frosted, tendência 2026 |

## Objetivo visual

Criar superfícies de vidro (cards, menus, modais) que deixam o fundo aparecer desfocado, com leitura confortável.

## Aplicações

- Cards de destaque e de preço
- Menus, barras e painéis flutuantes
- Telas de login e widgets sobre fotos

## Como funciona

### Nível 1 — Iniciante

- É um cartão que parece feito de vidro fosco: dá para ver as bolhas coloridas atrás dele, só que borradas.
- Os controles mudam o quanto o vidro borra, o quanto ele é transparente, a cor do vidro e o brilho da borda.
- Passando o mouse, um reflexo de luz corre pelo vidro.

### Nível 2 — Intermediário

- O vidro é feito de quatro ingredientes: fundo quase transparente (rgb com alfa baixo), backdrop-filter: blur() + saturate(), borda fina e clara e uma sombra suave.
- backdrop-filter age no que está ATRÁS do elemento (diferente de filter, que age no próprio elemento): por isso as formas coloridas aparecem desfocadas através do card.
- saturate() acima de 1 deixa as cores atrás mais vivas, o que dá o aspecto de vidro de verdade em vez de "névoa cinza".
- O reflexo é um gradiente diagonal num ::before que segue o mouse (variáveis --rx e --ry). As formas do fundo flutuam com animação para o vidro "ganhar vida".

### Nível 3 — Avançado

- backdrop-filter só enxerga o que está atrás DENTRO do mesmo contexto de empilhamento; se o vidro não desfoca nada, verifique se o fundo está mesmo atrás dele (e não num irmão com isolation).
- inset 0 1px 0 rgb(255 255 255 / x) na sombra cria a "quina iluminada" no topo, típica do vidro da Apple.
- Combine com um ruído sutil (grão) por cima para evitar o banding em desfoques grandes.
- @supports not (backdrop-filter) garante leitura em navegadores sem suporte; o mesmo truque serve para modo de economia de energia.

### Glossário do código

| Termo | O que faz |
|---|---|
| `backdrop-filter` | Aplica desfoque e saturação ao que está atrás do card. |
| `saturate(` | Deixa as cores atrás do vidro mais vivas. |
| `@supports not` | Plano B para navegadores sem backdrop-filter. |
| `inset 0 1px 0` | Linha de luz no topo do vidro. |

## Parâmetros

| Controle | Tipo | Padrão | Faixa / opções |
|---|---|---|---|
| desfoque | range | 16px | 0–40px (passo 2) |
| opacidade do vidro | range | 0.15 | 0.05–0.6 (passo 0.05) |
| saturação do fundo | range | 1.6× | 1–2× (passo 0.1) |
| brilho da borda | range | 0.3 | 0–0.6 (passo 0.05) |
| cor do vidro | seleção | 255 255 255 | Branco (clássico), Lilás, Rosa, Azul, Escuro (vidro fumê) |

## Outra forma de fazer

Sem backdrop-filter (navegadores antigos ou economia de bateria), use um fundo mais opaco, rgb(255 255 255 / 0.7): o @supports do CSS já faz essa troca.

## Compatibilidade

backdrop-filter: Chrome/Edge 76+, Firefox 103+, Safari 18+ (sem prefixo; o CSS inclui -webkit-backdrop-filter para Safari mais antigo).

## Responsividade

O card tem largura máxima e as formas do fundo usam % do palco: o vidro funciona em qualquer tela.

## Acessibilidade

Texto sobre vidro precisa de contraste: o fundo do card nunca fica 100% transparente e o texto tem cor sólida. Teste o contraste com o fundo mais claro que pode aparecer atrás. Com prefers-reduced-motion as formas param e o reflexo não se move.

## Performance

backdrop-filter é caro: o navegador redesenha o desfoque quando algo atrás muda. Use em poucos elementos e com raio de desfoque moderado (até ~24px).

## Limitações

- Um ancestral com overflow: hidden + border-radius ou com filter/opacity pode cortar ou desligar o backdrop-filter em alguns navegadores.
- Sobre fundos lisos (uma cor só) o vidro não aparece: ele precisa de algo colorido atrás.

## Referências

- [MDN — backdrop-filter](https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter)
- [MDN — @supports](https://developer.mozilla.org/en-US/docs/Web/CSS/@supports)
- [WCAG 2.2 — 1.4.3 Contraste mínimo](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)

## Código (valores padrão)

Arquivo único, igual ao baixado pelo botão “Baixar” na página do efeito:

```html
<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data:; font-src data:">
<title>Gerador de vidro (glassmorphism) · Kalixto Creative Lab</title>
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

.vitrine-vidro {
  position: relative;
  display: grid;
  place-items: center;
  width: min(100%, 640px);
  aspect-ratio: 16 / 10;
  border-radius: 20px;
  overflow: hidden;
  background: #120f24;
}

/* Formas coloridas atrás do vidro (sem elas, o vidro não aparece) */
.forma { position: absolute; border-radius: 50%; animation: flutuar 9s ease-in-out infinite alternate; }
.f1 { width: 42%; aspect-ratio: 1; left: 8%; top: 6%; background: radial-gradient(circle at 30% 30%, #ff8ad8, #c81a8c); }
.f2 { width: 34%; aspect-ratio: 1; right: 10%; bottom: 4%; background: radial-gradient(circle at 30% 30%, #93c5fd, #2563eb); animation-delay: -3s; }
.f3 { width: 22%; aspect-ratio: 1; right: 30%; top: 14%; background: radial-gradient(circle at 30% 30%, #ddd6fe, #7c4ddb); animation-delay: -6s; }
@keyframes flutuar {
  to { translate: 6% 8%; scale: 1.08; }
}

/* O vidro: fundo translúcido + backdrop-filter + borda clara + sombra */
.vidro {
  --rx: 30%;
  --ry: 0%;
  position: relative;
  display: grid;
  gap: 8px;
  width: min(78%, 320px);
  padding: 28px;
  border: 1px solid rgb(255 255 255 / 0.3);
  border-radius: 22px;
  background: rgb(255 255 255 / 0.15);
  -webkit-backdrop-filter: blur(16px) saturate(1.6);
  backdrop-filter: blur(16px) saturate(1.6);
  box-shadow: 0 20px 50px rgb(0 0 0 / 0.25), inset 0 1px 0 rgb(255 255 255 / 0.3);
  color: #ffffff;
  overflow: hidden;
}
/* reflexo que acompanha o ponteiro */
.vidro::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at var(--rx) var(--ry), rgb(255 255 255 / 0.35), transparent 45%);
  pointer-events: none;
  transition: opacity 300ms ease;
}
.vidro > * { position: relative; margin: 0; }
.vidro__selo { font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; opacity: 0.85; }
.vidro h2 { font-size: clamp(2rem, 8vw, 3rem); line-height: 1; }
.vidro h2 small { font-size: 0.4em; font-weight: 400; }
.vidro p { text-shadow: 0 1px 8px rgb(0 0 0 / 0.25); }
.vidro button {
  justify-self: start;
  margin-top: 6px;
  padding: 10px 20px;
  border: 1px solid rgb(255 255 255 / 0.5);
  border-radius: 999px;
  background: rgb(255 255 255 / 0.2);
  color: inherit;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}
.vidro button:focus-visible { outline: 2px solid #fff; outline-offset: 3px; }

/* Sem backdrop-filter: vidro mais opaco para manter a leitura */
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .vidro { background: rgb(255 255 255 / 0.75); color: #1d1530; }
}

@media (prefers-reduced-motion: reduce) {
  .forma { animation: none; }
}
</style>
</head>
<body>
<section class="vitrine-vidro">
  <div class="formas" aria-hidden="true">
    <span class="forma f1"></span>
    <span class="forma f2"></span>
    <span class="forma f3"></span>
  </div>
  <article class="vidro">
    <p class="vidro__selo">Plano Pro</p>
    <h2>R$ 49<small>/mês</small></h2>
    <p>Tudo o que você precisa para publicar seus projetos.</p>
    <button type="button">Assinar</button>
  </article>
</section>
<script>
const vidro = document.querySelector('.vidro');
const reduzir = matchMedia('(prefers-reduced-motion: reduce)');
let quadro = 0;

// o reflexo segue o ponteiro sobre o card
vidro.addEventListener('pointermove', (e) => {
  if (reduzir.matches) return;
  cancelAnimationFrame(quadro);
  quadro = requestAnimationFrame(() => {
    const r = vidro.getBoundingClientRect();
    vidro.style.setProperty('--rx', ((e.clientX - r.left) / r.width) * 100 + '%');
    vidro.style.setProperty('--ry', ((e.clientY - r.top) / r.height) * 100 + '%');
  });
});
</script>
</body>
</html>
```

## Versão Angular (valores padrão)

Também em `src/app/efeitos-angular/glass-card/` (compilada e testada com o app).

`glass-card.ts`

```ts
import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-glass-card',
  templateUrl: './glass-card.html',
  styleUrl: './glass-card.css',
})
export class GlassCard {
  private readonly reduzir = window.matchMedia('(prefers-reduced-motion: reduce)');
  private quadro = 0;

  protected readonly rx = signal('30%');
  protected readonly ry = signal('0%');

  /** O reflexo segue o ponteiro sobre o card. */
  protected mover(e: PointerEvent, vidro: HTMLElement): void {
    if (this.reduzir.matches) return;
    cancelAnimationFrame(this.quadro);
    this.quadro = requestAnimationFrame(() => {
      const r = vidro.getBoundingClientRect();
      this.rx.set(((e.clientX - r.left) / r.width) * 100 + '%');
      this.ry.set(((e.clientY - r.top) / r.height) * 100 + '%');
    });
  }
}
```

`glass-card.html`

```html
<section class="vitrine-vidro">
  <div class="formas" aria-hidden="true">
    <span class="forma f1"></span>
    <span class="forma f2"></span>
    <span class="forma f3"></span>
  </div>
  <article #vidro class="vidro" [style.--rx]="rx()" [style.--ry]="ry()" (pointermove)="mover($event, vidro)">
    <p class="vidro__selo">Plano Pro</p>
    <h2>R$ 49<small>/mês</small></h2>
    <p>Tudo o que você precisa para publicar seus projetos.</p>
    <button type="button">Assinar</button>
  </article>
</section>
```

`glass-card.css`

```css
:host {
  display: grid;
  place-items: center;
  gap: 24px;
}

.vitrine-vidro {
  position: relative;
  display: grid;
  place-items: center;
  width: min(100%, 640px);
  aspect-ratio: 16 / 10;
  border-radius: 20px;
  overflow: hidden;
  background: #120f24;
}

/* Formas coloridas atrás do vidro (sem elas, o vidro não aparece) */
.forma { position: absolute; border-radius: 50%; animation: flutuar 9s ease-in-out infinite alternate; }
.f1 { width: 42%; aspect-ratio: 1; left: 8%; top: 6%; background: radial-gradient(circle at 30% 30%, #ff8ad8, #c81a8c); }
.f2 { width: 34%; aspect-ratio: 1; right: 10%; bottom: 4%; background: radial-gradient(circle at 30% 30%, #93c5fd, #2563eb); animation-delay: -3s; }
.f3 { width: 22%; aspect-ratio: 1; right: 30%; top: 14%; background: radial-gradient(circle at 30% 30%, #ddd6fe, #7c4ddb); animation-delay: -6s; }
@keyframes flutuar {
  to { translate: 6% 8%; scale: 1.08; }
}

/* O vidro: fundo translúcido + backdrop-filter + borda clara + sombra */
.vidro {
  --rx: 30%;
  --ry: 0%;
  position: relative;
  display: grid;
  gap: 8px;
  width: min(78%, 320px);
  padding: 28px;
  border: 1px solid rgb(255 255 255 / 0.3);
  border-radius: 22px;
  background: rgb(255 255 255 / 0.15);
  -webkit-backdrop-filter: blur(16px) saturate(1.6);
  backdrop-filter: blur(16px) saturate(1.6);
  box-shadow: 0 20px 50px rgb(0 0 0 / 0.25), inset 0 1px 0 rgb(255 255 255 / 0.3);
  color: #ffffff;
  overflow: hidden;
}
/* reflexo que acompanha o ponteiro */
.vidro::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at var(--rx) var(--ry), rgb(255 255 255 / 0.35), transparent 45%);
  pointer-events: none;
  transition: opacity 300ms ease;
}
.vidro > * { position: relative; margin: 0; }
.vidro__selo { font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; opacity: 0.85; }
.vidro h2 { font-size: clamp(2rem, 8vw, 3rem); line-height: 1; }
.vidro h2 small { font-size: 0.4em; font-weight: 400; }
.vidro p { text-shadow: 0 1px 8px rgb(0 0 0 / 0.25); }
.vidro button {
  justify-self: start;
  margin-top: 6px;
  padding: 10px 20px;
  border: 1px solid rgb(255 255 255 / 0.5);
  border-radius: 999px;
  background: rgb(255 255 255 / 0.2);
  color: inherit;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}
.vidro button:focus-visible { outline: 2px solid #fff; outline-offset: 3px; }

/* Sem backdrop-filter: vidro mais opaco para manter a leitura */
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .vidro { background: rgb(255 255 255 / 0.75); color: #1d1530; }
}

@media (prefers-reduced-motion: reduce) {
  .forma { animation: none; }
}
```
