// Chapter 3: what speeds rust. Salt makes the water film a better conductor, so the little cell runs faster. A water film is needed
// (dry air gives almost no rusting), heat speeds up chemistry, acid adds H+ that also takes electrons, and touching a less reactive
// metal such as copper makes iron the anode of a bigger cell. Touching a more reactive metal such as zinc makes zinc the anode and
// protects the iron. All factors below are a cartoon built to show the direction and rough size of each effect, not a measured law.
import { THREE, M, box, COL, dots, bar, mix, clamp, lerp, smooth } from '../rust.js';

const hash = (i, k) => { const v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return v - Math.floor(v); };
const OTHER = { none: null, cu: { n: 'Copper', col: COL.cu }, zn: { n: 'Zinc', col: COL.zn } };

function rates(s) {
  const cond = 1 + 4 * Math.sqrt(s.salt);
  const temp = Math.pow(2, (s.temp - 20) / 10);
  const film = 0.03 + 0.97 * smooth((s.hum - 40) / 45);
  const acid = Math.pow(10, 0.12 * (7 - s.ph));
  const base = cond * temp * film * acid;
  const fe = base * (s.touch === 'cu' ? 2.2 : s.touch === 'zn' ? 0.04 : 1);
  const zn = s.touch === 'zn' ? base * 0.8 : 0;
  const lvl = (r) => clamp((Math.log10(Math.max(r, 1e-3)) + 1.7) / 4, 0, 1);
  return { cond, temp, film, acid, fe, zn, lFe: lvl(fe), lZn: lvl(zn) };
}

export default {
  id: 'speed',
  short: 'What speeds it up',
  title: 'What makes iron rust faster',
  subtitle: 'Salt, wet air, heat, acid and the wrong neighbour all turn up the battery.',
  view: { pos: [1, 3.4, 6.6], target: [0, 0.6, 0.3] },
  learn: `<p>Anything that helps the little cell run makes iron rust faster. <b>Salt</b> in the water makes it a much better <b>conductor</b>, so the ions can carry current more easily. That is why cars rust fast where roads are salted and ships rust fast at sea. <b>Water</b> itself is needed: in dry air there is hardly a film for the cell to form in. <b>Heat</b> speeds up most chemical reactions, and <b>acid</b> adds H⁺ ions that also accept electrons.</p>
    <p>The <b>neighbouring metal</b> matters too. Iron touching a less reactive metal such as <b>copper</b> becomes the anode of a larger cell and rusts faster. Iron touching a more reactive metal such as <b>zinc</b> is the cathode. The zinc is eaten instead, and the iron is protected. That second trick is used on purpose, as the later chapters show.</p>
    <p class="tip"><b>Try it:</b> raise the salt, then switch the neighbouring metal between copper and zinc and watch the corrosion meter.</p>
    <p class="note">The numbers are a cartoon. They show direction and rough size, not measured rates.</p>`,
  terms: [
    { t: 'Conductivity', d: 'How easily a material carries electric current. Salty water carries it far better than pure water.' },
    { t: 'Galvanic corrosion', d: 'Extra corrosion of the more reactive of two different metals that touch in a wet place.' },
    { t: 'Electrolyte', d: 'A liquid with ions in it that can carry current. Salt water is a strong one.' },
    { t: 'pH', d: 'A scale of how acidic water is. Lower numbers are more acidic. 7 is neutral.' },
  ],
  defaults: { salt: 0, hum: 90, temp: 20, ph: 7, touch: 'none' },
  controls: [
    { key: 'salt', type: 'range', label: 'Salt in the water', min: 0, max: 1, step: 0.01, fmt: (v) => (v < 0.02 ? 'None' : v < 0.7 ? `${(v * 5).toFixed(1)}% salt` : `${(v * 5).toFixed(1)}% (sea water is ~3.5%)`) },
    { key: 'hum', type: 'range', label: 'Humidity', min: 20, max: 100, step: 1, fmt: (v) => `${Math.round(v)}%`, hint: 'Little water film in dry air, so little rust.' },
    { key: 'temp', type: 'range', label: 'Temperature', min: 0, max: 60, step: 1, fmt: (v) => `${Math.round(v)} °C` },
    { key: 'ph', type: 'range', label: 'Acidity', min: 3, max: 7, step: 0.05, fmt: (v) => (v > 6.8 ? 'Neutral (pH 7)' : `pH ${v.toFixed(1)}`) },
    { key: 'touch', type: 'seg', label: 'Touching iron', options: [{ v: 'none', label: 'Nothing' }, { v: 'cu', label: 'Copper' }, { v: 'zn', label: 'Zinc' }] },
  ],
  quiz: [
    { q: 'Why does salt speed up rusting?', options: ['It is a catalyst that is used up', 'It makes the water a better conductor, so the cell runs faster', 'It makes iron softer', 'It dries the iron'], answer: 1, why: 'Salt gives the water many mobile ions, so current flows more easily between anode and cathode.' },
    { q: 'What happens to iron touching copper in a wet place?', options: ['It is protected', 'It rusts faster, because iron is the more reactive metal and becomes the anode', 'Nothing', 'It turns to copper'], answer: 1, why: 'Copper is less reactive. Iron is the one that gives up electrons.' },
    { q: 'What happens to iron touching zinc?', options: ['The zinc corrodes in its place and the iron is protected', 'Both rust faster', 'The iron is eaten faster', 'Nothing changes'], answer: 0, why: 'Zinc is more reactive, so it is the anode. This is sacrificial protection.' },
    { q: 'Why does iron barely rust in very dry air?', options: ['Iron does not react with oxygen at all', 'There is almost no water film to carry the ions', 'Dry air is acidic', 'The iron is too cold'], answer: 1, why: 'Without a water film the electrochemical cell cannot run.' },
  ],
  reel: [
    { ms: 5600, caption: 'Salt water makes iron rust fast, and so does a copper neighbour. Touch iron to zinc and the zinc is eaten instead.', set: { salt: 0, hum: 90, temp: 20, ph: 7, touch: 'cu' }, anim: { salt: [0, 0.7] }, view: { pos: [0.8, 3.2, 6.2], target: [0, 0.6, 0.3] }, spin: 0 },
  ],
  build({ stage }) {
    stage.floor.visible = false;
    const root = new THREE.Group(); stage.root.add(root);
    const tray = box(8.4, 0.2, 4, M.plastic(0x1d2330)); tray.position.y = -0.1; root.add(tray);
    const film = box(8, 1, 3.6, M.clear(0x5aa0ff, 0.12, { roughness: 0.05 })); root.add(film);
    const ironMat = M.metal(COL.iron, { roughness: 0.4 });
    const fe = box(3.1, 0.5, 0.9, ironMat); fe.position.set(-1.6, 0.25, 0); root.add(fe);
    const otherMat = M.metal(COL.cu, { roughness: 0.3 });
    const ot = box(3.1, 0.5, 0.9, otherMat); ot.position.set(1.6, 0.25, 0); root.add(ot);
    const contact = box(0.06, 0.52, 0.92, M.glow(0xffffff)); contact.position.set(0, 0.25, 0); root.add(contact);
    const ionFe = dots(root, 60, 0.075, COL.fe), ionZn = dots(root, 50, 0.075, COL.zn), el = dots(root, 70, 0.04, COL.e, 6);
    const na = dots(root, 50, 0.05, COL.na, 6), cl = dots(root, 50, 0.05, COL.cl, 6), hp = dots(root, 40, 0.045, COL.coral, 6);
    const lf = stage.label('Iron', [-1.6, 0.9, 1.3], root, 'hot');
    const lo = stage.label('', [1.6, 0.9, 1.3], root, 'hot');
    stage.label('Thin water film', [-3.3, 0.5, 1.9], root);
    let T = 0, R = rates({ salt: 0, hum: 90, temp: 20, ph: 7, touch: 'none' });
    return {
      update(dt, st) {
        R = rates(st);
        T += dt * (0.3 + R.lFe * 1.4 + R.lZn);
        const fh = 0.04 + 0.52 * smooth((st.hum - 30) / 60);
        film.scale.y = fh; film.position.y = fh / 2; film.material.opacity = 0.03 + 0.12 * smooth((st.hum - 30) / 60);
        ot.visible = st.touch !== 'none'; contact.visible = ot.visible;
        const o = OTHER[st.touch];
        if (o) { otherMat.color.setHex(o.col); lo.element.textContent = o.n; }
        lo.element.style.display = ot.visible ? '' : 'none';
        ironMat.color.copy(mix(COL.iron, COL.rust, smooth((R.lFe - 0.5) / 0.5)));
        ironMat.roughness = lerp(0.4, 0.9, R.lFe);
        // ions leaving iron
        for (let i = 0; i < 60; i++) {
          if (i / 60 > R.lFe * 1.05) { ionFe.hide(i); continue; }
          const q = T * 0.5 + hash(i, 1), c = Math.floor(q), p = q - c;
          const xr = st.touch === 'none' ? [-3, -1.9] : [-3, -0.15];
          const x = lerp(xr[0], xr[1], hash(i + c * 7, 2)), z = (hash(i + c * 3, 3) - 0.5) * 0.7;
          ionFe.at(i, x + (hash(i, 9) - 0.5) * 0.3 * p, 0.5 + p * 0.55, z + (hash(i, 8) - 0.5) * 0.6 * p, 1 - p * p * p);
        }
        for (let i = 0; i < 50; i++) {
          if (i / 50 > R.lZn * 1.05) { ionZn.hide(i); continue; }
          const q = T * 0.5 + hash(i, 4), c = Math.floor(q), p = q - c;
          const x = lerp(0.15, 3, hash(i + c * 5, 5)), z = (hash(i + c * 3, 6) - 0.5) * 0.7;
          ionZn.at(i, x + (hash(i, 7) - 0.5) * 0.3 * p, 0.5 + p * 0.55, z, 1 - p * p * p);
        }
        // electrons from the anode metal to the cathode metal
        const xa = st.touch === 'zn' ? 2.6 : st.touch === 'cu' ? -2.6 : -2.6, xc = st.touch === 'zn' ? -2.6 : st.touch === 'cu' ? 2.6 : -0.6;
        const lE = st.touch === 'zn' ? R.lZn : R.lFe;
        for (let i = 0; i < 70; i++) {
          if (i / 70 > lE * 1.05) { el.hide(i); continue; }
          const p = (T * 0.7 + hash(i, 10) * 3) % 1;
          el.at(i, lerp(xa, xc, p), 0.25 + (hash(i, 11) - 0.5) * 0.3, (hash(i, 12) - 0.5) * 0.6, 1);
        }
        // salt ions and acid in the film
        const nS = Math.round(50 * smooth(st.salt * 1.4)), nH = Math.round(40 * clamp((7 - st.ph) / 4, 0, 1));
        for (let i = 0; i < 50; i++) {
          if (i >= nS) { na.hide(i); cl.hide(i); continue; }
          const sp = 0.1 + 0.2 * R.temp, tt = T * sp;
          const x = ((hash(i, 13) * 8 + tt * 1.2 + 40) % 8) - 4, x2 = ((hash(i, 14) * 8 - tt * 1.2 + 40) % 8) - 4;
          const y = 0.08 + Math.min(fh, 0.5) * hash(i, 15) + Math.sin(T * 3 + i) * 0.015;
          na.at(i, x, y, (hash(i, 16) - 0.5) * 3.2, fh > 0.1 ? 1 : 0); cl.at(i, x2, y + 0.02, (hash(i, 17) - 0.5) * 3.2, fh > 0.1 ? 1 : 0);
        }
        for (let i = 0; i < 40; i++) {
          if (i >= nH) { hp.hide(i); continue; }
          const y = 0.08 + Math.min(fh, 0.5) * hash(i, 18);
          hp.at(i, (hash(i, 19) - 0.5) * 7.4 + Math.sin(T * 2 + i) * 0.05, y, (hash(i, 20) - 0.5) * 3.2, fh > 0.1 ? 1 : 0);
        }
        [ionFe, ionZn, el, na, cl, hp].forEach((d) => d.done());
      },
      readout(st) {
        const r = rates(st), ref = rates({ salt: 0, hum: 90, temp: 20, ph: 7, touch: 'none' }).fe;
        const x = r.fe / ref;
        const who = st.touch === 'zn' ? 'The zinc is eaten, and the iron is protected.' : st.touch === 'cu' ? 'Iron is the anode of a bigger cell. It rusts faster.' : st.hum < 55 ? 'Dry air, so there is little water film. Rust is slow.' : 'Iron on its own in a thin film of water.';
        return `<div class="big">Iron: ${x < 0.1 ? 'almost stopped' : x > 1.1 ? '×' + (x < 10 ? x.toFixed(1) : Math.round(x)) + ' faster' : x < 0.9 ? '×' + x.toFixed(2) + ' (slower)' : 'baseline rate'}</div><p class="r-say">${who}</p>
          <div class="row"><span>Iron corrosion rate</span><b>${x < 0.1 ? '<0.1' : x.toFixed(x < 10 ? 1 : 0)}× baseline</b></div>${bar(r.lFe, 'linear-gradient(90deg,#ffb547,#ff7a59)')}
          ${st.touch === 'zn' ? `<div class="row"><span>Zinc corrosion rate</span><b>${(r.zn / ref).toFixed(1)}× baseline</b></div>${bar(r.lZn, 'linear-gradient(90deg,#8ef0ff,#c49bff)')}` : ''}
          <div class="row"><span>Conductivity</span><b>${r.cond.toFixed(1)}×</b></div><div class="row"><span>Water film</span><b>${Math.round(r.film * 100)}%</b></div>`;
      },
    };
  },
};
