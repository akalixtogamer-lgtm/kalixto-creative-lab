import { EffectKit } from '../../models/effect-sheet.model';
import { MDN, VALIDADO_EM, cssAngular, cssPalco, nomeClasse } from './_base';

/** Atraso (0 → 1) de cada célula conforme o padrão escolhido. */
const ORDENS: Record<string, string> = {
  aleatorio: 'Math.random()',
  diagonal: '(c / (colunas - 1) + l / (linhas - 1)) / 2',
  centro: 'Math.hypot(c - (colunas - 1) / 2, l - (linhas - 1) / 2) / Math.hypot((colunas - 1) / 2, (linhas - 1) / 2)',
};

export const TILE_GRID_REVEAL: EffectKit = {
  ficha: {
    id: 'tile-grid-reveal',
    nomeTecnico: 'Tile Grid Reveal (mosaico de células)',
    nomeAmigavel: 'Mosaico de células que acendem',
    categoria: 'backgrounds',
    subcategoria: 'Grades e mosaicos animados',
    descricao: 'Uma parede de pequenas células em vários tons acende aos poucos (aleatório, em diagonal ou do centro para fora) e forma o fundo de um título; passar o mouse acende as células de novo.',
    objetivoVisual: 'Visualizar "muitos dados" ou "muitos testes" — como uma plantação vista de cima ou uma planilha viva — atrás de uma frase de impacto.',
    aplicacoes: ['Seções sobre dados e pesquisa', 'Fundo de hero de tecnologia', 'Transições entre seções'],
    nivel: 'iniciante',
    tecnologias: ['HTML', 'CSS', 'JavaScript'],
    dependencias: [],
    interacoes: ['autoplay', 'hover', 'click'],
    tags: ['grid', 'mosaico', 'tiles', 'células', 'stagger', 'pixel', 'fundo animado', 'referência em vídeo'],
    explicacao: [
      'O JavaScript cria as células numa CSS Grid e dá a cada uma duas variáveis: --d (o atraso, de 0 a 1, conforme o padrão) e --l (a luminosidade, sorteada, para variar o tom).',
      'Toda a animação é CSS: cada célula entra com animation-delay = --d × duração. O padrão "diagonal" soma coluna e linha; o "centro" usa a distância até o meio.',
      'No hover, a célula ganha brilho na hora e volta devagar (transição só na saída), deixando um rastro por onde o mouse passa.',
    ],
    alternativa: 'Em canvas, desenhando retângulos num loop — melhor para grades com milhares de células. Com GSAP: gsap.from(celulas, { opacity: 0, stagger: { grid: [linhas, colunas], from: "center" } }).',
    compatibilidade: 'CSS Grid, variáveis em calc() e animações: todos os navegadores atuais.',
    responsividade: 'As colunas são fixas e as células quadradas (aspect-ratio), então a grade escala com a largura do palco.',
    acessibilidade: 'A grade é decorativa (aria-hidden); o título é texto real por cima. Com prefers-reduced-motion as células aparecem prontas, sem animação.',
    performance: 'Só opacity e scale animados. Com 16 colunas × 10 linhas são 160 elementos — leve. Acima de ~1000 células, prefira canvas.',
    limitacoes: ['Muitas células = muitos elementos no DOM; mantenha a grade moderada ou use canvas.'],
    referencias: [{ titulo: 'MDN — CSS Grid Layout', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout' }, MDN.animationDelay, MDN.reduzir],
    validadoEm: VALIDADO_EM,
    status: 'validado',
  },
  params: [
    { id: 'colunas', rotulo: 'colunas', tipo: 'range', min: 8, max: 24, passo: 2, unidade: '', padrao: 16 },
    { id: 'duracao', rotulo: 'tempo total', tipo: 'range', min: 600, max: 3000, passo: 100, unidade: 'ms', padrao: 1800 },
    {
      id: 'padrao',
      rotulo: 'ordem das células',
      tipo: 'select',
      opcoes: [
        { valor: 'aleatorio', rotulo: 'aleatória' },
        { valor: 'diagonal', rotulo: 'diagonal' },
        { valor: 'centro', rotulo: 'do centro para fora' },
      ],
      padrao: 'aleatorio',
    },
  ],
  gerar: (v) => {
    const colunas = Number(v['colunas']);
    return {
      html: `<section class="mosaico-palco">
  <div class="mosaico" aria-hidden="true"></div>
  <h1>Testar, testar e testar.</h1>
</section>
<button class="repetir" type="button">Repetir</button>`,
      css: `${cssPalco()}

.mosaico-palco {
  position: relative;
  display: grid;
  place-items: center;
  width: min(100%, 680px);
  border-radius: 20px;
  overflow: hidden;
  background: #071009;
}
.mosaico {
  display: grid;
  grid-template-columns: repeat(${colunas}, 1fr);
  gap: 3px;
  width: 100%;
  padding: 3px;
}
/* cada célula: tom sorteado (--l) e atraso pelo padrão (--d) */
.celula {
  aspect-ratio: 1;
  border-radius: 2px;
  background: hsl(95 70% var(--l));
  animation: acender 500ms cubic-bezier(0.22, 1, 0.36, 1) calc(var(--d) * ${v['duracao']}ms) both;
  transition: filter 900ms ease;
}
@keyframes acender {
  from { opacity: 0; scale: 0.4; }
}
/* rastro do mouse: acende na hora, apaga devagar */
.celula:hover { filter: brightness(2.2); transition: none; }

.mosaico-palco h1 {
  position: absolute;
  margin: 0;
  padding: 0 24px;
  font: 800 clamp(1.8rem, 7vw, 3.6rem) / 1 system-ui, sans-serif;
  letter-spacing: -0.03em;
  text-align: center;
  text-shadow: 0 4px 30px rgb(0 0 0 / 0.8);
  pointer-events: none;
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

@media (prefers-reduced-motion: reduce) {
  .celula { animation: none; transition: none; }
}`,
      js: `const mosaico = document.querySelector('.mosaico');
const colunas = ${colunas};
const linhas = Math.round(colunas * 0.6);

function montar() {
  const celulas = [];
  for (let l = 0; l < linhas; l++) {
    for (let c = 0; c < colunas; c++) {
      const celula = document.createElement('span');
      celula.className = 'celula';
      celula.style.setProperty('--d', (${ORDENS[String(v['padrao'])]}).toFixed(3));
      celula.style.setProperty('--l', 8 + Math.round(Math.random() * 24) + '%');
      celulas.push(celula);
    }
  }
  mosaico.replaceChildren(...celulas); // recriar reinicia as animações
}

montar();
document.querySelector('.repetir').addEventListener('click', montar);`,
    };
  },
  angular: (v) => {
    const colunas = Number(v['colunas']);
    return {
      ts: `import { Component, signal } from '@angular/core';

interface Celula {
  d: string;
  l: string;
}

@Component({
  selector: 'app-tile-grid-reveal',
  templateUrl: './tile-grid-reveal.html',
  styleUrl: './tile-grid-reveal.css',
})
export class ${nomeClasse('tile-grid-reveal')} {
  /** Muda a cada Repetir: o @for recria as células e as animações recomeçam. */
  protected readonly ciclo = signal(0);
  protected readonly celulas = signal(this.criar());

  protected repetir(): void {
    this.celulas.set(this.criar());
    this.ciclo.update((n) => n + 1);
  }

  private criar(): Celula[] {
    const colunas = ${colunas};
    const linhas = Math.round(colunas * 0.6);
    const lista: Celula[] = [];
    for (let l = 0; l < linhas; l++) {
      for (let c = 0; c < colunas; c++) {
        lista.push({
          d: (${ORDENS[String(v['padrao'])]}).toFixed(3),
          l: 8 + Math.round(Math.random() * 24) + '%',
        });
      }
    }
    return lista;
  }
}
`,
      html: `<section class="mosaico-palco">
  @for (k of [ciclo()]; track k) {
    <div class="mosaico" aria-hidden="true">
      @for (cel of celulas(); track $index) {
        <span class="celula" [style.--d]="cel.d" [style.--l]="cel.l"></span>
      }
    </div>
  }
  <h1>Testar, testar e testar.</h1>
</section>
<button class="repetir" type="button" (click)="repetir()">Repetir</button>
`,
      css: cssAngular(TILE_GRID_REVEAL.gerar(v).css),
    };
  },
  niveis: {
    iniciante: [
      'O fundo é uma parede de quadradinhos verdes, cada um num tom diferente.',
      'Os quadradinhos aparecem aos poucos: espalhados, em diagonal ou a partir do meio.',
      'Passando o mouse, os quadradinhos acendem e vão apagando devagar, deixando um rastro.',
    ],
    avancado: [
      'Calcular só um número (--d de 0 a 1) e multiplicar pela duração no CSS deixa o padrão independente do tempo total.',
      'Distância normalizada ao centro (dividida pela distância do canto) garante que o último a acender seja sempre o canto, em qualquer tamanho de grade.',
      'Transição só na saída: transition: none no :hover e transition normal fora dele — o "acender" é instantâneo e o "apagar" é lento.',
      'No Angular, o @for externo com a chave ciclo() recria a grade inteira e reinicia as animações.',
    ],
  },
  glossario: [
    { termo: 'grid-template-columns: repeat(', explicacao: 'Quantidade de colunas da grade.' },
    { termo: 'calc(var(--d) *', explicacao: 'Atraso de cada célula conforme o padrão.' },
    { termo: 'hsl(95 70% var(--l))', explicacao: 'Mesmo verde em luminosidades sorteadas.' },
    { termo: 'replaceChildren', explicacao: 'Troca todas as células de uma vez (reinicia a animação).' },
  ],
};
