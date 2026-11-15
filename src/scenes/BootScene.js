import Phaser from 'phaser';
import { SCENE } from './keys.js';
import { createPlaceholderTextures } from '../art/placeholders.js';
import { registerAnimations } from '../art/animations.js';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super(SCENE.BOOT);
  }

  preload() {
    // Real artwork goes here, loaded under the keys in src/assets.js; any key
    // loaded here replaces its generated placeholder.
    // Level JSON is loaded here from stage 3 onwards.
  }

  create() {
    createPlaceholderTextures(this);
    registerAnimations(this);
    this.scene.start(SCENE.MENU);
  }
}
