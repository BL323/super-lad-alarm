import Phaser from 'phaser';
import { SCENE } from './keys.js';
import { isTouchDevice } from '../systems/device.js';
import TouchControls from '../ui/TouchControls.js';
import Hud from '../ui/Hud.js';

// HUD and touch buttons. Runs on top of GameScene.
export default class UIScene extends Phaser.Scene {
  constructor() {
    super(SCENE.UI);
  }

  create(data) {
    const game = this.scene.get(SCENE.GAME);
    this.hud = data?.gameState ? new Hud(this, game, data.gameState) : null;
    this.touchControls = data?.controls && isTouchDevice() ? new TouchControls(this, data.controls) : null;

    const onComplete = () => this.touchControls?.setVisible(false);
    game.events.on('level-complete', onComplete);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => game.events.off('level-complete', onComplete));
  }

  update() {
    this.hud?.update();
    this.touchControls?.update();
  }
}
