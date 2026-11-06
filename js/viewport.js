// Pinch-zoom and pan for the room scene, built on Pointer Events.
// The <svg> fills its container; a <g> "world" holds the 1600×1000 scene
// and is moved with translate/scale. A pointer that barely moves is a tap.

const TAP_SLOP = 8; // px a finger may wander and still count as a tap
const DOUBLE_TAP_MS = 320;

export class Viewport {
  constructor(svg, world, sceneW, sceneH, { onTap } = {}) {
    this.svg = svg;
    this.world = world;
    this.sw = sceneW;
    this.sh = sceneH;
    this.onTap = onTap || (() => false);
    this.s = 1;
    this.tx = 0;
    this.ty = 0;
    this.pointers = new Map();
    this.gesture = null;
    this.lastEmptyTap = null;
    this.anim = null;

    this.handlers = {
      down: (e) => this.onDown(e),
      move: (e) => this.onMove(e),
      up: (e) => this.onUp(e),
      wheel: (e) => this.onWheel(e),
    };
    svg.addEventListener('pointerdown', this.handlers.down);
    svg.addEventListener('pointermove', this.handlers.move);
    svg.addEventListener('pointerup', this.handlers.up);
    svg.addEventListener('pointercancel', this.handlers.up);
    svg.addEventListener('wheel', this.handlers.wheel, { passive: false });
    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(svg);
    this.resize(true);
  }

  destroy() {
    const svg = this.svg;
    svg.removeEventListener('pointerdown', this.handlers.down);
    svg.removeEventListener('pointermove', this.handlers.move);
    svg.removeEventListener('pointerup', this.handlers.up);
    svg.removeEventListener('pointercancel', this.handlers.up);
    svg.removeEventListener('wheel', this.handlers.wheel);
    this.ro.disconnect();
    cancelAnimationFrame(this.anim);
  }

  get width() { return this.svg.clientWidth || 1; }
  get height() { return this.svg.clientHeight || 1; }
  get minScale() { return Math.max(this.width / this.sw, this.height / this.sh); }
  get maxScale() { return this.minScale * 4; }

  resize(initial = false) {
    if (!this.width || !this.height) return;
    if (initial || !this.ready) {
      this.s = this.minScale;
      this.tx = (this.width - this.sw * this.s) / 2;
      this.ty = (this.height - this.sh * this.s) / 2;
      this.ready = true;
    } else {
      // Keep the same scene point in the middle of the screen.
      const c = this.toScene(this.width / 2, this.height / 2);
      this.s = Math.max(this.s, this.minScale);
      this.tx = this.width / 2 - c.x * this.s;
      this.ty = this.height / 2 - c.y * this.s;
    }
    this.apply();
  }

  clamp() {
    this.s = Math.min(this.maxScale, Math.max(this.minScale, this.s));
    const minX = this.width - this.sw * this.s, minY = this.height - this.sh * this.s;
    this.tx = Math.min(0, Math.max(minX, this.tx));
    this.ty = Math.min(0, Math.max(minY, this.ty));
  }

  apply() {
    this.clamp();
    this.world.setAttribute('transform', `translate(${this.tx.toFixed(2)} ${this.ty.toFixed(2)}) scale(${this.s.toFixed(5)})`);
  }

  // Screen (container-local px) ↔ scene units.
  toScene(px, py) {
    return { x: (px - this.tx) / this.s, y: (py - this.ty) / this.s };
  }
  toScreen(x, y) {
    return { x: x * this.s + this.tx, y: y * this.s + this.ty };
  }

  local(e) {
    const r = this.svg.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  zoomAt(px, py, newScale) {
    const p = this.toScene(px, py);
    this.s = Math.min(this.maxScale, Math.max(this.minScale, newScale));
    this.tx = px - p.x * this.s;
    this.ty = py - p.y * this.s;
    this.apply();
  }

  // Smoothly move (and optionally zoom) so scene point (x,y) is centred.
  animateTo(x, y, scale = this.s, ms = 450) {
    cancelAnimationFrame(this.anim);
    const from = { s: this.s, tx: this.tx, ty: this.ty };
    const s = Math.min(this.maxScale, Math.max(this.minScale, scale));
    const to = { s, tx: this.width / 2 - x * s, ty: this.height / 2 - y * s };
    const t0 = performance.now();
    const step = (now) => {
      const k = Math.min(1, (now - t0) / ms);
      const e = 1 - Math.pow(1 - k, 3);
      this.s = from.s + (to.s - from.s) * e;
      this.tx = from.tx + (to.tx - from.tx) * e;
      this.ty = from.ty + (to.ty - from.ty) * e;
      this.apply();
      if (k < 1) this.anim = requestAnimationFrame(step);
    };
    this.anim = requestAnimationFrame(step);
  }

  isVisible(x, y, margin = 40) {
    const p = this.toScreen(x, y);
    return p.x > margin && p.y > margin && p.x < this.width - margin && p.y < this.height - margin;
  }

  onDown(e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    cancelAnimationFrame(this.anim);
    try { this.svg.setPointerCapture(e.pointerId); } catch { /* synthetic or already-released pointer */ }
    const p = this.local(e);
    this.pointers.set(e.pointerId, p);
    if (this.pointers.size === 1) {
      this.gesture = { type: 'pan', start: p, last: p, moved: false, multi: false };
    } else if (this.pointers.size === 2) {
      const [a, b] = [...this.pointers.values()];
      this.gesture = {
        type: 'pinch',
        dist: Math.hypot(a.x - b.x, a.y - b.y) || 1,
        mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
        s: this.s, tx: this.tx, ty: this.ty,
        moved: true, multi: true,
      };
    }
  }

  onMove(e) {
    if (!this.pointers.has(e.pointerId)) return;
    const p = this.local(e);
    this.pointers.set(e.pointerId, p);
    const g = this.gesture;
    if (!g) return;
    if (g.type === 'pan' && this.pointers.size === 1) {
      if (!g.moved && Math.hypot(p.x - g.start.x, p.y - g.start.y) > TAP_SLOP) g.moved = true;
      if (g.moved) {
        this.tx += p.x - g.last.x;
        this.ty += p.y - g.last.y;
        this.apply();
      }
      g.last = p;
    } else if (g.type === 'pinch' && this.pointers.size >= 2) {
      const [a, b] = [...this.pointers.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y) || 1;
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      const scenePt = { x: (g.mid.x - g.tx) / g.s, y: (g.mid.y - g.ty) / g.s };
      this.s = Math.min(this.maxScale, Math.max(this.minScale, g.s * (dist / g.dist)));
      this.tx = mid.x - scenePt.x * this.s;
      this.ty = mid.y - scenePt.y * this.s;
      this.apply();
    }
    e.preventDefault();
  }

  onUp(e) {
    if (!this.pointers.has(e.pointerId)) return;
    const p = this.local(e);
    this.pointers.delete(e.pointerId);
    const g = this.gesture;
    if (this.pointers.size === 1) {
      // Lifting one finger of a pinch: carry on panning with the other, never tap.
      const rest = [...this.pointers.values()][0];
      this.gesture = { type: 'pan', start: rest, last: rest, moved: true, multi: true };
      return;
    }
    if (this.pointers.size === 0) {
      this.gesture = null;
      if (g && !g.moved && !g.multi) this.tap(p);
    }
  }

  tap(p) {
    const scenePt = this.toScene(p.x, p.y);
    const consumed = this.onTap(scenePt, p);
    if (consumed) { this.lastEmptyTap = null; return; }
    // Double-tap on empty space toggles between overview and close-up.
    const now = performance.now();
    const last = this.lastEmptyTap;
    if (last && now - last.t < DOUBLE_TAP_MS && Math.hypot(p.x - last.x, p.y - last.y) < 30) {
      this.lastEmptyTap = null;
      const target = this.s > this.minScale * 1.4 ? this.minScale : this.minScale * 2.5;
      this.animateTo(scenePt.x, scenePt.y, target, 300);
    } else {
      this.lastEmptyTap = { t: now, x: p.x, y: p.y };
    }
  }

  onWheel(e) {
    e.preventDefault();
    const p = this.local(e);
    this.zoomAt(p.x, p.y, this.s * Math.exp(-e.deltaY * 0.0015));
  }
}
