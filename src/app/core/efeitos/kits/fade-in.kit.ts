import { EffectKit } from '../../models/effect-sheet.model';
import { CSS_REPETIR, EASINGS, MDN, VALIDADO_EM, cssPalco, jsRepetir } from './_base';

export const FADE_IN: EffectKit = {
  ficha: {
    id: 'fade-in',
    nomeTecnico: 'Fade In',
    nomeAmigavel: 'Aparecer suavemente',
    categoria: 'transicoes',
    subcategoria: 'Entradas',
    descricao: 'O elemento surge indo de transparente a totalmente visível.',
    objetivoVisual: 'Dar uma entrada calma, sem chamar atenção para o movimento.',
    aplicacoes: ['Conteúdo que carrega depois da página', 'Mensagens de confirmação', 'Imagens que terminam de baixar'],
    nivel: 'iniciante',
    tecnologias: ['HTML', 'CSS', 'JavaScript'],
    dependencias: [],
    interacoes: ['autoplay', 'click'],
    tags: ['fade', 'opacity', 'entrada', 'aparecer', 'keyframes'],
    explicacao: [
      'A animação muda só a propriedade opacity, de 0 (invisível) a 1 (visível).',
      '@keyframes descreve o começo e o fim; animation diz quanto tempo leva, qual curva usa e quanto espera para começar.',
      'O valor both em animation-fill-mode mantém o estado inicial durante o atraso e o final depois que a animação acaba.',
      'O JavaScript só existe para o botão Repetir: ele tira e recoloca a classe para a animação recomeçar.',
    ],
    alternativa: 'Com JavaScript puro: element.animate([{ opacity: 0 }, { opacity: 1 }], { duration, easing }) — Web Animations API, sem precisar de classe.',
    compatibilidade: 'Todos os navegadores atuais (animation e @keyframes são suportados há muitos anos).',
    responsividade: 'Não depende do tamanho da tela.',
    acessibilidade: 'Mudar só a opacidade não provoca sensação de movimento, então o efeito é mantido mesmo com redução de movimento; nesse caso a duração cai para 200 ms. O conteúdo existe no HTML desde o início, então leitores de tela o encontram normalmente.',
    performance: 'opacity é processada pela GPU (compositor) e não recalcula o layout.',
    limitacoes: ['Elementos com opacity 0 continuam ocupando espaço e podendo receber cliques durante a animação.'],
    referencias: [MDN.animation, MDN.keyframes, MDN.reduzir],
    validadoEm: VALIDADO_EM,
    status: 'validado',
  },
  params: [
    { id: 'dur', rotulo: 'duração', tipo: 'range', min: 100, max: 2000, passo: 50, unidade: 'ms', padrao: 700 },
    { id: 'atraso', rotulo: 'atraso', tipo: 'range', min: 0, max: 1000, passo: 50, unidade: 'ms', padrao: 0 },
    { id: 'easing', rotulo: 'curva (easing)', tipo: 'select', opcoes: EASINGS, padrao: 'ease' },
  ],
  gerar: (v) => ({
    html: `<div class="cartao fade-in">Fade in</div>
<button class="repetir" type="button">Repetir</button>`,
    css: `${cssPalco()}

.cartao {
  padding: 32px 48px;
  border-radius: 16px;
  background: linear-gradient(135deg, #d4119f, #7c3aed);
  font-size: 1.5rem;
  font-weight: 700;
}

/* O efeito */
.fade-in {
  animation: fade-in ${v['dur']}ms ${v['easing']} ${v['atraso']}ms both;
}

@keyframes fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

/* Opacidade não é movimento: mantemos o efeito, só mais curto */
@media (prefers-reduced-motion: reduce) {
  .fade-in { animation-duration: 200ms; animation-delay: 0ms; }
}
${CSS_REPETIR}`,
    js: jsRepetir('.cartao', 'fade-in'),
  }),
};
