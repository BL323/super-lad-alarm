// Texture keys and animation names, defined in one place.
// Real artwork replaces a placeholder by loading an image/spritesheet under the same key.

export const TEX = {
  PLAYER: 'player',
  COIN: 'coin',
  SPIKES: 'spikes',
  CHECKPOINT: 'checkpoint',
  FINISH: 'finish',
  TILES: 'tiles',
};

// Player spritesheet frame layout (frame size and frame indices per animation).
export const PLAYER_FRAME = { width: 16, height: 16 };
export const PLAYER_FRAMES = {
  idle: [0, 1],
  run: [2, 3, 4, 5],
  jump: [6],
  fall: [7],
};

export const COIN_FRAME = { width: 16, height: 16, count: 4 };
export const CHECKPOINT_FRAME = { width: 16, height: 32, inactive: 0, active: 1 };

// Tileset layout: one row of 16×16 tiles. Tiled tile ids are index + 1.
export const TILESET = {
  name: 'tiles', // tileset name used inside the Tiled JSON
  tileWidth: 16,
  tileHeight: 16,
  tiles: {
    groundTop: 0,
    ground: 1,
    platform: 2,
    brick: 3,
  },
  count: 4,
};

// Animation keys, referenced by name everywhere else.
export const ANIM = {
  PLAYER_IDLE: 'idle',
  PLAYER_RUN: 'run',
  PLAYER_JUMP: 'jump',
  PLAYER_FALL: 'fall',
  COIN_SPIN: 'coin-spin',
};
