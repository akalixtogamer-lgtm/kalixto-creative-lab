# Legenda cinética (`kinetic-captions`)

> Gerado a partir de `src/app/core/efeitos/kits/kinetic-captions.kit.ts`. Não edite à mão: rode `npm run docs:efeitos`.

As palavras entram uma por vez, no ritmo da fala, e a palavra "da vez" acende com a cor de destaque — o estilo de legenda dos Reels.

| Campo | Valor |
|---|---|
| Nome técnico | Kinetic Captions (legenda palavra por palavra) |
| Categoria | 04 · Tipografia e texto › Legendas e texto falado |
| Nível | Iniciante |
| Tecnologias | HTML, CSS, JavaScript |
| Dependências | nenhuma |
| Interação | Automático, Clique |
| Status | validado em 2026-11-17 |
| Tags | legenda, caption, reels, kinetic typography, palavra por palavra, karaokê, referência em vídeo |

## Objetivo visual

Prender o olhar no texto e dar ritmo de fala a uma frase, como nas legendas de vídeos curtos.

## Aplicações

- Heros com frase de impacto
- Vídeos e Reels gravados da tela
- Apresentações e manifestos

## Como funciona

### Nível 1 — Iniciante

- A frase é cortada em palavras, e cada palavra vira um pedacinho separado.
- As palavras aparecem uma depois da outra, como se alguém estivesse falando.
- A palavra que acabou de aparecer fica colorida por um instante e depois volta ao branco.

### Nível 2 — Intermediário

- O JavaScript só divide a frase em palavras (um <span> para cada) e grava a posição de cada uma na variável --i.
- Toda palavra tem duas animações com o mesmo atraso: calc(var(--i) * ritmo). A primeira faz a palavra entrar; a segunda pinta a palavra com a cor de destaque durante uma "batida".
- A animação de destaque não tem fill-mode: quando ela termina, a cor volta ao branco. Por isso só uma palavra fica acesa por vez.
- O aria-label no parágrafo guarda a frase inteira; os <span> são aria-hidden para o leitor de tela não soletrar palavra por palavra.

### Nível 3 — Avançado

- Duas animações no mesmo elemento, separadas por vírgula, compartilham o atraso calculado: entrada e destaque ficam sincronizadas sem JavaScript de tempo.
- steps(1) no destaque troca a cor de uma vez (sem transição gradual), como o "corte seco" das legendas de vídeo.
- Para legendas reais, gere --i a partir dos tempos de uma transcrição (WebVTT) e use animation-delay em segundos.
- No Angular, o @for externo com a chave ciclo() recria o parágrafo inteiro e reinicia todas as animações de uma vez.

### Glossário do código

| Termo | O que faz |
|---|---|
| `calc(var(--i) *` | Atraso de cada palavra: a posição dela vezes o ritmo. |
| `steps(1)` | Troca a cor de uma vez, sem degradê entre os estados. |
| `aria-label` | Frase completa para o leitor de tela. |
| `replaceChildren` | Troca todos os filhos do parágrafo de uma vez (recria as palavras). |

## Parâmetros

| Controle | Tipo | Padrão | Faixa / opções |
|---|---|---|---|
| ritmo (por palavra) | range | 260ms | 120–600ms (passo 20) |
| cor de destaque | seleção | #ff2e3e | Vermelho, Lima, Magenta, Ciano |
| entrada da palavra | seleção | pop | pop (cresce), subir |

## Outra forma de fazer

Com GSAP: SplitText divide as palavras e uma timeline com stagger controla entrada e destaque — útil para sincronizar com um áudio real.

## Compatibilidade

Animações CSS e variáveis em calc(): todos os navegadores atuais.

## Responsividade

O tamanho da fonte usa clamp() e a largura é limitada em ch, então a frase quebra em poucas linhas no celular.

## Acessibilidade

A frase completa fica no aria-label. Com prefers-reduced-motion, todas as palavras aparecem paradas, sem destaque piscando.

## Performance

Só opacity, transform e color são animados; não há JavaScript rodando durante a animação.

## Limitações

- O ritmo é fixo por palavra: palavras longas e curtas ganham o mesmo tempo. Para sincronizar com áudio, use os tempos reais de cada palavra em --i.

## Referências

- [MDN — animation](https://developer.mozilla.org/en-US/docs/Web/CSS/animation)
- [MDN — animation-delay](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-delay)
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
<title>Legenda cinética · Kalixto Creative Lab</title>
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

.legenda {
  margin: 0;
  max-width: 14ch;
  font-size: clamp(1.8rem, 7vw, 3.2rem);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.02em;
  text-align: center;
  text-shadow: 0 2px 12px rgb(0 0 0 / 0.6);
}

/* Cada palavra: entra e acende no seu tempo (--i = posição na frase) */
.palavra {
  display: inline-block;
  margin-inline: 0.12em;
  animation:
    entrar 320ms cubic-bezier(0.34, 1.56, 0.64, 1) calc(var(--i) * 260ms) both,
    destaque 260ms steps(1) calc(var(--i) * 260ms);
}
@keyframes entrar {
  from { opacity: 0; transform: scale(0.55) translateY(0.25em); }
}
/* sem fill-mode: ao terminar, a cor volta ao normal */
@keyframes destaque {
  0%, 100% { color: #ff2e3e; }
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

@media (prefers-reduced-motion: reduce) {
  .palavra { animation: none; }
}
</style>
</head>
<body>
<p class="legenda" aria-label="A diferença entre o designer e o criador está no movimento"></p>
<button class="repetir" type="button">Repetir</button>
<script>
const legenda = document.querySelector('.legenda');
const frase = legenda.getAttribute('aria-label');

// Um <span> por palavra; recriar os spans reinicia as animações
function montar() {
  legenda.replaceChildren(
    ...frase.split(' ').map((texto, i) => {
      const palavra = document.createElement('span');
      palavra.className = 'palavra';
      palavra.textContent = texto;
      palavra.setAttribute('aria-hidden', 'true');
      palavra.style.setProperty('--i', i);
      return palavra;
    }),
  );
}

montar();
document.querySelector('.repetir').addEventListener('click', montar);
</script>
</body>
</html>
```

## Versão Angular (valores padrão)

Também em `src/app/efeitos-angular/kinetic-captions/` (compilada e testada com o app).

`kinetic-captions.ts`

```ts
import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-kinetic-captions',
  templateUrl: './kinetic-captions.html',
  styleUrl: './kinetic-captions.css',
})
export class KineticCaptions {
  protected readonly frase = 'A diferença entre o designer e o criador está no movimento';
  protected readonly palavras = this.frase.split(' ');

  /** Muda a cada clique em Repetir; o @for recria as palavras e a animação recomeça. */
  protected readonly ciclo = signal(0);

  protected repetir(): void {
    this.ciclo.update((n) => n + 1);
  }
}
```

`kinetic-captions.html`

```html
@for (c of [ciclo()]; track c) {
  <p class="legenda" [attr.aria-label]="frase">
    @for (p of palavras; track $index) {
      <span class="palavra" aria-hidden="true" [style.--i]="$index">{{ p }}</span>
    }
  </p>
}
<button class="repetir" type="button" (click)="repetir()">Repetir</button>
```

`kinetic-captions.css`

```css
:host {
  display: grid;
  place-items: center;
  gap: 24px;
}

.legenda {
  margin: 0;
  max-width: 14ch;
  font-size: clamp(1.8rem, 7vw, 3.2rem);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.02em;
  text-align: center;
  text-shadow: 0 2px 12px rgb(0 0 0 / 0.6);
}

/* Cada palavra: entra e acende no seu tempo (--i = posição na frase) */
.palavra {
  display: inline-block;
  margin-inline: 0.12em;
  animation:
    entrar 320ms cubic-bezier(0.34, 1.56, 0.64, 1) calc(var(--i) * 260ms) both,
    destaque 260ms steps(1) calc(var(--i) * 260ms);
}
@keyframes entrar {
  from { opacity: 0; transform: scale(0.55) translateY(0.25em); }
}
/* sem fill-mode: ao terminar, a cor volta ao normal */
@keyframes destaque {
  0%, 100% { color: #ff2e3e; }
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

@media (prefers-reduced-motion: reduce) {
  .palavra { animation: none; }
}
```
