import Phaser from 'phaser';
import { SCENE } from './keys.js';
import { isTouchDevice } from '../systems/device.js';
import TouchControls from '../ui/TouchControls.js';
import Hud from '../ui/Hud.js';

// HUD, pause overlay and touch buttons. Runs on top of GameScene.
// The pause overlay arrives in stage 5.
export default class UIScene extends Phaser.Scene {
  constructor() {
    super(SCENE.UI);
  }

  create(data) {
    this.hud = data?.gameState ? new Hud(this, this.scene.get(SCENE.GAME), data.gameState) : null;
    this.touchControls = null;
    if (data?.controls && isTouchDevice()) {
      this.touchControls = new TouchControls(this, data.controls);
    }
  }

  update() {
    this.touchControls?.update();
  }
}
