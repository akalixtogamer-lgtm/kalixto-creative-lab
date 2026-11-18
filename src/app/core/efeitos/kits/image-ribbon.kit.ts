import { EffectKit } from '../../models/effect-sheet.model';
import { MDN, VALIDADO_EM, cssAngular, cssPalco, nomeClasse } from './_base';

export const IMAGE_RIBBON: EffectKit = {
  ficha: {
    id: 'image-ribbon',
    nomeTecnico: '3D Image Ribbon (cilindro CSS)',
    nomeAmigavel: 'Fita 3D de imagens',
    categoria: 'cards-imagens',
    subcategoria: 'Carrosséis e galerias 3D',
    descricao: 'Uma fita de cards gira em volta de um título, passando por trás e pela frente dele — a galeria em "anel" dos sites de estúdio.',
    objetivoVisual: 'Mostrar muitos trabalhos de uma vez, com movimento contínuo e profundidade, sem tirar o foco do título.',
    aplicacoes: ['Heros de portfólio e agência', 'Vitrine de projetos', 'Telas de abertura de eventos'],
    nivel: 'intermediario',
    tecnologias: ['HTML', 'CSS', 'JavaScript'],
    dependencias: [],
    interacoes: ['autoplay', 'hover', 'click'],
    tags: ['carrossel 3d', 'ribbon', 'anel', 'cilindro', 'galeria', 'rotateY', 'translateZ', 'referência em vídeo'],
    explicacao: [
      'Os cards ficam todos no mesmo ponto. Cada um gira rotateY(i × 360° ÷ total) e depois anda translateZ(raio) "para fora": juntos, formam um cilindro.',
      'A .fita inteira gira de 0 a -360° numa animação infinita e linear, então os cards desfilam em volta do centro.',
      'O título está dentro da mesma cena 3D (preserve-3d), no centro do cilindro: os cards da frente passam por cima dele e os de trás passam por baixo.',
      'Uma inclinação (rotateX + rotateZ) na cena tira a fita do horizonte e dá o aspecto de "anel" visto de cima.',
    ],
    alternativa: 'Em Three.js, planos com texturas posicionados num CylinderGeometry dão curvatura real nas imagens (cada card dobra junto com o anel).',
    compatibilidade: 'Transformações 3D e preserve-3d: todos os navegadores atuais.',
    responsividade: 'O raio e o tamanho dos cards usam min() com a largura da tela, então o anel encolhe no celular.',
    acessibilidade: 'Movimento automático com mais de 5 s precisa de pausa (WCAG 2.2.2): o botão Pausar para a fita, e o hover também pausa. Com prefers-reduced-motion, a fita fica parada.',
    performance: 'Só um transform muda por quadro (o da fita); os cards não são recalculados. Aguenta dezenas de cards com imagens.',
    limitacoes: [
      'Os cards são planos: num raio pequeno com muitos cards, as quinas aparecem. Aumente o raio ou diminua a quantidade.',
      'Com imagens reais, use loading="lazy" e tamanhos pequenos — todas ficam no DOM ao mesmo tempo.',
    ],
    referencias: [MDN.transform, MDN.perspective, MDN.wcagMovimento],
    validadoEm: VALIDADO_EM,
    status: 'validado',
  },
  params: [
    { id: 'quantidade', rotulo: 'quantidade de cards', tipo: 'range', min: 6, max: 16, passo: 1, unidade: '', padrao: 10 },
    { id: 'raio', rotulo: 'raio do anel', tipo: 'range', min: 160, max: 360, passo: 10, unidade: 'px', padrao: 240 },
    { id: 'velocidade', rotulo: 'tempo de uma volta', tipo: 'range', min: 8, max: 40, passo: 1, unidade: 's', padrao: 18 },
    { id: 'inclinacao', rotulo: 'inclinação do anel', tipo: 'range', min: -20, max: 20, passo: 1, unidade: 'deg', padrao: -8 },
  ],
  gerar: (v) => {
    const total = Number(v['quantidade']);
    return {
      html: `<div class="cena">
  <div class="fita" style="--total: ${total}"></div>
  <h1 class="titulo">Criamos<br>rápido</h1>
</div>
<button class="pausar" type="button" aria-pressed="false">Pausar</button>`,
      css: `${cssPalco()}

.cena {
  position: relative;
  display: grid;
  place-items: center;
  width: min(100%, 640px);
  aspect-ratio: 16 / 10;
  perspective: 1400px;
  transform-style: preserve-3d;
}
/* o anel inclinado: tira a fita do horizonte */
.fita {
  position: absolute;
  transform-style: preserve-3d;
  transform: rotateX(-6deg) rotateZ(${v['inclinacao']}deg);
}
/* cada card: gira para a sua posição e "anda" até a borda do cilindro */
.card {
  --w: min(22vw, 112px);
  position: absolute;
  left: calc(var(--w) / -2);
  top: calc(var(--w) * -0.375); /* metade da altura (4:3) */
  width: var(--w);
  aspect-ratio: 4 / 3;
  border-radius: 10px;
  background: var(--fundo);
  box-shadow: 0 10px 30px rgb(0 0 0 / 0.35);
  transform: rotateY(calc(var(--i) * 360deg / var(--total))) translateZ(min(38vw, ${v['raio']}px));
}
/* a fita inteira gira sem parar */
.giro {
  transform-style: preserve-3d;
  animation: girar ${v['velocidade']}s linear infinite;
}
@keyframes girar { to { transform: rotateY(-360deg); } }
.cena:hover .giro,
.cena.is-pausada .giro { animation-play-state: paused; }

.titulo {
  position: relative;
  margin: 0;
  font: 700 clamp(2.4rem, 11vw, 5rem) / 0.95 Georgia, 'Times New Roman', serif;
  text-align: center;
  letter-spacing: -0.02em;
}

.pausar {
  padding: 8px 16px;
  border: 1px solid #3a3456;
  border-radius: 999px;
  background: transparent;
  color: #c9c3ea;
  font: inherit;
  cursor: pointer;
}
.pausar:focus-visible { outline: 2px solid #22e3ff; outline-offset: 3px; }

@media (prefers-reduced-motion: reduce) {
  .giro { animation: none; }
}`,
      js: `const cena = document.querySelector('.cena');
const fita = document.querySelector('.fita');
const total = ${total};

// a fita é um grupo que gira; dentro dele, os cards em volta do cilindro
const giro = document.createElement('div');
giro.className = 'giro';
for (let i = 0; i < total; i++) {
  const card = document.createElement('div');
  card.className = 'card';
  card.style.setProperty('--i', i);
  // sem imagens externas: um degradê com o matiz espalhado pelo círculo de cores
  const matiz = Math.round((i * 360) / total);
  card.style.setProperty('--fundo', 'linear-gradient(135deg, hsl(' + matiz + ' 85% 62%), hsl(' + (matiz + 40) + ' 80% 35%))');
  giro.append(card);
}
fita.append(giro);

// WCAG 2.2.2: movimento automático precisa de pausa
const botao = document.querySelector('.pausar');
botao.addEventListener('click', () => {
  const pausada = cena.classList.toggle('is-pausada');
  botao.setAttribute('aria-pressed', String(pausada));
  botao.textContent = pausada ? 'Continuar' : 'Pausar';
});`,
    };
  },
  angular: (v) => {
    const total = Number(v['quantidade']);
    return {
      ts: `import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-image-ribbon',
  templateUrl: './image-ribbon.html',
  styleUrl: './image-ribbon.css',
})
export class ${nomeClasse('image-ribbon')} {
  protected readonly total = ${total};
  protected readonly pausada = signal(false);

  /** Um degradê por card, com o matiz espalhado pelo círculo de cores. */
  protected readonly cards = Array.from({ length: this.total }, (_, i) => {
    const matiz = Math.round((i * 360) / this.total);
    return \`linear-gradient(135deg, hsl(\${matiz} 85% 62%), hsl(\${matiz + 40} 80% 35%))\`;
  });
}
`,
      html: `<div class="cena" [class.is-pausada]="pausada()">
  <div class="fita" [style.--total]="total">
    <div class="giro">
      @for (fundo of cards; track $index) {
        <div class="card" [style.--i]="$index" [style.--fundo]="fundo"></div>
      }
    </div>
  </div>
  <h1 class="titulo">Criamos<br />rápido</h1>
</div>
<button class="pausar" type="button" [attr.aria-pressed]="pausada()" (click)="pausada.set(!pausada())">
  {{ pausada() ? 'Continuar' : 'Pausar' }}
</button>
`,
      css: cssAngular(IMAGE_RIBBON.gerar(v).css),
    };
  },
  niveis: {
    iniciante: [
      'Vários cartões coloridos ficam em volta de um título, formando um anel.',
      'O anel gira sem parar: os cartões passam na frente do título e depois por trás dele.',
      'O botão Pausar (ou o mouse em cima) faz o anel parar.',
    ],
    avancado: [
      'Ordem dos transforms no card: primeiro rotateY (direção), depois translateZ (distância). Invertida, todos os cards iriam para o mesmo ponto e só girariam no lugar.',
      'O giro fica num elemento próprio (.giro) separado da inclinação (.fita): assim a animação não sobrescreve o rotateX/rotateZ.',
      'perspective na .cena define a "lente": valores menores exageram a profundidade; maiores achatam o anel.',
      'Para imagens reais, troque --fundo por url() e use background-size: cover; no Angular, ligue cada URL com [style.--fundo].',
    ],
  },
  glossario: [
    { termo: 'rotateY(calc(var(--i) * 360deg / var(--total)))', explicacao: 'Direção de cada card no círculo.' },
    { termo: 'translateZ(', explicacao: 'Leva o card até a borda do cilindro (o raio).' },
    { termo: 'animation-play-state: paused', explicacao: 'Congela o giro no ponto em que está.' },
    { termo: 'preserve-3d', explicacao: 'Mantém título e cards no mesmo espaço 3D (um passa na frente do outro).' },
  ],
};
