/**
 * Exercícios (perguntas de múltipla escolha) por laboratório.
 * Cada questão tem uma única alternativa correta e uma explicação.
 */
export interface Questao {
  id: string;
  labId: string;
  pergunta: string;
  alternativas: string[];
  /** Índice da alternativa correta. */
  correta: number;
  explicacao: string;
}

export const EXERCICIOS: Questao[] = [
  // ---------- CSS ----------
  {
    id: 'css-1',
    labId: 'css',
    pergunta: 'Quais propriedades são as mais leves para animar no navegador?',
    alternativas: ['width e height', 'top e left', 'transform e opacity', 'margin e padding'],
    correta: 2,
    explicacao: 'transform e opacity não obrigam o navegador a recalcular o layout da página.',
  },
  {
    id: 'css-2',
    labId: 'css',
    pergunta: 'Qual a diferença principal entre transition e @keyframes?',
    alternativas: [
      'transition só funciona com cores',
      'transition precisa de uma mudança de estado; @keyframes pode rodar sozinha',
      '@keyframes não aceita duração',
      'Não há diferença',
    ],
    correta: 1,
    explicacao: 'A transition anima a passagem entre dois estados. A animação com @keyframes começa sozinha e pode repetir.',
  },
  {
    id: 'css-3',
    labId: 'css',
    pergunta: 'Para um card 3D parecer ter profundidade, onde vai a propriedade perspective?',
    alternativas: ['No próprio card', 'No elemento pai (a cena)', 'No body sempre', 'Em qualquer filho'],
    correta: 1,
    explicacao: 'perspective no pai define a distância do "olho" até a cena onde os filhos giram.',
  },
  {
    id: 'css-4',
    labId: 'css',
    pergunta: 'Para animar clip-path com polygon(), o que precisa ser verdade?',
    alternativas: [
      'Os dois polígonos precisam ter a mesma quantidade de pontos',
      'O polígono precisa ser um triângulo',
      'Só funciona com imagens',
      'Precisa de JavaScript',
    ],
    correta: 0,
    explicacao: 'O navegador interpola ponto a ponto, então início e fim precisam ter o mesmo número de vértices.',
  },
  // ---------- GSAP ----------
  {
    id: 'gsap-1',
    labId: 'gsap',
    pergunta: 'Qual método começa nos valores informados e volta ao estado atual do elemento?',
    alternativas: ['gsap.to()', 'gsap.from()', 'gsap.set()', 'gsap.timeline()'],
    correta: 1,
    explicacao: 'from() é ideal para entradas: o elemento já está no lugar e o GSAP o traz "de fora".',
  },
  {
    id: 'gsap-2',
    labId: 'gsap',
    pergunta: 'Numa timeline, o que significa a posição "-=0.3" num .to()?',
    alternativas: [
      'Começa 0,3 s depois do passo anterior',
      'Começa 0,3 s antes do fim do passo anterior',
      'Dura 0,3 s',
      'Repete 3 vezes',
    ],
    correta: 1,
    explicacao: 'Valores relativos com "-=" sobrepõem o passo ao anterior, criando continuidade.',
  },
  {
    id: 'gsap-3',
    labId: 'gsap',
    pergunta: 'Para uma entrada na tela parecer natural, qual tipo de ease costuma funcionar melhor?',
    alternativas: ['.in', '.out', 'none', 'steps(1)'],
    correta: 1,
    explicacao: '.out começa rápido e desacelera no final, como um objeto que chega e para.',
  },
  {
    id: 'gsap-4',
    labId: 'gsap',
    pergunta: 'Qual método muda a velocidade de uma timeline sem recriá-la?',
    alternativas: ['tl.duration()', 'tl.delay()', 'tl.timeScale()', 'tl.repeat()'],
    correta: 2,
    explicacao: 'timeScale(2) toca no dobro da velocidade; timeScale(0.5), na metade.',
  },
  // ---------- Scroll ----------
  {
    id: 'scroll-1',
    labId: 'scroll',
    pergunta: 'O que start: "top 80%" significa no ScrollTrigger?',
    alternativas: [
      'Quando 80% do elemento estiver visível',
      'Quando o topo do elemento chegar a 80% da altura da janela',
      'Depois de rolar 80px',
      'Quando faltar 80% da página',
    ],
    correta: 1,
    explicacao: 'O primeiro valor é um ponto do elemento; o segundo, um ponto da janela.',
  },
  {
    id: 'scroll-2',
    labId: 'scroll',
    pergunta: 'O que faz scrub: true?',
    alternativas: [
      'Toca a animação uma vez ao entrar',
      'Prende a seção na tela',
      'Liga o progresso da animação diretamente à rolagem',
      'Mostra os markers',
    ],
    correta: 2,
    explicacao: 'Com scrub, rolar para frente avança a animação e rolar para trás a volta.',
  },
  {
    id: 'scroll-3',
    labId: 'scroll',
    pergunta: 'Qual opção mantém uma seção fixa na tela enquanto a rolagem continua?',
    alternativas: ['pin: true', 'snap: true', 'markers: true', 'once: true'],
    correta: 0,
    explicacao: 'pin prende o trigger entre start e end.',
  },
  {
    id: 'scroll-4',
    labId: 'scroll',
    pergunta: 'No parallax, qual camada deve se mover menos?',
    alternativas: ['A da frente', 'A do fundo', 'Todas iguais', 'Nenhuma'],
    correta: 1,
    explicacao: 'O que está "longe" se desloca menos — é isso que cria a sensação de profundidade.',
  },
  // ---------- SVG ----------
  {
    id: 'svg-1',
    labId: 'svg',
    pergunta: 'Quais propriedades fazem o truque de "desenhar" um traço SVG?',
    alternativas: ['fill e stroke', 'stroke-dasharray e stroke-dashoffset', 'viewBox e preserveAspectRatio', 'width e height'],
    correta: 1,
    explicacao: 'Um traço do tamanho do caminho, deslocado até sumir; animando o deslocamento, ele aparece.',
  },
  {
    id: 'svg-2',
    labId: 'svg',
    pergunta: 'Numa <mask> do SVG, qual cor deixa o conteúdo visível?',
    alternativas: ['Preto', 'Branco', 'Transparente', 'Qualquer cor'],
    correta: 1,
    explicacao: 'Branco mostra, preto esconde; tons de cinza deixam semitransparente.',
  },
  {
    id: 'svg-3',
    labId: 'svg',
    pergunta: 'Como o GSAP anima atributos de SVG, como o raio r de um círculo?',
    alternativas: ['{ r: 50 }', '{ attr: { r: 50 } }', '{ css: { r: 50 } }', 'Não é possível'],
    correta: 1,
    explicacao: 'O objeto attr diz ao GSAP para mexer no atributo, não no CSS.',
  },
  // ---------- Three.js ----------
  {
    id: 'three-1',
    labId: 'three',
    pergunta: 'Quais são os três ingredientes mínimos de uma cena Three.js?',
    alternativas: ['Cena, câmera e renderizador', 'Canvas, CSS e HTML', 'Luz, sombra e textura', 'Mesh, shader e GLSL'],
    correta: 0,
    explicacao: 'A cena guarda os objetos, a câmera define o ponto de vista e o renderizador desenha.',
  },
  {
    id: 'three-2',
    labId: 'three',
    pergunta: 'Um Mesh é formado por quais duas partes?',
    alternativas: ['Câmera e luz', 'Geometria e material', 'Textura e cor', 'Vértice e pixel'],
    correta: 1,
    explicacao: 'A geometria é a forma; o material diz como a superfície reage à luz.',
  },
  {
    id: 'three-3',
    labId: 'three',
    pergunta: 'Qual material NÃO reage à luz da cena?',
    alternativas: ['MeshStandardMaterial', 'MeshPhongMaterial', 'MeshBasicMaterial', 'MeshPhysicalMaterial'],
    correta: 2,
    explicacao: 'MeshBasicMaterial pinta a cor "chapada", sem considerar luzes.',
  },
  {
    id: 'three-4',
    labId: 'three',
    pergunta: 'Para saber em qual objeto o mouse está, usamos…',
    alternativas: ['OrbitControls', 'Raycaster', 'Clock', 'AnimationMixer'],
    correta: 1,
    explicacao: 'O Raycaster lança um "raio" da câmera pela posição do mouse e lista o que ele atravessa.',
  },
  // ---------- WebGL / GLSL ----------
  {
    id: 'webgl-1',
    labId: 'webgl',
    pergunta: 'O que o fragment shader calcula?',
    alternativas: ['A posição de cada vértice', 'A cor de cada pixel', 'A física da cena', 'O tamanho do canvas'],
    correta: 1,
    explicacao: 'O fragment shader roda para cada pixel e devolve a cor em gl_FragColor.',
  },
  {
    id: 'webgl-2',
    labId: 'webgl',
    pergunta: 'Como enviar um valor do JavaScript (ex.: o tempo) para o shader?',
    alternativas: ['Com uma variável global', 'Com um uniform', 'Com console.log', 'Com uma classe CSS'],
    correta: 1,
    explicacao: 'Uniforms são valores iguais para todos os pixels/vértices, atualizados pelo JavaScript.',
  },
  {
    id: 'webgl-3',
    labId: 'webgl',
    pergunta: 'O que são as coordenadas UV?',
    alternativas: [
      'Raios ultravioleta',
      'A posição do pixel na superfície, de 0 a 1 em x e y',
      'A posição da câmera',
      'O índice de cada vértice',
    ],
    correta: 1,
    explicacao: 'UV (0,0) é um canto da superfície e (1,1) o oposto — ótimo para gradientes e texturas.',
  },
  {
    id: 'webgl-4',
    labId: 'webgl',
    pergunta: 'Para ondular uma superfície mexendo na forma (e não só na cor), qual shader usamos?',
    alternativas: ['Fragment shader', 'Vertex shader', 'CSS shader', 'Nenhum'],
    correta: 1,
    explicacao: 'O vertex shader move os vértices; o fragment shader só pinta.',
  },
  // ---------- Interface Lab ----------
  {
    id: 'ui-1',
    labId: 'ui',
    pergunta: 'Num divisor de seção em SVG, para que serve preserveAspectRatio="none"?',
    alternativas: [
      'Deixar o desenho esticar para qualquer largura de tela',
      'Esconder o SVG no celular',
      'Animar o divisor sozinho',
      'Trocar a cor automaticamente',
    ],
    correta: 0,
    explicacao: 'Sem manter a proporção, o SVG largo e baixo ocupa a largura toda da seção, em qualquer tela.',
  },
  {
    id: 'ui-2',
    labId: 'ui',
    pergunta: 'Como fazer o título parecer estar "atrás" da paisagem?',
    alternativas: [
      'Aumentar o font-size',
      'Empilhar fundo, texto e uma imagem recortada da frente com z-index maior',
      'Usar text-shadow',
      'Colocar o texto dentro de um <canvas>',
    ],
    correta: 1,
    explicacao: 'A camada da frente, com fundo transparente, cobre a base das letras e cria a profundidade.',
  },
  {
    id: 'ui-3',
    labId: 'ui',
    pergunta: 'Qual propriedade faz um carrossel horizontal "encaixar" em cada card?',
    alternativas: ['overflow: hidden', 'scroll-snap-type', 'position: sticky', 'backdrop-filter'],
    correta: 1,
    explicacao: 'scroll-snap-type no trilho + scroll-snap-align nos cards fazem a rolagem parar em cada um.',
  },
  {
    id: 'ui-4',
    labId: 'ui',
    pergunta: 'Por que usar gsap.quickTo para seguir o mouse?',
    alternativas: [
      'Porque cria o cursor sozinho',
      'Porque reaproveita a mesma animação em vez de criar um tween novo a cada movimento',
      'Porque funciona sem JavaScript',
      'Porque desliga o mouse do sistema',
    ],
    correta: 1,
    explicacao: 'O mouse dispara dezenas de eventos por segundo; quickTo só atualiza o destino da animação existente.',
  },
];
