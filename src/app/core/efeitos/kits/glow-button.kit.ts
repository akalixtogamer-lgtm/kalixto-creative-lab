import { EffectKit } from '../../models/effect-sheet.model';
import { CORES, MDN, VALIDADO_EM, cssAngular, cssPalco, tsSimples } from './_base';

export const GLOW_BUTTON: EffectKit = {
  ficha: {
    id: 'glow-button',
    nomeTecnico: 'Glow Button',
    nomeAmigavel: 'Botão com brilho neon',
    categoria: 'luz-profundidade',
    subcategoria: 'Neon e glow',
    descricao:
      'Um contorno luminoso em volta do botão, que pode pulsar e fica mais forte no hover e no foco.',
    objetivoVisual: 'Destacar uma ação em interfaces escuras com estética neon.',
    aplicacoes: [
      'Chamada principal em fundo escuro',
      'Estados "ao vivo" ou "gravando"',
      'Interfaces de games e tecnologia',
    ],
    nivel: 'iniciante',
    tecnologias: ['HTML', 'CSS'],
    dependencias: [],
    interacoes: ['autoplay', 'hover', 'keyboard'],
    tags: ['glow', 'neon', 'brilho', 'box-shadow', 'pulsar', 'botão'],
    explicacao: [
      'O brilho é feito com box-shadow sem deslocamento: só desfoque e cor, em duas camadas (uma interna, uma externa).',
      'O pulso é uma animação que alterna o tamanho do desfoque, repetida para sempre (infinite) e indo e voltando (alternate).',
      'No hover e no foco o desfoque aumenta com transition.',
      'Este efeito não usa JavaScript.',
    ],
    alternativa:
      'filter: drop-shadow() segue o formato real do elemento (útil em ícones SVG), mas custa mais para o navegador.',
    compatibilidade: 'Todos os navegadores atuais.',
    responsividade:
      'Não depende do tamanho da tela. Em toque, o estado de brilho forte aparece ao tocar (:active).',
    acessibilidade:
      'O texto mantém contraste sobre o fundo do botão. O pulso para quando o sistema pede menos movimento. O foco do teclado tem contorno próprio, além do brilho.',
    performance:
      'Animar box-shadow repinta o botão a cada quadro. Para um botão é leve; evite pulsar dezenas de elementos ao mesmo tempo.',
    limitacoes: [
      'Em fundos claros o brilho quase não aparece — o efeito foi pensado para fundos escuros.',
    ],
    referencias: [MDN.boxShadow, MDN.animation, MDN.reduzir],
    validadoEm: VALIDADO_EM,
    status: 'validado',
  },
  params: [
    { id: 'cor', rotulo: 'cor do brilho', tipo: 'select', opcoes: CORES, padrao: '#22e3ff' },
    {
      id: 'brilho',
      rotulo: 'intensidade',
      tipo: 'range',
      min: 4,
      max: 40,
      passo: 2,
      unidade: 'px',
      padrao: 16,
    },
    {
      id: 'pulsar',
      rotulo: 'pulsar',
      tipo: 'select',
      opcoes: [
        { valor: 'sim', rotulo: 'sim' },
        { valor: 'nao', rotulo: 'não' },
      ],
      padrao: 'sim',
    },
    {
      id: 'vel',
      rotulo: 'velocidade do pulso',
      tipo: 'range',
      min: 0.6,
      max: 4,
      passo: 0.2,
      unidade: 's',
      padrao: 2,
    },
  ],
  gerar: (v) => {
    const c = String(v['cor']);
    const b = Number(v['brilho']);
    const pulsa = v['pulsar'] === 'sim';
    return {
      html: `<button class="neon" type="button">Ao vivo</button>`,
      css: `${cssPalco()}

/* O efeito */
.neon {
  padding: 14px 32px;
  border: 2px solid ${c};
  border-radius: 12px;
  background: #0f0d1a;
  color: #fff;
  font: 600 1rem system-ui, sans-serif;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  box-shadow: 0 0 ${b}px ${c}, inset 0 0 ${Math.round(b / 2)}px ${c}66;
  transition: box-shadow 200ms ease;${pulsa ? `\n  animation: pulsar ${v['vel']}s ease-in-out infinite alternate;` : ''}
}

.neon:hover,
.neon:focus-visible {
  box-shadow: 0 0 ${b * 2}px ${c}, inset 0 0 ${b}px ${c}99;
}

.neon:focus-visible { outline: 2px solid #fff; outline-offset: 6px; }
${
  pulsa
    ? `
@keyframes pulsar {
  from { box-shadow: 0 0 ${Math.round(b / 2)}px ${c}, inset 0 0 ${Math.round(b / 4)}px ${c}66; }
  to   { box-shadow: 0 0 ${b * 2}px ${c}, inset 0 0 ${b}px ${c}99; }
}

@media (prefers-reduced-motion: reduce) {
  .neon { animation: none; }
}`
    : ''
}`,
      js: `// Este efeito não precisa de JavaScript.`,
    };
  },
  angular: (v) => ({
    ts: tsSimples('glow-button'),
    html: `<button class="neon" type="button">Ao vivo</button>\n`,
    css: cssAngular(GLOW_BUTTON.gerar(v).css),
  }),
  niveis: {
    iniciante: [
      'O brilho é uma sombra sem deslocamento: ela se espalha igual para todos os lados, parecendo luz.',
      'Uma sombra fica por fora e outra por dentro do botão, como um tubo de neon.',
      'O pulso faz o brilho crescer e diminuir sem parar.',
    ],
    avancado: [
      'Várias sombras separadas por vírgula se somam; inset desenha a sombra para dentro da borda.',
      'animation-direction: alternate evita o salto do fim para o início: o pulso vai e volta.',
      'Animar box-shadow causa repintura a cada quadro. Uma alternativa mais barata é um pseudo-elemento com a sombra máxima e animar só opacity.',
      'filter: drop-shadow acompanha o contorno real (bom para SVG e PNG com transparência), mas é mais caro.',
    ],
  },
  glossario: [
    { termo: 'box-shadow', explicacao: 'Sombra; com deslocamento 0 vira um halo de luz.' },
    { termo: 'inset', explicacao: 'Desenha a sombra para dentro do elemento.' },
    { termo: 'infinite', explicacao: 'Repete a animação para sempre.' },
    { termo: 'alternate', explicacao: 'Cada repetição inverte o sentido (vai e volta).' },
    { termo: ':focus-visible', explicacao: 'Foco pelo teclado com o mesmo destaque do hover.' },
  ],
};
