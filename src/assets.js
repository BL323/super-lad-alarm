// Texture keys, frame layouts and animation names, defined in one place.
// Real artwork replaces a placeholder by loading an image/spritesheet under the
// same key in BootScene.preload(). This module has no Phaser import so Node
// scripts (level builder, validator) can use it too.

export const TEX = {
  PINT: 'pint',
  ESPRESSO: 'espresso-martini',
  GLASS: 'glass', // broken-glass hazard
  CHECKPOINT: 'checkpoint', // railway signal: red → green
  FINISH: 'finish', // pub hanging sign
  TILES: 'tiles',
  HILLS: 'hills', // parallax backdrop
  EASEL: 'easel',
  FONT: 'font-pixel', // bitmap font texture (3×5 glyphs with a drop shadow)
  CONDUCTOR: 'conductor', // the Train Conductor boss
  TICKET: 'ticket', // his thrown tickets
  TICKET_MARKER: 'ticket-marker', // where a ticket will land
  DIZZY_STARS: 'dizzy-stars',
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

// Playable characters. Looks only: everyone shares the same movement and
// hitbox. Palette letters: R cap/hair, S skin, K eyes, B top, D trousers, W shoes.
// Real art: load a spritesheet under playerTextureKey(id) with the frame
// layout below and the placeholder for that character is skipped.
export const CHARACTERS = [
  {
    id: 'naylor',
    name: 'NAYLOR',
    palette: { R: '#e43b44', S: '#f4c49a', K: '#1a1c2c', B: '#3b5dc9', D: '#29366f', W: '#5d275d' },
  },
  {
    id: 'lad-2',
    name: 'LAD 2',
    palette: { R: '#7e4a2a', S: '#f4c49a', K: '#1a1c2c', B: '#008751', D: '#5f574f', W: '#1a1c2c' },
  },
  {
    id: 'lad-3',
    name: 'LAD 3',
    palette: { R: '#ffa300', S: '#c88a5a', K: '#1a1c2c', B: '#7e2553', D: '#29366f', W: '#ab5236' },
  },
];
export const DEFAULT_CHARACTER = CHARACTERS[0].id;
export const getCharacter = (id) => CHARACTERS.find((c) => c.id === id) ?? CHARACTERS[0];
export const playerTextureKey = (id) => `player-${id}`;
/** Animation key for a character's movement state ('idle' | 'run' | 'jump' | 'fall'). */
export const playerAnimKey = (id, state) => `${id}-${state}`;

// Player spritesheet frame layout (frame size and frame indices per animation).
export const PLAYER_FRAME = { width: 16, height: 16 };
export const PLAYER_FRAMES = {
  idle: [0, 1],
  run: [2, 3, 4, 5],
  jump: [6],
  fall: [7],
};

// Train Conductor sheet: 16×32 frames, facing right.
export const CONDUCTOR_FRAME = {
  width: 16,
  height: 32,
  idle: 0,
  walk: [1, 2],
  windup: 3, // whistle to his lips, red-faced
  dash: 4,
  dizzy: 5,
  throw: 6,
  count: 7,
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
  PINT_SHINE: 'pint-shine',
  ESPRESSO_SHINE: 'espresso-shine',
  CONDUCTOR_WALK: 'conductor-walk',
};
