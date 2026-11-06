// Stops the browser from zooming or scrolling the *page* while a room is on
// screen. The game has its own pinch-zoom; if the page zooms as well (iPhone
// Safari allows this even when asked not to), screen and scene coordinates
// drift apart and taps stop landing on the illustrations.

let active = false;
const stop = (e) => { if (active) e.preventDefault(); };

// Safari-only pinch events.
for (const type of ['gesturestart', 'gesturechange', 'gestureend']) {
  document.addEventListener(type, stop, { passive: false });
}
// Two-finger moves anywhere, and any page scrolling, while in a room.
document.addEventListener('touchmove', (e) => {
  if (active && (e.touches.length > 1 || e.target.closest('.game-screen'))) e.preventDefault();
}, { passive: false });
document.addEventListener('dblclick', stop, { passive: false });

const meta = document.querySelector('meta[name="viewport"]');
const relaxed = meta.getAttribute('content');

export function lockPageZoom(on) {
  active = on;
  // Re-applying a maximum scale of 1 also resets any page zoom already applied.
  meta.setAttribute('content', on ? `${relaxed}, maximum-scale=1, user-scalable=no` : relaxed);
}
