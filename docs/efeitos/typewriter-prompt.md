# Prompt digitado até o "pronto" (`typewriter-prompt`)

> Gerado a partir de `src/app/core/efeitos/kits/typewriter-prompt.kit.ts`. Não edite à mão: rode `npm run docs:efeitos`.

Um campo de prompt é digitado letra por letra com cursor piscando; o botão vira "gerando", uma barra enche de 0 a 100% e um selo "PRONTO" carimba o resultado.

| Campo | Valor |
|---|---|
| Nome técnico | Typewriter Prompt → Progress → Stamp |
| Categoria | 13 · Componentes e dados › Progresso e estados |
| Nível | Intermediário |
| Tecnologias | HTML, CSS, JavaScript |
| Dependências | nenhuma |
| Interação | Automático, Clique |
| Status | validado em 2026-11-17 |
| Tags | typewriter, máquina de escrever, prompt, ia, progresso, loading, selo, carimbo, referência em vídeo |

## Objetivo visual

Mostrar um processo (gerar, enviar, publicar) como uma pequena história: pedido → trabalho → resultado.

## Aplicações

- Demonstração de produto de IA
- Onboarding e tutoriais
- Vídeos de divulgação gravados da tela

## Como funciona

### Nível 1 — Iniciante

- Um texto vai sendo escrito sozinho, letra por letra, como numa máquina de escrever.
- Quando termina, o botão muda para "Gerando…" e uma barrinha enche até 100%.
- No final, aparece um carimbo "PRONTO" batendo no cartão.

### Nível 2 — Intermediário

- A digitação é um setTimeout encadeado: a cada intervalo, o texto visível ganha mais uma letra (slice(0, n)). O cursor é um ::after com animação de piscar (steps).
- Ao terminar de digitar, o botão muda de texto e de estado (data-estado="gerando") e começa a contagem: requestAnimationFrame calcula o progresso pelo tempo decorrido.
- A barra usa scaleX(progresso) e o número mostra o mesmo valor arredondado.
- No fim, o selo "PRONTO" entra com uma animação de carimbo: começa grande e girado e "bate" no lugar com um leve tremor.

### Nível 3 — Avançado

- setTimeout encadeado (e não setInterval) facilita variar o ritmo — por exemplo, pausas maiores depois de vírgulas.
- data-estado no botão concentra os estilos de cada fase no CSS; o JS só troca o valor.
- steps(1) no cursor faz ele piscar "seco", como num terminal, em vez de esmaecer.
- A animação de carimbo passa do ponto (scale 0.92) antes de assentar: a curva elástica dá a sensação de impacto.

### Glossário do código

| Termo | O que faz |
|---|---|
| `slice(0` | Pega as primeiras n letras do texto: a digitação. |
| `data-estado` | Fase atual do botão (digitando, gerando, pronto). |
| `scaleX(var(--p, 0))` | A barra enche conforme o progresso. |
| `role="status"` | Anuncia "Gerando" e "Pronto" ao leitor de tela. |

## Parâmetros

| Controle | Tipo | Padrão | Faixa / opções |
|---|---|---|---|
| tempo por letra | range | 45ms | 20–120ms (passo 5) |
| tempo gerando | range | 2000ms | 1000–4000ms (passo 250) |
| cor de destaque | seleção | #ff6a1a | Laranja, Lilás, Ciano |

## Outra forma de fazer

Com GSAP: TextPlugin para digitar e uma timeline com três etapas (digitar, progresso, selo) — fácil de repetir, pausar e sincronizar com áudio.

## Compatibilidade

requestAnimationFrame, setTimeout e animações CSS: todos os navegadores atuais.

## Responsividade

O cartão usa largura máxima e o texto do prompt quebra em várias linhas no celular.

## Acessibilidade

O texto completo do prompt está no aria-label do campo; o status (gerando / pronto) é anunciado por role="status". Com prefers-reduced-motion o texto aparece inteiro e a barra pula para 100%.

## Performance

Uma troca de texto por letra e um transform por quadro durante o progresso. Desprezível.

## Limitações

- É uma simulação: num produto real, ligue a barra ao progresso verdadeiro do pedido.

## Referências

- [MDN — setTimeout()](https://developer.mozilla.org/en-US/docs/Web/API/Window/setTimeout)
- [MDN — ARIA: status role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/status_role)
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
<title>Prompt digitado até o pronto · Kalixto Creative Lab</title>
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

.painel-ia {
  position: relative;
  display: grid;
  gap: 16px;
  width: min(100%, 560px);
  padding: 24px;
  border: 1px solid rgb(255 255 255 / 0.1);
  border-radius: 16px;
  background: #16110d;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
}
.campo { min-height: 3.2em; margin: 0; font-size: 18px; color: #f4f2ff; }
/* cursor piscando */
.digitado::after {
  content: '';
  display: inline-block;
  width: 0.55em;
  height: 1.1em;
  margin-left: 2px;
  vertical-align: -0.15em;
  background: #ff6a1a;
  animation: piscar 1s steps(1) infinite;
}
@keyframes piscar { 50% { opacity: 0; } }

.rodape { display: flex; align-items: center; gap: 12px; }
.gerar {
  padding: 8px 14px;
  border: 0;
  border-radius: 999px;
  background: #ff6a1a;
  color: #160b05;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
}
.gerar[data-estado='digitando'] { opacity: 0.45; }
.gerar[data-estado='gerando'] { animation: respirar 800ms ease-in-out infinite alternate; }
@keyframes respirar { to { opacity: 0.6; } }
.progresso { flex: 1; height: 6px; border-radius: 999px; background: rgb(255 255 255 / 0.1); overflow: hidden; }
.barra { display: block; height: 100%; background: #ff6a1a; transform: scaleX(var(--p, 0)); transform-origin: left center; }
.porcento { min-width: 4ch; color: #ff6a1a; font-variant-numeric: tabular-nums; text-align: right; }

/* Selo: começa grande e girado e "bate" no lugar */
.selo {
  position: absolute;
  right: 20px;
  top: -14px;
  padding: 6px 14px;
  border: 2px solid #ff6a1a;
  border-radius: 8px;
  background: #16110d;
  color: #ff6a1a;
  font-weight: 800;
  letter-spacing: 0.08em;
  rotate: -8deg;
  opacity: 0;
}
.painel-ia.is-pronto .selo { animation: carimbar 450ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
@keyframes carimbar {
  0% { opacity: 0; scale: 2.2; rotate: -24deg; }
  70% { opacity: 1; scale: 0.92; rotate: -6deg; }
  100% { opacity: 1; scale: 1; rotate: -8deg; }
}
.status { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }

.repetir {
  padding: 8px 16px;
  border: 1px solid #3a3456;
  border-radius: 999px;
  background: transparent;
  color: #c9c3ea;
  font: inherit;
  cursor: pointer;
}

@media (prefers-reduced-motion: reduce) {
  .digitado::after, .gerar[data-estado='gerando'] { animation: none; }
  .painel-ia.is-pronto .selo { animation: none; opacity: 1; }
}
</style>
</head>
<body>
<section class="painel-ia">
  <p class="campo" aria-label="Crie uma página de vendas para um lançamento imobiliário"><span class="digitado" aria-hidden="true"></span></p>
  <div class="rodape">
    <button class="gerar" type="button" data-estado="digitando" disabled>Escrevendo…</button>
    <div class="progresso" aria-hidden="true"><span class="barra"></span></div>
    <span class="porcento" aria-hidden="true">0%</span>
  </div>
  <span class="selo" aria-hidden="true">✓ PRONTO</span>
  <p class="status" role="status"></p>
</section>
<button class="repetir" type="button">Repetir</button>
<script>
const VELOCIDADE = 45;
const GERACAO = 2000;
const reduzir = matchMedia('(prefers-reduced-motion: reduce)');
const painel = document.querySelector('.painel-ia');
const campo = painel.querySelector('.campo');
const digitado = painel.querySelector('.digitado');
const botao = painel.querySelector('.gerar');
const porcento = painel.querySelector('.porcento');
const status = painel.querySelector('.status');
const texto = campo.getAttribute('aria-label');
let temporizador = 0;
let quadro = 0;

function estado(nome, rotulo) {
  botao.dataset.estado = nome;
  botao.textContent = rotulo;
}

function progresso(p) {
  painel.style.setProperty('--p', p);
  porcento.textContent = Math.round(p * 100) + '%';
}

function comecar() {
  clearTimeout(temporizador);
  cancelAnimationFrame(quadro);
  painel.classList.remove('is-pronto');
  status.textContent = '';
  progresso(0);
  estado('digitando', 'Escrevendo…');
  if (reduzir.matches) {
    digitado.textContent = texto;
    return gerar();
  }
  let n = 0;
  const digitar = () => {
    digitado.textContent = texto.slice(0, ++n);
    if (n < texto.length) temporizador = setTimeout(digitar, VELOCIDADE);
    else temporizador = setTimeout(gerar, 400);
  };
  digitar();
}

function gerar() {
  estado('gerando', 'Gerando…');
  status.textContent = 'Gerando';
  const inicio = performance.now();
  const passo = (agora) => {
    const p = reduzir.matches ? 1 : Math.min(1, (agora - inicio) / GERACAO);
    progresso(p);
    if (p < 1) quadro = requestAnimationFrame(passo);
    else {
      estado('pronto', 'Pronto');
      painel.classList.add('is-pronto');
      status.textContent = 'Pronto';
    }
  };
  quadro = requestAnimationFrame(passo);
}

comecar();
document.querySelector('.repetir').addEventListener('click', comecar);
</script>
</body>
</html>
```

## Versão Angular (valores padrão)

Também em `src/app/efeitos-angular/typewriter-prompt/` (compilada e testada com o app).

`typewriter-prompt.ts`

```ts
import { Component, DestroyRef, afterNextRender, inject, signal } from '@angular/core';

type Estado = 'digitando' | 'gerando' | 'pronto';

@Component({
  selector: 'app-typewriter-prompt',
  templateUrl: './typewriter-prompt.html',
  styleUrl: './typewriter-prompt.css',
})
export class TypewriterPrompt {
  protected readonly texto = 'Crie uma página de vendas para um lançamento imobiliário';
  private readonly velocidade = 45;
  private readonly geracao = 2000;
  private readonly reduzir = window.matchMedia('(prefers-reduced-motion: reduce)');
  private temporizador = 0;
  private quadro = 0;

  protected readonly digitado = signal('');
  protected readonly estado = signal<Estado>('digitando');
  protected readonly p = signal(0);

  protected readonly rotulos: Record<Estado, string> = { digitando: 'Escrevendo…', gerando: 'Gerando…', pronto: 'Pronto' };

  constructor() {
    afterNextRender(() => this.comecar());
    inject(DestroyRef).onDestroy(() => {
      clearTimeout(this.temporizador);
      cancelAnimationFrame(this.quadro);
    });
  }

  protected comecar(): void {
    clearTimeout(this.temporizador);
    cancelAnimationFrame(this.quadro);
    this.p.set(0);
    this.estado.set('digitando');
    if (this.reduzir.matches) {
      this.digitado.set(this.texto);
      return this.gerar();
    }
    let n = 0;
    const digitar = () => {
      this.digitado.set(this.texto.slice(0, ++n));
      this.temporizador = window.setTimeout(n < this.texto.length ? digitar : () => this.gerar(), n < this.texto.length ? this.velocidade : 400);
    };
    digitar();
  }

  private gerar(): void {
    this.estado.set('gerando');
    const inicio = performance.now();
    const passo = (agora: number) => {
      const p = this.reduzir.matches ? 1 : Math.min(1, (agora - inicio) / this.geracao);
      this.p.set(p);
      if (p < 1) this.quadro = requestAnimationFrame(passo);
      else this.estado.set('pronto');
    };
    this.quadro = requestAnimationFrame(passo);
  }
}
```

`typewriter-prompt.html`

```html
<section class="painel-ia" [class.is-pronto]="estado() === 'pronto'" [style.--p]="p()">
  <p class="campo" [attr.aria-label]="texto"><span class="digitado" aria-hidden="true">{{ digitado() }}</span></p>
  <div class="rodape">
    <button class="gerar" type="button" [attr.data-estado]="estado()" [disabled]="estado() === 'digitando'">
      {{ rotulos[estado()] }}
    </button>
    <div class="progresso" aria-hidden="true"><span class="barra"></span></div>
    <span class="porcento" aria-hidden="true">{{ (p() * 100).toFixed(0) }}%</span>
  </div>
  <span class="selo" aria-hidden="true">✓ PRONTO</span>
  <p class="status" role="status">{{ estado() === 'digitando' ? '' : rotulos[estado()] }}</p>
</section>
<button class="repetir" type="button" (click)="comecar()">Repetir</button>
```

`typewriter-prompt.css`

```css
:host {
  display: grid;
  place-items: center;
  gap: 24px;
}

.painel-ia {
  position: relative;
  display: grid;
  gap: 16px;
  width: min(100%, 560px);
  padding: 24px;
  border: 1px solid rgb(255 255 255 / 0.1);
  border-radius: 16px;
  background: #16110d;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
}
.campo { min-height: 3.2em; margin: 0; font-size: 18px; color: #f4f2ff; }
/* cursor piscando */
.digitado::after {
  content: '';
  display: inline-block;
  width: 0.55em;
  height: 1.1em;
  margin-left: 2px;
  vertical-align: -0.15em;
  background: #ff6a1a;
  animation: piscar 1s steps(1) infinite;
}
@keyframes piscar { 50% { opacity: 0; } }

.rodape { display: flex; align-items: center; gap: 12px; }
.gerar {
  padding: 8px 14px;
  border: 0;
  border-radius: 999px;
  background: #ff6a1a;
  color: #160b05;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
}
.gerar[data-estado='digitando'] { opacity: 0.45; }
.gerar[data-estado='gerando'] { animation: respirar 800ms ease-in-out infinite alternate; }
@keyframes respirar { to { opacity: 0.6; } }
.progresso { flex: 1; height: 6px; border-radius: 999px; background: rgb(255 255 255 / 0.1); overflow: hidden; }
.barra { display: block; height: 100%; background: #ff6a1a; transform: scaleX(var(--p, 0)); transform-origin: left center; }
.porcento { min-width: 4ch; color: #ff6a1a; font-variant-numeric: tabular-nums; text-align: right; }

/* Selo: começa grande e girado e "bate" no lugar */
.selo {
  position: absolute;
  right: 20px;
  top: -14px;
  padding: 6px 14px;
  border: 2px solid #ff6a1a;
  border-radius: 8px;
  background: #16110d;
  color: #ff6a1a;
  font-weight: 800;
  letter-spacing: 0.08em;
  rotate: -8deg;
  opacity: 0;
}
.painel-ia.is-pronto .selo { animation: carimbar 450ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
@keyframes carimbar {
  0% { opacity: 0; scale: 2.2; rotate: -24deg; }
  70% { opacity: 1; scale: 0.92; rotate: -6deg; }
  100% { opacity: 1; scale: 1; rotate: -8deg; }
}
.status { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }

.repetir {
  padding: 8px 16px;
  border: 1px solid #3a3456;
  border-radius: 999px;
  background: transparent;
  color: #c9c3ea;
  font: inherit;
  cursor: pointer;
}

@media (prefers-reduced-motion: reduce) {
  .digitado::after, .gerar[data-estado='gerando'] { animation: none; }
  .painel-ia.is-pronto .selo { animation: none; opacity: 1; }
}
```
