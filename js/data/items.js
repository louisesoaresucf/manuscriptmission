// The escaped illustrations. `category` decides which book an item belongs in.
import * as C from '../art/creatures.js';
import * as E from '../art/elements.js';
import * as PL from '../art/plants.js';

export const CATEGORY_BOOK = {
  creature: 'bestiary',
  element: 'alchemy',
  plant: 'herbarium',
};

const creature = (id, name, draw, lore, hint) => ({ id, name, category: 'creature', draw, lore, hint });
const element = (id, name, el, draw, lore, hint) => ({ id, name, category: 'element', element: el, draw, lore, hint });
const plant = (id, name, draw, lore, hint) => ({ id, name, category: 'plant', draw, lore, hint });

export const ITEMS = [
  // ---- Creatures (Bestiary) ----
  creature('unicorn', 'Unicorn', C.unicorn,
    'So swift and wild that no hunter could catch it, the unicorn had a horn that was said to make poisoned water pure again.'),
  creature('griffin', 'Griffin', C.griffin,
    'Half eagle and half lion, the griffin was said to guard mountains of gold, and to be strong enough to carry off an ox!'),
  creature('dragon', 'Dragon', C.dragon,
    'The biggest of all the serpents! Bestiaries said a dragon’s strength was in its tail, not its teeth, and that it was the great enemy of the elephant.'),
  creature('pelican', 'Pelican', C.pelican,
    'Medieval bestiaries told that the pelican fed its chicks with its own blood, which made it a symbol of selfless love.'),
  creature('phoenix', 'Phoenix', C.phoenix,
    'Only one phoenix lives at a time. After 500 years it builds a nest of spices, bursts into flame, and rises again from the ashes!',
    'The Phoenix loves fire… but it is a creature! Try the Bestiary.'),
  creature('basilisk', 'Basilisk', C.basilisk,
    'The king of serpents wore a little crown. Its glare was so deadly that only the brave weasel dared to fight it.'),
  creature('siren', 'Siren', C.siren,
    'Sirens sang such sweet songs that sailors drifted off to sleep at sea. Wise travellers plugged their ears with wax!'),
  creature('salamander', 'Salamander', C.salamander,
    'Bestiaries claimed the salamander was so cold that it could live in fire without burning, and could even put the flames out!',
    'The Salamander sits in fire… but it is a creature! Try the Bestiary.'),
  creature('manticore', 'Manticore', C.manticore,
    'A lion’s body, a man’s face, three rows of teeth and a scorpion’s sting! Its voice was said to sound like pipes and trumpets together.'),
  creature('caladrius', 'Caladrius', C.caladrius,
    'This snow-white bird could tell if a sick person would get better. If it looked at them, they would recover!'),
  creature('yale', 'Yale', C.yale,
    'The yale could swivel its long horns, pointing one forward and one back, so it was always ready for a fight.'),
  creature('amphisbaena', 'Amphisbaena', C.amphisbaena,
    'A serpent with a head at each end! It could run in either direction, and its eyes were said to shine like lamps.'),

  // ---- Elements (Alchemy Codex) ----
  element('candle-flame', 'Candle Flame', 'Fire', E.candleFlame,
    'Fire was one of the four elements that medieval scholars believed made up the whole world. They thought of it as hot and dry, and always reaching upward.'),
  element('water-droplet', 'Water Droplet', 'Water', E.waterDroplet,
    'Water was thought to be cold and moist. It always seeks the lowest place, flowing down to fill the rivers and the seas.'),
  element('mountain', 'Mountain', 'Earth', E.mountain,
    'Earth was cold and dry, the heaviest of the four elements. That, scholars said, is why the ground lies beneath everything else.'),
  element('cloud', 'Cloud', 'Sky', E.cloud,
    'The element of air, or sky, was hot and moist. It filled the space between the earth and the heavens, carrying clouds and birds.'),
  element('sun', 'Sun', 'Fire', E.sun,
    'Alchemists drew the fiery Sun as the sign of gold, the most perfect of all metals.'),
  element('wave', 'Wave', 'Water', E.wave,
    'Over 1,300 years ago, the monk Bede noticed that the Moon pulls the ocean’s tides in and out.'),
  element('gemstone', 'Gemstone', 'Earth', E.gemstone,
    'Precious stones grew deep in the earth, said the medieval books of gems. Emeralds were thought to rest tired eyes.'),
  element('wind-face', 'Wind-Face', 'Sky', E.windFace,
    'Old maps showed the winds as puffing faces at the edges of the world. There were twelve winds, each with its own name.'),
  element('lightning', 'Lightning Bolt', 'Fire', E.lightning,
    'Fire from the heavens! Some believed lightning was fire squeezed out of the clouds as they crashed together.'),
  element('fountain', 'Fountain', 'Water', E.fountain,
    'Every monastery had a fountain. Monks washed their hands there before meals, and before touching precious books!'),
  element('lodestone', 'Lodestone', 'Earth', E.lodestone,
    'This wonderful rock pulls iron towards it. Sailors rubbed needles on lodestones to make the very first compasses.'),
  element('star-moon', 'Star & Crescent Moon', 'Sky', E.starMoon,
    'Beyond the air, medieval people imagined crystal spheres carrying the Moon, the planets and the stars, turning slowly and making heavenly music.'),

  // ---- Plants (Herbarium) ----
  plant('rose', 'Rose', PL.rose,
    'The rose was the queen of flowers. Rose water and rose oil were used to cool fevers, soothe headaches and make things smell sweet.'),
  plant('lily', 'Lily', PL.lily,
    'The white lily stood for purity and was painted in many manuscripts. Its roots were made into ointments for burns.'),
  plant('rosemary', 'Rosemary', PL.rosemary,
    'Rosemary was said to strengthen the memory, and its fragrant smoke was burned to freshen the air.'),
  plant('sage', 'Sage', PL.sage,
    'Its name comes from the Latin for “to save”. A medieval saying asked: why should anyone fall ill who has sage growing in their garden?'),
  plant('mandrake', 'Mandrake', PL.mandrake,
    'Its root looks like a little person, and legend said it screamed when pulled from the ground! Herbalists used it to help people sleep.',
    'The Mandrake looks like a little person… but it is a plant! Try the Herbarium.'),
  plant('lavender', 'Lavender', PL.lavender,
    'Lavender was scattered on floors and tucked among clothes to make them smell fresh and to keep away fleas and moths.'),
  plant('columbine', 'Columbine', PL.columbine,
    'Its flowers look like five little doves huddled together. Its name comes from the Latin “columba”, meaning dove.'),
  plant('foxglove', 'Foxglove', PL.foxglove,
    'Its bell-shaped flowers fit like gloves on fingertips. Beware, it is poisonous! Centuries later it became an important heart medicine.'),
  plant('hellebore', 'Hellebore', PL.hellebore,
    'The black hellebore has pale flowers but a dark root. Herbals said it could cure madness, but it is poisonous, so only the wisest healers used it.'),
  plant('mistletoe', 'Mistletoe', PL.mistletoe,
    'Mistletoe grows high on tree branches without ever touching the ground, so people believed it had special protective powers.'),
  plant('peony', 'Peony', PL.peony,
    'The peony was said to glow in the dark! Herbals warned to pick it only at night, or a woodpecker might peck at you.'),
  plant('wormwood', 'Wormwood', PL.wormwood,
    'Bitter wormwood kept fleas and moths away. Scribes even mixed it into their ink so that mice wouldn’t nibble the manuscripts!'),
];

export const itemById = Object.fromEntries(ITEMS.map((it) => [it.id, it]));

const BOOK_NAMES = { bestiary: 'Bestiary', alchemy: 'Alchemy Codex', herbarium: 'Herbarium' };

// Gentle hint shown when an item is offered to the wrong book.
export function wrongBookHint(item) {
  if (item.hint) return item.hint;
  const book = BOOK_NAMES[CATEGORY_BOOK[item.category]];
  if (item.category === 'creature') return `The ${item.name} is a creature. It lives in the ${book}!`;
  if (item.category === 'element') return `The ${item.name} is the element of ${item.element}. Try the ${book}!`;
  return `The ${item.name} is a plant. It grows in the ${book}!`;
}
