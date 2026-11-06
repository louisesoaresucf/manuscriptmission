// The 3D layer: one WebGL canvas drawn between the room's back scenery and
// its front scenery, kept exactly in step with the 2D pan and zoom.
import { buildRelief } from './relief.js';
import { REACTIONS, reactionFor } from './reactions.js';

const THREE = () => window.THREE;

function radialTexture(inner, outer) {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, inner);
  grad.addColorStop(1, outer);
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  const tex = new (THREE().CanvasTexture)(c);
  return tex;
}

const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export class ReliefLayer {
  constructor(canvas, viewport, { tone = 'day' } = {}) {
    const T = THREE();
    this.canvas = canvas;
    this.vp = viewport;
    // On sharp phone screens, 1.5× resolution looks the same and draws far faster.
    const dpr = window.devicePixelRatio || 1;
    this.renderer = new T.WebGLRenderer({ canvas, antialias: dpr < 2, alpha: true, powerPreference: 'low-power' });
    this.renderer.setPixelRatio(Math.min(1.5, dpr));
    this.renderer.setClearColor(0x000000, 0);
    this.scene = new T.Scene();
    this.camera = new T.OrthographicCamera(0, 1, 0, -1, -2000, 2000);
    this.camera.position.set(0, 0, 1000);

    const night = tone === 'night';
    this.scene.add(new T.AmbientLight(night ? '#ffe0b0' : '#fff6e0', night ? 0.5 : 0.56));
    const key = new T.DirectionalLight(night ? '#ffc070' : '#fff2d0', night ? 0.55 : 0.5);
    key.position.set(-0.7, 0.9, 1.1);
    this.scene.add(key);
    const fill = new T.DirectionalLight('#c8d8ff', 0.18);
    fill.position.set(0.9, -0.4, 0.7);
    this.scene.add(fill);

    this.glowTex = radialTexture('rgba(255,226,120,0.7)', 'rgba(255,226,120,0)');
    this.shadowTex = radialTexture('rgba(20,10,0,0.55)', 'rgba(20,10,0,0)');
    this.items = new Map();
    this.tweens = [];
    this.selected = null;
    this.raf = null;
    this.needsRender = true;

    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(canvas.parentElement);
    this.resize();
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    this.ro.disconnect();
    this.renderer.dispose();
  }

  resize() {
    const p = this.canvas.parentElement;
    this.w = p.clientWidth || 1;
    this.h = p.clientHeight || 1;
    this.renderer.setSize(this.w, this.h, false);
    this.invalidate();
  }

  // ---------- items ----------
  add(item, markup) {
    const T = THREE();
    const holder = new T.Group();
    const tilt = new T.Group();
    const anim = new T.Group();
    const model = buildRelief(item.id, markup);
    anim.add(model);
    tilt.add(anim);

    const shadow = new T.Mesh(new T.PlaneGeometry(1, 1), new T.MeshBasicMaterial({ map: this.shadowTex, transparent: true, depthWrite: false }));
    shadow.scale.set(108, 108, 1);
    shadow.position.set(7, -9, -30);
    const glow = new T.Mesh(new T.PlaneGeometry(1, 1), new T.MeshBasicMaterial({ map: this.glowTex, transparent: true, depthWrite: false, blending: T.AdditiveBlending }));
    glow.scale.set(135, 135, 1);
    glow.position.z = -25;
    glow.visible = false;
    holder.add(shadow, glow, tilt);
    this.scene.add(holder);
    const entry = { item, holder, tilt, anim, model, glow, shadow, lift: 0, base: { x: item.x, y: item.y } };
    this.items.set(item.id, entry);
    this.place(entry);
    this.invalidate();
  }

  place(e) {
    const s = e.item.size / 100 * (1 + 0.18 * e.lift);
    e.holder.position.set(e.base.x, -e.base.y, 40 * e.lift);
    e.holder.rotation.z = -((e.item.rot || 0) * Math.PI) / 180;
    e.holder.scale.set(s, s, s);
  }

  remove(id) {
    const e = this.items.get(id);
    if (!e) return;
    this.scene.remove(e.holder);
    this.items.delete(id);
    if (this.selected === id) this.selected = null;
    this.invalidate();
  }

  select(id, on) {
    const e = this.items.get(id);
    if (!e) return;
    if (on) this.selected = id;
    else if (this.selected === id) this.selected = null;
    e.glow.visible = on;
    this.tween(e, 220, (t) => { e.lift = on ? easeOut(t) : 1 - easeOut(t); this.place(e); }, () => {
      if (!on) { e.anim.rotation.set(0, 0, 0); }
    });
  }

  // Screen-space rectangle of an item (for the fly-to-book animation).
  screenRect(id) {
    const e = this.items.get(id);
    if (!e) return null;
    const p = this.vp.toScreen(e.base.x, e.base.y);
    const size = e.item.size * this.vp.s * (1 + 0.18 * e.lift);
    return { x: p.x - size / 2, y: p.y - size / 2, w: size, h: size };
  }

  // Play the item's tap reaction: wings flap, flames burn, plants wiggle…
  react(id) {
    const e = this.items.get(id);
    if (!e) return null;
    const r = reactionFor(e.item.id);
    const parts = e.model.userData.parts;
    const saved = {};
    for (const [name, g] of Object.entries(parts)) saved[name] = { r: g.rotation.clone(), s: g.scale.clone(), p: g.position.clone() };
    this.tween(e, r.ms, (t) => {
      for (const [name, g] of Object.entries(parts)) {
        g.rotation.copy(saved[name].r); g.scale.copy(saved[name].s); g.position.copy(saved[name].p);
      }
      e.model.rotation.set(0, 0, 0);
      e.model.position.set(0, 0, 0);
      e.model.scale.set(1, 1, 1);
      r.play(t, parts, e.model, e);
    }, () => {
      for (const [name, g] of Object.entries(parts)) {
        g.rotation.copy(saved[name].r); g.scale.copy(saved[name].s); g.position.copy(saved[name].p);
      }
      e.model.rotation.set(0, 0, 0);
      e.model.position.set(0, 0, 0);
      e.model.scale.set(1, 1, 1);
      e.glow.visible = this.selected === id;
    }, `react-${id}`);
    return r.sound;
  }

  // Move an item to a new spot. style: 'sweep' (slides and tumbles along the
  // floor), 'carry' (lifted in an arc), or 'vanish' (disappears, reappears).
  moveTo(id, x, y, style = 'sweep', ms = 1200) {
    const e = this.items.get(id);
    if (!e) return Promise.resolve();
    const from = { ...e.base };
    return new Promise((resolve) => {
      this.tween(e, ms, (t) => {
        if (style === 'vanish') {
          const k = t < 0.5 ? 1 - easeInOut(t * 2) : easeInOut((t - 0.5) * 2);
          if (t >= 0.5) { e.base.x = x; e.base.y = y; }
          e.anim.scale.setScalar(Math.max(0.001, k));
          e.anim.rotation.y = t * Math.PI * 4;
        } else {
          const k = easeInOut(t);
          e.base.x = from.x + (x - from.x) * k;
          e.base.y = from.y + (y - from.y) * k - (style === 'carry' ? Math.sin(Math.PI * k) * 260 : Math.sin(Math.PI * k) * 30);
          e.anim.rotation.z = style === 'sweep' ? Math.sin(t * Math.PI * 3) * 0.6 : Math.sin(t * Math.PI * 2) * 0.15;
        }
        this.place(e);
      }, () => {
        e.base.x = x; e.base.y = y;
        e.anim.scale.setScalar(1);
        e.anim.rotation.set(0, 0, 0);
        this.place(e);
        resolve();
      }, `move-${id}`);
    });
  }

  // ---------- animation loop ----------
  tween(e, ms, step, done, key) {
    if (key) this.tweens = this.tweens.filter((tw) => tw.key !== key || (tw.done?.(), false));
    this.tweens.push({ e, ms, step, done, key, t0: performance.now() });
    this.loop();
  }

  invalidate() {
    this.needsRender = true;
    this.loop();
  }

  loop() {
    if (this.raf) return;
    this.raf = requestAnimationFrame((now) => this.frame(now));
  }

  frame(now) {
    this.raf = null;
    const active = [];
    for (const tw of this.tweens) {
      const t = Math.min(1, (now - tw.t0) / tw.ms);
      tw.step(t);
      if (t < 1) active.push(tw);
      else tw.done?.();
    }
    this.tweens = active;
    // A selected item turns gently to show it is a real object.
    if (this.selected) {
      const e = this.items.get(this.selected);
      if (e && !active.some((tw) => tw.e === e && tw.key?.startsWith('react'))) {
        e.anim.rotation.y = Math.sin(now / 600) * 0.7;
      }
    }
    this.render();
    if (this.tweens.length || this.selected) this.loop();
  }

  render() {
    const vp = this.vp;
    const x0 = -vp.tx / vp.s, x1 = (vp.width - vp.tx) / vp.s;
    const y0 = -vp.ty / vp.s, y1 = (vp.height - vp.ty) / vp.s;
    const cam = this.camera;
    cam.left = x0; cam.right = x1; cam.top = -y0; cam.bottom = -y1;
    cam.updateProjectionMatrix();
    // Parallax: each object leans a little depending on where it sits on
    // screen, so its thickness shows as you pan around the room.
    for (const e of this.items.values()) {
      const sx = (e.base.x - x0) / (x1 - x0) - 0.5;
      const sy = (e.base.y - y0) / (y1 - y0) - 0.5;
      e.tilt.rotation.y = sx * 0.55;
      e.tilt.rotation.x = sy * 0.4;
    }
    this.renderer.render(this.scene, cam);
    this.needsRender = false;
  }
}

export { REACTIONS };
