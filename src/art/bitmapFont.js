import Phaser from 'phaser';
import { TEX, FONT } from '../assets.js';
import { drawPixelText, PIXEL_FONT_CHARS } from './pixelFont.js';

// Builds a Phaser bitmap font from the 3×5 pixel font: white glyphs with a dark
// drop shadow baked in, so text stays legible over sky and brick and can be
// recoloured with setTint() (the shadow stays dark).
export function createPixelBitmapFont(scene) {
  if (scene.cache.bitmapFont.exists(FONT.PIXEL)) return;
  const { cellWidth: w, cellHeight: h } = FONT;
  const chars = PIXEL_FONT_CHARS;
  const tex = scene.textures.createCanvas(TEX.FONT, w * chars.length, h);
  const ctx = tex.getContext();
  [...chars].forEach((ch, i) => {
    drawPixelText(ctx, ch, i * w + 1, 1, '#1a1c2c'); // shadow
    drawPixelText(ctx, ch, i * w, 0, '#ffffff');
  });
  tex.refresh();

  // Parse returns the complete cache entry ({ data, frame, texture }).
  const entry = Phaser.GameObjects.RetroFont.Parse(scene, {
    image: TEX.FONT,
    width: w,
    height: h,
    chars,
    charsPerRow: chars.length,
    spacing: { x: 0, y: 0 },
    offset: { x: 0, y: 0 },
    lineSpacing: 1,
  });
  scene.cache.bitmapFont.add(FONT.PIXEL, entry);
}
