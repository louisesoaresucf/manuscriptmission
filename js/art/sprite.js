// Builds one hidden SVG sprite holding the shared <defs> and every drawing
// as a <symbol>. Anything on the page can then draw an item with
// <svg><use href="#item-griffin"/></svg>.
import { defsMarkup } from './defs.js';
import { sceneDefs } from './scenery.js';
import { shadingDefs, shade } from './shading.js';
import { bookCover, BOOKS, witchDefs } from './ornaments.js';
import { villainDefs } from './villains.js';
import { ITEMS } from '../data/items.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

// Effect parts (fire breath, a rolling boulder…) only appear during a 3D
// reaction, so leave them out of the flat drawings.
export function restingArt(markup) {
  return markup.replace(/<g data-part="[^"]*" data-pivot="[^"]*" data-rest="hidden">[\s\S]*?<\/g>/g, '');
}

export function mountSprite() {
  if (document.getElementById('mm-sprite')) return;
  const symbols = [];
  for (const it of ITEMS) {
    symbols.push(`<symbol id="item-${it.id}" viewBox="0 0 100 100">${shade(restingArt(it.draw()))}</symbol>`);
  }
  for (const kind of Object.keys(BOOKS)) {
    symbols.push(`<symbol id="book-${kind}" viewBox="0 0 100 130">${shade(bookCover(kind))}</symbol>`);
  }
  // The cover roundel: the three manuscripts in a ring of gold.
  symbols.push(`<symbol id="book-roundel" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="47" fill="#3a0f0a" stroke="#c9a227" stroke-width="4"/>
    <circle cx="50" cy="50" r="40" fill="none" stroke="#f0d77a" stroke-width="1.5" stroke-dasharray="0.1 4.5" stroke-linecap="round"/>
    <use href="#book-bestiary" x="10" y="30" width="28" height="36"/>
    <use href="#book-alchemy" x="36" y="22" width="28" height="36"/>
    <use href="#book-herbarium" x="62" y="30" width="28" height="36"/>
  </symbol>`);
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.id = 'mm-sprite';
  svg.setAttribute('aria-hidden', 'true');
  // Not display:none, because Chrome drops gradients defined in hidden SVGs.
  svg.setAttribute('style', 'position:absolute;width:0;height:0;overflow:hidden');
  // The witch, owl and broom gradients live here, once: a second copy inside a
  // hidden screen would win the id lookup and leave the villains colourless.
  svg.innerHTML = defsMarkup() + sceneDefs() + shadingDefs() + villainDefs() + witchDefs() + symbols.join('') + extraSymbols();
  document.body.prepend(svg);
}

// Glow used to show the selected item.
function extraSymbols() {
  return `<defs><filter id="mm-glow" x="-30%" y="-30%" width="160%" height="160%">
    <feMorphology in="SourceAlpha" operator="dilate" radius="5" result="thick"/>
    <feGaussianBlur in="thick" stdDeviation="5" result="blur"/>
    <feFlood flood-color="#ffe680"/><feComposite in2="blur" operator="in" result="glow"/>
    <feMerge><feMergeNode in="glow"/><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter></defs>`;
}

export function useMarkup(symbolId, viewBox = '0 0 100 100', cls = '') {
  return `<svg class="${cls}" viewBox="${viewBox}" aria-hidden="true"><use href="#${symbolId}"/></svg>`;
}
