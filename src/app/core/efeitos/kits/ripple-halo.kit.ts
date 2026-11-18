import { EffectKit } from '../../models/effect-sheet.model';
import { MDN, VALIDADO_EM, cssAngular, cssPalco, nomeClasse } from './_base';

const BRILHOS: Record<string, string> = {
  iridescente: 'conic-gradient(from 0deg, #ff9ad5, #ffe27a, #8ef0c6, #7fb2ff, #c9a2ff, #ff9ad5)',
  dourado: 'conic-gradient(from 0deg, #ffe7a1, #f5b73b, #fff3c4, #e09a1e, #ffe7a1)',
  branco: 'conic-gradient(from 0deg, #ffffff, #dfe9ff, #ffffff, #e9e0ff, #ffffff)',
};

export const RIPPLE_HALO: EffectKit = {
  ficha: {
    id: 'ripple-halo',
    nomeTecnico: 'Iridescent Ripple Halo',
    nomeAmigavel: 'Halo de anéis que pulsam',
    categoria: 'backgrounds',
    subcategoria: 'Brilhos e auras',
    descricao: 'Anéis de luz iridescente nascem atrás de um objeto e se expandem em ondas, como um halo ou a vibração de um som — o objeto parece "especial".',
    objetivoVisual: 'Destacar um produto, ícone ou personagem no centro da cena com uma aura viva.',
    aplicacoes: ['Produto em destaque no hero', 'Ícone de conquista ou prêmio', 'Botão de gravar/ouvir em apps de áudio'],
    nivel: 'iniciante',
    tecnologias: ['HTML', 'CSS', 'JavaScript'],
    dependencias: [],
    interacoes: ['autoplay', 'click'],
    tags: ['halo', 'ripple', 'ondas', 'anéis', 'aura', 'iridescente', 'conic-gradient', 'referência em vídeo'],
    explicacao: [
      'Cada anel é um círculo com fundo conic-gradient (as cores do arco-íris girando em volta) e uma máscara que deixa só a borda: radial-gradient transparente no meio.',
      'Todos os anéis usam a mesma animação, "expandir": crescem de 0,4 a 1,6 e desaparecem. O atraso de cada um é negativo e espaçado, então sempre há anéis em fases diferentes.',
      'O resultado é uma onda contínua saindo do centro, sem nenhum JavaScript para a animação — o JS só pausa.',
    ],
    alternativa: 'Em canvas, círculos com strokeStyle e globalAlpha decrescente; em SVG, <circle> com <animate> no r e no opacity.',
    compatibilidade: 'conic-gradient, mask-image e animações: todos os navegadores atuais (com -webkit-mask-image).',
    responsividade: 'Tamanho dos anéis em % do palco; o objeto central escala junto.',
    acessibilidade: 'Decorativo (aria-hidden). Movimento infinito com botão Pausar (WCAG 2.2.2). Com prefers-reduced-motion, os anéis ficam parados em tamanhos diferentes.',
    performance: 'Só transform e opacity animados; 2 a 6 anéis são leves até em celulares.',
    limitacoes: ['Anéis muito grandes com mask e gradiente cônico pedem mais pintura; mantenha o palco do tamanho da área de destaque.'],
    referencias: [
      { titulo: 'MDN — conic-gradient()', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/conic-gradient' },
      MDN.mask,
      MDN.wcagMovimento,
    ],
    validadoEm: VALIDADO_EM,
    status: 'validado',
  },
  params: [
    { id: 'aneis', rotulo: 'número de anéis', tipo: 'range', min: 2, max: 6, passo: 1, unidade: '', padrao: 4 },
    { id: 'duracao', rotulo: 'tempo de uma onda', tipo: 'range', min: 2, max: 8, passo: 0.5, unidade: 's', padrao: 4 },
    {
      id: 'brilho',
      rotulo: 'cor do halo',
      tipo: 'select',
      opcoes: [
        { valor: 'iridescente', rotulo: 'iridescente' },
        { valor: 'dourado', rotulo: 'dourado' },
        { valor: 'branco', rotulo: 'branco' },
      ],
      padrao: 'iridescente',
    },
  ],
  gerar: (v) => {
    const n = Number(v['aneis']);
    const dur = Number(v['duracao']);
    const aneis = Array.from({ length: n }, (_, i) => `    <span class="anel" style="--i: ${i}"></span>`).join('\n');
    return {
      html: `<section class="palco-halo">
  <div class="halo" aria-hidden="true">
${aneis}
  </div>
  <div class="objeto" role="img" aria-label="Esfera dourada"></div>
</section>
<button class="pausar" type="button" aria-pressed="false">Pausar</button>`,
      css: `${cssPalco()}

.palco-halo {
  position: relative;
  display: grid;
  place-items: center;
  width: min(100%, 640px);
  aspect-ratio: 16 / 10;
  border-radius: 20px;
  overflow: hidden;
  background: linear-gradient(180deg, #1f6fff, #3f8cff);
}
.halo, .objeto { grid-area: 1 / 1; }
.halo { position: relative; width: 60%; aspect-ratio: 1; }

/* Um anel: gradiente cônico com o meio vazado pela máscara */
.anel {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: ${BRILHOS[String(v['brilho'])]};
  -webkit-mask-image: radial-gradient(circle, transparent 62%, #000 64%, #000 70%, transparent 72%);
  mask-image: radial-gradient(circle, transparent 62%, #000 64%, #000 70%, transparent 72%);
  opacity: 0;
  animation: expandir ${dur}s ease-out calc(var(--i) * -${(dur / n).toFixed(2)}s) infinite;
}
@keyframes expandir {
  0% { scale: 0.4; opacity: 0; }
  20% { opacity: 0.9; }
  100% { scale: 1.6; opacity: 0; }
}
.palco-halo.is-pausado .anel { animation-play-state: paused; }

/* O objeto em destaque */
.objeto {
  position: relative;
  width: 22%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #fff6c9, #f5b73b 45%, #a8650c);
  box-shadow: 0 20px 40px rgb(0 0 0 / 0.3);
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

@media (prefers-reduced-motion: reduce) {
  .anel { animation: none; opacity: 0.5; scale: calc(0.7 + var(--i) * 0.25); }
}`,
      js: `// WCAG 2.2.2: movimento automático precisa de pausa
const palco = document.querySelector('.palco-halo');
const botao = document.querySelector('.pausar');
botao.addEventListener('click', () => {
  const pausado = palco.classList.toggle('is-pausado');
  botao.setAttribute('aria-pressed', String(pausado));
  botao.textContent = pausado ? 'Continuar' : 'Pausar';
});`,
    };
  },
  angular: (v) => ({
    ts: `import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-ripple-halo',
  templateUrl: './ripple-halo.html',
  styleUrl: './ripple-halo.css',
})
export class ${nomeClasse('ripple-halo')} {
  protected readonly aneis = Array.from({ length: ${v['aneis']} }, (_, i) => i);
  protected readonly pausado = signal(false);
}
`,
    html: `<section class="palco-halo" [class.is-pausado]="pausado()">
  <div class="halo" aria-hidden="true">
    @for (i of aneis; track i) {
      <span class="anel" [style.--i]="i"></span>
    }
  </div>
  <div class="objeto" role="img" aria-label="Esfera dourada"></div>
</section>
<button class="pausar" type="button" [attr.aria-pressed]="pausado()" (click)="pausado.set(!pausado())">
  {{ pausado() ? 'Continuar' : 'Pausar' }}
</button>
`,
    css: cssAngular(RIPPLE_HALO.gerar(v).css),
  }),
  niveis: {
    iniciante: [
      'Atrás da esfera, anéis coloridos nascem pequenos e vão crescendo até sumir.',
      'Como sempre nasce um anel novo, parece uma onda contínua de luz.',
      'O botão Pausar congela os anéis.',
    ],
    avancado: [
      'Atraso negativo = −i × (duração ÷ n): os anéis ficam igualmente espaçados no tempo e já começam em movimento.',
      'A máscara radial com quatro paradas (transparente, preto, preto, transparente) desenha uma faixa de anel com bordas suaves.',
      'scale (propriedade individual) na animação deixa transform livre para, por exemplo, inclinar o halo em perspectiva.',
      'Troque o conic-gradient por uma única cor para um efeito de "sonar" mais sóbrio.',
    ],
  },
  glossario: [
    { termo: 'conic-gradient', explicacao: 'Cores girando em volta do centro: o brilho iridescente.' },
    { termo: 'mask-image', explicacao: 'Deixa só a faixa do anel visível.' },
    { termo: 'animation-play-state: paused', explicacao: 'Congela os anéis quando a pessoa pausa.' },
    { termo: 'calc(var(--i) * -', explicacao: 'Atraso negativo de cada anel, espaçando as ondas.' },
  ],
};
