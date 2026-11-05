// Book covers, borders and other decoration.
import { P, OUTLINE, FINE, HILITE, dotRing } from './defs.js';

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
