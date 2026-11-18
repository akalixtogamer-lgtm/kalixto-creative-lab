import { EffectKit } from '../../models/effect-sheet.model';
import { VALIDADO_EM, cssAngular, cssPalco, nomeClasse } from './_base';

export const BLUR_MODAL: EffectKit = {
  ficha: {
    id: 'blur-modal',
    nomeTecnico: 'Blurred Backdrop Modal (<dialog>)',
    nomeAmigavel: 'Janela com fundo desfocado',
    categoria: 'microinteracoes',
    subcategoria: 'Modais e janelas',
    descricao:
      'Ao abrir, uma janela de vidro surge crescendo e o resto da página fica desfocado e escurecido atrás dela; ao fechar, tudo volta ao foco.',
    objetivoVisual:
      'Concentrar a atenção num aviso, formulário ou confirmação, mantendo o contexto visível (porém desfocado) ao fundo.',
    aplicacoes: [
      'Confirmações e avisos',
      'Formulários de contato e login',
      'Galerias (foto ampliada) e detalhes de produto',
    ],
    nivel: 'intermediario',
    tecnologias: ['HTML', 'CSS', 'JavaScript'],
    dependencias: [],
    interacoes: ['click', 'keyboard'],
    tags: [
      'modal',
      'dialog',
      'janela',
      'blur',
      'desfoque',
      'backdrop',
      'vidro',
      'popup',
      'tendência 2026',
    ],
    explicacao: [
      'A janela é um <dialog> nativo. showModal() abre de verdade em modo modal: o resto da página fica inerte, o foco vai para dentro e Esc fecha — tudo sem código extra.',
      'O pseudo-elemento ::backdrop é a camada que o navegador coloca entre a página e o dialog. Com backdrop-filter: blur() nele, a página inteira fica desfocada.',
      'A entrada usa @starting-style: o navegador anima do estado inicial (pequeno e transparente) para o normal assim que o dialog abre. A saída usa transition-behavior: allow-discrete para animar até ele sumir.',
      'O próprio dialog também é de vidro: fundo translúcido + backdrop-filter próprio.',
    ],
    alternativa:
      'Sem <dialog>: uma div com role="dialog", aria-modal="true", uma camada fixa com backdrop-filter e o controle de foco feito à mão (bem mais trabalhoso).',
    compatibilidade:
      '<dialog> e ::backdrop: todos os navegadores atuais. @starting-style e allow-discrete: Chrome/Edge 117+, Safari 17.5+, Firefox 129+ — nos demais, a janela abre sem animação.',
    responsividade:
      'A janela tem largura máxima e margem automática; no celular ela ocupa quase toda a largura.',
    acessibilidade:
      'O <dialog> com showModal() já prende o foco, fecha com Esc e devolve o foco ao botão que abriu. A janela tem título ligado por aria-labelledby. Com prefers-reduced-motion, abre e fecha sem animação.',
    performance:
      'O desfoque do ::backdrop cobre a tela toda: use raio moderado (até ~10px) em páginas pesadas.',
    limitacoes: [
      'Dentro do preview (iframe), o desfoque cobre só o preview; numa página normal, cobre a janela inteira.',
    ],
    referencias: [
      {
        titulo: 'MDN — <dialog>',
        url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog',
      },
      {
        titulo: 'MDN — ::backdrop',
        url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/::backdrop',
      },
      {
        titulo: 'MDN — @starting-style',
        url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/@starting-style',
      },
    ],
    validadoEm: VALIDADO_EM,
    status: 'validado',
  },
  params: [
    {
      id: 'desfoque',
      rotulo: 'desfoque do fundo',
      tipo: 'range',
      min: 0,
      max: 20,
      passo: 1,
      unidade: 'px',
      padrao: 8,
    },
    {
      id: 'escurecer',
      rotulo: 'escurecer o fundo',
      tipo: 'range',
      min: 0,
      max: 0.8,
      passo: 0.05,
      unidade: '',
      padrao: 0.35,
    },
    {
      id: 'duracao',
      rotulo: 'duração da animação',
      tipo: 'range',
      min: 150,
      max: 800,
      passo: 50,
      unidade: 'ms',
      padrao: 350,
    },
  ],
  gerar: (v) => {
    const dur = Number(v['duracao']);
    return {
      html: `<section class="pagina-fundo">
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
</dialog>`,
      css: `${cssPalco()}

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
    opacity ${dur}ms ease,
    scale ${dur}ms cubic-bezier(0.22, 1, 0.36, 1),
    overlay ${dur}ms allow-discrete,
    display ${dur}ms allow-discrete;
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
  transition: all ${dur}ms ease allow-discrete;
}
.janela[open]::backdrop {
  background: rgb(5 3 12 / ${v['escurecer']});
  -webkit-backdrop-filter: blur(${v['desfoque']}px);
  backdrop-filter: blur(${v['desfoque']}px);
}

/* Estado de partida da animação de entrada */
@starting-style {
  .janela[open] { opacity: 0; scale: 0.9; }
  .janela[open]::backdrop { background: rgb(5 3 12 / 0); backdrop-filter: blur(0px); }
}

@media (prefers-reduced-motion: reduce) {
  .janela, .janela::backdrop { transition: none; }
}`,
      js: `const janela = document.querySelector('.janela');
document.querySelector('.abrir-modal').addEventListener('click', () => janela.showModal());

// clicar fora da janela (no fundo desfocado) também fecha
janela.addEventListener('click', (e) => {
  if (e.target === janela) janela.close();
});`,
    };
  },
  angular: (v) => ({
    ts: `import { Component, ElementRef, viewChild } from '@angular/core';

@Component({
  selector: 'app-blur-modal',
  templateUrl: './blur-modal.html',
  styleUrl: './blur-modal.css',
})
export class ${nomeClasse('blur-modal')} {
  private readonly janela = viewChild.required<ElementRef<HTMLDialogElement>>('janela');

  protected abrir(): void {
    this.janela().nativeElement.showModal();
  }

  /** Clicar fora da janela (no fundo desfocado) também fecha. */
  protected clicarFora(e: MouseEvent): void {
    if (e.target === this.janela().nativeElement) this.janela().nativeElement.close();
  }
}
`,
    html: `<section class="pagina-fundo">
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
`,
    css: cssAngular(BLUR_MODAL.gerar(v).css),
  }),
  niveis: {
    iniciante: [
      'O botão abre uma janela de vidro no meio da tela.',
      'Enquanto ela está aberta, tudo atrás fica borrado e um pouco mais escuro, para você prestar atenção só na janela.',
      'Dá para fechar pelos botões, clicando fora ou apertando Esc.',
    ],
    avancado: [
      'showModal() (e não show()) é o que coloca o dialog na top layer, cria o ::backdrop e torna o resto da página inerte.',
      '<form method="dialog"> fecha o dialog ao enviar e grava o value do botão em dialog.returnValue — sem JavaScript.',
      'Animar display e overlay com allow-discrete mantém o dialog na tela até o fim da animação de saída.',
      '@starting-style define de onde a transição de entrada parte; sem ele, um elemento que acabou de aparecer não tem "antes" para animar.',
    ],
  },
  glossario: [
    { termo: 'showModal()', explicacao: 'Abre a janela em modo modal (foco preso, Esc fecha).' },
    { termo: '::backdrop', explicacao: 'Camada atrás do dialog: é ela que fica desfocada.' },
    { termo: '@starting-style', explicacao: 'Estado inicial da animação de entrada.' },
    { termo: 'method="dialog"', explicacao: 'O formulário fecha a janela sem JavaScript.' },
  ],
};
