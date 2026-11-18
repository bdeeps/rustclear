// Chapter 4: stopping rust. A cross-section of steel with a coating and an optional scratch with a water drop in it.
// Barriers (paint, oil, tin) work only while unbroken. Tin is less reactive than iron, so at a scratch the iron is the anode.
// Zinc is more reactive than iron, so at a scratch the zinc corrodes instead and keeps protecting the steel nearby.
// Stainless steel (about 10.5 % or more chromium) grows a very thin chromium-rich oxide film that re-forms if scratched in air.
// The depths, speeds and widths are a cartoon of these ideas, not measurements.
import { THREE, M, box, COL, dots, dome, bar, clamp, lerp, smooth } from '../rust.js';

const hash = (i, k) => { const v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return v - Math.floor(v); };
const COATS = {
  none: { n: 'Bare steel', col: null },
  paint: { n: 'Paint', col: 0x3f86e0, th: 0.14 },
  zinc: { n: 'Zinc (galvanised)', col: 0xaab8e0, th: 0.14 },
  tin: { n: 'Tin plate', col: 0xe8ebef, th: 0.1 },
  stain: { n: 'Stainless', col: 0x9fe8ff, th: 0.05 },
  oil: { n: 'Oil', col: 0xffc65c, th: 0.07 },
};
const G0 = 0.28, DEP = 1.1;

// geometry of the scene as a function of coating, scratch and time
function plan(s) {
  const c = s.coat, t = s.time, sc = s.scratch;
  let g = sc ? G0 : 0, w = 0, depth = 0, zloss = 0, op = 1, who = '';
  if (c === 'none') { w = 3; depth = 0.55 * t; who = 'Rust everywhere: nothing keeps the water and air off.'; }
  else if (c === 'paint') { if (sc) { w = g + 0.9 * t; depth = 0.35 * t; who = 'Paint is a barrier. At the scratch the steel rusts, and rust creeps under the paint.'; } else who = 'Unbroken paint keeps water and oxygen away from the steel. A barrier only works while it is whole.'; }
  else if (c === 'zinc') { if (sc) { g = G0 + 0.9 * t; zloss = t; who = 'Zinc is more reactive than iron, so the zinc corrodes at the scratch and the steel stays protected.'; } else who = 'The zinc layer is a barrier first, and a sacrificial layer if it is ever broken.'; }
  else if (c === 'tin') { if (sc) { w = g + 0.35 * t; depth = 0.95 * t; who = 'Tin is less reactive than iron. At a scratch, the steel is the anode and corrodes, faster than bare steel would.'; } else who = 'Unbroken tin is a good barrier. Once scratched it can make things worse.'; }
  else if (c === 'stain') { if (sc) { g = G0 * (1 - smooth(t * 4)); who = 'The chromium-rich oxide film is only a few nanometres thick. Scratch it in air and it re-forms.'; } else who = 'Chromium in the steel makes a thin, tight, invisible oxide film that seals the surface.'; }
  else if (c === 'oil') { g = 0; op = 1 - smooth((t - 0.2) / 0.5); const k = Math.max(0, (t - 0.55) / 0.45); w = 3 * smooth(k * 3); depth = 0.55 * k; who = t < 0.55 ? 'A thin film of oil keeps water and air off the metal for a while.' : 'The oil has worn off. Without a fresh coat the steel rusts like bare steel.'; }
  return { g, w, depth, zloss, op, who };
}

export default {
  id: 'coat',
  short: 'Stopping rust',
  title: 'Stopping rust',
  subtitle: 'Paint, zinc, tin, chromium and oil. Some wall the metal off. One sacrifices itself.',
  view: { pos: [1.0, 2.0, 6.0], target: [0, 0.0, 0] },
  learn: `<p>There are two ways to stop rust: keep <b>water and oxygen</b> away from the iron, or make something else give up the electrons. <b>Paint</b>, <b>oil</b> and <b>tin plating</b> are barriers. They work while they are whole. A scratch lets water in, and then the exposed steel is the anode of a tiny cell, with rust growing at the scratch and creeping under the coating.</p>
    <p><b>Tin is a trap</b>: it is less reactive than iron, so at a scratch the iron is eaten even faster. <b>Galvanised</b> steel is coated with <b>zinc</b>, which is more reactive than iron. It is a barrier, and when scratched, the zinc corrodes in the steel's place. <b>Stainless steel</b> contains chromium, which forms a very thin, tight oxide film that heals itself in air.</p>
    <p class="tip"><b>Try it:</b> pick a coating, switch the <b>scratch</b> on and slide <b>Time</b>. Compare tin with zinc.</p>
    <p class="note">The drawing is a cartoon. Real coatings differ in thickness and behaviour, and tin inside food cans can act differently.</p>`,
  terms: [
    { t: 'Barrier coating', d: 'A layer that keeps water and oxygen off the metal, such as paint, oil or plastic. It fails when broken.' },
    { t: 'Galvanising', d: 'Coating steel with zinc. The zinc is a barrier and also corrodes first if the coating is scratched.' },
    { t: 'Sacrificial protection', d: 'Letting a more reactive metal corrode so that the metal you care about does not.' },
    { t: 'Passive film', d: 'A very thin oxide layer on a metal surface that slows further attack. Stainless steel has one rich in chromium.' },
  ],
  defaults: { coat: 'tin', scratch: true, time: 0.5 },
  controls: [
    { key: 'coat', type: 'seg', label: 'Protection', options: Object.entries(COATS).map(([v, c]) => ({ v, label: c.n })) },
    { key: 'scratch', type: 'toggle', label: 'Scratched at one spot' },
    { key: 'time', type: 'range', label: 'Time', min: 0, max: 1, step: 0.002, fmt: (v) => (v < 0.2 ? 'Early' : v < 0.6 ? 'Months' : 'Years') },
  ],
  quiz: [
    { q: 'Why can a scratched tin-plated steel sheet rust faster than bare steel?', options: ['Tin is more reactive than iron', 'Tin is less reactive than iron, so the exposed iron is the anode', 'Tin is magnetic', 'Tin dissolves in water'], answer: 1, why: 'Tin takes the electrons and iron gives them up, so the iron at the scratch is eaten.' },
    { q: 'Why does galvanised steel stay protected at a scratch?', options: ['Zinc is more reactive than iron, so zinc corrodes instead', 'Zinc is thicker than paint', 'Zinc is heavier', 'Water cannot get in'], answer: 0, why: 'Zinc is the sacrificial anode, so the steel next to it is the cathode and does not dissolve.' },
    { q: 'What makes stainless steel “stainless”?', options: ['A coat of paint', 'Chromium in the steel, which forms a very thin, self-healing oxide film', 'It contains no iron', 'It is heavier'], answer: 1, why: 'The chromium-rich oxide film seals the surface and re-forms when scratched in air.' },
    { q: 'What is the main limit of paint and oil as protection?', options: ['They work only while unbroken or in place', 'They attract water', 'They are magnetic', 'They conduct electricity'], answer: 0, why: 'A barrier fails where it is scratched, chipped or worn away.' },
  ],
  reel: [
    { ms: 5200, caption: 'Paint, tin and oil only work while they are whole. Scratch tin and the steel rusts, even faster.', set: { coat: 'tin', scratch: true, time: 0.05 }, anim: { time: [0.05, 1] }, view: { pos: [1.0, 1.9, 5.6], target: [0, 0.0, 0] }, spin: 0 },
    { ms: 5200, caption: 'Zinc is more reactive than iron. Scratch galvanised steel and the zinc gives itself up instead.', set: { coat: 'zinc', scratch: true, time: 0.05 }, anim: { time: [0.05, 1] }, view: { pos: [-1.0, 1.9, 5.6], target: [0, 0.0, 0] }, spin: 0 },
  ],
  build({ stage }) {
    stage.floor.visible = false;
    const root = new THREE.Group(); stage.root.add(root);
    const steelMat = M.metal(0x8e95a3, { roughness: 0.38 });
    const steel = box(6, 1.2, 2, steelMat); steel.position.y = -0.6; root.add(steel);
    const coatMat = M.plastic(0x3f86e0, { roughness: 0.35 });
    const L = box(1, 1, 2, coatMat), Rr = box(1, 1, 2, coatMat), full = box(6, 1, 2, coatMat); root.add(L, Rr, full);
    const rustMat = M.matte(COL.rust, { roughness: 0.95 });
    const pit = box(1, 1, 2, rustMat); root.add(pit);
    const drop = dome(0.95, 0.5, M.clear(0x9fd0ff, 0.25, { roughness: 0.05 })); drop.position.y = 0.0; root.add(drop);
    const fe = dots(root, 40, 0.07, COL.fe), zn = dots(root, 40, 0.07, COL.zn), el = dots(root, 40, 0.04, COL.e, 6);
    const lc = stage.label('', [-2.2, 0.7, 1.1], root, 'hot');
    const ld = stage.label('Water drop in the scratch', [0, 1.0, 0], root);
    const lp = stage.label('', [0, -1.0, 1.1], root);
    let T = 0, P = plan({ coat: 'tin', scratch: true, time: 0.5 });
    return {
      update(dt, st) {
        T += dt;
        const c = COATS[st.coat]; P = plan(st);
        const col = c.col, th = c.th || 0.1;
        L.visible = Rr.visible = full.visible = false;
        steelMat.color.setHex(st.coat === 'stain' ? 0xc4cdd8 : 0x8e95a3); steelMat.roughness = st.coat === 'stain' ? 0.22 : 0.38;
        if (col !== null) {
          coatMat.color.setHex(col); coatMat.transparent = st.coat === 'oil' || st.coat === 'stain'; coatMat.opacity = st.coat === 'oil' ? 0.55 * P.op + 0.001 : st.coat === 'stain' ? 0.5 : 1;
          coatMat.metalness = st.coat === 'zinc' || st.coat === 'tin' ? 0.8 : 0; coatMat.roughness = st.coat === 'zinc' ? 0.3 : 0.35; coatMat.needsUpdate = true;
          const g = P.g;
          if (g <= 0.001) { full.visible = true; full.scale.y = th; full.position.y = th / 2; }
          else {
            const zl = st.coat === 'zinc' ? 1 - 0.35 * P.zloss : 1, h = th * zl, wd = 3 - g;
            L.visible = Rr.visible = true;
            L.scale.set(wd, h, 1); L.position.set(-3 + wd / 2, h / 2, 0);
            Rr.scale.set(wd, h, 1); Rr.position.set(3 - wd / 2, h / 2, 0);
          }
        }
        pit.visible = P.depth > 0.01;
        if (pit.visible) {
          const wd = Math.min(3, Math.max(P.w, 0.05)) * 2, top = P.depth * 0.35;
          pit.scale.set(wd, P.depth + top, 1.01); pit.position.set(0, (top - P.depth) / 2, 0);
          if (st.coat === 'paint') pit.position.y -= 0.0;
        }
        const nFe = Math.round(40 * clamp(P.depth * 1.1, 0, 1)), nZn = Math.round(40 * clamp(P.zloss, 0, 1)) * (st.time > 0.01 ? 1 : 0);
        for (let i = 0; i < 40; i++) {
          if (i >= nFe) fe.hide(i); else { const q = T * 0.5 + hash(i, 1), cc = Math.floor(q), p = q - cc, x = (hash(i + cc, 2) - 0.5) * Math.max(0.3, Math.min(1.5, P.w)); fe.at(i, x, 0.05 + p * 0.7, (hash(i + cc, 3) - 0.5) * 1.2, 1 - p * p * p); }
          if (i >= nZn) zn.hide(i); else { const q = T * 0.5 + hash(i, 4), cc = Math.floor(q), p = q - cc, sg = hash(i, 5) < 0.5 ? -1 : 1, x = sg * (P.g - 0.05 + 0.1 * p); zn.at(i, x, 0.12 + p * 0.5, (hash(i + cc, 6) - 0.5) * 1.2, 1 - p * p * p); }
          if (st.coat === 'zinc' && P.zloss > 0 && i / 40 < 0.7) { const p = (T * 0.6 + hash(i, 7)) % 1, sg = hash(i, 8) < 0.5 ? -1 : 1; el.at(i, sg * lerp(P.g + 0.4, P.g + 0.05, p), 0.0 - 0.05 - p * 0.0, (hash(i, 9) - 0.5) * 1.4, 1); } else el.hide(i);
        }
        [fe, zn, el].forEach((d) => d.done());
        lc.element.textContent = col === null ? 'No coating' : c.n;
        lc.element.style.display = '';
        ld.position.set(0, 0.85, 0);
        lp.element.textContent = P.depth > 0.15 ? 'Rust under the scratch' : P.zloss > 0.1 ? 'Zinc used up first' : st.coat === 'stain' && st.scratch ? 'Oxide film re-forming' : '';
        lp.element.style.display = lp.element.textContent ? '' : 'none';
        lp.position.set(0, -DEP * 0.9, 1.1);
        drop.scale.set(st.coat === 'none' ? 0.01 : 0.95, 0.5, st.coat === 'none' ? 0.01 : 0.95);
        ld.element.style.display = st.coat === 'none' ? 'none' : '';
      },
      readout(st) {
        const P2 = plan(st), steelLoss = P2.depth / 1.2;
        const verdict = { none: 'Rusts everywhere', paint: st.scratch ? 'Rust at the scratch' : 'Sealed', zinc: st.scratch ? 'Zinc is sacrificed' : 'Sealed', tin: st.scratch ? 'Steel rusts fast at the scratch' : 'Sealed', stain: 'Self-healing film', oil: st.time < 0.55 ? 'Oiled' : 'Oil has worn off' }[st.coat];
        return `<div class="big">${verdict}</div><p class="r-say">${P2.who}</p>
          <div class="row"><span>Steel lost</span><b>${Math.round(steelLoss * 100)}% (of the block, cartoon)</b></div>${bar(steelLoss, 'linear-gradient(90deg,#ffb547,#ff7a59)')}
          ${st.coat === 'zinc' && st.scratch ? `<div class="row"><span>Zinc used up</span><b>${Math.round(P2.zloss * 100)}%</b></div>${bar(P2.zloss, 'linear-gradient(90deg,#8ef0ff,#c49bff)')}` : ''}`;
      },
    };
  },
};
