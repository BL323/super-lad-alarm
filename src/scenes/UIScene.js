import Phaser from 'phaser';
import { SCENE } from './keys.js';
import { isTouchDevice } from '../systems/device.js';
import TouchControls from '../ui/TouchControls.js';

// HUD, pause overlay and touch buttons. Runs on top of GameScene.
// The HUD arrives in stage 4 and the pause overlay in stage 5.
export default class UIScene extends Phaser.Scene {
  constructor() {
    super(SCENE.UI);
  }

  create(data) {
    this.touchControls = null;
    if (data?.controls && isTouchDevice()) {
      this.touchControls = new TouchControls(this, data.controls);
    }
  }

  update() {
    this.touchControls?.update();
  }
}
