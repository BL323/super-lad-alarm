# Build Brief: 2D Platformer (Phaser 3 + Vite)

Working title: Super Lad Alarm · Nov 15, 2026

## 1. Purpose and approach

Build one complete, playable 2D side-scrolling platform level that runs in a web browser from a public URL, with nothing to install. It is a prototype that must be easy to extend: the theme and the player character are deliberately generic placeholders.

**Primary platform: mobile.** The working title is **Super Lad Alarm**, and the game is aimed first at phones played in landscape. Design, tune and test for a phone first. Desktop keyboard play must also work, but wherever the two conflict, the phone wins: touch control size and comfort, readable text and HUD at small screen sizes, and a smooth frame rate on a mid-range device all take priority.

How to work:

- Read this whole brief before writing code. Section 2 lists decisions already made; use them rather than asking.
- Build in the stages in section 11. After each stage, run the game and check that it works before moving on.
- Build the smallest complete playable version first, and add nothing outside this brief.
- Keep the code modular: player, level, collectible and UI code live in separate modules.
- Where the brief is silent, pick the simplest sensible option and record it in the README under "Decisions".
- Do not copy characters, sprites, names or level layouts from existing games. "Inspired by classic 16-bit platformers" refers to mechanics and feel only.

## 2. Locked decisions and defaults

These resolve the gaps in the original brief. Treat them as fixed unless the project owner changes them.

| Topic | Decision |
| --- | --- |
| Game title | Working title "Super Lad Alarm", held in one config constant so it can be renamed |
| Base resolution | 320×180 logical pixels (16:9), 16×16 px tiles, crisp pixel rendering with no smoothing |
| Scaling | Phaser FIT mode, centred with letterboxing, integer scale where space allows |
| Physics | Phaser Arcade Physics, one shared gravity value in config |
| Level format | Tiled-style JSON tilemap loaded with Phaser's tilemap loader; an object layer holds spawn, checkpoints, collectibles, hazards, end zone and finish |
| Level length | About 2–3 minutes for a first-time player; 8–10 screen widths (roughly 2,500–3,200 px), one screen tall |
| Hazards | Spikes and gaps. Touching a spike or falling out of the world respawns the player |
| Respawn | At the last checkpoint, or the start if none. Score and collected coins are kept |
| Checkpoints | Two mid-level flags, activated by touch, with a visible state change |
| Health and lives | None in v1, with unlimited retries. All deaths go through one `die()` function so health can be added later |
| Scoring | Coin = 10 points, plus a 100-point completion bonus. Score and coin count are therefore different numbers |
| Feedback | Visual only in v1. An `Audio.play(key)` wrapper exists, does nothing without assets, and is called at pickup, jump, death and finish |
| Persistence | Best score only, in `localStorage`, wrapped in try/catch so failures are ignored. No other saved progress |
| Pause | Pause button on touch, P or Esc on keyboard. Pauses physics and input |
| Orientation | Landscape first. Portrait shows a "rotate your device" overlay and pauses the game |
| Hosting | Static build (`vite build` outputs `dist/`). Netlify is the default target; self-hosting config is an optional extra (section 3) |

## 3. Tech stack, tooling and hosting

The game is frontend code only: no backend is needed for any v1 feature.

**Stack**

- Phaser 3 (latest stable 3.x), plain JavaScript with ES modules. No TypeScript and no other game framework.
- HTML5, CSS and Vite. Runtime dependency: `phaser`. Dev dependency: `vite`. Add nothing else without a clear reason.
- Current Node LTS. State the version in `package.json` (`engines`) and the README.
- npm scripts: `dev` (Vite dev server), `build` (`vite build`), `preview` (serve the built `dist/`).
- Phaser loads images and level JSON over HTTP, so local work uses the Vite dev server, never `file://`.

**Build output**

- `vite build` produces static files in `dist/` with fingerprinted asset names.
- Set `base: './'` so the build works from the site root or a subpath.
- Put Phaser in its own chunk. Aim for under 1 MB total transfer, gzipped.

**Browsers**

Latest two versions of Chrome, Edge, Firefox and Safari, including Safari on iOS and Chrome on Android.

**Hosting**

- **Main target, Netlify.** Add `netlify.toml` with the build command, `dist` as the publish directory and the Node version. Add a `vercel.json` only if it is trivial.
- **Optional self-hosting.** Add a multi-stage `Dockerfile` (Node build, then nginx serving `dist/`) and an `nginx.conf` with gzip, long immutable caching for fingerprinted files and no caching for `index.html`. This is an extra and must not block the core game.
- **No Node server in v1.** If an API is needed later (leaderboards, cloud saves), add a `server/` folder beside the client then. Do not build it now.

## 4. Project structure

Use this layout. Player, level, collectible and UI code stay in separate modules, and all tunable numbers live in `config.js`.

```
/
├─ index.html
├─ package.json
├─ vite.config.js
├─ netlify.toml
├─ Dockerfile              (optional self-host)
├─ nginx.conf              (optional self-host)
├─ README.md
├─ public/assets/
│  └─ levels/level-01.json
└─ src/
   ├─ main.js              Phaser.Game config and scene list
   ├─ config.js            title, resolution, physics and movement tuning
   ├─ scenes/
   │  ├─ BootScene.js      builds placeholder textures, loads the level
   │  ├─ MenuScene.js
   │  ├─ GameScene.js
   │  ├─ UIScene.js        HUD, pause and touch buttons, runs on top of GameScene
   │  └─ CompleteScene.js
   ├─ entities/
   │  ├─ Player.js
   │  └─ Collectible.js    includes the collectible type registry
   ├─ level/
   │  ├─ LevelLoader.js    tilemap, object layer, camera bounds
   │  └─ levels.js         level registry (id, map key, theme, next level)
   ├─ systems/
   │  ├─ Input.js          keyboard and touch merged into one virtual input state
   │  ├─ GameState.js      score, coins, checkpoint; plain serialisable object
   │  ├─ Checkpoints.js
   │  ├─ Audio.js          no-op wrapper for now
   │  └─ Storage.js        localStorage wrapper (best score)
   └─ ui/
      └─ TouchControls.js
```

Conventions:

- **Placeholder art is generated in code** at boot (in `BootScene`) and stored as textures under fixed keys such as `player`, `coin`, `spikes`, `checkpoint`, `finish` and `tiles`. Real artwork replaces a placeholder by loading an image under the same key, with no gameplay changes.
- Animations (`idle`, `run`, `jump`, `fall`) are defined in one place and referenced by name.
- The Tiled JSON level references the generated `tiles` texture as its tileset.
- Entities read their tuning from `config.js` through the instance (for example `player.stats`), not from module-level constants, so upgrades can change them at runtime later.

## 5. Player and game feel

The player is a generic placeholder in the pixel-art style. Movement must feel responsive, and the character must be replaceable without touching the mechanics.

**Abilities:** move left and right, jump, fall under gravity, land on platforms, collide with the environment, and collect items by touching them.

**States:** idle, running, jumping and falling, driven by a small state machine that only selects animations. Physics never depends on the art. The physics hitbox is set separately from the sprite size, so a new character with a different sprite size drops in cleanly.

**Feel requirements** (every value lives in `config.js` and is easy to tune):

- Acceleration and deceleration, so the player does not stop or start instantly.
- Variable jump height: releasing the jump button early cuts the upward velocity.
- Coyote time of about 100 ms: the player can still jump just after walking off a ledge.
- Jump buffering of about 100 ms: a jump pressed just before landing still fires.
- A fixed gravity value and a maximum fall speed.
- Identical movement on keyboard and touch, because both go through the same virtual input state.

**Suggested starting values** (tune by playing):

| Setting | Value | Result |
| --- | --- | --- |
| Gravity | 900 px/s² | Used with the jump velocity below |
| Jump velocity | −300 px/s | Max jump height about 50 px (3 tiles) |
| Max run speed | 110 px/s | Max jump distance about 73 px (4.5 tiles) |
| Ground acceleration | 600 px/s² | Reaches full speed in about 0.2 s |
| Ground deceleration | 800 px/s² | Stops in about 0.15 s |

Record the computed maximum jump height and distance in a comment in `config.js`. The level rules in section 6 are derived from them, so they must be updated together.

## 6. Level design

One level (`level-01`), about 8–10 screen widths long and exactly one screen tall, so the camera scrolls horizontally only. The camera follows the player with a small deadzone and smoothing, and is clamped to the level bounds.

**Contents:** flat terrain, raised platforms, gaps that need jumps, spike hazards, coins spread throughout, two checkpoints, a clear start and a clear finish.

**Three sections**

1. **Start (first 2–3 screens).** Flat ground, a first small gap, a first low platform and coins that lead the player along the path. It teaches jumping without any threat.
2. **Middle (next 4–5 screens).** Gaps, raised platforms and spikes in simple combinations. Checkpoint 1 sits at the start of this section.
3. **End (last 2–3 screens).** The same elements in slightly longer combinations, with checkpoint 2 at its start, then a flat open area leading to the finish.

**Difficulty rules.** Difficulty stays consistent, with no sudden jumps in challenge. All limits come from the jump numbers in section 5, with about a one-third safety margin:

- Gaps are at most 3 tiles (48 px) wide.
- Step-ups are at most 2 tiles (32 px) high.
- Every spike has a safe landing tile before and after it.
- No timed sections, no moving platforms, no blind jumps: the landing is visible before the player commits.
- Coin placement follows the intended path. Some coins sit on optional raised platforms as small rewards.
- Roughly 30 coins in total, about one cluster per screen width.

**Validation.** Add a small script or dev-only console check that reads the level file and flags any gap or step-up over these limits, so edits cannot silently make the level unplayable.

**Boss-ready end.** The last section is a distinct, flat end zone about one screen wide, defined by a rectangle named `end-zone` in the level's object layer. The finish flag sits at its right edge. In v1 the zone only calls an empty `onEnterEndZone()` hook in `GameScene`. Reaching the finish triggers completion through a separate path, so a boss fight can later lock the camera to the zone and hold the finish until the boss is defeated. Do not build the boss.

## 7. Collectibles, scoring, hazards and checkpoints

**Collectibles**

- One generic type, `coin`. Touching it removes it and plays a small pop animation.
- Types live in a registry, for example `collectibleTypes = { coin: { texture: 'coin', points: 10 } }`.
- The level's object layer places each collectible with a `type` property, so new types need no loader changes.

**Scoring and HUD**

- Score is 10 points per coin plus a 100-point bonus on completion.
- The HUD shows coins as collected/total and the current score. The counter briefly bumps when a coin is picked up.

**Hazards and death**

- Spikes are marked deadly in the level data (a property on the tile or object). Overlap calls `player.die()`.
- Falling below the bottom of the world also calls `player.die()`.
- On death the player freezes for about 0.5 s with a flash, input is locked, then the player respawns at the last checkpoint or at the start.
- Collected coins and score are kept across respawns.

**Checkpoints**

- Two flag objects in the object layer. Touching one activates it, changes its look, and stores the respawn point in `GameState`.

**Feedback**

- Visual only in v1: coin pop, counter bump, checkpoint change, death flash.
- Call `Audio.play('coin')`, `'jump'`, `'death'` and `'finish'` at the matching moments. The wrapper does nothing until sound assets exist, so adding sound later needs no gameplay changes.

## 8. Controls and mobile

Desktop and touch both feed one virtual input state (`left`, `right`, `jumpHeld`, `jumpPressed`). `Player` reads only that state, never raw keys or pointers.

**Desktop**

| Action | Keys |
| --- | --- |
| Move left | Left arrow or A |
| Move right | Right arrow or D |
| Jump | Space or Up arrow |
| Pause | P or Esc |

**Mobile (landscape first)**

- Three on-screen buttons: left and right together at the bottom left, jump at the bottom right.
- Buttons must be large: at least 64 CSS px square when rendered, checked on a 640×360 viewport. Use semi-transparent graphics so they do not hide the level.
- Multi-touch must work, so the player can hold a direction and jump at once. Configure enough Phaser pointers for at least three simultaneous touches.
- Show touch controls only on touch devices. Hide them on desktop.
- Stop browser gestures from interfering: `touch-action: none`, no page scrolling, no pull-to-refresh, no pinch zoom, no text selection and no long-press menu on the canvas.
- Respect device safe areas (`viewport-fit=cover` and `env(safe-area-inset-*)`) so buttons are not under notches or home bars.

**Scaling and orientation**

- The canvas fills the viewport (use `100dvh` so mobile browser bars do not cause overflow) and re-fits on resize and orientation change.
- In portrait, show a "rotate your device" overlay and pause the game. Resume when the device is back in landscape.
- No fullscreen button is required in v1.

**Audio unlock.** There is no sound in v1. Make the `Audio` wrapper unlock itself on the first user input, so sound can be added later without hitting browser autoplay rules.

## 9. UI and game flow

Scene flow: Boot, then Menu, then Game (with the UI scene running on top), then Complete. Restart on the Complete screen goes straight back to Game with all state reset.

- **Menu:** game title, a Start button (click, tap, Enter or Space), a one-line controls hint for keyboard or touch, and the best score if one exists.
- **HUD:** coin counter (icon and collected/total) at the top left, score at the top right, and a small pause button. Keep it light so it never hides the action.
- **Pause overlay:** Resume and Restart.
- **Completion screen:** "Level Complete", final score, coins collected out of total, best score, and a Play again button (click, tap, Enter or Space).
- **Next-level hook:** if the level registry has a next level, the Complete screen offers it. In v1 there is none, so only Restart is shown.
- Use one text style defined in one place. A system monospace font is fine as a placeholder.

## 10. Extensibility

None of these features are built in v1. The structure must let each one be added without reworking existing code.

| Future feature | Where it plugs in |
| --- | --- |
| Original character and art | Texture keys and animation names are defined in one place. The hitbox is configured separately from the sprite |
| Enemies | New classes in `entities/`, spawned from `enemy` objects in the level's object layer, handled like hazards and reusing `die()` |
| Health and lives | `player.die()` is the single death path. Add health and lives to `GameState` and use the free HUD space |
| More collectible types | Add an entry to the `collectibleTypes` registry. Level objects already carry a `type` |
| Sound and music | `Audio.play(key)` is already called at the right moments |
| Abilities and upgrades | Movement values are read from `player.stats`, which can change at runtime |
| More levels and worlds | `levels.js` registry; `GameScene` takes a level id; the Complete screen offers a next level when one exists |
| Boss encounter | `end-zone` object and `onEnterEndZone()` hook, a camera-lock helper, and a finish trigger that can be held back |
| Saved progress | `GameState` is a plain serialisable object and `Storage.js` already wraps `localStorage` |

## 11. Build stages

Work through these in order. Each stage ends with something you can run, and you check it before starting the next.

1. **Scaffold.** Vite and Phaser running, scene list wired, 320×180 pixel-art canvas with FIT scaling, placeholder textures generated at boot. *Done when* `npm run dev` shows a crisp, correctly scaled canvas at desktop and phone-sized viewports.
2. **Player and feel.** Virtual input with keyboard, `Player` with the four states, the feel requirements from section 5, a short test strip of platforms. *Done when* running, jumping, landing, coyote time, jump buffering and variable jump height all work and the four animations show.
3. **Level.** Tilemap loading, camera follow and bounds, full level layout with gaps, spikes, checkpoints and respawn, and the level validation check. *Done when* the level can be played from start to the end zone and all validation passes.
4. **Collectibles and score.** Coin registry, pickups, `GameState`, HUD counter and score. *Done when* coins vanish on touch and the counter and score update correctly across respawns.
5. **Finish and flow.** Finish flag, Menu, Complete screen, restart, pause, best score. *Done when* a full run from Menu to Complete and back to a fresh game works with no leftover state.
6. **Mobile.** Touch buttons, multi-touch, gesture blocking, safe areas, portrait overlay. *Done when* the game is fully playable in a touch-emulated landscape phone viewport.
7. **Polish and ship.** README, `netlify.toml`, optional Docker and nginx files, bundle size check, then a final pass over section 12. *Done when* `npm run build` succeeds and `npm run preview` plays the full level.

## 12. Definition of done, testing and deliverables

The prototype is done when every item below is true.

- [ ] The game launches in a web browser.
- [ ] The player moves left and right, jumps, and lands on platforms.
- [ ] The camera follows the player.
- [ ] One complete level is playable, with obstacles and gaps.
- [ ] Coins can be picked up, and the score and coin counter work.
- [ ] Desktop keyboard controls work.
- [ ] Mobile touch controls work, including holding a direction while jumping.
- [ ] The player can reach the end of the level.
- [ ] The completion screen and restart option work.
- [ ] The game can be published to a public URL from the build output.

**Quality bar**

- Targets 60 fps on desktop and on a mid-range phone.
- No console errors or warnings in a normal play-through.
- No horizontal or vertical page scroll at any tested size.
- Checked at these viewports: 1920×1080, 1280×720, 844×390 and 640×360.
- Works in the latest Chrome, Edge, Firefox and Safari.

**Testing.** Test with the keyboard on desktop and with touch emulation at phone sizes. You cannot test on a physical phone, so add a short manual checklist to the README for the project owner: touch latency, simultaneous direction and jump, iOS Safari address-bar behaviour, rotation, and frame rate.

**Deliverables**

- A working repository that follows section 4.
- A README covering: running locally (`npm install`, `npm run dev`), building (`npm run build`, `npm run preview`), deploying to Netlify, the optional self-hosting setup, the project structure, how to swap placeholder art, how to add a level, how to tune movement, the list of decisions, and the manual device checklist.

**Out of scope for v1.** Enemies, health and lives, extra collectible types, music and sound effects, abilities and upgrades, more levels or worlds, the boss fight, saved progress beyond the best score, and any backend, accounts or leaderboards. Do not start these until the first level is fully playable and tested.