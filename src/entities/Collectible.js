import Phaser from 'phaser';
import { TEX, ANIM } from '../assets.js';

// Collectible type registry. Level objects carry a `type` property matching a
// key here, so a new type needs only an entry (and its art), no loader changes.
//   counts       counts towards the collected/total pint counter (each one
//                missed adds TIMING.missedPintPenaltyMs to the final time)
//   timeBonusMs  taken off the final time when collected (optional)
//   label        shown in the pickup toast for bonus items (optional)
export const collectibleTypes = {
  pint: { texture: TEX.PINT, anim: ANIM.PINT_SHINE, counts: true, sound: 'coin' },
  espresso: {
    texture: TEX.ESPRESSO,
    anim: ANIM.ESPRESSO_SHINE,
    counts: false,
    timeBonusMs: 5000,
    label: 'ESPRESSO MARTINI!',
    sound: 'coin',
  },
};

const HITBOX = { width: 10, height: 12 };

export default class Collectible extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, type) {
    const def = collectibleTypes[type];
    super(scene, x, y, def.texture, 0);
    this.type = type;
    this.def = def;
    this.collected = false;
    scene.add.existing(this);
    scene.physics.add.existing(this, true); // static: overlap only
    this.body.setSize(HITBOX.width, HITBOX.height);
    if (def.anim) {
      this.play(def.anim);
      this.anims.setProgress(Math.random()); // so neighbouring pints don't shine in sync
    }
  }

  /** Remove from play with a small pop. Returns false if already collected. */
  collect() {
    if (this.collected) return false;
    this.collected = true;
    this.body.enable = false;
    this.anims.stop();
    this.scene.tweens.add({
      targets: this,
      y: this.y - 10,
      scale: 1.6,
      alpha: 0,
      duration: 220,
      ease: 'Quad.Out',
      onComplete: () => this.destroy(),
    });
    return true;
  }
}
