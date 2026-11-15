// Texture keys, frame layouts and animation names, defined in one place.
// Real artwork replaces a placeholder by loading an image/spritesheet under the
// same key in BootScene.preload(). This module has no Phaser import so Node
// scripts (level builder, validator) can use it too.

export const TEX = {
  PLAYER: 'player', // Naylor
  PINT: 'pint',
  ESPRESSO: 'espresso-martini',
  GLASS: 'glass', // broken-glass hazard
  CHECKPOINT: 'checkpoint', // railway signal: red → green
  FINISH: 'finish', // pub hanging sign
  TILES: 'tiles',
  HILLS: 'hills', // parallax backdrop
  EASEL: 'easel',
  FONT: 'font-pixel', // bitmap font texture (3×5 glyphs with a drop shadow)
};

// Bitmap font key for crisp HUD text (built from src/art/pixelFont.js at boot).
export const FONT = {
  PIXEL: 'pixel',
  cellWidth: 4, // 3 px glyph + 1 px shadow
  cellHeight: 6, // 5 px glyph + 1 px shadow
};

/** Texture key for a pub front (see PUBS) or a station nameboard. */
export const pubTextureKey = (id) => `pub-${id}`;
export const signTextureKey = (text) => `sign-${text.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

// Pubs drawn as background buildings. `id` is referenced by `pub` objects in level JSON.
export const PUBS = {
  brewhouse: { name: 'BREWHOUSE', wall: 'brick', roof: '#5f574f', chimney: true },
  'black-bear': { name: 'THE BLACK BEAR', wall: 'render', roof: '#1a1c2c', angryLocals: true },
  'old-granary': { name: 'THE OLD GRANARY', wall: 'brick', roof: '#7e2553' },
  avocet: { name: 'THE AVOCET', wall: 'render', roof: '#29366f' },
};

// Player spritesheet frame layout (frame size and frame indices per animation).
export const PLAYER_FRAME = { width: 16, height: 16 };
export const PLAYER_FRAMES = {
  idle: [0, 1],
  run: [2, 3, 4, 5],
  jump: [6],
  fall: [7],
};

export const PINT_FRAME = { width: 16, height: 16, count: 4 };
export const ESPRESSO_FRAME = { width: 16, height: 16, count: 2 };
export const CHECKPOINT_FRAME = { width: 16, height: 32, inactive: 0, active: 1 };

// Tileset layout: one row of 16×16 tiles. Tiled gids are index + 1.
export const TILESET = {
  name: 'tiles', // tileset name used inside the Tiled JSON
  tileWidth: 16,
  tileHeight: 16,
  tiles: {
    platformTop: 0, // station platform edge (yellow line)
    platformBody: 1, // brick platform wall
    roofLeft: 2, // carriage roof
    roofMid: 3,
    roofRight: 4,
    carriageWindow: 5, // carriage side, window band
    carriageDoor: 6,
    carriageLower: 7,
    bogie: 8, // underframe with wheel
    underframe: 9,
    crate: 10,
    grassTop: 11,
    earth: 12,
    canopy: 13, // station canopy roof (foreground, no collision)
    canopyValance: 14, // saw-tooth canopy edge (foreground)
    canopyPost: 15, // cast-iron column (background)
    water: 16, // river surface (background)
    waterDeep: 17,
  },
  count: 18,
};

// Animation keys, referenced by name everywhere else.
export const ANIM = {
  PLAYER_IDLE: 'idle',
  PLAYER_RUN: 'run',
  PLAYER_JUMP: 'jump',
  PLAYER_FALL: 'fall',
  PINT_SHINE: 'pint-shine',
  ESPRESSO_SHINE: 'espresso-shine',
};
