# Super Lad Alarm: notes for Claude

- The spec is `initial-build-brief.md`. Its section 2 decisions are fixed; build in the section 11 stage order and update the README "Status" table and "Decisions" list as you go.
- Mobile landscape first. Check changes at 1920×1080, 1280×720, 844×390 and 640×360 with the `dev` launch config (`.claude/launch.json`).
- All tunable numbers go in `src/config.js`; texture/animation keys in `src/assets.js`; scene keys in `src/scenes/keys.js`. Use `addText()` from `src/ui/text.js` for all text.
- Runtime dependency is `phaser` only, dev dependency `vite` only. Don't add packages without a clear reason.
- Phaser's `scale.refresh()` uses a cached parent size; call `scale.getParentBounds()` first (see `src/systems/Scaling.js`).
- The Player reads only `VirtualInput.state`, never raw keys/pointers. All deaths go through `player.die()`.
- Touch buttons cover the bottom corners: keep spawn points and level start/end content clear of them.
- Test flags: `?touch` forces on-screen buttons on desktop; `?debug` (dev only) shows bodies and player state.
- Phaser static bodies: `refreshBody()` resets the body size to the sprite, so call `body.setSize()` after it.
