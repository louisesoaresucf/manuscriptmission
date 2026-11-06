// What each illustration does when tapped. `play(t, parts, model, entry)` is
// called every frame with t running from 0 to 1. Parts come from
// <g data-part="…"> groups in the drawings; coordinates inside parts are SVG
// units (y down), so positive rotation.z turns clockwise on screen.

const PI = Math.PI;
const fade = (t) => 1 - t; // amplitude that dies away
const hop = (model, t, h = 10) => { model.position.y = Math.sin(PI * t) * h; };
const turn = (model, t, n = 1) => { model.rotation.y = (1 - Math.pow(1 - t, 3)) * PI * 2 * n; };

const flap = (g, t, amp = 1, beats = 4) => {
  if (!g) return;
  g.rotation.y = Math.sin(t * PI * 2 * beats) * amp * (0.4 + 0.6 * fade(t));
  g.rotation.z = Math.sin(t * PI * 2 * beats) * 0.12;
};
const shake = (g, t, amp = 0.3, n = 6) => { if (g) g.rotation.z = Math.sin(t * PI * n) * amp * fade(t); };
const flicker = (g, t, amp = 0.35) => {
  if (!g) return;
  g.scale.y = 1 + amp * Math.abs(Math.sin(t * PI * 9));
  g.scale.x = 1 - amp * 0.3 * Math.sin(t * PI * 13);
};
const sway = (g, t, amp = 0.28, n = 5) => { if (g) g.rotation.z = Math.sin(t * PI * n) * amp * fade(t); };
const pulse = (g, t, amp = 0.3, n = 3) => { if (g) g.scale.setScalar(1 + amp * Math.sin(t * PI * n) * fade(t)); };

const R = {
  // ---- creatures ----
  unicorn: { ms: 1500, sound: 'neigh', play: (t, p, m) => { turn(m, t); m.rotation.z = Math.sin(PI * t) * 0.35; hop(m, t, 14); shake(p.tail, t, 0.5, 8); } },
  griffin: { ms: 1500, sound: 'screech', play: (t, p, m) => { turn(m, t); flap(p.wing, t, 1.1, 4); shake(p.tail, t, 0.4, 6); hop(m, t, 12); } },
  dragon: { ms: 1600, sound: 'roar', play: (t, p, m) => { turn(m, t); flap(p.wing, t, 0.9, 3); flap(p.wing2, t, 0.7, 3); shake(p.head, t, 0.22, 10); pulse(p.head, t, 0.12, 1); shake(p.tail, t, 0.3, 5); } },
  pelican: { ms: 1400, sound: 'flap', play: (t, p, m) => { turn(m, t); flap(p.wingL, t, 1, 4); flap(p.wingR, t, -1, 4); } },
  phoenix: { ms: 1500, sound: 'screech', play: (t, p, m) => { flap(p.wingL, t, 1, 4); flap(p.wingR, t, -1, 4); flicker(p.flame, t, 0.45); hop(m, t, 8); } },
  basilisk: { ms: 1400, sound: 'crow', play: (t, p, m) => { turn(m, t); shake(p.head, t, 0.35, 8); shake(p.tail, t, 0.4, 6); } },
  siren: { ms: 1600, sound: 'sing', play: (t, p, m) => { turn(m, t); shake(p.tail, t, 0.18, 4); shake(p.fin, t, 0.5, 6); shake(p.arm, t, 0.3, 3); } },
  salamander: { ms: 1400, sound: 'fire', play: (t, p, m) => { turn(m, t); shake(p.tail, t, 0.4, 7); flicker(p.flame, t, 0.6); } },
  manticore: { ms: 1500, sound: 'roar', play: (t, p, m) => { turn(m, t); shake(p.head, t, 0.25, 10); pulse(p.head, t, 0.12, 1); shake(p.tail, t, 0.45, 3); } },
  caladrius: { ms: 1400, sound: 'chirp', play: (t, p, m) => { turn(m, t); shake(p.head, t, 0.4, 6); flap(p.wing, t, 0.8, 3); hop(m, t, 6); } },
  yale: { ms: 1500, sound: 'rumble', play: (t, p, m) => { turn(m, t); if (p.hornL) p.hornL.rotation.z = Math.sin(t * PI * 2) * 0.6; if (p.hornR) p.hornR.rotation.z = -Math.sin(t * PI * 2) * 0.6; } },
  amphisbaena: { ms: 1400, sound: 'hiss', play: (t, p, m) => { turn(m, t); shake(p.headL, t, 0.4, 6); shake(p.headR, t, -0.4, 6); flap(p.wingL, t, 0.8, 3); flap(p.wingR, t, -0.8, 3); } },

  // ---- elements ----
  'candle-flame': { ms: 1400, sound: 'fire', play: (t, p) => { flicker(p.flame, t, 0.5); } },
  sun: { ms: 1600, sound: 'chime', play: (t, p) => { if (p.rays) { p.rays.rotation.z = t * PI * 0.5; p.rays.scale.setScalar(1 + 0.28 * Math.sin(t * PI * 4)); } } },
  lightning: { ms: 1100, sound: 'thunder', play: (t, p, m, e) => { e.glow.visible = Math.sin(t * PI * 10) > 0; m.position.x = Math.sin(t * PI * 22) * 3 * fade(t); pulse(m, t, 0.12, 5); } },
  'water-droplet': { ms: 1200, sound: 'splash', play: (t, p, m) => { m.scale.y = 1 - 0.25 * Math.sin(t * PI * 4) * fade(t); m.scale.x = 1 + 0.2 * Math.sin(t * PI * 4) * fade(t); } },
  wave: { ms: 1500, sound: 'splash', play: (t, p, m) => { m.rotation.z = Math.sin(t * PI * 2) * 0.18; m.position.x = Math.sin(t * PI * 2) * 8; m.scale.x = 1 + 0.12 * Math.sin(t * PI * 2); } },
  fountain: { ms: 1500, sound: 'bubble', play: (t, p) => { if (p.jets) { p.jets.scale.y = 1 + 0.5 * Math.abs(Math.sin(t * PI * 4)); p.jets.scale.x = 1 + 0.15 * Math.abs(Math.sin(t * PI * 4)); } } },
  mountain: { ms: 1100, sound: 'rumble', play: (t, p, m) => { m.position.x = Math.sin(t * PI * 18) * 3 * fade(t); m.position.y = Math.sin(t * PI * 13) * 1.5 * fade(t); } },
  gemstone: { ms: 1300, sound: 'twinkle', play: (t, p, m, e) => { turn(m, t, 1); e.glow.visible = t > 0.2 && t < 0.8; } },
  lodestone: { ms: 1300, sound: 'magnet', play: (t, p, m) => { if (p.needles) p.needles.scale.setScalar(1 - 0.35 * Math.sin(PI * t)); m.position.x = Math.sin(t * PI * 16) * 1.5 * fade(t); } },
  cloud: { ms: 1600, sound: 'wind', play: (t, p, m) => { m.position.x = Math.sin(t * PI * 2) * 10; if (p.rain) { p.rain.position.y = (t * 3 % 1) * 14; p.rain.scale.y = 1.6; } } },
  'wind-face': { ms: 1500, sound: 'wind', play: (t, p) => { if (p.wind) p.wind.scale.x = 1 + 0.8 * Math.sin(PI * t); pulse(p.face, t, 0.1, 4); } },
  'star-moon': { ms: 1600, sound: 'twinkle', play: (t, p) => { if (p.star) p.star.rotation.z = (1 - Math.pow(1 - t, 3)) * PI * 2; shake(p.moon, t, 0.2, 4); } },

  // ---- plants (each plant sways from its root) ----
  mandrake: { ms: 1300, sound: 'scream', play: (t, p) => { sway(p.plant, t, 0.22, 14); pulse(p.plant, t, 0.08, 6); } },
  peony: { ms: 1400, sound: 'twinkle', play: (t, p, m, e) => { sway(p.plant, t); e.glow.visible = Math.sin(t * PI * 3) > 0; } },
};

const plantDefault = { ms: 1300, sound: 'rustle', play: (t, p) => sway(p.plant, t) };

export const REACTIONS = R;

export function reactionFor(id) {
  return R[id] || plantDefault;
}
