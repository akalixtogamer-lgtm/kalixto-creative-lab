import { gsap } from 'gsap';
import * as THREE from 'three';
import { ShaderDemo } from '../../core/data/glsl-demos.data';
import { Valores } from '../../core/models/demo.model';
import { Palco3D } from '../three-lab/palco-3d';

/**
 * Monta uma demo de shader no palco 3D e devolve como controlá-la.
 * '2d': retângulo de tela cheia (o vertex shader ignora a câmera).
 * '3d': plano com muitos vértices, visto pela câmera com órbita.
 */
export interface CenaShader {
  atualizar(v: Valores): void;
  /** Só na transição: anima uProgresso entre 0 e 1 com o GSAP. */
  alternar(duracao: number): void;
  destruir(): void;
}

function texturaListras(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const g = c.getContext('2d')!;
  const grad = g.createLinearGradient(0, 0, 512, 512);
  grad.addColorStop(0, '#2f7bff');
  grad.addColorStop(1, '#22e3ff');
  g.fillStyle = grad;
  g.fillRect(0, 0, 512, 512);
  g.fillStyle = 'rgba(7,5,15,0.35)';
  for (let i = -512; i < 1024; i += 48) {
    g.beginPath();
    g.moveTo(i, 0);
    g.lineTo(i + 24, 0);
    g.lineTo(i + 24 + 512, 512);
    g.lineTo(i + 512, 512);
    g.fill();
  }
  g.fillStyle = '#07050f';
  g.font = '700 72px sans-serif';
  g.textAlign = 'center';
  g.fillText('CREATIVE', 256, 240);
  g.fillText('LAB', 256, 320);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Converte valores dos controles em uniforms do Three.js. */
function paraUniform(valor: number | string): THREE.IUniform {
  if (typeof valor === 'string' && valor.startsWith('#')) return { value: new THREE.Color(valor) };
  return { value: Number(valor) };
}

export function montarShader(p: Palco3D, def: ShaderDemo, v: Valores): CenaShader {
  const uniforms: Record<string, THREE.IUniform> = {
    uTempo: { value: 0 },
    uResolucao: { value: new THREE.Vector2(1, 1) },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uProgresso: { value: 0 },
  };
  for (const [k, x] of Object.entries(def.uniforms(v))) uniforms[k] = paraUniform(x);

  const loader = new THREE.TextureLoader();
  if (def.texturas?.includes('logo')) {
    const logo = loader.load('brand/kalixto-logo-512.webp');
    logo.colorSpace = THREE.SRGBColorSpace;
    uniforms['uTextura'] = { value: logo };
    uniforms['uTexturaA'] = { value: logo };
  }
  if (def.texturas?.includes('listras')) uniforms['uTexturaB'] = { value: texturaListras() };

  const material = new THREE.ShaderMaterial({ vertexShader: def.vertex, fragmentShader: def.fragment, uniforms });

  let malha: THREE.Mesh;
  if (def.modo === '2d') {
    malha = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    malha.frustumCulled = false; // sempre desenha, a câmera não importa
    p.controles.enabled = false;
  } else {
    malha = new THREE.Mesh(new THREE.PlaneGeometry(4, 4, 96, 96), material);
    malha.rotation.x = -Math.PI / 2.5;
    p.camera.position.set(0, 2.2, 4.2);
    p.camera.lookAt(0, 0, 0);
  }
  p.cena.add(malha);

  const tamanho = new THREE.Vector2();
  p.aCadaQuadro((_, tempo) => {
    uniforms['uTempo'].value = tempo;
    p.renderer.getDrawingBufferSize(tamanho);
    (uniforms['uResolucao'].value as THREE.Vector2).copy(tamanho);
  });

  const mover = (e: PointerEvent) => {
    const r = p.canvas.getBoundingClientRect();
    (uniforms['uMouse'].value as THREE.Vector2).set((e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height);
  };
  p.canvas.addEventListener('pointermove', mover);

  return {
    atualizar: (valores) => {
      for (const [k, x] of Object.entries(def.uniforms(valores))) {
        const u = uniforms[k];
        if (u?.value instanceof THREE.Color) u.value.set(String(x));
        else if (u) u.value = Number(x);
      }
    },
    alternar: (duracao) => {
      gsap.to(uniforms['uProgresso'], {
        value: uniforms['uProgresso'].value > 0.5 ? 0 : 1,
        duration: duracao,
        ease: 'power2.inOut',
        overwrite: true,
      });
    },
    destruir: () => {
      gsap.killTweensOf(uniforms['uProgresso']);
      p.canvas.removeEventListener('pointermove', mover);
    },
  };
}
