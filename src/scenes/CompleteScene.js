import Phaser from 'phaser';
import { SCENE } from './keys.js';
import { GAME_WIDTH, COLORS } from '../config.js';
import { addText } from '../ui/text.js';
import { isTouchDevice } from '../systems/device.js';

// Level complete screen. Score, coins, best score and the next-level hook are
// added in stage 5.
export default class CompleteScene extends Phaser.Scene {
  constructor() {
    super(SCENE.COMPLETE);
  }

  create() {
    this.cameras.main.setBackgroundColor(COLORS.background);
    const cx = GAME_WIDTH / 2;

    addText(this, cx, 60, 'LEVEL COMPLETE', { fontSize: '16px', color: COLORS.accent }).setOrigin(0.5);
    addText(this, cx, 110, isTouchDevice() ? 'TAP TO PLAY AGAIN' : 'PRESS ENTER TO PLAY AGAIN').setOrigin(0.5);

    const again = () => this.scene.start(SCENE.GAME);
    this.input.once('pointerup', again);
    this.input.keyboard.once('keydown-ENTER', again);
    this.input.keyboard.once('keydown-SPACE', again);
  }
}
