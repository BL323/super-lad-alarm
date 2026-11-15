import Phaser from 'phaser';
import { SCENE } from './keys.js';
import { GAME_WIDTH, GAME_HEIGHT, TILE_SIZE, COLORS } from '../config.js';
import { TEX, TILESET, PLAYER_FRAMES, CHECKPOINT_FRAME } from '../assets.js';
import { addText } from '../ui/text.js';

// Stage 1 scaffold: shows the generated placeholder textures on a ground strip
// so pixel crispness and scaling can be checked. Player, level and pickups
// arrive in later stages.
export default class GameScene extends Phaser.Scene {
  constructor() {
    super(SCENE.GAME);
  }

  create() {
    this.cameras.main.setBackgroundColor(COLORS.background);
    const groundY = GAME_HEIGHT - TILE_SIZE * 2;

    // Ground strip: grass row on top of a dirt row.
    for (let x = 0; x < GAME_WIDTH; x += TILE_SIZE) {
      this.add.image(x, groundY, TEX.TILES, TILESET.tiles.groundTop).setOrigin(0);
      this.add.image(x, groundY + TILE_SIZE, TEX.TILES, TILESET.tiles.ground).setOrigin(0);
    }

    // A floating platform and a brick block.
    for (let i = 0; i < 4; i++) {
      this.add.image(176 + i * TILE_SIZE, groundY - 48, TEX.TILES, TILESET.tiles.platform).setOrigin(0);
    }
    this.add.image(112, groundY - TILE_SIZE, TEX.TILES, TILESET.tiles.brick).setOrigin(0);

    // Every player frame, left to right.
    const playerFrames = Object.values(PLAYER_FRAMES).flat();
    playerFrames.forEach((f, i) => {
      this.add.image(16 + i * 12, groundY, TEX.PLAYER, f).setOrigin(0, 1);
    });

    // Coins along the platform.
    for (let i = 0; i < 4; i++) {
      this.add.image(184 + i * 16, groundY - 60, TEX.COIN, i);
    }

    this.add.image(144, groundY, TEX.SPIKES).setOrigin(0, 1);
    this.add.image(250, groundY, TEX.CHECKPOINT, CHECKPOINT_FRAME.inactive).setOrigin(0, 1);
    this.add.image(266, groundY, TEX.CHECKPOINT, CHECKPOINT_FRAME.active).setOrigin(0, 1);
    this.add.image(296, groundY, TEX.FINISH).setOrigin(0, 1);

    addText(this, GAME_WIDTH / 2, 30, 'STAGE 1 SCAFFOLD', { color: COLORS.accent }).setOrigin(0.5);
    addText(this, GAME_WIDTH / 2, 42, 'placeholder textures', { color: COLORS.textDim }).setOrigin(0.5);

    // HUD and overlays run in their own scene on top of this one.
    this.scene.launch(SCENE.UI);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.scene.stop(SCENE.UI));
  }
}
