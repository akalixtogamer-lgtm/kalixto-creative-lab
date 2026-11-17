# Galeria sanfona (`expanding-gallery`)

> Gerado a partir de `src/app/core/efeitos/kits/expanding-gallery.kit.ts`. Não edite à mão: rode `npm run docs:efeitos`.

Faixas de imagem lado a lado; a faixa sob o mouse (ou em foco, ou clicada) se abre e as outras se estreitam, revelando o título dela.

| Campo | Valor |
|---|---|
| Nome técnico | Expanding Panels Gallery (flex-grow) |
| Categoria | 06 · Cards, imagens e galerias › Galerias interativas |
| Nível | Iniciante |
| Tecnologias | HTML, CSS, JavaScript |
| Dependências | nenhuma |
| Interação | Hover, Clique, Teclado, Toque |
| Status | validado em 2026-11-17 |
| Tags | accordion, sanfona, expanding cards, flex-grow, galeria, painéis, tendência 2026 |

## Objetivo visual

Mostrar várias categorias num espaço pequeno, convidando a explorar uma de cada vez.

## Aplicações

- Categorias de produto ou destinos
- Cases de portfólio
- Equipe ou depoimentos

## Como funciona

### Nível 1 — Iniciante

- Cinco faixas coloridas ficam lado a lado, como as dobras de uma sanfona.
- A faixa em que o mouse está se abre e as outras ficam mais finas.
- Clicando numa faixa, ela continua aberta mesmo quando o mouse sai.

### Nível 2 — Intermediário

- As faixas estão num contêiner flex. Todas começam com flex-grow: 1 (dividem o espaço igualmente).
- A faixa ativa recebe flex-grow maior (o valor de "abertura"). A transição de flex-grow faz as outras encolherem suavemente para dar espaço.
- O título de cada faixa aparece só quando ela está aberta (opacidade e deslocamento com um pequeno atraso).
- Cada faixa é um <button>: clique ou Enter fixa a faixa aberta (aria-pressed), o que também resolve o toque no celular.

### Nível 3 — Avançado

- flex: 1 1 0 com min-width: 0 garante que todas partam da mesma base e possam encolher abaixo do tamanho do conteúdo.
- :not(:hover) no contêiner faz a faixa fixada "ceder" enquanto o usuário explora as outras com o mouse.
- transition-delay só no estado aberto do título: ele aparece depois que a faixa abriu, mas some imediatamente ao fechar.
- Para imagens reais: background-size: cover e background-position: center mantêm o assunto da foto visível nas faixas estreitas.

### Glossário do código

| Termo | O que faz |
|---|---|
| `flex-grow` | Quanto do espaço livre a faixa ocupa — a ativa ganha mais. |
| `:not(:hover)` | Só mostra a faixa fixada quando o mouse está fora da galeria. |
| `aria-pressed` | Indica qual faixa está fixada. |
| `min-width: 0` | Deixa a faixa encolher além do tamanho do texto. |

## Parâmetros

| Controle | Tipo | Padrão | Faixa / opções |
|---|---|---|---|
| quanto a faixa abre | range | 5× | 2–8× (passo 1) |
| duração | range | 650ms | 300–1200ms (passo 50) |
| curva (easing) | seleção | cubic-bezier(0.22, 1, 0.36, 1) | suave (expo out), elástico (back out), ease, ease-in-out, linear |

## Outra forma de fazer

Com CSS Grid: grid-template-columns com a coluna ativa em 5fr; a transição de grid-template-columns já é suportada nos navegadores atuais.

## Compatibilidade

Flexbox com transição de flex-grow: todos os navegadores atuais.

## Responsividade

Abaixo de 560px a galeria vira vertical (flex-direction: column), e as faixas crescem em altura.

## Acessibilidade

Faixas focáveis (botões) com nome visível no foco; aria-pressed indica a faixa fixada. Com prefers-reduced-motion a troca é instantânea.

## Performance

Transicionar flex-grow refaz o layout da galeria a cada quadro; com 5–7 faixas é imperceptível, mas evite em listas grandes.

## Limitações

- Muitas faixas deixam as fechadas finas demais para reconhecer a imagem: 4 a 7 é o ideal.

## Referências

- [MDN — flex-grow](https://developer.mozilla.org/en-US/docs/Web/CSS/flex-grow)
- [MDN — aria-pressed](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-pressed)
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
<title>Galeria sanfona · Kalixto Creative Lab</title>
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

.sanfona {
  display: flex;
  gap: 8px;
  width: min(100%, 680px);
  height: 380px;
}
.faixa {
  position: relative;
  flex: 1 1 0;
  min-width: 0;
  padding: 0;
  border: 0;
  border-radius: 18px;
  overflow: hidden;
  background: var(--fundo);
  color: #fff;
  font: inherit;
  cursor: pointer;
  transition: flex-grow 650ms cubic-bezier(0.22, 1, 0.36, 1);
}
.faixa span {
  position: absolute;
  left: 18px;
  bottom: 16px;
  font-size: 22px;
  font-weight: 700;
  white-space: nowrap;
  text-shadow: 0 2px 10px rgb(0 0 0 / 0.4);
  opacity: 0;
  translate: 0 12px;
  transition: opacity 300ms ease, translate 300ms ease;
}

/* aberta: a do hover/foco; sem hover, a fixada pelo clique */
.faixa:hover,
.faixa:focus-visible,
.sanfona:not(:hover) .faixa.is-ativa { flex-grow: 5; }
.faixa:hover span,
.faixa:focus-visible span,
.sanfona:not(:hover) .faixa.is-ativa span { opacity: 1; translate: 0 0; transition-delay: 200ms; }
.faixa:focus-visible { outline: 3px solid #22e3ff; outline-offset: 3px; }

@media (max-width: 560px) {
  .sanfona { flex-direction: column; height: 520px; }
}
@media (prefers-reduced-motion: reduce) {
  .faixa, .faixa span { transition: none; }
}
</style>
</head>
<body>
<section class="sanfona" aria-label="Destinos">
  <button class="faixa is-ativa" type="button" aria-pressed="true" style="--fundo: linear-gradient(160deg, #9fd8ff, #2f8f6b 70%)">
    <span>Montanha</span>
  </button>
  <button class="faixa" type="button" aria-pressed="false" style="--fundo: linear-gradient(160deg, #ffd27a, #c24d2c 75%)">
    <span>Deserto</span>
  </button>
  <button class="faixa" type="button" aria-pressed="false" style="--fundo: linear-gradient(160deg, #22e3ff, #0a2540 80%)">
    <span>Oceano</span>
  </button>
  <button class="faixa" type="button" aria-pressed="false" style="--fundo: linear-gradient(160deg, #ff2bd6, #2a1f6b 70%)">
    <span>Cidade</span>
  </button>
  <button class="faixa" type="button" aria-pressed="false" style="--fundo: linear-gradient(160deg, #c6ff3d, #1f4a2a 70%)">
    <span>Floresta</span>
  </button>
</section>
<script>
const faixas = document.querySelectorAll('.faixa');

// clique, Enter ou toque fixam a faixa aberta
faixas.forEach((faixa) => {
  faixa.addEventListener('click', () => {
    faixas.forEach((f) => {
      const ativa = f === faixa;
      f.classList.toggle('is-ativa', ativa);
      f.setAttribute('aria-pressed', String(ativa));
    });
  });
});
</script>
</body>
</html>
```

## Versão Angular (valores padrão)

Também em `src/app/efeitos-angular/expanding-gallery/` (compilada e testada com o app).

`expanding-gallery.ts`

```ts
import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-expanding-gallery',
  templateUrl: './expanding-gallery.html',
  styleUrl: './expanding-gallery.css',
})
export class ExpandingGallery {
  protected readonly paineis = [
    {
      nome: 'Montanha',
      fundo: 'linear-gradient(160deg, #9fd8ff, #2f8f6b 70%)'
    },
    {
      nome: 'Deserto',
      fundo: 'linear-gradient(160deg, #ffd27a, #c24d2c 75%)'
    },
    {
      nome: 'Oceano',
      fundo: 'linear-gradient(160deg, #22e3ff, #0a2540 80%)'
    },
    {
      nome: 'Cidade',
      fundo: 'linear-gradient(160deg, #ff2bd6, #2a1f6b 70%)'
    },
    {
      nome: 'Floresta',
      fundo: 'linear-gradient(160deg, #c6ff3d, #1f4a2a 70%)'
    }
  ];
  /** Faixa fixada pelo clique (aberta quando o mouse não está na galeria). */
  protected readonly ativa = signal(0);
}
```

`expanding-gallery.html`

```html
<section class="sanfona" aria-label="Destinos">
  @for (p of paineis; track p.nome; let i = $index) {
    <button
      class="faixa"
      type="button"
      [class.is-ativa]="ativa() === i"
      [attr.aria-pressed]="ativa() === i"
      [style.--fundo]="p.fundo"
      (click)="ativa.set(i)"
    >
      <span>{{ p.nome }}</span>
    </button>
  }
</section>
```

`expanding-gallery.css`

```css
:host {
  display: grid;
  place-items: center;
  gap: 24px;
}

.sanfona {
  display: flex;
  gap: 8px;
  width: min(100%, 680px);
  height: 380px;
}
.faixa {
  position: relative;
  flex: 1 1 0;
  min-width: 0;
  padding: 0;
  border: 0;
  border-radius: 18px;
  overflow: hidden;
  background: var(--fundo);
  color: #fff;
  font: inherit;
  cursor: pointer;
  transition: flex-grow 650ms cubic-bezier(0.22, 1, 0.36, 1);
}
.faixa span {
  position: absolute;
  left: 18px;
  bottom: 16px;
  font-size: 22px;
  font-weight: 700;
  white-space: nowrap;
  text-shadow: 0 2px 10px rgb(0 0 0 / 0.4);
  opacity: 0;
  translate: 0 12px;
  transition: opacity 300ms ease, translate 300ms ease;
}

/* aberta: a do hover/foco; sem hover, a fixada pelo clique */
.faixa:hover,
.faixa:focus-visible,
.sanfona:not(:hover) .faixa.is-ativa { flex-grow: 5; }
.faixa:hover span,
.faixa:focus-visible span,
.sanfona:not(:hover) .faixa.is-ativa span { opacity: 1; translate: 0 0; transition-delay: 200ms; }
.faixa:focus-visible { outline: 3px solid #22e3ff; outline-offset: 3px; }

@media (max-width: 560px) {
  .sanfona { flex-direction: column; height: 520px; }
}
@media (prefers-reduced-motion: reduce) {
  .faixa, .faixa span { transition: none; }
}
```
