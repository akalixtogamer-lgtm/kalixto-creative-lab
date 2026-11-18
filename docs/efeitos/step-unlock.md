# Etapas que se desbloqueiam (`step-unlock`)

> Gerado a partir de `src/app/core/efeitos/kits/step-unlock.kit.ts`. Não edite à mão: rode `npm run docs:efeitos`.

Uma trilha de etapas bloqueadas, com cadeado e "?"; uma a uma, o cadeado treme e abre, o nome da etapa aparece e um selo "FEITO" é carimbado, enquanto o contador sobe.

| Campo | Valor |
|---|---|
| Nome técnico | Locked Steps Unlock (progresso por etapas) |
| Categoria | 13 · Componentes e dados › Progresso e estados |
| Nível | Intermediário |
| Tecnologias | HTML, CSS, JavaScript |
| Dependências | nenhuma |
| Interação | Automático, Clique, Teclado |
| Status | validado em 2026-11-17 |
| Tags | etapas, passos, steps, desbloquear, cadeado, gamificação, progresso, selo, referência em vídeo |

## Objetivo visual

Mostrar um método em passos de um jeito de jogo: cada etapa concluída é uma pequena conquista.

## Aplicações

- Apresentar um método ou processo de trabalho
- Onboarding e cursos (trilhas)
- Vídeos explicativos de serviço

## Como funciona

### Nível 1 — Iniciante

- São três cartões de etapa, todos trancados com cadeado e com um "?" no lugar do nome.
- Um por um, o cadeado treme, abre, vira um ✓ e o nome da etapa aparece, com um selo "FEITO".
- Em cima, o contador mostra quantas etapas já foram liberadas.

### Nível 2 — Intermediário

- Cada etapa é um <li> com um estado em data-estado: "bloqueado" ou "livre". Todo o visual (cadeado, título escondido, selo) sai do CSS conforme esse atributo.
- Ao desbloquear, a etapa recebe primeiro a classe de "tremer" (o cadeado balança), e só depois de 350 ms passa a "livre": o cadeado vira ✓, o título aparece e o selo carimba.
- No modo automático, um temporizador desbloqueia a próxima etapa a cada intervalo; no modo clique, o botão faz isso.
- O contador "0/3" é atualizado a cada etapa e anunciado ao leitor de tela.

### Nível 3 — Avançado

- Estado no DOM via data-estado: o CSS reage com seletores de atributo ([data-estado="livre"]) — o JS não mexe em estilo nenhum.
- Separar "tremer" (classe temporária) de "livre" (estado) permite encadear duas animações com um único setTimeout.
- color-mix(in srgb, cor 10%, fundo) gera o fundo tingido da etapa livre a partir da cor de destaque, sem uma segunda variável.
- No Angular, o estado é só um número (livres) e um índice (tremendo); o template calcula o data-estado de cada etapa.

### Glossário do código

| Termo | O que faz |
|---|---|
| `data-estado` | Guarda se a etapa está bloqueada ou livre. |
| `[data-estado='livre']` | Seletor de atributo: estilos da etapa liberada. |
| `color-mix` | Mistura a cor de destaque com o fundo. |
| `aria-live` | Anuncia o contador quando uma etapa é liberada. |

## Parâmetros

| Controle | Tipo | Padrão | Faixa / opções |
|---|---|---|---|
| intervalo entre etapas | range | 1300ms | 600–2500ms (passo 100) |
| como desbloqueia | seleção | automatico | automático, no clique |
| cor de destaque | seleção | #ff6a1a | Laranja, Lilás, Verde |

## Outra forma de fazer

Com GSAP: uma timeline com uma etapa por passo (shake → troca de estado → selo), boa para sincronizar com narração de vídeo.

## Compatibilidade

Atributos data-*, seletores de atributo e animações CSS: todos os navegadores atuais.

## Responsividade

Lista em coluna única com largura máxima: igual no celular e no computador.

## Acessibilidade

Cada etapa diz o próprio estado em texto ("bloqueada" / "concluída", visível para o leitor de tela). O contador está numa região aria-live. Com prefers-reduced-motion não há tremor nem carimbo animado.

## Performance

Só trocas de atributo e animações curtas de transform.

## Limitações

- Etapas com títulos longos: o título escondido ("?") reserva pouco espaço; ajuste a largura mínima.

## Referências

- [MDN — Seletores de atributo](https://developer.mozilla.org/en-US/docs/Web/CSS/Attribute_selectors)
- [MDN — aria-live](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-live)
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
<title>Etapas que se desbloqueiam · Kalixto Creative Lab</title>
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

.trilha-passos { display: grid; gap: 12px; width: min(100%, 440px); }
.contador { margin: 0; color: #c9c3ea; font: 600 13px ui-monospace, monospace; letter-spacing: 0.08em; text-transform: uppercase; }
.contador strong { color: #ff6a1a; }
.passos { display: grid; gap: 10px; margin: 0; padding: 0; list-style: none; }

.passo {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border: 1px solid rgb(255 255 255 / 0.1);
  border-radius: 14px;
  background: #15121c;
  transition: border-color 400ms ease, background 400ms ease;
}
.cadeado {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgb(255 255 255 / 0.06);
}
.cadeado::before { content: '🔒'; font-size: 16px; }
.num { padding: 2px 8px; border-radius: 6px; background: #f4f2ff; color: #15121c; font: 800 13px ui-monospace, monospace; }
.texto { display: grid; }
.texto small { color: #8f88b5; }

/* Bloqueado: título escondido, só "?" */
.passo[data-estado='bloqueado'] .texto { color: transparent; }
.passo[data-estado='bloqueado'] .texto strong::before { content: '?'; color: #f4f2ff; position: absolute; }
.passo[data-estado='bloqueado'] .texto small { color: transparent; }

/* Tremendo: o cadeado balança antes de abrir */
.passo.is-tremendo .cadeado { animation: tremer 350ms ease-in-out; }
@keyframes tremer {
  25% { rotate: -12deg; }
  50% { rotate: 10deg; }
  75% { rotate: -6deg; }
}

/* Livre: ✓, título aparece, selo carimba */
.passo[data-estado='livre'] { border-color: #ff6a1a; background: color-mix(in srgb, #ff6a1a 10%, #15121c); }
.passo[data-estado='livre'] .cadeado { background: #ff6a1a; }
.passo[data-estado='livre'] .cadeado::before { content: '✓'; color: #15121c; font-weight: 800; }
.passo[data-estado='livre'] .texto { animation: revelar 400ms ease both; }
@keyframes revelar { from { opacity: 0; translate: 6px 0; } }
.selo {
  position: absolute;
  right: 12px;
  top: -10px;
  padding: 2px 10px;
  border-radius: 999px;
  background: #ff6a1a;
  color: #15121c;
  font: 800 11px ui-monospace, monospace;
  letter-spacing: 0.08em;
  opacity: 0;
}
.passo[data-estado='livre'] .selo { animation: carimbar 420ms cubic-bezier(0.34, 1.56, 0.64, 1) 150ms both; }
@keyframes carimbar {
  from { opacity: 0; scale: 2; rotate: -18deg; }
  to { opacity: 1; scale: 1; rotate: 0deg; }
}
.sr-estado { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }

.avancar {
  padding: 10px 20px;
  border: 1px solid #3a3456;
  border-radius: 999px;
  background: transparent;
  color: #f4f2ff;
  font: inherit;
  cursor: pointer;
}
.avancar:focus-visible { outline: 2px solid #22e3ff; outline-offset: 3px; }

@media (prefers-reduced-motion: reduce) {
  .passo.is-tremendo .cadeado, .passo[data-estado='livre'] .texto { animation: none; }
  .passo[data-estado='livre'] .selo { animation: none; opacity: 1; }
}
</style>
</head>
<body>
<section class="trilha-passos">
  <p class="contador" aria-live="polite">Desbloqueado <strong>0</strong>/3</p>
  <ol class="passos">
    <li class="passo" data-estado="bloqueado">
      <span class="cadeado" aria-hidden="true"></span>
      <span class="num">01</span>
      <span class="texto"><strong>Design system</strong><small>Cores, fontes e componentes</small></span>
      <span class="sr-estado">bloqueada</span>
      <span class="selo" aria-hidden="true">FEITO</span>
    </li>
    <li class="passo" data-estado="bloqueado">
      <span class="cadeado" aria-hidden="true"></span>
      <span class="num">02</span>
      <span class="texto"><strong>Página</strong><small>Copy, layout e animações</small></span>
      <span class="sr-estado">bloqueada</span>
      <span class="selo" aria-hidden="true">FEITO</span>
    </li>
    <li class="passo" data-estado="bloqueado">
      <span class="cadeado" aria-hidden="true"></span>
      <span class="num">03</span>
      <span class="texto"><strong>Publicação</strong><small>Domínio e site no ar</small></span>
      <span class="sr-estado">bloqueada</span>
      <span class="selo" aria-hidden="true">FEITO</span>
    </li>
  </ol>
</section>
<button class="avancar" type="button">Recomeçar</button>
<script>
const INTERVALO = 1300;
const AUTOMATICO = true;
const reduzir = matchMedia('(prefers-reduced-motion: reduce)');
const passos = [...document.querySelectorAll('.passo')];
const contador = document.querySelector('.contador strong');
const botao = document.querySelector('.avancar');
let feitos = 0;
let temporizador = 0;

function desbloquear() {
  const passo = passos[feitos];
  if (!passo) return;
  feitos++;
  passo.classList.add('is-tremendo');
  // o cadeado treme primeiro; depois a etapa fica livre
  setTimeout(() => {
    passo.classList.remove('is-tremendo');
    passo.dataset.estado = 'livre';
    passo.querySelector('.sr-estado').textContent = 'concluída';
    contador.textContent = String(passos.filter((p) => p.dataset.estado === 'livre').length);
    if (!AUTOMATICO && feitos === passos.length) botao.textContent = 'Recomeçar';
  }, reduzir.matches ? 0 : 350);
  if (AUTOMATICO && feitos < passos.length) temporizador = setTimeout(desbloquear, INTERVALO);
}

function recomecar() {
  clearTimeout(temporizador);
  feitos = 0;
  passos.forEach((p) => {
    p.dataset.estado = 'bloqueado';
    p.querySelector('.sr-estado').textContent = 'bloqueada';
  });
  contador.textContent = '0';
  botao.textContent = AUTOMATICO ? 'Recomeçar' : 'Desbloquear próxima';
  if (AUTOMATICO) temporizador = setTimeout(desbloquear, INTERVALO);
}

botao.addEventListener('click', () => {
  if (AUTOMATICO || feitos === passos.length) recomecar();
  else desbloquear();
});
if (AUTOMATICO) temporizador = setTimeout(desbloquear, INTERVALO);
</script>
</body>
</html>
```

## Versão Angular (valores padrão)

Também em `src/app/efeitos-angular/step-unlock/` (compilada e testada com o app).

`step-unlock.ts`

```ts
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';

@Component({
  selector: 'app-step-unlock',
  templateUrl: './step-unlock.html',
  styleUrl: './step-unlock.css',
})
export class StepUnlock {
  protected readonly passos = [
    {
      titulo: 'Design system',
      detalhe: 'Cores, fontes e componentes'
    },
    {
      titulo: 'Página',
      detalhe: 'Copy, layout e animações'
    },
    {
      titulo: 'Publicação',
      detalhe: 'Domínio e site no ar'
    }
  ];
  protected readonly automatico = true;
  private readonly intervalo = 1300;
  private readonly reduzir = window.matchMedia('(prefers-reduced-motion: reduce)');
  private temporizador = 0;

  /** Quantas etapas já estão livres e qual está tremendo agora. */
  protected readonly livres = signal(0);
  protected readonly tremendo = signal(-1);
  protected readonly terminou = computed(() => this.livres() === this.passos.length);

  constructor() {
    if (this.automatico) this.agendar();
    inject(DestroyRef).onDestroy(() => clearTimeout(this.temporizador));
  }

  protected clicar(): void {
    if (this.automatico || this.terminou()) this.recomecar();
    else this.desbloquear();
  }

  private agendar(): void {
    this.temporizador = window.setTimeout(() => this.desbloquear(), this.intervalo);
  }

  private desbloquear(): void {
    const i = this.livres();
    if (i >= this.passos.length || this.tremendo() !== -1) return;
    this.tremendo.set(i);
    setTimeout(() => {
      this.tremendo.set(-1);
      this.livres.set(i + 1);
      if (this.automatico && i + 1 < this.passos.length) this.agendar();
    }, this.reduzir.matches ? 0 : 350);
  }

  private recomecar(): void {
    clearTimeout(this.temporizador);
    this.livres.set(0);
    this.tremendo.set(-1);
    if (this.automatico) this.agendar();
  }
}
```

`step-unlock.html`

```html
<section class="trilha-passos">
  <p class="contador" aria-live="polite">Desbloqueado <strong>{{ livres() }}</strong>/{{ passos.length }}</p>
  <ol class="passos">
    @for (p of passos; track p.titulo; let i = $index) {
      <li class="passo" [attr.data-estado]="i < livres() ? 'livre' : 'bloqueado'" [class.is-tremendo]="tremendo() === i">
        <span class="cadeado" aria-hidden="true"></span>
        <span class="num">0{{ i + 1 }}</span>
        <span class="texto"><strong>{{ p.titulo }}</strong><small>{{ p.detalhe }}</small></span>
        <span class="sr-estado">{{ i < livres() ? 'concluída' : 'bloqueada' }}</span>
        <span class="selo" aria-hidden="true">FEITO</span>
      </li>
    }
  </ol>
</section>
<button class="avancar" type="button" (click)="clicar()">
  {{ automatico || terminou() ? 'Recomeçar' : 'Desbloquear próxima' }}
</button>
```

`step-unlock.css`

```css
:host {
  display: grid;
  place-items: center;
  gap: 24px;
}

.trilha-passos { display: grid; gap: 12px; width: min(100%, 440px); }
.contador { margin: 0; color: #c9c3ea; font: 600 13px ui-monospace, monospace; letter-spacing: 0.08em; text-transform: uppercase; }
.contador strong { color: #ff6a1a; }
.passos { display: grid; gap: 10px; margin: 0; padding: 0; list-style: none; }

.passo {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border: 1px solid rgb(255 255 255 / 0.1);
  border-radius: 14px;
  background: #15121c;
  transition: border-color 400ms ease, background 400ms ease;
}
.cadeado {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgb(255 255 255 / 0.06);
}
.cadeado::before { content: '🔒'; font-size: 16px; }
.num { padding: 2px 8px; border-radius: 6px; background: #f4f2ff; color: #15121c; font: 800 13px ui-monospace, monospace; }
.texto { display: grid; }
.texto small { color: #8f88b5; }

/* Bloqueado: título escondido, só "?" */
.passo[data-estado='bloqueado'] .texto { color: transparent; }
.passo[data-estado='bloqueado'] .texto strong::before { content: '?'; color: #f4f2ff; position: absolute; }
.passo[data-estado='bloqueado'] .texto small { color: transparent; }

/* Tremendo: o cadeado balança antes de abrir */
.passo.is-tremendo .cadeado { animation: tremer 350ms ease-in-out; }
@keyframes tremer {
  25% { rotate: -12deg; }
  50% { rotate: 10deg; }
  75% { rotate: -6deg; }
}

/* Livre: ✓, título aparece, selo carimba */
.passo[data-estado='livre'] { border-color: #ff6a1a; background: color-mix(in srgb, #ff6a1a 10%, #15121c); }
.passo[data-estado='livre'] .cadeado { background: #ff6a1a; }
.passo[data-estado='livre'] .cadeado::before { content: '✓'; color: #15121c; font-weight: 800; }
.passo[data-estado='livre'] .texto { animation: revelar 400ms ease both; }
@keyframes revelar { from { opacity: 0; translate: 6px 0; } }
.selo {
  position: absolute;
  right: 12px;
  top: -10px;
  padding: 2px 10px;
  border-radius: 999px;
  background: #ff6a1a;
  color: #15121c;
  font: 800 11px ui-monospace, monospace;
  letter-spacing: 0.08em;
  opacity: 0;
}
.passo[data-estado='livre'] .selo { animation: carimbar 420ms cubic-bezier(0.34, 1.56, 0.64, 1) 150ms both; }
@keyframes carimbar {
  from { opacity: 0; scale: 2; rotate: -18deg; }
  to { opacity: 1; scale: 1; rotate: 0deg; }
}
.sr-estado { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }

.avancar {
  padding: 10px 20px;
  border: 1px solid #3a3456;
  border-radius: 999px;
  background: transparent;
  color: #f4f2ff;
  font: inherit;
  cursor: pointer;
}
.avancar:focus-visible { outline: 2px solid #22e3ff; outline-offset: 3px; }

@media (prefers-reduced-motion: reduce) {
  .passo.is-tremendo .cadeado, .passo[data-estado='livre'] .texto { animation: none; }
  .passo[data-estado='livre'] .selo { animation: none; opacity: 1; }
}
```
