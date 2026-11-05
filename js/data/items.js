// The escaped illustrations. `category` decides which book an item belongs in.
import * as creatures from '../art/creatures.js';
import * as elements from '../art/elements.js';
import * as plants from '../art/plants.js';

export const CATEGORY_BOOK = {
  creature: 'bestiary',
  element: 'alchemy',
  plant: 'herbarium',
};

export const ITEMS = [
  {
    id: 'griffin',
    name: 'Griffin',
    category: 'creature',
    draw: creatures.griffin,
    lore: 'Half eagle and half lion, the griffin was said to guard mountains of gold, and to be strong enough to carry off an ox!',
  },
  {
    id: 'candle-flame',
    name: 'Candle Flame',
    category: 'element',
    element: 'Fire',
    draw: elements.candleFlame,
    lore: 'Fire was one of the four elements that medieval scholars believed made up the whole world. They thought of it as hot and dry, and always reaching upward.',
  },
  {
    id: 'mandrake',
    name: 'Mandrake',
    category: 'plant',
    draw: plants.mandrake,
    lore: 'Its root looks like a little person, and legend said it screamed when pulled from the ground! Herbalists used it to help people sleep.',
  },
];

export const itemById = Object.fromEntries(ITEMS.map((it) => [it.id, it]));
