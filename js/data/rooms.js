// The three library rooms. Each scene is 1600×1000 scene units.
// `back` is drawn under the hidden items, `front` over them (to half-hide a few).
import { P } from '../art/defs.js';
import * as S from '../art/scenery.js';
import * as ST from '../art/styles.js';

export const SCENE_W = 1600;
export const SCENE_H = 1000;

function scriptorium(look = 'classic') {
  const r = S.rng(11);
  if (look === 'painted') return paintedScriptorium(r);
  if (look === 'dark') return darkScriptorium(r);
  const back = `
    ${S.wall('url(#sc-stone-warm)', 760, 'url(#sc-tiles)')}
    ${S.vault(150, 200, 100)}
    ${S.archWindow(170, 130, 180, 420)}
    ${S.archWindow(1250, 130, 180, 420)}
    <path d="M190,560 L340,560 L560,1000 L260,1000 Z" fill="url(#sc-glassbeam)"/>
    <path d="M1270,560 L1420,560 L1300,1000 L1040,1000 Z" fill="url(#sc-glassbeam)"/>
    ${S.banner(430, 40, 90, 280, P.vermilion, 'mm-diaper-blue')}
    ${S.banner(1115, 40, 90, 260, P.lapis, 'mm-diaper-red')}
    ${S.bookcase(560, 140, 480, 600, 4, r, [[0, 300, 4], [1, 0, 2], [2, 220, 3], [3, 330, 3]])}
    ${S.lectern(1090, 500)}
    ${S.desk(190, 560)}
    ${S.lightPool(420, 900, 180, 48, '#fff1c8', 0.32)}
    ${S.lightPool(1170, 900, 180, 48, '#fff1c8', 0.28)}
    ${S.floorClutter(r, 60, 1520, 790, 950, 16)}
    ${S.stool(500, 800, -75)}
    ${S.inkpot(560, 820, true)}
    ${S.bookPile(1240, 920, r, 3)}
    <rect x="0" y="0" width="1600" height="1000" fill="url(#sc-ceiling-shadow)"/>
    ${S.spellWisp('M60,720 C280,560 520,760 760,620 S1200,540 1540,690')}
    ${S.spellMotes(r, 28, 40, 1560, 170, 760)}`;
  const front = `${S.page(600, 905, 18, P.lapis)}${S.pageBorder(S.rng(5))}`;
  return { back, front };
}

// Style sample: the Scriptorium as a miniature in a Book of Hours. No cast
// light or shadow; a diapered gold-and-blue backdrop and a tiled floor.
function paintedScriptorium(r) {
  const back = `
    ${S.wall('url(#pt-diaper)', 760, 'url(#pt-chequer)')}
    ${S.vault(150, 200, 100)}
    ${S.archWindow(170, 130, 180, 420)}
    ${S.archWindow(1250, 130, 180, 420)}
    ${S.banner(430, 40, 90, 280, P.vermilion, 'mm-diaper-red')}
    ${S.banner(1115, 40, 90, 260, P.lapis, 'mm-diaper-blue')}
    ${S.bookcase(560, 140, 480, 600, 4, r, [[0, 300, 4], [1, 0, 2], [2, 220, 3], [3, 330, 3]])}
    ${S.lectern(1090, 500)}
    ${S.desk(190, 560)}
    ${S.floorClutter(r, 60, 1520, 790, 950, 16)}
    ${S.stool(500, 800, -75)}
    ${S.inkpot(560, 820, true)}
    ${S.bookPile(1240, 920, r, 3)}
    ${S.spellWisp('M60,720 C280,560 520,760 760,620 S1200,540 1540,690', '#c53a2a')}`;
  const front = `${S.page(600, 905, 18, P.lapis)}${ST.paintedBorder()}`;
  return { back, front };
}

// Style sample: the Scriptorium at night, rough and neglected, lit by torches.
const DARK_TORCHES = [[475, 440], [1160, 440]];
function darkScriptorium(r) {
  const back = `
    ${S.wall('url(#dk-stone)', 760, 'url(#dk-flags)')}
    ${S.vault(150, 200, 100)}
    ${S.archWindow(170, 130, 180, 420, true)}
    ${S.archWindow(1250, 130, 180, 420, true)}
    <path d="M190,560 L340,560 L520,1000 L240,1000 Z" fill="url(#dk-moonbeam)"/>
    <path d="M1270,560 L1420,560 L1320,1000 L1060,1000 Z" fill="url(#dk-moonbeam)"/>
    ${ST.tatteredBanner(430, 40, 90, 280, '#5a1a14', '#8a6a2a')}
    ${ST.tatteredBanner(1115, 40, 90, 260, '#1a2448', '#8a6a2a')}
    ${S.bookcase(560, 140, 480, 600, 4, r, [[0, 300, 4], [1, 0, 2], [2, 220, 3], [3, 330, 3]])}
    ${S.lectern(1090, 500)}
    ${S.desk(190, 560)}
    ${S.floorClutter(r, 60, 1520, 790, 950, 16)}
    ${S.stool(500, 800, -75)}
    ${S.inkpot(560, 820, true)}
    ${S.bookPile(1240, 920, r, 3)}
    ${S.cobweb(24, 24, 170)}${S.cobweb(1576, 24, 170, true)}${S.cobweb(560, 140, 90)}${S.cobweb(1040, 140, 90, true)}${S.cobweb(24, 750, 110, false, true)}
    <rect x="0" y="0" width="1600" height="1000" fill="url(#sc-ceiling-shadow)"/>
    ${S.spellWisp('M60,720 C280,560 520,760 760,620 S1200,540 1540,690', '#8ef0b8')}`;
  const front = `
    ${DARK_TORCHES.map(([x, y], i) => ST.darkTorch(x, y, i * 0.5)).join('')}
    ${ST.darkAtmosphere([...DARK_TORCHES.map(([x, y]) => [x, y - 40, 260]), [300, 560, 150]])}
    ${S.page(600, 905, 18, '#1a2448')}
    <rect x="0" y="0" width="1600" height="1000" fill="url(#sc-vignette)"/>`;
  return { back, front };
}

function readingHall() {
  const r = S.rng(23);
  const back = `
    ${S.wall('url(#sc-stone-cool)', 780, 'url(#sc-tiles-blue)')}
    ${S.vault(120, 200, 95)}
    ${S.roseWindow(800, 250, 170)}
    ${S.column(470, 30, 760)}
    ${S.column(1070, 30, 760)}
    ${S.torch(610, 470)}
    ${S.torch(990, 470)}
    ${S.bookcase(40, 120, 380, 650, 4, r, [[0, 120, 5], [1, 180, 4], [2, 0, 2], [3, 60, 6]])}
    ${S.bookcase(1180, 120, 380, 650, 4, r, [[0, 0, 3], [1, 60, 6], [2, 200, 3], [3, 0, 7]])}
    ${S.rug(470, 810, 660, 150)}
    ${S.lightPool(800, 885, 330, 70, '#b8322a', 0.16)}
    ${S.lightPool(690, 905, 150, 40, '#2b4fa8', 0.22)}
    ${S.lightPool(930, 900, 150, 40, '#e8c35a', 0.25)}
    ${S.table(470, 612, 660)}
    ${S.closedBook(700, 586, 90, 26, 0, P.lapis)}
    ${S.openBook(1040, 596, 0, 0.7)}
    <path d="M745,600 C760,640 800,640 820,612" fill="none" stroke="${S.W.iron}" stroke-width="4" stroke-dasharray="7 4"/>
    ${S.floorClutter(r, 60, 1520, 820, 960, 18)}
    ${S.hourglass(1450, 940, 0.9)}
    <rect x="0" y="0" width="1600" height="1000" fill="url(#sc-ceiling-shadow)"/>
    ${S.spellWisp('M440,140 C560,60 700,180 640,300 S780,520 980,420 S1160,200 1150,120', '#8ef0b8')}
    ${S.spellMotes(r, 30, 40, 1560, 140, 780)}`;
  const front = `
    ${S.bench(520, 724, 560)}
    ${S.bookPile(150, 950, r, 2)}
    ${S.pageBorder(S.rng(6))}`;
  return { back, front };
}

function towerArchive() {
  const r = S.rng(37);
  const back = `
    ${S.wall('url(#sc-stone-dark)', 800, 'url(#sc-flags)')}
    ${S.vault(150, 200, 100)}
    ${S.archWindow(1360, 170, 150, 360, true)}
    <g fill="#f7e08a"><circle cx="1395" cy="270" r="3"/><circle cx="1470" cy="380" r="2.5"/><circle cx="1410" cy="440" r="2"/></g>
    <rect x="0" y="0" width="1600" height="1000" fill="#0e0818" opacity="0.4"/>
    ${S.towerDoor(320, 250, 104, 136)}
    ${S.staircase(40, 740, 8, 170, 70)}
    <rect x="0" y="0" width="1600" height="1000" fill="#0e0818" opacity="0.18"/>
    ${S.torch(490, 470)}
    ${S.torch(1290, 330)}
    ${S.bookcase(560, 200, 420, 600, 3, r, [[0, 200, 3], [1, 0, 3], [2, 220, 4]])}
    ${S.jar(620, 386, 90, P.verdigris)}${S.jar(690, 386, 66, P.vermilion)}${S.jar(760, 586, 80, P.lapisLight)}
    ${S.jar(930, 786, 70, P.ochre)}
    ${S.armillary(1150, 330, 70)}
    ${S.lantern(430, 210)}
    ${S.chest(1120, 650, 220, 150)}
    ${S.chest(1360, 700, 190, 110)}
    ${S.arcaneCircle(800, 905, 320, 58)}
    ${S.floorClutter(r, 40, 1540, 830, 960, 24)}
    ${S.hourglass(1000, 880, 0.8)}
    ${S.beam(60)}
    ${S.cobweb(0, 94, 160)}
    ${S.cobweb(1600, 94, 160, true)}
    <ellipse cx="800" cy="560" rx="700" ry="500" fill="url(#sc-candlelight)"/>
    ${S.spellWisp('M120,640 C300,520 420,700 640,560 S980,380 1100,520 S1320,700 1520,560')}
    ${S.spellWisp('M700,880 C760,760 860,760 900,860', '#8ef0b8')}
    ${S.spellMotes(r, 40, 40, 1560, 120, 980)}`;
  const front = `
    ${S.scroll(590, 978, -6, 110)}
    ${S.closedBook(1100, 910, 90, 60, 25, P.vermilionDark)}
    <rect x="0" y="0" width="1600" height="1000" fill="url(#sc-vignette)"/>
    ${S.pageBorder(S.rng(7))}`;
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
    villain: 'broom',
    // Realistic light for the pre-rendered room (see js/realism.js).
    realism: {
      floorY: 760,
      lights: [[260, 360, 420, '255,243,208', 0.32], [1340, 360, 420, '255,243,208', 0.3], [800, 500, 700, '255,236,200', 0.12]],
      shafts: [[[[195, 560], [345, 560], [560, 1000], [255, 1000]]], [[[1255, 560], [1425, 560], [1310, 1000], [1040, 1000]]]],
      vignette: 0.45,
    },
    // Light for the dark style sample: torches, the desk candle, the moon.
    darkRealism: {
      floorY: 760,
      lights: [[475, 400, 520, '255,150,60', 0.6], [1160, 400, 520, '255,150,60', 0.55], [300, 580, 240, '255,170,80', 0.5], [260, 360, 300, '150,175,255', 0.3], [1340, 360, 300, '150,175,255', 0.28], [800, 900, 600, '255,140,60', 0.15]],
      shafts: [],
      vignette: 0.9,
    },
    scene: scriptorium,
    // Other places where escaped illustrations can end up when moved.
    spots: [
      [300, 870], [520, 935], [790, 875], [890, 945], [1180, 860], [1390, 905],
      [640, 380], [960, 520], [700, 680], [830, 230], [1150, 540], [285, 560],
      [1400, 560], [1260, 300],
    ],
    items: [
      { id: 'unicorn', x: 170, y: 868, size: 130, rot: 0 },
      { id: 'griffin', x: 930, y: 68, size: 110, rot: 0 },
      { id: 'dragon', x: 700, y: 222, size: 105, rot: 0 },
      { id: 'pelican', x: 1340, y: 500, size: 95, rot: 0 },
      { id: 'candle-flame', x: 300, y: 598, size: 85, rot: -6 },
      { id: 'water-droplet', x: 650, y: 880, size: 78, rot: 0 },
      { id: 'mountain', x: 900, y: 370, size: 100, rot: 0 },
      { id: 'cloud', x: 92, y: 330, size: 100, rot: 0 },
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
    villain: 'owl',
    realism: {
      floorY: 780,
      lights: [[800, 250, 480, '255,233,190', 0.28], [610, 430, 300, '255,176,80', 0.4], [990, 430, 300, '255,176,80', 0.4]],
      shafts: [[[[690, 400], [910, 400], [1060, 1000], [560, 1000]], '255,226,190', 0.2]],
      vignette: 0.5,
    },
    scene: readingHall,
    spots: [
      [300, 885], [600, 905], [880, 925], [1250, 885], [1390, 945], [650, 580],
      [820, 580], [280, 240], [200, 400], [320, 725], [1300, 240], [1440, 400],
      [1260, 725], [1370, 70],
    ],
    items: [
      { id: 'phoenix', x: 230, y: 70, size: 90, rot: 0 },
      { id: 'basilisk', x: 745, y: 868, size: 85, rot: -6 },
      { id: 'siren', x: 1040, y: 888, size: 90, rot: 12 },
      { id: 'salamander', x: 930, y: 585, size: 80, rot: 0 },
      { id: 'sun', x: 1185, y: 880, size: 100, rot: -8 },
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
    villain: 'witch',
    realism: {
      floorY: 800,
      lights: [[490, 420, 360, '255,150,60', 0.5], [1290, 280, 320, '255,150,60', 0.45], [320, 240, 170, '255,190,90', 0.45], [1435, 350, 260, '160,180,255', 0.22], [800, 905, 380, '181,140,240', 0.25]],
      shafts: [[[[1372, 540], [1508, 540], [1290, 1000], [1110, 1000]], '170,190,255', 0.16]],
      vignette: 0.6,
    },
    scene: towerArchive,
    spots: [
      [300, 905], [560, 885], [860, 935], [1250, 905], [1480, 925], [150, 575],
      [240, 365], [650, 520], [700, 330], [930, 700], [1460, 680], [1440, 560],
      [980, 40], [1230, 620],
    ],
    items: [
      { id: 'manticore', x: 232, y: 428, size: 76, rot: 0 },
      { id: 'caladrius', x: 500, y: 42, size: 68, rot: 0 },
      { id: 'yale', x: 1290, y: 612, size: 72, rot: -8 },
      { id: 'amphisbaena', x: 712, y: 884, size: 72, rot: 18 },
      { id: 'lightning', x: 1195, y: 545, size: 80, rot: 8 },
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
