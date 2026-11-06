// Builds a room's SVG scene and answers "which item is under this point?".
import { SCENE_W, SCENE_H } from './data/rooms.js';

const MIN_HIT_PX = 26; // minimum hit radius in screen px (≈52px target)

export class Scene {
  constructor(svg, room) {
    this.svg = svg;
    this.room = room;
    const { back, front } = room.scene();
    this.items = new Map(room.items.map((p) => [p.id, { ...p, found: false }]));
    const itemMarkup = room.items.map((p) => `
      <g class="hid-item" data-id="${p.id}" transform="translate(${p.x} ${p.y}) rotate(${p.rot || 0})">
        <g class="lift">
          <use href="#item-${p.id}" x="${-p.size / 2}" y="${-p.size / 2}" width="${p.size}" height="${p.size}"/>
        </g>
      </g>`).join('');
    svg.innerHTML = `
      <g class="world">
        <g class="back">${back}</g>
        <g class="items">${itemMarkup}</g>
        <g class="front" pointer-events="none">${front}</g>
        <g class="marks" pointer-events="none"></g>
      </g>`;
    this.world = svg.querySelector('.world');
    this.marks = svg.querySelector('.marks');
  }

  get width() { return SCENE_W; }
  get height() { return SCENE_H; }

  el(id) {
    return this.svg.querySelector(`.hid-item[data-id="${id}"]`);
  }

  // Nearest unfound item whose hit circle contains the scene point.
  hitTest(pt, scale) {
    let best = null, bestD = Infinity;
    for (const it of this.items.values()) {
      if (it.found) continue;
      const r = Math.max(it.size * 0.45, MIN_HIT_PX / scale);
      const d = Math.hypot(pt.x - it.x, pt.y - it.y);
      if (d <= r && d < bestD) { best = it; bestD = d; }
    }
    return best;
  }

  setSelected(id, on) {
    const el = this.el(id);
    if (!el) return;
    el.classList.toggle('selected', on);
    const lift = el.querySelector('.lift');
    if (on) lift.setAttribute('filter', 'url(#mm-glow)');
    else lift.removeAttribute('filter');
  }

  wobble(id) {
    const el = this.el(id);
    if (!el) return;
    el.classList.remove('wobble');
    void el.getBoundingClientRect();
    el.classList.add('wobble');
  }

  markFound(id) {
    const it = this.items.get(id);
    it.found = true;
    const el = this.el(id);
    if (el) el.classList.add('found');
  }

  // Gold pulsing ring around an item (hint).
  ring(id, ms = 3200) {
    const it = this.items.get(id);
    this.marks.innerHTML = `
      <circle class="hint-ring" cx="${it.x}" cy="${it.y}" r="${it.size * 0.62}"/>
      <circle class="hint-ring two" cx="${it.x}" cy="${it.y}" r="${it.size * 0.62}"/>`;
    clearTimeout(this.ringTimer);
    this.ringTimer = setTimeout(() => { this.marks.innerHTML = ''; }, ms);
  }

  clearRing() {
    clearTimeout(this.ringTimer);
    this.marks.innerHTML = '';
  }

  unfound() {
    return [...this.items.values()].filter((it) => !it.found);
  }
}
