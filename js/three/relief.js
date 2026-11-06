// Builds a 3D model from an illuminated SVG drawing.
// Every painted shape is extruded into a thin slab, stacked in painting order,
// so the illustration becomes a small relief (like enamel or a pop-up book)
// that can turn and catch the light. Gold leaf becomes shiny metal.
//
// Parts of a drawing wrapped in <g data-part="name" data-pivot="x,y"> become
// separate pieces that can be animated (wings, heads, tails, flames…).

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
function material(hex, opacity, kind) {
  const key = `${hex}|${opacity}|${kind}`;
  if (materials.has(key)) return materials.get(key);
  const THREE = T();
  const transparent = opacity < 0.999;
  let m;
  if (kind === 'halo') {
    m = new THREE.MeshBasicMaterial({ color: '#ffe8a0', transparent: true, opacity: 0.35 * opacity, depthWrite: false, side: THREE.DoubleSide });
  } else if (GOLDS.has(hex)) {
    const base = { [GOLD]: '#b8902e', '#c9a227': '#b8902e', '#e6c65a': '#c9a446', '#f7e08a': '#e2c878', '#8a6a12': '#7a5a14' }[hex] || hex;
    m = new THREE.MeshPhongMaterial({ color: base, specular: '#ffe9a8', shininess: 55, emissive: '#1c1203', side: THREE.DoubleSide, transparent, opacity });
  } else if (hex === INK) {
    m = new THREE.MeshPhongMaterial({ color: INK, specular: '#000000', shininess: 4, side: THREE.DoubleSide, transparent, opacity });
  } else {
    m = new THREE.MeshPhongMaterial({ color: hex, specular: '#2a2418', shininess: 12, side: THREE.DoubleSide, transparent, opacity });
  }
  materials.set(key, m);
  return m;
}

function partOf(node) {
  for (let n = node; n && n.getAttribute; n = n.parentNode) {
    const p = n.getAttribute('data-part');
    if (p) return { name: p, pivot: (n.getAttribute('data-pivot') || '50,50').split(',').map(Number) };
  }
  return { name: 'body', pivot: [50, 50] };
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
    g.position.set(p.pivot[0], p.pivot[1], 0);
    for (const { geo, mat } of p.meshes) g.add(new THREE.Mesh(geo, mat));
    centre.add(g);
    parts[name] = g;
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
    pivots.set(part.name, part.pivot);
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
          : new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 6 });
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
    tpl.set(name, { pivot: pivots.get(name), meshes });
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
