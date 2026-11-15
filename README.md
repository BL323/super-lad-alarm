# Super Lad Alarm

A mobile-first 2D side-scrolling platformer prototype built with **Phaser 3** and **Vite**. Plain JavaScript (ES modules), static build, no backend.

The full spec is in [initial-build-brief.md](initial-build-brief.md).

## Status

| Stage | State |
| --- | --- |
| 1. Scaffold | Done |
| 2. Player and feel | Not started |
| 3. Level | Not started |
| 4. Collectibles and score | Not started |
| 5. Finish and flow | Not started |
| 6. Mobile | Not started |
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
  scenes/               Boot, Menu, Game, UI (HUD overlay), Complete; keys.js holds scene keys
  systems/Scaling.js    integer-scale frame sizing for Phaser FIT mode
  ui/text.js            shared text helper and touch detection
```

Folders for `entities/`, `level/` and the remaining `systems/` modules are filled in during later stages, following section 4 of the brief.

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
