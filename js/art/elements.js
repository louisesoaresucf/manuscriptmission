// Elements for the Alchemy Codex: Fire, Water, Earth and Sky, drawn as
// illuminated emblems on gold-dotted halos.
import { P, OUTLINE, FINE, HILITE, dotRing, rays, tube, halo } from './defs.js';

export function candleFlame() {
  return `
  <!-- halo behind the flame -->
  <circle cx="50" cy="30" r="25" fill="url(#mm-halo)"/>
  ${dotRing(50, 30, 26, 28, 1.1)}
  <g ${OUTLINE}>
    <!-- flame: three tongues of vermilion, ochre and gold -->
    <g data-part="flame" data-pivot="50,47">
    <path d="M50,4 C56,14 67,21 65,34 C64,42 58,48 50,48 C42,48 36,42 35,34 C34,26 41,23 43,14 C46,20 48,21 48.5,17 C49,13 47.5,9 50,4 Z" fill="${P.vermilion}"/>
    <path d="M50,15 C54,23 60,28 58.5,36 C57.5,41.5 54,45 50,45 C46,45 42.5,41.5 42,36 C41.5,30 46,28 47,23 C48.5,26 49.5,24 50,15 Z" fill="${P.ochre}" stroke-width="1.2"/>
    <path d="M50,26 C53,31 55.5,34.5 54.5,38.5 C53.8,41.3 52,42.5 50,42.5 C48,42.5 46.2,41.3 45.6,38.5 C45,34.5 48,31.5 50,26 Z" fill="${P.goldPale}" stroke-width="1"/>
    </g>
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
  <g data-part="flame" data-pivot="50,47">
  <path d="M39,33 C39,27 42,24 44,19" ${HILITE}/>
  <path d="M60,26 C62,29 63,32 62.5,36" ${HILITE}/>
  <path d="M30,22 q-3,-4 0,-8 M70,22 q3,-4 0,-8 M27,34 q-4,-2 -5,-6 M73,34 q4,-2 5,-6" fill="none" stroke="${P.vermilion}" stroke-width="1.4" stroke-linecap="round"/>
  </g>
  <!-- candle wax shading -->
  <path d="M45,58 L45,75" ${FINE}/>
  <path d="M55,62 L55,75" stroke="${P.parchment}" stroke-width="2" fill="none"/>
  <!-- vermilion band on the dish rim -->
  <path d="M33,78 C40,81 60,81 67,78" fill="none" stroke="${P.vermilion}" stroke-width="1.2"/>
  <path d="M40,93 C44,90 56,90 60,93" ${HILITE}/>
  `;
}

// ---------- WATER ----------
export function waterDroplet() {
  return `
  ${halo(50, 52, 40)}
  <g ${OUTLINE}>
    <path d="M50,6 C58,24 74,40 74,60 C74,76 63,88 50,88 C37,88 26,76 26,60 C26,40 42,24 50,6 Z" fill="${P.lapis}"/>
    <path d="M50,26 C55,38 65,48 65,62 C65,73 58,80 50,80 C42,80 35,73 35,62 C35,48 45,38 50,26 Z" fill="${P.lapisLight}" stroke-width="1.2"/>
  </g>
  <path d="M38,56 C36,64 38,72 44,76" ${HILITE} stroke-width="2.2"/>
  <path d="M40,64 q5,-4 10,0 q5,4 10,0 M42,71 q4,-3 8,0 q4,3 8,0" fill="none" stroke="${P.white}" stroke-width="1.2" stroke-linecap="round"/>
  <g fill="${P.lapisLight}" ${OUTLINE} stroke-width="1">
    <path d="M18,30 q3,5 0,7 q-3,-2 0,-7 Z"/><path d="M82,30 q3,5 0,7 q-3,-2 0,-7 Z"/>
    <path d="M14,62 q2.5,4 0,6 q-2.5,-2 0,-6 Z"/><path d="M86,62 q2.5,4 0,6 q-2.5,-2 0,-6 Z"/>
  </g>`;
}

export function wave() {
  return `
  ${halo(50, 50, 40)}
  <g ${OUTLINE}>
    <path d="M8,80 C14,56 30,30 56,26 C76,23 90,36 88,50 C86,62 72,66 66,58 C62,52 66,44 72,46 C68,40 56,40 50,50 C44,60 46,72 54,80 Z" fill="${P.lapis}"/>
    <path d="M12,92 C10,84 14,80 20,80 L88,80 C92,82 92,90 88,92 Z" fill="${P.lapisDark}"/>
  </g>
  <path d="M18,72 C24,54 36,38 54,33 M58,31 C70,29 82,36 82,46" fill="none" stroke="${P.lapisLight}" stroke-width="2.5" stroke-linecap="round"/>
  <!-- foam curls -->
  <g fill="${P.white}" ${OUTLINE} stroke-width="1">
    <circle cx="74" cy="52" r="3.4"/><circle cx="82" cy="50" r="3"/><circle cx="86" cy="43" r="2.8"/>
    <circle cx="85" cy="35" r="2.6"/><circle cx="79" cy="29" r="2.4"/>
  </g>
  <path d="M22,86 q5,-3 10,0 q5,3 10,0 q5,-3 10,0 q5,3 10,0 q5,-3 10,0 q5,3 10,0" fill="none" stroke="${P.white}" stroke-width="1.3" stroke-linecap="round"/>
  <path d="M26,74 q4,-3 8,0 M34,62 q4,-3 8,0" ${HILITE}/>`;
}

export function fountain() {
  return `
  ${halo(50, 46, 40)}
  <!-- jets of water -->
  <g data-part="jets" data-pivot="50,50">
  ${tube('M50,22 C42,10 30,16 26,34', P.lapisLight, 2.2)}
  ${tube('M50,22 C58,10 70,16 74,34', P.lapisLight, 2.2)}
  ${tube('M44,50 C34,48 26,54 22,64', P.lapisLight, 2)}
  ${tube('M56,50 C66,48 74,54 78,64', P.lapisLight, 2)}
  </g>
  <g ${OUTLINE}>
    <!-- lower basin -->
    <path d="M14,64 L86,64 C84,74 70,80 50,80 C30,80 16,74 14,64 Z" fill="${P.stoneLight}"/>
    <path d="M18,64 C24,68 76,68 82,64 Z" fill="${P.lapis}" stroke-width="1.2"/>
    <!-- pillar and upper basin -->
    <rect x="46" y="38" width="8" height="26" fill="${P.stoneLight}"/>
    <path d="M32,38 L68,38 C66,46 58,50 50,50 C42,50 34,46 32,38 Z" fill="${P.stoneLight}"/>
    <path d="M35,38 C40,41 60,41 65,38 Z" fill="${P.lapis}" stroke-width="1.1"/>
    <path d="M46,38 L46,26 L54,26 L54,38 Z" fill="${P.gold}"/>
    <circle cx="50" cy="23" r="4" fill="${P.gold}"/>
    <!-- foot -->
    <path d="M40,80 L60,80 L64,92 L36,92 Z" fill="${P.stoneLight}"/>
  </g>
  <path d="M20,70 l3,3 M28,73 l3,3 M38,75 l3,3 M58,75 l3,3 M68,73 l3,3 M76,70 l3,3 M40,44 l2,2 M56,44 l2,2" ${FINE}/>
  <g fill="${P.lapisLight}" stroke="${P.ink}" stroke-width="0.8"><circle cx="25" cy="38" r="1.8"/><circle cx="75" cy="38" r="1.8"/><circle cx="21" cy="68" r="1.6"/><circle cx="79" cy="68" r="1.6"/></g>
  <path d="M22,68 C30,72 40,74 46,74" ${HILITE}/>`;
}

// ---------- EARTH ----------
export function mountain() {
  return `
  ${halo(50, 50, 40)}
  <g ${OUTLINE}>
    <!-- back peak -->
    <path d="M30,84 L48,16 C50,12 54,12 56,16 L76,84 Z" fill="${P.tan}"/>
    <!-- medieval "stepped" rock ledges -->
    <path d="M50,26 C54,24 56,28 54,30 M46,40 C52,37 58,40 56,44 M42,56 C50,52 60,55 60,60" fill="none"/>
    <!-- front peaks -->
    <path d="M10,88 L28,40 C30,36 34,36 36,40 L52,88 Z" fill="${P.verdigris}"/>
    <path d="M46,88 L64,46 C66,42 70,42 72,46 L90,88 Z" fill="${P.verdigrisDark}"/>
  </g>
  <path d="M27,48 C30,46 33,47 34,50 M22,62 C27,59 33,60 36,64 M18,76 C24,72 34,73 38,78" fill="none" stroke="${P.ink}" stroke-width="1.6" stroke-linecap="round"/>
  <path d="M63,54 C66,52 69,53 70,56 M58,68 C63,65 70,66 73,70 M56,80 C62,77 72,78 76,82" fill="none" stroke="${P.ink}" stroke-width="1.6" stroke-linecap="round"/>
  <path d="M29,42 L22,60 M65,48 L60,60 M51,18 L46,36" ${HILITE} stroke-width="1.6"/>
  <!-- snowy cap -->
  <path d="M47.5,18 C49,13 55,13 56.5,18 L54,22 L52,19 L50,22 Z" fill="${P.white}" ${OUTLINE} stroke-width="1.2"/>`;
}

export function gemstone() {
  return `
  ${halo(50, 50, 40)}
  <g ${OUTLINE}>
    <path d="M26,38 L36,22 L64,22 L74,38 L50,84 Z" fill="${P.verdigris}"/>
  </g>
  <!-- facets -->
  <path d="M26,38 L74,38 M36,22 L42,38 L50,22 L58,38 L64,22 M42,38 L50,84 L58,38" fill="none" stroke="${P.ink}" stroke-width="1.3" stroke-linejoin="round"/>
  <path d="M36,22 L42,38 L26,38 Z" fill="${P.verdigrisLight}" stroke="${P.ink}" stroke-width="1.3" stroke-linejoin="round"/>
  <path d="M50,22 L58,38 L42,38 Z" fill="${P.verdigrisLight}" stroke="${P.ink}" stroke-width="1.3" stroke-linejoin="round"/>
  <path d="M42,38 L50,84 L26,38 Z" fill="${P.verdigrisDark}" stroke="${P.ink}" stroke-width="1.3" stroke-linejoin="round"/>
  <path d="M58,38 L74,38 L50,84 Z" fill="${P.verdigrisDark}" opacity="0.6" stroke="${P.ink}" stroke-width="1.3" stroke-linejoin="round"/>
  <path d="M38,26 L41,34 M52,26 L55,34" ${HILITE} stroke-width="1.6"/>
  <!-- sparkles -->
  <g fill="${P.white}" stroke="${P.ink}" stroke-width="0.6">
    <path d="M78,22 l1.5,4 l4,1.5 l-4,1.5 l-1.5,4 l-1.5,-4 l-4,-1.5 l4,-1.5 Z"/>
    <path d="M22,60 l1.2,3 l3,1.2 l-3,1.2 l-1.2,3 l-1.2,-3 l-3,-1.2 l3,-1.2 Z"/>
  </g>
  <!-- gold claw setting -->
  <path d="M30,32 L26,28 M70,32 L74,28 M50,84 L50,90" stroke="${P.ink}" stroke-width="4" stroke-linecap="round"/>
  <path d="M30,32 L26,28 M70,32 L74,28 M50,84 L50,90" stroke="${P.goldMid}" stroke-width="2" stroke-linecap="round"/>`;
}

export function lodestone() {
  return `
  ${halo(50, 50, 40)}
  <!-- iron needles leaping to the stone -->
  <g data-part="needles" data-pivot="50,50">
  ${tube('M20,22 L34,32', P.stoneDark, 1.4)}
  ${tube('M50,10 L50,24', P.stoneDark, 1.4)}
  ${tube('M82,26 L68,34', P.stoneDark, 1.4)}
  <circle cx="20" cy="22" r="1.6" fill="${P.stoneDark}"/><circle cx="50" cy="10" r="1.6" fill="${P.stoneDark}"/><circle cx="82" cy="26" r="1.6" fill="${P.stoneDark}"/>
  </g>
  <!-- iron key stuck to its side -->
  <g ${OUTLINE} stroke-width="1.4">
    <circle cx="84" cy="64" r="5" fill="none" stroke="${P.ink}" stroke-width="4"/>
    <circle cx="84" cy="64" r="5" fill="none" stroke="${P.stone}" stroke-width="2"/>
    <path d="M79,64 L70,64 M73,64 l0,4 M76,64 l0,3" stroke="${P.ink}" stroke-width="3"/>
  </g>
  <g ${OUTLINE}>
    <path d="M18,62 C16,48 26,34 40,32 C50,28 64,30 72,40 C82,48 80,66 72,74 C64,82 44,84 32,80 C22,76 19,70 18,62 Z" fill="${P.stone}"/>
  </g>
  <!-- rough facets and pocked surface -->
  <path d="M28,44 L40,48 L52,40 M40,48 L44,64 L30,70 M44,64 L62,62 L68,48 M62,62 L64,76" fill="none" stroke="${P.stoneDark}" stroke-width="1.3" stroke-linejoin="round"/>
  <path d="M26,46 C30,40 36,36 42,35" ${HILITE} stroke-width="1.6"/>
  <g fill="${P.stoneDark}"><circle cx="34" cy="58" r="1.4"/><circle cx="54" cy="52" r="1.2"/><circle cx="58" cy="70" r="1.3"/><circle cx="48" cy="74" r="1"/><circle cx="66" cy="56" r="1"/></g>
  <!-- golden glints of its pull -->
  <path d="M30,36 q-3,-3 -6,-4 M56,28 q0,-3 1,-5 M72,38 q3,-2 6,-3" fill="none" stroke="${P.goldMid}" stroke-width="1.4" stroke-linecap="round" stroke-dasharray="1.6 2"/>`;
}

// ---------- SKY ----------
export function cloud() {
  return `
  ${halo(50, 50, 40, P.sky)}
  <g ${OUTLINE}>
    <path d="M16,66 C8,64 8,52 18,50 C16,40 28,34 36,40 C38,28 56,24 62,36 C68,30 80,34 80,44 C90,44 94,58 84,64 C82,72 70,74 64,68 C58,76 42,76 38,68 C30,74 18,72 16,66 Z" fill="${P.white}"/>
  </g>
  <!-- inner scallops, like the nebuly clouds in manuscripts -->
  <path d="M24,58 C26,52 32,50 36,54 M40,50 C42,42 52,40 56,46 M62,48 C64,42 74,42 74,50" fill="none" stroke="${P.lapisLight}" stroke-width="1.6" stroke-linecap="round"/>
  <path d="M22,64 C30,66 40,66 46,64 M54,66 C62,68 72,66 78,62" fill="none" stroke="${P.lapisLight}" stroke-width="1.3" stroke-linecap="round"/>
  <!-- little birds -->
  <path d="M30,24 q3,-3 6,0 q3,-3 6,0 M60,18 q2.5,-2.5 5,0 q2.5,-2.5 5,0" fill="none" stroke="${P.ink}" stroke-width="1.3" stroke-linecap="round"/>
  <g data-part="rain" data-pivot="50,84">
  <path d="M20,84 l0,4 M30,82 l-1,5 M70,82 l1,5 M80,84 l0,4" stroke="${P.lapisLight}" stroke-width="1.5" stroke-linecap="round"/>
  </g>`;
}

export function windFace() {
  return `
  ${halo(50, 50, 40, P.sky)}
  <!-- streams of breath -->
  <g data-part="wind" data-pivot="58,58">
  <g fill="none" stroke-linecap="round">
    <path d="M58,52 C70,48 80,50 92,44 M58,58 C72,58 82,62 94,58 M58,64 C70,68 78,74 88,74" stroke="${P.ink}" stroke-width="4"/>
    <path d="M58,52 C70,48 80,50 92,44 M58,58 C72,58 82,62 94,58 M58,64 C70,68 78,74 88,74" stroke="${P.white}" stroke-width="2"/>
  </g>
  </g>
  <!-- cloud hair -->
  <g ${OUTLINE} stroke-width="1.6" fill="${P.white}">
    <circle cx="24" cy="38" r="9"/><circle cx="34" cy="28" r="10"/><circle cx="48" cy="28" r="9"/>
    <circle cx="18" cy="54" r="8"/><circle cx="24" cy="70" r="9"/><circle cx="38" cy="78" r="8"/>
  </g>
  <!-- puffed-cheek face -->
  <g data-part="face" data-pivot="38,54">
  <ellipse cx="38" cy="54" rx="18" ry="20" fill="${P.skin}" ${OUTLINE}/>
  <circle cx="44" cy="62" r="7" fill="${P.rose}" opacity="0.35"/>
  <path d="M30,44 q4,-3 8,0 M42,44 q4,-3 8,0" ${FINE} stroke-width="1.3"/>
  <circle cx="34" cy="48" r="1.5" fill="${P.ink}"/><circle cx="46" cy="48" r="1.5" fill="${P.ink}"/>
  <path d="M40,50 C42,54 42,56 40,57" ${FINE}/>
  <ellipse cx="54" cy="60" rx="3.4" ry="2.6" fill="${P.vermilion}" stroke="${P.ink}" stroke-width="1.2"/>
  <path d="M26,50 C26,58 28,64 32,68" ${HILITE}/>
  </g>`;
}

export function starMoon() {
  return `
  ${halo(50, 50, 40)}
  <circle cx="50" cy="50" r="36" fill="${P.lapis}" ${OUTLINE}/>
  ${dotRing(50, 50, 32, 30, 0.8, P.goldPale)}
  <!-- crescent moon with a sleepy face -->
  <g data-part="moon" data-pivot="40,50">
  <path d="M46,20 C30,24 22,40 26,56 C30,72 46,80 60,76 C46,72 38,58 40,44 C42,32 46,24 46,20 Z" fill="${P.gold}" ${OUTLINE}/>
  <path d="M33,46 q3,2 6,0" ${FINE} stroke-width="1.2"/>
  <path d="M36,58 q2,2 4,1" ${FINE} stroke-width="1.2"/>
  <path d="M30,38 C30,32 34,27 39,25" ${HILITE}/>
  </g>
  <!-- eight-pointed star -->
  <g data-part="star" data-pivot="67,45.5">
  <path d="M68,30 L71,38 L79,35 L74,42 L82,46 L74,49 L78,57 L70,52 L67,60 L64,52 L56,56 L60,49 L52,46 L60,42 L56,35 L64,38 Z" fill="${P.goldPale}" ${OUTLINE} stroke-width="1.4"/>
  <circle cx="67" cy="45.5" r="2.4" fill="${P.vermilion}" stroke="${P.ink}" stroke-width="0.8"/>
  </g>
  <g fill="${P.goldPale}"><circle cx="70" cy="70" r="1.6"/><circle cx="58" cy="22" r="1.3"/><circle cx="80" cy="62" r="1.2"/></g>`;
}

// ---------- FIRE ----------
export function sun() {
  return `
  ${halo(50, 50, 42)}
  <!-- straight and wavy rays, alternating -->
  <g data-part="rays" data-pivot="50,50">
  ${rays(50, 50, 22, 40, 12, `stroke="${P.ink}" stroke-width="5" stroke-linecap="round"`)}
  ${rays(50, 50, 22, 40, 12, `stroke="${P.vermilion}" stroke-width="2.6" stroke-linecap="round"`)}
  <g transform="rotate(15 50 50)">
    ${rays(50, 50, 22, 34, 12, `stroke="${P.ink}" stroke-width="4.4" stroke-linecap="round"`)}
    ${rays(50, 50, 22, 34, 12, `stroke="${P.goldPale}" stroke-width="2.2" stroke-linecap="round"`)}
  </g>
  </g>
  <circle cx="50" cy="50" r="22" fill="${P.gold}" ${OUTLINE}/>
  <!-- calm face -->
  <path d="M40,46 q3,-3 6,0 M54,46 q3,-3 6,0" ${FINE} stroke-width="1.4"/>
  <circle cx="43" cy="48" r="1.4" fill="${P.ink}"/><circle cx="57" cy="48" r="1.4" fill="${P.ink}"/>
  <path d="M50,49 L48,55 L51,55" ${FINE}/>
  <path d="M44,59 q6,4 12,0" ${FINE} stroke-width="1.3"/>
  <circle cx="41" cy="55" r="2.4" fill="${P.vermilion}" opacity="0.35"/><circle cx="59" cy="55" r="2.4" fill="${P.vermilion}" opacity="0.35"/>
  <path d="M34,44 C35,38 40,33 46,31" ${HILITE} stroke-width="1.4"/>`;
}

export function lightning() {
  return `
  ${halo(50, 50, 40)}
  <g ${OUTLINE} stroke-width="2.2">
    <path d="M58,6 L28,52 L46,52 L36,94 L74,40 L55,40 L68,6 Z" fill="${P.gold}"/>
  </g>
  <path d="M60,12 L40,46 L52,46 L45,76" fill="none" stroke="${P.vermilion}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>
  <path d="M57,10 L34,47" ${HILITE} stroke-width="1.4"/>
  <!-- sparks -->
  <g stroke="${P.vermilion}" stroke-width="1.8" stroke-linecap="round">
    <path d="M20,40 l-6,-2 M18,48 l-6,2 M80,52 l6,-1 M78,60 l6,3 M30,80 l-5,3 M66,72 l5,4"/>
  </g>`;
}
