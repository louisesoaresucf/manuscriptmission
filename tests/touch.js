// Touch regression test: after pinch-zooming and dragging with real
// multi-touch events, every illustration must still be tappable.
// Usage (with a local server on port 8765):
//   node tests/touch.js "iPhone 13"      # or "Pixel 7"
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

  const cdp = await ctx.newCDPSession(page);
  const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', {
    type, touchPoints: pts.map(([x, y], i) => ({ x, y, id: i + 1 })),
  });
  const game = (fn, arg) => page.evaluate(fn, arg);

  await page.goto(`${BASE}/index.html`, { waitUntil: 'load' });
  await page.waitForTimeout(500);
  await game(() => { window.__mm.startRoom(0); });
  await page.waitForTimeout(300);
  await page.tap('#modal-btn');
  await page.waitForTimeout(300);

  const box = await game(() => {
    const r = document.getElementById('scene').getBoundingClientRect();
    return { x: r.left, y: r.top, w: r.width, h: r.height };
  });
  const cx = box.x + box.w / 2, cy = box.y + box.h / 2;
  const screenOf = (id) => game((id) => {
    const g = window.__mm.state.game, it = g.scene.items.get(id);
    return g.viewport.toScreen(it.x, it.y);
  }, id);
  const selected = () => game(() => window.__mm.state.game.selected);
  const deselect = () => game(() => window.__mm.state.game.deselect());

  // Drag with one finger so that `id` ends up in the middle of the screen.
  async function dragTo(id) {
    const s = await screenOf(id);
    const dx = box.w / 2 - s.x, dy = box.h / 2 - s.y;
    await touch('touchStart', [[cx, cy]]);
    for (let k = 1; k <= 12; k++) await touch('touchMove', [[cx + (dx * k) / 12, cy + (dy * k) / 12]]);
    await touch('touchEnd', []);
  }

  // 1. Pinch to zoom in with two real fingers.
  await touch('touchStart', [[cx - 30, cy], [cx + 30, cy]]);
  for (let k = 1; k <= 12; k++) await touch('touchMove', [[cx - 30 - k * 8, cy], [cx + 30 + k * 8, cy]]);
  await touch('touchEnd', []);
  const s1 = await game(() => window.__mm.state.game.viewport.s);
  const s0 = await game(() => window.__mm.state.game.viewport.minScale);
  console.log(`pinch zoom: ${s0.toFixed(2)} -> ${s1.toFixed(2)}`);
  if (s1 < s0 * 1.5) fail('pinch did not zoom in');

  // 2. While zoomed: drag each item into view, then tap it.
  for (const id of ['mountain', 'dragon', 'lily', 'pelican', 'cloud', 'rose']) {
    await dragTo(id);
    const s = await screenOf(id);
    await page.touchscreen.tap(box.x + s.x, box.y + s.y);
    await page.waitForTimeout(120);
    const sel = await selected();
    console.log(`zoomed tap ${id}: ${sel === id ? 'ok' : 'got ' + sel}`);
    if (sel !== id) fail(`zoomed tap on ${id}`);
    await deselect();
  }

  // 3. A finger whose "up" event the browser lost must not block later taps.
  await game(() => {
    const svg = document.getElementById('scene');
    svg.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 99, pointerType: 'touch', isPrimary: true, clientX: 10, clientY: 10, bubbles: true }));
  });
  await dragTo('unicorn');
  let s = await screenOf('unicorn');
  await page.touchscreen.tap(box.x + s.x, box.y + s.y);
  await page.waitForTimeout(120);
  if ((await selected()) !== 'unicorn') fail('tap after a lost pointer'); else console.log('tap after lost pointer: ok');
  await deselect();

  // 4. A quick tap with a 15px wobble still counts as a tap.
  await dragTo('sage');
  s = await screenOf('sage');
  const tx = box.x + s.x, ty = box.y + s.y;
  await touch('touchStart', [[tx, ty]]);
  await touch('touchMove', [[tx + 8, ty + 6]]);
  await touch('touchMove', [[tx + 15, ty + 4]]);
  await touch('touchEnd', []);
  await page.waitForTimeout(120);
  if ((await selected()) !== 'sage') fail('wobbly quick tap'); else console.log('wobbly quick tap: ok');
  await deselect();

  // 5. Zoom back out fully, then tap at the overview scale.
  await game(() => { const v = window.__mm.state.game.viewport; v.s = v.minScale; v.apply(); });
  await dragTo('candle-flame');
  s = await screenOf('candle-flame');
  await page.touchscreen.tap(box.x + s.x, box.y + s.y);
  await page.waitForTimeout(120);
  if ((await selected()) !== 'candle-flame') fail('tap at overview scale'); else console.log('tap at overview scale: ok');

  // 6. The page itself must not be zoomable inside a room.
  const meta = await page.$eval('meta[name="viewport"]', (m) => m.content);
  if (!/user-scalable=no/.test(meta)) fail('page zoom not locked in room');

  console.log(fails.length ? `FAILURES: ${fails.length}` : 'ALL PASSED');
  if (fails.length) process.exitCode = 1;
  await browser.close();
})();
