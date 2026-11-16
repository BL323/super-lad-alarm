import Phaser from 'phaser';
import { SCENE } from './keys.js';
import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';
import { CHARACTERS, playerTextureKey, playerAnimKey } from '../assets.js';
import { addPixelText } from '../ui/text.js';
import { addBackdrop } from '../ui/backdrop.js';
import Button from '../ui/Button.js';
import { isTouchDevice } from '../systems/device.js';
import Audio from '../systems/Audio.js';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super(SCENE.MENU);
  }

  create() {
    const { groundY } = addBackdrop(this);
    const cx = GAME_WIDTH / 2;

    addPixelText(this, cx, 22, 'SUPER LAD', { scale: 4, tint: 0xffcd75 }).setOrigin(0.5, 0);
    addPixelText(this, cx, 50, 'ALARM', { scale: 4, tint: 0xffcd75 }).setOrigin(0.5, 0);

    // The lads, waiting on the platform.
    CHARACTERS.forEach((c, i) => {
      this.add
        .sprite(cx - 120 + i * 18, groundY, playerTextureKey(c.id))
        .setOrigin(0.5, 1)
        .play({ key: playerAnimKey(c.id, 'idle'), delay: i * 250 });
    });

    const start = () => {
      Audio.play('select');
      this.scene.start(SCENE.SELECT);
    };
    new Button(this, cx, 94, 'START', start, { width: 96 }).setFocused(true);
    this.input.keyboard.once('keydown-ENTER', start);
    this.input.keyboard.once('keydown-SPACE', start);

    addPixelText(this, cx, 116, 'GRAB EVERY PINT - EACH ONE MISSED COSTS 2 SECONDS', { scale: 1 }).setOrigin(0.5, 0);

    const hint = isTouchDevice()
      ? 'ARROW BUTTONS MOVE - ROUND BUTTON JUMPS'
      : 'ARROWS OR A/D MOVE - SPACE OR UP JUMP';
    addPixelText(this, cx, GAME_HEIGHT - 12, hint, { scale: 1 }).setOrigin(0.5);
  }
}
