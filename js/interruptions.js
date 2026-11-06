// The witch's helpers come to make trouble once a minute:
//   Room 1 – the enchanted broom sweeps illustrations to new spots.
//   Room 2 – the eagle-owl carries illustrations off and drops them elsewhere.
//   Room 3 – the witch herself moves them with her scepter.
// A warning comes a few seconds before. Tapping the villain in time shoos it
// away (a time bonus). Only illustrations still hidden ever move, and never
// the one the player is holding.
import { villainDefs, broom, owl, witchFigure } from './art/villains.js';
import { itemById } from './data/items.js';
import { audio } from './audio.js';
import * as ui from './ui.js';

export const INTERVAL = 60; // seconds between visits
const WARNING = 4; // seconds of warning
export const SHOO_BONUS = 10; // seconds taken off the star time

const KINDS = {
  broom: {
    name: 'broom', count: 3, style: 'sweep', ms: 4600,
    warn: 'Swish… swish… The witch’s enchanted broom is coming! Tap it to shoo it away.',
    shoo: 'You shooed the broom away!',
    strike: (names) => `The broom swept ${names} to new hiding places!`,
  },
  owl: {
    name: 'owl', count: 2, style: 'carry', ms: 4600,
    warn: 'Hoo-hoo! The witch’s owl is swooping in. Tap it to scare it off!',
    shoo: 'You scared the owl away!',
    strike: (names) => `The owl carried off ${names} and dropped them somewhere new!`,
  },
  witch: {
    name: 'witch', count: 3, style: 'vanish', ms: 5200,
    warn: 'The witch is coming with her scepter! Tap her before she casts her spell!',
    shoo: 'You broke the witch’s concentration and she vanished!',
    strike: (names) => `The witch’s scepter flashed: ${names} vanished and reappeared elsewhere!`,
  },
};

function listNames(ids) {
  const n = ids.map((id) => `the ${itemById[id].name}`);
  return n.length > 1 ? `${n.slice(0, -1).join(', ')} and ${n[n.length - 1]}` : n[0];
}

export class Interruptions {
  constructor(game) {
    this.game = game;
    this.kind = KINDS[game.room.villain];
    this.next = INTERVAL;
    this.phase = 'idle';
    this.shoos = 0;
    this.raf = null;
    this.layer = game.scene.actors;
    if (this.kind) this.layer.innerHTML = villainDefs();
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    this.raf = null;
    this.actor?.remove();
    this.bolts?.remove();
    this.actor = null;
    this.bolts = null;
  }

  // Called a few times a second with the game clock.
  update(now) {
    if (!this.kind || this.game.done) return;
    if (this.phase === 'idle' && now >= this.next - WARNING) {
      this.phase = 'warned';
      audio.villain(this.kind.name, 'warn');
      ui.toast(this.kind.warn, WARNING * 1000);
    } else if (this.phase === 'warned' && now >= this.next && !this.game.busy) {
      this.begin(now);
    }
  }

  // Start a visit straight away (used by the tests).
  trigger() {
    if (!this.kind || this.phase === 'active') return;
    this.begin(this.game.elapsed());
  }

  visible() {
    const vp = this.game.viewport;
    const a = vp.toScene(0, 0), b = vp.toScene(vp.width, vp.height);
    return { x0: a.x, y0: a.y, x1: b.x, y1: b.y, w: b.x - a.x, h: b.y - a.y };
  }

  begin(now) {
    this.phase = 'active';
    this.t0 = now;
    this.view = this.visible();
    this.shooed = false;
    this.struck = false;
    const v = this.view;
    const k = this.kind.name;
    // Size the villain to the screen so it is always easy to see and tap.
    this.scale = k === 'witch' ? (v.h * 0.6) / 290 : k === 'owl' ? (v.h * 0.32) / 90 : (v.h * 0.42) / 160;
    const art = k === 'broom' ? broom(0, 0, 1, 0) : k === 'owl' ? owl(0, 0, 1, { flying: true }) : witchFigure(0, 0, 1, { owlOnShoulder: false });
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', `actor actor-${k}`);
    g.innerHTML = `<g class="actor-body">${art}</g>`;
    this.layer.appendChild(g);
    this.actor = g;
    this.bolts = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.layer.appendChild(this.bolts);
    this.loop();
  }

  loop() {
    cancelAnimationFrame(this.raf);
    this.raf = requestAnimationFrame(() => this.frame());
  }

  // Where the villain is at time t (0–1 of its visit), in scene units.
  pose(t) {
    const v = this.view;
    const k = this.kind.name;
    if (k === 'broom') {
      return { x: v.x0 - 80 + (v.w + 160) * t, y: v.y1 - v.h * 0.06, rot: -28 + Math.sin(t * 40) * 14, opacity: 1 };
    }
    if (k === 'owl') {
      return { x: v.x1 + 80 - (v.w + 160) * t, y: v.y0 + v.h * (0.45 - 0.2 * Math.sin(Math.PI * t)), rot: Math.sin(t * 9) * 6, opacity: 1 };
    }
    const fade = Math.min(1, t * 6, (1 - t) * 6);
    return { x: v.x0 + v.w * 0.7, y: v.y0 + v.h * 0.78 + Math.sin(t * 12) * v.h * 0.012, rot: 0, opacity: fade };
  }

  centre() {
    const p = this.pose(this.progress ?? 0);
    const s = this.scale;
    const k = this.kind.name;
    if (k === 'broom') return { x: p.x, y: p.y - 70 * s, r: 85 * s };
    if (k === 'owl') return { x: p.x, y: p.y - 45 * s, r: 60 * s };
    return { x: p.x, y: p.y - 60 * s, r: 140 * s };
  }

  frame() {
    if (!this.actor) return;
    const now = this.game.elapsed();
    const t = Math.min(1, ((now - this.t0) * 1000) / this.kind.ms);
    this.progress = t;
    const p = this.pose(this.shooed ? this.fleeT(now) : t);
    const s = this.scale;
    this.actor.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${p.rot.toFixed(1)}) scale(${s.toFixed(3)})`);
    this.actor.style.opacity = this.shooed ? Math.max(0, 1 - (now - this.shooAt) * 2) : p.opacity;
    if (this.kind.name === 'owl') {
      const k = Math.cos(now * 18);
      // Flap around the shoulders (y = -50), not the feet.
      const sy = (0.25 + 0.75 * Math.abs(k)) * Math.sign(k || 1);
      for (const w of this.actor.querySelectorAll('.owl-wing')) w.setAttribute('transform', `translate(0,-50) scale(${w.dataset.side},${sy.toFixed(3)}) translate(0,50)`);
    }
    if (this.kind.name === 'witch') {
      const glow = this.actor.querySelector('.spell-glow');
      if (glow) glow.setAttribute('r', (24 + 8 * Math.sin(now * 10)).toFixed(1));
    }
    if (!this.shooed && !this.struck && t >= 0.68) this.strike();
    const done = this.shooed ? now - this.shooAt > 0.6 : t >= 1;
    if (done && !this.moving) this.end();
    else this.loop();
  }

  fleeT(now) {
    return Math.min(1, this.progress + (now - this.shooAt) * 1.4);
  }

  // Tap test: did the player tap the villain?
  hit(pt) {
    if (this.phase !== 'active' || this.shooed || this.struck || !this.actor) return false;
    const c = this.centre();
    return Math.hypot(pt.x - c.x, pt.y - c.y) <= c.r;
  }

  shoo() {
    this.shooed = true;
    this.shooAt = this.game.elapsed();
    this.shoos++;
    audio.villain(this.kind.name, 'shoo');
    ui.toast(`${this.kind.shoo} −${SHOO_BONUS} seconds on your time.`, 3200);
  }

  // Pick illustrations to move and somewhere new for each.
  plan() {
    const scene = this.game.scene;
    const free = scene.unfound().filter((it) => it.id !== this.game.selected && !it.moving);
    const picks = free.sort(() => Math.random() - 0.5).slice(0, this.kind.count);
    const taken = scene.unfound().map((it) => [it.x, it.y]);
    const moves = [];
    const spots = [...this.game.room.spots].sort(() => Math.random() - 0.5);
    for (const it of picks) {
      const spot = spots.find(([x, y]) => taken.every(([tx, ty]) => Math.hypot(tx - x, ty - y) > 110));
      if (!spot) continue;
      spots.splice(spots.indexOf(spot), 1);
      taken.push(spot);
      moves.push({ id: it.id, x: spot[0], y: spot[1], from: [it.x, it.y] });
    }
    return moves;
  }

  async strike() {
    this.struck = true;
    const moves = this.plan();
    if (!moves.length) return;
    this.moving = true;
    this.game.scene.clearRing();
    audio.villain(this.kind.name, 'strike');
    if (this.kind.name === 'witch') this.drawBolts(moves);
    await Promise.all(moves.map((m) => this.game.scene.moveItem(m.id, m.x, m.y, this.kind.style)));
    this.bolts.innerHTML = '';
    this.moving = false;
    if (!this.game.done) ui.toast(this.kind.strike(listNames(moves.map((m) => m.id))), 4200);
  }

  drawBolts(moves) {
    const p = this.pose(this.progress);
    const s = this.scale;
    const ox = p.x + 80 * s, oy = p.y - 138 * s;
    this.bolts.innerHTML = moves.map(({ from: [x, y] }) => {
      const mx = (ox + x) / 2 + (Math.random() - 0.5) * 80, my = (oy + y) / 2 + (Math.random() - 0.5) * 80;
      const d = `M${ox},${oy} L${mx},${my} L${x},${y}`;
      return `<path d="${d}" class="spell-bolt" fill="none" stroke="#b58cf0" stroke-width="10" stroke-linecap="round" opacity="0.5"/>
        <path d="${d}" class="spell-bolt" fill="none" stroke="#e8fff2" stroke-width="3" stroke-linecap="round"/>
        <circle cx="${x}" cy="${y}" r="40" fill="#b58cf0" opacity="0.35"/>`;
    }).join('');
  }

  end() {
    this.destroy();
    this.phase = 'idle';
    const now = this.game.elapsed();
    this.next = Math.max(this.next + INTERVAL, Math.ceil((now + WARNING + 1) / INTERVAL) * INTERVAL);
  }
}
