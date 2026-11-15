// Texture keys, frame layouts and animation names, defined in one place.
// Real artwork replaces a placeholder by loading an image/spritesheet under the
// same key in BootScene.preload(). This module has no Phaser import so Node
// scripts (level builder, validator) can use it too.

export const TEX = {
  PINT: 'pint',
  ESPRESSO: 'espresso-martini',
  GLASS: 'glass', // broken-glass hazard
  CHECKPOINT: 'checkpoint', // railway signal: red → green
  FINISH: 'finish', // The Avocet's front door: closed (padlocked) / open
  TILES: 'tiles',
  HILLS: 'hills', // parallax backdrop
  EASEL: 'easel',
  FONT: 'font-pixel', // bitmap font texture (3×5 glyphs with a drop shadow)
  CONDUCTOR: 'conductor', // the Train Conductor boss
  TICKET: 'ticket', // his thrown tickets
  TICKET_MARKER: 'ticket-marker', // where a ticket will land
  DIZZY_STARS: 'dizzy-stars',
  CONFETTI: 'confetti',
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

// Playable characters: all Naylor (red hair, same skin tone) in different
// outfits. Looks only: everyone shares the same movement and hitbox.
// `look` picks the head/torso shapes in src/art/placeholders.js (PLAYER_LOOKS).
// Palette letters: S skin, K eyes/black, H hair, B jacket/top, C shirt/white,
// T tie, Y tie print, P badge, G gold braid, L polo collar, D trousers, W shoes.
// Real art: load a spritesheet under playerTextureKey(id) with the frame
// layout below and the placeholder for that character is skipped.
const SKIN = '#f4c49a';
const HAIR = '#d65a1e'; // Naylor's red hair
export const CHARACTERS = [
  {
    id: 'senior',
    name: 'SENIOR',
    look: 'senior', // green school blazer, white shirt, green patterned tie, crest
    palette: {
      S: SKIN, K: '#1a1c2c', H: HAIR,
      B: '#1f6b3a', C: '#fff1e8', T: '#0e4d2a', Y: '#ffcd75', P: '#ffcd75',
      D: '#3a3a46', W: '#1a1c2c',
    },
  },
  {
    id: 'sea-lord',
    name: 'SEA LORD',
    look: 'sea-lord', // modern navy admiral: white-topped peaked cap, navy jacket, gold rings
    palette: {
      S: SKIN, K: '#1a1c2c', H: HAIR,
      B: '#1d2b53', C: '#fff1e8', G: '#ffcd75',
      D: '#1d2b53', W: '#1a1c2c',
    },
  },
  {
    id: 'casual',
    name: 'CASUAL',
    look: 'casual', // blue polo, red chinos
    palette: {
      S: SKIN, K: '#1a1c2c', H: HAIR,
      B: '#3b7dd8', L: '#9cc8ff',
      D: '#be3a34', W: '#fff1e8',
    },
  },
];
export const DEFAULT_CHARACTER = 'casual';
export const getCharacter = (id) =>
  CHARACTERS.find((c) => c.id === id) ?? CHARACTERS.find((c) => c.id === DEFAULT_CHARACTER);
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

// The finish door is drawn over the pub texture's own door (14×26 at x 41,
// y 54 of the 96×80 pub front), so a finish placed at a pub's x lines up.
export const FINISH_FRAME = { width: 14, height: 26, closed: 0, open: 1 };
export const CONFETTI_FRAME = { width: 3, height: 2, count: 6 };

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
