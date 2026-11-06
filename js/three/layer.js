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

// ---------- particle textures, drawn once on small canvases ----------
const textures = new Map();
function particleTexture(type, colour) {
  const key = `${type}|${colour || ''}`;
  if (textures.has(key)) return textures.get(key);
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  const radial = (stops) => {
    const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    stops.forEach(([o, col]) => gr.addColorStop(o, col));
    g.fillStyle = gr;
    g.fillRect(0, 0, 64, 64);
  };
  if (type === 'spark') radial([[0, 'rgba(255,250,215,1)'], [0.35, 'rgba(255,205,70,0.9)'], [1, 'rgba(255,170,40,0)']]);
  else if (type === 'flame') radial([[0, 'rgba(255,245,170,1)'], [0.4, 'rgba(255,140,30,0.9)'], [0.8, 'rgba(190,40,20,0.5)'], [1, 'rgba(150,20,10,0)']]);
  else if (type === 'puff') radial([[0, colour || 'rgba(255,255,255,0.8)'], [1, 'rgba(255,255,255,0)']]);
  else if (type === 'dust') radial([[0, 'rgba(160,130,90,0.7)'], [1, 'rgba(160,130,90,0)']]);
  else if (type === 'drop' || type === 'rain') {
    g.fillStyle = colour || '#7fb3ea';
    g.strokeStyle = '#1f3a8a';
    g.lineWidth = 3;
    g.beginPath();
    if (type === 'rain') { g.ellipse(32, 32, 5, 22, 0, 0, Math.PI * 2); } else {
      g.moveTo(32, 6); g.bezierCurveTo(44, 26, 52, 36, 50, 46); g.bezierCurveTo(48, 58, 16, 58, 14, 46); g.bezierCurveTo(12, 36, 20, 26, 32, 6);
    }
    g.fill(); g.stroke();
    g.fillStyle = 'rgba(255,255,255,0.8)';
    g.beginPath(); g.ellipse(26, 40, 3, 6, 0.3, 0, Math.PI * 2); g.fill();
  } else if (type === 'note') {
    // A quaver drawn as shapes (no font needed): head, stem and flag.
    g.fillStyle = '#e9c45a';
    g.strokeStyle = '#2a1c10';
    g.lineWidth = 3;
    g.beginPath(); g.ellipse(24, 46, 10, 7, -0.4, 0, Math.PI * 2); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(33, 44); g.lineTo(33, 8); g.stroke();
    g.lineWidth = 5; g.strokeStyle = '#2a1c10';
    g.beginPath(); g.moveTo(33, 9); g.bezierCurveTo(44, 14, 50, 22, 44, 32); g.stroke();
    g.lineWidth = 2.5; g.strokeStyle = '#e9c45a';
    g.beginPath(); g.moveTo(33, 9); g.bezierCurveTo(44, 14, 50, 22, 44, 32); g.stroke();
  } else if (type === 'petal' || type === 'leaf') {
    g.fillStyle = colour || (type === 'leaf' ? '#5aa37f' : '#d98aa0');
    g.strokeStyle = '#2a1c10';
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(32, 6); g.bezierCurveTo(52, 20, 52, 44, 32, 58); g.bezierCurveTo(12, 44, 12, 20, 32, 6);
    g.fill(); g.stroke();
    if (type === 'leaf') { g.beginPath(); g.moveTo(32, 10); g.lineTo(32, 54); g.stroke(); }
  } else if (type === 'star') {
    g.fillStyle = colour || '#fff6c0';
    g.beginPath();
    for (let i = 0; i < 8; i++) {
      const r = i % 2 ? 7 : 30, a = (i / 8) * Math.PI * 2 - Math.PI / 2;
      g.lineTo(32 + Math.cos(a) * r, 32 + Math.sin(a) * r);
    }
    g.fill();
  }
  const tex = new (THREE().CanvasTexture)(c);
  textures.set(key, tex);
  return tex;
}
const ADDITIVE = new Set(['spark', 'flame', 'star']);

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
    this.particles = [];
    this.pool = [];
    this.plane = new T.PlaneGeometry(1, 1);
    this.lastFrame = performance.now();
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
    // Effects a reaction can trigger once at a given moment (t from 0 to 1).
    const fired = new Set();
    const fx = {
      at: (t0, key, fn) => { if (!fired.has(key) && fx.t >= t0) { fired.add(key); fn(); } },
      emit: (opts) => this.emit(e, opts),
      t: 0,
    };
    this.tween(e, r.ms, (t) => {
      fx.t = t;
      for (const [name, g] of Object.entries(parts)) {
        g.rotation.copy(saved[name].r); g.scale.copy(saved[name].s); g.position.copy(saved[name].p);
      }
      e.model.rotation.set(0, 0, 0);
      e.model.position.set(0, 0, 0);
      e.model.scale.set(1, 1, 1);
      r.play(t, parts, e.model, e, fx);
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

  // Spawn particles around an item. x, y are in the drawing's own units
  // (0–100, y down), so effects line up with the artwork.
  emit(e, { type = 'spark', x = 50, y = 50, n = 8, speed = 30, angle = 90, spread = 60, life = 1, size = 9, gravity = 0, colour, spin = 0, grow = 1 }) {
    const T = THREE();
    for (let i = 0; i < n; i++) {
      let mesh = this.pool.pop();
      if (!mesh) mesh = new T.Mesh(this.plane, new T.MeshBasicMaterial({ transparent: true, depthWrite: false }));
      const mat = mesh.material;
      mat.map = particleTexture(type, colour);
      mat.blending = ADDITIVE.has(type) ? T.AdditiveBlending : T.NormalBlending;
      mat.opacity = 1;
      mat.needsUpdate = true;
      const a = ((angle + (Math.random() - 0.5) * spread) * Math.PI) / 180;
      const v = speed * (0.6 + Math.random() * 0.7);
      mesh.position.set(x - 50 + (Math.random() - 0.5) * 4, 50 - y + (Math.random() - 0.5) * 4, 70);
      mesh.rotation.set(0, 0, Math.random() * Math.PI * 2);
      mesh.visible = true;
      e.holder.add(mesh);
      this.particles.push({ mesh, holder: e.holder, vx: Math.cos(a) * v, vy: Math.sin(a) * v, age: 0, life: life * (0.7 + Math.random() * 0.6), size: size * (0.7 + Math.random() * 0.6), gravity, spin: spin * (Math.random() - 0.5) * 2, grow, stretch: type === 'rain' });
    }
    this.loop();
  }

  updateParticles(dt) {
    const alive = [];
    for (const p of this.particles) {
      p.age += dt;
      if (p.age >= p.life) {
        p.mesh.visible = false;
        p.holder.remove(p.mesh);
        this.pool.push(p.mesh);
        continue;
      }
      p.vy -= p.gravity * dt;
      p.mesh.position.x += p.vx * dt;
      p.mesh.position.y += p.vy * dt;
      p.mesh.rotation.z += p.spin * dt;
      const k = p.age / p.life;
      const sc = p.size * (1 + (p.grow - 1) * k);
      p.mesh.scale.set(sc, p.stretch ? sc * 1.8 : sc, 1);
      p.mesh.material.opacity = 1 - k * k;
      alive.push(p);
    }
    this.particles = alive;
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
    if (!this.tweens.length && !this.selected && !this.particles.length) this.lastFrame = performance.now();
    this.raf = requestAnimationFrame((now) => this.frame(now));
  }

  frame(now) {
    this.raf = null;
    const dt = Math.min(0.05, (now - this.lastFrame) / 1000);
    this.lastFrame = now;
    if (this.particles.length) this.updateParticles(dt);
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
    if (this.tweens.length || this.selected || this.particles.length) this.loop();
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
