import Phaser from 'phaser';
import { SCENE } from './keys.js';

// HUD, pause overlay and touch buttons. Runs on top of GameScene.
// Filled in during stages 4 (HUD), 5 (pause) and 6 (touch controls).
export default class UIScene extends Phaser.Scene {
  constructor() {
    super(SCENE.UI);
  }

  create() {}
}
