import { EffectKit } from '../../models/effect-sheet.model';
import { CSS_REPETIR, EASINGS, MDN, VALIDADO_EM, cssPalco, jsRepetir } from './_base';

const ORIGEM: Record<string, (d: number) => string> = {
  baixo: (d) => `translateY(${d}px)`,
  cima: (d) => `translateY(-${d}px)`,
  esquerda: (d) => `translateX(-${d}px)`,
  direita: (d) => `translateX(${d}px)`,
};

export const SLIDE_IN: EffectKit = {
  ficha: {
    id: 'slide-in',
    nomeTecnico: 'Slide In',
    nomeAmigavel: 'Deslizar para dentro',
    categoria: 'transicoes',
    subcategoria: 'Entradas',
    descricao: 'O elemento entra deslizando de uma direção enquanto aparece.',
    objetivoVisual: 'Mostrar de onde o conteúdo vem e dar sensação de fluxo.',
    aplicacoes: ['Seções que entram ao rolar', 'Menus e painéis laterais', 'Notificações'],
    nivel: 'iniciante',
    tecnologias: ['HTML', 'CSS', 'JavaScript'],
    dependencias: [],
    interacoes: ['autoplay', 'click'],
    tags: ['slide', 'translate', 'entrada', 'deslizar', 'keyframes'],
    explicacao: [
      'transform: translate move o elemento sem mexer no layout: os vizinhos não saem do lugar.',
      'A animação começa deslocada (translateX ou translateY) e transparente, e termina na posição original e visível.',
      'Distâncias curtas (16 a 40 px) parecem mais elegantes; distâncias longas chamam mais atenção.',
      'Com redução de movimento, o deslocamento é removido e fica só o fade.',
    ],
    alternativa: 'GSAP: gsap.from(el, { y: 40, opacity: 0, duration: 0.7 }) — útil quando a entrada depende de rolagem (ScrollTrigger).',
    compatibilidade: 'Todos os navegadores atuais.',
    responsividade: 'Em telas estreitas, prefira distâncias menores ou o eixo vertical, para não gerar rolagem horizontal durante a entrada.',
    acessibilidade: 'Respeita prefers-reduced-motion: sem deslocamento, só a opacidade. O elemento está no HTML desde o início.',
    performance: 'transform e opacity são animadas pelo compositor, sem recalcular layout.',
    limitacoes: ['Entradas pela lateral podem gerar barra de rolagem horizontal se o contêiner não tiver overflow controlado.'],
    referencias: [MDN.transform, MDN.keyframes, MDN.reduzir],
    validadoEm: VALIDADO_EM,
    status: 'validado',
  },
  params: [
    {
      id: 'direcao',
      rotulo: 'vem de',
      tipo: 'select',
      opcoes: [
        { valor: 'baixo', rotulo: 'baixo' },
        { valor: 'cima', rotulo: 'cima' },
        { valor: 'esquerda', rotulo: 'esquerda' },
        { valor: 'direita', rotulo: 'direita' },
      ],
      padrao: 'baixo',
    },
    { id: 'dist', rotulo: 'distância', tipo: 'range', min: 8, max: 200, passo: 4, unidade: 'px', padrao: 40 },
    { id: 'dur', rotulo: 'duração', tipo: 'range', min: 100, max: 2000, passo: 50, unidade: 'ms', padrao: 700 },
    { id: 'easing', rotulo: 'curva (easing)', tipo: 'select', opcoes: EASINGS, padrao: 'cubic-bezier(0.22, 1, 0.36, 1)' },
  ],
  gerar: (v) => ({
    html: `<div class="cartao slide-in">Slide in</div>
<button class="repetir" type="button">Repetir</button>`,
    css: `${cssPalco('  overflow: hidden;\n')}

.cartao {
  padding: 32px 48px;
  border-radius: 16px;
  background: linear-gradient(135deg, #7c3aed, #2563eb);
  font-size: 1.5rem;
  font-weight: 700;
}

/* O efeito */
.slide-in {
  animation: slide-in ${v['dur']}ms ${v['easing']} both;
}

@keyframes slide-in {
  from { opacity: 0; transform: ${ORIGEM[String(v['direcao'])](Number(v['dist']))}; }
  to   { opacity: 1; transform: none; }
}

/* Sem deslocamento para quem prefere menos movimento */
@media (prefers-reduced-motion: reduce) {
  .slide-in { animation-name: aparecer; }
  @keyframes aparecer { from { opacity: 0; } to { opacity: 1; } }
}
${CSS_REPETIR}`,
    js: jsRepetir('.cartao', 'slide-in'),
  }),
};
