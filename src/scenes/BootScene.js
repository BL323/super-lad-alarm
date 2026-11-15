import Phaser from 'phaser';
import { SCENE } from './keys.js';
import { createPlaceholderTextures } from '../art/placeholders.js';
import { registerAnimations } from '../art/animations.js';
import { LEVELS } from '../level/levels.js';
import { validateLevel, formatReport } from '../level/validateLevel.js';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super(SCENE.BOOT);
  }

  preload() {
    // Real artwork goes here, loaded under the keys in src/assets.js; any key
    // loaded here replaces its generated placeholder.
    for (const level of LEVELS) this.load.tilemapTiledJSON(level.mapKey, level.file);
  }

  create() {
    createPlaceholderTextures(this);
    registerAnimations(this);

    // Dev-only: re-check every level against the difficulty rules.
    if (import.meta.env.DEV) {
      for (const level of LEVELS) {
        const report = validateLevel(this.cache.tilemap.get(level.mapKey).data);
        if (report.errors.length) console.error(formatReport(level.id, report));
      }
    }
    this.scene.start(SCENE.MENU);
  }
}
