// Elements for the Alchemy Codex: Fire, Water, Earth and Sky, drawn as
// illuminated emblems on gold-dotted halos.
import { P, OUTLINE, FINE, HILITE, dotRing } from './defs.js';

export function candleFlame() {
  return `
  <!-- halo behind the flame -->
  <circle cx="50" cy="30" r="25" fill="url(#mm-halo)"/>
  ${dotRing(50, 30, 26, 28, 1.1)}
  <g ${OUTLINE}>
    <!-- flame: three tongues of vermilion, ochre and gold -->
    <path d="M50,4 C56,14 67,21 65,34 C64,42 58,48 50,48 C42,48 36,42 35,34 C34,26 41,23 43,14 C46,20 48,21 48.5,17 C49,13 47.5,9 50,4 Z" fill="${P.vermilion}"/>
    <path d="M50,15 C54,23 60,28 58.5,36 C57.5,41.5 54,45 50,45 C46,45 42.5,41.5 42,36 C41.5,30 46,28 47,23 C48.5,26 49.5,24 50,15 Z" fill="${P.ochre}" stroke-width="1.2"/>
    <path d="M50,26 C53,31 55.5,34.5 54.5,38.5 C53.8,41.3 52,42.5 50,42.5 C48,42.5 46.2,41.3 45.6,38.5 C45,34.5 48,31.5 50,26 Z" fill="${P.goldPale}" stroke-width="1"/>
    <!-- candle -->
    <rect x="42" y="48" width="16" height="29" fill="${P.white}"/>
    <path d="M42,48 L58,48 L58,53 C57,53 56.5,59 55,59 C53.5,59 53.5,53 52.5,52.5 C51,52.5 51,56 49.5,56 C48,56 47.5,51.5 45.5,51.5 C44,51.5 43.5,55 42,55 Z" fill="${P.vellum}" stroke-width="1.2"/>
    <!-- pricket dish, stem and foot -->
    <ellipse cx="50" cy="78" rx="19" ry="4.5" fill="${P.gold}"/>
    <path d="M46.5,82 L53.5,82 L52.5,89 L47.5,89 Z" fill="${P.goldV}"/>
    <circle cx="50" cy="85" r="3.4" fill="${P.gold}"/>
    <path d="M35,95 C39,88 61,88 65,95 Z" fill="${P.gold}"/>
  </g>
  <!-- wick -->
  <path d="M50,43 L50,48" stroke="${P.ink}" stroke-width="1.6" stroke-linecap="round"/>
  <!-- flame highlights and flickers -->
  <path d="M39,33 C39,27 42,24 44,19" ${HILITE}/>
  <path d="M60,26 C62,29 63,32 62.5,36" ${HILITE}/>
  <path d="M30,22 q-3,-4 0,-8 M70,22 q3,-4 0,-8 M27,34 q-4,-2 -5,-6 M73,34 q4,-2 5,-6" fill="none" stroke="${P.vermilion}" stroke-width="1.4" stroke-linecap="round"/>
  <!-- candle wax shading -->
  <path d="M45,58 L45,75" ${FINE}/>
  <path d="M55,62 L55,75" stroke="${P.parchment}" stroke-width="2" fill="none"/>
  <!-- vermilion band on the dish rim -->
  <path d="M33,78 C40,81 60,81 67,78" fill="none" stroke="${P.vermilion}" stroke-width="1.2"/>
  <path d="M40,93 C44,90 56,90 60,93" ${HILITE}/>
  `;
}
