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
function svgPicture(markup) {
  const defs = [...document.querySelectorAll('#mm-sprite defs')].map((d) => d.outerHTML).join('');
  const holder = document.createElement('div');
  holder.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="${SCENE_W * K}" height="${SCENE_H * K}" viewBox="0 0 ${SCENE_W} ${SCENE_H}">${defs}${markup}</svg>`;
  const xml = new XMLSerializer().serializeToString(holder.firstElementChild);
  return URL.createObjectURL(new Blob([xml], { type: 'image/svg+xml' }));
}

function poly(ctx, pts) {
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x * K, y * K) : ctx.moveTo(x * K, y * K)));
  ctx.closePath();
}

export async function bakeRoom(room, markup, canvas) {
  const url = svgPicture(markup);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const W = SCENE_W * K, H = SCENE_H * K;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, W, H);
    paintRealism(ctx, room.realism || {}, W, H);
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

export const BAKE_SCALE = K;
