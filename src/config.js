// Central tuning and constants. Every tunable number lives here.

export const GAME_TITLE = 'Super Lad Alarm';

// Logical resolution (16:9) and tile size.
export const GAME_WIDTH = 320;
export const GAME_HEIGHT = 180;
export const TILE_SIZE = 16;

// Scaling: Phaser FIT inside a frame snapped to an integer multiple of the base
// resolution whenever at least 1x fits (see src/systems/Scaling.js).
export const SCALING = {
  integer: true,
};

// Arcade physics. One shared gravity value.
export const PHYSICS = {
  gravity: 900, // px/s²
  debug: false,
};

// Player movement tuning (wired up in stage 2). Values are copied onto
// `player.stats` per instance so upgrades can change them at runtime.
//
// Derived limits (keep in sync with level rules in the brief, section 6):
//   max jump height   = v² / 2g        = 300² / (2·900) = 50 px  (~3 tiles)
//   time to apex      = v / g          = 300 / 900      = 0.333 s
//   air time (flat)   = 2 · 0.333      = 0.667 s
//   max jump distance = run · air time = 110 · 0.667    = 73 px  (~4.5 tiles)
// Level rules with ~1/3 safety margin: gaps ≤ 3 tiles (48 px), step-ups ≤ 2 tiles (32 px).
export const PLAYER = {
  jumpVelocity: -300, // px/s
  maxRunSpeed: 110, // px/s
  groundAccel: 600, // px/s²
  groundDecel: 800, // px/s²
  maxFallSpeed: 400, // px/s
  coyoteTimeMs: 100,
  jumpBufferMs: 100,
  jumpCutMultiplier: 0.5, // vertical velocity multiplier when jump is released early
  // Physics hitbox, independent of sprite frame size.
  body: { width: 10, height: 14, offsetX: 3, offsetY: 2 },
};

// Scoring.
export const SCORING = {
  completionBonus: 100,
};

// Input.
export const INPUT = {
  maxPointers: 3, // simultaneous touches (direction + jump + spare)
};

// One text style for the whole game. System monospace as a placeholder.
export const FONT_FAMILY = 'ui-monospace, Menlo, Consolas, "Courier New", monospace';
export const TEXT_STYLE = {
  fontFamily: FONT_FAMILY,
  fontSize: '8px',
  color: '#ffffff',
};

export const COLORS = {
  background: '#1d2b53',
  text: '#ffffff',
  textDim: '#c2c3c7',
  accent: '#ffec27',
};
