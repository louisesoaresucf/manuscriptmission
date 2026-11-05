// Builds one hidden SVG sprite holding the shared <defs> and every drawing
// as a <symbol>. Anything on the page can then draw an item with
// <svg><use href="#item-griffin"/></svg>.
import { defsMarkup } from './defs.js';
import { bookCover, BOOKS } from './ornaments.js';
import { ITEMS } from '../data/items.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

export function mountSprite() {
  if (document.getElementById('mm-sprite')) return;
  const symbols = [];
  for (const it of ITEMS) {
    symbols.push(`<symbol id="item-${it.id}" viewBox="0 0 100 100">${it.draw()}</symbol>`);
  }
  for (const kind of Object.keys(BOOKS)) {
    symbols.push(`<symbol id="book-${kind}" viewBox="0 0 100 130">${bookCover(kind)}</symbol>`);
  }
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.id = 'mm-sprite';
  svg.setAttribute('aria-hidden', 'true');
  // Not display:none, because Chrome drops gradients defined in hidden SVGs.
  svg.setAttribute('style', 'position:absolute;width:0;height:0;overflow:hidden');
  svg.innerHTML = defsMarkup() + symbols.join('');
  document.body.prepend(svg);
}

export function useMarkup(symbolId, viewBox = '0 0 100 100', cls = '') {
  return `<svg class="${cls}" viewBox="${viewBox}" aria-hidden="true"><use href="#${symbolId}"/></svg>`;
}
