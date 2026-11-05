// Plants for the Herbarium. Herbal illustrations are flat and symmetrical,
// showing the whole plant from root to flower, often with leaves splayed.
import { P, OUTLINE, FINE, HILITE, tube } from './defs.js';

// A single pointed leaf with a midrib, pointing up from (0,0).
function leaf(len, w, fill, transform) {
  return `
  <g transform="${transform}">
    <path d="M0,0 C${-w},${-len * 0.3} ${-w * 0.9},${-len * 0.75} 0,${-len} C${w * 0.9},${-len * 0.75} ${w},${-len * 0.3} 0,0 Z" fill="${fill}" ${OUTLINE} stroke-width="1.6"/>
    <path d="M0,-2 L0,${-len + 4}" ${HILITE} stroke-width="0.8"/>
    <path d="M0,${-len * 0.35} l${-w * 0.45},${-len * 0.12} M0,${-len * 0.35} l${w * 0.45},${-len * 0.12} M0,${-len * 0.6} l${-w * 0.35},${-len * 0.1} M0,${-len * 0.6} l${w * 0.35},${-len * 0.1}" ${FINE} stroke-width="0.6"/>
  </g>`;
}

export function mandrake() {
  return `
  <!-- leafy crown -->
  ${leaf(30, 9, P.verdigrisDark, 'translate(50,36) rotate(-62)')}
  ${leaf(30, 9, P.verdigrisDark, 'translate(50,36) rotate(62)')}
  ${leaf(32, 9, P.verdigris, 'translate(50,36) rotate(-32)')}
  ${leaf(32, 9, P.verdigris, 'translate(50,36) rotate(32)')}
  ${leaf(33, 9.5, P.verdigrisLight, 'translate(50,36) rotate(0)')}
  <!-- golden "love apple" berries -->
  <g ${OUTLINE} stroke-width="1.3">
    <circle cx="37" cy="21" r="3.6" fill="${P.gold}"/>
    <circle cx="63" cy="21" r="3.6" fill="${P.gold}"/>
    <circle cx="43" cy="12" r="3.2" fill="${P.gold}"/>
    <circle cx="57" cy="12" r="3.2" fill="${P.gold}"/>
  </g>
  <!-- the root, shaped like a little person -->
  <path d="M44,35 C40,38 39.5,45 43.5,49 C40,52 34,52 27,48.5 C23,46.5 19,48.5 16,46 C17.5,50 22,52.5 26,53.5 C32,56 38,56.5 41,58.5 C40,64 41,69.5 42,74 C38,80 34,86 29.5,94 L33.5,95 C37,88 42,82 46,78.5 C48,77 52,77 54,78.5 C58,82 63,88 66.5,95 L70.5,94 C66,86 62,80 58,74 C59,69.5 60,64 59,58.5 C62,56.5 68,56 74,53.5 C78,52.5 82.5,50 84,46 C81,48.5 77,46.5 73,48.5 C66,52 60,52 56.5,49 C60.5,45 60,38 56,35 C53,33.5 47,33.5 44,35 Z" fill="${P.tan}" ${OUTLINE}/>
  <!-- root hairs -->
  <path d="M16,46 l-4,-2 M17,48 l-5,1 M84,46 l4,-2 M83,48 l5,1 M29.5,94 l-4,3 M31.5,95 l-1,4 M70.5,94 l4,3 M68.5,95 l1,4 M41,66 l-4,1 M59,66 l4,1 M42,71 l-3,3 M58,71 l3,3" ${FINE}/>
  <!-- face: the mandrake screams when pulled from the earth! -->
  <circle cx="47" cy="41" r="1.3" fill="${P.ink}"/>
  <circle cx="53" cy="41" r="1.3" fill="${P.ink}"/>
  <path d="M45,38 l3,1 M55,38 l-3,1" ${FINE}/>
  <ellipse cx="50" cy="45.5" rx="1.8" ry="2.3" fill="${P.vermilionDark}" stroke="${P.ink}" stroke-width="0.7"/>
  <!-- bark hatching and highlights -->
  <path d="M45,58 l2,2 M45,63 l2,2 M54,59 l-2,2 M54,64 l-2,2 M47,70 l2,1.5 M53,70 l-2,1.5 M33,51 l3,0.5 M67,51 l-3,0.5" ${FINE}/>
  <path d="M44.5,49.5 C43.5,56 43.5,64 44.5,72 M28,50 C33,52.5 37,53.5 40,54" ${HILITE}/>
  <path d="M43,37 C42,40 42,44 44,46" ${HILITE}/>
  `;
}

// Herbals show the root too: a little tuft of root hairs.
function roots(x, y, color = P.tanDark) {
  return `${tube(`M${x},${y} L${x},${y + 5} M${x},${y + 3} q-5,2 -8,6 M${x},${y + 3} q5,2 8,6 M${x},${y + 5} q-2,3 -3,5 M${x},${y + 5} q2,3 3,5`, color, 1.4)}`;
}

// A five-petalled heraldic flower.
function rosette(cx, cy, r, fill, centre = P.gold, petals = 5) {
  let s = `<g ${OUTLINE} stroke-width="1.4">`;
  for (let i = 0; i < petals; i++) {
    const a = (i / petals) * Math.PI * 2 - Math.PI / 2;
    s += `<circle cx="${(cx + Math.cos(a) * r * 0.62).toFixed(2)}" cy="${(cy + Math.sin(a) * r * 0.62).toFixed(2)}" r="${(r * 0.52).toFixed(2)}" fill="${fill}"/>`;
  }
  s += `<circle cx="${cx}" cy="${cy}" r="${(r * 0.36).toFixed(2)}" fill="${centre}"/></g>`;
  return s;
}

// A narrow, strap-like leaf from (x,y) curving outward.
function strap(x, y, dx, dy, fill, w = 3) {
  const mx = x + dx * 0.5 - dy * 0.15, my = y + dy * 0.5 + dx * 0.15;
  return `<path d="M${x},${y} Q${mx - w},${my - w} ${x + dx},${y + dy} Q${mx + w},${my + w} ${x},${y} Z" fill="${fill}" ${OUTLINE} stroke-width="1.3"/>`;
}

export function rose() {
  return `
  ${roots(50, 88)}
  ${tube('M50,90 C50,70 48,50 50,30 M50,62 C42,56 34,50 30,40 M50,52 C58,46 66,40 70,30', P.verdigrisDark, 2.4)}
  <!-- thorns -->
  <path d="M50,76 l-3,-2 M49,66 l3,-2 M40,54 l-1,-3 M60,44 l1,-3" ${FINE} stroke-width="1.4"/>
  ${leaf(14, 5, P.verdigris, 'translate(50,72) rotate(-60)')}
  ${leaf(14, 5, P.verdigris, 'translate(50,66) rotate(60)')}
  ${leaf(12, 4.5, P.verdigrisLight, 'translate(38,52) rotate(-80)')}
  ${leaf(12, 4.5, P.verdigrisLight, 'translate(62,44) rotate(80)')}
  ${rosette(50, 24, 15, P.vermilion)}
  ${rosette(29, 36, 10, P.rose)}
  ${rosette(71, 26, 10, P.rose)}
  <path d="M44,18 q3,-3 6,-2" ${HILITE}/>
  <g fill="${P.white}"><circle cx="48" cy="22" r="0.8"/><circle cx="52" cy="22" r="0.8"/><circle cx="50" cy="26" r="0.8"/></g>`;
}

export function lily() {
  const bloom = (x, y, rot) => `
  <g transform="translate(${x},${y}) rotate(${rot})">
    <g ${OUTLINE} stroke-width="1.5" fill="${P.white}">
      <path d="M0,0 C-6,-6 -14,-8 -18,-4 C-12,-4 -8,-1 -4,4 Z"/>
      <path d="M0,0 C6,-6 14,-8 18,-4 C12,-4 8,-1 4,4 Z"/>
      <path d="M-4,4 C-4,-6 -2,-14 0,-18 C2,-14 4,-6 4,4 Z"/>
      <path d="M-4,4 L4,4 L2,12 L-2,12 Z"/>
    </g>
    <path d="M0,0 L-4,-10 M0,0 L0,-12 M0,0 L4,-10" stroke="${P.goldDeep}" stroke-width="0.9"/>
    <g fill="${P.ochre}" stroke="${P.ink}" stroke-width="0.6"><ellipse cx="-4" cy="-11" rx="1.5" ry="2.2"/><ellipse cx="0" cy="-13" rx="1.5" ry="2.2"/><ellipse cx="4" cy="-11" rx="1.5" ry="2.2"/></g>
  </g>`;
  return `
  ${roots(50, 90)}
  <ellipse cx="50" cy="88" rx="6" ry="4" fill="${P.vellum}" ${OUTLINE} stroke-width="1.4"/>
  ${tube('M50,86 L50,34 M50,48 C44,44 38,38 34,30 M50,44 C56,40 62,34 66,26', P.verdigrisDark, 2.2)}
  ${strap(50, 84, -22, -10, P.verdigris)}
  ${strap(50, 80, 22, -12, P.verdigris)}
  ${strap(50, 72, -18, -12, P.verdigrisLight)}
  ${strap(50, 66, 18, -12, P.verdigrisLight)}
  ${bloom(50, 34, 0)}
  ${bloom(33, 30, -35)}
  ${bloom(67, 26, 35)}`;
}

export function rosemary() {
  const sprig = (x0, y0, x1, y1) => {
    let s = tube(`M${x0},${y0} L${x1},${y1}`, P.tanDark, 1.4);
    const n = 7;
    for (let i = 1; i <= n; i++) {
      const t = i / (n + 1), x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t;
      const ang = Math.atan2(y1 - y0, x1 - x0) * 180 / Math.PI + 90;
      s += strap(x, y, Math.cos((ang - 40) * Math.PI / 180) * 9, Math.sin((ang - 40) * Math.PI / 180) * 9, P.verdigrisDark, 1.2);
      s += strap(x, y, -Math.cos((ang + 40) * Math.PI / 180) * 9, -Math.sin((ang + 40) * Math.PI / 180) * 9, P.verdigrisDark, 1.2);
    }
    return s;
  };
  return `
  ${roots(50, 88)}
  ${sprig(50, 88, 50, 12)}
  ${sprig(50, 80, 26, 22)}
  ${sprig(50, 80, 74, 22)}
  <!-- pale blue flowers -->
  <g fill="${P.sky}" stroke="${P.ink}" stroke-width="0.9">
    <circle cx="50" cy="12" r="3"/><circle cx="26" cy="22" r="2.7"/><circle cx="74" cy="22" r="2.7"/>
    <circle cx="43" cy="30" r="2.2"/><circle cx="57" cy="40" r="2.2"/><circle cx="34" cy="44" r="2"/><circle cx="66" cy="44" r="2"/>
  </g>
  <g fill="${P.white}"><circle cx="49" cy="11" r="0.9"/><circle cx="25" cy="21" r="0.8"/><circle cx="73" cy="21" r="0.8"/></g>`;
}

export function sage() {
  const sageLeaf = (t) => `
  <g transform="${t}">
    <path d="M0,0 C-9,-6 -9,-22 0,-28 C9,-22 9,-6 0,0 Z" fill="${P.sage}" ${OUTLINE} stroke-width="1.5"/>
    <path d="M0,-2 L0,-25" ${HILITE} stroke-width="0.9"/>
    <path d="M-5,-8 l2,1 M-6,-14 l2,1 M-5,-20 l2,1 M5,-8 l-2,1 M6,-14 l-2,1 M5,-20 l-2,1" ${FINE} stroke-width="0.6"/>
    <g fill="${P.white}" opacity="0.6"><circle cx="-3" cy="-11" r="0.6"/><circle cx="3" cy="-17" r="0.6"/><circle cx="-2" cy="-21" r="0.6"/><circle cx="3" cy="-8" r="0.6"/></g>
  </g>`;
  let spike = '';
  for (let i = 0; i < 6; i++) {
    const y = 34 - i * 5;
    spike += `<path d="M50,${y} l-5,-2 l1,3 Z M50,${y} l5,-2 l-1,3 Z" fill="${P.violet}" ${OUTLINE} stroke-width="0.9"/>`;
  }
  return `
  ${roots(50, 88)}
  ${tube('M50,88 L50,8', P.tanDark, 1.8)}
  ${sageLeaf('translate(50,84) rotate(-70)')}
  ${sageLeaf('translate(50,84) rotate(70)')}
  ${sageLeaf('translate(50,72) rotate(-45)')}
  ${sageLeaf('translate(50,72) rotate(45)')}
  ${sageLeaf('translate(50,56) rotate(-30) scale(0.8)')}
  ${sageLeaf('translate(50,56) rotate(30) scale(0.8)')}
  ${spike}
  <circle cx="50" cy="7" r="2.4" fill="${P.lavender}" ${OUTLINE} stroke-width="0.9"/>`;
}

export function lavender() {
  const spike = (x0, y0, x1, y1) => {
    let s = tube(`M${x0},${y0} L${x1},${y1}`, P.sage, 1.4);
    for (let i = 0; i < 6; i++) {
      const t = i / 6, x = x1 + (x0 - x1) * t * 0.35, y = y1 + (y0 - y1) * t * 0.35;
      s += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="3" ry="2.2" fill="${i % 2 ? P.lavender : P.violet}" ${OUTLINE} stroke-width="0.9"/>`;
    }
    return s;
  };
  return `
  ${roots(50, 88)}
  ${strap(50, 86, -24, -14, P.sage, 2)}${strap(50, 86, 24, -14, P.sage, 2)}
  ${strap(50, 84, -18, -24, P.sage, 2)}${strap(50, 84, 18, -24, P.sage, 2)}
  ${spike(50, 86, 50, 8)}
  ${spike(50, 86, 32, 12)}
  ${spike(50, 86, 68, 12)}
  ${spike(50, 86, 20, 26)}
  ${spike(50, 86, 80, 26)}`;
}

export function columbine() {
  const bell = (x, y, s = 1) => `
  <g transform="translate(${x},${y}) scale(${s})">
    <!-- spurs curling up like doves' necks -->
    ${tube('M-6,-2 C-8,-8 -12,-10 -12,-6 M0,-3 C0,-10 -3,-12 -4,-9 M6,-2 C8,-8 12,-10 12,-6', P.violet, 1.6)}
    <g ${OUTLINE} stroke-width="1.4">
      <path d="M-9,-2 C-10,6 -6,12 0,13 C6,12 10,6 9,-2 Z" fill="${P.violet}"/>
      <path d="M-5,0 C-5,6 -3,10 0,10 C3,10 5,6 5,0 Z" fill="${P.lavender}"/>
    </g>
    <path d="M-2,10 l-1,4 M0,10 l0,5 M2,10 l1,4" stroke="${P.goldMid}" stroke-width="1"/>
  </g>`;
  const lobed = (t) => `
  <g transform="${t}" ${OUTLINE} stroke-width="1.3">
    <path d="M0,0 C-10,-2 -14,-10 -8,-14 C-6,-20 2,-20 2,-14 C8,-16 12,-8 6,-4 C6,0 2,2 0,0 Z" fill="${P.sage}"/>
    <path d="M0,0 L-4,-12 M0,0 L5,-9" ${FINE}/>
  </g>`;
  return `
  ${roots(50, 88)}
  ${tube('M50,88 C50,70 50,50 50,30 M50,50 C40,40 34,36 26,36 M50,46 C60,38 66,34 74,34 M50,30 C48,24 46,20 46,16', P.verdigrisDark, 1.6)}
  ${lobed('translate(46,84) rotate(-40)')}
  ${lobed('translate(54,84) rotate(40) scale(-1,1)')}
  ${lobed('translate(48,70) rotate(-60) scale(0.8)')}
  ${lobed('translate(52,66) rotate(60) scale(-0.8,0.8)')}
  ${bell(26, 40)}${bell(74, 38)}${bell(46, 20, 0.95)}`;
}

export function foxglove() {
  let bells = '';
  const spots = [];
  for (let i = 0; i < 7; i++) {
    const y = 72 - i * 9, side = i % 2 ? 1 : -1, s = 1 - i * 0.07;
    const x = 50 + side * 4;
    bells += `
    <g transform="translate(${x},${y}) rotate(${side * 70}) scale(${s})">
      <path d="M0,0 C4,-1 12,-3 16,-6 C18,0 18,6 16,8 C12,6 4,3 0,2 Z" fill="${P.rose}" ${OUTLINE} stroke-width="1.3"/>
      <path d="M14,-4 C15,0 15,4 14,6" fill="none" stroke="${P.roseLight}" stroke-width="2"/>
      <circle cx="9" cy="0" r="0.8" fill="${P.vermilionDark}"/><circle cx="12" cy="1.5" r="0.8" fill="${P.vermilionDark}"/>
    </g>`;
  }
  return `
  ${roots(50, 88)}
  ${tube('M50,88 L50,8', P.verdigrisDark, 2)}
  ${leaf(24, 8, P.verdigris, 'translate(50,86) rotate(-70)')}
  ${leaf(24, 8, P.verdigris, 'translate(50,86) rotate(70)')}
  ${leaf(20, 7, P.verdigrisLight, 'translate(50,82) rotate(-40)')}
  ${leaf(20, 7, P.verdigrisLight, 'translate(50,82) rotate(40)')}
  ${bells}
  <circle cx="50" cy="8" r="2.4" fill="${P.verdigrisLight}" ${OUTLINE} stroke-width="1"/>`;
}

export function hellebore() {
  const palm = (t) => `
  <g transform="${t}">
    ${leaf(18, 4.5, P.verdigrisDark, 'rotate(-40)')}${leaf(20, 4.5, P.verdigrisDark, 'rotate(0)')}${leaf(18, 4.5, P.verdigrisDark, 'rotate(40)')}
  </g>`;
  return `
  <!-- the famous black root -->
  ${tube('M50,82 L50,90 M50,86 q-6,2 -10,8 M50,86 q6,2 10,8 M50,88 q-2,4 -4,8 M50,88 q2,4 4,8', P.ink, 2)}
  ${tube('M50,84 C48,70 40,56 30,44 M50,84 C52,70 60,56 70,42 M50,84 L50,40', P.vermilionDark, 1.8)}
  ${palm('translate(50,80) rotate(-70)')}
  ${palm('translate(50,80) rotate(70)')}
  ${palm('translate(50,70) rotate(-30) scale(0.8)')}
  ${rosette(30, 40, 18, P.white, P.goldMid)}
  ${rosette(70, 38, 18, P.vellum, P.goldMid)}
  ${rosette(50, 26, 20, P.pink, P.goldMid)}
  <g fill="${P.verdigrisLight}"><circle cx="50" cy="26" r="2.4"/><circle cx="30" cy="40" r="2"/><circle cx="70" cy="38" r="2"/></g>
  <path d="M44,18 q2,-3 5,-3 M24,34 q2,-2 4,-2" fill="none" stroke="${P.rose}" stroke-width="0.9" stroke-linecap="round"/>`;
}

export function mistletoe() {
  const pair = (x, y, rot) => `
  <g transform="translate(${x},${y}) rotate(${rot})">
    <path d="M0,0 C-4,-4 -4,-14 0,-18 C4,-14 4,-4 0,0 Z" transform="rotate(-30)" fill="${P.verdigrisLight}" ${OUTLINE} stroke-width="1.3"/>
    <path d="M0,0 C-4,-4 -4,-14 0,-18 C4,-14 4,-4 0,0 Z" transform="rotate(30)" fill="${P.verdigrisLight}" ${OUTLINE} stroke-width="1.3"/>
  </g>`;
  const berry = (x, y) => `<circle cx="${x}" cy="${y}" r="3.2" fill="${P.white}" ${OUTLINE} stroke-width="1.1"/><circle cx="${x - 0.9}" cy="${y - 0.9}" r="0.9" fill="${P.white}" stroke="${P.sky}" stroke-width="0.4"/>`;
  return `
  <!-- a bit of the oak branch it grows on -->
  ${tube('M10,90 C24,84 36,82 50,80 C64,78 80,82 92,78', P.tanDark, 5)}
  <path d="M20,86 l4,-1 M60,80 l5,0 M80,80 l4,-1" ${FINE}/>
  ${tube('M50,80 L50,60 M50,60 L36,44 M50,60 L64,44 M36,44 L26,30 M36,44 L40,26 M64,44 L60,26 M64,44 L74,30', P.verdigrisDark, 1.8)}
  ${pair(26, 30, -30)}${pair(40, 26, 0)}${pair(60, 26, 0)}${pair(74, 30, 30)}
  ${pair(36, 44, -60)}${pair(64, 44, 60)}
  ${berry(36, 44)}${berry(64, 44)}${berry(50, 60)}${berry(33, 30)}${berry(67, 30)}${berry(50, 30)}`;
}

export function peony() {
  const cutLeaf = (t) => `
  <g transform="${t}">${leaf(16, 5, P.verdigris, 'rotate(-35)')}${leaf(18, 5, P.verdigris, 'rotate(0)')}${leaf(16, 5, P.verdigris, 'rotate(35)')}</g>`;
  return `
  ${roots(50, 88)}
  <!-- the root tubers -->
  <g ${OUTLINE} stroke-width="1.3" fill="${P.tan}"><ellipse cx="42" cy="94" rx="4" ry="2.5" transform="rotate(-30 42 94)"/><ellipse cx="58" cy="94" rx="4" ry="2.5" transform="rotate(30 58 94)"/></g>
  ${tube('M50,88 C50,74 50,60 50,48 M50,72 C42,66 34,62 26,60 M50,68 C58,62 66,58 74,56', P.verdigrisDark, 2)}
  ${cutLeaf('translate(26,62) rotate(-70)')}
  ${cutLeaf('translate(74,58) rotate(70)')}
  ${cutLeaf('translate(50,82) rotate(-30) scale(0.8)')}
  <!-- the big, many-petalled bloom -->
  <g ${OUTLINE} stroke-width="1.5">
    <path d="M26,40 C20,30 26,20 34,22 C34,12 48,8 52,16 C58,8 72,12 70,22 C80,20 84,32 76,40 C80,48 70,54 62,50 C56,56 44,56 38,50 C30,54 20,48 26,40 Z" fill="${P.rose}"/>
    <path d="M34,38 C30,30 36,24 42,26 C44,20 54,20 56,26 C62,22 70,28 66,34 C70,40 64,46 58,44 C54,48 46,48 42,44 C36,46 30,42 34,38 Z" fill="${P.roseLight}"/>
    <path d="M42,36 C42,30 48,28 50,31 C53,28 58,30 58,35 C58,40 52,42 50,40 C47,42 42,40 42,36 Z" fill="${P.pink}"/>
  </g>
  <circle cx="50" cy="35.5" r="2.4" fill="${P.gold}" stroke="${P.ink}" stroke-width="0.8"/>
  <path d="M30,30 C30,26 32,24 35,24 M54,16 C58,14 62,14 64,16" ${HILITE}/>
  <!-- a faint glow, for it was said to shine at night -->
  <path d="M18,26 l-4,-2 M16,40 l-5,0 M84,26 l4,-2 M86,40 l5,0 M50,6 l0,-4" stroke="${P.goldMid}" stroke-width="1.5" stroke-linecap="round"/>`;
}

export function wormwood() {
  const feather = (x0, y0, x1, y1) => {
    let s = tube(`M${x0},${y0} L${x1},${y1}`, P.stoneLight, 1.2);
    for (let i = 1; i <= 5; i++) {
      const t = i / 6, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t;
      s += `<path d="M${x.toFixed(1)},${y.toFixed(1)} l-6,-3 M${x.toFixed(1)},${y.toFixed(1)} l6,-3 M${(x - 3).toFixed(1)},${(y - 1.5).toFixed(1)} l-1,-3 M${(x + 3).toFixed(1)},${(y - 1.5).toFixed(1)} l1,-3" fill="none" stroke="${P.ink}" stroke-width="3" stroke-linecap="round"/>`;
      s += `<path d="M${x.toFixed(1)},${y.toFixed(1)} l-6,-3 M${x.toFixed(1)},${y.toFixed(1)} l6,-3 M${(x - 3).toFixed(1)},${(y - 1.5).toFixed(1)} l-1,-3 M${(x + 3).toFixed(1)},${(y - 1.5).toFixed(1)} l1,-3" fill="none" stroke="${P.sage}" stroke-width="1.4" stroke-linecap="round"/>`;
    }
    return s;
  };
  const buds = (pts) => pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.1" fill="${P.goldMid}" stroke="${P.ink}" stroke-width="0.8"/>`).join('');
  return `
  ${roots(50, 88)}
  ${feather(50, 88, 50, 30)}
  ${feather(50, 80, 26, 40)}
  ${feather(50, 80, 74, 40)}
  ${tube('M50,30 L50,12 M50,22 L42,14 M50,22 L58,14 M26,40 L20,30 M74,40 L80,30', P.stoneLight, 1.1)}
  ${buds([[50, 10], [42, 12], [58, 12], [46, 18], [54, 18], [20, 28], [24, 32], [80, 28], [76, 32]])}`;
}
