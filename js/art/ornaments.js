// Book covers, borders and other decoration.
import { P, OUTLINE, FINE, HILITE, dotRing } from './defs.js';
import { bookSpine, rng, W } from './scenery.js';

export const BOOKS = {
  bestiary: { name: 'Bestiary', leather: P.vermilion, dark: P.vermilionDark, diaper: 'mm-diaper-blue' },
  alchemy: { name: 'Alchemy Codex', leather: P.lapis, dark: P.lapisDark, diaper: 'mm-diaper-red' },
  herbarium: { name: 'Herbarium', leather: P.verdigris, dark: P.verdigrisDark, diaper: 'mm-diaper-red' },
};

// Small gold quatrefoil used on the cover corners.
function quatrefoil(cx, cy, r) {
  return `
  <g ${OUTLINE} stroke-width="1" fill="${P.gold}">
    <circle cx="${cx}" cy="${cy - r}" r="${r * 0.7}"/>
    <circle cx="${cx}" cy="${cy + r}" r="${r * 0.7}"/>
    <circle cx="${cx - r}" cy="${cy}" r="${r * 0.7}"/>
    <circle cx="${cx + r}" cy="${cy}" r="${r * 0.7}"/>
    <circle cx="${cx}" cy="${cy}" r="${r * 0.6}" fill="${P.vermilion}"/>
  </g>`;
}

// Central emblem for each book.
function emblem(kind) {
  if (kind === 'alchemy') {
    // The four elements quartered: fire, sky, water, earth.
    return `
    <g ${OUTLINE} stroke-width="1.4">
      <path d="M52,65 L52,44 A21,21 0 0 1 73,65 Z" fill="${P.vermilion}"/>
      <path d="M52,65 L73,65 A21,21 0 0 1 52,86 Z" fill="${P.lapisLight}"/>
      <path d="M52,65 L52,86 A21,21 0 0 1 31,65 Z" fill="${P.verdigris}"/>
      <path d="M52,65 L31,65 A21,21 0 0 1 52,44 Z" fill="${P.white}"/>
    </g>
    <!-- alchemical triangles -->
    <g fill="none" stroke="${P.goldPale}" stroke-width="1.6" stroke-linejoin="round">
      <path d="M62,49 L67,58 L57,58 Z"/>
      <path d="M57,71 L67,71 L62,80 Z"/>
      <path d="M37,71 L47,71 L42,80 Z M38,75 L46,75"/>
    </g>
    <path d="M37,58 L42,49 L47,58 Z M38,54 L46,54" fill="none" stroke="${P.goldDeep}" stroke-width="1.6" stroke-linejoin="round"/>
    <circle cx="52" cy="65" r="4" fill="${P.gold}" ${OUTLINE} stroke-width="1"/>`;
  }
  if (kind === 'herbarium') {
    // A gold sprig with three leaves and a flower.
    return `
    <g ${OUTLINE} stroke-width="1.3">
      <path d="M52,86 C52,74 52,62 52,52" fill="none" stroke="${P.ink}" stroke-width="3"/>
      <path d="M52,86 C52,74 52,62 52,52" fill="none" stroke="${P.goldMid}" stroke-width="1.4"/>
      <path d="M52,76 C44,76 37,71 35,63 C43,63 49,68 52,76 Z" fill="${P.gold}"/>
      <path d="M52,70 C60,70 67,65 69,57 C61,57 55,62 52,70 Z" fill="${P.gold}"/>
      <circle cx="52" cy="42" r="5" fill="${P.vermilion}"/>
      <circle cx="44" cy="46" r="5" fill="${P.vermilion}"/>
      <circle cx="60" cy="46" r="5" fill="${P.vermilion}"/>
      <circle cx="47" cy="53" r="5" fill="${P.vermilion}"/>
      <circle cx="57" cy="53" r="5" fill="${P.vermilion}"/>
      <circle cx="52" cy="48" r="3.5" fill="${P.gold}"/>
    </g>`;
  }
  // Bestiary: the griffin, king of beasts and birds.
  return `<use href="#item-griffin" x="30" y="43" width="44" height="44"/>`;
}

export function bookCover(kind) {
  const b = BOOKS[kind];
  return `
  <!-- page block peeking out -->
  <rect x="9" y="9" width="88" height="118" rx="3" fill="${P.vellum}" ${OUTLINE}/>
  <path d="M92,14 L92,122 M95,16 L95,120" ${FINE}/>
  <!-- leather cover -->
  <rect x="4" y="4" width="88" height="120" rx="4" fill="${b.leather}" ${OUTLINE} stroke-width="2.5"/>
  <rect x="4" y="4" width="11" height="120" rx="3" fill="${b.dark}" ${OUTLINE} stroke-width="1.5"/>
  <path d="M6,20 L13,20 M6,40 L13,40 M6,88 L13,88 M6,108 L13,108" stroke="${P.goldMid}" stroke-width="2"/>
  <!-- tooled gold frame -->
  <rect x="20" y="11" width="66" height="106" rx="2" fill="none" stroke="${P.goldMid}" stroke-width="2"/>
  <rect x="24" y="15" width="58" height="98" rx="1" fill="none" stroke="${P.goldPale}" stroke-width="0.8" stroke-dasharray="0.1 2.6" stroke-linecap="round"/>
  ${quatrefoil(22, 13, 3.2)}${quatrefoil(84, 13, 3.2)}${quatrefoil(22, 115, 3.2)}${quatrefoil(84, 115, 3.2)}
  <!-- central roundel -->
  <circle cx="52" cy="65" r="29" fill="url(#${b.diaper})" ${OUTLINE} stroke-width="1.5"/>
  <circle cx="52" cy="65" r="24" fill="${P.vellum}" ${OUTLINE} stroke-width="1.5"/>
  <circle cx="52" cy="65" r="29" fill="none" stroke="${P.goldMid}" stroke-width="2.2"/>
  ${dotRing(52, 65, 26.5, 36, 0.9, P.goldPale)}
  ${emblem(kind)}
  <!-- clasp -->
  <rect x="86" y="56" width="12" height="16" rx="2" fill="${P.gold}" ${OUTLINE} stroke-width="1.5"/>
  <circle cx="92" cy="64" r="2.2" fill="${P.goldDeep}" ${OUTLINE} stroke-width="0.8"/>
  <path d="M7,10 C7,40 7,90 7,118" ${HILITE} opacity="0.4"/>
  `;
}

// ---------- story panels (400×260) ----------

// The witch: hooded, pointy-hatted, with a starry staff.
export function witch(x, y, s = 1, flying = false) {
  const broom = flying ? `
    <path d="M-60,40 L50,30" stroke="${P.ink}" stroke-width="7" stroke-linecap="round"/>
    <path d="M-60,40 L50,30" stroke="${W.woodLight}" stroke-width="4" stroke-linecap="round"/>
    <path d="M50,30 L78,14 L82,30 L80,46 Z" fill="${P.ochre}" ${OUTLINE}/>
    <path d="M58,30 L80,22 M58,32 L82,32 M58,34 L80,42" ${FINE}/>` : '';
  return `
  <g transform="translate(${x},${y}) scale(${s})">
    ${broom}
    <g ${OUTLINE}>
      <!-- robe -->
      <path d="M-30,60 C-26,20 -18,0 0,-6 C18,0 26,20 30,60 Z" fill="${P.violet}"/>
      <path d="M-8,-4 C-4,20 4,20 8,-4" fill="none"/>
      <!-- green cloak -->
      <path d="M-20,-2 C-38,10 -40,40 -36,62 L-24,60 C-26,30 -20,10 -12,0 Z" fill="${P.verdigrisDark}"/>
      <path d="M20,-2 C38,10 40,40 36,62 L24,60 C26,30 20,10 12,0 Z" fill="${P.verdigrisDark}"/>
      <!-- face -->
      <path d="M-11,-18 C-11,-30 11,-30 11,-18 C11,-8 6,-2 0,-2 C-6,-2 -11,-8 -11,-18 Z" fill="#b9d3a0"/>
      <path d="M-2,-16 L-12,-10 L-2,-11 Z" fill="#b9d3a0"/>
      <!-- hat -->
      <path d="M-24,-24 C-10,-30 10,-30 24,-24 C10,-20 -10,-20 -24,-24 Z" fill="${P.ink}"/>
      <path d="M-12,-26 L6,-70 L14,-58 L10,-27 Z" fill="#2b1f44"/>
    </g>
    <path d="M-11,-28 L10,-28" stroke="${P.goldMid}" stroke-width="3"/>
    <circle cx="-4" cy="-19" r="1.6" fill="${P.ink}"/><circle cx="5" cy="-19" r="1.6" fill="${P.ink}"/>
    <path d="M-5,-9 q4,3 8,0" ${FINE} stroke-width="1.3"/>
    <!-- staff with a star -->
    ${flying ? '' : `
    <path d="M30,60 L44,-30" stroke="${P.ink}" stroke-width="7" stroke-linecap="round"/>
    <path d="M30,60 L44,-30" stroke="${W.woodLight}" stroke-width="4" stroke-linecap="round"/>
    <path d="M45,-48 l4,10 l11,1 l-8,7 l3,11 l-10,-6 l-10,6 l3,-11 l-8,-7 l11,-1 Z" fill="${P.goldPale}" ${OUTLINE} stroke-width="1.5"/>
    <path d="M-26,24 C-34,22 -40,16 -42,10" ${FINE}/>`}
    <path d="M22,10 C30,6 36,0 40,-8" stroke="${P.ink}" stroke-width="7" stroke-linecap="round" fill="none"/>
    <path d="M22,10 C30,6 36,0 40,-8" stroke="${P.violet}" stroke-width="4" stroke-linecap="round" fill="none"/>
  </g>`;
}

function panelFrame(inner, bg) {
  return `
  <rect x="0" y="0" width="400" height="260" fill="${bg}"/>
  ${inner}
  <rect x="4" y="4" width="392" height="252" fill="none" stroke="${P.goldMid}" stroke-width="6"/>
  <rect x="11" y="11" width="378" height="238" fill="none" stroke="${P.vermilion}" stroke-width="2"/>
  ${dotRingRect()}`;
}

function dotRingRect() {
  let s = '';
  for (let x = 20; x <= 380; x += 18) s += `<circle cx="${x}" cy="17" r="1.3" fill="${P.goldPale}"/><circle cx="${x}" cy="243" r="1.3" fill="${P.goldPale}"/>`;
  return s;
}

function fullShelves(x, y, w, rows, seed) {
  const r = rng(seed);
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${rows * 50 + 10}" fill="${W.woodDark}" ${OUTLINE} stroke-width="3"/>`;
  for (let i = 0; i < rows; i++) {
    const sy = y + 8 + i * 50;
    let bx = x + 8;
    while (bx < x + w - 20) {
      const bw = 8 + r() * 7, bh = 30 + r() * 10;
      s += bookSpine(bx, sy + 40 - bh, bw, bh, [P.vermilion, P.lapis, P.verdigris, P.ochre, P.rose, P.violet][Math.floor(r() * 6)]);
      bx += bw + 1.5;
    }
    s += `<rect x="${x + 4}" y="${sy + 40}" width="${w - 8}" height="7" fill="${W.wood}" ${OUTLINE} stroke-width="1.5"/>`;
  }
  return s;
}

function iconAt(id, x, y, size, rot = 0) {
  return `<use href="#item-${id}" x="${-size / 2}" y="${-size / 2}" width="${size}" height="${size}" transform="translate(${x} ${y}) rotate(${rot})"/>`;
}

export function storyPanel(kind) {
  if (kind === 'library') {
    return panelFrame(`
      <rect x="0" y="0" width="400" height="260" fill="url(#sc-stone-warm)"/>
      <rect x="0" y="210" width="400" height="50" fill="url(#sc-tiles)"/>
      ${fullShelves(30, 40, 150, 3, 3)}
      ${fullShelves(220, 40, 150, 3, 5)}
      <path d="M200,30 L200,200" stroke="${P.ink}" stroke-width="2" opacity="0.2"/>
      ${iconAt('caladrius', 200, 225, 50)}`, P.parchment);
  }
  if (kind === 'witch') {
    let swirl = '';
    for (let i = 0; i < 3; i++) {
      swirl += `<path d="M${250 + i * 10},${90 - i * 6} c40,-30 90,-10 80,30 c-8,32 -60,34 -64,6 c-3,-20 30,-26 36,-8" fill="none" stroke="${['#b58cf0', '#7fd6a0', P.goldPale][i]}" stroke-width="3" stroke-linecap="round" stroke-dasharray="${i === 2 ? '2 8' : '0'}"/>`;
    }
    return panelFrame(`
      <rect x="0" y="0" width="400" height="260" fill="#1d1838"/>
      <g fill="${P.goldPale}">${[[40, 40], [90, 70], [340, 40], [370, 120], [60, 150], [300, 200], [150, 30]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2"/>`).join('')}</g>
      <rect x="0" y="215" width="400" height="45" fill="url(#sc-flags)"/>
      ${fullShelves(20, 80, 110, 2, 9)}
      ${witch(190, 150, 1.25)}
      ${swirl}
      <g fill="#b58cf0"><path d="M300,60 l3,8 l8,3 l-8,3 l-3,8 l-3,-8 l-8,-3 l8,-3 Z"/><path d="M350,150 l2,6 l6,2 l-6,2 l-2,6 l-2,-6 l-6,-2 l6,-2 Z"/></g>`, '#1d1838');
  }
  if (kind === 'escape') {
    const r = rng(17);
    let books = '';
    for (let i = 0; i < 7; i++) {
      const x = 30 + i * 52, y = 140 + r() * 60, rot = (r() - 0.5) * 90;
      books += `<g transform="rotate(${rot} ${x + 20} ${y + 14})"><rect x="${x}" y="${y}" width="44" height="30" rx="2" fill="${[P.vermilion, P.lapis, P.verdigris, P.ochre][i % 4]}" ${OUTLINE}/><rect x="${x + 10}" y="${y + 6}" width="26" height="18" fill="none" stroke="${P.goldMid}" stroke-width="1.5"/></g>`;
    }
    const pop = [['griffin', 70, 70, 70, -10], ['candle-flame', 160, 60, 60, 12], ['mandrake', 240, 75, 66, -8], ['unicorn', 330, 70, 72, 6], ['wave', 120, 120, 48, 20], ['rose', 290, 130, 50, -16]];
    return panelFrame(`
      <rect x="0" y="0" width="400" height="260" fill="url(#sc-stone-warm)"/>
      <rect x="0" y="215" width="400" height="45" fill="url(#sc-tiles)"/>
      ${books}
      ${pop.map(([id, x, y, s, rot]) => `<path d="M${x},${y + s * 0.5} l0,${30}" stroke="${P.goldMid}" stroke-width="2" stroke-dasharray="3 5"/>` + iconAt(id, x, y, s, rot)).join('')}`, P.parchment);
  }
  if (kind === 'howto') {
    const col = (book, ids, x) => `
      ${ids.map((id, i) => iconAt(id, x - 34 + i * 34, 50, 36)).join('')}
      <path d="M${x},74 L${x},96" stroke="${P.ink}" stroke-width="3"/><path d="M${x - 8},90 L${x},102 L${x + 8},90" fill="none" stroke="${P.ink}" stroke-width="3" stroke-linejoin="round"/>
      <use href="#book-${book}" x="${x - 42}" y="106" width="84" height="110"/>`;
    return panelFrame(`
      ${col('bestiary', ['unicorn', 'dragon', 'pelican'], 75)}
      ${col('alchemy', ['candle-flame', 'water-droplet', 'cloud'], 200)}
      ${col('herbarium', ['rose', 'lily', 'sage'], 325)}`, P.vellum);
  }
  // restored: the finale
  return panelFrame(`
    <rect x="0" y="0" width="400" height="260" fill="url(#sc-stone-warm)"/>
    <rect x="0" y="215" width="400" height="45" fill="url(#sc-tiles)"/>
    ${fullShelves(20, 40, 120, 3, 21)}
    ${fullShelves(260, 40, 120, 3, 29)}
    <path d="M160,40 L160,120 Q200,70 240,120 L240,40 Q200,0 160,40 Z" fill="url(#sc-glass-night)" ${OUTLINE}/>
    ${witch(206, 74, 0.46, true)}
    <circle cx="200" cy="170" r="60" fill="url(#mm-halo)"/>
    <use href="#book-bestiary" x="140" y="140" width="40" height="52"/>
    <use href="#book-alchemy" x="180" y="128" width="40" height="52"/>
    <use href="#book-herbarium" x="220" y="140" width="40" height="52"/>`, P.parchment);
}
