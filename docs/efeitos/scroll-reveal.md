# Revelar ao rolar (`scroll-reveal`)

> Gerado a partir de `src/app/core/efeitos/kits/scroll-reveal.kit.ts`. Não edite à mão: rode `npm run docs:efeitos`.

Os elementos aparecem quando entram na área visível da página, um depois do outro.

| Campo | Valor |
|---|---|
| Nome técnico | Scroll Reveal (Intersection Observer) |
| Categoria | 03 · Scroll e parallax › Entradas por rolagem |
| Nível | Iniciante |
| Tecnologias | HTML, CSS, JavaScript |
| Dependências | nenhuma |
| Interação | Rolagem |
| Status | validado em 2026-11-17 |
| Tags | scroll, reveal, intersection observer, entrada, rolagem, aparecer |

## Objetivo visual

Guiar o olhar pela página e dar ritmo à leitura.

## Aplicações

- Seções de landing pages
- Listas de cards e serviços
- Linhas do tempo

## Como funciona

### Nível 1 — Iniciante

- O navegador avisa quando um card aparece na tela; nessa hora o card ganha uma classe e o CSS faz ele surgir.
- Os cards da mesma linha aparecem um pouco depois do outro, em cascata.
- Você pode escolher se a animação acontece só na primeira vez ou toda vez que o card volta à tela.

### Nível 2 — Intermediário

- IntersectionObserver avisa quando um elemento entra ou sai da área visível — sem ficar escutando cada pixel de rolagem.
- Quando o card entra, o JavaScript coloca a classe is-visivel; o CSS faz a transição de opacidade e posição.
- threshold define quanto do card precisa aparecer para contar como "visível" (0,2 = 20%).
- Cada card recebe --i (sua posição) para o atraso em cascata; no modo "uma vez", o observador para de vigiar o card depois que ele aparece.

### Nível 3 — Avançado

- IntersectionObserver roda fora da thread principal de rolagem; é muito mais barato que ler getBoundingClientRect em cada evento scroll.
- A classe .js no <html> é progressive enhancement: sem JavaScript, nada fica escondido.
- rootMargin (ex.: "0px 0px -10% 0px") antecipa ou atrasa o disparo sem mudar o threshold.
- No Angular, o observador nasce em afterNextRender (só no navegador, compatível com SSR) e é desconectado no DestroyRef.
- transition-delay com calc(var(--i) * intervalo) resolve a cascata no CSS, sem timers no JavaScript.

### Glossário do código

| Termo | O que faz |
|---|---|
| `IntersectionObserver` | API que avisa quando um elemento entra ou sai da área visível. |
| `threshold` | Quanto do elemento precisa estar visível para disparar (0 a 1). |
| `isIntersecting` | true quando o elemento está visível segundo o threshold. |
| `unobserve` | Para de vigiar o elemento (usado no modo "só na primeira vez"). |
| `transition-delay` | Atraso de cada card, calculado pela posição --i. |
| `classList.add('js')` | Marca que o JavaScript está ativo; só então os cards começam escondidos. |

## Parâmetros

| Controle | Tipo | Padrão | Faixa / opções |
|---|---|---|---|
| quanto precisa aparecer | range | 0.2 | 0–1 (passo 0.05) |
| distância | range | 40px | 0–120px (passo 4) |
| duração | range | 700ms | 200–1500ms (passo 50) |
| intervalo entre cards | range | 80ms | 0–300ms (passo 10) |
| animar | seleção | uma | só na primeira vez, toda vez que entrar |
| curva (easing) | seleção | cubic-bezier(0.22, 1, 0.36, 1) | suave (expo out), elástico (back out), ease, ease-in-out, linear |

## Outra forma de fazer

GSAP ScrollTrigger com ScrollTrigger.batch() faz o mesmo e permite atrelar a animação à barra de rolagem (scrub) — veja o kit "Revelar ao rolar com GSAP".

## Compatibilidade

IntersectionObserver funciona em todos os navegadores atuais.

## Responsividade

Funciona em qualquer largura; o grid de cards se reorganiza sozinho.

## Acessibilidade

O conteúdo está no HTML desde o início. Com prefers-reduced-motion, os cards aparecem sem deslocamento. Se o JavaScript falhar, a classe .js nunca é aplicada e tudo fica visível.

## Performance

Nenhum trabalho por quadro de rolagem: o navegador só chama o observador quando a visibilidade muda. Só transform e opacity são animadas.

## Limitações

- Elementos que já estão visíveis ao carregar animam imediatamente.
- No modo "sempre", rolar rápido para cima e para baixo repete muitas animações.

## Referências

- [MDN — Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- [MDN — transition](https://developer.mozilla.org/en-US/docs/Web/CSS/transition)
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
<title>Revelar ao rolar · Kalixto Creative Lab</title>
<style>
/* Página da demonstração (rolável) */
* { box-sizing: border-box; }
html, body { margin: 0; }
body {
  background: #0b0a14;
  color: #f4f2ff;
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.5;
}
.intro, .fim {
  display: grid;
  place-items: center;
  min-height: 70vh;
  padding: 24px;
  color: #c9c3ea;
  text-align: center;
}

.grade {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;
  max-width: 760px;
  margin: 0 auto;
  padding: 24px;
}
.card {
  display: grid;
  place-items: center;
  min-height: 180px;
  border-radius: 16px;
  background: linear-gradient(160deg, #2a1f4d, #161229);
  border: 1px solid #3a3456;
}
.card h2 { margin: 0; font-size: 1.2rem; }

/* O efeito: só esconde se o JavaScript estiver ativo (classe .js no <html>) */
.js .revelar {
  opacity: 0;
  transform: translateY(40px);
  transition:
    opacity 700ms cubic-bezier(0.22, 1, 0.36, 1),
    transform 700ms cubic-bezier(0.22, 1, 0.36, 1);
  transition-delay: calc(var(--i) * 80ms);
}
.js .revelar.is-visivel {
  opacity: 1;
  transform: none;
}

@media (prefers-reduced-motion: reduce) {
  .js .revelar { transform: none; }
}
</style>
</head>
<body>
<section class="intro"><p>Role para baixo ↓</p></section>

<section class="grade">
  <article class="card revelar" style="--i: 0"><h2>Descobrir</h2></article>
  <article class="card revelar" style="--i: 1"><h2>Experimentar</h2></article>
  <article class="card revelar" style="--i: 2"><h2>Entender</h2></article>
  <article class="card revelar" style="--i: 0"><h2>Modificar</h2></article>
  <article class="card revelar" style="--i: 1"><h2>Reutilizar</h2></article>
  <article class="card revelar" style="--i: 2"><h2>Criar</h2></article>
</section>

<section class="fim"><p>Fim da página</p></section>
<script>
document.documentElement.classList.add('js');

const SO_UMA_VEZ = true;
const observador = new IntersectionObserver((entradas) => {
  for (const entrada of entradas) {
    if (entrada.isIntersecting) {
      entrada.target.classList.add('is-visivel');
      if (SO_UMA_VEZ) observador.unobserve(entrada.target); // não precisa mais vigiar
    } else if (!SO_UMA_VEZ) {
      entrada.target.classList.remove('is-visivel');
    }
  }
}, { threshold: 0.2 });

document.querySelectorAll('.revelar').forEach((el) => observador.observe(el));
</script>
</body>
</html>
```

## Versão Angular (valores padrão)

Também em `src/app/efeitos-angular/scroll-reveal/` (compilada e testada com o app).

`scroll-reveal.ts`

```ts
import { Component, DestroyRef, ElementRef, afterNextRender, inject, signal, viewChildren } from '@angular/core';

@Component({
  selector: 'app-scroll-reveal',
  templateUrl: './scroll-reveal.html',
  styleUrl: './scroll-reveal.css',
  host: { class: 'js' },
})
export class ScrollReveal {
  protected readonly cards = ["Descobrir", "Experimentar", "Entender", "Modificar", "Reutilizar", "Criar"];
  private readonly soUmaVez = true;
  private readonly elementos = viewChildren<ElementRef<HTMLElement>>('revelar');
  /** Índices dos cards visíveis. */
  protected readonly visiveis = signal(new Set<number>());

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const observador = new IntersectionObserver((entradas) => {
        for (const entrada of entradas) {
          const i = Number((entrada.target as HTMLElement).dataset['i']);
          if (entrada.isIntersecting) {
            this.visiveis.update((s) => new Set(s).add(i));
            if (this.soUmaVez) observador.unobserve(entrada.target);
          } else if (!this.soUmaVez) {
            this.visiveis.update((s) => {
              const n = new Set(s);
              n.delete(i);
              return n;
            });
          }
        }
      }, { threshold: 0.2 });
      this.elementos().forEach((e) => observador.observe(e.nativeElement));
      destroyRef.onDestroy(() => observador.disconnect());
    });
  }
}
```

`scroll-reveal.html`

```html
<section class="grade">
  @for (c of cards; track c; let i = $index) {
    <article
      #revelar
      class="card revelar"
      [attr.data-i]="i"
      [style.--i]="i % 3"
      [class.is-visivel]="visiveis().has(i)"
    >
      <h2>{{ c }}</h2>
    </article>
  }
</section>
```

`scroll-reveal.css`

```css
:host { display: block; }

.grade {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;
  max-width: 760px;
  margin: 0 auto;
  padding: 24px;
}
.card {
  display: grid;
  place-items: center;
  min-height: 180px;
  border-radius: 16px;
  background: linear-gradient(160deg, #2a1f4d, #161229);
  border: 1px solid #3a3456;
}
.card h2 { margin: 0; font-size: 1.2rem; }

/* O efeito: só esconde se o JavaScript estiver ativo (classe .js no <html>) */
:host(.js) .revelar {
  opacity: 0;
  transform: translateY(40px);
  transition:
    opacity 700ms cubic-bezier(0.22, 1, 0.36, 1),
    transform 700ms cubic-bezier(0.22, 1, 0.36, 1);
  transition-delay: calc(var(--i) * 80ms);
}
:host(.js) .revelar.is-visivel {
  opacity: 1;
  transform: none;
}

@media (prefers-reduced-motion: reduce) {
  :host(.js) .revelar { transform: none; }
}
```
