// What each illustration does when tapped. `play(t, parts, model, entry, fx)`
// runs every frame with t from 0 to 1.
//   parts  – the drawing's <g data-part> pieces. Inside a part, units are the
//            drawing's own (0–100, y down): positive rotation.z turns
//            clockwise on screen and positive position.y moves down.
//   model  – the whole model (y up): rotation.y turns it round in 3D.
//   fx.at(t0, key, fn) runs fn once when t passes t0; fx.emit({...}) spawns
//            particles (sparks, flames, drops, notes, petals, leaves, dust…)
//            at drawing coordinates.

const PI = Math.PI;
const clamp = (v) => Math.max(0, Math.min(1, v));
const seg = (t, a, b) => clamp((t - a) / (b - a)); // 0→1 across [a, b]
const ease = (s) => (s < 0.5 ? 2 * s * s : 1 - Math.pow(-2 * s + 2, 2) / 2);
const bell = (t, a, b) => Math.sin(PI * seg(t, a, b)); // 0→1→0 across [a, b]
const fade = (t) => 1 - t;
const osc = (t, n, phase = 0) => Math.sin(t * PI * 2 * n + phase);

// A full turn in 3D, easing in and out, so the model shows its depth.
const turn = (m, t, a = 0, b = 1) => { m.rotation.y = ease(seg(t, a, b)) * PI * 2; };
const flap = (g, t, amp = 1, beats = 4) => {
  if (!g) return;
  g.rotation.y = osc(t, beats) * amp * (0.4 + 0.6 * fade(t));
  g.rotation.z = osc(t, beats) * 0.14;
};
const flicker = (g, t, amp) => {
  if (!g) return;
  g.scale.y = 1 + amp * Math.abs(Math.sin(t * PI * 9));
  g.scale.x = 1 - amp * 0.25 * Math.sin(t * PI * 13);
};
const show = (g, s) => { if (g) g.scale.setScalar(Math.max(0.0001, s)); };
// Emit `n` particles at evenly spaced moments between a and b.
const stream = (fx, a, b, count, key, opts) => {
  for (let i = 0; i < count; i++) fx.at(a + ((b - a) * i) / Math.max(1, count - 1), `${key}${i}`, () => fx.emit(opts(i)));
};

// Flowers close to a bud, then burst open a little larger and settle,
// scattering petals. Each bloom starts a moment after the last.
function bloom(petal) {
  return {
    ms: 1900,
    sound: 'bloom',
    play: (t, p, m, e, fx) => {
      if (p.plant) p.plant.rotation.z = osc(t, 1.5) * 0.12 * fade(t);
      const blooms = Object.keys(p).filter((k) => k.startsWith('bloom')).sort();
      blooms.forEach((k, i) => {
        const u = t - i * 0.05;
        const s = u < 0.25 ? 1 - 0.65 * ease(seg(u, 0, 0.25))
          : u < 0.55 ? 0.35 + 0.95 * ease(seg(u, 0.25, 0.55))
            : 1.3 - 0.3 * ease(seg(u, 0.55, 0.85));
        p[k].scale.setScalar(s);
        p[k].rotation.z = (1 - Math.min(1, s)) * 0.8;
        const [x, y] = p[k].userData.pivot;
        fx.at(0.4 + i * 0.05, `petal${k}`, () => fx.emit({ type: 'petal', colour: petal, x, y, n: 3, speed: 22, spread: 140, gravity: 22, spin: 4, life: 1.3, size: 6 }));
      });
    },
  };
}

const R = {
  // ---------- creatures ----------
  dragon: {
    ms: 2100, sound: 'dragonfire',
    play: (t, p, m, e, fx) => {
      // rears back, then lunges and breathes fire
      if (p.head) p.head.rotation.z = -0.38 * bell(t, 0, 0.32) + 0.14 * bell(t, 0.3, 0.9);
      m.rotation.z = 0.08 * bell(t, 0, 0.32);
      const fire = t > 0.3 && t < 0.88 ? Math.min(1, seg(t, 0.3, 0.4)) * (1 - seg(t, 0.8, 0.88)) : 0;
      if (p.fire) { show(p.fire, fire * (1 + 0.15 * Math.sin(t * 80))); p.fire.scale.y *= 1 + 0.12 * Math.sin(t * 60); }
      stream(fx, 0.36, 0.8, 8, 'flame', () => ({ type: 'flame', x: 112, y: 22, n: 3, speed: 70, angle: -4, spread: 26, life: 0.55, size: 11, grow: 2.2 }));
      flap(p.wing, t, 0.8, 3); flap(p.wing2, t, 0.6, 3);
      if (p.tail) p.tail.rotation.z = osc(t, 2) * 0.2 * fade(t);
    },
  },
  unicorn: {
    ms: 1900, sound: 'neigh',
    play: (t, p, m, e, fx) => {
      // prances: three little hops, front legs kicking in turn
      m.position.y = 11 * Math.abs(Math.sin(t * PI * 3));
      m.position.x = -7 * Math.sin(t * PI);
      m.rotation.z = 0.14 * Math.sin(t * PI * 3);
      if (p.legF) p.legF.rotation.z = 0.65 * Math.abs(Math.sin(t * PI * 6));
      if (p.legF2) p.legF2.rotation.z = 0.65 * Math.abs(Math.sin(t * PI * 6 + PI / 2));
      if (p.tail) p.tail.rotation.z = osc(t, 3) * 0.45;
      [1 / 3, 2 / 3, 0.99].forEach((tt, i) => fx.at(tt, `dust${i}`, () => fx.emit({ type: 'dust', x: 66, y: 90, n: 4, speed: 18, spread: 120, life: 0.6, size: 9 })));
    },
  },
  siren: {
    ms: 2000, sound: null, // she sings silently: the notes say it all
    play: (t, p, m, e, fx) => {
      show(p.mouth, t > 0.08 && t < 0.92 ? 0.8 + 0.45 * Math.abs(Math.sin(t * PI * 9)) : 0);
      if (p.hair) p.hair.rotation.z = osc(t, 2) * 0.07;
      if (p.tail) p.tail.rotation.z = osc(t, 1.5) * 0.12;
      if (p.arm) p.arm.rotation.z = -0.18 * bell(t, 0.1, 0.9);
      stream(fx, 0.12, 0.75, 5, 'note', (i) => ({ type: 'note', x: 46, y: 22, n: 1, speed: 24, angle: 60 + i * 8, spread: 20, gravity: -6, spin: 0.8, life: 1.6, size: 28 }));
    },
  },
  griffin: {
    ms: 1700, sound: 'screech',
    play: (t, p, m, e, fx) => {
      flap(p.wing, t, 1.2, 4);
      m.position.y = 15 * bell(t, 0.08, 0.92);
      if (p.tail) p.tail.rotation.z = osc(t, 3) * 0.4 * fade(t);
      fx.at(0.45, 'feathers', () => fx.emit({ type: 'petal', colour: '#4a6bc4', x: 70, y: 22, n: 3, speed: 18, spread: 120, gravity: 18, spin: 3, life: 1.2, size: 6 }));
    },
  },
  pelican: {
    ms: 1600, sound: 'chirp',
    play: (t, p, m) => {
      flap(p.wingL, t, 1, 4); flap(p.wingR, t, -1, 4);
      for (const [k, ph] of [['chickL', 0], ['chickR', PI / 2]]) {
        if (!p[k]) continue;
        p[k].scale.y = 1 + 0.3 * Math.abs(Math.sin(t * PI * 4 + ph));
        p[k].rotation.z = 0.15 * Math.sin(t * PI * 4 + ph);
      }
      m.position.y = 3 * bell(t, 0, 1);
    },
  },
  phoenix: {
    ms: 1900, sound: 'fire',
    play: (t, p, m, e, fx) => {
      flap(p.wingL, t, 1, 4); flap(p.wingR, t, -1, 4);
      flicker(p.flame, t, 0.8 * bell(t, 0, 1) + 0.2);
      m.position.y = 18 * bell(t, 0.12, 1);
      stream(fx, 0.15, 0.7, 4, 'spark', () => ({ type: 'spark', x: 50, y: 88, n: 6, speed: 40, angle: 90, spread: 80, life: 0.9, size: 7 }));
    },
  },
  basilisk: {
    ms: 1600, sound: 'crow',
    play: (t, p, m, e, fx) => {
      m.scale.y = 1 + 0.08 * bell(t, 0.05, 0.5); // puffs up
      if (p.head) { p.head.rotation.z = -0.42 * bell(t, 0.1, 0.65); p.head.scale.setScalar(1 + 0.15 * bell(t, 0.1, 0.65)); }
      if (p.tail) p.tail.rotation.z = osc(t, 2) * 0.35 * fade(t);
      fx.at(0.45, 'glare', () => fx.emit({ type: 'star', colour: '#ff5a3a', x: 72.5, y: 25, n: 5, speed: 20, spread: 360, life: 0.6, size: 8 }));
    },
  },
  salamander: {
    ms: 1600, sound: 'fire',
    play: (t, p, m, e, fx) => {
      for (const [k, s] of [['legA', 1], ['legB', -1], ['legA2', 1], ['legB2', -1]]) if (p[k]) p[k].rotation.z = s * 0.5 * Math.sin(t * PI * 10);
      if (p.tail) p.tail.rotation.z = osc(t, 2.5) * 0.35;
      if (p.flame) { p.flame.scale.y = 1 + 0.9 * bell(t, 0, 0.6) - 0.3 * seg(t, 0.6, 1) + 0.1 * Math.sin(t * 50); }
      stream(fx, 0.1, 0.5, 4, 'flame', () => ({ type: 'flame', x: 48, y: 82, n: 2, speed: 30, angle: 90, spread: 50, life: 0.6, size: 8, grow: 1.6 }));
    },
  },
  manticore: {
    ms: 1700, sound: 'roar',
    play: (t, p) => {
      if (p.head) {
        p.head.position.x -= 6 * bell(t, 0.08, 0.6);
        p.head.rotation.z = osc(t, 5) * 0.12 * bell(t, 0.08, 0.6);
        p.head.scale.setScalar(1 + 0.16 * bell(t, 0.08, 0.6));
      }
      if (p.tail) p.tail.rotation.z = -0.55 * bell(t, 0.5, 0.78) + 0.12 * bell(t, 0.2, 0.45);
    },
  },
  caladrius: {
    ms: 1800, sound: 'chirp',
    play: (t, p, m, e, fx) => {
      if (p.wing) p.wing.rotation.z = -0.6 * bell(t, 0.08, 0.85);
      if (p.head) { p.head.scale.x = 1 - 0.45 * bell(t, 0.2, 0.75); p.head.rotation.z = 0.12 * bell(t, 0.2, 0.75); }
      e.glow.visible = t > 0.15 && t < 0.9;
      stream(fx, 0.25, 0.7, 3, 'heal', () => ({ type: 'star', x: 52, y: 46, n: 3, speed: 30, spread: 360, life: 0.9, size: 7 }));
    },
  },
  yale: {
    ms: 1800, sound: 'rumble',
    play: (t, p, m, e, fx) => {
      if (p.hornL) p.hornL.rotation.z = 0.7 * Math.sin(t * PI * 2);
      if (p.hornR) p.hornR.rotation.z = -0.7 * Math.sin(t * PI * 2);
      m.rotation.z = 0.07 * Math.sin(t * PI * 8) * seg(t, 0.6, 0.65) * fade(t);
      m.position.y = 4 * Math.abs(Math.sin(t * PI * 6)) * seg(t, 0.6, 0.65);
      [0.72, 0.85].forEach((tt, i) => fx.at(tt, `paw${i}`, () => fx.emit({ type: 'dust', x: 42, y: 90, n: 4, speed: 18, spread: 120, life: 0.6, size: 8 })));
    },
  },
  amphisbaena: {
    ms: 1700, sound: 'hiss',
    play: (t, p, m) => {
      if (p.headL) { p.headL.position.x -= 7 * bell(t, 0.08, 0.42); p.headL.rotation.z = -0.3 * bell(t, 0.08, 0.42); }
      if (p.headR) { p.headR.position.x += 7 * bell(t, 0.48, 0.82); p.headR.rotation.z = 0.3 * bell(t, 0.48, 0.82); }
      m.scale.x = 1 - 0.08 * Math.sin(t * PI * 4) * fade(t);
      flap(p.wingL, t, 0.7, 3); flap(p.wingR, t, -0.7, 3);
    },
  },

  // ---------- elements ----------
  'candle-flame': {
    ms: 1600, sound: 'fire',
    play: (t, p, m, e, fx) => {
      if (p.flame) {
        p.flame.scale.y = 1 + 0.6 * bell(t, 0, 0.8) * (1 + 0.2 * Math.sin(t * 60));
        p.flame.scale.x = 1 - 0.12 * Math.sin(t * 45);
      }
      stream(fx, 0.15, 0.65, 4, 'spark', () => ({ type: 'spark', x: 50, y: 8, n: 3, speed: 30, angle: 90, spread: 40, life: 0.8, size: 6 }));
    },
  },
  'water-droplet': {
    ms: 1800, sound: 'splash',
    play: (t, p, m, e, fx) => {
      // falls, splashes, then re-forms where it was
      const fall = seg(t, 0, 0.3);
      m.position.y = t < 0.5 ? -20 * fall * fall : -20 * (1 - ease(seg(t, 0.5, 0.9)));
      m.scale.y = 1 - 0.45 * bell(t, 0.3, 0.5);
      m.scale.x = 1 + 0.35 * bell(t, 0.3, 0.5);
      if (t > 0.5) m.scale.setScalar(0.6 + 0.4 * ease(seg(t, 0.5, 0.9)));
      fx.at(0.31, 'splash', () => fx.emit({ type: 'drop', x: 50, y: 100, n: 10, speed: 55, angle: 90, spread: 140, gravity: 130, life: 0.8, size: 6 }));
    },
  },
  wave: {
    ms: 1900, sound: 'splash',
    play: (t, p, m, e, fx) => {
      // rises, curls over and crashes, then calms
      if (p.crest) {
        p.crest.rotation.z = -0.22 * bell(t, 0, 0.42) + 0.42 * bell(t, 0.38, 0.75);
        p.crest.scale.y = 1 + 0.28 * bell(t, 0, 0.42) - 0.18 * bell(t, 0.42, 0.75);
      }
      fx.at(0.52, 'spray', () => {
        fx.emit({ type: 'drop', x: 84, y: 48, n: 12, speed: 60, angle: 60, spread: 110, gravity: 110, life: 0.9, size: 5 });
        fx.emit({ type: 'puff', x: 80, y: 60, n: 6, speed: 25, spread: 160, life: 0.9, size: 14, grow: 1.8 });
      });
    },
  },
  fountain: {
    ms: 1700, sound: 'bubble',
    play: (t, p, m, e, fx) => {
      if (p.jets) { p.jets.scale.y = 1 + 0.7 * bell(t, 0, 0.7); p.jets.scale.x = 1 + 0.15 * bell(t, 0, 0.7); }
      stream(fx, 0.1, 0.55, 4, 'spray', () => ({ type: 'drop', x: 50, y: 20, n: 5, speed: 55, angle: 90, spread: 80, gravity: 110, life: 1, size: 5 }));
    },
  },
  mountain: {
    ms: 1900, sound: 'rumble',
    play: (t, p, m, e, fx) => {
      m.position.x = Math.sin(t * PI * 30) * 2.2 * bell(t, 0, 0.45);
      if (p.boulder) {
        const k = ease(seg(t, 0.25, 0.82));
        show(p.boulder, t > 0.2 && t < 0.96 ? 1 - seg(t, 0.88, 0.96) : 0);
        p.boulder.position.x += 22 * k;
        p.boulder.position.y += 54 * k;
        p.boulder.rotation.z = k * PI * 4;
      }
      fx.at(0.82, 'landed', () => fx.emit({ type: 'dust', x: 78, y: 86, n: 6, speed: 22, spread: 140, life: 0.7, size: 10 }));
    },
  },
  gemstone: {
    ms: 1600, sound: 'twinkle',
    play: (t, p, m, e, fx) => {
      turn(m, t, 0, 0.8);
      e.glow.visible = Math.sin(t * PI * 6) > 0.2;
      fx.at(0.45, 'burst', () => fx.emit({ type: 'star', x: 50, y: 50, n: 12, speed: 55, spread: 360, life: 0.8, size: 8 }));
    },
  },
  lodestone: {
    ms: 1900, sound: 'magnet',
    play: (t, p, m, e, fx) => {
      // the rock rolls over and back
      m.position.x = 24 * Math.sin(PI * seg(t, 0, 0.9));
      m.rotation.z = -m.position.x / 26;
      if (p.needles) p.needles.scale.setScalar(t < 0.3 ? 1.5 - 0.5 * ease(seg(t, 0.05, 0.3)) : 1);
      fx.at(0.3, 'snap', () => fx.emit({ type: 'spark', x: 50, y: 30, n: 5, speed: 20, spread: 180, life: 0.5, size: 6 }));
      fx.at(0.45, 'dust', () => fx.emit({ type: 'dust', x: 50, y: 84, n: 5, speed: 18, spread: 150, life: 0.6, size: 9 }));
    },
  },
  cloud: {
    ms: 1900, sound: 'wind',
    play: (t, p, m, e, fx) => {
      m.position.x = Math.sin(t * PI * 2) * 8;
      m.scale.setScalar(1 + 0.06 * bell(t, 0, 1));
      if (p.rain) { p.rain.position.y = (t * 4 % 1) * 12; p.rain.scale.y = 1.6; }
      stream(fx, 0.1, 0.8, 8, 'rain', (i) => ({ type: 'rain', x: 28 + ((i * 37) % 46), y: 72, n: 2, speed: 50, angle: -90, spread: 10, gravity: 60, life: 0.7, size: 5 }));
    },
  },
  'wind-face': {
    ms: 1700, sound: 'wind',
    play: (t, p, m, e, fx) => {
      if (p.face) p.face.scale.setScalar(1 + 0.12 * bell(t, 0, 0.5));
      if (p.wind) p.wind.scale.x = 1 + 0.9 * bell(t, 0.2, 1);
      stream(fx, 0.25, 0.8, 5, 'gust', (i) => ({ type: i % 2 ? 'leaf' : 'puff', x: 64, y: 58, n: 2, speed: 95, angle: 0, spread: 30, life: 0.8, size: i % 2 ? 7 : 10, spin: 6 }));
    },
  },
  sun: {
    ms: 1900, sound: 'chime',
    play: (t, p, m, e, fx) => {
      if (p.rays) { p.rays.rotation.z = t * 0.6; p.rays.scale.setScalar(1 + 0.32 * Math.sin(t * PI * 6) * (0.4 + 0.6 * fade(t))); }
      e.glow.visible = Math.sin(t * PI * 6) > 0;
      fx.at(0.3, 'sparks', () => fx.emit({ type: 'spark', x: 50, y: 50, n: 10, speed: 50, spread: 360, life: 0.8, size: 7 }));
    },
  },
  lightning: {
    ms: 1300, sound: 'thunder',
    play: (t, p, m, e, fx) => {
      e.glow.visible = Math.sin(t * PI * 10) > 0;
      m.position.x = Math.sin(t * PI * 22) * 3 * fade(t);
      m.scale.setScalar(1 + 0.15 * bell(t, 0, 0.3));
      [0.12, 0.45].forEach((tt, i) => fx.at(tt, `zap${i}`, () => fx.emit({ type: 'spark', x: 36, y: 94, n: 8, speed: 45, angle: 90, spread: 170, gravity: 60, life: 0.6, size: 6 })));
    },
  },
  'star-moon': {
    ms: 1900, sound: 'twinkle',
    play: (t, p, m, e, fx) => {
      if (p.star) { p.star.rotation.z = ease(seg(t, 0, 0.8)) * PI * 2; p.star.scale.setScalar(1 + 0.3 * bell(t, 0, 0.8)); }
      if (p.moon) p.moon.rotation.z = osc(t, 1.5) * 0.18 * fade(t);
      stream(fx, 0.1, 0.8, 5, 'twinkle', (i) => ({ type: 'star', x: 25 + ((i * 29) % 50), y: 25 + ((i * 43) % 50), n: 1, speed: 4, spread: 360, life: 0.8, size: 8 }));
    },
  },

  // ---------- plants ----------
  rose: bloom('#d84a5a'),
  lily: bloom('#fbf8ef'),
  columbine: bloom('#9a86cf'),
  foxglove: bloom('#e7a3b5'),
  hellebore: bloom('#f3e9ee'),
  peony: bloom('#e7a3b5'),
  lavender: bloom('#9a86cf'),
  mandrake: {
    ms: 1800, sound: 'scream',
    play: (t, p, m, e, fx) => {
      // the root's arms wave and its legs kick while it screams
      if (p.armL) p.armL.rotation.z = 0.5 * Math.sin(t * PI * 8) * fade(t);
      if (p.armR) p.armR.rotation.z = -0.5 * Math.sin(t * PI * 8) * fade(t);
      if (p.legL) p.legL.rotation.z = 0.35 * Math.sin(t * PI * 10) * fade(t);
      if (p.legR) p.legR.rotation.z = 0.35 * Math.sin(t * PI * 10 + PI) * fade(t);
      if (p.plant) p.plant.rotation.z = Math.sin(t * PI * 18) * 0.05 * fade(t);
      [0.3, 0.6].forEach((tt, i) => fx.at(tt, `soil${i}`, () => fx.emit({ type: 'dust', x: 50, y: 94, n: 5, speed: 20, spread: 140, life: 0.6, size: 9 })));
    },
  },
  mistletoe: {
    ms: 1500, sound: 'twinkle',
    play: (t, p, m, e, fx) => {
      if (p.plant) p.plant.rotation.z = osc(t, 1.5) * 0.15 * fade(t);
      if (p.berries) p.berries.position.y -= 6 * Math.abs(Math.sin(t * PI * 4)) * fade(t);
      fx.at(0.3, 'shine', () => fx.emit({ type: 'star', x: 50, y: 40, n: 6, speed: 25, spread: 360, life: 0.7, size: 6 }));
    },
  },
};

// Herbs sway and rustle, releasing a puff of their scent.
const herb = (scent) => ({
  ms: 1500, sound: 'rustle',
  play: (t, p, m, e, fx) => {
    if (p.plant) p.plant.rotation.z = osc(t, 1.5) * 0.25 * fade(t);
    fx.at(0.3, 'scent', () => fx.emit({ type: 'puff', colour: scent, x: 50, y: 25, n: 5, speed: 16, angle: 90, spread: 100, gravity: -8, life: 1.2, size: 12, grow: 2 }));
  },
});
R.rosemary = herb('rgba(156,192,230,0.75)');
R.sage = herb('rgba(134,160,140,0.75)');
R.wormwood = herb('rgba(230,210,120,0.75)');

export const REACTIONS = R;

export function reactionFor(id) {
  return R[id] || herb('rgba(255,255,255,0.7)');
}
