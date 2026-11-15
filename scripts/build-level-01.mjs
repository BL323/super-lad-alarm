// Builds public/assets/levels/level-01.json (Tiled map format) from the layout
// described below. Run with `npm run build:level`. The JSON is what the game
// loads, and it can also be opened and edited in Tiled. If you edit it in
// Tiled, stop using this script for that level so your edits aren't overwritten.
//
// Story: Dorchester (start) → Wool (checkpoint 1) → Wareham (checkpoint 2)
// → the Train Conductor's train (checkpoint 3 just before it; boss fight on the roof)
// → hop off at Parkstone → finish at The Avocet's door.

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { TILESET } from '../src/assets.js';
import { validateLevel, formatReport } from '../src/level/validateLevel.js';

const T = TILESET.tiles;
const TS = TILESET.tileWidth;
const COLS = 198; // ~9.9 screens of 20 tiles
const ROWS = 12; // 192 px; the top 12 px sits above the 180 px screen
const SURFACE = 10; // ground/platform surface row
const ROOF = 8; // carriage roof row (2 tiles above the platform)

const layer = () => new Array(COLS * ROWS).fill(0);
const layers = { background: layer(), ground: layer(), foreground: layer() };
const objects = [];
const decor = [];
let nextId = 1;

function set(name, col, row, tile) {
  if (col < 0 || col >= COLS || row < 0 || row >= ROWS) throw new Error(`tile out of range ${col},${row}`);
  layers[name][row * COLS + col] = tile + 1; // gid = index + 1
}

// --- Building blocks ----------------------------------------------------------

function platform(c0, c1) {
  for (let c = c0; c <= c1; c++) {
    set('ground', c, SURFACE, T.platformTop);
    set('ground', c, SURFACE + 1, T.platformBody);
  }
}

function embankment(c0, c1) {
  for (let c = c0; c <= c1; c++) {
    set('ground', c, SURFACE, T.grassTop);
    set('ground', c, SURFACE + 1, T.earth);
  }
}

function carriage(c0, len) {
  const c1 = c0 + len - 1;
  for (let c = c0; c <= c1; c++) {
    const roof = c === c0 ? T.roofLeft : c === c1 ? T.roofRight : T.roofMid;
    const isDoor = c === c0 + 1 || c === c1 - 1;
    const isBogie = [c0 + 1, c0 + 2, c1 - 2, c1 - 1].includes(c);
    set('ground', c, ROOF, roof);
    set('ground', c, ROOF + 1, isDoor ? T.carriageDoor : T.carriageWindow);
    set('ground', c, ROOF + 2, isDoor ? T.carriageDoor : T.carriageLower);
    set('ground', c, ROOF + 3, isBogie ? T.bogie : T.underframe);
  }
}

/** Stack of crates at `col` from the surface up to (and including) `topRow`. */
function crates(col, topRow) {
  for (let r = topRow; r < SURFACE; r++) set('ground', col, r, T.crate);
}

function canopy(c0, c1, row, posts) {
  for (let c = c0; c <= c1; c++) {
    set('foreground', c, row, T.canopy);
    set('foreground', c, row + 1, T.canopyValance);
  }
  for (const c of posts) for (let r = row + 2; r < SURFACE; r++) set('background', c, r, T.canopyPost);
}

function river(c0, c1) {
  for (let c = c0; c <= c1; c++) set('background', c, SURFACE + 1, T.water);
  addObject('hazard', 'river', c0 * TS, (SURFACE + 1) * TS + 6, (c1 - c0 + 1) * TS, TS - 6, { kind: 'water' });
}

// --- Objects -------------------------------------------------------------------

function props(p) {
  return Object.entries(p).map(([name, value]) => ({
    name,
    type: typeof value === 'number' ? (Number.isInteger(value) ? 'int' : 'float') : typeof value === 'boolean' ? 'bool' : 'string',
    value,
  }));
}

function addObject(type, name, x, y, width = 0, height = 0, p = {}, list = objects) {
  const o = { id: nextId++, name, type, x, y, width, height, rotation: 0, visible: true };
  if (!width && !height) o.point = true;
  if (Object.keys(p).length) o.properties = props(p);
  list.push(o);
  return o;
}

// Points are given by tile column; `y` is the feet position (top of the surface row).
const feet = (col, surfaceRow = SURFACE) => [col * TS + TS / 2, surfaceRow * TS];
const spawn = (col) => addObject('spawn', 'spawn', ...feet(col));
const checkpoint = (col, station) => addObject('checkpoint', station, ...feet(col), 0, 0, { station });
const finish = (col) => addObject('finish', 'finish', ...feet(col));
const pint = (col, row) => addObject('collectible', 'pint', col * TS + TS / 2, row * TS + TS / 2, 0, 0, { type: 'pint' });
const espresso = (col, row) =>
  addObject('collectible', 'espresso-martini', col * TS + TS / 2, row * TS + TS / 2, 0, 0, { type: 'espresso' });
/** Broken glass sitting on the surface at `surfaceRow`. */
const glass = (col, surfaceRow = SURFACE) =>
  addObject('hazard', 'glass', col * TS, (surfaceRow - 1) * TS, TS, TS, { kind: 'glass' });
const boss = (col, kind, surfaceRow = SURFACE) => addObject('boss', kind, ...feet(col, surfaceRow), 0, 0, { kind });
const zone = (name, c0, c1) => addObject('zone', name, c0 * TS, 0, (c1 - c0 + 1) * TS, ROWS * TS);
const secret = (c0, c1, r0, r1) => addObject('secret', 'secret', c0 * TS, r0 * TS, (c1 - c0 + 1) * TS, (r1 - r0 + 1) * TS);
const pub = (col, id) => addObject('pub', id, ...feet(col), 0, 0, { pub: id }, decor);
const sign = (col, text) => addObject('sign', text, ...feet(col), 0, 0, { text }, decor);
const easel = (col) => addObject('easel', 'easel', col * TS + TS / 2, (SURFACE + 1) * TS + 4, 0, 0, {}, decor);

// --- Layout --------------------------------------------------------------------
// Section 1 · Start: Dorchester (cols 0–53). Flat platform, a first small gap, a
// first low crate, then the first train. No hazards.
platform(0, 21);
platform(24, 29); // 2-tile gap at 22–23
crates(16, 9);
pub(5, 'brewhouse');
sign(13, 'DORCHESTER');
spawn(8);
[10, 11].forEach((c) => pint(c, 9));
pint(16, 8);
pint(22, 8);
pint(23, 8);
pint(26, 9);
pint(27, 9);

carriage(30, 10); // step up 2 tiles onto the roof
carriage(42, 10); // 2-tile gap at 40–41
pint(33, 7);
pint(36, 7);
pint(40, 6);
pint(41, 6);
pint(46, 7);
pint(52, 8); // over the drop to Wool (gap 52–53)

// Section 2 · Middle: Wool (checkpoint 1) → embankment (cols 54–123).
platform(54, 75);
checkpoint(56, 'Wool');
sign(59, 'WOOL');
pub(64, 'black-bear');
pint(60, 9);
glass(67);
pint(67, 7);
// Secret: a crate stair under the station canopy hides the espresso martini.
crates(72, 9);
crates(73, 8);
crates(74, 6);
crates(75, 8); // also the step onto the next train
canopy(69, 76, 4, [70, 76]);
espresso(74, 5);
secret(69, 76, 3, 9);
pint(72, 8);
pint(73, 7);

carriage(76, 10);
carriage(89, 10); // 3-tile gap at 86–88
glass(93, ROOF);
carriage(101, 10); // 2-tile gap at 99–100
pint(79, 7);
pint(86, 6);
pint(87, 5);
pint(88, 6);
pint(93, 5);
pint(99, 6);
pint(100, 6);

embankment(113, 121); // 2-tile gap at 111–112
crates(114, 9);
crates(115, 8);
crates(116, 9);
pint(115, 7); // then a 5-tile run-up to the gap

// Section 3 · End: Wareham (checkpoint 2) → river → last train → the
// Conductor's train (boss) → Parkstone (cols 124–197).
platform(124, 137); // 2-tile gap at 122–123
checkpoint(126, 'Wareham');
sign(129, 'WAREHAM');
pub(133, 'old-granary');
pint(128, 9);

river(138, 140); // 3-tile river gap
easel(139);
pint(139, 7);
embankment(141, 142);
carriage(143, 9);
glass(147, ROOF);
pint(147, 5);
pint(150, 7);
pint(152, 6); // 2-tile gap at 152–153

// Lineside embankment: respawn point for the boss fight.
embankment(154, 157);
checkpoint(156, 'Boss train');
pint(155, 9);

// Boss arena: the Train Conductor's own train, two coupled carriages one
// screen long (cols 158–177). The fight is on the roof: the camera locks to
// it, walls close on both sides, and the hills race past while it's on.
carriage(158, 10);
carriage(168, 10);
zone('end-zone', 158, 177);
boss(175, 'conductor', ROOF);

// Parkstone: hop off the train and into The Avocet. The finish is the pub's
// front door (same column as the pub). Col 190 keeps it clear of the jump
// button when the camera stops at the end of the level.
platform(178, 197);
sign(182, 'PARKSTONE');
pint(181, 9);
pub(190, 'avocet');
finish(190);

// --- Write ----------------------------------------------------------------------

const tileLayer = (id, name, data) => ({
  id,
  name,
  type: 'tilelayer',
  x: 0,
  y: 0,
  width: COLS,
  height: ROWS,
  opacity: 1,
  visible: true,
  data,
});

const map = {
  type: 'map',
  version: '1.10',
  tiledversion: '1.10.2',
  orientation: 'orthogonal',
  renderorder: 'right-down',
  infinite: false,
  width: COLS,
  height: ROWS,
  tilewidth: TS,
  tileheight: TS,
  nextlayerid: 6,
  nextobjectid: nextId,
  properties: props({ title: 'The Lad Alarm Train Crawl' }),
  tilesets: [
    {
      firstgid: 1,
      name: TILESET.name,
      image: 'tiles.png', // generated at runtime under the 'tiles' texture key
      imagewidth: TILESET.count * TS,
      imageheight: TS,
      tilewidth: TS,
      tileheight: TS,
      tilecount: TILESET.count,
      columns: TILESET.count,
      margin: 0,
      spacing: 0,
    },
  ],
  layers: [
    tileLayer(1, 'background', layers.background),
    tileLayer(2, 'ground', layers.ground),
    tileLayer(3, 'foreground', layers.foreground),
    { id: 4, name: 'objects', type: 'objectgroup', draworder: 'topdown', opacity: 1, visible: true, x: 0, y: 0, objects },
    { id: 5, name: 'decor', type: 'objectgroup', draworder: 'topdown', opacity: 1, visible: true, x: 0, y: 0, objects: decor },
  ],
};

const out = resolve(dirname(fileURLToPath(import.meta.url)), '../public/assets/levels/level-01.json');
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(map) + '\n');
console.log(`wrote ${out}`);

const report = validateLevel(map);
console.log(formatReport('level-01', report));
if (report.errors.length) process.exit(1);
