// Placeholder art, generated in code at boot. Each texture is created under a
// fixed key from src/assets.js. If real artwork has already been loaded under
// that key (e.g. in BootScene.preload), the placeholder is skipped.

import {
  TEX,
  PLAYER_FRAME,
  PLAYER_FRAMES,
  COIN_FRAME,
  CHECKPOINT_FRAME,
  TILESET,
} from '../assets.js';

const PALETTE = {
  R: '#e43b44', // cap
  S: '#f4c49a', // skin
  K: '#1a1c2c', // eyes / outline
  B: '#3b5dc9', // shirt
  D: '#29366f', // trousers
  W: '#5d275d', // shoes
};

// --- Player ---------------------------------------------------------------

// Upper body rows (11 rows), shared by every frame.
const BODY = [
  '................',
  '......RRRR......',
  '.....RRRRRRR....',
  '.....SSSSSS.....',
  '.....SKSSKS.....',
  '.....SSSSSS.....',
  '......SSSS......',
  '.....BBBBBB.....',
  '....SBBBBBBS....',
  '....SBBBBBBS....',
  '.....BBBBBB.....',
];
const BODY_ARMS_OUT = [...BODY.slice(0, 8), '...SBBBBBBBBS...', '....BBBBBBBB....', BODY[10]];
const BODY_ARMS_UP = [
  BODY[0],
  BODY[1],
  '..S..RRRRRRR.S..',
  '..S..SSSSSS..S..',
  '..S..SKSSKS..S..',
  '...S.SSSSSS.S...',
  '...S..SSSS..S...',
  '....SBBBBBBS....',
  '.....BBBBBB.....',
  '.....BBBBBB.....',
  '.....BBBBBB.....',
];

// Leg rows (4 rows) plus one blank row at the bottom.
const LEGS = {
  stand: ['.....DDDDDD.....', '.....DD..DD.....', '.....DD..DD.....', '....WWW..WWW....'],
  stride: ['.....DDDDDD.....', '....DD....DD....', '...DD......DD...', '..WWW......WWW..'],
  pass: ['.....DDDDDD.....', '......DDDD......', '......DDDD......', '......WWWW......'],
  tuck: ['.....DDDDDD.....', '....DDD..DDD....', '....WW....WW....', '................'],
  dangle: ['.....DDDDDD.....', '.....DD..DD.....', '....DD....DD....', '...WW......WW...'],
};
const BLANK = '................';

function frame(body, legs) {
  return [...body, ...legs, BLANK];
}

// Frame order must match PLAYER_FRAMES in src/assets.js.
const PLAYER_ART = [
  frame(BODY, LEGS.stand), // 0 idle
  [BLANK, ...frame(BODY, LEGS.stand).slice(0, 11), ...LEGS.stand.slice(1), BLANK], // 1 idle (bob down 1px)
  frame(BODY, LEGS.stride), // 2 run
  [BLANK, ...BODY.slice(0, 10), ...LEGS.pass, BLANK], // 3 run (passing, bob)
  frame(BODY_ARMS_OUT, LEGS.stride), // 4 run
  [BLANK, ...BODY.slice(0, 10), ...LEGS.pass, BLANK], // 5 run (passing, bob)
  frame(BODY_ARMS_UP, LEGS.tuck), // 6 jump
  frame(BODY_ARMS_OUT, LEGS.dangle), // 7 fall
];

function drawRows(ctx, rows, ox, oy) {
  for (let y = 0; y < rows.length; y++) {
    const row = rows[y];
    for (let x = 0; x < row.length; x++) {
      const color = PALETTE[row[x]];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(ox + x, oy + y, 1, 1);
    }
  }
}

// --- Helpers ---------------------------------------------------------------

function makeSheet(scene, key, frameW, frameH, count, draw) {
  const tex = scene.textures.createCanvas(key, frameW * count, frameH);
  const ctx = tex.getContext();
  ctx.imageSmoothingEnabled = false;
  for (let i = 0; i < count; i++) {
    ctx.save();
    ctx.translate(i * frameW, 0);
    draw(ctx, i);
    ctx.restore();
    tex.add(i, 0, i * frameW, 0, frameW, frameH);
  }
  tex.refresh();
  return tex;
}

function rect(ctx, color, x, y, w, h) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

// --- Individual textures -----------------------------------------------------

function makePlayer(scene) {
  const { width, height } = PLAYER_FRAME;
  const count = Math.max(...Object.values(PLAYER_FRAMES).flat()) + 1;
  makeSheet(scene, TEX.PLAYER, width, height, count, (ctx, i) => drawRows(ctx, PLAYER_ART[i], 0, 0));
}

function makeCoin(scene) {
  const { width, height, count } = COIN_FRAME;
  const halfWidths = [5, 3, 1, 3]; // spin: full, narrow, edge-on, narrow
  makeSheet(scene, TEX.COIN, width, height, count, (ctx, i) => {
    const hw = halfWidths[i];
    const cx = 8;
    const r = 5;
    for (let y = -r; y <= r; y++) {
      const rowHalf = Math.round(Math.sqrt(r * r - y * y) * (hw / r));
      const w = Math.max(1, rowHalf * 2);
      rect(ctx, '#ab5236', cx - w / 2, 8 + y, w, 1); // rim
      if (w > 2) rect(ctx, '#ffec27', cx - w / 2 + 1, 8 + y, w - 2, 1); // face
    }
    if (hw >= 3) rect(ctx, '#fff1e8', cx - 1, 5, 1, 3); // shine
  });
}

function makeSpikes(scene) {
  const tex = scene.textures.createCanvas(TEX.SPIKES, 16, 16);
  const ctx = tex.getContext();
  // Four 4px-wide spikes, 8px tall, sitting on the bottom of the tile.
  for (let s = 0; s < 4; s++) {
    const x0 = s * 4;
    for (let y = 0; y < 8; y++) {
      const half = Math.ceil(((y + 1) / 8) * 2);
      rect(ctx, '#c2c3c7', x0 + 2 - half, 8 + y, half * 2, 1);
    }
    rect(ctx, '#fff1e8', x0 + 1, 10, 1, 4); // highlight
  }
  rect(ctx, '#5f574f', 0, 15, 16, 1);
  tex.refresh();
}

function makeCheckpoint(scene) {
  const { width, height } = CHECKPOINT_FRAME;
  makeSheet(scene, TEX.CHECKPOINT, width, height, 2, (ctx, i) => {
    rect(ctx, '#5f574f', 2, 30, 7, 2); // base
    rect(ctx, '#c2c3c7', 4, 2, 2, 28); // pole
    rect(ctx, '#fff1e8', 4, 1, 2, 1); // top
    if (i === CHECKPOINT_FRAME.inactive) {
      // Lowered, grey flag.
      rect(ctx, '#83769c', 6, 18, 7, 5);
      rect(ctx, '#5f574f', 6, 22, 7, 1);
    } else {
      // Raised, green flag.
      rect(ctx, '#00e436', 6, 3, 9, 6);
      rect(ctx, '#008751', 6, 8, 9, 1);
      rect(ctx, '#fff1e8', 9, 5, 3, 2);
    }
  });
}

function makeFinish(scene) {
  const tex = scene.textures.createCanvas(TEX.FINISH, 16, 48);
  const ctx = tex.getContext();
  rect(ctx, '#5f574f', 1, 46, 8, 2); // base
  rect(ctx, '#c2c3c7', 4, 3, 2, 43); // pole
  rect(ctx, '#ffec27', 3, 0, 4, 3); // knob
  // Chequered flag, 10×8.
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 5; x++) {
      rect(ctx, (x + y) % 2 ? '#1a1c2c' : '#fff1e8', 6 + x * 2, 4 + y * 2, 2, 2);
    }
  }
  tex.refresh();
}

function makeTiles(scene) {
  const { tileWidth: w, tileHeight: h, tiles, count } = TILESET;
  makeSheet(scene, TEX.TILES, w, h, count, (ctx, i) => {
    if (i === tiles.groundTop || i === tiles.ground) {
      rect(ctx, '#ab5236', 0, 0, w, h);
      // Dirt speckles.
      [[3, 6], [10, 4], [6, 11], [13, 12], [1, 13]].forEach(([x, y]) => rect(ctx, '#7e2553', x, y, 2, 1));
      if (i === tiles.groundTop) {
        rect(ctx, '#00e436', 0, 0, w, 4);
        rect(ctx, '#008751', 0, 4, w, 1);
        [1, 5, 9, 13].forEach((x) => rect(ctx, '#008751', x, 5, 1, 1));
      }
    } else if (i === tiles.platform) {
      rect(ctx, '#ffa300', 0, 0, w, 6);
      rect(ctx, '#ab5236', 0, 5, w, 1);
      rect(ctx, '#ffccaa', 0, 0, w, 1);
      [3, 11].forEach((x) => rect(ctx, '#ab5236', x, 1, 1, 4));
    } else if (i === tiles.brick) {
      rect(ctx, '#5f574f', 0, 0, w, h);
      rect(ctx, '#83769c', 0, 0, w, 1);
      for (let y = 0; y < 4; y++) {
        rect(ctx, '#1a1c2c', 0, y * 4 + 3, w, 1);
        const off = y % 2 ? 4 : 0;
        rect(ctx, '#1a1c2c', off, y * 4, 1, 3);
        rect(ctx, '#1a1c2c', off + 8, y * 4, 1, 3);
      }
    }
  });
}

const BUILDERS = {
  [TEX.PLAYER]: makePlayer,
  [TEX.COIN]: makeCoin,
  [TEX.SPIKES]: makeSpikes,
  [TEX.CHECKPOINT]: makeCheckpoint,
  [TEX.FINISH]: makeFinish,
  [TEX.TILES]: makeTiles,
};

/** Generate every placeholder texture that has not already been loaded as real art. */
export function createPlaceholderTextures(scene) {
  for (const [key, build] of Object.entries(BUILDERS)) {
    if (!scene.textures.exists(key)) build(scene);
  }
}
