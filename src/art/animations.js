import { TEX, ANIM, PLAYER_FRAMES, PINT_FRAME, ESPRESSO_FRAME } from '../assets.js';

// Every animation is defined here and referenced elsewhere by name (src/assets.js ANIM).
const DEFS = [
  { key: ANIM.PLAYER_IDLE, texture: TEX.PLAYER, frames: PLAYER_FRAMES.idle, frameRate: 2, repeat: -1 },
  { key: ANIM.PLAYER_RUN, texture: TEX.PLAYER, frames: PLAYER_FRAMES.run, frameRate: 12, repeat: -1 },
  { key: ANIM.PLAYER_JUMP, texture: TEX.PLAYER, frames: PLAYER_FRAMES.jump, frameRate: 1, repeat: 0 },
  { key: ANIM.PLAYER_FALL, texture: TEX.PLAYER, frames: PLAYER_FRAMES.fall, frameRate: 1, repeat: 0 },
  { key: ANIM.PINT_SHINE, texture: TEX.PINT, frames: [...Array(PINT_FRAME.count).keys()], frameRate: 6, repeat: -1 },
  {
    key: ANIM.ESPRESSO_SHINE,
    texture: TEX.ESPRESSO,
    frames: [...Array(ESPRESSO_FRAME.count).keys()],
    frameRate: 3,
    repeat: -1,
  },
];

export function registerAnimations(scene) {
  for (const { key, texture, frames, frameRate, repeat } of DEFS) {
    if (scene.anims.exists(key)) continue;
    scene.anims.create({
      key,
      frames: scene.anims.generateFrameNumbers(texture, { frames }),
      frameRate,
      repeat,
    });
  }
}
