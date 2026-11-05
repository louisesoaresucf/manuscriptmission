// Entry point: mounts the art sprite and drives the screens.
import { mountSprite, useMarkup } from './art/sprite.js';

mountSprite();

document.getElementById('title-books').innerHTML = ['bestiary', 'alchemy', 'herbarium']
  .map((kind) => useMarkup(`book-${kind}`, '0 0 100 130'))
  .join('');

document.getElementById('btn-begin').addEventListener('click', () => {
  // The rooms are added in the next milestone.
  alert('The first library room is still being illuminated. Check back soon!');
});
