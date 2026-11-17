import { LabDemo } from '../models/demo.model';

/**
 * Demonstrações do Laboratório 03 — Scroll Lab (GSAP ScrollTrigger).
 *
 * Cada demo tem uma janela de rolagem própria dentro do palco
 * (o "scroller"), para não depender da rolagem da página.
 * Animações reais: pages/scroll-lab/scroll-cenas.ts
 */

const SCRUB = (padrao: string) =>
  ({
    id: 'scrub',
    rotulo: 'scrub',
    tipo: 'select',
    opcoes: [
      { valor: 'true', rotulo: 'true (preso à rolagem)' },
      { valor: '0.5', rotulo: '0.5 (suaviza 0,5 s)' },
      { valor: '2', rotulo: '2 (suaviza 2 s)' },
    ],
    padrao,
  }) as const;

const MARKERS = {
  id: 'markers',
  rotulo: 'markers',
  tipo: 'select',
  opcoes: [
    { valor: 'false', rotulo: 'false (escondidos)' },
    { valor: 'true', rotulo: 'true (mostrar start/end)' },
  ],
  padrao: 'false',
} as const;

const ROLAR = 'Rolar automaticamente';

export const SCROLL_DEMOS: LabDemo[] = [
  // ---------------------------------------------------------------- 1
  {
    id: 'gatilho',
    topico: 'ScrollTrigger',
    titulo: 'Disparar animação ao rolar',
    nivel: 'iniciante',
    resumo: 'A animação começa quando o elemento entra na área visível.',
    explicacao: [
      'ScrollTrigger liga uma animação do GSAP à rolagem: ela dispara quando o trigger cruza a linha de start.',
      'start: "top 80%" significa "quando o topo do elemento chegar a 80% da altura da janela".',
      'toggleActions define o que fazer em 4 momentos: ao entrar, ao sair por baixo, ao voltar e ao sair por cima.',
    ],
    dica: 'Ligue markers enquanto desenvolve para enxergar as linhas de start e end.',
    acao: ROLAR,
    instrucao: 'Role dentro da janela (ou clique em “Rolar automaticamente”).',
    presets: [
      { nome: 'Vai e volta', valores: { acoes: 'play reverse play reverse' } },
      { nome: 'Depurar', valores: { markers: 'true' } },
    ],
    desafio: {
      enunciado: 'Faça a animação reiniciar toda vez que o card entrar, disparando no centro da janela.',
      meta: { acoes: 'restart none none reset', start: 'top center' },
    },
    params: [
      {
        id: 'start',
        rotulo: 'start',
        tipo: 'select',
        opcoes: [
          { valor: 'top 80%', rotulo: '"top 80%" (cedo)' },
          { valor: 'top center', rotulo: '"top center" (meio)' },
          { valor: 'top 20%', rotulo: '"top 20%" (tarde)' },
        ],
        padrao: 'top 80%',
      },
      {
        id: 'acoes',
        rotulo: 'toggleActions',
        tipo: 'select',
        opcoes: [
          { valor: 'play none none none', rotulo: 'play none none none' },
          { valor: 'play reverse play reverse', rotulo: 'play reverse play reverse' },
          { valor: 'restart none none reset', rotulo: 'restart none none reset' },
        ],
        padrao: 'play none none none',
      },
      MARKERS,
    ],
    codigo: (v) => `gsap.registerPlugin(ScrollTrigger);

gsap.from(".card", {
  x: -160,
  opacity: 0,
  duration: 0.8,
  scrollTrigger: {
    trigger: ".card",
    start: "${v['start']}",
    toggleActions: "${v['acoes']}",
    markers: ${v['markers']},
  },
});`,
  },
  // ---------------------------------------------------------------- 2
  {
    id: 'scrub',
    topico: 'Scrub',
    titulo: 'Animação presa à barra de rolagem',
    nivel: 'intermediario',
    resumo: 'O progresso da animação acompanha a rolagem, para frente e para trás.',
    explicacao: [
      'Com scrub, a animação deixa de ter tempo próprio: rolar 50% do trecho = animação em 50%.',
      'scrub: true segue a rolagem na hora; um número (0.5, 2) adiciona um "atraso" suave para alcançar.',
      'O trecho vai do start ao end — aqui, da entrada da seção até a saída.',
    ],
    dica: 'Scrub com número (ex.: 1) costuma parecer mais agradável que true, principalmente com mouse de roda.',
    acao: ROLAR,
    instrucao: 'Role devagar para frente e para trás e observe o giro.',
    presets: [
      { nome: 'Grudado', valores: { scrub: 'true', voltas: 1 } },
      { nome: 'Manteiga', valores: { scrub: '2', voltas: 2 } },
    ],
    desafio: {
      enunciado: 'Faça a forma dar 3 voltas completas com suavização de 0,5 s.',
      meta: { voltas: 3, scrub: '0.5' },
    },
    params: [
      SCRUB('true'),
      { id: 'voltas', rotulo: 'voltas', tipo: 'range', min: 0, max: 4, passo: 0.5, unidade: '', padrao: 1 },
      { id: 'dist', rotulo: 'x final', tipo: 'range', min: 0, max: 200, passo: 10, unidade: 'px', padrao: 160 },
    ],
    codigo: (v) => `gsap.to(".forma", {
  x: ${v['dist']},
  rotation: ${Number(v['voltas']) * 360},
  ease: "none",
  scrollTrigger: {
    trigger: ".secao",
    start: "top bottom",
    end: "bottom top",
    scrub: ${v['scrub']},
  },
});`,
  },
  // ---------------------------------------------------------------- 3
  {
    id: 'pin',
    topico: 'Pin',
    titulo: 'Fixar uma seção enquanto anima',
    nivel: 'intermediario',
    resumo: 'A seção para na tela e o conteúdo muda enquanto você rola.',
    explicacao: [
      'pin: true "prende" o trigger na tela entre start e end. A página continua rolando, mas a seção não sai.',
      'end: "+=600" significa que a seção fica presa por 600px de rolagem.',
      'Quanto maior o end, mais devagar a animação interna acontece em relação à rolagem.',
    ],
    dica: 'O ScrollTrigger cria um espaço extra (pinSpacing) para o conteúdo seguinte não ficar por baixo.',
    acao: ROLAR,
    instrucao: 'Role: o painel fica parado enquanto as barras enchem.',
    presets: [{ nome: 'Pin longo', valores: { dist: 1200, scrub: '0.5' } }],
    desafio: { enunciado: 'Prenda a seção por exatos 400px de rolagem.', meta: { dist: 400 } },
    params: [
      { id: 'dist', rotulo: 'end: "+=…"', tipo: 'range', min: 200, max: 1200, passo: 100, unidade: 'px', padrao: 600 },
      SCRUB('true'),
      MARKERS,
    ],
    codigo: (v) => `const tl = gsap.timeline({
  scrollTrigger: {
    trigger: ".painel",
    start: "top top",
    end: "+=${v['dist']}",
    pin: true,
    scrub: ${v['scrub']},
    markers: ${v['markers']},
  },
});

tl.from(".barra", { scaleX: 0, stagger: 0.3, transformOrigin: "left" });`,
  },
  // ---------------------------------------------------------------- 4
  {
    id: 'parallax',
    topico: 'Parallax',
    titulo: 'Camadas em velocidades diferentes',
    nivel: 'intermediario',
    resumo: 'Profundidade: o que está longe se move menos que o que está perto.',
    explicacao: [
      'Parallax é só várias animações com scrub, cada camada com uma distância diferente.',
      'Camadas do fundo andam pouco; as da frente andam mais — o cérebro entende como profundidade.',
      'yPercent move em porcentagem da altura do próprio elemento, o que se adapta a qualquer tela.',
    ],
    dica: 'Use valores negativos para a camada "subir mais rápido" que a rolagem.',
    acao: ROLAR,
    instrucao: 'Role e compare a velocidade das três camadas.',
    presets: [
      { nome: 'Sutil', valores: { fundo: 10, meio: 30, frente: 60 } },
      { nome: 'Invertido', valores: { fundo: -40, meio: 0, frente: 40 } },
    ],
    desafio: {
      enunciado: 'Deixe o fundo parado (0) e a frente se movendo 80%.',
      meta: { fundo: 0, frente: 80 },
    },
    params: [
      { id: 'fundo', rotulo: 'fundo (yPercent)', tipo: 'range', min: -80, max: 80, passo: 10, unidade: '%', padrao: 20 },
      { id: 'meio', rotulo: 'meio (yPercent)', tipo: 'range', min: -80, max: 80, passo: 10, unidade: '%', padrao: 50 },
      { id: 'frente', rotulo: 'frente (yPercent)', tipo: 'range', min: -80, max: 80, passo: 10, unidade: '%', padrao: -40 },
    ],
    codigo: (v) => `const camadas = { ".fundo": ${v['fundo']}, ".meio": ${v['meio']}, ".frente": ${v['frente']} };

for (const [seletor, yPercent] of Object.entries(camadas)) {
  gsap.to(seletor, {
    yPercent,
    ease: "none",
    scrollTrigger: {
      trigger: ".cena",
      start: "top bottom",
      end: "bottom top",
      scrub: true,
    },
  });
}`,
  },
  // ---------------------------------------------------------------- 5
  {
    id: 'horizontal',
    topico: 'Horizontal Scroll',
    titulo: 'Rolagem vertical vira horizontal',
    nivel: 'avancado',
    resumo: 'Prender a seção e deslizar os painéis para o lado enquanto se rola para baixo.',
    explicacao: [
      'A seção fica presa (pin) e uma faixa de painéis anda no eixo x com scrub.',
      'A distância é calculada: largura total da faixa menos a largura visível.',
      'Usamos funções () => … com invalidateOnRefresh para recalcular se a tela mudar de tamanho.',
    ],
    dica: 'snap: 1 / (painéis - 1) faz a rolagem "encaixar" em cada painel.',
    acao: ROLAR,
    instrucao: 'Role para baixo: os painéis passam para o lado.',
    presets: [{ nome: 'Com encaixe', valores: { snap: 'true', paineis: '4' } }],
    desafio: { enunciado: 'Monte uma galeria com 5 painéis que encaixa em cada um.', meta: { paineis: '5', snap: 'true' } },
    params: [
      {
        id: 'paineis',
        rotulo: 'painéis',
        tipo: 'select',
        opcoes: [
          { valor: '3', rotulo: '3' },
          { valor: '4', rotulo: '4' },
          { valor: '5', rotulo: '5' },
        ],
        padrao: '4',
      },
      SCRUB('true'),
      {
        id: 'snap',
        rotulo: 'snap',
        tipo: 'select',
        opcoes: [
          { valor: 'false', rotulo: 'false (livre)' },
          { valor: 'true', rotulo: 'true (encaixa)' },
        ],
        padrao: 'false',
      },
    ],
    codigo: (v) => {
      const n = Number(v['paineis']);
      const snap = v['snap'] === 'true' ? `\n    snap: 1 / ${n - 1},` : '';
      return `const faixa = document.querySelector(".faixa");
const distancia = () => faixa.scrollWidth - window.innerWidth;

gsap.to(faixa, {
  x: () => -distancia(),
  ease: "none",
  scrollTrigger: {
    trigger: ".horizontal",
    start: "top top",
    end: () => "+=" + distancia(),
    pin: true,
    scrub: ${v['scrub']},${snap}
    invalidateOnRefresh: true,
  },
});`;
    },
  },
  // ---------------------------------------------------------------- 6
  {
    id: 'progresso',
    topico: 'Scroll Progress',
    titulo: 'Barra de progresso de leitura',
    nivel: 'iniciante',
    resumo: 'Mostrar quanto do conteúdo já foi lido.',
    explicacao: [
      'self.progress vai de 0 (início) a 1 (fim) e é atualizado a cada rolagem.',
      'A barra é só um elemento com scaleX animado com scrub, do início ao fim do conteúdo.',
      'onUpdate permite usar o valor em qualquer lugar — aqui, no contador de porcentagem.',
    ],
    dica: 'Anime scaleX (não width): é mais leve para o navegador.',
    acao: ROLAR,
    instrucao: 'Role o texto e acompanhe a barra no topo.',
    presets: [
      { nome: 'Fina', valores: { altura: 2 } },
      { nome: 'Grossa e suave', valores: { altura: 12, scrub: '0.5' } },
    ],
    desafio: { enunciado: 'Deixe a barra com 8px de altura e suavização de 2 s.', meta: { altura: 8, scrub: '2' } },
    params: [
      { id: 'altura', rotulo: 'altura da barra', tipo: 'range', min: 2, max: 12, passo: 1, unidade: 'px', padrao: 4 },
      SCRUB('true'),
    ],
    codigo: (v) => `gsap.to(".barra-progresso", {
  scaleX: 1,
  ease: "none",
  scrollTrigger: {
    trigger: ".artigo",
    start: "top top",
    end: "bottom bottom",
    scrub: ${v['scrub']},
    onUpdate: (self) => {
      contador.textContent = Math.round(self.progress * 100) + "%";
    },
  },
});

/* CSS */
.barra-progresso {
  height: ${v['altura']}px;
  transform: scaleX(0);
  transform-origin: left;
}`,
  },
  // ---------------------------------------------------------------- 7
  {
    id: 'storytelling',
    topico: 'Scroll Storytelling',
    titulo: 'Contar uma história com a rolagem',
    nivel: 'avancado',
    resumo: 'Uma cena presa que muda de capítulo conforme você rola.',
    explicacao: [
      'Storytelling junta tudo: pin + timeline + scrub. Cada capítulo é um trecho da timeline.',
      'addLabel() marca o início de cada capítulo; com snap: "labels" a rolagem para exatamente neles.',
      'A mesma timeline anima a forma, a cor e o texto — tudo sincronizado com a rolagem.',
    ],
    dica: 'Planeje a história como um roteiro: cada capítulo com início, meio e fim antes de escrever código.',
    acao: ROLAR,
    instrucao: 'Role pelos 3 capítulos: Dança → Código → Criação.',
    presets: [{ nome: 'Cinema', valores: { scrub: '2', snap: 'true' } }],
    desafio: { enunciado: 'Faça a rolagem parar em cada capítulo, sem suavização extra.', meta: { snap: 'true', scrub: 'true' } },
    params: [
      SCRUB('0.5'),
      {
        id: 'snap',
        rotulo: 'snap',
        tipo: 'select',
        opcoes: [
          { valor: 'false', rotulo: 'false (livre)' },
          { valor: 'true', rotulo: '"labels" (para nos capítulos)' },
        ],
        padrao: 'false',
      },
    ],
    codigo: (v) => {
      const snap = v['snap'] === 'true' ? `\n    snap: "labels",` : '';
      return `const tl = gsap.timeline({
  scrollTrigger: {
    trigger: ".historia",
    start: "top top",
    end: "+=1500",
    pin: true,
    scrub: ${v['scrub']},${snap}
  },
});

tl.addLabel("danca")
  .to(".forma", { borderRadius: "8px", rotation: 90, backgroundColor: "#8b5cf6" })
  .to(".texto-1", { opacity: 0, y: -20 }, "<")
  .from(".texto-2", { opacity: 0, y: 20 })
  .addLabel("codigo")
  .to(".forma", { borderRadius: "50%", scale: 1.3, backgroundColor: "#22e3ff" })
  .to(".texto-2", { opacity: 0, y: -20 }, "<")
  .from(".texto-3", { opacity: 0, y: 20 })
  .addLabel("criacao");`;
    },
  },
];
