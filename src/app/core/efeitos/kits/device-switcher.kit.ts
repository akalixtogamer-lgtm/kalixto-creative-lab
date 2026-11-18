import { EASINGS, VALIDADO_EM, cssAngular, cssPalco, nomeClasse } from './_base';
import { EffectKit } from '../../models/effect-sheet.model';

const DISPOSITIVOS = [
  { id: 'computador', rotulo: 'Computador', largura: '100%', proporcao: '16 / 10', raio: '12px' },
  { id: 'tablet', rotulo: 'Tablet', largura: '48%', proporcao: '3 / 4', raio: '22px' },
  { id: 'celular', rotulo: 'Celular', largura: '30%', proporcao: '9 / 19', raio: '30px' },
];

const INDICADORES: Record<string, string> = {
  pilula: `.indicador { inset: 4px auto 4px 0; border-radius: 999px; background: #ff6a1a; }
.opcao[aria-pressed='true'] { color: #160b05; }`,
  sublinhado: `.indicador { bottom: 0; left: 0; height: 3px; border-radius: 3px; background: #ff6a1a; }
.opcao[aria-pressed='true'] { color: #ff6a1a; }`,
};

export const DEVICE_SWITCHER: EffectKit = {
  ficha: {
    id: 'device-switcher',
    nomeTecnico: 'Device Preview Switcher',
    nomeAmigavel: 'Troca de dispositivo (computador, tablet, celular)',
    categoria: 'microinteracoes',
    subcategoria: 'Controles segmentados',
    descricao: 'Um controle segmentado com indicador deslizante troca a moldura da prévia entre computador, tablet e celular; a moldura se transforma suavemente e o conteúdo se reorganiza.',
    objetivoVisual: 'Provar que um site é responsivo, de forma visual e interativa — o cliente "vê" o celular sem precisar abrir no celular.',
    aplicacoes: ['Apresentação de site para cliente', 'Portfólio e estudos de caso', 'Ferramentas de prévia e editores'],
    nivel: 'intermediario',
    tecnologias: ['HTML', 'CSS', 'JavaScript'],
    dependencias: [],
    interacoes: ['click', 'keyboard'],
    tags: ['responsivo', 'device', 'dispositivo', 'segmented control', 'controle segmentado', 'indicador deslizante', 'container queries', 'referência em vídeo'],
    explicacao: [
      'Cada opção do controle é um botão com aria-pressed. Ao clicar, o JS mede a posição e a largura do botão e move o indicador para lá (translate + width com transição).',
      'A moldura recebe as medidas do dispositivo em variáveis (--largura, --proporcao, --raio) e as transições fazem ela "virar" outro aparelho.',
      'O conteúdo dentro da moldura usa container queries (@container): quando a moldura fica estreita, a grade passa de 3 para 2 colunas (tablet) e 1 (celular) — é o mesmo site se adaptando, não uma imagem trocada.',
    ],
    alternativa: 'Para mostrar o site real, coloque um <iframe> dentro da moldura; com View Transitions, a troca de layout do conteúdo também ganha animação automática.',
    compatibilidade: 'Container queries e aspect-ratio animado: Chrome/Edge 105+, Firefox 110+, Safari 16+.',
    responsividade: 'A própria moldura é relativa ao palco; no celular a prévia de "computador" ocupa a largura toda.',
    acessibilidade: 'Os botões são um grupo (role="group") com aria-pressed e funcionam no teclado. Com prefers-reduced-motion a troca é instantânea.',
    performance: 'Transicionar width e aspect-ratio refaz o layout da moldura (só ela). Para dezenas de molduras, prefira scale.',
    limitacoes: ['aspect-ratio animado interpola entre proporções; em navegadores antigos a troca acontece sem transição.'],
    referencias: [
      { titulo: 'MDN — CSS container queries', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries' },
      { titulo: 'MDN — aria-pressed', url: 'https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-pressed' },
      { titulo: 'MDN — prefers-reduced-motion', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion' },
    ],
    validadoEm: VALIDADO_EM,
    status: 'validado',
  },
  params: [
    { id: 'duracao', rotulo: 'duração da troca', tipo: 'range', min: 300, max: 1200, passo: 50, unidade: 'ms', padrao: 600 },
    { id: 'easing', rotulo: 'curva (easing)', tipo: 'select', opcoes: EASINGS, padrao: 'cubic-bezier(0.22, 1, 0.36, 1)' },
    {
      id: 'indicador',
      rotulo: 'estilo do indicador',
      tipo: 'select',
      opcoes: [
        { valor: 'pilula', rotulo: 'pílula' },
        { valor: 'sublinhado', rotulo: 'sublinhado' },
      ],
      padrao: 'pilula',
    },
  ],
  gerar: (v) => {
    const t = `${v['duracao']}ms ${v['easing']}`;
    return {
      html: `<div class="segmentos" role="group" aria-label="Ver em">
  <span class="indicador" aria-hidden="true"></span>
${DISPOSITIVOS.map((d, i) => `  <button class="opcao" type="button" aria-pressed="${i === 0}" data-largura="${d.largura}" data-proporcao="${d.proporcao}" data-raio="${d.raio}">${d.rotulo}</button>`).join('\n')}
</div>
<section class="area-previa">
  <div class="moldura">
    <div class="site-falso">
      <header><span class="logo"></span><span class="menu"></span></header>
      <h2>Lumen Residencial</h2>
      <div class="cards"><span></span><span></span><span></span></div>
    </div>
  </div>
</section>`,
      css: `${cssPalco()}

/* Controle segmentado com indicador que desliza */
.segmentos {
  position: relative;
  display: inline-flex;
  padding: 4px;
  border: 1px solid rgb(255 255 255 / 0.12);
  border-radius: 999px;
  background: #15110d;
}
.indicador {
  position: absolute;
  width: var(--w, 0px);
  translate: var(--x, 0px) 0;
  transition: translate ${t}, width ${t};
}
${INDICADORES[String(v['indicador'])]}
.opcao {
  position: relative;
  padding: 8px 16px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: #c9c3ea;
  font: 600 13px system-ui, sans-serif;
  cursor: pointer;
  transition: color 300ms ease;
}
.opcao:focus-visible { outline: 2px solid #22e3ff; outline-offset: 2px; }

/* A moldura vira outro aparelho trocando três medidas */
.area-previa { display: grid; place-items: center; width: min(100%, 620px); height: 420px; }
.moldura {
  --largura: 100%;
  --proporcao: 16 / 10;
  --raio: 12px;
  width: var(--largura);
  max-height: 100%;
  aspect-ratio: var(--proporcao);
  padding: 8px;
  border: 2px solid #3a3456;
  border-radius: var(--raio);
  background: #0f0c18;
  container-type: inline-size; /* o conteúdo reage à largura da moldura */
  transition: width ${t}, aspect-ratio ${t}, border-radius ${t};
}
.site-falso {
  display: grid;
  align-content: start;
  gap: 10px;
  height: 100%;
  padding: 12px;
  border-radius: calc(var(--raio) - 6px);
  background: linear-gradient(180deg, #2a1d14, #120d0a);
  overflow: hidden;
}
.site-falso header { display: flex; justify-content: space-between; }
.logo { width: 40px; height: 10px; border-radius: 4px; background: #ff6a1a; }
.menu { width: 60px; height: 10px; border-radius: 4px; background: rgb(255 255 255 / 0.2); }
.site-falso h2 { margin: 8px 0; font: 400 clamp(1rem, 7cqi, 2.4rem) / 1 Georgia, serif; color: #f6e9dc; }
.cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.cards span { aspect-ratio: 4 / 3; border-radius: 8px; background: linear-gradient(135deg, #ff6a1a, #6b2a0c); }
/* moldura média (tablet): duas colunas; estreita (celular): uma */
@container (max-width: 420px) {
  .cards { grid-template-columns: repeat(2, 1fr); }
}
@container (max-width: 220px) {
  .cards { grid-template-columns: 1fr; }
}

@media (prefers-reduced-motion: reduce) {
  .indicador, .moldura, .opcao { transition: none; }
}`,
      js: `const grupo = document.querySelector('.segmentos');
const indicador = grupo.querySelector('.indicador');
const opcoes = [...grupo.querySelectorAll('.opcao')];
const moldura = document.querySelector('.moldura');

// leva o indicador para baixo do botão escolhido
function moverIndicador(botao) {
  indicador.style.setProperty('--x', botao.offsetLeft + 'px');
  indicador.style.setProperty('--w', botao.offsetWidth + 'px');
}

function escolher(botao) {
  opcoes.forEach((o) => o.setAttribute('aria-pressed', String(o === botao)));
  moverIndicador(botao);
  moldura.style.setProperty('--largura', botao.dataset.largura);
  moldura.style.setProperty('--proporcao', botao.dataset.proporcao);
  moldura.style.setProperty('--raio', botao.dataset.raio);
}

opcoes.forEach((o) => o.addEventListener('click', () => escolher(o)));
moverIndicador(opcoes[0]);`,
    };
  },
  angular: (v) => ({
    ts: `import { Component, ElementRef, afterNextRender, signal, viewChildren } from '@angular/core';

interface Dispositivo {
  id: string;
  rotulo: string;
  largura: string;
  proporcao: string;
  raio: string;
}

@Component({
  selector: 'app-device-switcher',
  templateUrl: './device-switcher.html',
  styleUrl: './device-switcher.css',
})
export class ${nomeClasse('device-switcher')} {
  protected readonly dispositivos: Dispositivo[] = ${JSON.stringify(DISPOSITIVOS, null, 2).replace(/\n/g, '\n  ').replace(/"(\w+)":/g, '$1:').replace(/"/g, "'")};
  private readonly botoes = viewChildren<ElementRef<HTMLButtonElement>>('opcao');

  protected readonly atual = signal(this.dispositivos[0]);
  protected readonly x = signal('0px');
  protected readonly w = signal('0px');

  constructor() {
    afterNextRender(() => this.medir(0));
  }

  protected escolher(i: number): void {
    this.atual.set(this.dispositivos[i]);
    this.medir(i);
  }

  /** Leva o indicador para baixo do botão escolhido. */
  private medir(i: number): void {
    const b = this.botoes()[i]?.nativeElement;
    if (!b) return;
    this.x.set(b.offsetLeft + 'px');
    this.w.set(b.offsetWidth + 'px');
  }
}
`,
    html: `<div class="segmentos" role="group" aria-label="Ver em">
  <span class="indicador" aria-hidden="true" [style.--x]="x()" [style.--w]="w()"></span>
  @for (d of dispositivos; track d.id; let i = $index) {
    <button #opcao class="opcao" type="button" [attr.aria-pressed]="atual().id === d.id" (click)="escolher(i)">
      {{ d.rotulo }}
    </button>
  }
</div>
<section class="area-previa">
  <div class="moldura" [style.--largura]="atual().largura" [style.--proporcao]="atual().proporcao" [style.--raio]="atual().raio">
    <div class="site-falso">
      <header><span class="logo"></span><span class="menu"></span></header>
      <h2>Lumen Residencial</h2>
      <div class="cards"><span></span><span></span><span></span></div>
    </div>
  </div>
</section>
`,
    css: cssAngular(DEVICE_SWITCHER.gerar(v).css),
  }),
  niveis: {
    iniciante: [
      'Três botões em cima: Computador, Tablet e Celular. Uma "pílula" desliza para baixo do botão escolhido.',
      'A moldura da prévia muda de formato, como se o site trocasse de aparelho.',
      'Dentro dela, os cartões mudam de três colunas para duas (tablet) e uma (celular), igual a um site de verdade.',
    ],
    avancado: [
      'offsetLeft/offsetWidth do botão dão a posição exata do indicador, mesmo com rótulos de tamanhos diferentes.',
      'container-type: inline-size na moldura + @container (max-width) faz o conteúdo responder à moldura, não à janela — é o que permite simular o celular dentro do computador.',
      'Unidade cqi (1% da largura do contêiner) no título faz a fonte encolher junto com a moldura.',
      'No Angular, o dispositivo atual é um signal; a moldura recebe as três medidas com [style.--largura] etc.',
    ],
  },
  glossario: [
    { termo: 'container-type: inline-size', explicacao: 'A moldura vira um contêiner que o conteúdo consegue "medir".' },
    { termo: '@container', explicacao: 'Regra que muda o layout conforme a largura da moldura.' },
    { termo: 'offsetLeft', explicacao: 'Posição do botão, usada para mover o indicador.' },
    { termo: 'aria-pressed', explicacao: 'Marca qual dispositivo está selecionado.' },
  ],
};
