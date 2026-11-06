// The game's music: an atmospheric arrangement for recorder, harp and drone.
//
// The tune is an ORIGINAL melody written for this game in the style of a
// 14th-century Italian estampie (like La Rotta, from British Library
// Add MS 29987): Dorian mode, 6/8 time, paired phrases (puncta) with "open"
// (ouvert) and "closed" (clos) endings. To use the real public-domain La Rotta
// instead, replace TUNE with its notes in the same format.
//
// Notes are [degree, eighths]: degree 0 = D4 in D Dorian (D E F G A B C),
// 7 = D5, negative = below D4; null = rest.

export const TUNE = {
  bpm: 132, // eighth notes per minute: slow and spacious
  sections: [
    // Punctum I, played twice: open ending, then closed ending.
    {
      body: [[4, 2], [5, 1], [6, 2], [7, 1], [6, 3], [4, 3], [5, 2], [4, 1], [3, 2], [2, 1], [4, 6],
        [4, 2], [5, 1], [6, 2], [7, 1], [9, 3], [7, 3], [6, 2], [5, 1], [4, 2], [3, 1], [2, 3], [1, 3]],
      open: [[2, 2], [3, 1], [4, 3], [null, 6]],
      closed: [[1, 2], [2, 1], [0, 3], [null, 6]],
    },
    // Punctum II, played twice.
    {
      body: [[7, 3], [6, 3], [5, 2], [6, 1], [7, 3], [4, 2], [3, 1], [2, 2], [1, 1], [2, 3], [4, 3],
        [3, 2], [2, 1], [1, 2], [0, 1], [1, 3], [-1, 3]],
      open: [[0, 2], [1, 1], [2, 3], [null, 6]],
      closed: [[1, 2], [-1, 1], [0, 3], [null, 12]],
    },
  ],
};

const DORIAN = [0, 2, 3, 5, 7, 9, 10];
const D4 = 293.66;

export function freq(degree, octave = 0) {
  const o = Math.floor(degree / 7) + octave;
  const step = DORIAN[((degree % 7) + 7) % 7];
  return D4 * Math.pow(2, o + step / 12);
}

// Flatten the tune into [degree, eighths] with repeats and endings.
export function notesOf(tune) {
  const out = [];
  for (const s of tune.sections) {
    out.push(...s.body, ...s.open, ...s.body, ...s.closed);
  }
  return out;
}
