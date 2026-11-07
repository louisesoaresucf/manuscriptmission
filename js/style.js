// The art style for the whole game. 'classic' is the normal look; 'painted'
// and 'dark' are the two style samples, chosen with ?style=painted or
// ?style=dark, or with the picker on the cover of a sample build.
export const STYLES = ['classic', 'painted', 'dark'];

let current = 'classic';
try {
  const asked = new URLSearchParams(location.search).get('style');
  if (STYLES.includes(asked)) current = asked;
} catch { /* no query string */ }

export const style = () => current;

export function setStyle(s) {
  if (!STYLES.includes(s)) return;
  current = s;
  document.documentElement.dataset.style = s;
}

setStyle(current);
