// The witch, her enchanted broom and her eagle-owl, drawn in the game's
// modelled style: light from the upper left, soft shading, folds and strands.
// Coordinates are local; each figure is placed with a transform.
import { P, OUTLINE, FINE } from './defs.js';
import { style } from '../style.js';

const INK = P.ink;
const SPELL = '#8ef0b8';

// Colours for each art style: [light, mid, dark] stops.
const PALETTES = {
  classic: {
    skin: ['#f3eaf1', '#d9cbdc', '#ad9cbb'], hair: ['#f1eef7', '#bdb6cf', '#8f88a6'], hat: ['#3a2a58', '#1c1230', '#0c0716'],
    gown: ['#6b4aa0', '#3f2768', '#1d1036'], cloak: ['#2f1f4a', '#1b1130', '#0f0820'], iris: ['#e6fff0', '#3ee08f', '#0b5c33'],
    wood: ['#8a5a32', '#5e3a1c', '#3a220f'], straw: ['#e9cf8a', '#c9a052', '#8e6428'], owl: ['#b58552', '#8a5c33', '#5a3a1e'],
    disc: ['#f0d9ae', '#c79a62'], eye: ['#ffd27a', '#f08a1a', '#a24e06'],
  },
  // Painted: clear tempera pigments, ultramarine and lake, laid on flat.
  painted: {
    skin: ['#fbf1e6', '#f0dccb', '#d9bba6'], hair: ['#f6f2ea', '#d8d2c4', '#a9a294'], hat: ['#3a3f9e', '#252a7a', '#171a52'],
    gown: ['#8b5cc4', '#6a3fa8', '#4a2a80'], cloak: ['#2a49a6', '#1f3a8a', '#16296a'], iris: ['#ffffff', '#3ee08f', '#0b5c33'],
    wood: ['#a8703c', '#86542a', '#5e3a1c'], straw: ['#f3dc8e', '#dfba5a', '#b08a34'], owl: ['#c99a5e', '#a77840', '#7a5228'],
    disc: ['#f7e6c2', '#dcb27a'], eye: ['#ffe08a', '#f4a020', '#b0600a'],
  },
  // Dark: ash-grey skin, mossy black robes, glowing eyes, weathered wood.
  dark: {
    skin: ['#c3c9b8', '#9aa290', '#646c5c'], hair: ['#a9a8a0', '#76756c', '#4a4a42'], hat: ['#2a2622', '#16130f', '#070605'],
    gown: ['#34402e', '#1e2719', '#0b0f08'], cloak: ['#221d18', '#13100c', '#060504'], iris: ['#f8ffd0', '#c8ff4a', '#4a8a00'],
    wood: ['#5a4632', '#3a2a1a', '#1c130a'], straw: ['#7a6444', '#54402a', '#2c2014'], owl: ['#7c6852', '#4f3f2e', '#2a2018'],
    disc: ['#bfae90', '#7e6a50'], eye: ['#fff0a0', '#ff8a10', '#a02a00'],
  },
};
const stops = (c) => c.map((col, i) => `<stop offset="${c.length === 2 ? i : [0, 0.55, 1][i]}" stop-color="${col}"/>`).join('');

export function villainDefs(look = style()) {
  const c = PALETTES[look] || PALETTES.classic;
  return `
  <defs>
    <linearGradient id="v-skin" x1="0" y1="0" x2="1" y2="0.3">${stops(c.skin)}</linearGradient>
    <linearGradient id="v-hair" x1="0" y1="0" x2="0.3" y2="1">${stops(c.hair)}</linearGradient>
    <linearGradient id="v-hat" x1="0" y1="0" x2="1" y2="1">${stops(c.hat)}</linearGradient>
    <linearGradient id="v-gown" x1="0" y1="0" x2="1" y2="0.4">${stops(c.gown)}</linearGradient>
    <linearGradient id="v-cloak" x1="0" y1="0" x2="1" y2="0">${stops(c.cloak)}</linearGradient>
    <radialGradient id="v-iris" cx="0.5" cy="0.5" r="0.5">${stops(c.iris)}</radialGradient>
    <radialGradient id="v-orb" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#ffffff"/><stop offset="0.3" stop-color="${SPELL}"/><stop offset="1" stop-color="${SPELL}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="v-eyeglow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#e8ff9a" stop-opacity="0.9"/><stop offset="1" stop-color="#c8ff4a" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="v-wood" x1="0" y1="0" x2="1" y2="0">${stops(c.wood)}</linearGradient>
    <linearGradient id="v-straw" x1="0" y1="0" x2="0" y2="1">${stops(c.straw)}</linearGradient>
    <linearGradient id="v-owl" x1="0" y1="0" x2="1" y2="1">${stops(c.owl)}</linearGradient>
    <radialGradient id="v-owl-disc" cx="0.5" cy="0.45" r="0.55">${stops(c.disc)}</radialGradient>
    <radialGradient id="v-owl-eye" cx="0.5" cy="0.5" r="0.5">${stops(c.eye)}</radialGradient>
  </defs>`;
}

// ---------- the eagle-owl ----------
// Perched, facing the viewer. Local size about 60×80, feet at y=0.
export function owl(x, y, s = 1, { flying = false } = {}) {
  const look = style();
  const feathers = [];
  for (let r = 0; r < 4; r++) {
    for (let c = -2; c <= 2; c++) {
      const fx = c * 7 + (r % 2 ? 3.5 : 0), fy = -44 + r * 8;
      if (Math.abs(fx) < 16 - r) feathers.push(`M${fx - 2.5},${fy} l2.5,2.2 l2.5,-2.2`);
    }
  }
  // Flying wings have two jointed segments: the arm (shoulder to wrist) and
  // the hand (the long primary feathers), so they can bend through a stroke.
  const wing = (side) => flying
    ? `<g class="owl-wing" data-side="${side}" transform="scale(${side},1)">
        <g class="owl-arm" transform="rotate(0 8 -52)">
          <g class="owl-hand" transform="rotate(0 40 -64)">
            <path d="M38,-70 C50,-80 66,-84 82,-80 C80,-76 84,-73 82,-70 C84,-66 80,-63 77,-62 C79,-58 74,-55 70,-55 C70,-51 64,-50 60,-51 C56,-50 46,-52 38,-56 Z" fill="url(#v-owl)" ${OUTLINE} stroke-width="1.6"/>
            ${look === 'dark' ? `<path d="M50,-76 l4,10 M58,-78 l3,12 M66,-79 l2,13 M74,-78 l1,12 M46,-62 l6,6 M56,-62 l4,7 M64,-62 l3,7" stroke="#1a130c" stroke-width="1" stroke-linecap="round"/><path d="M52,-74 l3,7 M60,-76 l2,9 M68,-77 l1,9" stroke="#a8957a" stroke-width="0.7" stroke-opacity="0.7"/>` : ''}
            <path d="M44,-70 C56,-76 68,-79 80,-78 M44,-64 C56,-68 68,-70 80,-70 M44,-59 C54,-61 64,-62 74,-62 M42,-55 C50,-56 58,-56 66,-55" fill="none" stroke="#4a2e14" stroke-width="1.1"/>
            <path d="M58,-75 l2,3 M68,-77 l2,3 M60,-67 l2,3 M70,-68 l2,3 M58,-59 l2,3" stroke="#f0d9ae" stroke-width="1.2" stroke-linecap="round"/>
          </g>
          <path d="M8,-52 C18,-66 30,-72 42,-70 L42,-54 C34,-50 22,-44 10,-42 Z" fill="url(#v-owl)" ${OUTLINE} stroke-width="1.6"/>
          <path d="M14,-56 C22,-62 30,-64 38,-64 M14,-49 C22,-52 30,-54 38,-55" fill="none" stroke="#4a2e14" stroke-width="1.1"/>
          <path d="M20,-60 l2,3 M30,-62 l2,3 M24,-52 l2,3 M33,-55 l2,3" stroke="#f0d9ae" stroke-width="1.2" stroke-linecap="round"/>
          ${look === 'dark' ? `<path d="M12,-50 q3,4 6,0 M18,-56 q3,4 6,0 M24,-60 q3,4 6,0 M30,-63 q3,4 6,0 M16,-46 q3,4 6,0 M22,-50 q3,4 6,0 M28,-53 q3,4 6,0 M34,-55 q3,4 6,0" fill="none" stroke="#1a130c" stroke-width="0.9"/>` : ''}
        </g>
      </g>`
    : `<path d="M${side * 12},-50 C${side * 20},-40 ${side * 20},-22 ${side * 14},-6 C${side * 10},-14 ${side * 9},-30 ${side * 8},-44 Z" fill="#6e4726" ${OUTLINE} stroke-width="1.4"/>`;
  return `
  <g transform="translate(${x},${y}) scale(${s})">
    ${flying ? `<g class="owl-tail"><path d="M-9,-8 L-14,14 C-6,17 6,17 14,14 L9,-8 Z" fill="#6e4726" ${OUTLINE} stroke-width="1.4"/>
      <path d="M-6,-4 L-8,13 M0,-4 L0,15 M6,-4 L8,13" stroke="#3a220f" stroke-width="1"/></g>` : ''}
    ${wing(-1)}${wing(1)}
    <!-- body -->
    <path d="M0,-58 C17,-58 22,-40 20,-24 C18,-8 10,0 0,0 C-10,0 -18,-8 -20,-24 C-22,-40 -17,-58 0,-58 Z" fill="url(#v-owl)" ${OUTLINE} stroke-width="1.8"/>
    <path d="M0,-44 C9,-44 13,-32 12,-20 C11,-10 6,-4 0,-4 C-6,-4 -11,-10 -12,-20 C-13,-32 -9,-44 0,-44 Z" fill="#d9b884"/>
    <path d="${feathers.join(' ')}" fill="none" stroke="#5a3a1e" stroke-width="1.1" stroke-linecap="round"/>
    ${look === 'dark' ? owlPlumage() : look === 'painted' ? `<path d="M-14,-50 C-17,-38 -17,-22 -12,-10 M-10,-46 C-12,-36 -12,-24 -9,-14" fill="none" stroke="#fff6e0" stroke-width="1.6" stroke-opacity="0.6" stroke-linecap="round"/>` : ''}
    <!-- head, ear tufts and facial disc -->
    <path d="M-15,-66 L-19,-84 L-9,-72 Z M15,-66 L19,-84 L9,-72 Z" fill="#6e4726" ${OUTLINE} stroke-width="1.4"/>
    <ellipse cx="0" cy="-64" rx="18" ry="15" fill="url(#v-owl)" ${OUTLINE} stroke-width="1.8"/>
    <path d="M-1,-72 C-6,-76 -15,-74 -15,-65 C-15,-57 -7,-54 -1,-58 Z M1,-72 C6,-76 15,-74 15,-65 C15,-57 7,-54 1,-58 Z" fill="url(#v-owl-disc)" stroke="#6e4726" stroke-width="1.2"/>
    <circle cx="-7.5" cy="-65" r="5" fill="url(#v-owl-eye)" stroke="${INK}" stroke-width="1"/>
    <circle cx="7.5" cy="-65" r="5" fill="url(#v-owl-eye)" stroke="${INK}" stroke-width="1"/>
    <circle cx="-7.2" cy="-65" r="2.3" fill="${INK}"/><circle cx="7.8" cy="-65" r="2.3" fill="${INK}"/>
    <circle cx="-6.2" cy="-66.2" r="0.8" fill="#fff"/><circle cx="8.8" cy="-66.2" r="0.8" fill="#fff"/>
    ${look === 'dark' ? '<circle cx="-7.5" cy="-65" r="9" fill="url(#v-owl-eye)" opacity="0.35"/><circle cx="7.5" cy="-65" r="9" fill="url(#v-owl-eye)" opacity="0.35"/>' : ''}
    ${look === 'painted' ? `<g fill="${P.goldMid}"><circle cx="-16" cy="-64" r="0.9"/><circle cx="-15" cy="-58" r="0.9"/><circle cx="-11" cy="-54" r="0.9"/><circle cx="16" cy="-64" r="0.9"/><circle cx="15" cy="-58" r="0.9"/><circle cx="11" cy="-54" r="0.9"/></g>` : ''}
    <path d="M-13,-71 L-3,-67 M13,-71 L3,-67" stroke="#3a220f" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M-2,-61 L2,-61 L0,-55 Z" fill="#3a2a1a" stroke="${INK}" stroke-width="0.8"/>
    <!-- talons -->
    <path d="M-7,0 l-2,4 M-4,0 l0,4.5 M-1,0 l2,4 M3,0 l-2,4 M6,0 l0,4.5 M9,0 l2,4" stroke="#3a2a1a" stroke-width="1.6" stroke-linecap="round"/>
  </g>`;
}

// Rows of overlapping feathers and dark streaks, for the dark style's owl.
function owlPlumage() {
  let d = '', light = '';
  for (let y = -54, row = 0; y <= -8; y += 5, row++) {
    const half = 17 - Math.abs(y + 30) * 0.28;
    for (let x = -half + (row % 2 ? 3 : 0); x <= half - 4; x += 6) {
      d += `M${x.toFixed(1)},${y} q3,4 6,0 `;
      light += `M${(x + 1).toFixed(1)},${y + 1.6} q2,2 4,0 `;
    }
  }
  return `<path d="${d}" fill="none" stroke="#1a130c" stroke-width="0.85"/>
    <path d="${light}" fill="none" stroke="#c2ad8a" stroke-width="0.6" stroke-opacity="0.6"/>
    <path d="M-4,-40 l0,6 M4,-36 l0,6 M-2,-26 l0,6 M6,-24 l0,6 M-6,-18 l0,5" stroke="#1a130c" stroke-width="1.4" stroke-linecap="round"/>`;
}

// ---------- the enchanted broom ----------
// Local: handle tip at (0,-150), bristles fan out at the bottom (y≈0).
export function broom(x, y, s = 1, rot = 0) {
  let strands = '';
  for (let i = -6; i <= 6; i++) strands += `M${i * 2.2},-34 C${i * 2.6},-20 ${i * 3.6},-10 ${i * 4.4},0 `;
  const look = style();
  if (look === 'dark') return gnarledBroom(x, y, s, rot);
  return `
  <g transform="translate(${x},${y}) rotate(${rot}) scale(${s})">
    <!-- twisted handle -->
    <path d="M-3.2,-150 C-4,-110 -2,-70 -3.4,-36 L3.4,-36 C2,-70 4,-110 3.2,-150 Z" fill="url(#v-wood)" ${OUTLINE} stroke-width="1.6"/>
    <path d="M-2,-140 C1,-134 -2,-126 1,-118 M-2,-104 C1,-98 -2,-90 1,-82 M-2,-70 C1,-64 -2,-56 1,-48" fill="none" stroke="#2a170a" stroke-width="0.9"/>
    <circle cx="0" cy="-151" r="4" fill="url(#v-wood)" ${OUTLINE} stroke-width="1.4"/>
    <!-- bundle of straw -->
    <path d="M-12,-36 L12,-36 C16,-24 24,-10 30,2 C18,6 -18,6 -30,2 C-24,-10 -16,-24 -12,-36 Z" fill="url(#v-straw)" ${OUTLINE} stroke-width="1.8"/>
    <path d="${strands}" fill="none" stroke="#8e6428" stroke-width="0.8"/>
    <path d="M-30,2 l-2,4 M-24,3 l-1,4 M-16,4 l0,4 M-8,4 l0,4 M0,4 l0,4 M8,4 l0,4 M16,4 l0,4 M24,3 l1,4 M30,2 l2,4" stroke="#8e6428" stroke-width="1.2" stroke-linecap="round"/>
    <!-- bindings: a cord and a gold band -->
    <rect x="-13.5" y="-40" width="27" height="6" rx="2" fill="#3a220f" ${OUTLINE} stroke-width="1.2"/>
    <rect x="-14.5" y="-31" width="29" height="4" rx="1.5" fill="${P.gold}" ${OUTLINE} stroke-width="1"/>
    <path d="M-10,-37 h20" stroke="#6e4726" stroke-width="0.8" stroke-dasharray="2 1.5"/>
    ${look === 'painted' ? `<path d="M-1.8,-146 C-2.6,-110 -1,-70 -2,-40 M-8,-30 C-12,-18 -18,-8 -22,0" fill="none" stroke="#fff6e0" stroke-width="1.2" stroke-opacity="0.65" stroke-linecap="round"/>` : ''}
  </g>`;
}

// The dark style's broom: a gnarled, knotted branch and a wild bundle of twigs
// bound with twine.
function gnarledBroom(x, y, s, rot) {
  let twigs = '';
  for (let i = -8; i <= 8; i++) {
    const end = i * 4.6 + (i % 3) * 1.5, len = 4 + ((i * 7) % 5) * 2;
    twigs += `M${(i * 1.6).toFixed(1)},-34 C${(i * 2.4).toFixed(1)},-18 ${(i * 3.8).toFixed(1)},-6 ${end.toFixed(1)},${len} `;
    if (i % 2) twigs += `M${(i * 3.4).toFixed(1)},-8 l${i > 0 ? 4 : -4},4 `;
  }
  return `
  <g transform="translate(${x},${y}) rotate(${rot}) scale(${s})">
    <path d="M-3.5,-152 C-7,-136 0,-124 -4.5,-106 C-8,-90 1,-74 -4,-56 L-4,-36 L4,-36 C3,-54 8,-72 4,-90 C1,-106 7,-124 3,-152 Z" fill="url(#v-wood)" ${OUTLINE} stroke-width="1.6"/>
    <ellipse cx="-4" cy="-118" rx="3.2" ry="2.2" fill="#1c130a" stroke="${INK}" stroke-width="0.8"/>
    <ellipse cx="3.6" cy="-80" rx="2.8" ry="2" fill="#1c130a" stroke="${INK}" stroke-width="0.8"/>
    <path d="M-6,-108 l-7,-6 l1,-4 M5,-128 l6,-5" fill="none" stroke="#3a2a1a" stroke-width="2" stroke-linecap="round"/>
    <path d="M-1,-146 C1,-140 -2,-132 0,-126 M-1,-98 C1,-92 -2,-86 0,-78 M0,-66 C2,-60 -1,-52 1,-44" fill="none" stroke="#0e0905" stroke-width="0.9"/>
    <path d="M-12,-36 L12,-36 C16,-24 22,-12 26,0 C14,4 -14,4 -26,0 C-22,-12 -16,-24 -12,-36 Z" fill="url(#v-straw)" ${OUTLINE} stroke-width="1.6"/>
    <path d="${twigs}" fill="none" stroke="#24180c" stroke-width="1.3" stroke-linecap="round"/>
    <path d="${twigs}" fill="none" stroke="#7a6444" stroke-width="0.5" stroke-linecap="round" transform="translate(0.6,-0.4)"/>
    <path d="M-13,-38 L13,-35 M-13.5,-34 L13.5,-31 M-13,-30 L13,-27" stroke="#2a1d10" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M-13,-38 L13,-35 M-13.5,-34 L13.5,-31 M-13,-30 L13,-27" stroke="#8a7a5a" stroke-width="0.8" stroke-dasharray="1.5 1.5"/>
  </g>`;
}

// ---------- the witch ----------
// Standing, scepter in her left hand, right hand raised to cast.
// Local origin at her waist; feet at y=90, hat tip near y=-190.
export function witchFigure(x, y, s = 1, { owlOnShoulder = true, glory = false } = {}) {
  const folds = 'M-20,-40 C-26,0 -32,40 -40,88 M-8,-30 C-10,10 -12,50 -16,88 M10,-30 C12,10 16,50 20,88 M20,-40 C26,0 34,40 42,88';
  const look = style();
  return `
  <g transform="translate(${x},${y}) scale(${s})">
    ${glory ? `
    <path d="M0,-200 C82,-136 96,0 0,104 C-96,0 -82,-136 0,-200 Z" fill="url(#w-mandorla)" stroke="${P.goldMid}" stroke-width="4"/>
    <path d="M0,-190 C74,-130 86,0 0,94 C-86,0 -74,-130 0,-190 Z" fill="none" stroke="${P.goldPale}" stroke-width="1.6" stroke-dasharray="0.1 6" stroke-linecap="round"/>` : ''}
    <!-- scepter: dark wood crowned with a crescent and a glowing orb -->
    <path d="M-80,90 C-78,40 -82,-20 -78,-80 C-77,-110 -80,-130 -78,-150" fill="none" stroke="${INK}" stroke-width="8" stroke-linecap="round"/>
    <path d="M-80,90 C-78,40 -82,-20 -78,-80 C-77,-110 -80,-130 -78,-150" fill="none" stroke="url(#v-wood)" stroke-width="4.5" stroke-linecap="round"/>
    <circle class="scepter-glow" cx="-78" cy="-164" r="24" fill="url(#v-orb)"/>
    <path d="M-92,-150 C-100,-166 -92,-182 -76,-184 C-88,-176 -90,-162 -78,-152 C-70,-148 -62,-150 -58,-156 C-60,-146 -74,-140 -92,-150 Z" fill="${P.gold}" ${OUTLINE} stroke-width="1.6"/>
    <circle cx="-78" cy="-164" r="6.5" fill="${SPELL}" stroke="${INK}" stroke-width="1.2"/>
    <circle cx="-80" cy="-166" r="2" fill="#ffffff"/>
    <!-- cloak spread wide, its lining diapered red and gold -->
    <path d="M-28,-74 L-70,-62 C-90,-12 -108,40 -122,92 L122,92 C112,30 98,-34 74,-100 L28,-74 Z" fill="url(#v-cloak)" ${OUTLINE} stroke-width="2.5"/>
    <path d="M-30,-62 L-64,-52 C-80,-6 -96,44 -106,92 L106,92 C98,36 86,-24 66,-86 L30,-62 Z" fill="url(#mm-diaper-red)" stroke="${INK}" stroke-width="1.5"/>
    <path d="M-30,-62 L-64,-52 C-80,-6 -96,44 -106,92 L106,92 C98,36 86,-24 66,-86 L30,-62 Z" fill="#12091c" opacity="0.38"/>
    <path d="M-60,-40 C-74,10 -86,50 -94,90 M60,-60 C74,0 84,46 92,90" fill="none" stroke="#000" stroke-opacity="0.25" stroke-width="8"/>
    <path d="M-70,-62 C-90,-12 -108,40 -122,92 M74,-100 C98,-34 112,30 122,92" fill="none" stroke="${look === 'dark' ? '#4a3a20' : P.goldMid}" stroke-width="3.5"/>
    ${look === 'dark' ? `
    <path d="M-30,-62 L-64,-52 C-80,-6 -96,44 -106,92 L106,92 C98,36 86,-24 66,-86 L30,-62 Z" fill="#060504" opacity="0.5"/>
    <path d="M-122,92 L-116,108 L-108,96 L-100,114 L-90,98 L-80,110 L-70,96 L-58,106 L58,106 L70,96 L80,112 L90,98 L102,116 L110,98 L118,108 L122,92 Z" fill="url(#v-cloak)" ${OUTLINE} stroke-width="2"/>
    <path d="M-90,30 l6,10 l-5,6 M84,10 l-5,12 l4,8 M-70,70 l8,4" fill="none" stroke="#000" stroke-width="2.5" stroke-linecap="round"/>` : ''}
    ${look === 'painted' ? `<path d="M-70,-62 C-90,-12 -108,40 -122,92 M74,-100 C98,-34 112,30 122,92" fill="none" stroke="${P.goldPale}" stroke-width="2" stroke-dasharray="0.1 6" stroke-linecap="round"/>` : ''}
    <!-- gown, with folds -->
    <path d="M-24,-74 C-30,-20 -40,40 -54,92 L54,92 C40,40 30,-20 24,-74 Z" fill="url(#v-gown)" ${OUTLINE} stroke-width="2"/>
    <path d="${folds}" fill="none" stroke="#1b0e30" stroke-width="2.4" stroke-opacity="0.55" stroke-linecap="round"/>
    <path d="M-14,-34 C-17,6 -20,46 -26,88 M14,-34 C17,6 22,46 28,88" fill="none" stroke="#8a6cc0" stroke-width="1.6" stroke-opacity="0.45" stroke-linecap="round"/>
    ${look === 'painted' ? '<path d="M-18,-30 C-22,10 -26,50 -32,86 M4,-30 C5,10 7,50 9,86 M18,-30 C22,10 26,50 32,86" fill="none" stroke="#f6efff" stroke-width="2.2" stroke-opacity="0.55" stroke-linecap="round"/>' : ''}
    ${look === 'dark' ? '<path d="M-54,92 L-50,104 L-42,94 L-34,106 L-24,94 L-14,104 L-4,94 L6,106 L16,94 L26,104 L36,94 L46,104 L54,92 Z" fill="url(#v-gown)" stroke="#000" stroke-width="1.6"/>' : ''}
    <path d="M-52,82 L52,82 L54,92 L-54,92 Z" fill="${look === 'dark' ? '#4a3a20' : P.gold}" ${OUTLINE} stroke-width="1.4"/>
    <path d="M-44,87 l4,-3 l4,3 l-4,3 Z M-24,87 l4,-3 l4,3 l-4,3 Z M-4,87 l4,-3 l4,3 l-4,3 Z M16,87 l4,-3 l4,3 l-4,3 Z M36,87 l4,-3 l4,3 l-4,3 Z" fill="${P.vermilion}"/>
    <!-- girdle with a crescent pendant -->
    <path d="M-27,-22 Q0,-12 27,-22" fill="none" stroke="${INK}" stroke-width="5"/>
    <path d="M-27,-22 Q0,-12 27,-22" fill="none" stroke="${P.goldMid}" stroke-width="3"/>
    <path d="M2,-16 C2,0 4,20 3,36" fill="none" stroke="${P.goldMid}" stroke-width="1.6" stroke-dasharray="2 1.5"/>
    <path d="M-2,36 C-2,44 8,46 10,40 C6,42 2,40 3,36 Z" fill="${P.gold}" stroke="${INK}" stroke-width="1"/>
    <!-- high standing collar -->
    <path d="M-30,-74 L-46,-120 L-12,-88 Z" fill="url(#v-cloak)" stroke="${P.goldMid}" stroke-width="2.2" stroke-linejoin="round"/>
    <path d="M30,-74 L46,-120 L12,-88 Z" fill="url(#v-cloak)" stroke="${P.goldMid}" stroke-width="2.2" stroke-linejoin="round"/>
    <!-- left arm, long fingers wrapped round the scepter -->
    <path d="M-24,-74 L-68,-68 L-80,-48 C-64,-36 -46,-42 -28,-56 Z" fill="url(#v-gown)" ${OUTLINE} stroke-width="2"/>
    <path d="M-40,-70 C-48,-60 -58,-52 -70,-48" fill="none" stroke="#1b0e30" stroke-width="2" stroke-opacity="0.5"/>
    <path d="M-68,-68 L-80,-48" stroke="${P.goldMid}" stroke-width="4"/>
    <path d="M-74,-74 C-80,-76 -86,-74 -86,-70 C-86,-66 -80,-64 -74,-66 Z" fill="url(#v-skin)" ${OUTLINE} stroke-width="1.3"/>
    <path d="M-84,-72 C-80,-70 -76,-70 -74,-71 M-85,-69 C-80,-67 -76,-67 -74,-68" fill="none" stroke="#8a7896" stroke-width="0.8"/>
    <!-- right arm raised, casting -->
    <path d="M22,-76 C40,-88 52,-100 60,-112 L76,-102 C72,-84 62,-64 48,-48 C40,-56 32,-64 22,-70 Z" fill="url(#v-gown)" ${OUTLINE} stroke-width="2"/>
    <path d="M30,-74 C42,-80 52,-90 62,-104" fill="none" stroke="#1b0e30" stroke-width="2" stroke-opacity="0.5"/>
    <path d="M60,-112 L76,-102" stroke="${P.goldMid}" stroke-width="4"/>
    <path d="M63,-110 C62,-117 65,-122 69,-123 C73,-122 76,-118 75,-112 Z" fill="url(#v-skin)" ${OUTLINE} stroke-width="1.3"/>
    <path d="M66,-121 C65,-128 66,-134 67,-139 M69,-122 C70,-130 72,-136 74,-140 M72,-120 C75,-127 78,-131 81,-134 M74,-116 C78,-119 82,-121 86,-122" fill="none" stroke="${INK}" stroke-width="3.4" stroke-linecap="round"/>
    <path d="M66,-121 C65,-128 66,-134 67,-139 M69,-122 C70,-130 72,-136 74,-140 M72,-120 C75,-127 78,-131 81,-134 M74,-116 C78,-119 82,-121 86,-122" fill="none" stroke="#d9cbdc" stroke-width="2" stroke-linecap="round"/>
    <!-- spell-light gathering in her hand -->
    <circle class="spell-glow" cx="80" cy="-138" r="24" fill="url(#v-orb)"/>
    <!-- long silver hair, strand by strand -->
    <path d="M-12,-112 C-22,-102 -24,-84 -30,-62 C-32,-54 -34,-48 -38,-42 L-22,-50 C-18,-64 -15,-80 -12,-96 Z" fill="url(#v-hair)" ${OUTLINE} stroke-width="1.3"/>
    <path d="M12,-112 C22,-102 24,-84 30,-62 C32,-54 34,-48 38,-42 L22,-50 C18,-64 15,-80 12,-96 Z" fill="url(#v-hair)" ${OUTLINE} stroke-width="1.3"/>
    <path d="M-16,-100 C-20,-86 -24,-70 -30,-52 M-19,-96 C-24,-82 -27,-66 -34,-48 M16,-100 C20,-86 24,-70 30,-52 M19,-96 C24,-82 27,-66 34,-48" fill="none" stroke="#8f88a6" stroke-width="0.7"/>
    <!-- neck and face -->
    <path d="M-5.5,-86 L5.5,-86 L5,-75 L-5,-75 Z" fill="url(#v-skin)"/>
    <path d="M-5.5,-80 C-2,-77 2,-77 5.5,-80" fill="none" stroke="#8a7896" stroke-width="0.8"/>
    <path d="M-11,-112 C-13,-104 -12,-96 -9,-90 C-6,-85 -3,-83 0,-82.5 C3,-83 6,-85 9,-90 C12,-96 13,-104 11,-112 C8,-116 -8,-116 -11,-112 Z" fill="url(#v-skin)" ${OUTLINE} stroke-width="1.4"/>
    <path d="M6.5,-100 C9.5,-96 8.5,-91 5.5,-88" fill="none" stroke="#7d6a8e" stroke-opacity="0.45" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M-11,-112 C-8,-116 8,-116 11,-112 L11,-106 C4,-108.5 -4,-108.5 -11,-106 Z" fill="#241433" opacity="0.4"/>
    <!-- eyes: whites, glowing green irises, heavy lids -->
    <path d="M-8.6,-102.4 Q-5.5,-105.2 -2.4,-102.4 Q-5.5,-100.9 -8.6,-102.4 Z M2.4,-102.4 Q5.5,-105.2 8.6,-102.4 Q5.5,-100.9 2.4,-102.4 Z" fill="#f4f0f6" stroke="${INK}" stroke-width="0.45"/>
    <circle cx="-5.5" cy="-102.7" r="1.45" fill="url(#v-iris)"/><circle cx="5.5" cy="-102.7" r="1.45" fill="url(#v-iris)"/>
    <path d="M-5.5,-103.6 v1.8 M5.5,-103.6 v1.8" stroke="${INK}" stroke-width="0.6"/>
    <circle cx="-5" cy="-103.2" r="0.35" fill="#fff"/><circle cx="6" cy="-103.2" r="0.35" fill="#fff"/>
    <path d="M-9,-102.8 Q-5.5,-106.2 -2,-102.8 M2,-102.8 Q5.5,-106.2 9,-102.8" fill="none" stroke="${INK}" stroke-width="0.95" stroke-linecap="round"/>
    <path d="M-10.2,-106.6 Q-6,-109 -2,-106.4 L-2.3,-105.7 Q-6,-107.7 -9.9,-105.9 Z M10.2,-106.6 Q6,-109 2,-106.4 L2.3,-105.7 Q6,-107.7 9.9,-105.9 Z" fill="#4a3c5c"/>
    <!-- nose, lips, cheekbones -->
    <path d="M-0.4,-102 C-0.7,-98.5 -1.9,-95.6 -1.3,-94.6 C-0.5,-94 0.8,-94.2 1.7,-94.8" fill="none" stroke="#7d6a8e" stroke-width="0.85" stroke-linecap="round"/>
    <path d="M-3.4,-90.6 Q-1.6,-91.7 0,-91 Q1.6,-91.7 3.4,-90.6 Q0,-89.9 -3.4,-90.6 Z" fill="#7a2a44"/>
    <path d="M-3,-90.3 Q0,-87.9 3,-90.3 Q0,-89.4 -3,-90.3 Z" fill="#9a3a58"/>
    <path d="M-9.5,-98 Q-8,-94.5 -6,-92.5" fill="none" stroke="#a48fb4" stroke-width="0.8"/>
    ${look === 'dark' ? `
    <ellipse cx="-5.5" cy="-102.6" rx="4.6" ry="3" fill="#20261a" opacity="0.55"/><ellipse cx="5.5" cy="-102.6" rx="4.6" ry="3" fill="#20261a" opacity="0.55"/>
    <path d="M-9.6,-97 Q-7.6,-92.5 -4.6,-90.6 M9.6,-97 Q7.6,-92.5 4.6,-90.6" fill="none" stroke="#3c4434" stroke-width="1.6" stroke-opacity="0.7"/>
    <circle cx="-5.5" cy="-102.7" r="4.2" fill="url(#v-eyeglow)"/><circle cx="5.5" cy="-102.7" r="4.2" fill="url(#v-eyeglow)"/>
    <circle cx="-5.5" cy="-102.7" r="1.1" fill="#f4ffb0"/><circle cx="5.5" cy="-102.7" r="1.1" fill="#f4ffb0"/>` : ''}
    ${look === 'painted' ? '<circle cx="-7.5" cy="-95" r="2.4" fill="#e88a8a" opacity="0.45"/><circle cx="7.5" cy="-95" r="2.4" fill="#e88a8a" opacity="0.45"/>' : ''}
    <!-- circlet beneath the brim -->
    <path d="M-11.5,-109 Q0,-113 11.5,-109" fill="none" stroke="${P.goldMid}" stroke-width="2"/>
    <circle cx="0" cy="-111.6" r="1.9" fill="${SPELL}" stroke="${INK}" stroke-width="0.7"/>
    <!-- tall hat, creased and bent -->
    <path d="M-38,-112 C-20,-122 20,-122 38,-112 C20,-106 -20,-106 -38,-112 Z" fill="url(#v-hat)" ${OUTLINE} stroke-width="1.6"/>
    ${look === 'dark' ? '<path d="M-36,-112 l3,4 l2,-4 M28,-110 l2,5 l3,-4 M-8,-108 l2,4 l2,-4" fill="#070605" stroke="#000" stroke-width="0.8"/>' : ''}
    <path d="M-13,-117 C-11,-140 -4,-160 4,-176 C8,-184 14,-190 22,-192 C16,-186 13,-178 12,-170 C11,-152 12,-134 14,-117 Z" fill="url(#v-hat)" ${OUTLINE} stroke-width="1.6"/>
    <path d="M-6,-130 C-2,-128 4,-130 8,-134 M-2,-152 C2,-150 6,-152 9,-156" fill="none" stroke="#5a4680" stroke-width="1"/>
    <path d="M-12.5,-121 L13.8,-121" stroke="${P.goldMid}" stroke-width="3"/>
    <path d="M2,-141 C-4,-137 -3,-129 3,-127 C-1,-130 -1,-137 2,-141 Z" fill="${P.goldPale}"/>
    ${owlOnShoulder ? owl(-38, -74, 0.55) : ''}
  </g>`;
}

// The witch riding her broom, with the owl flying beside her (finale).
export function witchRiding(x, y, s = 1) {
  return `
  <g transform="translate(${x},${y}) scale(${s})">
    ${broom(0, 0, 0.9, 78)}
    <g transform="translate(42,-22) scale(0.42)">
      <path d="M-24,-74 C-40,-40 -60,0 -120,30 C-80,40 -60,30 -40,20 C-50,40 -40,60 -20,70 C0,40 10,0 24,-74 Z" fill="url(#v-cloak)" ${OUTLINE} stroke-width="3"/>
      <path d="M-24,-74 C-30,-20 -30,30 -20,70 L30,70 C30,20 30,-30 24,-74 Z" fill="url(#v-gown)" ${OUTLINE} stroke-width="3"/>
      <path d="M-11,-112 C-13,-104 -12,-96 -9,-90 C-6,-85 -3,-83 0,-82.5 C3,-83 6,-85 9,-90 C12,-96 13,-104 11,-112 C8,-116 -8,-116 -11,-112 Z" fill="url(#v-skin)" ${OUTLINE} stroke-width="2"/>
      <path d="M-12,-110 C-30,-100 -50,-90 -70,-86 C-50,-96 -30,-104 -14,-114 Z" fill="url(#v-hair)" ${OUTLINE} stroke-width="2"/>
      <path d="M-38,-112 C-20,-122 20,-122 38,-112 C20,-106 -20,-106 -38,-112 Z" fill="url(#v-hat)" ${OUTLINE} stroke-width="2"/>
      <path d="M-13,-117 C-20,-140 -36,-160 -58,-172 C-40,-150 -20,-134 14,-117 Z" fill="url(#v-hat)" ${OUTLINE} stroke-width="2"/>
      <circle cx="5" cy="-102" r="1.8" fill="url(#v-iris)"/>
    </g>
    ${owl(-40, -40, 0.38, { flying: true })}
  </g>`;
}
