import { TEXT_STYLE } from '../config.js';

/** Create text using the single shared text style. `overrides` may change size/colour. */
export function addText(scene, x, y, content, overrides = {}) {
  return scene.add.text(x, y, content, { ...TEXT_STYLE, ...overrides });
}
