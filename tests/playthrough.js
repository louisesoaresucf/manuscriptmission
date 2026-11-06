// Automated playthrough on an emulated phone using real touch taps.
// Usage (with a local server running on port 8765):
//   node tests/playthrough.js "iPhone 13"        # or "Pixel 7"
//   node tests/playthrough.js "iPhone 13" shots  # also saves screenshots
// Needs Playwright with Chromium installed (npm i -D playwright).
const { chromium, devices } = require('playwright');
const DEV = process.argv[2] || 'iPhone 13';
const SHOTS = process.argv[3] === 'shots';
const BASE = process.env.BASE_URL || 'http://localhost:8765';
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ ...devices[DEV] });
  const p = await ctx.newPage();
  const errs = [];
  const fail = (m) => { errs.push(m); console.log('FAIL', m); };
  p.on('pageerror', e => fail('pageerror ' + e.message));
  p.on('console', m => { if (m.type() === 'error') fail('console ' + m.text()); });
  await p.goto(`${BASE}/index.html`, { waitUntil: 'load' });
  await p.waitForTimeout(800);
  if (SHOTS) await p.screenshot({ path: `shot-title.png` });

  // Title → intro story (4 panels)
  await p.tap('#btn-begin');
  for (let i = 0; i < 4; i++) {
    await p.waitForTimeout(150);
    if (SHOTS) await p.screenshot({ path: `shot-story${i}.png` });
    await p.tap('#story-actions [data-act="next"]');
  }
  const tapItem = async (id) => {
    // Bring the item on screen (like a player panning), then tap its centre.
    await p.evaluate((id) => {
      const g = window.__mm.state.game, it = g.scene.items.get(id), vp = g.viewport;
      if (!vp.isVisible(it.x, it.y, 60)) vp.animateTo(it.x, it.y, vp.s, 1);
    }, id);
    await p.waitForTimeout(80);
    const box = await p.evaluate((id) => {
      const g = window.__mm.state.game, it = g.scene.items.get(id), vp = g.viewport;
      const r = document.getElementById('scene').getBoundingClientRect();
      const s = vp.toScreen(it.x, it.y);
      return { x: r.left + s.x, y: r.top + s.y };
    }, id);
    await p.touchscreen.tap(box.x, box.y);
  };
  const BOOK = { creature: 'bestiary', element: 'alchemy', plant: 'herbarium' };

  for (let room = 0; room < 3; room++) {
    await p.waitForSelector('#modal:not([hidden])');
    if (SHOTS) await p.screenshot({ path: `shot-room${room}-intro.png` });
    await p.tap('#modal-btn');
    await p.waitForTimeout(250);
    if (SHOTS) await p.screenshot({ path: `shot-room${room}.png` });
    const items = await p.evaluate(() => window.__mm.state.game.room.items.map(i => i.id));

    // Pan test: a drag must not select anything.
    const sw = await p.evaluate(() => { const vp = window.__mm.state.game.viewport; return vp.tx; });
    await p.evaluate(async () => {
      const svg = document.getElementById('scene'); const r = svg.getBoundingClientRect();
      const ev = (type, x, y) => svg.dispatchEvent(new PointerEvent(type, { pointerId: 7, pointerType: 'touch', clientX: x, clientY: y, bubbles: true, isPrimary: true }));
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      ev('pointerdown', cx, cy); for (let k = 1; k <= 8; k++) ev('pointermove', cx - k * 15, cy); ev('pointerup', cx - 120, cy);
    });
    const after = await p.evaluate(() => ({ tx: window.__mm.state.game.viewport.tx, sel: window.__mm.state.game.selected }));
    if (room === 0 && after.sel) fail('drag selected an item');
    if (room === 0 && Math.abs(after.tx - sw) < 1) console.log('note: pan did not move (may be at edge)');

    // Pinch test (room 0): two pointers spreading apart zoom in.
    if (room === 0) {
      const s0 = await p.evaluate(() => window.__mm.state.game.viewport.s);
      await p.evaluate(() => {
        const svg = document.getElementById('scene'); const r = svg.getBoundingClientRect();
        const ev = (type, id, x, y) => svg.dispatchEvent(new PointerEvent(type, { pointerId: id, pointerType: 'touch', clientX: x, clientY: y, bubbles: true }));
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        ev('pointerdown', 1, cx - 20, cy); ev('pointerdown', 2, cx + 20, cy);
        for (let k = 1; k <= 10; k++) { ev('pointermove', 1, cx - 20 - k * 8, cy); ev('pointermove', 2, cx + 20 + k * 8, cy); }
        ev('pointerup', 1, cx - 100, cy); ev('pointerup', 2, cx + 100, cy);
      });
      const s1 = await p.evaluate(() => window.__mm.state.game.viewport.s);
      console.log(`pinch: scale ${s0.toFixed(3)} -> ${s1.toFixed(3)}`);
      if (!(s1 > s0 * 1.5)) fail('pinch did not zoom in');
      const sel = await p.evaluate(() => window.__mm.state.game.selected);
      if (sel) fail('pinch selected an item');
      if (SHOTS) await p.screenshot({ path: `shot-zoomed.png` });
      await p.evaluate(() => { const vp = window.__mm.state.game.viewport; vp.s = vp.minScale; vp.apply(); });
    }

    // Hint test (room 0)
    if (room === 0) {
      await p.tap('#btn-hint');
      await p.waitForTimeout(300);
      const ring = await p.$$eval('.hint-ring', (r) => r.length);
      if (ring !== 2) fail('hint ring not shown');
      const cooling = await p.$eval('#btn-hint', (b) => b.classList.contains('cooling'));
      if (!cooling) fail('hint not cooling down');
      if (SHOTS) await p.screenshot({ path: `shot-hint.png` });
    }

    for (const [n, id] of items.entries()) {
      await tapItem(id);
      await p.waitForTimeout(120);
      const sel = await p.evaluate(() => window.__mm.state.game.selected);
      if (sel !== id) { fail(`room ${room}: tapping ${id} selected ${sel}`); continue; }
      const right = await p.evaluate(async (id) => {
        const m = await import('/js/data/items.js');
        return m.CATEGORY_BOOK[m.itemById[id].category];
      }, id);
      if (room === 0 && n === 0) {
        // Wrong book first: item must stay and a hint appear.
        const wrong = right === 'bestiary' ? 'herbarium' : 'bestiary';
        if (SHOTS) await p.screenshot({ path: `shot-selected.png` });
        await p.tap(`.book-btn[data-book="${wrong}"]`);
        await p.waitForTimeout(200);
        const toast = await p.$eval('#toast', (t) => t.classList.contains('show') ? t.textContent : '');
        const found = await p.evaluate((id) => window.__mm.state.game.scene.items.get(id).found, id);
        console.log('wrong-book hint:', toast);
        if (!toast || found) fail('wrong book not rejected properly');
        if (SHOTS) await p.screenshot({ path: `shot-wrong.png` });
        await tapItem(id);
        await p.waitForTimeout(120);
      }
      await p.tap(`.book-btn[data-book="${right}"]`);
      await p.waitForSelector('#modal.lore:not([hidden])', { timeout: 4000 }).catch(() => fail(`no lore card for ${id}`));
      if (SHOTS && room === 0 && n === 0) await p.screenshot({ path: `shot-lore.png` });
      await p.tap('#modal-btn');
      await p.waitForTimeout(120);
    }
    await p.waitForSelector('#screen-result.active', { timeout: 4000 }).catch(() => fail(`room ${room} did not finish`));
    await p.waitForTimeout(700);
    const res = await p.evaluate(() => ({ t: document.getElementById('result-title').textContent, time: document.getElementById('result-time').textContent, stars: document.querySelectorAll('#result-stars .star.on').length }));
    console.log(`room ${room}:`, JSON.stringify(res));
    if (SHOTS) await p.screenshot({ path: `shot-result${room}.png` });
    await p.tap('#result-actions [data-act="next"]');
  }
  // Finale → collection
  await p.waitForSelector('#screen-story.active');
  if (SHOTS) await p.screenshot({ path: `shot-finale.png` });
  await p.tap('#story-actions [data-act="next"]');
  await p.waitForSelector('#screen-collection.active');
  const got = await p.$$eval('.col-item.got', (x) => x.length);
  console.log('collection items:', got);
  if (got !== 36) fail('collection incomplete');
  if (SHOTS) await p.screenshot({ path: `shot-collection.png`, fullPage: true });
  const sw2 = await p.evaluate(() => document.documentElement.scrollWidth);
  if (sw2 > (devices[DEV] || {}).viewport?.width + 1) fail('horizontal scroll ' + sw2);
  console.log(errs.length ? `FAILURES: ${errs.length}` : 'ALL PASSED');
  if (errs.length) process.exitCode = 1;
  await b.close();
})();
