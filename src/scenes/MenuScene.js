import Phaser from 'phaser';
import { SCENE } from './keys.js';
import { GAME_TITLE, GAME_WIDTH, GAME_HEIGHT, COLORS } from '../config.js';
import { addText, isTouchDevice } from '../ui/text.js';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super(SCENE.MENU);
  }

  create() {
    this.cameras.main.setBackgroundColor(COLORS.background);
    const cx = GAME_WIDTH / 2;

    addText(this, cx, 52, GAME_TITLE, { fontSize: '16px', color: COLORS.accent }).setOrigin(0.5);

    const start = addText(this, cx, 100, isTouchDevice() ? 'TAP TO START' : 'PRESS ENTER TO START').setOrigin(0.5);
    this.tweens.add({ targets: start, alpha: 0.3, duration: 600, yoyo: true, repeat: -1 });

    const hint = isTouchDevice() ? 'Left/right buttons to move, jump button to jump' : 'Arrows / A D to move, Space / Up to jump';
    addText(this, cx, GAME_HEIGHT - 20, hint, { color: COLORS.textDim }).setOrigin(0.5);

    const go = () => this.scene.start(SCENE.GAME);
    this.input.once('pointerup', go);
    this.input.keyboard.once('keydown-ENTER', go);
    this.input.keyboard.once('keydown-SPACE', go);
  }
}
