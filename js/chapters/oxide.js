// Chapter 2: from iron ions to rust. Fe2+ and OH- meet and form iron(II) hydroxide, Fe(OH)2, which oxygen oxidises to
// hydrated iron(III) oxide, Fe2O3.nH2O (rust). Rust is porous and takes up several times the volume of the iron it
// came from (a figure that varies with the form of rust and is sometimes quoted as 2 to 6 times), so it cracks and flakes and exposes fresh metal.
// The drawing is a cross-section cartoon: the rust layer, the loss of metal and the timing of the cracks are not to scale.
import { THREE, M, box, COL, dots, bar, mix, clamp, lerp, smooth } from '../rust.js';

const hash = (i, k) => { const v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return v - Math.floor(v); };
const NC = 8, H = 1.6, DMAX = 0.6;

export default {
  id: 'oxide',
  short: 'From ions to rust',
  title: 'From iron ions to rust',
  subtitle: 'Fe²⁺ meets OH⁻, oxygen finishes the job, and the result is a flaky solid that is bigger than the iron.',
  view: { pos: [1.8, 2.0, 7.6], target: [0, 0.5, 0] },
  learn: `<p>The iron ions Fe²⁺ from the anode and the hydroxide ions OH⁻ from the cathode meet in the water and make a pale greenish solid, <b>iron(II) hydroxide</b>: <b>Fe²⁺ + 2OH⁻ → Fe(OH)₂</b>. It does not last. Dissolved oxygen oxidises it further, to <b>iron(III)</b>, and the result is the orange-brown solid we call rust: <b>hydrated iron(III) oxide, Fe₂O₃·nH₂O</b>, where the water content <i>n</i> varies.</p>
    <p>Rust is <b>not a good seal</b>. It is porous and flaky, and it takes up <b>several times</b> the volume of the iron it came from (published figures vary with the form of rust, from about two to well over that). As the layer thickens it cracks and pieces flake off. Water and air get straight through to <b>fresh metal</b> underneath, and the cycle goes on. That is why rust keeps going, while the oxide on some other metals stops the attack.</p>
    <p class="tip"><b>Try it:</b> slide <b>Time</b> and watch the colour change, the metal shrink and the rust rise above the original surface. Then lower the <b>swelling</b> to 1×: with no extra volume the layer never cracks in this cartoon.</p>
    <p class="note">Real rust is a mixture of several iron oxides and hydroxides. This is a simplified picture of one.</p>`,
  terms: [
    { t: 'Iron(II) hydroxide', d: 'Fe(OH)₂, a pale greenish solid formed when Fe²⁺ meets OH⁻. It is quickly oxidised in air.' },
    { t: 'Hydrated iron(III) oxide', d: 'Fe₂O₃·nH₂O, the orange-brown solid that is rust. The n means a variable amount of water is locked in.' },
    { t: 'Oxidation', d: 'Losing electrons. Iron goes from Fe to Fe²⁺, then on to Fe³⁺ when oxygen oxidises it further.' },
    { t: 'Volume ratio', d: 'How much space the oxide takes up compared with the metal it came from. For rust it is above 1, so it pushes and cracks.' },
  ],
  defaults: { time: 0.1, ratio: 2.5 },
  controls: [
    { key: 'time', type: 'range', label: 'Time', min: 0, max: 1, step: 0.002, fmt: (v) => (v < 0.2 ? 'Hours' : v < 0.55 ? 'Weeks' : 'Years') },
    { key: 'ratio', type: 'range', label: 'Rust swells to', min: 1, max: 3, step: 0.05, fmt: (v) => `${v.toFixed(1)}× the iron`, hint: 'Published figures vary with the form of rust. This cartoon only goes up to 3×.' },
  ],
  quiz: [
    { q: 'What is the first solid made when Fe²⁺ meets OH⁻?', options: ['Iron(II) hydroxide, Fe(OH)₂', 'Pure iron', 'Salt', 'Iron(III) chloride'], answer: 0, why: 'Fe²⁺ + 2OH⁻ → Fe(OH)₂, a pale green solid.' },
    { q: 'What turns Fe(OH)₂ into rust?', options: ['Cold', 'More oxygen, which oxidises iron(II) to iron(III)', 'Light', 'Sound'], answer: 1, why: 'Oxygen oxidises it to hydrated iron(III) oxide, Fe₂O₃·nH₂O.' },
    { q: 'Why does rust keep eating iron instead of sealing it?', options: ['It is a solid wall', 'It is flaky and bulky, so it cracks and exposes fresh metal', 'It is magnetic', 'It is heavier than iron'], answer: 1, why: 'Rust takes up several times the volume, cracks and flakes, and lets water and air through again.' },
    { q: 'In the model, what happens if rust took up the same volume as the iron?', options: ['It cracks sooner', 'It would not be pushed apart and so would not crack', 'It turns green', 'It flies away'], answer: 1, why: 'The bulk of the rust is what forces the layer apart.' },
  ],
  reel: [
    { ms: 6000, caption: 'Iron ions meet hydroxide and oxygen makes rust. Rust is bulkier than the iron, so it cracks and flakes and exposes fresh metal.', set: { time: 0.02, ratio: 2.5 }, anim: { time: [0.02, 1] }, view: { pos: [1.8, 2.0, 7.2], target: [0, 0.5, 0] }, spin: 0 },
  ],
  build({ stage }) {
    stage.floor.visible = false;
    const root = new THREE.Group(); stage.root.add(root);
    const metal = box(8, 1, 2.4, M.metal(COL.iron, { roughness: 0.38 })); root.add(metal);
    const rustMat = M.matte(COL.green, { roughness: 0.95 });
    const cols = [];
    for (let i = 0; i < NC; i++) {
      const m = box(1, 1, 2.4, rustMat), gm = M.matte(COL.ironBright, { roughness: 0.6 }), g = box(1, 1, 2.4, gm);
      root.add(m, g); g.visible = false;
      cols.push({ m, g, gm, x: -3.5 + i, tc: 0.5 + 0.12 * hash(i, 1), df: 0.05 + 0.35 * hash(i, 2), sg: i % 2 ? 1 : -1, z: 1.9 + 0.7 * hash(i, 5), ry: (hash(i, 6) - 0.5) * 0.8 });
    }
    const base = box(8.6, 0.9, 5.6, M.matte(0x2a2f3a)); base.position.set(0, -H - 0.5, 0.6); root.add(base);
    const ghost = box(8, 0.012, 2.45, M.ghost(0xffffff, 0.4)); ghost.position.y = 0; root.add(ghost);
    const NI = 36;
    const fe = dots(root, NI, 0.07, COL.fe), oh = dots(root, NI, 0.06, COL.oh);
    const lo = stage.label('Original surface', [-4.2, 0, 1.2], root);
    const lr = stage.label('Rust', [0, 1.3, 1.3], root, 'hot');
    const lm = stage.label('Iron', [0, -H * 0.55, 1.3], root);
    let T = 0, info = { fallen: 0, cracked: 0 };
    return {
      update(dt, st) {
        T += dt;
        const t = st.time, d = DMAX * t, r = st.ratio;
        metal.scale.y = (H - d) / 1; metal.position.y = -d - (H - d) / 2;
        const chem = smooth((t - 0.08) / 0.3);
        rustMat.color.copy(mix(COL.green, COL.rust, chem)).lerp(new THREE.Color(COL.rustDark), smooth((t - 0.5) / 0.5) * 0.35);
        let fallen = 0, cracked = 0;
        cols.forEach((c) => {
          const th = r * d, crack = clamp((th - c.tc) / 0.25, 0, 1);
          const dc = (c.tc + 0.25) / r, tfall = dc / DMAX + c.df; // time at which this slab breaks off
          const f = r > 1.0 && crack >= 1 ? clamp((t - tfall) / 0.12, 0, 1) : 0;
          if (crack > 0) cracked++;
          if (f >= 1) fallen++;
          const w = 1 - 0.28 * crack;
          c.g.visible = f >= 1;
          if (f <= 0) {
            c.m.scale.set(w, Math.max(0.001, th), 1); c.m.position.set(c.x, -d + th / 2, 0); c.m.rotation.set(0, 0, c.sg * crack * 0.1);
          } else {
            const e = smooth(f), hh = lerp(th, 0.28, e);
            c.m.scale.set(w, hh, 1);
            c.m.position.set(c.x + c.sg * e * 0.9, lerp(-d + th / 2, -H + hh / 2 + 0.05, e * e), lerp(0, c.z, e));
            c.m.rotation.set(0, c.ry * e, c.sg * lerp(0.1, 0.25, e));
          }
          if (f >= 1) {
            const h2 = Math.max(0.001, Math.min(0.4, r * Math.max(0, d - dc - c.df * DMAX)));
            c.g.scale.set(1, h2, 1); c.g.position.set(c.x, -d + h2 / 2, 0);
            c.gm.color.copy(mix(COL.ironBright, COL.rust, smooth(h2 / 0.25)));
          }
        });
        // ions meeting near the surface in the first stage
        const act = 1 - smooth((t - 0.2) / 0.25);
        for (let i = 0; i < NI; i++) {
          const k = (T * 0.4 + i / NI) % 1;
          const x = -3.6 + 7.2 * hash(i, 3), z = (hash(i, 4) - 0.5) * 2, yb = -d + 0.05;
          if (act < 0.02 || i / NI > act) { fe.hide(i); oh.hide(i); continue; }
          fe.at(i, x, yb + 0.05 + k * 0.5, z, 1 - Math.pow(k, 4)); oh.at(i, x + 0.12 + 0.2 * (1 - k), yb + 0.8 - k * 0.4, z, 1 - Math.pow(k, 4));
        }
        fe.done(); oh.done();
        const top = -d + r * d;
        lr.position.set(0, Math.max(top, 0) + 0.45, 1.3);
        lm.position.set(0, -d - (H - d) * 0.5, 1.3);
        lr.element.innerHTML = t < 0.1 ? 'Fe(OH)₂ forms' : t < 0.35 ? 'Fe(OH)₂ turning into rust' : 'Rust: Fe₂O₃·nH₂O';
        info = { fallen, cracked };
      },
      readout(st) {
        const t = st.time, d = DMAX * t, f = info;
        const stage_ = t < 0.1 ? ['Fe²⁺ + 2OH⁻ → Fe(OH)₂', 'Iron(II) hydroxide forms where the ions meet. It is pale and greenish.'] : t < 0.35 ? ['Fe(OH)₂ + O₂ → rust', 'Oxygen oxidises iron(II) to iron(III). The solid turns orange-brown.'] : f.fallen ? ['Cracking and flaking', 'The bulky layer has split and slabs have come away. Fresh metal is bare again.'] : f.cracked ? ['Cracking', 'The layer is being pushed apart because it is bigger than the iron it replaced.'] : ['A growing layer of rust', st.ratio <= 1.05 ? 'With no swelling the layer just sits there. This is not how rust behaves.' : 'The layer gets thicker, and it is pushing up above the original surface.'];
        return `<div class="big">${stage_[0]}</div><p class="r-say">${stage_[1]}</p>
          <div class="row"><span>Iron lost</span><b>${Math.round((d / H) * 100)}% of the block</b></div>${bar(d / H)}
          <div class="row"><span>Slabs cracked / fallen</span><b>${f.cracked} / ${f.fallen} of ${NC}</b></div>`;
      },
    };
  },
};
