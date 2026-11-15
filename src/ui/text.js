import { TEXT_STYLE } from '../config.js';
import { FONT } from '../assets.js';

/** Create text using the single shared text style. `overrides` may change size/colour. */
export function addText(scene, x, y, content, overrides = {}) {
  return scene.add.text(x, y, content, { ...TEXT_STYLE, ...overrides });
}

/**
 * Crisp pixel-font text (upper case, digits and a few symbols). `scale` is a
 * whole number; 2 is the readable default for the HUD on phones.
 */
export function addPixelText(scene, x, y, content, { scale = 2, tint = 0xffffff } = {}) {
  return scene.add
    .bitmapText(x, y, FONT.PIXEL, String(content).toUpperCase())
    .setScale(scale)
    .setLetterSpacing(1)
    .setTint(tint);
}
