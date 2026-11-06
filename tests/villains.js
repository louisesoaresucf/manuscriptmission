// Interruption test: the broom, owl and witch arrive on the minute, can be
// shooed away with a tap, and otherwise move only unfound illustrations,
// which must stay tappable in their new spots.
// Usage (with a local server on port 8765):  node tests/villains.js "iPhone 13"
const { chromium, devices } = require('playwright');

const DEV = process.argv[2] || 'iPhone 13';
const BASE = process.env.BASE_URL || 'http://localhost:8765';

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ ...devices[DEV] });
  const page = await ctx.newPage();
  const fails = [];
  const fail = (m) => { fails.push(m); console.log('FAIL', m); };
  page.on('pageerror', (e) => fail('pageerror ' + e.message));
  await page.goto(`${BASE}/index.html`, { waitUntil: 'load' });
  await page.waitForTimeout(500);

  const box = async () => page.evaluate(() => { const r = document.getElementById('scene').getBoundingClientRect(); return { x: r.left, y: r.top }; });
  const positions = () => page.evaluate(() => Object.fromEntries([...window.__mm.state.game.scene.items.values()].map((i) => [i.id, [Math.round(i.x), Math.round(i.y), i.found]])));

  for (const room of [0, 1, 2]) {
    await page.evaluate((r) => { window.__mm.startRoom(r); }, room);
    await page.waitForTimeout(300);
    await page.tap('#modal-btn');
    await page.waitForTimeout(300);

    // 1. Warning arrives a few seconds before the minute.
    await page.evaluate(() => { const g = window.__mm.state.game; g.t0 -= 57 * 1000; });
    await page.waitForTimeout(600);
    const warned = await page.evaluate(() => window.__mm.state.game.villain.phase);
    const toast = await page.$eval('#toast', (t) => t.textContent);
    if (warned !== 'warned') fail(`room ${room}: no warning before the minute (phase ${warned})`);
    console.log(`room ${room} warning: ${toast}`);

    // 2. Tapping the villain in time shoos it away; nothing moves.
    await page.waitForTimeout(3800);
    const before = await positions();
    const o = await box();
    const hitAt = await page.evaluate(() => {
      const g = window.__mm.state.game, v = g.villain;
      if (v.phase !== 'active') return null;
      const c = v.centre();
      return g.viewport.toScreen(c.x, c.y);
    });
    if (!hitAt) fail(`room ${room}: villain did not arrive on the minute`);
    else await page.touchscreen.tap(o.x + hitAt.x, o.y + hitAt.y);
    await page.waitForTimeout(4500);
    const shoos = await page.evaluate(() => window.__mm.state.game.villain.shoos);
    const afterShoo = await positions();
    const movedAfterShoo = Object.keys(before).filter((k) => before[k][0] !== afterShoo[k][0] || before[k][1] !== afterShoo[k][1]);
    if (shoos !== 1) fail(`room ${room}: tapping the villain did not shoo it (shoos=${shoos})`);
    if (movedAfterShoo.length) fail(`room ${room}: items moved after shooing: ${movedAfterShoo}`);
    console.log(`room ${room} shoo: ${shoos === 1 && !movedAfterShoo.length ? 'ok' : 'FAILED'}`);

    // 3. Find one item first; then let the villain strike. Found items never move.
    const foundId = await page.evaluate(() => {
      const g = window.__mm.state.game; const it = g.scene.unfound()[0]; g.scene.markFound(it.id); return it.id;
    });
    const pre = await positions();
    await page.evaluate(() => window.__mm.state.game.villain.trigger());
    await page.waitForTimeout(6500);
    const post = await positions();
    const moved = Object.keys(pre).filter((k) => pre[k][0] !== post[k][0] || pre[k][1] !== post[k][1]);
    if (!moved.length) fail(`room ${room}: the villain moved nothing`);
    if (moved.includes(foundId)) fail(`room ${room}: a found item was moved`);
    console.log(`room ${room} strike moved: ${moved.join(', ')}`);

    // 4. Moved items are still tappable in their new spots.
    for (const id of moved) {
      await page.evaluate((id) => { const g = window.__mm.state.game, it = g.scene.items.get(id); g.viewport.animateTo(it.x, it.y, g.viewport.s, 1); }, id);
      await page.waitForTimeout(80);
      const s = await page.evaluate((id) => { const g = window.__mm.state.game, it = g.scene.items.get(id); return g.viewport.toScreen(it.x, it.y); }, id);
      const b = await box();
      await page.touchscreen.tap(b.x + s.x, b.y + s.y);
      await page.waitForTimeout(150);
      const sel = await page.evaluate(() => window.__mm.state.game.selected);
      if (sel !== id) fail(`room ${room}: moved ${id} not tappable (got ${sel})`);
      await page.evaluate(() => window.__mm.state.game.deselect());
    }
  }
  console.log(fails.length ? `FAILURES: ${fails.length}` : 'ALL PASSED');
  if (fails.length) process.exitCode = 1;
  await browser.close();
})();
