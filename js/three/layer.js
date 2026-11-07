// The 3D layer: one WebGL canvas drawn between the room's back scenery and
// its front scenery, kept exactly in step with the 2D pan and zoom.
import { buildRelief, resetModels } from './relief.js';
import { REACTIONS, reactionFor } from './reactions.js';
import { restingArt } from '../art/sprite.js';

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
  tex.encoding = THREE().sRGBEncoding;
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
  tex.encoding = THREE().sRGBEncoding;
  textures.set(key, tex);
  return tex;
}

// A halo that follows the item's own outline: a thin pale rim and a soft
// dark shadow, so every object reads as a loose thing resting in front of
// the scenery, on a dark window as well as a pale wall. The plane covers
// 140 scene units round the 100-unit drawing.
const HALO_N = 256, HALO_SPAN = 140;
async function haloTexture(markup, rim) {
  const flat = restingArt(markup).replace(/url\([^)]*\)/g, '#000');
  const holder = document.createElement('div');
  holder.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="${HALO_N}" height="${HALO_N}" viewBox="-20 -20 140 140">${flat}</svg>`;
  const xml = new XMLSerializer().serializeToString(holder.firstElementChild);
  const url = URL.createObjectURL(new Blob([xml], { type: 'image/svg+xml' }));
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const sil = document.createElement('canvas');
    sil.width = sil.height = HALO_N;
    const sg = sil.getContext('2d');
    sg.drawImage(img, 0, 0, HALO_N, HALO_N);
    sg.globalCompositeOperation = 'source-in';
    const tinted = (colour) => {
      const c = document.createElement('canvas');
      c.width = c.height = HALO_N;
      const g = c.getContext('2d');
      g.drawImage(sil, 0, 0);
      g.globalCompositeOperation = 'source-in';
      g.fillStyle = colour;
      g.fillRect(0, 0, HALO_N, HALO_N);
      return c;
    };
    const dark = tinted('#140a02'), pale = tinted(rim);
    const out = document.createElement('canvas');
    out.width = out.height = HALO_N;
    const g = out.getContext('2d');
    // Soft shadow: the silhouette smeared in rings (works without canvas filters).
    for (const [r, a] of [[11, 0.05], [8, 0.07], [5.5, 0.1], [3.5, 0.14]]) {
      g.globalAlpha = a;
      for (let i = 0; i < 12; i++) {
        const ang = (i / 12) * Math.PI * 2;
        g.drawImage(dark, Math.cos(ang) * r + 1.5, Math.sin(ang) * r + 2.5);
      }
    }
    // Thin pale rim hugging the outline.
    g.globalAlpha = 0.9;
    for (let i = 0; i < 12; i++) {
      const ang = (i / 12) * Math.PI * 2;
      g.drawImage(pale, Math.cos(ang) * 2.1, Math.sin(ang) * 2.1);
    }
    const tex = new (THREE().CanvasTexture)(out);
    tex.encoding = THREE().sRGBEncoding;
    return tex;
  } finally {
    URL.revokeObjectURL(url);
  }
}

const ADDITIVE = new Set(['spark', 'flame', 'star']);

const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export class ReliefLayer {
  constructor(canvas, viewport, { tone = 'day' } = {}) {
    const T = THREE();
    resetModels();
    this.canvas = canvas;
    this.vp = viewport;
    // On sharp phone screens, 1.5× resolution looks the same and draws far faster.
    const dpr = window.devicePixelRatio || 1;
    this.renderer = new T.WebGLRenderer({ canvas, antialias: dpr < 2, alpha: true, powerPreference: 'low-power' });
    this.fullRatio = Math.min(1.5, dpr);
    this.renderer.setPixelRatio(this.fullRatio);
    this.renderer.setClearColor(0x000000, 0);
    // Filmic colour handling for natural highlights and colours.
    this.renderer.outputEncoding = T.sRGBEncoding;
    this.renderer.toneMapping = T.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.84;
    this.scene = new T.Scene();
    this.camera = new T.OrthographicCamera(0, 1, 0, -1, -2000, 2000);
    this.camera.position.set(0, 0, 1000);

    const night = tone === 'night';
    this.rim = night ? '#ffe3ae' : '#fff8e6';
    // A soft lighting environment for reflections: warm light from above
    // and the windows, dark wood and stone around.
    this.scene.environment = this.makeEnvironment(night);
    this.scene.add(new T.HemisphereLight(night ? '#ffd9a8' : '#fff4dc', night ? '#2a1a10' : '#4a3828', night ? 0.62 : 0.55));
    const key = new T.DirectionalLight(night ? '#ffc888' : '#fff2d0', night ? 1.12 : 1.0);
    key.position.set(-0.7, 0.9, 1.1);
    this.scene.add(key);
    const fill = new T.DirectionalLight('#c8d8ff', 0.3);
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

  makeEnvironment(night) {
    const T = THREE();
    const env = new T.Scene();
    env.background = new T.Color(night ? '#1a1418' : '#4a4038');
    const panel = (w, h, colour, x, y, z) => {
      const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ color: colour, side: T.DoubleSide }));
      m.position.set(x, y, z);
      m.lookAt(0, 0, 0);
      env.add(m);
    };
    panel(6, 3, night ? '#ffd9a0' : '#ffffff', -3, 5, 4); // light from above-left
    panel(2, 4, night ? '#ff9a40' : '#cfe4ff', 6, 1, 2); // a window or torch
    panel(8, 2, '#2a1a10', 0, -5, 3); // dark floor
    panel(3, 3, night ? '#7a3a10' : '#e8c58a', -6, 0, -2); // warm bounce
    const pmrem = new T.PMREMGenerator(this.renderer);
    const tex = pmrem.fromScene(env, 0.04).texture;
    pmrem.dispose();
    return tex;
  }

  destroy() {
    clearTimeout(this.sharpen);
    cancelAnimationFrame(this.raf);
    this.ro.disconnect();
    this.renderer.dispose();
    this.renderer.forceContextLoss(); // free the GPU context for the next room
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
    const halo = new T.Mesh(new T.PlaneGeometry(1, 1), new T.MeshBasicMaterial({ transparent: true, depthWrite: false, opacity: 0 }));
    halo.scale.set(HALO_SPAN, HALO_SPAN, 1);
    halo.position.z = -20;
    holder.add(shadow, glow, halo, tilt);
    this.scene.add(holder);
    const entry = { item, holder, tilt, anim, model, glow, shadow, halo, lift: 0, base: { x: item.x, y: item.y } };
    haloTexture(markup, this.rim).then((tex) => {
      if (!this.items.has(item.id)) return;
      halo.material.map = tex;
      halo.material.opacity = 1;
      halo.material.needsUpdate = true;
      this.invalidate();
    }).catch(() => {});
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
    e.halo.visible = !on;
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

  // While the player pans or zooms, draw at a lower resolution so motion
  // stays smooth; once they stop, redraw at full sharpness.
  moving() {
    if (!this.lowRes) {
      this.lowRes = true;
      this.renderer.setPixelRatio(Math.min(0.5, this.fullRatio));
      this.renderer.setSize(this.w, this.h, false);
    }
    clearTimeout(this.sharpen);
    this.sharpen = setTimeout(() => {
      this.lowRes = false;
      this.renderer.setPixelRatio(this.fullRatio);
      this.renderer.setSize(this.w, this.h, false);
      this.invalidate();
    }, 180);
    this.invalidate();
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
