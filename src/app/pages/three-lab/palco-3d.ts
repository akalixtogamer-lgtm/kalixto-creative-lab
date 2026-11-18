import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/**
 * Palco 3D reutilizável (Three.js Lab e WebGL & GLSL).
 *
 * Cuida do que toda cena precisa: renderizador, câmera, ajuste de tamanho,
 * laço de animação, pausa quando a aba ou o palco não estão visíveis e
 * limpeza completa da memória da placa de vídeo ao sair.
 */
export interface Palco3D {
  readonly renderer: THREE.WebGLRenderer;
  readonly cena: THREE.Scene;
  readonly camera: THREE.PerspectiveCamera;
  readonly controles: OrbitControls;
  readonly relogio: THREE.Timer;
  readonly canvas: HTMLCanvasElement;
  /** Função chamada a cada quadro (delta = segundos desde o último). */
  aCadaQuadro(fn: ((delta: number, tempo: number) => void) | null): void;
  /** Remove todos os objetos da cena, liberando geometrias e materiais. */
  limparCena(): void;
  /** Volta câmera e controles para a posição inicial. */
  resetarCamera(): void;
  destruir(): void;
}

/** O navegador consegue usar WebGL? */
export function temWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

export function criarPalco3D(container: HTMLElement): Palco3D {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  // Limita a densidade de pixels: telas 3x pesam muito em celulares
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  const canvas = renderer.domElement;
  canvas.className = 'palco3d__canvas';
  container.append(canvas);

  const cena = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.set(0, 1.2, 5);

  const controles = new OrbitControls(camera, canvas);
  controles.enableDamping = true;
  controles.enablePan = false;
  controles.minDistance = 2;
  controles.maxDistance = 14;
  controles.saveState();

  const relogio = new THREE.Timer();
  let quadro: ((delta: number, tempo: number) => void) | null = null;
  let visivel = true;
  let rodando = true;

  const ajustar = () => {
    const w = container.clientWidth || 300;
    const h = container.clientHeight || 300;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(ajustar);
  ro.observe(container);
  ajustar();

  // Pausa o laço quando o palco sai da tela (economiza bateria)
  const io =
    'IntersectionObserver' in window
      ? new IntersectionObserver(([e]) => (visivel = e.isIntersecting))
      : undefined;
  io?.observe(container);

  renderer.setAnimationLoop((agora: number) => {
    relogio.update(agora);
    // Parado (aba escondida ou palco fora da tela): não desenha
    if (!rodando || !visivel || document.hidden) return;
    const delta = Math.min(relogio.getDelta(), 0.1); // evita saltos depois de pausas
    quadro?.(delta, relogio.getElapsed());
    controles.update();
    renderer.render(cena, camera);
  });

  const liberar = (obj: THREE.Object3D) => {
    obj.traverse((o) => {
      const m = o as THREE.Mesh;
      m.geometry?.dispose();
      const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
      for (const mat of mats) {
        for (const v of Object.values(mat)) if (v instanceof THREE.Texture) v.dispose();
        mat.dispose();
      }
    });
  };

  return {
    renderer,
    cena,
    camera,
    controles,
    relogio,
    canvas,
    aCadaQuadro: (fn) => (quadro = fn),
    limparCena: () => {
      for (const filho of [...cena.children]) {
        liberar(filho);
        cena.remove(filho);
      }
      cena.background = null;
      cena.fog = null;
    },
    resetarCamera: () => {
      controles.reset();
      controles.enabled = true;
      controles.enableRotate = true;
      camera.fov = 50;
      camera.updateProjectionMatrix();
    },
    destruir: () => {
      rodando = false;
      renderer.setAnimationLoop(null);
      relogio.dispose();
      ro.disconnect();
      io?.disconnect();
      controles.dispose();
      liberar(cena);
      renderer.dispose();
      canvas.remove();
    },
  };
}
