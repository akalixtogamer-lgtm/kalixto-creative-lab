# Troca de mundo com revelação circular (`theme-wipe`)

> Gerado a partir de `src/app/core/efeitos/kits/theme-wipe.kit.ts`. Não edite à mão: rode `npm run docs:efeitos`.

Ao escolher uma cor, o novo "mundo" (fundo, texto e figura) cresce em círculo a partir do botão e cobre o anterior — um estilo, vários cenários.

| Campo | Valor |
|---|---|
| Nome técnico | Theme Switch with Circular Wipe (clip-path) |
| Categoria | 02 · Entradas, saídas e transições › Troca de tema e de cenário |
| Nível | Intermediário |
| Tecnologias | HTML, CSS, JavaScript |
| Dependências | nenhuma |
| Interação | Clique, Teclado |
| Status | validado em 2026-11-17 |
| Tags | tema, theme switch, wipe, clip-path, circle, revelação, coleção, referência em vídeo |

## Objetivo visual

Mostrar o mesmo produto em vários universos visuais, com uma troca que parece uma explosão de cor saindo do botão.

## Aplicações

- Vitrine de coleções e variações de produto
- Troca de tema claro/escuro
- Heros de moda e e-commerce

## Como funciona

### Nível 1 — Iniciante

- A vitrine mostra um "mundo": uma cor de fundo, um título grande e uma figura.
- Ao clicar numa cor, o mundo novo aparece dentro de um círculo pequenininho que cresce até cobrir tudo.
- Quando o círculo termina de crescer, o mundo antigo é jogado fora.

### Nível 2 — Intermediário

- Cada mundo é uma camada absoluta que ocupa a vitrine inteira. Trocar de mundo = colocar uma camada nova por cima.
- A camada nova nasce com clip-path: circle(0% at x y) — invisível — e a animação abre o círculo até 150%, que cobre até os cantos.
- x e y vêm do centro do botão clicado (ou do meio da vitrine), gravados nas variáveis --x e --y da camada.
- No fim da animação (animationend), as camadas antigas saem do DOM: a vitrine nunca acumula mais de duas.

### Nível 3 — Avançado

- circle(150% at x y): o raio em % é relativo à diagonal "normalizada" da caixa, então 150% cobre os cantos mesmo partindo de uma borda.
- Variáveis CSS dentro de @keyframes são resolvidas no elemento animado: cada camada abre a partir do seu próprio --x/--y.
- Começar o círculo fora da vitrine (no botão abaixo dela) é válido: o clip-path aceita coordenadas negativas ou maiores que a caixa.
- No Angular, a lista de mundos é um signal; (animationend) filtra as camadas antigas pelo id, mantendo a que acabou de entrar.

### Glossário do código

| Termo | O que faz |
|---|---|
| `clip-path: circle(0% at var(--x) var(--y))` | Começo da revelação: um círculo de raio zero no ponto escolhido. |
| `animationend` | Evento disparado quando a revelação termina — hora de remover os mundos antigos. |
| `aria-live` | Anuncia o nome do mundo novo para o leitor de tela. |
| `aria-pressed` | Marca qual botão de cor está ativo. |

## Parâmetros

| Controle | Tipo | Padrão | Faixa / opções |
|---|---|---|---|
| duração da troca | range | 800ms | 300–1500ms (passo 50) |
| curva (easing) | seleção | cubic-bezier(0.22, 1, 0.36, 1) | suave (expo out), elástico (back out), ease, ease-in-out, linear |
| origem do círculo | seleção | botao | botão clicado, centro da vitrine |

## Outra forma de fazer

A View Transitions API (document.startViewTransition) faz o mesmo trocando o DOM de uma vez e animando ::view-transition-new(root) com clip-path — ótimo para trocar o tema da página inteira.

## Compatibilidade

clip-path: circle() animado e variáveis dentro de @keyframes: todos os navegadores atuais.

## Responsividade

A figura e o título usam porcentagens e clamp(); o círculo de 150% cobre qualquer proporção de tela.

## Acessibilidade

Os botões de cor têm nome ("Mundo Lima"…) e aria-pressed. O nome do mundo atual é anunciado numa região aria-live. Com prefers-reduced-motion, a troca é instantânea.

## Performance

clip-path animado é composto pelo navegador sem refazer o layout. Só há duas camadas ao mesmo tempo.

## Limitações

- Cliques muito rápidos empilham várias camadas animando; todas são limpas quando a última termina.
- Conteúdo interativo dentro das camadas é recriado a cada troca — guarde estado fora delas.

## Referências

- [MDN — clip-path](https://developer.mozilla.org/en-US/docs/Web/CSS/clip-path)
- [MDN — View Transition API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API)
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
<title>Troca de mundo com revelação circular · Kalixto Creative Lab</title>
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

.vitrine {
  position: relative;
  width: min(100%, 640px);
  aspect-ratio: 16 / 10;
  border-radius: 20px;
  overflow: hidden;
}

/* Um mundo: fundo, título enorme e uma figura na frente */
.mundo {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: var(--fundo);
  color: var(--tinta);
}
.mundo .titulo {
  margin: 0;
  font: 900 clamp(2rem, 11vw, 5rem) / 0.9 system-ui, sans-serif;
  letter-spacing: -0.04em;
  text-align: center;
  text-transform: uppercase;
}
.mundo .figura {
  position: absolute;
  bottom: 0;
  width: 30%;
  aspect-ratio: 3 / 4;
  border-radius: 48% 48% 12px 12px;
  background: radial-gradient(circle at 35% 30%, rgb(255 255 255 / 0.55), transparent 40%), var(--tinta);
  opacity: 0.92;
}

/* A camada nova abre em círculo a partir de (--x, --y) */
.mundo.entrando {
  animation: revelar 800ms cubic-bezier(0.22, 1, 0.36, 1) both;
}
@keyframes revelar {
  from { clip-path: circle(0% at var(--x) var(--y)); }
  to { clip-path: circle(150% at var(--x) var(--y)); }
}

.amostras { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
.amostra {
  padding: 8px 14px 8px 10px;
  border: 1px solid #3a3456;
  border-radius: 999px;
  background: transparent;
  color: #f4f2ff;
  font: inherit;
  cursor: pointer;
}
.amostra::before {
  content: '';
  display: inline-block;
  width: 12px;
  height: 12px;
  margin-right: 8px;
  border-radius: 50%;
  background: var(--cor);
  vertical-align: -1px;
}
.amostra[aria-pressed='true'] { border-color: var(--cor); }
.amostra:focus-visible { outline: 2px solid #22e3ff; outline-offset: 3px; }
.anuncio { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }

@media (prefers-reduced-motion: reduce) {
  .mundo.entrando { animation: none; }
}
</style>
</head>
<body>
<section class="vitrine" aria-label="Vitrine com quatro mundos"></section>
<div class="amostras" role="group" aria-label="Escolher mundo">
  <button class="amostra" type="button" style="--cor: #c6ff3d" aria-pressed="true">Mundo Lima</button>
  <button class="amostra" type="button" style="--cor: #ff5a1f" aria-pressed="false">Mundo Fogo</button>
  <button class="amostra" type="button" style="--cor: #bfe3ff" aria-pressed="false">Mundo Gelo</button>
  <button class="amostra" type="button" style="--cor: #2a1f6b" aria-pressed="false">Mundo Noite</button>
</div>
<p class="anuncio" aria-live="polite"></p>
<script>
const TEMAS = [{"nome":"Lima","fundo":"#c6ff3d","tinta":"#0b0a14"},{"nome":"Fogo","fundo":"#ff5a1f","tinta":"#1a0800"},{"nome":"Gelo","fundo":"#bfe3ff","tinta":"#0a2540"},{"nome":"Noite","fundo":"#2a1f6b","tinta":"#f4f2ff"}];
const vitrine = document.querySelector('.vitrine');
const anuncio = document.querySelector('.anuncio');
const botoes = document.querySelectorAll('.amostra');
const reduzir = matchMedia('(prefers-reduced-motion: reduce)');

function criarMundo(tema) {
  const mundo = document.createElement('div');
  mundo.className = 'mundo';
  mundo.style.setProperty('--fundo', tema.fundo);
  mundo.style.setProperty('--tinta', tema.tinta);
  mundo.innerHTML = '<p class="titulo">Troque<br>o visual</p><span class="figura"></span>';
  return mundo;
}

vitrine.append(criarMundo(TEMAS[0]));

botoes.forEach((botao, i) => {
  botao.addEventListener('click', () => {
    const novo = criarMundo(TEMAS[i]);
    // o círculo nasce no centro do botão (pode estar fora da vitrine)
    const v = vitrine.getBoundingClientRect();
    const b = botao.getBoundingClientRect();
    novo.style.setProperty('--x', b.left + b.width / 2 - v.left + 'px');
    novo.style.setProperty('--y', b.top + b.height / 2 - v.top + 'px');
    novo.classList.add('entrando');

    const antigos = [...vitrine.children];
    vitrine.append(novo);
    const limpar = () => antigos.forEach((m) => m.remove());
    if (reduzir.matches) limpar();
    else novo.addEventListener('animationend', limpar, { once: true });

    botoes.forEach((b, j) => b.setAttribute('aria-pressed', String(i === j)));
    anuncio.textContent = 'Mundo ' + TEMAS[i].nome;
  });
});
</script>
</body>
</html>
```

## Versão Angular (valores padrão)

Também em `src/app/efeitos-angular/theme-wipe/` (compilada e testada com o app).

`theme-wipe.ts`

```ts
import { Component, ElementRef, signal, viewChild } from '@angular/core';

interface Tema {
  nome: string;
  fundo: string;
  tinta: string;
}

/** Uma camada da vitrine: um tema e o ponto onde o círculo nasce. */
interface Mundo {
  id: number;
  tema: Tema;
  x: string;
  y: string;
  entrando: boolean;
}

@Component({
  selector: 'app-theme-wipe',
  templateUrl: './theme-wipe.html',
  styleUrl: './theme-wipe.css',
})
export class ThemeWipe {
  protected readonly temas: Tema[] = [
    {
      nome: 'Lima',
      fundo: '#c6ff3d',
      tinta: '#0b0a14'
    },
    {
      nome: 'Fogo',
      fundo: '#ff5a1f',
      tinta: '#1a0800'
    },
    {
      nome: 'Gelo',
      fundo: '#bfe3ff',
      tinta: '#0a2540'
    },
    {
      nome: 'Noite',
      fundo: '#2a1f6b',
      tinta: '#f4f2ff'
    }
  ];
  private readonly vitrine = viewChild.required<ElementRef<HTMLElement>>('vitrine');
  private readonly reduzir = window.matchMedia('(prefers-reduced-motion: reduce)');
  private proximo = 1;

  protected readonly atual = signal(0);
  protected readonly mundos = signal<Mundo[]>([
    { id: 0, tema: this.temas[0], x: '50%', y: '50%', entrando: false },
  ]);

  protected trocar(i: number, botao: HTMLElement): void {
    const v = this.vitrine().nativeElement.getBoundingClientRect();
    const b = botao.getBoundingClientRect();
    const x = b.left + b.width / 2 - v.left + 'px';
    const y = b.top + b.height / 2 - v.top + 'px';
    const novo: Mundo = { id: this.proximo++, tema: this.temas[i], x, y, entrando: !this.reduzir.matches };
    this.mundos.update((lista) => (novo.entrando ? [...lista, novo] : [novo]));
    this.atual.set(i);
  }

  /** Fim da animação: só a camada que acabou de entrar fica. */
  protected limpar(id: number): void {
    this.mundos.update((lista) => lista.filter((m) => m.id >= id));
  }
}
```

`theme-wipe.html`

```html
<section #vitrine class="vitrine" aria-label="Vitrine com quatro mundos">
  @for (m of mundos(); track m.id) {
    <div
      class="mundo"
      [class.entrando]="m.entrando"
      [style.--fundo]="m.tema.fundo"
      [style.--tinta]="m.tema.tinta"
      [style.--x]="m.x"
      [style.--y]="m.y"
      (animationend)="limpar(m.id)"
    >
      <p class="titulo">Troque<br />o visual</p>
      <span class="figura"></span>
    </div>
  }
</section>
<div class="amostras" role="group" aria-label="Escolher mundo">
  @for (t of temas; track t.nome; let i = $index) {
    <button
      #botao
      class="amostra"
      type="button"
      [style.--cor]="t.fundo"
      [attr.aria-pressed]="atual() === i"
      (click)="trocar(i, botao)"
    >
      Mundo {{ t.nome }}
    </button>
  }
</div>
<p class="anuncio" aria-live="polite">Mundo {{ temas[atual()].nome }}</p>
```

`theme-wipe.css`

```css
:host {
  display: grid;
  place-items: center;
  gap: 24px;
}

.vitrine {
  position: relative;
  width: min(100%, 640px);
  aspect-ratio: 16 / 10;
  border-radius: 20px;
  overflow: hidden;
}

/* Um mundo: fundo, título enorme e uma figura na frente */
.mundo {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: var(--fundo);
  color: var(--tinta);
}
.mundo .titulo {
  margin: 0;
  font: 900 clamp(2rem, 11vw, 5rem) / 0.9 system-ui, sans-serif;
  letter-spacing: -0.04em;
  text-align: center;
  text-transform: uppercase;
}
.mundo .figura {
  position: absolute;
  bottom: 0;
  width: 30%;
  aspect-ratio: 3 / 4;
  border-radius: 48% 48% 12px 12px;
  background: radial-gradient(circle at 35% 30%, rgb(255 255 255 / 0.55), transparent 40%), var(--tinta);
  opacity: 0.92;
}

/* A camada nova abre em círculo a partir de (--x, --y) */
.mundo.entrando {
  animation: revelar 800ms cubic-bezier(0.22, 1, 0.36, 1) both;
}
@keyframes revelar {
  from { clip-path: circle(0% at var(--x) var(--y)); }
  to { clip-path: circle(150% at var(--x) var(--y)); }
}

.amostras { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
.amostra {
  padding: 8px 14px 8px 10px;
  border: 1px solid #3a3456;
  border-radius: 999px;
  background: transparent;
  color: #f4f2ff;
  font: inherit;
  cursor: pointer;
}
.amostra::before {
  content: '';
  display: inline-block;
  width: 12px;
  height: 12px;
  margin-right: 8px;
  border-radius: 50%;
  background: var(--cor);
  vertical-align: -1px;
}
.amostra[aria-pressed='true'] { border-color: var(--cor); }
.amostra:focus-visible { outline: 2px solid #22e3ff; outline-offset: 3px; }
.anuncio { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }

@media (prefers-reduced-motion: reduce) {
  .mundo.entrando { animation: none; }
}
```
