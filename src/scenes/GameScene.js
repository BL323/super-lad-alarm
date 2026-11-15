import Phaser from 'phaser';
import { SCENE } from './keys.js';
import { GAME_HEIGHT, TILE_SIZE, COLORS, CAMERA, DEBUG } from '../config.js';
import { TEX, TILESET } from '../assets.js';
import { addText } from '../ui/text.js';
import VirtualInput from '../systems/Input.js';
import Player from '../entities/Player.js';

// Stage 2: a short test strip of platforms for tuning player feel.
// Replaced by the Tiled level in stage 3.
const STRIP_WIDTH = 40 * TILE_SIZE; // two screens
const GROUND_TOP = GAME_HEIGHT - 2 * TILE_SIZE; // 148
const PLATFORM_BODY_HEIGHT = 6; // the placeholder plank is 6 px thick

export default class GameScene extends Phaser.Scene {
  constructor() {
    super(SCENE.GAME);
  }

  create() {
    this.cameras.main.setBackgroundColor(COLORS.background);
    this.physics.world.setBounds(0, 0, STRIP_WIDTH, GAME_HEIGHT);
    // No floor at the bottom of the world: falling out is a death.
    this.physics.world.setBoundsCollision(true, true, true, false);

    this.solids = this.physics.add.staticGroup();
    this.buildTestStrip();

    this.controls = new VirtualInput(this);
    // Spawn clear of the bottom-left touch buttons (see README "Decisions").
    this.player = new Player(this, 120, GROUND_TOP - 8, this.controls);
    this.physics.add.collider(this.player, this.solids);

    const cam = this.cameras.main;
    cam.setBounds(0, 0, STRIP_WIDTH, GAME_HEIGHT);
    cam.startFollow(this.player, true, CAMERA.lerp, CAMERA.lerp);
    cam.setDeadzone(CAMERA.deadzoneWidth, GAME_HEIGHT);

    if (DEBUG) {
      this.debugText = addText(this, 4, 4, '').setScrollFactor(0).setDepth(1000);
    }

    // HUD, pause and touch buttons run in their own scene on top of this one.
    this.scene.launch(SCENE.UI, { controls: this.controls });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.scene.stop(SCENE.UI));
  }

  update(time, delta) {
    this.controls.update();
    this.player.update(time, delta);

    if (this.debugText) {
      const b = this.player.body;
      this.debugText.setText(
        `${this.player.moveState} vx ${b.velocity.x.toFixed(0)} vy ${b.velocity.y.toFixed(0)} ` +
          `${b.blocked.down ? 'floor' : 'air'} y ${b.bottom.toFixed(1)}`,
      );
    }
  }

  // --- Test strip ---------------------------------------------------------

  addTile(col, top, frame) {
    const tile = this.solids.create(col * TILE_SIZE, top, TEX.TILES, frame).setOrigin(0);
    tile.refreshBody(); // sync the body to the top-left origin (also resets its size)
    if (frame === TILESET.tiles.platform) {
      tile.body.setSize(TILE_SIZE, PLATFORM_BODY_HEIGHT, false);
    }
    return tile;
  }

  addGround(fromCol, toCol) {
    for (let c = fromCol; c <= toCol; c++) {
      this.addTile(c, GROUND_TOP, TILESET.tiles.groundTop);
      this.addTile(c, GROUND_TOP + TILE_SIZE, TILESET.tiles.ground);
    }
  }

  label(col, top, text) {
    addText(this, col * TILE_SIZE, top, text, { color: COLORS.textDim }).setOrigin(0.5, 1);
  }

  buildTestStrip() {
    const T = TILE_SIZE;
    const { brick, platform } = TILESET.tiles;

    this.addGround(0, 13);
    this.addGround(17, 39); // 3-tile (48 px) gap at cols 14–16: the widest the level allows

    this.addTile(8, GROUND_TOP - T, brick); // 1-tile step
    this.addTile(22, GROUND_TOP - T, brick); // 2-tile step-up: the highest the level allows
    this.addTile(23, GROUND_TOP - T, brick);
    this.addTile(22, GROUND_TOP - 2 * T, brick);
    this.addTile(23, GROUND_TOP - 2 * T, brick);

    for (let c = 27; c <= 30; c++) this.addTile(c, GROUND_TOP - 2 * T, platform); // 32 px up
    for (let c = 32; c <= 35; c++) this.addTile(c, GROUND_TOP - 4 * T, platform); // another 32 px up

    this.label(10, 40, 'STAGE 2 TEST STRIP');
    this.label(15, GROUND_TOP - 4, 'gap');
    this.label(23, GROUND_TOP - 2 * T - 4, 'step');
    this.label(33.5, GROUND_TOP - 4 * T - 4, 'ledge');
  }
}
