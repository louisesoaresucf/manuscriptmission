// Builds a room: the 2D scenery (back and front SVG layers) and the hidden
// illustrations, drawn as 3D models when WebGL is available and as flat SVG
// otherwise. Also answers "which item is under this point?".
import { SCENE_W, SCENE_H } from './data/rooms.js';
import { itemById } from './data/items.js';
import { hasWebGL } from './three/relief.js';
import { ReliefLayer } from './three/layer.js';
import { reactionFor } from './three/reactions.js';

const MIN_HIT_PX = 26; // minimum hit radius in screen px (≈52px target)

// The drawing used for the 3D model. Plants are wrapped so they sway from the root.
function modelMarkup(id) {
  const it = itemById[id];
  const art = it.draw();
  return it.category === 'plant' ? `<g data-part="plant" data-pivot="50,92">${art}</g>` : art;
}

export class Scene {
  constructor({ back, front, canvas }, room) {
    this.svg = back;
    this.frontSvg = front;
    this.canvas = canvas;
    this.room = room;
    this.use3D = hasWebGL() && !window.__mmForce2D;
    const { back: backArt, front: frontArt } = room.scene();
    this.items = new Map(room.items.map((p) => [p.id, { ...p, found: false }]));
    const itemMarkup = this.use3D ? '' : room.items.map((p) => this.svgItem(p)).join('');
    back.innerHTML = `
      <g class="world">
        <g class="back">${backArt}</g>
        <g class="items">${itemMarkup}</g>
      </g>`;
    front.innerHTML = `
      <g class="world">
        <g class="front">${frontArt}</g>
        <g class="marks"></g>
        <g class="actors"></g>
      </g>`;
    this.worlds = [back.querySelector('.world'), front.querySelector('.world')];
    this.marks = front.querySelector('.marks');
    this.actors = front.querySelector('.actors');
    canvas.hidden = !this.use3D;
  }

  svgItem(p) {
    return `
      <g class="hid-item" data-id="${p.id}" transform="translate(${p.x} ${p.y}) rotate(${p.rot || 0})">
        <g class="lift">
          <use href="#item-${p.id}" x="${-p.size / 2}" y="${-p.size / 2}" width="${p.size}" height="${p.size}"/>
        </g>
      </g>`;
  }

  // Called once the viewport exists, so the 3D camera can follow it.
  attach(viewport) {
    this.vp = viewport;
    if (!this.use3D) return;
    try {
      this.layer = new ReliefLayer(this.canvas, viewport, { tone: this.room.vignette ? 'night' : 'day' });
      for (const it of this.items.values()) this.layer.add(it, modelMarkup(it.id));
      viewport.onChange = () => this.layer.invalidate();
    } catch (err) {
      // Fall back to flat illustrations if 3D setup fails on this device.
      console.warn('3D unavailable, using flat illustrations', err);
      this.use3D = false;
      this.layer = null;
      this.canvas.hidden = true;
      this.svg.querySelector('.items').innerHTML = [...this.items.values()].map((p) => this.svgItem(p)).join('');
    }
  }

  destroy() {
    this.layer?.destroy();
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
      if (it.found || it.moving) continue;
      const r = Math.max(it.size * 0.45, MIN_HIT_PX / scale);
      const d = Math.hypot(pt.x - it.x, pt.y - it.y);
      if (d <= r && d < bestD) { best = it; bestD = d; }
    }
    return best;
  }

  setSelected(id, on) {
    if (this.layer) { this.layer.select(id, on); return; }
    const el = this.el(id);
    if (!el) return;
    el.classList.toggle('selected', on);
    const lift = el.querySelector('.lift');
    if (on) lift.setAttribute('filter', 'url(#mm-glow)');
    else lift.removeAttribute('filter');
  }

  // The item's own reaction to being picked up. Returns the sound to play.
  react(id) {
    if (this.layer) return this.layer.react(id);
    this.wobble(id);
    return reactionFor(id).sound;
  }

  wobble(id) {
    if (this.layer) {
      const e = this.layer.items.get(id);
      if (e) this.layer.tween(e, 500, (t) => { e.anim.rotation.z = Math.sin(t * Math.PI * 5) * 0.3 * (1 - t); }, () => { e.anim.rotation.z = 0; }, `wobble-${id}`);
      return;
    }
    const el = this.el(id);
    if (!el) return;
    el.classList.remove('wobble');
    void el.getBoundingClientRect();
    el.classList.add('wobble');
  }

  // Where the item is on screen, in page coordinates (for the fly-to-book animation).
  pageRect(id) {
    if (this.layer) {
      const r = this.layer.screenRect(id);
      const box = this.canvas.parentElement.getBoundingClientRect();
      return { left: box.left + r.x, top: box.top + r.y, width: r.w, height: r.h };
    }
    return this.el(id).getBoundingClientRect();
  }

  markFound(id) {
    const it = this.items.get(id);
    it.found = true;
    if (this.layer) this.layer.remove(id);
    const el = this.el(id);
    if (el) el.classList.add('found');
  }

  // Move a hidden item to a new spot (used by the broom, the owl and the witch).
  async moveItem(id, x, y, style) {
    const it = this.items.get(id);
    it.moving = true;
    if (this.layer) {
      await this.layer.moveTo(id, x, y, style, style === 'carry' ? 1700 : style === 'vanish' ? 1300 : 1100);
    } else {
      const el = this.el(id);
      if (el) {
        el.style.transition = 'transform 1s ease-in-out, opacity 0.5s';
        el.setAttribute('transform', `translate(${x} ${y}) rotate(${it.rot || 0})`);
        await new Promise((r) => setTimeout(r, 1000));
      }
    }
    it.x = x;
    it.y = y;
    it.moving = false;
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
