// Creatures of the Bestiary. Each function returns the inner markup of a
// 100×100 <symbol>. Style: bold ink outline, flat pigment fills, gold leaf,
// white highlight strokes — after 13th-century English bestiaries.
import { P, OUTLINE, FINE, HILITE, tube, dotRing, halo } from './defs.js';

const TALON = `fill="none" stroke="${P.ink}" stroke-width="2.2" stroke-linecap="round"`;

export function griffin() {
  return `
  <g ${OUTLINE}>
    <!-- far hind leg (shadowed) -->
    <path d="M62,66 C62,74 60,80 61,86 L66,88 L57,89 C55,82 55,74 56,67 Z" fill="${P.goldDeep}"/>
    <!-- tail with tuft -->
    <g data-part="tail" data-pivot="77,58">
    <path d="M77,58 C86,54 91,45 88,33" fill="none" stroke="${P.ink}" stroke-width="5"/>
    <path d="M77,58 C86,54 91,45 88,33" fill="none" stroke="${P.goldMid}" stroke-width="2.6"/>
    <path d="M88,35 C83,32 84,25 89,26 C90,21 96,23 95,28 C99,30 96,36 91,35 Z" fill="${P.vermilion}"/>
    </g>
    <!-- eagle legs (tops tucked behind the body) -->
    <path d="M38,58 L45,58 L43.5,82 L39.5,82 Z" fill="${P.ochre}"/>
    <path d="M33,55 L39,60 L30,71 L26,68 Z" fill="${P.ochre}"/>
    <!-- lion body -->
    <path d="M36,52 C44,46 60,45 72,48 C80,50 83,57 80,63 C78,68 73,70 66,69 L46,69 C40,69 35,66 34,60 Z" fill="${P.gold}"/>
    <!-- near hind leg -->
    <path d="M70,62 C72,71 74,78 76,85 C79,85 82,86 82,89 L71,89 L69,84 C66,78 63,73 61,68 Z" fill="${P.gold}"/>
    <!-- wing -->
    <g data-part="wing" data-pivot="46,50">
    <path d="M44,53 C40,38 47,21 61,13 C68,9 77,7 85,9 L79,15 L87,18 L77,23 L84,28 L73,31 L78,37 L66,39 L68,45 L58,46 C54,48 48,51 44,53 Z" fill="${P.lapis}"/>
    <path d="M45,48 C44,36 50,24 62,15 C68,19 66,27 60,33 C55,39 50,44 45,48 Z" fill="${P.vermilion}"/>
    </g>
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
  <g data-part="wing" data-pivot="46,50">
  <path d="M80,17 L68,20 M78,25 L66,27 M71,32 L62,34 M64,40 L56,41" ${HILITE}/>
  <path d="M48,44 C48,36 53,27 61,19" ${HILITE}/>
  <path d="M51,39 q2,-2 3,0 M54,33 q2,-2 3,0 M58,27 q2,-2 3,0" ${FINE}/>
  </g>
  <!-- lion haunch and belly shading -->
  <path d="M66,57 C71,55 76,59 73,66" ${FINE}/>
  <path d="M47,66 C53,68 58,68 64,67 M49,63 l2,2 M54,64 l2,2 M59,64 l2,2" ${FINE}/>
  <path d="M52,51 C58,49 65,49 73,51" ${HILITE}/>
  <!-- leg scales -->
  <path d="M40,70 h3.5 M40,74 h3.5 M40,78 h3.5 M30.5,64.5 l3,3 M28.5,67 l2.5,2.5" ${FINE}/>
  `;
}

// Shared four-legged body facing left (unicorn, yale, manticore).
// foot: 'hoof' or 'paw'.
function beast(fill, shade, foot = 'hoof') {
  const feet = [[39.5, 86], [69.5, 86], [47.5, 88], [77.5, 88]];
  const footMark = feet.map(([x, y]) => foot === 'hoof'
    ? `<path d="M${x - 3.2},${y - 2} L${x + 3.2},${y - 2} L${x + 3.6},${y + 1.5} L${x - 3.6},${y + 1.5} Z" fill="${P.ink}"/><path d="M${x},${y - 1} L${x},${y + 1.5}" stroke="${P.white}" stroke-width="0.7"/>`
    : `<ellipse cx="${x - 1}" cy="${y}" rx="4.6" ry="2.6" fill="${fill}" ${OUTLINE} stroke-width="1.6"/><path d="M${x - 3},${y - 1} l0,2 M${x - 1},${y - 1} l0,2" ${FINE}/>`
  ).join('');
  return `
  <g ${OUTLINE}>
    <path d="M38,62 C39,70 36,76 37,85 L42,85 C41,77 44,71 44,64 Z" fill="${shade}"/>
    <path d="M65,62 C68,70 66,77 67,85 L72,85 C71,77 73,70 71,62 Z" fill="${shade}"/>
    <path d="M34,52 C42,46 60,45 72,48 C80,50 83,57 80,63 C78,68 73,70 66,69 L46,69 C40,69 35,66 34,60 Z" fill="${fill}"/>
    <path d="M44,64 C46,72 44,79 45,87 L50,87 C49,79 52,72 51,66 Z" fill="${fill}"/>
    <path d="M70,60 C74,68 72,74 75,87 L80,87 C78,76 81,68 78,60 Z" fill="${fill}"/>
  </g>
  ${footMark}
  <path d="M66,57 C71,55 76,59 74,65 M48,66 C54,68 60,68 65,67" ${FINE}/>
  <path d="M42,52 C50,48 60,48 70,50" ${HILITE}/>`;
}

export function unicorn() {
  // A rampant unicorn, as on medieval tapestries: rearing, collared in gold.
  const hoof = (x, y, r = 0) => `<path d="M${x - 3},${y - 2.5} L${x + 3},${y - 2.5} L${x + 3.5},${y + 2} L${x - 3.5},${y + 2} Z" transform="rotate(${r} ${x} ${y})" fill="${P.gold}" stroke="${P.ink}" stroke-width="1.2" stroke-linejoin="round"/><path d="M${x},${y - 2.5} v4.5" transform="rotate(${r} ${x} ${y})" stroke="${P.ink}" stroke-width="0.7"/>`;
  return `
  <!-- lion's tail with a golden tuft -->
  <g data-part="tail" data-pivot="74,60">
  ${tube('M74,60 C84,58 90,48 86,38', P.white, 2.4)}
  <path d="M86,40 C82,37 83,30 88,31 C89,26 95,28 94,33 C98,35 95,41 90,40 Z" fill="${P.gold}" ${OUTLINE} stroke-width="1.4"/>
  </g>
  <!-- far legs -->
  ${tube('M70,66 C74,74 74,80 73,87', P.stoneLight, 4.5)}
  ${tube('M41,50 C35,46 31,42 28,40 C26,42 23,44 20,44', P.stoneLight, 4)}
  <!-- body, neck and head in one flowing outline -->
  <path d="M14,30 C14,24 18,19 24,16 C28,13 33,12 37,13 C42,15 44,20 44,26 C46,34 50,40 56,44 C64,48 72,54 74,62 C76,70 72,74 66,73 C58,72 50,66 44,62 C40,58 38,52 36,46 C34,40 32,36 28,34 C24,33 20,33 17,33 C15,33 14,32 14,30 Z" fill="${P.white}" ${OUTLINE}/>
  <path d="M36,13 L38.5,4.5 L41,14 Z" fill="${P.white}" ${OUTLINE} stroke-width="1.5"/>
  <path d="M17,33 L17,40.5 L21,33 Z" fill="${P.white}" ${OUTLINE} stroke-width="1.4"/>
  <!-- near legs -->
  ${tube('M62,66 C60,74 59,80 58,87', P.white, 5)}
  ${tube('M43,55 C37,52 31,50 27,48 C25,52 22,55 19,56', P.white, 4.6)}
  ${hoof(73, 89)}${hoof(58, 89)}${hoof(18, 57, 60)}${hoof(19, 44, 80)}
  <!-- the spiralled golden horn -->
  <path d="M22,17 L8,0.5 L27,14 Z" fill="${P.gold}" ${OUTLINE} stroke-width="1.5"/>
  <path d="M11.5,4 l2.4,-1.4 M14.5,7.5 l3,-1.6 M17.5,11 l3.4,-1.8 M20.5,14.5 l3,-1.6" ${FINE} stroke-width="0.9"/>
  <!-- golden mane -->
  ${tube('M42,16 C48,20 45,26 50,30 C55,34 51,38 57,43', P.goldMid, 2.8)}
  <path d="M44,20 l-3,2 M47,27 l-3,2 M51,33 l-3,2 M54,39 l-3,2" stroke="${P.goldMid}" stroke-width="2.2" stroke-linecap="round"/>
  <!-- gold collar with a hanging chain -->
  <path d="M34.5,40 C40,43 46,41 50,36" fill="none" stroke="${P.ink}" stroke-width="5" stroke-linecap="round"/>
  <path d="M34.5,40 C40,43 46,41 50,36" fill="none" stroke="${P.goldMid}" stroke-width="3" stroke-linecap="round"/>
  <path d="M41,42 C42,50 46,56 52,60" fill="none" stroke="${P.goldMid}" stroke-width="1.3" stroke-dasharray="1.6 1.2"/>
  <circle cx="41" cy="42" r="1.8" fill="${P.vermilion}" stroke="${P.ink}" stroke-width="0.7"/>
  <!-- face -->
  <path d="M26,20 Q29,17.8 32,20 Q29,21.6 26,20 Z" fill="${P.ink}"/>
  <path d="M25,17.5 L32.5,18.4" stroke="${P.ink}" stroke-width="0.9" stroke-linecap="round"/>
  <path d="M16,29 l1.6,0.3 M20,31 C24,30.5 28,31 31,33" ${FINE}/>
  <!-- shading -->
  <path d="M52,63 C58,68 63,70 68,69 M64,56 C69,57 71,61 70,65" ${FINE}/>
  <path d="M40,48 C48,46 58,48 66,54 M30,16 C36,15 40,18 41,23" ${HILITE}/>`;
}

export function dragon() {
  // A rampant dragon: rearing on its hind legs, wings raised, jaws open.
  return `
  <g ${OUTLINE}>
    <!-- far wing -->
    <g data-part="wing2" data-pivot="60,46">
    <path d="M57,44 C62,30 70,19 85,12 C83,20 85,25 90,29 C83,31 81,35 83,40 C76,40 70,43 66,49 Z" fill="${P.vermilionDark}"/>
    </g>
    <!-- near wing, ribbed like a bat's -->
    <g data-part="wing" data-pivot="50,48">
    <path d="M51,47 C40,30 26,15 6,6 C11,14 11,21 9,28 C17,26 22,30 21,37 C28,35 32,39 32,45 C38,43 42,47 44,52 Z" fill="${P.vermilion}"/>
    </g>
  </g>
  <g data-part="wing" data-pivot="50,48">
  <path d="M51,47 L7,7 M50,48 L10,27 M49,49 L21,36 M48,50 L32,44" ${FINE} stroke-width="1"/>
  <path d="M6,6 l-3,-3" stroke="${P.ink}" stroke-width="1.8" stroke-linecap="round"/>
  <path d="M30,24 C26,21 20,17 14,14" ${HILITE}/>
  </g>
  <!-- tail sweeping round to an arrow tip -->
  <g data-part="tail" data-pivot="42,84">
  ${tube('M42,84 C28,93 10,91 8,79 C6,67 18,62 22,70', P.verdigris, 4.6)}
  <path d="M21,69 L27,63 L27,72 Z" fill="${P.gold}" ${OUTLINE} stroke-width="1.3"/>
  </g>
  <g ${OUTLINE}>
    <!-- hind legs -->
    <path d="M52,66 C58,72 60,80 58,86 L65,91 L52,92 L52,84 C51,78 49,72 47,68 Z" fill="${P.verdigrisDark}"/>
    <path d="M39,64 C34,72 34,80 38,86 L31,92 L46,92 L44,84 C46,78 48,72 49,66 Z" fill="${P.verdigris}"/>
    <!-- body -->
    <path d="M40,71 C35,60 39,48 50,42 C58,38 65,44 63,54 C61,64 55,74 46,77 Z" fill="${P.verdigris}"/>
    <!-- neck and head -->
    <path d="M52,45 C49,35 53,26 61,21 L70,25 C64,30 61,37 61,47 Z" fill="${P.verdigris}"/>
    <g data-part="head" data-pivot="62,24">
    <path d="M60,20 C62,13 70,9 76,12 L91,15 C93,17 92,20 89,20 L80,21 L88,25 C88,28 86,29 83,28 L76,27 C70,29 64,27 61,24 Z" fill="${P.verdigris}"/>
    <!-- horns -->
    <path d="M66,12 L58,1 L71,9 Z" fill="${P.gold}" stroke-width="1.3"/>
    <path d="M71,11 L69,2 L76,10 Z" fill="${P.gold}" stroke-width="1.3"/>
    </g>
    <!-- raised forelegs -->
    <path d="M58,49 C64,49 69,51 73,55 L70,59 C66,56 62,55 58,56 Z" fill="${P.verdigris}" stroke-width="1.6"/>
    <path d="M56,58 C62,60 66,63 69,67 L66,70 C63,66 59,64 55,64 Z" fill="${P.verdigrisDark}" stroke-width="1.6"/>
  </g>
  <!-- open mouth, fangs and forked tongue -->
  <g data-part="head" data-pivot="62,24">
  <path d="M79,21 L90,20 L86,24 Z" fill="${P.vermilionDark}"/>
  <path d="M81,20 l1,2 l1,-2 M85,20 l1,2 l1,-2 M80,22 l1,-1.6 l1,1.6 M84,23 l1,-1.6 l1,1.6" fill="${P.white}" stroke="${P.ink}" stroke-width="0.5"/>
  <path d="M87,22 L97,25 L94,25.5 L96,28" fill="none" stroke="${P.vermilion}" stroke-width="1.2" stroke-linecap="round"/>
  <!-- fierce eye -->
  <path d="M70,14.5 Q73,12 76,14.5 Q73,16.5 70,14.5 Z" fill="${P.goldPale}" stroke="${P.ink}" stroke-width="0.8"/>
  <path d="M73,13 v3" stroke="${P.ink}" stroke-width="1.1"/>
  <path d="M68,12 L77,13" stroke="${P.ink}" stroke-width="1.4" stroke-linecap="round"/>
  <circle cx="88.5" cy="16.5" r="0.7" fill="${P.ink}"/>
  </g>
  <!-- claws -->
  <path d="M73,55 l3,-1 M73,56 l3,1.5 M72,58 l2,2.5 M69,67 l3,0 M68,68 l2,2.5 M32,92 l-3,1 M46,92 l2,1.5 M65,91 l3,1" ${FINE} stroke-width="1.4"/>
  <!-- golden belly plates and back spines -->
  <path d="M58,46 C62,55 58,66 49,75" fill="none" stroke="${P.ink}" stroke-width="5"/>
  <path d="M58,46 C62,55 58,66 49,75" fill="none" stroke="${P.goldMid}" stroke-width="3"/>
  <path d="M58,50 l2.5,0 M59,55 l2.5,0.5 M58,60 l2.5,1 M56,65 l2,1.5 M53,70 l2,1.8" ${FINE}/>
  <g fill="${P.gold}" stroke="${P.ink}" stroke-width="0.9" stroke-linejoin="round">
    <path d="M52,32 l-4,-2 l3,-3 Z M51,39 l-4,-1 l3,-3 Z M42,50 l-4,0 l2,-4 Z M38,58 l-4,1 l2,-4 Z M37,66 l-4,2 l1,-4 Z"/>
  </g>
  <!-- scales -->
  <path d="M43,55 q2,2 4,0 M48,52 q2,2 4,0 M44,61 q2,2 4,0 M49,58 q2,2 4,0 M45,67 q2,2 4,0 M55,33 q2,2 4,0 M54,39 q2,2 4,0" ${FINE}/>
  <path d="M42,62 C41,56 44,49 49,45 M54,40 C54,33 56,28 60,24" ${HILITE}/>`;
}

export function pelican() {
  return `
  <g ${OUTLINE}>
    <!-- raised wings -->
    <g data-part="wingL" data-pivot="41,50">
    <path d="M40,50 C30,42 25,30 27,16 L31,22 L33,13 L37,23 L41,17 L43,30 C44,38 43,44 42,50 Z" fill="${P.lapis}"/>
    </g>
    <g data-part="wingR" data-pivot="59,50">
    <path d="M60,50 C70,42 75,30 73,16 L69,22 L67,13 L63,23 L59,17 L57,30 C56,38 57,44 58,50 Z" fill="${P.lapis}"/>
    </g>
    <!-- body -->
    <path d="M35,63 C33,50 40,41 50,41 C60,41 67,50 65,63 C63,69 56,72 50,72 C44,72 37,69 35,63 Z" fill="${P.white}"/>
  </g>
  <!-- neck bending down to the breast -->
  ${tube('M47,44 C42,32 48,22 56,24', P.white, 4.5)}
  <g ${OUTLINE}>
    <circle cx="57" cy="25" r="5.5" fill="${P.white}"/>
    <path d="M55,28 L61.5,28 L51.5,46 Z" fill="${P.ochre}"/>
    <!-- nest -->
    <path d="M24,78 C26,90 74,90 76,78 C66,82 34,82 24,78 Z" fill="${P.ochre}"/>
  </g>
  <path d="M30,82 l6,4 M38,83 l5,4 M47,84 l5,3 M56,84 l5,3 M64,83 l5,2 M33,86 l5,-3 M45,87 l5,-4 M58,87 l6,-4" ${FINE}/>
  <!-- chicks reaching up -->
  <g ${OUTLINE} stroke-width="1.5">
    <path d="M32,80 C30,74 33,70 37,70 C41,70 42,74 41,80 Z" fill="${P.white}"/>
    <path d="M59,80 C58,74 59,70 63,70 C67,70 70,74 68,80 Z" fill="${P.white}"/>
    <path d="M38,71 L42,64 L40,72 Z" fill="${P.ochre}"/>
    <path d="M62,71 L58,64 L60,72 Z" fill="${P.ochre}"/>
  </g>
  <circle cx="36.5" cy="73" r="0.9" fill="${P.ink}"/><circle cx="63.5" cy="73" r="0.9" fill="${P.ink}"/>
  <!-- drops of blood -->
  <g fill="${P.vermilion}" stroke="${P.ink}" stroke-width="0.6">
    <path d="M49,49 q1.6,2.8 0,3.6 q-1.6,-0.8 0,-3.6 Z"/>
    <path d="M45,56 q1.6,2.8 0,3.6 q-1.6,-0.8 0,-3.6 Z"/>
    <path d="M54,57 q1.6,2.8 0,3.6 q-1.6,-0.8 0,-3.6 Z"/>
  </g>
  <circle cx="58" cy="23.5" r="1.2" fill="${P.ink}"/>
  <path d="M35,26 L38,40 M39,22 L40,40 M65,26 L62,40 M61,22 L60,40" ${HILITE}/>
  <path d="M40,60 q3,2 6,0 M54,60 q3,2 6,0 M44,66 q3,2 6,0 M50,66 q3,2 6,0" ${FINE}/>`;
}

export function phoenix() {
  return `
  <!-- nest of flames -->
  <g data-part="flame" data-pivot="50,94">
  <g ${OUTLINE} stroke-width="1.6">
    <path d="M22,94 C16,86 20,78 24,72 C25,78 28,79 30,76 C30,70 34,66 38,62 C38,68 40,72 44,72 C44,66 48,62 50,58 C52,62 56,66 56,72 C60,72 62,68 62,62 C66,66 70,70 70,76 C72,79 75,78 76,72 C80,78 84,86 78,94 Z" fill="${P.vermilion}"/>
    <path d="M30,94 C27,88 29,83 32,80 C33,84 36,84 38,80 C40,84 44,84 46,78 C48,82 52,82 54,78 C56,84 60,84 62,80 C64,84 67,84 68,80 C71,83 73,88 70,94 Z" fill="${P.ochre}"/>
  </g>
  <path d="M38,94 C38,90 40,88 42,86 C43,89 46,89 48,86 C50,89 53,89 55,86 C57,88 60,90 60,94 Z" fill="${P.goldPale}"/>
  </g>
  <!-- tail plumes -->
  ${tube('M48,60 C44,68 40,72 34,76', P.goldMid, 2.4)}
  ${tube('M52,60 C56,68 60,72 66,76', P.goldMid, 2.4)}
  ${tube('M50,60 L50,74', P.goldMid, 2.4)}
  <g ${OUTLINE}>
    <!-- outspread wings -->
    <g data-part="wingL" data-pivot="48,42">
    <path d="M46,46 C36,40 22,34 9,20 L16,22 L11,13 L20,19 L18,8 L26,18 L28,9 L33,22 C38,30 44,36 49,40 Z" fill="${P.gold}"/>
    </g>
    <g data-part="wingR" data-pivot="52,42">
    <path d="M54,46 C64,40 78,34 91,20 L84,22 L89,13 L80,19 L82,8 L74,18 L72,9 L67,22 C62,30 56,36 51,40 Z" fill="${P.gold}"/>
    </g>
    <g data-part="wingL" data-pivot="48,42">
    <path d="M46,45 C40,40 34,34 31,28 C37,30 43,34 48,40 Z" fill="${P.vermilion}"/>
    </g>
    <g data-part="wingR" data-pivot="52,42">
    <path d="M54,45 C60,40 66,34 69,28 C63,30 57,34 52,40 Z" fill="${P.vermilion}"/>
    </g>
    <!-- body, neck, head -->
    <ellipse cx="50" cy="51" rx="7.5" ry="12" fill="${P.vermilion}"/>
    <path d="M46,41 C44,34 44,28 47,25 C50,22 55,23 55,28 C55,32 52,36 54,41 Z" fill="${P.vermilion}"/>
    <path d="M47,24.5 L40,27.5 L47.5,29 Z" fill="${P.ochre}"/>
  </g>
  <!-- crest -->
  ${tube('M49,23 L46,15 M51,22.5 L51,13 M53,23 L56,15', P.goldMid, 1.4)}
  <circle cx="46" cy="14.5" r="1.6" fill="${P.goldPale}" stroke="${P.ink}" stroke-width="0.7"/>
  <circle cx="51" cy="12.5" r="1.6" fill="${P.goldPale}" stroke="${P.ink}" stroke-width="0.7"/>
  <circle cx="56" cy="14.5" r="1.6" fill="${P.goldPale}" stroke="${P.ink}" stroke-width="0.7"/>
  <circle cx="50" cy="27" r="1.3" fill="${P.ink}"/>
  <path d="M20,22 L36,32 M26,15 L39,30 M80,22 L64,32 M74,15 L61,30" ${FINE}/>
  <path d="M47,45 q3,2 6,0 M47,50 q3,2 6,0 M47,55 q3,2 6,0" ${FINE}/>
  <path d="M46,44 C45,50 46,56 48,60" ${HILITE}/>`;
}

export function basilisk() {
  return `
  <!-- serpent tail ending in a little head -->
  <g data-part="tail" data-pivot="36,56">
  ${tube('M36,56 C24,50 14,58 16,68 C18,78 31,80 33,72', P.verdigris, 5.5)}
  <path d="M19,62 l2,1 M17,68 l2.5,0 M20,74 l2,-1.5 M26,77 l1,-2" stroke="${P.goldPale}" stroke-width="1.3" stroke-linecap="round"/>
  <path d="M30,74 C28,69 32,66 36,68 C38,70 37,73 34,75 Z" fill="${P.verdigris}" ${OUTLINE} stroke-width="1.4"/>
  <path d="M36,69 L40,68 M38,68.4 L40,66.5" stroke="${P.vermilion}" stroke-width="1" stroke-linecap="round"/>
  </g>
  <!-- rooster legs with spurs -->
  ${tube('M47,66 L45,82 M45,82 l-5,3 M45,82 l1,5 M45,82 l5,3 M46,75 l-3,0', P.goldMid, 1.8)}
  ${tube('M56,66 L58,82 M58,82 l-5,3 M58,82 l1,5 M58,82 l5,3 M57,75 l-3,0', P.goldMid, 1.8)}
  <g ${OUTLINE}>
    <path d="M36,42 C46,35 60,38 64,48 C68,58 60,68 48,68 C38,68 32,60 34,50 Z" fill="${P.ochre}"/>
    <g data-part="head" data-pivot="60,44">
    <path d="M54,42 C58,33 60,25 66,21 C72,17 79,20 79,26 C79,30 76,32 73,33 C71,37 67,43 65,49 Z" fill="${P.ochre}"/>
    <path d="M78.5,24 L87,27 L78.5,29.5 Z" fill="${P.gold}"/>
    <path d="M76,31 C78,37 72,39 72,33 Z" fill="${P.vermilion}"/>
    <!-- the crown of the king of serpents -->
    <path d="M65,19.5 L65.5,10 L69,15 L71.5,8 L74,15 L77.5,10 L77.5,19.5 Z" fill="${P.gold}"/>
    </g>
    <!-- wing -->
    <path d="M40,46 C47,41 58,44 59,52 C59,60 49,63 40,59 Z" fill="${P.verdigris}"/>
  </g>
  <g data-part="head" data-pivot="60,44">
  <circle cx="68.5" cy="15" r="1.2" fill="${P.vermilion}"/><circle cx="74.5" cy="15" r="1.2" fill="${P.lapisLight}"/>
  </g>
  <!-- the deadly glare -->
  <g data-part="head" data-pivot="60,44">
  <circle cx="72.5" cy="25" r="2.3" fill="${P.vermilion}" stroke="${P.ink}" stroke-width="0.9"/>
  <circle cx="72.8" cy="25" r="0.9" fill="${P.ink}"/>
  <path d="M69.5,22 l6,-1" ${FINE} stroke-width="1.1"/>
  </g>
  <path d="M44,50 q3,2.5 6,0 M50,50 q3,2.5 6,0 M44,55 q3,2.5 6,0 M50,55 q3,2.5 6,0" ${FINE}/>
  <path d="M58,30 q2,2 4,0 M57,36 q2,2 4,0 M61,40 q2,2 4,0 M36,62 q3,2 6,0" ${FINE}/>
  <path d="M38,46 C40,42 44,40 48,39 M62,28 C64,24 67,22 70,21.5" ${HILITE}/>`;
}

export function siren() {
  return `
  <g ${OUTLINE}>
    <!-- fish tail -->
    <g data-part="tail" data-pivot="40,52">
    <path d="M29,50 C26,70 38,90 61,89 C71,88.5 77,82 80,74 C74,80 66,80.5 61,79 C50,76 49,62 50,50 Z" fill="${P.lapis}"/>
    <path d="M79,75 C82,66 90,60 97,61 C93,66 91,70 93,78 C88,75 83,75 79,75 Z" fill="${P.vermilion}"/>
    </g>
    <!-- long golden hair -->
    <path d="M31,22 C30,9 50,8 50,22 C52,30 56,40 54,50 C50,46 48,40 48,34 L33,34 C32,40 30,46 26,50 C24,42 30,32 31,22 Z" fill="${P.gold}"/>
    <!-- bodice and arms -->
    <path d="M31,50 C30,42 32,35 37,33 L44,33 C49,35 51,42 50,50 Z" fill="${P.vermilion}"/>
    <path d="M37,29 L37,34 L44,34 L44,29 Z" fill="${P.skin}"/>
    <ellipse cx="40.5" cy="22" rx="7" ry="8" fill="${P.skin}"/>
    <path d="M33.5,19 C36,12.5 46,12.5 47.5,19 C43,16.5 38,16.5 33.5,19 Z" fill="${P.gold}"/>
  </g>
  <g data-part="arm" data-pivot="47,37">
  ${tube('M47,37 C52,36 56,32 58,27', P.skin, 3.2)}
  </g>
  ${tube('M34,37 C30,41 30,45 33,47', P.skin, 3.2)}
  <g data-part="arm" data-pivot="47,37">
  <!-- mirror -->
  <g ${OUTLINE} stroke-width="1.5">
    <path d="M58,27 L61,22" fill="none" stroke="${P.goldDeep}" stroke-width="2.5"/>
    <circle cx="64" cy="17" r="6.3" fill="${P.gold}"/>
    <circle cx="64" cy="17" r="4" fill="${P.sky}"/>
  </g>
  <path d="M62,15 l2.5,-1.5" ${HILITE}/>
  </g>
  <!-- face -->
  <circle cx="38" cy="22.5" r="0.95" fill="${P.ink}"/><circle cx="43.5" cy="22.5" r="0.95" fill="${P.ink}"/>
  <path d="M38.5,26.5 q2.3,1.6 4.5,0" ${FINE}/>
  <circle cx="36.5" cy="25" r="1.4" fill="${P.rose}" opacity="0.5"/><circle cx="45" cy="25" r="1.4" fill="${P.rose}" opacity="0.5"/>
  <!-- scales and fin ribs -->
  <g data-part="tail" data-pivot="40,52">
  <path d="M34,56 q3,3 6,0 M40,56 q3,3 6,0 M35,63 q3,3 6,0 M41,63 q3,3 6,0 M38,70 q3,3 6,0 M44,70 q3,3 6,0 M43,77 q3,3 6,0 M49,78 q3,3 6,0 M56,82 q3,3 6,0" ${FINE} stroke="${P.lapisLight}"/>
  <path d="M84,72 L94,64 M85,74 L92,72" ${FINE}/>
  </g>
  <path d="M33,52 C33,66 40,80 54,85" ${HILITE}/>
  <path d="M35,44 l11,0" stroke="${P.goldMid}" stroke-width="1.6"/>
  <path d="M34,27 C32,34 30,40 28,45 M48,28 C50,34 52,40 52,45" ${FINE} stroke="${P.goldDeep}"/>`;
}

export function salamander() {
  return `
  <!-- little flames it sits in -->
  <g data-part="flame" data-pivot="50,94">
  <g ${OUTLINE} stroke-width="1.5">
    <path d="M22,94 C17,88 20,80 24,76 C25,81 28,81 29,78 C30,83 34,84 36,80 C39,84 38,90 34,94 Z" fill="${P.vermilion}"/>
    <path d="M44,94 C40,88 42,80 47,74 C48,80 51,80 53,76 C56,81 57,88 54,94 Z" fill="${P.vermilion}"/>
    <path d="M64,94 C60,88 62,82 66,78 C67,82 70,82 71,79 C74,83 76,89 72,94 Z" fill="${P.vermilion}"/>
    <path d="M26,94 C24,90 25,86 27,84 C29,87 31,87 32,85 C33,89 32,92 31,94 Z" fill="${P.ochre}"/>
    <path d="M47,94 C45,90 46,85 49,82 C50,86 52,86 53,84 C54,88 53,92 51,94 Z" fill="${P.ochre}"/>
    <path d="M66,94 C64,90 65,87 67,85 C68,88 70,88 71,86 C72,89 71,92 70,94 Z" fill="${P.ochre}"/>
  </g>
  </g>
  <!-- curling tail -->
  <g data-part="tail" data-pivot="66,56">
  ${tube('M66,56 C80,52 91,58 88,68 C86,75 76,75 76,69 C76,65 80,64 82,67', P.lapis, 4.5)}
  </g>
  <!-- legs -->
  ${tube('M28,58 L22,68 M22,68 l-4,0 M22,68 l-2,3 M22,68 l1,3.5', P.lapis, 2.6)}
  ${tube('M58,59 L64,70 M64,70 l4,0 M64,70 l2,3 M64,70 l-1,3.5', P.lapis, 2.6)}
  ${tube('M36,52 L32,42 M32,42 l-4,-1 M32,42 l-1,-4 M32,42 l2,-3', P.lapisDark, 2.4)}
  ${tube('M54,50 L60,41 M60,41 l4,-1 M60,41 l1,-4 M60,41 l-2,-3', P.lapisDark, 2.4)}
  <g ${OUTLINE}>
    <path d="M21,51 C29,44 48,44 60,47 C67,49 71,53 68,58 C60,62 44,62 30,60 C26,59 21,56 21,51 Z" fill="${P.lapis}"/>
    <path d="M7,51 C8,45 17,44 23,48 L24,56 C19,58 9,57 7,51 Z" fill="${P.lapis}"/>
  </g>
  <!-- gold spots, eye -->
  <g fill="${P.gold}" stroke="${P.ink}" stroke-width="0.7">
    <circle cx="30" cy="51" r="2.3"/><circle cx="38" cy="54" r="2"/><circle cx="45" cy="50" r="2.4"/>
    <circle cx="53" cy="54" r="2"/><circle cx="60" cy="51" r="1.9"/><circle cx="17" cy="50" r="1.6"/>
    <circle cx="80" cy="57" r="1.5"/><circle cx="87" cy="64" r="1.4"/>
  </g>
  <circle cx="13" cy="49" r="1.6" fill="${P.goldPale}" stroke="${P.ink}" stroke-width="0.8"/>
  <circle cx="12.7" cy="49" r="0.7" fill="${P.ink}"/>
  <path d="M8,53 C11,54.5 15,54.5 18,53.5" ${FINE}/>
  <path d="M26,49 C34,46 46,46 58,48" ${HILITE}/>`;
}

export function manticore() {
  return `
  <!-- scorpion tail arching over the back -->
  <g data-part="tail" data-pivot="80,56">
  <g ${OUTLINE} stroke-width="1.5" fill="${P.vermilionDark}">
    <circle cx="80" cy="52" r="5"/><circle cx="86" cy="44" r="4.8"/><circle cx="88" cy="35" r="4.6"/>
    <circle cx="86" cy="26" r="4.4"/><circle cx="80" cy="19" r="4.2"/><circle cx="72" cy="15.5" r="4"/>
    <path d="M68,14 L60,19 L67,20 Z" fill="${P.gold}"/>
  </g>
  </g>
  ${beast(P.vermilion, P.vermilionDark, 'paw')}
  <!-- shaggy golden mane -->
  <g data-part="head" data-pivot="28,46">
  <path d="M26,24 L30,28 L34,23 L36,30 L41,28 L39,35 L45,37 L39,41 L44,46 L37,47 L39,53 L32,50 L30,57 L26,51 L21,56 L20,50 L13,52 L16,46 L9,44 L14,39 L8,35 L15,33 L12,27 L19,29 L19,22 L24,28 Z" fill="${P.gold}" ${OUTLINE} stroke-width="1.6"/>
  <!-- golden beard -->
  <path d="M18,44 C19,52 23,57 25,58 C27,57 31,52 32,44 C28,47 22,47 18,44 Z" fill="${P.gold}" ${OUTLINE} stroke-width="1.4"/>
  <path d="M22,48 l1,6 M25,48 l0,8 M28,48 l-1,6" ${FINE} stroke-width="0.7"/>
  <!-- stern human face -->
  <ellipse cx="25" cy="39" rx="7.5" ry="8.5" fill="${P.skin}" ${OUTLINE} stroke-width="1.6"/>
  <path d="M19.8,37 Q22,35.3 24,37 Q22,38.2 19.8,37 Z M26,37 Q28,35.3 30.2,37 Q28,38.2 26,37 Z" fill="${P.white}" stroke="${P.ink}" stroke-width="0.6"/>
  <circle cx="22" cy="37" r="0.9" fill="${P.lapis}"/><circle cx="28" cy="37" r="0.9" fill="${P.lapis}"/>
  <path d="M19,34.2 L24,35.6 M31,34.2 L26,35.6" stroke="${P.ink}" stroke-width="1.3" stroke-linecap="round"/>
  <path d="M25,37.5 L23.8,41.5 L26,41.5" ${FINE}/>
  <!-- the mouth with three rows of teeth -->
  <path d="M21.5,44 Q25,42.6 28.5,44 Q25,47.2 21.5,44 Z" fill="${P.vermilionDark}" stroke="${P.ink}" stroke-width="0.8"/>
  <path d="M22.2,44 l0.8,1 l0.8,-1 l0.8,1 l0.8,-1 l0.8,1 l0.8,-1 l0.8,1 l0.8,-1" fill="none" stroke="${P.white}" stroke-width="0.7"/>
  <path d="M23,45.4 l0.7,-0.8 l0.7,0.8 l0.7,-0.8 l0.7,0.8 l0.7,-0.8 l0.7,0.8 l0.7,-0.8" fill="none" stroke="${P.white}" stroke-width="0.6"/>
  </g>
  <path d="M83,48 l3,-1 M87,40 l2.5,0 M86,30 l2.5,1 M80,22 l2,2" ${HILITE}/>`;
}

export function caladrius() {
  return `
  ${halo(52, 46, 40)}
  <!-- gold perch -->
  ${tube('M14,80 L88,80', P.goldMid, 3)}
  <circle cx="14" cy="80" r="3" fill="${P.gold}" ${OUTLINE} stroke-width="1.2"/>
  <circle cx="88" cy="80" r="3" fill="${P.gold}" ${OUTLINE} stroke-width="1.2"/>
  ${tube('M48,66 L46,78 M58,66 L60,78', P.vermilion, 1.6)}
  <g ${OUTLINE}>
    <path d="M30,56 C30,44 44,38 56,40 C66,42 72,50 70,58 C66,66 50,68 40,66 L20,74 L25,63 C28,61 30,59 30,56 Z" fill="${P.white}"/>
    <g data-part="head" data-pivot="62,46">
    <path d="M58,42 C60,34 62,26 68,24 C74,22 80,26 78,30 C76,32 72,32 70,34 C68,40 66,46 66,50 Z" fill="${P.white}"/>
    <path d="M77.5,26.5 L89,29 L77.5,31.5 Z" fill="${P.ochre}"/>
    </g>
    <g data-part="wing" data-pivot="40,55">
    <path d="M37,51 C45,44 60,46 64,53 C60,61 46,63 35,60 Z" fill="${P.white}"/>
    </g>
  </g>
  <path d="M42,52 q3,3 6,0 M48,52 q3,3 6,0 M54,53 q3,3 6,0 M40,57 q3,3 6,0 M46,58 q3,3 6,0 M24,70 l12,-6 M27,66 l10,-4" ${FINE} stroke="${P.lapisLight}" stroke-width="1"/>
  <g data-part="head" data-pivot="62,46">
  <circle cx="72" cy="27" r="1.5" fill="${P.ink}"/>
  </g>
  <path d="M44,78 l-3,2 M46,78 l2,2 M60,78 l-2,2 M60,78 l3,2" ${FINE}/>`;
}

export function yale() {
  return `
  <!-- elephant's tail -->
  ${tube('M80,56 C86,58 87,66 86,72', P.white, 2)}
  <path d="M86,70 L83,77 L86,76 L88,78 L89,71 Z" fill="${P.ink}"/>
  ${beast(P.white, P.stoneLight, 'hoof')}
  <!-- gold bezants on the hide -->
  <g fill="${P.gold}" stroke="${P.ink}" stroke-width="0.7">
    <circle cx="48" cy="55" r="2.3"/><circle cx="57" cy="52" r="2.3"/><circle cx="66" cy="55" r="2.3"/>
    <circle cx="53" cy="61" r="2.3"/><circle cx="62" cy="62" r="2.3"/><circle cx="73" cy="58" r="2.1"/>
    <circle cx="41" cy="60" r="2"/><circle cx="76" cy="73" r="1.6"/><circle cx="47" cy="76" r="1.6"/>
  </g>
  <!-- horns: one swivelled forward, one back -->
  <g data-part="hornL" data-pivot="22,22">
  ${tube('M22,22 C16,14 8,12 2,16', P.goldMid, 3)}
  </g>
  <g data-part="hornR" data-pivot="26,21">
  ${tube('M26,21 C32,10 42,6 50,10', P.goldMid, 3)}
  </g>
  <path d="M6,13.5 l1,3 M10,12.6 l0.3,3 M14,13 l-0.4,3 M18,15 l-1,2.6 M30,13 l2.5,1.5 M35,9.5 l1.5,2.5 M40,8 l0.8,2.8 M45,8 l0,3" ${FINE} stroke-width="1"/>
  <g ${OUTLINE}>
    <path d="M44,52 C40,44 34,37 31,29 C30,24 27,20 23,20 C18,20 14,23 13,27 L8,37 C7.5,40 10,42 13,41 C16,40 19,38 22,37 C26,42 29,49 34,58 Z" fill="${P.white}"/>
    <path d="M26,22 L32,17 L29,25 Z" fill="${P.white}"/>
    <!-- goat beard and boar tusk -->
    <path d="M12,41 L12,49 L16,41 Z" fill="${P.white}"/>
    <path d="M10,36 C6,34 5,31 6,29 C8,32 10,33 12,34 Z" fill="${P.vellum}" stroke-width="1.2"/>
  </g>
  <circle cx="19" cy="28" r="1.6" fill="${P.ink}"/>
  <circle cx="30" cy="40" r="2" fill="${P.gold}" stroke="${P.ink}" stroke-width="0.7"/>
  <circle cx="35" cy="48" r="2" fill="${P.gold}" stroke="${P.ink}" stroke-width="0.7"/>
  <path d="M24,28 C27,34 31,42 36,48" ${FINE}/>`;
}

export function amphisbaena() {
  const head = (flip) => `
  <g transform="${flip ? 'translate(100,0) scale(-1,1)' : ''}" data-part="${flip ? 'headR' : 'headL'}" data-pivot="${flip ? '74,44' : '26,44'}">
    <g ${OUTLINE} stroke-width="1.7">
      <path d="M22,46 C16,36 12,30 13,24 C14,17 22,14 27,18 C30,22 29,32 31,44 Z" fill="${P.rose}"/>
      <path d="M24,15 L29,5 L28.5,16 Z" fill="${P.gold}" stroke-width="1.2"/>
      <path d="M19.5,14.5 L20.5,6 L23.5,14 Z" fill="${P.gold}" stroke-width="1.2"/>
      <path d="M15,18 C18,13 25,12 28,16 L27,22 C24,24 20,24 17,25 L6,27.5 L11.5,23.5 L3,22 C7,19 11,18 15,18 Z" fill="${P.rose}"/>
    </g>
    <path d="M11.5,23.5 L3,22 L6,27.5 Z" fill="${P.vermilionDark}"/>
    <path d="M6,22.3 l0.8,1.6 l0.8,-1.5 M8,26.6 l0.8,-1.5 l0.8,1.4" fill="${P.white}" stroke="${P.white}" stroke-width="0.6"/>
    <path d="M17,18.5 Q19.5,16.8 22,18.5 Q19.5,20 17,18.5 Z" fill="${P.goldPale}" stroke="${P.ink}" stroke-width="0.7"/>
    <path d="M19.5,17.3 v2.4" stroke="${P.ink}" stroke-width="0.9"/>
    <path d="M16,16.5 L23,17" stroke="${P.ink}" stroke-width="1.1" stroke-linecap="round"/>
    <path d="M4,24.5 L-1,23 M4,24.5 L-0.5,26.5" stroke="${P.vermilion}" stroke-width="1" stroke-linecap="round"/>
    <path d="M17,30 q2,1.5 4,0 M18,36 q2,1.5 4,0 M20,42 q2,1.5 4,0" ${FINE} stroke-width="0.6"/>
  </g>`;
  return `
  <!-- legs -->
  ${tube('M44,70 L40,86 M40,86 l-4,2 M40,86 l0,4 M40,86 l4,2', P.goldMid, 1.8)}
  ${tube('M56,70 L60,86 M60,86 l-4,2 M60,86 l0,4 M60,86 l4,2', P.goldMid, 1.8)}
  <!-- wings -->
  <g ${OUTLINE}>
    <g data-part="wingL" data-pivot="46,60">
    <path d="M46,60 C40,50 34,46 28,46 C32,50 30,52 34,56 C30,56 30,58 36,62 Z" fill="${P.lapis}"/>
    </g>
    <g data-part="wingR" data-pivot="54,60">
    <path d="M54,60 C60,50 66,46 72,46 C68,50 70,52 66,56 C70,56 70,58 64,62 Z" fill="${P.lapis}"/>
    </g>
  </g>
  <!-- one serpent body, a head at each end -->
  ${tube('M26,42 C26,60 36,74 50,74 C64,74 74,60 74,42', P.rose, 9)}
  <path d="M30,52 C34,64 42,70 50,70 C58,70 66,64 70,52" fill="none" stroke="${P.goldPale}" stroke-width="2" stroke-dasharray="3 2"/>
  ${head(false)}${head(true)}
  <path d="M28,46 C30,56 36,64 44,68" ${HILITE}/>`;
}
