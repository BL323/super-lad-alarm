# Super Lad Alarm

A mobile-first 2D side-scrolling platformer prototype built with **Phaser 3** and **Vite**. Plain JavaScript (ES modules), static build, no backend.

The full spec is in [initial-build-brief.md](initial-build-brief.md).

## Status

| Stage | State |
| --- | --- |
| 1. Scaffold | Done |
| 2. Player and feel | Done (plus touch buttons from stage 6, pulled forward) |
| 3. Level | Not started |
| 4. Collectibles and score | Not started |
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
npm run build     # outputs static files to dist/
npm run preview   # serves dist/ locally to check the build
```

The build uses a relative base (`./`), so `dist/` works from a site root or a subpath. Phaser is emitted as its own chunk (~320 KB gzipped).

## Deploying to Netlify

`netlify.toml` sets the build command, the `dist` publish directory, Node 24, and cache headers. Connect the repository in Netlify, or run `npx netlify deploy --prod --dir=dist` after a build.

## Project structure

```
index.html              page shell (viewport, safe-area meta)
vite.config.js          relative base, Phaser chunk
netlify.toml            Netlify build and headers
public/assets/levels/   Tiled JSON levels (from stage 3)
src/
  main.js               Phaser.Game config and scene list
  config.js             title, resolution, physics, movement and scoring tuning, text style
  assets.js             texture keys, frame layouts and animation names
  style.css             full-viewport, no-scroll, no-gesture page styles
  art/placeholders.js   code-generated placeholder textures
  art/animations.js     every animation, defined once and referenced by name
  scenes/               Boot, Menu, Game, UI (HUD overlay), Complete; keys.js holds scene keys
  entities/Player.js    movement, jump feel, animation state machine, die()/respawn()
  systems/Input.js      keyboard + touch merged into one virtual input state
  systems/Audio.js      no-op sound wrapper (unlocks audio on first input)
  systems/Scaling.js    integer-scale frame sizing for Phaser FIT mode
  systems/device.js     touch-device detection
  ui/TouchControls.js   on-screen left/right/jump buttons
  ui/safeArea.js        safe-area insets in game pixels
  ui/text.js            shared text helper
```

`level/`, `Collectible.js`, `GameState.js`, `Checkpoints.js` and `Storage.js` arrive in later stages, following section 4 of the brief.

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

## Swapping placeholder art

All placeholder textures are generated in `src/art/placeholders.js` under the keys in `src/assets.js` (`player`, `coin`, `spikes`, `checkpoint`, `finish`, `tiles`). To use real art, load an image or spritesheet under the same key in `BootScene.preload()`; the placeholder for that key is then skipped. Keep the frame layout in `src/assets.js` in step with the new sheet.

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
- **Platform hitboxes** match the 6 px plank art rather than the full 16 px tile.
