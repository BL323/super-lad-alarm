# Super Lad Alarm

A mobile-first 2D side-scrolling platformer prototype built with **Phaser 3** and **Vite**. Plain JavaScript (ES modules), static build, no backend.

The full spec is in [initial-build-brief.md](initial-build-brief.md).

## Status

| Stage | State |
| --- | --- |
| 1. Scaffold | Done |
| 2. Player and feel | Done (plus touch buttons from stage 6, pulled forward) |
| 3. Level | Done: the full level, Dorchester to Parkstone |
| 4. Collectibles and score | Done |
| 5. Finish and flow | Not started |
| 6. Mobile | Partly done: touch buttons, multi-touch, safe-area offsets. Portrait overlay still to do |
| 7. Polish and ship | Not started |

## Requirements

- Node.js 24 or newer (see `.nvmrc`; `engines` in `package.json`)
- npm

## Running locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (default http://localhost:5173). The dev server also listens on your LAN address, so a phone on the same network can open it. Always use the dev server: Phaser loads assets over HTTP and will not work from `file://`.

## Building

```bash
npm run build     # validates levels, then outputs static files to dist/
npm run preview   # serves dist/ locally to check the build
```

Level tools:

```bash
npm run build:level       # regenerate public/assets/levels/level-01.json from scripts/build-level-01.mjs
npm run validate:levels   # check every level against the gap / step-up / hazard rules
```

The build uses a relative base (`./`), so `dist/` works from a site root or a subpath. Phaser is emitted as its own chunk (~320 KB gzipped).

## Deploying to Netlify

`netlify.toml` sets the build command, the `dist` publish directory, Node 24, and cache headers. Connect the repository in Netlify, or run `npx netlify deploy --prod --dir=dist` after a build.

## Project structure

```
index.html              page shell (viewport, safe-area meta)
vite.config.js          relative base, Phaser chunk
netlify.toml            Netlify build and headers
public/assets/levels/   Tiled JSON levels (level-01.json is generated, see below)
scripts/                level builder and validator (Node, no dependencies)
src/
  main.js               Phaser.Game config and scene list
  config.js             title, resolution, physics, movement and scoring tuning, text style
  assets.js             texture keys, frame layouts and animation names
  style.css             full-viewport, no-scroll, no-gesture page styles
  art/placeholders.js   code-generated placeholder textures
  art/animations.js     every animation, defined once and referenced by name
  art/pixelFont.js      3×5 pixel font for signs painted into textures
  art/bitmapFont.js     the same font as a Phaser bitmap font (HUD text)
  level/levels.js       level registry (id, map key, file, theme, next)
  level/LevelLoader.js  tilemap, collisions, bounds, parallax, decor, hazards; parses objects
  level/validateLevel.js difficulty rules, shared by the CLI script and a dev-only boot check
  scenes/               Boot, Menu, Game, UI (HUD overlay), Complete; keys.js holds scene keys
  entities/Player.js    movement, jump feel, animation state machine, die()/respawn()
  entities/Collectible.js collectible type registry and pickup pop
  systems/GameState.js  plain run state (score, pints, checkpoint)
  systems/Checkpoints.js railway-signal checkpoints
  systems/Input.js      keyboard + touch merged into one virtual input state
  systems/Audio.js      no-op sound wrapper (unlocks audio on first input)
  systems/Scaling.js    integer-scale frame sizing for Phaser FIT mode
  systems/device.js     touch-device detection
  ui/Hud.js             pint counter, score, bonus toast
  ui/TouchControls.js   on-screen left/right/jump buttons
  ui/safeArea.js        safe-area insets in game pixels
  ui/text.js            shared text helpers (system font, pixel font)
```

`Storage.js` arrives in stage 5, following section 4 of the brief.

## Testing flags

- `?touch` shows the on-screen buttons on a desktop browser (they only appear on touch devices otherwise).
- `?debug` (dev server only) shows physics bodies and a live readout of the player's state, velocity and floor contact.

## Tuning movement

All movement values live in `PLAYER` in `src/config.js`. Each player copies them to `player.stats`, so they can change at runtime; call `player.applyStats()` after changing the hitbox or fall speed. If you change gravity, jump velocity or run speed, update the jump-height and jump-distance comment in `config.js`, because the level rules (gap and step-up limits) come from them.

Measured in the stage 2 test strip: full speed in 0.23 s, stop in 0.15 s, full jump 47.5 px, tapped jump 21.5 px. Coyote time and jump buffering both work at ~60 ms and correctly reject presses over 100 ms late or early.

## Manual device checklist (for the project owner)

To be completed on real phones (it can't be tested here):

- [ ] Touch latency feels immediate on the left, right and jump buttons
- [ ] Holding a direction and tapping jump at the same time works
- [ ] Sliding a thumb from left to right switches direction without lifting
- [ ] iOS Safari: address bar showing or hiding never causes scrolling and never hides the buttons
- [ ] Buttons sit clear of the notch and home bar in both landscape orientations
- [ ] Rotation re-fits the canvas
- [ ] Frame rate stays smooth (60 fps) on a mid-range phone

## Levels

A level is a Tiled JSON map with:

- **Tile layers** `background` (no collision: canopy posts, river), `ground` (every tile collides) and `foreground` (drawn over the player: station canopy). They use the tileset `tiles`, which is the generated `tiles` texture (layout in `src/assets.js`).
- **Object layer `objects`:** `spawn`, two `checkpoint`s (property `station`), `collectible`s (property `type`: `pint` or `espresso`), `hazard`s (property `kind`: `glass` or `water`), a `zone` named `end-zone`, a `finish`, and optional `secret` rectangles (the foreground fades while the player is inside). Points for spawn, checkpoints and finish are at the player's feet.
- **Object layer `decor`:** `pub` (property `pub`, an id from `PUBS` in `src/assets.js`), `sign` (property `text`) and `easel`.

Maps are 12 rows (192 px) against a 180 px screen, so the loader shifts everything up 12 px. Only sky is cut off.

`level-01.json` is generated by `scripts/build-level-01.mjs`, which reads like a description of the level (`platform(0, 21)`, `carriage(30, 10)`, `pint(33, 7)`...). Edit that script and run `npm run build:level`. You can also edit the JSON in Tiled, but then stop running the builder for that level so it doesn't overwrite your edits.

**Adding a level:** create its JSON in `public/assets/levels/`, add an entry to `src/level/levels.js`, and set the previous level's `next` to its id. `npm run validate:levels` checks it.

**Validation rules** (from the jump numbers in `config.js`): gaps of at most 3 tiles, step-ups of at most 2 tiles going right, a safe tile at the same height either side of every glass hazard, one spawn, two checkpoints, one finish inside a flat `end-zone`. `npm run build` refuses to build if any level fails, and the dev build logs an error at boot.

## Swapping placeholder art

All placeholder textures are generated in `src/art/placeholders.js` under the keys in `src/assets.js` (`player`, `coin`, `spikes`, `checkpoint`, `finish`, `tiles`). To use real art, load an image or spritesheet under the same key in `BootScene.preload()`; the placeholder for that key is then skipped. Keep the frame layout in `src/assets.js` in step with the new sheet.

## Story and theme

Background story: [docs/story.md](docs/story.md). Naylor's "Lad Alarm Train Crawl" across Dorset. How it maps onto the v1 level (agreed with the project owner):

| Brief element | In the game |
| --- | --- |
| Start | Dorchester station, Brewhouse pub behind |
| Checkpoint 1 | Wool station, The Black Bear (angry locals in the windows, scenery only) |
| Checkpoint 2 | Wareham station, The Old Granary, then the river (easel floating in it, scenery) |
| `end-zone` (boss later) | Parkstone platform, where the Train Conductor will be fought |
| Finish | Parkstone, outside The Avocet |
| Platforms | Parked British carriages (roof-hopping); gaps between carriages are the jumps |
| Coin | Pint of stout (10 points) |
| Hazard | Broken glass on platforms and roofs; the river at Wareham |
| Bonus | One hidden espresso martini (50 points, not counted in the pint total) |

The game title stays **Super Lad Alarm**.

## Decisions

- **Phaser 3.90** (latest 3.x) rather than Phaser 4, as the brief requires Phaser 3.
- **Vite 8.** Phaser is split out with Rolldown's `output.codeSplitting` groups (Vite 8 replaces `manualChunks`).
- **Node 24.** It is the version installed locally and still an LTS line; `engines` is `>=24` so Node 26 LTS also works. Netlify builds with 24.
- **Integer scaling** is computed in *device* pixels: the `#game` frame is sized to the largest whole multiple of 320×180 that fits in physical pixels, then Phaser FIT fills that frame. Below 1× it falls back to plain FIT. Examples: 1920×1080 → 6×, 1280×720 → 4×, 844×390 → 2× (640×360 with letterboxing).
- **Placeholder text** uses the system monospace font at 8 px (16 px for titles). It is readable but soft when upscaled; a code-generated pixel font can replace it later without touching callers (`src/ui/text.js`).
- **Scene keys** live in `src/scenes/keys.js`; texture and animation keys in `src/assets.js`.
- **Phaser console banner** is disabled to keep the console clean.
- **Air control.** The brief gives only ground values, so the air has its own: `airAccel` 500 and `airDecel` 300 px/s². This gives slightly less control in the air and keeps momentum through a jump. Turning round uses the larger of acceleration and deceleration.
- **Touch buttons came early.** They were planned for stage 6 and were built in stage 2 because the game is mobile-first. Buttons are 36 game px at 2× scale (72 CSS px, above the brief's 64 px minimum). They grow when the canvas is drawn smaller and move in from safe-area insets. Each has an invisible hit area 12 px larger than the button. Left and right share a border, so a thumb can slide between them.
- **Keep the bottom corners clear.** The touch buttons cover roughly the bottom 42 game px at each side of the screen, which is where the ground runs. Spawn points, and anything the player must see at the very start and end of a level (where the camera stops scrolling), should sit at least ~100 px from the left edge and away from the bottom-right corner.
- **Jump presses are latched** from key and touch events, not polled, so a tap shorter than one frame is never lost.
- **Level authoring.** `level-01.json` is generated from a short Node script rather than drawn in Tiled, because no Tiled install is assumed and the script is easy to review. The output is standard Tiled JSON.
- **Level length and pacing.** 180 tiles (2,880 px, 9 screens). Start is Dorchester (cols 0–53), middle is Wool to the embankment (cols 54–123), end is Wareham to Parkstone (cols 124–179). The middle is about 3.5 screens, a little under the brief's 4–5, so the stations fit evenly. A non-stop run that never stops to collect takes about 23 s; a first-time player collecting pints will take longer.
- **Hazard placement.** The autopilot play test found two unfair spots, both now fixed: glass right where you land after dropping off a roof (removed), and a crate stair ending three tiles before a gap (moved two tiles earlier). Both had passed the validator's rules.
- **Hidden espresso martini.** It sits on a crate stair under the Wool station canopy. The canopy is drawn in front of the player and fades to 35% while you're underneath it.
- **Checkpoint triggers** are full screen height, so a checkpoint can't be jumped over.
- **Texture keys follow the theme:** `pint`, `espresso-martini`, `glass`, `checkpoint` (a railway signal), `finish` (a pub sign), `tiles`, `hills`, `easel`, `pub-<id>`, `sign-<text>`.
- **"The Old Granary".** `docs/story.md` spells it "Grainary"; the pub sign uses "Granary". Change `PUBS` in `src/assets.js` if that's wrong.
- **Collectibles.** The registry in `src/entities/Collectible.js` holds `pint` (10 points, counted as collected/total) and `espresso` (50 points, a bonus not in the total, with a pop-up "ESPRESSO MARTINI! +50"). To add a type, add an entry and its texture, then place objects with that `type`.
- **HUD text uses a pixel bitmap font** built at boot from the 3×5 font, drawn at 2× with a baked drop shadow. That's 10 game px tall (20 CSS px on a 640×360 phone), crisp at every integer scale, and legible over both sky and brick. The menu and other screens still use the system font until stage 5 or 7.
- **The HUD shows `SCORE n`** at top right and the pint icon with `collected/total` at top left. Both move in from safe-area insets. Picking up a pint bumps both numbers; the martini bumps the score.
- **Collected items stay collected** across deaths, and score and pints are never reduced.
