/**
 * Gera public/models/kalixto-trofeu.glb — o modelo 3D usado na demo
 * "Modelos GLTF/GLB" do Three.js Lab. Feito só com formas do Three.js,
 * sem arquivos de terceiros.
 *
 * Uso: node scripts/gerar-modelo.mjs
 */
import { writeFileSync } from 'node:fs';
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

// O exportador usa FileReader (do navegador); no Node criamos um equivalente simples.
globalThis.FileReader = class {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((buf) => {
      this.result = buf;
      this.onloadend?.();
    });
  }
  readAsDataURL(blob) {
    blob.arrayBuffer().then((buf) => {
      this.result = `data:${blob.type};base64,${Buffer.from(buf).toString('base64')}`;
      this.onloadend?.();
    });
  }
};

const material = (cor, metal = 0.6, rugosidade = 0.3, emissivo = 0x000000) =>
  new THREE.MeshStandardMaterial({
    color: cor,
    metalness: metal,
    roughness: rugosidade,
    emissive: emissivo,
    emissiveIntensity: 0.6,
  });

const trofeu = new THREE.Group();
trofeu.name = 'KalixtoTrofeu';

// Base em degraus
const base = new THREE.Mesh(
  new THREE.CylinderGeometry(1.1, 1.25, 0.3, 48),
  material(0x140c2a, 0.3, 0.6),
);
base.position.y = 0.15;
base.name = 'Base';
const degrau = new THREE.Mesh(
  new THREE.CylinderGeometry(0.8, 0.95, 0.22, 48),
  material(0x8b5cf6, 0.7, 0.25),
);
degrau.position.y = 0.41;
degrau.name = 'Degrau';

// Haste
const haste = new THREE.Mesh(
  new THREE.CylinderGeometry(0.12, 0.22, 0.9, 24),
  material(0x22e3ff, 0.8, 0.2),
);
haste.position.y = 0.97;
haste.name = 'Haste';

// Anel neon
const anel = new THREE.Mesh(
  new THREE.TorusGeometry(0.85, 0.09, 24, 96),
  material(0xff2bd6, 0.4, 0.2, 0xff2bd6),
);
anel.position.y = 2.05;
anel.name = 'Anel';

// Letra K feita de caixas
const k = new THREE.Group();
k.name = 'LetraK';
const mk = material(0xf5f3ff, 0.3, 0.25, 0x8b5cf6);
const vertical = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.1, 0.2), mk);
vertical.position.set(-0.22, 0, 0);
const braco1 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.68, 0.2), mk);
braco1.position.set(0.12, 0.25, 0);
braco1.rotation.z = -0.8;
const braco2 = braco1.clone();
braco2.position.set(0.12, -0.25, 0);
braco2.rotation.z = 0.8;
k.add(vertical, braco1, braco2);
k.position.y = 2.05;

// Cristais em volta
for (let i = 0; i < 3; i++) {
  const cristal = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.16),
    material([0xff2bd6, 0x2f7bff, 0x22e3ff][i], 0.5, 0.1),
  );
  const ang = (i / 3) * Math.PI * 2;
  cristal.position.set(Math.cos(ang) * 0.95, 0.75, Math.sin(ang) * 0.95);
  cristal.name = `Cristal${i + 1}`;
  trofeu.add(cristal);
}

trofeu.add(base, degrau, haste, anel, k);

new GLTFExporter().parse(
  trofeu,
  (glb) => {
    writeFileSync('public/models/kalixto-trofeu.glb', Buffer.from(glb));
    console.log('Modelo gerado: public/models/kalixto-trofeu.glb', glb.byteLength, 'bytes');
  },
  (erro) => console.error(erro),
  { binary: true },
);
