// Chapter 6: rust and other corrosion. Aluminium, copper and weathering steel (Cor-Ten) also corrode, but their corrosion products
// stick, are dense, and slow further attack. Plain steel's rust flakes and does not. The times, thicknesses and rates are a cartoon
// that shows the shape of each story (flaking and continuing, thin and stopping, slow colour change, fast then slowing),
// not measured values for any particular climate.
import { THREE, M, box, COL, bar, mix, clamp, lerp, smooth } from '../rust.js';

const hash = (i, k) => { const v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return v - Math.floor(v); };
const MET = {
  steel: { n: 'Plain steel', x: -4.2, col: 0x8c929e, say: 'Rust is bulky and flaky. It cracks off and the attack carries on into fresh metal, year after year.' },
  al: { n: 'Aluminium', x: -1.4, col: 0xc6ccd6, say: 'Aluminium is very reactive, but its oxide forms in a moment, only nanometres thick, and sticks tight. It seals the surface.' },
  cu: { n: 'Copper', x: 1.4, col: 0xd9814a, say: 'Copper slowly darkens, then over decades turns green as a layer of copper compounds, the patina, builds. It is thin and protective.' },
  cor: { n: 'Weathering steel', x: 4.2, col: 0x8c929e, say: 'Weathering steel (Cor-Ten) contains small amounts of other metals. Its rust forms a tight, dark layer that slows further attack, as long as it gets wet and dry cycles.' },
};
// returns metal lost (0..0.6), layer thickness, layer colour for each metal at t years
function state(id, t) {
  if (id === 'steel') { const loss = Math.min(0.6, 0.035 * t); return { loss, layer: 2.2 * loss, col: mix(COL.rustPale, COL.rust, smooth(t / 3)).lerp(new THREE.Color(COL.rustDark), smooth((t - 10) / 40) * 0.3) }; }
  if (id === 'al') return { loss: 0.012 * Math.log10(1 + t), layer: 0.05 * (1 - Math.exp(-t * 6)) + 0.02, col: mix(0xc6ccd6, 0xaab0ba, smooth(t / 20)) };
  if (id === 'cu') return { loss: 0.03 * smooth(t / 30), layer: 0.04 + 0.09 * smooth(t / 30), col: t < 3 ? mix(0xe08a52, 0x6b3f26, smooth(t / 3)) : mix(0x6b3f26, 0x4aa896, smooth((t - 3) / 25)) };
  return { loss: 0.2 * (1 - Math.exp(-t / 5)), layer: 0.45 * (1 - Math.exp(-t / 4)) + 0.02, col: mix(COL.rust, 0x5b3a33, smooth(t / 8)) };
}

export default {
  id: 'others',
  short: 'Other corrosion',
  title: 'Rust and other corrosion',
  subtitle: 'Aluminium, copper and weathering steel corrode too, but they seal themselves in.',
  view: { pos: [2.2, 2.6, 11], target: [0, 1.4, 0] },
  learn: `<p>“Rust” means corroded iron or steel. Other metals corrode as well, and the story depends on what the corrosion product <b>does</b>. On <b>aluminium</b>, a thin oxide film of just a few nanometres forms at once, sticks tightly and stops further attack, so a very reactive metal can last for decades outdoors. On <b>copper</b>, a slow patina of copper compounds turns the metal brown and finally <b>green</b>, as on old roofs and statues, and the layer protects what is under it.</p>
    <p><b>Weathering steel</b>, sold as Cor-Ten, is steel with small amounts of copper, chromium, nickel and phosphorus. It rusts at first, but its rust forms a dense, dark layer that slows the attack, so it can be used unpainted on bridges and sculptures. Plain steel's rust never seals: it flakes and the attack continues.</p>
    <p>The bill for all of this is huge. A 2016 NACE study estimated the global cost of corrosion at roughly <b>US$2.5 trillion a year</b>, about <b>3.4 percent</b> of world GDP. Published estimates vary, but they tend to land in the range of a few percent of GDP.</p>
    <p class="tip"><b>Try it:</b> slide <b>Time</b> from months to decades and compare the four. Watch which ones keep losing metal.</p>
    <p class="note">The times and thicknesses are a cartoon. Real rates depend a lot on climate, salt and pollution.</p>`,
  terms: [
    { t: 'Patina', d: 'A thin layer that forms on a metal over time. On copper it is green and protective.' },
    { t: 'Passivation', d: 'When a metal surface forms a thin oxide layer that slows further corrosion.' },
    { t: 'Weathering steel', d: 'Steel with small amounts of copper, chromium, nickel or phosphorus whose rust forms a protective layer. Often sold as Cor-Ten.' },
    { t: 'Corrosion', d: 'The slow chemical or electrochemical attack of a metal by its surroundings. Rust is the corrosion of iron.' },
  ],
  defaults: { years: 5, focus: 'steel' },
  controls: [
    { key: 'years', type: 'log', label: 'Time', min: 0.1, max: 50, fmt: (v) => (v < 1 ? `${Math.round(v * 12)} months` : `${v < 10 ? v.toFixed(1) : Math.round(v)} years`) },
    { key: 'focus', type: 'seg', label: 'Explain', options: Object.entries(MET).map(([v, m]) => ({ v, label: m.n })) },
  ],
  quiz: [
    { q: 'Why does aluminium last outdoors although it is a very reactive metal?', options: ['It does not react at all', 'A thin, tight oxide film forms at once and seals the surface', 'It is heavier than steel', 'It is painted at the factory'], answer: 1, why: 'The oxide is only nanometres thick and sticks, so further attack is very slow.' },
    { q: 'What is the green on old copper roofs?', options: ['Paint', 'Patina, a layer of copper compounds', 'Algae only', 'Iron rust'], answer: 1, why: 'Copper carbonates, sulfates and chlorides build up over decades.' },
    { q: 'How can weathering steel such as Cor-Ten go unpainted?', options: ['It does not rust', 'Its rust forms a dense, adherent layer that slows further attack', 'It is made of aluminium', 'It rusts faster'], answer: 1, why: 'Small additions of copper, chromium, nickel and phosphorus help the rust layer become protective.' },
    { q: 'Published estimates of the yearly cost of corrosion are usually about…', options: ['A few percent of GDP', 'Under 0.001% of GDP', 'Half of all GDP', 'Zero'], answer: 0, why: 'The 2016 NACE estimate was about 3.4% of world GDP.' },
  ],
  reel: [
    { ms: 5400, caption: 'Steel rust flakes and keeps going. Aluminium, copper and weathering steel seal themselves in.', set: { years: 0.2, focus: 'steel' }, anim: { years: [0.2, 45, true] }, view: { pos: [2, 2.4, 11], target: [0, 1.4, 0] }, spin: 0 },
  ],
  build({ stage }) {
    stage.floor.visible = false;
    const root = new THREE.Group(); stage.root.add(root);
    const items = {};
    for (const [id, m] of Object.entries(MET)) {
      const metalMat = M.metal(m.col, { roughness: 0.35 });
      const metal = box(2.2, 1, 1.8, metalMat); root.add(metal);
      const lm = M.matte(0xb7410e, { roughness: 0.95 });
      const slabs = id === 'steel' ? [0, 1, 2].map((k) => { const s = box(0.72, 1, 1.8, lm); root.add(s); return s; }) : [box(2.2, 1, 1.8, lm)];
      if (id !== 'steel') root.add(slabs[0]);
      const base = box(2.4, 0.3, 2, M.matte(0x2a2f3a)); base.position.set(m.x, -1.4, 0); root.add(base);
      metal.position.x = m.x;
      const lab = stage.label(m.n, [m.x, 1.5, 0], root);
      items[id] = { metal, metalMat, lm, slabs, lab };
    }
    const ghost = box(11.6, 0.012, 1.9, M.ghost(0xffffff, 0.3)); root.add(ghost);
    stage.label('Original surface', [-5.7, 0, 1], root);
    return {
      update(dt, st) {
        for (const [id, m] of Object.entries(MET)) {
          const o = items[id], S = state(id, st.years), top = -S.loss;
          o.metal.scale.y = 1.2 - S.loss; o.metal.position.y = -S.loss - (1.2 - S.loss) / 2 + 0;
          o.metal.scale.y = (1.2 - S.loss) / 1; o.metal.position.set(m.x, -S.loss - (1.2 - S.loss) / 2, 0);
          o.lm.color.copy(S.col);
          if (id === 'steel') o.slabs.forEach((s, k) => { const h = Math.max(0.001, S.layer * (0.55 + 0.45 * hash(k, 3))); s.scale.set(1, h, 1); s.position.set(m.x - 0.75 + k * 0.75 + (k - 1) * 0.04 * smooth(st.years / 10), top + h / 2, 0); s.rotation.z = (k - 1) * 0.06 * smooth(st.years / 10); });
          else { const h = Math.max(0.001, S.layer); o.slabs[0].scale.set(1, h, 1); o.slabs[0].position.set(m.x, top + h / 2, 0); }
          o.lab.element.classList.toggle('hot', st.focus === id);
        }
      },
      readout(st) {
        const f = MET[st.focus];
        const rows = Object.entries(MET).map(([id, m]) => { const S = state(id, st.years); return `<div class="row"><span>${m.n}</span><b>${Math.round((S.loss / 0.6) * 100)}% lost</b></div>`; }).join('');
        return `<div class="big">${f.n}</div><p class="r-say">${f.say}</p>${rows}<p class="note" style="margin:4px 0 0">Metal lost is a cartoon scale, not a measurement.</p>`;
      },
    };
  },
};
