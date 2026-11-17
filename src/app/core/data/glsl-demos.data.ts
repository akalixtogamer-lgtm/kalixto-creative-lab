import { LabDemo, Valores } from '../models/demo.model';

/**
 * Demonstrações do Laboratório 06 — WebGL & GLSL.
 *
 * Os shaders ficam AQUI, como texto: o mesmo código que roda na placa de
 * vídeo é o que aparece no Code Viewer. O componente (pages/glsl-lab)
 * só cria o ShaderMaterial do Three.js e atualiza os uniforms.
 *
 * Uniforms disponíveis em todos os shaders:
 *   uTempo (segundos), uResolucao (pixels do palco), uMouse (0 a 1)
 */

export interface ShaderDemo {
  /** '2d' = tela cheia (só fragment); '3d' = malha com vertex shader e câmera. */
  modo: '2d' | '3d';
  vertex: string;
  fragment: string;
  /** Converte os controles em valores de uniforms. Cores em "#rrggbb". */
  uniforms: (v: Valores) => Record<string, number | string>;
  /** Texturas usadas: 'logo' (arquivo) e 'listras' (gerada em canvas). */
  texturas?: ('logo' | 'listras')[];
}

/** Vertex shader de tela cheia: um retângulo que cobre o palco inteiro. */
const VERTEX_TELA = /* glsl */ `varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}`;

const CORES = [
  { valor: '#ff2bd6', rotulo: 'magenta' },
  { valor: '#8b5cf6', rotulo: 'roxo' },
  { valor: '#2f7bff', rotulo: 'azul' },
  { valor: '#22e3ff', rotulo: 'ciano' },
  { valor: '#07050f', rotulo: 'quase preto' },
];

/** Bloco reaproveitado: ruído suave (value noise) + fbm. */
const RUIDO = /* glsl */ `// Número pseudoaleatório a partir de uma posição
float aleatorio(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

// Ruído suave: mistura os aleatórios dos 4 cantos da célula
float ruido(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(aleatorio(i), aleatorio(i + vec2(1.0, 0.0)), u.x),
    mix(aleatorio(i + vec2(0.0, 1.0)), aleatorio(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

// fbm: soma várias camadas de ruído, cada uma menor e mais fraca
float fbm(vec2 p, float oitavas) {
  float valor = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 8; i++) {
    if (float(i) >= oitavas) break;
    valor += amplitude * ruido(p);
    p *= 2.0;
    amplitude *= 0.5;
  }
  return valor;
}`;

export const SHADERS: Record<string, ShaderDemo> = {
  // ---------------------------------------------------------------- 1
  fragment: {
    modo: '2d',
    vertex: VERTEX_TELA,
    fragment: /* glsl */ `uniform float uTempo;
uniform vec3 uCorA;
uniform vec3 uCorB;
uniform float uAngulo;
uniform float uVelocidade;
varying vec2 vUv;

void main() {
  vec2 p = vUv - 0.5;
  float a = radians(uAngulo);

  // Gradiente na direção do ângulo (0 de um lado, 1 do outro)
  float t = dot(p, vec2(cos(a), sin(a))) + 0.5;

  // Uma ondulação que anda com o tempo
  t += 0.08 * sin(uTempo * uVelocidade + vUv.x * 6.0);

  vec3 cor = mix(uCorA, uCorB, clamp(t, 0.0, 1.0));
  gl_FragColor = vec4(cor, 1.0);
}`,
    uniforms: (v) => ({ uCorA: v['corA'], uCorB: v['corB'], uAngulo: v['angulo'], uVelocidade: v['vel'] }),
  },
  // ---------------------------------------------------------------- 2
  vertex: {
    modo: '3d',
    vertex: /* glsl */ `uniform float uTempo;
uniform float uAmplitude;
uniform float uFrequencia;
uniform float uVelocidade;
varying float vAltura;

void main() {
  vec3 p = position;
  float t = uTempo * uVelocidade;

  // Cada vértice sobe ou desce conforme duas ondas cruzadas
  float onda = sin(p.x * uFrequencia + t) * cos(p.y * uFrequencia + t);
  p.z += onda * uAmplitude;

  vAltura = onda;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}`,
    fragment: /* glsl */ `varying float vAltura;

void main() {
  // Cor pela altura: vales roxos, cristas ciano
  vec3 vale = vec3(0.55, 0.36, 0.96);
  vec3 crista = vec3(0.13, 0.89, 1.0);
  vec3 cor = mix(vale, crista, vAltura * 0.5 + 0.5);
  gl_FragColor = vec4(cor, 1.0);
}`,
    uniforms: (v) => ({ uAmplitude: v['amp'], uFrequencia: v['freq'], uVelocidade: v['vel'] }),
  },
  // ---------------------------------------------------------------- 3
  glsl: {
    modo: '2d',
    vertex: VERTEX_TELA,
    fragment: /* glsl */ `uniform vec2 uResolucao;
uniform float uTempo;
uniform float uRaio;
uniform float uBorda;
uniform float uAneis;
varying vec2 vUv;

void main() {
  // Centraliza e corrige a proporção da tela (para o círculo não virar oval)
  vec2 p = (vUv - 0.5) * vec2(uResolucao.x / uResolucao.y, 1.0);

  float d = length(p); // distância até o centro

  // smoothstep: 0 dentro, 1 fora, com uma borda suave de largura uBorda
  float circulo = 1.0 - smoothstep(uRaio - uBorda, uRaio + uBorda, d);

  // fract + step: listras que se repetem, formando anéis
  float aneis = step(0.5, fract(d * uAneis - uTempo * 0.5));

  vec3 fundo = vec3(0.03, 0.02, 0.06);
  vec3 cor = mix(fundo, vec3(1.0, 0.17, 0.84), circulo);
  cor = mix(cor, vec3(0.13, 0.89, 1.0), aneis * (1.0 - circulo) * 0.35);
  gl_FragColor = vec4(cor, 1.0);
}`,
    uniforms: (v) => ({ uRaio: v['raio'], uBorda: v['borda'], uAneis: v['aneis'] }),
  },
  // ---------------------------------------------------------------- 4
  noise: {
    modo: '2d',
    vertex: VERTEX_TELA,
    fragment: /* glsl */ `uniform vec2 uResolucao;
uniform float uTempo;
uniform float uEscala;
uniform float uOitavas;
uniform float uVelocidade;
uniform vec3 uCor1;
uniform vec3 uCor2;
uniform vec3 uCor3;
varying vec2 vUv;

${RUIDO}

void main() {
  vec2 p = vUv * vec2(uResolucao.x / uResolucao.y, 1.0) * uEscala;
  float t = uTempo * uVelocidade;

  // Domain warping: o ruído entorta a posição do próprio ruído
  float n = fbm(p + fbm(p + t, uOitavas), uOitavas);

  vec3 cor = mix(uCor1, uCor2, smoothstep(0.2, 0.6, n));
  cor = mix(cor, uCor3, smoothstep(0.55, 0.9, n));
  gl_FragColor = vec4(cor, 1.0);
}`,
    uniforms: (v) => {
      const paletas: Record<string, string[]> = {
        kalixto: ['#07050f', '#8b5cf6', '#ff2bd6'],
        oceano: ['#020617', '#2f7bff', '#22e3ff'],
        fogo: ['#1a0500', '#ff4d00', '#ffd400'],
      };
      const [a, b, c] = paletas[String(v['paleta'])];
      return { uEscala: v['escala'], uOitavas: v['oitavas'], uVelocidade: v['vel'], uCor1: a, uCor2: b, uCor3: c };
    },
  },
  // ---------------------------------------------------------------- 5
  distortion: {
    modo: '2d',
    vertex: VERTEX_TELA,
    texturas: ['logo'],
    fragment: /* glsl */ `uniform sampler2D uTextura;
uniform vec2 uResolucao;
uniform vec2 uMouse;
uniform float uTempo;
uniform float uForca;
uniform float uFrequencia;
uniform float uVelocidade;
varying vec2 vUv;

void main() {
  float t = uTempo * uVelocidade;

  // Ondas: empurra a coordenada x conforme a altura (y) e o tempo
  vec2 uv = vUv;
  uv.x += sin(uv.y * uFrequencia + t) * uForca;
  uv.y += cos(uv.x * uFrequencia * 0.7 + t) * uForca * 0.5;

  // Ondulação de "água" em volta do mouse
  float d = distance(vUv, uMouse);
  uv += normalize(vUv - uMouse + 0.0001) * sin(d * 40.0 - uTempo * 6.0) * 0.012 * smoothstep(0.3, 0.0, d);

  // Mantém a imagem quadrada no centro do palco
  vec2 q = (uv - 0.5) * vec2(uResolucao.x / uResolucao.y, 1.0) * 1.15 + 0.5;
  vec4 imagem = texture2D(uTextura, q);
  float dentro = step(0.0, q.x) * step(q.x, 1.0) * step(0.0, q.y) * step(q.y, 1.0);

  vec3 fundo = vec3(0.03, 0.02, 0.06);
  gl_FragColor = vec4(mix(fundo, imagem.rgb, imagem.a * dentro), 1.0);
}`,
    uniforms: (v) => ({ uForca: v['forca'], uFrequencia: v['freq'], uVelocidade: v['vel'] }),
  },
  // ---------------------------------------------------------------- 6
  procedural: {
    modo: '2d',
    vertex: VERTEX_TELA,
    fragment: /* glsl */ `uniform vec2 uResolucao;
uniform float uTempo;
uniform float uPadrao; // 0 = plasma, 1 = voronoi
uniform float uEscala;
uniform float uVelocidade;
varying vec2 vUv;

vec2 aleatorio2(vec2 p) {
  return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453);
}

void main() {
  vec2 p = vUv * vec2(uResolucao.x / uResolucao.y, 1.0) * uEscala;
  float t = uTempo * uVelocidade;
  vec3 cor;

  if (uPadrao < 0.5) {
    // Plasma: soma de senos em direções diferentes
    float v = sin(p.x + t) + sin(p.y + t * 0.7) + sin(p.x + p.y + t * 1.3)
            + sin(length(p - uEscala * 0.5) * 2.0 - t);
    // Transforma o valor em cores da paleta Kalixto (roxo → magenta → ciano)
    float k = 0.5 + 0.5 * sin(v);
    cor = mix(vec3(0.55, 0.36, 0.96), vec3(1.0, 0.17, 0.84), smoothstep(0.0, 0.5, k));
    cor = mix(cor, vec3(0.13, 0.89, 1.0), smoothstep(0.5, 1.0, k));
  } else {
    // Voronoi: distância até o ponto mais próximo de uma grade de pontos que se movem
    vec2 i = floor(p);
    vec2 f = fract(p);
    float menor = 1.0;
    for (int y = -1; y <= 1; y++) {
      for (int x = -1; x <= 1; x++) {
        vec2 vizinho = vec2(float(x), float(y));
        vec2 ponto = 0.5 + 0.5 * sin(t + 6.2831 * aleatorio2(i + vizinho));
        menor = min(menor, length(vizinho + ponto - f));
      }
    }
    cor = mix(vec3(1.0, 0.17, 0.84), vec3(0.13, 0.89, 1.0), menor);
    cor *= 0.4 + 0.6 * smoothstep(0.0, 0.08, menor); // bordas escuras nas células
  }
  gl_FragColor = vec4(cor, 1.0);
}`,
    uniforms: (v) => ({ uPadrao: v['padrao'] === 'voronoi' ? 1 : 0, uEscala: v['escala'], uVelocidade: v['vel'] }),
  },
  // ---------------------------------------------------------------- 7
  transicao: {
    modo: '2d',
    vertex: VERTEX_TELA,
    texturas: ['logo', 'listras'],
    fragment: /* glsl */ `uniform sampler2D uTexturaA;
uniform sampler2D uTexturaB;
uniform vec2 uResolucao;
uniform float uProgresso; // 0 = imagem A, 1 = imagem B (animado com GSAP)
uniform float uBorda;
uniform float uEscalaRuido;
varying vec2 vUv;

${RUIDO}

void main() {
  vec2 q = (vUv - 0.5) * vec2(uResolucao.x / uResolucao.y, 1.0) * 1.15 + 0.5;
  float dentro = step(0.0, q.x) * step(q.x, 1.0) * step(0.0, q.y) * step(q.y, 1.0);
  vec3 fundo = vec3(0.03, 0.02, 0.06);
  vec4 a = texture2D(uTexturaA, q);
  vec3 corA = mix(fundo, a.rgb, a.a * dentro);
  vec3 corB = texture2D(uTexturaB, vUv).rgb;

  // Cada pixel troca de imagem num momento diferente, decidido pelo ruído
  float n = fbm(vUv * uEscalaRuido, 4.0);
  float p = uProgresso * (1.0 + uBorda * 2.0) - uBorda;
  float troca = smoothstep(p - uBorda, p + uBorda, n);

  // Brilho na fronteira da transição
  float brilho = (1.0 - abs(troca - 0.5) * 2.0) * step(0.01, uProgresso) * step(uProgresso, 0.99);
  vec3 cor = mix(corB, corA, troca) + vec3(1.0, 0.17, 0.84) * brilho * 1.5;
  gl_FragColor = vec4(cor, 1.0);
}`,
    uniforms: (v) => ({ uBorda: v['borda'], uEscalaRuido: v['escala'] }),
  },
};

/** Monta o texto do Code Viewer: shader + como os uniforms são enviados. */
function codigoShader(id: string, v: Valores, extra = ''): string {
  const s = SHADERS[id];
  const u = s.uniforms(v);
  const linhas = Object.entries(u)
    .map(([k, x]) => `    ${k}: { value: ${typeof x === 'string' && x.startsWith('#') ? `new THREE.Color("${x}")` : x} },`)
    .join('\n');
  const shader = s.modo === '3d' ? `// ----- vertex shader -----\n${s.vertex}\n\n// ----- fragment shader -----\n${s.fragment}` : `// ----- fragment shader -----\n${s.fragment}`;
  return `${shader}

// ----- JavaScript (Three.js) -----
const material = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms: {
    uTempo: { value: 0 },
${linhas}
  },
});
${extra}`;
}

const VEL = (padrao: number) =>
  ({ id: 'vel', rotulo: 'velocidade', tipo: 'range', min: 0, max: 3, passo: 0.25, unidade: 'x', padrao }) as const;

export const GLSL_DEMOS: LabDemo[] = [
  // ---------------------------------------------------------------- 1
  {
    id: 'fragment',
    topico: 'Fragment Shaders',
    titulo: 'Pintar cada pixel com código',
    nivel: 'intermediario',
    resumo: 'O primeiro shader: um gradiente animado calculado pixel a pixel.',
    explicacao: [
      'Um fragment shader é um programa que roda na placa de vídeo uma vez para CADA pixel, todos ao mesmo tempo.',
      'Ele recebe a posição do pixel (vUv, de 0 a 1) e devolve uma cor em gl_FragColor.',
      'mix(a, b, t) mistura duas cores: t = 0 dá a, t = 1 dá b. Os valores do JavaScript chegam como uniforms.',
    ],
    dica: 'Em GLSL, números com ponto são obrigatórios em floats: escreva 1.0, não 1.',
    acao: '',
    aoVivo: true,
    instrucao: 'Mude as cores e o ângulo — a placa de vídeo recalcula tudo a cada quadro.',
    presets: [
      { nome: 'Pôr do sol', valores: { corA: '#ff2bd6', corB: '#2f7bff', angulo: 90 } },
      { nome: 'Estático', valores: { vel: 0 } },
    ],
    desafio: { enunciado: 'Faça um gradiente de ciano para roxo na diagonal (45°).', meta: { corA: '#22e3ff', corB: '#8b5cf6', angulo: 45 } },
    params: [
      { id: 'corA', rotulo: 'uCorA', tipo: 'select', opcoes: CORES, padrao: '#ff2bd6' },
      { id: 'corB', rotulo: 'uCorB', tipo: 'select', opcoes: CORES, padrao: '#22e3ff' },
      { id: 'angulo', rotulo: 'uAngulo', tipo: 'range', min: 0, max: 360, passo: 15, unidade: '°', padrao: 0 },
      VEL(1),
    ],
    codigo: (v) => codigoShader('fragment', v),
  },
  // ---------------------------------------------------------------- 2
  {
    id: 'vertex',
    topico: 'Vertex Shaders',
    titulo: 'Mover os vértices de uma malha',
    nivel: 'intermediario',
    resumo: 'Uma superfície que ondula: a forma muda na placa de vídeo.',
    explicacao: [
      'O vertex shader roda uma vez para cada vértice e decide onde ele fica na tela (gl_Position).',
      'Aqui somamos duas ondas (seno e cosseno) à altura z de cada vértice de um plano com muitos vértices.',
      'O vertex shader pode passar valores para o fragment com varying — usamos a altura para colorir.',
    ],
    dica: 'Quanto mais vértices a geometria tem, mais suave fica a deformação (aqui, 96×96).',
    acao: '',
    aoVivo: true,
    instrucao: 'Ajuste as ondas. Arraste para girar a câmera.',
    presets: [
      { nome: 'Mar calmo', valores: { amp: 0.15, freq: 1.5, vel: 0.5 } },
      { nome: 'Tempestade', valores: { amp: 0.8, freq: 4, vel: 2.5 } },
    ],
    desafio: { enunciado: 'Crie ondas bem baixas (0.1) e bem apertadas (frequência 6).', meta: { amp: 0.1, freq: 6 } },
    params: [
      { id: 'amp', rotulo: 'uAmplitude', tipo: 'range', min: 0, max: 1, passo: 0.05, unidade: '', padrao: 0.35 },
      { id: 'freq', rotulo: 'uFrequencia', tipo: 'range', min: 0.5, max: 6, passo: 0.5, unidade: '', padrao: 2.5 },
      VEL(1),
    ],
    codigo: (v) =>
      codigoShader(
        'vertex',
        v,
        `\n// Muitos vértices para a onda ficar suave\nconst plano = new THREE.Mesh(new THREE.PlaneGeometry(4, 4, 96, 96), material);\nplano.rotation.x = -Math.PI / 2.5;`,
      ),
  },
  // ---------------------------------------------------------------- 3
  {
    id: 'glsl',
    topico: 'GLSL',
    titulo: 'Formas com matemática',
    nivel: 'intermediario',
    resumo: 'Desenhar um círculo e anéis só com length, smoothstep, fract e step.',
    explicacao: [
      'length(p) é a distância do pixel até o centro: comparar com um raio já desenha um círculo.',
      'smoothstep(a, b, x) vai de 0 a 1 suavemente entre a e b — é o que deixa a borda macia.',
      'fract(x) fica só com a parte depois da vírgula: repetir um padrão infinitamente é só usar fract.',
    ],
    dica: 'Pense em formas como funções de distância: o mesmo truque desenha retângulos, estrelas e texto.',
    acao: '',
    aoVivo: true,
    instrucao: 'Mude o raio, a borda e a quantidade de anéis.',
    presets: [
      { nome: 'Borda dura', valores: { borda: 0, raio: 0.3 } },
      { nome: 'Hipnose', valores: { aneis: 30, raio: 0.1 } },
    ],
    desafio: { enunciado: 'Desenhe um círculo grande (raio 0.4) com borda bem suave (0.1).', meta: { raio: 0.4, borda: 0.1 } },
    params: [
      { id: 'raio', rotulo: 'uRaio', tipo: 'range', min: 0.05, max: 0.5, passo: 0.05, unidade: '', padrao: 0.25 },
      { id: 'borda', rotulo: 'uBorda', tipo: 'range', min: 0, max: 0.2, passo: 0.01, unidade: '', padrao: 0.02 },
      { id: 'aneis', rotulo: 'uAneis', tipo: 'range', min: 2, max: 30, passo: 1, unidade: '', padrao: 10 },
    ],
    codigo: (v) => codigoShader('glsl', v),
  },
  // ---------------------------------------------------------------- 4
  {
    id: 'noise',
    topico: 'Noise',
    titulo: 'Ruído e fbm',
    nivel: 'avancado',
    resumo: 'Fumaça, nuvens e mármore a partir de números aleatórios suaves.',
    explicacao: [
      'O ruído (noise) é um aleatório "suave": pontos vizinhos têm valores parecidos.',
      'fbm soma várias camadas (oitavas) de ruído, cada uma menor e mais fraca — é isso que cria detalhe.',
      'Domain warping: usar um ruído para entortar a posição de outro dá esse aspecto de fumaça.',
    ],
    dica: 'Cada oitava a mais custa processamento; 4 a 5 costuma bastar.',
    acao: '',
    aoVivo: true,
    instrucao: 'Troque a paleta e o número de oitavas.',
    presets: [
      { nome: 'Nuvem', valores: { paleta: 'oceano', escala: 2, oitavas: 6, vel: 0.25 } },
      { nome: 'Lava', valores: { paleta: 'fogo', escala: 4, oitavas: 4, vel: 1 } },
    ],
    desafio: { enunciado: 'Deixe o ruído "liso": só 1 oitava, na paleta oceano.', meta: { oitavas: 1, paleta: 'oceano' } },
    params: [
      {
        id: 'paleta',
        rotulo: 'paleta',
        tipo: 'select',
        opcoes: [
          { valor: 'kalixto', rotulo: 'Kalixto' },
          { valor: 'oceano', rotulo: 'oceano' },
          { valor: 'fogo', rotulo: 'fogo' },
        ],
        padrao: 'kalixto',
      },
      { id: 'escala', rotulo: 'uEscala', tipo: 'range', min: 1, max: 8, passo: 0.5, unidade: '', padrao: 3 },
      { id: 'oitavas', rotulo: 'uOitavas', tipo: 'range', min: 1, max: 8, passo: 1, unidade: '', padrao: 5 },
      VEL(0.5),
    ],
    codigo: (v) => codigoShader('noise', v),
  },
  // ---------------------------------------------------------------- 5
  {
    id: 'distortion',
    topico: 'Distortion',
    titulo: 'Distorcer uma imagem',
    nivel: 'avancado',
    resumo: 'Ondular a logo e criar ondas de água em volta do mouse.',
    explicacao: [
      'Distorcer é mudar ONDE a textura é lida: deslocamos a coordenada uv antes de chamar texture2D.',
      'Somar sin(y) ao x faz as linhas verticais ondularem; o tempo faz a onda andar.',
      'A distância até o mouse controla uma segunda onda circular, como uma pedra caindo na água.',
    ],
    dica: 'Distorções pequenas (0.01 a 0.03) já chamam atenção — exagerar deixa a imagem ilegível.',
    acao: '',
    aoVivo: true,
    instrucao: 'Passe o mouse (ou o dedo) sobre a imagem.',
    presets: [
      { nome: 'Calor', valores: { forca: 0.01, freq: 30, vel: 3 } },
      { nome: 'Bandeira', valores: { forca: 0.04, freq: 6, vel: 1.5 } },
    ],
    desafio: { enunciado: 'Desligue as ondas (força 0) e deixe só o efeito do mouse.', meta: { forca: 0 } },
    params: [
      { id: 'forca', rotulo: 'uForca', tipo: 'range', min: 0, max: 0.06, passo: 0.005, unidade: '', padrao: 0.02 },
      { id: 'freq', rotulo: 'uFrequencia', tipo: 'range', min: 2, max: 40, passo: 2, unidade: '', padrao: 12 },
      VEL(1.5),
    ],
    codigo: (v) =>
      codigoShader(
        'distortion',
        v,
        `\n// A textura e o mouse também são uniforms\nmaterial.uniforms.uTextura = { value: new THREE.TextureLoader().load("logo.webp") };\ncanvas.addEventListener("pointermove", (e) => {\n  const r = canvas.getBoundingClientRect();\n  material.uniforms.uMouse.value.set((e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height);\n});`,
      ),
  },
  // ---------------------------------------------------------------- 6
  {
    id: 'procedural',
    topico: 'Efeitos procedurais',
    titulo: 'Plasma e Voronoi',
    nivel: 'avancado',
    resumo: 'Padrões infinitos gerados só com matemática, sem nenhuma imagem.',
    explicacao: [
      'Procedural = gerado por regras, não desenhado à mão. Muda a escala e o padrão continua perfeito.',
      'O plasma soma senos em várias direções e transforma o resultado em cor com smoothstep e mix.',
      'O Voronoi divide o espaço em células: cada pixel mede a distância até o ponto mais próximo.',
    ],
    dica: 'Padrões procedurais pesam quase nada para baixar — só o código.',
    acao: '',
    aoVivo: true,
    instrucao: 'Troque entre plasma e Voronoi e mude a escala.',
    presets: [
      { nome: 'Células grandes', valores: { padrao: 'voronoi', escala: 3 } },
      { nome: 'Plasma lento', valores: { padrao: 'plasma', vel: 0.25, escala: 4 } },
    ],
    desafio: { enunciado: 'Mostre um Voronoi com muitas células (escala 12).', meta: { padrao: 'voronoi', escala: 12 } },
    params: [
      {
        id: 'padrao',
        rotulo: 'uPadrao',
        tipo: 'select',
        opcoes: [
          { valor: 'plasma', rotulo: 'plasma' },
          { valor: 'voronoi', rotulo: 'Voronoi' },
        ],
        padrao: 'plasma',
      },
      { id: 'escala', rotulo: 'uEscala', tipo: 'range', min: 2, max: 14, passo: 1, unidade: '', padrao: 6 },
      VEL(1),
    ],
    codigo: (v) => codigoShader('procedural', v),
  },
  // ---------------------------------------------------------------- 7
  {
    id: 'transicao',
    topico: 'Transições com shaders',
    titulo: 'Trocar de imagem com ruído',
    nivel: 'avancado',
    resumo: 'Uma transição em que cada pixel muda de imagem num momento diferente.',
    explicacao: [
      'O shader recebe duas texturas e um uProgresso de 0 a 1.',
      'Um ruído decide em que ponto do progresso cada pixel troca de imagem — por isso a fronteira fica orgânica.',
      'O GSAP anima uProgresso como qualquer outro número; integração Three.js + GSAP + GLSL.',
    ],
    dica: 'Esse é o efeito usado em sites premiados para trocar de página ou de projeto.',
    acao: 'Trocar imagem',
    instrucao: 'Ajuste a borda e o tamanho do ruído e clique em “Trocar imagem”.',
    presets: [
      { nome: 'Borda nítida', valores: { borda: 0.02, escala: 8 } },
      { nome: 'Dissolver', valores: { borda: 0.2, escala: 24 } },
    ],
    desafio: { enunciado: 'Faça uma transição lenta (2.5 s) com ruído grande (escala 2).', meta: { dur: 2.5, escala: 2 } },
    params: [
      { id: 'borda', rotulo: 'uBorda', tipo: 'range', min: 0.02, max: 0.3, passo: 0.02, unidade: '', padrao: 0.1 },
      { id: 'escala', rotulo: 'uEscalaRuido', tipo: 'range', min: 2, max: 24, passo: 2, unidade: '', padrao: 6 },
      { id: 'dur', rotulo: 'duração (GSAP)', tipo: 'range', min: 0.5, max: 3, passo: 0.5, unidade: 's', padrao: 1.5 },
    ],
    codigo: (v) =>
      codigoShader(
        'transicao',
        v,
        `\n// O GSAP anima o uniform de 0 a 1 (ou de volta)\ngsap.to(material.uniforms.uProgresso, {\n  value: material.uniforms.uProgresso.value > 0.5 ? 0 : 1,\n  duration: ${v['dur']},\n  ease: "power2.inOut",\n});`,
      ),
  },
];
