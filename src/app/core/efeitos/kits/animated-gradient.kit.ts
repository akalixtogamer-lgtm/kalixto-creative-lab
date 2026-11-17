import { EffectKit } from '../../models/effect-sheet.model';
import { CORES, MDN, VALIDADO_EM, cssPalco } from './_base';

export const ANIMATED_GRADIENT: EffectKit = {
  ficha: {
    id: 'animated-gradient',
    nomeTecnico: 'Animated Gradient',
    nomeAmigavel: 'Gradiente animado',
    categoria: 'backgrounds',
    subcategoria: 'Gradientes',
    descricao: 'Um fundo em gradiente que desliza devagar, trocando as cores de lugar.',
    objetivoVisual: 'Dar vida a um hero ou seção sem usar vídeo nem imagem.',
    aplicacoes: ['Fundo de hero', 'Telas de carregamento', 'Banners de campanha'],
    nivel: 'iniciante',
    tecnologias: ['HTML', 'CSS'],
    dependencias: [],
    interacoes: ['autoplay'],
    tags: ['gradiente', 'gradient', 'background', 'fundo', 'cores'],
    explicacao: [
      'linear-gradient cria o degradê. A primeira cor se repete no fim para o movimento não ter emenda.',
      'background-size maior que 100% deixa o gradiente maior que a caixa; só uma parte aparece por vez.',
      'A animação move background-position de um lado para o outro, então a parte visível do gradiente muda.',
      'Este efeito não usa JavaScript.',
    ],
    alternativa: 'Com @property é possível animar as próprias cores ou o ângulo do gradiente (veja o kit Borda animada).',
    compatibilidade: 'Todos os navegadores atuais.',
    responsividade: 'O fundo acompanha o tamanho da caixa; a porcentagem de background-size mantém a proporção em qualquer tela.',
    acessibilidade: 'O movimento é lento e para com prefers-reduced-motion. O texto sobre o fundo usa sombra para manter a leitura em todas as cores.',
    performance: 'Animar background-position repinta a área a cada quadro. Em uma seção é leve; em telas grandes e celulares fracos, prefira velocidades mais lentas.',
    limitacoes: ['Cores muito diferentes entre si podem deixar o texto ilegível em algum momento da animação.'],
    referencias: [MDN.linearGradient, MDN.animation, MDN.reduzir],
    validadoEm: VALIDADO_EM,
    status: 'validado',
  },
  params: [
    { id: 'c1', rotulo: 'cor 1', tipo: 'select', opcoes: CORES, padrao: '#ff2bd6' },
    { id: 'c2', rotulo: 'cor 2', tipo: 'select', opcoes: CORES, padrao: '#8b5cf6' },
    { id: 'c3', rotulo: 'cor 3', tipo: 'select', opcoes: CORES, padrao: '#22e3ff' },
    { id: 'angulo', rotulo: 'ângulo', tipo: 'range', min: 0, max: 360, passo: 5, unidade: '°', padrao: 120 },
    { id: 'dur', rotulo: 'duração do ciclo', tipo: 'range', min: 3, max: 30, passo: 1, unidade: 's', padrao: 10 },
    { id: 'tam', rotulo: 'tamanho do gradiente', tipo: 'range', min: 150, max: 600, passo: 25, unidade: '%', padrao: 300 },
  ],
  gerar: (v) => ({
    html: `<section class="gradiente">
  <h1>Gradiente animado</h1>
</section>`,
    css: `${cssPalco()}

/* O efeito */
.gradiente {
  display: grid;
  place-items: center;
  width: min(100%, 720px);
  aspect-ratio: 16 / 9;
  border-radius: 20px;
  background: linear-gradient(${v['angulo']}deg, ${v['c1']}, ${v['c2']}, ${v['c3']}, ${v['c1']});
  background-size: ${v['tam']}% ${v['tam']}%;
  animation: deslizar ${v['dur']}s ease-in-out infinite alternate;
}

.gradiente h1 {
  margin: 0;
  font-size: clamp(1.4rem, 5vw, 2.6rem);
  text-shadow: 0 2px 12px rgb(0 0 0 / 0.45);
}

@keyframes deslizar {
  from { background-position: 0% 50%; }
  to   { background-position: 100% 50%; }
}

@media (prefers-reduced-motion: reduce) {
  .gradiente { animation: none; }
}`,
    js: `// Este efeito não precisa de JavaScript.`,
  }),
};
