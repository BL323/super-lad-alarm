import Phaser from 'phaser';
import { addPixelText } from './text.js';

const STYLE = {
  height: 28,
  padX: 12,
  hitPadding: 6, // extra invisible hit area for thumbs
  radius: 5,
  fill: 0x1a1c2c,
  fillAlpha: 0.75,
  focusFill: 0x29366f,
  border: 0xffffff,
  focusBorder: 0xffcd75,
};

// A pixel-font button for touch and mouse. Fires on release while still over
// it. setFocused() shows keyboard focus.
export default class Button extends Phaser.GameObjects.Container {
  constructor(scene, x, y, label, onClick, { width = null, scale = 2 } = {}) {
    super(scene, x, y);
    this.onClick = onClick;
    this.focused = false;
    this.pressed = false;

    this.label = addPixelText(scene, 0, 0, label, { scale }).setOrigin(0.5);
    this.btnW = width ?? Math.ceil(this.label.width + STYLE.padX * 2);
    this.btnH = STYLE.height;
    this.bg = scene.add.graphics();
    this.add([this.bg, this.label]);
    this.draw();

    const pad = STYLE.hitPadding;
    this.setSize(this.btnW + pad * 2, this.btnH + pad * 2);
    this.setInteractive({ useHandCursor: true });
    this.on('pointerdown', () => {
      this.pressed = true;
      this.draw();
    });
    this.on('pointerout', () => {
      this.pressed = false;
      this.draw();
    });
    this.on('pointerup', () => {
      if (!this.pressed) return;
      this.pressed = false;
      this.draw();
      this.onClick?.();
    });
    scene.add.existing(this);
  }

  setFocused(focused) {
    this.focused = focused;
    this.draw();
    return this;
  }

  draw() {
    const { btnW: w, btnH: h } = this;
    const g = this.bg.clear();
    const hot = this.focused || this.pressed;
    g.fillStyle(hot ? STYLE.focusFill : STYLE.fill, STYLE.fillAlpha);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, STYLE.radius);
    g.lineStyle(1, hot ? STYLE.focusBorder : STYLE.border, 1);
    g.strokeRoundedRect(-w / 2 + 0.5, -h / 2 + 0.5, w - 1, h - 1, STYLE.radius);
    this.label.setTint(hot ? STYLE.focusBorder : 0xffffff);
    this.label.setY(this.pressed ? 1 : 0);
  }
}
