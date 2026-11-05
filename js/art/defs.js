// Shared palette and SVG <defs> for the illuminated-manuscript art style.
// Every drawing references these ids, so the sprite must be mounted once
// (see sprite.js) before any <use href="#item-..."> is rendered.

export const P = {
  lapis: '#1f3a8a',
  lapisDark: '#142a66',
  lapisLight: '#4a6bc4',
  vermilion: '#b8322a',
  vermilionDark: '#8a2119',
  verdigris: '#2f7d5b',
  verdigrisDark: '#1f5a40',
  verdigrisLight: '#5aa37f',
  ochre: '#c8902e',
  rose: '#b4536a',
  roseLight: '#d98aa0',
  parchment: '#f1e4c3',
  vellum: '#f8f1de',
  ink: '#2a1c10',
  white: '#fbf8ef',
  tan: '#d6a76b',
  tanDark: '#a8773e',
  gold: 'url(#mm-gold)',
  goldV: 'url(#mm-gold-v)',
  goldPale: '#f7e08a',
  goldMid: '#c9a227',
  goldDeep: '#8a6a12',
};

// Common stroke attribute strings, so drawings stay consistent.
export const OUTLINE = `stroke="${P.ink}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"`;
export const FINE = `fill="none" stroke="${P.ink}" stroke-width="0.8" stroke-linecap="round"`;
export const HILITE = `fill="none" stroke="${P.white}" stroke-width="0.9" stroke-linecap="round" opacity="0.85"`;

export function defsMarkup() {
  return `
  <defs>
    <linearGradient id="mm-gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${P.goldPale}"/>
      <stop offset="0.35" stop-color="#e6c65a"/>
      <stop offset="0.6" stop-color="${P.goldMid}"/>
      <stop offset="0.8" stop-color="#f0d77a"/>
      <stop offset="1" stop-color="${P.goldDeep}"/>
    </linearGradient>
    <linearGradient id="mm-gold-v" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${P.goldPale}"/>
      <stop offset="0.5" stop-color="${P.goldMid}"/>
      <stop offset="0.75" stop-color="#e9cf6c"/>
      <stop offset="1" stop-color="${P.goldDeep}"/>
    </linearGradient>
    <radialGradient id="mm-halo" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="${P.goldPale}" stop-opacity="0.9"/>
      <stop offset="0.7" stop-color="${P.goldMid}" stop-opacity="0.45"/>
      <stop offset="1" stop-color="${P.goldMid}" stop-opacity="0"/>
    </radialGradient>

    <!-- Hammered gold-leaf texture: use sparingly (title, book covers). -->
    <filter id="mm-burnish" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="noise"/>
      <feColorMatrix in="noise" type="matrix"
        values="0 0 0 0 0.35  0 0 0 0 0.25  0 0 0 0 0.05  0 0 0 0.35 0" result="tint"/>
      <feComposite in="tint" in2="SourceGraphic" operator="in" result="speckle"/>
      <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="speckle"/></feMerge>
    </filter>

    <!-- Diapered (checkered) grounds with gold dots at the joins. -->
    <pattern id="mm-diaper-red" width="10" height="10" patternUnits="userSpaceOnUse">
      <rect width="10" height="10" fill="${P.vermilion}"/>
      <rect width="5" height="5" fill="${P.vermilionDark}"/>
      <rect x="5" y="5" width="5" height="5" fill="${P.vermilionDark}"/>
      <circle cx="5" cy="5" r="0.9" fill="${P.goldPale}"/>
      <circle cx="0" cy="0" r="0.9" fill="${P.goldPale}"/>
      <circle cx="10" cy="10" r="0.9" fill="${P.goldPale}"/>
    </pattern>
    <pattern id="mm-diaper-blue" width="10" height="10" patternUnits="userSpaceOnUse">
      <rect width="10" height="10" fill="${P.lapis}"/>
      <rect width="5" height="5" fill="${P.lapisDark}"/>
      <rect x="5" y="5" width="5" height="5" fill="${P.lapisDark}"/>
      <circle cx="5" cy="5" r="0.9" fill="${P.goldPale}"/>
      <circle cx="0" cy="0" r="0.9" fill="${P.goldPale}"/>
      <circle cx="10" cy="10" r="0.9" fill="${P.goldPale}"/>
    </pattern>
    <pattern id="mm-diaper-green" width="10" height="10" patternUnits="userSpaceOnUse">
      <rect width="10" height="10" fill="${P.verdigris}"/>
      <rect width="5" height="5" fill="${P.verdigrisDark}"/>
      <rect x="5" y="5" width="5" height="5" fill="${P.verdigrisDark}"/>
      <circle cx="5" cy="5" r="0.9" fill="${P.goldPale}"/>
      <circle cx="0" cy="0" r="0.9" fill="${P.goldPale}"/>
      <circle cx="10" cy="10" r="0.9" fill="${P.goldPale}"/>
    </pattern>
  </defs>`;
}

// A ring of gold dots — the classic border of an illuminated roundel.
export function dotRing(cx, cy, r, count, dotR = 1.1, fill = P.goldMid) {
  let s = '';
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    s += `<circle cx="${(cx + r * Math.cos(a)).toFixed(2)}" cy="${(cy + r * Math.sin(a)).toFixed(2)}" r="${dotR}" fill="${fill}"/>`;
  }
  return s;
}

// Rays radiating from a centre (used for halos, suns, glories).
export function rays(cx, cy, r1, r2, count, attrs) {
  let s = '';
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    s += `<line x1="${(cx + r1 * Math.cos(a)).toFixed(2)}" y1="${(cy + r1 * Math.sin(a)).toFixed(2)}" x2="${(cx + r2 * Math.cos(a)).toFixed(2)}" y2="${(cy + r2 * Math.sin(a)).toFixed(2)}" ${attrs}/>`;
  }
  return s;
}
