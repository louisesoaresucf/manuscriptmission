// Modelled shading: turns each flat pigment into a soft light-to-shadow
// gradient, like the modelled painting of later Gothic manuscripts.
// Applied to drawings when the sprite is built, so every illustration
// gains depth without being redrawn.
import { P } from './defs.js';

const SHADED = [
  P.vermilion, P.vermilionDark, P.lapis, P.lapisDark, P.lapisLight, P.verdigris, P.verdigrisDark,
  P.verdigrisLight, P.ochre, P.rose, P.roseLight, P.violet, P.lavender, P.pink, P.tan, P.tanDark,
  P.stone, P.stoneLight, P.stoneDark, P.sage, P.sky, P.skin, P.white, P.vellum,
];

function mix(hex, target, t) {
  const n = parseInt(hex.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  const out = c.map((v, i) => Math.round(v + (target[i] - v) * t));
  return '#' + out.map((v) => v.toString(16).padStart(2, '0')).join('');
}

const id = (hex) => `sh-${hex.slice(1)}`;

export function shadingDefs() {
  return `<defs>${SHADED.map((hex) => `
    <linearGradient id="${id(hex)}" x1="0.15" y1="0" x2="0.75" y2="1">
      <stop offset="0" stop-color="${mix(hex, [255, 250, 235], 0.3)}"/>
      <stop offset="0.5" stop-color="${hex}"/>
      <stop offset="1" stop-color="${mix(hex, [30, 18, 10], 0.32)}"/>
    </linearGradient>`).join('')}</defs>`;
}

const RE = new RegExp(`fill="(${SHADED.map((h) => h.replace('#', '#')).join('|')})"`, 'gi');

export function shade(markup) {
  return markup.replace(RE, (_, hex) => `fill="url(#${id(hex.toLowerCase())})"`);
}
