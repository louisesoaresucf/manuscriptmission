// The manuscript: a leather-bound codex that opens and turns its pages.
// The story, the finale and the collection are all shown as its pages.
//
// Spread layout (landscape, computers): the open book shows two pages, a
// verso on the left and a recto on the right. Each leaf carries two pages
// (front = recto, back = verso) and turns around the spine.
// Single layout (portrait phones): one page at a time; a turned leaf swings
// away to the left.
import { audio } from './audio.js';

const $ = (id) => document.getElementById(id);

function coverMarkup() {
  return `
  <div class="cover-face">
    <div class="cover-tooling">
      <span class="boss tl"></span><span class="boss tr"></span><span class="boss bl"></span><span class="boss br"></span>
      <div class="cover-title">
        <svg class="cover-roundel" viewBox="0 0 100 100" aria-hidden="true"><use href="#book-roundel"/></svg>
        <h1>Manuscript Mission</h1>
        <p class="cover-sub">The Escaped Illuminations</p>
      </div>
    </div>
    <span class="clasp c1"></span><span class="clasp c2"></span>
  </div>`;
}

const endpaper = () => '<div class="page endpaper"></div>';

export class Book {
  constructor() {
    this.el = $('codex');
    this.next = $('book-next');
    this.prev = $('book-prev');
    this.leaves = [];
    this.turned = 0;
    this.pages = [];
    this.onDone = null;
    this.lastLabel = 'Enter the library';

    this.next.addEventListener('click', () => this.forward());
    this.prev.addEventListener('click', () => this.back());
    // Swipe or tap on the book itself: right half forward, left half back.
    let start = null;
    this.el.addEventListener('pointerdown', (e) => { start = { x: e.clientX, y: e.clientY, t: performance.now() }; });
    this.el.addEventListener('pointerup', (e) => {
      if (!start || e.target.closest('button')) { start = null; return; }
      const dx = e.clientX - start.x, dy = e.clientY - start.y;
      start = null;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) { dx < 0 ? this.forward() : this.back(); return; }
      if (Math.hypot(dx, dy) < 12) {
        const r = this.el.getBoundingClientRect();
        if (this.turned === 0 || e.clientX > r.left + r.width / 2) this.forward(); else this.back();
      }
    });
    document.addEventListener('keydown', (e) => {
      if (!$('screen-book').classList.contains('active') || !document.getElementById('modal').hidden) return;
      if (e.key === 'ArrowRight') this.forward();
      if (e.key === 'ArrowLeft') this.back();
    });
    let pending = null;
    window.addEventListener('resize', () => {
      clearTimeout(pending);
      pending = setTimeout(() => { if (this.pages.length) this.layout(true); }, 150);
    });
  }

  get spread() {
    return window.innerWidth > window.innerHeight * 1.05 && window.innerWidth >= 640;
  }

  // pages: list of { left, right, single } HTML strings (see storyPages, etc.)
  // or plain { html } pages that are the same in both layouts.
  open(pages, { onDone, lastLabel = 'Enter the library', autoOpen = false } = {}) {
    this.pages = pages;
    this.onDone = onDone;
    this.lastLabel = lastLabel;
    this.turned = 0;
    this.layout(false);
    if (autoOpen) setTimeout(() => this.forward(), 650);
  }

  // Build the leaves for the current layout, keeping the reader's place.
  layout(keepPlace) {
    const spread = this.spread;
    const place = keepPlace ? this.view : 0;
    this.mode = spread ? 'spread' : 'single';
    const sheets = [];
    if (spread) {
      const faces = [];
      for (const p of this.pages) {
        if (p.html) faces.push(p.html);
        else faces.push(p.left, p.right);
      }
      // Leaf 0: cover / first verso; leaf k: recto / next verso.
      sheets.push({ front: coverMarkup(), back: faces[0] || endpaper(), cover: true });
      for (let i = 1; i < faces.length; i += 2) sheets.push({ front: faces[i], back: faces[i + 1] || endpaper() });
    } else {
      sheets.push({ front: coverMarkup(), back: endpaper(), cover: true });
      for (const p of this.pages) sheets.push({ front: p.html || p.single, back: endpaper() });
    }
    this.el.className = `codex ${this.mode}`;
    this.el.parentElement.classList.toggle('single', this.mode === 'single');
    this.el.innerHTML = sheets.map((s, i) => `
      <div class="leaf${s.cover ? ' cover' : ''}" data-i="${i}" style="z-index:${sheets.length - i}">
        <div class="face front">${s.front}</div>
        <div class="face back">${s.back}</div>
      </div>`).join('');
    this.leaves = [...this.el.querySelectorAll('.leaf')];
    this.numberFolios();
    this.size();
    this.turned = 0;
    for (let i = 0; i < Math.min(place, this.leaves.length - 1); i++) this.turn(i, true, true);
    this.update();
  }

  // Medieval foliation: each leaf is a folio, recto (r) and verso (v).
  numberFolios() {
    this.leaves.forEach((leaf, i) => {
      if (i === 0) return;
      const f = leaf.querySelector('.front .page'), b = leaf.querySelector('.back .page');
      if (f && !f.classList.contains('endpaper')) f.insertAdjacentHTML('beforeend', `<span class="folio">fol. ${i}r</span>`);
      if (b && !b.classList.contains('endpaper') && this.mode === 'spread') b.insertAdjacentHTML('beforeend', `<span class="folio verso">fol. ${i}v</span>`);
    });
  }

  // Page size: as large as fits, keeping a manuscript's proportions.
  size() {
    const ratio = 0.7;
    const maxH = window.innerHeight - 120;
    const maxW = (window.innerWidth - 32) / (this.mode === 'spread' ? 2 : 1);
    let pw = Math.min(maxW, maxH * ratio, 520);
    const ph = pw / ratio;
    this.el.style.setProperty('--pw', `${pw}px`);
    this.el.style.setProperty('--ph', `${ph}px`);
  }

  get view() {
    return this.turned;
  }

  turn(i, forward, instant = false) {
    const leaf = this.leaves[i];
    if (!leaf) return;
    leaf.classList.toggle('instant', instant);
    leaf.classList.toggle('turned', forward);
    leaf.style.zIndex = forward ? 100 + i : this.leaves.length - i;
    if (!instant) {
      leaf.classList.remove('turning');
      void leaf.offsetWidth;
      leaf.classList.add('turning');
    }
    if (i === 0) this.el.classList.toggle('opened', forward);
  }

  forward() {
    if (this.busy) return;
    if (this.turned >= this.leaves.length - 1) { this.onDone?.(); return; }
    audio.unlock();
    audio.page();
    this.busy = true;
    if (this.turned === 0) { this.el.classList.add('unclasp'); this.onOpen?.(); }
    this.turn(this.turned, true);
    this.turned++;
    this.update();
    setTimeout(() => { this.busy = false; }, 420);
  }

  back() {
    if (this.busy || this.turned === 0) return;
    audio.page();
    this.busy = true;
    this.turned--;
    this.turn(this.turned, false);
    if (this.turned === 0) this.el.classList.remove('unclasp');
    this.update();
    setTimeout(() => { this.busy = false; }, 420);
  }

  update() {
    const last = this.turned >= this.leaves.length - 1;
    this.prev.hidden = this.turned === 0;
    this.next.textContent = this.turned === 0 ? 'Open the manuscript' : last ? this.lastLabel : 'Turn the page';
    this.next.classList.toggle('btn-final', last);
    this.leaves.forEach((leaf, i) => leaf.classList.toggle('current', i === this.turned));
  }
}

// ---------- page builders ----------

// A story card: an illumination and a passage of text with a rubric.
export function storyPage({ art, label, title, text }) {
  const illumination = `<figure class="illumination"><svg viewBox="0 0 400 260" role="img" aria-label="${label}">${art}</svg></figure>`;
  const [first, ...rest] = text;
  const passage = `<h2 class="rubric">${title}</h2><p class="incipit"><span class="initial">${first}</span>${rest.join('')}</p>`;
  return {
    left: `<div class="page verso art-page">${illumination}<div class="vine"></div></div>`,
    right: `<div class="page recto text-page">${passage}<div class="vine"></div></div>`,
    single: `<div class="page recto">${illumination}${passage}</div>`,
  };
}

// A page of the collection: a chapter heading and up to six illustrations.
export function collectionPage(title, items, found, part, parts) {
  const cells = items.map((it) => {
    const got = found.has(it.id);
    return `<button class="col-item ${got ? 'got' : 'missing'}" type="button" data-id="${it.id}" ${got ? '' : 'aria-disabled="true"'}>
      <svg viewBox="0 0 100 100" aria-hidden="true"><use href="#item-${it.id}"/></svg>
      <span>${got ? it.name : '?'}</span>
    </button>`;
  }).join('');
  return { html: `<div class="page collection-page"><h2 class="rubric">${title}${parts > 1 ? ` <span class="part">${part} of ${parts}</span>` : ''}</h2><div class="collection-grid">${cells}</div></div>` };
}
