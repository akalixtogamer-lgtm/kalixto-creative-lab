import { LabDemo, Valores } from '../models/demo.model';

/**
 * Demonstrações do Laboratório 02 — GSAP Studio.
 *
 * Aqui ficam só os dados (controles, explicação e código exibido).
 * As animações de verdade estão em pages/gsap-studio/gsap-animacoes.ts,
 * para que a biblioteca GSAP só seja baixada quando o lab for aberto.
 */

const EASES = [
  { valor: 'power2.out', rotulo: 'power2.out (suave)' },
  { valor: 'power4.inOut', rotulo: 'power4.inOut (forte)' },
  { valor: 'back.out(1.7)', rotulo: 'back.out (passa e volta)' },
  { valor: 'elastic.out(1, 0.4)', rotulo: 'elastic.out (mola)' },
  { valor: 'bounce.out', rotulo: 'bounce.out (quica)' },
  { valor: 'none', rotulo: 'none (linear)' },
];

const DURACAO = (padrao: number) =>
  ({ id: 'dur', rotulo: 'duration', tipo: 'range', min: 0.2, max: 3, passo: 0.1, unidade: 's', padrao }) as const;

const EASE = (padrao: string) => ({ id: 'ease', rotulo: 'ease', tipo: 'select', opcoes: EASES, padrao }) as const;

/** Monta o texto da ease do demo de easing (ex.: "power2.out"). */
export function easeDoDemo(v: Valores): string {
  return v['tipo'] === 'none' ? 'none' : `${v['tipo']}.${v['direcao']}`;
}

export const GSAP_DEMOS: LabDemo[] = [
  // ---------------------------------------------------------------- 1
  {
    id: 'to',
    topico: 'gsap.to()',
    titulo: 'Animar até um estado final',
    nivel: 'iniciante',
    resumo: 'O tween mais usado: do jeito que está até os valores que você define.',
    explicacao: [
      'gsap.to() recebe o alvo (um seletor ou elemento) e um objeto com os valores finais.',
      'O GSAP lê o estado atual sozinho e anima até o destino.',
      'x e rotation são atalhos do GSAP para transform: translateX e rotate — mais rápidos e fáceis de combinar.',
    ],
    dica: 'Use x/y em vez de left/top: transform não força o navegador a recalcular o layout.',
    acao: 'Executar tween',
    instrucao: 'Ajuste os valores e clique em “Executar tween”.',
    presets: [{ nome: 'Pião', valores: { x: 0, rot: 720, dur: 1.5, ease: 'power4.inOut' } }, { nome: 'Mola', valores: { x: 200, rot: 0, dur: 1.5, ease: 'elastic.out(1, 0.4)' } }],
    desafio: { enunciado: 'Leve a caixa a 120px, sem girar, quicando no final (bounce.out).', meta: { x: 120, rot: 0, ease: 'bounce.out' } },
    params: [
      { id: 'x', rotulo: 'x', tipo: 'range', min: 0, max: 220, passo: 10, unidade: 'px', padrao: 180 },
      { id: 'rot', rotulo: 'rotation', tipo: 'range', min: 0, max: 720, passo: 45, unidade: 'deg', padrao: 360 },
      DURACAO(1),
      EASE('power2.out'),
    ],
    codigo: (v) => `gsap.to(".caixa", {
  x: ${v['x']},
  rotation: ${v['rot']},
  duration: ${v['dur']},
  ease: "${v['ease']}",
});`,
  },
  // ---------------------------------------------------------------- 2
  {
    id: 'from',
    topico: 'gsap.from()',
    titulo: 'Entrar a partir de um estado inicial',
    nivel: 'iniciante',
    resumo: 'O contrário do to(): começa nos valores informados e volta ao normal.',
    explicacao: [
      'gsap.from() é perfeito para entradas: o elemento já está no lugar certo no HTML e o GSAP o traz "de fora".',
      'Os valores informados são o ponto de partida; o destino é o estilo atual do elemento.',
      'opacity: 0 + y deslocado é a receita clássica de "aparecer subindo".',
    ],
    dica: 'Para evitar um "piscar" antes da animação, o GSAP aplica o estado inicial imediatamente (immediateRender).',
    acao: 'Executar entrada',
    instrucao: 'Escolha de onde o título vem e clique em “Executar entrada”.',
    presets: [{ nome: 'Cai do céu', valores: { y: -150, op: 0, dur: 1.2, ease: 'bounce.out' } }],
    desafio: { enunciado: 'Faça o título surgir de 100px abaixo, invisível, em 0.5s.', meta: { y: 100, op: 0, dur: 0.5 } },
    params: [
      { id: 'y', rotulo: 'y', tipo: 'range', min: -150, max: 150, passo: 10, unidade: 'px', padrao: 80 },
      { id: 'op', rotulo: 'opacity', tipo: 'range', min: 0, max: 1, passo: 0.1, unidade: '', padrao: 0 },
      DURACAO(0.9),
      EASE('back.out(1.7)'),
    ],
    codigo: (v) => `gsap.from(".titulo", {
  y: ${v['y']},
  opacity: ${v['op']},
  duration: ${v['dur']},
  ease: "${v['ease']}",
});`,
  },
  // ---------------------------------------------------------------- 3
  {
    id: 'fromto',
    topico: 'gsap.fromTo()',
    titulo: 'Definir início e fim',
    nivel: 'iniciante',
    resumo: 'Controle total: você diz de onde parte e onde chega.',
    explicacao: [
      'gsap.fromTo() recebe dois objetos: o estado inicial e o final.',
      'É útil quando a animação precisa ser repetida sempre igual, independente de onde o elemento está.',
      'Os detalhes da animação (duration, ease…) vão no segundo objeto.',
    ],
    dica: 'Se a mesma animação roda várias vezes, fromTo() evita resultados diferentes a cada clique.',
    acao: 'Executar fromTo',
    instrucao: 'Defina posição e tamanho iniciais e finais.',
    presets: [{ nome: 'Cresce no lugar', valores: { xDe: 0, xPara: 0, escDe: 0, dur: 0.8, ease: 'back.out(1.7)' } }],
    desafio: { enunciado: 'Saia de -150px e chegue em 150px, começando do tamanho zero.', meta: { xDe: -150, xPara: 150, escDe: 0 } },
    params: [
      { id: 'xDe', rotulo: 'x inicial', tipo: 'range', min: -150, max: 0, passo: 10, unidade: 'px', padrao: -120 },
      { id: 'xPara', rotulo: 'x final', tipo: 'range', min: 0, max: 150, passo: 10, unidade: 'px', padrao: 120 },
      { id: 'escDe', rotulo: 'scale inicial', tipo: 'range', min: 0, max: 1, passo: 0.1, unidade: '', padrao: 0.3 },
      DURACAO(1.2),
      EASE('elastic.out(1, 0.4)'),
    ],
    codigo: (v) => `gsap.fromTo(".caixa",
  { x: ${v['xDe']}, scale: ${v['escDe']} },
  {
    x: ${v['xPara']},
    scale: 1,
    duration: ${v['dur']},
    ease: "${v['ease']}",
  }
);`,
  },
  // ---------------------------------------------------------------- 4
  {
    id: 'timeline',
    topico: 'Timeline',
    titulo: 'Sequência com Timeline',
    nivel: 'intermediario',
    resumo: 'Encadear várias animações sem calcular atrasos na mão.',
    explicacao: [
      'gsap.timeline() cria um "trilho" onde cada .to() entra depois do anterior.',
      'O terceiro argumento é a posição: "-=0.2" começa 0,2 s antes do fim do passo anterior (sobreposição).',
      'repeat e yoyo valem para a sequência inteira: -1 repete para sempre e yoyo faz ir e voltar.',
    ],
    dica: 'Prefira timelines a vários delays: mudar a duração de um passo reajusta todos os seguintes.',
    acao: 'Tocar sequência',
    instrucao: 'Mude a sobreposição para ver os passos se encavalarem.',
    presets: [{ nome: 'Em fila', valores: { dur: 0.5, sob: 0, rep: '0', yoyo: 'false' } }, { nome: 'Onda infinita', valores: { dur: 0.6, sob: 0.4, rep: '-1', yoyo: 'true' } }],
    desafio: { enunciado: 'Monte uma sequência sem sobreposição que toca uma vez só.', meta: { sob: 0, rep: '0' } },
    params: [
      { id: 'dur', rotulo: 'duration de cada passo', tipo: 'range', min: 0.2, max: 1.5, passo: 0.1, unidade: 's', padrao: 0.6 },
      { id: 'sob', rotulo: 'sobreposição', tipo: 'range', min: 0, max: 0.6, passo: 0.1, unidade: 's', padrao: 0.2 },
      {
        id: 'rep',
        rotulo: 'repeat',
        tipo: 'select',
        opcoes: [
          { valor: '0', rotulo: '0 (uma vez)' },
          { valor: '1', rotulo: '1 (duas vezes)' },
          { valor: '-1', rotulo: '-1 (infinito)' },
        ],
        padrao: '1',
      },
      {
        id: 'yoyo',
        rotulo: 'yoyo',
        tipo: 'select',
        opcoes: [
          { valor: 'true', rotulo: 'true (vai e volta)' },
          { valor: 'false', rotulo: 'false (recomeça)' },
        ],
        padrao: 'true',
      },
    ],
    codigo: (v) => {
      const pos = Number(v['sob']) > 0 ? `, "-=${v['sob']}"` : '';
      return `const tl = gsap.timeline({ repeat: ${v['rep']}, yoyo: ${v['yoyo']} });

tl.to(".circulo",   { x: 180, duration: ${v['dur']} })
  .to(".quadrado",  { x: 180, duration: ${v['dur']} }${pos})
  .to(".triangulo", { x: 180, duration: ${v['dur']} }${pos});`;
    },
  },
  // ---------------------------------------------------------------- 5
  {
    id: 'stagger',
    topico: 'Stagger',
    titulo: 'Entrada em cascata',
    nivel: 'intermediario',
    resumo: 'Animar uma lista inteira com um pequeno atraso entre cada item.',
    explicacao: [
      'stagger distribui o início da animação entre vários elementos de uma vez.',
      'each é o intervalo entre um item e o próximo; from define por onde a onda começa.',
      'Com grid: "auto", o GSAP entende a grade e o "center" vira uma onda circular.',
    ],
    dica: 'Valores pequenos de each (0,03 a 0,1 s) dão a sensação de fluidez sem deixar o usuário esperando.',
    acao: 'Executar cascata',
    instrucao: 'Troque o ponto de partida (from) e veja a onda mudar.',
    presets: [{ nome: 'Chuva', valores: { each: 0.04, from: 'random', ease: 'power2.out' } }, { nome: 'Explosão', valores: { each: 0.06, from: 'center', ease: 'elastic.out(1, 0.4)' } }],
    desafio: { enunciado: 'Faça a onda começar pelas bordas com 0.1s entre cada ponto.', meta: { from: 'edges', each: 0.1 } },
    params: [
      { id: 'each', rotulo: 'each', tipo: 'range', min: 0.02, max: 0.3, passo: 0.02, unidade: 's', padrao: 0.08 },
      {
        id: 'from',
        rotulo: 'from',
        tipo: 'select',
        opcoes: [
          { valor: 'start', rotulo: 'start (início)' },
          { valor: 'center', rotulo: 'center (centro)' },
          { valor: 'end', rotulo: 'end (fim)' },
          { valor: 'edges', rotulo: 'edges (bordas)' },
          { valor: 'random', rotulo: 'random (aleatório)' },
        ],
        padrao: 'center',
      },
      EASE('back.out(1.7)'),
    ],
    codigo: (v) => `gsap.from(".ponto", {
  y: -40,
  scale: 0,
  opacity: 0,
  duration: 0.6,
  ease: "${v['ease']}",
  stagger: {
    each: ${v['each']},
    from: "${v['from']}",
    grid: "auto",
  },
});`,
  },
  // ---------------------------------------------------------------- 6
  {
    id: 'easing',
    topico: 'Easing',
    titulo: 'Curvas de easing',
    nivel: 'intermediario',
    resumo: 'Ver o formato da curva e o movimento que ela produz.',
    explicacao: [
      'O gráfico mostra o progresso (vertical) ao longo do tempo (horizontal). Linha reta = velocidade constante.',
      '.in começa devagar, .out termina devagar e .inOut faz os dois.',
      'back e elastic passam do limite (a curva sai do quadro) e voltam; bounce quica no final.',
    ],
    dica: 'Entradas na tela costumam ficar melhores com .out; saídas, com .in.',
    acao: 'Executar',
    instrucao: 'Escolha a curva: o gráfico atualiza na hora. Depois execute.',
    presets: [{ nome: 'Entrada clássica', valores: { tipo: 'power2', direcao: 'out', dur: 1 } }, { nome: 'Desenho animado', valores: { tipo: 'back', direcao: 'inOut', dur: 1.2 } }],
    desafio: { enunciado: 'Escolha a curva que quica no final e rode em 2s.', meta: { tipo: 'bounce', direcao: 'out', dur: 2 } },
    params: [
      {
        id: 'tipo',
        rotulo: 'Tipo',
        tipo: 'select',
        opcoes: [
          { valor: 'power1', rotulo: 'power1' },
          { valor: 'power2', rotulo: 'power2' },
          { valor: 'power4', rotulo: 'power4' },
          { valor: 'expo', rotulo: 'expo' },
          { valor: 'sine', rotulo: 'sine' },
          { valor: 'circ', rotulo: 'circ' },
          { valor: 'back', rotulo: 'back' },
          { valor: 'elastic', rotulo: 'elastic' },
          { valor: 'bounce', rotulo: 'bounce' },
          { valor: 'none', rotulo: 'none (linear)' },
        ],
        padrao: 'power2',
      },
      {
        id: 'direcao',
        rotulo: 'Direção',
        tipo: 'select',
        opcoes: [
          { valor: 'out', rotulo: '.out' },
          { valor: 'in', rotulo: '.in' },
          { valor: 'inOut', rotulo: '.inOut' },
        ],
        padrao: 'out',
      },
      DURACAO(1.5),
    ],
    codigo: (v) => `gsap.to(".bola", {
  x: 260, // largura do trilho
  duration: ${v['dur']},
  ease: "${easeDoDemo(v)}",
});`,
  },
  // ---------------------------------------------------------------- 7
  {
    id: 'reproducao',
    topico: 'Controles de reprodução',
    titulo: 'Play, pause, reverse e progresso',
    nivel: 'intermediario',
    resumo: 'Controlar uma timeline como um player de vídeo.',
    explicacao: [
      'Toda animação do GSAP retorna um objeto que pode ser controlado depois.',
      'paused: true cria a timeline parada; play(), pause(), reverse() e restart() comandam a reprodução.',
      'progress() vai de 0 a 1 e permite "arrastar" a animação; timeScale() muda a velocidade sem refazer nada.',
    ],
    dica: 'Guarde a timeline numa variável para ligar os métodos a botões, rolagem ou eventos.',
    acao: 'Play',
    instrucao: 'Use os botões do player e arraste a barra de progresso.',
    presets: [{ nome: 'Câmera lenta', valores: { vel: 0.25 } }, { nome: 'Acelerado', valores: { vel: 3 } }],
    desafio: { enunciado: 'Deixe a timeline com metade da velocidade e dê play.', meta: { vel: 0.5 } },
    params: [
      { id: 'vel', rotulo: 'timeScale (velocidade)', tipo: 'range', min: 0.25, max: 3, passo: 0.25, unidade: 'x', padrao: 1 },
    ],
    codigo: (v) => `const tl = gsap.timeline({ paused: true });

tl.to(".card", { x: 140, duration: 1 })
  .to(".card", { rotation: 180, scale: 0.7, duration: 1 })
  .to(".card", { x: -140, borderRadius: "50%", duration: 1 });

tl.timeScale(${v['vel']});

botaoPlay.onclick    = () => tl.play();
botaoPause.onclick   = () => tl.pause();
botaoReverse.onclick = () => tl.reverse();
botaoRestart.onclick = () => tl.restart();
barra.oninput        = () => tl.progress(barra.value);`,
  },
  // ---------------------------------------------------------------- 8
  {
    id: 'splittext',
    topico: 'SplitText',
    titulo: 'Revelar texto por letras, palavras ou linhas',
    nivel: 'intermediario',
    resumo: 'Quebrar um título em pedaços e animar cada um em cascata.',
    explicacao: [
      'SplitText separa o texto em elementos: letras (chars), palavras (words) ou linhas (lines).',
      'Com os pedaços separados, um stagger anima um depois do outro — a leitura acompanha a animação.',
      'mask: "lines" coloca cada linha dentro de um recipiente com overflow: hidden, criando o efeito de "surgir de uma fenda".',
    ],
    dica: 'Para títulos use letras ou palavras; para parágrafos, linhas — animar centenas de letras cansa.',
    acao: 'Revelar texto',
    instrucao: 'Escolha como dividir e o efeito, e clique em “Revelar texto”.',
    presets: [
      { nome: 'Máquina de escrever', valores: { dividir: 'chars', efeito: 'surgir', stagger: 0.04 } },
      { nome: 'Cinema', valores: { dividir: 'lines', efeito: 'subir', stagger: 0.15, dur: 1.2 } },
    ],
    desafio: { enunciado: 'Espalhe as palavras com 0,08 s entre cada uma.', meta: { dividir: 'words', efeito: 'espalhar', stagger: 0.08 } },
    params: [
      {
        id: 'dividir',
        rotulo: 'type (dividir por)',
        tipo: 'select',
        opcoes: [
          { valor: 'chars', rotulo: 'chars (letras)' },
          { valor: 'words', rotulo: 'words (palavras)' },
          { valor: 'lines', rotulo: 'lines (linhas)' },
        ],
        padrao: 'chars',
      },
      {
        id: 'efeito',
        rotulo: 'Efeito',
        tipo: 'select',
        opcoes: [
          { valor: 'subir', rotulo: 'subir (com máscara)' },
          { valor: 'girar', rotulo: 'girar em 3D' },
          { valor: 'espalhar', rotulo: 'espalhar e juntar' },
          { valor: 'surgir', rotulo: 'surgir (opacidade)' },
        ],
        padrao: 'subir',
      },
      { id: 'stagger', rotulo: 'stagger', tipo: 'range', min: 0.01, max: 0.2, passo: 0.01, unidade: 's', padrao: 0.03 },
      { id: 'dur', rotulo: 'duration', tipo: 'range', min: 0.3, max: 1.5, passo: 0.1, unidade: 's', padrao: 0.8 },
    ],
    codigo: (v) => {
      const de: Record<string, string> = {
        subir: 'yPercent: 110',
        girar: 'rotationX: -90, opacity: 0, transformOrigin: "50% 50% -20px"',
        espalhar: 'x: () => gsap.utils.random(-120, 120), y: () => gsap.utils.random(-80, 80), opacity: 0',
        surgir: 'opacity: 0',
      };
      const mascara = v['efeito'] === 'subir' ? `\n  mask: "${v['dividir']}",` : '';
      return `gsap.registerPlugin(SplitText);

const split = SplitText.create(".titulo", {
  type: "${v['dividir']}",${mascara}
});

gsap.from(split.${v['dividir']}, {
  ${de[String(v['efeito'])]},
  duration: ${v['dur']},
  stagger: ${v['stagger']},
  ease: "power3.out",
});`;
    },
  },
];

