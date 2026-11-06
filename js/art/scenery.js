// Library scenery: walls, windows, shelves, furniture and the clutter of
// fallen books. All coordinates are in scene units (rooms are 1600×1000).
import { P } from './defs.js';

export const W = {
  wood: '#7a4e2a',
  woodDark: '#55331a',
  woodLight: '#a8713f',
  iron: '#4a4540',
};

const INK = `stroke="${P.ink}" stroke-linejoin="round" stroke-linecap="round"`;
const o = (w = 3) => `${INK} stroke-width="${w}"`;
const BOOK_COLOURS = [P.vermilion, P.lapis, P.verdigris, P.ochre, W.woodDark, P.rose, P.violet, P.vermilionDark, P.lapisDark];

// Deterministic pseudo-random numbers so each room looks the same every time.
export function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// ---------- shared scene <defs> ----------
function stonePattern(id, base, mortar, speck) {
  return `
  <pattern id="${id}" width="160" height="80" patternUnits="userSpaceOnUse">
    <rect width="160" height="80" fill="${base}"/>
    <path d="M0,0 H160 M0,40 H160 M0,80 H160 M40,0 V40 M120,0 V40 M0,40 V80 M80,40 V80 M160,40 V80" stroke="${mortar}" stroke-width="3"/>
    <path d="M6,6 H34 M46,6 H114 M126,6 H154 M6,46 H74 M86,46 H154" stroke="#ffffff" stroke-opacity="0.12" stroke-width="2"/>
    <circle cx="22" cy="24" r="1.6" fill="${speck}"/><circle cx="96" cy="18" r="1.4" fill="${speck}"/>
    <circle cx="140" cy="28" r="1.2" fill="${speck}"/><circle cx="40" cy="62" r="1.5" fill="${speck}"/>
    <circle cx="116" cy="66" r="1.3" fill="${speck}"/>
  </pattern>`;
}

export function sceneDefs() {
  return `
  <defs>
    ${stonePattern('sc-stone-warm', '#dcc79c', '#b59a6a', '#a88c5c')}
    ${stonePattern('sc-stone-cool', '#c9c1ae', '#9a917c', '#8a826e')}
    ${stonePattern('sc-stone-dark', '#8f8371', '#6a5f50', '#5d5345')}
    <pattern id="sc-tiles" width="100" height="100" patternUnits="userSpaceOnUse">
      <rect width="100" height="100" fill="#b5653a"/>
      <rect width="50" height="50" fill="#d9a35c"/><rect x="50" y="50" width="50" height="50" fill="#d9a35c"/>
      <path d="M25,10 L40,25 L25,40 L10,25 Z M75,60 L90,75 L75,90 L60,75 Z" fill="#b5653a"/>
      <path d="M75,10 L90,25 L75,40 L60,25 Z M25,60 L40,75 L25,90 L10,75 Z" fill="#d9a35c"/>
      <path d="M0,0 H100 V100 M50,0 V100 M0,50 H100" stroke="${P.ink}" stroke-opacity="0.35" stroke-width="2" fill="none"/>
    </pattern>
    <pattern id="sc-tiles-blue" width="100" height="100" patternUnits="userSpaceOnUse">
      <rect width="100" height="100" fill="#3b4f86"/>
      <rect width="50" height="50" fill="#d8c79d"/><rect x="50" y="50" width="50" height="50" fill="#d8c79d"/>
      <circle cx="25" cy="25" r="9" fill="#b8322a" opacity="0.8"/><circle cx="75" cy="75" r="9" fill="#b8322a" opacity="0.8"/>
      <path d="M0,0 H100 V100 M50,0 V100 M0,50 H100" stroke="${P.ink}" stroke-opacity="0.35" stroke-width="2" fill="none"/>
    </pattern>
    <pattern id="sc-flags" width="180" height="120" patternUnits="userSpaceOnUse">
      <rect width="180" height="120" fill="#6e6457"/>
      <path d="M0,0 H180 M0,60 H180 M70,0 V60 M140,0 V60 M30,60 V120 M110,60 V120" stroke="#4a4238" stroke-width="4"/>
      <path d="M10,10 L50,14 M90,70 L130,74" stroke="#ffffff" stroke-opacity="0.08" stroke-width="3"/>
    </pattern>
    <pattern id="sc-glass-day" width="28" height="28" patternUnits="userSpaceOnUse">
      <rect width="28" height="28" fill="#a9cdec"/>
      <path d="M14,0 L28,14 L14,28 L0,14 Z" fill="#c7e0f4"/>
      <path d="M14,0 L28,14 L14,28 L0,14 Z" fill="none" stroke="${W.iron}" stroke-width="2"/>
    </pattern>
    <pattern id="sc-glass-night" width="28" height="28" patternUnits="userSpaceOnUse">
      <rect width="28" height="28" fill="#1b2550"/>
      <path d="M14,0 L28,14 L14,28 L0,14 Z" fill="#24326a"/>
      <path d="M14,0 L28,14 L14,28 L0,14 Z" fill="none" stroke="#14110e" stroke-width="2"/>
    </pattern>
    <pattern id="sc-woodgrain" width="60" height="16" patternUnits="userSpaceOnUse">
      <rect width="60" height="16" fill="${W.wood}"/>
      <path d="M0,5 C15,3 30,7 60,4 M0,12 C20,14 40,10 60,12" stroke="${W.woodDark}" stroke-width="1.6" fill="none"/>
    </pattern>
    <pattern id="sc-stars" width="90" height="70" patternUnits="userSpaceOnUse">
      <rect width="90" height="70" fill="#1c2c66"/>
      <path d="M20,14 l2,5 l5,2 l-5,2 l-2,5 l-2,-5 l-5,-2 l5,-2 Z M66,44 l2,5 l5,2 l-5,2 l-2,5 l-2,-5 l-5,-2 l5,-2 Z" fill="${P.goldMid}"/>
      <circle cx="58" cy="12" r="1.6" fill="${P.goldPale}"/><circle cx="16" cy="54" r="1.4" fill="${P.goldPale}"/><circle cx="40" cy="34" r="1.1" fill="${P.goldPale}"/>
    </pattern>
    <pattern id="sc-glass-jewel" width="36" height="36" patternUnits="userSpaceOnUse">
      <rect width="36" height="36" fill="#2b4fa8"/>
      <path d="M18,0 L36,18 L18,36 L0,18 Z" fill="#b8322a"/>
      <path d="M18,9 L27,18 L18,27 L9,18 Z" fill="#e8c35a"/>
      <path d="M0,0 L9,9 M36,0 L27,9 M0,36 L9,27 M36,36 L27,27" stroke="#2f7d5b" stroke-width="5"/>
      <path d="M18,0 L36,18 L18,36 L0,18 Z M18,9 L27,18 L18,27 L9,18 Z" fill="none" stroke="${W.iron}" stroke-width="2.2"/>
    </pattern>
    <radialGradient id="sc-torchlight" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#ffcf6a" stop-opacity="0.55"/>
      <stop offset="0.45" stop-color="#ffb347" stop-opacity="0.18"/>
      <stop offset="1" stop-color="#ffb347" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="sc-arcane" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#b58cf0" stop-opacity="0.4"/>
      <stop offset="0.7" stop-color="#7d4fd0" stop-opacity="0.15"/>
      <stop offset="1" stop-color="#7d4fd0" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="sc-ceiling-shadow" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#140c06" stop-opacity="0.55"/>
      <stop offset="0.35" stop-color="#140c06" stop-opacity="0.12"/>
      <stop offset="0.6" stop-color="#140c06" stop-opacity="0"/>
      <stop offset="1" stop-color="#140c06" stop-opacity="0.28"/>
    </linearGradient>
    <linearGradient id="sc-glassbeam" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffe9a8" stop-opacity="0.35"/>
      <stop offset="1" stop-color="#ffe9a8" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="sc-vignette" cx="0.5" cy="0.5" r="0.75">
      <stop offset="0.3" stop-color="#1a1008" stop-opacity="0.05"/>
      <stop offset="0.75" stop-color="#1a1008" stop-opacity="0.5"/>
      <stop offset="1" stop-color="#1a1008" stop-opacity="0.85"/>
    </radialGradient>
    <radialGradient id="sc-candlelight" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#ffd27a" stop-opacity="0.35"/>
      <stop offset="1" stop-color="#ffd27a" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="sc-sunbeam" x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0" stop-color="#fff6d0" stop-opacity="0.55"/>
      <stop offset="1" stop-color="#fff6d0" stop-opacity="0"/>
    </linearGradient>
  </defs>`;
}

// ---------- architecture ----------
export function wall(fill, floorY = 760, floorFill = 'url(#sc-tiles)') {
  return `
  <rect x="0" y="0" width="1600" height="${floorY}" fill="${fill}"/>
  <rect x="0" y="${floorY}" width="1600" height="${1000 - floorY}" fill="${floorFill}"/>
  <rect x="0" y="${floorY - 14}" width="1600" height="18" fill="${W.woodDark}" ${o(3)}/>
  <path d="M0,${floorY + 4} H1600" stroke="${P.ink}" stroke-width="4"/>`;
}

export function archWindow(x, y, w, h, night = false) {
  const r = w / 2;
  const glass = night ? 'url(#sc-glass-night)' : 'url(#sc-glass-jewel)';
  const d = `M${x},${y + h} L${x},${y + r} Q${x},${y} ${x + r},${y - r * 0.35} Q${x + w},${y} ${x + w},${y + r} L${x + w},${y + h} Z`;
  return `
  <path d="${d}" fill="${P.stoneLight}" ${o(4)} transform="translate(0,0)" stroke-width="4"/>
  <path d="${d}" fill="${glass}" ${o(3)} transform="translate(${x + r},${y + h}) scale(0.84,0.9) translate(${-(x + r)},${-(y + h)})"/>
  <path d="M${x + r},${y + 10} V${y + h}" stroke="${P.stoneLight}" stroke-width="10"/>
  <path d="M${x + r},${y + 10} V${y + h}" stroke="${P.ink}" stroke-width="2" opacity="0.6"/>
  <circle cx="${x + r}" cy="${y + r * 0.3}" r="${r * 0.28}" fill="${night ? '#24326a' : P.vermilion}" ${o(3)}/>
  <circle cx="${x + r}" cy="${y + r * 0.3}" r="${r * 0.12}" fill="${night ? '#3a4a86' : P.goldMid}" ${o(2)}/>
  <rect x="${x - 16}" y="${y + h}" width="${w + 32}" height="22" fill="${P.stoneLight}" ${o(3)}/>`;
}

export function roseWindow(cx, cy, r) {
  let petals = '';
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const px = cx + Math.cos(a) * r * 0.62, py = cy + Math.sin(a) * r * 0.62;
    petals += `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${(r * 0.26).toFixed(1)}" fill="${i % 2 ? P.lapis : P.vermilion}" ${o(3)}/>`;
    petals += `<line x1="${cx}" y1="${cy}" x2="${(cx + Math.cos(a) * r * 0.95).toFixed(1)}" y2="${(cy + Math.sin(a) * r * 0.95).toFixed(1)}" stroke="${W.iron}" stroke-width="5"/>`;
  }
  return `
  <circle cx="${cx}" cy="${cy}" r="${r + 22}" fill="${P.stoneLight}" ${o(4)}/>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#sc-glass-day)" ${o(4)}/>
  ${petals}
  <circle cx="${cx}" cy="${cy}" r="${r * 0.36}" fill="${P.verdigris}" ${o(3)}/>
  <circle cx="${cx}" cy="${cy}" r="${r + 10}" fill="none" stroke="${P.ink}" stroke-width="2" stroke-dasharray="2 14" stroke-linecap="round"/>`;
}

export function column(x, y, h, w = 60) {
  return `
  <rect x="${x}" y="${y + 30}" width="${w}" height="${h - 60}" fill="${P.stoneLight}" ${o(3)}/>
  <path d="M${x + w * 0.3},${y + 34} V${y + h - 34} M${x + w * 0.7},${y + 34} V${y + h - 34}" stroke="${P.stone}" stroke-width="3"/>
  <rect x="${x - 12}" y="${y}" width="${w + 24}" height="32" rx="4" fill="${P.stoneLight}" ${o(3)}/>
  <rect x="${x - 12}" y="${y + h - 32}" width="${w + 24}" height="32" rx="4" fill="${P.stoneLight}" ${o(3)}/>
  <path d="M${x - 6},${y + 16} H${x + w + 6}" stroke="${P.goldMid}" stroke-width="4"/>`;
}

export function banner(x, y, w, h, colour, diaper) {
  return `
  <path d="M${x - 10},${y} H${x + w + 10}" stroke="${W.woodDark}" stroke-width="10" stroke-linecap="round"/>
  <path d="M${x},${y} H${x + w} V${y + h} L${x + w / 2},${y + h - 40} L${x},${y + h} Z" fill="url(#${diaper})" ${o(3)}/>
  <path d="M${x + 12},${y + 12} H${x + w - 12} V${y + h - 30} L${x + w / 2},${y + h - 62} L${x + 12},${y + h - 30} Z" fill="none" stroke="${P.goldMid}" stroke-width="4"/>
  <rect x="${x}" y="${y}" width="${w}" height="28" fill="${colour}" ${o(3)}/>
  ${fleur(x + w / 2, y + h * 0.45, w * 0.32)}`;
}

// Heraldic fleur-de-lis in gold.
export function fleur(cx, cy, r) {
  return `
  <g transform="translate(${cx},${cy}) scale(${r / 30})" fill="${P.gold}" ${o(2)}>
    <path d="M0,-30 C10,-18 10,-6 0,6 C-10,-6 -10,-18 0,-30 Z"/>
    <path d="M-4,4 C-14,-8 -30,-6 -28,6 C-26,14 -16,12 -14,6 C-12,10 -8,10 -4,8 Z"/>
    <path d="M4,4 C14,-8 30,-6 28,6 C26,14 16,12 14,6 C12,10 8,10 4,8 Z"/>
    <rect x="-14" y="6" width="28" height="7" rx="2"/>
    <path d="M-5,13 L5,13 L3,28 L-3,28 Z"/>
  </g>`;
}

// A Gothic vaulted ceiling: pointed arches with a starry lapis vault above.
export function vault(y = 120, bay = 200, rise = 90) {
  let s = '';
  for (let x0 = 0; x0 < 1600; x0 += bay) {
    const x1 = x0 + bay, mid = x0 + bay / 2, top = y - rise;
    s += `<path d="M${x0},-2 L${x1},-2 L${x1},${y} C${x1},${y - rise * 0.55} ${mid + bay * 0.22},${top + 8} ${mid},${top} C${mid - bay * 0.22},${top + 8} ${x0},${y - rise * 0.55} ${x0},${y} Z" fill="url(#sc-stars)"/>`;
    const rib = `M${x0},${y} C${x0},${y - rise * 0.55} ${mid - bay * 0.22},${top + 8} ${mid},${top} C${mid + bay * 0.22},${top + 8} ${x1},${y - rise * 0.55} ${x1},${y}`;
    s += `<path d="${rib}" fill="none" stroke="${P.ink}" stroke-width="16"/>`;
    s += `<path d="${rib}" fill="none" stroke="${P.stoneLight}" stroke-width="11"/>`;
    s += `<path d="${rib}" fill="none" stroke="${P.goldMid}" stroke-width="2.5"/>`;
    s += `<path d="M${mid},${top - 4} L${mid},-2" stroke="${P.ink}" stroke-width="12"/><path d="M${mid},${top - 4} L${mid},-2" stroke="${P.stoneLight}" stroke-width="7"/>`;
    s += `<circle cx="${mid}" cy="${top - 2}" r="9" fill="${P.gold}" ${o(2.5)}/>`;
  }
  for (let x0 = 0; x0 <= 1600; x0 += bay) {
    s += `<path d="M${x0 - 18},${y} L${x0 + 18},${y} L${x0 + 10},${y + 26} L${x0 - 10},${y + 26} Z" fill="${P.stoneLight}" ${o(2.5)}/>`;
    s += `<path d="M${x0 - 14},${y + 6} H${x0 + 14}" stroke="${P.goldMid}" stroke-width="3"/>`;
  }
  return s;
}

// A burning wall torch in an iron bracket, with its pool of warm light.
export function torch(x, y) {
  return `
  <circle cx="${x}" cy="${y - 20}" r="230" fill="url(#sc-torchlight)"/>
  <path d="M${x - 14},${y + 40} L${x},${y + 20} L${x + 14},${y + 40}" fill="none" stroke="${W.iron}" stroke-width="6" stroke-linejoin="round"/>
  <rect x="${x - 18}" y="${y + 36}" width="36" height="12" rx="3" fill="${W.iron}" ${o(2)}/>
  <path d="M${x - 7},${y + 22} L${x - 5},${y - 14} L${x + 5},${y - 14} L${x + 7},${y + 22} Z" fill="${W.woodDark}" ${o(2.5)}/>
  <path d="M${x - 11},${y - 12} L${x + 11},${y - 12} L${x + 9},${y - 2} L${x - 9},${y - 2} Z" fill="${W.iron}" ${o(2)}/>
  <path d="M${x},${y - 70} C${x + 8},${y - 52} ${x + 18},${y - 40} ${x + 12},${y - 22} C${x + 9},${y - 14} ${x - 9},${y - 14} ${x - 12},${y - 22} C${x - 18},${y - 36} ${x - 6},${y - 44} ${x - 4},${y - 56} C${x - 1},${y - 48} ${x + 2},${y - 50} ${x},${y - 70} Z" fill="${P.vermilion}" ${o(2)}/>
  <path d="M${x},${y - 52} C${x + 5},${y - 40} ${x + 9},${y - 32} ${x + 6},${y - 22} C${x + 4},${y - 17} ${x - 4},${y - 17} ${x - 6},${y - 22} C${x - 8},${y - 30} ${x - 2},${y - 38} ${x},${y - 52} Z" fill="${P.ochre}"/>
  <path d="M${x},${y - 38} C${x + 3},${y - 30} ${x + 4},${y - 25} ${x + 2},${y - 21} L${x - 2},${y - 21} C${x - 4},${y - 25} ${x - 2},${y - 31} ${x},${y - 38} Z" fill="${P.goldPale}"/>`;
}

// Soft coloured light, e.g. sunlight through stained glass falling on the floor.
export function lightPool(cx, cy, rx, ry, colour, opacity = 0.22) {
  return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${colour}" opacity="${opacity}"/>`;
}

// Drifting motes and wisps of the witch's lingering spell.
export function spellMotes(rand, n, x0, x1, y0, y1) {
  const cols = ['#b58cf0', '#8ef0b8', P.goldPale, '#d9c2ff'];
  let s = '';
  for (let i = 0; i < n; i++) {
    const x = x0 + rand() * (x1 - x0), y = y0 + rand() * (y1 - y0), r = 3 + rand() * 5, c = cols[i % cols.length];
    s += i % 3 === 0
      ? `<path d="M${x},${y - r * 1.8} L${x + r * 0.4},${y - r * 0.4} L${x + r * 1.8},${y} L${x + r * 0.4},${y + r * 0.4} L${x},${y + r * 1.8} L${x - r * 0.4},${y + r * 0.4} L${x - r * 1.8},${y} L${x - r * 0.4},${y - r * 0.4} Z" fill="${c}" opacity="0.85"/>`
      : `<circle cx="${x}" cy="${y}" r="${r * 0.55}" fill="${c}" opacity="0.7"/>`;
  }
  return s;
}

export function spellWisp(d, colour = '#b58cf0') {
  return `<path d="${d}" fill="none" stroke="${colour}" stroke-width="5" stroke-linecap="round" opacity="0.25"/>
  <path d="${d}" fill="none" stroke="${colour}" stroke-width="2" stroke-linecap="round" stroke-dasharray="2 14" opacity="0.8"/>`;
}

// A glowing arcane circle: where the witch cast her spell.
export function arcaneCircle(cx, cy, rx, ry) {
  let runes = '';
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2, x = cx + Math.cos(a) * rx * 0.9, y = cy + Math.sin(a) * ry * 0.9;
    runes += `<path d="M${(x - 5).toFixed(0)},${(y - 3).toFixed(0)} l5,6 l5,-6 M${x.toFixed(0)},${(y - 5).toFixed(0)} v10" stroke="#d9c2ff" stroke-width="2" fill="none"/>`;
  }
  return `
  <ellipse cx="${cx}" cy="${cy}" rx="${rx * 1.25}" ry="${ry * 1.4}" fill="url(#sc-arcane)"/>
  <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="none" stroke="#b58cf0" stroke-width="5" opacity="0.9"/>
  <ellipse cx="${cx}" cy="${cy}" rx="${rx * 0.8}" ry="${ry * 0.8}" fill="none" stroke="#b58cf0" stroke-width="2.5" stroke-dasharray="10 8"/>
  <path d="M${cx - rx * 0.8},${cy} L${cx + rx * 0.8},${cy} M${cx},${cy - ry * 0.8} L${cx},${cy + ry * 0.8}" stroke="#b58cf0" stroke-width="2" opacity="0.7"/>
  ${runes}`;
}

// An illuminated border around the whole scene, like the margin of a page.
export function pageBorder(rand) {
  let s = `
  <rect x="7" y="7" width="1586" height="986" fill="none" stroke="${P.ink}" stroke-width="18"/>
  <rect x="7" y="7" width="1586" height="986" fill="none" stroke="${P.goldMid}" stroke-width="11"/>
  <rect x="7" y="7" width="1586" height="986" fill="none" stroke="${P.lapis}" stroke-width="4" stroke-dasharray="40 30"/>
  <rect x="7" y="7" width="1586" height="986" fill="none" stroke="${P.vermilion}" stroke-width="4" stroke-dasharray="30 40" stroke-dashoffset="35"/>
  <rect x="20" y="20" width="1560" height="960" fill="none" stroke="${P.ink}" stroke-width="2.5"/>`;
  // ivy leaves along the frame
  const leafAt = (x, y, rot) => `<path d="M0,0 C-6,-6 -6,-14 0,-18 C6,-14 6,-6 0,0 Z" transform="translate(${x},${y}) rotate(${rot})" fill="${P.verdigris}" ${o(1.5)}/>`;
  for (let x = 80; x < 1560; x += 120) { s += leafAt(x, 17, -60 + rand() * 30) + leafAt(x + 50, 983, 120 + rand() * 30); }
  for (let y = 90; y < 960; y += 130) { s += leafAt(17, y, 30 + rand() * 30) + leafAt(1583, y + 60, -150 + rand() * 30); }
  // corner roundels
  for (const [x, y] of [[16, 16], [1584, 16], [16, 984], [1584, 984]]) {
    s += `<circle cx="${x}" cy="${y}" r="24" fill="${P.lapis}" ${o(3)}/><circle cx="${x}" cy="${y}" r="24" fill="none" stroke="${P.goldMid}" stroke-width="5"/>${fleur(x, y + 2, 13)}`;
  }
  return s;
}


export function beam(y, x0 = 0, x1 = 1600) {
  return `<rect x="${x0}" y="${y}" width="${x1 - x0}" height="34" fill="url(#sc-woodgrain)" ${o(3)}/>`;
}

// ---------- furniture ----------
// A bookcase whose books have mostly tumbled out. `stand` lists books still
// standing on each shelf as [shelfIndex, xOffset, count].
export function bookcase(x, y, w, h, shelves, rand, stand = []) {
  const gap = h / shelves;
  let s = `
  <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${W.woodDark}" ${o(4)}/>
  <rect x="${x + 16}" y="${y + 16}" width="${w - 32}" height="${h - 24}" fill="#3d2513"/>`;
  for (let i = 1; i <= shelves; i++) {
    const sy = y + i * gap;
    s += `<rect x="${x + 8}" y="${sy - 14}" width="${w - 16}" height="16" fill="url(#sc-woodgrain)" ${o(2.5)}/>`;
  }
  for (const [shelf, xo, count] of stand) {
    const sy = y + (shelf + 1) * gap - 14;
    let bx = x + 20 + xo;
    for (let k = 0; k < count; k++) {
      const bh = gap * (0.5 + rand() * 0.25), bw = 16 + rand() * 12;
      const c = BOOK_COLOURS[Math.floor(rand() * BOOK_COLOURS.length)];
      const lean = k === count - 1 ? 14 : 0;
      s += bookSpine(bx, sy - bh, bw, bh, c, lean);
      bx += bw + 2;
    }
  }
  s += `
  <rect x="${x - 10}" y="${y - 20}" width="${w + 20}" height="26" fill="url(#sc-woodgrain)" ${o(3)}/>
  <rect x="${x - 6}" y="${y + h - 6}" width="${w + 12}" height="20" fill="url(#sc-woodgrain)" ${o(3)}/>`;
  return s;
}

export function bookSpine(x, y, w, h, colour, lean = 0) {
  const t = lean ? `transform="rotate(${lean} ${x} ${y + h})"` : '';
  return `
  <g ${t}>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="${colour}" ${o(2)}/>
    <path d="M${x + 2},${y + h * 0.18} H${x + w - 2} M${x + 2},${y + h * 0.82} H${x + w - 2}" stroke="${P.goldMid}" stroke-width="2.5"/>
    <rect x="${x + w * 0.25}" y="${y + h * 0.4}" width="${w * 0.5}" height="${h * 0.14}" fill="${P.goldPale}" stroke="${P.ink}" stroke-width="1"/>
  </g>`;
}

export function desk(x, y) {
  return `
  <g>
    <path d="M${x + 20},${y + 120} L${x + 10},${y + 230} M${x + 220},${y + 120} L${x + 230},${y + 230}" stroke="${P.ink}" stroke-width="16" stroke-linecap="round"/>
    <path d="M${x + 20},${y + 120} L${x + 10},${y + 230} M${x + 220},${y + 120} L${x + 230},${y + 230}" stroke="${W.wood}" stroke-width="10" stroke-linecap="round"/>
    <path d="M${x + 20},${y + 190} H${x + 220}" stroke="${W.woodDark}" stroke-width="10"/>
    <path d="M${x},${y + 120} L${x + 240},${y + 120} L${x + 230},${y + 60} L${x + 10},${y + 90} Z" fill="url(#sc-woodgrain)" ${o(3)}/>
    <path d="M${x + 40},${y + 84} L${x + 200},${y + 66} L${x + 204},${y + 108} L${x + 44},${y + 114} Z" fill="${P.vellum}" ${o(2)}/>
    <path d="M${x + 60},${y + 88} L${x + 180},${y + 76} M${x + 60},${y + 96} L${x + 186},${y + 84} M${x + 60},${y + 104} L${x + 150},${y + 96}" stroke="${P.ink}" stroke-width="1.6" opacity="0.6"/>
    <rect x="${x + 52}" y="${y + 84}" width="12" height="14" fill="${P.vermilion}"/>
  </g>`;
}

export function lectern(x, y) {
  return `
  <path d="M${x + 60},${y + 80} V${y + 250}" stroke="${P.ink}" stroke-width="20"/>
  <path d="M${x + 60},${y + 80} V${y + 250}" stroke="${W.wood}" stroke-width="13"/>
  <path d="M${x + 20},${y + 256} H${x + 100}" stroke="${P.ink}" stroke-width="16" stroke-linecap="round"/>
  <path d="M${x + 20},${y + 256} H${x + 100}" stroke="${W.woodDark}" stroke-width="9" stroke-linecap="round"/>
  <path d="M${x - 10},${y + 90} L${x + 130},${y + 90} L${x + 116},${y + 46} L${x + 4},${y + 46} Z" fill="url(#sc-woodgrain)" ${o(3)}/>
  ${openBook(x + 60, y + 52, 0, 0.85)}`;
}

export function table(x, y, w) {
  return `
  <rect x="${x + 30}" y="${y + 20}" width="22" height="120" fill="${W.woodDark}" ${o(3)}/>
  <rect x="${x + w - 52}" y="${y + 20}" width="22" height="120" fill="${W.woodDark}" ${o(3)}/>
  <rect x="${x + w / 2 - 11}" y="${y + 20}" width="22" height="120" fill="${W.woodDark}" ${o(3)}/>
  <rect x="${x}" y="${y}" width="${w}" height="28" fill="url(#sc-woodgrain)" ${o(3)}/>`;
}

export function bench(x, y, w) {
  return `
  <rect x="${x + 16}" y="${y + 14}" width="16" height="56" fill="${W.woodDark}" ${o(2.5)}/>
  <rect x="${x + w - 32}" y="${y + 14}" width="16" height="56" fill="${W.woodDark}" ${o(2.5)}/>
  <rect x="${x}" y="${y}" width="${w}" height="20" fill="url(#sc-woodgrain)" ${o(3)}/>`;
}

export function stool(x, y, rot = 0) {
  return `
  <g transform="rotate(${rot} ${x} ${y})">
    <path d="M${x - 30},${y + 70} L${x - 20},${y} M${x + 30},${y + 70} L${x + 20},${y} M${x},${y + 74} L${x},${y}" stroke="${P.ink}" stroke-width="12" stroke-linecap="round"/>
    <path d="M${x - 30},${y + 70} L${x - 20},${y} M${x + 30},${y + 70} L${x + 20},${y} M${x},${y + 74} L${x},${y}" stroke="${W.wood}" stroke-width="6" stroke-linecap="round"/>
    <ellipse cx="${x}" cy="${y}" rx="42" ry="12" fill="${W.woodLight}" ${o(3)}/>
  </g>`;
}

export function chest(x, y, w, h) {
  return `
  <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#sc-woodgrain)" ${o(3)}/>
  <path d="M${x},${y + h * 0.3} Q${x + w / 2},${y - h * 0.25} ${x + w},${y + h * 0.3}" fill="${W.wood}" ${o(3)}/>
  <path d="M${x + w * 0.2},${y + h * 0.05} V${y + h} M${x + w * 0.8},${y + h * 0.05} V${y + h}" stroke="${W.iron}" stroke-width="8"/>
  <rect x="${x + w / 2 - 12}" y="${y + h * 0.3}" width="24" height="28" fill="${P.goldMid}" ${o(2)}/>
  <circle cx="${x + w / 2}" cy="${y + h * 0.3 + 12}" r="4" fill="${P.ink}"/>`;
}

export function rug(x, y, w, h) {
  return `
  <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#mm-diaper-red)" ${o(3)}/>
  <rect x="${x + 14}" y="${y + 10}" width="${w - 28}" height="${h - 20}" fill="none" stroke="${P.goldMid}" stroke-width="5"/>
  <path d="M${x},${y + 4} h-12 M${x},${y + h / 2} h-12 M${x},${y + h - 4} h-12 M${x + w},${y + 4} h12 M${x + w},${y + h / 2} h12 M${x + w},${y + h - 4} h12" stroke="${P.goldMid}" stroke-width="3"/>`;
}

export function staircase(x, y, steps, stepW = 130, stepH = 60) {
  let s = '';
  for (let i = 0; i < steps; i++) {
    const sx = x + i * 26, sy = y - i * stepH;
    s += `<rect x="${sx}" y="${sy}" width="${stepW}" height="${stepH}" fill="${i % 2 ? P.stone : P.stoneLight}" ${o(3)}/>`;
  }
  return s;
}

export function armillary(x, y, r) {
  return `
  <path d="M${x},0 V${y - r}" stroke="${W.iron}" stroke-width="5"/>
  <circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${P.ink}" stroke-width="9"/>
  <circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${P.goldMid}" stroke-width="5"/>
  <ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.35}" fill="none" stroke="${P.ink}" stroke-width="8" transform="rotate(-25 ${x} ${y})"/>
  <ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.35}" fill="none" stroke="${P.goldMid}" stroke-width="4" transform="rotate(-25 ${x} ${y})"/>
  <ellipse cx="${x}" cy="${y}" rx="${r * 0.35}" ry="${r}" fill="none" stroke="${P.ink}" stroke-width="8"/>
  <ellipse cx="${x}" cy="${y}" rx="${r * 0.35}" ry="${r}" fill="none" stroke="${P.goldMid}" stroke-width="4"/>
  <circle cx="${x}" cy="${y}" r="${r * 0.18}" fill="${P.verdigris}" ${o(2.5)}/>`;
}

export function cobweb(x, y, r, flipX = false, flipY = false) {
  const sx = flipX ? -1 : 1, sy = flipY ? -1 : 1;
  let s = `<g transform="translate(${x},${y}) scale(${sx},${sy})" fill="none" stroke="#f3eee2" stroke-opacity="0.7" stroke-width="1.6">`;
  for (let i = 0; i <= 4; i++) {
    const a = (i / 4) * Math.PI / 2;
    s += `<line x1="0" y1="0" x2="${(Math.cos(a) * r).toFixed(1)}" y2="${(Math.sin(a) * r).toFixed(1)}"/>`;
  }
  for (let k = 1; k <= 4; k++) {
    const rr = (r * k) / 4.4;
    let d = `M${rr},0`;
    for (let i = 1; i <= 4; i++) {
      const a = (i / 4) * Math.PI / 2;
      d += ` Q${(Math.cos(a - 0.2) * rr * 0.8).toFixed(1)},${(Math.sin(a - 0.2) * rr * 0.8).toFixed(1)} ${(Math.cos(a) * rr).toFixed(1)},${(Math.sin(a) * rr).toFixed(1)}`;
    }
    s += `<path d="${d}"/>`;
  }
  return s + '</g>';
}

// ---------- clutter: the fallen books ----------
export function closedBook(x, y, w, h, rot, colour) {
  return `
  <g transform="rotate(${rot} ${x + w / 2} ${y + h / 2})">
    <rect x="${x + 4}" y="${y + 4}" width="${w}" height="${h}" rx="3" fill="${P.vellum}" ${o(2.5)}/>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="${colour}" ${o(2.5)}/>
    <rect x="${x}" y="${y}" width="${w * 0.12}" height="${h}" rx="2" fill="${P.ink}" opacity="0.25"/>
    <rect x="${x + w * 0.22}" y="${y + h * 0.15}" width="${w * 0.66}" height="${h * 0.7}" fill="none" stroke="${P.goldMid}" stroke-width="2"/>
    <circle cx="${x + w * 0.55}" cy="${y + h / 2}" r="${Math.min(w, h) * 0.14}" fill="${P.goldMid}" stroke="${P.ink}" stroke-width="1.5"/>
  </g>`;
}

export function openBook(x, y, rot = 0, s = 1) {
  return `
  <g transform="translate(${x},${y}) rotate(${rot}) scale(${s})">
    <path d="M-70,-30 Q-35,-42 0,-30 L0,30 Q-35,18 -70,30 Z" fill="${P.vellum}" ${o(2.5)}/>
    <path d="M70,-30 Q35,-42 0,-30 L0,30 Q35,18 70,30 Z" fill="${P.vellum}" ${o(2.5)}/>
    <path d="M-62,-20 Q-35,-28 -8,-20 M-62,-10 Q-35,-18 -8,-10 M-62,0 Q-35,-8 -8,0 M-62,10 Q-35,2 -8,10 M8,-20 Q35,-28 62,-20 M8,-10 Q35,-18 62,-10 M8,0 Q35,-8 62,0 M24,10 Q40,4 62,10" stroke="${P.ink}" stroke-width="1.5" fill="none" opacity="0.55"/>
    <rect x="8" y="2" width="13" height="14" fill="${P.lapis}" stroke="${P.goldMid}" stroke-width="1.5"/>
    <path d="M0,-30 V30" stroke="${P.ink}" stroke-width="2"/>
  </g>`;
}

export function scroll(x, y, rot, len = 110) {
  return `
  <g transform="rotate(${rot} ${x} ${y})">
    <rect x="${x}" y="${y - 16}" width="${len}" height="32" fill="${P.vellum}" ${o(2.5)}/>
    <path d="M${x + 14},${y - 6} H${x + len - 14} M${x + 14},${y + 4} H${x + len - 30}" stroke="${P.ink}" stroke-width="1.5" opacity="0.5"/>
    <ellipse cx="${x}" cy="${y}" rx="8" ry="20" fill="${P.parchment}" ${o(2.5)}/>
    <ellipse cx="${x + len}" cy="${y}" rx="8" ry="20" fill="${P.parchment}" ${o(2.5)}/>
    <path d="M${x},${y - 24} V${y + 24} M${x + len},${y - 24} V${y + 24}" stroke="${W.woodDark}" stroke-width="6" stroke-linecap="round"/>
  </g>`;
}

export function page(x, y, rot, colour = P.vermilion) {
  return `
  <g transform="rotate(${rot} ${x + 40} ${y + 50})">
    <rect x="${x}" y="${y}" width="80" height="100" fill="${P.vellum}" ${o(2)}/>
    <rect x="${x + 10}" y="${y + 12}" width="16" height="18" fill="${colour}" stroke="${P.goldMid}" stroke-width="1.5"/>
    <path d="M${x + 32},${y + 16} H${x + 70} M${x + 32},${y + 26} H${x + 70} M${x + 10},${y + 40} H${x + 70} M${x + 10},${y + 50} H${x + 70} M${x + 10},${y + 60} H${x + 70} M${x + 10},${y + 70} H${x + 70} M${x + 10},${y + 80} H${x + 50}" stroke="${P.ink}" stroke-width="1.5" opacity="0.5"/>
  </g>`;
}

export function inkpot(x, y, spilled = false) {
  return `
  ${spilled ? `<path d="M${x + 10},${y + 34} C${x + 40},${y + 30} ${x + 80},${y + 44} ${x + 70},${y + 56} C${x + 50},${y + 64} ${x + 10},${y + 54} ${x + 10},${y + 34} Z" fill="#1a120a" opacity="0.85"/>` : ''}
  <path d="M${x - 22},${y + 40} C${x - 26},${y + 10} ${x + 26},${y + 10} ${x + 22},${y + 40} Z" fill="${P.ink}" ${o(2.5)} transform="${spilled ? `rotate(70 ${x} ${y + 30})` : ''}"/>
  <path d="M${x + 4},${y + 14} C${x + 20},${y - 20} ${x + 40},${y - 50} ${x + 70},${y - 64} C${x + 50},${y - 40} ${x + 30},${y - 14} ${x + 8},${y + 16} Z" fill="${P.white}" ${o(2)}/>
  <path d="M${x + 6},${y + 14} L${x + 64},${y - 60}" stroke="${P.ink}" stroke-width="1.5"/>`;
}

export function hourglass(x, y, s = 1) {
  return `
  <g transform="translate(${x},${y}) scale(${s})">
    <rect x="-30" y="-50" width="60" height="10" fill="${W.wood}" ${o(2.5)}/>
    <rect x="-30" y="40" width="60" height="10" fill="${W.wood}" ${o(2.5)}/>
    <path d="M-20,-40 C-20,-10 -4,-6 -4,0 C-4,6 -20,10 -20,40 H20 C20,10 4,6 4,0 C4,-6 20,-10 20,-40 Z" fill="#e6f0f4" ${o(2.5)}/>
    <path d="M-14,40 C-10,24 10,24 14,40 Z M-10,-28 H10 L2,-4 H-2 Z" fill="${P.ochre}"/>
    <path d="M-26,-40 V40 M26,-40 V40" stroke="${W.woodDark}" stroke-width="5"/>
  </g>`;
}

export function jar(x, y, h, colour) {
  return `
  <path d="M${x - 18},${y} C${x - 26},${y - h * 0.4} ${x - 22},${y - h * 0.8} ${x - 10},${y - h * 0.85} V${y - h} H${x + 10} V${y - h * 0.85} C${x + 22},${y - h * 0.8} ${x + 26},${y - h * 0.4} ${x + 18},${y} Z" fill="${colour}" fill-opacity="0.85" ${o(2.5)}/>
  <rect x="${x - 13}" y="${y - h - 8}" width="26" height="10" fill="${W.woodLight}" ${o(2)}/>
  <path d="M${x - 12},${y - h * 0.6} C${x - 14},${y - h * 0.4} ${x - 12},${y - h * 0.2} ${x - 8},${y - h * 0.1}" stroke="#ffffff" stroke-opacity="0.6" stroke-width="3" fill="none"/>`;
}

export function lantern(x, y) {
  return `
  <path d="M${x},${y - 60} V${y - 40}" stroke="${W.iron}" stroke-width="4"/>
  <path d="M${x - 22},${y - 40} L${x + 22},${y - 40} L${x + 26},${y + 20} L${x - 26},${y + 20} Z" fill="#3a3530" ${o(2.5)}/>
  <path d="M${x - 14},${y - 30} L${x + 14},${y - 30} L${x + 16},${y + 12} L${x - 16},${y + 12} Z" fill="#8a7a5a"/>
  <path d="M${x},${y - 30} V${y + 12} M${x - 15},${y - 9} H${x + 15}" stroke="${W.iron}" stroke-width="3"/>
  <path d="M${x - 26},${y - 40} L${x},${y - 56} L${x + 26},${y - 40} Z" fill="${W.iron}" ${o(2.5)}/>`;
}

// A heap of tumbled books: a convenient way to fill a corner.
export function bookPile(x, y, rand, n = 4) {
  let s = '';
  for (let i = 0; i < n; i++) {
    const w = 90 + rand() * 50, h = 60 + rand() * 25;
    const c = BOOK_COLOURS[Math.floor(rand() * BOOK_COLOURS.length)];
    s += closedBook(x + (rand() - 0.5) * 70, y - i * 26 + (rand() - 0.5) * 10, w, h, (rand() - 0.5) * 50, c);
  }
  return s;
}

// Scatter tumbled books, scrolls and pages across a floor band.
export function floorClutter(rand, x0, x1, y0, y1, count) {
  let s = '';
  for (let i = 0; i < count; i++) {
    const x = x0 + rand() * (x1 - x0), y = y0 + rand() * (y1 - y0), kind = rand();
    if (kind < 0.45) {
      s += closedBook(x, y, 80 + rand() * 50, 55 + rand() * 25, (rand() - 0.5) * 80, BOOK_COLOURS[Math.floor(rand() * BOOK_COLOURS.length)]);
    } else if (kind < 0.6) s += openBook(x, y, (rand() - 0.5) * 50, 0.8);
    else if (kind < 0.78) s += scroll(x, y, (rand() - 0.5) * 120, 80 + rand() * 60);
    else s += page(x, y, (rand() - 0.5) * 90, [P.vermilion, P.lapis, P.verdigris][Math.floor(rand() * 3)]);
  }
  return s;
}
