# Manuscript Mission

A mobile-friendly hidden-object game set in a medieval library.

A witch's spell has knocked every book off its shelves, and the creatures, elements and plants painted inside have escaped. Find each one and return it to the right manuscript:

| Illustration | Manuscript |
|---|---|
| Creatures (Griffin, Unicorn, Phoenix…) | **Bestiary** |
| Elements: Fire, Water, Earth and Sky | **Alchemy Codex** |
| Plants (Mandrake, Rose, Foxglove…) | **Herbarium** |

All the art is hand-coded SVG in the style of medieval illuminated manuscripts. In the rooms, each illustration is turned into a small 3D model: its painted shapes are given depth like an enamel relief, and its gold leaf catches the light. Tap one and it turns and reacts: wings flap, creatures roar, flames burn, the sun's rays pulse, plants sway. Each of the 36 illustrations comes with a short lore card based on real medieval bestiaries, herbals and books of the elements.

## How to play

1. Tap an illustration hidden in the library to pick it up. It glows gold.
2. Tap the book it belongs in, at the bottom of the screen (or at the side in landscape).
   - **Right book:** the illustration flies home and its lore card opens.
   - **Wrong book:** the book shakes and you get a gentle hint. There's no penalty.
3. Pinch or scroll to zoom, drag to look around, and double-tap empty space to zoom in or out.
4. Stuck? Tap the **quill** for a hint. It recharges after 30 seconds, and each hint adds 10 seconds to your star time.
5. Every minute the witch sends trouble, after a warning sound and message. In the Scriptorium her enchanted broom sweeps illustrations to new spots, in the Reading Hall her eagle-owl carries them off, and in the Tower Archive the witch herself moves them with her scepter. Only illustrations you haven't found yet are moved. Tap the villain in time to shoo it away and take 10 seconds off your star time.
6. Finish a room faster to earn more stars (1–3). You can't fail.

There are three rooms, each harder than the last: **The Scriptorium**, **The Reading Hall** and **The Tower Archive**. After the finale you can browse all the lore cards in the collection. Progress lasts only while the page is open.

## Run it locally

There is no build step. The game uses plain HTML, CSS and JavaScript modules, which need to be served over HTTP (opening the file directly won't work):

```bash
python3 -m http.server 8765
```

Then open http://localhost:8765. The art review page, with every illustration and its lore, is at http://localhost:8765/gallery.html.

## Publish on GitHub Pages

1. Merge this branch into `main`.
2. In the repository, go to **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, select `main` and `/ (root)`, and save.

The game will appear at `https://<your-username>.github.io/manuscriptmission/` after a minute or two. The empty `.nojekyll` file tells Pages to serve the files exactly as they are.

## Project layout

```
index.html            Screens: title, story, game, results, collection
gallery.html          Art review page listing all 36 illustrations
css/style.css         Parchment theme, layouts (portrait and landscape), animations
js/main.js            Screen flow: title → story → rooms → finale → collection
js/game.js            One room of play: selecting, placing, hints, timer, stars
js/scene.js           Builds a room's SVG and hit-tests taps
js/viewport.js        Pinch-zoom and pan with Pointer Events
js/audio.js           Sound effects and music, synthesised with the Web Audio API
js/music.js           The tune: an original estampie in the style of 14th-century Italian dances
js/interruptions.js   The broom, owl and witch who move illustrations every minute
js/three/*.js         3D models built from the drawings, the 3D layer, and tap reactions
vendor/three/         three.js r128 (MIT licence) for the 3D models
js/ui.js              Shared helpers: screens, messages, lore cards
js/data/items.js      The 36 illustrations: names, books and lore
js/data/rooms.js      The three rooms: scenery and where each item hides
js/art/*.js           The SVG drawings: creatures, elements, plants, scenery, book covers, villains, story panels
tests/playthrough.js  Automated playthrough on an emulated phone (Playwright)
```

### Changing the game

- **Lore text:** edit `js/data/items.js`.
- **Hiding places:** edit the `items` list for a room in `js/data/rooms.js`. Positions are in scene units; each room is 1600 × 1000.
- **Star times:** each room's `stars: [threeStarSeconds, twoStarSeconds]` in `js/data/rooms.js`.

## Testing

With the local server running, and Playwright installed (`npm i -D playwright`, then `npx playwright install chromium`):

```bash
node tests/playthrough.js "iPhone 13"
```

The test plays all three rooms with real touch taps. Along the way it checks that:
- dragging doesn't pick up an item and pinching zooms;
- the hint ring and its cooldown work;
- the wrong book is refused with a hint;
- every lore card opens, each room finishes, and all 36 items appear in the collection.

Add `shots` after the device name to also save screenshots.

A second test checks touch handling. It pinch-zooms and drags with real multi-touch events, then makes sure every illustration is still tappable. It also covers a lost "finger up" event and a slightly wobbly tap:

```bash
node tests/touch.js "iPhone 13"
```

A third test checks the interruptions. In every room it confirms that the warning arrives, tapping the villain shoos it away, a villain left alone moves only unfound illustrations, and moved illustrations can still be tapped:

```bash
node tests/villains.js "iPhone 13"
```

To test the flat 2D fallback used on devices without WebGL, run the playthrough with `FORCE_2D=1`.

## Music

The music is generated in the browser: a recorder-like flute, a harp, a drone and a frame drum in a long reverb. The melody in `js/music.js` is an original tune written in the style of a 14th-century Italian estampie, such as *La Rotta* from British Library Add MS 29987. To use the real public-domain *La Rotta* melody instead, replace `TUNE` with its notes. The file explains the format.

## Versions

The `control-v1` branch keeps the first released version (flat illustrations, cartoon witch) so you can compare it with later versions. On GitHub, open **Compare** and pick `control-v1` against `main` to see every change.
