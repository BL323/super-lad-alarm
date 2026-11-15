import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PARALLAX } from '../config.js';
import { TEX, TILESET, pubTextureKey } from '../assets.js';
import { ensureSignTexture } from '../art/placeholders.js';

// Draw order for everything in the level.
export const DEPTH = {
  backdrop: -30,
  decor: -20, // pubs, station signs
  background: -10, // canopy posts, river
  ground: 0,
  props: 5, // checkpoints, finish, hazards, collectibles
  player: 10,
  foreground: 20, // station canopy (can hide secrets)
};

const prop = (obj, name) => obj.properties?.find((p) => p.name === name)?.value;
const typeOf = (obj) => obj.type || obj.class;

/**
 * Builds a level from its Tiled map: tile layers, collisions, world and camera
 * bounds, parallax backdrop, decor and hazards. Gameplay objects are returned
 * as plain data for the scene and systems to spawn.
 *
 * The map is 12 rows (192 px) and the screen 180 px, so the map is shifted up
 * by 12 px: its bottom row sits on the bottom of the screen and the top 12 px
 * of sky are cut off. All object positions are shifted the same way.
 */
export function loadLevel(scene, levelDef) {
  const map = scene.make.tilemap({ key: levelDef.mapKey });
  const tileset = map.addTilesetImage(TILESET.name, TEX.TILES);
  const offsetY = GAME_HEIGHT - map.heightInPixels;
  const width = map.widthInPixels;

  const layer = (name, depth) => map.createLayer(name, tileset, 0, offsetY)?.setDepth(depth);
  const background = layer('background', DEPTH.background);
  const ground = layer('ground', DEPTH.ground);
  const foreground = layer('foreground', DEPTH.foreground);
  ground.setCollisionByExclusion([-1]);

  scene.physics.world.setBounds(0, 0, width, GAME_HEIGHT);
  // No floor at the bottom of the world: falling out is a death.
  scene.physics.world.setBoundsCollision(true, true, true, false);
  scene.cameras.main.setBounds(0, 0, width, GAME_HEIGHT);

  // Parallax hills, fixed to the camera and scrolled by hand.
  const hills = scene.add
    .tileSprite(0, PARALLAX.hillsBottom - 64, GAME_WIDTH, 64, TEX.HILLS)
    .setOrigin(0)
    .setScrollFactor(0)
    .setDepth(DEPTH.backdrop);

  const objects = (map.getObjectLayer('objects')?.objects ?? []).map((o) => ({ ...o, y: o.y + offsetY }));
  const decor = (map.getObjectLayer('decor')?.objects ?? []).map((o) => ({ ...o, y: o.y + offsetY }));
  const ofType = (t) => objects.filter((o) => typeOf(o) === t);
  const point = (o) => ({ name: o.name, x: o.x, y: o.y });
  const rectOf = (o) => new Phaser.Geom.Rectangle(o.x, o.y, o.width, o.height);

  // Decor: pubs, station nameboards, the easel in the river.
  for (const d of decor) {
    const t = typeOf(d);
    if (t === 'pub') scene.add.image(d.x, d.y, pubTextureKey(prop(d, 'pub'))).setOrigin(0.5, 1).setDepth(DEPTH.decor);
    if (t === 'sign') scene.add.image(d.x, d.y, ensureSignTexture(scene, prop(d, 'text'))).setOrigin(0.5, 1).setDepth(DEPTH.decor);
    if (t === 'easel') {
      const easel = scene.add.image(d.x, d.y, TEX.EASEL).setOrigin(0.5, 1).setAngle(-24).setDepth(DEPTH.background - 1);
      scene.tweens.add({ targets: easel, y: d.y + 2, angle: -18, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    }
  }

  // Hazards: broken glass (small hitbox at the bottom of the tile) and water.
  const hazards = scene.physics.add.staticGroup();
  for (const h of ofType('hazard')) {
    if (prop(h, 'kind') === 'glass') {
      const img = hazards.create(h.x + h.width / 2, h.y + h.height / 2, TEX.GLASS).setDepth(DEPTH.props);
      img.body.setSize(12, 6, false).setOffset(2, 10);
    } else {
      const z = scene.add.zone(h.x, h.y, h.width, h.height).setOrigin(0);
      hazards.add(z);
      z.body.setSize(h.width, h.height, false).setOffset(0, 0);
    }
  }

  const endZoneObj = objects.find((o) => o.name === 'end-zone');
  const finishObj = ofType('finish')[0];
  const spawnObj = ofType('spawn')[0];

  return {
    map,
    layers: { background, ground, foreground },
    width,
    hills,
    hazards,
    spawn: spawnObj ? point(spawnObj) : { name: 'spawn', x: 32, y: GAME_HEIGHT - 32 },
    checkpoints: ofType('checkpoint').map(point),
    finish: finishObj ? point(finishObj) : null,
    endZone: endZoneObj ? rectOf(endZoneObj) : null,
    secrets: ofType('secret').map(rectOf),
    collectibles: ofType('collectible').map((o) => ({ x: o.x, y: o.y, type: prop(o, 'type') })),
  };
}
