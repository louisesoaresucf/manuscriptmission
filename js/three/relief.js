// Builds a 3D model from an illuminated SVG drawing.
// Every painted shape is extruded into a thin slab, stacked in painting order,
// so the illustration becomes a small relief (like enamel or a pop-up book)
// that can turn and catch the light. Gold leaf becomes shiny metal.
//
// Parts of a drawing wrapped in <g data-part="name" data-pivot="x,y"> become
// separate pieces that can be animated (wings, heads, tails, flames…).

import { style } from '../style.js';

const T = () => window.THREE;

const GOLD = '#c9a228'; // stand-in colour for gold-leaf gradients
const HALO = '#fdeba0'; // stand-in colour for the soft halo glow
const GOLDS = new Set([GOLD, '#c9a227', '#f7e08a', '#8a6a12', '#e6c65a']);
const INK = '#2a1c10';

// SVGLoader can't read gradient or pattern fills, so swap them for plain colours.
function prepare(markup) {
  return markup
    .replace(/url\(#mm-gold(-v)?\)/g, GOLD)
    .replace(/url\(#mm-halo\)/g, HALO)
    .replace(/url\(#mm-diaper-red\)/g, '#b8322a')
    .replace(/url\(#mm-diaper-blue\)/g, '#1f3a8a')
    .replace(/url\(#mm-diaper-green\)/g, '#2f7d5b')
    .replace(/url\(#[^)]*\)/g, '#888888');
}

const materials = new Map();

// A fine, uneven paint texture (used as a bump map) so pigments look brushed
// onto a surface rather than printed.
let paintBump = null;
function paintTexture() {
  if (paintBump) return paintBump;
  const THREE = T();
  const n = 128, c = document.createElement('canvas');
  c.width = c.height = n;
  const g = c.getContext('2d');
  const img = g.createImageData(n, n);
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const v = 150 + 40 * Math.sin(x * 0.45 + Math.sin(y * 0.2) * 2) + 30 * (Math.random() - 0.5);
      const i = (y * n + x) * 4;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  paintBump = new THREE.CanvasTexture(c);
  paintBump.wrapS = paintBump.wrapT = THREE.RepeatWrapping;
  paintBump.repeat.set(0.06, 0.06);
  return paintBump;
}

// Textures for the two style samples, made once.
const extraTex = new Map();
function canvasTexture(key, draw, repeat) {
  if (extraTex.has(key)) return extraTex.get(key);
  const THREE = T();
  const n = 128, c = document.createElement('canvas');
  c.width = c.height = n;
  draw(c.getContext('2d'), n);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat, repeat);
  extraTex.set(key, tex);
  return tex;
}
// Painted: long brush strokes in the pigment, and gold leaf punched with dots.
const brushTexture = () => canvasTexture('brush', (g, n) => {
  g.fillStyle = '#9a9a9a';
  g.fillRect(0, 0, n, n);
  for (let i = 0; i < 260; i++) {
    const y = Math.random() * n, x = Math.random() * n, len = 20 + Math.random() * 50, v = 110 + Math.random() * 110;
    g.strokeStyle = `rgb(${v},${v},${v})`;
    g.lineWidth = 1.5 + Math.random() * 3;
    g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + len / 2, y + (Math.random() - 0.5) * 8, x + len, y + (Math.random() - 0.5) * 6); g.stroke();
  }
}, 0.05);
const punchTexture = () => canvasTexture('punch', (g, n) => {
  g.fillStyle = '#c8c8c8';
  g.fillRect(0, 0, n, n);
  g.fillStyle = '#404040';
  for (let y = 8; y < n; y += 16) for (let x = (y / 16) % 2 ? 16 : 8; x < n; x += 16) { g.beginPath(); g.arc(x, y, 3, 0, Math.PI * 2); g.fill(); }
}, 0.08);
// Dark: grime and wear, blotchy and darker in patches.
const grimeTexture = () => canvasTexture('grime', (g, n) => {
  const img = g.createImageData(n, n);
  const blobs = Array.from({ length: 14 }, () => [Math.random() * n, Math.random() * n, 10 + Math.random() * 30, 0.25 + Math.random() * 0.35]);
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      let v = 1;
      for (const [bx, by, br, a] of blobs) {
        const dx = Math.min(Math.abs(x - bx), n - Math.abs(x - bx)), dy = Math.min(Math.abs(y - by), n - Math.abs(y - by));
        v -= a * Math.max(0, 1 - Math.hypot(dx, dy) / br);
      }
      v = Math.max(0.45, v) * (0.9 + Math.random() * 0.1);
      const i = (y * n + x) * 4;
      img.data[i] = v * 255; img.data[i + 1] = v * 245; img.data[i + 2] = v * 228; img.data[i + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
}, 0.025);

// Physically based materials: gold leaf is real metal that reflects the
// room's light; pigments are matte paint; ink is a satin line. The painted
// and dark style samples change the finish: tempera and tooled gold, or
// grimy, worn paint and aged gold.
function material(hex, opacity, kind) {
  const look = style();
  const key = `${hex}|${opacity}|${kind}|${look}`;
  if (materials.has(key)) return materials.get(key);
  const THREE = T();
  const transparent = opacity < 0.999;
  const lin = (h) => new THREE.Color(h).convertSRGBToLinear();
  const side = THREE.DoubleSide;
  let m;
  if (kind === 'halo') {
    m = new THREE.MeshBasicMaterial({ color: lin('#ffe8a0'), transparent: true, opacity: 0.35 * opacity, depthWrite: false, side });
  } else if (GOLDS.has(hex)) {
    const base = { [GOLD]: '#e6c35e', '#c9a227': '#e0bb52', '#e6c65a': '#ecd070', '#f7e08a': '#f5e2a0', '#8a6a12': '#a8822a' }[hex] || hex;
    if (look === 'painted') {
      m = new THREE.MeshStandardMaterial({ color: lin(base), metalness: 0.75, roughness: 0.4, bumpMap: punchTexture(), bumpScale: 0.5, side, transparent, opacity });
    } else if (look === 'dark') {
      m = new THREE.MeshStandardMaterial({ color: lin(base).multiplyScalar(0.62), metalness: 0.85, roughness: 0.55, map: grimeTexture(), side, transparent, opacity });
    } else {
      m = new THREE.MeshStandardMaterial({ color: lin(base), metalness: 0.9, roughness: 0.34, side, transparent, opacity });
    }
  } else if (hex === INK) {
    // Ink stays crisp and dark whatever the lighting (sepia in the painted style).
    m = new THREE.MeshBasicMaterial({ color: lin(look === 'painted' ? '#3e2614' : '#1e140b'), side, transparent, opacity });
  } else if (look === 'painted') {
    m = new THREE.MeshStandardMaterial({ color: lin(hex), metalness: 0, roughness: 0.95, bumpMap: kind === 'fill' ? brushTexture() : null, bumpScale: 0.6, side, transparent, opacity });
  } else if (look === 'dark') {
    const c = lin(hex);
    const hsl = {}; c.getHSL(hsl); c.setHSL(hsl.h, hsl.s * 0.8, hsl.l * 0.9);
    m = new THREE.MeshStandardMaterial({ color: c, metalness: 0, roughness: 0.82, map: kind === 'fill' ? grimeTexture() : null, bumpMap: kind === 'fill' ? paintTexture() : null, bumpScale: 0.5, side, transparent, opacity });
  } else {
    m = new THREE.MeshStandardMaterial({ color: lin(hex), metalness: 0, roughness: 0.72, bumpMap: kind === 'fill' ? paintTexture() : null, bumpScale: 0.35, side, transparent, opacity });
  }
  materials.set(key, m);
  return m;
}

// The part a drawn shape belongs to, and the part that one sits inside (so a
// flower can open on a stem that is itself swaying).
function partOf(node) {
  const chain = [];
  for (let n = node; n && n.getAttribute; n = n.parentNode) {
    const p = n.getAttribute('data-part');
    if (p) {
      chain.push({
        name: p,
        pivot: (n.getAttribute('data-pivot') || '50,50').split(',').map(Number),
        // Effect parts (fire breath, a rolling boulder…) stay hidden until a reaction shows them.
        hidden: n.getAttribute('data-rest') === 'hidden',
      });
    }
  }
  if (!chain.length) return { name: 'body', pivot: [50, 50], hidden: false, parent: null };
  return { ...chain[0], parent: chain[1]?.name || null };
}

function normalise(g) {
  const geo = g.index ? g.toNonIndexed() : g;
  if (!geo.getAttribute('normal')) geo.computeVertexNormals();
  if (!geo.getAttribute('uv')) {
    const n = geo.getAttribute('position').count;
    geo.setAttribute('uv', new (T().Float32BufferAttribute)(new Float32Array(n * 2), 2));
  }
  return geo;
}

const templates = new Map();

// Each room gets its own renderer, and materials and geometry don't carry
// over safely from one renderer to the next, so start each room afresh.
export function resetModels() {
  materials.clear();
  templates.clear();
}

// Returns a fresh Object3D for the drawing: centred on the origin, 100 units
// wide, y up, facing the camera along +z. `parts` maps part names to pivots.
export function buildRelief(key, markup, { depth = 4.5, step = 0.24 } = {}) {
  const THREE = T();
  if (!templates.has(key)) templates.set(key, makeTemplate(markup, depth, step));
  const tpl = templates.get(key);
  const model = new THREE.Group();
  const flip = new THREE.Group();
  flip.scale.set(1, -1, 1);
  model.add(flip);
  const centre = new THREE.Group();
  centre.position.set(-50, -50, 0);
  flip.add(centre);
  const parts = {};
  for (const [name, p] of tpl) {
    const g = new THREE.Group();
    for (const { geo, mat } of p.meshes) g.add(new THREE.Mesh(geo, mat));
    if (p.hidden) g.scale.setScalar(0.0001);
    g.userData.pivot = p.pivot; // in drawing units, so effects can spawn there
    parts[name] = g;
  }
  // Nest each part in its parent part, positioned relative to the parent's pivot.
  for (const [name, p] of tpl) {
    const parent = p.parent && tpl.has(p.parent) ? tpl.get(p.parent) : null;
    const g = parts[name];
    if (parent) {
      g.position.set(p.pivot[0] - parent.pivot[0], p.pivot[1] - parent.pivot[1], 0);
      parts[p.parent].add(g);
    } else {
      g.position.set(p.pivot[0], p.pivot[1], 0);
      centre.add(g);
    }
  }
  model.userData.parts = parts;
  model.userData.depth = tpl.depthTotal;
  return model;
}

function makeTemplate(markup, depth, step) {
  const THREE = T();
  // Run the drawing through the browser's forgiving HTML parser first, then
  // serialise it as strict XML (SVGLoader rejects e.g. repeated attributes).
  const holder = document.createElement('div');
  holder.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${prepare(markup)}</svg>`;
  const svg = new XMLSerializer().serializeToString(holder.firstElementChild);
  const data = new THREE.SVGLoader().parse(svg);
  const buckets = new Map(); // part -> material -> geometries
  const pivots = new Map();
  const add = (part, mat, geo) => {
    pivots.set(part.name, { pivot: part.pivot, hidden: !!part.hidden, parent: part.parent });
    if (!buckets.has(part.name)) buckets.set(part.name, new Map());
    const b = buckets.get(part.name);
    if (!b.has(mat)) b.set(mat, []);
    geo.translate(-part.pivot[0], -part.pivot[1], 0);
    b.get(mat).push(normalise(geo));
  };

  let i = 0;
  for (const path of data.paths) {
    const style = path.userData.style;
    const part = partOf(path.userData.node);
    const opacity = (style.opacity ?? 1);
    const z = i * step;
    i++;
    if (style.fill && style.fill !== 'none' && style.fill !== 'transparent') {
      const hex = '#' + path.color.getHexString();
      const isHalo = hex === HALO;
      const fillOpacity = opacity * (style.fillOpacity ?? 1);
      for (const shape of THREE.SVGLoader.createShapes(path)) {
        const geo = isHalo
          ? new THREE.ShapeGeometry(shape, 6)
          // Rounded, bevelled edges so each shape looks sculpted, not cut out.
          : new THREE.ExtrudeGeometry(shape, { depth, curveSegments: 6, bevelEnabled: true, bevelThickness: 0.9, bevelSize: 0.45, bevelOffset: -0.45, bevelSegments: 1 });
        geo.translate(0, 0, isHalo ? -1 : z);
        add(part, material(hex, fillOpacity, isHalo ? 'halo' : 'fill'), geo);
      }
    }
    if (style.stroke && style.stroke !== 'none' && style.strokeWidth > 0) {
      const hex = '#' + new THREE.Color().setStyle(style.stroke).getHexString();
      const strokeOpacity = opacity * (style.strokeOpacity ?? 1);
      for (const sub of path.subPaths) {
        const pts = sub.getPoints();
        if (pts.length < 2) continue;
        const geo = THREE.SVGLoader.pointsToStroke(pts, style);
        if (!geo) continue;
        geo.translate(0, 0, z + depth + 0.03);
        add(part, material(hex, strokeOpacity, 'stroke'), geo);
      }
    }
  }

  const tpl = new Map();
  for (const [name, byMat] of buckets) {
    const meshes = [];
    for (const [mat, geos] of byMat) {
      const merged = geos.length === 1 ? geos[0] : THREE.BufferGeometryUtils.mergeBufferGeometries(geos, false);
      if (merged) meshes.push({ geo: merged, mat });
    }
    const { pivot, hidden, parent } = pivots.get(name);
    tpl.set(name, { pivot, hidden, parent, meshes });
  }
  tpl.depthTotal = i * step + depth;
  return tpl;
}

export function hasWebGL() {
  if (!window.THREE || !window.THREE.SVGLoader) return false;
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}
