// Plants for the Herbarium. Herbal illustrations are flat and symmetrical,
// showing the whole plant from root to flower, often with leaves splayed.
import { P, OUTLINE, FINE, HILITE } from './defs.js';

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
