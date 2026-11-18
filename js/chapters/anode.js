// Chapter 5: sacrificial anodes and cathodic protection. If the steel can be made the cathode of a cell, it does not dissolve.
// Galvanic way: bolt or wire a more reactive metal (zinc or aluminium alloys at sea, magnesium or zinc in soil) to the steel. It gives up
// the electrons and is slowly used up. Impressed-current way: a DC power supply pushes electrons into the steel and the current leaves
// through a long-lived inert anode. Anode life, power and the effect on the steel rate here are a cartoon of the idea.
import { THREE, M, box, COL, dots, bar, mix, clamp, lerp, smooth } from '../rust.js';
import { tube as tubeFn } from '../kit.js';

const hash = (i, k) => { const v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return v - Math.floor(v); };
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const LIFE = 12;

function prot(s) {
  if (s.sys === 'galv') { const left = Math.max(0, 1 - s.years / LIFE); return { left, p: 0.97 * smooth(left / 0.12) }; }
  if (s.sys === 'imp') return { left: 1, p: 0.97 * smooth(s.power / 0.45) };
  return { left: 1, p: 0 };
}
const along = (pts, p) => {
  const L = pts.slice(1).map((q, i) => q.distanceTo(pts[i])), tot = L.reduce((a, b) => a + b, 0);
  let d = p * tot;
  for (let i = 0; i < L.length; i++) { if (d <= L[i] || i === L.length - 1) return pts[i].clone().lerp(pts[i + 1], clamp(d / L[i], 0, 1)); d -= L[i]; }
};

export default {
  id: 'anode',
  short: 'Anodes and currents',
  title: 'Sacrificial anodes and cathodic protection',
  subtitle: 'Turn the steel into the cathode of a bigger battery and it stops dissolving.',
  view: { pos: [2.8, 1.9, 6.4], target: [0, 0.5, 0.7] },
  learn: `<p>If steel is made the <b>cathode</b> of a cell, it does not give up its iron. That is <b>cathodic protection</b>, and there are two ways to do it. In the <b>galvanic</b> way, a block of a more reactive metal, usually <b>zinc</b> or an aluminium alloy on ships and <b>magnesium</b> or zinc for buried pipes, is bolted or wired to the steel. It becomes the anode and is slowly <b>used up</b>, which is why it is called a <b>sacrificial anode</b>.</p>
    <p>In the <b>impressed-current</b> way, a power supply pushes electrons into the steel through a wire. The current leaves through a long-lasting <b>inert anode</b> that is barely used up. Long pipelines are often protected this way, usually together with a coating, because a coating means a much smaller area needs protecting.</p>
    <p class="tip"><b>Try it:</b> choose a ship hull or a buried pipeline, add anodes, and slide <b>Years in service</b> until the anodes are gone. Then press <b>Replace anodes</b>, or switch to the powered system.</p>
    <p class="note">Anode lifetimes and how well they protect are a cartoon here. Real systems are designed and checked by corrosion engineers.</p>`,
  terms: [
    { t: 'Sacrificial anode', d: 'A block of a more reactive metal joined to steel. It corrodes so that the steel does not.' },
    { t: 'Cathodic protection', d: 'Protecting a metal by making it the cathode of a cell, either with sacrificial anodes or with an applied current.' },
    { t: 'Impressed current', d: 'A power supply that pushes electrons into the metal to be protected, with an inert anode to complete the circuit.' },
    { t: 'Inert anode', d: 'An anode made of a material, such as graphite or mixed metal oxide on titanium, that is hardly used up.' },
  ],
  defaults: { place: 'ship', sys: 'galv', years: 2, power: 0.7 },
  controls: [
    { key: 'place', type: 'seg', label: 'Protecting', options: [{ v: 'ship', label: 'Ship hull' }, { v: 'pipe', label: 'Buried pipeline' }] },
    { key: 'sys', type: 'seg', label: 'System', options: [{ v: 'none', label: 'None' }, { v: 'galv', label: 'Sacrificial anode' }, { v: 'imp', label: 'Powered' }] },
    { key: 'years', type: 'range', label: 'Years in service', min: 0, max: 16, step: 0.05, fmt: (v) => `${v.toFixed(1)} years`, hint: 'Sacrificial anodes get used up with time.' },
    { key: 'power', type: 'range', label: 'Power supply', min: 0, max: 1, step: 0.01, fmt: (v) => `${Math.round(v * 100)}%` },
    { key: 'rep', type: 'buttons', label: 'Maintenance', items: [{ label: 'Replace anodes', act: (s) => { s.years = 0; } }] },
  ],
  quiz: [
    { q: 'Why is a sacrificial anode called that?', options: ['It is sold cheaply', 'It corrodes in place of the steel and is used up', 'It is made of stone', 'It is thrown away at launch'], answer: 1, why: 'The more reactive metal is the anode, so it dissolves and the steel does not.' },
    { q: 'What does an impressed-current system use?', options: ['A power supply that pushes electrons into the steel', 'A bigger anchor', 'More paint', 'Salt'], answer: 0, why: 'A DC supply and an inert anode make the steel the cathode.' },
    { q: 'What happens when sacrificial anodes are completely used up?', options: ['The steel is still protected', 'The steel is unprotected and starts to corrode again', 'The ship floats better', 'The anodes grow back'], answer: 1, why: 'Anodes have to be checked and replaced before they are gone.' },
    { q: 'Which metals are used as sacrificial anodes?', options: ['Gold and platinum', 'Zinc, aluminium alloys and magnesium', 'Copper and silver', 'Lead only'], answer: 1, why: 'They are more reactive than iron.' },
  ],
  reel: [
    { ms: 5600, caption: 'Bolt zinc to a hull and the zinc is eaten instead. Pipelines can be protected the same way, or by a current from a power supply.', set: { place: 'ship', sys: 'galv', years: 0, power: 0.7 }, anim: { years: [0.2, 9] }, view: { pos: [2.4, 1.8, 6.2], target: [0, 0.5, 0.7] }, spin: 0 },
  ],
  build({ stage }) {
    stage.floor.visible = false;
    const root = new THREE.Group(); stage.root.add(root);
    const medium = box(9, 3.4, 4.4, M.clear(COL.sea, 0.08, { roughness: 0.05 })); medium.position.set(0, 0, 0.9); root.add(medium);
    const hullMat = M.metal(0x7f8794, { roughness: 0.42 });
    const hull = box(6.6, 2.4, 0.28, hullMat); root.add(hull);
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 6.8, 36), hullMat); pipe.rotation.z = Math.PI / 2; pipe.castShadow = true; root.add(pipe);
    const znMat = M.metal(COL.zn, { roughness: 0.35 });
    const blocks = [-2.2, 0, 2.2].map((x) => { const b = box(0.55, 0.4, 0.3, znMat); b.position.set(x, -0.3, 0.28); root.add(b); return b; });
    const mg = box(0.7, 0.5, 0.5, M.metal(COL.mg, { roughness: 0.35 })); mg.position.set(2.7, -0.7, 1.5); root.add(mg);
    const inert = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.9, 16), M.matte(0x1a1d22)); root.add(inert);
    const supply = box(0.9, 0.5, 0.6, M.plastic(0x3b82f6)); root.add(supply);
    const wires = new THREE.Group(); root.add(wires);
    const wireMat = M.glow(0xffb547);
    const fe = dots(root, 50, 0.07, COL.fe), an = dots(root, 50, 0.07, COL.zn), el = dots(root, 80, 0.04, COL.e, 6), o2 = dots(root, 24, 0.05, COL.o2);
    const L = { a: stage.label('', [0, 0, 0], root, 'hot'), s: stage.label('', [0, 0, 0], root), p: stage.label('', [0, 0, 0], root) };
    let T = 0, key = '', path = [];
    function layout(st) {
      const k = st.place + st.sys; if (k === key) return; key = k;
      while (wires.children.length) { const w = wires.children[0]; wires.remove(w); w.geometry.dispose(); }
      const ship = st.place === 'ship', top = ship ? 1.2 : 0.46, zA = 1.5;
      hull.visible = ship; pipe.visible = !ship;
      medium.material.color.setHex(ship ? COL.sea : COL.soil); medium.material.opacity = ship ? 0.08 : 0.2;
      blocks.forEach((b) => { b.visible = ship && st.sys === 'galv'; });
      mg.visible = !ship && st.sys === 'galv';
      inert.visible = supply.visible = st.sys === 'imp';
      path = [];
      if (st.sys === 'galv' && !ship) path = [V(2.7, -0.7, 1.5), V(2.7, 1.9, 1.5), V(0.6, 1.9, 1.5), V(0.6, top, 0.15)];
      if (st.sys === 'imp') { inert.position.set(-1.8, -0.4, zA); supply.position.set(0.4, 1.95, zA); path = [V(-1.8, -0.4, zA), V(-1.8, 1.9, zA), V(0.4, 1.9, zA), V(2.2, 1.9, zA), V(2.2, top, 0.16)]; }
      if (path.length) wires.add(tubeFn(path, 0.035, wireMat, false, 60));
      L.s.element.textContent = ship ? 'Steel hull' : 'Steel pipe'; L.s.position.set(-2.4, ship ? 1.0 : 0.7, 0.3);
      L.a.element.textContent = st.sys === 'galv' ? (ship ? 'Zinc anodes (sacrificial)' : 'Magnesium anode (sacrificial)') : st.sys === 'imp' ? 'Inert anode' : '';
      L.a.position.set(st.sys === 'imp' ? -1.8 : ship ? -2.2 : 2.7, st.sys === 'imp' ? -1 : ship ? -0.85 : -1.2, st.sys === 'imp' ? zA : ship ? 0.6 : 1.5);
      L.a.element.style.display = st.sys === 'none' ? 'none' : '';
      L.p.element.textContent = st.sys === 'imp' ? 'DC power supply' : ''; L.p.position.set(0.4, 2.6, 1.5); L.p.element.style.display = st.sys === 'imp' ? '' : 'none';
    }
    const surf = (st, i, c) => (st.place === 'ship' ? [(hash(i, c + 1) - 0.5) * 6, (hash(i, c + 2) - 0.5) * 2.2, 0.16] : (() => { const a = hash(i, c + 2) * 6.283, x = (hash(i, c + 1) - 0.5) * 6.4; return [x, Math.cos(a) * 0.48, Math.sin(a) * 0.48]; })());
    return {
      update(dt, st) {
        T += dt; layout(st);
        const { left, p } = prot(st), rate = 1 - p, ship = st.place === 'ship';
        blocks.forEach((b) => { const k = 0.15 + 0.85 * left; b.scale.set(k, k, 1); b.position.y = -0.3 - (1 - k) * 0.0; });
        mg.scale.setScalar(0.15 + 0.85 * left);
        hullMat.color.copy(mix(0x7f8794, COL.rust, smooth((rate - 0.5) / 0.5) * 0.65));
        for (let i = 0; i < 50; i++) {
          if (i / 50 > rate) fe.hide(i); else { const q = T * 0.4 + hash(i, 3), c = Math.floor(q), pp = q - c, s0 = surf(st, i, c); const dz = ship ? 0.3 + pp * 0.9 : 0; const dir = ship ? [0, 0, 1] : [0, s0[1] / 0.48, s0[2] / 0.48]; fe.at(i, s0[0], s0[1] + (ship ? 0 : dir[1] * pp * 0.7), s0[2] + (ship ? dz - 0.3 : dir[2] * pp * 0.7), 1 - pp * pp * pp); }
          const galv = st.sys === 'galv';
          if (!galv || i / 50 > p) an.hide(i); else { const q = T * 0.4 + hash(i, 5), c = Math.floor(q), pp = q - c; const a = ship ? V(blocks[i % 3].position.x, -0.3, 0.28) : mg.position; an.at(i, a.x + (hash(i, c + 6) - 0.5) * 0.5, a.y + (hash(i, c + 7) - 0.5) * 0.4, a.z + 0.25 + pp * 0.9 * (ship ? 1 : 0.6) + (ship ? 0 : (hash(i, 8) - 0.5) * 0.6), (1 - pp * pp * pp) * (0.4 + 0.6 * left)); }
        }
        for (let i = 0; i < 80; i++) {
          if (st.sys === 'none' || i / 80 > p) { el.hide(i); continue; }
          const q = (T * 0.45 + i / 80 * 2) % 1, c = Math.floor(T * 0.45 + i / 80 * 2);
          if (st.sys === 'galv' && ship) { const b = blocks[i % 3].position; const e = [b.x, -0.3, 0.14], s1 = surf(st, i, c); const pp = q; el.at(i, lerp(b.x, s1[0], smooth(pp)), lerp(-0.3, s1[1], smooth(pp)), lerp(0.3, 0.16, pp), 1); continue; }
          const e = path[path.length - 1]; if (!path.length) { el.hide(i); continue; }
          if (q < 0.55) { const pt = along(path, q / 0.55); el.at(i, pt.x, pt.y, pt.z, 1); } else { const s1 = surf(st, i, c), pp = (q - 0.55) / 0.45; el.at(i, lerp(e.x, s1[0], pp), lerp(e.y, s1[1], pp), lerp(e.z, s1[2], pp), 1); }
        }
        for (let i = 0; i < 24; i++) { const q = T * 0.5 + hash(i, 12), c = Math.floor(q), pp = q - c, s1 = surf(st, i, c), n = ship ? [0, 0, 1] : [0, s1[1] / 0.48, s1[2] / 0.48], d = 0.9 * (1 - pp); o2.at(i, s1[0] + n[0] * d, s1[1] + n[1] * d, s1[2] + n[2] * d, 1 - Math.pow(pp, 6)); }
        [fe, an, el, o2].forEach((d) => d.done());
      },
      readout(st) {
        const { left, p } = prot(st), rate = 1 - p;
        const big = st.sys === 'none' ? 'Unprotected: steel is eaten' : st.sys === 'galv' ? (left <= 0.02 ? 'Anodes used up: unprotected' : 'Anode is eaten, steel is not') : (p > 0.5 ? 'Steel is the cathode' : 'Power too low');
        const say = st.sys === 'none' ? 'Water and oxygen can reach the steel, so it behaves as in the first chapter.' : st.sys === 'galv' ? 'The anode gives up the electrons that the steel would have given. Check and replace anodes before they are gone.' : 'The power supply pushes electrons into the steel, so oxygen takes them there and the iron stays put. Too little current and some rusting continues.';
        return `<div class="big">${big}</div><p class="r-say">${say}</p>
          <div class="row"><span>Steel corrosion</span><b>${Math.round(rate * 100)}% of unprotected</b></div>${bar(rate, 'linear-gradient(90deg,#ffb547,#ff7a59)')}
          ${st.sys === 'galv' ? `<div class="row"><span>Anode left</span><b>${Math.round(left * 100)}%</b></div>${bar(left, 'linear-gradient(90deg,#8ef0ff,#c49bff)')}` : ''}`;
      },
    };
  },
};
