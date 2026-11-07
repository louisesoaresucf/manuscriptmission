// Realistic rendering for the rooms. Each room's back scenery is drawn once
// into a high-resolution picture, then given:
//   - stone and plaster texture and a fine grain,
//   - shadows where the walls meet the floor (ambient occlusion),
//   - light pooling from windows, torches and the door,
//   - soft shafts of light with floating dust,
//   - a gentle vignette.
// Panning a single picture is also far lighter work for a phone than
// redrawing hundreds of vector shapes.
import { SCENE_W, SCENE_H } from './data/rooms.js';
import { style } from './style.js';

const K = 1.8; // pixels per scene unit in the baked picture

let noiseCanvas = null;
// Soft, cloudy value noise: the mottling of old stone and plaster.
function noise() {
  if (noiseCanvas) return noiseCanvas;
  const n = 256;
  const c = document.createElement('canvas');
  c.width = c.height = n;
  const g = c.getContext('2d');
  const img = g.createImageData(n, n);
  const grid = (size) => {
    const pts = [];
    for (let i = 0; i <= size; i++) { pts.push([]); for (let j = 0; j <= size; j++) pts[i].push(Math.random()); }
    for (let j = 0; j <= size; j++) pts[size][j] = pts[0][j];
    for (let i = 0; i <= size; i++) pts[i][size] = pts[i][0];
    return pts;
  };
  const octaves = [[4, 0.5], [8, 0.25], [16, 0.15], [64, 0.1]].map(([s, w]) => ({ s, w, p: grid(s) }));
  const smooth = (t) => t * t * (3 - 2 * t);
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      let v = 0;
      for (const o of octaves) {
        const fx = (x / n) * o.s, fy = (y / n) * o.s;
        const ix = Math.floor(fx), iy = Math.floor(fy), tx = smooth(fx - ix), ty = smooth(fy - iy);
        const a = o.p[iy][ix], b = o.p[iy][ix + 1], c2 = o.p[iy + 1][ix], d = o.p[iy + 1][ix + 1];
        v += o.w * ((a * (1 - tx) + b * tx) * (1 - ty) + (c2 * (1 - tx) + d * tx) * ty);
      }
      const i = (y * n + x) * 4;
      const lum = 120 + v * 135;
      img.data[i] = lum; img.data[i + 1] = lum * 0.97; img.data[i + 2] = lum * 0.92; img.data[i + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  noiseCanvas = c;
  return c;
}

// Turn our forgiving HTML-style SVG markup into a standalone SVG picture.
// The painted style sample loosens every edge a little, like a brush.
const WOBBLE = `<filter id="pt-wobble" x="-2%" y="-2%" width="104%" height="104%">
  <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="3" result="n"/>
  <feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G"/>
</filter>`;
function svgPicture(markup, look) {
  const defs = [...document.querySelectorAll('#mm-sprite defs')].map((d) => d.outerHTML).join('');
  const holder = document.createElement('div');
  const art = look === 'painted' ? `<defs>${WOBBLE}</defs><g filter="url(#pt-wobble)">${markup}</g>` : markup;
  holder.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="${SCENE_W * K}" height="${SCENE_H * K}" viewBox="0 0 ${SCENE_W} ${SCENE_H}">${defs}${art}</svg>`;
  const xml = new XMLSerializer().serializeToString(holder.firstElementChild);
  return URL.createObjectURL(new Blob([xml], { type: 'image/svg+xml' }));
}

function poly(ctx, pts) {
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x * K, y * K) : ctx.moveTo(x * K, y * K)));
  ctx.closePath();
}

export async function bakeRoom(room, markup, canvas) {
  const look = style();
  const url = svgPicture(markup, look);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const W = SCENE_W * K, H = SCENE_H * K;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, W, H);
    if (look === 'painted') paintedPass(ctx, W, H);
    else if (look === 'dark') darkPass(ctx, room.darkRealism || { ...room.realism, vignette: 0.9 }, W, H);
    else paintRealism(ctx, room.realism || {}, W, H);
    return true;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function paintRealism(ctx, r, W, H) {
  const floorY = (r.floorY || 760) * K;

  // Texture: mottled stone/plaster, then a fine grain.
  ctx.save();
  ctx.globalCompositeOperation = 'multiply';
  ctx.globalAlpha = 0.32;
  const pat = ctx.createPattern(noise(), 'repeat');
  ctx.setTransform(1.6, 0, 0, 1.6, 0, 0);
  ctx.fillStyle = pat;
  ctx.fillRect(0, 0, W / 1.6, H / 1.6);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = 'overlay';
  ctx.globalAlpha = 0.18;
  ctx.setTransform(0.35, 0, 0, 0.35, 0, 0);
  ctx.fillRect(0, 0, W / 0.35, H / 0.35);
  ctx.restore();

  // Ambient occlusion where the walls meet the floor, and along the edges.
  ctx.save();
  ctx.globalCompositeOperation = 'multiply';
  let g = ctx.createLinearGradient(0, floorY - 90 * K, 0, floorY + 60 * K);
  g.addColorStop(0, 'rgba(60,40,25,0)');
  g.addColorStop(0.62, 'rgba(60,40,25,0.55)');
  g.addColorStop(1, 'rgba(60,40,25,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, floorY - 90 * K, W, 150 * K);
  for (const [x0, x1] of [[0, 140 * K], [W, W - 140 * K]]) {
    g = ctx.createLinearGradient(x0, 0, x1, 0);
    g.addColorStop(0, 'rgba(50,32,20,0.5)');
    g.addColorStop(1, 'rgba(50,32,20,0)');
    ctx.fillStyle = g;
    ctx.fillRect(Math.min(x0, x1), 0, 140 * K, H);
  }
  ctx.restore();

  // Shafts of light, with dust floating in them.
  for (const s of r.shafts || []) {
    const [pts, colour = '255,240,200', alpha = 0.22] = s;
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const top = Math.min(...pts.map((p) => p[1])) * K, bottom = Math.max(...pts.map((p) => p[1])) * K;
    g = ctx.createLinearGradient(0, top, 0, bottom);
    g.addColorStop(0, `rgba(${colour},${alpha})`);
    g.addColorStop(1, `rgba(${colour},0)`);
    ctx.fillStyle = g;
    poly(ctx, pts);
    ctx.fill();
    ctx.clip();
    for (let i = 0; i < 60; i++) {
      const xs = pts.map((p) => p[0]), x = (Math.min(...xs) + Math.random() * (Math.max(...xs) - Math.min(...xs))) * K;
      const y = top + Math.random() * (bottom - top) * 0.8;
      ctx.fillStyle = `rgba(${colour},${0.25 + Math.random() * 0.4})`;
      ctx.beginPath();
      ctx.arc(x, y, (0.8 + Math.random() * 1.6) * K, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // Pools of light from windows, torches and doors.
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  for (const [x, y, rad, colour, a] of r.lights || []) {
    g = ctx.createRadialGradient(x * K, y * K, 0, x * K, y * K, rad * K);
    g.addColorStop(0, `rgba(${colour},${a})`);
    g.addColorStop(0.5, `rgba(${colour},${a * 0.35})`);
    g.addColorStop(1, `rgba(${colour},0)`);
    ctx.fillStyle = g;
    ctx.fillRect((x - rad) * K, (y - rad) * K, rad * 2 * K, rad * 2 * K);
  }
  ctx.restore();

  // Vignette.
  ctx.save();
  ctx.globalCompositeOperation = 'multiply';
  g = ctx.createRadialGradient(W / 2, H * 0.48, H * 0.35, W / 2, H * 0.5, W * 0.62);
  g.addColorStop(0, 'rgba(255,255,255,0)');
  g.addColorStop(1, `rgba(40,24,12,${r.vignette ?? 0.5})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

// ---------- style samples ----------

// Painted: tempera on vellum. Pigment pools darker at the edges of each
// shape, long brush marks run through the colour, and the vellum's grain
// and warmth show through. Flat, with no cast light or shadow.
function paintedPass(ctx, W, H) {
  // A blurred copy to find the edges of each wash of colour.
  const sw = Math.round(W / 6), sh = Math.round(H / 6);
  const small = document.createElement('canvas');
  small.width = sw; small.height = sh;
  const sg = small.getContext('2d');
  sg.imageSmoothingQuality = 'high';
  sg.drawImage(ctx.canvas, 0, 0, sw, sh);
  const blur = document.createElement('canvas');
  blur.width = W; blur.height = H;
  const bg = blur.getContext('2d');
  bg.imageSmoothingQuality = 'high';
  bg.drawImage(small, 0, 0, W, H);
  const a = ctx.getImageData(0, 0, W, H), b = bg.getImageData(0, 0, W, H).data, d = a.data;
  for (let i = 0; i < d.length; i += 4) {
    const l = d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11;
    const lb = b[i] * 0.3 + b[i + 1] * 0.59 + b[i + 2] * 0.11;
    const k = 1 - Math.min(0.32, Math.abs(l - lb) / 255 * 0.9);
    // edge pooling, a touch more saturation, warmed toward the vellum
    const m = (d[i] + d[i + 1] + d[i + 2]) / 3;
    d[i] = Math.min(255, (m + (d[i] - m) * 1.12) * k + 6);
    d[i + 1] = Math.min(255, (m + (d[i + 1] - m) * 1.12) * k + 3);
    d[i + 2] = Math.min(255, (m + (d[i + 2] - m) * 1.12) * k - 4);
  }
  ctx.putImageData(a, 0, 0);
  blur.width = blur.height = small.width = small.height = 1;

  ctx.save();
  // Brush marks.
  ctx.globalCompositeOperation = 'soft-light';
  ctx.globalAlpha = 0.5;
  for (let i = 0; i < 2600; i++) {
    const x = Math.random() * W, y = Math.random() * H, len = (30 + Math.random() * 90) * K, v = Math.random() < 0.5 ? 0 : 255;
    ctx.strokeStyle = `rgba(${v},${v},${v},0.25)`;
    ctx.lineWidth = (2 + Math.random() * 5) * K;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + len / 2, y + (Math.random() - 0.5) * 10 * K, x + len, y + (Math.random() - 0.5) * 8 * K); ctx.stroke();
  }
  // Vellum grain and warmth.
  ctx.globalCompositeOperation = 'multiply';
  ctx.globalAlpha = 0.28;
  ctx.fillStyle = ctx.createPattern(noise(), 'repeat');
  ctx.setTransform(1.2, 0, 0, 1.2, 0, 0);
  ctx.fillRect(0, 0, W / 1.2, H / 1.2);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 0.12;
  ctx.fillStyle = '#e8c88a';
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

// Dark: night and torchlight. The room is pushed into shadow and cool
// colour, rough stone and grime are deepened, and warm pools of light are
// added back around the torches, with a low haze over the floor.
function darkPass(ctx, r, W, H) {
  ctx.save();
  // Stone texture and grime at two scales.
  ctx.globalCompositeOperation = 'multiply';
  ctx.fillStyle = ctx.createPattern(noise(), 'repeat');
  ctx.globalAlpha = 0.5;
  ctx.setTransform(2.4, 0, 0, 2.4, 0, 0);
  ctx.fillRect(0, 0, W / 2.4, H / 2.4);
  ctx.globalAlpha = 0.35;
  ctx.setTransform(0.6, 0, 0, 0.6, 0, 0);
  ctx.fillRect(0, 0, W / 0.6, H / 0.6);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  // Damp streaks running down the walls.
  const floorY = (r.floorY || 760) * K;
  for (let i = 0; i < 70; i++) {
    const x = Math.random() * W, y = Math.random() * floorY * 0.6, len = (80 + Math.random() * 260) * K;
    const g = ctx.createLinearGradient(0, y, 0, y + len);
    g.addColorStop(0, 'rgba(30,24,18,0.35)'); g.addColorStop(1, 'rgba(30,24,18,0)');
    ctx.globalAlpha = 1;
    ctx.fillStyle = g;
    ctx.fillRect(x, y, (3 + Math.random() * 10) * K, len);
  }
  // Night: everything sinks into a cold, deep shadow.
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#6e606c';
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
  // Then the warm light comes back around the flames, the vignette closes in.
  paintRealism(ctx, { ...r, shafts: r.shafts || [] }, W, H);
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  const g = ctx.createLinearGradient(0, floorY, 0, H);
  g.addColorStop(0, 'rgba(120,130,150,0)'); g.addColorStop(1, 'rgba(120,130,150,0.18)');
  ctx.fillStyle = g;
  ctx.fillRect(0, floorY, W, H - floorY);
  ctx.restore();
}

export const BAKE_SCALE = K;
