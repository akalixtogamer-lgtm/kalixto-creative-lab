import { gsap } from 'gsap';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Valores } from '../../core/models/demo.model';
import { Palco3D } from './palco-3d';

/**
 * Cenas do Three.js Lab — uma por demo.
 * Cada cena é criada ao entrar na demo e devolve:
 *  - atualizar(v): aplica os controles (chamada sempre que um muda);
 *  - executar(v): o botão principal;
 *  - destruir(): remove eventos e animações próprias.
 * Geometrias, materiais e texturas são liberados pelo palco (limparCena).
 */
export interface Cena3D {
  atualizar(v: Valores): void;
  executar?(v: Valores): void;
  destruir?(): void;
  /** Só na demo GLTF: carrega um arquivo escolhido pelo usuário. */
  carregarArquivo?(url: string): void;
}

const ROXO_ESCURO = '#2a2050';

/* ---------- peças comuns ---------- */

function luzesPadrao(p: Palco3D): void {
  const amb = new THREE.AmbientLight('#ffffff', 0.45);
  const sol = new THREE.DirectionalLight('#ffffff', 1.6);
  sol.position.set(3, 5, 4);
  const rosa = new THREE.PointLight('#ff2bd6', 6, 12);
  rosa.position.set(-3, 2, 2);
  const ciano = new THREE.PointLight('#22e3ff', 5, 12);
  ciano.position.set(3, -1, 3);
  p.cena.add(amb, sol, rosa, ciano);
}

function chao(p: Palco3D, y = -1.4): void {
  const grade = new THREE.GridHelper(20, 20, '#8b5cf6', '#2a2050');
  grade.position.y = y;
  (grade.material as THREE.Material).transparent = true;
  (grade.material as THREE.Material).opacity = 0.5;
  p.cena.add(grade);
}

/** Posição do ponteiro em -1…1 relativa ao canvas. */
function ponteiroNormalizado(canvas: HTMLCanvasElement, e: PointerEvent): THREE.Vector2 {
  const r = canvas.getBoundingClientRect();
  return new THREE.Vector2(
    ((e.clientX - r.left) / r.width) * 2 - 1,
    -((e.clientY - r.top) / r.height) * 2 + 1,
  );
}

function geometria(forma: string): THREE.BufferGeometry {
  switch (forma) {
    case 'esfera':
      return new THREE.SphereGeometry(1.1, 48, 32);
    case 'toro':
      return new THREE.TorusGeometry(1, 0.38, 24, 96);
    case 'no':
      return new THREE.TorusKnotGeometry(0.8, 0.28, 160, 24);
    case 'icosaedro':
      return new THREE.IcosahedronGeometry(1.2, 0);
    case 'cone':
      return new THREE.ConeGeometry(1, 1.8, 48);
    default:
      return new THREE.BoxGeometry(1.6, 1.6, 1.6);
  }
}

/* ---------- texturas desenhadas em canvas ---------- */

function texturaCanvas(padrao: string): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d')!;
  if (padrao === 'xadrez') {
    for (let y = 0; y < 8; y++)
      for (let x = 0; x < 8; x++) {
        g.fillStyle = (x + y) % 2 ? '#ff2bd6' : '#140c2a';
        g.fillRect(x * 32, y * 32, 32, 32);
      }
  } else if (padrao === 'listras') {
    g.fillStyle = '#140c2a';
    g.fillRect(0, 0, 256, 256);
    g.fillStyle = '#22e3ff';
    for (let i = 0; i < 8; i++) g.fillRect(i * 32, 0, 14, 256);
  } else {
    const grad = g.createLinearGradient(0, 0, 256, 256);
    grad.addColorStop(0, '#ff2bd6');
    grad.addColorStop(0.5, '#8b5cf6');
    grad.addColorStop(1, '#22e3ff');
    g.fillStyle = grad;
    g.fillRect(0, 0, 256, 256);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/* =========================================================
   CENAS
   ========================================================= */

export const CENAS_3D: Record<string, (p: Palco3D) => Cena3D> = {
  geometria: (p) => {
    luzesPadrao(p);
    chao(p);
    const material = new THREE.MeshStandardMaterial({
      color: '#8b5cf6',
      metalness: 0.3,
      roughness: 0.35,
    });
    const forma = new THREE.Mesh(geometria('cubo'), material);
    p.cena.add(forma);
    let vel = 1;
    let formaAtual = 'cubo';
    p.aCadaQuadro((d) => {
      forma.rotation.y += d * 0.8 * vel;
      forma.rotation.x += d * 0.3 * vel;
    });
    return {
      atualizar: (v) => {
        vel = Number(v['vel']);
        material.wireframe = v['wireframe'] === 'true';
        if (v['forma'] !== formaAtual) {
          formaAtual = String(v['forma']);
          forma.geometry.dispose();
          forma.geometry = geometria(formaAtual);
        }
      },
      executar: () => {
        gsap.to(forma.rotation, { y: `+=${Math.PI * 2}`, duration: 1.2, ease: 'power3.inOut' });
        gsap.fromTo(
          forma.scale,
          { x: 0.8, y: 0.8, z: 0.8 },
          { x: 1, y: 1, z: 1, duration: 1.2, ease: 'elastic.out(1, 0.4)' },
        );
      },
      destruir: () => gsap.killTweensOf([forma.rotation, forma.scale]),
    };
  },

  camera: (p) => {
    luzesPadrao(p);
    chao(p, -0.5);
    const cores = ['#ff2bd6', '#8b5cf6', '#2f7bff', '#22e3ff'];
    for (let i = 0; i < 12; i++) {
      const m = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 0.7 + (i % 3) * 0.5, 0.7),
        new THREE.MeshStandardMaterial({ color: cores[i % 4], roughness: 0.4 }),
      );
      const ang = (i / 12) * Math.PI * 2;
      const raio = i % 2 ? 2.4 : 1.3;
      m.position.set(Math.cos(ang) * raio, -0.5 + (0.7 + (i % 3) * 0.5) / 2, Math.sin(ang) * raio);
      p.cena.add(m);
    }
    const voo = { a: 0 };
    let tween: gsap.core.Tween | undefined;
    return {
      atualizar: (v) => {
        p.camera.fov = Number(v['fov']);
        p.camera.updateProjectionMatrix();
        const dir = p.camera.position.clone().setY(0).normalize();
        if (dir.lengthSq() === 0) dir.set(0, 0, 1);
        p.camera.position.set(
          dir.x * Number(v['dist']),
          Number(v['alt']),
          dir.z * Number(v['dist']),
        );
        p.camera.lookAt(0, 0, 0);
      },
      executar: (v) => {
        tween?.kill();
        const dist = Number(v['dist']);
        voo.a = Math.atan2(p.camera.position.x, p.camera.position.z);
        tween = gsap.to(voo, {
          a: voo.a + Math.PI * 2,
          duration: 3,
          ease: 'power1.inOut',
          onUpdate: () => {
            p.camera.position.x = Math.sin(voo.a) * dist;
            p.camera.position.z = Math.cos(voo.a) * dist;
            p.camera.lookAt(0, 0, 0);
          },
        });
      },
      destruir: () => tween?.kill(),
    };
  },

  iluminacao: (p) => {
    chao(p);
    const amb = new THREE.AmbientLight('#ffffff', 0.3);
    const sol = new THREE.DirectionalLight('#ffffff', 1.5);
    sol.position.set(3, 5, 2);
    const lampada = new THREE.PointLight('#ff2bd6', 2, 10, 1.2);
    lampada.position.set(-1.5, 1.2, 1.5);
    const bulbo = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 16, 8),
      new THREE.MeshBasicMaterial({ color: '#ff2bd6' }),
    );
    lampada.add(bulbo);
    const mat = new THREE.MeshStandardMaterial({ color: '#c9c3e6', roughness: 0.45 });
    const objetos = [
      new THREE.Mesh(new THREE.TorusKnotGeometry(0.55, 0.2, 128, 16), mat),
      new THREE.Mesh(new THREE.SphereGeometry(0.55, 48, 24), mat),
      new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.9), mat),
    ];
    objetos.forEach((o, i) => o.position.set((i - 1) * 1.8, -0.4, 0));
    p.cena.add(amb, sol, lampada, ...objetos);
    let orbita: gsap.core.Tween | undefined;
    const ang = { a: 0 };
    return {
      atualizar: (v) => {
        amb.intensity = Number(v['ambiente']);
        sol.intensity = Number(v['direcional']);
        lampada.intensity = Number(v['ponto']);
        lampada.color.set(String(v['cor']));
        (bulbo.material as THREE.MeshBasicMaterial).color.set(String(v['cor']));
        bulbo.visible = Number(v['ponto']) > 0;
      },
      executar: () => {
        orbita?.kill();
        orbita = gsap.to(ang, {
          a: `+=${Math.PI * 2}`,
          duration: 4,
          ease: 'none',
          onUpdate: () => lampada.position.set(Math.cos(ang.a) * 2.5, 1.2, Math.sin(ang.a) * 2.5),
        });
      },
      destruir: () => orbita?.kill(),
    };
  },

  materiais: (p) => {
    luzesPadrao(p);
    chao(p);
    const esfera = new THREE.Mesh<THREE.BufferGeometry, THREE.Material>(
      new THREE.SphereGeometry(1.1, 64, 32),
      new THREE.MeshStandardMaterial(),
    );
    p.cena.add(esfera);
    let tipo = '';
    return {
      atualizar: (v) => {
        const cor = String(v['cor']);
        if (v['tipo'] !== tipo) {
          tipo = String(v['tipo']);
          (esfera.material as THREE.Material).dispose();
          esfera.material =
            tipo === 'basic'
              ? new THREE.MeshBasicMaterial()
              : tipo === 'lambert'
                ? new THREE.MeshLambertMaterial()
                : tipo === 'phong'
                  ? new THREE.MeshPhongMaterial({ shininess: 80 })
                  : tipo === 'normal'
                    ? new THREE.MeshNormalMaterial()
                    : new THREE.MeshStandardMaterial();
        }
        const m = esfera.material;
        if ('color' in m && m.color instanceof THREE.Color) m.color.set(cor);
        if (m instanceof THREE.MeshStandardMaterial) {
          m.metalness = Number(v['metal']);
          m.roughness = Number(v['rugosidade']);
        }
      },
      executar: () => {
        gsap.to(esfera.rotation, { y: `+=${Math.PI * 2}`, duration: 2, ease: 'power2.inOut' });
      },
      destruir: () => gsap.killTweensOf(esfera.rotation),
    };
  },

  texturas: (p) => {
    luzesPadrao(p);
    const cubo = new THREE.Mesh(
      new THREE.BoxGeometry(2, 2, 2),
      new THREE.MeshStandardMaterial({ roughness: 0.6 }),
    );
    p.cena.add(cubo);
    p.aCadaQuadro((d) => (cubo.rotation.y += d * 0.3));
    let padrao = '';
    let textura: THREE.Texture | undefined;
    const material = cubo.material as THREE.MeshStandardMaterial;
    const repetir = (n: number) => {
      if (!textura) return;
      textura.wrapS = textura.wrapT = THREE.RepeatWrapping;
      textura.repeat.set(n, n);
      // Só pede atualização quando a imagem já existe (a logo carrega depois)
      if (textura.image) textura.needsUpdate = true;
    };
    let rep = 1;
    return {
      atualizar: (v) => {
        rep = Number(v['repeticao']);
        if (v['padrao'] !== padrao) {
          padrao = String(v['padrao']);
          textura?.dispose();
          if (padrao === 'logo') {
            textura = new THREE.TextureLoader().load('brand/kalixto-logo-512.webp', () =>
              repetir(rep),
            );
            textura.colorSpace = THREE.SRGBColorSpace;
          } else {
            textura = texturaCanvas(padrao);
          }
          material.map = textura;
          material.needsUpdate = true;
        }
        repetir(rep);
      },
      executar: () => {
        if (textura) gsap.to(textura.offset, { x: `+=1`, duration: 2, ease: 'none' });
      },
      destruir: () => textura && gsap.killTweensOf(textura.offset),
    };
  },

  animacao: (p) => {
    luzesPadrao(p);
    chao(p, -0.8);
    const cubo = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshStandardMaterial({ color: '#ff2bd6', roughness: 0.3, metalness: 0.2 }),
    );
    // A geometria começa no chão, para o "achatar" acontecer a partir da base
    cubo.geometry.translate(0, 0.5, 0);
    cubo.position.y = -0.8;
    p.cena.add(cubo);
    let tl: gsap.core.Timeline | undefined;
    return {
      atualizar: () => undefined,
      executar: (v) => {
        tl?.progress(1).kill();
        const d = Number(v['dur']);
        const chaoY = -0.8;
        tl = gsap
          .timeline()
          .to(cubo.scale, { x: 1.25, y: 0.7, z: 1.25, duration: d * 0.15 })
          .to(cubo.position, {
            y: chaoY + Number(v['altura']),
            duration: d * 0.35,
            ease: 'power2.out',
          })
          .to(cubo.scale, { x: 0.85, y: 1.25, z: 0.85, duration: d * 0.2 }, '<');
        if (v['giro'] === 'sim')
          tl.to(cubo.rotation, { y: `+=${Math.PI * 2}`, duration: d * 0.6 }, '<');
        tl.to(cubo.position, { y: chaoY, duration: d * 0.35, ease: 'power2.in' })
          .to(cubo.scale, { x: 1.3, y: 0.65, z: 1.3, duration: d * 0.08 })
          .to(cubo.scale, { x: 1, y: 1, z: 1, duration: d * 0.25, ease: 'elastic.out(1, 0.4)' });
      },
      destruir: () => tl?.kill(),
    };
  },

  mouse: (p) => {
    luzesPadrao(p);
    const forma = new THREE.Mesh(
      new THREE.TorusKnotGeometry(0.9, 0.3, 180, 24),
      new THREE.MeshStandardMaterial({ color: '#8b5cf6', metalness: 0.6, roughness: 0.25 }),
    );
    p.cena.add(forma);
    p.controles.enabled = false; // aqui o mouse controla o objeto, não a câmera
    const alvo = new THREE.Vector2();
    let intensidade = 0.6;
    let suavidade = 0.08;
    const mover = (e: PointerEvent) => alvo.copy(ponteiroNormalizado(p.canvas, e));
    const sair = () => alvo.set(0, 0);
    p.canvas.addEventListener('pointermove', mover);
    p.canvas.addEventListener('pointerleave', sair);
    p.aCadaQuadro(() => {
      forma.rotation.y += (alvo.x * intensidade - forma.rotation.y) * suavidade;
      forma.rotation.x += (-alvo.y * intensidade - forma.rotation.x) * suavidade;
    });
    return {
      atualizar: (v) => {
        intensidade = Number(v['intensidade']);
        suavidade = Number(v['suavidade']);
      },
      destruir: () => {
        p.canvas.removeEventListener('pointermove', mover);
        p.canvas.removeEventListener('pointerleave', sair);
        p.controles.enabled = true;
      },
    };
  },

  raycasting: (p) => {
    luzesPadrao(p);
    p.controles.enableRotate = false;
    const cubos: THREE.Mesh[] = [];
    for (let i = 0; i < 9; i++) {
      const c = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.8, 0.8),
        new THREE.MeshStandardMaterial({ color: ROXO_ESCURO, roughness: 0.4 }),
      );
      c.position.set(((i % 3) - 1) * 1.2, (1 - Math.floor(i / 3)) * 1.2, 0);
      cubos.push(c);
      p.cena.add(c);
    }
    const raycaster = new THREE.Raycaster();
    let cor = '#ff2bd6';
    let escala = 1.3;
    let atual: THREE.Mesh | undefined;
    const destacar = (alvo: THREE.Mesh | undefined) => {
      if (alvo === atual) return;
      if (atual) {
        (atual.material as THREE.MeshStandardMaterial).color.set(
          atual.userData['clicado'] ? '#2ee59d' : ROXO_ESCURO,
        );
        gsap.to(atual.scale, { x: 1, y: 1, z: 1, duration: 0.3 });
      }
      atual = alvo;
      p.canvas.style.cursor = alvo ? 'pointer' : '';
      if (alvo) {
        (alvo.material as THREE.MeshStandardMaterial).color.set(cor);
        gsap.to(alvo.scale, {
          x: escala,
          y: escala,
          z: escala,
          duration: 0.3,
          ease: 'back.out(2)',
        });
      }
    };
    const testar = (e: PointerEvent) => {
      raycaster.setFromCamera(ponteiroNormalizado(p.canvas, e), p.camera);
      return raycaster.intersectObjects(cubos)[0]?.object as THREE.Mesh | undefined;
    };
    const mover = (e: PointerEvent) => destacar(testar(e));
    const clicar = (e: PointerEvent) => {
      const alvo = testar(e);
      if (!alvo) return;
      alvo.userData['clicado'] = !alvo.userData['clicado'];
      gsap.to(alvo.rotation, {
        x: `+=${Math.PI / 2}`,
        y: `+=${Math.PI / 2}`,
        duration: 0.5,
        ease: 'back.out(1.6)',
      });
    };
    const sair = () => destacar(undefined);
    p.canvas.addEventListener('pointermove', mover);
    p.canvas.addEventListener('pointerdown', clicar);
    p.canvas.addEventListener('pointerleave', sair);
    return {
      atualizar: (v) => {
        cor = String(v['cor']);
        escala = Number(v['escala']);
        if (atual) {
          (atual.material as THREE.MeshStandardMaterial).color.set(cor);
          atual.scale.setScalar(escala);
        }
      },
      destruir: () => {
        p.canvas.removeEventListener('pointermove', mover);
        p.canvas.removeEventListener('pointerdown', clicar);
        p.canvas.removeEventListener('pointerleave', sair);
        p.canvas.style.cursor = '';
        p.controles.enableRotate = true;
        cubos.forEach((c) => gsap.killTweensOf([c.scale, c.rotation]));
      },
    };
  },

  gltf: (p) => {
    luzesPadrao(p);
    chao(p, -1.2);
    const suporte = new THREE.Group();
    suporte.position.y = -1.2;
    p.cena.add(suporte);
    let modelo: THREE.Object3D | undefined;
    let giro = 1;
    let escala = 1;
    let urlUsuario: string | undefined;
    const loader = new GLTFLoader();
    const carregar = (url: string) => {
      loader.load(url, (gltf) => {
        if (modelo) suporte.remove(modelo);
        modelo = gltf.scene;
        // Centraliza e ajusta o tamanho de qualquer modelo para caber no palco
        const caixa = new THREE.Box3().setFromObject(modelo);
        const tamanho = caixa.getSize(new THREE.Vector3()).length() || 1;
        const centro = caixa.getCenter(new THREE.Vector3());
        modelo.position
          .sub(centro)
          .add(new THREE.Vector3(0, caixa.getSize(new THREE.Vector3()).y / 2, 0));
        const base = new THREE.Group();
        base.add(modelo);
        base.scale.setScalar(4 / tamanho);
        suporte.clear();
        suporte.add(base);
        modelo = base;
        suporte.scale.setScalar(escala);
      });
    };
    carregar('models/kalixto-trofeu.glb');
    p.aCadaQuadro((d) => (suporte.rotation.y += d * 0.6 * giro));
    return {
      atualizar: (v) => {
        giro = Number(v['giro']);
        escala = Number(v['escala']);
        suporte.scale.setScalar(escala);
      },
      executar: () => {
        gsap.fromTo(suporte.position, { y: -4 }, { y: -1.2, duration: 1.2, ease: 'back.out(1.6)' });
        gsap.fromTo(suporte.rotation, { y: -Math.PI }, { y: 0, duration: 1.2, ease: 'power3.out' });
      },
      carregarArquivo: (url) => {
        if (urlUsuario) URL.revokeObjectURL(urlUsuario);
        urlUsuario = url;
        carregar(url);
      },
      destruir: () => {
        gsap.killTweensOf([suporte.position, suporte.rotation]);
        if (urlUsuario) URL.revokeObjectURL(urlUsuario);
      },
    };
  },
};
