/**
 * Efeito de movimento (web): reconstrói, dentro do formato KCX, os efeitos que
 * o KCX Web Intelligence reconhece em sites e gravações — scroll reveal,
 * parallax, sticky, horizontal scroll, card stacking, morphing, hover, texto
 * animado, glassmorphism, profundidade, cursor e transição.
 *
 * Só CSS e um JavaScript pequeno (IntersectionObserver, scroll e pointermove),
 * sem GSAP, Framer Motion, Lenis ou Three.js. Os efeitos de rolagem acontecem
 * DENTRO do componente (um palco com rolagem própria), então funcionam no
 * preview, nas Telas e no código exportado.
 */
import type { KcxNo } from '../../../kcx.types';
import type { Blocos, ConfigConstrutor, DefinicaoTipo } from '../../montar';

export type AnimacaoEfeitoWeb =
  | 'revelar'
  | 'parallax'
  | 'sticky'
  | 'horizontal'
  | 'empilhar'
  | 'morph'
  | 'hover'
  | 'texto'
  | 'vidro'
  | 'profundidade'
  | 'cursor'
  | 'transicao';

/** Efeitos que precisam de rolagem dentro do palco. */
const ROLAGEM: AnimacaoEfeitoWeb[] = [
  'revelar',
  'parallax',
  'sticky',
  'horizontal',
  'empilhar',
  'profundidade',
];

/* ------------------------------ Variáveis do tipo ------------------------------ */

function variaveisDoEfeito(b: Blocos) {
  const P = b.P;
  b.extra({
    id: 'duracaoMovimento',
    nome: 'Duração do efeito',
    tipo: 'time',
    padrao: 900,
    min: 100,
    max: 8000,
    passo: 50,
    unidade: 'ms',
    descricao:
      'Quanto tempo cada elemento leva para fazer o movimento (vem da ficha técnica quando há medida).',
    grupo: 'motion',
    secao: 'animacao',
    vinculos: [
      {
        propriedade: 'duração do efeito',
        alvo: { tipo: 'css-var', nome: `${P}-mov-duracao` },
        unidadeSaida: 'ms',
      },
    ],
  });
  b.extra({
    id: 'distancia',
    nome: 'Distância do movimento',
    tipo: 'dimension',
    padrao: 48,
    min: 0,
    max: 400,
    passo: 1,
    unidade: 'px',
    descricao: 'Quanto o elemento anda (entrada, subida no hover, profundidade).',
    grupo: 'motion',
    secao: 'animacao',
    vinculos: [
      {
        propriedade: 'distância',
        alvo: { tipo: 'css-var', nome: `${P}-distancia` },
        unidadeSaida: 'px',
      },
    ],
  });
  b.extra({
    id: 'intensidade',
    nome: 'Intensidade',
    tipo: 'float',
    padrao: 0.6,
    min: 0,
    max: 1,
    passo: 0.05,
    descricao: 'Força do efeito: velocidade do parallax, desfoque, inclinação, escala.',
    grupo: 'motion',
    secao: 'animacao',
    vinculos: [{ propriedade: 'intensidade', alvo: { tipo: 'css-var', nome: `${P}-intensidade` } }],
  });
  b.extra({
    id: 'atrasoItens',
    nome: 'Atraso entre itens',
    tipo: 'time',
    padrao: 90,
    min: 0,
    max: 800,
    passo: 10,
    unidade: 'ms',
    descricao: 'Sequência: cada item começa este tempo depois do anterior.',
    grupo: 'motion',
    secao: 'animacao',
    vinculos: [
      {
        propriedade: 'atraso por item',
        alvo: { tipo: 'css-var', nome: `${P}-atraso` },
        unidadeSaida: 'ms',
      },
    ],
  });
  return b.estadoAberto(
    'ativo',
    'Estado final',
    'Mostra o efeito no fim (tudo revelado, segunda cena, forma alternativa).',
  );
}

/* ------------------------------ Código por efeito ------------------------------ */

interface Codigo {
  corpo: string;
  css: string;
  js: string;
}

function cartoes(b: Blocos, cfg: ConfigConstrutor, classe = 'card', attrs = ''): string {
  return cfg.itens
    .map(
      (_, i) =>
        `      <li class="${b.c(classe)}" style="--i: ${i}"${attrs}><span class="${b.c('num')}">${String(i + 1).padStart(2, '0')}</span>${b.item(i)}</li>`,
    )
    .join('\n');
}

const JS_CALMO = `const calmo = matchMedia('(prefers-reduced-motion: reduce)').matches;`;

function codigoDo(anim: AnimacaoEfeitoWeb, b: Blocos, cfg: ConfigConstrutor): Codigo {
  const C = b.C;
  const v = (n: string) => b.v(n);
  const mov = `${v('mov-duracao')} ${v('easing')}`;
  const seq = `calc(var(--i, 0) * ${v('atraso')})`;
  const lista = (classe = 'cards', extra = '') =>
    `    <ul class="${b.c(classe)}" role="list"${extra}>\n${cartoes(b, cfg)}\n    </ul>`;
  const dica = `<p class="${b.c('dica')}" aria-hidden="true">role dentro do quadro ↓</p>`;
  switch (anim) {
    case 'revelar':
      return {
        corpo: `    ${dica}\n    <div class="${b.c('vazio')}"></div>\n${lista()}\n    <div class="${b.c('vazio')} ${b.c('vazio')}--fim"></div>`,
        css: `.${C}__card { opacity: 0; transform: translateY(${v('distancia')}); filter: blur(calc(${v('intensidade')} * 8px)); transition: opacity ${mov}, transform ${mov}, filter ${mov}; transition-delay: ${seq}; }
.${C}__card[data-visivel], .${C}[data-ativo="true"] .${C}__card { opacity: 1; transform: none; filter: none; }`,
        js: `    const io = new IntersectionObserver((lista) => lista.forEach((e) => e.target.toggleAttribute('data-visivel', e.isIntersecting)), { root: palco, threshold: 0.25 });
    raiz.querySelectorAll('.${C}__card').forEach((el) => io.observe(el));`,
      };
    case 'parallax':
      return {
        corpo: `    ${dica}\n    <div class="${b.c('cena')}" aria-hidden="true">\n      <span class="${b.c('camada')} ${b.c('camada')}--fundo"></span>\n      <span class="${b.c('camada')} ${b.c('camada')}--meio"></span>\n      <span class="${b.c('camada')} ${b.c('camada')}--frente"></span>\n    </div>\n${lista()}\n    <div class="${b.c('vazio')}"></div>`,
        css: `.${C}__cena { position: relative; height: 70%; min-height: 220px; overflow: hidden; border-radius: ${v('raio')}; background: ${v('superficie')}; }
.${C}__camada { position: absolute; border-radius: 50%; will-change: transform; }
.${C}__camada--fundo { width: 70%; aspect-ratio: 1; left: -10%; top: 10%; background: color-mix(in srgb, ${v('primaria')} 25%, transparent); transform: translateY(calc(var(--rolagem, 0) * ${v('intensidade')} * 0.7px)); }
.${C}__camada--meio { width: 40%; aspect-ratio: 1; right: 8%; top: 30%; background: color-mix(in srgb, ${v('primaria')} 55%, transparent); transform: translateY(calc(var(--rolagem, 0) * ${v('intensidade')} * 0.35px)); }
.${C}__camada--frente { width: 18%; aspect-ratio: 1; left: 40%; top: 55%; background: ${v('primaria')}; transform: translateY(calc(var(--rolagem, 0) * ${v('intensidade')} * -0.25px)); }`,
        js: `    const rolar = () => raiz.style.setProperty('--rolagem', calmo ? '0' : String(palco.scrollTop));
    palco.addEventListener('scroll', rolar, { passive: true });
    rolar();`,
      };
    case 'sticky':
      return {
        corpo: `    <div class="${b.c('duas')}">\n      <div class="${b.c('fixo')}">${dica}</div>\n${lista()}\n    </div>`,
        css: `.${C}__duas { display: flex; flex-wrap: wrap; gap: ${v('espaco')}; align-items: flex-start; }
.${C}__fixo { position: sticky; top: 0; flex: 1 1 180px; padding: ${v('espaco')}; border-radius: ${v('raio')}; background: ${v('superficie')}; }
.${C}__duas .${C}__cards { flex: 2 1 240px; grid-template-columns: 1fr; }
.${C}__duas .${C}__card { min-height: 180px; }`,
        js: '',
      };
    case 'horizontal':
      return {
        corpo: `    ${dica}\n    <div class="${b.c('secao')}">\n      <div class="${b.c('janela')}">\n${lista('trilho')}\n      </div>\n    </div>\n    <div class="${b.c('vazio')}"></div>`,
        css: `.${C}__secao { position: relative; height: var(--secao-altura, 1260px); }
.${C}__janela { position: sticky; top: 0; height: calc(var(--altura-palco, 420px) - 2 * ${v('espaco')}); display: flex; align-items: center; overflow: hidden; }
.${C}__trilho { display: flex; gap: ${v('espaco')}; margin: 0; padding: 0; list-style: none; transform: translateX(var(--x, 0px)); transition: transform calc(${v('mov-duracao')} * 0.2) linear; }
.${C}__trilho .${C}__card { flex: none; width: min(70vw, 260px); min-height: 200px; }
.${C}[data-ativo="true"] .${C}__trilho { transform: translateX(var(--x-fim, 0px)); }`,
        js: `    const secao = raiz.querySelector('.${C}__secao');
    const janela = raiz.querySelector('.${C}__janela');
    const trilho = raiz.querySelector('.${C}__trilho');
    const medir = () => {
      raiz.style.setProperty('--altura-palco', palco.clientHeight + 'px');
      raiz.style.setProperty('--secao-altura', palco.clientHeight * 3 + 'px');
      const falta = Math.max(0, trilho.scrollWidth - janela.clientWidth);
      raiz.style.setProperty('--x-fim', -falta + 'px');
      const curso = Math.max(1, secao.offsetHeight - palco.clientHeight);
      const p = Math.min(1, Math.max(0, (palco.scrollTop - secao.offsetTop) / curso));
      raiz.style.setProperty('--x', calmo ? '0px' : -falta * p + 'px');
    };
    palco.addEventListener('scroll', medir, { passive: true });
    addEventListener('resize', medir);
    medir();`,
      };
    case 'empilhar':
      return {
        corpo: `    ${dica}\n${lista('pilha')}\n    <div class="${b.c('vazio')}"></div>`,
        css: `.${C}__pilha { display: grid; gap: calc(${v('espaco')} * 3); margin: 0; padding: 0; list-style: none; }
.${C}__pilha .${C}__card { position: sticky; top: calc(var(--i, 0) * 14px); min-height: 70%; height: 240px; box-shadow: 0 -12px 32px rgb(0 0 0 / 0.35); transform-origin: top center; transition: transform ${mov}; }
.${C}[data-ativo="true"] .${C}__pilha .${C}__card { transform: scale(calc(1 - (var(--n, 4) - var(--i, 0) - 1) * ${v('intensidade')} * 0.04)); }`,
        js: `    raiz.querySelectorAll('.${C}__card').forEach((el, _, todos) => el.style.setProperty('--n', String(todos.length)));`,
      };
    case 'morph':
      return {
        corpo: `    <div class="${b.c('forma-caixa')}"><button class="${b.c('forma')}" type="button" aria-pressed="false" aria-label="Alternar a forma"></button></div>\n${lista()}`,
        css: `.${C}__forma-caixa { display: grid; place-items: center; min-height: 220px; }
.${C}__forma { width: 180px; aspect-ratio: 1; border: 0; background: linear-gradient(135deg, ${v('primaria')}, color-mix(in srgb, ${v('primaria')} 40%, ${v('superficie')})); border-radius: 42% 58% 63% 37% / 41% 44% 56% 59%; animation: ${C}-morph ${v('mov-duracao')} ${v('easing')} infinite alternate; transform: scale(calc(0.85 + ${v('intensidade')} * 0.3)); }
.${C}[data-ativo="true"] .${C}__forma { animation-play-state: paused; border-radius: 50%; }
@keyframes ${C}-morph {
  0% { border-radius: 42% 58% 63% 37% / 41% 44% 56% 59%; rotate: 0deg; }
  50% { border-radius: 63% 37% 39% 61% / 54% 63% 37% 46%; }
  100% { border-radius: 30% 70% 52% 48% / 65% 35% 65% 35%; rotate: 45deg; }
}`,
        js: `    const forma = raiz.querySelector('.${C}__forma');
    forma.addEventListener('click', () => {
      const ativo = raiz.getAttribute('data-ativo') !== 'true';
      raiz.setAttribute('data-ativo', String(ativo));
      forma.setAttribute('aria-pressed', String(ativo));
    });`,
      };
    case 'hover':
      return {
        corpo: lista(),
        css: `.${C}__card { cursor: pointer; transition: transform ${mov}, box-shadow ${mov}, border-color ${mov}; }
.${C}__card:hover, .${C}__card:focus-visible, .${C}[data-ativo="true"] .${C}__card:first-child { transform: translateY(calc(${v('distancia')} * -0.25)) scale(calc(1 + ${v('intensidade')} * 0.06)); border-color: ${v('primaria')}; box-shadow: 0 calc(${v('distancia')} * 0.3) calc(${v('distancia')} * 0.8) color-mix(in srgb, ${v('primaria')} 35%, transparent); }`,
        js: `    raiz.querySelectorAll('.${C}__card').forEach((el) => el.setAttribute('tabindex', '0'));`,
      };
    case 'texto':
      return {
        corpo: `    <button class="${b.c('repetir')}" type="button">↻ ${'Repetir'}</button>\n${lista()}`,
        css: `.${C}__palavra { display: inline-block; overflow: hidden; vertical-align: bottom; padding-bottom: 0.08em; }
.${C}__palavra > span { display: inline-block; transform: translateY(110%); filter: blur(calc(${v('intensidade')} * 6px)); opacity: 0; transition: transform ${mov}, filter ${mov}, opacity ${mov}; transition-delay: ${seq}; }
.${C}[data-tocando="true"] .${C}__palavra > span, .${C}[data-ativo="true"] .${C}__palavra > span { transform: none; filter: none; opacity: 1; }
.${C}__repetir { justify-self: start; padding: 0.4em 0.9em; border: 1px solid ${v('suave')}; border-radius: 999px; background: none; }`,
        js: `    const titulo = raiz.querySelector('.${C}__titulo');
    let dividindo = false;
    const dividir = () => {
      if (dividindo) return;
      dividindo = true;
      const palavras = (titulo.textContent || '').trim().split(/\\s+/);
      titulo.textContent = '';
      palavras.forEach((p, i) => {
        const caixa = document.createElement('span');
        caixa.className = '${C}__palavra';
        caixa.style.setProperty('--i', String(i));
        const dentro = document.createElement('span');
        dentro.textContent = p;
        caixa.append(dentro, ' ');
        titulo.append(caixa);
      });
      titulo.setAttribute('aria-label', palavras.join(' '));
      dividindo = false;
    };
    const tocar = () => {
      raiz.setAttribute('data-tocando', 'false');
      requestAnimationFrame(() => requestAnimationFrame(() => raiz.setAttribute('data-tocando', 'true')));
    };
    dividir();
    tocar();
    // O texto do título é uma variável: quando ela muda, divide de novo.
    new MutationObserver(() => { if (!dividindo && !titulo.querySelector('.${C}__palavra')) { dividir(); tocar(); } }).observe(titulo, { childList: true, characterData: true, subtree: true });
    raiz.querySelector('.${C}__repetir').addEventListener('click', tocar);`,
      };
    case 'vidro':
      return {
        corpo: `    <div class="${b.c('fundo-vidro')}" aria-hidden="true"><span></span><span></span><span></span></div>\n    <div class="${b.c('vidro')}">\n${lista()}\n    </div>`,
        css: `.${C}__palco { position: relative; isolation: isolate; }
.${C}__fundo-vidro { position: absolute; inset: 0; z-index: -1; overflow: hidden; }
.${C}__fundo-vidro span { position: absolute; width: 45%; aspect-ratio: 1; border-radius: 50%; background: ${v('primaria')}; animation: ${C}-flutuar calc(${v('mov-duracao')} * 6) ease-in-out infinite alternate; }
.${C}__fundo-vidro span:nth-child(1) { left: -8%; top: 10%; }
.${C}__fundo-vidro span:nth-child(2) { right: -6%; top: 40%; background: color-mix(in srgb, ${v('primaria')} 50%, #00d9ff); animation-delay: -2s; }
.${C}__fundo-vidro span:nth-child(3) { left: 30%; bottom: -15%; background: color-mix(in srgb, ${v('primaria')} 50%, #ff2daa); animation-delay: -4s; }
.${C}__vidro { padding: ${v('espaco')}; border: 1px solid rgb(255 255 255 / 0.22); border-radius: ${v('raio')}; background: color-mix(in srgb, ${v('superficie')} 35%, transparent); backdrop-filter: blur(calc(${v('intensidade')} * 28px)) saturate(160%); -webkit-backdrop-filter: blur(calc(${v('intensidade')} * 28px)) saturate(160%); }
.${C}__vidro .${C}__card { background: rgb(255 255 255 / 0.06); }
@keyframes ${C}-flutuar { to { transform: translate(8%, -10%) scale(1.1); } }`,
        js: '',
      };
    case 'profundidade':
      return {
        corpo: `    ${dica}\n    <div class="${b.c('vazio')}"></div>\n${lista('fila')}\n    <div class="${b.c('vazio')}"></div>`,
        css: `.${C}__fila { display: grid; gap: ${v('espaco')}; margin: 0; padding: 0; list-style: none; perspective: 900px; }
.${C}__fila .${C}__card { min-height: 160px; transform: translateZ(calc((1 - var(--p, 1)) * ${v('distancia')} * -4)) scale(calc(1 - (1 - var(--p, 1)) * ${v('intensidade')} * 0.35)); opacity: calc(0.2 + var(--p, 1) * 0.8); }
.${C}[data-ativo="true"] .${C}__fila .${C}__card { --p: 1; }`,
        js: `    const cards = [...raiz.querySelectorAll('.${C}__card')];
    const medir = () => {
      const meio = palco.getBoundingClientRect();
      const centro = meio.top + meio.height / 2;
      cards.forEach((el) => {
        const r = el.getBoundingClientRect();
        const d = Math.abs(r.top + r.height / 2 - centro) / (meio.height / 2);
        el.style.setProperty('--p', calmo ? '1' : String(Math.max(0, Math.min(1, 1 - d)).toFixed(3)));
      });
    };
    palco.addEventListener('scroll', medir, { passive: true });
    addEventListener('resize', medir);
    medir();`,
      };
    case 'cursor':
      return {
        corpo: `    <span class="${b.c('seguidor')}" aria-hidden="true"></span>\n${lista()}`,
        css: `.${C}__palco { position: relative; cursor: none; }
.${C}__seguidor { position: absolute; left: 0; top: 0; z-index: 2; width: 36px; aspect-ratio: 1; border: 2px solid ${v('primaria')}; border-radius: 50%; pointer-events: none; opacity: 0; transform: translate(calc(var(--mx, 0px) - 50%), calc(var(--my, 0px) - 50%)); transition: transform ${mov}, opacity 200ms; }
.${C}__palco:hover .${C}__seguidor, .${C}[data-ativo="true"] .${C}__seguidor { opacity: 1; }
.${C}__card { transform: perspective(700px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)); transition: transform 120ms linear; }
@media (hover: none) { .${C}__palco { cursor: auto; } .${C}__seguidor { display: none; } }`,
        js: `    const seguidor = raiz.querySelector('.${C}__seguidor');
    palco.addEventListener('pointermove', (e) => {
      const r = palco.getBoundingClientRect();
      seguidor.style.setProperty('--mx', e.clientX - r.left + palco.scrollLeft + 'px');
      seguidor.style.setProperty('--my', e.clientY - r.top + palco.scrollTop + 'px');
      if (calmo) return;
      const forca = parseFloat(getComputedStyle(raiz).getPropertyValue('${b.P}-intensidade')) || 0.6;
      raiz.querySelectorAll('.${C}__card').forEach((el) => {
        const c = el.getBoundingClientRect();
        const x = (e.clientX - (c.left + c.width / 2)) / c.width;
        const y = (e.clientY - (c.top + c.height / 2)) / c.height;
        const perto = Math.abs(x) < 0.75 && Math.abs(y) < 0.75;
        el.style.setProperty('--ry', perto ? x * forca * 18 + 'deg' : '0deg');
        el.style.setProperty('--rx', perto ? -y * forca * 18 + 'deg' : '0deg');
      });
    });
    palco.addEventListener('pointerleave', () => raiz.querySelectorAll('.${C}__card').forEach((el) => { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); }));`,
      };
    case 'transicao':
      return {
        corpo: `    <button class="${b.c('ir')}" type="button" aria-expanded="false">${b.span('acao')}</button>\n    <div class="${b.c('cena-b')}" aria-hidden="true">\n${lista()}\n      <button class="${b.c('voltar')}" type="button">${b.span('voltar')}</button>\n    </div>`,
        css: `.${C}__palco { position: relative; }
.${C}__ir, .${C}__voltar { justify-self: start; padding: 0.65em 1.2em; border: 0; border-radius: ${v('raio')}; background: ${v('primaria')}; color: ${v('fundo')}; font-weight: 600; }
.${C}__cena-b { position: absolute; inset: 0; display: grid; align-content: start; gap: ${v('espaco')}; padding: ${v('espaco')}; background: ${v('superficie')}; clip-path: circle(0% at var(--cx, 50%) var(--cy, 50%)); visibility: hidden; transition: clip-path ${mov}, visibility 0s linear ${v('mov-duracao')}; }
.${C}[data-ativo="true"] .${C}__cena-b { clip-path: circle(150% at var(--cx, 50%) var(--cy, 50%)); visibility: visible; transition: clip-path ${mov}, visibility 0s; }`,
        js: `    const ir = raiz.querySelector('.${C}__ir');
    const cena = raiz.querySelector('.${C}__cena-b');
    const trocar = (ativo, e) => {
      if (e) {
        const r = palco.getBoundingClientRect();
        raiz.style.setProperty('--cx', e.clientX - r.left + 'px');
        raiz.style.setProperty('--cy', e.clientY - r.top + 'px');
      }
      raiz.setAttribute('data-ativo', String(ativo));
      ir.setAttribute('aria-expanded', String(ativo));
      cena.setAttribute('aria-hidden', String(!ativo));
      (ativo ? raiz.querySelector('.${C}__voltar') : ir).focus({ preventScroll: true });
    };
    ir.addEventListener('click', (e) => trocar(true, e));
    raiz.querySelector('.${C}__voltar').addEventListener('click', (e) => trocar(false, e));`,
      };
  }
}

/* ------------------------------ Definição do tipo ------------------------------ */

export const ANIMACOES_EFEITO_WEB: { id: AnimacaoEfeitoWeb; nome: string; descricao: string }[] = [
  {
    id: 'revelar',
    nome: 'Scroll reveal',
    descricao: 'Os cards surgem (sobem e focam) ao entrar no quadro.',
  },
  { id: 'parallax', nome: 'Parallax', descricao: 'Camadas rolam em velocidades diferentes.' },
  {
    id: 'sticky',
    nome: 'Sticky section',
    descricao: 'O título fica preso enquanto os cards rolam.',
  },
  {
    id: 'horizontal',
    nome: 'Horizontal scroll',
    descricao: 'Rolar para baixo leva os cards para o lado.',
  },
  { id: 'empilhar', nome: 'Card stacking', descricao: 'Os cards ficam presos e se empilham.' },
  {
    id: 'morph',
    nome: 'Morphing',
    descricao: 'Forma orgânica que muda de contorno; clique para fixar.',
  },
  {
    id: 'hover',
    nome: 'Hover',
    descricao: 'Os cards sobem, crescem e ganham brilho com o mouse ou o foco.',
  },
  { id: 'texto', nome: 'Texto animado', descricao: 'O título entra palavra por palavra.' },
  {
    id: 'vidro',
    nome: 'Glassmorphism',
    descricao: 'Painel de vidro desfocando manchas de cor em movimento.',
  },
  {
    id: 'profundidade',
    nome: 'Profundidade',
    descricao: 'Os cards crescem e aparecem ao chegar ao centro do quadro.',
  },
  {
    id: 'cursor',
    nome: 'Cursor',
    descricao: 'Cursor que segue com atraso e cards que inclinam com o mouse.',
  },
  {
    id: 'transicao',
    nome: 'Transição',
    descricao: 'Troca de cena com um círculo que cresce do clique.',
  },
];

export const EFEITO_WEB: DefinicaoTipo = {
  id: 'efeito-web',
  nome: 'Efeito de movimento (web)',
  categoria: 'movimento',
  uso: 'site',
  descricao:
    'Reconstrução de um efeito de site (rolagem, parallax, sticky, hover, texto, vidro…) só com CSS e um JavaScript pequeno, sem bibliotecas.',
  textos: [
    { id: 'titulo', rotulo: 'Título', padrao: 'Seu projeto em movimento' },
    {
      id: 'texto',
      rotulo: 'Texto',
      padrao: 'Um efeito reconstruído a partir da referência, pronto para editar.',
    },
    { id: 'acao', rotulo: 'Botão da transição', padrao: 'Ver a próxima cena' },
    { id: 'voltar', rotulo: 'Botão de voltar', padrao: 'Voltar' },
  ],
  itens: {
    rotulo: 'Cards',
    padrao: ['Pesquisa', 'Protótipo', 'Interface', 'Publicação'],
    min: 2,
    max: 8,
  },
  animacoes: ANIMACOES_EFEITO_WEB,
  largura: 720,
  altura: 420,
  gerar(cfg, b) {
    const C = b.C;
    const v = (n: string) => b.v(n);
    const anim = (
      ANIMACOES_EFEITO_WEB.some((a) => a.id === cfg.animacao) ? cfg.animacao : 'revelar'
    ) as AnimacaoEfeitoWeb;
    const ativo = variaveisDoEfeito(b);
    const cod = codigoDo(anim, b, cfg);
    const rola = ROLAGEM.includes(anim);
    const topo =
      anim === 'sticky'
        ? ''
        : `    <header class="${b.c('topo')}">\n      ${b.span('titulo', 'h2')}\n      ${b.span('texto', 'p')}\n    </header>\n`;
    const corpo =
      anim === 'sticky'
        ? cod.corpo.replace(
            `<div class="${b.c('fixo')}">`,
            `<div class="${b.c('fixo')}">\n        ${b.span('titulo', 'h2')}\n        ${b.span('texto', 'p')}\n        `,
          )
        : cod.corpo;
    const html = `<section class="${C}" data-efeito="${anim}" data-ativo="false">
  <div class="${C}__palco"${rola ? ' tabindex="0" role="region"' : ''} aria-label="${(cfg.textos['titulo'] ?? 'Efeito').replace(/"/g, '')}">
${topo}${corpo}
  </div>
</section>`;
    const css = `.${C} { width: 100%; max-width: 960px; height: 420px; margin: 0 auto; border-radius: ${v('raio')}; background: ${v('fundo')}; overflow: hidden; }
.${C}__palco { position: relative; display: grid; grid-template-columns: minmax(0, 1fr); align-content: start; gap: ${v('espaco')}; height: 100%; padding: ${v('espaco')}; overflow-y: ${rola ? 'auto' : 'hidden'}; overscroll-behavior: contain; scrollbar-width: thin; }
.${C}__palco:focus-visible { outline: 2px solid ${v('primaria')}; outline-offset: -4px; }
.${C}__topo { display: grid; gap: 0.35em; }
.${C}__titulo { margin: 0; font-size: calc(${v('fonte')} * 2); line-height: 1.1; }
.${C}__texto { margin: 0; color: ${v('suave')}; max-width: 48ch; }
.${C}__dica { margin: 0; font-size: 0.8em; color: ${v('suave')}; }
.${C}__vazio { min-height: 340px; }
.${C}__vazio--fim { min-height: 200px; }
.${C}__cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: ${v('espaco')}; margin: 0; padding: 0; list-style: none; }
.${C}__card { display: grid; align-content: space-between; gap: 0.6em; min-height: 120px; padding: ${v('espaco')}; border: 1px solid color-mix(in srgb, ${v('suave')} 30%, transparent); border-radius: ${v('raio')}; background: ${v('superficie')}; font-weight: 600; }
.${C}__num { font-size: 0.75em; color: ${v('primaria')}; font-variant-numeric: tabular-nums; }
${cod.css}
@media (max-width: 560px) { .${C} { height: 520px; } .${C}__titulo { font-size: calc(${v('fonte')} * 1.6); } }`;
    const js = `// ${ANIMACOES_EFEITO_WEB.find((a) => a.id === anim)!.nome} — reconstrução KCX (sem bibliotecas).
document.querySelectorAll('.${C}').forEach((raiz) => {
  const palco = raiz.querySelector('.${C}__palco');
  ${JS_CALMO}
  {
${cod.js || '    // Só CSS: nada a fazer aqui.'}
  }
  void palco;
  void calmo;
});`;

    const cards: KcxNo[] = cfg.itens.map((_, i) =>
      b.pilha(
        `card-${i + 1}`,
        `Card ${i + 1}`,
        'vertical',
        [b.noItem(i, { estilo: 'Semi Bold' })],
        {
          px: b.espaco,
          py: b.espaco,
          raio: b.raio,
          alinhar: 'inicio',
          preenchimentos: [{ tipo: 'solido', cor: b.cor('superficie') }],
          largura: 160,
        },
      ),
    );
    const estrutura: KcxNo = b.pilha(
      'efeito',
      cfg.nome || 'Efeito',
      'vertical',
      [
        b.noTexto('titulo', 'Título', { tamanho: b.fonteX(2, 'titulo-tamanho'), estilo: 'Bold' }),
        b.noTexto('texto', 'Texto', { cor: b.cor('suave') }),
        b.pilha('cards', 'Cards', 'horizontal', cards, {
          espaco: b.espaco,
          quebrar: true,
          alinhar: 'inicio',
        }),
      ],
      {
        px: b.espaco,
        py: b.espaco,
        espaco: b.espaco,
        raio: b.raio,
        alinhar: 'inicio',
        largura: 720,
        preenchimentos: [{ tipo: 'solido', cor: b.cor('fundo') }],
      },
    );
    const nomeAnim = ANIMACOES_EFEITO_WEB.find((a) => a.id === anim)!.nome;
    return {
      html,
      css,
      js,
      estrutura,
      estados: [
        {
          id: 'inicio',
          nome: 'Início',
          gatilho: 'inicial',
          descricao: 'Antes do efeito.',
          valores: { [ativo]: false },
        },
        {
          id: 'fim',
          nome: 'Fim',
          gatilho: 'final',
          descricao: 'Depois do efeito (estado final).',
          valores: { [ativo]: true },
        },
      ],
      animacao: {
        nome: nomeAnim,
        tecnica: anim === 'morph' || anim === 'vidro' ? 'css-keyframes' : 'css-transition',
        variaveis: ['duracaoMovimento', 'distancia', 'intensidade', 'atrasoItens', 'easing'],
        descricao:
          `${ANIMACOES_EFEITO_WEB.find((a) => a.id === anim)!.descricao} ${rola ? 'A rolagem acontece dentro do quadro do componente.' : ''}`.trim(),
        figma: 'documental',
      },
      editavel: [
        'Título, texto e cards como propriedades de texto',
        'Variantes Início e Fim (estado final do efeito)',
        'Cores, arredondamento, espaçamento e tamanho do texto por variáveis',
      ],
      parcial: [
        'O movimento é documentado: no Figma, as variantes Início e Fim mostram o mesmo quadro.',
      ],
      naoSuportado: [
        `${nomeAnim}: o movimento ligado ao ${rola ? 'scroll' : 'tempo/mouse'} fica só no código`,
      ],
      limitacoes: [
        'Efeitos de rolagem usam o scroll do próprio componente (o quadro tem rolagem interna).',
        ...(anim === 'vidro' ? ['backdrop-filter não funciona em navegadores muito antigos.'] : []),
        ...(anim === 'cursor'
          ? ['Em telas de toque não há cursor: o seguidor some e os cards ficam retos.']
          : []),
      ],
      tags: ['efeito web', 'motion', anim, nomeAnim.toLowerCase()],
    };
  },
};
