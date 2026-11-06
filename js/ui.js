// Small DOM helpers shared by the screens.
import { BOOKS } from './art/ornaments.js';
import { CATEGORY_BOOK } from './data/items.js';

const $ = (id) => document.getElementById(id);

export function showScreen(id) {
  for (const s of document.querySelectorAll('.screen')) s.classList.toggle('active', s.id === id);
  window.scrollTo(0, 0);
}

let toastTimer = null;
// pos: 'top' or 'bottom' of the scene, chosen to avoid covering the item.
export function toast(msg, ms = 2600, pos = 'top') {
  const el = $('toast');
  el.textContent = msg;
  el.classList.toggle('bottom', pos === 'bottom');
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), ms);
}
export function hideToast() {
  clearTimeout(toastTimer);
  $('toast').classList.remove('show');
}

export function fmtTime(sec) {
  const s = Math.max(0, Math.floor(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export function starsMarkup(n, total = 3) {
  let s = '';
  for (let i = 0; i < total; i++) {
    s += `<svg class="star ${i < n ? 'on' : 'off'}" viewBox="0 0 40 40" aria-hidden="true"><path d="M20,3 L25,15 L38,15.5 L28,24 L31.5,37 L20,29.5 L8.5,37 L12,24 L2,15.5 L15,15 Z"/></svg>`;
  }
  return `<span class="sr-only">${n} of ${total} stars</span>${s}`;
}

export function itemTag(item) {
  const book = BOOKS[CATEGORY_BOOK[item.category]].name;
  return item.element ? `${item.element} · ${book}` : book;
}

// One modal used for room introductions and lore cards.
// Resolves when the player presses the button.
export function modal({ art = '', tag = '', title, text, button = 'Continue', kind = '' }) {
  return new Promise((resolve) => {
    const m = $('modal');
    m.className = `modal ${kind}`;
    $('modal-art').innerHTML = art;
    $('modal-tag').textContent = tag;
    $('modal-title').textContent = title;
    $('modal-text').textContent = text;
    const btn = $('modal-btn');
    btn.textContent = button;
    m.hidden = false;
    requestAnimationFrame(() => m.classList.add('open'));
    const close = () => {
      btn.removeEventListener('click', close);
      m.classList.remove('open');
      m.hidden = true;
      resolve();
    };
    btn.addEventListener('click', close);
    btn.focus({ preventScroll: true });
  });
}

export function loreModal(item, button = 'Continue') {
  return modal({
    art: `<svg viewBox="0 0 100 100" aria-hidden="true"><use href="#item-${item.id}"/></svg>`,
    tag: itemTag(item),
    title: item.name,
    text: item.lore,
    button,
    kind: 'lore',
  });
}
