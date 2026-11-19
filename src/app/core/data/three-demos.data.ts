import { LabDemo } from '../models/demo.model';

/**
 * Demonstrações do Laboratório 05 — Three.js Lab.
 * As cenas de verdade ficam em pages/three-lab/cenas-3d.ts.
 * Em todas dá para girar a câmera arrastando com o mouse ou o dedo.
 */

const CORES = [
  { valor: '#ff2bd6', rotulo: 'magenta' },
  { valor: '#8b5cf6', rotulo: 'roxo' },
  { valor: '#2f7bff', rotulo: 'azul' },
  { valor: '#22e3ff', rotulo: 'ciano' },
  { valor: '#f5f3ff', rotulo: 'branco' },
];

const ORBITA = 'Arraste para girar a câmera e use a roda (ou pinça) para aproximar.';

export const THREE_DEMOS: LabDemo[] = [
  // ---------------------------------------------------------------- 1
  {
    id: 'geometria',
    topico: 'Objetos geométricos',
    titulo: 'Cena, câmera, renderizador e um objeto',
    nivel: 'iniciante',
    resumo: 'O "olá mundo" do 3D: uma forma girando no centro da cena.',
    explicacao: [
      'Toda cena Three.js tem três peças: Scene (onde ficam os objetos), Camera (o ponto de vista) e Renderer (quem desenha no <canvas>).',
      'Um objeto visível é um Mesh: geometria (a forma) + material (a aparência).',
      'A cada quadro, mudamos a rotação e mandamos o renderizador desenhar de novo.',
    ],
    dica: 'O modo wireframe mostra os triângulos da geometria — ótimo para entender o que a GPU desenha.',
    acao: 'Dar um giro',
    instrucao: `Troque a forma e a velocidade. ${ORBITA}`,
    presets: [
      { nome: 'Esqueleto', valores: { forma: 'icosaedro', wireframe: 'true', vel: 0.5 } },
      { nome: 'Nó rápido', valores: { forma: 'no', wireframe: 'false', vel: 2 } },
    ],
    desafio: {
      enunciado: 'Mostre um toro em wireframe parado (velocidade 0).',
      meta: { forma: 'toro', wireframe: 'true', vel: 0 },
    },
    params: [
      {
        id: 'forma',
        rotulo: 'Geometria',
        tipo: 'select',
        opcoes: [
          { valor: 'cubo', rotulo: 'BoxGeometry (cubo)' },
          { valor: 'esfera', rotulo: 'SphereGeometry' },
          { valor: 'toro', rotulo: 'TorusGeometry' },
          { valor: 'no', rotulo: 'TorusKnotGeometry (nó)' },
          { valor: 'icosaedro', rotulo: 'IcosahedronGeometry' },
          { valor: 'cone', rotulo: 'ConeGeometry' },
        ],
        padrao: 'cubo',
      },
      {
        id: 'wireframe',
        rotulo: 'wireframe',
        tipo: 'select',
        opcoes: [
          { valor: 'false', rotulo: 'false (sólido)' },
          { valor: 'true', rotulo: 'true (só as arestas)' },
        ],
        padrao: 'false',
      },
      {
        id: 'vel',
        rotulo: 'velocidade de giro',
        tipo: 'range',
        min: 0,
        max: 3,
        passo: 0.25,
        unidade: 'x',
        padrao: 1,
      },
    ],
    codigo: (v) => {
      const geo: Record<string, string> = {
        cubo: 'BoxGeometry(1.6, 1.6, 1.6)',
        esfera: 'SphereGeometry(1.1, 48, 32)',
        toro: 'TorusGeometry(1, 0.38, 24, 96)',
        no: 'TorusKnotGeometry(0.8, 0.28, 160, 24)',
        icosaedro: 'IcosahedronGeometry(1.2, 0)',
        cone: 'ConeGeometry(1, 1.8, 48)',
      };
      return `import * as THREE from "three";

const cena = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, largura / altura, 0.1, 100);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(largura, altura);
container.append(renderer.domElement);

const forma = new THREE.Mesh(
  new THREE.${geo[String(v['forma'])]},
  new THREE.MeshStandardMaterial({ color: "#8b5cf6", wireframe: ${v['wireframe']} })
);
cena.add(forma, new THREE.AmbientLight("#ffffff", 0.6));

renderer.setAnimationLoop(() => {
  forma.rotation.y += 0.01 * ${v['vel']};
  renderer.render(cena, camera);
});`;
    },
  },
  // ---------------------------------------------------------------- 2
  {
    id: 'camera',
    topico: 'Câmeras',
    titulo: 'Campo de visão e distância',
    nivel: 'iniciante',
    resumo: 'Como a câmera muda a sensação de profundidade.',
    explicacao: [
      'A PerspectiveCamera imita um olho: objetos longe parecem menores.',
      'fov (field of view) é o ângulo de visão em graus: pequeno = teleobjetiva (achatado), grande = grande-angular (distorcido).',
      'OrbitControls deixa o usuário girar a câmera em volta de um ponto arrastando o mouse.',
    ],
    dica: 'Valores de fov entre 40 e 60 parecem naturais; acima de 90 a imagem distorce nas bordas.',
    acao: 'Voar ao redor',
    instrucao: `Mude o fov e a distância; "Voar ao redor" dá uma volta com a câmera. ${ORBITA}`,
    presets: [
      { nome: 'Teleobjetiva', valores: { fov: 20, dist: 12 } },
      { nome: 'Olho de peixe', valores: { fov: 110, dist: 3 } },
    ],
    desafio: {
      enunciado: 'Monte uma grande-angular: fov 90 e câmera a 4 unidades.',
      meta: { fov: 90, dist: 4 },
    },
    params: [
      {
        id: 'fov',
        rotulo: 'fov',
        tipo: 'range',
        min: 20,
        max: 110,
        passo: 5,
        unidade: '°',
        padrao: 50,
      },
      {
        id: 'dist',
        rotulo: 'distância',
        tipo: 'range',
        min: 3,
        max: 12,
        passo: 0.5,
        unidade: '',
        padrao: 7,
      },
      {
        id: 'alt',
        rotulo: 'altura',
        tipo: 'range',
        min: 0,
        max: 6,
        passo: 0.5,
        unidade: '',
        padrao: 2.5,
      },
    ],
    codigo: (
      v,
    ) => `const camera = new THREE.PerspectiveCamera(${v['fov']}, largura / altura, 0.1, 100);
camera.position.set(0, ${v['alt']}, ${v['dist']});
camera.lookAt(0, 0, 0);

// Girar a câmera com o mouse
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
const controles = new OrbitControls(camera, renderer.domElement);
controles.enableDamping = true; // movimento com inércia

// Voar ao redor com GSAP
const angulo = { a: 0 };
gsap.to(angulo, {
  a: Math.PI * 2,
  duration: 3,
  onUpdate: () => {
    camera.position.x = Math.sin(angulo.a) * ${v['dist']};
    camera.position.z = Math.cos(angulo.a) * ${v['dist']};
    camera.lookAt(0, 0, 0);
  },
});`,
  },
  // ---------------------------------------------------------------- 3
  {
    id: 'iluminacao',
    topico: 'Iluminação',
    titulo: 'Luz ambiente, direcional e pontual',
    nivel: 'intermediario',
    resumo: 'Três tipos de luz e o que cada uma faz na cena.',
    explicacao: [
      'AmbientLight ilumina tudo por igual, sem sombra nem direção — evita que as partes escuras fiquem pretas.',
      'DirectionalLight imita o sol: raios paralelos vindos de uma direção.',
      'PointLight é uma lâmpada: ilumina em todas as direções e enfraquece com a distância.',
    ],
    dica: 'Comece com uma ambiente fraca + uma direcional forte; acrescente pontuais coloridas para dar clima.',
    acao: 'Mover a lâmpada',
    instrucao: `Ajuste as intensidades. A bolinha colorida é a luz pontual. ${ORBITA}`,
    presets: [
      { nome: 'Noite neon', valores: { ambiente: 0.1, direcional: 0, ponto: 3, cor: '#ff2bd6' } },
      { nome: 'Dia claro', valores: { ambiente: 0.8, direcional: 2.5, ponto: 0 } },
    ],
    desafio: {
      enunciado: 'Ilumine a cena só com a lâmpada ciano (ambiente e direcional em 0).',
      meta: { ambiente: 0, direcional: 0, cor: '#22e3ff' },
    },
    params: [
      {
        id: 'ambiente',
        rotulo: 'AmbientLight',
        tipo: 'range',
        min: 0,
        max: 1.5,
        passo: 0.1,
        unidade: '',
        padrao: 0.3,
      },
      {
        id: 'direcional',
        rotulo: 'DirectionalLight',
        tipo: 'range',
        min: 0,
        max: 3,
        passo: 0.25,
        unidade: '',
        padrao: 1.5,
      },
      {
        id: 'ponto',
        rotulo: 'PointLight',
        tipo: 'range',
        min: 0,
        max: 5,
        passo: 0.25,
        unidade: '',
        padrao: 2,
      },
      { id: 'cor', rotulo: 'cor da PointLight', tipo: 'select', opcoes: CORES, padrao: '#ff2bd6' },
    ],
    codigo: (v) => `const ambiente = new THREE.AmbientLight("#ffffff", ${v['ambiente']});

const sol = new THREE.DirectionalLight("#ffffff", ${v['direcional']});
sol.position.set(3, 5, 2);

const lampada = new THREE.PointLight("${v['cor']}", ${v['ponto']}, 10);
lampada.position.set(-1.5, 1.5, 1.5);

cena.add(ambiente, sol, lampada);`,
  },
  // ---------------------------------------------------------------- 4
  {
    id: 'materiais',
    topico: 'Materiais',
    titulo: 'Como a superfície reage à luz',
    nivel: 'intermediario',
    resumo: 'Comparar os materiais mais usados do Three.js.',
    explicacao: [
      'MeshBasicMaterial ignora a luz (cor chapada). MeshLambertMaterial é fosco e barato.',
      'MeshPhongMaterial tem brilho especular. MeshStandardMaterial é PBR: usa metalness e roughness como materiais reais.',
      'MeshNormalMaterial pinta cada face pela direção para onde aponta — útil para depurar.',
    ],
    dica: 'Para aparência realista, use MeshStandardMaterial e varie roughness: 0 é espelho, 1 é borracha.',
    acao: 'Girar',
    instrucao: `Troque o material e mexa em metalness/roughness (valem para o Standard). ${ORBITA}`,
    presets: [
      { nome: 'Cromado', valores: { tipo: 'standard', metal: 1, rugosidade: 0.1, cor: '#f5f3ff' } },
      {
        nome: 'Plástico',
        valores: { tipo: 'standard', metal: 0, rugosidade: 0.6, cor: '#ff2bd6' },
      },
    ],
    desafio: {
      enunciado: 'Faça um metal azul fosco: Standard, metalness 1 e roughness 0.7.',
      meta: { tipo: 'standard', metal: 1, rugosidade: 0.7, cor: '#2f7bff' },
    },
    params: [
      {
        id: 'tipo',
        rotulo: 'Material',
        tipo: 'select',
        opcoes: [
          { valor: 'standard', rotulo: 'MeshStandardMaterial (PBR)' },
          { valor: 'phong', rotulo: 'MeshPhongMaterial' },
          { valor: 'lambert', rotulo: 'MeshLambertMaterial' },
          { valor: 'basic', rotulo: 'MeshBasicMaterial' },
          { valor: 'normal', rotulo: 'MeshNormalMaterial' },
        ],
        padrao: 'standard',
      },
      {
        id: 'metal',
        rotulo: 'metalness',
        tipo: 'range',
        min: 0,
        max: 1,
        passo: 0.1,
        unidade: '',
        padrao: 0.3,
      },
      {
        id: 'rugosidade',
        rotulo: 'roughness',
        tipo: 'range',
        min: 0,
        max: 1,
        passo: 0.1,
        unidade: '',
        padrao: 0.4,
      },
      { id: 'cor', rotulo: 'color', tipo: 'select', opcoes: CORES, padrao: '#8b5cf6' },
    ],
    codigo: (v) => {
      const nomes: Record<string, string> = {
        standard: `MeshStandardMaterial({\n  color: "${v['cor']}",\n  metalness: ${v['metal']},\n  roughness: ${v['rugosidade']},\n})`,
        phong: `MeshPhongMaterial({ color: "${v['cor']}", shininess: 80 })`,
        lambert: `MeshLambertMaterial({ color: "${v['cor']}" })`,
        basic: `MeshBasicMaterial({ color: "${v['cor']}" })`,
        normal: `MeshNormalMaterial()`,
      };
      return `const material = new THREE.${nomes[String(v['tipo'])]};

const esfera = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 32), material);
cena.add(esfera);`;
    },
  },
  // ---------------------------------------------------------------- 5
  {
    id: 'texturas',
    topico: 'Texturas',
    titulo: 'Imagens na superfície',
    nivel: 'intermediario',
    resumo: 'Aplicar uma imagem (ou um desenho feito em código) num objeto 3D.',
    explicacao: [
      'Uma textura é uma imagem "embrulhada" na geometria seguindo as coordenadas UV.',
      'CanvasTexture transforma um desenho feito num <canvas> em textura; TextureLoader carrega um arquivo de imagem.',
      'repeat define quantas vezes a imagem se repete; animando offset, a textura "anda" pela superfície.',
    ],
    dica: 'Para repetir, defina wrapS e wrapT como RepeatWrapping — senão a borda da imagem é esticada.',
    acao: 'Rolar textura',
    instrucao: `Escolha o padrão e a repetição. ${ORBITA}`,
    presets: [
      { nome: 'Tabuleiro', valores: { padrao: 'xadrez', repeticao: 4 } },
      { nome: 'Logo única', valores: { padrao: 'logo', repeticao: 1 } },
    ],
    desafio: {
      enunciado: 'Cubra o cubo com listras repetidas 6 vezes.',
      meta: { padrao: 'listras', repeticao: 6 },
    },
    params: [
      {
        id: 'padrao',
        rotulo: 'Textura',
        tipo: 'select',
        opcoes: [
          { valor: 'logo', rotulo: 'logo Kalixto (arquivo)' },
          { valor: 'xadrez', rotulo: 'xadrez (canvas)' },
          { valor: 'listras', rotulo: 'listras (canvas)' },
          { valor: 'gradiente', rotulo: 'gradiente (canvas)' },
        ],
        padrao: 'logo',
      },
      {
        id: 'repeticao',
        rotulo: 'repeat',
        tipo: 'range',
        min: 1,
        max: 8,
        passo: 1,
        unidade: 'x',
        padrao: 1,
      },
    ],
    codigo: (v) =>
      v['padrao'] === 'logo'
        ? `const textura = new THREE.TextureLoader().load("brand/kalixto-logo-512.webp");
textura.colorSpace = THREE.SRGBColorSpace;
textura.wrapS = textura.wrapT = THREE.RepeatWrapping;
textura.repeat.set(${v['repeticao']}, ${v['repeticao']});

const cubo = new THREE.Mesh(
  new THREE.BoxGeometry(2, 2, 2),
  new THREE.MeshStandardMaterial({ map: textura })
);

// "Rolar textura"
gsap.to(textura.offset, { x: 1, duration: 2, ease: "none" });`
        : `// Desenha o padrão num canvas…
const canvas = document.createElement("canvas");
canvas.width = canvas.height = 256;
const ctx = canvas.getContext("2d");
desenhar${String(v['padrao']).replace(/^./, (c) => c.toUpperCase())}(ctx); // ${v['padrao']}

// …e usa o canvas como textura
const textura = new THREE.CanvasTexture(canvas);
textura.wrapS = textura.wrapT = THREE.RepeatWrapping;
textura.repeat.set(${v['repeticao']}, ${v['repeticao']});

const cubo = new THREE.Mesh(
  new THREE.BoxGeometry(2, 2, 2),
  new THREE.MeshStandardMaterial({ map: textura })
);`,
  },
  // ---------------------------------------------------------------- 6
  {
    id: 'animacao',
    topico: 'Animações 3D',
    titulo: 'GSAP animando objetos 3D',
    nivel: 'intermediario',
    resumo: 'Pulo com "squash and stretch", usando uma timeline do GSAP.',
    explicacao: [
      'O GSAP anima qualquer número — inclusive mesh.position.y e mesh.scale de objetos do Three.js.',
      'Squash and stretch (achatar e esticar) é um princípio clássico de animação: dá peso e elasticidade.',
      'A timeline organiza as etapas: agachar, saltar esticado, girar no ar e cair achatando.',
    ],
    dica: 'Anime position, rotation e scale com o GSAP; o laço do Three.js só precisa desenhar.',
    acao: 'Pular',
    instrucao: `Ajuste a altura e a duração e clique em “Pular”. ${ORBITA}`,
    presets: [
      { nome: 'Pulo baixo', valores: { altura: 1, dur: 0.6, giro: 'nao' } },
      { nome: 'Mortal', valores: { altura: 3, dur: 1.4, giro: 'sim' } },
    ],
    desafio: {
      enunciado: 'Faça um pulo de altura 2,5 com giro, em 1 s.',
      meta: { altura: 2.5, giro: 'sim', dur: 1 },
    },
    params: [
      {
        id: 'altura',
        rotulo: 'altura do pulo',
        tipo: 'range',
        min: 0.5,
        max: 3,
        passo: 0.25,
        unidade: '',
        padrao: 1.75,
      },
      {
        id: 'dur',
        rotulo: 'duração total',
        tipo: 'range',
        min: 0.4,
        max: 2,
        passo: 0.1,
        unidade: 's',
        padrao: 0.9,
      },
      {
        id: 'giro',
        rotulo: 'giro no ar',
        tipo: 'select',
        opcoes: [
          { valor: 'nao', rotulo: 'não' },
          { valor: 'sim', rotulo: 'sim (360°)' },
        ],
        padrao: 'nao',
      },
    ],
    codigo: (v) => {
      const d = Number(v['dur']);
      const giro =
        v['giro'] === 'sim'
          ? `\n  .to(cubo.rotation, { y: "+=" + Math.PI * 2, duration: ${(d * 0.6).toFixed(2)} }, "<")`
          : '';
      return `const tl = gsap.timeline();

tl.to(cubo.scale, { x: 1.25, y: 0.7, z: 1.25, duration: ${(d * 0.15).toFixed(2)} })      // agacha
  .to(cubo.position, { y: ${v['altura']}, duration: ${(d * 0.35).toFixed(2)}, ease: "power2.out" })
  .to(cubo.scale, { x: 0.85, y: 1.25, z: 0.85, duration: ${(d * 0.2).toFixed(2)} }, "<")${giro}
  .to(cubo.position, { y: 0, duration: ${(d * 0.35).toFixed(2)}, ease: "power2.in" })
  .to(cubo.scale, { x: 1.3, y: 0.65, z: 1.3, duration: ${(d * 0.08).toFixed(2)} })       // cai achatado
  .to(cubo.scale, { x: 1, y: 1, z: 1, duration: ${(d * 0.25).toFixed(2)}, ease: "elastic.out(1, 0.4)" });`;
    },
  },
  // ---------------------------------------------------------------- 7
  {
    id: 'mouse',
    topico: 'Interação por mouse',
    titulo: 'Objeto que segue o ponteiro',
    nivel: 'intermediario',
    resumo: 'Inclinar o objeto na direção do mouse com movimento suave.',
    explicacao: [
      'Convertemos a posição do mouse para valores entre -1 e 1 (centro = 0).',
      'Em vez de pular direto para o alvo, o objeto anda uma fração do caminho a cada quadro (lerp) — isso cria a suavidade.',
      'Quanto menor a suavidade, mais "pesado" e lento o objeto parece.',
    ],
    dica: 'Esse mesmo truque de lerp serve para cursores personalizados e câmeras que seguem o usuário.',
    acao: '',
    aoVivo: true,
    instrucao: 'Passe o mouse (ou o dedo) sobre o palco — o resultado é ao vivo.',
    presets: [
      { nome: 'Pesado', valores: { intensidade: 0.4, suavidade: 0.02 } },
      { nome: 'Nervoso', valores: { intensidade: 1.2, suavidade: 0.3 } },
    ],
    desafio: {
      enunciado: 'Deixe o objeto bem lento: suavidade 0.04 e intensidade 0.8.',
      meta: { suavidade: 0.04, intensidade: 0.8 },
    },
    params: [
      {
        id: 'intensidade',
        rotulo: 'intensidade da inclinação',
        tipo: 'range',
        min: 0.2,
        max: 1.2,
        passo: 0.1,
        unidade: '',
        padrao: 0.6,
      },
      {
        id: 'suavidade',
        rotulo: 'suavidade (lerp)',
        tipo: 'range',
        min: 0.02,
        max: 0.3,
        passo: 0.02,
        unidade: '',
        padrao: 0.08,
      },
    ],
    codigo: (v) => `const mouse = { x: 0, y: 0 };

canvas.addEventListener("pointermove", (e) => {
  const r = canvas.getBoundingClientRect();
  mouse.x = ((e.clientX - r.left) / r.width) * 2 - 1;   // -1 a 1
  mouse.y = ((e.clientY - r.top) / r.height) * 2 - 1;
});

renderer.setAnimationLoop(() => {
  const alvoY = mouse.x * ${v['intensidade']};
  const alvoX = mouse.y * ${v['intensidade']};
  // lerp: anda ${v['suavidade']} do caminho a cada quadro
  forma.rotation.y += (alvoY - forma.rotation.y) * ${v['suavidade']};
  forma.rotation.x += (alvoX - forma.rotation.x) * ${v['suavidade']};
  renderer.render(cena, camera);
});`,
  },
  // ---------------------------------------------------------------- 8
  {
    id: 'raycasting',
    topico: 'Raycasting',
    titulo: 'Descobrir em qual objeto o mouse está',
    nivel: 'avancado',
    resumo: 'Destacar o cubo sob o mouse e reagir ao clique.',
    explicacao: [
      'O Raycaster lança um raio invisível da câmera, passando pela posição do mouse.',
      'intersectObjects() devolve a lista de objetos atravessados, do mais perto ao mais longe.',
      'Com o primeiro da lista dá para mudar cor, tamanho ou abrir uma informação.',
    ],
    dica: 'Teste o raio só contra os objetos clicáveis (não a cena toda): fica bem mais rápido.',
    acao: '',
    aoVivo: true,
    instrucao: 'Passe o mouse sobre os cubos e clique — no celular, toque.',
    presets: [{ nome: 'Destaque forte', valores: { cor: '#22e3ff', escala: 1.5 } }],
    desafio: {
      enunciado: 'Configure o destaque em branco e 1,6x de tamanho.',
      meta: { cor: '#f5f3ff', escala: 1.6 },
    },
    params: [
      { id: 'cor', rotulo: 'cor do destaque', tipo: 'select', opcoes: CORES, padrao: '#ff2bd6' },
      {
        id: 'escala',
        rotulo: 'escala do destaque',
        tipo: 'range',
        min: 1,
        max: 1.8,
        passo: 0.1,
        unidade: 'x',
        padrao: 1.3,
      },
    ],
    codigo: (v) => `const raycaster = new THREE.Raycaster();
const ponteiro = new THREE.Vector2();

canvas.addEventListener("pointermove", (e) => {
  const r = canvas.getBoundingClientRect();
  ponteiro.x = ((e.clientX - r.left) / r.width) * 2 - 1;
  ponteiro.y = -((e.clientY - r.top) / r.height) * 2 + 1; // y invertido

  raycaster.setFromCamera(ponteiro, camera);
  const [acerto] = raycaster.intersectObjects(cubos);

  cubos.forEach((c) => c.material.color.set("#2a2050"));
  if (acerto) {
    acerto.object.material.color.set("${v['cor']}");
    gsap.to(acerto.object.scale, { x: ${v['escala']}, y: ${v['escala']}, z: ${v['escala']}, duration: 0.3 });
  }
});`,
  },
  // ---------------------------------------------------------------- 9
  {
    id: 'gltf',
    topico: 'Modelos GLTF/GLB',
    titulo: 'Importar um modelo 3D',
    nivel: 'avancado',
    resumo: 'Carregar um arquivo .glb feito em outro programa (Blender, por exemplo).',
    explicacao: [
      'GLTF é o "JPEG do 3D": um formato leve que guarda geometria, materiais e animações. O .glb é a versão em um arquivo só.',
      'O GLTFLoader carrega o arquivo e entrega gltf.scene, que você adiciona na cena como qualquer objeto.',
      'O troféu Kalixto daqui foi gerado com código (scripts/gerar-modelo.mjs). Você também pode carregar um .glb seu — ele não sai do seu computador.',
    ],
    dica: 'Modelos grandes devem ser comprimidos (Draco ou Meshopt) antes de ir para a web.',
    acao: 'Entrada animada',
    instrucao: `Ajuste escala e giro, ou carregue seu próprio .glb. ${ORBITA}`,
    presets: [{ nome: 'Vitrine', valores: { escala: 1.2, giro: 0.5 } }],
    desafio: {
      enunciado: 'Deixe o modelo parado (giro 0) e com escala 1.5.',
      meta: { giro: 0, escala: 1.5 },
    },
    params: [
      {
        id: 'escala',
        rotulo: 'escala',
        tipo: 'range',
        min: 0.5,
        max: 2,
        passo: 0.1,
        unidade: 'x',
        padrao: 1,
      },
      {
        id: 'giro',
        rotulo: 'giro automático',
        tipo: 'range',
        min: 0,
        max: 3,
        passo: 0.25,
        unidade: 'x',
        padrao: 1,
      },
    ],
    codigo: (v) => `import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const loader = new GLTFLoader();
loader.load("models/kalixto-trofeu.glb", (gltf) => {
  const modelo = gltf.scene;
  modelo.scale.setScalar(${v['escala']});
  cena.add(modelo);

  // Entrada animada
  gsap.from(modelo.position, { y: -3, duration: 1.2, ease: "back.out(1.6)" });
  gsap.from(modelo.rotation, { y: -Math.PI, duration: 1.2 });
});

renderer.setAnimationLoop((t) => {
  modelo.rotation.y += 0.005 * ${v['giro']};
  renderer.render(cena, camera);
});`,
  },
];
