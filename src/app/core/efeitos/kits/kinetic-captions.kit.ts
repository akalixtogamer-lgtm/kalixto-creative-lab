import { EffectKit } from '../../models/effect-sheet.model';
import { CSS_REPETIR, MDN, VALIDADO_EM, cssAngular, cssPalco, nomeClasse } from './_base';

/** Cores de destaque das legendas (a primeira é a das referências em vídeo). */
const DESTAQUES = [
  { valor: '#ff2e3e', rotulo: 'Vermelho' },
  { valor: '#c6ff3d', rotulo: 'Lima' },
  { valor: '#ff2bd6', rotulo: 'Magenta' },
  { valor: '#22e3ff', rotulo: 'Ciano' },
] as const;

const ENTRADAS: Record<string, string> = {
  pop: 'from { opacity: 0; transform: scale(0.55) translateY(0.25em); }',
  subir: 'from { opacity: 0; transform: translateY(0.9em); }',
};

const FRASE = 'A diferença entre o designer e o criador está no movimento';

export const KINETIC_CAPTIONS: EffectKit = {
  ficha: {
    id: 'kinetic-captions',
    nomeTecnico: 'Kinetic Captions (legenda palavra por palavra)',
    nomeAmigavel: 'Legenda cinética',
    categoria: 'tipografia',
    subcategoria: 'Legendas e texto falado',
    descricao:
      'As palavras entram uma por vez, no ritmo da fala, e a palavra "da vez" acende com a cor de destaque — o estilo de legenda dos Reels.',
    objetivoVisual:
      'Prender o olhar no texto e dar ritmo de fala a uma frase, como nas legendas de vídeos curtos.',
    aplicacoes: [
      'Heros com frase de impacto',
      'Vídeos e Reels gravados da tela',
      'Apresentações e manifestos',
    ],
    nivel: 'iniciante',
    tecnologias: ['HTML', 'CSS', 'JavaScript'],
    dependencias: [],
    interacoes: ['autoplay', 'click'],
    tags: [
      'legenda',
      'caption',
      'reels',
      'kinetic typography',
      'palavra por palavra',
      'karaokê',
      'referência em vídeo',
    ],
    explicacao: [
      'O JavaScript só divide a frase em palavras (um <span> para cada) e grava a posição de cada uma na variável --i.',
      'Toda palavra tem duas animações com o mesmo atraso: calc(var(--i) * ritmo). A primeira faz a palavra entrar; a segunda pinta a palavra com a cor de destaque durante uma "batida".',
      'A animação de destaque não tem fill-mode: quando ela termina, a cor volta ao branco. Por isso só uma palavra fica acesa por vez.',
      'O aria-label no parágrafo guarda a frase inteira; os <span> são aria-hidden para o leitor de tela não soletrar palavra por palavra.',
    ],
    alternativa:
      'Com GSAP: SplitText divide as palavras e uma timeline com stagger controla entrada e destaque — útil para sincronizar com um áudio real.',
    compatibilidade: 'Animações CSS e variáveis em calc(): todos os navegadores atuais.',
    responsividade:
      'O tamanho da fonte usa clamp() e a largura é limitada em ch, então a frase quebra em poucas linhas no celular.',
    acessibilidade:
      'A frase completa fica no aria-label. Com prefers-reduced-motion, todas as palavras aparecem paradas, sem destaque piscando.',
    performance:
      'Só opacity, transform e color são animados; não há JavaScript rodando durante a animação.',
    limitacoes: [
      'O ritmo é fixo por palavra: palavras longas e curtas ganham o mesmo tempo. Para sincronizar com áudio, use os tempos reais de cada palavra em --i.',
    ],
    referencias: [MDN.animation, MDN.animationDelay, MDN.reduzir],
    validadoEm: VALIDADO_EM,
    status: 'validado',
  },
  params: [
    {
      id: 'ritmo',
      rotulo: 'ritmo (por palavra)',
      tipo: 'range',
      min: 120,
      max: 600,
      passo: 20,
      unidade: 'ms',
      padrao: 260,
    },
    { id: 'cor', rotulo: 'cor de destaque', tipo: 'select', opcoes: DESTAQUES, padrao: '#ff2e3e' },
    {
      id: 'entrada',
      rotulo: 'entrada da palavra',
      tipo: 'select',
      opcoes: [
        { valor: 'pop', rotulo: 'pop (cresce)' },
        { valor: 'subir', rotulo: 'subir' },
      ],
      padrao: 'pop',
    },
  ],
  gerar: (v) => {
    const ritmo = Number(v['ritmo']);
    return {
      html: `<p class="legenda" aria-label="${FRASE}"></p>
<button class="repetir" type="button">Repetir</button>`,
      css: `${cssPalco()}

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
    entrar 320ms cubic-bezier(0.34, 1.56, 0.64, 1) calc(var(--i) * ${ritmo}ms) both,
    destaque ${ritmo}ms steps(1) calc(var(--i) * ${ritmo}ms);
}
@keyframes entrar {
  ${ENTRADAS[String(v['entrada'])]}
}
/* sem fill-mode: ao terminar, a cor volta ao normal */
@keyframes destaque {
  0%, 100% { color: ${v['cor']}; }
}
${CSS_REPETIR}

@media (prefers-reduced-motion: reduce) {
  .palavra { animation: none; }
}`,
      js: `const legenda = document.querySelector('.legenda');
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
document.querySelector('.repetir').addEventListener('click', montar);`,
    };
  },
  angular: (v) => ({
    ts: `import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-kinetic-captions',
  templateUrl: './kinetic-captions.html',
  styleUrl: './kinetic-captions.css',
})
export class ${nomeClasse('kinetic-captions')} {
  protected readonly frase = '${FRASE}';
  protected readonly palavras = this.frase.split(' ');

  /** Muda a cada clique em Repetir; o @for recria as palavras e a animação recomeça. */
  protected readonly ciclo = signal(0);

  protected repetir(): void {
    this.ciclo.update((n) => n + 1);
  }
}
`,
    html: `@for (c of [ciclo()]; track c) {
  <p class="legenda" [attr.aria-label]="frase">
    @for (p of palavras; track $index) {
      <span class="palavra" aria-hidden="true" [style.--i]="$index">{{ p }}</span>
    }
  </p>
}
<button class="repetir" type="button" (click)="repetir()">Repetir</button>
`,
    css: cssAngular(KINETIC_CAPTIONS.gerar(v).css),
  }),
  niveis: {
    iniciante: [
      'A frase é cortada em palavras, e cada palavra vira um pedacinho separado.',
      'As palavras aparecem uma depois da outra, como se alguém estivesse falando.',
      'A palavra que acabou de aparecer fica colorida por um instante e depois volta ao branco.',
    ],
    avancado: [
      'Duas animações no mesmo elemento, separadas por vírgula, compartilham o atraso calculado: entrada e destaque ficam sincronizadas sem JavaScript de tempo.',
      'steps(1) no destaque troca a cor de uma vez (sem transição gradual), como o "corte seco" das legendas de vídeo.',
      'Para legendas reais, gere --i a partir dos tempos de uma transcrição (WebVTT) e use animation-delay em segundos.',
      'No Angular, o @for externo com a chave ciclo() recria o parágrafo inteiro e reinicia todas as animações de uma vez.',
    ],
  },
  glossario: [
    {
      termo: 'calc(var(--i) *',
      explicacao: 'Atraso de cada palavra: a posição dela vezes o ritmo.',
    },
    { termo: 'steps(1)', explicacao: 'Troca a cor de uma vez, sem degradê entre os estados.' },
    { termo: 'aria-label', explicacao: 'Frase completa para o leitor de tela.' },
    {
      termo: 'replaceChildren',
      explicacao: 'Troca todos os filhos do parágrafo de uma vez (recria as palavras).',
    },
  ],
};
