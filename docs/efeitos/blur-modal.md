# Janela com fundo desfocado (`blur-modal`)

> Gerado a partir de `src/app/core/efeitos/kits/blur-modal.kit.ts`. Não edite à mão: rode `npm run docs:efeitos`.

Ao abrir, uma janela de vidro surge crescendo e o resto da página fica desfocado e escurecido atrás dela; ao fechar, tudo volta ao foco.

| Campo | Valor |
|---|---|
| Nome técnico | Blurred Backdrop Modal (<dialog>) |
| Categoria | 01 · Microinterações e UI › Modais e janelas |
| Nível | Intermediário |
| Tecnologias | HTML, CSS, JavaScript |
| Dependências | nenhuma |
| Interação | Clique, Teclado |
| Status | validado em 2026-11-17 |
| Tags | modal, dialog, janela, blur, desfoque, backdrop, vidro, popup, tendência 2026 |

## Objetivo visual

Concentrar a atenção num aviso, formulário ou confirmação, mantendo o contexto visível (porém desfocado) ao fundo.

## Aplicações

- Confirmações e avisos
- Formulários de contato e login
- Galerias (foto ampliada) e detalhes de produto

## Como funciona

### Nível 1 — Iniciante

- O botão abre uma janela de vidro no meio da tela.
- Enquanto ela está aberta, tudo atrás fica borrado e um pouco mais escuro, para você prestar atenção só na janela.
- Dá para fechar pelos botões, clicando fora ou apertando Esc.

### Nível 2 — Intermediário

- A janela é um <dialog> nativo. showModal() abre de verdade em modo modal: o resto da página fica inerte, o foco vai para dentro e Esc fecha — tudo sem código extra.
- O pseudo-elemento ::backdrop é a camada que o navegador coloca entre a página e o dialog. Com backdrop-filter: blur() nele, a página inteira fica desfocada.
- A entrada usa @starting-style: o navegador anima do estado inicial (pequeno e transparente) para o normal assim que o dialog abre. A saída usa transition-behavior: allow-discrete para animar até ele sumir.
- O próprio dialog também é de vidro: fundo translúcido + backdrop-filter próprio.

### Nível 3 — Avançado

- showModal() (e não show()) é o que coloca o dialog na top layer, cria o ::backdrop e torna o resto da página inerte.
- <form method="dialog"> fecha o dialog ao enviar e grava o value do botão em dialog.returnValue — sem JavaScript.
- Animar display e overlay com allow-discrete mantém o dialog na tela até o fim da animação de saída.
- @starting-style define de onde a transição de entrada parte; sem ele, um elemento que acabou de aparecer não tem "antes" para animar.

### Glossário do código

| Termo | O que faz |
|---|---|
| `showModal()` | Abre a janela em modo modal (foco preso, Esc fecha). |
| `::backdrop` | Camada atrás do dialog: é ela que fica desfocada. |
| `@starting-style` | Estado inicial da animação de entrada. |
| `method="dialog"` | O formulário fecha a janela sem JavaScript. |

## Parâmetros

| Controle | Tipo | Padrão | Faixa / opções |
|---|---|---|---|
| desfoque do fundo | range | 8px | 0–20px (passo 1) |
| escurecer o fundo | range | 0.35 | 0–0.8 (passo 0.05) |
| duração da animação | range | 350ms | 150–800ms (passo 50) |

## Outra forma de fazer

Sem <dialog>: uma div com role="dialog", aria-modal="true", uma camada fixa com backdrop-filter e o controle de foco feito à mão (bem mais trabalhoso).

## Compatibilidade

<dialog> e ::backdrop: todos os navegadores atuais. @starting-style e allow-discrete: Chrome/Edge 117+, Safari 17.5+, Firefox 129+ — nos demais, a janela abre sem animação.

## Responsividade

A janela tem largura máxima e margem automática; no celular ela ocupa quase toda a largura.

## Acessibilidade

O <dialog> com showModal() já prende o foco, fecha com Esc e devolve o foco ao botão que abriu. A janela tem título ligado por aria-labelledby. Com prefers-reduced-motion, abre e fecha sem animação.

## Performance

O desfoque do ::backdrop cobre a tela toda: use raio moderado (até ~10px) em páginas pesadas.

## Limitações

- Dentro do preview (iframe), o desfoque cobre só o preview; numa página normal, cobre a janela inteira.

## Referências

- [MDN — <dialog>](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog)
- [MDN — ::backdrop](https://developer.mozilla.org/en-US/docs/Web/CSS/::backdrop)
- [MDN — @starting-style](https://developer.mozilla.org/en-US/docs/Web/CSS/@starting-style)

## Código (valores padrão)

Arquivo único, igual ao baixado pelo botão “Baixar” na página do efeito:

```html
<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data:; font-src data:">
<title>Janela com fundo desfocado · Kalixto Creative Lab</title>
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

.pagina-fundo {
  display: grid;
  justify-items: center;
  gap: 16px;
  width: min(100%, 640px);
  padding: 28px;
  border-radius: 20px;
  background: linear-gradient(160deg, #2a1f6b, #0f0c1f);
}
.pagina-fundo h1 { margin: 0; font-size: clamp(1.6rem, 6vw, 2.4rem); }
.miniaturas { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; width: 100%; }
.miniaturas span { aspect-ratio: 4 / 3; border-radius: 12px; background: linear-gradient(135deg, #ff2bd6, #7c4ddb); }
.miniaturas span:nth-child(2) { background: linear-gradient(135deg, #22e3ff, #2f7bff); }
.miniaturas span:nth-child(3) { background: linear-gradient(135deg, #c6ff3d, #1f6b4a); }

button {
  padding: 10px 18px;
  border: 1px solid rgb(255 255 255 / 0.25);
  border-radius: 999px;
  background: transparent;
  color: #f4f2ff;
  font: inherit;
  cursor: pointer;
}
button:focus-visible { outline: 2px solid #22e3ff; outline-offset: 3px; }
.principal { border-color: transparent; background: #ff2bd6; color: #1a0717; font-weight: 700; }

/* A janela de vidro */
.janela {
  width: min(90vw, 380px);
  padding: 26px;
  border: 1px solid rgb(255 255 255 / 0.25);
  border-radius: 20px;
  background: rgb(255 255 255 / 0.12);
  -webkit-backdrop-filter: blur(16px) saturate(1.4);
  backdrop-filter: blur(16px) saturate(1.4);
  color: #fff;
  box-shadow: 0 30px 80px rgb(0 0 0 / 0.4);
  opacity: 0;
  scale: 0.9;
  transition:
    opacity 350ms ease,
    scale 350ms cubic-bezier(0.22, 1, 0.36, 1),
    overlay 350ms allow-discrete,
    display 350ms allow-discrete;
}
.janela[open] { opacity: 1; scale: 1; }
.janela h2 { margin: 0 0 8px; font-size: 22px; }
.janela p { margin: 0 0 18px; color: #e7e3ff; }
.acoes { display: flex; justify-content: flex-end; gap: 8px; }

/* A página atrás: desfocada e escurecida */
.janela::backdrop {
  background: rgb(5 3 12 / 0);
  -webkit-backdrop-filter: blur(0px);
  backdrop-filter: blur(0px);
  transition: all 350ms ease allow-discrete;
}
.janela[open]::backdrop {
  background: rgb(5 3 12 / 0.35);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
}

/* Estado de partida da animação de entrada */
@starting-style {
  .janela[open] { opacity: 0; scale: 0.9; }
  .janela[open]::backdrop { background: rgb(5 3 12 / 0); backdrop-filter: blur(0px); }
}

@media (prefers-reduced-motion: reduce) {
  .janela, .janela::backdrop { transition: none; }
}
</style>
</head>
<body>
<section class="pagina-fundo">
  <h1>Galeria do lab</h1>
  <div class="miniaturas" aria-hidden="true"><span></span><span></span><span></span></div>
  <button class="abrir-modal" type="button">Abrir janela</button>
</section>

<dialog class="janela" aria-labelledby="janela-titulo">
  <h2 id="janela-titulo">Quer receber novidades?</h2>
  <p>Enviamos um e-mail por mês com efeitos novos do laboratório.</p>
  <form method="dialog" class="acoes">
    <button value="depois" type="submit">Agora não</button>
    <button value="sim" type="submit" class="principal">Quero receber</button>
  </form>
</dialog>
<script>
const janela = document.querySelector('.janela');
document.querySelector('.abrir-modal').addEventListener('click', () => janela.showModal());

// clicar fora da janela (no fundo desfocado) também fecha
janela.addEventListener('click', (e) => {
  if (e.target === janela) janela.close();
});
</script>
</body>
</html>
```

## Versão Angular (valores padrão)

Também em `src/app/efeitos-angular/blur-modal/` (compilada e testada com o app).

`blur-modal.ts`

```ts
import { Component, ElementRef, viewChild } from '@angular/core';

@Component({
  selector: 'app-blur-modal',
  templateUrl: './blur-modal.html',
  styleUrl: './blur-modal.css',
})
export class BlurModal {
  private readonly janela = viewChild.required<ElementRef<HTMLDialogElement>>('janela');

  protected abrir(): void {
    this.janela().nativeElement.showModal();
  }

  /** Clicar fora da janela (no fundo desfocado) também fecha. */
  protected clicarFora(e: MouseEvent): void {
    if (e.target === this.janela().nativeElement) this.janela().nativeElement.close();
  }
}
```

`blur-modal.html`

```html
<section class="pagina-fundo">
  <h1>Galeria do lab</h1>
  <div class="miniaturas" aria-hidden="true"><span></span><span></span><span></span></div>
  <button class="abrir-modal" type="button" (click)="abrir()">Abrir janela</button>
</section>

<dialog #janela class="janela" aria-labelledby="janela-titulo" (click)="clicarFora($event)">
  <h2 id="janela-titulo">Quer receber novidades?</h2>
  <p>Enviamos um e-mail por mês com efeitos novos do laboratório.</p>
  <form method="dialog" class="acoes">
    <button value="depois" type="submit">Agora não</button>
    <button value="sim" type="submit" class="principal">Quero receber</button>
  </form>
</dialog>
```

`blur-modal.css`

```css
:host {
  display: grid;
  place-items: center;
  gap: 24px;
}

.pagina-fundo {
  display: grid;
  justify-items: center;
  gap: 16px;
  width: min(100%, 640px);
  padding: 28px;
  border-radius: 20px;
  background: linear-gradient(160deg, #2a1f6b, #0f0c1f);
}
.pagina-fundo h1 { margin: 0; font-size: clamp(1.6rem, 6vw, 2.4rem); }
.miniaturas { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; width: 100%; }
.miniaturas span { aspect-ratio: 4 / 3; border-radius: 12px; background: linear-gradient(135deg, #ff2bd6, #7c4ddb); }
.miniaturas span:nth-child(2) { background: linear-gradient(135deg, #22e3ff, #2f7bff); }
.miniaturas span:nth-child(3) { background: linear-gradient(135deg, #c6ff3d, #1f6b4a); }

button {
  padding: 10px 18px;
  border: 1px solid rgb(255 255 255 / 0.25);
  border-radius: 999px;
  background: transparent;
  color: #f4f2ff;
  font: inherit;
  cursor: pointer;
}
button:focus-visible { outline: 2px solid #22e3ff; outline-offset: 3px; }
.principal { border-color: transparent; background: #ff2bd6; color: #1a0717; font-weight: 700; }

/* A janela de vidro */
.janela {
  width: min(90vw, 380px);
  padding: 26px;
  border: 1px solid rgb(255 255 255 / 0.25);
  border-radius: 20px;
  background: rgb(255 255 255 / 0.12);
  -webkit-backdrop-filter: blur(16px) saturate(1.4);
  backdrop-filter: blur(16px) saturate(1.4);
  color: #fff;
  box-shadow: 0 30px 80px rgb(0 0 0 / 0.4);
  opacity: 0;
  scale: 0.9;
  transition:
    opacity 350ms ease,
    scale 350ms cubic-bezier(0.22, 1, 0.36, 1),
    overlay 350ms allow-discrete,
    display 350ms allow-discrete;
}
.janela[open] { opacity: 1; scale: 1; }
.janela h2 { margin: 0 0 8px; font-size: 22px; }
.janela p { margin: 0 0 18px; color: #e7e3ff; }
.acoes { display: flex; justify-content: flex-end; gap: 8px; }

/* A página atrás: desfocada e escurecida */
.janela::backdrop {
  background: rgb(5 3 12 / 0);
  -webkit-backdrop-filter: blur(0px);
  backdrop-filter: blur(0px);
  transition: all 350ms ease allow-discrete;
}
.janela[open]::backdrop {
  background: rgb(5 3 12 / 0.35);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
}

/* Estado de partida da animação de entrada */
@starting-style {
  .janela[open] { opacity: 0; scale: 0.9; }
  .janela[open]::backdrop { background: rgb(5 3 12 / 0); backdrop-filter: blur(0px); }
}

@media (prefers-reduced-motion: reduce) {
  .janela, .janela::backdrop { transition: none; }
}
```
