import { EffectKit } from '../../models/effect-sheet.model';
import { MDN, VALIDADO_EM, cssAngularPagina, cssPagina, nomeClasse } from './_base';

const PALAVRA = 'ORIGEM';
const CORES: Record<string, [string, string, string]> = {
  azul: ['#dff0ff', '#4f8cff', '#13235c'],
  coral: ['#fff0e6', '#ff7a59', '#5c1d13'],
  verde: ['#eaffef', '#3fcf8e', '#0f4a32'],
};

/** Profundidade de cada letra: alternadas (uma na frente do objeto, outra atrás), todas atrás ou todas na frente. */
function zLetra(i: number, modo: string): number {
  if (modo === 'atras') return 3.6;
  if (modo === 'frente') return 2.3;
  return i % 2 ? 2.3 : 3.6;
}

/** Camadas da cena: z = distância da câmera, x/y = posição no mundo (vw/vh). */
function camadas(modo: string) {
  const letras = [...PALAVRA].map((l, i) => ({
    tipo: 'letra',
    texto: l,
    z: zLetra(i, modo),
    x: -36 + i * 14.4,
    y: 0,
  }));
  return [
    { tipo: 'fundo', texto: '', z: 9, x: 0, y: 0 },
    { tipo: 'sujeito', texto: '', z: 3, x: 0, y: 4 },
    ...letras,
  ].sort((a, b) => b.z - a.z);
}

export const DEPTH_ZOOM_TITLE: EffectKit = {
  ficha: {
    id: 'depth-zoom-title',
    nomeTecnico: 'Scroll Depth Zoom (camadas em Z com letras na frente e atrás)',
    nomeAmigavel: 'Mergulho no título em profundidade',
    categoria: 'scroll',
    subcategoria: 'Scrollytelling cinematográfico',
    descricao:
      'A rolagem leva a câmera para dentro da cena: as letras do título estão em profundidades diferentes (umas na frente do objeto, outras atrás) e passam pela câmera uma a uma.',
    objetivoVisual:
      'Dar ao hero a sensação de "câmera entrando", como nos sites premiados em que o animal ou o produto atravessa o título.',
    aplicacoes: [
      'Heros de marcas de moda, esporte e bebida',
      'Abertura de campanhas e lançamentos',
      'Portfólios de 3D e motion',
    ],
    nivel: 'avancado',
    tecnologias: ['HTML', 'CSS', 'JavaScript'],
    dependencias: [],
    interacoes: ['scroll'],
    tags: [
      'profundidade',
      'z-depth',
      'zoom',
      'perspectiva',
      'título',
      'camadas',
      'dolly',
      'scrollytelling',
      'referência em vídeo',
    ],
    explicacao: [
      'Cada camada tem uma distância z da câmera. A rolagem move a câmera (c = p × profundidade) e o tamanho de cada camada é z ÷ (z − c): começa em 1 (o título se lê inteiro) e cresce mais rápido nas camadas mais próximas — é a perspectiva feita à mão.',
      'A posição também é multiplicada pelo mesmo fator, então as letras se afastam do centro ao se aproximarem, como num carro entrando num túnel.',
      'A ordem de desenho (z-index) vem da profundidade: letras com z menor que o do objeto ficam na frente dele; as outras, atrás.',
      'Quando uma camada chega muito perto (z − c pequeno), ela some com opacity para não "explodir" na tela.',
    ],
    alternativa:
      'CSS 3D: perspective no palco e translateZ em cada camada, animando o translateZ do grupo com a rolagem (animation-timeline: scroll()). Com GSAP: ScrollTrigger com scrub animando a variável c.',
    compatibilidade: 'Só transform, opacity e position: sticky — todos os navegadores atuais.',
    responsividade:
      'Posições em vw/vh e tamanhos em vmin: a cena se adapta a qualquer proporção de tela.',
    acessibilidade:
      'O título é um h1 com aria-label com a palavra inteira; as letras soltas são aria-hidden. Com prefers-reduced-motion a cena fica parada no primeiro quadro, com a frase final visível.',
    performance:
      'Por quadro: um transform e uma opacidade por camada (7 camadas), só quando a rolagem muda. Nada de layout.',
    limitacoes: [
      'Com muitas camadas (dezenas), prefira CSS 3D ou WebGL, que fazem a perspectiva na GPU sem JS por camada.',
      'O "objeto" aqui é uma esfera em CSS; num site real, use uma imagem PNG/WebP recortada (com fundo transparente).',
    ],
    referencias: [MDN.transform, MDN.perspective, MDN.scrollTimeline, MDN.reduzir],
    validadoEm: VALIDADO_EM,
    status: 'validado',
  },
  params: [
    {
      id: 'letras',
      rotulo: 'letras',
      tipo: 'select',
      opcoes: [
        { valor: 'alternadas', rotulo: 'alternadas (frente e atrás)' },
        { valor: 'atras', rotulo: 'todas atrás do objeto' },
        { valor: 'frente', rotulo: 'todas na frente' },
      ],
      padrao: 'alternadas',
    },
    {
      id: 'profundidade',
      rotulo: 'quanto a câmera entra',
      tipo: 'range',
      min: 1.5,
      max: 2.9,
      passo: 0.1,
      unidade: '',
      padrao: 2.6,
    },
    {
      id: 'altura',
      rotulo: 'altura da seção',
      tipo: 'range',
      min: 250,
      max: 600,
      passo: 50,
      unidade: 'vh',
      padrao: 400,
    },
    {
      id: 'cor',
      rotulo: 'cor do objeto',
      tipo: 'select',
      opcoes: [
        { valor: 'azul', rotulo: 'azul' },
        { valor: 'coral', rotulo: 'coral' },
        { valor: 'verde', rotulo: 'verde' },
      ],
      padrao: 'azul',
    },
  ],
  gerar: (v) => {
    const lista = camadas(String(v['letras']));
    const [claro, meio, escuro] = CORES[String(v['cor'])] ?? CORES['azul'];
    const html = lista
      .map((c, i) => {
        const dados = `data-z="${c.z}" data-x="${c.x.toFixed(1)}" data-y="${c.y}" style="z-index: ${i + 1}"`;
        if (c.tipo === 'letra')
          return `      <span class="camada letra" ${dados} aria-hidden="true">${c.texto}</span>`;
        if (c.tipo === 'sujeito')
          return `      <span class="camada sujeito" ${dados} role="img" aria-label="Esfera brilhante no centro da cena"></span>`;
        return `      <span class="camada fundo" ${dados}></span>`;
      })
      .join('\n');
    return {
      html: `<section class="intro"><p>Role para baixo ↓</p></section>

<section class="mergulho">
  <div class="palco">
    <h1 class="titulo" aria-label="${PALAVRA[0]}${PALAVRA.slice(1).toLowerCase()}">
${html}
    </h1>
    <p class="frase">Vá além do que se vê.</p>
  </div>
</section>

<section class="fim"><p>Fim da página</p></section>`,
      css: `${cssPagina()}

.mergulho { --p: 0; height: ${v['altura']}vh; }
.palco {
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: hidden;
  background: #eef1f6;
}
.titulo { margin: 0; font-weight: 400; }

/* Toda camada nasce no centro; o JS aplica escala e posição pela profundidade */
.camada {
  display: block;
  position: absolute;
  left: 50%;
  top: 50%;
  translate: -50% -50%;
  transform-origin: center;
  will-change: transform, opacity;
}
.fundo {
  width: 100vw;
  height: 100vh;
  background: radial-gradient(ellipse at 50% 60%, #ffffff 0%, #dfe6f1 55%, #b9c4d6 100%);
}
.sujeito {
  width: 42vmin;
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, ${claro} 0%, ${meio} 38%, ${escuro} 100%);
  box-shadow: 0 30px 80px rgb(0 0 0 / 0.25), inset -20px -30px 60px rgb(0 0 0 / 0.25);
}
.letra {
  font: 400 clamp(4rem, 16vmin, 11rem) / 1 Georgia, 'Times New Roman', serif;
  color: #1c2440;
}
.letra:nth-child(3n) { color: #d7263d; }

.frase {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 12vh;
  z-index: 100;
  margin: 0;
  text-align: center;
  font: 600 clamp(1.4rem, 4vw, 2.6rem) / 1.1 system-ui, sans-serif;
  color: #fff;
  text-shadow: 0 2px 20px rgb(0 0 0 / 0.35);
  opacity: clamp(0, calc((var(--p) - 0.7) * 4), 1);
}

@media (prefers-reduced-motion: reduce) {
  .mergulho { height: auto; }
  .palco { position: relative; }
  .frase { opacity: 1; color: #1c2440; text-shadow: none; }
}`,
      js: `const PROFUNDIDADE = ${v['profundidade']};
const reduzir = matchMedia('(prefers-reduced-motion: reduce)').matches;
const secao = document.querySelector('.mergulho');
const camadas = [...document.querySelectorAll('.camada')].map((el) => ({
  el,
  z: Number(el.dataset.z),
  x: Number(el.dataset.x),
  y: Number(el.dataset.y),
}));

let quadro = 0;
function atualizar() {
  quadro = 0;
  const r = secao.getBoundingClientRect();
  const p = reduzir ? 0 : Math.min(1, Math.max(0, -r.top / (secao.offsetHeight - innerHeight)));
  secao.style.setProperty('--p', p.toFixed(4));
  const c = p * PROFUNDIDADE; // posição da câmera
  for (const k of camadas) {
    const d = k.z - c; // distância até a câmera
    if (d <= 0.15) {
      k.el.style.opacity = '0';
      continue;
    }
    const s = k.z / d; // começa em 1 e cresce ao se aproximar
    k.el.style.transform = 'translate(' + (k.x * s).toFixed(2) + 'vw, ' + (k.y * s).toFixed(2) + 'vh) scale(' + s.toFixed(3) + ')';
    k.el.style.opacity = Math.min(1, (d - 0.15) / 0.45).toFixed(3);
  }
}

addEventListener('scroll', () => {
  if (!quadro) quadro = requestAnimationFrame(atualizar);
}, { passive: true });
atualizar();`,
    };
  },
  angular: (v) => {
    const lista = camadas(String(v['letras']));
    return {
      ts: `import { Component, DestroyRef, ElementRef, afterNextRender, inject, signal, viewChild } from '@angular/core';

interface Camada {
  tipo: 'fundo' | 'sujeito' | 'letra';
  texto: string;
  z: number;
  x: number;
  y: number;
}

@Component({
  selector: 'app-depth-zoom-title',
  templateUrl: './depth-zoom-title.html',
  styleUrl: './depth-zoom-title.css',
})
export class ${nomeClasse('depth-zoom-title')} {
  private readonly profundidade = ${v['profundidade']};
  private readonly secao = viewChild.required<ElementRef<HTMLElement>>('secao');
  /** Da mais longe para a mais perto (a ordem vira o z-index). */
  protected readonly camadas: Camada[] = ${JSON.stringify(lista.map((c) => ({ ...c, x: Number(c.x.toFixed(1)) })))};
  protected readonly p = signal(0);
  /** Transform e opacidade de cada camada, recalculados na rolagem. */
  protected readonly estilos = signal(this.camadas.map(() => ({ transform: '', opacity: 1 })));

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      let quadro = 0;
      const atualizar = () => {
        quadro = 0;
        const el = this.secao().nativeElement;
        const r = el.getBoundingClientRect();
        const p = reduzir ? 0 : Math.min(1, Math.max(0, -r.top / (el.offsetHeight - window.innerHeight)));
        this.p.set(p);
        const c = p * this.profundidade;
        this.estilos.set(
          this.camadas.map((k) => {
            const d = k.z - c;
            if (d <= 0.15) return { transform: 'scale(0)', opacity: 0 };
            const s = k.z / d;
            return {
              transform: \`translate(\${(k.x * s).toFixed(2)}vw, \${(k.y * s).toFixed(2)}vh) scale(\${s.toFixed(3)})\`,
              opacity: Math.min(1, (d - 0.15) / 0.45),
            };
          }),
        );
      };
      const aoRolar = () => {
        if (!quadro) quadro = requestAnimationFrame(atualizar);
      };
      window.addEventListener('scroll', aoRolar, { passive: true });
      atualizar();
      destroyRef.onDestroy(() => {
        window.removeEventListener('scroll', aoRolar);
        cancelAnimationFrame(quadro);
      });
    });
  }
}
`,
      html: `<section #secao class="mergulho" [style.--p]="p()">
  <div class="palco">
    <h1 class="titulo" aria-label="${PALAVRA[0]}${PALAVRA.slice(1).toLowerCase()}">
      @for (k of camadas; track $index; let i = $index) {
        @switch (k.tipo) {
          @case ('letra') {
            <span
              class="camada letra"
              aria-hidden="true"
              [style.z-index]="i + 1"
              [style.transform]="estilos()[i].transform"
              [style.opacity]="estilos()[i].opacity"
              >{{ k.texto }}</span
            >
          }
          @case ('sujeito') {
            <span
              class="camada sujeito"
              role="img"
              aria-label="Esfera brilhante no centro da cena"
              [style.z-index]="i + 1"
              [style.transform]="estilos()[i].transform"
              [style.opacity]="estilos()[i].opacity"
            ></span>
          }
          @default {
            <span
              class="camada fundo"
              [style.z-index]="i + 1"
              [style.transform]="estilos()[i].transform"
              [style.opacity]="estilos()[i].opacity"
            ></span>
          }
        }
      }
    </h1>
    <p class="frase">Vá além do que se vê.</p>
  </div>
</section>
`,
      css: cssAngularPagina(DEPTH_ZOOM_TITLE.gerar(v).css),
    };
  },
  previewAngular: false,
  niveis: {
    iniciante: [
      'É como andar para dentro de uma vitrine: rolando, você chega mais perto da esfera e das letras.',
      'Algumas letras estão na frente da esfera e outras atrás. As da frente passam por você primeiro e somem.',
      'No fim, a esfera ocupa a tela e aparece a frase.',
    ],
    avancado: [
      'Projeção perspectiva à mão: escala = z ÷ (z − câmera), normalizada para que todas as camadas comecem no tamanho de 1×. É o mesmo cálculo que o CSS faz com perspective + translateZ.',
      'A posição x/y também é multiplicada pela escala, então tudo "foge do centro" ao se aproximar — o ponto de fuga é o centro da tela.',
      'O z-index é fixo e vem da ordem por profundidade (as camadas nunca trocam de ordem porque a câmera só anda em z).',
      'No Angular, as camadas são dados e o template usa @for/@switch; os estilos vêm de um signal recalculado na rolagem.',
    ],
  },
  glossario: [
    { termo: 'k.z / d', explicacao: 'Escala da camada: quanto mais perto da câmera, maior.' },
    { termo: 'data-z', explicacao: 'A profundidade de cada camada.' },
    { termo: 'z-index', explicacao: 'Quem fica na frente: as camadas mais próximas.' },
    { termo: 'position: sticky', explicacao: 'Prende a cena na tela enquanto a seção alta passa.' },
  ],
};
