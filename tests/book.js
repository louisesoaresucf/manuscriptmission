// Manuscript test: the codex opens, turns every page forward and back in
// both layouts (one page on a portrait phone, a two-page spread on a wide
// screen), and the finale and collection pages work.
// Usage (with a local server on port 8765):  node tests/book.js
const { chromium, devices } = require('playwright');

const BASE = process.env.BASE_URL || 'http://localhost:8765';

(async () => {
  const browser = await chromium.launch();
  const fails = [];
  const fail = (m) => { fails.push(m); console.log('FAIL', m); };

  for (const [name, opts, mode] of [
    ['phone (portrait)', { ...devices['iPhone 13'] }, 'single'],
    ['computer (wide)', { viewport: { width: 1280, height: 800 } }, 'spread'],
  ]) {
    const ctx = await browser.newContext(opts);
    const page = await ctx.newPage();
    page.on('pageerror', (e) => fail(`${name}: pageerror ${e.message}`));
    await page.goto(`${BASE}/index.html`, { waitUntil: 'load' });
    await page.waitForTimeout(600);
    const click = (sel) => (opts.hasTouch ? page.tap(sel) : page.click(sel));
    const info = () => page.evaluate(() => ({
      mode: document.getElementById('codex').classList.contains('spread') ? 'spread' : 'single',
      turned: window.__mm.book.turned,
      leaves: window.__mm.book.leaves.length,
      label: document.getElementById('book-next').textContent,
      prevHidden: document.getElementById('book-prev').hidden,
      opened: document.getElementById('codex').classList.contains('unclasp'),
      // The closed book offers one way in: the button, with no second prompt on the cover.
      prompts: [...document.querySelectorAll('#screen-book button:not([hidden]), #codex .cover-hint')].length,
    }));

    let s = await info();
    if (s.mode !== mode) fail(`${name}: expected ${mode} layout, got ${s.mode}`);
    if (s.label !== 'Open the manuscript' || !s.prevHidden) fail(`${name}: closed book shows the wrong controls`);
    if (s.prompts !== 1) fail(`${name}: closed book shows ${s.prompts} prompts to open it, expected 1`);

    // Open the cover and turn every page.
    await click('#book-next');
    await page.waitForTimeout(1000);
    s = await info();
    if (!s.opened || s.turned !== 1) fail(`${name}: cover did not open`);
    while (s.turned < s.leaves - 1) {
      await click('#book-next');
      await page.waitForTimeout(500);
      s = await info();
    }
    if (s.label !== 'Enter the library') fail(`${name}: last page button reads "${s.label}"`);

    // Turn back one page, then forward again.
    await click('#book-prev');
    await page.waitForTimeout(500);
    const back = await info();
    if (back.turned !== s.turned - 1) fail(`${name}: Back did not turn the page back`);
    await click('#book-next');
    await page.waitForTimeout(500);

    // Swipe left on the book turns forward (phone only).
    if (opts.hasTouch) {
      await click('#book-prev'); await page.waitForTimeout(500);
      const before = (await info()).turned;
      const box = await page.locator('#codex').boundingBox();
      const cdp = await ctx.newCDPSession(page);
      const y = box.y + box.height / 2;
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: box.x + box.width * 0.8, y }] });
      for (let k = 1; k <= 8; k++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: box.x + box.width * (0.8 - k * 0.07), y }] });
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await page.waitForTimeout(600);
      if ((await info()).turned !== before + 1) fail(`${name}: swipe did not turn the page`);
    }

    // Entering the library starts the first room.
    await click('#book-next');
    await page.waitForSelector('#screen-game.active', { timeout: 3000 }).catch(() => fail(`${name}: "Enter the library" did not start the game`));
    await page.waitForTimeout(300);
    if (await page.evaluate(() => !document.getElementById('modal').hidden)) await click('#modal-btn');
    await page.waitForTimeout(300);

    // Finale: mark everything found, reopen the manuscript.
    await page.evaluate(() => {
      for (const r of window.__mm.ROOMS) for (const it of r.items) window.__mm.state.found.add(it.id);
      window.__mm.finale();
    });
    await page.waitForTimeout(1600);
    s = await info();
    if (s.turned !== 1) fail(`${name}: finale did not open the manuscript`);
    const got = await page.$$eval('.col-item.got', (x) => x.length);
    if (got !== 36) fail(`${name}: collection shows ${got} of 36`);
    while (s.turned < s.leaves - 1) { await click('#book-next'); await page.waitForTimeout(450); s = await info(); }
    if (s.label !== 'Play again') fail(`${name}: finale ends with "${s.label}"`);
    // A visible collection item opens its lore card.
    const visible = await page.evaluate(() => {
      const leaves = window.__mm.book.leaves, i = window.__mm.book.turned;
      const faces = [leaves[i]?.querySelector('.front'), leaves[i - 1]?.querySelector('.back')];
      const b = faces.map((f) => f?.querySelector('.col-item.got')).find(Boolean);
      if (!b) return null;
      b.click();
      return b.dataset.id;
    });
    await page.waitForTimeout(300);
    const lore = await page.evaluate(() => !document.getElementById('modal').hidden && document.getElementById('modal-title').textContent);
    if (!visible || !lore) fail(`${name}: tapping a collection illustration did not open its lore card`);
    console.log(`${name}: ${mode} layout, ${s.leaves} leaves, lore card "${lore}" — done`);
    await ctx.close();
  }
  console.log(fails.length ? `FAILURES: ${fails.length}` : 'ALL PASSED');
  if (fails.length) process.exitCode = 1;
  await browser.close();
})();
