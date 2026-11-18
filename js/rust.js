// Shared parts for RustClear: colours, a seeded random generator, instanced particle sets and a few shapes.
import { THREE, M, box, clamp, lerp, smooth } from './kit.js';

export { THREE, M, box, clamp, lerp, smooth };
export const rng = (seed) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
export const COL = {
  iron: 0x8c929e, ironBright: 0xc9cfd9, rust: 0xb7410e, rustDark: 0x7a2e0c, rustPale: 0xd9895a, green: 0xa9c58a,
  fe: 0xff9f43, e: 0x8ef0ff, oh: 0xc49bff, o2: 0xe8f1ff, water: 0x7fb8ff, zn: 0xaab8e0, cu: 0xd9814a, mg: 0xdfe6ee,
  na: 0xffe08a, cl: 0x9bf0b0, lime: 0xa3e635, amber: 0xffb547, coral: 0xff7a59, soil: 0x6b4a33, sea: 0x2e6fb5,
};
export const mix = (a, b, k) => new THREE.Color(a).lerp(new THREE.Color(b), clamp(k, 0, 1));

// Many glowing balls drawn as one mesh. dots.at(i, x, y, z, scale) positions one; dots.hide(i) hides it.
export function dots(parent, n, radius, color, seg = 8) {
  const m = new THREE.InstancedMesh(new THREE.SphereGeometry(radius, seg, seg - 2), color === null ? new THREE.MeshStandardMaterial({ roughness: 0.4 }) : M.glow(color), n);
  m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  m.frustumCulled = false;
  const o = new THREE.Object3D();
  m.at = (i, x, y, z, sc = 1) => { o.position.set(x, y, z); o.scale.setScalar(Math.max(0.0001, sc)); o.updateMatrix(); m.setMatrixAt(i, o.matrix); };
  m.hide = (i) => m.at(i, 0, -50, 0, 0.0001);
  m.done = () => { m.instanceMatrix.needsUpdate = true; };
  for (let i = 0; i < n; i++) m.hide(i);
  m.done();
  parent.add(m);
  return m;
}

// The upper half of a sphere stretched to a dome: a water drop sitting on a surface at y = 0.
export function dome(R, h, mat, seg = 48) {
  const g = new THREE.SphereGeometry(1, seg, seg / 2, 0, Math.PI * 2, 0, Math.PI / 2);
  const m = new THREE.Mesh(g, mat);
  m.scale.set(R, h, R);
  return m;
}

// A cheap dashed ring on the XZ plane.
export function ring(R, color, opacity = 0.7, w = 0.03) {
  const m = new THREE.Mesh(new THREE.TorusGeometry(R, w, 8, 80), M.ghost(color, opacity));
  m.rotation.x = Math.PI / 2;
  return m;
}

// Bar for the readouts: a coloured fill 0..1.
export const bar = (v, color = 'var(--c)') => `<div style="height:8px;border-radius:5px;background:rgba(255,255,255,.1);margin:4px 0 8px"><div style="height:100%;width:${Math.round(clamp(v, 0, 1) * 100)}%;border-radius:5px;background:${color}"></div></div>`;
