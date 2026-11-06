// Entry point: mounts the art sprite and drives the screens.
// title → intro story → rooms (with results between) → finale → collection
import { mountSprite, useMarkup } from './art/sprite.js';
import { storyPanel } from './art/ornaments.js';
import { ROOMS } from './data/rooms.js';
import { ITEMS, CATEGORY_BOOK, itemById } from './data/items.js';
import { Game } from './game.js';
import { audio } from './audio.js';
import * as ui from './ui.js';

mountSprite();

const $ = (id) => document.getElementById(id);
const state = {
  results: [], // best result per room index
  unlocked: 0, // highest room index the player may enter
  found: new Set(), // item ids placed this session
  game: null,
  backTo: 'screen-title',
};

$('title-books').innerHTML = ['bestiary', 'alchemy', 'herbarium']
  .map((kind) => useMarkup(`book-${kind}`, '0 0 100 130'))
  .join('');

// ---------- story ----------
const INTRO = [
  { art: 'library', label: 'A peaceful medieval library', text: 'Long ago, in a great library, the most beautiful manuscripts in the land sat safely on their shelves, full of painted beasts, elements and herbs.' },
  { art: 'witch', label: 'The witch casts her spell, with her owl and her enchanted broom', text: 'But one stormy night, a jealous witch crept in with her eagle-owl and her enchanted broom, and cast a tumbling spell!' },
  { art: 'escape', label: 'Illustrations escaping from fallen books', text: 'Every book fell from its shelf, and the illustrations painted inside escaped into the library!' },
  { art: 'howto', label: 'Creatures go to the Bestiary, elements to the Alchemy Codex, plants to the Herbarium', text: 'Tap an illustration to pick it up, then tap the book where it belongs. Pinch or scroll to zoom, and drag to look around. Stuck? The magic quill gives a hint. Beware: every minute the witch’s broom, her owl or the witch herself comes to move things. Tap them to shoo them away!' },
];

function playStory(panels, done, lastButton = 'Enter the library') {
  let i = 0;
  const show = () => {
    const p = panels[i];
    $('story-art').innerHTML = storyPanel(p.art);
    $('story-art').setAttribute('aria-label', p.label);
    $('story-text').textContent = p.text;
    const last = i === panels.length - 1;
    $('story-actions').innerHTML = `
      ${i > 0 ? '<button class="btn btn-quiet" type="button" data-act="back">Back</button>' : ''}
      <button class="btn" type="button" data-act="next">${last ? lastButton : 'Next'}</button>`;
    ui.showScreen('screen-story');
  };
  $('story-actions').onclick = (e) => {
    const act = e.target.closest('button')?.dataset.act;
    if (!act) return;
    audio.page();
    if (act === 'back') { i--; show(); return; }
    if (i < panels.length - 1) { i++; show(); } else done();
  };
  show();
}

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
    if (act === 'collection') openCollection('screen-result');
  };
  setTimeout(() => ui.showScreen('screen-result'), 400);
}

function finale() {
  state.game?.destroy();
  state.game = null;
  const total = state.results.reduce((n, r) => n + (r ? r.stars : 0), 0);
  playStory([{
    art: 'restored',
    label: 'The restored library, with the witch flying away',
    text: `Every illustration is home, and the witch has flown off on her broomstick! You earned ${total} of ${ROOMS.length * 3} stars. The grateful librarians have opened the restored manuscripts for you to read.`,
  }], () => openCollection('screen-title'), 'Read the manuscripts');
}

// ---------- collection ----------
function openCollection(backTo) {
  state.backTo = backTo;
  const groups = [['creature', 'Bestiary'], ['element', 'Alchemy Codex'], ['plant', 'Herbarium']];
  $('collection').innerHTML = groups.map(([cat, title]) => `
    <h3>${title}</h3>
    <div class="collection-grid">
      ${ITEMS.filter((it) => it.category === cat).map((it) => {
        const got = state.found.has(it.id);
        return `<button class="col-item ${got ? 'got' : 'missing'}" type="button" data-id="${it.id}" ${got ? '' : 'aria-disabled="true"'}>
          <svg viewBox="0 0 100 100" aria-hidden="true"><use href="#item-${it.id}"/></svg>
          <span>${got ? it.name : '?'}</span>
        </button>`;
      }).join('')}
    </div>`).join('');
  $('collection-count').textContent = `${state.found.size} of ${ITEMS.length} illustrations returned.` +
    (state.found.size < ITEMS.length ? ' The missing ones are still hiding somewhere in the library!' : ' Every one is home!');
  $('collection').onclick = (e) => {
    const b = e.target.closest('.col-item.got');
    if (!b) return;
    audio.page();
    ui.loreModal(ITEMS.find((it) => it.id === b.dataset.id), 'Close');
  };
  $('btn-collection-back').textContent = backTo === 'screen-title' ? 'Back to the start' : 'Back';
  ui.showScreen('screen-collection');
}

$('btn-collection-back').addEventListener('click', () => {
  if (state.backTo === 'screen-title') renderTitle();
  ui.showScreen(state.backTo);
});

// ---------- title ----------
function renderTitle() {
  const btn = $('btn-begin');
  btn.textContent = state.results.length ? 'Play again' : 'Begin';
}

$('btn-begin').addEventListener('click', () => {
  audio.unlock();
  audio.startMusic();
  if (state.results.length) startRoom(0);
  else playStory(INTRO, () => startRoom(0));
});

// ---------- mute ----------
$('btn-mute').addEventListener('click', () => {
  const muted = !audio.muted;
  audio.unlock();
  audio.setMuted(muted);
  $('btn-mute').setAttribute('aria-pressed', String(muted));
  $('btn-mute').setAttribute('aria-label', muted ? 'Turn sound on' : 'Mute sound');
  $('btn-mute').classList.toggle('muted', muted);
});

// Debug hook used by the automated tests.
window.__mm = { state, ROOMS, startRoom, finale, openCollection, bookFor: (id) => CATEGORY_BOOK[itemById[id].category] };
