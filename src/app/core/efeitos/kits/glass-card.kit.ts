import { EffectKit } from '../../models/effect-sheet.model';
import { VALIDADO_EM, cssAngular, cssPalco, nomeClasse } from './_base';

const TINTAS = [
  { valor: '255 255 255', rotulo: 'Branco (clássico)' },
  { valor: '196 181 253', rotulo: 'Lilás' },
  { valor: '249 168 212', rotulo: 'Rosa' },
  { valor: '147 197 253', rotulo: 'Azul' },
  { valor: '10 8 20', rotulo: 'Escuro (vidro fumê)' },
] as const;

export const GLASS_CARD: EffectKit = {
  ficha: {
    id: 'glass-card',
    nomeTecnico: 'Glassmorphism Generator (backdrop-filter)',
    nomeAmigavel: 'Gerador de vidro (glassmorphism)',
    categoria: 'luz-profundidade',
    subcategoria: 'Vidro e desfoque',
    descricao: 'Um card de vidro fosco sobre formas coloridas que flutuam: ajuste desfoque, transparência, saturação, borda, cor do vidro e o reflexo que passa ao apontar — e copie o CSS pronto.',
    objetivoVisual: 'Criar superfícies de vidro (cards, menus, modais) que deixam o fundo aparecer desfocado, com leitura confortável.',
    aplicacoes: ['Cards de destaque e de preço', 'Menus, barras e painéis flutuantes', 'Telas de login e widgets sobre fotos'],
    nivel: 'iniciante',
    tecnologias: ['HTML', 'CSS', 'JavaScript'],
    dependencias: [],
    interacoes: ['autoplay', 'mouse', 'hover'],
    tags: ['glassmorphism', 'vidro', 'glass', 'blur', 'desfoque', 'backdrop-filter', 'fosco', 'frosted', 'tendência 2026'],
    explicacao: [
      'O vidro é feito de quatro ingredientes: fundo quase transparente (rgb com alfa baixo), backdrop-filter: blur() + saturate(), borda fina e clara e uma sombra suave.',
      'backdrop-filter age no que está ATRÁS do elemento (diferente de filter, que age no próprio elemento): por isso as formas coloridas aparecem desfocadas através do card.',
      'saturate() acima de 1 deixa as cores atrás mais vivas, o que dá o aspecto de vidro de verdade em vez de "névoa cinza".',
      'O reflexo é um gradiente diagonal num ::before que segue o mouse (variáveis --rx e --ry). As formas do fundo flutuam com animação para o vidro "ganhar vida".',
    ],
    alternativa: 'Sem backdrop-filter (navegadores antigos ou economia de bateria), use um fundo mais opaco, rgb(255 255 255 / 0.7): o @supports do CSS já faz essa troca.',
    compatibilidade: 'backdrop-filter: Chrome/Edge 76+, Firefox 103+, Safari 18+ (sem prefixo; o CSS inclui -webkit-backdrop-filter para Safari mais antigo).',
    responsividade: 'O card tem largura máxima e as formas do fundo usam % do palco: o vidro funciona em qualquer tela.',
    acessibilidade: 'Texto sobre vidro precisa de contraste: o fundo do card nunca fica 100% transparente e o texto tem cor sólida. Teste o contraste com o fundo mais claro que pode aparecer atrás. Com prefers-reduced-motion as formas param e o reflexo não se move.',
    performance: 'backdrop-filter é caro: o navegador redesenha o desfoque quando algo atrás muda. Use em poucos elementos e com raio de desfoque moderado (até ~24px).',
    limitacoes: [
      'Um ancestral com overflow: hidden + border-radius ou com filter/opacity pode cortar ou desligar o backdrop-filter em alguns navegadores.',
      'Sobre fundos lisos (uma cor só) o vidro não aparece: ele precisa de algo colorido atrás.',
    ],
    referencias: [
      { titulo: 'MDN — backdrop-filter', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter' },
      { titulo: 'MDN — @supports', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/@supports' },
      { titulo: 'WCAG 2.2 — 1.4.3 Contraste mínimo', url: 'https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html' },
    ],
    validadoEm: VALIDADO_EM,
    status: 'validado',
  },
  params: [
    { id: 'desfoque', rotulo: 'desfoque', tipo: 'range', min: 0, max: 40, passo: 2, unidade: 'px', padrao: 16 },
    { id: 'transparencia', rotulo: 'opacidade do vidro', tipo: 'range', min: 0.05, max: 0.6, passo: 0.05, unidade: '', padrao: 0.15 },
    { id: 'saturacao', rotulo: 'saturação do fundo', tipo: 'range', min: 1, max: 2, passo: 0.1, unidade: '×', padrao: 1.6 },
    { id: 'borda', rotulo: 'brilho da borda', tipo: 'range', min: 0, max: 0.6, passo: 0.05, unidade: '', padrao: 0.3 },
    { id: 'tinta', rotulo: 'cor do vidro', tipo: 'select', opcoes: TINTAS, padrao: '255 255 255' },
  ],
  gerar: (v) => {
    const tinta = String(v['tinta']);
    const escuro = tinta === '10 8 20';
    const filtro = `blur(${v['desfoque']}px) saturate(${v['saturacao']})`;
    return {
      html: `<section class="vitrine-vidro">
  <div class="formas" aria-hidden="true">
    <span class="forma f1"></span>
    <span class="forma f2"></span>
    <span class="forma f3"></span>
  </div>
  <article class="vidro">
    <p class="vidro__selo">Plano Pro</p>
    <h2>R$ 49<small>/mês</small></h2>
    <p>Tudo o que você precisa para publicar seus projetos.</p>
    <button type="button">Assinar</button>
  </article>
</section>`,
      css: `${cssPalco()}

.vitrine-vidro {
  position: relative;
  display: grid;
  place-items: center;
  width: min(100%, 640px);
  aspect-ratio: 16 / 10;
  border-radius: 20px;
  overflow: hidden;
  background: #120f24;
}

/* Formas coloridas atrás do vidro (sem elas, o vidro não aparece) */
.forma { position: absolute; border-radius: 50%; animation: flutuar 9s ease-in-out infinite alternate; }
.f1 { width: 42%; aspect-ratio: 1; left: 8%; top: 6%; background: radial-gradient(circle at 30% 30%, #ff8ad8, #c81a8c); }
.f2 { width: 34%; aspect-ratio: 1; right: 10%; bottom: 4%; background: radial-gradient(circle at 30% 30%, #93c5fd, #2563eb); animation-delay: -3s; }
.f3 { width: 22%; aspect-ratio: 1; right: 30%; top: 14%; background: radial-gradient(circle at 30% 30%, #ddd6fe, #7c4ddb); animation-delay: -6s; }
@keyframes flutuar {
  to { translate: 6% 8%; scale: 1.08; }
}

/* O vidro: fundo translúcido + backdrop-filter + borda clara + sombra */
.vidro {
  --rx: 30%;
  --ry: 0%;
  position: relative;
  display: grid;
  gap: 8px;
  width: min(78%, 320px);
  padding: 28px;
  border: 1px solid rgb(255 255 255 / ${v['borda']});
  border-radius: 22px;
  background: rgb(${tinta} / ${v['transparencia']});
  -webkit-backdrop-filter: ${filtro};
  backdrop-filter: ${filtro};
  box-shadow: 0 20px 50px rgb(0 0 0 / 0.25), inset 0 1px 0 rgb(255 255 255 / ${v['borda']});
  color: ${escuro ? '#f4f2ff' : '#ffffff'};
  overflow: hidden;
}
/* reflexo que acompanha o ponteiro */
.vidro::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at var(--rx) var(--ry), rgb(255 255 255 / 0.35), transparent 45%);
  pointer-events: none;
  transition: opacity 300ms ease;
}
.vidro > * { position: relative; margin: 0; }
.vidro__selo { font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; opacity: 0.85; }
.vidro h2 { font-size: clamp(2rem, 8vw, 3rem); line-height: 1; }
.vidro h2 small { font-size: 0.4em; font-weight: 400; }
.vidro p { text-shadow: 0 1px 8px rgb(0 0 0 / 0.25); }
.vidro button {
  justify-self: start;
  margin-top: 6px;
  padding: 10px 20px;
  border: 1px solid rgb(255 255 255 / 0.5);
  border-radius: 999px;
  background: rgb(255 255 255 / 0.2);
  color: inherit;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}
.vidro button:focus-visible { outline: 2px solid #fff; outline-offset: 3px; }

/* Sem backdrop-filter: vidro mais opaco para manter a leitura */
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .vidro { background: rgb(${tinta} / 0.75); color: ${escuro ? '#f4f2ff' : '#1d1530'}; }
}

@media (prefers-reduced-motion: reduce) {
  .forma { animation: none; }
}`,
      js: `const vidro = document.querySelector('.vidro');
const reduzir = matchMedia('(prefers-reduced-motion: reduce)');
let quadro = 0;

// o reflexo segue o ponteiro sobre o card
vidro.addEventListener('pointermove', (e) => {
  if (reduzir.matches) return;
  cancelAnimationFrame(quadro);
  quadro = requestAnimationFrame(() => {
    const r = vidro.getBoundingClientRect();
    vidro.style.setProperty('--rx', ((e.clientX - r.left) / r.width) * 100 + '%');
    vidro.style.setProperty('--ry', ((e.clientY - r.top) / r.height) * 100 + '%');
  });
});`,
    };
  },
  angular: (v) => ({
    ts: `import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-glass-card',
  templateUrl: './glass-card.html',
  styleUrl: './glass-card.css',
})
export class ${nomeClasse('glass-card')} {
  private readonly reduzir = window.matchMedia('(prefers-reduced-motion: reduce)');
  private quadro = 0;

  protected readonly rx = signal('30%');
  protected readonly ry = signal('0%');

  /** O reflexo segue o ponteiro sobre o card. */
  protected mover(e: PointerEvent, vidro: HTMLElement): void {
    if (this.reduzir.matches) return;
    cancelAnimationFrame(this.quadro);
    this.quadro = requestAnimationFrame(() => {
      const r = vidro.getBoundingClientRect();
      this.rx.set(((e.clientX - r.left) / r.width) * 100 + '%');
      this.ry.set(((e.clientY - r.top) / r.height) * 100 + '%');
    });
  }
}
`,
    html: `<section class="vitrine-vidro">
  <div class="formas" aria-hidden="true">
    <span class="forma f1"></span>
    <span class="forma f2"></span>
    <span class="forma f3"></span>
  </div>
  <article #vidro class="vidro" [style.--rx]="rx()" [style.--ry]="ry()" (pointermove)="mover($event, vidro)">
    <p class="vidro__selo">Plano Pro</p>
    <h2>R$ 49<small>/mês</small></h2>
    <p>Tudo o que você precisa para publicar seus projetos.</p>
    <button type="button">Assinar</button>
  </article>
</section>
`,
    css: cssAngular(GLASS_CARD.gerar(v).css),
  }),
  niveis: {
    iniciante: [
      'É um cartão que parece feito de vidro fosco: dá para ver as bolhas coloridas atrás dele, só que borradas.',
      'Os controles mudam o quanto o vidro borra, o quanto ele é transparente, a cor do vidro e o brilho da borda.',
      'Passando o mouse, um reflexo de luz corre pelo vidro.',
    ],
    avancado: [
      'backdrop-filter só enxerga o que está atrás DENTRO do mesmo contexto de empilhamento; se o vidro não desfoca nada, verifique se o fundo está mesmo atrás dele (e não num irmão com isolation).',
      'inset 0 1px 0 rgb(255 255 255 / x) na sombra cria a "quina iluminada" no topo, típica do vidro da Apple.',
      'Combine com um ruído sutil (grão) por cima para evitar o banding em desfoques grandes.',
      '@supports not (backdrop-filter) garante leitura em navegadores sem suporte; o mesmo truque serve para modo de economia de energia.',
    ],
  },
  glossario: [
    { termo: 'backdrop-filter', explicacao: 'Aplica desfoque e saturação ao que está atrás do card.' },
    { termo: 'saturate(', explicacao: 'Deixa as cores atrás do vidro mais vivas.' },
    { termo: '@supports not', explicacao: 'Plano B para navegadores sem backdrop-filter.' },
    { termo: 'inset 0 1px 0', explicacao: 'Linha de luz no topo do vidro.' },
  ],
};
