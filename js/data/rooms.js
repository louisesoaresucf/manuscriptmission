// The three library rooms. Each scene is 1600×1000 scene units.
// `back` is drawn under the hidden items, `front` over them (to half-hide a few).
import { P } from '../art/defs.js';
import * as S from '../art/scenery.js';

export const SCENE_W = 1600;
export const SCENE_H = 1000;

function scriptorium() {
  const r = S.rng(11);
  const back = `
    ${S.wall('url(#sc-stone-warm)', 760, 'url(#sc-tiles)')}
    ${S.archWindow(170, 130, 180, 420)}
    ${S.archWindow(1250, 130, 180, 420)}
    <path d="M190,560 L340,560 L560,1000 L260,1000 Z" fill="url(#sc-sunbeam)"/>
    ${S.banner(430, 40, 90, 280, P.vermilion, 'mm-diaper-blue')}
    ${S.bookcase(560, 140, 480, 600, 4, r, [[0, 300, 4], [1, 0, 2], [2, 220, 3], [3, 330, 3]])}
    ${S.lectern(1090, 500)}
    ${S.desk(190, 560)}
    ${S.floorClutter(r, 60, 1520, 790, 950, 16)}
    ${S.stool(500, 800, -75)}
    ${S.inkpot(560, 820, true)}
    ${S.bookPile(1240, 920, r, 3)}`;
  const front = `${S.page(600, 905, 18, P.lapis)}`;
  return { back, front };
}

function readingHall() {
  const r = S.rng(23);
  const back = `
    ${S.wall('url(#sc-stone-cool)', 780, 'url(#sc-tiles-blue)')}
    ${S.roseWindow(800, 250, 170)}
    ${S.column(470, 30, 760)}
    ${S.column(1070, 30, 760)}
    ${S.bookcase(40, 120, 380, 650, 4, r, [[0, 120, 5], [1, 180, 4], [2, 0, 2], [3, 60, 6]])}
    ${S.bookcase(1180, 120, 380, 650, 4, r, [[0, 0, 3], [1, 60, 6], [2, 200, 3], [3, 0, 7]])}
    ${S.rug(470, 810, 660, 150)}
    ${S.table(470, 612, 660)}
    ${S.closedBook(700, 586, 90, 26, 0, P.lapis)}
    ${S.openBook(1040, 596, 0, 0.7)}
    <path d="M745,600 C760,640 800,640 820,612" fill="none" stroke="${S.W.iron}" stroke-width="4" stroke-dasharray="7 4"/>
    ${S.floorClutter(r, 60, 1520, 820, 960, 18)}
    ${S.hourglass(1450, 940, 0.9)}`;
  const front = `
    ${S.bench(520, 724, 560)}
    ${S.bookPile(150, 950, r, 2)}`;
  return { back, front };
}

function towerArchive() {
  const r = S.rng(37);
  const back = `
    ${S.wall('url(#sc-stone-dark)', 800, 'url(#sc-flags)')}
    ${S.archWindow(1360, 170, 150, 360, true)}
    <g fill="#f7e08a"><circle cx="1395" cy="270" r="3"/><circle cx="1470" cy="380" r="2.5"/><circle cx="1410" cy="440" r="2"/></g>
    ${S.staircase(40, 740, 8, 170, 70)}
    ${S.bookcase(560, 200, 420, 600, 3, r, [[0, 200, 3], [1, 0, 3], [2, 220, 4]])}
    ${S.jar(620, 386, 90, P.verdigris)}${S.jar(690, 386, 66, P.vermilion)}${S.jar(760, 586, 80, P.lapisLight)}
    ${S.jar(930, 786, 70, P.ochre)}
    ${S.armillary(1150, 330, 70)}
    ${S.lantern(430, 210)}
    ${S.chest(1120, 650, 220, 150)}
    ${S.chest(1360, 700, 190, 110)}
    ${S.floorClutter(r, 40, 1540, 830, 960, 24)}
    ${S.hourglass(1000, 880, 0.8)}
    ${S.beam(60)}
    ${S.cobweb(0, 94, 160)}
    ${S.cobweb(1600, 94, 160, true)}
    <ellipse cx="800" cy="560" rx="700" ry="500" fill="url(#sc-candlelight)"/>`;
  const front = `
    ${S.scroll(590, 978, -6, 110)}
    ${S.closedBook(1100, 910, 90, 60, 25, P.vermilionDark)}
    <rect x="0" y="0" width="1600" height="1000" fill="url(#sc-vignette)"/>`;
  return { back, front };
}

// x, y = centre of the item in scene units; size = width/height; rot in degrees.
export const ROOMS = [
  {
    id: 'scriptorium',
    name: 'The Scriptorium',
    intro: 'Where the monks copy books by daylight. Twelve illustrations have escaped here!',
    done: 'The Scriptorium is restored! But the witch’s magic still swirls through the Reading Hall…',
    stars: [150, 300],
    scene: scriptorium,
    items: [
      { id: 'unicorn', x: 170, y: 868, size: 130, rot: 0 },
      { id: 'griffin', x: 930, y: 68, size: 110, rot: 0 },
      { id: 'dragon', x: 700, y: 222, size: 105, rot: 0 },
      { id: 'pelican', x: 1340, y: 500, size: 95, rot: 0 },
      { id: 'candle-flame', x: 300, y: 598, size: 85, rot: -6 },
      { id: 'water-droplet', x: 650, y: 880, size: 78, rot: 0 },
      { id: 'mountain', x: 900, y: 370, size: 100, rot: 0 },
      { id: 'cloud', x: 110, y: 80, size: 100, rot: 0 },
      { id: 'rose', x: 1500, y: 862, size: 110, rot: 5 },
      { id: 'lily', x: 1020, y: 850, size: 115, rot: 8 },
      { id: 'rosemary', x: 205, y: 555, size: 90, rot: 0 },
      { id: 'sage', x: 390, y: 900, size: 95, rot: -10 },
    ],
  },
  {
    id: 'reading-hall',
    name: 'The Reading Hall',
    intro: 'Long tables, chained books and a great rose window. Look carefully!',
    done: 'The Reading Hall is in order again! Only the Tower Archive remains, where the witch’s spell is strongest…',
    stars: [180, 360],
    scene: readingHall,
    items: [
      { id: 'phoenix', x: 230, y: 70, size: 90, rot: 0 },
      { id: 'basilisk', x: 730, y: 770, size: 85, rot: -10 },
      { id: 'siren', x: 1040, y: 888, size: 90, rot: 12 },
      { id: 'salamander', x: 930, y: 585, size: 80, rot: 0 },
      { id: 'sun', x: 800, y: 250, size: 105, rot: 0 },
      { id: 'wave', x: 300, y: 545, size: 82, rot: -15 },
      { id: 'gemstone', x: 1420, y: 220, size: 72, rot: 18 },
      { id: 'wind-face', x: 1125, y: 105, size: 85, rot: 0 },
      { id: 'mandrake', x: 150, y: 880, size: 95, rot: -15 },
      { id: 'lavender', x: 545, y: 570, size: 85, rot: 0 },
      { id: 'columbine', x: 1300, y: 545, size: 85, rot: -10 },
      { id: 'foxglove', x: 1505, y: 862, size: 100, rot: 12 },
    ],
  },
  {
    id: 'tower-archive',
    name: 'The Tower Archive',
    intro: 'High in the tower, by candlelight, the oldest books are kept. This is the trickiest room of all!',
    done: 'Every illustration is home at last, and the witch’s spell is broken!',
    stars: [210, 420],
    vignette: true,
    scene: towerArchive,
    items: [
      { id: 'manticore', x: 232, y: 428, size: 76, rot: 0 },
      { id: 'caladrius', x: 500, y: 30, size: 68, rot: 0 },
      { id: 'yale', x: 1290, y: 612, size: 72, rot: -8 },
      { id: 'amphisbaena', x: 712, y: 884, size: 72, rot: 18 },
      { id: 'lightning', x: 1435, y: 340, size: 72, rot: 12 },
      { id: 'fountain', x: 860, y: 522, size: 70, rot: 0 },
      { id: 'lodestone', x: 1085, y: 905, size: 62, rot: 0 },
      { id: 'star-moon', x: 690, y: 722, size: 68, rot: -25 },
      { id: 'hellebore', x: 870, y: 322, size: 70, rot: 10 },
      { id: 'mistletoe', x: 760, y: 128, size: 70, rot: 180 },
      { id: 'peony', x: 470, y: 880, size: 70, rot: -25 },
      { id: 'wormwood', x: 310, y: 216, size: 66, rot: 15 },
    ],
  },
];
