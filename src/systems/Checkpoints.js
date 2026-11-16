import { GAME_HEIGHT } from '../config.js';
import { TEX, CHECKPOINT_FRAME } from '../assets.js';
import { DEPTH } from '../level/LevelLoader.js';
import Audio from './Audio.js';

// Railway-signal checkpoints. Touching one turns it green and stores it as the
// respawn point in GameState.
export default class Checkpoints {
  constructor(scene, defs, player, gameState) {
    this.scene = scene;
    this.player = player;
    this.gameState = gameState;
    this.items = defs.map((def) => {
      const sprite = scene.add
        .image(def.x, def.y, TEX.CHECKPOINT, CHECKPOINT_FRAME.inactive)
        .setOrigin(0.5, 1)
        .setDepth(DEPTH.props);
      // Full-height trigger so a checkpoint can't be jumped over.
      const trigger = scene.add.zone(def.x, GAME_HEIGHT / 2, 16, GAME_HEIGHT);
      scene.physics.add.existing(trigger, true);
      const item = { def, sprite, trigger, active: false };
      trigger.checkpoint = item;
      return item;
    });

    scene.physics.add.overlap(
      player,
      this.items.map((i) => i.trigger),
      (_p, trigger) => this.activate(trigger.checkpoint),
    );
  }

  activate(item) {
    if (item.active || this.player.dead) return;
    item.active = true;
    item.sprite.setFrame(CHECKPOINT_FRAME.active);
    Audio.play('checkpoint');
    this.scene.tweens.add({ targets: item.sprite, scaleY: 1.15, duration: 90, yoyo: true, ease: 'Quad.Out' });

    const { name, x, y } = item.def;
    this.gameState.checkpoint = { name, x, y };
    this.player.respawnPoint = { x, y: y - 8 };
    this.scene.events.emit('checkpoint', name);
  }
}
