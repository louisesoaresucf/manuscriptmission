// Entry point: mounts the art sprite and drives the screens.
// manuscript (cover → story pages) → rooms (with results between)
// → the manuscript reopens (finale → collection pages)
import { mountSprite } from './art/sprite.js';
import { storyPanel } from './art/ornaments.js';
import { ROOMS } from './data/rooms.js';
import { ITEMS, CATEGORY_BOOK, itemById } from './data/items.js';
import { Game } from './game.js';
import { Book, storyPage, collectionPage } from './book.js';
import { audio } from './audio.js';
import * as ui from './ui.js';
import { style, setStyle, STYLES } from './style.js';

mountSprite();

const $ = (id) => document.getElementById(id);
const state = {
  results: [], // best result per room index
  unlocked: 0, // highest room index the player may enter
  found: new Set(), // item ids placed this session
  game: null,
};

const book = new Book();
book.onOpen = () => { audio.unlock(); audio.startMusic(); };

// ---------- the story, as pages of the manuscript ----------
const INTRO = [
  { art: 'library', title: 'The Great Library', label: 'A peaceful medieval library', text: 'Long ago, in a great library, the most beautiful manuscripts in the land sat safely on their shelves, full of painted beasts, elements and herbs.' },
  { art: 'witch', title: 'The Witch’s Spell', label: 'The witch casts her spell, with her owl and her enchanted broom', text: 'But one stormy night, a jealous witch crept in with her eagle-owl and her enchanted broom, and cast a tumbling spell!' },
  { art: 'escape', title: 'The Great Escape', label: 'Illustrations escaping from fallen books', text: 'Every book fell from its shelf, and the illustrations painted inside escaped into the library!' },
  { art: 'howto', title: 'How to Restore the Manuscripts', label: 'Creatures go to the Bestiary, elements to the Alchemy Codex, plants to the Herbarium', text: 'Tap an illustration to pick it up, then tap the book where it belongs. Pinch or scroll to zoom, and drag to look around. Stuck? The magic quill gives a hint. Beware: every minute the witch’s broom, her owl or the witch herself comes to move things. Tap them to shoo them away!' },
];

const pagesFor = (cards) => cards.map((c) => storyPage({ ...c, art: storyPanel(c.art) }));

// The collection: three chapters, six illustrations to a page.
function collectionPages() {
  const pages = [];
  for (const [cat, title] of [['creature', 'The Bestiary'], ['element', 'The Alchemy Codex'], ['plant', 'The Herbarium']]) {
    const items = ITEMS.filter((it) => it.category === cat);
    for (let i = 0; i < items.length; i += 6) pages.push(collectionPage(title, items.slice(i, i + 6), state.found, i / 6 + 1, Math.ceil(items.length / 6)));
  }
  return pages;
}

function showIntro() {
  ui.showScreen('screen-book');
  book.open(pagesFor(INTRO), { lastLabel: 'Enter the library', onDone: () => startRoom(0) });
}

// Tapping an illustration in the collection opens its lore card.
$('codex').addEventListener('click', (e) => {
  const b = e.target.closest('.col-item.got');
  if (!b) return;
  e.stopPropagation();
  audio.page();
  ui.loreModal(itemById[b.dataset.id], 'Close');
});

// ---------- rooms ----------
async function startRoom(index) {
  state.game?.destroy();
  const room = ROOMS[index];
  ui.showScreen('screen-game');
  const game = new Game(room, {
    onComplete: (r) => roomComplete(index, r),
    onPlaced: (id) => state.found.add(id),
  });
  state.game = game;
  game.start();
  game.pause();
  await ui.modal({
    art: `<span class="room-number">${['I', 'II', 'III'][index]}</span>`,
    tag: `Room ${index + 1} of ${ROOMS.length}`,
    title: room.name,
    text: `${room.intro} Find 4 creatures, 4 elements and 4 plants.`,
    button: 'Start searching',
    kind: 'room-intro',
  });
  game.resume();
  game.t0 = performance.now();
  game.pausedMs = 0;
}

function roomComplete(index, r) {
  audio.fanfare();
  const prev = state.results[index];
  if (!prev || r.stars > prev.stars || (r.stars === prev.stars && r.scored < prev.scored)) state.results[index] = r;
  state.unlocked = Math.max(state.unlocked, Math.min(index + 1, ROOMS.length - 1));
  const room = ROOMS[index];
  const last = index === ROOMS.length - 1;

  $('result-title').textContent = `${room.name} restored!`;
  $('result-stars').innerHTML = ui.starsMarkup(r.stars);
  $('result-time').textContent = `Time: ${ui.fmtTime(r.time)}` + (r.hints ? `  ·  Hints used: ${r.hints} (+${r.hints * 10}s)` : '  ·  No hints used!') +
    (r.shoos ? `  ·  Shooed away: ${r.shoos} (−${r.shoos * 10}s)` : '');
  $('result-text').textContent = room.done;
  $('result-actions').innerHTML = `
    <button class="btn" type="button" data-act="next">${last ? 'See the library restored' : 'Next room'}</button>
    <button class="btn btn-quiet" type="button" data-act="replay">Play this room again</button>
    <button class="btn btn-quiet" type="button" data-act="collection">Collection</button>`;
  $('result-actions').onclick = (e) => {
    const act = e.target.closest('button')?.dataset.act;
    if (!act) return;
    if (act === 'next') last ? finale() : startRoom(index + 1);
    if (act === 'replay') startRoom(index);
    if (act === 'collection') openCollection();
  };
  setTimeout(() => ui.showScreen('screen-result'), 400);
}

// The manuscript reopens: the library restored, then the collection.
function finale() {
  state.game?.destroy();
  state.game = null;
  const total = state.results.reduce((n, r) => n + (r ? r.stars : 0), 0);
  const ending = {
    art: storyPanel('restored'),
    title: 'The Library Restored',
    label: 'The restored library, with the witch flying away on her broom',
    text: `Every illustration is home, and the witch has flown off on her broomstick with her owl! You earned ${total} of ${ROOMS.length * 3} stars. Turn the page to read the restored manuscripts.`,
  };
  ui.showScreen('screen-book');
  book.open([storyPage(ending), ...collectionPages()], { lastLabel: 'Play again', autoOpen: true, onDone: () => startRoom(0) });
}

// The collection between rooms: the manuscript opens straight to its chapters.
function openCollection() {
  ui.showScreen('screen-book');
  book.open(collectionPages(), { lastLabel: 'Back to the results', autoOpen: true, onDone: () => ui.showScreen('screen-result') });
}

// ---------- mute ----------
$('btn-mute').addEventListener('click', () => {
  const muted = !audio.muted;
  audio.unlock();
  audio.setMuted(muted);
  $('btn-mute').setAttribute('aria-pressed', String(muted));
  $('btn-mute').setAttribute('aria-label', muted ? 'Turn sound on' : 'Mute sound');
  $('btn-mute').classList.toggle('muted', muted);
});

showIntro();

// Style samples: switch the whole game's art style (rebuilds the drawings and
// the story pages). The sample build shows a picker on the manuscript screen.
function switchStyle(s) {
  setStyle(s);
  mountSprite({ replace: true });
  showIntro();
  document.querySelectorAll('.style-pick button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.style === style())));
}
if (window.__mmStylePicker || new URLSearchParams(location.search).has('picker')) {
  const names = { classic: 'Current', painted: 'Painted', dark: 'Dark fantasy' };
  const bar = document.createElement('div');
  bar.className = 'style-pick';
  bar.innerHTML = `<span>Art style</span>${STYLES.map((k) => `<button type="button" data-style="${k}" aria-pressed="${k === style()}">${names[k]}</button>`).join('')}`;
  bar.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) switchStyle(b.dataset.style); });
  $('screen-book').prepend(bar);
}

// Debug hook used by the automated tests.
window.__mm = { state, ROOMS, startRoom, finale, openCollection, book, setStyle: switchStyle, bookFor: (id) => CATEGORY_BOOK[itemById[id].category] };
