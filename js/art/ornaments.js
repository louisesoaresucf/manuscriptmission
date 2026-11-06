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

// The witch: a tall sorceress in a dark glory (the almond-shaped aura of
// illuminated manuscripts, made sinister), her cloak spread like wings.
const NIGHT = '#1a1226';
const GOWN = '#3b2560';
const CLOAK = '#24163a';
const SKIN = '#dcd2e2';
const HAIR = '#cfcbdc';
const SPELL = '#8ef0b8';

export function witchDefs() {
  return `
  <defs>
    <radialGradient id="w-mandorla" cx="0.5" cy="0.45" r="0.6">
      <stop offset="0" stop-color="#6a3fa8"/>
      <stop offset="0.6" stop-color="#2c1a4a"/>
      <stop offset="1" stop-color="#130c20"/>
    </radialGradient>
    <radialGradient id="w-orb" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="0.3" stop-color="${SPELL}"/>
      <stop offset="1" stop-color="${SPELL}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="w-circle" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#b58cf0" stop-opacity="0.45"/>
      <stop offset="1" stop-color="#b58cf0" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="w-gown" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#5a3a8a"/><stop offset="0.55" stop-color="${GOWN}"/><stop offset="1" stop-color="#22143a"/>
    </linearGradient>
  </defs>`;
}

export function witch(x, y, s = 1) {
  const runes = [];
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    const rx = Math.cos(a) * 95, ry = Math.sin(a) * 12;
    runes.push(`<path d="M${(rx - 2).toFixed(1)},${(90 + ry - 2).toFixed(1)} l2,4 l2,-4 M${rx.toFixed(1)},${(90 + ry - 3).toFixed(1)} v6" stroke="#cdb4ff" stroke-width="1" fill="none"/>`);
  }
  return `
  <g transform="translate(${x},${y}) scale(${s})">
    <!-- the dark glory behind her -->
    <path d="M0,-188 C78,-128 92,0 0,100 C-92,0 -78,-128 0,-188 Z" fill="url(#w-mandorla)" stroke="${P.goldMid}" stroke-width="4"/>
    <path d="M0,-178 C70,-122 82,0 0,90 C-82,0 -70,-122 0,-178 Z" fill="none" stroke="${P.goldPale}" stroke-width="1.6" stroke-dasharray="0.1 6" stroke-linecap="round"/>
    <!-- magic circle at her feet -->
    <ellipse cx="0" cy="90" rx="120" ry="20" fill="url(#w-circle)"/>
    <ellipse cx="0" cy="90" rx="104" ry="15" fill="none" stroke="#b58cf0" stroke-width="2"/>
    <ellipse cx="0" cy="90" rx="86" ry="10" fill="none" stroke="#b58cf0" stroke-width="1.2" stroke-dasharray="3 3"/>
    ${runes.join('')}
    <!-- staff: gnarled wood crowned with a crescent and a glowing orb -->
    <path d="M-80,90 C-78,40 -82,-20 -78,-80 C-77,-110 -80,-130 -78,-150" fill="none" stroke="${P.ink}" stroke-width="8" stroke-linecap="round"/>
    <path d="M-80,90 C-78,40 -82,-20 -78,-80 C-77,-110 -80,-130 -78,-150" fill="none" stroke="#4a2c18" stroke-width="4.5" stroke-linecap="round"/>
    <path d="M-80,20 l-4,-3 M-79,-40 l4,-4 M-78,-110 l-4,-2" stroke="${P.ink}" stroke-width="2"/>
    <circle cx="-78" cy="-162" r="22" fill="url(#w-orb)"/>
    <path d="M-92,-150 C-100,-166 -92,-182 -76,-184 C-88,-176 -90,-162 -78,-152 C-70,-148 -62,-150 -58,-156 C-60,-146 -74,-140 -92,-150 Z" fill="${P.gold}" ${OUTLINE} stroke-width="1.6"/>
    <circle cx="-78" cy="-164" r="6.5" fill="${SPELL}" stroke="${P.ink}" stroke-width="1.2"/>
    <circle cx="-80" cy="-166" r="2" fill="#ffffff"/>
    <!-- cloak, spread like wings, with a red diapered lining -->
    <path d="M-28,-74 L-70,-62 C-90,-12 -108,40 -122,92 L122,92 C112,30 98,-34 74,-100 L28,-74 Z" fill="${CLOAK}" ${OUTLINE} stroke-width="2.5"/>
    <path d="M-30,-62 L-64,-52 C-80,-6 -96,44 -106,92 L106,92 C98,36 86,-24 66,-86 L30,-62 Z" fill="url(#mm-diaper-red)" stroke="${P.ink}" stroke-width="1.5"/>
    <path d="M-30,-62 L-64,-52 C-80,-6 -96,44 -106,92 L106,92 C98,36 86,-24 66,-86 L30,-62 Z" fill="#12091c" opacity="0.32"/>
    <path d="M-70,-62 C-90,-12 -108,40 -122,92 M74,-100 C98,-34 112,30 122,92" fill="none" stroke="${P.goldMid}" stroke-width="3.5"/>
    <path d="M-72,-50 C-90,0 -104,46 -116,88 M76,-86 C96,-28 108,30 116,88" fill="none" stroke="${P.goldPale}" stroke-width="1.4" stroke-dasharray="0.1 5" stroke-linecap="round"/>
    <!-- gown -->
    <path d="M-24,-74 C-30,-20 -40,40 -54,92 L54,92 C40,40 30,-20 24,-74 Z" fill="url(#w-gown)" ${OUTLINE} stroke-width="2"/>
    <path d="M-8,-64 L8,-64 L13,82 L-13,82 Z" fill="${CLOAK}" stroke="${P.goldMid}" stroke-width="1.6"/>
    <path d="M0,-58 V78" stroke="${P.goldPale}" stroke-width="1.6" stroke-dasharray="0.1 5" stroke-linecap="round"/>
    <path d="M-52,82 L52,82 L54,92 L-54,92 Z" fill="${P.gold}" ${OUTLINE} stroke-width="1.4"/>
    <path d="M-44,87 l4,-3 l4,3 l-4,3 Z M-24,87 l4,-3 l4,3 l-4,3 Z M-4,87 l4,-3 l4,3 l-4,3 Z M16,87 l4,-3 l4,3 l-4,3 Z M36,87 l4,-3 l4,3 l-4,3 Z" fill="${P.vermilion}"/>
    <!-- girdle with a crescent pendant -->
    <path d="M-27,-22 Q0,-12 27,-22" fill="none" stroke="${P.ink}" stroke-width="5"/>
    <path d="M-27,-22 Q0,-12 27,-22" fill="none" stroke="${P.goldMid}" stroke-width="3"/>
    <path d="M2,-16 C2,0 4,20 3,36" fill="none" stroke="${P.goldMid}" stroke-width="1.6" stroke-dasharray="2 1.5"/>
    <path d="M-2,36 C-2,44 8,46 10,40 C6,42 2,40 3,36 Z" fill="${P.gold}" stroke="${P.ink}" stroke-width="1"/>
    <!-- high standing collar -->
    <path d="M-30,-74 L-44,-118 L-12,-88 Z" fill="${CLOAK}" stroke="${P.goldMid}" stroke-width="2.2" stroke-linejoin="round"/>
    <path d="M30,-74 L44,-118 L12,-88 Z" fill="${CLOAK}" stroke="${P.goldMid}" stroke-width="2.2" stroke-linejoin="round"/>
    <!-- left arm gripping the staff -->
    <path d="M-24,-74 L-68,-68 L-78,-50 C-62,-38 -46,-44 -28,-56 Z" fill="${GOWN}" ${OUTLINE} stroke-width="2"/>
    <path d="M-68,-68 L-78,-50" stroke="${P.goldMid}" stroke-width="4"/>
    <path d="M-84,-72 C-82,-78 -74,-78 -72,-72 L-72,-64 C-76,-60 -82,-62 -84,-66 Z" fill="${SKIN}" ${OUTLINE} stroke-width="1.4"/>
    <!-- right arm raised, casting -->
    <path d="M22,-76 C40,-88 52,-100 60,-112 L76,-102 C72,-84 62,-64 48,-48 C40,-56 32,-64 22,-70 Z" fill="${GOWN}" ${OUTLINE} stroke-width="2"/>
    <path d="M60,-112 L76,-102" stroke="${P.goldMid}" stroke-width="4"/>
    <path d="M64,-110 C62,-118 64,-124 68,-126 L70,-136 M68,-126 L74,-138 M70,-124 L80,-134 M72,-118 L84,-124 M64,-112 C68,-108 76,-110 74,-118" fill="${SKIN}" stroke="${P.ink}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M65,-112 C64,-118 66,-123 69,-125 L72,-120 L74,-112 Z" fill="${SKIN}"/>
    <!-- spell-light pouring from her hand -->
    <circle cx="84" cy="-140" r="26" fill="url(#w-orb)"/>
    <path d="M84,-140 C110,-160 140,-150 150,-120 C158,-96 132,-84 122,-100" fill="none" stroke="#b58cf0" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M86,-142 C104,-176 140,-182 160,-160" fill="none" stroke="${SPELL}" stroke-width="2" stroke-linecap="round"/>
    <path d="M82,-138 C96,-118 104,-90 96,-64" fill="none" stroke="${P.goldPale}" stroke-width="1.4" stroke-dasharray="1 5" stroke-linecap="round"/>
    <!-- silver hair -->
    <path d="M-14,-112 C-24,-100 -26,-80 -34,-58 L-20,-64 C-16,-80 -14,-92 -12,-100 Z" fill="${HAIR}" ${OUTLINE} stroke-width="1.4"/>
    <path d="M14,-112 C24,-100 26,-80 34,-58 L20,-64 C16,-80 14,-92 12,-100 Z" fill="${HAIR}" ${OUTLINE} stroke-width="1.4"/>
    <path d="M-20,-96 C-24,-84 -26,-74 -28,-64 M20,-96 C24,-84 26,-74 28,-64" stroke="#8e89a3" stroke-width="0.9" fill="none"/>
    <!-- face: stern, sharp, with glowing eyes -->
    <path d="M-6,-86 L6,-86 L5,-76 L-5,-76 Z" fill="${SKIN}"/>
    <path d="M-12.5,-104 C-12.5,-119 12.5,-119 12.5,-104 C12.5,-95 6,-85 0,-83 C-6,-85 -12.5,-95 -12.5,-104 Z" fill="${SKIN}" ${OUTLINE} stroke-width="1.6"/>
    <path d="M-8.5,-103.5 Q-5,-106.8 -1.8,-103.5 Q-5,-102 -8.5,-103.5 Z M8.5,-103.5 Q5,-106.8 1.8,-103.5 Q5,-102 8.5,-103.5 Z" fill="${SPELL}"/>
    <path d="M-5.2,-105 v3 M5.2,-105 v3" stroke="${P.ink}" stroke-width="1"/>
    <path d="M-10.5,-109 L-2.5,-106 M10.5,-109 L2.5,-106" stroke="${P.ink}" stroke-width="1.7" stroke-linecap="round"/>
    <path d="M0,-103 L-1.6,-95.5 L1,-95.5" fill="none" stroke="${P.ink}" stroke-width="0.9"/>
    <path d="M-3.6,-90.5 Q0,-89.4 3.6,-90.5" stroke="#5a1a2a" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    <path d="M-11,-99 Q-9,-94 -6,-91 M11,-99 Q9,-94 6,-91" stroke="#a89cb8" stroke-width="0.9" fill="none"/>
    <!-- circlet -->
    <path d="M-12.5,-108.5 Q0,-113 12.5,-108.5" fill="none" stroke="${P.goldMid}" stroke-width="2.4"/>
    <circle cx="0" cy="-111.5" r="2.2" fill="${SPELL}" stroke="${P.ink}" stroke-width="0.8"/>
    <!-- tall hat -->
    <path d="M-36,-112 C-20,-121 20,-121 36,-112 C20,-107 -20,-107 -36,-112 Z" fill="${NIGHT}" ${OUTLINE} stroke-width="1.6"/>
    <path d="M-13,-116 C-10,-142 -2,-168 12,-190 C9,-174 11,-150 14,-116 Z" fill="${NIGHT}" ${OUTLINE} stroke-width="1.6"/>
    <path d="M-12.5,-120 L13.6,-120" stroke="${P.goldMid}" stroke-width="3"/>
    <path d="M2,-140 C-4,-136 -3,-128 3,-126 C-1,-129 -1,-136 2,-140 Z" fill="${P.goldPale}"/>
    <!-- motes of magic -->
    <g fill="${P.goldPale}">
      <path d="M120,-60 l2,5 l5,2 l-5,2 l-2,5 l-2,-5 l-5,-2 l5,-2 Z"/>
      <path d="M-120,-120 l1.5,4 l4,1.5 l-4,1.5 l-1.5,4 l-1.5,-4 l-4,-1.5 l4,-1.5 Z"/>
      <path d="M140,-190 l1.5,4 l4,1.5 l-4,1.5 l-1.5,4 l-1.5,-4 l-4,-1.5 l4,-1.5 Z"/>
    </g>
    <g fill="#b58cf0"><circle cx="128" cy="-150" r="2"/><circle cx="104" cy="-100" r="1.6"/><circle cx="-104" cy="-60" r="1.8"/><circle cx="60" cy="40" r="1.5"/></g>
  </g>`;
}

// The witch fleeing on her broomstick: a silhouette against the moon.
export function witchFlying(x, y, s = 1) {
  return `
  <g transform="translate(${x},${y}) scale(${s})" fill="${NIGHT}" stroke="${NIGHT}" stroke-linejoin="round">
    <!-- streaming cloak -->
    <path d="M-6,-10 C-30,-14 -50,-6 -74,-16 L-62,-6 L-84,-2 L-64,4 L-80,14 L-54,10 C-36,10 -20,8 -4,4 Z"/>
    <!-- broom -->
    <path d="M-40,14 L54,0" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <path d="M-40,14 L-64,4 L-70,16 L-62,26 Z"/>
    <!-- body, arm and hat -->
    <path d="M-10,-12 C-6,-24 6,-24 10,-12 L14,8 L-8,10 Z"/>
    <path d="M8,-12 L30,-2 L28,2 L8,-4 Z"/>
    <path d="M-12,-26 C-4,-30 6,-30 14,-26 C6,-23 -4,-23 -12,-26 Z"/>
    <path d="M-6,-28 C-10,-40 -20,-50 -34,-54 C-22,-44 -10,-36 4,-28 Z"/>
    <circle cx="1" cy="-20" r="6"/>
    <path d="M-4,-20 C-12,-14 -18,-6 -26,0 C-14,-8 -6,-14 -2,-16 Z"/>
  </g>
  <g transform="translate(${x},${y}) scale(${s})">
    <circle cx="4" cy="-21" r="1.2" fill="${SPELL}"/>
    <path d="M-12,-27.5 L13,-27.5" stroke="${P.goldMid}" stroke-width="1.4"/>
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
    const r = rng(41);
    let flying = '';
    for (let i = 0; i < 9; i++) {
      const x = 40 + r() * 320, y = 30 + r() * 120, rot = (r() - 0.5) * 120;
      flying += `<g transform="rotate(${rot.toFixed(0)} ${x.toFixed(0)} ${y.toFixed(0)})" opacity="0.9">${bookSpine(x, y, 9, 26, [P.vermilion, P.lapis, P.verdigris, P.ochre, P.rose][i % 5])}</g>`;
    }
    return panelFrame(`
      ${witchDefs()}
      <rect x="0" y="0" width="400" height="260" fill="#120c1c"/>
      <rect x="0" y="0" width="400" height="260" fill="url(#sc-stone-dark)" opacity="0.35"/>
      ${fullShelves(-10, 60, 90, 3, 9)}
      ${fullShelves(320, 60, 90, 3, 13)}
      <rect x="0" y="0" width="400" height="260" fill="#120c1c" opacity="0.45"/>
      <rect x="0" y="222" width="400" height="38" fill="url(#sc-flags)"/>
      <rect x="0" y="222" width="400" height="38" fill="#120c1c" opacity="0.55"/>
      ${flying}
      <path d="M90,60 C150,20 260,20 320,70" fill="none" stroke="#b58cf0" stroke-width="1.6" stroke-dasharray="2 6" stroke-linecap="round" opacity="0.8"/>
      ${witch(200, 140, 0.62)}`, '#120c1c');
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
    <path d="M156,124 L156,52 Q156,22 200,14 Q244,22 244,52 L244,124 Z" fill="#1b2550" ${OUTLINE} stroke-width="3"/>
    <g fill="${P.goldPale}"><circle cx="172" cy="40" r="1.4"/><circle cx="230" cy="36" r="1.2"/><circle cx="226" cy="104" r="1.2"/></g>
    <circle cx="204" cy="70" r="30" fill="#f4e7b8"/>
    <circle cx="204" cy="70" r="30" fill="none" stroke="${P.goldMid}" stroke-width="1.5"/>
    ${witchFlying(206, 76, 0.5)}
    <path d="M156,124 L156,52 Q156,22 200,14 Q244,22 244,52 L244,124 Z" fill="none" stroke="${P.stoneLight}" stroke-width="6"/>
    <circle cx="200" cy="170" r="60" fill="url(#mm-halo)"/>
    <use href="#book-bestiary" x="140" y="140" width="40" height="52"/>
    <use href="#book-alchemy" x="180" y="128" width="40" height="52"/>
    <use href="#book-herbarium" x="220" y="140" width="40" height="52"/>`, P.parchment);
}
