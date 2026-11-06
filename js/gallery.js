// Art review page: renders every item, book cover, and a small-size test.
import { mountSprite, useMarkup } from './art/sprite.js';
import { BOOKS } from './art/ornaments.js';
import { ITEMS, CATEGORY_BOOK } from './data/items.js';

mountSprite();

document.getElementById('books').innerHTML = Object.entries(BOOKS)
  .map(([kind, b]) => `<figure>${useMarkup(`book-${kind}`, '0 0 100 130')}<figcaption>${b.name}</figcaption></figure>`)
  .join('');

document.getElementById('cards').innerHTML = ITEMS.map((it) => {
  const book = BOOKS[CATEGORY_BOOK[it.category]].name;
  const tag = it.element ? `${it.element} · ${book}` : book;
  return `<article class="card">
    ${useMarkup(`item-${it.id}`)}
    <span class="tag">${tag}</span>
    <h3>${it.name}</h3>
    <p>${it.lore}</p>
  </article>`;
}).join('');

document.getElementById('small').innerHTML = ITEMS.map((it) =>
  useMarkup(`item-${it.id}`) + useMarkup(`item-${it.id}`, '0 0 100 100', 's64')
).join('');
