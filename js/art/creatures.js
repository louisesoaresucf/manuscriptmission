// Creatures of the Bestiary. Each function returns the inner markup of a
// 100×100 <symbol>. Style: bold ink outline, flat pigment fills, gold leaf,
// white highlight strokes — after 13th-century English bestiaries.
import { P, OUTLINE, FINE, HILITE } from './defs.js';

const TALON = `fill="none" stroke="${P.ink}" stroke-width="2.2" stroke-linecap="round"`;

export function griffin() {
  return `
  <g ${OUTLINE}>
    <!-- far hind leg (shadowed) -->
    <path d="M62,66 C62,74 60,80 61,86 L66,88 L57,89 C55,82 55,74 56,67 Z" fill="${P.goldDeep}"/>
    <!-- tail with tuft -->
    <path d="M77,58 C86,54 91,45 88,33" fill="none" stroke="${P.ink}" stroke-width="5"/>
    <path d="M77,58 C86,54 91,45 88,33" fill="none" stroke="${P.goldMid}" stroke-width="2.6"/>
    <path d="M88,35 C83,32 84,25 89,26 C90,21 96,23 95,28 C99,30 96,36 91,35 Z" fill="${P.vermilion}"/>
    <!-- eagle legs (tops tucked behind the body) -->
    <path d="M38,58 L45,58 L43.5,82 L39.5,82 Z" fill="${P.ochre}"/>
    <path d="M33,55 L39,60 L30,71 L26,68 Z" fill="${P.ochre}"/>
    <!-- lion body -->
    <path d="M36,52 C44,46 60,45 72,48 C80,50 83,57 80,63 C78,68 73,70 66,69 L46,69 C40,69 35,66 34,60 Z" fill="${P.gold}"/>
    <!-- near hind leg -->
    <path d="M70,62 C72,71 74,78 76,85 C79,85 82,86 82,89 L71,89 L69,84 C66,78 63,73 61,68 Z" fill="${P.gold}"/>
    <!-- wing -->
    <path d="M44,53 C40,38 47,21 61,13 C68,9 77,7 85,9 L79,15 L87,18 L77,23 L84,28 L73,31 L78,37 L66,39 L68,45 L58,46 C54,48 48,51 44,53 Z" fill="${P.lapis}"/>
    <path d="M45,48 C44,36 50,24 62,15 C68,19 66,27 60,33 C55,39 50,44 45,48 Z" fill="${P.vermilion}"/>
    <!-- neck and eagle head -->
    <path d="M47,52 C43,45 39,38 36,31 C34,24 31,17 24,16 C18,15 13,19 13,24 L14,30 C16,35 19,40 22,45 C25,50 28,55 33,60 Z" fill="${P.gold}"/>
    <!-- ear -->
    <path d="M25,17 L30,7 L32,19 Z" fill="${P.gold}"/>
    <!-- hooked beak -->
    <path d="M14,19 C9,18 3,21 2,28 C3,29.5 4.5,29.5 5.5,27.5 C7.5,25 11,25.5 14,28 Z" fill="${P.ochre}"/>
  </g>
  <!-- talons -->
  <path d="M39.5,82 q-4,2 -6,6 M41.5,82 q0,4 -1,7 M43.5,82 q3,2 4,6" ${TALON}/>
  <path d="M28,70 q-4,0 -6,1.5 M27,69 q-3,-2 -5,-3.5 M28.5,71 q-1,3 -2.5,5" ${TALON}/>
  <!-- eye -->
  <circle cx="19.5" cy="22" r="2.4" fill="${P.white}" stroke="${P.ink}" stroke-width="1"/>
  <circle cx="19" cy="22" r="1.2" fill="${P.ink}"/>
  <path d="M16.5,19 q3,-1.8 6,0" ${FINE}/>
  <!-- feather scallops on the neck -->
  <path d="M24,29 q2,2.5 4,0 M29,29 q2,2.5 4,0 M22,35 q2,2.5 4,0 M27,35 q2,2.5 4,0 M32,35 q2,2.5 4,0
           M25,41 q2,2.5 4,0 M30,41 q2,2.5 4,0 M35,41 q2,2.5 4,0 M29,47 q2,2.5 4,0 M34,47 q2,2.5 4,0" ${FINE}/>
  <!-- wing feathers -->
  <path d="M80,17 L68,20 M78,25 L66,27 M71,32 L62,34 M64,40 L56,41" ${HILITE}/>
  <path d="M48,44 C48,36 53,27 61,19" ${HILITE}/>
  <path d="M51,39 q2,-2 3,0 M54,33 q2,-2 3,0 M58,27 q2,-2 3,0" ${FINE}/>
  <!-- lion haunch and belly shading -->
  <path d="M66,57 C71,55 76,59 73,66" ${FINE}/>
  <path d="M47,66 C53,68 58,68 64,67 M49,63 l2,2 M54,64 l2,2 M59,64 l2,2" ${FINE}/>
  <path d="M52,51 C58,49 65,49 73,51" ${HILITE}/>
  <!-- leg scales -->
  <path d="M40,70 h3.5 M40,74 h3.5 M40,78 h3.5 M30.5,64.5 l3,3 M28.5,67 l2.5,2.5" ${FINE}/>
  `;
}
