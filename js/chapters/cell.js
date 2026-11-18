// Chapter 1: a tiny battery on a drop. Rusting is electrochemical (Evans' drop experiments, 1920s). Under a water drop the
// metal under the thick, oxygen-poor centre is the anode: Fe -> Fe2+ + 2e-. Electrons run through the metal to the thin,
// oxygen-rich edge, the cathode: O2 + 2H2O + 4e- -> 4OH-. Ions carry the current through the water. The numbers and the
// relation between drop width and oxygen are a cartoon: real current depends on temperature, salts, the metal's surface and more.
import { THREE, M, box, COL, dots, dome, ring, bar, rng, clamp, lerp, smooth } from '../rust.js';

const hash = (i, c, k) => { const v = Math.sin(i * 12.9898 + c * 78.233 + k * 37.719) * 43758.5453; return v - Math.floor(v); };

export default {
  id: 'cell',
  short: 'A battery on a drop',
  title: 'A tiny battery on a drop',
  subtitle: 'Iron gives up electrons in one spot and oxygen takes them in another. The drop connects the two.',
  view: { pos: [2.2, 2.5, 4.9], target: [0.2, 0.55, 0] },
  learn: `<p>Rust is not iron simply “catching” oxygen from the air. It needs <b>water</b> as well, and it works like a small <b>battery</b>. Put a drop of water on clean iron. Under the thick <b>centre</b> of the drop there is less dissolved oxygen, because oxygen has to travel through the water to get there. Near the thin <b>edge</b> there is plenty.</p>
    <p>That difference splits the surface into two jobs. At the <b>anode</b>, iron atoms give up electrons and step into the water as ions: <b>Fe → Fe²⁺ + 2e⁻</b>. The electrons run through the metal to the <b>cathode</b> at the edge, where oxygen takes them: <b>O₂ + 2H₂O + 4e⁻ → 4OH⁻</b>. In the water, Fe²⁺ drifts one way and OH⁻ drifts the other, and where they meet, rust begins to form. That ring is the next chapter.</p>
    <p class="tip"><b>Try it:</b> make the drop wider and watch the oxygen at its centre fall, so the anode and cathode pull apart. Turn the <b>air supply</b> down: no oxygen, and the electrons have nowhere to go, so the iron hardly dissolves.</p>
    <p class="note">Particle speeds and the oxygen figures are a simplified cartoon of the idea.</p>`,
  terms: [
    { t: 'Anode', d: 'The place where a metal gives up electrons and dissolves. In rusting, the oxygen-poor centre of a drop.' },
    { t: 'Cathode', d: 'The place where electrons are taken up. In rusting, oxygen at the oxygen-rich edge takes them.' },
    { t: 'Electrolyte', d: 'Water with dissolved ions in it. It carries current as moving ions instead of moving electrons.' },
    { t: 'Ion', d: 'An atom or group of atoms with an electric charge, such as Fe²⁺ or OH⁻.' },
  ],
  defaults: { drop: 1.6, ox: 1, show: 'all' },
  controls: [
    { key: 'drop', type: 'range', label: 'Drop width', min: 0.6, max: 2.2, step: 0.01, fmt: (v) => (v < 1.1 ? 'Small' : v < 1.8 ? 'Medium' : 'Large') },
    { key: 'ox', type: 'range', label: 'Air supply (oxygen)', min: 0, max: 1, step: 0.01, fmt: (v) => `${Math.round(v * 100)}%` },
    { key: 'show', type: 'seg', label: 'Show', options: [{ v: 'all', label: 'All' }, { v: 'e', label: 'Electrons' }, { v: 'ions', label: 'Ions' }, { v: 'o2', label: 'Oxygen' }] },
  ],
  quiz: [
    { q: 'Which part of a water drop on iron is the anode?', options: ['The edge, where there is lots of oxygen', 'The centre, where there is less oxygen', 'The whole drop equally', 'The air above it'], answer: 1, why: 'The centre is oxygen-poor, so iron dissolves there and sends its electrons to the oxygen-rich edge.' },
    { q: 'What do the electrons do at the cathode?', options: ['They turn iron into rust directly', 'They are taken by oxygen and water to make hydroxide ions', 'They leave the drop as light', 'They stop the reaction'], answer: 1, why: 'O₂ + 2H₂O + 4e⁻ → 4OH⁻. The electrons come through the metal.' },
    { q: 'How does current get from the anode to the cathode and back?', options: ['Electrons through the metal, ions through the water', 'Electrons through the water only', 'Ions through the metal only', 'Through the air'], answer: 0, why: 'A circuit needs both paths: electrons move in the metal and ions move in the water.' },
    { q: 'What happens with no oxygen at all?', options: ['Rusting speeds up', 'The iron hardly corrodes, because the electrons have nowhere to go', 'The drop turns to ice', 'Nothing changes'], answer: 1, why: 'Without something to accept the electrons the cell stalls. Oxygen is the usual electron acceptor.' },
  ],
  reel: [
    { ms: 5000, caption: 'A drop of water on iron is a tiny battery.', set: { drop: 1.7, ox: 1, show: 'all' }, view: { pos: [1.8, 2.3, 4.9], target: [0.2, 0.5, 0] }, spin: 0.25 },
    { ms: 5200, caption: 'The centre has less oxygen, so iron gives up electrons there. They run through the metal to the edge.', set: { drop: 0.8, ox: 1, show: 'e' }, anim: { drop: [0.8, 2.1] }, view: { pos: [0.3, 3.2, 4.4], target: [0.2, 0.4, 0] }, spin: 0 },
  ],
  build({ stage }) {
    stage.floor.visible = false;
    const root = new THREE.Group(); stage.root.add(root);
    const plate = box(7.2, 0.5, 5.6, M.metal(0x6c727e, { roughness: 0.45 })); plate.position.y = -0.25; root.add(plate);
    const pit = new THREE.Mesh(new THREE.CircleGeometry(1, 40), M.ghost(COL.rustDark, 0.55)); pit.rotation.x = -Math.PI / 2; pit.position.y = 0.004; root.add(pit);
    const cath = ring(1, COL.e, 0.6, 0.035); cath.position.y = 0.01; root.add(cath);
    const rustRing = ring(1, COL.rust, 0.5, 0.05); rustRing.position.y = 0.012; root.add(rustRing);
    const drop = dome(1, 0.6, M.clear(0x9fd0ff, 0.2, { roughness: 0.05 })); root.add(drop);
    const grpE = new THREE.Group(), grpI = new THREE.Group(), grpO = new THREE.Group(); root.add(grpE, grpI, grpO);
    const NF = 40, NE = 70, NH = 40, NO = 24;
    const fe = dots(grpI, NF, 0.075, COL.fe), oh = dots(grpI, NH, 0.06, COL.oh), el = dots(grpE, NE, 0.04, COL.e, 6);
    const oa = dots(grpO, NO, 0.055, COL.o2), ob = dots(grpO, NO, 0.055, COL.o2);
    const L = {
      an: stage.label('Anode (centre): Fe → Fe²⁺ + 2e⁻', [0, 0.1, 0], root, 'hot'),
      ca: stage.label('Cathode (edge): O₂ + 2H₂O + 4e⁻ → 4OH⁻', [0, 0.1, 0], root, 'hot'),
      ee: stage.label('Electrons run through the metal', [0, -0.5, 0], root),
      ii: stage.label('Ions run through the water', [0, 1, 0], root),
    };
    let T = 0;
    return {
      update(dt, st) {
        const R = st.drop, h = 0.3 + 0.27 * R;
        const oxC = clamp(1.05 - 0.42 * R, 0.1, 1), sep = (1 - oxC) / 0.9;
        const ra = lerp(0.7, 0.3, sep) * R, I = st.ox * (0.4 + 0.6 * sep);
        T += dt * I;
        drop.scale.set(R, h, R);
        pit.scale.set(ra, ra, 1); cath.scale.setScalar(R * 0.9); rustRing.scale.setScalar(lerp(ra, R * 0.9, 0.5));
        grpE.visible = st.show === 'all' || st.show === 'e';
        grpI.visible = st.show === 'all' || st.show === 'ions';
        grpO.visible = st.show === 'all' || st.show === 'o2';
        const vis = (i, n, f) => i / n < f;
        // iron ions leave the anode and rise into the water
        for (let i = 0; i < NF; i++) {
          if (!vis(i, NF, clamp(I * 1.1, 0, 1))) { fe.hide(i); continue; }
          const q = T * 0.45 + i / NF, c = Math.floor(q), p = q - c;
          const a = hash(i, c, 1) * 6.283, r0 = ra * Math.sqrt(hash(i, c, 2)), r = r0 + p * 0.3 * (R - r0);
          fe.at(i, Math.cos(a) * r, 0.05 + p * h * 0.6, Math.sin(a) * r, 1 - p * p * p);
        }
        // electrons travel outward inside the metal
        for (let i = 0; i < NE; i++) {
          if (!vis(i, NE, clamp(I * 1.1, 0, 1))) { el.hide(i); continue; }
          const q = T * 0.9 + i / NE * 3.7, c = Math.floor(q), p = q - c;
          const a = hash(i, 0, 3) * 6.283, r0 = ra * 0.4 * hash(i, c, 4), r = lerp(r0, R * 0.92, p);
          el.at(i, Math.cos(a) * r, -0.1 - 0.12 * hash(i, 0, 5), Math.sin(a) * r, 1);
        }
        // hydroxide ions come in from the edge
        for (let i = 0; i < NH; i++) {
          if (!vis(i, NH, clamp(I * 1.1, 0, 1))) { oh.hide(i); continue; }
          const q = T * 0.4 + i / NH, c = Math.floor(q), p = q - c;
          const a = hash(i, c, 6) * 6.283, r = lerp(R * 0.9, ra * 0.95, p);
          oh.at(i, Math.cos(a) * r, 0.06 + 0.1 * Math.sin(Math.PI * p), Math.sin(a) * r, Math.sin(Math.PI * Math.min(1, p * 1.2)) + 0.05);
        }
        // oxygen enters from the air and heads for the cathode ring
        for (let i = 0; i < NO; i++) {
          if (!vis(i, NO, st.ox)) { oa.hide(i); ob.hide(i); continue; }
          const q = T0(i) + (T * 0.5 + i / NO), c = Math.floor(q), p = q - c;
          const a = hash(i, c, 7) * 6.283, ph = 0.25 + hash(i, c, 8) * 1.2;
          const sx = R * Math.cos(ph) * Math.cos(a), sy = h * Math.sin(ph), sz = R * Math.cos(ph) * Math.sin(a);
          const tx = R * 0.9 * Math.cos(a), tz = R * 0.9 * Math.sin(a);
          const x = lerp(sx, tx, p), y = lerp(sy, 0.05, p), z = lerp(sz, tz, p), sc = 1 - Math.pow(p, 6);
          oa.at(i, x - 0.05, y, z, sc); ob.at(i, x + 0.05, y, z, sc);
        }
        [fe, oh, el, oa, ob].forEach((d) => d.done());
        L.an.position.set(0, -0.62, 0);
        L.ca.position.set(R * 0.95 + 0.2, h * 0.7 + 0.5, 0);
        L.ee.position.set(R * 0.5, -0.9, R * 0.3);
        L.ii.position.set(-R * 0.55, h + 0.5, 0);
        L.ca.element.style.opacity = L.an.element.style.opacity = '1';
      },
      readout(st) {
        const R = st.drop, oxC = clamp(1.05 - 0.42 * R, 0.1, 1), sep = (1 - oxC) / 0.9, I = st.ox * (0.4 + 0.6 * sep);
        const say = st.ox < 0.05 ? 'No oxygen to take the electrons, so the cell stalls. Iron barely dissolves.' : sep < 0.35 ? 'A small drop: oxygen reaches everywhere, so the anode and cathode are not well separated and the cell is weak.' : 'A wide drop: the centre is starved of oxygen and becomes the anode. The edge is the cathode.';
        return `<div class="big">${sep < 0.35 ? 'Weak cell' : 'Anode in the centre'}</div><p class="r-say">${say}</p>
          <div class="row"><span>Oxygen at the centre</span><b>${Math.round(oxC * 100)}% of the edge's</b></div>
          <div class="row"><span>Cell current (cartoon)</span><b>${Math.round(I * 100)}%</b></div>${bar(I, 'var(--c)')}`;
      },
    };
    function T0(i) { return hash(i, 9, 9); }
  },
};
