import Phaser from 'phaser';
import { GAME_WIDTH, HUD } from '../config.js';
import { TEX } from '../assets.js';
import { addPixelText } from './text.js';
import { safeAreaInGame } from './safeArea.js';

// Pint counter (collected/total) at top left, score at top right. Updates on
// the GameScene's 'pickup' event and bumps the changed number.
export default class Hud {
  constructor(scene, gameScene, gameState) {
    this.scene = scene;
    this.gameState = gameState;

    this.icon = scene.add.image(0, 0, TEX.PINT, 0).setOrigin(0, 0);
    this.coins = addPixelText(scene, 0, 0, '', { scale: HUD.textScale }).setOrigin(0, 0.5);
    this.score = addPixelText(scene, 0, 0, '', { scale: HUD.textScale }).setOrigin(1, 0.5);
    this.toast = addPixelText(scene, GAME_WIDTH / 2, 40, '', { scale: HUD.textScale, tint: 0xffcd75 })
      .setOrigin(0.5)
      .setAlpha(0);

    this.layout();
    this.refresh();

    const onPickup = ({ def }) => {
      this.refresh();
      this.bump(def.counts ? [this.coins, this.icon] : [this.score]);
      if (def.counts) this.bump([this.score]);
      if (def.label) this.showToast(`${def.label} +${def.points}`);
    };
    gameScene.events.on('pickup', onPickup);
    scene.scale.on(Phaser.Scale.Events.RESIZE, this.layout, this);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      gameScene.events.off('pickup', onPickup);
      scene.scale.off(Phaser.Scale.Events.RESIZE, this.layout, this);
    });
  }

  layout() {
    const safe = safeAreaInGame(this.scene.scale);
    const top = Math.round(safe.top + HUD.margin);
    const left = Math.round(safe.left + HUD.margin);
    const right = Math.round(GAME_WIDTH - safe.right - HUD.margin);
    this.icon.setPosition(left, top);
    const midY = top + 8; // centre of the 16 px icon
    this.coins.setPosition(left + 18, midY);
    this.score.setPosition(right, midY);
  }

  refresh() {
    const s = this.gameState;
    this.coins.setText(`${s.coins}/${s.coinsTotal}`);
    this.score.setText(`SCORE ${s.score}`);
  }

  bump(targets) {
    for (const t of targets) {
      const base = t === this.icon ? 1 : HUD.textScale;
      this.scene.tweens.killTweensOf(t);
      t.setScale(base);
      this.scene.tweens.add({ targets: t, scale: base * HUD.bumpScale, duration: HUD.bumpMs, yoyo: true, ease: 'Quad.Out' });
    }
  }

  showToast(text) {
    this.scene.tweens.killTweensOf(this.toast);
    this.toast.setText(text).setAlpha(1).setY(40);
    this.scene.tweens.add({ targets: this.toast, y: 32, alpha: 0, delay: 900, duration: 500 });
  }
}
