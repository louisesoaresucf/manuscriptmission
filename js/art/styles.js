// Scenery pieces for the two style samples (see js/style.js):
//   painted - a page from a Book of Hours: diapered gold-and-blue backgrounds,
//             a tiled floor, a vine border and a historiated initial;
//   dark    - rough-hewn stone, tattered banners, cobwebs, torchlight and fog.
import { P } from './defs.js';
import { fleur, rng } from './scenery.js';

const INK = `stroke="${P.ink}" stroke-linejoin="round" stroke-linecap="round"`;
const o = (w = 3) => `${INK} stroke-width="${w}"`;

export function styleDefs() {
  // Rough-hewn blocks of uneven sizes for the dark style.
  const r = rng(77);
  let blocks = '';
  for (let row = 0; row < 4; row++) {
    let x = row % 2 ? -60 : 0;
    while (x < 480) {
      const w = 90 + r() * 90, y = row * 70;
      const j = () => (r() - 0.5) * 6;
      const shade = ['#4a4138', '#433a32', '#51473c', '#3d352d'][Math.floor(r() * 4)];
      blocks += `<path d="M${x + 4 + j()},${y + 4 + j()} L${x + w - 4 + j()},${y + 4 + j()} L${x + w - 4 + j()},${y + 66 + j()} L${x + 4 + j()},${y + 66 + j()} Z" fill="${shade}" stroke="#1c1712" stroke-width="5" stroke-linejoin="round"/>`;
      blocks += `<path d="M${x + 10},${y + 12} L${x + w - 14},${y + 10}" stroke="#7a6d5c" stroke-opacity="0.35" stroke-width="3"/>`;
      if (r() < 0.5) blocks += `<path d="M${x + w * 0.3},${y + 20} l${8 + r() * 10},${14 + r() * 10} l${-4},${10}" fill="none" stroke="#1c1712" stroke-width="2" stroke-opacity="0.6"/>`;
      x += w;
    }
  }
  return `
  <defs>
    <pattern id="pt-diaper" width="90" height="90" patternUnits="userSpaceOnUse">
      <rect width="90" height="90" fill="#2a49a6"/>
      <path d="M45,0 L90,45 L45,90 L0,45 Z" fill="#23408f"/>
      <path d="M45,0 L90,45 L45,90 L0,45 Z" fill="none" stroke="#e2bd52" stroke-width="3"/>
      <g fill="#e2bd52" stroke="#7a5a12" stroke-width="0.8">
        <circle cx="45" cy="45" r="5"/><circle cx="45" cy="34" r="3"/><circle cx="45" cy="56" r="3"/><circle cx="34" cy="45" r="3"/><circle cx="56" cy="45" r="3"/>
      </g>
      <g fill="#c53a2a"><circle cx="0" cy="0" r="6"/><circle cx="90" cy="0" r="6"/><circle cx="0" cy="90" r="6"/><circle cx="90" cy="90" r="6"/></g>
      <g fill="#f3e3a0"><circle cx="0" cy="0" r="2"/><circle cx="90" cy="0" r="2"/><circle cx="0" cy="90" r="2"/><circle cx="90" cy="90" r="2"/></g>
    </pattern>
    <pattern id="pt-chequer" width="120" height="120" patternUnits="userSpaceOnUse">
      <rect width="120" height="120" fill="#d8b46a"/>
      <rect width="60" height="60" fill="#2f7a55"/><rect x="60" y="60" width="60" height="60" fill="#2f7a55"/>
      <g fill="none" stroke="#f1dc96" stroke-width="2"><rect x="8" y="8" width="44" height="44"/><rect x="68" y="68" width="44" height="44"/></g>
      <g fill="#a2301f"><path d="M90,22 l8,8 l-8,8 l-8,-8 Z"/><path d="M30,82 l8,8 l-8,8 l-8,-8 Z"/></g>
      <path d="M0,0 H120 V120 H0 Z M60,0 V120 M0,60 H120" fill="none" stroke="#3a2614" stroke-width="2.5"/>
    </pattern>
    <pattern id="dk-stone" width="480" height="280" patternUnits="userSpaceOnUse">
      <rect width="480" height="280" fill="#2a241e"/>
      ${blocks}
    </pattern>
    <pattern id="dk-flags" width="220" height="140" patternUnits="userSpaceOnUse">
      <rect width="220" height="140" fill="#2e2822"/>
      <path d="M4,4 L118,6 L114,66 L6,64 Z M126,4 L216,8 L214,68 L122,64 Z M6,74 L76,72 L80,136 L4,134 Z M86,74 L212,76 L216,136 L84,134 Z" fill="#3c342c" stroke="#16120e" stroke-width="5" stroke-linejoin="round"/>
      <path d="M30,30 l18,10 M150,40 l12,-8 M110,100 l20,6" stroke="#16120e" stroke-width="2" stroke-opacity="0.7"/>
    </pattern>
    <radialGradient id="dk-glow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#ffb055" stop-opacity="0.55"/><stop offset="0.45" stop-color="#ff8a2a" stop-opacity="0.18"/><stop offset="1" stop-color="#ff8a2a" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="dk-fog" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#9aa4b8" stop-opacity="0.32"/><stop offset="1" stop-color="#9aa4b8" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="dk-moonbeam" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#b8c8ff" stop-opacity="0.3"/><stop offset="1" stop-color="#b8c8ff" stop-opacity="0"/>
    </linearGradient>
  </defs>`;
}

// ---------- painted ----------

// The page's border: a gold-and-colour frame with a scrolling vine,
// ivy leaves in gold, blue and red, and burnished gold bezants.
export function paintedBorder() {
  const r = rng(23);
  let s = `
  <rect x="10" y="10" width="1580" height="980" fill="none" stroke="#f1e6c8" stroke-width="34"/>
  <rect x="10" y="10" width="1580" height="980" fill="none" stroke="${P.ink}" stroke-width="2"/>
  <rect x="27" y="27" width="1546" height="946" fill="none" stroke="${P.goldMid}" stroke-width="6"/>
  <rect x="31" y="31" width="1538" height="938" fill="none" stroke="${P.ink}" stroke-width="1.6"/>`;
  const leafColours = ['#2a49a6', '#c53a2a', '#d9a92a', '#2f7a55'];
  const vine = (pts) => {
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) d += ` L${pts[i][0]},${pts[i][1]}`;
    return `<path d="${d}" fill="none" stroke="${P.ink}" stroke-width="2.4"/>`;
  };
  const leaf = (x, y, rot, i) => `<path d="M0,0 C-5,-5 -5,-12 0,-16 C5,-12 5,-5 0,0 Z" transform="translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${rot.toFixed(0)})" fill="${leafColours[i % 4]}" ${o(1.1)}/>`;
  const bezant = (x, y) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.2" fill="${P.goldMid}" ${o(1)}/><circle cx="${(x - 1.2).toFixed(1)}" cy="${(y - 1.2).toFixed(1)}" r="1.4" fill="#fff6c8"/>`;
  // Along the top and bottom.
  for (const y0 of [10, 990]) {
    const pts = [];
    for (let x = 30; x <= 1570; x += 10) pts.push([x, y0 + Math.sin(x / 40) * 7]);
    s += vine(pts);
    for (let x = 50, i = 0; x < 1560; x += 40, i++) {
      const y = y0 + Math.sin(x / 40) * 7;
      s += i % 3 === 2 ? bezant(x, y + (i % 2 ? 9 : -9)) : leaf(x, y, (i % 2 ? 150 : -30) + r() * 20, i);
    }
  }
  // Down the sides.
  for (const x0 of [10, 1590]) {
    const pts = [];
    for (let y = 30; y <= 970; y += 10) pts.push([x0 + Math.sin(y / 40) * 7, y]);
    s += vine(pts);
    for (let y = 60, i = 0; y < 960; y += 40, i++) {
      const x = x0 + Math.sin(y / 40) * 7;
      s += i % 3 === 2 ? bezant(x + (i % 2 ? 9 : -9), y) : leaf(x, y, (i % 2 ? 60 : -120) + r() * 20, i);
    }
  }
  return s + historiatedInitial(30, 30, 150);
}

// A large initial M in the corner, in pink and white on blue, framed in gold.
export function historiatedInitial(x, y, size) {
  const k = size / 150;
  return `
  <g transform="translate(${x},${y}) scale(${k})">
    <rect x="0" y="0" width="150" height="150" fill="${P.goldMid}" ${o(3)}/>
    <rect x="9" y="9" width="132" height="132" fill="#2a49a6" ${o(2)}/>
    <g fill="none" stroke="#f3e3a0" stroke-width="1.6" opacity="0.8">
      <path d="M18,30 C30,20 40,40 52,28 M98,28 C110,40 120,20 132,30 M18,120 C30,110 40,130 52,118 M98,118 C110,130 120,110 132,120"/>
    </g>
    <path d="M30,122 L30,40 C30,30 40,28 46,36 L75,78 L104,36 C110,28 120,30 120,40 L120,122 L104,122 L104,64 L80,98 L70,98 L46,64 L46,122 Z" fill="#d9677a" ${o(2.5)}/>
    <path d="M36,116 L36,44 M114,116 L114,44 M50,50 L75,86 L100,50" fill="none" stroke="#fbe2e6" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="75" cy="52" r="10" fill="${P.goldMid}" ${o(1.6)}/>
    <path d="M75,45 l2,5 l5,0 l-4,3 l2,5 l-5,-3 l-5,3 l2,-5 l-4,-3 l5,0 Z" fill="#c53a2a"/>
  </g>`;
}

// ---------- dark ----------

// A banner worn to rags: dark cloth with a torn, jagged bottom edge.
export function tatteredBanner(x, y, w, h, colour, edge) {
  const r = rng(Math.round(x));
  let tear = `M${x + w},${y + h * 0.7}`;
  for (let i = 1; i <= 8; i++) {
    const tx = x + w - (w * i) / 8;
    tear += ` L${(tx + (r() - 0.5) * 8).toFixed(1)},${(y + h * (0.6 + r() * 0.4)).toFixed(1)}`;
  }
  const d = `M${x},${y} H${x + w} V${y + h * 0.7} ${tear.slice(tear.indexOf('L'))} Z`;
  return `
  <path d="M${x - 10},${y} H${x + w + 10}" stroke="#2a1a0e" stroke-width="10" stroke-linecap="round"/>
  <path d="${d}" fill="${colour}" ${o(3)}/>
  <path d="M${x + 10},${y + 30} V${y + h * 0.55} M${x + w - 10},${y + 30} V${y + h * 0.5}" stroke="${edge}" stroke-width="3" stroke-opacity="0.6"/>
  <path d="M${x + w * 0.3},${y + 40} l6,30 l-4,20 M${x + w * 0.7},${y + 60} l-5,24" stroke="#000" stroke-opacity="0.4" stroke-width="2"/>
  <rect x="${x}" y="${y}" width="${w}" height="26" fill="#2a1a0e" ${o(3)}/>
  <g opacity="0.55">${fleur(x + w / 2, y + h * 0.4, w * 0.28)}</g>`;
}

// A torch bracket with a living flame, and its light flickering on the wall.
export function darkTorch(x, y, delay = 0) {
  return `
  <path d="M${x - 14},${y + 40} L${x},${y + 20} L${x + 14},${y + 40}" fill="none" stroke="#2c2722" stroke-width="6" stroke-linejoin="round"/>
  <rect x="${x - 18}" y="${y + 36}" width="36" height="12" rx="3" fill="#3a2a1e" ${o(2)}/>
  <path d="M${x - 7},${y + 22} L${x - 5},${y - 14} L${x + 5},${y - 14} L${x + 7},${y + 22} Z" fill="#2a1a0e" ${o(2.5)}/>
  <path d="M${x - 11},${y - 12} L${x + 11},${y - 12} L${x + 9},${y - 2} L${x - 9},${y - 2} Z" fill="#5a3418" ${o(2)}/>
  <g class="dk-flame" style="animation-delay:${delay}s; transform-origin:${x}px ${y - 10}px">
    <path d="M${x},${y - 72} C${x + 9},${y - 52} ${x + 20},${y - 40} ${x + 13},${y - 21} C${x + 9},${y - 13} ${x - 9},${y - 13} ${x - 13},${y - 21} C${x - 19},${y - 36} ${x - 6},${y - 44} ${x - 4},${y - 57} C${x - 1},${y - 48} ${x + 2},${y - 50} ${x},${y - 72} Z" fill="#e8501a"/>
    <path d="M${x},${y - 52} C${x + 5},${y - 40} ${x + 9},${y - 32} ${x + 6},${y - 22} C${x + 4},${y - 17} ${x - 4},${y - 17} ${x - 6},${y - 22} C${x - 8},${y - 30} ${x - 2},${y - 38} ${x},${y - 52} Z" fill="#ffb03a"/>
    <path d="M${x},${y - 38} C${x + 3},${y - 30} ${x + 4},${y - 25} ${x + 2},${y - 21} L${x - 2},${y - 21} C${x - 4},${y - 25} ${x - 2},${y - 31} ${x},${y - 38} Z" fill="#fff2b0"/>
  </g>`;
}

// Moving light and fog, drawn over the room (cheap CSS animations).
export function darkAtmosphere(lights) {
  const glows = lights.map(([x, y, rad], i) => `<circle class="dk-flicker" style="animation-delay:${(i * 0.37).toFixed(2)}s" cx="${x}" cy="${y}" r="${rad}" fill="url(#dk-glow)"/>`).join('');
  return `
  <g class="dk-atmos" pointer-events="none">
    ${glows}
    <g class="dk-fogbank">
      <ellipse cx="300" cy="930" rx="520" ry="90" fill="url(#dk-fog)"/>
      <ellipse cx="1100" cy="950" rx="620" ry="100" fill="url(#dk-fog)"/>
      <ellipse cx="1900" cy="930" rx="520" ry="90" fill="url(#dk-fog)"/>
    </g>
  </g>`;
}
