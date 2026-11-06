// Reaction test: tapping each of the 36 illustrations sets it moving (its
// parts or the whole model change) and plays its effects, with no errors.
// Usage (with a local server on port 8765):  node tests/reactions.js
const { chromium } = require('playwright');

const BASE = process.env.BASE_URL || 'http://localhost:8765';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 900, height: 700 } });
  const fails = [];
  const fail = (m) => { fails.push(m); console.log('FAIL', m); };
  page.on('pageerror', (e) => fail('pageerror ' + e.message));
  await page.goto(`${BASE}/index.html`, { waitUntil: 'load' });
  await page.waitForTimeout(500);

  let total = 0;
  for (const room of [0, 1, 2]) {
    await page.evaluate((r) => { window.__mm.startRoom(r); }, room);
    await page.waitForTimeout(300);
    await page.click('#modal-btn');
    await page.waitForTimeout(300);
    const has3D = await page.evaluate(() => window.__mm.state.game.scene.use3D);
    if (!has3D) { fail('3D layer not active'); break; }
    const ids = await page.evaluate(() => window.__mm.state.game.room.items.map((i) => i.id));
    for (const id of ids) {
      const result = await page.evaluate(async (id) => {
        const layer = window.__mm.state.game.scene.layer;
        const e = layer.items.get(id);
        const snap = () => {
          const v = [];
          e.model.traverse((o) => { if (o.isGroup) v.push(...o.position.toArray(), ...o.rotation.toArray().slice(0, 3), ...o.scale.toArray()); });
          return v;
        };
        const rest = snap();
        window.__mm.state.game.scene.react(id);
        let moved = 0, particles = 0;
        for (let k = 0; k < 12; k++) {
          await new Promise((r) => setTimeout(r, 120));
          const now = snap();
          moved = Math.max(moved, now.reduce((m, x, i) => Math.max(m, Math.abs(x - rest[i])), 0));
          particles = Math.max(particles, layer.particles.length);
        }
        await new Promise((r) => setTimeout(r, 900));
        const after = snap();
        const settled = after.every((x, i) => Math.abs(x - rest[i]) < 1e-3);
        return { moved, particles, settled };
      }, id);
      total++;
      const ok = result.moved > 0.05 && result.settled;
      console.log(`${ok ? 'ok  ' : 'FAIL'} ${id.padEnd(14)} moved ${result.moved.toFixed(2)}  particles ${result.particles}  ${result.settled ? 'settled' : 'NOT SETTLED'}`);
      if (!ok) fail(`${id} did not react or did not return to rest`);
    }
  }
  console.log(`${total} illustrations checked`);
  console.log(fails.length ? `FAILURES: ${fails.length}` : 'ALL PASSED');
  if (fails.length) process.exitCode = 1;
  await browser.close();
})();
