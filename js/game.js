// One room of play: find an item, tap it, then tap the book it belongs in.
import { Scene } from './scene.js';
import { Viewport } from './viewport.js';
import { itemById, CATEGORY_BOOK, wrongBookHint } from './data/items.js';
import { BOOKS } from './art/ornaments.js';
import { audio } from './audio.js';
import * as ui from './ui.js';

export const HINT_COOLDOWN = 30; // seconds
export const HINT_PENALTY = 10; // seconds added to the star time per hint

export class Game {
  constructor(room, { onComplete, onPlaced }) {
    this.room = room;
    this.onComplete = onComplete;
    this.onPlaced = onPlaced || (() => {});
    this.selected = null;
    this.hints = 0;
    this.hintReadyAt = 0;
    this.pausedMs = 0;
    this.pauseStart = null;
    this.busy = false;
    this.done = false;
    this.abort = new AbortController();

    this.totals = { bestiary: 0, alchemy: 0, herbarium: 0 };
    this.counts = { bestiary: 0, alchemy: 0, herbarium: 0 };
    for (const p of room.items) this.totals[CATEGORY_BOOK[itemById[p.id].category]]++;
  }

  start() {
    const svg = document.getElementById('scene');
    this.scene = new Scene(svg, this.room);
    this.viewport = new Viewport(svg, this.scene.world, this.scene.width, this.scene.height, {
      onTap: (pt) => this.tapScene(pt),
    });
    document.getElementById('room-name').textContent = this.room.name;

    const sig = { signal: this.abort.signal };
    for (const btn of document.querySelectorAll('.book-btn')) {
      btn.classList.remove('full', 'awaiting', 'shake');
      btn.addEventListener('click', () => this.offer(btn.dataset.book), sig);
    }
    document.getElementById('btn-hint').addEventListener('click', () => this.useHint(), sig);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.pause(); else this.resume();
    }, sig);
    this.updateCounts();

    this.t0 = performance.now();
    this.tick = setInterval(() => this.updateHud(), 250);
    this.updateHud();
  }

  destroy() {
    this.abort.abort();
    clearInterval(this.tick);
    this.viewport?.destroy();
    ui.hideToast();
  }

  // ---- time ----
  elapsed() {
    const now = performance.now();
    const paused = this.pausedMs + (this.pauseStart !== null ? now - this.pauseStart : 0);
    return (now - this.t0 - paused) / 1000;
  }
  pause() { if (this.pauseStart === null) this.pauseStart = performance.now(); }
  resume() {
    if (this.pauseStart !== null) {
      this.pausedMs += performance.now() - this.pauseStart;
      this.pauseStart = null;
    }
  }

  updateHud() {
    if (this.done) return;
    document.getElementById('timer').textContent = ui.fmtTime(this.elapsed());
    const left = Math.ceil(this.hintReadyAt - this.elapsed());
    const btn = document.getElementById('btn-hint');
    const cd = document.getElementById('hint-cooldown');
    if (left > 0) {
      btn.classList.add('cooling');
      btn.style.setProperty('--cool', `${(left / HINT_COOLDOWN) * 360}deg`);
      cd.textContent = left;
      btn.setAttribute('aria-label', `Hint ready in ${left} seconds`);
    } else {
      btn.classList.remove('cooling');
      cd.textContent = '';
      btn.setAttribute('aria-label', 'Hint');
    }
  }

  updateCounts() {
    for (const [book, total] of Object.entries(this.totals)) {
      const el = document.querySelector(`[data-count="${book}"]`);
      el.textContent = `${this.counts[book]}/${total}`;
      const btn = document.querySelector(`.book-btn[data-book="${book}"]`);
      btn.setAttribute('aria-label', `${BOOKS[book].name}, ${this.counts[book]} of ${total} returned`);
    }
  }

  // Put messages on the half of the screen away from this item.
  awayFrom(id) {
    const it = this.scene.items.get(id);
    if (!it) return 'top';
    return this.viewport.toScreen(it.x, it.y).y < this.viewport.height / 2 ? 'bottom' : 'top';
  }

  // ---- selecting and placing ----
  tapScene(pt) {
    if (this.busy || this.done) return true;
    const hit = this.scene.hitTest(pt, this.viewport.s);
    if (hit) {
      if (this.selected === hit.id) this.deselect();
      else this.select(hit.id);
      return true;
    }
    if (this.selected) this.deselect();
    return false;
  }

  select(id) {
    if (this.selected) this.scene.setSelected(this.selected, false);
    this.selected = id;
    this.scene.setSelected(id, true);
    this.scene.clearRing();
    audio.pickUp();
    document.getElementById('bookbar').classList.add('awaiting');
    ui.toast(`You found the ${itemById[id].name}! Which book does it belong in?`, 4000, this.awayFrom(id));
  }

  deselect() {
    if (this.selected) this.scene.setSelected(this.selected, false);
    this.selected = null;
    document.getElementById('bookbar').classList.remove('awaiting');
  }

  offer(book) {
    if (this.busy || this.done) return;
    audio.unlock();
    if (!this.selected) {
      ui.toast('First find an escaped illustration in the library and tap it. Then tap its book.');
      return;
    }
    const item = itemById[this.selected];
    if (CATEGORY_BOOK[item.category] === book) this.place(item, book);
    else this.reject(item, book);
  }

  reject(item, book) {
    audio.wrong();
    const btn = document.querySelector(`.book-btn[data-book="${book}"]`);
    btn.classList.remove('shake');
    void btn.offsetWidth;
    btn.classList.add('shake');
    this.scene.wobble(item.id);
    this.deselect();
    ui.toast(wrongBookHint(item), 3800, this.awayFrom(item.id));
  }

  async place(item, book) {
    this.busy = true;
    const id = item.id;
    this.scene.setSelected(id, false);
    this.selected = null;
    document.getElementById('bookbar').classList.remove('awaiting');
    ui.hideToast();

    await this.fly(id, book);
    this.scene.markFound(id);
    this.counts[book]++;
    this.updateCounts();
    audio.correct();
    this.onPlaced(id);
    const btn = document.querySelector(`.book-btn[data-book="${book}"]`);
    btn.classList.remove('bump');
    void btn.offsetWidth;
    btn.classList.add('bump');
    if (this.counts[book] === this.totals[book]) {
      btn.classList.add('full');
      setTimeout(() => audio.bookFull(), 350);
    }

    const finished = this.scene.unfound().length === 0;
    this.pause();
    await ui.loreModal(item, finished ? 'Finish the room' : 'Keep searching');
    this.resume();
    this.busy = false;
    if (finished) this.finish();
  }

  // Animate a copy of the item from the scene into the book.
  fly(id, book) {
    const from = this.scene.el(id).getBoundingClientRect();
    const to = document.querySelector(`.book-btn[data-book="${book}"] svg`).getBoundingClientRect();
    const size = Math.max(40, Math.min(from.width, from.height));
    const flyer = document.createElement('div');
    flyer.className = 'flyer';
    flyer.innerHTML = `<svg viewBox="0 0 100 100"><use href="#item-${id}"/></svg>`;
    Object.assign(flyer.style, {
      width: `${size}px`, height: `${size}px`,
      left: `${from.left + from.width / 2 - size / 2}px`,
      top: `${from.top + from.height / 2 - size / 2}px`,
    });
    document.body.appendChild(flyer);
    this.scene.el(id).classList.add('found');
    const dx = to.left + to.width / 2 - (from.left + from.width / 2);
    const dy = to.top + to.height / 2 - (from.top + from.height / 2);
    const endScale = Math.max(0.2, (to.width * 0.6) / size);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const anim = flyer.animate([
      { transform: 'translate(0,0) scale(1) rotate(0deg)', opacity: 1 },
      { transform: `translate(${dx * 0.45}px, ${dy * 0.45 - 90}px) scale(1.15) rotate(-8deg)`, opacity: 1, offset: 0.45 },
      { transform: `translate(${dx}px, ${dy}px) scale(${endScale}) rotate(0deg)`, opacity: 0.2 },
    ], { duration: reduce ? 1 : 700, easing: 'cubic-bezier(.4,.1,.3,1)' });
    return new Promise((resolve) => {
      let settled = false;
      const done = () => { if (settled) return; settled = true; flyer.remove(); resolve(); };
      anim.onfinish = done;
      anim.oncancel = done;
      // Never let a stalled animation leave the game unable to accept taps.
      setTimeout(done, 1500);
    });
  }

  // ---- hints ----
  useHint() {
    if (this.busy || this.done) return;
    audio.unlock();
    const now = this.elapsed();
    if (now < this.hintReadyAt) {
      ui.toast(`The quill is still recharging… ${Math.ceil(this.hintReadyAt - now)} seconds left.`);
      return;
    }
    const left = this.scene.unfound().filter((it) => it.id !== this.selected);
    if (!left.length) return;
    const it = left[Math.floor(Math.random() * left.length)];
    this.hints++;
    this.hintReadyAt = now + HINT_COOLDOWN;
    audio.hint();
    const vp = this.viewport;
    if (!vp.isVisible(it.x, it.y, 60) || vp.s * it.size < 50) {
      vp.animateTo(it.x, it.y, Math.max(vp.s, vp.minScale * 1.6));
    }
    this.scene.ring(it.id);
    setTimeout(() => ui.toast('The magic quill glows: look inside the golden ring!', 2600, this.awayFrom(it.id)), 470);
    this.updateHud();
  }

  finish() {
    this.done = true;
    clearInterval(this.tick);
    const time = this.elapsed();
    const scored = time + this.hints * HINT_PENALTY;
    const [three, two] = this.room.stars;
    const stars = scored <= three ? 3 : scored <= two ? 2 : 1;
    this.onComplete({ time, hints: this.hints, scored, stars });
  }
}
